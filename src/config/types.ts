export type TileKind = "image" | "video" | "iframe";
export type FeedCategory = "weather" | "emergency" | "local" | "radio" | "news" | "social";

export type TileSource = {
  kind: TileKind;
  url: string;
  label?: string;
};

export type DashboardTile = {
  id: string;
  title: string;
  group: "weather" | "local" | "radio" | "news";
  refreshSeconds: number;
  sources: TileSource[];
  enabled: boolean;
};

export type FeedSource = {
  id: string;
  name: string;
  category: FeedCategory;
  url: string;
  kind: "rss" | "atom" | "json" | "social";
  priority: number;
  enabled: boolean;
  tags: string[];
};

export type DashboardConfig = {
  site: {
    title: string;
    callSign: string;
    locationName: string;
    timezone: string;
    language: "en" | "es";
  };
  workerEndpoint?: string;
  socialMonitoringEnabled: boolean;
  urgencyKeywords: string[];
  tiles: DashboardTile[];
  feeds: FeedSource[];
};

export type DashboardOverrides = Partial<Pick<DashboardConfig, "workerEndpoint" | "socialMonitoringEnabled" | "urgencyKeywords">> & {
  tileRotationSeconds?: number;
  tiles?: Array<Partial<DashboardTile> & { id: string }>;
  feeds?: Array<Partial<FeedSource> & { id: string }>;
};
