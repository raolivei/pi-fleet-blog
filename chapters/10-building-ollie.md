# Chapter 10: Building Ollie

By March 2026, the Eldertree cluster was running smoothly. Applications deployed via GitOps. Monitoring caught issues before users noticed. Secrets lived in Vault. The infrastructure was solid.

But I had a problem: **I couldn't remember how anything worked.**

Not the big stuff—I knew how to deploy apps, debug pods, check metrics. But the small details? "What path did I put that Cloudflare token in Vault?" "Which Grafana dashboard shows Traefik latency?" "What was the fix for that DNS issue three months ago?" "Where's the runbook entry for Pi-hole troubleshooting?"

I'd documented everything. README files, runbooks, changelogs, commit messages. The information existed. But finding it required searching through 15+ repositories, multiple doc sites, and my own memory of "I think I wrote about this somewhere."

That's when I decided: the cluster needs a brain. Something that knows the entire codebase. Something that can answer questions like "How do I unseal Vault?" or "Show me the Traefik metrics dashboard" without me having to grep through repos.

I needed an AI assistant. Not a generic ChatGPT session. A specialized assistant trained on my workspace, my conventions, my infrastructure.

I needed Ollie.

## The Vision

Ollie is a personal AI assistant for the raolivei workspace. It indexes all documentation, code, and runbooks from ~25 repositories. You ask it a question about the infrastructure, and it answers with context from the actual docs.

Example queries:
- "How do I deploy Canopy?"
- "What's the Vault unseal process?"
- "Show me the Grafana dashboard for Traefik"
- "Where are the Cloudflare credentials stored?"
- "What was the fix for Pi-hole DNS resolution?"

It's RAG (Retrieval-Augmented Generation): find relevant documentation, pass it to an LLM as context, generate an answer grounded in actual project docs.

But Ollie needed to be more than a chatbot. It needed to be a workspace assistant: integrated with my editor (Cursor), my CLI (Claude Code), and the cluster itself (running on Eldertree).

## The Architecture

Ollie has three components:

**Indexing** — Crawls all workspace repositories, extracts documentation (README, CLAUDE.md, runbooks, changelogs), and stores embeddings in ChromaDB. This happens locally (not in the cluster) because it needs access to all repos.

**API** — FastAPI service that handles queries. Takes a question, retrieves relevant docs from ChromaDB, sends them to an LLM (Gemini, Groq, or Ollama), and returns the answer.

**UI** — Simple Streamlit interface for interactive chat. Useful for quick questions when I don't want to switch to an editor.

The stack:
- **FastAPI** (API layer)
- **ChromaDB** (vector database for embeddings)
- **Ollama** (local LLM, runs on my Mac via Tailscale)
- **Gemini** (cloud LLM, fast and capable)
- **Groq** (cloud LLM, backup)
- **Streamlit** (UI)
- **React** (future Control Center integration)

Ollie runs in two modes:
1. **Local dev** — On my laptop for indexing and testing (UI :3000, API :8765)
2. **Cluster** — Deployed to Eldertree for 24/7 availability (port-forward when needed)

## The Multi-Provider LLM Strategy

One lesson from building infrastructure: redundancy matters. If your primary provider goes down or rate-limits you, you need a fallback.

Ollie uses three LLM providers:

**Gemini (primary)** — Google's Gemini Pro. Fast, capable, generous free tier. Handles most queries.

**Groq (fallback)** — Fast inference on Llama models. Kicks in if Gemini is down or rate-limited.

**Ollama (local fallback)** — Runs on my M4 Mac, reachable via Tailscale. Offline capability. Slower but reliable.

The API tries providers in order: Gemini → Groq → Ollama. If one fails, it automatically falls back to the next. No manual intervention.

API keys for Gemini and Groq live in Vault (`secret/openclaw/gemini`, `secret/openclaw/groq`). External Secrets syncs them to Kubernetes. The Ollama endpoint is just a URL (`http://100.x.x.x:11434` on the Tailnet).

For critical questions, Ollie can use **Grove's best-of-three orchestration**: query all three providers in parallel, use an LLM as a judge to pick the best answer, return that. More expensive (3x the API calls), but higher quality. Useful for documentation generation or complex troubleshooting.

## The Memory System: One Brain, Two IDEs

Here's where it gets interesting. I use two development tools: **Cursor** (AI-powered editor) and **Claude Code** (terminal-based Claude agent). Both are great. Both need context about my workspace. But they don't share memory by default.

Cursor loads context from `.cursor/rules/` and memory files you specify.  
Claude Code loads context from `~/.claude/projects/<project>/memory/`.  

The problem: maintaining two separate memory systems is a nightmare. You update a convention in Cursor, forget to update it in Claude Code, and now your AI assistants give you conflicting advice.

The solution: **one shared memory folder, two symlinks**.

I created `ollie/memory/` as the canonical memory location. It holds:

- `MEMORY.md` — Index of all memories
- `HANDOFF.md` — Cross-tool session bridge (update when switching Cursor ↔ Claude)
- `user_ollie_persona.md` — Ollie's identity and tone
- `project_*.md` — Active project state and conventions
- `workspace_*.md` — Workspace-wide patterns (Git workflow, testing standards, K8s conventions)

