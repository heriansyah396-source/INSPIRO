/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  BookOpenCheck,
  CheckCircle2,
  Clock,
  Printer,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Search,
  Sparkles,
  School,
  Award,
  ChevronRight,
  TrendingUp,
  FileText,
  AlertCircle,
  HelpCircle,
  Save,
  RotateCcw,
  X,
  ShieldCheck,
  Users
} from 'lucide-react';
import {
  PMReport,
  PM_RUBRICS,
  PMLevel,
  SupervisionRecord,
  AppSettings
} from '../types/inspiro';
import { UserRoleProfile } from '../services/firebase';

interface PMManagementViewProps {
  pmReports: PMReport[];
  supervisions: SupervisionRecord[];
  settings: AppSettings;
  currentUser: UserRoleProfile | null;
  onSavePMReport: (report: PMReport) => void;
  onDeletePMReport: (id: string) => void;
  showToast: (title: string, desc?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const PMManagementView: React.FC<PMManagementViewProps> = ({
  pmReports,
  supervisions,
  settings,
  currentUser,
  onSavePMReport,
  onDeletePMReport,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [selectedReportForView, setSelectedReportForView] = useState<PMReport | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isNewReport, setIsNewReport] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);

  // Form State for Create/Edit
  const [activeFormReport, setActiveFormReport] = useState<PMReport | null>(null);

  // Available unique schools from settings and existing supervisions
  const availableSchools = useMemo(() => {
    const set = new Set<string>();
    if (settings.schoolName) set.add(settings.schoolName);
    supervisions.forEach((s) => {
      if (s.identity.satuanPendidikan) set.add(s.identity.satuanPendidikan);
    });
    pmReports.forEach((r) => {
      if (r.schoolName) set.add(r.schoolName);
    });
    return Array.from(set);
  }, [settings.schoolName, supervisions, pmReports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return pmReports.filter((r) => {
      const matchSearch =
        r.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.assessorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.academicYear && r.academicYear.includes(searchTerm));
      const matchSchool = schoolFilter === 'all' || r.schoolName === schoolFilter;
      return matchSearch && matchSchool;
    });
  }, [pmReports, searchTerm, schoolFilter]);

