import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
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
  afterEach(() => cleanup());

  it("renders the current image source", () => {
    render(<Tile tile={tile} />);
    expect(screen.getByAltText("Cams")).toHaveAttribute("src", expect.stringContaining("one.jpg"));
  });

  it("rotates sources on next click", () => {
    render(<Tile tile={tile} />);
    fireEvent.click(screen.getByRole("button", { name: /next source/i }));
    expect(screen.getByAltText("Cams")).toHaveAttribute("src", expect.stringContaining("two.jpg"));
  });
});
