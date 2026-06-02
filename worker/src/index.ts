import { workerFeedSources } from "./config";
import type { FeedResponse, FeedSourceStatus, RawFeedEntry, WorkerFeedSource } from "./feedTypes";
import { normalizeEntry } from "./normalize";
import { fetchRawEntries } from "./providers";

type Env = {
  CACHE_SECONDS?: string;
};

const DEFAULT_CACHE_SECONDS = 180;
const SEMAR_TSUNAMI_SOURCE_ID = "semar-tsunami-alerts";
const SEMAR_TSUNAMI_MAX_AGE_DAYS = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

function cacheSeconds(env: Env): number {
  const parsed = Number(env.CACHE_SECONDS ?? DEFAULT_CACHE_SECONDS);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_CACHE_SECONDS;
}

function json(payload: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      ...headers,
    },
  });
}

async function fetchSource(source: WorkerFeedSource): Promise<FeedResponse> {
  const fetchedAt = new Date().toISOString();

  try {
    const rawEntries = await fetchRawEntries(source);
    const filteredEntries = filterSourceEntries(source, rawEntries, fetchedAt);
    const items = filteredEntries.map((item) => normalizeEntry(item, source, fetchedAt));
    const status: FeedSourceStatus = {
      sourceId: source.id,
      ok: true,
      fetchedAt,
      itemCount: items.length,
    };

    return { items, statuses: [status] };
  } catch (error) {
    return {
      items: [],
      statuses: [
        {
          sourceId: source.id,
          ok: false,
          fetchedAt,
          itemCount: 0,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      ],
    };
  }
}

function entrySortTime(entry: { publishedAt?: string; fetchedAt?: string }): number {
  const parsed = Date.parse(entry.publishedAt ?? entry.fetchedAt ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function filterSourceEntries(source: WorkerFeedSource, entries: RawFeedEntry[], fetchedAt: string): RawFeedEntry[] {
  if (source.id !== SEMAR_TSUNAMI_SOURCE_ID) {
    return entries;
  }

  const newestEntryTime = Math.max(...entries.map((entry) => entrySortTime({ ...entry, fetchedAt })));
  const fetchedTime = Date.parse(fetchedAt);

  if (!Number.isFinite(newestEntryTime) || !Number.isFinite(fetchedTime)) {
    return [];
  }

  return fetchedTime - newestEntryTime <= SEMAR_TSUNAMI_MAX_AGE_DAYS * DAY_MS ? entries : [];
}

function itemSortTime(item: { publishedAt?: string; fetchedAt: string }): number {
  return entrySortTime(item);
}

function sourceSortPriority(item: { sourceId: string }): number {
  return item.sourceId === SEMAR_TSUNAMI_SOURCE_ID ? 1 : 0;
}

async function feedsResponse(sourceId: string | undefined, env: Env): Promise<Response> {
  const sources = workerFeedSources.filter((source) => source.enabled && (!sourceId || source.id === sourceId));
  const results = await Promise.all(sources.map(fetchSource));
  const payload: FeedResponse = {
    items: results
      .flatMap((result) => result.items)
      .sort((a, b) => sourceSortPriority(b) - sourceSortPriority(a) || itemSortTime(b) - itemSortTime(a)),
    statuses: results.flatMap((result) => result.statuses),
  };

  return json(payload, 200, { "Cache-Control": `public, max-age=${cacheSeconds(env)}` });
}

export default {
  async fetch(request: Request, env: Env = {}): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return json({ ok: true, cacheSeconds: cacheSeconds(env), sourceCount: workerFeedSources.length });
    }

    if (url.pathname === "/api/feeds") {
      return feedsResponse(undefined, env);
    }

    const feedMatch = url.pathname.match(/^\/api\/feeds\/([^/]+)$/);
    if (feedMatch?.[1]) {
      return feedsResponse(feedMatch[1], env);
    }

    return json({ error: "Not found" }, 404);
  },
};
