import { beforeEach, describe, expect, it } from "vitest";
import { clearSettings, loadSettings, saveSettings } from "./settingsStorage";

describe("settingsStorage", () => {
  beforeEach(() => localStorage.clear());

  it("returns null when no overrides are stored", () => {
    expect(loadSettings()).toBeNull();
  });

  it("saves and loads overrides", () => {
    saveSettings({ workerEndpoint: "https://feeds.example.workers.dev" });
    expect(loadSettings()).toEqual({ workerEndpoint: "https://feeds.example.workers.dev" });
  });

  it("clears overrides", () => {
    saveSettings({ socialMonitoringEnabled: true });
    clearSettings();
    expect(loadSettings()).toBeNull();
  });
});
