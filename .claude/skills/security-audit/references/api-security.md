# API Security

Security considerations specific to API endpoints.

## Input Validation

### Schema Validation

```typescript
import { z } from 'zod';

// Define strict schemas
const CreateUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150).optional(),
  role: z.enum(['user', 'admin']).default('user')
}).strict(); // Reject unknown properties

// Validation middleware
function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues.map(i => ({
          path: i.path.join('.'),
          message: i.message
        }))
      });
    }
    
    req.body = result.data; // Use validated data
    next();
  };
}

// Usage
app.post('/users', validate(CreateUserSchema), createUser);
```

### Input Sanitization

```typescript
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Sanitize HTML input
function sanitizeHTML(input: string): string {
  return purify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
}

// Sanitize for SQL (use parameterized queries instead)
function sanitizeSQL(input: string): string {
  // DON'T DO THIS - use parameterized queries
  // This is just to show what NOT to do
  return input.replace(/['";\\]/g, '');
}

// Sanitize filename
function sanitizeFilename(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
}
```

### Content-Type Validation

```typescript
function requireJSON(req: Request, res: Response, next: NextFunction) {
  const contentType = req.headers['content-type'];
  
  if (!contentType?.includes('application/json')) {
    return res.status(415).json({
      error: 'Unsupported Media Type',
      message: 'Content-Type must be application/json'
    });
  }
  
  next();
}

// Apply to all API routes
app.use('/api', requireJSON);
```

---

## Rate Limiting

### Basic Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Too many requests',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: 'Too many authentication attempts',
    retryAfter: 900
  },
  skipSuccessfulRequests: true
});

// Expensive operations
const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    error: 'Export rate limit exceeded',
    retryAfter: 3600
  }
});

// Apply
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/export', exportLimiter);
```

### Redis-Based Rate Limiting

```typescript
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });

const rateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix: 'rl:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

### Per-User Rate Limiting

```typescript
const userLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  keyGenerator: (req) => {
    // Rate limit by user ID, fall back to IP
    return req.user?.id || req.ip;
  }
});
```

---

## CORS Configuration

### Secure CORS Setup

```typescript
import cors from 'cors';

// Production CORS
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://app.example.com',
      'https://admin.example.com'
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'X-RateLimit-Remaining'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
```

### CORS Security Checklist

| Setting | Insecure | Secure |
|---------|----------|--------|
| origin | `'*'` | Explicit allowlist |
| credentials | `true` with `origin: '*'` | `true` only with specific origins |
| methods | All methods | Only required methods |
| allowedHeaders | `'*'` | Specific headers |

---

## Security Headers

### Helmet Configuration

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.example.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  originAgentCluster: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
}));
```

### Manual Headers

```typescript
app.use((req, res, next) => {
  // Prevent caching of sensitive data
  if (req.path.startsWith('/api/')) {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }
  
  // API-specific headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '0' // Disabled, use CSP instead
  });
  
  next();
});
```

---

## Error Handling

### Secure Error Responses

```typescript
// Custom error class
class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

// Error handler middleware
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // Generate request ID
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  
  // Log full error internally
  console.error({
    requestId,
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id
  });
  
  // Send sanitized response
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId
      }
    });
  }
  
  // Generic error - don't leak details
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      requestId
    }
  });
}

app.use(errorHandler);
```

### Error Information Disclosure

```typescript
// ❌ Leaks information
res.status(500).json({
  error: 'Database connection failed: ECONNREFUSED 10.0.0.1:5432',
  stack: err.stack
});

// ❌ Reveals user existence
res.status(404).json({ error: 'User admin@example.com not found' });

// ✅ Generic error
res.status(500).json({
  error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' }
});

// ✅ Don't reveal user existence
res.status(401).json({
  error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
});
```

---

## Request Size Limits

```typescript
import express from 'express';

// Global limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Larger limit for specific routes
app.use('/api/upload', express.json({ limit: '50mb' }));

// File upload limits
import multer from 'multer';

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5,
    fields: 10
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Invalid file type'));
      return;
    }
    
    cb(null, true);
  }
});
```

---

## API Versioning Security

### Version-Specific Security

```typescript
// Deprecation headers
function apiVersion(version: string, deprecated = false) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.set('API-Version', version);
    
    if (deprecated) {
      res.set('Deprecation', 'true');
      res.set('Sunset', '2024-12-31');
      res.set('Link', '</api/v2/docs>; rel="successor-version"');
    }
    
    next();
  };
}

// Block deprecated endpoints
function blockDeprecated(sunsetDate: Date) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (new Date() > sunsetDate) {
      return res.status(410).json({
        error: {
          code: 'ENDPOINT_REMOVED',
          message: 'This API version has been removed',
          migrationGuide: 'https://docs.example.com/api/v2/migration'
        }
      });
    }
    next();
  };
}
```

---

## Webhook Security

### Signature Verification

```typescript
import crypto from 'crypto';

// Verify incoming webhook
function verifyWebhookSignature(secret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers['x-webhook-signature'] as string;
    const timestamp = req.headers['x-webhook-timestamp'] as string;
    
    if (!signature || !timestamp) {
      return res.status(401).json({ error: 'Missing signature' });
    }
    
    // Check timestamp (prevent replay attacks)
    const age = Date.now() - parseInt(timestamp);
    if (age > 5 * 60 * 1000) { // 5 minutes
      return res.status(401).json({ error: 'Request too old' });
    }
    
    // Verify signature
    const payload = `${timestamp}.${JSON.stringify(req.body)}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    if (!crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    next();
  };
}

// Sign outgoing webhook
async function sendWebhook(url: string, payload: unknown, secret: string) {
  const timestamp = Date.now().toString();
  const body = JSON.stringify(payload);
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('hex');
  
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
      'X-Webhook-Timestamp': timestamp
    },
    body
  });
}
```

---

## GraphQL Security

### Query Complexity Limiting

```typescript
import { createComplexityLimitRule } from 'graphql-validation-complexity';

const complexityLimit = createComplexityLimitRule(1000, {
  onCost: (cost) => console.log('Query cost:', cost),
  formatErrorMessage: (cost) => 
    `Query too complex: ${cost}. Maximum allowed: 1000`
});

const server = new ApolloServer({
  schema,
  validationRules: [complexityLimit]
});
```

### Depth Limiting

```typescript
import depthLimit from 'graphql-depth-limit';

const server = new ApolloServer({
  schema,
  validationRules: [depthLimit(5)]
});
```

### Introspection Control

```typescript
const server = new ApolloServer({
  schema,
  introspection: process.env.NODE_ENV !== 'production'
});
```

---

## API Security Checklist

### Authentication
- [ ] All endpoints require authentication (except public)
- [ ] Tokens have reasonable expiration
- [ ] Token refresh mechanism works
- [ ] Logout invalidates tokens

### Authorization
- [ ] Every endpoint has explicit authorization
- [ ] Resource ownership is verified
- [ ] No IDOR vulnerabilities
- [ ] Admin functions protected

### Input Validation
- [ ] All input validated against schema
- [ ] Request size limits configured
- [ ] File uploads validated
- [ ] No SQL/NoSQL injection

### Rate Limiting
- [ ] Global rate limit
- [ ] Auth endpoint rate limit
- [ ] Per-user rate limiting
- [ ] Expensive operation limits

### Headers & CORS
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] No sensitive data in headers

### Error Handling
- [ ] No stack traces in responses
- [ ] No internal details leaked
- [ ] Consistent error format
- [ ] Request IDs for debugging

### Logging
- [ ] Security events logged
- [ ] No sensitive data in logs
- [ ] Request IDs correlate
