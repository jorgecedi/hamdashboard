# Emergency Weather Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a modern static-first emergency weather and ham radio dashboard for `jorgecedi.com`, with an optional Cloudflare Worker feed adapter for reliable public news and emergency monitoring.

**Architecture:** Create a Vite + React + TypeScript frontend that deploys as static files and keeps the old dashboard files as legacy reference. Add a Cloudflare Worker under `worker/` to normalize RSS, Atom, JSON, and optional public social/topic provider data into one feed API. Keep configuration copy-friendly with repo defaults plus browser-local overrides.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, Cloudflare Workers, Wrangler, CSS modules or plain CSS, localStorage.

---

## File Structure

- Create `package.json`: project scripts, dependencies, and dev tools.
- Create `vite.config.ts`: Vite and Vitest configuration.
- Create `tsconfig.json`, `tsconfig.node.json`: TypeScript settings.
- Create `index.html`: Vite app shell replacing the old static entrypoint.
- Move legacy static files to `legacy/`: preserve `hamdash.html`, old `index.html`, `config.js`, and `wheelzoom.js` as reference.
- Create `src/main.tsx`: React entrypoint.
- Create `src/App.tsx`: app composition and mode routing.
- Create `src/config/defaultConfig.ts`: dashboard default tiles, feeds, keywords, identity, and Worker endpoint config.
- Create `src/config/types.ts`: shared frontend config types.
- Create `src/config/mergeConfig.ts`: local override merge and validation.
- Create `src/storage/settingsStorage.ts`: browser-local settings persistence.
- Create `src/feeds/types.ts`: normalized feed item and source status types.
- Create `src/feeds/urgency.ts`: keyword/source-priority urgency scoring.
- Create `src/feeds/feedClient.ts`: frontend feed API/direct-feed client.
- Create `src/components/Dashboard.tsx`: responsive dashboard composition.
- Create `src/components/Tile.tsx`: image/video/iframe tile behavior.
- Create `src/components/FeedPanel.tsx`: urgent/news feed display.
- Create `src/components/SettingsPanel.tsx`: browser override UI.
- Create `src/components/TopBar.tsx`: clock, identity, and status.
- Create `src/styles/app.css`: responsive TV/mobile layout and component styling.
- Create `worker/wrangler.toml`: Cloudflare Worker configuration.
- Create `worker/src/index.ts`: Worker request routing.
- Create `worker/src/config.ts`: Worker feed source defaults.
- Create `worker/src/feedTypes.ts`: Worker feed contracts matching frontend.
- Create `worker/src/parsers.ts`: RSS/Atom/JSON parsing.
- Create `worker/src/normalize.ts`: source normalization and urgency.
- Create `worker/src/providers.ts`: provider adapter interface and initial RSS/JSON adapters.
- Create `worker/test/*.test.ts`: Worker tests.
- Create `src/**/*.test.ts`: frontend logic and component tests.
- Modify `README.md`: setup, deploy, static-only mode, Worker mode, and legacy notes.
- Modify `.gitignore`: ignore generated files and local Cloudflare/Vite artifacts.

## Task 1: Project Scaffold And Legacy Preservation

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles/app.css`
- Modify: `index.html`
- Move: `hamdash.html` to `legacy/hamdash.html`
- Move: old `index.html` to `legacy/index.html`
- Move: `config.js` to `legacy/config.js`
- Move: `wheelzoom.js` to `legacy/wheelzoom.js`
- Modify: `.gitignore`

- [ ] **Step 1: Create package metadata**

Add `package.json`:

```json
{
  "name": "emergency-weather-dashboard",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "worker:test": "vitest run worker/test",
    "check": "npm run test && npm run build"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "vite": "^7.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "@cloudflare/vitest-pool-workers": "^0.8.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@types/node": "^22.10.2",
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.2",
    "jsdom": "^25.0.1",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8",
    "wrangler": "^3.95.0"
  }
}
```

- [ ] **Step 2: Add TypeScript and Vite configuration**

Create `tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src", "worker", "vite.config.ts"]
}
```

Create `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

- [ ] **Step 3: Preserve legacy files**

Run:

```bash
mkdir -p legacy
git mv hamdash.html legacy/hamdash.html
git mv index.html legacy/index.html
git mv config.js legacy/config.js
git mv wheelzoom.js legacy/wheelzoom.js
```

Expected: the original dashboard files are preserved under `legacy/`.

- [ ] **Step 4: Add new Vite app shell**

Create new `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>XE1CPM Emergency Weather Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/app.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Create `src/App.tsx`:

```tsx
export function App() {
  return (
    <main className="app-shell">
      <h1>XE1CPM Emergency Weather Dashboard</h1>
      <p>Modern dashboard scaffold is ready.</p>
    </main>
  );
}
```

Create `src/styles/app.css`:

```css
:root {
  color-scheme: dark;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #05070a;
  color: #f5f7fb;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background: #05070a;
}

.app-shell {
  min-height: 100vh;
  padding: 24px;
}
```

- [ ] **Step 5: Add test setup**

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 6: Update `.gitignore`**

Set `.gitignore` to:

```gitignore
.vscode
node_modules
dist
.wrangler
.dev.vars
.superpowers
coverage
```

- [ ] **Step 7: Install dependencies and verify scaffold**

Run:

```bash
npm install
npm run build
```

Expected: build completes and creates `dist/`.

- [ ] **Step 8: Commit scaffold**

```bash
git add .
git commit -m "chore: scaffold modern dashboard app"
```

## Task 2: Shared Types, Default Config, And Settings Merge

**Files:**
- Create: `src/config/types.ts`
- Create: `src/config/defaultConfig.ts`
- Create: `src/config/mergeConfig.ts`
- Create: `src/storage/settingsStorage.ts`
- Create: `src/config/mergeConfig.test.ts`
- Create: `src/storage/settingsStorage.test.ts`

- [ ] **Step 1: Add config types**

Create `src/config/types.ts`:

```ts
export type TileKind = "image" | "video" | "iframe";
export type FeedCategory = "weather" | "emergency" | "local" | "radio" | "news" | "social";

