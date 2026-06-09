import { createRequire } from 'node:module';
import { mkdirSync, readdirSync } from 'node:fs';
const require = createRequire(import.meta.url);
const puppeteer = require('C:/Users/brijesh/AppData/Roaming/npm/node_modules/@mermaid-js/mermaid-cli/node_modules/puppeteer/lib/cjs/puppeteer/puppeteer.js');

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';
const dir = './temporary screenshots';
mkdirSync(dir, { recursive: true });

let n = 1;
try {
  const nums = readdirSync(dir).map(f => parseInt((f.match(/screenshot-(\d+)/)||[])[1])).filter(Boolean);
  if (nums.length) n = Math.max(...nums) + 1;
} catch {}
const out = `${dir}/screenshot-${n}${label ? '-' + label : ''}.png`;

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
// scroll through to trigger reveal-on-scroll animations
await page.evaluate(async () => {
  const h = document.body.scrollHeight;
  for (let y = 0; y < h; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 400));
});
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log('Saved', out);
