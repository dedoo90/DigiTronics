# PHASE24_TEST_STRATEGY.md
## DigiTronics V2 Enterprise Test Strategy

**Date:** 2026-08-05
**Status:** PLANNING ONLY
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
│  - Database operations                                      │
│  - Service interactions                                     │
├─────────────────────────────────────────────────────────────┤
│                     UNIT TESTS (60%)                        │
│  - Services                                                 │
│  - Repositories                                             │
│  - Middleware                                               │
│  - Utilities                                                │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Coverage Targets

| Component | Target | Minimum |
|-----------|--------|---------|
| Services | 90% | 80% |
| Repositories | 85% | 75% |
| Middleware | 95% | 90% |
| Routes | 80% | 70% |
| Overall | 85% | 75% |

---

## 2. UNIT TESTS

### 2.1 Service Tests

```javascript
// tests/unit/services/auth.service.test.js
describe('AuthService', () => {
  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'ValidPassword123!';
      const tenantSlug = 'test-tenant';
      
      // Act
      const result = await authService.login(email, password, tenantSlug);
      
      // Assert
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user.email).toBe(email);
    });
    
    it('should throw error for invalid credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'WrongPassword';
      const tenantSlug = 'test-tenant';
      
      // Act & Assert
      await expect(authService.login(email, password, tenantSlug))
        .rejects.toThrow('Invalid credentials');
    });
  });
});
```

### 2.2 Repository Tests

```javascript
// tests/unit/repositories/user.repository.test.js
describe('UserRepository', () => {
  describe('findByEmail', () => {
    it('should return user for valid email', async () => {
      // Arrange
      const email = 'test@example.com';
      
      // Act
      const user = await userRepository.findByEmail(email);
      
      // Assert
      expect(user).toBeDefined();
      expect(user.email).toBe(email);
    });
    
    it('should return null for non-existent email', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      
      // Act
      const user = await userRepository.findByEmail(email);
      
      // Assert
      expect(user).toBeNull();
    });
  });
});
```

### 2.3 Middleware Tests

```javascript
// tests/unit/middleware/authenticate.test.js
describe('authenticate middleware', () => {
  it('should pass valid token', async () => {
    // Arrange
    const req = { headers: { authorization: `Bearer ${validToken}` } };
    const res = {};
    const next = jest.fn();
    
    // Act
    await authenticate(req, res, next);
    
    // Assert
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });
  
  it('should reject invalid token', async () => {
    // Arrange
    const req = { headers: { authorization: 'Bearer invalid' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    
    // Act
    await authenticate(req, res, next);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
```

---

## 3. INTEGRATION TESTS

### 3.1 API Tests

```javascript
// tests/integration/auth/login.test.js
describe('POST /auth/login', () => {
  it('should return 200 for valid credentials', async () => {
    // Arrange
    const payload = {
      email: 'test@example.com',
      password: 'ValidPassword123!',
      tenant_slug: 'test-tenant'
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
      password: 'WrongPassword',
      tenant_slug: 'test-tenant'
    };
    
    // Act
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send(payload);
    
    // Assert
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
  
  it('should return 429 when rate limited', async () => {
    // Arrange
    const payload = {
      email: 'test@example.com',
      password: 'WrongPassword',
      tenant_slug: 'test-tenant'
    };
    
    // Act - Make 6 requests
    for (let i = 0; i < 6; i++) {
      await request(app)
        .post('/api/v1/auth/login')
        .send(payload);
    }
    
    // Assert
    expect(response.status).toBe(429);
  });
});
```

### 3.2 Database Tests

```javascript
// tests/integration/repositories/user.repository.test.js
describe('UserRepository', () => {
  beforeAll(async () => {
    await database.migrate.latest();
  });
  
  afterAll(async () => {
    await database.migrate.rollback();
    await database.destroy();
  });
  
  describe('create', () => {
    it('should create user in database', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        role: 'viewer',
        tenant_id: 'test-tenant-id'
      };
      
      // Act
      const user = await userRepository.create(userData);
      
      // Assert
      expect(user).toHaveProperty('id');
      expect(user.email).toBe(userData.email);
      
      // Verify in database
      const dbUser = await database('users').where({ id: user.id }).first();
      expect(dbUser).toBeDefined();
    });
  });
});
```

---

## 4. E2E TESTS

### 4.1 Critical User Flows

