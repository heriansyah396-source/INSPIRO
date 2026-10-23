/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Handshake,
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
  Layers,
  ChevronRight,
  Share2,
  Users2,
  Building2,
  HeartHandshake,
  BookOpenCheck,
  Laptop
} from 'lucide-react';
import {
  PMLearningPartnershipRecord,
  PM_PARTNERSHIP_RUBRICS,
  PrimaryPartnerType,
  Teacher,
  AppSettings
} from '../types/inspiro';
import { UserRoleProfile } from '../services/firebase';
import { exportPartnershipPMToWord } from '../utils/partnershipPMExport';
import { printDocumentElement } from '../utils/documentExport';

interface PMLearningPartnershipViewProps {
  records: PMLearningPartnershipRecord[];
  teachers: Teacher[];
  settings: AppSettings;
  currentUser: UserRoleProfile | null;
  onSaveRecord: (record: PMLearningPartnershipRecord) => void;
  onDeleteRecord: (id: string) => void;
  onNavigateToPedagogicalPM?: () => void;
  onNavigateToLearningEnv?: () => void;
  onNavigateToDigitalPM?: () => void;
  showToast: (title: string, desc?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const PMLearningPartnershipView: React.FC<PMLearningPartnershipViewProps> = ({
  records,
  teachers,
  settings,
  currentUser,
  onSaveRecord,
  onDeleteRecord,
  onNavigateToPedagogicalPM,
  onNavigateToLearningEnv,
  onNavigateToDigitalPM,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [partnerTypeFilter, setPartnerTypeFilter] = useState<string>('all');
  const [maturityFilter, setMaturityFilter] = useState<string>('all');

  // Modal states
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<PMLearningPartnershipRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'identity' | 'dimensions' | 'checklist' | 'recommendations'>('identity');
  const [formRecord, setFormRecord] = useState<PMLearningPartnershipRecord | null>(null);

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
        r.partnerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSchool = schoolFilter === 'all' || r.schoolName === schoolFilter;
      const matchPartner = partnerTypeFilter === 'all' || r.primaryPartnerType === partnerTypeFilter;
      const matchMaturity = maturityFilter === 'all' || r.maturityLevel.includes(maturityFilter);

      return matchSearch && matchSchool && matchPartner && matchMaturity;
    });
  }, [records, searchTerm, schoolFilter, partnerTypeFilter, maturityFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = records.length;
    if (total === 0) {
      return {
        total: 0,
        avgScore: 0,
        deepeningCount: 0,
        realWorldCount: 0,
        studentVoiceHighPct: 0
      };
    }

    const sumScore = records.reduce((acc, r) => acc + r.totalScore, 0);
    const avgScore = Number((sumScore / total).toFixed(1));
    const deepeningCount = records.filter(
      (r) => r.maturityLevel.includes('Membudaya') || r.maturityLevel.includes('Matang')
    ).length;
    const realWorldCount = records.filter(
      (r) => r.primaryPartnerType === 'Praktisi / Tokoh Komunitas' || r.primaryPartnerType === 'Dunia Usaha / UMKM' || r.primaryPartnerType === 'Instansi / Lembaga Publik'
    ).length;
    const studentVoiceHigh = records.filter((r) => r.studentVoiceLevel === 'Tinggi').length;
    const studentVoiceHighPct = Math.round((studentVoiceHigh / total) * 100);

    return {
      total,
      avgScore,
      deepeningCount,
      realWorldCount,
      studentVoiceHighPct
    };
  }, [records]);

  // Handle open create modal
  const handleOpenCreateModal = () => {
    const defaultTeacher = teachers[0];
    const newRecord: PMLearningPartnershipRecord = {
      id: `part-${Date.now()}`,
      schoolName: defaultTeacher ? defaultTeacher.satuanPendidikan : (settings.schoolName || 'SMP Negeri 1 Merdeka Nusantara'),
      teacherId: defaultTeacher ? defaultTeacher.id : 'G001',
      teacherName: defaultTeacher ? defaultTeacher.nama : 'Guru Penggerak',
      teacherNip: defaultTeacher ? defaultTeacher.nip : '-',
      subject: defaultTeacher ? defaultTeacher.mapel : 'Pendidikan Pancasila',
      gradeClass: defaultTeacher ? defaultTeacher.kelas : 'VIII (Fase D)',
      topic: '',
      date: new Date().toISOString().split('T')[0],
      assessorName: settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
      assessorRole: settings.supervisorRole || 'Pengawas Sekolah',
      assessorNip: settings.supervisorNip || '19820415 200801 1 007',
      headmasterName: 'Dra. Hj. Nurhasanah, M.Pd.',
      headmasterNip: '19720815 199802 2 003',

      primaryPartnerType: 'Praktisi / Tokoh Komunitas',
      partnerName: '',
      partnerRoleInLearning: '',
      studentVoiceLevel: 'Tinggi',

      dim1StudentTeacher: {
        score: 3,
        level: 'Matang',
        coDesignPractices: '',
        notes: '',
        evidenceNotes: ''
      },
      dim2PeerToPeer: {
        score: 3,
        level: 'Matang',
        peerInteractionType: '',
        notes: '',
        evidenceNotes: ''
      },
      dim3FamilyPartnership: {
        score: 3,
        level: 'Matang',
        familyEngagementActivity: '',
        notes: '',
        evidenceNotes: ''
      },
      dim4CommunityRealWorld: {
        score: 3,
        level: 'Matang',
        realWorldImpact: '',
        notes: '',
        evidenceNotes: ''
      },

      checklist: {
        studentCoDesign: true,
        structuredPeerFeedback: true,
        familyTwoWayCommunication: true,
        authenticExpertInvolvement: false,
        authenticAudienceExhibition: false
      },

      totalScore: 75,
      maturityLevel: 'Level 3: Matang (Accelerating)',
      keyStrengths: [
        'Relasi guru dan murid terbuka dan dialogis.',
        'Budaya saling dukung antarmurid berjalan aktif.'
      ],
      keyGrowthAreas: [
        'Perlu memperluas keterlibatan orang tua melampaui pelaporan nilai.',
        'Perlu menghadirkan audiens nyata dari komunitas eksternal.'
      ],
      supervisoryRecommendations: [
        'Fasilitasi penyusunan rubrik kriteria sukses proyek bersama murid sebelum pembelajaran dimulai.',
        'Rancang pameran mini (showcase) karya murid untuk mengundang orang tua dan mitra lokal.'
      ],
      status: 'final',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setFormRecord(newRecord);
    setActiveFormTab('identity');
    setIsFormModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEditModal = (rec: PMLearningPartnershipRecord) => {
    setFormRecord(JSON.parse(JSON.stringify(rec)));
    setActiveFormTab('identity');
    setIsFormModalOpen(true);
  };

  // Recalculate score & maturity in form
  const calculateFormTotalScore = (rec: PMLearningPartnershipRecord): number => {
    const s1 = rec.dim1StudentTeacher.score * 6.25;
    const s2 = rec.dim2PeerToPeer.score * 6.25;
    const s3 = rec.dim3FamilyPartnership.score * 6.25;
    const s4 = rec.dim4CommunityRealWorld.score * 6.25;
    return Number((s1 + s2 + s3 + s4).toFixed(1));
  };

  const getMaturityFromScore = (score: number) => {
    if (score >= 87.5) return 'Level 4: Membudaya (Deepening)';
    if (score >= 70) return 'Level 3: Matang (Accelerating)';
    if (score >= 50) return 'Level 2: Berkembang (Developing)';
    return 'Level 1: Terbatas (Emerging)';
  };

  // Handle teacher change in form
  const handleTeacherChange = (teacherId: string) => {
    if (!formRecord) return;
    const t = teachers.find((tc) => tc.id === teacherId);
    if (t) {
      setFormRecord({
        ...formRecord,
        teacherId: t.id,
        teacherName: t.nama,
        teacherNip: t.nip,
        subject: t.mapel,
        gradeClass: t.kelas || formRecord.gradeClass,
        schoolName: t.satuanPendidikan || formRecord.schoolName
      });
    }
  };

  // Save form handler
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRecord) return;

    const total = calculateFormTotalScore(formRecord);
    const maturity = getMaturityFromScore(total);

    const updated: PMLearningPartnershipRecord = {
      ...formRecord,
      totalScore: total,
      maturityLevel: maturity as any,
      updatedAt: new Date().toISOString()
    };

    onSaveRecord(updated);
    setIsFormModalOpen(false);
    setFormRecord(null);
    showToast(
      'Evaluasi Kemitraan Disimpan',
      `Hasil telaah kemitraan pembelajaran ${updated.teacherName} berhasil disimpan.`,
      'success'
    );
  };

  // Print single record handler
  const handlePrintRecord = (rec: PMLearningPartnershipRecord) => {
    setSelectedRecordForDetail(rec);
    setTimeout(() => {
      printDocumentElement('pm-partnership-print-area', `Evaluasi_Kemitraan_PM_${rec.teacherName}`);
    }, 150);
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 70) return 'bg-sky-50 text-sky-700 border-sky-200';
    if (score >= 55) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner with Executive Presence */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-xl border border-sky-500/20">
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            {/* Zero-pill unboxed metadata */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wide text-sky-300">
              <span>Program Pengelolaan Pembelajaran Mendalam (PM)</span>
              <span aria-hidden="true" className="text-white/40">·</span>
              <span>Elemen 4: Kemitraan Pembelajaran (*Learning Partnerships*)</span>
              <span aria-hidden="true" className="text-white/40">·</span>
              <span className="text-sky-200">Kabupaten Sidenreng Rappang</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight flex items-center gap-3">
              <Handshake className="w-8 h-8 text-sky-400 shrink-0" />
              <span>Kemitraan Pembelajaran Mendalam</span>
            </h2>

            <p className="text-xs sm:text-sm text-sky-100/85 leading-relaxed font-normal">
              Instrumen evaluasi dan pendampingan 4 aliansi belajar: <strong>Murid-Guru (*Co-Design*)</strong>, <strong>Antarmurid (*Peer Tutoring &amp; Feedback*)</strong>, <strong>Keluarga (*Student-Led Conference*)</strong>, dan <strong>Komunitas / Dunia Nyata (*Place-Based Learning*)</strong>.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-sky-400 via-sky-300 to-blue-400 hover:from-sky-300 hover:to-blue-300 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-sky-500/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span>Tambah Evaluasi Kemitraan</span>
            </button>
          </div>
        </div>

        {/* Cross-Navigation PM Quartet Hub */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-sky-200 font-medium">Navigasi 4 Pilar Pembelajaran Mendalam:</span>
          <div className="flex flex-wrap items-center gap-2">
            {onNavigateToPedagogicalPM && (
              <button
                onClick={onNavigateToPedagogicalPM}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
              >
                <BookOpenCheck className="w-3.5 h-3.5 text-teal-300" />
                <span>1. Praktik Pedagogis</span>
              </button>
            )}
            {onNavigateToLearningEnv && (
              <button
                onClick={onNavigateToLearningEnv}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-rose-300" />
                <span>2. Lingkungan Belajar</span>
              </button>
            )}
            {onNavigateToDigitalPM && (
              <button
                onClick={onNavigateToDigitalPM}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
              >
                <Laptop className="w-3.5 h-3.5 text-blue-300" />
                <span>3. Pemanfaatan Digital</span>
              </button>
            )}
            <span className="px-3 py-1.5 rounded-lg bg-sky-500/25 text-sky-200 font-bold border border-sky-400/40 flex items-center gap-1.5">
              <Handshake className="w-3.5 h-3.5 text-sky-300" />
              <span>4. Kemitraan Belajar (Aktif)</span>
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Evaluasi */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Evaluasi</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.total} Rekam</h3>
            <p className="text-[11px] text-slate-500 mt-1">Kelas &amp; Praktik Kemitraan</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
            <Handshake className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Kematangan Membudaya/Matang */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kematangan Lanjut</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{metrics.deepeningCount} Guru</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Level Matang / Membudaya</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Mitra Dunia Nyata */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mitra Dunia Nyata</p>
            <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">{metrics.realWorldCount} Kelas</h3>
            <p className="text-[11px] text-slate-500 mt-1">UMKM, Komunitas &amp; Pakar</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Rata-Rata Skor */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rata-Rata Skor</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.avgScore} <span className="text-sm text-slate-400 font-medium">/ 100</span></h3>
            <p className="text-[11px] text-sky-600 font-medium mt-1">Kuartet Aliansi Belajar</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari guru, topik, mata pelajaran, mitra..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* School filter */}
          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Semua Sekolah Binaan</option>
            {availableSchools.map((sch) => (
              <option key={sch} value={sch}>{sch}</option>
            ))}
          </select>

          {/* Partner Type filter */}
          <select
            value={partnerTypeFilter}
            onChange={(e) => setPartnerTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Semua Tipe Mitra</option>
            <option value="Praktisi / Tokoh Komunitas">Praktisi / Tokoh Komunitas</option>
            <option value="Dunia Usaha / UMKM">Dunia Usaha / UMKM</option>
            <option value="Orang Tua / Keluarga">Orang Tua / Keluarga</option>
            <option value="Instansi / Lembaga Publik">Instansi / Lembaga Publik</option>
            <option value="Alumni / Komunitas Belajar Luar">Alumni / Komunitas Belajar</option>
          </select>

          {/* Maturity filter */}
          <select
            value={maturityFilter}
            onChange={(e) => setMaturityFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Semua Level Kematangan</option>
            <option value="Membudaya">Membudaya (Deepening)</option>
            <option value="Matang">Matang (Accelerating)</option>
            <option value="Berkembang">Berkembang (Developing)</option>
            <option value="Terbatas">Terbatas (Emerging)</option>
          </select>

          {(searchTerm || schoolFilter !== 'all' || partnerTypeFilter !== 'all' || maturityFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSchoolFilter('all');
                setPartnerTypeFilter('all');
                setMaturityFilter('all');
              }}
              className="p-2 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Reset Filter"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* List / Cards of Records */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
          <Handshake className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Tidak ada rekam kemitraan pembelajaran ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {searchTerm || schoolFilter !== 'all'
              ? 'Coba sesuaikan kata kunci atau filter pencarian Anda.'
              : 'Mulai rekam evaluasi kemitraan pembelajaran murid-guru, orang tua, dan komunitas sekarang.'}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Tambah Evaluasi Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-sky-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Header */}
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded-sm border border-sky-200">
                      {rec.primaryPartnerType}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-1">
                      {rec.teacherName}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">{rec.subject} · {rec.gradeClass}</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg border text-xs font-extrabold ${getScoreBadgeColor(rec.totalScore)}`}>
                    {rec.totalScore.toFixed(1)}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{rec.schoolName}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-xs text-slate-700 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-sky-600 mt-0.5 shrink-0" />
                    <span className="line-clamp-2"><strong>Mitra:</strong> {rec.partnerName}</span>
                  </div>
                  {rec.topic && (
                    <p className="text-[11px] text-slate-500 italic line-clamp-2 bg-slate-50 p-2 rounded-md border border-slate-100">
                      "{rec.topic}"
                    </p>
                  )}
                </div>

                {/* 4 Dimension Mini-Bars */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">1. Murid-Guru (Co-Design)</span>
                    <span className="font-semibold text-slate-700">{(rec.dim1StudentTeacher.score * 6.25).toFixed(1)}/25</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-500 h-full rounded-full"
                      style={{ width: `${(rec.dim1StudentTeacher.score / 4) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">2. Antarmurid (Peer Alliances)</span>
                    <span className="font-semibold text-slate-700">{(rec.dim2PeerToPeer.score * 6.25).toFixed(1)}/25</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{ width: `${(rec.dim2PeerToPeer.score / 4) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">3. Keluarga &amp; Orang Tua</span>
                    <span className="font-semibold text-slate-700">{(rec.dim3FamilyPartnership.score * 6.25).toFixed(1)}/25</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${(rec.dim3FamilyPartnership.score / 4) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">4. Komunitas &amp; Dunia Nyata</span>
                    <span className="font-semibold text-slate-700">{(rec.dim4CommunityRealWorld.score * 6.25).toFixed(1)}/25</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${(rec.dim4CommunityRealWorld.score / 4) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Level badge */}
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">Tingkat Kematangan:</span>
                  <span className="text-[11px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-sm">
                    {rec.maturityLevel}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">
                  {new Date(rec.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedRecordForDetail(rec);
                      setIsDetailOpen(true);
                    }}
                    className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-white rounded-md transition-colors"
                    title="Lihat Detail Telaah"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePrintRecord(rec)}
                    className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-white rounded-md transition-colors"
                    title="Cetak Dokumen Resmi"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => exportPartnershipPMToWord(rec, settings)}
                    className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-white rounded-md transition-colors"
                    title="Ekspor Word (.doc)"
                  >
                    <FileDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(rec)}
                    className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-white rounded-md transition-colors"
                    title="Edit Rekam"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus rekam kemitraan pembelajaran untuk guru ${rec.teacherName}?`)) {
                        onDeleteRecord(rec.id);
                        showToast('Rekam Dihapus', 'Evaluasi kemitraan pembelajaran telah dihapus.', 'info');
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FORM MODAL (CREATE / EDIT) */}
      {isFormModalOpen && formRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-6">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-sky-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center border border-sky-400/30">
                  <Handshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {formRecord.id.startsWith('part-') && !records.some(r => r.id === formRecord.id) ? 'Tambah Evaluasi Kemitraan Pembelajaran' : 'Edit Rekam Kemitraan Pembelajaran'}
                  </h3>
                  <p className="text-xs text-sky-200">
                    Instrumen 4 Dimensi Aliansi Belajar PM (Murid, Guru, Orang Tua, &amp; Komunitas)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-white/60 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0 text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => setActiveFormTab('identity')}
                className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeFormTab === 'identity'
                    ? 'border-sky-600 text-sky-700 bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>1. Identitas &amp; Profil Mitra</span>
              </button>
              <button
                onClick={() => setActiveFormTab('dimensions')}
                className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeFormTab === 'dimensions'
                    ? 'border-sky-600 text-sky-700 bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>2. 4 Dimensi Kemitraan (Rubrik)</span>
              </button>
              <button
                onClick={() => setActiveFormTab('checklist')}
                className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeFormTab === 'checklist'
                    ? 'border-sky-600 text-sky-700 bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>3. Checklist Pilar Otentik</span>
              </button>
              <button
                onClick={() => setActiveFormTab('recommendations')}
                className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeFormTab === 'recommendations'
                    ? 'border-sky-600 text-sky-700 bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>4. Analisis &amp; Rekomendasi</span>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: IDENTITAS */}
              {activeFormTab === 'identity' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Pilih Guru Terobservasi <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formRecord.teacherId}
                        onChange={(e) => handleTeacherChange(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800"
                        required
                      >
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nama} ({t.mapel} - {t.satuanPendidikan || 'Sekolah Binaan'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Satuan Pendidikan <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formRecord.schoolName}
                        onChange={(e) => setFormRecord({ ...formRecord, schoolName: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                      <input
                        type="text"
                        value={formRecord.subject}
                        onChange={(e) => setFormRecord({ ...formRecord, subject: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Kelas / Fase</label>
                      <input
                        type="text"
                        value={formRecord.gradeClass}
                        onChange={(e) => setFormRecord({ ...formRecord, gradeClass: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Telaah</label>
                      <input
                        type="date"
                        value={formRecord.date}
                        onChange={(e) => setFormRecord({ ...formRecord, date: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Topik / Tema Pembelajaran Mendalam
                    </label>
                    <input
                      type="text"
                      value={formRecord.topic}
                      onChange={(e) => setFormRecord({ ...formRecord, topic: e.target.value })}
                      placeholder="Contoh: Investigasi Ekosistem Saluran Irigasi Sawah Berkelanjutan"
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800"
                      required
                    />
                  </div>

                  {/* PROFIL MITRA UTAMA */}
                  <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-100 space-y-4">
                    <h4 className="text-xs font-extrabold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-sky-600" />
                      <span>Profil Mitra Utama Pembelajaran</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Tipe Mitra Utama <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formRecord.primaryPartnerType}
                          onChange={(e) =>
                            setFormRecord({ ...formRecord, primaryPartnerType: e.target.value as PrimaryPartnerType })
                          }
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800"
                        >
                          <option value="Praktisi / Tokoh Komunitas">Praktisi / Tokoh Komunitas</option>
                          <option value="Dunia Usaha / UMKM">Dunia Usaha / UMKM</option>
                          <option value="Orang Tua / Keluarga">Orang Tua / Keluarga</option>
                          <option value="Instansi / Lembaga Publik">Instansi / Lembaga Publik</option>
                          <option value="Alumni / Komunitas Belajar Luar">Alumni / Komunitas Belajar Luar</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nama Lembaga / Tokoh Mitra <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formRecord.partnerName}
                          onChange={(e) => setFormRecord({ ...formRecord, partnerName: e.target.value })}
                          placeholder="Contoh: Kelompok Tani Sipadeceng & Balai Penyuluhan Pertanian"
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Peran Nyata Mitra dalam Pembelajaran
                        </label>
                        <input
                          type="text"
                          value={formRecord.partnerRoleInLearning}
                          onChange={(e) => setFormRecord({ ...formRecord, partnerRoleInLearning: e.target.value })}
                          placeholder="Contoh: Narasumber lapangan, mentor uji sampel air, dan audiens penerima laporan murid"
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Derajat Agensi / Suara Murid
                        </label>
                        <select
                          value={formRecord.studentVoiceLevel}
                          onChange={(e) =>
                            setFormRecord({ ...formRecord, studentVoiceLevel: e.target.value as 'Tinggi' | 'Sedang' | 'Rendah' })
                          }
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800"
                        >
                          <option value="Tinggi">Tinggi (Voice &amp; Choice Penuh)</option>
                          <option value="Sedang">Sedang (Pilihan Sebagian)</option>
                          <option value="Rendah">Rendah (Didikte Penuh)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: 4 DIMENSI KEMITRAAN */}
              {activeFormTab === 'dimensions' && (
                <div className="space-y-6">
                  {PM_PARTNERSHIP_RUBRICS.map((rubric) => {
                    let currentScore = 3;
                    let currentField = 'dim1StudentTeacher';
                    if (rubric.number === 1) currentScore = formRecord.dim1StudentTeacher.score;
                    if (rubric.number === 2) currentScore = formRecord.dim2PeerToPeer.score;
                    if (rubric.number === 3) currentScore = formRecord.dim3FamilyPartnership.score;
                    if (rubric.number === 4) currentScore = formRecord.dim4CommunityRealWorld.score;

                    const handleScoreSelect = (levelKey: 1 | 2 | 3 | 4) => {
                      const levelName = rubric.levels[levelKey].label;
                      if (rubric.number === 1) {
                        setFormRecord({
                          ...formRecord,
                          dim1StudentTeacher: { ...formRecord.dim1StudentTeacher, score: levelKey, level: levelName as any }
                        });
                      } else if (rubric.number === 2) {
                        setFormRecord({
                          ...formRecord,
                          dim2PeerToPeer: { ...formRecord.dim2PeerToPeer, score: levelKey, level: levelName as any }
                        });
                      } else if (rubric.number === 3) {
                        setFormRecord({
                          ...formRecord,
                          dim3FamilyPartnership: { ...formRecord.dim3FamilyPartnership, score: levelKey, level: levelName as any }
                        });
                      } else if (rubric.number === 4) {
                        setFormRecord({
                          ...formRecord,
                          dim4CommunityRealWorld: { ...formRecord.dim4CommunityRealWorld, score: levelKey, level: levelName as any }
                        });
                      }
                    };

                    return (
                      <div key={rubric.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">
                              Dimensi {rubric.number} (Maks 25 Poin)
                            </span>
                            <h4 className="text-sm font-bold text-slate-900">{rubric.title}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{rubric.description}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                              {(currentScore * 6.25).toFixed(1)} / 25 Poin
                            </span>
                          </div>
                        </div>

                        {/* Interactive Level Rubric Selection */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2">
                          {([1, 2, 3, 4] as const).map((lvl) => {
                            const isSelected = currentScore === lvl;
                            return (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => handleScoreSelect(lvl)}
                                className={`text-left p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                                  isSelected
                                    ? 'bg-sky-50/80 border-sky-500 ring-2 ring-sky-500/20 shadow-xs'
                                    : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/70'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={`text-[11px] font-extrabold ${isSelected ? 'text-sky-800' : 'text-slate-700'}`}>
                                      Level {lvl}: {rubric.levels[lvl].label}
                                    </span>
                                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />}
                                  </div>
                                  <p className="text-[11px] text-slate-600 leading-relaxed">
                                    {rubric.levels[lvl].criteria}
                                  </p>
                                </div>
                                <span className="text-[10px] text-slate-400 font-semibold mt-2">
                                  {rubric.levels[lvl].points} Pts
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Specific Notes & Evidence */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Uraian Praktik Nyata / Catatan Kemitraan
                            </label>
                            <textarea
                              rows={2}
                              value={
                                rubric.number === 1
                                  ? formRecord.dim1StudentTeacher.notes
                                  : rubric.number === 2
                                  ? formRecord.dim2PeerToPeer.notes
                                  : rubric.number === 3
                                  ? formRecord.dim3FamilyPartnership.notes
                                  : formRecord.dim4CommunityRealWorld.notes
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                if (rubric.number === 1) {
                                  setFormRecord({ ...formRecord, dim1StudentTeacher: { ...formRecord.dim1StudentTeacher, notes: val } });
                                } else if (rubric.number === 2) {
                                  setFormRecord({ ...formRecord, dim2PeerToPeer: { ...formRecord.dim2PeerToPeer, notes: val } });
                                } else if (rubric.number === 3) {
                                  setFormRecord({ ...formRecord, dim3FamilyPartnership: { ...formRecord.dim3FamilyPartnership, notes: val } });
                                } else if (rubric.number === 4) {
                                  setFormRecord({ ...formRecord, dim4CommunityRealWorld: { ...formRecord.dim4CommunityRealWorld, notes: val } });
                                }
                              }}
                              placeholder="Deskripsi interaksi nyata guru, murid, orang tua, atau mitra..."
                              className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Bukti Fisik / Artefak Teramati
                            </label>
                            <textarea
                              rows={2}
                              value={
                                rubric.number === 1
                                  ? formRecord.dim1StudentTeacher.evidenceNotes
                                  : rubric.number === 2
                                  ? formRecord.dim2PeerToPeer.evidenceNotes
                                  : rubric.number === 3
                                  ? formRecord.dim3FamilyPartnership.evidenceNotes
                                  : formRecord.dim4CommunityRealWorld.evidenceNotes
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                if (rubric.number === 1) {
                                  setFormRecord({ ...formRecord, dim1StudentTeacher: { ...formRecord.dim1StudentTeacher, evidenceNotes: val } });
                                } else if (rubric.number === 2) {
                                  setFormRecord({ ...formRecord, dim2PeerToPeer: { ...formRecord.dim2PeerToPeer, evidenceNotes: val } });
                                } else if (rubric.number === 3) {
                                  setFormRecord({ ...formRecord, dim3FamilyPartnership: { ...formRecord.dim3FamilyPartnership, evidenceNotes: val } });
                                } else if (rubric.number === 4) {
                                  setFormRecord({ ...formRecord, dim4CommunityRealWorld: { ...formRecord.dim4CommunityRealWorld, evidenceNotes: val } });
                                }
                              }}
                              placeholder="Contoh: Lembar rubrik bersama, foto dialog sawah, dokumen rekomendasi P3A..."
                              className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 3: CHECKLIST PILAR KEMITRAAN */}
              {activeFormTab === 'checklist' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100">
                    <h4 className="text-xs font-bold text-sky-900 mb-1">
                      Checklist Standar Kemitraan Pembelajaran Otentik
                    </h4>
                    <p className="text-[11px] text-sky-700">
                      Tandai pilar-pilar aliansi belajar yang terbukti terlaksana secara konkret di kelas atau lapangan.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formRecord.checklist.studentCoDesign}
                        onChange={(e) =>
                          setFormRecord({
                            ...formRecord,
                            checklist: { ...formRecord.checklist, studentCoDesign: e.target.checked }
                          })
                        }
                        className="w-4 h-4 text-sky-600 rounded-sm mt-0.5 focus:ring-sky-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          1. Perancangan Bersama &amp; Kriteria Sukses (Co-Design &amp; Agency)
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Murid diajak merancang alur investigasi, memilih metode demonstrasi pemahaman, atau menyepakati rubrik bersama guru.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formRecord.checklist.structuredPeerFeedback}
                        onChange={(e) =>
                          setFormRecord({
                            ...formRecord,
                            checklist: { ...formRecord.checklist, structuredPeerFeedback: e.target.checked }
                          })
                        }
                        className="w-4 h-4 text-sky-600 rounded-sm mt-0.5 focus:ring-sky-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          2. Umpan Balik Antarteman Terstruktur (Structured Peer-Feedback)
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Terjadi sesi saling mengulas draf karya rakan sebaya menggunakan protokol terstruktur (TAG / Warm &amp; Cool Feedback).
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formRecord.checklist.familyTwoWayCommunication}
                        onChange={(e) =>
                          setFormRecord({
                            ...formRecord,
                            checklist: { ...formRecord.checklist, familyTwoWayCommunication: e.target.checked }
                          })
                        }
                        className="w-4 h-4 text-sky-600 rounded-sm mt-0.5 focus:ring-sky-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          3. Dialog Dua Arah dengan Keluarga &amp; Orang Tua
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Orang tua dilibatkan dalam penugasan eksplorasi rumah atau forum pemaparan kemajuan belajar yang dipimpin murid.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formRecord.checklist.authenticExpertInvolvement}
                        onChange={(e) =>
                          setFormRecord({
                            ...formRecord,
                            checklist: { ...formRecord.checklist, authenticExpertInvolvement: e.target.checked }
                          })
                        }
                        className="w-4 h-4 text-sky-600 rounded-sm mt-0.5 focus:ring-sky-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          4. Keterlibatan Praktisi / Ahli Luar (Authentic Expert Mentorship)
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Menghadirkan tokoh masyarakat, petani, wirausahawan, dokter, atau instansi publik untuk memperkaya wawasan lapangan.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formRecord.checklist.authenticAudienceExhibition}
                        onChange={(e) =>
                          setFormRecord({
                            ...formRecord,
                            checklist: { ...formRecord.checklist, authenticAudienceExhibition: e.target.checked }
                          })
                        }
                        className="w-4 h-4 text-sky-600 rounded-sm mt-0.5 focus:ring-sky-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          5. Gelar Karya / Uji Coba ke Audiens Nyata (Authentic Audience Exhibition)
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Hasil karya tidak hanya dinilai guru, namun dipamerkan, diserahkan, atau diuji oleh masyarakat/pengguna manfaat riil.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 4: REKOMENDASI & KEKUATAN */}
              {activeFormTab === 'recommendations' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 font-bold uppercase">Estimasi Total Skor</span>
                      <h4 className="text-2xl font-extrabold text-sky-700">
                        {calculateFormTotalScore(formRecord)} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 font-bold uppercase">Predikat Kematangan</span>
                      <p className="text-xs font-extrabold text-slate-800 mt-1">
                        {getMaturityFromScore(calculateFormTotalScore(formRecord))}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kekuatan Utama Kemitraan (Pisahkan dengan baris baru)
                    </label>
                    <textarea
                      rows={3}
                      value={formRecord.keyStrengths.join('\n')}
                      onChange={(e) =>
                        setFormRecord({
                          ...formRecord,
                          keyStrengths: e.target.value.split('\n').filter((s) => s.trim())
                        })
                      }
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Area Pertumbuhan Lanjutan (Pisahkan dengan baris baru)
                    </label>
                    <textarea
                      rows={3}
                      value={formRecord.keyGrowthAreas.join('\n')}
                      onChange={(e) =>
                        setFormRecord({
                          ...formRecord,
                          keyGrowthAreas: e.target.value.split('\n').filter((s) => s.trim())
                        })
                      }
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Rekomendasi Intervensi Pengawas Pembina (Pisahkan dengan baris baru)
                    </label>
                    <textarea
                      rows={3}
                      value={formRecord.supervisoryRecommendations.join('\n')}
                      onChange={(e) =>
                        setFormRecord({
                          ...formRecord,
                          supervisoryRecommendations: e.target.value.split('\n').filter((s) => s.trim())
                        })
                      }
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <div className="flex items-center gap-2">
                  {activeFormTab !== 'recommendations' ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeFormTab === 'identity') setActiveFormTab('dimensions');
                        else if (activeFormTab === 'dimensions') setActiveFormTab('checklist');
                        else if (activeFormTab === 'checklist') setActiveFormTab('recommendations');
                      }}
                      className="px-4 py-2 text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Lanjut</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan Rekam Kemitraan</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL / INSPECTION MODAL */}
      {isDetailOpen && selectedRecordForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Handshake className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold">Rincian Evaluasi Kemitraan Pembelajaran</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintRecord(selectedRecordForDetail)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>
                <button
                  onClick={() => exportPartnershipPMToWord(selectedRecordForDetail, settings)}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Word</span>
                </button>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="text-white/60 hover:text-white p-1 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Identity Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold">Guru / NIP:</span>
                  <p className="text-sm font-bold text-slate-800">{selectedRecordForDetail.teacherName}</p>
                  <p className="text-slate-500 font-mono mt-0.5">{selectedRecordForDetail.teacherNip || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">Satuan Pendidikan:</span>
                  <p className="text-sm font-bold text-slate-800">{selectedRecordForDetail.schoolName}</p>
                  <p className="text-slate-500 mt-0.5">{selectedRecordForDetail.subject} · {selectedRecordForDetail.gradeClass}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">Mitra Utama:</span>
                  <p className="text-xs font-bold text-sky-800 mt-0.5">
                    {selectedRecordForDetail.partnerName} ({selectedRecordForDetail.primaryPartnerType})
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">{selectedRecordForDetail.partnerRoleInLearning || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">Skor &amp; Derajat Agensi:</span>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">
                    Skor: {selectedRecordForDetail.totalScore.toFixed(1)} / 100 ({selectedRecordForDetail.maturityLevel})
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Agensi Murid: {selectedRecordForDetail.studentVoiceLevel}</p>
                </div>
              </div>

              {/* 4 Dimensions Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Capaian 4 Dimensi Kemitraan Pembelajaran
                </h4>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">1. Kemitraan Murid &amp; Guru (Co-Design &amp; Agency)</span>
                      <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-sm">
                        {(selectedRecordForDetail.dim1StudentTeacher.score * 6.25).toFixed(1)} / 25 Poin
                      </span>
                    </div>
                    {selectedRecordForDetail.dim1StudentTeacher.coDesignPractices && (
                      <p className="text-[11px] text-slate-700"><strong>Bentuk Co-Design:</strong> {selectedRecordForDetail.dim1StudentTeacher.coDesignPractices}</p>
                    )}
                    <p className="text-[11px] text-slate-600">{selectedRecordForDetail.dim1StudentTeacher.notes}</p>
                    <p className="text-[11px] text-slate-400 italic">Bukti: {selectedRecordForDetail.dim1StudentTeacher.evidenceNotes}</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">2. Kemitraan Antarmurid (Peer Alliances &amp; Feedback)</span>
                      <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-sm">
                        {(selectedRecordForDetail.dim2PeerToPeer.score * 6.25).toFixed(1)} / 25 Poin
                      </span>
                    </div>
                    {selectedRecordForDetail.dim2PeerToPeer.peerInteractionType && (
                      <p className="text-[11px] text-slate-700"><strong>Bentuk Interaksi:</strong> {selectedRecordForDetail.dim2PeerToPeer.peerInteractionType}</p>
                    )}
                    <p className="text-[11px] text-slate-600">{selectedRecordForDetail.dim2PeerToPeer.notes}</p>
                    <p className="text-[11px] text-slate-400 italic">Bukti: {selectedRecordForDetail.dim2PeerToPeer.evidenceNotes}</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">3. Kemitraan Keluarga &amp; Orang Tua (Student-Led Conference)</span>
                      <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-sm">
                        {(selectedRecordForDetail.dim3FamilyPartnership.score * 6.25).toFixed(1)} / 25 Poin
                      </span>
                    </div>
                    {selectedRecordForDetail.dim3FamilyPartnership.familyEngagementActivity && (
                      <p className="text-[11px] text-slate-700"><strong>Aktivitas Keluarga:</strong> {selectedRecordForDetail.dim3FamilyPartnership.familyEngagementActivity}</p>
                    )}
                    <p className="text-[11px] text-slate-600">{selectedRecordForDetail.dim3FamilyPartnership.notes}</p>
                    <p className="text-[11px] text-slate-400 italic">Bukti: {selectedRecordForDetail.dim3FamilyPartnership.evidenceNotes}</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">4. Kemitraan Komunitas &amp; Dunia Nyata (Place-Based Impact)</span>
                      <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-sm">
                        {(selectedRecordForDetail.dim4CommunityRealWorld.score * 6.25).toFixed(1)} / 25 Poin
                      </span>
                    </div>
                    {selectedRecordForDetail.dim4CommunityRealWorld.realWorldImpact && (
                      <p className="text-[11px] text-slate-700"><strong>Dampak Nyata:</strong> {selectedRecordForDetail.dim4CommunityRealWorld.realWorldImpact}</p>
                    )}
                    <p className="text-[11px] text-slate-600">{selectedRecordForDetail.dim4CommunityRealWorld.notes}</p>
                    <p className="text-[11px] text-slate-400 italic">Bukti: {selectedRecordForDetail.dim4CommunityRealWorld.evidenceNotes}</p>
                  </div>
                </div>
              </div>

              {/* Recommendations Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <h5 className="text-xs font-bold text-emerald-800 mb-2">Kekuatan Kemitraan Teramati:</h5>
                  <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
                    {selectedRecordForDetail.keyStrengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-100">
                  <h5 className="text-xs font-bold text-sky-900 mb-2">Rekomendasi Intervensi Pengawas:</h5>
                  <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
                    {selectedRecordForDetail.supervisoryRecommendations.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT-ONLY AREA FORMATTED FOR OFFICIAL KOP SURAT */}
      {selectedRecordForDetail && (
        <div id="pm-partnership-print-area" className="hidden print:block p-8 bg-white text-slate-900">
          <div className="text-center border-b-2 border-slate-900 pb-3 mb-6">
            <h4 className="text-sm font-bold tracking-wider">{settings.governmentAgency || 'PEMERINTAH KABUPATEN SIDENRENG RAPPANG'}</h4>
            <h3 className="text-base font-extrabold tracking-wide">DINAS PENDIDIKAN DAN KEBUDAYAAN</h3>
            <h5 className="text-xs font-bold text-blue-900">KANTOR PENGAWAS SEKOLAH PEMBINA SATUAN PENDIDIKAN</h5>
            <p className="text-[9px] italic text-slate-600 mt-1">
              {settings.schoolAddress || 'Komp. SKPD Blok B Terpadu, Jl. Harapan Baru, Pangkajene, Kab. Sidenreng Rappang 91611'}
            </p>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wide">
              INSTRUMEN EVALUASI KEMITRAAN PEMBELAJARAN (PM)
            </h3>
            <p className="text-xs font-semibold text-sky-800">
              4 Dimensi Aliansi Belajar: Murid-Guru, Antarmurid, Orang Tua, &amp; Komunitas Dunia Nyata
            </p>
          </div>

          <table className="w-full text-xs mb-5 border-collapse">
            <tbody>
              <tr>
                <td className="w-1/4 py-1 font-bold text-slate-600">Satuan Pendidikan</td>
                <td className="w-2">:</td>
                <td className="font-bold">{selectedRecordForDetail.schoolName}</td>
              </tr>
              <tr>
                <td className="py-1 font-bold text-slate-600">Nama Guru / NIP</td>
                <td>:</td>
                <td>{selectedRecordForDetail.teacherName} ({selectedRecordForDetail.teacherNip || '-'})</td>
              </tr>
              <tr>
                <td className="py-1 font-bold text-slate-600">Mata Pelajaran / Kelas</td>
                <td>:</td>
                <td>{selectedRecordForDetail.subject} / {selectedRecordForDetail.gradeClass}</td>
              </tr>
              <tr>
                <td className="py-1 font-bold text-slate-600">Mitra Utama / Peran</td>
                <td>:</td>
                <td><strong>{selectedRecordForDetail.partnerName}</strong> ({selectedRecordForDetail.primaryPartnerType})</td>
              </tr>
              <tr>
                <td className="py-1 font-bold text-slate-600">Total Skor / Kematangan</td>
                <td>:</td>
                <td className="font-bold text-sky-800">
                  {selectedRecordForDetail.totalScore.toFixed(1)} / 100 ({selectedRecordForDetail.maturityLevel})
                </td>
              </tr>
            </tbody>
          </table>

          <table className="w-full text-xs border border-slate-700 border-collapse mb-6">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-700 p-2 text-center w-10">No</th>
                <th className="border border-slate-700 p-2 text-left w-1/3">Dimensi Kemitraan PM</th>
                <th className="border border-slate-700 p-2 text-center w-20">Skor</th>
                <th className="border border-slate-700 p-2 text-left">Uraian Praktik &amp; Bukti Teramati</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-700 p-2 text-center">1</td>
                <td className="border border-slate-700 p-2 font-bold">Kemitraan Murid &amp; Guru (Co-Design &amp; Agensi)</td>
                <td className="border border-slate-700 p-2 text-center font-bold">{(selectedRecordForDetail.dim1StudentTeacher.score * 6.25).toFixed(1)}/25</td>
                <td className="border border-slate-700 p-2">
                  <p>{selectedRecordForDetail.dim1StudentTeacher.notes}</p>
                  <p className="text-[10px] italic text-slate-500 mt-1">Bukti: {selectedRecordForDetail.dim1StudentTeacher.evidenceNotes}</p>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-700 p-2 text-center">2</td>
                <td className="border border-slate-700 p-2 font-bold">Kemitraan Antarmurid (Peer Alliances &amp; Feedback)</td>
                <td className="border border-slate-700 p-2 text-center font-bold">{(selectedRecordForDetail.dim2PeerToPeer.score * 6.25).toFixed(1)}/25</td>
                <td className="border border-slate-700 p-2">
                  <p>{selectedRecordForDetail.dim2PeerToPeer.notes}</p>
                  <p className="text-[10px] italic text-slate-500 mt-1">Bukti: {selectedRecordForDetail.dim2PeerToPeer.evidenceNotes}</p>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-700 p-2 text-center">3</td>
                <td className="border border-slate-700 p-2 font-bold">Kemitraan Keluarga &amp; Orang Tua (Student-Led)</td>
                <td className="border border-slate-700 p-2 text-center font-bold">{(selectedRecordForDetail.dim3FamilyPartnership.score * 6.25).toFixed(1)}/25</td>
                <td className="border border-slate-700 p-2">
                  <p>{selectedRecordForDetail.dim3FamilyPartnership.notes}</p>
                  <p className="text-[10px] italic text-slate-500 mt-1">Bukti: {selectedRecordForDetail.dim3FamilyPartnership.evidenceNotes}</p>
                </td>
              </tr>
              <tr>
                <td className="border border-slate-700 p-2 text-center">4</td>
                <td className="border border-slate-700 p-2 font-bold">Kemitraan Komunitas &amp; Dunia Nyata (Place-Based)</td>
                <td className="border border-slate-700 p-2 text-center font-bold">{(selectedRecordForDetail.dim4CommunityRealWorld.score * 6.25).toFixed(1)}/25</td>
                <td className="border border-slate-700 p-2">
                  <p>{selectedRecordForDetail.dim4CommunityRealWorld.notes}</p>
                  <p className="text-[10px] italic text-slate-500 mt-1">Bukti: {selectedRecordForDetail.dim4CommunityRealWorld.evidenceNotes}</p>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Signature Blocks */}
          <div className="mt-12 grid grid-cols-2 text-center text-xs break-inside-avoid">
            <div>
              <p>Mengetahui,</p>
              <p className="font-semibold">Kepala Satuan Pendidikan</p>
              <div className="h-16" />
              <p className="font-bold underline">{selectedRecordForDetail.headmasterName || 'Dra. Hj. Nurhasanah, M.Pd.'}</p>
              <p className="text-[10px]">NIP. {selectedRecordForDetail.headmasterNip || '19720815 199802 2 003'}</p>
            </div>
            <div>
              <p>{settings.schoolCity || 'Kabupaten Sidenreng Rappang'}, {new Date(selectedRecordForDetail.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-semibold">Pengawas Sekolah Pembina,</p>
              <div className="h-16" />
              <p className="font-bold underline">{selectedRecordForDetail.assessorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'}</p>
              <p className="text-[10px]">NIP. {selectedRecordForDetail.assessorNip || '19820415 200801 1 007'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
