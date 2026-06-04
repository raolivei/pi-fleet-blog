import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Incident } from "../lib/incidents";

interface IncidentFeedProps {
  incidents: Incident[];
}

export function IncidentFeed({ incidents }: IncidentFeedProps) {
  return (
    <section className="panel incident-panel" aria-label="Incident feed">
      <h2 className="panel-title">Incident feed</h2>
      <ul className="incident-list">
        {incidents.map((inc) => (
          <li key={inc.slug} className="incident-item">
            <div className="incident-icon">
              {inc.resolved ? (
                <CheckCircle2 size={18} className="icon-resolved" />
              ) : (
                <AlertTriangle size={18} className="icon-open" />
              )}
            </div>
            <div className="incident-body">
              <div className="incident-meta">
                <span className={`severity severity-${inc.severity.toLowerCase()}`}>
                  {inc.severity}
                </span>
                <span className="incident-category">{inc.category}</span>
                <time dateTime={inc.date}>{inc.date}</time>
              </div>
              <h3>{inc.title}</h3>
              {inc.excerpt && <p>{inc.excerpt}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
