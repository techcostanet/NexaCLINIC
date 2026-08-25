const fs = require('fs');
const XLSX = require('xlsx');

const filePath = 'C:\\Users\\administrator\\Downloads\\Relatorio-forcenedor-taguatinga.xls';

try {
  console.log('Checking file existence...');
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }

  const stat = fs.statSync(filePath);
  console.log('File size:', stat.size, 'bytes');

  // Try reading with XLSX
  const workbook = XLSX.readFile(filePath);
  console.log('Sheet names:', workbook.SheetNames);

  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`\n--- Sheet: ${sheetName} (Rows: ${data.length}) ---`);
    console.log('First 15 rows:');
    data.slice(0, 15).forEach((row, idx) => {
      console.log(`Row ${idx}:`, JSON.stringify(row));
    });
  });
} catch (err) {
  console.error('Error reading with XLSX, trying raw text reading if HTML/XML/CSV:', err.message);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    console.log('Raw text preview (first 1000 chars):');
    console.log(raw.substring(0, 1000));
  } catch (rawErr) {
    console.error('Raw read error:', rawErr.message);
  }
}
