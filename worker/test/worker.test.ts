import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker from "../src/index";

const NOW = new Date("2026-06-08T12:00:00Z");
const hoursAgo = (hours: number) => new Date(NOW.getTime() - hours * 60 * 60 * 1000).toUTCString();

describe("worker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("returns health", async () => {
    const response = await worker.fetch(new Request("https://feeds.example.test/api/health"), {
      CACHE_SECONDS: "90",
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/json; charset=utf-8");
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    expect(await response.json()).toMatchObject({ ok: true, cacheSeconds: 90, sourceCount: 3 });
  });

  it("returns 404 for unknown routes", async () => {
    const response = await worker.fetch(new Request("https://feeds.example.test/nope"), {});

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Not found" });
  });

  it("returns parsed and normalized feed items without live network calls", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(
        `<rss><channel><item><title>Hurricane update</title><link>https://example.com/hurricane</link><description>Flood surge alert</description><pubDate>2026-05-29T15:00:00Z</pubDate></item></channel></rss>`,
        { status: 200 },
      )),
    );

    const response = await worker.fetch(new Request("https://feeds.example.test/api/feeds/nhc-epac-es"), {
      CACHE_SECONDS: "45",
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("public, max-age=45");
    expect(payload.statuses).toEqual([
      expect.objectContaining({ sourceId: "nhc-epac-es", ok: true, itemCount: 1 }),
    ]);
    expect(payload.items).toEqual([
      expect.objectContaining({
        id: "nhc-epac-es:https://example.com/hurricane",
        sourceId: "nhc-epac-es",
        sourceName: "NHC Eastern Pacific Spanish",
        category: "weather",
        urgency: "urgent",
        tags: ["official", "huracan", "pacifico"],
      }),
    ]);
  });

  it("returns source failure metadata without failing the whole response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("Nope", { status: 503 })));

    const response = await worker.fetch(new Request("https://feeds.example.test/api/feeds/nhc-epac-es"), {});
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.items).toEqual([]);
    expect(payload.statuses).toEqual([
      expect.objectContaining({ sourceId: "nhc-epac-es", ok: false, itemCount: 0, error: "HTTP 503" }),
    ]);
  });

  it("filters SEMAR entries individually and retains plain-text possible-impact alerts", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(
        `<rss><channel>
          <item>
            <title>Boletín con posibles variaciones</title>
            <link>https://example.com/tsunami/retained</link>
            <description>&amp;lt;p&amp;gt;Se pueden producir &amp;lt;strong&amp;gt;variaciones de pocos centímetros&amp;lt;/strong&amp;gt;.&amp;lt;/p&amp;gt;</description>
            <pubDate>${hoursAgo(2)}</pubDate>
          </item>
          <item>
            <title>Boletín sin afectación</title>
            <link>https://example.com/tsunami/no-impact</link>
            <description>No se esperan variaciones del nivel del mar.</description>
            <pubDate>${hoursAgo(1)}</pubDate>
          </item>
          <item>
            <title>Boletín antiguo</title>
            <link>https://example.com/tsunami/old</link>
            <description>Se pueden producir variaciones del nivel del mar.</description>
            <pubDate>${hoursAgo(25)}</pubDate>
          </item>
          <item>
            <title>Boletín sin fecha</title>
            <link>https://example.com/tsunami/missing-date</link>
            <description>Se pueden producir variaciones del nivel del mar.</description>
          </item>
        </channel></rss>`,
        { status: 200 },
      )),
    );

    const response = await worker.fetch(new Request("https://feeds.example.test/api/feeds/semar-tsunami-alerts"), {});
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.statuses).toEqual([
      expect.objectContaining({ sourceId: "semar-tsunami-alerts", ok: true, itemCount: 1 }),
    ]);
    expect(payload.items).toEqual([
      expect.objectContaining({
        id: "semar-tsunami-alerts:https://example.com/tsunami/retained",
        sourceId: "semar-tsunami-alerts",
        sourceName: "SEMAR Tsunami Alerts",
        category: "emergency",
        summary: "Se pueden producir variaciones de pocos centímetros.",
        urgency: "urgent",
        tags: ["official", "mexico", "tsunami"],
      }),
    ]);
  });

  it("sorts all retained SEMAR items first and newest SEMAR first", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL | Request) => {
        const requestedUrl = String(url);
        if (requestedUrl.includes("rss_feed.xml")) {
          return new Response(
            `<rss><channel>
              <item><title>SEMAR más antigua</title><link>https://example.com/semar/older</link><description>Se pueden producir variaciones.</description><pubDate>${hoursAgo(3)}</pubDate></item>
              <item><title>SEMAR más reciente</title><link>https://example.com/semar/newer</link><description>Se esperan variaciones del nivel del mar.</description><pubDate>${hoursAgo(2)}</pubDate></item>
            </channel></rss>`,
            { status: 200 },
          );
        }

        return new Response(
          `<rss><channel><item><title>Noticia más reciente</title><link>https://example.com/newer-weather</link><description>Actualización general</description><pubDate>${hoursAgo(1)}</pubDate></item></channel></rss>`,
          { status: 200 },
        );
      }),
    );

    const response = await worker.fetch(new Request("https://feeds.example.test/api/feeds"), {});
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.items.map((item: { title: string }) => item.title)).toEqual([
      "SEMAR más reciente",
      "SEMAR más antigua",
      "Noticia más reciente",
      "Noticia más reciente",
    ]);
  });
});
