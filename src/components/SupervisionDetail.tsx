/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  Printer,
  Edit2,
  ArrowLeft,
  Award,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  FileCheck2,
  Calendar,
  Layers,
  School,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { SupervisionRecord } from '../types/inspiro';
import { analyzeSupervision } from '../utils/storage';

interface SupervisionDetailProps {
  supervision: SupervisionRecord;
  onBack: () => void;
  onEdit: () => void;
  onPrint: () => void;
}

export const SupervisionDetail: React.FC<SupervisionDetailProps> = ({
  supervision,
  onBack,
  onEdit,
  onPrint
}) => {
  const analysis = useMemo(() => analyzeSupervision(supervision), [supervision]);

  const { identity, totalScore, finalScore, category } = supervision;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top action navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Laporan</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Ubah / Lengkapi Data</span>
          </button>
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Resmi / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 bg-linear-to-r from-slate-900 to-blue-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30">
                {identity.siklus || 'Siklus I'}
              </span>
              <span className="text-xs text-blue-200">
                {identity.satuanPendidikan}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Hasil Supervisi Akademik Pembelajaran
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <span className="font-semibold text-white">{identity.namaGuru}</span>
              <span>·</span>
              <span>Mapel: {identity.mapel}</span>
              <span>·</span>
              <span>Kelas: {identity.kelasSemester}</span>
              <span>·</span>
              <span>Tanggal: {identity.hariTanggal}</span>
            </div>
          </div>

          {/* Big Score Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-white/20 text-center shrink-0 min-w-[200px]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
              Nilai Akhir Observasi
            </div>
            <div className="text-4xl sm:text-5xl font-extrabold text-white my-1 tabular-nums">
              {finalScore}
            </div>
            <div className="text-xs text-slate-200 font-mono">
              Skor: {totalScore} / 48 (100%)
            </div>
            <div className="mt-2.5">
              <span
                className={`inline-block px-3 py-1 rounded text-xs font-bold ${
                  category === 'Amat Baik (SB)'
                    ? 'bg-emerald-500 text-white'
                    : category === 'Baik (B)'
                    ? 'bg-blue-500 text-white'
                    : category === 'Cukup (C)'
                    ? 'bg-amber-500 text-white'
                    : 'bg-rose-500 text-white'
                }`}
              >
                Kategori: {category}
              </span>
            </div>
          </div>
        </div>

        {/* Identity Details Row */}
        <div className="p-4 sm:p-5 bg-slate-50/70 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">NIP Guru:</span>
            <span className="font-semibold text-slate-800 font-mono">{identity.nipGuru || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Supervisor:</span>
            <span className="font-semibold text-slate-800">{identity.namaSupervisor}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Materi Pokok:</span>
            <span className="font-semibold text-slate-800 truncate block">{identity.materiPokok || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Fokus Perilaku:</span>
            <span className="font-semibold text-slate-800 truncate block">{identity.fokusPerilaku || '-'}</span>
          </div>
        </div>
      </div>

      {/* Visual Stage Breakdown Progress Bars */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Capaian Berdasarkan Tahapan Pembelajaran</span>
            </h3>
            <p className="text-xs text-slate-500">
              Evaluasi ketercapaian 12 indikator dalam 3 tahapan pembelajaran Kurikulum Merdeka
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            Skala 1–4
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pendahuluan */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  A. Pendahuluan
                </span>
                <p className="text-[11px] text-slate-500">Indikator 1 – 3 (Maks. 12)</p>
              </div>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {analysis.breakdown.pendahuluan.percentage}%
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${analysis.breakdown.pendahuluan.percentage}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-600 flex justify-between">
              <span>Skor Diperoleh:</span>
              <span className="font-bold">{analysis.breakdown.pendahuluan.total} / 12</span>
            </div>
          </div>

          {/* Inti */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  B. Kegiatan Inti
                </span>
                <p className="text-[11px] text-blue-700/70">Indikator 4 – 9 (Maks. 24)</p>
              </div>
              <span className="text-lg font-bold text-blue-900 tabular-nums">
                {analysis.breakdown.inti.percentage}%
              </span>
            </div>
            <div className="h-2.5 w-full bg-blue-200 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${analysis.breakdown.inti.percentage}%` }}
              />
            </div>
            <div className="text-[11px] text-blue-800 flex justify-between">
              <span>Skor Diperoleh:</span>
              <span className="font-bold">{analysis.breakdown.inti.total} / 24</span>
            </div>
          </div>

          {/* Penutup */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  C. Kegiatan Penutup
                </span>
                <p className="text-[11px] text-slate-500">Indikator 10 – 12 (Maks. 12)</p>
              </div>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {analysis.breakdown.penutup.percentage}%
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-emerald-600 rounded-full"
                style={{ width: `${analysis.breakdown.penutup.percentage}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-600 flex justify-between">
              <span>Skor Diperoleh:</span>
              <span className="font-bold">{analysis.breakdown.penutup.total} / 12</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rule-Based Analysis Cards: Kelebihan, Area Ditingkatkan, Rekomendasi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Kelebihan / Kekuatan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-emerald-800 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Kelebihan & Praktik Baik Guru</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Aspek dengan penguasaan tinggi (Skor 4 / Sangat Baik):
            </p>

            <div className="mt-3 space-y-2.5">
              {analysis.strengths.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Belum ada indikator dengan predikat maksimal.</p>
              ) : (
                analysis.strengths.slice(0, 4).map((str) => (
                  <div key={str.id} className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs">
                    <div className="flex items-center justify-between font-bold text-emerald-900">
                      <span>{str.title}</span>
                      <span className="text-[10px] bg-emerald-200/80 text-emerald-800 px-1.5 py-0.5 rounded">
                        Skor {str.score}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800/90 mt-1 leading-relaxed">
                      {str.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="pt-2 text-[10px] text-slate-400">
            Dianjurkan diimbaskan ke komunitas praktisi sekolah.
          </div>
        </div>

        {/* 2. Area yang Perlu Ditingkatkan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-amber-800 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Area yang Perlu Ditingkatkan</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Aspek yang membutuhkan pendampingan & penguatan:
            </p>

            <div className="mt-3 space-y-2.5">
              {analysis.growthAreas.length === 0 ? (
                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500">
                  Seluruh indikator telah mencapai batas optimal.
                </div>
              ) : (
                analysis.growthAreas.slice(0, 4).map((grow) => (
                  <div key={grow.id} className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/60 text-xs">
                    <div className="flex items-center justify-between font-bold text-amber-900">
                      <span>{grow.title}</span>
                      <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded">
                        Skor {grow.score}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800/90 mt-1 leading-relaxed">
                      {grow.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="pt-2 text-[10px] text-slate-400">
            Fokus utama pembinaan pada Rencana Tindak Lanjut.
          </div>
        </div>

        {/* 3. Rekomendasi Pedagogis */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-blue-900 font-bold text-sm">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <span>Rekomendasi Supervisor</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Arahan tindak lanjut berbasis aturan Kurikulum Merdeka:
            </p>

            <div className="mt-3 space-y-2.5">
              {analysis.recommendations.map((rec, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-xs">
                  <div className="font-bold text-blue-950 mb-0.5">{rec.category}</div>
                  <p className="text-[11px] text-blue-900 leading-relaxed">{rec.action}</p>
                  <div className="text-[10px] text-blue-600/80 mt-1 italic">
                    Sumber: {rec.reference}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-2 text-[10px] text-slate-400">
            Disepakati pada sesi pembinaan pasca-observasi.
          </div>
        </div>
      </div>

      {/* RTL Table in Detail view */}
      {supervision.rtl.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              Dokumentasi Rencana Tindak Lanjut (RTL) yang Disepakati
            </h3>
            <p className="text-xs text-slate-500">
              Tanggung jawab implementasi guru untuk siklus pembelajaran mendatang
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold w-12 text-center">No</th>
                  <th className="py-2.5 px-4 font-semibold w-1/4">Fokus Aspek Perbaikan</th>
                  <th className="py-2.5 px-4 font-semibold w-1/3">Rencana Kegiatan Nyata</th>
                  <th className="py-2.5 px-4 font-semibold">Target Waktu</th>
                  <th className="py-2.5 px-4 font-semibold">Kriteria Keberhasilan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {supervision.rtl.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 text-center font-bold text-slate-400">{index + 1}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{item.fokusAspek}</td>
                    <td className="py-3 px-4 text-slate-600 leading-relaxed">{item.rencanaKegiatan}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">{item.waktuTarget}</td>
                    <td className="py-3 px-4 text-slate-600 leading-relaxed">{item.kriteriaKeberhasilan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
