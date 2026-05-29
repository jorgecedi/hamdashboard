import { useState } from "react";
import type { DashboardConfig, DashboardOverrides } from "../config/types";

type SettingsPanelProps = {
  config: DashboardConfig;
  onSave: (overrides: DashboardOverrides) => void;
  onReset: () => void;
};

export function SettingsPanel({ config, onSave, onReset }: SettingsPanelProps) {
  const [workerEndpoint, setWorkerEndpoint] = useState(config.workerEndpoint ?? "");
  const [tileRotationSeconds, setTileRotationSeconds] = useState<Record<string, string>>(() =>
    Object.fromEntries(config.tiles.map((tile) => [tile.id, String(tile.refreshSeconds)])),
  );

  function saveOverrides() {
    onSave({
      workerEndpoint,
      tiles: config.tiles.map((tile) => ({
        id: tile.id,
        refreshSeconds: Number(tileRotationSeconds[tile.id] ?? tile.refreshSeconds),
      })),
    });
  }

  return (
    <aside className="settings-panel" aria-label="Dashboard settings">
      <h2>Settings</h2>
      <label>
        Worker endpoint
        <input value={workerEndpoint} onChange={(event) => setWorkerEndpoint(event.target.value)} placeholder="/api" />
      </label>
      <div className="settings-tile-rotations">
        {config.tiles.map((tile) => (
          <label key={tile.id}>
            {tile.title} rotation seconds
            <input
              min="1"
              type="number"
              value={tileRotationSeconds[tile.id] ?? String(tile.refreshSeconds)}
              onChange={(event) => setTileRotationSeconds((values) => ({ ...values, [tile.id]: event.target.value }))}
              placeholder="30"
            />
          </label>
        ))}
      </div>
      <div className="settings-actions">
        <button type="button" onClick={saveOverrides}>
          Save settings
        </button>
        <button type="button" onClick={onReset}>
          Reset settings
        </button>
      </div>
    </aside>
  );
}
