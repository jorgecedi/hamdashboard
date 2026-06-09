# Left Hamburger Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the emergency-links hamburger button to the far left of the top bar while preserving the centered call sign and right-aligned UTC time.

**Architecture:** Group the existing hamburger button and local-time label in a new left-side flex container occupying the first grid column. Move the existing button in the DOM rather than using CSS ordering so visual, keyboard, and accessibility order match.

**Tech Stack:** React 19, TypeScript, CSS Grid/Flexbox, Vitest, Testing Library

---

## File Structure

- Modify `src/components/TopBar.tsx`: render the hamburger button before local time inside a left-side wrapper.
- Modify `src/styles/app.css`: style the new wrapper without changing the existing three-column top-bar grid.
- Modify `src/components/TopBar.test.tsx`: verify the hamburger button precedes local time in DOM order and existing behavior remains intact.

### Task 1: Move the Hamburger Button to the Left

**Files:**
- Modify: `src/components/TopBar.tsx:34-54`
- Modify: `src/styles/app.css:201-218`
- Test: `src/components/TopBar.test.tsx:10-37`

- [ ] **Step 1: Add the failing DOM-order test**

Add a test that renders the top bar, finds the hamburger button and local-time label, and asserts the button precedes the label:

```tsx
it("renders the emergency links button before local time", () => {
  vi.setSystemTime(new Date("2026-06-03T12:00:00Z"));

  const { container } = render(
    <TopBar
      config={defaultConfig}
      emergencyLinksOpen={false}
      onToggleEmergencyLinks={vi.fn()}
    />,
  );

  const leftSection = container.querySelector(".top-bar-left");
  const button = screen.getByRole("button", { name: /open emergency links/i });
  const localTime = container.querySelector(".top-bar-time");

  expect(leftSection).toContainElement(button);
  expect(leftSection).toContainElement(localTime);
  expect(button.compareDocumentPosition(localTime as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run:

```bash
npm test -- src/components/TopBar.test.tsx
```

Expected: FAIL because `.top-bar-left` does not exist and the button currently renders after UTC time.

- [ ] **Step 3: Move the existing button into a left-side wrapper**

Update the top-bar markup so the first grid child contains the button followed by local time:

```tsx
<header className="top-bar">
  <div className="top-bar-left">
    <button
      ref={emergencyLinksToggleRef}
      type="button"
      className="emergency-links-toggle"
      aria-label={emergencyLinksOpen ? "Close emergency links" : "Open emergency links"}
      aria-controls="emergency-links-sidebar"
      aria-expanded={emergencyLinksOpen}
      onClick={onToggleEmergencyLinks}
    >
      <Menu aria-hidden="true" size={18} />
    </button>
    <span className="top-bar-time">{localTime}</span>
  </div>
  <strong>{config.site.callSign}</strong>
  <div className="top-bar-actions">
    <span>{utcTime}</span>
  </div>
</header>
```

This reuses the existing button unchanged and removes it from `.top-bar-actions`.

- [ ] **Step 4: Style the left-side wrapper**

Add beside `.top-bar-actions`:

```css
.top-bar-left {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
}
```

Do not change `.top-bar`'s `grid-template-columns: 1fr auto 1fr`; the call sign remains centered because the left and right columns keep equal width.

- [ ] **Step 5: Run focused tests**

Run:

```bash
npm test -- src/components/TopBar.test.tsx
```

Expected: all top-bar tests PASS, including callback, accessibility state, clock update, and DOM order.

- [ ] **Step 6: Run full verification**

Run:

```bash
npm test
npm run build
git diff --check
```

Expected: all tests pass, the production build succeeds, and no whitespace errors are reported.

- [ ] **Step 7: Commit**

```bash
git add src/components/TopBar.tsx src/components/TopBar.test.tsx src/styles/app.css
git commit -m "Move hamburger button to top bar left"
```
