/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MessageSquareText, HelpCircle, Sparkles } from 'lucide-react';
import { POST_OBSERVATION_QUESTIONS, PostObservationData } from '../../types/inspiro';

interface Step4PostObservationProps {
  data: PostObservationData;
  onChange: (field: keyof PostObservationData, value: string) => void;
}

export const Step4PostObservation: React.FC<Step4PostObservationProps> = ({
  data,
  onChange
}) => {
  return (
    <div className="space-y-6">
      {/* Intro info box */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-200/70 rounded-xl text-xs text-indigo-950 flex items-start gap-3">
        <MessageSquareText className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-indigo-950">
            Langkah 4: Refleksi & Wawancara Pasca-Observasi
          </h4>
          <p className="mt-0.5 text-indigo-900 leading-relaxed">
            Dilaksanakan segera setelah kegiatan pembelajaran selesai. Supervisor mengajak guru berdialog
            secara konstruktif (pendekatan coaching) untuk merefleksikan capaian dan tantangan yang dihadapi.
          </p>
        </div>
      </div>

      {/* Accordion / Card Questions */}
      <div className="space-y-4">
        {POST_OBSERVATION_QUESTIONS.map((q) => {
          const currentValue = data[q.key as keyof PostObservationData] || '';

          return (
            <div
              key={q.key}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all hover:border-slate-300"
            >
              <div className="p-4 sm:p-5 bg-slate-50/50 border-b border-slate-100 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {q.number}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                      {q.label}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                      {q.question}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{q.helperText}</span>
                    </p>
                  </div>
                </div>

                {!currentValue && (
                  <button
                    type="button"
                    onClick={() => onChange(q.key as keyof PostObservationData, q.placeholder.replace('Contoh: ', ''))}
                    className="shrink-0 hidden sm:flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 transition-colors cursor-pointer"
                    title="Gunakan contoh teks refleksi"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Gunakan Contoh</span>
                  </button>
                )}
              </div>

              <div className="p-4 sm:p-5">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Catatan Refleksi & Umpan Balik Guru:
                </label>
                <textarea
                  rows={3}
                  value={currentValue}
                  onChange={(e) => onChange(q.key as keyof PostObservationData, e.target.value)}
                  placeholder={q.placeholder}
                  className="w-full p-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 leading-relaxed"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
