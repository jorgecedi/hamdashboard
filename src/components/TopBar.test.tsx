import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defaultConfig } from "../config/defaultConfig";
import { TopBar } from "./TopBar";

describe("TopBar", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("calls the emergency links toggle callback", () => {
    const onToggleEmergencyLinks = vi.fn();
    render(<TopBar config={defaultConfig} emergencyLinksOpen={false} onToggleEmergencyLinks={onToggleEmergencyLinks} />);

    fireEvent.click(screen.getByRole("button", { name: /open emergency links/i }));

    expect(onToggleEmergencyLinks).toHaveBeenCalledTimes(1);
  });

  it("exposes the open state to assistive technology", () => {
    render(<TopBar config={defaultConfig} emergencyLinksOpen={true} onToggleEmergencyLinks={vi.fn()} />);

    expect(screen.getByRole("button", { name: /close emergency links/i })).toHaveAttribute("aria-expanded", "true");
  });

  it("renders the emergency links button before local time in the left section", () => {
    const { container } = render(
      <TopBar config={defaultConfig} emergencyLinksOpen={false} onToggleEmergencyLinks={vi.fn()} />,
    );

    const leftSection = container.querySelector<HTMLElement>(".top-bar-left");
    const button = screen.getByRole("button", { name: /open emergency links/i });
    const localTime = container.querySelector<HTMLElement>(".top-bar-time");

    expect(leftSection).toContainElement(button);
    expect(leftSection).toContainElement(localTime);
    expect(button.compareDocumentPosition(localTime as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("updates the displayed time every second", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-03T12:00:00Z"));

    render(<TopBar config={defaultConfig} emergencyLinksOpen={false} onToggleEmergencyLinks={vi.fn()} />);

    expect(screen.getByText("2026-06-03 12:00:00 UTC")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000);
    });

    expect(screen.getByText("2026-06-03 12:00:01 UTC")).toBeInTheDocument();
  });
});
