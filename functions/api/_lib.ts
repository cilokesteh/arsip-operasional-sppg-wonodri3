// Helper bersama untuk endpoint auth Pages Functions.
// File ini BUKAN route (nama diawali underscore) — hanya diimpor
// oleh functions/api/verify-pin.ts dan functions/api/verify-token.ts.

const encoder = new TextEncoder();

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

// Rate limit sederhana per IP (best-effort, in-memory per isolate):
// maks 5 PIN salah dalam 10 menit -> 429.
const failedAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export function isRateLimited(ip: string): boolean {
  const entry = failedAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) {
    failedAttempts.delete(ip);
    return false;
  }
  return entry.count >= RATE_LIMIT_MAX;
}

export function noteFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = failedAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    failedAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(input: string): Uint8Array {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacSha256(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return new Uint8Array(sig);
}

// Perbandingan timing-safe: bandingkan hash SHA-256 kedua nilai,
// bukan string aslinya.
export async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(a)),
    crypto.subtle.digest('SHA-256', encoder.encode(b)),
  ]);
  const x = new Uint8Array(ha);
  const y = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export interface AuthTokenPayload {
  exp: number;
  iat: number;
}

// Token sesi: payload.exp ditandatangani HMAC-SHA256 dengan
// PIN_TOKEN_SECRET. Token TIDAK berisi PIN dan tidak bisa dipalsukan
// tanpa secret server.
export async function signToken(secret: string, payload: AuthTokenPayload): Promise<string> {
  const payloadPart = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const sig = await hmacSha256(secret, payloadPart);
  return `${payloadPart}.${toBase64Url(sig)}`;
}

export async function verifyTokenSignature(secret: string, token: string): Promise<boolean> {
  try {
    const [payloadPart, sigPart] = token.split('.');
    if (!payloadPart || !sigPart) return false;
    const expectedSig = await hmacSha256(secret, payloadPart);
    const givenSig = fromBase64Url(sigPart);
    if (givenSig.length !== expectedSig.length) return false;
    let diff = 0;
    for (let i = 0; i < givenSig.length; i++) diff |= givenSig[i] ^ expectedSig[i];
    if (diff !== 0) return false;
    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payloadPart))
    ) as AuthTokenPayload;
    return typeof payload.exp === 'number' && Date.now() < payload.exp;
  } catch {
    return false;
  }
}
