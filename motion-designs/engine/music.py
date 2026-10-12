#!/usr/bin/env python3
"""
Bande-son 100 % synthétisée (aucun sample, aucun droit d'auteur) et calée
sur les repères de la composition.

    python3 engine/music.py output/<nom>.audio.json output/<nom>.wav

Le JSON est écrit par engine/render.cjs à partir de window.__music / __cues :
  music.style    : "dore" (groove afro/amapiano) ou "fruits" (tropical house)
  music.bpm      : tempo
  music.sections : [[t, mode], ...]  modes : intro | full | break | outro
  cues           : [{t, sfx}, ...]   bruitages (whoosh, pop, impact, ...)

Dépendance : numpy.
"""
import json
import sys
import wave

import numpy as np

SR = 44100
rng = np.random.default_rng(7)


# --------------------------------------------------------------------------- utilitaires
def midi(n):
    names = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
    base = names[n[0]]
    i = 1
    if n[1] in "#b":
        base += 1 if n[1] == "#" else -1
        i = 2
    octave = int(n[i:])
    return 440.0 * 2 ** ((base + 12 * (octave + 1) - 69) / 12)


def tvec(sec):
    return np.arange(int(sec * SR)) / SR


def noise(sec):
    return rng.standard_normal(int(sec * SR))


def band(x, lo=None, hi=None, soft=0.25):
    """Filtre passe-bande doux dans le domaine fréquentiel."""
    n = len(x)
    if n == 0:
        return x
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    m = np.ones_like(f)
    if lo:
        m *= 1 / (1 + (lo / np.maximum(f, 1)) ** (2 / soft))
    if hi:
        m *= 1 / (1 + (f / hi) ** (2 / soft))
    return np.fft.irfft(X * m, n)


def sweep_band(x, f0, f1, width=0.7):
    """Passe-bande dont la fréquence centrale glisse de f0 à f1 (STFT)."""
    hop, win = 256, 1024
    w = np.hanning(win)
    out = np.zeros(len(x) + win)
    norm = np.zeros(len(x) + win)
    freqs = np.fft.rfftfreq(win, 1 / SR)
    frames = max(1, (len(x) - win) // hop + 1)
    for k in range(frames):
        a = k * hop
        seg = x[a:a + win]
        if len(seg) < win:
            seg = np.pad(seg, (0, win - len(seg)))
        q = k / max(1, frames - 1)
        fc = f0 * (f1 / f0) ** q
        mask = np.exp(-0.5 * (np.log(np.maximum(freqs, 1) / fc) / width) ** 2)
        y = np.fft.irfft(np.fft.rfft(seg * w) * mask, win)
        out[a:a + win] += y * w
        norm[a:a + win] += w * w
    return (out / np.maximum(norm, 1e-3))[: len(x)]


def env_ad(n, a, d):
    t = np.arange(n) / SR
    e = np.exp(-np.maximum(t - a, 0) / d)
    if a > 0:
        e = np.where(t < a, t / a, e)
    return e


def eq(x, points):
    """Égaliseur : points = [(Hz, dB), ...] interpolés en échelle log."""
    n = len(x)
    X = np.fft.rfft(x)
    f = np.maximum(np.fft.rfftfreq(n, 1 / SR), 10)
    hz, db = zip(*points)
    g = 10 ** (np.interp(np.log10(f), np.log10(hz), db) / 20)
    return np.fft.irfft(X * g, n)


def norm(x, peak=1.0):
    m = np.max(np.abs(x)) or 1
    return x / m * peak


# --------------------------------------------------------------------------- instruments
def kick(level=1.0, punch=1.0):
    t = tvec(0.5)
    f = 44 + 120 * punch * np.exp(-t / 0.032)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.17)
    click = band(noise(0.5), 1500, 8000) * np.exp(-t / 0.003) * 0.4
    return np.tanh(1.6 * (body + click)) * level


def clap(level=1.0):
    t = tvec(0.35)
    n = band(noise(0.35), 900, 5500)
    e = np.zeros_like(t)
    for d in (0.0, 0.011, 0.023):
        e += np.where(t >= d, np.exp(-(t - d) / 0.004), 0)
    e += np.where(t >= 0.03, np.exp(-(t - 0.03) / 0.085), 0) * 0.8
    return norm(n * e) * level


