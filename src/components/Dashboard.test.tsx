import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { defaultConfig } from "../config/defaultConfig";
import { Dashboard } from "./Dashboard";

describe("Dashboard", () => {
  afterEach(() => cleanup());

  it("opens and closes emergency resources from the top bar", () => {
    render(<Dashboard config={defaultConfig} feedResponse={{ items: [], statuses: [] }} />);

    expect(screen.queryByRole("complementary", { name: /emergency resources/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open emergency links/i }));

    const sidebar = screen.getByRole("complementary", { name: /emergency resources/i });

    expect(sidebar).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /jorgecedi\/survival-data/i })).toHaveAttribute(
      "href",
      "https://github.com/jorgecedi/Survival-Data",
    );
    expect(screen.getByRole("heading", { name: /offline checklist/i })).toBeInTheDocument();
    expect(screen.getByText("Emergencias Mexico")).toBeInTheDocument();
    expect(screen.getByText("Marine VHF Ch 16")).toBeInTheDocument();

    fireEvent.click(within(sidebar).getByRole("button", { name: /close emergency links/i }));

    expect(screen.queryByRole("complementary", { name: /emergency resources/i })).not.toBeInTheDocument();
  });

  it("closes emergency resources when the top bar toggle is activated again", () => {
    const { container } = render(<Dashboard config={defaultConfig} feedResponse={{ items: [], statuses: [] }} />);
    const topBar = container.querySelector(".top-bar");

    fireEvent.click(screen.getByRole("button", { name: /open emergency links/i }));
    expect(screen.getByRole("complementary", { name: /emergency resources/i })).toBeInTheDocument();

    fireEvent.click(within(topBar as HTMLElement).getByRole("button", { name: /close emergency links/i }));

    expect(screen.queryByRole("complementary", { name: /emergency resources/i })).not.toBeInTheDocument();
  });

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
});
