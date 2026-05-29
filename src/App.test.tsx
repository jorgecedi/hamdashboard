import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "./App";

describe("App", () => {
  it("renders the dashboard shell", async () => {
    render(<App />);

    expect(screen.getByText(/XE1CPM - DL70ir/i)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /dashboard tiles/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /emergency and news feed/i })).toBeInTheDocument();
  });
});