  // Helper to open create form
  const handleOpenCreate = () => {
    try {
      const isSupervisor =
        currentUser?.role === 'pengawas' ||
        (Boolean(settings?.supervisorRole) && settings.supervisorRole.toLowerCase().includes('pengawas'));

      const defaultSchool =
        currentUser?.schoolName ||
        settings?.schoolName ||
        (availableSchools.length > 0 ? availableSchools[0] : 'SMP Negeri 1 Merdeka Nusantara');

      const defaultAssessorName =
        currentUser?.name ||
        settings?.supervisorName ||
        'Heriansyah., S.Si., S.Pd., M.Pd';

      const defaultAssessorNip =
        currentUser?.nip ||
        settings?.supervisorNip ||
        '19820415 200801 1 007';

      const defaultHeadmasterName = isSupervisor
        ? (settings?.schoolName && settings?.supervisorRole && settings.supervisorRole.toLowerCase().includes('kepala')
            ? settings.supervisorName
            : 'Dra. Hj. Nurhasanah, M.Pd.')
        : (currentUser?.name || settings?.supervisorName || 'Kepala Satuan Pendidikan');

      const defaultHeadmasterNip = isSupervisor
        ? '19720815 199802 2 003'
        : (currentUser?.nip || settings?.supervisorNip || '-');

      const newReport: PMReport = {
        id: `pm-${Date.now()}`,
        schoolName: defaultSchool,
        semester: 'Ganjil',
        academicYear: '2026/2027',
        assessorName: defaultAssessorName,
        assessorRole: isSupervisor ? 'Pengawas Sekolah' : 'Kepala Sekolah',
        assessorNip: defaultAssessorNip,
        headmasterName: defaultHeadmasterName,
        headmasterNip: defaultHeadmasterNip,
        evalDate: new Date().toISOString().split('T')[0],
        dimension1: {
          score: 25,
          level: 'sangat_baik',
          notes: PM_RUBRICS[0]?.criteria?.sangat_baik?.text || '',
          evidenceNotes: 'Tahapan pra-observasi, observasi 12 indikator, dan refleksi pasca terlaksana terstruktur.'
        },
        dimension2: {
          score: 25,
          level: 'sangat_baik',
          notes: PM_RUBRICS[1]?.criteria?.sangat_baik?.text || '',
          evidenceNotes: 'Data penilaian obyektif dan mencakup bukti konkret perilaku murid di kelas.'
        },
        dimension3: {
          score: 25,
          level: 'sangat_baik',
          notes: PM_RUBRICS[2]?.criteria?.sangat_baik?.text || '',
          evidenceNotes: 'Umpan balik disampaikan secara dialogis dan mendorong kemandirian refleksi guru.'
        },
        dimension4: {
          score: 25,
          level: 'sangat_baik',
          notes: PM_RUBRICS[3]?.criteria?.sangat_baik?.text || '',
          evidenceNotes: 'Tindak lanjut terintegrasi dengan jadwal Komunitas Belajar (PLC/Kombel) sekolah.'
        },
        totalScore: 100,
        predicate: 'Amat Baik (A)',
        generalNotes: 'Praktik pedagogis di sekolah berjalan efektif dengan konsistensi tahapan supervisi yang tinggi.',
        recommendation: 'Lanjutkan penguatan budaya reflektif dan pemanfaatan platform pembelajaran digital.',
        interventionPlan: 'Pendampingan berkelanjutan melalui Komunitas Belajar antar-guru dan coaching berkala.',
        status: 'final',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setActiveFormReport(newReport);
      setIsNewReport(true);
      setIsEditing(true);
      setSelectedReportForView(null);
      setIsDetailOpen(false);
      setIsPrintMode(false);
    } catch (err) {
      console.error('Error opening PM creation form:', err);
      showToast('Gagal Membuka Form', 'Terjadi kendala saat menyiapkan formulir evaluasi PM.', 'error');
    }
  };

  const handleOpenEdit = (report: PMReport) => {
    setActiveFormReport({ ...report });
    setIsNewReport(false);
    setIsEditing(true);
    setSelectedReportForView(null);
    setIsDetailOpen(false);
    setIsPrintMode(false);
  };

  const handleOpenDetail = (report: PMReport) => {
    setSelectedReportForView(report);
    setIsDetailOpen(true);
    setIsEditing(false);
    setIsPrintMode(false);
  };

  const handleOpenPrint = (report: PMReport) => {
    setSelectedReportForView(report);
    setIsEditing(false);
    setIsDetailOpen(false);
    setIsPrintMode(true);
  };

  // Auto-analysis helper based on actual supervision data
  const handleAutoAnalyze = (targetSchool: string) => {
    if (!activeFormReport) return;
    const cleanTarget = (targetSchool || '').trim().toLowerCase();

    let schoolSupervisions = supervisions.filter((s) => {
      const sSchool = (s.identity?.satuanPendidikan || '').trim().toLowerCase();
      return cleanTarget ? sSchool === cleanTarget || !sSchool : true;
    });

    if (schoolSupervisions.length === 0 && supervisions.length > 0) {
      schoolSupervisions = supervisions;
    }

    if (schoolSupervisions.length === 0) {
      showToast('Data Belum Cukup', `Belum ada data supervisi akademik yang tercatat untuk ${targetSchool || 'sekolah ini'}.`, 'warning');
      return;
    }

    // Dimension 1: Check stages completeness (pra, obs, pasca)
    let hasPra = 0;
    let hasObs = 0;
    let hasPasca = 0;
    let hasRtl = 0;

    schoolSupervisions.forEach((s) => {
      if (s.praObservasi && s.praObservasi.tujuanPembelajaran) hasPra++;
      if (Object.keys(s.scores || {}).length >= 10) hasObs++;
      if (s.refleksi && s.refleksi.kesanPerasaan) hasPasca++;
      if (s.rtl && s.rtl.length > 0) hasRtl++;
    });

    const ratioPra = hasPra / schoolSupervisions.length;
    const ratioPasca = hasPasca / schoolSupervisions.length;
    const ratioRtl = hasRtl / schoolSupervisions.length;

    // Determine Dimension 1 (Kelengkapan Tahapan)
    let d1Score = 25;
    let d1Level: PMLevel = 'sangat_baik';
    if (ratioPra >= 0.8 && ratioPasca >= 0.8) {
      d1Score = 25;
      d1Level = 'sangat_baik';
    } else if (ratioPra >= 0.5 && ratioPasca >= 0.5) {
      d1Score = 18.75;
      d1Level = 'baik';
    } else if (ratioPasca >= 0.3) {
      d1Score = 12.5;
      d1Level = 'cukup';
    } else {
      d1Score = 6.25;
      d1Level = 'kurang';
    }

    // Determine Dimension 2 (Kualitas Data & Bukti Observasi)
    let d2Score = 25;
    let d2Level: PMLevel = 'sangat_baik';
    let notesCount = 0;
    schoolSupervisions.forEach((s) => {
      Object.values(s.notes || {}).forEach((n) => {
        if (n && n.trim().length > 10) notesCount++;
      });
    });

    if (notesCount >= schoolSupervisions.length * 4) {
      d2Score = 25;
      d2Level = 'sangat_baik';
    } else if (notesCount >= schoolSupervisions.length * 2) {
      d2Score = 18.75;
      d2Level = 'baik';
    } else {
      d2Score = 12.5;
      d2Level = 'cukup';
    }

    // Determine Dimension 3 (Kualitas Umpan Balik & Refleksi)
    let d3Score = ratioPasca >= 0.8 ? 25 : ratioPasca >= 0.5 ? 18.75 : 12.5;
    let d3Level: PMLevel = d3Score === 25 ? 'sangat_baik' : d3Score === 18.75 ? 'baik' : 'cukup';

    // Determine Dimension 4 (Tindak Lanjut Supervisi)
    let d4Score = ratioRtl >= 0.8 ? 25 : ratioRtl >= 0.5 ? 18.75 : 12.5;
    let d4Level: PMLevel = d4Score === 25 ? 'sangat_baik' : d4Score === 18.75 ? 'baik' : 'cukup';

    const calculatedTotal = Number((d1Score + d2Score + d3Score + d4Score).toFixed(1));
    const pred =
      calculatedTotal >= 91
        ? 'Amat Baik (A)'
        : calculatedTotal >= 76
        ? 'Baik (B)'
        : calculatedTotal >= 61
        ? 'Cukup (C)'
        : 'Kurang (K)';

    setActiveFormReport((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        schoolName: targetSchool,
        dimension1: {
          score: d1Score,
          level: d1Level,
          notes: PM_RUBRICS[0].criteria[d1Level].text,
          evidenceNotes: `Analisis otomatis dari ${schoolSupervisions.length} data guru: ${(ratioPra * 100).toFixed(0)}% sesi pra-observasi, ${(ratioPasca * 100).toFixed(0)}% refleksi lengkap.`
        },
        dimension2: {
          score: d2Score,
          level: d2Level,
          notes: PM_RUBRICS[1].criteria[d2Level].text,
          evidenceNotes: `Terdata ${notesCount} catatan deskriptif perilaku murid pada 12 indikator observasi.`
        },
        dimension3: {
          score: d3Score,
          level: d3Level,
          notes: PM_RUBRICS[2].criteria[d3Level].text,
          evidenceNotes: `Kualitas refleksi guru pasca-observasi di ${targetSchool} terdokumentasi dengan baik.`
        },
        dimension4: {
          score: d4Score,
          level: d4Level,
          notes: PM_RUBRICS[3].criteria[d4Level].text,
          evidenceNotes: `Terdokumentasi ${(ratioRtl * 100).toFixed(0)}% tabel RTL guru yang siap ditindaklanjuti dalam Komunitas Belajar (PLC).`
        },
        totalScore: calculatedTotal,
        predicate: pred
      };
    });

    showToast(
      'Analisis Otomatis Berhasil',
      `Nilai dikalkulasi dari ${schoolSupervisions.length} berkas supervisi nyata di ${targetSchool} (Skor: ${calculatedTotal}).`,
      'success'
    );
  };

