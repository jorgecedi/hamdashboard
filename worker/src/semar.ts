import type { RawFeedEntry } from "./feedTypes";

export const SEMAR_TSUNAMI_SOURCE_ID = "semar-tsunami-alerts";

const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const possibleImpactPatterns = [
  /\bse pueden producir variaciones\b/u,
  /(?<!\bno )\bse esperan? variaciones\b/u,
  /\bvariaciones de pocos centimetros\b/u,
  /\bposible presencia de corrientes\b/u,
  /\bcorrientes? en la entrada de (?:los )?puertos?\b/u,
  /\b(?:oleaje|ondas?|nivel del mar) (?:peligroso|anormal|elevado)\b/u,
  /\b(?:evacuacion|precauciones?)\b/u,
];
const explicitNoImpactPatterns = [
  /\bno se esperan? variaciones(?: importantes)? (?:en el|del) nivel del mar\b/u,
  /\bno se esperan? (?:la )?generacion(?:es)? de variaciones (?:en el|del) nivel del mar\b/u,
  /\bno se espera la generacion de un tsunami\b/u,
  /\bse descarta el arribo de un tsunami\b/u,
  /\bse confirma la ausencia de variaciones importantes\b/u,
];

function normalizedText(entry: RawFeedEntry): string {
  return `${entry.title} ${entry.summary ?? ""}`
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function mayAffectSeaLevel(entry: RawFeedEntry): boolean {
  const text = normalizedText(entry);

  if (possibleImpactPatterns.some((pattern) => pattern.test(text))) {
    return true;
  }

  return !explicitNoImpactPatterns.some((pattern) => pattern.test(text));
}

export function filterSemarEntries(entries: RawFeedEntry[], fetchedAt: string): RawFeedEntry[] {
  const fetchedTime = Date.parse(fetchedAt);
  if (!Number.isFinite(fetchedTime)) return [];

  return entries.filter((entry) => {
    if (!entry.publishedAt) return false;

    const publishedTime = Date.parse(entry.publishedAt);
    if (!Number.isFinite(publishedTime)) return false;

    const age = fetchedTime - publishedTime;
    return age >= 0 && age <= MAX_AGE_MS && mayAffectSeaLevel(entry);
  });
}

export function isSemarSource(sourceId: string): boolean {
  return sourceId === SEMAR_TSUNAMI_SOURCE_ID;
}
