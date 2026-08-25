import fs from 'fs';

const filePath = 'C:\\Users\\administrator\\Downloads\\Relatorio-forcenedor-taguatinga.xls';
const buffer = fs.readFileSync(filePath);
const content = buffer.toString('latin1');

const trRegex = /<tr[\s\S]*?<\/tr>/gi;
const tdRegex = /<td[\s\S]*?>([\s\S]*?)<\/td>/gi;

const rawRows = [];
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
    rawRows.push(cells);
  }
}

// Filter to the actual data rows with 4 cells: [Nome, Documento, Fantasia, Cidade/UF]
const supplierRows = rawRows.filter(r => r.length === 4);
console.log('Total 4-cell rows found:', supplierRows.length);
console.log('Header row:', JSON.stringify(supplierRows[0]));

const parsedSuppliers = [];
for (let i = 1; i < supplierRows.length; i++) {
  const [name, doc, fantasia, cityUf] = supplierRows[i];
  if (!name || name === 'Nome') continue;

  const cnpjClean = doc ? doc.replace(/[^\d]/g, '') : '';
  parsedSuppliers.push({
    name: name.trim(),
    cnpj: doc.trim(),
    cnpjClean,
    fantasia: fantasia ? fantasia.trim() : name.trim(),
    city: cityUf ? cityUf.trim() : 'Taguatinga/DF',
    unitId: 'taguatinga',
    unit: 'Taguatinga',
    createdAt: new Date().toISOString()
  });
}

console.log(`\nSuccessfully parsed ${parsedSuppliers.length} suppliers for Taguatinga.`);
console.log('\nFirst 5 suppliers:');
console.log(JSON.stringify(parsedSuppliers.slice(0, 5), null, 2));

console.log('\nLast 5 suppliers:');
console.log(JSON.stringify(parsedSuppliers.slice(-5), null, 2));

// Check for duplicates inside the file
const cnpjMap = new Map();
const duplicatesInFile = [];
parsedSuppliers.forEach((s, idx) => {
  if (s.cnpjClean) {
    if (cnpjMap.has(s.cnpjClean)) {
      duplicatesInFile.push({ original: cnpjMap.get(s.cnpjClean), duplicate: s, index: idx });
    } else {
      cnpjMap.set(s.cnpjClean, s);
    }
  }
});

console.log(`\nDuplicates inside the file: ${duplicatesInFile.length}`);
if (duplicatesInFile.length > 0) {
  console.log(JSON.stringify(duplicatesInFile, null, 2));
}
