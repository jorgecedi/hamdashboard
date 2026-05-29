import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearSettings, loadSettings, saveSettings } from "./settingsStorage";

const SETTINGS_KEY = "emergency-dashboard-settings-v1";

function createTestStorage(): Storage {
  const items = new Map<string, string>();

  return {
    get length() {
      return items.size;
    },
    clear: () => items.clear(),
    getItem: (key: string) => items.get(key) ?? null,
    key: (index: number) => Array.from(items.keys())[index] ?? null,
    removeItem: (key: string) => {
      items.delete(key);
    },
    setItem: (key: string, value: string) => {
      items.set(key, value);
    },
  };
}

describe("settingsStorage", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: createTestStorage(),
    });
  });

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

  it("clears invalid JSON and returns null", () => {
    window.localStorage.setItem(SETTINGS_KEY, "not json");

    expect(loadSettings()).toBeNull();
    expect(window.localStorage.getItem(SETTINGS_KEY)).toBeNull();
  });

  it("treats unavailable window storage as empty and no-ops writes", () => {
    const storageSpy = vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new Error("localStorage is unavailable");
    });

    expect(loadSettings()).toBeNull();
    expect(() => saveSettings({ socialMonitoringEnabled: true })).not.toThrow();
    expect(() => clearSettings()).not.toThrow();

    storageSpy.mockRestore();
  });
});
