/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Target,
  Plus,
  Search,
  School,
  User,
  Calendar,
  Printer,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  Laptop,
  HeartHandshake,
  AlertTriangle,
  Lightbulb,
  X,
  FileSpreadsheet,
  Check,
  ChevronRight,
  Filter,
  TrendingUp,
  Award,
  Zap,
  HelpCircle,
  FileText
} from 'lucide-react';
import {
  QuickWinsRecord,
  QuickWinsActionItem,
  QuickWinsPhase,
  QuickWinsItemStatus,
  Principal,
  AppSettings
} from '../types/inspiro';
import { exportQuickWinsToWord } from '../utils/storage';
import { printDocumentElement } from '../utils/documentExport';
import { DEFAULT_SIDRAP_LOGO, DEFAULT_TUTWURI_LOGO } from '../data/defaultLogos';
import { generateQuickWinsPlanAI } from '../services/aiQuickWinsGenerator';

interface QuickWinsViewProps {
  records: QuickWinsRecord[];
  principals: Principal[];
  settings: AppSettings;
  onSaveRecord: (record: QuickWinsRecord) => void;
  onDeleteRecord: (id: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

const COMMON_PILLARS = [
  'Pembelajaran Berdiferensiasi & Pemanfaatan Platform Digital (PMM/AI)',
  'Penguatan Literasi & Numerasi Berbasis Rapor Pendidikan',
  'Aktivasi Komunitas Belajar (Kombel) Ramah & Kolaboratif',
  'Iklim Keamanan Sekolah & Penerapan Disiplin Positif',
  'Kepemimpinan Instruksional & Tata Kelola Pembelajaran'
];

export const QuickWinsView: React.FC<QuickWinsViewProps> = ({
  records,
  principals,
  settings,
  onSaveRecord,
  onDeleteRecord,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [phaseFilter, setPhaseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<QuickWinsRecord | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState<'info' | 'items' | 'notes'>('info');

  // Form State
  const [formData, setFormData] = useState<Partial<QuickWinsRecord>>({
    title: '',
    schoolName: '',
    schoolNpsn: '',
    headmasterName: '',
    headmasterNip: '',
    headmasterRank: '',
    supervisorName: settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    supervisorNip: settings.supervisorNip || '19830819 201001 1 002',
    supervisorRole: 'Pengawas Sekolah Pembina',
    supervisorRank: settings.supervisorRank || 'Penata Tk. I / III.d',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    startDate: new Date().toISOString().split('T')[0],
    targetPillar: COMMON_PILLARS[0],
    rpbStrategy: 'Pemacu Perubahan (Catalyst)',
    beforeCondition: '',
    expectedImpact: '',
    supervisorNotes: '',
    items: [],
    status: 'berjalan'
  });

  // Calculate Metrics
  const metrics = useMemo(() => {
    const totalRecords = records.length;
    let totalItems = 0;
    let tuntasItems = 0;
    let butuhBantuanItems = 0;
    let prosesItems = 0;

    records.forEach((r) => {
      r.items.forEach((item) => {
        totalItems++;
        if (item.status === 'tuntas') tuntasItems++;
        else if (item.status === 'butuh_bantuan') butuhBantuanItems++;
        else if (item.status === 'proses') prosesItems++;
      });
    });

    const completionRate = totalItems > 0 ? Math.round((tuntasItems / totalItems) * 100) : 0;
    return {
      totalRecords,
      totalItems,
      tuntasItems,
      butuhBantuanItems,
      prosesItems,
      completionRate
    };
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchSearch =
        rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.headmasterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.targetPillar.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.items.some((i) =>
          i.actionTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.pic.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchSchool = schoolFilter === 'all' || rec.schoolName === schoolFilter;

      const matchPhase =
        phaseFilter === 'all' ||
        rec.items.some((i) => i.phase === phaseFilter);

      const matchStatus =
        statusFilter === 'all' ||
        rec.items.some((i) => i.status === statusFilter);

      return matchSearch && matchSchool && matchPhase && matchStatus;
    });
  }, [records, searchTerm, schoolFilter, phaseFilter, statusFilter]);

  // Unique schools for filter
  const uniqueSchools = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => set.add(r.schoolName));
    return Array.from(set);
  }, [records]);

