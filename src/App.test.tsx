import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { App } from "./App";

describe("App", () => {
  afterEach(() => cleanup());

  it("renders when structuredClone is unavailable", async () => {
    const originalStructuredClone = globalThis.structuredClone;
    Reflect.deleteProperty(globalThis, "structuredClone");

    try {
      render(<App />);

      expect(screen.getByText(/XE1CPM - DL70ir/i)).toBeInTheDocument();
    } finally {
      globalThis.structuredClone = originalStructuredClone;
    }
  });

  it("renders the dashboard shell", async () => {
    render(<App />);

    expect(screen.getByText(/XE1CPM - DL70ir/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open emergency links/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /dashboard tiles/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /emergency and news feed/i })).toBeInTheDocument();
  });
});
