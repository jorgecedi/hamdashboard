import { describe, expect, it } from "vitest";
import { defaultConfig } from "./defaultConfig";
import { mergeConfig } from "./mergeConfig";

describe("mergeConfig", () => {
  it("applies top-level overrides without mutating defaults", () => {
    const merged = mergeConfig(defaultConfig, {
      workerEndpoint: "https://feeds.example.workers.dev",
      socialMonitoringEnabled: true,
    });

    expect(merged.workerEndpoint).toBe("https://feeds.example.workers.dev");
    expect(merged.socialMonitoringEnabled).toBe(true);
    expect(defaultConfig.socialMonitoringEnabled).toBe(false);
  });

  it("merges tile overrides by id", () => {
    const merged = mergeConfig(defaultConfig, {
      tiles: [{ id: "radar", enabled: false, refreshSeconds: 120 }],
    });

    const radar = merged.tiles.find((tile) => tile.id === "radar");
    expect(radar?.enabled).toBe(false);
    expect(radar?.refreshSeconds).toBe(120);
  });

  it("ignores overrides for unknown tile ids", () => {
    const merged = mergeConfig(defaultConfig, {
      tiles: [{ id: "missing", enabled: false }],
    });

    expect(merged.tiles.find((tile) => tile.id === "missing")).toBeUndefined();
  });

  it("keeps per-tile rotation overrides independent", () => {
    const merged = mergeConfig(defaultConfig, {
      tiles: [
        { id: "radar", refreshSeconds: 1800 },
        { id: "live-video", refreshSeconds: 3600 },
      ],
    });

    expect(merged.tiles.find((tile) => tile.id === "radar")?.refreshSeconds).toBe(1800);
    expect(merged.tiles.find((tile) => tile.id === "live-video")?.refreshSeconds).toBe(3600);
    expect(merged.tiles.find((tile) => tile.id === "cams")?.refreshSeconds).toBe(10);
  });
});
