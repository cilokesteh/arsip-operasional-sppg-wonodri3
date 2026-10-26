'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  INITIAL_MENU_HISTORY,
  STANDARD_AKG_REFERENCE,
  DailyMenuRecord,
  getBeneficiariesForDate,
} from '@/lib/data';
import {
  Calendar as CalendarIcon,
  Printer,
  ChevronLeft,
  ChevronRight,
  X,
  FileSpreadsheet,
  Search,
  Clock,
  PlusCircle,
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  Users,
  Utensils,
  Download,
  Plus,
  Edit2,
  Save,
  CheckCircle2,
  UserCheck,
  Archive,
  Table as TableIcon,
  Menu,
  ArrowUpRight,
  ExternalLink,
  LayoutDashboard,
  ClipboardList,
} from 'lucide-react';
import { formatTanggalIndo } from '@/lib/dateUtils';
import { fetchMenusFromCloud } from '@/lib/cloudSync';
import staticMenusData from '@/lib/staticMenus.json';
import {
  AttendanceEntry,
  AttendanceStatus,
  VolunteerProfile,
  DEFAULT_ROSTER_40,
  DUTY_SECTIONS,
  STATUS_ORDER,
  buildDailyEntries,
  normalizeAttendanceEntry,
  mergeAttendanceDay,
  calculatePeriodSummary,
  createAttendanceCsv,
  formatRupiah,
  formatIndoDate,
  getWeekDays,
  toIsoDateLocal,
  loadRosterFromStorage,
  saveRosterToStorage,
  loadLedgerFromStorage,
  saveLedgerToStorage,
} from '@/lib/attendance';

// Foto valid: harus data URL gambar dan panjangnya wajar (foto asli 10-25 KB).
// Base64 pendek (< 2 KB) berarti capture kamera gagal / gambar kosong.
function isValidPhoto(photo: unknown): photo is string {
  if (!photo || typeof photo !== 'string') return false;
  if (!photo.startsWith('data:image/')) return false;
  return photo.length >= 2048;
}

export type MainCategory = 'arsip' | 'absensi';
export type AbsensiSubTab = 'harian' | 'rekap' | 'arsip' | 'roster';

export interface UnifiedPortalProps {
  initialCategory?: MainCategory;
}