export type TileSource = {
  kind: TileKind;
  url: string;
  label?: string;
};

export type DashboardTile = {
  id: string;
  title: string;
  group: "weather" | "local" | "radio" | "news";
  refreshSeconds: number;
  sources: TileSource[];
  enabled: boolean;
};

export type FeedSource = {
  id: string;
  name: string;
  category: FeedCategory;
  url: string;
  kind: "rss" | "atom" | "json" | "social";
  priority: number;
  enabled: boolean;
  tags: string[];
};

export type DashboardConfig = {
  site: {
    title: string;
    callSign: string;
    locationName: string;
    timezone: string;
    language: "en" | "es";
  };
  workerEndpoint?: string;
  socialMonitoringEnabled: boolean;
  urgencyKeywords: string[];
  tiles: DashboardTile[];
  feeds: FeedSource[];
};

export type DashboardOverrides = Partial<Pick<DashboardConfig, "workerEndpoint" | "socialMonitoringEnabled" | "urgencyKeywords">> & {
  tiles?: Array<Partial<DashboardTile> & { id: string }>;
  feeds?: Array<Partial<FeedSource> & { id: string }>;
};
```

- [ ] **Step 2: Add default config**

Create `src/config/defaultConfig.ts` using current Puerto Vallarta sources from `legacy/config.js`:

```ts
import type { DashboardConfig } from "./types";

const utcHour = new Date().toISOString().slice(11, 13);

export const defaultConfig: DashboardConfig = {
  site: {
    title: "Emergency Weather Dashboard",
    callSign: "XE1CPM - DL70ir",
    locationName: "Puerto Vallarta, Jalisco",
    timezone: "America/Bahia_Banderas",
    language: "en",
  },
  workerEndpoint: "/api",
  socialMonitoringEnabled: false,
  urgencyKeywords: [
    "huracan",
    "huracán",
    "tormenta tropical",
    "Puerto Vallarta",
    "Jalisco",
    "evacuacion",
    "evacuación",
    "inundacion",
    "inundación",
    "marejada",
    "hurricane",
    "tropical storm",
    "flood",
    "surge",
    "evacuation",
  ],
  tiles: [
    {
      id: "radar",
      title: "Radar",
      group: "weather",
      refreshSeconds: 3600,
      enabled: true,
      sources: [{ kind: "image", url: "https://cdn.star.nesdis.noaa.gov/GOES16/ABI/SECTOR/mex/13/GOES16-MEX-13-1000x1000.gif" }],
    },
    {
      id: "cams",
      title: "Cams",
      group: "local",
      refreshSeconds: 10,
      enabled: true,
      sources: [
        { kind: "image", url: "https://webcamsdemexico.net/nuevovallarta1/live.jpg" },
        { kind: "image", url: "https://webcamsdemexico.net/puertovallarta5/live.jpg" },
        { kind: "image", url: "https://webcamsdemexico.net/puertovallarta4/live.jpg" },
      ],
    },
    {
      id: "tropical",
      title: "Tropical Activity",
      group: "weather",
      refreshSeconds: 600,
      enabled: true,
      sources: [
        { kind: "image", url: "https://www.nhc.noaa.gov/xgtwo/two_pac_0d0.png" },
        { kind: "image", url: "https://www.nhc.noaa.gov/xgtwo/two_pac_7d0.png" },
      ],
    },
    {
      id: "propagation",
      title: "HF Propagation",
      group: "radio",
      refreshSeconds: 900,
      enabled: true,
      sources: [
        { kind: "image", url: `https://img.propagation.dr2w.de/n-america/10M/dr2w_10M_${utcHour}.png` },
        { kind: "image", url: `https://img.propagation.dr2w.de/n-america/20M/dr2w_20M_${utcHour}.png` },
        { kind: "image", url: `https://img.propagation.dr2w.de/n-america/40M/dr2w_40M_${utcHour}.png` },
      ],
    },
  ],
  feeds: [
    {
      id: "nhc-epac-en",
      name: "NHC Eastern Pacific",
      category: "weather",
      kind: "rss",
      url: "https://www.nhc.noaa.gov/index-ep.xml",
      priority: 10,
      enabled: true,
      tags: ["official", "hurricane", "pacific"],
    },
    {
      id: "nhc-epac-es",
      name: "NHC Eastern Pacific Spanish",
      category: "weather",
      kind: "rss",
      url: "https://www.nhc.noaa.gov/index-ep-sp.xml",
      priority: 10,
      enabled: true,
      tags: ["official", "huracan", "pacifico"],
    },
  ],
};
```

- [ ] **Step 3: Write merge tests**

Create `src/config/mergeConfig.test.ts`:

```ts
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
});
```

- [ ] **Step 4: Implement config merge**

Create `src/config/mergeConfig.ts`:

```ts
import type { DashboardConfig, DashboardOverrides } from "./types";

export function mergeConfig(base: DashboardConfig, overrides: DashboardOverrides | null | undefined): DashboardConfig {
  if (!overrides) return structuredClone(base);

  const merged: DashboardConfig = {
    ...structuredClone(base),
    ...(overrides.workerEndpoint !== undefined ? { workerEndpoint: overrides.workerEndpoint } : {}),
    ...(overrides.socialMonitoringEnabled !== undefined ? { socialMonitoringEnabled: overrides.socialMonitoringEnabled } : {}),
    ...(overrides.urgencyKeywords ? { urgencyKeywords: [...overrides.urgencyKeywords] } : {}),
  };

  if (overrides.tiles) {
    const byId = new Map(overrides.tiles.map((tile) => [tile.id, tile]));
    merged.tiles = merged.tiles.map((tile) => ({ ...tile, ...byId.get(tile.id), id: tile.id }));
  }

  if (overrides.feeds) {
    const byId = new Map(overrides.feeds.map((feed) => [feed.id, feed]));
    merged.feeds = merged.feeds.map((feed) => ({ ...feed, ...byId.get(feed.id), id: feed.id }));
  }

  return merged;
}
```

- [ ] **Step 5: Add settings storage tests**

Create `src/storage/settingsStorage.test.ts`:

```ts
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
```

- [ ] **Step 6: Implement settings storage**

Create `src/storage/settingsStorage.ts`:

```ts
import type { DashboardOverrides } from "../config/types";

