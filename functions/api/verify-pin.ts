// POST /api/verify-pin — verifikasi PIN operator DI SERVER.
// PIN dibandingkan dengan env var OPERATOR_PIN (diatur di dashboard
// Cloudflare Pages, TIDAK PERNAH ada di repo / bundle JS).
// Berhasil -> token sesi HMAC (8 jam). Gagal -> 401. 5x salah dari
// satu IP dalam 10 menit -> 429.

import {
  getClientIp,
  isRateLimited,
  jsonResponse,
  noteFailedAttempt,
  signToken,
  timingSafeEqual,
} from './_lib';

interface Env {
  OPERATOR_PIN?: string;
  PIN_TOKEN_SECRET?: string;
}

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // sesi 8 jam

export const onRequestPost = async (context: any) => {
  const { request, env }: { request: Request; env: Env } = context;

  if (!env.OPERATOR_PIN || !env.PIN_TOKEN_SECRET) {
    return jsonResponse({ ok: false, error: 'server_not_configured' }, 500);
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return jsonResponse({ ok: false, error: 'too_many_attempts' }, 429);
  }

  let pin = '';
  try {
    const body = await request.json();
    pin = typeof (body as any)?.pin === 'string' ? (body as any).pin : '';
  } catch {
    return jsonResponse({ ok: false, error: 'bad_request' }, 400);
  }

  if (!pin || pin.length > 64) {
    noteFailedAttempt(ip);
    return jsonResponse({ ok: false, error: 'unauthorized' }, 401);
  }

  const ok = await timingSafeEqual(pin, env.OPERATOR_PIN);
  if (!ok) {
    noteFailedAttempt(ip);
    return jsonResponse({ ok: false, error: 'unauthorized' }, 401);
  }

  const token = await signToken(env.PIN_TOKEN_SECRET, {
    exp: Date.now() + TOKEN_TTL_MS,
    iat: Date.now(),
  });
  return jsonResponse({ ok: true, token });
};
