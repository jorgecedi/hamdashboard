import { urgencyKeywords } from "./config";
import type { FeedItem, RawFeedEntry, Urgency, WorkerFeedSource } from "./feedTypes";

function normalizeText(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function scoreUrgency(entry: RawFeedEntry, priority: number): Urgency {
  const haystack = normalizeText(`${entry.title} ${entry.summary ?? ""}`);
  const normalizedKeywords = [...new Set(urgencyKeywords.map((keyword) => normalizeText(keyword)))];
  const matches = normalizedKeywords.filter((keyword) => haystack.includes(keyword));

  if (matches.length === 0) return "normal";
  if (priority >= 8 || matches.length >= 2) return "urgent";
  return "watch";
}

export function normalizeEntry(entry: RawFeedEntry, source: WorkerFeedSource, fetchedAt: string): FeedItem {
  return {
    ...entry,
    id: `${source.id}:${entry.url}`,
    sourceId: source.id,
    sourceName: source.name,
    fetchedAt,
    category: source.category,
    urgency: scoreUrgency(entry, source.priority),
    tags: source.tags,
  };
}
