# 04 — Development Guidelines

> **Document Purpose:** Defines the coding standards, architectural conventions, Git workflow, security policies, and documentation practices that all contributors — human and AI — must follow.

---

## Table of Contents

1. [Code Structure](#1-code-structure)
2. [Code Quality Standards](#2-code-quality-standards)
3. [Project Boundaries](#3-project-boundaries)
4. [Database Rules](#4-database-rules)
5. [Git Workflow](#5-git-workflow)
6. [API Rules](#6-api-rules)
7. [Security Rules](#7-security-rules)
8. [Documentation Rules](#8-documentation-rules)

---

## 1. Code Structure

### 1.1 TypeScript Everywhere

TypeScript must be used in **all parts of the project** — frontend, backend, configuration files, and scripts.

### 1.2 Strict Layer Separation

Each architectural layer has a clearly defined responsibility. Do not cross these boundaries.

| Layer | Responsibility | Where |
|-------|---------------|-------|
| **Vue Components** | Presentation only — render data, emit events | Frontend |
| **Composables** | Reusable stateful logic | Frontend |
| **Services** | API call wrappers, data transformation | Frontend |
| **Controller** | Request parsing, input validation, response formation | Backend |
| **Service** | Business logic, orchestration | Backend |
| **Repository** | Database query abstraction (when needed) | Backend |

### 1.3 Presentation-Only Components

Vue components must focus on **rendering and user interaction**. They must not contain:

- Complex business logic
- Direct database or API calls (use composables or services instead)
- Large data transformation logic

> If a component is growing too complex, extract the logic into a composable or backend service.

---

## 2. Code Quality Standards

The following checks **must all pass** before any code is submitted or merged:

| Check | Rule |
|-------|------|
| **TypeScript** | Zero TypeScript errors (`tsc --noEmit`) |
| **ESLint** | Zero ESLint errors or warnings |
| **Unused Imports** | No unused import statements |
| **Type Safety** | Use explicit types; avoid `any` unless there is a documented, unavoidable reason |
| **Naming** | Files, variables, functions, and types must be named descriptively and in English |

> TODO: Define the ESLint configuration and extend rules (e.g., `@typescript-eslint/recommended`, `vue/recommended`).

> TODO: Define whether Prettier is used for formatting and specify the configuration.

---

## 3. Project Boundaries

These rules apply to **all contributors**, including AI assistants.

### ❌ Prohibited Actions

| Action | Rule |
|--------|------|
| Modify Prisma Schema or Database Schema | Not allowed without a clear, documented reason |
| Delete important files | Not allowed without prior notification and approval |
| Large-scale project structure refactoring | Not allowed without first proposing a written plan |
| Proceeding when uncertain | When in doubt, ask before making any changes |

### ✅ Required Actions

| Action | Rule |
|--------|------|
| Changing the architecture | Must provide a written explanation of the rationale and the impact before implementation |

> For AI-specific context and boundaries, see [10_AI_CONTEXT.md](./10_AI_CONTEXT.md).

---

## 4. Database Rules

| Rule | Detail |
|------|--------|
| **Use Prisma Migrations** | Every schema change must go through `prisma migrate dev` or `prisma migrate deploy` — never applied manually |
| **No direct SQL edits** | Do not modify the database schema directly with raw SQL if Prisma supports the operation |
| **Use PostGIS for spatial work** | All location storage, radius searches, and geographic queries must use PostGIS extensions |
| **Normalized design** | Relational data must be designed with appropriate normalization — avoid denormalization unless there is a performance justification |

> For full schema design details, see [05_Database_Design.md](./05_Database_Design.md).

---

## 5. Git Workflow

### 5.1 Commit Message Convention

All commits must follow the **Conventional Commits** specification:

```
<type>: <short description>
```

| Type | When to Use |
|------|-------------|
| `feat` | Adding a new feature |
| `fix` | Fixing a bug |
| `refactor` | Restructuring code without changing behavior |
| `docs` | Documentation changes only |
| `style` | Formatting changes (no logic change) |
| `test` | Adding or updating tests |

**Examples:**

```
feat: add radius-based event filtering on map
fix: correct JWT expiry handling in auth middleware
docs: update API response format in 06_API_Design.md
refactor: extract event ranking logic to EventRankingService
```

### 5.2 Branching Strategy

> TODO: Define the branching strategy (e.g., `main` / `develop` / `feature/*` / `hotfix/*`).

### 5.3 Pull Request Rules

> TODO: Define PR review requirements (e.g., required reviewers, CI checks that must pass before merge).

---

## 6. API Rules

All API development must follow these conventions. For the full API specification, see [06_API_Design.md](./06_API_Design.md).

| Rule | Detail |
|------|--------|
| **Protocol** | REST API over HTTPS |
| **Architecture** | Layered: Controller → Service → Repository |
| **Validation** | Every incoming request must be validated before processing |
| **Response format** | All responses must follow the unified response structure (see below) |

### Standard Response Format

All API endpoints must return responses in the following format:

```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {}
}
```

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | `true` on success, `false` on error |
| `message` | `string` | Human-readable status message |
| `data` | `object \| array \| null` | Response payload; `null` or empty `{}` if not applicable |

> Error responses must also follow this format with `"success": false` and an appropriate `message`.

---

## 7. Security Rules

| Rule | Detail |
|------|--------|
| **No secrets in source code** | API keys, tokens, passwords, and any sensitive credentials must never be committed to version control |
| **Use environment variables** | All sensitive configuration must be stored in `.env` files and accessed via `process.env` |
| **`.env` in `.gitignore`** | Ensure `.env` and all environment-specific files are listed in `.gitignore` |
| **`.env.example`** | Maintain a `.env.example` file with all required variable names (but no real values) for onboarding |

> TODO: Define environment variable naming conventions (e.g., prefix by service: `MAPBOX_API_KEY`, `CLOUDINARY_SECRET`).

---

## 8. Documentation Rules

Documentation must be kept in sync with the codebase at all times.

| Trigger | Required Updates |
|---------|-----------------|
| Adding a new feature | Update the project `README.md` and the relevant `docs/` files |
| Adding or modifying an API endpoint | Update [06_API_Design.md](./06_API_Design.md) |
| Changing the database schema | Update [05_Database_Design.md](./05_Database_Design.md) |
| Changing the architecture | Update [03_System_Architecture.md](./03_System_Architecture.md) |
| Any release or significant change | Add an entry to [CHANGELOG.md](./CHANGELOG.md) |
