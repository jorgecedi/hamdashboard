import type { DashboardConfig } from "../config/types";

type TopBarProps = {
  config: DashboardConfig;
};

export function TopBar({ config }: TopBarProps) {
  const now = new Date();
  const localTime = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: config.site.timezone,
  }).format(now);
  const utcTime = `${now.toISOString().replace("T", " ").slice(0, 19)} UTC`;

  return (
    <header className="top-bar">
      <span>{localTime}</span>
      <strong>{config.site.callSign}</strong>
      <span>{utcTime}</span>
    </header>
  );
}
