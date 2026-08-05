# PHASE24_ARCHITECTURE.md
## DigiTronics V2 Enterprise API Foundation & Authentication Architecture

**Date:** 2026-08-05
**Status:** PLANNING ONLY
**Phase:** 24 - API Foundation & Authentication
**Governance:** Architecture Governance Edition

---

## 1. CURRENT STATE ANALYSIS

### 1.1 Existing System Summary

| Component | Current State | Gap |
|-----------|---------------|-----|
| **Backend** | None (client-side only) | CRITICAL |
| **API** | None (GitHub Gist sync only) | CRITICAL |
| **Authentication** | Plaintext in localStorage | CRITICAL |
| **Database** | localStorage (single JS object) | CRITICAL |
| **PWA** | Not implemented | HIGH |
| **Security** | Critical gaps | CRITICAL |

### 1.2 Critical Security Findings

| Finding | Severity | Location |
|---------|----------|----------|
| Plaintext passwords | CRITICAL | Line 2871 |
| Hardcoded credentials | CRITICAL | Lines 2813-2816 |
| Client-side auth only | CRITICAL | No server validation |
| No CSRF protection | HIGH | Global |
| No rate limiting | HIGH | Global |
| No input sanitization | HIGH | XSS vulnerable |

### 1.3 Migration Strategy

**Approach:** Strangler Fig Pattern

| Phase | Action |
|-------|--------|
| Phase 24 | Add API layer alongside existing system |
| Phase 25 | Migrate features to API |
| Phase 26-28 | Complete migration |
| Phase 29+ | Decommission legacy |

---

## 2. TARGET ARCHITECTURE

### 2.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────┤
│  Legacy SPA (CairoTech_v6.html)  │  New API Client          │
│  (Maintained for backward compat) │  (Fetch/Axios)           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API GATEWAY                             │
├─────────────────────────────────────────────────────────────┤
│  Rate Limiting  │  CORS  │  Auth  │  Validation            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  Express.js  │  Routes  │  Controllers  │  Services         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  Supabase (PostgreSQL)  │  Redis (Cache/Sessions)           │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Component Responsibilities

| Component | Responsibility | Technology |
|-----------|----------------|------------|
| **API Gateway** | Rate limiting, CORS, auth, validation | Express middleware |
| **Auth Service** | JWT, OAuth2, MFA, sessions | Passport.js, bcrypt |
| **User Service** | User CRUD, profiles | Custom service |
| **Tenant Service** | Multi-tenancy, isolation | Custom service |
| **Permission Service** | RBAC, permissions | Custom service |
| **Audit Service** | Logging, tracking | Custom service |

---

## 3. API DESIGN

### 3.1 API Versioning Strategy

| Version | Status | Base Path |
|---------|--------|-----------|
| v1 | Active | `/api/v1/` |
| v2 | Future | `/api/v2/` |

**Decision:** URL-based versioning
- **Reason:** Clear version identification, easy routing
- **Alternative:** Header-based versioning
- **Trade-off:** URLs are more visible but easier to debug
- **Long-term:** Support both URL and header for flexibility

### 3.2 API Structure

```
/api/v1/
├── auth/
│   ├── POST /login
│   ├── POST /register
│   ├── POST /logout
│   ├── POST /refresh
│   ├── POST /forgot-password
│   ├── POST /reset-password
│   ├── POST /mfa/enable
│   ├── POST /mfa/verify
│   └── POST /mfa/disable
├── users/
│   ├── GET /
│   ├── GET /:id
│   ├── POST /
│   ├── PUT /:id
│   ├── DELETE /:id
│   └── GET /me
├── tenants/
│   ├── GET /
│   ├── GET /:id
│   ├── POST /
│   ├── PUT /:id
│   └── DELETE /:id
├── roles/
│   ├── GET /
│   ├── GET /:id
│   ├── POST /
│   ├── PUT /:id
│   └── DELETE /:id
├── permissions/
│   ├── GET /
│   └── GET /matrix
├── audit/
│   ├── GET /
│   └── GET /:id
└── health/
    └── GET /
```

### 3.3 Response Format

```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "links": {
    "self": "/api/v1/users?page=1",
    "next": "/api/v1/users?page=2",
    "prev": null
  }
}
```

### 3.4 Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2026-08-05T12:00:00Z"
  }
}
```

---

## 4. AUTHENTICATION DESIGN

### 4.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT                                  │
├─────────────────────────────────────────────────────────────┤
│  1. User enters credentials                                 │
│  2. Client sends POST /auth/login                           │
│  3. Client receives access_token + refresh_token            │
│  4. Client stores tokens securely                           │
│  5. Client includes token in Authorization header           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API GATEWAY                             │
├─────────────────────────────────────────────────────────────┤
│  1. Validate JWT signature                                  │
│  2. Check token expiration                                  │
│  3. Extract user/tenant info                                │
│  4. Rate limit check                                        │
│  5. Forward to service                                      │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 JWT Token Structure

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "key-id-1"
  },
  "payload": {
    "sub": "user-uuid",
    "email": "user@example.com",
    "tenant_id": "tenant-uuid",
    "role": "manager",
    "permissions": ["products:read", "products:write"],
    "iat": 1691234567,
    "exp": 1691238167,
    "iss": "digitronics",
    "aud": "digitronics-api"
  }
}
```

