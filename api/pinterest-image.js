/**
 * Vercel Serverless Function - Pinterest Image CORS Proxy
 * 
 * Proxies Pinterest image requests with proper CORS headers,
 * allowing the browser canvas to read pixel data for flood-fill coloring.
 * 
 * Endpoint: /api/pinterest-image?url=https://i.pinimg.com/...
 */

export default async function handler(req, res) {
    // Allowed origins
    const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://coloreveryday.vercel.app' // Add your production domain here
    ];

    const origin = req.headers.origin;

    // Check if origin is allowed
    const isAllowed = allowedOrigins.includes(origin) || !origin; // Allow no-origin (direct server calls)

    if (isAllowed && origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        // Fallback for development or block
        // res.setHeader('Access-Control-Allow-Origin', 'null'); 
    }

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        if (isAllowed && origin) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        }
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Access-Control-Max-Age', '86400');
        return res.status(204).end();
    }

    // Only accept GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url } = req.query;

    // Validate URL parameter
    if (!url) {
        return res.status(400).json({ error: 'Missing "url" query parameter' });
    }

    // Security: only allow Pinterest image CDN URLs
    try {
        const parsedUrl = new URL(url);
        if (parsedUrl.hostname !== 'i.pinimg.com') {
            return res.status(403).json({ error: 'Only i.pinimg.com URLs are allowed' });
        }
    } catch {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    try {
        // Fetch the image from Pinterest
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ColorEveryday/1.0)',
            },
        });

        if (!response.ok) {
            return res.status(response.status).json({
                error: `Pinterest returned ${response.status}`
            });
        }

        // Get the image content type
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const buffer = Buffer.from(await response.arrayBuffer());

        // Set CORS and caching headers
        if (isAllowed && origin) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        }
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800'); // 1 day client, 7 days CDN
        res.setHeader('X-Content-Type-Options', 'nosniff');

        return res.status(200).send(buffer);
    } catch (error) {
        console.error('Pinterest proxy error:', error.message);
        return res.status(500).json({ error: 'Failed to fetch image' });
    }
}
