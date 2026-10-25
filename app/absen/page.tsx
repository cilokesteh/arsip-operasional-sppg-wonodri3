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
  Search
} from 'lucide-react';
import { DEFAULT_ROSTER_40 } from '@/lib/attendance';

// Koordinat Resmi Dapur SPPG Wonodri 3 Kota Semarang (Juknis BGN 2026)
const KITCHEN_LAT = -6.992554;
const KITCHEN_LNG = 110.425959;
const MAX_RADIUS_METERS = 150; // Radius toleransi GPS HP indoor (150 meter)
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

  // 3. Camera & Photo
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
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
          setLocationError('Izin akses lokasi ditolak. Silakan aktifkan GPS & izinkan lokasi pada browser HP.');
        } else {
          setLocationError('Gagal mendeteksi koordinat GPS. Pastikan GPS HP aktif.');
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
  const applyWatermark = (ctx: CanvasRenderingContext2D, size: number) => {
    // Watermark background box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(0, size - 88, size, 88);

    // Title SPPG
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('SPPG WONODRI 3 • PRESENSI REALTIME', 16, size - 60);

    // Date, Time & Volunteer Name
    ctx.fillStyle = '#ffffff';
    ctx.font = '13px sans-serif';
    const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    const dateFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const volunteerLabel = selectedVolunteer ? selectedVolunteer.name : 'Relawan SPPG';
    ctx.fillText(`${dateFormatted} • ${nowStr} • ${volunteerLabel}`, 16, size - 38);

    // Coordinates & Distance
    const isValid = distanceMeters !== null && distanceMeters <= MAX_RADIUS_METERS;
    ctx.fillStyle = isValid ? '#4ade80' : '#f87171';
    ctx.font = 'bold 12px monospace';
    const distText = distanceMeters !== null
      ? `📍 ${distanceMeters}m dari Dapur SPPG (${KITCHEN_LAT.toFixed(5)}, ${KITCHEN_LNG.toFixed(5)})`
      : '📍 GPS Terverifikasi';
    ctx.fillText(distText, 16, size - 16);
  };

  // 1. Jalur Utama: Live WebRTC Camera Stream
  const startLiveCamera = async () => {
    setCameraError('');
    setIsCameraActive(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Fallback langsung ke native camera
        triggerNativeCamera();
        return;
      }

      // Coba constraints yang paling kompatibel untuk semua HP Android/iOS
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'user' } },
          audio: false,
        });
      } catch {
        // Fallback constraint tanpa facingMode
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('autoplay', 'true');
        videoRef.current.setAttribute('muted', 'true');

        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch {
      // Jika browser memblokir WebRTC (misal di WebView Telegram/WhatsApp), arahkan ke Native Camera
      setCameraError('Kamera live terkendala izin. Mengalihkan ke Kamera HP...');
      setTimeout(() => {
        triggerNativeCamera();
      }, 500);
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

  // Jepret dari Video Stream
  const captureFromStream = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = Math.min(video.videoWidth || 640, video.videoHeight || 640, 720);
    canvas.width = size;
    canvas.height = size;

    const startX = ((video.videoWidth || size) - size) / 2;
    const startY = ((video.videoHeight || size) - size) / 2;
    ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

    applyWatermark(ctx, size);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  // 2. Jalur Native Camera HP (100% Berhasil di Semua HP & In-App Browser)
  const triggerNativeCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleNativePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = Math.min(img.width, img.height, 800);
        canvas.width = size;
        canvas.height = size;

        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;
        ctx.drawImage(img, startX, startY, size, size, 0, 0, size, size);

        applyWatermark(ctx, size);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedPhoto(dataUrl);
        setCameraError('');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const isLocationValid = distanceMeters !== null && distanceMeters <= MAX_RADIUS_METERS;

  // Submit Presensi ke Cloudflare KV
  const handleSubmitAttendance = async (type: 'IN' | 'OUT') => {
    if (!selectedVolunteer) {
      alert('Pilih nama Anda terlebih dahulu!');
      return;
    }
    if (!capturedPhoto) {
      alert('Silakan ambil foto selfie terlebih dahulu!');
      return;
    }
    if (distanceMeters === null) {
      alert('Lokasi GPS belum terdeteksi. Silakan klik tombol "Perbarui Lokasi GPS".');
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
        distanceMeters,
        isWithinRadius: isLocationValid,
        photoUrl: capturedPhoto,
        notes: isLocationValid ? 'Presensi Mandiri Valid di Dapur' : `Presensi di luar radius dapur (${distanceMeters}m)`,
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
          distance: distanceMeters,
          photo: capturedPhoto,
        });
      } else {
        alert(`Gagal menyimpan presensi: ${resJson.error || 'Server error'}`);
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
    stopCamera();
    refreshLocation();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Hidden Canvas untuk Watermark */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden Native Camera File Input (100% Kompatibel Semua HP) */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="user"
        onChange={handleNativePhotoUpload}
        className="hidden"
      />

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
            <div className="relative mx-auto w-48 h-48 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl">
              <img
                src={submitSuccess.photo}
                alt="Foto Selfie Presensi"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-emerald-500/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                VERIFIED
              </div>
            </div>

            <div className="bg-slate-900/80 rounded-2xl p-3 text-xs text-slate-300 border border-slate-700/60 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Status GPS:</span>
                <span className={submitSuccess.distance <= MAX_RADIUS_METERS ? "font-bold text-emerald-400" : "font-bold text-rose-400"}>
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
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm relative">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                <span>1. Pilih Nama Relawan:</span>
                <span className="text-[10px] text-blue-400 font-semibold lowercase">
                  ({activeVolunteers.length} personil)
                </span>
              </label>

              {/* Custom Searchable Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold text-white flex items-center justify-between hover:border-slate-600 transition cursor-pointer"
                >
                  <div className="truncate">
                    {selectedVolunteer ? (
                      <div>
                        <span className="text-white block">{selectedVolunteer.name}</span>
                        <span className="text-[10px] text-blue-400 font-normal">
                          {selectedVolunteer.dutySection} ({selectedVolunteer.defaultCheckIn} - {selectedVolunteer.defaultCheckOut})
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-normal">Cari nama Anda di sini...</span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-64 flex flex-col">
                    <div className="p-2 border-b border-slate-800 sticky top-0 bg-slate-900">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Ketik nama atau divisi..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-medium"
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
                              setIsDropdownOpen(false);
                            }}
                            className="w-full text-left p-2.5 rounded-lg hover:bg-slate-800 transition flex items-center justify-between text-xs cursor-pointer"
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
                  <span>Refresh GPS</span>
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
                      Jarak: {distanceMeters}m (Radius maks: {MAX_RADIUS_METERS}m)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800 text-xs text-amber-300 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block leading-tight">
                      Di Luar Radius Dapur ({distanceMeters} meter)
                    </span>
                    <span className="text-[11px] text-amber-200 block mt-0.5">
                      Presensi hanya diperbolehkan saat Anda sudah berada di lokasi dapur SPPG Wonodri 3 (Maksimal {MAX_RADIUS_METERS}m).
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Live Camera & Selfie Capture (Dual Mode: Live & Native HP) */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm space-y-3">
              <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-blue-400" />
                  <span>3. Foto Selfie di Dapur:</span>
                </span>
                {capturedPhoto && (
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                    Foto Siap ✓
                  </span>
                )}
              </span>

              {/* Viewport Kamera / Hasil Foto */}
              <div className="relative w-full aspect-square bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-700/80 flex items-center justify-center shadow-inner">
                {capturedPhoto ? (
                  <img
                    src={capturedPhoto}
                    alt="Selfie Preview"
                    className="w-full h-full object-cover"
                  />
                ) : isCameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      autoPlay
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Panduan Oval Wajah */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-60 border-2 border-dashed border-white/60 rounded-full" />
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <Camera className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400 font-medium">
                      Ambil foto selfie langsung dengan kamera HP
                    </p>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-800 text-xs text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Tombol Kontrol Kamera: Dual Action */}
              <div className="space-y-2">
                {!capturedPhoto ? (
                  isCameraActive ? (
                    <button
                      type="button"
                      onClick={captureFromStream}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 cursor-pointer animate-pulse"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Jepret Foto Sekarang</span>
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={triggerNativeCamera}
                        className="py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                        title="Buka Kamera HP Bawaan (Paling Mudah & Lancar)"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Buka Kamera HP</span>
                      </button>

                      <button
                        type="button"
                        onClick={startLiveCamera}
                        className="py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                        title="Nyalakan Live Video Kamera"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Live Preview</span>
                      </button>
                    </div>
                  )
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={triggerNativeCamera}
                      className="py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Foto Ulang (Kamera HP)</span>
                    </button>
                    <button
                      type="button"
                      onClick={startLiveCamera}
                      className="py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Foto Ulang (Live)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Tombol Aksi: Presensi Masuk / Pulang */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting || !selectedVolunteer || !capturedPhoto || !isLocationValid}
                onClick={() => handleSubmitAttendance('IN')}
                className="py-3.5 px-4 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs transition shadow-lg shadow-emerald-950/60 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Mengirim...' : 'Presensi Masuk'}</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting || !selectedVolunteer || !capturedPhoto || !isLocationValid}
                onClick={() => handleSubmitAttendance('OUT')}
                className="py-3.5 px-4 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs transition shadow-lg shadow-blue-950/60 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{isSubmitting ? 'Mengirim...' : 'Presensi Pulang'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 text-center font-medium leading-relaxed">
              Tombol akan aktif setelah memilih nama, berada dalam radius dapur ({MAX_RADIUS_METERS}m), dan mengambil foto selfie.
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
