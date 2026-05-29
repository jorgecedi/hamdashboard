import type { DashboardConfig, DashboardOverrides } from "./types";

export function mergeConfig(base: DashboardConfig, overrides: DashboardOverrides | null | undefined): DashboardConfig {
  if (!overrides) return structuredClone(base);

  const merged: DashboardConfig = {
    ...structuredClone(base),
    ...(overrides.workerEndpoint !== undefined ? { workerEndpoint: overrides.workerEndpoint } : {}),
    ...(overrides.socialMonitoringEnabled !== undefined ? { socialMonitoringEnabled: overrides.socialMonitoringEnabled } : {}),
    ...(overrides.urgencyKeywords ? { urgencyKeywords: [...overrides.urgencyKeywords] } : {}),
  };

  if (overrides.tiles) {
    const byId = new Map(overrides.tiles.map((tile) => [tile.id, tile]));
    merged.tiles = merged.tiles.map((tile) => ({ ...tile, ...byId.get(tile.id), id: tile.id }));
  }

  if (overrides.feeds) {
    const byId = new Map(overrides.feeds.map((feed) => [feed.id, feed]));
    merged.feeds = merged.feeds.map((feed) => ({ ...feed, ...byId.get(feed.id), id: feed.id }));
  }

  if (overrides.tileRotationSeconds !== undefined && Number.isFinite(overrides.tileRotationSeconds) && overrides.tileRotationSeconds > 0) {
    merged.tiles = merged.tiles.map((tile) => ({ ...tile, refreshSeconds: overrides.tileRotationSeconds as number }));
  }

  return merged;
}