const SETTINGS_KEY = "emergency-dashboard-settings-v1";

export function loadSettings(): DashboardOverrides | null {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as DashboardOverrides;
  } catch {
    localStorage.removeItem(SETTINGS_KEY);
    return null;
  }
}

export function saveSettings(overrides: DashboardOverrides): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(overrides));
}

export function clearSettings(): void {
  localStorage.removeItem(SETTINGS_KEY);
}
```

- [ ] **Step 7: Run tests**

Run:

```bash
npm test -- src/config/mergeConfig.test.ts src/storage/settingsStorage.test.ts
```

Expected: all tests pass.

- [ ] **Step 8: Commit config foundation**

```bash
git add src/config src/storage
git commit -m "feat: add dashboard configuration foundation"
```

## Task 3: Feed Contracts And Urgency Scoring

**Files:**
- Create: `src/feeds/types.ts`
- Create: `src/feeds/urgency.ts`
- Create: `src/feeds/urgency.test.ts`

- [ ] **Step 1: Add feed contracts**

Create `src/feeds/types.ts`:

```ts
import type { FeedCategory } from "../config/types";

export type Urgency = "normal" | "watch" | "urgent";

export type FeedItem = {
  id: string;
  sourceId: string;
  sourceName: string;
  title: string;
  summary?: string;
  url: string;
  publishedAt?: string;
  fetchedAt: string;
  category: FeedCategory;
  urgency: Urgency;
  tags: string[];
  location?: string;
};

export type FeedSourceStatus = {
  sourceId: string;
  ok: boolean;
  fetchedAt: string;
  itemCount: number;
  error?: string;
};

export type FeedResponse = {
  items: FeedItem[];
  statuses: FeedSourceStatus[];
};
```

- [ ] **Step 2: Write urgency tests**

Create `src/feeds/urgency.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { scoreUrgency } from "./urgency";

describe("scoreUrgency", () => {
  const keywords = ["Puerto Vallarta", "huracán", "evacuation", "flood"];

  it("marks official high-priority keyword matches urgent", () => {
    expect(
      scoreUrgency({
        title: "Huracán cerca de Puerto Vallarta",
        summary: "Aviso oficial",
        sourcePriority: 10,
        keywords,
      }),
    ).toBe("urgent");
  });

  it("marks lower-priority keyword matches as watch", () => {
    expect(
      scoreUrgency({
        title: "Flood risk increases",
        summary: "",
        sourcePriority: 3,
        keywords,
      }),
    ).toBe("watch");
  });

  it("marks unrelated items normal", () => {
    expect(
      scoreUrgency({
        title: "Community meeting schedule",
        summary: "No hazards reported",
        sourcePriority: 10,
        keywords,
      }),
    ).toBe("normal");
  });
});
```

- [ ] **Step 3: Implement urgency scoring**

Create `src/feeds/urgency.ts`:

```ts
import type { Urgency } from "./types";

type ScoreUrgencyInput = {
  title: string;
  summary?: string;
  sourcePriority: number;
  keywords: string[];
};

export function scoreUrgency(input: ScoreUrgencyInput): Urgency {
  const haystack = `${input.title} ${input.summary ?? ""}`.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const matches = input.keywords.filter((keyword) =>
    haystack.includes(keyword.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()),
  );

  if (matches.length === 0) return "normal";
  if (input.sourcePriority >= 8 || matches.length >= 2) return "urgent";
  return "watch";
}
```

- [ ] **Step 4: Run tests**

Run:

```bash
npm test -- src/feeds/urgency.test.ts
```

Expected: all urgency tests pass.

- [ ] **Step 5: Commit feed foundation**

```bash
git add src/feeds
git commit -m "feat: add feed contracts and urgency scoring"
```

## Task 4: Cloudflare Worker Feed Adapter

**Files:**
- Create: `worker/wrangler.toml`
- Create: `worker/src/index.ts`
- Create: `worker/src/config.ts`
- Create: `worker/src/feedTypes.ts`
- Create: `worker/src/parsers.ts`
- Create: `worker/src/normalize.ts`
- Create: `worker/src/providers.ts`
- Create: `worker/test/parsers.test.ts`
- Create: `worker/test/worker.test.ts`

- [ ] **Step 1: Add Worker config**

Create `worker/wrangler.toml`:

```toml
name = "emergency-weather-dashboard-feeds"
main = "src/index.ts"
compatibility_date = "2026-05-29"

[vars]
CACHE_SECONDS = "180"
```

- [ ] **Step 2: Add Worker feed types**

Create `worker/src/feedTypes.ts` with the same shape used by the frontend:

```ts
export type FeedCategory = "weather" | "emergency" | "local" | "radio" | "news" | "social";
export type Urgency = "normal" | "watch" | "urgent";

export type WorkerFeedSource = {
  id: string;
  name: string;
  category: FeedCategory;
  kind: "rss" | "atom" | "json" | "social";
  url: string;
  priority: number;
  enabled: boolean;
  tags: string[];
};

export type RawFeedEntry = {
  title: string;
  summary?: string;
  url: string;
  publishedAt?: string;
};

export type FeedItem = RawFeedEntry & {
  id: string;
  sourceId: string;
  sourceName: string;
  fetchedAt: string;
  category: FeedCategory;
  urgency: Urgency;
  tags: string[];
};

export type FeedSourceStatus = {
  sourceId: string;
  ok: boolean;
  fetchedAt: string;
  itemCount: number;
  error?: string;
};

