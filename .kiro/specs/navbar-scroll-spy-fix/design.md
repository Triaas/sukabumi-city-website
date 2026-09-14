# Navbar Scroll-Spy Fix Bugfix Design

## Overview

The Navbar scroll-spy in `app/page.tsx` uses a fixed `scrollY + 250` threshold to determine which section is active. Because the Welcome section has no `id` and sits between `id="beranda"` and `id="profil"`, the 250px offset is too small — it causes the threshold to cross `profil`'s `offsetTop` while the Welcome section still fills the viewport, prematurely advancing the active indicator to "Pengumuman & Berita".

The fix replaces the flat `250` offset with `window.innerHeight * 0.4`, making the activation point proportional to the viewport height (~40% from the top). This pushes the threshold far enough up the screen that the full Hero + Welcome vertical span is covered before `profil` activates. The change is confined to a single line inside the `handleScroll` function in the `Navbar` component.

---

## Glossary

- **Bug_Condition (C)**: The condition under which the scroll-spy activates the wrong nav item — specifically when `scrollY + 250 >= profil.offsetTop` while the user is still inside the Welcome section's vertical span.
- **Property (P)**: The desired behavior when the bug condition holds — "Beranda" must remain active throughout the entire Hero + Welcome span.
- **Preservation**: All scroll behavior for sections other than the Welcome span, all click navigation, the indicator resize logic, and the Kebijakan Privasi link must remain unchanged.
- **`handleScroll`**: The scroll event handler defined inside the `Navbar` component's `useEffect` in `app/page.tsx`. It calculates `scrollPosition` and walks `navItems` from last to first to set `activeSection`.
- **`scrollPosition`**: The computed activation threshold — currently `window.scrollY + 250`, to be changed to `window.scrollY + window.innerHeight * 0.4`.
- **Welcome section**: An unnamed section (no `id`) that appears between `id="beranda"` and `id="profil"` in the DOM. It is not tracked in `navItems`.
- **`navItems`**: The array of five tracked sections: `beranda`, `profil`, `berita`, `opd`, `transparansi`.

---

## Bug Details

### Bug Condition

The bug manifests when the user scrolls through the Welcome section. Because Welcome has no `id`, the scroll-spy has no entry for it in `navItems`. When `scrollY + 250` crosses `profil.offsetTop`, the loop finds `profil` as the first matching section from the end and sets it active. But this happens while the viewport still shows Welcome, not Profil — meaning the active indicator jumps one (or more) items too early.

**Formal Specification:**

```
FUNCTION isBugCondition(X)
  INPUT: X of type ScrollState {
    scrollY: number,
    profileOffsetTop: number,
    welcomeBottomY: number
  }
  OUTPUT: boolean

  // Bug fires when scroll is inside Welcome's vertical span but the flat 250px
  // offset has already crossed profil's offsetTop, causing premature activation.
  RETURN (X.scrollY < X.welcomeBottomY)
     AND (X.scrollY + 250 >= X.profileOffsetTop)
END FUNCTION
```

### Examples

