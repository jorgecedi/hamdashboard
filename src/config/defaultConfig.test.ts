import { describe, expect, it } from "vitest";
import { defaultConfig } from "./defaultConfig";

describe("defaultConfig", () => {
  it("uses the configured default feed endpoint", () => {
    expect(defaultConfig.workerEndpoint).toBe("https://feed.jorgecedi.com/api");
  });

  it("uses the configured default tile rotation seconds", () => {
    expect(Object.fromEntries(defaultConfig.tiles.map((tile) => [tile.id, tile.refreshSeconds]))).toMatchObject({
      radar: 3600,
      cams: 10,
      tropical: 600,
      propagation: 600,
      "live-video": 86400,
      "wind-rain-forecast": 86400,
    });
  });

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
    /*
    expect(liveVideo?.sources).toEqual([
      { kind: "iframe", url: "https://www.youtube.com/embed/5boZ1Vw95OU" },
      { kind: "iframe", url: "https://www.youtube.com/embed/roYcxYa6izQ" },
    ]);
    */
  });

  it("includes Windy rain and wind forecast iframe sources", () => {
    const windy = defaultConfig.tiles.find((tile) => tile.id === "wind-rain-forecast");

    expect(windy).toMatchObject({
      title: "Wind + Rain",
      group: "weather",
      enabled: true,
    });
    /*
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
    */
  });

  it("keeps only the Spanish NHC alert feed and local Puerto Vallarta feed", () => {
    expect(defaultConfig.feeds.map((feed) => feed.id)).not.toEqual(expect.arrayContaining(["nhc-epac-en", "smn-conagua-alerts"]));
    expect(defaultConfig.feeds).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "nhc-epac-es",
          name: "NHC Eastern Pacific Spanish",
          url: "https://www.nhc.noaa.gov/index-ep-sp.xml",
        }),
        expect.objectContaining({
          id: "vallarta-daily-pv",
          name: "Vallarta Daily Puerto Vallarta",
          url: "https://www.vallartadaily.com/category/puerto-vallarta-news/feed/",
        }),
      ]),
    );
  });

  it("includes grouped emergency links for live situation, official resources, and preparedness", () => {
    expect(defaultConfig.emergencyLinks.map((group) => group.id)).toEqual([
      "live-situation",
      "weather-storms",
      "local-official",
      "preparedness-library",
    ]);

    const liveSituation = defaultConfig.emergencyLinks.find((group) => group.id === "live-situation");
    expect(liveSituation?.links).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "iris-seismic-monitor",
          label: "IRIS Seismic Monitor",
          url: "https://www.iris.edu/app/seismic-monitor/map?lat=21.1159&lng=-106.4146&zoom=6",
          kind: "map",
        }),
        expect.objectContaining({
          id: "nasa-firms",
          label: "NASA FIRMS Fire Map",
          url: "https://firms.modaps.eosdis.nasa.gov/map/#d:24hrs;@-104.0,21.4,7.1z",
          kind: "map",
        }),
        expect.objectContaining({
          id: "bahia-banderas-consulta-riesgo",
          label: "Consulta tu Riesgo Bahia de Banderas",
          url: "https://implan.bahiadebanderas.gob.mx/amr2026-consultamapa",
          kind: "map",
        }),
      ]),
    );

    const preparedness = defaultConfig.emergencyLinks.find((group) => group.id === "preparedness-library");
    expect(preparedness?.links).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "survival-data",
          label: "jorgecedi/Survival-Data",
          url: "https://github.com/jorgecedi/Survival-Data",
          kind: "community",
        }),
      ]),
    );
  });
});
