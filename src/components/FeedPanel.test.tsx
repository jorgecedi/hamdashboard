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
