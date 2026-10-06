/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HelpCircle, Sparkles, MessageSquareQuote } from 'lucide-react';
import { PRE_OBSERVATION_QUESTIONS, PreObservationData } from '../../types/inspiro';

interface Step2PreObservationProps {
  data: PreObservationData;
  onChange: (field: keyof PreObservationData, value: string) => void;
}

export const Step2PreObservation: React.FC<Step2PreObservationProps> = ({
  data,
  onChange
}) => {
  return (
    <div className="space-y-6">
      {/* Intro info box */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-xs text-emerald-950 flex items-start gap-3">
        <MessageSquareQuote className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-emerald-950">
            Langkah 2: Lembar Wawancara & Telaah Pra-Observasi
          </h4>
          <p className="mt-0.5 text-emerald-900 leading-relaxed">
            Dilaksanakan sebelum supervisor memasuki ruang kelas. Bertujuan menyelaraskan tujuan pembelajaran,
            memeriksa kesiapan Modul Ajar/RPP, dan menyepakati fokus perilaku observasi.
          </p>
        </div>
      </div>

      {/* Accordion / Card Questions */}
      <div className="space-y-4">
        {PRE_OBSERVATION_QUESTIONS.map((q) => {
          const currentValue = data[q.key as keyof PreObservationData] || '';

          return (
            <div
              key={q.key}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all hover:border-slate-300"
            >
              <div className="p-4 sm:p-5 bg-slate-50/50 border-b border-slate-100 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {q.number}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
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

                {/* Quick filler button for realistic example */}
                {!currentValue && (
                  <button
                    type="button"
                    onClick={() => onChange(q.key as keyof PreObservationData, q.placeholder.replace('Contoh: ', ''))}
                    className="shrink-0 hidden sm:flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors cursor-pointer"
                    title="Gunakan contoh teks panduan"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Gunakan Contoh</span>
                  </button>
                )}
              </div>

              <div className="p-4 sm:p-5">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Catatan Respons Guru & Hasil Telaah Dokumen:
                </label>
                <textarea
                  rows={3}
                  value={currentValue}
                  onChange={(e) => onChange(q.key as keyof PreObservationData, e.target.value)}
                  placeholder={q.placeholder}
                  className="w-full p-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 leading-relaxed"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
