const fs = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Increment patch version (e.g. 1.0.0 -> 1.0.1)
const parts = pkg.version.split('.');
if (parts.length === 3) {
  parts[2] = parseInt(parts[2], 10) + 1;
  pkg.version = parts.join('.');
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`[Version Auto-Increment] Versão atualizada para: ${pkg.version}`);
} else {
  console.log('[Version Auto-Increment] Formato de versão inválido no package.json');
}
