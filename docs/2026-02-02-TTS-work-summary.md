# 2026-02-02 — ElderTree Qwen3-TTS voice cloning (summary)

**Notion page:** https://www.notion.so/2feebf51139e8134b917c59b1cfaa0e4

---

## Summary

Work on **Qwen3-TTS voice cloning** for ElderTree blog audio: fixed noisy output, short-reference pipeline, EKS GPU workflow, and local smoke test.

---

## Root cause of noise

- Qwen3-TTS expects **~3 seconds** of reference audio for voice cloning.
- We were using a **4+ minute** reference; long ref produces noisy/unusable output.
- **Fix:** Use a short reference clip (3–10 s) and a transcript that matches only that clip.

---

## What was done

### 1. Short reference

- **voice_ref_short.wav** — First 6 seconds of voice_sample.wav (ffmpeg extract).
- **voice_ref_transcript.txt** — Transcript for that clip only: *"The eldertree cluster didn't start as a grand plan—it began with a simple need."*

### 2. EKS generation script

- **generate_gpu_fixed.py** — Uses short ref by default; reads env: `X_VECTOR_ONLY`, `TTS_OUTPUT_PATH`, `TTS_VOICE_REF`, `TTS_VOICE_REF_TRANSCRIPT`, `TTS_MODEL_PATH`.
- If output still noisy, use `X_VECTOR_ONLY=1` (speaker embedding only, no ICL).

### 3. EKS runbooks

- **run_tts_eks.sh** — Copies voice_ref_short.wav, voice_ref_transcript.txt, generate_gpu_fixed.py to pod; runs generation; copies goldie_demo.wav back. Optional: `X_VECTOR_ONLY=1 ./run_tts_eks.sh default`.
- **setup_eks_tts.sh** — One-time: copies and runs setup_tts.sh in pod (venv, PyTorch CUDA, qwen-tts, model download).

### 4. Local smoke test

- **tts_smoke_test.py** — Short sentence with short ref; validates clean audio locally (slow on Mac MPS).
- Ran successfully: ~97 s, output `~/tts_smoke_test.wav`.

### 5. Docs

- **pi-fleet-blog/docs/AUDIO_SYSTEM.md** — Appendix: experimental Qwen3-TTS (short ref, EKS workflow, x_vector_only).
- **~/QWEN_TTS_README.md** — Full workflow: files, EKS steps, env vars, smoke test, how to recreate short ref.

---

## Files (all in ~)

| File | Purpose |
|------|--------|
| voice_ref_short.wav | 6 s reference clip |
| voice_ref_transcript.txt | Transcript for that clip |
| generate_gpu_fixed.py | EKS generation script |
| run_tts_eks.sh | Copy + run + copy output |
| setup_eks_tts.sh | One-time pod setup |
| tts_smoke_test.py | Local smoke test |
| QWEN_TTS_README.md | Workflow readme |

---

## EKS flow (next time)

1. VPN on → create pod (`kubectl apply -f qwen-tts-pod.yaml`) if needed.
2. One-time: `./setup_eks_tts.sh default`.
3. Generate: `./run_tts_eks.sh default` → `~/goldie_demo.wav`.
4. If noisy: `X_VECTOR_ONLY=1 ./run_tts_eks.sh default`.

---

## Context

- Cannot use external TTS service until tomorrow; improved local/EKS model in the meantime.
- ElderTree policy remains human-voice-only; this is documented as experimental in AUDIO_SYSTEM.md.
