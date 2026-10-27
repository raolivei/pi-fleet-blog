# Chapter 19: AI Infrastructure on Eldertree

_Multi-provider LLMs, Grove orchestrator, and self-upgrade_

## Overview

The Eldertree cluster runs **OpenClaw** as the main AI assistant (Telegram + Web UI) and **Grove** as a sidecar for cluster ops, code, and GitHub. Both share a multi-provider LLM setup: Gemini (primary), Groq, and Ollama as fallbacks.

## Why Multi-Provider?

- **Resilience:** If Gemini is down or rate-limited, Groq and Ollama take over
- **Quality:** Grove can query all three in parallel and use a judge to pick the best answer
- **Cost:** Gemini and Groq have free tiers; Ollama runs locally on a Mac

## Architecture

```
Telegram / Web UI → OpenClaw Gateway
                         │
                         ├─► Gemini (primary) ─► Groq (fallback) ─► Ollama (fallback)
                         │
                         └─► Grove (grove_best_answer) ─► parallel: Gemini + Groq + Ollama
                                                         └─► judge picks best
```

**Option A (Resilience):** Normal traffic uses primary; fallbacks kick in on failure.

**Option B (Best-of-Three):** For important questions, `grove_best_answer` queries all three and returns the judged best.

## Ollama on Mac

Ollama cannot run large models on the Pi cluster (8GB ARM64). It runs on an M4 Mac and is reachable from the cluster via Tailscale or LAN. Configure `OLLAMA_BASE_URL` to the Mac's Tailscale IP (e.g. `http://100.x.x.x:11434`).

## Grove Endpoints

- `/api/llm/best-answer` — Best-of-three orchestration
- `/api/llm/providers` — Provider availability
- `/api/meta/upgrade` — Trigger image rebuild (approval required)
- `/api/meta/version` — Current versions

## META Self-Upgrade

Grove can upgrade itself or OpenClaw by triggering GitHub Actions workflows. The user approves via `grove_approve`; FluxCD then deploys the new image.

## Secrets

All API keys live in Vault: `secret/openclaw/gemini`, `secret/openclaw/groq`, `secret/openclaw/ollama`. External Secrets Operator syncs them to Kubernetes.
