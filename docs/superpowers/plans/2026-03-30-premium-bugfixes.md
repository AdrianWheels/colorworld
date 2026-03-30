# Premium Flow Bugfixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all bugs blocking the premium flow so ColorEveryday can launch on Reddit with confidence: isDirty false positive, race condition on day switching, canvas corruption after failed generation, stale footer theme, migrate image generation to Supabase Edge Functions, and remove `overflow: hidden` from `.app`.

**Architecture:** Six independent fixes, each touching a small surface area. The isDirty fix adds a `userHasDrawn` ref to DrawingCanvasSimple. The race condition fix adds a `currentDateRef` to guard stale async callbacks. The Supabase Edge Function replaces the Vercel `/api/generate-image` endpoint. All fixes are backward-compatible.

**Tech Stack:** React 19, Vite 6, Supabase (Edge Functions + existing DB), Google Gemini 2.5 Flash, Framer Motion.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/DrawingCanvasSimple.jsx` | Modify | Add `userHasDrawn` ref, guard `loadColorLayer`/`loadBackgroundImage` with date check, update `hasDrawingContent` |
| `src/hooks/useDayNavigation.js` | Modify | Pass `selectedDate` into `checkAndNavigate`, add "save and change" flow |
| `src/App.jsx` | Modify | Fix `todayTheme` to react to `selectedDate`, restore canvas on failed generation, pass date to canvas methods |
| `src/App.css` | Modify | Remove `overflow: hidden` from `.app`, change ProPromptBar from `position: fixed` to normal flow |
| `src/services/drawingService.js` | Modify | Point `generateImageWithGemini` at Supabase Edge Function URL |
| `supabase/functions/generate-image/index.ts` | Create | Supabase Edge Function wrapping Gemini API |

---

### Task 1: Fix isDirty false positive — `userHasDrawn` ref

**Files:**
- Modify: `src/components/DrawingCanvasSimple.jsx` (lines 27-30, 556-591, 594-673, 1398-1419, 1426-1439, 1441-1455)

- [ ] **Step 1: Add `userHasDrawn` ref and reset logic**

In `DrawingCanvasSimple.jsx`, add a ref near the other refs (around line 40 area, near existing refs like `hasDrawnInCurrentStroke`):

```jsx
const userHasDrawn = useRef(false);
```

- [ ] **Step 2: Set `userHasDrawn = true` when user actually draws**

In `startDrawing` (line 594), after `setIsDrawing(true)` (line 668), add:

```jsx
userHasDrawn.current = true;
```

Also in the bucket fill success block (line 655-663), inside the `if (success)` block, add before the setTimeout:

```jsx
userHasDrawn.current = true;
```

- [ ] **Step 3: Update `hasDrawingContent` to check `userHasDrawn`**

Replace the current `hasDrawingContent` (lines 1398-1419) with:

```jsx
const hasDrawingContent = useCallback(() => {
  if (!userHasDrawn.current) return false;
  if (!drawingCanvasRef.current) return false;

  try {
    const ctx = drawingCanvasRef.current.getContext('2d');
    const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const data = imageData.data;

    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0) return true;
    }
    return false;
  } catch (error) {
    Logger.error('Error checking canvas content:', error);
    return false;
  }
}, []);
```

- [ ] **Step 4: Reset `userHasDrawn` in `clearCanvas`**

In `clearCanvas` (line 1246-1260), add after `ctx.clearRect(...)`:

```jsx
userHasDrawn.current = false;
```

- [ ] **Step 5: Reset `userHasDrawn` in `loadColorLayer`**

In `loadColorLayer` (line 1426-1439), add at the start of the function body, before the Image creation:

```jsx
userHasDrawn.current = false;
```

- [ ] **Step 6: Expose `resetUserHasDrawn` via useImperativeHandle**

Add a new method to the imperative handle (line 1441):

```jsx
resetUserHasDrawn: () => { userHasDrawn.current = false; },
```

And add `resetUserHasDrawn` to the dependency array of `useImperativeHandle`.

- [ ] **Step 7: Verify — test manually**

Run dev server:
```bash
cd D:/Proyectos/ColorEveryday/colorworld && npm run dev
```

Test flow:
1. Log in, navigate to a day with a saved drawing
2. Verify the undo button activates (layer loaded from DB)
3. Click "Anterior" — should navigate WITHOUT showing the confirmation popup
4. Draw something on a day, then navigate — popup SHOULD appear
5. Use bucket fill on a day, then navigate — popup SHOULD appear

- [ ] **Step 8: Commit**

```bash
cd D:/Proyectos/ColorEveryday/colorworld
git add src/components/DrawingCanvasSimple.jsx
git commit -m "fix: isDirty false positive — only show save popup when user actually drew"
```

---

### Task 2: Fix race condition on fast day switching

**Files:**
- Modify: `src/components/DrawingCanvasSimple.jsx` (lines 1287-1361, 1426-1439, 1441-1455)

- [ ] **Step 1: Add `loadEpoch` ref for stale callback detection**

Near the other refs in DrawingCanvasSimple.jsx (same area as Task 1):

```jsx
const loadEpoch = useRef(0);
```

- [ ] **Step 2: Guard `loadBackgroundImage` with epoch check**

Replace `loadBackgroundImage` (lines 1287-1361) with:

```jsx
const loadBackgroundImage = useCallback((newImageUrl) => {
  Logger.log('🖼️ Cargando nueva imagen de fondo:', newImageUrl);

  if (!backgroundCanvasRef.current) return;

  const thisEpoch = ++loadEpoch.current;

  const bgCtx = backgroundCanvasRef.current.getContext('2d', { willReadFrequently: true });
  const img = new Image();

  img.onload = () => {
    if (loadEpoch.current !== thisEpoch) {
      Logger.log('⏭️ Descartando imagen obsoleta (epoch cambió)');
      return;
    }

    Logger.log('📏 Nueva imagen cargada, procesando para 1024x1024');

    bgCtx.clearRect(0, 0, 1024, 1024);

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    tempCanvas.width = 1024;
    tempCanvas.height = 1024;

    tempCtx.drawImage(img, 0, 0, 1024, 1024);

    const imageData = tempCtx.getImageData(0, 0, 1024, 1024);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const brightness = (r + g + b) / 3;
      if (brightness > 240) {
        data[i + 3] = 0;
      } else if (brightness < 100) {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 255;
      } else {
        const alpha = Math.max(0, 255 - brightness);
        data[i + 3] = alpha;
      }
    }

    tempCtx.putImageData(imageData, 0, 0);
    bgCtx.drawImage(tempCanvas, 0, 0);
    requestCompositeUpdate();

    Logger.log('✅ Nueva imagen de fondo cargada');
  };

  img.onerror = (error) => {
    if (loadEpoch.current !== thisEpoch) return;
    Logger.error('❌ Error cargando la nueva imagen de fondo');
    Logger.error('🔍 URL que falló:', newImageUrl);
  };

  if (newImageUrl.startsWith('http') && !newImageUrl.includes(window.location.hostname)) {
    img.crossOrigin = 'anonymous';
  }

  img.src = newImageUrl;
}, [requestCompositeUpdate]);
```

- [ ] **Step 3: Guard `loadColorLayer` with same epoch check**

Replace `loadColorLayer` (lines 1426-1439) with:

```jsx
const loadColorLayer = useCallback((url) => {
  if (!drawingCanvasRef.current) return;

  const thisEpoch = loadEpoch.current;
  userHasDrawn.current = false;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    if (loadEpoch.current !== thisEpoch) {
      Logger.log('⏭️ Descartando color layer obsoleto (epoch cambió)');
      return;
    }
    const ctx = drawingCanvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
    ctx.drawImage(img, 0, 0);
    updateImmediately();
    saveCanvasState();
  };
  img.onerror = () => Logger.error('❌ Error cargando color layer:', url);
  img.src = url;
}, [updateImmediately, saveCanvasState]);
```

Note: `loadBackgroundImage` increments `loadEpoch`, and `loadColorLayer` reads the current value. Since background always loads first (triggered by `loadDayImage`), a new day change will bump the epoch before any color layer loads. If a stale color layer callback fires after a new background started loading, the epoch won't match.

- [ ] **Step 4: Verify — test manually**

Test flow:
1. Navigate to a day with a saved colored drawing
2. Click "Anterior" rapidly 5+ times
3. Verify the final day displayed shows the correct background image with NO color bleed from previous days
4. Check console for "Descartando imagen obsoleta" messages

- [ ] **Step 5: Commit**

```bash
cd D:/Proyectos/ColorEveryday/colorworld
git add src/components/DrawingCanvasSimple.jsx
git commit -m "fix: race condition — discard stale image loads on fast day switching"
```

---

### Task 3: Fix canvas corruption after failed generation

**Files:**
- Modify: `src/App.jsx` (lines 123-136)

- [ ] **Step 1: Save and restore canvas state on generation failure**

Replace `handleGenerateCustom` (lines 123-136) with:

```jsx
const handleGenerateCustom = async (userPrompt) => {
  setIsGeneratingCustom(true);

  // Snapshot current background before generation attempt
  const bgCanvas = canvasRef.current?.getCanvas?.();
  let snapshotDataUrl = null;
  if (bgCanvas) {
    snapshotDataUrl = bgCanvas.toDataURL('image/png');
  }

  try {
    const result = await drawingService.generateCustomDrawing(userPrompt);
    if (result?.imageUrl) {
      await canvasRef.current.loadBackgroundImage(result.imageUrl);
      canvasRef.current.clearCanvas();
    }
  } catch (err) {
    Logger.error('Error generando custom drawing:', err);
    // Restore previous background if generation failed
    if (snapshotDataUrl && canvasRef.current?.loadBackgroundImage) {
      Logger.log('🔄 Restaurando imagen anterior tras fallo de generación');
      await canvasRef.current.loadBackgroundImage(snapshotDataUrl);
    }
    showError(t('app.proPrompt.error', 'Error al generar la imagen. Inténtalo de nuevo.'));
  } finally {
    setIsGeneratingCustom(false);
  }
};
```

Note: `getCanvas()` returns the composite canvas. We snapshot it as a data URL, then if generation fails, we reload that snapshot as the background.

- [ ] **Step 2: Verify — test manually**

Test flow:
1. Activate ProPromptBar (click ✨)
2. Type a prompt and click "Generar dibujo"
3. If it fails (500 on free Vercel tier), verify the original image is restored
4. Verify a toast error message appears

- [ ] **Step 3: Commit**

```bash
cd D:/Proyectos/ColorEveryday/colorworld
git add src/App.jsx
git commit -m "fix: restore canvas state when custom image generation fails"
```

---

### Task 4: Fix footer-toggle stale theme name

**Files:**
- Modify: `src/App.jsx` (lines 220-225)

- [ ] **Step 1: Make `todayTheme` reactive to `selectedDate`**

Replace the `todayTheme` effect (lines 221-225) with:

```jsx
useEffect(() => {
  const prompt = promptsManager.getPromptForDate(selectedDate);
  setTodayTheme(prompt.tematica || 'something magical');
}, [selectedDate]);
```

This changes the dependency from `[]` (run once) to `[selectedDate]` (run on every date change), and uses `getPromptForDate(selectedDate)` instead of `getPromptForToday()`.

- [ ] **Step 2: Verify — test manually**

Test flow:
1. Load the app — footer shows today's theme
2. Click "Anterior" — footer should update to yesterday's theme
3. Click "Siguiente" to come back — footer should show today's theme again

- [ ] **Step 3: Commit**

```bash
cd D:/Proyectos/ColorEveryday/colorworld
git add src/App.jsx
git commit -m "fix: footer theme name updates when navigating between days"
```

---

### Task 5: Migrate image generation to Supabase Edge Function

**Files:**
- Create: `supabase/functions/generate-image/index.ts`
- Modify: `src/services/drawingService.js` (lines 85-89)

- [ ] **Step 1: Initialize Supabase functions directory**

```bash
cd D:/Proyectos/ColorEveryday/colorworld
npx supabase init --workdir . 2>/dev/null || true
mkdir -p supabase/functions/generate-image
```

If `supabase/config.toml` already exists, skip the init.

- [ ] **Step 2: Create the Edge Function**

Create `supabase/functions/generate-image/index.ts`:

```typescript
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
```

- [ ] **Step 3: Set the GEMINI_API_KEY secret in Supabase**

```bash
cd D:/Proyectos/ColorEveryday/colorworld
npx supabase secrets set GEMINI_API_KEY=<your-key-from-.env.local> --project-ref enwrbnhlvbjnbxgxghev
```

The user must run this manually with their actual key.

- [ ] **Step 4: Deploy the Edge Function**

```bash
cd D:/Proyectos/ColorEveryday/colorworld
npx supabase functions deploy generate-image --project-ref enwrbnhlvbjnbxgxghev --no-verify-jwt
```

`--no-verify-jwt` because this endpoint is called from the browser without a Supabase auth token (same as the current Vercel function).

- [ ] **Step 5: Update `drawingService.js` to call Supabase**

In `src/services/drawingService.js`, replace the fetch call (lines 85-89):

```js
// Old:
const response = await fetch('/api/generate-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: enhancedPrompt }),
});

