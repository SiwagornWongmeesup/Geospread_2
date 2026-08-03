# 03 — System Architecture

> **Document Purpose:** Describes the overall system design, technology stack choices, component boundaries, and deployment topology for GeoSpread.

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Component Breakdown](#3-component-breakdown)
4. [Deployment Topology](#4-deployment-topology)
5. [Inter-Service Communication](#5-inter-service-communication)
6. [Third-Party Integrations](#6-third-party-integrations)
7. [Architecture Decisions](#7-architecture-decisions)

---

## 1. Technology Stack

### Frontend

| Technology | Role |
|------------|------|
| **Nuxt 4** | Full-stack Vue framework (SSR/SSG/SPA) |
| **Vue 3** | UI component framework |
| **TypeScript** | Type-safe application development |
| **Tailwind CSS** | Utility-first styling |
| **Mapbox** | Interactive map rendering and geospatial visualization |

### Backend

| Technology | Role |
|------------|------|
| **Express.js** | HTTP server and routing |
| **TypeScript** | Type-safe server-side development |
| **JWT** | Stateless authentication |

### Database

| Technology | Role |
|------------|------|
| **PostgreSQL** | Primary relational database |
| **PostGIS** | Geospatial extension for location queries and radius-based searches |
| **Prisma** | ORM — schema management, migrations, and type-safe queries |

### Infrastructure & Services

| Service | Purpose |
|---------|---------|
| **Cloudinary** | Image upload, storage, and delivery (CDN-backed) |
| **Vercel** | Frontend hosting and edge delivery |
| **Render** | Backend hosting |
| **Supabase PostgreSQL or Neon PostgreSQL** | Managed database hosting |

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                         │
│              Nuxt 4 + Vue 3 + Tailwind CSS + Mapbox             │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / REST API
┌────────────────────────────▼────────────────────────────────────┐
│                     Backend (Express.js)                        │
│           REST API · JWT Auth · Business Logic Layer            │
│                Controller → Service → Repository                │
└──────────┬──────────────────┬───────────────────────────────────┘
           │                  │
  ┌────────▼──────┐   ┌───────▼────────────────────────────────┐
  │  PostgreSQL   │   │         Third-Party Services            │
  │  + PostGIS    │   │  Cloudinary (images) · Mapbox (tiles)   │
  │  (Prisma ORM) │   │  Open Data Feeds (earthquake, flood…)   │
  └───────────────┘   └────────────────────────────────────────┘
```

---

## 3. Component Breakdown

### 3.1 Frontend (Nuxt 4)

The frontend is responsible for **presentation only**. Business logic must not be embedded in Vue components.

| Layer | Responsibility |
|-------|---------------|
| **Pages** | Route-level views (map page, feed page, profile, etc.) |
| **Components** | Reusable UI elements (event card, map pin, notification badge, etc.) |
| **Composables** | Reusable stateful logic (location tracking, auth state, area following) |
| **Services** | API call wrappers and data transformation |
| **Stores (Pinia)** | TODO: Confirm whether Pinia is used for global state management |

### 3.2 Backend (Express.js)

The backend follows a **layered architecture**:

| Layer | Responsibility |
|-------|---------------|
| **Controller** | Receives HTTP requests, validates input, delegates to Service |
| **Service** | Encapsulates business logic and orchestrates data operations |
| **Repository** | Abstracts database queries via Prisma (used when needed) |

> All requests must be validated before reaching the Service layer.  
> All responses must conform to the standard format — see [06_API_Design.md](./06_API_Design.md).

### 3.3 Database (PostgreSQL + PostGIS)

- All schema changes are managed exclusively through **Prisma Migrations**.
- **PostGIS** is used for all geospatial operations including:
  - Storing geo-tagged events and help requests.
  - Radius-based searches (e.g., "events within 10 km").
  - Area-following queries (e.g., "notify users following this polygon").
- Schema design follows **normalized relational principles** where appropriate.

---

## 4. Deployment Topology

| Component | Host | Notes |
|-----------|------|-------|
| **Frontend** | Vercel | Edge-deployed; automatic preview deployments on PR |
| **Backend** | Render | Always-on web service |
| **Database** | Supabase PostgreSQL or Neon PostgreSQL | Managed PostgreSQL with PostGIS support |
| **Images** | Cloudinary | CDN-backed; no images stored on the backend server |

> TODO: Define environment promotion strategy (development → staging → production).

> TODO: Confirm which managed database provider (Supabase or Neon) will be used, and document the rationale.

---

## 5. Inter-Service Communication

| From | To | Protocol | Notes |
|------|----|----------|-------|
| Frontend | Backend | HTTPS REST | JSON payloads |
| Backend | PostgreSQL | TCP (Prisma) | Via connection pool |
| Backend | Cloudinary | HTTPS | Image upload and deletion |
| Backend | Open Data APIs | HTTPS | Scheduled ingestion — see [09_Open_Data_Integration.md](./09_Open_Data_Integration.md) |
| Frontend | Mapbox | HTTPS | Map tile rendering and geocoding |

> TODO: Define WebSocket or Server-Sent Events (SSE) strategy for real-time map updates and notifications.

---

## 6. Third-Party Integrations

| Service | Integration Point | Documentation Reference |
|---------|------------------|--------------------------|
| **Mapbox** | Frontend — map rendering, geocoding, navigation | [07_UI_UX.md](./07_UI_UX.md) |
| **Cloudinary** | Backend — image upload endpoint | [06_API_Design.md](./06_API_Design.md) |
| **Open Data Feeds** | Backend — scheduled data ingestion | [09_Open_Data_Integration.md](./09_Open_Data_Integration.md) |
| **JWT** | Backend — stateless authentication middleware | [06_API_Design.md](./06_API_Design.md) |

---

## 7. Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Express.js over NestJS** | Specified in requirements; provides flexibility without framework overhead |
| **Prisma over raw SQL** | Type-safe queries, auto-generated types, migration management |
| **PostGIS for spatial queries** | Industry-standard extension; essential for radius search and area following |
| **Cloudinary for images** | Avoids binary storage in the database; provides CDN and transformation APIs |
| **Nuxt 4 over plain Vue** | Provides SSR/SSG options, file-based routing, and optimized production builds |

> **Rule:** Any change to the overall architecture must be proposed with a written explanation of rationale and impact before implementation. See [10_AI_CONTEXT.md](./10_AI_CONTEXT.md).
