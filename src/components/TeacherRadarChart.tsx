/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  Target,
  Sparkles,
  Award,
  TrendingUp,
  BookOpen,
  Compass,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { SupervisionRecord } from '../types/inspiro';

export interface TeacherRadarAxis {
  id: string;
  name: string;
  shortName: string;
  current: number; // 0 - 100
  target: number; // 100
  scoreFraction: string;
  description: string;
  evidence: string;
  category: 'amat_baik' | 'baik' | 'cukup' | 'perlu_bimbingan';
}

export interface TeacherRadarChartProps {
  supervision?: SupervisionRecord | null;
  teacherName?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLegend?: boolean;
  showBreakdown?: boolean;
  showRecommendations?: boolean;
}

export const calculateTeacherRadarData = (
  supervision?: SupervisionRecord | null
): {
  axes: TeacherRadarAxis[];
  overallScore: number;
  gapToIdeal: number;
  predicate: { text: string; color: string; badge: string };
  isSimulated: boolean;
} => {
  if (!supervision || !supervision.scores) {
    // Default baseline diagnostic if teacher has not been supervised yet
    const baselineAxes: TeacherRadarAxis[] = [
      {
        id: 'pra',
        name: 'Perencanaan & Pra-Observasi',
        shortName: 'Pra-Obs',
        current: 75,
        target: 100,
        scoreFraction: 'Belum Dinilai',
        description: 'Kesiapan perangkat ajar (TP/ATP, Modul Ajar, Asesmen Diagnostik)',
        evidence: 'Berkas pra-observasi belum terekam dalam siklus ini.',
        category: 'cukup'
      },
      {
        id: 'pendahuluan',
        name: 'Kegiatan Pendahuluan',
        shortName: 'Pendahuluan',
        current: 75,
        target: 100,
        scoreFraction: 'Belum Dinilai',
        description: 'Apersepsi bermakna, motivasi belajar, dan kesepakatan kelas (Indikator 1–3)',
        evidence: 'Observasi kelas belum dilaksanakan.',
        category: 'cukup'
      },
      {
        id: 'inti',
        name: 'Kegiatan Inti & Diferensiasi',
        shortName: 'Keg. Inti',
        current: 75,
        target: 100,
        scoreFraction: 'Belum Dinilai',
        description: 'Eksplorasi konsep, HOTS, pembelajaran berdiferensiasi (Indikator 4–9)',
        evidence: 'Observasi kelas belum dilaksanakan.',
        category: 'cukup'
      },
      {
        id: 'penutup',
        name: 'Kegiatan Penutup & Asesmen',
        shortName: 'Penutup',
        current: 75,
        target: 100,
        scoreFraction: 'Belum Dinilai',
        description: 'Refleksi bersama murid, kesimpulan terstruktur, asesmen formatif (Indikator 10–12)',
        evidence: 'Observasi kelas belum dilaksanakan.',
        category: 'cukup'
      },
      {
        id: 'rtl',
        name: 'Refleksi Pasca & RTL',
        shortName: 'Refleksi/RTL',
        current: 75,
        target: 100,
        scoreFraction: 'Belum Dinilai',
        description: 'Umpan balik dialogis, komitmen tindak lanjut, integrasi Kombel',
        evidence: 'Wawancara pasca-observasi belum terlaksana.',
        category: 'cukup'
      }
    ];

    return {
      axes: baselineAxes,
      overallScore: 75,
      gapToIdeal: 25,
      predicate: {
        text: 'Menunggu Pelaksanaan Supervisi',
        color: 'text-amber-500',
        badge: 'bg-amber-50 text-amber-700 border-amber-200'
      },
      isSimulated: true
    };
  }

  const scores = supervision.scores;

  // 1. Pra-Observasi & Perencanaan
  let praScore = 75;
  let praEvidence = 'Data pra-observasi belum lengkap.';
  if (supervision.praObservasi) {
    const p = supervision.praObservasi;
    let fieldsFilled = 0;
    if (p.tujuanPembelajaran?.trim().length > 5) fieldsFilled++;
    if (p.pemetaanKebutuhan?.trim().length > 5) fieldsFilled++;
    if (p.fokusPerilaku?.trim().length > 5) fieldsFilled++;
    if (p.modelMetode?.trim().length > 5) fieldsFilled++;
    if (p.mediaAlat?.trim().length > 5) fieldsFilled++;
    if (p.bentukAsesmen?.trim().length > 5) fieldsFilled++;

    praScore = Math.min(100, Math.round(65 + (fieldsFilled / 6) * 35));
    praEvidence = `${fieldsFilled}/6 komponen instrumen pra-observasi terisi lengkap & terencana.`;
  }

  // 2. Pendahuluan (Indikator 1 - 3, maks 12)
  const p1 = Number(scores[1] || 0);
  const p2 = Number(scores[2] || 0);
  const p3 = Number(scores[3] || 0);
  const pendTotal = p1 + p2 + p3;
  const pendScore = Math.min(100, Math.round((pendTotal / 12) * 100)) || 75;
  const pendEvidence = `Skor ${pendTotal}/12 (Rata-rata: ${(pendTotal / 3).toFixed(1)} dari skala 4).`;

  // 3. Kegiatan Inti (Indikator 4 - 9, maks 24)
  let intiTotal = 0;
  for (let i = 4; i <= 9; i++) {
    intiTotal += Number(scores[i] || 0);
  }
  const intiScore = Math.min(100, Math.round((intiTotal / 24) * 100)) || 75;
  const intiEvidence = `Skor ${intiTotal}/24 (Rata-rata: ${(intiTotal / 6).toFixed(1)} dari skala 4).`;

  // 4. Penutup (Indikator 10 - 12, maks 12)
  const pen10 = Number(scores[10] || 0);
  const pen11 = Number(scores[11] || 0);
  const pen12 = Number(scores[12] || 0);
  const penTotal = pen10 + pen11 + pen12;
  const penScore = Math.min(100, Math.round((penTotal / 12) * 100)) || 75;
  const penEvidence = `Skor ${penTotal}/12 (Rata-rata: ${(penTotal / 3).toFixed(1)} dari skala 4).`;

  // 5. Refleksi & RTL
  let rtlScore = 75;
  let rtlEvidence = 'RTL belum dijadwalkan.';
  if (supervision.refleksi && supervision.rtl) {
    const hasReflection = Boolean(supervision.refleksi.kesanPerasaan?.trim().length > 5);
    const rtlCount = supervision.rtl.length;
    let pts = 65;
    if (hasReflection) pts += 20;
    if (rtlCount > 0) pts += Math.min(15, rtlCount * 8);
    rtlScore = Math.min(100, pts);
    rtlEvidence = `${hasReflection ? 'Refleksi dialogis terekam' : 'Refleksi singkat'}, ${rtlCount} program RTL terdaftar.`;
  }

  const getCategory = (score: number): TeacherRadarAxis['category'] => {
    if (score >= 91) return 'amat_baik';
    if (score >= 81) return 'baik';
    if (score >= 71) return 'cukup';
    return 'perlu_bimbingan';
  };

  const axes: TeacherRadarAxis[] = [
    {
      id: 'pra',
      name: 'Perencanaan & Pra-Observasi',
      shortName: 'Pra-Obs',
      current: praScore,
      target: 100,
      scoreFraction: `${praScore}%`,
      description: 'Kesiapan perangkat ajar, kejelasan TP, dan kesepakatan fokus perilaku',
      evidence: praEvidence,
      category: getCategory(praScore)
    },
    {
      id: 'pendahuluan',
      name: 'Kegiatan Pendahuluan',
      shortName: 'Pendahuluan',
      current: pendScore,
      target: 100,
      scoreFraction: `${pendTotal}/12`,
      description: 'Apersepsi bermakna, motivasi belajar, dan kesepakatan kelas (Indikator 1–3)',
      evidence: pendEvidence,
      category: getCategory(pendScore)
    },
    {
      id: 'inti',
      name: 'Kegiatan Inti & Diferensiasi',
      shortName: 'Keg. Inti',
      current: intiScore,
      target: 100,
      scoreFraction: `${intiTotal}/24`,
      description: 'Eksplorasi konsep, HOTS, instruksi adaptif & diferensiasi (Indikator 4–9)',
      evidence: intiEvidence,
      category: getCategory(intiScore)
    },
    {
      id: 'penutup',
      name: 'Kegiatan Penutup & Asesmen',
      shortName: 'Penutup',
      current: penScore,
      target: 100,
      scoreFraction: `${penTotal}/12`,
      description: 'Refleksi bersama murid, simpulan bermakna, asesmen formatif (Indikator 10–12)',
      evidence: penEvidence,
      category: getCategory(penScore)
    },
    {
      id: 'rtl',
      name: 'Refleksi Dialogis & RTL',
      shortName: 'Refleksi/RTL',
      current: rtlScore,
      target: 100,
      scoreFraction: `${rtlScore}%`,
      description: 'Umpan balik pasca-observasi, komitmen RTL, tindak lanjut di Kombel',
      evidence: rtlEvidence,
      category: getCategory(rtlScore)
    }
  ];

  const sum = axes.reduce((acc, a) => acc + a.current, 0);
  const overallScore = Number((sum / axes.length).toFixed(1));
  const gapToIdeal = Number((100 - overallScore).toFixed(1));

  let predicate = {
    text: 'Amat Baik (Mendekati Paripurna)',
    color: 'text-emerald-700',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  };
  if (overallScore < 71) {
    predicate = {
      text: 'Perlu Pendampingan Khusus',
      color: 'text-rose-700',
      badge: 'bg-rose-50 text-rose-800 border-rose-200'
    };
  } else if (overallScore < 81) {
    predicate = {
      text: 'Cukup (Perlu Penguatan RTL)',
      color: 'text-amber-700',
      badge: 'bg-amber-50 text-amber-800 border-amber-200'
    };
  } else if (overallScore < 91) {
    predicate = {
      text: 'Baik (Menuju Paripurna 100%)',
      color: 'text-blue-700',
      badge: 'bg-blue-50 text-blue-800 border-blue-200'
    };
  }

  return {
    axes,
    overallScore,
    gapToIdeal,
    predicate,
    isSimulated: false
  };
};

