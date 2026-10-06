/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { IndicatorDefinition, OBSERVATION_INDICATORS } from '../../types/inspiro';

interface Step3ObservationProps {
  scores: Record<number, number>;
  notes: Record<number, string>;
  onScoreChange: (indicatorId: number, score: number) => void;
  onNoteChange: (indicatorId: number, note: string) => void;
}

export const Step3Observation: React.FC<Step3ObservationProps> = ({
  scores,
  notes,
  onScoreChange,
  onNoteChange
}) => {
  const [expandedRubricId, setExpandedRubricId] = useState<number | null>(null);

  // Group indicators by sections
  const sections = [
    {
      key: 'pendahuluan',
      title: 'A. Kegiatan Pendahuluan',
      subtitle: 'Pengondisian, asesmen awal kognitif/non-kognitif, dan penyampaian alur pembelajaran',
      items: OBSERVATION_INDICATORS.filter((i) => i.section === 'pendahuluan')
    },
    {
      key: 'inti',
      title: 'B. Kegiatan Inti',
      subtitle: 'Penguasaan materi, diferensiasi, HOTS & 4C, media digital, disiplin positif, dan KSE',
      items: OBSERVATION_INDICATORS.filter((i) => i.section === 'inti')
    },
    {
      key: 'penutup',
      title: 'C. Kegiatan Penutup',
      subtitle: 'Refleksi bersama murid, asesmen formatif akhir sesi, dan umpan balik tindak lanjut',
      items: OBSERVATION_INDICATORS.filter((i) => i.section === 'penutup')
    }
  ];

  const ratedCount = Object.keys(scores).filter((k) => (scores[Number(k)] || 0) > 0).length;

  const toggleRubric = (id: number) => {
    setExpandedRubricId(expandedRubricId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Tracker Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Instrumen Observasi 12 Indikator</span>
            <span
              className={`text-xs px-2 py-0.5 rounded font-semibold ${
                ratedCount === 12
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {ratedCount} / 12 Indikator Dinilai
            </span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Berikan skor 1 sampai 4 serta tuliskan fakta objektif yang teramati secara langsung di kelas.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> 1: Kurang
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> 2: Cukup
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> 3: Baik
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> 4: Sangat Baik
          </span>
        </div>
      </div>

      {/* Indicator Sections */}
      {sections.map((section) => (
        <div key={section.key} className="space-y-4">
          <div className="pb-1 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">{section.title}</h3>
            <p className="text-xs text-slate-500">{section.subtitle}</p>
          </div>

          <div className="space-y-4">
            {section.items.map((indicator) => (
              <IndicatorCard
                key={indicator.id}
                indicator={indicator}
                currentScore={scores[indicator.id] || 0}
                currentNote={notes[indicator.id] || ''}
                isRubricExpanded={expandedRubricId === indicator.id}
                onToggleRubric={() => toggleRubric(indicator.id)}
                onScoreChange={(s) => onScoreChange(indicator.id, s)}
                onNoteChange={(n) => onNoteChange(indicator.id, n)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

interface IndicatorCardProps {
  indicator: IndicatorDefinition;
  currentScore: number;
  currentNote: string;
  isRubricExpanded: boolean;
  onToggleRubric: () => void;
  onScoreChange: (score: number) => void;
  onNoteChange: (note: string) => void;
}

const IndicatorCard: React.FC<IndicatorCardProps> = ({
  indicator,
  currentScore,
  currentNote,
  isRubricExpanded,
  onToggleRubric,
  onScoreChange,
  onNoteChange
}) => {
  const isRated = currentScore > 0;

  const scoreOptions = [
    {
      value: 1,
      label: 'Kurang',
      subtext: 'Belum nampak / lemah',
      activeClass: 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-200',
      idleClass: 'hover:bg-rose-50 text-slate-700 hover:text-rose-700 hover:border-rose-300'
    },
    {
      value: 2,
      label: 'Cukup',
      subtext: 'Nampak sebagian / pasif',
      activeClass: 'bg-amber-600 text-white border-amber-600 shadow-xs ring-2 ring-amber-200',
      idleClass: 'hover:bg-amber-50 text-slate-700 hover:text-amber-700 hover:border-amber-300'
    },
    {
      value: 3,
      label: 'Baik',
      subtext: 'Konsisten & terarah',
      activeClass: 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-200',
      idleClass: 'hover:bg-blue-50 text-slate-700 hover:text-blue-700 hover:border-blue-300'
    },
    {
      value: 4,
      label: 'Sangat Baik',
      subtext: 'Inspiratif & mandiri',
      activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-200',
      idleClass: 'hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 hover:border-emerald-300'
    }
  ];

  return (
    <div
      className={`bg-white rounded-xl border transition-all ${
        isRated
          ? 'border-slate-200 shadow-2xs'
          : 'border-dashed border-amber-300/80 bg-amber-50/20 shadow-2xs'
      }`}
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div
            className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
              isRated
                ? 'bg-blue-600 text-white'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {indicator.number}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 font-mono">
                Indikator {indicator.number}
              </span>
              {isRated ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Skor {currentScore}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600">
                  <AlertCircle className="w-3 h-3" />
                  <span>Wajib Dinilai</span>
                </span>
              )}
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
              {indicator.title}
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {indicator.description}
            </p>
          </div>
        </div>

        {/* Toggle Rubric Button */}
        <button
          type="button"
          onClick={onToggleRubric}
          className="shrink-0 text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start p-1 rounded hover:bg-blue-50 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{isRubricExpanded ? 'Tutup Rubrik' : 'Lihat Rubrik 1–4'}</span>
          {isRubricExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Rubric Guide */}
      {isRubricExpanded && (
        <div className="p-4 bg-slate-50/80 border-b border-slate-100 text-xs">
          <div className="font-bold text-slate-800 mb-2.5">
            Panduan Rubrik Penilaian Indikator {indicator.number}:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {([1, 2, 3, 4] as const).map((lvl) => (
              <div
                key={lvl}
                className={`p-2.5 rounded-lg border text-[11px] transition-all cursor-pointer ${
                  currentScore === lvl
                    ? 'border-blue-400 bg-blue-50/70 text-blue-950 font-medium'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => onScoreChange(lvl)}
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <span>Skor {lvl}</span>
                  <span className="text-[10px] uppercase font-semibold">
                    {lvl === 4 ? 'Sangat Baik' : lvl === 3 ? 'Baik' : lvl === 2 ? 'Cukup' : 'Kurang'}
                  </span>
                </div>
                <p className="leading-relaxed">{indicator.rubric[lvl]}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Score Rating Selector & Notes */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Score pills */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Pilih Skor Penilaian (1–4):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {scoreOptions.map((opt) => {
              const isSelected = currentScore === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onScoreChange(opt.value)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? opt.activeClass
                      : `bg-white border-slate-200 ${opt.idleClass}`
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-base tabular-nums">{opt.value}</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-black/20 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {opt.label}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] mt-1.5 leading-snug line-clamp-1 ${
                      isSelected ? 'text-white/90' : 'text-slate-500'
                    }`}
                  >
                    {opt.subtext}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Objective Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Catatan Objektif Supervisor / Fakta yang Teramati di Kelas:
          </label>
          <textarea
            rows={2}
            value={currentNote}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder={`Tuliskan bukti nyata perilaku guru dan respon murid pada Indikator ${indicator.number}...`}
            className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
