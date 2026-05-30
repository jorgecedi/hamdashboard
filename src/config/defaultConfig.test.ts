import { describe, expect, it } from "vitest";
import { defaultConfig } from "./defaultConfig";

describe("defaultConfig", () => {
  it("uses only the Puerto Vallarta 5 webcam for the cams tile", () => {
    const cams = defaultConfig.tiles.find((tile) => tile.id === "cams");

    expect(cams?.sources).toEqual([{ kind: "image", url: "https://webcamsdemexico.net/puertovallarta5/live.jpg" }]);
  });

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

  it("includes Windy rain and wind forecast iframe sources", () => {
    const windy = defaultConfig.tiles.find((tile) => tile.id === "wind-rain-forecast");

    expect(windy).toMatchObject({
      title: "Wind + Rain",
      group: "weather",
      enabled: true,
    });
    expect(windy?.sources).toEqual([
      {
        kind: "iframe",
        url: "https://embed.windy.com/embed2.html?lat=20.65&lon=-105.22&zoom=6&level=surface&overlay=rain&product=ecmwf",
      },
      {
        kind: "iframe",
        url: "https://embed.windy.com/embed2.html?lat=20.65&lon=-105.22&zoom=6&level=surface&overlay=wind&product=ecmwf",
      },
    ]);
  });

  it("includes Puerto Vallarta and Mexico official feed sources", () => {
    expect(defaultConfig.feeds).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "smn-conagua-alerts",
          name: "SMN CONAGUA Alerts",
          url: "https://correo1.conagua.gob.mx/feedsmn/feedalert.aspx",
        }),
        expect.objectContaining({
          id: "vallarta-daily-pv",
          name: "Vallarta Daily Puerto Vallarta",
          url: "https://www.vallartadaily.com/category/puerto-vallarta-news/feed/",
        }),
      ]),
    );
  });
});
