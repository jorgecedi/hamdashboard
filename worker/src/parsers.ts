import type { RawFeedEntry } from "./feedTypes";

function normalizeFeedText(value: string): string {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p\s*>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/\s+/g, " ")
    .trim();
}

function textBetween(xml: string, tag: string): string | undefined {
  const match = xml.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  const value = match?.[1];
  return value ? normalizeFeedText(value) : undefined;
}

function attr(xml: string, tag: string, name: string): string | undefined {
  const match = xml.match(new RegExp(`<${tag}\\b[^>]*\\s${name}=["']([^"']+)["'][^>]*>`, "i"));
  const value = match?.[1];
  return value ? normalizeFeedText(value) : undefined;
}

function entry(title: string, url: string, summary?: string, publishedAt?: string): RawFeedEntry {
  return {
    title,
    url,
    ...(summary ? { summary } : {}),
    ...(publishedAt ? { publishedAt } : {}),
  };
}

export function parseXmlFeed(xml: string): RawFeedEntry[] {
  const rssItems = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((match) => match[0]);
  if (rssItems.length > 0) {
    return rssItems
      .map((item) =>
        entry(
          textBetween(item, "title") ?? "Untitled",
          textBetween(item, "link") ?? "",
          textBetween(item, "description"),
          textBetween(item, "pubDate"),
        ),
      )
      .filter((item) => item.url);
  }

  return [...xml.matchAll(/<entry[\s\S]*?<\/entry>/gi)]
    .map((match) => match[0])
    .map((atomEntry) =>
      entry(
        textBetween(atomEntry, "title") ?? "Untitled",
        attr(atomEntry, "link", "href") ?? textBetween(atomEntry, "link") ?? "",
        textBetween(atomEntry, "summary") ?? textBetween(atomEntry, "content"),
        textBetween(atomEntry, "updated") ?? textBetween(atomEntry, "published"),
      ),
    )
    .filter((item) => item.url);
}

export function parseJsonFeed(body: string): RawFeedEntry[] {
  const parsed = JSON.parse(body) as { items?: Array<Record<string, unknown>> };

  return (parsed.items ?? [])
    .map((item) =>
      entry(
        normalizeFeedText(String(item.title ?? "Untitled")),
        normalizeFeedText(String(item.url ?? item.link ?? "")),
        item.summary ? normalizeFeedText(String(item.summary)) : item.content_text ? normalizeFeedText(String(item.content_text)) : undefined,
        item.date_published ? normalizeFeedText(String(item.date_published)) : item.publishedAt ? normalizeFeedText(String(item.publishedAt)) : undefined,
      ),
    )
    .filter((item) => item.url);
}
