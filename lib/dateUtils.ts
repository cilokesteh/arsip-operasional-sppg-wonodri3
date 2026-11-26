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

// Input: "2026-11-26" -> Output: "Kamis, 26 November 2026"
export function formatHariTanggalIndo(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const parts = dateStr.trim().split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month, day);
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dayName = days[d.getDay()] || '';
  return `${dayName}, ${formatTanggalIndo(dateStr)}`;
}

// Input: "2026-11-26" -> Output: "26 NOV 2026"
export function formatTanggalUpper(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const parts = dateStr.trim().split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parts[2].padStart(2, '0');
  const bulanUpper = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
  if (monthIdx >= 0 && monthIdx < 12) {
    return `${day} ${bulanUpper[monthIdx]} ${year}`;
  }
  return dateStr.toUpperCase();
}
