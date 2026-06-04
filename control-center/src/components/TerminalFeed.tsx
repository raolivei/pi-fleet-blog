import { useEffect, useRef } from "react";

const LINES = [
  "✓ Flux synced in 1.2s",
  "✓ Vault leader elected",
  "✓ Traefik cert renewed",
  "✓ Longhorn volume attached",
  "✓ kube-vip failover tested",
  "✓ Prometheus scrape healthy",
  "✓ Grafana dashboards loaded",
  "✓ cert-manager order valid",
];

export function TerminalFeed() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    const id = setInterval(() => {
      el.scrollTop = el.scrollHeight;
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="panel terminal-panel" aria-label="Terminal activity">
      <h2 className="panel-title">Terminal activity stream</h2>
      <div ref={ref} className="terminal-feed">
        {[...LINES, ...LINES].map((line, i) => (
          <div key={`${line}-${i}`} className="terminal-line">
            {line}
          </div>
        ))}
      </div>
    </section>
  );
}
