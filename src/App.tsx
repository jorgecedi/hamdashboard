import { Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { SettingsPanel } from "./components/SettingsPanel";
import { defaultConfig } from "./config/defaultConfig";
import { mergeConfig } from "./config/mergeConfig";
import type { DashboardOverrides } from "./config/types";
import { fetchFeeds } from "./feeds/feedClient";
import type { FeedResponse } from "./feeds/types";
import { clearSettings, loadSettings, saveSettings } from "./storage/settingsStorage";

const emptyFeeds: FeedResponse = { items: [], statuses: [] };
const FEED_REFRESH_MS = 180_000;

function feedServiceErrorResponse(error: unknown): FeedResponse {
  const message = error instanceof Error ? error.message : "Feed request failed";

  return {
    items: [],
    statuses: [
      {
        sourceId: "feed-service",
        ok: false,
        fetchedAt: new Date().toISOString(),
        itemCount: 0,
        error: message,
      },
    ],
  };
}

export function App() {
  const [overrides, setOverrides] = useState<DashboardOverrides | null>(() => loadSettings());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const config = useMemo(() => mergeConfig(defaultConfig, overrides), [overrides]);
  const [feedResponse, setFeedResponse] = useState<FeedResponse>(emptyFeeds);

  useEffect(() => {
    let cancelled = false;

    function refreshFeeds() {
      fetchFeeds(config.workerEndpoint)
        .then((response) => {
          if (!cancelled) setFeedResponse(response);
        })
        .catch((error: unknown) => {
          if (!cancelled) setFeedResponse(feedServiceErrorResponse(error));
        });
    }

    refreshFeeds();
    const intervalId = window.setInterval(refreshFeeds, FEED_REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [config.workerEndpoint]);

  function handleSave(nextOverrides: DashboardOverrides) {
    saveSettings(nextOverrides);
    setOverrides(nextOverrides);
    setSettingsOpen(false);
  }

  function handleReset() {
    clearSettings();
    setOverrides(null);
    setSettingsOpen(false);
  }

  return (
    <>
      <button className="settings-toggle" type="button" aria-label="Open settings" onClick={() => setSettingsOpen(!settingsOpen)}>
        <Settings size={18} />
      </button>
      <Dashboard config={config} feedResponse={feedResponse} />
      {settingsOpen && <SettingsPanel config={config} onSave={handleSave} onReset={handleReset} />}
    </>
  );
}
