/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Compass,
  Plus,
  Search,
  School,
  User,
  Calendar,
  FileText,
  Printer,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Crown,
  FileSpreadsheet,
  Laptop,
  ShieldCheck,
  HeartHandshake,
  Users,
  ChevronRight,
  X,
  FileDown,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import {
  ManagerialMaturityRecord,
  MaturityLevelId,
  ManagerialDimensionId,
  Principal,
  AppSettings
} from '../types/inspiro';
import {
  MANAGERIAL_DIMENSIONS,
  MATURITY_LEVELS,
  calculateMaturityPosition,
  generateMaturityAIAnalysis
} from '../services/aiPrincipalMaturity';
import { exportPrincipalMaturityToWord } from '../utils/storage';
import { DEFAULT_SIDRAP_LOGO, DEFAULT_TUTWURI_LOGO } from '../data/defaultLogos';

interface PrincipalMaturityViewProps {
  records: ManagerialMaturityRecord[];
  principals: Principal[];
  settings: AppSettings;
  onSaveRecord: (record: ManagerialMaturityRecord) => void;
  onDeleteRecord: (id: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const PrincipalMaturityView: React.FC<PrincipalMaturityViewProps> = ({
  records,
  principals,
  settings,
  onSaveRecord,
  onDeleteRecord,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');

  // Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<ManagerialMaturityRecord | null>(null);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [activeTabForm, setActiveTabForm] = useState<'scoring' | 'result'>('scoring');

  // Form State
  const [formData, setFormData] = useState<Partial<ManagerialMaturityRecord>>({
    title: '',
    principalId: '',
    schoolName: '',
    schoolNpsn: '',
    headmasterName: '',
    headmasterNip: '',
    headmasterRank: '',
    supervisorName: settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    supervisorNip: settings.supervisorNip || '19830819 201001 1 002',
    supervisorRole: 'Pengawas Sekolah Pembina (Asesor)',
    supervisorRank: settings.supervisorRank || 'Penata Tk. I / III.d',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    date: new Date().toISOString().split('T')[0],
    scores: {
      dimensi_pbd: 3,
      dimensi_instruksional: 3,
      dimensi_sarana_digital: 3,
      dimensi_iklim_karakter: 3,
      dimensi_kemitraan: 3
    },
    dimensionNotes: {
      dimensi_pbd: '',
      dimensi_instruksional: '',
      dimensi_sarana_digital: '',
      dimensi_iklim_karakter: '',
      dimensi_kemitraan: ''
    },
    averageScore: 3.0,
    overallLevel: 'berdaya',
    overallLevelLabel: 'Level 3: Tahap Berdaya (Mandiri & Terpadu)',
    strengthSummary: '',
    growthAreaSummary: '',
    aiActionRoadmap: [],
    supervisorFeedback: '',
    status: 'final'
  });

  // Unique schools for filter
  const uniqueSchools = useMemo(() => {
    const list = new Set<string>();
    records.forEach((r) => list.add(r.schoolName));
    principals.forEach((p) => list.add(p.satuanPendidikan));
    return Array.from(list).sort();
  }, [records, principals]);

  // Level statistics
  const stats = useMemo(() => {
    const counts = { inisiasi: 0, berkembang: 0, berdaya: 0, mahir: 0 };
    records.forEach((r) => {
      if (counts[r.overallLevel] !== undefined) {
        counts[r.overallLevel]++;
      }
    });
    return counts;
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchLevel = levelFilter === 'all' || r.overallLevel === levelFilter;
      const matchSchool = schoolFilter === 'all' || r.schoolName === schoolFilter;
      const matchSearch =
        searchTerm === '' ||
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.headmasterName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchLevel && matchSchool && matchSearch;
    });
  }, [records, levelFilter, schoolFilter, searchTerm]);

  // Handle Dimension Score Change with auto re-calculation
  const handleScoreChange = (dimId: ManagerialDimensionId, val: number) => {
    setFormData((prev) => {
      const newScores = {
        ...(prev.scores || {
          dimensi_pbd: 3,
          dimensi_instruksional: 3,
          dimensi_sarana_digital: 3,
          dimensi_iklim_karakter: 3,
          dimensi_kemitraan: 3
        }),
        [dimId]: val
      };
      const calculated = calculateMaturityPosition(newScores);
      return {
        ...prev,
        scores: newScores,
        averageScore: calculated.averageScore,
        overallLevel: calculated.overallLevel,
        overallLevelLabel: calculated.overallLevelLabel
      };
    });
  };

  const handleNoteChange = (dimId: ManagerialDimensionId, note: string) => {
    setFormData((prev) => ({
      ...prev,
      dimensionNotes: {
        ...(prev.dimensionNotes || {}),
        [dimId]: note
      }
    }));
  };

  // Principal Auto-Sync
  const handlePrincipalSelect = (pId: string) => {
    const p = principals.find((item) => item.id === pId);
    if (p) {
      setFormData((prev) => ({
        ...prev,
        principalId: p.id,
        headmasterName: p.nama,
        headmasterNip: p.nip,
        headmasterRank: p.pangkatGolongan || prev.headmasterRank,
        schoolName: p.satuanPendidikan,
        schoolNpsn: p.npsn || prev.schoolNpsn,
        title: `Diagnosis Kedewasaan Manajerial - ${p.satuanPendidikan}`
      }));
      showToast(`Data kepala sekolah terhubung: ${p.nama} (${p.satuanPendidikan})`, 'info');
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    const defaultPrincipal = principals[0];
    const initialScores = {
      dimensi_pbd: 3,
      dimensi_instruksional: 3,
      dimensi_sarana_digital: 3,
      dimensi_iklim_karakter: 3,
      dimensi_kemitraan: 3
    };
    const calculated = calculateMaturityPosition(initialScores);

    setFormData({
      id: `mat-${Date.now()}`,
      title: defaultPrincipal
        ? `Diagnosis Kedewasaan Manajerial - ${defaultPrincipal.satuanPendidikan}`
        : 'Diagnosis Kedewasaan Manajerial Kepala Sekolah',
      principalId: defaultPrincipal?.id || '',
      schoolName: defaultPrincipal?.satuanPendidikan || '',
      schoolNpsn: defaultPrincipal?.npsn || '',
      headmasterName: defaultPrincipal?.nama || '',
      headmasterNip: defaultPrincipal?.nip || '',
      headmasterRank: defaultPrincipal?.pangkatGolongan || 'Pembina (IV/a)',
      supervisorName: settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
      supervisorNip: settings.supervisorNip || '19830819 201001 1 002',
      supervisorRole: 'Pengawas Sekolah Pembina (Asesor)',
      supervisorRank: settings.supervisorRank || 'Penata Tk. I / III.d',
      academicYear: '2026/2027',
      semester: 'Ganjil',
      date: new Date().toISOString().split('T')[0],
      scores: initialScores,
      dimensionNotes: {
        dimensi_pbd: '',
        dimensi_instruksional: '',
        dimensi_sarana_digital: '',
        dimensi_iklim_karakter: '',
        dimensi_kemitraan: ''
      },
      averageScore: calculated.averageScore,
      overallLevel: calculated.overallLevel,
      overallLevelLabel: calculated.overallLevelLabel,
      strengthSummary: '',
      growthAreaSummary: '',
      aiActionRoadmap: [],
      supervisorFeedback: '',
      status: 'final'
    });
    setActiveTabForm('scoring');
    setIsEditorOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (rec: ManagerialMaturityRecord) => {
    setFormData({
      ...rec,
      scores: { ...rec.scores },
      dimensionNotes: { ...(rec.dimensionNotes || {}) },
      aiActionRoadmap: [...(rec.aiActionRoadmap || [])]
    });
    setActiveTabForm('scoring');
    setIsEditorOpen(true);
  };

  // Open Detail Modal
  const handleOpenDetail = (rec: ManagerialMaturityRecord) => {
    setActiveRecord(rec);
    setIsDetailOpen(true);
  };

  // Run AI Analysis
  const handleRunAIAnalysis = async () => {
    if (!formData.scores) return;
    try {
      setIsAnalyzingAI(true);
      const res = await generateMaturityAIAnalysis({
        schoolName: formData.schoolName || 'Satuan Pendidikan',
        headmasterName: formData.headmasterName || 'Kepala Sekolah',
        scores: formData.scores,
        dimensionNotes: formData.dimensionNotes
      });

      setFormData((prev) => ({
        ...prev,
        strengthSummary: res.strengthSummary,
        growthAreaSummary: res.growthAreaSummary,
        aiActionRoadmap: res.aiActionRoadmap,
        supervisorFeedback: res.supervisorFeedback
      }));

      showToast('✨ Diagnosis AI & Roadmap Aksi Naik Tingkat berhasil disusun!', 'success');
      setActiveTabForm('result');
    } catch (e) {
      console.error('Error running AI maturity analysis:', e);
      showToast('Gagal memproses analisis AI, silakan coba lagi.', 'warning');
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // Save Record
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.schoolName || !formData.headmasterName) {
      showToast('Nama Satuan Pendidikan dan Kepala Sekolah wajib diisi', 'warning');
      return;
    }

    const calculated = calculateMaturityPosition(
      formData.scores || {
        dimensi_pbd: 3,
        dimensi_instruksional: 3,
        dimensi_sarana_digital: 3,
        dimensi_iklim_karakter: 3,
        dimensi_kemitraan: 3
      }
    );

    const recordToSave: ManagerialMaturityRecord = {
      id: formData.id || `mat-${Date.now()}`,
      title: formData.title || `Diagnosis Kedewasaan Manajerial - ${formData.schoolName}`,
      principalId: formData.principalId || '',
      schoolName: formData.schoolName,
      schoolNpsn: formData.schoolNpsn || '',
      headmasterName: formData.headmasterName,
      headmasterNip: formData.headmasterNip || '-',
      headmasterRank: formData.headmasterRank || '',
      supervisorName: formData.supervisorName || settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
      supervisorNip: formData.supervisorNip || settings.supervisorNip || '19830819 201001 1 002',
      supervisorRole: formData.supervisorRole || 'Pengawas Sekolah Pembina (Asesor)',
      supervisorRank: formData.supervisorRank || settings.supervisorRank || 'Penata Tk. I / III.d',
      academicYear: formData.academicYear || '2026/2027',
      semester: formData.semester || 'Ganjil',
      date: formData.date || new Date().toISOString().split('T')[0],
      scores: formData.scores || {
        dimensi_pbd: 3,
        dimensi_instruksional: 3,
        dimensi_sarana_digital: 3,
        dimensi_iklim_karakter: 3,
        dimensi_kemitraan: 3
      },
      dimensionNotes: formData.dimensionNotes || {},
      averageScore: calculated.averageScore,
      overallLevel: calculated.overallLevel,
      overallLevelLabel: calculated.overallLevelLabel,
      strengthSummary: formData.strengthSummary || 'Kepemimpinan sekolah memiliki modal dasar yang baik.',
      growthAreaSummary: formData.growthAreaSummary || 'Perlu pembenahan berkala pada dimensi yang masih rendah.',
      aiActionRoadmap: formData.aiActionRoadmap && formData.aiActionRoadmap.length > 0
        ? formData.aiActionRoadmap
        : ['Menjalankan evaluasi berkala bersama Kombel', 'Memperkuat keterbukaan perencanaan program'],
      supervisorFeedback: formData.supervisorFeedback || 'Terus berkomitmen memajukan mutu pembelajaran murid.',
      status: formData.status || 'final',
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveRecord(recordToSave);
    setIsEditorOpen(false);
    showToast('Diagnosis Kedewasaan Manajerial Kepala Sekolah berhasil disimpan!', 'success');
  };

  // Delete
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Hapus data diagnosis kedewasaan manajerial "${name}"?`)) {
      onDeleteRecord(id);
      showToast('Data diagnosis berhasil dihapus', 'info');
    }
  };

  // Print PDF
  const handlePrint = (rec: ManagerialMaturityRecord) => {
    setActiveRecord(rec);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Export Word
  const handleExportWord = (rec: ManagerialMaturityRecord) => {
    exportPrincipalMaturityToWord(rec, settings);
    showToast(`Dokumen Word ${rec.schoolName} berhasil diunduh!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-teal-950 p-6 md:p-8 text-white shadow-xl border border-indigo-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wide uppercase backdrop-blur-md">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>Self-Discovery &amp; Maturity Diagnostic Tool</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>Posisi Mana Saya Sekarang?</span>
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Instrumen diagnosis refleksi kedewasaan kepemimpinan manajerial kepala sekolah (Permendikbudristek No. 40/2021 &amp; Model Kompetensi KS) berbasis 5 Dimensi Mutu. Memetakan posisi riil kepala sekolah dari Tahap Inisiasi menuju Episentrum Rujukan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenCreate}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-teal-500/25 transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Mulai Diagnosis Baru</span>
            </button>
          </div>
        </div>

        {/* Decorative Grid Glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* 4 LEVEL MATURITY SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Level 1: Inisiasi */}
        <div
          onClick={() => setLevelFilter(levelFilter === 'inisiasi' ? 'all' : 'inisiasi')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            levelFilter === 'inisiasi'
              ? 'bg-amber-100 border-amber-400 shadow-md ring-2 ring-amber-400'
              : 'bg-white border-amber-200 hover:bg-amber-50/70 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
              Skor 1.00 - 1.75
            </span>
            <Compass className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-lg font-black text-slate-900">Level 1: Inisiasi</div>
          <div className="text-xs text-slate-600 mt-1 line-clamp-2">
            Administratif &amp; Kepatuhan Rutin. Perlu bimbingan intensif pengawas pembina.
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-bold text-amber-950 pt-2 border-t border-amber-200">
            <span>Sekolah Terpetakan:</span>
            <span className="text-sm font-extrabold">{stats.inisiasi}</span>
          </div>
        </div>

        {/* Level 2: Berkembang */}
        <div
          onClick={() => setLevelFilter(levelFilter === 'berkembang' ? 'all' : 'berkembang')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            levelFilter === 'berkembang'
              ? 'bg-blue-100 border-blue-400 shadow-md ring-2 ring-blue-400'
              : 'bg-white border-blue-200 hover:bg-blue-50/70 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-900 bg-blue-200/80 px-2 py-0.5 rounded">
              Skor 1.76 - 2.50
            </span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-lg font-black text-slate-900">Level 2: Berkembang</div>
          <div className="text-xs text-slate-600 mt-1 line-clamp-2">
            Kolaboratif Terbimbing. Mulai mengaktifkan Kombel dan menganalisis Rapor Pendidikan.
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-bold text-blue-950 pt-2 border-t border-blue-200">
            <span>Sekolah Terpetakan:</span>
            <span className="text-sm font-extrabold">{stats.berkembang}</span>
          </div>
        </div>

        {/* Level 3: Berdaya */}
        <div
          onClick={() => setLevelFilter(levelFilter === 'berdaya' ? 'all' : 'berdaya')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            levelFilter === 'berdaya'
              ? 'bg-emerald-100 border-emerald-400 shadow-md ring-2 ring-emerald-400'
              : 'bg-white border-emerald-200 hover:bg-emerald-50/70 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-200/80 px-2 py-0.5 rounded">
              Skor 2.51 - 3.25
            </span>
            <Award className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-lg font-black text-slate-900">Level 3: Berdaya</div>
          <div className="text-xs text-slate-600 mt-1 line-clamp-2">
            Mandiri &amp; Terpadu. PBD matang, iklim positif, dan kepemimpinan instruksional mantap.
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-bold text-emerald-950 pt-2 border-t border-emerald-200">
            <span>Sekolah Terpetakan:</span>
            <span className="text-sm font-extrabold">{stats.berdaya}</span>
          </div>
        </div>

        {/* Level 4: Mahir */}
        <div
          onClick={() => setLevelFilter(levelFilter === 'mahir' ? 'all' : 'mahir')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            levelFilter === 'mahir'
              ? 'bg-purple-100 border-purple-400 shadow-md ring-2 ring-purple-400'
              : 'bg-white border-purple-200 hover:bg-purple-50/70 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-900 bg-purple-200/80 px-2 py-0.5 rounded">
              Skor 3.26 - 4.00
            </span>
            <Crown className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-lg font-black text-slate-900">Level 4: Mahir</div>
          <div className="text-xs text-slate-600 mt-1 line-clamp-2">
            Episentrum Rujukan. Aktif berbagi dan mengimbaskan praktik baik kepemimpinan se-Sidrap.
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-bold text-purple-950 pt-2 border-t border-purple-200">
            <span>Sekolah Terpetakan:</span>
            <span className="text-sm font-extrabold">{stats.mahir}</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari sekolah atau kepala sekolah..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filter Level */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Level Kedewasaan</option>
            <option value="inisiasi">Level 1: Tahap Inisiasi</option>
            <option value="berkembang">Level 2: Tahap Berkembang</option>
            <option value="berdaya">Level 3: Tahap Berdaya</option>
            <option value="mahir">Level 4: Tahap Mahir</option>
          </select>

          {/* Filter Sekolah */}
          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Satuan Pendidikan</option>
            {uniqueSchools.map((sch) => (
              <option key={sch} value={sch}>
                {sch}
              </option>
            ))}
          </select>

          {(levelFilter !== 'all' || schoolFilter !== 'all' || searchTerm !== '') && (
            <button
              onClick={() => {
                setLevelFilter('all');
                setSchoolFilter('all');
                setSearchTerm('');
              }}
              className="px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* RECORD LIST CARDS */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <Compass className="w-12 h-12 text-slate-400 mx-auto stroke-1" />
          <h3 className="text-base font-bold text-slate-800">Belum Ada Data Diagnosis Kedewasaan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Mulai lakukan diagnosis "Posisi Mana Saya Sekarang?" untuk memetakan tingkat kedewasaan manajerial kepala sekolah binaan secara akurat.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Mulai Diagnosis Baru</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRecords.map((rec) => {
            const levelInfo = MATURITY_LEVELS[rec.overallLevel] || MATURITY_LEVELS.inisiasi;
            const percentage = Math.round((rec.averageScore / 4) * 100);

            return (
              <div
                key={rec.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${levelInfo.colorClass}`}
                      >
                        {levelInfo.badgeTitle}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {rec.date} (TA {rec.academicYear} / {rec.semester})
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{rec.schoolName}</h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1.5 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Kepala Sekolah: <strong className="text-slate-800">{rec.headmasterName}</strong>
                      </span>
                      {rec.headmasterNip && (
                        <span className="text-slate-500">NIP. {rec.headmasterNip}</span>
                      )}
                    </div>
                  </div>

                  {/* SCORE GAUGE DISPLAY */}
                  <div className="flex items-center gap-4 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200/80">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Rata-rata Skor:
                      </div>
                      <div className="text-xl font-black text-slate-900">
                        {rec.averageScore.toFixed(2)}{' '}
                        <span className="text-xs font-semibold text-slate-400">/ 4.00</span>
                      </div>
                      <div className="text-[10px] font-bold text-emerald-700">
                        Indeks Kematangan {percentage}%
                      </div>
                    </div>

                    <div className="w-12 h-12 rounded-full border-4 border-slate-200 flex items-center justify-center relative">
                      <div
                        className="w-full h-full rounded-full border-4 border-indigo-600 absolute top-0 left-0"
                        style={{
                          clipPath: `polygon(50% 50%, 50% 0%, ${percentage > 25 ? '100% 0%' : '50% 0%'}, ${
                            percentage > 50 ? '100% 100%' : '50% 50%'
                          }, ${percentage > 75 ? '0% 100%' : '50% 50%'}, 0% 0%)`
                        }}
                      />
                      <span className="text-xs font-extrabold text-slate-800">{percentage}%</span>
                    </div>
                  </div>
                </div>

                {/* 5 DIMENSIONS PILLS */}
                <div className="py-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600 truncate mr-1">1. PBD &amp; RKAS</span>
                    <span className="font-extrabold text-indigo-700 bg-white px-1.5 py-0.5 rounded shadow-2xs">
                      {rec.scores.dimensi_pbd}/4
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600 truncate mr-1">2. Kombel Guru</span>
                    <span className="font-extrabold text-indigo-700 bg-white px-1.5 py-0.5 rounded shadow-2xs">
                      {rec.scores.dimensi_instruksional}/4
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600 truncate mr-1">3. Sarana &amp; TIK</span>
                    <span className="font-extrabold text-indigo-700 bg-white px-1.5 py-0.5 rounded shadow-2xs">
                      {rec.scores.dimensi_sarana_digital}/4
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600 truncate mr-1">4. Iklim &amp; Karakter</span>
                    <span className="font-extrabold text-indigo-700 bg-white px-1.5 py-0.5 rounded shadow-2xs">
                      {rec.scores.dimensi_iklim_karakter}/4
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600 truncate mr-1">5. Kemitraan</span>
                    <span className="font-extrabold text-indigo-700 bg-white px-1.5 py-0.5 rounded shadow-2xs">
                      {rec.scores.dimensi_kemitraan}/4
                    </span>
                  </div>
                </div>

                {/* QUALITATIVE HIGHLIGHT */}
                {rec.strengthSummary && (
                  <div className="mt-1 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 text-xs text-slate-700 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-emerald-950">Kekuatan Utama:</strong> {rec.strengthSummary}
                    </div>
                  </div>
                )}

                {/* ACTIONS */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500 font-medium">
                    Pengawas: <strong className="text-slate-700">{rec.supervisorName}</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenDetail(rec)}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Lihat Detail Posisi"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(rec)}
                      className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Data Diagnosis"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleExportWord(rec)}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Ekspor Dokumen Word (.doc)"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePrint(rec)}
                      className="p-1.5 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                      title="Cetak / Simpan PDF"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rec.id, rec.schoolName)}
                      className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Data"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL EDITOR: DIAGNOSIS & EVALUASI */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Compass className="w-5 h-5 text-teal-400" />
                  <span>Instrumen "Posisi Mana Saya Sekarang?"</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Diagnosis Tingkat Kedewasaan Kepemimpinan Manajerial Kepala Sekolah
                </p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-6 py-2 bg-slate-100 border-b border-slate-200 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTabForm('scoring')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTabForm === 'scoring'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Identitas &amp; Penilaian 5 Dimensi
              </button>
              <button
                type="button"
                onClick={() => setActiveTabForm('result')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTabForm === 'result'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>2. Hasil Posisi, Analisis AI &amp; Roadmap</span>
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTabForm === 'scoring' && (
                <div className="space-y-6">
                  {/* IDENTITAS KEPALA SEKOLAH & SATUAN PENDIDIKAN */}
                  <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                        <School className="w-4 h-4 text-indigo-700" />
                        Identitas Satuan Pendidikan &amp; Kepala Sekolah
                      </h4>
                      <span className="text-[11px] text-indigo-800 font-bold bg-indigo-100 px-2 py-0.5 rounded">
                        Auto-Sync
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                        Pilih Cepat dari Data Kepala Sekolah Terdaftar:
                      </label>
                      <select
                        onChange={(e) => handlePrincipalSelect(e.target.value)}
                        value={formData.principalId || ''}
                        className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="" disabled>
                          -- Pilih Kepala Sekolah untuk Auto-Sync --
                        </option>
                        {principals.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nama} ({p.satuanPendidikan})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Nama Satuan Pendidikan <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.schoolName}
                          onChange={(e) => setFormData((p) => ({ ...p, schoolName: e.target.value }))}
                          placeholder="UPT SD Negeri 4 Bilokka"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Nama Lengkap Kepala Sekolah <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.headmasterName}
                          onChange={(e) => setFormData((p) => ({ ...p, headmasterName: e.target.value }))}
                          placeholder="Dra. Hj. Nurhasanah, M.Pd."
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">NIP Kepala Sekolah</label>
                        <input
                          type="text"
                          value={formData.headmasterNip}
                          onChange={(e) => setFormData((p) => ({ ...p, headmasterNip: e.target.value }))}
                          placeholder="19720815 199802 2 003"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Tahun Ajaran / Sem</label>
                        <input
                          type="text"
                          value={`${formData.academicYear} / ${formData.semester}`}
                          onChange={(e) => {
                            const [ay, sem] = e.target.value.split('/');
                            setFormData((p) => ({
                              ...p,
                              academicYear: ay ? ay.trim() : p.academicYear,
                              semester: sem && sem.trim() === 'Genap' ? 'Genap' : 'Ganjil'
                            }));
                          }}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Diagnosis</label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 5 DIMENSI EVALUASI KEPEMIMPINAN MANAJERIAL */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                        Rubrik Penilaian 5 Dimensi Kedewasaan Manajerial (Skor 1 - 4)
                      </h4>
                      <span className="text-xs text-slate-500 font-medium">
                        Klik salah satu level yang paling mencerminkan kondisi riil sekolah
                      </span>
                    </div>

                    {MANAGERIAL_DIMENSIONS.map((dim) => {
                      const currentScore =
                        formData.scores?.[dim.id] !== undefined ? formData.scores[dim.id] : 3;

                      return (
                        <div
                          key={dim.id}
                          className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                            <div>
                              <div className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-extrabold text-[10px]">
                                  {dim.code}
                                </span>
                                <span>{dim.nama}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">{dim.deskripsi}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 font-medium">Skor Dipilih:</span>
                              <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-black text-xs shadow-xs">
                                Level {currentScore}
                              </span>
                            </div>
                          </div>

                          {/* 4 LEVEL OPTIONS */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                            {[1, 2, 3, 4].map((lvl) => {
                              const levelData = dim.levels[lvl as 1 | 2 | 3 | 4];
                              const isSelected = currentScore === lvl;

                              return (
                                <div
                                  key={lvl}
                                  onClick={() => handleScoreChange(dim.id, lvl)}
                                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                                    isSelected
                                      ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-400 shadow-xs'
                                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span
                                      className={`text-[10px] font-black uppercase px-1.5 py-0.2 rounded ${
                                        isSelected
                                          ? 'bg-indigo-600 text-white'
                                          : 'bg-slate-200 text-slate-700'
                                      }`}
                                    >
                                      Skor {lvl}
                                    </span>
                                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                                  </div>
                                  <div className="text-xs font-bold text-slate-900 mb-0.5">
                                    {levelData.title}
                                  </div>
                                  <p className="text-[10px] text-slate-600 leading-snug line-clamp-3">
                                    {levelData.desc}
                                  </p>
                                </div>
                              );
                            })}
                          </div>

                          {/* Catatan Fakta / Bukti Lapangan */}
                          <div>
                            <input
                              type="text"
                              value={formData.dimensionNotes?.[dim.id] || ''}
                              onChange={(e) => handleNoteChange(dim.id, e.target.value)}
                              placeholder={`Catatan bukti fisik / fakta lapangan untuk ${dim.nama}...`}
                              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* BOTTOM LIVE POSITION CALLOUT */}
                  <div className="p-4 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">
                        Hasil Kalkulasi Posisi Saat Ini:
                      </div>
                      <div className="text-base font-extrabold text-white mt-0.5">
                        {formData.overallLevelLabel}
                      </div>
                      <div className="text-xs text-teal-300 font-semibold">
                        Rata-rata Skor: {formData.averageScore?.toFixed(2)} dari 4.00
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTabForm('result')}
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <span>Lihat Analisis AI &amp; Roadmap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {activeTabForm === 'result' && (
                <div className="space-y-6">
                  {/* SPEEDOMETER & LEVEL RESULT BANNER */}
                  <div className="p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-800/60 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center md:text-left">
                      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
                        <Compass className="w-3.5 h-3.5" />
                        <span>Posisi Kedewasaan Terpetakan</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white">
                        {formData.overallLevelLabel}
                      </h3>
                      <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                        {MATURITY_LEVELS[formData.overallLevel || 'inisiasi']?.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/15 min-w-[160px]">
                      <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
                        Rata-rata Indeks:
                      </span>
                      <span className="text-3xl font-black text-teal-400 my-0.5">
                        {formData.averageScore?.toFixed(2)}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-300">Skala 1.00 - 4.00</span>
                    </div>
                  </div>

                  {/* AI GENERATOR TRIGGER */}
                  <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 p-4 rounded-xl border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Kecerdasan Buatan (AI Engine) INSPIRO</span>
                      </h4>
                      <p className="text-xs text-teal-800">
                        Analisis otomatis kekuatan utama, titik rawan perbaikan mendesak, dan 3-5 langkah konkret naik level.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRunAIAnalysis}
                      disabled={isAnalyzingAI}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                    >
                      {isAnalyzingAI ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Menganalisis AI...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>✨ Analisis Otomatis dengan AI</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* KEKUATAN & TITIK RAWAN */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Pilar Kekuatan Utama (Strengths)
                        </label>
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Modal Mutu
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        value={formData.strengthSummary || ''}
                        onChange={(e) => setFormData((p) => ({ ...p, strengthSummary: e.target.value }))}
                        placeholder="Uraikan pilar manajerial yang sudah berjalan optimal dan membanggakan..."
                        className="w-full p-2.5 bg-white border border-emerald-300 rounded-lg text-xs leading-relaxed text-slate-800 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Growth Areas */}
                    <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          Titik Rawan / Area Perbaikan (Growth Areas)
                        </label>
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                          Fokus Benahi
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        value={formData.growthAreaSummary || ''}
                        onChange={(e) => setFormData((p) => ({ ...p, growthAreaSummary: e.target.value }))}
                        placeholder="Uraikan kendala atau kelemahan manajerial yang paling mendesak dibenahi..."
                        className="w-full p-2.5 bg-white border border-amber-300 rounded-lg text-xs leading-relaxed text-slate-800 focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* ROADMAP AKSI NAIK TINGKAT */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                        Roadmap Aksi Naik Tingkat (Action Plan 6 Bulan ke Depan)
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((p) => ({
                            ...p,
                            aiActionRoadmap: [...(p.aiActionRoadmap || []), 'Langkah aksi baru...']
                          }))
                        }
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Langkah</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(formData.aiActionRoadmap || []).map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={step}
                            onChange={(e) => {
                              const updated = [...(formData.aiActionRoadmap || [])];
                              updated[idx] = e.target.value;
                              setFormData((p) => ({ ...p, aiActionRoadmap: updated }));
                            }}
                            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (formData.aiActionRoadmap || []).filter((_, i) => i !== idx);
                              setFormData((p) => ({ ...p, aiActionRoadmap: updated }));
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CATATAN PENGAWAS PEMBINA */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Catatan Reflektif &amp; Umpan Balik Pengawas Sekolah Pembina
                    </label>
                    <textarea
                      rows={3}
                      value={formData.supervisorFeedback || ''}
                      onChange={(e) => setFormData((p) => ({ ...p, supervisorFeedback: e.target.value }))}
                      placeholder="Pesan motivasi, arahan strategis, dan komitmen pendampingan pengawas pembina..."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>

                <div className="flex items-center gap-2">
                  {activeTabForm === 'scoring' ? (
                    <button
                      type="button"
                      onClick={() => setActiveTabForm('result')}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Lanjut ke Hasil &amp; AI</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simpan Hasil Diagnosis</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {isDetailOpen && activeRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">{activeRecord.schoolName}</h3>
                <p className="text-xs text-slate-300">
                  Kepala Sekolah: {activeRecord.headmasterName} • TA {activeRecord.academicYear} (
                  {activeRecord.semester})
                </p>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Level Banner */}
              <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                    Posisi Tingkat Kedewasaan:
                  </div>
                  <div className="text-lg font-black text-white">{activeRecord.overallLevelLabel}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Rata-rata Skor:</div>
                  <div className="text-2xl font-black text-teal-400">
                    {activeRecord.averageScore.toFixed(2)} / 4.00
                  </div>
                </div>
              </div>

              {/* 5 Dimensions Table */}
              <div>
                <h4 className="text-xs font-extrabold uppercase text-slate-800 mb-2">
                  Capaian 5 Dimensi Kepemimpinan Manajerial
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Dimensi</th>
                        <th className="p-2.5 text-center">Skor</th>
                        <th className="p-2.5">Catatan Fakta / Bukti Lapangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {MANAGERIAL_DIMENSIONS.map((dim) => (
                        <tr key={dim.id}>
                          <td className="p-2.5 font-bold text-slate-800">{dim.nama}</td>
                          <td className="p-2.5 text-center font-black text-indigo-700">
                            {activeRecord.scores[dim.id]} / 4
                          </td>
                          <td className="p-2.5 text-slate-600">
                            {activeRecord.dimensionNotes?.[dim.id] || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Strengths & Growth Areas */}
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                  <strong className="text-emerald-950">Pilar Kekuatan Utama:</strong>
                  <p className="mt-1 text-slate-700 leading-relaxed">{activeRecord.strengthSummary}</p>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                  <strong className="text-amber-950">Titik Rawan / Area Perbaikan:</strong>
                  <p className="mt-1 text-slate-700 leading-relaxed">{activeRecord.growthAreaSummary}</p>
                </div>
              </div>

              {/* Roadmap */}
              {activeRecord.aiActionRoadmap && activeRecord.aiActionRoadmap.length > 0 && (
                <div>
                  <h4 className="text-xs font-extrabold uppercase text-slate-800 mb-2">
                    Roadmap Aksi Naik Tingkat (Action Plan 6 Bulan)
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {activeRecord.aiActionRoadmap.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                Tutup
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportWord(activeRecord)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Ekspor Word (.doc)</span>
                </button>
                <button
                  onClick={() => handlePrint(activeRecord)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE OFFICIAL DOCUMENT LAYOUT (PDF / CETAK) */}
      {activeRecord && (
        <div id="printable-maturity-doc" className="hidden print:block text-black bg-white p-6">
          <style>{`
            @media print {
              body * { visibility: hidden; }
              #printable-maturity-doc, #printable-maturity-doc * { visibility: visible; }
              #printable-maturity-doc {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 15mm;
                font-family: 'Times New Roman', Times, serif;
                color: #000;
              }
              @page { size: A4 portrait; margin: 15mm; }
            }
          `}</style>

          {/* KOP SURAT DINAS RESMI */}
          <div className="border-b-4 border-double border-black pb-3 mb-5 text-center relative">
            <div className="flex items-center justify-between">
              <img
                src={settings.logoUrl || DEFAULT_SIDRAP_LOGO}
                alt="Logo Pemkab"
                className="w-16 h-16 object-contain"
              />
              <div className="flex-1 px-4">
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {settings.governmentAgency || 'PEMERINTAH KABUPATEN SIDENRENG RAPPANG'}
                </h4>
                <h3 className="text-sm font-black uppercase tracking-wide">
                  DINAS PENDIDIKAN DAN KEBUDAYAAN
                </h3>
                <h2 className="text-base font-black uppercase">
                  PENGAWAS SEKOLAH PEMBINA KABUPATEN SIDENRENG RAPPANG
                </h2>
                <p className="text-[9px] italic mt-0.5">
                  Kompleks SKPD Blok B No. 7, Jl. Harapan Baru, Sidenreng Rappang, Sulawesi Selatan
                </p>
              </div>
              <img
                src={DEFAULT_TUTWURI_LOGO}
                alt="Logo Tut Wuri"
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>

          <div className="text-center mb-4">
            <h2 className="text-sm font-black uppercase tracking-wider underline">
              LEMBAR DIAGNOSIS KEDEWASAAN MANAJERIAL KEPALA SEKOLAH
            </h2>
            <p className="text-xs italic text-slate-700">
              "Posisi Mana Saya Sekarang?" (Self-Discovery &amp; Managerial Maturity Diagnostic)
            </p>
          </div>

          {/* Identitas Info */}
          <table className="w-full text-xs mb-4">
            <tbody>
              <tr>
                <td className="w-28 font-bold py-1">Satuan Pendidikan</td>
                <td className="w-3">:</td>
                <td className="font-bold">{activeRecord.schoolName}</td>
                <td className="w-28 font-bold py-1">Tahun Ajaran / Sem</td>
                <td className="w-3">:</td>
                <td>
                  {activeRecord.academicYear} / {activeRecord.semester}
                </td>
              </tr>
              <tr>
                <td className="font-bold py-1">Kepala Sekolah</td>
                <td>:</td>
                <td>{activeRecord.headmasterName}</td>
                <td className="font-bold py-1">NIP Kepala Sekolah</td>
                <td>:</td>
                <td>{activeRecord.headmasterNip}</td>
              </tr>
              <tr>
                <td className="font-bold py-1">Pengawas Pembina</td>
                <td>:</td>
                <td>{activeRecord.supervisorName}</td>
                <td className="font-bold py-1">Tanggal Diagnosis</td>
                <td>:</td>
                <td>{activeRecord.date}</td>
              </tr>
            </tbody>
          </table>

          {/* Posisi Box */}
          <div className="border-2 border-black p-3 mb-4 text-center bg-slate-50">
            <div className="text-[10px] uppercase font-bold text-slate-600">
              HASIL DIAGNOSIS TINGKAT KEDEWASAAN MANAJERIAL:
            </div>
            <div className="text-base font-black text-black mt-0.5">
              {activeRecord.overallLevelLabel}
            </div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">
              Rata-rata Indeks Skor: {activeRecord.averageScore.toFixed(2)} dari 4.00 (
              {Math.round((activeRecord.averageScore / 4) * 100)}%)
            </div>
          </div>

          {/* Tabel 5 Dimensi */}
          <div className="mb-4">
            <h4 className="text-xs font-black uppercase mb-1">
              I. MATRIKS EVALUASI 5 DIMENSI KEPEMIMPINAN MANAJERIAL
            </h4>
            <table className="w-full border-collapse border border-black text-[10px]">
              <thead>
                <tr className="bg-slate-200">
                  <th className="border border-black p-1 text-center w-8">No</th>
                  <th className="border border-black p-1 text-left">Dimensi Kepemimpinan Manajerial</th>
                  <th className="border border-black p-1 text-center w-20">Skor</th>
                  <th className="border border-black p-1 text-left">Catatan Fakta &amp; Bukti Lapangan</th>
                </tr>
              </thead>
              <tbody>
                {MANAGERIAL_DIMENSIONS.map((dim, idx) => (
                  <tr key={dim.id}>
                    <td className="border border-black p-1 text-center">{idx + 1}</td>
                    <td className="border border-black p-1 font-bold">{dim.nama}</td>
                    <td className="border border-black p-1 text-center font-bold">
                      {activeRecord.scores[dim.id]} / 4
                    </td>
                    <td className="border border-black p-1">
                      {activeRecord.dimensionNotes?.[dim.id] || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Analisis Kekuatan & Titik Rawan */}
          <div className="mb-4 space-y-2 text-[10px]">
            <h4 className="text-xs font-black uppercase">
              II. ANALISIS REFLEKTIF KEKUATAN &amp; TITIK RAWAN MANAJERIAL
            </h4>
            <div className="border border-black p-2 bg-slate-50">
              <strong>Pilar Kekuatan Utama (Strengths):</strong>
              <p className="mt-0.5">{activeRecord.strengthSummary}</p>
            </div>
            <div className="border border-black p-2 bg-slate-50">
              <strong>Titik Rawan &amp; Area Perbaikan Mendesak (Growth Areas):</strong>
              <p className="mt-0.5">{activeRecord.growthAreaSummary}</p>
            </div>
          </div>

          {/* Roadmap */}
          <div className="mb-4 text-[10px]">
            <h4 className="text-xs font-black uppercase mb-1">
              III. ROADMAP AKSI NAIK TINGKAT (ACTION PLAN)
            </h4>
            <ol className="list-decimal pl-4 space-y-1">
              {(activeRecord.aiActionRoadmap || []).map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>

          {activeRecord.supervisorFeedback && (
            <div className="mb-4 text-[10px] border border-black p-2 bg-slate-50">
              <strong>Catatan Reflektif &amp; Umpan Balik Pengawas Sekolah Pembina:</strong>
              <p className="mt-0.5 italic">"{activeRecord.supervisorFeedback}"</p>
            </div>
          )}

          {/* Tanda Tangan */}
          <div className="mt-8 pt-4 flex items-start justify-between text-xs break-inside-avoid">
            <div className="text-center w-60">
              <p>Kepala Satuan Pendidikan,</p>
              <p className="text-[10px] italic">(Refleksi Diri)</p>
              <div className="h-16" />
              <p className="font-bold underline">{activeRecord.headmasterName}</p>
              <p className="text-[10px]">NIP. {activeRecord.headmasterNip}</p>
            </div>

            <div className="text-center w-60">
              <p>
                {settings.schoolCity || 'Sidenreng Rappang'}, {activeRecord.date}
              </p>
              <p>{activeRecord.supervisorRole}</p>
              <div className="h-16" />
              <p className="font-bold underline">{activeRecord.supervisorName}</p>
              <p className="text-[10px]">NIP. {activeRecord.supervisorNip}</p>
              <p className="text-[10px]">
                Pangkat/Gol: {activeRecord.supervisorRank || 'Penata Tk. I / III.d'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
