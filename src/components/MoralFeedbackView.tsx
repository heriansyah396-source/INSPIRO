/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  HeartHandshake,
  Sparkles,
  Printer,
  FileDown,
  Search,
  CheckCircle2,
  MessageSquareHeart,
  NotebookPen,
  MonitorSmartphone,
  Share2,
  Trash2,
  Edit3,
  ShieldCheck,
  Lock,
  X
} from 'lucide-react';
import {
  AppSettings,
  MORAL_CATEGORY_LABELS,
  MORAL_SOURCE_LABELS,
  MoralAISynthesis,
  MoralFeedbackCategory,
  MoralFeedbackRecord,
  MoralFeedbackSource,
  MoralFeedbackStatus,
  Principal
} from '../types/inspiro';
import { DEFAULT_SIDRAP_LOGO, DEFAULT_TUTWURI_LOGO } from '../data/defaultLogos';
import { UserRoleProfile } from '../services/firebase';
import { generateMoralReflectionSynthesis } from '../services/aiMoralReflectionGenerator';
import { exportMoralFeedbackToWord } from '../utils/storage';
import { MoralDoorMode, PublicMoralFeedbackModal } from './PublicMoralFeedbackModal';

interface MoralFeedbackViewProps {
  records: MoralFeedbackRecord[];
  principals: Principal[];
  settings: AppSettings;
  currentUser: UserRoleProfile | null;
  onSaveRecord: (record: MoralFeedbackRecord) => void;
  onDeleteRecord: (id: string) => void;
  showToast: (
    title: string,
    description?: string,
    type?: 'success' | 'warning' | 'error' | 'info'
  ) => void;
}

