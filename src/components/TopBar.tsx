import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import type { Ref } from "react";
import type { DashboardConfig } from "../config/types";

type TopBarProps = {
  config: DashboardConfig;
  emergencyLinksOpen: boolean;
  emergencyLinksToggleRef?: Ref<HTMLButtonElement>;
  onToggleEmergencyLinks: () => void;
};

export function TopBar({ config, emergencyLinksOpen, emergencyLinksToggleRef, onToggleEmergencyLinks }: TopBarProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const localTime = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: config.site.timezone,
  }).format(now);
  const utcTime = `${now.toISOString().replace("T", " ").slice(0, 19)} UTC`;

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <button
          ref={emergencyLinksToggleRef}
          type="button"
          className="emergency-links-toggle"
          aria-label={emergencyLinksOpen ? "Close emergency links" : "Open emergency links"}
          aria-controls="emergency-links-sidebar"
          aria-expanded={emergencyLinksOpen}
          onClick={onToggleEmergencyLinks}
        >
          <Menu aria-hidden="true" size={18} />
        </button>
        <span className="top-bar-time">{localTime}</span>
      </div>
      <strong>{config.site.callSign}</strong>
      <div className="top-bar-actions">
        <span>{utcTime}</span>
      </div>
    </header>
  );
}
