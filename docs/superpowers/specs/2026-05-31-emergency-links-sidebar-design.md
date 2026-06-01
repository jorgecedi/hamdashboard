# Emergency Links Sidebar Design

## Summary

Add a toggleable emergency resources menu to the dashboard top bar. The top-bar control opens a left slide-out sidebar with curated emergency, hazard-monitoring, weather, local official, and preparedness-library links. All links open in a new browser tab.

## Goals

- Provide quick access to emergency resources without taking permanent space from the dashboard tiles.
- Keep live monitoring links and official local resources easy to find during an active event.
- Include practical preparedness references, including the user's `jorgecedi/Survival-Data` repository.
- Keep the link list maintainable through configuration rather than hard-coded component markup.

## Non-Goals

- Embed the linked external sites inside dashboard tiles.
- Fetch or validate external resource availability at runtime.
- Add user-editable link management in the browser UI.
- Replace the existing RSS feed panel or tile layout.

## User Experience

The top bar will include an Emergency Links control near the left side. Activating the control opens a left slide-out sidebar over the dashboard. The dashboard grid and feed panel keep their existing dimensions while the sidebar is open.

The sidebar can be closed by:

- Activating the top-bar control again.
- Activating a close control inside the sidebar.
- Pressing `Escape`.
- Clicking outside the sidebar.

Each resource link opens in a new tab using `target="_blank"` and `rel="noreferrer"`.

On narrow screens, the sidebar uses most of the viewport width while leaving a small visible edge of the dashboard. This preserves the same show/hide model without creating a separate mobile menu pattern.

## Resource Groups

### Live Situation

- IRIS Seismic Monitor: `https://www.iris.edu/app/seismic-monitor/map?lat=21.1159&lng=-106.4146&zoom=6`
- NASA FIRMS Fire Map: `https://firms.modaps.eosdis.nasa.gov/map/#d:24hrs;@-104.0,21.4,7.1z`
- Servicio Sismológico Nacional México: `https://www.ssn.unam.mx/`
- USGS Latest Earthquakes: `https://earthquake.usgs.gov/earthquakes/map/`
- SEMAR Centro de Alerta de Tsunamis: `https://diredimoat.semar.gob.mx/cat/centroAlertasTsunamis.html`
- CENAPRED Atlas Nacional de Riesgos: `https://www.atlasnacionalderiesgos.gob.mx/`

### Weather + Storms

- SMN / CONAGUA: `https://smn.conagua.gob.mx/`
- National Hurricane Center Eastern Pacific: `https://www.nhc.noaa.gov/?epac`
- Windy Puerto Vallarta: `https://www.windy.com/?20.653,-105.225,7`

### Local Official

- Proteccion Civil Jalisco: `https://proteccioncivil.jalisco.gob.mx/`
- Bomberos / Proteccion Civil Puerto Vallarta: `https://bomberos.puertovallarta.gob.mx/`
- Coordinacion Nacional de Proteccion Civil: `https://cnpcinforma.sspc.gob.mx/Proteccioncivil.html`
- Cruz Roja Mexicana: `https://www.cruzrojamexicana.org.mx/`

### Preparedness Library

- Ready.gov: `https://www.ready.gov/`
- American Red Cross Preparedness: `https://www.redcross.org/get-help/how-to-prepare-for-emergencies.html`
- Vivarca Offline Survival Library: `https://vivarca.org/`
- jorgecedi/Survival-Data: `https://github.com/jorgecedi/Survival-Data`
- awesome-disastertech: `https://github.com/DisasterTechCrew/awesome-disastertech`
- awesome-survival: `https://github.com/alx-xlx/awesome-survival`

Community-maintained repositories and libraries should be labeled as community resources. Official government, scientific, and relief-organization links should appear first in each relevant section.

## Architecture

Extend the dashboard configuration model with an `emergencyLinks` array. Each group contains:

- `id`: stable group identifier.
- `title`: visible group heading.
- `links`: list of link objects.

Each link contains:

- `id`: stable link identifier.
- `label`: visible link text.
- `url`: external URL.
- `description`: short explanation shown below the label.
- `kind`: optional category marker such as `official`, `map`, `preparedness`, or `community`.

Add a new `EmergencyLinksSidebar` component responsible for rendering the grouped links and close controls. Keep toggle state in `Dashboard`, because the sidebar and top-bar control both need access to it.

Update `TopBar` to accept:

- `emergencyLinksOpen`: boolean.
- `onToggleEmergencyLinks`: callback.

The top bar remains responsible only for the header layout and toggle control. The sidebar remains responsible only for the menu content and close behavior.

## Interaction Details

- The top-bar control uses `aria-expanded` and `aria-controls`.
- The sidebar uses an accessible label such as `Emergency resources`.
- Escape handling is active only while the sidebar is open.
- Outside-click handling ignores clicks inside the sidebar and the top-bar toggle.
- Links remain standard anchors so browser behavior is predictable.

## Styling

The implementation should follow the existing dark dashboard styling in `src/styles/app.css`: restrained borders, compact spacing, and the existing 8px radius pattern. The sidebar should sit above the dashboard surface, expanded tiles, and settings controls while open, using a backdrop layer so outside clicks are easy to detect.

The visual hierarchy should prioritize group headings, link labels, and short descriptions. Community resources should have a small text label so users can distinguish them from official sources.

## Error Handling

The feature has no network fetch path. If a link is unavailable, the external site fails in the new tab without affecting the dashboard. The component should tolerate an empty `emergencyLinks` array by rendering no sidebar sections rather than throwing.

## Testing

Add focused component tests for:

- Top-bar toggle renders and calls the toggle callback.
- Sidebar renders all configured groups and links.
- Links include `target="_blank"` and `rel="noreferrer"`.
- Sidebar close callback runs from the close button.
- Escape closes the sidebar when open.
- Outside click closes the sidebar.

Update config tests if the config schema or default config coverage requires it.

## Acceptance Criteria

- A top-bar Emergency Links control opens and closes the sidebar.
- The sidebar includes all resource groups and links listed in this spec.
- All sidebar links open in a new tab.
- The dashboard tile grid and feed panel do not resize when the sidebar opens.
- Keyboard and outside-click close behavior work.
- Relevant tests pass.
