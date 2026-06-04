import { parseFrontmatter } from "./frontmatter";

export interface Incident {
  slug: string;
  title: string;
  category: string;
  severity: string;
  resolved: boolean;
  date: string;
  excerpt?: string;
}

const files = import.meta.glob("../../content/issues/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export function getIncidents(): Incident[] {
  return Object.entries(files)
    .map(([path, raw]) => {
      const slug = path.split("/").pop()?.replace(/\.md$/, "") ?? "";
      const { data, content } = parseFrontmatter(raw);
      const excerpt = content.trim().split("\n")[0]?.slice(0, 120);
      return {
        slug,
        title: String(data.title ?? slug),
        category: String(data.category ?? "General"),
        severity: String(data.severity ?? "Medium"),
        resolved: data.resolved === true || data.resolved === "true",
        date: String(data.date ?? ""),
        excerpt,
      };
    })
    .sort((a, b) => (b.date > a.date ? 1 : -1));
}
