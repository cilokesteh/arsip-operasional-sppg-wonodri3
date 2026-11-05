// POST /api/verify-pin — verifikasi PIN operator DI SERVER.
// PIN dibedakan per area (scope):
//   scope 'stock'    -> env var PIN_STOCK     (halaman Stok)
//   scope 'operator' -> env var PIN_OPERATOR  (Absensi, Arsip/SPJ, Admin,
//                                              Portal print & upah)
// PIN dibandingkan dengan env var (timing-safe), lalu server menerbitkan
// token sesi HMAC 8 jam yang mengikat scope tersebut. Gagal -> 401.
// 5x salah dari satu IP dalam 10 menit -> 429.

import {
  getClientIp,
  isRateLimited,
  jsonResponse,
  noteFailedAttempt,
  signToken,
  timingSafeEqual,
} from './_lib';

interface Env {
  PIN_STOCK?: string;
  PIN_OPERATOR?: string;
  PIN_TOKEN_SECRET?: string;
}

const SCOPE_ENV: Record<string, keyof Env> = {
  stock: 'PIN_STOCK',
  operator: 'PIN_OPERATOR',
};

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // sesi 8 jam

export const onRequestPost = async (context: any) => {
  const { request, env }: { request: Request; env: Env } = context;

  let pin = '';
  let scope = '';
  try {
    const body = await request.json();
    pin = typeof (body as any)?.pin === 'string' ? (body as any).pin : '';
    scope = typeof (body as any)?.scope === 'string' ? (body as any).scope : '';
  } catch {
    return jsonResponse({ ok: false, error: 'bad_request' }, 400);
  }

  const envKey = SCOPE_ENV[scope];
  if (!envKey) {
    return jsonResponse({ ok: false, error: 'bad_request' }, 400);
  }
  const expectedPin = env[envKey];
  if (!expectedPin || !env.PIN_TOKEN_SECRET) {
    return jsonResponse({ ok: false, error: 'server_not_configured' }, 500);
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return jsonResponse({ ok: false, error: 'too_many_attempts' }, 429);
  }

  if (!pin || pin.length > 64) {
    noteFailedAttempt(ip);
    return jsonResponse({ ok: false, error: 'unauthorized' }, 401);
  }

  const ok = await timingSafeEqual(pin, expectedPin);
  if (!ok) {
    noteFailedAttempt(ip);
    return jsonResponse({ ok: false, error: 'unauthorized' }, 401);
  }

  const token = await signToken(env.PIN_TOKEN_SECRET, {
    exp: Date.now() + TOKEN_TTL_MS,
    iat: Date.now(),
    scope,
  });
  return jsonResponse({ ok: true, token });
};
