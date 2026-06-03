import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { OfficialSourceStatusRow } from "../feeds/sourceFreshness";
import { OfficialSourceStatusPanel } from "./OfficialSourceStatusPanel";

const rows: OfficialSourceStatusRow[] = [
  {
    sourceId: "semar-tsunami-alerts",
    label: "SEMAR Tsunami Alerts",
    category: "emergency",
    state: "fresh",
    fetchedAt: "2026-06-02T11:30:00Z",
    itemCount: 1,
    message: "Current",
  },
  {
    sourceId: "nhc-epac-es",
    label: "NHC Eastern Pacific Spanish",
    category: "weather",
    state: "stale",
    fetchedAt: "2026-06-01T04:00:00Z",
    itemCount: 0,
    message: "Source may not be current",
  },
];

describe("OfficialSourceStatusPanel", () => {
  it("renders official source status rows", () => {
    render(<OfficialSourceStatusPanel rows={rows} />);

    expect(screen.getByRole("heading", { name: /official sources/i })).toBeInTheDocument();
    expect(screen.getByText("SEMAR Tsunami Alerts")).toBeInTheDocument();
    expect(screen.getByText("Source may not be current")).toBeInTheDocument();
  });

  it("renders nothing without official source rows", () => {
    const { container } = render(<OfficialSourceStatusPanel rows={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
