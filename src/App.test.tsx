import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";

describe("App", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

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

  it("surfaces a feed service outage when the feed request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network unavailable"));

    render(<App />);

    await waitFor(() => expect(screen.getByText(/feed-service: Network unavailable/i)).toBeInTheDocument());
    expect(screen.getAllByText("Feed service unavailable").length).toBeGreaterThan(0);
  });

  it("refreshes feeds every 180 seconds", async () => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ items: [], statuses: [] }), { status: 200 }));

    render(<App />);

    await vi.advanceTimersByTimeAsync(0);
    expect(fetch).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(179_000);
    expect(fetch).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1_000);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
