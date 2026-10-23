/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
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
  ShieldCheck,
  Laptop,
  BookOpen,
  Handshake,
  Lightbulb,
  Building,
  Check,
  X,
  Share2,
  Filter
} from 'lucide-react';
import {
  AppSettings,
  PMPillarKey,
  PM_PILLAR_DEFINITIONS,
  SOARAnalysisRecord,
  SOARItem,
  SOARQuadrantType,
  SOARStrategicMatrixStrategy
} from '../types/inspiro';
import { exportSOARToWord } from '../utils/storage';

interface SOARAnalysisViewProps {
  records: SOARAnalysisRecord[];
  settings: AppSettings;
  onSaveRecord: (record: SOARAnalysisRecord) => void;
  onDeleteRecord: (id: string) => void;
  showToast: (title: string, desc?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const SOARAnalysisView: React.FC<SOARAnalysisViewProps> = ({
  records,
  settings,
  onSaveRecord,
  onDeleteRecord,
  showToast
}) => {
  // State for active record & filters
  const [selectedRecordId, setSelectedRecordId] = useState<string>(() => {
    return records.length > 0 ? records[0].id : '';
  });
  const [selectedPillarFilter, setSelectedPillarFilter] = useState<PMPillarKey | 'all'>('all');
  const [showInquiryGuide, setShowInquiryGuide] = useState(false);

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);

  // Item form state
  const [itemQuadrant, setItemQuadrant] = useState<SOARQuadrantType>('strength');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState<{
    quadrant: SOARQuadrantType;
    pillar: PMPillarKey;
    title: string;
    description: string;
    evidenceOrMetric: string;
    priority: 'Sangat Tinggi' | 'Tinggi' | 'Sedang';
    score: number;
    assetType: SOARItem['assetType'];
  }>({
    quadrant: 'strength',
    pillar: 'pedagogi',
    title: '',
    description: '',
    evidenceOrMetric: '',
    priority: 'Tinggi',
    score: 85,
    assetType: 'Modal Manusia'
  });

  // Strategy form state
  const [editingStrategyId, setEditingStrategyId] = useState<string | null>(null);
  const [strategyForm, setStrategyForm] = useState<{
    type: 'S-O' | 'S-A' | 'O-R' | 'A-R';
    title: string;
    description: string;
    linkedPillars: PMPillarKey[];
    actionStepsText: string;
    targetOutcome: string;
    timeline: string;
    pic: string;
    progress: number;
    status: 'Perencanaan' | 'Sedang Berjalan' | 'Tercapai';
  }>({
    type: 'S-O',
    title: '',
    description: '',
    linkedPillars: ['pedagogi'],
    actionStepsText: '',
    targetOutcome: '',
    timeline: 'Bulan ke-1 s.d. Bulan ke-3',
    pic: 'Wakasek Kurikulum & Koordinator Kombes',
    progress: 50,
    status: 'Sedang Berjalan'
  });

  // Record form state
  const [recordForm, setRecordForm] = useState<{
    schoolName: string;
    schoolNpsn: string;
    academicYear: string;
    semester: string;
    date: string;
    title: string;
    focusPillarSummary: string;
    leadSupervisor: string;
    supervisorNip: string;
    headmasterName: string;
    headmasterNip: string;
    appreciativeInquiryStage: 'Discovery' | 'Dream' | 'Design' | 'Destiny';
    synthesisNotes: string;
  }>({
    schoolName: settings.schoolName || 'SMP Negeri 1 Merdeka Nusantara',
    schoolNpsn: settings.schoolNpsn || '40301234',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    date: new Date().toISOString().slice(0, 10),
    title: 'Transformasi Holistik 4 Kerangka Pembelajaran Mendalam (PM)',
    focusPillarSummary: 'Integrasi penuh 4 Kerangka PM (Pedagogi, Lingkungan, Digital, & Kemitraan)',
    leadSupervisor: settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    supervisorNip: settings.supervisorNip || '19820415 200801 1 007',
    headmasterName: 'Dra. Hj. Nurhasanah, M.Pd.',
    headmasterNip: '19720815 199802 2 003',
    appreciativeInquiryStage: 'Design',
    synthesisNotes: ''
  });

  // Find active record
  const activeRecord = useMemo(() => {
    return records.find((r) => r.id === selectedRecordId) || records[0] || null;
  }, [records, selectedRecordId]);

  // Filtered items based on active pillar filter
  const filteredItems = useMemo(() => {
    if (!activeRecord) return [];
    if (selectedPillarFilter === 'all') return activeRecord.items;
    return activeRecord.items.filter((item) => item.pillar === selectedPillarFilter);
  }, [activeRecord, selectedPillarFilter]);

  // Group items by quadrant
  const strengths = useMemo(() => filteredItems.filter((i) => i.quadrant === 'strength'), [filteredItems]);
  const opportunities = useMemo(() => filteredItems.filter((i) => i.quadrant === 'opportunity'), [filteredItems]);
  const aspirations = useMemo(() => filteredItems.filter((i) => i.quadrant === 'aspiration'), [filteredItems]);
  const results = useMemo(() => filteredItems.filter((i) => i.quadrant === 'result'), [filteredItems]);

  // Aggregate metrics
  const metrics = useMemo(() => {
    if (!activeRecord || activeRecord.items.length === 0) {
      return {
        avgStrength: 0,
        avgOpportunity: 0,
        avgAspiration: 0,
        avgResult: 0,
        overallIndex: 0,
        pillarScores: {
          pedagogi: 0,
          lingkungan: 0,
          digital: 0,
          kemitraan: 0
        }
      };
    }

    const calcAvg = (quad: SOARQuadrantType) => {
      const qItems = activeRecord.items.filter((i) => i.quadrant === quad);
      if (qItems.length === 0) return 0;
      return Math.round(qItems.reduce((acc, curr) => acc + curr.score, 0) / qItems.length);
    };

    const avgStrength = calcAvg('strength');
    const avgOpportunity = calcAvg('opportunity');
    const avgAspiration = calcAvg('aspiration');
    const avgResult = calcAvg('result');
    const overallIndex = Math.round((avgStrength + avgOpportunity + avgAspiration + avgResult) / 4);

    const calcPillarAvg = (p: PMPillarKey) => {
      const pItems = activeRecord.items.filter((i) => i.pillar === p);
      if (pItems.length === 0) return 80;
      return Math.round(pItems.reduce((acc, curr) => acc + curr.score, 0) / pItems.length);
    };

    return {
      avgStrength,
      avgOpportunity,
      avgAspiration,
      avgResult,
      overallIndex,
      pillarScores: {
        pedagogi: calcPillarAvg('pedagogi'),
        lingkungan: calcPillarAvg('lingkungan'),
        digital: calcPillarAvg('digital'),
        kemitraan: calcPillarAvg('kemitraan')
      }
    };
  }, [activeRecord]);

  // Handlers for Items
  const handleOpenAddItem = (quadrant: SOARQuadrantType) => {
    setItemQuadrant(quadrant);
    setEditingItemId(null);
    setItemForm({
      quadrant,
      pillar: selectedPillarFilter === 'all' ? 'pedagogi' : selectedPillarFilter,
      title: '',
      description: '',
      evidenceOrMetric: '',
      priority: 'Tinggi',
      score: 85,
      assetType: 'Modal Manusia'
    });
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: SOARItem) => {
    setEditingItemId(item.id);
    setItemForm({
      quadrant: item.quadrant,
      pillar: item.pillar,
      title: item.title,
      description: item.description,
      evidenceOrMetric: item.evidenceOrMetric,
      priority: item.priority,
      score: item.score,
      assetType: item.assetType || 'Modal Manusia'
    });
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecord) return;
    if (!itemForm.title.trim()) {
      showToast('Peringatan', 'Judul butir SOAR wajib diisi.', 'error');
      return;
    }

    let updatedItems: SOARItem[];
    if (editingItemId) {
      updatedItems = activeRecord.items.map((i) =>
        i.id === editingItemId ? { ...i, ...itemForm } : i
      );
    } else {
      const newItem: SOARItem = {
        id: `soar-item-${Date.now()}`,
        ...itemForm
      };
      updatedItems = [...activeRecord.items, newItem];
    }

    const updatedRecord: SOARAnalysisRecord = {
      ...activeRecord,
      items: updatedItems,
      updatedAt: new Date().toISOString()
    };

    onSaveRecord(updatedRecord);
    setIsItemModalOpen(false);
    showToast(
      editingItemId ? 'Butir Diperbarui' : 'Butir Ditambahkan',
      editingItemId ? 'Butir SOAR berhasil diperbarui.' : 'Butir SOAR baru berhasil ditambahkan.',
      'success'
    );
  };

