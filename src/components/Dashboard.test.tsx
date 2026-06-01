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

    fireEvent.click(within(sidebar).getByRole("button", { name: /close emergency links/i }));

    expect(screen.queryByRole("complementary", { name: /emergency resources/i })).not.toBeInTheDocument();
  });
});
