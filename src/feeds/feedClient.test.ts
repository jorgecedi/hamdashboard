import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchFeeds } from "./feedClient";

describe("fetchFeeds", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("fetches normalized Worker feeds", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ items: [], statuses: [] }), { status: 200 })));
    await expect(fetchFeeds("/api")).resolves.toEqual({ items: [], statuses: [] });
    expect(fetch).toHaveBeenCalledWith("/api/feeds");
  });

  it("returns an empty response when no endpoint is configured", async () => {
    await expect(fetchFeeds(undefined)).resolves.toEqual({ items: [], statuses: [] });
  });
});