export const MoralFeedbackView: React.FC<MoralFeedbackViewProps> = ({
  records,
  principals,
  settings,
  currentUser,
  onSaveRecord,
  onDeleteRecord,
  showToast
}) => {
  const isSupervisor = currentUser?.role !== 'kepala_sekolah';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [doorModalOpen, setDoorModalOpen] = useState(false);
  const [doorMode, setDoorMode] = useState<MoralDoorMode>(
    isSupervisor ? 'catatan_lapangan' : 'kepsek'
  );

  const [aiSynthesis, setAiSynthesis] = useState<MoralAISynthesis | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [reflectModalRecord, setReflectModalRecord] = useState<MoralFeedbackRecord | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [commitmentText, setCommitmentText] = useState('');
  const [reflectionStatus, setReflectionStatus] = useState<MoralFeedbackStatus>('direfleksikan');

  // Strict privacy filter: Kepala Sekolah may ONLY view non-anonymous messages from their own school
  // or messages they submitted via Pintu 2. Anonymous teacher submissions are strictly Pengawas-only.
  const roleScopedRecords = useMemo(() => {
    if (isSupervisor) return records;
    const mySchool = (currentUser?.schoolName || '').toLowerCase();
    return records.filter((r) => {
      if (r.isAnonymous) return false;
      if (r.sourceChannel === 'mandiri_guru') return false;
      if (!mySchool) return r.sourceChannel === 'mandiri_kepsek';
      return r.schoolName.toLowerCase() === mySchool;
    });
  }, [records, isSupervisor, currentUser]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return roleScopedRecords
      .filter((r) => {
        if (filterCategory !== 'all' && r.category !== filterCategory) return false;
        if (filterSource !== 'all' && r.sourceChannel !== filterSource) return false;
        if (filterStatus !== 'all' && r.status !== filterStatus) return false;
        if (q) {
          const hay = `${r.schoolName} ${r.message} ${r.senderName} ${r.specificMoment || ''} ${
            r.supervisorReflection || ''
          }`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [roleScopedRecords, filterCategory, filterSource, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    const total = roleScopedRecords.length;
    const newlyArrived = roleScopedRecords.filter((r) => r.status === 'baru').length;
    const reflectedOrFollowed = roleScopedRecords.filter(
      (r) => r.status === 'direfleksikan' || r.status === 'tindak_lanjut'
    ).length;

    const avg = (fn: (r: MoralFeedbackRecord) => number) =>
      total > 0 ? roleScopedRecords.reduce((acc, r) => acc + fn(r), 0) / total : 0;

    return {
      total,
      newlyArrived,
      reflectedOrFollowed,
      avgOverall: avg((r) => r.averageScore),
      menenangkan: avg((r) => r.barometer.menenangkan),
      mendengarkan: avg((r) => r.barometer.mendengarkan),
      solutif: avg((r) => r.barometer.solutif),
      memuliakan: avg((r) => r.barometer.memuliakan)
    };
  }, [roleScopedRecords]);

  const handleOpenDoor = (mode: MoralDoorMode) => {
    setDoorMode(mode);
    setDoorModalOpen(true);
  };

  const isDevPreviewHost =
    typeof window !== 'undefined' && window.location.origin.includes('://ais-dev-');

  const handleCopyShareLink = async () => {
    const rawOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const publicOrigin = rawOrigin.replace('://ais-dev-', '://ais-pre-');
    const shareUrl = `${publicOrigin}/?pintu=suara-hati`;
    const shareText = `Bapak/Ibu Guru & Pendidik yang terhormat,\nSilakan titipkan suara hati, nasihat moral, atau kesan psikologis terkait pendampingan supervisi secara aman (tanpa login & bisa Anonim) melalui portal INSPIRO:\n${shareUrl}`;
    try {
      await navigator.clipboard.writeText(shareText);
      showToast(
        isDevPreviewHost ? 'Tautan Disalin (Perlu Share App Dulu)' : 'Tautan Publik Guru Disalin',
        isDevPreviewHost
          ? 'Agar link ais-pre tidak 404 saat dibuka guru di HP, klik tombol Share / Bagikan di pojok kanan atas AI Studio terlebih dahulu untuk menerbitkan versi publik.'
          : 'Tautan tanpa login telah disalin. Silakan tempel ke grup WhatsApp Sekolah.',
        isDevPreviewHost ? 'warning' : 'success'
      );
    } catch {
      showToast(
        'Siap Dibagikan',
        `Bagikan tautan ${shareUrl} kepada guru setelah aplikasi di-Share di AI Studio.`,
        'info'
      );
    }
  };

  const handleGenerateAISynthesis = async () => {
    if (roleScopedRecords.length === 0) {
      showToast('Data Kosong', 'Belum ada pesan moral untuk dirangkum AI.', 'warning');
      return;
    }
    setIsGeneratingAI(true);
    try {
      const result = await generateMoralReflectionSynthesis(
        roleScopedRecords,
        settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'
      );
      setAiSynthesis(result);
      showToast(
        'Cermin Refleksi AI Selesai',
        'Sintesis hikmah, titik buta, dan komitmen perbaikan sikap telah tersusun.',
        'success'
      );
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleOpenReflectModal = (rec: MoralFeedbackRecord) => {
    setReflectModalRecord(rec);
    setReflectionText(rec.supervisorReflection || '');
    setCommitmentText(rec.supervisorCommitment || '');
    setReflectionStatus(rec.status === 'baru' ? 'direfleksikan' : rec.status);
  };

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectModalRecord) return;
    const now = new Date().toISOString();
    onSaveRecord({
      ...reflectModalRecord,
      supervisorReflection: reflectionText.trim(),
      supervisorCommitment: commitmentText.trim(),
      reflectedAt: now,
      status: reflectionStatus,
      updatedAt: now
    });
    setReflectModalRecord(null);
    showToast(
      'Refleksi Hati Disimpan',
      'Hikmah dan komitmen penyesuaian sikap kunjungan berikutnya berhasil dicatat.',
      'success'
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = () => {
    exportMoralFeedbackToWord(filteredRecords, settings, aiSynthesis);
    showToast(
      'Dokumen Word Diunduh',
      'Jurnal Refleksi 360° & Pesan Moral Pengawas (.doc) berhasil dibuat.',
      'success'
    );
  };

  const logoLeft = settings.logoUrl || DEFAULT_SIDRAP_LOGO;
  const logoRight = settings.logoRightUrl || DEFAULT_TUTWURI_LOGO;
  const agency = settings.governmentAgency || 'PEMERINTAH KABUPATEN SIDENRENG RAPPANG';
  const schoolCity = settings.schoolCity || 'Kabupaten Sidenreng Rappang';
  const supervisorName = settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd';
  const supervisorNip = settings.supervisorNip || '19830819 201001 1 002';
  const supervisorRole = settings.supervisorRole || 'Pengawas Sekolah Pembina';
  const supervisorRank = settings.supervisorRank || 'Penata Tk. I / III.d';
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* SCREEN UI (HIDDEN ON PRINT) */}
      <div className="space-y-6 print:hidden">
        {/* Header & Multi-Door Action Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MessageSquareHeart className="w-5 h-5 text-teal-700" />
                <h2 className="text-lg font-extrabold text-slate-900">
                  Refleksi 360° &amp; Pesan Moral Pengawas
                </h2>
              </div>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                {isSupervisor
                  ? 'Skema 2 Pintu Mandiri (Guru Tanpa Login & Kepala Sekolah Terautentikasi) + Arsip Catatan Lapangan untuk menjaga kerendahan hati dan kualitas kehadiran psikologis pengawas.'
                  : 'Saluran resmi Kepala Sekolah untuk menitipkan pesan moral, kesan suasana pendampingan, dan harapan bagi Pengawas Pembina sekolah Anda.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isSupervisor ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleOpenDoor('public_guru')}
                    className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <MonitorSmartphone className="w-3.5 h-3.5" />
                    <span>Mode Kiosk Guru</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className="px-3.5 py-2 rounded-xl border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Salin Tautan WA Guru</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDoor('catatan_lapangan')}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <NotebookPen className="w-3.5 h-3.5 text-slate-600" />
                    <span>+ Catatan Lapangan</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenDoor('kepsek')}
                  className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Kirim Pesan Moral ke Pengawas</span>
                </button>
              )}

              {isSupervisor && (
                <button
                  type="button"
                  onClick={handleGenerateAISynthesis}
                  disabled={isGeneratingAI}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isGeneratingAI ? 'Merangkum...' : 'Cermin Refleksi AI'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleExportWord}
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-700" />
                <span>Word (.doc)</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Printer className="w-3.5 h-3.5 text-slate-700" />
                <span>Cetak / PDF</span>
              </button>
            </div>
          </div>

          {!isSupervisor && (
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-2.5 text-xs text-blue-950">
              <Lock className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <strong>Privasi Terjaga:</strong> Portal Kepala Sekolah hanya menampilkan pesan terbuka dari sekolah Anda serta komitmen tindak lanjut Pengawas. Pesan anonim guru dilindungi penuh agar guru bebas bersuara jujur.
              </div>
            </div>
          )}
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Total Suara Hati
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
              {stats.total}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Pesan &amp; catatan moral masuk
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Indeks Barometer Sikap
            </div>
            <div className="text-2xl font-extrabold text-teal-700 mt-1 tabular-nums">
              {stats.avgOverall.toFixed(2)}{' '}
              <span className="text-xs font-bold text-slate-400">/ 5.00</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Rerata 4 dimensi kehadiran
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Menanti Refleksi Pengawas
            </div>
            <div className="text-2xl font-extrabold text-amber-700 mt-1 tabular-nums">
              {stats.newlyArrived}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Pesan berstatus Baru
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Komitmen Terwujud
            </div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1 tabular-nums">
              {stats.reflectedOrFollowed}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Sudah direfleksikan pengawas
            </div>
          </div>
        </div>

        {/* 4-Dimension Barometer Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Barometer Kehadiran &amp; Etika Pendampingan Pengawas
              </h3>
              <p className="text-xs text-slate-500">
                Mengukur rasa aman psikologis, kesediaan mendengar, kebermanfaatan solusi, dan pemuliaan pendidik.
              </p>
            </div>
            <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Menenangkan & Aman Psikologis', val: stats.menenangkan, color: 'bg-teal-600' },
              { label: 'Mau Mendengarkan Sebelum Menilai', val: stats.mendengarkan, color: 'bg-blue-600' },
              { label: 'Solutif Tanpa Menambah Beban Administrasi', val: stats.solutif, color: 'bg-indigo-600' },
              { label: 'Memuliakan Profesi & Martabat Pendidik', val: stats.memuliakan, color: 'bg-emerald-600' }
            ].map((dim) => {
              const pct = Math.min(100, Math.max(0, (dim.val / 5) * 100));
              return (
                <div key={dim.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">{dim.label}</span>
                    <span className="font-extrabold text-slate-900 tabular-nums">
                      {dim.val.toFixed(2)} / 5.00
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-md overflow-hidden">
                    <div
                      className={`h-full ${dim.color} rounded-md transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Reflection Synthesis Panel */}
        {aiSynthesis && (
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    Cermin Refleksi AI Pengawas Pembina
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Sintesis kualitatif suara hati pendidik · Terakhir disusun{' '}
                    {new Date(aiSynthesis.generatedAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiSynthesis(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed bg-white/5 border border-white/10 rounded-xl p-3.5">
              {aiSynthesis.overallTone}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
              <div className="bg-emerald-950/50 border border-emerald-800/60 rounded-xl p-3.5 space-y-2">
                <div className="font-extrabold text-emerald-300">Hal Baik yang Patut Dijaga</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-200 leading-relaxed">
                  {aiSynthesis.keyStrengthsToKeep.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-950/50 border border-amber-800/60 rounded-xl p-3.5 space-y-2">
                <div className="font-extrabold text-amber-300">Titik Buta (Blind Spot)</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-200 leading-relaxed">
                  {aiSynthesis.blindSpotsToWatch.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-sky-950/50 border border-sky-800/60 rounded-xl p-3.5 space-y-2">
                <div className="font-extrabold text-sky-300">Komitmen Kunjungan Berikutnya</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-200 leading-relaxed">
                  {aiSynthesis.personalCommitments.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-xs italic text-amber-200/90 border-t border-white/10 pt-3">
              "{aiSynthesis.closingReflection}"
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pesan moral, nama sekolah, momen kunjungan, atau refleksi..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold"
          >
            <option value="all">Semua Kategori</option>
            {(Object.keys(MORAL_CATEGORY_LABELS) as MoralFeedbackCategory[]).map((k) => (
              <option key={k} value={k}>
                {MORAL_CATEGORY_LABELS[k].shortLabel}
              </option>
            ))}
          </select>

          {isSupervisor && (
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold"
            >
              <option value="all">Semua Pintu Masuk</option>
              {(Object.keys(MORAL_SOURCE_LABELS) as MoralFeedbackSource[]).map((k) => (
                <option key={k} value={k}>
                  {MORAL_SOURCE_LABELS[k].shortLabel}
                </option>
              ))}
            </select>
          )}

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold"
          >
            <option value="all">Semua Status</option>
            <option value="baru">Baru (Belum Direfleksikan)</option>
            <option value="direfleksikan">Sudah Direfleksikan</option>
            <option value="tindak_lanjut">Sudah Tindak Lanjut</option>
          </select>
        </div>

        {/* Records List */}
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
            <HeartHandshake className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-700">
              Belum ada pesan moral sesuai filter saat ini
            </div>
            <p className="text-xs text-slate-500">
              {isSupervisor
                ? 'Bagikan tautan Mode Kiosk Guru ke sekolah binaan atau tambahkan catatan lapangan.'
                : 'Klik tombol "Kirim Pesan Moral ke Pengawas" untuk menuliskan pesan pertama Anda.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredRecords.map((rec) => {
              const catInfo = MORAL_CATEGORY_LABELS[rec.category];
              const srcInfo = MORAL_SOURCE_LABELS[rec.sourceChannel];

              return (
                <div
                  key={rec.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3.5"
                >
                  {/* Top Metadata & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${catInfo.badgeColor}`}
                        >
                          {catInfo.label}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${srcInfo.badgeColor}`}
                        >
                          {srcInfo.shortLabel}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                            rec.status === 'tindak_lanjut'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : rec.status === 'direfleksikan'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {rec.status === 'tindak_lanjut'
                            ? 'Sudah Tindak Lanjut'
                            : rec.status === 'direfleksikan'
                            ? 'Sudah Direfleksikan'
                            : 'Menunggu Refleksi'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 font-medium flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="font-bold text-slate-900">
                          {rec.isAnonymous ? `Anonim (${rec.senderRole})` : rec.senderName}
                        </span>
                        {rec.senderSubjectOrTitle && (
                          <>
                            <span>·</span>
                            <span>{rec.senderSubjectOrTitle}</span>
                          </>
                        )}
                        <span>·</span>
                        <span>{rec.schoolName}</span>
                        <span>·</span>
                        <span className="tabular-nums">{rec.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-800 tabular-nums">
                        Barometer: {rec.averageScore.toFixed(2)} / 5
                      </div>
                      {isSupervisor && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenReflectModal(rec)}
                            className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>
                              {rec.supervisorReflection ? 'Edit Refleksi' : 'Tulis Refleksi'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteRecord(rec.id)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-700 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus pesan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 space-y-1.5">
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                      "{rec.message}"
                    </p>
                    {rec.specificMoment && (
                      <div className="text-[11px] text-slate-500">
                        <span className="font-semibold">Momen terkait:</span> {rec.specificMoment}
                      </div>
                    )}
                  </div>

                  {/* Barometer Breakdown Mini Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-600">Menenangkan</span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {rec.barometer.menenangkan}/5
                      </span>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-600">Mendengarkan</span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {rec.barometer.mendengarkan}/5
                      </span>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-600">Solutif</span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {rec.barometer.solutif}/5
                      </span>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-600">Memuliakan</span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {rec.barometer.memuliakan}/5
                      </span>
                    </div>
                  </div>

                  {/* Supervisor Reflection & Commitment Box */}
                  {(rec.supervisorReflection || rec.supervisorCommitment) && (
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-1.5 text-xs">
                      <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Ruang Refleksi Hati &amp; Komitmen Pengawas Pembina</span>
                      </div>
                      {rec.supervisorReflection && (
                        <p className="text-slate-800 leading-relaxed">
                          <strong className="text-emerald-900">Hikmah yang Dipetik:</strong>{' '}
                          {rec.supervisorReflection}
                        </p>
                      )}
                      {rec.supervisorCommitment && (
                        <p className="text-emerald-950 leading-relaxed">
                          <strong className="text-emerald-900">
                            Komitmen Penyesuaian Sikap:
                          </strong>{' '}
                          {rec.supervisorCommitment}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PRINTABLE OFFICIAL DOCUMENT (VISIBLE ONLY ON PRINT) */}
      <div id="printable-moral-feedback-doc" className="hidden print:block text-black bg-white">
        {/* KOP SURAT DINAS DUAL LOGO */}
        <table className="w-full border-collapse border-b-[3px] border-double border-black pb-2 mb-4">
          <tbody>
            <tr>
              <td className="w-20 text-center align-middle pr-2 border-none">
                <img
                  src={logoLeft}
                  alt="Logo Kabupaten Sidrap"
                  className="w-16 h-16 object-contain mx-auto"
                />
              </td>
              <td className="text-center align-middle border-none">
                <div className="text-[11pt] font-bold uppercase leading-tight">{agency}</div>
                <div className="text-[13pt] font-bold uppercase leading-tight">
                  DINAS PENDIDIKAN DAN KEBUDAYAAN
                </div>
                <div className="text-[10pt] font-bold uppercase leading-tight">
                  PENGAWAS SEKOLAH PEMBINA KABUPATEN SIDENRENG RAPPANG
                </div>
                <div className="text-[8.5pt] italic mt-0.5">
                  Kompleks SKPD Jl. Harapan Baru No. 1, Pangkajene, Kab. Sidenreng Rappang, Sulawesi Selatan
                </div>
              </td>
              <td className="w-20 text-center align-middle pl-2 border-none">
                <img
                  src={logoRight}
                  alt="Logo Tut Wuri Handayani"
                  className="w-16 h-16 object-contain mx-auto"
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div className="text-center mb-4">
          <h2 className="text-[12.5pt] font-bold uppercase underline">
            JURNAL REFLEKSI 360° &amp; PESAN MORAL PENGAWAS SEKOLAH
          </h2>
          <p className="text-[9pt] font-semibold mt-0.5">
            INSTRUMEN PENGENDALIAN KUALITAS LAYANAN PENDAMPINGAN &amp; KESELAMATAN PSIKOLOGIS
          </p>
        </div>

        <table className="w-full text-[9.5pt] mb-3 border-collapse">
          <tbody>
            <tr>
              <td className="w-44 font-bold py-0.5">Pengawas Sekolah Pembina</td>
              <td className="w-3">:</td>
              <td>{supervisorName}</td>
              <td className="w-32 font-bold py-0.5">Tanggal Cetak</td>
              <td className="w-3">:</td>
              <td>{todayStr}</td>
            </tr>
            <tr>
              <td className="font-bold py-0.5">NIP / Pangkat Golongan</td>
              <td>:</td>
              <td>
                {supervisorNip} ({supervisorRank})
              </td>
              <td className="font-bold py-0.5">Jumlah Pesan</td>
              <td>:</td>
              <td>{filteredRecords.length} Rekaman Suara Hati</td>
            </tr>
          </tbody>
        </table>

        {/* Barometer Summary Table */}
        <table className="w-full border border-slate-700 border-collapse text-[9pt] mb-4">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-700 p-1.5 text-center">Menenangkan &amp; Aman</th>
              <th className="border border-slate-700 p-1.5 text-center">Mau Mendengarkan</th>
              <th className="border border-slate-700 p-1.5 text-center">Solutif Tanpa Beban</th>
              <th className="border border-slate-700 p-1.5 text-center">Memuliakan Pendidik</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-700 p-1.5 text-center font-bold">
                {stats.menenangkan.toFixed(2)} / 5.00
              </td>
              <td className="border border-slate-700 p-1.5 text-center font-bold">
                {stats.mendengarkan.toFixed(2)} / 5.00
              </td>
              <td className="border border-slate-700 p-1.5 text-center font-bold">
                {stats.solutif.toFixed(2)} / 5.00
              </td>
              <td className="border border-slate-700 p-1.5 text-center font-bold">
                {stats.memuliakan.toFixed(2)} / 5.00
              </td>
            </tr>
          </tbody>
        </table>

        {/* Main Records Table */}
        <table className="w-full border border-slate-700 border-collapse text-[8.5pt] mb-5">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-700 p-1.5 w-8 text-center">No</th>
              <th className="border border-slate-700 p-1.5 w-36 text-left">Tanggal &amp; Sekolah</th>
              <th className="border border-slate-700 p-1.5 w-36 text-left">Pengirim &amp; Kategori</th>
              <th className="border border-slate-700 p-1.5 text-left">Pesan Moral Pendidik</th>
              <th className="border border-slate-700 p-1.5 w-52 text-left">
                Refleksi &amp; Komitmen Pengawas
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((r, i) => (
              <tr key={r.id}>
                <td className="border border-slate-700 p-1.5 text-center">{i + 1}</td>
                <td className="border border-slate-700 p-1.5">
                  <div className="font-bold">{r.date}</div>
                  <div>{r.schoolName}</div>
                  <div className="text-[8pt]">
                    {MORAL_SOURCE_LABELS[r.sourceChannel]?.shortLabel}
                  </div>
                </td>
                <td className="border border-slate-700 p-1.5">
                  <div className="font-bold">
                    {r.isAnonymous ? `Anonim (${r.senderRole})` : r.senderName}
                  </div>
                  <div>{MORAL_CATEGORY_LABELS[r.category]?.shortLabel}</div>
                  <div>Skor: {r.averageScore.toFixed(2)}/5</div>
                </td>
                <td className="border border-slate-700 p-1.5">
                  <div>"{r.message}"</div>
                  {r.specificMoment && (
                    <div className="italic text-[8pt] mt-0.5">Momen: {r.specificMoment}</div>
                  )}
                </td>
                <td className="border border-slate-700 p-1.5">
                  {r.supervisorReflection && (
                    <div className="mb-1">
                      <strong>Hikmah:</strong> {r.supervisorReflection}
                    </div>
                  )}
                  {r.supervisorCommitment && (
                    <div>
                      <strong>Komitmen:</strong> {r.supervisorCommitment}
                    </div>
                  )}
                  {!r.supervisorReflection && !r.supervisorCommitment && (
                    <div className="italic">Menunggu refleksi pengawas</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* CLEAN 80PX WHITESPACE SIGNATURE BLOCK */}
        <div className="print-avoid-break mt-6 flex justify-end">
          <div className="w-72 text-center text-[9.5pt]">
            <div>
              {schoolCity}, {todayStr}
            </div>
            <div className="font-bold">{supervisorRole}</div>
            <div style={{ height: '80px', minHeight: '80px' }}>&nbsp;</div>
            <div className="font-bold underline">{supervisorName}</div>
            <div>NIP. {supervisorNip}</div>
            <div className="text-[8.5pt]">Pangkat/Gol: {supervisorRank}</div>
          </div>
        </div>
      </div>

      {/* Multi-Door Modal (Kiosk Guru / Kepsek / Catatan Lapangan) */}
      <PublicMoralFeedbackModal
        isOpen={doorModalOpen}
        onClose={() => setDoorModalOpen(false)}
        mode={doorMode}
        principals={principals}
        settings={settings}
        defaultSchoolName={currentUser?.schoolName}
        defaultSenderName={currentUser?.name}
        onSubmit={(rec) => {
          onSaveRecord(rec);
        }}
      />

      {/* Supervisor Reflection & Commitment Editor Modal */}
      {reflectModalRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">
                  Ruang Refleksi Hati &amp; Komitmen Pengawas
                </h3>
                <p className="text-[11px] text-slate-300">
                  {reflectModalRecord.schoolName} · {reflectModalRecord.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReflectModalRecord(null)}
                className="p-1 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReflection} className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 italic leading-relaxed">
                "{reflectModalRecord.message}"
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hikmah / Pelajaran Moral yang Saya Petik
                </label>
                <textarea
                  rows={3}
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder="Tuliskan perenungan jujur Anda membaca suara hati pendidik ini..."
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Komitmen Penyesuaian Sikap Kunjungan Berikutnya
                </label>
                <textarea
                  rows={3}
                  value={commitmentText}
                  onChange={(e) => setCommitmentText(e.target.value)}
                  placeholder="Langkah nyata perubahan cara bicara, waktu mendengar, atau adab mendampingi pada kunjungan berikutnya..."
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Refleksi
                </label>
                <select
                  value={reflectionStatus}
                  onChange={(e) => setReflectionStatus(e.target.value as MoralFeedbackStatus)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold"
                >
                  <option value="direfleksikan">Sudah Direfleksikan</option>
                  <option value="tindak_lanjut">Sudah Tindak Lanjut di Lapangan</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setReflectModalRecord(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold cursor-pointer"
                >
                  Simpan Refleksi &amp; Komitmen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
