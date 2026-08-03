/**
 * jwt.js
 * ------------------------------------------------------------------
 * A small, dependency-free JWT (JSON Web Token) implementation used
 * to demonstrate the three-part token structure taught in this
 * experiment:
 *
 *      header.payload.signature
 *
 * NOTE ON SECURITY (read this before reusing anywhere real):
 * This signs tokens with HMAC-SHA256 using the Web Crypto API, so the
 * signature is a genuine cryptographic signature and not just a
 * decorative string. However, because everything runs in the
 * browser, the "secret" below is visible to anyone who opens dev
 * tools. That is fine for this experiment, whose goal is to show HOW
 * JWTs are built and verified, but in a real system the signing step
 * must happen on a server that keeps the secret private. Never trust
 * a token that was both issued and verified only on the client.
 * ------------------------------------------------------------------
 */

// Mock signing secret. In production this lives only on the server.
const MOCK_SECRET = 'experiment-1.3.1-classroom-secret-key';
const ALGORITHM = 'HS256';

// ---- base64url helpers -------------------------------------------------

function base64UrlEncode(bytesOrString) {
  const bytes =
    typeof bytesOrString === 'string'
      ? new TextEncoder().encode(bytesOrString)
      : bytesOrString;
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function base64UrlDecodeToString(str) {
  return new TextDecoder().decode(base64UrlDecode(str));
}

// ---- HMAC-SHA256 signing / verification --------------------------------

async function getKey() {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(MOCK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function hmacSign(data) {
  const key = await getKey();
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return base64UrlEncode(new Uint8Array(signature));
}

async function hmacVerify(data, signature) {
  const key = await getKey();
  const sigBytes = base64UrlDecode(signature);
  return crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(data));
}

// ---- public API ----------------------------------------------------------

/**
 * Generate a signed JWT for the given user payload.
 * Adds standard claims: iat (issued-at) and exp (expiry).
 */
export async function generateToken(userPayload, expiresInSeconds = 60 * 30) {
  const header = { alg: ALGORITHM, typ: 'JWT' };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    ...userPayload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmacSign(`${encodedHeader}.${encodedPayload}`);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Decode a token WITHOUT verifying its signature.
 * Mirrors what jwt-decode / jwt.io "Decoded" panel does — useful for
 * reading claims client-side, but never trust this alone for auth
 * decisions.
 */
export function decodeToken(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Malformed token');
  const [encodedHeader, encodedPayload] = parts;
  return {
    header: JSON.parse(base64UrlDecodeToString(encodedHeader)),
    payload: JSON.parse(base64UrlDecodeToString(encodedPayload)),
  };
}

/**
 * Verify a token's signature AND check that it has not expired.
 * Returns { valid: boolean, payload?, reason? }
 */
export async function verifyToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false, reason: 'Malformed token' };
    const [encodedHeader, encodedPayload, signature] = parts;

    const signatureOk = await hmacVerify(`${encodedHeader}.${encodedPayload}`, signature);
    if (!signatureOk) return { valid: false, reason: 'Invalid signature' };

    const payload = JSON.parse(base64UrlDecodeToString(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) {
      return { valid: false, reason: 'Token expired' };
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, reason: 'Token could not be parsed' };
  }
}
