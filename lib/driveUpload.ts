// Konfigurasi Webhook Resmi Google Drive Upload untuk SPPG Wonodri 3
export const DRIVE_UPLOAD_PROXY_URL = 'https://sppg-sync-worker.cilokesteh.workers.dev/api/upload-drive';
export const DIRECT_GOOGLE_DRIVE_URL = 'https://script.google.com/macros/s/AKfycbxmZrKCgkz63IGMpdU5QIV3rlJVW_QN7Qnp0M_jBP1HKRfvaEXWbsguXRHDJNLVlq-_/exec';

// Kompres foto langsung di browser sebelum kirim (supaya foto kamera HP 5-15MB jadi ~250KB super enteng)
async function compressImageFile(file: File, maxWidth = 1000, quality = 0.75): Promise<{ base64: string; type: string }> {
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

// Upload File dengan Dual-Route: Coba Proxy dulu, jika gagal coba Direct GAS
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
    const bodyStr = JSON.stringify(payload);

    // ROUTE 1: LEWAT CLOUDFLARE PROXY
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      const response = await fetch(DRIVE_UPLOAD_PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: bodyStr,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        if (result && result.success) {
          return {
            success: true,
            url: result.url || `https://lh3.googleusercontent.com/d/${result.fileId}`,
            fileId: result.fileId,
          };
        }
      }
    } catch (proxyErr) {
      console.warn('Proxy route gagal, mencoba direct route:', proxyErr);
    }

    // ROUTE 2: FALLBACK LANGSUNG KE GOOGLE APPS SCRIPT
    const directController = new AbortController();
    const directTimeoutId = setTimeout(() => directController.abort(), 35000);

    const directRes = await fetch(DIRECT_GOOGLE_DRIVE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: bodyStr,
      signal: directController.signal,
    });

    clearTimeout(directTimeoutId);

    const directResult = await directRes.json();
    if (directResult && directResult.success) {
      return {
        success: true,
        url: directResult.url || `https://lh3.googleusercontent.com/d/${directResult.fileId}`,
        fileId: directResult.fileId,
      };
    } else {
      return {
        success: false,
        error: directResult?.error || 'Google Drive menolak file.',
      };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Upload gagal';
    return {
      success: false,
      error: msg,
    };
  }
}
