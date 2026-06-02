# Emergency Readiness Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add dashboard-visible emergency source health and a sidebar reference kit with official contacts, radio references, and an offline checklist.

**Architecture:** Extend the existing `DashboardConfig` with emergency reference data, keep feed/source health derived from the existing `FeedResponse`, and add focused helper functions for stale status and banner selection. Render time-sensitive signals in `Dashboard`, while static reference material remains inside `EmergencyLinksSidebar`.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, CSS.

---

## File Structure

- Modify `src/config/types.ts`: add `EmergencyChecklistItem`, `CriticalContact`, `RadioReference`, and new `DashboardConfig` arrays.
- Modify `src/config/defaultConfig.ts`: add default checklist, official contacts, radio references, and ensure official feed tags remain present.
- Modify `src/config/defaultConfig.test.ts`: verify new defaults.
- Create `src/feeds/sourceFreshness.ts`: pure freshness helpers for source status rows.
- Create `src/feeds/sourceFreshness.test.ts`: tests for fresh, stale, unknown, and error source states.
- Create `src/feeds/emergencyBanner.ts`: pure helper to choose the current emergency banner item.
- Create `src/feeds/emergencyBanner.test.ts`: tests for recent official emergency item selection.
- Create `src/components/EmergencyModeBanner.tsx`: display the selected emergency item.
- Create `src/components/EmergencyModeBanner.test.tsx`: render tests for banner link and hidden state.
- Create `src/components/OfficialSourceStatusPanel.tsx`: display official source health.
- Create `src/components/OfficialSourceStatusPanel.test.tsx`: render tests for status panel states.
- Modify `src/components/EmergencyLinksSidebar.tsx`: render checklist, contacts, and radio reference sections.
- Modify `src/components/EmergencyLinksSidebar.test.tsx`: verify the new sidebar sections.
- Modify `src/components/Dashboard.tsx`: wire banner, status panel, and sidebar props.
- Modify `src/components/Dashboard.test.tsx`: verify banner/status/sidebar integration.
- Modify `src/styles/app.css`: add responsive styling for the banner, status panel, and sidebar reference sections.

---

### Task 1: Add Emergency Reference Defaults

**Files:**
- Modify: `src/config/types.ts`
- Modify: `src/config/defaultConfig.ts`
- Test: `src/config/defaultConfig.test.ts`

- [ ] **Step 1: Write the failing default config test**

Add this test to `src/config/defaultConfig.test.ts`:

```ts
  it("includes emergency checklist, official contacts, and radio references", () => {
    expect(defaultConfig.emergencyChecklist).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "water-food", label: "Water and non-perishable food" }),
        expect.objectContaining({ id: "radio", label: "Battery or hand-crank radio" }),
        expect.objectContaining({ id: "evacuation-bag", label: "Evacuation bag" }),
      ]),
    );

    expect(defaultConfig.criticalContacts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "mexico-emergency", label: "Emergencias Mexico", value: "911", official: true }),
        expect.objectContaining({ id: "cfe", label: "CFE fallas electricas", value: "071", official: true }),
        expect.objectContaining({ id: "capufe", label: "CAPUFE carreteras", value: "074", official: true }),
      ]),
    );

    expect(defaultConfig.radioReferences).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "marine-vhf-16", label: "Marine VHF Ch 16", frequency: "156.800 MHz" }),
        expect.objectContaining({ id: "aviation-guard", label: "Aviation guard", frequency: "121.500 MHz" }),
        expect.objectContaining({ id: "ham-2m-simplex", label: "Ham 2m simplex calling", frequency: "146.520 MHz FM" }),
      ]),
    );
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/config/defaultConfig.test.ts`

Expected: FAIL because `emergencyChecklist`, `criticalContacts`, and `radioReferences` do not exist on `DashboardConfig`.

- [ ] **Step 3: Add config types**

In `src/config/types.ts`, add these types after `EmergencyLinkGroup`:

```ts
export type EmergencyChecklistItem = {
  id: string;
  label: string;
};

export type CriticalContact = {
  id: string;
  label: string;
  value: string;
  note?: string;
  official: boolean;
};

export type RadioReference = {
  id: string;
  label: string;
  frequency: string;
  note?: string;
};
```

Then extend `DashboardConfig`:

```ts
  emergencyLinks: EmergencyLinkGroup[];
  emergencyChecklist: EmergencyChecklistItem[];
  criticalContacts: CriticalContact[];
  radioReferences: RadioReference[];
  urgencyKeywords: string[];
```

