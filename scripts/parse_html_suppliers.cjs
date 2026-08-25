const fs = require('fs');

const filePath = 'C:\\Users\\administrator\\Downloads\\Relatorio-forcenedor-taguatinga.xls';
const content = fs.readFileSync(filePath, 'utf8');

// Match table rows inside the inner table
// Let's find all <tr>...</tr>
const trRegex = /<tr[\s\S]*?<\/tr>/gi;
const tdRegex = /<td[\s\S]*?>([\s\S]*?)<\/td>/gi;

const rows = [];
let match;

while ((match = trRegex.exec(content)) !== null) {
  const trContent = match[0];
  const cells = [];
  let tdMatch;
  while ((tdMatch = tdRegex.exec(trContent)) !== null) {
    // strip inner tags and trim
    let cellText = tdMatch[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    cells.push(cellText);
  }
  if (cells.length > 0) {
    rows.push(cells);
  }
}

console.log('Total extracted TR elements:', rows.length);
console.log('\nSample rows:');
rows.forEach((r, idx) => {
  if (r.length > 1) {
    console.log(`Row ${idx} (Cells: ${r.length}):`, JSON.stringify(r));
  }
});
