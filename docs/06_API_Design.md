# 06 — API Design

> **Document Purpose:** Defines the API conventions, standard response format, authentication strategy, and architectural patterns for the GeoSpread backend. Specific endpoints will be documented here as they are designed and implemented.

---

## Table of Contents

1. [API Overview](#1-api-overview)
2. [Authentication](#2-authentication)
3. [Standard Response Format](#3-standard-response-format)
4. [Error Handling](#4-error-handling)
5. [Request Validation](#5-request-validation)
6. [Code Architecture](#6-code-architecture)
7. [Endpoint Reference](#7-endpoint-reference)
8. [Open Questions / TODO](#8-open-questions--todo)

---

## 1. API Overview

| Property | Value |
|----------|-------|
| **Protocol** | REST over HTTPS |
| **Data Format** | JSON |
| **Authentication** | JWT (Bearer token) |
| **Base URL (Production)** | TODO: Define after deployment |
| **Base URL (Development)** | TODO: Define (e.g., `http://localhost:3001/api/v1`) |
| **Versioning** | TODO: Define versioning strategy (e.g., URL path versioning `/api/v1/`) |

---

## 2. Authentication

GeoSpread uses **JSON Web Tokens (JWT)** for stateless authentication.

| Property | Detail |
|----------|--------|
| **Token type** | Bearer token |
| **Token location** | `Authorization: Bearer <token>` request header |
| **Token expiry** | TODO: Define access token TTL and refresh token strategy |
| **Refresh tokens** | TODO: Define whether refresh tokens are used |

### Protected vs. Public Endpoints

> TODO: Define which endpoints are public (no auth required) and which require a valid JWT.

---

## 3. Standard Response Format

**All** API responses — success and error — must conform to this structure:

```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {}
}
```

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | `true` for successful operations, `false` for errors |
| `message` | `string` | Human-readable status or error description |
| `data` | `object \| array \| null` | Response payload; `null` or omitted on error or empty responses |

### Success Example

```json
{
  "success": true,
  "message": "Event retrieved successfully",
  "data": {
    "id": "a1b2c3d4-...",
    "type": "Earthquake",
    "severity": "High",
    "location": { "lat": 13.7563, "lng": 100.5018 },
    "createdAt": "2026-07-14T10:00:00Z"
  }
}
```

### Error Example

```json
{
  "success": false,
  "message": "Validation failed: 'location' is required",
  "data": null
}
```

---

## 4. Error Handling

| HTTP Status | Meaning | When to Use |
|-------------|---------|-------------|
| `200 OK` | Success | Successful GET, PUT, PATCH |
| `201 Created` | Resource created | Successful POST creating a new resource |
| `400 Bad Request` | Validation error | Missing or invalid request parameters |
| `401 Unauthorized` | Not authenticated | Missing or invalid JWT |
| `403 Forbidden` | Not authorized | Authenticated but insufficient permissions |
| `404 Not Found` | Resource not found | Requested entity does not exist |
| `409 Conflict` | Conflict | Duplicate resource or state conflict |
| `422 Unprocessable Entity` | Business logic error | Valid syntax but failing business rules |
| `500 Internal Server Error` | Server error | Unexpected server-side failure |

> All error responses must use the [standard response format](#3-standard-response-format) with `"success": false`.

---

## 5. Request Validation

Every incoming request must be validated **before** reaching the Service layer.

| Rule | Detail |
|------|--------|
| **Validate all inputs** | Query parameters, path parameters, and request bodies must all be validated |
| **Fail fast** | Return `400 Bad Request` with a descriptive message immediately on validation failure |
| **Validation library** | TODO: Define the validation library to use (e.g., Zod, Joi, express-validator) |

---

## 6. Code Architecture

The backend follows a strict **three-layer architecture**:

```
HTTP Request
    ↓
Controller   — Parse request, validate input, call service, return response
    ↓
Service      — Business logic, orchestration, calls repository or external services
    ↓
Repository   — Database query abstraction via Prisma (used when needed)
    ↓
Database (PostgreSQL + PostGIS)
```

### Layer Responsibilities

| Layer | File Convention | Responsibility |
|-------|----------------|---------------|
| **Controller** | `*.controller.ts` | Validate input, delegate to service, format response |
| **Service** | `*.service.ts` | Business logic, rule enforcement, data orchestration |
| **Repository** | `*.repository.ts` | Encapsulate Prisma queries (only when service complexity warrants it) |

---

## 7. Endpoint Reference

> **Note:** The API endpoint specification has not yet been defined. Endpoints must be designed based on product requirements and documented here before implementation.

> TODO: Define all endpoints for the following feature areas:

### Authentication

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| TODO | `/auth/register` | Register a new user | No |
| TODO | `/auth/login` | Log in and receive JWT | No |
| TODO | `/auth/logout` | Invalidate session | Yes |
| TODO | `/auth/refresh` | Refresh access token | — |

---

### Events

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| TODO | `/events` | List/search events by area or radius | — |
| TODO | `/events/:id` | Get a single event by ID | — |

---

### Community Reports

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| TODO | `/reports` | Submit a community report | Yes |
| TODO | `/reports/:id` | Get a community report | — |

---

### Help Requests

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| TODO | `/help-requests` | Submit a help request | Yes |
| TODO | `/help-requests/:id` | Get a help request | — |
| TODO | `/help-requests/:id/accept` | Accept a help request | Yes |

---

### Followed Areas

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| TODO | `/areas` | List user's followed areas | Yes |
| TODO | `/areas` | Follow a new area | Yes |
| TODO | `/areas/:id` | Unfollow an area | Yes |

---

### User Profile

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| TODO | `/users/me` | Get current user profile | Yes |
| TODO | `/users/me` | Update profile | Yes |

---

### Notifications

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| TODO | `/notifications` | List user's notifications | Yes |
| TODO | `/notifications/:id/read` | Mark a notification as read | Yes |

---

### Admin

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| TODO | `/admin/reports` | List pending community reports | Admin |
| TODO | `/admin/reports/:id/approve` | Approve a report | Admin |
| TODO | `/admin/reports/:id/reject` | Reject a report | Admin |

---

## 8. Open Questions / TODO

| # | Question |
|---|----------|
| 1 | What is the API base URL and versioning strategy? |
| 2 | What is the JWT access token TTL? Are refresh tokens used? |
| 3 | Which validation library will be used (Zod, Joi, express-validator)? |
| 4 | Will pagination be used on list endpoints? If so, what strategy (cursor or offset)? |
| 5 | How will real-time map updates be delivered — WebSocket, SSE, or polling? |
| 6 | What are the rate limits for report submission and help request endpoints? |
| 7 | How does image upload work — does the client upload directly to Cloudinary, or via the backend? |
| 8 | What is the admin authentication mechanism — same JWT with a role claim, or separate admin credentials? |
