import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultConfig } from "../config/defaultConfig";
import { SettingsPanel } from "./SettingsPanel";

describe("SettingsPanel", () => {
  afterEach(() => cleanup());

  it("saves worker endpoint overrides", () => {
    const onSave = vi.fn();
    render(<SettingsPanel config={defaultConfig} onSave={onSave} onReset={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/worker endpoint/i), { target: { value: "https://feeds.example.workers.dev/api" } });
    fireEvent.click(screen.getByRole("button", { name: /save settings/i }));

    expect(onSave).toHaveBeenCalledWith({
      workerEndpoint: "https://feeds.example.workers.dev/api",
      tiles: defaultConfig.tiles.map((tile) => ({ id: tile.id, refreshSeconds: tile.refreshSeconds })),
    });
  });

  it("saves per-tile rotation seconds overrides", () => {
    const onSave = vi.fn();
    render(<SettingsPanel config={defaultConfig} onSave={onSave} onReset={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/radar rotation seconds/i), { target: { value: "1800" } });
    fireEvent.change(screen.getByLabelText(/live video rotation seconds/i), { target: { value: "3600" } });
    fireEvent.click(screen.getByRole("button", { name: /save settings/i }));

    expect(onSave).toHaveBeenCalledWith({
      workerEndpoint: "/api",
      tiles: expect.arrayContaining([
        { id: "radar", refreshSeconds: 1800 },
        { id: "live-video", refreshSeconds: 3600 },
      ]),
    });
  });

  it("calls reset", () => {
    const onReset = vi.fn();
    render(<SettingsPanel config={defaultConfig} onSave={vi.fn()} onReset={onReset} />);
    fireEvent.click(screen.getByRole("button", { name: /reset settings/i }));
    expect(onReset).toHaveBeenCalled();
  });
});
