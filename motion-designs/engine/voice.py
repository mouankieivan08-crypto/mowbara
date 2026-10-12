#!/usr/bin/env python3
"""
Voix off : synthèse vocale française (Kokoro, licence Apache 2.0), calage de
chaque phrase sur sa scène, puis mixage avec la bande-son (la musique baisse
automatiquement sous la voix).

    python3 engine/voice.py output/<nom>.audio.json output/<nom>.wav output/<nom>-voixoff.wav

Le JSON (écrit par engine/render.cjs) contient `voice` :
  voice.voice  : voix Kokoro (ff_siwis = voix féminine française)
  voice.speed  : débit de base
  voice.lines  : [[t, texte, durée_max, débit_optionnel], ...]
Dans le texte, [mot](phonèmes) impose une prononciation (noms de marque).

Dépendances : numpy, scipy, soundfile, kokoro-onnx + fichiers du modèle
(kokoro-v1.0.onnx et voices-v1.0.bin) dans $KOKORO_DIR (défaut : engine/models).
Option : --check transcrit chaque phrase (Whisper via sherpa-onnx, $WHISPER_DIR) pour vérifier qu'elle est intelligible.
"""
import json
import os
import re
import sys

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

SR = 44100
HERE = os.path.dirname(os.path.abspath(__file__))
MODELS = os.environ.get("KOKORO_DIR", os.path.join(HERE, "models"))


def load_kokoro():
    from kokoro_onnx import Kokoro

    return Kokoro(os.path.join(MODELS, "kokoro-v1.0.onnx"), os.path.join(MODELS, "voices-v1.0.bin"))


def to_phonemes(k, text):
    """Phonétise le texte en français ; les segments [mot](phonèmes) sont pris tels quels."""
    out = []
    pos = 0
    for m in re.finditer(r"\[([^\]]+)\]\(([^)]+)\)", text):
        if m.start() > pos:
            out.append(k.tokenizer.phonemize(text[pos:m.start()], "fr-fr"))
        out.append(m.group(2))
        pos = m.end()
    if pos < len(text):
        out.append(k.tokenizer.phonemize(text[pos:], "fr-fr"))
    ph = " ".join(s.strip() for s in out if s.strip())
    ph = re.sub(r"\((en|fr)\)", "", ph)  # marqueurs de changement de langue d'espeak
    return re.sub(r"\s+([,.!?…:;])", r"\1", ph)


def synth(k, text, voice, speed):
    s, sr = k.create(to_phonemes(k, text), voice=voice, speed=speed, lang="fr-fr", is_phonemes=True)
    s = resample_poly(s.astype(np.float64), 147, 80) if sr == 24000 else s.astype(np.float64)
    # retire les silences de début/fin
    a = np.abs(s)
    idx = np.where(a > 0.01 * a.max())[0]
    if len(idx):
        s = s[max(0, idx[0] - 200): idx[-1] + 2000]
    return s


def eq(x, points):
    X = np.fft.rfft(x)
    f = np.maximum(np.fft.rfftfreq(len(x), 1 / SR), 10)
    hz, db = zip(*points)
    return np.fft.irfft(X * 10 ** (np.interp(np.log10(f), np.log10(hz), db) / 20), len(x))


def envelope(x, att, rel):
    """Suiveur d'enveloppe (attaque/relâche en secondes), vectorisé par blocs de 10 ms."""
    blk = int(0.01 * SR)
    n = len(x) // blk + 1
    lv = np.array([np.sqrt(np.mean(x[i * blk:(i + 1) * blk] ** 2)) if i * blk < len(x) else 0 for i in range(n)])
    ka, kr = np.exp(-0.01 / att), np.exp(-0.01 / rel)
    env = np.zeros(n)
    e = 0.0
    for i, v in enumerate(lv):
        e = ka * e + (1 - ka) * v if v > e else kr * e + (1 - kr) * v
        env[i] = e
    return np.repeat(env, blk)[: len(x)]


def polish(v):
    """Voix « radio » : passe-haut, présence, compression douce, niveau constant."""
    v = eq(v, [(40, -24), (90, -6), (160, 0), (2500, 1.5), (5000, 3), (9000, 1), (14000, -2)])
    env = envelope(v, 0.005, 0.12)
    thr = np.percentile(env[env > 1e-4], 60)
    gain = np.where(env > thr, (thr / np.maximum(env, 1e-9)) ** 0.5, 1.0)  # ratio ≈ 2:1
    v = v * gain
    return v / (np.sqrt(np.mean(v[np.abs(v) > 1e-4] ** 2)) + 1e-9) * 0.22


def main():
    spec_path, bed_path, out_path = sys.argv[1:4]
    check = "--check" in sys.argv
    spec = json.load(open(spec_path))
    cfg = spec.get("voice") or {}
    lines = cfg.get("lines", [])
    if not lines:
        print("pas de voix off dans la composition")
        return
    bed, sr = sf.read(bed_path, dtype="float64")
    assert sr == SR
    n = len(bed)
    k = load_kokoro()
    voice, base = cfg.get("voice", "ff_siwis"), float(cfg.get("speed", 1.0))
    vo = np.zeros(n)
    report = []
    tmpdir = os.path.join(os.path.dirname(out_path), "voice")
    os.makedirs(tmpdir, exist_ok=True)
    name = os.path.basename(out_path).replace("-voixoff.wav", "")
    for i, line in enumerate(lines):
        t, text, maxd = line[:3]
        speed = base = float(line[3]) if len(line) > 3 else float(cfg.get("speed", 1.0))
        s = synth(k, text, voice, speed)
        d = len(s) / SR
        for _ in range(3):  # accélère juste ce qu'il faut pour tenir dans la scène
            if d <= maxd or speed >= 1.3:
                break
            speed = min(1.3, speed * d / maxd * 1.02)
            s = synth(k, text, voice, speed)
            d = len(s) / SR
        s = polish(s)
        f = os.path.join(tmpdir, f"{name}-{i + 1:02d}.wav")
        sf.write(f, s, SR)
        a = int(t * SR)
        b = min(n, a + len(s))
        vo[a:b] += s[: b - a]
        report.append((t, d, maxd, speed, text, f))

    # Baisse automatique de la musique sous la voix (≈ -11 dB) : la voix passe ~10 dB au-dessus
    env = envelope(vo, 0.03, 0.35)
    env = np.clip(env / (np.percentile(env[env > 1e-4], 50) + 1e-9), 0, 1)
    duck = 1 - 0.72 * env
    bed = bed * duck[:, None]
    mix = bed + vo[:, None] * np.array([0.98, 0.98])[None, :]
    a = np.abs(mix)  # limiteur doux au-delà de 0,8
    mix = np.where(a < 0.8, mix, np.sign(mix) * (0.8 + 0.18 * np.tanh((a - 0.8) / 0.18)))
    sf.write(out_path, mix.astype(np.float32), SR, subtype="PCM_16")

    print(f"voix off → {out_path}")
    for t, d, maxd, speed, text, f in report:
        flag = "  ⚠ trop long" if d > maxd + 0.05 else ""
        plain = re.sub(r"\]\([^)]*\)", "", text).replace("[", "")
        print(f"  {t:5.2f}s  {d:4.2f}/{maxd:.2f}s  x{speed:.2f}  {plain}{flag}")
    if check:
        from asr_check import transcribe

        print("  vérification (transcription automatique) :")
        for t, d, maxd, speed, text, f in report:
            print(f"   {t:5.2f}s  « {transcribe(f)} »")


if __name__ == "__main__":
    main()
