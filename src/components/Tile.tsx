import { Maximize2, RotateCw } from "lucide-react";
import { useEffect, useState } from "react";
import type { DashboardTile } from "../config/types";

type TileProps = {
  tile: DashboardTile;
};

export function Tile({ tile }: TileProps) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const source = tile.sources[index] ?? tile.sources[0];

  useEffect(() => {
    if (tile.sources.length <= 1 || tile.refreshSeconds <= 0) return;

    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % tile.sources.length);
    }, tile.refreshSeconds * 1000);

    return () => window.clearInterval(interval);
  }, [tile.refreshSeconds, tile.sources.length]);

  if (!source) return null;

  return (
    <article className={expanded ? "tile tile-expanded" : "tile"}>
      <header className="tile-header">
        <h3>{tile.title}</h3>
        <div className="tile-actions">
          <button type="button" aria-label="Next source" onClick={() => setIndex((index + 1) % tile.sources.length)}>
            <RotateCw size={16} />
          </button>
          <button type="button" aria-label="Expand tile" onClick={() => setExpanded(!expanded)}>
            <Maximize2 size={16} />
          </button>
        </div>
      </header>
      {source.kind === "image" && <img src={source.url} alt={tile.title} />}
      {source.kind === "video" && <video src={source.url} controls muted autoPlay loop />}
      {source.kind === "iframe" && <iframe src={source.url} title={tile.title} />}
    </article>
  );
}