- [ ] **Step 4: Add default emergency reference data**

In `src/config/defaultConfig.ts`, add these properties after `emergencyLinks` and before `urgencyKeywords`:

```ts
  emergencyChecklist: [
    { id: "water-food", label: "Water and non-perishable food" },
    { id: "flashlight-batteries", label: "Flashlight and batteries" },
    { id: "power-banks", label: "Charged power banks" },
    { id: "medications-first-aid", label: "Medications and first-aid kit" },
    { id: "documents", label: "Important documents" },
    { id: "cash-keys", label: "Cash and keys" },
    { id: "radio", label: "Battery or hand-crank radio" },
    { id: "family-plan", label: "Family contact plan" },
    { id: "evacuation-bag", label: "Evacuation bag" },
    { id: "pet-supplies", label: "Pet supplies" },
  ],
  criticalContacts: [
    { id: "mexico-emergency", label: "Emergencias Mexico", value: "911", official: true },
    { id: "anonymous-report", label: "Denuncia anonima", value: "089", official: true },
    { id: "pv-police-ambulance", label: "Puerto Vallarta Policia / Ambulancia", value: "911", official: true },
    {
      id: "pv-police-transit",
      label: "Puerto Vallarta Policia y Transito 24/7",
      value: "911 / 322 178 8999",
      official: true,
    },
    {
      id: "pv-civil-protection",
      label: "Puerto Vallarta Proteccion Civil y Bomberos",
      value: "322 178 8000 / 322 226 8080 ext. 3201",
      official: true,
    },
    { id: "badeba-emergency", label: "Bahia de Banderas Emergencias", value: "911", official: true },
    { id: "badeba-public-security", label: "Bahia de Banderas Seguridad Publica", value: "329 291 1896", official: true },
    { id: "badeba-civil-protection", label: "Bahia de Banderas Proteccion Civil", value: "329 291 1818", official: true },
    { id: "cfe", label: "CFE fallas electricas", value: "071", official: true },
    { id: "angeles-verdes", label: "Angeles Verdes carretera/turismo", value: "078", official: true },
    { id: "capufe", label: "CAPUFE carreteras", value: "074", official: true },
  ],
  radioReferences: [
    { id: "marine-vhf-16", label: "Marine VHF Ch 16", frequency: "156.800 MHz" },
    { id: "marine-dsc-70", label: "Marine DSC Ch 70", frequency: "156.525 MHz" },
    { id: "aviation-guard", label: "Aviation guard", frequency: "121.500 MHz" },
    { id: "ham-2m-simplex", label: "Ham 2m simplex calling", frequency: "146.520 MHz FM", note: "Licensed operators only" },
    {
      id: "ham-70cm-simplex",
      label: "Ham 70cm simplex calling",
      frequency: "446.000 MHz FM",
      note: "Verify local band plan/repeater coordination",
    },
  ],
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- src/config/defaultConfig.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/config/types.ts src/config/defaultConfig.ts src/config/defaultConfig.test.ts
git commit -m "Add emergency reference defaults"
```

---

### Task 2: Add Source Freshness Helpers

**Files:**
- Create: `src/feeds/sourceFreshness.ts`
- Test: `src/feeds/sourceFreshness.test.ts`

- [ ] **Step 1: Write the failing helper tests**

