import type { WorkerFeedSource } from "./feedTypes";

export const workerFeedSources: WorkerFeedSource[] = [
  {
    id: "nhc-epac-en",
    name: "NHC Eastern Pacific",
    category: "weather",
    kind: "rss",
    url: "https://www.nhc.noaa.gov/index-ep.xml",
    priority: 10,
    enabled: true,
    tags: ["official", "hurricane", "pacific"],
  },
  {
    id: "nhc-epac-es",
    name: "NHC Eastern Pacific Spanish",
    category: "weather",
    kind: "rss",
    url: "https://www.nhc.noaa.gov/index-ep-sp.xml",
    priority: 10,
    enabled: true,
    tags: ["official", "huracan", "pacifico"],
  },
];

export const urgencyKeywords = [
  "huracan",
  "huracán",
  "tormenta tropical",
  "Puerto Vallarta",
  "Jalisco",
  "evacuacion",
  "evacuación",
  "inundacion",
  "inundación",
  "marejada",
  "hurricane",
  "tropical storm",
  "flood",
  "surge",
  "evacuation",
];
