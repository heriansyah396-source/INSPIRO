/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  School,
  KeyRound,
  UserPlus,
  Trash2,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { ManagedAccount } from '../types/inspiro';
import {
  getManagedAccounts,
  addManagedAccount,
  deleteManagedAccount
} from '../utils/storage';

interface ManagePrincipalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (title: string, desc?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const ManagePrincipalsModal: React.FC<ManagePrincipalsModalProps> = ({
  isOpen,
  onClose,
  showToast
}) => {
  const [accounts, setAccounts] = useState<ManagedAccount[]>(() =>
    getManagedAccounts().filter((a) => a.role === 'kepala_sekolah')
  );

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('kepsek123');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const refreshAccounts = () => {
    setAccounts(getManagedAccounts().filter((a) => a.role === 'kepala_sekolah'));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      showToast('Data Belum Lengkap', 'Nama, Email/Username, dan Kata Sandi wajib diisi.', 'warning');
      return;
    }

    addManagedAccount({
      name: name.trim(),
      nip: nip.trim(),
      email: email.trim(),
      password: password.trim(),
      schoolName: schoolName.trim() || 'Sekolah Binaan',
      role: 'kepala_sekolah'
    });

    refreshAccounts();
    setIsAdding(false);
    setName('');
    setNip('');
    setSchoolName('');
    setEmail('');
    setPassword('kepsek123');
    showToast('Akun Kepala Sekolah Dibuat', `Akun untuk ${name} berhasil didaftarkan.`, 'success');
  };

  const handleDelete = (id: string, accName: string) => {
    if (confirm(`Hapus akses login untuk ${accName}?`)) {
      deleteManagedAccount(id);
      refreshAccounts();
      showToast('Akun Dihapus', `Akses ${accName} telah dicabut.`, 'info');
    }
  };

  const handleCopyCredentials = (acc: ManagedAccount) => {
    const text = `*AKUN LOGIN SUPERVISI INSPIRO*\nSekolah: ${acc.schoolName}\nNama: ${acc.name}\nEmail/User: ${acc.email}\nKata Sandi: ${acc.password || 'kepsek123'}\nSilakan login di portal INSPIRO untuk melihat instrumen dan hasil supervisi akademik.`;
    navigator.clipboard.writeText(text);
    setCopiedId(acc.id);
    showToast('Disalin ke Clipboard', 'Detail login telah disalin. Siap dikirim ke Kepala Sekolah.', 'success');
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <School className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Manajemen Akun Kepala Sekolah Binaan</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 font-extrabold px-2 py-0.5 rounded-full">
                  Otoritas Pengawas
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Pengawas Sekolah dapat membuatkan User & Password untuk Kepala Sekolah binaan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Explanation Box */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/70 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              Sebagai Pengawas Sekolah, Anda berwenang membuatkan akun bagi Kepala Sekolah binaan Anda agar mereka dapat masuk dan melihat lembar instrumen, hasil supervisi, dan rencana tindak lanjut sekolahnya.
            </div>
          </div>

          {/* Action button */}
          {!isAdding && (
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Daftar Akun Kepala Sekolah ({accounts.length})
              </h4>
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Buat Akun Kepala Sekolah</span>
              </button>
            </div>
          )}

          {/* Form to Add New Account */}
          {isAdding && (
            <form onSubmit={handleCreate} className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-blue-100">
                <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <span>Tambah User & Password Kepala Sekolah Baru</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-medium cursor-pointer"
                >
                  Batal
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Kepala Sekolah & Gelar *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Dra. Hj. Nurhasanah, M.Pd."
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIP Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="19720815 199802 2 003"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Satuan Pendidikan / Sekolah Binaan *
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="SMP Negeri 1 Merdeka Nusantara"
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username / Email Login *
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kepsek.smpn1@belajar.id atau kepsek_smpn1"
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kata Sandi (Password) *
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Simpan & Terbitkan Akun
                </button>
              </div>
            </form>
          )}

          {/* Accounts List */}
          <div className="space-y-2.5">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{acc.name}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      Kepala Sekolah
                    </span>
                  </div>
                  <div className="text-xs text-blue-700 font-medium flex items-center gap-1">
                    <School className="w-3.5 h-3.5" />
                    <span>{acc.schoolName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                    <span>User: <strong className="text-slate-800">{acc.email}</strong></span>
                    <span>•</span>
                    <span>Sandi: <strong className="text-slate-800">{acc.password || '••••••'}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyCredentials(acc)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    title="Salin rincian login untuk dikirimkan via WhatsApp"
                  >
                    {copiedId === acc.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 text-[11px]">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-[11px]">Salin Akses</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(acc.id, acc.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Hapus akun"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {accounts.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs">
                Belum ada akun Kepala Sekolah yang didaftarkan.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
