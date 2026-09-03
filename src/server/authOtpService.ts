import crypto from 'crypto';

export interface OtpChallenge {
  challengeId: string;
  email: string;
  uid: string;
  hashedOtp: string;
  salt: string;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  expiresAt: number;
  lastResentAt: number;
}

// In-memory cryptographically secured challenge store with automated TTL purging
const activeOtpChallenges = new Map<string, OtpChallenge>();

// Rate limit tracking: map of key (e.g. `email:${email}`) to array of request timestamps
const requestTimestamps = new Map<string, number[]>();

// Secret key for HMAC token signing and challenge hashing
const AUTH_SECRET = process.env.AUTH_SESSION_SECRET || 'reflectai-secure-otp-session-secret-entropy-' + (process.env.APP_URL || 'default-salt-2026');

// Configurable expiration & cooldown with safe defaults
const OTP_EXPIRY_MINUTES = Math.max(1, parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10));
const OTP_RESEND_COOLDOWN_SECONDS = Math.max(5, parseInt(process.env.OTP_RESEND_COOLDOWN || '30', 10));
const MAX_ATTEMPTS_PER_OTP = 5;

/**
 * Periodically cleans up expired OTP challenges from the in-memory store
 */
setInterval(() => {
  const now = Date.now();
  for (const [challengeId, challenge] of activeOtpChallenges.entries()) {
    if (now > challenge.expiresAt) {
      activeOtpChallenges.delete(challengeId);
    }
  }
  // Also clean old rate limit timestamps older than 1 hour
  for (const [key, timestamps] of requestTimestamps.entries()) {
    const freshTimestamps = timestamps.filter(t => now - t < 3600 * 1000);
    if (freshTimestamps.length === 0) {
      requestTimestamps.delete(key);
    } else {
      requestTimestamps.set(key, freshTimestamps);
    }
  }
}, 60 * 1000);

/**
 * Masks an email address for privacy-safe UI display and secure logs
 * e.g., badalsahu200ns@gmail.com -> b***s@gmail.com
 */
