/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Laptop,
  Sparkles,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Printer,
  FileDown,
  CheckCircle2,
  RotateCcw,
  School,
  X,
  Save,
  Compass,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  ChevronRight,
  Share2,
  BrainCircuit,
  Timer,
  Handshake,
  HelpCircle,
  Info,
  Zap,
  BookOpen
} from 'lucide-react';
import {
  PMDigitalRecord,
  PM_DIGITAL_RUBRICS,
  SAMRLevel,
  PMDigitalMaturity,
  Teacher,
  AppSettings
} from '../types/inspiro';
import { UserRoleProfile } from '../services/firebase';
import { exportDigitalPMToWord } from '../utils/digitalPMExport';
import { printDocumentElement } from '../utils/documentExport';

interface PMDigitalViewProps {
  records: PMDigitalRecord[];
  teachers: Teacher[];
  settings: AppSettings;
  currentUser: UserRoleProfile | null;
  onSaveRecord: (record: PMDigitalRecord) => void;
  onDeleteRecord: (id: string) => void;
  onNavigateToPedagogicalPM?: () => void;
  onNavigateToLearningEnv?: () => void;
  onNavigateToPartnershipPM?: () => void;
  showToast: (title: string, desc?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const PMDigitalView: React.FC<PMDigitalViewProps> = ({
  records,
  teachers,
  settings,
  currentUser,
  onSaveRecord,
  onDeleteRecord,
  onNavigateToPedagogicalPM,
  onNavigateToLearningEnv,
  onNavigateToPartnershipPM,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [samrFilter, setSamrFilter] = useState<string>('all');
  const [maturityFilter, setMaturityFilter] = useState<string>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');

  // Modal & Detail states
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<PMDigitalRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'identity' | 'samr' | 'dimensions' | 'checklist' | 'recommendations'>('identity');
  const [formRecord, setFormRecord] = useState<PMDigitalRecord | null>(null);
  const [showSamrGuide, setShowSamrGuide] = useState(true);

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
        (r.topic && r.topic.toLowerCase().includes(searchTerm.toLowerCase())) ||
        r.toolUsage.toolsUsed.some((tool) => tool.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchSchool = schoolFilter === 'all' || r.schoolName === schoolFilter;
      const matchSamr = samrFilter === 'all' || r.toolUsage.samrLevel === samrFilter;
      const matchMaturity = maturityFilter === 'all' || r.maturityLevel.includes(maturityFilter);
      const matchDevice =
        deviceFilter === 'all' ||
        r.toolUsage.deviceType === deviceFilter ||
        (deviceFilter.includes('PID') && r.toolUsage.deviceType.includes('PID'));

      return matchSearch && matchSchool && matchSamr && matchMaturity && matchDevice;
    });
  }, [records, searchTerm, schoolFilter, samrFilter, maturityFilter, deviceFilter]);

  // Analytics Stats
  const stats = useMemo(() => {
    const total = records.length;
    if (total === 0) {
      return {
        total: 0,
        avgScore: 0,
        avgHandsOnRatio: 0,
        samrDistribution: { Substitution: 0, Augmentation: 0, Modification: 0, Redefinition: 0 },
        checklistFulfillmentRate: 0
      };
    }

    const avgScore = records.reduce((acc, r) => acc + r.totalScore, 0) / total;
    const avgHandsOnRatio =
      records.reduce((acc, r) => acc + (r.toolUsage.studentHandsOnRatioPct || 0), 0) / total;

    const samrDistribution = {
      Substitution: records.filter((r) => r.toolUsage.samrLevel === 'Substitution').length,
      Augmentation: records.filter((r) => r.toolUsage.samrLevel === 'Augmentation').length,
      Modification: records.filter((r) => r.toolUsage.samrLevel === 'Modification').length,
      Redefinition: records.filter((r) => r.toolUsage.samrLevel === 'Redefinition').length
    };

    let totalChecklist = 0;
    let fulfilledChecklist = 0;
    records.forEach((r) => {
      const c = r.checklist;
      totalChecklist += 5;
      if (c.createsDigitalArtifacts) fulfilledChecklist++;
      if (c.realtimeCollaboration) fulfilledChecklist++;
      if (c.adaptiveAssessmentFeedback) fulfilledChecklist++;
      if (c.digitalEthicsAndAi) fulfilledChecklist++;
      if (c.authenticAudience) fulfilledChecklist++;
    });

    const checklistFulfillmentRate = (fulfilledChecklist / (totalChecklist || 1)) * 100;

    return {
      total,
      avgScore: Number(avgScore.toFixed(1)),
      avgHandsOnRatio: Number(avgHandsOnRatio.toFixed(1)),
      samrDistribution,
      checklistFulfillmentRate: Number(checklistFulfillmentRate.toFixed(1))
    };
  }, [records]);

