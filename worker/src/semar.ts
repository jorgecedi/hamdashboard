import type { RawFeedEntry } from "./feedTypes";

export const SEMAR_TSUNAMI_SOURCE_ID = "semar-tsunami-alerts";

const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const possibleImpactPatterns = [
  /\bse pueden producir variaciones\b/u,
  /\bse esperan? variaciones\b/u,
  /\bpodrian? (?:producirse|presentarse) (?:variaciones|corrientes?)\b/u,
  /\bposible presencia de corrientes\b/u,
  /\b(?:mantener|tomar) precauciones\b/u,
  /\bse recomienda(?: mantener)? precauciones\b/u,
  /\bcorrientes? (?:fuertes )?(?:en|para) (?:zonas? costeras?|la entrada de (?:los )?puertos?)\b/u,
  /\b(?:oleaje|ondas?|nivel del mar) (?:peligroso|anormal|elevado)\b/u,
  /\b(?:aviso|orden|recomendacion) de evacuacion\b/u,
];
const explicitNoImpactPatterns = [
  /\bno se pueden producir variaciones(?: de pocos centimetros)?(?: (?:en el|del) nivel del mar)?\b/u,
  /\bno se esperan? variaciones de pocos centimetros(?: (?:en el|del) nivel del mar)?\b/u,
  /\bno se esperan? variaciones(?: importantes)? (?:en el|del) nivel del mar\b/u,
  /\bno se esperan? (?:la )?generacion(?:es)? de variaciones(?: de pocos centimetros)?(?: (?:en el|del) nivel del mar)?\b/u,
  /\bno se espera la generacion de un tsunami\b/u,
  /\bse descarta el arribo de un tsunami\b/u,
  /\bse confirma la ausencia de variaciones importantes\b/u,
];

function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function normalizedClauses(entry: RawFeedEntry): string[] {
  return [entry.title, entry.summary ?? ""]
    .map(normalizeText)
    .flatMap((text) => text.split(/[.,;:!?]+|\b(?:sin embargo|aunque|pero|no obstante|aun asi)\b/u))
    .map((clause) => clause.trim())
    .filter(Boolean);
}

function mayAffectSeaLevel(entry: RawFeedEntry): boolean {
  const clauses = normalizedClauses(entry);
  const classified = clauses.map((clause) => ({
    hasImpact: possibleImpactPatterns.some((pattern) => pattern.test(clause)),
    hasNoImpact: explicitNoImpactPatterns.some((pattern) => pattern.test(clause)),
  }));

  if (classified.some(({ hasImpact, hasNoImpact }) => hasImpact && !hasNoImpact)) {
    return true;
  }

  return !classified.some(({ hasNoImpact }) => hasNoImpact);
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