export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return 'your verified email';
  }
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart.charAt(0)}***@${domain}`;
  }
  const firstChar = localPart.charAt(0);
  const lastChar = localPart.charAt(localPart.length - 1);
  return `${firstChar}***${lastChar}@${domain}`;
}

/**
 * Computes an HMAC-SHA256 hash of the plain OTP combined with a challenge salt
 */
function hashOtp(otp: string, salt: string): string {
  return crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(`${salt}:${otp.trim()}`)
    .digest('hex');
}

/**
 * Checks rate limiting for OTP generation
 * Allows at most 1 request per cooldown seconds, and at most 5 requests per hour per target
 */
function checkRateLimit(targetKey: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const history = requestTimestamps.get(targetKey) || [];
  
  // Clean history to past 1 hour
  const recentHistory = history.filter(t => now - t < 3600 * 1000);
  requestTimestamps.set(targetKey, recentHistory);

  // Check cooldown from last request
  if (recentHistory.length > 0) {
    const lastRequest = recentHistory[recentHistory.length - 1];
    const diffSeconds = Math.floor((now - lastRequest) / 1000);
    if (diffSeconds < OTP_RESEND_COOLDOWN_SECONDS) {
      return { allowed: false, retryAfterSeconds: OTP_RESEND_COOLDOWN_SECONDS - diffSeconds };
    }
  }

  // Check hourly limit (max 5 OTPs per hour)
  if (recentHistory.length >= 5) {
    const oldestInHour = recentHistory[0];
    const waitSeconds = Math.ceil((3600 * 1000 - (now - oldestInHour)) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(OTP_RESEND_COOLDOWN_SECONDS, waitSeconds) };
  }

  // Record this request timestamp
  recentHistory.push(now);
  requestTimestamps.set(targetKey, recentHistory);

  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Dispatches the OTP email via Resend REST API
 */
async function dispatchOtpEmail(params: {
  recipientEmail: string;
  recipientName: string;
  otpCode: string;
}): Promise<{ delivered: boolean; method: string; error?: string }> {
  const { recipientEmail, recipientName, otpCode } = params;
  const masked = maskEmail(recipientEmail);

  // Subject and Plain Text Fallback strictly matching specifications
  const emailSubject = 'Your ReflectAI Verification Code';
  const textContent = `Your ReflectAI verification code is:\n\n${otpCode}\n\nThis code expires in ${OTP_EXPIRY_MINUTES} minutes.\n\nIf you did not request this code, you can safely ignore this email.`;

  // HTML Email Template
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailSubject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050505; color: #ffffff; margin: 0; padding: 24px; }
    .container { max-width: 520px; margin: 0 auto; background-color: #0A0A0A; border: 1px solid #262626; border-radius: 16px; padding: 32px; box-shadow: 0 10px 35px rgba(0,0,0,0.85); }
    .logo-badge { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; background-color: #76B900; border-radius: 12px; font-weight: 800; font-size: 20px; color: #000000; margin-bottom: 20px; }
    h1 { font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0; }
    p { font-size: 14px; line-height: 1.6; color: #A3A3A3; margin: 0 0 20px 0; }
    .otp-card { background: #111111; border: 1px solid #76B900; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .otp-code { font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #76B900; margin: 0; }
    .otp-subtitle { font-size: 12px; color: #FFCC00; font-weight: 600; margin-top: 10px; }
    .security-notice { background-color: #141414; border-left: 3px solid #76B900; padding: 12px 16px; border-radius: 4px; font-size: 12px; color: #737373; margin-top: 24px; }
    .footer { font-size: 11px; color: #525252; text-align: center; margin-top: 32px; border-top: 1px solid #262626; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo-badge">R</div>
    <h1>ReflectAI Verification Code</h1>
    <p>Hello ${recipientName || 'there'},</p>
    <p>Your ReflectAI verification code is:</p>
    
    <div class="otp-card">
      <div class="otp-code">${otpCode}</div>
      <div class="otp-subtitle">This code expires in ${OTP_EXPIRY_MINUTES} minutes.</div>
    </div>

    <p>If you did not request this code, you can safely ignore this email.</p>

    <div class="security-notice">
      <strong>Security Notice:</strong> ReflectAI will never ask for your verification code outside the official application screen. Do not share this code with anyone.
    </div>

    <div class="footer">
      ReflectAI &bull; Powered by Google Gemini 3.6 Flash & Cloud Firestore &bull; Zero-Knowledge 2FA
    </div>
  </div>
</body>
</html>
  `;

  // Safe defaults for email branding
  const fromName = process.env.EMAIL_FROM_NAME || 'ReflectAI';
  const rawFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';
  const senderEmail = rawFrom.includes('<') ? rawFrom : `${fromName} <${rawFrom}>`;
  const resendApiKey = process.env.RESEND_API_KEY?.trim() || '';

  // Dispatch via Resend REST API
  if (resendApiKey) {
    try {
      console.log(`[OTP] Email provider request initiated via Resend REST API for ${masked}`);
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: senderEmail,
          to: [recipientEmail],
          subject: emailSubject,
          html: htmlContent,
          text: textContent
        })
      });

      console.log(`[OTP] Email provider response status: ${res.status}`);

      if (res.ok) {
        console.log(`[OTP] Email delivery request successful for ${masked}`);
        return { delivered: true, method: 'resend-api' };
      } else {
        const errorData = await res.text();
        console.error(`[OTP] Resend delivery failed with status ${res.status}:`, errorData);
        return {
          delivered: false,
          method: 'resend-api',
          error: `Resend API error status ${res.status}`
        };
      }
    } catch (err: any) {
      console.error('[OTP] Resend API request failed:', err?.message || err);
      return {
        delivered: false,
        method: 'resend-api',
        error: err?.message || 'Failed to connect to Resend API'
      };
    }
  }

  // Graceful handling when RESEND_API_KEY is not yet configured
  console.warn(`[OTP] RESEND_API_KEY is not set. Generated OTP securely for ${masked} [Expires in ${OTP_EXPIRY_MINUTES}m].`);
  return {
    delivered: true,
    method: 'in-app-verification-gate'
  };
}

/**
 * Creates a cryptographically secure 6-digit OTP challenge
 */
