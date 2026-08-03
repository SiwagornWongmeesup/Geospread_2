# 08 — Roadmap

> **Document Purpose:** Defines the MVP scope, explicitly excluded features, and future development phases for GeoSpread.

---

## Table of Contents

1. [MVP Scope](#1-mvp-scope)
2. [Explicitly Excluded from MVP](#2-explicitly-excluded-from-mvp)
3. [Permanently Out of Scope](#3-permanently-out-of-scope)
4. [Future Phases](#4-future-phases)
5. [Open Questions / TODO](#5-open-questions--todo)

---

## 1. MVP Scope

The MVP delivers the core platform experience: location-aware event awareness, community reporting, and help requests.

### Core Features in MVP

| Feature | Description |
|---------|-------------|
| **Live Map** | Full-screen interactive map with geolocated event markers |
| **Event Feed** | Ranked list of nearby and followed-area events |
| **Report Event** | Community incident submission with location, type, description, and images |
| **Help Request** | Request assistance; other users can accept and navigate to the location |
| **Search Area** | Explore events in any geographic area |
| **Follow Area** | Subscribe to notifications for specific geographic areas |
| **Notifications** | In-app alerts based on proximity, severity, or followed areas |
| **User Profile** | Account management and notification preferences |
| **Admin Dashboard** | Basic moderation queue for community reports |

### Open Data Sources in MVP

| Data Type | Status |
|-----------|--------|
| Earthquake | ✅ In MVP |
| Heavy Rain | ✅ In MVP |
| Flood | ✅ In MVP |
| Storm | ✅ In MVP |
| Landslide | ✅ In MVP |
| Sinkhole | ⚠️ In MVP if data source is available |
| Wildfire / Hotspot | ⚠️ In MVP if data source is available |

### Community Report Types in MVP

| Event Type | Status |
|------------|--------|
| Fire | ✅ In MVP |
| Severe Traffic Accident | ✅ In MVP |
| Fallen Tree | ✅ In MVP |
| Road Closure | ✅ In MVP |
| Area-wide Power Outage | ✅ In MVP |
| Chemical Leak | ✅ In MVP |
| Flood (community fallback) | ✅ In MVP |

---

## 2. Explicitly Excluded from MVP

These features are safety-adjacent but are **not included in MVP** due to scope constraints. They may be considered in future phases.

| Feature | Reason for Exclusion |
|---------|---------------------|
| Lost Items reporting | Out of MVP scope; low safety relevance |
| Lost Phone reporting | Out of MVP scope; low safety relevance |
| Lost Pets reporting | Out of MVP scope; low safety relevance |

> The above features are NOT permanently out of scope — they are deferred to later phases.

---

## 3. Permanently Out of Scope

These features are **never planned** for GeoSpread, regardless of phase. They fall outside the product's safety mission.

| Feature | Reason |
|---------|--------|
| Marketplace | Commercially unrelated to the platform's core mission |

---

## 4. Future Phases

> TODO: Prioritize and schedule future phases based on user feedback after MVP launch.

### Phase 2 — Community & Engagement (Proposed)

| Feature | Description |
|---------|-------------|
| Lost items / pets reporting | User-submitted lost-and-found reports |
| Event confirmation / upvoting | Users can confirm or flag an event as still active |
| Reputation system | Trust scores for prolific, accurate community reporters |

### Phase 3 — Advanced Geospatial (Proposed)

| Feature | Description |
|---------|-------------|
| Route-based alerts | Notify users about events along a specific travel route |
| Historical event heatmaps | Visualize event frequency over time in an area |
| Custom alert polygons | Draw custom shapes as notification zones |

### Phase 4 — Integration & Partnerships (Proposed)

| Feature | Description |
|---------|-------------|
| Agency integration | Allow government agencies to push verified updates directly |
| Embedded widgets | Allow third-party websites to embed GeoSpread event maps |
| Public API | Open API for developers to access GeoSpread event data |

---

## 5. Open Questions / TODO

| # | Question |
|---|----------|
| 1 | What is the target launch date for MVP? |
| 2 | What defines MVP "done" — feature-complete, or minimum viable for public beta? |
| 3 | Is there a beta testing phase before public launch? |
| 4 | What metrics will be used to decide when to move from MVP to Phase 2? |
| 5 | Will push notifications (mobile / web push) be included in MVP or deferred? |
