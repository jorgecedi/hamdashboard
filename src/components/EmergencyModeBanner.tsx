import type { FeedItem } from "../feeds/types";

type EmergencyModeBannerProps = {
  item?: FeedItem;
  now?: Date;
};

function formatAge(item: FeedItem, now: Date): string {
  const value = Date.parse(item.publishedAt ?? item.fetchedAt);
  if (!Number.isFinite(value)) {
    return "time unknown";
  }

  const ageHours = Math.max(0, Math.round((now.getTime() - value) / (60 * 60 * 1000)));
  if (ageHours < 1) {
    return "less than 1 hour ago";
  }
  if (ageHours < 48) {
    return `${ageHours} hours ago`;
  }

  return `${Math.round(ageHours / 24)} days ago`;
}

export function EmergencyModeBanner({ item, now = new Date() }: EmergencyModeBannerProps) {
  if (!item) {
    return null;
  }

  return (
    <section className="emergency-mode-banner" aria-label="Emergency mode">
      <div>
        <p>Emergency mode</p>
        <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
      </div>
      <span>{item.sourceName} · {formatAge(item, now)}</span>
    </section>
  );
}
