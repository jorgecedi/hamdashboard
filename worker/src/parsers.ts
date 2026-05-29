import type { RawFeedEntry } from "./feedTypes";

function decodeXmlText(value: string): string {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .trim();
}

function textBetween(xml: string, tag: string): string | undefined {
  const match = xml.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  const value = match?.[1];
  return value ? decodeXmlText(value) : undefined;
}

function attr(xml: string, tag: string, name: string): string | undefined {
  const match = xml.match(new RegExp(`<${tag}\\b[^>]*\\s${name}=["']([^"']+)["'][^>]*>`, "i"));
  const value = match?.[1];
  return value ? decodeXmlText(value) : undefined;
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
        String(item.title ?? "Untitled"),
        String(item.url ?? item.link ?? ""),
        item.summary ? String(item.summary) : item.content_text ? String(item.content_text) : undefined,
        item.date_published ? String(item.date_published) : item.publishedAt ? String(item.publishedAt) : undefined,
      ),
    )
    .filter((item) => item.url);
}