def hat(level=1.0, open_=False):
    d = 0.09 if open_ else 0.025
    n = band(noise(0.3), 7000, None)
    return norm(n * env_ad(len(n), 0.001, d)) * level


def shaker(level=1.0):
    n = band(noise(0.12), 4500, 13000)
    return norm(n * env_ad(len(n), 0.006, 0.035)) * level


def log_drum(freq, level=1.0):
    t = tvec(0.7)
    f = freq * (1 + 0.9 * np.exp(-t / 0.018))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t / 0.3) + 0.5 * np.sin(2.01 * ph) * np.exp(-t / 0.12) + 0.2 * np.sin(3.02 * ph) * np.exp(-t / 0.06)
    s = np.tanh(3.0 * s)
    return band(s, None, 2600) * level


def bass(freq, sec, level=1.0):
    t = tvec(sec)
    ph = 2 * np.pi * freq * t
    s = np.sin(ph) + 0.25 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)
    e = np.minimum(1, t / 0.006) * np.exp(-t / (sec * 0.9))
    rel = np.clip((sec - t) / 0.02, 0, 1)
    return np.tanh(1.4 * s) * e * rel * level


def epiano(freqs, sec, level=1.0, bright=1.0):
    t = tvec(sec + 0.6)
    out = np.zeros_like(t)
    for fq in freqs:
        for k in range(1, 7):
            a = (1 / k ** 1.6) * np.exp(-t * (1.3 + k * 1.1 / bright))
            out += a * np.sin(2 * np.pi * fq * k * t + k)
        out += 0.12 * np.sin(2 * np.pi * fq * 7.1 * t) * np.exp(-t / 0.05)
    rel = np.clip((sec + 0.6 - t) / 0.6, 0, 1)
    out *= np.minimum(1, t / 0.004) * rel
    return out / max(1, len(freqs)) * level


def marimba(freq, level=1.0):
    t = tvec(0.9)
    s = (
        np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.32)
        + 0.32 * np.sin(2 * np.pi * freq * 3.98 * t) * np.exp(-t / 0.05)
        + 0.08 * np.sin(2 * np.pi * freq * 9.9 * t) * np.exp(-t / 0.015)
    )
    return s * np.minimum(1, t / 0.002) * level


def pad(freqs, sec, level=1.0, cutoff=1800):
    t = tvec(sec)
    out = np.zeros_like(t)
    for fq in freqs:
        for det in (-0.12, 0.12):
            ph = 2 * np.pi * fq * (1 + det / 100) * t + rng.random() * 6
            for k in range(1, 10):
                out += np.sin(k * ph) / k
    out = band(out, 80, cutoff)
    e = np.minimum(1, t / 0.35) * np.clip((sec - t) / 0.4, 0, 1)
    return norm(out * e) * level


