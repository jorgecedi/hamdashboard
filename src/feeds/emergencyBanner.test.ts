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
