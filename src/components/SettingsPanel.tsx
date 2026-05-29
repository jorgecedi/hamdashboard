import { useState } from "react";
import type { DashboardConfig, DashboardOverrides } from "../config/types";

type SettingsPanelProps = {
  config: DashboardConfig;
  onSave: (overrides: DashboardOverrides) => void;
  onReset: () => void;
};

export function SettingsPanel({ config, onSave, onReset }: SettingsPanelProps) {
  const [workerEndpoint, setWorkerEndpoint] = useState(config.workerEndpoint ?? "");
  const [tileRotationSeconds, setTileRotationSeconds] = useState(String(config.tiles[0]?.refreshSeconds ?? 30));

  return (
    <aside className="settings-panel" aria-label="Dashboard settings">
      <h2>Settings</h2>
      <label>
        Worker endpoint
        <input value={workerEndpoint} onChange={(event) => setWorkerEndpoint(event.target.value)} placeholder="/api" />
      </label>
      <label>
        Tile rotation seconds
        <input
          min="1"
          type="number"
          value={tileRotationSeconds}
          onChange={(event) => setTileRotationSeconds(event.target.value)}
          placeholder="30"
        />
      </label>
      <div className="settings-actions">
        <button type="button" onClick={() => onSave({ workerEndpoint, tileRotationSeconds: Number(tileRotationSeconds) })}>
          Save settings
        </button>
        <button type="button" onClick={onReset}>
          Reset settings
        </button>
      </div>
    </aside>
  );
}