export const TeacherRadarChart: React.FC<TeacherRadarChartProps> = ({
  supervision,
  teacherName,
  className = '',
  size = 'md',
  showLegend = true,
  showBreakdown = true,
  showRecommendations = true
}) => {
  const [activeHoverAxis, setActiveHoverAxis] = useState<TeacherRadarAxis | null>(null);

  const { axes, overallScore, gapToIdeal, predicate, isSimulated } = useMemo(
    () => calculateTeacherRadarData(supervision),
    [supervision]
  );

  // SVG Geometry Dimensions based on Size prop
  const config = useMemo(() => {
    if (size === 'sm') {
      return {
        viewBox: '0 0 220 200',
        cx: 110,
        cy: 100,
        radius: 46,
        labelOffset: 20,
        fontSize: '8',
        strokeWidth: 1.6,
        dotRadius: 3.5
      };
    }
    if (size === 'lg') {
      return {
        viewBox: '0 0 360 320',
        cx: 180,
        cy: 155,
        radius: 95,
        labelOffset: 32,
        fontSize: '10',
        strokeWidth: 2.5,
        dotRadius: 5.5
      };
    }
    // Default 'md'
    return {
      viewBox: '0 0 280 250',
      cx: 140,
      cy: 120,
      radius: 68,
      labelOffset: 25,
      fontSize: '8.5',
      strokeWidth: 2,
      dotRadius: 4.5
    };
  }, [size]);

  const numAxes = axes.length;
  const getAngle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / numAxes;

  // Concentric polygon grid levels
  const gridLevels = [0.25, 0.5, 0.75];

  // 100% Target Boundary Polygon (Cita-Cita Ideal)
  const targetPolygonPoints = useMemo(() => {
    return axes
      .map((_, i) => {
        const a = getAngle(i);
        const x = config.cx + config.radius * Math.cos(a);
        const y = config.cy + config.radius * Math.sin(a);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [axes, config]);

  // Actual Performance Polygon
  const currentPolygonPoints = useMemo(() => {
    return axes
      .map((d, i) => {
        const a = getAngle(i);
        const rVal = (d.current / 100) * config.radius;
        const x = config.cx + rVal * Math.cos(a);
        const y = config.cy + rVal * Math.sin(a);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [axes, config]);

  // Axis Labels with Anchor Alignments
  const axisLabels = useMemo(() => {
    return axes.map((d, i) => {
      const a = getAngle(i);
      const labelRadius = config.radius + config.labelOffset;
      const x = config.cx + labelRadius * Math.cos(a);
      const y = config.cy + labelRadius * Math.sin(a);
      let textAnchor: 'middle' | 'start' | 'end' = 'middle';
      if (Math.cos(a) > 0.3) textAnchor = 'start';
      else if (Math.cos(a) < -0.3) textAnchor = 'end';

      return {
        ...d,
        x,
        y: y + (i === 0 ? -3 : i === 2 || i === 3 ? 4 : 2),
        textAnchor
      };
    });
  }, [axes, config]);

  // Determine priority recommendation based on lowest dimension
  const lowestAxis = useMemo(() => {
    return [...axes].sort((a, b) => a.current - b.current)[0];
  }, [axes]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Banner / Indicator for Teacher */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 p-3.5 sm:p-4 rounded-xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-xs shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                Radar Profil Pedagogis: {teacherName || supervision?.identity.namaGuru || 'Guru'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${predicate.badge}`}>
                {predicate.text}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Capaian 5 dimensi observasi & refleksi Kurikulum Merdeka menuju target 100% paripurna
            </p>
          </div>
        </div>

        <div className="flex items-baseline gap-2 sm:text-right shrink-0">
          <div>
            <span className="text-2xl sm:text-3xl font-black text-blue-900 tabular-nums">
              {overallScore}%
            </span>
            <span className="text-xs text-slate-500 font-semibold ml-1">/ 100% Ideal</span>
          </div>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded border border-blue-200">
            Gap: -{gapToIdeal}%
          </span>
        </div>
      </div>

      {/* Main Grid: SVG Radar Chart + Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left Column: Radar Chart Graphic */}
        <div className="md:col-span-5 bg-gradient-to-b from-[#0b1736] via-[#0f214d] to-[#071126] p-4 rounded-2xl border border-indigo-950 shadow-md text-slate-100 flex flex-col items-center justify-between relative overflow-hidden">
          <div className="w-full flex items-center justify-between pb-1.5 border-b border-indigo-800/40 text-xs">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Diagram Radar Capaian</span>
            </span>
            <span className="text-[10px] text-slate-400">Target 100% Paripurna</span>
          </div>

          {/* SVG Viewport */}
          <div className="w-full flex justify-center py-2">
            <svg
              viewBox={config.viewBox}
              className="w-full max-w-[280px] h-auto overflow-visible select-none drop-shadow-md"
            >
              <defs>
                <linearGradient id="teacherRadarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.55" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.55" />
                </linearGradient>

                <filter id="teacherGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Concentric Grid Levels (25%, 50%, 75%) */}
              {gridLevels.map((lvl, idx) => {
                const pts = axes
                  .map((_, i) => {
                    const a = getAngle(i);
                    const x = config.cx + config.radius * lvl * Math.cos(a);
                    const y = config.cy + config.radius * lvl * Math.sin(a);
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
                    strokeDasharray="2.5,2.5"
                    opacity="0.45"
                  />
                );
              })}

              {/* Axis Spokes */}
              {axes.map((_, i) => {
                const a = getAngle(i);
                const x = config.cx + config.radius * Math.cos(a);
                const y = config.cy + config.radius * Math.sin(a);
                return (
                  <line
                    key={i}
                    x1={config.cx}
                    y1={config.cy}
                    x2={x}
                    y2={y}
                    stroke="#475569"
                    strokeWidth="0.8"
                    opacity="0.5"
                  />
                );
              })}

              {/* Outer 100% Boundary: Target Cita-Cita 100% */}
              <polygon
                points={targetPolygonPoints}
                fill="#38bdf8"
                fillOpacity="0.06"
                stroke="#38bdf8"
                strokeWidth="1.6"
                strokeDasharray="3,2.5"
                opacity="0.85"
              />

              {/* Actual Teacher Performance Polygon */}
              <polygon
                points={currentPolygonPoints}
                fill="url(#teacherRadarGrad)"
                stroke="#22d3ee"
                strokeWidth={config.strokeWidth}
                filter="url(#teacherGlow)"
              />

              {/* Vertex Dots */}
              {axes.map((d, i) => {
                const a = getAngle(i);
                const rVal = (d.current / 100) * config.radius;
                const x = config.cx + rVal * Math.cos(a);
                const y = config.cy + rVal * Math.sin(a);
                const isHovered = activeHoverAxis?.id === d.id;

                return (
                  <circle
                    key={d.id}
                    cx={x}
                    cy={y}
                    r={isHovered ? config.dotRadius + 2 : config.dotRadius}
                    fill={isHovered ? '#38bdf8' : '#ffffff'}
                    stroke="#0284c7"
                    strokeWidth="1.8"
                    className="transition-all cursor-pointer"
                    onMouseEnter={() => setActiveHoverAxis(d)}
                    onMouseLeave={() => setActiveHoverAxis(null)}
                  />
                );
              })}

              {/* Axis Labels */}
              {axisLabels.map((lbl) => {
                const isHovered = activeHoverAxis?.id === lbl.id;
                return (
                  <text
                    key={lbl.id}
                    x={lbl.x}
                    y={lbl.y}
                    textAnchor={lbl.textAnchor}
                    fontSize={config.fontSize}
                    fontWeight={isHovered ? '800' : '700'}
                    fill={isHovered ? '#38bdf8' : '#cbd5e1'}
                    className="font-sans tracking-tight transition-colors cursor-pointer"
                    onMouseEnter={() => setActiveHoverAxis(lbl)}
                    onMouseLeave={() => setActiveHoverAxis(null)}
                  >
                    {lbl.shortName} ({lbl.current}%)
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          {showLegend && (
            <div className="w-full pt-2 border-t border-indigo-800/40 flex items-center justify-around gap-2 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-cyan-400/40 border border-cyan-400 inline-block"></span>
                <span className="text-slate-200">Capaian Riil Guru</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 border-t-2 border-dashed border-sky-400 inline-block"></span>
                <span className="text-sky-300 font-semibold">Target 100% Paripurna</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: 5 Sumbu Rincian Capaian */}
        {showBreakdown && (
          <div className="md:col-span-7 space-y-2">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-600" />
                <span>Rincian Capaian 5 Sumbu Pedagogis</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {isSimulated ? 'Standar Diagnostik Awal' : 'Hasil Observasi Aktual'}
              </span>
            </div>

            <div className="space-y-2">
              {axes.map((axis, idx) => {
                const isHovered = activeHoverAxis?.id === axis.id;
                return (
                  <div
                    key={axis.id}
                    onMouseEnter={() => setActiveHoverAxis(axis)}
                    onMouseLeave={() => setActiveHoverAxis(null)}
                    className={`p-2.5 sm:p-3 rounded-xl border transition-all text-xs space-y-1.5 ${
                      isHovered
                        ? 'border-blue-400 bg-blue-50/70 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <span>{axis.name}</span>
                            <span className="text-[10px] font-semibold text-slate-500">
                              ({axis.scoreFraction})
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-500 leading-tight">
                            {axis.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-blue-700 tabular-nums">
                          {axis.current}%
                        </span>
                        <span className="text-[9.5px] text-slate-400 block">Gap: -{100 - axis.current}%</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-0.5">
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all"
                          style={{ width: `${axis.current}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 flex justify-between">
                        <span className="truncate max-w-[280px]">Bukti: {axis.evidence}</span>
                        <span className="font-semibold text-blue-800">Target: 100%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Strategic Coaching Recommendations for this Teacher */}
      {showRecommendations && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1.5 text-xs shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span>Fokus Pembinaan Pengawas untuk {teacherName || 'Guru Ini'}:</span>
          </div>
          <p className="text-[11px] text-amber-900 leading-relaxed">
            Sumbu yang membutuhkan akselerasi prioritas adalah{' '}
            <strong className="text-amber-950 font-bold underline">
              {lowestAxis.name} ({lowestAxis.current}%)
            </strong>
            . Disarankan melakukan pendampingan terfokus pada: {lowestAxis.description}. Integrasikan
            perbaikan ini ke dalam siklus belajar mingguan di Komunitas Belajar (Kombel).
          </p>
        </div>
      )}
    </div>
  );
};
