/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  FileSearch,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Printer,
  FileDown,
  RotateCcw,
  School,
  X,
  Save,
  HelpCircle,
  Layers,
  ArrowRight,
  TrendingUp,
  Target,
  Flame,
  ChevronRight,
  HeartHandshake,
  ClipboardCheck,
  Laptop,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import {
  ContextualProblemRecord,
  ContextualProblemCategory,
  ContextualDataSource,
  CONTEXTUAL_CATEGORY_LABELS,
  CONTEXTUAL_DATA_SOURCE_LABELS,
  Teacher,
  AppSettings
} from '../types/inspiro';
import { UserRoleProfile } from '../services/firebase';
import { exportContextualProblemToWord } from '../utils/contextualProblemExport';
import { printDocumentElement } from '../utils/documentExport';

interface ContextualProblemViewProps {
  records: ContextualProblemRecord[];
  teachers: Teacher[];
  settings: AppSettings;
  currentUser: UserRoleProfile | null;
  onSaveRecord: (record: ContextualProblemRecord) => void;
  onDeleteRecord: (id: string) => void;
  onStartSupervision?: (teacherId?: string) => void;
  onNavigateToCoaching?: (teacherId?: string) => void;
  onNavigateToLearningEnv?: () => void;
  onNavigateToDigitalPM?: () => void;
  showToast: (title: string, desc?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const ContextualProblemView: React.FC<ContextualProblemViewProps> = ({
  records,
  teachers,
  settings,
  currentUser,
  onSaveRecord,
  onDeleteRecord,
  onStartSupervision,
  onNavigateToCoaching,
  onNavigateToLearningEnv,
  onNavigateToDigitalPM,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<ContextualProblemRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'identity_data' | 'problem_desc' | 'root_causes' | 'intervention'>('identity_data');
  const [formRecord, setFormRecord] = useState<ContextualProblemRecord | null>(null);

  // Available unique schools
  const availableSchools = useMemo(() => {
    const set = new Set<string>();
    if (settings.schoolName) set.add(settings.schoolName);
    teachers.forEach((t) => {
      if (t.satuanPendidikan) set.add(t.satuanPendidikan);
    });
    records.forEach((r) => {
      if (r.schoolName) set.add(r.schoolName);
    });
    return Array.from(set);
  }, [settings.schoolName, teachers, records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        r.problemTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.baselineDataEvidence.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.teacherName && r.teacherName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        r.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.subject && r.subject.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchSchool = schoolFilter === 'all' || r.schoolName === schoolFilter;
      const matchCat = categoryFilter === 'all' || r.problemCategory === categoryFilter;
      const matchSev = severityFilter === 'all' || r.severity === severityFilter;
      const matchStat = statusFilter === 'all' || r.status === statusFilter;

      return matchSearch && matchSchool && matchCat && matchSev && matchStat;
    });
  }, [records, searchTerm, schoolFilter, categoryFilter, severityFilter, statusFilter]);

  // Analytics Stats
  const stats = useMemo(() => {
    const total = records.length;
    const resolved = records.filter((r) => r.status === 'teratasi').length;
    const inProgress = records.filter((r) => r.status === 'dalam_penanganan').length;
    const highSeverity = records.filter((r) => r.severity === 'Tinggi').length;

    // Most common category
    const counts: Partial<Record<ContextualProblemCategory, number>> = {};
    records.forEach((r) => {
      counts[r.problemCategory] = (counts[r.problemCategory] || 0) + 1;
    });
    let topCategory = 'Belum Ada';
    let maxCount = 0;
    Object.entries(counts).forEach(([cat, count]) => {
      if (count && count > maxCount) {
        maxCount = count;
        topCategory = CONTEXTUAL_CATEGORY_LABELS[cat as ContextualProblemCategory]?.badge || cat;
      }
    });

    return {
      total,
      resolved,
      inProgress,
      highSeverity,
      topCategory
    };
  }, [records]);

  // Initialize new form
  const handleOpenCreate = () => {
    const defaultTeacher = teachers[0] || {
      id: 'G001',
      nama: 'Ahmad Fauzi, S.Pd.',
      nip: '19850714 201001 1 012',
      mapel: 'Matematika',
      kelas: 'VII',
      satuanPendidikan: settings.schoolName || 'SMP Negeri 1 Merdeka Nusantara'
    };

    const newRec: ContextualProblemRecord = {
      id: `cp-${Date.now()}`,
      schoolName: defaultTeacher.satuanPendidikan || settings.schoolName || 'SMP Negeri 1 Merdeka Nusantara',
      teacherId: defaultTeacher.id,
      teacherName: defaultTeacher.nama,
      teacherNip: defaultTeacher.nip,
      subject: defaultTeacher.mapel || 'Matematika',
      gradeClass: defaultTeacher.kelas || 'VII (Fase D)',
      date: new Date().toISOString().split('T')[0],
      assessorName: settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
      assessorRole: 'Pengawas Sekolah',
      assessorNip: settings.supervisorNip || '19830819 201001 1 002',
      headmasterName: settings.pengawasPembinaName || 'Dra. Hj. Nurhasanah, M.Pd.',
      headmasterNip: settings.pengawasPembinaNip || '19720815 199802 2 003',

      problemCategory: 'keaktifan_murid',
      problemTitle: 'Pasivitas Belajar & Keengganan Murid Mengajukan Pertanyaan',
      severity: 'Tinggi',

      dataSources: ['observasi_awal', 'wawancara_guru'],
      baselineDataEvidence:
        'Teramati saat kunjungan awal: 60% murid di kelas pasif menunduk saat ditanya guru. Hasil wawancara mengungkap murid merasa cemas berbuat salah dan malu bila ditertawakan teman sebaya.',

      rootCauses: {
        aspekMetodeGuru:
          'Metode didominasi ceramah satu arah dan pertanyaan guru bersifat tertutup tanpa memberikan waktu jeda berpikir (wait-time).',
        aspekPerencanaanModul:
          'Modul ajar belum memuat kegiatan apersepsi pemantik minat dan lembar kerja seragam tanpa diferensiasi berjenjang.',
        aspekPengelolaanKelas:
          'Belum terbentuk kesepakatan kelas yang ramah kesalahan (growth mindset).',
        aspekKarakteristikMurid:
          'Murid memiliki tingkat kecemasan akademik tinggi dan belum terbiasa berkolaborasi kelompok.',
        aspekDayaDukung:
          'Susunan meja berbaris kaku menghambat kontak mata dan kerja tim.'
      },

      fiveWhys: {
        why1: 'Murid pasif dan tidak berani bertanya saat pembelajaran berlangsung.',
        why2: 'Murid takut salah menjawab karena khawatir ditertawakan atau disudutkan.',
        why3: 'Guru belum membangun iklim psikologis aman dan metode mengajar masih berpusat pada ceramah guru.'
      },

      recommendedIntervention: {
        supervisionAction: 'Coaching TIRTA',
        targetTimeline: '2 Pekan',
        actionDetails: [
          'Lakukan sesi Coaching Alur TIRTA untuk menggali strategi kesepakatan kelas positif bersama guru.',
          'Dorong penerapan teknik Think-Pair-Share sebelum pleno kelas.',
          'Integrasikan instrumen PM: Lingkungan Belajar pada siklus pengamatan berikutnya.'
        ],
        linkedFeature: 'coaching'
      },

      status: 'teridentifikasi',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setFormRecord(newRec);
    setActiveFormTab('identity_data');
    setIsFormModalOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (rec: ContextualProblemRecord) => {
    setFormRecord(JSON.parse(JSON.stringify(rec)));
    setActiveFormTab('identity_data');
    setIsFormModalOpen(true);
  };

  // Save Record
  const handleSaveForm = () => {
    if (!formRecord) return;
    onSaveRecord({ ...formRecord, updatedAt: new Date().toISOString() });
    setIsFormModalOpen(false);
    showToast('Berhasil Menyimpan', `Diagnosis masalah ${formRecord.problemTitle} telah disimpan.`);
  };

  // Print helper
  const handlePrint = (rec: ContextualProblemRecord) => {
    setSelectedRecordForDetail(rec);
    setTimeout(() => {
      printDocumentElement('printable-contextual-problem-doc', `Diagnosis_Akar_Masalah_${rec.teacherName || rec.schoolName}`);
    }, 150);
  };

  // Word export helper
  const handleExportWord = (rec: ContextualProblemRecord) => {
    exportContextualProblemToWord(rec, settings);
    showToast('Mengunduh Dokumen Word', `Berkas diagnosis masalah sedang diunduh.`);
  };

  const getSeverityBadge = (severity: string) => {
    if (severity === 'Tinggi') return 'bg-rose-100 text-rose-800 border-rose-300';
    if (severity === 'Sedang') return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'teratasi') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (status === 'dalam_penanganan') return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-amber-700/30">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-semibold uppercase tracking-wider border border-amber-500/30">
              <FileSearch className="w-3.5 h-3.5" />
              <span>Diagnosis Masalah Lapangan · Fakta Kontekstual & Root Causes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Data Awal & Akar Masalah Kontekstual</span>
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Titik tolak supervisi bermakna di satuan pendidikan binaan{' '}
              <strong className="text-amber-200">Kabupaten Sidenreng Rappang</strong>. Berangkat dari{' '}
              <strong className="text-white">Fakta Nyata di Ruang Kelas (Data Awal)</strong>, membedah{' '}
              <strong className="text-white">Akar Masalah (5-Whys)</strong>, dan menghasilkan{' '}
              <strong className="text-white">Resep Solusi Supervisi Terarah</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Catat Masalah & Akar Masalah Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Masalah */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Masalah Terdata</div>
            <div className="text-2xl font-black text-slate-800">{stats.total} Kasus</div>
            <div className="text-xs text-slate-500">Kontekstual Sekolah Binaan</div>
          </div>
        </div>

        {/* Prioritas Tinggi */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Urgensi Prioritas Tinggi</div>
            <div className="text-2xl font-black text-rose-700">{stats.highSeverity} Kasus</div>
            <div className="text-xs text-slate-500">Perlu Intervensi Segera</div>
          </div>
        </div>

        {/* Dalam Penanganan */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Dalam Penanganan</div>
            <div className="text-2xl font-black text-blue-700">{stats.inProgress} Kasus</div>
            <div className="text-xs text-slate-500">Sedang Di-Coaching / Supervisi</div>
          </div>
        </div>

        {/* Masalah Teratasi */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Masalah Teratasi</div>
            <div className="text-2xl font-black text-emerald-700">{stats.resolved} Kasus</div>
            <div className="text-xs text-slate-500">Capaian Peningkatan Mutu</div>
          </div>
        </div>
      </div>

      {/* DIAGNOSTIC CANVAS: 5 DIMENSI AKAR MASALAH KONTEKSTUAL */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 border border-slate-700 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Kerangka Diagnosis 5 Dimensi Akar Masalah</h3>
              <p className="text-xs text-slate-400">Membedah faktor di balik kendala pembelajaran tanpa asumsi sepihak</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
            Root Cause Canvas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
            <div className="text-amber-400 font-bold">1. Metode Guru</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Dominasi ceramah, instruksi terlalu cepat, pertanyaan tertutup, minim diferensiasi.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
            <div className="text-teal-400 font-bold">2. Modul Ajar</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Tugas seragam tanpa scaffolding, materi teoritis, belum terhubung konteks lokal.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
            <div className="text-blue-400 font-bold">3. Pengelolaan Kelas</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Waktu molor tanpa timer, antrian alat ricuh, belum ada kesepakatan kelas yang hidup.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
            <div className="text-rose-400 font-bold">4. Karakteristik Murid</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Takut salah, trauma matematika, literasi membaca kritis rendah, ragu berpendapat.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
            <div className="text-indigo-400 font-bold">5. Sarana & Fasilitas</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Susunan bangku kaku berbaris, alat lab terbatas, sarana digital belum dimaksimalkan.
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari masalah, guru, fakta data awal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* School filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <School className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="all">Semua Satuan Pendidikan</option>
              {availableSchools.map((sch) => (
                <option key={sch} value={sch}>
                  {sch}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500 font-semibold"
            >
              <option value="all">Semua Kategori Masalah</option>
              {Object.entries(CONTEXTUAL_CATEGORY_LABELS).map(([cat, info]) => (
                <option key={cat} value={cat}>
                  {info.label}
                </option>
              ))}
            </select>
          </div>

          {/* Severity filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500 font-semibold"
            >
              <option value="all">Semua Urgensi</option>
              <option value="Tinggi">Prioritas Tinggi</option>
              <option value="Sedang">Prioritas Sedang</option>
              <option value="Rendah">Prioritas Rendah</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500 font-semibold"
            >
              <option value="all">Semua Status</option>
              <option value="teridentifikasi">Teridentifikasi</option>
              <option value="dalam_penanganan">Dalam Penanganan</option>
              <option value="teratasi">Teratasi</option>
            </select>
          </div>

          {(searchTerm || schoolFilter !== 'all' || categoryFilter !== 'all' || severityFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSchoolFilter('all');
                setCategoryFilter('all');
                setSeverityFilter('all');
                setStatusFilter('all');
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              title="Reset Filter"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* RECORD CARDS LIST */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <FileSearch className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Belum Ada Catatan Data Awal & Akar Masalah</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Mulai rekam diagnosis fakta nyata di lapangan, analisis akar masalah (5-Whys), dan tentukan resep supervisi terarah.
            </p>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Diagnosis Pertama</span>
            </button>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const catInfo = CONTEXTUAL_CATEGORY_LABELS[record.problemCategory] || {
              label: record.problemCategory,
              badge: record.problemCategory,
              color: 'text-amber-800',
              bg: 'bg-amber-50',
              border: 'border-amber-200'
            };

            return (
              <div
                key={record.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {record.schoolName}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${catInfo.bg} ${catInfo.color} ${catInfo.border}`}>
                        {catInfo.badge}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getSeverityBadge(record.severity)}`}>
                        Urgensi: {record.severity}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(record.status)}`}>
                        {record.status === 'teratasi' ? 'Teratasi' : record.status === 'dalam_penanganan' ? 'Dalam Penanganan' : 'Teridentifikasi'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{record.problemTitle}</h3>

                    <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                      <span>Guru: <strong>{record.teacherName || 'Umum Sekolah'}</strong></span>
                      {record.subject && <span>• Mapel: {record.subject} ({record.gradeClass})</span>}
                      <span>• Tanggal Diagnosis: {record.date}</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedRecordForDetail(record);
                        setIsDetailOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                      title="Lihat Rincian Analisis"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      <span>Rincian</span>
                    </button>

                    <button
                      onClick={() => handleExportWord(record)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition border border-blue-200"
                      title="Unduh Dokumen Word (.doc)"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Word (.doc)</span>
                    </button>

                    <button
                      onClick={() => handlePrint(record)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold transition border border-amber-200"
                      title="Cetak Berkas Resmi"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak</span>
                    </button>

                    <button
                      onClick={() => handleOpenEdit(record)}
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      title="Edit Data"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus diagnosis masalah "${record.problemTitle}"?`)) {
                          onDeleteRecord(record.id);
                          showToast('Data Dihapus', `Diagnosis masalah telah dihapus.`);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Evidence & 3-Whys Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Left: Baseline Evidence */}
                  <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <FileSearch className="w-3.5 h-3.5 text-amber-700" />
                      <span>Data Awal Kontekstual (Fakta Nyata)</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {record.baselineDataEvidence}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {record.dataSources.map((ds, idx) => (
                        <span key={idx} className="bg-white text-amber-900 font-semibold px-2 py-0.5 rounded border border-amber-300 text-[10px]">
                          {CONTEXTUAL_DATA_SOURCE_LABELS[ds] || ds}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: 3-Whys Root Cause */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-600" />
                      <span>Akar Penyebab Utama (Bedah 3-Whys)</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-700">
                      <div><strong className="text-slate-500">Mengapa 1:</strong> {record.fiveWhys.why1}</div>
                      <div><strong className="text-slate-500">Mengapa 2:</strong> {record.fiveWhys.why2}</div>
                      <div className="text-amber-900 font-semibold"><strong className="text-amber-800">Akar Utama:</strong> {record.fiveWhys.why3}</div>
                    </div>
                  </div>
                </div>

                {/* Resep Intervensi Supervisi & Quick Link Action Button */}
                <div className="p-3.5 bg-gradient-to-r from-slate-50 to-amber-50/50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-bold text-slate-900">
                        Resep Supervisi: {record.recommendedIntervention.supervisionAction}
                      </span>
                      <span className="text-slate-500">• Target: {record.recommendedIntervention.targetTimeline}</span>
                    </div>
                    <p className="text-slate-600 line-clamp-1">
                      {record.recommendedIntervention.actionDetails[0]}
                    </p>
                  </div>

                  {/* Quick Jump Buttons to relevant features in INSPIRO */}
                  <div className="flex items-center gap-2 shrink-0">
                    {record.recommendedIntervention.supervisionAction === 'Coaching TIRTA' && onNavigateToCoaching && (
                      <button
                        onClick={() => onNavigateToCoaching(record.teacherId)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                      >
                        <HeartHandshake className="w-3.5 h-3.5" />
                        <span>Buka Coaching TIRTA</span>
                      </button>
                    )}

                    {record.recommendedIntervention.supervisionAction === 'Supervisi Klinis' && onStartSupervision && (
                      <button
                        onClick={() => onStartSupervision(record.teacherId)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        <span>Mulai Supervisi Klinis</span>
                      </button>
                    )}

                    {record.recommendedIntervention.linkedFeature === 'pm-learning-env' && onNavigateToLearningEnv && (
                      <button
                        onClick={onNavigateToLearningEnv}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>PM: Lingkungan Belajar</span>
                      </button>
                    )}

                    {record.recommendedIntervention.linkedFeature === 'pm-digital' && onNavigateToDigitalPM && (
                      <button
                        onClick={onNavigateToDigitalPM}
                        className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                      >
                        <Laptop className="w-3.5 h-3.5" />
                        <span>PM: Pemanfaatan Digital</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DETAIL MODAL */}
      {isDetailOpen && selectedRecordForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getSeverityBadge(selectedRecordForDetail.severity)}`}>
                    Prioritas {selectedRecordForDetail.severity}
                  </span>
                  <span className="text-xs text-slate-400">• {selectedRecordForDetail.schoolName}</span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  {selectedRecordForDetail.problemTitle}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportWord(selectedRecordForDetail)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Word</span>
                </button>
                <button
                  onClick={() => handlePrint(selectedRecordForDetail)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-sm">
              {/* Identity Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold uppercase">Guru Sasaran</span>
                  <span className="font-bold text-slate-800">{selectedRecordForDetail.teacherName || 'Seluruh Guru'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase">Mata Pelajaran</span>
                  <span className="font-bold text-slate-800">{selectedRecordForDetail.subject || '-'} ({selectedRecordForDetail.gradeClass || '-'})</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase">Tanggal Diagnosis</span>
                  <span className="font-bold text-slate-800">{selectedRecordForDetail.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase">Status Penanganan</span>
                  <span className="font-bold text-amber-800 uppercase">{selectedRecordForDetail.status}</span>
                </div>
              </div>

              {/* Data Awal Kontekstual */}
              <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2 text-xs">
                <h4 className="font-bold text-amber-950 uppercase text-sm flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-amber-700" />
                  <span>Data Awal Kontekstual (Fakta Nyata Lapangan)</span>
                </h4>
                <p className="text-slate-700 leading-relaxed text-sm">
                  {selectedRecordForDetail.baselineDataEvidence}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedRecordForDetail.dataSources.map((ds, idx) => (
                    <span key={idx} className="bg-white text-amber-900 font-semibold px-2.5 py-1 rounded-md border border-amber-300">
                      {CONTEXTUAL_DATA_SOURCE_LABELS[ds] || ds}
                    </span>
                  ))}
                </div>
              </div>

              {/* 5 Dimensi Akar Masalah */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">
                  Analisis 5 Dimensi Akar Masalah (Root Causes)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-amber-800 block">1. Aspek Metode & Pedagogi Guru:</span>
                    <p className="text-slate-700">{selectedRecordForDetail.rootCauses.aspekMetodeGuru || '-'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-teal-800 block">2. Aspek Kesiapan Perencanaan Modul:</span>
                    <p className="text-slate-700">{selectedRecordForDetail.rootCauses.aspekPerencanaanModul || '-'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-blue-800 block">3. Aspek Pengelolaan Kelas & Waktu:</span>
                    <p className="text-slate-700">{selectedRecordForDetail.rootCauses.aspekPengelolaanKelas || '-'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-rose-800 block">4. Aspek Karakteristik Murid:</span>
                    <p className="text-slate-700">{selectedRecordForDetail.rootCauses.aspekKarakteristikMurid || '-'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 md:col-span-2">
                    <span className="font-bold text-indigo-800 block">5. Aspek Sarana, Alat & Daya Dukung:</span>
                    <p className="text-slate-700">{selectedRecordForDetail.rootCauses.aspekDayaDukung || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Rantai 3-Whys */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-800 uppercase">Rantai Analisis "3-Whys"</h4>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-200 font-bold">Mengapa 1</span>
                    <span className="text-slate-700">{selectedRecordForDetail.fiveWhys.why1}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-200 font-bold">Mengapa 2</span>
                    <span className="text-slate-700">{selectedRecordForDetail.fiveWhys.why2}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-bold">Akar Utama</span>
                    <span className="text-amber-900 font-bold">{selectedRecordForDetail.fiveWhys.why3}</span>
                  </div>
                </div>
              </div>

              {/* Resep Intervensi Supervisi */}
              <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 space-y-3 text-xs">
                <h4 className="font-bold text-blue-950 uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-700" />
                  <span>Resep Solusi Supervisi Pengawas</span>
                </h4>
                <div className="space-y-1">
                  <p><strong>Bentuk Pendampingan:</strong> <span className="font-bold text-blue-900">{selectedRecordForDetail.recommendedIntervention.supervisionAction}</span></p>
                  <p><strong>Target Waktu:</strong> {selectedRecordForDetail.recommendedIntervention.targetTimeline}</p>
                  <div className="pt-1">
                    <strong>Rincian Aksi Konkret:</strong>
                    <ol className="list-decimal pl-5 space-y-1 text-slate-700 pt-1">
                      {selectedRecordForDetail.recommendedIntervention.actionDetails.map((act, idx) => (
                        <li key={idx}>{act}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">
                Pemerintah Kabupaten Sidenreng Rappang · Pengawas: {selectedRecordForDetail.assessorName}
              </span>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT FORM MODAL */}
      {isFormModalOpen && formRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 bg-amber-950 text-white flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FileSearch className="w-5 h-5 text-amber-300" />
                  <span>Lembar Kerja Diagnosis Data Awal & Akar Masalah</span>
                </h2>
                <p className="text-xs text-amber-200">
                  Fokus: Fakta Konkret Lapangan, Analisis Akar Masalah (5-Whys) & Resep Solusi
                </p>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-amber-200 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 shrink-0 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setActiveFormTab('identity_data')}
                className={`px-3 py-1.5 rounded-lg transition shrink-0 ${
                  activeFormTab === 'identity_data' ? 'bg-white text-amber-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Data Awal & Fakta
              </button>
              <button
                onClick={() => setActiveFormTab('problem_desc')}
                className={`px-3 py-1.5 rounded-lg transition shrink-0 ${
                  activeFormTab === 'problem_desc' ? 'bg-white text-amber-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Pernyataan Masalah
              </button>
              <button
                onClick={() => setActiveFormTab('root_causes')}
                className={`px-3 py-1.5 rounded-lg transition shrink-0 ${
                  activeFormTab === 'root_causes' ? 'bg-white text-amber-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3. Akar Masalah (5-Whys)
              </button>
              <button
                onClick={() => setActiveFormTab('intervention')}
                className={`px-3 py-1.5 rounded-lg transition shrink-0 ${
                  activeFormTab === 'intervention' ? 'bg-white text-amber-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                4. Resep Solusi Supervisi
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* TAB 1: DATA AWAL & FAKTA */}
              {activeFormTab === 'identity_data' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Pilih Guru Sasaran (Opsional bila untuk seluruh sekolah)
                      </label>
                      <select
                        value={formRecord.teacherId || ''}
                        onChange={(e) => {
                          const t = teachers.find((tc) => tc.id === e.target.value);
                          if (t) {
                            setFormRecord({
                              ...formRecord,
                              teacherId: t.id,
                              teacherName: t.nama,
                              teacherNip: t.nip,
                              schoolName: t.satuanPendidikan,
                              subject: t.mapel,
                              gradeClass: t.kelas
                            });
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                      >
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nama} — {t.mapel} ({t.satuanPendidikan})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Satuan Pendidikan Binaan
                      </label>
                      <input
                        type="text"
                        value={formRecord.schoolName}
                        onChange={(e) => setFormRecord({ ...formRecord, schoolName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mata Pelajaran & Kelas / Fase
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={formRecord.subject || ''}
                          onChange={(e) => setFormRecord({ ...formRecord, subject: e.target.value })}
                          placeholder="Mapel"
                          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        />
                        <input
                          type="text"
                          value={formRecord.gradeClass || ''}
                          onChange={(e) => setFormRecord({ ...formRecord, gradeClass: e.target.value })}
                          placeholder="Kelas/Fase"
                          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tanggal Diagnosis
                      </label>
                      <input
                        type="date"
                        value={formRecord.date}
                        onChange={(e) => setFormRecord({ ...formRecord, date: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  {/* Checklist Sumber Data Awal */}
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                    <label className="block text-xs font-bold text-amber-950">
                      Sumber Fakta Data Awal yang Digunakan:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(Object.entries(CONTEXTUAL_DATA_SOURCE_LABELS) as [ContextualDataSource, string][]).map(([key, label]) => {
                        const isChecked = formRecord.dataSources.includes(key);
                        return (
                          <label key={key} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                let updatedSources = [...formRecord.dataSources];
                                if (e.target.checked) {
                                  updatedSources.push(key);
                                } else {
                                  updatedSources = updatedSources.filter((s) => s !== key);
                                }
                                setFormRecord({ ...formRecord, dataSources: updatedSources });
                              }}
                              className="w-4 h-4 text-amber-600 rounded border-slate-300"
                            />
                            <span>{label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Baseline evidence textarea */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Uraian Data Awal & Fakta Konkret Lapangan
                    </label>
                    <textarea
                      rows={4}
                      value={formRecord.baselineDataEvidence}
                      onChange={(e) => setFormRecord({ ...formRecord, baselineDataEvidence: e.target.value })}
                      placeholder="Contoh: Teramati saat kunjungan awal: 65% murid di barisan belakang melamun, hanya menyalin papan tulis. Hasil wawancara mengungkap murid takut salah..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: PERNYATAAN MASALAH */}
              {activeFormTab === 'problem_desc' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kategori Masalah Kontekstual
                    </label>
                    <select
                      value={formRecord.problemCategory}
                      onChange={(e) =>
                        setFormRecord({ ...formRecord, problemCategory: e.target.value as ContextualProblemCategory })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
                    >
                      {Object.entries(CONTEXTUAL_CATEGORY_LABELS).map(([cat, info]) => (
                        <option key={cat} value={cat}>
                          {info.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Judul / Pernyataan Masalah Kontekstual
                    </label>
                    <input
                      type="text"
                      value={formRecord.problemTitle}
                      onChange={(e) => setFormRecord({ ...formRecord, problemTitle: e.target.value })}
                      placeholder="Contoh: Pasivitas & Tingginya Kecemasan Murid dalam Eksplorasi Aljabar"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tingkat Urgensi Masalah
                      </label>
                      <select
                        value={formRecord.severity}
                        onChange={(e) =>
                          setFormRecord({ ...formRecord, severity: e.target.value as 'Tinggi' | 'Sedang' | 'Rendah' })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
                      >
                        <option value="Tinggi">Prioritas Tinggi (Perlu Intervensi Segera)</option>
                        <option value="Sedang">Prioritas Sedang (Dapat Dijadwalkan Berkala)</option>
                        <option value="Rendah">Prioritas Rendah (Pemantauan Mandiri Kombel)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Status Penanganan
                      </label>
                      <select
                        value={formRecord.status}
                        onChange={(e) =>
                          setFormRecord({ ...formRecord, status: e.target.value as any })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
                      >
                        <option value="teridentifikasi">Teridentifikasi (Baru Ditemukan)</option>
                        <option value="dalam_penanganan">Dalam Penanganan (Sedang Proses Pembinaan)</option>
                        <option value="teratasi">Teratasi (Tuntas / Terjadi Perbaikan)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: AKAR MASALAH (5-WHYS) */}
              {activeFormTab === 'root_causes' && (
                <div className="space-y-5">
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
                    <h4 className="text-xs font-bold text-amber-950 uppercase">
                      Rantai Analisis "3-Whys" (Menemukan Akar Terdalam)
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          1. Mengapa masalah di atas tampak terjadi di kelas?
                        </label>
                        <input
                          type="text"
                          value={formRecord.fiveWhys.why1}
                          onChange={(e) =>
                            setFormRecord({
                              ...formRecord,
                              fiveWhys: { ...formRecord.fiveWhys, why1: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          2. Mengapa kondisi pertama tersebut terjadi?
                        </label>
                        <input
                          type="text"
                          value={formRecord.fiveWhys.why2}
                          onChange={(e) =>
                            setFormRecord({
                              ...formRecord,
                              fiveWhys: { ...formRecord.fiveWhys, why2: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                          3. Mengapa kondisi kedua terjadi? (Akar Utama yang Perlu Dibenahi Pengawas)
                        </label>
                        <input
                          type="text"
                          value={formRecord.fiveWhys.why3}
                          onChange={(e) =>
                            setFormRecord({
                              ...formRecord,
                              fiveWhys: { ...formRecord.fiveWhys, why3: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 bg-white border border-amber-400 rounded-lg text-xs font-bold text-amber-950"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 5 Dimensi Akar Masalah Detail */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase">
                      Pemetaan 5 Dimensi Penyebab Kontekstual
                    </h4>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-0.5">
                          1. Dari Sisi Metode & Pedagogi Guru
                        </label>
                        <textarea
                          rows={2}
                          value={formRecord.rootCauses.aspekMetodeGuru}
                          onChange={(e) =>
                            setFormRecord({
                              ...formRecord,
                              rootCauses: { ...formRecord.rootCauses, aspekMetodeGuru: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-0.5">
                          2. Dari Sisi Kesiapan Perencanaan & Modul Ajar
                        </label>
                        <textarea
                          rows={2}
                          value={formRecord.rootCauses.aspekPerencanaanModul}
                          onChange={(e) =>
                            setFormRecord({
                              ...formRecord,
                              rootCauses: { ...formRecord.rootCauses, aspekPerencanaanModul: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-0.5">
                          3. Dari Sisi Pengelolaan Kelas & Alokasi Waktu
                        </label>
                        <textarea
                          rows={2}
                          value={formRecord.rootCauses.aspekPengelolaanKelas}
                          onChange={(e) =>
                            setFormRecord({
                              ...formRecord,
                              rootCauses: { ...formRecord.rootCauses, aspekPengelolaanKelas: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-0.5">
                          4. Dari Sisi Karakteristik & Kesiapan Murid
                        </label>
                        <textarea
                          rows={2}
                          value={formRecord.rootCauses.aspekKarakteristikMurid}
                          onChange={(e) =>
                            setFormRecord({
                              ...formRecord,
                              rootCauses: { ...formRecord.rootCauses, aspekKarakteristikMurid: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-0.5">
                          5. Dari Sisi Sarana & Daya Dukung
                        </label>
                        <textarea
                          rows={2}
                          value={formRecord.rootCauses.aspekDayaDukung}
                          onChange={(e) =>
                            setFormRecord({
                              ...formRecord,
                              rootCauses: { ...formRecord.rootCauses, aspekDayaDukung: e.target.value }
                            })
                          }
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: RESEP SOLUSI SUPERVISI */}
              {activeFormTab === 'intervention' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Bentuk Tindakan Supervisi yang Dipilih
                      </label>
                      <select
                        value={formRecord.recommendedIntervention.supervisionAction}
                        onChange={(e) =>
                          setFormRecord({
                            ...formRecord,
                            recommendedIntervention: {
                              ...formRecord.recommendedIntervention,
                              supervisionAction: e.target.value as any
                            }
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
                      >
                        <option value="Coaching TIRTA">Coaching TIRTA (Dialogis Reflektif)</option>
                        <option value="Supervisi Klinis">Supervisi Klinis (Observasi Kelas 12 Indikator)</option>
                        <option value="Pendampingan PM">Pendampingan PM (Praktik Pedagogis / Digital)</option>
                        <option value="Modelling Pengawas">Modelling Pengawas (Contoh Langsung di Kelas)</option>
                        <option value="Komunitas Belajar">Komunitas Belajar (Kombel Sekolah / MGMP)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Target Lini Masa Penyelesaian
                      </label>
                      <input
                        type="text"
                        value={formRecord.recommendedIntervention.targetTimeline}
                        onChange={(e) =>
                          setFormRecord({
                            ...formRecord,
                            recommendedIntervention: {
                              ...formRecord.recommendedIntervention,
                              targetTimeline: e.target.value
                            }
                          })
                        }
                        placeholder="Contoh: 2 Pekan / Siklus II November 2026"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Rincian Langkah-Langkah Aksi Konkret (Pisahkan dengan baris baru)
                    </label>
                    <textarea
                      rows={4}
                      value={formRecord.recommendedIntervention.actionDetails.join('\n')}
                      onChange={(e) =>
                        setFormRecord({
                          ...formRecord,
                          recommendedIntervention: {
                            ...formRecord.recommendedIntervention,
                            actionDetails: e.target.value.split('\n').filter((s) => s.trim().length > 0)
                          }
                        })
                      }
                      placeholder="Tuliskan aksi nyata supervisi..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Catatan Progres Penanganan (Bila sudah berjalan)
                    </label>
                    <textarea
                      rows={2}
                      value={formRecord.resolutionNotes || ''}
                      onChange={(e) => setFormRecord({ ...formRecord, resolutionNotes: e.target.value })}
                      placeholder="Contoh: Guru telah mencoba teknik Think-Pair-Share dan murid mulai antusias..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-lg"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSaveForm}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Diagnosis Masalah</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN PRINT VIEW CONTAINER */}
      {selectedRecordForDetail && (
        <div id="printable-contextual-problem-doc" className="hidden print:block p-8 bg-white text-slate-900 font-serif">
          {/* KOP SURAT */}
          <div className="text-center border-b-2 border-black pb-3 mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wide">
              {settings.governmentAgency || 'PEMERINTAH KABUPATEN SIDENRENG RAPPANG'}
            </h3>
            <h2 className="text-base font-extrabold uppercase">DINAS PENDIDIKAN DAN KEBUDAYAAN</h2>
            <h4 className="text-xs font-bold text-amber-900">KANTOR PENGAWAS SEKOLAH PEMBINA SATUAN PENDIDIKAN</h4>
            <p className="text-[10px] italic text-slate-600 mt-1">
              {settings.schoolAddress || 'Sekretariat Pengawas Sekolah, Kabupaten Sidenreng Rappang, Sulawesi Selatan'}
            </p>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-sm font-extrabold uppercase">LEMBAR KERJA DIAGNOSIS DATA AWAL & AKAR MASALAH KONTEKSTUAL</h2>
            <h3 className="text-xs font-bold text-amber-800">
              FOKUS: REALITAS KELAS, ANALISIS 5-WHYS & TINDAK LANJUT SUPERVISI
            </h3>
          </div>

          {/* Identity Table */}
          <table className="w-full text-xs mb-4 border-collapse">
            <tbody>
              <tr>
                <td className="w-1/4 py-1 font-semibold">Satuan Pendidikan</td>
                <td className="w-4 py-1">:</td>
                <td className="w-1/4 py-1">{selectedRecordForDetail.schoolName}</td>
                <td className="w-1/4 py-1 font-semibold">Tanggal Diagnosis</td>
                <td className="w-4 py-1">:</td>
                <td className="w-1/4 py-1">{selectedRecordForDetail.date}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">Guru Sasaran</td>
                <td className="py-1">:</td>
                <td className="py-1 font-bold">{selectedRecordForDetail.teacherName || 'Umum'}</td>
                <td className="py-1 font-semibold">Mata Pelajaran</td>
                <td className="py-1">:</td>
                <td className="py-1">{selectedRecordForDetail.subject || '-'} ({selectedRecordForDetail.gradeClass || '-'})</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">Kategori Masalah</td>
                <td className="py-1">:</td>
                <td className="py-1">{CONTEXTUAL_CATEGORY_LABELS[selectedRecordForDetail.problemCategory]?.label}</td>
                <td className="py-1 font-semibold">Tingkat Urgensi</td>
                <td className="py-1">:</td>
                <td className="py-1 font-bold">Prioritas {selectedRecordForDetail.severity}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">Pernyataan Masalah</td>
                <td className="py-1">:</td>
                <td colSpan={4} className="py-1 font-bold text-amber-900">{selectedRecordForDetail.problemTitle}</td>
              </tr>
            </tbody>
          </table>

          {/* Section 1: Data Awal */}
          <h4 className="text-xs font-bold uppercase bg-slate-800 text-white px-2 py-1 mb-2">
            I. Data Awal Kontekstual (Fakta Nyata Lapangan)
          </h4>
          <div className="border border-slate-300 p-3 mb-4 rounded text-xs space-y-2">
            <p className="leading-relaxed">{selectedRecordForDetail.baselineDataEvidence}</p>
            <p className="text-[11px] text-slate-600 font-semibold">
              Sumber Data: {selectedRecordForDetail.dataSources.map((ds) => CONTEXTUAL_DATA_SOURCE_LABELS[ds] || ds).join(', ')}
            </p>
          </div>

          {/* Section 2: 5 Dimensi Akar Masalah */}
          <h4 className="text-xs font-bold uppercase bg-slate-800 text-white px-2 py-1 mb-2">
            II. Analisis 5 Dimensi Akar Masalah
          </h4>
          <table className="w-full text-[11px] border border-slate-300 mb-4 border-collapse">
            <tbody>
              <tr>
                <td className="border border-slate-300 p-1.5 font-bold w-1/3">1. Metode & Pedagogi Guru</td>
                <td className="border border-slate-300 p-1.5">{selectedRecordForDetail.rootCauses.aspekMetodeGuru || '-'}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5 font-bold">2. Kesiapan Perencanaan Modul</td>
                <td className="border border-slate-300 p-1.5">{selectedRecordForDetail.rootCauses.aspekPerencanaanModul || '-'}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5 font-bold">3. Pengelolaan Kelas & Waktu</td>
                <td className="border border-slate-300 p-1.5">{selectedRecordForDetail.rootCauses.aspekPengelolaanKelas || '-'}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5 font-bold">4. Karakteristik Murid</td>
                <td className="border border-slate-300 p-1.5">{selectedRecordForDetail.rootCauses.aspekKarakteristikMurid || '-'}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5 font-bold">5. Sarana & Daya Dukung</td>
                <td className="border border-slate-300 p-1.5">{selectedRecordForDetail.rootCauses.aspekDayaDukung || '-'}</td>
              </tr>
            </tbody>
          </table>

          {/* Section 3: 3-Whys */}
          <h4 className="text-xs font-bold uppercase bg-slate-800 text-white px-2 py-1 mb-2">
            III. Rantai Analisis 3-Whys
          </h4>
          <div className="border border-slate-300 p-3 mb-4 rounded text-xs space-y-1">
            <p><strong>Mengapa 1:</strong> {selectedRecordForDetail.fiveWhys.why1}</p>
            <p><strong>Mengapa 2:</strong> {selectedRecordForDetail.fiveWhys.why2}</p>
            <p><strong>Mengapa 3 (Akar Utama):</strong> <strong className="text-amber-900">{selectedRecordForDetail.fiveWhys.why3}</strong></p>
          </div>

          {/* Section 4: Resep Supervisi */}
          <h4 className="text-xs font-bold uppercase bg-slate-800 text-white px-2 py-1 mb-2">
            IV. Resep Solusi Supervisi & Rencana Aksi Pengawas
          </h4>
          <div className="border border-slate-300 p-3 mb-8 rounded text-xs space-y-1">
            <p><strong>Bentuk Pendampingan:</strong> {selectedRecordForDetail.recommendedIntervention.supervisionAction}</p>
            <p><strong>Target Waktu:</strong> {selectedRecordForDetail.recommendedIntervention.targetTimeline}</p>
            <p><strong>Langkah Aksi:</strong></p>
            <ol className="list-decimal pl-5 space-y-0.5">
              {selectedRecordForDetail.recommendedIntervention.actionDetails.map((act, idx) => (
                <li key={idx}>{act}</li>
              ))}
            </ol>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 text-center text-xs mt-8">
            <div>
              Mengetahui,<br />
              Kepala Satuan Pendidikan<br /><br /><br /><br />
              <strong>{selectedRecordForDetail.headmasterName || settings.pengawasPembinaName || 'Dra. Hj. Nurhasanah, M.Pd.'}</strong><br />
              NIP. {selectedRecordForDetail.headmasterNip || settings.pengawasPembinaNip || '19720815 199802 2 003'}
            </div>
            <div>
              Guru Sasaran / Dampingan<br /><br /><br /><br />
              <strong>{selectedRecordForDetail.teacherName || 'Perwakilan Guru'}</strong><br />
              NIP. {selectedRecordForDetail.teacherNip || '-'}
            </div>
            <div>
              {settings.schoolCity || 'Kabupaten Sidenreng Rappang'}, {selectedRecordForDetail.date}<br />
              Pengawas Sekolah Pembina<br /><br /><br /><br />
              <strong>{selectedRecordForDetail.assessorName}</strong><br />
              NIP. {selectedRecordForDetail.assessorNip}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
