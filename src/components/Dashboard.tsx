import type { DashboardConfig } from "../config/types";
import type { FeedResponse } from "../feeds/types";
import { FeedPanel } from "./FeedPanel";
import { Tile } from "./Tile";
import { TopBar } from "./TopBar";

type DashboardProps = {
  config: DashboardConfig;
  feedResponse: FeedResponse;
};

export function Dashboard({ config, feedResponse }: DashboardProps) {
  const tiles = config.tiles.filter((tile) => tile.enabled);

  return (
    <div className="dashboard-shell">
      <TopBar config={config} />
      <section className="dashboard-grid" aria-label="Dashboard tiles">
        {tiles.map((tile) => (
          <Tile key={tile.id} tile={tile} />
        ))}
      </section>
      <FeedPanel items={feedResponse.items} statuses={feedResponse.statuses} />
    </div>
  );
}
