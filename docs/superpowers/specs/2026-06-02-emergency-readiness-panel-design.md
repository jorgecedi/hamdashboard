# Emergency Readiness Panel Design

## Goal

Add a compact emergency readiness layer to the dashboard for Puerto Vallarta and Bahia de Banderas. The feature should make current official-source health, recent emergency signals, offline preparedness, and official contacts visible without turning the dashboard into a separate emergency manual.

## Recommended Approach

Use a dashboard-first layout with the existing emergency sidebar as the reference area.

The main dashboard should show time-sensitive signals:
- stale feed indicators
- official source status
- emergency mode banner when recent official emergency content exists

The sidebar should show reference material:
- offline emergency checklist
- official critical contacts
- radio frequency references
- existing external emergency links

This keeps active monitoring visible while leaving longer emergency resources one click away.

## Components

### Emergency Mode Banner

Add a banner below the top bar when a recent official emergency item is present. The banner should use official feed items only, with special priority for SEMAR tsunami alerts and other high-priority emergency sources. It should show the source name, item title, and published age. It should link to the source item in a new tab when a link is available.

The banner should stay hidden when there is no recent official emergency item. A recent item means published no more than 5 days ago, matching the SEMAR visibility rule already used by the feed service.

### Official Source Status Panel

Add a compact panel near the feed area that lists configured official feed sources. For each source, show:
- source name
- fresh, stale, or error state
- last checked time
- item count

Freshness should be based on the feed service status timestamp. A source is stale when it has not checked in recently enough for its role. The first implementation should use conservative default thresholds:
- emergency feeds: stale after 2 hours
- weather feeds: stale after 6 hours
- local/news feeds: stale after 24 hours

Errors from the feed service should override stale/fresh display.

### Stale Indicators

Show stale status in the source status panel and add a small freshness line to the feed panel summary. The wording should avoid implying danger:

`Source may not be current`

This is clearer than using only red/error styling.

### Offline Emergency Checklist

Add a static checklist in the emergency sidebar. It should be useful when internet or power is unreliable and should not require storage or account state. Items:
- Water and non-perishable food
- Flashlight and batteries
- Charged power banks
- Medications and first-aid kit
- Important documents
- Cash and keys
- Battery or hand-crank radio
- Family contact plan
- Evacuation bag
- Pet supplies

The checklist should be visual, scannable, and not saved as persistent completion state in the first version.

### Critical Contacts Panel

Add an official contacts section to the emergency sidebar. Default contacts:
- Emergencias Mexico: 911
- Denuncia anonima: 089
- Puerto Vallarta Policia / Ambulancia: 911
- Puerto Vallarta Policia y Transito 24/7: 911 / 322 178 8999
- Puerto Vallarta Proteccion Civil y Bomberos: 322 178 8000 / 322 226 8080 ext. 3201
- Bahia de Banderas Emergencias: 911
- Bahia de Banderas Seguridad Publica: 329 291 1896
- Bahia de Banderas Proteccion Civil: 329 291 1818
- CFE fallas electricas: 071
- Angeles Verdes carretera/turismo: 078
- CAPUFE carreteras: 074

Use official numbers only. Do not include unofficial community numbers as defaults.

### Radio Reference Section

Add a separate radio reference section to avoid mixing public phone contacts with licensed or specialized radio use:
- Marine VHF Ch 16: 156.800 MHz
- Marine DSC Ch 70: 156.525 MHz
- Aviation guard: 121.500 MHz
- Ham 2m simplex calling: 146.520 MHz FM, licensed operators only
- Ham 70cm simplex calling: 446.000 MHz FM, verify local band plan/repeater coordination

Do not ship local repeater frequencies by default unless they are provided or verified later.

## Data Model

Extend dashboard configuration with:
- `emergencyChecklist`
- `criticalContacts`
- `radioReferences`

Keep the source status derived from the existing feed response instead of adding another network request.

The official source list should be inferred from configured feeds with official tags where possible. If a feed lacks an official tag but is known official, the default config should include the tag.

## Error Handling

If the feed service is unavailable, the source status panel should show the overall feed error and keep the sidebar contacts/checklist available.

If timestamps are missing, show `Unknown` rather than treating the source as fresh.

If there are no official source statuses, hide the official source status panel rather than showing an empty block.

## Testing

Add focused tests for:
- default config includes checklist, contacts, and radio references
- emergency banner appears for a recent official emergency item
- emergency banner stays hidden for stale or non-official items
- source status panel marks fresh, stale, unknown, and error states correctly
- sidebar renders checklist, contacts, and radio references

Run the full app check after implementation.

## Scope Boundaries

This version does not add:
- persistent checklist completion
- SMS/phone dialing integrations
- local repeater defaults
- new backend status requests
- a separate emergency page

Those can be added later if the dashboard needs deeper emergency operations support.
