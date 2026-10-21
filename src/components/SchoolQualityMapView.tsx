/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Compass,
  FileDown,
  Printer,
  TrendingUp,
  Award,
  Users,
  School,
  ArrowRight,
  Layers,
  Sparkles,
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Search,
  Filter,
  BarChart2,
  ArrowUpDown,
  BookOpen,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import {
  AppSettings,
  OBSERVATION_INDICATORS,
  PMReport,
  SchoolQualityMetrics,
  SupervisionRecord,
  Teacher
} from '../types/inspiro';
import {
  calculateQualityMapAnalysis,
  QualityMapAnalysis,
  SCHOOL_COLORS
} from '../utils/qualityMapUtils';
import { exportQualityMapToWord, printDocumentElement } from '../utils/documentExport';
import { SignatoryModal } from './SignatoryModal';
import { saveSettings } from '../utils/storage';
import { FileSignature } from 'lucide-react';

interface SchoolQualityMapViewProps {
  supervisions: SupervisionRecord[];
  teachers: Teacher[];
  pmReports: PMReport[];
  settings: AppSettings;
  onNavigateToSupervision?: (schoolName?: string) => void;
  onNavigateToPM?: () => void;
  onUpdateSettings?: (newSettings: AppSettings) => void;
  showToast?: (titleOrType: string, descOrMsg?: string, typeOrDetail?: any) => void;
}

type ViewSubTab = 'matrix' | 'comparison' | 'interventions';

