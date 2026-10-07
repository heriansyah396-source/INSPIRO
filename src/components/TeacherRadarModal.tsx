/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Compass,
  User,
  ClipboardCheck,
  Calendar,
  School,
  BookOpen,
  Award,
  ArrowRight,
  Printer
} from 'lucide-react';
import { SupervisionRecord, Teacher } from '../types/inspiro';
import { TeacherRadarChart } from './TeacherRadarChart';

interface TeacherRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  supervision?: SupervisionRecord | null;
  onStartSupervision?: (teacherId: string) => void;
  onViewDetail?: (supervisionId: string) => void;
}

export const TeacherRadarModal: React.FC<TeacherRadarModalProps> = ({
  isOpen,
  onClose,
  teacher,
  supervision,
  onStartSupervision,
  onViewDetail
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !teacher) return null;

  return typeof document !== 'undefined'
    ? createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 lg:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden w-full max-w-4xl text-slate-900 animate-in zoom-in-95 duration-200 my-auto max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0c1c4f] via-[#16275f] to-[#0f1d43] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20 shrink-0">
                  <Compass className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                    <span>Visualisasi Radar Kompetensi Guru</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-400/30">
                      Profil Pedagogis
                    </span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-blue-200/90 mt-0.5">
                    <span className="font-bold text-white">{teacher.nama}</span>
                    <span>·</span>
                    <span>NIP: {teacher.nip || '-'}</span>
                    <span>·</span>
                    <span>{teacher.mapel} ({teacher.kelas})</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Tutup dialog (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              <TeacherRadarChart
                supervision={supervision}
                teacherName={teacher.nama}
                size="md"
                showLegend={true}
                showBreakdown={true}
                showRecommendations={true}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500">
                {supervision ? (
                  <span>
                    Berkas ID: <strong className="font-mono text-slate-700">{supervision.id}</strong> (Siklus {supervision.identity.siklus || 'I'})
                  </span>
                ) : (
                  <span className="text-amber-600 font-semibold">
                    * Guru ini belum memiliki berkas supervisi selesai di siklus berjalan.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {supervision && onViewDetail && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onViewDetail(supervision.id);
                    }}
                    className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>Buka Rincian Supervisi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {!supervision && onStartSupervision && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onStartSupervision(teacher.id);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    <span>Mulai Supervisi Guru Ini</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;
};
