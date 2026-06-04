import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import type { IncomingMessage, ServerResponse } from "node:http";

async function githubStatsHandler(
  req: IncomingMessage,
  res: ServerResponse,
  env: Record<string, string>
) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.end("Method not allowed");
    return;
  }

  const token = env.GITHUB_TOKEN;
  const owner = env.GITHUB_OWNER || "raolivei";
  const repo = env.GITHUB_REPO || "pi-fleet";

  if (!token) {
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        mock: true,
        commits: 1240,
        prs: 186,
        issues: 94,
        message: "Set GITHUB_TOKEN in control-center/.env for live stats",
      })
    );
    return;
  }

  const query = `
    query($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        defaultBranchRef {
          target {
            ... on Commit {
              history { totalCount }
            }
          }
        }
        pullRequests(states: MERGED) { totalCount }
        issues(states: CLOSED) { totalCount }
      }
    }`;

  try {
    const gh = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables: { owner, name: repo } }),
    });

    const json = (await gh.json()) as {
      data?: {
        repository?: {
          defaultBranchRef?: { target?: { history?: { totalCount: number } } };
          pullRequests?: { totalCount: number };
          issues?: { totalCount: number };
        };
      };
      errors?: unknown;
    };

    if (json.errors || !json.data?.repository) {
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "GitHub API error", details: json.errors }));
      return;
    }

    const r = json.data.repository;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.end(
      JSON.stringify({
        commits: r.defaultBranchRef?.target?.history?.totalCount ?? 0,
        prs: r.pullRequests?.totalCount ?? 0,
        issues: r.issues?.totalCount ?? 0,
        repo: `${owner}/${repo}`,
      })
    );
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: String(e) }));
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      {
        name: "github-stats-api",
        configureServer(server) {
          server.middlewares.use("/api/github-stats", (req, res) => {
            void githubStatsHandler(req, res, env);
          });
        },
      },
    ],
    server: {
      port: 5174,
      strictPort: true,
      proxy: {
        "/cluster-status.json": {
          target: "http://localhost:5173",
          changeOrigin: true,
          rewrite: () => "/cluster-status.json",
        },
      },
    },
    preview: { port: 5174, strictPort: true },
  };
});
