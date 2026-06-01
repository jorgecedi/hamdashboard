# Emergency Links Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a top-bar Emergency Links control that opens a left slide-out sidebar with curated emergency and preparedness resources.

**Architecture:** The link data lives in `DashboardConfig.emergencyLinks`, with default groups in `src/config/defaultConfig.ts`. `Dashboard` owns the open/closed state, `TopBar` renders the toggle, and a new `EmergencyLinksSidebar` component renders grouped external links and close behavior.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, existing CSS in `src/styles/app.css`.

---

## File Structure

- Modify `src/config/types.ts`: add `EmergencyLinkKind`, `EmergencyLink`, `EmergencyLinkGroup`, and `emergencyLinks` on `DashboardConfig`.
- Modify `src/config/defaultConfig.ts`: add the approved emergency link groups. This file currently has uncommitted local changes; inspect it before editing and preserve existing tile/feed changes.
- Modify `src/config/defaultConfig.test.ts`: add coverage for the required emergency link groups and the user's `jorgecedi/Survival-Data` repository.
- Modify `src/components/TopBar.tsx`: add the Emergency Links toggle button and ARIA state.
- Create `src/components/TopBar.test.tsx`: test the toggle callback and expanded state.
- Create `src/components/EmergencyLinksSidebar.tsx`: render the overlay, sidebar, groups, labels, external anchors, close button, Escape handling, and outside-click close.
- Create `src/components/EmergencyLinksSidebar.test.tsx`: test rendering, external-link attributes, close button, Escape, outside click, and empty groups.
- Modify `src/components/Dashboard.tsx`: own sidebar state, pass toggle props into `TopBar`, and mount `EmergencyLinksSidebar`.
- Create `src/components/Dashboard.test.tsx`: integration-test top-bar toggle with the sidebar.
- Modify `src/styles/app.css`: add top-bar button and sidebar/backdrop styles using the existing dark dashboard look.

## Task 1: Config Types And Default Links

**Files:**
- Modify: `src/config/types.ts`
- Modify: `src/config/defaultConfig.ts`
- Modify: `src/config/defaultConfig.test.ts`

- [ ] **Step 1: Check current local edits before touching config**

Run:

```bash
git status --short
git diff -- src/config/defaultConfig.ts
```

Expected: `src/config/defaultConfig.ts` may be modified. Preserve the existing edits and only add the `emergencyLinks` property to the exported config object.

- [ ] **Step 2: Write the failing config test**

Add this test to `src/config/defaultConfig.test.ts`:

```ts
  it("includes grouped emergency links for live situation, official resources, and preparedness", () => {
    expect(defaultConfig.emergencyLinks.map((group) => group.id)).toEqual(["live-situation", "weather-storms", "local-official", "preparedness-library"]);

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
```

- [ ] **Step 3: Run the config test and verify it fails**

Run:

```bash
npm test -- src/config/defaultConfig.test.ts
```

Expected: FAIL because `defaultConfig.emergencyLinks` and related types do not exist yet.

- [ ] **Step 4: Add the config types**

Update `src/config/types.ts` with these exported types before `DashboardConfig`:

```ts
export type EmergencyLinkKind = "official" | "map" | "preparedness" | "community";

export type EmergencyLink = {
  id: string;
  label: string;
  url: string;
  description: string;
  kind: EmergencyLinkKind;
};

export type EmergencyLinkGroup = {
  id: string;
  title: string;
  links: EmergencyLink[];
};
```

Then add this property to `DashboardConfig`:

```ts
  emergencyLinks: EmergencyLinkGroup[];
```

- [ ] **Step 5: Add default emergency link groups**

Add this property in `src/config/defaultConfig.ts` after `socialMonitoringEnabled: false,`:

