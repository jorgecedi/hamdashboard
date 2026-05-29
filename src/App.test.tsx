import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "./App";

describe("App", () => {
  it("renders the scaffold dashboard heading", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: /XE1CPM Emergency Weather Dashboard/i,
      }),
    ).toBeInTheDocument();
  });
});
