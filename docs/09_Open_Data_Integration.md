# 09 — Open Data Integration

> **Document Purpose:** Documents the Open Data sources GeoSpread ingests, the integration strategy, data normalization approach, and ingestion rules. This document must be updated whenever a new data source is added or removed.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Supported Event Categories](#2-supported-event-categories)
3. [Data Sources](#3-data-sources)
4. [Integration Architecture](#4-integration-architecture)
5. [Data Normalization](#5-data-normalization)
6. [Ingestion Rules](#6-ingestion-rules)
7. [Open Questions / TODO](#7-open-questions--todo)

---

## 1. Overview

GeoSpread relies on Open Data from authoritative government and scientific agencies to provide real-time, trusted geospatial event information.

Open Data events are:
- **Automatically ingested** — no user action required.
- **Sourced from trusted agencies** — not subject to the same community moderation workflow as user reports.
- **The primary source** for natural disaster and environmental hazard categories.

Community reports serve as a **complement** to Open Data, filling coverage gaps and capturing hyperlocal incidents not covered by official feeds.

---

## 2. Supported Event Categories

| Event Type | Status | Notes |
|------------|--------|-------|
| **Earthquake** | ✅ Planned | — |
| **Heavy Rain** | ✅ Planned | — |
| **Flood** | ✅ Planned | — |
| **Storm** | ✅ Planned | — |
| **Landslide** | ✅ Planned | — |
| **Sinkhole** | ⚠️ Conditional | Only if a suitable data source is available |
| **Wildfire / Hotspot** | ⚠️ Conditional | Only if a suitable data source is available |

---

## 3. Data Sources

> TODO: Identify and document the specific data sources for each event category. For each source, document:
> - Agency name and country/region
> - Feed URL or API endpoint
> - Authentication requirements (public or API key)
> - Data format (JSON, XML, GeoJSON, ATOM/RSS, etc.)
> - Update frequency (real-time, every 5 min, hourly, etc.)
> - License or terms of use

### Earthquake

| Field | Detail |
|-------|--------|
| **Source** | TODO |
| **Feed URL** | TODO |
| **Format** | TODO |
| **Update Frequency** | TODO |
| **License** | TODO |

### Heavy Rain

| Field | Detail |
|-------|--------|
| **Source** | TODO |
| **Feed URL** | TODO |
| **Format** | TODO |
| **Update Frequency** | TODO |
| **License** | TODO |

### Flood

| Field | Detail |
|-------|--------|
| **Source** | TODO |
| **Feed URL** | TODO |
| **Format** | TODO |
| **Update Frequency** | TODO |
| **License** | TODO |

### Storm

| Field | Detail |
|-------|--------|
| **Source** | TODO |
| **Feed URL** | TODO |
| **Format** | TODO |
| **Update Frequency** | TODO |
| **License** | TODO |

### Landslide

| Field | Detail |
|-------|--------|
| **Source** | TODO |
| **Feed URL** | TODO |
| **Format** | TODO |
| **Update Frequency** | TODO |
| **License** | TODO |

### Sinkhole *(if available)*

| Field | Detail |
|-------|--------|
| **Source** | TODO |
| **Feed URL** | TODO |
| **Format** | TODO |
| **Update Frequency** | TODO |
| **License** | TODO |

### Wildfire / Hotspot *(if available)*

| Field | Detail |
|-------|--------|
| **Source** | TODO (e.g., NASA FIRMS, GISTDA) |
| **Feed URL** | TODO |
| **Format** | TODO |
| **Update Frequency** | TODO |
| **License** | TODO |

---

## 4. Integration Architecture

### 4.1 Ingestion Strategy

Open Data feeds are polled by the backend on a scheduled basis.

```
Open Data Feed (external API)
        ↓
  Ingestion Job (scheduled, backend)
        ↓
  Normalize & Deduplicate
        ↓
  Store in PostgreSQL + PostGIS
        ↓
  Trigger Notifications (if applicable)
```

> TODO: Define the scheduling mechanism (e.g., cron job, message queue, or managed scheduler on Render).

> TODO: Define the polling interval for each event type based on data source update frequency.

### 4.2 Deduplication

The same event (e.g., an earthquake) may be reported by multiple data sources. The ingestion pipeline must deduplicate to avoid showing the same event multiple times.

> TODO: Define the deduplication strategy (e.g., match by external ID + source, or by location + time window).

### 4.3 Failure Handling

> TODO: Define how ingestion failures are handled (e.g., retry logic, dead-letter queue, alerting).

---

## 5. Data Normalization

All Open Data events must be normalized into GeoSpread's internal event schema before storage.

### 5.1 Normalized Fields

| GeoSpread Field | Description |
|----------------|-------------|
| `source` | Name of the originating data source (e.g., `"USGS"`) |
| `externalId` | The ID assigned by the source agency (for deduplication) |
| `eventType` | Mapped to GeoSpread's event type enum |
| `severity` | Mapped to GeoSpread's severity scale |
| `location` | PostGIS point (lat/lng in EPSG:4326) |
| `title` | Human-readable event title |
| `description` | Event details (original or translated) |
| `occurredAt` | Timestamp from the source data |
| `ingestedAt` | Timestamp when GeoSpread ingested the record |
| `rawPayload` | The original raw data stored for reference and debugging |

### 5.2 Event Type Mapping

> TODO: Document how each external source's event categories map to GeoSpread's internal event types.

### 5.3 Severity Mapping

> TODO: Document how each external source's severity / magnitude / intensity scales map to GeoSpread's internal severity levels (Low / Medium / High / Critical).

---

## 6. Ingestion Rules

| Rule | Detail |
|------|--------|
| **API keys in env vars** | All API keys for external data feeds must be stored in environment variables — never in source code |
| **Raw payload preserved** | Always store the original raw response alongside normalized fields |
| **Idempotent ingestion** | Running the ingestion job multiple times must not create duplicate records |
| **Graceful degradation** | If a single feed fails, other feeds must continue to be ingested |
| **Logging** | All ingestion runs must be logged with source, count of records processed, and any errors |

---

## 7. Open Questions / TODO

| # | Question |
|---|----------|
| 1 | Which specific agencies will be used for each event category (Thailand and/or international)? |
| 2 | Will USGS, TMD (Thai Meteorological Department), or DDPM (Department of Disaster Prevention and Mitigation) feeds be used? |
| 3 | What is the scheduling mechanism for ingestion jobs on the Render deployment? |
| 4 | What is the polling frequency for each event category? |
| 5 | How will severity mapping be handled for sources with non-standard scales (e.g., earthquake magnitude vs. intensity)? |
| 6 | How will the system handle Open Data that does not include precise coordinates (e.g., province-level only)? |
| 7 | Will historical data be backfilled at launch, or only forward-ingested from the launch date? |
| 8 | Is there a plan for rate limits on external API calls? |