// New:
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const response = await fetch(`${supabaseUrl}/functions/v1/generate-image`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: enhancedPrompt }),
});
```

- [ ] **Step 6: Verify — test locally and in production**

Test locally:
```bash
cd D:/Proyectos/ColorEveryday/colorworld && npm run dev
```

1. Log in as PRO, activate ProPromptBar
2. Type "un castillo medieval" and click "Generar dibujo"
3. Verify the image generates successfully (no 500 error)
4. Check the network tab — request should go to `enwrbnhlvbjnbxgxghev.supabase.co/functions/v1/generate-image`

- [ ] **Step 7: Commit**

```bash
cd D:/Proyectos/ColorEveryday/colorworld
git add supabase/functions/generate-image/index.ts src/services/drawingService.js
git commit -m "feat: migrate image generation to Supabase Edge Function (bypass Vercel free tier timeout)"
```

---

### Task 6: Remove `overflow: hidden` from `.app` and fix ProPromptBar positioning

**Files:**
- Modify: `src/App.css` (lines 72-79, 411-425)

- [ ] **Step 1: Remove `overflow: hidden` from `.app`**

In `src/App.css`, replace lines 72-79:

```css
/* Old: */
.app {
  height: 100vh;
  /* Altura fija, sin scroll */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* Restaurado */
}

