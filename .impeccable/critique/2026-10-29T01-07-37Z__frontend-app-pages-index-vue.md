---
target: "หน้าแรก localhost:3000"
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
target_identity: "file:C:\\Users\\User\\Project\\Geospread\\frontend\\app\\pages\\index.vue"
target_fingerprint: "sha256:7d2fade577006eea119ca09f569280a9ce9e0a76eb46bf083c642227e3caa529"
target_path: "C:\\Users\\User\\Project\\Geospread\\frontend\\app\\pages\\index.vue"
timestamp: 2026-10-29T01-07-37Z
slug: frontend-app-pages-index-vue
---
# Critique: homepage (frontend/app/pages/index.vue) — 24/40 Acceptable

Design specificity: partly generic (~6/10 template). Product-specific: map-as-hero, cluster pending dot, Thai copy. Generic: identical white card (#dfe8f4 border, 14-16px radius, soft blue shadow) on every section; default SaaS blue #1479ef; hero-metric tiles (TodaySummary.vue 5/3/ดี hardcoded); centered icon tiles (AppRightPanel.vue:111-150); eyebrow+h2+"ดูทั้งหมด" on every section; English tagline "Safer Communities Together" (AppSidebar.vue:68); system-ui body (app.vue:12) vs Noto Sans Thai/Inter header (AppHeader.vue:134).

Heuristics: 1:2 2:3 3:3 4:2 5:3 6:2 7:2 8:2 9:3 10:2 = 24/40.

Priority issues:
- [P0] Verification status hardcoded "รอตรวจสอบ" (NearbyIncidents.vue:99, IncidentMapPopup.vue:160) — bind to data; 3 distinct non-color-only states.
- [P1] Placeholder numbers/lists presented as real (TodaySummary, AppRightPanel:72-76, HelpRequests, RecentActivity) — replace metric tiles with one data sentence + freshness; hide unbacked sections.
- [P1] Same card everywhere + generic blue meaning brand/link/help — tokens, one radius, rules not shadows, separate help hue.
- [P1] Mobile home is an unlabeled map (one "9" cluster over Bangkok) — peek sheet with nearby count/list; default center from followed areas.
- [P2] Small text & contrast: bottom-nav labels .59rem (AppBottomNav.vue:28), 22 undersized-text, 30 low-contrast detector hits (#7890ad 3.3:1, #8290a5 3.2:1); duplicated action tiles; English tagline; two fonts.

Detector: CLI clean (0). Browser overlay: mobile 7, desktop ~62 lines (low-contrast 30, undersized 22, tiny-text 6, thin-border-wide-shadow 2 on MapLocationSearch.vue:200, column overflow 2).