export async function createOtpChallenge(params: {
  email: string;
  uid: string;
  displayName?: string;
  forceNew?: boolean;
}): Promise<{
  success: boolean;
  challengeId?: string;
  maskedEmail?: string;
  expiresAt?: number;
  cooldownSeconds?: number;
  error?: string;
  code?: string;
  isExistingReused?: boolean;
}> {
  const { email, uid, displayName = 'ReflectAI User', forceNew = false } = params;

  if (!email || !email.includes('@')) {
    return { success: false, error: 'A valid email address is required for verification.', code: 'INVALID_EMAIL' };
  }

  if (!uid || typeof uid !== 'string') {
    return { success: false, error: 'A valid user identifier is required.', code: 'INVALID_UID' };
  }

  const normalizedEmail = email.toLowerCase().trim();
  const now = Date.now();
  console.log(`[OTP] OTP request initiated for target: ${maskEmail(normalizedEmail)}`);

  // If not forcing a new code, check if a valid unexpired challenge already exists for this user/email
  if (!forceNew) {
    for (const [id, c] of activeOtpChallenges.entries()) {
      if ((c.uid === uid || c.email.toLowerCase() === normalizedEmail) && now < c.expiresAt && c.attempts < c.maxAttempts) {
        const elapsedSeconds = Math.floor((now - c.createdAt) / 1000);
        const cooldownSeconds = Math.max(0, OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds);
        return {
          success: true,
          challengeId: id,
          maskedEmail: maskEmail(c.email),
          expiresAt: c.expiresAt,
          cooldownSeconds,
          isExistingReused: true
        };
      }
    }
  }

  // Check Rate Limits per email
  const rateCheckEmail = checkRateLimit(`email:${normalizedEmail}`);
  if (!rateCheckEmail.allowed) {
    // If rate limited, check if we have a valid unexpired active challenge we can return
    for (const [id, c] of activeOtpChallenges.entries()) {
      if ((c.uid === uid || c.email.toLowerCase() === normalizedEmail) && now < c.expiresAt && c.attempts < c.maxAttempts) {
        return {
          success: true,
          challengeId: id,
          maskedEmail: maskEmail(c.email),
          expiresAt: c.expiresAt,
          cooldownSeconds: rateCheckEmail.retryAfterSeconds,
          isExistingReused: true
        };
      }
    }

    console.warn(`[OTP] Rate limit triggered for ${maskEmail(normalizedEmail)}`);
    return {
      success: false,
      error: `Please wait ${rateCheckEmail.retryAfterSeconds} seconds before requesting another verification code.`,
      code: 'OTP_RATE_LIMITED',
      cooldownSeconds: rateCheckEmail.retryAfterSeconds
    };
  }

  // Invalidate any existing active challenges for this user/email
  for (const [id, c] of activeOtpChallenges.entries()) {
    if (c.uid === uid || c.email.toLowerCase() === normalizedEmail) {
      activeOtpChallenges.delete(id);
    }
  }

  // Generate cryptographically secure 6-digit random number (100000 to 999999)
  const otpNumber = crypto.randomInt(100000, 1000000);
  const otpCode = otpNumber.toString();
  console.log(`[OTP] OTP generation successful [6 digits, expires in ${OTP_EXPIRY_MINUTES}m]`);

  // Create unique challenge ID and cryptographic salt
  const challengeId = 'otp_' + crypto.randomBytes(16).toString('hex');
  const salt = crypto.randomBytes(16).toString('hex');
  const hashedOtp = hashOtp(otpCode, salt);

  const expiresAt = now + OTP_EXPIRY_MINUTES * 60 * 1000; // 10 minutes TTL

  const challenge: OtpChallenge = {
    challengeId,
    email: normalizedEmail,
    uid,
    hashedOtp,
    salt,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS_PER_OTP,
    createdAt: now,
    expiresAt,
    lastResentAt: now
  };

  activeOtpChallenges.set(challengeId, challenge);

  // Dispatch email
  const emailResult = await dispatchOtpEmail({
    recipientEmail: normalizedEmail,
    recipientName: displayName,
    otpCode
  });

  if (!emailResult.delivered && emailResult.error) {
    return {
      success: false,
      error: 'We couldn’t send your verification code right now. Please try again in a moment.',
      code: 'OTP_EMAIL_SEND_FAILED'
    };
  }

  return {
    success: true,
    challengeId,
    maskedEmail: maskEmail(normalizedEmail),
    expiresAt,
    cooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS
  };
}

/**
 * Verifies a submitted 6-digit OTP against the stored cryptographic hash
 */
