'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar as CalendarIcon,
  Users,
  Printer,
  Download,
  Plus,
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Search,
  Edit2,
  Save,
  DollarSign,
  UserCheck,
  ArrowLeft,
  X,
  FileSpreadsheet,
  Archive,
  Table as TableIcon,
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

export type PortalTab = 'harian' | 'rekap' | 'arsip' | 'roster';

export default function AbsensiPortalPage() {
  const [roster, setRoster] = useState<VolunteerProfile[]>(DEFAULT_ROSTER_40);
  const [ledger, setLedger] = useState<AttendanceEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-21');
  const [currentDayDraft, setCurrentDayDraft] = useState<AttendanceEntry[]>([]);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Clean 4 Tabs: Harian, Rekap (Mingguan/Bulanan), Arsip, Roster
  const [activeTab, setActiveTab] = useState<PortalTab>('harian');
  const [rekapPeriod, setRekapPeriod] = useState<'mingguan' | 'bulanan'>('mingguan');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');

  // Search & Filters
  const [searchName, setSearchName] = useState<string>('');
  const [filterSection, setFilterSection] = useState<string>('Semua');
  const [searchArsip, setSearchArsip] = useState<string>('');

  // Modals
  const [editingVolunteer, setEditingVolunteer] = useState<VolunteerProfile | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printDateTarget, setPrintDateTarget] = useState<string>('2026-10-21');

  // PIN Protection for sensitive financial data
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

  // Sync draft when selected date or ledger changes
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

  // Absent personnel on current date
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

  // Draft updates
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
          const raw = { ...entry, [field]: value };
          return normalizeAttendanceEntry(raw, person);
        }
        return entry;
      });
    });
    setIsDirty(true);
  };

  const handleUpdateNotes = (volunteerId: string, notes: string) => {
    setCurrentDayDraft((prev) => {
      return prev.map((entry) => (entry.volunteerId === volunteerId ? { ...entry, notes } : entry));
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

    setSaveToast(`✓ Presensi ${formatIndoDate(selectedDate)} tersimpan!`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleShiftDate = (daysOffset: number) => {
    if (isDirty) {
      if (!window.confirm('Ada perubahan yang belum disimpan. Pindah tanggal sekarang?')) return;
    }
    const current = new Date(`${selectedDate}T12:00:00`);
    current.setDate(current.getDate() + daysOffset);
    setSelectedDate(toIsoDateLocal(current));
  };

  // PIN security actions
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
      setPinError('PIN salah! Akses khusus operator resmi.');
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
      handleOpenPinModal('export');
      return;
    }
    executeExportCsv();
  };

  const executeExportCsv = () => {
    let exportEntries = currentDayDraft;
    let fileSuffix = selectedDate;

    if (activeTab === 'rekap') {
      if (rekapPeriod === 'mingguan') {
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
      .forEach((e) => map.set(`${e.volunteerId}:${e.date}`, e.status));
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

  // Distinct dates for archive list
  const archivedDatesList = useMemo(() => {
    const dateSet = new Set<string>();
    ledger.forEach((e) => dateSet.add(e.date));
    dateSet.add(selectedDate);
    const list = Array.from(dateSet).sort((a, b) => b.localeCompare(a));
    if (!searchArsip.trim()) return list;
    return list.filter((d) => d.includes(searchArsip) || formatIndoDate(d).toLowerCase().includes(searchArsip.toLowerCase()));
  }, [ledger, selectedDate, searchArsip]);

  // Filtered daily list
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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">
      {/* 1. TOP NAVBAR (CALM & MINIMAL) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 no-print shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 h-15 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Kembali ke Laporan Menu Harian"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
              <Image src="/logo.png" alt="Logo BGN" width={24} height={24} className="object-contain" priority />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                  SPPG Wonodri 3
                </span>
                <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 font-mono">
                  Presensi Relawan
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block -mt-0.5">Central Kitchen Semarang Selatan</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSalaryUnlocked ? (
              <button
                type="button"
                onClick={handleLockSalary}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Kunci kembali tampilan upah"
              >
                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Upah Terbuka</span>
                <span className="sm:hidden">Kunci</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenPinModal('unlock')}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Buka tampilan upah dengan PIN"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Buka Upah (PIN)</span>
              </button>
            )}

            <button
              onClick={handleExportCsv}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Unduh Spreadsheet CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            <button
              onClick={() => handleOpenPrintForDate(selectedDate)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              title="Cetak Berita Acara & SPJ A4"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak SPJ</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="max-w-6xl mx-auto w-full px-4 py-5 flex-1 space-y-4">
        {/* Navigation Tabs Bar & Date Switcher */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2 sm:p-2.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Segmented Controls */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold overflow-x-auto">
            <button
              onClick={() => setActiveTab('harian')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'harian'
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Presensi Harian</span>
            </button>

            <button
              onClick={() => setActiveTab('rekap')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'rekap'
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Rekapitulasi</span>
            </button>

            <button
              onClick={() => setActiveTab('arsip')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'arsip'
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Arsip Laporan</span>
            </button>

            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'roster'
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Roster 40</span>
            </button>
          </div>

          {/* Clean Date Navigator */}
          {activeTab === 'harian' && (
            <div className="flex items-center gap-1.5 self-end md:self-auto">
              <button
                onClick={() => handleShiftDate(-1)}
                className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                title="Hari Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
                <CalendarIcon className="w-3.5 h-3.5 text-blue-700" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                />
              </div>

              <button
                onClick={() => handleShiftDate(1)}
                className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                title="Hari Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSelectedDate(toIsoDateLocal(new Date()))}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Hari Ini
              </button>
            </div>
          )}

          {activeTab === 'rekap' && (
            <div className="flex items-center gap-2 self-end md:self-auto">
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
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

        {/* 4 SUMMARY METRIC CARDS (CLEAN & BALANCED) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* 1. Hadir */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Hadir ({formatIndoDate(selectedDate).split(',')[0]})
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
              {dailySummary.statusCounts.Hadir} <span className="text-xs font-normal text-slate-400">/ 38 Aktif</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-medium block">
              Efektivitas {Math.round((dailySummary.statusCounts.Hadir / 38) * 100)}%
            </span>
          </div>

          {/* 2. Izin/Sakit/Absen */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Izin / Tidak Hadir
            </span>
            {absentPersonnel.length === 0 ? (
              <div>
                <div className="text-lg font-bold text-slate-900 font-mono">0 Orang</div>
                <span className="text-[11px] text-emerald-600 font-medium block">Semua Hadir Lengkap</span>
              </div>
            ) : (
              <div className="space-y-0.5">
                <div className="text-sm font-black text-amber-700">
                  {absentPersonnel.length} Orang Izin:
                </div>
                <div className="text-[11px] font-medium text-slate-700 truncate" title={absentPersonnel.map((p) => p.name).join(', ')}>
                  {absentPersonnel.map((p) => p.name).join(', ')}
                </div>
              </div>
            )}
          </div>

          {/* 3. Beban Upah */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Upah Hari Ini
              </span>
              {!isSalaryUnlocked && <Lock className="w-3 h-3 text-slate-300" />}
            </div>
            <div className="pt-0.5">
              {renderSalary(dailySummary.totalEarned)}
            </div>
            <span className="text-[10px] text-slate-400 block">Plafon Rp 5.005.000 / BNI</span>
          </div>

          {/* 4. Roster Tim */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Roster Dapur
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              40 <span className="text-xs font-normal text-slate-400">Personel</span>
            </div>
            <span className="text-[11px] text-slate-400 block">
              38 Masuk Shift • 2 Nonaktif
            </span>
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

        {/* ============================================================== */}
        {/* TAB 1: PRESENSI HARIAN                                         */}
        {/* ============================================================== */}
        {activeTab === 'harian' && (
          <div className="space-y-3 animate-in fade-in">
            {/* Toolbar filter */}
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
                      <th className="py-2.5 px-3 text-center">STATUS</th>
                      <th className="py-2.5 px-3 text-center">JAM MASUK</th>
                      <th className="py-2.5 px-3 text-center">JAM PULANG</th>
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
                          <td className="py-2 px-3 text-center font-mono text-slate-400 font-medium">
                            {person.no}
                          </td>
                          <td className="py-2 px-3">
                            <div className="font-semibold text-slate-900">
                              <span className={isNonAktif ? 'line-through text-slate-400' : ''}>
                                {person.name}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Shift: {person.defaultCheckIn}-{person.defaultCheckOut}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-600 font-medium whitespace-nowrap">
                            {person.dutySection}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <select
                              value={entry.status}
                              disabled={!person.isActive}
                              onChange={(e) => handleUpdateStatus(person.id, e.target.value as AttendanceStatus)}
                              className={`text-xs font-semibold rounded-md px-2 py-1 border cursor-pointer focus:outline-none ${
                                entry.status === 'Hadir'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : entry.status === 'Izin'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : entry.status === 'Sakit'
                                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
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
                          <td className="py-2 px-3 text-center">
                            {isHadir ? (
                              <input
                                type="time"
                                value={entry.checkIn}
                                onChange={(e) => handleUpdateTime(person.id, 'checkIn', e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-mono font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                              />
                            ) : (
                              <span className="text-slate-300 font-mono">-</span>
                            )}
                          </td>

                          {/* Jam Pulang */}
                          <td className="py-2 px-3 text-center">
                            {isHadir ? (
                              <input
                                type="time"
                                value={entry.checkOut}
                                onChange={(e) => handleUpdateTime(person.id, 'checkOut', e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-mono font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                              />
                            ) : (
                              <span className="text-slate-300 font-mono">-</span>
                            )}
                          </td>

                          {/* Upah */}
                          <td className="py-2 px-3 text-right whitespace-nowrap">
                            {isHadir ? renderSalary(entry.earnedAmount) : renderSalary(person.dailyRate, true)}
                          </td>

                          {/* Status Cair */}
                          <td className="py-2 px-3 text-center whitespace-nowrap">
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
                          <td className="py-2 px-3">
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
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">{person.name}</span>
                        <span className="text-[10px] text-slate-400">
                          #{person.no} • {person.dutySection} • {person.defaultCheckIn}-{person.defaultCheckOut}
                        </span>
                      </div>
                      <div>{isHadir ? renderSalary(entry.earnedAmount) : renderSalary(person.dailyRate, true)}</div>
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-[11px] font-semibold">
                      {(['Hadir', 'Izin', 'Sakit', 'Alpha'] as AttendanceStatus[]).map((st) => (
                        <button
                          key={st}
                          disabled={!person.isActive}
                          onClick={() => handleUpdateStatus(person.id, st)}
                          className={`py-1 rounded text-center transition-colors cursor-pointer border ${
                            entry.status === st
                              ? st === 'Hadir'
                                ? 'bg-emerald-600 text-white border-emerald-700'
                                : 'bg-amber-600 text-white border-amber-700'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    {isHadir && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs font-mono">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="time"
                            value={entry.checkIn}
                            onChange={(e) => handleUpdateTime(person.id, 'checkIn', e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs"
                          />
                          <span>-</span>
                          <input
                            type="time"
                            value={entry.checkOut}
                            onChange={(e) => handleUpdateTime(person.id, 'checkOut', e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs"
                          />
                        </div>
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

        {/* ============================================================== */}
        {/* TAB 2: REKAPITULASI (MINGGUAN / BULANAN)                       */}
        {/* ============================================================== */}
        {activeTab === 'rekap' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden animate-in fade-in">
            {rekapPeriod === 'mingguan' ? (
              <div className="overflow-x-auto">
                <div className="p-3.5 border-b border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    Matrix Kehadiran Pekan: {weekDays[0].formatted} – {weekDays[weekDays.length - 1].formatted}
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
                        <th key={d.date} className="py-2 px-2 text-center w-12 bg-slate-100/60 font-mono">
                          {d.label.slice(0, 3)}
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
                        const st = weeklyLedgerMap.get(`${person.id}:${d.date}`) || (person.isActive ? 'Hadir' : 'Nonaktif');
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

        {/* ============================================================== */}
        {/* TAB 3: ARSIP LAPORAN HISTORIS                                 */}
        {/* ============================================================== */}
        {activeTab === 'arsip' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-in fade-in shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Arsip Tanggal Operasional</h3>
                <span className="text-xs text-slate-400">Total {archivedDatesList.length} tanggal tersimpan</span>
              </div>

              <div className="relative w-full sm:w-56">
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
                          setActiveTab('harian');
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

        {/* ============================================================== */}
        {/* TAB 4: ROSTER 40                                               */}
        {/* ============================================================== */}
        {activeTab === 'roster' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-in fade-in shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Roster Resmi 40 Personel</h3>
                <span className="text-xs text-slate-400">Shift jadwal & tarif upah harian BGN</span>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Personel</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {roster.map((person) => (
                <div
                  key={person.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                    person.isActive ? 'border-slate-200 bg-white' : 'border-rose-200 bg-rose-50/30 opacity-70'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900">
                      #{person.no} {person.name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {person.dutySection} • {person.defaultCheckIn}-{person.defaultCheckOut}
                    </div>
                    <div className="text-[10px] text-blue-900 font-mono font-bold pt-0.5">
                      {renderSalary(person.dailyRate)}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditingVolunteer(person);
                      setEditRateInput(person.dailyRate.toString());
                      setEditSectionInput(person.dutySection);
                      setEditCheckInInput(person.defaultCheckIn);
                      setEditCheckOutInput(person.defaultCheckOut);
                      setEditIsActiveInput(person.isActive);
                      setEditNotesInput(person.notes || '');
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL PRINT SPJ A4 */}
      {showPrintModal && (
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
                  onClick={() => setShowPrintModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* A4 Content */}
            <div className="space-y-5 text-slate-900 print:text-black">
              <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
                <h2 className="text-base font-black uppercase tracking-wider">
                  SATUAN PELAYANAN PROGRAM GIZI (SPPG) WONODRI 3
                </h2>
                <h3 className="text-xs font-bold uppercase text-slate-700">
                  BERITA ACARA & REKAPITULASI AMPRAH UPAH RELAWAN DAPUR
                </h3>
                <p className="text-[11px] text-slate-500">
                  Jl. Erlangga Raya No 38, Semarang Selatan • VA BNI: 9880-1556-2026-0003
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

      {/* MODAL PIN SECURITY */}
      {showPinModal && (
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
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  placeholder="PIN..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-center text-lg font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:border-blue-600"
                />
                {pinError && (
                  <p className="text-[11px] font-bold text-rose-600 text-center mt-1">
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

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-400 border-t border-slate-200 bg-white no-print">
        Portal Presensi Relawan Dapur • SPPG Wonodri 3 Kota Semarang
      </footer>
    </div>
  );
}