### 4.3 Token Lifecycle

| Token | Lifetime | Storage | Refresh |
|-------|----------|---------|---------|
| Access Token | 15 minutes | Memory/HttpOnly cookie | No |
| Refresh Token | 7 days | HttpOnly cookie | Yes |
| MFA Token | 5 minutes | Memory | No |

### 4.4 Password Policy

| Rule | Requirement |
|------|-------------|
| Minimum length | 12 characters |
| Maximum length | 128 characters |
| Uppercase | At least 1 |
| Lowercase | At least 1 |
| Number | At least 1 |
| Special character | At least 1 |
| History | Last 5 passwords |
| Expiry | 90 days |

---

## 5. AUTHORIZATION DESIGN

### 5.1 RBAC Model

```
┌─────────────────────────────────────────────────────────────┐
│                     ROLE HIERARCHY                          │
├─────────────────────────────────────────────────────────────┤
│  Super Admin                                                │
│    └── Tenant Admin                                         │
│          ├── Manager                                        │
│          │     ├── Sales                                    │
│          │     ├── Warehouse                                │
│          │     └── Accountant                               │
│          └── Support                                        │
│                └── Viewer                                   │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Permission Structure

```json
{
  "resource:action": {
    "products:read": "View products",
    "products:write": "Create/edit products",
    "products:delete": "Delete products",
    "invoices:read": "View invoices",
    "invoices:write": "Create/edit invoices",
    "invoices:delete": "Delete invoices",
    "users:read": "View users",
    "users:write": "Create/edit users",
    "users:delete": "Delete users",
    "settings:read": "View settings",
    "settings:write": "Edit settings",
    "reports:read": "View reports",
    "reports:export": "Export reports",
    "audit:read": "View audit logs"
  }
}
```

### 5.3 Role-Permission Matrix

| Role | products | invoices | users | settings | reports | audit |
|------|----------|----------|-------|----------|---------|-------|
| Super Admin | CRUD | CRUD | CRUD | CRUD | R + E | R |
| Tenant Admin | CRUD | CRUD | CRUD | CRUD | R + E | R |
| Manager | CRUD | CRUD | R + U | R | R + E | - |
| Sales | R + U | CRUD | R | - | R | - |
| Warehouse | CRUD | R + U | - | - | - | - |
| Accountant | R | R + U | - | R | R + E | - |
| Support | R | R | - | - | R | - |
| Viewer | R | R | - | - | R | - |

---

## 6. MULTI-TENANCY DESIGN

### 6.1 Tenant Isolation

```
┌─────────────────────────────────────────────────────────────┐
│                     TENANT ISOLATION                        │
├─────────────────────────────────────────────────────────────┤
│  Request → JWT (tenant_id) → RLS Policy → Filtered Data    │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Tenant Model

```json
{
  "id": "uuid",
  "name": "Company Name",
  "slug": "company-slug",
  "settings": {},
  "plan": "enterprise",
  "status": "active",
  "created_at": "2026-08-05T00:00:00Z",
  "updated_at": "2026-08-05T00:00:00Z"
}
```

### 6.3 Branch Isolation

| Level | Isolation | Use Case |
|-------|-----------|----------|
| Tenant | Full | Different companies |
| Branch | Within tenant | Different locations |
| Warehouse | Within branch | Different warehouses |

---

## 7. SECURITY DESIGN

