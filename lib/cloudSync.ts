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

// Simpan / Sinkronkan satu menu spesifik langsung ke Cloudflare KV Database (Single Record Push)
export async function saveSingleMenuToCloud(menu: DailyMenuRecord): Promise<{ success: boolean; totalMenus?: number; error?: string }> {
  try {
    const res = await fetch(`${CLOUD_SYNC_ENDPOINT}/single`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(menu),
    });
    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `Server error HTTP ${res.status}: ${errText}` };
    }
    const result = await res.json();
    return { success: !!result.success, totalMenus: result.count };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Koneksi ke Cloud gagal.';
    console.error('Gagal menyimpan single menu ke Cloudflare KV:', err);
    return { success: false, error: msg };
  }
}

// Hapus satu tanggal langsung di Cloud
export async function deleteMenuFromCloud(dateStr: string): Promise<boolean> {
  try {
    const res = await fetch(`${CLOUD_SYNC_ENDPOINT}/${dateStr}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Fallback batch save jika dibutuhkan
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
  } catch {
    return false;
  }
}
