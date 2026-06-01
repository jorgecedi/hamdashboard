import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultConfig } from "../config/defaultConfig";
import { TopBar } from "./TopBar";

describe("TopBar", () => {
  afterEach(() => cleanup());

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
});
