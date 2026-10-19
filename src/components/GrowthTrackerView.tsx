/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  FileDown,
  Printer,
  Award,
  ArrowRight,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  BookOpen,
  HelpCircle,
  School,
  ChevronRight,
  Plus,
  Compass,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  AppSettings,
  CycleCompareMode,
  CycleKey,
  OBSERVATION_INDICATORS,
  SupervisionRecord,
  Teacher,
  TeacherCycleComparison
} from '../types/inspiro';
import {
  calculateTeacherGrowthComparisons,
  COMPARE_MODE_OPTIONS,
  CYCLE_META
} from '../utils/growthTrackerUtils';
import { exportGrowthTrackerToWord, printDocumentElement } from '../utils/documentExport';

interface GrowthTrackerViewProps {
  supervisions: SupervisionRecord[];
  teachers: Teacher[];
  settings: AppSettings;
  onNavigateToSupervision?: (teacherId?: string) => void;
  showToast?: (type: 'success' | 'info' | 'error', message: string) => void;
}

type GrowthSubTab = 'matrix' | 'detail' | 'schools';

export const GrowthTrackerView: React.FC<GrowthTrackerViewProps> = ({
  supervisions,
  teachers,
  settings,
  onNavigateToSupervision,
  showToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<GrowthSubTab>('matrix');
  const [compareMode, setCompareMode] = useState<CycleCompareMode>('s1_vs_s2');
  const [searchQuery, setSearchQuery] = useState('');
  const [trajectoryFilter, setTrajectoryFilter] = useState<string>('all');
  const [isExportingWord, setIsExportingWord] = useState(false);

  // Radar layer visibility toggles
  const [visibleLayers, setVisibleLayers] = useState<Record<CycleKey, boolean>>({
    s1: true,
    s2: true,
    s3: true,
    sl: true
  });

  const toggleLayer = (key: CycleKey) => {
    setVisibleLayers((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Compute cycle growth analysis based on compareMode
  const { comparisons, regionalGrowth } = useMemo(() => {
    return calculateTeacherGrowthComparisons(supervisions, teachers, settings, compareMode);
  }, [supervisions, teachers, settings, compareMode]);

  // Selected teacher for deep-dive comparison
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(() => {
    return comparisons[0]?.teacherId || '';
  });

  const activeTeacherComparison = useMemo(() => {
    return comparisons.find((c) => c.teacherId === selectedTeacherId) || comparisons[0];
  }, [comparisons, selectedTeacherId]);

  // Active compare mode option metadata
  const activeModeMeta = useMemo(() => {
    return COMPARE_MODE_OPTIONS.find((opt) => opt.id === compareMode) || COMPARE_MODE_OPTIONS[0];
  }, [compareMode]);

  // Filtered comparisons
  const filteredComparisons = useMemo(() => {
    return comparisons.filter((c) => {
      const matchSearch =
        c.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.mapel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.satuanPendidikan.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTraj =
        trajectoryFilter === 'all' ||
        (trajectoryFilter === 'akselerasi' && c.trajectory === 'Akselerasi Tinggi') ||
        (trajectoryFilter === 'konsisten' && c.trajectory === 'Peningkatan Konsisten') ||
        (trajectoryFilter === 'stabil' && (c.trajectory === 'Stabil' || c.trajectory === 'Perlu Perhatian'));

      return matchSearch && matchTraj;
    });
  }, [comparisons, searchQuery, trajectoryFilter]);

  // Handle Word Export
  const handleExportWord = (teacherIdOnly?: string) => {
    setIsExportingWord(true);
    try {
      exportGrowthTrackerToWord(comparisons, regionalGrowth, settings, teacherIdOnly);
      showToast?.('success', 'Dokumen Evaluasi Multi-Siklus (.doc) berhasil diunduh.');
    } catch (err) {
      console.error(err);
      showToast?.('error', 'Gagal mengekspor dokumen Word.');
    } finally {
      setTimeout(() => setIsExportingWord(false), 800);
    }
  };

  // Handle Print / PDF
  const handlePrint = () => {
    const success = printDocumentElement(
      'growth-tracker-print-area',
      'Laporan Evaluasi Pertumbuhan Multi-Siklus Supervisi'
    );
    if (success) {
      showToast?.('info', 'Membuka jendela cetak / simpan PDF...');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <TrendingUp className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Growth Tracker: Progresivitas Multi-Siklus Guru
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Komparasi dinamis kurva radar &amp; skor 12 indikator lintas Siklus 1, 2, 3, dan Siklus Lanjutan
                </p>
              </div>
            </div>
            {/* Unboxed metadata */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-2.5 font-medium">
              <span>Pengawas: <strong>{settings.supervisorName}</strong></span>
              <span aria-hidden="true">·</span>
              <span>{regionalGrowth.totalTrackedTeachers} Guru Terpantau</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-emerald-600 font-mono tabular-nums">
                Rata-rata Pertumbuhan: +{regionalGrowth.averageGrowthDelta} Poin (+{regionalGrowth.averageGrowthPercentage}%)
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                Mode: {activeModeMeta.label}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleExportWord(activeSubTab === 'detail' ? selectedTeacherId : undefined)}
              disabled={isExportingWord}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-emerald-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              title="Unduh laporan komparasi siklus dalam format Word (.doc)"
            >
              <FileDown className="w-4 h-4 text-emerald-600" />
              <span>{isExportingWord ? 'Menyiapkan Word...' : 'Unduh Word (.doc)'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm shadow-emerald-600/20 cursor-pointer"
              title="Cetak format resmi atau simpan ke PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Segmented Cycle Compare Mode Selector (S1 vs S2, S2 vs S3, S1 vs S3, S3 vs SL, All) */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Pilih Pasangan Siklus untuk Dikomparasikan:</span>
            </span>
            <span className="text-[11px] text-slate-500 italic">
              {activeModeMeta.description}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {COMPARE_MODE_OPTIONS.map((opt) => {
              const isSelected = compareMode === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setCompareMode(opt.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="text-xs font-bold tracking-tight line-clamp-1">
                    {opt.label}
                  </span>
                  <span
                    className={`text-[10px] mt-1 font-medium ${
                      isSelected ? 'text-blue-100' : 'text-slate-500'
                    }`}
                  >
                    {opt.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-tab Navigation (Functional segmented buttons) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mt-4 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'matrix'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>01. Matriks Pertumbuhan Seluruh Guru</span>
          </button>

          <button
            onClick={() => setActiveSubTab('detail')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'detail'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>02. Multi-Siklus Radar &amp; Analisis Guru</span>
          </button>

          <button
            onClick={() => setActiveSubTab('schools')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'schools'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <School className="w-4 h-4 text-indigo-600" />
            <span>03. Laju Pertumbuhan Antar-Sekolah</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MATRIKS PERTUMBUHAN SELURUH GURU */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-6">
          {/* 4 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Rata-rata Lompatan Nilai
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono tabular-nums">
                  +{regionalGrowth.averageGrowthDelta}
                </span>
                <span className="text-xs font-semibold text-slate-500 font-mono tabular-nums">
                  poin (+{regionalGrowth.averageGrowthPercentage}%)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Kenaikan pada mode: <strong className="text-slate-700">{activeModeMeta.label}</strong>
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Akselerasi Tinggi (&ge; +10 pt)
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {regionalGrowth.acceleratedCount} <span className="text-sm font-medium text-slate-400">Guru</span>
              </div>
              <p className="text-xs text-emerald-600 font-semibold mt-2">
                Lompatan mutu signifikan setelah bimbingan klinis &amp; Kombel
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Peningkatan Konsisten (+3 s/d +9.9)
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {regionalGrowth.consistentCount} <span className="text-sm font-medium text-slate-400">Guru</span>
              </div>
              <p className="text-xs text-blue-600 font-semibold mt-2">
                Memperbaiki indikator kunci secara berkelanjutan
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Indikator Melejit Tercepat
              </span>
              <div className="truncate text-sm font-bold text-slate-900" title={regionalGrowth.topFastestGrowingIndicator.title}>
                {regionalGrowth.topFastestGrowingIndicator.title}
              </div>
              <p className="text-xs text-emerald-600 font-semibold mt-2 font-mono tabular-nums">
                Kenaikan rerata: +{regionalGrowth.topFastestGrowingIndicator.avgDelta} skala rubrik
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama guru, mata pelajaran, atau sekolah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setTrajectoryFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  trajectoryFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({comparisons.length})
              </button>
              <button
                onClick={() => setTrajectoryFilter('akselerasi')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  trajectoryFilter === 'akselerasi'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Akselerasi Tinggi
              </button>
              <button
                onClick={() => setTrajectoryFilter('konsisten')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  trajectoryFilter === 'konsisten'
                    ? 'bg-blue-700 text-white'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                }`}
              >
                Konsisten
              </button>
              <button
                onClick={() => setTrajectoryFilter('stabil')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  trajectoryFilter === 'stabil'
                    ? 'bg-amber-700 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                Stabil / Perhatian
              </button>
            </div>
          </div>

          {/* Teacher Growth Comparison Table */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Matriks Progresivitas Guru: {activeTeacherComparison?.baselineCycleName} $\longrightarrow$ {activeTeacherComparison?.targetCycleName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bukti transformasi kompetensi pedagogis guru lintas 4 tahapan siklus supervisi
                </p>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Menampilkan {filteredComparisons.length} dari {comparisons.length} guru
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="py-3 px-4">Nama Guru &amp; NIP</th>
                    <th className="py-3 px-3">Mata Pelajaran &amp; Sekolah</th>
                    <th className="py-3 px-3 text-center">Evolusi 4 Siklus (S1 ➔ S2 ➔ S3 ➔ SL)</th>
                    <th className="py-3 px-3 text-center">{activeTeacherComparison?.baselineCycleName || 'Baseline'}</th>
                    <th className="py-3 px-3 text-center">{activeTeacherComparison?.targetCycleName || 'Target'}</th>
                    <th className="py-3 px-3 text-center">Lompatan (&Delta;)</th>
                    <th className="py-3 px-3">Trajektori</th>
                    <th className="py-3 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredComparisons.map((c) => (
                    <tr key={c.teacherId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{c.teacherName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">NIP: {c.nip}</p>
                      </td>

                      <td className="py-3.5 px-3">
                        <p className="font-semibold text-slate-800">{c.mapel}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">{c.satuanPendidikan}</p>
                      </td>

                      {/* Evolusi 4 Siklus Visual Badges */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center justify-center gap-1 font-mono text-[10px]">
                          <span
                            className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold"
                            title={`Siklus 1: ${c.cycles.s1.score}% (${c.cycles.s1.category})`}
                          >
                            S1: {c.cycles.s1.score}%
                          </span>
                          <span className="text-slate-300">➔</span>
                          <span
                            className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold"
                            title={`Siklus 2: ${c.cycles.s2.score}% (${c.cycles.s2.category})`}
                          >
                            S2: {c.cycles.s2.score}%
                          </span>
                          <span className="text-slate-300">➔</span>
                          <span
                            className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-bold"
                            title={`Siklus 3: ${c.cycles.s3.score}% (${c.cycles.s3.category})`}
                          >
                            S3: {c.cycles.s3.score}%
                          </span>
                          <span className="text-slate-300">➔</span>
                          <span
                            className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold"
                            title={`Siklus Lanjutan: ${c.cycles.sl.score}% (${c.cycles.sl.category})`}
                          >
                            SL: {c.cycles.sl.score}%
                          </span>
                        </div>
                      </td>

                      {/* Baseline Score */}
                      <td className="py-3.5 px-3 text-center font-mono tabular-nums">
                        <span className="font-bold text-slate-700">{c.scoreCycle1}%</span>
                        <span className="block text-[10px] text-slate-500">{c.categoryCycle1}</span>
                      </td>

                      {/* Target Score */}
                      <td className="py-3.5 px-3 text-center font-mono tabular-nums">
                        <span className="font-extrabold text-sm text-emerald-700">{c.scoreCycle2}%</span>
                        <span className="block text-[10px] font-semibold text-emerald-600">{c.categoryCycle2}</span>
                      </td>

                      {/* Delta */}
                      <td className="py-3.5 px-3 text-center font-mono tabular-nums">
                        <div className="inline-flex items-center gap-0.5 px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>+{c.deltaScore} pt</span>
                        </div>
                        <span className="block text-[10px] text-emerald-600 mt-0.5">
                          (+{c.growthPercentage}%)
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`font-semibold text-xs ${
                            c.trajectory === 'Akselerasi Tinggi'
                              ? 'text-emerald-700'
                              : c.trajectory === 'Peningkatan Konsisten'
                              ? 'text-blue-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {c.trajectory}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedTeacherId(c.teacherId);
                            setActiveSubTab('detail');
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-semibold rounded-md transition-colors cursor-pointer"
                          title="Lihat kurva radar 4 siklus dan rincian 12 indikator"
                        >
                          Detail 4 Siklus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-SIKLUS RADAR & ANALISIS DELTA GURU */}
      {activeSubTab === 'detail' && activeTeacherComparison && (
        <div className="space-y-6">
          {/* Teacher Selector Toolbar */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pilih Guru:
              </span>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {comparisons.map((c) => (
                  <option key={c.teacherId} value={c.teacherId}>
                    {c.teacherName} — {c.mapel} (Lompatan: +{c.deltaScore} pt | S1-SL: +{c.totalCumulativeDelta} pt)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">
                Trajektori: <strong className="text-emerald-700">{activeTeacherComparison.trajectoryLabel}</strong>
              </span>
            </div>
          </div>

          {/* Teacher Profile Summary Banner */}
          <div className="bg-gradient-to-r from-[#0b1b3d] to-[#12285a] rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                  {activeTeacherComparison.mapel}
                </span>
                <span className="text-xs text-slate-300">{activeTeacherComparison.kelas}</span>
              </div>
              <h3 className="text-xl font-bold mt-1 text-white">{activeTeacherComparison.teacherName}</h3>
              <p className="text-xs text-blue-200/80 mt-0.5">
                NIP: {activeTeacherComparison.nip} · {activeTeacherComparison.satuanPendidikan}
              </p>
            </div>

            {/* Score Comparison Box */}
            <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-xs p-3 sm:p-4 rounded-xl border border-white/15">
              <div className="text-center px-2">
                <span className="text-[10px] text-blue-200 uppercase tracking-wider block">
                  {activeTeacherComparison.baselineCycleName}
                </span>
                <span className="text-xl font-bold text-slate-100 font-mono tabular-nums">
                  {activeTeacherComparison.scoreCycle1}%
                </span>
                <span className="text-[10px] text-slate-300 block">{activeTeacherComparison.categoryCycle1}</span>
              </div>

              <ArrowRight className="w-4 h-4 text-cyan-300 shrink-0" />

              <div className="text-center px-2">
                <span className="text-[10px] text-emerald-300 uppercase tracking-wider block font-bold">
                  {activeTeacherComparison.targetCycleName}
                </span>
                <span className="text-xl font-extrabold text-emerald-400 font-mono tabular-nums">
                  {activeTeacherComparison.scoreCycle2}%
                </span>
                <span className="text-[10px] text-emerald-300 font-bold block">{activeTeacherComparison.categoryCycle2}</span>
              </div>

              <div className="pl-3 border-l border-white/20 text-center">
                <span className="text-[10px] text-cyan-200 uppercase tracking-wider block">Lompatan (&Delta;)</span>
                <span className="text-xl font-black text-cyan-300 font-mono tabular-nums">
                  +{activeTeacherComparison.deltaScore}
                </span>
                <span className="text-[10px] text-cyan-200 block">(+{activeTeacherComparison.growthPercentage}%)</span>
              </div>

              <div className="pl-3 border-l border-white/20 text-center">
                <span className="text-[10px] text-amber-300 uppercase tracking-wider block font-bold">Total S1 ➔ SL</span>
                <span className="text-xl font-black text-amber-400 font-mono tabular-nums">
                  +{activeTeacherComparison.totalCumulativeDelta}
                </span>
                <span className="text-[10px] text-amber-200 block">Poin Kumulatif</span>
              </div>
            </div>
          </div>

          {/* 4-Stage Progressive Timeline & Status Cards */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Lini Masa &amp; Riwayat 4 Tahapan Siklus Supervisi</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Progres bertahap dari pemetaan diagnostik awal hingga kemandirian tindak lanjut (RTL)
                </p>
              </div>
              {onNavigateToSupervision && (
                <button
                  onClick={() => onNavigateToSupervision(activeTeacherComparison.teacherId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                  title="Tambah / input observasi siklus baru untuk guru ini"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Input Observasi Siklus Baru</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Siklus 1 */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  activeTeacherComparison.cycles.s1.isReal
                    ? 'bg-blue-50/40 border-blue-200'
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>Siklus 1 (Awal)</span>
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    activeTeacherComparison.cycles.s1.isReal
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {activeTeacherComparison.cycles.s1.isReal ? 'Terekam Riil' : 'Basis Diagnostik'}
                  </span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                  {activeTeacherComparison.cycles.s1.score}%
                </div>
                <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                  Kategori: <strong>{activeTeacherComparison.cycles.s1.category}</strong>
                </p>
                <p className="text-[10px] text-slate-400 mt-2">
                  Tanggal: {activeTeacherComparison.cycles.s1.dateStr}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                  Fokus: Observasi Diagnostik Awal &amp; Pemetaan Masalah Belajar
                </div>
              </div>

              {/* Siklus 2 */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  activeTeacherComparison.cycles.s2.isReal
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>Siklus 2 (Evaluasi)</span>
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    activeTeacherComparison.cycles.s2.isReal
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {activeTeacherComparison.cycles.s2.isReal ? 'Terekam Riil' : 'Pasca Bimbingan'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono text-emerald-800 tabular-nums">
                    {activeTeacherComparison.cycles.s2.score}%
                  </span>
                  <span className="text-xs font-bold text-emerald-600 font-mono tabular-nums">
                    +{Number((activeTeacherComparison.cycles.s2.score - activeTeacherComparison.cycles.s1.score).toFixed(1))} pt
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                  Kategori: <strong>{activeTeacherComparison.cycles.s2.category}</strong>
                </p>
                <p className="text-[10px] text-slate-400 mt-2">
                  Tanggal: {activeTeacherComparison.cycles.s2.dateStr}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                  Fokus: Bimbingan Tatap Muka &amp; Modul Ajar Diferensiasi
                </div>
              </div>

              {/* Siklus 3 */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  activeTeacherComparison.cycles.s3.isReal
                    ? 'bg-purple-50/40 border-purple-200'
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-purple-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <span>Siklus 3 (Konsolidasi)</span>
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    activeTeacherComparison.cycles.s3.isReal
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-purple-50 text-purple-700 border border-purple-200'
                  }`}>
                    {activeTeacherComparison.cycles.s3.isReal ? 'Terekam Riil' : 'Kombel & Coaching'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono text-purple-800 tabular-nums">
                    {activeTeacherComparison.cycles.s3.score}%
                  </span>
                  <span className="text-xs font-bold text-purple-600 font-mono tabular-nums">
                    +{Number((activeTeacherComparison.cycles.s3.score - activeTeacherComparison.cycles.s2.score).toFixed(1))} pt
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                  Kategori: <strong>{activeTeacherComparison.cycles.s3.category}</strong>
                </p>
                <p className="text-[10px] text-slate-400 mt-2">
                  Tanggal: {activeTeacherComparison.cycles.s3.dateStr}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                  Fokus: Penguatan Kombel Sekolah, Peer-Coaching, &amp; Asesmen
                </div>
              </div>

              {/* Siklus Lanjutan */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  activeTeacherComparison.cycles.sl.isReal
                    ? 'bg-amber-50/40 border-amber-200'
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                    <span>Siklus Lanjutan (RTL)</span>
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    activeTeacherComparison.cycles.sl.isReal
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {activeTeacherComparison.cycles.sl.isReal ? 'Terekam Riil' : 'Mandiri Berbagi'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono text-amber-900 tabular-nums">
                    {activeTeacherComparison.cycles.sl.score}%
                  </span>
                  <span className="text-xs font-bold text-amber-700 font-mono tabular-nums">
                    +{Number((activeTeacherComparison.cycles.sl.score - activeTeacherComparison.cycles.s3.score).toFixed(1))} pt
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                  Kategori: <strong>{activeTeacherComparison.cycles.sl.category}</strong>
                </p>
                <p className="text-[10px] text-slate-400 mt-2">
                  Tanggal: {activeTeacherComparison.cycles.sl.dateStr}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                  Fokus: Pemantauan Khusus RTL &amp; Pengimbasan Praktik Baik
                </div>
              </div>
            </div>
          </div>

          {/* Grid: Multi-Layer Radar SVG Overlay & 5 Dimension Growth */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Multi-Layer Radar SVG Overlay */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-slate-900">
                    Kurva Radar Pertumbuhan Kompetensi Multi-Siklus
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium font-mono">Skala 0 - 100%</span>
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  Superposisi 4 poligon siklus untuk menganalisis pemekaran kompetensi guru secara menyeluruh
                </p>

                {/* Layer Visibility Toggle Pills */}
                <div className="flex flex-wrap items-center gap-1.5 py-1 mb-2 border-b border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 mr-1">Tampilkan:</span>
                  {(['s1', 's2', 's3', 'sl'] as CycleKey[]).map((key) => {
                    const isVis = visibleLayers[key];
                    const meta = CYCLE_META[key];
                    return (
                      <button
                        key={key}
                        onClick={() => toggleLayer(key)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer border ${
                          isVis
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: meta.hex }}
                        />
                        <span>{meta.label}</span>
                        {isVis ? <Eye className="w-3 h-3 text-slate-300" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Multi Radar SVG */}
              <div className="relative w-full max-w-[390px] mx-auto aspect-square flex items-center justify-center my-2">
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  {/* Grid background concentric pentagons */}
                  {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, idx) => {
                    const r = 130 * level;
                    const center = 200;
                    const angles = [0, 72, 144, 216, 288].map((a) => (a - 90) * (Math.PI / 180));
                    const points = angles
                      .map((angle) => {
                        const x = center + r * Math.cos(angle);
                        const y = center + r * Math.sin(angle);
                        return `${x},${y}`;
                      })
                      .join(' ');

                    return (
                      <g key={level}>
                        <polygon
                          points={points}
                          fill={idx % 2 === 0 ? '#f8fafc' : '#ffffff'}
                          stroke="#e2e8f0"
                          strokeWidth="1"
                        />
                        <text
                          x={center + 4}
                          y={center - r + 10}
                          fontSize="9"
                          fill="#94a3b8"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {Math.round(level * 100)}%
                        </text>
                      </g>
                    );
                  })}

                  {/* 5 Axis lines */}
                  {[0, 72, 144, 216, 288].map((angleDeg, i) => {
                    const angle = (angleDeg - 90) * (Math.PI / 180);
                    const x2 = 200 + 130 * Math.cos(angle);
                    const y2 = 200 + 130 * Math.sin(angle);
                    return (
                      <line
                        key={i}
                        x1="200"
                        y1="200"
                        x2={x2}
                        y2={y2}
                        stroke="#cbd5e1"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                    );
                  })}

                  {/* Dimension labels */}
                  {[
                    { label: 'Pra-Observasi', x: 200, y: 50, anchor: 'middle' },
                    { label: 'Pendahuluan', x: 335, y: 155, anchor: 'start' },
                    { label: 'Kegiatan Inti', x: 290, y: 345, anchor: 'start' },
                    { label: 'Penutup / Formatif', x: 110, y: 345, anchor: 'end' },
                    { label: 'Refleksi & RTL', x: 65, y: 155, anchor: 'end' }
                  ].map((dim, i) => (
                    <text
                      key={i}
                      x={dim.x}
                      y={dim.y}
                      textAnchor={dim.anchor as any}
                      fontSize="10"
                      fontWeight="bold"
                      fill="#334155"
                    >
                      {dim.label}
                    </text>
                  ))}

                  {/* HELPER FUNCTION TO RENDER A CYCLE POLYGON */}
                  {(() => {
                    const center = 200;
                    const maxR = 130;
                    const angles = [0, 72, 144, 216, 288].map((a) => (a - 90) * (Math.PI / 180));

                    const renderCyclePolygon = (
                      cKey: CycleKey,
                      colorHex: string,
                      fillOpacity: number,
                      strokeWidth: number,
                      dashArray?: string
                    ) => {
                      if (!visibleLayers[cKey]) return null;
                      const dim = activeTeacherComparison.cycles[cKey].dimensions;
                      const values = [
                        dim.praObservasi / 100,
                        dim.pendahuluan / 100,
                        dim.inti / 100,
                        dim.penutup / 100,
                        dim.refleksiRtl / 100
                      ];

                      const points = values
                        .map((val, i) => {
                          const r = maxR * Math.max(0.1, Math.min(1.0, val));
                          const x = center + r * Math.cos(angles[i]);
                          const y = center + r * Math.sin(angles[i]);
                          return `${x},${y}`;
                        })
                        .join(' ');

                      return (
                        <g key={cKey}>
                          <polygon
                            points={points}
                            fill={colorHex}
                            fillOpacity={fillOpacity}
                            stroke={colorHex}
                            strokeWidth={strokeWidth}
                            strokeDasharray={dashArray}
                          />
                          {values.map((val, i) => {
                            const r = maxR * Math.max(0.1, Math.min(1.0, val));
                            const cx = center + r * Math.cos(angles[i]);
                            const cy = center + r * Math.sin(angles[i]);
                            return (
                              <circle
                                key={i}
                                cx={cx}
                                cy={cy}
                                r={strokeWidth >= 2.5 ? 4 : 3}
                                fill="#ffffff"
                                stroke={colorHex}
                                strokeWidth="2"
                              />
                            );
                          })}
                        </g>
                      );
                    };

                    return (
                      <>
                        {/* LAYER 1: SIKLUS 1 (Blue #3b82f6 dashed) */}
                        {renderCyclePolygon('s1', '#3b82f6', 0.12, 1.8, '4,3')}

                        {/* LAYER 2: SIKLUS 2 (Emerald #10b981 solid) */}
                        {renderCyclePolygon('s2', '#10b981', 0.16, 2.2)}

                        {/* LAYER 3: SIKLUS 3 (Purple #8b5cf6 solid) */}
                        {renderCyclePolygon('s3', '#8b5cf6', 0.18, 2.5)}

                        {/* LAYER 4: SIKLUS LANJUTAN (Amber #f59e0b solid) */}
                        {renderCyclePolygon('sl', '#f59e0b', 0.22, 2.8)}
                      </>
                    );
                  })()}
                </svg>
              </div>

              {/* Interactive Legend with dynamic values */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
                {(['s1', 's2', 's3', 'sl'] as CycleKey[]).map((key) => {
                  const meta = CYCLE_META[key];
                  const cData = activeTeacherComparison.cycles[key];
                  return (
                    <div
                      key={key}
                      onClick={() => toggleLayer(key)}
                      className={`p-2 rounded-lg border cursor-pointer transition-all ${
                        visibleLayers[key]
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-white opacity-40 border-dashed border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: meta.hex }}
                        />
                        <span className="text-[11px] text-slate-800 font-bold truncate">
                          {meta.label}
                        </span>
                      </div>
                      <div className="text-xs font-mono font-extrabold mt-1 text-slate-900">
                        {cData.score}%
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {cData.category}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: 5 Dimensions Multi-Cycle Progression */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Perkembangan Capaian per Dimensi Pedagogis
                </h4>
                <p className="text-xs text-slate-500">
                  Perbandingan evolusi 5 pilar supervisi dari Siklus 1 hingga Siklus Lanjutan
                </p>
              </div>

              <div className="space-y-4 pt-1">
                {[
                  {
                    title: '1. Kesiapan & Asesmen Awal (Pra-Observasi)',
                    key: 'praObservasi' as const
                  },
                  {
                    title: '2. Pengondisian & Apersepsi (Pendahuluan)',
                    key: 'pendahuluan' as const
                  },
                  {
                    title: '3. Diferensiasi, HOTS & KSE (Kegiatan Inti)',
                    key: 'inti' as const
                  },
                  {
                    title: '4. Asesmen Formatif & Umpan Balik (Penutup)',
                    key: 'penutup' as const
                  },
                  {
                    title: '5. Refleksi & Komitmen Rencana Tindak Lanjut',
                    key: 'refleksiRtl' as const
                  }
                ].map((item, idx) => {
                  const s1Val = activeTeacherComparison.cycles.s1.dimensions[item.key];
                  const s2Val = activeTeacherComparison.cycles.s2.dimensions[item.key];
                  const s3Val = activeTeacherComparison.cycles.s3.dimensions[item.key];
                  const slVal = activeTeacherComparison.cycles.sl.dimensions[item.key];
                  const totalDelta = slVal - s1Val;

                  return (
                    <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{item.title}</span>
                        <span className="font-mono tabular-nums font-bold text-emerald-700">
                          Total: +{totalDelta}%
                        </span>
                      </div>

                      {/* 4 Mini Progress Bars */}
                      <div className="grid grid-cols-4 gap-2 pt-1">
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                            <span>S1</span>
                            <span className="font-mono font-bold text-blue-700">{s1Val}%</span>
                          </div>
                          <div className="bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s1Val}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                            <span>S2</span>
                            <span className="font-mono font-bold text-emerald-700">{s2Val}%</span>
                          </div>
                          <div className="bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s2Val}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                            <span>S3</span>
                            <span className="font-mono font-bold text-purple-700">{s3Val}%</span>
                          </div>
                          <div className="bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${s3Val}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                            <span>SL</span>
                            <span className="font-mono font-bold text-amber-800">{slVal}%</span>
                          </div>
                          <div className="bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${slVal}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 12 Indikator Observasi Kelas Delta Table Lintas 4 Siklus */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Tabel Rinci Pertumbuhan 12 Indikator Lintas 4 Siklus Supervisi
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Perbandingan skor skala rubrik (1.0 s/d 4.0) untuk {activeTeacherComparison.teacherName} pada Siklus 1, 2, 3, dan Siklus Lanjutan
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                Lompatan Tertinggi: {activeTeacherComparison.topGrownIndicator.title}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="py-3 px-3 text-center w-12">No</th>
                    <th className="py-3 px-4">Indikator Observasi Kurikulum Merdeka</th>
                    <th className="py-3 px-3 text-center w-24">Siklus 1 (Awal)</th>
                    <th className="py-3 px-3 text-center w-24">Siklus 2 (Evaluasi)</th>
                    <th className="py-3 px-3 text-center w-24">Siklus 3 (Konsolidasi)</th>
                    <th className="py-3 px-3 text-center w-24">Siklus Lanjutan</th>
                    <th className="py-3 px-3 text-center w-28">Total Kenaikan (&Delta;)</th>
                    <th className="py-3 px-4">Status Penguasaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {OBSERVATION_INDICATORS.map((ind) => {
                    const s1 = activeTeacherComparison.cycles.s1.scores[ind.id] || 0;
                    const s2 = activeTeacherComparison.cycles.s2.scores[ind.id] || 0;
                    const s3 = activeTeacherComparison.cycles.s3.scores[ind.id] || 0;
                    const sl = activeTeacherComparison.cycles.sl.scores[ind.id] || 0;
                    const totalDelta = sl - s1;
                    const isSignificant = totalDelta >= 1.0;

                    return (
                      <tr
                        key={ind.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isSignificant ? 'bg-emerald-50/30' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-500">
                          {ind.id}
                        </td>

                        <td className="py-3 px-4 max-w-sm">
                          <p className="font-bold text-slate-900">{ind.title}</p>
                          <p className="text-[11px] text-slate-500 truncate" title={ind.description}>
                            {ind.description}
                          </p>
                        </td>

                        <td className="py-3 px-3 text-center font-mono tabular-nums font-bold text-slate-600">
                          {s1.toFixed(1)} / 4.0
                        </td>

                        <td className="py-3 px-3 text-center font-mono tabular-nums font-bold text-emerald-700">
                          {s2.toFixed(1)} / 4.0
                        </td>

                        <td className="py-3 px-3 text-center font-mono tabular-nums font-bold text-purple-700">
                          {s3.toFixed(1)} / 4.0
                        </td>

                        <td className="py-3 px-3 text-center font-mono tabular-nums font-bold text-amber-800">
                          {sl.toFixed(1)} / 4.0
                        </td>

                        <td className="py-3 px-3 text-center font-mono tabular-nums font-bold">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              isSignificant
                                ? 'bg-emerald-100 text-emerald-800'
                                : totalDelta > 0
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'text-slate-500'
                            }`}
                          >
                            +{totalDelta.toFixed(1)}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {sl >= 4.0 ? (
                            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Mahir Sempurna (Skala 4.0)
                            </span>
                          ) : sl >= 3.0 ? (
                            <span className="text-[11px] font-semibold text-blue-700 flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5" />
                              Kompeten Berkelanjutan
                            </span>
                          ) : (
                            <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Perlu Pendampingan RTL
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinical Coaching Roadmap across 4 Cycles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Intervensi Bimbingan Klinis Pengawas yang Diterapkan</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {activeTeacherComparison.interventionsApplied.map((intv, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{intv}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Rekomendasi Lanjutan Pengawas Pembina</span>
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {activeTeacherComparison.postCycleRecommendation}
              </p>
              <div className="pt-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <strong>Catatan Integrasi:</strong> Peningkatan dari Siklus 1 ke Siklus Lanjutan membuktikan bahwa coaching berbasis bukti (TIRTA) dan tindak lanjut terarah berhasil meningkatkan mutu pedagogis guru di kelas riil.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LAJU PERTUMBUHAN ANTAR-SEKOLAH */}
      {activeSubTab === 'schools' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Peringkat Laju Pertumbuhan Mutu Guru per Satuan Pendidikan Binaan
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Melihat efektivitas pembinaan dan percepatan pembenahan kualitas pembelajaran di masing-masing sekolah binaan
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {regionalGrowth.schoolGrowthSummary.map((sch, i) => (
                <div
                  key={sch.schoolName}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center font-mono">
                        {i + 1}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{sch.schoolName}</h4>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-700 font-mono tabular-nums">
                      +{sch.avgDelta} pt
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                    <span>{sch.teacherCount} Guru Terpantau</span>
                    <span className="text-emerald-700 font-semibold font-mono tabular-nums">
                      Rata-rata Kenaikan: +{sch.avgGrowthPct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN PRINT CONTAINER (for isolated print / save PDF) */}
      <div id="growth-tracker-print-area" className="hidden">
        <div style={{ padding: '20px', fontFamily: 'Times New Roman, serif', color: '#000000' }}>
          {/* KOP RESMI */}
          <div style={{ textAlign: 'center', borderBottom: '2.5px solid #000000', paddingBottom: '12px', marginBottom: '18px' }}>
            <h2 style={{ margin: '0', fontSize: '15pt', textTransform: 'uppercase', fontWeight: 'bold' }}>
              PEMERINTAH DAERAH DINAS PENDIDIKAN
            </h2>
            <h3 style={{ margin: '2px 0', fontSize: '13pt', textTransform: 'uppercase', fontWeight: 'bold' }}>
              KOORDINATOR PENGAWAS SEKOLAH MENENGAH PERTAMA
            </h3>
            <p style={{ margin: '0', fontSize: '10pt', fontStyle: 'italic', color: '#333333' }}>
              {settings.schoolAddress || 'Gedung Pusat Pengawas Pembina Pendidikan Terpadu'}
            </p>
          </div>

          {/* JUDUL RESMI */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: '0', fontSize: '13pt', textDecoration: 'underline', textTransform: 'uppercase', fontWeight: 'bold' }}>
              LAPORAN EVALUASI PERTUMBUHAN MULTI-SIKLUS GURU (SIKLUS 1, 2, 3, DAN LANJUTAN)
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '10pt', fontStyle: 'italic' }}>
              Tahun Ajaran 2026/2027 · Evaluasi Berkelanjutan Berbasis 12 Indikator Kurikulum Merdeka
            </p>
          </div>

          {/* IDENTITAS PENGAWAS & RINGKASAN */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '10pt' }}>
            <tbody>
              <tr>
                <td style={{ width: '25%', fontWeight: 'bold', padding: '4px', border: '1px solid #000000' }}>Pengawas Sekolah</td>
                <td style={{ width: '40%', padding: '4px', border: '1px solid #000000' }}>{settings.supervisorName}</td>
                <td style={{ width: '20%', fontWeight: 'bold', padding: '4px', border: '1px solid #000000' }}>Guru Terpantau</td>
                <td style={{ width: '15%', padding: '4px', border: '1px solid #000000', textAlign: 'center', fontWeight: 'bold' }}>{regionalGrowth.totalTrackedTeachers} Guru</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', padding: '4px', border: '1px solid #000000' }}>NIP Pengawas</td>
                <td style={{ padding: '4px', border: '1px solid #000000' }}>{settings.supervisorNip}</td>
                <td style={{ fontWeight: 'bold', padding: '4px', border: '1px solid #000000' }}>Rerata Kenaikan</td>
                <td style={{ padding: '4px', border: '1px solid #000000', textAlign: 'center', fontWeight: 'bold' }}>+{regionalGrowth.averageGrowthDelta} Poin</td>
              </tr>
            </tbody>
          </table>

          {/* TABEL REKAPITULASI PERTUMBUHAN SELURUH GURU LINTAS 4 SIKLUS */}
          <h4 style={{ margin: '14px 0 6px', fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
            I. Matriks Pertumbuhan Nilai Guru Lintas 4 Siklus Supervisi
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9pt' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center', width: '4%' }}>No</th>
                <th style={{ border: '1px solid #000000', padding: '5px', width: '22%' }}>Nama Guru &amp; NIP</th>
                <th style={{ border: '1px solid #000000', padding: '5px', width: '15%' }}>Mata Pelajaran</th>
                <th style={{ border: '1px solid #000000', padding: '5px', width: '17%' }}>Satuan Pendidikan</th>
                <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center', width: '8%' }}>Siklus 1</th>
                <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center', width: '8%' }}>Siklus 2</th>
                <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center', width: '8%' }}>Siklus 3</th>
                <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center', width: '8%' }}>Lanjutan</th>
                <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center', width: '10%' }}>Delta Total</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((c, i) => (
                <tr key={c.teacherId}>
                  <td style={{ border: '1px solid #000000', padding: '4px', textAlign: 'center' }}>{i + 1}</td>
                  <td style={{ border: '1px solid #000000', padding: '4px' }}>
                    <strong>{c.teacherName}</strong><br />
                    <span style={{ fontSize: '8pt', color: '#475569' }}>NIP: {c.nip}</span>
                  </td>
                  <td style={{ border: '1px solid #000000', padding: '4px' }}>{c.mapel}</td>
                  <td style={{ border: '1px solid #000000', padding: '4px' }}>{c.satuanPendidikan}</td>
                  <td style={{ border: '1px solid #000000', padding: '4px', textAlign: 'center' }}>{c.cycles.s1.score}%</td>
                  <td style={{ border: '1px solid #000000', padding: '4px', textAlign: 'center', color: '#15803d' }}>{c.cycles.s2.score}%</td>
                  <td style={{ border: '1px solid #000000', padding: '4px', textAlign: 'center', color: '#7e22ce' }}>{c.cycles.s3.score}%</td>
                  <td style={{ border: '1px solid #000000', padding: '4px', textAlign: 'center', fontWeight: 'bold', color: '#b45309' }}>{c.cycles.sl.score}%</td>
                  <td style={{ border: '1px solid #000000', padding: '4px', textAlign: 'center', fontWeight: 'bold', color: '#15803d' }}>
                    +{c.totalCumulativeDelta} pt
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* LEMBAR PENGESAHAN */}
          <table style={{ width: '100%', border: 'none', marginTop: '30px', fontSize: '10pt' }}>
            <tbody>
              <tr>
                <td style={{ width: '50%', textAlign: 'left', verticalAlign: 'top', border: 'none' }}>
                  Mengetahui,<br />
                  Koordinator Pengawas / Kepala Dinas Pendidikan<br />
                  <div style={{ height: '65px' }} />
                  <strong><u>{settings.pengawasPembinaName || 'Dr. Hj. Endang Sulastri, M.Pd.'}</u></strong><br />
                  NIP. {settings.pengawasPembinaNip || '19650410 199103 2 001'}
                </td>
                <td style={{ width: '50%', textAlign: 'left', verticalAlign: 'top', border: 'none', paddingLeft: '40px' }}>
                  {settings.schoolCity || 'Kota Pendidikan'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />
                  Pengawas Sekolah Pembina,<br />
                  <div style={{ height: '65px' }} />
                  <strong><u>{settings.supervisorName}</u></strong><br />
                  NIP. {settings.supervisorNip}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
