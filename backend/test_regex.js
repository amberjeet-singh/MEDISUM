const header = '<SEX>';
const markers = ['<SEX>', '<SERVICE>'];

// My failed code used:
const escapedHeader1 = header.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
const escapedMarkers1 = markers.map(m => m.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'));
const regex1 = new RegExp(`${escapedHeader1}\\\\s*([\\\\s\\\\S]*?)(?=(?:${escapedMarkers1.join('|')})|$)`, 'i');

console.log("Regex1:", regex1.source);

// Correct approach:
const escapedHeader2 = header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const escapedMarkers2 = markers.map(m => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const regex2 = new RegExp(`${escapedHeader2}\\s*([\\s\\S]*?)(?=(?:${escapedMarkers2.join('|')})|$)`, 'i');

console.log("Regex2:", regex2.source);
