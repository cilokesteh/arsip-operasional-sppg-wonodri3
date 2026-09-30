// Konfigurasi Webhook Resmi Google Drive Upload untuk SPPG Wonodri 3
export const GOOGLE_DRIVE_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbxmZrKCgkz63IGMpdU5QIV3rlJVW_QN7Qnp0M_jBP1HKRfvaEXWbsguXRHDJNLVlq-_/exec';

// Upload File langsung dari browser ke Google Drive via Google Apps Script
export async function uploadToGoogleDrive(
  file: File,
  folderName: string = 'Dokumentasi_SPPG_Wonodri_3'
): Promise<{ success: boolean; url?: string; fileId?: string; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const rawBase64 = (reader.result as string).split(',')[1];
        const payload = {
          name: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
          type: file.type || 'image/jpeg',
          base64: rawBase64,
          folder: folderName,
        };

        const response = await fetch(GOOGLE_DRIVE_WEBHOOK_URL, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (result && result.success) {
          resolve({
            success: true,
            url: result.url || `https://lh3.googleusercontent.com/d/${result.fileId}`,
            fileId: result.fileId,
          });
        } else {
          resolve({
            success: false,
            error: result?.error || 'Gagal menyimpan ke Google Drive.',
          });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Koneksi ke Google Apps Script gagal.';
        resolve({
          success: false,
          error: msg,
        });
      }
    };
    reader.onerror = () => {
      resolve({ success: false, error: 'Gagal membaca file gambar dari galeri/kamera.' });
    };
  });
}
