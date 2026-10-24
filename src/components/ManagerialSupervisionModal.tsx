/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  Sparkles,
  Save,
  BookOpen,
  Users,
  GraduationCap,
  Building2,
  Coins,
  HeartHandshake,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Award,
  TrendingUp,
  HelpCircle,
  School,
  Calendar,
  Check,
  ArrowRight,
  Search,
  RotateCcw,
  FileDown
} from 'lucide-react';
import {
  Principal,
  AppSettings,
  ManagerialEvaluationRecord,
  MANAGERIAL_DIMENSIONS,
  TOTAL_MANAGERIAL_ITEMS,
  MAX_MANAGERIAL_RAW_SCORE,
  calculateManagerialScore
} from '../types/inspiro';
import { exportIndividualManagerialToWord } from '../utils/documentExport';

interface ManagerialSupervisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  principal: Principal;
  existingEvaluation?: ManagerialEvaluationRecord | null;
  settings: AppSettings;
  onSaveEvaluation: (evaluation: ManagerialEvaluationRecord) => void;
  showToast: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const ManagerialSupervisionModal: React.FC<ManagerialSupervisionModalProps> = ({
  isOpen,
  onClose,
  principal,
  existingEvaluation,
  settings,
  onSaveEvaluation,
  showToast
}) => {
  // Active Dimension Tab (0 - 7)
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  // Evaluation metadata
  const [date, setDate] = useState(() => {
    if (existingEvaluation?.date) return existingEvaluation.date;
    return new Date().toISOString().split('T')[0];
  });
  const [academicYear, setAcademicYear] = useState(() => existingEvaluation?.academicYear || '2026/2027');
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>(() => existingEvaluation?.semester || 'Ganjil');

  // Scores map: itemId -> score (1-4)
  const [scores, setScores] = useState<Record<string, number>>(() => {
    if (existingEvaluation?.scores) return { ...existingEvaluation.scores };
    return {};
  });

  // Notes map: itemId -> note
  const [itemNotes, setItemNotes] = useState<Record<string, string>>(() => {
    if (existingEvaluation?.notes) return { ...existingEvaluation.notes };
    return {};
  });

  // Overall notes & recommendations
  const [catatanPengawas, setCatatanPengawas] = useState(() => existingEvaluation?.catatanPengawas || '');
  const [rekomendasiManajerial, setRekomendasiManajerial] = useState(() => existingEvaluation?.rekomendasiManajerial || '');

  // Print mode
  const [isPrintMode, setIsPrintMode] = useState(false);

  // Search & Filter state for indicators in active dimension
  const [filterStatus, setFilterStatus] = useState<'all' | 'unscored' | 'scored'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync state if existingEvaluation changes
  useEffect(() => {
    if (existingEvaluation) {
      setDate(existingEvaluation.date);
      setAcademicYear(existingEvaluation.academicYear);
      setSemester(existingEvaluation.semester);
      setScores({ ...existingEvaluation.scores });
      setItemNotes({ ...existingEvaluation.notes });
      setCatatanPengawas(existingEvaluation.catatanPengawas || '');
      setRekomendasiManajerial(existingEvaluation.rekomendasiManajerial || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setScores({});
      setItemNotes({});
      setCatatanPengawas('');
      setRekomendasiManajerial('');
    }
    setFilterStatus('all');
    setSearchQuery('');
  }, [existingEvaluation, principal.id]);

  // Real-time score calculation
  const scoreStats = useMemo(() => {
    return calculateManagerialScore(scores);
  }, [scores]);

  // Active dimension definition
  const currentDimension = MANAGERIAL_DIMENSIONS[activeTabIdx] || MANAGERIAL_DIMENSIONS[0];

  // Map icon name to Lucide Icon component
  const getDimensionIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen className="w-4 h-4" />;
      case 'Users':
        return <Users className="w-4 h-4" />;
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4" />;
      case 'Building2':
        return <Building2 className="w-4 h-4" />;
      case 'Coins':
        return <Coins className="w-4 h-4" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-4 h-4" />;
      case 'FileText':
        return <FileText className="w-4 h-4" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4" />;
      default:
        return <School className="w-4 h-4" />;
    }
  };

  // Quick fill sample scores across all 138 indicators
  const handleQuickFill = (level: 3 | 4) => {
    const newScores: Record<string, number> = {};
    MANAGERIAL_DIMENSIONS.forEach((dim) => {
      dim.items.forEach((item, idx) => {
        // give realistic slight variations
        if (level === 4) {
          newScores[item.id] = (idx % 4 === 0) ? 3 : 4;
        } else {
          newScores[item.id] = (idx % 3 === 0) ? 4 : 3;
        }
      });
    });
    setScores(newScores);
    setCatatanPengawas(
      `Hasil supervisi manajerial ${principal.nama} menunjukkan tata kelola satuan pendidikan di ${principal.satuanPendidikan} telah memenuhi standar pengelolaan nasional. Dokumen KSP sah, perencanaan berbasis data terstruktur, pembukuan ARKAS tertib, dan iklim lingkungan sekolah kondusif.`
    );
    setRekomendasiManajerial(
      `Pertahankan konsistensi penjaminan mutu internal 8 dimensi, tingkatkan aktivasi komunitas belajar guru (Kombel) intra-sekolah, dan lanjutkan pemeliharaan sarana digital serta kemitraan humas secara berkala.`
    );
    showToast('Contoh Nilai Terisi', `Seluruh ${TOTAL_MANAGERIAL_ITEMS} indikator 8 dimensi telah terisi dengan data standar.`, 'info');
  };

  // Bulk set all items in active dimension to a specific score (1-4)
  const handleBulkSetDimension = (level: number) => {
    setScores((prev) => {
      const next = { ...prev };
      currentDimension.items.forEach((item) => {
        next[item.id] = level;
      });
      return next;
    });
    showToast(
      'Nilai Dimensi Diatur',
      `Seluruh ${currentDimension.items.length} indikator dimensi ${currentDimension.shortTitle} diatur ke Skala ${level}.`,
      'info'
    );
  };

  // Reset scores for active dimension
  const handleResetDimension = () => {
    setScores((prev) => {
      const next = { ...prev };
      currentDimension.items.forEach((item) => {
        delete next[item.id];
      });
      return next;
    });
    showToast(
      'Reset Dimensi',
      `Penilaian untuk dimensi ${currentDimension.shortTitle} telah dikosongkan.`,
      'warning'
    );
  };

  // Filtered items in active dimension
  const displayedItems = useMemo(() => {
    return currentDimension.items.filter((item) => {
      const val = scores[item.id] || 0;
      if (filterStatus === 'unscored' && val > 0) return false;
      if (filterStatus === 'scored' && val === 0) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.text.toLowerCase().includes(q) ||
          (item.evidenceGuidance && item.evidenceGuidance.toLowerCase().includes(q)) ||
          item.number.toString().includes(q)
        );
      }
      return true;
    });
  }, [currentDimension, scores, filterStatus, searchQuery]);

  // Generate automated recommendation based on weakest dimension
  const handleGenerateSmartRecommendation = () => {
    const dimEntries = Object.entries(scoreStats.dimensionScores);
    if (dimEntries.length === 0) return;

    // Find dimension with lowest percentage
    let lowestKey = dimEntries[0][0];
    let lowestPct = dimEntries[0][1].percentage;

    dimEntries.forEach(([key, val]) => {
      if (val.percentage < lowestPct) {
        lowestPct = val.percentage;
        lowestKey = key;
      }
    });

    const targetDim = MANAGERIAL_DIMENSIONS.find((d) => d.key === lowestKey) || MANAGERIAL_DIMENSIONS[0];

    const recommendationTemplates: Record<string, { catatan: string; rekomendasi: string }> = {
      kurikulum: {
        catatan: `Perlu peningkatan pada dokumen Kurikulum Satuan Pendidikan (KSP) dan pemantauan berkala terhadap telaah modul ajar guru. Jadwal supervisi akademik kepala sekolah belum terlaksana optimal.`,
        rekomendasi: `1. Segera mutakhirkan dokumen KSP dan koordinasikan pengesahan ke Dinas Pendidikan.\n2. Jadwalkan telaah modul ajar dan supervisi akademik guru minimal 1 kali per semester dengan rubrik Kurikulum Merdeka.`
      },
      kesiswaan: {
        catatan: `Dokumentasi buku induk dan catatan bimbingan konseling (BK) perlu penataan yang lebih tertib. Program pembinaan prestasi ekskul belum memiliki target yang terdokumentasi.`,
        rekomendasi: `1. Lakukan audit buku induk siswa dan sinkronisasi data mutasi secara rutin dengan Dapodik.\n2. Aktifkan layanan BK dengan pendekatan disiplin positif dan restitusi ramah anak.`
      },
      ptk: {
        catatan: `Fasilitasi program pengembangan keprofesian berkelanjutan (PKB) guru masih perlu dioptimalkan. Dokumen penilaian kinerja guru (PKG) perlu integrasi lebih dalam ke platform PMM.`,
        rekomendasi: `1. Bentuk dan jadwalkan Komunitas Belajar (Kombel) sekolah untuk berbagi praktik baik mingguan.\n2. Lengkapi berkas portofolio kepegawaian fisik dan digital seluruh guru dan tenaga kependidikan.`
      },
      sarpras: {
        catatan: `Buku inventaris barang dan Kartu Inventaris Ruangan (KIR) belum dimutakhirkan secara menyeluruh. Terdapat barang rusak berat yang belum diajukan proses penghapusan aset.`,
        rekomendasi: `1. Buat jadwal preventive maintenance untuk perawatan gedung dan sarana laboratorium TIK.\n2. Susun berita acara pemeriksaan barang rusak berat dan ajukan usulan penghapusan aset ke dinas/BPKAD.`
      },
      keuangan: {
        catatan: `Dokumen RKAS perlu lebih diselaraskan dengan indikator prioritas Rapor Pendidikan (PBD). Pembukuan Buku Kas Umum (BKU) dan rekonsiliasi bank perlu ditutup disiplin tiap bulan.`,
        rekomendasi: `1. Optimalkan input dan sinkronisasi tepat waktu melalui aplikasi ARKAS.\n2. Pasang ringkasan realisasi penggunaan dana BOS pada papan transparansi sekolah sebagai wujud akuntabilitas publik.`
      },
      humas: {
        catatan: `Peran Komite Sekolah masih perlu ditingkatkan dari sekadar administratif menjadi mitra strategis. Saluran publikasi media sosial sekolah belum dimanfaatkan secara aktif.`,
        rekomendasi: `1. Adakan rapat koordinasi berkala dengan Komite Sekolah dan tokoh masyarakat setempat.\n2. Perluas naskah kerja sama (MoU) dengan instansi kesehatan (Puskesmas), kepolisian, dan dunia usaha/alumni.`
      },
      administrasi: {
        catatan: `Dokumen RKJM 4 tahunan dan RKT perlu evaluasi berkala per semester. Alur sistem persuratan dan penomoran arsip perlu penataan terpusat.`,
        rekomendasi: `1. Lakukan review ketercapaian target KPI dalam Rencana Kerja Tahunan (RKT).\n2. Terapkan kodefikasi persuratan resmi dan penyimpanan arsip digital untuk dokumen-dokumen penting sekolah.`
      },
      lingkungan: {
        catatan: `Budaya kebersihan toilet dan penataan sanitasi ramah anak perlu pemantauan ekstra. Rambu mitigasi bencana dan sosialisasi tim TPPK perlu diperkuat.`,
        rekomendasi: `1. Giatkan gerakan sekolah sehat dan pembiasaan budaya positif Profil Pelajar Pancasila setiap pagi.\n2. Pastikan Tim Pencegahan dan Penanganan Kekerasan (TPPK) aktif dan kotak pengaduan berfungsi optimal.`
      }
    };

    const template = recommendationTemplates[lowestKey] || recommendationTemplates.kurikulum;
    setCatatanPengawas((prev) => (prev ? `${prev}\n\n[Temuan Prioritas]: ${template.catatan}` : template.catatan));
    setRekomendasiManajerial((prev) => (prev ? `${prev}\n\n[Rekomendasi Prioritas]:\n${template.rekomendasi}` : template.rekomendasi));

    showToast(
      'Rekomendasi Berbasis Data Dihasilkan',
      `Fokus intervensi otomatis disesuaikan pada dimensi: ${targetDim.title}`,
      'success'
    );
  };

  // Save handler
  const handleSave = (status: 'draft' | 'selesai') => {
    if (status === 'selesai' && scoreStats.answeredCount < TOTAL_MANAGERIAL_ITEMS) {
      const confirmIncomplete = window.confirm(
        `Baru ${scoreStats.answeredCount} dari ${TOTAL_MANAGERIAL_ITEMS} indikator yang dinilai. Apakah Anda tetap ingin menyimpan supervisi ini sebagai SELESAI?`
      );
      if (!confirmIncomplete) return;
    }

    const evalRecord: ManagerialEvaluationRecord = {
      id: existingEvaluation?.id || `me-${Date.now().toString().slice(-6)}`,
      principalId: principal.id,
      principalName: principal.nama,
      principalNip: principal.nip,
      schoolName: principal.satuanPendidikan,
      date,
      academicYear,
      semester,
      scores,
      notes: itemNotes,
      dimensionScores: scoreStats.dimensionScores,
      totalScore: scoreStats.totalScore,
      finalScore: scoreStats.finalScore,
      predicate: scoreStats.predicate,
      catatanPengawas,
      rekomendasiManajerial,
      supervisorName: settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
      supervisorNip: settings.supervisorNip || '19820415 200801 1 007',
      status,
      createdAt: existingEvaluation?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveEvaluation(evalRecord);
    showToast(
      status === 'selesai' ? 'Supervisi Manajerial Selesai!' : 'Draf Disimpan',
      `Nilai Akhir: ${scoreStats.finalScore} (${scoreStats.predicate}) untuk ${principal.nama}. Data tersimpan.`,
      'success'
    );
    onClose();
  };

  const handleExportWord = () => {
    const evalRecord: ManagerialEvaluationRecord = {
      id: existingEvaluation?.id || `me-${Date.now().toString().slice(-6)}`,
      principalId: principal.id,
      principalName: principal.nama,
      principalNip: principal.nip,
      schoolName: principal.satuanPendidikan,
      date,
      academicYear,
      semester,
      scores,
      notes: itemNotes,
      dimensionScores: scoreStats.dimensionScores,
      totalScore: scoreStats.totalScore,
      finalScore: scoreStats.finalScore,
      predicate: scoreStats.predicate,
      catatanPengawas,
      rekomendasiManajerial,
      supervisorName: settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
      supervisorNip: settings.supervisorNip || '19820415 200801 1 007',
      status: existingEvaluation?.status || 'selesai',
      createdAt: existingEvaluation?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      exportIndividualManagerialToWord(principal, evalRecord, settings);
      showToast(
        'Berhasil Ekspor Word',
        `Instrumen supervisi manajerial lengkap untuk ${principal.nama} berhasil diunduh dalam format .doc.`,
        'success'
      );
    } catch (err) {
      console.error('Error exporting Word:', err);
      showToast('Gagal Ekspor Word', 'Terjadi kesalahan saat memproses berkas Word.', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Printable Official Document Mode */}
        {isPrintMode ? (
          <div className="flex-1 overflow-y-auto p-8 bg-white text-slate-900">
            {/* Action Bar for Print */}
            <div className="no-print flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
              <button
                onClick={() => setIsPrintMode(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali ke Mode Input</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportWord}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                  title="Unduh instrumen supervisi manajerial 138 indikator ke Word (.doc)"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Ekspor Word (.doc)</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                  title="Cetak atau Simpan ke format PDF resmi"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak PDF / Dokumen Resmi</span>
                </button>
              </div>
            </div>

            {/* Official Header */}
            <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
              <h3 className="text-xs uppercase tracking-widest font-bold text-slate-700">
                {settings.governmentAgency || 'PEMERINTAH KABUPATEN SIDENRENG RAPPANG'}
              </h3>
              <h4 className="text-xs uppercase tracking-widest font-semibold text-slate-600">
                DINAS PENDIDIKAN DAN KEBUDAYAAN
              </h4>
              <h2 className="text-lg font-black uppercase text-slate-900 mt-2">
                INSTRUMEN SUPERVISI MANAJERIAL KEPALA SEKOLAH
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Evaluasi 8 Dimensi Manajemen Sekolah Berdasarkan Standar Pengelolaan Pendidikan (Skala 1 – 4)
              </p>
            </div>

            {/* Identity Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="space-y-1.5">
                <div className="flex">
                  <span className="w-40 font-semibold text-slate-600">Nama Kepala Sekolah</span>
                  <span className="font-bold text-slate-900">: {principal.nama}</span>
                </div>
                <div className="flex">
                  <span className="w-40 font-semibold text-slate-600">NIP</span>
                  <span className="text-slate-800">: {principal.nip}</span>
                </div>
                <div className="flex">
                  <span className="w-40 font-semibold text-slate-600">Pangkat / Golongan</span>
                  <span className="text-slate-800">: {principal.pangkatGolongan || '-'}</span>
                </div>
                <div className="flex">
                  <span className="w-40 font-semibold text-slate-600">Satuan Pendidikan</span>
                  <span className="font-bold text-slate-900">: {principal.satuanPendidikan}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex">
                  <span className="w-40 font-semibold text-slate-600">Nama Pengawas Pembina</span>
                  <span className="font-bold text-slate-900">: {settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'}</span>
                </div>
                <div className="flex">
                  <span className="w-40 font-semibold text-slate-600">NIP Pengawas</span>
                  <span className="text-slate-800">: {settings.supervisorNip || '19820415 200801 1 007'}</span>
                </div>
                <div className="flex">
                  <span className="w-40 font-semibold text-slate-600">Hari / Tanggal Supervisi</span>
                  <span className="text-slate-800">: {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex">
                  <span className="w-40 font-semibold text-slate-600">Semester / Tahun Ajaran</span>
                  <span className="text-slate-800">: Semester {semester} / TA {academicYear}</span>
                </div>
              </div>
            </div>

            {/* Rekap Nilai Bar */}
            <div className="p-4 mb-6 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-800 font-semibold">HASIL EVALUASI MANAJERIAL KESELURUHAN</p>
                <p className="text-xs text-slate-600 mt-0.5">Total Skor: {scoreStats.totalScore} dari maksimal {MAX_MANAGERIAL_RAW_SCORE} poin</p>
              </div>
              <div className="text-right">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-blue-900">{scoreStats.finalScore}</span>
                  <span className="text-xs font-semibold text-slate-500">/ 100</span>
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-blue-600 text-white">
                  Predikat: {scoreStats.predicate}
                </span>
              </div>
            </div>

            {/* Table of 8 Dimensions */}
            <div className="space-y-6">
              {MANAGERIAL_DIMENSIONS.map((dim) => {
                const dimStat = scoreStats.dimensionScores[dim.key] || { total: 0, max: dim.items.length * 4, percentage: 0, average: 0 };
                return (
                  <div key={dim.key} className="border border-slate-300 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 uppercase">
                        {dim.number}. {dim.title}
                      </h4>
                      <span className="text-xs font-semibold text-blue-700">
                        Skor: {dimStat.total} / {dimStat.max} ({dimStat.percentage}%) - Rata-rata: {dimStat.average}
                      </span>
                    </div>
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="p-2 w-10 text-center font-bold text-slate-700">No</th>
                          <th className="p-2 font-bold text-slate-700">Indikator Kinerja &amp; Bukti Fisik</th>
                          <th className="p-2 w-16 text-center font-bold text-slate-700">Skala (1-4)</th>
                          <th className="p-2 w-48 font-bold text-slate-700">Deskripsi Capaian</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {dim.items.map((item) => {
                          const val = scores[item.id] || 0;
                          const rubricText = val > 0 ? item.rubrics[val as 1 | 2 | 3 | 4] : 'Belum dinilai';
                          return (
                            <tr key={item.id}>
                              <td className="p-2 text-center align-top font-semibold text-slate-500">{item.number}</td>
                              <td className="p-2 align-top">
                                <p className="font-semibold text-slate-900">{item.text}</p>
                                {item.evidenceGuidance && (
                                  <p className="text-[10px] text-slate-500 mt-0.5 italic">Bukti: {item.evidenceGuidance}</p>
                                )}
                              </td>
                              <td className="p-2 text-center align-top">
                                <span className="inline-block w-7 h-7 leading-7 rounded-md font-bold text-white bg-slate-800 text-center">
                                  {val || '-'}
                                </span>
                              </td>
                              <td className="p-2 align-top text-slate-700 text-[11px] leading-relaxed">
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
            <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h5 className="font-bold text-slate-900 mb-2">A. Catatan Temuan Lapangan Pengawas:</h5>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{catatanPengawas || 'Tidak ada catatan khusus.'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h5 className="font-bold text-slate-900 mb-2">B. Rekomendasi Tindak Lanjut Manajerial:</h5>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{rekomendasiManajerial || 'Pertahankan kinerja yang telah tercapai.'}</p>
              </div>
            </div>

            {/* Signature Block */}
            <div className="mt-10 pt-6 grid grid-cols-2 text-xs text-center border-t border-slate-200">
              <div>
                <p>Mengetahui / Memeriksa,</p>
                <p className="font-bold text-slate-900 mt-1">Kepala Sekolah Yang Disupervisi,</p>
                <div className="h-20"></div>
                <p className="font-bold underline text-slate-900">{principal.nama}</p>
                <p className="text-slate-600">NIP. {principal.nip}</p>
              </div>
              <div>
                <p>{settings.schoolCity || 'Kabupaten Sidenreng Rappang'}, {new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-bold text-slate-900 mt-1">Pengawas Sekolah Pembina,</p>
                <div className="h-20"></div>
                <p className="font-bold underline text-slate-900">{settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'}</p>
                <p className="text-slate-600">NIP. {settings.supervisorNip || '19820415 200801 1 007'}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Modal Top Header */}
            <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 via-slate-50 to-indigo-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">
                      Instrumen Supervisi Manajerial Kepala Sekolah
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-800 border border-purple-200">
                      8 Dimensi (Skala 1 - 4)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Sasaran: <span className="font-bold text-slate-800">{principal.nama}</span> ({principal.satuanPendidikan})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportWord}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Unduh format Microsoft Word (.doc) lengkap"
                >
                  <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Ekspor Word</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintMode(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Lihat Pratinjau Cetak / Simpan PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Format Cetak / PDF</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Live Score Strip & Metadata Bar */}
            <div className="px-5 py-3 bg-slate-900 text-white shrink-0 flex flex-wrap items-center justify-between gap-3 shadow-inner">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                {/* Tanggal */}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-slate-400">Tanggal:</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-slate-800 text-white px-2 py-1 rounded text-xs border border-slate-700 focus:outline-hidden focus:border-purple-400 font-semibold"
                  />
                </div>

                {/* Semester */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Semester:</span>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value as 'Ganjil' | 'Genap')}
                    className="bg-slate-800 text-white px-2 py-1 rounded text-xs border border-slate-700 focus:outline-hidden focus:border-purple-400 font-semibold"
                  >
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                  </select>
                </div>

                {/* TA */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Tahun Ajaran:</span>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="bg-slate-800 text-white w-24 px-2 py-1 rounded text-xs border border-slate-700 focus:outline-hidden focus:border-purple-400 font-semibold text-center"
                    placeholder="2026/2027"
                  />
                </div>
              </div>

              {/* Score Badges */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Progres:</span>
                  <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {scoreStats.answeredCount} / {TOTAL_MANAGERIAL_ITEMS}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Total Skor:</span>
                  <span className="text-xs font-bold text-purple-300">
                    {scoreStats.totalScore} / {MAX_MANAGERIAL_RAW_SCORE}
                  </span>
                </div>

                <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                  <span className="text-xs text-slate-400">Nilai Akhir:</span>
                  <span className="text-lg font-black text-amber-300 tabular-nums">
                    {scoreStats.finalScore}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      scoreStats.predicate === 'Amat Baik (A)'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : scoreStats.predicate === 'Baik (B)'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : scoreStats.predicate === 'Cukup (C)'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {scoreStats.predicate}
                  </span>
                </div>

                {/* Quick Fill Dropdown / Button */}
                <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-slate-700">
                  <button
                    type="button"
                    onClick={() => handleQuickFill(4)}
                    className="px-2 py-1 rounded bg-purple-700 hover:bg-purple-600 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Isi cepat dengan skor standar Amat Baik"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Contoh Cepat</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 8 Dimension Navigation Tabs */}
            <div className="bg-slate-100 border-b border-slate-200 px-4 pt-2 overflow-x-auto shrink-0 flex gap-1.5 scrollbar-thin">
              {MANAGERIAL_DIMENSIONS.map((dim, idx) => {
                const isActive = activeTabIdx === idx;
                const dimStat = scoreStats.dimensionScores[dim.key] || { total: 0, max: dim.items.length * 4, percentage: 0, average: 0 };
                const answeredInDim = dim.items.filter((item) => (scores[item.id] || 0) > 0).length;
                const isComplete = answeredInDim === dim.items.length;

                return (
                  <button
                    key={dim.key}
                    type="button"
                    onClick={() => setActiveTabIdx(idx)}
                    className={`px-3 py-2 rounded-t-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all border-t border-x cursor-pointer ${
                      isActive
                        ? 'bg-white text-purple-900 border-slate-200 shadow-xs translate-y-[1px]'
                        : 'bg-slate-200/70 hover:bg-slate-200 text-slate-600 border-transparent'
                    }`}
                  >
                    <span className={isActive ? 'text-purple-600' : 'text-slate-500'}>
                      {getDimensionIcon(dim.iconName)}
                    </span>
                    <span>{dim.number}. {dim.shortTitle}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                        isComplete
                          ? 'bg-emerald-100 text-emerald-800'
                          : answeredInDim > 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-300 text-slate-700'
                      }`}
                    >
                      {answeredInDim}/{dim.items.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Dimension Content Panel */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Dimension Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50/80 to-indigo-50/80 border border-purple-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    {getDimensionIcon(currentDimension.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                        Dimensi {currentDimension.number} dari 8
                      </span>
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                        {currentDimension.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {currentDimension.description}
                    </p>
                  </div>
                </div>

                {/* Dimension score quick badge */}
                <div className="shrink-0 flex items-center gap-3 bg-white px-3.5 py-2 rounded-lg border border-purple-200 shadow-2xs self-end sm:self-center">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Capaian Dimensi</p>
                    <p className="text-sm font-black text-purple-900 tabular-nums">
                      {scoreStats.dimensionScores[currentDimension.key]?.total || 0} / {currentDimension.items.length * 4}
                      <span className="text-xs text-slate-400 font-semibold ml-1">
                        ({scoreStats.dimensionScores[currentDimension.key]?.percentage || 0}%)
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Dimension Actions & Filter Bar */}
              <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Bulk Rating Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">
                    Beri Nilai Cepat Dimensi Ini:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleBulkSetDimension(1)}
                      className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 hover:border-rose-300 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      title="Atur semua indikator di dimensi ini ke Skala 1"
                    >
                      Skala 1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkSetDimension(2)}
                      className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-700 hover:border-amber-300 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      title="Atur semua indikator di dimensi ini ke Skala 2"
                    >
                      Skala 2
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkSetDimension(3)}
                      className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 hover:border-blue-300 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      title="Atur semua indikator di dimensi ini ke Skala 3"
                    >
                      Skala 3 (Standar)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkSetDimension(4)}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 hover:border-emerald-300 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      title="Atur semua indikator di dimensi ini ke Skala 4"
                    >
                      Skala 4 (Optimal)
                    </button>
                    <button
                      type="button"
                      onClick={handleResetDimension}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Kosongkan nilai dimensi ini"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Filter and Search */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Filter Status */}
                  <div className="inline-flex rounded-lg p-0.5 bg-slate-200/80 text-[11px] font-semibold text-slate-700">
                    <button
                      type="button"
                      onClick={() => setFilterStatus('all')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        filterStatus === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
                      }`}
                    >
                      Semua ({currentDimension.items.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus('unscored')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        filterStatus === 'unscored' ? 'bg-white text-amber-800 shadow-2xs font-bold' : 'hover:text-slate-900'
                      }`}
                    >
                      Belum ({currentDimension.items.filter(i => !(scores[i.id] > 0)).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus('scored')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        filterStatus === 'scored' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'hover:text-slate-900'
                      }`}
                    >
                      Sudah ({currentDimension.items.filter(i => (scores[i.id] > 0)).length})
                    </button>
                  </div>

                  {/* Search box */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari indikator..."
                      className="pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:border-purple-500 w-36 sm:w-44"
                    />
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-5">
                {displayedItems.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
                    <p className="text-sm font-semibold">Tidak ada indikator yang sesuai kriteria pencarian atau filter.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterStatus('all');
                        setSearchQuery('');
                      }}
                      className="mt-2 text-xs text-purple-600 hover:text-purple-800 font-bold underline cursor-pointer"
                    >
                      Reset Filter Pencarian
                    </button>
                  </div>
                ) : (
                  displayedItems.map((item) => {
                  const currentVal = scores[item.id] || 0;
                  const noteVal = itemNotes[item.id] || '';

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all duration-200 ${
                        currentVal > 0
                          ? 'bg-white border-slate-200 shadow-xs hover:border-purple-300'
                          : 'bg-slate-50/60 border-slate-200/90'
                      }`}
                    >
                      {/* Item Header */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 border mt-0.5 ${
                            currentVal > 0
                              ? 'bg-purple-600 text-white border-purple-700'
                              : 'bg-slate-200 text-slate-700 border-slate-300'
                          }`}
                        >
                          {item.number}
                        </div>
                        <div className="flex-1">
                          <h5 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                            {item.text}
                          </h5>
                          {item.evidenceGuidance && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                              <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span><strong className="text-slate-700">Panduan Bukti Fisik:</strong> {item.evidenceGuidance}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Likert Scale 1-4 Selector with Rich Rubric Descriptions */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100">
                        <p className="text-[11px] font-bold text-slate-600 mb-2">
                          Pilih Skala Capaian (1 – 4):
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                          {([1, 2, 3, 4] as const).map((level) => {
                            const isSelected = currentVal === level;
                            const levelConfig = {
                              1: {
                                label: '1 - Kurang / Belum Ada',
                                activeBg: 'bg-rose-600 text-white border-rose-700 shadow-sm',
                                idleHover: 'hover:border-rose-300 hover:bg-rose-50/50',
                                badge: 'bg-rose-100 text-rose-800'
                              },
                              2: {
                                label: '2 - Cukup / Sedang Berkembang',
                                activeBg: 'bg-amber-600 text-white border-amber-700 shadow-sm',
                                idleHover: 'hover:border-amber-300 hover:bg-amber-50/50',
                                badge: 'bg-amber-100 text-amber-800'
                              },
                              3: {
                                label: '3 - Baik / Terpenuhi Standar',
                                activeBg: 'bg-blue-600 text-white border-blue-700 shadow-sm',
                                idleHover: 'hover:border-blue-300 hover:bg-blue-50/50',
                                badge: 'bg-blue-100 text-blue-800'
                              },
                              4: {
                                label: '4 - Amat Baik / Sangat Lengkap',
                                activeBg: 'bg-emerald-600 text-white border-emerald-700 shadow-sm',
                                idleHover: 'hover:border-emerald-300 hover:bg-emerald-50/50',
                                badge: 'bg-emerald-100 text-emerald-800'
                              }
                            }[level];

                            return (
                              <button
                                key={level}
                                type="button"
                                onClick={() => {
                                  setScores((prev) => ({ ...prev, [item.id]: level }));
                                }}
                                className={`text-left p-2.5 rounded-xl border text-xs transition-all flex flex-col justify-between cursor-pointer ${
                                  isSelected
                                    ? levelConfig.activeBg
                                    : `bg-white border-slate-200 text-slate-700 ${levelConfig.idleHover}`
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1.5 font-bold">
                                  <span className="text-[11px] leading-tight">
                                    {levelConfig.label}
                                  </span>
                                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                                </div>
                                <p
                                  className={`text-[11px] leading-relaxed line-clamp-4 ${
                                    isSelected ? 'text-white/95' : 'text-slate-600'
                                  }`}
                                >
                                  {item.rubrics[level]}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Optional Note / Evidence for this item */}
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="text"
                          value={noteVal}
                          onChange={(e) => {
                            const val = e.target.value;
                            setItemNotes((prev) => ({ ...prev, [item.id]: val }));
                          }}
                          placeholder="Catatan verifikasi dokumen / bukti temuan (opsional)..."
                          className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-hidden focus:border-purple-400 placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  );
                }))}
              </div>

              {/* Navigation buttons between dimensions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  disabled={activeTabIdx === 0}
                  onClick={() => setActiveTabIdx((prev) => Math.max(0, prev - 1))}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTabIdx === 0
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Dimensi Sebelumnya</span>
                </button>

                <span className="text-xs font-semibold text-slate-500">
                  Halaman {activeTabIdx + 1} dari {MANAGERIAL_DIMENSIONS.length}
                </span>

                <button
                  type="button"
                  disabled={activeTabIdx === MANAGERIAL_DIMENSIONS.length - 1}
                  onClick={() => setActiveTabIdx((prev) => Math.min(MANAGERIAL_DIMENSIONS.length - 1, prev + 1))}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTabIdx === MANAGERIAL_DIMENSIONS.length - 1
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700 shadow-xs'
                  }`}
                >
                  <span>Dimensi Selanjutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Overall Findings & Recommendations Section */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Analisis Temuan &amp; Rekomendasi Supervisi Manajerial
                    </h4>
                    <p className="text-xs text-slate-500">
                      Catatan kualitatif pengawas dan arahan tindak lanjut pembinaan kepala sekolah
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateSmartRecommendation}
                    className="px-3 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold flex items-center gap-1.5 self-start sm:self-center transition-colors cursor-pointer border border-purple-200"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Rekomendasi Otomatis Berbasis Data</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Catatan Pengawas */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Catatan Temuan Lapangan Pengawas
                    </label>
                    <textarea
                      rows={4}
                      value={catatanPengawas}
                      onChange={(e) => setCatatanPengawas(e.target.value)}
                      placeholder="Uraikan temuan objektif mengenai kekuatan dan area perbaikan manajerial sekolah..."
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-purple-400 text-slate-800 leading-relaxed"
                    />
                  </div>

                  {/* Rekomendasi Manajerial */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Rekomendasi Tindak Lanjut Manajerial
                    </label>
                    <textarea
                      rows={4}
                      value={rekomendasiManajerial}
                      onChange={(e) => setRekomendasiManajerial(e.target.value)}
                      placeholder="Uraikan langkah konkret tindak lanjut yang harus dilaksanakan kepala sekolah..."
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-purple-400 text-slate-800 leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Footer Actions */}
            <div className="px-5 py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">
                  Tersimpan sebagai:{' '}
                  <strong className="text-slate-800">
                    {existingEvaluation ? 'Pembaruan Evaluasi' : 'Supervisi Baru'}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('draft')}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Draf</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('selesai')}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Supervisi Selesai</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
