import { useEffect, useMemo, useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { defaultConfig } from "./config/defaultConfig";
import { mergeConfig } from "./config/mergeConfig";
import { fetchFeeds } from "./feeds/feedClient";
import type { FeedResponse } from "./feeds/types";
import { loadSettings } from "./storage/settingsStorage";

const emptyFeeds: FeedResponse = { items: [], statuses: [] };

export function App() {
  const config = useMemo(() => mergeConfig(defaultConfig, loadSettings()), []);
  const [feedResponse, setFeedResponse] = useState<FeedResponse>(emptyFeeds);

  useEffect(() => {
    let cancelled = false;
    fetchFeeds(config.workerEndpoint)
      .then((response) => {
        if (!cancelled) setFeedResponse(response);
      })
      .catch(() => {
        if (!cancelled) setFeedResponse(emptyFeeds);
      });
    return () => {
      cancelled = true;
    };
  }, [config.workerEndpoint]);

  return <Dashboard config={config} feedResponse={feedResponse} />;
}
