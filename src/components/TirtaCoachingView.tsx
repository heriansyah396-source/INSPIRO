/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Printer,
  Download,
  Edit2,
  Trash2,
  User,
  Building,
  Calendar,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  FileSignature,
  X,
  Target,
  Compass,
  Zap,
  BookmarkCheck,
  Check,
  Layers,
  HeartHandshake,
  Lightbulb,
  ShieldCheck
} from 'lucide-react';
import {
  TirtaCoachingRecord,
  CoachingContext,
  CoachingCommitmentStatus,
  COACHING_CONTEXT_LABELS,
  Teacher,
  SupervisionRecord,
  AppSettings
} from '../types/inspiro';
import {
  getCoachingRecords,
  saveCoachingRecord,
  deleteCoachingRecord
} from '../utils/storage';
import { exportCoachingJournalToWord } from '../utils/coachingExport';
import { printDocumentElement } from '../utils/documentExport';
import { SignatoryModal } from './SignatoryModal';

interface TirtaCoachingViewProps {
  teachers: Teacher[];
  supervisions: SupervisionRecord[];
  settings: AppSettings;
  onUpdateSettings?: (newSettings: AppSettings) => void;
  showToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

export const TirtaCoachingView: React.FC<TirtaCoachingViewProps> = ({
  teachers,
  supervisions,
  settings,
  onUpdateSettings,
  showToast
}) => {
  // State
  const [coachingRecords, setCoachingRecords] = useState<TirtaCoachingRecord[]>(() =>
    getCoachingRecords()
  );
  const [selectedRecordId, setSelectedRecordId] = useState<string>(() => {
    const records = getCoachingRecords();
    return records[0]?.id || '';
  });

  // Filters
  const [filterTeacherId, setFilterTeacherId] = useState<string>('all');
  const [filterContext, setFilterContext] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals
  const [isEditorModalOpen, setIsEditorModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<TirtaCoachingRecord | null>(null);
  const [isSignatoryModalOpen, setIsSignatoryModalOpen] = useState<boolean>(false);

  // Editor Form State
  const [formTeacherId, setFormTeacherId] = useState<string>('');
  const [formDate, setFormDate] = useState<string>('2026-10-21');
  const [formTime, setFormTime] = useState<string>('09:00');
  const [formContext, setFormContext] = useState<CoachingContext>('pasca_observasi');
  const [formSupervisionId, setFormSupervisionId] = useState<string>('');

  // T: Tujuan
  const [formTopik, setFormTopik] = useState<string>('');
  const [formTujuanAkhir, setFormTujuanAkhir] = useState<string>('');
  const [formUkuranKeberhasilan, setFormUkuranKeberhasilan] = useState<string>('');

  // I: Identifikasi
  const [formPotensi, setFormPotensi] = useState<string>('');
  const [formTantangan, setFormTantangan] = useState<string>('');
  const [formAkarMasalah, setFormAkarMasalah] = useState<string>('');
  const [formPeluang, setFormPeluang] = useState<string>('');

  // R: Rencana Aksi
  const [formStrategiUtama, setFormStrategiUtama] = useState<string>('');
  const [formLangkahList, setFormLangkahList] = useState<string[]>(['']);
  const [formLiniMasa, setFormLiniMasa] = useState<string>('');
  const [formDukungan, setFormDukungan] = useState<string>('');

  // TA: Tanggung Jawab
  const [formKomitmen, setFormKomitmen] = useState<string>('');
  const [formPihakMembantu, setFormPihakMembantu] = useState<string>('');
  const [formJadwalTindakLanjut, setFormJadwalTindakLanjut] = useState<string>('');
  const [formStatusKomitmen, setFormStatusKomitmen] = useState<CoachingCommitmentStatus>('dalam_proses');
  const [formCatatanTindakLanjut, setFormCatatanTindakLanjut] = useState<string>('');

  // Coach Feedback
  const [formCoachFeedback, setFormCoachFeedback] = useState<string>('');

  // Active step in modal wizard (0: Identitas & T, 1: I, 2: R, 3: TA)
  const [wizardStep, setWizardStep] = useState<number>(0);

  // Print ref
  const printAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCoachingRecords(getCoachingRecords());
  }, []);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return coachingRecords.filter((rec) => {
      if (filterTeacherId !== 'all' && rec.teacherId !== filterTeacherId) return false;
      if (filterContext !== 'all' && rec.context !== filterContext) return false;
      if (filterStatus !== 'all' && rec.tanggungJawab.statusKomitmen !== filterStatus) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const inTeacher = rec.teacherName.toLowerCase().includes(q);
        const inSchool = rec.schoolName.toLowerCase().includes(q);
        const inTopic = rec.tujuan.topikPercakapan.toLowerCase().includes(q);
        const inStrategy = rec.rencanaAksi.strategiUtama.toLowerCase().includes(q);
        if (!inTeacher && !inSchool && !inTopic && !inStrategy) return false;
      }
      return true;
    });
  }, [coachingRecords, filterTeacherId, filterContext, filterStatus, searchTerm]);

  // Selected Record
  const activeRecord = useMemo(() => {
    if (selectedRecordId) {
      const found = coachingRecords.find((r) => r.id === selectedRecordId);
      if (found) return found;
    }
    return filteredRecords[0] || coachingRecords[0] || null;
  }, [coachingRecords, filteredRecords, selectedRecordId]);

  // Statistics
  const stats = useMemo(() => {
    const total = coachingRecords.length;
    const achieved = coachingRecords.filter((r) => r.tanggungJawab.statusKomitmen === 'tercapai').length;
    const inProgress = coachingRecords.filter((r) => r.tanggungJawab.statusKomitmen === 'dalam_proses').length;
    const uniqueTeachers = new Set(coachingRecords.map((r) => r.teacherId)).size;
    const successRate = total > 0 ? Math.round((achieved / total) * 100) : 0;
    return { total, achieved, inProgress, uniqueTeachers, successRate };
  }, [coachingRecords]);

  // Handle open add modal
  const handleOpenAddModal = (presetTeacherId?: string) => {
    const targetTeacher = teachers.find((t) => t.id === presetTeacherId) || teachers[0];
    setEditingRecord(null);
    setWizardStep(0);
    setFormTeacherId(targetTeacher?.id || '');
    setFormDate('2026-10-21');
    setFormTime('09:00');
    setFormContext('pasca_observasi');
    setFormSupervisionId('');

    // Pre-fill realistic starting points
    setFormTopik('Refleksi Efektivitas Pembelajaran Berdiferensiasi & Manajemen Waktu');
    setFormTujuanAkhir('Menyepakati langkah praktis yang dapat diterapkan pada siklus mengajar berikutnya.');
    setFormUkuranKeberhasilan('Tercapainya keterlibatan murid 100% dan instrumen asesmen formatif tuntas.');

    setFormPotensi('Guru komunikatif, menguasai substansi materi, dan terbuka terhadap ide baru.');
    setFormTantangan('Diferensiasi proses masih terkendala waktu bimbingan bertahap.');
    setFormAkarMasalah('Belum tersedianya lembar tangga bantuan mandiri untuk kelompok awal.');
    setFormPeluang('Dukungan murid tutor sebaya dan media tayang LCD kelas.');

    setFormStrategiUtama('Penerapan Tiered Assignment (LKPD Bertingkat) dan Pembentukan Tutor Sebaya');
    setFormLangkahList([
      'Menyusun modul LKPD 3 tingkat kesulitan bersama tim MGMP sekolah.',
      'Melatih 4 murid sebagai duta belajar tutor sebaya.',
      'Membuat visual checklist progres kelompok di papan tulis.'
    ]);
    setFormLiniMasa('Mulai diuji coba pada pertemuan pekan depan.');
    setFormDukungan('Format LKPD dari perpustakaan dan koordinasi antarguru.');

    setFormKomitmen('Saya berkomitmen menyiapkan modul bertingkat dan menguji cobanya secara konsisten.');
    setFormPihakMembantu('Rekan sejawat MGMP dan guru pamong.');
    setFormJadwalTindakLanjut('2026-11-04');
    setFormStatusKomitmen('dalam_proses');
    setFormCatatanTindakLanjut('');
    setFormCoachFeedback('Guru memiliki motivasi intrinsik tinggi untuk terus berbenah demi melayani kebutuhan belajar murid.');

    setIsEditorModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEditModal = (record: TirtaCoachingRecord) => {
    setEditingRecord(record);
    setWizardStep(0);
    setFormTeacherId(record.teacherId);
    setFormDate(record.date);
    setFormTime(record.time);
    setFormContext(record.context);
    setFormSupervisionId(record.supervisionId || '');

    setFormTopik(record.tujuan.topikPercakapan);
    setFormTujuanAkhir(record.tujuan.tujuanAkhir);
    setFormUkuranKeberhasilan(record.tujuan.ukuranKeberhasilan);

    setFormPotensi(record.identifikasi.potensiDanKekuatan);
    setFormTantangan(record.identifikasi.faktaDanTantangan);
    setFormAkarMasalah(record.identifikasi.akarMasalah);
    setFormPeluang(record.identifikasi.peluangTersedia);

    setFormStrategiUtama(record.rencanaAksi.strategiUtama);
    setFormLangkahList(record.rencanaAksi.langkahKonkret.length > 0 ? record.rencanaAksi.langkahKonkret : ['']);
    setFormLiniMasa(record.rencanaAksi.waktuDanLiniMasa);
    setFormDukungan(record.rencanaAksi.dukunganDibutuhkan);

    setFormKomitmen(record.tanggungJawab.komitmenGuru);
    setFormPihakMembantu(record.tanggungJawab.pihakYangMembantu);
    setFormJadwalTindakLanjut(record.tanggungJawab.jadwalTindakLanjut);
    setFormStatusKomitmen(record.tanggungJawab.statusKomitmen);
    setFormCatatanTindakLanjut(record.tanggungJawab.catatanTindakLanjut || '');
    setFormCoachFeedback(record.coachFeedback || '');

    setIsEditorModalOpen(true);
  };

  // Save form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = teachers.find((t) => t.id === formTeacherId);
    if (!teacher) {
      showToast('Pilih Guru', 'Silakan pilih guru yang menjadi coachee.', 'error');
      return;
    }

    const cleanedSteps = formLangkahList.map((s) => s.trim()).filter(Boolean);
    const now = new Date().toISOString();

    const recordToSave: TirtaCoachingRecord = {
      id: editingRecord ? editingRecord.id : `coach-${Date.now().toString().slice(-6)}`,
      teacherId: teacher.id,
      teacherName: teacher.nama,
      teacherNip: teacher.nip,
      schoolName: teacher.satuanPendidikan || settings.schoolName || 'Satuan Pendidikan',
      subject: teacher.mapel || 'Kurikulum Merdeka',
      date: formDate,
      time: formTime,
      context: formContext,
      supervisionId: formSupervisionId || undefined,

      tujuan: {
        topikPercakapan: formTopik.trim(),
        tujuanAkhir: formTujuanAkhir.trim(),
        ukuranKeberhasilan: formUkuranKeberhasilan.trim()
      },

      identifikasi: {
        potensiDanKekuatan: formPotensi.trim(),
        faktaDanTantangan: formTantangan.trim(),
        akarMasalah: formAkarMasalah.trim(),
        peluangTersedia: formPeluang.trim()
      },

      rencanaAksi: {
        strategiUtama: formStrategiUtama.trim(),
        langkahKonkret: cleanedSteps.length > 0 ? cleanedSteps : ['Menerapkan kesepakatan strategi pembelajaran.'],
        waktuDanLiniMasa: formLiniMasa.trim(),
        dukunganDibutuhkan: formDukungan.trim()
      },

      tanggungJawab: {
        komitmenGuru: formKomitmen.trim(),
        pihakYangMembantu: formPihakMembantu.trim(),
        jadwalTindakLanjut: formJadwalTindakLanjut.trim(),
        statusKomitmen: formStatusKomitmen,
        catatanTindakLanjut: formCatatanTindakLanjut.trim() || undefined
      },

      supervisorName: settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
      supervisorNip: settings.supervisorNip || '19820415 200801 1 007',
      supervisorRole: settings.supervisorRole || 'Pengawas Sekolah Pembina',
      coachFeedback: formCoachFeedback.trim() || undefined,
      createdAt: editingRecord ? editingRecord.createdAt : now,
      updatedAt: now
    };

    saveCoachingRecord(recordToSave);
    const updated = getCoachingRecords();
    setCoachingRecords(updated);
    setSelectedRecordId(recordToSave.id);
    setIsEditorModalOpen(false);

    showToast(
      editingRecord ? 'Jurnal Diperbarui' : 'Sesi Coaching Tersimpan',
      `Jurnal Alur TIRTA untuk ${recordToSave.teacherName} berhasil disimpan.`,
      'success'
    );
  };

  // Quick mark status
  const handleToggleStatus = (record: TirtaCoachingRecord, newStatus: CoachingCommitmentStatus) => {
    const updated: TirtaCoachingRecord = {
      ...record,
      tanggungJawab: {
        ...record.tanggungJawab,
        statusKomitmen: newStatus,
        catatanTindakLanjut:
          newStatus === 'tercapai'
            ? record.tanggungJawab.catatanTindakLanjut ||
              `Komitmen aksi telah terlaksana dengan baik pada evaluasi tanggal ${new Date().toLocaleDateString('id-ID')}.`
            : record.tanggungJawab.catatanTindakLanjut
      },
      updatedAt: new Date().toISOString()
    };
    saveCoachingRecord(updated);
    setCoachingRecords(getCoachingRecords());
    showToast('Status Diperbarui', `Komitmen guru ditandai sebagai ${newStatus.replace('_', ' ')}.`, 'success');
  };

  // Delete
  const handleDelete = (id: string, teacherName: string) => {
    if (confirm(`Hapus catatan jurnal coaching untuk ${teacherName}?`)) {
      deleteCoachingRecord(id);
      const remaining = getCoachingRecords();
      setCoachingRecords(remaining);
      if (selectedRecordId === id) {
        setSelectedRecordId(remaining[0]?.id || '');
      }
      showToast('Jurnal Dihapus', 'Catatan coaching berhasil dihapus.', 'info');
    }
  };

  // Print
  const handlePrint = () => {
    if (!activeRecord) return;
    printDocumentElement(
      'tirta-coaching-print-area',
      `Jurnal_Coaching_TIRTA_${activeRecord.teacherName.replace(/[,. ]+/g, '_')}_${activeRecord.date}`,
      { orientation: 'portrait' }
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner with Executive Presence */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#091838] via-[#0f2452] to-[#142d62] rounded-2xl p-6 sm:p-7 text-white shadow-xl border border-blue-400/25">
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-cyan-300 font-semibold tracking-wide">
              <span>Coach / Pengawas: {settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'}</span>
              <span aria-hidden="true" className="text-white/40">·</span>
              <span>NIP: {settings.supervisorNip || '19820415 200801 1 007'}</span>
              <span aria-hidden="true" className="text-white/40">·</span>
              <span className="text-blue-200">Model Refleksi Guru Penggerak</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight flex items-center gap-3">
              <HeartHandshake className="w-7 h-7 sm:w-8 h-8 text-cyan-400 shrink-0" />
              <span>Jurnal Coaching Dialogis Alur TIRTA</span>
            </h2>

            <p className="text-xs sm:text-sm text-blue-100/85 leading-relaxed font-normal">
              Memperkuat esensi supervisi klinis Kurikulum Merdeka yang humanis dan memberdayakan.
              Menggali potensi mandiri guru lewat 4 tahapan dialogis: <strong>Tujuan (T)</strong>, <strong>Identifikasi (I)</strong>, <strong>Rencana Aksi (R)</strong>, dan <strong>Tanggung Jawab (TA)</strong>.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => handleOpenAddModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 hover:from-cyan-300 hover:to-blue-300 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-cyan-500/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span>+ Mulai Sesi Coaching Baru</span>
            </button>

            {activeRecord && (
              <>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl transition-all border border-white/15 backdrop-blur-xs cursor-pointer hover:border-white/30"
                  title="Cetak Jurnal Coaching ke PDF"
                >
                  <Printer className="w-4 h-4 text-cyan-300" />
                  <span>Cetak / Simpan PDF</span>
                </button>

                <button
                  onClick={() => exportCoachingJournalToWord(activeRecord, settings)}
                  className="flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl transition-all border border-white/15 backdrop-blur-xs cursor-pointer hover:border-white/30"
                  title="Unduh Berkas Word .doc"
                >
                  <Download className="w-4 h-4 text-blue-300" />
                  <span>Unduh Word (.doc)</span>
                </button>
              </>
            )}

            <button
              onClick={() => setIsSignatoryModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold text-xs rounded-xl transition-all border border-amber-400/30 cursor-pointer"
              title="Atur penandatangan kedinasan"
            >
              <FileSignature className="w-4 h-4 text-amber-300" />
              <span>Atur Penandatangan</span>
            </button>
          </div>
        </div>

        {/* 4-Pillar TIRTA Flow Visual Banner */}
        <div className="relative z-10 pt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-white/6 border border-blue-400/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-black text-cyan-300 mb-1">
                <span>T — TUJUAN</span>
                <Target className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-[11px] text-blue-100 font-medium">Menyepakati topik &amp; hasil</p>
            </div>
            <p className="text-[10px] text-blue-200/70 italic mt-2">
              "Apa ukuran keberhasilan dari pertemuan kita hari ini?"
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/6 border border-indigo-400/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-black text-indigo-300 mb-1">
                <span>I — IDENTIFIKASI</span>
                <Compass className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-[11px] text-blue-100 font-medium">Memetakan situasi &amp; fakta</p>
            </div>
            <p className="text-[10px] text-blue-200/70 italic mt-2">
              "Kekuatan apa yang Ibu/Bapak miliki untuk mengatasinya?"
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/6 border border-emerald-400/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-black text-emerald-300 mb-1">
                <span>R — RENCANA AKSI</span>
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-blue-100 font-medium">Strategi mandiri coachee</p>
            </div>
            <p className="text-[10px] text-blue-200/70 italic mt-2">
              "Gagasan konkret apa yang akan Ibu/Bapak coba terapkan?"
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/6 border border-amber-400/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-black text-amber-300 mb-1">
                <span>TA — TANGGUNG JAWAB</span>
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-[11px] text-blue-100 font-medium">Komitmen &amp; tindak lanjut</p>
            </div>
            <p className="text-[10px] text-blue-200/70 italic mt-2">
              "Kapan aksi ini dimulai dan siapa yang akan membantu?"
            </p>
          </div>
        </div>
      </div>

      {/* 2. Control Bar & Search Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Guru filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Guru Coachee:</span>
            <select
              value={filterTeacherId}
              onChange={(e) => setFilterTeacherId(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Guru ({teachers.length})</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.nama}</option>
              ))}
            </select>
          </div>

          {/* Konteks filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Konteks:</span>
            <select
              value={filterContext}
              onChange={(e) => setFilterContext(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Konteks Sesi</option>
              {Object.entries(COACHING_CONTEXT_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.badge}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Status Komitmen:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="tercapai">Tercapai (Selesai)</option>
              <option value="dalam_proses">Sedang Berjalan</option>
              <option value="perlu_tinjauan">Perlu Tinjauan</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari guru / topik aksi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 w-48 sm:w-56"
          />
        </div>
      </div>

      {/* 3. Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Coaching Journal List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Daftar Jurnal Coaching ({filteredRecords.length})
            </span>
            <span className="text-[11px] text-blue-600 font-semibold">
              {stats.achieved} tercapai ({stats.successRate}%)
            </span>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <HeartHandshake className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Belum Ada Sesi Coaching</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Mulai percakapan coaching klinis Alur TIRTA untuk memperkuat refleksi guru binaan.
              </p>
              <button
                onClick={() => handleOpenAddModal()}
                className="mt-3 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Mulai Sesi Pertama
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
              {filteredRecords.map((rec) => {
                const isSelected = activeRecord?.id === rec.id;
                const contextCfg = COACHING_CONTEXT_LABELS[rec.context] || { label: rec.context, badge: rec.context, color: 'text-slate-700', bg: 'bg-slate-100' };
                const isDone = rec.tanggungJawab.statusKomitmen === 'tercapai';

                return (
                  <div
                    key={rec.id}
                    onClick={() => setSelectedRecordId(rec.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${contextCfg.bg} ${contextCfg.color}`}>
                          {contextCfg.badge}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{rec.teacherName}</h4>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.tanggungJawab.statusKomitmen === 'dalam_proses'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isDone ? 'Tercapai' : 'Berjalan'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium line-clamp-2">
                      {rec.tujuan.topikPercakapan}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {rec.date}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-600 truncate max-w-[150px]">
                        <Building className="w-3 h-3 text-blue-500" />
                        {rec.schoolName.replace('SMP Negeri ', 'SMPN ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Selected Coaching Detail (8 cols) */}
        <div className="lg:col-span-8">
          {activeRecord ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Detail Header */}
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                      {COACHING_CONTEXT_LABELS[activeRecord.context]?.label || activeRecord.context}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        activeRecord.tanggungJawab.statusKomitmen === 'tercapai'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Status: {activeRecord.tanggungJawab.statusKomitmen === 'tercapai' ? 'Komitmen Tercapai' : 'Sedang Dilaksanakan'}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                    {activeRecord.teacherName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>NIP. {activeRecord.teacherNip}</span>
                    <span>·</span>
                    <span>{activeRecord.schoolName}</span>
                    <span>·</span>
                    <span>Mata Pelajaran: {activeRecord.subject}</span>
                    <span>·</span>
                    <span>{activeRecord.date} ({activeRecord.time || '08:00'} WIB)</span>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {activeRecord.tanggungJawab.statusKomitmen !== 'tercapai' ? (
                    <button
                      onClick={() => handleToggleStatus(activeRecord, 'tercapai')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                      title="Tandai komitmen guru ini telah tercapai"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Tandai Tercapai</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleStatus(activeRecord, 'dalam_proses')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      title="Ubah kembali ke status berjalan"
                    >
                      <span>Ubah Status</span>
                    </button>
                  )}

                  <button
                    onClick={handlePrint}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title="Cetak Jurnal ke PDF"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => exportCoachingJournalToWord(activeRecord, settings)}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                    title="Unduh Word (.doc)"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(activeRecord)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title="Edit Catatan"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(activeRecord.id, activeRecord.teacherName)}
                    className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Hapus Jurnal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 4 Phases of TIRTA Detailed Display */}
              <div className="p-6 space-y-6">
                {/* 1. T - TUJUAN */}
                <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-3">
                  <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm border-b border-blue-200/80 pb-2">
                    <Target className="w-4.5 h-4.5 text-blue-600" />
                    <span>1. T — TUJUAN (Menyepakati Topik &amp; Ukuran Keberhasilan)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-500 uppercase text-[10px]">Topik Percakapan:</span>
                      <p className="font-bold text-slate-900 mt-0.5 leading-relaxed">
                        {activeRecord.tujuan.topikPercakapan}
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500 uppercase text-[10px]">Tujuan Akhir:</span>
                      <p className="text-slate-700 mt-0.5 leading-relaxed">
                        {activeRecord.tujuan.tujuanAkhir}
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500 uppercase text-[10px]">Ukuran Keberhasilan:</span>
                      <p className="text-slate-700 mt-0.5 leading-relaxed">
                        {activeRecord.tujuan.ukuranKeberhasilan}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. I - IDENTIFIKASI */}
                <div className="p-5 rounded-2xl border border-indigo-200 bg-indigo-50/40 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-sm border-b border-indigo-200/80 pb-2">
                    <Compass className="w-4.5 h-4.5 text-indigo-600" />
                    <span>2. I — IDENTIFIKASI (Situasi Nyata, Potensi, dan Tantangan)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-indigo-100">
                      <span className="font-bold text-indigo-800 flex items-center gap-1.5 mb-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Potensi &amp; Kekuatan Guru yang Ada
                      </span>
                      <p className="text-slate-700 leading-relaxed">{activeRecord.identifikasi.potensiDanKekuatan}</p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-indigo-100">
                      <span className="font-bold text-indigo-800 flex items-center gap-1.5 mb-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        Fakta &amp; Tantangan Nyata di Kelas
                      </span>
                      <p className="text-slate-700 leading-relaxed">{activeRecord.identifikasi.faktaDanTantangan}</p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-indigo-100">
                      <span className="font-bold text-indigo-800 mb-1 block">Akar Masalah Utama:</span>
                      <p className="text-slate-700 leading-relaxed">{activeRecord.identifikasi.akarMasalah}</p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-indigo-100">
                      <span className="font-bold text-indigo-800 mb-1 block">Peluang &amp; Fasilitas Terbuka:</span>
                      <p className="text-slate-700 leading-relaxed">{activeRecord.identifikasi.peluangTersedia}</p>
                    </div>
                  </div>
                </div>

                {/* 3. R - RENCANA AKSI */}
                <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm border-b border-emerald-200/80 pb-2">
                    <Zap className="w-4.5 h-4.5 text-emerald-600" />
                    <span>3. R — RENCANA AKSI (Strategi &amp; Solusi Mandiri dari Coachee)</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-500 uppercase text-[10px]">Strategi Utama:</span>
                      <p className="text-sm font-bold text-emerald-950 mt-0.5">
                        {activeRecord.rencanaAksi.strategiUtama}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">
                        Langkah-Langkah Konkret Pelaksanaan:
                      </span>
                      <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-emerald-100">
                        {activeRecord.rencanaAksi.langkahKonkret.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-slate-800 leading-relaxed font-medium">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="font-bold text-slate-500 uppercase text-[10px]">Lini Masa Waktu:</span>
                        <p className="text-slate-800 font-semibold mt-0.5">{activeRecord.rencanaAksi.waktuDanLiniMasa}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 uppercase text-[10px]">Dukungan Diperlukan:</span>
                        <p className="text-slate-800 font-semibold mt-0.5">{activeRecord.rencanaAksi.dukunganDibutuhkan}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. TA - TANGGUNG JAWAB & KOMITMEN */}
                <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm border-b border-amber-200/80 pb-2">
                    <ShieldCheck className="w-4.5 h-4.5 text-amber-600" />
                    <span>4. TA — TANGGUNG JAWAB &amp; KOMITMEN (Peneguhan &amp; Jadwal Evaluasi)</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="bg-white p-3.5 rounded-xl border border-amber-200 italic text-slate-800 font-medium leading-relaxed">
                      "{activeRecord.tanggungJawab.komitmenGuru}"
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="font-bold text-slate-500 uppercase text-[10px]">Pihak yang Membantu:</span>
                        <p className="text-slate-800 font-semibold mt-0.5">{activeRecord.tanggungJawab.pihakYangMembantu}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 uppercase text-[10px]">Jadwal Pemantauan Tindak Lanjut:</span>
                        <p className="text-blue-700 font-bold mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {activeRecord.tanggungJawab.jadwalTindakLanjut}
                        </p>
                      </div>
                    </div>

                    {activeRecord.tanggungJawab.catatanTindakLanjut && (
                      <div className="bg-emerald-50 text-emerald-950 p-3 rounded-xl border border-emerald-200">
                        <span className="font-bold block text-[11px] mb-0.5">Catatan Evaluasi Lapangan:</span>
                        <p className="leading-relaxed">{activeRecord.tanggungJawab.catatanTindakLanjut}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. APRESIASI & PENGUATAN COACH */}
                {activeRecord.coachFeedback && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1 text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Refleksi &amp; Penguatan dari Coach ({activeRecord.supervisorName})
                    </span>
                    <p className="text-slate-600 italic leading-relaxed">
                      "{activeRecord.coachFeedback}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              Pilih salah satu jurnal di sebelah kiri untuk melihat catatan coaching dialogis lengkap.
            </div>
          )}
        </div>
      </div>

      {/* 4. WIZARD MODAL: BUAT / EDIT SESI COACHING ALUR TIRTA */}
      {isEditorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 my-8 overflow-hidden flex flex-col max-h-[88vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <HeartHandshake className="w-5 h-5 text-cyan-300" />
                <div>
                  <h3 className="text-base font-bold">
                    {editingRecord ? 'Edit Jurnal Coaching Alur TIRTA' : 'Catatan Coaching Dialogis Alur TIRTA'}
                  </h3>
                  <p className="text-[11px] text-blue-100">
                    Langkah {wizardStep + 1} dari 4: {wizardStep === 0 ? 'Identitas & Tujuan (T)' : wizardStep === 1 ? 'Identifikasi (I)' : wizardStep === 2 ? 'Rencana Aksi (R)' : 'Tanggung Jawab (TA)'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditorModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Tabs */}
            <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setWizardStep(0)}
                className={`py-2.5 border-b-2 transition-all cursor-pointer ${
                  wizardStep === 0
                    ? 'border-blue-600 text-blue-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                1. T (Tujuan)
              </button>
              <button
                type="button"
                onClick={() => setWizardStep(1)}
                className={`py-2.5 border-b-2 transition-all cursor-pointer ${
                  wizardStep === 1
                    ? 'border-indigo-600 text-indigo-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                2. I (Identifikasi)
              </button>
              <button
                type="button"
                onClick={() => setWizardStep(2)}
                className={`py-2.5 border-b-2 transition-all cursor-pointer ${
                  wizardStep === 2
                    ? 'border-emerald-600 text-emerald-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                3. R (Rencana Aksi)
              </button>
              <button
                type="button"
                onClick={() => setWizardStep(3)}
                className={`py-2.5 border-b-2 transition-all cursor-pointer ${
                  wizardStep === 3
                    ? 'border-amber-600 text-amber-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                4. TA (Komitmen)
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSaveForm} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* STEP 0: Identitas Guru & T (Tujuan) */}
              {wizardStep === 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Pilih Guru (Coachee) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        value={formTeacherId}
                        onChange={(e) => setFormTeacherId(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      >
                        <option value="">-- Pilih Guru --</option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nama} ({t.mapel} - {t.satuanPendidikan})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Konteks Percakapan
                      </label>
                      <select
                        value={formContext}
                        onChange={(e) => setFormContext(e.target.value as CoachingContext)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      >
                        {Object.entries(COACHING_CONTEXT_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Sesi</label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Waktu Sesi</label>
                      <input
                        type="time"
                        value={formTime}
                        onChange={(e) => setFormTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-xs font-black text-blue-700 uppercase tracking-wider block mb-2">
                      Fase T — Tujuan Sesi Coaching
                    </span>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Topik Percakapan yang Ingin Dibahas Guru <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formTopik}
                          onChange={(e) => setFormTopik(e.target.value)}
                          placeholder="Misal: Peningkatan diferensiasi proses materi aljabar..."
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Tujuan Akhir yang Diharapkan Coachee
                        </label>
                        <textarea
                          rows={2}
                          value={formTujuanAkhir}
                          onChange={(e) => setFormTujuanAkhir(e.target.value)}
                          placeholder="Apa hasil ideal yang ingin diraih guru dari sesi ini..."
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Ukuran Keberhasilan Pertemuan Ini
                        </label>
                        <input
                          type="text"
                          value={formUkuranKeberhasilan}
                          onChange={(e) => setFormUkuranKeberhasilan(e.target.value)}
                          placeholder="Contoh: Terumuskannya 3 langkah praktis dan lembar asesmen formatif baru"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 1: I (Identifikasi) */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900">
                    <strong>Panduan Pertanyaan Pemantik Coach (I):</strong>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px] text-indigo-800">
                      <li>"Bagaimana kondisi pembelajaran di kelas saat ini?"</li>
                      <li>"Hal baik apa saja yang sudah berhasil Ibu/Bapak lakukan?"</li>
                      <li>"Apa yang menjadi hambatan utama dan akar penyebabnya?"</li>
                    </ul>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Potensi &amp; Kekuatan yang Dimiliki Guru (Aset Positif)
                    </label>
                    <textarea
                      rows={2}
                      value={formPotensi}
                      onChange={(e) => setFormPotensi(e.target.value)}
                      placeholder="Kekuatan komunikasi, penguasaan IT, kedekatan dengan murid..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Fakta &amp; Tantangan Nyata yang Dihadapi di Kelas
                    </label>
                    <textarea
                      rows={2}
                      value={formTantangan}
                      onChange={(e) => setFormTantangan(e.target.value)}
                      placeholder="Murid pasif di akhir pelajaran, beberapa murid lambat menangkap konsep..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Akar Masalah yang Disadari Guru
                      </label>
                      <input
                        type="text"
                        value={formAkarMasalah}
                        onChange={(e) => setFormAkarMasalah(e.target.value)}
                        placeholder="Kurangnya media visual, manajemen waktu..."
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Peluang / Solusi Alternatif Terbuka
                      </label>
                      <input
                        type="text"
                        value={formPeluang}
                        onChange={(e) => setFormPeluang(e.target.value)}
                        placeholder="Tutor sebaya, Chromebook sekolah, Kombel..."
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: R (Rencana Aksi) */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                    <strong>Panduan Pertanyaan Pemantik Coach (R):</strong>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px] text-emerald-800">
                      <li>"Gagasan atau opsi apa yang terpikirkan oleh Ibu/Bapak untuk dicoba?"</li>
                      <li>"Apa langkah pertama yang paling realistis untuk dieksekusi?"</li>
                      <li>"Bantuan atau sarana apa yang Ibu/Bapak perlukan?"</li>
                    </ul>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Strategi Utama yang Dirumuskan Coachee <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formStrategiUtama}
                      onChange={(e) => setFormStrategiUtama(e.target.value)}
                      placeholder="Contoh: Menggunakan Learning Station dengan lembar kerja bertingkat..."
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Langkah-Langkah Konkret Pelaksanaan
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormLangkahList([...formLangkahList, ''])}
                        className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                      >
                        + Tambah Langkah
                      </button>
                    </div>

                    <div className="space-y-2">
                      {formLangkahList.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={step}
                            onChange={(e) => {
                              const copy = [...formLangkahList];
                              copy[idx] = e.target.value;
                              setFormLangkahList(copy);
                            }}
                            placeholder={`Langkah konkret ${idx + 1}...`}
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                          />
                          {formLangkahList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setFormLangkahList(formLangkahList.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-rose-600 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Lini Masa / Waktu Pelaksanaan
                      </label>
                      <input
                        type="text"
                        value={formLiniMasa}
                        onChange={(e) => setFormLiniMasa(e.target.value)}
                        placeholder="Contoh: Minggu ke-3 Oktober 2026"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Dukungan / Sarana yang Dibutuhkan
                      </label>
                      <input
                        type="text"
                        value={formDukungan}
                        onChange={(e) => setFormDukungan(e.target.value)}
                        placeholder="Tablet kelas, lembar panduan..."
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: TA (Tanggung Jawab) */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
                    <strong>Panduan Pertanyaan Pemantik Coach (TA):</strong>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px] text-amber-800">
                      <li>"Apa komitmen Ibu/Bapak terhadap rencana aksi yang sudah disusun?"</li>
                      <li>"Siapa yang bisa membantu Ibu/Bapak menjaga komitmen ini?"</li>
                      <li>"Kapan kita akan bertemu kembali untuk melihat kemajuannya?"</li>
                    </ul>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pernyataan Komitmen Pribadi Guru (Coachee) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={formKomitmen}
                      onChange={(e) => setFormKomitmen(e.target.value)}
                      placeholder="Saya berkomitmen untuk..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Pihak yang Terlibat / Membantu
                      </label>
                      <input
                        type="text"
                        value={formPihakMembantu}
                        onChange={(e) => setFormPihakMembantu(e.target.value)}
                        placeholder="Rekan sejawat MGMP, laboran, guru BK..."
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Jadwal Pemantauan Tindak Lanjut
                      </label>
                      <input
                        type="date"
                        value={formJadwalTindakLanjut}
                        onChange={(e) => setFormJadwalTindakLanjut(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Status Komitmen</label>
                      <select
                        value={formStatusKomitmen}
                        onChange={(e) => setFormStatusKomitmen(e.target.value as CoachingCommitmentStatus)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                      >
                        <option value="dalam_proses">Sedang Berjalan</option>
                        <option value="tercapai">Tercapai (Selesai)</option>
                        <option value="perlu_tinjauan">Perlu Tinjauan Lanjut</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Catatan Evaluasi / Hasil Tindak Lanjut (Opsional)
                      </label>
                      <input
                        type="text"
                        value={formCatatanTindakLanjut}
                        onChange={(e) => setFormCatatanTindakLanjut(e.target.value)}
                        placeholder="Catatan perkembangan setelah aksi..."
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Catatan Apresiasi &amp; Penguatan dari Coach / Pengawas
                    </label>
                    <textarea
                      rows={2}
                      value={formCoachFeedback}
                      onChange={(e) => setFormCoachFeedback(e.target.value)}
                      placeholder="Tuliskan catatan apresiasi atas kesadaran dan komitmen guru..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Wizard Footer Controls */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between shrink-0">
                <div>
                  {wizardStep > 0 && (
                    <button
                      type="button"
                      onClick={() => setWizardStep(wizardStep - 1)}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      ← Kembali
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditorModalOpen(false)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>

                  {wizardStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => setWizardStep(wizardStep + 1)}
                      className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/25 cursor-pointer"
                    >
                      Lanjut ke Tahap Berikutnya →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl transition-all shadow-md shadow-emerald-500/25 cursor-pointer"
                    >
                      {editingRecord ? 'Simpan Perubahan Jurnal' : 'Simpan Jurnal Coaching TIRTA'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. SIGNATORY MODAL */}
      <SignatoryModal
        isOpen={isSignatoryModalOpen}
        onClose={() => setIsSignatoryModalOpen(false)}
        settings={settings}
        onSave={(newSettings) => {
          onUpdateSettings?.(newSettings);
          showToast('Penandatangan Disimpan', 'Identitas penandatangan jurnal coaching telah diperbarui.', 'success');
        }}
        onPrintAfterSave={handlePrint}
      />

      {/* 6. HIDDEN PRINT CONTAINER: LEMBAR JURNAL COACHING RESMI DINAS */}
      {activeRecord && (
        <div className="hidden">
          <div
            id="tirta-coaching-print-area"
            ref={printAreaRef}
            className="p-8 text-black bg-white"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            {/* Kop Surat Dinas */}
            <div style={{ textAlign: 'center', borderBottom: '3px double #000', paddingBottom: '10px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '13pt', textTransform: 'uppercase', fontWeight: 'bold' }}>
                {settings.governmentAgency || 'PEMERINTAH KABUPATEN SIDENRENG RAPPANG'}
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
                LEMBAR CATATAN COACHING DIALOGIS ALUR TIRTA
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '10pt', fontStyle: 'italic' }}>
                Refleksi Klinis &amp; Pendampingan Pembelajaran Berdiferensiasi Kurikulum Merdeka
              </p>
            </div>

            {/* Tabel Identitas */}
            <table style={{ width: '100%', marginBottom: '14px', fontSize: '10pt', borderCollapse: 'collapse', border: 'none' }}>
              <tbody>
                <tr>
                  <td style={{ width: '25%', padding: '4px 0', border: 'none' }}><strong>Nama Guru (Coachee)</strong></td>
                  <td style={{ width: '2%', padding: '4px 0', border: 'none' }}>:</td>
                  <td style={{ width: '38%', padding: '4px 0', border: 'none' }}>{activeRecord.teacherName}</td>
                  <td style={{ width: '15%', padding: '4px 0', border: 'none' }}><strong>Hari / Tanggal</strong></td>
                  <td style={{ width: '2%', padding: '4px 0', border: 'none' }}>:</td>
                  <td style={{ width: '18%', padding: '4px 0', border: 'none' }}>{activeRecord.date}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', border: 'none' }}><strong>NIP Guru</strong></td>
                  <td style={{ padding: '4px 0', border: 'none' }}>:</td>
                  <td style={{ padding: '4px 0', border: 'none' }}>{activeRecord.teacherNip}</td>
                  <td style={{ padding: '4px 0', border: 'none' }}><strong>Waktu Pelaksanaan</strong></td>
                  <td style={{ padding: '4px 0', border: 'none' }}>:</td>
                  <td style={{ padding: '4px 0', border: 'none' }}>{activeRecord.time || '08:00'} WIB</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', border: 'none' }}><strong>Satuan Pendidikan</strong></td>
                  <td style={{ padding: '4px 0', border: 'none' }}>:</td>
                  <td style={{ padding: '4px 0', border: 'none' }}>{activeRecord.schoolName}</td>
                  <td style={{ padding: '4px 0', border: 'none' }}><strong>Mata Pelajaran</strong></td>
                  <td style={{ padding: '4px 0', border: 'none' }}>:</td>
                  <td style={{ padding: '4px 0', border: 'none' }}>{activeRecord.subject}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', border: 'none' }}><strong>Nama Coach / Pengawas</strong></td>
                  <td style={{ padding: '4px 0', border: 'none' }}>:</td>
                  <td style={{ padding: '4px 0', border: 'none' }}>{settings.supervisorName || activeRecord.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'}</td>
                  <td style={{ padding: '4px 0', border: 'none' }}><strong>Konteks Sesi</strong></td>
                  <td style={{ padding: '4px 0', border: 'none' }}>:</td>
                  <td style={{ padding: '4px 0', border: 'none' }}>{COACHING_CONTEXT_LABELS[activeRecord.context]?.label || activeRecord.context}</td>
                </tr>
              </tbody>
            </table>

            {/* Matriks Alur TIRTA */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt', marginBottom: '20px' }}>
              <tbody>
                {/* 1. T - TUJUAN */}
                <tr style={{ backgroundColor: '#e2e8f0', fontWeight: 'bold' }}>
                  <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>
                    1. T — TUJUAN (Menyepakati topik, agenda, dan ukuran keberhasilan percakapan)
                  </td>
                </tr>
                <tr>
                  <td style={{ width: '30%', border: '1px solid #000', padding: '6px', backgroundColor: '#f8fafc' }}>
                    <strong>Topik Percakapan</strong>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{activeRecord.tujuan.topikPercakapan}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f8fafc' }}>
                    <strong>Tujuan Akhir</strong>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{activeRecord.tujuan.tujuanAkhir}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f8fafc' }}>
                    <strong>Ukuran Keberhasilan Sesi</strong>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{activeRecord.tujuan.ukuranKeberhasilan}</td>
                </tr>

                {/* 2. I - IDENTIFIKASI */}
                <tr style={{ backgroundColor: '#e2e8f0', fontWeight: 'bold' }}>
                  <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>
                    2. I — IDENTIFIKASI (Memetakan situasi, potensi, fakta kelas, dan peluang pemecahan)
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f8fafc' }}>
                    <strong>Potensi &amp; Kekuatan Guru</strong>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{activeRecord.identifikasi.potensiDanKekuatan}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f8fafc' }}>
                    <strong>Fakta &amp; Tantangan di Kelas</strong>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{activeRecord.identifikasi.faktaDanTantangan}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f8fafc' }}>
                    <strong>Akar Masalah yang Ditemukan</strong>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{activeRecord.identifikasi.akarMasalah}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f8fafc' }}>
                    <strong>Peluang / Solusi yang Terbuka</strong>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{activeRecord.identifikasi.peluangTersedia}</td>
                </tr>

                {/* 3. R - RENCANA AKSI */}
                <tr style={{ backgroundColor: '#e2e8f0', fontWeight: 'bold' }}>
                  <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>
                    3. R — RENCANA AKSI (Merancang langkah nyata yang dirumuskan sendiri oleh guru)
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f8fafc' }}>
                    <strong>Strategi Utama</strong>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}><strong>{activeRecord.rencanaAksi.strategiUtama}</strong></td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f8fafc' }}>
                    <strong>Langkah Konkret Pelaksanaan</strong>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>
                    <ol style={{ margin: 0, paddingLeft: '18px' }}>
                      {activeRecord.rencanaAksi.langkahKonkret.map((l, i) => (
                        <li key={i}>{l}</li>
                      ))}
                    </ol>
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f8fafc' }}>
                    <strong>Lini Masa Pelaksanaan</strong>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{activeRecord.rencanaAksi.waktuDanLiniMasa}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f8fafc' }}>
                    <strong>Dukungan / Sarana Diperlukan</strong>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{activeRecord.rencanaAksi.dukunganDibutuhkan}</td>
                </tr>

                {/* 4. TA - TANGGUNG JAWAB */}
                <tr style={{ backgroundColor: '#e2e8f0', fontWeight: 'bold' }}>
                  <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>
                    4. TA — TANGGUNG JAWAB &amp; KOMITMEN (Peneguhan komitmen dan pemantauan tindak lanjut)
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f8fafc' }}>
                    <strong>Pernyataan Komitmen Guru</strong>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}><em>"{activeRecord.tanggungJawab.komitmenGuru}"</em></td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f8fafc' }}>
                    <strong>Pihak yang Membantu</strong>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{activeRecord.tanggungJawab.pihakYangMembantu}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f8fafc' }}>
                    <strong>Jadwal Pemantauan Tindak Lanjut</strong>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>
                    {activeRecord.tanggungJawab.jadwalTindakLanjut} (Status: <strong>{activeRecord.tanggungJawab.statusKomitmen === 'tercapai' ? 'Tercapai' : 'Dalam Proses'}</strong>)
                  </td>
                </tr>
                {activeRecord.tanggungJawab.catatanTindakLanjut && (
                  <tr>
                    <td style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f8fafc' }}>
                      <strong>Catatan Evaluasi Tindak Lanjut</strong>
                    </td>
                    <td style={{ border: '1px solid #000', padding: '6px' }}>{activeRecord.tanggungJawab.catatanTindakLanjut}</td>
                  </tr>
                )}

                {/* 5. APRESIASI COACH */}
                {activeRecord.coachFeedback && (
                  <>
                    <tr style={{ backgroundColor: '#e2e8f0', fontWeight: 'bold' }}>
                      <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>
                        5. CATATAN APRESIATIF &amp; PENGUATAN DARI COACH (PENGAWAS SEKOLAH)
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ border: '1px solid #000', padding: '8px', fontStyle: 'italic', backgroundColor: '#fafaf9' }}>
                        "{activeRecord.coachFeedback}"
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>

            {/* Kolom Tanda Tangan */}
            <table style={{ width: '100%', marginTop: '30px', borderCollapse: 'collapse', border: 'none', pageBreakInside: 'avoid' }}>
              <tbody>
                <tr>
                  <td style={{ width: '50%', textAlign: 'center', border: 'none', verticalAlign: 'top' }}>
                    Guru yang Disupervisi (Coachee),<br /><br /><br /><br /><br />
                    <strong style={{ textDecoration: 'underline' }}>{activeRecord.teacherName}</strong><br />
                    <span>NIP. {activeRecord.teacherNip}</span>
                  </td>
                  <td style={{ width: '50%', textAlign: 'center', border: 'none', verticalAlign: 'top' }}>
                    {settings.schoolCity || 'Kota Pendidikan'}, {activeRecord.date}<br />
                    <strong>{settings.supervisorRole || 'Pengawas Sekolah Pembina'} (Coach)</strong><br /><br /><br /><br /><br />
                    <strong style={{ textDecoration: 'underline' }}>
                      {settings.supervisorName || activeRecord.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'}
                    </strong><br />
                    <span>NIP. {settings.supervisorNip || activeRecord.supervisorNip || '19820415 200801 1 007'}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