/* New: */
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
```

- [ ] **Step 2: Change ProPromptBar from `position: fixed` to normal flow**

Replace `.pro-prompt-bar` (lines 411-425):

```css
/* Old: */
.pro-prompt-bar {
  position: fixed;
  bottom: 38px;
  left: 0;
  right: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #ffffff;
  border-top: 2px solid #e5e7eb;
  padding: 0.5rem 1.5rem;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

/* New: */
.pro-prompt-bar {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #ffffff;
  border-top: 2px solid #e5e7eb;
  padding: 0.5rem 1.5rem;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  flex-shrink: 0;
}
```

This removes `position: fixed`, `bottom`, `z-index`, and adds `flex-shrink: 0` so it doesn't collapse. Since it's already inside `.canvas-and-tools` in the JSX (App.jsx line 375), it will naturally sit between the toolbar and the canvas.

- [ ] **Step 3: Verify — test all viewports**

Test flow:
1. Desktop (1280x900): verify canvas doesn't overflow, no unwanted scrollbar, ProPromptBar sits between toolbar and canvas
2. Mobile (390x844): verify same layout, no scroll issues
3. Toggle ProPromptBar on/off — verify canvas adjusts smoothly
4. Open footer — verify no clipping

- [ ] **Step 4: Commit**

```bash
cd D:/Proyectos/ColorEveryday/colorworld
git add src/App.css
git commit -m "fix: remove overflow:hidden from .app, make ProPromptBar flow naturally in layout"
```

---

## Execution Order

Tasks 1-4 and 6 are independent of each other — they can be parallelized.
Task 5 (Supabase Edge Function) requires the user to set the GEMINI_API_KEY secret manually.

Recommended order: **Task 6 → Task 1 → Task 2 → Task 4 → Task 3 → Task 5**

Task 6 first because removing `overflow: hidden` is a layout change that's easiest to verify early. Tasks 1+2 both touch `DrawingCanvasSimple.jsx` so they should run sequentially (not in parallel). Task 5 last because it requires deployment.