Create `src/feeds/sourceFreshness.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { FeedSource } from "../config/types";
import { buildOfficialSourceStatuses } from "./sourceFreshness";

const now = new Date("2026-06-02T12:00:00Z");

const officialEmergency: FeedSource = {
  id: "semar-tsunami-alerts",
  name: "SEMAR Tsunami Alerts",
  category: "emergency",
  url: "https://example.com/semar.xml",
  kind: "rss",
  priority: 10,
  enabled: true,
  tags: ["official"],
};

describe("buildOfficialSourceStatuses", () => {
  it("marks a recent official emergency source fresh", () => {
    const rows = buildOfficialSourceStatuses({
      feeds: [officialEmergency],
      statuses: [{ sourceId: "semar-tsunami-alerts", ok: true, fetchedAt: "2026-06-02T11:30:00Z", itemCount: 1 }],
      now,
    });

    expect(rows[0]).toMatchObject({ sourceId: "semar-tsunami-alerts", label: "SEMAR Tsunami Alerts", state: "fresh" });
  });

  it("marks an old official emergency source stale", () => {
    const rows = buildOfficialSourceStatuses({
      feeds: [officialEmergency],
      statuses: [{ sourceId: "semar-tsunami-alerts", ok: true, fetchedAt: "2026-06-02T08:30:00Z", itemCount: 0 }],
      now,
    });

    expect(rows[0]).toMatchObject({ state: "stale", message: "Source may not be current" });
  });

  it("marks a source with missing status unknown", () => {
    const rows = buildOfficialSourceStatuses({ feeds: [officialEmergency], statuses: [], now });

    expect(rows[0]).toMatchObject({ state: "unknown", fetchedAt: undefined, itemCount: undefined });
  });

  it("marks a feed service error as error", () => {
    const rows = buildOfficialSourceStatuses({
      feeds: [officialEmergency],
      statuses: [{ sourceId: "semar-tsunami-alerts", ok: false, fetchedAt: "2026-06-02T11:30:00Z", itemCount: 0, error: "HTTP 500" }],
      now,
    });

    expect(rows[0]).toMatchObject({ state: "error", message: "HTTP 500" });
  });

  it("ignores non-official sources", () => {
    const rows = buildOfficialSourceStatuses({
      feeds: [{ ...officialEmergency, id: "local-news", name: "Local News", tags: ["local"], category: "local" }],
      statuses: [],
      now,
    });

    expect(rows).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/feeds/sourceFreshness.test.ts`

Expected: FAIL because `sourceFreshness.ts` does not exist.

- [ ] **Step 3: Implement source freshness helpers**

Create `src/feeds/sourceFreshness.ts`:

```ts
import type { FeedSource } from "../config/types";
import type { FeedSourceStatus } from "./types";

export type SourceFreshnessState = "fresh" | "stale" | "error" | "unknown";

export type OfficialSourceStatusRow = {
  sourceId: string;
  label: string;
  category: FeedSource["category"];
  state: SourceFreshnessState;
  fetchedAt?: string;
  itemCount?: number;
  message: string;
};

type BuildOfficialSourceStatusesArgs = {
  feeds: FeedSource[];
  statuses: FeedSourceStatus[];
  now?: Date;
};

const hourMs = 60 * 60 * 1000;

const staleThresholdByCategory: Record<FeedSource["category"], number> = {
  emergency: 2 * hourMs,
  weather: 6 * hourMs,
  local: 24 * hourMs,
  news: 24 * hourMs,
  radio: 24 * hourMs,
  social: 24 * hourMs,
};

export function buildOfficialSourceStatuses({ feeds, statuses, now = new Date() }: BuildOfficialSourceStatusesArgs): OfficialSourceStatusRow[] {
  const statusBySource = new Map(statuses.map((status) => [status.sourceId, status]));

  return feeds
    .filter((feed) => feed.enabled && feed.tags.includes("official"))
    .map((feed) => {
      const status = statusBySource.get(feed.id);

      if (!status) {
        return {
          sourceId: feed.id,
          label: feed.name,
          category: feed.category,
          state: "unknown" as const,
          message: "Unknown",
        };
      }

      if (!status.ok) {
        return {
          sourceId: feed.id,
          label: feed.name,
          category: feed.category,
          state: "error" as const,
          fetchedAt: status.fetchedAt,
          itemCount: status.itemCount,
          message: status.error ?? "Feed check failed",
        };
      }

      const fetchedTime = Date.parse(status.fetchedAt);
      if (!Number.isFinite(fetchedTime)) {
        return {
          sourceId: feed.id,
          label: feed.name,
          category: feed.category,
          state: "unknown" as const,
          fetchedAt: status.fetchedAt,
          itemCount: status.itemCount,
          message: "Unknown",
        };
      }

      const stale = now.getTime() - fetchedTime > staleThresholdByCategory[feed.category];

      return {
        sourceId: feed.id,
        label: feed.name,
        category: feed.category,
        state: stale ? ("stale" as const) : ("fresh" as const),
        fetchedAt: status.fetchedAt,
        itemCount: status.itemCount,
        message: stale ? "Source may not be current" : "Current",
      };
    });
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/feeds/sourceFreshness.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/feeds/sourceFreshness.ts src/feeds/sourceFreshness.test.ts
git commit -m "Add official source freshness helper"
```

---

### Task 3: Add Emergency Banner Selection Helper

**Files:**
- Create: `src/feeds/emergencyBanner.ts`
- Test: `src/feeds/emergencyBanner.test.ts`

