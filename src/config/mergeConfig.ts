import type { DashboardConfig, DashboardOverrides } from "./types";

function cloneConfig(config: DashboardConfig): DashboardConfig {
  if (typeof structuredClone === "function") {
    return structuredClone(config);
  }

  return JSON.parse(JSON.stringify(config)) as DashboardConfig;
}

export function mergeConfig(base: DashboardConfig, overrides: DashboardOverrides | null | undefined): DashboardConfig {
  if (!overrides) return cloneConfig(base);

  const merged: DashboardConfig = {
    ...cloneConfig(base),
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

  return merged;
}
