/**
 * pinterestService.js
 * 
 * Service for loading Pinterest gallery data and constructing
 * proxied image URLs for CORS-safe canvas rendering.
 */

import Logger from '../utils/logger.js';

const GALLERY_DATA_URL = '/data/pinterest-gallery.json';

class PinterestService {
    constructor() {
        this.cache = null;
        this.cacheTime = null;
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Loads the gallery data JSON, with caching
     */
    async loadGalleryData() {
        if (this.cache && this.cacheTime && (Date.now() - this.cacheTime < this.cacheExpiry)) {
            return this.cache;
        }

        try {
            Logger.log('📌 Cargando datos de galería Pinterest...');
            const response = await fetch(`${GALLERY_DATA_URL}?v=${Date.now()}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.cache = data;
            this.cacheTime = Date.now();

            Logger.log(`✅ Galería cargada: ${data.boards.length} boards`);
            return data;
        } catch (error) {
            Logger.error('❌ Error cargando galería Pinterest:', error);
            return { boards: [], lastSynced: null, profile: 'ColorEveryDay' };
        }
    }

    /**
     * Converts a Pinterest CDN URL to a proxied URL with CORS headers
     */
    getProxiedImageUrl(originalUrl) {
        if (!originalUrl) return null;
        // Route through our Vercel serverless proxy
        return `/api/pinterest-image?url=${encodeURIComponent(originalUrl)}`;
    }

    /**
     * Gets the best available image URL for display (thumbnails don't need proxy)
     * For gallery grid display, we use the original Pinterest URL (no CORS needed for <img>)
     */
    getDisplayImageUrl(pin) {
        if (!pin || !pin.images) return null;
        return pin.images.medium || pin.images.large || pin.images.original || pin.images.small || null;
    }

    /**
     * Gets the image URL for the coloring canvas (needs CORS proxy)
     */
    getColoringImageUrl(pin) {
        if (!pin || !pin.images) return null;
        const bestUrl = pin.images.original || pin.images.large || pin.images.medium;
        return bestUrl ? this.getProxiedImageUrl(bestUrl) : null;
    }

    /**
     * Finds a board by its slug
     */
    async getBoardBySlug(slug) {
        const data = await this.loadGalleryData();
        return data.boards.find(b => b.slug === slug) || null;
    }

    /**
     * Finds a pin by its ID across all boards
     */
    async getPinById(pinId) {
        const data = await this.loadGalleryData();
        for (const board of data.boards) {
            const pin = board.pins.find(p => p.id === pinId);
            if (pin) {
                return { pin, board };
            }
        }
        return null;
    }
}

export default new PinterestService();
