import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Local dev plugin that mimics the Vercel serverless function
 * at /api/pinterest-image, proxying Pinterest CDN images with CORS headers.
 */
function pinterestImageProxy() {
  return {
    name: 'pinterest-image-proxy',
    configureServer(server) {
      server.middlewares.use('/api/pinterest-image', async (req, res) => {
        const url = new URL(req.url, 'http://localhost');
        const imageUrl = url.searchParams.get('url');

        if (!imageUrl) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Missing "url" query parameter' }));
          return;
        }

        try {
          const parsed = new URL(imageUrl);
          if (parsed.hostname !== 'i.pinimg.com') {
            res.statusCode = 403;
            res.end(JSON.stringify({ error: 'Only i.pinimg.com URLs allowed' }));
            return;
          }
        } catch {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Invalid URL' }));
          return;
        }

        try {
          const response = await fetch(imageUrl);
          if (!response.ok) {
            res.statusCode = response.status;
            res.end(JSON.stringify({ error: `Pinterest returned ${response.status}` }));
            return;
          }

          const contentType = response.headers.get('content-type') || 'image/jpeg';
          const buffer = Buffer.from(await response.arrayBuffer());

          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=3600');
          res.statusCode = 200;
          res.end(buffer);
        } catch (error) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error.message }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pinterestImageProxy()],
})
