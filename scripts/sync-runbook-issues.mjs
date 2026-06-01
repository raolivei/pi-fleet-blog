#!/usr/bin/env node
/**
 * Parse eldertree-docs runbook issue frontmatter → data/runbook-issues.json
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const blogRoot = join(__dirname, "..");
const issuesRoot = join(blogRoot, "..", "eldertree-docs", "runbook", "issues");
const outPath = join(blogRoot, "data", "runbook-issues.json");
const docsBase = "https://docs.eldertree.xyz/runbook/issues";

if (!existsSync(issuesRoot)) {
  if (existsSync(outPath)) {
    console.warn(
      `eldertree-docs not found at ${issuesRoot}; keeping existing ${outPath}`,
    );
    process.exit(0);
  }
  console.error(`eldertree-docs not found and no ${outPath} to use`);
  process.exit(1);
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const fm = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (!m) continue;
    const [, key, raw] = m;
    if (raw.startsWith("[") && raw.endsWith("]")) {
      fm[key] = raw
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      fm[key] = raw.replace(/^["']|["']$/g, "");
    }
  }
  return fm;
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) walk(p, files);
    else if (name.name.endsWith(".md")) files.push(p);
  }
  return files;
}

const issues = [];
for (const file of walk(issuesRoot)) {
  const rel = file.slice(issuesRoot.length + 1);
  const category = rel.split("/")[0];
  const id = rel.replace(/\.md$/, "").split("/").pop();
  const content = readFileSync(file, "utf8");
  const fm = parseFrontmatter(content);
  const titleMatch = content.match(/^#\s+[^:]+:\s*(.+)$/m);
  issues.push({
    id: fm.id || id,
    title: fm.title || titleMatch?.[1]?.trim() || id,
    category: fm.category || category,
    severity: fm.severity || "medium",
    symptoms: Array.isArray(fm.symptoms) ? fm.symptoms : [],
    url: `${docsBase}/${category}/${fm.id || id}`,
  });
}

issues.sort((a, b) => a.id.localeCompare(b.id));

const out = {
  generatedAt: new Date().toISOString(),
  count: issues.length,
  issues,
};

writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${issues.length} runbook issues → ${outPath}`);
