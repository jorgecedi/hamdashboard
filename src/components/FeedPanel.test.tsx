import { render, screen, within } from "@testing-library/react";
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

  it("renders multiple SEMAR items newest first using fetchedAt as a fallback", () => {
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
      publishedAt: undefined,
      fetchedAt: "2026-06-08T19:00:00Z",
    };

    const { container } = render(<FeedPanel items={[older, newer]} statuses={[]} />);

    expect(within(container).getAllByRole("link").map((link) => link.textContent)).toEqual([
      "Newer SEMAR alert",
      "Older SEMAR alert",
    ]);
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
