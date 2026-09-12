# GeoSpread custom Codex agents

The project keeps Antigravity's shared rules and skills in `.agents/`.
These TOML files add narrow, project-scoped Codex subagents; they do not
replace those rules or automatically spawn on every task.

| Agent | Use it for | Mode |
|---|---|---|
| `geospread_explorer` | Read-heavy code or document discovery | Read-only, low effort |
| `geospread_frontend` | Nuxt, Vue, Mapbox, responsive UI | Workspace write, medium effort |
| `geospread_backend` | Express, JWT, API, validation | Workspace write, medium effort |
| `geospread_reviewer` | Code review, security, regression and test gaps | Read-only, medium effort |

## Recommended use

- For a small feature, use one implementation agent only.
- For an unfamiliar issue, ask `geospread_explorer` to map the code first,
  then delegate the implementation to one worker.
- For a review, run `geospread_explorer` and `geospread_reviewer` in parallel
  only when their scopes are independent.
- Do not run both implementation workers against the same feature unless the
  API contract and file ownership have been split explicitly.

Example requests:

```text
Use geospread_explorer to trace the login flow and summarize the relevant files.

Delegate the responsive map-card change to geospread_frontend. Do not modify the backend.

Have geospread_reviewer review this branch for authentication and API-contract regressions.
```
