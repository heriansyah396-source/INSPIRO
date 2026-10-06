/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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
  BookOpenCheck
} from 'lucide-react';
import { SupervisionRecord, Teacher } from '../types/inspiro';

interface DashboardProps {
  teachers: Teacher[];
  supervisions: SupervisionRecord[];
  onStartSupervision: (teacherId?: string) => void;
  onViewResult: (supervisionId: string) => void;
  onPrintReport: (supervisionId: string) => void;
  onNavigateToTeachers: () => void;
  onNavigateToReports: () => void;
  onNavigateToPM?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  teachers,
  supervisions,
  onStartSupervision,
  onViewResult,
  onPrintReport,
  onNavigateToTeachers,
  onNavigateToReports,
  onNavigateToPM
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

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Rich Educational Gradient & Ambient Lighting */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0c1c4f] via-[#1a2b6d] to-[#162356] rounded-2xl p-6 sm:p-7 text-white shadow-xl border border-blue-400/20 flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Ambient decorative lighting */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 left-1/3 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 max-w-xl z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-400/20 text-cyan-200 border border-cyan-400/30">
              Siklus Supervisi Akademik
            </span>
            <span className="text-xs text-blue-200 font-medium">Tahun Ajaran 2026/2027</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Selamat Datang di INSPIRO
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal">
            Platform pendataan dan penilaian observasi kelas berbasis 12 indikator Kurikulum Merdeka.
            Didesain untuk proses supervisi yang cepat, terukur, dan siap cetak dokumen dinas.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0 z-10">
          <button
            onClick={() => onStartSupervision()}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
            <span>Mulai Observasi Baru</span>
          </button>
          <button
            onClick={onNavigateToTeachers}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-all border border-white/20 backdrop-blur-xs cursor-pointer"
          >
            <Users className="w-4 h-4 text-cyan-300" />
            <span>Kelola Guru</span>
          </button>
          {onNavigateToPM && (
            <button
              onClick={onNavigateToPM}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <BookOpenCheck className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>Pengelolaan PM</span>
            </button>
          )}
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
