const fs = require('fs');

const filePath = 'C:\\Users\\administrator\\Downloads\\Relatorio-forcenedor-taguatinga.xls';
// Read buffer and decode as latin1
const buffer = fs.readFileSync(filePath);
const content = buffer.toString('latin1');

const trRegex = /<tr[\s\S]*?<\/tr>/gi;
const tdRegex = /<td[\s\S]*?>([\s\S]*?)<\/td>/gi;

const rows = [];
let match;

while ((match = trRegex.exec(content)) !== null) {
  const trContent = match[0];
  const cells = [];
  let tdMatch;
  while ((tdMatch = tdRegex.exec(trContent)) !== null) {
    let cellText = tdMatch[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    cells.push(cellText);
  }
  if (cells.length > 0) {
    rows.push(cells);
  }
}

console.log('Sample rows with latin1 decoding:');
rows.filter(r => r.length === 4).slice(90, 105).forEach(r => {
  console.log(r);
});