export type FeedResponse = {
  items: FeedItem[];
  statuses: FeedSourceStatus[];
};
```

- [ ] **Step 3: Add parser tests**

Create `worker/test/parsers.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseJsonFeed, parseXmlFeed } from "../src/parsers";

describe("parseXmlFeed", () => {
  it("parses RSS items", () => {
    const xml = `<?xml version="1.0"?><rss><channel><item><title>Storm update</title><link>https://example.com/storm</link><description>Heavy rain</description><pubDate>Fri, 29 May 2026 12:00:00 GMT</pubDate></item></channel></rss>`;
    expect(parseXmlFeed(xml)).toEqual([
      {
        title: "Storm update",
        url: "https://example.com/storm",
        summary: "Heavy rain",
        publishedAt: "Fri, 29 May 2026 12:00:00 GMT",
      },
    ]);
  });

  it("parses Atom entries", () => {
    const xml = `<feed><entry><title>Alert</title><link href="https://example.com/alert"/><summary>Watch issued</summary><updated>2026-05-29T12:00:00Z</updated></entry></feed>`;
    expect(parseXmlFeed(xml)).toEqual([
      {
        title: "Alert",
        url: "https://example.com/alert",
        summary: "Watch issued",
        publishedAt: "2026-05-29T12:00:00Z",
      },
    ]);
  });
});

describe("parseJsonFeed", () => {
  it("parses common JSON feed items", () => {
    const json = JSON.stringify({
      items: [
        {
          title: "Local alert",
          url: "https://example.com/local-alert",
          summary: "Road flooding",
          date_published: "2026-05-29T12:00:00Z",
        },
      ],
    });

    expect(parseJsonFeed(json)).toEqual([
      {
        title: "Local alert",
        url: "https://example.com/local-alert",
        summary: "Road flooding",
        publishedAt: "2026-05-29T12:00:00Z",
      },
    ]);
  });
});
```

- [ ] **Step 4: Implement XML parser**

Create `worker/src/parsers.ts`:

```ts
import type { RawFeedEntry } from "./feedTypes";

function textBetween(xml: string, tag: string): string | undefined {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim();
}

function attr(xml: string, tag: string, name: string): string | undefined {
  const match = xml.match(new RegExp(`<${tag}[^>]*\\s${name}=["']([^"']+)["'][^>]*>`, "i"));
  return match?.[1];
}

export function parseXmlFeed(xml: string): RawFeedEntry[] {
  const rssItems = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((match) => match[0]);
  if (rssItems.length > 0) {
    return rssItems.map((item) => ({
      title: textBetween(item, "title") ?? "Untitled",
      url: textBetween(item, "link") ?? "",
      summary: textBetween(item, "description"),
      publishedAt: textBetween(item, "pubDate"),
    })).filter((item) => item.url);
  }

  return [...xml.matchAll(/<entry[\s\S]*?<\/entry>/gi)].map((match) => match[0]).map((entry) => ({
    title: textBetween(entry, "title") ?? "Untitled",
    url: attr(entry, "link", "href") ?? textBetween(entry, "link") ?? "",
    summary: textBetween(entry, "summary") ?? textBetween(entry, "content"),
    publishedAt: textBetween(entry, "updated") ?? textBetween(entry, "published"),
  })).filter((item) => item.url);
}

export function parseJsonFeed(body: string): RawFeedEntry[] {
  const parsed = JSON.parse(body) as { items?: Array<Record<string, unknown>> };
  return (parsed.items ?? []).map((item) => ({
    title: String(item.title ?? "Untitled"),
    url: String(item.url ?? item.link ?? ""),
    summary: item.summary ? String(item.summary) : item.content_text ? String(item.content_text) : undefined,
    publishedAt: item.date_published ? String(item.date_published) : item.publishedAt ? String(item.publishedAt) : undefined,
  })).filter((item) => item.url);
}
```

- [ ] **Step 5: Add provider adapters**

Create `worker/src/providers.ts`:

```ts
import type { RawFeedEntry, WorkerFeedSource } from "./feedTypes";
import { parseJsonFeed, parseXmlFeed } from "./parsers";

