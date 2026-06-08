import type { FeedItem, FeedSourceStatus } from "../feeds/types";

type FeedPanelProps = {
  items: FeedItem[];
  statuses: FeedSourceStatus[];
  staleSourceCount?: number;
};

const urgencyOrder = { urgent: 0, watch: 1, normal: 2 };
const semarSourceId = "semar-tsunami-alerts";

function itemTime(item: FeedItem): number {
  const publishedTime = item.publishedAt ? Date.parse(item.publishedAt) : Number.NaN;
  if (Number.isFinite(publishedTime)) {
    return publishedTime;
  }

  const fetchedTime = Date.parse(item.fetchedAt);
  return Number.isFinite(fetchedTime) ? fetchedTime : 0;
}

function compareItems(a: FeedItem, b: FeedItem): number {
  const aIsSemar = a.sourceId === semarSourceId;
  const bIsSemar = b.sourceId === semarSourceId;

  if (aIsSemar !== bIsSemar) {
    return aIsSemar ? -1 : 1;
  }

  if (aIsSemar) {
    return itemTime(b) - itemTime(a);
  }

  return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
}

export function FeedPanel({ items, statuses, staleSourceCount = 0 }: FeedPanelProps) {
  const sorted = [...items].sort(compareItems);
  const errors = statuses.filter((status) => !status.ok);

  return (
    <section className="feed-panel" aria-label="Emergency and news feed">
      <header className="panel-header">
        <h2>Emergency Feed</h2>
        <span>{items.length} items</span>
      </header>
      {errors.length > 0 || staleSourceCount > 0 ? (
        <div className="feed-notices">
          {errors.map((status) => (
            <p className="source-error" key={status.sourceId}>{status.sourceId}: {status.error}</p>
          ))}
          {staleSourceCount > 0 ? (
            <p className="source-stale">{staleSourceCount} {staleSourceCount === 1 ? "source" : "sources"} may not be current</p>
          ) : null}
        </div>
      ) : null}
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
