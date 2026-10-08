// Konfigurasi Webhook Resmi Google Drive Upload untuk SPPG Wonodri 3
// Menggunakan Cloudflare Proxy Endpoint agar bebas CORS / Failed to fetch di semua browser HP
export const DRIVE_UPLOAD_PROXY_URL = 'https://sppg-sync-worker.cilokesteh.workers.dev/api/upload-drive';

// Kompres foto langsung di browser sebelum kirim (supaya foto kamera HP 5-15MB jadi ~300KB kilat)
async function compressImageFile(file: File, maxWidth = 1200, quality = 0.8): Promise<{ base64: string; type: string }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const raw = (reader.result as string).split(',')[1];
        resolve({ base64: raw, type: file.type || 'image/jpeg' });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        const reader = new FileReader();
        reader.onload = () => {
          const raw = (reader.result as string).split(',')[1];
          resolve({ base64: raw, type: 'image/jpeg' });
        };
        reader.readAsDataURL(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      const base64 = compressedDataUrl.split(',')[1];
      resolve({ base64, type: 'image/jpeg' });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      const reader = new FileReader();
      reader.onload = () => {
        const raw = (reader.result as string).split(',')[1];
        resolve({ base64: raw, type: 'image/jpeg' });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    };
  });
}

// Upload File langsung dari browser ke Google Drive via Cloudflare Worker Proxy
export async function uploadToGoogleDrive(
  file: File,
  folderName: string = 'Dokumentasi_SPPG_Wonodri_3'
): Promise<{ success: boolean; url?: string; fileId?: string; error?: string }> {
  try {
    const { base64, type } = await compressImageFile(file);

    const payload = {
      name: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
      type,
      base64,
      folder: folderName,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 detik timeout

    const response = await fetch(DRIVE_UPLOAD_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server proxy error HTTP ${response.status}`);
    }

    const result = await response.json();
    if (result && result.success) {
      return {
        success: true,
        url: result.url || `https://lh3.googleusercontent.com/d/${result.fileId}`,
        fileId: result.fileId,
      };
    } else {
      return {
        success: false,
        error: result?.error || 'Google Drive menolak file.',
      };
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { success: false, error: 'Koneksi timeout. Jaringan internet HP sedang tidak stabil.' };
    }
    const msg = err instanceof Error ? err.message : 'Koneksi ke server upload gagal.';
    return {
      success: false,
      error: msg,
    };
  }
}
