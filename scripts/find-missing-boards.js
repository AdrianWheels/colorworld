import fs from 'fs';

const html = fs.readFileSync('d:/pinterest_raw.html', 'utf8');

// Search for the missing boards by looking at all board-like objects
const missingNames = ['Animals Coloring Pages', 'Cozy Coloring Pages', 'Mandala Free Coloring Pages'];

// Try finding them with various regex patterns
for (const name of missingNames) {
    // Look for the name near pin_count
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Pattern 1: name then pin_count
    const r1 = new RegExp(`"name"\\s*:\\s*"${escaped}"[\\s\\S]{0,500}?"pin_count"\\s*:\\s*(\\d+)`, 'g');
    let m = r1.exec(html);
    if (m) {
        console.log(`✅ ${name}: ${m[1]} pines (pattern 1)`);
        continue;
    }

    // Pattern 2: pin_count then name
    const r2 = new RegExp(`"pin_count"\\s*:\\s*(\\d+)[\\s\\S]{0,500}?"name"\\s*:\\s*"${escaped}"`, 'g');
    m = r2.exec(html);
    if (m) {
        console.log(`✅ ${name}: ${m[1]} pines (pattern 2)`);
        continue;
    }

    // Check if the name even exists
    if (html.includes(name)) {
        console.log(`⚠️ ${name}: Found in HTML but no pin_count nearby`);
        // Get surrounding context
        const idx = html.indexOf(name);
        const context = html.substring(Math.max(0, idx - 200), idx + name.length + 200);
        console.log(`   Context: ...${context.replace(/\n/g, ' ').substring(0, 300)}...`);
    } else {
        console.log(`❌ ${name}: NOT found in HTML`);
    }
}

// Now let's get the pin counts that were found earlier: 8, 20, 12, 27, 17, 14, 18, 13, 15, 11
// We have boards with: 27, 20, 18, 17, 15, 14, 13, 12, 11, 8 = 155
// But the first scraper also found 410 - let's look at that
console.log('\n--- Looking for total pins / All pins board ---');
const totalRegex = /"pin_count"\s*:\s*410/g;
const totalMatch = totalRegex.exec(html);
if (totalMatch) {
    const context = html.substring(Math.max(0, totalMatch.index - 300), totalMatch.index + 100);
    console.log('410 pins context:', context.substring(context.length - 200).replace(/\n/g, ' '));
}

// Let's also look for "All Pins" or similar
console.log('\n--- Searching for profile-level pin data ---');
const profileRegex = /"pin_count"\s*:\s*(\d+)[\s\S]{0,100}?"ColorEveryDay"/g;
let pm;
while ((pm = profileRegex.exec(html)) !== null) {
    console.log(`Profile pin count: ${pm[1]}`);
}

// Let's look for ALL unique board data blocks
console.log('\n--- All board slug URLs found ---');
const slugRegex = /\/coloreveryday\/([a-z0-9-]+)\//gi;
const slugs = new Set();
let sm;
while ((sm = slugRegex.exec(html)) !== null) {
    slugs.add(sm[1]);
}
[...slugs].sort().forEach(s => console.log(`  /${s}/`));

// Count total unique boards
console.log(`\nTotal unique slugs: ${slugs.size}`);
