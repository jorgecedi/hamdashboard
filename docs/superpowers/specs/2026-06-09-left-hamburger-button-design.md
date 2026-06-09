# Left Hamburger Button Design

## Goal

Move the emergency-links hamburger button to the far left of the dashboard top bar.

## Layout

The top bar will render elements in this order:

1. Emergency-links hamburger button.
2. Local time.
3. Centered call sign.
4. UTC time on the right.

The button will move in the component markup so visual order, DOM order, and keyboard navigation order remain consistent. CSS-only reordering will not be used.

## Behavior

The existing button behavior and accessibility attributes remain unchanged:

- It opens and closes the emergency-links sidebar.
- It retains its accessible open/close label.
- It retains `aria-controls` and `aria-expanded`.
- Its existing reference remains available for outside-click handling.

## Testing

The top-bar component test will verify that the hamburger button appears before the local-time element in DOM order. Existing interaction and accessibility tests must continue to pass.

## Success Criteria

- The hamburger button is the far-left top-bar control.
- Local time follows the button.
- The call sign remains centered.
- UTC time remains on the right.
- Sidebar behavior and keyboard order remain correct.
