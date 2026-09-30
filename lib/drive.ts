// Helper fungsi untuk konversi berbagai format link sharing Google Drive menjadi link gambar langsung (Direct Image URL)
export function formatGoogleDriveImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Jika sudah URL biasa atau path lokal
  if (!trimmed.includes('drive.google.com')) {
    return trimmed;
  }

  // Pola 1: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
  }

  // Pola 2: https://drive.google.com/open?id=FILE_ID atau id=FILE_ID
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${idParamMatch[1]}`;
  }

  return trimmed;
}
