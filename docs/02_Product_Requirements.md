# 02 — Product Requirements

> **Document Purpose:** Defines all functional and non-functional requirements for GeoSpread, including feature specifications, event categories, feed ranking logic, and notification rules.

---

## Table of Contents

1. [Core Features](#1-core-features)
2. [Event Categories](#2-event-categories)
3. [Event Feed Ranking](#3-event-feed-ranking)
4. [Notification Rules](#4-notification-rules)
5. [Help Request Flow](#5-help-request-flow)
6. [Non-Functional Requirements](#6-non-functional-requirements)

---

## 1. Core Features

The following features define the MVP scope:

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Live Map** | Real-time map displaying geolocated events from Open Data and community reports |
| 2 | **Event Feed** | Ranked list of events based on priority, distance, recency, and activity |
| 3 | **Report Event** | Form for users to submit community incident reports with location and media |
| 4 | **Help Request** | Form for users to request assistance; other users can accept and navigate to the site |
| 5 | **Search Area** | Search for events in a specific geographic area |
| 6 | **Follow Area** | Subscribe to a geographic area to receive relevant notifications |
| 7 | **Notifications** | Push/in-app alerts triggered by proximity, severity, or followed areas |
| 8 | **User Profile** | User account management, preferences, and notification settings |
| 9 | **Admin Dashboard** | Back-office tools for moderating reports and managing system data |

---

## 2. Event Categories

### 2.1 Open Data Events

These events are ingested automatically from official sources and do not require user submission.

| Event Type | Source Category | Notes |
|------------|----------------|-------|
| Earthquake | Seismic agencies | — |
| Heavy Rain | Meteorological agencies | — |
| Flood | Hydrology / meteorological agencies | — |
| Storm | Meteorological agencies | — |
| Landslide | Geological agencies | — |
| Sinkhole | Geological agencies | Only if data is available |
| Wildfire / Hotspot | Satellite / forestry agencies | Only if data is available |

> For the full list of data sources and integration details, see [09_Open_Data_Integration.md](./09_Open_Data_Integration.md).

---

### 2.2 Community Report Events

These events are submitted by registered users and are subject to moderation.

| Event Type | Notes |
|------------|-------|
| Fire | — |
| Severe Traffic Accident | — |
| Fallen Tree | — |
| Road Closure | — |
| Area-wide Power Outage | — |
| Chemical Leak | — |
| Flood | Only when no authoritative Open Data feed is available |

> TODO: Define the moderation workflow — who can approve, reject, or flag a community report, and what the review time SLA should be.

---

### 2.3 Explicitly Excluded Event Types

The following event types are **permanently out of scope** and will not be supported at any phase:

| Event Type | Reason |
|------------|--------|
| Lost Items | Outside the platform's safety focus |
| Lost Phone | Outside the platform's safety focus |
| Lost Pets | Outside the platform's safety focus |
| Marketplace listings | Commercially unrelated to the core mission |

---

### 2.4 Help Request Types

Help requests are a distinct category from event reports. They represent active calls for assistance.

| Type | Description |
|------|-------------|
| **Request Help** | General request for assistance in a specific location |
| **Volunteer Request** | Request for volunteers to assist with a situation |
| **Emergency Assistance** | Urgent call for immediate help |

---

## 3. Event Feed Ranking

The Event Feed is sorted using a **multi-factor ranking algorithm** — not by popularity alone.

### Ranking Factors (in order of weight)

| Factor | Description |
|--------|-------------|
| **Priority** | Severity level of the event (e.g., Critical > High > Medium > Low) |
| **Distance** | Proximity of the event to the user's current location |
| **Latest Update** | Recency of the last update or confirmation of the event |
| **Activity** | Level of engagement (e.g., number of confirmations, comments, or updates) |

> **Note:** Popularity alone (e.g., total views or likes) is explicitly NOT a ranking criterion. Events must be surfaced based on relevance and urgency, not social engagement.

---

## 4. Notification Rules

A notification is sent to a user when **at least one** of the following conditions is met:

| Condition | Description |
|-----------|-------------|
| **Proximity** | The event occurs within a radius defined by the user |
| **Severity** | The event is rated `High` or `Critical` |
| **Followed Area** | The event occurs within an area the user is actively following |

### Severity Levels

> TODO: Define the full severity scale (e.g., Low / Medium / High / Critical) with criteria for each level and the rules for who assigns severity — Open Data ingestion pipeline, user report submitter, or admin.

---

## 5. Help Request Flow

1. A user submits a Help Request with a type, description, and pinned location.
2. Nearby users receive a notification (subject to notification rules).
3. Another user can **accept** the request, which:
   - Notifies the requester that help is on the way.
   - Provides the accepting user with navigation to the pinned location.
4. The request is marked as **resolved** when confirmed by either party.

> TODO: Define the full state machine for help requests (e.g., `open` → `accepted` → `in_progress` → `resolved` / `cancelled`).

> TODO: Define rules for what happens if no one accepts a request, or if the accepting user cancels after accepting.

---

## 6. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | TODO: Define target response times (e.g., API p95 latency) |
| **Availability** | TODO: Define uptime SLA |
| **Scalability** | TODO: Define expected user volume and geographic coverage |
| **Security** | No secrets in source code; all sensitive values via environment variables — see [04_Development_Guidelines.md](./04_Development_Guidelines.md) |
| **Localization** | TODO: Define language support requirements |
| **Accessibility** | TODO: Define accessibility standards (e.g., WCAG 2.1 AA) |
