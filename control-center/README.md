# Eldertree Control Center (local dev)

Premium ops-style dashboard — separate from the narrative VitePress blog (port 5173).

## Run

```bash
# From pi-fleet-blog root
npm run dev:control-center

# Or from this directory
cd control-center && npm install && npm run dev
```

Open **http://localhost:5174**

## GitHub stats (optional)

```bash
cp .env.example .env
# Add a classic PAT or fine-grained token with repo read
export GITHUB_TOKEN=ghp_...
```

Defaults: `GITHUB_OWNER=raolivei`, `GITHUB_REPO=pi-fleet`. Without a token, mock stats are returned.

## Live cluster nodes

Tries, in order:

1. `VITE_ELDER_API` (default `https://elder.eldertree.local/api/public/cluster/nodes`)
2. `/cluster-status.json` (proxied to blog dev server on 5173 when both run)
3. Static three-node fallback

## Incidents

Markdown under `content/issues/` with frontmatter — loaded at build time via `import.meta.glob`.

## Not deployed

This is a local experiment. Production blog stays narrative at https://blog.eldertree.xyz.
