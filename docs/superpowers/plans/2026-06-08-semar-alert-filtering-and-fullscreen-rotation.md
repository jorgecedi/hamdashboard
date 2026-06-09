# SEMAR Alert Filtering and Fullscreen Rotation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Return only recent SEMAR bulletins that may affect sea level, show them first and as urgent, and pause automatic tile rotation while a tile is fullscreen.

**Architecture:** Keep XML-to-plain-text conversion in the feed parser and move SEMAR-specific policy into a focused `semar.ts` worker module. The worker filters before normalization, while the frontend defensively repeats ordering and freshness rules; the tile component pauses only its automatic timer when expanded.

**Tech Stack:** TypeScript, Cloudflare Worker APIs, React 19, Vitest, Testing Library

---

## File Structure

- Create `worker/src/semar.ts`: SEMAR source identity, 24-hour date filtering, conservative impact heuristic, and source ordering helpers.
- Modify `worker/src/parsers.ts`: decode escaped HTML before removing tags so SEMAR descriptions are plain text.
- Modify `worker/src/normalize.ts`: force retained SEMAR entries to `urgent`.
- Modify `worker/src/index.ts`: delegate SEMAR filtering and source ordering to `semar.ts`.
- Modify `worker/test/parsers.test.ts`: verify escaped SEMAR-style HTML becomes plain text.
- Create `worker/test/semar.test.ts`: unit-test date and impact policy without HTTP setup.
- Modify `worker/test/worker.test.ts`: verify integration, item counts, and SEMAR-first ordering.
- Modify `src/components/FeedPanel.tsx`: apply defensive SEMAR-first and newest-first ordering.
- Modify `src/components/FeedPanel.test.tsx`: test the frontend ordering contract.
- Modify `src/feeds/emergencyBanner.ts`: reduce freshness to 24 hours.
- Modify `src/feeds/emergencyBanner.test.ts`: test the exact freshness boundary.
- Modify `src/components/Tile.tsx`: skip automatic rotation while expanded.
- Modify `src/components/Tile.test.tsx`: verify pause, manual advance, and resume.

### Task 1: Produce Plain Text From Escaped Feed HTML

**Files:**
- Modify: `worker/src/parsers.ts:3-20`
- Test: `worker/test/parsers.test.ts:44-55`

- [ ] **Step 1: Write the failing parser test**

Add a SEMAR-shaped case whose description contains entity-escaped tags:

```ts
it("removes entity-escaped HTML from RSS descriptions", () => {
  const xml = `<rss><channel><item>
    <title>BOLETIN INFORMATIVO 001</title>
    <link>https://example.com/semar.txt</link>
    <description>&lt;strong&gt;EVALUACION:&lt;/strong&gt;&lt;br /&gt;Se pueden producir variaciones de pocos centimetros.</description>
    <pubDate>Mon, 08 Jun 2026 18:42:46 GMT</pubDate>
  </item></channel></rss>`;

  expect(parseXmlFeed(xml)).toEqual([
    {
      title: "BOLETIN INFORMATIVO 001",
      url: "https://example.com/semar.txt",
      summary: "EVALUACION: Se pueden producir variaciones de pocos centimetros.",
      publishedAt: "Mon, 08 Jun 2026 18:42:46 GMT",
    },
  ]);
});
```

- [ ] **Step 2: Run the parser test to verify it fails**

Run:

```bash
npm test -- worker/test/parsers.test.ts
```

Expected: FAIL because the summary still contains decoded `<strong>` and `<br />` markup.

- [ ] **Step 3: Decode entities before stripping markup**

Replace `normalizeFeedText` with two focused passes. Decode twice so encoded HTML and entities inside that HTML are both handled:

```ts
function decodeFeedEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function normalizeFeedText(value: string): string {
  const decoded = decodeFeedEntities(decodeFeedEntities(value.replace(/<!\[CDATA\[|\]\]>/g, "")));

  return decoded
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p\s*>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
```