  // Update dimension in form
  const handleUpdateDimension = (dimKey: 'dimension1' | 'dimension2' | 'dimension3' | 'dimension4', level: PMLevel) => {
    if (!activeFormReport) return;
    const dimIdx = dimKey === 'dimension1' ? 0 : dimKey === 'dimension2' ? 1 : dimKey === 'dimension3' ? 2 : 3;
    const rubric = PM_RUBRICS[dimIdx];
    const crit = rubric.criteria[level];

    const updated = {
      ...activeFormReport,
      [dimKey]: {
        ...activeFormReport[dimKey],
        score: crit.points,
        level,
        notes: crit.text
      }
    };

    const total = Number(
      (
        (dimKey === 'dimension1' ? crit.points : activeFormReport.dimension1.score) +
        (dimKey === 'dimension2' ? crit.points : activeFormReport.dimension2.score) +
        (dimKey === 'dimension3' ? crit.points : activeFormReport.dimension3.score) +
        (dimKey === 'dimension4' ? crit.points : activeFormReport.dimension4.score)
      ).toFixed(1)
    );

    const pred =
      total >= 91 ? 'Amat Baik (A)' : total >= 76 ? 'Baik (B)' : total >= 61 ? 'Cukup (C)' : 'Kurang (K)';

    updated.totalScore = total;
    updated.predicate = pred;
    setActiveFormReport(updated);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFormReport) return;
    onSavePMReport(activeFormReport);
    setIsEditing(false);
    setSelectedReportForView(activeFormReport);
    showToast('Laporan PM Disimpan', `Laporan Pengelolaan PM untuk ${activeFormReport.schoolName} berhasil disimpan.`, 'success');
  };

  // If in Print Preview Mode
  if (isPrintMode && selectedReportForView) {
    return (
      <div className="space-y-6">
        {/* Print toolbar - hidden on print */}
        <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPrintMode(false)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Tutup Pratinjau Cetak</span>
            </button>
            <span className="text-xs text-slate-500 font-medium">
              Format Dokumen Resmi Kedinasan A4 · Pengelolaan Praktik Pedagogis (PM)
            </span>
          </div>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>

        {/* Printable Document Sheet (A4 Format) */}
        <div className="print-page bg-white p-8 sm:p-12 rounded-xl shadow-lg border border-slate-200 max-w-4xl mx-auto text-slate-900 leading-relaxed font-serif">
          {/* Official Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider">
              PEMERINTAH DAERAH DINAS PENDIDIKAN KABUPATEN / KOTA
            </h3>
            <h2 className="text-base font-extrabold uppercase mt-0.5">
              KOORDINATOR PENGAWAS SEKOLAH JENJANG PENDIDIKAN DASAR & MENENGAH
            </h2>
            <p className="text-xs mt-1 font-sans text-slate-600">
              Sekretariat Pembina Sekolah Binaan Kurikulum Merdeka · Tahun Ajaran {selectedReportForView.academicYear}
            </p>
          </div>

          <div className="text-center my-4">
            <h1 className="text-base font-black underline uppercase tracking-wide">
              LAPORAN EVALUASI PENGELOLAAN PRAKTIK PEDAGOGIS (PM) DI SEKOLAH
            </h1>
            <p className="text-xs font-sans text-slate-600 mt-1">
              Nomor: 421.2 / PM-SUP / {selectedReportForView.id.replace('pm-', '').slice(0, 6)} / 2026
            </p>
          </div>

          {/* School & Assessor Identity */}
          <div className="my-5 p-4 rounded-lg bg-slate-50 border border-slate-200 font-sans text-xs grid grid-cols-2 gap-x-6 gap-y-2">
            <div>
              <span className="text-slate-500 block">Satuan Pendidikan Binaan:</span>
              <strong className="text-slate-900 text-sm">{selectedReportForView.schoolName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Tanggal Penilaian / Evaluasi:</span>
              <strong className="text-slate-900">{selectedReportForView.evalDate}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Nama Kepala Sekolah:</span>
              <strong className="text-slate-900">{selectedReportForView.headmasterName}</strong>
              <span className="text-slate-500 block text-[11px]">NIP: {selectedReportForView.headmasterNip}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Evaluator / Penilai:</span>
              <strong className="text-slate-900">{selectedReportForView.assessorName}</strong>
              <span className="text-slate-500 block text-[11px]">{selectedReportForView.assessorRole} (NIP: {selectedReportForView.assessorNip})</span>
            </div>
          </div>

          {/* 4 Rubric Dimensions Evaluation Table */}
          <div className="my-6 font-sans">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              A. PENILAIAN 4 DIMENSI PENGELOLAAN PRAKTIK PEDAGOGIS (PM)
            </h4>
            <table className="w-full text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="border border-slate-300 p-2 text-center w-10">No</th>
                  <th className="border border-slate-300 p-2 text-left">Dimensi Evaluasi Mutu PM</th>
                  <th className="border border-slate-300 p-2 text-center w-24">Skor (Maks 25)</th>
                  <th className="border border-slate-300 p-2 text-left">Deskripsi Capaian & Bukti Nyata</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-2 text-center font-bold">1</td>
                  <td className="border border-slate-300 p-2 font-semibold">
                    Kelengkapan Tahapan Supervisi
                    <span className="block text-[11px] text-slate-500 font-normal mt-0.5">
                      Mencakup pra-observasi, observasi 12 indikator, dan pasca/refleksi secara runtut dan konsisten.
                    </span>
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-extrabold text-sm tabular-nums">
                    {selectedReportForView.dimension1.score}
                  </td>
                  <td className="border border-slate-300 p-2 text-[11px]">
                    <div className="font-semibold text-slate-800">{selectedReportForView.dimension1.notes}</div>
                    <div className="text-slate-500 italic mt-0.5">Bukti: {selectedReportForView.dimension1.evidenceNotes}</div>
                  </td>
                </tr>

                <tr>
                  <td className="border border-slate-300 p-2 text-center font-bold">2</td>
                  <td className="border border-slate-300 p-2 font-semibold">
                    Kualitas Data dan Bukti Observasi
                    <span className="block text-[11px] text-slate-500 font-normal mt-0.5">
                      Data sangat lengkap, objektif, berbasis indikator PM, dan menunjukkan praktik nyata di kelas.
                    </span>
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-extrabold text-sm tabular-nums">
                    {selectedReportForView.dimension2.score}
                  </td>
                  <td className="border border-slate-300 p-2 text-[11px]">
                    <div className="font-semibold text-slate-800">{selectedReportForView.dimension2.notes}</div>
                    <div className="text-slate-500 italic mt-0.5">Bukti: {selectedReportForView.dimension2.evidenceNotes}</div>
                  </td>
                </tr>

                <tr>
                  <td className="border border-slate-300 p-2 text-center font-bold">3</td>
                  <td className="border border-slate-300 p-2 font-semibold">
                    Kualitas Umpan Balik dan Refleksi
                    <span className="block text-[11px] text-slate-500 font-normal mt-0.5">
                      Umpan balik berbasis data, konstruktif, mendorong refleksi guru, dan berorientasi perbaikan.
                    </span>
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-extrabold text-sm tabular-nums">
                    {selectedReportForView.dimension3.score}
                  </td>
                  <td className="border border-slate-300 p-2 text-[11px]">
                    <div className="font-semibold text-slate-800">{selectedReportForView.dimension3.notes}</div>
                    <div className="text-slate-500 italic mt-0.5">Bukti: {selectedReportForView.dimension3.evidenceNotes}</div>
                  </td>
                </tr>

                <tr>
                  <td className="border border-slate-300 p-2 text-center font-bold">4</td>
                  <td className="border border-slate-300 p-2 font-semibold">
                    Tindak Lanjut Supervisi
                    <span className="block text-[11px] text-slate-500 font-normal mt-0.5">
                      Tindak lanjut jelas, spesifik, berkelanjutan (coaching, PLC, perbaikan pembelajaran), dan terukur.
                    </span>
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-extrabold text-sm tabular-nums">
                    {selectedReportForView.dimension4.score}
                  </td>
                  <td className="border border-slate-300 p-2 text-[11px]">
                    <div className="font-semibold text-slate-800">{selectedReportForView.dimension4.notes}</div>
                    <div className="text-slate-500 italic mt-0.5">Bukti: {selectedReportForView.dimension4.evidenceNotes}</div>
                  </td>
                </tr>

                {/* Total Row */}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={2} className="border border-slate-300 p-2.5 text-right uppercase">
                    Total Nilai Kinerja Pengelolaan PM (Skala 100):
                  </td>
                  <td className="border border-slate-300 p-2.5 text-center text-base text-blue-900 font-black">
                    {selectedReportForView.totalScore}
                  </td>
                  <td className="border border-slate-300 p-2.5 text-slate-900 font-bold">
                    Predikat: {selectedReportForView.predicate}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Analysis & Recommendations */}
          <div className="my-5 font-sans text-xs space-y-3">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider">
              B. KESIMPULAN & TINDAK LANJUT PEMBINAAN PENGAWAS
            </h4>
            <div className="p-3 border border-slate-200 rounded-lg">
              <strong className="text-slate-800 block mb-1">Analisis Kekuatan & Capaian:</strong>
              <p className="text-slate-700 leading-relaxed">{selectedReportForView.generalNotes}</p>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg">
              <strong className="text-slate-800 block mb-1">Rekomendasi Peningkatan Mutu Pedagogis:</strong>
              <p className="text-slate-700 leading-relaxed">{selectedReportForView.recommendation}</p>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg">
              <strong className="text-slate-800 block mb-1">Rencana Intervensi / Pendampingan (Coaching & PLC):</strong>
              <p className="text-slate-700 leading-relaxed">{selectedReportForView.interventionPlan}</p>
            </div>
          </div>

          {/* Signatures Block */}
          <div className="mt-10 font-sans text-xs grid grid-cols-2 gap-8 text-center pt-4">
            <div>
              <p className="text-slate-600">Mengetahui,</p>
              <p className="font-bold text-slate-800">Kepala Satuan Pendidikan Binaan</p>
              <div className="h-20" />
              <p className="font-bold underline text-slate-900">{selectedReportForView.headmasterName}</p>
              <p className="text-slate-600 text-[11px]">NIP. {selectedReportForView.headmasterNip}</p>
            </div>
            <div>
              <p className="text-slate-600">Ditetapkan pada: {selectedReportForView.evalDate}</p>
              <p className="font-bold text-slate-800">Pengawas Sekolah Pembina</p>
              <div className="h-20" />
              <p className="font-bold underline text-slate-900">{selectedReportForView.assessorName}</p>
              <p className="text-slate-600 text-[11px]">NIP. {selectedReportForView.assessorNip}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner: Laporan Pengelolaan PM di Sekolah (Praktik Pedagogis) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0d1e4c] via-[#152a6d] to-[#122254] rounded-2xl p-6 sm:p-7 text-white shadow-xl border border-indigo-400/20 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 max-w-2xl z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-400/20 text-cyan-200 border border-cyan-400/30">
              Audit & Penilaian Mutu Supervisi
            </span>
            <span className="text-xs text-blue-200 font-medium">Standar Praktik Pedagogis (PM)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <span>Laporan Pengelolaan PM di Sekolah</span>
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            Instrumen evaluasi kualitas pelaksanaan supervisi akademik berbasis 4 pilar standar:
            <strong> Kelengkapan Tahapan (25 pts)</strong>, <strong>Kualitas Data & Bukti Observasi (25 pts)</strong>,
            <strong> Kualitas Umpan Balik & Refleksi (25 pts)</strong>, dan <strong>Tindak Lanjut Berkelanjutan (25 pts)</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 z-10">
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Buat Evaluasi PM Baru</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Cards (4 Dimensions Status) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {PM_RUBRICS.map((rubric) => (
          <div
            key={rubric.id}
            className="bg-white p-4.5 rounded-2xl border border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Dimensi {rubric.number} · 25 Poin
              </span>
              <BookOpenCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-3">
              <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">{rubric.title}</h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {rubric.description}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600 font-medium">
              <span>Bobot: 25% Mutu PM</span>
              <span className="text-emerald-700 font-bold">Terintegrasi</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Form Modal Dialog (High Visibility Overlay) */}
      {isEditing && activeFormReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
          <form
            onSubmit={handleSaveForm}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden w-full max-w-4xl my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95"
          >
            {/* Modal Header (Sticky) */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-blue-50/50 to-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/25">
                  <BookOpenCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isNewReport ? 'Formulir Penilaian Pengelolaan PM Baru' : 'Edit Laporan Pengelolaan PM'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rubrik Penilaian 4 Dimensi Praktik Pedagogis (Maksimal 100 Poin)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAutoAnalyze(activeFormReport.schoolName)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="Kalkulasi otomatis dari rekam jejak berkas supervisi nyata di sekolah binaan"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analisis Otomatis dari Data Nyata</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-6">
              {/* Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Satuan Pendidikan Binaan *</label>
                    {availableSchools.length > 0 && (
                      <span className="text-[10px] text-blue-600 font-semibold">{availableSchools.length} Pilihan</span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      list="school-suggestions"
                      value={activeFormReport.schoolName}
                      onChange={(e) => setActiveFormReport({ ...activeFormReport, schoolName: e.target.value })}
                      placeholder="Pilih atau ketik nama sekolah..."
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                    <datalist id="school-suggestions">
                      {availableSchools.map((sch) => (
                        <option key={sch} value={sch} />
                      ))}
                    </datalist>
                    {availableSchools.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {availableSchools.map((sch) => (
                          <button
                            type="button"
                            key={sch}
                            onClick={() => setActiveFormReport({ ...activeFormReport, schoolName: sch })}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all cursor-pointer ${
                              activeFormReport.schoolName === sch
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            {sch}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tahun Ajaran & Semester</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={activeFormReport.academicYear}
                      onChange={(e) => setActiveFormReport({ ...activeFormReport, academicYear: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                      placeholder="2026/2027"
                    />
                    <select
                      value={activeFormReport.semester}
                      onChange={(e) => setActiveFormReport({ ...activeFormReport, semester: e.target.value })}
                      className="w-full px-2 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                    >
                      <option value="Ganjil">Ganjil</option>
                      <option value="Genap">Genap</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Evaluasi</label>
                  <input
                    type="date"
                    value={activeFormReport.evalDate}
                    onChange={(e) => setActiveFormReport({ ...activeFormReport, evalDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Evaluator (Pengawas)</label>
                  <input
                    type="text"
                    value={activeFormReport.assessorName}
                    onChange={(e) => setActiveFormReport({ ...activeFormReport, assessorName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Kepala Sekolah Binaan</label>
                  <input
                    type="text"
                    value={activeFormReport.headmasterName}
                    onChange={(e) => setActiveFormReport({ ...activeFormReport, headmasterName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-100/60 border border-blue-200">
                  <div>
                    <span className="text-[10px] text-blue-800 font-bold uppercase tracking-wider block">Total Skor Sementara:</span>
                    <span className="text-2xl font-black text-blue-950 tabular-nums">{activeFormReport.totalScore}</span>
                    <span className="text-xs text-blue-800 font-semibold ml-1">/ 100</span>
                  </div>
                  <span className="text-xs font-extrabold bg-blue-600 text-white px-2.5 py-1 rounded-md">
                    {activeFormReport.predicate}
                  </span>
                </div>
              </div>

              {/* 4 Rubric Dimensions Assessment */}
              <div className="space-y-5">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Penilaian Rinci Berdasarkan 4 Indikator Mutu PM:
                </h4>

                {/* Dimension 1 */}
                <div className="p-4.5 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                        <span>Kelengkapan Tahapan Supervisi (Bobot 25 pts)</span>
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Laporan mencakup seluruh tahapan (pra, observasi, pasca) secara lengkap, runtut, dan konsisten
                      </p>
                    </div>
                    <span className="text-sm font-black text-blue-700 tabular-nums">
                      {activeFormReport.dimension1.score} pts
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {(['sangat_baik', 'baik', 'cukup', 'kurang'] as PMLevel[]).map((lvl) => {
                      const c = PM_RUBRICS[0].criteria[lvl];
                      const isSelected = activeFormReport.dimension1.level === lvl;
                      return (
                        <button
                          type="button"
                          key={lvl}
                          onClick={() => handleUpdateDimension('dimension1', lvl)}
                          className={`p-2.5 rounded-xl text-left border transition-all text-xs cursor-pointer ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-500/20'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <strong className="capitalize font-bold text-[11px]">{lvl.replace('_', ' ')}</strong>
                            <span className="font-extrabold tabular-nums">{c.points} pts</span>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-3 leading-snug">{c.text}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Catatan Bukti & Deskripsi Tahapan:</label>
                    <input
                      type="text"
                      value={activeFormReport.dimension1.evidenceNotes}
                      onChange={(e) =>
                        setActiveFormReport({
                          ...activeFormReport,
                          dimension1: { ...activeFormReport.dimension1, evidenceNotes: e.target.value }
                        })
                      }
                      placeholder="Contoh: Seluruh 8 sesi pra-observasi dan refleksi pasca terlaksana terstruktur."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Dimension 2 */}
                <div className="p-4.5 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
                        <span>Kualitas Data dan Bukti Observasi (Bobot 25 pts)</span>
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Data sangat lengkap, objektif, berbasis indikator PM, dan menunjukkan praktik nyata di kelas
                      </p>
                    </div>
                    <span className="text-sm font-black text-blue-700 tabular-nums">
                      {activeFormReport.dimension2.score} pts
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {(['sangat_baik', 'baik', 'cukup', 'kurang'] as PMLevel[]).map((lvl) => {
                      const c = PM_RUBRICS[1].criteria[lvl];
                      const isSelected = activeFormReport.dimension2.level === lvl;
                      return (
                        <button
                          type="button"
                          key={lvl}
                          onClick={() => handleUpdateDimension('dimension2', lvl)}
                          className={`p-2.5 rounded-xl text-left border transition-all text-xs cursor-pointer ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-500/20'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <strong className="capitalize font-bold text-[11px]">{lvl.replace('_', ' ')}</strong>
                            <span className="font-extrabold tabular-nums">{c.points} pts</span>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-3 leading-snug">{c.text}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Catatan Bukti Perilaku Nyata di Kelas:</label>
                    <input
                      type="text"
                      value={activeFormReport.dimension2.evidenceNotes}
                      onChange={(e) =>
                        setActiveFormReport({
                          ...activeFormReport,
                          dimension2: { ...activeFormReport.dimension2, evidenceNotes: e.target.value }
                        })
                      }
                      placeholder="Contoh: Bukti konkret perilaku diferensiasi proses dan catatan respon murid."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Dimension 3 */}
                <div className="p-4.5 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3</span>
                        <span>Kualitas Umpan Balik dan Refleksi (Bobot 25 pts)</span>
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Umpan balik berbasis data, konstruktif, mendorong refleksi guru, dan berorientasi perbaikan
                      </p>
                    </div>
                    <span className="text-sm font-black text-blue-700 tabular-nums">
                      {activeFormReport.dimension3.score} pts
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {(['sangat_baik', 'baik', 'cukup', 'kurang'] as PMLevel[]).map((lvl) => {
                      const c = PM_RUBRICS[2].criteria[lvl];
                      const isSelected = activeFormReport.dimension3.level === lvl;
                      return (
                        <button
                          type="button"
                          key={lvl}
                          onClick={() => handleUpdateDimension('dimension3', lvl)}
                          className={`p-2.5 rounded-xl text-left border transition-all text-xs cursor-pointer ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-500/20'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <strong className="capitalize font-bold text-[11px]">{lvl.replace('_', ' ')}</strong>
                            <span className="font-extrabold tabular-nums">{c.points} pts</span>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-3 leading-snug">{c.text}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Catatan Dinamika Refleksi & Umpan Balik:</label>
                    <input
                      type="text"
                      value={activeFormReport.dimension3.evidenceNotes}
                      onChange={(e) =>
                        setActiveFormReport({
                          ...activeFormReport,
                          dimension3: { ...activeFormReport.dimension3, evidenceNotes: e.target.value }
                        })
                      }
                      placeholder="Contoh: Sesi wawancara pasca-observasi berlangsung dialogis dengan umpan balik terstruktur."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Dimension 4 */}
                <div className="p-4.5 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">4</span>
                        <span>Tindak Lanjut Supervisi (Bobot 25 pts)</span>
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Tindak lanjut jelas, spesifik, berkelanjutan (coaching, PLC, perbaikan pembelajaran), dan terukur
                      </p>
                    </div>
                    <span className="text-sm font-black text-blue-700 tabular-nums">
                      {activeFormReport.dimension4.score} pts
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {(['sangat_baik', 'baik', 'cukup', 'kurang'] as PMLevel[]).map((lvl) => {
                      const c = PM_RUBRICS[3].criteria[lvl];
                      const isSelected = activeFormReport.dimension4.level === lvl;
                      return (
                        <button
                          type="button"
                          key={lvl}
                          onClick={() => handleUpdateDimension('dimension4', lvl)}
                          className={`p-2.5 rounded-xl text-left border transition-all text-xs cursor-pointer ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-500/20'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <strong className="capitalize font-bold text-[11px]">{lvl.replace('_', ' ')}</strong>
                            <span className="font-extrabold tabular-nums">{c.points} pts</span>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-3 leading-snug">{c.text}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Catatan RTL, Coaching & Komunitas Belajar (PLC):</label>
                    <input
                      type="text"
                      value={activeFormReport.dimension4.evidenceNotes}
                      onChange={(e) =>
                        setActiveFormReport({
                          ...activeFormReport,
                          dimension4: { ...activeFormReport.dimension4, evidenceNotes: e.target.value }
                        })
                      }
                      placeholder="Contoh: Tindak lanjut terjadwal dalam Komunitas Belajar (Kombel) sekolah dengan target waktu 3 pekan."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Recommendations & Intervention Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kesimpulan Kekuatan Praktik Pedagogis:</label>
                  <textarea
                    rows={3}
                    value={activeFormReport.generalNotes}
                    onChange={(e) => setActiveFormReport({ ...activeFormReport, generalNotes: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rekomendasi Peningkatan Mutu:</label>
                  <textarea
                    rows={3}
                    value={activeFormReport.recommendation}
                    onChange={(e) => setActiveFormReport({ ...activeFormReport, recommendation: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rencana Intervensi / Coaching / PLC:</label>
                  <textarea
                    rows={3}
                    value={activeFormReport.interventionPlan}
                    onChange={(e) => setActiveFormReport({ ...activeFormReport, interventionPlan: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Modal Sticky Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-600 font-medium">
                Total Skor: <strong className="text-blue-900 text-sm font-black">{activeFormReport.totalScore} / 100</strong>{' '}
                <span className="text-slate-400">({activeFormReport.predicate})</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Laporan Evaluasi PM</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpenCheck className="w-4.5 h-4.5 text-blue-600" />
              <span>Daftar Laporan Evaluasi Pengelolaan PM di Sekolah Binaan</span>
            </h3>
            <p className="text-xs text-slate-500">
              Rekapitulasi penilaian mutu praktik pedagogis dan tindak lanjut supervisi akademik
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-600 font-semibold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              Total Laporan: <span className="font-bold text-blue-700 tabular-nums">{filteredReports.length}</span>
            </div>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Buat Evaluasi PM Baru</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-slate-100">
          <div className="relative sm:col-span-8">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama sekolah binaan, evaluator, atau tahun ajaran..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
            >
              <option value="all">Semua Sekolah Binaan</option>
              {availableSchools.map((sch) => (
                <option key={sch} value={sch}>
                  {sch}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <BookOpenCheck className="w-12 h-12 mx-auto text-slate-300" />
            <div className="text-sm font-bold text-slate-700">Belum Ada Laporan Pengelolaan PM</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Klik tombol &ldquo;Buat Evaluasi PM Baru&rdquo; untuk memulai penilaian 4 dimensi praktik pedagogis di sekolah binaan Anda.
            </p>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Laporan Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Sekolah Binaan</th>
                  <th className="py-3 px-4 font-bold text-center">D1: Tahapan (25)</th>
                  <th className="py-3 px-4 font-bold text-center">D2: Data Bukti (25)</th>
                  <th className="py-3 px-4 font-bold text-center">D3: Refleksi (25)</th>
                  <th className="py-3 px-4 font-bold text-center">D4: RTL & PLC (25)</th>
                  <th className="py-3 px-4 font-bold text-center">Total Skor</th>
                  <th className="py-3 px-4 font-bold">Predikat Mutu</th>
                  <th className="py-3 px-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <School className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{report.schoolName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Evaluator: {report.assessorName} · {report.evalDate}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center tabular-nums font-bold text-slate-700">
                      {report.dimension1.score}
                    </td>

                    <td className="py-3.5 px-4 text-center tabular-nums font-bold text-slate-700">
                      {report.dimension2.score}
                    </td>

                    <td className="py-3.5 px-4 text-center tabular-nums font-bold text-slate-700">
                      {report.dimension3.score}
                    </td>

                    <td className="py-3.5 px-4 text-center tabular-nums font-bold text-slate-700">
                      {report.dimension4.score}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="text-sm font-black text-blue-700 tabular-nums">
                        {report.totalScore}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-normal">/ 100</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                          report.predicate.includes('Amat Baik')
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : report.predicate.includes('Baik')
                            ? 'bg-blue-50 text-blue-800 border border-blue-300'
                            : 'bg-amber-50 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {report.predicate}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenPrint(report)}
                          title="Cetak Berkas Laporan PM Resmi"
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(report)}
                          title="Edit Penilaian PM"
                          className="p-1.5 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus laporan evaluasi PM untuk ${report.schoolName}?`)) {
                              onDeletePMReport(report.id);
                              showToast('Laporan Dihapus', 'Data laporan PM berhasil dihapus.', 'info');
                            }
                          }}
                          title="Hapus Laporan"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
