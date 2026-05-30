import { urgencyKeywords } from "./config";
import type { FeedItem, RawFeedEntry, Urgency, WorkerFeedSource } from "./feedTypes";

const locationKeywords = ["puerto vallarta", "jalisco"];

function normalizeText(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function scoreUrgency(entry: RawFeedEntry, source: WorkerFeedSource): Urgency {
  const haystack = normalizeText(`${entry.title} ${entry.summary ?? ""}`);
  const official = source.tags.includes("official");
  const normalizedLocationKeywords = new Set(locationKeywords.map((keyword) => normalizeText(keyword)));
  const normalizedKeywords = [
    ...new Set(
      urgencyKeywords
        .map((keyword) => normalizeText(keyword))
        .filter((keyword) => official || !normalizedLocationKeywords.has(keyword)),
    ),
  ];
  const matches = normalizedKeywords.filter((keyword) => haystack.includes(keyword));

  if (matches.length === 0) return "normal";
  if (source.priority >= 8 || matches.length >= 2) return "urgent";
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
    urgency: scoreUrgency(entry, source),
    tags: source.tags,
  };
}