```javascript
// tests/e2e/auth-flow.test.js
describe('Authentication Flow', () => {
  it('should complete full login flow', async () => {
    // 1. Login
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'ValidPassword123!',
        tenant_slug: 'test-tenant'
      });
    
    expect(loginResponse.status).toBe(200);
    const { access_token, refresh_token } = loginResponse.body.data;
    
    // 2. Access protected resource
    const usersResponse = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${access_token}`);
    
    expect(usersResponse.status).toBe(200);
    
    // 3. Refresh token
    const refreshResponse = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refresh_token });
    
    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.data).toHaveProperty('access_token');
    
    // 4. Logout
    const logoutResponse = await request(app)
      .post('/api/v1/auth/logout')
      .send({ refresh_token });
    
    expect(logoutResponse.status).toBe(200);
  });
});
```

---

## 5. SECURITY TESTS

### 5.1 Authentication Tests

```javascript
// tests/security/auth.test.js
describe('Authentication Security', () => {
  it('should prevent brute force attacks', async () => {
    // Arrange
    const payload = {
      email: 'test@example.com',
      password: 'WrongPassword',
      tenant_slug: 'test-tenant'
    };
    
    // Act - Make 6 requests
    const responses = [];
    for (let i = 0; i < 6; i++) {
      responses.push(
        await request(app)
          .post('/api/v1/auth/login')
          .send(payload)
      );
    }
    
    // Assert - Last response should be rate limited
    expect(responses[5].status).toBe(429);
  });
  
  it('should prevent token replay attacks', async () => {
    // Arrange
    const token = await generateToken({ userId: 'test-user' });
    
    // Act - Use token twice
    const response1 = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`);
    
    // Blacklist token
    await blacklistToken(token);
    
    const response2 = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`);
    
    // Assert
    expect(response1.status).toBe(200);
    expect(response2.status).toBe(401);
  });
});
```

### 5.2 Authorization Tests

```javascript
// tests/security/authorization.test.js
describe('Authorization Security', () => {
  it('should prevent privilege escalation', async () => {
    // Arrange
    const viewerToken = await loginAs('viewer');
    const adminToken = await loginAs('admin');
    
    // Act - Viewer tries to access admin endpoint
    const response = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ email: 'new@example.com', name: 'New', role: 'admin' });
    
    // Assert
    expect(response.status).toBe(403);
  });
  
  it('should prevent cross-tenant access', async () => {
    // Arrange
    const tenant1Token = await loginAs('user@tenant1.com');
    
    // Act - Try to access tenant2 resources
    const response = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${tenant1Token}`)
      .query({ tenant_id: 'tenant2-id' });
    
    // Assert
    expect(response.status).toBe(403);
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
    const token = await loginAs('admin');
    const requests = [];
    
    // Act - Make 100 concurrent requests
    for (let i = 0; i < 100; i++) {
      requests.push(
        request(app)
          .get('/api/v1/users')
          .set('Authorization', `Bearer ${token}`)
      );
    }
    
    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const duration = Date.now() - startTime;
    
    // Assert
    expect(duration).toBeLessThan(5000); // 5 seconds
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  });
});
```

---

## 7. TEST UTILITIES

### 7.1 Test Helpers

```javascript
// tests/helpers/auth.helper.js
const generateToken = async (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const loginAs = async (role) => {
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: `${role}@test.com`,
      password: 'TestPassword123!',
      tenant_slug: 'test-tenant'
    });
  
  return response.body.data.access_token;
};
```

### 7.2 Test Fixtures

```javascript
// tests/fixtures/users.fixture.js
module.exports = {
  admin: {
    email: 'admin@test.com',
    name: 'Admin User',
    role: 'tenant_admin',
    tenant_id: 'test-tenant-id'
  },
  viewer: {
    email: 'viewer@test.com',
    name: 'Viewer User',
    role: 'viewer',
    tenant_id: 'test-tenant-id'
  }
};
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
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Run security tests
        run: npm run test:security
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
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
| Database | PostgreSQL (test) |
| Cache | Redis (test) |
| JWT Secret | Test secret |
| Rate Limiting | Disabled |

### 9.2 Test Database

```javascript
// tests/setup.js
beforeAll(async () => {
  await database.migrate.latest();
  await database.seed.run();
});

afterAll(async () => {
  await database.migrate.rollback();
  await database.destroy();
});
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
