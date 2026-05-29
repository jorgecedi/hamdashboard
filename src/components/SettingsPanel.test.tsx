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

    expect(onSave).toHaveBeenCalledWith({ workerEndpoint: "https://feeds.example.workers.dev/api", tileRotationSeconds: 3600 });
  });

  it("saves global tile rotation seconds overrides", () => {
    const onSave = vi.fn();
    render(<SettingsPanel config={defaultConfig} onSave={onSave} onReset={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/tile rotation seconds/i), { target: { value: "45" } });
    fireEvent.click(screen.getByRole("button", { name: /save settings/i }));

    expect(onSave).toHaveBeenCalledWith({ workerEndpoint: "/api", tileRotationSeconds: 45 });
  });

  it("calls reset", () => {
    const onReset = vi.fn();
    render(<SettingsPanel config={defaultConfig} onSave={vi.fn()} onReset={onReset} />);
    fireEvent.click(screen.getByRole("button", { name: /reset settings/i }));
    expect(onReset).toHaveBeenCalled();
  });
});
