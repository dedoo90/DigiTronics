# PHASE24_TEST_STRATEGY.md
## DigiTronics V2 Enterprise Test Strategy

**Date:** 2026-08-05
**Status:** REVISED - Aligned with Verified Architecture
**Phase:** 24 - API Foundation & Authentication

---

## 1. TEST OVERVIEW

### 1.1 Test Pyramid

```
┌─────────────────────────────────────────────────────────────┐
│                     E2E TESTS (10%)                         │
│  - Full user flows                                          │
│  - Critical paths                                           │
├─────────────────────────────────────────────────────────────┤
│                     INTEGRATION TESTS (30%)                 │
│  - API endpoints                                            │
│  - File operations                                          │
│  - Service interactions                                     │
├─────────────────────────────────────────────────────────────┤
│                     UNIT TESTS (60%)                        │
│  - Services                                                 │
│  - Utilities                                                │
│  - Middleware                                               │
│  - Helpers                                                 │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Coverage Targets

| Component | Target | Minimum |
|-----------|--------|---------|
| Services | 90% | 80% |
| Utilities | 85% | 75% |
| Middleware | 95% | 90% |
| Routes | 80% | 70% |
| Overall | 85% | 75% |

### 1.3 Test Environment

| Component | Technology | Status |
|-----------|------------|--------|
| Runtime | Node.js 22 | EXISTS |
| Framework | Jest | EXISTS |
| HTTP Testing | Supertest | EXISTS |
| E2E | Playwright | EXISTS |
| Data Persistence | JSON files (test) | EXISTS |
| Authentication | JWT (test) | EXISTS |

---

## 2. EXISTING TESTS (VERIFIED)

### 2.1 Backend Tests

| Test File | Purpose | Status |
|-----------|---------|--------|
| auth.test.js | Authentication endpoints | EXISTS |
| security.test.js | Security middleware | EXISTS |
| smoke.test.js | Smoke tests | EXISTS |
| health.test.js | Health endpoint | EXISTS |
| crud.test.js | CRUD operations | EXISTS |
| sales.test.js | Sales invoices | EXISTS |
| purchases.test.js | Purchase invoices | EXISTS |
| inventory.test.js | Inventory management | EXISTS |
| partnersVouchers.test.js | Partners & vouchers | EXISTS |
| dashboardReports.test.js | Dashboard & reports | EXISTS |
| middleware.test.js | Middleware behavior | EXISTS |
| fileStore.test.js | File persistence | EXISTS |
| sync.test.js | Sync operations | EXISTS |
| shutdown.test.js | Graceful shutdown | EXISTS |
| helpers.test.js | Test utilities | EXISTS |

### 2.2 Test Helpers

| Helper | Purpose | Status |
|--------|---------|--------|
| authHelper.js | Authentication utilities | EXISTS |
| cleanup.js | Test cleanup | EXISTS |
| testData.js | Test data generation | EXISTS |
| testServer.js | Test server setup | EXISTS |

---

## 3. UNIT TESTS

### 3.1 Service Tests

```javascript
// tests/unit/services/auth.service.test.js
describe('AuthService', () => {
  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'ValidPassword123!';
      
      // Act
      const result = await authService.login(email, password);
      
      // Assert
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user.email).toBe(email);
    });
    
    it('should throw error for invalid credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'WrongPassword';
      
      // Act & Assert
      await expect(authService.login(email, password))
        .rejects.toThrow('Invalid credentials');
    });
  });
});
```

### 3.2 Utility Tests

```javascript
// tests/unit/utils/jwt.test.js
describe('JWT Utils', () => {
  describe('signAccessToken', () => {
    it('should generate valid access token', () => {
      // Arrange
      const payload = { sub: 'user-123', role: 'admin' };
      
      // Act
      const token = signAccessToken(payload);
      
      // Assert
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });
  
  describe('verifyAccessToken', () => {
    it('should verify valid token', () => {
      // Arrange
      const payload = { sub: 'user-123', role: 'admin' };
      const token = signAccessToken(payload);
      
      // Act
      const decoded = verifyAccessToken(token);
      
      // Assert
      expect(decoded.sub).toBe('user-123');
      expect(decoded.role).toBe('admin');
    });
    
    it('should throw on invalid token', () => {
      // Arrange
      const invalidToken = 'invalid.token.here';
      
      // Act & Assert
      expect(() => verifyAccessToken(invalidToken)).toThrow();
    });
  });
});
```

### 3.3 Middleware Tests

```javascript
// tests/unit/middleware/auth.test.js
describe('Auth Middleware', () => {
  describe('requireAuth', () => {
    it('should pass with valid token', async () => {
      // Arrange
      const req = { headers: { authorization: `Bearer ${validToken}` } };
      const res = {};
      const next = jest.fn();
      
      // Act
      await requireAuth(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
    });
    
    it('should reject without token', async () => {
      // Arrange
      const req = { headers: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      
      // Act
      await requireAuth(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
```

---

## 4. INTEGRATION TESTS

### 4.1 API Endpoint Tests

```javascript
// tests/integration/auth/login.test.js
describe('POST /api/v1/auth/login', () => {
  it('should return 200 for valid credentials', async () => {
    // Arrange
    const payload = {
      email: 'test@example.com',
      password: 'ValidPassword123!'
    };
    
    // Act
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send(payload);
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('access_token');
  });
  
  it('should return 401 for invalid credentials', async () => {
    // Arrange
    const payload = {
      email: 'test@example.com',
      password: 'WrongPassword'
    };
    
    // Act
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send(payload);
    
    // Assert
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
```

### 4.2 File Persistence Tests

```javascript
// tests/integration/utils/fileStore.test.js
describe('FileStore', () => {
  describe('read', () => {
    it('should read existing file', async () => {
      // Arrange
      const filename = 'test.json';
      
      // Act
      const data = await fileStore.read(filename);
      
      // Assert
      expect(data).toBeDefined();
    });
    
    it('should return null for non-existent file', async () => {
      // Arrange
      const filename = 'nonexistent.json';
      
      // Act
      const data = await fileStore.read(filename);
      
      // Assert
      expect(data).toBeNull();
    });
  });
  
  describe('write', () => {
    it('should write data atomically', async () => {
      // Arrange
      const filename = 'test-write.json';
      const data = { test: 'data' };
      
      // Act
      await fileStore.write(filename, data);
      
      // Assert
      const readData = await fileStore.read(filename);
      expect(readData).toEqual(data);
    });
  });
});
```

---

## 5. E2E TESTS

### 5.1 Critical User Flows

```javascript
// tests/e2e/auth-flow.spec.js
describe('Authentication Flow', () => {
  it('should complete full login flow', async ({ page }) => {
    // 1. Navigate to login
    await page.goto('http://localhost:3000');
    
    // 2. Enter credentials
    await page.fill('#loginUser', 'test@example.com');
    await page.fill('#loginPass', 'ValidPassword123!');
    
    // 3. Click login
    await page.click('#loginBtn');
    
    // 4. Verify redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
```

---

## 6. PERFORMANCE TESTS

### 6.1 Load Tests

```javascript
// tests/performance/load.test.js
describe('API Performance', () => {
  it('should handle 100 concurrent requests', async () => {
    // Arrange
    const requests = [];
    
    // Act
    for (let i = 0; i < 100; i++) {
      requests.push(
        request(app)
          .get('/api/v1/health')
      );
    }
    
    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const duration = Date.now() - startTime;
    
    // Assert
    expect(duration).toBeLessThan(5000);
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  });
});
```

---

## 7. SECURITY TESTS

### 7.1 Authentication Security

```javascript
// tests/security/auth.test.js
describe('Authentication Security', () => {
  it('should prevent brute force attacks', async () => {
    // Arrange
    const payload = {
      email: 'test@example.com',
      password: 'WrongPassword'
    };
    
    // Act
    const responses = [];
    for (let i = 0; i < 6; i++) {
      responses.push(
        await request(app)
          .post('/api/v1/auth/login')
          .send(payload)
      );
    }
    
    // Assert
    expect(responses[5].status).toBe(429);
  });
});
```

---

## 8. TEST AUTOMATION

### 8.1 CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
      
      - name: Install dependencies
        run: npm ci
        working-directory: ./backend
      
      - name: Run unit tests
        run: npm run test:unit
        working-directory: ./backend
      
      - name: Run integration tests
        run: npm run test:integration
        working-directory: ./backend
      
      - name: Run security tests
        run: npm run test:security
        working-directory: ./backend
```

### 8.2 Test Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "jest --testPathPattern=e2e",
    "test:security": "jest --testPathPattern=security",
    "test:performance": "jest --testPathPattern=performance",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

---

## 9. TEST ENVIRONMENT

### 9.1 Environment Setup

| Component | Configuration |
|-----------|---------------|
| Data Persistence | JSON files (test directory) |
| JWT Secret | Test secret |
| Rate Limiting | Disabled for tests |
| Logging | Suppressed |

### 9.2 Test Data

```javascript
// tests/fixtures/users.fixture.js
module.exports = {
  admin: {
    email: 'admin@test.com',
    name: 'Admin User',
    role: 'Admin'
  },
  viewer: {
    email: 'viewer@test.com',
    name: 'Viewer User',
    role: 'Viewer'
  }
};
```

---

## 10. REPORTING

### 10.1 Test Reports

| Report | Tool | Output |
|--------|------|--------|
| Coverage | Jest | HTML/LCOV |
| Results | Jest | JUnit XML |
| Security | Jest | Console |

### 10.2 Coverage Thresholds

| Metric | Global | Per-file |
|--------|--------|----------|
| Statements | 85% | 80% |
| Branches | 80% | 75% |
| Functions | 85% | 80% |
| Lines | 85% | 80% |

---

**Document Generated:** 2026-08-05
**Status:** REVISED - Aligned with Verified Architecture