- [ ] **Step 1: Write the failing banner selection tests**

Create `src/feeds/emergencyBanner.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { FeedItem } from "./types";
import { selectEmergencyBannerItem } from "./emergencyBanner";

const baseItem: FeedItem = {
  id: "1",
  sourceId: "semar-tsunami-alerts",
  sourceName: "SEMAR Tsunami Alerts",
  title: "Boletin de tsunami",
  url: "https://example.com/alert",
  publishedAt: "2026-06-01T12:00:00Z",
  fetchedAt: "2026-06-02T12:00:00Z",
  category: "emergency",
  urgency: "urgent",
  tags: ["official", "tsunami"],
};

describe("selectEmergencyBannerItem", () => {
  it("returns a recent official emergency item", () => {
    expect(selectEmergencyBannerItem([baseItem], new Date("2026-06-02T12:00:00Z"))?.id).toBe("1");
  });

  it("hides stale official emergency items older than five days", () => {
    const stale = { ...baseItem, publishedAt: "2026-05-20T12:00:00Z" };

    expect(selectEmergencyBannerItem([stale], new Date("2026-06-02T12:00:00Z"))).toBeUndefined();
  });

  it("hides non-official emergency items", () => {
    const unofficial = { ...baseItem, tags: ["local"] };

    expect(selectEmergencyBannerItem([unofficial], new Date("2026-06-02T12:00:00Z"))).toBeUndefined();
  });

  it("prioritizes SEMAR over a newer official weather item", () => {
    const weather: FeedItem = {
      ...baseItem,
      id: "2",
      sourceId: "nhc-epac-es",
      sourceName: "NHC Eastern Pacific Spanish",
      title: "Tormenta tropical",
      publishedAt: "2026-06-02T10:00:00Z",
      category: "weather",
      tags: ["official", "huracan"],
    };

    expect(selectEmergencyBannerItem([weather, baseItem], new Date("2026-06-02T12:00:00Z"))?.sourceId).toBe("semar-tsunami-alerts");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/feeds/emergencyBanner.test.ts`

Expected: FAIL because `emergencyBanner.ts` does not exist.

- [ ] **Step 3: Implement banner selection**

Create `src/feeds/emergencyBanner.ts`:

```ts
import type { FeedItem } from "./types";

const maxAgeMs = 5 * 24 * 60 * 60 * 1000;

function itemTime(item: FeedItem): number {
  const parsed = Date.parse(item.publishedAt ?? item.fetchedAt);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sourcePriority(item: FeedItem): number {
  if (item.sourceId === "semar-tsunami-alerts") {
    return 0;
  }

  if (item.category === "emergency") {
    return 1;
  }

  return 2;
}

export function selectEmergencyBannerItem(items: FeedItem[], now = new Date()): FeedItem | undefined {
  return items
    .filter((item) => item.tags.includes("official"))
    .filter((item) => item.category === "emergency" || item.urgency === "urgent")
    .filter((item) => {
      const publishedTime = itemTime(item);
      return publishedTime > 0 && now.getTime() - publishedTime <= maxAgeMs;
    })
    .sort((a, b) => sourcePriority(a) - sourcePriority(b) || itemTime(b) - itemTime(a))[0];
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/feeds/emergencyBanner.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/feeds/emergencyBanner.ts src/feeds/emergencyBanner.test.ts
git commit -m "Add emergency banner selection"
```

---

### Task 4: Render Emergency Banner and Official Source Panel

**Files:**
- Create: `src/components/EmergencyModeBanner.tsx`
- Create: `src/components/EmergencyModeBanner.test.tsx`
- Create: `src/components/OfficialSourceStatusPanel.tsx`
- Create: `src/components/OfficialSourceStatusPanel.test.tsx`
- Modify: `src/components/Dashboard.tsx`
- Modify: `src/components/Dashboard.test.tsx`

- [ ] **Step 1: Write failing component tests**

