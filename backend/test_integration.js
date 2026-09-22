const input = `
<SEX> M
<SERVICE> SURGERY
<ALLERGIES> No Known Allergies / Adverse Drug Reactions
<ATTENDING> ___
<CHIEF COMPLAINT> Recurrent fevers, elevated LFTs
<MAJOR SURGICAL OR INVASIVE PROCEDURE> ___ left ___ internal/external modified APDL drain and cholangioplasty of the anastomotic stricture.
<HISTORY OF PRESENT ILLNESS> per ___ year old man with s/p roux en u HJJ for bile duct injury w/ multiple episodes of cholangitis. ERCP done and unable to advance SBE into one of the limbs. Pt continues to have recurrent fevers and elevated LFTs
<PAST MEDICAL HISTORY> PMH: acute cholecystitis, nephrolithiasis PSH: L inguinal hernia repair
<SOCIAL HISTORY> ___
<FAMILY HISTORY> no history of liver cancer
<PERTINENT RESULTS> ...
<MEDICATIONS ON ADMISSION> ...
<DISCHARGE MEDICATIONS> ...
<DISCHARGE DISPOSITION> Home
<DISCHARGE DIAGNOSIS> cholangitis
<DISCHARGE CONDITION> Mental Status: Clear and coherent. Level of Consciousness: Alert and interactive. Activity Status: Ambulatory - Independent.
<FOLLOWUP INSTRUCTIONS> ___
<DISCHARGE INSTRUCTIONS> ...
`;

async function run() {
    try {
        // 1. Create Patient
        const patRes = await fetch('http://localhost:3000/api/v1/patients', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({}) });
        const patData = await patRes.json();
        const patientId = patData.data.id;
        console.log("Patient created:", patientId);

        // 2. Create Encounter
        const encRes = await fetch('http://localhost:3000/api/v1/encounters', { 
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ patient_id: patientId }) 
        });
        const encData = await encRes.json();
        const encounterId = encData.data.id;
        console.log("Encounter created:", encounterId);

        // 3. Post Notes
        const noteRes = await fetch('http://localhost:3000/api/v1/notes', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                encounter_id: encounterId,
                rough_notes: input
            })
        });
        const noteData = await noteRes.json();
        console.log("Note created:", noteData.data.id);

        // 4. Verify Patient Update
        const getPat = await fetch(`http://localhost:3000/api/v1/patients/${patientId}`);
        const getPatData = await getPat.json();
        console.log("Updated Patient SEX:", getPatData.data.sex);

        // 5. Verify Encounter Update
        const getEnc = await fetch(`http://localhost:3000/api/v1/encounters/${encounterId}`);
        const getEncData = await getEnc.json();
        console.log("Updated Encounter CHIEF COMPLAINT:", getEncData.data.chief_complaint);
        console.log("Updated Encounter SERVICE:", getEncData.data.service);

        // 7. Trigger Extraction
        const extractRes = await fetch(`http://localhost:3000/api/v1/encounters/${encounterId}/extract`, { method: 'POST' });
        const extractData = await extractRes.json();
        console.log("Extraction facts count:", extractData.data?.length);

        // 8. Trigger Generation
        const genRes = await fetch(`http://localhost:3000/api/v1/encounters/${encounterId}/generate-summary`, { method: 'POST' });
        const genData = await genRes.json();
        console.log("Summary generation status:", genData.success ? 'Success' : 'Failed');
        if (!genData.success) {
            console.error("Generation error:", genData.error);
        }

        // 9. Fetch Generated Summary
        const getSumRes = await fetch(`http://localhost:3000/api/v1/encounters/${encounterId}/generated-summary`);
        const getSumData = await getSumRes.json();
        console.log("Fetched Generated Summary ID:", getSumData.data?.id);
        
        if (getSumData.data && getSumData.data.status !== 'FAILED') {
            console.log("Generated Plain Text Summary:", getSumData.data.content.slice(0, 100) + "...");
        } else {
            console.log("Skipping output because generation failed.");
        }
    } catch (e) {
        console.error(e);
    }
}
run();
