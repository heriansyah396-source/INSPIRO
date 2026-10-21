/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import {
  Sparkles,
  Grid2X2,
  Users,
  Compass,
  ArrowRight,
  Printer,
  Download,
  FileSignature,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  ChevronRight,
  Building,
  Target,
  Zap,
  ShieldCheck,
  HeartHandshake,
  PlayCircle,
  Sliders,
  X,
  Info,
  Check,
  UserCheck
} from 'lucide-react';
import {
  Teacher,
  SupervisionRecord,
  TirtaCoachingRecord,
  TeacherQuadrantProfile,
  TeacherQuadrantType,
  QUADRANT_DEFINITIONS,
  AppSettings
} from '../types/inspiro';
import {
  computeTeacherQuadrants,
  saveQuadrantOverride,
  exportQuadrantReportToWord
} from '../utils/quadrantUtils';
import { printDocumentElement } from '../utils/documentExport';
import { SignatoryModal } from './SignatoryModal';

interface TeacherQuadrantViewProps {
  teachers: Teacher[];
  supervisions: SupervisionRecord[];
  coachingRecords?: TirtaCoachingRecord[];
  settings: AppSettings;
  onStartSupervision?: (teacherId?: string) => void;
  onNavigateToCoaching?: (teacherId?: string) => void;
  onUpdateSettings?: (newSettings: AppSettings) => void;
  showToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

export const TeacherQuadrantView: React.FC<TeacherQuadrantViewProps> = ({
  teachers,
  supervisions,
  coachingRecords = [],
  settings,
  onStartSupervision,
  onNavigateToCoaching,
  onUpdateSettings,
  showToast
}) => {
  // State for overrides reload
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Compute all profiles
  const profiles: TeacherQuadrantProfile[] = useMemo(() => {
    // refreshTrigger forces re-read of localStorage overrides
    return computeTeacherQuadrants(teachers, supervisions, coachingRecords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teachers, supervisions, coachingRecords, refreshTrigger]);

  // Selected Teacher Profile for inspector
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(() => {
    return profiles[0]?.teacherId || '';
  });

  // Filters
  const [filterSchool, setFilterSchool] = useState<string>('all');
  const [filterQuadrant, setFilterQuadrant] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'matrix' | 'table'>('matrix');

  // Modals
  const [isSignatoryModalOpen, setIsSignatoryModalOpen] = useState<boolean>(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState<boolean>(false);
  const [adjustingTeacher, setAdjustingTeacher] = useState<TeacherQuadrantProfile | null>(null);

  // Adjust Form State
  const [sliderAbstraction, setSliderAbstraction] = useState<number>(75);
  const [sliderCommitment, setSliderCommitment] = useState<number>(75);
  const [adjustNotes, setAdjustNotes] = useState<string>('');

  // Print ref
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Distinct schools
  const distinctSchools = useMemo(() => {
    const set = new Set<string>();
    if (settings.schoolName) set.add(settings.schoolName);
    teachers.forEach((t) => t.satuanPendidikan && set.add(t.satuanPendidikan));
    return Array.from(set).filter(Boolean);
  }, [settings.schoolName, teachers]);

  // Filtered profiles
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      if (filterSchool !== 'all' && p.schoolName.toLowerCase() !== filterSchool.toLowerCase()) {
        return false;
      }
      if (filterQuadrant !== 'all' && p.quadrant !== filterQuadrant) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const inName = p.teacherName.toLowerCase().includes(q);
        const inMapel = p.mapel.toLowerCase().includes(q);
        const inSchool = p.schoolName.toLowerCase().includes(q);
        if (!inName && !inMapel && !inSchool) return false;
      }
      return true;
    });
  }, [profiles, filterSchool, filterQuadrant, searchTerm]);

  // Active Profile in Inspector
  const activeProfile = useMemo(() => {
    const found = filteredProfiles.find((p) => p.teacherId === selectedTeacherId);
    if (found) return found;
    return filteredProfiles[0] || profiles[0] || null;
  }, [filteredProfiles, profiles, selectedTeacherId]);

  // Quadrant Counts
  const counts = useMemo(() => {
    const q1 = filteredProfiles.filter((p) => p.quadrant === 'kuadran_1').length;
    const q2 = filteredProfiles.filter((p) => p.quadrant === 'kuadran_2').length;
    const q3 = filteredProfiles.filter((p) => p.quadrant === 'kuadran_3').length;
    const q4 = filteredProfiles.filter((p) => p.quadrant === 'kuadran_4').length;
    const total = filteredProfiles.length;
    return { q1, q2, q3, q4, total };
  }, [filteredProfiles]);

  // Open Adjust Modal
  const handleOpenAdjustModal = (prof: TeacherQuadrantProfile) => {
    setAdjustingTeacher(prof);
    setSliderAbstraction(prof.abstractionScore);
    setSliderCommitment(prof.commitmentScore);
    setAdjustNotes(prof.notes || '');
    setIsAdjustModalOpen(true);
  };

  // Save Adjust Modal
  const handleSaveAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingTeacher) return;
    saveQuadrantOverride({
      teacherId: adjustingTeacher.teacherId,
      abstractionScore: Number(sliderAbstraction),
      commitmentScore: Number(sliderCommitment),
      notes: adjustNotes.trim(),
      updatedAt: new Date().toISOString()
    });
    setRefreshTrigger((prev) => prev + 1);
    setIsAdjustModalOpen(false);
    showToast(
      'Diagnostik Diperbarui',
      `Skor Abstraksi & Komitmen untuk ${adjustingTeacher.teacherName} berhasil disesuaikan.`,
      'success'
    );
  };

  // Print Report
  const handlePrint = () => {
    printDocumentElement(
      'teacher-quadrant-print-area',
      `Peta_4_Kuadran_Guru_${(settings.supervisorName || 'Pengawas').replace(/[,. ]+/g, '_')}`,
      { orientation: 'landscape' }
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner with Executive Presence */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#091b3e] via-[#0d2757] to-[#13326f] rounded-2xl p-6 sm:p-7 text-white shadow-xl border border-blue-400/25">
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-cyan-300 font-semibold tracking-wide">
              <span>Pengawas Pembina: {settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'}</span>
              <span aria-hidden="true" className="text-white/40">·</span>
              <span>Model Supervisi Perkembangan Glickman</span>
              <span aria-hidden="true" className="text-white/40">·</span>
              <span className="text-blue-200">Tahun Ajaran 2026/2027</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight flex items-center gap-3">
              <Grid2X2 className="w-7 h-7 sm:w-8 h-8 text-cyan-400 shrink-0" />
              <span>Peta 4 Kuadran Guru &amp; Diferensiasi Supervisi</span>
            </h2>

            <p className="text-xs sm:text-sm text-blue-100/85 leading-relaxed font-normal">
              Memetakan tipologi guru berdasarkan matriks <strong>Tingkat Abstraksi Pedagogis (Sumbu Y)</strong> dan{' '}
              <strong>Tingkat Komitmen &amp; Dedikasi (Sumbu X)</strong>. Memberikan resep intervensi pembinaan yang tepat:
              Non-Direktif, Kolaboratif, Direktif Informatif, atau Direktif Kontrol.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 hover:from-cyan-300 hover:to-blue-300 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-cyan-500/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              onClick={() => exportQuadrantReportToWord(filteredProfiles, settings, filterSchool)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl transition-all border border-white/15 backdrop-blur-xs cursor-pointer hover:border-white/30"
              title="Unduh Laporan Format Microsoft Word (.doc)"
            >
              <Download className="w-4 h-4 text-blue-300" />
              <span>Unduh Word (.doc)</span>
            </button>

            <button
              onClick={() => setIsSignatoryModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold text-xs rounded-xl transition-all border border-amber-400/30 cursor-pointer"
              title="Atur penandatangan laporan kedinasan"
            >
              <FileSignature className="w-4 h-4 text-amber-300" />
              <span>Atur Penandatangan</span>
            </button>
          </div>
        </div>

        {/* 4 Quadrants Live Stat Cards */}
        <div className="relative z-10 pt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Kuadran 1 */}
          <div
            onClick={() => setFilterQuadrant(filterQuadrant === 'kuadran_1' ? 'all' : 'kuadran_1')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              filterQuadrant === 'kuadran_1'
                ? 'bg-emerald-500/25 border-emerald-400 ring-2 ring-emerald-400'
                : 'bg-white/6 border-white/10 hover:border-emerald-400/40'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-300 text-xs font-black">
              <span>KUADRAN I: PROFESIONAL</span>
              <Award className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{counts.q1}</span>
              <span className="text-xs text-emerald-200">
                ({counts.total > 0 ? Math.round((counts.q1 / counts.total) * 100) : 0}%)
              </span>
            </div>
            <p className="text-[10px] text-emerald-200/80 mt-1">
              Pendekatan: <strong>Non-Direktif &amp; Mentor</strong>
            </p>
          </div>

          {/* Kuadran 2 */}
          <div
            onClick={() => setFilterQuadrant(filterQuadrant === 'kuadran_2' ? 'all' : 'kuadran_2')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              filterQuadrant === 'kuadran_2'
                ? 'bg-indigo-500/25 border-indigo-400 ring-2 ring-indigo-400'
                : 'bg-white/6 border-white/10 hover:border-indigo-400/40'
            }`}
          >
            <div className="flex items-center justify-between text-indigo-300 text-xs font-black">
              <span>KUADRAN II: ANALITIS</span>
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{counts.q2}</span>
              <span className="text-xs text-indigo-200">
                ({counts.total > 0 ? Math.round((counts.q2 / counts.total) * 100) : 0}%)
              </span>
            </div>
            <p className="text-[10px] text-indigo-200/80 mt-1">
              Pendekatan: <strong>Kolaboratif &amp; Kontrak</strong>
            </p>
          </div>

          {/* Kuadran 3 */}
          <div
            onClick={() => setFilterQuadrant(filterQuadrant === 'kuadran_3' ? 'all' : 'kuadran_3')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              filterQuadrant === 'kuadran_3'
                ? 'bg-blue-500/25 border-blue-400 ring-2 ring-blue-400'
                : 'bg-white/6 border-white/10 hover:border-blue-400/40'
            }`}
          >
            <div className="flex items-center justify-between text-blue-300 text-xs font-black">
              <span>KUADRAN III: PEKERJA KERAS</span>
              <Target className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{counts.q3}</span>
              <span className="text-xs text-blue-200">
                ({counts.total > 0 ? Math.round((counts.q3 / counts.total) * 100) : 0}%)
              </span>
            </div>
            <p className="text-[10px] text-blue-200/80 mt-1">
              Pendekatan: <strong>Direktif Informatif &amp; Model</strong>
            </p>
          </div>

          {/* Kuadran 4 */}
          <div
            onClick={() => setFilterQuadrant(filterQuadrant === 'kuadran_4' ? 'all' : 'kuadran_4')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              filterQuadrant === 'kuadran_4'
                ? 'bg-amber-500/25 border-amber-400 ring-2 ring-amber-400'
                : 'bg-white/6 border-white/10 hover:border-amber-400/40'
            }`}
          >
            <div className="flex items-center justify-between text-amber-300 text-xs font-black">
              <span>KUADRAN IV: BUTUH BIMBINGAN</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{counts.q4}</span>
              <span className="text-xs text-amber-200">
                ({counts.total > 0 ? Math.round((counts.q4 / counts.total) * 100) : 0}%)
              </span>
            </div>
            <p className="text-[10px] text-amber-200/80 mt-1">
              Pendekatan: <strong>Direktif Kontrol &amp; Konseling</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Switch tab */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === 'matrix' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid2X2 className="w-3.5 h-3.5" />
            <span>Matriks Visual Koordinat</span>
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === 'table' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Tabel Tipologi &amp; Rencana Aksi ({filteredProfiles.length})</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Satuan Pendidikan:</span>
            <select
              value={filterSchool}
              onChange={(e) => setFilterSchool(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Sekolah Binaan</option>
              {distinctSchools.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Kuadran:</span>
            <select
              value={filterQuadrant}
              onChange={(e) => setFilterQuadrant(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Kuadran</option>
              <option value="kuadran_1">Kuadran I (Profesional)</option>
              <option value="kuadran_2">Kuadran II (Analitis)</option>
              <option value="kuadran_3">Kuadran III (Pekerja Keras)</option>
              <option value="kuadran_4">Kuadran IV (Butuh Bimbingan)</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari guru / mapel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 w-36 sm:w-44"
            />
          </div>
        </div>
      </div>

      {/* 3. Main Content: Visual Scatter Matrix & Inspector Panel */}
      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Canvas: 2x2 Coordinate Quadrant Chart (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Diagram Koordinat Matriks 4 Kuadran Guru
                </h3>
                <p className="text-xs text-slate-500">
                  Klik titik guru untuk memeriksa resep diferensiasi supervisi khusus
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <span className="font-bold text-slate-700">Garis Batas Midpoint:</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-bold">Skor 75.0</span>
              </div>
            </div>

            {/* The 2x2 Interactive Coordinate Space */}
            <div className="relative my-4 aspect-[4/3] sm:aspect-[16/11] w-full bg-slate-50 rounded-2xl border border-slate-300 overflow-hidden shadow-inner p-4 sm:p-6 flex flex-col justify-between select-none">
              {/* Background 4 Quarters */}
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                {/* Top-Left: Kuadran II */}
                <div className="bg-indigo-50/50 border-r border-b border-dashed border-slate-300 p-3 sm:p-4 flex flex-col justify-start">
                  <span className="text-[11px] sm:text-xs font-black text-indigo-700 uppercase tracking-wider">
                    Kuadran II: Guru Analitis / Teoretis
                  </span>
                  <span className="text-[10px] text-indigo-900/60 font-medium">
                    Abstraksi Tinggi (≥75) · Komitmen Rendah (&lt;75)
                  </span>
                </div>

                {/* Top-Right: Kuadran I */}
                <div className="bg-emerald-50/50 border-b border-dashed border-slate-300 p-3 sm:p-4 flex flex-col justify-start items-end text-right">
                  <span className="text-[11px] sm:text-xs font-black text-emerald-700 uppercase tracking-wider">
                    Kuadran I: Guru Profesional / Penggerak
                  </span>
                  <span className="text-[10px] text-emerald-900/60 font-medium">
                    Abstraksi Tinggi (≥75) · Komitmen Tinggi (≥75)
                  </span>
                </div>

                {/* Bottom-Left: Kuadran IV */}
                <div className="bg-amber-50/40 border-r border-dashed border-slate-300 p-3 sm:p-4 flex flex-col justify-end">
                  <span className="text-[11px] sm:text-xs font-black text-amber-800 uppercase tracking-wider">
                    Kuadran IV: Perlu Bimbingan Khusus
                  </span>
                  <span className="text-[10px] text-amber-900/60 font-medium">
                    Abstraksi Rendah (&lt;75) · Komitmen Rendah (&lt;75)
                  </span>
                </div>

                {/* Bottom-Right: Kuadran III */}
                <div className="bg-blue-50/50 p-3 sm:p-4 flex flex-col justify-end items-end text-right">
                  <span className="text-[11px] sm:text-xs font-black text-blue-700 uppercase tracking-wider">
                    Kuadran III: Pekerja Keras / Antusias
                  </span>
                  <span className="text-[10px] text-blue-900/60 font-medium">
                    Abstraksi Rendah (&lt;75) · Komitmen Tinggi (≥75)
                  </span>
                </div>
              </div>

              {/* Axis Labeling Watermarks */}
              <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 origin-left text-[10px] font-black tracking-widest text-slate-400 uppercase pointer-events-none">
                ▲ Sumbu Y: Tingkat Abstraksi Pedagogis (Kompetensi)
              </div>
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-black tracking-widest text-slate-400 uppercase pointer-events-none">
                Sumbu X: Tingkat Komitmen &amp; Inisiatif Belajar ►
              </div>

              {/* Plotted Teacher Avatar Nodes */}
              <div className="absolute inset-8 pointer-events-none">
                {filteredProfiles.map((prof) => {
                  const isSelected = activeProfile?.teacherId === prof.teacherId;
                  // Map scores from [50, 100] to [0%, 100%]
                  // (clamps between 5% and 95% for UI visibility)
                  const minScale = 50;
                  const maxScale = 100;
                  const xPct = Math.max(5, Math.min(95, ((prof.commitmentScore - minScale) / (maxScale - minScale)) * 100));
                  const yPct = Math.max(5, Math.min(95, 100 - ((prof.abstractionScore - minScale) / (maxScale - minScale)) * 100));

                  const def = QUADRANT_DEFINITIONS[prof.quadrant];

                  return (
                    <div
                      key={prof.teacherId}
                      style={{ left: `${xPct}%`, top: `${yPct}%` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTeacherId(prof.teacherId);
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer transition-all duration-300 z-10 ${
                        isSelected ? 'scale-125 z-30' : 'hover:scale-115'
                      }`}
                      title={`${prof.teacherName} (Abstraksi: ${prof.abstractionScore}, Komitmen: ${prof.commitmentScore})`}
                    >
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-extrabold text-xs shadow-md border-2 transition-all ${
                          prof.quadrant === 'kuadran_1'
                            ? 'bg-emerald-600 text-white border-emerald-200 shadow-emerald-600/30'
                            : prof.quadrant === 'kuadran_2'
                            ? 'bg-indigo-600 text-white border-indigo-200 shadow-indigo-600/30'
                            : prof.quadrant === 'kuadran_3'
                            ? 'bg-blue-600 text-white border-blue-200 shadow-blue-600/30'
                            : 'bg-amber-600 text-white border-amber-200 shadow-amber-600/30'
                        } ${isSelected ? 'ring-4 ring-offset-2 ring-blue-600' : ''}`}
                      >
                        {prof.teacherName.split(' ')[0][0]}
                        {prof.teacherName.split(' ')[1] ? prof.teacherName.split(' ')[1][0] : ''}
                      </div>

                      {/* Tag underneath */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded bg-slate-900/80 text-white text-[9px] font-bold whitespace-nowrap shadow-xs pointer-events-none">
                        {prof.teacherName.split(',')[0]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Legend */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold text-slate-700">Legenda Tipologi:</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" /> Kuadran I (Profesional)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" /> Kuadran II (Analitis)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Kuadran III (Pekerja Keras)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-600 inline-block" /> Kuadran IV (Bimbingan)
                </span>
              </div>

              <span className="text-[11px] text-slate-500">
                Terpetakan: <strong>{filteredProfiles.length}</strong> dari {teachers.length} guru
              </span>
            </div>
          </div>

          {/* Right Inspector Panel: Resep & Intervensi Guru (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {activeProfile ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
                {/* Header Profile */}
                <div className="pb-3 border-b border-slate-200">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        QUADRANT_DEFINITIONS[activeProfile.quadrant].badgeBg
                      } ${QUADRANT_DEFINITIONS[activeProfile.quadrant].badgeText}`}
                    >
                      {QUADRANT_DEFINITIONS[activeProfile.quadrant].title}
                    </span>

                    <button
                      onClick={() => handleOpenAdjustModal(activeProfile)}
                      className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Sesuaikan nilai diagnostik guru ini"
                    >
                      <Sliders className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="text-base font-extrabold text-slate-900 mt-1">
                    {activeProfile.teacherName}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    NIP. {activeProfile.teacherNip} · {activeProfile.mapel}
                  </p>
                  <p className="text-xs text-blue-700 font-semibold mt-0.5">
                    {activeProfile.schoolName}
                  </p>
                </div>

                {/* Score Pills */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Skor Abstraksi</span>
                    <p className="text-lg font-black text-slate-900 mt-0.5">
                      {activeProfile.abstractionScore} <span className="text-[10px] text-slate-400">/ 100</span>
                    </p>
                    <span
                      className={`text-[9px] font-bold uppercase ${
                        activeProfile.abstractionScore >= 75 ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {activeProfile.abstractionScore >= 75 ? 'Tinggi (Kuat)' : 'Rendah (Perlu Latihan)'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Skor Komitmen</span>
                    <p className="text-lg font-black text-slate-900 mt-0.5">
                      {activeProfile.commitmentScore} <span className="text-[10px] text-slate-400">/ 100</span>
                    </p>
                    <span
                      className={`text-[9px] font-bold uppercase ${
                        activeProfile.commitmentScore >= 75 ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {activeProfile.commitmentScore >= 75 ? 'Tinggi (Aktif)' : 'Rendah (Butuh Komitmen)'}
                    </span>
                  </div>
                </div>

                {/* Characteristic Narrative */}
                <div className="text-xs text-slate-700 bg-slate-50/80 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">Karakteristik Tipologi:</span>
                  <p className="leading-relaxed text-slate-600">{activeProfile.characteristics}</p>
                </div>

                {/* Supervisory Approach Prescription */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span>Rekomendasi Pendekatan Supervisi Pengawas:</span>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950 font-bold text-xs">
                    {activeProfile.supervisoryApproach}
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    <strong>Peran Pengawas:</strong> {QUADRANT_DEFINITIONS[activeProfile.quadrant].supervisorRole}
                  </p>
                </div>

                {/* Concrete Interventions */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-slate-800 block">Butir Tindakan Intervensi Pengawas:</span>
                  <div className="space-y-1.5">
                    {activeProfile.recommendedActions.map((act, i) => (
                      <div key={i} className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700 leading-snug">{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
                  {onStartSupervision && (
                    <button
                      onClick={() => onStartSupervision(activeProfile.teacherId)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Mulai Supervisi Kelas Guru Ini</span>
                    </button>
                  )}

                  {onNavigateToCoaching && (
                    <button
                      onClick={() => onNavigateToCoaching(activeProfile.teacherId)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <HeartHandshake className="w-3.5 h-3.5" />
                      <span>Buka Coaching Alur TIRTA</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                Pilih guru pada matriks koordinat untuk memeriksa resep diferensiasi supervisi.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Table View */}
      {activeTab === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Tabel Rekapitulasi Tipologi 4 Kuadran Guru Binaan
              </h3>
              <p className="text-xs text-slate-500">
                Analisis matriks dan arahan pembinaan diferensiasi per pendidik
              </p>
            </div>

            <button
              onClick={() => exportQuadrantReportToWord(filteredProfiles, settings, filterSchool)}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Word (.doc)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 font-bold text-center w-10">No</th>
                  <th className="py-3 px-3 font-bold">Nama Guru &amp; NIP</th>
                  <th className="py-3 px-3 font-bold">Mata Pelajaran</th>
                  <th className="py-3 px-3 font-bold">Satuan Pendidikan</th>
                  <th className="py-3 px-3 font-bold text-center">Skor Abstraksi</th>
                  <th className="py-3 px-3 font-bold text-center">Skor Komitmen</th>
                  <th className="py-3 px-3 font-bold">Posisi Kuadran</th>
                  <th className="py-3 px-3 font-bold">Pendekatan Supervisi</th>
                  <th className="py-3 px-3 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProfiles.map((p, idx) => {
                  const def = QUADRANT_DEFINITIONS[p.quadrant];
                  return (
                    <tr key={p.teacherId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <strong className="text-slate-900 block">{p.teacherName}</strong>
                        <span className="text-[10px] text-slate-400">NIP. {p.teacherNip}</span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">{p.mapel}</td>
                      <td className="py-3 px-3 text-slate-600">{p.schoolName}</td>
                      <td className="py-3 px-3 text-center font-bold text-slate-900">
                        {p.abstractionScore}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-900">
                        {p.commitmentScore}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${def.badgeBg} ${def.badgeText}`}>
                          {def.title.split(':')[0]}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <strong className="text-slate-800 block text-[11px]">{def.approachShort}</strong>
                        <span className="text-[10px] text-slate-500 line-clamp-1">{def.keyInterventions[0]}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleOpenAdjustModal(p)}
                          className="px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          Sesuaikan
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. MODAL: PENYESUAIAN SKOR DIAGNOSTIK KUADRAN */}
      {isAdjustModalOpen && adjustingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-300" />
                <h3 className="text-base font-bold">Penyesuaian Diagnostik Kuadran Guru</h3>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="p-6 space-y-5">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <p className="font-extrabold text-slate-900">{adjustingTeacher.teacherName}</p>
                <p className="text-slate-600">NIP. {adjustingTeacher.teacherNip} · {adjustingTeacher.mapel}</p>
                <p className="text-slate-600">{adjustingTeacher.schoolName}</p>
              </div>

              {/* Slider 1: Abstraction */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-800">
                    Sumbu Y: Tingkat Abstraksi Pedagogis (Kompetensi)
                  </label>
                  <span className="font-black text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {sliderAbstraction} / 100
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={sliderAbstraction}
                  onChange={(e) => setSliderAbstraction(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>50 (Rendah / Monoton)</span>
                  <span className="font-bold text-slate-600">Batas 75</span>
                  <span>100 (Tinggi / Inovatif)</span>
                </div>
              </div>

              {/* Slider 2: Commitment */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-800">
                    Sumbu X: Tingkat Komitmen &amp; Dedikasi Kerja
                  </label>
                  <span className="font-black text-sm text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {sliderCommitment} / 100
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={sliderCommitment}
                  onChange={(e) => setSliderCommitment(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>50 (Rendah / Pasif)</span>
                  <span className="font-bold text-slate-600">Batas 75</span>
                  <span>100 (Tinggi / Proaktif)</span>
                </div>
              </div>

              {/* Result Preview */}
              <div className="p-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-blue-200 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                  Hasil Posisi Kuadran Baru:
                </span>
                <span className="font-extrabold text-blue-900 text-sm">
                  {sliderAbstraction >= 75 && sliderCommitment >= 75
                    ? 'Kuadran I: Guru Profesional / Penggerak (Non-Direktif)'
                    : sliderAbstraction >= 75 && sliderCommitment < 75
                    ? 'Kuadran II: Guru Analitis / Kritikus (Kolaboratif)'
                    : sliderAbstraction < 75 && sliderCommitment >= 75
                    ? 'Kuadran III: Guru Pekerja Keras Antusias (Direktif Informatif)'
                    : 'Kuadran IV: Guru Perlu Bimbingan Khusus (Direktif Kontrol)'}
                </span>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Pengawas Mengenai Guru Ini
                </label>
                <textarea
                  rows={2}
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="Catatan latar belakang, potensi kepemimpinan, atau hambatan..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer"
                >
                  Simpan Diagnostik
                </button>
              </div>
            </form>
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
          showToast('Penandatangan Disimpan', 'Identitas penandatangan laporan telah diperbarui.', 'success');
        }}
        onPrintAfterSave={handlePrint}
      />

      {/* 7. HIDDEN PRINT CONTAINER: LAPORAN RESMI KEDINASAN MATRIKS 4 KUADRAN */}
      <div className="hidden">
        <div
          id="teacher-quadrant-print-area"
          ref={printAreaRef}
          className="p-8 text-black bg-white"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          {/* Kop Surat Dinas */}
          <div style={{ textAlign: 'center', borderBottom: '3px double #000', paddingBottom: '10px', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '13pt', textTransform: 'uppercase', fontWeight: 'bold' }}>
              PEMERINTAH DAERAH PROVINSI / KABUPATEN / KOTA
            </h3>
            <h2 style={{ margin: '3px 0', fontSize: '15pt', textTransform: 'uppercase', fontWeight: 'bold' }}>
              DINAS PENDIDIKAN DAN KEBUDAYAAN
            </h2>
            <p style={{ margin: '2px 0', fontSize: '10.5pt', fontWeight: 'bold' }}>
              KANTOR PENGAWAS SEKOLAH PEMBINA SATUAN PENDIDIKAN
            </p>
            <p style={{ margin: '2px 0', fontSize: '9pt', color: '#333' }}>
              {settings.schoolAddress || 'Kompleks Pendidikan Terpadu'} | Telepon / Pos-el Resmi Kedinasan
            </p>
          </div>

          {/* Judul Dokumen */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '13pt', textDecoration: 'underline', textTransform: 'uppercase', fontWeight: 'bold' }}>
              MATRIKS PEMETAAN TIPOLOGI 4 KUADRAN GURU &amp; STRATEGI DIFERENSIASI SUPERVISI
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '10.5pt', fontStyle: 'italic' }}>
              Model Supervisi Perkembangan Glickman · Wilayah Binaan: {filterSchool === 'all' ? 'Seluruh Sekolah Binaan' : filterSchool} · Tahun Ajaran 2026/2027
            </p>
          </div>

          {/* Identitas Pengawas */}
          <table style={{ width: '100%', marginBottom: '12px', fontSize: '10pt', border: 'none', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ width: '18%', border: 'none', padding: '3px 0' }}><strong>Nama Pengawas</strong></td>
                <td style={{ width: '2%', border: 'none', padding: '3px 0' }}>:</td>
                <td style={{ width: '40%', border: 'none', padding: '3px 0' }}>{settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'}</td>
                <td style={{ width: '18%', border: 'none', padding: '3px 0' }}><strong>Total Guru Binaan</strong></td>
                <td style={{ width: '2%', border: 'none', padding: '3px 0' }}>:</td>
                <td style={{ width: '20%', border: 'none', padding: '3px 0' }}>{filteredProfiles.length} Guru</td>
              </tr>
              <tr>
                <td style={{ border: 'none', padding: '3px 0' }}><strong>NIP Pengawas</strong></td>
                <td style={{ border: 'none', padding: '3px 0' }}>:</td>
                <td style={{ border: 'none', padding: '3px 0' }}>{settings.supervisorNip || '19820415 200801 1 007'}</td>
                <td style={{ border: 'none', padding: '3px 0' }}><strong>Distribusi Kuadran</strong></td>
                <td style={{ border: 'none', padding: '3px 0' }}>:</td>
                <td style={{ border: 'none', padding: '3px 0' }}>Q1: {counts.q1} | Q2: {counts.q2} | Q3: {counts.q3} | Q4: {counts.q4}</td>
              </tr>
            </tbody>
          </table>

          {/* Tabel Matriks */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt', marginBottom: '24px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={{ border: '1px solid #000', padding: '6px', width: '4%', textAlign: 'center' }}>No</th>
                <th style={{ border: '1px solid #000', padding: '6px', width: '18%', textAlign: 'left' }}>Nama Guru &amp; NIP</th>
                <th style={{ border: '1px solid #000', padding: '6px', width: '12%', textAlign: 'left' }}>Mata Pelajaran</th>
                <th style={{ border: '1px solid #000', padding: '6px', width: '16%', textAlign: 'left' }}>Satuan Pendidikan</th>
                <th style={{ border: '1px solid #000', padding: '6px', width: '7%', textAlign: 'center' }}>Abstraksi</th>
                <th style={{ border: '1px solid #000', padding: '6px', width: '7%', textAlign: 'center' }}>Komitmen</th>
                <th style={{ border: '1px solid #000', padding: '6px', width: '16%', textAlign: 'left' }}>Posisi Kuadran</th>
                <th style={{ border: '1px solid #000', padding: '6px', width: '20%', textAlign: 'left' }}>Pendekatan Supervisi</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.map((item, idx) => {
                const def = QUADRANT_DEFINITIONS[item.quadrant];
                return (
                  <tr key={item.teacherId}>
                    <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ border: '1px solid #000', padding: '5px' }}>
                      <strong>{item.teacherName}</strong><br />
                      <span style={{ fontSize: '8pt', color: '#444' }}>NIP. {item.teacherNip}</span>
                    </td>
                    <td style={{ border: '1px solid #000', padding: '5px' }}>{item.mapel}</td>
                    <td style={{ border: '1px solid #000', padding: '5px' }}>{item.schoolName}</td>
                    <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center', fontWeight: 'bold' }}>
                      {item.abstractionScore}
                    </td>
                    <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center', fontWeight: 'bold' }}>
                      {item.commitmentScore}
                    </td>
                    <td style={{ border: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>
                      {def.title.split(':')[0]}<br />
                      <span style={{ fontSize: '8pt', fontWeight: 'normal', color: '#444' }}>{def.nameIndo}</span>
                    </td>
                    <td style={{ border: '1px solid #000', padding: '5px', fontSize: '8.5pt' }}>
                      <strong>{def.approachShort}</strong><br />
                      {def.keyInterventions[0]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Kolom Tanda Tangan */}
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
                  <span>NIP. {settings.supervisorNip || '19820415 200801 1 007'}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
