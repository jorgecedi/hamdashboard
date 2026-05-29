import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { DashboardTile } from "../config/types";
import { Tile } from "./Tile";

const tile: DashboardTile = {
  id: "cams",
  title: "Cams",
  group: "local",
  refreshSeconds: 10,
  enabled: true,
  sources: [
    { kind: "image", url: "https://example.com/one.jpg" },
    { kind: "image", url: "https://example.com/two.jpg" },
  ],
};

describe("Tile", () => {
  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it("renders the current image source", () => {
    render(<Tile tile={tile} />);
    expect(screen.getByAltText("Cams")).toHaveAttribute("src", expect.stringContaining("one.jpg"));
  });

  it("rotates sources on next click", () => {
    render(<Tile tile={tile} />);
    fireEvent.click(screen.getByRole("button", { name: /next source/i }));
    expect(screen.getByAltText("Cams")).toHaveAttribute("src", expect.stringContaining("two.jpg"));
  });

  it("auto-rotates sources after the configured interval", () => {
    vi.useFakeTimers();
    render(<Tile tile={{ ...tile, refreshSeconds: 5 }} />);

    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(screen.getByAltText("Cams")).toHaveAttribute("src", expect.stringContaining("one.jpg"));

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByAltText("Cams")).toHaveAttribute("src", expect.stringContaining("two.jpg"));
  });
});
