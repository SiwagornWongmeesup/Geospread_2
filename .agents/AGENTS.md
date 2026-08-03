# GeoSpread — AI Agent Rules

> This file is auto-loaded by AI coding assistants (Antigravity, Cursor, Copilot, etc.) to enforce
> project-wide rules and conventions for the GeoSpread workspace.

---

## Project Identity

**GeoSpread** is a **Location-based Community Safety Platform** built with TypeScript throughout.

- Users receive real-time alerts about events near them or in areas they follow
- Users can submit community reports and request / offer help during emergencies
- Data comes from two sources: authoritative **Open Data feeds** and **Community Reports**

---

## Technology Stack — Non-Negotiable

Do **not** suggest replacing any of these. All decisions are final.

| Layer | Technology |
|---|---|
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

## Hard Rules — Prohibited Actions

| ❌ Prohibited | Reason |
|---|---|
| Modify Prisma schema without a documented reason | Schema changes cascade across migrations and data integrity |
| Delete any file without prior notification | Irreversible action |
| Large-scale project restructuring without a written proposal | High risk, requires human review |
| Proceed when uncertain | Ask first — incorrect assumptions compound technical debt |
| Store secrets / API keys in source code | Critical security violation |

---

## Required Actions

| ✅ Required | When |
|---|---|
| Ask before making changes when uncertain | Always |
| Write an explanation of rationale before any architectural change | Any structural change |
| Propose a plan before large refactors | Before executing |
| Update `docs/06_API_Design.md` after any endpoint change | After every API change |
| Update `docs/05_Database_Design.md` after any schema change | After every schema change |
| Update `docs/README.md` after adding a new feature | After every feature addition |
| Add an entry to `docs/CHANGELOG.md` | After any significant change or release |

---

## Architecture Rules

All layers must stay strictly separated. Do not mix responsibilities.

### Backend (Express.js)

```
Controller  → parse request, validate input, call service, return response
Service     → business logic, orchestration
Repository  → Prisma query abstraction (only when needed)
```

File naming: `*.controller.ts`, `*.service.ts`, `*.repository.ts`

### Frontend (Nuxt 4 + Vue 3)

```
pages/          → route-level views ONLY
components/     → pure presentation (no business logic)
composables/    → reusable stateful logic
services/       → API call wrappers and data transformation
```

> Vue components **must not** contain business logic. Extract to composables or services.

### Database

- All schema changes via **Prisma Migrations only** (`prisma migrate dev`)
- Never modify the schema with raw SQL if Prisma supports the operation
- All location data must use **PostGIS** types

---

## API Response Format

Every endpoint must return this exact structure:

```json
{
  "success": true,
  "message": "Human-readable status",
  "data": {}
}
```

Error responses use `"success": false` with an appropriate `message`.

---

## Code Quality — Must Pass Before Any Commit

- [ ] Zero TypeScript errors (`tsc --noEmit`)
- [ ] Zero ESLint errors or warnings
- [ ] No unused imports
- [ ] No `any` type unless unavoidable and documented
- [ ] All names are descriptive and in English
- [ ] No secrets in source code — use `.env`
- [ ] Commit message follows **Conventional Commits**: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`

---

## Documentation Index

Before making assumptions, read the relevant doc:

| Question | Document |
|---|---|
| What is this project? | `docs/01_Project_Vision.md` |
| What features are required? | `docs/02_Product_Requirements.md` |
| Tech stack and system design? | `docs/03_System_Architecture.md` |
| Coding standards and conventions? | `docs/04_Development_Guidelines.md` |
| Database schema design? | `docs/05_Database_Design.md` |
| API endpoint design? | `docs/06_API_Design.md` |
| UI/UX patterns? | `docs/07_UI_UX.md` |
| MVP scope and roadmap? | `docs/08_Roadmap.md` |
| Open Data ingestion? | `docs/09_Open_Data_Integration.md` |
| AI-specific rules and context? | `docs/10_AI_CONTEXT.md` |
