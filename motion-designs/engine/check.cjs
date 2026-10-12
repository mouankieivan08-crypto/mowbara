#!/usr/bin/env node
/* Contrôle qualité : signale les éléments visibles qui débordent de la scène 1080×1920.
 *   node engine/check.cjs happy-fruits [pas=0.1] */
const path = require('path'), http = require('http'), fs = require('fs'), { execSync } = require('child_process');
let pw; try { pw = require('playwright'); } catch { pw = require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); }
const ROOT = path.resolve(__dirname, '..'), name = process.argv[2], step = parseFloat(process.argv[3] || '0.1');
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  fs.createReadStream(p).pipe(res);
});
(async () => {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const browser = await pw.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', (e) => console.error('[page]', e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/${name}/index.html?render=1`);
  await page.waitForFunction(() => window.__ready === true);
  const dur = await page.evaluate(() => window.__duration);
  const seen = new Map();
  for (let t = 0; t < dur; t += step) {
    const bad = await page.evaluate((t) => {
      window.__render(t);
      const out = [];
      for (const e of document.querySelectorAll('#cam > .m')) {
        if (e.style.visibility !== 'visible' || parseFloat(e.style.opacity) < 0.9) continue;
        if (e.matches('.dust,.spark,.drip,.dice,.leafEl,.drop,.pot,.cup,#panel,#hero,.glow,.rays,.cupDisc,#wipeRing,#dripTop')) continue;
        const r = e.getBoundingClientRect();
        if (r.left < -2 || r.right > 1082) out.push(`${(e.textContent || e.id || e.className).trim().slice(0, 40)} [${Math.round(r.left)}..${Math.round(r.right)}]`);
      }
      return out;
    }, t);
    for (const b of bad) { const k = b.replace(/\[.*\]/, ''); if (!seen.has(k)) seen.set(k, `${t.toFixed(2)}s ${b}`); }
  }
  console.log(seen.size ? [...seen.values()].join('\n') : 'Aucun débordement détecté.');
  await browser.close(); server.close();
})();
