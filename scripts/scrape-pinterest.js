#!/usr/bin/env node

// Script para obtener paneles y pines del perfil de Pinterest de ColorEveryDay
import https from 'https';
import fs from 'fs';

const USERNAME = 'ColorEveryDay';

function fetchPage(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                'Cache-Control': 'no-cache',
            }
        };

        https.get(url, options, (res) => {
            // Follow redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                console.log(`Redirecting to: ${res.headers.location}`);
                fetchPage(res.headers.location).then(resolve).catch(reject);
                return;
            }

            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
            res.on('error', reject);
        }).on('error', reject);
    });
}

async function main() {
    console.log(`\n📌 Obteniendo perfil de Pinterest: ${USERNAME}\n`);

    try {
        // Fetch the profile page
        const html = await fetchPage(`https://www.pinterest.com/${USERNAME}/`);
        console.log(`📄 HTML recibido: ${html.length} bytes`);

        // Save raw HTML for analysis
        fs.writeFileSync('d:/pinterest_raw.html', html);
        console.log('💾 HTML guardado en d:/pinterest_raw.html');

        // Try to find JSON data embedded in the page
        // Pinterest embeds initial data in script tags
        const scriptRegex = /<script[^>]*id="__PWS_DATA__"[^>]*>([\s\S]*?)<\/script>/i;
        const pwsMatch = html.match(scriptRegex);

        if (pwsMatch) {
            console.log('\n✅ Encontrado __PWS_DATA__');
            fs.writeFileSync('d:/pinterest_pws_data.json', pwsMatch[1]);
            try {
                const data = JSON.parse(pwsMatch[1]);
                console.log('Datos parseados correctamente');
                fs.writeFileSync('d:/pinterest_pws_parsed.json', JSON.stringify(data, null, 2));
            } catch (e) {
                console.log('Error parseando JSON:', e.message);
            }
        }

        // Try another common Pinterest data pattern
        const scriptRegex2 = /<script[^>]*data-relay-response="true"[^>]*>([\s\S]*?)<\/script>/gi;
        let match;
        let relayIndex = 0;
        while ((match = scriptRegex2.exec(html)) !== null) {
            console.log(`\n✅ Encontrado data-relay-response #${relayIndex}`);
            const filename = `d:/pinterest_relay_${relayIndex}.json`;
            fs.writeFileSync(filename, match[1]);
            try {
                const data = JSON.parse(match[1]);
                fs.writeFileSync(filename, JSON.stringify(data, null, 2));
                console.log(`Datos parseados y guardados en ${filename}`);
            } catch (e) {
                console.log(`Error parseando: ${e.message}`);
            }
            relayIndex++;
        }

        // Try to find any JSON-LD structured data
        const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
        let ldIndex = 0;
        while ((match = jsonLdRegex.exec(html)) !== null) {
            console.log(`\n✅ Encontrado JSON-LD #${ldIndex}`);
            try {
                const data = JSON.parse(match[1]);
                console.log(JSON.stringify(data, null, 2));
            } catch (e) {
                console.log(`Raw: ${match[1].substring(0, 200)}`);
            }
            ldIndex++;
        }

        // Try to find ALL script tags with JSON data
        const allScripts = /<script[^>]*>([\s\S]*?)<\/script>/gi;
        let scriptIndex = 0;
        const boardsFound = [];
        while ((match = allScripts.exec(html)) !== null) {
            const content = match[1];
            if (content.includes('board') && content.length > 100) {
                try {
                    // Try to find board names in the content
                    const boardNameRegex = /"name"\s*:\s*"([^"]+)"/g;
                    let nameMatch;
                    while ((nameMatch = boardNameRegex.exec(content)) !== null) {
                        if (!boardsFound.includes(nameMatch[1]) && nameMatch[1].length > 1) {
                            boardsFound.push(nameMatch[1]);
                        }
                    }

                    // Also look for pin_count
                    const pinCountRegex = /"pin_count"\s*:\s*(\d+)/g;
                    let pinMatch;
                    while ((pinMatch = pinCountRegex.exec(content)) !== null) {
                        console.log(`  Pin count encontrado: ${pinMatch[1]}`);
                    }
                } catch (e) { }
            }
            scriptIndex++;
        }

        if (boardsFound.length > 0) {
            console.log('\n📋 Nombres encontrados en el HTML:');
            boardsFound.forEach((name, i) => {
                console.log(`  ${i + 1}. ${name}`);
            });
        }

        // Also try the Pinterest RSS feed for each board
        console.log('\n🔍 Buscando enlaces a paneles en el HTML...');
        const boardLinkRegex = new RegExp(`/${USERNAME}/([^/"]+)/`, 'gi');
        const boardSlugs = new Set();
        while ((match = boardLinkRegex.exec(html)) !== null) {
            const slug = match[1];
            if (!['pins', 'followers', 'following', '_saved', '_created', 'boards'].includes(slug.toLowerCase())) {
                boardSlugs.add(slug);
            }
        }

        if (boardSlugs.size > 0) {
            console.log('\n📂 Board slugs encontrados:');
            [...boardSlugs].forEach((slug, i) => {
                console.log(`  ${i + 1}. /${USERNAME}/${slug}/`);
            });
        }

        console.log(`\n📊 Total scripts analizados: ${scriptIndex}`);
        console.log(`📊 Total board names: ${boardsFound.length}`);
        console.log(`📊 Total board slugs: ${boardSlugs.size}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

main();
