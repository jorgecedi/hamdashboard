import type { FeedResponse } from "./types";

export async function fetchFeeds(workerEndpoint: string | undefined): Promise<FeedResponse> {
  if (!workerEndpoint) return { items: [], statuses: [] };

  const base = workerEndpoint.replace(/\/$/, "");
  const response = await fetch(`${base}/feeds`);
  if (!response.ok) throw new Error(`Feed request failed: HTTP ${response.status}`);
  return response.json() as Promise<FeedResponse>;
}
