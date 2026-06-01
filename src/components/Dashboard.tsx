import { useState } from "react";
import type { DashboardConfig } from "../config/types";
import type { FeedResponse } from "../feeds/types";
import { EmergencyLinksSidebar } from "./EmergencyLinksSidebar";
import { FeedPanel } from "./FeedPanel";
import { Tile } from "./Tile";
import { TopBar } from "./TopBar";

type DashboardProps = {
  config: DashboardConfig;
  feedResponse: FeedResponse;
};

export function Dashboard({ config, feedResponse }: DashboardProps) {
  const [emergencyLinksOpen, setEmergencyLinksOpen] = useState(false);
  const tiles = config.tiles.filter((tile) => tile.enabled);

  return (
    <div className="dashboard-shell">
      <TopBar
        config={config}
        emergencyLinksOpen={emergencyLinksOpen}
        onToggleEmergencyLinks={() => setEmergencyLinksOpen((open) => !open)}
      />
      {emergencyLinksOpen ? (
        <EmergencyLinksSidebar groups={config.emergencyLinks} onClose={() => setEmergencyLinksOpen(false)} />
      ) : null}
      <section className="dashboard-grid" aria-label="Dashboard tiles">
        {tiles.map((tile) => (
          <Tile key={tile.id} tile={tile} />
        ))}
      </section>
      <FeedPanel items={feedResponse.items} statuses={feedResponse.statuses} />
    </div>
  );
}
