// POST /api/verify-token — validasi token sesi (tanda tangan HMAC +
// masa kedaluwarsa + scope) DI SERVER. Dipakai tiap halaman memuat untuk
// memulihkan sesi login tanpa meminta PIN ulang. Token scope 'stock'
// tidak berlaku untuk area 'operator', begitu pula sebaliknya.

import { jsonResponse, verifyTokenSignature } from './_lib';

interface Env {
  PIN_TOKEN_SECRET?: string;
}

export const onRequestPost = async (context: any) => {
  const { request, env }: { request: Request; env: Env } = context;

  if (!env.PIN_TOKEN_SECRET) {
    return jsonResponse({ valid: false, error: 'server_not_configured' }, 500);
  }

  let token = '';
  let scope: string | undefined;
  try {
    const body = await request.json();
    token = typeof (body as any)?.token === 'string' ? (body as any).token : '';
    scope = typeof (body as any)?.scope === 'string' ? (body as any).scope : undefined;
  } catch {
    return jsonResponse({ valid: false }, 400);
  }

  const valid = token
    ? await verifyTokenSignature(env.PIN_TOKEN_SECRET, token, scope)
    : false;
  return jsonResponse({ valid });
};
