/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  MessageSquareQuote,
  ClipboardCheck,
  MessageSquareText,
  ListChecks,
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  AppSettings,
  SupervisionRecord,
  Teacher
} from '../../types/inspiro';
import { calculateScore } from '../../utils/storage';
import { Step1Identity } from './Step1Identity';
import { Step2PreObservation } from './Step2PreObservation';
import { Step3Observation } from './Step3Observation';
import { Step4PostObservation } from './Step4PostObservation';
import { Step5FollowUpPlan } from './Step5FollowUpPlan';

interface WizardContainerProps {
  initialSupervision?: SupervisionRecord | null;
  selectedTeacherId?: string | null;
  teachers: Teacher[];
  settings: AppSettings;
  onSaveDraft: (record: SupervisionRecord) => void;
  onCompleteSupervision: (record: SupervisionRecord) => void;
  onCancel: () => void;
}

export const WizardContainer: React.FC<WizardContainerProps> = ({
  initialSupervision,
  selectedTeacherId,
  teachers,
  settings,
  onSaveDraft,
  onCompleteSupervision,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [record, setRecord] = useState<SupervisionRecord>(() => {
    if (initialSupervision) return initialSupervision;

    // Check if teacher preselected
    const preselectedTeacher = teachers.find((t) => t.id === selectedTeacherId);

    const initialScores: Record<number, number> = {};
    const initialNotes: Record<number, string> = {};

    return {
      id: `S-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      teacherId: preselectedTeacher ? preselectedTeacher.id : '',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      identity: {
        namaGuru: preselectedTeacher ? preselectedTeacher.nama : '',
        nipGuru: preselectedTeacher ? preselectedTeacher.nip : '',
        namaSupervisor: settings.supervisorName || 'Heriansyah., S.Si., S.Pd., M.Pd',
        nipSupervisor: settings.supervisorNip || '19820415 200801 1 007',
        jabatanSupervisor: settings.supervisorRole || 'Pengawas Sekolah',
        mapel: preselectedTeacher ? preselectedTeacher.mapel : '',
        kelasSemester: preselectedTeacher ? `${preselectedTeacher.kelas} / Ganjil` : 'VII / Ganjil',
        satuanPendidikan: settings.schoolName || 'SMP Negeri 1 Merdeka Nusantara',
        hariTanggal: new Date().toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        fokusPerilaku: 'Penerapan Disiplin Positif & Instruksi yang Berdiferensiasi',
        materiPokok: '',
        jamPelajaran: '08.00 - 09.20 WIB (2 JP)',
        siklus: 'Siklus I'
      },
      praObservasi: {
        tujuanPembelajaran: '',
        pemetaanKebutuhan: '',
        fokusPerilaku: '',
        modelMetode: '',
        mediaAlat: '',
        bentukAsesmen: ''
      },
      scores: initialScores,
      notes: initialNotes,
      totalScore: 0,
      finalScore: 0,
      category: 'Kurang (K)',
      refleksi: {
        kesanPerasaan: '',
        kesesuaianModul: '',
        kendalaSiswa: '',
        ketercapaianFokus: '',
        rencanaPeningkatan: ''
      },
      rtl: []
    };
  });

  // Calculate scores real-time
  const { totalScore, finalScore, category } = calculateScore(record.scores);

  // Sync calculated score to record
  useEffect(() => {
    setRecord((prev) => ({
      ...prev,
      totalScore,
      finalScore,
      category
    }));
  }, [totalScore, finalScore, category]);

  const steps = [
    { number: 1, title: 'Identitas', icon: UserCheck, desc: 'Profil Guru & Jadwal' },
    { number: 2, title: 'Pra-Observasi', icon: MessageSquareQuote, desc: '6 Pertanyaan Wawancara' },
    { number: 3, title: 'Observasi', icon: ClipboardCheck, desc: '12 Indikator (1-4)' },
    { number: 4, title: 'Refleksi', icon: MessageSquareText, desc: 'Wawancara Pasca' },
    { number: 5, title: 'RTL', icon: ListChecks, desc: 'Rencana Tindak Lanjut' }
  ];

  // Rated indicators count
  const ratedCount = Object.keys(record.scores).filter(
    (k) => (record.scores[Number(k)] || 0) > 0
  ).length;

  // Handlers for Step 1
  const handleIdentityChange = (field: keyof SupervisionRecord['identity'], value: string) => {
    setRecord((prev) => ({
      ...prev,
      identity: {
        ...prev.identity,
        [field]: value
      }
    }));
  };

  const handleSelectTeacher = (teacher: Teacher) => {
    setRecord((prev) => ({
      ...prev,
      teacherId: teacher.id,
      identity: {
        ...prev.identity,
        namaGuru: teacher.nama,
        nipGuru: teacher.nip,
        mapel: teacher.mapel,
        kelasSemester: `${teacher.kelas} / Ganjil`,
        satuanPendidikan: teacher.satuanPendidikan || prev.identity.satuanPendidikan
      }
    }));
  };

  // Handlers for Step 2
  const handlePreObsChange = (field: keyof SupervisionRecord['praObservasi'], value: string) => {
    setRecord((prev) => ({
      ...prev,
      praObservasi: {
        ...prev.praObservasi,
        [field]: value
      }
    }));
  };

  // Handlers for Step 3
  const handleScoreChange = (indicatorId: number, score: number) => {
    setRecord((prev) => {
      const newScores = { ...prev.scores, [indicatorId]: score };
      const calc = calculateScore(newScores);
      return {
        ...prev,
        scores: newScores,
        totalScore: calc.totalScore,
        finalScore: calc.finalScore,
        category: calc.category
      };
    });
  };

  const handleNoteChange = (indicatorId: number, note: string) => {
    setRecord((prev) => ({
      ...prev,
      notes: {
        ...prev.notes,
        [indicatorId]: note
      }
    }));
  };

  // Handlers for Step 4
  const handlePostObsChange = (field: keyof SupervisionRecord['refleksi'], value: string) => {
    setRecord((prev) => ({
      ...prev,
      refleksi: {
        ...prev.refleksi,
        [field]: value
      }
    }));
  };

  // Handlers for Step 5
  const handleRtlChange = (rtlItems: SupervisionRecord['rtl']) => {
    setRecord((prev) => ({
      ...prev,
      rtl: rtlItems
    }));
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveAsDraft = () => {
    onSaveDraft({
      ...record,
      status: 'draft',
      totalScore,
      finalScore,
      category
    });
  };

  const handleFinish = () => {
    // If not all 12 indicators are rated, warn user
    if (ratedCount < 12) {
      const confirmIncomplete = window.confirm(
        `Perhatian: Baru ${ratedCount} dari 12 indikator yang dinilai. Apakah Anda yakin ingin menyelesaikan sekarang?`
      );
      if (!confirmIncomplete) {
        setCurrentStep(3);
        return;
      }
    }

    onCompleteSupervision({
      ...record,
      status: 'selesai',
      totalScore,
      finalScore,
      category,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Stepper Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Instrumen Supervisi Akademik Kurikulum Merdeka
            </h2>
            <p className="text-xs text-slate-500">
              Guru: <strong className="text-slate-800">{record.identity.namaGuru || 'Belum dipilih'}</strong> · Mapel:{' '}
              {record.identity.mapel || '-'}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal / Keluar
          </button>
        </div>

        {/* Step Indicator Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {steps.map((st) => {
            const Icon = st.icon;
            const isCurrent = currentStep === st.number;
            const isPassed = currentStep > st.number;

            return (
              <button
                key={st.number}
                type="button"
                onClick={() => setCurrentStep(st.number)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs ring-1 ring-blue-500'
                    : isPassed
                    ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isPassed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : st.number}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate leading-tight">{st.title}</div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{st.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Score Badge (Always Visible & Prominent) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 sticky top-18 z-20 backdrop-blur-md bg-white/95">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Nilai Akhir Observasi (Real-time)
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
                {finalScore}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ 100</span>
              <span className="text-xs text-slate-400 font-mono">
                (Total Skor: {totalScore} / 48)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <div className="text-[10px] text-slate-400">Predikat Capaian:</div>
            <span
              className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                category === 'Amat Baik (SB)'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : category === 'Baik (B)'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : category === 'Cukup (C)'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {category}
            </span>
          </div>

          <div className="pl-3 border-l border-slate-200 text-right hidden sm:block">
            <div className="text-[10px] text-slate-400">Status Indikator:</div>
            <span
              className={`text-xs font-semibold ${
                ratedCount === 12 ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {ratedCount}/12 Terisi
            </span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <Step1Identity
            data={record.identity}
            onChange={handleIdentityChange}
            teachers={teachers}
            onSelectExistingTeacher={handleSelectTeacher}
          />
        )}

        {currentStep === 2 && (
          <Step2PreObservation
            data={record.praObservasi}
            onChange={handlePreObsChange}
          />
        )}

        {currentStep === 3 && (
          <Step3Observation
            scores={record.scores}
            notes={record.notes}
            onScoreChange={handleScoreChange}
            onNoteChange={handleNoteChange}
          />
        )}

        {currentStep === 4 && (
          <Step4PostObservation
            data={record.refleksi}
            onChange={handlePostObsChange}
          />
        )}

        {currentStep === 5 && (
          <Step5FollowUpPlan
            items={record.rtl}
            onChange={handleRtlChange}
          />
        )}
      </div>

      {/* Sticky Bottom Wizard Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 p-3 sm:px-6 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveAsDraft}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            title="Simpan perubahan saat ini tanpa mengubah status ke selesai"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Simpan Draf</span>
            <span className="sm:hidden">Draf</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span>Lanjut ke Step {currentStep + 1}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer animate-pulse"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan & Lihat Hasil Supervisi</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
