import { Menu } from "lucide-react";
import type { DashboardConfig } from "../config/types";

type TopBarProps = {
  config: DashboardConfig;
  emergencyLinksOpen: boolean;
  onToggleEmergencyLinks: () => void;
};

export function TopBar({ config, emergencyLinksOpen, onToggleEmergencyLinks }: TopBarProps) {
  const now = new Date();
  const localTime = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: config.site.timezone,
  }).format(now);
  const utcTime = `${now.toISOString().replace("T", " ").slice(0, 19)} UTC`;

  return (
    <header className="top-bar">
      <span className="top-bar-time">{localTime}</span>
      <strong>{config.site.callSign}</strong>
      <div className="top-bar-actions">
        <span>{utcTime}</span>
        <button
          type="button"
          className="emergency-links-toggle"
          aria-label={emergencyLinksOpen ? "Close emergency links" : "Open emergency links"}
          aria-controls="emergency-links-sidebar"
          aria-expanded={emergencyLinksOpen}
          onClick={onToggleEmergencyLinks}
        >
          <Menu aria-hidden="true" size={18} />
        </button>
      </div>
    </header>
  );
}