### 7.1 Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│  1. WAF / DDoS Protection (Cloudflare/AWS)                 │
├─────────────────────────────────────────────────────────────┤
│  2. Rate Limiting (express-rate-limit)                     │
├─────────────────────────────────────────────────────────────┤
│  3. CORS (whitelist origins)                               │
├─────────────────────────────────────────────────────────────┤
│  4. Helmet (security headers)                              │
├─────────────────────────────────────────────────────────────┤
│  5. JWT Authentication                                     │
├─────────────────────────────────────────────────────────────┤
│  6. RBAC Authorization                                     │
├─────────────────────────────────────────────────────────────┤
│  7. Input Validation (Joi/Zod)                             │
├─────────────────────────────────────────────────────────────┤
│  8. SQL Injection Prevention (parameterized queries)       │
├─────────────────────────────────────────────────────────────┤
│  9. XSS Prevention (output encoding)                       │
├─────────────────────────────────────────────────────────────┤
│  10. CSRF Protection (csurf)                               │
├─────────────────────────────────────────────────────────────┤
│  11. Audit Logging                                         │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /auth/login | 5 requests | 15 minutes |
| POST /auth/register | 3 requests | 1 hour |
| POST /auth/forgot-password | 3 requests | 1 hour |
| GET /api/* | 100 requests | 15 minutes |
| POST /api/* | 50 requests | 15 minutes |

### 7.3 CORS Configuration

```javascript
{
  origin: [
    'https://digitronics.app',
    'https://www.digitronics.app',
    'http://localhost:3000'  // Development only
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
}
```

### 7.4 Security Headers

| Header | Value |
|--------|-------|
| X-Content-Type-Options | nosniff |
| X-Frame-Options | DENY |
| X-XSS-Protection | 1; mode=block |
| Strict-Transport-Security | max-age=31536000; includeSubDomains |
| Content-Security-Policy | default-src 'self' |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | camera=(), microphone=() |

---

## 8. CACHING STRATEGY

### 8.1 Cache Layers

| Layer | Technology | TTL | Use Case |
|-------|------------|-----|----------|
| CDN | Cloudflare | 1 hour | Static assets |
| Application | Redis | 5 minutes | API responses |
| Database | Query cache | 1 minute | Frequent queries |

### 8.2 Cache Invalidation

| Event | Action |
|-------|--------|
| Data write | Invalidate related cache |
| Tenant update | Clear tenant cache |
| User update | Clear user cache |
| Role update | Clear permission cache |

---

## 9. MONITORING & OBSERVABILITY

### 9.1 Metrics

| Metric | Type | Description |
|--------|------|-------------|
| http_requests_total | Counter | Total requests |
| http_request_duration_seconds | Histogram | Request duration |
| auth_login_attempts_total | Counter | Login attempts |
| auth_login_failures_total | Counter | Failed logins |
| api_rate_limit_hits_total | Counter | Rate limit hits |

### 9.2 Logging

| Log Type | Level | Content |
|----------|-------|---------|
| Access | INFO | Request/response |
| Auth | INFO | Login/logout events |
| Security | WARN | Failed auth, rate limits |
| Error | ERROR | Application errors |

### 9.3 Alerting

| Alert | Condition | Severity |
|-------|-----------|----------|
| High error rate | > 5% 5xx errors | Critical |
| Auth failures | > 10 failures/minute | High |
| Rate limit hits | > 100/minute | Medium |
| Slow responses | > 2 seconds | Medium |

---

## 10. PERFORMANCE TARGETS

| Metric | Target | Measurement |
|--------|--------|-------------|
| API response time | < 200ms | p95 |
| Authentication | < 500ms | p95 |
| Database query | < 100ms | p95 |
| Concurrent users | 1000+ | Load test |
| Uptime | 99.9% | SLA |

---

## 11. TECHNOLOGY STACK

| Component | Technology | Reason |
|-----------|------------|--------|
| Runtime | Node.js 20 LTS | JavaScript consistency |
| Framework | Express.js | Mature, well-documented |
| Authentication | Passport.js | Flexible, plugins |
| JWT | jsonwebtoken | Industry standard |
| Password hashing | bcrypt | Secure, slow |
| Validation | Joi | Comprehensive |
| Rate limiting | express-rate-limit | Simple, effective |
| CORS | cors | Official package |
| Security | helmet | Security headers |
| Database | Supabase (PostgreSQL) | Existing infrastructure |
| Cache | Redis | Performance |
| Documentation | Swagger/OpenAPI | Industry standard |
| Testing | Jest + Supertest | Comprehensive |
| Logging | Winston | Structured logging |

---

## 12. DOCUMENTATION

| Document | Path |
|----------|------|
| Architecture | `Documentation/Phase24/PHASE24_ARCHITECTURE.md` |
| API Specification | `Documentation/Phase24/PHASE24_API_SPECIFICATION.md` |
| Authentication Design | `Documentation/Phase24/PHASE24_AUTHENTICATION_DESIGN.md` |
| Authorization Design | `Documentation/Phase24/PHASE24_AUTHORIZATION_DESIGN.md` |
| Permission Matrix | `Documentation/Phase24/PHASE24_PERMISSION_MATRIX.md` |
| Security Model | `Documentation/Phase24/PHASE24_SECURITY_MODEL.md` |
| Service Architecture | `Documentation/Phase24/PHASE24_SERVICE_ARCHITECTURE.md` |
| OpenAPI Strategy | `Documentation/Phase24/PHASE24_OPENAPI_STRATEGY.md` |
| Test Strategy | `Documentation/Phase24/PHASE24_TEST_STRATEGY.md` |
| Deployment Strategy | `Documentation/Phase24/PHASE24_DEPLOYMENT_STRATEGY.md` |
| Rollback Plan | `Documentation/Phase24/PHASE24_ROLLBACK_PLAN.md` |
| Risk Register | `Documentation/Phase24/PHASE24_RISK_REGISTER.md` |
| Gate A Report | `Documentation/Phase24/PHASE24_GATE_A_REPORT.md` |
| Master Report | `Documentation/Phase24/PHASE24_MASTER_REPORT.md` |
