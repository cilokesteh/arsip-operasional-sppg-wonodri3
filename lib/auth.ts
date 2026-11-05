// Verifikasi PIN operator via server (Cloudflare Pages Function).
// Nilai PIN TIDAK PERNAH ada di kode aplikasi / bundle JS — PIN hanya
// dibandingkan di server dengan env var OPERATOR_PIN, dan browser hanya
// menyimpan token sesi bertanda tangan (HMAC) yang kedaluwarsa 8 jam.

const TOKEN_KEY = 'sppg_auth_token';

// Kunci sesi lama (pra-server) — dibersihkan saat login/logout baru.
const LEGACY_KEYS = [
  'sppg_stock_auth',
  'sppg_absensi_auth',
  'sppg_admin_auth',
  'sppg_print_auth',
  'sppg_salary_unlocked',
];

export type PinVerifyResult =
  | { ok: true }
  | { ok: false; reason: 'wrong' | 'rate_limited' | 'unavailable' };

function clearLegacyKeys(): void {
  try {
    LEGACY_KEYS.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // ignore
  }
}

export async function verifyPin(pin: string): Promise<PinVerifyResult> {
  try {
    const res = await fetch('/api/verify-pin', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data && typeof data.token === 'string' && data.token) {
        try {
          sessionStorage.setItem(TOKEN_KEY, data.token);
        } catch {
          // ignore
        }
        clearLegacyKeys();
        return { ok: true };
      }
      return { ok: false, reason: 'unavailable' };
    }
    if (res.status === 401) return { ok: false, reason: 'wrong' };
    if (res.status === 429) return { ok: false, reason: 'rate_limited' };
    return { ok: false, reason: 'unavailable' };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

export async function hasValidSession(): Promise<boolean> {
  let token: string | null = null;
  try {
    token = sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return false;
  }
  if (!token) return false;
  try {
    const res = await fetch('/api/verify-token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    return data?.valid === true;
  } catch {
    return false;
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
  clearLegacyKeys();
}