- **Bug example**: Hero section ends at ~800px; Welcome section spans ~800–1600px; `profil.offsetTop` is ~1600px. At `scrollY = 1400`, `scrollPosition = 1650 >= 1600` so "Profil" (and then "Pengumuman & Berita" if berita's offset is nearby) activates — but the user sees Welcome, not Profil. Expected: "Beranda" stays active.
- **Bug example**: At `scrollY = 1350` with a 900px-tall viewport, `innerHeight * 0.4 = 360`. Fixed `scrollPosition = 1710 < 1600`? No — 1350 + 360 = 1710 > 1600, so profil activates. But with a larger Welcome (e.g., offset at 1800), 1350 + 360 = 1710 < 1800 → "Beranda" stays active. The proportional threshold adapts to actual layout height.
- **Normal case (no bug)**: At `scrollY = 1900`, profil is clearly on screen. `scrollPosition = 1900 + 360 = 2260 >= 1800` → "Profil" activates correctly.
- **Edge case**: Page load at `scrollY = 0`. Loop finds `beranda.offsetTop = 0`, `scrollPosition = 0 + 360 = 360 >= 0` → "Beranda" is active. Correct.

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Mouse clicks on nav items must continue to scroll smoothly to the target section and immediately set that item as active via `setActiveSection(item.id)`.
- The yellow underline indicator's position and width must continue to update on `resize` events via the separate `updateIndicator` `useEffect`.
- On page load (scroll = 0), "Beranda" must remain the default active item.
- Each of `profil`, `berita`, `opd`, and `transparansi` must continue to activate when the user scrolls them substantially into view.
- "Kebijakan Privasi" must continue to function as a plain external link with no active-state tracking.
- The `navItems` array, the click handler, and the indicator `useEffect` must remain structurally unchanged.

**Scope:**
All inputs where `isBugCondition` returns `false` (i.e., the user is not inside the Welcome span with a premature profil crossing) must produce identical `activeSection` values before and after the fix. The only observable difference is that "Beranda" stays active for a larger scroll range during the Welcome span.

---

## Hypothesized Root Cause

1. **Fixed pixel offset too small for tall sections**: `250px` was chosen as a generic "scroll ahead" buffer, but the Welcome section is substantially taller than 250px. Any fixed offset smaller than `profil.offsetTop - welcomeTop` will misfire here. A viewport-relative offset (`innerHeight * 0.4`) automatically scales with screen size and section height.

2. **No gap entry for the Welcome section**: The `navItems` array has no entry for the Welcome section. When the loop walks from last to first, it finds `profil` as the first match once `scrollPosition >= profil.offsetTop`, with no intervening entry to "hold" Beranda. The fix doesn't need a new entry — it just needs the threshold to not cross `profil.offsetTop` until the user is genuinely past Welcome.

3. **No viewport-height awareness**: The original code uses an absolute pixel constant rather than a fraction of `window.innerHeight`. On tall viewports (e.g., 1080px+), sections can be taller than 250px, making early activation more likely. Using `innerHeight * 0.4` makes the behavior consistent across viewport sizes.

---

## Correctness Properties

Property 1: Bug Condition - Beranda Stays Active Through Welcome Span

_For any_ scroll state where `isBugCondition` returns true (the user is inside the Welcome section's vertical span and `scrollY + 250` has crossed `profil.offsetTop`), the fixed `handleScroll` function SHALL set `activeSection` to `'beranda'`, not to `'profil'` or any later section.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Correct Section Activation Outside Welcome Span

_For any_ scroll state where `isBugCondition` returns false (the user is not in the premature-activation zone), the fixed `handleScroll` function SHALL produce the same `activeSection` result as the original `handleScroll` function, preserving all existing section-activation behavior for `profil`, `berita`, `opd`, `transparansi`, and the initial `beranda` state.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

---

## Fix Implementation

### Changes Required

**File**: `app/page.tsx`

**Function**: `handleScroll` (inside the second `useEffect` of the `Navbar` component)

**Specific Changes**:

1. **Replace fixed offset with viewport-relative offset**: Change the single line:
   ```ts
   // Before
   const scrollPosition = window.scrollY + 250
   
   // After
   const scrollPosition = window.scrollY + window.innerHeight * 0.4
   ```
   No other lines in `handleScroll` need to change. The loop logic, the `navItems` iteration order, and the `setActiveSection` call are all correct.

2. **No changes to click navigation**: The click handler already calls `setActiveSection(item.id)` immediately and then `window.scrollTo` — this is correct behavior and must not be touched.

3. **No changes to `navItems`**: The array remains `['beranda', 'profil', 'berita', 'opd', 'transparansi']`. Welcome intentionally has no entry.

4. **No changes to the indicator `useEffect`**: The `updateIndicator` logic that responds to `activeSection` and `resize` is unrelated to the bug.

5. **No changes to Kebijakan Privasi**: It is already outside `navItems` and already rendered as a plain link.

---

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate scroll events with `scrollY` values inside the Welcome span and assert that `activeSection` remains `'beranda'`. Run these tests on the UNFIXED code (with `scrollY + 250`) to observe failures and confirm the root cause.

**Test Cases**:
1. **Welcome Span Mid-Point Test**: Set `scrollY` to `profil.offsetTop - 200` (inside Welcome, within 200px of profil boundary). On unfixed code, `scrollPosition = scrollY + 250 >= profil.offsetTop` → activeSection wrongly advances. (will fail on unfixed code)
2. **Welcome Span Near-Top Test**: Set `scrollY` to `profil.offsetTop - 100`. On unfixed code, `scrollPosition = scrollY + 250 > profil.offsetTop` → premature activation. (will fail on unfixed code)
3. **Tall Viewport Test**: On a 1080px viewport, `innerHeight * 0.4 = 432`. Set `scrollY` to a value where `scrollY + 250 >= profil.offsetTop` but `scrollY + 432 < profil.offsetTop`. Confirms the fixed threshold holds. (will fail on unfixed code, pass on fixed code)
4. **Boundary Edge Case**: Set `scrollY` exactly to `profil.offsetTop - 251`. On unfixed code, `scrollPosition = profil.offsetTop - 1` → beranda stays. This case passes even on unfixed code — confirms the bug only fires within 250px of profil's boundary.

**Expected Counterexamples**:
- `activeSection` is set to `'profil'` or `'berita'` when scroll is inside the Welcome span.
- Possible causes: flat 250px offset is smaller than the remaining Welcome span height, no `navItems` entry for Welcome to act as a guard.

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL X WHERE isBugCondition(X) DO
  result := handleScroll_fixed(X)
  ASSERT result.activeSection = 'beranda'
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT handleScroll_original(X).activeSection = handleScroll_fixed(X).activeSection
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many scroll positions automatically across the full page height.
- It catches edge cases (viewport boundaries, section boundaries, page load) that manual tests might miss.
- It provides strong guarantees that no existing activation behavior is broken.

**Test Plan**: Observe that the five tracked sections activate correctly on the unfixed code when scroll is clearly inside them, then write property-based tests that assert the same result from both the original and fixed handler.

**Test Cases**:
1. **Profil Activation Preservation**: For `scrollY` values clearly inside `id="profil"` (well past its `offsetTop`), both handlers must set `activeSection = 'profil'`.
2. **Berita Activation Preservation**: For `scrollY` values clearly inside `id="berita"`, both handlers must set `activeSection = 'berita'`.
3. **OPD Activation Preservation**: For `scrollY` values clearly inside `id="opd"`, both handlers must set `activeSection = 'opd'`.
4. **Transparansi Activation Preservation**: For `scrollY` values clearly inside `id="transparansi"`, both handlers must set `activeSection = 'transparansi'`.

### Unit Tests

- Test that `scrollY = 0` (page load) sets `activeSection = 'beranda'` with the fixed handler.
- Test that `scrollY` inside the Welcome span (before `profil.offsetTop - innerHeight * 0.4`) keeps `activeSection = 'beranda'`.
- Test that `scrollY` clearly inside `profil` activates `'profil'` after the fix.
- Test that `scrollY` past the last section (`transparansi`) keeps `'transparansi'` as active.
- Test edge case: no section elements in DOM — handler must not throw.

### Property-Based Tests

- Generate random `scrollY` values in `[0, totalPageHeight]` and verify the fixed handler never activates a section whose `offsetTop` is above the current `scrollPosition` threshold.
- Generate random viewport heights and verify the proportional threshold (`innerHeight * 0.4`) always defers `profil` activation until the user is past the Welcome span.
- For all `scrollY` where `isBugCondition` is false, assert both handlers return the same `activeSection`.

### Integration Tests

- Scroll from page top to bottom in a browser environment and verify each nav item activates exactly when the corresponding section occupies the upper ~40% of the viewport.
- Verify clicking "Profil" immediately sets "Profil" as active and scrolls correctly regardless of current scroll position.
- Verify the yellow indicator's position and width update correctly as `activeSection` changes via scroll.
- Verify "Kebijakan Privasi" never receives the active class during any scroll position.
