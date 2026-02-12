import 'dotenv/config';
import https from 'https';

const ACCESS_TOKEN = process.env.PINTEREST_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
    console.error('❌ Error: PINTEREST_ACCESS_TOKEN is missing in .env');
    process.exit(1);
}

const API_BASE = 'https://api.pinterest.com/v5';

async function fetchAPI(endpoint) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            }
        };

        https.get(`${API_BASE}${endpoint}`, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error('Invalid JSON response'));
                    }
                } else {
                    reject(new Error(`API Error ${res.statusCode}: ${data}`));
                }
            });
        }).on('error', reject);
    });
}

(async () => {
    console.log('🔑 Testing Pinterest API Access...');
    try {
        // 1. Get User Profile
        const user = await fetchAPI('/user_account');
        console.log(`✅ User authenticated: ${user.username}`);

        // 2. Get Boards
        console.log('\n📂 Fetching boards...');
        const boardsData = await fetchAPI('/boards');
        const boards = boardsData.items;
        console.log(`   Found ${boards.length} boards.`);

        if (boards.length > 0) {
            const firstBoard = boards[0];
            console.log(`   Inspecting first board: ${firstBoard.name} (ID: ${firstBoard.id})`);

            // 3. Get Pins for the first board
            console.log(`\n📌 Fetching pins for board ${firstBoard.name}...`);
            const pinsData = await fetchAPI(`/boards/${firstBoard.id}/pins`);
            const pins = pinsData.items;
            console.log(`   Found ${pins.length} pins.`);

            if (pins.length > 0) {
                console.log('   Sample Pin Data:', JSON.stringify(pins[0], null, 2));
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
})();
