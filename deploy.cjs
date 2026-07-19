const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // 1. Rodar build (que automaticamente roda prebuild e incrementa a versão)
  console.log('=== [1/3] Incrementando versão e rodando o Build ===');
  execSync('npm run build', { stdio: 'inherit' });

  // Ler a nova versão do package.json
  const pkgPath = path.join(__dirname, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const version = pkg.version;
  console.log(`\nVersão atualizada no package.json: ${version}\n`);

  // 2. Commit e Push para o GitHub
  console.log('=== [2/3] Enviando código para o GitHub ===');
  execSync('git add .', { stdio: 'inherit' });
  
  // Usar aspas duplas compatíveis com Windows e Unix no comando de commit
  execSync(`git commit -m "Deploy versao ${version}"`, { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });

  // 3. Deploy para o Firebase
  console.log('\n=== [3/3] Iniciando o Deploy no Firebase ===');
  execSync('firebase deploy', { stdio: 'inherit' });

  console.log('\n Processo de deploy concluído com sucesso!');
} catch (error) {
  console.error('\n Ocorreu um erro durante o deploy:', error.message);
  process.exit(1);
}
