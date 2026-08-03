# 07 — UI/UX Design

> **Document Purpose:** Describes the user interface philosophy, core screens, map interactions, and design considerations for GeoSpread. This document guides frontend development and should be updated as the UI evolves.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Core Screens](#2-core-screens)
3. [Map Interactions](#3-map-interactions)
4. [Event Feed UX](#4-event-feed-ux)
5. [Report & Help Request Forms](#5-report--help-request-forms)
6. [Notifications UX](#6-notifications-ux)
7. [Navigation & Information Architecture](#7-navigation--information-architecture)
8. [Open Questions / TODO](#8-open-questions--todo)

---

## 1. Design Philosophy

> TODO: Define the overall visual direction (e.g., color palette, typography, dark/light mode support).

Key UX principles to consider for a safety platform:

| Principle | Description |
|-----------|-------------|
| **Clarity under stress** | Information must be readable quickly; users may be in emergency situations |
| **Location-first** | The map is the primary entry point and always reflects the current context |
| **Low friction reporting** | Submitting a report or help request must require as few steps as possible |
| **Relevant over exhaustive** | Show only what matters to the user's location and preferences |
| **Accessible** | Must be usable in adverse conditions (bright sunlight, one-handed operation) |

---

## 2. Core Screens

### 2.1 Live Map

**Purpose:** The primary screen and the heart of GeoSpread.

**Key elements:**
- Full-screen Mapbox map as the base layer.
- Geolocated pins/markers for all active events within the visible area.
- Visual differentiation between event types and severity levels (color, icon, or size).
- Tap/click on a pin opens an event detail panel.
- User's current location indicator.
- Quick-action button to submit a new report or help request.

> TODO: Define marker clustering behavior when many events overlap at the current zoom level.

> TODO: Define map layer filters (e.g., toggle by event type or severity).

---

### 2.2 Event Feed

**Purpose:** A ranked, scrollable list of events relevant to the user.

**Key elements:**
- Each card shows: event type, severity badge, distance from user, time since last update, and a brief description.
- Feed is ranked by: Priority → Distance → Latest Update → Activity.
- Tapping a card centers the map on the event and opens the detail panel.

> See [02_Product_Requirements.md — Event Feed Ranking](./02_Product_Requirements.md#3-event-feed-ranking) for the ranking algorithm.

---

### 2.3 Report Event

**Purpose:** Allow users to submit a community incident report.

**Key elements:**
- Event type selector (categorized).
- Description text field.
- Location pin (auto-fills from GPS; user can adjust on map).
- Image upload (via Cloudinary).
- Submit button with confirmation.

> TODO: Define whether reports go live immediately or require admin approval first.

---

### 2.4 Help Request

**Purpose:** Allow users to request assistance and allow others to respond.

**Key elements:**
- Request type selector (General Help / Volunteer / Emergency).
- Description text field.
- Location pin (auto-fills from GPS; user can adjust on map).
- Submit button.
- Status indicator for the requester (Waiting / Accepted / Resolved).

For the responding user:
- Notification with request details and distance.
- "Accept" button.
- Navigation link (Mapbox turn-by-turn or deep link to a maps app).

---

### 2.5 Search Area

**Purpose:** Let users explore events in a location they are not currently in.

**Key elements:**
- Search input with place name autocomplete (via Mapbox Geocoding API).
- On selection, the map pans and zooms to the searched area.
- Event feed and map update to reflect the searched area.

---

### 2.6 Follow Area

**Purpose:** Subscribe to notifications for a specific geographic area.

**Key elements:**
- Ability to save the current map view or a drawn polygon as a followed area.
- List of followed areas in the user profile.
- Option to name each followed area.
- Easy unfollow action.

---

### 2.7 Notifications

**Purpose:** Surface timely alerts to the user.

**Key elements:**
- In-app notification center with a list of unread and read notifications.
- Notification badge on the navigation icon.
- Each notification links to the relevant event or help request.

> See [02_Product_Requirements.md — Notification Rules](./02_Product_Requirements.md#4-notification-rules) for triggering logic.

> TODO: Define whether push notifications (web push / mobile) are in scope for MVP.

---

### 2.8 User Profile

**Purpose:** Manage account settings and preferences.

**Key elements:**
- Display name and avatar.
- Notification radius setting.
- List of followed areas (link to Follow Area management).
- Notification preferences (types of events to be notified about).
- Account settings (email, password change).

---

### 2.9 Admin Dashboard

**Purpose:** Moderation and data management for administrators.

**Key elements:**
- Queue of pending community reports awaiting review.
- Approve / reject / flag controls per report.
- Overview metrics (total events, active help requests, open reports).

> TODO: Define the full scope of the Admin Dashboard for MVP.

---

## 3. Map Interactions

| Interaction | Behavior |
|-------------|----------|
| **Pan / Zoom** | Standard Mapbox touch and mouse gestures |
| **Tap/Click on event pin** | Opens event detail panel (bottom sheet on mobile, sidebar on desktop) |
| **Long press / right-click on map** | TODO: Define behavior (e.g., quick "report at this location" action) |
| **My Location button** | Re-centers map on user's current GPS location |
| **Cluster tap** | TODO: Define behavior when tapping a cluster of markers |

---

## 4. Event Feed UX

| State | Behavior |
|-------|----------|
| **Default** | Events ranked by Priority → Distance → Latest Update → Activity |
| **Area search active** | Feed shows events in the searched area, not the user's location |
| **No events nearby** | Display an empty state with guidance |
| **Loading** | Show skeleton cards while fetching |

---

## 5. Report & Help Request Forms

| Rule | Detail |
|------|--------|
| **GPS auto-fill** | Location defaults to the user's current GPS position |
| **Map pin adjustment** | User can drag the pin to correct the location |
| **Image upload** | Optional; maximum number of images per report: TODO |
| **Submission feedback** | Show a success confirmation after submission |
| **Error feedback** | Show inline field errors on validation failure |

---

## 6. Notifications UX

| Rule | Detail |
|------|--------|
| **Notification badge** | Shows unread count; clears when notification center is opened |
| **Notification types** | Event alert, Help request nearby, Followed area update |
| **Deep link** | Each notification navigates to the relevant event or help request |
| **Push notifications** | TODO: Scope for MVP |

---

## 7. Navigation & Information Architecture

> TODO: Define the full navigation structure (e.g., bottom tab bar on mobile, side nav on desktop).

Suggested top-level navigation:

| Tab | Screen |
|-----|--------|
| 🗺️ Map | Live Map (default landing screen) |
| 📋 Feed | Event Feed |
| ➕ Report | Report Event / Help Request (quick action) |
| 🔔 Notifications | Notification Center |
| 👤 Profile | User Profile & Settings |

---

## 8. Open Questions / TODO

| # | Question |
|---|----------|
| 1 | What is the target platform — web only, or also mobile (PWA or native)? |
| 2 | Will dark mode be supported at launch? |
| 3 | What is the design system / component library being used? |
| 4 | What is the map style (Mapbox style URL) to be used? |
| 5 | Are push notifications (browser push or mobile) in scope for MVP? |
| 6 | What is the maximum number of images a user can attach to a report? |
| 7 | Is the Admin Dashboard a separate application or a protected route in the main app? |
| 8 | What is the behavior when a user submits a report in an area without internet connectivity? |
