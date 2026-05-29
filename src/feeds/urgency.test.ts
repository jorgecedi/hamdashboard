import { describe, expect, it } from "vitest";
import { scoreUrgency } from "./urgency";

describe("scoreUrgency", () => {
  const keywords = ["Puerto Vallarta", "huracán", "evacuation", "flood"];

  it("marks official high-priority keyword matches urgent", () => {
    expect(
      scoreUrgency({
        title: "Huracán cerca de Puerto Vallarta",
        summary: "Aviso oficial",
        sourcePriority: 10,
        keywords,
      }),
    ).toBe("urgent");
  });

  it("marks lower-priority keyword matches as watch", () => {
    expect(
      scoreUrgency({
        title: "Flood risk increases",
        summary: "",
        sourcePriority: 3,
        keywords,
      }),
    ).toBe("watch");
  });

  it("does not double-count accented duplicate keyword matches", () => {
    expect(
      scoreUrgency({
        title: "Inundación reportada en zona baja",
        summary: "",
        sourcePriority: 3,
        keywords: ["inundacion", "inundación"],
      }),
    ).toBe("watch");
  });

  it("marks two distinct lower-priority keyword matches urgent", () => {
    expect(
      scoreUrgency({
        title: "Flood evacuation notices issued",
        summary: "",
        sourcePriority: 3,
        keywords,
      }),
    ).toBe("urgent");
  });

  it("marks unrelated items normal", () => {
    expect(
      scoreUrgency({
        title: "Community meeting schedule",
        summary: "No hazards reported",
        sourcePriority: 10,
        keywords,
      }),
    ).toBe("normal");
  });
});
