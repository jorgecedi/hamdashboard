import type { RawFeedEntry, WorkerFeedSource } from "./feedTypes";
import { parseJsonFeed, parseXmlFeed } from "./parsers";

export async function fetchRawEntries(source: WorkerFeedSource): Promise<RawFeedEntry[]> {
  if (source.kind === "social") {
    return [];
  }

  const response = await fetch(source.url, {
    headers: { "user-agent": "emergency-weather-dashboard/0.1" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const body = await response.text();
  if (source.kind === "json") return parseJsonFeed(body);
  return parseXmlFeed(body);
}
