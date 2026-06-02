import type { WorkerFeedSource } from "./feedTypes";

export const workerFeedSources: WorkerFeedSource[] = [
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
  {
    id: "vallarta-daily-pv",
    name: "Vallarta Daily Puerto Vallarta",
    category: "local",
    kind: "rss",
    url: "https://www.vallartadaily.com/category/puerto-vallarta-news/feed/",
    priority: 4,
    enabled: true,
    tags: ["local", "puerto-vallarta", "news"],
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