  const handleDeleteItem = (itemId: string) => {
    if (!activeRecord) return;
    if (confirm('Apakah Anda yakin ingin menghapus butir analisis SOAR ini?')) {
      const updatedRecord: SOARAnalysisRecord = {
        ...activeRecord,
        items: activeRecord.items.filter((i) => i.id !== itemId),
        updatedAt: new Date().toISOString()
      };
      onSaveRecord(updatedRecord);
      showToast('Butir Dihapus', 'Butir SOAR telah dihapus.', 'info');
    }
  };

  // Handlers for Strategies
  const handleOpenAddStrategy = (type: 'S-O' | 'S-A' | 'O-R' | 'A-R' = 'S-O') => {
    setEditingStrategyId(null);
    setStrategyForm({
      type,
      title: '',
      description: '',
      linkedPillars: ['pedagogi'],
      actionStepsText: '',
      targetOutcome: '',
      timeline: 'Bulan ke-1 s.d. Bulan ke-3',
      pic: 'Wakasek Kurikulum & Koordinator Kombes',
      progress: 30,
      status: 'Sedang Berjalan'
    });
    setIsStrategyModalOpen(true);
  };

  const handleOpenEditStrategy = (strat: SOARStrategicMatrixStrategy) => {
    setEditingStrategyId(strat.id);
    setStrategyForm({
      type: strat.type,
      title: strat.title,
      description: strat.description,
      linkedPillars: strat.linkedPillars,
      actionStepsText: strat.actionSteps.join('\n'),
      targetOutcome: strat.targetOutcome,
      timeline: strat.timeline,
      pic: strat.pic,
      progress: strat.progress,
      status: strat.status
    });
    setIsStrategyModalOpen(true);
  };

