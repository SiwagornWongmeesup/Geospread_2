---
target: login and register pages (desktop + mobile)
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\User\\Project\\Geospread\\frontend\\app\\components\\views\\login"
timestamp: 2026-11-04T11-15-10Z
slug: frontend-app-components-views-login
---
# Critique: login + register (desktop + mobile)

Method: dual-agent (A: design review · B: detector + browser)

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | Register success is silent (router.push('/login')); loading = grey 2.69:1 label only |
| 2 | Match System / Real World | 3 | Label "ชื่อผู้ใช้งาน" vs placeholder "ชื่อของคุณ" + autocomplete=name: handle or real name? |
| 3 | User Control and Freedom | 2 | ?redirect dropped between login/register; terms link leaves page and wipes form |
| 4 | Consistency and Standards | 2 | Desktop vs mobile differ (header, recovery line, language switch, two brand marks) |
| 5 | Error Prevention | 3 | Good submit validation; terms link 1px from 13px checkbox |
| 6 | Recognition Rather Than Recall | 3 | Persistent labels and hint |
| 7 | Flexibility and Efficiency | 2 | No forgot password, Google dead, re-type credentials after register |
| 8 | Aesthetic and Minimalist Design | 2 | Desktop header search + login/register buttons duplicate the form |
| 9 | Error Recovery | 3 | Specific inline errors; focus not moved; "email in use" only top banner |
| 10 | Help and Documentation | 2 | /terms is 404; no recovery or help contact |
| **Total** | | **24/40** | **Acceptable** |

## Design Specificity
Partly authored: mobile map/pin backdrop, Thai flood illustration, location kicker. The form itself is category-generic (split hero + white card + blue CTA + Google). Detector CLI: 0 findings in 6 files. Runtime detector: 5-8 findings per page/size, mostly low-contrast; glow-shadow and stripes banners are false positives / stylistic.

## Priority Issues
1. [P1] Register breaks the path back to the task: redirect dropped on switch links (login/Desktop.vue:46, Mobile.vue:48); register.vue:53 pushes /login silently. Fix: carry redirect, auto-login or prefill email + success message, then redirectAfterLogin(). Command: harden.
2. [P1] /terms is 404, link inside checkbox label, 13px/18px hit target, mis-tap wipes form. Fix: create terms/privacy page or open in new tab/sheet, move link out of label, 44px row. Command: harden.
3. [P1] WCAG AA contrast: CTA 4.19:1, hint 3.95:1, placeholder 3.2:1, links 4.0-4.18:1, divider 4.05:1, badge 4.12:1, mobile recovery 3.15:1, kicker 4.0:1, input border 1.45:1, focus ring 16% alpha. Fix: CTA ~#0b5fcc, muted text >= #52708b, borders >= #8aa0b8, solid 2px focus outline. Command: audit / polish.
4. [P2] Error recovery for keyboard/SR: up to 4 role=alert at once, focus not moved to first invalid field, backend "email in use" not mapped to field. Fix: focus first invalid, one live summary, map to fieldErrors.email with link to login. Command: harden.
5. [P2] Desktop/mobile inconsistency and noisy desktop chrome: AppHeader search + duplicate login/register buttons, second brand mark, no TH/EN on mobile, empty document.title, min-width 480px overflow under 900px. Fix: minimal auth header (brand + language) on both, useHead title, drop min-width. Command: adapt / distill.

## Persona Red Flags
- Jordan: doesn't know if "ชื่อผู้ใช้งาน" is public; taps Google first; no success after register; no note on how location is used.
- Sam: 4 simultaneous alerts; faint focus ring; empty page title; Google button aria-describedby points at empty status.
- Casey: footer links 18px tall; 18px terms checkbox next to a 404 link; CTA mid-screen; no language switch.

## Minor Observations
- Negative letter-spacing on Thai headings; uppercase/tracking on Thai kicker does nothing useful.
- Dead CSS: grid-template-columns on flex, !important on .terms.
- Support/privacy note 11.5-11.7px, desktop only.
- Backend errors Thai-only for EN users.
- Terms checkbox has no required/aria-required.

## Questions to Consider
- Should login be a sheet over the in-progress report instead of a full page?
- What if the screen showed the user's area ("3 incidents near you") before asking for a password?
- Could email-only or phone OTP cut registration to one field?
