/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  School,
  Plus,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSignature,
  Edit2,
  Trash2,
  X,
  Phone,
  Mail,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  Table as TableIcon,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  Printer,
  FileDown
} from 'lucide-react';
import {
  Principal,
  AppSettings,
  ManagerialEvaluationRecord,
  MANAGERIAL_DIMENSIONS,
  TOTAL_MANAGERIAL_ITEMS,
  MAX_MANAGERIAL_RAW_SCORE
} from '../types/inspiro';
import { getManagerialEvaluations, saveManagerialEvaluation, getManagerialEvaluationByPrincipalId } from '../utils/storage';
import { syncManagerialEvaluationToCloud } from '../services/firebase';
import { ManagerialSupervisionModal } from './ManagerialSupervisionModal';
import {
  printDocumentElement,
  exportPrincipalsManagerialToWord,
  exportIndividualManagerialToWord
} from '../utils/documentExport';

interface PrincipalListProps {
  principals: Principal[];
  settings: AppSettings;
  onAddPrincipal: (principal: Omit<Principal, 'id' | 'createdAt'>) => void;
  onEditPrincipal: (id: string, updates: Partial<Principal>) => void;
  onDeletePrincipal: (id: string) => void;
  onScheduleManagerialSupervision: (principal: Principal) => void;
  onNavigateToCalendar?: () => void;
  showToast: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const PrincipalList: React.FC<PrincipalListProps> = ({
  principals,
  settings,
  onAddPrincipal,
  onEditPrincipal,
  onDeletePrincipal,
  onScheduleManagerialSupervision,
  onNavigateToCalendar,
  showToast
}) => {
  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSchool, setFilterSchool] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrincipal, setEditingPrincipal] = useState<Principal | null>(null);

  // Managerial 8-Menu Supervision Modal States
  const [evaluations, setEvaluations] = useState<ManagerialEvaluationRecord[]>(() => getManagerialEvaluations());
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [evaluatingPrincipal, setEvaluatingPrincipal] = useState<Principal | null>(null);
  const [printTargetPrincipal, setPrintTargetPrincipal] = useState<Principal | null>(() => principals[0] || null);

  // Form states
  const [formNama, setFormNama] = useState('');
  const [formNip, setFormNip] = useState('');
  const [formPangkat, setFormPangkat] = useState('Pembina (IV/a)');
  const [formSekolah, setFormSekolah] = useState('');
  const [formNpsn, setFormNpsn] = useState('');
  const [formTelepon, setFormTelepon] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formStatus, setFormStatus] = useState<'Belum Disupervisi' | 'Terjadwal' | 'Selesai'>('Belum Disupervisi');
  const [formSkor, setFormSkor] = useState<string>('');
  const [formPredikat, setFormPredikat] = useState<'Amat Baik (A)' | 'Baik (B)' | 'Cukup (C)' | 'Kurang (D)'>('Baik (B)');
  const [formFokus, setFormFokus] = useState('Tata Kelola RKAS & Perencanaan Berbasis Data (PBD)');
  const [formTanggal, setFormTanggal] = useState('');
  const [formCatatan, setFormCatatan] = useState('');
  const [formRekomendasi, setFormRekomendasi] = useState('');

  // Distinct schools
  const distinctSchools = useMemo(() => {
    const list = new Set<string>();
    principals.forEach((p) => {
      if (p.satuanPendidikan) list.add(p.satuanPendidikan);
    });
    if (settings.schoolName) list.add(settings.schoolName);
    return Array.from(list);
  }, [principals, settings.schoolName]);

  // Filtered principals
  const filteredPrincipals = useMemo(() => {
    return principals.filter((p) => {
      if (filterStatus !== 'all' && p.statusSupervisiManajerial !== filterStatus) {
        return false;
      }
      if (filterSchool !== 'all' && p.satuanPendidikan.toLowerCase() !== filterSchool.toLowerCase()) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchNama = p.nama.toLowerCase().includes(q);
        const matchNip = p.nip.replace(/\s+/g, '').includes(q.replace(/\s+/g, ''));
        const matchSekolah = p.satuanPendidikan.toLowerCase().includes(q);
        const matchFokus = p.fokusManajerial?.toLowerCase().includes(q);
        if (!matchNama && !matchNip && !matchSekolah && !matchFokus) return false;
      }
      return true;
    });
  }, [principals, filterStatus, filterSchool, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = principals.length;
    const completed = principals.filter((p) => p.statusSupervisiManajerial === 'Selesai').length;
    const scheduled = principals.filter((p) => p.statusSupervisiManajerial === 'Terjadwal').length;
    const pending = principals.filter((p) => p.statusSupervisiManajerial === 'Belum Disupervisi').length;

    const scored = principals.filter((p) => p.skorManajerialTerakhir !== undefined && p.skorManajerialTerakhir > 0);
    const avgScore = scored.length > 0
      ? (scored.reduce((acc, curr) => acc + (curr.skorManajerialTerakhir || 0), 0) / scored.length).toFixed(1)
      : '0';

    return {
      total,
      completed,
      scheduled,
      pending,
      avgScore
    };
  }, [principals]);

  // Modal open handlers
  const handleOpenAddModal = () => {
    setEditingPrincipal(null);
    setFormNama('');
    setFormNip('');
    setFormPangkat('Pembina (IV/a)');
    setFormSekolah(distinctSchools[0] || 'SMP Negeri 1 Sidenreng Rappang');
    setFormNpsn('20108921');
    setFormTelepon('');
    setFormEmail('');
    setFormStatus('Belum Disupervisi');
    setFormSkor('');
    setFormPredikat('Baik (B)');
    setFormFokus('Tata Kelola RKAS & Perencanaan Berbasis Data (PBD)');
    setFormTanggal('');
    setFormCatatan('');
    setFormRekomendasi('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Principal) => {
    setEditingPrincipal(p);
    setFormNama(p.nama);
    setFormNip(p.nip);
    setFormPangkat(p.pangkatGolongan || 'Pembina (IV/a)');
    setFormSekolah(p.satuanPendidikan);
    setFormNpsn(p.npsn || '');
    setFormTelepon(p.telepon || '');
    setFormEmail(p.email || '');
    setFormStatus(p.statusSupervisiManajerial);
    setFormSkor(p.skorManajerialTerakhir !== undefined ? String(p.skorManajerialTerakhir) : '');
    setFormPredikat(p.predikatManajerial || 'Baik (B)');
    setFormFokus(p.fokusManajerial || 'Tata Kelola RKAS & Perencanaan Berbasis Data (PBD)');
    setFormTanggal(p.tanggalSupervisiTerakhir || '');
    setFormCatatan(p.catatanPengawas || '');
    setFormRekomendasi(p.rekomendasiManajerial || '');
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formSekolah.trim()) {
      showToast('Data Belum Lengkap', 'Nama Kepala Sekolah dan Satuan Pendidikan wajib diisi.', 'warning');
      return;
    }

    const parsedSkor = formSkor.trim() !== '' ? parseFloat(formSkor) : undefined;

    if (editingPrincipal) {
      onEditPrincipal(editingPrincipal.id, {
        nama: formNama.trim(),
        nip: formNip.trim(),
        pangkatGolongan: formPangkat,
        satuanPendidikan: formSekolah.trim(),
        npsn: formNpsn.trim(),
        telepon: formTelepon.trim(),
        email: formEmail.trim(),
        statusSupervisiManajerial: formStatus,
        skorManajerialTerakhir: parsedSkor,
        predikatManajerial: parsedSkor !== undefined ? formPredikat : undefined,
        fokusManajerial: formFokus.trim(),
        tanggalSupervisiTerakhir: formTanggal || undefined,
        catatanPengawas: formCatatan.trim(),
        rekomendasiManajerial: formRekomendasi.trim(),
        updatedAt: new Date().toISOString()
      });
      showToast('Data Diperbarui', `Profil Kepala Sekolah ${formNama} berhasil diperbarui.`, 'success');
    } else {
      onAddPrincipal({
        nama: formNama.trim(),
        nip: formNip.trim(),
        pangkatGolongan: formPangkat,
        satuanPendidikan: formSekolah.trim(),
        npsn: formNpsn.trim(),
        telepon: formTelepon.trim(),
        email: formEmail.trim(),
        statusSupervisiManajerial: formStatus,
        skorManajerialTerakhir: parsedSkor,
        predikatManajerial: parsedSkor !== undefined ? formPredikat : undefined,
        fokusManajerial: formFokus.trim(),
        tanggalSupervisiTerakhir: formTanggal || undefined,
        catatanPengawas: formCatatan.trim(),
        rekomendasiManajerial: formRekomendasi.trim()
      });
      showToast('Kepala Sekolah Ditambahkan', `Data ${formNama} berhasil disimpan ke daftar binaan.`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (p: Principal) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data Kepala Sekolah "${p.nama}" (${p.satuanPendidikan})?`)) {
      onDeletePrincipal(p.id);
      showToast('Data Dihapus', `Data ${p.nama} telah dihapus dari sistem.`, 'info');
    }
  };

  const handleOpenSupervisionModal = (principal: Principal) => {
    setEvaluatingPrincipal(principal);
    setIsEvalModalOpen(true);
  };

  const handleSaveEvaluation = (record: ManagerialEvaluationRecord) => {
    saveManagerialEvaluation(record);
    setEvaluations(getManagerialEvaluations());
    syncManagerialEvaluationToCloud(record).catch(console.warn);
    onEditPrincipal(record.principalId, {
      statusSupervisiManajerial: record.status === 'selesai' ? 'Selesai' : 'Terjadwal',
      skorManajerialTerakhir: record.finalScore,
      predikatManajerial: record.predicate,
      tanggalSupervisiTerakhir: record.date,
      catatanPengawas: record.catatanPengawas,
      rekomendasiManajerial: record.rekomendasiManajerial
    });
  };

  const handlePrintPdf = () => {
    showToast('Menyiapkan Dokumen PDF', 'Membuka dialog cetak / simpan ke PDF resmi...', 'info');
    setTimeout(() => {
      printDocumentElement(
        'printable-principals-managerial-report',
        `Data-Kepala-Sekolah-Supervisi-Manajerial-${new Date().toISOString().split('T')[0]}`,
        { orientation: 'landscape' }
      );
    }, 150);
  };

  const handleExportWord = () => {
    try {
      exportPrincipalsManagerialToWord(filteredPrincipals, evaluations, settings);
      showToast(
        'Berhasil Ekspor Word',
        `Dokumen Word (.doc) untuk ${filteredPrincipals.length} Kepala Sekolah & Supervisi Manajerial telah diunduh.`,
        'success'
      );
    } catch (err) {
      console.error('Error exporting to Word:', err);
      showToast('Gagal Ekspor Word', 'Terjadi kesalahan saat memproses berkas Word.', 'error');
    }
  };

  const handleExportIndividualWord = (p: Principal) => {
    const evalRec = evaluations.find(e => e.principalId === p.id) || getManagerialEvaluationByPrincipalId(p.id);
    if (!evalRec) {
      showToast('Belum Ada Evaluasi', `Kepala Sekolah ${p.nama} belum memiliki data evaluasi manajerial. Silakan klik "Input Supervisi 8 Menu" terlebih dahulu.`, 'warning');
      return;
    }
    try {
      exportIndividualManagerialToWord(p, evalRec, settings);
      showToast(
        'Berhasil Ekspor Word',
        `Dokumen instrumen supervisi manajerial lengkap untuk ${p.nama} telah diunduh.`,
        'success'
      );
    } catch (err) {
      console.error('Error exporting individual Word:', err);
      showToast('Gagal Ekspor Word', 'Terjadi kesalahan saat memproses berkas Word.', 'error');
    }
  };

  const printTargetEval = useMemo(() => {
    if (!printTargetPrincipal) return null;
    return (
      evaluations.find((e) => e.principalId === printTargetPrincipal.id) ||
      getManagerialEvaluationByPrincipalId(printTargetPrincipal.id)
    );
  }, [printTargetPrincipal, evaluations]);

  const handlePrintIndividualPdf = (p: Principal) => {
    const evalRec =
      evaluations.find((e) => e.principalId === p.id) ||
      getManagerialEvaluationByPrincipalId(p.id);
    if (!evalRec) {
      showToast(
        'Belum Ada Evaluasi',
        `Kepala Sekolah ${p.nama} belum memiliki data evaluasi manajerial. Silakan klik "Input Supervisi 8 Menu" terlebih dahulu.`,
        'warning'
      );
      return;
    }
    setPrintTargetPrincipal(p);
    showToast('Menyiapkan Dokumen PDF', `Membuka dialog cetak PDF resmi untuk ${p.nama}...`, 'info');
    setTimeout(() => {
      printDocumentElement(
        'printable-individual-managerial-report',
        `Supervisi-Manajerial-${p.nama.replace(/\s+/g, '_')}-${evalRec.academicYear.replace('/', '-')}`,
        { orientation: 'portrait' }
      );
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#081533] via-[#0d204a] to-[#12285a] rounded-2xl p-5 sm:p-7 text-white shadow-xl border border-blue-400/25">
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5 pb-6 border-b border-white/10">
          {/* Top metadata line */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-cyan-300 font-medium">
              <span className="font-semibold text-white">Pengawas Pembina:</span>
              <span className="text-cyan-200 font-bold">{settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'}</span>
              <span aria-hidden="true" className="text-white/30 hidden sm:inline">·</span>
              <span className="text-blue-200 font-mono tabular-nums">NIP: {settings.supervisorNip || '19820415 200801 1 007'}</span>
              <span aria-hidden="true" className="text-white/30 hidden sm:inline">·</span>
              <span className="text-indigo-200">{settings.governmentAgency || 'PEMERINTAH KABUPATEN SIDENRENG RAPPANG'}</span>
            </div>
            <div className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/8 border border-white/10 text-cyan-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Supervisi Manajerial 8 SNP &amp; PBD
            </div>
          </div>

          {/* Title & Primary Action */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 shrink-0 shadow-xs">
                  <School className="w-6 h-6 sm:w-7 h-7" />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  Data Kepala Sekolah &amp; Supervisi Manajerial
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed max-w-4xl">
                Direktori kepemimpinan satuan pendidikan binaan: instrumen pemantauan 8 Standar Nasional Pendidikan (SNP),
                audit Perencanaan Berbasis Data (PBD/RKAS), pengelolaan kinerja guru di PMM, serta penjadwalan supervisi manajerial.
              </p>
            </div>

            {/* Action buttons */}
            <div className="shrink-0 flex flex-wrap items-center gap-2.5">
              <button
                onClick={handlePrintPdf}
                className="inline-flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl transition-all border border-white/20 shadow-xs cursor-pointer backdrop-blur-xs whitespace-nowrap hover:scale-[1.02] active:scale-[0.98]"
                title="Cetak atau Simpan ke format PDF resmi dokumen Data Kepala Sekolah & Supervisi Manajerial"
              >
                <Printer className="w-4 h-4 text-cyan-300" />
                <span>Cetak PDF</span>
              </button>

              <button
                onClick={handleExportWord}
                className="inline-flex items-center gap-2 px-4 py-3 bg-blue-600/90 hover:bg-blue-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all border border-blue-400/40 shadow-xs cursor-pointer backdrop-blur-xs whitespace-nowrap hover:scale-[1.02] active:scale-[0.98]"
                title="Unduh rekapitulasi lengkap Data Kepala Sekolah & Supervisi Manajerial ke Microsoft Word (.doc)"
              >
                <FileDown className="w-4 h-4 text-cyan-200" />
                <span>Ekspor Word (.doc)</span>
              </button>

              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 hover:from-cyan-300 hover:to-blue-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
              >
                <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
                <span>+ Tambah Kepala Sekolah</span>
              </button>

              {onNavigateToCalendar && (
                <button
                  onClick={onNavigateToCalendar}
                  className="inline-flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all border border-white/15 cursor-pointer backdrop-blur-xs whitespace-nowrap"
                >
                  <Calendar className="w-4 h-4 text-cyan-300" />
                  <span>Lihat di Kalender Agenda</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live KPI Statistics Strip */}
        <div className="relative z-10 pt-5 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 rounded-xl bg-white/6 border border-white/10 backdrop-blur-xs">
            <span className="text-[11px] font-medium text-blue-200">Total Kepala Sekolah</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-white tabular-nums">{stats.total}</span>
              <span className="text-[11px] text-cyan-300 font-medium">sekolah binaan</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/6 border border-white/10 backdrop-blur-xs">
            <span className="text-[11px] font-medium text-emerald-200">Sudah Disupervisi</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-emerald-300 tabular-nums">{stats.completed}</span>
              <span className="text-[11px] text-emerald-200/80 font-medium tabular-nums">
                ({stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%)
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/6 border border-white/10 backdrop-blur-xs">
            <span className="text-[11px] font-medium text-amber-200">Terjadwal Supervisi</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-amber-300 tabular-nums">{stats.scheduled}</span>
              <span className="text-[11px] text-amber-200/80 font-medium">agenda kunjungan</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/6 border border-white/10 backdrop-blur-xs">
            <span className="text-[11px] font-medium text-indigo-200">Rata-Rata Skor Manajerial</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-indigo-300 tabular-nums">{stats.avgScore}</span>
              <span className="text-[11px] text-indigo-200/80 font-medium">skala 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Control & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama kepala sekolah, NIP, sekolah, atau fokus..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        {/* Filter dropdowns & View mode */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="all">Semua Status Supervisi</option>
              <option value="Selesai">Selesai Disupervisi</option>
              <option value="Terjadwal">Terjadwal di Kalender</option>
              <option value="Belum Disupervisi">Belum Disupervisi</option>
            </select>
          </div>

          {/* School filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Sekolah:</span>
            <select
              value={filterSchool}
              onChange={(e) => setFilterSchool(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="all">Semua Satuan Pendidikan</option>
              {distinctSchools.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Kartu"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Tabel"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Content: Grid or Table */}
      {filteredPrincipals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <School className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">Tidak ada data Kepala Sekolah yang sesuai</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Gunakan filter yang berbeda atau klik tombol Tambah Kepala Sekolah untuk mendaftarkan pimpinan sekolah binaan baru.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kepala Sekolah Baru</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPrincipals.map((p) => {
            const isDone = p.statusSupervisiManajerial === 'Selesai';
            const isScheduled = p.statusSupervisiManajerial === 'Terjadwal';
            const evalRecord = evaluations.find((e) => e.principalId === p.id);

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-purple-300 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Card Header: School name & Status badge */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
                        <School className="w-3.5 h-3.5 text-purple-600" />
                        <span>{p.satuanPendidikan}</span>
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">{p.nama}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1 font-mono">
                        <span>NIP: {p.nip || '-'}</span>
                        {p.pangkatGolongan && (
                          <>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span className="text-slate-600 font-sans font-medium">{p.pangkatGolongan}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-full flex items-center gap-1.5 shrink-0 ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : isScheduled
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Selesai Disupervisi</span>
                        </>
                      ) : isScheduled ? (
                        <>
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>Terjadwal di Kalender</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Belum Disupervisi</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Score & Predicate Highlight if Completed */}
                  {isDone && p.skorManajerialTerakhir !== undefined && (
                    <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 via-indigo-50 to-emerald-50 border border-purple-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[11px] text-purple-900 font-bold">Hasil Supervisi Manajerial 8 Menu</span>
                          <div className="text-sm font-black text-slate-900">
                            {p.skorManajerialTerakhir} <span className="text-xs font-bold text-purple-700">({p.predikatManajerial || 'Baik (B)'})</span>
                          </div>
                        </div>
                      </div>
                      {p.tanggalSupervisiTerakhir && (
                        <span className="text-[11px] text-slate-600 font-medium">
                          Tgl: {p.tanggalSupervisiTerakhir}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Managerial Focus & Highlights */}
                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium">Fokus Pengawasan Manajerial:</span>
                      <p className="font-semibold text-slate-800 mt-0.5 leading-relaxed">
                        {p.fokusManajerial || 'Tata Kelola 8 SNP, RKAS & PBD Rapor Pendidikan'}
                      </p>
                    </div>

                    {p.catatanPengawas && (
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed text-[11px]">
                        <strong>Catatan Pengawas:</strong> {p.catatanPengawas}
                      </div>
                    )}

                    {evalRecord && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Status 8 Menu:</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>8 Dimensi Terisi (Skala 1 - 4)</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact and Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    {p.telepon && (
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {p.telepon}
                      </span>
                    )}
                    {p.email && (
                      <span className="flex items-center gap-1 truncate max-w-[140px]" title={p.email}>
                        <Mail className="w-3 h-3 text-slate-400" />
                        {p.email}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Primary Action: Input Supervisi 8 Menu */}
                    <button
                      onClick={() => handleOpenSupervisionModal(p)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                      title="Input & Evaluasi Supervisi Manajerial 8 Menu (Skala 1 - 4)"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{evalRecord ? 'Input / Edit 8 Menu' : 'Input Supervisi 8 Menu'}</span>
                    </button>

                    {/* Schedule Managerial Button */}
                    <button
                      onClick={() => onScheduleManagerialSupervision(p)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      title="Jadwalkan agenda supervisi manajerial untuk Kepala Sekolah ini"
                    >
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Jadwal</span>
                    </button>

                    {evalRecord && (
                      <button
                        onClick={() => handlePrintIndividualPdf(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-rose-200"
                        title="Unduh / Cetak Laporan Supervisi Manajerial Lengkap ke PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-rose-600" />
                        <span>PDF</span>
                      </button>
                    )}

                    {evalRecord && (
                      <button
                        onClick={() => handleExportIndividualWord(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-blue-200"
                        title="Unduh Laporan Supervisi Manajerial Lengkap ke Word (.doc)"
                      >
                        <FileDown className="w-3.5 h-3.5 text-blue-600" />
                        <span>Word</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit Data Kepala Sekolah"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(p)}
                      className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Data Kepala Sekolah"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Nama &amp; NIP Kepala Sekolah</th>
                  <th className="px-4 py-3">Satuan Pendidikan</th>
                  <th className="px-4 py-3">Status Supervisi</th>
                  <th className="px-4 py-3">Skor &amp; Predikat</th>
                  <th className="px-4 py-3">Fokus Manajerial</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPrincipals.map((p) => {
                  const isDone = p.statusSupervisiManajerial === 'Selesai';
                  const isScheduled = p.statusSupervisiManajerial === 'Terjadwal';
                  const evalRecord = evaluations.find((e) => e.principalId === p.id);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{p.nama}</div>
                        <div className="text-[11px] text-slate-500 font-mono">NIP: {p.nip || '-'}</div>
                        {p.pangkatGolongan && (
                          <div className="text-[10px] text-slate-400">{p.pangkatGolongan}</div>
                        )}
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-800">
                        <div>{p.satuanPendidikan}</div>
                        {p.npsn && <div className="text-[11px] text-slate-400 font-mono">NPSN: {p.npsn}</div>}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : isScheduled
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isDone ? 'Selesai' : isScheduled ? 'Terjadwal' : 'Belum'}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-semibold">
                        {p.skorManajerialTerakhir !== undefined ? (
                          <div className="tabular-nums text-slate-900">
                            {p.skorManajerialTerakhir}{' '}
                            <span className="text-[11px] font-bold text-emerald-700">({p.predikatManajerial || 'Baik'})</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-normal">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3 max-w-xs truncate text-slate-600" title={p.fokusManajerial}>
                        {p.fokusManajerial || '-'}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenSupervisionModal(p)}
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 border border-purple-200"
                            title="Input Supervisi Manajerial 8 Menu"
                          >
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            <span>Input 8 Menu</span>
                          </button>
                          <button
                            onClick={() => onScheduleManagerialSupervision(p)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-bold transition-colors cursor-pointer"
                            title="Jadwalkan agenda supervisi manajerial"
                          >
                            + Jadwal
                          </button>
                          {evalRecord && (
                            <button
                              onClick={() => handlePrintIndividualPdf(p)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 border border-rose-200"
                              title="Unduh / Cetak Laporan Supervisi Manajerial Lengkap ke PDF"
                            >
                              <Printer className="w-3 h-3 text-rose-600" />
                              <span>PDF</span>
                            </button>
                          )}
                          {evalRecord && (
                            <button
                              onClick={() => handleExportIndividualWord(p)}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 border border-blue-200"
                              title="Unduh Laporan Supervisi Manajerial Lengkap ke Word (.doc)"
                            >
                              <FileDown className="w-3 h-3 text-blue-600" />
                              <span>Word</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Edit data"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Hapus data"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. MODAL TAMBAH / EDIT KEPALA SEKOLAH */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 my-8 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <School className="w-5 h-5 text-cyan-300" />
                <h3 className="text-base font-bold">
                  {editingPrincipal ? 'Edit Data Kepala Sekolah & Evaluasi Manajerial' : 'Tambah Kepala Sekolah Binaan Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto text-xs">
              {/* Nama & Gelar */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lengkap &amp; Gelar Akademik <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dra. Hj. Nurhasanah, M.Pd."
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* NIP & Pangkat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    NIP / NIK Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 19720815 199802 2 003"
                    value={formNip}
                    onChange={(e) => setFormNip(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Pangkat / Golongan Ruang
                  </label>
                  <select
                    value={formPangkat}
                    onChange={(e) => setFormPangkat(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="Pembina Utama Muda (IV/c)">Pembina Utama Muda (IV/c)</option>
                    <option value="Pembina Tk. I (IV/b)">Pembina Tk. I (IV/b)</option>
                    <option value="Pembina (IV/a)">Pembina (IV/a)</option>
                    <option value="Penata Tk. I (III/d)">Penata Tk. I (III/d)</option>
                    <option value="Penata (III/c)">Penata (III/c)</option>
                    <option value="Lainnya">Lainnya / Guru Penggerak</option>
                  </select>
                </div>
              </div>

              {/* Satuan Pendidikan & NPSN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Satuan Pendidikan Binaan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SMP Negeri 1 Sidenreng Rappang"
                    value={formSekolah}
                    onChange={(e) => setFormSekolah(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    NPSN Sekolah
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 20108921"
                    value={formNpsn}
                    onChange={(e) => setFormNpsn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Telepon & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    No. Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={formTelepon}
                    onChange={(e) => setFormTelepon(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email Akun Belajar.id
                  </label>
                  <input
                    type="email"
                    placeholder="kepsek@admin.smp.belajar.id"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Status Supervisi & Nilai */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-900 block">Status Supervisi Manajerial &amp; Capaian</span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                    >
                      <option value="Belum Disupervisi">Belum Disupervisi</option>
                      <option value="Terjadwal">Terjadwal di Kalender</option>
                      <option value="Selesai">Selesai Disupervisi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Skor Manajerial (0-100)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="Contoh: 94.5"
                      value={formSkor}
                      onChange={(e) => setFormSkor(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Predikat</label>
                    <select
                      value={formPredikat}
                      onChange={(e) => setFormPredikat(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold"
                    >
                      <option value="Amat Baik (A)">Amat Baik (A)</option>
                      <option value="Baik (B)">Baik (B)</option>
                      <option value="Cukup (C)">Cukup (C)</option>
                      <option value="Kurang (D)">Kurang (D)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Tanggal Pelaksanaan Supervisi</label>
                  <input
                    type="date"
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full sm:w-1/2 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* Fokus Pengawasan Manajerial */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Fokus Pengawasan Manajerial
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Tata Kelola RKAS & Perencanaan Berbasis Data (PBD Rapor Pendidikan)"
                  value={formFokus}
                  onChange={(e) => setFormFokus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* Catatan Pengawas */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Evaluasi Pengawas Pembina
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan hasil pengamatan terhadap tata kelola 8 SNP, transparansi dana BOS, iklim sekolah..."
                  value={formCatatan}
                  onChange={(e) => setFormCatatan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* Rekomendasi Manajerial */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Rekomendasi Pembenahan &amp; Tindak Lanjut
                </label>
                <textarea
                  rows={2}
                  placeholder="Rekomendasi tindak lanjut bagi Kepala Sekolah untuk siklus berikutnya..."
                  value={formRekomendasi}
                  onChange={(e) => setFormRekomendasi(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  {editingPrincipal ? 'Simpan Perubahan' : 'Tambahkan Kepala Sekolah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Managerial 8-Menu Supervision Input Modal */}
      {evaluatingPrincipal && (
        <ManagerialSupervisionModal
          isOpen={isEvalModalOpen}
          onClose={() => {
            setIsEvalModalOpen(false);
            setEvaluatingPrincipal(null);
          }}
          principal={evaluatingPrincipal}
          existingEvaluation={getManagerialEvaluationByPrincipalId(evaluatingPrincipal.id)}
          settings={settings}
          onSaveEvaluation={handleSaveEvaluation}
          showToast={showToast}
        />
      )}

      {/* Hidden Printable Report for PDF Export */}
      <div id="printable-principals-managerial-report" className="hidden bg-white text-slate-900 p-8 font-sans">
        {/* KOP DINAS */}
        <div className="text-center border-b-2 border-slate-900 pb-3 mb-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            {settings.governmentAgency || 'PEMERINTAH KABUPATEN SIDENRENG RAPPANG'}
          </h3>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            DINAS PENDIDIKAN DAN KEBUDAYAAN
          </h4>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Alamat: Kompleks SKPD Jl. Harapan Baru No. 1, Pangkajene, Kab. Sidenreng Rappang, Sulawesi Selatan
          </p>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-base font-black uppercase text-slate-900">
            REKAPITULASI DATA KEPALA SEKOLAH &amp; LAPORAN SUPERVISI MANAJERIAL
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Instrumen Pemantauan 8 Dimensi Pengelolaan Satuan Pendidikan (Skala 1 – 4 / 138 Indikator Mutu)
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Wilayah Binaan Pengawas: <strong>{settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'}</strong> (NIP: {settings.supervisorNip || '19820415 200801 1 007'})
          </p>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-4 gap-3 mb-6 text-center text-xs">
          <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg">
            <span className="block text-xl font-black text-slate-900">{stats.total}</span>
            <span className="text-[10px] uppercase font-bold text-slate-500">Total Kepala Sekolah</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg">
            <span className="block text-xl font-black text-emerald-800">{stats.completed}</span>
            <span className="text-[10px] uppercase font-bold text-emerald-700">Supervisi Selesai</span>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg">
            <span className="block text-xl font-black text-blue-800">{stats.scheduled + stats.pending}</span>
            <span className="text-[10px] uppercase font-bold text-blue-700">Terjadwal / Belum</span>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-300 rounded-lg">
            <span className="block text-xl font-black text-purple-900">{stats.avgScore}</span>
            <span className="text-[10px] uppercase font-bold text-purple-700">Rata-rata Skor (0–100)</span>
          </div>
        </div>

        {/* Main Table */}
        <table className="w-full text-left border-collapse text-[11px] mb-8">
          <thead>
            <tr className="bg-slate-100 border-y border-slate-300 text-slate-800">
              <th className="p-2 border border-slate-300 w-8 text-center font-bold">No</th>
              <th className="p-2 border border-slate-300 font-bold">Nama &amp; NIP Kepala Sekolah</th>
              <th className="p-2 border border-slate-300 font-bold">Satuan Pendidikan</th>
              <th className="p-2 border border-slate-300 w-24 text-center font-bold">Status</th>
              <th className="p-2 border border-slate-300 w-24 text-center font-bold">Nilai &amp; Predikat</th>
              <th className="p-2 border border-slate-300 w-44 font-bold">Capaian 8 Dimensi</th>
              <th className="p-2 border border-slate-300 font-bold">Catatan &amp; Rekomendasi Pengawas</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrincipals.map((p, idx) => {
              const evalRec = evaluations.find((e) => e.principalId === p.id);
              const isDone = p.statusSupervisiManajerial === 'Selesai';
              return (
                <tr key={p.id} className="border-b border-slate-300">
                  <td className="p-2 border border-slate-300 text-center font-bold text-slate-600 align-top">{idx + 1}</td>
                  <td className="p-2 border border-slate-300 align-top">
                    <div className="font-bold text-slate-900">{p.nama}</div>
                    <div className="text-[10px] text-slate-600">NIP: {p.nip || '-'}</div>
                    <div className="text-[10px] text-slate-500">{p.pangkatGolongan || '-'}</div>
                  </td>
                  <td className="p-2 border border-slate-300 align-top">
                    <div className="font-semibold text-slate-900">{p.satuanPendidikan}</div>
                    <div className="text-[10px] text-slate-500">NPSN: {p.npsn || '-'}</div>
                  </td>
                  <td className="p-2 border border-slate-300 text-center align-top">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      isDone ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}>
                      {p.statusSupervisiManajerial || 'Belum'}
                    </span>
                    <div className="text-[9px] text-slate-500 mt-1">{p.tanggalSupervisiTerakhir || '-'}</div>
                  </td>
                  <td className="p-2 border border-slate-300 text-center align-top">
                    {p.skorManajerialTerakhir !== undefined ? (
                      <div>
                        <span className="text-sm font-black text-slate-900">{p.skorManajerialTerakhir}</span>
                        <div className="text-[10px] font-bold text-emerald-700">{p.predikatManajerial}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="p-2 border border-slate-300 align-top text-[10px] bg-slate-50/50">
                    {evalRec && evalRec.dimensionScores ? (
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] leading-tight">
                        <div>Kur: <strong>{evalRec.dimensionScores.kurikulum?.percentage || 0}%</strong></div>
                        <div>Keu: <strong>{evalRec.dimensionScores.keuangan?.percentage || 0}%</strong></div>
                        <div>Sis: <strong>{evalRec.dimensionScores.kesiswaan?.percentage || 0}%</strong></div>
                        <div>Hum: <strong>{evalRec.dimensionScores.humas?.percentage || 0}%</strong></div>
                        <div>PTK: <strong>{evalRec.dimensionScores.ptk?.percentage || 0}%</strong></div>
                        <div>Adm: <strong>{evalRec.dimensionScores.administrasi?.percentage || 0}%</strong></div>
                        <div>Sar: <strong>{evalRec.dimensionScores.sarpras?.percentage || 0}%</strong></div>
                        <div>Bud: <strong>{evalRec.dimensionScores.lingkungan?.percentage || 0}%</strong></div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Belum ada evaluasi</span>
                    )}
                  </td>
                  <td className="p-2 border border-slate-300 align-top text-[10px] leading-relaxed">
                    <div className="mb-1">
                      <strong className="text-blue-700">Temuan:</strong> {p.catatanPengawas || p.fokusManajerial || '-'}
                    </div>
                    <div>
                      <strong className="text-emerald-700">Rekomendasi:</strong> {p.rekomendasiManajerial || '-'}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Official Signature */}
        <div className="flex justify-between items-start text-xs pt-4 border-t border-slate-200">
          <div>
            <p className="text-slate-500 text-[11px]">Dicetak melalui Sistem Informasi Supervisi INSPIRO</p>
          </div>
          <div className="text-left w-72">
            <p>{settings.schoolCity || 'Kabupaten Sidenreng Rappang'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold text-slate-900 mt-1">Pengawas Sekolah Pembina,</p>
            <div className="h-16"></div>
            <p className="font-bold underline text-slate-900">{settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'}</p>
            <p className="text-slate-600">NIP. {settings.supervisorNip || '19820415 200801 1 007'}</p>
            <p className="text-[10px] text-slate-500">Pembina Tk. I / IV.b</p>
          </div>
        </div>
      </div>

      {/* Hidden Printable Report for Individual Principal PDF Export */}
      {printTargetPrincipal && printTargetEval && (
        <div id="printable-individual-managerial-report" className="hidden bg-white text-slate-900 p-8 font-sans">
          {/* KOP DINAS */}
          <div className="text-center border-b-2 border-slate-900 pb-3 mb-5">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-700">
              {settings.governmentAgency || 'PEMERINTAH KABUPATEN SIDENRENG RAPPANG'}
            </h3>
            <h4 className="text-xs uppercase tracking-widest font-semibold text-slate-600">
              DINAS PENDIDIKAN DAN KEBUDAYAAN
            </h4>
            <h2 className="text-base font-black uppercase text-slate-900 mt-1">
              INSTRUMEN SUPERVISI MANAJERIAL KEPALA SEKOLAH
            </h2>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Evaluasi 8 Dimensi Manajemen Sekolah Berdasarkan Standar Pengelolaan Pendidikan (Skala 1 – 4)
            </p>
          </div>

          {/* Identity Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-5 bg-slate-50 p-4 rounded-lg border border-slate-300">
            <div className="space-y-1">
              <div className="flex">
                <span className="w-36 font-semibold text-slate-600">Nama Kepala Sekolah</span>
                <span className="font-bold text-slate-900">: {printTargetPrincipal.nama}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold text-slate-600">NIP</span>
                <span className="text-slate-800">: {printTargetPrincipal.nip || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold text-slate-600">Pangkat / Golongan</span>
                <span className="text-slate-800">: {printTargetPrincipal.pangkatGolongan || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold text-slate-600">Satuan Pendidikan</span>
                <span className="font-bold text-slate-900">: {printTargetPrincipal.satuanPendidikan}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex">
                <span className="w-36 font-semibold text-slate-600">Nama Pengawas Pembina</span>
                <span className="font-bold text-slate-900">: {settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold text-slate-600">NIP Pengawas</span>
                <span className="text-slate-800">: {settings.supervisorNip || '19820415 200801 1 007'}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold text-slate-600">Hari / Tanggal Supervisi</span>
                <span className="text-slate-800">: {new Date(printTargetEval.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold text-slate-600">Semester / Tahun Ajaran</span>
                <span className="text-slate-800">: Semester {printTargetEval.semester} / TA {printTargetEval.academicYear}</span>
              </div>
            </div>
          </div>

          {/* Rekap Nilai Bar */}
          <div className="p-3 mb-5 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
            <div>
              <p className="text-blue-900 font-bold uppercase">HASIL EVALUASI MANAJERIAL KESELURUHAN (138 INDIKATOR)</p>
              <p className="text-slate-600 mt-0.5">Total Skor: {printTargetEval.totalScore} dari maksimal {MAX_MANAGERIAL_RAW_SCORE} poin ({TOTAL_MANAGERIAL_ITEMS} Indikator)</p>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-2xl font-black text-blue-900">{printTargetEval.finalScore}</span>
                <span className="text-xs font-semibold text-slate-500">/ 100</span>
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-600 text-white">
                Predikat: {printTargetEval.predicate}
              </span>
            </div>
          </div>

          {/* 8 Dimensions Tables */}
          <div className="space-y-4">
            {MANAGERIAL_DIMENSIONS.map((dim) => {
              const dimStat = printTargetEval.dimensionScores?.[dim.key] || { total: 0, max: dim.items.length * 4, percentage: 0, average: 0 };
              return (
                <div key={dim.key} className="border border-slate-300 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 flex items-center justify-between">
                    <h4 className="text-[11px] font-bold text-slate-900 uppercase">
                      {dim.number}. {dim.title} ({dim.items.length} Indikator)
                    </h4>
                    <span className="text-[11px] font-semibold text-blue-700">
                      Skor: {dimStat.total} / {dimStat.max} ({dimStat.percentage}%) - Rata-rata: {dimStat.average}
                    </span>
                  </div>
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                        <th className="p-1.5 w-8 text-center font-bold">No</th>
                        <th className="p-1.5 font-bold">Indikator Kinerja &amp; Bukti Fisik</th>
                        <th className="p-1.5 w-14 text-center font-bold">Skala (1-4)</th>
                        <th className="p-1.5 w-52 font-bold">Deskripsi Capaian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {dim.items.map((item) => {
                        const val = printTargetEval.scores[item.id] || 0;
                        const rubricText = val > 0 ? item.rubrics[val as 1 | 2 | 3 | 4] : 'Belum dinilai';
                        return (
                          <tr key={item.id}>
                            <td className="p-1.5 text-center align-top font-semibold text-slate-500">{item.number}</td>
                            <td className="p-1.5 align-top">
                              <p className="font-semibold text-slate-900 leading-tight">{item.text}</p>
                              {item.evidenceGuidance && (
                                <p className="text-[9px] text-slate-500 mt-0.5 italic">Bukti: {item.evidenceGuidance}</p>
                              )}
                              {printTargetEval.notes?.[item.id] && (
                                <p className="text-[9px] text-blue-700 mt-0.5 font-medium">Catatan: {printTargetEval.notes[item.id]}</p>
                              )}
                            </td>
                            <td className="p-1.5 text-center align-top">
                              <span className="inline-block w-6 h-6 leading-6 rounded font-bold text-white bg-slate-800 text-center text-[11px]">
                                {val || '-'}
                              </span>
                            </td>
                            <td className="p-1.5 align-top text-slate-700 text-[10px] leading-snug">
                              {rubricText}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>

          {/* Findings and Recommendations */}
          <div className="mt-5 grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-300">
              <h5 className="font-bold text-slate-900 mb-1">A. Catatan Temuan Lapangan Pengawas:</h5>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-[11px]">
                {printTargetEval.catatanPengawas || 'Semua dokumen manajerial 8 standar telah diperiksa dan terverifikasi sesuai regulasi.'}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-300">
              <h5 className="font-bold text-slate-900 mb-1">B. Rekomendasi Tindak Lanjut Manajerial:</h5>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-[11px]">
                {printTargetEval.rekomendasiManajerial || 'Lanjutkan pemenuhan standar mutu dan pemutakhiran data secara berkelanjutan.'}
              </p>
            </div>
          </div>

          {/* Signature Block */}
          <div className="mt-8 pt-4 grid grid-cols-2 text-xs text-center border-t border-slate-300">
            <div>
              <p>Mengetahui / Memeriksa,</p>
              <p className="font-bold text-slate-900 mt-1">Kepala Satuan Pendidikan Yang Disupervisi,</p>
              <div className="h-16"></div>
              <p className="font-bold underline text-slate-900">{printTargetPrincipal.nama}</p>
              <p className="text-slate-600">NIP. {printTargetPrincipal.nip || '-'}</p>
            </div>
            <div>
              <p>{settings.schoolCity || 'Kabupaten Sidenreng Rappang'}, {new Date(printTargetEval.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-bold text-slate-900 mt-1">Pengawas Sekolah Pembina,</p>
              <div className="h-16"></div>
              <p className="font-bold underline text-slate-900">{settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'}</p>
              <p className="text-slate-600">NIP. {settings.supervisorNip || '19820415 200801 1 007'}</p>
              <p className="text-[10px] text-slate-500">Pembina Tk. I / IV.b</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