  const handleSaveStrategy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecord) return;
    if (!strategyForm.title.trim()) {
      showToast('Peringatan', 'Nama inisiatif strategis wajib diisi.', 'error');
      return;
    }

    const actionSteps = strategyForm.actionStepsText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    let updatedStrategies: SOARStrategicMatrixStrategy[];
    if (editingStrategyId) {
      updatedStrategies = activeRecord.strategies.map((s) =>
        s.id === editingStrategyId
          ? {
              ...s,
              type: strategyForm.type,
              title: strategyForm.title,
              description: strategyForm.description,
              linkedPillars: strategyForm.linkedPillars,
              actionSteps,
              targetOutcome: strategyForm.targetOutcome,
              timeline: strategyForm.timeline,
              pic: strategyForm.pic,
              progress: strategyForm.progress,
              status: strategyForm.status
            }
          : s
      );
    } else {
      const newStrategy: SOARStrategicMatrixStrategy = {
        id: `strat-${Date.now()}`,
        type: strategyForm.type,
        title: strategyForm.title,
        description: strategyForm.description,
        linkedPillars: strategyForm.linkedPillars,
        actionSteps,
        targetOutcome: strategyForm.targetOutcome,
        timeline: strategyForm.timeline,
        pic: strategyForm.pic,
        progress: strategyForm.progress,
        status: strategyForm.status
      };
      updatedStrategies = [...(activeRecord.strategies || []), newStrategy];
    }

    const updatedRecord: SOARAnalysisRecord = {
      ...activeRecord,
      strategies: updatedStrategies,
      updatedAt: new Date().toISOString()
    };

    onSaveRecord(updatedRecord);
    setIsStrategyModalOpen(false);
    showToast(
      editingStrategyId ? 'Inisiatif Diperbarui' : 'Inisiatif Ditambahkan',
      editingStrategyId ? 'Inisiatif strategis diperbarui.' : 'Inisiatif strategis baru ditambahkan.',
      'success'
    );
  };

  const handleDeleteStrategy = (strategyId: string) => {
    if (!activeRecord) return;
    if (confirm('Hapus inisiatif strategis ini?')) {
      const updatedRecord: SOARAnalysisRecord = {
        ...activeRecord,
        strategies: activeRecord.strategies.filter((s) => s.id !== strategyId),
        updatedAt: new Date().toISOString()
      };
      onSaveRecord(updatedRecord);
      showToast('Inisiatif Dihapus', 'Inisiatif strategis telah dihapus.', 'info');
    }
  };

  const handleUpdateStrategyProgress = (strategyId: string, progress: number) => {
    if (!activeRecord) return;
    const updated = activeRecord.strategies.map((s) => {
      if (s.id === strategyId) {
        const status = progress >= 100 ? 'Tercapai' : progress > 0 ? 'Sedang Berjalan' : 'Perencanaan';
        return { ...s, progress, status: status as any };
      }
      return s;
    });
    onSaveRecord({ ...activeRecord, strategies: updated });
  };

  // Handlers for Record
  const handleOpenNewRecord = () => {
    setRecordForm({
      schoolName: settings.schoolName || 'SMP Negeri 1 Merdeka Nusantara',
      schoolNpsn: settings.schoolNpsn || '40301234',
      academicYear: '2026/2027',
      semester: 'Ganjil',
      date: new Date().toISOString().slice(0, 10),
      title: 'Analisis Strategis SOAR: Kepemimpinan Pembelajaran Mendalam (PM)',
      focusPillarSummary: 'Pemetaan Aset, Peluang, Aspirasi & Metrik Keberhasilan 4 Kerangka PM',
      leadSupervisor: settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
      supervisorNip: settings.supervisorNip || '19820415 200801 1 007',
      headmasterName: 'Dra. Hj. Nurhasanah, M.Pd.',
      headmasterNip: '19720815 199802 2 003',
      appreciativeInquiryStage: 'Design',
      synthesisNotes: ''
    });
    setIsRecordModalOpen(true);
  };

  const handleSaveRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: SOARAnalysisRecord = {
      id: `soar-${Date.now()}`,
      ...recordForm,
      supervisorRole: settings.supervisorRole || 'Pengawas Sekolah',
      items: [],
      strategies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSaveRecord(newRecord);
    setSelectedRecordId(newRecord.id);
    setIsRecordModalOpen(false);
    showToast('Dokumen Baru Dibuat', 'Dokumen Analisis SOAR baru berhasil dibuat.', 'success');
  };

  const handleExportWord = () => {
    if (!activeRecord) return;
    exportSOARToWord(activeRecord, settings);
    showToast('Dokumen Diekspor', 'Laporan Matriks SOAR berhasil diekspor ke format Word (.doc).', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  // Radar Chart Geometry (4 Axes for S, O, A, R)
  const radarSvgData = useMemo(() => {
    const center = 150;
    const radius = 100;

    // Angles for S (top: -90 deg), O (right: 0 deg), A (bottom: 90 deg), R (left: 180 deg)
    const axes = [
      { key: 'strength', label: 'Strengths (Kekuatan)', angle: -Math.PI / 2, score: metrics.avgStrength },
      { key: 'opportunity', label: 'Opportunities (Peluang)', angle: 0, score: metrics.avgOpportunity },
      { key: 'aspiration', label: 'Aspirations (Aspirasi)', angle: Math.PI / 2, score: metrics.avgAspiration },
      { key: 'result', label: 'Results (Hasil Nyata)', angle: Math.PI, score: metrics.avgResult }
    ];

    const getCoordinates = (angle: number, value: number) => {
      const r = (value / 100) * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return { x, y };
    };

    const overallPoints = axes
      .map((axis) => {
        const { x, y } = getCoordinates(axis.angle, Math.max(20, axis.score));
        return `${x},${y}`;
      })
      .join(' ');

    return {
      center,
      radius,
      axes,
      getCoordinates,
      overallPoints
    };
  }, [metrics]);

  const pillarColorClasses: Record<PMPillarKey, { bg: string; text: string; border: string; activeTab: string }> = {
    pedagogi: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      activeTab: 'bg-emerald-600 text-white shadow-emerald-500/25'
    },
    lingkungan: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      activeTab: 'bg-amber-600 text-white shadow-amber-500/25'
    },
    digital: {
      bg: 'bg-cyan-50',
      text: 'text-cyan-700',
      border: 'border-cyan-200',
      activeTab: 'bg-cyan-600 text-white shadow-cyan-500/25'
    },
    kemitraan: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      activeTab: 'bg-purple-600 text-white shadow-purple-500/25'
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Inkuiri Apresiatif & Kepemimpinan Pembelajaran Mendalam
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Matriks Analisis SOAR (4 Pilar PM)
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Transformasi kepemimpinan berbasis aset kekuatan (<span className="text-emerald-400 font-semibold">Strengths</span>),
              peluang eksternal (<span className="text-amber-400 font-semibold">Opportunities</span>),
              aspirasi masa depan (<span className="text-sky-400 font-semibold">Aspirations</span>), dan
              hasil dampak nyata (<span className="text-purple-400 font-semibold">Results</span>) untuk mewujudkan
              pembelajaran mendalam di sekolah binaan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowInquiryGuide(!showInquiryGuide)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/15 transition-all shadow-xs"
            >
              <Info className="w-4 h-4 text-cyan-300" />
              <span>{showInquiryGuide ? 'Tutup Panduan SOAR' : 'Mengapa SOAR vs SWOT?'}</span>
            </button>

            <button
              onClick={handleExportWord}
              disabled={!activeRecord}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-medium transition-all shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Word (.doc)</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={!activeRecord}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all shadow-xs disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>Cetak / Cetak PDF</span>
            </button>

            <button
              onClick={handleOpenNewRecord}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-semibold shadow-md shadow-emerald-900/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Analisis Baru</span>
            </button>
          </div>
        </div>

        {/* School & Active Record Selector */}
        {records.length > 0 && (
          <div className="mt-6 pt-5 border-t border-indigo-900/40 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-400" />
                Pilih Sekolah Binaan:
              </span>
              <select
                value={selectedRecordId}
                onChange={(e) => setSelectedRecordId(e.target.value)}
                className="bg-slate-800/90 text-white text-xs font-semibold rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {records.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.schoolName} — {r.title} ({r.academicYear})
                  </option>
                ))}
              </select>
            </div>

            {activeRecord && (
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <span className="bg-indigo-900/60 px-2.5 py-1 rounded-md border border-indigo-700/50">
                  Tahapan 4D: <strong className="text-cyan-300 font-bold">{activeRecord.appreciativeInquiryStage}</strong>
                </span>
                <span className="text-slate-400">
                  Pengawas: <strong className="text-white">{activeRecord.leadSupervisor}</strong>
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Educational Guide Drawer: Mengapa SOAR vs SWOT? */}
      {showInquiryGuide && (
        <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-md transition-all animate-in fade-in">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Filosofi Pendekatan SOAR dalam Supervisi & Kepemimpinan Pembelajaran
                </h3>
                <p className="text-xs text-slate-500">
                  Mengapa Kurikulum Merdeka & Supervisi Klinis Berbasis Coaching Menggantikan SWOT dengan SOAR?
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowInquiryGuide(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-600">
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1.5">
              <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-[10px] font-black">
                  S
                </span>
                STRENGTHS (Kekuatan)
              </span>
              <p>
                <strong>Bukan mencari kelemahan.</strong> Berfokus pada modal manusia, modal sosial, dan praktik baik yang sudah berhasil dihidupkan guru di kelas.
              </p>
              <p className="text-[11px] text-emerald-700 italic">
                Pertanyaan kunci: "Kapan kelas kita terasa paling hidup dan bermakna bagi murid?"
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 space-y-1.5">
              <span className="font-bold text-amber-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-[10px] font-black">
                  O
                </span>
                OPPORTUNITIES (Peluang)
              </span>
              <p>
                <strong>Bukan terbebani ancaman.</strong> Membaca peluang eksternal: tren TIK, dukungan kebijakan Disdikbud Kab. Sidrap, dan kemitraan masyarakat.
              </p>
              <p className="text-[11px] text-amber-700 italic">
                Pertanyaan kunci: "Mitra dan teknologi apa yang dapat melipatgandakan dampak belajar murid?"
              </p>
            </div>

            <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100 space-y-1.5">
              <span className="font-bold text-sky-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-sky-200 text-sky-800 flex items-center justify-center text-[10px] font-black">
                  A
                </span>
                ASPIRATIONS (Aspirasi)
              </span>
              <p>
                <strong>Impian bersama.</strong> Menumbuhkan visi kepemimpinan bersama tentang masa depan pembelajaran mendalam (Deep Learning) yang diinginkan.
              </p>
              <p className="text-[11px] text-sky-700 italic">
                Pertanyaan kunci: "Sekolah dan pengalaman belajar murid ideal seperti apa yang ingin kita ciptakan?"
              </p>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1.5">
              <span className="font-bold text-purple-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-[10px] font-black">
                  R
                </span>
                RESULTS (Hasil Terukur)
              </span>
              <p>
                <strong>Ketercapaian bermakna.</strong> Menerjemahkan aspirasi menjadi indikator terukur, karya autentik murid, portofolio, dan well-being.
              </p>
              <p className="text-[11px] text-purple-700 italic">
                Pertanyaan kunci: "Bukti nyata apa yang menunjukkan kita telah berhasil mewujudkan aspirasi tersebut?"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4 Pilar PM Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedPillarFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedPillarFilter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Semua Kerangka PM ({activeRecord ? activeRecord.items.length : 0})
          </button>

          {(Object.keys(PM_PILLAR_DEFINITIONS) as PMPillarKey[]).map((pkey) => {
            const def = PM_PILLAR_DEFINITIONS[pkey];
            const count = activeRecord
              ? activeRecord.items.filter((i) => i.pillar === pkey).length
              : 0;
            const isSelected = selectedPillarFilter === pkey;

            return (
              <button
                key={pkey}
                onClick={() => setSelectedPillarFilter(pkey)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? pillarColorClasses[pkey].activeTab
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                }`}
              >
                <span>{def.shortName}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {activeRecord && (
          <div className="text-xs text-slate-500 font-medium px-2 hidden lg:block">
            Menampilkan <strong>{filteredItems.length}</strong> butir analisis aktif
          </div>
        )}
      </div>

      {/* Visual Chart & Metrics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar / Spider Chart SVG Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-600" />
                Radar Keseimbangan Kuadran SOAR
              </h3>
              <p className="text-[11px] text-slate-500">
                Visualisasi keterpaduan kekuatan, peluang, visi, dan bukti hasil
              </p>
            </div>
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Indeks: {metrics.overallIndex}/100
            </span>
          </div>

          {/* SVG Radar Chart */}
          <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center my-2">
            <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible">
              {/* Background Concentric Circles */}
              {[0.25, 0.5, 0.75, 1.0].map((level, idx) => (
                <circle
                  key={idx}
                  cx={radarSvgData.center}
                  cy={radarSvgData.center}
                  r={radarSvgData.radius * level}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeDasharray={level === 1.0 ? '0' : '3,3'}
                  strokeWidth="1"
                />
              ))}

              {/* Axis lines */}
              {radarSvgData.axes.map((axis, idx) => {
                const end = radarSvgData.getCoordinates(axis.angle, 100);
                return (
                  <line
                    key={idx}
                    x1={radarSvgData.center}
                    y1={radarSvgData.center}
                    x2={end.x}
                    y2={end.y}
                    stroke="#cbd5e1"
                    strokeWidth="1.2"
                  />
                );
              })}

              {/* Filled Polygon representing current SOAR balance */}
              <polygon
                points={radarSvgData.overallPoints}
                fill="rgba(99, 102, 241, 0.25)"
                stroke="#4f46e5"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {radarSvgData.axes.map((axis, idx) => {
                const pt = radarSvgData.getCoordinates(axis.angle, Math.max(20, axis.score));
                return (
                  <g key={idx}>
                    <circle cx={pt.x} cy={pt.y} r="5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
                  </g>
                );
              })}

              {/* Labels on perimeter */}
              <text x={radarSvgData.center} y={32} textAnchor="middle" className="text-[11px] font-bold fill-emerald-700">
                S: Strengths ({metrics.avgStrength}%)
              </text>
              <text x={268} y={radarSvgData.center + 4} textAnchor="start" className="text-[11px] font-bold fill-amber-700">
                O: Opportunities ({metrics.avgOpportunity}%)
              </text>
              <text x={radarSvgData.center} y={278} textAnchor="middle" className="text-[11px] font-bold fill-sky-700">
                A: Aspirations ({metrics.avgAspiration}%)
              </text>
              <text x={32} y={radarSvgData.center + 4} textAnchor="end" className="text-[11px] font-bold fill-purple-700">
                R: Results ({metrics.avgResult}%)
              </text>
            </svg>
          </div>

          <p className="text-[11px] text-slate-500 text-center italic">
            *Diagram mengukur rata-rata bobot dampak butir-butir yang terpetakan dalam analisis SOAR aktif.
          </p>
        </div>

        {/* 4 Pilar PM Breakdown Cards */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
              <span className="text-[11px] font-semibold text-emerald-800 block">Kekuatan (S)</span>
              <span className="text-2xl font-black text-emerald-700">{metrics.avgStrength}%</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">{strengths.length} Butir Aset</span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200">
              <span className="text-[11px] font-semibold text-amber-800 block">Peluang (O)</span>
              <span className="text-2xl font-black text-amber-700">{metrics.avgOpportunity}%</span>
              <span className="text-[10px] text-amber-600 block mt-0.5">{opportunities.length} Butir Peluang</span>
            </div>

            <div className="p-3.5 rounded-xl bg-sky-50/80 border border-sky-200">
              <span className="text-[11px] font-semibold text-sky-800 block">Aspirasi (A)</span>
              <span className="text-2xl font-black text-sky-700">{metrics.avgAspiration}%</span>
              <span className="text-[10px] text-sky-600 block mt-0.5">{aspirations.length} Butir Visi</span>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200">
              <span className="text-[11px] font-semibold text-purple-800 block">Hasil Nyata (R)</span>
              <span className="text-2xl font-black text-purple-700">{metrics.avgResult}%</span>
              <span className="text-[10px] text-purple-600 block mt-0.5">{results.length} Butir Bukti</span>
            </div>
          </div>

          {/* Progress Bars for 4 PM Pillars */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>Tingkat Kematangan Strategis per Kerangka PM</span>
              <span className="text-[11px] text-slate-500 font-normal">Target Transformasi 2026/2027</span>
            </h4>

            {(Object.keys(PM_PILLAR_DEFINITIONS) as PMPillarKey[]).map((pkey) => {
              const def = PM_PILLAR_DEFINITIONS[pkey];
              const score = metrics.pillarScores[pkey];

              return (
                <div key={pkey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      {def.name}
                    </span>
                    <span className="font-bold text-slate-800">{score}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pkey === 'pedagogi'
                          ? 'bg-emerald-500'
                          : pkey === 'lingkungan'
                          ? 'bg-amber-500'
                          : pkey === 'digital'
                          ? 'bg-cyan-500'
                          : 'bg-purple-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Synthesis Note from Supervisor */}
          {activeRecord && activeRecord.synthesisNotes && (
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-800 block mb-0.5">Catatan Pengawas Pembina:</span>
              <p className="italic">"{activeRecord.synthesisNotes}"</p>
            </div>
          )}
        </div>
      </div>

      {/* 2x2 Interactive SOAR Board */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Papan Matriks 4 Kuadran SOAR
          </h2>
          <span className="text-xs text-slate-500">
            Klik tombol <strong>+ Tambah</strong> pada kuadran yang diinginkan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* QUADRANT 1: STRENGTHS */}
          <div className="bg-white rounded-2xl border-2 border-emerald-200/80 shadow-xs flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3.5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-black text-sm">
                  S
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">STRENGTHS (Kekuatan & Aset Riil)</h3>
                  <p className="text-[11px] text-emerald-100">Modal internal, praktik pedagogis unggul, budaya positif</p>
                </div>
              </div>
              <button
                onClick={() => handleOpenAddItem('strength')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah S</span>
              </button>
            </div>

            <div className="p-4 space-y-3 flex-1 bg-emerald-50/20">
              {strengths.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 italic">
                  Belum ada kekuatan yang terdaftar untuk filter ini.
                </div>
              ) : (
                strengths.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-white border border-emerald-100 shadow-2xs hover:border-emerald-300 transition-all space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 uppercase">
                          {PM_PILLAR_DEFINITIONS[item.pillar].shortName}
                        </span>
                        {item.assetType && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {item.assetType}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-emerald-600">
                          Skor: {item.score}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditItem(item)}
                          className="text-slate-400 hover:text-blue-600 p-1 rounded-md"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{item.description}</p>
                    <div className="pt-1 border-t border-slate-100 text-[10px] text-emerald-700">
                      <strong>Bukti/Fakta:</strong> {item.evidenceOrMetric}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* QUADRANT 2: OPPORTUNITIES */}
          <div className="bg-white rounded-2xl border-2 border-amber-200/80 shadow-xs flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3.5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-black text-sm">
                  O
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">OPPORTUNITIES (Peluang Ungkitan)</h3>
                  <p className="text-[11px] text-amber-100">Kemitraan eksternal, program daerah Sidrap, inovasi TIK</p>
                </div>
              </div>
              <button
                onClick={() => handleOpenAddItem('opportunity')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah O</span>
              </button>
            </div>

            <div className="p-4 space-y-3 flex-1 bg-amber-50/20">
              {opportunities.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 italic">
                  Belum ada peluang yang terdaftar untuk filter ini.
                </div>
              ) : (
                opportunities.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-white border border-amber-100 shadow-2xs hover:border-amber-300 transition-all space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 uppercase">
                          {PM_PILLAR_DEFINITIONS[item.pillar].shortName}
                        </span>
                        {item.assetType && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {item.assetType}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-amber-600">
                          Skor: {item.score}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditItem(item)}
                          className="text-slate-400 hover:text-blue-600 p-1 rounded-md"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{item.description}</p>
                    <div className="pt-1 border-t border-slate-100 text-[10px] text-amber-700">
                      <strong>Peluang Ungkit:</strong> {item.evidenceOrMetric}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* QUADRANT 3: ASPIRATIONS */}
          <div className="bg-white rounded-2xl border-2 border-sky-200/80 shadow-xs flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-3.5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-black text-sm">
                  A
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">ASPIRATIONS (Aspirasi & Impian)</h3>
                  <p className="text-[11px] text-sky-100">Visi pembelajaran mendalam impian, agensi murid merdeka</p>
                </div>
              </div>
              <button
                onClick={() => handleOpenAddItem('aspiration')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah A</span>
              </button>
            </div>

            <div className="p-4 space-y-3 flex-1 bg-sky-50/20">
              {aspirations.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 italic">
                  Belum ada aspirasi yang terdaftar untuk filter ini.
                </div>
              ) : (
                aspirations.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-white border border-sky-100 shadow-2xs hover:border-sky-300 transition-all space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 uppercase">
                          {PM_PILLAR_DEFINITIONS[item.pillar].shortName}
                        </span>
                        {item.assetType && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {item.assetType}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-sky-600">
                          Skor: {item.score}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditItem(item)}
                          className="text-slate-400 hover:text-blue-600 p-1 rounded-md"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{item.description}</p>
                    <div className="pt-1 border-t border-slate-100 text-[10px] text-sky-700">
                      <strong>Cita-cita Wujud:</strong> {item.evidenceOrMetric}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* QUADRANT 4: RESULTS */}
          <div className="bg-white rounded-2xl border-2 border-purple-200/80 shadow-xs flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-5 py-3.5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-black text-sm">
                  R
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">RESULTS (Hasil & Metrik Terukur)</h3>
                  <p className="text-[11px] text-purple-100">Karya autentik murid, portofolio, metrik keberhasilan nyata</p>
                </div>
              </div>
              <button
                onClick={() => handleOpenAddItem('result')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah R</span>
              </button>
            </div>

            <div className="p-4 space-y-3 flex-1 bg-purple-50/20">
              {results.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 italic">
                  Belum ada hasil terukur yang terdaftar untuk filter ini.
                </div>
              ) : (
                results.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-white border border-purple-100 shadow-2xs hover:border-purple-300 transition-all space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 uppercase">
                          {PM_PILLAR_DEFINITIONS[item.pillar].shortName}
                        </span>
                        {item.assetType && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {item.assetType}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-purple-600">
                          Skor: {item.score}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditItem(item)}
                          className="text-slate-400 hover:text-blue-600 p-1 rounded-md"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{item.description}</p>
                    <div className="pt-1 border-t border-slate-100 text-[10px] text-purple-700">
                      <strong>Metrik Capaian:</strong> {item.evidenceOrMetric}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Initiatives Matrix (S-O, S-A, O-R, A-R Action Plans) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600" />
              Rencana Inisiatif Strategis Kombinasi (S-O, S-A, O-R, A-R)
            </h2>
            <p className="text-xs text-slate-500">
              Formulasi strategi terpadu yang menjembatani kekuatan dengan peluang dan aspirasi dengan hasil nyata
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenAddStrategy('S-O')}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold"
            >
              + Strategi S-O
            </button>
            <button
              onClick={() => handleOpenAddStrategy('S-A')}
              className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold"
            >
              + Strategi S-A
            </button>
            <button
              onClick={() => handleOpenAddStrategy('O-R')}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold"
            >
              + Strategi O-R
            </button>
            <button
              onClick={() => handleOpenAddStrategy('A-R')}
              className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold"
            >
              + Strategi A-R
            </button>
          </div>
        </div>

        {/* Strategies Cards */}
        {activeRecord && (!activeRecord.strategies || activeRecord.strategies.length === 0) ? (
          <div className="p-8 text-center text-xs text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Belum ada inisiatif strategis yang dirumuskan. Klik salah satu tombol strategi di atas untuk merumuskan aksi.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRecord?.strategies.map((strat) => {
              const badgeColors = {
                'S-O': 'bg-emerald-100 text-emerald-800 border-emerald-200',
                'S-A': 'bg-sky-100 text-sky-800 border-sky-200',
                'O-R': 'bg-amber-100 text-amber-800 border-amber-200',
                'A-R': 'bg-purple-100 text-purple-800 border-purple-200'
              };

              return (
                <div
                  key={strat.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all bg-white shadow-2xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-black border ${badgeColors[strat.type]}`}>
                        {strat.type}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">{strat.timeline}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditStrategy(strat)}
                        className="text-slate-400 hover:text-blue-600 p-1 rounded-md"
                        title="Edit Strategi"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStrategy(strat.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                        title="Hapus Strategi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-800">{strat.title}</h3>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{strat.description}</p>
                  </div>

                  {strat.actionSteps && strat.actionSteps.length > 0 && (
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide block">
                        Langkah Aksi:
                      </span>
                      <ul className="text-[11px] text-slate-600 space-y-0.5 pl-3 list-disc">
                        {strat.actionSteps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500">PIC: </span>
                      <strong className="text-slate-700">{strat.pic}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {strat.status}
                      </span>
                      <span className="font-bold text-indigo-600">{strat.progress}%</span>
                    </div>
                  </div>

                  {/* Progress slider / bar */}
                  <div className="space-y-1">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all"
                        style={{ width: `${strat.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>Ubah Progress:</span>
                      <div className="flex items-center gap-1">
                        {[25, 50, 75, 100].map((val) => (
                          <button
                            key={val}
                            onClick={() => handleUpdateStrategyProgress(strat.id, val)}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                              strat.progress === val
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                            }`}
                          >
                            {val}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: Tambah/Edit Butir SOAR */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800">
                {editingItemId ? 'Edit Butir Analisis SOAR' : `Tambah Butir ${itemForm.quadrant.toUpperCase()}`}
              </h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kuadran SOAR
                  </label>
                  <select
                    value={itemForm.quadrant}
                    onChange={(e) => setItemForm({ ...itemForm, quadrant: e.target.value as SOARQuadrantType })}
                    className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 p-2 border"
                  >
                    <option value="strength">S - Strengths (Kekuatan)</option>
                    <option value="opportunity">O - Opportunities (Peluang)</option>
                    <option value="aspiration">A - Aspirations (Aspirasi)</option>
                    <option value="result">R - Results (Hasil Terukur)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kerangka PM Terkait
                  </label>
                  <select
                    value={itemForm.pillar}
                    onChange={(e) => setItemForm({ ...itemForm, pillar: e.target.value as PMPillarKey })}
                    className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 p-2 border"
                  >
                    <option value="pedagogi">1. Praktik Pedagogis</option>
                    <option value="lingkungan">2. Lingkungan Belajar</option>
                    <option value="digital">3. Pemanfaatan Digital</option>
                    <option value="kemitraan">4. Kemitraan Pembelajaran</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Butir Pernyataan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Komunitas Belajar Aktif & Budaya Lesson Study"
                  value={itemForm.title}
                  onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                  className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 p-2 border"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi / Konteks Rinci
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan kondisi faktual di lapangan atau harapan mendalam..."
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 p-2 border"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bukti Faktual / Target Metrik
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 12 modul ajar berbasis proyek terverifikasi dalam Kombes"
                  value={itemForm.evidenceOrMetric}
                  onChange={(e) => setItemForm({ ...itemForm, evidenceOrMetric: e.target.value })}
                  className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 p-2 border"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Modal Aset
                  </label>
                  <select
                    value={itemForm.assetType}
                    onChange={(e) => setItemForm({ ...itemForm, assetType: e.target.value as any })}
                    className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 p-2 border"
                  >
                    <option value="Modal Manusia">Modal Manusia</option>
                    <option value="Modal Sosial">Modal Sosial</option>
                    <option value="Modal Fisik">Modal Fisik</option>
                    <option value="Modal Lingkungan">Modal Lingkungan</option>
                    <option value="Modal Finansial">Modal Finansial</option>
                    <option value="Modal Budaya">Modal Budaya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prioritas Dampak
                  </label>
                  <select
                    value={itemForm.priority}
                    onChange={(e) => setItemForm({ ...itemForm, priority: e.target.value as any })}
                    className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 p-2 border"
                  >
                    <option value="Sangat Tinggi">Sangat Tinggi</option>
                    <option value="Tinggi">Tinggi</option>
                    <option value="Sedang">Sedang</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bobot Kesiapan (0-100)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={itemForm.score}
                    onChange={(e) => setItemForm({ ...itemForm, score: parseInt(e.target.value) || 80 })}
                    className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 p-2 border"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-sm"
                >
                  Simpan Butir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tambah/Edit Inisiatif Strategis */}
      {isStrategyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800">
                {editingStrategyId ? 'Edit Inisiatif Strategis' : 'Formulasi Inisiatif Strategis Baru'}
              </h3>
              <button
                onClick={() => setIsStrategyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStrategy} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipe Strategi SOAR
                  </label>
                  <select
                    value={strategyForm.type}
                    onChange={(e) => setStrategyForm({ ...strategyForm, type: e.target.value as any })}
                    className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 p-2 border"
                  >
                    <option value="S-O">Strategi S-O (Gunakan Kekuatan untuk Raih Peluang)</option>
                    <option value="S-A">Strategi S-A (Padukan Kekuatan dengan Aspirasi)</option>
                    <option value="O-R">Strategi O-R (Optimalkan Peluang untuk Raih Hasil)</option>
                    <option value="A-R">Strategi A-R (Wujudkan Aspirasi Menjadi Hasil Teruji)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Waktu / Timeline Pelaksanaan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bulan ke-1 s.d. Bulan ke-3"
                    value={strategyForm.timeline}
                    onChange={(e) => setStrategyForm({ ...strategyForm, timeline: e.target.value })}
                    className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 p-2 border"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Inisiatif Strategis
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kapitalisasi Komunitas Belajar & Diseminasi Praktik Baik PM"
                  value={strategyForm.title}
                  onChange={(e) => setStrategyForm({ ...strategyForm, title: e.target.value })}
                  className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 p-2 border"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi Strategi
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Penjelasan latar belakang dan tujuan inisiatif..."
                  value={strategyForm.description}
                  onChange={(e) => setStrategyForm({ ...strategyForm, description: e.target.value })}
                  className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 p-2 border"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Langkah Aksi Konkret (Satu langkah per baris)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Menyusun jadwal lesson study dua pekanan&#10;Menerbitkan panduan modul praktis PM&#10;Melakukan workshop bersama MGMP"
                  value={strategyForm.actionStepsText}
                  onChange={(e) => setStrategyForm({ ...strategyForm, actionStepsText: e.target.value })}
                  className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 p-2 border font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Capaian (Outcome)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Tersedia 12 modul ajar berbasis riset lingkungan"
                    value={strategyForm.targetOutcome}
                    onChange={(e) => setStrategyForm({ ...strategyForm, targetOutcome: e.target.value })}
                    className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 p-2 border"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Penanggung Jawab (PIC)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Wakasek Kurikulum & Koordinator Kombes"
                    value={strategyForm.pic}
                    onChange={(e) => setStrategyForm({ ...strategyForm, pic: e.target.value })}
                    className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 p-2 border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Progress Eksekusi ({strategyForm.progress}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={strategyForm.progress}
                    onChange={(e) => setStrategyForm({ ...strategyForm, progress: parseInt(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Eksekusi
                  </label>
                  <select
                    value={strategyForm.status}
                    onChange={(e) => setStrategyForm({ ...strategyForm, status: e.target.value as any })}
                    className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 p-2 border"
                  >
                    <option value="Perencanaan">Perencanaan</option>
                    <option value="Sedang Berjalan">Sedang Berjalan</option>
                    <option value="Tercapai">Tercapai</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStrategyModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-sm"
                >
                  Simpan Inisiatif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Buat Dokumen Analisis SOAR Baru */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800">
                Buat Dokumen Analisis SOAR Baru
              </h3>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecordSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Satuan Pendidikan
                </label>
                <input
                  type="text"
                  required
                  value={recordForm.schoolName}
                  onChange={(e) => setRecordForm({ ...recordForm, schoolName: e.target.value })}
                  className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 p-2 border"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tahun Pelajaran
                  </label>
                  <input
                    type="text"
                    required
                    value={recordForm.academicYear}
                    onChange={(e) => setRecordForm({ ...recordForm, academicYear: e.target.value })}
                    className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 p-2 border"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Semester
                  </label>
                  <select
                    value={recordForm.semester}
                    onChange={(e) => setRecordForm({ ...recordForm, semester: e.target.value })}
                    className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 p-2 border"
                  >
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Fokus Analisis
                </label>
                <input
                  type="text"
                  required
                  value={recordForm.title}
                  onChange={(e) => setRecordForm({ ...recordForm, title: e.target.value })}
                  className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 p-2 border"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tahapan Inkuiri Apresiatif (4D Cycle)
                </label>
                <select
                  value={recordForm.appreciativeInquiryStage}
                  onChange={(e) => setRecordForm({ ...recordForm, appreciativeInquiryStage: e.target.value as any })}
                  className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 p-2 border"
                >
                  <option value="Discovery">1. Discovery (Menemukan Kekuatan Terbaik)</option>
                  <option value="Dream">2. Dream (Mengimajinasikan Masa Depan Ideal)</option>
                  <option value="Design">3. Design (Merancang Ekosistem & Aliansi Belajar)</option>
                  <option value="Destiny">4. Destiny (Mengeksekusi Aksi & Merayakan Hasil)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Sintesis Kepemimpinan Pengawas
                </label>
                <textarea
                  rows={3}
                  placeholder="Catatan reflektif pengawas terkait kesiapan sekolah mengembangkan PM..."
                  value={recordForm.synthesisNotes}
                  onChange={(e) => setRecordForm({ ...recordForm, synthesisNotes: e.target.value })}
                  className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 p-2 border"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-sm"
                >
                  Buat Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
