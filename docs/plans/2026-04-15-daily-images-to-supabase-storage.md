# Migración de imágenes diarias a Supabase Storage

## Contexto

El proyecto genera una imagen diaria (líneas negras de Gemini) vía GitHub Action y la commitea a `public/generated-images/YYYY-MM/` dentro del repo. Esto tiene dos problemas:

1. **BD de Supabase se pausa tras 7 días sin actividad** en el plan free. Hay un workflow `supabase-keepalive.yml` que pinguea cada 3 días, pero falló durante ~12 días de inactividad del usuario y la BD se pausó el 14-abr-2026 (reactivada manualmente hoy).
2. **El repo crece ~500 KB al día** de PNGs versionados, lo que infla el tamaño del repo sin beneficio (las imágenes no cambian una vez generadas).

**Solución:** mover la generación diaria a un bucket público de Supabase Storage + tabla `daily_images`. La escritura diaria en Supabase cuenta como actividad → elimina la necesidad del keepalive. El repo deja de crecer.

**Alcance:** *solo* la imagen base del día. NO toca `public.drawings` (dibujos coloreados por usuario — eso es del plan de auth) ni `public.images` (cache de generación por concepto — otro sistema).

**Outcome esperado:** workflow diario sube PNG a Supabase + inserta fila en `daily_images`. Frontend lee desde ahí. `supabase-keepalive.yml` eliminado. Histórico (186 imágenes, sep-2025 → abr-2026, ~7 meses) migrado al bucket.

---

## Estado actual verificado

| Elemento | Estado |
|---|---|
| `@supabase/supabase-js` en `package.json` | ✅ v2.97.0 |
| `src/services/supabaseClient.js` | ✅ Existe (del plan de auth) |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` en `.env.local` | ✅ |
| Tabla `public.images` | ⚠️ Existe pero es otro caso (concepts/phrase cache) — NO reutilizar |
| Bucket `daily-images` | ❌ No existe |
| Tabla `daily_images` | ❌ No existe |
| Secret `SUPABASE_SERVICE_ROLE_KEY` en GitHub Actions | ❌ Falta |
| BD activa | ✅ Reactivada hoy (15-abr-2026) |

---

## Archivos críticos

**Backend/scripts:**
- `scripts/generate-daily-image.js` (311 líneas) — genera y escribe PNG + JSON a disco
- `scripts/update-images-index.js` (145 líneas) — escanea FS y escribe `images-index.json`
- `scripts/generate-sitemap.js` (98 líneas) — lee `images-index.json` → `sitemap.xml`
- `.github/workflows/daily-image-generation.yml` — cron diario 01:00 UTC
- `.github/workflows/regenerate-day.yml` — manual; backup a `discard/` + regenera
- `.github/workflows/update-images-index.yml` — manual
- `.github/workflows/supabase-keepalive.yml` — **se eliminará**

**Frontend (3 puntos de consumo identificados):**
- `src/services/staticImageService.js:6-7` — `baseImagePath = '/generated-images'`, `indexUrl = '/generated-images/images-index.json'` — **núcleo de la resolución**
- `src/services/drawingService.js:12` — `generatedImagesPath = '/generated-images/'`
- `src/components/StructuredData.jsx:66` — URL hardcodeada a Vercel path para schema.org
- `src/components/DrawingCalendar.jsx:34` — usa `staticImageService.loadImagesIndex()`
- `src/App.jsx:290` — `staticImageService.forceReloadIndex()`

**Nuevo:**
- `scripts/lib/supabase-admin.js` — cliente con service_role para scripts
- `scripts/migrate-images-to-supabase.js` — migración one-shot del histórico
- `src/services/dailyImageService.js` (opcional — o refactor del `staticImageService`)

---

## Diseño

### Tabla `daily_images` (nueva)

```sql
CREATE TABLE public.daily_images (
  date_key      date PRIMARY KEY,
  file_name     text NOT NULL,
  storage_path  text NOT NULL UNIQUE,     -- '2026-04/2026-04-15_MandalaFlores_1775007569128.png'
  public_url    text NOT NULL,
  tematica      text,
  difficulty    text,
  prompt        text,
  day_of_year   integer,
  file_size     bigint,
  source        text DEFAULT 'github-action',
  generated_at  timestamptz NOT NULL DEFAULT now(),
  metadata      jsonb DEFAULT '{}'::jsonb   -- futuro-proof
);
-- RLS: SELECT público anon; INSERT/UPDATE solo service_role (bypass RLS).
```

Mapeo campo-a-campo con el JSON actual (confirmado en `2026-04-01_MandalaFlores_1775007569128.json`):

| JSON (disk) | Columna BD |
|---|---|
| `fileName` | `file_name` |
| `dateKey` | `date_key` |
| `prompt` | `prompt` |
| `tematica` | `tematica` |
| `difficulty` | `difficulty` |
| `dayOfYear` | `day_of_year` |
| `savedAt` | `generated_at` |
| `fileSize` | `file_size` |
| `source` | `source` |

### Bucket `daily-images`

- Público (lectura anónima).
- Path: `YYYY-MM/{fileName}.png` (mantener nomenclatura actual para que la migración sea 1:1).
- `cacheControl: '31536000'` al subir (CDN caché 1 año — las imágenes son inmutables).

### Estrategia de cutover

Dual-write durante la transición:

1. **Tasks 1-4**: crear infra + adaptar script para subir a Supabase **manteniendo** la escritura a disco. Frontend lee de Supabase con fallback al path estático si no hay fila. Las nuevas imágenes aparecen en ambos sitios → seguro de testear.
2. **Task 5**: migrar las 186 imágenes históricas al bucket/tabla.
3. **Task 6**: quitar fallback, eliminar escritura a disco, borrar `generated-images/`, borrar keepalive.

**Distribución por mes (verificada en disco):** 2025-09: 2, 2025-10: 31, 2025-11: 30, 2025-12: 31, 2026-01: 31, 2026-02: 27, 2026-03: 31, 2026-04: 3. Total: 186.

---

## Tasks

### Task 0 — Precondiciones manuales
- **Step 1**: Ya hecho — BD reactivada hoy.
- **Step 2**: Obtener `service_role` key de Supabase Dashboard → Settings → API.
- **Step 3**: En GitHub → repo Settings → Secrets → añadir `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.