# --------------------------------------------------------------------------- bruitages
def sfx(kind, var=0.0):
    if kind in ("whoosh", "whoosh_low", "swish"):
        sec = {"whoosh": 0.55, "whoosh_low": 0.8, "swish": 0.3}[kind]
        f0, f1 = {"whoosh": (500, 5200), "whoosh_low": (160, 1400), "swish": (2500, 9000)}[kind]
        x = sweep_band(noise(sec), f0, f1, 0.55)
        t = tvec(sec)
        e = np.sin(np.pi * np.clip(t / sec, 0, 1)) ** 2.2
        return norm(x * e) * {"whoosh": 0.55, "whoosh_low": 0.7, "swish": 0.32}[kind]
    if kind == "pop":
        t = tvec(0.12)
        f0 = 1300 * (1 + var * 0.35)
        f = f0 * np.exp(-t / 0.03) + 280
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.035)
        return s * 0.42
    if kind in ("thud", "impact", "impact_soft", "end"):
        big = {"thud": 0.6, "impact": 1.0, "impact_soft": 0.75, "end": 1.0}[kind]
        sec = 0.6 + 1.2 * big
        t = tvec(sec)
        f = 32 + 70 * np.exp(-t / 0.06)
        boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.18 + 0.5 * big))
        crash = band(noise(sec), 2500, 14000) * np.exp(-t / (0.08 + 0.55 * big)) * (0.25 if kind != "thud" else 0.05)
        body = band(noise(sec), 120, 900) * np.exp(-t / 0.05) * 0.4
        return np.tanh(1.5 * (boom + crash + body)) * (0.55 + 0.4 * big)
    if kind == "sparkle":
        out = np.zeros(int(0.9 * SR))
        notes = [2093, 2349, 2637, 3136, 3520, 4186]
        for i in range(7):
            fq = notes[int(rng.integers(len(notes)))]
            t = tvec(0.5)
            s = (np.sin(2 * np.pi * fq * t) + 0.3 * np.sin(2 * np.pi * fq * 2.7 * t)) * np.exp(-t / 0.12)
            a = int(i * 0.045 * SR)
            out[a:a + len(s)] += s[: len(out) - a]
        return norm(out) * 0.3
    if kind == "riser":
        sec = 0.6
        t = tvec(sec)
        x = sweep_band(noise(sec), 300, 7000, 0.5) * (t / sec) ** 2
        f = 180 * (6 ** (t / sec))
        tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * (t / sec) ** 3 * 0.25
        return norm(x + tone) * 0.55
    if kind == "count":
        out = np.zeros(int(0.85 * SR))
        for i in range(16):
            q = i / 15
            tt = 0.75 * (1 - (1 - q) ** (1 / 3))  # suit la courbe outCubic du compteur
            t = tvec(0.03)
            s = np.sin(2 * np.pi * (2400 + 600 * q) * t) * np.exp(-t / 0.006)
            a = int(tt * SR)
            out[a:a + len(s)] += s[: len(out) - a]
        return out * 0.22
    if kind == "ring":
        t = tvec(0.9)
        tone = np.sin(2 * np.pi * 1320 * t) + np.sin(2 * np.pi * 1660 * t)
        am = (np.sin(2 * np.pi * 18 * t) > 0).astype(float)
        gate = ((t % 0.45) < 0.35).astype(float)
        return band(tone * am * gate, 600, 4000) * env_ad(len(t), 0.01, 0.5) * 0.12
    if kind == "tick":
        t = tvec(0.05)
        return band(noise(0.05), 2000, 9000) * np.exp(-t / 0.004) * 0.5 + np.sin(2 * np.pi * 3200 * t) * np.exp(-t / 0.006) * 0.25
    if kind == "splash":
        sec = 1.0
        t = tvec(sec)
        x = sweep_band(noise(sec), 3500, 700, 0.8)
        e = np.exp(-t / 0.22) * (1 + 0.6 * np.sin(2 * np.pi * 23 * t) ** 2)
        out = x * e
        for i in range(10):  # gouttes
            a = int((0.05 + rng.random() * 0.6) * SR)
            tt = tvec(0.08)
            fq = 900 + rng.random() * 1400
            d = np.sin(2 * np.pi * np.cumsum(fq * (1 + 1.5 * tt / 0.08)) / SR) * np.exp(-tt / 0.02)
            out[a:a + len(d)] += d[: len(out) - a] * 0.25
        return norm(out) * 0.75
    if kind == "check":
        out = np.zeros(int(0.6 * SR))
        for i, fq in enumerate((1318.5, 1760.0)):
            s = marimba(fq, 0.35)
            a = int(i * 0.07 * SR)
            out[a:a + len(s)] += s[: len(out) - a]
        return out
    if kind == "drain":
        t = tvec(1.2)
        f = 600 * np.exp(-t / 0.6) + 120
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.7) * 0.18
        return s
    raise ValueError(kind)


# --------------------------------------------------------------------------- mixage
class Bus:
    def __init__(self, n):
        self.L = np.zeros(n)
        self.R = np.zeros(n)

    def add(self, sig, t, gain=1.0, pan=0.0):
        a = int(round(t * SR))
        if a >= len(self.L) or a + len(sig) <= 0:
            return
        if a < 0:
            sig = sig[-a:]
            a = 0
        b = min(len(self.L), a + len(sig))
        s = sig[: b - a] * gain
        th = (pan + 1) * np.pi / 4
        self.L[a:b] += s * np.cos(th)
        self.R[a:b] += s * np.sin(th)


def section_at(sections, t):
    mode = sections[0][1]
    for t0, m in sections:
        if t >= t0 - 1e-6:
            mode = m
    return mode