export async function fetchRawEntries(source: WorkerFeedSource): Promise<RawFeedEntry[]> {
  if (source.kind === "social") {
    return [];
  }

  const response = await fetch(source.url, {
    headers: { "user-agent": "emergency-weather-dashboard/0.1" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const body = await response.text();
  if (source.kind === "json") return parseJsonFeed(body);
  return parseXmlFeed(body);
}
```

- [ ] **Step 6: Add Worker defaults and normalization**

Create `worker/src/config.ts`:

```ts
import type { WorkerFeedSource } from "./feedTypes";

export const workerFeedSources: WorkerFeedSource[] = [
  {
    id: "nhc-epac-en",
    name: "NHC Eastern Pacific",
    category: "weather",
    kind: "rss",
    url: "https://www.nhc.noaa.gov/index-ep.xml",
    priority: 10,
    enabled: true,
    tags: ["official", "hurricane", "pacific"],
  },
  {
    id: "nhc-epac-es",
    name: "NHC Eastern Pacific Spanish",
    category: "weather",
    kind: "rss",
    url: "https://www.nhc.noaa.gov/index-ep-sp.xml",
    priority: 10,
    enabled: true,
    tags: ["official", "huracan", "pacifico"],
  },
];

export const urgencyKeywords = ["huracan", "huracán", "tormenta tropical", "Puerto Vallarta", "Jalisco", "evacuacion", "evacuación", "inundacion", "inundación", "marejada", "hurricane", "tropical storm", "flood", "surge", "evacuation"];
```

Create `worker/src/normalize.ts`:

```ts
import type { FeedItem, RawFeedEntry, Urgency, WorkerFeedSource } from "./feedTypes";
import { urgencyKeywords } from "./config";

function scoreUrgency(entry: RawFeedEntry, priority: number): Urgency {
  const haystack = `${entry.title} ${entry.summary ?? ""}`.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const matches = urgencyKeywords.filter((keyword) =>
    haystack.includes(keyword.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()),
  );
  if (matches.length === 0) return "normal";
  if (priority >= 8 || matches.length >= 2) return "urgent";
  return "watch";
}

export function normalizeEntry(entry: RawFeedEntry, source: WorkerFeedSource, fetchedAt: string): FeedItem {
  return {
    ...entry,
    id: `${source.id}:${entry.url}`,
    sourceId: source.id,
    sourceName: source.name,
    fetchedAt,
    category: source.category,
    urgency: scoreUrgency(entry, source.priority),
    tags: source.tags,
  };
}
```

- [ ] **Step 7: Add Worker route tests**

Create `worker/test/worker.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import worker from "../src/index";

describe("worker", () => {
  it("returns health", async () => {
    const response = await worker.fetch(new Request("https://feeds.example.test/api/health"));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true });
  });

  it("returns 404 for unknown routes", async () => {
    const response = await worker.fetch(new Request("https://feeds.example.test/nope"));
    expect(response.status).toBe(404);
  });
});
```

- [ ] **Step 8: Implement Worker routing**

Create `worker/src/index.ts`:

```ts
import { workerFeedSources } from "./config";
import type { FeedResponse, FeedSourceStatus, WorkerFeedSource } from "./feedTypes";
import { normalizeEntry } from "./normalize";
import { fetchRawEntries } from "./providers";

type Env = {
  CACHE_SECONDS?: string;
};

async function fetchSource(source: WorkerFeedSource): Promise<FeedResponse> {
  const fetchedAt = new Date().toISOString();
  try {
    const rawEntries = await fetchRawEntries(source);
    const items = rawEntries.map((entry) => normalizeEntry(entry, source, fetchedAt));
    const status: FeedSourceStatus = { sourceId: source.id, ok: true, fetchedAt, itemCount: items.length };
    return { items, statuses: [status] };
  } catch (error) {
    return {
      items: [],
      statuses: [{ sourceId: source.id, ok: false, fetchedAt, itemCount: 0, error: error instanceof Error ? error.message : "Unknown error" }],
    };
  }
}

async function feedsResponse(sourceId?: string): Promise<Response> {
  const sources = workerFeedSources.filter((source) => source.enabled && (!sourceId || source.id === sourceId));
  const results = await Promise.all(sources.map(fetchSource));
  const payload: FeedResponse = {
    items: results.flatMap((result) => result.items).sort((a, b) => (b.publishedAt ?? b.fetchedAt).localeCompare(a.publishedAt ?? a.fetchedAt)),
    statuses: results.flatMap((result) => result.statuses),
  };

  return json(payload, 200, { "Cache-Control": "public, max-age=180" });
}

function json(payload: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      ...headers,
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const cacheSeconds = Number(env.CACHE_SECONDS ?? "180");

    if (url.pathname === "/api/health") {
      return json({ ok: true, cacheSeconds, sourceCount: workerFeedSources.length });
    }

    if (url.pathname === "/api/feeds") {
      return feedsResponse();
    }

    const match = url.pathname.match(/^\/api\/feeds\/([^/]+)$/);
    if (match?.[1]) {
      return feedsResponse(match[1]);
    }

    return json({ error: "Not found" }, 404);
  },
};
```

- [ ] **Step 9: Run Worker tests**

Run:

```bash
npm run worker:test
```

Expected: Worker tests pass.

- [ ] **Step 10: Commit Worker adapter**

```bash
git add worker
git commit -m "feat: add cloudflare worker feed adapter"
```

## Task 5: Frontend Feed Client And Feed Panel

**Files:**
- Create: `src/feeds/feedClient.ts`
- Create: `src/feeds/feedClient.test.ts`
- Create: `src/components/FeedPanel.tsx`
- Create: `src/components/FeedPanel.test.tsx`
- Modify: `src/styles/app.css`

- [ ] **Step 1: Add feed client tests**

Create `src/feeds/feedClient.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchFeeds } from "./feedClient";

describe("fetchFeeds", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("fetches normalized Worker feeds", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ items: [], statuses: [] }), { status: 200 })));
    await expect(fetchFeeds("/api")).resolves.toEqual({ items: [], statuses: [] });
    expect(fetch).toHaveBeenCalledWith("/api/feeds");
  });

  it("returns an empty response when no endpoint is configured", async () => {
    await expect(fetchFeeds(undefined)).resolves.toEqual({ items: [], statuses: [] });
  });
});
```

- [ ] **Step 2: Implement feed client**

Create `src/feeds/feedClient.ts`:

```ts
import type { FeedResponse } from "./types";

export async function fetchFeeds(workerEndpoint: string | undefined): Promise<FeedResponse> {
  if (!workerEndpoint) return { items: [], statuses: [] };

  const base = workerEndpoint.replace(/\/$/, "");
  const response = await fetch(`${base}/feeds`);
  if (!response.ok) throw new Error(`Feed request failed: HTTP ${response.status}`);
  return response.json() as Promise<FeedResponse>;
}
```

- [ ] **Step 3: Add FeedPanel tests**

Create `src/components/FeedPanel.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FeedPanel } from "./FeedPanel";
import type { FeedItem } from "../feeds/types";

const baseItem: FeedItem = {
  id: "1",
  sourceId: "nhc",
  sourceName: "NHC",
  title: "Huracán watch near Puerto Vallarta",
  url: "https://example.com",
  fetchedAt: "2026-05-29T12:00:00Z",
  category: "weather",
  urgency: "urgent",
  tags: ["official"],
};

