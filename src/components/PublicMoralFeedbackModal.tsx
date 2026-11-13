/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  HeartHandshake,
  ShieldCheck,
  Send,
  Star,
  CheckCircle2,
  Lock,
  UserCheck,
  NotebookPen
} from 'lucide-react';
import {
  AppSettings,
  MoralBarometerScores,
  MoralFeedbackCategory,
  MoralFeedbackRecord,
  MORAL_CATEGORY_LABELS,
  Principal
} from '../types/inspiro';

export type MoralDoorMode = 'public_guru' | 'kepsek' | 'catatan_lapangan';

interface PublicMoralFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: MoralDoorMode;
  principals: Principal[];
  settings: AppSettings;
  defaultSchoolName?: string;
  defaultSenderName?: string;
  inlinePage?: boolean;
  onNavigateToLogin?: () => void;
  onSubmit: (record: MoralFeedbackRecord) => Promise<void> | void;
}

const BAROMETER_ITEMS: {
  key: keyof MoralBarometerScores;
  title: string;
  desc: string;
}[] = [
  {
    key: 'menenangkan',
    title: 'Menenangkan & Aman Psikologis',
    desc: 'Kehadiran pengawas tidak menimbulkan rasa takut atau tegang saat mengajar.'
  },
  {
    key: 'mendengarkan',
    title: 'Mau Mendengarkan Sebelum Menilai',
    desc: 'Pengawas memberi ruang tulus bagi pendidik untuk bercerita tentang kendala nyata.'
  },
  {
    key: 'solutif',
    title: 'Memberi Solusi Nyata (Tanpa Beban Tambahan)',
    desc: 'Saran yang diberikan praktis dan tidak sekadar menambah tumpukan administrasi.'
  },
  {
    key: 'memuliakan',
    title: 'Memuliakan Profesi & Martabat Pendidik',
    desc: 'Umpan balik disampaikan dengan adab yang santun, hangat, dan membesarkan hati.'
  }
];