def build(spec):
    dur = float(spec["duration"])
    music = spec.get("music", {})
    style = music.get("style", "dore")
    bpm = float(music.get("bpm", 120))
    sections = music.get("sections", [[0, "full"]])
    beat = 60 / bpm
    six = beat / 4
    n = int((dur + 2.5) * SR)
    drums, mus, fx, verb = Bus(n), Bus(n), Bus(n), Bus(n)
    kicks = []

    if style == "dore":
        prog = [["A3", "C4", "E4", "G4", "B4"], ["F3", "A3", "C4", "E4"], ["D3", "F3", "A3", "C4", "E4"], ["E3", "G3", "B3", "D4"]]
        roots = ["A1", "F1", "D1", "E1"]
        key_hits = [0, 3, 6, 10, 13]
        log_pat = [(2, 0), (7, 12), (10, 0), (11, 7), (14, 0)]
    else:
        prog = [["F3", "A3", "C4", "E4"], ["G3", "B3", "D4", "E4"], ["E3", "G3", "B3", "D4"], ["A3", "C4", "E4", "G4"]]
        roots = ["F2", "G2", "E2", "A2"]
        mel = dict([  # (double-croche sur 4 mesures, note)
            (0, "C5"), (3, "A4"), (6, "C5"), (8, "F5"), (10, "E5"), (12, "C5"), (14, "A4"),
            (16, "B4"), (19, "D5"), (22, "G5"), (24, "D5"), (26, "B4"), (28, "D5"), (30, "E5"),
            (32, "E5"), (35, "B4"), (38, "G4"), (40, "B4"), (42, "E5"), (44, "G5"), (46, "E5"),
            (48, "A4"), (51, "C5"), (54, "E5"), (56, "C5"), (58, "A4"), (60, "G4"), (62, "E4"),
        ])

    steps = int(dur / six) + 1
    for i in range(steps):
        t = i * six
        mode = section_at(sections, t)
        bar = int(t / (4 * beat))
        pos = i % 16
        chord = [midi(x) for x in prog[bar % 4]]
        root = midi(roots[bar % 4])
        if mode == "outro" and t > dur:
            break

        if mode == "full":
            if pos % 4 == 0:
                drums.add(kick(0.9 if style == "fruits" else 0.68), t)
                kicks.append(t)
            if pos in (4, 12):
                c = clap(0.5)
                drums.add(c, t, pan=0.05)
                verb.add(c, t, 0.35)
            amp = 0.14 if pos % 2 else 0.09
            drums.add(shaker(amp), t + (0.012 if pos % 2 else 0), pan=0.35)
            if pos % 4 == 2:
                drums.add(hat(0.16, open_=True), t, pan=-0.3)
            if style == "dore":
                if pos in key_hits:
                    sec = 0.35 if pos != 13 else 0.5
                    e = epiano(chord, sec, 0.75, bright=1.6)
                    mus.add(e, t, pan=-0.15)
                    mus.add(e, t + 0.011, 0.6, pan=0.4)
                    verb.add(e, t, 0.25)
                for p_, semi in log_pat:
                    if pos == p_:
                        mus.add(log_drum(root * 2 ** (semi / 12) * 2, 0.4), t)
                if pos == 0:
                    p_ = pad(chord, 4 * beat + 0.3, 0.16, cutoff=2600)
                    mus.add(p_, t, pan=0.0)
                    verb.add(p_, t, 0.2)
            else:
                if pos % 4 == 2:
                    mus.add(bass(root, six * 1.8, 0.5), t)
                if pos == 0:
                    e = epiano(chord, beat * 3.5, 0.3, bright=0.9)
                    p_ = pad(chord, 4 * beat + 0.3, 0.14, cutoff=3000)
                    mus.add(p_, t)
                    mus.add(e, t, pan=-0.2)
                    verb.add(e, t, 0.3)
                nm = mel.get((bar % 4) * 16 + pos)
                if nm:
                        m = marimba(midi(nm), 0.3)
                        mus.add(m, t, pan=0.25)
                        mus.add(m, t + 0.19, 0.25, pan=-0.45)  # écho
                        verb.add(m, t, 0.3)
        elif mode == "intro":
            if pos == 0:
                p_ = pad(chord, 4 * beat + 0.4, 0.22, cutoff=900 if style == "dore" else 600)
                mus.add(p_, t)
                verb.add(p_, t, 0.4)
            if style == "dore" and pos % 2 == 1:
                drums.add(shaker(0.06), t, pan=0.3)
            if style == "fruits" and pos % 4 == 0:
                fx.add(sfx("tick"), t, 0.8, pan=0.1)
        elif mode == "break":
            if pos == 0 or i == int(section_at_start(sections, t) / six):
                p_ = pad(chord, 2 * beat, 0.2, cutoff=2400)
                mus.add(p_, t)
                verb.add(p_, t, 0.4)

    # Accord final
    for t0, m in sections:
        if m == "outro":
            chord = [midi(x) for x in prog[0]]
            e = epiano(chord, 2.2, 0.45)
            mus.add(e, t0)
            verb.add(e, t0, 0.5)
            mus.add(log_drum(midi(roots[0]) * 2, 0.6) if style == "dore" else bass(midi(roots[0]), 1.2, 0.6), t0)
            drums.add(kick(1.0), t0)

    # Bruitages
    for k, c in enumerate(spec.get("cues", [])):
        kind = c["sfx"]
        s = sfx(kind, var=((k * 37) % 7) / 7 - 0.5)
        pan = 0.0 if kind in ("impact", "thud", "end", "riser", "count") else ((k * 53) % 9) / 9 * 0.8 - 0.4
        gain = 0.9
        fx.add(s, float(c["t"]), gain, pan=pan)
        if kind in ("impact", "end", "sparkle", "impact_soft", "splash"):
            verb.add(s, float(c["t"]), 0.35)

    # Pompe (sidechain) sur la musique à chaque grosse caisse
    duck = np.ones(n)
    dl = int(0.25 * SR)
    shape = 1 - (0.45 if style == "fruits" else 0.3) * np.exp(-np.arange(dl) / SR / 0.09)
    for t in kicks:
        a = int(t * SR)
        b = min(n, a + dl)
        duck[a:b] = np.minimum(duck[a:b], shape[: b - a])
    mus.L *= duck
    mus.R *= duck

    # Réverbération (convolution avec une réponse impulsionnelle synthétique)
    ir_len = int(1.6 * SR)
    ti = np.arange(ir_len) / SR
    irL = band(rng.standard_normal(ir_len), 200, 6000) * np.exp(-ti / 0.45)
    irR = band(rng.standard_normal(ir_len), 200, 6000) * np.exp(-ti / 0.45)
    irL /= np.sqrt(np.sum(irL ** 2))
    irR /= np.sqrt(np.sum(irR ** 2))
    size = 1 << int(np.ceil(np.log2(n + ir_len)))
    send = verb.L + verb.R
    S = np.fft.rfft(send, size)
    wetL = np.fft.irfft(S * np.fft.rfft(irL, size), size)[:n]
    wetR = np.fft.irfft(S * np.fft.rfft(irR, size), size)[:n]

    L = drums.L * 0.9 + mus.L + fx.L + wetL * 0.22
    R = drums.R * 0.9 + mus.R + fx.R + wetR * 0.22

    # Master : passe-haut, limiteur doux, fondu final
    curve = [(30, -4), (80, -3), (250, 0), (900, 2.5), (1800, 6), (3500, 6), (7000, 3), (14000, 2)]
    L, R = band(eq(L, curve), 28, None), band(eq(R, curve), 28, None)
    ref = np.percentile(np.abs(np.concatenate([L, R])), 99.7) or 1
    L, R = np.tanh(L / ref * 0.9) * 0.93, np.tanh(R / ref * 0.9) * 0.93
    total = int(dur * SR)
    L, R = L[:total], R[:total]
    fade = int(0.6 * SR)
    ramp = np.linspace(1, 0, fade) ** 2
    L[-fade:] *= ramp
    R[-fade:] *= ramp
    return L, R


def section_at_start(sections, t):
    start = sections[0][0]
    for t0, _ in sections:
        if t >= t0 - 1e-6:
            start = t0
    return start


def main():
    spec = json.load(open(sys.argv[1]))
    L, R = build(spec)
    data = np.stack([L, R], 1)
    pcm = (np.clip(data, -1, 1) * 32767).astype("<i2")
    with wave.open(sys.argv[2], "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print("audio →", sys.argv[2], f"({len(L) / SR:.1f} s)")


if __name__ == "__main__":
    main()
