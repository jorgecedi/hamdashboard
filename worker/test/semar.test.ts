import { describe, expect, it } from "vitest";
import type { RawFeedEntry } from "../src/feedTypes";
import { filterSemarEntries, isSemarSource, SEMAR_TSUNAMI_SOURCE_ID } from "../src/semar";

const fetchedAt = "2026-06-08T20:00:00Z";
const recentPublishedAt = "2026-06-08T19:00:00Z";

function entry(summary: string, publishedAt?: string): RawFeedEntry {
  return {
    title: "BOLETIN INFORMATIVO 001",
    url: `https://example.com/${publishedAt ?? "missing"}`,
    summary,
    ...(publishedAt ? { publishedAt } : {}),
  };
}

describe("SEMAR source identity", () => {
  it("identifies only the SEMAR tsunami source", () => {
    expect(SEMAR_TSUNAMI_SOURCE_ID).toBe("semar-tsunami-alerts");
    expect(isSemarSource(SEMAR_TSUNAMI_SOURCE_ID)).toBe(true);
    expect(isSemarSource("another-source")).toBe(false);
  });
});

describe("filterSemarEntries dates", () => {
  const possibleImpact = "Se pueden producir variaciones de pocos centimetros en el nivel del mar.";

  it("keeps an entry exactly 24 hours old", () => {
    expect(filterSemarEntries([entry(possibleImpact, "Sun, 07 Jun 2026 20:00:00 GMT")], fetchedAt)).toHaveLength(1);
  });

  it("discards an entry older than 24 hours", () => {
    expect(filterSemarEntries([entry(possibleImpact, "2026-06-07T19:59:59Z")], fetchedAt)).toEqual([]);
  });

  it("discards an entry with a missing publishedAt", () => {
    expect(filterSemarEntries([entry(possibleImpact)], fetchedAt)).toEqual([]);
  });

  it("discards an entry with an invalid publishedAt", () => {
    expect(filterSemarEntries([entry(possibleImpact, "not-a-date")], fetchedAt)).toEqual([]);
  });

  it("discards a future-dated entry", () => {
    expect(filterSemarEntries([entry(possibleImpact, "2026-06-08T20:00:01Z")], fetchedAt)).toEqual([]);
  });

  it("discards all entries when fetchedAt is invalid", () => {
    expect(filterSemarEntries([entry(possibleImpact, recentPublishedAt)], "not-a-date")).toEqual([]);
  });
});

describe("filterSemarEntries impact", () => {
  it.each([
    "NO se esperan variaciones del nivel del mar por la ubicacion del epicentro.",
    "NO se esperan variaciones en el nivel del mar.",
    "NO se espera la generacion de variaciones del nivel del mar.",
    "NO se esperan generaciones de variaciones en el nivel del mar.",
    "NO se pueden producir variaciones del nivel del mar.",
    "NO se esperan variaciones de pocos centimetros.",
    "No se requieren precauciones porque no se esperan variaciones del nivel del mar.",
    "No se espera la generacion de variaciones de pocos centimetros.",
    "NO se espera la generacion de un tsunami para las costas de Mexico.",
    "Se descarta el arribo de un tsunami para las costas de Mexico.",
    "Se confirma la ausencia de variaciones importantes en el nivel del mar.",
  ])("discards explicit no-impact wording: %s", (summary) => {
    expect(filterSemarEntries([entry(summary, recentPublishedAt)], fetchedAt)).toEqual([]);
  });

  it("discards a realistic no-impact bulletin containing SEMAR source boilerplate", () => {
    const item = entry(
      "Aviso del Centro de Alerta de Tsunamis: se descarta el arribo de un tsunami para las costas de Mexico.",
      recentPublishedAt,
    );

    expect(filterSemarEntries([item], fetchedAt)).toEqual([]);
  });

  it.each([
    "NO SE ESPERA LA GENERACION DE UN TSUNAMI; sin embargo, se pueden producir variaciones de pocos centimetros.",
    "No se espera la generacion de un tsunami; sin embargo, podrian presentarse corrientes fuertes en zonas costeras.",
    "Mantener precauciones por la posible presencia de corrientes en la entrada de los puertos.",
    "Se esperan variaciones del nivel del mar.",
    "Se reporta oleaje anormal en la costa.",
    "Aviso de evacuación preventiva.",
    "Evaluacion preliminar pendiente de informacion complementaria.",
  ])("keeps possible or uncertain impact wording: %s", (summary) => {
    expect(filterSemarEntries([entry(summary, recentPublishedAt)], fetchedAt)).toHaveLength(1);
  });

  it("normalizes case, accents, and whitespace before matching", () => {
    const summary = "  SE   CONFIRMA\nLA AUSENCIA DE VARIACIONES IMPORTANTES EN EL NIVEL DEL MAR. ";

    expect(filterSemarEntries([entry(summary, recentPublishedAt)], fetchedAt)).toEqual([]);
  });

  it("keeps positive impact wording even when the title contains a negative statement", () => {
    const item = entry("Posible presencia de corrientes en la entrada de los puertos.", recentPublishedAt);
    item.title = "No se espera la generación de un tsunami";

    expect(filterSemarEntries([item], fetchedAt)).toHaveLength(1);
  });

  it("keeps concrete positive impact after the live no-variation wording", () => {
    const item = entry(
      "NO se espera la generacion de variaciones del nivel del mar; sin embargo, se recomienda mantener precauciones por corrientes en la entrada de los puertos.",
      recentPublishedAt,
    );

    expect(filterSemarEntries([item], fetchedAt)).toHaveLength(1);
  });

  it.each([
    "NO SE ESPERA LA GENERACION DE UN TSUNAMI; sin embargo, se pueden producir variaciones del nivel del mar.",
    "NO SE ESPERAN VARIACIONES IMPORTANTES; aunque se pueden producir variaciones de pocos centimetros.",
  ])("keeps concrete positive impact following a contrast clause: %s", (summary) => {
    expect(filterSemarEntries([entry(summary, recentPublishedAt)], fetchedAt)).toHaveLength(1);
  });
});
