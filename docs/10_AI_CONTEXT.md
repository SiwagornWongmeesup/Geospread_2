# 10 — AI Developer Context

> **Document Purpose:** Provides critical context for AI assistants (e.g., Copilot, Cursor, Claude) working on this codebase. This document defines the project's hard boundaries, rules, and constraints that AI must respect at all times.

---

## Table of Contents

1. [Project Identity](#1-project-identity)
2. [Technology Decisions — Non-Negotiable](#2-technology-decisions--non-negotiable)
3. [Hard Rules (Prohibited Actions)](#3-hard-rules-prohibited-actions)
4. [Required Actions](#4-required-actions)
5. [Architecture Reference](#5-architecture-reference)
6. [Code Quality Checklist](#6-code-quality-checklist)
7. [Where to Find Information](#7-where-to-find-information)

---

## 1. Project Identity

| Property | Value |
|----------|-------|
| **Project Name** | GeoSpread |
| **Type** | Location-based Community Safety Platform |
| **Primary Language** | TypeScript (used everywhere — frontend and backend) |
| **Core Problem** | Help users know what is happening in their area or an area they care about |

---

## 2. Technology Decisions — Non-Negotiable

These technology choices are final. Do not suggest replacing or removing them.

| Layer | Technology |
|-------|------------|
| Frontend Framework | Nuxt 4 + Vue 3 |
| Frontend Language | TypeScript |
| Frontend Styling | Tailwind CSS |
| Map | Mapbox |
| Backend Framework | Express.js |
| Backend Language | TypeScript |
| Database | PostgreSQL + PostGIS |
| ORM | Prisma |
| Authentication | JWT |
| Image Storage | Cloudinary |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |
| Database Host | Supabase PostgreSQL or Neon PostgreSQL |

---

## 3. Hard Rules (Prohibited Actions)

The following actions are **strictly prohibited** without explicit approval from the project owner:

| ❌ Prohibited Action | Why |
|---------------------|-----|
| Modifying the Prisma Schema or Database Schema without documented reason | Schema changes have cascading effects on data integrity and migrations |
| Deleting important files without prior notification | Irreversible and potentially destructive |
| Large-scale project structure refactoring without a written proposal | High risk, high impact, requires human review |
| Proceeding when uncertain | Incorrect assumptions compound technical debt |
| Storing secrets, API keys, or credentials in source code | Critical security violation |

---

## 4. Required Actions

| ✅ Required Action | When |
|------------------|------|
| Ask before making changes when uncertain | Always |
| Explain the rationale and impact before changing the architecture | Any architectural change |
| Propose a plan before large refactors | Any structural refactoring |
| Update API documentation after endpoint changes | After any API change |
| Update Database documentation after schema changes | After any schema change |
| Update README after adding a new feature | After any feature addition |
| Add an entry to CHANGELOG | After any significant change or release |

---

## 5. Architecture Reference

All layers are clearly separated. Do not mix responsibilities across layers.

### Frontend Layers

| Layer | File Location | Responsibility |
|-------|--------------|---------------|
| Pages | `pages/` | Route-level views only |
| Components | `components/` | Pure presentation components |
| Composables | `composables/` | Reusable stateful logic |
| Services | `services/` | API call wrappers and data transformation |

> Vue components must **not** contain business logic. Extract logic to composables or backend services.

### Backend Layers

| Layer | File Convention | Responsibility |
|-------|----------------|---------------|
| Controller | `*.controller.ts` | Parse request → validate → call service → return response |
| Service | `*.service.ts` | Business logic, orchestration |
| Repository | `*.repository.ts` | Prisma query abstraction (when needed) |

### Database Rules

- All schema changes go through **Prisma Migrations only**.
- All location data uses **PostGIS** types.
- Never modify the database directly with raw SQL if Prisma supports the operation.

---

## 6. Code Quality Checklist

Before submitting any code, verify all of the following:

- [ ] Zero TypeScript errors (`tsc --noEmit` passes)
- [ ] Zero ESLint errors or warnings
- [ ] No unused imports
- [ ] No use of `any` type unless unavoidable and documented
- [ ] All variables, functions, and files are descriptively named
- [ ] All API responses follow the standard `{ success, message, data }` format
- [ ] No secrets or API keys in source code — use `.env`
- [ ] Commit message follows Conventional Commits format

---

## 7. Where to Find Information

Use these documents before making assumptions:

| Question | Document |
|----------|---------|
| What is this project? | [01_Project_Vision.md](./01_Project_Vision.md) |
| What features are required? | [02_Product_Requirements.md](./02_Product_Requirements.md) |
| What is the tech stack and system design? | [03_System_Architecture.md](./03_System_Architecture.md) |
| What are the coding standards? | [04_Development_Guidelines.md](./04_Development_Guidelines.md) |
| How should I design the database? | [05_Database_Design.md](./05_Database_Design.md) |
| How should I design an API endpoint? | [06_API_Design.md](./06_API_Design.md) |
| How should a screen look and behave? | [07_UI_UX.md](./07_UI_UX.md) |
| What is in scope for MVP? | [08_Roadmap.md](./08_Roadmap.md) |
| How does Open Data ingestion work? | [09_Open_Data_Integration.md](./09_Open_Data_Integration.md) |
