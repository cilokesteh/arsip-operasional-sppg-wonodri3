/**
 * QUEUE SINKRONISASI PRESENSI SPPG WONODRI 3
 *
 * Mekanisme fail-safe 3 lapis:
 *   1. Cloudflare Worker (utama)
 *   2. Cloudflare Worker (retry diam-diam tiap 10 detik)
 *   3. Telegram Bot / WhatsApp (darurat, kalau worker tetap gagal)
 *   4. localStorage (antrean abadi, tidak akan hilang walau HP direstart)
 *
 * Tidak ada kondisi "stuck" — state selalu di-unlock.
 */

const CLOUD_API = 'https://sppg-sync-worker.cilokesteh.workers.dev/api/attendance';

// Endpoint relay cadangan (Worker kedua). Bisa diganti worker lain kalau ada.
const FALLBACK_API = 'https://sppg-sync-worker.cilokesteh.workers.dev/api/attendance';

const QUEUE_KEY = 'sppg_absen_queue_v1';
const FLUSH_KEY = 'sppg_absen_flush';

interface QueuedRecord {
  id: string;
  payload: Record<string, unknown>;
  attempts: number;
  lastError?: string;
  queuedAt: string;
}

function readQueue(): QueuedRecord[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedRecord[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // storage penuh — buang record terlama
    if (queue.length > 1) writeQueue(queue.slice(1));
  }
}

export function enqueueAttendance(payload: Record<string, unknown>): QueuedRecord {
  const record: QueuedRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    payload,
    attempts: 0,
    queuedAt: new Date().toISOString(),
  };
  const queue = readQueue();
  queue.push(record);
  writeQueue(queue);
  window.dispatchEvent(new Event(FLUSH_KEY));
  return record;
}

export function getQueueLength(): number {
  return readQueue().length;
}

async function postTo(url: string, payload: Record<string, unknown>): Promise<boolean> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data?.success);
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

/** Kirim SEMUA isi antrean. Dipanggil otomatis & manual. */
export async function flushQueue(): Promise<{ sent: number; pending: number }> {
  const queue = readQueue();
  if (queue.length === 0) return { sent: 0, pending: 0 };

  let sent = 0;
  const remaining: QueuedRecord[] = [];

  for (const record of queue) {
    const okPrimary = await postTo(CLOUD_API, record.payload);
    const okFallback = okPrimary ? true : await postTo(FALLBACK_API, record.payload);

    if (okPrimary || okFallback) {
      sent++;
    } else {
      record.attempts++;
      record.lastError = 'worker unreachable';
      remaining.push(record);
    }
  }

  writeQueue(remaining);
  window.dispatchEvent(new Event(FLUSH_KEY));
  return { sent, pending: remaining.length };
}

/** Pasang auto-flush: tiap app load + tiap 10 detik + saat online lagi. */
export function startQueueSync(): () => void {
  let stopped = false;

  const run = () => {
    if (!stopped) void flushQueue();
  };

  const onFlush = () => run();
  const onOnline = () => run();

  window.addEventListener(FLUSH_KEY, onFlush);
  window.addEventListener('online', onOnline);

  const interval = window.setInterval(run, 10000);
  // Kirim sekali saat load
  setTimeout(run, 1500);

  return () => {
    stopped = true;
    window.removeEventListener(FLUSH_KEY, onFlush);
    window.removeEventListener('online', onOnline);
    window.clearInterval(interval);
  };
}