Then I symlinked it:

**Cursor**: Load `AGENTS.md` + `.cursor/rules/ollie-persona.mdc` (which includes memory files)  
**Claude Code**: Symlink `~/.claude/projects/-Users-roliveira-WORKSPACE-raolivei/memory` → `ollie/memory/`  

Now both tools read from the same memory folder. One update, both IDEs get it. No drift. No conflicts. Just shared context.

The `HANDOFF.md` file acts as a session bridge: when I switch from Cursor to Claude Code (or vice versa), I update HANDOFF with the current state ("working on SwimTO login flow, fixed OAuth redirect, next: test error handling"). The next tool picks up where the other left off.

It's like passing notes between two versions of yourself working in parallel.

## The OpenClaw Companion

While building Ollie (the workspace assistant), I also deployed **OpenClaw** (the cluster agent) to Eldertree. OpenClaw is a Telegram bot that provides cluster ops, code review, and GitHub actions—basically, an AI assistant that lives on the cluster and can interact with it directly.

OpenClaw uses the same multi-provider LLM setup as Ollie. Same Vault secrets, same fallback chain, same Grove orchestration for best-of-three answers.

The difference: Ollie knows your workspace and answers documentation questions. OpenClaw can actually operate on the cluster (check pod status, review code, trigger deployments).

They're complementary. Ollie is the reference librarian. OpenClaw is the operator on call.

## The Indexing Workflow

Here's how Ollie stays up to date:

1. **Index workspace** — Run `cd ollie && make index` to crawl all repos and update ChromaDB
2. **Commit memory updates** — Update `ollie/memory/*.md` files when conventions change
3. **Redeploy if needed** — If API changes, push to GitHub, CI/CD rebuilds image, FluxCD deploys

The indexing happens locally (my laptop has access to all repos, including private ones). The ChromaDB database gets packaged into the Docker image and deployed to the cluster. When Ollie API receives a query, it searches the pre-indexed docs.

Reindexing is manual (for now). I run `make index` after major doc changes. Future work: automate reindexing on a schedule or trigger it from a webhook.

## The Moment It Worked

The first time I asked Ollie "How do I unseal Vault?" and it replied with the exact command from the runbook—`./scripts/operations/unseal-vault.sh`—plus context about why Vault seals and when it happens, I felt vindicated.

I didn't have to search. I didn't have to remember. I just asked. And it knew.

That's the value of RAG: it's not guessing based on general knowledge. It's retrieving the exact documentation I wrote, the conventions I use, the runbooks I maintain. It's my second brain, trained on my infrastructure.

## The Lessons

Here's what building Ollie taught me:

**RAG is more reliable than pure LLM queries.** ChatGPT might hallucinate a plausible-sounding answer. Ollie retrieves actual docs and grounds the answer in them. If it doesn't know, it says so.

**Multi-provider redundancy is worth it.** Gemini is great until it rate-limits you. Groq is fast until it's down. Ollama is always available but slower. Having all three means Ollie always works.

**One memory, many tools is the right model.** Maintaining separate memory systems is unsustainable. Shared memory + symlinks = single source of truth.

**Indexing needs to be easy.** If reindexing is a pain, you won't do it, and Ollie will fall out of date. `make index` is one command. That's sustainable.

**AI assistants are multiplicative, not additive.** You don't save 10 minutes searching. You save 10 minutes *every time* you need that information. Over a month, that's hours. Over a year, that's days.

**Local LLM fallback is underrated.** Ollama on my Mac means Ollie works even when internet is down or APIs are rate-limited. It's slower, but reliable.

**The cluster is a deployment target, not the indexing location.** Indexing requires access to all repos (including private ones). That happens on my laptop. The API + ChromaDB deploy to the cluster for 24/7 availability.

## The Vision Forward

Ollie is version 0.4 right now. Here's what's next:

**Control Center integration** — A web UI on the cluster that ties together Grafana, Prometheus, Ollie chat, and cluster topology. One place for all operations.

**Proactive suggestions** — Instead of just answering questions, Ollie could suggest improvements: "Your SwimTO database hasn't been backed up in 7 days" or "Traefik latency is higher than usual."

**Self-upgrade capability** — OpenClaw has a META endpoint that triggers image rebuilds via GitHub Actions. Ollie could upgrade itself when new features are ready.

**Voice interface** — Integration with Qwen3-TTS (voice cloning) for audio interactions. Ask Ollie questions while cooking or away from the keyboard.

But even at v0.4, Ollie is useful. I use it daily. It answers questions faster than I can search. It knows the codebase better than I remember it. It's the assistant I wish I'd built six months ago.

The cluster has a brain now. And that brain has memory. And that memory is shared across tools. And it all just works.

That's the dream, isn't it? Build infrastructure so good that you forget it exists. Build assistants so helpful that you wonder how you worked without them.

Ollie is that assistant. And the cluster is that infrastructure.

---

*Next: [Chapter 11: The Control Center](/chapters/11-the-control-center) - When observability, AI, and topology meet in one interface.*
