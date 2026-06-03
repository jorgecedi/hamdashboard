import type { OfficialSourceStatusRow } from "../feeds/sourceFreshness";

type OfficialSourceStatusPanelProps = {
  rows: OfficialSourceStatusRow[];
};

function formatChecked(value?: string): string {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const stateLabels: Record<OfficialSourceStatusRow["state"], string> = {
  fresh: "Fresh",
  stale: "Stale",
  error: "Error",
  unknown: "Unknown",
};

export function OfficialSourceStatusPanel({ rows }: OfficialSourceStatusPanelProps) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <section className="official-source-panel" aria-label="Official source status">
      <header className="panel-header">
        <h2>Official Sources</h2>
        <span>{rows.length} sources</span>
      </header>
      <div className="official-source-list">
        {rows.map((row) => (
          <article className={`official-source-row official-source-${row.state}`} key={row.sourceId}>
            <div>
              <strong>{row.label}</strong>
              <small>{row.message}</small>
            </div>
            <div>
              <span>{stateLabels[row.state]}</span>
              <small>{formatChecked(row.fetchedAt)} · {row.itemCount ?? "Unknown"} items</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
