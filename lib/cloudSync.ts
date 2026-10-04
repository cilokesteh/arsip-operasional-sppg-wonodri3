import { DailyMenuRecord } from './data';

export const CLOUD_SYNC_ENDPOINT = 'https://sppg-sync-worker.cilokesteh.workers.dev/api/menus';

// Ambil semua daftar menu resmi dari Cloudflare KV Database
export async function fetchMenusFromCloud(): Promise<DailyMenuRecord[]> {
  try {
    const res = await fetch(`${CLOUD_SYNC_ENDPOINT}?t=${Date.now()}`, {
      method: 'GET',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Gagal mengambil data dari Cloudflare KV:', err);
    return [];
  }
}

// Simpan / Sinkronkan seluruh daftar menu ke Cloudflare KV Database
export async function saveMenusToCloud(menus: DailyMenuRecord[]): Promise<boolean> {
  try {
    const res = await fetch(CLOUD_SYNC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(menus),
    });
    const result = await res.json();
    return !!result.success;
  } catch (err) {
    console.error('Gagal menyimpan data ke Cloudflare KV:', err);
    return false;
  }
}