  // Handle open create new
  const handleOpenNew = () => {
    const defaultPrincipal = principals[0];
    setFormData({
      id: `qw-${Date.now()}`,
      title: 'Peta Langkah Nyata 30-60-90 Hari Pendampingan Satuan Pendidikan',
      schoolName: defaultPrincipal ? defaultPrincipal.satuanPendidikan : (settings.schoolName || 'UPT SDN 6 Amparita'),
      schoolNpsn: defaultPrincipal?.npsn || '20108921',
      headmasterName: defaultPrincipal?.nama || 'Hj. Netti, S.Pd.I., M.Pd.I.',
      headmasterNip: defaultPrincipal?.nip || '19740512 199803 2 004',
      headmasterRank: defaultPrincipal?.pangkatGolongan || 'Pembina / IV.a',
      supervisorName: settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
      supervisorNip: settings.supervisorNip || '19830819 201001 1 002',
      supervisorRole: 'Pengawas Sekolah Pembina',
      supervisorRank: settings.supervisorRank || 'Penata Tk. I / III.d',
      academicYear: '2026/2027',
      semester: 'Ganjil',
      startDate: new Date().toISOString().split('T')[0],
      targetPillar: COMMON_PILLARS[0],
      rpbStrategy: 'Pemacu Perubahan (Catalyst)',
      beforeCondition: 'Metode pembelajaran masih dominan ceramah satu arah dan LKPD seragam.',
      expectedImpact: '85% murid aktif dalam kelompok berdiferensiasi dan tercipta 3 modul ajar kolaboratif.',
      supervisorNotes: 'Pengawas Pembina siap mendampingi sebagai mitra dialog dan co-pilot transformasi.',
      status: 'berjalan',
      items: [
        {
          id: `item-${Date.now()}-1`,
          phase: '30-days',
          phaseTitle: 'Fase 1 (Hari 1–30): Fondasi & Kemenangan Cepat (Quick Wins)',
          week: 'Minggu 1–2',
          actionTitle: 'Asesmen Awal & Pemetaan Kesiapan Belajar Murid',
          actionDetail: 'Guru membagikan kuesioner singkat atau lembar emotikon untuk memetakan kesiapan murid.',
          pic: 'Guru Sasaran & Wali Kelas',
          evidenceTarget: 'Matriks Pemetaan Kesiapan Belajar Murid',
          status: 'tuntas',
          notes: ''
        },
        {
          id: `item-${Date.now()}-2`,
          phase: '30-days',
          phaseTitle: 'Fase 1 (Hari 1–30): Fondasi & Kemenangan Cepat (Quick Wins)',
          week: 'Minggu 3–4',
          actionTitle: 'Penyusunan 1 Modul Diferensiasi Prototipe di Kombel',
          actionDetail: 'Merancang modul berjenjang bersama rekan sejawat di Kombel sekolah mingguan.',
          pic: 'Tim Kombel Sekolah',
          evidenceTarget: 'Modul Ajar Diferensiasi Terverifikasi',
          status: 'proses',
          notes: ''
        },
        {
          id: `item-${Date.now()}-3`,
          phase: '60-days',
          phaseTitle: 'Fase 2 (Hari 31–60): Eksperimen Kelas & Penguatan Berkelanjutan',
          week: 'Minggu 5–6',
          actionTitle: 'Uji Coba Stasiun Belajar Berdiferensiasi di Kelas',
          actionDetail: 'Mempraktikkan modul diferensiasi di kelas dengan rotasi 3 kelompok belajar.',
          pic: 'Guru Sasaran & Pengawas Pembina',
          evidenceTarget: 'Dokumentasi Foto Kelas & Lembar Observasi',
          status: 'proses',
          notes: ''
        },
        {
          id: `item-${Date.now()}-4`,
          phase: '60-days',
          phaseTitle: 'Fase 2 (Hari 31–60): Eksperimen Kelas & Penguatan Berkelanjutan',
          week: 'Minggu 7–8',
          actionTitle: 'Refleksi Tengah Siklus & Coaching Pengawas',
          actionDetail: 'Diskusi refleksi bersama Pengawas Pembina untuk mengurai kendala di kelas.',
          pic: 'Kepala Sekolah & Pengawas Pembina',
          evidenceTarget: 'Catatan Supervisi Klinis Berbasis Umpan Balik Positif',
          status: 'butuh_bantuan',
          notes: ''
        },
        {
          id: `item-${Date.now()}-5`,
          phase: '90-days',
          phaseTitle: 'Fase 3 (Hari 61–90): Pembudayaan, Pengimbasan & Bukti Dampak',
          week: 'Minggu 9–10',
          actionTitle: 'Aktivasi Bank Modul Ajar di Google Drive Bersama',
          actionDetail: 'Menghimpun seluruh modul ajar berdiferensiasi yang telah diuji coba.',
          pic: 'Tim Kurikulum Sekolah',
          evidenceTarget: 'Tautan Google Drive Bank Modul Sekolah',
          status: 'belum',
          notes: ''
        },
        {
          id: `item-${Date.now()}-6`,
          phase: '90-days',
          phaseTitle: 'Fase 3 (Hari 61–90): Pembudayaan, Pengimbasan & Bukti Dampak',
          week: 'Minggu 11–12',
          actionTitle: 'Gelar Karya Pembelajaran & Evaluasi Dampak 90 Hari',
          actionDetail: 'Pameran mini karya murid dan refleksi evaluasi dampak sebelum vs sesudah 90 hari.',
          pic: 'Kepala Sekolah, Seluruh Guru, & Pengawas Pembina',
          evidenceTarget: 'Laporan Komprehensif Dampak 90 Hari',
          status: 'belum',
          notes: ''
        }
      ]
    });
    setActiveEditorTab('info');
    setIsEditorOpen(true);
  };

  // Handle open edit
  const handleOpenEdit = (rec: QuickWinsRecord) => {
    setFormData({ ...rec });
    setActiveEditorTab('info');
    setIsEditorOpen(true);
  };

  // Handle open detail preview
  const handleOpenDetail = (rec: QuickWinsRecord) => {
    setActiveRecord(rec);
    setIsDetailOpen(true);
  };

