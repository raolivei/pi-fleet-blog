import { BookOpen, ExternalLink, Radio } from "lucide-react";

const LINKS = [
  { href: "https://docs.eldertree.local", label: "Eldertree runbook", icon: BookOpen },
  { href: "https://blog.eldertree.local", label: "Infrastructure blog", icon: Radio },
  { href: "https://github.com/raolivei/pi-fleet", label: "pi-fleet on GitHub", icon: ExternalLink },
];

export function DocumentationPanel() {
  return (
    <section className="panel docs-panel" aria-label="Documentation">
      <h2 className="panel-title">Documentation</h2>
      <ul className="docs-list">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <a href={href} target="_blank" rel="noreferrer">
              <Icon size={18} />
              <span>{label}</span>
              <ExternalLink size={14} className="docs-external" />
            </a>
          </li>
        ))}
      </ul>
      <p className="docs-note">
        This control center is a local dev preview — separate from the narrative blog at port 5173.
      </p>
    </section>
  );
}