- [ ] **Step 4: Run parser tests**

Run:

```bash
npm test -- worker/test/parsers.test.ts
```

Expected: all parser tests PASS.

- [ ] **Step 5: Commit the parser change**

```bash
git add worker/src/parsers.ts worker/test/parsers.test.ts
git commit -m "Fix plain text feed parsing"
```

### Task 2: Isolate and Test SEMAR Filtering Policy

**Files:**
- Create: `worker/src/semar.ts`
- Create: `worker/test/semar.test.ts`

- [ ] **Step 1: Write failing unit tests for date filtering**

Create `worker/test/semar.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { RawFeedEntry } from "../src/feedTypes";
import { filterSemarEntries } from "../src/semar";

const now = "2026-06-08T20:00:00Z";

function entry(summary: string, publishedAt?: string): RawFeedEntry {
  return {
    title: "BOLETIN INFORMATIVO 001",
    url: `https://example.com/${publishedAt ?? "missing"}`,
    summary,
    ...(publishedAt ? { publishedAt } : {}),
  };
}

describe("filterSemarEntries dates", () => {
  const possibleImpact = "Se pueden producir variaciones de pocos centimetros en el nivel del mar.";

  it("keeps an entry exactly 24 hours old", () => {
    expect(filterSemarEntries([entry(possibleImpact, "2026-06-07T20:00:00Z")], now)).toHaveLength(1);
  });

  it("discards an entry older than 24 hours", () => {
    expect(filterSemarEntries([entry(possibleImpact, "2026-06-07T19:59:59Z")], now)).toEqual([]);
  });

  it("discards missing, invalid, and future pubDate values", () => {
    expect(filterSemarEntries([
      entry(possibleImpact),
      entry(possibleImpact, "not-a-date"),
      entry(possibleImpact, "2026-06-08T20:00:01Z"),
    ], now)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the unit test to verify the module is missing**

Run:

```bash
npm test -- worker/test/semar.test.ts
```

Expected: FAIL because `worker/src/semar.ts` does not exist.

- [ ] **Step 3: Add failing tests for conservative impact matching**

Append:

```ts
describe("filterSemarEntries impact", () => {
  it.each([
    "NO se esperan variaciones del nivel del mar por la ubicacion del epicentro.",
    "NO se espera la generacion de un tsunami para las costas de Mexico.",
    "Se descarta el arribo de un tsunami para las costas de Mexico.",
    "Se confirma la ausencia de variaciones importantes en el nivel del mar.",
  ])("discards explicit no-impact wording: %s", (summary) => {
    expect(filterSemarEntries([entry(summary, "2026-06-08T19:00:00Z")], now)).toEqual([]);
  });

  it.each([
    "NO SE ESPERA LA GENERACION DE UN TSUNAMI; sin embargo, se pueden producir variaciones de pocos centimetros.",
    "Mantener precauciones por la posible presencia de corrientes en la entrada de los puertos.",
    "Se esperan variaciones del nivel del mar.",
    "Evaluacion preliminar pendiente de informacion complementaria.",
  ])("keeps possible or uncertain impact wording: %s", (summary) => {
    expect(filterSemarEntries([entry(summary, "2026-06-08T19:00:00Z")], now)).toHaveLength(1);
  });
});
```

- [ ] **Step 4: Implement the focused SEMAR policy module**

Create `worker/src/semar.ts`:

```ts
import type { RawFeedEntry } from "./feedTypes";

export const SEMAR_TSUNAMI_SOURCE_ID = "semar-tsunami-alerts";

const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const possibleImpactPatterns = [
  /\bse pueden producir variaciones\b/u,
  /\bse esperan? variaciones\b/u,
  /\bposible presencia de corrientes\b/u,
  /\bcorrientes? en la entrada de (?:los )?puertos?\b/u,
  /\b(?:oleaje|ondas?|nivel del mar) (?:peligroso|anormal|elevado)\b/u,
  /\b(?:alerta|evacuacion|precauciones?)\b/u,
];
const explicitNoImpactPatterns = [
  /\bno se esperan? (?:la generacion de )?variaciones\b/u,
  /\bno se espera la generacion de un tsunami\b/u,
  /\bse descarta el arribo de un tsunami\b/u,
  /\bse confirma la ausencia de variaciones importantes\b/u,
];

function normalizedText(entry: RawFeedEntry): string {
  return `${entry.title} ${entry.summary ?? ""}`
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function mayAffectSeaLevel(entry: RawFeedEntry): boolean {
  const text = normalizedText(entry);

  if (possibleImpactPatterns.some((pattern) => pattern.test(text))) {
    return true;
  }

  return !explicitNoImpactPatterns.some((pattern) => pattern.test(text));
}

export function filterSemarEntries(entries: RawFeedEntry[], fetchedAt: string): RawFeedEntry[] {
  const fetchedTime = Date.parse(fetchedAt);
  if (!Number.isFinite(fetchedTime)) return [];

  return entries.filter((entry) => {
    if (!entry.publishedAt) return false;

    const publishedTime = Date.parse(entry.publishedAt);
    if (!Number.isFinite(publishedTime)) return false;

    const age = fetchedTime - publishedTime;
    return age >= 0 && age <= MAX_AGE_MS && mayAffectSeaLevel(entry);
  });
}

export function isSemarSource(sourceId: string): boolean {
  return sourceId === SEMAR_TSUNAMI_SOURCE_ID;
}
```

- [ ] **Step 5: Run the SEMAR unit tests**

Run:

```bash
npm test -- worker/test/semar.test.ts
```

Expected: all SEMAR policy tests PASS.

- [ ] **Step 6: Commit the policy module**

```bash
git add worker/src/semar.ts worker/test/semar.test.ts
git commit -m "Add SEMAR alert filtering policy"
```

### Task 3: Integrate SEMAR Filtering, Urgency, and Worker Ordering

**Files:**
- Modify: `worker/src/index.ts:1-97`
- Modify: `worker/src/normalize.ts:12-48`
- Modify: `worker/test/worker.test.ts:73-148`
- Test: `worker/test/normalize.test.ts`

- [ ] **Step 1: Replace old worker tests with current SEMAR integration cases**

Update the Vitest import and use fixed system time for deterministic 24-hour tests:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-06-08T20:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
```

Replace the existing five-day SEMAR cases with tests that verify:

```ts
it("returns only recent SEMAR entries that may affect sea level", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(`
    <rss><channel>
      <item><title>Possible variation</title><link>https://example.com/keep</link>
        <description>&lt;strong&gt;EVALUACION:&lt;/strong&gt; Se pueden producir variaciones de pocos centimetros.</description>
        <pubDate>Mon, 08 Jun 2026 19:00:00 GMT</pubDate></item>
      <item><title>No impact</title><link>https://example.com/no-impact</link>
        <description>NO se esperan variaciones del nivel del mar.</description>
        <pubDate>Mon, 08 Jun 2026 19:30:00 GMT</pubDate></item>
      <item><title>Too old</title><link>https://example.com/old</link>
        <description>Se esperan variaciones del nivel del mar.</description>
        <pubDate>Sun, 07 Jun 2026 19:59:59 GMT</pubDate></item>
      <item><title>Missing date</title><link>https://example.com/missing</link>
        <description>Se esperan variaciones del nivel del mar.</description></item>
    </channel></rss>
  `, { status: 200 })));

  const response = await worker.fetch(new Request("https://feeds.example.test/api/feeds/semar-tsunami-alerts"), {});
  const payload = await response.json();

  expect(payload.statuses).toEqual([
    expect.objectContaining({ sourceId: "semar-tsunami-alerts", ok: true, itemCount: 1 }),
  ]);
  expect(payload.items).toEqual([
    expect.objectContaining({
      sourceId: "semar-tsunami-alerts",
      title: "Possible variation",
      summary: "EVALUACION: Se pueden producir variaciones de pocos centimetros.",
      urgency: "urgent",
    }),
  ]);
});
```

Update the combined-feed ordering test so the worker returns two SEMAR entries with different dates and one newer non-SEMAR entry, then assert:

```ts
expect(payload.items.map((item: { title: string }) => item.title).slice(0, 2)).toEqual([
  "Newer SEMAR alert",
  "Older SEMAR alert",
]);
```

- [ ] **Step 2: Run worker tests to verify the old implementation fails**

Run:

```bash
npm run worker:test
```

Expected: FAIL because the old worker filters the source as a group, keeps no-impact entries, and does not force generic retained SEMAR notices to urgent.

- [ ] **Step 3: Delegate filtering and ordering to `semar.ts`**

In `worker/src/index.ts`, import:

```ts
import { filterSemarEntries, isSemarSource } from "./semar";
```

Delete `SEMAR_TSUNAMI_MAX_AGE_DAYS`, `DAY_MS`, and the old newest-entry source filter. Replace it with:

```ts
function filterSourceEntries(source: WorkerFeedSource, entries: RawFeedEntry[], fetchedAt: string): RawFeedEntry[] {
  return isSemarSource(source.id) ? filterSemarEntries(entries, fetchedAt) : entries;
}
```

Keep `entrySortTime`, but make source priority use the shared identity helper:

```ts
function sourceSortPriority(item: { sourceId: string }): number {
  return isSemarSource(item.sourceId) ? 1 : 0;
}
```

The existing combined sort remains:

```ts
.sort((a, b) => sourceSortPriority(b) - sourceSortPriority(a) || itemSortTime(b) - itemSortTime(a))
```

- [ ] **Step 4: Force retained SEMAR entries to urgent**

In `worker/src/normalize.ts`, import `isSemarSource` and update the urgency assignment:

```ts
import { isSemarSource } from "./semar";

// ...
urgency: isSemarSource(source.id) ? "urgent" : scoreUrgency(entry, source),
```

Add a direct normalization regression test:

```ts
it("marks retained SEMAR entries urgent without requiring generic keywords", () => {
  const item = normalizeEntry(
    {
      title: "BOLETIN INFORMATIVO 001",
      summary: "Posible presencia de corrientes en la entrada de los puertos.",
      url: "https://example.com/semar",
      publishedAt: "2026-06-08T19:00:00Z",
    },
    {
      ...officialSource,
      id: "semar-tsunami-alerts",
      name: "SEMAR Tsunami Alerts",
      category: "emergency",
      tags: ["official", "mexico", "tsunami"],
    },
    "2026-06-08T20:00:00Z",
  );

  expect(item.urgency).toBe("urgent");
});
```

- [ ] **Step 5: Run worker and normalization tests**

Run:

```bash
npm run worker:test
```

Expected: all worker tests PASS, including parser, policy, normalization, item count, and ordering cases.

- [ ] **Step 6: Commit worker integration**

```bash
git add worker/src/index.ts worker/src/normalize.ts worker/test/worker.test.ts worker/test/normalize.test.ts
git commit -m "Filter and prioritize SEMAR alerts"
```

### Task 4: Defensively Order the Frontend Feed and Limit Banner Freshness

**Files:**
- Modify: `src/components/FeedPanel.tsx:9-13`
- Modify: `src/components/FeedPanel.test.tsx:18-24`
- Modify: `src/feeds/emergencyBanner.ts:3`
- Modify: `src/feeds/emergencyBanner.test.ts:18-27`

- [ ] **Step 1: Add failing feed-order tests**

Add:

```ts
it("renders SEMAR items before newer urgent items", () => {
  const semar = {
    ...baseItem,
    id: "semar",
    sourceId: "semar-tsunami-alerts",
    sourceName: "SEMAR Tsunami Alerts",
    title: "SEMAR coastal current alert",
    publishedAt: "2026-06-08T18:00:00Z",
  };
  const newerUrgent = {
    ...baseItem,
    id: "weather",
    title: "Newer hurricane update",
    publishedAt: "2026-06-08T19:00:00Z",
  };

  render(<FeedPanel items={[newerUrgent, semar]} statuses={[]} />);

  expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual([
    "SEMAR coastal current alert",
    "Newer hurricane update",
  ]);
});

it("renders multiple SEMAR items newest first", () => {
  const older = {
    ...baseItem,
    id: "older",
    sourceId: "semar-tsunami-alerts",
    title: "Older SEMAR alert",
    publishedAt: "2026-06-08T18:00:00Z",
  };
  const newer = {
    ...older,
    id: "newer",
    title: "Newer SEMAR alert",
    publishedAt: "2026-06-08T19:00:00Z",
  };

  render(<FeedPanel items={[older, newer]} statuses={[]} />);

  expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual([
    "Newer SEMAR alert",
    "Older SEMAR alert",
  ]);
});
```

- [ ] **Step 2: Add failing banner boundary tests**

Replace the five-day stale test with:

```ts
it("includes an official emergency item exactly 24 hours old", () => {
  expect(selectEmergencyBannerItem([baseItem], new Date("2026-06-02T12:00:00Z"))?.id).toBe("1");
});

it("hides official emergency items older than 24 hours", () => {
  const stale = { ...baseItem, publishedAt: "2026-06-01T11:59:59Z" };

  expect(selectEmergencyBannerItem([stale], new Date("2026-06-02T12:00:00Z"))).toBeUndefined();
});
```

- [ ] **Step 3: Run focused frontend tests to verify failures**

Run:

```bash
npm test -- src/components/FeedPanel.test.tsx src/feeds/emergencyBanner.test.ts
```

Expected: FAIL because feed sorting only considers urgency and the banner allows five days.

- [ ] **Step 4: Implement deterministic frontend sorting**

In `src/components/FeedPanel.tsx`, add:

```ts
const semarSourceId = "semar-tsunami-alerts";

function itemTime(item: FeedItem): number {
  const parsed = Date.parse(item.publishedAt ?? item.fetchedAt);
  return Number.isFinite(parsed) ? parsed : 0;
}

function compareItems(a: FeedItem, b: FeedItem): number {
  const aIsSemar = a.sourceId === semarSourceId;
  const bIsSemar = b.sourceId === semarSourceId;

  if (aIsSemar !== bIsSemar) return aIsSemar ? -1 : 1;
  if (aIsSemar) return itemTime(b) - itemTime(a);

  return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
}
```

Then replace the local sort with:

```ts
const sorted = [...items].sort(compareItems);
```

- [ ] **Step 5: Reduce emergency-banner age to 24 hours**

In `src/feeds/emergencyBanner.ts`, replace:

```ts
const maxAgeMs = 5 * 24 * 60 * 60 * 1000;
```

with:

```ts
const maxAgeMs = 24 * 60 * 60 * 1000;
```

- [ ] **Step 6: Run focused frontend tests**

Run:

```bash
npm test -- src/components/FeedPanel.test.tsx src/feeds/emergencyBanner.test.ts
```

Expected: all focused feed and banner tests PASS.

- [ ] **Step 7: Commit frontend feed behavior**

```bash
git add src/components/FeedPanel.tsx src/components/FeedPanel.test.tsx src/feeds/emergencyBanner.ts src/feeds/emergencyBanner.test.ts
git commit -m "Prioritize current SEMAR alerts in dashboard"
```

### Task 5: Pause Automatic Tile Rotation While Fullscreen

**Files:**
- Modify: `src/components/Tile.tsx:35-44`
- Modify: `src/components/Tile.test.tsx:80-110`

- [ ] **Step 1: Write a failing automatic-pause test**

Add:

```ts
it("pauses automatic rotation while fullscreen", () => {
  vi.useFakeTimers();
  render(<Tile tile={{ ...tile, refreshSeconds: 5 }} />);

  fireEvent.click(screen.getByRole("button", { name: /expand tile/i }));

  act(() => {
    vi.advanceTimersByTime(10000);
  });

  expect(screen.getByAltText("Cams")).toHaveAttribute("src", expect.stringContaining("one.jpg"));
});
```

- [ ] **Step 2: Write failing manual-advance and resume tests**

Add:

```ts
it("allows manual source changes while fullscreen", () => {
  vi.useFakeTimers();
  render(<Tile tile={{ ...tile, refreshSeconds: 5 }} />);

  fireEvent.click(screen.getByRole("button", { name: /expand tile/i }));
  fireEvent.click(screen.getByRole("button", { name: /next source/i }));

  expect(screen.getByRole("article")).toHaveClass("tile-expanded");
  expect(screen.getByAltText("Cams")).toHaveAttribute("src", expect.stringContaining("two.jpg"));
});

it("resumes automatic rotation after leaving fullscreen", () => {
  vi.useFakeTimers();
  render(<Tile tile={{ ...tile, refreshSeconds: 5 }} />);

  fireEvent.click(screen.getByRole("button", { name: /expand tile/i }));
  act(() => {
    vi.advanceTimersByTime(5000);
  });
  fireEvent.click(screen.getByRole("button", { name: /expand tile/i }));
  act(() => {
    vi.advanceTimersByTime(5000);
  });

  expect(screen.getByAltText("Cams")).toHaveAttribute("src", expect.stringContaining("two.jpg"));
});
```

- [ ] **Step 3: Run tile tests to verify the pause test fails**

Run:

```bash
npm test -- src/components/Tile.test.tsx
```

Expected: the automatic-pause test FAILS; manual advance should already pass.

- [ ] **Step 4: Skip timer creation while expanded**

Update the effect:

```ts
useEffect(() => {
  if (expanded || tile.sources.length === 0 || tile.refreshSeconds <= 0) return;
  if (tile.sources.length <= 1 && source?.kind !== "image") return;

  const interval = window.setInterval(() => {
    advanceSource();
  }, tile.refreshSeconds * 1000);

  return () => window.clearInterval(interval);
}, [expanded, source?.kind, tile.refreshSeconds, tile.sources.length]);
```

Including `expanded` in the dependency list clears the active interval immediately on expansion and starts a fresh full interval after exit.

- [ ] **Step 5: Run tile tests**

Run:

```bash
npm test -- src/components/Tile.test.tsx
```

Expected: all tile tests PASS.

- [ ] **Step 6: Commit fullscreen rotation behavior**

```bash
git add src/components/Tile.tsx src/components/Tile.test.tsx
git commit -m "Pause tile rotation while fullscreen"
```

### Task 6: Full Verification

**Files:**
- Verify all modified files

- [ ] **Step 1: Run the complete test suite**

Run:

```bash
npm test
```

Expected: all tests PASS.

- [ ] **Step 2: Run the production build**

Run:

```bash
npm run build
```

Expected: TypeScript compilation and Vite production build complete successfully.

- [ ] **Step 3: Check the final diff**

Run:

```bash
git diff --check
git status --short
git log --oneline -6
```

Expected: no whitespace errors; only intended files are changed or committed; the recent log contains the focused commits from this plan.

- [ ] **Step 4: Perform a live-feed smoke check without making it a test dependency**

Run:

```bash
curl -L --fail --silent --show-error https://diredimoat.semar.gob.mx/cat/rss/rss_feed.xml
```

Expected: the feed is reachable and still provides item-level `pubDate` fields. Do not fail implementation solely because the external service is temporarily unavailable; automated tests must remain fixture-based.

- [ ] **Step 5: Commit any verification-only corrections**

If verification required a correction, stage only the corrected implementation and test files:

```bash
git add worker/src worker/test src/components src/feeds
git commit -m "Fix SEMAR alert verification issues"
```

If no correction was required, do not create an empty commit.
