#!/usr/bin/env node
/**
 * Export journey metrics from pi-fleet git history → data/journey-stats.json
 */
import { execSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const blogRoot = join(__dirname, "..");
const piFleetRoot =
  process.env.PI_FLEET_ROOT || join(blogRoot, "..", "pi-fleet");
const outPath = join(blogRoot, "data", "journey-stats.json");

if (!existsSync(join(piFleetRoot, ".git"))) {
  if (existsSync(outPath)) {
    console.warn(
      `pi-fleet not found at ${piFleetRoot}; keeping existing ${outPath}`,
    );
    process.exit(0);
  }
  console.error(`pi-fleet not found and no ${outPath} to use`);
  process.exit(1);
}

function git(cmd) {
  return execSync(cmd, { cwd: piFleetRoot, encoding: "utf8" }).trim();
}

function extractPr(text) {
  const m = text.match(/#(\d+)/);
  return m ? m[1] : null;
}

function isProblem(text) {
  return /fix|broken|issue|problem|error|bug|crash|fail/i.test(text);
}

function isFeature(subject, category) {
  if (category === "feature") return true;
  return /^(feat|add|implement|create|setup|deploy|enable)/i.test(subject);
}

const subjects = git("git log --format=%s --all").split("\n").filter(Boolean);
const prText = git('git log --format="%s %b" --all');

let problemsSolved = 0;
let featuresAdded = 0;
const prSet = new Set();

for (const m of prText.matchAll(/#(\d+)/g)) {
  prSet.add(m[1]);
}

for (const subject of subjects) {
  if (isProblem(subject)) problemsSolved += 1;
  let category = "other";
  if (/^feat(\(|:)/i.test(subject)) category = "feature";
  if (isFeature(subject, category)) featuresAdded += 1;
}

const commits = parseInt(git("git rev-list --count HEAD"), 10);

const out = {
  repo: "pi-fleet",
  repoPath: piFleetRoot,
  generatedAt: new Date().toISOString(),
  commits,
  pullRequests: prSet.size,
  problemsSolved,
  featuresAdded,
  methodology: {
    problems:
      "Commits whose subject/body match fix|broken|issue|problem|error|bug|crash|fail (heuristic).",
    features: "feat: commits plus add|implement|create|setup|deploy|enable in subject.",
    chapter: "/chapters/01-the-moment-i-decided-to-own-my-infrastructure",
  },
};

writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");
console.log(
  `Wrote journey stats (${commits} commits, ${problemsSolved} fix commits) → ${outPath}`,
);
