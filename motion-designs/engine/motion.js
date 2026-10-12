/*
 * Mini moteur de motion design, 100 % déterministe.
 *
 * Chaque vidéo décrit son animation comme une fonction pure du temps
 * `render(t)` : la même valeur de t produit toujours exactement la même image.
 * Cela permet :
 *   - un aperçu temps réel dans le navigateur (ouvrir index.html),
 *   - un export image par image sans saccade (engine/render.cjs → MP4).
 */
(function () {
  const M = {};

  M.clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  M.lerp = (a, b, t) => a + (b - a) * t;

  const back = (c1) => (t) => {
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };
  M.E = {
    linear: (t) => t,
    inQuad: (t) => t * t,
    outQuad: (t) => 1 - (1 - t) * (1 - t),
    inCubic: (t) => t * t * t,
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    outQuart: (t) => 1 - Math.pow(1 - t, 4),
    inOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
    outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    inExpo: (t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
    inOutExpo: (t) =>
      t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
    outBack: back(1.70158),
    outBackSoft: back(1.1),
    outBackStrong: back(2.8),
    inBack: (t) => 2.70158 * t * t * t - 1.70158 * t * t,
    outElastic: (t) =>
      t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin(((t * 10 - 0.75) * 2 * Math.PI) / 3) + 1,
  };

  /** Progression 0→1 entre t0 et t0+d, avec easing optionnel. */
  M.p = (t, t0, d, ease) => {
    const v = M.clamp((t - t0) / d);
    return ease ? M.E[ease](v) : v;
  };

  /**
   * Interpolation par images clés :
   *   kf(t, [0, 0], [0.5, 100, 'outBack'], [2, 100], [2.4, 0, 'inCubic'])
   * L'easing indiqué sur une clé s'applique au segment qui y mène.
   */
  M.kf = (t, ...keys) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e] = keys[i];
      if (t <= t1) {
        const [t0, v0] = keys[i - 1];
        const q = t1 - t0 > 0 ? (t - t0) / (t1 - t0) : 1;
        const ease = typeof e === 'function' ? e : M.E[e || 'inOutCubic'];
        return v0 + (v1 - v0) * ease(q);
      }
    }
    return keys[keys.length - 1][1];
  };

  /** Fenêtre d'apparition : 0 avant `a`, 1 entre a+inD et b-outD, 0 après b. */
  M.win = (t, a, b, inD = 0.3, outD = 0.3, eIn = 'outCubic', eOut = 'inCubic') => {
    if (t < a || t > b) return 0;
    const i = inD > 0 ? M.E[eIn](M.clamp((t - a) / inD)) : 1;
    const o = outD > 0 ? 1 - M.E[eOut](M.clamp((t - (b - outD)) / outD)) : 1;
    return Math.min(i, o);
  };

  /** Générateur pseudo-aléatoire reproductible. */
  M.rng = (seed) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let r = Math.imul(a ^ (a >>> 15), 1 | a);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  };

  /** Petit bruit lisse (somme de sinus) pour flottements et tremblements. */
  M.wobble = (t, seed = 1, f = 1) =>
    (Math.sin(t * 2.1 * f + seed * 1.7) + Math.sin(t * 3.7 * f + seed * 4.1) * 0.6 + Math.sin(t * 5.3 * f + seed * 9.2) * 0.3) /
    1.9;

  /** Secousse de caméra amortie, déclenchée à t0. */
  M.shake = (t, t0, dur = 0.35, amp = 18) => {
    if (t < t0 || t > t0 + dur) return [0, 0, 0];
    const k = 1 - (t - t0) / dur;
    const e = k * k;
    return [Math.sin((t - t0) * 90) * amp * e, Math.cos((t - t0) * 77) * amp * e, Math.sin((t - t0) * 63) * amp * 0.06 * e];
  };

  /**
   * Positionne un élément : x/y = coordonnées absolues de son CENTRE dans la scène 1080×1920.
   * Options : s (échelle), sx, sy, r (rotation °), ry/rx (rotation 3D), o (opacité), blur (px), z.
   */
  M.set = (el, o = {}) => {
    if (!el) return;
    const op = o.o === undefined ? 1 : o.o;
    if (op <= 0.001) {
      if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden';
      return;
    }
    if (el.style.visibility !== 'visible') el.style.visibility = 'visible';
    const s = o.s === undefined ? 1 : o.s;
    const sx = (o.sx === undefined ? 1 : o.sx) * s;
    const sy = (o.sy === undefined ? 1 : o.sy) * s;
    let tr = `translate(-50%,-50%) translate3d(${(o.x || 0).toFixed(2)}px,${(o.y || 0).toFixed(2)}px,${(o.z || 0).toFixed(2)}px)`;
    if (o.ry) tr += ` rotateY(${o.ry.toFixed(2)}deg)`;
    if (o.rx) tr += ` rotateX(${o.rx.toFixed(2)}deg)`;
    if (o.r) tr += ` rotate(${o.r.toFixed(3)}deg)`;
    tr += ` scale(${sx.toFixed(4)},${sy.toFixed(4)})`;
    el.style.transform = tr;
    el.style.opacity = op.toFixed(3);
    const f = o.blur > 0.05 ? `blur(${o.blur.toFixed(2)}px)` : '';
    if ((el.dataset.f || '') !== f) {
      el.style.filter = f ? f + (el.dataset.basefilter ? ' ' + el.dataset.basefilter : '') : el.dataset.basefilter || '';
      el.dataset.f = f;
    }
  };

  /** Découpe le texte d'un élément en <span> par lettre (ou par mot) pour les animer individuellement. */
  M.split = (el, byWord = false) => {
    const text = el.textContent;
    el.textContent = '';
    const parts = byWord ? text.split(/(\s+)/) : Array.from(text);
    const spans = [];
    for (const ch of parts) {
      if (/^\s+$/.test(ch)) {
        el.appendChild(document.createTextNode(ch));
        continue;
      }
      const s = document.createElement('span');
      s.textContent = ch;
      s.style.display = 'inline-block';
      s.style.willChange = 'transform';
      el.appendChild(s);
      spans.push(s);
    }
    return spans;
  };

  M.$ = (sel, root = document) => root.querySelector(sel);
  M.$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /** Crée un élément positionné dans la scène. */
  M.el = (parent, cls, html = '', style = '') => {
    const d = document.createElement('div');
    d.className = 'm ' + cls;
    if (html) d.innerHTML = html;
    if (style) d.style.cssText += style;
    parent.appendChild(d);
    return d;
  };

  /**
   * Lance la composition.
   *   cfg.duration : durée en secondes
   *   cfg.render(t) : fonction de rendu
   *   cfg.cues : repères sonores [{t, sfx}] lus par engine/music.py
   *   cfg.music : description de la bande-son (style, sections)
   *   cfg.audio : chemin d'un .wav pour l'aperçu navigateur (optionnel)
   */
  M.run = (cfg) => {
    const stage = document.getElementById('stage');
    const params = new URLSearchParams(location.search);
    window.__duration = cfg.duration;
    window.__cues = cfg.cues || [];
    window.__music = cfg.music || {};
    window.__render = (t) => cfg.render(t);

    const imgs = Array.from(document.images).map((im) =>
      im.complete ? Promise.resolve() : new Promise((r) => { im.onload = im.onerror = r; })
    );
    Promise.all([document.fonts.ready, ...imgs]).then(() => {
      cfg.render(0);
      window.__ready = true;
      if (params.has('render')) return;
      startPreview(stage, cfg, params);
    });
  };

  function startPreview(stage, cfg, params) {
    document.body.classList.add('preview');
    const fit = () => {
      const s = Math.min((innerHeight - 70) / 1920, innerWidth / 1080);
      stage.style.transform = `scale(${s})`;
      stage.style.transformOrigin = 'top left';
      document.body.style.setProperty('--stage-w', 1080 * s + 'px');
      document.body.style.setProperty('--stage-h', 1920 * s + 'px');
    };
    fit();
    addEventListener('resize', fit);

    const bar = document.createElement('div');
    bar.id = 'transport';
    bar.innerHTML =
      '<button id="pp">⏸</button><input id="scrub" type="range" min="0" step="0.001"><span id="tc">0.00</span>';
    document.body.appendChild(bar);
    const scrub = bar.querySelector('#scrub');
    const pp = bar.querySelector('#pp');
    const tc = bar.querySelector('#tc');
    scrub.max = cfg.duration;

    let audio = null;
    if (cfg.audio && !params.has('mute')) {
      audio = new Audio(cfg.audio);
      audio.loop = false;
    }
    let playing = true;
    let t = parseFloat(params.get('t') || '0');
    let last = performance.now();
    const play = () => {
      playing = true;
      pp.textContent = '⏸';
      last = performance.now();
      if (audio) { audio.currentTime = t; audio.play().catch(() => {}); }
    };
    const pause = () => {
      playing = false;
      pp.textContent = '▶';
      if (audio) audio.pause();
    };
    pp.onclick = () => (playing ? pause() : play());
    scrub.oninput = () => { t = parseFloat(scrub.value); if (audio) audio.currentTime = t; };
    addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); playing ? pause() : play(); } });
    document.body.addEventListener('click', (e) => { if (e.target === document.body && audio && audio.paused && playing) play(); }, { once: true });
    if (audio) audio.play().catch(() => {});

    const loop = (now) => {
      if (playing) {
        t += (now - last) / 1000;
        if (t >= cfg.duration) { t = 0; if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); } }
      }
      last = now;
      cfg.render(t);
      scrub.value = t;
      tc.textContent = t.toFixed(2) + ' s';
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  window.M = M;
})();
