# Emergency Weather Dashboard Modernization Design

## Purpose

Build a modern replacement for the current static Hamdash-based site at `jorgecedi.com`. The new version should remain easy to copy and deploy, while giving Jorge a more reliable emergency/weather dashboard for Puerto Vallarta during Eastern Pacific hurricane season.

The dashboard is for public, read-only monitoring. It should prominently display urgent information, but it should not use sounds, flashing alert effects, or browser notifications.

## Current Context

The existing repository is a small static site with `index.html`, `hamdash.html`, `config.js`, and `wheelzoom.js`. Configuration is handled through JavaScript arrays for menu entries, dashboard tiles, image/video/iframe sources, and rotation intervals.

The current production-style configuration already includes Puerto Vallarta and radio-relevant sources such as GOES Mexico imagery, webcams, NOAA D-RAP, live news video, lightning, seismic activity, grey line, tropical activity, and HF propagation.

The new version should preserve the operational dashboard spirit while replacing the single-file JavaScript structure with clearer modern components and configuration.

## Recommended Architecture

Use a static-first frontend plus an optional Cloudflare Worker feed service.

The frontend will be a Vite, React, and TypeScript app that builds to static files and deploys to Cloudflare Pages at `jorgecedi.com`. It must remain usable without a backend so other people can clone and deploy a simpler version quickly.

The Cloudflare Worker will be included for deployments that need reliable feed handling. Jorge's production deployment will use it. The Worker will fetch configured public RSS, Atom, JSON, and supported social/topic sources, cache them briefly, normalize them into a common feed shape, and expose clean dashboard endpoints.

Expected Worker endpoints:

- `/api/feeds` returns normalized items across enabled sources.
- `/api/feeds/:id` returns normalized items and source status for one configured feed.
- `/api/health` returns service health and cache metadata useful for debugging.

## Dashboard Experience

The first screen is the operational dashboard, not a landing page.

For large TV mode, use a dense dashboard layout that keeps critical information visible at a glance. It should support tiles for:

- Tropical activity and NHC Eastern Pacific outlook
- Satellite, radar, and lightning imagery
- Puerto Vallarta and Bay of Banderas webcams
- Live news or public video embeds
- Seismic activity
- HF propagation and radio-relevant data
- A prominent emergency/news feed column or band

For phone and tablet mode, the same information becomes grouped sections:

- Urgent
- Weather
- Local
- Radio
- News

Urgent feed items must stay near the top on smaller screens. Users should be able to tap or click a tile to expand it, rotate through multi-source tiles, open the original source, and adjust common settings.

## Feed Model

The feed system will support official emergency/weather sources and public news/social monitoring.

Default feed groups should include:

- Official hurricane/weather sources, especially NHC Eastern Pacific RSS and Spanish NHC feeds.
- Mexico-focused official sources such as SMN/CONAGUA and SEMAR when a stable machine-readable source or reliable link is available.
- Local emergency/public agency sources for Puerto Vallarta and Jalisco where public feeds or pages are available.
- Local and regional news RSS, Atom, or JSON feeds.
- Public social/topic monitoring through provider adapters in the Worker.

Normalized feed items will use this shape:

```ts
type FeedItem = {
  id: string;
  sourceId: string;
  sourceName: string;
  title: string;
  summary?: string;
  url: string;
  publishedAt?: string;
  fetchedAt: string;
  category: "weather" | "emergency" | "local" | "radio" | "news" | "social";
  urgency: "normal" | "watch" | "urgent";
  tags: string[];
  location?: string;
};
```

Urgency will start with simple transparent scoring: source priority plus keyword matching. Initial Spanish and English keywords should include terms such as `huracan`, `huracán`, `tormenta tropical`, `Puerto Vallarta`, `Jalisco`, `evacuacion`, `evacuación`, `inundacion`, `inundación`, `marejada`, `hurricane`, `tropical storm`, `flood`, `surge`, and `evacuation`.

## Social Monitoring

Social monitoring is public and read-only only.

The design should support provider adapters so the app is not hardcoded to one platform. X/Twitter-style topic or hashtag monitoring should be treated as optional because platform access and API rules can change. If provider credentials or access are unavailable, that source is disabled with a clear status message while RSS, official feeds, and other sources continue working.

## Configuration

Configuration has two layers:

1. Repository defaults for deploy-time configuration.
2. Browser-local overrides from a dashboard settings screen.

Repository defaults should cover:

- Site identity, callsign, title, and branding text
- Location, timezone, and preferred language
- Tile definitions, source URLs, and refresh intervals
- Feed sources, categories, source priority, and keyword rules
- Optional Worker endpoint URL
- Feature flags, including whether social monitoring is enabled

Browser-local settings should let a user override common values per device:

- Feed URLs and enabled state
- Urgency keywords
- Tile visibility and order
- Refresh frequency
- Display mode preferences

Overrides are stored in local browser storage and can be reset to repository defaults.

## Reliability And Error Handling

The dashboard should assume external sources will fail.

Each tile and feed source will track loading, success, stale, and error states. If an image tile fails, the UI should keep showing the last successful image when available and display the last updated time. If one feed source fails, the Worker should still return items from other sources and include source-level error metadata.

The frontend should avoid full-page reloads. Tiles and feeds refresh independently. Default refresh intervals should start around 2-5 minutes for emergency/news feeds, with longer intervals for slower-changing satellite imagery and radio data.

The Worker should use short caching to reduce source load and improve dashboard responsiveness.

## Copyability And Documentation

The project should remain friendly for other users to copy.

The README should document two setup paths:

- Static only: clone the app, edit config, deploy static files.
- Static plus Cloudflare Worker: deploy the static app and Worker for normalized feeds, CORS handling, caching, and optional social/topic adapters.

The old static dashboard can remain in the repository as a legacy reference during the transition, but the new app will become the replacement for `jorgecedi.com`.

## Testing

Testing should focus on emergency-relevant behavior:

- Feed normalization for sample RSS, Atom, and JSON inputs
- Keyword urgency scoring
- Worker partial failure behavior when one source is unavailable
- Tile refresh, stale display, and error display
- Settings overrides and reset behavior
- Responsive layouts for TV, tablet, and phone

## Rollout

Build the new app alongside the current static site. Verify it locally and with a Cloudflare Pages preview deployment first. Once the dashboard is stable, switch `jorgecedi.com` to the new Cloudflare Pages deployment.

The current dashboard should remain available in the repo until the new version has been tested through normal daily use.
