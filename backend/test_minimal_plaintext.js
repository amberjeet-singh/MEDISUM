require('dotenv').config();

async function run() {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=' + process.env.GEMINI_API_KEY;
    const payload = {
        contents: [{
            parts: [{ text: 'Generate one short discharge-summary paragraph from this sample: Patient admitted with sore throat and difficulty swallowing. CT showed a small peritonsillar abscess. Treated with IV antibiotics. Discharged home on oral antibiotics.' }]
        }],
        generationConfig: {
            temperature: 0.2
        }
    };

    const res = await fetch(url, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    console.log('Status:', res.status);
    const data = await res.json();
    if(res.ok) {
        console.log('Success! Text:', data.candidates[0].content.parts[0].text);
    } else {
        console.error('Error:', data);
    }
}
run();
