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

  it("cache-busts image sources when displaying and rotating them", () => {
    render(<Tile tile={tile} />);
    const firstSrc = screen.getByAltText("Cams").getAttribute("src");

    expect(firstSrc).toContain("one.jpg");
    expect(firstSrc).toContain("_=");

    fireEvent.click(screen.getByRole("button", { name: /next source/i }));
    const secondSrc = screen.getByAltText("Cams").getAttribute("src");

    expect(secondSrc).toContain("two.jpg");
    expect(secondSrc).toContain("_=");
    expect(secondSrc).not.toBe(firstSrc);
  });

  it("marks expanded images so they can preserve aspect ratio", () => {
    render(<Tile tile={tile} />);

    fireEvent.click(screen.getByRole("button", { name: /expand tile/i }));

    expect(screen.getByAltText("Cams")).toHaveClass("tile-media-image");
    expect(screen.getByRole("article")).toHaveClass("tile-expanded");
    expect(screen.getByRole("article")).toHaveClass("tile-expanded-image");
  });

  it("toggles fullscreen when clicking the tile", () => {
    render(<Tile tile={tile} />);
    const article = screen.getByRole("article");

    fireEvent.click(article);
    expect(article).toHaveClass("tile-expanded");

    fireEvent.click(article);
    expect(article).not.toHaveClass("tile-expanded");
  });

  it("does not toggle fullscreen when clicking the next source button", () => {
    render(<Tile tile={tile} />);

    fireEvent.click(screen.getByRole("button", { name: /next source/i }));

    expect(screen.getByRole("article")).not.toHaveClass("tile-expanded");
    expect(screen.getByAltText("Cams")).toHaveAttribute("src", expect.stringContaining("two.jpg"));
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

  it("refreshes cache-busted image URLs for single-source image tiles", () => {
    vi.useFakeTimers();
    render(<Tile tile={{ ...tile, sources: [{ kind: "image", url: "https://example.com/only.jpg" }], refreshSeconds: 5 }} />);

    const firstSrc = screen.getByAltText("Cams").getAttribute("src");

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    const secondSrc = screen.getByAltText("Cams").getAttribute("src");

    expect(firstSrc).toContain("only.jpg");
    expect(secondSrc).toContain("only.jpg");
    expect(secondSrc).not.toBe(firstSrc);
  });
});