Create `src/components/EmergencyModeBanner.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { FeedItem } from "../feeds/types";
import { EmergencyModeBanner } from "./EmergencyModeBanner";

const item: FeedItem = {
  id: "1",
  sourceId: "semar-tsunami-alerts",
  sourceName: "SEMAR Tsunami Alerts",
  title: "Boletin de tsunami",
  url: "https://example.com/alert",
  publishedAt: "2026-06-01T12:00:00Z",
  fetchedAt: "2026-06-02T12:00:00Z",
  category: "emergency",
  urgency: "urgent",
  tags: ["official"],
};

describe("EmergencyModeBanner", () => {
  it("renders a recent official emergency item as an external link", () => {
    render(<EmergencyModeBanner item={item} now={new Date("2026-06-02T12:00:00Z")} />);

    expect(screen.getByText("Emergency mode")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /boletin de tsunami/i })).toHaveAttribute("href", "https://example.com/alert");
    expect(screen.getByText(/SEMAR Tsunami Alerts/i)).toBeInTheDocument();
  });

  it("renders nothing without an item", () => {
    const { container } = render(<EmergencyModeBanner item={undefined} now={new Date("2026-06-02T12:00:00Z")} />);

    expect(container).toBeEmptyDOMElement();
  });
});
```

Create `src/components/OfficialSourceStatusPanel.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { OfficialSourceStatusRow } from "../feeds/sourceFreshness";
import { OfficialSourceStatusPanel } from "./OfficialSourceStatusPanel";

const rows: OfficialSourceStatusRow[] = [
  {
    sourceId: "semar-tsunami-alerts",
    label: "SEMAR Tsunami Alerts",
    category: "emergency",
    state: "fresh",
    fetchedAt: "2026-06-02T11:30:00Z",
    itemCount: 1,
    message: "Current",
  },
  {
    sourceId: "nhc-epac-es",
    label: "NHC Eastern Pacific Spanish",
    category: "weather",
    state: "stale",
    fetchedAt: "2026-06-01T04:00:00Z",
    itemCount: 0,
    message: "Source may not be current",
  },
];

describe("OfficialSourceStatusPanel", () => {
  it("renders official source status rows", () => {
    render(<OfficialSourceStatusPanel rows={rows} />);

    expect(screen.getByRole("heading", { name: /official sources/i })).toBeInTheDocument();
    expect(screen.getByText("SEMAR Tsunami Alerts")).toBeInTheDocument();
    expect(screen.getByText("Source may not be current")).toBeInTheDocument();
  });

  it("renders nothing without official source rows", () => {
    const { container } = render(<OfficialSourceStatusPanel rows={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
```

Add this integration test to `src/components/Dashboard.test.tsx`:

```tsx
  it("shows emergency mode and official source status for recent official alerts", () => {
    render(
      <Dashboard
        config={defaultConfig}
        feedResponse={{
          items: [
            {
              id: "semar-1",
              sourceId: "semar-tsunami-alerts",
              sourceName: "SEMAR Tsunami Alerts",
              title: "Boletin de tsunami",
              url: "https://example.com/alert",
              publishedAt: new Date().toISOString(),
              fetchedAt: new Date().toISOString(),
              category: "emergency",
              urgency: "urgent",
              tags: ["official"],
            },
          ],
          statuses: [{ sourceId: "semar-tsunami-alerts", ok: true, fetchedAt: new Date().toISOString(), itemCount: 1 }],
        }}
      />,
    );

    expect(screen.getByText("Emergency mode")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /official sources/i })).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/components/EmergencyModeBanner.test.tsx src/components/OfficialSourceStatusPanel.test.tsx src/components/Dashboard.test.tsx`

Expected: FAIL because the two components do not exist and `Dashboard` does not render them.

- [ ] **Step 3: Implement `EmergencyModeBanner`**

Create `src/components/EmergencyModeBanner.tsx`:

```tsx
import type { FeedItem } from "../feeds/types";

type EmergencyModeBannerProps = {
  item?: FeedItem;
  now?: Date;
};

function formatAge(item: FeedItem, now: Date): string {
  const value = Date.parse(item.publishedAt ?? item.fetchedAt);
  if (!Number.isFinite(value)) {
    return "time unknown";
  }

  const ageHours = Math.max(0, Math.round((now.getTime() - value) / (60 * 60 * 1000)));
  if (ageHours < 1) {
    return "less than 1 hour ago";
  }
  if (ageHours < 48) {
    return `${ageHours} hours ago`;
  }

  return `${Math.round(ageHours / 24)} days ago`;
}

export function EmergencyModeBanner({ item, now = new Date() }: EmergencyModeBannerProps) {
  if (!item) {
    return null;
  }

  return (
    <section className="emergency-mode-banner" aria-label="Emergency mode">
      <div>
        <p>Emergency mode</p>
        <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
      </div>
      <span>{item.sourceName} · {formatAge(item, now)}</span>
    </section>
  );
}
```

- [ ] **Step 4: Implement `OfficialSourceStatusPanel`**

