# Bugfix Requirements Document

## Introduction

The Navbar scroll-spy in the Sukabumi City website (`app/page.tsx`) activates the yellow underline indicator on the wrong navigation item while the user scrolls through the Welcome section. Because Welcome has no `id` and is not a tracked section, the current `scrollY + 250` threshold crosses into `profil`'s offset range before the user has meaningfully entered that section, causing the indicator to jump prematurely to "Pengumuman & Berita". The fix must keep "Beranda" active for the full Hero + Welcome vertical span and tighten the activation threshold so a section only becomes active when it substantially occupies the viewport.

---

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the user scrolls down through the Welcome section (which has no `id` and follows `id="beranda"` immediately) THEN the system activates the "Pengumuman & Berita" nav indicator instead of keeping "Beranda" active.

1.2 WHEN `window.scrollY + 250` crosses the `offsetTop` of `id="profil"` while the Welcome section still fills the viewport THEN the system advances the active indicator past "Beranda" and "Profil" directly to "Pengumuman & Berita".

1.3 WHEN the user is scrolling and the scroll position has not yet reached the midpoint of any tracked section THEN the system marks a section as active before it meaningfully occupies the screen.

### Expected Behavior (Correct)

2.1 WHEN the user is scrolling through the Welcome section (no `id`, positioned between `id="beranda"` and `id="profil"`) THEN the system SHALL keep the "Beranda" nav item active, treating the entire Hero + Welcome vertical span as the "Beranda" zone.

2.2 WHEN `window.scrollY + 250` crosses the `offsetTop` of `id="profil"` but the Welcome section is still substantially visible THEN the system SHALL NOT advance the active indicator to "Profil" until the scroll position reaches approximately the midpoint of the viewport relative to `id="profil"`.

2.3 WHEN a tracked section (`profil`, `berita`, `opd`, `transparansi`) occupies a significant portion of the viewport (the section top is at or above the viewport midpoint, approximately `window.scrollY + window.innerHeight / 2`) THEN the system SHALL activate the corresponding nav item's yellow underline indicator.

2.4 WHEN the user has scrolled past the bottom of the last tracked section (`id="transparansi"`) THEN the system SHALL keep "Transparansi Dokumen" as the active nav item.

2.5 WHEN evaluating active sections THEN the system SHALL only consider nav items defined in `navItems` (`beranda`, `profil`, `berita`, `opd`, `transparansi`) and SHALL NOT apply active state logic to "Kebijakan Privasi".

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the user clicks a nav item THEN the system SHALL CONTINUE TO scroll smoothly to the corresponding section and immediately set that item as active.

3.2 WHEN the page first loads with no scroll THEN the system SHALL CONTINUE TO set "Beranda" as the default active nav item.

3.3 WHEN the user scrolls into `id="profil"` such that it occupies a significant viewport area THEN the system SHALL CONTINUE TO activate the "Profil" nav item.

3.4 WHEN the user scrolls into `id="berita"` THEN the system SHALL CONTINUE TO activate the "Pengumuman & Berita" nav item.

3.5 WHEN the user scrolls into `id="opd"` THEN the system SHALL CONTINUE TO activate the "Situs OPD" nav item.

3.6 WHEN the user scrolls into `id="transparansi"` THEN the system SHALL CONTINUE TO activate the "Transparansi Dokumen" nav item.

3.7 WHEN the browser window is resized THEN the system SHALL CONTINUE TO update the yellow indicator's position and width to match the active nav item.

3.8 WHEN the user navigates to "Kebijakan Privasi" (external link) THEN the system SHALL CONTINUE TO keep it as a plain link with no yellow underline indicator applied.

---

## Bug Condition

**Bug Condition Function:**

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type ScrollState {
    scrollY: number,
    profileOffsetTop: number,
    beritaOffsetTop: number,
    welcomeBottomY: number
  }
  OUTPUT: boolean

  // Bug fires when scroll is inside Welcome's vertical span but scrollY + 250
  // has already crossed profil's offsetTop, causing a premature section change.
  RETURN (X.scrollY < X.welcomeBottomY)
     AND (X.scrollY + 250 >= X.profileOffsetTop)
END FUNCTION
```

**Property: Fix Checking**

```pascal
FOR ALL X WHERE isBugCondition(X) DO
  result ← handleScroll'(X)
  ASSERT result.activeSection = 'beranda'
END FOR
```

**Property: Preservation Checking**

```pascal
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT handleScroll(X).activeSection = handleScroll'(X).activeSection
END FOR
```

**Key Definitions:**
- **F** (`handleScroll`): Original scroll handler using `scrollY + 250` with no Welcome-span awareness
- **F'** (`handleScroll'`): Fixed scroll handler using `scrollY + window.innerHeight / 2` with Hero+Welcome treated as the "beranda" zone