### Task 1 — Tabla + bucket + RLS
- `mcp__supabase__apply_migration`: crear tabla `daily_images` con el schema de arriba + policy SELECT pública.
- `mcp__supabase__execute_sql`: `INSERT INTO storage.buckets` + policy `SELECT USING (bucket_id = 'daily-images')`.
- Verificar con `SELECT * FROM daily_images LIMIT 1` y `SELECT id, public FROM storage.buckets WHERE id='daily-images'`.

### Task 2 — Helper service_role + adaptar `generate-daily-image.js`
- Crear `scripts/lib/supabase-admin.js` con cliente usando `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (vars de entorno, no de Vite).
- En `generate-daily-image.js`: tras obtener el `imageData` (buffer), **antes** del `fs.writeFileSync` existente, añadir:
  - Upload al bucket: `supabaseAdmin.storage.from('daily-images').upload(storagePath, buffer, {contentType: 'image/png', upsert: true, cacheControl: '31536000'})`.
  - `getPublicUrl()` para la URL.
  - `upsert` en `daily_images` con todos los campos (mapeo de la tabla anterior), `onConflict: 'date_key'`.
  - Si cualquiera falla: `console.error` + `process.exit(1)` (NO borrar la escritura a disco — sigue siendo nuestro fallback).
- **Mantener** la escritura a disco y el JSON local tal cual por ahora.
- Prueba local con `--date 2099-01-01` + env vars. Limpiar fila/objeto tras verificar.

### Task 3 — Workflow diario pasa credenciales Supabase
- En `.github/workflows/daily-image-generation.yml`, step "Generate today's image": añadir `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` a `env:`.
- Lo mismo en `regenerate-day.yml` (mismo step).
- Disparar workflow manualmente desde GitHub Actions → verificar que la imagen del día aparece **tanto** en el bucket + tabla **como** en el commit al repo.

### Task 4 — Frontend lee de Supabase (con fallback)
- En `src/services/staticImageService.js`, reescribir `getImageForDate(dateKey)`:
  1. Primer intento: `supabase.from('daily_images').select('*').eq('date_key', dateKey).maybeSingle()`. Si hay fila, devolver `{ url: row.public_url, fileName: row.file_name, dateKey, theme: row.tematica, source: 'supabase' }`.
  2. Fallback: comportamiento actual (fetch del `images-index.json` estático). Para no romper histórico no-migrado aún.
- En `loadImagesIndex()` (usado por `DrawingCalendar.jsx`): añadir nueva función `loadAllDailyImages()` que haga `.from('daily_images').select().order('date_key', {ascending: false}).limit(500)`. Convertir el resultado al shape esperado por `DrawingCalendar` (`{ images: { 'YYYY-MM-DD': [...] }, daysByMonth, ... }`) para no tocar el calendario.
- `StructuredData.jsx:66`: cambiar URL hardcodeada de Vercel a `row.public_url` (requiere pasar la URL como prop desde donde se monte, o hacer la query ahí).
- `drawingService.js:12`: verificar uso; si solo es informativo, mantener; si construye paths, migrar al mismo patrón.
- Verificar en `npm run dev`: día de hoy carga de Supabase, días antiguos no-migrados caen al fallback, cero 404s.

### Task 5 — Migración del histórico (one-shot)
- `scripts/migrate-images-to-supabase.js`:
  - Recorrer `public/generated-images/*/` (meses).
  - Para cada par `.png`/`.json`: leer JSON, subir PNG al bucket, hacer `upsert` en `daily_images` con los campos del JSON.
  - Skip si ya existe `date_key` en la tabla (permite re-ejecutar).
  - Log por mes con contador de éxitos/fallos.
- Ejecutar local con env vars. Verificar `SELECT COUNT(*) FROM daily_images` ≈ total de PNGs.
- Spot-check: 3-5 fechas al azar → abrir `public_url` en navegador.

### Task 6 — Limpieza
- `staticImageService.js`: eliminar fallback al path estático.
- `generate-daily-image.js`: quitar `writeFileSync` del PNG y del JSON local.
- `update-images-index.js`: reescribir para leer de `daily_images` y seguir generando `images-index.json` (SEO + sitemap aún lo necesita) **o** eliminar y adaptar `generate-sitemap.js` para leer directo de BD.
- `generate-sitemap.js`: adaptar al nuevo flujo (BD o índice regenerado).
- `.github/workflows/daily-image-generation.yml`: quitar `git add public/generated-images/` del step de commit. Mantener sitemap/prompts en git.
- `.github/workflows/regenerate-day.yml`: adaptar "backup a discard/" → versionado en Storage (o `DELETE` + `INSERT` con nuevo path si no necesitas el viejo).
- Esperar 3-7 días con todo funcionando → `git rm -r public/generated-images`.
- `git rm .github/workflows/supabase-keepalive.yml`.

---

## Verificación end-to-end

**Tras Task 4 (antes de migrar histórico):**
- `npm run dev` → abrir día de hoy → Network tab: imagen viene de `enwrbnhlvbjnbxgxghev.supabase.co/storage/v1/object/public/daily-images/...`.
- Abrir día antiguo → sigue cargando de `/generated-images/` (fallback).
- `DrawingCalendar` muestra todos los meses correctamente.

**Tras Task 5:**
- `mcp__supabase__execute_sql`: `SELECT COUNT(*) FROM daily_images` = 186 (o muy cercano — si el script encuentra duplicados por regeneración, el `onConflict: date_key` los fusiona).
- `ls public/generated-images/*/ | wc -l` vs count BD → deben coincidir.
- 5 URLs al azar abren en navegador y muestran la imagen.

**Tras Task 6:**
- Workflow diario corre 1 ciclo completo → fila nueva en BD, PNG en bucket, commit solo toca `sitemap.xml` / `daily-prompts.js`.
- Network: cero peticiones a `/generated-images/...`.
- `.github/workflows/supabase-keepalive.yml` eliminado.
- `mcp__supabase__get_advisors {type: "security"}` sin warnings nuevos relacionados con `daily_images` o `storage.objects`.

**Prevención de pausa (objetivo original del plan):**
- La escritura diaria al bucket + tabla basta como actividad. El keepalive ya no es necesario.
- Si el workflow diario falla 7 días seguidos, la BD se volvería a pausar — mitigar con monitorización en GitHub Actions (notificación al usuario ante fallo, fuera del alcance de este plan).

---

## Consideraciones y riesgos

- **Storage:** free tier = 1 GB. 186 imágenes × ~1.5 MB (promedio observado en `fileSize` de JSON: 1.48 MB) ≈ 280 MB. Holgado. Crecerá ~45 MB/mes.
- **Bandwidth:** free tier = 2 GB/mes. Una carga completa del calendario (186 imágenes × 1.5 MB) = 280 MB → ~7 cargas completas por mes antes de exceder. Vigilar si el calendario se abre mucho; considerar lazy-load / thumbnails.
- **Cache:** `cacheControl: 31536000` + URL inmutable por timestamp → CDN Supabase sirve con caché agresivo. Primer hit puede ser ~300ms; subsiguientes <50ms.
- **Seguridad:** `service_role` key SOLO en GitHub Secrets. Nunca en frontend, `.env.local`, ni commit.
- **Rollback:** mantener `public/generated-images/` en repo hasta Task 6 final. Si algo rompe, revertir `staticImageService.js` (commit atómico) restaura el sistema antiguo.
- **regenerate-day.yml:** la lógica de "backup a `discard/`" pierde sentido si no commiteamos imágenes. Alternativas: (a) versionar en Storage con path `discard/YYYY-MM/old-file.png`, (b) simple `DELETE` + re-upload ya que `upsert: true`. Recomiendo (b) — simplifica.
- **SEO:** `StructuredData.jsx` actualmente emite URL absoluta de Vercel. Si cambiamos a URL de Supabase, Google re-indexará bajo el nuevo dominio. No es grave pero se perderá señal acumulada del dominio anterior durante el re-crawl. Aceptable.