export const PublicMoralFeedbackModal: React.FC<PublicMoralFeedbackModalProps> = ({
  isOpen,
  onClose,
  mode,
  principals,
  settings,
  defaultSchoolName,
  defaultSenderName,
  inlinePage = false,
  onNavigateToLogin,
  onSubmit
}) => {
  const uniqueSchools = Array.from(
    new Set([
      ...(defaultSchoolName ? [defaultSchoolName] : []),
      ...principals.map((p) => p.satuanPendidikan).filter(Boolean),
      'UPT SMP Negeri 1 Pangkajene',
      'UPT SMP Negeri 2 Maritengngae',
      'UPT SD Negeri 6 Amparita'
    ])
  );

  const [schoolChoice, setSchoolChoice] = useState<string>(
    defaultSchoolName || uniqueSchools[0] || ''
  );
  const [customSchool, setCustomSchool] = useState<string>('');
  const [senderRole, setSenderRole] = useState<'Guru' | 'Kepala Sekolah' | 'Komunitas Belajar'>(
    mode === 'kepsek' ? 'Kepala Sekolah' : mode === 'catatan_lapangan' ? 'Komunitas Belajar' : 'Guru'
  );
  const [isAnonymous, setIsAnonymous] = useState<boolean>(mode === 'public_guru');
  const [senderName, setSenderName] = useState<string>(
    mode === 'kepsek' && defaultSenderName ? defaultSenderName : ''
  );
  const [senderSubjectOrTitle, setSenderSubjectOrTitle] = useState<string>(
    mode === 'kepsek' ? 'Kepala Satuan Pendidikan' : ''
  );
  const [category, setCategory] = useState<MoralFeedbackCategory>('nasihat_pengingat');
  const [barometer, setBarometer] = useState<MoralBarometerScores>({
    menenangkan: 5,
    mendengarkan: 5,
    solutif: 5,
    memuliakan: 5
  });
  const [message, setMessage] = useState<string>('');
  const [specificMoment, setSpecificMoment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  if (!isOpen) return null;

  const resolvedSchoolName =
    schoolChoice === '__custom__' ? customSchool.trim() : schoolChoice.trim();

  const matchingPrincipal = principals.find(
    (p) => p.satuanPendidikan.toLowerCase() === resolvedSchoolName.toLowerCase()
  );

  const avgScore = Number(
    (
      (barometer.menenangkan +
        barometer.mendengarkan +
        barometer.solutif +
        barometer.memuliakan) /
      4
    ).toFixed(2)
  );

  const handleResetForNext = () => {
    setMessage('');
    setSpecificMoment('');
    setFormError('');
    setSubmittedSuccess(false);
    if (mode === 'public_guru') {
      setIsAnonymous(true);
      setSenderName('');
      setSenderSubjectOrTitle('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!resolvedSchoolName) {
      setFormError('Mohon pilih atau tuliskan nama sekolah asal Anda.');
      return;
    }
    if (!message.trim() || message.trim().length < 12) {
      setFormError('Mohon tuliskan pesan moral atau suara hati minimal 12 karakter.');
      return;
    }
    if (!isAnonymous && !senderName.trim()) {
      setFormError('Mohon isi nama pengirim atau aktifkan Mode Anonim untuk menjaga privasi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const sourceChannel =
        mode === 'public_guru'
          ? 'mandiri_guru'
          : mode === 'kepsek'
          ? 'mandiri_kepsek'
          : 'catatan_lapangan';

      const trimmedSubject = senderSubjectOrTitle.trim();
      const trimmedMoment = specificMoment.trim();

      const newRecord: MoralFeedbackRecord = {
        id: `MF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        date: now.split('T')[0],
        schoolName: resolvedSchoolName,
        schoolNpsn: matchingPrincipal?.npsn || '',
        senderRole,
        isAnonymous: mode === 'catatan_lapangan' ? false : isAnonymous,
        senderName:
          mode !== 'catatan_lapangan' && isAnonymous
            ? `Anonim (${senderRole})`
            : senderName.trim() || `Tim ${resolvedSchoolName}`,
        ...(trimmedSubject ? { senderSubjectOrTitle: trimmedSubject } : {}),
        sourceChannel,
        category,
        barometer,
        averageScore: avgScore,
        message: message.trim(),
        ...(trimmedMoment ? { specificMoment: trimmedMoment } : {}),
        supervisorName: settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
        supervisorNip: settings.supervisorNip || '19830819 201001 1 002',
        status: 'baru',
        createdAt: now,
        updatedAt: now
      };

      await onSubmit(newRecord);
      setSubmittedSuccess(true);
    } catch (err) {
      console.error('Gagal mengirim pesan moral:', err);
      setFormError('Terjadi kendala saat menyimpan pesan. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle =
    mode === 'public_guru'
      ? 'Pintu Suara Hati Guru & Sekolah (Tanpa Login)'
      : mode === 'kepsek'
      ? 'Kirim Pesan Moral & Refleksi Kepala Sekolah'
      : 'Catat Pesan Moral / Masukan Lisan Lapangan';

  const modalSubtitle =
    mode === 'public_guru'
      ? 'Ruang aman psikologis bagi Guru untuk menitipkan apresiasi, pengingat moral, dan harapan langsung kepada Pengawas Pembina.'
      : mode === 'kepsek'
      ? 'Umpan balik jujur dan konstruktif dari pimpinan satuan pendidikan untuk menjaga mutu pendampingan pengawas.'
      : 'Arsip catatan pesan lisan atau diskusi santai bersama guru/komunitas belajar saat kunjungan lapangan.';

  const cardContent = (
    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-slate-900 px-5 py-4 text-white flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 mt-0.5">
            {mode === 'catatan_lapangan' ? (
              <NotebookPen className="w-5 h-5 text-emerald-100" />
            ) : (
              <HeartHandshake className="w-5 h-5 text-emerald-100" />
            )}
          </div>
          <div>
            <h2 className="text-base font-bold leading-snug">{modalTitle}</h2>
            <p className="text-xs text-emerald-100/90 mt-0.5 leading-relaxed">
              {modalSubtitle}
            </p>
          </div>
        </div>
        {!inlinePage && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            aria-label="Tutup formulir"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {submittedSuccess ? (
        <div className="p-7 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-extrabold text-slate-900">
              Terima Kasih atas Kejujuran &amp; Kepercayaannya
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pesan moral Anda telah tersimpan aman dan diteruskan ke Ruang Refleksi Hati{' '}
              <strong className="text-slate-900">
                {settings.supervisorName || 'Pengawas Sekolah Pembina'}
              </strong>
              .{' '}
              {isAnonymous &&
                'Identitas Anda dirahasiakan sepenuhnya dan tidak dapat dilihat oleh Kepala Sekolah maupun pihak lain.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleResetForNext}
              className="px-4 py-2 rounded-xl border border-teal-300 bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              Isi Pesan Lainnya (Mode Kiosk)
            </button>
            {!inlinePage && (
              <button
                type="button"
                onClick={() => {
                  handleResetForNext();
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                Selesai &amp; Tutup
              </button>
            )}
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className={`p-5 sm:p-6 space-y-5 ${inlinePage ? '' : 'max-h-[82vh] overflow-y-auto'}`}
        >
            {/* Assurance Banner for Public Guru / Anonymity */}
            {mode !== 'catatan_lapangan' && (
              <div className="p-3.5 rounded-xl bg-teal-50/80 border border-teal-200 flex items-start gap-2.5 text-xs text-teal-950">
                <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Jaminan Ruang Aman Psikologis:</span>{' '}
                  Pesan anonim hanya dibaca oleh Pengawas Pembina untuk cermin perbaikan diri, tidak memengaruhi nilai kinerja guru, dan tidak dibuka di portal Kepala Sekolah.
                </div>
              </div>
            )}

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
                {formError}
              </div>
            )}

            {/* 1. Identitas & Anonimitas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Satuan Pendidikan
                </label>
                <select
                  value={schoolChoice}
                  onChange={(e) => setSchoolChoice(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                >
                  {uniqueSchools.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  <option value="__custom__">+ Tulis Nama Sekolah Lainnya</option>
                </select>
                {schoolChoice === '__custom__' && (
                  <input
                    type="text"
                    value={customSchool}
                    onChange={(e) => setCustomSchool(e.target.value)}
                    placeholder="Contoh: UPT SD Negeri 4 Pangkajene"
                    className="mt-2 w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Peran Pengirim Suara Hati
                </label>
                <select
                  value={senderRole}
                  onChange={(e) =>
                    setSenderRole(e.target.value as 'Guru' | 'Kepala Sekolah' | 'Komunitas Belajar')
                  }
                  disabled={mode === 'kepsek'}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 disabled:bg-slate-100"
                >
                  <option value="Guru">Guru / Pendidik</option>
                  <option value="Kepala Sekolah">Kepala Sekolah</option>
                  <option value="Komunitas Belajar">Komunitas Belajar Sekolah</option>
                </select>
              </div>
            </div>

            {mode !== 'catatan_lapangan' && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isAnonymous ? (
                      <Lock className="w-4 h-4 text-teal-700" />
                    ) : (
                      <UserCheck className="w-4 h-4 text-blue-700" />
                    )}
                    <span className="text-xs font-bold text-slate-900">
                      {isAnonymous ? 'Mode Anonim Aktif (Identitas Tersembunyi)' : 'Tampilkan Nama Pengirim'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsAnonymous(true)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                        isAnonymous
                          ? 'bg-teal-700 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Anonim (Rahasia)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAnonymous(false)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                        !isAnonymous
                          ? 'bg-blue-700 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Terbuka (Dengan Nama)
                    </button>
                  </div>
                </div>

                {!isAnonymous ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="Nama Anda"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Mapel / Jabatan (Opsional)
                      </label>
                      <input
                        type="text"
                        value={senderSubjectOrTitle}
                        onChange={(e) => setSenderSubjectOrTitle(e.target.value)}
                        placeholder="Contoh: Guru IPA / Wakasek Kurikulum"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Konteks Peran Umum (Opsional, tanpa nama)
                    </label>
                    <input
                      type="text"
                      value={senderSubjectOrTitle}
                      onChange={(e) => setSenderSubjectOrTitle(e.target.value)}
                      placeholder="Contoh: Guru Kelas Rendah / Guru Mapel"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                )}
              </div>
            )}

            {mode === 'catatan_lapangan' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sumber Masukan Lisan / Catatan
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Contoh: Tim Kombel Guru IPA / Forum KKG"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Konteks Sesi / Forum
                  </label>
                  <input
                    type="text"
                    value={senderSubjectOrTitle}
                    onChange={(e) => setSenderSubjectOrTitle(e.target.value)}
                    placeholder="Contoh: Diskusi Santai Ruang Guru"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* 2. Kategori Pesan Moral */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Kategori Pesan Moral
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.keys(MORAL_CATEGORY_LABELS) as MoralFeedbackCategory[]).map((catKey) => {
                  const info = MORAL_CATEGORY_LABELS[catKey];
                  const active = category === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setCategory(catKey)}
                      className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                        active
                          ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className="text-xs font-bold">{info.label}</div>
                      <div
                        className={`text-[11px] mt-0.5 leading-snug ${
                          active ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {info.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Barometer Sikap Pengawas (Skala 1-5) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Barometer Sikap &amp; Kehadiran Pengawas (Skala 1–5)
                </label>
                <span className="text-xs font-extrabold text-teal-700 tabular-nums">
                  Rerata: {avgScore.toFixed(2)} / 5.00
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {BAROMETER_ITEMS.map((item) => {
                  const currentVal = barometer[item.key];
                  return (
                    <div
                      key={item.key}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900">{item.title}</div>
                        <div className="text-[11px] text-slate-500 leading-snug">{item.desc}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() =>
                              setBarometer((prev) => ({
                                ...prev,
                                [item.key]: num
                              }))
                            }
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border transition-all cursor-pointer tabular-nums ${
                              currentVal >= num
                                ? 'bg-amber-500 border-amber-500 text-white shadow-2xs'
                                : 'bg-white border-slate-300 text-slate-400 hover:border-amber-300'
                            }`}
                            title={`Nilai ${num}`}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                currentVal >= num ? 'fill-white text-white' : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-1.5 text-xs font-extrabold text-slate-800 w-5 text-right tabular-nums">
                          {currentVal}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Isi Pesan Moral */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pesan Moral, Nasihat, atau Suara Hati untuk Pengawas
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan dengan jujur dari hati ke hati: apa yang paling membantu Anda, atau hal apa yang perlu diperbaiki dari cara pengawas mendampingi di kelas/sekolah..."
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Momen atau Sesi Terkait (Opsional)
                </label>
                <input
                  type="text"
                  value={specificMoment}
                  onChange={(e) => setSpecificMoment(e.target.value)}
                  placeholder="Contoh: Sesi pasca-observasi kelas VII-B atau pendampingan Kombel"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
              {!inlinePage && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer whitespace-nowrap"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Mengirim...' : 'Kirim Pesan Suara Hati'}</span>
              </button>
            </div>
          </form>
        )}
    </div>
  );

  if (inlinePage) {
    return (
      <div className="min-h-screen bg-radial from-[#0c1838] via-[#080e22] to-[#040714] flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl mb-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight">INSPIRO · Pintu Suara Hati Guru</div>
              <div className="text-[11px] text-slate-300">Tanpa Login · Tanpa Akun · Aman &amp; Rahasia</div>
            </div>
          </div>
          {onNavigateToLogin && (
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-slate-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              Portal Pengawas / Kepsek
            </button>
          )}
        </div>
        {cardContent}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {cardContent}
    </div>
  );
};