export const SchoolQualityMapView: React.FC<SchoolQualityMapViewProps> = ({
  supervisions,
  teachers,
  pmReports,
  settings,
  onNavigateToSupervision,
  onNavigateToPM,
  onUpdateSettings,
  showToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ViewSubTab>('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [isSignatoryModalOpen, setIsSignatoryModalOpen] = useState(false);

  // Normalize settings to ensure HERIANSYAH, S.Si., S.Pd., M.Pd without typo period
  const [localSettings, setLocalSettings] = useState<AppSettings>(() => {
    const isNeedsCorrection =
      !settings.supervisorName ||
      settings.supervisorName.includes('Heriansyah.') ||
      settings.supervisorName.toLowerCase().includes('rustina') ||
      settings.supervisorName === 'Heriansyah, S.Si., S.Pd., M.Pd';

    if (isNeedsCorrection) {
      return {
        ...settings,
        supervisorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd'
      };
    }
    return settings;
  });

  useEffect(() => {
    const isNeedsCorrection =
      !settings.supervisorName ||
      settings.supervisorName.includes('Heriansyah.') ||
      settings.supervisorName.toLowerCase().includes('rustina') ||
      settings.supervisorName === 'Heriansyah, S.Si., S.Pd., M.Pd';

    if (isNeedsCorrection) {
      setLocalSettings({
        ...settings,
        supervisorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd'
      });
    } else {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSaveSignatories = (updatedSettings: AppSettings) => {
    setLocalSettings(updatedSettings);
    if (onUpdateSettings) {
      onUpdateSettings(updatedSettings);
    } else {
      saveSettings(updatedSettings);
    }
    showToast?.(
      'success',
      'Pejabat Penandatangan Disimpan',
      `Dokumen akan mencantumkan Pengawas: ${updatedSettings.supervisorName}`
    );
  };

  // Compute full analysis
  const analysis: QualityMapAnalysis = useMemo(() => {
    return calculateQualityMapAnalysis(supervisions, teachers, pmReports, settings);
  }, [supervisions, teachers, pmReports, settings]);

  // Selected schools for multi-school comparison (default top 2 or 3)
  const [selectedSchoolNames, setSelectedSchoolNames] = useState<string[]>(() => {
    return analysis.schools.slice(0, 3).map((s) => s.schoolName);
  });

  // Filtered schools for matrix view
  const filteredSchools = useMemo(() => {
    return analysis.schools.filter((s) => {
      const matchQuery = s.schoolName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        categoryFilter === 'all' ||
        (categoryFilter === 'amat_baik' && s.category === 'Amat Baik (SB)') ||
        (categoryFilter === 'baik' && s.category === 'Baik (B)') ||
        (categoryFilter === 'cukup' && s.category === 'Cukup (C)') ||
        (categoryFilter === 'intensif' && s.supportTier === 'intensif');
      return matchQuery && matchCategory;
    });
  }, [analysis.schools, searchQuery, categoryFilter]);

  // Toggle school selection for comparison
  const toggleSchoolForComparison = (schoolName: string) => {
    setSelectedSchoolNames((prev) => {
      if (prev.includes(schoolName)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter((name) => name !== schoolName);
      } else {
        if (prev.length >= 4) {
          showToast?.('info', 'Maksimal 4 sekolah binaan untuk komparasi radar optimal.');
          return prev;
        }
        return [...prev, schoolName];
      }
    });
  };

  // Handle Word export
  const handleExportWord = () => {
    setIsExportingWord(true);
    try {
      exportQualityMapToWord(analysis, localSettings);
      showToast?.('success', 'Dokumen Laporan Peta Mutu (.doc) berhasil diunduh.');
    } catch (err) {
      console.error('Export error:', err);
      showToast?.('error', 'Gagal mengekspor dokumen Word.');
    } finally {
      setTimeout(() => setIsExportingWord(false), 800);
    }
  };

  // Handle Print / PDF
  const handlePrint = () => {
    const success = printDocumentElement(
      'quality-map-print-area',
      'Laporan Peta Mutu & Komparasi Antar-Sekolah Binaan',
      { orientation: 'landscape' }
    );
    if (success) {
      showToast?.('info', 'Membuka jendela cetak / simpan PDF...');
    }
  };

  // Compared schools data
  const comparedSchools = useMemo(() => {
    return analysis.schools.filter((s) => selectedSchoolNames.includes(s.schoolName));
  }, [analysis.schools, selectedSchoolNames]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Compass className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Peta Mutu &amp; Komparasi Antar-Sekolah Binaan
              </h2>
            </div>
            {/* Unboxed clean metadata (zero-pill discipline) */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-2 font-medium">
              <span>Pengawas: {settings.supervisorName}</span>
              <span aria-hidden="true">·</span>
              <span>NIP: {settings.supervisorNip}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-blue-600">
                {analysis.regional.totalSchools} Sekolah Binaan
              </span>
              <span aria-hidden="true">·</span>
              <span>{analysis.regional.totalTeachers} Guru Terdata</span>
              <span aria-hidden="true">·</span>
              <span>Tahun Ajaran 2026/2027</span>
            </div>
          </div>

          {/* Action Buttons: Print & Word Export */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Menu Input Yang Bertanda Tangan */}
            <button
              onClick={() => setIsSignatoryModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-lg transition-colors shadow-2xs cursor-pointer"
              title="Menu input pejabat yang bertanda tangan (Pengawas, Koordinator/Kepala Sekolah, Titimangsa)"
            >
              <FileSignature className="w-4 h-4 text-blue-600" />
              <span>Atur Penandatangan</span>
            </button>

            <button
              onClick={handleExportWord}
              disabled={isExportingWord}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              title="Unduh rekapitulasi peta mutu dan komparasi dalam format Word (.doc)"
            >
              <FileDown className="w-4 h-4 text-blue-600" />
              <span>{isExportingWord ? 'Menyiapkan Word...' : 'Unduh Word (.doc)'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-600/20 cursor-pointer"
              title="Cetak format resmi atau simpan ke PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Sub-tab Navigation (Functional interactive segmented control) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mt-4 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'matrix'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-600" />
            <span>01. Matriks Peta Mutu Binaan</span>
          </button>

          <button
            onClick={() => setActiveSubTab('comparison')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'comparison'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitCompare className="w-4 h-4 text-indigo-600" />
            <span>02. Radar &amp; Komparasi 12 Indikator</span>
          </button>

          <button
            onClick={() => setActiveSubTab('interventions')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'interventions'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>03. Rekomendasi Program Pengawas</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MATRIKS PETA MUTU BINAAN */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-6">
          {/* 4 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Rata-rata Skor Wilayah
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                  {analysis.regional.regionalAverageScore}
                </span>
                <span className="text-xs font-semibold text-slate-400">/ 100</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Capaian agregat supervisi akademik di seluruh satuan pendidikan binaan
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Sekolah Nilai Tertinggi
              </span>
              <div className="truncate text-base font-bold text-emerald-700">
                {analysis.regional.topSchool.name}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-semibold font-mono tabular-nums">
                <Award className="w-3.5 h-3.5" />
                <span>Skor: {analysis.regional.topSchool.score}% (Rujukan Mutu)</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Prioritas Intervensi
              </span>
              <div className="truncate text-base font-bold text-amber-700">
                {analysis.regional.needSupportSchool.name}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-600 font-semibold font-mono tabular-nums">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Skor: {analysis.regional.needSupportSchool.score}% (Perlu Pendampingan)</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Blindspot Bersama Wilayah
              </span>
              <div className="truncate text-sm font-bold text-rose-700" title={analysis.regional.regionalBlindspotIndicator.title}>
                {analysis.regional.regionalBlindspotIndicator.title}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Rata-rata: <span className="font-mono tabular-nums font-semibold text-rose-600">{analysis.regional.regionalBlindspotIndicator.score}/4.0</span> · Agenda MGMP Bersama
              </p>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama sekolah binaan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Category Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({analysis.schools.length})
              </button>
              <button
                onClick={() => setCategoryFilter('amat_baik')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  categoryFilter === 'amat_baik'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Amat Baik
              </button>
              <button
                onClick={() => setCategoryFilter('baik')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  categoryFilter === 'baik'
                    ? 'bg-blue-700 text-white'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                }`}
              >
                Baik
              </button>
              <button
                onClick={() => setCategoryFilter('intensif')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  categoryFilter === 'intensif'
                    ? 'bg-amber-700 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                Butuh Intervensi
              </button>
            </div>
          </div>

          {/* School Quality Matrix Table */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Matriks Mutu Satuan Pendidikan Binaan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar capaian nilai supervisi dan 5 pilar dimensi pembelajaran per sekolah
                </p>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Menampilkan {filteredSchools.length} dari {analysis.schools.length} sekolah
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="py-3 px-4">Satuan Pendidikan</th>
                    <th className="py-3 px-3 text-center">Guru</th>
                    <th className="py-3 px-3 text-center">Skor Akhir</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3 text-center" title="Pra-Observasi & Kesiapan">Pra (%)</th>
                    <th className="py-3 px-3 text-center" title="Pendahuluan & Apersepsi">Awal (%)</th>
                    <th className="py-3 px-3 text-center" title="Kegiatan Inti & Diferensiasi">Inti (%)</th>
                    <th className="py-3 px-3 text-center" title="Penutup & Formatif">Tutup (%)</th>
                    <th className="py-3 px-4">Status &amp; Rekomendasi Pengawas</th>
                    <th className="py-3 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSchools.map((school, index) => {
                    const isSelectedForComp = selectedSchoolNames.includes(school.schoolName);
                    return (
                      <tr key={school.schoolName} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: school.color }}
                              aria-hidden="true"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{school.schoolName}</p>
                              <p className="text-[11px] text-slate-500 font-medium">
                                {school.supervisedCount > 0
                                  ? `${school.supervisedCount} guru telah disupervisi`
                                  : 'Data baseline awal'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono tabular-nums text-slate-700">
                          {school.teacherCount}
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono tabular-nums">
                          <span className="font-extrabold text-sm text-slate-900">
                            {school.averagePercentage}%
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className={`font-semibold ${
                              school.category === 'Amat Baik (SB)'
                                ? 'text-emerald-700'
                                : school.category === 'Baik (B)'
                                ? 'text-blue-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {school.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono tabular-nums text-slate-600">
                          {school.dimensions.praObservasi}%
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono tabular-nums text-slate-600">
                          {school.dimensions.pendahuluan}%
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono tabular-nums text-slate-600">
                          {school.dimensions.inti}%
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono tabular-nums text-slate-600">
                          {school.dimensions.penutup}%
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="font-semibold text-slate-800 text-[11px]">
                            {school.supportTierLabel}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate" title={school.recommendedAction}>
                            {school.recommendedAction}
                          </p>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={() => {
                              toggleSchoolForComparison(school.schoolName);
                              setActiveSubTab('comparison');
                            }}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                              isSelectedForComp
                                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                            title="Bandingkan sekolah ini di Radar & Indikator"
                          >
                            {isSelectedForComp ? 'Dibandingkan' : '+ Komparasi'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RADAR & KOMPARASI 12 INDIKATOR */}
      {activeSubTab === 'comparison' && (
        <div className="space-y-6">
          {/* School Selector Bar for Comparison */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Pilih Satuan Pendidikan untuk Komparasi Head-to-Head
                </h3>
                <p className="text-xs text-slate-500">
                  Pilih 2 hingga 4 sekolah binaan untuk melihat perbandingan kurva capaian
                </p>
              </div>
              <span className="text-xs text-slate-500 font-semibold font-mono tabular-nums">
                {selectedSchoolNames.length} sekolah dipilih
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {analysis.schools.map((s) => {
                const isSelected = selectedSchoolNames.includes(s.schoolName);
                return (
                  <button
                    key={s.schoolName}
                    onClick={() => toggleSchoolForComparison(s.schoolName)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                      aria-hidden="true"
                    />
                    <span>{s.schoolName}</span>
                    <span className="font-mono tabular-nums text-[10px] opacity-80">
                      ({s.averagePercentage}%)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Radar Chart & Multi-School Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: SVG Multi-School Radar Pentagon (5 Dimensi) */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    Radar Komparasi 5 Dimensi Mutu
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">Skala 0 - 100%</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Visualisasi perbandingan kekuatan dan gap pembelajaran antar-sekolah binaan
                </p>
              </div>

              {/* Responsive SVG Radar */}
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
                        {/* percentage mark */}
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

                  {/* Dimension labels around the pentagon */}
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

                  {/* Multi-School Polygons */}
                  {comparedSchools.map((school) => {
                    const center = 200;
                    const maxR = 130;
                    const d = school.dimensions;
                    const values = [
                      d.praObservasi / 100,
                      d.pendahuluan / 100,
                      d.inti / 100,
                      d.penutup / 100,
                      d.refleksiRtl / 100
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
                      <g key={school.schoolName}>
                        <polygon
                          points={points}
                          fill={school.color}
                          fillOpacity="0.16"
                          stroke={school.color}
                          strokeWidth="2.5"
                        />
                        {/* Dots on vertices */}
                        {values.map((val, i) => {
                          const r = maxR * Math.max(0.1, Math.min(1.0, val));
                          const cx = center + r * Math.cos(angles[i]);
                          const cy = center + r * Math.sin(angles[i]);
                          return (
                            <circle
                              key={i}
                              cx={cx}
                              cy={cy}
                              r="3.5"
                              fill="#ffffff"
                              stroke={school.color}
                              strokeWidth="2"
                            />
                          );
                        })}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Radar Legend */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
                {comparedSchools.map((s) => (
                  <div key={s.schoolName} className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-1.5 rounded-full"
                      style={{ backgroundColor: s.color }}
                      aria-hidden="true"
                    />
                    <span className="text-slate-800">{s.schoolName}</span>
                    <span className="font-mono tabular-nums text-slate-500">
                      ({s.averagePercentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Dimension Score Comparison Cards */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Perbandingan Capaian per Dimensi
                </h4>
                <p className="text-xs text-slate-500">
                  Analisis komparatif horizontal pada 5 pilar supervisi akademik
                </p>
              </div>

              <div className="space-y-4 pt-1">
                {[
                  { key: 'praObservasi', title: '1. Kesiapan & Asesmen Awal (Pra-Observasi)' },
                  { key: 'pendahuluan', title: '2. Pengondisian & Apersepsi (Pendahuluan)' },
                  { key: 'inti', title: '3. Diferensiasi, HOTS & KSE (Kegiatan Inti)' },
                  { key: 'penutup', title: '4. Asesmen Formatif & Umpan Balik (Penutup)' },
                  { key: 'refleksiRtl', title: '5. Refleksi & Komitmen Rencana Tindak Lanjut' }
                ].map((item) => (
                  <div key={item.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{item.title}</span>
                    </div>

                    <div className="space-y-1">
                      {comparedSchools.map((s) => {
                        const val = s.dimensions[item.key as keyof typeof s.dimensions];
                        return (
                          <div key={s.schoolName} className="flex items-center gap-2 text-xs">
                            <span className="w-24 truncate font-medium text-slate-600 text-[11px]" title={s.schoolName}>
                              {s.schoolName.replace('Merdeka Nusantara', '').replace('SMP Negeri ', 'SMPN ')}
                            </span>
                            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${val}%`,
                                  backgroundColor: s.color
                                }}
                              />
                            </div>
                            <span className="font-mono tabular-nums font-bold text-slate-800 text-[11px] w-9 text-right">
                              {val}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 12 Indikator Observasi Kelas Gap Analysis Table */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Komparasi 12 Indikator Observasi Kelas (Skala 1.0 - 4.0)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Analisis gap antar-sekolah pada setiap indikator instrumen observasi Kurikulum Merdeka
                </p>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Target Standar Kedinasan: $\ge$ 3.50
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="py-3 px-3 text-center w-12">No</th>
                    <th className="py-3 px-4">Indikator Observasi</th>
                    {comparedSchools.map((s) => (
                      <th key={s.schoolName} className="py-3 px-3 text-center">
                        <span className="truncate block max-w-[120px] mx-auto font-bold" title={s.schoolName}>
                          {s.schoolName.replace('Merdeka Nusantara', '').replace('SMP Negeri ', 'SMPN ')}
                        </span>
                      </th>
                    ))}
                    <th className="py-3 px-3 text-center bg-slate-100/60">Rerata Wilayah</th>
                    <th className="py-3 px-4">Status &amp; Gap Pembelajaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {OBSERVATION_INDICATORS.map((ind) => {
                    const rowScores = comparedSchools.map((s) => s.indicatorScores[ind.id] || 0);
                    const avgWilayah = analysis.schools.reduce((acc, curr) => acc + curr.indicatorScores[ind.id], 0) / analysis.schools.length;
                    const maxScore = Math.max(...rowScores);
                    const minScore = Math.min(...rowScores);
                    const deltaGap = Number((maxScore - minScore).toFixed(2));

                    const isBlindspot = avgWilayah < 3.2;
                    const isStrength = avgWilayah >= 3.65;

                    return (
                      <tr
                        key={ind.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isBlindspot ? 'bg-rose-50/20' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-center font-mono tabular-nums font-bold text-slate-500">
                          {ind.id}
                        </td>

                        <td className="py-3 px-4 max-w-sm">
                          <p className="font-bold text-slate-900">{ind.title}</p>
                          <p className="text-[11px] text-slate-500 truncate" title={ind.description}>
                            {ind.description}
                          </p>
                        </td>

                        {comparedSchools.map((s) => {
                          const score = s.indicatorScores[ind.id];
                          const isHighInRow = score === maxScore && comparedSchools.length > 1;
                          const isLowInRow = score === minScore && comparedSchools.length > 1 && maxScore - minScore >= 0.4;

                          return (
                            <td key={s.schoolName} className="py-3 px-3 text-center font-mono tabular-nums">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-bold ${
                                  isHighInRow
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isLowInRow
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'text-slate-800'
                                }`}
                              >
                                {score ? score.toFixed(2) : '-'}
                              </span>
                            </td>
                          );
                        })}

                        <td className="py-3 px-3 text-center font-mono tabular-nums font-bold text-slate-700 bg-slate-100/40">
                          {avgWilayah.toFixed(2)}
                        </td>

                        <td className="py-3 px-4">
                          {isBlindspot ? (
                            <span className="text-[11px] font-semibold text-rose-700 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Blindspot Bersama (Gap {deltaGap})
                            </span>
                          ) : isStrength ? (
                            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Kekuatan Kolektif
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-600">
                              Kesenjangan wajar (Gap {deltaGap})
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
        </div>
      )}

      {/* TAB 3: REKOMENDASI INTERVENSI PENGAWAS */}
      {activeSubTab === 'interventions' && (
        <div className="space-y-6">
          {/* Top Banner explaining the Evidence-Based Intervention Concept */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-blue-800/40">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-xl bg-blue-500/20 text-cyan-300 border border-cyan-400/30 shrink-0">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold">
                  Program Intervensi Pengawas Berbasis Bukti (Evidence-Based Clinical Guidance)
                </h3>
                <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-3xl leading-relaxed">
                  Sistem menganalisis kesenjangan antar-sekolah binaan dan merumuskan skema kemitraan
                  sejawat (peer-to-peer mentoring) serta agenda bimbingan klinis terfokus agar supervisi
                  memberikan dampak nyata terhadap peningkatan kualitas pembelajaran di kelas.
                </p>
              </div>
            </div>
          </div>

          {/* 1. Program Kemitraan Antar-Sekolah (Peer Mentoring) */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  1. Program Kemitraan Antar-Sekolah Binaan (Peer School Mentoring)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rekomendasi memasangkan sekolah rujukan praktik baik dengan sekolah yang membutuhkan penguatan
                </p>
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                {analysis.pairings.length} Kemitraan Terpetakan
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.pairings.map((pair, idx) => (
                <div
                  key={pair.id}
                  className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">
                      KEMITRAAN 0{idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      Fokus: {pair.focusArea}
                    </span>
                  </div>

                  {/* School flow */}
                  <div className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-lg border border-slate-200/80 text-xs">
                    <div className="flex-1">
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                        Sekolah Pengimbas (Mentor)
                      </p>
                      <p className="font-bold text-slate-900 truncate">{pair.sourceSchool}</p>
                      <span className="font-mono tabular-nums text-emerald-700 font-semibold text-[11px]">
                        Capaian {pair.mentorScore}%
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

                    <div className="flex-1 text-right">
                      <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                        Sekolah Sasaran (Mentee)
                      </p>
                      <p className="font-bold text-slate-900 truncate">{pair.targetSchool}</p>
                      <span className="font-mono tabular-nums text-amber-700 font-semibold text-[11px]">
                        Capaian {pair.targetScore}%
                      </span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1.5">
                    <p className="text-slate-700 leading-relaxed font-medium">
                      <span className="font-semibold text-slate-900">Strategi Pendampingan: </span>
                      {pair.actionStrategy}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      <span className="font-semibold text-slate-700">Target Dampak: </span>
                      {pair.expectedOutcome}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Agenda Tindak Lanjut Kolektif Pengawas */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                2. Agenda Tindak Lanjut Kolektif Pengawas Pembina
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Rencana intervensi dinas terstruktur untuk semester berjalan berdasarkan data peta mutu
              </p>
            </div>

            <div className="space-y-3">
              {analysis.collectivePlans.map((plan, i) => (
                <div
                  key={plan.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-600 font-mono">0{i + 1}.</span>
                      <h4 className="text-sm font-bold text-slate-900">{plan.topic}</h4>
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {plan.format}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{plan.rationale}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium pt-1">
                      <span>Sasaran: {plan.targetAudience}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-indigo-600 font-semibold">{plan.scheduleRecommendation}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                        plan.priorityLevel.includes('Tinggi')
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {plan.priorityLevel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN PRINT CONTAINER (for isolated print / save PDF) */}
      <div id="quality-map-print-area" className="hidden">
        <div style={{ padding: '20px', fontFamily: 'Times New Roman, serif', color: '#000000' }}>
          {/* KOP SURAT RESMI PENGAWAS */}
          <div style={{ textAlign: 'center', borderBottom: '2.5px solid #000000', paddingBottom: '12px', marginBottom: '20px' }}>
            <h2 style={{ margin: '0', fontSize: '15pt', textTransform: 'uppercase', fontWeight: 'bold' }}>
              PEMERINTAH DAERAH DINAS PENDIDIKAN
            </h2>
            <h3 style={{ margin: '2px 0', fontSize: '13pt', textTransform: 'uppercase', fontWeight: 'bold' }}>
              KOORDINATOR PENGAWAS SEKOLAH MENENGAH PERTAMA
            </h3>
            <p style={{ margin: '0', fontSize: '10pt', fontStyle: 'italic', color: '#333333' }}>
              {settings.schoolAddress || 'Pusat Layanan Pengawasan Pendidikan Terpadu, Wilayah Binaan'}
            </p>
          </div>

          {/* JUDUL DOKUMEN */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: '0', fontSize: '13pt', textDecoration: 'underline', textTransform: 'uppercase', fontWeight: 'bold' }}>
              LAPORAN RESMI PETA MUTU &amp; KOMPARASI ANTAR-SEKOLAH BINAAN
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '10pt', fontStyle: 'italic' }}>
              Tahun Ajaran 2026/2027 · Evaluasi Berkelanjutan Kurikulum Merdeka
            </p>
          </div>

          {/* TABEL 1: IDENTITAS PENGAWAS */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '10pt' }}>
            <tbody>
              <tr>
                <td style={{ width: '25%', fontWeight: 'bold', padding: '4px', border: '1px solid #000000' }}>Pengawas Sekolah</td>
                <td style={{ width: '40%', padding: '4px', border: '1px solid #000000' }}>{settings.supervisorName}</td>
                <td style={{ width: '20%', fontWeight: 'bold', padding: '4px', border: '1px solid #000000' }}>Total Sekolah Binaan</td>
                <td style={{ width: '15%', padding: '4px', border: '1px solid #000000', textAlign: 'center', fontWeight: 'bold' }}>{analysis.regional.totalSchools} Sekolah</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', padding: '4px', border: '1px solid #000000' }}>NIP Pengawas</td>
                <td style={{ padding: '4px', border: '1px solid #000000' }}>{settings.supervisorNip}</td>
                <td style={{ fontWeight: 'bold', padding: '4px', border: '1px solid #000000' }}>Rata-rata Wilayah</td>
                <td style={{ padding: '4px', border: '1px solid #000000', textAlign: 'center', fontWeight: 'bold' }}>{analysis.regional.regionalAverageScore}%</td>
              </tr>
            </tbody>
          </table>

          {/* TABEL 2: MATRIKS MUTU */}
          <h4 style={{ margin: '14px 0 6px', fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
            I. Matriks Peta Mutu Satuan Pendidikan Binaan
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9.5pt' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center' }}>No</th>
                <th style={{ border: '1px solid #000000', padding: '5px' }}>Satuan Pendidikan</th>
                <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center' }}>Guru</th>
                <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center' }}>Skor Mutu</th>
                <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center' }}>Predikat</th>
                <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center' }}>Pra (%)</th>
                <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center' }}>Awal (%)</th>
                <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center' }}>Inti (%)</th>
                <th style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center' }}>Tutup (%)</th>
                <th style={{ border: '1px solid #000000', padding: '5px' }}>Status Dukungan</th>
              </tr>
            </thead>
            <tbody>
              {analysis.schools.map((s, i) => (
                <tr key={s.schoolName}>
                  <td style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center' }}>{i + 1}</td>
                  <td style={{ border: '1px solid #000000', padding: '5px', fontWeight: 'bold' }}>{s.schoolName}</td>
                  <td style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center' }}>{s.teacherCount}</td>
                  <td style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center', fontWeight: 'bold' }}>{s.averagePercentage}%</td>
                  <td style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center' }}>{s.category}</td>
                  <td style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center' }}>{s.dimensions.praObservasi}%</td>
                  <td style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center' }}>{s.dimensions.pendahuluan}%</td>
                  <td style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center' }}>{s.dimensions.inti}%</td>
                  <td style={{ border: '1px solid #000000', padding: '5px', textAlign: 'center' }}>{s.dimensions.penutup}%</td>
                  <td style={{ border: '1px solid #000000', padding: '5px', fontSize: '8.5pt' }}>{s.supportTierLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* TABEL 3: KOMPARASI 12 INDIKATOR */}
          <h4 style={{ margin: '14px 0 6px', fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
            II. Komparasi Detail 12 Indikator Observasi Kelas (Skala 1.0 - 4.0)
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9pt' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={{ border: '1px solid #000000', padding: '4px', textAlign: 'center', width: '4%' }}>No</th>
                <th style={{ border: '1px solid #000000', padding: '4px', width: '38%' }}>Indikator Observasi</th>
                {analysis.schools.map((s) => (
                  <th key={s.schoolName} style={{ border: '1px solid #000000', padding: '4px', textAlign: 'center' }}>
                    {s.schoolName.replace('Merdeka Nusantara', '').replace('SMP Negeri ', 'SMPN ')}
                  </th>
                ))}
                <th style={{ border: '1px solid #000000', padding: '4px', textAlign: 'center', width: '10%' }}>Rerata</th>
              </tr>
            </thead>
            <tbody>
              {OBSERVATION_INDICATORS.map((ind) => {
                const avg = analysis.schools.reduce((acc, curr) => acc + curr.indicatorScores[ind.id], 0) / analysis.schools.length;
                return (
                  <tr key={ind.id}>
                    <td style={{ border: '1px solid #000000', padding: '4px', textAlign: 'center' }}>{ind.id}</td>
                    <td style={{ border: '1px solid #000000', padding: '4px' }}>
                      <strong>{ind.title}</strong>
                    </td>
                    {analysis.schools.map((s) => (
                      <td key={s.schoolName} style={{ border: '1px solid #000000', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                        {s.indicatorScores[ind.id] ? s.indicatorScores[ind.id].toFixed(2) : '-'}
                      </td>
                    ))}
                    <td style={{ border: '1px solid #000000', padding: '4px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f8fafc' }}>
                      {avg.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* TANDA TANGAN */}
          <table style={{ width: '100%', border: 'none', marginTop: '24px', fontSize: '9.5pt', pageBreakInside: 'avoid' }}>
            <tbody>
              <tr>
                <td style={{ width: '50%', textAlign: 'left', verticalAlign: 'top', border: 'none' }}>
                  Mengetahui,<br />
                  {localSettings.pengawasPembinaRole || 'Koordinator Pengawas / Kepala Dinas Pendidikan'}<br />
                  <div style={{ height: '60px' }} />
                  <strong><u>{localSettings.pengawasPembinaName || 'Dr. Hj. Endang Sulastri, M.Pd.'}</u></strong><br />
                  NIP. {localSettings.pengawasPembinaNip || '19650410 199103 2 001'}
                </td>
                <td style={{ width: '50%', textAlign: 'left', verticalAlign: 'top', border: 'none', paddingLeft: '40px' }}>
                  {localSettings.schoolCity || 'Kota Pendidikan'},{' '}
                  {localSettings.documentDate ||
                    new Date().toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}<br />
                  {localSettings.supervisorRole || 'Pengawas Sekolah Pembina'},<br />
                  <div style={{ height: '60px' }} />
                  <strong><u>{localSettings.supervisorName}</u></strong><br />
                  NIP. {localSettings.supervisorNip}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL INPUT & PENGATURAN YANG BERTANDA TANGAN */}
      <SignatoryModal
        isOpen={isSignatoryModalOpen}
        onClose={() => setIsSignatoryModalOpen(false)}
        settings={localSettings}
        onSave={handleSaveSignatories}
        onPrintAfterSave={() => handlePrint()}
      />
    </div>
  );
};
