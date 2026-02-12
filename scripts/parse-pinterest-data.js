#!/usr/bin/env node

// Parse the Pinterest PWS data to extract boards and pins info
import fs from 'fs';

const raw = fs.readFileSync('d:/pinterest_raw.html', 'utf8');

// Find all data-relay-response script tags - these contain the actual board/pin data
const relayRegex = /<script[^>]*data-relay-response="true"[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let allBoards = [];

// Also search in the initial server data
// Pinterest stores data in __PWS_INITIAL_PROPS__ or similar
const initialPropsRegex = /window\.__PWS_DATA__\s*=\s*(\{[\s\S]*?\});?\s*<\/script>/;
const propsMatch = raw.match(initialPropsRegex);

// Try to find board data in the entire HTML
// Search for the board representation pattern
const boardDataRegex = /"board_type"[\s\S]*?"name"\s*:\s*"([^"]+)"[\s\S]*?"pin_count"\s*:\s*(\d+)/g;
while ((match = boardDataRegex.exec(raw)) !== null) {
    const name = match[1];
    const pinCount = parseInt(match[2]);
    if (!allBoards.find(b => b.name === name)) {
        allBoards.push({ name, pinCount });
    }
}

// Also try reverse pattern
const boardDataRegex2 = /"name"\s*:\s*"([^"]+)"[\s\S]{0,500}?"pin_count"\s*:\s*(\d+)/g;
while ((match = boardDataRegex2.exec(raw)) !== null) {
    const name = match[1];
    const pinCount = parseInt(match[2]);
    // Filter out non-board names
    if (name.length > 3 && !['Creados', 'Guardados', 'meryhoop', 'ColorEveryDay'].includes(name)) {
        if (!allBoards.find(b => b.name === name)) {
            allBoards.push({ name, pinCount });
        }
    }
}

// Try to find the comprehensive board list in JSON props
const jsonDataRegex = /<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi;
while ((match = jsonDataRegex.exec(raw)) !== null) {
    try {
        const data = JSON.parse(match[1]);
        const jsonStr = JSON.stringify(data);
        if (jsonStr.includes('pin_count') && jsonStr.includes('board')) {
            fs.writeFileSync('d:/pinterest_board_json.json', JSON.stringify(data, null, 2));
            console.log('Found board JSON data, saved to pinterest_board_json.json');

            // Recursively find boards
            function findBoards(obj, path = '') {
                if (!obj || typeof obj !== 'object') return;

                if (obj.name && obj.pin_count !== undefined && obj.url) {
                    if (!allBoards.find(b => b.name === obj.name)) {
                        allBoards.push({
                            name: obj.name,
                            pinCount: obj.pin_count,
                            url: obj.url,
                            description: obj.description || '',
                            privacy: obj.privacy || 'public',
                            imageUrl: obj.image_cover_url || obj.image_thumbnail_url || ''
                        });
                    }
                }

                if (Array.isArray(obj)) {
                    obj.forEach((item, i) => findBoards(item, `${path}[${i}]`));
                } else {
                    Object.keys(obj).forEach(key => findBoards(obj[key], `${path}.${key}`));
                }
            }

            findBoards(data);
        }
    } catch (e) {
        // Not valid JSON, skip
    }
}

// Also look at the __PWS_DATA__ which we already parsed
try {
    const pwsData = JSON.parse(fs.readFileSync('d:/pinterest_pws_parsed.json', 'utf8'));

    function findBoardsDeep(obj, path = '') {
        if (!obj || typeof obj !== 'object') return;

        if (obj.name && obj.pin_count !== undefined) {
            const name = obj.name;
            if (name.length > 3 && !['Creados', 'Guardados', 'meryhoop', 'ColorEveryDay'].includes(name)) {
                if (!allBoards.find(b => b.name === name)) {
                    allBoards.push({
                        name: name,
                        pinCount: obj.pin_count,
                        url: obj.url || '',
                        description: obj.description || '',
                    });
                }
            }
        }

        if (Array.isArray(obj)) {
            obj.forEach((item, i) => findBoardsDeep(item, `${path}[${i}]`));
        } else {
            Object.keys(obj).forEach(key => findBoardsDeep(obj[key], `${path}.${key}`));
        }
    }

    findBoardsDeep(pwsData);
} catch (e) {
    console.log('Error parsing PWS data:', e.message);
}

// Now let's also try to find individual pin data
const pinDataRegex = /"pin_count"\s*:\s*(\d+)[\s\S]*?"name"\s*:\s*"([^"]+)"/g;
while ((match = pinDataRegex.exec(raw)) !== null) {
    const pinCount = parseInt(match[1]);
    const name = match[2];
    if (name.length > 3 && !['Creados', 'Guardados', 'meryhoop', 'ColorEveryDay'].includes(name)) {
        if (!allBoards.find(b => b.name === name)) {
            allBoards.push({ name, pinCount });
        }
    }
}

// Sort boards by pin count descending
allBoards.sort((a, b) => b.pinCount - a.pinCount);

console.log('\n📌 ═══════════════════════════════════════════════════════');
console.log('   PERFIL DE PINTEREST: ColorEveryDay');
console.log('═══════════════════════════════════════════════════════\n');

let totalPins = 0;
console.log(`📂 PANELES (${allBoards.length} encontrados):\n`);
allBoards.forEach((board, i) => {
    totalPins += board.pinCount;
    const url = board.url ? `  🔗 ${board.url}` : '';
    const desc = board.description ? `  📝 ${board.description}` : '';
    console.log(`  ${(i + 1).toString().padStart(2)}. 📋 ${board.name}`);
    console.log(`      📌 ${board.pinCount} pines${url}${desc}`);
    console.log('');
});

console.log(`\n📊 RESUMEN:`);
console.log(`   Total paneles: ${allBoards.length}`);
console.log(`   Total pines: ${totalPins}`);

// Save results as JSON for future use
const result = {
    profile: 'ColorEveryDay',
    profileUrl: 'https://es.pinterest.com/ColorEveryDay/',
    scrapedAt: new Date().toISOString(),
    totalBoards: allBoards.length,
    totalPins: totalPins,
    boards: allBoards
};

fs.writeFileSync('d:/Proyectos/ColorEveryday/colorworld/data/pinterest-boards.json', JSON.stringify(result, null, 2));
console.log('\n💾 Datos guardados en data/pinterest-boards.json');
