/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  FileText,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  FileSignature,
  Filter,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  Building,
  School,
  Sparkles,
  CalendarDays,
  ListTodo,
  TrendingUp,
  BookmarkCheck,
  Check,
  Info,
  ListOrdered,
  Hash,
  RefreshCw
} from 'lucide-react';
import {
  VisitAgenda,
  VisitType,
  VisitStatus,
  VISIT_TYPE_LABELS,
  Teacher,
  Principal,
  SupervisionRecord,
  AppSettings
} from '../types/inspiro';
import {
  getVisitAgendas,
  saveVisitAgenda,
  deleteVisitAgenda,
  saveVisitAgendas,
  getPrincipals
} from '../utils/storage';
import {
  downloadIcsFile,
  getGoogleCalendarUrl,
  exportVisitAgendasToWord
} from '../utils/calendarExport';
import { printDocumentElement, getVisitAgendaNomorSurat, generateNomorSurat } from '../utils/documentExport';
import { DEFAULT_SIDRAP_LOGO, DEFAULT_TUTWURI_LOGO } from '../data/defaultLogos';
import { SignatoryModal } from './SignatoryModal';

interface SupervisionCalendarViewProps {
  teachers: Teacher[];
  principals?: Principal[];
  supervisions: SupervisionRecord[];
  settings: AppSettings;
  presetManagerialPrincipal?: Principal | null;
  onClearPresetPrincipal?: () => void;
  onStartSupervision: (teacherId?: string) => void;
  onUpdateSettings?: (newSettings: AppSettings) => void;
  showToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

export const SupervisionCalendarView: React.FC<SupervisionCalendarViewProps> = ({
  teachers,
  principals,
  supervisions,
  settings,
  presetManagerialPrincipal,
  onClearPresetPrincipal,
  onStartSupervision,
  onUpdateSettings,
  showToast
}) => {
  // Master agendas state
  const [agendas, setAgendas] = useState<VisitAgenda[]>(() => getVisitAgendas());

  // Principals list
  const principalsList = useMemo(() => {
    return principals && principals.length > 0 ? principals : getPrincipals();
  }, [principals]);

  // UI States
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(2026, 9, 21)); // Default to Oct 2026
  const [activeTab, setActiveTab] = useState<'calendar' | 'timeline' | 'school-matrix'>('calendar');
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-10-21');
  const [filterSchool, setFilterSchool] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [includeRealSupervisions, setIncludeRealSupervisions] = useState<boolean>(true);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingAgenda, setEditingAgenda] = useState<VisitAgenda | null>(null);
  const [isSignatoryModalOpen, setIsSignatoryModalOpen] = useState<boolean>(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState<boolean>(false);
  const [completionAgenda, setCompletionAgenda] = useState<VisitAgenda | null>(null);
  const [completionNotesInput, setCompletionNotesInput] = useState<string>('');

  // Individual Visit Slip modal
  const [selectedVisitSlip, setSelectedVisitSlip] = useState<VisitAgenda | null>(null);

  // Batch Renumber Agendas Modal State
  const [isRenumberAgendasModalOpen, setIsRenumberAgendasModalOpen] = useState<boolean>(false);
  const [renumberAgendaStartNum, setRenumberAgendaStartNum] = useState<number>(settings.nomorSuratAwal ?? 118);

  // Form State for Adding / Editing
  const [formTitle, setFormTitle] = useState<string>('');
  const [formSchool, setFormSchool] = useState<string>('');
  const [formDate, setFormDate] = useState<string>('2026-10-21');
  const [formStartTime, setFormStartTime] = useState<string>('08:00');
  const [formEndTime, setFormEndTime] = useState<string>('12:00');
  const [formVisitType, setFormVisitType] = useState<VisitType>('supervisi_akademik');
  const [formPrincipalId, setFormPrincipalId] = useState<string>('');
  const [formTeacherIds, setFormTeacherIds] = useState<string[]>([]);
  const [formPurpose, setFormPurpose] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formStatus, setFormStatus] = useState<VisitStatus>('terjadwal');
  const [formCompletionNotes, setFormCompletionNotes] = useState<string>('');
  const [formNomorSurat, setFormNomorSurat] = useState<string>('');

  // Print ref
  const printAreaRef = useRef<HTMLDivElement>(null);
  const visitSlipPrintRef = useRef<HTMLDivElement>(null);

  // Keep agendas updated
  useEffect(() => {
    setAgendas(getVisitAgendas());
  }, []);

  // Auto-open modal if presetManagerialPrincipal is given
  useEffect(() => {
    if (presetManagerialPrincipal) {
      setEditingAgenda(null);
      setFormTitle(`Supervisi Manajerial: Audit 8 SNP & PBD (${presetManagerialPrincipal.satuanPendidikan})`);
      setFormSchool(presetManagerialPrincipal.satuanPendidikan);
      setFormDate('2026-10-24');
      setFormStartTime('08:30');
      setFormEndTime('12:00');
      setFormVisitType('supervisi_manajerial');
      setFormPrincipalId(presetManagerialPrincipal.id);
      setFormTeacherIds([]);
      setFormPurpose(`Supervisi manajerial kepemimpinan kepala sekolah: ${presetManagerialPrincipal.fokusManajerial || 'Evaluasi 8 SNP & Perencanaan Berbasis Data (PBD)'}.`);
      setFormNotes('Instrumen pemantauan 8 Standar Nasional Pendidikan dan evaluasi RKAS.');
      setFormStatus('terjadwal');
      setFormCompletionNotes('');
      setIsFormModalOpen(true);
      onClearPresetPrincipal?.();
    }
  }, [presetManagerialPrincipal, onClearPresetPrincipal]);

  // Distinct schools
  const distinctSchools = useMemo(() => {
    const set = new Set<string>();
    if (settings.schoolName) set.add(settings.schoolName);
    teachers.forEach((t) => t.satuanPendidikan && set.add(t.satuanPendidikan));
    principalsList.forEach((p) => p.satuanPendidikan && set.add(p.satuanPendidikan));
    supervisions.forEach((s) => s.identity?.satuanPendidikan && set.add(s.identity.satuanPendidikan));
    agendas.forEach((a) => a.schoolName && set.add(a.schoolName));
    return Array.from(set).filter(Boolean);
  }, [settings.schoolName, teachers, principalsList, supervisions, agendas]);

  // Merge real completed supervisions as calendar entries if requested
  const allMergedAgendas = useMemo(() => {
    const list = [...agendas];

    if (includeRealSupervisions) {
      supervisions.forEach((s) => {
        // extract date e.g. "2026-10-04" from s.createdAt or s.identity.hariTanggal
        let datePart = s.createdAt?.slice(0, 10);
        if (!datePart || !datePart.startsWith('2026')) {
          datePart = '2026-10-04';
        }

        // Avoid duplicate if an agenda already explicitly targets this supervision
        const alreadyExists = list.some(
          (a) => a.date === datePart && a.targetTeacherIds?.includes(s.teacherId)
        );

        if (!alreadyExists) {
          const teacher = teachers.find((t) => t.id === s.teacherId);
          list.push({
            id: `sup-auto-${s.id}`,
            title: `Observasi Kelas: ${s.identity?.mapel || 'Kurikulum Merdeka'} (${s.identity?.siklus || 'Siklus I'})`,
            schoolName: s.identity?.satuanPendidikan || settings.schoolName || 'Satuan Pendidikan',
            date: datePart,
            startTime: s.identity?.jamPelajaran ? s.identity.jamPelajaran.slice(0, 5) : '07:30',
            endTime: '11:45',
            visitType: 'supervisi_akademik',
            targetTeacherIds: [s.teacherId],
            targetTeacherNames: [s.identity?.namaGuru || teacher?.nama || 'Guru Sasaran'],
            purposeAndTargets: `Pelaksanaan observasi kelas 12 indikator. Materi: ${s.identity?.materiPokok || 'Pembelajaran Tematik'}. Skor Capaian: ${s.finalScore} (${s.category}).`,
            notes: `Fokus Perilaku: ${s.identity?.fokusPerilaku || 'Diferensiasi proses & disiplin positif'}.`,
            status: s.status === 'selesai' ? 'selesai' : 'terjadwal',
            completionNotes: `Supervisi tuntas dengan skor ${s.finalScore} (${s.category}). Rekomendasi: ${((s.rtl && s.rtl[0]?.rencanaKegiatan) || s.refleksi?.rencanaPeningkatan || 'Penguatan refleksi mandiri.').slice(0, 120)}...`,
            supervisorName: s.identity?.namaSupervisor || settings.supervisorName,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt || s.createdAt
          });
        }
      });
    }

    // Sort chronologically
    return list.sort((a, b) => {
      const cmp = a.date.localeCompare(b.date);
      if (cmp !== 0) return cmp;
      return (a.startTime || '').localeCompare(b.startTime || '');
    });
  }, [agendas, supervisions, includeRealSupervisions, teachers, settings.schoolName, settings.supervisorName]);

  // Filtered agendas
  const filteredAgendas = useMemo(() => {
    return allMergedAgendas.filter((a) => {
      if (filterSchool !== 'all' && a.schoolName.toLowerCase() !== filterSchool.toLowerCase()) {
        return false;
      }
      if (filterType !== 'all' && a.visitType !== filterType) {
        return false;
      }
      if (filterStatus !== 'all' && a.status !== filterStatus) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const inTitle = a.title.toLowerCase().includes(q);
        const inSchool = a.schoolName.toLowerCase().includes(q);
        const inPurpose = a.purposeAndTargets.toLowerCase().includes(q);
        const inTeachers = a.targetTeacherNames?.some((n) => n.toLowerCase().includes(q));
        if (!inTitle && !inSchool && !inPurpose && !inTeachers) return false;
      }
      return true;
    });
  }, [allMergedAgendas, filterSchool, filterType, filterStatus, searchTerm]);

  // Current Month Details
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const currentMonthLabel = `${monthNames[month]} ${year}`;

  // Month Calendar Days Generator
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Day of week: 0 (Sun) to 6 (Sat). We want Monday as first day: 0 (Mon) to 6 (Sun).
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      agendas: VisitAgenda[];
    }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dateStr = prevDate.toISOString().slice(0, 10);
      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: false,
        agendas: []
      });
    }

    // Current month days
    const todayStr = '2026-10-21'; // matching current system date
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayAgendas = filteredAgendas.filter((a) => a.date === dateStr);
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        agendas: dayAgendas
      });
    }

    // Next month padding to fill complete grid of 35 or 42
    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      const dateStr = nextDate.toISOString().slice(0, 10);
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: false,
        agendas: []
      });
    }

    return days;
  }, [year, month, filteredAgendas]);

  // Statistics & KPI
  const stats = useMemo(() => {
    const total = filteredAgendas.length;
    const completed = filteredAgendas.filter((a) => a.status === 'selesai').length;
    const ongoing = filteredAgendas.filter((a) => a.status === 'berlangsung').length;
    const scheduled = filteredAgendas.filter((a) => a.status === 'terjadwal').length;
    const postponed = filteredAgendas.filter((a) => a.status === 'ditunda').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const uniqueVisitedSchools = new Set(filteredAgendas.map((a) => a.schoolName)).size;

    // Upcoming nearest agenda
    const todayStr = '2026-10-21';
    const futureAgendas = filteredAgendas.filter((a) => a.date >= todayStr && a.status !== 'selesai');
    const nearest = futureAgendas[0] || null;

    return {
      total,
      completed,
      ongoing,
      scheduled,
      postponed,
      completionRate,
      uniqueVisitedSchools,
      nearest
    };
  }, [filteredAgendas]);

  // Agendas for selected date in calendar
  const selectedDateAgendas = useMemo(() => {
    return filteredAgendas.filter((a) => a.date === selectedDateStr);
  }, [filteredAgendas, selectedDateStr]);

  // Handle open add modal
  const handleOpenAddModal = (presetDate?: string) => {
    setEditingAgenda(null);
    setFormTitle('');
    setFormSchool(settings.schoolName || distinctSchools[0] || 'SMP Negeri 1 Merdeka Nusantara');
    const targetDate = presetDate || selectedDateStr || '2026-10-21';
    setFormDate(targetDate);
    setFormStartTime('08:00');
    setFormEndTime('12:00');
    setFormVisitType('supervisi_akademik');
    setFormPrincipalId('');
    setFormTeacherIds([]);
    setFormPurpose('Observasi pelaksanaan pembelajaran Kurikulum Merdeka dan bimbingan klinis.');
    setFormNotes('Membawa instrumen 12 indikator dan lembar rubrik observasi.');
    setFormStatus('terjadwal');
    setFormCompletionNotes('');
    const nextNo = getVisitAgendaNomorSurat({ date: targetDate } as VisitAgenda, agendas.length, settings);
    setFormNomorSurat(nextNo);
    setIsFormModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEditModal = (agenda: VisitAgenda) => {
    setEditingAgenda(agenda);
    setFormTitle(agenda.title);
    setFormSchool(agenda.schoolName);
    setFormDate(agenda.date);
    setFormStartTime(agenda.startTime || '08:00');
    setFormEndTime(agenda.endTime || '12:00');
    setFormVisitType(agenda.visitType);
    setFormPrincipalId(agenda.targetPrincipalId || '');
    setFormTeacherIds(agenda.targetTeacherIds || []);
    setFormPurpose(agenda.purposeAndTargets);
    setFormNotes(agenda.notes || '');
    setFormStatus(agenda.status);
    setFormCompletionNotes(agenda.completionNotes || '');
    const aIndex = agendas.findIndex((a) => a.id === agenda.id);
    setFormNomorSurat(agenda.nomorSurat || getVisitAgendaNomorSurat(agenda, aIndex >= 0 ? aIndex : 0, settings));
    setIsFormModalOpen(true);
  };

  const handleBatchRenumberAgendas = (startNum: number) => {
    const updated = agendas.map((a, idx) => {
      const generated = `800.1 / ${startNum + idx} / ${settings.nomorSuratKode || 'DISDIKBUD / PS'} / ${new Date(a.date).getFullYear()}`;
      return { ...a, nomorSurat: generated, updatedAt: new Date().toISOString() };
    });
    saveVisitAgendas(updated);
    setAgendas(updated);
    showToast(
      'Nomor Berita Acara Diurutkan',
      `Seluruh ${agendas.length} agenda kunjungan berhasil diberi nomor surat berurutan mulai nomor ${startNum}.`,
      'success'
    );
    setIsRenumberAgendasModalOpen(false);
  };

  // Save agenda form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSchool.trim() || !formDate) {
      showToast('Form Belum Lengkap', 'Judul, sekolah, dan tanggal wajib diisi.', 'error');
      return;
    }

    // Resolve teacher names
    const teacherNames = formTeacherIds
      .map((id) => teachers.find((t) => t.id === id)?.nama)
      .filter((n): n is string => Boolean(n));

    // Resolve principal if selected
    let targetPrincipalName: string | undefined = undefined;
    let targetPrincipalNip: string | undefined = undefined;
    if (formPrincipalId) {
      const p = principalsList.find((pr) => pr.id === formPrincipalId);
      if (p) {
        targetPrincipalName = p.nama;
        targetPrincipalNip = p.nip;
      }
    }

    const now = new Date().toISOString();
    const agendaToSave: VisitAgenda = {
      id: editingAgenda ? editingAgenda.id : `va-${Date.now().toString().slice(-6)}`,
      title: formTitle.trim(),
      schoolName: formSchool.trim(),
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
      visitType: formVisitType,
      targetPrincipalId: formPrincipalId || undefined,
      targetPrincipalName: targetPrincipalName || undefined,
      targetPrincipalNip: targetPrincipalNip || undefined,
      targetTeacherIds: formTeacherIds,
      targetTeacherNames: teacherNames,
      purposeAndTargets: formPurpose.trim(),
      notes: formNotes.trim(),
      status: formStatus,
      nomorSurat: formNomorSurat.trim() || undefined,
      completionNotes: formStatus === 'selesai' ? formCompletionNotes.trim() : undefined,
      supervisorName: settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
      createdAt: editingAgenda ? editingAgenda.createdAt : now,
      updatedAt: now
    };

    saveVisitAgenda(agendaToSave);
    setAgendas(getVisitAgendas());
    setIsFormModalOpen(false);
    showToast(
      editingAgenda ? 'Agenda Diperbarui' : 'Agenda Dijadwalkan',
      `Kunjungan ke ${agendaToSave.schoolName} berhasil disimpan.`,
      'success'
    );
  };

  // Delete agenda
  const handleDeleteAgenda = (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus agenda "${title}"?`)) {
      deleteVisitAgenda(id);
      setAgendas(getVisitAgendas());
      showToast('Agenda Dihapus', 'Agenda kunjungan telah dihapus dari sistem.', 'info');
    }
  };

  // Quick mark complete
  const handleOpenCompletionModal = (agenda: VisitAgenda) => {
    setCompletionAgenda(agenda);
    setCompletionNotesInput(agenda.completionNotes || '');
    setIsCompletionModalOpen(true);
  };

  const handleSaveCompletion = () => {
    if (!completionAgenda) return;
    const updated: VisitAgenda = {
      ...completionAgenda,
      status: 'selesai',
      completionNotes: completionNotesInput.trim() || 'Kunjungan dan supervisi terlaksana sesuai target perencanaan.',
      signedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveVisitAgenda(updated);
    setAgendas(getVisitAgendas());
    setIsCompletionModalOpen(false);
    showToast('Kunjungan Selesai', `Status agenda "${updated.title}" ditandai selesai.`, 'success');
  };

  // Print schedule
  const handlePrintSchedule = () => {
    printDocumentElement(
      'calendar-schedule-print-area',
      `Jadwal_Kunjungan_Supervisi_${currentMonthLabel.replace(/\s+/g, '_')}`,
      { orientation: 'landscape' }
    );
  };

  // Print visit slip
  const handlePrintVisitSlip = (agenda: VisitAgenda) => {
    const aIndex = agendas.findIndex((a) => a.id === agenda.id);
    const effectiveNo = agenda.nomorSurat || getVisitAgendaNomorSurat(agenda, aIndex >= 0 ? aIndex : 0, settings);
    setSelectedVisitSlip({ ...agenda, nomorSurat: effectiveNo });
    setTimeout(() => {
      printDocumentElement(
        'visit-slip-print-area',
        `Berita_Acara_Kunjungan_${agenda.schoolName.replace(/[/\\?%*:|"<> ]/g, '_')}_${agenda.date}`,
        { orientation: 'portrait' }
      );
    }, 150);
  };

  // Navigation Month handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const handleToday = () => {
    setCurrentDate(new Date(2026, 9, 21));
    setSelectedDateStr('2026-10-21');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner with Executive & Flexible Styling */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#081533] via-[#0d204a] to-[#12285a] rounded-2xl p-5 sm:p-7 text-white shadow-xl border border-blue-400/25">
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5 pb-6 border-b border-white/10">
          {/* Row 1: Contextual Identity & Academic Term Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-cyan-300 font-medium">
              <span className="font-semibold text-white">Pengawas Pembina:</span>
              <span className="text-cyan-200 font-bold">{settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'}</span>
              <span aria-hidden="true" className="text-white/30 hidden sm:inline">·</span>
              <span className="text-blue-200 font-mono tabular-nums">NIP: {settings.supervisorNip || '19830819 201001 1 002'}</span>
              <span aria-hidden="true" className="text-white/30 hidden sm:inline">·</span>
              <span className="text-indigo-200">Semester Ganjil 2026/2027</span>
            </div>
            <div className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/8 border border-white/10 text-cyan-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Agenda Pengawasan &amp; Kunjungan Terpadu
            </div>
          </div>

          {/* Row 2: Title & Primary CTA - Fluid & Balanced */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 shrink-0 shadow-xs">
                  <CalendarDays className="w-6 h-6 sm:w-7 h-7" />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  Kalender Supervisi &amp; Agenda Kunjungan Sekolah
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed max-w-4xl">
                Instrumen koordinasi dinas terintegrasi: jadwal observasi kelas, bimbingan klinis, pendampingan
                Komunitas Belajar (Kombel), telaah KOSP, hingga sinkronisasi Google Calendar dan cetak berita acara resmi.
              </p>
            </div>

            {/* Prominent Primary Action Button */}
            <div className="shrink-0 flex items-center">
              <button
                onClick={() => handleOpenAddModal(selectedDateStr)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 hover:from-cyan-300 hover:to-blue-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
              >
                <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
                <span>Tambah Agenda Kunjungan</span>
              </button>
            </div>
          </div>

          {/* Row 3: Action Toolbar for Document Exports & Configurations */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-blue-200/80 mr-1 hidden sm:inline">Aksi Dokumen:</span>

            <button
              onClick={handlePrintSchedule}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl transition-all border border-white/15 backdrop-blur-xs cursor-pointer hover:border-white/30 hover:text-cyan-200 whitespace-nowrap"
              title="Cetak Jadwal Kunjungan Resmi ke PDF"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-300" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              onClick={() => exportVisitAgendasToWord(filteredAgendas, settings, currentMonthLabel)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl transition-all border border-white/15 backdrop-blur-xs cursor-pointer hover:border-white/30 hover:text-blue-200 whitespace-nowrap"
              title="Unduh Tabel Agenda ke Dokumen Word"
            >
              <Download className="w-3.5 h-3.5 text-blue-300" />
              <span>Unduh Word (.doc)</span>
            </button>

            <button
              onClick={() => downloadIcsFile(filteredAgendas, `Agenda_Supervisi_${currentMonthLabel.replace(/\s+/g, '_')}`, settings.supervisorName || 'Pengawas')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl transition-all border border-white/15 backdrop-blur-xs cursor-pointer hover:border-white/30 hover:text-emerald-200 whitespace-nowrap"
              title="Ekspor format iCalendar (.ics) untuk Google Calendar / HP"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-300" />
              <span>Ekspor iCal (.ics)</span>
            </button>

            <button
              onClick={() => {
                setRenumberAgendaStartNum(settings.nomorSuratAwal ?? 118);
                setIsRenumberAgendasModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 font-semibold text-xs rounded-xl transition-all border border-indigo-400/30 cursor-pointer hover:border-indigo-400/50 whitespace-nowrap"
              title="Urutkan nomor berita acara kunjungan secara otomatis & berurutan"
            >
              <ListOrdered className="w-3.5 h-3.5 text-indigo-300" />
              <span>Urutkan Nomor Surat</span>
            </button>

            <button
              onClick={() => setIsSignatoryModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold text-xs rounded-xl transition-all border border-amber-400/30 cursor-pointer hover:border-amber-400/50 whitespace-nowrap"
              title="Atur data penandatangan resmi"
            >
              <FileSignature className="w-3.5 h-3.5 text-amber-300" />
              <span>Atur Penandatangan</span>
            </button>
          </div>
        </div>

        {/* Live Pulse KPI Stats */}
        <div className="relative z-10 pt-5 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 rounded-xl bg-white/6 border border-white/10 backdrop-blur-xs">
            <span className="text-[11px] font-medium text-blue-200">Total Kunjungan</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-white tabular-nums">{stats.total}</span>
              <span className="text-[11px] text-cyan-300 font-medium">agenda</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/6 border border-white/10 backdrop-blur-xs">
            <span className="text-[11px] font-medium text-emerald-200">Realisasi Selesai</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-emerald-300 tabular-nums">{stats.completed}</span>
              <span className="text-[11px] text-emerald-200/80 font-medium tabular-nums">({stats.completionRate}%)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/6 border border-white/10 backdrop-blur-xs">
            <span className="text-[11px] font-medium text-amber-200">Agenda Terdekat</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xs sm:text-sm font-bold text-amber-300 truncate">
                {stats.nearest ? `${stats.nearest.date === '2026-10-21' ? 'Hari Ini' : stats.nearest.date} · ${stats.nearest.schoolName}` : 'Semua Tuntas'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/6 border border-white/10 backdrop-blur-xs">
            <span className="text-[11px] font-medium text-indigo-200">Sekolah Binaan</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-indigo-300 tabular-nums">{stats.uniqueVisitedSchools}</span>
              <span className="text-[11px] text-indigo-200/80 font-medium">satuan</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Control & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Kalender Bulanan</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Agenda &amp; Jadwal Kunjungan ({filteredAgendas.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('school-matrix')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'school-matrix'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Matriks Sekolah Binaan</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* School filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Sekolah:</span>
            <select
              value={filterSchool}
              onChange={(e) => setFilterSchool(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="all">Semua Sekolah Binaan</option>
              {distinctSchools.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Jenis:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="all">Semua Jenis Kunjungan</option>
              {Object.entries(VISIT_TYPE_LABELS).map(([key, val]) => (
                <option key={key} value={key}>{val.shortLabel}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="terjadwal">Terjadwal</option>
              <option value="berlangsung">Berlangsung</option>
              <option value="selesai">Selesai Dilaksanakan</option>
              <option value="ditunda">Dijadwalkan Ulang</option>
            </select>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari agenda / guru..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white w-36 sm:w-44"
            />
          </div>
        </div>
      </div>

      {/* 3. Main Views */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Calendar Grid (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            {/* Calendar Month Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-900">{currentMonthLabel}</h3>
                <button
                  onClick={handleToday}
                  className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                >
                  Hari Ini (21 Okt 2026)
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="Bulan Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="Bulan Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100/60 text-center text-[11px] font-bold text-slate-600 py-2">
              <span>SENIN</span>
              <span>SELASA</span>
              <span>RABU</span>
              <span>KAMIS</span>
              <span>JUMAT</span>
              <span className="text-rose-600">SABTU</span>
              <span className="text-rose-600">MINGGU</span>
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 auto-rows-fr bg-slate-200 gap-px flex-1">
              {calendarDays.map((cell, idx) => {
                const isSelected = cell.dateStr === selectedDateStr;
                return (
                  <div
                    key={`${cell.dateStr}-${idx}`}
                    onClick={() => {
                      if (cell.isCurrentMonth) {
                        setSelectedDateStr(cell.dateStr);
                      }
                    }}
                    className={`min-h-[105px] p-2 flex flex-col justify-between transition-colors relative cursor-pointer ${
                      cell.isCurrentMonth ? 'bg-white hover:bg-blue-50/40' : 'bg-slate-50/80 text-slate-400'
                    } ${isSelected ? 'ring-2 ring-blue-600 ring-inset bg-blue-50/30' : ''}`}
                  >
                    {/* Date Number & Today badge */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                          cell.isToday
                            ? 'bg-blue-600 text-white'
                            : isSelected
                            ? 'text-blue-700 font-extrabold'
                            : cell.isCurrentMonth
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      {cell.agendas.length > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {cell.agendas.length}
                        </span>
                      )}
                    </div>

                    {/* Events inside this day */}
                    <div className="space-y-1 mt-1 overflow-y-auto max-h-[68px]">
                      {cell.agendas.slice(0, 2).map((a) => {
                        const typeCfg = VISIT_TYPE_LABELS[a.visitType] || VISIT_TYPE_LABELS.supervisi_akademik;
                        const isDone = a.status === 'selesai';
                        return (
                          <div
                            key={a.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDateStr(cell.dateStr);
                              handleOpenEditModal(a);
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium border truncate transition-transform hover:scale-[1.02] ${
                              isDone
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : a.status === 'berlangsung'
                                ? 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-400'
                                : `${typeCfg.bg} ${typeCfg.color} ${typeCfg.border}`
                            }`}
                            title={`${a.title} - ${a.schoolName}`}
                          >
                            <span className="font-bold">{a.startTime || '08:00'}</span> {a.title}
                          </div>
                        );
                      })}
                      {cell.agendas.length > 2 && (
                        <div className="text-[10px] text-blue-600 font-semibold pl-1">
                          +{cell.agendas.length - 2} kegiatan lagi
                        </div>
                      )}
                    </div>

                    {/* Quick add hover trigger */}
                    {cell.isCurrentMonth && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDateStr(cell.dateStr);
                          handleOpenAddModal(cell.dateStr);
                        }}
                        className="opacity-0 hover:opacity-100 focus:opacity-100 absolute bottom-1 right-1 p-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-xs transition-opacity"
                        title="Tambah kegiatan pada tanggal ini"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Legend */}
            <div className="p-3 border-t border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold text-slate-700">Legenda:</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> Supervisi Akademik
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" /> Praktik PM
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Kombel &amp; PBD
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" /> Verval KOSP
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" /> Refleksi Klinis
                </span>
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 text-xs">
                <input
                  type="checkbox"
                  checked={includeRealSupervisions}
                  onChange={(e) => setIncludeRealSupervisions(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>Sertakan Riwayat Supervisi Nyata Otomatis</span>
              </label>
            </div>
          </div>

          {/* Day Detail Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                    Detail Kegiatan Tanggal
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900 mt-0.5">
                    {new Date(selectedDateStr).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </h4>
                </div>

                <button
                  onClick={() => handleOpenAddModal(selectedDateStr)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </div>

              {selectedDateAgendas.length === 0 ? (
                <div className="py-10 text-center">
                  <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Tidak ada agenda pada tanggal ini</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Klik tombol Tambah di atas untuk menjadwalkan kunjungan supervisi atau pendampingan sekolah.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                  {selectedDateAgendas.map((agenda) => {
                    const typeCfg = VISIT_TYPE_LABELS[agenda.visitType] || VISIT_TYPE_LABELS.supervisi_akademik;
                    const isDone = agenda.status === 'selesai';
                    const hasTeacherTarget = agenda.targetTeacherIds && agenda.targetTeacherIds.length > 0;
                    const firstTeacherId = hasTeacherTarget ? agenda.targetTeacherIds![0] : undefined;

                    return (
                      <div
                        key={agenda.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${typeCfg.bg} ${typeCfg.color}`}>
                              {typeCfg.shortLabel}
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-1">{agenda.title}</h5>
                          </div>

                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              isDone
                                ? 'bg-emerald-100 text-emerald-800'
                                : agenda.status === 'berlangsung'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {isDone ? 'Selesai' : agenda.status === 'berlangsung' ? 'Berlangsung' : 'Terjadwal'}
                          </span>
                        </div>

                        <div className="text-xs space-y-1 text-slate-600">
                          <div className="flex items-center gap-1.5 font-medium text-slate-800">
                            <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{agenda.schoolName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{agenda.startTime || '08:00'} - {agenda.endTime || '12:00'} WIB</span>
                          </div>
                          {agenda.targetPrincipalName && (
                            <div className="flex items-center gap-1.5 text-indigo-700 font-bold bg-indigo-50/80 px-2 py-1 rounded-md border border-indigo-200/60">
                              <School className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span>Kepala Sekolah: {agenda.targetPrincipalName}</span>
                            </div>
                          )}
                          {agenda.targetTeacherNames && agenda.targetTeacherNames.length > 0 && (
                            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                              <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span>Guru: {agenda.targetTeacherNames.join(', ')}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-100/90 px-2 py-0.5 rounded border border-slate-200 w-fit">
                            <Hash className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>No: {agenda.nomorSurat || getVisitAgendaNomorSurat(agenda, 0, settings)}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <strong>Sasaran:</strong> {agenda.purposeAndTargets}
                        </p>

                        {/* Completion note if done */}
                        {isDone && agenda.completionNotes && (
                          <div className="text-xs text-emerald-900 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                            <strong>Catatan Hasil:</strong> {agenda.completionNotes}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                          {agenda.visitType === 'supervisi_akademik' && !isDone && (
                            <button
                              onClick={() => onStartSupervision(firstTeacherId)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                              title="Buka form observasi supervisi kelas langsung"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span>Mulai Observasi</span>
                            </button>
                          )}

                          {!isDone ? (
                            <button
                              onClick={() => handleOpenCompletionModal(agenda)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                              title="Tandai telah dilaksanakan & isi notula"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Tandai Selesai</span>
                            </button>
                          ) : null}

                          <button
                            onClick={() => handlePrintVisitSlip(agenda)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Cetak Berita Acara / Surat Kunjungan"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <a
                            href={getGoogleCalendarUrl(agenda, settings.supervisorName || 'Pengawas')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Buka di Google Calendar"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <button
                            onClick={() => handleOpenEditModal(agenda)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit agenda"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteAgenda(agenda.id, agenda.title)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus agenda"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Timeline View */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Kronologi Agenda &amp; Jadwal Kunjungan Supervisi</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar terstruktur seluruh rencana dan riwayat penugasan pengawas sekolah binaan
              </p>
            </div>
            <button
              onClick={() => handleOpenAddModal('2026-10-21')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Agenda Baru</span>
            </button>
          </div>

          <div className="space-y-4">
            {filteredAgendas.map((agenda, index) => {
              const typeCfg = VISIT_TYPE_LABELS[agenda.visitType] || VISIT_TYPE_LABELS.supervisi_akademik;
              const isDone = agenda.status === 'selesai';
              const isToday = agenda.date === '2026-10-21';
              const firstTeacherId = agenda.targetTeacherIds && agenda.targetTeacherIds.length > 0 ? agenda.targetTeacherIds[0] : undefined;

              return (
                <div
                  key={agenda.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${
                    isToday
                      ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-300/60'
                      : isDone
                      ? 'bg-white border-slate-200'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {/* Left: Date Badge & Details */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 sm:w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                        isToday
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : isDone
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase">
                        {new Date(agenda.date).toLocaleDateString('id-ID', { month: 'short' })}
                      </span>
                      <span className="text-xl font-black leading-none">
                        {new Date(agenda.date).getDate()}
                      </span>
                      <span className="text-[9px] font-medium mt-0.5">
                        {isToday ? 'Hari Ini' : new Date(agenda.date).toLocaleDateString('id-ID', { weekday: 'short' })}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${typeCfg.bg} ${typeCfg.color}`}>
                          {typeCfg.label}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : agenda.status === 'berlangsung'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {isDone ? 'Terlaksana' : agenda.status === 'berlangsung' ? 'Sedang Berlangsung' : 'Terjadwal'}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          <Hash className="w-3 h-3 text-slate-400" />
                          <span>No: {agenda.nomorSurat || getVisitAgendaNomorSurat(agenda, index, settings)}</span>
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900">{agenda.title}</h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <Building className="w-3.5 h-3.5 text-blue-600" />
                          {agenda.schoolName}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          {agenda.startTime || '08:00'} - {agenda.endTime || '12:00'} WIB
                        </span>
                        {agenda.targetPrincipalName && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1 text-indigo-700 font-bold bg-indigo-50/80 px-2 py-0.5 rounded-md border border-indigo-200/60">
                              <School className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Kepala Sekolah: {agenda.targetPrincipalName}</span>
                            </span>
                          </>
                        )}
                        {agenda.targetTeacherNames && agenda.targetTeacherNames.length > 0 && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1 text-indigo-700 font-medium">
                              <Users className="w-3.5 h-3.5" />
                              {agenda.targetTeacherNames.join(', ')}
                            </span>
                          </>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                        {agenda.purposeAndTargets}
                      </p>

                      {isDone && agenda.completionNotes && (
                        <div className="mt-2 text-xs bg-emerald-50 text-emerald-900 p-2.5 rounded-lg border border-emerald-200">
                          <strong>Notula Hasil Kunjungan:</strong> {agenda.completionNotes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {agenda.visitType === 'supervisi_akademik' && !isDone && (
                      <button
                        onClick={() => onStartSupervision(firstTeacherId)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Mulai Observasi</span>
                      </button>
                    )}

                    {!isDone ? (
                      <button
                        onClick={() => handleOpenCompletionModal(agenda)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tandai Selesai</span>
                      </button>
                    ) : null}

                    <button
                      onClick={() => handlePrintVisitSlip(agenda)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      title="Cetak Berita Acara / Surat Kunjungan"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Berita Acara</span>
                    </button>

                    <a
                      href={getGoogleCalendarUrl(agenda, settings.supervisorName || 'Pengawas')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                      title="Buka di Google Calendar"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => handleOpenEditModal(agenda)}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                      title="Edit agenda"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteAgenda(agenda.id, agenda.title)}
                      className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Hapus agenda"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* School Matrix View */}
      {activeTab === 'school-matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Distribusi Frekuensi Kunjungan Antar-Sekolah Binaan</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pemantauan intensitas pendampingan pengawas per satuan pendidikan selama Semester Ganjil 2026/2027
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {distinctSchools.map((school) => {
              const schoolAgendas = allMergedAgendas.filter(
                (a) => a.schoolName.toLowerCase() === school.toLowerCase()
              );
              const doneCount = schoolAgendas.filter((a) => a.status === 'selesai').length;
              const scheduledCount = schoolAgendas.filter((a) => a.status === 'terjadwal' || a.status === 'berlangsung').length;
              const schoolTeachers = teachers.filter(
                (t) => t.satuanPendidikan?.toLowerCase() === school.toLowerCase()
              );

              return (
                <div
                  key={school}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                        <Building className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {schoolAgendas.length} Total Kunjungan
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900 leading-snug">{school}</h4>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                      <div className="bg-emerald-50 text-emerald-900 p-2 rounded-lg border border-emerald-200">
                        <span className="text-[10px] uppercase font-bold text-emerald-700">Terlaksana</span>
                        <p className="text-lg font-black">{doneCount} Sesi</p>
                      </div>
                      <div className="bg-blue-50 text-blue-900 p-2 rounded-lg border border-blue-200">
                        <span className="text-[10px] uppercase font-bold text-blue-700">Mendatang</span>
                        <p className="text-lg font-black">{scheduledCount} Jadwal</p>
                      </div>
                    </div>

                    <div className="pt-2 text-xs text-slate-600">
                      <p className="font-semibold text-slate-700">Guru Terdata di Sekolah Ini:</p>
                      <p className="text-slate-500 mt-0.5">
                        {schoolTeachers.length > 0
                          ? schoolTeachers.map((t) => t.nama).join(', ')
                          : 'Belum ada guru terdaftar spesifik'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setFilterSchool(school);
                        setActiveTab('timeline');
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                    >
                      Lihat Semua Agenda Sekolah Ini →
                    </button>
                    <button
                      onClick={() => {
                        setFormSchool(school);
                        handleOpenAddModal('2026-10-21');
                      }}
                      className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
                    >
                      + Jadwal Kunjungan
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. FORM MODAL: TAMBAH / EDIT AGENDA */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 my-8 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CalendarIcon className="w-5 h-5 text-cyan-300" />
                <h3 className="text-base font-bold">
                  {editingAgenda ? 'Edit Agenda Kunjungan Supervisi' : 'Jadwalkan Kunjungan Supervisi Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Agenda / Keperluan Kunjungan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Supervisi Siklus 1: Pembelajaran Berdiferensiasi"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* School selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Satuan Pendidikan Sasaran <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-1.5">
                  <select
                    value={distinctSchools.includes(formSchool) ? formSchool : '__custom__'}
                    onChange={(e) => {
                      if (e.target.value !== '__custom__') setFormSchool(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    {distinctSchools.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                    <option value="__custom__">+ Input Nama Sekolah Lainnya...</option>
                  </select>
                  {(!distinctSchools.includes(formSchool) || formSchool === '') && (
                    <input
                      type="text"
                      placeholder="Ketik nama sekolah binaan..."
                      value={formSchool}
                      onChange={(e) => setFormSchool(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-blue-400 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Waktu Mulai</label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Waktu Selesai</label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Visit Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jenis Kunjungan / Fokus Kegiatan
                </label>
                <select
                  value={formVisitType}
                  onChange={(e) => {
                    const newType = e.target.value as VisitType;
                    setFormVisitType(newType);
                    if (newType === 'supervisi_manajerial' && !formPrincipalId && principalsList.length > 0) {
                      const matching = principalsList.find((p) => p.satuanPendidikan === formSchool) || principalsList[0];
                      if (matching) {
                        setFormPrincipalId(matching.id);
                        setFormSchool(matching.satuanPendidikan);
                        if (!formTitle || formTitle === '') {
                          setFormTitle(`Supervisi Manajerial: Audit 8 SNP & PBD (${matching.satuanPendidikan})`);
                        }
                        if (!formPurpose || formPurpose === '') {
                          setFormPurpose(`Supervisi manajerial kepemimpinan kepala sekolah: ${matching.fokusManajerial || 'Evaluasi 8 SNP & Perencanaan Berbasis Data (PBD)'}.`);
                        }
                      }
                    }
                  }}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  {Object.entries(VISIT_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              {/* Dedicated Kepala Sekolah Selection if Supervisi Manajerial */}
              {formVisitType === 'supervisi_manajerial' && (
                <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <School className="w-4 h-4 text-indigo-600" />
                      <span>Kepala Sekolah Sasaran Supervisi Manajerial</span>
                    </label>
                    <span className="text-[10px] bg-indigo-200/80 text-indigo-900 font-bold px-2 py-0.5 rounded-full">
                      Manajerial &amp; 8 SNP
                    </span>
                  </div>

                  <select
                    value={formPrincipalId}
                    onChange={(e) => {
                      const pid = e.target.value;
                      setFormPrincipalId(pid);
                      const found = principalsList.find((pr) => pr.id === pid);
                      if (found) {
                        setFormSchool(found.satuanPendidikan);
                        setFormTitle(`Supervisi Manajerial: Audit 8 SNP & PBD (${found.satuanPendidikan})`);
                        setFormPurpose(`Supervisi manajerial kepemimpinan kepala sekolah: ${found.fokusManajerial || 'Evaluasi 8 SNP & Perencanaan Berbasis Data (PBD)'}.`);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-indigo-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Pilih Kepala Sekolah Binaan --</option>
                    {principalsList.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.nama} ({pr.satuanPendidikan})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-indigo-700/80">
                    Pilih kepala sekolah untuk mengaitkan evaluasi manajerial, audit RKAS, dan pemantauan 8 SNP.
                  </p>
                </div>
              )}

              {/* Target Teachers multi-select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {formVisitType === 'supervisi_manajerial'
                    ? 'Tim Pendamping / Guru Koordinator Terlibat (Opsional)'
                    : 'Guru Sasaran Observasi / Sasaran Kegiatan (Opsional)'}
                </label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 max-h-36 overflow-y-auto">
                  {teachers.length === 0 ? (
                    <span className="text-xs text-slate-400">Belum ada data guru</span>
                  ) : (
                    teachers.map((t) => {
                      const checked = formTeacherIds.includes(t.id);
                      return (
                        <label key={t.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:bg-slate-100 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormTeacherIds([...formTeacherIds, t.id]);
                              } else {
                                setFormTeacherIds(formTeacherIds.filter((id) => id !== t.id));
                              }
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                          />
                          <span className="font-semibold text-slate-900">{t.nama}</span>
                          <span className="text-slate-500">({t.mapel} - {t.satuanPendidikan})</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Purpose & Targets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sasaran dan Target Kunjungan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  placeholder="Misal: Observasi kelas 12 indikator, pendampingan asesmen formatif, validasi modul KOSP..."
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Persiapan / Instrumen yang Disiapkan
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Contoh: Siapkan instrumen observasi 12 indikator, telaah Rapor Pendidikan..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* Nomor Berita Acara / Surat Kunjungan */}
              <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-blue-600" />
                    <span>Nomor Surat / Berita Acara Kunjungan</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextNo = getVisitAgendaNomorSurat(
                        { date: formDate } as VisitAgenda,
                        editingAgenda ? agendas.findIndex((a) => a.id === editingAgenda.id) : agendas.length,
                        settings
                      );
                      setFormNomorSurat(nextNo);
                    }}
                    className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-blue-200 hover:border-blue-300"
                    title="Buat nomor otomatis urut dinas"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Generate Otomatis</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={formNomorSurat}
                  onChange={(e) => setFormNomorSurat(e.target.value)}
                  placeholder="Contoh: 800.1 / 118 / DISDIKBUD / PS / 2026"
                  className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-white border border-blue-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 font-semibold"
                />
                <p className="text-[10.5px] text-slate-500">
                  Nomor resmi ini akan tercetak pada Lembar Berita Acara &amp; Konfirmasi Kunjungan Pengawas.
                </p>
              </div>

              {/* Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Pelaksanaan</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as VisitStatus)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="terjadwal">Terjadwal</option>
                    <option value="berlangsung">Sedang Berlangsung</option>
                    <option value="selesai">Selesai Dilaksanakan</option>
                    <option value="ditunda">Dijadwalkan Ulang</option>
                  </select>
                </div>
              </div>

              {/* Completion Notes if Status is Selesai */}
              {formStatus === 'selesai' && (
                <div>
                  <label className="block text-xs font-bold text-emerald-800 mb-1">
                    Notula / Hasil Temuan Kunjungan (Bila Sudah Selesai)
                  </label>
                  <textarea
                    rows={2}
                    value={formCompletionNotes}
                    onChange={(e) => setFormCompletionNotes(e.target.value)}
                    placeholder="Tuliskan ringkasan hasil observasi atau tindak lanjut yang disepakati..."
                    className="w-full px-3 py-2 text-xs bg-emerald-50/60 border border-emerald-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              )}

              {/* Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/25 cursor-pointer"
                >
                  {editingAgenda ? 'Simpan Perubahan' : 'Jadwalkan Kunjungan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL CHECK-IN / TANDAI SELESAI */}
      {isCompletionModalOpen && completionAgenda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="text-base font-bold">Tandai Kunjungan Telah Selesai</h3>
              </div>
              <button
                onClick={() => setIsCompletionModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <p className="font-bold text-slate-900">{completionAgenda.title}</p>
                <p className="text-slate-600">Sekolah: {completionAgenda.schoolName}</p>
                <p className="text-slate-600">Tanggal: {completionAgenda.date} ({completionAgenda.startTime || '08:00'} WIB)</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Notula / Hasil Temuan Kunjungan &amp; Rencana Tindak Lanjut
                </label>
                <textarea
                  rows={4}
                  value={completionNotesInput}
                  onChange={(e) => setCompletionNotesInput(e.target.value)}
                  placeholder="Contoh: Supervisi berjalan lancar. Praktik diferensiasi konten telah terlaksana baik. Disepakati penguatan pada asesmen formatif umpan balik..."
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCompletionModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveCompletion}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-500/25 cursor-pointer"
                >
                  Simpan Status Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. SIGNATORY CONFIG MODAL */}
      <SignatoryModal
        isOpen={isSignatoryModalOpen}
        onClose={() => setIsSignatoryModalOpen(false)}
        settings={settings}
        onSave={(newSettings) => {
          onUpdateSettings?.(newSettings);
          showToast('Penandatangan Disimpan', 'Identitas penandatangan jadwal kunjungan telah diperbarui.', 'success');
        }}
        onPrintAfterSave={() => {
          handlePrintSchedule();
        }}
      />

      {/* 6.5. BATCH RENUMBER AGENDAS MODAL */}
      {isRenumberAgendasModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-indigo-700">
                <ListOrdered className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Urutkan Nomor Berita Acara Kunjungan
                </h3>
              </div>
              <button
                onClick={() => setIsRenumberAgendasModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Fitur ini akan menyusun ulang dan mengunci nomor surat resmi untuk seluruh <strong>{agendas.length} agenda kunjungan</strong> secara berurutan, sehingga setiap lembar Berita Acara memiliki nomor surat dinas yang unik, rapi, dan sesuai dengan tata persuratan dinas.
            </p>

            <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
              <div>
                <label className="block text-xs font-bold text-indigo-950 mb-1">
                  Nomor Urut Surat Mulai Dari:
                </label>
                <input
                  type="number"
                  min="1"
                  value={renumberAgendaStartNum}
                  onChange={(e) => setRenumberAgendaStartNum(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-sm font-bold bg-white border border-indigo-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-indigo-700 mt-1 block">
                  Standar awal nomor buku agenda pengawas sekolah (contoh: 118).
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Pratinjau Hasil Penomoran (3 Agenda Pertama):
                </span>
                <div className="space-y-1">
                  {agendas.slice(0, 3).map((a, i) => (
                    <div key={a.id || i} className="p-2 bg-white rounded border border-indigo-200/80 text-[11px] font-mono text-slate-800 flex items-center justify-between">
                      <span className="truncate max-w-[200px] font-sans font-medium text-slate-700">{a.schoolName}:</span>
                      <span className="font-bold text-indigo-700">
                        800.1 / {renumberAgendaStartNum + i} / {settings.nomorSuratKode || 'DISDIKBUD / PS'} / {new Date(a.date).getFullYear()}
                      </span>
                    </div>
                  ))}
                  {agendas.length > 3 && (
                    <p className="text-[10px] text-slate-500 text-center pt-0.5">
                      ...dan {agendas.length - 3} agenda kunjungan berikutnya
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsRenumberAgendasModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleBatchRenumberAgendas(renumberAgendaStartNum)}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/25 cursor-pointer flex items-center gap-1.5"
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Terapkan Penomoran Berurutan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. HIDDEN PRINT CONTAINER: MATRIKS JADWAL BULANAN RESMI */}
      <div className="hidden">
        <div id="calendar-schedule-print-area" ref={printAreaRef} className="p-8 text-black bg-white" style={{ fontFamily: 'Times New Roman, serif' }}>
          {/* Kop Surat Resmi Dinas dengan Logo Kiri (Pemda) & Kanan (Tut Wuri) */}
          <div style={{ borderBottom: '3px double #000', paddingBottom: '10px', marginBottom: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
              <tbody>
                <tr>
                  <td style={{ width: '80px', textAlign: 'left', verticalAlign: 'middle', border: 'none', padding: 0 }}>
                    <img
                      src={settings.logoUrl || DEFAULT_SIDRAP_LOGO}
                      alt="Logo Pemda / Kab. Sidenreng Rappang"
                      style={{ maxHeight: '75px', maxWidth: '75px', objectFit: 'contain', display: 'block' }}
                    />
                  </td>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle', border: 'none', padding: '0 10px' }}>
                    <div style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {settings.governmentAgency || 'PEMERINTAH KABUPATEN SIDENRENG RAPPANG'}
                    </div>
                    <div style={{ fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '2px' }}>
                      DINAS PENDIDIKAN DAN KEBUDAYAAN
                    </div>
                    <div style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '2px' }}>
                      KANTOR PENGAWAS SEKOLAH PEMBINA SATUAN PENDIDIKAN
                    </div>
                    <div style={{ fontSize: '9pt', color: '#333', marginTop: '3px' }}>
                      {settings.schoolAddress || 'Jl. Harapan Baru Blok C No. 22, Pangkajene, Kecamatan Watang Pulu, Kabupaten Sidenreng Rappang, Sulawesi Selatan 91611'} | Telepon / Pos-el Resmi Kedinasan
                    </div>
                  </td>
                  <td style={{ width: '80px', textAlign: 'right', verticalAlign: 'middle', border: 'none', padding: 0 }}>
                    <img
                      src={settings.logoRightUrl || DEFAULT_TUTWURI_LOGO}
                      alt="Logo Tut Wuri Handayani / Sekolah"
                      style={{ maxHeight: '75px', maxWidth: '75px', objectFit: 'contain', display: 'block', marginLeft: 'auto' }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Judul Dokumen */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '13pt', textDecoration: 'underline', textTransform: 'uppercase', fontWeight: 'bold' }}>
              JADWAL &amp; MATRIKS AGENDA KUNJUNGAN SUPERVISI PENGAWAS SEKOLAH
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '10.5pt', fontStyle: 'italic' }}>
              Periode: {currentMonthLabel} · Tahun Ajaran 2026/2027
            </p>
          </div>

          {/* Identitas Pengawas */}
          <table style={{ width: '100%', marginBottom: '14px', fontSize: '10pt', border: 'none', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ width: '18%', border: 'none', padding: '3px 0' }}><strong>Nama Pengawas</strong></td>
                <td style={{ width: '2%', border: 'none', padding: '3px 0' }}>:</td>
                <td style={{ width: '40%', border: 'none', padding: '3px 0' }}>{settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'}</td>
                <td style={{ width: '18%', border: 'none', padding: '3px 0' }}><strong>Wilayah Sasaran</strong></td>
                <td style={{ width: '2%', border: 'none', padding: '3px 0' }}>:</td>
                <td style={{ width: '20%', border: 'none', padding: '3px 0' }}>Sekolah Binaan Kota/Kab.</td>
              </tr>
              <tr>
                <td style={{ border: 'none', padding: '3px 0' }}><strong>NIP Pengawas</strong></td>
                <td style={{ border: 'none', padding: '3px 0' }}>:</td>
                <td style={{ border: 'none', padding: '3px 0' }}>{settings.supervisorNip || '19830819 201001 1 002'}</td>
                <td style={{ border: 'none', padding: '3px 0' }}><strong>Jabatan</strong></td>
                <td style={{ border: 'none', padding: '3px 0' }}>:</td>
                <td style={{ border: 'none', padding: '3px 0' }}>{settings.supervisorRole || 'Pengawas Sekolah'}</td>
              </tr>
            </tbody>
          </table>

          {/* Tabel Agenda */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt', marginBottom: '24px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={{ border: '1px solid #000', padding: '6px', width: '4%', textAlign: 'center' }}>No</th>
                <th style={{ border: '1px solid #000', padding: '6px', width: '13%', textAlign: 'center' }}>Hari / Tanggal</th>
                <th style={{ border: '1px solid #000', padding: '6px', width: '18%', textAlign: 'left' }}>Satuan Pendidikan</th>
                <th style={{ border: '1px solid #000', padding: '6px', width: '22%', textAlign: 'left' }}>Agenda &amp; Fokus Supervisi</th>
                <th style={{ border: '1px solid #000', padding: '6px', width: '23%', textAlign: 'left' }}>Sasaran / Target Output</th>
                <th style={{ border: '1px solid #000', padding: '6px', width: '10%', textAlign: 'center' }}>Status</th>
                <th style={{ border: '1px solid #000', padding: '6px', width: '10%', textAlign: 'left' }}>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgendas.map((item, idx) => {
                const typeLabel = VISIT_TYPE_LABELS[item.visitType]?.label || item.visitType;
                return (
                  <tr key={item.id}>
                    <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ border: '1px solid #000', padding: '5px', whiteSpace: 'nowrap' }}>
                      <strong>{item.date}</strong><br />
                      <span style={{ fontSize: '8.5pt', color: '#444' }}>{item.startTime || '08:00'} - {item.endTime || '12:00'} WIB</span>
                    </td>
                    <td style={{ border: '1px solid #000', padding: '5px' }}>
                      <strong>{item.schoolName}</strong>
                    </td>
                    <td style={{ border: '1px solid #000', padding: '5px' }}>
                      <strong>{item.title}</strong><br />
                      <span style={{ fontSize: '8.5pt', color: '#1e40af' }}>[{typeLabel}]</span>
                    </td>
                    <td style={{ border: '1px solid #000', padding: '5px', fontSize: '9pt' }}>
                      {item.purposeAndTargets}
                      {item.targetTeacherNames && item.targetTeacherNames.length > 0 && (
                        <div style={{ marginTop: '2px', fontWeight: 'bold' }}>
                          Guru: {item.targetTeacherNames.join(', ')}
                        </div>
                      )}
                    </td>
                    <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center', fontWeight: 'bold', fontSize: '8.5pt' }}>
                      {item.status === 'selesai' ? 'Terlaksana' : item.status === 'berlangsung' ? 'Berlangsung' : 'Terjadwal'}
                    </td>
                    <td style={{ border: '1px solid #000', padding: '5px', fontSize: '8.5pt' }}>
                      {item.completionNotes || item.notes || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Tanda Tangan Kedinasan */}
          <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none', pageBreakInside: 'avoid' }}>
            <tbody>
              <tr>
                <td style={{ width: '50%', textAlign: 'center', border: 'none', verticalAlign: 'top' }}>
                  Mengetahui,<br />
                  <strong>{settings.pengawasPembinaRole || 'Koordinator Pengawas / Kepala Dinas'}</strong>
                  <br /><br /><br /><br /><br />
                  <strong style={{ textDecoration: 'underline' }}>
                    {settings.pengawasPembinaName || 'Dr. Hj. Endang Sulastri, M.Pd.'}
                  </strong>
                  <br />
                  <span>NIP. {settings.pengawasPembinaNip || '19650410 199103 2 001'}</span>
                </td>
                <td style={{ width: '50%', textAlign: 'center', border: 'none', verticalAlign: 'top' }}>
                  {settings.schoolCity || 'Kota Pendidikan'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />
                  <strong>{settings.supervisorRole || 'Pengawas Sekolah Pembina'}</strong>
                  <br /><br /><br /><br /><br />
                  <strong style={{ textDecoration: 'underline' }}>
                    {settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'}
                  </strong>
                  <br />
                  <span>NIP. {settings.supervisorNip || '19830819 201001 1 002'}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. HIDDEN PRINT CONTAINER: LEMBAR BERITA ACARA / SURAT KUNJUNGAN INDIVIDUAL */}
      {selectedVisitSlip && (
        <div className="hidden">
          <div id="visit-slip-print-area" ref={visitSlipPrintRef} className="p-8 text-black bg-white" style={{ fontFamily: 'Times New Roman, serif' }}>
            {/* Kop Surat Resmi Dinas dengan Logo Kiri (Pemda) & Kanan (Tut Wuri) */}
            <div style={{ borderBottom: '3px double #000', paddingBottom: '10px', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '80px', textAlign: 'left', verticalAlign: 'middle', border: 'none', padding: 0 }}>
                      <img
                        src={settings.logoUrl || DEFAULT_SIDRAP_LOGO}
                        alt="Logo Pemda / Kab. Sidenreng Rappang"
                        style={{ maxHeight: '75px', maxWidth: '75px', objectFit: 'contain', display: 'block' }}
                      />
                    </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle', border: 'none', padding: '0 10px' }}>
                      <div style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {settings.governmentAgency || 'PEMERINTAH KABUPATEN SIDENRENG RAPPANG'}
                      </div>
                      <div style={{ fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '2px' }}>
                        DINAS PENDIDIKAN DAN KEBUDAYAAN
                      </div>
                      <div style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '2px' }}>
                        KANTOR PENGAWAS SEKOLAH PEMBINA SATUAN PENDIDIKAN
                      </div>
                      <div style={{ fontSize: '9pt', color: '#333', marginTop: '3px' }}>
                        {settings.schoolAddress || 'Jl. Harapan Baru Blok C No. 22, Pangkajene, Kecamatan Watang Pulu, Kabupaten Sidenreng Rappang, Sulawesi Selatan 91611'} | Telepon / Pos-el Resmi Kedinasan
                      </div>
                    </td>
                    <td style={{ width: '80px', textAlign: 'right', verticalAlign: 'middle', border: 'none', padding: 0 }}>
                      <img
                        src={settings.logoRightUrl || DEFAULT_TUTWURI_LOGO}
                        alt="Logo Tut Wuri Handayani / Sekolah"
                        style={{ maxHeight: '75px', maxWidth: '75px', objectFit: 'contain', display: 'block', marginLeft: 'auto' }}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Judul Lembar Kunjungan */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '13pt', textDecoration: 'underline', textTransform: 'uppercase', fontWeight: 'bold' }}>
                BERITA ACARA &amp; LEMBAR KONFIRMASI KUNJUNGAN SUPERVISI
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '10.5pt', fontWeight: 'bold' }}>
                Nomor: {selectedVisitSlip.nomorSurat || getVisitAgendaNomorSurat(selectedVisitSlip, 0, settings)}
              </p>
            </div>

            <p style={{ fontSize: '11pt', lineHeight: 1.5, textAlign: 'justify' }}>
              Pada hari ini, <strong>{new Date(selectedVisitSlip.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>, bertempat di <strong>{selectedVisitSlip.schoolName}</strong>, telah dilaksanakan kegiatan kunjungan pembinaan dan supervisi oleh Pengawas Sekolah dengan rincian agenda sebagai berikut:
            </p>

            <table style={{ width: '100%', margin: '14px 0', fontSize: '10.5pt', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ width: '28%', padding: '5px 0', border: 'none' }}><strong>1. Nama Pengawas</strong></td>
                  <td style={{ width: '2%', padding: '5px 0', border: 'none' }}>:</td>
                  <td style={{ width: '70%', padding: '5px 0', border: 'none' }}>{settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '5px 0', border: 'none' }}><strong>2. NIP Pengawas</strong></td>
                  <td style={{ padding: '5px 0', border: 'none' }}>:</td>
                  <td style={{ padding: '5px 0', border: 'none' }}>{settings.supervisorNip || '19830819 201001 1 002'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '5px 0', border: 'none' }}><strong>3. Satuan Pendidikan</strong></td>
                  <td style={{ padding: '5px 0', border: 'none' }}>:</td>
                  <td style={{ padding: '5px 0', border: 'none' }}>{selectedVisitSlip.schoolName}</td>
                </tr>
                <tr>
                  <td style={{ padding: '5px 0', border: 'none' }}><strong>4. Waktu Pelaksanaan</strong></td>
                  <td style={{ padding: '5px 0', border: 'none' }}>:</td>
                  <td style={{ padding: '5px 0', border: 'none' }}>{selectedVisitSlip.startTime || '08:00'} s/d {selectedVisitSlip.endTime || '12:00'} WIB</td>
                </tr>
                <tr>
                  <td style={{ padding: '5px 0', border: 'none' }}><strong>5. Jenis Kunjungan</strong></td>
                  <td style={{ padding: '5px 0', border: 'none' }}>:</td>
                  <td style={{ padding: '5px 0', border: 'none' }}>{VISIT_TYPE_LABELS[selectedVisitSlip.visitType]?.label || selectedVisitSlip.visitType}</td>
                </tr>
                <tr>
                  <td style={{ padding: '5px 0', border: 'none' }}><strong>6. Judul Kegiatan</strong></td>
                  <td style={{ padding: '5px 0', border: 'none' }}>:</td>
                  <td style={{ padding: '5px 0', border: 'none' }}>{selectedVisitSlip.title}</td>
                </tr>
                <tr>
                  <td style={{ padding: '5px 0', border: 'none' }}><strong>7. Guru / Sasaran</strong></td>
                  <td style={{ padding: '5px 0', border: 'none' }}>:</td>
                  <td style={{ padding: '5px 0', border: 'none' }}>
                    {selectedVisitSlip.targetTeacherNames && selectedVisitSlip.targetTeacherNames.length > 0
                      ? selectedVisitSlip.targetTeacherNames.join(', ')
                      : 'Kepala Satuan Pendidikan / Dewan Guru'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '5px 0', border: 'none', verticalAlign: 'top' }}><strong>8. Sasaran &amp; Output</strong></td>
                  <td style={{ padding: '5px 0', border: 'none', verticalAlign: 'top' }}>:</td>
                  <td style={{ padding: '5px 0', border: 'none', verticalAlign: 'top' }}>{selectedVisitSlip.purposeAndTargets}</td>
                </tr>
                <tr>
                  <td style={{ padding: '5px 0', border: 'none', verticalAlign: 'top' }}><strong>9. Hasil &amp; Notula</strong></td>
                  <td style={{ padding: '5px 0', border: 'none', verticalAlign: 'top' }}>:</td>
                  <td style={{ padding: '5px 0', border: 'none', verticalAlign: 'top' }}>
                    {selectedVisitSlip.completionNotes || 'Kegiatan kunjungan terlaksana dengan tertib dan menghasilkan kesepakatan tindak lanjut peningkatan mutu pembelajaran.'}
                  </td>
                </tr>
              </tbody>
            </table>

            <p style={{ fontSize: '11pt', lineHeight: 1.5, textAlign: 'justify', marginTop: '16px' }}>
              Demikian Berita Acara Kunjungan Supervisi ini dibuat dengan sebenarnya dalam rangkap secukupnya untuk dipergunakan sebagaimana mestinya sebagai bukti fisik pelaksanaan tugas kedinasan pengawas sekolah.
            </p>

            {/* Kolom Tanda Tangan */}
            <table style={{ width: '100%', marginTop: '36px', borderCollapse: 'collapse', border: 'none', pageBreakInside: 'avoid' }}>
              <tbody>
                <tr>
                  <td style={{ width: '50%', textAlign: 'center', border: 'none', verticalAlign: 'top' }}>
                    Mengetahui,<br />
                    <strong>Kepala {selectedVisitSlip.schoolName}</strong>
                    <br /><br /><br /><br /><br />
                    <strong style={{ textDecoration: 'underline' }}>..................................................</strong><br />
                    <span>NIP. ..........................................</span>
                  </td>
                  <td style={{ width: '50%', textAlign: 'center', border: 'none', verticalAlign: 'top' }}>
                    {settings.schoolCity || 'Kota Pendidikan'}, {new Date(selectedVisitSlip.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />
                    <strong>Pengawas Sekolah Pembina</strong>
                    <br /><br /><br /><br /><br />
                    <strong style={{ textDecoration: 'underline' }}>
                      {settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'}
                    </strong><br />
                    <span>NIP. {settings.supervisorNip || '19830819 201001 1 002'}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
