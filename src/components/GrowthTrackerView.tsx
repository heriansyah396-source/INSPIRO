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
  ChevronRight
} from 'lucide-react';
import {
  AppSettings,
  OBSERVATION_INDICATORS,
  SupervisionRecord,
  Teacher,
  TeacherCycleComparison
} from '../types/inspiro';
import { calculateTeacherGrowthComparisons } from '../utils/growthTrackerUtils';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [trajectoryFilter, setTrajectoryFilter] = useState<string>('all');
  const [isExportingWord, setIsExportingWord] = useState(false);

  // Compute cycle growth analysis
  const { comparisons, regionalGrowth } = useMemo(() => {
    return calculateTeacherGrowthComparisons(supervisions, teachers, settings);
  }, [supervisions, teachers, settings]);

  // Selected teacher for deep-dive comparison
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(() => {
    return comparisons[0]?.teacherId || '';
  });

  const activeTeacherComparison = useMemo(() => {
    return comparisons.find((c) => c.teacherId === selectedTeacherId) || comparisons[0];
  }, [comparisons, selectedTeacherId]);

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
      showToast?.('success', 'Dokumen Evaluasi Pertumbuhan Siklus (.doc) berhasil diunduh.');
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
      'Laporan Evaluasi Pertumbuhan Siklus Supervisi'
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
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Growth Tracker: Komparasi Siklus I vs Siklus II
              </h2>
            </div>
            {/* Unboxed metadata (zero-pill discipline) */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-2 font-medium">
              <span>Pengawas: {settings.supervisorName}</span>
              <span aria-hidden="true">·</span>
              <span>{regionalGrowth.totalTrackedTeachers} Guru Terpantau</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-emerald-600 font-mono tabular-nums">
                Rata-rata Pertumbuhan: +{regionalGrowth.averageGrowthDelta} Poin (+{regionalGrowth.averageGrowthPercentage}%)
              </span>
              <span aria-hidden="true">·</span>
              <span>Siklus Semester Ganjil 2026/2027</span>
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
            <span>02. Dual Radar &amp; Analisis Delta Guru</span>
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
                Kenaikan capaian rata-rata guru dari Siklus I ke Siklus II
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
                Mengalami lompatan mutu signifikan setelah bimbingan klinis
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
                Kenaikan rerata: +{regionalGrowth.topFastestGrowingIndicator.avgDelta} poin
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
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Matriks Progresivitas Guru (Siklus I $\longrightarrow$ Siklus II)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bukti peningkatan kompetensi pedagogis pasca bimbingan klinis dan tindak lanjut RTL
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
                    <th className="py-3 px-3 text-center">Siklus I (Awal)</th>
                    <th className="py-3 px-3 text-center">Siklus II (Evaluasi)</th>
                    <th className="py-3 px-3 text-center">Lompatan (&Delta;)</th>
                    <th className="py-3 px-4">Indikator Melejit</th>
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

                      <td className="py-3.5 px-3 text-center font-mono tabular-nums">
                        <span className="font-bold text-slate-700">{c.scoreCycle1}%</span>
                        <span className="block text-[10px] text-slate-500">{c.categoryCycle1}</span>
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono tabular-nums">
                        <span className="font-extrabold text-sm text-emerald-700">{c.scoreCycle2}%</span>
                        <span className="block text-[10px] font-semibold text-emerald-600">{c.categoryCycle2}</span>
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono tabular-nums">
                        <div className="inline-flex items-center gap-0.5 px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>+{c.deltaScore} pt</span>
                        </div>
                        <span className="block text-[10px] text-emerald-600 mt-0.5">
                          (+{c.growthPercentage}%)
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-semibold text-slate-800 truncate" title={c.topGrownIndicator.title}>
                          {c.topGrownIndicator.title}
                        </p>
                        <p className="text-[11px] text-emerald-600 font-semibold font-mono tabular-nums">
                          Naik +{c.topGrownIndicator.delta.toFixed(1)} skala rubrik
                        </p>
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
                          title="Lihat dual radar dan komparasi 12 indikator"
                        >
                          Dual Radar
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

      {/* TAB 2: DUAL RADAR & ANALISIS DELTA GURU */}
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
                    {c.teacherName} — {c.mapel} (+{c.deltaScore} pt)
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
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xs p-3 sm:p-4 rounded-xl border border-white/15">
              <div className="text-center">
                <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Siklus I (Awal)</span>
                <span className="text-xl sm:text-2xl font-bold text-slate-200 font-mono tabular-nums">
                  {activeTeacherComparison.scoreCycle1}%
                </span>
                <span className="text-[10px] text-slate-400 block">{activeTeacherComparison.categoryCycle1}</span>
              </div>

              <ArrowRight className="w-5 h-5 text-cyan-300 shrink-0" />

              <div className="text-center">
                <span className="text-[10px] text-emerald-300 uppercase tracking-wider block font-bold">Siklus II (Evaluasi)</span>
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono tabular-nums">
                  {activeTeacherComparison.scoreCycle2}%
                </span>
                <span className="text-[10px] text-emerald-300 font-bold block">{activeTeacherComparison.categoryCycle2}</span>
              </div>

              <div className="pl-3 border-l border-white/20 text-center">
                <span className="text-[10px] text-cyan-200 uppercase tracking-wider block">Lompatan (&Delta;)</span>
                <span className="text-xl sm:text-2xl font-black text-cyan-300 font-mono tabular-nums">
                  +{activeTeacherComparison.deltaScore}
                </span>
                <span className="text-[10px] text-cyan-200 block">(+{activeTeacherComparison.growthPercentage}%)</span>
              </div>
            </div>
          </div>

          {/* Grid: Dual Radar Overlay & 5 Dimension Growth */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Dual Radar SVG Overlay (Siklus I vs Siklus II) */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-slate-900">
                    Dual Radar Pertumbuhan Kompetensi
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">Skala 0 - 100%</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Perbandingan hamparan poligon Siklus I (awal) vs Siklus II (pasca-intervensi)
                </p>
              </div>

              {/* Dual Radar SVG */}
              <div className="relative w-full max-w-[380px] mx-auto aspect-square flex items-center justify-center my-2">
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

                  {/* LAYER 1: SIKLUS I (Abu-abu / Dashed) */}
                  {(() => {
                    const center = 200;
                    const maxR = 130;
                    const d = activeTeacherComparison.dimensionDeltas;
                    const values = [
                      d.praObservasi.cycle1 / 100,
                      d.pendahuluan.cycle1 / 100,
                      d.inti.cycle1 / 100,
                      d.penutup.cycle1 / 100,
                      d.refleksiRtl.cycle1 / 100
                    ];
                    const angles = [0, 72, 144, 216, 288].map((a) => (a - 90) * (Math.PI / 180));
                    const points = values
                      .map((val, i) => {
                        const r = maxR * Math.max(0.1, Math.min(1.0, val));
                        const x = center + r * Math.cos(angles[i]);
                        const y = center + r * Math.sin(angles[i]);
                        return `${x},${y}`;
                      })
                      .join(' ');

                    return (
                      <g>
                        <polygon
                          points={points}
                          fill="#94a3b8"
                          fillOpacity="0.2"
                          stroke="#64748b"
                          strokeWidth="2"
                          strokeDasharray="4,3"
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
                              r="3"
                              fill="#64748b"
                            />
                          );
                        })}
                      </g>
                    );
                  })()}

                  {/* LAYER 2: SIKLUS II (Emerald Green Solid) */}
                  {(() => {
                    const center = 200;
                    const maxR = 130;
                    const d = activeTeacherComparison.dimensionDeltas;
                    const values = [
                      d.praObservasi.cycle2 / 100,
                      d.pendahuluan.cycle2 / 100,
                      d.inti.cycle2 / 100,
                      d.penutup.cycle2 / 100,
                      d.refleksiRtl.cycle2 / 100
                    ];
                    const angles = [0, 72, 144, 216, 288].map((a) => (a - 90) * (Math.PI / 180));
                    const points = values
                      .map((val, i) => {
                        const r = maxR * Math.max(0.1, Math.min(1.0, val));
                        const x = center + r * Math.cos(angles[i]);
                        const y = center + r * Math.sin(angles[i]);
                        return `${x},${y}`;
                      })
                      .join(' ');

                    return (
                      <g>
                        <polygon
                          points={points}
                          fill="#10b981"
                          fillOpacity="0.22"
                          stroke="#059669"
                          strokeWidth="2.5"
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
                              r="4"
                              fill="#ffffff"
                              stroke="#059669"
                              strokeWidth="2"
                            />
                          );
                        })}
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* Legend */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-6 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-1 bg-slate-400 border border-dashed border-slate-600 rounded-sm" />
                  <span className="text-slate-600">Siklus I (Diagnostik Awal)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-1.5 bg-emerald-600 rounded-sm" />
                  <span className="text-emerald-700 font-bold">Siklus II (Pasca-Bimbingan)</span>
                </div>
              </div>
            </div>

            {/* Right: 5 Dimensions Delta Progress */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Perkembangan Capaian per Dimensi Pembelajaran
                </h4>
                <p className="text-xs text-slate-500">
                  Lompatan persentase pemenuhan indikator dari Siklus I ke Siklus II
                </p>
              </div>

              <div className="space-y-4 pt-1">
                {[
                  {
                    title: '1. Kesiapan & Asesmen Awal (Pra-Observasi)',
                    data: activeTeacherComparison.dimensionDeltas.praObservasi
                  },
                  {
                    title: '2. Pengondisian & Apersepsi (Pendahuluan)',
                    data: activeTeacherComparison.dimensionDeltas.pendahuluan
                  },
                  {
                    title: '3. Diferensiasi, HOTS & KSE (Kegiatan Inti)',
                    data: activeTeacherComparison.dimensionDeltas.inti
                  },
                  {
                    title: '4. Asesmen Formatif & Umpan Balik (Penutup)',
                    data: activeTeacherComparison.dimensionDeltas.penutup
                  },
                  {
                    title: '5. Refleksi & Komitmen Rencana Tindak Lanjut',
                    data: activeTeacherComparison.dimensionDeltas.refleksiRtl
                  }
                ].map((item, idx) => {
                  const isPositive = item.data.delta > 0;
                  return (
                    <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{item.title}</span>
                        <span className="font-mono tabular-nums font-bold text-emerald-700">
                          {isPositive ? '+' : ''}{item.data.delta}%
                        </span>
                      </div>

                      {/* Before and After Bars */}
                      <div className="space-y-1 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="w-16 text-slate-500 font-medium">Siklus I</span>
                          <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-slate-400 rounded-full"
                              style={{ width: `${item.data.cycle1}%` }}
                            />
                          </div>
                          <span className="font-mono tabular-nums text-slate-600 w-8 text-right">
                            {item.data.cycle1}%
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="w-16 text-emerald-700 font-bold">Siklus II</span>
                          <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-emerald-600 rounded-full"
                              style={{ width: `${item.data.cycle2}%` }}
                            />
                          </div>
                          <span className="font-mono tabular-nums text-emerald-700 font-bold w-8 text-right">
                            {item.data.cycle2}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 12 Indikator Observasi Kelas Delta Table */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Tabel Rinci Pertumbuhan 12 Indikator Observasi Kelas
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Perbandingan skor skala rubrik (1.0 s/d 4.0) untuk {activeTeacherComparison.teacherName}
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                Indikator Tertinggi Naik: {activeTeacherComparison.topGrownIndicator.title} (+{activeTeacherComparison.topGrownIndicator.delta})
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="py-3 px-3 text-center w-12">No</th>
                    <th className="py-3 px-4">Indikator Observasi</th>
                    <th className="py-3 px-3 text-center w-28">Siklus I (Awal)</th>
                    <th className="py-3 px-3 text-center w-28">Siklus II (Evaluasi)</th>
                    <th className="py-3 px-3 text-center w-28">Selisih Delta (&Delta;)</th>
                    <th className="py-3 px-4">Status Pertumbuhan &amp; Evaluasi Pengawas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {OBSERVATION_INDICATORS.map((ind) => {
                    const deltaData = activeTeacherComparison.indicatorDeltas[ind.id] || {
                      cycle1: 0,
                      cycle2: 0,
                      delta: 0
                    };
                    const isPositive = deltaData.delta > 0;
                    const isSignificant = deltaData.delta >= 1.0;

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
                          {deltaData.cycle1.toFixed(1)} / 4.0
                        </td>

                        <td className="py-3 px-3 text-center font-mono tabular-nums font-bold text-emerald-700">
                          {deltaData.cycle2.toFixed(1)} / 4.0
                        </td>

                        <td className="py-3 px-3 text-center font-mono tabular-nums font-bold">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              isSignificant
                                ? 'bg-emerald-100 text-emerald-800'
                                : isPositive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'text-slate-500'
                            }`}
                          >
                            {isPositive ? '+' : ''}{deltaData.delta.toFixed(1)}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {isSignificant ? (
                            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Lompatan Mutu Signifikan
                            </span>
                          ) : isPositive ? (
                            <span className="text-[11px] font-semibold text-blue-700 flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5" />
                              Kemajuan Terukur
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500">
                              Kompetensi Terjaga Stabil
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

          {/* Interventions Applied & Post-Cycle Recommendation Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Intervensi Pasca Siklus I yang Telah Diterapkan Guru</span>
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
                <span>Rekomendasi Bimbingan Lanjutan Pengawas Pembina</span>
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {activeTeacherComparison.postCycleRecommendation}
              </p>
              <div className="pt-2">
                <span className="text-[11px] text-slate-500">
                  Target Siklus Berikutnya: Pemeliharaan konsistensi diferensiasi dan pembiasaan asesmen formatif 2 menit.
                </span>
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
              Melihat efektivitas pembinaan dan percepatan pembenahan kualitas pembelajaran di masing-masing sekolah
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
              LAPORAN EVALUASI PERTUMBUHAN KOMPETENSI GURU ANTAR-SIKLUS SUPERVISI (SIKLUS I VS SIKLUS II)
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

          {/* TABEL REKAPITULASI PERTUMBUHAN SELURUH GURU */}
          <h4 style={{ margin: '14px 0 6px', fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
            I. Matriks Pertumbuhan Nilai Guru (Siklus I ke Siklus II)
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9.5pt' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center', width: '4%' }}>No</th>
                <th style={{ border: '1px solid #000000', padding: '5px', width: '26%' }}>Nama Guru &amp; NIP</th>
                <th style={{ border: '1px solid #000000', padding: '5px', width: '18%' }}>Mata Pelajaran</th>
                <th style={{ border: '1px solid #000000', padding: '5px', width: '20%' }}>Satuan Pendidikan</th>
                <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center', width: '10%' }}>Siklus I</th>
                <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center', width: '10%' }}>Siklus II</th>
                <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center', width: '12%' }}>Delta (&Delta;)</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((c, i) => (
                <tr key={c.teacherId}>
                  <td style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center' }}>{i + 1}</td>
                  <td style={{ border: '1px solid #000000', padding: '5px' }}>
                    <strong>{c.teacherName}</strong><br />
                    <span style={{ fontSize: '8pt', color: '#475569' }}>NIP: {c.nip}</span>
                  </td>
                  <td style={{ border: '1px solid #000000', padding: '5px' }}>{c.mapel}</td>
                  <td style={{ border: '1px solid #000000', padding: '5px' }}>{c.satuanPendidikan}</td>
                  <td style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center' }}>{c.scoreCycle1}%</td>
                  <td style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center', fontWeight: 'bold' }}>{c.scoreCycle2}%</td>
                  <td style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center', fontWeight: 'bold', color: '#15803d' }}>
                    +{c.deltaScore} pt (+{c.growthPercentage}%)
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
