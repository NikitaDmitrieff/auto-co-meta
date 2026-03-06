# Authentication & Authorization Patterns

Secure patterns for identity verification and access control.

## Authentication Methods

### Password-Based

#### Password Storage

```typescript
// ✅ Correct: bcrypt with cost factor
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

```typescript
// ✅ Alternative: Argon2id (recommended for new systems)
import argon2 from 'argon2';

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4
  });
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return argon2.verify(hash, password);
}
```

#### Password Requirements

```typescript
interface PasswordPolicy {
  minLength: 12;           // NIST recommends 8+, 12+ is better
  maxLength: 128;          // Prevent DoS on hashing
  requireUppercase: false; // NIST discourages complexity rules
  requireLowercase: false;
  requireNumbers: false;
  requireSpecial: false;
  checkCommonPasswords: true;  // Block common passwords
  checkBreached: true;         // Check Have I Been Pwned
}
```

```typescript
// Check against breached passwords
import crypto from 'crypto';

async function isPasswordBreached(password: string): Promise<boolean> {
  const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
  const prefix = sha1.substring(0, 5);
  const suffix = sha1.substring(5);
  
  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  const text = await response.text();
  
  return text.includes(suffix);
}
```

---

### JWT Authentication

#### Token Structure

```typescript
interface JWTPayload {
  sub: string;      // User ID (subject)
  iat: number;      // Issued at
  exp: number;      // Expiration
  jti: string;      // JWT ID (for revocation)
  iss: string;      // Issuer
  aud: string;      // Audience
  scope?: string;   // Permissions
}
```

#### Secure JWT Implementation

```typescript
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET!; // Strong secret, 256+ bits
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';

function generateAccessToken(user: User): string {
  return jwt.sign(
    {
      sub: user.id,
      scope: user.permissions.join(' '),
      jti: crypto.randomUUID()
    },
    JWT_SECRET,
    {
      algorithm: 'HS256',  // Or RS256 for asymmetric
      expiresIn: ACCESS_TOKEN_TTL,
      issuer: 'api.example.com',
      audience: 'example.com'
    }
  );
}

function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET, {
    algorithms: ['HS256'],  // Explicitly specify allowed algorithms
    issuer: 'api.example.com',
    audience: 'example.com',
    complete: false
  }) as JWTPayload;
}
```

#### Refresh Token Rotation

```typescript
interface RefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  familyId: string;  // Detect token reuse
  expiresAt: Date;
  createdAt: Date;
}

async function refreshTokens(refreshToken: string): Promise<TokenPair> {
  const tokenHash = hashToken(refreshToken);
  const storedToken = await RefreshToken.findOne({ tokenHash });
  
  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new Error('Invalid refresh token');
  }
  
  // Detect token reuse (potential theft)
  const familyTokens = await RefreshToken.find({ familyId: storedToken.familyId });
  if (familyTokens.some(t => t.id !== storedToken.id && t.createdAt > storedToken.createdAt)) {
    // Token reuse detected - invalidate entire family
    await RefreshToken.deleteMany({ familyId: storedToken.familyId });
    throw new Error('Token reuse detected');
  }
  
  // Rotate: invalidate old, create new
  await RefreshToken.delete({ id: storedToken.id });
  
  const newRefreshToken = await createRefreshToken(storedToken.userId, storedToken.familyId);
  const newAccessToken = generateAccessToken(await User.findById(storedToken.userId));
  
  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}
```

---

### Session-Based Authentication

#### Secure Session Configuration

```typescript
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET!,
  name: '__Host-session',  // Cookie prefix for additional security
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,          // HTTPS only
    httpOnly: true,        // No JS access
    sameSite: 'strict',    // CSRF protection
    maxAge: 24 * 60 * 60 * 1000,  // 24 hours
    domain: undefined,     // Current domain only
    path: '/'
  }
}));
```

#### Session Regeneration

```typescript
// Always regenerate session on login
app.post('/login', async (req, res) => {
  const user = await authenticateUser(req.body);
  
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'Session error' });
    
    req.session.userId = user.id;
    req.session.loginTime = Date.now();
    req.session.ip = req.ip;
    
    res.json({ success: true });
  });
});

// Validate session consistency
function validateSession(req: Request, res: Response, next: NextFunction) {
  if (req.session.ip && req.session.ip !== req.ip) {
    // IP changed - potential session hijacking
    req.session.destroy(() => {});
    return res.status(401).json({ error: 'Session invalid' });
  }
  next();
}
```

---

## Authorization Patterns

### Role-Based Access Control (RBAC)

```typescript
enum Role {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

interface User {
  id: string;
  roles: Role[];
}

function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User;
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const hasRole = roles.some(role => user.roles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

// Usage
app.delete('/api/users/:id', authenticate, requireRole(Role.ADMIN), deleteUser);
```

### Permission-Based Access Control

```typescript
enum Permission {
  READ_USERS = 'users:read',
  WRITE_USERS = 'users:write',
  DELETE_USERS = 'users:delete',
  READ_ORDERS = 'orders:read',
  WRITE_ORDERS = 'orders:write'
}

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.USER]: [Permission.READ_USERS, Permission.READ_ORDERS],
  [Role.ADMIN]: [Permission.READ_USERS, Permission.WRITE_USERS, Permission.READ_ORDERS, Permission.WRITE_ORDERS],
  [Role.SUPER_ADMIN]: Object.values(Permission)
};

