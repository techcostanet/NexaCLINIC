const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));

    // Evaluate in page context to test rendering each module
    const modulesToTest = ['purchasing', 'stock', 'hr'];

    for (const mod of modulesToTest) {
      console.log(`\n--- TESTING MODULE: ${mod} ---`);
      await page.evaluate((m) => {
        // Trigger React state change if window.__setModule exists or by clicking card
        const cards = Array.from(document.querySelectorAll('.card, button, div'));
        // Find card with matching module text or click
      }, mod);
    }

  } catch (err) {
    console.error('Test error:', err);
  }

  await browser.close();
})();
