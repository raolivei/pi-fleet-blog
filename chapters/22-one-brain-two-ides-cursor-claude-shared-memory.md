# Chapter 22: One Brain, Two IDEs — Sharing Memory, Rules, and Skills Between Cursor and Claude Code

_How I stopped re-explaining my homelab to every new chat window_

## The problem nobody warns you about

I run **Cursor** for fast inline edits and **Claude Code** for longer terminal-heavy sessions. Both are excellent. Both forget everything when you close the tab unless you engineer continuity yourself.

For a while I had:

- Preferences living in Cursor rules that Claude never saw
- Claude Code memories in `~/.claude/projects/.../memory` that Cursor never saw
- A “routing onboarding” skill I wrote in `.cursor/skills/` that vanished the moment I switched tools
- The same agent introducing itself as “Claude” in one window and vaguely knowing my stack in another

That is not a workflow. That is **two interns who do not share notes**.

Homelab work makes it worse. Eldertree is twenty-five repos, Flux manifests, Pi-hole, Caddy, Tailscale, and a personal rule that every new `*.eldertree.local` service needs four layers of routing before it works on my Mac. If I teach that once in Cursor and open Claude Code an hour later, I should not have to teach it again.

## The goal

One assistant identity — **Ollie** — with:

| Shared | What it is |
|--------|------------|
| **Memory** | Preferences, project state, session handoff |
| **Rules** | Persona, mandatory workflows |
| **Skills / playbooks** | Step-by-step procedures (e.g. “onboard a new LAN service end-to-end”) |

Cursor and Claude Code are different products with different extension points. You cannot literally share a `.cursor/skills` folder with Claude. You **can** share **git-tracked markdown** and a **symlink**, and copy Cursor-native files from a canonical template. That is the workaround — and it works.

## Architecture (three layers)

```text
┌─────────────────┐     ┌─────────────────┐
│     Cursor      │     │  Claude Code    │
│  AGENTS.md      │     │  AGENTS.md      │
│  .cursor/rules  │     │  ~/.claude/...  │
│  .cursor/skills │     │  /memory → symlink
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
            ollie/memory/              ← git (feedback, HANDOFF, projects)
            ollie/docs/agent-playbooks/ ← git (procedures both tools read)
            workspace-config/          ← git (canonical rules/skills templates)
```

### Layer 1 — Memory (`ollie/memory/`)