```ts
  emergencyLinks: [
    {
      id: "live-situation",
      title: "Live Situation",
      links: [
        {
          id: "iris-seismic-monitor",
          label: "IRIS Seismic Monitor",
          url: "https://www.iris.edu/app/seismic-monitor/map?lat=21.1159&lng=-106.4146&zoom=6",
          description: "Regional earthquake monitoring map centered near Puerto Vallarta.",
          kind: "map",
        },
        {
          id: "nasa-firms",
          label: "NASA FIRMS Fire Map",
          url: "https://firms.modaps.eosdis.nasa.gov/map/#d:24hrs;@-104.0,21.4,7.1z",
          description: "Satellite fire and thermal anomaly detections from the last 24 hours.",
          kind: "map",
        },
        {
          id: "ssn-mexico",
          label: "SSN Mexico",
          url: "https://www.ssn.unam.mx/",
          description: "Official recent earthquake reports for Mexico.",
          kind: "official",
        },
        {
          id: "usgs-latest-earthquakes",
          label: "USGS Latest Earthquakes",
          url: "https://earthquake.usgs.gov/earthquakes/map/",
          description: "Worldwide earthquake map and event list.",
          kind: "official",
        },
        {
          id: "semar-tsunami",
          label: "SEMAR Tsunami Center",
          url: "https://diredimoat.semar.gob.mx/cat/centroAlertasTsunamis.html",
          description: "Mexico tsunami alert center information and bulletins.",
          kind: "official",
        },
        {
          id: "cenapred-atlas",
          label: "CENAPRED Risk Atlas",
          url: "https://www.atlasnacionalderiesgos.gob.mx/",
          description: "National risk atlas for Mexico hazards and vulnerability.",
          kind: "official",
        },
      ],
    },
    {
      id: "weather-storms",
      title: "Weather + Storms",
      links: [
        {
          id: "smn-conagua",
          label: "SMN / CONAGUA",
          url: "https://smn.conagua.gob.mx/",
          description: "Official Mexico weather, warnings, and cyclone information.",
          kind: "official",
        },
        {
          id: "nhc-eastern-pacific",
          label: "NHC Eastern Pacific",
          url: "https://www.nhc.noaa.gov/?epac",
          description: "NOAA tropical cyclone outlooks and advisories for the Eastern Pacific.",
          kind: "official",
        },
        {
          id: "windy-puerto-vallarta",
          label: "Windy Puerto Vallarta",
          url: "https://www.windy.com/?20.653,-105.225,7",
          description: "Interactive wind, rain, and forecast map for the region.",
          kind: "map",
        },
      ],
    },
    {
      id: "local-official",
      title: "Local Official",
      links: [
        {
          id: "proteccion-civil-jalisco",
          label: "Proteccion Civil Jalisco",
          url: "https://proteccioncivil.jalisco.gob.mx/",
          description: "State civil protection and emergency information.",
          kind: "official",
        },
        {
          id: "bomberos-puerto-vallarta",
          label: "Bomberos Puerto Vallarta",
          url: "https://bomberos.puertovallarta.gob.mx/",
          description: "Puerto Vallarta firefighters and civil protection site.",
          kind: "official",
        },
        {
          id: "cnpc-mexico",
          label: "Coordinacion Nacional de Proteccion Civil",
          url: "https://cnpcinforma.sspc.gob.mx/Proteccioncivil.html",
          description: "Mexico national civil protection information.",
          kind: "official",
        },
        {
          id: "cruz-roja-mexicana",
          label: "Cruz Roja Mexicana",
          url: "https://www.cruzrojamexicana.org.mx/",
          description: "Mexican Red Cross emergency and relief organization.",
          kind: "official",
        },
      ],
    },
    {
      id: "preparedness-library",
      title: "Preparedness Library",
      links: [
        {
          id: "ready-gov",
          label: "Ready.gov",
          url: "https://www.ready.gov/",
          description: "Emergency kits, plans, alerts, and preparedness guidance.",
          kind: "preparedness",
        },
        {
          id: "red-cross-preparedness",
          label: "American Red Cross Preparedness",
          url: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies.html",
          description: "Checklists and practical disaster preparedness guides.",
          kind: "preparedness",
        },
        {
          id: "vivarca",
          label: "Vivarca Offline Survival Library",
          url: "https://vivarca.org/",
          description: "Downloadable public-domain preparedness and survival library.",
          kind: "preparedness",
        },
        {
          id: "survival-data",
          label: "jorgecedi/Survival-Data",
          url: "https://github.com/jorgecedi/Survival-Data",
          description: "Community survival and preparedness data repository.",
          kind: "community",
        },
        {
          id: "awesome-disastertech",
          label: "awesome-disastertech",
          url: "https://github.com/DisasterTechCrew/awesome-disastertech",
          description: "Community list of disaster technology projects and tools.",
          kind: "community",
        },
        {
          id: "awesome-survival",
          label: "awesome-survival",
          url: "https://github.com/alx-xlx/awesome-survival",
          description: "Community survival-resource list; verify links before relying on them.",
          kind: "community",
        },
      ],
    },
  ],
```

