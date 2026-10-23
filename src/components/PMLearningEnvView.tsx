/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
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
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Heart,
  TrendingUp,
  School,
  X,
  Save,
  RotateCcw,
  Compass,
  Smile,
  Timer,
  ChevronRight,
  Maximize2,
  Laptop
} from 'lucide-react';
import {
  PMLearningEnvRecord,
  PM_LEARNING_ENV_RUBRICS,
  Teacher,
  AppSettings,
  SupervisionRecord
} from '../types/inspiro';
import { UserRoleProfile } from '../services/firebase';
import { exportLearningEnvToWord } from '../utils/learningEnvExport';
import { printDocumentElement } from '../utils/documentExport';

interface PMLearningEnvViewProps {
  records: PMLearningEnvRecord[];
  teachers: Teacher[];
  settings: AppSettings;
  currentUser: UserRoleProfile | null;
  onSaveRecord: (record: PMLearningEnvRecord) => void;
  onDeleteRecord: (id: string) => void;
  onNavigateToPedagogicalPM?: () => void;
  onNavigateToDigitalPM?: () => void;
  showToast: (title: string, desc?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const PMLearningEnvView: React.FC<PMLearningEnvViewProps> = ({
  records,
  teachers,
  settings,
  currentUser,
  onSaveRecord,
  onDeleteRecord,
  onNavigateToPedagogicalPM,
  onNavigateToDigitalPM,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [maturityFilter, setMaturityFilter] = useState('all');

  // Modal & Detail states
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<PMLearningEnvRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'identity' | 'psychology' | 'time' | 'agency_space' | 'recommendations'>('identity');
  const [formRecord, setFormRecord] = useState<PMLearningEnvRecord | null>(null);

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

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        r.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.topic && r.topic.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchSchool = schoolFilter === 'all' || r.schoolName === schoolFilter;
      const matchMaturity = maturityFilter === 'all' || r.maturityLevel.includes(maturityFilter);

      return matchSearch && matchSchool && matchMaturity;
    });
  }, [records, searchTerm, schoolFilter, maturityFilter]);

  // High-level Analytics
  const stats = useMemo(() => {
    const total = records.length;
    if (total === 0) {
      return {
        total: 0,
        avgScore: 0,
        avgActiveRatio: 0,
        psychologicalIndex: 0,
        maturityCounts: { level1: 0, level2: 0, level3: 0, level4: 0 }
      };
    }

    const avgScore = records.reduce((acc, r) => acc + r.totalScore, 0) / total;
    const avgActiveRatio =
      records.reduce((acc, r) => acc + (r.dim2TimeEfficiency.tracker.activeTimeRatioPct || 0), 0) / total;

    let totalChecklistItems = 0;
    let fulfilledChecklistItems = 0;
    records.forEach((r) => {
      const c = r.dim1Psychological.checklist;
      totalChecklistItems += 5;
      if (c.expressWithoutFear) fulfilledChecklistItems++;
      if (c.mistakesAsLearning) fulfilledChecklistItems++;
      if (c.noBullyingSarcasm) fulfilledChecklistItems++;
      if (c.kseEmotionalRegulation) fulfilledChecklistItems++;
      if (c.mutualSupport) fulfilledChecklistItems++;
    });

    const psychologicalIndex = (fulfilledChecklistItems / (totalChecklistItems || 1)) * 100;

    const maturityCounts = {
      level1: records.filter((r) => r.maturityLevel.includes('Level 1')).length,
      level2: records.filter((r) => r.maturityLevel.includes('Level 2')).length,
      level3: records.filter((r) => r.maturityLevel.includes('Level 3')).length,
      level4: records.filter((r) => r.maturityLevel.includes('Level 4')).length
    };

    return {
      total,
      avgScore: Number(avgScore.toFixed(1)),
      avgActiveRatio: Number(avgActiveRatio.toFixed(1)),
      psychologicalIndex: Number(psychologicalIndex.toFixed(1)),
      maturityCounts
    };
  }, [records]);

  // Initialize new record form
  const handleOpenCreate = () => {
    const defaultTeacher = teachers[0] || {
      id: 'G001',
      nama: 'Guru Pembina',
      nip: '-',
      mapel: 'Umum',
      kelas: 'VII',
      satuanPendidikan: settings.schoolName || 'SMP Binaan'
    };

    const newRec: PMLearningEnvRecord = {
      id: `ple-${Date.now()}`,
      schoolName: defaultTeacher.satuanPendidikan || settings.schoolName || 'SMP Binaan',
      teacherId: defaultTeacher.id,
      teacherName: defaultTeacher.nama,
      teacherNip: defaultTeacher.nip,
      subject: defaultTeacher.mapel || 'Matematika',
      gradeClass: defaultTeacher.kelas || 'VII (Fase D)',
      topic: 'Penerapan Pembelajaran Mendalam (Deep Learning)',
      date: new Date().toISOString().split('T')[0],
      assessorName: settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
      assessorRole: 'Pengawas Sekolah',
      assessorNip: settings.supervisorNip || '19820415 200801 1 007',
      headmasterName: settings.pengawasPembinaName || 'Dra. Hj. Nurhasanah, M.Pd.',
      headmasterNip: settings.pengawasPembinaNip || '19720815 199802 2 003',

      dim1Psychological: {
        score: 3,
        level: 'Matang',
        checklist: {
          expressWithoutFear: true,
          mistakesAsLearning: true,
          noBullyingSarcasm: true,
          kseEmotionalRegulation: true,
          mutualSupport: true
        },
        notes: 'Suasana kelas kondusif dan saling menghargai. Murid berani mengutarakan pendapat tanpa takut dicela.',
        evidenceNotes: 'Terdokumentasi kesepakatan kelas yang dipajang dan diaplikasikan secara konsisten.'
      },

      dim2TimeEfficiency: {
        score: 3,
        level: 'Matang',
        tracker: {
          totalLessonDuration: 80,
          activeLearningMinutes: 56,
          teacherTalkMinutes: 16,
          transitionAdminMinutes: 6,
          deadTimeMinutes: 2,
          activeTimeRatioPct: 70.0,
          pacingSmoothness: 'Cukup Lancar'
        },
        notes: 'Alokasi waktu belajar aktif murid mencapai 70%. Ceramah guru terukur dan transisi berjalan efektif.',
        evidenceNotes: 'Waktu transisi menggunakan visual timer berjalan mulus.'
      },

      dim3StudentAgency: {
        score: 3,
        level: 'Matang',
        indicators: {
          voiceAndChoice: true,
          selfGoalSetting: true,
          metacognitiveReflection: true
        },
        notes: 'Murid diberikan pilihan bentuk produk tugas dan terlibat dalam refleksi diri akhir sesi.',
        evidenceNotes: 'Variasi hasil kerja kelompok menunjukkan kemerdekaan berekspresi murid.'
      },

      dim4PhysicalSpatial: {
        score: 3,
        level: 'Matang',
        spatial: {
          flexibleSeating: true,
          accessibleResources: true,
          beyondClassroom: false
        },
        notes: 'Penataan meja kursi dinamis memfasilitasi kerja kelompok kolaboratif.',
        evidenceNotes: 'Alat peraga dan bahan bacaan mudah dijangkau murid secara mandiri.'
      },

      totalScore: 75.0,
      maturityLevel: 'Level 3: Matang',
      timeEfficiencyCategory: 'Sangat Efisien (Optimal)',
      psychologicalClimateCategory: 'Sangat Aman & Kondusif',
      keyStrengths: [
        'Keamanan emosional terbangun baik; murid aktif berpartisipasi tanpa cemas berbuat salah.',
        'Waktu belajar aktif murid teralokasi di atas 65% durasi tatap muka.'
      ],
      keyGrowthAreas: [
        'Optimalisasi pemanfaatan lingkungan luar kelas atau keterhubungan dengan konteks dunia nyata.',
        'Mendorong keterlibatan murid dalam penetapan target belajar mandiri.'
      ],
      supervisoryRecommendations: [
        'Pertahankan iklim emosional positif dan integrasikan rehat KSE secara teratur pada sesi berdurasi panjang.',
        'Tingkatkan efisiensi alokasi waktu transisi menggunakan countdown timer digital.'
      ],
      status: 'final',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setFormRecord(newRec);
    setActiveFormTab('identity');
    setIsFormModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (rec: PMLearningEnvRecord) => {
    setFormRecord(JSON.parse(JSON.stringify(rec)));
    setActiveFormTab('identity');
    setIsFormModalOpen(true);
  };

  // Handle teacher change in form
  const handleFormTeacherChange = (teacherId: string) => {
    if (!formRecord) return;
    const teacher = teachers.find((t) => t.id === teacherId);
    if (!teacher) return;
    setFormRecord({
      ...formRecord,
      teacherId: teacher.id,
      teacherName: teacher.nama,
      teacherNip: teacher.nip,
      schoolName: teacher.satuanPendidikan,
      subject: teacher.mapel,
      gradeClass: teacher.kelas
    });
  };

  // Live Recalculate Time Tracker & Overall Score
  const recalculateFormMetrics = (draft: PMLearningEnvRecord): PMLearningEnvRecord => {
    const totalDuration = draft.dim2TimeEfficiency.tracker.totalLessonDuration || 80;
    const activeMins = draft.dim2TimeEfficiency.tracker.activeLearningMinutes || 0;
    const ratio = totalDuration > 0 ? Number(((activeMins / totalDuration) * 100).toFixed(1)) : 0;

    draft.dim2TimeEfficiency.tracker.activeTimeRatioPct = ratio;

    // Time efficiency category
    if (ratio >= 70) {
      draft.timeEfficiencyCategory = 'Sangat Efisien (Optimal)';
    } else if (ratio >= 55) {
      draft.timeEfficiencyCategory = 'Cukup Efisien';
    } else {
      draft.timeEfficiencyCategory = 'Kurang Efisien (Butuh Pemangkasan Ceramah)';
    }

    // Psychological climate category
    const checks = draft.dim1Psychological.checklist;
    const trueCount = Object.values(checks).filter(Boolean).length;
    if (trueCount >= 4) {
      draft.psychologicalClimateCategory = 'Sangat Aman & Kondusif';
    } else if (trueCount >= 3) {
      draft.psychologicalClimateCategory = 'Cukup Nyaman';
    } else {
      draft.psychologicalClimateCategory = 'Perlu Penguatan Rasa Aman';
    }

    // Overall Score (each dimension is 25% = score * 6.25)
    const s1 = draft.dim1Psychological.score * 6.25;
    const s2 = draft.dim2TimeEfficiency.score * 6.25;
    const s3 = draft.dim3StudentAgency.score * 6.25;
    const s4 = draft.dim4PhysicalSpatial.score * 6.25;
    const total = Number((s1 + s2 + s3 + s4).toFixed(1));
    draft.totalScore = total;

    // Maturity Level
    if (total >= 85) {
      draft.maturityLevel = 'Level 4: Membudaya';
    } else if (total >= 70) {
      draft.maturityLevel = 'Level 3: Matang';
    } else if (total >= 50) {
      draft.maturityLevel = 'Level 2: Berkembang';
    } else {
      draft.maturityLevel = 'Level 1: Terbatas';
    }

    return draft;
  };

  // Save Form
  const handleSaveForm = () => {
    if (!formRecord) return;
    const updated = recalculateFormMetrics({ ...formRecord });
    onSaveRecord(updated);
    setIsFormModalOpen(false);
    showToast('Berhasil Menyimpan', `Asesmen Lingkungan Belajar ${updated.teacherName} telah disimpan.`);
  };

  // Helper for Print
  const handlePrint = (record: PMLearningEnvRecord) => {
    setSelectedRecordForDetail(record);
    setTimeout(() => {
      printDocumentElement('printable-learning-env-doc', `Evaluasi_Lingkungan_Belajar_${record.teacherName}`);
    }, 150);
  };

  // Helper for Word Export
  const handleExportWord = (record: PMLearningEnvRecord) => {
    exportLearningEnvToWord(record, settings);
    showToast('Mengunduh Dokumen Word', `Berkas evaluasi ${record.teacherName} sedang diunduh.`);
  };

  const getMaturityBadgeStyle = (level: string) => {
    if (level.includes('Membudaya')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (level.includes('Matang')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (level.includes('Berkembang')) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-rose-100 text-rose-800 border-rose-300';
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-teal-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-teal-700/30">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold uppercase tracking-wider border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Program PM · Elemen Lingkungan Pembelajaran (Learning Environment)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Iklim Psikologis & Efisiensi Waktu Belajar</span>
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Instrumen evaluasi dan pendampingan lingkungan belajar mendalam (*NPDL Deep Learning*) di sekolah binaan{' '}
              <strong className="text-teal-200">Kabupaten Sidenreng Rappang</strong>. Fokus pada{' '}
              <strong className="text-white">Keamanan Emosional Murid (Psychological Safety)</strong> dan{' '}
              <strong className="text-white">Efisiensi Alokasi Waktu Belajar Aktif (&gt;= 70%)</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onNavigateToDigitalPM && (
              <button
                onClick={onNavigateToDigitalPM}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition border border-slate-700 shadow-sm"
              >
                <Laptop className="w-4 h-4 text-cyan-400" />
                <span>PM: Pemanfaatan Digital</span>
              </button>
            )}

            {onNavigateToPedagogicalPM && (
              <button
                onClick={onNavigateToPedagogicalPM}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition border border-slate-700 shadow-sm"
              >
                <Compass className="w-4 h-4 text-teal-400" />
                <span>PM: Praktik Pedagogis</span>
              </button>
            )}

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-teal-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Input Observasi Lingkungan Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* EXECUTIVE SUMMARY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Evaluasi */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Observasi Kelas</div>
            <div className="text-2xl font-black text-slate-800">{stats.total}</div>
            <div className="text-xs text-slate-500">Guru Binaan Terekam</div>
          </div>
        </div>

        {/* Skor Rata-Rata PM */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Rata-Rata Skor Lingkungan</div>
            <div className="text-2xl font-black text-indigo-700">{stats.avgScore} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
            <div className="text-xs text-slate-500">Kategori Matang & Membudaya</div>
          </div>
        </div>

        {/* Rasio Belajar Aktif (Efisiensi Waktu) */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Rasio Belajar Aktif</div>
            <div className="text-2xl font-black text-blue-700">{stats.avgActiveRatio}%</div>
            <div className="text-xs text-slate-500">Target Ideal ≥ 70% Alokasi Sesi</div>
          </div>
        </div>

        {/* Indeks Keamanan Emosional */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Indeks Keamanan Emosional</div>
            <div className="text-2xl font-black text-emerald-700">{stats.psychologicalIndex}%</div>
            <div className="text-xs text-slate-500">5 Sinyal Psikologis Terpenuhi</div>
          </div>
        </div>
      </div>

      {/* HIGHLIGHT BANNER: IKLIM PSIKOLOGIS & EFISIENSI WAKTU */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card: 5 Sinyal Keamanan Psikologis Kelas */}
        <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 rounded-xl p-5 border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Smile className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">5 Sinyal Keamanan Emosional Kelas</h3>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Psychological Safety
            </span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Bebas Dari Rasa Cemas:</strong> Murid berani bertanya, mengoreksi, dan mengutarakan ide tanpa takut dihakimi.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Growth Mindset:</strong> Kesalahan saat menjawab diperlakukan sebagai peluang eksplorasi pengetahuan, bukan kegagalan.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Zero Sarkasme:</strong> Ketiadaan ejekan atau sindiran halus, baik dari guru maupun sesama rekan sebaya.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Regulasi Emosi (KSE):</strong> Guru memfasilitasi rehat emosi singkat (Teknik STOP / Roda Emosi) saat tensi belajar tinggi.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Kultur Saling Dukung:</strong> Murid saling mengapresiasi dan menunjukkan empati saat kerja kelompok.</span>
            </li>
          </ul>
        </div>

        {/* Card: Manajemen Alokasi Waktu Belajar Aktif */}
        <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/40 rounded-xl p-5 border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Timer className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Manajemen Efisiensi Waktu (Time-Chunking)</h3>
            </div>
            <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
              Active Ratio ≥ 70%
            </span>
          </div>
          <div className="space-y-3">
            <div className="text-xs text-slate-600 leading-relaxed">
              Formula efisiensi waktu pembelajaran mendalam mengukur alokasi waktu tatap muka ke dalam 4 kuadran durasi nyata:
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-semibold text-emerald-700">1. Belajar Aktif Murid (Diskusi/Praktik/Projek)</span>
                <span className="font-bold">Target ≥ 70% (56-65 Menit)</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden flex">
                <div className="bg-emerald-500 h-2.5" style={{ width: '70%' }} title="Belajar Aktif" />
                <div className="bg-amber-400 h-2.5" style={{ width: '18%' }} title="Ceramah Guru" />
                <div className="bg-indigo-400 h-2.5" style={{ width: '8%' }} title="Transisi" />
                <div className="bg-rose-400 h-2.5" style={{ width: '4%' }} title="Dead Time" />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-500">
                <div><span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1" />Ceramah Guru ≤ 18%</div>
                <div><span className="inline-block w-2 h-2 rounded-full bg-indigo-400 mr-1" />Transisi Sesi ≤ 8%</div>
                <div><span className="inline-block w-2 h-2 rounded-full bg-rose-400 mr-1" />Dead Time ≤ 4%</div>
              </div>
            </div>
            <div className="text-xs text-slate-700 pt-1">
              <strong>Kunci Keberhasilan:</strong> Penggunaan aba-aba visual timer, eliminasi antrian pengambilan alat/media, dan pembagian peran anggota kelompok sejak awal.
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama guru, mapel, materi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* School filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <School className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-teal-500"
            >
              <option value="all">Semua Satuan Pendidikan</option>
              {availableSchools.map((sch) => (
                <option key={sch} value={sch}>
                  {sch}
                </option>
              ))}
            </select>
          </div>

          {/* Maturity filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <select
              value={maturityFilter}
              onChange={(e) => setMaturityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-teal-500"
            >
              <option value="all">Semua Tingkat Kematangan</option>
              <option value="Level 4">Level 4: Membudaya</option>
              <option value="Level 3">Level 3: Matang</option>
              <option value="Level 2">Level 2: Berkembang</option>
              <option value="Level 1">Level 1: Terbatas</option>
            </select>
          </div>

          {(searchTerm || schoolFilter !== 'all' || maturityFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSchoolFilter('all');
                setMaturityFilter('all');
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
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Belum Ada Data Observasi Lingkungan Belajar</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Mulai rekam pengamatan iklim emosional dan efisiensi alokasi waktu pembelajaran mendalam untuk guru binaan Anda.
            </p>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Input Observasi Pertama</span>
            </button>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const tracker = record.dim2TimeEfficiency.tracker;
            const activeRatio = tracker.activeTimeRatioPct || 0;

            return (
              <div
                key={record.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {record.schoolName}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                        {record.subject} · {record.gradeClass}
                      </span>
                      <span className={`text-xs font-bold px-3 py-0.5 rounded-full border ${getMaturityBadgeStyle(record.maturityLevel)}`}>
                        {record.maturityLevel}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{record.teacherName}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <span>NIP: {record.teacherNip || '-'}</span>
                      <span>•</span>
                      <span>Materi: <strong>{record.topic || 'Pembelajaran Mendalam'}</strong></span>
                      <span>•</span>
                      <span>Tanggal: {record.date}</span>
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-semibold transition border border-teal-200"
                      title="Cetak Berkas Resmi"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak</span>
                    </button>

                    <button
                      onClick={() => handleOpenEdit(record)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="Edit Data"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus evaluasi lingkungan belajar ${record.teacherName}?`)) {
                          onDeleteRecord(record.id);
                          showToast('Data Dihapus', `Evaluasi ${record.teacherName} telah dihapus.`);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Score and Metric Gauges */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Gauge 1: Total Skor & Predikat */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Skor Keseluruhan PM</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">{record.totalScore.toFixed(1)}</span>
                      <span className="text-xs text-slate-500">/ 100 Poin</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-700">
                      Pengawas: {record.assessorName}
                    </div>
                  </div>

                  {/* Gauge 2: Keamanan Psikologis (Iklim Emosional) */}
                  <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Keamanan Emosional</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                        Skor {record.dim1Psychological.score} / 4
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-emerald-900">
                      {record.psychologicalClimateCategory}
                    </div>
                    {/* Visual 5 signals dots */}
                    <div className="flex items-center gap-1 pt-1">
                      {Object.entries(record.dim1Psychological.checklist).map(([key, val]) => (
                        <span
                          key={key}
                          title={val ? 'Sinyal Terpenuhi' : 'Belum Terpenuhi'}
                          className={`w-3 h-3 rounded-full ${val ? 'bg-emerald-500' : 'bg-slate-200'}`}
                        />
                      ))}
                      <span className="text-[10px] text-slate-500 ml-1.5">5 Sinyal Psikologis</span>
                    </div>
                  </div>

                  {/* Gauge 3: Efisiensi Alokasi Waktu Belajar */}
                  <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Waktu Belajar Aktif</span>
                      </div>
                      <span className="text-xs font-bold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded">
                        {activeRatio.toFixed(1)}% (Skor {record.dim2TimeEfficiency.score}/4)
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-blue-900">
                      {record.timeEfficiencyCategory}
                    </div>
                    {/* Visual Time Distribution Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-2"
                          style={{ width: `${(tracker.activeLearningMinutes / (tracker.totalLessonDuration || 80)) * 100}%` }}
                          title={`Aktif: ${tracker.activeLearningMinutes}m`}
                        />
                        <div
                          className="bg-amber-400 h-2"
                          style={{ width: `${(tracker.teacherTalkMinutes / (tracker.totalLessonDuration || 80)) * 100}%` }}
                          title={`Ceramah: ${tracker.teacherTalkMinutes}m`}
                        />
                        <div
                          className="bg-indigo-400 h-2"
                          style={{ width: `${(tracker.transitionAdminMinutes / (tracker.totalLessonDuration || 80)) * 100}%` }}
                          title={`Transisi: ${tracker.transitionAdminMinutes}m`}
                        />
                        <div
                          className="bg-rose-400 h-2"
                          style={{ width: `${(tracker.deadTimeMinutes / (tracker.totalLessonDuration || 80)) * 100}%` }}
                          title={`Dead Time: ${tracker.deadTimeMinutes}m`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Aktif: {tracker.activeLearningMinutes}m</span>
                        <span>Ceramah: {tracker.teacherTalkMinutes}m</span>
                        <span>Ritme: {tracker.pacingSmoothness}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Highlights and Quick Strengths */}
                <div className="bg-slate-50/80 rounded-xl p-3 text-xs text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                    <span><strong>Kekuatan Utama:</strong> {record.keyStrengths[0] || record.dim1Psychological.notes}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedRecordForDetail(record);
                      setIsDetailOpen(true);
                    }}
                    className="text-teal-700 font-semibold hover:underline shrink-0 flex items-center gap-1"
                  >
                    <span>Pelajari Selengkapnya</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
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
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getMaturityBadgeStyle(selectedRecordForDetail.maturityLevel)}`}>
                    {selectedRecordForDetail.maturityLevel}
                  </span>
                  <span className="text-xs text-slate-400">• {selectedRecordForDetail.schoolName}</span>
                </div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>{selectedRecordForDetail.teacherName}</span>
                  <span className="text-sm font-normal text-teal-300">({selectedRecordForDetail.subject})</span>
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
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
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

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-sm">
              {/* Identity Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold uppercase">Mata Pelajaran</span>
                  <span className="font-bold text-slate-800">{selectedRecordForDetail.subject}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase">Kelas / Rombel</span>
                  <span className="font-bold text-slate-800">{selectedRecordForDetail.gradeClass}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase">Tanggal Observasi</span>
                  <span className="font-bold text-slate-800">{selectedRecordForDetail.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase">Pengawas Pembina</span>
                  <span className="font-bold text-slate-800">{selectedRecordForDetail.assessorName}</span>
                </div>
              </div>

              {/* Dimensi 1: Iklim Psikologis & Keamanan Emosional */}
              <div className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smile className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-slate-900 text-base">I. Iklim Psikologis & Keamanan Emosional (25 Poin)</h3>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Skor: {selectedRecordForDetail.dim1Psychological.score} / 4 ({selectedRecordForDetail.dim1Psychological.level})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries({
                    expressWithoutFear: 'Bebas Berpendapat Tanpa Cemas Dihakimi',
                    mistakesAsLearning: 'Kesalahan Diperlakukan Sebagai Peluang Belajar (Growth Mindset)',
                    noBullyingSarcasm: 'Bebas Intimidasi, Cemoohan & Sindiran Sarkastik',
                    kseEmotionalRegulation: 'Integrasi Regulasi Emosi / KSE (Teknik STOP / Roda Emosi)',
                    mutualSupport: 'Budaya Empati & Saling Mendukung Antar Murid'
                  }).map(([key, label]) => {
                    const checked = selectedRecordForDetail.dim1Psychological.checklist[key as keyof typeof selectedRecordForDetail.dim1Psychological.checklist];
                    return (
                      <div
                        key={key}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border ${
                          checked ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 ${checked ? 'text-emerald-700' : 'text-slate-300'}`} />
                        <span>{label}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-1.5 text-xs">
                  <p><strong>Catatan Pengamatan:</strong> {selectedRecordForDetail.dim1Psychological.notes}</p>
                  {selectedRecordForDetail.dim1Psychological.evidenceNotes && (
                    <p className="text-slate-600"><strong>Bukti Perilaku:</strong> {selectedRecordForDetail.dim1Psychological.evidenceNotes}</p>
                  )}
                </div>
              </div>

              {/* Dimensi 2: Efisiensi Alokasi Waktu Belajar */}
              <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-slate-900 text-base">II. Efisiensi Alokasi Waktu Belajar & Ritme Kelas (25 Poin)</h3>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                    Skor: {selectedRecordForDetail.dim2TimeEfficiency.score} / 4 ({selectedRecordForDetail.dim2TimeEfficiency.level})
                  </span>
                </div>

                {/* Time breakdown details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-3 bg-emerald-100/60 rounded-xl border border-emerald-200">
                    <div className="text-[11px] text-emerald-800 font-semibold uppercase">Belajar Aktif Murid</div>
                    <div className="text-xl font-black text-emerald-900">{selectedRecordForDetail.dim2TimeEfficiency.tracker.activeLearningMinutes} Menit</div>
                    <div className="text-[10px] text-emerald-700">Rasio: {selectedRecordForDetail.dim2TimeEfficiency.tracker.activeTimeRatioPct.toFixed(1)}%</div>
                  </div>
                  <div className="p-3 bg-amber-100/60 rounded-xl border border-amber-200">
                    <div className="text-[11px] text-amber-800 font-semibold uppercase">Ceramah / Instruksi Guru</div>
                    <div className="text-xl font-black text-amber-900">{selectedRecordForDetail.dim2TimeEfficiency.tracker.teacherTalkMinutes} Menit</div>
                    <div className="text-[10px] text-amber-700">Monolog satu arah</div>
                  </div>
                  <div className="p-3 bg-indigo-100/60 rounded-xl border border-indigo-200">
                    <div className="text-[11px] text-indigo-800 font-semibold uppercase">Transisi & Administrasi</div>
                    <div className="text-xl font-black text-indigo-900">{selectedRecordForDetail.dim2TimeEfficiency.tracker.transitionAdminMinutes} Menit</div>
                    <div className="text-[10px] text-indigo-700">Peralihan kelompok</div>
                  </div>
                  <div className="p-3 bg-rose-100/60 rounded-xl border border-rose-200">
                    <div className="text-[11px] text-rose-800 font-semibold uppercase">Jeda Hampa (Dead Time)</div>
                    <div className="text-xl font-black text-rose-900">{selectedRecordForDetail.dim2TimeEfficiency.tracker.deadTimeMinutes} Menit</div>
                    <div className="text-[10px] text-rose-700">Menunggu / Distraksi</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p><strong>Kelancaran Ritme (Pacing):</strong> <span className="font-semibold text-blue-900">{selectedRecordForDetail.dim2TimeEfficiency.tracker.pacingSmoothness}</span></p>
                  <p><strong>Catatan Supervisi Waktu:</strong> {selectedRecordForDetail.dim2TimeEfficiency.notes}</p>
                </div>
              </div>

              {/* Dimensi 3 & 4: Agensi & Tata Ruang */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Agensi Murid */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-800 flex items-center justify-between">
                    <span>III. Kultur Agensi & Suara Murid</span>
                    <span className="font-bold text-teal-700">Skor: {selectedRecordForDetail.dim3StudentAgency.score}/4</span>
                  </h4>
                  <ul className="space-y-1 text-slate-600">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${selectedRecordForDetail.dim3StudentAgency.indicators.voiceAndChoice ? 'text-teal-600' : 'text-slate-300'}`} />
                      <span>Voice & Choice (Pilihan Bentuk Tugas/Produk)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${selectedRecordForDetail.dim3StudentAgency.indicators.selfGoalSetting ? 'text-teal-600' : 'text-slate-300'}`} />
                      <span>Penetapan Target Belajar Mandiri</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${selectedRecordForDetail.dim3StudentAgency.indicators.metacognitiveReflection ? 'text-teal-600' : 'text-slate-300'}`} />
                      <span>Refleksi Metakognitif Mandiri</span>
                    </li>
                  </ul>
                  <p className="pt-1 text-slate-700">{selectedRecordForDetail.dim3StudentAgency.notes}</p>
                </div>

                {/* Fleksibilitas Tata Ruang */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-800 flex items-center justify-between">
                    <span>IV. Fleksibilitas Tata Ruang</span>
                    <span className="font-bold text-teal-700">Skor: {selectedRecordForDetail.dim4PhysicalSpatial.score}/4</span>
                  </h4>
                  <ul className="space-y-1 text-slate-600">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${selectedRecordForDetail.dim4PhysicalSpatial.spatial.flexibleSeating ? 'text-teal-600' : 'text-slate-300'}`} />
                      <span>Penataan Meja-Kursi Fleksibel Kolaboratif</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${selectedRecordForDetail.dim4PhysicalSpatial.spatial.accessibleResources ? 'text-teal-600' : 'text-slate-300'}`} />
                      <span>Akses Mandiri Sumber & Alat Belajar</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${selectedRecordForDetail.dim4PhysicalSpatial.spatial.beyondClassroom ? 'text-teal-600' : 'text-slate-300'}`} />
                      <span>Pemanfaatan Ruang Luar / Konteks Nyata</span>
                    </li>
                  </ul>
                  <p className="pt-1 text-slate-700">{selectedRecordForDetail.dim4PhysicalSpatial.notes}</p>
                </div>
              </div>

              {/* Rekomendasi Supervisi */}
              <div className="bg-teal-50/60 rounded-xl p-5 border border-teal-200 space-y-3">
                <h4 className="font-bold text-teal-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>Rekomendasi Tindak Lanjut Pengawas Pembina</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 block">Kekuatan Unggulan:</span>
                    <ul className="list-disc pl-5 text-slate-700 space-y-0.5">
                      {selectedRecordForDetail.keyStrengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block">Area Peningkatan Prioritas:</span>
                    <ul className="list-disc pl-5 text-slate-700 space-y-0.5">
                      {selectedRecordForDetail.keyGrowthAreas.map((g, idx) => (
                        <li key={idx}>{g}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block">Rekomendasi Strategis:</span>
                    <ul className="list-disc pl-5 text-teal-900 space-y-0.5">
                      {selectedRecordForDetail.supervisoryRecommendations.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
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
            <div className="p-5 bg-teal-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-300" />
                  <span>Instrumen Observasi Lingkungan Belajar (PM)</span>
                </h2>
                <p className="text-xs text-teal-200">
                  Fokus: Iklim Keamanan Emosional & Efisiensi Alokasi Waktu Belajar
                </p>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-teal-200 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 shrink-0 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setActiveFormTab('identity')}
                className={`px-3 py-1.5 rounded-lg transition shrink-0 ${
                  activeFormTab === 'identity' ? 'bg-white text-teal-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Identitas Guru & Sesi
              </button>
              <button
                onClick={() => setActiveFormTab('psychology')}
                className={`px-3 py-1.5 rounded-lg transition shrink-0 flex items-center gap-1.5 ${
                  activeFormTab === 'psychology' ? 'bg-white text-emerald-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smile className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. Keamanan Emosional</span>
              </button>
              <button
                onClick={() => setActiveFormTab('time')}
                className={`px-3 py-1.5 rounded-lg transition shrink-0 flex items-center gap-1.5 ${
                  activeFormTab === 'time' ? 'bg-white text-blue-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>3. Efisiensi Waktu</span>
              </button>
              <button
                onClick={() => setActiveFormTab('agency_space')}
                className={`px-3 py-1.5 rounded-lg transition shrink-0 ${
                  activeFormTab === 'agency_space' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                4. Agensi & Tata Ruang
              </button>
              <button
                onClick={() => setActiveFormTab('recommendations')}
                className={`px-3 py-1.5 rounded-lg transition shrink-0 ${
                  activeFormTab === 'recommendations' ? 'bg-white text-purple-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                5. Diagnosis & Rekomendasi
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* TAB 1: IDENTITAS */}
              {activeFormTab === 'identity' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Pilih Guru Sasaran Observasi
                      </label>
                      <select
                        value={formRecord.teacherId}
                        onChange={(e) => handleFormTeacherChange(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
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
                        Satuan Pendidikan
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
                          value={formRecord.subject}
                          onChange={(e) => setFormRecord({ ...formRecord, subject: e.target.value })}
                          placeholder="Mapel"
                          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                        />
                        <input
                          type="text"
                          value={formRecord.gradeClass}
                          onChange={(e) => setFormRecord({ ...formRecord, gradeClass: e.target.value })}
                          placeholder="Kelas/Fase"
                          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tanggal Pengamatan
                      </label>
                      <input
                        type="date"
                        value={formRecord.date}
                        onChange={(e) => setFormRecord({ ...formRecord, date: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Topik / Materi Pembelajaran Mendalam
                      </label>
                      <input
                        type="text"
                        value={formRecord.topic}
                        onChange={(e) => setFormRecord({ ...formRecord, topic: e.target.value })}
                        placeholder="Contoh: Penerapan Eksplorasi Kontekstual & Proyek Kolaboratif"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 text-xs text-teal-900 leading-relaxed">
                    <strong>Petunjuk:</strong> Modul ini dirancang khusus untuk membedah kualitas Lingkungan Pembelajaran (*Learning Environment*) sebagai salah satu dari 4 pilar Pembelajaran Mendalam. Fokus pengamatan diarahkan pada keamanan psikologis murid saat belajar dan efisiensi waktu aktif murid.
                  </div>
                </div>
              )}

              {/* TAB 2: IKLIM PSIKOLOGIS & KEAMANAN EMOSIONAL */}
              {activeFormTab === 'psychology' && (
                <div className="space-y-5">
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 space-y-2">
                    <h3 className="font-bold text-emerald-950 flex items-center gap-2">
                      <Smile className="w-4 h-4 text-emerald-600" />
                      <span>Lembar Observasi 5 Sinyal Keamanan Psikologis Kelas</span>
                    </h3>
                    <p className="text-xs text-emerald-800">
                      Beri tanda centang pada perilaku otentik yang teramati secara nyata selama proses belajar di kelas:
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        key: 'expressWithoutFear' as const,
                        label: '1. Murid Bebas Berpendapat & Bertanya Tanpa Cemas Dihakimi',
                        desc: 'Murid berani mengangkat tangan mengajukan pertanyaan kritis atau merespon pemantik tanpa rasa ragu atau takut salah.'
                      },
                      {
                        key: 'mistakesAsLearning' as const,
                        label: '2. Kesalahan Diperlakukan Sebagai Peluang Belajar (Growth Mindset)',
                        desc: 'Saat ada jawaban keliru, guru atau teman tidak menyudutkan, melainkan membimbing untuk menemukan pola pemecahan bersama.'
                      },
                      {
                        key: 'noBullyingSarcasm' as const,
                        label: '3. Suasana Kelas Bersih Dari Ejekan, Intimidasi & Sarkasme',
                        desc: 'Tidak ada celetukan merendahkan, sindiran halus, atau intimidasi fisik maupun verbal antar sesama murid maupun guru.'
                      },
                      {
                        key: 'kseEmotionalRegulation' as const,
                        label: '4. Terdapat Integrasi Regulasi Emosi / KSE (Teknik STOP / Roda Emosi)',
                        desc: 'Guru memfasilitasi rehat emosi singkat, mindfulness, atau mengondisikan kesiapan mental murid sebelum masuk materi rumit.'
                      },
                      {
                        key: 'mutualSupport' as const,
                        label: '5. Budaya Saling Mendukung, Empati & Apresiasi Antar Murid',
                        desc: 'Murid saling membantu ketika anggota kelompoknya mengalami kesulitan tanpa mendominasi atau menyisihkan.'
                      }
                    ].map((item) => (
                      <label
                        key={item.key}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                          formRecord.dim1Psychological.checklist[item.key]
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formRecord.dim1Psychological.checklist[item.key]}
                          onChange={(e) => {
                            const updated = {
                              ...formRecord,
                              dim1Psychological: {
                                ...formRecord.dim1Psychological,
                                checklist: {
                                  ...formRecord.dim1Psychological.checklist,
                                  [item.key]: e.target.checked
                                }
                              }
                            };
                            setFormRecord(recalculateFormMetrics(updated));
                          }}
                          className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-teal-500"
                        />
                        <div>
                          <div className="font-semibold text-slate-800 text-xs sm:text-sm">{item.label}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Rubric Score Level Selector */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <label className="block text-xs font-semibold text-slate-700">
                      Penetapan Tingkat Capaian Elemen Keamanan Emosional (Skor 1 - 4)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((sc) => {
                        const rub = PM_LEARNING_ENV_RUBRICS[0].levels[sc as 1 | 2 | 3 | 4];
                        const isSelected = formRecord.dim1Psychological.score === sc;
                        return (
                          <button
                            key={sc}
                            type="button"
                            onClick={() => {
                              const updated = {
                                ...formRecord,
                                dim1Psychological: {
                                  ...formRecord.dim1Psychological,
                                  score: sc,
                                  level: rub.label as any
                                }
                              };
                              setFormRecord(recalculateFormMetrics(updated));
                            }}
                            className={`p-3 rounded-xl border text-left transition ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm font-bold'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <div className="text-xs uppercase tracking-wider opacity-80">Skor {sc}</div>
                            <div className="text-sm font-bold">{rub.label}</div>
                            <div className="text-[11px] mt-1 line-clamp-3 opacity-90">{rub.criteria}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes & Evidence */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Catatan Deskriptif Iklim Psikologis
                      </label>
                      <textarea
                        rows={3}
                        value={formRecord.dim1Psychological.notes}
                        onChange={(e) =>
                          setFormRecord({
                            ...formRecord,
                            dim1Psychological: { ...formRecord.dim1Psychological, notes: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Bukti Konkret Teramati di Kelas
                      </label>
                      <textarea
                        rows={3}
                        value={formRecord.dim1Psychological.evidenceNotes}
                        onChange={(e) =>
                          setFormRecord({
                            ...formRecord,
                            dim1Psychological: { ...formRecord.dim1Psychological, evidenceNotes: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: EFISIENSI ALOKASI WAKTU BELAJAR */}
              {activeFormTab === 'time' && (
                <div className="space-y-5">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 space-y-2">
                    <h3 className="font-bold text-blue-950 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Kalkulator & Time-Tracker Efisiensi Waktu Belajar Aktif</span>
                    </h3>
                    <p className="text-xs text-blue-800">
                      Masukkan alokasi menit nyata tiap tahapan sesi pembelajaran. Sistem otomatis mengalkulasi rasio waktu belajar aktif (*Active Learning Time Ratio*).
                    </p>
                  </div>

                  {/* Interactive Duration Inputs */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Total Alokasi (Menit)
                      </label>
                      <input
                        type="number"
                        value={formRecord.dim2TimeEfficiency.tracker.totalLessonDuration}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 80;
                          const updated = {
                            ...formRecord,
                            dim2TimeEfficiency: {
                              ...formRecord.dim2TimeEfficiency,
                              tracker: {
                                ...formRecord.dim2TimeEfficiency.tracker,
                                totalLessonDuration: val
                              }
                            }
                          };
                          setFormRecord(recalculateFormMetrics(updated));
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-emerald-700 mb-1">
                        Murid Aktif (Menit)
                      </label>
                      <input
                        type="number"
                        value={formRecord.dim2TimeEfficiency.tracker.activeLearningMinutes}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          const updated = {
                            ...formRecord,
                            dim2TimeEfficiency: {
                              ...formRecord.dim2TimeEfficiency,
                              tracker: {
                                ...formRecord.dim2TimeEfficiency.tracker,
                                activeLearningMinutes: val
                              }
                            }
                          };
                          setFormRecord(recalculateFormMetrics(updated));
                        }}
                        className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-sm font-bold text-emerald-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-amber-700 mb-1">
                        Ceramah Guru (Menit)
                      </label>
                      <input
                        type="number"
                        value={formRecord.dim2TimeEfficiency.tracker.teacherTalkMinutes}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          const updated = {
                            ...formRecord,
                            dim2TimeEfficiency: {
                              ...formRecord.dim2TimeEfficiency,
                              tracker: {
                                ...formRecord.dim2TimeEfficiency.tracker,
                                teacherTalkMinutes: val
                              }
                            }
                          };
                          setFormRecord(recalculateFormMetrics(updated));
                        }}
                        className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm font-bold text-amber-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-indigo-700 mb-1">
                        Transisi Sesi (Menit)
                      </label>
                      <input
                        type="number"
                        value={formRecord.dim2TimeEfficiency.tracker.transitionAdminMinutes}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          const updated = {
                            ...formRecord,
                            dim2TimeEfficiency: {
                              ...formRecord.dim2TimeEfficiency,
                              tracker: {
                                ...formRecord.dim2TimeEfficiency.tracker,
                                transitionAdminMinutes: val
                              }
                            }
                          };
                          setFormRecord(recalculateFormMetrics(updated));
                        }}
                        className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-lg text-sm font-bold text-indigo-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-rose-700 mb-1">
                        Dead Time / Jeda Kosong
                      </label>
                      <input
                        type="number"
                        value={formRecord.dim2TimeEfficiency.tracker.deadTimeMinutes}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          const updated = {
                            ...formRecord,
                            dim2TimeEfficiency: {
                              ...formRecord.dim2TimeEfficiency,
                              tracker: {
                                ...formRecord.dim2TimeEfficiency.tracker,
                                deadTimeMinutes: val
                              }
                            }
                          };
                          setFormRecord(recalculateFormMetrics(updated));
                        }}
                        className="w-full px-3 py-2 bg-white border border-rose-300 rounded-lg text-sm font-bold text-rose-800"
                      />
                    </div>
                  </div>

                  {/* Live Ratio Result Display */}
                  <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-xl shadow-inner flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-blue-200 uppercase font-semibold">Hasil Kalkulasi Rasio Belajar Aktif</div>
                      <div className="text-3xl font-black text-white">
                        {formRecord.dim2TimeEfficiency.tracker.activeTimeRatioPct.toFixed(1)}%
                      </div>
                      <div className="text-xs text-teal-300 font-semibold">
                        Status: {formRecord.timeEfficiencyCategory} (Target: ≥ 70%)
                      </div>
                    </div>

                    <div className="text-right">
                      <label className="block text-xs text-blue-200 mb-1">Kelancaran Ritme (Pacing)</label>
                      <select
                        value={formRecord.dim2TimeEfficiency.tracker.pacingSmoothness}
                        onChange={(e) => {
                          const updated = {
                            ...formRecord,
                            dim2TimeEfficiency: {
                              ...formRecord.dim2TimeEfficiency,
                              tracker: {
                                ...formRecord.dim2TimeEfficiency.tracker,
                                pacingSmoothness: e.target.value as any
                              }
                            }
                          };
                          setFormRecord(recalculateFormMetrics(updated));
                        }}
                        className="bg-slate-800 text-white border border-blue-400/40 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none"
                      >
                        <option value="Sangat Mulus & Dinamis">Sangat Mulus & Dinamis</option>
                        <option value="Cukup Lancar">Cukup Lancar</option>
                        <option value="Tersendat">Tersendat</option>
                      </select>
                    </div>
                  </div>

                  {/* Rubric Score Level Selector */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <label className="block text-xs font-semibold text-slate-700">
                      Penetapan Tingkat Capaian Efisiensi Waktu (Skor 1 - 4)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((sc) => {
                        const rub = PM_LEARNING_ENV_RUBRICS[1].levels[sc as 1 | 2 | 3 | 4];
                        const isSelected = formRecord.dim2TimeEfficiency.score === sc;
                        return (
                          <button
                            key={sc}
                            type="button"
                            onClick={() => {
                              const updated = {
                                ...formRecord,
                                dim2TimeEfficiency: {
                                  ...formRecord.dim2TimeEfficiency,
                                  score: sc,
                                  level: rub.label as any
                                }
                              };
                              setFormRecord(recalculateFormMetrics(updated));
                            }}
                            className={`p-3 rounded-xl border text-left transition ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-700 shadow-sm font-bold'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <div className="text-xs uppercase tracking-wider opacity-80">Skor {sc}</div>
                            <div className="text-sm font-bold">{rub.label}</div>
                            <div className="text-[11px] mt-1 line-clamp-3 opacity-90">{rub.criteria}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Catatan Evaluasi Efisiensi Waktu & Manajemen Kelas
                    </label>
                    <textarea
                      rows={3}
                      value={formRecord.dim2TimeEfficiency.notes}
                      onChange={(e) =>
                        setFormRecord({
                          ...formRecord,
                          dim2TimeEfficiency: { ...formRecord.dim2TimeEfficiency, notes: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: AGENSI & TATA RUANG */}
              {activeFormTab === 'agency_space' && (
                <div className="space-y-6">
                  {/* Dimensi 3: Agensi & Suara Murid */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-sm">Dimensi 3: Kultur Agensi & Suara Murid (25 Poin)</h4>
                      <select
                        value={formRecord.dim3StudentAgency.score}
                        onChange={(e) => {
                          const sc = Number(e.target.value);
                          const rub = PM_LEARNING_ENV_RUBRICS[2].levels[sc as 1 | 2 | 3 | 4];
                          const updated = {
                            ...formRecord,
                            dim3StudentAgency: {
                              ...formRecord.dim3StudentAgency,
                              score: sc,
                              level: rub.label as any
                            }
                          };
                          setFormRecord(recalculateFormMetrics(updated));
                        }}
                        className="px-2.5 py-1 text-xs font-bold bg-white border border-slate-300 rounded-lg text-teal-800"
                      >
                        <option value={4}>Skor 4 (Membudaya)</option>
                        <option value={3}>Skor 3 (Matang)</option>
                        <option value={2}>Skor 2 (Berkembang)</option>
                        <option value={1}>Skor 1 (Terbatas)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      {[
                        { key: 'voiceAndChoice' as const, label: 'Murid memiliki opsi memilih strategi atau bentuk tugas / produk belajar' },
                        { key: 'selfGoalSetting' as const, label: 'Murid dilibatkan dalam menyusun target belajar dan kriteria keberhasilan' },
                        { key: 'metacognitiveReflection' as const, label: 'Murid melakukan refleksi metakognitif teratur di akhir sesi' }
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formRecord.dim3StudentAgency.indicators[item.key]}
                            onChange={(e) => {
                              const updated = {
                                ...formRecord,
                                dim3StudentAgency: {
                                  ...formRecord.dim3StudentAgency,
                                  indicators: {
                                    ...formRecord.dim3StudentAgency.indicators,
                                    [item.key]: e.target.checked
                                  }
                                }
                              };
                              setFormRecord(recalculateFormMetrics(updated));
                            }}
                            className="w-4 h-4 text-teal-600 rounded border-slate-300"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>

                    <textarea
                      rows={2}
                      value={formRecord.dim3StudentAgency.notes}
                      onChange={(e) =>
                        setFormRecord({
                          ...formRecord,
                          dim3StudentAgency: { ...formRecord.dim3StudentAgency, notes: e.target.value }
                        })
                      }
                      placeholder="Catatan agensi murid..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  {/* Dimensi 4: Tata Ruang & Pemanfaatan Lingkungan */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-sm">Dimensi 4: Fleksibilitas Tata Ruang & Lingkungan (25 Poin)</h4>
                      <select
                        value={formRecord.dim4PhysicalSpatial.score}
                        onChange={(e) => {
                          const sc = Number(e.target.value);
                          const rub = PM_LEARNING_ENV_RUBRICS[3].levels[sc as 1 | 2 | 3 | 4];
                          const updated = {
                            ...formRecord,
                            dim4PhysicalSpatial: {
                              ...formRecord.dim4PhysicalSpatial,
                              score: sc,
                              level: rub.label as any
                            }
                          };
                          setFormRecord(recalculateFormMetrics(updated));
                        }}
                        className="px-2.5 py-1 text-xs font-bold bg-white border border-slate-300 rounded-lg text-teal-800"
                      >
                        <option value={4}>Skor 4 (Membudaya)</option>
                        <option value={3}>Skor 3 (Matang)</option>
                        <option value={2}>Skor 2 (Berkembang)</option>
                        <option value={1}>Skor 1 (Terbatas)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      {[
                        { key: 'flexibleSeating' as const, label: 'Penataan meja-kursi fleksibel mendukung kerja kelompok dinamis' },
                        { key: 'accessibleResources' as const, label: 'Sumber belajar dan alat peraga mudah diakses mandiri oleh murid' },
                        { key: 'beyondClassroom' as const, label: 'Pemanfaatan ruang luar kelas atau konteks lingkungan nyata' }
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formRecord.dim4PhysicalSpatial.spatial[item.key]}
                            onChange={(e) => {
                              const updated = {
                                ...formRecord,
                                dim4PhysicalSpatial: {
                                  ...formRecord.dim4PhysicalSpatial,
                                  spatial: {
                                    ...formRecord.dim4PhysicalSpatial.spatial,
                                    [item.key]: e.target.checked
                                  }
                                }
                              };
                              setFormRecord(recalculateFormMetrics(updated));
                            }}
                            className="w-4 h-4 text-teal-600 rounded border-slate-300"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>

                    <textarea
                      rows={2}
                      value={formRecord.dim4PhysicalSpatial.notes}
                      onChange={(e) =>
                        setFormRecord({
                          ...formRecord,
                          dim4PhysicalSpatial: { ...formRecord.dim4PhysicalSpatial, notes: e.target.value }
                        })
                      }
                      placeholder="Catatan tata ruang fisik..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: DIAGNOSIS & REKOMENDASI */}
              {activeFormTab === 'recommendations' && (
                <div className="space-y-4">
                  <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase text-teal-800 font-semibold">Skor Total Pembelajaran Mendalam</div>
                      <div className="text-2xl font-black text-teal-900">{formRecord.totalScore.toFixed(1)} / 100 Poin</div>
                      <div className="text-xs font-bold text-teal-800">{formRecord.maturityLevel}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-600">Efisiensi Waktu: <strong>{formRecord.timeEfficiencyCategory}</strong></div>
                      <div className="text-xs text-slate-600">Iklim Emosional: <strong>{formRecord.psychologicalClimateCategory}</strong></div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kekuatan Unggulan Guru (Pisahkan dengan baris baru)
                    </label>
                    <textarea
                      rows={3}
                      value={formRecord.keyStrengths.join('\n')}
                      onChange={(e) =>
                        setFormRecord({
                          ...formRecord,
                          keyStrengths: e.target.value.split('\n').filter((s) => s.trim().length > 0)
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Area Peningkatan Prioritas (Pisahkan dengan baris baru)
                    </label>
                    <textarea
                      rows={3}
                      value={formRecord.keyGrowthAreas.join('\n')}
                      onChange={(e) =>
                        setFormRecord({
                          ...formRecord,
                          keyGrowthAreas: e.target.value.split('\n').filter((s) => s.trim().length > 0)
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Rekomendasi Tindak Lanjut Pengawas Pembina (Pisahkan dengan baris baru)
                    </label>
                    <textarea
                      rows={3}
                      value={formRecord.supervisoryRecommendations.join('\n')}
                      onChange={(e) =>
                        setFormRecord({
                          ...formRecord,
                          supervisoryRecommendations: e.target.value.split('\n').filter((s) => s.trim().length > 0)
                        })
                      }
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

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveForm}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Hasil Evaluasi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN PRINT CONTAINER (FOR OFFICIAL DOCUMENT PRINTING) */}
      {selectedRecordForDetail && (
        <div id="printable-learning-env-doc" className="hidden print:block p-8 bg-white text-slate-900 font-serif">
          {/* KOP SURAT RESMI */}
          <div className="text-center border-b-2 border-black pb-3 mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wide">
              {settings.governmentAgency || 'PEMERINTAH KABUPATEN SIDENRENG RAPPANG'}
            </h3>
            <h2 className="text-base font-extrabold uppercase">DINAS PENDIDIKAN DAN KEBUDAYAAN</h2>
            <h4 className="text-xs font-bold text-blue-900">KANTOR PENGAWAS SEKOLAH PEMBINA SATUAN PENDIDIKAN</h4>
            <p className="text-[10px] italic text-slate-600 mt-1">
              {settings.schoolAddress || 'Sekretariat Pengawas Sekolah, Kabupaten Sidenreng Rappang, Sulawesi Selatan'}
            </p>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-sm font-extrabold uppercase">INSTRUMEN EVALUASI & OBSERVASI LINGKUNGAN PEMBELAJARAN (PM)</h2>
            <h3 className="text-xs font-bold text-blue-800">
              FOKUS: IKLIM PSIKOLOGIS (KEAMANAN EMOSIONAL) & EFISIENSI WAKTU BELAJAR AKTIF
            </h3>
          </div>

          {/* Identity Table */}
          <table className="w-full text-xs mb-4 border-collapse">
            <tbody>
              <tr>
                <td className="w-1/4 py-1 font-semibold">Satuan Pendidikan</td>
                <td className="w-4 py-1">:</td>
                <td className="w-1/4 py-1">{selectedRecordForDetail.schoolName}</td>
                <td className="w-1/4 py-1 font-semibold">Tanggal Evaluasi</td>
                <td className="w-4 py-1">:</td>
                <td className="w-1/4 py-1">{selectedRecordForDetail.date}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">Nama Guru</td>
                <td className="py-1">:</td>
                <td className="py-1 font-bold">{selectedRecordForDetail.teacherName}</td>
                <td className="py-1 font-semibold">Mata Pelajaran</td>
                <td className="py-1">:</td>
                <td className="py-1">{selectedRecordForDetail.subject}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">NIP Guru</td>
                <td className="py-1">:</td>
                <td className="py-1">{selectedRecordForDetail.teacherNip || '-'}</td>
                <td className="py-1 font-semibold">Kelas / Rombel</td>
                <td className="py-1">:</td>
                <td className="py-1">{selectedRecordForDetail.gradeClass}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">Topik Materi</td>
                <td className="py-1">:</td>
                <td className="py-1">{selectedRecordForDetail.topic}</td>
                <td className="py-1 font-semibold">Pengawas Pembina</td>
                <td className="py-1">:</td>
                <td className="py-1">{selectedRecordForDetail.assessorName}</td>
              </tr>
            </tbody>
          </table>

          {/* Capaian Eksekutif */}
          <div className="border border-slate-300 p-3 mb-4 rounded bg-slate-50 text-xs">
            <div className="grid grid-cols-3 text-center divide-x divide-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Skor Keseluruhan PM</span>
                <span className="text-xl font-bold text-blue-900">{selectedRecordForDetail.totalScore.toFixed(1)} / 100</span>
                <span className="text-xs font-bold block">{selectedRecordForDetail.maturityLevel}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Iklim Keamanan Emosional</span>
                <span className="text-xl font-bold text-emerald-800">Skor {selectedRecordForDetail.dim1Psychological.score} / 4</span>
                <span className="text-xs font-bold block">{selectedRecordForDetail.psychologicalClimateCategory}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Efisiensi Belajar Aktif</span>
                <span className="text-xl font-bold text-blue-800">{selectedRecordForDetail.dim2TimeEfficiency.tracker.activeTimeRatioPct.toFixed(1)}%</span>
                <span className="text-xs font-bold block">{selectedRecordForDetail.timeEfficiencyCategory}</span>
              </div>
            </div>
          </div>

          {/* Section I: Keamanan Emosional */}
          <h4 className="text-xs font-bold uppercase bg-slate-800 text-white px-2 py-1 mb-2">
            I. Elemen Iklim Psikologis & Keamanan Emosional Murid (25 Poin)
          </h4>
          <table className="w-full text-[11px] border border-slate-300 mb-4 border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 p-1.5 text-left w-1/2">Indikator Observasi</th>
                <th className="border border-slate-300 p-1.5 text-center w-24">Status</th>
                <th className="border border-slate-300 p-1.5 text-left">Deskripsi & Bukti Nyata</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 p-1.5">1. Bebas Berpendapat Tanpa Cemas</td>
                <td className="border border-slate-300 p-1.5 text-center font-bold">
                  {selectedRecordForDetail.dim1Psychological.checklist.expressWithoutFear ? 'YA' : 'BELUM'}
                </td>
                <td rowSpan={5} className="border border-slate-300 p-2 align-top">
                  <p><strong>Catatan:</strong> {selectedRecordForDetail.dim1Psychological.notes}</p>
                  <p className="mt-1"><strong>Bukti:</strong> {selectedRecordForDetail.dim1Psychological.evidenceNotes || '-'}</p>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5">2. Kesalahan Sebagai Peluang Belajar (Growth Mindset)</td>
                <td className="border border-slate-300 p-1.5 text-center font-bold">
                  {selectedRecordForDetail.dim1Psychological.checklist.mistakesAsLearning ? 'YA' : 'BELUM'}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5">3. Bebas Intimidasi, Cemoohan & Sarkasme</td>
                <td className="border border-slate-300 p-1.5 text-center font-bold">
                  {selectedRecordForDetail.dim1Psychological.checklist.noBullyingSarcasm ? 'YA' : 'BELUM'}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5">4. Integrasi Regulasi Emosi / KSE</td>
                <td className="border border-slate-300 p-1.5 text-center font-bold">
                  {selectedRecordForDetail.dim1Psychological.checklist.kseEmotionalRegulation ? 'YA' : 'BELUM'}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5">5. Budaya Saling Mendukung & Empati Antar Murid</td>
                <td className="border border-slate-300 p-1.5 text-center font-bold">
                  {selectedRecordForDetail.dim1Psychological.checklist.mutualSupport ? 'YA' : 'BELUM'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Section II: Efisiensi Waktu */}
          <h4 className="text-xs font-bold uppercase bg-slate-800 text-white px-2 py-1 mb-2">
            II. Elemen Efisiensi Waktu Belajar & Ritme Kelas (25 Poin)
          </h4>
          <table className="w-full text-[11px] border border-slate-300 mb-4 border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 p-1.5 text-left w-1/2">Distribusi Alokasi Waktu</th>
                <th className="border border-slate-300 p-1.5 text-center w-24">Durasi</th>
                <th className="border border-slate-300 p-1.5 text-left">Analisis Ritme & Rekomendasi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 p-1.5">1. Waktu Belajar Aktif Murid (Diskusi/Praktik)</td>
                <td className="border border-slate-300 p-1.5 text-center font-bold">
                  {selectedRecordForDetail.dim2TimeEfficiency.tracker.activeLearningMinutes} Menit
                </td>
                <td rowSpan={4} className="border border-slate-300 p-2 align-top">
                  <p><strong>Rasio Belajar Aktif:</strong> {selectedRecordForDetail.dim2TimeEfficiency.tracker.activeTimeRatioPct.toFixed(1)}%</p>
                  <p><strong>Kelancaran Ritme:</strong> {selectedRecordForDetail.dim2TimeEfficiency.tracker.pacingSmoothness}</p>
                  <p className="mt-1"><strong>Catatan:</strong> {selectedRecordForDetail.dim2TimeEfficiency.notes}</p>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5">2. Ceramah & Instruksi Guru Satu Arah</td>
                <td className="border border-slate-300 p-1.5 text-center">
                  {selectedRecordForDetail.dim2TimeEfficiency.tracker.teacherTalkMinutes} Menit
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5">3. Transisi Antar Sesi & Administrasi</td>
                <td className="border border-slate-300 p-1.5 text-center">
                  {selectedRecordForDetail.dim2TimeEfficiency.tracker.transitionAdminMinutes} Menit
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5">4. Jeda Hampa / Distraksi (Dead Time)</td>
                <td className="border border-slate-300 p-1.5 text-center">
                  {selectedRecordForDetail.dim2TimeEfficiency.tracker.deadTimeMinutes} Menit
                </td>
              </tr>
            </tbody>
          </table>

          {/* Section III: Rekomendasi */}
          <div className="border border-slate-300 p-3 mb-8 rounded text-xs space-y-1.5">
            <p><strong>Kekuatan Unggulan:</strong> {selectedRecordForDetail.keyStrengths.join('; ')}</p>
            <p><strong>Area Peningkatan Prioritas:</strong> {selectedRecordForDetail.keyGrowthAreas.join('; ')}</p>
            <p><strong>Rekomendasi Tindak Lanjut:</strong> {selectedRecordForDetail.supervisoryRecommendations.join('; ')}</p>
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
              Guru Sasaran Observasi<br /><br /><br /><br />
              <strong>{selectedRecordForDetail.teacherName}</strong><br />
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
