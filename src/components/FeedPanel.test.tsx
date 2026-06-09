import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FeedPanel } from "./FeedPanel";
import type { FeedItem } from "../feeds/types";

const NOW = Date.parse("2026-06-08T20:00:00Z");

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

  it("renders SEMAR items before newer urgent non-SEMAR items", () => {
    const semar: FeedItem = {
      ...baseItem,
      id: "semar",
      sourceId: "semar-tsunami-alerts",
      sourceName: "SEMAR Tsunami Alerts",
      title: "SEMAR coastal current alert",
      publishedAt: "2026-06-08T18:00:00Z",
    };
    const newerUrgent: FeedItem = {
      ...baseItem,
      id: "weather",
      title: "Newer hurricane update",
      publishedAt: "2026-06-08T19:00:00Z",
    };

    const { container } = render(<FeedPanel items={[newerUrgent, semar]} statuses={[]} />);

    expect(within(container).getAllByRole("link").map((link) => link.textContent)).toEqual([
      "SEMAR coastal current alert",
      "Newer hurricane update",
    ]);
  });

  it("renders multiple eligible SEMAR items newest first", () => {
    const older: FeedItem = {
      ...baseItem,
      id: "older",
      sourceId: "semar-tsunami-alerts",
      sourceName: "SEMAR Tsunami Alerts",
      title: "Older SEMAR alert",
      publishedAt: "2026-06-08T18:00:00Z",
    };
    const newer: FeedItem = {
      ...older,
      id: "newer",
      title: "Newer SEMAR alert",
      publishedAt: "2026-06-08T19:00:00Z",
      fetchedAt: "2026-06-08T19:00:00Z",
    };

    const { container } = render(<FeedPanel items={[older, newer]} statuses={[]} />);

    expect(within(container).getAllByRole("link").map((link) => link.textContent)).toEqual([
      "Newer SEMAR alert",
      "Older SEMAR alert",
    ]);
  });

  it("retains SEMAR items published exactly 24 hours ago", () => {
    const semar: FeedItem = {
      ...baseItem,
      id: "semar-boundary",
      sourceId: "semar-tsunami-alerts",
      sourceName: "SEMAR Tsunami Alerts",
      title: "Boundary SEMAR alert",
      publishedAt: "2026-06-07T20:00:00Z",
    };

    const { container } = render(<FeedPanel items={[semar]} statuses={[]} now={NOW} />);
    const view = within(container);

    expect(view.getByRole("link", { name: "Boundary SEMAR alert" })).toBeInTheDocument();
    expect(view.getByText("1 items")).toBeInTheDocument();
  });

  it("excludes stale, missing, invalid, and future SEMAR dates", () => {
    const semar = {
      ...baseItem,
      sourceId: "semar-tsunami-alerts",
      sourceName: "SEMAR Tsunami Alerts",
    };
    const items: FeedItem[] = [
      { ...semar, id: "stale", title: "Stale SEMAR alert", publishedAt: "2026-06-07T19:59:59Z" },
      { ...semar, id: "missing", title: "Missing-date SEMAR alert", publishedAt: undefined },
      { ...semar, id: "invalid", title: "Invalid-date SEMAR alert", publishedAt: "not-a-date" },
      { ...semar, id: "future", title: "Future SEMAR alert", publishedAt: "2026-06-08T20:00:01Z" },
    ];

    const { container } = render(<FeedPanel items={items} statuses={[]} now={NOW} />);
    const view = within(container);

    expect(view.queryAllByRole("link")).toHaveLength(0);
    expect(view.getByText("0 items")).toBeInTheDocument();
  });

  it("preserves non-SEMAR items regardless of publication date and counts visible items", () => {
    const staleSemar: FeedItem = {
      ...baseItem,
      id: "stale-semar",
      sourceId: "semar-tsunami-alerts",
      sourceName: "SEMAR Tsunami Alerts",
      title: "Stale SEMAR alert",
      publishedAt: "2026-06-07T19:59:59Z",
    };
    const nonSemar: FeedItem = {
      ...baseItem,
      id: "old-weather",
      title: "Old weather update",
      publishedAt: "2020-01-01T00:00:00Z",
    };

    const { container } = render(<FeedPanel items={[staleSemar, nonSemar]} statuses={[]} now={NOW} />);
    const view = within(container);

    expect(view.queryByRole("link", { name: "Stale SEMAR alert" })).not.toBeInTheDocument();
    expect(view.getByRole("link", { name: "Old weather update" })).toBeInTheDocument();
    expect(view.getByText("1 items")).toBeInTheDocument();
  });

  it("shows source errors", () => {
    render(<FeedPanel items={[]} statuses={[{ sourceId: "nhc", ok: false, fetchedAt: "2026-05-29T12:00:00Z", itemCount: 0, error: "HTTP 500" }]} />);
    expect(screen.getByText(/nhc: HTTP 500/i)).toBeInTheDocument();
  });

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

  it("keeps source errors and freshness warnings grouped as feed notices", () => {
    const { container } = render(
      <FeedPanel
        items={[]}
        statuses={[{ sourceId: "nhc", ok: false, fetchedAt: "2026-05-29T12:00:00Z", itemCount: 0, error: "HTTP 500" }]}
        staleSourceCount={1}
      />,
    );

    const notices = container.querySelector(".feed-notices");

    const view = within(container);

    expect(notices).toContainElement(view.getByText(/nhc: HTTP 500/i));
    expect(notices).toContainElement(view.getByText("1 source may not be current"));
  });

  it("keeps the feed list as a stable panel child when there are no notices", () => {
    const { container } = render(<FeedPanel items={[baseItem]} statuses={[]} />);

    expect(container.querySelector(".feed-notices")).not.toBeInTheDocument();
    expect(container.querySelector(".feed-panel > .feed-list")).toBeInTheDocument();
  });
});