export function UnifiedPortal({ initialCategory = 'arsip' }: UnifiedPortalProps) {
  // -------------------------------------------------------------
  // DUA KATEGORI UTAMA DALAM 1 PORTAL
  // -------------------------------------------------------------
  const [mainCategory, setMainCategory] = useState<MainCategory>(initialCategory);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // =============================================================
  // KATEGORI 1: ARSIP OPERASIONAL MBG
  // =============================================================
  const [menuHistory, setMenuHistory] = useState<DailyMenuRecord[]>(
    (staticMenusData as unknown as DailyMenuRecord[]) || INITIAL_MENU_HISTORY
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    initialCategory === 'absensi'
      ? toIsoDateLocal(new Date())
      : (staticMenusData && staticMenusData.length > 0 ? staticMenusData[0].date : '2026-10-21')
  );
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [searchBeneficiary, setSearchBeneficiary] = useState<string>('');
  const [calendarMonth, setCalendarMonth] = useState<number>(9);
  const [calendarYear, setCalendarYear] = useState<number>(2026);

  // Proteksi PIN Cetak Menu
  const [showPinModalMenu, setShowPinModalMenu] = useState<boolean>(false);
  const [inputPinMenu, setInputPinMenu] = useState<string>('');
  const [pinErrorMenu, setPinErrorMenu] = useState<string>('');
  const OFFICIAL_PRINT_PIN = '91206';

  const handleOpenPrintModalMenu = () => {
    const sessionAuth = sessionStorage.getItem('sppg_print_auth');
    if (sessionAuth === 'true') {
      window.print();
    } else {
      setInputPinMenu('');
      setPinErrorMenu('');
      setShowPinModalMenu(true);
    }
  };

  const handleVerifyPinMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPinMenu.trim() === OFFICIAL_PRINT_PIN) {
      sessionStorage.setItem('sppg_print_auth', 'true');
      setShowPinModalMenu(false);
      setInputPinMenu('');
      setPinErrorMenu('');
      setTimeout(() => window.print(), 300);
    } else {
      setPinErrorMenu('PIN verifikasi salah! Khusus operator resmi.');
    }
  };

  useEffect(() => {
    try {
      const storedV1 = localStorage.getItem('sppg_synced_menus');
      const storedV2 = localStorage.getItem('sppg_synced_menus_v2');
      const listV1 = storedV1 ? JSON.parse(storedV1) : [];
      const listV2 = storedV2 ? JSON.parse(storedV2) : [];
      const byDate = new Map<string, DailyMenuRecord>();
      (Array.isArray(listV2) ? listV2 : []).forEach((m: DailyMenuRecord) => { if (m?.date) byDate.set(m.date, m); });
      (Array.isArray(listV1) ? listV1 : []).forEach((m: DailyMenuRecord) => { if (m?.date) byDate.set(m.date, m); });
      const combined = Array.from(byDate.values()).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      if (combined.length > 0) {
        setMenuHistory(combined);
        if (initialCategory !== 'absensi') {
          setSelectedDate(combined[0].date);
        }
      }
    } catch {
      // fallback
    }

    fetchMenusFromCloud().then((cloudMenus) => {
      if (cloudMenus && cloudMenus.length > 0) {
        setMenuHistory((prev) => {
          const byDate = new Map<string, DailyMenuRecord>();
          cloudMenus.forEach((c) => byDate.set(c.date, c));
          prev.forEach((localItem) => {
            const cloudItem = byDate.get(localItem.date);
            if (!cloudItem) {
              byDate.set(localItem.date, localItem);
            } else {
              const mergedPhotos =
                localItem.photos && localItem.photos.length > 0 ? localItem.photos : cloudItem.photos;
              const mergedMenuPhoto =
                localItem.menuPhotoUrl && localItem.menuPhotoUrl.trim() !== ''
                  ? localItem.menuPhotoUrl
                  : cloudItem.menuPhotoUrl;
              byDate.set(localItem.date, {
                ...cloudItem,
                ...localItem,
                photos: mergedPhotos,
                menuPhotoUrl: mergedMenuPhoto,
              });
            }
          });
          return Array.from(byDate.values()).sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        });
      }
    });
  }, []);

  const currentMenu = useMemo(() => {
    return menuHistory.find((m) => m.date === selectedDate);
  }, [menuHistory, selectedDate]);

  const rawBeneficiaries = useMemo(() => getBeneficiariesForDate(selectedDate), [selectedDate]);
  const activeBeneficiaries = useMemo(() => {
    return rawBeneficiaries.map((site) => {
      const override = currentMenu?.overrides?.find((o) => o.siteId === site.id);
      if (override && override.condition === 'libur') {
        return { ...site, masterCount: 0, reason: override.reason || 'Libur' };
      }
      if (override && override.condition === 'penyesuaian') {
        return { ...site, masterCount: override.effectiveCount, reason: override.reason };
      }
      return site;
    });
  }, [rawBeneficiaries, currentMenu]);

  const totalMaster = useMemo(() => {
    return activeBeneficiaries.reduce((acc, site) => acc + site.masterCount, 0);
  }, [activeBeneficiaries]);

  const filteredBeneficiaries = useMemo(() => {
    return activeBeneficiaries.filter((b) => b.name.toLowerCase().includes(searchBeneficiary.toLowerCase()));
  }, [activeBeneficiaries, searchBeneficiary]);

  // Calendar Helpers
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const availableDatesSet = useMemo(() => new Set(menuHistory.map((m) => m.date)), [menuHistory]);

  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };
  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  // =============================================================
  // KATEGORI 2: ABSENSI & SDM RELAWAN
  // =============================================================
  const [roster, setRoster] = useState<VolunteerProfile[]>(DEFAULT_ROSTER_40);
  const [ledger, setLedger] = useState<AttendanceEntry[]>([]);
  const [currentDayDraft, setCurrentDayDraft] = useState<AttendanceEntry[]>([]);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const [absensiSubTab, setAbsensiSubTab] = useState<AbsensiSubTab>('harian');
  const [rekapPeriod, setRekapPeriod] = useState<'harian' | 'mingguan' | 'bulanan'>('harian');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');

  const [searchName, setSearchName] = useState<string>('');
  const [filterSection, setFilterSection] = useState<string>('Semua');
  const [searchArsip, setSearchArsip] = useState<string>('');

  const [editingVolunteer, setEditingVolunteer] = useState<VolunteerProfile | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showPrintModalAbsensi, setShowPrintModalAbsensi] = useState<boolean>(false);
  const [printDateTarget, setPrintDateTarget] = useState<string>('2026-10-21');

  // Proteksi PIN Gaji
  const [isSalaryUnlocked, setIsSalaryUnlocked] = useState<boolean>(false);
  const [showPinModalSalary, setShowPinModalSalary] = useState<boolean>(false);
  const [pinInputSalary, setPinInputSalary] = useState<string>('');
  const [pinErrorSalary, setPinErrorSalary] = useState<string>('');
  const [pinPendingActionSalary, setPinPendingActionSalary] = useState<'unlock' | 'print' | 'export' | null>(null);

  // Modal Foto Selfie Presensi Realtime
  const [viewingPhotoModal, setViewingPhotoModal] = useState<{ url: string; name: string; time: string; distance?: number } | null>(null);

  // Form states Roster
  const [newPersonName, setNewPersonName] = useState<string>('');
  const [newPersonSection, setNewPersonSection] = useState<string>('Pemorsian');
  const [newPersonRate, setNewPersonRate] = useState<string>('125000');
  const [newPersonCheckIn, setNewPersonCheckIn] = useState<string>('04:00');
  const [newPersonCheckOut, setNewPersonCheckOut] = useState<string>('12:00');

  const [editNameInput, setEditNameInput] = useState<string>('');
  const [editRateInput, setEditRateInput] = useState<string>('');
  const [editSectionInput, setEditSectionInput] = useState<string>('');
  const [editCheckInInput, setEditCheckInInput] = useState<string>('');
  const [editCheckOutInput, setEditCheckOutInput] = useState<string>('');
  const [editIsActiveInput, setEditIsActiveInput] = useState<boolean>(true);
  const [editNotesInput, setEditNotesInput] = useState<string>('');

  useEffect(() => {
    const loadedRoster = loadRosterFromStorage();
    const loadedLedger = loadLedgerFromStorage(loadedRoster);
    setRoster(loadedRoster);
    setLedger(loadedLedger);

    try {
      const isUnlocked = sessionStorage.getItem('sppg_salary_unlocked') === 'true';
      setIsSalaryUnlocked(isUnlocked);
    } catch {
      // ignore
    }

    let activeDate = selectedDate;
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const qDate = params.get('date');
        if (qDate) {
          activeDate = qDate;
          setSelectedDate(qDate);
        } else if (initialCategory === 'absensi') {
          activeDate = toIsoDateLocal(new Date());
          setSelectedDate(activeDate);
        }
      } catch {}
    }

    // Inisialisasi draft langsung dari loadedLedger yang ada di storage
    const dayEntries = loadedLedger.filter((entry) => entry.date === activeDate);
    if (dayEntries.length > 0) {
      setCurrentDayDraft(dayEntries);
    } else {
      const fresh = buildDailyEntries(loadedRoster, activeDate);
      if (activeDate > todayDateStr) {
        setCurrentDayDraft(
          fresh.map((e) => ({
            ...e,
            status: 'Libur' as AttendanceStatus,
            earnedAmount: 0,
            paid: false,
            notes: 'Belum Terlewati',
          }))
        );
      } else {
        setCurrentDayDraft(fresh);
      }
    }
    prevSelectedDateRef.current = activeDate;
  }, []);

  const todayDateStr = useMemo(() => toIsoDateLocal(new Date()), []);

  // Reset draft HANYA saat tanggal berganti — BUKAN setiap ledger berubah.
  const prevSelectedDateRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevSelectedDateRef.current === selectedDate) return;
    prevSelectedDateRef.current = selectedDate;

    const dayEntries = ledger.filter((entry) => entry.date === selectedDate);
    if (dayEntries.length > 0) {
      setCurrentDayDraft(dayEntries);
    } else {
      // Jika tanggal hari ini atau masa lalu: inisialisasi draft kerja.
      // Jika tanggal masa depan: jangan auto-hadirkan, biarkan kosong/status future
      const fresh = buildDailyEntries(roster, selectedDate);
      if (selectedDate > todayDateStr) {
        // Tanggal masa depan: default status belum operasional (kosongkan upah)
        const futureClean = fresh.map((e) => ({
          ...e,
          status: 'Libur' as AttendanceStatus,
          earnedAmount: 0,
          paid: false,
          notes: 'Belum Terlewati',
        }));
        setCurrentDayDraft(futureClean);
      } else {
        setCurrentDayDraft(fresh);
      }
    }
    setIsDirty(false);
  }, [selectedDate, ledger, roster, todayDateStr]);

  const rosterMap = useMemo(() => new Map<string, VolunteerProfile>(roster.map((v) => [v.id, v])), [roster]);

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  // Sinkronisasi Presensi Realtime Mandiri dari Cloudflare KV
  // Menulis ke currentDayDraft (tabel harian) DAN ledger (rekap harian/mingguan/bulanan + cetak SPJ)
  useEffect(() => {
    let isCancelled = false;
    const fetchCloudAttendance = async () => {
      try {
        const res = await fetch(`https://sppg-sync-worker.cilokesteh.workers.dev/api/attendance?date=${selectedDate}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.records) && data.records.length > 0 && !isCancelled) {
          interface CloudRecord {
            volunteerId: string;
            time?: string;
            checkInTime?: string;
            checkOutTime?: string;
            photoUrl?: string;
            checkInPhoto?: string;
            distanceMeters?: number;
            isWithinRadius?: boolean;
            status?: AttendanceStatus;
            notes?: string;
            paid?: boolean;
            earnedAmount?: number;
          }
          const cloudMap = new Map<string, CloudRecord>(data.records.map((r: CloudRecord) => [r.volunteerId, r]));
          setCurrentDayDraft((prev) => {
            return prev.map((entry) => {
              const cloud = cloudMap.get(entry.volunteerId);
              if (cloud) {
                const person = rosterMap.get(entry.volunteerId);
                const cloudStatus = (cloud.status as AttendanceStatus) || 'Hadir';
                const isPresent = cloudStatus === 'Hadir' && (person ? person.isActive : true);
                return {
                  ...entry,
                  status: cloudStatus,
                  checkIn: cloud.checkInTime || cloud.time || entry.checkIn,
                  checkOut: cloud.checkOutTime || entry.checkOut,
                  earnedAmount: person ? (isPresent ? person.dailyRate : 0) : (cloud.earnedAmount ?? entry.earnedAmount),
                  notes: cloud.notes || (cloud.isWithinRadius
                    ? `📍 Realtime Selfie (${cloud.distanceMeters ?? 0}m)`
                    : `⚠️ Luar Dapur (${cloud.distanceMeters ?? 0}m)`),
                  photoUrl: isValidPhoto(cloud.checkInPhoto || cloud.photoUrl)
                    ? (cloud.checkInPhoto || cloud.photoUrl)
                    : entry.photoUrl,
                  distanceMeters: cloud.distanceMeters ?? entry.distanceMeters,
                  isWithinRadius: cloud.isWithinRadius ?? entry.isWithinRadius,
                  paid: cloud.paid ?? entry.paid,
                };
              }
              return entry;
            });
          });

          // TULIS KE LEDGER — sumber data rekap harian, mingguan, bulanan, dan cetak SPJ
          setLedger((prevLedger) => {
            const others = prevLedger.filter((e) => e.date !== selectedDate);
            const dayEntries = prevLedger.filter((e) => e.date === selectedDate);
            const dayMap = new Map(dayEntries.map((e) => [e.volunteerId, e]));

            cloudMap.forEach((cloud, volunteerId) => {
              const person = rosterMap.get(volunteerId);
              if (!person) return;
              const existing = dayMap.get(volunteerId);
              const cloudStatus = (cloud.status as AttendanceStatus) || 'Hadir';
              const isPresent = cloudStatus === 'Hadir' && person.isActive;
              const base =
                existing ||
                ({
                  id: `${selectedDate}:${volunteerId}`,
                  volunteerId,
                  date: selectedDate,
                  status: cloudStatus,
                  checkIn: person.defaultCheckIn,
                  checkOut: person.defaultCheckOut,
                  earnedAmount: isPresent ? person.dailyRate : 0,
                  notes: '',
                } as AttendanceEntry);
              dayMap.set(volunteerId, {
                ...base,
                status: cloudStatus,
                checkIn: cloud.checkInTime || cloud.time || base.checkIn,
                checkOut: cloud.checkOutTime || base.checkOut,
                earnedAmount: isPresent ? person.dailyRate : 0,
                notes: cloud.notes || (cloud.isWithinRadius
                  ? `📍 Realtime Selfie (${cloud.distanceMeters ?? 0}m)`
                  : `⚠️ Luar Dapur (${cloud.distanceMeters ?? 0}m)`),
                photoUrl: isValidPhoto(cloud.checkInPhoto || cloud.photoUrl)
                  ? (cloud.checkInPhoto || cloud.photoUrl)
                  : base.photoUrl,
                distanceMeters: cloud.distanceMeters ?? base.distanceMeters,
                isWithinRadius: cloud.isWithinRadius ?? base.isWithinRadius,
                paid: cloud.paid ?? base.paid,
              });
            });

            return [...others, ...Array.from(dayMap.values())];
          });
        }
      } catch (err) {
        console.warn('Realtime cloud attendance sync error:', err);
      }
    };

    fetchCloudAttendance();
    const interval = setInterval(fetchCloudAttendance, 5000); // Polling cepat 5 detik
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [selectedDate, rosterMap]);

  // Sinkronisasi MULTI-TANGGAL untuk rekap mingguan & bulanan
  // Menarik presensi realtime semua tanggal dalam rentang minggu aktif
  useEffect(() => {
    let isCancelled = false;

    const fetchWeekCloud = async () => {
      const weekStart = weekDays[0]?.date;
      const weekEnd = weekDays[weekDays.length - 1]?.date;
      if (!weekStart || !weekEnd) return;

      // Kumpulkan tanggal Senin..hari ini (jangan menarik tanggal masa depan)
      const dates: string[] = [];
      const cur = new Date(`${weekStart}T12:00:00`);
      const end = new Date(`${weekEnd}T12:00:00`);
      const today = todayDateStr;
      while (cur <= end) {
        const iso = toIsoDateLocal(cur);
        if (iso <= today) dates.push(iso);
        cur.setDate(cur.getDate() + 1);
      }

      const results = await Promise.all(
        dates.map(async (d) => {
          try {
            const r = await fetch(`https://sppg-sync-worker.cilokesteh.workers.dev/api/attendance?date=${d}`);
            if (!r.ok) return null;
            const j = await r.json();
            if (j?.success && Array.isArray(j.records)) return { date: d, records: j.records };
          } catch {
            /* abaikan tanggal yang gagal */
          }
          return null;
        })
      );

      if (isCancelled) return;
      const valid = results.filter(Boolean) as { date: string; records: Record<string, unknown>[] }[];
      if (valid.length === 0) return;

      setLedger((prevLedger) => {
        let next = prevLedger;
        let changed = false;

        for (const { date, records } of valid) {
          for (const rec of records) {
            const volunteerId = String(rec.volunteerId || '');
            const person = rosterMap.get(volunteerId);
            if (!person) continue;

            const checkInTime = String(rec.checkInTime || rec.time || '');
            const rawPhoto = (rec.checkInPhoto as string) || (rec.photoUrl as string) || undefined;
            const photo = isValidPhoto(rawPhoto) ? rawPhoto : undefined;
            const dist = rec.distanceMeters as number | undefined;
            const within = rec.isWithinRadius as boolean | undefined;

            const existing = next.find((e) => e.date === date && e.volunteerId === volunteerId);
            const merged: AttendanceEntry =
              existing ||
              ({
                id: `${date}:${volunteerId}`,
                volunteerId,
                date,
                status: 'Hadir',
                checkIn: person.defaultCheckIn,
                checkOut: person.defaultCheckOut,
                earnedAmount: person.dailyRate,
                notes: '',
              } as AttendanceEntry);

            const alreadySynced =
              existing &&
              existing.status === 'Hadir' &&
              existing.checkIn === checkInTime &&
              existing.photoUrl === photo;
            if (alreadySynced) continue;

            changed = true;
            const updated: AttendanceEntry = {
              ...merged,
              status: 'Hadir',
              checkIn: checkInTime || merged.checkIn,
              earnedAmount: person.dailyRate,
              notes:
                within === false
                  ? `⚠️ Luar Dapur (${dist ?? 0}m)`
                  : `📍 Realtime Selfie (${dist ?? 0}m)`,
              photoUrl: photo,
              distanceMeters: dist,
              isWithinRadius: within,
            };
            next = existing
              ? next.map((e) => (e === existing ? updated : e))
              : [...next, updated];
          }
        }

        return changed ? next : prevLedger;
      });
    };

    fetchWeekCloud();
    const interval = setInterval(fetchWeekCloud, 20000); // Rekap mingguan: refresh 20 detik
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [weekDays, rosterMap, todayDateStr]);

  const absentPersonnel = useMemo(() => {
    return currentDayDraft
      .filter((entry) => entry.status === 'Izin' || entry.status === 'Sakit' || entry.status === 'Alpha')
      .map((entry) => {
        const person = rosterMap.get(entry.volunteerId);
        return {
          id: entry.volunteerId,
          no: person?.no ?? 0,
          name: person?.name || entry.volunteerId,
          status: entry.status,
          section: person?.dutySection || '',
          notes: entry.notes,
        };
      })
      .sort((a, b) => a.no - b.no);
  }, [currentDayDraft, rosterMap]);

  // Toggle Status Presensi Fleksibel (Hadir, Izin, Sakit, Alpha) - Bisa diklik ulang / reversal jika salah klik
  const handleSelectStatus = (volunteerId: string, status: AttendanceStatus) => {
    const person = rosterMap.get(volunteerId);
    if (!person || !person.isActive) return;

    setCurrentDayDraft((prev) =>
      prev.map((entry) => {
        if (entry.volunteerId === volunteerId) {
          // Jika status yang sama diklik lagi, bisa uncheck kembali ke Belum Absen
          const nextStatus = entry.status === status ? ('Belum Absen' as AttendanceStatus) : status;
          const isPresent = nextStatus === 'Hadir';

          const raw = {
            ...entry,
            status: nextStatus,
            checkIn: isPresent ? (entry.checkIn || person.defaultCheckIn) : '',
            checkOut: isPresent ? (entry.checkOut || person.defaultCheckOut) : '',
            earnedAmount: isPresent ? person.dailyRate : 0,
            paid: isPresent ? entry.paid : false,
            notes: nextStatus === 'Belum Absen' ? '' : (entry.notes || nextStatus),
          };
          return normalizeAttendanceEntry(raw, person);
        }
        return entry;
      })
    );
    setIsDirty(true);
  };

  const handleUpdateNotes = (volunteerId: string, notes: string) => {
    setCurrentDayDraft((prev) =>
      prev.map((entry) => (entry.volunteerId === volunteerId ? { ...entry, notes } : entry))
    );
    setIsDirty(true);
  };

  const handleTogglePaid = (volunteerId: string) => {
    setCurrentDayDraft((prev) =>
      prev.map((entry) => {
        if (entry.volunteerId === volunteerId) {
          if (entry.status !== 'Hadir') return entry;
          return { ...entry, paid: !entry.paid };
        }
        return entry;
      })
    );
    setIsDirty(true);
  };

  const handleMarkAllActivePresent = () => {
    setCurrentDayDraft((prev) =>
      prev.map((entry) => {
        const person = rosterMap.get(entry.volunteerId);
        if (!person || !person.isActive) return entry;
        return normalizeAttendanceEntry(
          { ...entry, status: 'Hadir', checkIn: person.defaultCheckIn, checkOut: person.defaultCheckOut },
          person
        );
      })
    );
    setIsDirty(true);
  };

  const handleSaveAttendance = () => {
    const updatedLedger = mergeAttendanceDay(ledger, selectedDate, currentDayDraft);
    setLedger(updatedLedger);
    saveLedgerToStorage(updatedLedger);
    setIsDirty(false);
    setSaveToast(`✓ Presensi ${formatIndoDate(selectedDate)} tersimpan!`);
    setTimeout(() => setSaveToast(null), 3000);

    // SINKRONKAN JUGA ARSIP HARIAN KE CLOUDFLARE KV (MULTI-DEVICE & PERMANEN)
    fetch('https://sppg-sync-worker.cilokesteh.workers.dev/api/attendance/day', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: selectedDate,
        records: currentDayDraft.map((e) => ({
          volunteerId: e.volunteerId,
          date: e.date,
          status: e.status,
          checkIn: e.checkIn,
          checkOut: e.checkOut,
          checkInTime: e.checkIn,
          checkOutTime: e.checkOut,
          earnedAmount: e.earnedAmount,
          notes: e.notes,
          paid: e.paid,
          photoUrl: e.photoUrl,
          checkInPhoto: e.photoUrl,
          distanceMeters: e.distanceMeters,
          isWithinRadius: e.isWithinRadius,
        })),
      }),
    }).catch((err) => console.warn('Gagal sync presensi harian ke Cloudflare KV:', err));
  };

  const handleShiftDate = (daysOffset: number) => {
    if (isDirty) {
      if (!window.confirm('Ada perubahan presensi belum disimpan. Tetap pindah tanggal?')) return;
    }
    const current = new Date(`${selectedDate}T12:00:00`);
    current.setDate(current.getDate() + daysOffset);
    setSelectedDate(toIsoDateLocal(current));
  };

  // Roster Management (Edit & Tambah Relawan)
  const handleSaveEditRoster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVolunteer) return;

    const rateNum = parseFloat(editRateInput) || 0;
    const updatedName = editNameInput.trim().toUpperCase() || editingVolunteer.name;
    const updatedRoster = roster.map((p) => {
      if (p.id === editingVolunteer.id) {
        return {
          ...p,
          name: updatedName,
          dailyRate: rateNum,
          dutySection: editSectionInput,
          defaultCheckIn: editCheckInInput,
          defaultCheckOut: editCheckOutInput,
          isActive: editIsActiveInput,
          notes: editNotesInput,
        };
      }
      return p;
    });

    setRoster(updatedRoster);
    saveRosterToStorage(updatedRoster);

    const updatedPerson = updatedRoster.find((p) => p.id === editingVolunteer.id);
    if (updatedPerson) {
      setCurrentDayDraft((prev) =>
        prev.map((entry) => (entry.volunteerId === updatedPerson.id ? normalizeAttendanceEntry(entry, updatedPerson) : entry))
      );
      setIsDirty(true);
    }

    setEditingVolunteer(null);
    setSaveToast(`✓ Data relawan ${updatedName} berhasil diperbarui.`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleAddPersonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;

    const nextNo = roster.length + 1;
    const newId = `v-${Date.now()}`;
    const newName = newPersonName.trim().toUpperCase();
    const newPerson: VolunteerProfile = {
      id: newId,
      no: nextNo,
      name: newName,
      dutySection: newPersonSection,
      dailyRate: parseFloat(newPersonRate) || 125000,
      isActive: true,
      defaultCheckIn: newPersonCheckIn,
      defaultCheckOut: newPersonCheckOut,
    };

    const updatedRoster = [...roster, newPerson];
    setRoster(updatedRoster);
    saveRosterToStorage(updatedRoster);

    const newEntry: AttendanceEntry = {
      id: `${selectedDate}:${newId}`,
      volunteerId: newId,
      date: selectedDate,
      status: 'Belum Absen',
      checkIn: '',
      checkOut: '',
      scheduledIn: newPersonCheckIn,
      scheduledOut: newPersonCheckOut,
      lateMinutes: 0,
      overtimeMinutes: 0,
      earnedAmount: 0,
      notes: '',
      paid: false,
      recordedAt: new Date().toISOString(),
      recordedBy: 'Admin SPPG',
    };

    setCurrentDayDraft((prev) => [...prev, newEntry]);
    setIsDirty(true);

    setNewPersonName('');
    setShowAddModal(false);
    setSaveToast(`✓ Relawan baru ${newName} berhasil ditambahkan.`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // PIN security actions
  const handleOpenPinModalSalary = (action: 'unlock' | 'print' | 'export' = 'unlock') => {
    setPinPendingActionSalary(action);
    setPinInputSalary('');
    setPinErrorSalary('');
    setShowPinModalSalary(true);
  };

  const handleVerifySalaryPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInputSalary.trim() === OFFICIAL_PRINT_PIN) {
      setIsSalaryUnlocked(true);
      try {
        sessionStorage.setItem('sppg_salary_unlocked', 'true');
      } catch {
        // ignore
      }
      setShowPinModalSalary(false);
      setPinInputSalary('');
      setPinErrorSalary('');

      if (pinPendingActionSalary === 'print') {
        setShowPrintModalAbsensi(true);
      } else if (pinPendingActionSalary === 'export') {
        executeExportCsv();
      }
      setPinPendingActionSalary(null);
    } else {
      setPinErrorSalary('PIN salah! Akses khusus pimpinan/operator resmi.');
    }
  };

  const handleLockSalary = () => {
    setIsSalaryUnlocked(false);
    try {
      sessionStorage.removeItem('sppg_salary_unlocked');
    } catch {
      // ignore
    }
  };

  const renderSalary = (amount: number, isStrikethrough = false) => {
    if (!isSalaryUnlocked) {
      return (
        <button
          type="button"
          onClick={() => handleOpenPinModalSalary('unlock')}
          className="inline-flex items-center gap-1 font-mono text-xs text-slate-400 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
          title="Klik untuk membuka proteksi PIN upah"
        >
          <Lock className="w-3 h-3 text-slate-400" />
          <span>••••••</span>
        </button>
      );
    }
    return (
      <span className={isStrikethrough ? 'line-through text-slate-400 font-mono text-xs' : 'text-blue-900 font-mono font-bold text-xs'}>
        {formatRupiah(amount)}
      </span>
    );
  };

  const handleExportCsv = () => {
    if (!isSalaryUnlocked) {
      handleOpenPinModalSalary('export');
      return;
    }
    executeExportCsv();
  };

  const executeExportCsv = () => {
    let exportEntries = currentDayDraft;
    let fileSuffix = selectedDate;

    if (absensiSubTab === 'rekap') {
      if (rekapPeriod === 'harian') {
        exportEntries = currentDayDraft;
        fileSuffix = `Harian-${selectedDate}`;
      } else if (rekapPeriod === 'mingguan') {
        const week = getWeekDays(selectedDate);
        exportEntries = ledger.filter((e) => e.date >= week[0].date && e.date <= week[week.length - 1].date);
        fileSuffix = `Week-${week[0].date}_sampai_${week[week.length - 1].date}`;
      } else {
        exportEntries = ledger.filter((e) => e.date.startsWith(selectedMonth));
        fileSuffix = `Bulan-${selectedMonth}`;
      }
    }

    const csvContent = createAttendanceCsv(exportEntries, roster, 'SPPG Wonodri 3');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Rekap_Absensi_SPPG_Wonodri3_${fileSuffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenPrintForDate = (date: string) => {
    setPrintDateTarget(date);
    if (!isSalaryUnlocked) {
      handleOpenPinModalSalary('print');
    } else {
      setShowPrintModalAbsensi(true);
    }
  };

  // Summaries
  const dailySummary = useMemo(() => calculatePeriodSummary(currentDayDraft), [currentDayDraft]);

  // Summaries: HANYA rekap data yang benar-benar tersimpan di ledger dan tidak melampaui hari ini / tanggal aktif
  const weeklyLedgerMap = useMemo(() => {
    const map = new Map<string, AttendanceStatus>();
    const start = weekDays[0].date;
    const end = weekDays[weekDays.length - 1].date;
    ledger
      .filter((e) => e.date >= start && e.date <= end && e.date <= todayDateStr)
      .forEach((e) => map.set(`${e.volunteerId}:${e.date}`, e.status));
    return map;
  }, [ledger, weekDays, todayDateStr]);

  const weeklySummary = useMemo(() => {
    const start = weekDays[0].date;
    const end = weekDays[weekDays.length - 1].date;
    const entries = ledger.filter((e) => e.date >= start && e.date <= end && e.date <= todayDateStr);
    return calculatePeriodSummary(entries);
  }, [ledger, weekDays, todayDateStr]);

  const monthlyEntries = useMemo(() => {
    return ledger.filter((e) => e.date.startsWith(selectedMonth) && e.date <= todayDateStr);
  }, [ledger, selectedMonth, todayDateStr]);

  const monthlySummary = useMemo(() => calculatePeriodSummary(monthlyEntries), [monthlyEntries]);

  const archivedDatesList = useMemo(() => {
    const dateSet = new Set<string>();
    ledger.forEach((e) => {
      if (e.date <= todayDateStr) {
        dateSet.add(e.date);
      }
    });
    if (selectedDate <= todayDateStr) {
      dateSet.add(selectedDate);
    }
    const list = Array.from(dateSet).sort((a, b) => b.localeCompare(a));
    if (!searchArsip.trim()) return list;
    return list.filter((d) => d.includes(searchArsip) || formatIndoDate(d).toLowerCase().includes(searchArsip.toLowerCase()));
  }, [ledger, selectedDate, searchArsip, todayDateStr]);

  const filteredDailyDraft = useMemo(() => {
    return currentDayDraft.filter((entry) => {
      const person = rosterMap.get(entry.volunteerId);
      if (!person) return false;
      const matchName = person.name.toLowerCase().includes(searchName.toLowerCase());
      const matchSection = filterSection === 'Semua' || person.dutySection === filterSection;
      return matchName && matchSection;
    });
  }, [currentDayDraft, rosterMap, searchName, filterSection]);

  const printableEntries = useMemo(() => {
    if (printDateTarget === selectedDate) return currentDayDraft;
    const target = ledger.filter((e) => e.date === printDateTarget);
    if (target.length > 0) return target;
    return buildDailyEntries(roster, printDateTarget);
  }, [printDateTarget, selectedDate, currentDayDraft, ledger, roster]);

  const printableSummary = useMemo(() => calculatePeriodSummary(printableEntries), [printableEntries]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased w-full overflow-x-hidden">
      {/* 1. MASTER UNIFIED NAVBAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 no-print shadow-2xs">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 sm:h-15 flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Hamburger + Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200 flex items-center justify-center shrink-0"
              aria-label="Buka Menu Kontrol Panel"
              title="Menu Kontrol Panel Portal"
            >
              <Menu className="w-4 h-4 text-slate-700" />
            </button>

            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 p-0.5 flex items-center justify-center shrink-0">
              <Image src="/logo.png" alt="Logo BGN" width={24} height={24} className="object-contain" priority />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight truncate block">
                  SPPG Wonodri 3
                </span>
                <span className="text-[9px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.2 rounded-full border border-blue-200 font-mono hidden md:inline-block">
                  Portal Terpadu
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block truncate -mt-0.5">Central Kitchen Semarang Selatan</span>
            </div>
          </div>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-bold">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
            >
              <Utensils className="w-3.5 h-3.5 text-slate-500" />
              <span>Laporan MBG</span>
            </Link>

            <Link
              href="/arsip"
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
            >
              <Archive className="w-3.5 h-3.5 text-slate-500" />
              <span>Katalog Arsip</span>
            </Link>

            <span className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white shadow-xs flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Presensi Relawan</span>
            </span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isSalaryUnlocked ? (
              <button
                type="button"
                onClick={handleLockSalary}
                className="px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                title="Kunci kembali tampilan upah"
              >
                <Unlock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="hidden sm:inline">Upah Terbuka</span>
                <span className="sm:hidden text-[11px]">Kunci</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenPinModalSalary('unlock')}
                className="px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                title="Buka tampilan upah dengan PIN"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="hidden sm:inline">Buka Upah</span>
                <span className="sm:hidden text-[11px]">PIN</span>
              </button>
            )}

            <button
              onClick={handleExportCsv}
              className="hidden sm:flex p-1.5 sm:p-2 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 items-center gap-1 cursor-pointer transition-colors"
              title="Unduh Spreadsheet CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => handleOpenPrintForDate(selectedDate)}
              className="hidden sm:flex px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 items-center gap-1 cursor-pointer shadow-xs transition-colors"
              title="Cetak Berita Acara & SPJ A4"
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">SPJ</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. BODY KONTEN PRESENSI & SDM RELAWAN */}
      <main className="max-w-6xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-5 flex-1">
        <div className="space-y-4 animate-in fade-in">
            {/* Control Bar & Sub-Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-2 sm:p-2.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Segmented Sub-Tabs */}
              <div className="grid grid-cols-4 sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold w-full md:w-auto">
                <button
                  onClick={() => setAbsensiSubTab('harian')}
                  className={`py-1.5 px-2 sm:px-3.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 text-center ${
                    absensiSubTab === 'harian'
                      ? 'bg-white text-blue-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5 hidden sm:inline-block" />
                  <span className="sm:hidden">Harian</span>
                  <span className="hidden sm:inline">Presensi Harian</span>
                </button>

                <button
                  onClick={() => setAbsensiSubTab('rekap')}
                  className={`py-1.5 px-2 sm:px-3.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 text-center ${
                    absensiSubTab === 'rekap'
                      ? 'bg-white text-blue-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5 hidden sm:inline-block" />
                  <span className="sm:hidden">Rekap</span>
                  <span className="hidden sm:inline">Rekapitulasi (7 Hari)</span>
                </button>

                <button
                  onClick={() => setAbsensiSubTab('arsip')}
                  className={`py-1.5 px-2 sm:px-3.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 text-center ${
                    absensiSubTab === 'arsip'
                      ? 'bg-white text-blue-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Archive className="w-3.5 h-3.5 hidden sm:inline-block" />
                  <span>Arsip</span>
                </button>

                <button
                  onClick={() => setAbsensiSubTab('roster')}
                  className={`py-1.5 px-2 sm:px-3.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 text-center ${
                    absensiSubTab === 'roster'
                      ? 'bg-white text-blue-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 hidden sm:inline-block" />
                  <span>Relawan</span>
                </button>
              </div>

              {/* Date Controls */}
              {absensiSubTab === 'harian' && (
                <div className="flex items-center justify-between sm:justify-start gap-1.5 w-full md:w-auto">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleShiftDate(-1)}
                      className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors border border-slate-200 cursor-pointer shrink-0"
                      title="Hari Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                      />
                    </div>

                    <button
                      onClick={() => handleShiftDate(1)}
                      className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors border border-slate-200 cursor-pointer shrink-0"
                      title="Hari Berikutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedDate(toIsoDateLocal(new Date()))}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Hari Ini
                  </button>
                </div>
              )}

              {absensiSubTab === 'rekap' && (
                <div className="flex items-center gap-2 self-end md:self-auto">
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
                    <button
                      onClick={() => setRekapPeriod('harian')}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        rekapPeriod === 'harian' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Harian
                    </button>
                    <button
                      onClick={() => setRekapPeriod('mingguan')}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        rekapPeriod === 'mingguan' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Mingguan
                    </button>
                    <button
                      onClick={() => setRekapPeriod('bulanan')}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        rekapPeriod === 'bulanan' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Bulanan
                    </button>
                  </div>

                  {rekapPeriod === 'harian' && (
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-transparent text-xs font-bold text-slate-800 cursor-pointer"
                      />
                    </div>
                  )}

                  {rekapPeriod === 'bulanan' && (
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 cursor-pointer"
                    />
                  )}
                </div>
              )}
            </div>

            {/* 4 SUMMARY METRIC CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 text-xs w-full">
              <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-0.5 min-w-0">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
                  Hadir ({formatIndoDate(selectedDate).split(',')[0]})
                </span>
                <div className="text-lg sm:text-2xl font-black text-emerald-600 font-mono">
                  {dailySummary.statusCounts.Hadir} <span className="text-[10px] sm:text-xs font-normal text-slate-400">/ 38</span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-emerald-700 font-medium block truncate">
                  Efektivitas {Math.round((dailySummary.statusCounts.Hadir / 38) * 100)}%
                </span>
              </div>

              <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1 min-w-0">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
                  Izin / Tidak Hadir
                </span>
                {absentPersonnel.length === 0 ? (
                  <div>
                    <div className="text-base sm:text-lg font-bold text-slate-900 font-mono">0 Orang</div>
                    <span className="text-[10px] sm:text-[11px] text-emerald-600 font-medium block truncate">Semua Hadir</span>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <div className="text-xs sm:text-sm font-black text-amber-700">
                      {absentPersonnel.length} Orang Izin:
                    </div>
                    <ul className="space-y-0.5">
                      {absentPersonnel.map((p) => (
                        <li key={p.id} className="text-[10px] sm:text-[11px] font-medium text-slate-700 leading-tight break-words">
                          <span className="text-amber-600 font-semibold">•</span> {p.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-0.5 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
                    Upah Hari Ini
                  </span>
                  {!isSalaryUnlocked && <Lock className="w-3 h-3 text-slate-300" />}
                </div>
                <div className="pt-0.5 truncate">{renderSalary(dailySummary.totalEarned)}</div>
                <span className="text-[9px] sm:text-[10px] text-slate-400 block truncate">
                  {isSalaryUnlocked ? 'Plafon Rp 5.005.000 / BNI' : 'Plafon •••••• / BNI'}
                </span>
              </div>

              <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-0.5 min-w-0">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
                  Total Roster
                </span>
                <div className="text-lg sm:text-2xl font-black text-slate-900 font-mono">
                  40 <span className="text-[10px] sm:text-xs font-normal text-slate-400">Org</span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">38 Shift • 2 Nonaktif</span>
              </div>
            </div>

            {/* FEEDBACK TOAST */}
            {saveToast && (
              <div className="bg-emerald-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between border border-emerald-700 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{saveToast}</span>
                </div>
                <button onClick={() => setSaveToast(null)} className="text-emerald-300 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* SUB-TAB 1: PRESENSI HARIAN */}
            {absensiSubTab === 'harian' && (
              <div className="space-y-3 animate-in fade-in">
                <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="relative flex-1 max-w-xs">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        placeholder="Cari nama relawan..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>

                    <select
                      value={filterSection}
                      onChange={(e) => setFilterSection(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
                    >
                      {DUTY_SECTIONS.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec === 'Semua' ? 'Semua Divisi' : sec}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleMarkAllActivePresent}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Hadirkan Semua</span>
                    </button>

                    <button
                      onClick={handleSaveAttendance}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan</span>
                    </button>
                  </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                          <th className="py-2.5 px-3 w-10 text-center">NO</th>
                          <th className="py-2.5 px-3 min-w-[180px]">NAMA RELAWAN</th>
                          <th className="py-2.5 px-3">DIVISI</th>
                          <th className="py-2.5 px-3 text-center min-w-[160px]">PRESENSI MASUK</th>
                          <th className="py-2.5 px-3 text-center">SHIFT KERJA</th>
                          <th className="py-2.5 px-3 text-right">UPAH</th>
                          <th className="py-2.5 px-3 text-center">STATUS BNI</th>
                          <th className="py-2.5 px-3">CATATAN</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredDailyDraft.map((entry) => {
                          const person = rosterMap.get(entry.volunteerId);
                          if (!person) return null;

                          const isHadir = entry.status === 'Hadir';
                          const isNonAktif = entry.status === 'Nonaktif';

                          return (
                            <tr
                              key={entry.id}
                              className={`hover:bg-slate-50/70 transition-colors ${
                                isNonAktif ? 'bg-slate-50/50 text-slate-400' : !isHadir ? 'bg-amber-50/30' : ''
                              }`}
                            >
                              <td className="py-2.5 px-3 text-center font-mono text-slate-400 font-medium">
                                {person.no}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2">
                                  {entry.photoUrl && (
                                    <button
                                      type="button"
                                      onClick={() => setViewingPhotoModal({ url: entry.photoUrl!, name: person.name, time: entry.checkIn, distance: entry.distanceMeters })}
                                      className="w-8 h-8 rounded-lg overflow-hidden border border-emerald-500 shrink-0 hover:scale-105 transition shadow cursor-pointer relative"
                                      title="Klik untuk melihat foto selfie GPS"
                                    >
                                      <img src={entry.photoUrl} alt="Selfie" className="w-full h-full object-cover" />
                                    </button>
                                  )}
                                  <div>
                                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                      <span className={isNonAktif ? 'line-through text-slate-400' : ''}>
                                        {person.name}
                                      </span>
                                      {entry.photoUrl && (
                                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 inline-flex items-center gap-0.5">
                                          <span>📍</span>
                                          <span>{entry.distanceMeters !== undefined ? `${entry.distanceMeters}m` : 'GPS'}</span>
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      Shift: {person.defaultCheckIn}-{person.defaultCheckOut}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 font-medium whitespace-nowrap">
                                {person.dutySection}
                              </td>

                              {/* Tombol Reversal: Hadir, Izin, Sakit, Alpha (Bisa diklik ulang jika salah klik) */}
                              <td className="py-2.5 px-3 text-center">
                                {isNonAktif ? (
                                  <span className="text-[10px] text-slate-400 font-mono font-medium">Nonaktif</span>
                                ) : (
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleSelectStatus(person.id, 'Hadir')}
                                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                                        entry.status === 'Hadir'
                                          ? 'bg-emerald-600 text-white shadow-xs'
                                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                      }`}
                                      title="Klik untuk Hadir (Klik lagi untuk uncheck)"
                                    >
                                      {entry.status === 'Hadir' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                      <span>Hadir</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleSelectStatus(person.id, 'Izin')}
                                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                        entry.status === 'Izin'
                                          ? 'bg-amber-600 text-white shadow-xs'
                                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                      }`}
                                      title="Klik untuk Izin (Klik lagi untuk uncheck)"
                                    >
                                      Izin
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleSelectStatus(person.id, 'Sakit')}
                                      className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                        entry.status === 'Sakit'
                                          ? 'bg-purple-600 text-white shadow-xs'
                                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                      }`}
                                      title="Klik untuk Sakit (Klik lagi untuk uncheck)"
                                    >
                                      Sakit
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleSelectStatus(person.id, 'Alpha')}
                                      className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                        entry.status === 'Alpha'
                                          ? 'bg-rose-600 text-white shadow-xs'
                                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                      }`}
                                      title="Klik untuk Alpha (Klik lagi untuk uncheck)"
                                    >
                                      Alpha
                                    </button>
                                  </div>
                                )}
                              </td>

                              {/* Jam Kerja */}
                              <td className="py-2.5 px-3 text-center font-mono text-xs text-slate-700">
                                {isHadir ? `${entry.checkIn} - ${entry.checkOut}` : '-'}
                              </td>

                              {/* Upah */}
                              <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                {isHadir ? renderSalary(entry.earnedAmount) : renderSalary(person.dailyRate, true)}
                              </td>

                              {/* Status Cair */}
                              <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                {isHadir ? (
                                  <button
                                    onClick={() => handleTogglePaid(person.id)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer border ${
                                      entry.paid
                                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                                        : 'bg-slate-50 text-slate-600 border-slate-200'
                                    }`}
                                  >
                                    {entry.paid ? '✓ Cair' : 'Menunggu'}
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-300">-</span>
                                )}
                              </td>

                              {/* Catatan */}
                              <td className="py-2.5 px-3">
                                <input
                                  type="text"
                                  value={entry.notes}
                                  onChange={(e) => handleUpdateNotes(person.id, e.target.value)}
                                  placeholder="..."
                                  className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 text-xs py-0.5 text-slate-800 focus:outline-none"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card List (<768px) */}
                <div className="md:hidden space-y-2">
                  {filteredDailyDraft.map((entry) => {
                    const person = rosterMap.get(entry.volunteerId);
                    if (!person) return null;
                    const isHadir = entry.status === 'Hadir';

                    return (
                      <div
                        key={entry.id}
                        className={`bg-white p-3 rounded-xl border space-y-2 ${
                          !isHadir ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {entry.photoUrl && (
                              <button
                                type="button"
                                onClick={() => setViewingPhotoModal({ url: entry.photoUrl!, name: person.name, time: entry.checkIn, distance: entry.distanceMeters })}
                                className="w-10 h-10 rounded-xl overflow-hidden border-2 border-emerald-500 shrink-0 shadow active:scale-95 transition cursor-pointer relative"
                                title="Klik untuk melihat foto selfie GPS"
                              >
                                <img src={entry.photoUrl} alt="Selfie" className="w-full h-full object-cover" />
                              </button>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-xs text-slate-900 block truncate">{person.name}</span>
                                {entry.photoUrl && (
                                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 inline-flex items-center gap-0.5">
                                    <span>📍</span>
                                    <span>{entry.distanceMeters !== undefined ? `${entry.distanceMeters}m` : 'GPS'}</span>
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 block truncate">
                                #{person.no} • {person.dutySection} • {person.defaultCheckIn}-{person.defaultCheckOut}
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0">{isHadir ? renderSalary(entry.earnedAmount) : renderSalary(person.dailyRate, true)}</div>
                        </div>

                        <div className="grid grid-cols-4 gap-1 text-[11px] font-semibold">
                          {(['Hadir', 'Izin', 'Sakit', 'Alpha'] as AttendanceStatus[]).map((st) => (
                            <button
                              key={st}
                              type="button"
                              disabled={!person.isActive}
                              onClick={() => handleSelectStatus(person.id, st)}
                              className={`py-1.5 rounded-lg text-center transition-all cursor-pointer font-bold ${
                                entry.status === st
                                  ? st === 'Hadir'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : st === 'Izin'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : st === 'Sakit'
                                    ? 'bg-purple-600 text-white shadow-xs'
                                    : 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                              }`}
                              title={`Klik untuk ${st} (Klik lagi untuk batal)`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>

                        {isHadir && (
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs font-mono">
                            <span className="text-slate-600 font-medium">
                              Shift: {entry.checkIn} - {entry.checkOut}
                            </span>
                            <button
                              onClick={() => handleTogglePaid(person.id)}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                entry.paid ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-slate-50 text-slate-600'
                              }`}
                            >
                              {entry.paid ? '✓ Cair' : 'Menunggu'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SUB-TAB 2: REKAPITULASI (HARIAN / MINGGUAN / BULANAN) */}
            {absensiSubTab === 'rekap' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden animate-in fade-in">
                {rekapPeriod === 'harian' ? (
                  <div className="p-4 sm:p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">
                          Rekapitulasi Kehadiran & Beban Upah Harian ({formatIndoDate(selectedDate)})
                        </h3>
                        <span className="text-[11px] text-slate-400">Ringkasan per divisi & rekapitulasi status kehadiran</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Total Beban Hari Ini:</span>
                        <strong className="text-sm font-mono text-blue-900">{renderSalary(dailySummary.totalEarned)}</strong>
                      </div>
                    </div>

                    {/* Ringkasan Status Harian */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                        <span className="text-[10px] uppercase font-bold text-emerald-800 block">Hadir</span>
                        <strong className="text-xl font-mono text-emerald-700">{dailySummary.statusCounts.Hadir} Orang</strong>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                        <span className="text-[10px] uppercase font-bold text-amber-800 block">Izin</span>
                        <strong className="text-xl font-mono text-amber-700">{dailySummary.statusCounts.Izin} Orang</strong>
                      </div>
                      <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-center">
                        <span className="text-[10px] uppercase font-bold text-purple-800 block">Sakit</span>
                        <strong className="text-xl font-mono text-purple-700">{dailySummary.statusCounts.Sakit} Orang</strong>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-600 block">Libur / Nonaktif</span>
                        <strong className="text-xl font-mono text-slate-700">{dailySummary.statusCounts.Libur + dailySummary.statusCounts.Nonaktif} Orang</strong>
                      </div>
                    </div>

                    {/* Breakdown Per Divisi Harian */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
                        Rincian Kehadiran Per Divisi Kerja
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                              <th className="py-2 px-3">DIVISI / SEKSI</th>
                              <th className="py-2 px-3 text-center">TOTAL ANGGOTA</th>
                              <th className="py-2 px-3 text-center">HADIR</th>
                              <th className="py-2 px-3 text-center">TIDAK HADIR</th>
                              <th className="py-2 px-3 text-right">TOTAL UPAH DIVISI</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {DUTY_SECTIONS.filter((s) => s !== 'Semua').map((sec) => {
                              const secPersons = roster.filter((p) => p.dutySection === sec);
                              const secEntries = currentDayDraft.filter((e) => {
                                const p = rosterMap.get(e.volunteerId);
                                return p?.dutySection === sec;
                              });
                              const secHadir = secEntries.filter((e) => e.status === 'Hadir').length;
                              const secAbsen = secEntries.filter((e) => e.status === 'Izin' || e.status === 'Sakit' || e.status === 'Alpha').length;
                              // Upah hanya dihitung dari relawan yang benar-benar HADIR
                              const secEarned = secEntries
                                .filter((e) => e.status === 'Hadir')
                                .reduce((acc, curr) => acc + curr.earnedAmount, 0);

                              return (
                                <tr key={sec} className="hover:bg-slate-50">
                                  <td className="py-2 px-3 font-semibold text-slate-900">{sec}</td>
                                  <td className="py-2 px-3 text-center font-mono text-slate-500">{secPersons.length}</td>
                                  <td className="py-2 px-3 text-center font-mono font-bold text-emerald-700">{secHadir}</td>
                                  <td className="py-2 px-3 text-center font-mono text-amber-700">
                                    {secAbsen > 0 ? `${secAbsen} orang` : '-'}
                                  </td>
                                  <td className="py-2 px-3 text-right font-mono font-bold whitespace-nowrap">
                                    {renderSalary(secEarned)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : rekapPeriod === 'mingguan' ? (
                  <div className="overflow-x-auto">
                    <div className="p-3.5 border-b border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">
                        Matrix Kehadiran Mingguan (Senin s/d Minggu: {weekDays[0].formatted} – {weekDays[weekDays.length - 1].formatted})
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Total Amprah Pekan Ini:</span>
                        <strong>{renderSalary(weeklySummary.totalEarned)}</strong>
                      </div>
                    </div>

                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                          <th className="py-2.5 px-3 w-10 text-center">NO</th>
                          <th className="py-2.5 px-3 min-w-[170px]">NAMA RELAWAN</th>
                          <th className="py-2.5 px-3">DIVISI</th>
                          {weekDays.map((d) => (
                            <th
                              key={d.date}
                              className={`py-2 px-2 text-center w-12 font-mono ${
                                d.label === 'Minggu'
                                  ? 'bg-rose-50 text-rose-700 font-bold'
                                  : d.label === 'Sabtu'
                                  ? 'bg-slate-100 text-slate-700 font-bold'
                                  : 'bg-slate-100/60'
                              }`}
                            >
                              <span className="uppercase">{d.label.slice(0, 3)}</span>
                            </th>
                          ))}
                          <th className="py-2.5 px-3 text-center">HADIR</th>
                          <th className="py-2.5 px-3 text-right">TOTAL UPAH</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {roster.map((person) => {
                          let hadirCount = 0;
                          const weekStatuses = weekDays.map((d) => {
                            // Tanggal masa depan (belum terlewati) tidak boleh direkap/diisi hadir
                            if (d.date > todayDateStr) {
                              return 'FUTURE';
                            }
                            const st = weeklyLedgerMap.get(`${person.id}:${d.date}`) || (person.isActive ? 'Belum Absen' : 'Nonaktif');
                            if (st === 'Hadir') hadirCount += 1;
                            return st;
                          });
                          const totalEarned = hadirCount * person.dailyRate;

                          return (
                            <tr key={person.id} className="hover:bg-slate-50/70">
                              <td className="py-2 px-3 text-center font-mono text-slate-400">{person.no}</td>
                              <td className="py-2 px-3 font-semibold text-slate-900">{person.name}</td>
                              <td className="py-2 px-3 text-slate-500">{person.dutySection}</td>
                              {weekStatuses.map((st, idx) => (
                                <td key={idx} className="py-2 px-2 text-center font-mono font-bold">
                                  {st === 'Hadir' ? (
                                    <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">✓</span>
                                  ) : st === 'Izin' ? (
                                    <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">I</span>
                                  ) : st === 'Sakit' ? (
                                    <span className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded text-[10px]">S</span>
                                  ) : st === 'FUTURE' ? (
                                    <span className="text-slate-300 font-normal">·</span>
                                  ) : st === 'Belum Absen' ? (
                                    <span className="text-slate-300 font-normal">–</span>
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>
                              ))}
                              <td className="py-2 px-3 text-center font-mono font-bold text-slate-800">
                                {person.isActive ? `${hadirCount}d` : '-'}
                              </td>
                              <td className="py-2 px-3 text-right whitespace-nowrap">
                                {person.isActive ? renderSalary(totalEarned) : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="p-3.5 border-b border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">Rekapitulasi Bulanan: {selectedMonth}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Total Pengeluaran Kas BNI:</span>
                        <strong>{renderSalary(monthlySummary.totalEarned)}</strong>
                      </div>
                    </div>

                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                          <th className="py-2.5 px-3 w-10 text-center">NO</th>
                          <th className="py-2.5 px-3 min-w-[180px]">NAMA LENGKAP</th>
                          <th className="py-2.5 px-3">DIVISI</th>
                          <th className="py-2.5 px-3 text-center">TOTAL HADIR</th>
                          <th className="py-2.5 px-3 text-center">IZIN / SAKIT</th>
                          <th className="py-2.5 px-3 text-right">TOTAL UPAH</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {roster.map((person) => {
                          const personMonthEntries = monthlyEntries.filter((e) => e.volunteerId === person.id);
                          const hadirCount = personMonthEntries.filter((e) => e.status === 'Hadir').length;
                          const izinCount = personMonthEntries.filter((e) => e.status === 'Izin' || e.status === 'Sakit').length;
                          const totalEarned = hadirCount * person.dailyRate;

                          return (
                            <tr key={person.id} className="hover:bg-slate-50/70">
                              <td className="py-2 px-3 text-center font-mono text-slate-400">{person.no}</td>
                              <td className="py-2 px-3 font-semibold text-slate-900">{person.name}</td>
                              <td className="py-2 px-3 text-slate-500">{person.dutySection}</td>
                              <td className="py-2 px-3 text-center font-mono font-bold text-emerald-700">
                                {person.isActive ? `${hadirCount} Hari` : '-'}
                              </td>
                              <td className="py-2 px-3 text-center font-mono text-slate-600">
                                {person.isActive ? `${izinCount} Hari` : '-'}
                              </td>
                              <td className="py-2 px-3 text-right whitespace-nowrap">
                                {person.isActive ? renderSalary(totalEarned) : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 3: ARSIP LAPORAN */}
            {absensiSubTab === 'arsip' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-in fade-in shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Arsip Tanggal Operasional</h3>
                    <span className="text-xs text-slate-400">Total {archivedDatesList.length} tanggal tersimpan</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href="/arsip"
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Halaman Arsip Penuh (/arsip)</span>
                    </Link>

                    <div className="relative w-full sm:w-48">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchArsip}
                        onChange={(e) => setSearchArsip(e.target.value)}
                        placeholder="Cari tanggal..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {archivedDatesList.map((dateStr) => {
                    const dayRecords = ledger.filter((e) => e.date === dateStr);
                    const summary = calculatePeriodSummary(dayRecords.length > 0 ? dayRecords : buildDailyEntries(roster, dateStr));
                    const isSelected = dateStr === selectedDate;

                    return (
                      <div
                        key={dateStr}
                        className={`p-3 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                          isSelected ? 'border-blue-500 bg-blue-50/20' : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-900">{formatIndoDate(dateStr)}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {summary.statusCounts.Hadir} Hadir • {renderSalary(summary.totalEarned)}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedDate(dateStr);
                              setAbsensiSubTab('harian');
                            }}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Buka
                          </button>
                          <button
                            onClick={() => handleOpenPrintForDate(dateStr)}
                            className="p-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
                            title="Cetak SPJ A4"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SUB-TAB 4: DAFTAR RELAWAN */}
            {absensiSubTab === 'roster' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-in fade-in shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Daftar Relawan Dapur ({roster.length} Personel)</h3>
                    <span className="text-xs text-slate-400">Shift jadwal & tarif upah harian BGN</span>
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Relawan</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {roster.map((person) => {
                    const todayEntry = currentDayDraft.find((e) => e.volunteerId === person.id);
                    return (
                    <div
                      key={person.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                        person.isActive ? 'border-slate-200 bg-white' : 'border-rose-200 bg-rose-50/30 opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {todayEntry?.photoUrl ? (
                          <button
                            type="button"
                            onClick={() => setViewingPhotoModal({ url: todayEntry.photoUrl!, name: person.name, time: todayEntry.checkIn, distance: todayEntry.distanceMeters })}
                            className="w-10 h-10 rounded-xl overflow-hidden border-2 border-emerald-500 shrink-0 shadow cursor-pointer relative"
                            title="Lihat Foto Selfie Hari Ini"
                          >
                            <img src={todayEntry.photoUrl} alt="Selfie" className="w-full h-full object-cover" />
                          </button>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs shrink-0 font-mono">
                            #{person.no}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5 truncate">
                            <span className="truncate">{person.name}</span>
                            {todayEntry?.photoUrl && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Sudah Absen Selfie Hari Ini" />
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {person.dutySection} • {person.defaultCheckIn}-{person.defaultCheckOut}
                          </div>
                          <div className="text-[10px] text-blue-900 font-mono font-bold pt-0.5">
                            {renderSalary(person.dailyRate)}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingVolunteer(person);
                          setEditNameInput(person.name);
                          setEditRateInput(person.dailyRate.toString());
                          setEditSectionInput(person.dutySection);
                          setEditCheckInInput(person.defaultCheckIn);
                          setEditCheckOutInput(person.defaultCheckOut);
                          setEditIsActiveInput(person.isActive);
                          setEditNotesInput(person.notes || '');
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer"
                        title={`Edit ${person.name}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
      </main>

      {/* MODAL EDIT RELAWAN */}
      {editingVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto no-print">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 my-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Edit Data & Jadwal Relawan
                </h3>
                <span className="text-xs text-blue-700 font-bold block">
                  #{editingVolunteer.no} - {editingVolunteer.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingVolunteer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRoster} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Nama Lengkap Relawan
                </label>
                <input
                  type="text"
                  value={editNameInput}
                  onChange={(e) => setEditNameInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:border-blue-600 uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Peran / Divisi</label>
                <select
                  value={editSectionInput}
                  onChange={(e) => setEditSectionInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer font-medium"
                >
                  {DUTY_SECTIONS.filter((s) => s !== 'Semua').map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Tarif Insentif Harian (Rp)
                </label>
                <input
                  type="number"
                  value={editRateInput}
                  onChange={(e) => setEditRateInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Jam Masuk Default</label>
                  <input
                    type="time"
                    value={editCheckInInput}
                    onChange={(e) => setEditCheckInInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Jam Pulang Default</label>
                  <input
                    type="time"
                    value={editCheckOutInput}
                    onChange={(e) => setEditCheckOutInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={editIsActiveInput}
                  onChange={(e) => setEditIsActiveInput(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer"
                />
                <label htmlFor="isActiveCheck" className="text-slate-800 font-bold cursor-pointer">
                  Status Personel Aktif (Terjadwal harian)
                </label>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  value={editNotesInput}
                  onChange={(e) => setEditNotesInput(e.target.value)}
                  placeholder="Misal: Non-aktif / pengganti..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingVolunteer(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH RELAWAN BARU */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto no-print">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 my-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Tambah Relawan Dapur Baru
                </h3>
                <span className="text-xs text-slate-500">
                  Relawan akan ditambahkan ke master roster & jadwal harian
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPersonSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  placeholder="Contoh: AHMAD FAUZI"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-blue-600 uppercase"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Peran / Divisi</label>
                <select
                  value={newPersonSection}
                  onChange={(e) => setNewPersonSection(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer font-medium"
                >
                  {DUTY_SECTIONS.filter((s) => s !== 'Semua').map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Insentif Harian (Rp)</label>
                <input
                  type="number"
                  value={newPersonRate}
                  onChange={(e) => setNewPersonRate(e.target.value)}
                  placeholder="125000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Jam Masuk Shift</label>
                  <input
                    type="time"
                    value={newPersonCheckIn}
                    onChange={(e) => setNewPersonCheckIn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Jam Pulang Shift</label>
                  <input
                    type="time"
                    value={newPersonCheckOut}
                    onChange={(e) => setNewPersonCheckOut(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Relawan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRINT SPJ A4 ABSENSI */}
      {showPrintModalAbsensi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 my-8 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Pratinjau Lembar SPJ Amprah Upah Relawan (A4)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / PDF</span>
                </button>
                <button
                  onClick={() => setShowPrintModalAbsensi(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-5 text-slate-900 print:text-black">
              <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
                <h2 className="text-base font-black uppercase tracking-wider">
                  SATUAN PELAYANAN PROGRAM GIZI (SPPG) WONODRI 3
                </h2>
                <h3 className="text-xs sm:text-sm font-bold uppercase text-slate-700">
                  BERITA ACARA & REKAPITULASI AMPRAH UPAH RELAWAN DAPUR
                </h3>
                <p className="text-[11px] text-slate-500">
                  Jl. Erlangga Raya No 38, Kel. Pleburan, Kec. Semarang Selatan, Kota Semarang
                </p>
                <div className="text-xs font-mono font-bold text-slate-800 pt-0.5">
                  Tanggal: {formatIndoDate(printDateTarget)}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-300">
                      <th className="p-1.5 border border-slate-300 text-center w-8">NO</th>
                      <th className="p-1.5 border border-slate-300">NAMA LENGKAP</th>
                      <th className="p-1.5 border border-slate-300">DIVISI</th>
                      <th className="p-1.5 border border-slate-300 text-center">STATUS</th>
                      <th className="p-1.5 border border-slate-300 text-center">MASUK</th>
                      <th className="p-1.5 border border-slate-300 text-right">TARIF</th>
                      <th className="p-1.5 border border-slate-300 text-right">HAK UPAH</th>
                      <th className="p-1.5 border border-slate-300 text-center w-20">TTD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printableEntries.map((entry) => {
                      const person = rosterMap.get(entry.volunteerId);
                      if (!person) return null;
                      return (
                        <tr key={entry.id} className="border-b border-slate-200">
                          <td className="p-1.5 border border-slate-300 text-center font-mono font-bold">
                            {person.no}
                          </td>
                          <td className="p-1.5 border border-slate-300 font-semibold">{person.name}</td>
                          <td className="p-1.5 border border-slate-300">{person.dutySection}</td>
                          <td className="p-1.5 border border-slate-300 text-center font-semibold">{entry.status}</td>
                          <td className="p-1.5 border border-slate-300 text-center font-mono">{entry.checkIn || '-'}</td>
                          <td className="p-1.5 border border-slate-300 text-right font-mono">{formatRupiah(person.dailyRate)}</td>
                          <td className="p-1.5 border border-slate-300 text-right font-mono font-bold">{formatRupiah(entry.earnedAmount)}</td>
                          <td className="p-1.5 border border-slate-300 text-center text-slate-300">{person.no}. .....</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={6} className="p-2 border border-slate-300 text-right uppercase text-[11px]">
                        Total Pengeluaran Upah:
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono text-xs text-blue-900">
                        {formatRupiah(printableSummary.totalEarned)}
                      </td>
                      <td className="p-2 border border-slate-300 text-center text-[10px] text-slate-500">Lolos Audit</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Sign-Offs */}
              <div className="grid grid-cols-3 gap-4 pt-4 text-center text-xs">
                <div className="space-y-10">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Mengetahui,</span>
                    <strong className="text-slate-900">Asisten Lapangan</strong>
                  </div>
                  <div>
                    <div className="font-bold underline text-slate-900">ARIEF RAHMAN HAKIM</div>
                    <span className="text-[10px] text-slate-500">PJ Operasional Dapur</span>
                  </div>
                </div>

                <div className="space-y-10">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Diverifikasi oleh,</span>
                    <strong className="text-slate-900">Petugas Akuntansi</strong>
                  </div>
                  <div>
                    <div className="font-bold underline text-slate-900">SALSABIILA ZAINIMA, S.Ak</div>
                    <span className="text-[10px] text-slate-500">Verifikator Kas BNI SPPG</span>
                  </div>
                </div>

                <div className="space-y-10">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Disetujui oleh,</span>
                    <strong className="text-slate-900">Kepala SPPG</strong>
                  </div>
                  <div>
                    <div className="font-bold underline text-slate-900">DICKY YUSUF MULYADI, S.M.</div>
                    <span className="text-[10px] text-slate-500">Penanggung Jawab SPPG</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PIN ACCESS MENU OPERASIONAL */}
      {showPinModalMenu && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">Verifikasi PIN Cetak Menu</h3>
                <span className="text-[11px] text-slate-500">Dokumen Resmi SPPG Wonodri 3</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Dokumen ini memuat pengesahan resmi SPPG Wonodri 3. Masukkan <strong>Kode PIN Operator</strong> untuk mengunduh / mencetak PDF:
            </p>

            <form onSubmit={handleVerifyPinMenu} className="space-y-3.5">
              <div>
                <div className="relative">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Ketik PIN resmi..."
                    value={inputPinMenu}
                    onChange={(e) => setInputPinMenu(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                    required
                    autoFocus
                  />
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {pinErrorMenu && (
                <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{pinErrorMenu}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPinModalMenu(false)}
                  className="w-1/2 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Buka Cetak</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PIN SECURITY ABSENSI */}
      {showPinModalSalary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xs w-full p-5 space-y-3 animate-in fade-in">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                <KeyRound className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">PIN Otoritas Upah</h3>
              <p className="text-[11px] text-slate-500">Masukkan PIN resmi untuk membuka rincian upah.</p>
            </div>

            <form onSubmit={handleVerifySalaryPin} className="space-y-3 pt-1">
              <div>
                <input
                  type="password"
                  maxLength={6}
                  autoFocus
                  value={pinInputSalary}
                  onChange={(e) => {
                    setPinInputSalary(e.target.value);
                    setPinErrorSalary('');
                  }}
                  placeholder="PIN..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-center text-lg font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:border-blue-600"
                />
                {pinErrorSalary && (
                  <p className="text-[11px] font-bold text-rose-600 text-center mt-1">
                    {pinErrorSalary}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModalSalary(false);
                    setPinInputSalary('');
                    setPinErrorSalary('');
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs"
                >
                  Buka
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kalender Menu */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-xs w-full p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-extrabold text-sm text-slate-900">
                {monthNames[calendarMonth]} {calendarYear}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={prevMonth} className="p-1 rounded hover:bg-slate-100 cursor-pointer">
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <button onClick={nextMonth} className="p-1 rounded hover:bg-slate-100 cursor-pointer">
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
                <button onClick={() => setShowCalendarModal(false)} className="p-1 rounded hover:bg-slate-100 cursor-pointer ml-1">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase">
              <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasMenu = availableDatesSet.has(dateStr);
                const isSelected = selectedDate === dateStr;

                return (
                  <button
                    key={dateStr}
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setShowCalendarModal(false);
                    }}
                    className={`h-8 rounded text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : hasMenu
                        ? 'bg-blue-50 text-blue-900 hover:bg-blue-100 font-black border border-blue-200'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DRAWER KONTROL PANEL PORTAL (HAMBURGER - SLIDE DARI KIRI) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex no-print">
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          <div className="relative mr-auto w-full max-w-xs sm:max-w-sm bg-slate-900 border-r border-slate-800 text-white h-full p-6 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
                    <Image src="/logo.png" alt="Logo BGN" width={28} height={28} className="object-contain" />
                  </div>
                  <div>
                    <strong className="text-sm text-white block">Portal SPPG Wonodri 3</strong>
                    <span className="text-[10px] text-slate-400">Pusat Kontrol Operasional & SDM</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Modul Links */}
              <div className="space-y-2 text-xs font-semibold">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                  Menu Utama Portal
                </span>

                <Link
                  href="/"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full flex items-start gap-3 p-3 rounded-2xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-left cursor-pointer"
                >
                  <Utensils className="w-5 h-5 mt-0.5 shrink-0 text-blue-400" />
                  <div>
                    <div className="text-xs font-bold leading-tight">Laporan Harian (MBG)</div>
                    <div className="text-[10px] text-slate-400 pt-0.5">
                      Menu harian, kandungan gizi AKG, foto bento tray & alokasi sekolah
                    </div>
                  </div>
                </Link>

                <Link
                  href="/arsip"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full flex items-start gap-3 p-3 rounded-2xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-left cursor-pointer"
                >
                  <Archive className="w-5 h-5 mt-0.5 shrink-0 text-sky-400" />
                  <div>
                    <div className="text-xs font-bold leading-tight">Katalog Arsip Operasional</div>
                    <div className="text-[10px] text-slate-400 pt-0.5">
                      Direktori 126+ hari arsip historis berpaginasi
                    </div>
                  </div>
                </Link>

                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1 mb-1.5">
                    Modul Presensi Relawan
                  </span>

                  <button
                    onClick={() => {
                      setAbsensiSubTab('harian');
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-xl transition-all cursor-pointer text-left ${
                      absensiSubTab === 'harian'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <CalendarIcon className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold">Presensi Harian</div>
                      <div className="text-[10px] text-slate-400">Checklist jam masuk & pulang personel</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setAbsensiSubTab('rekap');
                      setRekapPeriod('mingguan');
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-xl transition-all cursor-pointer text-left ${
                      absensiSubTab === 'rekap'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <TableIcon className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold">Rekapitulasi (Senin-Minggu)</div>
                      <div className="text-[10px] text-slate-400">Matrix 7 hari kalender kerja & beban upah</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setAbsensiSubTab('roster');
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-xl transition-all cursor-pointer text-left ${
                      absensiSubTab === 'roster'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
                    <div>
                      <div className="text-xs font-bold">Daftar Relawan Dapur</div>
                      <div className="text-[10px] text-slate-400">Master 40 personel, shift & tarif upah</div>
                    </div>
                  </button>
                </div>

                <div className="pt-2">
                  <Link
                    href="/admin"
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-full flex items-start gap-3 p-3 rounded-2xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-left"
                  >
                    <FileSpreadsheet className="w-5 h-5 mt-0.5 shrink-0 text-purple-400" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Panel Operator Admin</div>
                      <div className="text-[10px] text-slate-400 pt-0.5">
                        Input Menu Baru & Upload Dokumentasi Foto GDrive
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Quick Operation Actions */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                  Aksi Dokumen
                </span>

                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    handleOpenPrintForDate(selectedDate);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Printer className="w-4 h-4 text-emerald-400" />
                    <span>Cetak Dokumen Terpilih</span>
                  </span>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    handleExportCsv();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-slate-300" />
                    <span>Unduh CSV Spreadsheet</span>
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center justify-between font-mono">
                <span>Alokasi Porsi:</span>
                <span className="text-white font-bold">{totalMaster} Porsi (100%)</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span>Plafon Upah Harian:</span>
                <span className="text-white font-bold">
                  {isSalaryUnlocked ? formatRupiah(5005000) : '••••••••'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 pt-1">
                Verifikasi: Arief Rahman Hakim (Aslap) & Salsabiila Zainima, S.Ak (Akuntan)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VIEW FOTO SELFIE PRESENSI REALTIME */}
      {viewingPhotoModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Bukti Selfie GPS Relawan</span>
              </span>
              <button
                type="button"
                onClick={() => setViewingPhotoModal(null)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>

            <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-slate-700 shadow-inner">
              <img
                src={viewingPhotoModal.url}
                alt="Foto Selfie Relawan"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-left bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1">
              <p className="font-bold text-white">{viewingPhotoModal.name}</p>
              <p className="text-[11px] text-slate-400">Jam Hadir: {viewingPhotoModal.time}</p>
              <p className="text-[11px] text-emerald-400 font-mono">
                📍 Jarak GPS: {viewingPhotoModal.distance !== undefined ? `${viewingPhotoModal.distance} meter dari Dapur` : 'Terverifikasi'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-400 border-t border-slate-200 bg-white no-print">
        Portal Terpadu Operasional & SDM • SPPG Wonodri 3 Kota Semarang
      </footer>
    </div>
  );
}

export default UnifiedPortal;
