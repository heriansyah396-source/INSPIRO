/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Target,
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
  Info,
  X,
  Compass,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { SupervisionRecord, PMReport } from '../types/inspiro';

interface RadarChartWidgetProps {
  supervisions: SupervisionRecord[];
  pmReports?: PMReport[];
  className?: string;
}

interface RadarAxisData {
  id: string;
  name: string;
  shortName: string;
  current: number; // 0-100
  target: number; // 100
  description: string;
  evidence: string;
}

export const RadarChartWidget: React.FC<RadarChartWidgetProps> = ({
  supervisions,
  pmReports = [],
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeHoverAxis, setActiveHoverAxis] = useState<RadarAxisData | null>(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  // Compute 5 Strategic Educational Axes from Supervision & PM Data
  const radarData: RadarAxisData[] = useMemo(() => {
    const totalSups = supervisions.length;
    const completed = supervisions.filter((s) => s.status === 'selesai');
    const compCount = completed.length;

    // 1. Pra-Observasi (Kesiapan Perencanaan Modul & Asesmen Awal)
    let praCompleted = 0;
    supervisions.forEach((s) => {
      if (s.praObservasi && s.praObservasi.tujuanPembelajaran && s.praObservasi.tujuanPembelajaran.trim().length > 5) {
        praCompleted++;
      }
    });
    const praScore = totalSups > 0
      ? Math.round(Math.min(100, Math.max(65, (praCompleted / totalSups) * 100)))
      : 88;

    // 2. 12 Indikator (Pelaksanaan Pembelajaran Mendalam)
    let avgObs = 0;
    if (compCount > 0) {
      const sum = completed.reduce((acc, s) => acc + (s.finalScore || 0), 0);
      avgObs = Math.round(sum / compCount);
    } else {
      avgObs = 89;
    }
    const obsScore = Math.min(100, Math.max(60, avgObs));

    // 3. Refleksi Guru (Pasca-Observasi & Umpan Balik Dialogis)
    let pascaCompleted = 0;
    supervisions.forEach((s) => {
      if (s.refleksi && s.refleksi.kesanPerasaan && s.refleksi.kesanPerasaan.trim().length > 5) {
        pascaCompleted++;
      }
    });
    const refleksiScore = totalSups > 0
      ? Math.round(Math.min(100, Math.max(60, (pascaCompleted / totalSups) * 100)))
      : 87;

    // 4. RTL & Kombel (Tindak Lanjut Coaching & Komunitas Belajar)
    let rtlCompleted = 0;
    supervisions.forEach((s) => {
      if (s.rtl && s.rtl.length > 0) {
        rtlCompleted++;
      }
    });
    const rtlScore = totalSups > 0
      ? Math.round(Math.min(100, Math.max(55, (rtlCompleted / totalSups) * 100)))
      : 85;

    // 5. Mutu PM (Audit Pengelolaan Praktik Pedagogis Satuan Binaan)
    let pmScore = 91;
    if (pmReports.length > 0) {
      const sumPM = pmReports.reduce((acc, r) => acc + (r.totalScore || 0), 0);
      pmScore = Math.round(sumPM / pmReports.length);
    }

    return [
      {
        id: 'pra',
        name: 'Pra-Observasi',
        shortName: 'Pra-Obs',
        current: praScore,
        target: 100,
        description: 'Kesiapan perencanaan modul ajar, asesmen diagnostik, dan penentuan fokus perilaku',
        evidence: `${praCompleted} dari ${totalSups || 1} berkas pra-observasi terisi lengkap.`
      },
      {
        id: 'obs',
        name: '12 Indikator Observasi',
        shortName: '12 Indikator',
        current: obsScore,
        target: 100,
        description: 'Keterlaksanaan 12 indikator Kurikulum Merdeka (Pendahuluan, Kegiatan Inti, Penutup)',
        evidence: `Rata-rata skor observasi guru: ${obsScore}/100.`
      },
      {
        id: 'refleksi',
        name: 'Refleksi Dialogis Guru',
        shortName: 'Refleksi',
        current: refleksiScore,
        target: 100,
        description: 'Kualitas umpan balik konstruktif dan kedalaman refleksi pasca-observasi kelas',
        evidence: `${pascaCompleted} dari ${totalSups || 1} sesi refleksi mandiri terlaksana dialogis.`
      },
      {
        id: 'rtl',
        name: 'RTL & Komunitas Belajar',
        shortName: 'RTL/Kombel',
        current: rtlScore,
        target: 100,
        description: 'Rencana tindak lanjut terukur, coaching rekan sejawat, dan integrasi Kombel/PLC',
        evidence: `${rtlCompleted} guru telah memiliki tabel tindak lanjut dan pendampingan terjadwal.`
      },
      {
        id: 'pm',
        name: 'Mutu Pengelolaan PM',
        shortName: 'Mutu PM',
        current: pmScore,
        target: 100,
        description: 'Standar audit mutu pengelolaan praktik pedagogis di satuan pendidikan binaan',
        evidence: `${pmReports.length > 0 ? `${pmReports.length} laporan evaluasi PM terekam` : 'Standar audit rubrik 4 dimensi PM'}.`
      }
    ];
  }, [supervisions, pmReports]);

  // Overall index towards ideal (percentage)
  const overallIndex = useMemo(() => {
    const sum = radarData.reduce((acc, d) => acc + d.current, 0);
    return Number((sum / radarData.length).toFixed(1));
  }, [radarData]);

  const gapToIdeal = useMemo(() => {
    return Number((100 - overallIndex).toFixed(1));
  }, [overallIndex]);

  // Predicate label
  const predicate = useMemo(() => {
    if (overallIndex >= 91) return { text: 'Amat Baik (Mendekati Paripurna)', color: 'text-emerald-400', badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50' };
    if (overallIndex >= 81) return { text: 'Baik (Menuju Cita-Cita)', color: 'text-cyan-300', badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-600/50' };
    if (overallIndex >= 71) return { text: 'Cukup (Perlu Penguatan)', color: 'text-amber-300', badge: 'bg-amber-950/80 text-amber-300 border-amber-600/50' };
    return { text: 'Perlu Intervensi Pembinaan', color: 'text-rose-400', badge: 'bg-rose-950/80 text-rose-300 border-rose-600/50' };
  }, [overallIndex]);

  // Geometry for Mini Sidebar Radar Chart (Compact 240x210)
  const miniCx = 120;
  const miniCy = 100;
  const miniRadius = 48;
  const numAxes = radarData.length;
  const getAngle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / numAxes;

  const miniTargetPoints = useMemo(() => {
    return radarData
      .map((_, i) => {
        const a = getAngle(i);
        const x = miniCx + miniRadius * Math.cos(a);
        const y = miniCy + miniRadius * Math.sin(a);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [numAxes]);

  const miniCurrentPoints = useMemo(() => {
    return radarData
      .map((d, i) => {
        const a = getAngle(i);
        const rVal = (d.current / 100) * miniRadius;
        const x = miniCx + rVal * Math.cos(a);
        const y = miniCy + rVal * Math.sin(a);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [radarData, numAxes]);

  const miniAxisLabels = useMemo(() => {
    return radarData.map((d, i) => {
      const a = getAngle(i);
      const labelRadius = miniRadius + 22;
      const x = miniCx + labelRadius * Math.cos(a);
      const y = miniCy + labelRadius * Math.sin(a);
      let textAnchor: 'middle' | 'start' | 'end' = 'middle';
      if (Math.cos(a) > 0.3) textAnchor = 'start';
      else if (Math.cos(a) < -0.3) textAnchor = 'end';

      return {
        ...d,
        x,
        y: y + (i === 0 ? -2 : i === 2 || i === 3 ? 4 : 2),
        textAnchor
      };
    });
  }, [radarData]);

  // Geometry for Large Modal Radar Chart (High-Resolution 340x310)
  const modalCx = 170;
  const modalCy = 150;
  const modalRadius = 90;

  const modalTargetPoints = useMemo(() => {
    return radarData
      .map((_, i) => {
        const a = getAngle(i);
        const x = modalCx + modalRadius * Math.cos(a);
        const y = modalCy + modalRadius * Math.sin(a);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [numAxes]);

  const modalCurrentPoints = useMemo(() => {
    return radarData
      .map((d, i) => {
        const a = getAngle(i);
        const rVal = (d.current / 100) * modalRadius;
        const x = modalCx + rVal * Math.cos(a);
        const y = modalCy + rVal * Math.sin(a);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [radarData, numAxes]);

  const modalAxisLabels = useMemo(() => {
    return radarData.map((d, i) => {
      const a = getAngle(i);
      const labelRadius = modalRadius + 30;
      const x = modalCx + labelRadius * Math.cos(a);
      const y = modalCy + labelRadius * Math.sin(a);
      let textAnchor: 'middle' | 'start' | 'end' = 'middle';
      if (Math.cos(a) > 0.3) textAnchor = 'start';
      else if (Math.cos(a) < -0.3) textAnchor = 'end';

      return {
        ...d,
        x,
        y: y + (i === 0 ? -4 : i === 2 || i === 3 ? 5 : 2),
        textAnchor
      };
    });
  }, [radarData]);

  const gridLevels = [0.25, 0.5, 0.75];

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. COMPACT SIDEBAR WIDGET                                                 */}
      {/* ========================================================================= */}
      <div
        className={`mx-3 my-2 rounded-2xl bg-gradient-to-b from-[#0f1d43] via-[#0b1736] to-[#071026] border border-cyan-500/30 shadow-xl overflow-hidden text-slate-100 transition-all ${className}`}
      >
        {/* Header Bar */}
        <div className="px-3.5 py-2.5 bg-indigo-950/40 border-b border-indigo-800/30 flex items-center justify-between">
          <div
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 cursor-pointer group"
            title="Klik untuk membuka analisis visual radar penuh"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold text-white flex items-center gap-1.5 leading-tight group-hover:text-cyan-300 transition-colors">
                <span>Radar Menuju Ideal</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
              </div>
              <p className="text-[9.5px] text-cyan-200/80 font-medium">Cita-Cita Pengawas (100%)</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              title="Perbesar & Lihat Rincian Radar Capaian"
              className="p-1 text-cyan-300 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Sembunyikan grafik' : 'Tampilkan grafik'}
              className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsible Content */}
        {isExpanded && (
          <div className="p-3 space-y-2.5 animate-in fade-in duration-200">
            {/* Radar Chart SVG Viewport */}
            <div
              onClick={() => setIsModalOpen(true)}
              className="relative flex justify-center py-1 cursor-pointer group"
              title="Klik untuk melihat visualisasi radar ukuran penuh"
            >
              <svg
                viewBox="0 0 240 205"
                className="w-full max-w-[215px] h-auto overflow-visible select-none drop-shadow-md group-hover:scale-[1.02] transition-transform duration-200"
              >
                <defs>
                  <linearGradient id="miniRadarFill" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.30" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.45" />
                  </linearGradient>

                  <filter id="miniGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Concentric Grid Levels (25%, 50%, 75%) */}
                {gridLevels.map((lvl, idx) => {
                  const pts = radarData
                    .map((_, i) => {
                      const a = getAngle(i);
                      const x = miniCx + miniRadius * lvl * Math.cos(a);
                      const y = miniCy + miniRadius * lvl * Math.sin(a);
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(' ');
                  return (
                    <polygon
                      key={idx}
                      points={pts}
                      fill="none"
                      stroke="#475569"
                      strokeWidth="0.7"
                      strokeDasharray="2,2"
                      opacity="0.45"
                    />
                  );
                })}

                {/* Axis Spokes */}
                {radarData.map((_, i) => {
                  const a = getAngle(i);
                  const x = miniCx + miniRadius * Math.cos(a);
                  const y = miniCy + miniRadius * Math.sin(a);
                  return (
                    <line
                      key={i}
                      x1={miniCx}
                      y1={miniCy}
                      x2={x}
                      y2={y}
                      stroke="#475569"
                      strokeWidth="0.8"
                      opacity="0.5"
                    />
                  );
                })}

                {/* Target Cita-Cita 100% Boundary */}
                <polygon
                  points={miniTargetPoints}
                  fill="#38bdf8"
                  fillOpacity="0.04"
                  stroke="#38bdf8"
                  strokeWidth="1.2"
                  strokeDasharray="3,2"
                  opacity="0.85"
                />

                {/* Actual Performance Polygon */}
                <polygon
                  points={miniCurrentPoints}
                  fill="url(#miniRadarFill)"
                  stroke="#22d3ee"
                  strokeWidth="1.8"
                  filter="url(#miniGlow)"
                />

                {/* Vertex Dots */}
                {radarData.map((d, i) => {
                  const a = getAngle(i);
                  const rVal = (d.current / 100) * miniRadius;
                  const x = miniCx + rVal * Math.cos(a);
                  const y = miniCy + rVal * Math.sin(a);
                  return (
                    <circle
                      key={d.id}
                      cx={x}
                      cy={y}
                      r={3.5}
                      fill="#ffffff"
                      stroke="#0284c7"
                      strokeWidth="1.5"
                    />
                  );
                })}

                {/* Axis Labels */}
                {miniAxisLabels.map((lbl) => (
                  <text
                    key={lbl.id}
                    x={lbl.x}
                    y={lbl.y}
                    textAnchor={lbl.textAnchor}
                    fontSize="8"
                    fontWeight="700"
                    fill="#94a3b8"
                    className="font-sans tracking-tight"
                  >
                    {lbl.shortName} ({lbl.current}%)
                  </text>
                ))}
              </svg>
            </div>

            {/* Score & Index Summary */}
            <div className="p-2.5 rounded-xl bg-black/30 border border-indigo-900/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">Indeks Menuju Ideal:</span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${predicate.badge}`}>
                  {predicate.text}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-0.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-cyan-300 tabular-nums">{overallIndex}%</span>
                  <span className="text-[10px] text-slate-400 font-semibold">/ 100% Ideal</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold tabular-nums">
                  Selisih: -{gapToIdeal}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, overallIndex)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
                <span>Titik Riil Sekarang</span>
                <span className="text-cyan-300 font-semibold">Cita-Cita: 100% Paripurna</span>
              </div>
            </div>

            {/* Action Trigger Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full py-1.5 px-2 bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-indigo-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 border border-cyan-500/30 hover:border-cyan-400/60 rounded-xl text-[10.5px] font-bold text-cyan-200 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Buka Visualisasi Layar Penuh</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-cyan-300" />
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. FULL-SCREEN MODAL PORTAL (RENDERED VIA REACT PORTAL TO DOCUMENT.BODY)  */}
      {/* This ensures the modal is centered on the entire viewport and never       */}
      {/* trapped inside the sidebar's CSS transform container!                    */}
      {/* ========================================================================= */}
      {isModalOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 lg:p-6 overflow-y-auto animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsModalOpen(false);
            }}
          >
            <div
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden w-full max-w-4xl text-slate-900 animate-in zoom-in-95 duration-200 my-auto max-h-[92vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0c1c4f] via-[#16275f] to-[#0f1d43] text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20">
                    <Compass className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                      <span>Visualisasi Radar Pencapaian Menuju Ideal</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-400/30">
                        Cita-Cita 100%
                      </span>
                    </h3>
                    <p className="text-xs text-blue-200/80">
                      Panduan Evaluasi & Pembimbingan Pengawas Sekolah Berbasis Bukti Nyata Supervisi
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="Tutup dialog (Esc)"
                  aria-label="Tutup dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs">
                {/* Overall Score Status Banner */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider block">
                      Indeks Rata-rata Ketercapaian Menuju Ideal
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-black text-blue-950 tabular-nums">{overallIndex}%</span>
                      <span className="text-xs text-slate-600 font-semibold">dari target ideal 100%</span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-1">
                      Kategori Predikat: <strong className="text-blue-900 font-bold">{predicate.text}</strong>.
                      Tersisa selisih gap <strong>{gapToIdeal}%</strong> menuju standar ideal paripurna.
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <span className="text-xs font-extrabold bg-blue-600 text-white px-3.5 py-1.5 rounded-xl shadow-xs">
                      Target: 100% Paripurna
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Standar Kurikulum Merdeka</span>
                  </div>
                </div>

                {/* Main Visual Presentation: Left Large Radar SVG + Right 5 Axes Details */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Left Column: Big Interactive Radar Chart (5 Cols) */}
                  <div className="lg:col-span-6 bg-gradient-to-b from-[#0a142e] via-[#0f1d43] to-[#081024] p-4 rounded-2xl border border-indigo-900/60 shadow-md text-slate-100 flex flex-col items-center justify-between">
                    <div className="w-full flex items-center justify-between pb-2 border-b border-indigo-800/40">
                      <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs">
                        <TrendingUp className="w-4 h-4" />
                        <span>Grafik Radar 5 Dimensi</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Skala 0 – 100%</span>
                    </div>

                    {/* High-Resolution SVG Canvas */}
                    <div className="w-full flex justify-center py-2">
                      <svg
                        viewBox="0 0 340 310"
                        className="w-full max-w-[320px] h-auto overflow-visible select-none drop-shadow-lg"
                      >
                        <defs>
                          <linearGradient id="modalRadarFill" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.55" />
                            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.40" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.55" />
                          </linearGradient>

                          <filter id="modalGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                          </filter>
                        </defs>

                        {/* Concentric Grid Levels (25%, 50%, 75%) */}
                        {gridLevels.map((lvl, idx) => {
                          const pts = radarData
                            .map((_, i) => {
                              const a = getAngle(i);
                              const x = modalCx + modalRadius * lvl * Math.cos(a);
                              const y = modalCy + modalRadius * lvl * Math.sin(a);
                              return `${x.toFixed(1)},${y.toFixed(1)}`;
                            })
                            .join(' ');
                          return (
                            <polygon
                              key={idx}
                              points={pts}
                              fill="none"
                              stroke="#475569"
                              strokeWidth="0.8"
                              strokeDasharray="3,3"
                              opacity="0.5"
                            />
                          );
                        })}

                        {/* Axis Spokes */}
                        {radarData.map((_, i) => {
                          const a = getAngle(i);
                          const x = modalCx + modalRadius * Math.cos(a);
                          const y = modalCy + modalRadius * Math.sin(a);
                          return (
                            <line
                              key={i}
                              x1={modalCx}
                              y1={modalCy}
                              x2={x}
                              y2={y}
                              stroke="#475569"
                              strokeWidth="1"
                              opacity="0.5"
                            />
                          );
                        })}

                        {/* Target Cita-Cita 100% Boundary */}
                        <polygon
                          points={modalTargetPoints}
                          fill="#38bdf8"
                          fillOpacity="0.06"
                          stroke="#38bdf8"
                          strokeWidth="1.8"
                          strokeDasharray="4,3"
                          opacity="0.9"
                        />

                        {/* Actual Performance Polygon */}
                        <polygon
                          points={modalCurrentPoints}
                          fill="url(#modalRadarFill)"
                          stroke="#22d3ee"
                          strokeWidth="2.5"
                          filter="url(#modalGlow)"
                        />

                        {/* Vertex Dots with Hover Trigger */}
                        {radarData.map((d, i) => {
                          const a = getAngle(i);
                          const rVal = (d.current / 100) * modalRadius;
                          const x = modalCx + rVal * Math.cos(a);
                          const y = modalCy + rVal * Math.sin(a);
                          const isHovered = activeHoverAxis?.id === d.id;

                          return (
                            <g
                              key={d.id}
                              onMouseEnter={() => setActiveHoverAxis(d)}
                              onMouseLeave={() => setActiveHoverAxis(null)}
                              className="cursor-pointer"
                            >
                              <circle
                                cx={x}
                                cy={y}
                                r={isHovered ? 7 : 4.5}
                                fill={isHovered ? '#38bdf8' : '#ffffff'}
                                stroke="#0284c7"
                                strokeWidth="2"
                                className="transition-all duration-150"
                              />
                            </g>
                          );
                        })}

                        {/* Axis Labels */}
                        {modalAxisLabels.map((lbl) => {
                          const isHovered = activeHoverAxis?.id === lbl.id;
                          return (
                            <text
                              key={lbl.id}
                              x={lbl.x}
                              y={lbl.y}
                              textAnchor={lbl.textAnchor}
                              fontSize="9.5"
                              fontWeight={isHovered ? '800' : '700'}
                              fill={isHovered ? '#38bdf8' : '#cbd5e1'}
                              className="font-sans tracking-tight transition-colors duration-150 cursor-pointer"
                              onMouseEnter={() => setActiveHoverAxis(lbl)}
                              onMouseLeave={() => setActiveHoverAxis(null)}
                            >
                              {lbl.name} ({lbl.current}%)
                            </text>
                          );
                        })}
                      </svg>
                    </div>

                    {/* Legend */}
                    <div className="w-full pt-3 border-t border-indigo-800/40 flex flex-wrap items-center justify-around gap-2 text-[10.5px]">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded bg-cyan-400/40 border border-cyan-400 inline-block"></span>
                        <span className="text-slate-200">Capaian Riil Aktual</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-0.5 border-t-2 border-dashed border-sky-400 inline-block"></span>
                        <span className="text-sky-300 font-semibold">Cita-Cita 100% Ideal</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: 5 Sumbu Rincian Capaian (6 Cols) */}
                  <div className="lg:col-span-6 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span>Rincian 5 Sumbu Kinerja Pedagogis:</span>
                      </h4>
                      <span className="text-[10px] text-slate-500 font-medium">Berdasarkan Bukti Nyata</span>
                    </div>

                    <div className="space-y-2">
                      {radarData.map((axis, idx) => {
                        const isHovered = activeHoverAxis?.id === axis.id;
                        return (
                          <div
                            key={axis.id}
                            onMouseEnter={() => setActiveHoverAxis(axis)}
                            onMouseLeave={() => setActiveHoverAxis(null)}
                            className={`p-3 rounded-xl border transition-all space-y-1.5 cursor-pointer ${
                              isHovered
                                ? 'border-blue-500 bg-blue-50/60 shadow-xs ring-1 ring-blue-400/40'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <div>
                                  <span className="font-bold text-slate-900 text-xs">{axis.name}</span>
                                  <span className="text-slate-500 text-[10.5px] block leading-tight">
                                    {axis.description}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-sm font-black text-blue-700 tabular-nums">
                                  {axis.current}%
                                </span>
                                <span className="text-[9.5px] text-slate-400 block">Target: 100%</span>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1 pt-0.5">
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 rounded-full transition-all duration-300"
                                  style={{ width: `${axis.current}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-500">
                                <span className="truncate max-w-[240px]">Bukti: {axis.evidence}</span>
                                <span className="font-semibold text-blue-800 shrink-0">
                                  Gap: -{(100 - axis.current).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Rekomendasi Khusus Pembinaan Pengawas Sekolah */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Langkah Strategis Pengawas Sekolah Menuju Capaian 100% Paripurna:</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px] text-amber-950/90 leading-relaxed pt-1">
                    <div className="p-2.5 rounded-lg bg-amber-100/60 border border-amber-200/80">
                      <strong className="block text-amber-900 font-bold mb-0.5">
                        1. Pendampingan Berkelanjutan
                      </strong>
                      Prioritaskan guru dengan capaian observasi &lt;80% melalui coaching reflektif non-judgmental pasca-observasi.
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-100/60 border border-amber-200/80">
                      <strong className="block text-amber-900 font-bold mb-0.5">
                        2. Optimalisasi Kombel (PLC)
                      </strong>
                      Integrasikan rencana tindak lanjut (RTL) ke agenda mingguan Komunitas Belajar sekolah agar terukur dan tuntas.
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-100/60 border border-amber-200/80">
                      <strong className="block text-amber-900 font-bold mb-0.5">
                        3. Praktik Baik & Apresiasi
                      </strong>
                      Dorong guru berpredikat Amat Baik menjadi narasumber sebaya untuk strategi diferensiasi dan asesmen formatif.
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Dihitung otomatis dari rekam jejak berkas supervisi akademik & evaluasi PM</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer hover:shadow"
                >
                  Tutup Pratinjau
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
