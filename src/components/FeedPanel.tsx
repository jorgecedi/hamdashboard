import type { FeedItem, FeedSourceStatus } from "../feeds/types";

type FeedPanelProps = {
  items: FeedItem[];
  statuses: FeedSourceStatus[];
};

const urgencyOrder = { urgent: 0, watch: 1, normal: 2 };

export function FeedPanel({ items, statuses }: FeedPanelProps) {
  const sorted = [...items].sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
  const errors = statuses.filter((status) => !status.ok);

  return (
    <section className="feed-panel" aria-label="Emergency and news feed">
      <header className="panel-header">
        <h2>Emergency Feed</h2>
        <span>{items.length} items</span>
      </header>
      {errors.map((status) => (
        <p className="source-error" key={status.sourceId}>{status.sourceId}: {status.error}</p>
      ))}
      <div className="feed-list">
        {sorted.map((item) => (
          <article className={`feed-item feed-item-${item.urgency}`} key={item.id}>
            <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
            <p>{item.summary}</p>
            <small>{item.sourceName} · {item.urgency}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
