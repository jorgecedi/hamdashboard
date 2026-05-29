export type FeedCategory = "weather" | "emergency" | "local" | "radio" | "news" | "social";
export type Urgency = "normal" | "watch" | "urgent";

export type WorkerFeedSource = {
  id: string;
  name: string;
  category: FeedCategory;
  kind: "rss" | "atom" | "json" | "social";
  url: string;
  priority: number;
  enabled: boolean;
  tags: string[];
};

export type RawFeedEntry = {
  title: string;
  summary?: string;
  url: string;
  publishedAt?: string;
};

export type FeedItem = RawFeedEntry & {
  id: string;
  sourceId: string;
  sourceName: string;
  fetchedAt: string;
  category: FeedCategory;
  urgency: Urgency;
  tags: string[];
};

export type FeedSourceStatus = {
  sourceId: string;
  ok: boolean;
  fetchedAt: string;
  itemCount: number;
  error?: string;
};

export type FeedResponse = {
  items: FeedItem[];
  statuses: FeedSourceStatus[];
};
