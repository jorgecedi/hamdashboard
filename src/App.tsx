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

export function App() {
  const [overrides, setOverrides] = useState<DashboardOverrides | null>(() => loadSettings());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const config = useMemo(() => mergeConfig(defaultConfig, overrides), [overrides]);
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