describe("FeedPanel", () => {
  it("renders urgent items first", () => {
    render(<FeedPanel items={[{ ...baseItem, id: "2", urgency: "normal", title: "Normal update" }, baseItem]} statuses={[]} />);
    const headings = screen.getAllByRole("link").map((link) => link.textContent);
    expect(headings[0]).toBe("Huracán watch near Puerto Vallarta");
  });

  it("shows source errors", () => {
    render(<FeedPanel items={[]} statuses={[{ sourceId: "nhc", ok: false, fetchedAt: "2026-05-29T12:00:00Z", itemCount: 0, error: "HTTP 500" }]} />);
    expect(screen.getByText(/nhc: HTTP 500/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Implement FeedPanel**

Create `src/components/FeedPanel.tsx`:

```tsx
import type { FeedItem, FeedSourceStatus } from "../feeds/types";

type FeedPanelProps = {
  items: FeedItem[];
  statuses: FeedSourceStatus[];
};

const urgencyOrder = { urgent: 0, watch: 1, normal: 2 };

export function FeedPanel({ items, statuses }: FeedPanelProps) {
  const sorted = [...items].sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
  const errors = statuses.filter((status) => !status.ok);

  return (
    <section className="feed-panel" aria-label="Emergency and news feed">
      <header className="panel-header">
        <h2>Emergency Feed</h2>
        <span>{items.length} items</span>
      </header>
      {errors.map((status) => (
        <p className="source-error" key={status.sourceId}>{status.sourceId}: {status.error}</p>
      ))}
      <div className="feed-list">
        {sorted.map((item) => (
          <article className={`feed-item feed-item-${item.urgency}`} key={item.id}>
            <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
            <p>{item.summary}</p>
            <small>{item.sourceName} · {item.urgency}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Add feed styles**

Append to `src/styles/app.css`:

```css
.feed-panel {
  min-width: 0;
  padding: 12px;
  background: #111820;
  border: 1px solid #2b3948;
  border-radius: 8px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.panel-header h2 {
  margin: 0;
  font-size: 1rem;
}

.feed-list {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.feed-item {
  padding: 10px;
  border-left: 4px solid #667085;
  background: #0b1017;
}

.feed-item a {
  color: #f5f7fb;
  font-weight: 700;
}

.feed-item p {
  margin: 6px 0;
  color: #b8c3cf;
}

.feed-item-urgent {
  border-color: #ef4444;
  background: #241010;
}

.feed-item-watch {
  border-color: #f59e0b;
}

.source-error {
  color: #fca5a5;
}
```

- [ ] **Step 6: Run tests**

Run:

```bash
npm test -- src/feeds/feedClient.test.ts src/components/FeedPanel.test.tsx
```

Expected: tests pass.

- [ ] **Step 7: Commit feed UI**

```bash
git add src/feeds src/components/FeedPanel.tsx src/components/FeedPanel.test.tsx src/styles/app.css
git commit -m "feat: add frontend feed panel"
```

## Task 6: Dashboard Tiles And Responsive Layout

**Files:**
- Create: `src/components/Tile.tsx`
- Create: `src/components/Tile.test.tsx`
- Create: `src/components/TopBar.tsx`
- Create: `src/components/Dashboard.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/app.css`

- [ ] **Step 1: Add Tile tests**

Create `src/components/Tile.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tile } from "./Tile";
import type { DashboardTile } from "../config/types";

const tile: DashboardTile = {
  id: "cams",
  title: "Cams",
  group: "local",
  refreshSeconds: 10,
  enabled: true,
  sources: [
    { kind: "image", url: "https://example.com/one.jpg" },
    { kind: "image", url: "https://example.com/two.jpg" },
  ],
};

describe("Tile", () => {
  it("renders the current image source", () => {
    render(<Tile tile={tile} />);
    expect(screen.getByAltText("Cams")).toHaveAttribute("src", expect.stringContaining("one.jpg"));
  });

  it("rotates sources on next click", () => {
    render(<Tile tile={tile} />);
    fireEvent.click(screen.getByRole("button", { name: /next source/i }));
    expect(screen.getByAltText("Cams")).toHaveAttribute("src", expect.stringContaining("two.jpg"));
  });
});
```

- [ ] **Step 2: Implement Tile**

Create `src/components/Tile.tsx`:

```tsx
import { Maximize2, RotateCw } from "lucide-react";
import { useState } from "react";
import type { DashboardTile } from "../config/types";

type TileProps = {
  tile: DashboardTile;
};

export function Tile({ tile }: TileProps) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const source = tile.sources[index] ?? tile.sources[0];

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
```

- [ ] **Step 3: Add TopBar**

Create `src/components/TopBar.tsx`:

```tsx
import type { DashboardConfig } from "../config/types";

type TopBarProps = {
  config: DashboardConfig;
};

export function TopBar({ config }: TopBarProps) {
  const now = new Date();
  const localTime = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: config.site.timezone,
  }).format(now);
  const utcTime = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";

  return (
    <header className="top-bar">
      <span>{localTime}</span>
      <strong>{config.site.callSign}</strong>
      <span>{utcTime}</span>
    </header>
  );
}
```

- [ ] **Step 4: Implement Dashboard composition**

Create `src/components/Dashboard.tsx`:

```tsx
import type { DashboardConfig } from "../config/types";
import type { FeedResponse } from "../feeds/types";
import { FeedPanel } from "./FeedPanel";
import { Tile } from "./Tile";
import { TopBar } from "./TopBar";

type DashboardProps = {
  config: DashboardConfig;
  feedResponse: FeedResponse;
};

export function Dashboard({ config, feedResponse }: DashboardProps) {
  const tiles = config.tiles.filter((tile) => tile.enabled);

  return (
    <div className="dashboard-shell">
      <TopBar config={config} />
      <section className="dashboard-grid" aria-label="Dashboard tiles">
        {tiles.map((tile) => <Tile key={tile.id} tile={tile} />)}
      </section>
      <FeedPanel items={feedResponse.items} statuses={feedResponse.statuses} />
    </div>
  );
}
```

- [ ] **Step 5: Wire App to config and feeds**

Modify `src/App.tsx`:

```tsx
import { useEffect, useMemo, useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { defaultConfig } from "./config/defaultConfig";
import { mergeConfig } from "./config/mergeConfig";
import { fetchFeeds } from "./feeds/feedClient";
import type { FeedResponse } from "./feeds/types";
import { loadSettings } from "./storage/settingsStorage";

const emptyFeeds: FeedResponse = { items: [], statuses: [] };

export function App() {
  const config = useMemo(() => mergeConfig(defaultConfig, loadSettings()), []);
  const [feedResponse, setFeedResponse] = useState<FeedResponse>(emptyFeeds);

  useEffect(() => {
    let cancelled = false;
    fetchFeeds(config.workerEndpoint)
      .then((response) => {
        if (!cancelled) setFeedResponse(response);
      })
      .catch(() => {
        if (!cancelled) setFeedResponse(emptyFeeds);
      });
    return () => {
      cancelled = true;
    };
  }, [config.workerEndpoint]);

  return <Dashboard config={config} feedResponse={feedResponse} />;
}
```

- [ ] **Step 6: Add responsive dashboard styles**

Append to `src/styles/app.css`:

```css
.dashboard-shell {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 28vw);
  gap: 10px;
  padding: 10px;
}

.top-bar {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  background: #111820;
  border: 1px solid #2b3948;
}

.top-bar span:last-child {
  text-align: right;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-rows: minmax(180px, 1fr);
  gap: 10px;
  min-height: 0;
}

.tile {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: auto 1fr;
  overflow: hidden;
  border: 1px solid #2b3948;
  background: #0b1017;
  border-radius: 8px;
}

.tile-expanded {
  position: fixed;
  inset: 12px;
  z-index: 10;
}

.tile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  background: #111820;
}

.tile-header h3 {
  margin: 0;
  font-size: 0.9rem;
}

.tile-actions {
  display: flex;
  gap: 4px;
}

.tile button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid #39485a;
  background: #17212c;
  color: #f5f7fb;
}

.tile img,
.tile video,
.tile iframe {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 0;
}

@media (max-width: 900px) {
  .dashboard-shell {
    grid-template-columns: 1fr;
  }

  .top-bar {
    grid-template-columns: 1fr;
  }

  .top-bar span:last-child {
    text-align: left;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: 260px;
  }
}
```

- [ ] **Step 7: Run tests and build**

Run:

```bash
npm test -- src/components/Tile.test.tsx
npm run build
```

Expected: Tile tests and production build pass.

- [ ] **Step 8: Commit dashboard UI**

```bash
git add src
git commit -m "feat: add responsive dashboard layout"
```

## Task 7: Settings Panel And Local Overrides

**Files:**
- Create: `src/components/SettingsPanel.tsx`
- Create: `src/components/SettingsPanel.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/app.css`

- [ ] **Step 1: Add SettingsPanel tests**

Create `src/components/SettingsPanel.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { defaultConfig } from "../config/defaultConfig";
import { SettingsPanel } from "./SettingsPanel";

describe("SettingsPanel", () => {
  it("saves worker endpoint overrides", () => {
    const onSave = vi.fn();
    render(<SettingsPanel config={defaultConfig} onSave={onSave} onReset={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/worker endpoint/i), { target: { value: "https://feeds.example.workers.dev/api" } });
    fireEvent.click(screen.getByRole("button", { name: /save settings/i }));

    expect(onSave).toHaveBeenCalledWith({ workerEndpoint: "https://feeds.example.workers.dev/api" });
  });

  it("calls reset", () => {
    const onReset = vi.fn();
    render(<SettingsPanel config={defaultConfig} onSave={vi.fn()} onReset={onReset} />);
    fireEvent.click(screen.getByRole("button", { name: /reset settings/i }));
    expect(onReset).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Implement SettingsPanel**

Create `src/components/SettingsPanel.tsx`:

```tsx
import { useState } from "react";
import type { DashboardConfig, DashboardOverrides } from "../config/types";

type SettingsPanelProps = {
  config: DashboardConfig;
  onSave: (overrides: DashboardOverrides) => void;
  onReset: () => void;
};

export function SettingsPanel({ config, onSave, onReset }: SettingsPanelProps) {
  const [workerEndpoint, setWorkerEndpoint] = useState(config.workerEndpoint ?? "");

  return (
    <aside className="settings-panel" aria-label="Dashboard settings">
      <h2>Settings</h2>
      <label>
        Worker endpoint
        <input value={workerEndpoint} onChange={(event) => setWorkerEndpoint(event.target.value)} placeholder="/api" />
      </label>
      <div className="settings-actions">
        <button type="button" onClick={() => onSave({ workerEndpoint })}>Save settings</button>
        <button type="button" onClick={onReset}>Reset settings</button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Wire settings into App**

Modify `src/App.tsx`:

```tsx
import { Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { SettingsPanel } from "./components/SettingsPanel";
import { defaultConfig } from "./config/defaultConfig";
import { mergeConfig } from "./config/mergeConfig";
import type { DashboardOverrides } from "./config/types";
import { fetchFeeds } from "./feeds/feedClient";
import type { FeedResponse } from "./feeds/types";
import { clearSettings, loadSettings, saveSettings } from "./storage/settingsStorage";

const emptyFeeds: FeedResponse = { items: [], statuses: [] };

export function App() {
  const [overrides, setOverrides] = useState<DashboardOverrides | null>(() => loadSettings());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const config = useMemo(() => mergeConfig(defaultConfig, overrides), [overrides]);
  const [feedResponse, setFeedResponse] = useState<FeedResponse>(emptyFeeds);

  useEffect(() => {
    let cancelled = false;
    fetchFeeds(config.workerEndpoint)
      .then((response) => {
        if (!cancelled) setFeedResponse(response);
      })
      .catch(() => {
        if (!cancelled) setFeedResponse(emptyFeeds);
      });
    return () => {
      cancelled = true;
    };
  }, [config.workerEndpoint]);

  function handleSave(nextOverrides: DashboardOverrides) {
    saveSettings(nextOverrides);
    setOverrides(nextOverrides);
    setSettingsOpen(false);
  }

  function handleReset() {
    clearSettings();
    setOverrides(null);
    setSettingsOpen(false);
  }

  return (
    <>
      <button className="settings-toggle" type="button" aria-label="Open settings" onClick={() => setSettingsOpen(!settingsOpen)}>
        <Settings size={18} />
      </button>
      <Dashboard config={config} feedResponse={feedResponse} />
      {settingsOpen && <SettingsPanel config={config} onSave={handleSave} onReset={handleReset} />}
    </>
  );
}
```

- [ ] **Step 4: Add settings styles**

Append to `src/styles/app.css`:

```css
.settings-toggle {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 20;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid #39485a;
  background: #17212c;
  color: #f5f7fb;
}

.settings-panel {
  position: fixed;
  right: 16px;
  bottom: 72px;
  z-index: 20;
  width: min(420px, calc(100vw - 32px));
  display: grid;
  gap: 12px;
  padding: 16px;
  background: #111820;
  border: 1px solid #39485a;
  border-radius: 8px;
}

.settings-panel h2 {
  margin: 0;
  font-size: 1rem;
}

.settings-panel label {
  display: grid;
  gap: 6px;
}

.settings-panel input {
  min-width: 0;
  padding: 8px;
  border: 1px solid #39485a;
  background: #05070a;
  color: #f5f7fb;
}

.settings-actions {
  display: flex;
  gap: 8px;
}
```

- [ ] **Step 5: Run tests and build**

Run:

```bash
npm test -- src/components/SettingsPanel.test.tsx src/storage/settingsStorage.test.ts
npm run build
```

Expected: tests and build pass.

- [ ] **Step 6: Commit settings**

```bash
git add src
git commit -m "feat: add local dashboard settings"
```

## Task 8: Documentation And Deployment Notes

**Files:**
- Modify: `README.md`
- Create: `docs/deployment.md`

- [ ] **Step 1: Replace README with modern setup guide**

Update `README.md`:

```md
# Emergency Weather Dashboard

Static-first weather, emergency, and ham radio dashboard for Puerto Vallarta.

## Modes

- Static only: deploy the frontend as static files. Some feeds may be limited by browser restrictions.
- Static plus Cloudflare Worker: deploy the frontend and Worker. This is recommended for reliable feed normalization, caching, and CORS handling.

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The static output is written to `dist/`.

## Cloudflare Worker

```bash
npx wrangler dev --config worker/wrangler.toml
npx wrangler deploy --config worker/wrangler.toml
```

Set the dashboard Worker endpoint in `src/config/defaultConfig.ts` or through the settings panel.

## Configuration

Edit `src/config/defaultConfig.ts` for deploy-time defaults. Use the dashboard settings button for per-device browser overrides.

## Legacy Dashboard

The previous Hamdash static files are preserved in `legacy/` for reference during the migration.
```

- [ ] **Step 2: Add deployment document**

Create `docs/deployment.md`:

```md
# Deployment

## Cloudflare Pages

1. Connect this repository to Cloudflare Pages.
2. Use `npm run build` as the build command.
3. Use `dist` as the output directory.
4. Point `jorgecedi.com` at the Pages project when the preview is verified.

## Cloudflare Worker

1. Deploy the Worker with `npx wrangler deploy --config worker/wrangler.toml`.
2. Configure a route or subdomain for the Worker.
3. Set the dashboard Worker endpoint to the Worker `/api` base URL.

## Static-Only Copy

Users who do not want a Worker can leave `workerEndpoint` undefined in `src/config/defaultConfig.ts`. The dashboard still renders tiles and local settings, but normalized feed reliability is reduced.
```

- [ ] **Step 3: Verify docs mention both deployment modes**

Run:

```bash
rg -n "Static only|Cloudflare Worker|Cloudflare Pages|legacy" README.md docs/deployment.md
```

Expected: all terms are present.

- [ ] **Step 4: Commit docs**

```bash
git add README.md docs/deployment.md
git commit -m "docs: add dashboard deployment guide"
```

## Task 9: End-To-End Verification

**Files:**
- Modify only files needed to fix verification failures.

- [ ] **Step 1: Run full checks**

Run:

```bash
npm run check
npm run worker:test
```

Expected: all tests and the production build pass.

- [ ] **Step 2: Start local app**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite prints a local URL such as `http://127.0.0.1:5173/`.

- [ ] **Step 3: Browser verification**

Open the local URL and verify:

- The first screen is the dashboard.
- The top bar shows callsign and current time.
- Weather/local/radio tiles render.
- The emergency feed panel renders even when no Worker is running.
- The settings button opens.
- Saving a Worker endpoint persists after reload.
- Mobile viewport stacks sections without overlap.
- Desktop viewport shows a dense TV-style layout.

- [ ] **Step 4: Fix any verification failures**

For each failure, add or update the smallest relevant test first, then implement the fix. Run the targeted test, then run `npm run check`.

- [ ] **Step 5: Final commit**

```bash
git status --short
git add .
git commit -m "test: verify emergency dashboard rollout"
```

Expected: working tree is clean after commit.

## Self-Review

Spec coverage:

- Static-first modern frontend: Tasks 1, 6, 9.
- Optional Cloudflare Worker feed adapter: Task 4.
- Public read-only feeds and urgency display: Tasks 3, 4, 5.
- TV and mobile responsive dashboard: Tasks 6 and 9.
- Repo defaults plus browser-local overrides: Tasks 2 and 7.
- Reliability and partial feed failures: Tasks 4 and 5.
- Copyability and setup documentation: Task 8.
- Rollout verification: Task 9.

No placeholders remain. Type names are consistent across the frontend and Worker plan: `FeedItem`, `FeedResponse`, `FeedSourceStatus`, `DashboardConfig`, and `DashboardOverrides`.