Create `src/components/OfficialSourceStatusPanel.tsx`:

```tsx
import type { OfficialSourceStatusRow } from "../feeds/sourceFreshness";

type OfficialSourceStatusPanelProps = {
  rows: OfficialSourceStatusRow[];
};

function formatChecked(value?: string): string {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const stateLabels: Record<OfficialSourceStatusRow["state"], string> = {
  fresh: "Fresh",
  stale: "Stale",
  error: "Error",
  unknown: "Unknown",
};

export function OfficialSourceStatusPanel({ rows }: OfficialSourceStatusPanelProps) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <section className="official-source-panel" aria-label="Official source status">
      <header className="panel-header">
        <h2>Official Sources</h2>
        <span>{rows.length} sources</span>
      </header>
      <div className="official-source-list">
        {rows.map((row) => (
          <article className={`official-source-row official-source-${row.state}`} key={row.sourceId}>
            <div>
              <strong>{row.label}</strong>
              <small>{row.message}</small>
            </div>
            <div>
              <span>{stateLabels[row.state]}</span>
              <small>{formatChecked(row.fetchedAt)} · {row.itemCount ?? "Unknown"} items</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Wire the components into `Dashboard`**

Modify `src/components/Dashboard.tsx` imports:

```tsx
import { selectEmergencyBannerItem } from "../feeds/emergencyBanner";
import { buildOfficialSourceStatuses } from "../feeds/sourceFreshness";
import { EmergencyLinksSidebar } from "./EmergencyLinksSidebar";
import { EmergencyModeBanner } from "./EmergencyModeBanner";
import { FeedPanel } from "./FeedPanel";
import { OfficialSourceStatusPanel } from "./OfficialSourceStatusPanel";
```

Inside `Dashboard`, add:

```tsx
  const emergencyBannerItem = selectEmergencyBannerItem(feedResponse.items);
  const officialSourceStatuses = buildOfficialSourceStatuses({
    feeds: config.feeds,
    statuses: feedResponse.statuses,
  });
```

Pass new sidebar props:

```tsx
          checklist={config.emergencyChecklist}
          contacts={config.criticalContacts}
          radioReferences={config.radioReferences}
```

Render the banner and status panel:

```tsx
      <EmergencyModeBanner item={emergencyBannerItem} />
      <section className="dashboard-grid" aria-label="Dashboard tiles">
        {tiles.map((tile) => (
          <Tile key={tile.id} tile={tile} />
        ))}
      </section>
      <div className="dashboard-side-panel">
        <OfficialSourceStatusPanel rows={officialSourceStatuses} />
        <FeedPanel items={feedResponse.items} statuses={feedResponse.statuses} />
      </div>
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm test -- src/components/EmergencyModeBanner.test.tsx src/components/OfficialSourceStatusPanel.test.tsx src/components/Dashboard.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/EmergencyModeBanner.tsx src/components/EmergencyModeBanner.test.tsx src/components/OfficialSourceStatusPanel.tsx src/components/OfficialSourceStatusPanel.test.tsx src/components/Dashboard.tsx src/components/Dashboard.test.tsx
git commit -m "Show emergency mode and official source status"
```

---

### Task 5: Add Sidebar Checklist, Contacts, and Radio References

**Files:**
- Modify: `src/components/EmergencyLinksSidebar.tsx`
- Modify: `src/components/EmergencyLinksSidebar.test.tsx`

- [ ] **Step 1: Write failing sidebar tests**

In `src/components/EmergencyLinksSidebar.test.tsx`, import the new types:

```ts
import type { CriticalContact, EmergencyChecklistItem, EmergencyLinkGroup, RadioReference } from "../config/types";
```

Add these fixtures near `groups`:

```ts
const checklist: EmergencyChecklistItem[] = [
  { id: "water-food", label: "Water and non-perishable food" },
  { id: "radio", label: "Battery or hand-crank radio" },
];

const contacts: CriticalContact[] = [
  { id: "mexico-emergency", label: "Emergencias Mexico", value: "911", official: true },
  { id: "cfe", label: "CFE fallas electricas", value: "071", official: true },
];

