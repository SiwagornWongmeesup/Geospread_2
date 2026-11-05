---
target: overall GeoSpread UI (mobile + desktop)
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\User\\Project\\Geospread\\frontend\\app\\pages"
timestamp: 2026-11-05T08-11-45Z
slug: frontend-app-pages
---
# GeoSpread overall UI critique (mobile + desktop)

Method: dual-agent (A: design review sub-agent · B: detector + browser sub-agent)

## Design Health Score — 25/40 (Acceptable)
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Wizard progress clear; blank grey map while loading; list rows lack verification/urgency status |
| 2 | Match System / Real World | 2 | Glyph icons (↗ + ▤ ⌂ ▰ •••); "คลิกบนแผนที่" on touch; "พื้นที่ที่รายงาน" instead of place name |
| 3 | User Control and Freedom | 2 | No exit/cancel in wizards; fake "บันทึกร่าง" saves nothing |
| 4 | Consistency and Standards | 2 | Three icon systems; red used for danger + Next + create, blue for login |
| 5 | Error Prevention | 2 | Help type preselected "อพยพ"; location not prefilled |
| 6 | Recognition Rather Than Recall | 3 | Labelled nav, type suggestions |
| 7 | Flexibility and Efficiency | 2 | + → menu → 4 steps; no quick emergency path |
| 8 | Aesthetic and Minimalist Design | 3 | Duplicate actions (sidebar + right panel; two login entry points on mobile) |
| 9 | Error Recovery | 2 | Step errors look like info, not tied to fields (no aria-invalid/describedby) |
| 10 | Help and Documentation | 3 | Guide exists but buried; hotlines only on help step 3 |

## Design Specificity Verdict
Partly authored (OCHA humanitarian icons, type suggestion from free text, natural Thai copy, hotline line) but chrome reads as generic SaaS: glyph icons in RequestHelpForm.vue:83/47, three icon systems, card-in-card with 9 radii, eyebrow group labels, system-ui font for Thai, hardcoded hex bypassing --gs tokens.
Detector: CLI 1 finding (layout-transition NearbySheet.vue:194). Browser: low-contrast #70819b (3.7–4.0:1) and white on #eb2631/#f52c3c (4.0–4.3:1); undersized text 10.4–10.7px (map legend, expand button, location hint, help chip captions); clipped-overflow/first-viewport/dark-glow judged false positives.

## Priority Issues
- [P0] Emergency path too slow, no "call first" in report flow or + menu; login card first on every step; location not prefilled. → clarify, harden, onboard
- [P1] Glyph icons + three icon systems (RequestHelpForm types/upload, sidebar/profile icons, bottom nav strokes). → polish
- [P1] Broken trust signals: fake save-draft, preselected evacuation, list rows without place/distance/verification badge. → harden, clarify
- [P2] Colour semantics & hierarchy: red Next + red locate, errors styled as info, primary below fold / behind bottom nav; contrast 4.0:1 on red buttons and #70819b captions. → colorize, layout
- [P2] Generic visual voice: no Thai typeface, card-in-card, radius sprawl, tiny 10px text. → typeset, quieter, document

## Persona Red Flags
- Jordan: + then second menu; duplicate actions on desktop; guide buried; dead Google button; "?" icon for help requests.
- Casey: primary buttons below fold/behind bottom nav; mandatory 5 chars first; no hotline early; location not auto-set.
- Sam: help type tiles lack aria-pressed and glyphs not aria-hidden; upload button reads "▣"; errors not linked to fields; empty document.title on home/report/help; no skip link.

## Minor Observations
- Focus ring on step status after programmatic focus looks like a stray box.
- ~800px desktop: map squeezed to ~300px between sidebar and right panel.
- Two search affordances on location step.
- NearbySheet animates height (layout transition).

## Questions to Consider
- Should the first emergency screen be a one-tap "I need help here / I see something" with GPS, details later?
- Must reporting require an account, or can unverified reports be accepted and community-confirmed?
- Could the OCHA icon language become the brand's visual voice?
