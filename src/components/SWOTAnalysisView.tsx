/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  TrendingUp,
  Award,
  Plus,
  Trash2,
  Edit3,
  Download,
  Printer,
  FileText,
  Target,
  CheckCircle2,
  Clock,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  ArrowRight,
  ShieldAlert,
  Building,
  Check,
  X,
  Share2,
  Filter,
  ShieldCheck,
  Lightbulb,
  AlertTriangle,
  School,
  Save,
  FileDown,
  Calendar,
  Zap,
  ArrowUpRight,
  BookOpen
} from 'lucide-react';
import {
  AppSettings,
  Principal,
  SWOTAnalysisRecord,
  SWOTItem,
  SWOTQuadrantType,
  TOWSStrategyItem,
  TOWSStrategyType
} from '../types/inspiro';
import { exportSWOTToWord } from '../utils/storage';
import { printDocumentElement } from '../utils/documentExport';
import { DEFAULT_SIDRAP_LOGO, DEFAULT_TUTWURI_LOGO } from '../data/defaultLogos';

interface SWOTAnalysisViewProps {
  records: SWOTAnalysisRecord[];
  principals: Principal[];
  settings: AppSettings;
  initialPrincipalId?: string;
  onSaveRecord: (record: SWOTAnalysisRecord) => void;
  onDeleteRecord: (id: string) => void;
  showToast: (title: string, desc?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const SWOTAnalysisView: React.FC<SWOTAnalysisViewProps> = ({
  records,
  principals,
  settings,
  initialPrincipalId,
  onSaveRecord,
  onDeleteRecord,
  showToast
}) => {
  // Active record state
  const [selectedRecordId, setSelectedRecordId] = useState<string>(() => {
    if (initialPrincipalId) {
      const match = records.find((r) => r.principalId === initialPrincipalId);
      if (match) return match.id;
    }
    return records.length > 0 ? records[0].id : '';
  });

  useEffect(() => {
    if (initialPrincipalId) {
      const match = records.find((r) => r.principalId === initialPrincipalId);
      if (match) setSelectedRecordId(match.id);
    }
  }, [initialPrincipalId, records]);

  const [activeTab, setActiveTab] = useState<'matrix-swot' | 'matrix-tows' | 'integrated' | 'preview'>('matrix-swot');
  const [filterDimension, setFilterDimension] = useState<string>('all');

  // Modals state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);

  // Active record object
  const currentRecord = useMemo(() => {
    return records.find((r) => r.id === selectedRecordId) || records[0] || null;
  }, [records, selectedRecordId]);

  // Form states for Record creation/editing
  const [recordForm, setRecordForm] = useState<{
    principalId: string;
    schoolName: string;
    schoolNpsn: string;
    headmasterName: string;
    headmasterNip: string;
    headmasterRank: string;
    academicYear: string;
    semester: 'Ganjil' | 'Genap';
    date: string;
    title: string;
    focusArea: string;
    supervisorNotes: string;
    recommendation: string;
  }>({
    principalId: '',
    schoolName: '',
    schoolNpsn: '',
    headmasterName: '',
    headmasterNip: '',
    headmasterRank: '',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    date: new Date().toISOString().split('T')[0],
    title: 'Analisis Strategis SWOT & Matriks TOWS Supervisi Manajerial Kepala Sekolah',
    focusArea: 'Tata Kelola RKAS & Perencanaan Berbasis Data (PBD)',
    supervisorNotes: '',
    recommendation: ''
  });

  // Form states for SWOT Item
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState<{
    quadrant: SWOTQuadrantType;
    dimension: string;
    title: string;
    description: string;
    impactOrEvidence: string;
    urgency: 'Sangat Tinggi' | 'Tinggi' | 'Sedang' | 'Rendah';
    score: number;
  }>({
    quadrant: 'strength',
    dimension: 'Standar Pengelolaan',
    title: '',
    description: '',
    impactOrEvidence: '',
    urgency: 'Tinggi',
    score: 85
  });

  // Form states for TOWS Strategy
  const [editingStrategyId, setEditingStrategyId] = useState<string | null>(null);
  const [strategyForm, setStrategyForm] = useState<{
    type: TOWSStrategyType;
    title: string;
    description: string;
    actionPlanText: string;
    targetOutput: string;
    timeline: string;
    pic: string;
    priority: 'Prioritas Utama' | 'Prioritas Menengah' | 'Jangka Panjang';
    status: 'Rencana' | 'Dalam Proses' | 'Terealisasi';
  }>({
    type: 'S-O',
    title: '',
    description: '',
    actionPlanText: '',
    targetOutput: '',
    timeline: 'Semester Ganjil 2026/2027',
    pic: 'Kepala Sekolah & Tim Pengembang Sekolah',
    priority: 'Prioritas Utama',
    status: 'Rencana'
  });

  // Handlers for switching school / record
  const handlePrincipalSelect = (principalId: string) => {
    const matched = records.find((r) => r.principalId === principalId);
    if (matched) {
      setSelectedRecordId(matched.id);
    } else {
      const p = principals.find((item) => item.id === principalId);
      if (p) {
        setRecordForm({
          principalId: p.id,
          schoolName: p.satuanPendidikan,
          schoolNpsn: p.npsn || '40301000',
          headmasterName: p.nama,
          headmasterNip: p.nip || '-',
          headmasterRank: p.pangkatGolongan || 'Pembina (IV/a)',
          academicYear: '2026/2027',
          semester: 'Ganjil',
          date: p.tanggalSupervisiTerakhir || new Date().toISOString().split('T')[0],
          title: `Analisis Strategis SWOT & Matriks TOWS — ${p.satuanPendidikan}`,
          focusArea: p.fokusManajerial || 'Tata Kelola RKAS & Perencanaan Berbasis Data (PBD)',
          supervisorNotes: p.catatanPengawas || 'Pengelolaan manajerial sekolah telah berjalan baik dan perlu akselerasi perbaikan berkelanjutan.',
          recommendation: p.rekomendasiManajerial || 'Formulasikan strategi SO untuk mengeksekusi rekomendasi Rapor Pendidikan.'
        });
        setIsRecordModalOpen(true);
      }
    }
  };

  const handleOpenAddRecord = () => {
    const defaultPrincipal = principals[0];
    setRecordForm({
      principalId: defaultPrincipal ? defaultPrincipal.id : '',
      schoolName: defaultPrincipal ? defaultPrincipal.satuanPendidikan : 'SMP Negeri Binaan',
      schoolNpsn: defaultPrincipal?.npsn || '40301000',
      headmasterName: defaultPrincipal ? defaultPrincipal.nama : 'Kepala Sekolah',
      headmasterNip: defaultPrincipal?.nip || '-',
      headmasterRank: defaultPrincipal?.pangkatGolongan || 'Pembina (IV/a)',
      academicYear: '2026/2027',
      semester: 'Ganjil',
      date: new Date().toISOString().split('T')[0],
      title: 'Analisis Strategis SWOT & Matriks TOWS Supervisi Manajerial Satuan Pendidikan',
      focusArea: 'Tata Kelola RKAS, Mutu PBD Rapor Pendidikan, & Komunitas Belajar',
      supervisorNotes: '',
      recommendation: ''
    });
    setIsRecordModalOpen(true);
  };

  const handleSaveRecordModal = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: SWOTAnalysisRecord = {
      id: `swot-${Date.now().toString().slice(-6)}`,
      principalId: recordForm.principalId,
      schoolName: recordForm.schoolName,
      schoolNpsn: recordForm.schoolNpsn,
      headmasterName: recordForm.headmasterName,
      headmasterNip: recordForm.headmasterNip,
      headmasterRank: recordForm.headmasterRank,
      academicYear: recordForm.academicYear,
      semester: recordForm.semester,
      date: recordForm.date,
      title: recordForm.title,
      focusArea: recordForm.focusArea,
      supervisorName: settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
      supervisorNip: settings.supervisorNip || '19830819 201001 1 002',
      supervisorRole: settings.supervisorRole || 'Pengawas Sekolah Pembina',
      supervisorRank: settings.supervisorRank || 'Penata Tk. I / III.d',
      supervisorNotes: recordForm.supervisorNotes,
      recommendation: recordForm.recommendation,
      items: [
        {
          id: `item-${Date.now()}-1`,
          quadrant: 'strength',
          dimension: 'Standar Pendidik',
          title: 'Komitmen Pendidik & Pimpinan Sekolah Tinggi',
          description: 'Pendidik aktif berkolaborasi dalam Komunitas Belajar (Kombel) sekolah secara teratur.',
          impactOrEvidence: 'Tingkat kehadiran dan kedisiplinan mengajar mencapai 95%.',
          urgency: 'Tinggi',
          score: 90
        },
        {
          id: `item-${Date.now()}-2`,
          quadrant: 'weakness',
          dimension: 'Sarana Prasarana',
          title: 'Peremajaan Perangkat TIK & Buku Pengayaan Masih Berproses',
          description: 'Kebutuhan rasio komputer dan buku literasi belum sebanding dengan jumlah murid rombel.',
          impactOrEvidence: 'Dua kelas bergantian menggunakan perangkat saat asesmen formatif digital.',
          urgency: 'Sedang',
          score: 70
        },
        {
          id: `item-${Date.now()}-3`,
          quadrant: 'opportunity',
          dimension: 'Kemitraan & Kebijakan',
          title: 'Dukungan Program BOSP Kinerja & Mitra Komite Sekolah',
          description: 'Peluang pendanaan dan kemitraan masyarakat sangat terbuka lebar di Kabupaten Sidenreng Rappang.',
          impactOrEvidence: 'Persetujuan komite mendukung renovasi fasilitas belajar.',
          urgency: 'Tinggi',
          score: 88
        },
        {
          id: `item-${Date.now()}-4`,
          quadrant: 'threat',
          dimension: 'Sosial & Eksternal',
          title: 'Distraksi Penggunaan Gadget Tidak Bijak di Luar Sekolah',
          description: 'Ketergantungan siswa pada game online di luar jam sekolah mempengaruhi fokus pagi hari.',
          impactOrEvidence: 'Terdapat siswa mengantuk di jam pertama akibat begadang.',
          urgency: 'Tinggi',
          score: 82
        }
      ],
      strategies: [
        {
          id: `strat-${Date.now()}-1`,
          type: 'S-O',
          title: 'Akselerasi Program Sekolah Digital & Kelas Berdiferensiasi',
          description: 'Mendayagunakan komitmen guru dan dukungan komite untuk mengoptimalkan pembelajaran berbasis teknologi.',
          actionPlan: [
            'Menyelenggarakan in-house training pemanfaatan PMM terpadu.',
            'Menyusun proposal kemitraan sarana digital ke komite dan dinas.'
          ],
          targetOutput: '100% guru terbiasa menggunakan platform digital pembelajaran.',
          timeline: 'Semester Ganjil 2026/2027',
          pic: 'Kepala Sekolah & Tim Pengembang',
          priority: 'Prioritas Utama',
          status: 'Rencana'
        }
      ],
      status: 'final',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveRecord(newRecord);
    setSelectedRecordId(newRecord.id);
    setIsRecordModalOpen(false);
    showToast('Dokumen SWOT Baru Dibuat', `Analisis strategis untuk ${newRecord.schoolName} berhasil disimpan.`, 'success');
  };

  // SWOT Item Handlers
  const handleOpenAddItem = (quadrant: SWOTQuadrantType = 'strength') => {
    setEditingItemId(null);
    setItemForm({
      quadrant,
      dimension: 'Standar Pengelolaan',
      title: '',
      description: '',
      impactOrEvidence: '',
      urgency: 'Tinggi',
      score: 85
    });
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: SWOTItem) => {
    setEditingItemId(item.id);
    setItemForm({
      quadrant: item.quadrant,
      dimension: item.dimension,
      title: item.title,
      description: item.description,
      impactOrEvidence: item.impactOrEvidence,
      urgency: item.urgency,
      score: item.score || 80
    });
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRecord) return;

    let updatedItems: SWOTItem[];
    if (editingItemId) {
      updatedItems = currentRecord.items.map((it) =>
        it.id === editingItemId ? { ...it, ...itemForm } : it
      );
      showToast('Butir SWOT Diperbarui', `Butir "${itemForm.title}" berhasil diubah.`, 'success');
    } else {
      const newItem: SWOTItem = {
        id: `swot-it-${Date.now().toString().slice(-6)}`,
        ...itemForm
      };
      updatedItems = [...currentRecord.items, newItem];
      showToast('Butir SWOT Ditambahkan', `Butir "${itemForm.title}" berhasil ditambahkan ke kuadran ${itemForm.quadrant.toUpperCase()}.`, 'success');
    }

    const updatedRecord: SWOTAnalysisRecord = {
      ...currentRecord,
      items: updatedItems,
      updatedAt: new Date().toISOString()
    };
    onSaveRecord(updatedRecord);
    setIsItemModalOpen(false);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!currentRecord) return;
    const updatedRecord: SWOTAnalysisRecord = {
      ...currentRecord,
      items: currentRecord.items.filter((it) => it.id !== itemId),
      updatedAt: new Date().toISOString()
    };
    onSaveRecord(updatedRecord);
    showToast('Butir Dihapus', 'Butir analisis SWOT telah dihapus.', 'info');
  };