- [ ] **Step 6: Run the config test and verify it passes**

Run:

```bash
npm test -- src/config/defaultConfig.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit config changes**

Run:

```bash
git add src/config/types.ts src/config/defaultConfig.ts src/config/defaultConfig.test.ts
git commit -m "feat: add emergency resource links config"
```

Expected: commit succeeds. If `src/config/defaultConfig.ts` had pre-existing edits, include them only if they are necessary and intentional; otherwise stage only the emergency-link hunks.

## Task 2: Top Bar Toggle

**Files:**
- Modify: `src/components/TopBar.tsx`
- Create: `src/components/TopBar.test.tsx`

- [ ] **Step 1: Write the failing top-bar tests**

Create `src/components/TopBar.test.tsx`:

```tsx
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultConfig } from "../config/defaultConfig";
import { TopBar } from "./TopBar";

describe("TopBar", () => {
  afterEach(() => cleanup());

  it("calls the emergency links toggle callback", () => {
    const onToggleEmergencyLinks = vi.fn();
    render(<TopBar config={defaultConfig} emergencyLinksOpen={false} onToggleEmergencyLinks={onToggleEmergencyLinks} />);

    fireEvent.click(screen.getByRole("button", { name: /open emergency links/i }));

    expect(onToggleEmergencyLinks).toHaveBeenCalledTimes(1);
  });

  it("exposes the open state to assistive technology", () => {
    render(<TopBar config={defaultConfig} emergencyLinksOpen={true} onToggleEmergencyLinks={vi.fn()} />);

    expect(screen.getByRole("button", { name: /close emergency links/i })).toHaveAttribute("aria-expanded", "true");
  });
});
```

- [ ] **Step 2: Run the top-bar tests and verify they fail**

Run:

```bash
npm test -- src/components/TopBar.test.tsx
```

Expected: FAIL because `TopBar` does not accept `emergencyLinksOpen` or `onToggleEmergencyLinks`.

- [ ] **Step 3: Implement the top-bar toggle**

Update `src/components/TopBar.tsx` to this structure:

```tsx
import { Menu } from "lucide-react";
import type { DashboardConfig } from "../config/types";

type TopBarProps = {
  config: DashboardConfig;
  emergencyLinksOpen: boolean;
  onToggleEmergencyLinks: () => void;
};

