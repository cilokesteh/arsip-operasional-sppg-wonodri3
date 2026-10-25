'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  LogOut,
  ChevronDown,
  Search,
  User,
  Check
} from 'lucide-react';
import { DEFAULT_ROSTER_40 } from '@/lib/attendance';

// Koordinat Resmi Dapur SPPG Wonodri 3 Kota Semarang (Juknis BGN 2026)
const KITCHEN_LAT = -6.992554;
const KITCHEN_LNG = 110.425959;
const MAX_RADIUS_METERS = 10; // Radius ketat dapur (10 meter, anti-absen dari rumah)
const CLOUD_ATTENDANCE_API = 'https://sppg-sync-worker.cilokesteh.workers.dev/api/attendance';

// Formula Haversine untuk kalkulasi jarak GPS akurat
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // radius bumi dalam meter
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export default function AbsenMandiriPage() {
  // 1. Clock WIB State
  const [currentWib, setCurrentWib] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');

  // 2. Selection Relawan
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string>('');

  // 3. Camera & Photo
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraLoading, setCameraLoading] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // 4. Geolocation & Geofence
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string>('');

  // 5. Submit & Result Status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<{
    type: 'IN' | 'OUT';
    time: string;
    volunteerName: string;
    dutySection: string;
    distance: number;
    photo: string;
  } | null>(null);

  // Filter roster yang aktif saja (38 Personel)
  const activeVolunteers = useMemo(() => {
    return DEFAULT_ROSTER_40.filter((v) => v.isActive);
  }, []);

  const selectedVolunteer = useMemo(() => {
    return activeVolunteers.find((v) => v.id === selectedVolunteerId) || null;
  }, [activeVolunteers, selectedVolunteerId]);

  const filteredVolunteers = useMemo(() => {
    if (!searchQuery.trim()) return activeVolunteers;
    const q = searchQuery.toLowerCase();
    return activeVolunteers.filter(
      (v) => v.name.toLowerCase().includes(q) || v.dutySection.toLowerCase().includes(q)
    );
  }, [activeVolunteers, searchQuery]);

  // Live Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const optionsTime: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Jakarta',
        hour12: false,
      };
      const optionsDate: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
      };
      setCurrentWib(new Intl.DateTimeFormat('id-ID', optionsTime).format(now) + ' WIB');
      setCurrentDateStr(new Intl.DateTimeFormat('id-ID', optionsDate).format(now));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Inisialisasi Lokasi GPS saat halaman dibuka
  useEffect(() => {
    refreshLocation();
  }, []);

  // Auto-start camera on page load for seamless experience
  useEffect(() => {
    startWebCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Fungsi Deteksi GPS Geofence
  const refreshLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Perangkat Anda tidak mendukung fitur lokasi GPS.');
      return;
    }

    setIsLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCurrentCoords({ lat, lng });

        const dist = calculateDistanceMeters(lat, lng, KITCHEN_LAT, KITCHEN_LNG);
        setDistanceMeters(dist);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setLocationError('Izin akses lokasi ditolak. Aktifkan GPS pada HP dan izinkan lokasi browser.');
        } else {
          setLocationError('Satelit GPS sedang mendeteksi... Pastikan GPS HP aktif.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000,
      }
    );
  };

  // Helper Menggambar Stempel / Watermark Resmi pada Canvas
  const applyWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const barHeight = 82;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fillRect(0, height - barHeight, width, barHeight);

    // Title SPPG
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('SPPG WONODRI 3 • PRESENSI REALTIME', 16, height - 56);

    // Date, Time & Volunteer Name
    ctx.fillStyle = '#ffffff';
    ctx.font = '13px sans-serif';
    const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    const dateFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const volunteerLabel = selectedVolunteer ? selectedVolunteer.name : 'Relawan SPPG';
    ctx.fillText(`${dateFormatted} • ${nowStr} • ${volunteerLabel}`, 16, height - 34);

    // Coordinates & Distance
    const isValid = distanceMeters !== null && distanceMeters <= MAX_RADIUS_METERS;
    ctx.fillStyle = isValid ? '#4ade80' : '#f87171';
    ctx.font = 'bold 12px monospace';
    const distText = distanceMeters !== null
      ? `📍 ${distanceMeters}m dari Dapur SPPG (${isValid ? 'Valid di Dapur' : 'Luar Radius'})`
      : '📍 GPS Terverifikasi';
    ctx.fillText(distText, 16, height - 14);
  };

  // Menyalakan Kamera Web Live (Langsung Tampil di Box Web, Anti-Zoom)
  const startWebCamera = async () => {
    setCameraLoading(true);
    setCameraError('');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Browser ini tidak mendukung akses kamera langsung.');
        setCameraLoading(false);
        return;
      }

      // Constraints natural portrait yang pas dengan sensor HP tanpa ke-zoom
      const constraints = {
        video: {
          facingMode: 'user', // Kamera Depan
          width: { ideal: 720 },
          height: { ideal: 960 },
        },
        audio: false,
      };

      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        // Fallback untuk device lama
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
          setIsCameraActive(true);
          setCameraLoading(false);
        };
      }
    } catch {
      setCameraLoading(false);
      setIsCameraActive(false);
      setCameraError('Izin kamera belum aktif. Silakan izinkan akses kamera di browser Anda.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  // Jepret Foto Langsung dari Box Web (Cegah Terpotong & Anti-Zoom)
  const captureFromWebCamera = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const vWidth = video.videoWidth || 640;
    const vHeight = video.videoHeight || 480;

    // Hitung crop presisi rasio 3:4 portrait dari sumber kamera
    const targetRatio = 3 / 4;
    let cropWidth = vWidth;
    let cropHeight = vWidth / targetRatio;

    if (cropHeight > vHeight) {
      cropHeight = vHeight;
      cropWidth = vHeight * targetRatio;
    }

    const startX = (vWidth - cropWidth) / 2;
    const startY = (vHeight - cropHeight) / 2;

    const destW = 480;
    const destH = 640;
    canvas.width = destW;
    canvas.height = destH;

    // Flip horizontal agar hasil foto selfie tidak terbalik (mirror natural)
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, startX, startY, cropWidth, cropHeight, -destW, 0, destW, destH);
    ctx.restore();

    // Tambahkan stempel resmi pada resolusi 480x640 yang pas
    applyWatermark(ctx, destW, destH);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    startWebCamera();
  };

  const isLocationValid = distanceMeters !== null && distanceMeters <= MAX_RADIUS_METERS;

  // Submit Presensi ke Cloudflare KV (Anti-Stuck: Penuh Validasi Interaktif)
  const handleSubmitAttendance = async (type: 'IN' | 'OUT') => {
    // 1. Cek Apakah Nama Sudah Dipilih
    if (!selectedVolunteer) {
      setNameError('Pilih nama Anda terlebih dahulu!');
      setIsDropdownOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setNameError('');

    // 2. Cek Apakah Foto Sudah Diambil
    if (!capturedPhoto) {
      alert('Silakan jepret foto selfie terlebih dahulu di box kamera!');
      return;
    }

    // 3. Cek Status Radius GPS (Ketat 10 Meter)
    if (distanceMeters === null) {
      alert('⚠️ Koordinat GPS belum terbaca. Silakan klik tombol "Perbarui GPS" dan pastikan izin lokasi browser aktif.');
      return;
    }

    if (distanceMeters > MAX_RADIUS_METERS) {
      alert(
        `⛔ PRESENSI DITOLAK!\n\nJarak Anda terdeteksi ${distanceMeters} meter dari titik Dapur SPPG Wonodri 3.\n\nBatas maksimal radius yang diizinkan hanya ${MAX_RADIUS_METERS} meter.\nPresensi dari rumah atau luar area dapur dilarang keras!`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date();
      const dateWib = now.toISOString().slice(0, 10);
      const timeWib = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' WIB';

      const payload = {
        volunteerId: selectedVolunteer.id,
        volunteerName: selectedVolunteer.name,
        dutySection: selectedVolunteer.dutySection,
        date: dateWib,
        type,
        time: timeWib,
        timestamp: now.toISOString(),
        latitude: currentCoords?.lat || KITCHEN_LAT,
        longitude: currentCoords?.lng || KITCHEN_LNG,
        distanceMeters: distanceMeters ?? 0,
        isWithinRadius: isLocationValid,
        photoUrl: capturedPhoto,
        notes: isLocationValid ? 'Presensi Mandiri Valid di Dapur' : `Presensi di luar radius dapur (${distanceMeters ?? 0}m)`,
      };

      const res = await fetch(CLOUD_ATTENDANCE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resJson = await res.json();
      if (res.ok && resJson.success) {
        setSubmitSuccess({
          type,
          time: timeWib,
          volunteerName: selectedVolunteer.name,
          dutySection: selectedVolunteer.dutySection,
          distance: distanceMeters ?? 0,
          photo: capturedPhoto,
        });
      } else {
        alert(`Gagal menyimpan presensi: ${resJson.error || 'Terjadi kesalahan server.'}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Koneksi gagal';
      alert(`Terjadi kesalahan jaringan: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmitSuccess(null);
    setCapturedPhoto(null);
    setSelectedVolunteerId('');
    startWebCamera();
    refreshLocation();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Hidden Canvas untuk Watermark */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header Sticky */}
      <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center p-1 shadow-md shadow-blue-500/20">
              <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white tracking-tight block leading-tight">
                SPPG Wonodri 3
              </span>
              <span className="text-[10px] text-blue-400 font-semibold block">
                Presensi Realtime Mandiri
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-emerald-400 block leading-tight">
              {currentWib || '...'}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">
              {currentDateStr}
            </span>
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="max-w-md w-full mx-auto p-4 flex-1 space-y-4">
        {submitSuccess ? (
          /* ============ KARTU BUKTI SUKSES ABSEN ============ */
          <div className="bg-slate-800/90 border border-emerald-500/40 rounded-3xl p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
                Presensi {submitSuccess.type === 'IN' ? 'Masuk' : 'Pulang'} Berhasil!
              </span>
              <h2 className="text-xl font-black text-white mt-3">
                {submitSuccess.volunteerName}
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {submitSuccess.dutySection} • {submitSuccess.time}
              </p>
            </div>

            {/* Thumbnail Foto Selfie Ber-Watermark */}
            <div className="relative mx-auto w-52 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl">
              <img
                src={submitSuccess.photo}
                alt="Foto Selfie Presensi"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-emerald-500/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                VERIFIED
              </div>
            </div>

            <div className="bg-slate-900/80 rounded-2xl p-3 text-xs text-slate-300 border border-slate-700/60 space-y-1.5 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Status GPS:</span>
                <span className={submitSuccess.distance <= MAX_RADIUS_METERS ? "font-bold text-emerald-400" : "font-bold text-amber-400"}>
                  {submitSuccess.distance <= MAX_RADIUS_METERS ? `Di Dapur (${submitSuccess.distance}m)` : `Luar Dapur (${submitSuccess.distance}m)`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sinkronisasi Cloud:</span>
                <span className="font-bold text-blue-400">Cloudflare Realtime ✓</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetForm}
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow"
            >
              Kembali / Presensi Relawan Lain
            </button>
          </div>
        ) : (
          /* ============ FORM INPUT ABSEN ============ */
          <div className="space-y-4">
            {/* 1. Pilih Nama Relawan */}
            <div className={`bg-slate-800/80 border rounded-2xl p-4 shadow-sm relative transition-all ${
              nameError ? 'border-rose-500 ring-2 ring-rose-500/30' : selectedVolunteer ? 'border-emerald-500/60' : 'border-slate-700/80'
            }`}>
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>1. Pilih Nama Relawan:</span>
                </span>
                {selectedVolunteer && (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Terpilih
                  </span>
                )}
              </label>

              {/* Custom Searchable Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full bg-slate-900 border rounded-xl px-3.5 py-3 text-left text-xs font-bold text-white flex items-center justify-between transition cursor-pointer ${
                    nameError ? 'border-rose-500' : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="truncate">
                    {selectedVolunteer ? (
                      <div>
                        <span className="text-white text-sm block">{selectedVolunteer.name}</span>
                        <span className="text-[10px] text-blue-400 font-normal">
                          {selectedVolunteer.dutySection} (Shift: {selectedVolunteer.defaultCheckIn} - {selectedVolunteer.defaultCheckOut})
                        </span>
                      </div>
                    ) : (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <span>👉 Klik di sini untuk memilih nama Anda</span>
                      </span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                </button>

                {nameError && (
                  <p className="text-[11px] text-rose-400 font-bold mt-1.5">
                    {nameError}
                  </p>
                )}

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-72 flex flex-col animate-in fade-in duration-150">
                    <div className="p-2 border-b border-slate-800 sticky top-0 bg-slate-900">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Ketik nama untuk mencari..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-medium"
                          autoFocus
                        />
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>

                    <div className="overflow-y-auto divide-y divide-slate-800/60 p-1 flex-1">
                      {filteredVolunteers.length > 0 ? (
                        filteredVolunteers.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => {
                              setSelectedVolunteerId(v.id);
                              setNameError('');
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-lg transition flex items-center justify-between text-xs cursor-pointer ${
                              selectedVolunteerId === v.id ? 'bg-blue-600/30 border border-blue-500/40' : 'hover:bg-slate-800'
                            }`}
                          >
                            <div>
                              <p className="font-bold text-white leading-tight">{v.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {v.dutySection} • Jam Kerja: {v.defaultCheckIn} - {v.defaultCheckOut}
                              </p>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800/40 shrink-0">
                              No.{v.no}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-500 font-medium">
                          Nama tidak ditemukan dalam daftar.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Geolocation / Radius Geofence */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>2. Status Lokasi GPS:</span>
                </span>

                <button
                  type="button"
                  onClick={refreshLocation}
                  disabled={isLocating}
                  className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>Perbarui GPS</span>
                </button>
              </div>

              {isLocating ? (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center gap-2.5 text-xs text-slate-300">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                  <span>Mendeteksi koordinat satelit GPS HP Anda...</span>
                </div>
              ) : locationError ? (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Akses Lokasi Dibutuhkan</span>
                  </div>
                  <p className="text-[11px] text-rose-200">{locationError}</p>
                </div>
              ) : isLocationValid ? (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block leading-tight">
                      Lokasi Valid di Dapur SPPG Wonodri 3
                    </span>
                    <span className="text-[11px] text-emerald-200 font-mono block mt-0.5">
                      Jarak: {distanceMeters}m (Radius maks ketat: {MAX_RADIUS_METERS}m)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block leading-tight">
                      Di Luar Radius Dapur ({distanceMeters} meter)
                    </span>
                    <span className="text-[11px] text-rose-200 block mt-0.5">
                      Presensi hanya dapat dikirim jika Anda berada di dalam area dapur SPPG Wonodri 3 (Maksimal {MAX_RADIUS_METERS} meter).
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Live Camera View (Tampil Rapi di Box Web, Anti-Zoom) */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm space-y-3">
              <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-blue-400" />
                  <span>3. Foto Wajah Selfie:</span>
                </span>
                {capturedPhoto ? (
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                    Foto Siap ✓
                  </span>
                ) : isCameraActive ? (
                  <span className="text-[10px] text-blue-400 font-bold bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/40 animate-pulse">
                    Kamera Live Aktif
                  </span>
                ) : null}
              </span>

              {/* Frame Kamera Rapi (Portrait 3:4 Natural, Tidak Zoom) */}
              <div className="relative w-full max-w-[280px] aspect-[3/4] mx-auto bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-inner flex items-center justify-center">
                {/* 1. Preview Foto Terjepret */}
                {capturedPhoto ? (
                  <img
                    src={capturedPhoto}
                    alt="Selfie Preview"
                    className="w-full h-full object-cover"
                  />
                ) : null}

                {/* 2. Live Video Feed (Selalu Mounted di DOM, Anti-Zoom) */}
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  style={{ transform: 'scaleX(-1)' }}
                  className={`w-full h-full object-cover ${capturedPhoto ? 'hidden' : ''}`}
                />

                {/* 3. Panduan Wajah & Status */}
                {!capturedPhoto && isCameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-40 h-52 border-2 border-dashed border-white/50 rounded-full" />
                  </div>
                )}

                {!capturedPhoto && !isCameraActive && (
                  <div className="text-center p-4 space-y-2 z-10">
                    {cameraLoading ? (
                      <>
                        <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                        <p className="text-xs text-slate-400">Menghubungkan kamera...</p>
                      </>
                    ) : (
                      <>
                        <Camera className="w-10 h-10 text-slate-600 mx-auto" />
                        <p className="text-xs text-slate-400 font-medium">
                          Kamera siap diaktifkan
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-800 text-xs text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Tombol Kontrol Kamera */}
              <div>
                {!capturedPhoto ? (
                  isCameraActive ? (
                    <button
                      type="button"
                      onClick={captureFromWebCamera}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm rounded-xl transition shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                    >
                      <Camera className="w-4 h-4" />
                      <span>📸 Jepret Foto Selfie Sekarang</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startWebCamera}
                      disabled={cameraLoading}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow cursor-pointer disabled:opacity-50"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{cameraLoading ? 'Menghubungkan...' : 'Aktifkan Kamera di Layar'}</span>
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={handleRetakePhoto}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Ulangi / Jepret Foto Ulang</span>
                  </button>
                )}
              </div>
            </div>

            {/* 4. Tombol Aksi: Presensi Masuk / Pulang (ANTI-STUCK) */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmitAttendance('IN')}
                className="py-4 px-4 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 text-white font-black text-xs transition shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Mengirim...' : 'Presensi Masuk'}</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmitAttendance('OUT')}
                className="py-4 px-4 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-black text-xs transition shadow-lg shadow-blue-950/60 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{isSubmitting ? 'Mengirim...' : 'Presensi Pulang'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center font-medium leading-relaxed">
              Pastikan Anda sudah memilih nama pada langkah 1 dan menjepret foto selfie pada langkah 3 sebelum mengirim presensi.
            </p>
          </div>
        )}
      </main>

      {/* Footer Nav */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 p-3 text-center text-[10px] text-slate-500">
        <div className="flex items-center justify-center gap-3 mb-1">
          <Link href="/arsip" className="text-slate-400 hover:text-white transition">
            Arsip Menu MBG
          </Link>
          <span>•</span>
          <Link href="/absensi" className="text-slate-400 hover:text-white transition">
            Panel Otoritas SDM
          </Link>
        </div>
        <span>SPPG Wonodri 3 Semarang Selatan • Sistem Keterbukaan & Presensi Digital MBG</span>
      </footer>
    </div>
  );
}
