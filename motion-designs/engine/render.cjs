#!/usr/bin/env node
/*
 * Export d'une composition en MP4 (1080×1920, 30 i/s, H.264 + AAC).
 *
 *   node engine/render.cjs dore-et-vous
 *   node engine/render.cjs happy-fruits --fps 30
 *   node engine/render.cjs dore-et-vous --stills 1.2,4,19.5   (captures PNG pour vérifier)
 *   node engine/render.cjs dore-et-vous --no-audio
 *
 * Prérequis : Node 18+, Playwright (Chromium), ffmpeg, Python 3 + numpy (bande-son).
 */
const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn, spawnSync, execSync } = require('child_process');

let pw;
try {
  pw = require('playwright');
} catch {
  pw = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
}

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const name = args[0];
if (!name || !fs.existsSync(path.join(ROOT, name, 'index.html'))) {
  console.error('Usage : node engine/render.cjs <dossier-composition> [--fps 30] [--stills t1,t2] [--no-audio]');
  process.exit(1);
}
const opt = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : d;
};
const FPS = parseInt(opt('--fps', '30'), 10);
const stills = opt('--stills', null);
const noAudio = args.includes('--no-audio');
const PY = process.env.PYTHON || 'python3';
const OUT = path.join(ROOT, 'output');
fs.mkdirSync(OUT, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.cjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.wav': 'audio/wav', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
    res.writeHead(404);
    return res.end();
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});

(async () => {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const browser = await pw.chromium.launch({ args: ['--force-color-profile=srgb', '--disable-lcd-text', '--font-render-hinting=none'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('[page]', e.message));
  await page.goto(`http://127.0.0.1:${port}/${name}/index.html?render=1`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  const duration = await page.evaluate(() => window.__duration);

  if (stills) {
    for (const s of stills.split(',')) {
      const t = parseFloat(s);
      await page.evaluate((t) => window.__render(t), t);
      const f = path.join(OUT, `${name}-still-${t.toFixed(2)}.png`);
      await page.screenshot({ path: f, type: 'png' });
      console.log('still', f);
    }
    await browser.close();
    server.close();
    return;
  }

  // 1) Bande-son synchronisée sur les repères de la composition
  let wav = null;
  if (!noAudio) {
    const spec = await page.evaluate(() => ({ cues: window.__cues, music: window.__music, duration: window.__duration }));
    const specFile = path.join(OUT, `${name}.audio.json`);
    fs.writeFileSync(specFile, JSON.stringify(spec, null, 2));
    wav = path.join(OUT, `${name}.wav`);
    const r = spawnSync(PY, [path.join(__dirname, 'music.py'), specFile, wav], { stdio: 'inherit' });
    if (r.status !== 0) {
      console.warn('⚠ Bande-son non générée (Python/numpy manquant ?) — export sans audio.');
      wav = null;
    }
  }

  // 2) Images → ffmpeg
  const frames = Math.round(duration * FPS);
  const mp4 = path.join(OUT, `${name}.mp4`);
  const ff = ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-'];
  if (wav) ff.push('-i', wav);
  ff.push('-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(FPS), '-movflags', '+faststart');
  if (wav) ff.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
  ff.push(mp4);
  const proc = spawn('ffmpeg', ff, { stdio: ['pipe', 'ignore', 'inherit'] });
  proc.stdin.on('error', () => {});

  const t0 = Date.now();
  for (let i = 0; i < frames; i++) {
    const t = i / FPS;
    await page.evaluate((t) => window.__render(t), t);
    const buf = await page.screenshot({ type: 'jpeg', quality: 96 });
    if (!proc.stdin.write(buf)) await new Promise((r) => proc.stdin.once('drain', r));
    if (i % FPS === 0) process.stdout.write(`\r${name} : ${i}/${frames} images (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
  proc.stdin.end();
  await new Promise((r) => proc.on('close', r));
  process.stdout.write(`\r${name} : ${frames}/${frames} images — terminé\n`);

  // 3) Vignette (image de couverture) à partir de la scène finale
  const coverT = await page.evaluate(() => window.__music.cover ?? window.__duration - 1);
  await page.evaluate((t) => window.__render(t), coverT);
  await page.screenshot({ path: path.join(OUT, `${name}-cover.jpg`), type: 'jpeg', quality: 92 });

  await browser.close();
  server.close();
  console.log('→', mp4);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
