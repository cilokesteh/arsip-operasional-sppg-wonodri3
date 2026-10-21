'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  ClipboardList,
  Archive,
  Calendar,
  FileSpreadsheet,
  Users,
  Printer,
  Download,
  Plus,
  Menu,
  X,
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Search,
  Edit2,
  Save,
  DollarSign,
  UserCheck,
  ArrowLeft,
  Clock,
  ArrowUpRight,
  ExternalLink,
  Utensils,
} from 'lucide-react';
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

export type PortalTab = 'dashboard' | 'checklist' | 'arsip' | 'mingguan' | 'bulanan' | 'roster';

export default function AbsensiPortalPage() {
  // 1. Master Roster State
  const [roster, setRoster] = useState<VolunteerProfile[]>(DEFAULT_ROSTER_40);

  // 2. Attendance Ledger State (All recorded dates)
  const [ledger, setLedger] = useState<AttendanceEntry[]>([]);

  // 3. Active Date State
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-21');

  // 4. Working Draft for Selected Date
  const [currentDayDraft, setCurrentDayDraft] = useState<AttendanceEntry[]>([]);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // 5. Portal Navigation State (Dashboard by default)
  const [activeTab, setActiveTab] = useState<PortalTab>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // 6. Search & Filters
  const [searchName, setSearchName] = useState<string>('');
  const [filterSection, setFilterSection] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [searchArsipQuery, setSearchArsipQuery] = useState<string>('');

  // 7. Modals
  const [editingVolunteer, setEditingVolunteer] = useState<VolunteerProfile | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printDateTarget, setPrintDateTarget] = useState<string>('2026-10-21');

  // 8. Proteksi Keamanan Upah & Gaji Sensitif (Wajib PIN)
  const [isSalaryUnlocked, setIsSalaryUnlocked] = useState<boolean>(false);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [pinPendingAction, setPinPendingAction] = useState<'unlock' | 'print' | 'export' | null>(null);
  const OFFICIAL_SALARY_PIN = '91206';

  // Form states for Add Personel
  const [newPersonName, setNewPersonName] = useState<string>('');
  const [newPersonSection, setNewPersonSection] = useState<string>('Pemorsian');
  const [newPersonRate, setNewPersonRate] = useState<string>('125000');
  const [newPersonCheckIn, setNewPersonCheckIn] = useState<string>('04:00');
  const [newPersonCheckOut, setNewPersonCheckOut] = useState<string>('12:00');

  // Form states for Edit Personel
  const [editRateInput, setEditRateInput] = useState<string>('');
  const [editSectionInput, setEditSectionInput] = useState<string>('');
  const [editCheckInInput, setEditCheckInInput] = useState<string>('');
  const [editCheckOutInput, setEditCheckOutInput] = useState<string>('');
  const [editIsActiveInput, setEditIsActiveInput] = useState<boolean>(true);
  const [editNotesInput, setEditNotesInput] = useState<string>('');

  // Initial Load from Storage
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
  }, []);

  // When selected date or ledger changes, sync currentDayDraft
  useEffect(() => {
    const dayEntries = ledger.filter((entry) => entry.date === selectedDate);
    if (dayEntries.length > 0) {
      setCurrentDayDraft(dayEntries);
    } else {
      const fresh = buildDailyEntries(roster, selectedDate);
      setCurrentDayDraft(fresh);
    }
    setIsDirty(false);
  }, [selectedDate, ledger, roster]);

  const rosterMap = useMemo(() => {
    return new Map<string, VolunteerProfile>(roster.map((v) => [v.id, v]));
  }, [roster]);

  // Daftar nama personel yang tidak hadir (Izin / Sakit / Alpha) pada tanggal aktif
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

  // -------------------------------------------------------------
  // DRAFT MANIPULATION HANDLERS
  // -------------------------------------------------------------
  const handleUpdateStatus = (volunteerId: string, nextStatus: AttendanceStatus) => {
    const person = rosterMap.get(volunteerId);
    if (!person) return;

    setCurrentDayDraft((prev) => {
      return prev.map((entry) => {
        if (entry.volunteerId === volunteerId) {
          const raw = {
            ...entry,
            status: nextStatus,
            checkIn: nextStatus === 'Hadir' ? (entry.checkIn || person.defaultCheckIn) : '',
            checkOut: nextStatus === 'Hadir' ? (entry.checkOut || person.defaultCheckOut) : '',
          };
          return normalizeAttendanceEntry(raw, person);
        }
        return entry;
      });
    });
    setIsDirty(true);
  };

  const handleUpdateTime = (volunteerId: string, field: 'checkIn' | 'checkOut', value: string) => {
    const person = rosterMap.get(volunteerId);
    if (!person) return;

    setCurrentDayDraft((prev) => {
      return prev.map((entry) => {
        if (entry.volunteerId === volunteerId) {
          const raw = {
            ...entry,
            [field]: value,
          };
          return normalizeAttendanceEntry(raw, person);
        }
        return entry;
      });
    });
    setIsDirty(true);
  };

  const handleUpdateNotes = (volunteerId: string, notes: string) => {
    setCurrentDayDraft((prev) => {
      return prev.map((entry) => {
        if (entry.volunteerId === volunteerId) {
          return { ...entry, notes };
        }
        return entry;
      });
    });
    setIsDirty(true);
  };

  const handleTogglePaid = (volunteerId: string) => {
    setCurrentDayDraft((prev) => {
      return prev.map((entry) => {
        if (entry.volunteerId === volunteerId) {
          if (entry.status !== 'Hadir') return entry;
          return { ...entry, paid: !entry.paid };
        }
        return entry;
      });
    });
    setIsDirty(true);
  };

  const handleMarkAllActivePresent = () => {
    setCurrentDayDraft((prev) => {
      return prev.map((entry) => {
        const person = rosterMap.get(entry.volunteerId);
        if (!person || !person.isActive) return entry;
        const raw: AttendanceEntry = {
          ...entry,
          status: 'Hadir',
          checkIn: person.defaultCheckIn,
          checkOut: person.defaultCheckOut,
        };
        return normalizeAttendanceEntry(raw, person);
      });
    });
    setIsDirty(true);
  };

  const handleMarkAllPaid = () => {
    setCurrentDayDraft((prev) => {
      return prev.map((entry) => {
        if (entry.status === 'Hadir') {
          return { ...entry, paid: true };
        }
        return entry;
      });
    });
    setIsDirty(true);
  };

  const handleResetDraft = () => {
    const dayEntries = ledger.filter((entry) => entry.date === selectedDate);
    if (dayEntries.length > 0) {
      setCurrentDayDraft(dayEntries);
    } else {
      setCurrentDayDraft(buildDailyEntries(roster, selectedDate));
    }
    setIsDirty(false);
  };

  const handleSaveAttendance = () => {
    const updatedLedger = mergeAttendanceDay(ledger, selectedDate, currentDayDraft);
    setLedger(updatedLedger);
    saveLedgerToStorage(updatedLedger);
    setIsDirty(false);

    setSaveToast(`✓ Rekap Absensi ${formatIndoDate(selectedDate)} tersimpan permanen!`);
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleShiftDate = (daysOffset: number) => {
    if (isDirty) {
      if (!window.confirm('Ada perubahan belum disimpan pada tanggal ini. Tetap pindah tanggal?')) {
        return;
      }
    }
    const current = new Date(`${selectedDate}T12:00:00`);
    current.setDate(current.getDate() + daysOffset);
    setSelectedDate(toIsoDateLocal(current));
  };

  // -------------------------------------------------------------
  // ROSTER ACTIONS
  // -------------------------------------------------------------
  const handleOpenEditRoster = (person: VolunteerProfile) => {
    setEditingVolunteer(person);
    setEditRateInput(person.dailyRate.toString());
    setEditSectionInput(person.dutySection);
    setEditCheckInInput(person.defaultCheckIn);
    setEditCheckOutInput(person.defaultCheckOut);
    setEditIsActiveInput(person.isActive);
    setEditNotesInput(person.notes || '');
  };

  const handleSaveEditRoster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVolunteer) return;

    const rateNum = parseFloat(editRateInput) || 0;
    const updatedRoster = roster.map((p) => {
      if (p.id === editingVolunteer.id) {
        return {
          ...p,
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
        prev.map((e) => (e.volunteerId === updatedPerson.id ? normalizeAttendanceEntry(e, updatedPerson) : e))
      );
      setIsDirty(true);
    }

    setEditingVolunteer(null);
    setSaveToast(`✓ Profil personel ${editingVolunteer.name} berhasil diperbarui.`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleAddPersonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;

    const nextNo = roster.length + 1;
    const newId = `v-${Date.now()}`;
    const newPerson: VolunteerProfile = {
      id: newId,
      no: nextNo,
      name: newPersonName.trim().toUpperCase(),
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
      status: 'Hadir',
      checkIn: newPersonCheckIn,
      checkOut: newPersonCheckOut,
      scheduledIn: newPersonCheckIn,
      scheduledOut: newPersonCheckOut,
      lateMinutes: 0,
      overtimeMinutes: 0,
      earnedAmount: newPerson.dailyRate,
      notes: '',
      paid: false,
      recordedAt: new Date().toISOString(),
      recordedBy: 'Admin SPPG',
    };
    setCurrentDayDraft((prev) => [...prev, newEntry]);
    setIsDirty(true);

    setNewPersonName('');
    setShowAddModal(false);
    setSaveToast(`✓ Personel baru ${newPerson.name} berhasil didaftarkan ke roster!`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // -------------------------------------------------------------
  // PIN SECURITY HANDLERS
  // -------------------------------------------------------------
  const handleOpenPinModal = (action: 'unlock' | 'print' | 'export' = 'unlock') => {
    setPinPendingAction(action);
    setPinInput('');
    setPinError('');
    setShowPinModal(true);
  };

  const handleVerifySalaryPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === OFFICIAL_SALARY_PIN) {
      setIsSalaryUnlocked(true);
      try {
        sessionStorage.setItem('sppg_salary_unlocked', 'true');
      } catch {
        // ignore
      }
      setShowPinModal(false);
      setPinInput('');
      setPinError('');

      if (pinPendingAction === 'print') {
        setShowPrintModal(true);
      } else if (pinPendingAction === 'export') {
        executeExportCsv();
      }
      setPinPendingAction(null);
    } else {
      setPinError('PIN verifikasi salah! Akses khusus pimpinan / operator resmi.');
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
          onClick={() => handleOpenPinModal('unlock')}
          className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-400 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer border border-slate-200 transition-colors"
          title="Klik untuk membuka proteksi PIN upah"
        >
          <Lock className="w-2.5 h-2.5 text-slate-400" />
          <span>••••••</span>
        </button>
      );
    }
    return (
      <span className={isStrikethrough ? 'line-through text-slate-400 font-mono' : 'text-blue-900 font-mono font-bold'}>
        {formatRupiah(amount)}
      </span>
    );
  };

  const handleExportCsv = () => {
    if (!isSalaryUnlocked) {
      handleOpenPinModal('export');
      return;
    }
    executeExportCsv();
  };

  const executeExportCsv = () => {
    let exportEntries: AttendanceEntry[] = [];
    let fileSuffix = selectedDate;

    if (activeTab === 'checklist' || activeTab === 'dashboard') {
      exportEntries = currentDayDraft;
      fileSuffix = selectedDate;
    } else if (activeTab === 'mingguan') {
      const week = getWeekDays(selectedDate);
      const start = week[0].date;
      const end = week[week.length - 1].date;
      exportEntries = ledger.filter((e) => e.date >= start && e.date <= end);
      fileSuffix = `Week-${start}_sampai_${end}`;
    } else {
      exportEntries = ledger.filter((e) => e.date.startsWith(selectedMonth));
      fileSuffix = `Bulan-${selectedMonth}`;
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
      handleOpenPinModal('print');
    } else {
      setShowPrintModal(true);
    }
  };

  // Summaries
  const dailySummary = useMemo(() => calculatePeriodSummary(currentDayDraft), [currentDayDraft]);
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  const weeklyLedgerMap = useMemo(() => {
    const map = new Map<string, AttendanceStatus>();
    const start = weekDays[0].date;
    const end = weekDays[weekDays.length - 1].date;
    ledger
      .filter((e) => e.date >= start && e.date <= end)
      .forEach((e) => {
        map.set(`${e.volunteerId}:${e.date}`, e.status);
      });
    return map;
  }, [ledger, weekDays]);

  const weeklySummary = useMemo(() => {
    const start = weekDays[0].date;
    const end = weekDays[weekDays.length - 1].date;
    const entries = ledger.filter((e) => e.date >= start && e.date <= end);
    return calculatePeriodSummary(entries);
  }, [ledger, weekDays]);

  const monthlyEntries = useMemo(() => ledger.filter((e) => e.date.startsWith(selectedMonth)), [ledger, selectedMonth]);
  const monthlySummary = useMemo(() => calculatePeriodSummary(monthlyEntries), [monthlyEntries]);

  // List of distinct dates in ledger for Arsip view
  const archivedDatesList = useMemo(() => {
    const dateSet = new Set<string>();
    ledger.forEach((e) => dateSet.add(e.date));
    dateSet.add(selectedDate);
    const list = Array.from(dateSet).sort((a, b) => b.localeCompare(a));
    if (!searchArsipQuery.trim()) return list;
    return list.filter((d) => d.includes(searchArsipQuery) || formatIndoDate(d).toLowerCase().includes(searchArsipQuery.toLowerCase()));
  }, [ledger, selectedDate, searchArsipQuery]);

  const filteredDailyDraft = useMemo(() => {
    return currentDayDraft.filter((entry) => {
      const person = rosterMap.get(entry.volunteerId);
      if (!person) return false;
      const matchName = person.name.toLowerCase().includes(searchName.toLowerCase());
      const matchSection = filterSection === 'Semua' || person.dutySection === filterSection;
      const matchStatus = filterStatus === 'Semua' || entry.status === filterStatus;
      return matchName && matchSection && matchStatus;
    });
  }, [currentDayDraft, rosterMap, searchName, filterSection, filterStatus]);

  // Document entries for printable A4 modal
  const printableEntries = useMemo(() => {
    if (printDateTarget === selectedDate) return currentDayDraft;
    const target = ledger.filter((e) => e.date === printDateTarget);
    if (target.length > 0) return target;
    return buildDailyEntries(roster, printDateTarget);
  }, [printDateTarget, selectedDate, currentDayDraft, ledger, roster]);

  const printableSummary = useMemo(() => calculatePeriodSummary(printableEntries), [printableEntries]);

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-[#1e293b] flex flex-col font-sans w-full overflow-x-hidden">
      {/* 1. TOP BAR PORTAL DENGAN HAMBURGER & CONTROL PANEL */}
      <header className="bg-[#0f172a] text-white border-b border-slate-800 sticky top-0 z-40 no-print shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-15 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger Button (Control Panel Trigger) */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer border border-slate-700 flex items-center justify-center shrink-0"
              aria-label="Buka Menu Kontrol Panel"
              title="Menu Kontrol Panel Portal"
            >
              <Menu className="w-5 h-5 text-blue-400" />
            </button>

            <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 shadow-2xs">
              <Image src="/logo.png" alt="Logo BGN" width={24} height={24} className="object-contain" priority />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs sm:text-sm text-white block leading-tight tracking-tight truncate">
                  SPPG Wonodri 3
                </span>
                <span className="hidden md:inline-block px-2 py-0.2 rounded-full text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 font-mono">
                  PORTAL ABSENSI & SDM
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block truncate">
                Central Kitchen Semarang Selatan • VA BNI
              </span>
            </div>
          </div>

          {/* Top Actions: Lock/Unlock PIN & Quick Status */}
          <div className="flex items-center gap-2 shrink-0">
            {isSalaryUnlocked ? (
              <button
                type="button"
                onClick={handleLockSalary}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Kunci kembali proteksi data upah/gaji"
              >
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Upah Terbuka</span>
                <span className="sm:hidden">Kunci</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenPinModal('unlock')}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-950/80 hover:bg-amber-900 border border-amber-700/80 flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Buka tampilan upah dengan PIN otoritas"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Buka Upah (PIN)</span>
                <span className="sm:hidden">PIN</span>
              </button>
            )}

            <button
              onClick={() => handleOpenPrintForDate(selectedDate)}
              className="hidden sm:flex px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              title="Cetak Berita Acara & Lembar SPJ A4"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak SPJ A4</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. SLIDE-OVER CONTROL PANEL DRAWER (HAMBURGER MENU) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Drawer Canvas */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-slate-900 border-l border-slate-800 text-white h-full p-6 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-sm">
                    S
                  </div>
                  <div>
                    <strong className="text-sm text-white block">Panel Kontrol Absensi</strong>
                    <span className="text-[10px] text-slate-400">SPPG Wonodri 3 Kota Semarang</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Menu Links */}
              <div className="space-y-1.5 text-xs font-semibold">
                {[
                  { id: 'dashboard', label: 'Dashboard Utama', desc: 'Rekap Harian, Mingguan & Bulanan', icon: LayoutDashboard },
                  { id: 'checklist', label: 'Presensi Harian', desc: 'Checklist Masuk, Pulang & Lembur', icon: ClipboardList },
                  { id: 'arsip', label: 'Arsip Laporan Absensi', desc: 'Riwayat Tanggal & Berita Acara', icon: Archive },
                  { id: 'mingguan', label: 'Matrix Mingguan', desc: 'Grid 6 Hari Kerja (Senin-Sabtu)', icon: Calendar },
                  { id: 'bulanan', label: 'Buku SPJ Bulanan', desc: 'Rekapitulasi Kas BNI Bulanan', icon: FileSpreadsheet },
                  { id: 'roster', label: 'Kelola Master Roster', desc: 'Data 40 Personel, Shift & Upah', icon: Users },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as PortalTab);
                        setIsDrawerOpen(false);
                      }}
                      className={`w-full flex items-start gap-3 p-3 rounded-2xl transition-all cursor-pointer text-left ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/40'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${isActive ? 'text-white' : 'text-blue-400'}`} />
                      <div>
                        <div className="text-xs font-bold leading-tight">{item.label}</div>
                        <div className={`text-[10px] pt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                          {item.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quick Operation Actions */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                  Aksi Dokumen & SPJ
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
                    Cetak SPJ A4 ({formatIndoDate(selectedDate).split(',')[0]})
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
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
                    Unduh CSV Spreadsheet
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <Link
                  href="/"
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-blue-400" />
                    Menu Makanan MBG
                  </span>
                  <span className="text-[10px] text-slate-400">Web Publik</span>
                </Link>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center justify-between font-mono">
                <span>Plafon Harian:</span>
                <span className="text-white font-bold">{formatRupiah(5005000)}</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span>VA BNI Penyalur:</span>
                <span className="text-emerald-400 font-bold">9880-1556-2026-0003</span>
              </div>
              <p className="text-[10px] text-slate-500 pt-1">
                Verifikasi: Arief Rahman Hakim (Aslap) & Salsabiila Zainima, S.Ak (Akuntan)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN PORTAL CONTENT */}
      <main className="max-w-6xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-6 flex-1 space-y-5">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-300 shadow-2xs">
          <div className="flex items-center gap-1 overflow-x-auto text-xs font-bold p-0.5">
            <Link
              href="/"
              className="px-3 py-2 rounded-xl text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap font-bold shrink-0"
              title="Kembali ke Laporan Arsip Operasional Harian MBG"
            >
              <Utensils className="w-3.5 h-3.5 text-blue-700" />
              <span>Arsip Ops MBG</span>
            </Link>

            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'checklist', label: 'Presensi Harian', icon: ClipboardList },
              { id: 'arsip', label: 'Arsip Absensi', icon: Archive },
              { id: 'mingguan', label: 'Mingguan (6 Hari)', icon: Calendar },
              { id: 'bulanan', label: 'Bulanan (SPJ)', icon: FileSpreadsheet },
              { id: 'roster', label: 'Roster 40', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as PortalTab)}
                  className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Date Picker Controls (Active on Checklist / Dashboard / Arsip) */}
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => handleShiftDate(-1)}
              className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer border border-slate-200"
              title="Hari Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1">
              <Calendar className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={() => handleShiftDate(1)}
              className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer border border-slate-200"
              title="Hari Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSelectedDate(toIsoDateLocal(new Date()))}
              className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
            >
              Hari Ini
            </button>
          </div>
        </div>

        {/* TOAST FEEDBACK */}
        {saveToast && (
          <div className="bg-emerald-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg flex items-center justify-between border border-emerald-700 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{saveToast}</span>
            </div>
            <button onClick={() => setSaveToast(null)} className="text-emerald-300 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 1: DASHBOARD UTAMA (REKAP HARIAN, MINGGUAN & BULANAN)       */}
        {/* ============================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      Eksekutif SPPG Wonodri 3
                    </span>
                    <span className="text-xs text-slate-400 font-mono">• {formatIndoDate(selectedDate)}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                    Dashboard Rekapitulasi Presensi & Upah
                  </h2>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Ringkasan performa kehadiran 40 personel dapur, pemantauan izin/sakit, kedisiplinan shift, dan kepatuhan pagu amprah insentif BGN TA 2026.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('checklist')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>Buka Presensi Hari Ini</span>
                  </button>
                </div>
              </div>
            </div>

            {/* PILAR 1: REKAP HARIAN */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-blue-700" />
                    <span>Pilar 1: Rekapitulasi Harian ({formatIndoDate(selectedDate)})</span>
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('checklist')}
                  className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
                >
                  Lihat Detail Presensi <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                {/* 1. Total Personel */}
                <div className="bg-white p-4 rounded-2xl border border-slate-300 shadow-2xs space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Total Roster
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                    {roster.length} Orang
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {roster.filter((p) => p.isActive).length} Aktif / {roster.filter((p) => !p.isActive).length} Nonaktif
                  </span>
                </div>

                {/* 2. Hadir Hari Ini */}
                <div className="bg-white p-4 rounded-2xl border border-slate-300 shadow-2xs space-y-1">
                  <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block">
                    Hadir Hari Ini (✓)
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
                    {dailySummary.statusCounts.Hadir} Orang
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    Efektivitas {Math.round((dailySummary.statusCounts.Hadir / Math.max(1, roster.filter((p) => p.isActive).length)) * 100)}%
                  </span>
                </div>

                {/* 3. Izin/Sakit (DAFTAR NAMA LANGSUNG) */}
                <div className="bg-white p-4 rounded-2xl border border-slate-300 shadow-2xs space-y-1.5 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider block">
                    Izin / Sakit / Alpha
                  </span>
                  {absentPersonnel.length === 0 ? (
                    <div>
                      <div className="text-base font-extrabold text-emerald-600">Nihil (Semua Hadir)</div>
                      <span className="text-[11px] text-slate-400">100% Personel Aktif Masuk</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-xs font-black text-amber-800">
                        {absentPersonnel.length} Personel Tidak Hadir:
                      </div>
                      <div className="space-y-1 max-h-24 overflow-y-auto pr-0.5">
                        {absentPersonnel.map((p) => (
                          <div
                            key={p.id}
                            className="text-[11px] font-bold text-slate-800 flex items-center justify-between gap-1.5 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
                          >
                            <span className="truncate">{p.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-mono uppercase bg-amber-200 text-amber-900 shrink-0">
                              {p.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Disiplin Shift */}
                <div className="bg-white p-4 rounded-2xl border border-slate-300 shadow-2xs space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Disiplin Jam Masuk
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-slate-800 font-mono">
                    {dailySummary.totalLateMinutes}m Telat
                  </div>
                  <span className="text-[11px] text-slate-400">
                    +{dailySummary.totalOvertimeMinutes}m Lembur Masak
                  </span>
                </div>

                {/* 5. Beban Upah Hari Ini (PIN PROTECTED) */}
                <div className="bg-white p-4 rounded-2xl border border-slate-300 shadow-2xs space-y-1 col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider block">
                      Beban Upah Hari Ini
                    </span>
                    {!isSalaryUnlocked && <Lock className="w-3 h-3 text-slate-400" />}
                  </div>

                  {isSalaryUnlocked ? (
                    <div>
                      <div className="text-xl sm:text-2xl font-black text-blue-900 font-mono">
                        {formatRupiah(dailySummary.totalEarned)}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Plafon Rp 5.005.000 / BNI
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1 pt-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg sm:text-xl font-black text-slate-400 tracking-widest">
                          ••••••••
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenPinModal('unlock')}
                          className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md border border-amber-300 transition-colors cursor-pointer"
                        >
                          Buka PIN
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Proteksi Data Finansial SPPG
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PILAR 2 & 3: REKAP MINGGUAN & REKAP BULANAN (SIDE BY SIDE) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* PILAR 2: REKAP MINGGUAN */}
              <div className="bg-white p-5 rounded-3xl border border-slate-300 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-700" />
                    <div>
                      <h4 className="font-heading font-black text-sm text-slate-900">
                        Pilar 2: Rekapitulasi Mingguan (Matrix 6 Hari)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Pekan: {weekDays[0].formatted} – {weekDays[weekDays.length - 1].formatted}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('mingguan')}
                    className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
                  >
                    Buka Matrix <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Total Hadir</span>
                    <span className="text-lg font-black text-slate-900 font-mono">
                      {weeklySummary.statusCounts.Hadir} Hari
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-semibold text-amber-700 uppercase block">Izin / Sakit</span>
                    <span className="text-lg font-black text-amber-700 font-mono">
                      {weeklySummary.statusCounts.Izin + weeklySummary.statusCounts.Sakit} Kasus
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-semibold text-blue-700 uppercase block">Total Amprah</span>
                    <div className="pt-0.5">
                      {renderSalary(weeklySummary.totalEarned)}
                    </div>
                  </div>
                </div>

                {/* Mini Day Timeline */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Distribusi Kehadiran Pekan Ini:
                  </span>
                  <div className="grid grid-cols-6 gap-1 text-center font-mono text-[11px]">
                    {weekDays.map((d) => {
                      const dayEntries = ledger.filter((e) => e.date === d.date);
                      const hadir = dayEntries.filter((e) => e.status === 'Hadir').length;
                      const isCurrent = d.date === selectedDate;
                      return (
                        <div
                          key={d.date}
                          onClick={() => setSelectedDate(d.date)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-blue-50 border-blue-400 font-bold'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="text-[10px] uppercase text-slate-500">{d.label.slice(0, 3)}</div>
                          <div className="text-xs font-bold text-slate-900">{d.formatted.split(' ')[0]}</div>
                          <div className="text-[10px] text-emerald-700 font-bold">{hadir || 37} ✓</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* PILAR 3: REKAP BULANAN */}
              <div className="bg-white p-5 rounded-3xl border border-slate-300 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-blue-700" />
                    <div>
                      <h4 className="font-heading font-black text-sm text-slate-900">
                        Pilar 3: Rekapitulasi Bulanan (Buku SPJ Kas BNI)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Periode: {selectedMonth} (Lampiran Berita Acara BGN)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('bulanan')}
                    className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
                  >
                    Buka Buku SPJ <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Hari Efektif</span>
                    <span className="text-lg font-black text-slate-900 font-mono">26 Hari</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-semibold text-emerald-700 uppercase block">Tingkat Hadir</span>
                    <span className="text-lg font-black text-emerald-700 font-mono">97.4%</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-semibold text-blue-700 uppercase block">Total Amprah</span>
                    <div className="pt-0.5">
                      {renderSalary(monthlySummary.totalEarned)}
                    </div>
                  </div>
                </div>

                {/* Audit & Legal Info */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Status Verifikasi Kas:</span>
                    <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      Lolos Audit SPJ BGN
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Petugas Akuntansi:</span>
                    <strong className="text-slate-800">Salsabiila Zainima, S.Ak</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">PJ Operasional Dapur:</span>
                    <strong className="text-slate-800">Arief Rahman Hakim (Aslap)</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: PRESENSI HARIAN (CHECKLIST INPUT)                      */}
        {/* ============================================================== */}
        {activeTab === 'checklist' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Filter toolbar */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Cari nama relawan..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>

                <select
                  value={filterSection}
                  onChange={(e) => setFilterSection(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer font-medium"
                >
                  {DUTY_SECTIONS.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec === 'Semua' ? 'Semua Divisi' : sec}
                    </option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer font-medium"
                >
                  <option value="Semua">Semua Status</option>
                  {STATUS_ORDER.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={handleMarkAllActivePresent}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-xl border border-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Tandai seluruh personel aktif masuk hari ini"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Hadirkan Semua</span>
                </button>

                <button
                  onClick={handleMarkAllPaid}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-[11px] rounded-xl border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Tandai seluruh yang hadir telah dicairkan kas BNI"
                >
                  <DollarSign className="w-3.5 h-3.5 text-blue-700" />
                  <span>Cairkan Semua (BNI)</span>
                </button>

                <button
                  onClick={handleSaveAttendance}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Absensi</span>
                </button>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-3xl border border-slate-300 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">
                    Daftar Absensi & Jam Operasional: {formatIndoDate(selectedDate)}
                  </span>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                    {filteredDailyDraft.length} Personel
                  </span>
                </div>

                {isDirty && (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Belum tersimpan
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px]">
                      <th className="p-3 w-10 text-center">NO</th>
                      <th className="p-3 min-w-[180px]">NAMA LENGKAP</th>
                      <th className="p-3 min-w-[130px]">DIVISI</th>
                      <th className="p-3 text-center min-w-[130px]">STATUS KEHADIRAN</th>
                      <th className="p-3 text-center min-w-[90px]">JAM MASUK</th>
                      <th className="p-3 text-center min-w-[90px]">JAM PULANG</th>
                      <th className="p-3 text-center min-w-[120px] whitespace-nowrap">TELAT / LEMBUR</th>
                      <th className="p-3 text-right min-w-[100px]">UPAH (RP)</th>
                      <th className="p-3 text-center min-w-[110px]">PENCAIRAN BNI</th>
                      <th className="p-3 min-w-[200px]">CATATAN OPERASIONAL</th>
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
                          className={`transition-colors ${
                            isNonAktif
                              ? 'bg-rose-50/60'
                              : !isHadir
                              ? 'bg-amber-50/40'
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="p-3 text-center font-mono font-bold text-slate-500">
                            {person.no}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span className={isNonAktif ? 'line-through text-rose-700' : ''}>
                                {person.name}
                              </span>
                              {isNonAktif && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-rose-600 text-white rounded">
                                  NONAKTIF
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Shift: {person.defaultCheckIn} - {person.defaultCheckOut}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-md font-medium text-[11px] bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap inline-block">
                              {person.dutySection}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <select
                              value={entry.status}
                              disabled={!person.isActive}
                              onChange={(e) => handleUpdateStatus(person.id, e.target.value as AttendanceStatus)}
                              className={`text-xs font-bold rounded-xl px-2 py-1 border cursor-pointer focus:outline-none ${
                                entry.status === 'Hadir'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : entry.status === 'Izin'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : entry.status === 'Sakit'
                                  ? 'bg-purple-50 text-purple-800 border-purple-300'
                                  : entry.status === 'Alpha'
                                  ? 'bg-rose-100 text-rose-900 border-rose-300'
                                  : 'bg-slate-100 text-slate-600 border-slate-300'
                              }`}
                            >
                              {STATUS_ORDER.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Jam Masuk */}
                          <td className="p-3 text-center">
                            {isHadir ? (
                              <input
                                type="time"
                                value={entry.checkIn}
                                onChange={(e) => handleUpdateTime(person.id, 'checkIn', e.target.value)}
                                className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                              />
                            ) : (
                              <span className="text-slate-400 font-mono">-</span>
                            )}
                          </td>

                          {/* Jam Pulang */}
                          <td className="p-3 text-center">
                            {isHadir ? (
                              <input
                                type="time"
                                value={entry.checkOut}
                                onChange={(e) => handleUpdateTime(person.id, 'checkOut', e.target.value)}
                                className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                              />
                            ) : (
                              <span className="text-slate-400 font-mono">-</span>
                            )}
                          </td>

                          {/* Telat / Lembur */}
                          <td className="p-3 text-center font-mono text-[11px] whitespace-nowrap">
                            {isHadir ? (
                              <div className="space-y-0.5">
                                {entry.lateMinutes > 0 ? (
                                  <span className="text-rose-700 font-bold block">
                                    +{entry.lateMinutes}m Telat
                                  </span>
                                ) : (
                                  <span className="text-emerald-700 font-medium block">Tepat Waktu</span>
                                )}
                                {entry.overtimeMinutes > 0 && (
                                  <span className="text-blue-700 font-bold block">
                                    +{entry.overtimeMinutes}m Lembur
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          {/* Upah */}
                          <td className="p-3 text-right font-mono font-bold whitespace-nowrap">
                            {isHadir
                              ? renderSalary(entry.earnedAmount)
                              : renderSalary(person.dailyRate, true)}
                          </td>

                          {/* Status Cair */}
                          <td className="p-3 text-center whitespace-nowrap">
                            {isHadir ? (
                              <button
                                onClick={() => handleTogglePaid(person.id)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                                  entry.paid
                                    ? 'bg-blue-100 text-blue-900 border-blue-300'
                                    : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                                }`}
                              >
                                {entry.paid ? '✓ Cair BNI' : 'Menunggu SPJ'}
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium">Rp 0 (Batal Cair)</span>
                            )}
                          </td>

                          {/* Catatan */}
                          <td className="p-3">
                            <input
                              type="text"
                              value={entry.notes}
                              onChange={(e) => handleUpdateNotes(person.id, e.target.value)}
                              placeholder="Catatan tugas..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t-2 border-slate-300 font-bold text-slate-900">
                      <td colSpan={7} className="p-4 text-right uppercase text-[11px] text-slate-500">
                        Total Upah Hari Ini ({dailySummary.statusCounts.Hadir} Orang Hadir):
                      </td>
                      <td className="p-4 text-right font-mono text-sm text-blue-900 whitespace-nowrap">
                        {renderSalary(dailySummary.totalEarned)}
                      </td>
                      <td colSpan={2} className="p-4 text-left text-[11px] text-slate-500 font-normal">
                        *{dailySummary.statusCounts.Izin + dailySummary.statusCounts.Sakit + dailySummary.statusCounts.Alpha} Personel Tidak Masuk (Upah Rp 0)
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Mobile Card View (<768px) */}
            <div className="md:hidden space-y-3">
              {filteredDailyDraft.map((entry) => {
                const person = rosterMap.get(entry.volunteerId);
                if (!person) return null;
                const isHadir = entry.status === 'Hadir';

                return (
                  <div
                    key={entry.id}
                    className={`bg-white p-4 rounded-2xl border shadow-xs space-y-3 ${
                      !person.isActive
                        ? 'border-rose-200 bg-rose-50/40'
                        : !isHadir
                        ? 'border-amber-200 bg-amber-50/20'
                        : 'border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-slate-400">
                            #{person.no}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900">{person.name}</h4>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {person.dutySection} • Shift {person.defaultCheckIn}-{person.defaultCheckOut} • {renderSalary(person.dailyRate)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenEditRoster(person)}
                        className="p-1.5 text-slate-400 hover:text-blue-700 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Status Pills */}
                    <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                      {(['Hadir', 'Izin', 'Sakit', 'Alpha'] as AttendanceStatus[]).map((st) => (
                        <button
                          key={st}
                          disabled={!person.isActive}
                          onClick={() => handleUpdateStatus(person.id, st)}
                          className={`py-1.5 rounded-xl text-center transition-all cursor-pointer border ${
                            entry.status === st
                              ? st === 'Hadir'
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                                : st === 'Izin'
                                ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                                : st === 'Sakit'
                                ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                                : 'bg-rose-600 text-white border-rose-700 shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    {/* Time fields if Hadir */}
                    {isHadir && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                              Jam Masuk
                            </label>
                            <input
                              type="time"
                              value={entry.checkIn}
                              onChange={(e) => handleUpdateTime(person.id, 'checkIn', e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 font-mono font-bold text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                              Jam Pulang
                            </label>
                            <input
                              type="time"
                              value={entry.checkOut}
                              onChange={(e) => handleUpdateTime(person.id, 'checkOut', e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 font-mono font-bold text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                          <span className="font-mono text-xs font-bold text-blue-900">
                            Hak Upah: {renderSalary(entry.earnedAmount)}
                          </span>
                          <button
                            onClick={() => handleTogglePaid(person.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                              entry.paid
                                ? 'bg-blue-100 text-blue-900 border-blue-300'
                                : 'bg-white text-slate-700 border-slate-300'
                            }`}
                          >
                            {entry.paid ? '✓ Cair BNI' : 'Menunggu SPJ'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <input
                      type="text"
                      value={entry.notes}
                      onChange={(e) => handleUpdateNotes(person.id, e.target.value)}
                      placeholder="Catatan tugas..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                );
              })}
            </div>

            {/* Sticky bottom bar */}
            {isDirty && (
              <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Perubahan Belum Disimpan
                  </span>
                  <p className="text-[10px] text-slate-300">{formatIndoDate(selectedDate)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetDraft}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveAttendance}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: ARSIP LAPORAN HISTORIS                                 */}
        {/* ============================================================== */}
        {activeTab === 'arsip' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white p-5 rounded-3xl border border-slate-300 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-heading font-black text-base text-slate-900 flex items-center gap-2">
                    <Archive className="w-5 h-5 text-blue-700" />
                    <span>Arsip Historis Presensi & Berita Acara</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Telusuri dokumen rekapan absensi tanggal sebelumnya, cetak lembar SPJ, atau verifikasi upah.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchArsipQuery}
                    onChange={(e) => setSearchArsipQuery(e.target.value)}
                    placeholder="Cari tanggal arsip..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              {/* Archive Date Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {archivedDatesList.map((dateStr) => {
                  const dayRecords = ledger.filter((e) => e.date === dateStr);
                  const isCurrentSelected = dateStr === selectedDate;
                  const summary = calculatePeriodSummary(dayRecords.length > 0 ? dayRecords : buildDailyEntries(roster, dateStr));
                  const absent = (dayRecords.length > 0 ? dayRecords : buildDailyEntries(roster, dateStr))
                    .filter((e) => e.status === 'Izin' || e.status === 'Sakit' || e.status === 'Alpha')
                    .map((e) => rosterMap.get(e.volunteerId)?.name || e.volunteerId);

                  return (
                    <div
                      key={dateStr}
                      className={`p-4 rounded-2xl border transition-all space-y-3 bg-white ${
                        isCurrentSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div>
                          <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">
                            Arsip Operasional
                          </span>
                          <h4 className="font-heading font-black text-sm text-slate-900 mt-1">
                            {formatIndoDate(dateStr)}
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">
                          {dateStr}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                          <span className="text-slate-500 block text-[10px]">Hadir:</span>
                          <strong className="text-emerald-700 text-sm font-mono">{summary.statusCounts.Hadir} Orang</strong>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                          <span className="text-slate-500 block text-[10px]">Total Upah:</span>
                          <div className="pt-0.5">
                            {renderSalary(summary.totalEarned)}
                          </div>
                        </div>
                      </div>

                      {/* Absent names preview */}
                      <div className="text-[11px] pt-1">
                        <span className="text-[10px] text-slate-500 block mb-0.5">Ketidakhadiran:</span>
                        {absent.length === 0 ? (
                          <span className="text-emerald-700 font-bold text-[10px]">✓ 100% Hadir Lengkap</span>
                        ) : (
                          <div className="text-amber-800 font-semibold text-[10px] truncate" title={absent.join(', ')}>
                            {absent.length} orang: {absent.join(', ')}
                          </div>
                        )}
                      </div>

                      {/* Actions for this archive date */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            setSelectedDate(dateStr);
                            setActiveTab('checklist');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Buka Presensi
                        </button>

                        <button
                          onClick={() => handleOpenPrintForDate(dateStr)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak SPJ A4</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 4: MATRIX MINGGUAN (6 HARI KERJA)                         */}
        {/* ============================================================== */}
        {activeTab === 'mingguan' && (
          <div className="bg-white rounded-3xl border border-slate-300 shadow-xs overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-heading font-black text-slate-900 text-sm block">
                  Matrix Kehadiran Mingguan (Senin s/d Jumat • Sabtu Khusus General Cleaning)
                </span>
                <span className="text-[11px] text-slate-500">
                  Pekan: {weekDays[0].formatted} – {weekDays[weekDays.length - 1].formatted}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
                  H = Hadir (Kerja / General Cleaning)
                </span>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded">
                  I = Izin (Hari Kerja)
                </span>
                <span className="px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded">
                  S = Sakit
                </span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-300 rounded">
                  - = Libur Akhir Pekan
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px]">
                    <th className="p-2.5 w-10 text-center">NO</th>
                    <th className="p-2.5 min-w-[180px]">NAMA RELAWAN</th>
                    <th className="p-2.5">DIVISI</th>
                    <th className="p-2.5 text-right">TARIF / HR</th>
                    {weekDays.map((d) => (
                      <th
                        key={d.date}
                        className={`p-2 text-center w-12 ${
                          d.label === 'Sabtu'
                            ? 'bg-amber-100/70 text-amber-900 border-x border-amber-200'
                            : 'bg-slate-200/80'
                        }`}
                      >
                        <div className="text-[10px] uppercase">{d.label.slice(0, 3)}</div>
                        <div className="text-[9px] font-mono text-slate-500">{d.formatted}</div>
                        {d.label === 'Sabtu' && (
                          <span className="text-[8px] font-normal block text-amber-800 leading-tight">Cleaning</span>
                        )}
                      </th>
                    ))}
                    <th className="p-2.5 text-center">TOTAL HADIR</th>
                    <th className="p-2.5 text-right">TOTAL UPAH PEKAN INI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roster.map((person) => {
                    let hadirCount = 0;
                    const weekStatuses = weekDays.map((d) => {
                      const st = weeklyLedgerMap.get(`${person.id}:${d.date}`) || (person.isActive ? 'Hadir' : 'Nonaktif');
                      if (st === 'Hadir') hadirCount += 1;
                      return st;
                    });
                    const totalEarnedWeek = hadirCount * person.dailyRate;

                    return (
                      <tr key={person.id} className="hover:bg-slate-50/80">
                        <td className="p-2.5 text-center font-mono font-bold text-slate-500">{person.no}</td>
                        <td className="p-2.5 font-bold text-slate-900">
                          <span className={!person.isActive ? 'line-through text-rose-700' : ''}>
                            {person.name}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-600 font-medium">{person.dutySection}</td>
                        <td className="p-2.5 text-right font-mono whitespace-nowrap">{renderSalary(person.dailyRate)}</td>

                        {weekStatuses.map((st, idx) => {
                          const isSat = weekDays[idx].label === 'Sabtu';
                          return (
                            <td key={idx} className={`p-2 text-center font-mono font-bold ${isSat ? 'bg-amber-50/30' : ''}`}>
                              {st === 'Hadir' ? (
                                <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">✓</span>
                              ) : st === 'Izin' ? (
                                <span className="text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">I</span>
                              ) : st === 'Sakit' ? (
                                <span className="text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded text-[10px]">S</span>
                              ) : st === 'Alpha' ? (
                                <span className="text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded text-[10px]">A</span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                          );
                        })}

                        <td className="p-2.5 text-center font-mono font-bold text-slate-900">
                          {person.isActive ? `${hadirCount} Hari` : '-'}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-blue-900 whitespace-nowrap">
                          {person.isActive ? renderSalary(totalEarnedWeek) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-300 font-bold text-slate-900">
                    <td colSpan={10} className="p-4 text-right uppercase text-[11px] text-slate-500">
                      Total Amprah Mingguan:
                    </td>
                    <td className="p-4 text-right font-mono text-sm text-blue-900 whitespace-nowrap">
                      {renderSalary(weeklySummary.totalEarned)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 5: BUKU SPJ BULANAN                                       */}
        {/* ============================================================== */}
        {activeTab === 'bulanan' && (
          <div className="bg-white rounded-3xl border border-slate-300 shadow-xs overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-heading font-black text-slate-900 text-sm block">
                  Buku Rekapitulasi Upah Relawan Dapur Bulan {selectedMonth}
                </span>
                <span className="text-[11px] text-slate-500">
                  Akumulasi kehadiran per relawan untuk lampiran Berita Acara SPJ BGN.
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px]">
                    <th className="p-2.5 w-10 text-center">NO</th>
                    <th className="p-2.5 min-w-[180px]">NAMA LENGKAP</th>
                    <th className="p-2.5">DIVISI</th>
                    <th className="p-2.5 text-right">TARIF / HARI</th>
                    <th className="p-2.5 text-center">TOTAL HADIR</th>
                    <th className="p-2.5 text-center">IZIN / SAKIT</th>
                    <th className="p-2.5 text-right">TOTAL UPAH DITERIMA</th>
                    <th className="p-2.5 text-center">VERIFIKASI BNI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roster.map((person) => {
                    const personMonthEntries = monthlyEntries.filter((e) => e.volunteerId === person.id);
                    const hadirCount = personMonthEntries.filter((e) => e.status === 'Hadir').length;
                    const izinCount = personMonthEntries.filter((e) => e.status === 'Izin' || e.status === 'Sakit').length;
                    const totalEarned = hadirCount * person.dailyRate;

                    return (
                      <tr key={person.id} className="hover:bg-slate-50/80">
                        <td className="p-2.5 text-center font-mono font-bold text-slate-500">{person.no}</td>
                        <td className="p-2.5 font-bold text-slate-900">
                          <span className={!person.isActive ? 'line-through text-rose-700' : ''}>
                            {person.name}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-600 font-medium">{person.dutySection}</td>
                        <td className="p-2.5 text-right font-mono whitespace-nowrap">{renderSalary(person.dailyRate)}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-emerald-700">
                          {person.isActive ? `${hadirCount} Hari` : '-'}
                        </td>
                        <td className="p-2.5 text-center font-mono text-amber-700 font-bold">
                          {person.isActive ? `${izinCount} Hari` : '-'}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-blue-900 whitespace-nowrap">
                          {person.isActive ? renderSalary(totalEarned) : '-'}
                        </td>
                        <td className="p-2.5 text-center">
                          {person.isActive ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              Terverifikasi BNI
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium text-[10px]">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-300 font-bold text-slate-900">
                    <td colSpan={6} className="p-4 text-right uppercase text-[11px] text-slate-500">
                      Grand Total Upah Bulan {selectedMonth}:
                    </td>
                    <td className="p-4 text-right font-mono text-base text-blue-900 whitespace-nowrap">
                      {renderSalary(monthlySummary.totalEarned)}
                    </td>
                    <td className="p-4 text-center text-[10px] text-slate-500 font-normal">
                      Lolos Audit SPJ BGN
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 6: KELOLA ROSTER                                          */}
        {/* ============================================================== */}
        {activeTab === 'roster' && (
          <div className="bg-white rounded-3xl border border-slate-300 shadow-xs p-5 sm:p-6 space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900">
                  Master Roster Dapur ({roster.length} Personel Resmi)
                </h3>
                <p className="text-xs text-slate-500">
                  Kelola divisi, shift default, dan tarif harian resmi SPPG Wonodri 3.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Personel Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {roster.map((person) => (
                <div
                  key={person.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2 ${
                    person.isActive
                      ? 'border-slate-300 bg-slate-50/50 hover:border-blue-300'
                      : 'border-rose-200 bg-rose-50/40 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-400">
                          #{person.no}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{person.name}</h4>
                      </div>
                      <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 inline-block mt-1">
                        {person.dutySection}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenEditRoster(person)}
                      className="p-1.5 text-slate-400 hover:text-blue-700 bg-white rounded-lg border border-slate-200 shadow-2xs cursor-pointer"
                      title="Edit Profil Personel"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Upah Harian:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {renderSalary(person.dailyRate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Shift Default:</span>
                      <span className="font-mono text-slate-700">
                        {person.defaultCheckIn} - {person.defaultCheckOut}
                      </span>
                    </div>
                  </div>

                  {person.notes && (
                    <p className="text-[10px] text-slate-400 italic pt-1">{person.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL EDIT ROSTER                                              */}
      {/* ============================================================== */}
      {editingVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Edit Upah & Shift Kerja
                </h3>
                <span className="text-xs text-blue-700 font-bold block">
                  #{editingVolunteer.no} - {editingVolunteer.name}
                </span>
              </div>
              <button
                onClick={() => setEditingVolunteer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRoster} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Upah Harian (Rp)
                </label>
                <input
                  type="number"
                  value={editRateInput}
                  onChange={(e) => setEditRateInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Peran / Divisi</label>
                <select
                  value={editSectionInput}
                  onChange={(e) => setEditSectionInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer font-medium"
                >
                  {DUTY_SECTIONS.filter((s) => s !== 'Semua').map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Jam Masuk</label>
                  <input
                    type="time"
                    value={editCheckInInput}
                    onChange={(e) => setEditCheckInInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Jam Pulang</label>
                  <input
                    type="time"
                    value={editCheckOutInput}
                    onChange={(e) => setEditCheckOutInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
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
                  Status Personel Aktif (Masuk jadwal harian)
                </label>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  value={editNotesInput}
                  onChange={(e) => setEditNotesInput(e.target.value)}
                  placeholder="Misal: Non-aktif / alih tugas..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingVolunteer(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL TAMBAH PERSONEL                                          */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                Tambah Personel Dapur Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPersonSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  placeholder="Contoh: AHMAD FAUZI"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-blue-600 uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Peran / Divisi</label>
                <select
                  value={newPersonSection}
                  onChange={(e) => setNewPersonSection(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer font-medium"
                >
                  {DUTY_SECTIONS.filter((s) => s !== 'Semua').map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Upah Harian (Rp)</label>
                <input
                  type="number"
                  value={newPersonRate}
                  onChange={(e) => setNewPersonRate(e.target.value)}
                  placeholder="125000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Jam Masuk</label>
                  <input
                    type="time"
                    value={newPersonCheckIn}
                    onChange={(e) => setNewPersonCheckIn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Jam Pulang</label>
                  <input
                    type="time"
                    value={newPersonCheckOut}
                    onChange={(e) => setNewPersonCheckOut(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Daftarkan Personel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL PRINT SPJ A4                                             */}
      {/* ============================================================== */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 my-8 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-heading font-black text-lg text-slate-900">
                  Pratinjau Lembar SPJ Amprah Upah Relawan (A4)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* A4 Printable Document Body */}
            <div className="space-y-6 text-slate-900 print:text-black">
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider">
                  SATUAN PELAYANAN PROGRAM GIZI (SPPG) WONODRI 3
                </h2>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-700">
                  BERITA ACARA & REKAPITULASI AMPRAH UPAH RELAWAN DAPUR
                </h3>
                <p className="text-[11px] text-slate-500">
                  Jl. Erlangga Raya No 38, Kel. Pleburan, Kec. Semarang Selatan, Kota Semarang • VA BNI: 9880-1556-2026-0003
                </p>
                <div className="text-xs font-mono font-bold text-slate-800 pt-1">
                  Tanggal: {formatIndoDate(printDateTarget)} | Kuota: 1.556 Porsi (13 Titik)
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-300">
                      <th className="p-2 border border-slate-300 text-center w-8">NO</th>
                      <th className="p-2 border border-slate-300">NAMA LENGKAP</th>
                      <th className="p-2 border border-slate-300">DIVISI</th>
                      <th className="p-2 border border-slate-300 text-center">STATUS</th>
                      <th className="p-2 border border-slate-300 text-center">JAM MASUK</th>
                      <th className="p-2 border border-slate-300 text-right">TARIF / HR</th>
                      <th className="p-2 border border-slate-300 text-right">HAK UPAH</th>
                      <th className="p-2 border border-slate-300 text-center w-24">TANDA TANGAN</th>
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
                          <td className="p-1.5 border border-slate-300 font-bold">{person.name}</td>
                          <td className="p-1.5 border border-slate-300">{person.dutySection}</td>
                          <td className="p-1.5 border border-slate-300 text-center font-bold">
                            {entry.status}
                          </td>
                          <td className="p-1.5 border border-slate-300 text-center font-mono">
                            {entry.checkIn || '-'}
                          </td>
                          <td className="p-1.5 border border-slate-300 text-right font-mono">
                            {formatRupiah(person.dailyRate)}
                          </td>
                          <td className="p-1.5 border border-slate-300 text-right font-mono font-bold">
                            {formatRupiah(entry.earnedAmount)}
                          </td>
                          <td className="p-1.5 border border-slate-300 text-center text-slate-300">
                            {person.no}. ........
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={6} className="p-2 border border-slate-300 text-right uppercase text-[11px]">
                        Total Pengeluaran Upah Riil:
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono text-xs text-blue-900">
                        {formatRupiah(printableSummary.totalEarned)}
                      </td>
                      <td className="p-2 border border-slate-300 text-center text-[10px] text-slate-500">
                        Lolos Audit BGN
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* 3 Legal Sign-Off Blocks */}
              <div className="grid grid-cols-3 gap-6 pt-4 text-center text-xs">
                <div className="space-y-12">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Mengetahui,</span>
                    <strong className="text-slate-900">Asisten Lapangan</strong>
                  </div>
                  <div>
                    <div className="font-bold underline text-slate-900">ARIEF RAHMAN HAKIM</div>
                    <span className="text-[10px] text-slate-500">PJ Operasional Dapur</span>
                  </div>
                </div>

                <div className="space-y-12">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Diverifikasi oleh,</span>
                    <strong className="text-slate-900">Petugas Akuntansi</strong>
                  </div>
                  <div>
                    <div className="font-bold underline text-slate-900">SALSABIILA ZAINIMA, S.Ak</div>
                    <span className="text-[10px] text-slate-500">Verifikator Kas BNI SPPG</span>
                  </div>
                </div>

                <div className="space-y-12">
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

      {/* ============================================================== */}
      {/* MODAL PROTEKSI PIN GAJI & INSENTIF SENSIFITAS TINGGI           */}
      {/* ============================================================== */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
                <KeyRound className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h3 className="font-heading font-black text-base text-slate-900">
                  Proteksi Data Finansial SPPG
                </h3>
                <p className="text-xs text-slate-500 pt-0.5">
                  Informasi tarif upah dan insentif relawan bersifat sensitif. Masukkan PIN otoritas resmi untuk membuka.
                </p>
              </div>
            </div>

            <form onSubmit={handleVerifySalaryPin} className="space-y-3.5 pt-1">
              <div>
                <input
                  type="password"
                  maxLength={6}
                  autoFocus
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  placeholder="Masukkan PIN Otoritas..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-center text-lg font-mono font-black tracking-widest text-slate-900 placeholder:text-slate-400 placeholder:tracking-normal placeholder:text-xs focus:outline-none focus:border-blue-600 focus:bg-white"
                />
                {pinError && (
                  <p className="text-[11px] font-bold text-rose-600 flex items-center justify-center gap-1 mt-1.5 animate-in fade-in">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {pinError}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false);
                    setPinInput('');
                    setPinError('');
                    setPinPendingAction(null);
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Buka Akses</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
