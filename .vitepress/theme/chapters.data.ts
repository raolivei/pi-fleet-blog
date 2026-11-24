import { createContentLoader } from "vitepress";

/**
 * Build-time index of published stories, read from each chapter's own frontmatter
 * and heading. Feeds the home page, the chapter log and the chapter meta row, so
 * none of them keeps a hand-maintained list.
 *
 * Skipped: the chapters index, "Moved" redirect stubs and legacy deep-link chapters.
 */

export type ChapterKind = "incident" | "audit" | "build" | "decision";

export interface ChapterEntry {
  slug: string;
  url: string;
  /** "Chapter 12" or "Interlude" */
  label: string;
  /** "12", or "" for interludes */
  number: string;
  title: string;
  description?: string;
  kind?: ChapterKind;
  tags: string[];
  /** portfolio rank; 1–3 are featured */
  rank?: number;
  minutes: number;
}

declare const data: ChapterEntry[];
export { data };

const WORDS_PER_MINUTE = 230;

export default createContentLoader("chapters/*.md", {
  includeSrc: true,
  transform(raw): ChapterEntry[] {
    const entries: ChapterEntry[] = [];
    for (const page of raw) {
      const src = (page.src ?? "").replace(/^---\n[\s\S]*?\n---\n/, "");
      const h1 = /^# (.+)$/m.exec(src)?.[1]?.trim();
      if (!h1 || h1 === "Moved" || /Legacy chapter \(deep link\)/.test(src)) continue;

      const chapter = /^Chapter (\d+): (.+)$/.exec(h1);
      const interlude = /^Interlude: (.+)$/.exec(h1);
      if (!chapter && !interlude) continue;

      const body = src.slice(src.indexOf(h1) + h1.length);
      const words = body.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;
      const fm = page.frontmatter ?? {};

      entries.push({
        slug: page.url.replace(/^\/chapters\//, "").replace(/\.html$/, ""),
        url: page.url,
        label: chapter ? `Chapter ${Number(chapter[1])}` : "Interlude",
        number: chapter ? chapter[1].padStart(2, "0") : "",
        title: chapter ? chapter[2] : interlude![1],
        description: typeof fm.description === "string" ? fm.description : undefined,
        kind: fm.kind,
        tags: Array.isArray(fm.tags) ? fm.tags : [],
        rank: Number.isInteger(fm.portfolio) ? fm.portfolio : undefined,
        minutes: Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)),
      });
    }

    // Newest first: numbered chapters descending, interludes after them.
    return entries.sort((a, b) => {
      if (a.number && b.number) return Number(b.number) - Number(a.number);
      if (a.number) return -1;
      if (b.number) return 1;
      return a.title.localeCompare(b.title);
    });
  },
});
