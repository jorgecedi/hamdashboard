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
        id: "iris-seismic-monitor",
        label: "IRIS Seismic Monitor",
        url: "https://ds.iris.edu/seismon/index.phtml",
        description: "Global earthquake monitoring map.",
        kind: "map",
      },
      {
        id: "local-officials",
        label: "Local Officials",
        url: "https://example.com/officials",
        description: "Official local updates.",
        kind: "official",
      },
    ],
  },
  {
    id: "community-resources",
    title: "Community Resources",
    links: [
      {
        id: "community-radio",
        label: "Community Radio",
        url: "https://example.com/community-radio",
        description: "Neighborhood volunteer updates.",
        kind: "community",
      },
    ],
  },
];

describe("EmergencyLinksSidebar", () => {
  afterEach(() => cleanup());

  it("renders as a complementary landmark labeled Emergency resources", () => {
    render(<EmergencyLinksSidebar groups={groups} onClose={vi.fn()} />);

    expect(screen.getByRole("complementary", { name: /emergency resources/i })).toBeInTheDocument();
  });

  it("renders the Live Situation group heading", () => {
    render(<EmergencyLinksSidebar groups={groups} onClose={vi.fn()} />);

    expect(screen.getByRole("heading", { name: /live situation/i })).toBeInTheDocument();
  });

  it("renders IRIS Seismic Monitor as an external noreferrer link", () => {
    render(<EmergencyLinksSidebar groups={groups} onClose={vi.fn()} />);

    const link = screen.getByRole("link", { name: /iris seismic monitor/i });

    expect(link).toHaveAttribute("href", "https://ds.iris.edu/seismon/index.phtml");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("shows the Community label for community resources", () => {
    render(<EmergencyLinksSidebar groups={groups} onClose={vi.fn()} />);

    expect(screen.getByText("Community")).toBeInTheDocument();
  });

  it("calls onClose when clicking the close button", () => {
    const onClose = vi.fn();
    render(<EmergencyLinksSidebar groups={groups} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: /close emergency links/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when pressing Escape", () => {
    const onClose = vi.fn();
    render(<EmergencyLinksSidebar groups={groups} onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when clicking the backdrop", () => {
    const onClose = vi.fn();
    render(<EmergencyLinksSidebar groups={groups} onClose={onClose} />);

    fireEvent.mouseDown(screen.getByTestId("emergency-links-backdrop"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders an empty state when no groups are configured", () => {
    render(<EmergencyLinksSidebar groups={[]} onClose={vi.fn()} />);

    expect(screen.getByText("No emergency resources configured.")).toBeInTheDocument();
  });
});
