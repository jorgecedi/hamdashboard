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
