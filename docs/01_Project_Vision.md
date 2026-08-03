# 01 — Project Vision

> **Document Purpose:** Defines what GeoSpread is, why it exists, who it serves, and the principles that guide every product decision.

---

## Table of Contents

1. [Product Summary](#1-product-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Goals](#3-product-goals)
4. [Target Users](#4-target-users)
5. [Data Source Strategy](#5-data-source-strategy)
6. [Core Value Proposition](#6-core-value-proposition)
7. [Out of Scope](#7-out-of-scope)

---

## 1. Product Summary

**GeoSpread** is a Location-based Community Safety Platform that enables users to:

- **Receive** real-time alerts about significant events near them or in areas they follow.
- **Report** community-impacting incidents directly from the field.
- **Request and offer** help during emergencies.
- **Monitor** developing situations across any area of interest.

Data is drawn from two complementary sources: authoritative **Open Data** feeds from government and official agencies, and verified **Community Reports** submitted by users.

---

## 2. Problem Statement

When emergencies or safety-relevant incidents occur, information is often:

- **Scattered** across multiple government portals, social media, and news outlets.
- **Delayed** by the time it reaches the people most affected.
- **Not location-aware** — alerts are broadcast nationally rather than being targeted to those actually in the affected area.

GeoSpread solves this by aggregating authoritative data and community intelligence into a single, map-first, location-aware platform.

---

## 3. Product Goals

GeoSpread is designed to answer one central question for every user:

> **"What is happening right now in the area where I am, or in the area I care about?"**

Secondary goals:

- Enable rapid community-driven incident reporting with minimal friction.
- Provide actionable help-request routing so that nearby volunteers or responders can navigate to those in need.
- Offer smart, relevance-based notifications that minimize noise while ensuring critical alerts always reach the right people.

---

## 4. Target Users

> TODO: Define primary user personas with demographics, technical literacy, and use-case descriptions.

Suggested personas to define:

- **Commuter** — needs traffic, road, and weather alerts along their daily route.
- **Local Resident** — wants to be aware of community-level events in their neighborhood.
- **Emergency Volunteer** — actively monitors and responds to help requests.
- **Administrator / Moderator** — reviews community reports and manages data quality.

---

## 5. Data Source Strategy

GeoSpread aggregates data from three pillars:

### 5.1 Open Data (Official Sources)

Real-time and near-real-time feeds from trusted government and scientific agencies.

See [09_Open_Data_Integration.md](./09_Open_Data_Integration.md) for the full source list, ingestion strategy, and data categories.

**Covered event types:**

- Earthquake
- Heavy Rain
- Flood
- Storm
- Landslide
- Sinkhole *(if data available)*
- Wildfire / Hotspot *(if data available)*

### 5.2 Community Reports

User-submitted reports about events that affect the public.

**Supported event types:**

- Fire
- Severe Traffic Accident
- Fallen Tree
- Road Closure
- Area-wide Power Outage
- Chemical Leak
- Flood *(as a fallback when no Open Data feed is available)*

**Not supported in MVP:** Lost Items, Lost Phone, Lost Pets, Marketplace — see [08_Roadmap.md](./08_Roadmap.md).

### 5.3 Help Requests

Users may submit requests for assistance. Other users can accept requests and navigate to the location.

**Request types:**

- General Help Request
- Volunteer Request
- Emergency Assistance

---

## 6. Core Value Proposition

| Pillar | Description |
|--------|-------------|
| **Awareness** | Single source of truth for what is happening nearby |
| **Timeliness** | Open Data ingested in real time; community reports submitted instantly |
| **Locality** | All data is geo-tagged and surfaced based on the user's location or followed areas |
| **Community** | Bridges the gap between official data and on-the-ground reality |
| **Action** | Not just informational — users can request and offer help |

---

## 7. Out of Scope

The following are explicitly excluded from GeoSpread's product direction (not only MVP):

| Feature | Reason |
|---------|--------|
| Lost Items / Phone / Pets | Outside the safety and emergency focus of the platform |
| Marketplace | Commercially unrelated to the core mission |

> See [08_Roadmap.md](./08_Roadmap.md) for features that are excluded from MVP but may be considered in future phases.