export function TopBar({ config, emergencyLinksOpen, onToggleEmergencyLinks }: TopBarProps) {
  const now = new Date();
  const localTime = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: config.site.timezone,
  }).format(now);
  const utcTime = `${now.toISOString().replace("T", " ").slice(0, 19)} UTC`;

  return (
    <header className="top-bar">
      <span className="top-bar-time">{localTime}</span>
      <strong>{config.site.callSign}</strong>
      <div className="top-bar-actions">
        <span>{utcTime}</span>
        <button
          type="button"
          className="emergency-links-toggle"
          aria-label={emergencyLinksOpen ? "Close emergency links" : "Open emergency links"}
          aria-controls="emergency-links-sidebar"
          aria-expanded={emergencyLinksOpen}
          onClick={onToggleEmergencyLinks}
        >
          <Menu aria-hidden="true" size={18} />
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Run the top-bar tests and verify they pass**

Run:

```bash
npm test -- src/components/TopBar.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit top-bar toggle**

Run:

```bash
git add src/components/TopBar.tsx src/components/TopBar.test.tsx
git commit -m "feat: add emergency links top bar toggle"
```

Expected: commit succeeds.

## Task 3: Sidebar Component

**Files:**
- Create: `src/components/EmergencyLinksSidebar.tsx`
- Create: `src/components/EmergencyLinksSidebar.test.tsx`

- [ ] **Step 1: Write failing sidebar tests**

Create `src/components/EmergencyLinksSidebar.test.tsx`:

```tsx
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { EmergencyLinkGroup } from "../config/types";
import { EmergencyLinksSidebar } from "./EmergencyLinksSidebar";

const groups: EmergencyLinkGroup[] = [
  {
    id: "live-situation",
    title: "Live Situation",
    links: [
      {
        id: "iris",
        label: "IRIS Seismic Monitor",
        url: "https://example.com/iris",
        description: "Earthquake map.",
        kind: "map",
      },
    ],
  },
  {
    id: "preparedness-library",
    title: "Preparedness Library",
    links: [
      {
        id: "survival-data",
        label: "jorgecedi/Survival-Data",
        url: "https://github.com/jorgecedi/Survival-Data",
        description: "Community repository.",
        kind: "community",
      },
    ],
  },
];

describe("EmergencyLinksSidebar", () => {
  afterEach(() => cleanup());

  it("renders grouped links with external link attributes", () => {
    render(<EmergencyLinksSidebar groups={groups} onClose={vi.fn()} />);

    expect(screen.getByRole("complementary", { name: /emergency resources/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /live situation/i })).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /iris seismic monitor/i });
    expect(link).toHaveAttribute("href", "https://example.com/iris");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("labels community resources", () => {
    render(<EmergencyLinksSidebar groups={groups} onClose={vi.fn()} />);

    expect(screen.getByText(/community/i)).toBeInTheDocument();
  });

  it("calls onClose from the close button", () => {
    const onClose = vi.fn();
    render(<EmergencyLinksSidebar groups={groups} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: /close emergency links/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    render(<EmergencyLinksSidebar groups={groups} onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the backdrop is clicked", () => {
    const onClose = vi.fn();
    render(<EmergencyLinksSidebar groups={groups} onClose={onClose} />);

    fireEvent.mouseDown(screen.getByTestId("emergency-links-backdrop"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders an empty state when no groups are configured", () => {
    render(<EmergencyLinksSidebar groups={[]} onClose={vi.fn()} />);

    expect(screen.getByText(/no emergency resources configured/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the sidebar tests and verify they fail**

Run:

```bash
npm test -- src/components/EmergencyLinksSidebar.test.tsx
```

Expected: FAIL because `EmergencyLinksSidebar` does not exist.

- [ ] **Step 3: Implement the sidebar component**

Create `src/components/EmergencyLinksSidebar.tsx`:

```tsx
import { X } from "lucide-react";
import { useEffect } from "react";
import type { EmergencyLinkGroup, EmergencyLinkKind } from "../config/types";

type EmergencyLinksSidebarProps = {
  groups: EmergencyLinkGroup[];
  onClose: () => void;
};

const kindLabels: Record<EmergencyLinkKind, string> = {
  official: "Official",
  map: "Map",
  preparedness: "Preparedness",
  community: "Community",
};

export function EmergencyLinksSidebar({ groups, onClose }: EmergencyLinksSidebarProps) {
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div className="emergency-links-layer" role="presentation">
      <div className="emergency-links-backdrop" data-testid="emergency-links-backdrop" onMouseDown={onClose} />
      <aside id="emergency-links-sidebar" className="emergency-links-sidebar" aria-label="Emergency resources">
        <div className="emergency-links-header">
          <div>
            <p>Emergency</p>
            <h2>Resources</h2>
          </div>
          <button type="button" className="emergency-links-close" aria-label="Close emergency links" onClick={onClose}>
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        {groups.length === 0 ? (
          <p className="emergency-links-empty">No emergency resources configured.</p>
        ) : (
          <div className="emergency-link-groups">
            {groups.map((group) => (
              <section className="emergency-link-group" key={group.id} aria-labelledby={`${group.id}-heading`}>
                <h3 id={`${group.id}-heading`}>{group.title}</h3>
                <div className="emergency-link-list">
                  {group.links.map((link) => (
                    <a className="emergency-link" key={link.id} href={link.url} target="_blank" rel="noreferrer">
                      <span className="emergency-link-label">{link.label}</span>
                      <span className={`emergency-link-kind emergency-link-kind-${link.kind}`}>{kindLabels[link.kind]}</span>
                      <span className="emergency-link-description">{link.description}</span>
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
```

- [ ] **Step 4: Run the sidebar tests and verify they pass**

Run:

```bash
npm test -- src/components/EmergencyLinksSidebar.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit sidebar component**

Run:

```bash
git add src/components/EmergencyLinksSidebar.tsx src/components/EmergencyLinksSidebar.test.tsx
git commit -m "feat: add emergency links sidebar"
```

Expected: commit succeeds.

## Task 4: Dashboard Integration

**Files:**
- Modify: `src/components/Dashboard.tsx`
- Create: `src/components/Dashboard.test.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Write the failing dashboard integration test**

Create `src/components/Dashboard.test.tsx`:

```tsx
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { defaultConfig } from "../config/defaultConfig";
import type { FeedResponse } from "../feeds/types";
import { Dashboard } from "./Dashboard";

const feedResponse: FeedResponse = {
  items: [],
  statuses: [],
};

describe("Dashboard", () => {
  afterEach(() => cleanup());

  it("opens and closes emergency links from the top bar", () => {
    render(<Dashboard config={defaultConfig} feedResponse={feedResponse} />);

    expect(screen.queryByRole("complementary", { name: /emergency resources/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open emergency links/i }));

    expect(screen.getByRole("complementary", { name: /emergency resources/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /jorgecedi\/survival-data/i })).toHaveAttribute("href", "https://github.com/jorgecedi/Survival-Data");

    fireEvent.click(screen.getByRole("button", { name: /close emergency links/i }));

    expect(screen.queryByRole("complementary", { name: /emergency resources/i })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the dashboard test and verify it fails**

Run:

```bash
npm test -- src/components/Dashboard.test.tsx
```

Expected: FAIL because `Dashboard` has not mounted the sidebar or updated `TopBar` props.

- [ ] **Step 3: Integrate the sidebar into Dashboard**

Update `src/components/Dashboard.tsx`:

```tsx
import { useState } from "react";
import type { DashboardConfig } from "../config/types";
import type { FeedResponse } from "../feeds/types";
import { EmergencyLinksSidebar } from "./EmergencyLinksSidebar";
import { FeedPanel } from "./FeedPanel";
import { Tile } from "./Tile";
import { TopBar } from "./TopBar";

type DashboardProps = {
  config: DashboardConfig;
  feedResponse: FeedResponse;
};

export function Dashboard({ config, feedResponse }: DashboardProps) {
  const [emergencyLinksOpen, setEmergencyLinksOpen] = useState(false);
  const tiles = config.tiles.filter((tile) => tile.enabled);

  return (
    <div className="dashboard-shell">
      <TopBar
        config={config}
        emergencyLinksOpen={emergencyLinksOpen}
        onToggleEmergencyLinks={() => setEmergencyLinksOpen((open) => !open)}
      />
      <section className="dashboard-grid" aria-label="Dashboard tiles">
        {tiles.map((tile) => (
          <Tile key={tile.id} tile={tile} />
        ))}
      </section>
      <FeedPanel items={feedResponse.items} statuses={feedResponse.statuses} />
      {emergencyLinksOpen ? <EmergencyLinksSidebar groups={config.emergencyLinks} onClose={() => setEmergencyLinksOpen(false)} /> : null}
    </div>
  );
}
```

- [ ] **Step 4: Update the App smoke test for the new control**

Add this assertion to `src/App.test.tsx` after the existing dashboard shell assertions:

```ts
expect(screen.getByRole("button", { name: /open emergency links/i })).toBeInTheDocument();
```

- [ ] **Step 5: Run App test and verify it passes**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Run dashboard tests and verify they pass**

Run:

```bash
npm test -- src/components/Dashboard.test.tsx src/App.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit dashboard integration**

Run:

```bash
git add src/components/Dashboard.tsx src/components/Dashboard.test.tsx src/App.test.tsx
git commit -m "feat: wire emergency links into dashboard"
```

Expected: commit succeeds.

## Task 5: Styling And Full Verification

**Files:**
- Modify: `src/styles/app.css`

- [ ] **Step 1: Add sidebar and top-bar styles**

Append these styles near the existing `.top-bar` and settings styles in `src/styles/app.css`:

```css
.top-bar-time {
  min-width: 0;
}

.top-bar-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.emergency-links-toggle,
.emergency-links-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #39485a;
  border-radius: 6px;
  background: #17212c;
  color: #f5f7fb;
}

.emergency-links-toggle:hover,
.emergency-links-close:hover {
  background: #203040;
}

.emergency-links-layer {
  position: fixed;
  inset: 0;
  z-index: 40;
}

.emergency-links-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(5, 7, 10, 0.52);
}

.emergency-links-sidebar {
  position: relative;
  width: min(420px, calc(100vw - 32px));
  height: 100%;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 14px;
  padding: 16px;
  overflow: auto;
  background: #111820;
  border-right: 1px solid #39485a;
  box-shadow: 16px 0 36px rgba(0, 0, 0, 0.32);
}

.emergency-links-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.emergency-links-header p,
.emergency-links-header h2 {
  margin: 0;
}

.emergency-links-header p {
  color: #93a4b7;
  font-size: 0.78rem;
  text-transform: uppercase;
}

.emergency-links-header h2 {
  font-size: 1.2rem;
}

.emergency-link-groups {
  display: grid;
  align-content: start;
  gap: 18px;
  min-height: 0;
}

.emergency-link-group h3 {
  margin: 0 0 8px;
  font-size: 0.92rem;
}

.emergency-link-list {
  display: grid;
  gap: 8px;
}

.emergency-link {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 4px 8px;
  padding: 10px;
  color: #f5f7fb;
  text-decoration: none;
  background: #0b1017;
  border: 1px solid #2b3948;
  border-radius: 8px;
}

.emergency-link:hover {
  border-color: #4f6175;
  background: #111923;
}

.emergency-link-label {
  min-width: 0;
  font-weight: 700;
}

.emergency-link-kind {
  align-self: start;
  padding: 2px 6px;
  border: 1px solid #39485a;
  border-radius: 999px;
  color: #cbd5e1;
  font-size: 0.7rem;
}

.emergency-link-kind-community {
  color: #fbbf24;
  border-color: #735b20;
}

.emergency-link-description {
  grid-column: 1 / -1;
  color: #b8c3cf;
  font-size: 0.84rem;
  line-height: 1.35;
}

.emergency-links-empty {
  margin: 0;
  color: #b8c3cf;
}
```

Inside the existing `@media (max-width: 900px)` block, add:

```css
  .top-bar-actions {
    justify-content: space-between;
  }
```

- [ ] **Step 2: Run focused tests**

Run:

```bash
npm test -- src/components/TopBar.test.tsx src/components/EmergencyLinksSidebar.test.tsx src/components/Dashboard.test.tsx src/config/defaultConfig.test.ts src/App.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Run full project verification**

Run:

```bash
npm run check
```

Expected: PASS for all tests and production build.

- [ ] **Step 4: Inspect the UI locally**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite prints a local URL. Open it, click the Emergency Links button, confirm the left sidebar opens above the dashboard, links are grouped, and the dashboard grid does not resize.

- [ ] **Step 5: Commit styling and verification changes**

Run:

```bash
git add src/styles/app.css
git commit -m "style: polish emergency links sidebar"
```

Expected: commit succeeds.

## Self-Review Notes

- Spec coverage: config-driven links, top-bar control, left slide-out sidebar, new-tab links, Escape/outside-click/close button behavior, mobile-friendly width, and all approved resources are covered by Tasks 1 through 5.
- Placeholder scan: no deferred implementation steps are left in this plan.
- Type consistency: `EmergencyLinkKind`, `EmergencyLink`, `EmergencyLinkGroup`, `emergencyLinks`, `emergencyLinksOpen`, and `onToggleEmergencyLinks` are named consistently across tasks.
