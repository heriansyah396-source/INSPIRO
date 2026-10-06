/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Users,
  UserPlus,
  ShieldCheck,
  School,
  Lock,
  Mail,
  Trash2,
  Copy,
  Check,
  Key
} from 'lucide-react';
import { ManagedAccount } from '../types/inspiro';
import { addManagedAccount, deleteManagedAccount, getManagedAccounts } from '../utils/storage';
import { registerWithEmail } from '../services/firebase';

interface AccountManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (title: string, desc?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const AccountManagerModal: React.FC<AccountManagerModalProps> = ({
  isOpen,
  onClose,
  showToast
}) => {
  const [accounts, setAccounts] = useState<ManagedAccount[]>(getManagedAccounts());
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Account Form Fields
  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('kepsek123');
  const [role, setRole] = useState<'kepala_sekolah' | 'pengawas'>('kepala_sekolah');

  if (!isOpen) return null;

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      showToast('Form Belum Lengkap', 'Nama, email, dan password wajib diisi.', 'warning');
      return;
    }

    const newAcc = addManagedAccount({
      name: name.trim(),
      nip: nip.trim() || '-',
      schoolName: schoolName.trim() || 'Sekolah Binaan',
      email: email.trim().toLowerCase(),
      password,
      role
    });

    // Try also registering to Firebase in background if possible
    try {
      await registerWithEmail(email.trim(), password, name.trim(), role, schoolName.trim());
    } catch (e) {
      // If already registered or offline, local sync already guarantees instant login
      console.warn('Cloud registration background status:', e);
    }

    setAccounts(getManagedAccounts());
    setShowAddForm(false);
    setName('');
    setNip('');
    setSchoolName('');
    setEmail('');
    setPassword('kepsek123');

    showToast(
      'Akun Berhasil Didaftarkan!',
      `Akun untuk ${newAcc.name} (${newAcc.schoolName}) telah aktif dan siap digunakan login.`,
      'success'
    );
  };

  const handleDelete = (id: string, accName: string) => {
    if (window.confirm(`Hapus akun login untuk ${accName}?`)) {
      deleteManagedAccount(id);
      setAccounts(getManagedAccounts());
      showToast('Akun Dihapus', `Akun ${accName} berhasil dihapus dari sistem.`, 'info');
    }
  };

  const handleCopyCredentials = (acc: ManagedAccount) => {
    const text = `INFORMASI AKUN SUPERVISI INSPIRO:\nNama: ${acc.name}\nSekolah: ${acc.schoolName}\nEmail: ${acc.email}\nPassword: ${acc.password || 'pengawas123'}\nURL Aplikasi: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedId(acc.id);
    showToast('Disalin ke Clipboard', 'Informasi akun disalin, siap dikirim ke Kepala Sekolah.', 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Kelola Akun Login Kepala Sekolah Binaan
              </h3>
              <p className="text-xs text-slate-500">
                Hak Otoritas Pengawas: Daftarkan dan bagikan kata sandi ke Kepala Sekolah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Top Info Banner */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-xl text-xs text-blue-900 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <Key className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed text-[11px]">
                Hanya akun yang Anda daftarkan di sini yang dapat masuk ke INSPIRO. Anda dapat membuatkan akun untuk setiap Kepala Sekolah binaan Anda dan memberikan password-nya.
              </div>
            </div>
            {!showAddForm && (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Buat Akun Baru</span>
              </button>
            )}
          </div>

          {/* Create Form */}
          {showAddForm && (
            <form onSubmit={handleCreateAccount} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <span>Daftarkan Akun Kepala Sekolah Baru</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Batal
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nama Kepala Sekolah & Gelar <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Dra. Hj. Siti Fatimah, M.Pd."
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    NIP / NUPTK Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="1975xxxx xxxxx x xxx"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nama Sekolah Binaan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Contoh: SMP Negeri 3 Merdeka"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Peran Pengguna
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                  >
                    <option value="kepala_sekolah">Kepala Sekolah</option>
                    <option value="pengawas">Pengawas Sekolah Rekan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Email Login (Username) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kepsek.smpn3@belajar.id"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Kata Sandi (Password yang Diberikan) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs"
                >
                  Simpan & Terbitkan Akun
                </button>
              </div>
            </form>
          )}

          {/* Accounts Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3.5 font-semibold">Nama & NIP</th>
                  <th className="py-2.5 px-3.5 font-semibold">Sekolah Binaan</th>
                  <th className="py-2.5 px-3.5 font-semibold">Email & Sandi</th>
                  <th className="py-2.5 px-3.5 font-semibold">Peran</th>
                  <th className="py-2.5 px-3.5 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-900">{acc.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">NIP: {acc.nip}</div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="text-slate-800 font-medium">{acc.schoolName}</div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="text-slate-900 font-mono">{acc.email}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        pass: <strong className="text-slate-800">{acc.password || '******'}</strong>
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          acc.role === 'pengawas'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {acc.role === 'pengawas' ? 'Pengawas' : 'Kepala Sekolah'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyCredentials(acc)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                          title="Salin Data Akun untuk Dikirim ke Kepala Sekolah"
                        >
                          {copiedId === acc.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {acc.role !== 'pengawas' && (
                          <button
                            type="button"
                            onClick={() => handleDelete(acc.id, acc.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Hapus Akun"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
