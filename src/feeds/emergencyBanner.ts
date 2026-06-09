import type { FeedItem } from "./types";

const maxAgeMs = 24 * 60 * 60 * 1000;

function itemTime(item: FeedItem): number {
  const timestamp =
    item.sourceId === "semar-tsunami-alerts" ? item.publishedAt : (item.publishedAt ?? item.fetchedAt);
  const parsed = Date.parse(timestamp ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function sourcePriority(item: FeedItem): number {
  if (item.sourceId === "semar-tsunami-alerts") {
    return 0;
  }

  if (item.category === "emergency") {
    return 1;
  }

  return 2;
}

export function selectEmergencyBannerItem(items: FeedItem[], now = new Date()): FeedItem | undefined {
  return items
    .filter((item) => item.tags.includes("official"))
    .filter((item) => item.category === "emergency" || item.urgency === "urgent")
    .filter((item) => {
      const publishedTime = itemTime(item);
      const nowTime = now.getTime();
      return publishedTime > 0 && publishedTime <= nowTime && nowTime - publishedTime <= maxAgeMs;
    })
    .sort((a, b) => sourcePriority(a) - sourcePriority(b) || itemTime(b) - itemTime(a))[0];
}