  // Handle principal selection change in form
  const handleSchoolChange = (schoolName: string) => {
    const selected = principals.find((p) => p.satuanPendidikan === schoolName);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        schoolName: selected.satuanPendidikan,
        schoolNpsn: selected.npsn || prev.schoolNpsn,
        headmasterName: selected.nama,
        headmasterNip: selected.nip || prev.headmasterNip,
        headmasterRank: selected.pangkatGolongan || prev.headmasterRank
      }));
    } else {
      setFormData((prev) => ({ ...prev, schoolName }));
    }
  };

  // AI Auto-generate Quick Wins Plan
  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      const generated = await generateQuickWinsPlanAI({
        schoolName: formData.schoolName || 'Satuan Pendidikan Binaan',
        headmasterName: formData.headmasterName || 'Kepala Sekolah',
        targetPillar: formData.targetPillar || COMMON_PILLARS[0],
        rpbStrategy: formData.rpbStrategy || 'Pemacu Perubahan (Catalyst)'
      });

      setFormData((prev) => ({
        ...prev,
        title: generated.title || prev.title,
        beforeCondition: generated.beforeCondition || prev.beforeCondition,
        expectedImpact: generated.expectedImpact || prev.expectedImpact,
        supervisorNotes: generated.supervisorNotes || prev.supervisorNotes,
        items: generated.items.map((it, idx) => ({
          id: `item-gen-${Date.now()}-${idx}`,
          phase: it.phase,
          phaseTitle: it.phaseTitle,
          week: it.week,
          actionTitle: it.actionTitle,
          actionDetail: it.actionDetail,
          pic: it.pic,
          evidenceTarget: it.evidenceTarget,
          status: idx === 0 ? 'tuntas' : idx <= 2 ? 'proses' : 'belum',
          notes: ''
        }))
      }));

      showToast('Peta Langkah Nyata 30-60-90 Hari berhasil disusun otomatis oleh AI!', 'success');
      setActiveEditorTab('items');
    } catch (err) {
      console.error(err);
      showToast('Gagal menghasilkan rancangan AI. Menggunakan format standar.', 'warning');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Add Item
  const handleAddItem = (phase: QuickWinsPhase) => {
    const phaseTitle =
      phase === '30-days'
        ? 'Fase 1 (Hari 1–30): Fondasi & Kemenangan Cepat (Quick Wins)'
        : phase === '60-days'
        ? 'Fase 2 (Hari 31–60): Eksperimen Kelas & Penguatan Berkelanjutan'
        : 'Fase 3 (Hari 61–90): Pembudayaan, Pengimbasan & Bukti Dampak';

    const newItem: QuickWinsActionItem = {
      id: `item-${Date.now()}`,
      phase,
      phaseTitle,
      week: phase === '30-days' ? 'Minggu 1–2' : phase === '60-days' ? 'Minggu 5–6' : 'Minggu 9–10',
      actionTitle: '',
      actionDetail: '',
      pic: 'Guru Sasaran / Tim Kombel',
      evidenceTarget: 'Dokumentasi / Artefak Pembelajaran',
      status: 'belum',
      notes: ''
    };

    setFormData((prev) => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      items: (prev.items || []).filter((i) => i.id !== id)
    }));
  };

  // Update item field
  const handleUpdateItem = (id: string, field: keyof QuickWinsActionItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      items: (prev.items || []).map((i) => (i.id === id ? { ...i, [field]: value } : i))
    }));
  };

  // Quick toggle status directly on card list
  const handleToggleCardItemStatus = (
    rec: QuickWinsRecord,
    itemId: string,
    newStatus: QuickWinsItemStatus
  ) => {
    const updatedItems = rec.items.map((it) =>
      it.id === itemId ? { ...it, status: newStatus } : it
    );
    const updatedRec: QuickWinsRecord = {
      ...rec,
      items: updatedItems,
      updatedAt: new Date().toISOString()
    };
    onSaveRecord(updatedRec);
    showToast(`Status aksi berhasil diperbarui: ${newStatus.toUpperCase()}`, 'info');
  };

  // Save Record
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.schoolName) {
      showToast('Mohon pilih satuan pendidikan binaan!', 'warning');
      return;
    }
    if (!formData.items || formData.items.length === 0) {
      showToast('Minimal tambahkan 1 aksi nyata dalam peta langkah!', 'warning');
      return;
    }

    const recordToSave: QuickWinsRecord = {
      id: formData.id || `qw-${Date.now()}`,
      title: formData.title || 'Peta Langkah Nyata 30-60-90 Hari Pendampingan Satuan Pendidikan',
      schoolName: formData.schoolName || '',
      schoolNpsn: formData.schoolNpsn || '',
      headmasterName: formData.headmasterName || '',
      headmasterNip: formData.headmasterNip || '',
      headmasterRank: formData.headmasterRank || '',
      supervisorName: formData.supervisorName || settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
      supervisorNip: formData.supervisorNip || settings.supervisorNip || '19830819 201001 1 002',
      supervisorRole: formData.supervisorRole || 'Pengawas Sekolah Pembina',
      supervisorRank: formData.supervisorRank || settings.supervisorRank || 'Penata Tk. I / III.d',
      academicYear: formData.academicYear || '2026/2027',
      semester: formData.semester || 'Ganjil',
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      targetPillar: formData.targetPillar || COMMON_PILLARS[0],
      rpbStrategy: formData.rpbStrategy || 'Pemacu Perubahan (Catalyst)',
      beforeCondition: formData.beforeCondition || '',
      expectedImpact: formData.expectedImpact || '',
      supervisorNotes: formData.supervisorNotes || '',
      items: formData.items || [],
      status: formData.status || 'berjalan',
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveRecord(recordToSave);
    setIsEditorOpen(false);
    showToast('Peta Langkah Nyata 30-60-90 Hari berhasil disimpan!', 'success');
  };

  // Export Word
  const handleExportWord = (rec: QuickWinsRecord) => {
    exportQuickWinsToWord(rec, settings);
    showToast(`Dokumen Word ${rec.schoolName} berhasil diunduh (.doc)!`, 'success');
  };

  // Print & PDF
  const handlePrint = (rec: QuickWinsRecord) => {
    setActiveRecord(rec);
    setTimeout(() => {
      const docTitle = `Peta_Langkah_Nyata_30_60_90_${(rec.schoolName || 'Supervisi').replace(/[^a-zA-Z0-9]/g, '_')}_${rec.startDate || ''}`;
      const printed = printDocumentElement('printable-quick-wins-doc', docTitle, { orientation: 'portrait' });
      if (!printed) {
        window.print();
      }
    }, 150);
  };

  // Render official document layout (used by both in-app modal preview and print engine)
  const renderOfficialDocumentContent = (rec: QuickWinsRecord) => {
    return (
      <div className="text-slate-900 bg-white">
        {/* KOP Surat Resmi Sidrap dengan Dua Logo */}
        <div className="flex items-center justify-between border-b-4 border-double border-slate-900 pb-3 mb-6">
          <div className="w-20 flex justify-center">
            <img
              src={settings.logoUrl || DEFAULT_SIDRAP_LOGO}
              alt="Logo Kabupaten Sidenreng Rappang"
              className="h-20 w-auto object-contain"
            />
          </div>
          <div className="flex-1 text-center px-4">
            <h3 className="text-sm font-bold tracking-wider text-slate-800 uppercase leading-tight">
              {settings.governmentAgency || 'PEMERINTAH KABUPATEN SIDENRENG RAPPANG'}
            </h3>
            <h2 className="text-base font-black tracking-wide text-slate-900 uppercase mt-0.5 leading-tight">
              DINAS PENDIDIKAN DAN KEBUDAYAAN
            </h2>
            <h1 className="text-sm font-extrabold text-blue-900 uppercase mt-0.5 tracking-tight">
              PENGAWAS SEKOLAH PEMBINA KABUPATEN SIDENRENG RAPPANG
            </h1>
            <p className="text-[10px] text-slate-600 italic mt-1 leading-tight">
              Alamat: Kompleks SKPD Jl. Harapan Baru No. 1, Pangkajene, Kab. Sidenreng Rappang, Sulawesi Selatan (91611)
            </p>
          </div>
          <div className="w-20 flex justify-center">
            <img
              src={settings.logoRightUrl || DEFAULT_TUTWURI_LOGO}
              alt="Logo Tut Wuri Handayani"
              className="h-20 w-auto object-contain"
            />
          </div>
        </div>

        {/* Judul Dokumen */}
        <div className="text-center mb-6">
          <h2 className="text-base font-extrabold uppercase underline tracking-wide text-slate-900">
            PETA LANGKAH NYATA PENDAMPINGAN 30–60–90 HARI
          </h2>
          <p className="text-xs font-bold text-slate-700 mt-1 uppercase">
            QUICK WINS ACTION PLAN: INSTRUMEN PENGUNCI EKSEKUSI DI LAPANGAN
          </p>
        </div>

        {/* Metadata Identitas */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs mb-6 pb-4 border-b border-slate-300">
          <div className="grid grid-cols-[140px_10px_1fr] items-baseline">
            <span className="font-semibold text-slate-600">Satuan Pendidikan</span>
            <span className="font-bold">:</span>
            <span className="text-slate-900 font-bold">{rec.schoolName} {rec.schoolNpsn ? `(NPSN: ${rec.schoolNpsn})` : ''}</span>
          </div>

          <div className="grid grid-cols-[140px_10px_1fr] items-baseline">
            <span className="font-semibold text-slate-600">Tahun Pelajaran</span>
            <span className="font-bold">:</span>
            <span className="text-slate-900">{rec.academicYear} ({rec.semester})</span>
          </div>

          <div className="grid grid-cols-[140px_10px_1fr] items-baseline">
            <span className="font-semibold text-slate-600">Kepala Sekolah</span>
            <span className="font-bold">:</span>
            <span className="text-slate-900 font-medium">{rec.headmasterName} (NIP. {rec.headmasterNip || '-'})</span>
          </div>

          <div className="grid grid-cols-[140px_10px_1fr] items-baseline">
            <span className="font-semibold text-slate-600">Tanggal Mulai</span>
            <span className="font-bold">:</span>
            <span className="text-slate-900">{rec.startDate}</span>
          </div>

          <div className="grid grid-cols-[140px_10px_1fr] items-baseline">
            <span className="font-semibold text-slate-600">Pengawas Pembina</span>
            <span className="font-bold">:</span>
            <span className="text-slate-900 font-semibold">{rec.supervisorName} (NIP. {rec.supervisorNip})</span>
          </div>

          <div className="grid grid-cols-[140px_10px_1fr] items-baseline">
            <span className="font-semibold text-slate-600">Strategi Pendampingan</span>
            <span className="font-bold">:</span>
            <span className="text-slate-900 font-bold text-emerald-800">{rec.rpbStrategy || 'Pemacu Perubahan (Catalyst)'}</span>
          </div>

          <div className="col-span-2 grid grid-cols-[140px_10px_1fr] items-baseline mt-1">
            <span className="font-semibold text-slate-600">Fokus / Pilar Sasaran</span>
            <span className="font-bold">:</span>
            <span className="text-slate-900 font-extrabold text-blue-900">{rec.targetPillar}</span>
          </div>
        </div>

        {/* Kanvas Komparasi Sebelum vs Sesudah 90 Hari */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 text-xs">
            <span className="text-rose-900 font-extrabold uppercase text-[10px] tracking-wider block mb-1">
              Kondisi Awal Lapangan (Sebelum Pendampingan):
            </span>
            <p className="text-slate-800 leading-relaxed font-normal">{rec.beforeCondition}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 text-xs">
            <span className="text-emerald-900 font-extrabold uppercase text-[10px] tracking-wider block mb-1">
              Target Dampak Nyata pada Hari ke-90:
            </span>
            <p className="text-slate-800 leading-relaxed font-semibold">{rec.expectedImpact}</p>
          </div>
        </div>

        {/* Tabel Rincian Aksi 30-60-90 Hari */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse border border-slate-400 text-xs">
            <thead>
              <tr className="bg-slate-800 text-white text-[11px] uppercase tracking-wider text-center">
                <th className="border border-slate-400 p-2 w-10 text-center bg-slate-800 text-white font-bold">No</th>
                <th className="border border-slate-400 p-2 w-32 text-center bg-slate-800 text-white font-bold">Tahap &amp; Linimasa</th>
                <th className="border border-slate-400 p-2 text-left bg-slate-800 text-white font-bold">Aksi Nyata &amp; Uraian Langkah</th>
                <th className="border border-slate-400 p-2 w-36 text-left bg-slate-800 text-white font-bold">Penanggung Jawab (PIC)</th>
                <th className="border border-slate-400 p-2 w-44 text-left bg-blue-900 text-white font-bold">Target Bukti Nyata Lapangan</th>
                <th className="border border-slate-400 p-2 w-24 text-center bg-slate-800 text-white font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rec.items.map((item, idx) => (
                <tr key={item.id} className="align-top hover:bg-slate-50/50">
                  <td className="border border-slate-400 p-2.5 text-center font-bold bg-slate-50 text-slate-900">
                    {idx + 1}
                  </td>
                  <td className="border border-slate-400 p-2 text-center">
                    <span
                      className={`inline-block text-[9px] px-2 py-0.5 rounded font-extrabold uppercase mb-1 ${
                        item.phase === '30-days'
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : item.phase === '60-days'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-purple-100 text-purple-800 border border-purple-300'
                      }`}
                    >
                      {item.phase === '30-days' ? 'Fase 30 Hari' : item.phase === '60-days' ? 'Fase 60 Hari' : 'Fase 90 Hari'}
                    </span>
                    <strong className="block text-slate-900 text-xs font-bold">{item.week}</strong>
                  </td>
                  <td className="border border-slate-400 p-2.5">
                    <strong className="text-slate-900 block font-bold text-xs mb-1">{item.actionTitle}</strong>
                    <p className="text-slate-700 text-[11px] leading-relaxed">{item.actionDetail}</p>
                    {item.notes && (
                      <p className="text-blue-800 text-[10px] italic mt-1 bg-blue-50/50 p-1 rounded border border-blue-100">
                        <strong>Catatan:</strong> {item.notes}
                      </p>
                    )}
                  </td>
                  <td className="border border-slate-400 p-2.5 text-slate-900 font-semibold text-[11px]">
                    {item.pic}
                  </td>
                  <td className="border border-slate-400 p-2.5 text-teal-950 bg-teal-50/30 text-[11px] leading-relaxed font-medium">
                    {item.evidenceTarget}
                  </td>
                  <td className="border border-slate-400 p-2 text-center">
                    <span
                      className={`inline-block text-[9px] px-2 py-0.5 rounded font-extrabold uppercase ${
                        item.status === 'tuntas'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : item.status === 'butuh_bantuan'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : item.status === 'proses'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {item.status === 'tuntas'
                        ? 'Tuntas'
                        : item.status === 'butuh_bantuan'
                        ? 'Butuh Bantuan'
                        : item.status === 'proses'
                        ? 'Dalam Proses'
                        : 'Belum Mulai'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Catatan Pengawas */}
        {rec.supervisorNotes && (
          <div className="mb-6 p-3 rounded-lg bg-slate-50 border-l-4 border-blue-600 text-xs">
            <strong className="text-blue-950">Komitmen Kawalan &amp; Catatan Pengawas Pembina:</strong>
            <p className="text-slate-700 italic mt-0.5 leading-relaxed font-normal">"{rec.supervisorNotes}"</p>
          </div>
        )}

        {/* Tanda Tangan Resmi Standar Kedinasan (Kepala Satuan Pendidikan & Pengawas Pembina) */}
        {/* Menggunakan ketinggian presisi 80px BERSIH TANPA TEKS / BINGKAI agar tanda tangan tidak tertindih */}
        <div className="mt-8 pt-4 border-t border-slate-300 print:border-black/30 break-inside-avoid print:break-inside-avoid">
          <table className="sig-table w-full text-xs text-slate-900" style={{ borderCollapse: 'collapse', border: 'none', width: '100%' }}>
            <tbody>
              {/* Baris 1: Jabatan & Titimangsa */}
              <tr className="align-top" style={{ border: 'none' }}>
                <td className="w-1/2 text-center pb-1 no-border" style={{ border: 'none', padding: '0 8px', verticalAlign: 'top' }}>
                  <p className="text-slate-700 leading-tight">Mengetahui / Menyetujui,</p>
                  <p className="font-bold text-slate-900 leading-tight mt-0.5">Kepala Satuan Pendidikan</p>
                  <p className="text-[10px] text-slate-500 italic leading-tight">(Penanggung Jawab Satuan Pendidikan)</p>
                </td>

                <td className="w-1/2 text-center pb-1 no-border" style={{ border: 'none', padding: '0 8px', verticalAlign: 'top' }}>
                  <p className="text-slate-700 leading-tight">
                    {settings.schoolCity || 'Kabupaten Sidenreng Rappang'}, {rec.startDate}
                  </p>
                  <p className="font-bold text-slate-900 leading-tight mt-0.5">
                    {rec.supervisorRole || 'Pengawas Sekolah Pembina'}
                  </p>
                  <p className="text-[10px] text-slate-500 italic leading-tight">(Mitra Pendamping &amp; Co-Pilot Transformasi)</p>
                </td>
              </tr>

              {/* Baris 2: RUANG KOSONG TANDA TANGAN & STEMPEL (KETINGGIAN PRESISI 80PX BERSIH TANPA TEKS AGAR TERTINDIH) */}
              <tr style={{ height: '80px', border: 'none' }}>
                <td className="no-border" style={{ height: '80px', minHeight: '80px', border: 'none', padding: '0 8px', verticalAlign: 'middle' }}>
                  <div style={{ height: '80px', minHeight: '80px', width: '100%' }}>&nbsp;</div>
                </td>

                <td className="no-border" style={{ height: '80px', minHeight: '80px', border: 'none', padding: '0 8px', verticalAlign: 'middle' }}>
                  <div style={{ height: '80px', minHeight: '80px', width: '100%' }}>&nbsp;</div>
                </td>
              </tr>

              {/* Baris 3: Nama, NIP, & Pangkat/Golongan */}
              <tr className="align-top" style={{ border: 'none' }}>
                <td className="text-center pt-1 no-border" style={{ border: 'none', padding: '2px 8px' }}>
                  <p className="font-bold underline text-slate-900 text-xs uppercase tracking-wide">
                    {rec.headmasterName}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">NIP. {rec.headmasterNip || '-'}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{rec.headmasterRank || 'Pembina / IV.a'}</p>
                </td>

                <td className="text-center pt-1 no-border" style={{ border: 'none', padding: '2px 8px' }}>
                  <p className="font-bold underline text-slate-900 text-xs uppercase tracking-wide">
                    {rec.supervisorName}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">NIP. {rec.supervisorNip}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{rec.supervisorRank || 'Penata Tk. I / III.d'}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* SCREEN-ONLY INTERACTIVE UI (STRICTLY HIDDEN ON PRINT) */}
      <div className="space-y-6 print:hidden no-print">
        {/* Top Banner Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-cyan-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                  Quick Wins Impact Tracker
                </span>
                <span className="text-slate-400 text-xs">·</span>
                <span className="text-slate-300 text-xs font-medium">Kabupaten Sidenreng Rappang</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <Target className="w-5 h-5 text-white" />
                </div>
                Peta Langkah Nyata (30-60-90 Hari)
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
                Instrumen pengunci eksekusi pendampingan di lapangan. Memecah RPB menjadi target mingguan yang terukur,
                memantau bukti nyata di kelas, serta mendeteksi sekolah yang membutuhkan bantuan pengawas secara langsung.
              </p>
            </div>

            <button
              onClick={handleOpenNew}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition-all transform active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Susun Peta Langkah Baru</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Peta Aksi</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{metrics.totalRecords}</span>
              <span className="text-xs text-slate-500">Satuan Pendidikan</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Aksi Tuntas (Quick Wins)</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">{metrics.tuntasItems}</span>
              <span className="text-xs text-emerald-700 font-semibold">({metrics.completionRate}%)</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-amber-200/80 bg-amber-50/20 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-800">Butuh Bantuan Pengawas</span>
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg animate-pulse">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-700">{metrics.butuhBantuanItems}</span>
              <span className="text-[11px] text-amber-800 font-medium">Lampu Kuning</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Dalam Proses Eksperimen</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-600">{metrics.prosesItems}</span>
              <span className="text-xs text-slate-500">Aksi Berjalan</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari sekolah, pilar inovasi, aksi, atau PIC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* School Filter */}
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 cursor-pointer focus:outline-hidden"
            >
              <option value="all">Semua Satuan Pendidikan ({records.length})</option>
              {uniqueSchools.map((sch) => (
                <option key={sch} value={sch}>
                  {sch}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 cursor-pointer focus:outline-hidden"
            >
              <option value="all">Semua Status Lampu</option>
              <option value="tuntas">🟢 Tuntas (Quick Wins)</option>
              <option value="butuh_bantuan">🟡 Butuh Bantuan Pengawas</option>
              <option value="proses">🔵 Dalam Proses</option>
              <option value="belum">⚪ Belum Mulai</option>
            </select>
          </div>
        </div>

        {/* Card List of Quick Wins */}
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Belum Ada Peta Langkah Nyata</h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto">
              Mulai susun target aksi 30-60-90 hari agar hasil supervisi dan RPB sekolah binaan dapat terkunci dan terlaksana nyata di kelas.
            </p>
            <button
              onClick={handleOpenNew}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Susun Peta Langkah Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredRecords.map((rec) => {
              const tuntasCount = rec.items.filter((i) => i.status === 'tuntas').length;
              const butuhCount = rec.items.filter((i) => i.status === 'butuh_bantuan').length;
              const rate = rec.items.length > 0 ? Math.round((tuntasCount / rec.items.length) * 100) : 0;

              return (
                <div
                  key={rec.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-blue-400 transition-all"
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold text-[10px] uppercase tracking-wider">
                          {rec.schoolName}
                        </span>
                        <span className="text-slate-400 text-xs">·</span>
                        <span className="text-slate-500 text-xs font-medium">NPSN: {rec.schoolNpsn || '-'}</span>
                        <span className="text-slate-400 text-xs">·</span>
                        <span className="text-slate-500 text-xs font-medium">Mulai: {rec.startDate}</span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        {rec.title}
                      </h3>
                      <p className="text-xs text-blue-900 font-bold flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Fokus Sasaran: {rec.targetPillar}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {butuhCount > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>{butuhCount} Aksi Butuh Bantuan</span>
                        </span>
                      )}
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Progres Dampak</div>
                        <div className="text-sm font-black text-emerald-600">
                          {tuntasCount}/{rec.items.length} Aksi ({rate}%)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kanvas Sebelum vs Sesudah Mini */}
                  <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-200">
                      <span className="text-[10px] font-extrabold uppercase text-rose-800 block mb-0.5">
                        Kondisi Awal Lapangan (Sebelum):
                      </span>
                      <p className="text-slate-700 text-[11px] leading-relaxed line-clamp-2">{rec.beforeCondition}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
                      <span className="text-[10px] font-extrabold uppercase text-emerald-800 block mb-0.5">
                        Target Dampak 90 Hari (Sesudah):
                      </span>
                      <p className="text-slate-700 text-[11px] leading-relaxed line-clamp-2 font-medium">{rec.expectedImpact}</p>
                    </div>
                  </div>

                  {/* Items List (30-60-90 Days Checklist) */}
                  <div className="p-5 space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Rangkaian Aksi 30–60–90 Hari (Klik Status untuk Memperbarui):</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {rec.items.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                            item.status === 'tuntas'
                              ? 'bg-emerald-50/40 border-emerald-200'
                              : item.status === 'butuh_bantuan'
                              ? 'bg-amber-50/40 border-amber-300 shadow-2xs'
                              : item.status === 'proses'
                              ? 'bg-blue-50/30 border-blue-200'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase ${
                                  item.phase === '30-days'
                                    ? 'bg-sky-100 text-sky-800'
                                    : item.phase === '60-days'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}
                              >
                                {item.phase === '30-days' ? 'Fase 30 Hari' : item.phase === '60-days' ? 'Fase 60 Hari' : 'Fase 90 Hari'}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500">{item.week}</span>
                            </div>

                            <h5 className="font-bold text-xs text-slate-900 leading-snug">{item.actionTitle}</h5>
                            <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">{item.actionDetail}</p>

                            <div className="pt-1 text-[10px] text-slate-500 border-t border-slate-100/80">
                              <span className="font-semibold text-slate-700">PIC:</span> {item.pic}
                            </div>
                            <div className="text-[10px] text-teal-800">
                              <span className="font-semibold">Bukti:</span> {item.evidenceTarget}
                            </div>
                          </div>

                          {/* Quick Status Selector Buttons */}
                          <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between gap-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Ubah Status:</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                title="Tandai Belum Dimulai"
                                onClick={() => handleToggleCardItemStatus(rec, item.id, 'belum')}
                                className={`p-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                  item.status === 'belum'
                                    ? 'bg-slate-300 text-slate-800'
                                    : 'text-slate-400 hover:bg-slate-100'
                                }`}
                              >
                                Belum
                              </button>
                              <button
                                type="button"
                                title="Tandai Dalam Proses"
                                onClick={() => handleToggleCardItemStatus(rec, item.id, 'proses')}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                  item.status === 'proses'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                }`}
                              >
                                Proses
                              </button>
                              <button
                                type="button"
                                title="Lapor Butuh Bantuan Pengawas Segera"
                                onClick={() => handleToggleCardItemStatus(rec, item.id, 'butuh_bantuan')}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                  item.status === 'butuh_bantuan'
                                    ? 'bg-amber-500 text-white font-extrabold'
                                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                                }`}
                              >
                                Bantuan!
                              </button>
                              <button
                                type="button"
                                title="Tandai Tuntas Berdampak"
                                onClick={() => handleToggleCardItemStatus(rec, item.id, 'tuntas')}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                  item.status === 'tuntas'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                              >
                                ✓ Tuntas
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenDetail(rec)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        title="Lihat Pratinjau Dokumen Lengkap"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Pratinjau Dokumen</span>
                      </button>

                      <button
                        onClick={() => handleExportWord(rec)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        title="Ekspor Laporan ke Microsoft Word (.doc)"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Word (.doc)</span>
                      </button>

                      <button
                        onClick={() => handlePrint(rec)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        title="Cetak Langsung / Simpan PDF"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak / PDF</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(rec)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Peta Langkah"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Hapus Peta Langkah Nyata untuk ${rec.schoolName}?`)) {
                            onDeleteRecord(rec.id);
                            showToast('Peta langkah berhasil dihapus.', 'info');
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Dokumen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL EDITOR: PENYUSUNAN PETA LANGKAH NYATA 30-60-90     */}
      {/* ======================================================== */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print print:hidden">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/30">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    {formData.id && records.some((r) => r.id === formData.id)
                      ? 'Edit Peta Langkah Nyata 30-60-90 Hari'
                      : 'Susun Peta Langkah Nyata Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Kunci eksekusi pendampingan lapangan agar tidak mandek di dokumen
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={isGeneratingAI}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  title="Susun Otomatis Rencana 30-60-90 Hari dengan AI INSPIRO"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingAI ? 'Merumuskan...' : '✨ Susun Otomatis dengan AI'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveEditorTab('info')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeEditorTab === 'info'
                    ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Identitas &amp; Komparasi Sebelum-Sesudah
              </button>
              <button
                type="button"
                onClick={() => setActiveEditorTab('items')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeEditorTab === 'items'
                    ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>2. Matriks Aksi 30–60–90 Hari</span>
                <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px]">
                  {formData.items?.length || 0}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveEditorTab('notes')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeEditorTab === 'notes'
                    ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                3. Komitmen Pengawas &amp; Tanda Tangan
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: IDENTITAS & KOMPARASI */}
              {activeEditorTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Satuan Pendidikan */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Satuan Pendidikan Binaan
                      </label>
                      <select
                        value={formData.schoolName}
                        onChange={(e) => handleSchoolChange(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Pilih Sekolah Binaan...</option>
                        {principals.map((p) => (
                          <option key={p.id} value={p.satuanPendidikan}>
                            {p.satuanPendidikan} ({p.nama})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Judul Peta Langkah */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Judul Peta Langkah Nyata
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white"
                        placeholder="Peta Langkah Nyata 30-60-90 Hari..."
                        required
                      />
                    </div>

                    {/* Kepala Sekolah */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Kepala Satuan Pendidikan
                      </label>
                      <input
                        type="text"
                        value={formData.headmasterName}
                        onChange={(e) => setFormData((p) => ({ ...p, headmasterName: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white"
                        required
                      />
                    </div>

                    {/* NIP Kepala Sekolah */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        NIP Kepala Sekolah
                      </label>
                      <input
                        type="text"
                        value={formData.headmasterNip}
                        onChange={(e) => setFormData((p) => ({ ...p, headmasterNip: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white"
                      />
                    </div>

                    {/* Pilar Sasaran */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Fokus / Pilar Inovasi Sasaran
                      </label>
                      <select
                        value={formData.targetPillar}
                        onChange={(e) => setFormData((p) => ({ ...p, targetPillar: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white"
                      >
                        {COMMON_PILLARS.map((pil, idx) => (
                          <option key={idx} value={pil}>
                            {pil}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tanggal Mulai & Strategi */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Tanggal Mulai
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Strategi RPB
                        </label>
                        <select
                          value={formData.rpbStrategy}
                          onChange={(e) => setFormData((p) => ({ ...p, rpbStrategy: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white"
                        >
                          <option value="Pemacu Perubahan (Catalyst)">Pemacu Perubahan (Catalyst)</option>
                          <option value="Penguat Perubahan (Booster)">Penguat Perubahan (Booster)</option>
                          <option value="Pemicu Perubahan (Trigger)">Pemicu Perubahan (Trigger)</option>
                          <option value="Pendampingan Intensif">Pendampingan Intensif</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Kanvas Sebelum vs Sesudah Input */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50/40 space-y-1.5">
                      <label className="block text-xs font-extrabold uppercase text-rose-900">
                        Kondisi Awal Lapangan (Sebelum Pendampingan):
                      </label>
                      <textarea
                        rows={3}
                        value={formData.beforeCondition}
                        onChange={(e) => setFormData((p) => ({ ...p, beforeCondition: e.target.value }))}
                        className="w-full p-2.5 bg-white border border-rose-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                        placeholder="Contoh: Pembelajaran masih dominan ceramah, LKPD seragam tanpa diferensiasi..."
                      />
                    </div>

                    <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/40 space-y-1.5">
                      <label className="block text-xs font-extrabold uppercase text-emerald-900">
                        Target Dampak Nyata pada Hari ke-90:
                      </label>
                      <textarea
                        rows={3}
                        value={formData.expectedImpact}
                        onChange={(e) => setFormData((p) => ({ ...p, expectedImpact: e.target.value }))}
                        className="w-full p-2.5 bg-white border border-emerald-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                        placeholder="Contoh: 85% murid aktif terlibat, 3 kelompok berdiferensiasi berjalan lancar..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MATRIKS AKSI 30-60-90 HARI */}
              {activeEditorTab === 'items' && (
                <div className="space-y-6">
                  {/* Phase Selector & Add Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-700">Tambah Langkah Aksi Nyata per Babak:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddItem('30-days')}
                        className="px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 text-xs font-bold transition-colors cursor-pointer"
                      >
                        + Fase 30 Hari
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddItem('60-days')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
                      >
                        + Fase 60 Hari
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddItem('90-days')}
                        className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold transition-colors cursor-pointer"
                      >
                        + Fase 90 Hari
                      </button>
                    </div>
                  </div>

                  {/* Items List inside Form */}
                  <div className="space-y-4">
                    {formData.items?.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <select
                              value={item.phase}
                              onChange={(e) => handleUpdateItem(item.id, 'phase', e.target.value as QuickWinsPhase)}
                              className="px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800"
                            >
                              <option value="30-days">Fase 1 (Hari 1–30): Fondasi</option>
                              <option value="60-days">Fase 2 (Hari 31–60): Eksperimen</option>
                              <option value="90-days">Fase 3 (Hari 61–90): Pengimbasan</option>
                            </select>
                            <input
                              type="text"
                              value={item.week}
                              onChange={(e) => handleUpdateItem(item.id, 'week', e.target.value)}
                              className="w-28 px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-semibold text-slate-800"
                              placeholder="e.g. Minggu 1-2"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={item.status}
                              onChange={(e) => handleUpdateItem(item.id, 'status', e.target.value as QuickWinsItemStatus)}
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                item.status === 'tuntas'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : item.status === 'butuh_bantuan'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : item.status === 'proses'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              <option value="belum">⚪ Belum Mulai</option>
                              <option value="proses">🔵 Dalam Proses</option>
                              <option value="butuh_bantuan">🟡 Butuh Bantuan Pengawas</option>
                              <option value="tuntas">🟢 Tuntas Berdampak</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                              title="Hapus aksi ini"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                              Judul Aksi Nyata Konkret:
                            </label>
                            <input
                              type="text"
                              value={item.actionTitle}
                              onChange={(e) => handleUpdateItem(item.id, 'actionTitle', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 font-semibold"
                              placeholder="e.g. Asesmen Diagnostik Awal Minat Murid..."
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                              Penanggung Jawab (PIC):
                            </label>
                            <input
                              type="text"
                              value={item.pic}
                              onChange={(e) => handleUpdateItem(item.id, 'pic', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 font-semibold"
                              placeholder="e.g. Guru Sasaran & Tim Kombel"
                              required
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                              Uraian Langkah Pelaksanaan:
                            </label>
                            <textarea
                              rows={2}
                              value={item.actionDetail}
                              onChange={(e) => handleUpdateItem(item.id, 'actionDetail', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800"
                              placeholder="Rincian konkret apa yang dilakukan di kelas / sekolah..."
                              required
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                              Target Bukti Nyata Lapangan (Artefak/Dokumentasi):
                            </label>
                            <input
                              type="text"
                              value={item.evidenceTarget}
                              onChange={(e) => handleUpdateItem(item.id, 'evidenceTarget', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-teal-900 font-medium"
                              placeholder="e.g. Modul Ajar Diferensiasi, Lembar Asesmen, Foto/Video Stasiun Belajar..."
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: KOMITMEN PENGAWAS & TANDA TANGAN */}
              {activeEditorTab === 'notes' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      Komitmen Kawalan &amp; Catatan Pengawas Pembina:
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Tuliskan komitmen dukungan konkret apa yang akan Bapak berikan kepada kepala sekolah dan dewan guru selama siklus 90 hari ini.
                    </p>
                    <textarea
                      rows={4}
                      value={formData.supervisorNotes}
                      onChange={(e) => setFormData((p) => ({ ...p, supervisorNotes: e.target.value }))}
                      className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: Pengawas Pembina berkomitmen mendampingi sebagai mitra dialog (co-pilot), memberikan umpan balik klinis yang membesarkan hati, dan memfasilitasi integrasi bank modul digital sekolah..."
                    />
                  </div>

                  {/* Identitas Penandatangan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white rounded-xl border border-slate-200">
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 uppercase mb-2">Penandatangan 1: Kepala Sekolah</h5>
                      <p className="text-xs font-semibold text-slate-900">{formData.headmasterName || 'Kepala Sekolah'}</p>
                      <p className="text-[11px] text-slate-500">NIP. {formData.headmasterNip || '-'}</p>
                      <p className="text-[10px] text-slate-400">Pangkat/Gol: {formData.headmasterRank || '-'}</p>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-slate-800 uppercase mb-2">Penandatangan 2: Pengawas Pembina</h5>
                      <p className="text-xs font-semibold text-slate-900">{formData.supervisorName}</p>
                      <p className="text-[11px] text-slate-500">NIP. {formData.supervisorNip}</p>
                      <p className="text-[10px] text-slate-400">{formData.supervisorRank || 'Penata Tk. I / III.d'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>

                <div className="flex items-center gap-2">
                  {activeEditorTab !== 'items' && (
                    <button
                      type="button"
                      onClick={() => setActiveEditorTab('items')}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Lanjut ke Matriks Aksi →
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    Simpan Peta Langkah Nyata
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DETAIL: PRATINJAU DOKUMEN RESMI A4                 */}
      {/* ======================================================== */}
      {isDetailOpen && activeRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print print:hidden">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Detail Action Bar */}
            <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 no-print print:hidden">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-sm">Dokumen Peta Langkah Nyata 30–60–90 Hari</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportWord(activeRecord)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Ekspor Word (.doc)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePrint(activeRecord)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Preview Container inside Modal */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-100">
              <div className="bg-white p-6 sm:p-10 rounded-xl shadow-xs max-w-4xl mx-auto border border-slate-200 text-slate-900">
                {renderOfficialDocumentContent(activeRecord)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DEDICATED OFFICIAL PRINT CONTAINER (CETAK / PDF)         */}
      {/* Strictly hidden on screen, printed via printDocumentElement */}
      {/* ======================================================== */}
      {activeRecord && (
        <div id="printable-quick-wins-doc" className="hidden print:block p-8 bg-white text-slate-900 w-full max-w-4xl mx-auto">
          {renderOfficialDocumentContent(activeRecord)}
        </div>
      )}
    </>
  );
};
