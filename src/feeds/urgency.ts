import type { Urgency } from "./types";

type ScoreUrgencyInput = {
  title: string;
  summary?: string;
  sourcePriority: number;
  keywords: string[];
};

function normalizeText(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function scoreUrgency(input: ScoreUrgencyInput): Urgency {
  const haystack = normalizeText(`${input.title} ${input.summary ?? ""}`);
  const matches = input.keywords.filter((keyword) => haystack.includes(normalizeText(keyword)));

  if (matches.length === 0) return "normal";
  if (input.sourcePriority >= 8 || matches.length >= 2) return "urgent";
  return "watch";
}
