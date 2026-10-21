/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  Users,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  TrendingUp,
  FileText,
  Printer,
  Plus,
  BookOpenCheck,
  KeyRound,
  Compass,
  CalendarDays,
  Calendar,
  Building,
  PlayCircle,
  HeartHandshake,
  Grid2X2
} from 'lucide-react';
import { SupervisionRecord, Teacher, VISIT_TYPE_LABELS } from '../types/inspiro';
import { getVisitAgendas, getCoachingRecords } from '../utils/storage';
import { computeTeacherQuadrants } from '../utils/quadrantUtils';

interface DashboardProps {
  teachers: Teacher[];
  supervisions: SupervisionRecord[];
  onStartSupervision: (teacherId?: string) => void;
  onViewResult: (supervisionId: string) => void;
  onPrintReport: (supervisionId: string) => void;
  onNavigateToTeachers: () => void;
  onNavigateToReports: () => void;
  onNavigateToPM?: () => void;
  onNavigateToQualityMap?: () => void;
  onNavigateToGrowthTracker?: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToCoaching?: () => void;
  onNavigateToQuadrant?: () => void;
  onOpenManagePrincipals?: () => void;
  isSupervisor?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  teachers,
  supervisions,
  onStartSupervision,
  onViewResult,
  onPrintReport,
  onNavigateToTeachers,
  onNavigateToReports,
  onNavigateToPM,
  onNavigateToQualityMap,
  onNavigateToGrowthTracker,
  onNavigateToCalendar,
  onNavigateToCoaching,
  onNavigateToQuadrant,
  onOpenManagePrincipals,
  isSupervisor
}) => {
  // Calculations
  const totalSupervisi = supervisions.length;
  const totalGuru = teachers.length;
  const completedSupervisions = supervisions.filter((s) => s.status === 'selesai');
  const draftSupervisions = supervisions.filter((s) => s.status === 'draft');
  const completedCount = completedSupervisions.length;
  const needFollowUpCount = draftSupervisions.length;

  const averageScore =
    completedCount > 0
      ? Number((completedSupervisions.reduce((acc, s) => acc + s.finalScore, 0) / completedCount).toFixed(1))
      : 0;

  // Category counts
  const categoryCounts = {
    amatBaik: completedSupervisions.filter((s) => s.category === 'Amat Baik (SB)').length,
    baik: completedSupervisions.filter((s) => s.category === 'Baik (B)').length,
    cukup: completedSupervisions.filter((s) => s.category === 'Cukup (C)').length,
    kurang: completedSupervisions.filter((s) => s.category === 'Kurang (K)').length
  };

  // Stage averages
  let sumPendahuluan = 0;
  let sumInti = 0;
  let sumPenutup = 0;

  completedSupervisions.forEach((s) => {
    let p = 0;
    let i = 0;
    let c = 0;
    for (let k = 1; k <= 3; k++) p += s.scores[k] || 0;
    for (let k = 4; k <= 9; k++) i += s.scores[k] || 0;
    for (let k = 10; k <= 12; k++) c += s.scores[k] || 0;

    sumPendahuluan += (p / 12) * 100;
    sumInti += (i / 24) * 100;
    sumPenutup += (c / 12) * 100;
  });

  const avgPendahuluan = completedCount > 0 ? Math.round(sumPendahuluan / completedCount) : 0;
  const avgInti = completedCount > 0 ? Math.round(sumInti / completedCount) : 0;
  const avgPenutup = completedCount > 0 ? Math.round(sumPenutup / completedCount) : 0;

  // Recent 5 supervisions
  const recentSupervisions = [...supervisions].slice(0, 5);

  // Upcoming School Visit Agendas
  const visitAgendas = useMemo(() => getVisitAgendas(), []);
  const todayStr = '2026-10-21';
  const upcomingVisits = useMemo(() => {
    return visitAgendas
      .filter((a) => a.date >= todayStr || a.status === 'berlangsung')
      .slice(0, 3);
  }, [visitAgendas]);

  // 4 Quadrants Summary (Model Carl Glickman)
  const quadrantProfiles = useMemo(() => {
    const coaching = getCoachingRecords();
    return computeTeacherQuadrants(teachers, supervisions, coaching);
  }, [teachers, supervisions]);

  const qCounts = useMemo(() => {
    return {
      q1: quadrantProfiles.filter((p) => p.quadrant === 'kuadran_1').length,
      q2: quadrantProfiles.filter((p) => p.quadrant === 'kuadran_2').length,
      q3: quadrantProfiles.filter((p) => p.quadrant === 'kuadran_3').length,
      q4: quadrantProfiles.filter((p) => p.quadrant === 'kuadran_4').length,
      total: quadrantProfiles.length
    };
  }, [quadrantProfiles]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Executive Presence & Responsive Feature Hub */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0a1638] via-[#0f214d] to-[#0d1b3f] rounded-2xl p-6 sm:p-7 text-white shadow-xl border border-blue-400/20">
        {/* Ambient subtle lighting */}
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Section: Branding, Unboxed Kicker, and Primary Action */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-2 max-w-2xl">
            {/* Clean unboxed metadata (zero-pill discipline) */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-cyan-300 font-semibold tracking-wide">
              <span>Siklus Supervisi Akademik</span>
              <span aria-hidden="true" className="text-white/40">·</span>
              <span>Kurikulum Merdeka 12 Indikator</span>
              <span aria-hidden="true" className="text-white/40">·</span>
              <span className="text-blue-200">Tahun Ajaran 2026/2027</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Selamat Datang di INSPIRO
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/85 leading-relaxed font-normal">
              Platform pendataan dan penilaian observasi kelas berbasis instrumen resmi Kurikulum Merdeka.
              Didesain untuk proses supervisi klinis yang cepat, terukur, dan siap cetak dokumen dinas.
            </p>
          </div>

          {/* Primary Action Buttons (Clear focal anchor) */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onStartSupervision()}
              className="flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 hover:from-cyan-300 hover:to-blue-300 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span>Mulai Observasi Baru</span>
            </button>
            <button
              onClick={onNavigateToTeachers}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl transition-all border border-white/15 backdrop-blur-xs cursor-pointer hover:border-white/30"
            >
              <Users className="w-4 h-4 text-cyan-300" />
              <span>Kelola Guru</span>
            </button>
          </div>
        </div>

        {/* Bottom Section: Quick-Access Feature Tiles (Grid 2 cols on mobile, 4 cols on desktop) */}
        <div className="relative z-10 pt-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider">
              Akses Cepat Modul Supervisi &amp; Evaluasi Mutu
            </span>
            <span className="text-[11px] text-blue-300/70 hidden sm:inline">
              Klik modul untuk navigasi instan
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
            {/* Tile 1: Kalender & Agenda Kunjungan */}
            <button
              onClick={onNavigateToCalendar}
              className="group text-left p-3.5 rounded-xl bg-white/6 hover:bg-white/12 border border-white/10 hover:border-cyan-400/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/30 group-hover:scale-105 transition-transform">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors">
                  Kalender &amp; Agenda
                </p>
                <p className="text-[11px] text-cyan-200/70 mt-0.5 line-clamp-1">
                  Jadwal kunjungan
                </p>
              </div>
            </button>

            {/* Tile 2: Jurnal Coaching Alur TIRTA */}
            <button
              onClick={onNavigateToCoaching}
              className="group text-left p-3.5 rounded-xl bg-white/6 hover:bg-white/12 border border-white/10 hover:border-rose-400/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center border border-rose-400/30 group-hover:scale-105 transition-transform">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-rose-300 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-rose-200 transition-colors">
                  Coaching TIRTA
                </p>
                <p className="text-[11px] text-rose-200/70 mt-0.5 line-clamp-1">
                  Refleksi klinis guru
                </p>
              </div>
            </button>

            {/* Tile 3: 4 Kuadran Guru (Matriks Glickman) */}
            <button
              onClick={onNavigateToQuadrant}
              className="group text-left p-3.5 rounded-xl bg-white/6 hover:bg-white/12 border border-white/10 hover:border-purple-400/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-400/30 group-hover:scale-105 transition-transform">
                  <Grid2X2 className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-purple-200 transition-colors">
                  4 Kuadran Guru
                </p>
                <p className="text-[11px] text-purple-200/70 mt-0.5 line-clamp-1">
                  Matriks Glickman
                </p>
              </div>
            </button>

            {/* Tile 4: Peta Mutu Binaan */}
            <button
              onClick={onNavigateToQualityMap}
              className="group text-left p-3.5 rounded-xl bg-white/6 hover:bg-white/12 border border-white/10 hover:border-blue-400/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-400/30 group-hover:scale-105 transition-transform">
                  <Compass className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-blue-200 transition-colors">
                  Peta Mutu Binaan
                </p>
                <p className="text-[11px] text-blue-200/70 mt-0.5 line-clamp-1">
                  Radar komparasi antar-sekolah
                </p>
              </div>
            </button>

            {/* Tile 3: Growth Tracker Siklus */}
            <button
              onClick={onNavigateToGrowthTracker}
              className="group text-left p-3.5 rounded-xl bg-white/6 hover:bg-white/12 border border-white/10 hover:border-emerald-400/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-emerald-200 transition-colors">
                  Growth Tracker Siklus
                </p>
                <p className="text-[11px] text-emerald-200/70 mt-0.5 line-clamp-1">
                  Lompatan nilai Siklus I vs II
                </p>
              </div>
            </button>

            {/* Tile 4: Pengelolaan PM */}
            <button
              onClick={onNavigateToPM}
              className="group text-left p-3.5 rounded-xl bg-white/6 hover:bg-white/12 border border-white/10 hover:border-teal-400/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-400/30 group-hover:scale-105 transition-transform">
                  <BookOpenCheck className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-teal-300 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-teal-200 transition-colors">
                  Pengelolaan PM
                </p>
                <p className="text-[11px] text-teal-200/70 mt-0.5 line-clamp-1">
                  Evaluasi praktik pedagogis
                </p>
              </div>
            </button>

            {/* Tile 5: Akun Kepsek Binaan atau Laporan Resmi */}
            {isSupervisor && onOpenManagePrincipals ? (
              <button
                onClick={onOpenManagePrincipals}
                className="group text-left p-3.5 rounded-xl bg-white/6 hover:bg-white/12 border border-white/10 hover:border-amber-400/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30 group-hover:scale-105 transition-transform">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-amber-200 transition-colors">
                    Akun Kepsek Binaan
                  </p>
                  <p className="text-[11px] text-amber-200/70 mt-0.5 line-clamp-1">
                    Kelola akses kepala sekolah
                  </p>
                </div>
              </button>
            ) : (
              <button
                onClick={onNavigateToReports}
                className="group text-left p-3.5 rounded-xl bg-white/6 hover:bg-white/12 border border-white/10 hover:border-blue-400/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-400/30 group-hover:scale-105 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-blue-200 transition-colors">
                    Laporan Supervisi
                  </p>
                  <p className="text-[11px] text-blue-200/70 mt-0.5 line-clamp-1">
                    Arsip &amp; cetak resmi dinas
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid with Distinct Colorful Personalities */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Total Supervisi */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 hover:border-blue-300 shadow-xs hover:shadow-md hover:shadow-blue-500/5 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Supervisi</span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ClipboardCheck className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {totalSupervisi}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-semibold">kegiatan</span>
          </div>
          <div className="mt-2 text-[11px] text-blue-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>{completedCount} tuntas terlaksana</span>
          </div>
        </div>

        {/* Card 2: Total Guru */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-md hover:shadow-indigo-500/5 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Guru</span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {totalGuru}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-semibold">pendidik</span>
          </div>
          <div className="mt-2 text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            <span>Terdaftar di sistem</span>
          </div>
        </div>

        {/* Card 3: Selesai */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-xs hover:shadow-md hover:shadow-emerald-500/5 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Supervisi Selesai</span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tabular-nums">
              {completedCount}
            </span>
            <span className="text-xs text-emerald-600 ml-1.5 font-semibold">laporan</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Siap cetak dokumen</span>
          </div>
        </div>

        {/* Card 4: Perlu Tindak Lanjut / Draft */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 hover:border-amber-300 shadow-xs hover:shadow-md hover:shadow-amber-500/5 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Perlu Tindak Lanjut</span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 tabular-nums">
              {needFollowUpCount}
            </span>
            <span className="text-xs text-amber-600 ml-1.5 font-semibold">draft/RTL</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Butuh penyelesaian</span>
          </div>
        </div>

        {/* Card 5: Rata-Rata Nilai */}
        <div className="col-span-2 lg:col-span-1 bg-white p-4.5 rounded-2xl border border-slate-200/90 hover:border-purple-300 shadow-xs hover:shadow-md hover:shadow-purple-500/5 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Rata-Rata Nilai</span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <Award className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-700 tabular-nums">
              {averageScore}
            </span>
            <span className="text-xs text-slate-400 font-semibold">/ 100</span>
          </div>
          <div className="mt-2 text-[11px] text-purple-700 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
            <span>Kategori: {averageScore >= 91 ? 'Amat Baik (SB)' : averageScore >= 81 ? 'Baik (B)' : averageScore >= 71 ? 'Cukup (C)' : 'Kurang (K)'}</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart: Distribusi Kategori Hasil (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Distribusi Kategori Hasil</h3>
                <p className="text-xs text-slate-500">Berdasarkan skor akhir supervisi selesai</p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                {completedCount} Guru
              </span>
            </div>

            <div className="mt-4 space-y-3.5">
              {/* Amat Baik */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-xs shadow-emerald-500/50"></span>
                    Amat Baik (SB) <span className="text-slate-400 font-normal">91–100</span>
                  </span>
                  <span className="font-extrabold text-slate-800 tabular-nums">
                    {categoryCounts.amatBaik} ({completedCount > 0 ? Math.round((categoryCounts.amatBaik / completedCount) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 shadow-xs shadow-emerald-500/30"
                    style={{
                      width: `${completedCount > 0 ? (categoryCounts.amatBaik / completedCount) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Baik */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-blue-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow-xs shadow-blue-500/50"></span>
                    Baik (B) <span className="text-slate-400 font-normal">81–90</span>
                  </span>
                  <span className="font-extrabold text-slate-800 tabular-nums">
                    {categoryCounts.baik} ({completedCount > 0 ? Math.round((categoryCounts.baik / completedCount) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-full transition-all duration-300 shadow-xs shadow-blue-500/30"
                    style={{
                      width: `${completedCount > 0 ? (categoryCounts.baik / completedCount) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Cukup */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-amber-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-xs shadow-amber-500/50"></span>
                    Cukup (C) <span className="text-slate-400 font-normal">71–80</span>
                  </span>
                  <span className="font-extrabold text-slate-800 tabular-nums">
                    {categoryCounts.cukup} ({completedCount > 0 ? Math.round((categoryCounts.cukup / completedCount) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-300 shadow-xs shadow-amber-500/30"
                    style={{
                      width: `${completedCount > 0 ? (categoryCounts.cukup / completedCount) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Kurang */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-rose-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-xs shadow-rose-500/50"></span>
                    Kurang (K) <span className="text-slate-400 font-normal">≤ 70</span>
                  </span>
                  <span className="font-extrabold text-slate-800 tabular-nums">
                    {categoryCounts.kurang} ({completedCount > 0 ? Math.round((categoryCounts.kurang / completedCount) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-300 shadow-xs shadow-rose-500/30"
                    style={{
                      width: `${completedCount > 0 ? (categoryCounts.kurang / completedCount) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 text-[11px] text-blue-900 leading-relaxed font-medium">
            Standar Kurikulum Merdeka menargetkan pencapaian minimal kategori <strong className="text-blue-950 font-bold">Baik (B)</strong> pada seluruh guru binaan.
          </div>
        </div>

        {/* Right Chart: Capaian Berdasarkan Tahapan Pembelajaran (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Capaian Berdasarkan Tahapan Pembelajaran</h3>
                <p className="text-xs text-slate-500">Persentase capaian per bagian observasi (12 Indikator)</p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                Target 100%
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Aspek 1: Pendahuluan */}
              <div className="p-4 rounded-xl border border-blue-200/70 bg-gradient-to-b from-blue-50/60 to-white flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-extrabold text-blue-700">
                    A. Pendahuluan
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 font-medium">Indikator 1 – 3</div>
                  <div className="mt-3 text-2xl font-black text-slate-900 tabular-nums">
                    {avgPendahuluan}%
                  </div>
                </div>
                <div className="mt-3">
                  <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"
                      style={{ width: `${avgPendahuluan}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5 leading-tight">
                    Pengondisian, asesmen awal & penyampaian TP
                  </p>
                </div>
              </div>

              {/* Aspek 2: Kegiatan Inti */}
              <div className="p-4 rounded-xl border border-indigo-200/70 bg-gradient-to-b from-indigo-50/60 to-white flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-extrabold text-indigo-700">
                    B. Kegiatan Inti
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 font-medium">Indikator 4 – 9</div>
                  <div className="mt-3 text-2xl font-black text-indigo-900 tabular-nums">
                    {avgInti}%
                  </div>
                </div>
                <div className="mt-3">
                  <div className="h-2 w-full bg-indigo-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full"
                      style={{ width: `${avgInti}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5 leading-tight">
                    Diferensiasi, HOTS, IT, Disiplin Positif & KSE
                  </p>
                </div>
              </div>

              {/* Aspek 3: Penutup */}
              <div className="p-4 rounded-xl border border-emerald-200/70 bg-gradient-to-b from-emerald-50/60 to-white flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-700">
                    C. Penutup
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 font-medium">Indikator 10 – 12</div>
                  <div className="mt-3 text-2xl font-black text-emerald-900 tabular-nums">
                    {avgPenutup}%
                  </div>
                </div>
                <div className="mt-3">
                  <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full"
                      style={{ width: `${avgPenutup}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5 leading-tight">
                    Refleksi, asesmen formatif & tindak lanjut
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Instrumen: Supervisi Pembelajaran Kurikulum Merdeka</span>
            <span className="font-semibold text-blue-600">Skala 1 – 4 (Maks. 48)</span>
          </div>
        </div>
      </div>

      {/* Agenda Kunjungan & Kalender Supervisi Mendatang (Live Pulse) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50/60 via-slate-50 to-indigo-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <CalendarDays className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Agenda Kunjungan &amp; Supervisi Sekolah Mendatang
              </h3>
              <p className="text-xs text-slate-500">
                Jadwal observasi kelas, bimbingan manajerial, dan pendampingan sekolah binaan
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToCalendar}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Buka Kalender Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {upcomingVisits.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            Semua agenda kunjungan telah terlaksana. Buka Kalender untuk menambahkan agenda baru.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {upcomingVisits.map((item) => {
              const typeCfg = VISIT_TYPE_LABELS[item.visitType] || VISIT_TYPE_LABELS.supervisi_akademik;
              const isToday = item.date === todayStr;
              const firstTeacherId = item.targetTeacherIds && item.targetTeacherIds.length > 0 ? item.targetTeacherIds[0] : undefined;

              return (
                <div
                  key={item.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors ${
                    isToday ? 'bg-amber-50/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                        isToday
                          ? 'bg-amber-500 text-white border-amber-600 font-bold'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}
                    >
                      <span className="text-[9px] uppercase font-bold">
                        {new Date(item.date).toLocaleDateString('id-ID', { month: 'short' })}
                      </span>
                      <span className="text-base font-black leading-none">
                        {new Date(item.date).getDate()}
                      </span>
                      <span className="text-[8px] font-medium">
                        {isToday ? 'HARI INI' : new Date(item.date).toLocaleDateString('id-ID', { weekday: 'short' })}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${typeCfg.bg} ${typeCfg.color}`}>
                          {typeCfg.shortLabel}
                        </span>
                        {isToday && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Hari Ini
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-900">{item.title}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <Building className="w-3.5 h-3.5 text-blue-600" />
                          {item.schoolName}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          {item.startTime || '08:00'} - {item.endTime || '12:00'} WIB
                        </span>
                        {item.targetTeacherNames && item.targetTeacherNames.length > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-indigo-700 font-medium">
                              Sasaran: {item.targetTeacherNames.join(', ')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {item.visitType === 'supervisi_akademik' && (
                      <button
                        onClick={() => onStartSupervision(firstTeacherId)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Mulai Observasi</span>
                      </button>
                    )}
                    <button
                      onClick={onNavigateToCalendar}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Detail
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Peta Tipologi 4 Kuadran Guru (Matriks Supervisi Perkembangan Glickman) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200">
              <Grid2X2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Distribusi 4 Kuadran Guru &amp; Diferensiasi Pembinaan</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  Model Carl Glickman
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Pemetaan tipologi {qCounts.total} guru binaan berdasarkan Abstraksi Pedagogis dan Komitmen
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToQuadrant}
            className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>Buka Matriks Kuadran Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card Kuadran 1 */}
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                  Kuadran I
                </span>
                <span className="text-lg font-black text-emerald-700">{qCounts.q1} Guru</span>
              </div>
              <h4 className="text-xs font-bold text-emerald-950">Profesional Mandiri</h4>
              <p className="text-[11px] text-emerald-800/80 mt-1">
                Abstraksi Tinggi · Komitmen Tinggi
              </p>
              <div className="mt-2 text-[10px] bg-white/80 p-2 rounded-lg border border-emerald-200/60 text-emerald-900 font-medium leading-relaxed">
                <strong>Pendekatan:</strong> Non-Direktif &amp; Pendelegasian (Master / Mentor)
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-700">
              <span>Rasio: {qCounts.total > 0 ? Math.round((qCounts.q1 / qCounts.total) * 100) : 0}%</span>
              <span className="font-semibold cursor-pointer hover:underline" onClick={onNavigateToQuadrant}>Detail →</span>
            </div>
          </div>

          {/* Card Kuadran 2 */}
          <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-100/80 px-2 py-0.5 rounded">
                  Kuadran II
                </span>
                <span className="text-lg font-black text-indigo-700">{qCounts.q2} Guru</span>
              </div>
              <h4 className="text-xs font-bold text-indigo-950">Analitis / Kritikus</h4>
              <p className="text-[11px] text-indigo-800/80 mt-1">
                Abstraksi Tinggi · Komitmen Rendah
              </p>
              <div className="mt-2 text-[10px] bg-white/80 p-2 rounded-lg border border-indigo-200/60 text-indigo-900 font-medium leading-relaxed">
                <strong>Pendekatan:</strong> Kolaboratif &amp; Coaching Alur TIRTA
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-indigo-200/60 flex items-center justify-between text-[11px] text-indigo-700">
              <span>Rasio: {qCounts.total > 0 ? Math.round((qCounts.q2 / qCounts.total) * 100) : 0}%</span>
              <span className="font-semibold cursor-pointer hover:underline" onClick={onNavigateToQuadrant}>Detail →</span>
            </div>
          </div>

          {/* Card Kuadran 3 */}
          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded">
                  Kuadran III
                </span>
                <span className="text-lg font-black text-blue-700">{qCounts.q3} Guru</span>
              </div>
              <h4 className="text-xs font-bold text-blue-950">Pekerja Keras Antusias</h4>
              <p className="text-[11px] text-blue-800/80 mt-1">
                Abstraksi Rendah · Komitmen Tinggi
              </p>
              <div className="mt-2 text-[10px] bg-white/80 p-2 rounded-lg border border-blue-200/60 text-blue-900 font-medium leading-relaxed">
                <strong>Pendekatan:</strong> Direktif Informatif, Modeling &amp; Peer-Tutoring
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px] text-blue-700">
              <span>Rasio: {qCounts.total > 0 ? Math.round((qCounts.q3 / qCounts.total) * 100) : 0}%</span>
              <span className="font-semibold cursor-pointer hover:underline" onClick={onNavigateToQuadrant}>Detail →</span>
            </div>
          </div>

          {/* Card Kuadran 4 */}
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
                  Kuadran IV
                </span>
                <span className="text-lg font-black text-amber-700">{qCounts.q4} Guru</span>
              </div>
              <h4 className="text-xs font-bold text-amber-950">Butuh Bimbingan Intensif</h4>
              <p className="text-[11px] text-amber-800/80 mt-1">
                Abstraksi Rendah · Komitmen Rendah
              </p>
              <div className="mt-2 text-[10px] bg-white/80 p-2 rounded-lg border border-amber-200/60 text-amber-900 font-medium leading-relaxed">
                <strong>Pendekatan:</strong> Direktif Kontrol, Standar Ketat &amp; Konseling
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-amber-700">
              <span>Rasio: {qCounts.total > 0 ? Math.round((qCounts.q4 / qCounts.total) * 100) : 0}%</span>
              <span className="font-semibold cursor-pointer hover:underline" onClick={onNavigateToQuadrant}>Detail →</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Supervisions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Supervisi Akademik Terbaru
            </h3>
            <p className="text-xs text-slate-500">
              Riwayat pelaksanaan observasi kelas terkini
            </p>
          </div>
          <button
            onClick={onNavigateToReports}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Lihat Semua ({totalSupervisi})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentSupervisions.length === 0 ? (
          <div className="p-8 text-center">
            <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Belum Ada Riwayat Supervisi</p>
            <p className="text-xs text-slate-500 mt-1">Mulai observasi pertama untuk melihat data di sini.</p>
            <button
              onClick={() => onStartSupervision()}
              className="mt-4 px-3.5 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Mulai Supervisi
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Nama Guru</th>
                  <th className="py-3 px-4 font-semibold">Mata Pelajaran</th>
                  <th className="py-3 px-4 font-semibold">Tanggal</th>
                  <th className="py-3 px-4 font-semibold">Nilai Akhir</th>
                  <th className="py-3 px-4 font-semibold">Kategori</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSupervisions.map((item) => {
                  const isCompleted = item.status === 'selesai';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{item.identity.namaGuru}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          NIP: {item.identity.nipGuru || '-'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <div>{item.identity.mapel}</div>
                        <div className="text-[11px] text-slate-400">{item.identity.kelasSemester}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {item.identity.hariTanggal || new Date(item.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 tabular-nums">
                        {isCompleted ? (
                          <span className="text-sm text-blue-700">{item.finalScore}</span>
                        ) : (
                          <span className="text-slate-400 font-normal">Draft</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isCompleted ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                              item.category === 'Amat Baik (SB)'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.category === 'Baik (B)'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : item.category === 'Cukup (C)'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {item.category}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCompleted ? 'bg-emerald-600' : 'bg-amber-600'
                            }`}
                          />
                          {isCompleted ? 'Selesai' : 'Perlu Tindak'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isCompleted ? (
                            <>
                              <button
                                onClick={() => onViewResult(item.id)}
                                className="px-2 py-1 text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                                title="Lihat Hasil & Analisis"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Hasil</span>
                              </button>
                              <button
                                onClick={() => onPrintReport(item.id)}
                                className="px-2 py-1 text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                                title="Cetak Dokumen Resmi"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Cetak</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => onStartSupervision(item.teacherId)}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-medium transition-colors cursor-pointer"
                            >
                              Lanjutkan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
