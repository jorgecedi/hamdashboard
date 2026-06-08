import { urgencyKeywords } from "./config";
import type { FeedItem, RawFeedEntry, Urgency, WorkerFeedSource } from "./feedTypes";
import { isSemarSource } from "./semar";

const locationKeywords = ["puerto vallarta", "jalisco"];
const noaaSpanishTranslationDisclaimer =
  /\*{3}\s*Este producto ha sido procesado automáticamente utilizando un programa de traducción y puede contener omisiones y errores\. El Servicio Nacional de Meteorología no puede garantizar la precisión del texto convertido\. De haber alguna duda, el texto en inglés es siempre la versión autorizada\.\s*\*{3}/giu;

function normalizeText(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function scoreUrgency(entry: RawFeedEntry, source: WorkerFeedSource): Urgency {
  if (isSemarSource(source.id)) return "urgent";

  const haystack = normalizeText(`${entry.title} ${entry.summary ?? ""}`);
  const official = source.tags.includes("official");
  const normalizedLocationKeywords = new Set(locationKeywords.map((keyword) => normalizeText(keyword)));
  const normalizedKeywords = [
    ...new Set(
      urgencyKeywords
        .map((keyword) => normalizeText(keyword))
        .filter((keyword) => official || !normalizedLocationKeywords.has(keyword)),
    ),
  ];
  const matches = normalizedKeywords.filter((keyword) => haystack.includes(keyword));

  if (matches.length === 0) return "normal";
  if (source.priority >= 8 || matches.length >= 2) return "urgent";
  return "watch";
}

function cleanSummary(summary: string | undefined): string | undefined {
  const cleaned = summary?.replace(noaaSpanishTranslationDisclaimer, "").replace(/\s+/g, " ").trim();
  return cleaned || undefined;
}

export function normalizeEntry(entry: RawFeedEntry, source: WorkerFeedSource, fetchedAt: string): FeedItem {
  const { summary: _summary, ...entryWithoutSummary } = entry;
  const summary = cleanSummary(entry.summary);

  return {
    ...entryWithoutSummary,
    ...(summary ? { summary } : {}),
    id: `${source.id}:${entry.url}`,
    sourceId: source.id,
    sourceName: source.name,
    fetchedAt,
    category: source.category,
    urgency: scoreUrgency(entry, source),
    tags: source.tags,
  };
}
