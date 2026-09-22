const https = require('https');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY is missing");
    process.exit(1);
}

const modelsToTest = ['gemini-3.8-flash', 'gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-pro', 'gemini-flash-latest'];

async function testModel(model) {
    console.log(`\nTesting model: ${model}`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const payload = JSON.stringify({
        contents: [{ parts: [{ text: "Return exactly: Gemini test successful." }] }]
    });

    return new Promise((resolve) => {
        const req = https.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                if (res.statusCode === 200) {
                    console.log(`Success! Response snippet:`, data.substring(0, 100));
                } else {
                    console.error(`Error Response:`, data);
                }
                resolve(res.statusCode === 200);
            });
        });

        req.on('error', (e) => {
            console.error(`Request error:`, e.message);
            resolve(false);
        });

        req.write(payload);
        req.end();
    });
}

async function runAll() {
    for (const model of modelsToTest) {
        await testModel(model);
    }
}

runAll();