function requirePermission(...permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User;
    const userPermissions = user.roles.flatMap(role => ROLE_PERMISSIONS[role]);
    
    const hasPermissions = permissions.every(p => userPermissions.includes(p));
    
    if (!hasPermissions) {
      return res.status(403).json({ 
        error: 'Missing required permissions',
        required: permissions
      });
    }
    
    next();
  };
}
```

### Resource-Based Authorization

```typescript
// Ownership check middleware
async function requireOwnership(resourceType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User;
    const resourceId = req.params.id;
    
    const resource = await getResource(resourceType, resourceId);
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Check ownership
    if (resource.userId !== user.id && !user.roles.includes(Role.ADMIN)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    req.resource = resource;
    next();
  };
}

// Usage
app.put('/api/posts/:id', authenticate, requireOwnership('post'), updatePost);
```

---

## Multi-Factor Authentication

### TOTP Implementation

```typescript
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// Generate secret for user
async function setupMFA(userId: string): Promise<{ secret: string; qrCode: string }> {
  const secret = speakeasy.generateSecret({
    name: `MyApp:${userId}`,
    issuer: 'MyApp'
  });
  
  const qrCode = await QRCode.toDataURL(secret.otpauth_url!);
  
  // Store secret (encrypted) temporarily until verified
  await MFASetup.create({
    userId,
    secret: encrypt(secret.base32),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  });
  
  return { secret: secret.base32, qrCode };
}

// Verify and enable MFA
async function verifyAndEnableMFA(userId: string, token: string): Promise<boolean> {
  const setup = await MFASetup.findOne({ userId });
  
  if (!setup || setup.expiresAt < new Date()) {
    throw new Error('MFA setup expired');
  }
  
  const secret = decrypt(setup.secret);
  
  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1  // Allow 1 step tolerance
  });
  
  if (verified) {
    await User.update(userId, { mfaSecret: setup.secret, mfaEnabled: true });
    await MFASetup.delete({ userId });
  }
  
  return verified;
}

// Verify TOTP during login
function verifyTOTP(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret: decrypt(secret),
    encoding: 'base32',
    token,
    window: 1
  });
}
```

### Recovery Codes

```typescript
async function generateRecoveryCodes(userId: string): Promise<string[]> {
  const codes = Array.from({ length: 10 }, () => 
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
  
  // Store hashed codes
  const hashedCodes = await Promise.all(
    codes.map(async code => ({
      hash: await bcrypt.hash(code, 10),
      used: false
    }))
  );
  
  await User.update(userId, { recoveryCodes: hashedCodes });
  
  // Return plain codes once - user must save them
  return codes;
}

async function useRecoveryCode(userId: string, code: string): Promise<boolean> {
  const user = await User.findById(userId);
  
  for (const storedCode of user.recoveryCodes) {
    if (!storedCode.used && await bcrypt.compare(code, storedCode.hash)) {
      storedCode.used = true;
      await user.save();
      return true;
    }
  }
  
  return false;
}
```

---

## Security Controls

### Account Lockout

```typescript
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

async function recordLoginAttempt(email: string, success: boolean): Promise<void> {
  const key = `login_attempts:${email}`;
  
  if (success) {
    await redis.del(key);
    return;
  }
  
  const attempts = await redis.incr(key);
  
  if (attempts === 1) {
    await redis.expire(key, LOCKOUT_DURATION / 1000);
  }
}

async function isAccountLocked(email: string): Promise<boolean> {
  const attempts = await redis.get(`login_attempts:${email}`);
  return parseInt(attempts || '0') >= MAX_ATTEMPTS;
}

// Middleware
async function checkAccountLock(req: Request, res: Response, next: NextFunction) {
  const { email } = req.body;
  
  if (await isAccountLocked(email)) {
    return res.status(429).json({
      error: 'Account temporarily locked',
      retryAfter: await redis.ttl(`login_attempts:${email}`)
    });
  }
  
  next();
}
```

### Password Reset Security

```typescript
async function requestPasswordReset(email: string): Promise<void> {
  const user = await User.findByEmail(email);
  
  // Don't reveal if email exists
  if (!user) {
    // Still "process" to prevent timing attacks
    await new Promise(r => setTimeout(r, 100 + Math.random() * 100));
    return;
  }
  
  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  await PasswordReset.create({
    userId: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    used: false
  });
  
  // Send email with token (not hash)
  await sendPasswordResetEmail(email, token);
}

async function resetPassword(token: string, newPassword: string): Promise<void> {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  const reset = await PasswordReset.findOne({
    tokenHash,
    used: false,
    expiresAt: { $gt: new Date() }
  });
  
  if (!reset) {
    throw new Error('Invalid or expired reset token');
  }
  
  // Mark token as used (single use)
  reset.used = true;
  await reset.save();
  
  // Update password
  const hash = await hashPassword(newPassword);
  await User.update(reset.userId, { passwordHash: hash });
  
  // Invalidate all sessions
  await Session.deleteMany({ userId: reset.userId });
}
```

---

## OAuth/OIDC Integration

### State Parameter (CSRF Prevention)

```typescript
async function initiateOAuth(req: Request, res: Response) {
  const state = crypto.randomBytes(32).toString('hex');
  
  // Store state in session
  req.session.oauthState = state;
  req.session.oauthReturnTo = req.query.returnTo || '/';
  
  const authUrl = new URL('https://provider.com/oauth/authorize');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('state', state);
  
  res.redirect(authUrl.toString());
}

async function handleOAuthCallback(req: Request, res: Response) {
  const { code, state } = req.query;
  
  // Verify state
  if (state !== req.session.oauthState) {
    return res.status(403).json({ error: 'Invalid state parameter' });
  }
  
  delete req.session.oauthState;
  
  // Exchange code for tokens
  const tokens = await exchangeCode(code as string);
  
  // Verify ID token
  const claims = await verifyIdToken(tokens.id_token);
  
  // Create or update user
  const user = await upsertOAuthUser(claims);
  
  // Create session
  req.session.userId = user.id;
  
  res.redirect(req.session.oauthReturnTo || '/');
}
```
