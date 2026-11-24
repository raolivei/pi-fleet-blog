#!/usr/bin/env node
/**
 * Export the chapters marked with `portfolio: <rank>` to .vitepress/dist/stories.json.
 *
 * Other sites (raolivei.me) read this feed instead of keeping their own copy of
 * chapter titles, URLs and summaries. Run after `npm run build`.
 *
 * Fails when a marked chapter has no description or no built page, so a consumer
 * never receives an empty summary or a link to a page that does not exist.
 */
import { readdir, readFile, writeFile, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const BASE_URL = 'https://blog.eldertree.xyz';
const CHAPTERS = 'chapters';
const DIST = '.vitepress/dist';

function frontmatter(source) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(source);
  if (!match) return {};
  const fields = {};
  for (const line of match[1].split('\n')) {
    const field = /^(description|portfolio|tags):\s*(.+)$/.exec(line);
    if (field) fields[field[1]] = JSON.parse(field[2]);
  }
  return fields;
}

function heading(source, slug) {
  const h1 = /^# (.+)$/m.exec(source)?.[1];
  if (!h1) throw new Error(`${slug}: no H1 heading`);
  const chapter = /^Chapter (\d+): (.+)$/.exec(h1);
  if (chapter) return { label: `Chapter ${Number(chapter[1])}`, title: chapter[2] };
  const interlude = /^Interlude: (.+)$/.exec(h1);
  if (interlude) return { label: 'Interlude', title: interlude[1] };
  return { label: 'Story', title: h1 };
}

const errors = [];
const stories = [];
for (const file of (await readdir(CHAPTERS)).filter(f => f.endsWith('.md')).sort()) {
  const slug = file.replace(/\.md$/, '');
  const source = await readFile(`${CHAPTERS}/${file}`, 'utf8');
  const meta = frontmatter(source);
  if (meta.portfolio === undefined) continue;

  if (!Number.isInteger(meta.portfolio) || meta.portfolio < 1) errors.push(`${slug}: portfolio must be a positive integer rank`);
  if (typeof meta.description !== 'string' || meta.description.trim().length < 40) errors.push(`${slug}: marked for the portfolio but has no reviewed description`);
  if (meta.tags !== undefined && !(Array.isArray(meta.tags) && meta.tags.every(t => typeof t === 'string'))) errors.push(`${slug}: tags must be a list of strings`);
  try { await access(`${DIST}/chapters/${slug}.html`); } catch { errors.push(`${slug}: no built page at ${DIST}/chapters/${slug}.html — run the build first`); }

  stories.push({
    slug,
    url: `${BASE_URL}/chapters/${slug}`,
    ...heading(source, slug),
    description: meta.description,
    tags: meta.tags ?? [],
    rank: meta.portfolio,
  });
}

const ranks = stories.map(s => s.rank);
for (const rank of new Set(ranks)) {
  if (ranks.filter(r => r === rank).length > 1) errors.push(`portfolio rank ${rank} is used more than once`);
}
if (stories.length === 0) errors.push('no chapters are marked with portfolio: <rank>');
if (errors.length) {
  console.error(errors.map(e => `✗ ${e}`).join('\n'));
  process.exit(1);
}

stories.sort((a, b) => a.rank - b.rank);
const revision = process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
await writeFile(`${DIST}/stories.json`, JSON.stringify({ revision, source: `${BASE_URL}/stories.json`, stories }, null, 2) + '\n');
console.log(`Wrote ${DIST}/stories.json with ${stories.length} stories:`);
for (const s of stories) console.log(`  ${s.rank}. ${s.label} — ${s.title}`);
