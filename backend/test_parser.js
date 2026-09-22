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

const markers = [
    '<SEX>', '<SERVICE>', '<ALLERGIES>', '<ATTENDING>', '<CHIEF COMPLAINT>',
    '<MAJOR SURGICAL OR INVASIVE PROCEDURE>', '<HISTORY OF PRESENT ILLNESS>',
    '<PAST MEDICAL HISTORY>', '<SOCIAL HISTORY>', '<FAMILY HISTORY>',
    '<PHYSICAL EXAM>', '<PERTINENT RESULTS>', '<MEDICATIONS ON ADMISSION>',
    '<DISCHARGE MEDICATIONS>', '<DISCHARGE DISPOSITION>', '<DISCHARGE DIAGNOSIS>',
    '<DISCHARGE CONDITION>', '<FOLLOWUP INSTRUCTIONS>', '<DISCHARGE INSTRUCTIONS>'
];

const parseSection = (header, text) => {
    // Escape header
    const escapedHeader = header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedMarkers = markers.map(m => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    
    // The regex matches the header, then lazily captures everything until the next marker or EOF
    const regex = new RegExp(`${escapedHeader}\\s*([\\s\\S]*?)(?=(?:${escapedMarkers.join('|')})|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
};

console.log("ALLERGIES:", parseSection('<ALLERGIES>', input));
console.log("ATTENDING:", parseSection('<ATTENDING>', input));
console.log("CHIEF COMPLAINT:", parseSection('<CHIEF COMPLAINT>', input));
