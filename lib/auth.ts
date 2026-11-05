// Verifikasi PIN operator via server (Cloudflare Pages Function).
// Nilai PIN TIDAK PERNAH ada di kode aplikasi / bundle JS — PIN hanya
// dibandingkan di server dengan env var (PIN_STOCK untuk halaman Stok,
// PIN_OPERATOR untuk Absensi/Arsip/Admin/Portal), dan browser hanya
// menyimpan token sesi bertanda tangan (HMAC) per scope yang kedaluwarsa
// 8 jam.

export type PinScope = 'stock' | 'operator';

const TOKEN_KEYS: Record<PinScope, string> = {
  stock: 'sppg_auth_token_stock',
  operator: 'sppg_auth_token_operator',
};

// Kunci sesi lama (pra-server & pra-scope) — dibersihkan saat login/logout baru.
const LEGACY_KEYS = [
  'sppg_auth_token',
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

export async function verifyPin(pin: string, scope: PinScope): Promise<PinVerifyResult> {
  try {
    const res = await fetch('/api/verify-pin', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ pin, scope }),
    });
    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data && typeof data.token === 'string' && data.token) {
        try {
          sessionStorage.setItem(TOKEN_KEYS[scope], data.token);
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

export async function hasValidSession(scope: PinScope): Promise<boolean> {
  let token: string | null = null;
  try {
    token = sessionStorage.getItem(TOKEN_KEYS[scope]);
  } catch {
    return false;
  }
  if (!token) return false;
  try {
    const res = await fetch('/api/verify-token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token, scope }),
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    return data?.valid === true;
  } catch {
    return false;
  }
}

export function clearSession(scope?: PinScope): void {
  try {
    if (scope) {
      sessionStorage.removeItem(TOKEN_KEYS[scope]);
    } else {
      (Object.keys(TOKEN_KEYS) as PinScope[]).forEach((s) =>
        sessionStorage.removeItem(TOKEN_KEYS[s])
      );
    }
  } catch {
    // ignore
  }
  clearLegacyKeys();
}
