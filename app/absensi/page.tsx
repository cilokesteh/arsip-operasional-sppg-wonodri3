'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Search,
  Edit2,
  X,
  Save,
  Calendar,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  CheckCircle2,
  DollarSign,
  UserCheck,
  ArrowLeft,
  AlertTriangle,
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

export default function AbsensiPage() {
  // 1. Master Roster State
  const [roster, setRoster] = useState<VolunteerProfile[]>(DEFAULT_ROSTER_40);

  // 2. Attendance Ledger State
  const [ledger, setLedger] = useState<AttendanceEntry[]>([]);

  // 3. Active Date State
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-21');

  // 4. Working Draft for Selected Date
  const [currentDayDraft, setCurrentDayDraft] = useState<AttendanceEntry[]>([]);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // 5. Navigation View Mode
  const [periodMode, setPeriodMode] = useState<'harian' | 'mingguan' | 'bulanan' | 'roster'>('harian');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');

  // 6. Search & Filters
  const [searchName, setSearchName] = useState<string>('');
  const [filterSection, setFilterSection] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  // 7. Modals
  const [editingVolunteer, setEditingVolunteer] = useState<VolunteerProfile | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

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

  // Draft manipulation handlers
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

  const handleUpdateTime = (
    volunteerId: string,
    field: 'checkIn' | 'checkOut',
    value: string
  ) => {
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

  const handleExportCsv = () => {
    let exportEntries: AttendanceEntry[] = [];
    let fileSuffix = selectedDate;

    if (periodMode === 'harian') {
      exportEntries = currentDayDraft;
      fileSuffix = selectedDate;
    } else if (periodMode === 'mingguan') {
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

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-[#1e293b] flex flex-col font-sans w-full overflow-x-hidden">
      {/* 1. Top Bar Navigasi Sistem */}
      <header className="bg-[#0f172a] text-white border-b border-slate-800 sticky top-0 z-40 no-print">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold mr-1"
              title="Kembali ke Laporan Menu Harian"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Menu Harian</span>
            </Link>

            <div className="w-8 h-8 rounded bg-white p-0.5 flex items-center justify-center shrink-0">
              <Image src="/logo.png" alt="Logo BGN" width={24} height={24} className="object-contain" priority />
            </div>

            <div className="min-w-0">
              <span className="font-extrabold text-xs sm:text-sm text-white block leading-tight tracking-tight truncate">
                SPPG Wonodri 3
              </span>
              <span className="text-[10px] text-slate-400 font-medium block truncate">
                Modul Absensi & Amprah SPJ
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleExportCsv}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] sm:text-xs">CSV</span>
            </button>

            <button
              onClick={() => setShowPrintModal(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="text-[11px] sm:text-xs">Cetak SPJ A4</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="text-[11px] sm:text-xs">Personel</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN BODY */}
      <main className="max-w-6xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-6 flex-1 space-y-5">
        {/* Header Title Card */}
        <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                  40 Personel Resmi
                </span>
                <span className="text-xs text-slate-500 font-mono">• Matriks Shift 24 Jam Dapur BGN</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                Rekapitulasi Absensi & Upah Relawan Dapur
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Standar Juknis BGN TA 2026: Pencatatan jam masuk riil, keterlambatan, lembur masak, dan rekapitulasi amprah insentif kas BNI SPPG.
              </p>
            </div>
          </div>

          {/* Mode Switcher & Date Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200">
            {/* Tabs */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 text-xs font-bold overflow-x-auto">
              <button
                onClick={() => setPeriodMode('harian')}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  periodMode === 'harian'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span className="sm:hidden">Harian</span>
                <span className="hidden sm:inline">Harian (Live Checklist)</span>
              </button>
              <button
                onClick={() => setPeriodMode('mingguan')}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  periodMode === 'mingguan'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span className="sm:hidden">Mingguan</span>
                <span className="hidden sm:inline">Mingguan (Matrix 6 Hari)</span>
              </button>
              <button
                onClick={() => setPeriodMode('bulanan')}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  periodMode === 'bulanan'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span className="sm:hidden">Bulanan</span>
                <span className="hidden sm:inline">Bulanan (SPJ Kas BNI)</span>
              </button>
              <button
                onClick={() => setPeriodMode('roster')}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  periodMode === 'roster'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span className="sm:hidden">Roster</span>
                <span className="hidden sm:inline">Kelola Roster</span>
              </button>
            </div>

            {/* Date Pickers */}
            {periodMode === 'harian' && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => handleShiftDate(-1)}
                  className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer border border-slate-200 shrink-0"
                  title="Hari Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5">
                  <Calendar className="w-4 h-4 text-blue-700 shrink-0" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => handleShiftDate(1)}
                  className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer border border-slate-200 shrink-0"
                  title="Hari Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setSelectedDate(toIsoDateLocal(new Date()))}
                  className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Hari Ini
                </button>
              </div>
            )}

            {periodMode === 'mingguan' && (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <Calendar className="w-4 h-4 text-blue-700" />
                <span>
                  Pekan: {weekDays[0].formatted} – {weekDays[weekDays.length - 1].formatted}
                </span>
              </div>
            )}

            {periodMode === 'bulanan' && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5">
                <Calendar className="w-4 h-4 text-blue-700" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* 3. DYNAMIC SUMMARY METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-xs space-y-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Personel
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {roster.length} Orang
            </div>
            <span className="text-[11px] text-slate-400">
              {roster.filter((p) => p.isActive).length} Aktif / {roster.filter((p) => !p.isActive).length} Nonaktif
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-xs space-y-1">
            <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block">
              {periodMode === 'harian' ? 'Hadir Hari Ini (✓)' : periodMode === 'mingguan' ? 'Total Masuk Pekan Ini' : 'Total Masuk Bulan Ini'}
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
              {periodMode === 'harian'
                ? `${dailySummary.statusCounts.Hadir} Orang`
                : periodMode === 'mingguan'
                ? `${weeklySummary.statusCounts.Hadir} Hari`
                : `${monthlySummary.statusCounts.Hadir} Hari`}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">
              {periodMode === 'harian'
                ? `Efektivitas ${Math.round((dailySummary.statusCounts.Hadir / Math.max(1, roster.filter((p) => p.isActive).length)) * 100)}%`
                : 'Tercatat di Ledger'}
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-xs space-y-1">
            <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider block">
              Izin / Sakit / Alpha
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono">
              {periodMode === 'harian'
                ? `${dailySummary.statusCounts.Izin + dailySummary.statusCounts.Sakit + dailySummary.statusCounts.Alpha} Kasus`
                : periodMode === 'mingguan'
                ? `${weeklySummary.statusCounts.Izin + weeklySummary.statusCounts.Sakit + weeklySummary.statusCounts.Alpha} Kasus`
                : `${monthlySummary.statusCounts.Izin + monthlySummary.statusCounts.Sakit + monthlySummary.statusCounts.Alpha} Kasus`}
            </div>
            <span className="text-[11px] text-slate-400">
              {periodMode === 'harian'
                ? `I:${dailySummary.statusCounts.Izin} S:${dailySummary.statusCounts.Sakit} A:${dailySummary.statusCounts.Alpha}`
                : 'Insentif Terpotong'}
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-xs space-y-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Disiplin Jam Masuk
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-800 font-mono">
              {periodMode === 'harian' ? `${dailySummary.totalLateMinutes}m Telat` : `${weeklySummary.totalLateMinutes}m Telat`}
            </div>
            <span className="text-[11px] text-slate-400">
              {periodMode === 'harian' ? `${dailySummary.totalOvertimeMinutes}m Lembur Masak` : 'Akumulasi jam kerja'}
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-xs space-y-1 col-span-2 lg:col-span-1">
            <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider block">
              {periodMode === 'harian' ? 'Beban Upah Hari Ini' : periodMode === 'mingguan' ? 'Total Amprah Pekan Ini' : 'Total Amprah Bulanan'}
            </span>
            <div className="text-xl sm:text-2xl font-black text-blue-900 font-mono">
              {formatRupiah(
                periodMode === 'harian'
                  ? dailySummary.totalEarned
                  : periodMode === 'mingguan'
                  ? weeklySummary.totalEarned
                  : monthlySummary.totalEarned
              )}
            </div>
            <span className="text-[11px] text-slate-500">
              {periodMode === 'harian' ? 'Plafon Rp 5.005.000' : 'Kas Penyalur BNI'}
            </span>
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
        {/* VIEW 1: HARIAN                                                 */}
        {/* ============================================================== */}
        {periodMode === 'harian' && (
          <div className="space-y-4">
            {/* Filter toolbar */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Cari nama relawan..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>

                <select
                  value={filterSection}
                  onChange={(e) => setFilterSection(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer font-medium"
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
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer font-medium"
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
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-lg border border-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Tandai seluruh personel aktif masuk hari ini"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Hadirkan Semua</span>
                </button>

                <button
                  onClick={handleMarkAllPaid}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-[11px] rounded-lg border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Tandai seluruh yang hadir telah dicairkan kas BNI"
                >
                  <DollarSign className="w-3.5 h-3.5 text-blue-700" />
                  <span>Cairkan Semua (BNI)</span>
                </button>

                <button
                  onClick={handleSaveAttendance}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Absensi</span>
                </button>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
              <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
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
                      <th className="p-2.5 w-10 text-center">NO</th>
                      <th className="p-2.5 min-w-[180px]">NAMA LENGKAP</th>
                      <th className="p-2.5 min-w-[130px]">DIVISI</th>
                      <th className="p-2.5 text-center min-w-[130px]">STATUS KEHADIRAN</th>
                      <th className="p-2.5 text-center min-w-[90px]">JAM MASUK</th>
                      <th className="p-2.5 text-center min-w-[90px]">JAM PULANG</th>
                      <th className="p-2.5 text-center min-w-[120px] whitespace-nowrap">TELAT / LEMBUR</th>
                      <th className="p-2.5 text-right min-w-[100px]">UPAH (RP)</th>
                      <th className="p-2.5 text-center min-w-[110px]">PENCAIRAN BNI</th>
                      <th className="p-2.5 min-w-[200px]">CATATAN OPERASIONAL</th>
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
                          <td className="p-2.5 text-center font-mono font-bold text-slate-500">
                            {person.no}
                          </td>
                          <td className="p-2.5">
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
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded-md font-medium text-[11px] bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap inline-block">
                              {person.dutySection}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            <select
                              value={entry.status}
                              disabled={!person.isActive}
                              onChange={(e) => handleUpdateStatus(person.id, e.target.value as AttendanceStatus)}
                              className={`text-xs font-bold rounded-lg px-2 py-1 border cursor-pointer focus:outline-none ${
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
                          <td className="p-2.5 text-center">
                            {isHadir ? (
                              <input
                                type="time"
                                value={entry.checkIn}
                                onChange={(e) => handleUpdateTime(person.id, 'checkIn', e.target.value)}
                                className="bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                              />
                            ) : (
                              <span className="text-slate-400 font-mono">-</span>
                            )}
                          </td>

                          {/* Jam Pulang */}
                          <td className="p-2.5 text-center">
                            {isHadir ? (
                              <input
                                type="time"
                                value={entry.checkOut}
                                onChange={(e) => handleUpdateTime(person.id, 'checkOut', e.target.value)}
                                className="bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                              />
                            ) : (
                              <span className="text-slate-400 font-mono">-</span>
                            )}
                          </td>

                          {/* Telat / Lembur */}
                          <td className="p-2.5 text-center font-mono text-[11px] whitespace-nowrap">
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
                          <td className="p-2.5 text-right font-mono font-bold whitespace-nowrap">
                            {isHadir ? (
                              <span className="text-blue-900">{formatRupiah(entry.earnedAmount)}</span>
                            ) : (
                              <span className="text-slate-400 line-through">
                                {formatRupiah(person.dailyRate)}
                              </span>
                            )}
                          </td>

                          {/* Status Cair */}
                          <td className="p-2.5 text-center whitespace-nowrap">
                            {isHadir ? (
                              <button
                                onClick={() => handleTogglePaid(person.id)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer border ${
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
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={entry.notes}
                              onChange={(e) => handleUpdateNotes(person.id, e.target.value)}
                              placeholder="Catatan tugas..."
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t-2 border-slate-300 font-bold text-slate-900">
                      <td colSpan={7} className="p-3 text-right uppercase text-[11px] text-slate-500">
                        Total Upah Hari Ini ({dailySummary.statusCounts.Hadir} Orang Hadir):
                      </td>
                      <td className="p-3 text-right font-mono text-sm text-blue-900">
                        {formatRupiah(dailySummary.totalEarned)}
                      </td>
                      <td colSpan={2} className="p-3 text-left text-[11px] text-slate-500 font-normal">
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
                    className={`bg-white p-4 rounded-xl border shadow-xs space-y-3 ${
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
                          {person.dutySection} • Shift {person.defaultCheckIn}-{person.defaultCheckOut} • {formatRupiah(person.dailyRate)}
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
                          className={`py-1.5 rounded-lg text-center transition-all cursor-pointer border ${
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
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                              Jam Masuk
                            </label>
                            <input
                              type="time"
                              value={entry.checkIn}
                              onChange={(e) => handleUpdateTime(person.id, 'checkIn', e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono font-bold text-xs"
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
                              className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono font-bold text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                          <span className="font-mono text-xs font-bold text-blue-900">
                            Hak Upah: {formatRupiah(entry.earnedAmount)}
                          </span>
                          <button
                            onClick={() => handleTogglePaid(person.id)}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                );
              })}
            </div>

            {/* Sticky bottom bar */}
            {isDirty && (
              <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 bg-slate-900 text-white p-3.5 rounded-xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3">
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
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveAttendance}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-lg transition-all flex items-center gap-1 cursor-pointer"
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
        {/* VIEW 2: MINGGUAN                                               */}
        {/* ============================================================== */}
        {periodMode === 'mingguan' && (
          <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-900 text-xs block">
                  Matrix Kehadiran Mingguan (Senin s/d Sabtu)
                </span>
                <span className="text-[11px] text-slate-500">
                  Pekan: {weekDays[0].formatted} – {weekDays[weekDays.length - 1].formatted}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
                  H = Hadir
                </span>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded">
                  I = Izin
                </span>
                <span className="px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded">
                  S = Sakit
                </span>
                <span className="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded">
                  A = Alpha
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
                      <th key={d.date} className="p-2 text-center w-12 bg-slate-200/80">
                        <div className="text-[10px] uppercase">{d.label.slice(0, 3)}</div>
                        <div className="text-[9px] font-mono text-slate-500">{d.formatted}</div>
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
                        <td className="p-2.5 text-right font-mono">{formatRupiah(person.dailyRate)}</td>

                        {weekStatuses.map((st, idx) => (
                          <td key={idx} className="p-2 text-center font-mono font-bold">
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
                        ))}

                        <td className="p-2.5 text-center font-mono font-bold text-slate-900">
                          {person.isActive ? `${hadirCount} Hari` : '-'}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-blue-900">
                          {person.isActive ? formatRupiah(totalEarnedWeek) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-300 font-bold text-slate-900">
                    <td colSpan={10} className="p-3 text-right uppercase text-[11px] text-slate-500">
                      Total Amprah Mingguan:
                    </td>
                    <td className="p-3 text-right font-mono text-sm text-blue-900">
                      {formatRupiah(weeklySummary.totalEarned)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: BULANAN                                                */}
        {/* ============================================================== */}
        {periodMode === 'bulanan' && (
          <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-xs block">
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
                        <td className="p-2.5 text-right font-mono">{formatRupiah(person.dailyRate)}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-emerald-700">
                          {person.isActive ? `${hadirCount} Hari` : '-'}
                        </td>
                        <td className="p-2.5 text-center font-mono text-amber-700 font-bold">
                          {person.isActive ? `${izinCount} Hari` : '-'}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-blue-900">
                          {person.isActive ? formatRupiah(totalEarned) : '-'}
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
                    <td colSpan={6} className="p-3 text-right uppercase text-[11px] text-slate-500">
                      Grand Total Upah Bulan {selectedMonth}:
                    </td>
                    <td className="p-3 text-right font-mono text-base text-blue-900">
                      {formatRupiah(monthlySummary.totalEarned)}
                    </td>
                    <td className="p-3 text-center text-[10px] text-slate-500 font-normal">
                      Lolos Audit SPJ BGN
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 4: KELOLA ROSTER                                          */}
        {/* ============================================================== */}
        {periodMode === 'roster' && (
          <div className="bg-white rounded-xl border border-slate-300 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  Master Roster Dapur ({roster.length} Personel)
                </h3>
                <p className="text-xs text-slate-500">
                  Kelola divisi, shift default, dan tarif harian resmi SPPG Wonodri 3.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Personel Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {roster.map((person) => (
                <div
                  key={person.id}
                  className={`p-3.5 rounded-xl border transition-all space-y-2 ${
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
                        {formatRupiah(person.dailyRate)}
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 my-8 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-lg text-slate-900">
                  Pratinjau Lembar SPJ Amprah Upah Relawan (A4)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
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
                  Tanggal: {formatIndoDate(selectedDate)} | Kuota: 1.556 Porsi (13 Titik)
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
                    {currentDayDraft.map((entry) => {
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
                        {formatRupiah(dailySummary.totalEarned)}
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
    </div>
  );
}
