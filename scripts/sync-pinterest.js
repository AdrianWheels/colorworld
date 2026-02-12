#!/usr/bin/env node

/**
 * sync-pinterest.js
 * 
 * Fetches all pins from ColorEveryDay's Pinterest boards using the official API v5.
 * Requires PINTEREST_ACCESS_TOKEN in .env file.
 * 
 * Usage: node scripts/sync-pinterest.js
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const OUTPUT_FILE = path.join(ROOT_DIR, 'data', 'pinterest-gallery.json');
const ACCESS_TOKEN = process.env.PINTEREST_ACCESS_TOKEN;
const API_BASE = 'https://api.pinterest.com/v5';

if (!ACCESS_TOKEN) {
    console.error('❌ Error: PINTEREST_ACCESS_TOKEN is missing in .env');
    process.exit(1);
}

/**
 * Helper to fetch data from Pinterest API
 */
async function fetchAPI(endpoint) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            }
        };

        const makeRequest = (url) => {
            https.get(url, options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            const json = JSON.parse(data);
                            resolve(json);
                        } catch (e) {
                            reject(new Error('Invalid JSON response'));
                        }
                    } else if (res.statusCode === 429) {
                        reject(new Error('Rate Limited'));
                    } else {
                        reject(new Error(`API Error ${res.statusCode}: ${data}`));
                    }
                });
            }).on('error', reject);
        };

        makeRequest(endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`);
    });
}

/**
 * Fetches all items handling pagination
 */
async function fetchAll(endpoint) {
    let items = [];
    let nextUrl = endpoint;

    while (nextUrl) {
        const response = await fetchAPI(nextUrl);
        items = items.concat(response.items);
        nextUrl = response.bookmark ? `${endpoint}${endpoint.includes('?') ? '&' : '?'}bookmark=${response.bookmark}` : null;

        // Safety break for testing/dev to avoid infinite loops
        if (items.length > 500) break;
    }

    return items;
}

/**
 * Maps API Image object to our internal format
 */
function mapImages(media) {
    if (!media || !media.images) return {};

    // Pinterest API v5 returns: { "150x150": {...}, "400x300": {...}, "600x": {...}, "1200x": {...} }
    // We map to: small, medium, large, original

    const images = media.images;
    const result = {};

    if (images['150x150']) result.small = images['150x150'].url;
    if (images['400x300']) result.medium = images['400x300'].url;
    if (images['600x']) result.large = images['600x'].url;
    if (images['1200x']) result.original = images['1200x'].url;

    // Fallbacks
    if (!result.medium) result.medium = result.large || result.original;
    if (!result.large) result.large = result.original || result.medium;
    if (!result.original) result.original = result.large;

    return result;
}

/**
 * Creates a URL-friendly slug
 */
function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function main() {
    console.log('\n🔄 Pinterest Sync (API v5) — ColorEveryDay\n');

    try {
        // 1. Get User Profile
        const user = await fetchAPI('/user_account');
        console.log(`👤 User: ${user.username}`);

        // 2. Get Boards
        console.log(`\n📂 Fetching boards...`);
        // Get all boards
        const boards = await fetchAll('/boards');
        console.log(`   Found ${boards.length} boards.`);

        const galleryData = {
            lastSynced: new Date().toISOString(),
            profile: user.username,
            profileUrl: `https://www.pinterest.com/${user.username}/`,
            boards: [],
        };

        for (const board of boards) {
            console.log(`   Processing board: ${board.name}`);

            // 3. Get Pins for each board
            try {
                // Get pins
                const pins = await fetchAll(`/boards/${board.id}/pins`);

                const processedPins = pins.map(pin => ({
                    id: pin.id,
                    title: pin.title || pin.grid_title || null,
                    description: pin.description || null,
                    images: mapImages(pin.media),
                    link: `https://www.pinterest.com/pin/${pin.id}/`,
                    createdAt: pin.created_at || null,
                    dominantColor: pin.dominant_color || null,
                    altText: pin.alt_text || null,
                })).filter(p => p.images.medium); // Filter out pins (like videos) without images

                galleryData.boards.push({
                    id: board.id,
                    name: board.name,
                    slug: slugify(board.name), // Generate slug from name as API usually provides ID as slug
                    description: board.description || null,
                    pinCount: processedPins.length,
                    coverImage: board.media?.image_cover_url || (processedPins[0]?.images?.medium || null),
                    pins: processedPins,
                });

                console.log(`     📌 ${processedPins.length} pins`);

            } catch (err) {
                console.error(`     ❌ Failed to fetch pins for board ${board.name}: ${err.message}`);
            }

            // Rate limit check
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Sort boards by pin count
        galleryData.boards.sort((a, b) => b.pinCount - a.pinCount);

        // Write output
        const outputDir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(galleryData, null, 2), 'utf-8');

        // Summary
        const totalPins = galleryData.boards.reduce((sum, b) => sum + b.pinCount, 0);
        console.log('\n' + '═'.repeat(50));
        console.log(`✅ Sync completado!`);
        console.log(`   📂 Boards: ${galleryData.boards.length}`);
        console.log(`   📌 Pins totales: ${totalPins}`);
        console.log(`   💾 Guardado en: ${OUTPUT_FILE}`);
        console.log('═'.repeat(50) + '\n');

    } catch (error) {
        console.error('\n❌ Sync Failed:', error.message);
        process.exit(1);
    }
}

main();
