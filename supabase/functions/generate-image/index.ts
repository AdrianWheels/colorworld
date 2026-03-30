import { GoogleGenAI } from "npm:@google/genai";

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

  try {
    const genAI = new GoogleGenAI({ apiKey });

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-preview-05-20",
      config: { responseModalities: ["TEXT", "IMAGE"] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p: any) => p.inlineData);

    if (!imagePart) {
      console.error("[generate-image] No image in response. Parts:", JSON.stringify(parts));
      return new Response(
        JSON.stringify({ error: "Gemini did not return an image" }),
        { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        imageData: imagePart.inlineData.data,
        mimeType: imagePart.inlineData.mimeType || "image/png",
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
