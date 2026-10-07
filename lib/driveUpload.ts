// Konfigurasi Webhook Resmi Google Drive Upload untuk SPPG Wonodri 3
export const GOOGLE_DRIVE_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbxmZrKCgkz63IGMpdU5QIV3rlJVW_QN7Qnp0M_jBP1HKRfvaEXWbsguXRHDJNLVlq-_/exec';

// Kompres foto langsung di browser sebelum kirim (supaya foto kamera HP 5-15MB jadi ~400KB kilat)
async function compressImageFile(file: File, maxWidth = 1400, quality = 0.82): Promise<{ base64: string; type: string }> {
  return new Promise((resolve, reject) => {
    // Jika bukan gambar (misal file aneh), fallback baca FileReader biasa
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
        // Fallback jika canvas context gagal
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
      // Fallback
      const reader = new FileReader();
      reader.onload = () => {
        const raw = (reader.result as string).split(',')[1];
        resolve({ base64: raw, type: file.type || 'image/jpeg' });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    };
  });
}

// Upload File langsung dari browser ke Google Drive via Google Apps Script
export async function uploadToGoogleDrive(
  file: File,
  folderName: string = 'Dokumentasi_SPPG_Wonodri_3'
): Promise<{ success: boolean; url?: string; fileId?: string; error?: string }> {
  try {
    // 1. Kompres gambar di sisi klien dulu agar payload ringan dan tidak timeout di Google Apps Script (batas payload GAS ~5MB)
    const { base64, type } = await compressImageFile(file);

    const payload = {
      name: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
      type,
      base64,
      folder: folderName,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 detik timeout

    const response = await fetch(GOOGLE_DRIVE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

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
      return { success: false, error: 'Koneksi timeout. Foto terlalu besar atau jaringan lambat.' };
    }
    const msg = err instanceof Error ? err.message : 'Koneksi ke Google Drive gagal.';
    return {
      success: false,
      error: msg,
    };
  }
}