  // TOWS Strategy Handlers
  const handleOpenAddStrategy = (type: TOWSStrategyType = 'S-O') => {
    setEditingStrategyId(null);
    setStrategyForm({
      type,
      title: '',
      description: '',
      actionPlanText: '',
      targetOutput: '',
      timeline: 'Semester Ganjil 2026/2027',
      pic: 'Kepala Sekolah & Tim Pengembang Sekolah',
      priority: 'Prioritas Utama',
      status: 'Rencana'
    });
    setIsStrategyModalOpen(true);
  };

  const handleOpenEditStrategy = (strat: TOWSStrategyItem) => {
    setEditingStrategyId(strat.id);
    setStrategyForm({
      type: strat.type,
      title: strat.title,
      description: strat.description,
      actionPlanText: strat.actionPlan ? strat.actionPlan.join('\n') : '',
      targetOutput: strat.targetOutput,
      timeline: strat.timeline,
      pic: strat.pic,
      priority: strat.priority,
      status: strat.status
    });
    setIsStrategyModalOpen(true);
  };

  const handleSaveStrategy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRecord) return;

    const actionPlan = strategyForm.actionPlanText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    let updatedStrategies: TOWSStrategyItem[];
    if (editingStrategyId) {
      updatedStrategies = currentRecord.strategies.map((st) =>
        st.id === editingStrategyId
          ? {
              ...st,
              type: strategyForm.type,
              title: strategyForm.title,
              description: strategyForm.description,
              actionPlan,
              targetOutput: strategyForm.targetOutput,
              timeline: strategyForm.timeline,
              pic: strategyForm.pic,
              priority: strategyForm.priority,
              status: strategyForm.status
            }
          : st
      );
      showToast('Strategi TOWS Diperbarui', `Strategi "${strategyForm.title}" berhasil disimpan.`, 'success');
    } else {
      const newStrategy: TOWSStrategyItem = {
        id: `tows-st-${Date.now().toString().slice(-6)}`,
        type: strategyForm.type,
        title: strategyForm.title,
        description: strategyForm.description,
        actionPlan,
        targetOutput: strategyForm.targetOutput,
        timeline: strategyForm.timeline,
        pic: strategyForm.pic,
        priority: strategyForm.priority,
        status: strategyForm.status
      };
      updatedStrategies = [...currentRecord.strategies, newStrategy];
      showToast('Strategi TOWS Ditambahkan', `Strategi baru berhasil dimasukkan ke kuadran ${strategyForm.type}.`, 'success');
    }

    const updatedRecord: SWOTAnalysisRecord = {
      ...currentRecord,
      strategies: updatedStrategies,
      updatedAt: new Date().toISOString()
    };
    onSaveRecord(updatedRecord);
    setIsStrategyModalOpen(false);
  };

  const handleDeleteStrategy = (strategyId: string) => {
    if (!currentRecord) return;
    const updatedRecord: SWOTAnalysisRecord = {
      ...currentRecord,
      strategies: currentRecord.strategies.filter((st) => st.id !== strategyId),
      updatedAt: new Date().toISOString()
    };
    onSaveRecord(updatedRecord);
    showToast('Strategi Dihapus', 'Inisiatif strategi TOWS telah dihapus.', 'info');
  };

  // Quick auto-generate smart strategies based on SWOT items
  const handleAutoGenerateStrategies = () => {
    if (!currentRecord) return;
    const strengths = currentRecord.items.filter((i) => i.quadrant === 'strength');
    const weaknesses = currentRecord.items.filter((i) => i.quadrant === 'weakness');
    const opportunities = currentRecord.items.filter((i) => i.quadrant === 'opportunity');
    const threats = currentRecord.items.filter((i) => i.quadrant === 'threat');

    const newStrategies: TOWSStrategyItem[] = [
      {
        id: `auto-so-${Date.now()}`,
        type: 'S-O',
        title: `Pemberdayaan Aset Kekuatan Internal untuk Merebut Hibah & Program Prioritas (${currentRecord.schoolName})`,
        description: `Memanfaatkan kekuatan ${strengths[0]?.title || 'kompetensi pendidik'} untuk mengoptimalkan peluang ${opportunities[0]?.title || 'dukungan kemitraan pemerintah'}.`,
        actionPlan: [
          'Menyusun proposal inovasi pembelajaran berbasis aset sekolah.',
          'Mempromosikan praktik baik sekolah ke forum MKKS Kabupaten Sidenreng Rappang.'
        ],
        targetOutput: 'Meningkatnya predikat sekolah rujukan mutu dan raihan apresiasi kinerja.',
        timeline: 'Triwulan Berjalan',
        pic: 'Kepala Sekolah & Tim Penjamin Mutu',
        priority: 'Prioritas Utama',
        status: 'Rencana'
      },
      {
        id: `auto-wo-${Date.now()}`,
        type: 'W-O',
        title: 'Revitalisasi Kelemahan Mutu Melalui Aliansi Kemitraan Eksternal',
        description: `Mengatasi kendala ${weaknesses[0]?.title || 'keterbatasan sarana/kapasitas'} dengan memanfaatkan peluang ${opportunities[0]?.title || 'kemitraan komite dan dinas'}.`,
        actionPlan: [
          'Menyelenggarakan klinik bimbingan teknis intensif di Komunitas Belajar sekolah.',
          'Mengajukan permohonan pendampingan sarpras penunjang ke instansi terkait.'
        ],
        targetOutput: 'Tereduksinya kesenjangan mutu dan pemenuhan standar sarana prioritas.',
        timeline: 'Semester Ini',
        pic: 'Kepala Sekolah, Bendahara BOSP, & Komite',
        priority: 'Prioritas Utama',
        status: 'Dalam Proses'
      },
      {
        id: `auto-st-${Date.now()}`,
        type: 'S-T',
        title: 'Penguatan Budaya Sekolah & Disiplin Positif Penangkal Ancaman Eksternal',
        description: `Mendayagunakan ${strengths[0]?.title || 'budaya sekolah yang tertib'} guna membentengi siswa dari ancaman ${threats[0]?.title || 'distraksi lingkungan digital dan sosial'}.`,
        actionPlan: [
          'Memperkuat sosialisasi anti-perundungan dan parenting bersama orang tua.',
          'Menerapkan kesepakatan penggunaan gawai berbasis edukasi di lingkungan sekolah.'
        ],
        targetOutput: 'Iklim lingkungan belajar tetap kondusif, aman, dan berdaya gugah.',
        timeline: 'Berkala Tiap Pekan',
        pic: 'Kepala Sekolah, Guru BK, & Tim Ketertiban',
        priority: 'Prioritas Utama',
        status: 'Dalam Proses'
      },
      {
        id: `auto-wt-${Date.now()}`,
        type: 'W-T',
        title: 'Manajemen Risiko Terpadu & Restrukturisasi Prioritas Anggaran Sekolah',
        description: `Meminimalkan kelemahan ${weaknesses[0]?.title || 'tata kelola internal'} sekaligus mengantisipasi ancaman ${threats[0]?.title || 'perubahan regulasi atau faktor eksternal'}.`,
        actionPlan: [
          'Melakukan audit berkala inventaris sarana dan pemutakhiran data DAPODIK/ARKAS.',
          'Menyiapkan standar operasional prosedur (SOP) mitigasi darurat dan pelaporan tertib.'
        ],
        targetOutput: 'Sekolah memiliki ketahanan operasional tinggi dan tertib regulasi.',
        timeline: 'Akhir Semester',
        pic: 'Kepala Sekolah & Kepala Tata Usaha',
        priority: 'Prioritas Menengah',
        status: 'Rencana'
      }
    ];

    const updatedRecord: SWOTAnalysisRecord = {
      ...currentRecord,
      strategies: [...currentRecord.strategies, ...newStrategies],
      updatedAt: new Date().toISOString()
    };
    onSaveRecord(updatedRecord);
    showToast('Rekomendasi Strategi Otomatis Dihasilkan', '4 formulasi strategi TOWS terpadu (SO, WO, ST, WT) berhasil ditambahkan.', 'success');
  };

  // Export handlers
  const handleExportWord = () => {
    if (!currentRecord) return;
    try {
      exportSWOTToWord(currentRecord, settings);
      showToast('Berhasil Ekspor Word', `Matriks SWOT & TOWS untuk ${currentRecord.schoolName} telah diunduh (.doc).`, 'success');
    } catch (e) {
      console.error('Error exporting SWOT Word:', e);
      showToast('Gagal Ekspor Word', 'Terjadi kesalahan saat memproses berkas Word.', 'error');
    }
  };

  const handlePrintPdf = () => {
    if (!currentRecord) return;
    showToast('Menyiapkan Format Cetak', 'Membuka pratinjau cetak resmi kedinasan...', 'info');
    setTimeout(() => {
      printDocumentElement('printable-swot-tows-report', `Analisis_SWOT_TOWS_${currentRecord.schoolName.replace(/[^a-zA-Z0-9]/g, '_')}`);
    }, 150);
  };

  // Grouped items
  const strengths = useMemo(() => currentRecord?.items.filter((i) => i.quadrant === 'strength') || [], [currentRecord]);
  const weaknesses = useMemo(() => currentRecord?.items.filter((i) => i.quadrant === 'weakness') || [], [currentRecord]);
  const opportunities = useMemo(() => currentRecord?.items.filter((i) => i.quadrant === 'opportunity') || [], [currentRecord]);
  const threats = useMemo(() => currentRecord?.items.filter((i) => i.quadrant === 'threat') || [], [currentRecord]);

  // Grouped strategies
  const soStrategies = useMemo(() => currentRecord?.strategies.filter((s) => s.type === 'S-O') || [], [currentRecord]);
  const woStrategies = useMemo(() => currentRecord?.strategies.filter((s) => s.type === 'W-O') || [], [currentRecord]);
  const stStrategies = useMemo(() => currentRecord?.strategies.filter((s) => s.type === 'S-T') || [], [currentRecord]);
  const wtStrategies = useMemo(() => currentRecord?.strategies.filter((s) => s.type === 'W-T') || [], [currentRecord]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Banner & Action Buttons */}
      <div className="bg-gradient-to-r from-[#09153a] via-[#102258] to-[#1e1b4b] rounded-3xl p-6 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5 shadow-sm">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Supervisi Manajerial Kepala Sekolah</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                SWOT &amp; TOWS Matriks
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Analisis Strategis SWOT &amp; Matriks TOWS
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Instrumen formulasi strategi komprehensif kepala sekolah: Mengidentifikasi Kekuatan &amp; Kelemahan internal serta Peluang &amp; Tantangan eksternal guna menyusun 4 rumpun strategi manajerial terpadu (SO, WO, ST, WT).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleOpenAddRecord}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
              title="Buat Lembar Analisis SWOT Baru"
            >
              <Plus className="w-4 h-4" />
              <span>Analisis Baru</span>
            </button>
            <button
              onClick={handleExportWord}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
              title="Unduh Berkas Resmi Format Microsoft Word (.doc)"
            >
              <FileDown className="w-4 h-4 text-emerald-400" />
              <span>Ekspor Word</span>
            </button>
            <button
              onClick={handlePrintPdf}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
              title="Cetak / Simpan PDF Berstandar Kedinasan"
            >
              <Printer className="w-4 h-4 text-cyan-300" />
              <span>Cetak PDF</span>
            </button>
          </div>
        </div>

        {/* School Selector Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
              <School className="w-4 h-4 text-blue-400" />
              <span>Pilih Satuan Pendidikan Binaan:</span>
            </span>
            <select
              value={currentRecord?.principalId || ''}
              onChange={(e) => handlePrincipalSelect(e.target.value)}
              className="bg-slate-900/80 text-white border border-indigo-400/40 rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-inner"
            >
              {principals.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.satuanPendidikan} — {p.nama}
                </option>
              ))}
            </select>
          </div>

          {currentRecord && (
            <div className="flex items-center gap-4 text-xs text-slate-300 font-mono">
              <span>NPSN: <strong className="text-white">{currentRecord.schoolNpsn}</strong></span>
              <span>·</span>
              <span>Kepsek: <strong className="text-white">{currentRecord.headmasterName}</strong></span>
              <span>·</span>
              <span>Tanggal: <strong className="text-cyan-300">{currentRecord.date}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Content & Mode Tabs */}
      {currentRecord ? (
        <div className="space-y-6">
          {/* Summary Identity Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-blue-500" />
                  <span>{currentRecord.schoolName}</span>
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-0.5">
                  {currentRecord.title}
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  <strong>Fokus Pengawasan:</strong> {currentRecord.focusArea}
                </p>
              </div>

              {/* Stats overview pill */}
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-[10px] text-emerald-700 uppercase font-bold block">Kekuatan (S)</span>
                  <span className="text-sm font-black text-emerald-900">{strengths.length} Butir</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
                  <span className="text-[10px] text-rose-700 uppercase font-bold block">Kelemahan (W)</span>
                  <span className="text-sm font-black text-rose-900">{weaknesses.length} Butir</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-center">
                  <span className="text-[10px] text-blue-700 uppercase font-bold block">Peluang (O)</span>
                  <span className="text-sm font-black text-blue-900">{opportunities.length} Butir</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                  <span className="text-[10px] text-amber-700 uppercase font-bold block">Ancaman (T)</span>
                  <span className="text-sm font-black text-amber-900">{threats.length} Butir</span>
                </div>
              </div>
            </div>

            {/* Syntheses & Recommendation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
                <span className="font-bold text-blue-950 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Catatan Sintesis Pengawas Pembina:</span>
                </span>
                <p className="text-slate-700 leading-relaxed italic">
                  "{currentRecord.supervisorNotes || 'Belum ada catatan khusus.'}"
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Rekomendasi Tindak Lanjut Manajerial:</span>
                </span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {currentRecord.recommendation || 'Lanjutkan pemenuhan standar mutu dan pemutakhiran data secara teratur.'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('matrix-swot')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'matrix-swot'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>1. Matriks 4 Kuadran SWOT ({currentRecord.items.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('matrix-tows')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'matrix-tows'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>2. Matriks Strategi TOWS ({currentRecord.strategies.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('integrated')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'integrated'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>3. Matriks Silang Terpadu</span>
              </button>

              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'preview'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>4. Pratinjau Dokumen Resmi</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {activeTab === 'matrix-swot' && (
                <button
                  onClick={() => handleOpenAddItem('strength')}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Butir SWOT</span>
                </button>
              )}

              {activeTab === 'matrix-tows' && (
                <>
                  <button
                    onClick={handleAutoGenerateStrategies}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Hasilkan Strategi SO, WO, ST, WT secara instan berbasis butir SWOT yang ada"
                  >
                    <Zap className="w-3.5 h-3.5 text-purple-600" />
                    <span>Saran Strategi Otomatis</span>
                  </button>
                  <button
                    onClick={() => handleOpenAddStrategy('S-O')}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Strategi TOWS</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* TAB 1: 4 KUADRAN SWOT MATRIX */}
          {activeTab === 'matrix-swot' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* STRENGTHS (Kekuatan) */}
              <div className="bg-white rounded-2xl border-2 border-emerald-200 shadow-xs flex flex-col justify-between overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-sm">
                      S
                    </div>
                    <div>
                      <h3 className="font-bold text-sm tracking-wide">STRENGTHS (Kekuatan Internal)</h3>
                      <p className="text-[11px] text-emerald-100">Keunggulan manajerial, pendidik berprestasi, sarpras lengkap</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenAddItem('strength')}
                    className="p-1 hover:bg-white/20 rounded-md text-white transition-colors cursor-pointer"
                    title="Tambah Kekuatan Baru"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
                  {strengths.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      <p>Belum ada butir kekuatan (S) terdaftar.</p>
                      <button
                        onClick={() => handleOpenAddItem('strength')}
                        className="mt-2 text-emerald-600 font-bold hover:underline"
                      >
                        + Tambah Kekuatan Sekarang
                      </button>
                    </div>
                  ) : (
                    strengths.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl border border-emerald-200/80 transition-all space-y-1.5 text-xs group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {item.dimension}
                            </span>
                            <h4 className="font-bold text-slate-900 mt-1 text-xs">{item.title}</h4>
                          </div>
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEditItem(item)}
                              className="p-1 hover:bg-emerald-200 rounded text-emerald-800 transition-colors"
                              title="Edit Butir"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 hover:bg-rose-100 rounded text-rose-600 transition-colors"
                              title="Hapus Butir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{item.description}</p>
                        {item.impactOrEvidence && (
                          <div className="pt-1 text-[10.5px] text-emerald-800 font-medium">
                            <strong>Bukti/Dampak:</strong> {item.impactOrEvidence}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* WEAKNESSES (Kelemahan) */}
              <div className="bg-white rounded-2xl border-2 border-rose-200 shadow-xs flex flex-col justify-between overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-rose-600 to-pink-700 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-sm">
                      W
                    </div>
                    <div>
                      <h3 className="font-bold text-sm tracking-wide">WEAKNESSES (Kelemahan Internal)</h3>
                      <p className="text-[11px] text-rose-100">Keterbatasan sarana, kesenjangan IT guru, pengarsipan</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenAddItem('weakness')}
                    className="p-1 hover:bg-white/20 rounded-md text-white transition-colors cursor-pointer"
                    title="Tambah Kelemahan Baru"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
                  {weaknesses.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      <p>Belum ada butir kelemahan (W) terdaftar.</p>
                      <button
                        onClick={() => handleOpenAddItem('weakness')}
                        className="mt-2 text-rose-600 font-bold hover:underline"
                      >
                        + Tambah Kelemahan Sekarang
                      </button>
                    </div>
                  ) : (
                    weaknesses.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-rose-50/50 hover:bg-rose-50 rounded-xl border border-rose-200/80 transition-all space-y-1.5 text-xs group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-300">
                              {item.dimension}
                            </span>
                            <h4 className="font-bold text-slate-900 mt-1 text-xs">{item.title}</h4>
                          </div>
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEditItem(item)}
                              className="p-1 hover:bg-rose-200 rounded text-rose-800 transition-colors"
                              title="Edit Butir"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 hover:bg-rose-200 rounded text-rose-600 transition-colors"
                              title="Hapus Butir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{item.description}</p>
                        {item.impactOrEvidence && (
                          <div className="pt-1 text-[10.5px] text-rose-800 font-medium">
                            <strong>Bukti/Dampak:</strong> {item.impactOrEvidence}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* OPPORTUNITIES (Peluang) */}
              <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-xs flex flex-col justify-between overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-blue-600 to-cyan-700 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-sm">
                      O
                    </div>
                    <div>
                      <h3 className="font-bold text-sm tracking-wide">OPPORTUNITIES (Peluang Eksternal)</h3>
                      <p className="text-[11px] text-blue-100">BOS Kinerja, kemitraan komite, potensi agribisnis Sidrap</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenAddItem('opportunity')}
                    className="p-1 hover:bg-white/20 rounded-md text-white transition-colors cursor-pointer"
                    title="Tambah Peluang Baru"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
                  {opportunities.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      <p>Belum ada butir peluang (O) terdaftar.</p>
                      <button
                        onClick={() => handleOpenAddItem('opportunity')}
                        className="mt-2 text-blue-600 font-bold hover:underline"
                      >
                        + Tambah Peluang Sekarang
                      </button>
                    </div>
                  ) : (
                    opportunities.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-blue-50/50 hover:bg-blue-50 rounded-xl border border-blue-200/80 transition-all space-y-1.5 text-xs group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-300">
                              {item.dimension}
                            </span>
                            <h4 className="font-bold text-slate-900 mt-1 text-xs">{item.title}</h4>
                          </div>
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEditItem(item)}
                              className="p-1 hover:bg-blue-200 rounded text-blue-800 transition-colors"
                              title="Edit Butir"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 hover:bg-rose-100 rounded text-rose-600 transition-colors"
                              title="Hapus Butir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{item.description}</p>
                        {item.impactOrEvidence && (
                          <div className="pt-1 text-[10.5px] text-blue-800 font-medium">
                            <strong>Bukti/Dampak:</strong> {item.impactOrEvidence}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* THREATS (Ancaman) */}
              <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-xs flex flex-col justify-between overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-amber-600 to-orange-700 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-sm">
                      T
                    </div>
                    <div>
                      <h3 className="font-bold text-sm tracking-wide">THREATS (Ancaman &amp; Tantangan)</h3>
                      <p className="text-[11px] text-amber-100">Kecanduan gadget murid, perubahan regulasi, banjir musiman</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenAddItem('threat')}
                    className="p-1 hover:bg-white/20 rounded-md text-white transition-colors cursor-pointer"
                    title="Tambah Ancaman Baru"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
                  {threats.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      <p>Belum ada butir ancaman (T) terdaftar.</p>
                      <button
                        onClick={() => handleOpenAddItem('threat')}
                        className="mt-2 text-amber-600 font-bold hover:underline"
                      >
                        + Tambah Ancaman Sekarang
                      </button>
                    </div>
                  ) : (
                    threats.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-amber-50/50 hover:bg-amber-50 rounded-xl border border-amber-200/80 transition-all space-y-1.5 text-xs group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                              {item.dimension}
                            </span>
                            <h4 className="font-bold text-slate-900 mt-1 text-xs">{item.title}</h4>
                          </div>
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEditItem(item)}
                              className="p-1 hover:bg-amber-200 rounded text-amber-800 transition-colors"
                              title="Edit Butir"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 hover:bg-rose-100 rounded text-rose-600 transition-colors"
                              title="Hapus Butir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{item.description}</p>
                        {item.impactOrEvidence && (
                          <div className="pt-1 text-[10.5px] text-amber-900 font-medium">
                            <strong>Bukti/Dampak:</strong> {item.impactOrEvidence}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MATRIKS FORMULASI STRATEGI TOWS */}
          {activeTab === 'matrix-tows' && (
            <div className="space-y-6">
              {/* Strategi SO */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-black text-xs">
                      STRATEGI S - O
                    </span>
                    <div>
                      <h3 className="font-bold text-emerald-950 text-sm">
                        Maxi - Maxi: Memanfaatkan Kekuatan (S) untuk Merebut Peluang (O)
                      </h3>
                      <p className="text-[11px] text-emerald-700">Strategi ekspansi, inovasi unggulan, dan pemanfaatan hibah/program daerah</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenAddStrategy('S-O')}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah S-O</span>
                  </button>
                </div>

                <div className="p-4 divide-y divide-slate-100">
                  {soStrategies.length === 0 ? (
                    <p className="text-center py-4 text-xs text-slate-400">Belum ada strategi S-O.</p>
                  ) : (
                    soStrategies.map((strat) => (
                      <div key={strat.id} className="py-3 first:pt-0 last:pb-0 space-y-2 text-xs">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-sm">{strat.title}</h4>
                              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-blue-100 text-blue-800">
                                {strat.priority}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-emerald-100 text-emerald-800">
                                {strat.status}
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">{strat.description}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleOpenEditStrategy(strat)}
                              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStrategy(strat.id)}
                              className="p-1.5 hover:bg-rose-50 rounded text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Action Steps */}
                        {strat.actionPlan && strat.actionPlan.length > 0 && (
                          <div className="p-2.5 bg-slate-50 rounded-lg space-y-1">
                            <span className="font-bold text-slate-700 block text-[10.5px]">Langkah Aksi:</span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                              {strat.actionPlan.map((step, sIdx) => (
                                <li key={sIdx}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between text-[10.5px] text-slate-500 pt-1">
                          <span>Target: <strong className="text-slate-800">{strat.targetOutput || '-'}</strong></span>
                          <span>PIC: <strong className="text-slate-800">{strat.pic}</strong> ({strat.timeline})</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Strategi WO */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-black text-xs">
                      STRATEGI W - O
                    </span>
                    <div>
                      <h3 className="font-bold text-amber-950 text-sm">
                        Mini - Maxi: Meminimalkan Kelemahan (W) dengan Meraih Peluang (O)
                      </h3>
                      <p className="text-[11px] text-amber-700">Strategi pembinaan guru, peningkatan sarana via donatur/komite, peer coaching</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenAddStrategy('W-O')}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah W-O</span>
                  </button>
                </div>

                <div className="p-4 divide-y divide-slate-100">
                  {woStrategies.length === 0 ? (
                    <p className="text-center py-4 text-xs text-slate-400">Belum ada strategi W-O.</p>
                  ) : (
                    woStrategies.map((strat) => (
                      <div key={strat.id} className="py-3 first:pt-0 last:pb-0 space-y-2 text-xs">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-sm">{strat.title}</h4>
                              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-amber-100 text-amber-800">
                                {strat.priority}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-emerald-100 text-emerald-800">
                                {strat.status}
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">{strat.description}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleOpenEditStrategy(strat)}
                              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStrategy(strat.id)}
                              className="p-1.5 hover:bg-rose-50 rounded text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {strat.actionPlan && strat.actionPlan.length > 0 && (
                          <div className="p-2.5 bg-slate-50 rounded-lg space-y-1">
                            <span className="font-bold text-slate-700 block text-[10.5px]">Langkah Aksi:</span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                              {strat.actionPlan.map((step, sIdx) => (
                                <li key={sIdx}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between text-[10.5px] text-slate-500 pt-1">
                          <span>Target: <strong className="text-slate-800">{strat.targetOutput || '-'}</strong></span>
                          <span>PIC: <strong className="text-slate-800">{strat.pic}</strong> ({strat.timeline})</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Strategi ST */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-black text-xs">
                      STRATEGI S - T
                    </span>
                    <div>
                      <h3 className="font-bold text-indigo-950 text-sm">
                        Maxi - Mini: Menggunakan Kekuatan (S) untuk Mengatasi Ancaman (T)
                      </h3>
                      <p className="text-[11px] text-indigo-700">Pemanfaatan karakter disiplin &amp; satgas ramah anak untuk mencegah kenakalan remaja</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenAddStrategy('S-T')}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah S-T</span>
                  </button>
                </div>

                <div className="p-4 divide-y divide-slate-100">
                  {stStrategies.length === 0 ? (
                    <p className="text-center py-4 text-xs text-slate-400">Belum ada strategi S-T.</p>
                  ) : (
                    stStrategies.map((strat) => (
                      <div key={strat.id} className="py-3 first:pt-0 last:pb-0 space-y-2 text-xs">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-sm">{strat.title}</h4>
                              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-indigo-100 text-indigo-800">
                                {strat.priority}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-emerald-100 text-emerald-800">
                                {strat.status}
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">{strat.description}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleOpenEditStrategy(strat)}
                              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStrategy(strat.id)}
                              className="p-1.5 hover:bg-rose-50 rounded text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {strat.actionPlan && strat.actionPlan.length > 0 && (
                          <div className="p-2.5 bg-slate-50 rounded-lg space-y-1">
                            <span className="font-bold text-slate-700 block text-[10.5px]">Langkah Aksi:</span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                              {strat.actionPlan.map((step, sIdx) => (
                                <li key={sIdx}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between text-[10.5px] text-slate-500 pt-1">
                          <span>Target: <strong className="text-slate-800">{strat.targetOutput || '-'}</strong></span>
                          <span>PIC: <strong className="text-slate-800">{strat.pic}</strong> ({strat.timeline})</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Strategi WT */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-black text-xs">
                      STRATEGI W - T
                    </span>
                    <div>
                      <h3 className="font-bold text-rose-950 text-sm">
                        Mini - Mini: Meminimalkan Kelemahan (W) dan Menghindari Ancaman (T)
                      </h3>
                      <p className="text-[11px] text-rose-700">Mitigasi risiko krisis, penataan arsip digital teratur, pembenahan sanitasi/drainase</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenAddStrategy('W-T')}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah W-T</span>
                  </button>
                </div>

                <div className="p-4 divide-y divide-slate-100">
                  {wtStrategies.length === 0 ? (
                    <p className="text-center py-4 text-xs text-slate-400">Belum ada strategi W-T.</p>
                  ) : (
                    wtStrategies.map((strat) => (
                      <div key={strat.id} className="py-3 first:pt-0 last:pb-0 space-y-2 text-xs">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-sm">{strat.title}</h4>
                              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-rose-100 text-rose-800">
                                {strat.priority}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-emerald-100 text-emerald-800">
                                {strat.status}
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">{strat.description}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleOpenEditStrategy(strat)}
                              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStrategy(strat.id)}
                              className="p-1.5 hover:bg-rose-50 rounded text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {strat.actionPlan && strat.actionPlan.length > 0 && (
                          <div className="p-2.5 bg-slate-50 rounded-lg space-y-1">
                            <span className="font-bold text-slate-700 block text-[10.5px]">Langkah Aksi:</span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                              {strat.actionPlan.map((step, sIdx) => (
                                <li key={sIdx}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between text-[10.5px] text-slate-500 pt-1">
                          <span>Target: <strong className="text-slate-800">{strat.targetOutput || '-'}</strong></span>
                          <span>PIC: <strong className="text-slate-800">{strat.pic}</strong> ({strat.timeline})</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INTEGRATED 2X2 CROSS TOWS MATRIX */}
          {activeTab === 'integrated' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">Matriks Silang Interaktif TOWS (TOWS Cross-Matrix Grid)</h3>
                  <p className="text-xs text-slate-400">Peta visual hubungan faktor internal (S-W) dengan faktor eksternal (O-T)</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse border border-slate-200">
                  <thead>
                    <tr>
                      <th className="p-3 bg-slate-100 border border-slate-200 w-1/5 text-center font-bold text-slate-700">
                        FAKTOR INTERNAL / EKSTERNAL
                      </th>
                      <th className="p-3 bg-emerald-50 border border-emerald-200 w-2/5 text-left font-bold text-emerald-950">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded bg-emerald-600 text-white text-[11px] flex items-center justify-center">S</span>
                          <span>STRENGTHS (Kekuatan)</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-normal block mt-0.5">({strengths.length} butir terdaftar)</span>
                      </th>
                      <th className="p-3 bg-rose-50 border border-rose-200 w-2/5 text-left font-bold text-rose-950">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded bg-rose-600 text-white text-[11px] flex items-center justify-center">W</span>
                          <span>WEAKNESSES (Kelemahan)</span>
                        </div>
                        <span className="text-[10px] text-rose-700 font-normal block mt-0.5">({weaknesses.length} butir terdaftar)</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Row 1: Opportunities */}
                    <tr>
                      <td className="p-3 bg-blue-50 border border-blue-200 align-top font-bold text-blue-950">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded bg-blue-600 text-white text-[11px] flex items-center justify-center">O</span>
                          <span>OPPORTUNITIES (Peluang)</span>
                        </div>
                        <span className="text-[10px] text-blue-700 font-normal block mt-0.5">({opportunities.length} butir)</span>
                        <ul className="mt-2 space-y-1 text-[10px] text-slate-600 font-normal">
                          {opportunities.slice(0, 3).map((op) => (
                            <li key={op.id}>• {op.title}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-3 border border-slate-200 align-top bg-emerald-50/20">
                        <div className="font-bold text-emerald-900 mb-1 flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                          <span>STRATEGI S - O (Maxi-Maxi)</span>
                        </div>
                        {soStrategies.length === 0 ? (
                          <span className="text-slate-400 italic">Belum ada strategi</span>
                        ) : (
                          <ul className="space-y-1.5">
                            {soStrategies.map((s) => (
                              <li key={s.id} className="p-1.5 bg-white rounded border border-emerald-200 shadow-2xs">
                                <strong>{s.title}</strong>
                                <p className="text-[10px] text-slate-600 mt-0.5">{s.description}</p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="p-3 border border-slate-200 align-top bg-amber-50/20">
                        <div className="font-bold text-amber-900 mb-1 flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
                          <span>STRATEGI W - O (Mini-Maxi)</span>
                        </div>
                        {woStrategies.length === 0 ? (
                          <span className="text-slate-400 italic">Belum ada strategi</span>
                        ) : (
                          <ul className="space-y-1.5">
                            {woStrategies.map((s) => (
                              <li key={s.id} className="p-1.5 bg-white rounded border border-amber-200 shadow-2xs">
                                <strong>{s.title}</strong>
                                <p className="text-[10px] text-slate-600 mt-0.5">{s.description}</p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>

                    {/* Row 2: Threats */}
                    <tr>
                      <td className="p-3 bg-amber-50 border border-amber-200 align-top font-bold text-amber-950">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded bg-amber-600 text-white text-[11px] flex items-center justify-center">T</span>
                          <span>THREATS (Ancaman)</span>
                        </div>
                        <span className="text-[10px] text-amber-700 font-normal block mt-0.5">({threats.length} butir)</span>
                        <ul className="mt-2 space-y-1 text-[10px] text-slate-600 font-normal">
                          {threats.slice(0, 3).map((th) => (
                            <li key={th.id}>• {th.title}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-3 border border-slate-200 align-top bg-indigo-50/20">
                        <div className="font-bold text-indigo-900 mb-1 flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5 text-indigo-600" />
                          <span>STRATEGI S - T (Maxi-Mini)</span>
                        </div>
                        {stStrategies.length === 0 ? (
                          <span className="text-slate-400 italic">Belum ada strategi</span>
                        ) : (
                          <ul className="space-y-1.5">
                            {stStrategies.map((s) => (
                              <li key={s.id} className="p-1.5 bg-white rounded border border-indigo-200 shadow-2xs">
                                <strong>{s.title}</strong>
                                <p className="text-[10px] text-slate-600 mt-0.5">{s.description}</p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="p-3 border border-slate-200 align-top bg-rose-50/20">
                        <div className="font-bold text-rose-900 mb-1 flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                          <span>STRATEGI W - T (Mini-Mini)</span>
                        </div>
                        {wtStrategies.length === 0 ? (
                          <span className="text-slate-400 italic">Belum ada strategi</span>
                        ) : (
                          <ul className="space-y-1.5">
                            {wtStrategies.map((s) => (
                              <li key={s.id} className="p-1.5 bg-white rounded border border-rose-200 shadow-2xs">
                                <strong>{s.title}</strong>
                                <p className="text-[10px] text-slate-600 mt-0.5">{s.description}</p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL DOCUMENT PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              {/* Preview Control Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Printer className="w-4 h-4 text-amber-600" />
                    <span>Pratinjau Format Kedinasan (Kop Resmi &amp; Tanda Tangan)</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Logo Kiri (Pemkab Sidrap) &amp; Logo Kanan (Tut Wuri) Aktif
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportWord}
                    className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5 text-blue-600" />
                    <span>Unduh Word (.doc)</span>
                  </button>
                  <button
                    onClick={handlePrintPdf}
                    className="px-4 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-white" />
                    <span>Cetak PDF Resmi</span>
                  </button>
                </div>
              </div>

              {/* Document Paper Container */}
              <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-md max-w-4xl mx-auto font-serif text-slate-900 leading-relaxed">
                {/* Double Logo Kop */}
                <div className="flex items-center justify-between border-b-4 border-double border-slate-900 pb-3 mb-5 gap-3">
                  <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                    <img
                      src={settings.logoUrl || DEFAULT_SIDRAP_LOGO}
                      alt="Logo Kabupaten Sidenreng Rappang"
                      className="max-h-20 max-w-20 object-contain"
                    />
                  </div>
                  <div className="flex-1 text-center font-serif px-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 leading-tight">
                      {settings.governmentAgency || 'PEMERINTAH KABUPATEN SIDENRENG RAPPANG'}
                    </h3>
                    <h2 className="text-base font-black uppercase tracking-wider text-slate-900 mt-0.5 leading-tight">
                      DINAS PENDIDIKAN DAN KEBUDAYAAN
                    </h2>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-slate-800 mt-0.5">
                      KOORDINATOR PENGAWAS SEKOLAH MENENGAH PERTAMA
                    </h4>
                    <p className="text-[10px] text-slate-600 italic mt-1 font-sans">
                      Alamat: Kompleks SKPD Jl. Harapan Baru No. 1, Pangkajene, Kab. Sidenreng Rappang, Sulawesi Selatan (91611)
                    </p>
                  </div>
                  <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                    <img
                      src={settings.logoRightUrl || DEFAULT_TUTWURI_LOGO}
                      alt="Logo Tut Wuri Handayani"
                      className="max-h-20 max-w-20 object-contain"
                    />
                  </div>
                </div>

                {/* Document Title */}
                <div className="text-center mb-5">
                  <h2 className="text-sm font-bold uppercase underline tracking-wider">
                    INSTRUMEN ANALISIS STRATEGIS SWOT &amp; MATRIKS TOWS
                  </h2>
                  <p className="text-xs font-bold text-slate-800 uppercase mt-0.5">
                    SUPERVISI MANAJERIAL KEPEMIMPINAN KEPALA SEKOLAH
                  </p>
                </div>

                {/* Identity Table */}
                <table className="w-full text-xs mb-5 border-collapse">
                  <tbody>
                    <tr>
                      <td className="w-36 py-1 font-semibold">Satuan Pendidikan</td>
                      <td className="w-3 py-1">:</td>
                      <td className="py-1 font-bold">{currentRecord.schoolName} (NPSN: {currentRecord.schoolNpsn})</td>
                      <td className="w-32 py-1 font-semibold">Tahun Pelajaran</td>
                      <td className="w-3 py-1">:</td>
                      <td className="py-1">{currentRecord.academicYear}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold">Kepala Sekolah</td>
                      <td className="py-1">:</td>
                      <td className="py-1 font-bold">{currentRecord.headmasterName}</td>
                      <td className="py-1 font-semibold">Semester</td>
                      <td className="py-1">:</td>
                      <td className="py-1">Semester {currentRecord.semester}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold">NIP / Pangkat</td>
                      <td className="py-1">:</td>
                      <td className="py-1">{currentRecord.headmasterNip} ({currentRecord.headmasterRank || '-'})</td>
                      <td className="py-1 font-semibold">Tanggal Supervisi</td>
                      <td className="py-1">:</td>
                      <td className="py-1">
                        {new Date(currentRecord.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold">Fokus Pengawasan</td>
                      <td className="py-1">:</td>
                      <td className="py-1 font-bold" colSpan={4}>{currentRecord.focusArea}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Synthesis Box */}
                <div className="p-3 bg-blue-50/50 border-l-4 border-blue-600 mb-5 text-xs">
                  <strong className="block text-slate-900 mb-0.5">Catatan Sintesis Pengawas Pembina:</strong>
                  <p className="italic text-slate-700">"{currentRecord.supervisorNotes || '-'}"</p>
                </div>

                {/* I. SWOT Matrix Table */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold uppercase border-b border-slate-900 pb-1 mb-3">
                    I. Matriks 4 Kuadran SWOT (Strengths, Weaknesses, Opportunities, Threats)
                  </h4>
                  <table className="w-full border-collapse border border-slate-900 text-xs mb-4">
                    <tbody>
                      <tr>
                        <td className="w-1/2 p-2.5 border border-slate-900 align-top bg-emerald-50/20">
                          <strong className="block text-emerald-950 uppercase border-b border-emerald-300 pb-1 mb-1.5 font-bold">
                            S - STRENGTHS (Kekuatan Internal):
                          </strong>
                          <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                            {strengths.map((it) => (
                              <li key={it.id}>
                                <strong>{it.title}:</strong> {it.description}
                              </li>
                            ))}
                          </ol>
                        </td>
                        <td className="w-1/2 p-2.5 border border-slate-900 align-top bg-rose-50/20">
                          <strong className="block text-rose-950 uppercase border-b border-rose-300 pb-1 mb-1.5 font-bold">
                            W - WEAKNESSES (Kelemahan Internal):
                          </strong>
                          <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                            {weaknesses.map((it) => (
                              <li key={it.id}>
                                <strong>{it.title}:</strong> {it.description}
                              </li>
                            ))}
                          </ol>
                        </td>
                      </tr>
                      <tr>
                        <td className="w-1/2 p-2.5 border border-slate-900 align-top bg-blue-50/20">
                          <strong className="block text-blue-950 uppercase border-b border-blue-300 pb-1 mb-1.5 font-bold">
                            O - OPPORTUNITIES (Peluang Eksternal):
                          </strong>
                          <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                            {opportunities.map((it) => (
                              <li key={it.id}>
                                <strong>{it.title}:</strong> {it.description}
                              </li>
                            ))}
                          </ol>
                        </td>
                        <td className="w-1/2 p-2.5 border border-slate-900 align-top bg-amber-50/20">
                          <strong className="block text-amber-950 uppercase border-b border-amber-300 pb-1 mb-1.5 font-bold">
                            T - THREATS (Ancaman / Tantangan):
                          </strong>
                          <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                            {threats.map((it) => (
                              <li key={it.id}>
                                <strong>{it.title}:</strong> {it.description}
                              </li>
                            ))}
                          </ol>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* II. TOWS Strategies Table */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold uppercase border-b border-slate-900 pb-1 mb-3">
                    II. Matriks Formulasi Strategi Terpadu TOWS (SO, WO, ST, WT)
                  </h4>
                  <table className="w-full border-collapse border border-slate-900 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-center font-bold">
                        <th className="border border-slate-900 p-1.5 w-10">No</th>
                        <th className="border border-slate-900 p-1.5 w-20">Tipe</th>
                        <th className="border border-slate-900 p-1.5 w-44">Inisiatif Strategis</th>
                        <th className="border border-slate-900 p-1.5">Langkah Aksi &amp; Uraian Strategi</th>
                        <th className="border border-slate-900 p-1.5 w-32">Target Output &amp; PIC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRecord.strategies.map((st, idx) => (
                        <tr key={st.id}>
                          <td className="border border-slate-900 p-1.5 text-center align-top">{idx + 1}</td>
                          <td className="border border-slate-900 p-1.5 text-center align-top font-bold text-slate-800">
                            {st.type}
                          </td>
                          <td className="border border-slate-900 p-1.5 align-top">
                            <strong>{st.title}</strong>
                          </td>
                          <td className="border border-slate-900 p-1.5 align-top">
                            <p className="mb-1">{st.description}</p>
                            {st.actionPlan && st.actionPlan.length > 0 && (
                              <ul className="list-disc list-inside text-[10px] space-y-0.5">
                                {st.actionPlan.map((step, sIdx) => (
                                  <li key={sIdx}>{step}</li>
                                ))}
                              </ul>
                            )}
                          </td>
                          <td className="border border-slate-900 p-1.5 align-top text-[10px]">
                            <strong>{st.targetOutput}</strong><br/>
                            <span className="text-slate-600">PIC: {st.pic}</span><br/>
                            <span className="italic">{st.timeline}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Recommendations */}
                <div className="p-3 bg-emerald-50/50 border-l-4 border-emerald-600 mb-6 text-xs">
                  <strong className="block text-slate-900 mb-0.5">Rekomendasi Tindak Lanjut Manajerial:</strong>
                  <p className="whitespace-pre-wrap text-slate-700">{currentRecord.recommendation || '-'}</p>
                </div>

                {/* Dual Signature Block */}
                <div className="grid grid-cols-2 text-xs text-center pt-4 border-t border-slate-300">
                  <div>
                    <p>Mengetahui / Memeriksa,</p>
                    <p className="font-bold text-slate-900 mt-1">Kepala Sekolah Yang Disupervisi,</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline text-slate-900">{currentRecord.headmasterName}</p>
                    <p className="text-slate-600">NIP. {currentRecord.headmasterNip}</p>
                  </div>
                  <div>
                    <p>{settings.schoolCity || 'Kabupaten Sidenreng Rappang'}, {new Date(currentRecord.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="font-bold text-slate-900 mt-1">{settings.supervisorRole || 'Pengawas Sekolah Pembina'},</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline text-slate-900">{settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'}</p>
                    <p className="text-slate-600">NIP. {settings.supervisorNip || '19830819 201001 1 002'}</p>
                    <p className="text-[10px] text-slate-500">Pangkat/Golongan: {settings.supervisorRank || 'Penata Tk. I / III.d'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Target className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">Belum ada data Analisis SWOT</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Klik tombol di bawah untuk membuat analisis strategis SWOT &amp; TOWS pertama untuk sekolah binaan.
          </p>
          <button
            onClick={handleOpenAddRecord}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Analisis SWOT Baru</span>
          </button>
        </div>
      )}

      {/* 3. HIDDEN PRINTABLE CONTAINER FOR OFFICIAL REPORT (PDF) */}
      {currentRecord && (
        <div id="printable-swot-tows-report" className="hidden bg-white text-slate-900 p-8 font-serif leading-relaxed">
          {/* KOP DINAS RESMI KABUPATEN SIDENRENG RAPPANG */}
          <div className="flex items-center justify-between border-b-4 border-double border-slate-900 pb-3 mb-5 gap-3">
            <div className="w-20 h-20 shrink-0 flex items-center justify-center">
              <img
                src={settings.logoUrl || DEFAULT_SIDRAP_LOGO}
                alt="Logo Kabupaten Sidenreng Rappang"
                width={75}
                height={80}
                style={{ objectFit: 'contain' }}
                className="max-h-20 max-w-20 object-contain"
              />
            </div>
            <div className="flex-1 text-center font-serif px-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 leading-tight">
                {settings.governmentAgency || 'PEMERINTAH KABUPATEN SIDENRENG RAPPANG'}
              </h3>
              <h2 className="text-base font-black uppercase tracking-wider text-slate-900 mt-0.5 leading-tight">
                DINAS PENDIDIKAN DAN KEBUDAYAAN
              </h2>
              <h4 className="text-xs font-bold uppercase tracking-wide text-slate-800 mt-0.5">
                KOORDINATOR PENGAWAS SEKOLAH MENENGAH PERTAMA
              </h4>
              <p className="text-[10px] text-slate-600 italic mt-1 font-sans">
                Alamat: Kompleks SKPD Jl. Harapan Baru No. 1, Pangkajene, Kab. Sidenreng Rappang, Sulawesi Selatan (91611)
              </p>
            </div>
            <div className="w-20 h-20 shrink-0 flex items-center justify-center">
              <img
                src={settings.logoRightUrl || DEFAULT_TUTWURI_LOGO}
                alt="Logo Tut Wuri Handayani"
                width={75}
                height={80}
                style={{ objectFit: 'contain' }}
                className="max-h-20 max-w-20 object-contain"
              />
            </div>
          </div>

          <div className="text-center mb-5">
            <h2 className="text-sm font-bold uppercase underline tracking-wider">
              INSTRUMEN ANALISIS STRATEGIS SWOT &amp; MATRIKS TOWS
            </h2>
            <p className="text-xs font-bold text-slate-800 uppercase mt-0.5">
              SUPERVISI MANAJERIAL KEPEMIMPINAN KEPALA SEKOLAH
            </p>
          </div>

          {/* Identity Table */}
          <table className="w-full text-xs mb-5 border-collapse">
            <tbody>
              <tr>
                <td className="w-36 py-1 font-semibold">Satuan Pendidikan</td>
                <td className="w-3 py-1">:</td>
                <td className="py-1 font-bold">{currentRecord.schoolName} (NPSN: {currentRecord.schoolNpsn})</td>
                <td className="w-32 py-1 font-semibold">Tahun Pelajaran</td>
                <td className="w-3 py-1">:</td>
                <td className="py-1">{currentRecord.academicYear}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">Kepala Sekolah</td>
                <td className="py-1">:</td>
                <td className="py-1 font-bold">{currentRecord.headmasterName}</td>
                <td className="py-1 font-semibold">Semester</td>
                <td className="py-1">:</td>
                <td className="py-1">Semester {currentRecord.semester}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">NIP / Pangkat</td>
                <td className="py-1">:</td>
                <td className="py-1">{currentRecord.headmasterNip} ({currentRecord.headmasterRank || '-'})</td>
                <td className="py-1 font-semibold">Tanggal Supervisi</td>
                <td className="py-1">:</td>
                <td className="py-1">
                  {new Date(currentRecord.date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">Fokus Pengawasan</td>
                <td className="py-1">:</td>
                <td className="py-1 font-bold" colSpan={4}>{currentRecord.focusArea}</td>
              </tr>
            </tbody>
          </table>

          {/* I. MATRIKS SWOT */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase border-b border-slate-900 pb-1 mb-3">
              I. Matriks 4 Kuadran SWOT (Strengths, Weaknesses, Opportunities, Threats)
            </h4>
            <table className="w-full border-collapse border border-slate-900 text-xs mb-4">
              <tbody>
                <tr>
                  <td className="w-1/2 p-2.5 border border-slate-900 align-top bg-emerald-50/20">
                    <strong className="block text-emerald-950 uppercase border-b border-emerald-300 pb-1 mb-1.5 font-bold">
                      S - STRENGTHS (Kekuatan Internal):
                    </strong>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                      {strengths.map((it) => (
                        <li key={it.id}>
                          <strong>{it.title}:</strong> {it.description}
                        </li>
                      ))}
                    </ol>
                  </td>
                  <td className="w-1/2 p-2.5 border border-slate-900 align-top bg-rose-50/20">
                    <strong className="block text-rose-950 uppercase border-b border-rose-300 pb-1 mb-1.5 font-bold">
                      W - WEAKNESSES (Kelemahan Internal):
                    </strong>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                      {weaknesses.map((it) => (
                        <li key={it.id}>
                          <strong>{it.title}:</strong> {it.description}
                        </li>
                      ))}
                    </ol>
                  </td>
                </tr>
                <tr>
                  <td className="w-1/2 p-2.5 border border-slate-900 align-top bg-blue-50/20">
                    <strong className="block text-blue-950 uppercase border-b border-blue-300 pb-1 mb-1.5 font-bold">
                      O - OPPORTUNITIES (Peluang Eksternal):
                    </strong>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                      {opportunities.map((it) => (
                        <li key={it.id}>
                          <strong>{it.title}:</strong> {it.description}
                        </li>
                      ))}
                    </ol>
                  </td>
                  <td className="w-1/2 p-2.5 border border-slate-900 align-top bg-amber-50/20">
                    <strong className="block text-amber-950 uppercase border-b border-amber-300 pb-1 mb-1.5 font-bold">
                      T - THREATS (Ancaman / Tantangan):
                    </strong>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                      {threats.map((it) => (
                        <li key={it.id}>
                          <strong>{it.title}:</strong> {it.description}
                        </li>
                      ))}
                    </ol>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* II. MATRIKS FORMULASI STRATEGI TOWS */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase border-b border-slate-900 pb-1 mb-3">
              II. Matriks Formulasi Strategi Terpadu TOWS (SO, WO, ST, WT)
            </h4>
            <table className="w-full border-collapse border border-slate-900 text-xs">
              <thead>
                <tr className="bg-slate-100 text-center">
                  <th className="border border-slate-900 p-1.5 w-12">No</th>
                  <th className="border border-slate-900 p-1.5 w-24">Tipe</th>
                  <th className="border border-slate-900 p-1.5 w-44">Inisiatif Strategis</th>
                  <th className="border border-slate-900 p-1.5">Langkah Aksi &amp; Uraian Strategi</th>
                  <th className="border border-slate-900 p-1.5 w-32">Target Output &amp; PIC</th>
                </tr>
              </thead>
              <tbody>
                {currentRecord.strategies.map((st, idx) => (
                  <tr key={st.id}>
                    <td className="border border-slate-900 p-1.5 text-center align-top">{idx + 1}</td>
                    <td className="border border-slate-900 p-1.5 text-center align-top font-bold">
                      {st.type}
                    </td>
                    <td className="border border-slate-900 p-1.5 align-top">
                      <strong>{st.title}</strong>
                    </td>
                    <td className="border border-slate-900 p-1.5 align-top">
                      <p className="mb-1">{st.description}</p>
                      {st.actionPlan && st.actionPlan.length > 0 && (
                        <ul className="list-disc list-inside text-[10px] space-y-0.5">
                          {st.actionPlan.map((step, sIdx) => (
                            <li key={sIdx}>{step}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="border border-slate-900 p-1.5 align-top text-[10px]">
                      <strong>{st.targetOutput}</strong><br/>
                      <span className="text-slate-600">PIC: {st.pic}</span><br/>
                      <span className="italic">{st.timeline}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Catatan & Rekomendasi */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-8">
            <div className="p-3 border border-slate-400 bg-slate-50 rounded">
              <strong className="block mb-1 font-bold">Catatan Sintesis Pengawas Pembina:</strong>
              <p className="italic text-slate-800">{currentRecord.supervisorNotes || '-'}</p>
            </div>
            <div className="p-3 border border-slate-400 bg-slate-50 rounded">
              <strong className="block mb-1 font-bold">Rekomendasi Tindak Lanjut Manajerial:</strong>
              <p className="whitespace-pre-wrap text-slate-800">{currentRecord.recommendation || '-'}</p>
            </div>
          </div>

          {/* Signature Block */}
          <div className="grid grid-cols-2 text-xs text-center pt-4 border-t border-slate-300">
            <div>
              <p>Mengetahui / Memeriksa,</p>
              <p className="font-bold text-slate-900 mt-1">Kepala Sekolah Yang Disupervisi,</p>
              <div className="h-16"></div>
              <p className="font-bold underline text-slate-900">{currentRecord.headmasterName}</p>
              <p className="text-slate-600">NIP. {currentRecord.headmasterNip}</p>
            </div>
            <div>
              <p>{settings.schoolCity || 'Kabupaten Sidenreng Rappang'}, {new Date(currentRecord.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-bold text-slate-900 mt-1">{settings.supervisorRole || 'Pengawas Sekolah Pembina'},</p>
              <div className="h-16"></div>
              <p className="font-bold underline text-slate-900">{settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'}</p>
              <p className="text-slate-600">NIP. {settings.supervisorNip || '19830819 201001 1 002'}</p>
              <p className="text-[10px] text-slate-500">Pangkat/Golongan: {settings.supervisorRank || 'Penata Tk. I / III.d'}</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL BUAT ANALISIS SWOT BARU */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 my-8 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-300" />
                <h3 className="text-base font-bold">Buat Dokumen Analisis SWOT &amp; TOWS Baru</h3>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecordModal} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pilih Satuan Pendidikan Binaan:
                </label>
                <select
                  value={recordForm.principalId}
                  onChange={(e) => {
                    const selected = principals.find((p) => p.id === e.target.value);
                    if (selected) {
                      setRecordForm({
                        ...recordForm,
                        principalId: selected.id,
                        schoolName: selected.satuanPendidikan,
                        schoolNpsn: selected.npsn || '40301000',
                        headmasterName: selected.nama,
                        headmasterNip: selected.nip || '-',
                        headmasterRank: selected.pangkatGolongan || 'Pembina (IV/a)'
                      });
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  {principals.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.satuanPendidikan} ({p.nama})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Dokumen Analisis:</label>
                <input
                  type="text"
                  required
                  value={recordForm.title}
                  onChange={(e) => setRecordForm({ ...recordForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fokus Pengawasan Manajerial:</label>
                <input
                  type="text"
                  required
                  value={recordForm.focusArea}
                  onChange={(e) => setRecordForm({ ...recordForm, focusArea: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tahun Pelajaran:</label>
                  <input
                    type="text"
                    value={recordForm.academicYear}
                    onChange={(e) => setRecordForm({ ...recordForm, academicYear: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Supervisi:</label>
                  <input
                    type="date"
                    value={recordForm.date}
                    onChange={(e) => setRecordForm({ ...recordForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Sintesis Pengawas:</label>
                <textarea
                  rows={2}
                  value={recordForm.supervisorNotes}
                  onChange={(e) => setRecordForm({ ...recordForm, supervisorNotes: e.target.value })}
                  placeholder="Catatan pengawas mengenai kondisi umum sekolah..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rekomendasi Tindak Lanjut Manajerial:</label>
                <textarea
                  rows={2}
                  value={recordForm.recommendation}
                  onChange={(e) => setRecordForm({ ...recordForm, recommendation: e.target.value })}
                  placeholder="Arahan tindak lanjut kepala sekolah..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer shadow-md shadow-blue-600/20"
                >
                  Simpan &amp; Mulai Analisis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL TAMBAH / EDIT BUTIR SWOT */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 my-8 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-200" />
                <h3 className="text-base font-bold">
                  {editingItemId ? 'Edit Butir Analisis SWOT' : 'Tambah Butir Analisis SWOT Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kuadran SWOT:</label>
                  <select
                    value={itemForm.quadrant}
                    onChange={(e) => setItemForm({ ...itemForm, quadrant: e.target.value as SWOTQuadrantType })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                  >
                    <option value="strength">S - Kekuatan (Strength)</option>
                    <option value="weakness">W - Kelemahan (Weakness)</option>
                    <option value="opportunity">O - Peluang (Opportunity)</option>
                    <option value="threat">T - Ancaman (Threat)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dimensi Manajemen / Standar:</label>
                  <select
                    value={itemForm.dimension}
                    onChange={(e) => setItemForm({ ...itemForm, dimension: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  >
                    <option value="Standar Pengelolaan">Standar Pengelolaan</option>
                    <option value="Standar Pendidik & Tenaga Kependidikan">Standar Pendidik (PTK)</option>
                    <option value="Standar Sarana & Prasarana">Sarana &amp; Prasarana</option>
                    <option value="Standar Pembiayaan & RKAS">Pembiayaan &amp; BOSP</option>
                    <option value="Kurikulum & Pembelajaran">Kurikulum &amp; Pembelajaran</option>
                    <option value="Budaya & Iklim Sekolah">Budaya &amp; Iklim Sekolah</option>
                    <option value="Kemitraan & Eksternal">Kemitraan &amp; Eksternal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul / Pokok Butir Analisis:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 100% Guru Mengaktifkan Akun Belajar.id & PMM"
                  value={itemForm.title}
                  onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Uraian / Deskripsi Konteks Lapangan:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan fakta objektif di sekolah secara terperinci..."
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bukti Fisik / Indikator Dampak Terukur:</label>
                <input
                  type="text"
                  placeholder="Contoh: Terverifikasi pada data dashboard Rapor Pendidikan 2026"
                  value={itemForm.impactOrEvidence}
                  onChange={(e) => setItemForm({ ...itemForm, impactOrEvidence: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tingkat Urgensi:</label>
                  <select
                    value={itemForm.urgency}
                    onChange={(e) => setItemForm({ ...itemForm, urgency: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  >
                    <option value="Sangat Tinggi">Sangat Tinggi</option>
                    <option value="Tinggi">Tinggi</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Rendah">Rendah</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Skor Bobot (1 - 100):</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={itemForm.score}
                    onChange={(e) => setItemForm({ ...itemForm, score: parseInt(e.target.value, 10) || 80 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  Simpan Butir SWOT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL TAMBAH / EDIT STRATEGI TOWS */}
      {isStrategyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 my-8 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="text-base font-bold">
                  {editingStrategyId ? 'Edit Formulasi Strategi TOWS' : 'Tambah Formulasi Strategi TOWS Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsStrategyModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStrategy} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipe Strategi TOWS:</label>
                <select
                  value={strategyForm.type}
                  onChange={(e) => setStrategyForm({ ...strategyForm, type: e.target.value as TOWSStrategyType })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value="S-O">Strategi S - O (Maxi - Maxi: Gunakan Kekuatan untuk Raih Peluang)</option>
                  <option value="W-O">Strategi W - O (Mini - Maxi: Atasi Kelemahan dengan Raih Peluang)</option>
                  <option value="S-T">Strategi S - T (Maxi - Mini: Gunakan Kekuatan untuk Tangkal Ancaman)</option>
                  <option value="W-T">Strategi W - T (Mini - Mini: Minimalisir Kelemahan & Hindari Ancaman)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Inisiatif Strategis:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Akselerasi Sekolah Rujukan Digital & P5 Berbasis Agribisnis"
                  value={strategyForm.title}
                  onChange={(e) => setStrategyForm({ ...strategyForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Uraian / Deskripsi Strategi:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Uraikan strategi kombinasi yang akan ditempuh sekolah..."
                  value={strategyForm.description}
                  onChange={(e) => setStrategyForm({ ...strategyForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Rencana Langkah Aksi (Satu langkah per baris):
                </label>
                <textarea
                  rows={3}
                  placeholder="Langkah 1: Bentuk tim kerja khusus&#10;Langkah 2: Susun jadwal implementasi&#10;Langkah 3: Evaluasi bulanan"
                  value={strategyForm.actionPlanText}
                  onChange={(e) => setStrategyForm({ ...strategyForm, actionPlanText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Output Terukur:</label>
                <input
                  type="text"
                  placeholder="Contoh: Terwujudnya 6 produk proyek digital siswa & nilai rapor mutu meningkat"
                  value={strategyForm.targetOutput}
                  onChange={(e) => setStrategyForm({ ...strategyForm, targetOutput: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Waktu (Timeline):</label>
                  <input
                    type="text"
                    placeholder="Contoh: Semester Ganjil 2026/2027"
                    value={strategyForm.timeline}
                    onChange={(e) => setStrategyForm({ ...strategyForm, timeline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Penanggung Jawab (PIC):</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kepala Sekolah & Tim Kurikulum"
                    value={strategyForm.pic}
                    onChange={(e) => setStrategyForm({ ...strategyForm, pic: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prioritas:</label>
                  <select
                    value={strategyForm.priority}
                    onChange={(e) => setStrategyForm({ ...strategyForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  >
                    <option value="Prioritas Utama">Prioritas Utama</option>
                    <option value="Prioritas Menengah">Prioritas Menengah</option>
                    <option value="Jangka Panjang">Jangka Panjang</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Eksekusi:</label>
                  <select
                    value={strategyForm.status}
                    onChange={(e) => setStrategyForm({ ...strategyForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold"
                  >
                    <option value="Rencana">Rencana</option>
                    <option value="Dalam Proses">Dalam Proses</option>
                    <option value="Terealisasi">Terealisasi</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStrategyModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  Simpan Strategi TOWS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
