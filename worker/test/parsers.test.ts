import { describe, expect, it } from "vitest";
import { parseJsonFeed, parseXmlFeed } from "../src/parsers";

describe("parseXmlFeed", () => {
  it("parses RSS items", () => {
    const xml = `<?xml version="1.0"?><rss><channel><item><title>Storm update</title><link>https://example.com/storm</link><description>Heavy rain</description><pubDate>Fri, 29 May 2026 12:00:00 GMT</pubDate></item></channel></rss>`;

    expect(parseXmlFeed(xml)).toEqual([
      {
        title: "Storm update",
        url: "https://example.com/storm",
        summary: "Heavy rain",
        publishedAt: "Fri, 29 May 2026 12:00:00 GMT",
      },
    ]);
  });

  it("parses Atom entries with link href", () => {
    const xml = `<feed><entry><title>Alert</title><link href="https://example.com/alert"/><summary>Watch issued</summary><updated>2026-05-29T12:00:00Z</updated></entry></feed>`;

    expect(parseXmlFeed(xml)).toEqual([
      {
        title: "Alert",
        url: "https://example.com/alert",
        summary: "Watch issued",
        publishedAt: "2026-05-29T12:00:00Z",
      },
    ]);
  });

  it("parses Atom entries with link text and content", () => {
    const xml = `<feed><entry><title>Bulletin</title><link>https://example.com/bulletin</link><content>Storm content</content><published>2026-05-29T13:00:00Z</published></entry></feed>`;

    expect(parseXmlFeed(xml)).toEqual([
      {
        title: "Bulletin",
        url: "https://example.com/bulletin",
        summary: "Storm content",
        publishedAt: "2026-05-29T13:00:00Z",
      },
    ]);
  });
});

describe("parseJsonFeed", () => {
  it("parses common JSON feed items", () => {
    const json = JSON.stringify({
      items: [
        {
          title: "Local alert",
          url: "https://example.com/local-alert",
          summary: "Road flooding",
          date_published: "2026-05-29T12:00:00Z",
        },
      ],
    });

    expect(parseJsonFeed(json)).toEqual([
      {
        title: "Local alert",
        url: "https://example.com/local-alert",
        summary: "Road flooding",
        publishedAt: "2026-05-29T12:00:00Z",
      },
    ]);
  });

  it("uses link, content_text, and publishedAt fallbacks", () => {
    const json = JSON.stringify({
      items: [
        {
          title: "Fallback alert",
          link: "https://example.com/fallback",
          content_text: "Flood update",
          publishedAt: "2026-05-29T14:00:00Z",
        },
      ],
    });

    expect(parseJsonFeed(json)).toEqual([
      {
        title: "Fallback alert",
        url: "https://example.com/fallback",
        summary: "Flood update",
        publishedAt: "2026-05-29T14:00:00Z",
      },
    ]);
  });
});
