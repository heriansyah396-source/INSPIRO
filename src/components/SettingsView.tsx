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
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { AppSettings } from '../types/inspiro';
import { DEFAULT_SIDRAP_LOGO, DEFAULT_TUTWURI_LOGO } from '../data/defaultLogos';
import {
  exportDataAsJson,
  importDataFromJson,
  updateManagedAccountPassword
} from '../utils/storage';
import { UserRoleProfile } from '../services/firebase';

interface SettingsViewProps {
  settings: AppSettings;
  currentUser?: UserRoleProfile | null;
  onSaveSettings: (settings: AppSettings) => void;
  onResetDemoData: () => void;
  onDataImported: () => void;
  onOpenManagePrincipals?: () => void;
  showToast: (title: string, desc?: string, type?: 'success' | 'warning' | 'error') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  currentUser,
  onSaveSettings,
  onResetDemoData,
  onDataImported,
  onOpenManagePrincipals,
  showToast
}) => {
  const [formData, setFormData] = useState<AppSettings>({
    ...settings,
    supervisorRank: settings.supervisorRank || 'Penata Tk. I / III.d'
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoLeftInputRef = useRef<HTMLInputElement>(null);
  const logoRightInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData({
      ...settings,
      supervisorRank: settings.supervisorRank || 'Penata Tk. I / III.d'
    });
  }, [settings]);

  // Handle upload logo (JPG / PNG) with canvas auto-optimization
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'left' | 'right') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Format Tidak Didukung', 'Harap pilih berkas gambar (JPG, JPEG, PNG, atau WEBP).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Optimize and resize to keep under 100KB for localStorage
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        let w = img.width;
        let h = img.height;
        if (w > h && w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else if (h > maxDim) {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressedDataUrl = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.9);
          if (side === 'left') {
            setFormData(prev => ({ ...prev, logoUrl: compressedDataUrl }));
            showToast('Logo Kop Daerah Berhasil Diunggah', 'Logo Kabupaten Sidenreng Rappang berhasil diperbarui.', 'success');
          } else {
            setFormData(prev => ({ ...prev, logoRightUrl: compressedDataUrl }));
            showToast('Logo Sisi Kanan Berhasil Diunggah', 'Logo Tut Wuri / Sekolah berhasil diperbarui.', 'success');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      showToast('Kata Sandi Kosong', 'Silakan masukkan kata sandi baru.', 'warning');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Terlalu Pendek', 'Kata sandi minimal 6 karakter untuk keamanan.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Tidak Cocok', 'Konfirmasi kata sandi tidak sama dengan kata sandi baru.', 'error');
      return;
    }

    const targetEmail = currentUser?.email || 'heriansyah396@gmail.com';
    const success = updateManagedAccountPassword(targetEmail, newPassword);
    if (success) {
      showToast(
        'Kata Sandi Diperbarui',
        'Kata sandi Pengawas berhasil diubah secara aman. Hanya Anda yang memiliki akses login ini.',
        'success'
      );
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPass(false);
    } else {
      showToast('Gagal Memperbarui', 'Akun tidak ditemukan di sistem lokal.', 'error');
    }
  };

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
                Pemerintah Daerah / Instansi Pembina (Baris Pertama Kop Surat)
              </label>
              <input
                type="text"
                value={formData.governmentAgency || ''}
                onChange={(e) => setFormData({ ...formData, governmentAgency: e.target.value })}
                placeholder="Contoh: PEMERINTAH KABUPATEN SIDENRENG RAPPANG"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Akan tercetak sebagai baris teratas pada seluruh Kop Surat resmi kedinasan, lembar instrumen, dan ekspor dokumen.
              </p>
            </div>

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

        {/* LOGO & KOP SURAT KEDINASAN CARD */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <ImageIcon className="w-4 h-4 text-amber-600" />
              <span>Logo &amp; Lambang Kop Surat Kedinasan (JPG / PNG)</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              Format: JPG, JPEG, PNG, WEBP
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Logo ini akan otomatis dicetak pada Kop Surat resmi di seluruh dokumen aplikasi (Surat Kunjungan Supervisi Manajerial, Rekapitulasi Data Kepala Sekolah, Instrumen 8 Standar, dan Laporan Supervisi Akademik) baik pada format <strong>Cetak PDF</strong> maupun <strong>Ekspor Microsoft Word (.doc)</strong>.
          </p>

          {/* Hidden File Inputs */}
          <input
            type="file"
            ref={logoLeftInputRef}
            onChange={(e) => handleLogoUpload(e, 'left')}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
          />
          <input
            type="file"
            ref={logoRightInputRef}
            onChange={(e) => handleLogoUpload(e, 'right')}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            {/* Logo Kiri: Logo Kabupaten Sidenreng Rappang */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Logo Kiri (Pemda / Kab. Sidenreng Rappang)
                </span>
                {formData.logoUrl && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    Aktif
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white rounded-lg border-2 border-dashed border-slate-300 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Logo Kabupaten Sidenreng Rappang"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400 text-center">Tanpa Logo</span>
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  <button
                    type="button"
                    onClick={() => logoLeftInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo (JPG / PNG)</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logoUrl: DEFAULT_SIDRAP_LOGO })}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md text-[11px] font-medium transition-colors cursor-pointer"
                      title="Gunakan Lambang Resmi Kabupaten Sidenreng Rappang Default"
                    >
                      <RefreshCw className="w-3 h-3 text-slate-500" />
                      <span>Lambang Sidrap</span>
                    </button>
                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logoUrl: undefined })}
                        className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Hapus Logo Kiri"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Logo Kanan: Logo Tut Wuri Handayani / Sekolah */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Logo Kanan (Tut Wuri / Logo Sekolah)
                </span>
                {formData.logoRightUrl && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    Aktif
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white rounded-lg border-2 border-dashed border-slate-300 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                  {formData.logoRightUrl ? (
                    <img
                      src={formData.logoRightUrl}
                      alt="Logo Tut Wuri / Sekolah"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400 text-center">Tanpa Logo</span>
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  <button
                    type="button"
                    onClick={() => logoRightInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo (JPG / PNG)</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logoRightUrl: DEFAULT_TUTWURI_LOGO })}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md text-[11px] font-medium transition-colors cursor-pointer"
                      title="Gunakan Logo Tut Wuri Handayani Default"
                    >
                      <RefreshCw className="w-3 h-3 text-slate-500" />
                      <span>Tut Wuri Handayani</span>
                    </button>
                    {formData.logoRightUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logoRightUrl: undefined })}
                        className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Hapus Logo Kanan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* LIVE KOP SURAT PREVIEW */}
          <div className="mt-4 pt-3 border-t border-slate-200">
            <span className="block text-xs font-bold text-slate-700 mb-2">
              Pratinjau Hasil Tampilan Kop Surat Kedinasan:
            </span>
            <div className="p-4 bg-white rounded-lg border-2 border-slate-300 text-slate-900 font-serif shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b-4 border-double border-slate-900 gap-3">
                {/* Logo Kiri */}
                <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Logo Kabupaten"
                      className="max-h-16 max-w-16 object-contain"
                    />
                  ) : (
                    <div className="w-14 h-14 border border-dashed border-slate-300 rounded text-[9px] text-slate-400 flex items-center justify-center text-center">
                      Logo Kiri
                    </div>
                  )}
                </div>

                {/* Teks Kop Tengah */}
                <div className="flex-1 text-center font-serif px-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 leading-tight">
                    {formData.governmentAgency || 'PEMERINTAH KABUPATEN SIDENRENG RAPPANG'}
                  </h3>
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 mt-0.5 leading-tight">
                    DINAS PENDIDIKAN DAN KEBUDAYAAN
                  </h2>
                  <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-800 mt-0.5">
                    KOORDINATOR PENGAWAS SEKOLAH MENENGAH PERTAMA
                  </h4>
                  <p className="text-[9px] text-slate-600 italic mt-0.5 font-sans">
                    Alamat: Kompleks SKPD Jl. Harapan Baru No. 1, Pangkajene, Kab. Sidenreng Rappang, Sulawesi Selatan (91611)
                  </p>
                </div>

                {/* Logo Kanan */}
                <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                  {formData.logoRightUrl ? (
                    <img
                      src={formData.logoRightUrl}
                      alt="Logo Tut Wuri"
                      className="max-h-16 max-w-16 object-contain"
                    />
                  ) : (
                    <div className="w-14 h-14 border border-dashed border-slate-300 rounded text-[9px] text-slate-400 flex items-center justify-center text-center">
                      Logo Kanan
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pejabat Penilai / Supervisor & Pengawas Penandatangan */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Profil Pengawas Penandatangan Dokumen &amp; Pejabat Penilai</span>
            </div>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
              Tercetak di Surat Kunjungan &amp; Lembar Laporan
            </span>
          </div>

          {/* Bagian 1: Data Pengawas Utama (Penandatangan Surat Kunjungan & Laporan) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Identitas Pengawas Sekolah (Penandatangan Utama)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Nama Pengawas */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap &amp; Gelar Pengawas
                </label>
                <input
                  type="text"
                  value={formData.supervisorName}
                  onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                  placeholder="Contoh: HERIANSYAH, S.Si., S.Pd., M.Pd"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                />
              </div>

              {/* NIP Pengawas */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    NIP Pengawas
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, supervisorNip: '19830819 201001 1 002' })}
                    className="text-[10px] text-blue-600 hover:underline font-semibold cursor-pointer"
                    title="Gunakan format standar 19830819 201001 1 002"
                  >
                    Format Standar
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.supervisorNip}
                  onChange={(e) => setFormData({ ...formData, supervisorNip: e.target.value })}
                  placeholder="19830819 201001 1 002"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-medium"
                />
                <div className="flex items-center gap-1 mt-1">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, supervisorNip: '19830819 201001 1 002' })}
                    className="text-[9.5px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                  >
                    19830819 201001 1 002
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, supervisorNip: '19830819201001102' })}
                    className="text-[9.5px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                  >
                    19830819201001102
                  </button>
                </div>
              </div>

              {/* Pangkat / Golongan Ruang */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pangkat / Golongan Ruang
                </label>
                <input
                  type="text"
                  list="rank-options-settings"
                  value={formData.supervisorRank || ''}
                  onChange={(e) => setFormData({ ...formData, supervisorRank: e.target.value })}
                  placeholder="Contoh: Penata Tk. I / III.d"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-blue-900"
                />
                <datalist id="rank-options-settings">
                  <option value="Penata Tk. I / III.d" />
                  <option value="Penata / III.c" />
                  <option value="Penata Muda Tk. I / III.b" />
                  <option value="Penata Muda / III.a" />
                  <option value="Pembina / IV.a" />
                  <option value="Pembina Tk. I / IV.b" />
                  <option value="Pembina Utama Muda / IV.c" />
                  <option value="Pembina Utama Madya / IV.d" />
                  <option value="Pembina Utama / IV.e" />
                </datalist>
                <div className="flex flex-wrap gap-1 mt-1">
                  {['Penata Tk. I / III.d', 'Pembina / IV.a', 'Pembina Tk. I / IV.b'].map((rank) => (
                    <button
                      key={rank}
                      type="button"
                      onClick={() => setFormData({ ...formData, supervisorRank: rank })}
                      className={`text-[9.5px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                        (formData.supervisorRank || '') === rank
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {rank}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Jabatan Pengawas Penandatangan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jabatan Kedinasan Pengawas
                </label>
                <input
                  type="text"
                  list="role-options-settings"
                  value={formData.supervisorRole}
                  onChange={(e) => setFormData({ ...formData, supervisorRole: e.target.value })}
                  placeholder="Contoh: Pengawas Sekolah Pembina"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
                <datalist id="role-options-settings">
                  <option value="Pengawas Sekolah Pembina" />
                  <option value="Pengawas Sekolah Muda" />
                  <option value="Pengawas Sekolah Madya" />
                  <option value="Pengawas Sekolah Utama" />
                  <option value="Pengawas Sekolah" />
                  <option value="Kepala Sekolah" />
                </datalist>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {['Pengawas Sekolah Pembina', 'Pengawas Sekolah Muda', 'Pengawas Sekolah'].map((r) => (
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

              {/* LIVE PREVIEW TANDA TANGAN DOKUMEN */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs font-sans">
                <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Pratinjau Blok Tanda Tangan Dokumen:
                </span>
                <div className="bg-white p-3 border border-slate-300 rounded shadow-2xs space-y-0.5 text-center sm:text-left">
                  <p className="text-[11px] text-slate-600">
                    {formData.schoolCity || 'Kabupaten Sidenreng Rappang'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="font-bold text-[11px] text-slate-900">
                    {formData.supervisorRole || 'Pengawas Sekolah Pembina'},
                  </p>
                  <div className="h-9 flex items-center justify-center sm:justify-start">
                    <span className="text-[10px] italic text-slate-400">[Tanda Tangan &amp; Cap Kedinasan]</span>
                  </div>
                  <p className="font-bold underline text-[12px] text-slate-950">
                    {formData.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'}
                  </p>
                  <p className="text-[11px] text-slate-800 font-mono">
                    NIP. {formData.supervisorNip || '19830819 201001 1 002'}
                  </p>
                  <p className="text-[10.5px] text-slate-600 font-semibold">
                    Pangkat/Golongan: {formData.supervisorRank || 'Penata Tk. I / III.d'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bagian 2: Data Pejabat Atasan / Pengawas Pembina Kedua */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              Data Koordinator Pengawas / Pejabat Atasan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Koordinator Pengawas / Kepala Dinas
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
                  NIP Koordinator / Kepala Dinas
                </label>
                <input
                  type="text"
                  value={formData.pengawasPembinaNip}
                  onChange={(e) => setFormData({ ...formData, pengawasPembinaNip: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
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

      {/* Keamanan Akun & Kata Sandi Pengawas */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Keamanan Akun & Kata Sandi Pengawas</span>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
            Akses Terproteksi
          </span>
        </div>

        <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed space-y-1">
            <p>
              Akun Pengawas Anda (<strong className="text-emerald-900">{currentUser?.email || 'heriansyah396@gmail.com'}</strong>) bersifat pribadi. Hanya Anda yang memiliki akses ke akun ini.
            </p>
            <p className="text-[11px] text-emerald-800">
              Gunakan formulir di bawah ini untuk memperbarui kata sandi Anda agar keamanan akun tetap terjaga.
            </p>
          </div>
        </div>

        {!isChangingPass ? (
          <div className="flex items-center justify-between pt-1">
            <div className="text-xs text-slate-500">
              Ingin mengganti kata sandi login Pengawas? Klik tombol untuk mengubahnya.
            </div>
            <button
              type="button"
              onClick={() => setIsChangingPass(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Ganti Kata Sandi Pengawas</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-3.5 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Formulir Pembaruan Kata Sandi Pengawas</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsChangingPass(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
              >
                Batal
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Kata Sandi Baru *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Sembunyikan' : 'Lihat'}</span>
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Konfirmasi Kata Sandi Baru *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPass(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Kata Sandi Baru</span>
              </button>
            </div>
          </form>
        )}
      </div>

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
            <div className="font-extrabold text-slate-900 text-sm">HERIANSYAH, S.Si., S.Pd., M.Pd</div>
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