**Single folder, both tools.** Files are plain markdown in the [ollie](https://github.com/raolivei/ollie) repo:

| File | Role |
|------|------|
| `MEMORY.md` | Index — what exists and where |
| `HANDOFF.md` | **Session bridge** — update when switching Cursor ↔ Claude |
| `user_ollie_persona.md` | “You are Ollie, not generic Claude” |
| `feedback_*.md` | Hard rules (“never commit secrets”, “mandatory routing e2e”) |
| `project_*.md` | Active project state (open PRs, blockers) |

**Cursor** reads this via `AGENTS.md` and the always-on persona rule.

**Claude Code** reads the **same files** via a symlink:

```bash
~/.claude/projects/-Users-roliveira-WORKSPACE-raolivei/memory
  → ~/WORKSPACE/raolivei/ollie/memory
```

The link script [`ollie/scripts/link-claude-memory.sh`](https://github.com/raolivei/ollie/blob/main/scripts/link-claude-memory.sh) creates that symlink. If you already had Claude memories in the old folder, it backs them up and **rsyncs** into `ollie/memory/` so nothing is lost — that rsync line is the quiet hero of the migration.

Memories are **git-tracked**. Pull on another Mac, re-run link, done.

### Layer 2 — Playbooks (`ollie/docs/agent-playbooks/`)

Cursor has **Skills** (`.cursor/skills/*/SKILL.md`). Claude Code does not load those paths.

So procedures that must work in **both** tools live as ordinary markdown in the ollie repo, for example:

- [eldertree-service-routing.md](https://github.com/raolivei/ollie/blob/main/docs/agent-playbooks/eldertree-service-routing.md) — registry + Ingress + hosts + Caddy + verify scripts
- [eldertree-control-center.md](https://github.com/raolivei/ollie/blob/main/docs/agent-playbooks/eldertree-control-center.md)

Both tools are pointed at these files from **`AGENTS.md`** at the workspace root and from **`feedback_*.md`** in memory. Cursor **also** gets skill copies under `.cursor/skills/` (for auto-invocation). Claude reads the playbook path directly. Same content, two loaders.

This is the pattern I wish I had from day one: **git markdown = source of truth; Cursor skills = optional mirror.**

### Layer 3 — Cursor rules & skills (from `workspace-config/`)

Cursor-specific files live in [workspace-config](https://github.com/raolivei/workspace-config):

```text
workspace-config/
├── templates/AGENTS.md           → copied to monorepo root
├── cursor/rules/*.mdc            → copied to .cursor/rules/
└── cursor/skills/*/SKILL.md      → copied to .cursor/skills/
```

The monorepo root (`~/WORKSPACE/raolivei`) is **not** one git repo — it is a folder of clones. So `AGENTS.md` and `.cursor/` at the root are **installed artifacts**, not something you commit at the root. Canonical copies live in **`workspace-config`** and **`ollie`**.

One command installs everything:

```bash
cd ~/WORKSPACE/raolivei/workspace-config
./scripts/setup-ollie-workspace.sh
```

Expected output includes:

```text
Already linked: .../memory -> .../ollie/memory
Ollie workspace ready:
  .../AGENTS.md
  .../.cursor/rules/ (4 rules)
  .../.cursor/skills/ (mirrors ollie/docs/agent-playbooks/)
```

Re-run after `git pull` in `workspace-config` or when rules feel stale.

## Identity: Ollie, not “generic Claude”

In the raolivei workspace the assistant is **Ollie** — one name, one scope (canopy, pi-fleet, elder, blogs, infra, all of it). That lives in `user_ollie_persona.md` and the always-on Cursor rule so you do not get a fresh “I’m Claude, how can I help?” every session.

If you use multiple workspaces or employers, give each its own memory folder and persona file. Same pattern; different paths.

## Daily workflow

### Starting a session

1. Open **`RAOLIVEI.code-workspace`** or the **`raolivei` folder root** — not `ollie/` alone (Claude’s memory path is tied to the full workspace path).
2. Ask the agent to read `ollie/memory/HANDOFF.md`.
3. For doc search across repos: `cd ollie && make index` (RAG — separate from memory files).

### Switching Cursor ↔ Claude mid-task

This is the whole point of `HANDOFF.md`:

1. Before you leave: edit `HANDOFF.md` — what you were doing, blockers, next steps.
2. Open the other tool (same workspace root).
3. Say: *“Read HANDOFF and continue.”*

No paste wars. No “as I mentioned in the previous chat…”

### Adding a new mandatory procedure

1. Write the playbook in `ollie/docs/agent-playbooks/your-thing.md`.
2. Add a short `feedback_*.md` or bullet in `MEMORY.md` if it is a hard rule.
3. Mirror to `workspace-config/cursor/skills/your-thing/SKILL.md` if Cursor should auto-invoke.
4. Add a rule in `workspace-config/cursor/rules/` if file globs should trigger it.
5. Run `setup-ollie-workspace.sh`.
6. Commit **`ollie`** and **`workspace-config`**. Pull on other machines; re-run setup.

## Real example: why this mattered for Eldertree routing

I wrote a whole routing onboarding flow — registry YAML, verify scripts, Caddy blocks — and initially put the agent instructions **only** in `.cursor/skills/` at the monorepo root.

Cursor knew. Claude did not. I switched to Claude Code to reconcile Flux, re-explained the same four-layer routing stack, broke a different layer, fixed it, switched back to Cursor, and… the skill was there but **memory of what we had already verified** was not shared unless I had updated `HANDOFF.md`.

The fix:

- **`feedback_eldertree_service_routing_e2e.md`** in memory (both tools)
- **`eldertree-service-routing.md`** playbook (both tools)
- Skill mirror + file-triggered rule (Cursor only)
- Verify scripts in pi-fleet (human and agent run the same checks)

Now either tool onboarding a new `swimto.eldertree.local`-style hostname hits the same checklist. That is the workaround in one sentence: **shared git markdown + symlink + template copy.**

## What is *not* shared (on purpose)

| Thing | Notes |
|-------|--------|
| **RAG / Chroma index** | Local to Ollie; `make index` on each machine |
| **Cursor-only UI** | Composer vs Claude Code terminal UX |
| **Secrets** | Never in memory — Vault only |
| **Other workspaces** | Use a separate memory path and persona per workspace — same pattern, different folder |

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Agent says “I’m Claude” with no context | Run `setup-ollie-workspace.sh`; open workspace **root** |
| Claude has no memories | `readlink ~/.claude/projects/-Users-roliveira-WORKSPACE-raolivei/memory` → should point at `ollie/memory` |
| Cursor rules out of date | `setup-ollie-workspace.sh` after pulling `workspace-config` |
| Playbook missing in Claude | It is in `ollie` git — `git pull` in `ollie/`, not in monorepo root |
| Stale session | Read/update `HANDOFF.md` |

Verify symlink:

```bash
readlink ~/.claude/projects/-Users-roliveira-WORKSPACE-raolivei/memory
# → /Users/you/WORKSPACE/raolivei/ollie/memory
```

Smoke test in **either** tool:

> Who are you? Read `ollie/memory/HANDOFF.md` and summarize.

Expect **Ollie**, current task, and blockers — not a generic intro.

## Where to read more (canonical docs)

| Doc | Location |
|-----|----------|
| Full setup guide | [workspace-config — OLLIE_WORKSPACE_SETUP.md](https://github.com/raolivei/workspace-config/blob/main/docs/OLLIE_WORKSPACE_SETUP.md) |
| Eldertree copy | [docs.eldertree.xyz — Ollie workspace setup](https://docs.eldertree.xyz/guides/ollie-workspace-setup) |
| Memory layout | [ollie/memory/README.md](https://github.com/raolivei/ollie/blob/main/memory/README.md) |
| Playbooks index | [ollie/docs/agent-playbooks/](https://github.com/raolivei/ollie/tree/main/docs/agent-playbooks) |

## Takeaways

1. **Two IDEs do not share context by default** — you design a bridge or you repeat yourself forever.
2. **Git markdown + symlink** is the portable layer both tools can read.
3. **Cursor skills/rules** are installed from templates; do not treat monorepo-root `.cursor/` as source of truth.
4. **`HANDOFF.md`** is the session wire between tools — use it every time you switch.
5. **Name your assistant** (Ollie) and scope it (raolivei org) so identity survives the model brand.

If you run Cursor and Claude Code on the same codebase, you do not need two brains. You need one folder of memories, one folder of playbooks, one setup script, and the discipline to update `HANDOFF.md` when you change windows.

Related: [Chapter 19 — AI Infrastructure on Eldertree](/chapters/19-ai-infrastructure) · [Chapter 21 — The Control Center](/chapters/21-the-control-center-because-i-needed-to-know-from-afar)
