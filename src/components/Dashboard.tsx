import { useRef, useState } from "react";
import type { DashboardConfig } from "../config/types";
import { selectEmergencyBannerItem } from "../feeds/emergencyBanner";
import { buildOfficialSourceStatuses } from "../feeds/sourceFreshness";
import type { FeedResponse } from "../feeds/types";
import { EmergencyLinksSidebar } from "./EmergencyLinksSidebar";
import { EmergencyModeBanner } from "./EmergencyModeBanner";
import { FeedPanel } from "./FeedPanel";
import { OfficialSourceStatusPanel } from "./OfficialSourceStatusPanel";
import { Tile } from "./Tile";
import { TopBar } from "./TopBar";

type DashboardProps = {
  config: DashboardConfig;
  feedResponse: FeedResponse;
};

export function Dashboard({ config, feedResponse }: DashboardProps) {
  const [emergencyLinksOpen, setEmergencyLinksOpen] = useState(false);
  const emergencyLinksToggleRef = useRef<HTMLButtonElement>(null);
  const tiles = config.tiles.filter((tile) => tile.enabled);
  const emergencyBannerItem = selectEmergencyBannerItem(feedResponse.items);
  const officialSourceStatuses = buildOfficialSourceStatuses({
    feeds: config.feeds,
    statuses: feedResponse.statuses,
  });

  return (
    <div className="dashboard-shell">
      <TopBar
        config={config}
        emergencyLinksOpen={emergencyLinksOpen}
        emergencyLinksToggleRef={emergencyLinksToggleRef}
        onToggleEmergencyLinks={() => setEmergencyLinksOpen((open) => !open)}
      />
      {emergencyLinksOpen ? (
        <EmergencyLinksSidebar
          groups={config.emergencyLinks}
          ignoredOutsideClickRefs={[emergencyLinksToggleRef]}
          onClose={() => setEmergencyLinksOpen(false)}
        />
      ) : null}
      <EmergencyModeBanner item={emergencyBannerItem} />
      <section className="dashboard-grid" aria-label="Dashboard tiles">
        {tiles.map((tile) => (
          <Tile key={tile.id} tile={tile} />
        ))}
      </section>
      <div className="dashboard-side-panel">
        <OfficialSourceStatusPanel rows={officialSourceStatuses} />
        <FeedPanel items={feedResponse.items} statuses={feedResponse.statuses} />
      </div>
    </div>
  );
}
