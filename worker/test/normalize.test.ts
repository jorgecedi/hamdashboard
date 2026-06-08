import { describe, expect, it } from "vitest";
import type { WorkerFeedSource } from "../src/feedTypes";
import { normalizeEntry } from "../src/normalize";

const officialSource: WorkerFeedSource = {
  id: "official",
  name: "Official",
  category: "weather",
  kind: "rss",
  url: "https://example.com/official",
  priority: 9,
  enabled: true,
  tags: ["official"],
};

const localNewsSource: WorkerFeedSource = {
  id: "local-news",
  name: "Local News",
  category: "local",
  kind: "rss",
  url: "https://example.com/local",
  priority: 4,
  enabled: true,
  tags: ["local", "news"],
};

const semarSource: WorkerFeedSource = {
  id: "semar-tsunami-alerts",
  name: "SEMAR Tsunami Alerts",
  category: "emergency",
  kind: "rss",
  url: "https://diredimoat.semar.gob.mx/cat/rss/rss_feed.xml",
  priority: 10,
  enabled: true,
  tags: ["official", "mexico", "tsunami"],
};

describe("normalizeEntry urgency", () => {
  it("removes the NOAA Spanish machine translation disclaimer from summaries", () => {
    const item = normalizeEntry(
      {
        title: "Aviso de clima",
        summary:
          "Lluvia fuerte esperada. *** Este producto ha sido procesado automáticamente utilizando un programa de traducción y puede contener omisiones y errores. El Servicio Nacional de Meteorología no puede garantizar la precisión del texto convertido. De haber alguna duda, el texto en inglés es siempre la versión autorizada. *** Manténgase atento.",
        url: "https://example.com/official/disclaimer",
      },
      officialSource,
      "2026-05-29T12:00:00Z",
    );

    expect(item.summary).toBe("Lluvia fuerte esperada. Manténgase atento.");
  });

  it("does not raise urgency for location-only matches from non-official feeds", () => {
    const item = normalizeEntry(
      {
        title: "Puerto Vallarta and Jalisco tourism update",
        url: "https://example.com/local/location",
      },
      localNewsSource,
      "2026-05-29T12:00:00Z",
    );

    expect(item.urgency).toBe("normal");
  });

  it("raises urgency for location-only matches from official feeds", () => {
    const item = normalizeEntry(
      {
        title: "Puerto Vallarta and Jalisco weather bulletin",
        url: "https://example.com/official/location",
      },
      officialSource,
      "2026-05-29T12:00:00Z",
    );

    expect(item.urgency).toBe("urgent");
  });

  it("still raises urgency for hazard matches from non-official feeds", () => {
    const item = normalizeEntry(
      {
        title: "Flood and evacuation reported downtown",
        url: "https://example.com/local/hazard",
      },
      localNewsSource,
      "2026-05-29T12:00:00Z",
    );

    expect(item.urgency).toBe("urgent");
  });

  it("always marks retained SEMAR entries urgent", () => {
    const item = normalizeEntry(
      {
        title: "Boletín informativo",
        summary: "Se pueden producir variaciones de pocos centímetros.",
        url: "https://example.com/semar/informative",
      },
      semarSource,
      "2026-06-08T12:00:00Z",
    );

    expect(item.urgency).toBe("urgent");
  });
});
