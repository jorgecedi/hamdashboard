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

  it("marks official sources as error when the feed service is unavailable", () => {
    const rows = buildOfficialSourceStatuses({
      feeds: [officialEmergency],
      statuses: [{ sourceId: "feed-service", ok: false, fetchedAt: "2026-06-02T11:30:00Z", itemCount: 0, error: "Network unavailable" }],
      now,
    });

    expect(rows[0]).toMatchObject({
      state: "error",
      fetchedAt: "2026-06-02T11:30:00Z",
      itemCount: 0,
      message: "Feed service unavailable",
    });
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
