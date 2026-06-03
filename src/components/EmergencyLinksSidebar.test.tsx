import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CriticalContact, EmergencyChecklistItem, EmergencyLinkGroup, RadioReference } from "../config/types";
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

const checklist: EmergencyChecklistItem[] = [
  { id: "water-food", label: "Water and non-perishable food" },
  { id: "radio", label: "Battery or hand-crank radio" },
];

const contacts: CriticalContact[] = [
  { id: "mexico-emergency", label: "Emergencias Mexico", value: "911", official: true },
  { id: "cfe", label: "CFE fallas electricas", value: "071", official: true },
];

const radioReferences: RadioReference[] = [
  { id: "marine-vhf-16", label: "Marine VHF Ch 16", frequency: "156.800 MHz" },
  {
    id: "ham-2m-simplex",
    label: "Ham 2m simplex calling",
    frequency: "146.520 MHz FM",
    note: "Licensed operators only",
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

  it("renders offline checklist, official contacts, and radio references", () => {
    render(
      <EmergencyLinksSidebar
        groups={groups}
        checklist={checklist}
        contacts={contacts}
        radioReferences={radioReferences}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: /offline checklist/i })).toBeInTheDocument();
    expect(screen.getByText("Water and non-perishable food")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /critical contacts/i })).toBeInTheDocument();
    expect(screen.getByText("911")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /radio reference/i })).toBeInTheDocument();
    expect(screen.getByText("146.520 MHz FM")).toBeInTheDocument();
    expect(screen.getByText("Licensed operators only")).toBeInTheDocument();
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
