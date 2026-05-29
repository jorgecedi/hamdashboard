import { describe, expect, it } from "vitest";
import { defaultConfig } from "./defaultConfig";

describe("defaultConfig", () => {
  it("includes the GOES19 source in the radar tile", () => {
    const radar = defaultConfig.tiles.find((tile) => tile.id === "radar");

    expect(radar?.sources).toContainEqual({
      kind: "image",
      url: "https://cdn.star.nesdis.noaa.gov/GOES19/ABI/SECTOR/GA/13/GOES19-GA-13-1000x1000.gif",
    });
  });

  it("includes the configured live video feeds as iframe sources", () => {
    const liveVideo = defaultConfig.tiles.find((tile) => tile.id === "live-video");

    expect(liveVideo).toMatchObject({
      title: "Live Video",
      group: "news",
      enabled: true,
    });
    expect(liveVideo?.sources).toEqual([
      { kind: "iframe", url: "https://www.youtube.com/embed/5boZ1Vw95OU" },
      { kind: "iframe", url: "https://www.youtube.com/embed/roYcxYa6izQ" },
    ]);
  });
});
