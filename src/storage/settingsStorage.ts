import type { DashboardOverrides } from "../config/types";

const SETTINGS_KEY = "emergency-dashboard-settings-v1";

function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadSettings(): DashboardOverrides | null {
  const storage = getStorage();
  if (!storage) return null;

  let raw: string | null;
  try {
    raw = storage.getItem(SETTINGS_KEY);
  } catch {
    return null;
  }

  if (!raw) return null;

  try {
    return JSON.parse(raw) as DashboardOverrides;
  } catch {
    try {
      storage.removeItem(SETTINGS_KEY);
    } catch {
      // Ignore cleanup failures for unavailable storage.
    }
    return null;
  }
}

export function saveSettings(overrides: DashboardOverrides): void {
  try {
    getStorage()?.setItem(SETTINGS_KEY, JSON.stringify(overrides));
  } catch {
    // Storage may be disabled or full.
  }
}

export function clearSettings(): void {
  try {
    getStorage()?.removeItem(SETTINGS_KEY);
  } catch {
    // Storage may be disabled.
  }
}
