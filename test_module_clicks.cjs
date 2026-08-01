const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR (CRASH):', error.stack || error.message));

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

    // Login if needed
    const loginButton = await page.$('button[type="submit"]');
    if (loginButton) {
      await page.type('#email', 'contato@techcosta.net');
      await page.type('#password', 'Test1234!');
      await loginButton.click();
      await new Promise(r => setTimeout(r, 2000));
    }

    console.log('--- Testing HR Module Click ---');
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('h3, div, button'));
      const hrCard = cards.find(el => el.textContent.includes('Recursos Humanos'));
      if (hrCard) hrCard.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    console.log('--- Navigating back to selector ---');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Módulos') || b.textContent.includes('Início'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    console.log('--- Testing Stock Module Click ---');
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('h3, div, button'));
      const stockCard = cards.find(el => el.textContent.includes('Estoque'));
      if (stockCard) stockCard.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    console.log('--- Navigating back to selector ---');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Módulos') || b.textContent.includes('Início'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    console.log('--- Testing Purchasing Module Click ---');
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('h3, div, button'));
      const purCard = cards.find(el => el.textContent.includes('Compras'));
      if (purCard) purCard.click();
    });
    await new Promise(r => setTimeout(r, 2000));

  } catch (err) {
    console.error('Script error:', err);
  }

  await browser.close();
})();
