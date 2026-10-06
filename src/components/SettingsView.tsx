/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Settings,
  School,
  UserCheck,
  Download,
  Upload,
  RotateCcw,
  Save,
  CheckCircle2,
  Database,
  KeyRound,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { AppSettings } from '../types/inspiro';
import {
  exportDataAsJson,
  importDataFromJson
} from '../utils/storage';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onResetDemoData: () => void;
  onDataImported: () => void;
  onOpenManagePrincipals?: () => void;
  showToast: (title: string, desc?: string, type?: 'success' | 'warning' | 'error') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetDemoData,
  onDataImported,
  onOpenManagePrincipals,
  showToast
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    showToast('Pengaturan Disimpan', 'Identitas sekolah dan pengawas berhasil diperbarui.', 'success');
  };

  const handleExportJson = () => {
    const jsonStr = exportDataAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_inspiro_supervisi_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Cadangan Diunduh', 'File backup JSON berhasil disimpan ke perangkat Anda.', 'success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importDataFromJson(content);
        if (result.success) {
          onDataImported();
          showToast('Data Dipulihkan', result.message, 'success');
        } else {
          showToast('Gagal Memulihkan', result.message, 'error');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <span>Pengaturan Sistem Supervisi</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Kelola profil identitas sekolah, supervisor default, serta pencadangan data offline.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Satuan Pendidikan Card */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center gap-2 text-slate-800 font-bold text-sm">
            <School className="w-4 h-4 text-blue-600" />
            <span>Identitas Satuan Pendidikan (Kop Resmi)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Resmi Satuan Pendidikan / Sekolah
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Pokok Sekolah Nasional (NPSN)
              </label>
              <input
                type="text"
                value={formData.schoolNpsn}
                onChange={(e) => setFormData({ ...formData, schoolNpsn: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kabupaten / Kota
              </label>
              <input
                type="text"
                value={formData.schoolCity}
                onChange={(e) => setFormData({ ...formData, schoolCity: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Lengkap Sekolah
              </label>
              <input
                type="text"
                value={formData.schoolAddress}
                onChange={(e) => setFormData({ ...formData, schoolAddress: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Pejabat Penilai / Supervisor */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center gap-2 text-slate-800 font-bold text-sm">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>Data Pejabat Penilai & Pengawas Pembina</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Supervisor Default & Gelar
              </label>
              <input
                type="text"
                value={formData.supervisorName}
                onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIP Supervisor
              </label>
              <input
                type="text"
                value={formData.supervisorNip}
                onChange={(e) => setFormData({ ...formData, supervisorNip: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jabatan Supervisor
              </label>
              <input
                type="text"
                list="role-options-settings"
                value={formData.supervisorRole}
                onChange={(e) => setFormData({ ...formData, supervisorRole: e.target.value })}
                placeholder="Contoh: Pengawas Sekolah"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <datalist id="role-options-settings">
                <option value="Pengawas Sekolah" />
                <option value="Pengawas Sekolah Pembina" />
                <option value="Kepala Sekolah" />
                <option value="Wakil Kepala Sekolah / Tim Supervisi" />
                <option value="Guru Senior / Penilai" />
              </datalist>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['Pengawas Sekolah', 'Kepala Sekolah', 'Guru Senior'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData({ ...formData, supervisorRole: r })}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                      formData.supervisorRole === r
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Pengawas Pembina Sekolah
              </label>
              <input
                type="text"
                value={formData.pengawasPembinaName}
                onChange={(e) => setFormData({ ...formData, pengawasPembinaName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIP Pengawas Pembina
              </label>
              <input
                type="text"
                value={formData.pengawasPembinaNip}
                onChange={(e) => setFormData({ ...formData, pengawasPembinaNip: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Profil Pengaturan</span>
            </button>
          </div>
        </div>
      </form>

      {/* Manajemen Akun Kepala Sekolah Binaan (Otoritas Pengawas) */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <KeyRound className="w-4 h-4 text-amber-600" />
            <span>Manajemen Akun Kepala Sekolah Binaan</span>
          </div>
          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
            Wewenang Pengawas
          </span>
        </div>

        <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Hanya Pengawas Sekolah yang berwenang mendaftarkan akun di sistem. Anda dapat membuatkan username dan password khusus bagi Kepala Sekolah di sekolah-sekolah binaan Anda agar mereka dapat melihat hasil supervisi sekolahnya masing-masing.
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-slate-500">
            Terbitkan kata sandi dan bagikan rincian login ke Kepala Sekolah binaan melalui WhatsApp atau surat dinas.
          </div>
          {onOpenManagePrincipals && (
            <button
              type="button"
              onClick={onOpenManagePrincipals}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Buka Kelola Akun Kepsek</span>
            </button>
          )}
        </div>
      </div>

      {/* Cadangan & Pemulihan Data */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center gap-2 text-slate-800 font-bold text-sm">
          <Database className="w-4 h-4 text-blue-600" />
          <span>Cadangan, Pemulihan & Reset Data (Local Storage)</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Seluruh data guru, nilai 12 indikator, catatan refleksi, dan rencana tindak lanjut disimpan secara aman di
          peramban Anda (Local Storage). Anda dapat mengunduh berkas cadangan kapan saja atau memindahkannya ke komputer lain.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Download Backup */}
          <button
            type="button"
            onClick={handleExportJson}
            className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 flex flex-col items-center text-center gap-1.5 transition-colors cursor-pointer group"
          >
            <Download className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800">Unduh Cadangan JSON</span>
            <span className="text-[11px] text-slate-500">Ekspor seluruh data supervisi</span>
          </button>

          {/* Import Backup */}
          <label className="p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 flex flex-col items-center text-center gap-1.5 transition-colors cursor-pointer group">
            <Upload className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800">Pulihkan dari Berkas</span>
            <span className="text-[11px] text-slate-500">Unggah berkas cadangan JSON</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </label>

          {/* Reset Demo Data */}
          <button
            type="button"
            onClick={onResetDemoData}
            className="p-3 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 flex flex-col items-center text-center gap-1.5 transition-colors cursor-pointer group"
          >
            <RotateCcw className="w-5 h-5 text-rose-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800">Reset ke Data Contoh</span>
            <span className="text-[11px] text-slate-500">Kembalikan 5 guru & 3 supervisi</span>
          </button>
        </div>
      </div>

      {/* Informasi Sistem & Pengembang */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Informasi Aplikasi & Pengembang</span>
          </div>
          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
            INSPIRO v1.0
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Pengembang Sistem</span>
            <div className="font-extrabold text-slate-900 text-sm">Heriansyah, S.Si., S.Pd., M.Pd</div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Pengawas Sekolah & Pengembang Aplikasi Penjaminan Mutu Supervisi Akademik Kurikulum Merdeka.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Standar Instrumen</span>
            <div className="font-bold text-slate-900">Kurikulum Merdeka & Praktik Pedagogis (PM)</div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Mencakup 12 Indikator Observasi Kelas, Format Dokumen Kedinasan A4, dan Rubrik 4 Dimensi Evaluasi PM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
