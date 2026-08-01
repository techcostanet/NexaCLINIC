const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));

    // Try logging in if login screen is active
    const loginButton = await page.$('button[type="submit"]');
    if (loginButton) {
      console.log('Logging in...');
      await page.type('input[type="email"]', 'contato@techcosta.net');
      await page.type('input[type="password"]', 'Test1234!'); // or whatever password
      await loginButton.click();
      await new Promise(r => setTimeout(r, 2000));
    }

    // Let's inspect buttons/modules visible
    const moduleCards = await page.$$('.card');
    console.log(`Found ${moduleCards.length} cards`);

  } catch (err) {
    console.error('Test error:', err);
  }

  await browser.close();
})();