  // Open Create Modal
  const handleOpenCreate = () => {
    const defaultTeacher = teachers[0] || {
      id: 'G001',
      nama: 'Guru Pembina',
      nip: '-',
      mapel: 'Umum',
      kelas: 'VII',
      satuanPendidikan: settings.schoolName || 'SMP Binaan'
    };

    const newRec: PMDigitalRecord = {
      id: `pdm-${Date.now()}`,
      schoolName: defaultTeacher.satuanPendidikan || settings.schoolName || 'SMP Binaan',
      teacherId: defaultTeacher.id,
      teacherName: defaultTeacher.nama,
      teacherNip: defaultTeacher.nip,
      subject: defaultTeacher.mapel || 'Matematika',
      gradeClass: defaultTeacher.kelas || 'VII (Fase D)',
      topic: 'Eksplorasi Konsep Interaktif Berbasis Digital',
      date: new Date().toISOString().split('T')[0],
      assessorName: settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
      assessorRole: 'Pengawas Sekolah',
      assessorNip: settings.supervisorNip || '19830819 201001 1 002',
      headmasterName: settings.pengawasPembinaName || 'Dra. Hj. Nurhasanah, M.Pd.',
      headmasterNip: settings.pengawasPembinaNip || '19720815 199802 2 003',

      dim1CreatorRole: {
        score: 3,
        level: 'Matang',
        artifactsCreated: 'Infografis Canva / Presentasi Kolaboratif',
        notes: 'Murid aktif memproduksi artefak digital visual sebagai wujud pemahaman konsep.',
        evidenceNotes: 'Karya infografis tersimpan dalam Google Drive kelompok.'
      },

      dim2Collaboration: {
        score: 3,
        level: 'Matang',
        platforms: 'Google Workspace for Education (Slides & Docs)',
        notes: 'Murid bekerja bersama secara simultan dalam satu dokumen cloud bersama.',
        evidenceNotes: 'Terekam riwayat revisi dan pembagian tugas antar-anggota kelompok.'
      },

      dim3Assessment: {
        score: 3,
        level: 'Matang',
        assessmentTool: 'Quizizz Interaktif / Google Form Berjenjang',
        notes: 'Data asesmen formatif ditinjau langsung saat proses belajar untuk mendiagnosis kendala murid.',
        evidenceNotes: 'Guru mengidentifikasi miskonsepsi kelompok secara langsung dari dashboard analitik.'
      },

      dim4EthicsAndAi: {
        score: 3,
        level: 'Matang',
        aiUsageNotes: 'Pemanfaatan AI untuk eksplorasi ide dan pengecekan atribusi hak cipta.',
        notes: 'Murid diingatkan etika siber dan kewajiban menyertakan sumber referensi orisinal.',
        evidenceNotes: 'Karya mencantumkan kredit sumber gambar dan data referensi.'
      },

      checklist: {
        createsDigitalArtifacts: true,
        realtimeCollaboration: true,
        adaptiveAssessmentFeedback: true,
        digitalEthicsAndAi: true,
        authenticAudience: false
      },

      toolUsage: {
        toolsUsed: ['Canva for Education', 'Google Workspace', 'Quizizz'],
        deviceType: 'Chromebook / Laptop',
        studentHandsOnDuration: 52,
        totalLessonDuration: 80,
        studentHandsOnRatioPct: 65.0,
        samrLevel: 'Modification'
      },

      totalScore: 75.0,
      maturityLevel: 'Level 3: Matang (Modification)',
      samrSummary: 'Level Modification: Teknologi digital merancang ulang tugas pembelajaran menjadi kreasi kolaboratif multi-modal.',
      keyStrengths: [
        'Rasio murid memegang dan mengoperasikan perangkat digital mencapai 65% durasi sesi tatap muka.',
        'Murid menghasilkan karya digital otentik dan berkolaborasi dalam dokumen cloud bersama.'
      ],
      keyGrowthAreas: [
        'Memperluas publikasi karya digital murid ke audiens nyata di luar dinding kelas.',
        'Mengintegrasikan literasi kecerdasan artifisial (AI) secara lebih kritis dan terarah.'
      ],
      supervisoryRecommendations: [
        'Fasilitasi pembuatan portofolio digital berbasis Google Sites untuk merekam kemajuan belajar murid sepanjang semester.',
        'Diseminasi praktik baik pemanfaatan Chromebook ini dalam forum Komunitas Belajar (Kombel) sekolah binaan.'
      ],
      status: 'final',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setFormRecord(newRec);
    setActiveFormTab('identity');
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (rec: PMDigitalRecord) => {
    setFormRecord(JSON.parse(JSON.stringify(rec)));
    setActiveFormTab('identity');
    setIsFormModalOpen(true);
  };

  // Recalculate Metrics in Form (preserves manual SAMR selection by default)
  const recalculateFormMetrics = (draft: PMDigitalRecord, autoDetermineSamr = false): PMDigitalRecord => {
    const totalDuration = draft.toolUsage.totalLessonDuration || 80;
    const handsOnDuration = draft.toolUsage.studentHandsOnDuration || 0;
    const ratio = totalDuration > 0 ? Number(((handsOnDuration / totalDuration) * 100).toFixed(1)) : 0;
    draft.toolUsage.studentHandsOnRatioPct = ratio;

    // Total Score (each dimension is 25% = score * 6.25)
    const s1 = (draft.dim1CreatorRole.score || 0) * 6.25;
    const s2 = (draft.dim2Collaboration.score || 0) * 6.25;
    const s3 = (draft.dim3Assessment.score || 0) * 6.25;
    const s4 = (draft.dim4EthicsAndAi.score || 0) * 6.25;
    const total = Number((s1 + s2 + s3 + s4).toFixed(1));
    draft.totalScore = total;

    // SAMR definitions & synthesis texts
    const samrDetails: Record<SAMRLevel, { maturity: PMDigitalMaturity; summary: string }> = {
      Redefinition: {
        maturity: 'Level 4: Membudaya (Redefinition)',
        summary: 'Level Redefinition (Kreasi Baru): Teknologi digital memungkinkan tugas pembelajaran baru yang sebelumnya mustahil terlaksana tanpa teknologi (misal: publikasi karya ke audiens autentik global, riset berbasis data digital real-time, kreasi AI kritis).'
      },
      Modification: {
        maturity: 'Level 3: Matang (Modification)',
        summary: 'Level Modification (Perancangan Ulang): Penugasan dirancang ulang secara signifikan menjadi kolaborasi multi-modal interaktif (misal: kolaborasi dokumen/poster Canva bersama, manipulasi variabel sains di PhET/GeoGebra, atau interaksi aktif papan interaktif digital).'
      },
      Augmentation: {
        maturity: 'Level 2: Berkembang (Augmentation)',
        summary: 'Level Augmentation (Peningkatan Fungsi): Teknologi digunakan sebagai pengganti langsung dengan peningkatan fungsional yang mempermudah murid (misal: kuis interaktif dengan skor instan di Quizizz/Forms, text-to-speech, kamus terintegrasi).'
      },
      Substitution: {
        maturity: 'Level 1: Terbatas (Substitution)',
        summary: 'Level Substitution (Penggantian Langsung): Teknologi hanya menggantikan fungsi alat konvensional (misal: membaca teks PDF di layar sebagai pengganti buku fisik atau proyektor pengganti papan tulis biasa) tanpa perubahan alur belajar.'
      }
    };

    // Calculate score-recommended SAMR based on 4-dimension total
    let recommendedSamr: SAMRLevel = 'Substitution';
    if (total >= 85) {
      recommendedSamr = 'Redefinition';
    } else if (total >= 70) {
      recommendedSamr = 'Modification';
    } else if (total >= 50) {
      recommendedSamr = 'Augmentation';
    }

    if (autoDetermineSamr || !draft.toolUsage.samrLevel) {
      draft.toolUsage.samrLevel = recommendedSamr;
      draft.maturityLevel = samrDetails[recommendedSamr].maturity;
      draft.samrSummary = samrDetails[recommendedSamr].summary;
    } else {
      // Respect the user's manual SAMR choice, but keep maturity label consistent with the selected level
      const currentLevel = draft.toolUsage.samrLevel;
      if (samrDetails[currentLevel]) {
        draft.maturityLevel = samrDetails[currentLevel].maturity;
        if (!draft.samrSummary) {
          draft.samrSummary = samrDetails[currentLevel].summary;
        }
      }
    }

    return draft;
  };

  // Manual Selection handler for SAMR Level
  const handleSelectSamrLevel = (level: SAMRLevel) => {
    if (!formRecord) return;
    const summaries: Record<SAMRLevel, { maturity: PMDigitalMaturity; summary: string }> = {
      Redefinition: {
        maturity: 'Level 4: Membudaya (Redefinition)',
        summary: 'Level Redefinition (Kreasi Baru): Teknologi digital memungkinkan tugas pembelajaran baru yang sebelumnya mustahil terlaksana tanpa teknologi (misal: kolaborasi publikasi global, riset berbasis data digital real-time, kreasi AI kritis).'
      },
      Modification: {
        maturity: 'Level 3: Matang (Modification)',
        summary: 'Level Modification (Perancangan Ulang): Penugasan dirancang ulang secara signifikan menjadi kolaborasi multi-modal interaktif (misal: kolaborasi dokumen/poster Canva bersama, manipulasi variabel sains di PhET/GeoGebra, atau interaksi aktif papan interaktif digital).'
      },
      Augmentation: {
        maturity: 'Level 2: Berkembang (Augmentation)',
        summary: 'Level Augmentation (Peningkatan Fungsi): Teknologi digunakan sebagai pengganti langsung dengan peningkatan fungsional yang mempermudah murid (misal: kuis interaktif dengan skor instan di Quizizz/Forms, text-to-speech, kamus terintegrasi).'
      },
      Substitution: {
        maturity: 'Level 1: Terbatas (Substitution)',
        summary: 'Level Substitution (Penggantian Langsung): Teknologi hanya menggantikan fungsi alat konvensional (misal: membaca teks PDF di layar sebagai pengganti buku fisik atau proyektor pengganti papan tulis biasa) tanpa perubahan alur belajar.'
      }
    };

    const targetInfo = summaries[level];
    const updated: PMDigitalRecord = {
      ...formRecord,
      toolUsage: {
        ...formRecord.toolUsage,
        samrLevel: level
      },
      maturityLevel: targetInfo.maturity,
      samrSummary: targetInfo.summary
    };

    setFormRecord(recalculateFormMetrics(updated, false));
    showToast(
      `Level SAMR Terpilih: ${level}`,
      `Penetapan level disesuaikan ke ${level}. Ringkasan evaluasi otomatis diperbarui.`,
      'success'
    );
  };

  // Sync SAMR Level automatically from 4 Dimensions Score
  const handleAutoSyncSamr = () => {
    if (!formRecord) return;
    const updated = recalculateFormMetrics({ ...formRecord }, true);
    setFormRecord(updated);
    showToast(
      'Level SAMR Disinkronkan Otomatis',
      `Berdasarkan Skor 4 Dimensi (${updated.totalScore}/100), Level SAMR disetel ke: ${updated.toolUsage.samrLevel}`,
      'info'
    );
  };

  // Save Form
  const handleSaveForm = () => {
    if (!formRecord) return;
    const updated = recalculateFormMetrics({ ...formRecord }, false);
    onSaveRecord(updated);
    setIsFormModalOpen(false);
    showToast('Berhasil Menyimpan', `Asesmen Pemanfaatan Digital ${updated.teacherName} telah disimpan.`);
  };

  // Print & Word Export helpers
  const handlePrint = (record: PMDigitalRecord) => {
    setSelectedRecordForDetail(record);
    setTimeout(() => {
      printDocumentElement('printable-digital-pm-doc', `Evaluasi_Pemanfaatan_Digital_PM_${record.teacherName}`);
    }, 150);
  };

  const handleExportWord = (record: PMDigitalRecord) => {
    exportDigitalPMToWord(record, settings);
    showToast('Mengunduh Dokumen Word', `Berkas evaluasi digital ${record.teacherName} sedang diunduh.`);
  };

  const getSamrBadgeStyle = (samr: SAMRLevel) => {
    switch (samr) {
      case 'Redefinition':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Modification':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Augmentation':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Substitution':
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* WELCOME / BANNER HEADER */}
      <div className="bg-gradient-to-r from-cyan-950 via-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-cyan-700/30">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs font-semibold uppercase tracking-wider border border-cyan-500/30">
              <Cpu className="w-3.5 h-3.5" />
              <span>Program PM · Elemen Pemanfaatan Digital (Leveraging Digital)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Pemanfaatan Digital untuk Pembelajaran Mendalam</span>
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Instrumen evaluasi kualitas integrasi teknologi digital di sekolah binaan{' '}
              <strong className="text-cyan-200">Kabupaten Sidenreng Rappang</strong>. Fokus pada{' '}
              <strong className="text-white">Peran Murid sebagai Kreator Konten Digital Otentik</strong>,{' '}
              <strong className="text-white">Kolaborasi Cloud Simultan</strong>, dan{' '}
              <strong className="text-white">Tangga Evaluasi Model SAMR (Substitution $\rightarrow$ Redefinition)</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onNavigateToLearningEnv && (
              <button
                onClick={onNavigateToLearningEnv}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition border border-slate-700 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>PM: Lingkungan Belajar</span>
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

            {onNavigateToPartnershipPM && (
              <button
                onClick={onNavigateToPartnershipPM}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition border border-slate-700 shadow-sm"
              >
                <Handshake className="w-4 h-4 text-sky-400" />
                <span>PM: Kemitraan</span>
              </button>
            )}

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Input Observasi Digital Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* EXECUTIVE KPI STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Evaluasi */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
            <Laptop className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Observasi Digital</div>
            <div className="text-2xl font-black text-slate-800">{stats.total}</div>
            <div className="text-xs text-slate-500">Guru Binaan Terekam</div>
          </div>
        </div>

        {/* Skor Rata-rata Digital PM */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Rata-Rata Skor Digital PM</div>
            <div className="text-2xl font-black text-teal-700">{stats.avgScore} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
            <div className="text-xs text-slate-500">Skala 4 Dimensi NPDL</div>
          </div>
        </div>

        {/* Rasio Murid Mengoperasikan Gawai */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Rasio Murid Operasikan Gawai</div>
            <div className="text-2xl font-black text-blue-700">{stats.avgHandsOnRatio}%</div>
            <div className="text-xs text-slate-500">Durasi Murid Hands-on</div>
          </div>
        </div>

        {/* Tingkat Keterpenuhan Pilar Digital */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pilar Digital Terpenuhi</div>
            <div className="text-2xl font-black text-indigo-700">{stats.checklistFulfillmentRate}%</div>
            <div className="text-xs text-slate-500">5 Pilar Ekosistem Digital</div>
          </div>
        </div>
      </div>

      {/* HIGHLIGHT: SAMR MODEL LADDER & 5 PILARS OF DIGITAL PM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* SAMR Ladder Card (2 Cols) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 border border-slate-700 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center font-black text-sm">
                S
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Tangga Evaluasi Integrasi Digital (Model SAMR)</h3>
                <p className="text-xs text-slate-400">Dr. Ruben Puentedura Framework untuk Pembelajaran Mendalam</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-cyan-300 bg-cyan-500/20 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
              SAMR Ladder
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Level 4: Redefinition */}
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 space-y-1">
              <div className="flex items-center justify-between text-emerald-300 font-bold">
                <span>Level 4: Redefinition (Kreasi Baru)</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 rounded text-[10px]">
                  {stats.samrDistribution.Redefinition} Kelas
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Teknologi memungkinkan tugas baru bernilai otentik yang mustahil dilakukan tanpa perangkat (misal: pameran virtual 3D, simulasi sains komputasi, atau kampanye global).
              </p>
            </div>

            {/* Level 3: Modification */}
            <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-500/40 space-y-1">
              <div className="flex items-center justify-between text-blue-300 font-bold">
                <span>Level 3: Modification (Rancang Ulang)</span>
                <span className="px-2 py-0.5 bg-blue-500/20 rounded text-[10px]">
                  {stats.samrDistribution.Modification} Kelas
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Penugasan dirancang ulang secara signifikan melalui kolaborasi cloud simultan antar-murid (Google Docs/Padlet/Canva terbagi) dengan umpan balik terbuka.
              </p>
            </div>

            {/* Level 2: Augmentation */}
            <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/40 space-y-1">
              <div className="flex items-center justify-between text-amber-300 font-bold">
                <span>Level 2: Augmentation (Peningkatan Fungsi)</span>
                <span className="px-2 py-0.5 bg-amber-500/20 rounded text-[10px]">
                  {stats.samrDistribution.Augmentation} Kelas
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Teknologi sebagai pengganti langsung dengan peningkatan fungsional yang membantu (kuis gamifikasi kuis langsung, grafik dinamis kalkulator).
              </p>
            </div>

            {/* Level 1: Substitution */}
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 space-y-1">
              <div className="flex items-center justify-between text-rose-300 font-bold">
                <span>Level 1: Substitution (Penggantian Saja)</span>
                <span className="px-2 py-0.5 bg-rose-500/20 rounded text-[10px]">
                  {stats.samrDistribution.Substitution} Kelas
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Teknologi hanya menggantikan fungsi alat tradisional tanpa perubahan fungsi (mengetik teks di word tanpa fitur interaktif, proyektor hanya ganti papan tulis).
              </p>
            </div>
          </div>
        </div>

        {/* 5 Digital Pillars Summary Card */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-200 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-teal-700" />
              <h3 className="text-sm font-bold text-slate-900">5 Pilar Pemanfaatan Digital PM</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fokus observasi memastikan gawai digunakan untuk memperdalam pemahaman murid, bukan sekadar gaya hidup digital semu:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 pt-1">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Kreator Konten:</strong> Murid berkarya memproduksi infografis, simulasi, atau podcast.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Kolaborasi Cloud:</strong> Bekerja bersama secara simultan di kanvas terbagi.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Asesmen Real-Time:</strong> Mendiagnosis pemahaman dengan analitik instan.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Etika Siber & AI:</strong> Menghargai hak cipta & berpikir kritis terhadap AI.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Audiens Otentik:</strong> Mempublikasikan karya ke masyarakat/sekolah.</span>
              </li>
            </ul>
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-teal-200/80 text-[11px] text-teal-900">
            <strong>Target Supervisi:</strong> Minimal 60% waktu murid mengoperasikan perangkat secara mandiri (Hands-on).
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari guru, mapel, aplikasi (Canva/GeoGebra)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* School filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <School className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Semua Satuan Pendidikan</option>
              {availableSchools.map((sch) => (
                <option key={sch} value={sch}>
                  {sch}
                </option>
              ))}
            </select>
          </div>

          {/* SAMR filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <select
              value={samrFilter}
              onChange={(e) => setSamrFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 font-semibold"
            >
              <option value="all">Semua Level SAMR</option>
              <option value="Redefinition">Redefinition (Kreasi Baru)</option>
              <option value="Modification">Modification (Rancang Ulang)</option>
              <option value="Augmentation">Augmentation (Peningkatan)</option>
              <option value="Substitution">Substitution (Penggantian)</option>
            </select>
          </div>

          {/* Device filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Laptop className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 font-semibold"
            >
              <option value="all">Semua Perangkat</option>
              <option value="Papan Interaktif Digital (PID)">Papan Interaktif Digital (PID)</option>
              <option value="Chromebook / Laptop">Chromebook / Laptop</option>
              <option value="Smartphone / Tablet">Smartphone / Tablet</option>
              <option value="Laboratorium Komputer">Laboratorium Komputer</option>
              <option value="Hybrid / Multi-device">Hybrid / Multi-device</option>
            </select>
          </div>

          {(searchTerm || schoolFilter !== 'all' || samrFilter !== 'all' || maturityFilter !== 'all' || deviceFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSchoolFilter('all');
                setSamrFilter('all');
                setMaturityFilter('all');
                setDeviceFilter('all');
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
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
            <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-cyan-600 mx-auto flex items-center justify-center">
              <Laptop className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Belum Ada Data Observasi Pemanfaatan Digital PM</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Mulai rekam pengamatan pemanfaatan teknologi digital, evaluasi tangga SAMR, dan kreasi konten otentik murid di sekolah binaan.
            </p>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-semibold hover:bg-cyan-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Input Observasi Digital Pertama</span>
            </button>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const handsOnPct = record.toolUsage.studentHandsOnRatioPct || 0;

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
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                        {record.subject} · {record.gradeClass}
                      </span>
                      <span className={`text-xs font-bold px-3 py-0.5 rounded-full border ${getSamrBadgeStyle(record.toolUsage.samrLevel)}`}>
                        SAMR: {record.toolUsage.samrLevel}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full ${
                          record.toolUsage.deviceType.includes('PID')
                            ? 'bg-purple-100 text-purple-800 border border-purple-200 font-bold'
                            : 'bg-slate-100 text-slate-600 font-medium'
                        }`}
                      >
                        Perangkat: {record.toolUsage.deviceType}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{record.teacherName}</h3>
                    <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                      <span>NIP: {record.teacherNip || '-'}</span>
                      <span>•</span>
                      <span>Materi: <strong>{record.topic}</strong></span>
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-lg text-xs font-semibold transition border border-cyan-200"
                      title="Cetak Berkas Resmi"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak</span>
                    </button>

                    <button
                      onClick={() => handleOpenEdit(record)}
                      className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
                      title="Edit Data"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus evaluasi pemanfaatan digital ${record.teacherName}?`)) {
                          onDeleteRecord(record.id);
                          showToast('Data Dihapus', `Evaluasi digital ${record.teacherName} telah dihapus.`);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Score & Platform Tags */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Gauge 1: Total Skor & SAMR */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Skor Keseluruhan Digital PM</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">{record.totalScore.toFixed(1)}</span>
                      <span className="text-xs text-slate-500">/ 100 Poin</span>
                    </div>
                    <div className="text-xs font-semibold text-cyan-800">
                      {record.maturityLevel}
                    </div>
                  </div>

                  {/* Gauge 2: Hands-on Murid */}
                  <div className="bg-teal-50/60 rounded-xl p-4 border border-teal-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                        <Timer className="w-3.5 h-3.5 text-teal-600" />
                        <span>Rasio Murid Pegang Gawai</span>
                      </div>
                      <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                        {handsOnPct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-teal-900">
                      {record.toolUsage.studentHandsOnDuration} Menit dari {record.toolUsage.totalLessonDuration} Menit Alokasi
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${Math.min(100, handsOnPct)}%` }} />
                    </div>
                  </div>

                  {/* Gauge 3: Tools & Platform Digunakan */}
                  <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-200 space-y-1.5">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Platform & Tools Digunakan</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {record.toolUsage.toolsUsed.map((tool, idx) => (
                        <span key={idx} className="text-[11px] font-semibold bg-white text-blue-900 px-2 py-0.5 rounded border border-blue-200">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SAMR Summary & Strengths */}
                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-600 shrink-0" />
                    <span><strong>Analisis SAMR:</strong> {record.samrSummary}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedRecordForDetail(record);
                      setIsDetailOpen(true);
                    }}
                    className="text-cyan-700 font-semibold hover:underline shrink-0 flex items-center gap-1"
                  >
                    <span>Rincian Lengkap</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DETAIL INSPECTION MODAL */}
      {isDetailOpen && selectedRecordForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getSamrBadgeStyle(selectedRecordForDetail.toolUsage.samrLevel)}`}>
                    SAMR: {selectedRecordForDetail.toolUsage.samrLevel}
                  </span>
                  <span className="text-xs text-slate-400">• {selectedRecordForDetail.schoolName}</span>
                </div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>{selectedRecordForDetail.teacherName}</span>
                  <span className="text-sm font-normal text-cyan-300">({selectedRecordForDetail.subject})</span>
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
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
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
              {/* Meta identity bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold uppercase">Kelas / Rombel</span>
                  <span className="font-bold text-slate-800">{selectedRecordForDetail.gradeClass}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase">Materi Pokok</span>
                  <span className="font-bold text-slate-800">{selectedRecordForDetail.topic}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase">Jenis Perangkat</span>
                  <span className="font-bold text-slate-800">{selectedRecordForDetail.toolUsage.deviceType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase">Rasio Hands-on Murid</span>
                  <span className="font-bold text-teal-700">{selectedRecordForDetail.toolUsage.studentHandsOnRatioPct.toFixed(1)}%</span>
                </div>
              </div>

              {/* SAMR Ladder Card */}
              <div className="p-4 bg-cyan-50/70 rounded-xl border border-cyan-200 space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`font-bold px-2.5 py-0.5 rounded ${getSamrBadgeStyle(selectedRecordForDetail.toolUsage.samrLevel)}`}>
                    Model SAMR: {selectedRecordForDetail.toolUsage.samrLevel}
                  </span>
                  <span className="font-bold text-cyan-900">{selectedRecordForDetail.maturityLevel}</span>
                </div>
                <p className="text-slate-700 leading-relaxed pt-1">
                  {selectedRecordForDetail.samrSummary}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedRecordForDetail.toolUsage.toolsUsed.map((tool, idx) => (
                    <span key={idx} className="bg-white text-cyan-900 font-semibold px-2 py-0.5 rounded border border-cyan-300">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* 4 Dimensi Detail */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                  Uraian Capaian 4 Dimensi Pemanfaatan Digital
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dimensi 1 */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>1. Peran Murid sebagai Kreator</span>
                      <span className="text-teal-700">Skor: {selectedRecordForDetail.dim1CreatorRole.score}/4 ({selectedRecordForDetail.dim1CreatorRole.level})</span>
                    </div>
                    <p className="text-slate-600"><strong>Artefak:</strong> {selectedRecordForDetail.dim1CreatorRole.artifactsCreated}</p>
                    <p className="text-slate-700">{selectedRecordForDetail.dim1CreatorRole.notes}</p>
                  </div>

                  {/* Dimensi 2 */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>2. Kolaborasi & Komunikasi Cloud</span>
                      <span className="text-teal-700">Skor: {selectedRecordForDetail.dim2Collaboration.score}/4 ({selectedRecordForDetail.dim2Collaboration.level})</span>
                    </div>
                    <p className="text-slate-600"><strong>Platform:</strong> {selectedRecordForDetail.dim2Collaboration.platforms}</p>
                    <p className="text-slate-700">{selectedRecordForDetail.dim2Collaboration.notes}</p>
                  </div>

                  {/* Dimensi 3 */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>3. Asesmen Formatif Adaptif</span>
                      <span className="text-teal-700">Skor: {selectedRecordForDetail.dim3Assessment.score}/4 ({selectedRecordForDetail.dim3Assessment.level})</span>
                    </div>
                    <p className="text-slate-600"><strong>Instrumen:</strong> {selectedRecordForDetail.dim3Assessment.assessmentTool}</p>
                    <p className="text-slate-700">{selectedRecordForDetail.dim3Assessment.notes}</p>
                  </div>

                  {/* Dimensi 4 */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>4. Etika Digital & Literasi AI</span>
                      <span className="text-teal-700">Skor: {selectedRecordForDetail.dim4EthicsAndAi.score}/4 ({selectedRecordForDetail.dim4EthicsAndAi.level})</span>
                    </div>
                    <p className="text-slate-600"><strong>Integrasi AI:</strong> {selectedRecordForDetail.dim4EthicsAndAi.aiUsageNotes}</p>
                    <p className="text-slate-700">{selectedRecordForDetail.dim4EthicsAndAi.notes}</p>
                  </div>
                </div>
              </div>

              {/* 5 Pilar Checklist */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-800">Keterpenuhan 5 Pilar Ekosistem Digital</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {[
                    { key: 'createsDigitalArtifacts', label: 'Murid Memproduksi Artefak Digital Orisinal' },
                    { key: 'realtimeCollaboration', label: 'Kolaborasi Cloud Bersama Secara Real-Time' },
                    { key: 'adaptiveAssessmentFeedback', label: 'Asesmen Formatif Adaptif dengan Analitik Instan' },
                    { key: 'digitalEthicsAndAi', label: 'Penerapan Etika Siber & Literasi AI Kritis' },
                    { key: 'authenticAudience', label: 'Publikasi Karya ke Audiens Nyata (*Authentic Audience*)' }
                  ].map((item) => {
                    const checked = selectedRecordForDetail.checklist[item.key as keyof typeof selectedRecordForDetail.checklist];
                    return (
                      <div key={item.key} className="flex items-center gap-2">
                        <CheckCircle2 className={`w-4 h-4 ${checked ? 'text-teal-600' : 'text-slate-300'}`} />
                        <span className={checked ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rekomendasi Supervisi */}
              <div className="bg-cyan-50/60 rounded-xl p-5 border border-cyan-200 space-y-3">
                <h4 className="font-bold text-cyan-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-600" />
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
                    <span className="font-semibold text-slate-800 block">Rekomendasi Strategis Pengawas:</span>
                    <ul className="list-disc pl-5 text-cyan-900 space-y-0.5">
                      {selectedRecordForDetail.supervisoryRecommendations.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
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
            <div className="p-5 bg-cyan-950 text-white flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-cyan-300" />
                  <span>Instrumen Observasi Pemanfaatan Digital (PM)</span>
                </h2>
                <p className="text-xs text-cyan-200">
                  Fokus: Kreator Konten Digital, Kolaborasi Cloud, Evaluasi SAMR & Literasi AI
                </p>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-cyan-200 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 shrink-0 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setActiveFormTab('identity')}
                className={`px-3 py-1.5 rounded-lg transition shrink-0 ${
                  activeFormTab === 'identity' ? 'bg-white text-cyan-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Identitas & Perangkat
              </button>
              <button
                onClick={() => setActiveFormTab('samr')}
                className={`px-3 py-1.5 rounded-lg transition shrink-0 ${
                  activeFormTab === 'samr' ? 'bg-white text-blue-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Tangga SAMR & Tools
              </button>
              <button
                onClick={() => setActiveFormTab('dimensions')}
                className={`px-3 py-1.5 rounded-lg transition shrink-0 ${
                  activeFormTab === 'dimensions' ? 'bg-white text-teal-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3. 4 Dimensi Digital
              </button>
              <button
                onClick={() => setActiveFormTab('checklist')}
                className={`px-3 py-1.5 rounded-lg transition shrink-0 ${
                  activeFormTab === 'checklist' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                4. 5 Pilar Digital
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
              {/* TAB 1: IDENTITAS & PERANGKAT */}
              {activeFormTab === 'identity' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Pilih Guru Sasaran Observasi
                      </label>
                      <select
                        value={formRecord.teacherId}
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
                        Jenis Perangkat Digunakan Murid
                      </label>
                      <select
                        value={formRecord.toolUsage.deviceType}
                        onChange={(e) =>
                          setFormRecord({
                            ...formRecord,
                            toolUsage: { ...formRecord.toolUsage, deviceType: e.target.value as any }
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800"
                      >
                        <option value="Chromebook / Laptop">Chromebook / Laptop</option>
                        <option value="Papan Interaktif Digital (PID)">Papan Interaktif Digital (PID)</option>
                        <option value="Smartphone / Tablet">Smartphone / Tablet</option>
                        <option value="Laboratorium Komputer">Laboratorium Komputer</option>
                        <option value="Hybrid / Multi-device">Hybrid / Multi-device</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tanggal Observasi
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
                        Topik Materi Pembelajaran
                      </label>
                      <input
                        type="text"
                        value={formRecord.topic}
                        onChange={(e) => setFormRecord({ ...formRecord, topic: e.target.value })}
                        placeholder="Contoh: Pemodelan Grafik Matematika / Simulasi Sains Virtual"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Hands-on Duration Calculator */}
                  <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 space-y-3">
                    <h4 className="text-xs font-bold text-teal-900 uppercase">
                      Kalkulator Rasio Durasi Murid Memegang Gawai (Student Hands-On)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-teal-800 font-semibold mb-1">
                          Total Durasi Tatap Muka (Menit)
                        </label>
                        <input
                          type="number"
                          value={formRecord.toolUsage.totalLessonDuration}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 80;
                            const updated = {
                              ...formRecord,
                              toolUsage: { ...formRecord.toolUsage, totalLessonDuration: val }
                            };
                            setFormRecord(recalculateFormMetrics(updated));
                          }}
                          className="w-full px-3 py-2 bg-white border border-teal-300 rounded-lg text-sm font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-teal-800 font-semibold mb-1">
                          Durasi Murid Hands-on (Menit)
                        </label>
                        <input
                          type="number"
                          value={formRecord.toolUsage.studentHandsOnDuration}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            const updated = {
                              ...formRecord,
                              toolUsage: { ...formRecord.toolUsage, studentHandsOnDuration: val }
                            };
                            setFormRecord(recalculateFormMetrics(updated));
                          }}
                          className="w-full px-3 py-2 bg-white border border-teal-300 rounded-lg text-sm font-bold text-teal-900"
                        />
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-teal-200 flex flex-col justify-center">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Rasio Hands-on</span>
                        <span className="text-lg font-black text-teal-800">
                          {formRecord.toolUsage.studentHandsOnRatioPct.toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-slate-500">Target Ideal ≥ 60%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SAMR & TOOLS */}
              {activeFormTab === 'samr' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      Aplikasi & Platform Digital yang Digunakan (Pisahkan dengan koma)
                    </label>
                    <input
                      type="text"
                      value={formRecord.toolUsage.toolsUsed.join(', ')}
                      onChange={(e) =>
                        setFormRecord({
                          ...formRecord,
                          toolUsage: {
                            ...formRecord.toolUsage,
                            toolsUsed: e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                          }
                        })
                      }
                      placeholder="Canva, GeoGebra, PhET, Quizizz, Google Workspace, Belajar.id..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
                    />
                    <div className="text-[11px] text-slate-500">
                      Contoh: Canva for Education, GeoGebra, PhET Simulations, Padlet, Quizizz, Google Docs.
                    </div>
                  </div>

                  {/* SAMR Level Selector & Educational Guide */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <label className="block text-xs font-bold text-slate-800">
                            Penetapan Level Tangga Model SAMR
                          </label>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSamrBadgeStyle(
                              formRecord.toolUsage.samrLevel
                            )}`}
                          >
                            Terpilih: {formRecord.toolUsage.samrLevel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Klik langsung salah satu kartu level di bawah ini, atau gunakan tombol otomatis berbasis skor 4 dimensi.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowSamrGuide(!showSamrGuide)}
                          className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 cursor-pointer font-medium transition"
                          title="Buka atau tutup penjelasan detail model SAMR"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-cyan-600" />
                          <span>{showSamrGuide ? 'Tutup Panduan' : 'Buka Panduan SAMR'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleAutoSyncSamr}
                          className="px-2.5 py-1 text-xs rounded-lg border border-cyan-300 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 flex items-center gap-1.5 cursor-pointer font-bold transition shadow-2xs"
                          title="Hitung dan setel level SAMR secara otomatis berdasarkan akumulasi skor 4 Dimensi saat ini"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>Sinkron Otomatis (Skor: {formRecord.totalScore}/100)</span>
                        </button>
                      </div>
                    </div>

                    {/* PANDUAN PENJELASAN LEVEL TANGGA MODEL SAMR */}
                    {showSamrGuide && (
                      <div className="p-4 bg-gradient-to-br from-cyan-50/80 via-white to-blue-50/60 rounded-xl border border-cyan-200/90 shadow-2xs space-y-3">
                        <div className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-cyan-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                            <Info className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-xs font-bold text-slate-900">
                              Panduan Pemahaman Model SAMR (Dr. Ruben Puentedura)
                            </h5>
                            <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                              Model SAMR mengukur sejauh mana teknologi digital mentransformasi metode pembelajaran di kelas dari sekadar pengganti media konvensional hingga menciptakan pengalaman belajar baru yang bermakna.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 text-[11px]">
                          {/* Zona Transformasi */}
                          <div className="p-3 bg-white/90 rounded-lg border border-teal-200 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-teal-800 uppercase tracking-wider text-[10px] bg-teal-100 px-2 py-0.5 rounded">
                                Zona Transformasi (Tingkat Tinggi)
                              </span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-slate-800">
                                <strong className="text-teal-900">4. Redefinition (Kreasi Baru):</strong> Teknologi memungkinkan tugas pembelajaran baru yang <em>mustahil</em> terlaksana tanpa teknologi digital.
                                <span className="block text-slate-500 italic mt-0.5">
                                  Contoh: Murid memproduksi video dokumenter riset lingkungan lalu dipublikasikan ke orang tua/komunitas global, atau berkonsultasi via video telekonferensi dengan pakar luar negeri.
                                </span>
                              </p>
                              <p className="text-slate-800 pt-1 border-t border-slate-100">
                                <strong className="text-blue-900">3. Modification (Rancang Ulang):</strong> Tugas pembelajaran dirancang ulang secara signifikan menjadi kolaboratif &amp; multi-modal.
                                <span className="block text-slate-500 italic mt-0.5">
                                  Contoh: Kolaborasi infografis Canva kelompok secara serentak (real-time), manipulasi sains di PhET/GeoGebra, atau presentasi interaktif di Papan Interaktif Digital (PID).
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* Zona Peningkatan */}
                          <div className="p-3 bg-white/90 rounded-lg border border-amber-200 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-800 uppercase tracking-wider text-[10px] bg-amber-100 px-2 py-0.5 rounded">
                                Zona Peningkatan (Tingkat Dasar)
                              </span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-slate-800">
                                <strong className="text-amber-900">2. Augmentation (Peningkatan Fungsional):</strong> Teknologi digunakan sebagai pengganti langsung dengan peningkatan efisiensi dan fitur baru.
                                <span className="block text-slate-500 italic mt-0.5">
                                  Contoh: Mengerjakan kuis interaktif di Quizizz/Google Forms dengan skor dan umpan balik jawaban otomatis instan, atau menggunakan kamus digital terintegrasi.
                                </span>
                              </p>
                              <p className="text-slate-800 pt-1 border-t border-slate-100">
                                <strong className="text-slate-800">1. Substitution (Penggantian Langsung):</strong> Teknologi hanya menggantikan alat konvensional tanpa perubahan metode belajar.
                                <span className="block text-slate-500 italic mt-0.5">
                                  Contoh: Membaca teks materi berupa file PDF di layar laptop sebagai pengganti buku fisik cetak, atau proyektor pengganti papan tulis konvensional.
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4 Interactive Selectable Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {([
                        {
                          level: 'Redefinition' as SAMRLevel,
                          title: 'Redefinition (Kreasi Baru)',
                          stepNum: 'Level 4',
                          zone: 'Zona Transformasi',
                          zoneColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                          desc: 'Kreasi tugas baru yang mustahil dilakukan tanpa teknologi digital.',
                          example: 'Publikasi karya ke khalayak autentik nyata, analisis data real-time, kolaborasi global.',
                          activeBg: 'bg-gradient-to-br from-emerald-900 to-teal-950 text-white border-emerald-600 ring-2 ring-emerald-400 shadow-md',
                          idleBorder: 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                        },
                        {
                          level: 'Modification' as SAMRLevel,
                          title: 'Modification (Perancangan Ulang)',
                          stepNum: 'Level 3',
                          zone: 'Zona Transformasi',
                          zoneColor: 'text-blue-700 bg-blue-50 border-blue-200',
                          desc: 'Perancangan ulang tugas menjadi kolaborasi multi-modal interaktif.',
                          example: 'Kolaborasi serentak Canva/Slides, simulasi virtual PhET/GeoGebra, eksplorasi PID.',
                          activeBg: 'bg-gradient-to-br from-blue-900 to-indigo-950 text-white border-blue-600 ring-2 ring-blue-400 shadow-md',
                          idleBorder: 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/40'
                        },
                        {
                          level: 'Augmentation' as SAMRLevel,
                          title: 'Augmentation (Peningkatan Fungsi)',
                          stepNum: 'Level 2',
                          zone: 'Zona Peningkatan',
                          zoneColor: 'text-amber-700 bg-amber-50 border-amber-200',
                          desc: 'Pengganti langsung dengan peningkatan fungsional yang membantu murid.',
                          example: 'Kuis interaktif Quizizz/Google Forms berskor otomatis instan, text-to-speech.',
                          activeBg: 'bg-gradient-to-br from-amber-900 to-yellow-950 text-white border-amber-600 ring-2 ring-amber-400 shadow-md',
                          idleBorder: 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/40'
                        },
                        {
                          level: 'Substitution' as SAMRLevel,
                          title: 'Substitution (Penggantian Langsung)',
                          stepNum: 'Level 1',
                          zone: 'Zona Peningkatan',
                          zoneColor: 'text-slate-700 bg-slate-100 border-slate-300',
                          desc: 'Penggantian langsung alat tanpa perubahan fungsi pembelajaran.',
                          example: 'Membaca materi PDF di laptop pengganti buku fisik cetak, mengetik di layar.',
                          activeBg: 'bg-gradient-to-br from-slate-800 to-slate-950 text-white border-slate-600 ring-2 ring-slate-400 shadow-md',
                          idleBorder: 'border-slate-200 hover:border-slate-400 hover:bg-slate-100/60'
                        }
                      ]).map((item) => {
                        const isSelected = formRecord.toolUsage.samrLevel === item.level;
                        return (
                          <button
                            key={item.level}
                            type="button"
                            onClick={() => handleSelectSamrLevel(item.level)}
                            className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer relative group ${
                              isSelected ? item.activeBg : `bg-white ${item.idleBorder} text-slate-800 shadow-2xs`
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                    isSelected ? 'bg-white/20 text-white' : item.zoneColor
                                  }`}
                                >
                                  {item.stepNum} · {item.zone}
                                </span>
                              </div>
                              {isSelected ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-400/50">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Terpilih</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 group-hover:text-cyan-700 font-semibold transition">
                                  Klik untuk memilih
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-black leading-tight">
                              {item.title}
                            </h4>

                            <p
                              className={`text-xs mt-1 leading-snug ${
                                isSelected ? 'text-white/90 font-medium' : 'text-slate-600'
                              }`}
                            >
                              {item.desc}
                            </p>

                            <div
                              className={`mt-2 pt-2 border-t text-[11px] ${
                                isSelected ? 'border-white/20 text-white/80' : 'border-slate-100 text-slate-500'
                              }`}
                            >
                              <strong>Contoh:</strong> {item.example}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Deskripsi Ringkasan Evaluasi SAMR (Kualitatif Pengawas)
                      </label>
                      <span className="text-[10px] text-slate-400">
                        Dapat diedit atau disesuaikan dengan temuan riil
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={formRecord.samrSummary}
                      onChange={(e) => setFormRecord({ ...formRecord, samrSummary: e.target.value })}
                      placeholder="Uraikan ringkasan analisis penerapan model SAMR pada sesi pembelajaran ini..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed font-sans focus:outline-none focus:border-cyan-500 focus:bg-white transition"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: 4 DIMENSI DIGITAL */}
              {activeFormTab === 'dimensions' && (
                <div className="space-y-6">
                  {/* Dimensi 1: Kreator Konten */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                        1. Peran Murid sebagai Kreator Konten (25 Poin)
                      </h4>
                      <select
                        value={formRecord.dim1CreatorRole.score}
                        onChange={(e) => {
                          const sc = Number(e.target.value);
                          const rub = PM_DIGITAL_RUBRICS[0].levels[sc as 1 | 2 | 3 | 4];
                          const updated = {
                            ...formRecord,
                            dim1CreatorRole: {
                              ...formRecord.dim1CreatorRole,
                              score: sc,
                              level: rub.label as any
                            }
                          };
                          setFormRecord(recalculateFormMetrics(updated));
                        }}
                        className="px-2.5 py-1 text-xs font-bold bg-white border border-slate-300 rounded-lg text-cyan-800"
                      >
                        <option value={4}>Skor 4 (Membudaya)</option>
                        <option value={3}>Skor 3 (Matang)</option>
                        <option value={2}>Skor 2 (Berkembang)</option>
                        <option value={1}>Skor 1 (Terbatas)</option>
                      </select>
                    </div>

                    <input
                      type="text"
                      placeholder="Bentuk artefak karya murid (misal: Infografis Canva, Simulasi PhET)"
                      value={formRecord.dim1CreatorRole.artifactsCreated}
                      onChange={(e) =>
                        setFormRecord({
                          ...formRecord,
                          dim1CreatorRole: { ...formRecord.dim1CreatorRole, artifactsCreated: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />

                    <textarea
                      rows={2}
                      placeholder="Catatan pengamatan peran murid sebagai kreator..."
                      value={formRecord.dim1CreatorRole.notes}
                      onChange={(e) =>
                        setFormRecord({
                          ...formRecord,
                          dim1CreatorRole: { ...formRecord.dim1CreatorRole, notes: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  {/* Dimensi 2: Kolaborasi Cloud */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                        2. Kolaborasi & Komunikasi Cloud (25 Poin)
                      </h4>
                      <select
                        value={formRecord.dim2Collaboration.score}
                        onChange={(e) => {
                          const sc = Number(e.target.value);
                          const rub = PM_DIGITAL_RUBRICS[1].levels[sc as 1 | 2 | 3 | 4];
                          const updated = {
                            ...formRecord,
                            dim2Collaboration: {
                              ...formRecord.dim2Collaboration,
                              score: sc,
                              level: rub.label as any
                            }
                          };
                          setFormRecord(recalculateFormMetrics(updated));
                        }}
                        className="px-2.5 py-1 text-xs font-bold bg-white border border-slate-300 rounded-lg text-cyan-800"
                      >
                        <option value={4}>Skor 4 (Membudaya)</option>
                        <option value={3}>Skor 3 (Matang)</option>
                        <option value={2}>Skor 2 (Berkembang)</option>
                        <option value={1}>Skor 1 (Terbatas)</option>
                      </select>
                    </div>

                    <input
                      type="text"
                      placeholder="Platform kolaborasi (misal: Google Docs bersama, Padlet, Jamboard)"
                      value={formRecord.dim2Collaboration.platforms}
                      onChange={(e) =>
                        setFormRecord({
                          ...formRecord,
                          dim2Collaboration: { ...formRecord.dim2Collaboration, platforms: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />

                    <textarea
                      rows={2}
                      placeholder="Catatan kolaborasi cloud simultan antar-murid..."
                      value={formRecord.dim2Collaboration.notes}
                      onChange={(e) =>
                        setFormRecord({
                          ...formRecord,
                          dim2Collaboration: { ...formRecord.dim2Collaboration, notes: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  {/* Dimensi 3: Asesmen Adaptif */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                        3. Asesmen Formatif Adaptif & Umpan Balik Instan (25 Poin)
                      </h4>
                      <select
                        value={formRecord.dim3Assessment.score}
                        onChange={(e) => {
                          const sc = Number(e.target.value);
                          const rub = PM_DIGITAL_RUBRICS[2].levels[sc as 1 | 2 | 3 | 4];
                          const updated = {
                            ...formRecord,
                            dim3Assessment: {
                              ...formRecord.dim3Assessment,
                              score: sc,
                              level: rub.label as any
                            }
                          };
                          setFormRecord(recalculateFormMetrics(updated));
                        }}
                        className="px-2.5 py-1 text-xs font-bold bg-white border border-slate-300 rounded-lg text-cyan-800"
                      >
                        <option value={4}>Skor 4 (Membudaya)</option>
                        <option value={3}>Skor 3 (Matang)</option>
                        <option value={2}>Skor 2 (Berkembang)</option>
                        <option value={1}>Skor 1 (Terbatas)</option>
                      </select>
                    </div>

                    <input
                      type="text"
                      placeholder="Tools asesmen digital (misal: Quizizz analitik, Google Forms bertingkat)"
                      value={formRecord.dim3Assessment.assessmentTool}
                      onChange={(e) =>
                        setFormRecord({
                          ...formRecord,
                          dim3Assessment: { ...formRecord.dim3Assessment, assessmentTool: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />

                    <textarea
                      rows={2}
                      placeholder="Catatan analisis umpan balik instan berbasis data..."
                      value={formRecord.dim3Assessment.notes}
                      onChange={(e) =>
                        setFormRecord({
                          ...formRecord,
                          dim3Assessment: { ...formRecord.dim3Assessment, notes: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  {/* Dimensi 4: Etika & AI */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                        4. Etika Digital, Keamanan & Literasi AI (25 Poin)
                      </h4>
                      <select
                        value={formRecord.dim4EthicsAndAi.score}
                        onChange={(e) => {
                          const sc = Number(e.target.value);
                          const rub = PM_DIGITAL_RUBRICS[3].levels[sc as 1 | 2 | 3 | 4];
                          const updated = {
                            ...formRecord,
                            dim4EthicsAndAi: {
                              ...formRecord.dim4EthicsAndAi,
                              score: sc,
                              level: rub.label as any
                            }
                          };
                          setFormRecord(recalculateFormMetrics(updated));
                        }}
                        className="px-2.5 py-1 text-xs font-bold bg-white border border-slate-300 rounded-lg text-cyan-800"
                      >
                        <option value={4}>Skor 4 (Membudaya)</option>
                        <option value={3}>Skor 3 (Matang)</option>
                        <option value={2}>Skor 2 (Berkembang)</option>
                        <option value={1}>Skor 1 (Terbatas)</option>
                      </select>
                    </div>

                    <input
                      type="text"
                      placeholder="Integrasi AI & Etika (misal: sitasi hak cipta, uji kritis hasil ChatGPT/Gemini)"
                      value={formRecord.dim4EthicsAndAi.aiUsageNotes}
                      onChange={(e) =>
                        setFormRecord({
                          ...formRecord,
                          dim4EthicsAndAi: { ...formRecord.dim4EthicsAndAi, aiUsageNotes: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />

                    <textarea
                      rows={2}
                      placeholder="Catatan etika digital, anti-plagiasi, dan literasi informasi..."
                      value={formRecord.dim4EthicsAndAi.notes}
                      onChange={(e) =>
                        setFormRecord({
                          ...formRecord,
                          dim4EthicsAndAi: { ...formRecord.dim4EthicsAndAi, notes: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: 5 PILAR DIGITAL */}
              {activeFormTab === 'checklist' && (
                <div className="space-y-4">
                  <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 text-xs text-teal-900 leading-relaxed">
                    Centang indikator pilar ekosistem digital yang telah terbukti secara nyata diaplikasikan dalam sesi pembelajaran:
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        key: 'createsDigitalArtifacts' as const,
                        label: '1. Murid Memproduksi Artefak Digital Orisinal',
                        desc: 'Murid berkarya memproduksi poster Canva, simulasi PhET, video edukasi, podcast, atau coding, bukan sekadar penonton pasif.'
                      },
                      {
                        key: 'realtimeCollaboration' as const,
                        label: '2. Kolaborasi Cloud Bersama Secara Real-Time',
                        desc: 'Bekerja tim secara simultan dalam satu dokumen/kanvas bersama (Google Docs/Slides, Padlet, Jamboard).'
                      },
                      {
                        key: 'adaptiveAssessmentFeedback' as const,
                        label: '3. Asesmen Formatif Adaptif & Analitik Instan',
                        desc: 'Pemanfaatan data kuis gamifikasi digital (Quizizz/Kahoot/Forms) untuk memandu diferensiasi seketika.'
                      },
                      {
                        key: 'digitalEthicsAndAi' as const,
                        label: '4. Penerapan Etika Siber, Hak Cipta & Literasi AI',
                        desc: 'Pembiasaan sitasi orisinalitas, anti-plagiasi, dan pemanfaatan AI generatif sebagai rekan bertukar pikiran yang etis.'
                      },
                      {
                        key: 'authenticAudience' as const,
                        label: '5. Publikasi Karya ke Audiens Nyata (*Authentic Audience*)',
                        desc: 'Karya murid dipamerkan melampaui dinding kelas (website sekolah, media sosial edukasi, atau dibagikan ke orang tua).'
                      }
                    ].map((item) => (
                      <label
                        key={item.key}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                          formRecord.checklist[item.key]
                            ? 'bg-teal-50/70 border-teal-300'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formRecord.checklist[item.key]}
                          onChange={(e) => {
                            const updated = {
                              ...formRecord,
                              checklist: { ...formRecord.checklist, [item.key]: e.target.checked }
                            };
                            setFormRecord(recalculateFormMetrics(updated));
                          }}
                          className="mt-1 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                        />
                        <div>
                          <div className="font-semibold text-slate-800 text-xs sm:text-sm">{item.label}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: DIAGNOSIS & REKOMENDASI */}
              {activeFormTab === 'recommendations' && (
                <div className="space-y-4">
                  <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase text-cyan-800 font-semibold">Skor Total Pemanfaatan Digital</div>
                      <div className="text-2xl font-black text-cyan-950">{formRecord.totalScore.toFixed(1)} / 100 Poin</div>
                      <div className="text-xs font-bold text-cyan-800">{formRecord.maturityLevel}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-600">Level SAMR: <strong>{formRecord.toolUsage.samrLevel}</strong></div>
                      <div className="text-xs text-slate-600">Hands-on Murid: <strong>{formRecord.toolUsage.studentHandsOnRatioPct.toFixed(1)}%</strong></div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kekuatan Unggulan Pemanfaatan Digital (Pisahkan dengan baris baru)
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

              <button
                type="button"
                onClick={handleSaveForm}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Evaluasi Digital</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN PRINT CONTAINER (FOR OFFICIAL DOCUMENT PRINTING) */}
      {selectedRecordForDetail && (
        <div id="printable-digital-pm-doc" className="hidden print:block p-8 bg-white text-slate-900 font-serif">
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
            <h2 className="text-sm font-extrabold uppercase">INSTRUMEN EVALUASI & OBSERVASI PEMANFAATAN DIGITAL (PM)</h2>
            <h3 className="text-xs font-bold text-teal-800">
              FOKUS: LEVERAGING DIGITAL FOR DEEP LEARNING & ANALISIS TANGGA SAMR
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
                <span className="text-[10px] text-slate-500 uppercase block">Skor Digital PM</span>
                <span className="text-xl font-bold text-teal-900">{selectedRecordForDetail.totalScore.toFixed(1)} / 100</span>
                <span className="text-xs font-bold block">{selectedRecordForDetail.maturityLevel}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Level SAMR</span>
                <span className="text-xl font-bold text-blue-900">{selectedRecordForDetail.toolUsage.samrLevel}</span>
                <span className="text-xs font-bold block">{selectedRecordForDetail.toolUsage.deviceType}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Rasio Hands-on Murid</span>
                <span className="text-xl font-bold text-emerald-800">{selectedRecordForDetail.toolUsage.studentHandsOnRatioPct.toFixed(1)}%</span>
                <span className="text-xs font-bold block">{selectedRecordForDetail.toolUsage.studentHandsOnDuration}m dari {selectedRecordForDetail.toolUsage.totalLessonDuration}m</span>
              </div>
            </div>
          </div>

          {/* 4 Dimensi Table */}
          <h4 className="text-xs font-bold uppercase bg-slate-800 text-white px-2 py-1 mb-2">
            I. Penilaian 4 Dimensi Pemanfaatan Digital (Total 100 Poin)
          </h4>
          <table className="w-full text-[11px] border border-slate-300 mb-4 border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 p-1.5 text-left w-1/3">Dimensi Penilaian</th>
                <th className="border border-slate-300 p-1.5 text-center w-24">Skor & Predikat</th>
                <th className="border border-slate-300 p-1.5 text-left">Uraian & Bukti Nyata di Kelas</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 p-1.5">
                  <strong>1. Peran Murid: Kreator Konten Digital</strong><br />
                  <span className="text-[10px] text-slate-500">Artefak: {selectedRecordForDetail.dim1CreatorRole.artifactsCreated}</span>
                </td>
                <td className="border border-slate-300 p-1.5 text-center font-bold">
                  Skor {selectedRecordForDetail.dim1CreatorRole.score}/4<br />
                  <span className="text-[10px] font-normal">({selectedRecordForDetail.dim1CreatorRole.level})</span>
                </td>
                <td className="border border-slate-300 p-1.5">
                  {selectedRecordForDetail.dim1CreatorRole.notes}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5">
                  <strong>2. Kolaborasi & Komunikasi Cloud</strong><br />
                  <span className="text-[10px] text-slate-500">Platform: {selectedRecordForDetail.dim2Collaboration.platforms}</span>
                </td>
                <td className="border border-slate-300 p-1.5 text-center font-bold">
                  Skor {selectedRecordForDetail.dim2Collaboration.score}/4<br />
                  <span className="text-[10px] font-normal">({selectedRecordForDetail.dim2Collaboration.level})</span>
                </td>
                <td className="border border-slate-300 p-1.5">
                  {selectedRecordForDetail.dim2Collaboration.notes}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5">
                  <strong>3. Asesmen Formatif Adaptif</strong><br />
                  <span className="text-[10px] text-slate-500">Instrumen: {selectedRecordForDetail.dim3Assessment.assessmentTool}</span>
                </td>
                <td className="border border-slate-300 p-1.5 text-center font-bold">
                  Skor {selectedRecordForDetail.dim3Assessment.score}/4<br />
                  <span className="text-[10px] font-normal">({selectedRecordForDetail.dim3Assessment.level})</span>
                </td>
                <td className="border border-slate-300 p-1.5">
                  {selectedRecordForDetail.dim3Assessment.notes}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5">
                  <strong>4. Etika Digital & Literasi AI</strong><br />
                  <span className="text-[10px] text-slate-500">Integrasi AI: {selectedRecordForDetail.dim4EthicsAndAi.aiUsageNotes}</span>
                </td>
                <td className="border border-slate-300 p-1.5 text-center font-bold">
                  Skor {selectedRecordForDetail.dim4EthicsAndAi.score}/4<br />
                  <span className="text-[10px] font-normal">({selectedRecordForDetail.dim4EthicsAndAi.level})</span>
                </td>
                <td className="border border-slate-300 p-1.5">
                  {selectedRecordForDetail.dim4EthicsAndAi.notes}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Section II: Rekomendasi */}
          <div className="border border-slate-300 p-3 mb-8 rounded text-xs space-y-1.5">
            <p><strong>Ringkasan SAMR:</strong> {selectedRecordForDetail.samrSummary}</p>
            <p><strong>Kekuatan Unggulan:</strong> {selectedRecordForDetail.keyStrengths.join('; ')}</p>
            <p><strong>Area Peningkatan Prioritas:</strong> {selectedRecordForDetail.keyGrowthAreas.join('; ')}</p>
            <p><strong>Rekomendasi Tindak Lanjut Pengawas:</strong> {selectedRecordForDetail.supervisoryRecommendations.join('; ')}</p>
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
