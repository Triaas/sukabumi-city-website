# Implementation Plan

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Beranda Stays Active Through Welcome Span
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to the concrete failing zone — `scrollY` values where `scrollY + 250 >= profil.offsetTop` but the user is still inside the Welcome span (i.e., `scrollY < welcomeBottomY`)
  - Extract the `handleScroll` activation logic from `app/page.tsx` into a pure helper function (or replicate it in test setup) so it can be tested without a browser
  - Mock DOM elements: `beranda.offsetTop = 0`, `profil.offsetTop = 1600`, `welcomeBottomY ≈ 1600` (Welcome ends where Profil begins). Use `window.innerHeight = 900` for tests
  - Write a property-based test: for all `scrollY` in the range `[profil.offsetTop - 250, welcomeBottomY)` (the bug-trigger zone), the handler with `scrollY + 250` sets `activeSection` to something other than `'beranda'` — this is the bug manifesting
  - Equivalently stated as a fix-checking property: for all `scrollY` where `isBugCondition` is true, the FIXED handler must return `activeSection = 'beranda'`
  - Run the test against the **UNFIXED** code (with `scrollY + 250`)
  - **EXPECTED OUTCOME**: Test FAILS — confirms the bug exists. Document the counterexample (e.g., `scrollY = 1400` → `activeSection = 'profil'`, expected `'beranda'`)
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Correct Section Activation Outside Welcome Span
  - **IMPORTANT**: Follow observation-first methodology — run the unfixed code first and record actual outputs for non-buggy inputs
  - Observe: `scrollY = 0` → `activeSection = 'beranda'` (page load default)
  - Observe: `scrollY` clearly inside `id="profil"` (e.g., `scrollY = profil.offsetTop + 200`) → `activeSection = 'profil'`
  - Observe: `scrollY` clearly inside `id="berita"` → `activeSection = 'berita'`
  - Observe: `scrollY` clearly inside `id="opd"` → `activeSection = 'opd'`
  - Observe: `scrollY` clearly inside `id="transparansi"` → `activeSection = 'transparansi'`
  - Write property-based tests: for all `scrollY` where `isBugCondition(scrollY)` is false, both the original handler (`scrollY + 250`) and the fixed handler (`scrollY + innerHeight * 0.4`) must return the same `activeSection` value
  - Cover the full non-buggy input space: scroll = 0, scroll clearly past each section boundary, scroll past the last section
  - Run tests against **UNFIXED** code
  - **EXPECTED OUTCOME**: Tests PASS — confirms baseline behavior to preserve
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 3. Fix navbar scroll-spy premature activation

  - [ ] 3.1 Implement the one-line fix in `app/page.tsx`
    - Open `app/page.tsx` and locate the `handleScroll` function inside the `Navbar` component's second `useEffect`
    - Replace the single line:
      ```ts
      const scrollPosition = window.scrollY + 250
      ```
      with:
      ```ts
      const scrollPosition = window.scrollY + window.innerHeight * 0.4
      ```
    - Verify no other lines in `handleScroll` were changed — the loop logic, `navItems` iteration, and `setActiveSection` call must remain identical
    - Verify the click handler, `navItems` array, indicator `useEffect`, and Kebijakan Privasi link are untouched
    - _Bug_Condition: `isBugCondition(X)` where `X.scrollY < X.welcomeBottomY AND X.scrollY + 250 >= X.profileOffsetTop`_
    - _Expected_Behavior: For all `X` where `isBugCondition(X)` is true, `handleScroll'(X).activeSection = 'beranda'`_
    - _Preservation: For all `X` where `isBugCondition(X)` is false, `handleScroll'(X).activeSection = handleScroll(X).activeSection`_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [ ] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Beranda Stays Active Through Welcome Span
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - The test from task 1 encodes the expected behavior: for all `scrollY` where `isBugCondition` is true, `activeSection` must be `'beranda'`
    - Run the bug condition exploration test against the **FIXED** code (with `scrollY + window.innerHeight * 0.4`)
    - **EXPECTED OUTCOME**: Test PASSES — confirms the bug is fixed
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Correct Section Activation Outside Welcome Span
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run all preservation property tests from step 2 against the fixed code
    - **EXPECTED OUTCOME**: All tests PASS — confirms no regressions in `profil`, `berita`, `opd`, `transparansi`, and `beranda` (page load) activation
    - Confirm click navigation, indicator resize, and Kebijakan Privasi link are unaffected

- [ ] 4. Checkpoint — Ensure all tests pass
  - Run the full test suite (exploration test + preservation tests)
  - Confirm Property 1 (Bug Condition) passes on fixed code
  - Confirm Property 2 (Preservation) passes on fixed code
  - If no automated test framework was added, complete a manual verification checklist:
    - [ ] Scroll slowly through the Hero section → "Beranda" stays active
    - [ ] Scroll slowly through the Welcome section (unnamed, between Hero and Profil) → "Beranda" stays active throughout
    - [ ] Continue scrolling into `id="profil"` → "Profil" activates only when the section substantially enters the viewport (~40% from the top)
    - [ ] Continue scrolling through `id="berita"`, `id="opd"`, `id="transparansi"` → each activates correctly
    - [ ] Click "Profil" in the navbar from any position → scrolls to Profil, indicator immediately moves to "Profil"
    - [ ] Reload page → "Beranda" is active at scroll = 0
    - [ ] Resize the browser window → indicator position and width update correctly
    - [ ] "Kebijakan Privasi" link never shows the yellow underline indicator at any scroll position
  - Ensure all tests pass; ask the user if questions arise
