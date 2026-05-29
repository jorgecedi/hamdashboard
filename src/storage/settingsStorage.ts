import type { DashboardOverrides } from "../config/types";

const SETTINGS_KEY = "emergency-dashboard-settings-v1";

function createMemoryStorage(): Storage {
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

function getStorage(): Storage {
  if (
    typeof localStorage !== "undefined" &&
    typeof localStorage.getItem === "function" &&
    typeof localStorage.setItem === "function" &&
    typeof localStorage.removeItem === "function" &&
    typeof localStorage.clear === "function"
  ) {
    return localStorage;
  }

  const storage = createMemoryStorage();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: storage,
  });
  return storage;
}

getStorage();

export function loadSettings(): DashboardOverrides | null {
  const raw = getStorage().getItem(SETTINGS_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as DashboardOverrides;
  } catch {
    getStorage().removeItem(SETTINGS_KEY);
    return null;
  }
}

export function saveSettings(overrides: DashboardOverrides): void {
  getStorage().setItem(SETTINGS_KEY, JSON.stringify(overrides));
}

export function clearSettings(): void {
  getStorage().removeItem(SETTINGS_KEY);
}
