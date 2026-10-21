/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  FileSignature,
  Check,
  RotateCcw,
  Building,
  User,
  MapPin,
  Sparkles,
  Printer,
  Calendar
} from 'lucide-react';
import { AppSettings } from '../types/inspiro';

interface SignatoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (updatedSettings: AppSettings) => void;
  onPrintAfterSave?: () => void;
  teacherInfo?: {
    name: string;
    nip: string;
    mapel?: string;
  };
}

const ROLE_PRESETS = [
  'Koordinator Pengawas / Kepala Dinas Pendidikan',
  'Koordinator Pengawas Sekolah',
  'Kepala Dinas Pendidikan',
  'Kepala Satuan Pendidikan Binaan',
  'Pengawas Pembina Sekolah'
];

export const SignatoryModal: React.FC<SignatoryModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  onPrintAfterSave,
  teacherInfo
}) => {
  const [supervisorName, setSupervisorName] = useState(
    settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'
  );
  const [supervisorNip, setSupervisorNip] = useState(settings.supervisorNip || '19820415 200801 1 007');
  const [supervisorRole, setSupervisorRole] = useState(settings.supervisorRole || 'Pengawas Sekolah Pembina');

  const [pengawasPembinaName, setPengawasPembinaName] = useState(
    settings.pengawasPembinaName || 'Dr. Hj. Endang Sulastri, M.Pd.'
  );
  const [pengawasPembinaNip, setPengawasPembinaNip] = useState(
    settings.pengawasPembinaNip || '19650410 199103 2 001'
  );
  const [pengawasPembinaRole, setPengawasPembinaRole] = useState(
    settings.pengawasPembinaRole || 'Koordinator Pengawas / Kepala Dinas Pendidikan'
  );

  const [schoolCity, setSchoolCity] = useState(settings.schoolCity || 'Kota Pendidikan');
  const [useTodayDate, setUseTodayDate] = useState(!settings.documentDate);
  const [customDate, setCustomDate] = useState(
    settings.documentDate ||
      new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
  );

  const [includeTeacherSignature, setIncludeTeacherSignature] = useState(Boolean(teacherInfo));

  useEffect(() => {
    if (isOpen) {
      // Ensure any legacy name with period "Heriansyah." or old values gets normalized
      const cleanSupervisorName =
        !settings.supervisorName ||
        settings.supervisorName.includes('Heriansyah.') ||
        settings.supervisorName.toLowerCase().includes('rustina')
          ? 'HERIANSYAH, S.Si., S.Pd., M.Pd'
          : settings.supervisorName;

      setSupervisorName(cleanSupervisorName);
      setSupervisorNip(settings.supervisorNip || '19820415 200801 1 007');
      setSupervisorRole(settings.supervisorRole || 'Pengawas Sekolah Pembina');
      setPengawasPembinaName(settings.pengawasPembinaName || 'Dr. Hj. Endang Sulastri, M.Pd.');
      setPengawasPembinaNip(settings.pengawasPembinaNip || '19650410 199103 2 001');
      setPengawasPembinaRole(
        settings.pengawasPembinaRole || 'Koordinator Pengawas / Kepala Dinas Pendidikan'
      );
      setSchoolCity(settings.schoolCity || 'Kota Pendidikan');
      setUseTodayDate(!settings.documentDate);
      setCustomDate(
        settings.documentDate ||
          new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })
      );
      if (teacherInfo) {
        setIncludeTeacherSignature(true);
      }
    }
  }, [isOpen, settings, teacherInfo]);

  if (!isOpen) return null;

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const effectiveDate = useTodayDate ? todayFormatted : customDate;

  const handleResetDefaults = () => {
    setSupervisorName('HERIANSYAH, S.Si., S.Pd., M.Pd');
    setSupervisorNip('19820415 200801 1 007');
    setSupervisorRole('Pengawas Sekolah Pembina');
    setPengawasPembinaName('Dr. Hj. Endang Sulastri, M.Pd.');
    setPengawasPembinaNip('19650410 199103 2 001');
    setPengawasPembinaRole('Koordinator Pengawas / Kepala Dinas Pendidikan');
    setSchoolCity('Kota Pendidikan');
    setUseTodayDate(true);
    setCustomDate(todayFormatted);
    if (teacherInfo) setIncludeTeacherSignature(true);
  };

  const getUpdatedSettings = (): AppSettings => {
    return {
      ...settings,
      supervisorName: supervisorName.trim() || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
      supervisorNip: supervisorNip.trim() || '19820415 200801 1 007',
      supervisorRole: supervisorRole.trim() || 'Pengawas Sekolah Pembina',
      pengawasPembinaName: pengawasPembinaName.trim() || 'Dr. Hj. Endang Sulastri, M.Pd.',
      pengawasPembinaNip: pengawasPembinaNip.trim() || '19650410 199103 2 001',
      pengawasPembinaRole:
        pengawasPembinaRole.trim() || 'Koordinator Pengawas / Kepala Dinas Pendidikan',
      schoolCity: schoolCity.trim() || 'Kota Pendidikan',
      documentDate: useTodayDate ? '' : customDate.trim()
    };
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = getUpdatedSettings();
    onSave(updated);
    onClose();
  };

  const handleSaveAndPrint = () => {
    const updated = getUpdatedSettings();
    onSave(updated);
    onClose();
    if (onPrintAfterSave) {
      setTimeout(() => {
        onPrintAfterSave();
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-blue-50/40">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-100/70 text-blue-700 border border-blue-200/60">
              <FileSignature className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Menu Input &amp; Pengaturan Yang Bertanda Tangan
              </h3>
              <p className="text-xs text-slate-500">
                Atur nama pengawas, pejabat yang mengetahui, kota, dan titimangsa tanggal pengesahan untuk Cetak PDF &amp; Ekspor Word
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Section 1: Pihak Penilai (Pengawas Sekolah) */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <User className="w-4 h-4 text-blue-600" />
                <span>1. Pengawas Sekolah Pembina (Pihak Penilai - Kanan Dokumen)</span>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-200/60">
                Tanda Tangan Utama
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap &amp; Gelar Pengawas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  placeholder="HERIANSYAH, S.Si., S.Pd., M.Pd"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIP Pengawas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={supervisorNip}
                  onChange={(e) => setSupervisorNip(e.target.value)}
                  placeholder="19820415 200801 1 007"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jabatan Penilai pada Kolom Tanda Tangan
                </label>
                <input
                  type="text"
                  value={supervisorRole}
                  onChange={(e) => setSupervisorRole(e.target.value)}
                  placeholder="Pengawas Sekolah Pembina"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pihak Mengetahui (Pejabat Dinas / Koordinator Pengawas / Kepala Sekolah) */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>2. Pihak yang Mengetahui (Kiri Dokumen)</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jabatan Pejabat yang Mengetahui
                </label>
                <input
                  type="text"
                  value={pengawasPembinaRole}
                  onChange={(e) => setPengawasPembinaRole(e.target.value)}
                  placeholder="Koordinator Pengawas / Kepala Dinas Pendidikan"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                {/* Presets Chips */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-500 font-medium">Pilihan cepat:</span>
                  {ROLE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPengawasPembinaRole(preset)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer border ${
                        pengawasPembinaRole === preset
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Pejabat yang Mengetahui
                  </label>
                  <input
                    type="text"
                    value={pengawasPembinaName}
                    onChange={(e) => setPengawasPembinaName(e.target.value)}
                    placeholder="Dr. Hj. Endang Sulastri, M.Pd."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIP Pejabat
                  </label>
                  <input
                    type="text"
                    value={pengawasPembinaNip}
                    onChange={(e) => setPengawasPembinaNip(e.target.value)}
                    placeholder="19650410 199103 2 001"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 (Optional): Guru yang Disupervisi (jika ada guru terpilih) */}
          {teacherInfo && (
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <User className="w-4 h-4 text-purple-600" />
                  <span>3. Guru yang Disupervisi (Tengah / Bagian Penelaahan)</span>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTeacherSignature}
                    onChange={(e) => setIncludeTeacherSignature(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span className="font-medium text-[11px]">Sertakan Kolom Guru</span>
                </label>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-slate-800">{teacherInfo.name}</span>
                  <span className="text-slate-500 ml-2">NIP: {teacherInfo.nip}</span>
                </div>
                {teacherInfo.mapel && (
                  <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">
                    {teacherInfo.mapel}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Section 4: Tempat & Tanggal Dokumen */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>{teacherInfo ? '4' : '3'}. Tempat &amp; Titimangsa Pengesahan Dokumen</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kota Penetapan
                </label>
                <input
                  type="text"
                  value={schoolCity}
                  onChange={(e) => setSchoolCity(e.target.value)}
                  placeholder="Kota Balikpapan / Kota Samarinda / Kota Pendidikan"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Format Tanggal Dokumen
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="dateMode"
                      checked={useTodayDate}
                      onChange={() => setUseTodayDate(true)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium text-slate-700">
                      Otomatis: Tanggal Hari Ini ({todayFormatted})
                    </span>
                  </label>

                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="dateMode"
                      checked={!useTodayDate}
                      onChange={() => setUseTodayDate(false)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium text-slate-700">Tanggal Kustom / Tertanggal Khusus:</span>
                  </label>

                  {!useTodayDate && (
                    <input
                      type="text"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      placeholder="Contoh: 21 Oktober 2026"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white mt-1"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Live Visual Preview of Signature Block */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Simulasi Pratinjau Lembar Pengesahan:</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Tampilan presisi cetak PDF &amp; Word</span>
            </div>

            <div className="bg-slate-50/70 p-4 rounded-lg border border-slate-200 font-serif text-xs text-slate-800">
              <div
                className={`grid ${
                  teacherInfo && includeTeacherSignature ? 'grid-cols-3' : 'grid-cols-2'
                } gap-4 text-center sm:text-left`}
              >
                {/* Kolom 1: Mengetahui */}
                <div>
                  <p className="text-slate-600">Mengetahui,</p>
                  <p className="font-medium text-slate-700 line-clamp-2">
                    {pengawasPembinaRole || 'Koordinator Pengawas / Kepala Dinas Pendidikan'}
                  </p>
                  <div className="h-12 flex items-center justify-center sm:justify-start text-[10px] text-slate-400 italic">
                    (Tanda Tangan &amp; Stempel)
                  </div>
                  <p className="font-bold underline text-slate-900">
                    {pengawasPembinaName || 'Dr. Hj. Endang Sulastri, M.Pd.'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    NIP. {pengawasPembinaNip || '-'}
                  </p>
                </div>

                {/* Kolom 2: Guru (jika diaktifkan) */}
                {teacherInfo && includeTeacherSignature && (
                  <div className="text-left px-2 border-l border-slate-200">
                    <p className="text-slate-600">Guru yang Disupervisi,</p>
                    <p className="font-medium text-slate-700">
                      Guru Mata Pelajaran
                    </p>
                    <div className="h-12 flex items-center text-[10px] text-slate-400 italic">
                      (Tanda Tangan)
                    </div>
                    <p className="font-bold underline text-slate-900">
                      {teacherInfo.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      NIP. {teacherInfo.nip || '-'}
                    </p>
                  </div>
                )}

                {/* Kolom Terakhir: Pengawas Sekolah */}
                <div className="text-left pl-3 border-l border-slate-200">
                  <p className="text-slate-600">
                    {schoolCity || 'Kota Pendidikan'}, {effectiveDate}
                  </p>
                  <p className="font-medium text-slate-700">
                    {supervisorRole || 'Pengawas Sekolah Pembina'},
                  </p>
                  <div className="h-12 flex items-center text-[10px] text-slate-400 italic">
                    (Tanda Tangan)
                  </div>
                  <p className="font-bold underline text-slate-900">
                    {supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    NIP. {supervisorNip || '19820415 200801 1 007'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kembalikan ke Standar Resmi</span>
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>

              {onPrintAfterSave && (
                <button
                  type="button"
                  onClick={handleSaveAndPrint}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all cursor-pointer shadow-2xs"
                >
                  <Printer className="w-4 h-4 text-emerald-600" />
                  <span>Simpan &amp; Cetak PDF</span>
                </button>
              )}

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Simpan &amp; Terapkan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