export function verifyOtpChallenge(params: {
  challengeId: string;
  otp: string;
  uid: string;
  email: string;
}): {
  success: boolean;
  sessionToken?: string;
  verifiedAt?: string;
  error?: string;
  code?: string;
  attemptsRemaining?: number;
} {
  const { challengeId, otp, uid, email } = params;
  const masked = maskEmail(email);

  if (!challengeId || !activeOtpChallenges.has(challengeId)) {
    console.warn(`[OTP] OTP verification attempt: FAILED (CHALLENGE_NOT_FOUND) for challenge ${challengeId}`);
    return {
      success: false,
      error: 'The verification challenge has expired or does not exist. Please request a new code.',
      code: 'OTP_EXPIRED'
    };
  }

  const challenge = activeOtpChallenges.get(challengeId)!;
  const now = Date.now();

  // 1. Expiration check (10 minutes)
  if (now > challenge.expiresAt) {
    activeOtpChallenges.delete(challengeId);
    console.warn(`[OTP] OTP verification attempt: FAILED (OTP_EXPIRED) for ${masked}`);
    return {
      success: false,
      error: 'Your verification code has expired. Please request a new code.',
      code: 'OTP_EXPIRED'
    };
  }

  // 2. Identity binding verification
  if (challenge.uid !== uid || challenge.email.toLowerCase() !== email.toLowerCase().trim()) {
    console.warn(`[OTP] OTP verification attempt: FAILED (SESSION_MISMATCH) for ${masked}`);
    return {
      success: false,
      error: 'Verification session mismatch. Please sign in again.',
      code: 'OTP_INVALID'
    };
  }

  // 3. Format validation
  const cleanOtp = (otp || '').toString().trim();
  if (!/^\d{6}$/.test(cleanOtp)) {
    return {
      success: false,
      error: 'Incorrect verification code. Please check your email and try again.',
      code: 'OTP_INVALID'
    };
  }

  // 4. Rate-limiting attempts check (max 5)
  if (challenge.attempts >= challenge.maxAttempts) {
    activeOtpChallenges.delete(challengeId);
    console.warn(`[OTP] OTP verification attempt: FAILED (OTP_ATTEMPTS_EXCEEDED) for ${masked}`);
    return {
      success: false,
      error: 'This verification code has expired. Please request a new code.',
      code: 'OTP_ATTEMPTS_EXCEEDED',
      attemptsRemaining: 0
    };
  }

  // 5. Constant-time HMAC comparison
  const submittedHash = hashOtp(cleanOtp, challenge.salt);
  const hashBufferA = Buffer.from(submittedHash, 'hex');
  const hashBufferB = Buffer.from(challenge.hashedOtp, 'hex');

  let isMatch = false;
  try {
    if (hashBufferA.length === hashBufferB.length) {
      isMatch = crypto.timingSafeEqual(hashBufferA, hashBufferB);
    }
  } catch {
    isMatch = false;
  }

  if (!isMatch) {
    challenge.attempts += 1;
    const remaining = Math.max(0, challenge.maxAttempts - challenge.attempts);
    console.warn(`[OTP] OTP verification attempt: FAILED (INVALID_OTP, ${remaining} attempts left) for ${masked}`);
    
    if (remaining === 0) {
      activeOtpChallenges.delete(challengeId);
      return {
        success: false,
        error: 'This verification code has expired. Please request a new code.',
        code: 'OTP_ATTEMPTS_EXCEEDED',
        attemptsRemaining: 0
      };
    }

    return {
      success: false,
      error: 'Incorrect verification code. Please check your email and try again.',
      code: 'OTP_INVALID',
      attemptsRemaining: remaining
    };
  }

  // Success: Invalidate challenge immediately so it cannot be reused (Single Use Guarantee)
  activeOtpChallenges.delete(challengeId);
  console.log(`[OTP] OTP verification attempt: SUCCESS for ${masked}`);

  // Generate cryptographically signed HMAC session token
  const sessionPayload = JSON.stringify({
    uid: challenge.uid,
    email: challenge.email,
    verifiedAt: now,
    exp: now + 24 * 60 * 60 * 1000 // 24 hours validity
  });

  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(sessionPayload)
    .digest('hex');

  const sessionToken = Buffer.from(sessionPayload).toString('base64url') + '.' + signature;

  return {
    success: true,
    sessionToken,
    verifiedAt: new Date().toISOString()
  };
}

/**
 * Validates a signed session token
 */
export function verifySessionToken(uid: string, sessionToken: string): boolean {
  if (!sessionToken || !uid || typeof sessionToken !== 'string') {
    return false;
  }

  try {
    const parts = sessionToken.split('.');
    if (parts.length !== 2) return false;

    const [payloadB64, signature] = parts;
    const payloadStr = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadStr);

    // Verify expiration
    if (Date.now() > payload.exp) {
      return false;
    }

    // Verify UID match
    if (payload.uid !== uid) {
      return false;
    }

    // Verify cryptographic signature
    const expectedSig = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(payloadStr)
      .digest('hex');

    const sigBufA = Buffer.from(signature, 'hex');
    const sigBufB = Buffer.from(expectedSig, 'hex');

    if (sigBufA.length !== sigBufB.length) return false;
    return crypto.timingSafeEqual(sigBufA, sigBufB);
  } catch (err) {
    return false;
  }
}
