import type { FeedCategory } from "../config/types";

export type Urgency = "normal" | "watch" | "urgent";

export type FeedItem = {
  id: string;
  sourceId: string;
  sourceName: string;
  title: string;
  summary?: string;
  url: string;
  publishedAt?: string;
  fetchedAt: string;
  category: FeedCategory;
  urgency: Urgency;
  tags: string[];
  location?: string;
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
