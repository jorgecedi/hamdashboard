export type TileKind = "image" | "video" | "iframe";
export type FeedCategory = "weather" | "emergency" | "local" | "radio" | "news" | "social";
export type EmergencyLinkKind = "official" | "map" | "preparedness" | "community";

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

export type EmergencyLink = {
  id: string;
  label: string;
  url: string;
  description: string;
  kind: EmergencyLinkKind;
};

export type EmergencyLinkGroup = {
  id: string;
  title: string;
  links: EmergencyLink[];
};

export type EmergencyChecklistItem = {
  id: string;
  label: string;
};

export type CriticalContact = {
  id: string;
  label: string;
  value: string;
  note?: string;
  official: boolean;
};

export type RadioReference = {
  id: string;
  label: string;
  frequency: string;
  note?: string;
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
  emergencyLinks: EmergencyLinkGroup[];
  emergencyChecklist: EmergencyChecklistItem[];
  criticalContacts: CriticalContact[];
  radioReferences: RadioReference[];
  urgencyKeywords: string[];
  tiles: DashboardTile[];
  feeds: FeedSource[];
};

export type DashboardOverrides = Partial<Pick<DashboardConfig, "workerEndpoint" | "socialMonitoringEnabled" | "urgencyKeywords">> & {
  tiles?: Array<Partial<DashboardTile> & { id: string }>;
  feeds?: Array<Partial<FeedSource> & { id: string }>;
};
