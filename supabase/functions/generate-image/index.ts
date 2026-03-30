import { GoogleGenAI } from "npm:@google/genai";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Rate limiting — daily cap per user (in-memory, resets on isolate recycle)
// 5/day @ $0.02/img (Imagen 4 Fast) = max $3/user/month vs €4.99 revenue
const rateLimitMap = new Map<string, { count: number; resetDate: string }>();
const MAX_GENERATIONS_PER_DAY = 5;

// Coloring book prompt template — Imagen 4 needs explicit English instructions
const COLORING_TEMPLATE = (subject: string) =>
  `Coloring book page for children: ${subject}. Black outlines on white background, thick clean lines, no color, no shading, no gray, cartoon style, simple shapes, large areas to color. Do not include any text or words.`;

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://coloreveryday.vercel.app",
];

function corsHeaders(origin: string) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") ?? "";
  const headers = corsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  // --- Auth verification ---
  const jwt = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!jwt) {
    return new Response(JSON.stringify({ error: "Authorization required" }), {
      status: 401,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(jwt);
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
      status: 401,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  // --- PRO check ---
  const isPro = user.app_metadata?.is_pro === true;
  if (!isPro) {
    return new Response(JSON.stringify({ error: "PRO subscription required" }), {
      status: 403,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  // --- Rate limiting (daily cap per user) ---
  const today = new Date().toISOString().split("T")[0];
  const userLimit = rateLimitMap.get(user.id);
  if (userLimit && userLimit.resetDate === today) {
    if (userLimit.count >= MAX_GENERATIONS_PER_DAY) {
      return new Response(JSON.stringify({ error: "Daily limit reached. Try again tomorrow.", limit: MAX_GENERATIONS_PER_DAY }), {
        status: 429,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }
    userLimit.count++;
  } else {
    rateLimitMap.set(user.id, { count: 1, resetDate: today });
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
      { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
    );
  }

  const { prompt } = await req.json();
  if (!prompt || typeof prompt !== "string") {
    return new Response(
      JSON.stringify({ error: "prompt (string) is required" }),
      { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
    );
  }

  // --- Prompt length validation ---
  if (prompt.length > 500) {
    return new Response(JSON.stringify({ error: "Prompt too long (max 500 chars)" }), {
      status: 400,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  try {
    const genAI = new GoogleGenAI({ apiKey });

    // Step 1: Translate user prompt to English via Gemini Flash (text-only, ~$0.0001)
    const translateResponse = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [{ text: `Translate the following to English. Return ONLY the translated text, nothing else. If already in English, return as-is.\n\n${prompt}` }],
      }],
    });
    const translatedSubject = translateResponse.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || prompt;

    // Step 2: Generate image with Imagen 4 Fast ($0.02/img vs $0.039 Gemini)
    const imageResponse = await genAI.models.generateImages({
      model: "imagen-4.0-fast-generate-001",
      prompt: COLORING_TEMPLATE(translatedSubject),
      config: { numberOfImages: 1, aspectRatio: "1:1" },
    });

    const generatedImage = imageResponse.generatedImages?.[0];
    if (!generatedImage) {
      console.error("[generate-image] No image returned from Imagen 4");
      return new Response(
        JSON.stringify({ error: "Image generation failed" }),
        { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        imageData: generatedImage.image.imageBytes,
        mimeType: "image/png",
      }),
      { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[generate-image] Error:", error);
    const status = error.status === 429 || error.code === 429 ? 429 : 500;
    return new Response(
      JSON.stringify({ error: error.message || "Generation failed" }),
      { status, headers: { ...headers, "Content-Type": "application/json" } }
    );
  }
});