const radioReferences: RadioReference[] = [
  { id: "marine-vhf-16", label: "Marine VHF Ch 16", frequency: "156.800 MHz" },
  { id: "ham-2m-simplex", label: "Ham 2m simplex calling", frequency: "146.520 MHz FM", note: "Licensed operators only" },
];
```

Add this test:

```tsx
  it("renders offline checklist, official contacts, and radio references", () => {
    render(
      <EmergencyLinksSidebar
        groups={groups}
        checklist={checklist}
        contacts={contacts}
        radioReferences={radioReferences}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: /offline checklist/i })).toBeInTheDocument();
    expect(screen.getByText("Water and non-perishable food")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /critical contacts/i })).toBeInTheDocument();
    expect(screen.getByText("911")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /radio reference/i })).toBeInTheDocument();
    expect(screen.getByText("146.520 MHz FM")).toBeInTheDocument();
    expect(screen.getByText("Licensed operators only")).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/components/EmergencyLinksSidebar.test.tsx`

Expected: FAIL because the component does not accept the new props or render those sections.

- [ ] **Step 3: Update sidebar props and imports**

In `src/components/EmergencyLinksSidebar.tsx`, change the type import:

```tsx
import type { CriticalContact, EmergencyChecklistItem, EmergencyLinkGroup, EmergencyLinkKind, RadioReference } from "../config/types";
```

Update props:

```tsx
type EmergencyLinksSidebarProps = {
  groups: EmergencyLinkGroup[];
  checklist?: EmergencyChecklistItem[];
  contacts?: CriticalContact[];
  radioReferences?: RadioReference[];
  ignoredOutsideClickRefs?: Array<RefObject<HTMLElement | null>>;
  onClose: () => void;
};
```

Update the function signature:

```tsx
export function EmergencyLinksSidebar({
  groups,
  checklist = [],
  contacts = [],
  radioReferences = [],
  ignoredOutsideClickRefs = [],
  onClose,
}: EmergencyLinksSidebarProps) {
```

- [ ] **Step 4: Render the sidebar reference sections**

Inside the `<div className="emergency-link-groups">`, before `{groups.map(...)}`, add:

```tsx
            {checklist.length > 0 ? (
              <section className="emergency-link-group emergency-reference-section">
                <h3>Offline Checklist</h3>
                <ul className="emergency-checklist">
                  {checklist.map((item) => (
                    <li key={item.id}>{item.label}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {contacts.length > 0 ? (
              <section className="emergency-link-group emergency-reference-section">
                <h3>Critical Contacts</h3>
                <div className="critical-contact-list">
                  {contacts.map((contact) => (
                    <article className="critical-contact" key={contact.id}>
                      <span>{contact.label}</span>
                      <strong>{contact.value}</strong>
                      {contact.note ? <small>{contact.note}</small> : null}
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {radioReferences.length > 0 ? (
              <section className="emergency-link-group emergency-reference-section">
                <h3>Radio Reference</h3>
                <div className="radio-reference-list">
                  {radioReferences.map((reference) => (
                    <article className="radio-reference" key={reference.id}>
                      <span>{reference.label}</span>
                      <strong>{reference.frequency}</strong>
                      {reference.note ? <small>{reference.note}</small> : null}
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- src/components/EmergencyLinksSidebar.test.tsx src/components/Dashboard.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/EmergencyLinksSidebar.tsx src/components/EmergencyLinksSidebar.test.tsx src/components/Dashboard.tsx
git commit -m "Add emergency sidebar reference sections"
```

---

### Task 6: Add Stale Summary and Styling

**Files:**
- Modify: `src/components/FeedPanel.tsx`
- Modify: `src/components/FeedPanel.test.tsx`
- Modify: `src/styles/app.css`

- [ ] **Step 1: Write the failing feed panel test**

Add this test to `src/components/FeedPanel.test.tsx`:

```tsx
  it("shows a clear freshness warning when a source may not be current", () => {
    render(
      <FeedPanel
        items={[]}
        statuses={[{ sourceId: "nhc-epac-es", ok: true, fetchedAt: "2026-05-29T12:00:00Z", itemCount: 0 }]}
        staleSourceCount={1}
      />,
    );

    expect(screen.getByText("1 source may not be current")).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/FeedPanel.test.tsx`

Expected: FAIL because `FeedPanel` does not accept `staleSourceCount`.

- [ ] **Step 3: Add stale summary to `FeedPanel`**

Update `FeedPanelProps` in `src/components/FeedPanel.tsx`:

```tsx
type FeedPanelProps = {
  items: FeedItem[];
  statuses: FeedSourceStatus[];
  staleSourceCount?: number;
};
```

Update the function signature:

```tsx
export function FeedPanel({ items, statuses, staleSourceCount = 0 }: FeedPanelProps) {
```

After the error rendering, add:

```tsx
      {staleSourceCount > 0 ? (
        <p className="source-stale">{staleSourceCount} {staleSourceCount === 1 ? "source" : "sources"} may not be current</p>
      ) : null}
```

In `Dashboard.tsx`, compute and pass the stale count:

```tsx
  const staleSourceCount = officialSourceStatuses.filter((status) => status.state === "stale").length;
```

```tsx
        <FeedPanel items={feedResponse.items} statuses={feedResponse.statuses} staleSourceCount={staleSourceCount} />
```

- [ ] **Step 4: Add CSS**

Add these styles to `src/styles/app.css` near related panel styles:

```css
.emergency-mode-banner {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 12px;
  background: #2a1111;
  border: 1px solid #ef4444;
  border-radius: 8px;
}

.emergency-mode-banner p,
.emergency-mode-banner a {
  margin: 0;
}

.emergency-mode-banner p {
  color: #fecaca;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.emergency-mode-banner a {
  color: #ffffff;
  font-weight: 800;
}

.emergency-mode-banner span {
  color: #fecaca;
  font-size: 0.82rem;
  white-space: nowrap;
}

.dashboard-side-panel {
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 10px;
}

.official-source-panel {
  display: grid;
  gap: 10px;
  padding: 12px;
  background: #111820;
  border: 1px solid #2b3948;
  border-radius: 8px;
}

.official-source-list {
  display: grid;
  gap: 8px;
}

.official-source-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  padding: 8px;
  background: #0b1017;
  border-left: 4px solid #16a34a;
}

.official-source-row div {
  display: grid;
  gap: 3px;
}

.official-source-row div:last-child {
  text-align: right;
}

.official-source-row small,
.official-source-row span {
  color: #b8c3cf;
}

.official-source-stale {
  border-color: #f59e0b;
}

.official-source-error {
  border-color: #ef4444;
}

.official-source-unknown {
  border-color: #667085;
}

.source-stale {
  margin: 8px 0 0;
  color: #fbd38d;
}

.emergency-checklist,
.critical-contact-list,
.radio-reference-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
}

.emergency-checklist {
  list-style: none;
}

.emergency-checklist li,
.critical-contact,
.radio-reference {
  padding: 8px;
  background: #0b1017;
  border: 1px solid #2b3948;
  border-radius: 8px;
}

.critical-contact,
.radio-reference {
  display: grid;
  gap: 4px;
}

.critical-contact span,
.radio-reference span {
  color: #b8c3cf;
  font-size: 0.82rem;
}

.critical-contact strong,
.radio-reference strong {
  color: #f5f7fb;
}

.critical-contact small,
.radio-reference small {
  color: #8fa0b2;
}
```

Inside the existing `@media (max-width: 900px)` block, add:

```css
  .dashboard-side-panel {
    min-height: 70vh;
  }

  .emergency-mode-banner,
  .official-source-row {
    align-items: start;
    grid-template-columns: 1fr;
  }

  .emergency-mode-banner {
    display: grid;
  }

  .emergency-mode-banner span {
    white-space: normal;
  }

  .official-source-row div:last-child {
    text-align: left;
  }
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- src/components/FeedPanel.test.tsx src/components/Dashboard.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/FeedPanel.tsx src/components/FeedPanel.test.tsx src/components/Dashboard.tsx src/styles/app.css
git commit -m "Add emergency readiness styling and stale summary"
```

---

### Task 7: Final Verification

**Files:**
- Verify all modified app files.

- [ ] **Step 1: Run full checks**

Run: `npm run check`

Expected: PASS.

- [ ] **Step 2: Start or reuse the local app server**

Run: `npm run dev`

Expected: local Vite URL printed, usually `http://localhost:5173/`. If another server is already running, use the current local URL.

- [ ] **Step 3: Browser smoke test**

Open the local app in the in-app browser and verify:
- Emergency banner appears when test feed data contains a recent official emergency item.
- Official source status panel is visible near the feed.
- Emergency sidebar opens from the top bar.
- Sidebar contains Offline Checklist, Critical Contacts, Radio Reference, and the existing links.
- Page remains usable at desktop width and narrow/mobile width.

- [ ] **Step 4: Commit any final polish**

If Step 3 required CSS or copy changes:

```bash
git add src
git commit -m "Polish emergency readiness panel"
```

If no changes were needed, do not create an empty commit.

