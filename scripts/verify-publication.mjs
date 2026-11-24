import { writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const value = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
if (args.includes('--write-manifest')) {
  const revision = process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  await writeFile('.vitepress/dist/publication.json', JSON.stringify({ revision }) + '\n');
} else {
  const base = value('--base-url', 'https://blog.eldertree.xyz').replace(/\/$/, '');
  const revision = value('--expected-revision', process.env.GITHUB_SHA);
  if (!revision) throw new Error('Supply --expected-revision so an older deployment cannot pass.');
  const attempts = Number(value('--attempts', '1'));
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 12) throw new Error('Attempts must be 1–12.');
  const pages = [
    ['07-watching-it-all', 'Watching It All'],
    ['14-the-ticket-was-real', 'The Ticket Was Real. The CI Failure Wasn'],
  ];
  async function get(path) {
    const response = await fetch(`${base}/${path}?publication=${encodeURIComponent(revision)}`, { signal: AbortSignal.timeout(15000), cache: 'no-store' });
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return response.text();
  }
  function assert(condition, message) { if (!condition) throw new Error(message); }
  async function verify() {
    const deployed = JSON.parse(await get('publication.json'));
    assert(deployed.revision === revision, `Expected ${revision}; deployed ${deployed.revision}`);
    const feed = JSON.parse(await get('stories.json'));
    assert(feed.revision === revision, `stories.json: expected ${revision}; deployed ${feed.revision}`);
    assert(Array.isArray(feed.stories) && feed.stories.length > 0, 'stories.json: no stories');
    for (const story of feed.stories) {
      assert(story.url?.startsWith('https://blog.eldertree.xyz/chapters/') && story.description, `stories.json: incomplete entry ${story.slug}`);
    }
    console.log(`Verified stories.json (${feed.stories.length} stories)`);
    for (const [slug, title] of pages) {
      const path = `chapters/${slug}`;
      const html = await get(path);
      assert(/<h1[\s>]/.test(html) && html.includes(title), `${path}: article heading missing`);
      const tags = [...html.matchAll(/<meta\s[^>]*>/g)].map(m => m[0]);
      const meta = property => tags.filter(t => t.includes(`property="${property}"`));
      for (const property of ['og:title', 'og:description', 'og:image', 'og:type', 'og:url']) {
        assert(meta(property).length === 1, `${path}: expected one ${property}`);
      }
      assert(meta('og:title')[0].includes(title), `${path}: incorrect social title`);
      assert(meta('og:type')[0].includes('content="article"'), `${path}: incorrect social type`);
      assert(meta('og:url')[0].includes(`https://blog.eldertree.xyz/${path}`), `${path}: incorrect sharing URL`);
      for (const url of ['https://blog.eldertree.xyz/', 'https://docs.eldertree.xyz/', 'https://control.eldertree.xyz/']) {
        assert(html.includes(`href="${url}"`), `${path}: missing ecosystem link ${url}`);
      }
      const image = /content="([^"]+)"/.exec(meta('og:image')[0])?.[1];
      assert(image?.startsWith('https://blog.eldertree.xyz/'), `${path}: unexpected social image`);
      const response = await fetch(image, { signal: AbortSignal.timeout(15000) });
      assert(response.ok && response.headers.get('content-type')?.startsWith('image/'), `${path}: social image unavailable`);
      await response.arrayBuffer();
      console.log(`Verified ${path}`);
    }
    console.log(`Publication verified at ${revision}. Ready for human review of the LinkedIn drafts; no posting performed.`);
  }
  for (let attempt = 1; ; attempt++) {
    try { await verify(); break; }
    catch (error) {
      if (attempt >= attempts) throw error;
      console.log(`Attempt ${attempt}: ${error.message}; retrying in 10 seconds.`);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}
