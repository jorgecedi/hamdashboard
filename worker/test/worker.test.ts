import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "../src/index";

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
    expect(await response.json()).toMatchObject({ ok: true, cacheSeconds: 90, sourceCount: 2 });
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

    const response = await worker.fetch(new Request("https://feeds.example.test/api/feeds/nhc-epac-en"), {
      CACHE_SECONDS: "45",
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("public, max-age=45");
    expect(payload.statuses).toEqual([
      expect.objectContaining({ sourceId: "nhc-epac-en", ok: true, itemCount: 1 }),
    ]);
    expect(payload.items).toEqual([
      expect.objectContaining({
        id: "nhc-epac-en:https://example.com/hurricane",
        sourceId: "nhc-epac-en",
        sourceName: "NHC Eastern Pacific",
        category: "weather",
        urgency: "urgent",
        tags: ["official", "hurricane", "pacific"],
      }),
    ]);
  });

  it("returns source failure metadata without failing the whole response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("Nope", { status: 503 })));

    const response = await worker.fetch(new Request("https://feeds.example.test/api/feeds/nhc-epac-en"), {});
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.items).toEqual([]);
    expect(payload.statuses).toEqual([
      expect.objectContaining({ sourceId: "nhc-epac-en", ok: false, itemCount: 0, error: "HTTP 503" }),
    ]);
  });
});
