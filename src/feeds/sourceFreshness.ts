import type { FeedSource } from "../config/types";
import type { FeedSourceStatus } from "./types";

export type SourceFreshnessState = "fresh" | "stale" | "error" | "unknown";

export type OfficialSourceStatusRow = {
  sourceId: string;
  label: string;
  category: FeedSource["category"];
  state: SourceFreshnessState;
  fetchedAt?: string;
  itemCount?: number;
  message: string;
};

type BuildOfficialSourceStatusesArgs = {
  feeds: FeedSource[];
  statuses: FeedSourceStatus[];
  now?: Date;
};

const hourMs = 60 * 60 * 1000;

const staleThresholdByCategory: Record<FeedSource["category"], number> = {
  emergency: 2 * hourMs,
  weather: 6 * hourMs,
  local: 24 * hourMs,
  news: 24 * hourMs,
  radio: 24 * hourMs,
  social: 24 * hourMs,
};

export function buildOfficialSourceStatuses({ feeds, statuses, now = new Date() }: BuildOfficialSourceStatusesArgs): OfficialSourceStatusRow[] {
  const statusBySource = new Map(statuses.map((status) => [status.sourceId, status]));
  const serviceError = statuses.find((status) => status.sourceId === "feed-service" && !status.ok);

  return feeds
    .filter((feed) => feed.enabled && feed.tags.includes("official"))
    .map((feed) => {
      const status = statusBySource.get(feed.id);

      if (!status) {
        if (serviceError) {
          return {
            sourceId: feed.id,
            label: feed.name,
            category: feed.category,
            state: "error" as const,
            fetchedAt: serviceError.fetchedAt,
            itemCount: 0,
            message: "Feed service unavailable",
          };
        }

        return {
          sourceId: feed.id,
          label: feed.name,
          category: feed.category,
          state: "unknown" as const,
          fetchedAt: undefined,
          itemCount: undefined,
          message: "Unknown",
        };
      }

      if (!status.ok) {
        return {
          sourceId: feed.id,
          label: feed.name,
          category: feed.category,
          state: "error" as const,
          fetchedAt: status.fetchedAt,
          itemCount: status.itemCount,
          message: status.error ?? "Feed check failed",
        };
      }

      const fetchedTime = Date.parse(status.fetchedAt);
      if (!Number.isFinite(fetchedTime)) {
        return {
          sourceId: feed.id,
          label: feed.name,
          category: feed.category,
          state: "unknown" as const,
          fetchedAt: status.fetchedAt,
          itemCount: status.itemCount,
          message: "Unknown",
        };
      }

      const stale = now.getTime() - fetchedTime > staleThresholdByCategory[feed.category];

      return {
        sourceId: feed.id,
        label: feed.name,
        category: feed.category,
        state: stale ? ("stale" as const) : ("fresh" as const),
        fetchedAt: status.fetchedAt,
        itemCount: status.itemCount,
        message: stale ? "Source may not be current" : "Current",
      };
    });
}
