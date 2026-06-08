# SEMAR Alert Filtering and Fullscreen Rotation Design

## Goal

Show only recent, potentially coast-affecting SEMAR tsunami bulletins, keep them above all other feed items, and pause automatic tile rotation while a tile is fullscreen.

## Scope

This change covers:

- Worker-side parsing, filtering, normalization, urgency, and sorting for `semar-tsunami-alerts`.
- Defensive frontend sorting and emergency-banner freshness.
- Tile automatic rotation while expanded.
- Focused worker and frontend tests.

It does not add a general hazard-classification system or change filtering for other feed sources.

## SEMAR Worker Processing

The worker will filter SEMAR entries before normalizing or returning them. This makes the same result apply to both the emergency banner and the feed.

Each SEMAR entry must have a valid RSS `pubDate`. The existing `publishedAt` field will continue to carry this value. An entry is discarded when its date is missing, invalid, in the future, or more than 24 hours older than the worker fetch time. `dc:date` is not required because `pubDate` is already supported by the parser.

Feed text will be converted to plain text by decoding entities, removing HTML markup, and collapsing whitespace. The title and description returned to the frontend must not contain HTML.

The impact heuristic will be conservative. It will normalize case and accents, then discard an entry only when the bulletin clearly says there will be no sea-level effect. Known negative forms include:

- No sea-level variations are expected.
- Tsunami generation is not expected with no stated variation or current impact.
- Tsunami arrival is ruled out.
- The absence of meaningful sea-level variations is confirmed.

An entry must remain visible when it reports or allows any possible coastal effect, including small sea-level variations, waves, currents, port-entry currents, tsunami generation, warnings, precautions, or evacuation. If wording is ambiguous or does not match a known explicit no-impact form, the worker keeps the entry.

Every retained SEMAR item will be normalized as `urgent`.

## Ordering and Banner

The worker will place every retained SEMAR item before items from all other sources. Multiple SEMAR items will be sorted newest first. Other items will retain date-based ordering.

The frontend feed will apply the same source-first rule defensively:

1. SEMAR items, newest first.
2. Other urgent items.
3. Other watch items.
4. Other normal items.

The emergency banner already prefers SEMAR over other official alerts. Its freshness window will be reduced from five days to 24 hours so stale or cached SEMAR data cannot appear in the banner.

## Fullscreen Tile Rotation

When a tile is expanded, its automatic rotation or image-refresh timer will be paused. The timer will resume when the tile exits fullscreen.

The manual **Next source** button remains enabled while fullscreen. Manual changes will continue to advance the source and update the cache-busting value for images.

## Failure Handling

Existing source-status reporting remains unchanged for network and parsing failures.

SEMAR entries rejected by the date or impact filters are normal filtered results, not source errors. The source status will remain successful and its item count will reflect only retained entries.

## Testing

Worker tests will cover:

- HTML and entity cleanup to plain text.
- Missing and invalid `pubDate`.
- Future timestamps.
- Entries exactly within and beyond the 24-hour boundary.
- Explicit statements of no sea-level impact being discarded.
- Possible minor variations or coastal currents being retained.
- Ambiguous wording being retained.
- Retained SEMAR entries receiving urgent priority.
- SEMAR-first, newest-first ordering.

Frontend tests will cover:

- SEMAR-first ordering independent of ordinary urgency ordering.
- Newest-first ordering among SEMAR items.
- The emergency banner's 24-hour cutoff.
- Automatic rotation pausing while fullscreen.
- Manual source changes continuing to work while fullscreen.
- Automatic rotation resuming after fullscreen exits.

## Success Criteria

- No SEMAR item without a valid `pubDate` reaches the frontend.
- No SEMAR item older than 24 hours or dated in the future reaches the frontend.
- Explicit no-impact bulletins are hidden.
- Any bulletin allowing possible sea-level variation or coastal current impact remains visible as urgent.
- Retained SEMAR items always appear at the top of the feed.
- SEMAR HTML is never rendered in the feed or emergency banner.
- Expanded tiles remain on the selected source until manually changed or fullscreen is exited.
