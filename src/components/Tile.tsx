import { Maximize2, RotateCw } from "lucide-react";
import { useEffect, useState } from "react";
import type { DashboardTile } from "../config/types";

type TileProps = {
  tile: DashboardTile;
};

function cacheBustedImageUrl(url: string, cacheKey: number): string {
  const delimiter = url.includes("?") ? "&" : "?";
  return `${url}${delimiter}_=${cacheKey}`;
}

export function Tile({ tile }: TileProps) {
  const [index, setIndex] = useState(0);
  const [cacheKey, setCacheKey] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const source = tile.sources[index] ?? tile.sources[0];

  function advanceSource() {
    setIndex((current) => (current + 1) % tile.sources.length);
    setCacheKey((current) => current + 1);
  }

  useEffect(() => {
    if (tile.sources.length === 0 || tile.refreshSeconds <= 0) return;
    if (tile.sources.length <= 1 && source?.kind !== "image") return;

    const interval = window.setInterval(() => {
      advanceSource();
    }, tile.refreshSeconds * 1000);

    return () => window.clearInterval(interval);
  }, [source?.kind, tile.refreshSeconds, tile.sources.length]);

  if (!source) return null;
  const tileClassName = ["tile", expanded ? "tile-expanded" : "", expanded && source.kind === "image" ? "tile-expanded-image" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={tileClassName}>
      <header className="tile-header">
        <h3>{tile.title}</h3>
        <div className="tile-actions">
          <button type="button" aria-label="Next source" onClick={advanceSource}>
            <RotateCw size={16} />
          </button>
          <button type="button" aria-label="Expand tile" onClick={() => setExpanded(!expanded)}>
            <Maximize2 size={16} />
          </button>
        </div>
      </header>
      {source.kind === "image" && <img className="tile-media-image" src={cacheBustedImageUrl(source.url, cacheKey)} alt={tile.title} />}
      {source.kind === "video" && <video src={source.url} controls muted autoPlay loop />}
      {source.kind === "iframe" && <iframe src={source.url} title={tile.title} />}
    </article>
  );
}
