import fs from 'fs';

const html = fs.readFileSync('d:/pinterest_raw.html', 'utf8');

// Find ALL board objects by searching for board node_ids (Qm9hcmQ6 is base64 for "Board:")
const boardBlockRegex = /\{[^{}]*"node_id"\s*:\s*"Qm9hcmQ6[^"]*"[^{}]*\}/g;
let match;
const boards = [];

while ((match = boardBlockRegex.exec(html)) !== null) {
    try {
        const obj = JSON.parse(match[0]);
        if (obj.name) {
            const existing = boards.find(b => b.name === obj.name);
            if (!existing) {
                boards.push({
                    name: obj.name,
                    pinCount: obj.pin_count || null,
                    url: obj.url || null,
                    nodeId: obj.node_id,
                    imageUrl: obj.image_thumbnail_url || null,
                    description: obj.description || null,
                });
            } else if (obj.pin_count && !existing.pinCount) {
                existing.pinCount = obj.pin_count;
            }
        }
    } catch (e) {
        // Try to extract name manually from the block
        const nameM = match[0].match(/"name"\s*:\s*"([^"]+)"/);
        const pinM = match[0].match(/"pin_count"\s*:\s*(\d+)/);
        if (nameM) {
            const existing = boards.find(b => b.name === nameM[1]);
            if (!existing) {
                boards.push({
                    name: nameM[1],
                    pinCount: pinM ? parseInt(pinM[1]) : null,
                });
            }
        }
    }
}

// If some boards still don't have pin_count, try to find it in nearby context
for (const board of boards) {
    if (board.pinCount === null && board.name) {
        // Search for pin_count near the board name in the full HTML
        const nameIdx = html.indexOf(`"name":"${board.name}"`);
        if (nameIdx > -1) {
            const surroundingStart = Math.max(0, nameIdx - 1000);
            const surroundingEnd = Math.min(html.length, nameIdx + 1000);
            const surrounding = html.substring(surroundingStart, surroundingEnd);
            const pinMatch = surrounding.match(/"pin_count"\s*:\s*(\d+)/);
            if (pinMatch) {
                board.pinCount = parseInt(pinMatch[1]);
            }
        }
    }
}

// Also search for broader board objects with curly brace nesting
const boardUrlRegex = /"url"\s*:\s*"\/coloreveryday\/([a-z0-9-]+)\/"/gi;
const allSlugs = new Set();
let sm;
while ((sm = boardUrlRegex.exec(html)) !== null) {
    allSlugs.add(sm[1]);
}

// Check which slugs we're missing
const foundSlugs = boards.map(b => b.url ? b.url.replace(/^\/coloreveryday\//, '').replace(/\/$/, '') : null).filter(Boolean);
const missingSlugs = [...allSlugs].filter(s => !foundSlugs.includes(s));

console.log('Missing slugs:', missingSlugs);

// For missing slugs, try harder to find their data
for (const slug of missingSlugs) {
    const slugIdx = html.indexOf(`/coloreveryday/${slug}/`);
    if (slugIdx > -1) {
        const context = html.substring(Math.max(0, slugIdx - 2000), Math.min(html.length, slugIdx + 2000));
        const nameMatch = context.match(/"name"\s*:\s*"([^"]+)"/g);
        const pinMatch = context.match(/"pin_count"\s*:\s*(\d+)/);
        if (nameMatch) {
            // Find the name closest to the slug
            for (const nm of nameMatch) {
                const name = nm.match(/"name"\s*:\s*"([^"]+)"/)[1];
                if (name.toLowerCase().replace(/\s+/g, '-').includes(slug.substring(0, 10))) {
                    const existing = boards.find(b => b.name === name);
                    if (!existing) {
                        boards.push({
                            name: name,
                            pinCount: pinMatch ? parseInt(pinMatch[1]) : null,
                            url: `/coloreveryday/${slug}/`,
                        });
                    }
                }
            }
        }
    }
}

// Sort by pin count
boards.sort((a, b) => (b.pinCount || 0) - (a.pinCount || 0));

// Print results
console.log('\n📌 TODOS LOS PANELES DE PINTEREST - ColorEveryDay\n');
let total = 0;
boards.forEach((b, i) => {
    total += b.pinCount || 0;
    console.log(`${(i + 1).toString().padStart(2)}. ${b.name}`);
    console.log(`    📌 Pines: ${b.pinCount || 'desconocido'}`);
    console.log(`    🔗 ${b.url || 'sin URL'}`);
    if (b.description) console.log(`    📝 ${b.description.substring(0, 100)}...`);
    console.log('');
});

console.log(`\n📊 Total: ${boards.length} paneles, ${total} pines`);

// Update the final JSON
const result = JSON.parse(fs.readFileSync('d:/Proyectos/ColorEveryday/colorworld/data/pinterest-boards.json', 'utf8'));

// Merge new boards
for (const board of boards) {
    const existing = result.boards.find(b => b.name === board.name);
    if (!existing) {
        result.boards.push(board);
    } else {
        // Update missing fields
        if (!existing.pinCount && board.pinCount) existing.pinCount = board.pinCount;
        if (!existing.url && board.url) existing.url = board.url;
        if (!existing.description && board.description) existing.description = board.description;
        if (!existing.imageUrl && board.imageUrl) existing.imageUrl = board.imageUrl;
    }
}

result.totalBoards = result.boards.length;
result.totalPins = result.boards.reduce((sum, b) => sum + (b.pinCount || 0), 0);
result.boards.sort((a, b) => (b.pinCount || 0) - (a.pinCount || 0));
result.scrapedAt = new Date().toISOString();

fs.writeFileSync('d:/Proyectos/ColorEveryday/colorworld/data/pinterest-boards.json', JSON.stringify(result, null, 2));
console.log('\n💾 JSON actualizado en data/pinterest-boards.json');
