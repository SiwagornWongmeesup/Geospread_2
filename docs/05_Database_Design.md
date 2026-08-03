# 05 — Database Design

> **Document Purpose:** Documents the database strategy, ORM rules, geospatial data design decisions, and schema conventions for GeoSpread. This document must be updated whenever the Prisma schema changes.

---

## Table of Contents

1. [Database Stack](#1-database-stack)
2. [Design Principles](#2-design-principles)
3. [Geospatial Strategy](#3-geospatial-strategy)
4. [Schema Conventions](#4-schema-conventions)
5. [Migration Rules](#5-migration-rules)
6. [Entity Overview](#6-entity-overview)
7. [Open Questions / TODO](#7-open-questions--todo)

---

## 1. Database Stack

| Component | Technology | Hosting |
|-----------|------------|---------|
| **Database Engine** | PostgreSQL | Supabase or Neon (TBD) |
| **Geospatial Extension** | PostGIS | Enabled on the PostgreSQL instance |
| **ORM** | Prisma | Manages schema, migrations, and type-safe queries |

> For deployment details, see [03_System_Architecture.md](./03_System_Architecture.md).

---

## 2. Design Principles

| Principle | Description |
|-----------|-------------|
| **ORM-First** | All schema changes must be defined in the Prisma schema file, not written as raw SQL |
| **Migration-Driven** | Every schema change must go through a Prisma migration — no manual alterations |
| **Normalized Design** | Relational data must be appropriately normalized; denormalization requires a documented performance justification |
| **PostGIS for Geospatial** | All location data and geographic queries must use PostGIS types and functions |
| **No Direct SQL** | Raw SQL queries are prohibited unless Prisma does not support the required operation (must be documented when used) |

---

## 3. Geospatial Strategy

GeoSpread is fundamentally location-aware. PostGIS is the core technology enabling this.

### 3.1 Use Cases for PostGIS

| Use Case | PostGIS Feature |
|----------|----------------|
| Storing event locations | `GEOMETRY(Point, 4326)` columns |
| Radius-based event search | `ST_DWithin()` function |
| Area-following polygon storage | `GEOMETRY(Polygon, 4326)` or `GEOMETRY(MultiPolygon, 4326)` |
| Distance calculation | `ST_Distance()` function |
| Bounding-box queries | `ST_Within()` / `ST_Intersects()` |

> **Coordinate Reference System:** Use **EPSG:4326** (WGS 84, standard GPS coordinates) as the default CRS for all spatial columns.

### 3.2 Prisma + PostGIS

> TODO: Document the exact approach for integrating PostGIS geometry types with Prisma (e.g., using raw SQL in migrations with `prisma.executeRaw`, or using a PostGIS-compatible Prisma extension/workaround).

---

## 4. Schema Conventions

| Convention | Rule |
|------------|------|
| **Table names** | Plural, snake_case (e.g., `events`, `help_requests`, `followed_areas`) |
| **Column names** | snake_case (e.g., `created_at`, `event_type`, `location_point`) |
| **Primary keys** | UUID (`@id @default(uuid())`) preferred over auto-increment integers |
| **Timestamps** | All tables must include `created_at` and `updated_at` timestamp columns |
| **Soft deletes** | TODO: Define whether soft deletes (`deleted_at`) are used, and on which tables |
| **Enums** | Use Prisma enums for well-defined, finite value sets (e.g., event type, severity, status) |

---

## 5. Migration Rules

| Rule | Detail |
|------|--------|
| **Use `prisma migrate dev`** | For local development — creates a migration file and applies it |
| **Use `prisma migrate deploy`** | For production — applies pending migrations without interactive prompts |
| **Never edit migration files** | Once a migration is committed, do not modify it — create a new migration instead |
| **Commit migration files** | All migration files in `prisma/migrations/` must be committed to version control |
| **Review before applying** | All schema changes must be reviewed and approved before being applied to production |

---

## 6. Entity Overview

> **Note:** Specific table schemas are not yet defined. The entities below represent the logical data model derived from the product requirements. Actual Prisma schema definitions must be created during implementation.

### Core Entities

| Entity | Description | Key Fields (TBD) |
|--------|-------------|------------------|
| **User** | Registered platform user | id, email, password hash, profile, notification preferences |
| **Event** | A geolocated safety incident (from Open Data or Community Report) | id, type, source, severity, location, status, timestamps |
| **CommunityReport** | A user-submitted event report | id, event_id, user_id, description, images, status |
| **HelpRequest** | A user's request for assistance | id, type, user_id, description, location, status |
| **FollowedArea** | A geographic area a user subscribes to | id, user_id, area_geometry, name |
| **Notification** | A notification sent to a user | id, user_id, event_id, type, read_at |
| **OpenDataFeed** | Metadata for an ingested Open Data event | id, source, external_id, raw_payload, ingested_at |

### Relationship Overview

> TODO: Document the full entity-relationship diagram (ERD) once the Prisma schema is defined.

---

## 7. Open Questions / TODO

| # | Question |
|---|----------|
| 1 | Which managed database provider will be used — **Supabase** or **Neon**? |
| 2 | How will PostGIS geometry columns be handled in Prisma schema (raw SQL migration or extension)? |
| 3 | Will soft deletes be implemented? If so, on which entities? |
| 4 | What is the full severity scale for events (e.g., Low / Medium / High / Critical) and how is severity assigned? |
| 5 | How are Open Data events de-duplicated (e.g., same earthquake from multiple feeds)? |
| 6 | How are Community Reports linked to Open Data events of the same incident? |
| 7 | What is the full state machine for Help Requests? |
| 8 | Will users have roles (e.g., user, moderator, admin)? How are they stored? |
| 9 | How is user location stored — live GPS, last known, or not stored? |
| 10 | Are images stored as Cloudinary URLs on the `CommunityReport` entity, or in a separate `Media` table? |
