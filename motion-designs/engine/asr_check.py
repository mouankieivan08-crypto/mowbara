"""Transcription automatique (Whisper small, via sherpa-onnx) pour vérifier qu'une voix off est intelligible.
Modèle : sherpa-onnx-whisper-small (GitHub k2-fsa/sherpa-onnx, release « asr-models ») dans $WHISPER_DIR."""
import os

import numpy as np
import sherpa_onnx
import soundfile as sf

D = os.environ.get("WHISPER_DIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "sherpa-onnx-whisper-small"))
_rec = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=os.path.join(D, "small-encoder.int8.onnx"), decoder=os.path.join(D, "small-decoder.int8.onnx"),
    tokens=os.path.join(D, "small-tokens.txt"), language="fr", task="transcribe", num_threads=4)


def transcribe(path):
    x, sr = sf.read(path, dtype="float32")
    if x.ndim > 1:
        x = x.mean(1)
    if sr != 16000:
        n = int(len(x) * 16000 / sr)
        x = np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype("float32")
    pad = np.zeros(8000, dtype="float32")  # 0,5 s de silence : Whisper coupe sinon les derniers mots
    x = np.concatenate([pad, x, pad])
    s = _rec.create_stream()
    s.accept_waveform(16000, x)
    _rec.decode_stream(s)
    return s.result.text.strip()
