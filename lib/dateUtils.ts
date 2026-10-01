// Helper format tanggal resmi standar Indonesia (SNI / EYD)
// Input: "2026-10-01" -> Output: "01 Oktober 2026"
export function formatTanggalIndo(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const parts = dateStr.trim().split('-');
  if (parts.length !== 3) return dateStr;

  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parts[2].padStart(2, '0');

  const bulanIndo = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  if (monthIdx >= 0 && monthIdx < 12) {
    return `${day} ${bulanIndo[monthIdx]} ${year}`;
  }

  return dateStr;
}
