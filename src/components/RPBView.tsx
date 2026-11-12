/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  GitFork,
  Plus,
  Search,
  School,
  User,
  Calendar,
  FileText,
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
  AlertTriangle,
  Lightbulb,
  X,
  FileSpreadsheet,
  Layers,
  Workflow,
  Target,
  ShieldCheck,
  Award,
  Compass,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import {
  RPBRecord,
  RPBItem,
  RPBQuadrant,
  RPBStrategy,
  RPBMethod,
  RPBStage,
  Principal,
  AppSettings
} from '../types/inspiro';
import { exportRPBToWord } from '../utils/storage';
import { printDocumentElement } from '../utils/documentExport';
import { DEFAULT_SIDRAP_LOGO, DEFAULT_TUTWURI_LOGO } from '../data/defaultLogos';
import {
  generateRPBPlanAI,
  determineQuadrantAndStrategy,
  generateBaselineDiagnosisAI,
  generateGeneralObjectiveAI
} from '../services/aiRPBGenerator';

interface RPBViewProps {
  records: RPBRecord[];
  principals: Principal[];
  settings: AppSettings;
  onSaveRecord: (record: RPBRecord) => void;
  onDeleteRecord: (id: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

const COMMON_RAPOR_PRIORITIES = [
  'D.1 Kualitas Pembelajaran',
  'A.1 Kemampuan Literasi',
  'A.2 Kemampuan Numerasi',
  'D.4 Iklim Keamanan Sekolah',
  'D.8 Iklim Kebinekaan',
  'D.2 Refleksi & Perbaikan Pembelajaran oleh Pendidik',
  'D.3 Kepemimpinan Instruksional',
  'E.1 Partisipasi Warga Satuan Pendidikan'
];

export const RPBView: React.FC<RPBViewProps> = ({
  records,
  principals,
  settings,
  onSaveRecord,
  onDeleteRecord,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [quadrantFilter, setQuadrantFilter] = useState('all');
  const [strategyFilter, setStrategyFilter] = useState('all');

  // Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<RPBRecord | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isGeneratingDiagnosis, setIsGeneratingDiagnosis] = useState(false);
  const [isGeneratingObjective, setIsGeneratingObjective] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<RPBRecord>>({
    title: '',
    principalId: '',
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
    date: new Date().toISOString().split('T')[0],
    leadershipCapacity: 'Tinggi',
    changeCommitment: 'Tinggi',
    quadrant: 'Kuadran I: Mandiri (Kapasitas Tinggi, Komitmen Tinggi)',
    strategy: 'Pemacu Perubahan (Catalyst)',
    raporPriorities: ['D.1 Kualitas Pembelajaran', 'A.1 Kemampuan Literasi'],
    baselineDiagnosis: '',
    generalObjective: '',
    supervisorNotes: '',
    items: [],
    status: 'final'
  });

  const [activeTabForm, setActiveTabForm] = useState<'identity' | 'matrix'>('identity');

  // Unique schools for filter
  const uniqueSchools = useMemo(() => {
    const list = new Set<string>();
    records.forEach((r) => list.add(r.schoolName));
    principals.forEach((p) => list.add(p.satuanPendidikan));
    return Array.from(list).sort();
  }, [records, principals]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSchool = schoolFilter === 'all' || r.schoolName === schoolFilter;
      const matchQuadrant = quadrantFilter === 'all' || r.quadrant === quadrantFilter;
      const matchStrategy = strategyFilter === 'all' || r.strategy === strategyFilter;
      const matchSearch =
        searchTerm === '' ||
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.headmasterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.items.some((it) => it.fokusAspek.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSchool && matchQuadrant && matchStrategy && matchSearch;
    });
  }, [records, schoolFilter, quadrantFilter, strategyFilter, searchTerm]);

  // Statistics & Quadrant Distribution
  const stats = useMemo(() => {
    const totalDocs = records.length;
    let totalItems = 0;
    let doneItems = 0;
    let onProgressItems = 0;
    const quadrantCounts: Record<string, number> = {
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0
    };

    records.forEach((r) => {
      if (r.quadrant.includes('Kuadran I:')) quadrantCounts.q1++;
      else if (r.quadrant.includes('Kuadran II:')) quadrantCounts.q2++;
      else if (r.quadrant.includes('Kuadran III:')) quadrantCounts.q3++;
      else if (r.quadrant.includes('Kuadran IV:')) quadrantCounts.q4++;

      r.items.forEach((it) => {
        totalItems++;
        if (it.status === 'Terealisasi') doneItems++;
        else if (it.status === 'Sedang Berjalan') onProgressItems++;
      });
    });

    return {
      totalDocs,
      totalItems,
      doneItems,
      onProgressItems,
      quadrantCounts,
      resolvedPercentage: totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0
    };
  }, [records]);

  // Open Create Form
  const handleOpenCreate = () => {
    const defaultPrincipal = principals[0];
    const initialCapacity = 'Rendah';
    const initialCommitment = 'Tinggi';
    const { quadrant, strategy } = determineQuadrantAndStrategy(initialCapacity, initialCommitment);

    setFormData({
      id: `rpb-${Date.now()}`,
      title: 'Rencana Pendampingan Berdiferensiasi (RPB) Satuan Pendidikan Tahun Ajaran 2026/2027',
      principalId: defaultPrincipal?.id || '',
      schoolName: defaultPrincipal ? defaultPrincipal.satuanPendidikan : (settings.schoolName || 'UPT SD Negeri 4 Bilokka'),
      schoolNpsn: defaultPrincipal?.npsn || '40301824',
      headmasterName: defaultPrincipal?.nama || 'Asnawi., S.Pd',
      headmasterNip: defaultPrincipal?.nip || '19681231 200502 1 008',
      headmasterRank: defaultPrincipal?.pangkatGolongan || 'Penata Tk. I (III/d)',
      supervisorName: settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
      supervisorNip: settings.supervisorNip || '19830819 201001 1 002',
      supervisorRole: 'Pengawas Sekolah Pembina',
      supervisorRank: settings.supervisorRank || 'Penata Tk. I / III.d',
      academicYear: '2026/2027',
      semester: 'Ganjil',
      date: new Date().toISOString().split('T')[0],
      leadershipCapacity: initialCapacity,
      changeCommitment: initialCommitment,
      quadrant,
      strategy,
      raporPriorities: ['D.1 Kualitas Pembelajaran', 'A.1 Kemampuan Literasi', 'D.4 Iklim Keamanan Sekolah'],
      baselineDiagnosis:
        'Kapasitas kepemimpinan manajerial kepala sekolah berada pada fase perkembangan, namun dewan guru memiliki komitmen dan antusiasme tinggi untuk bertransformasi ke Kurikulum Merdeka.',
      generalObjective:
        'Menguatkan kapasitas kepemimpinan instruksional kepala sekolah dan mengoptimalkan peran Komunitas Belajar (Kombel) dalam mengimplementasikan pembelajaran berdiferensiasi.',
      supervisorNotes:
        'Diferensiasi pendampingan difokuskan pada bimbingan teknis (mentoring) dan fasilitasi praktik baik bertahap.',
      items: [
        {
          id: `item-${Date.now()}-1`,
          tahap: 'Perencanaan Program',
          fokusAspek: 'Penyelarasan PBD Rapor Pendidikan dengan RKAS & KOSP',
          metode: 'Mentoring',
          aktivitasUtama: 'Bedah lembar rekomendasi Rapor Pendidikan bersama Tim Pengembang Kurikulum.',
          targetOutput: 'Dokumen KOSP dan RKAS terintegrasi benahi literasi.',
          linimasa: 'Bulan ke-1',
          pihakTerlibat: 'Pengawas, Kepala Sekolah, Tim BOS',
          indikatorKeberhasilan: '100% program benahi teralokasi anggaran BOSP.',
          status: 'Sedang Berjalan'
        },
        {
          id: 'item-2',
          tahap: 'Pelaksanaan Program',
          fokusAspek: 'Aktivasi Komunitas Belajar (Kombel) Guru Berdiferensiasi',
          metode: 'Fasilitasi',
          aktivitasUtama: 'Sesi simulasi co-planning penyusunan modul ajar berdiferensiasi dan rubrik asesmen.',
          targetOutput: 'Bank Modul Ajar Berdiferensiasi siap pakai.',
          linimasa: 'Bulan ke-2 & ke-3',
          pihakTerlibat: 'Pengawas, Kepala Sekolah, Dewan Guru',
          indikatorKeberhasilan: 'Minimal 80% guru mempraktikkan diferensiasi di kelas.',
          status: 'Terjadwal'
        }
      ],
      status: 'final'
    });
    setActiveTabForm('identity');
    setIsEditorOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (rec: RPBRecord) => {
    setFormData({
      ...rec,
      items: rec.items.map((it) => ({ ...it })),
      raporPriorities: [...(rec.raporPriorities || [])]
    });
    setActiveTabForm('identity');
    setIsEditorOpen(true);
  };

  // Open Detail Modal
  const handleOpenDetail = (rec: RPBRecord) => {
    setActiveRecord(rec);
    setIsDetailOpen(true);
  };

  // Update capacity & commitment and auto-recalculate quadrant & strategy
  const handleCapacityChange = (cap: 'Tinggi' | 'Sedang' | 'Rendah') => {
    const { quadrant, strategy } = determineQuadrantAndStrategy(cap, formData.changeCommitment || 'Tinggi');
    setFormData((prev) => ({
      ...prev,
      leadershipCapacity: cap,
      quadrant,
      strategy
    }));
  };

  const handleCommitmentChange = (com: 'Tinggi' | 'Sedang' | 'Rendah') => {
    const { quadrant, strategy } = determineQuadrantAndStrategy(formData.leadershipCapacity || 'Tinggi', com);
    setFormData((prev) => ({
      ...prev,
      changeCommitment: com,
      quadrant,
      strategy
    }));
  };

  // Toggle Rapor Priority
  const handleTogglePriority = (priority: string) => {
    setFormData((prev) => {
      const current = prev.raporPriorities || [];
      const updated = current.includes(priority)
        ? current.filter((p) => p !== priority)
        : [...current, priority];
      return { ...prev, raporPriorities: updated };
    });
  };

  // Principal Quick Sync
  const handlePrincipalSelect = (pId: string) => {
    const found = principals.find((p) => p.id === pId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        principalId: found.id,
        headmasterName: found.nama,
        headmasterNip: found.nip,
        headmasterRank: found.pangkatGolongan || prev.headmasterRank,
        schoolName: found.satuanPendidikan,
        schoolNpsn: found.npsn || prev.schoolNpsn
      }));
      showToast(`Data terhubung ke ${found.nama} (${found.satuanPendidikan})`, 'info');
    }
  };

  // AI Generator Trigger
  const handleGeneratePlanWithAI = async () => {
    if (!formData.schoolName) {
      showToast('Mohon pilih atau masukkan satuan pendidikan terlebih dahulu', 'warning');
      return;
    }

    try {
      setIsGeneratingAI(true);
      const generated = await generateRPBPlanAI({
        schoolName: formData.schoolName || 'Satuan Pendidikan',
        headmasterName: formData.headmasterName || 'Kepala Sekolah',
        capacity: formData.leadershipCapacity || 'Tinggi',
        commitment: formData.changeCommitment || 'Tinggi',
        raporPriorities: formData.raporPriorities,
        focusNotes: formData.supervisorNotes
      });

      setFormData((prev) => ({
        ...prev,
        quadrant: generated.quadrant,
        strategy: generated.strategy,
        baselineDiagnosis: generated.baselineDiagnosis,
        generalObjective: generated.generalObjective,
        supervisorNotes: generated.supervisorNotes,
        items: generated.items.map((it, idx) => ({
          id: `item-${Date.now()}-${idx + 1}`,
          ...it,
          status: idx === 0 ? 'Sedang Berjalan' : 'Terjadwal'
        }))
      }));

      showToast('✨ Rencana Pendampingan Berdiferensiasi berhasil disusun otomatis dengan AI!', 'success');
      setActiveTabForm('matrix');
    } catch (e) {
      console.error('Error generating AI plan:', e);
      showToast('Gagal memproses AI RPB, silakan coba lagi.', 'warning');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Generate individual Baseline Diagnosis with AI
  const handleGenerateDiagnosisAI = async (
    theme: 'standar' | 'literasi-numerasi' | 'digital-kombel' | 'iklim-karakter' = 'standar'
  ) => {
    try {
      setIsGeneratingDiagnosis(true);
      const diagnosisText = await generateBaselineDiagnosisAI({
        schoolName: formData.schoolName || 'Satuan Pendidikan Binaan',
        headmasterName: formData.headmasterName || 'Kepala Sekolah',
        capacity: formData.leadershipCapacity || 'Tinggi',
        commitment: formData.changeCommitment || 'Tinggi',
        quadrant: formData.quadrant,
        strategy: formData.strategy,
        raporPriorities: formData.raporPriorities,
        theme
      });

      setFormData((prev) => ({
        ...prev,
        baselineDiagnosis: diagnosisText
      }));

      showToast('✨ Contoh Diagnosis Kondisi Awal berhasil dibuat oleh AI!', 'success');
    } catch (e) {
      console.error('Error generating diagnosis:', e);
      showToast('Gagal menyusun diagnosis dengan AI, silakan coba lagi.', 'warning');
    } finally {
      setIsGeneratingDiagnosis(false);
    }
  };

  // Generate individual General Objective with AI
  const handleGenerateObjectiveAI = async (
    theme: 'standar' | 'literasi-numerasi' | 'digital-kombel' | 'iklim-karakter' = 'standar'
  ) => {
    try {
      setIsGeneratingObjective(true);
      const objectiveText = await generateGeneralObjectiveAI({
        schoolName: formData.schoolName || 'Satuan Pendidikan Binaan',
        headmasterName: formData.headmasterName || 'Kepala Sekolah',
        capacity: formData.leadershipCapacity || 'Tinggi',
        commitment: formData.changeCommitment || 'Tinggi',
        quadrant: formData.quadrant,
        strategy: formData.strategy,
        raporPriorities: formData.raporPriorities,
        theme
      });

      setFormData((prev) => ({
        ...prev,
        generalObjective: objectiveText
      }));

      showToast('✨ Contoh Tujuan Umum Pendampingan berhasil dirumuskan oleh AI!', 'success');
    } catch (e) {
      console.error('Error generating objective:', e);
      showToast('Gagal menyusun tujuan dengan AI, silakan coba lagi.', 'warning');
    } finally {
      setIsGeneratingObjective(false);
    }
  };

  // Matrix Items Add/Update/Remove
  const handleAddItem = (stage: RPBStage = 'Pelaksanaan Program') => {
    const newItem: RPBItem = {
      id: `rpbi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tahap: stage,
      fokusAspek: '',
      metode: 'Fasilitasi',
      aktivitasUtama: '',
      targetOutput: '',
      linimasa: 'Bulan berjalan',
      pihakTerlibat: 'Pengawas, Kepala Sekolah, Dewan Guru',
      indikatorKeberhasilan: '',
      status: 'Terjadwal'
    };
    setFormData((prev) => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  const handleUpdateItem = (id: string, field: keyof RPBItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      items: (prev.items || []).map((it) => (it.id === id ? { ...it, [field]: value } : it))
    }));
  };

  const handleRemoveItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      items: (prev.items || []).filter((it) => it.id !== id)
    }));
  };

  // Save Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.schoolName?.trim()) {
      showToast('Mohon lengkapi judul dokumen dan satuan pendidikan!', 'warning');
      return;
    }
    if (!formData.items || formData.items.length === 0) {
      showToast('Minimal tambahkan 1 item rencana aksi pendampingan!', 'warning');
      return;
    }

    const recordToSave: RPBRecord = {
      id: formData.id || `rpb-${Date.now()}`,
      title: formData.title || 'Rencana Pendampingan Berdiferensiasi (RPB)',
      principalId: formData.principalId || '',
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
      date: formData.date || new Date().toISOString().split('T')[0],
      quadrant: formData.quadrant || 'Kuadran I: Mandiri (Kapasitas Tinggi, Komitmen Tinggi)',
      strategy: formData.strategy || 'Pemacu Perubahan (Catalyst)',
      leadershipCapacity: formData.leadershipCapacity || 'Tinggi',
      changeCommitment: formData.changeCommitment || 'Tinggi',
      raporPriorities: formData.raporPriorities || [],
      baselineDiagnosis: formData.baselineDiagnosis || '',
      generalObjective: formData.generalObjective || '',
      supervisorNotes: formData.supervisorNotes || '',
      items: formData.items || [],
      status: formData.status || 'final',
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveRecord(recordToSave);
    setIsEditorOpen(false);
    showToast('Rencana Pendampingan Berdiferensiasi (RPB) berhasil disimpan!', 'success');
  };

  // Export Word
  const handleExportWord = (rec: RPBRecord) => {
    exportRPBToWord(rec, settings);
    showToast(`Dokumen RPB ${rec.schoolName} berhasil diunduh (.doc)!`, 'success');
  };

  // Direct Print & PDF Export
  const handlePrint = (rec: RPBRecord) => {
    setActiveRecord(rec);
    setTimeout(() => {
      const docTitle = `RPB_${(rec.schoolName || 'Sekolah').replace(/[^a-zA-Z0-9]/g, '_')}_${rec.academicYear || ''}`;
      const printed = printDocumentElement('printable-rpb-doc', docTitle, { orientation: 'portrait' });
      if (!printed) {
        window.print();
      }
    }, 150);
  };

  // Render official RPB document content (used by modal preview and isolated PDF print)
  const renderOfficialRPBContent = (rec: RPBRecord) => {
    return (
      <div className="text-slate-900 bg-white">
        {/* KOP Surat Resmi dengan Dua Logo */}
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
            RENCANA PENDAMPINGAN BERDIFERENSIASI (RPB)
          </h2>
          <p className="text-xs font-bold text-slate-700 mt-1 uppercase">
            KERANGKA DIFERENSIASI STRATEGI & METODE PENDAMPINGAN KEPALA SATUAN PENDIDIKAN
          </p>
          <p className="text-[10px] text-slate-500 italic mt-0.5">
            Sesuai Perdirjen GTK Kemendikbudristek No. 4831/B/HK.03.01/2023 tentang Peran Pengawas Sekolah
          </p>
        </div>

        {/* Identitas Dokumen */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs pb-4 mb-4 border-b border-slate-200">
          <div className="flex gap-2">
            <span className="w-36 font-bold text-slate-700 shrink-0">Satuan Pendidikan</span>
            <span className="font-bold">:</span>
            <span className="text-slate-900 font-semibold">{rec.schoolName} {rec.schoolNpsn ? `(NPSN: ${rec.schoolNpsn})` : ''}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-36 font-bold text-slate-700 shrink-0">Tahun Pelajaran</span>
            <span className="font-bold">:</span>
            <span className="text-slate-900">{rec.academicYear} ({rec.semester})</span>
          </div>
          <div className="flex gap-2">
            <span className="w-36 font-bold text-slate-700 shrink-0">Kepala Satuan Pendidikan</span>
            <span className="font-bold">:</span>
            <span className="text-slate-900 font-semibold">{rec.headmasterName} (NIP. {rec.headmasterNip})</span>
          </div>
          <div className="flex gap-2">
            <span className="w-36 font-bold text-slate-700 shrink-0">Tanggal Penyusunan</span>
            <span className="font-bold">:</span>
            <span className="text-slate-900">{rec.date}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-36 font-bold text-slate-700 shrink-0">Pengawas Pembina</span>
            <span className="font-bold">:</span>
            <span className="text-slate-900 font-semibold">{rec.supervisorName}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-36 font-bold text-slate-700 shrink-0">NIP Pengawas</span>
            <span className="font-bold">:</span>
            <span className="text-slate-900">{rec.supervisorNip}</span>
          </div>
        </div>

        {/* Ringkasan Diagnosis Kapasitas & Strategi */}
        <div className="grid grid-cols-2 gap-4 mb-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] font-semibold uppercase">Diagnosis Kapasitas Sekolah:</span>
            <strong className="text-slate-900 text-sm">{rec.quadrant}</strong>
            <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">{rec.baselineDiagnosis}</p>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] font-semibold uppercase">Strategi Diferensiasi Terpilih:</span>
            <strong className="text-emerald-800 text-sm">{rec.strategy}</strong>
            <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
              <strong className="text-slate-700">Tujuan Umum:</strong> {rec.generalObjective}
            </p>
          </div>
        </div>

        {/* Rapor Pendidikan Priorities */}
        {rec.raporPriorities && rec.raporPriorities.length > 0 && (
          <div className="mb-5 text-xs">
            <span className="font-bold text-slate-800 block mb-1">Indikator Prioritas Rapor Pendidikan yang Dibenahi:</span>
            <div className="flex flex-wrap gap-1.5">
              {rec.raporPriorities.map((p, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-900 text-[10px] font-semibold">
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tabel RPB */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse border border-slate-400 text-xs">
            <thead>
              <tr className="bg-slate-800 text-white text-[11px] uppercase tracking-wider text-center">
                <th className="border border-slate-400 p-2 w-10 text-center bg-slate-800 text-white font-bold">No</th>
                <th className="border border-slate-400 p-2 w-48 text-left bg-slate-800 text-white font-bold">Tahap &amp; Fokus Aspek</th>
                <th className="border border-slate-400 p-2 w-24 text-center bg-slate-800 text-white font-bold">Metode</th>
                <th className="border border-slate-400 p-2 text-left bg-blue-900 text-white font-bold">Aktivitas Utama Pengawas &amp; KS</th>
                <th className="border border-slate-400 p-2 text-left w-44 bg-slate-800 text-white font-bold">Target Output &amp; Indikator</th>
                <th className="border border-slate-400 p-2 w-28 text-left bg-slate-800 text-white font-bold">Linimasa</th>
              </tr>
            </thead>
            <tbody>
              {rec.items.map((item, idx) => (
                <tr key={item.id} className="align-top hover:bg-slate-50/50">
                  <td className="border border-slate-400 p-2.5 text-center font-bold bg-slate-50 text-slate-900">
                    {idx + 1}
                  </td>
                  <td className="border border-slate-400 p-2.5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">{item.tahap}</span>
                    <strong className="text-slate-900 block font-bold mt-0.5">{item.fokusAspek}</strong>
                  </td>
                  <td className="border border-slate-400 p-2.5 text-center">
                    <span className="inline-block text-[10px] px-2 py-0.5 rounded font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                      {item.metode}
                    </span>
                  </td>
                  <td className="border border-slate-400 p-2.5 text-slate-800 leading-relaxed">
                    {item.aktivitasUtama}
                  </td>
                  <td className="border border-slate-400 p-2.5 text-slate-800">
                    <div className="font-semibold text-slate-900">{item.targetOutput}</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      <strong>Indikator:</strong> {item.indikatorKeberhasilan}
                    </div>
                  </td>
                  <td className="border border-slate-400 p-2.5 text-slate-700 text-[11px]">
                    <div className="font-bold">{item.linimasa}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.pihakTerlibat}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Catatan Pengawas */}
        {rec.supervisorNotes && (
          <div className="mb-5 p-3 rounded-lg bg-amber-50/70 border-l-4 border-amber-600 text-xs">
            <strong className="text-amber-950">Catatan Refleksi Pengawas Pembina:</strong>
            <p className="text-slate-700 italic mt-0.5 leading-relaxed">{rec.supervisorNotes}</p>
          </div>
        )}

        {/* Signature Dual */}
        <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs text-slate-800 print:break-inside-avoid print-avoid-break">
          <div>
            <p>Mengetahui / Menyetujui,</p>
            <p className="font-semibold text-slate-600">Kepala Satuan Pendidikan</p>
            <div className="h-16" />
            <p className="font-bold underline text-slate-900">{rec.headmasterName}</p>
            <p className="text-slate-500 text-[11px]">NIP. {rec.headmasterNip}</p>
          </div>

          <div>
            <p>{settings.schoolCity || 'Pangkajene Sidenreng'}, {rec.date}</p>
            <p className="font-semibold text-slate-600">{rec.supervisorRole || 'Pengawas Sekolah Pembina'}</p>
            <div className="h-16" />
            <p className="font-bold underline text-slate-900">{rec.supervisorName}</p>
            <p className="text-slate-500 text-[11px]">NIP. {rec.supervisorNip}</p>
            <p className="text-slate-400 text-[10px]">{rec.supervisorRank || 'Penata Tk. I / III.d'}</p>
          </div>
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
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
                Perdirjen GTK No. 4831/B/HK.03.01/2023
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-slate-300 text-xs font-medium">Kabupaten Sidenreng Rappang</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Workflow className="w-5 h-5 text-white" />
              </div>
              Rencana Pendampingan Berdiferensiasi (RPB)
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Instrumen transformasi pengawas sekolah sebagai <strong>Mitra (Co-Pilot)</strong>. Memetakan 4 kuadran kapasitas kepemimpinan &amp; komitmen perubahan sekolah binaan untuk menentukan strategi presisi:{' '}
              <strong className="text-cyan-300">Pemacu (Catalyst)</strong>,{' '}
              <strong className="text-emerald-300">Penguat (Booster)</strong>,{' '}
              <strong className="text-amber-300">Pemicu (Trigger)</strong>, atau{' '}
              <strong className="text-rose-300">Intervensi Intensif</strong>.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-900 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer transform hover:-translate-y-0.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Susun RPB Baru</span>
          </button>
        </div>

        {/* 4 Interactive Quadrant Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-indigo-800/40">
          <div
            onClick={() => setQuadrantFilter(quadrantFilter.includes('I:') ? 'all' : 'Kuadran I: Mandiri (Kapasitas Tinggi, Komitmen Tinggi)')}
            className={`rounded-xl p-3 border transition-all cursor-pointer ${
              quadrantFilter.includes('I:')
                ? 'bg-cyan-500/25 border-cyan-400 shadow-md ring-1 ring-cyan-400'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300">
              <span>Kuadran I: Mandiri</span>
              <span className="text-[10px] bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-700/50">Catalyst</span>
            </div>
            <div className="text-xl font-black text-white mt-1">{stats.quadrantCounts.q1} Sekolah</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Coaching &amp; Kemitraan</p>
          </div>

          <div
            onClick={() => setQuadrantFilter(quadrantFilter.includes('II:') ? 'all' : 'Kuadran II: Berdaya (Kapasitas Rendah, Komitmen Tinggi)')}
            className={`rounded-xl p-3 border transition-all cursor-pointer ${
              quadrantFilter.includes('II:')
                ? 'bg-emerald-500/25 border-emerald-400 shadow-md ring-1 ring-emerald-400'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300">
              <span>Kuadran II: Berdaya</span>
              <span className="text-[10px] bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-700/50">Booster</span>
            </div>
            <div className="text-xl font-black text-white mt-1">{stats.quadrantCounts.q2} Sekolah</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Mentoring &amp; Fasilitasi</p>
          </div>

          <div
            onClick={() => setQuadrantFilter(quadrantFilter.includes('III:') ? 'all' : 'Kuadran III: Statis (Kapasitas Tinggi, Komitmen Rendah)')}
            className={`rounded-xl p-3 border transition-all cursor-pointer ${
              quadrantFilter.includes('III:')
                ? 'bg-amber-500/25 border-amber-400 shadow-md ring-1 ring-amber-400'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
              <span>Kuadran III: Statis</span>
              <span className="text-[10px] bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-700/50">Trigger</span>
            </div>
            <div className="text-xl font-black text-white mt-1">{stats.quadrantCounts.q3} Sekolah</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Konsultasi Kritis</p>
          </div>

          <div
            onClick={() => setQuadrantFilter(quadrantFilter.includes('IV:') ? 'all' : 'Kuadran IV: Perlu Intervensi Khusus (Kapasitas Rendah, Komitmen Rendah)')}
            className={`rounded-xl p-3 border transition-all cursor-pointer ${
              quadrantFilter.includes('IV:')
                ? 'bg-rose-500/25 border-rose-400 shadow-md ring-1 ring-rose-400'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-rose-300">
              <span>Kuadran IV: Khusus</span>
              <span className="text-[10px] bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-700/50">Intensif</span>
            </div>
            <div className="text-xl font-black text-white mt-1">{stats.quadrantCounts.q4} Sekolah</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Pelatihan Langsung</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari satuan pendidikan, nama kepala sekolah, atau fokus pendampingan..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Satuan Pendidikan ({uniqueSchools.length})</option>
            {uniqueSchools.map((sch) => (
              <option key={sch} value={sch}>
                {sch}
              </option>
            ))}
          </select>

          <select
            value={strategyFilter}
            onChange={(e) => setStrategyFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Strategi RPB</option>
            <option value="Pemacu Perubahan (Catalyst)">Pemacu Perubahan (Catalyst)</option>
            <option value="Penguat Perubahan (Booster)">Penguat Perubahan (Booster)</option>
            <option value="Pemicu Perubahan (Trigger)">Pemicu Perubahan (Trigger)</option>
            <option value="Pendampingan Intensif (Intervensi Langsung)">Pendampingan Intensif</option>
          </select>

          {(searchTerm || schoolFilter !== 'all' || quadrantFilter !== 'all' || strategyFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSchoolFilter('all');
                setQuadrantFilter('all');
                setStrategyFilter('all');
              }}
              className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Record Cards Grid */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
            <Workflow className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Belum Ada Dokumen Rencana Pendampingan Berdiferensiasi</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            Mulai susun RPB untuk satuan pendidikan binaan sesuai Perdirjen GTK No. 4831/2023. Tentukan kuadran kapasitas, strategi, dan rencana aksi pendampingan.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Susun RPB Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredRecords.map((rec) => {
            const doneCount = rec.items.filter((it) => it.status === 'Terealisasi').length;
            const ongoingCount = rec.items.filter((it) => it.status === 'Sedang Berjalan').length;

            const isQ1 = rec.quadrant.includes('I:');
            const isQ2 = rec.quadrant.includes('II:');
            const isQ3 = rec.quadrant.includes('III:');

            const badgeColor = isQ1
              ? 'bg-cyan-100 text-cyan-900 border-cyan-300'
              : isQ2
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
              : isQ3
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-rose-100 text-rose-900 border-rose-300';

            return (
              <div
                key={rec.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
              >
                {/* Header Card */}
                <div className="p-5 border-b border-slate-100 flex-1">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-700">
                      <School className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="truncate">{rec.schoolName}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {rec.academicYear} ({rec.semester})
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {rec.title}
                  </h3>

                  {/* Badges Row */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className={`text-[10px] px-2.5 py-1 rounded-lg font-extrabold border ${badgeColor}`}>
                      {rec.quadrant.split(':')[0]}
                    </span>
                    <span className="text-[10px] px-2.5 py-1 rounded-lg font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                      <Workflow className="w-3 h-3" />
                      {rec.strategy}
                    </span>
                  </div>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Kepala Sekolah:</span>
                      <strong className="text-slate-700 font-semibold truncate block">
                        {rec.headmasterName}
                      </strong>
                      <span className="text-slate-500 text-[10px]">
                        NIP: {rec.headmasterNip}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">Kapasitas &amp; Komitmen:</span>
                      <span className="text-slate-700 font-semibold block text-[10px]">
                        Kepemimpinan: <strong>{rec.leadershipCapacity}</strong>
                      </span>
                      <span className="text-slate-500 text-[10px]">
                        Komitmen: <strong>{rec.changeCommitment}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Rapor Priorities Chips */}
                  {rec.raporPriorities && rec.raporPriorities.length > 0 && (
                    <div className="mt-3">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">
                        Prioritas Pembenahan Rapor:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {rec.raporPriorities.map((rp, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md font-bold border border-rose-200"
                          >
                            {rp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Program Action Preview */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Target className="w-3.5 h-3.5 text-emerald-600" />
                        {rec.items.length} Rencana Aksi Pendampingan:
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {doneCount} Tuntas · {ongoingCount} Berjalan
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {rec.items.map((it, idx) => (
                        <div
                          key={it.id || idx}
                          className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-800 text-[11px] truncate flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[9px] flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="truncate">{it.fokusAspek}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                              <span className="text-blue-700 font-bold">[{it.metode}]</span> {it.aktivitasUtama}
                            </div>
                          </div>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                              it.status === 'Terealisasi'
                                ? 'bg-emerald-100 text-emerald-800'
                                : it.status === 'Sedang Berjalan'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {it.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenDetail(rec)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      title="Lihat Detail RPB Lengkap"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detail</span>
                    </button>

                    <button
                      onClick={() => handleExportWord(rec)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      title="Unduh Dokumen RPB ke Microsoft Word (.doc)"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Word</span>
                    </button>

                    <button
                      onClick={() => handlePrint(rec)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 text-xs font-medium transition-all shadow-2xs cursor-pointer"
                      title="Cetak Dokumen Resmi / Simpan PDF"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(rec)}
                      className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit RPB"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus dokumen RPB ${rec.schoolName}?`)) {
                          onDeleteRecord(rec.id);
                          showToast('Dokumen RPB berhasil dihapus', 'info');
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus RPB"
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

      {/* ======================================================== */}
      {/* MODAL EDITOR: SUSUN / EDIT RPB SATUAN PENDIDIKAN        */}
      {/* ======================================================== */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-emerald-950 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                  <Workflow className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">
                    {formData.id && records.some((r) => r.id === formData.id)
                      ? 'Edit Rencana Pendampingan Berdiferensiasi (RPB)'
                      : 'Input Baru: Rencana Pendampingan Berdiferensiasi (RPB)'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Sesuai Perdirjen GTK Kemendikbudristek No. 4831/B/HK.03.01/2023
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGeneratePlanWithAI}
                  disabled={isGeneratingAI}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                  title="Generate otomatis diagnosis, tujuan, dan rangkaian rencana aksi menggunakan AI"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingAI ? 'Menyusun RPB...' : '✨ Susun RPB Otomatis dengan AI'}</span>
                </button>

                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="px-6 pt-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTabForm('identity')}
                  className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTabForm === 'identity'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <School className="w-3.5 h-3.5" />
                  <span>1. Identitas &amp; Diagnosis Kapasitas Sekolah</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTabForm('matrix')}
                  className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTabForm === 'matrix'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Workflow className="w-3.5 h-3.5" />
                  <span>2. Matriks Program Pendampingan ({formData.items?.length || 0})</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Strategi Terpilih: <strong className="text-emerald-700">{formData.strategy}</strong>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTabForm === 'identity' ? (
                <div className="space-y-6">
                  {/* Judul & Periode */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      Judul &amp; Periode Pendampingan
                    </h4>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Judul Dokumen RPB <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Tahun Pelajaran</label>
                        <input
                          type="text"
                          value={formData.academicYear}
                          onChange={(e) => setFormData((p) => ({ ...p, academicYear: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Semester</label>
                        <select
                          value={formData.semester}
                          onChange={(e) => setFormData((p) => ({ ...p, semester: e.target.value as any }))}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                        >
                          <option value="Ganjil">Semester Ganjil</option>
                          <option value="Genap">Semester Genap</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Dokumen</label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* IDENTITAS KEPALA SEKOLAH & SATUAN PENDIDIKAN DENGAN AUTO-SYNC */}
                  <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                        <School className="w-4 h-4 text-amber-700" />
                        Data Kepala Satuan Pendidikan Binaan
                      </h4>
                      <span className="text-[11px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
                        Auto-Sync &amp; Fleksibel
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 mb-1">
                        Pilih Cepat dari Data Kepala Sekolah Terdaftar:
                      </label>
                      <select
                        onChange={(e) => handlePrincipalSelect(e.target.value)}
                        value={formData.principalId || ''}
                        className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="" disabled>
                          -- Pilih Kepala Sekolah untuk Auto-Sync --
                        </option>
                        {principals.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nama} ({p.satuanPendidikan})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Nama Lengkap &amp; Gelar Kepala Sekolah <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.headmasterName}
                          onChange={(e) => setFormData((p) => ({ ...p, headmasterName: e.target.value }))}
                          placeholder="contoh: Dra. Hj. Nurhasanah, M.Pd."
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          NIP / NIK Kepala Sekolah <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.headmasterNip}
                          onChange={(e) => setFormData((p) => ({ ...p, headmasterNip: e.target.value }))}
                          placeholder="contoh: 19720815 199802 2 003"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Satuan Pendidikan <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.schoolName}
                          onChange={(e) => setFormData((p) => ({ ...p, schoolName: e.target.value }))}
                          placeholder="UPT SD Negeri 4 Bilokka"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">NPSN Sekolah</label>
                        <input
                          type="text"
                          value={formData.schoolNpsn}
                          onChange={(e) => setFormData((p) => ({ ...p, schoolNpsn: e.target.value }))}
                          placeholder="40301824"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* DIAGNOSIS 4 KUADRAN KAPASITAS SATUAN PENDIDIKAN */}
                  <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                        <Workflow className="w-4 h-4 text-emerald-700" />
                        Pemetaan 4 Kuadran Kapasitas &amp; Strategi Pendampingan
                      </h4>
                      <span className="text-[11px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                        Kalkulasi Otomatis
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Sumbu 1: Kapasitas Kepemimpinan */}
                      <div className="p-3 bg-white rounded-lg border border-emerald-200">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Kapasitas Kepemimpinan KS dalam Perubahan:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['Tinggi', 'Sedang', 'Rendah'] as const).map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => handleCapacityChange(lvl)}
                              className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                formData.leadershipCapacity === lvl
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sumbu 2: Komitmen Perubahan */}
                      <div className="p-3 bg-white rounded-lg border border-emerald-200">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Komitmen Perubahan KS &amp; Dewan Guru:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['Tinggi', 'Sedang', 'Rendah'] as const).map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => handleCommitmentChange(lvl)}
                              className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                formData.changeCommitment === lvl
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Result Banner: Kuadran & Strategi */}
                    <div className="p-3.5 bg-gradient-to-r from-emerald-100 to-cyan-100 rounded-xl border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                          Hasil Diagnosis Kapasitas Sekolah:
                        </div>
                        <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                          {formData.quadrant}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">
                          Strategi Diferensiasi Pengawas:
                        </div>
                        <div className="text-sm font-black text-blue-900 mt-0.5">
                          {formData.strategy}
                        </div>
                      </div>
                    </div>

                    {/* PRIORITAS RAPOR PENDIDIKAN */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        Indikator Prioritas Rapor Pendidikan yang Dibenahi:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {COMMON_RAPOR_PRIORITIES.map((priority) => {
                          const isSelected = formData.raporPriorities?.includes(priority);
                          return (
                            <button
                              key={priority}
                              type="button"
                              onClick={() => handleTogglePriority(priority)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-rose-600 text-white shadow-2xs'
                                  : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {isSelected ? <CheckCircle2 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                              <span>{priority}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Baseline & Objective with AI Generator */}
                    <div className="space-y-4 pt-1">
                      {/* 1. DIAGNOSIS KONDISI AWAL */}
                      <div className="bg-white p-3.5 rounded-xl border border-emerald-200/90 shadow-2xs space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-emerald-600" />
                              Diagnosis Kondisi Awal Satuan Pendidikan
                            </label>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              Perdirjen 4831/2023
                            </span>
                          </div>

                          {/* Tombol AI Generator Utama */}
                          <button
                            type="button"
                            onClick={() => handleGenerateDiagnosisAI('standar')}
                            disabled={isGeneratingDiagnosis}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg shadow-xs cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Buat contoh diagnosis berbasis analisis kuadran dan prioritas Rapor Pendidikan"
                          >
                            {isGeneratingDiagnosis ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Menyusun AI...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>✨ Buat Contoh Diagnosis AI</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Variasi Contoh Preset AI */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mr-0.5">
                            Variasi AI:
                          </span>
                          <button
                            type="button"
                            onClick={() => handleGenerateDiagnosisAI('standar')}
                            disabled={isGeneratingDiagnosis}
                            className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200 text-[10px] transition-colors cursor-pointer"
                          >
                            🏛️ Sesuai Kuadran
                          </button>
                          <button
                            type="button"
                            onClick={() => handleGenerateDiagnosisAI('literasi-numerasi')}
                            disabled={isGeneratingDiagnosis}
                            className="px-2 py-0.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium border border-slate-200 text-[10px] transition-colors cursor-pointer"
                          >
                            📖 Literasi &amp; Numerasi
                          </button>
                          <button
                            type="button"
                            onClick={() => handleGenerateDiagnosisAI('digital-kombel')}
                            disabled={isGeneratingDiagnosis}
                            className="px-2 py-0.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium border border-slate-200 text-[10px] transition-colors cursor-pointer"
                          >
                            💻 Digital &amp; Kombel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleGenerateDiagnosisAI('iklim-karakter')}
                            disabled={isGeneratingDiagnosis}
                            className="px-2 py-0.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium border border-slate-200 text-[10px] transition-colors cursor-pointer"
                          >
                            🛡️ Iklim &amp; Karakter
                          </button>
                        </div>

                        <textarea
                          rows={3}
                          value={formData.baselineDiagnosis}
                          onChange={(e) => setFormData((p) => ({ ...p, baselineDiagnosis: e.target.value }))}
                          placeholder="Uraikan kondisi nyata iklim belajar, komitmen guru, dan tantangan yang dihadapi sekolah... (Atau klik tombol 'Buat Contoh Diagnosis AI' di atas untuk mengisi otomatis)"
                          className="w-full p-2.5 bg-slate-50/50 hover:bg-white border border-slate-300 rounded-lg text-xs leading-relaxed text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                        <div className="flex items-center justify-between text-[10px] text-slate-500 px-0.5">
                          <span>
                            *Mencakup kepemimpinan kepala sekolah, budaya guru, dan indikator prioritas Rapor Pendidikan.
                          </span>
                          {formData.baselineDiagnosis && (
                            <button
                              type="button"
                              onClick={() => setFormData((p) => ({ ...p, baselineDiagnosis: '' }))}
                              className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              Bersihkan
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 2. TUJUAN UMUM PENDAMPINGAN */}
                      <div className="bg-white p-3.5 rounded-xl border border-blue-200/90 shadow-2xs space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <Target className="w-3.5 h-3.5 text-blue-600" />
                              Tujuan Umum Pendampingan Berdiferensiasi
                            </label>
                            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              Strategi Terpilih
                            </span>
                          </div>

                          {/* Tombol AI Generator Utama */}
                          <button
                            type="button"
                            onClick={() => handleGenerateObjectiveAI('standar')}
                            disabled={isGeneratingObjective}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-xs cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Rumuskan kalimat tujuan umum berdiferensiasi secara otomatis dengan AI"
                          >
                            {isGeneratingObjective ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Menyusun AI...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>✨ Buat Contoh Tujuan AI</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Variasi Contoh Preset AI */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mr-0.5">
                            Variasi AI:
                          </span>
                          <button
                            type="button"
                            onClick={() => handleGenerateObjectiveAI('standar')}
                            disabled={isGeneratingObjective}
                            className="px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold border border-blue-200 text-[10px] transition-colors cursor-pointer"
                          >
                            🎯 Sesuai Strategi
                          </button>
                          <button
                            type="button"
                            onClick={() => handleGenerateObjectiveAI('literasi-numerasi')}
                            disabled={isGeneratingObjective}
                            className="px-2 py-0.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium border border-slate-200 text-[10px] transition-colors cursor-pointer"
                          >
                            📚 Mutu Literasi-Numerasi
                          </button>
                          <button
                            type="button"
                            onClick={() => handleGenerateObjectiveAI('digital-kombel')}
                            disabled={isGeneratingObjective}
                            className="px-2 py-0.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium border border-slate-200 text-[10px] transition-colors cursor-pointer"
                          >
                            🚀 Kombel &amp; TIK
                          </button>
                          <button
                            type="button"
                            onClick={() => handleGenerateObjectiveAI('iklim-karakter')}
                            disabled={isGeneratingObjective}
                            className="px-2 py-0.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium border border-slate-200 text-[10px] transition-colors cursor-pointer"
                          >
                            🌱 Iklim Aman &amp; Inklusif
                          </button>
                        </div>

                        <textarea
                          rows={2}
                          value={formData.generalObjective}
                          onChange={(e) => setFormData((p) => ({ ...p, generalObjective: e.target.value }))}
                          placeholder="Tujuan instruksional yang hendak dicapai bersama kepala sekolah... (Atau klik tombol 'Buat Contoh Tujuan AI' di atas untuk mengisi otomatis)"
                          className="w-full p-2.5 bg-slate-50/50 hover:bg-white border border-slate-300 rounded-lg text-xs leading-relaxed text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        <div className="flex items-center justify-between text-[10px] text-slate-500 px-0.5">
                          <span>
                            *Rumusan tujuan operasional berpusat pada murid dan penguatan kapasitas kepemimpinan.
                          </span>
                          {formData.generalObjective && (
                            <button
                              type="button"
                              onClick={() => setFormData((p) => ({ ...p, generalObjective: '' }))}
                              className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              Bersihkan
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* IDENTITAS PENGAWAS PEMBINA */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Data Pengawas Sekolah Pembina (Asesor)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Pengawas</label>
                        <input
                          type="text"
                          value={formData.supervisorName}
                          onChange={(e) => setFormData((p) => ({ ...p, supervisorName: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">NIP Pengawas</label>
                        <input
                          type="text"
                          value={formData.supervisorNip}
                          onChange={(e) => setFormData((p) => ({ ...p, supervisorNip: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Jabatan &amp; Pangkat</label>
                        <input
                          type="text"
                          value={formData.supervisorRank}
                          onChange={(e) => setFormData((p) => ({ ...p, supervisorRank: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* TAB 2: MATRIKS RENCANA PROGRAM PENDAMPINGAN */
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                        Matriks Program Kerja Pendampingan Berdiferensiasi
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Rangkaian rencana aksi mencakup Perencanaan Program, Pelaksanaan Program, dan Evaluasi/Refleksi.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddItem('Pelaksanaan Program')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Rencana Aksi</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {formData.items && formData.items.length > 0 ? (
                      formData.items.map((item, idx) => (
                        <div
                          key={item.id}
                          className="bg-slate-50/90 border border-slate-200 rounded-xl p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <div className="flex items-center gap-2">
                                <select
                                  value={item.tahap}
                                  onChange={(e) => handleUpdateItem(item.id, 'tahap', e.target.value as RPBStage)}
                                  className="text-xs font-bold px-2 py-1 rounded-md border border-slate-300 bg-white text-slate-800"
                                >
                                  <option value="Perencanaan Program">1. Perencanaan Program</option>
                                  <option value="Pelaksanaan Program">2. Pelaksanaan Program</option>
                                  <option value="Evaluasi & Refleksi">3. Evaluasi &amp; Refleksi</option>
                                </select>

                                <select
                                  value={item.metode}
                                  onChange={(e) => handleUpdateItem(item.id, 'metode', e.target.value as RPBMethod)}
                                  className="text-xs font-extrabold px-2 py-1 rounded-md border border-blue-300 bg-blue-50 text-blue-800"
                                >
                                  <option value="Coaching">Coaching</option>
                                  <option value="Mentoring">Mentoring</option>
                                  <option value="Fasilitasi">Fasilitasi</option>
                                  <option value="Pelatihan">Pelatihan</option>
                                  <option value="Konsultasi">Konsultasi</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <select
                                value={item.status}
                                onChange={(e) => handleUpdateItem(item.id, 'status', e.target.value as any)}
                                className="text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-300 bg-white"
                              >
                                <option value="Terjadwal">📅 Terjadwal</option>
                                <option value="Sedang Berjalan">⏳ Sedang Berjalan</option>
                                <option value="Terealisasi">✅ Terealisasi</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Fokus Aspek & Aktivitas */}
                          <div className="space-y-2">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Fokus Aspek / Sasaran Pendampingan <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={item.fokusAspek}
                                onChange={(e) => handleUpdateItem(item.id, 'fokusAspek', e.target.value)}
                                placeholder="Misal: Aktivasi Kombel Guru, Penyelarasan PBD dengan RKAS, Pembelajaran Berdiferensiasi..."
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Aktivitas Utama Pengawas Pembina &amp; Satuan Pendidikan
                              </label>
                              <textarea
                                rows={2}
                                value={item.aktivitasUtama}
                                onChange={(e) => handleUpdateItem(item.id, 'aktivitasUtama', e.target.value)}
                                placeholder="Langkah konkret pendampingan lapangan..."
                                className="w-full p-2 bg-white border border-slate-300 rounded-md text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                          </div>

                          {/* Target Output & Indikator */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Target Output / Artefak Hasil
                              </label>
                              <input
                                type="text"
                                value={item.targetOutput}
                                onChange={(e) => handleUpdateItem(item.id, 'targetOutput', e.target.value)}
                                placeholder="Misal: Dokumen KOSP tuntas, 10 Modul Diferensiasi, dll."
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Indikator Keberhasilan
                              </label>
                              <input
                                type="text"
                                value={item.indikatorKeberhasilan}
                                onChange={(e) => handleUpdateItem(item.id, 'indikatorKeberhasilan', e.target.value)}
                                placeholder="Misal: 80% guru mempraktikkan modul berdiferensiasi di kelas"
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                              />
                            </div>
                          </div>

                          {/* Linimasa & Pihak Terlibat */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Linimasa / Frekuensi Kunjungan
                              </label>
                              <input
                                type="text"
                                value={item.linimasa}
                                onChange={(e) => handleUpdateItem(item.id, 'linimasa', e.target.value)}
                                placeholder="Bulan ke-2 & ke-3 (Rutin 2x per bulan)"
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Pihak yang Terlibat
                              </label>
                              <input
                                type="text"
                                value={item.pihakTerlibat}
                                onChange={(e) => handleUpdateItem(item.id, 'pihakTerlibat', e.target.value)}
                                placeholder="Pengawas, Kepala Sekolah, Dewan Guru, Tim Pengembang"
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300">
                        <p className="text-xs text-slate-500">Belum ada item rencana aksi. Tambahkan manual atau klik tombol Susun RPB Otomatis dengan AI di atas.</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Catatan Reflektif Pengawas Pembina
                    </label>
                    <textarea
                      rows={3}
                      value={formData.supervisorNotes}
                      onChange={(e) => setFormData((p) => ({ ...p, supervisorNotes: e.target.value }))}
                      placeholder="Catatan sintesis mengenai kesiapan sekolah, komitmen kepala sekolah, dan mitigasi tantangan pendampingan..."
                      className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Bottom Submit Controls */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>

                <div className="flex items-center gap-2">
                  {activeTabForm === 'identity' ? (
                    <button
                      type="button"
                      onClick={() => setActiveTabForm('matrix')}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Lanjut ke Matriks Program</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveTabForm('identity')}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Kembali ke Identitas
                    </button>
                  )}

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Simpan Dokumen RPB
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DETAIL: PRATINJAU RESMI DOKUMEN KEDINASAN RPB     */}
      {/* ======================================================== */}
      {isDetailOpen && activeRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print print:hidden">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Action Bar */}
            <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 no-print print:hidden">
              <div className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">Dokumen Rencana Pendampingan Berdiferensiasi (RPB)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportWord(activeRecord)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Ekspor Word (.doc)</span>
                </button>
                <button
                  onClick={() => handlePrint(activeRecord)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / PDF</span>
                </button>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Preview */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-100">
              <div
                id="preview-rpb-doc"
                className="bg-white p-6 sm:p-10 rounded-xl shadow-xs max-w-4xl mx-auto border border-slate-200 text-slate-900 print:shadow-none print:border-none print:p-0"
              >
                {/* KOP Surat Resmi dengan Dua Logo */}
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
                    RENCANA PENDAMPINGAN BERDIFERENSIASI (RPB) SATUAN PENDIDIKAN
                  </h2>
                  <p className="text-xs font-bold text-slate-700 mt-1 uppercase">
                    BERDASARKAN PERDIRJEN GTK KEMENDIKBUDRISTEK NO. 4831/B/HK.03.01/2023
                  </p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs pb-4 mb-4 border-b border-slate-200">
                  <div className="flex gap-2">
                    <span className="w-36 font-bold text-slate-700 shrink-0">Satuan Pendidikan</span>
                    <span className="font-bold">:</span>
                    <span className="text-slate-900 font-semibold">{activeRecord.schoolName} (NPSN: {activeRecord.schoolNpsn})</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-36 font-bold text-slate-700 shrink-0">Tahun Pelajaran</span>
                    <span className="font-bold">:</span>
                    <span className="text-slate-900">{activeRecord.academicYear} ({activeRecord.semester})</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-36 font-bold text-slate-700 shrink-0">Kepala Sekolah</span>
                    <span className="font-bold">:</span>
                    <span className="text-slate-900">{activeRecord.headmasterName} (NIP. {activeRecord.headmasterNip})</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-36 font-bold text-slate-700 shrink-0">Pengawas Pembina</span>
                    <span className="font-bold">:</span>
                    <span className="text-slate-900 font-semibold">{activeRecord.supervisorName}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-36 font-bold text-slate-700 shrink-0">Kuadran Kapasitas</span>
                    <span className="font-bold">:</span>
                    <span className="text-slate-900 font-bold">{activeRecord.quadrant}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-36 font-bold text-slate-700 shrink-0">Strategi Utama</span>
                    <span className="font-bold">:</span>
                    <span className="text-blue-800 font-black">{activeRecord.strategy}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-36 font-bold text-slate-700 shrink-0">Kapasitas &amp; Komitmen</span>
                    <span className="font-bold">:</span>
                    <span className="text-slate-800">Kepemimpinan: {activeRecord.leadershipCapacity} | Komitmen: {activeRecord.changeCommitment}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-36 font-bold text-slate-700 shrink-0">Tanggal Penyusunan</span>
                    <span className="font-bold">:</span>
                    <span className="text-slate-900">{activeRecord.date}</span>
                  </div>
                </div>

                {/* Prioritas Rapor */}
                {activeRecord.raporPriorities && activeRecord.raporPriorities.length > 0 && (
                  <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs flex items-center gap-2">
                    <strong className="text-rose-900 shrink-0">Fokus Benahi Rapor:</strong>
                    <div className="flex flex-wrap gap-1">
                      {activeRecord.raporPriorities.map((rp, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-white text-rose-800 font-bold border border-rose-300 text-[10px]">
                          {rp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Diagnosis & Tujuan */}
                <div className="space-y-2 mb-5 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border-l-4 border-blue-600">
                    <strong className="text-slate-800">Diagnosis Kondisi Awal Satuan Pendidikan:</strong>
                    <p className="text-slate-600 italic mt-0.5 leading-relaxed">{activeRecord.baselineDiagnosis}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-50/70 border-l-4 border-emerald-600">
                    <strong className="text-emerald-900">Tujuan Umum Pendampingan Berdiferensiasi:</strong>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">{activeRecord.generalObjective}</p>
                  </div>
                </div>

                {/* Matriks Program */}
                <div className="overflow-x-auto mb-6">
                  <table className="w-full border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-slate-800 text-white text-[11px] uppercase tracking-wider text-center">
                        <th className="border border-slate-300 p-2 w-10">No</th>
                        <th className="border border-slate-300 p-2 w-48 text-left">Tahap &amp; Fokus Aspek</th>
                        <th className="border border-slate-300 p-2 w-24">Metode</th>
                        <th className="border border-slate-300 p-2 text-left">Aktivitas Utama Pengawas &amp; KS</th>
                        <th className="border border-slate-300 p-2 text-left w-44">Target Output &amp; Indikator</th>
                        <th className="border border-slate-300 p-2 w-28 text-left">Linimasa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeRecord.items.map((item, idx) => (
                        <tr key={item.id} className="align-top hover:bg-slate-50/50">
                          <td className="border border-slate-300 p-2 text-center font-bold bg-slate-50">
                            {idx + 1}
                          </td>
                          <td className="border border-slate-300 p-2">
                            <span className="text-[9px] font-bold text-slate-500 uppercase block">{item.tahap}</span>
                            <strong className="text-slate-900 block font-bold mt-0.5">{item.fokusAspek}</strong>
                          </td>
                          <td className="border border-slate-300 p-2 text-center">
                            <span className="inline-block text-[10px] px-2 py-0.5 rounded font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                              {item.metode}
                            </span>
                          </td>
                          <td className="border border-slate-300 p-2 text-slate-800 leading-relaxed">
                            {item.aktivitasUtama}
                          </td>
                          <td className="border border-slate-300 p-2 text-slate-800">
                            <div className="font-semibold text-slate-900">{item.targetOutput}</div>
                            <div className="text-[10px] text-slate-500 mt-1">
                              <strong>Indikator:</strong> {item.indikatorKeberhasilan}
                            </div>
                          </td>
                          <td className="border border-slate-300 p-2 text-slate-700 text-[11px]">
                            <div className="font-bold">{item.linimasa}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{item.pihakTerlibat}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Catatan Pengawas */}
                {activeRecord.supervisorNotes && (
                  <div className="mb-5 p-3 rounded-lg bg-amber-50/70 border-l-4 border-amber-600 text-xs">
                    <strong className="text-amber-950">Catatan Refleksi Pengawas Pembina:</strong>
                    <p className="text-slate-700 italic mt-0.5 leading-relaxed">{activeRecord.supervisorNotes}</p>
                  </div>
                )}

                {/* Signature Dual */}
                <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs text-slate-800">
                  <div>
                    <p>Mengetahui / Menyetujui,</p>
                    <p className="font-semibold text-slate-600">Kepala Satuan Pendidikan</p>
                    <div className="h-16" />
                    <p className="font-bold underline text-slate-900">{activeRecord.headmasterName}</p>
                    <p className="text-slate-500 text-[11px]">NIP. {activeRecord.headmasterNip}</p>
                  </div>

                  <div>
                    <p>{settings.schoolCity || 'Pangkajene Sidenreng'}, {activeRecord.date}</p>
                    <p className="font-semibold text-slate-600">{activeRecord.supervisorRole}</p>
                    <div className="h-16" />
                    <p className="font-bold underline text-slate-900">{activeRecord.supervisorName}</p>
                    <p className="text-slate-500 text-[11px]">NIP. {activeRecord.supervisorNip}</p>
                    <p className="text-slate-400 text-[10px]">{activeRecord.supervisorRank || 'Penata Tk. I / III.d'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* ======================================================== */}
    {/* DEDICATED OFFICIAL PRINT CONTAINER (CETAK / PDF)         */}
    {/* ======================================================== */}
    {activeRecord && (
      <div id="printable-rpb-doc" className="hidden print:block text-slate-900 bg-white font-sans w-full">
        <div className="bg-white p-4 sm:p-8 max-w-4xl mx-auto border-none text-slate-900">
          {renderOfficialRPBContent(activeRecord)}
        </div>
      </div>
    )}
  </>
  );
};
