const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    const text = msg.text();
    if (!text.includes('Download the React DevTools') && !text.includes('[vite]')) {
      console.log('PAGE LOG:', text);
    }
  });
  
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));
    console.log('Test completed.');
  } catch (err) {
    console.error('Failed to load page:', err);
  }
  
  await browser.close();
})();
