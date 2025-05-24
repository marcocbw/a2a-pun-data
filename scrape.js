const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('https://www.a2a.it/assistenza/tutela-cliente/indici/indice-pun', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  await page.waitForSelector('table');

  const data = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tr')).slice(1);
    return rows.map(row => {
      return Array.from(row.querySelectorAll('td')).map(td =>
        td.innerText.trim().replace(',', '.').replace('€', '')
      );
    }).filter(r => r.length === 6);
  });

  const header = ['Mese', 'Monorario', 'F1', 'F2', 'F3', 'F23'];
  const csv = [header, ...data].map(r => r.join(',')).join('\n');

  fs.writeFileSync(path.join(__dirname, 'indice_pun.csv'), csv, 'utf8');

  await browser.close();
})();
