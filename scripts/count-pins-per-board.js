import fs from 'fs';

const json = fs.readFileSync('d:/pinterest_board_json.json', 'utf8');
const data = JSON.parse(json);

// Count pins per board by analyzing the UserPinsResource
const boardPinCounts = {};

function countPins(obj, path = '') {
    if (!obj || typeof obj !== 'object') return;

    // If this is a pin object with a board reference
    if (obj.board && obj.board.name && obj.type === 'pin') {
        const boardName = obj.board.name;
        boardPinCounts[boardName] = (boardPinCounts[boardName] || 0) + 1;
    }

    // Also check if this has a board.name directly (might be the pin data structure)
    if (obj.id && obj.board && obj.board.name && !obj.type) {
        const boardName = obj.board.name;
        if (!boardPinCounts[boardName]) boardPinCounts[boardName] = 0;
        boardPinCounts[boardName]++;
    }

    if (Array.isArray(obj)) {
        obj.forEach((item, i) => countPins(item, `${path}[${i}]`));
    } else {
        Object.keys(obj).forEach(key => countPins(obj[key], `${path}.${key}`));
    }
}

countPins(data);

console.log('Pin counts from UserPinsResource:');
Object.entries(boardPinCounts).sort((a, b) => b[1] - a[1]).forEach(([name, count]) => {
    console.log(`  ${name}: ${count} pines (visible en primera carga)`);
});

// Also look at the BoardsResource for pin_count
function findBoardResource(obj, path = '') {
    if (!obj || typeof obj !== 'object') return;

    if (obj.pin_count !== undefined && obj.name && obj.type === 'board') {
        console.log(`\nBoard from resource: ${obj.name} = ${obj.pin_count} pines`);
        console.log(`  URL: ${obj.url || 'N/A'}`);
    }

    if (Array.isArray(obj)) {
        obj.forEach((item, i) => findBoardResource(item, `${path}[${i}]`));
    } else {
        Object.keys(obj).forEach(key => findBoardResource(obj[key], `${path}.${key}`));
    }
}

console.log('\n--- BoardsResource data ---');
findBoardResource(data);

// Check the first scraping data (relay responses) for GraphQL board data
const html = fs.readFileSync('d:/pinterest_raw.html', 'utf8');

// Look for GraphQL relay responses which have complete board data
const relayRegex = /<script\s+data-relay-response="true"[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let relayIdx = 0;

while ((match = relayRegex.exec(html)) !== null) {
    try {
        const relayData = JSON.parse(match[1]);

        // Search for boards with pin_count in relay data
        function findInRelay(obj, depth = 0) {
            if (!obj || typeof obj !== 'object' || depth > 15) return;

            if (obj.pin_count !== undefined && obj.name) {
                console.log(`\nRelay #${relayIdx}: ${obj.name} = ${obj.pin_count} pines`);
                if (obj.description) console.log(`  Desc: ${obj.description.substring(0, 80)}`);
                if (obj.url) console.log(`  URL: ${obj.url}`);
            }

            if (Array.isArray(obj)) {
                obj.forEach(item => findInRelay(item, depth + 1));
            } else {
                Object.keys(obj).forEach(key => findInRelay(obj[key], depth + 1));
            }
        }

        findInRelay(relayData);
    } catch (e) {
        // skip
    }
    relayIdx++;
}

// Now update the final JSON with what we know 
// The first scraping found pin counts: 8, 20, 12, 27, 17, 14, 18, 13, 15, 11
// These correspond to the 10 boards we already have data for
// For the remaining 3, we need to count from pins visible in the data

// Based on the UserPinsResource, we can see some pins per board
// But the full count requires scrolling/pagination on Pinterest's side
// Let's check if the total profile pin count (410) minus known (155) gives us the 3 unknown boards

const knownTotal = 155; // sum of known board pin counts
const profileTotal = 410; // from the profile data
const unknownTotal = profileTotal - knownTotal;

console.log(`\n\n📊 ANÁLISIS FINAL:`);
console.log(`  Pines en paneles conocidos: ${knownTotal}`);
console.log(`  Pines totales del perfil: ${profileTotal}`);
console.log(`  Pines en paneles sin conteo: ${unknownTotal}`);
console.log(`  (estos ${unknownTotal} pines se reparten entre Animals, Cozy y Mandala)`);

// The 410 likely includes "All Pins" which is the total, so the 3 unknown boards
// together have 410 - 155 = 255 pins divided somehow among them
