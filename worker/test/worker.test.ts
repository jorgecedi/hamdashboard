import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "../src/index";

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toUTCString();

describe("worker", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
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

  it("serves the SEMAR tsunami alerts as a dedicated feed source", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(
        `<rss><channel><item><title>Alerta de tsunami</title><link>https://example.com/tsunami</link><description>Boletin informativo</description><pubDate>${daysAgo(1)}</pubDate></item></channel></rss>`,
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
        id: "semar-tsunami-alerts:https://example.com/tsunami",
        sourceId: "semar-tsunami-alerts",
        sourceName: "SEMAR Tsunami Alerts",
        category: "emergency",
        tags: ["official", "mexico", "tsunami"],
      }),
    ]);
  });

  it("hides SEMAR tsunami alerts when the newest entry is older than five days", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(
        `<rss><channel><item><title>Alerta antigua</title><link>https://example.com/old-tsunami</link><description>Boletin antiguo</description><pubDate>${daysAgo(6)}</pubDate></item></channel></rss>`,
        { status: 200 },
      )),
    );

    const response = await worker.fetch(new Request("https://feeds.example.test/api/feeds/semar-tsunami-alerts"), {});
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.statuses).toEqual([
      expect.objectContaining({ sourceId: "semar-tsunami-alerts", ok: true, itemCount: 0 }),
    ]);
    expect(payload.items).toEqual([]);
  });

  it("sorts fresh SEMAR tsunami alerts before other feed items", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL | Request) => {
        const requestedUrl = String(url);
        if (requestedUrl.includes("rss_feed.xml")) {
          return new Response(
            `<rss><channel><item><title>Alerta SEMAR vigente</title><link>https://example.com/current-tsunami</link><description>Boletin vigente</description><pubDate>${daysAgo(1)}</pubDate></item></channel></rss>`,
            { status: 200 },
          );
        }

        return new Response(
          `<rss><channel><item><title>Noticia mas reciente</title><link>https://example.com/newer-weather</link><description>Actualizacion general</description><pubDate>${daysAgo(0.5)}</pubDate></item></channel></rss>`,
          { status: 200 },
        );
      }),
    );

    const response = await worker.fetch(new Request("https://feeds.example.test/api/feeds"), {});
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.items[0]).toEqual(
      expect.objectContaining({
        sourceId: "semar-tsunami-alerts",
        title: "Alerta SEMAR vigente",
      }),
    );
  });
});
