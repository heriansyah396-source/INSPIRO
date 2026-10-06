/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Lock,
  User,
  School,
  Mail,
  ShieldCheck,
  CheckCircle2,
  LogIn,
  UserPlus,
  Cloud
} from 'lucide-react';
import {
  loginWithEmail,
  registerWithEmail,
  signInWithGoogle,
  UserRoleProfile
} from '../services/firebase';
import { authenticateUser } from '../utils/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserRoleProfile | null;
  onSuccess: (profile: UserRoleProfile) => void;
  showToast: (title: string, desc?: string, type?: 'success' | 'warning' | 'error') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
  showToast
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'pengawas' | 'kepala_sekolah'>('kepala_sekolah');
  const [schoolName, setSchoolName] = useState('SMP Negeri 1 Merdeka Nusantara');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const profile = await signInWithGoogle();
      onSuccess(profile);
      showToast(
        'Login Berhasil (Google)',
        `Selamat datang, ${profile.name} (${profile.role === 'pengawas' ? 'Pengawas Sekolah' : 'Kepala Sekolah'}). Data otomatis tersinkronisasi ke Cloud.`,
        'success'
      );
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('Gagal login dengan Google. Pastikan popup tidak diblokir browser.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Email dan password wajib diisi');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      if (mode === 'login') {
        const local = authenticateUser(email, password);
        if (local) {
          const profile: UserRoleProfile = {
            uid: local.id,
            email: local.email,
            name: local.name,
            role: local.role,
            nip: local.nip,
            schoolName: local.schoolName,
            createdAt: local.createdAt
          };
          onSuccess(profile);
          showToast('Login Berhasil', `Masuk sebagai ${profile.name}`, 'success');
          onClose();
          return;
        }

        const profile = await loginWithEmail(email, password);
        onSuccess(profile);
        showToast('Login Berhasil', `Masuk sebagai ${profile.name}`, 'success');
      } else {
        if (!name.trim()) {
          setErrorMsg('Nama lengkap wajib diisi');
          setLoading(false);
          return;
        }
        const profile = await registerWithEmail(email, password, name, role, schoolName);
        onSuccess(profile);
        showToast('Akun Dibuat', `Akun ${profile.name} berhasil didaftarkan di Cloud.`, 'success');
      }
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan autentikasi';
      if (msg.includes('auth/operation-not-allowed')) {
        setErrorMsg('Metode Email/Password belum diaktifkan di Firebase Console. Silakan gunakan tombol Google Login di atas yang sudah aktif otomatis!');
      } else if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setErrorMsg('Email atau password salah.');
      } else if (msg.includes('email-already-in-use')) {
        setErrorMsg('Email sudah terdaftar. Silakan pilih tab Masuk.');
      } else {
        setErrorMsg(`Gagal masuk: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Cloud className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Akses Cloud Database & Akun INSPIRO
              </h3>
              <p className="text-xs text-slate-500">
                Hubungkan Pengawas & Kepala Sekolah Binaan secara online
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

        <div className="p-5 space-y-4">
          {/* Quick Google Sign In */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Menghubungkan...' : 'Masuk dengan Akun Google / Belajar.id'}</span>
            </button>
            <p className="text-[10px] text-center text-slate-500">
              Rekomendasi resmi: langsung aktif instan tanpa perlu verifikasi email/password.
            </p>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-slate-200"></div>
            <span className="shrink mx-2 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              atau gunakan email & password
            </span>
            <div className="grow border-t border-slate-200"></div>
          </div>

          {/* Toggle Tab */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Masuk Akun
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setRole('pengawas');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'register' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daftar (Khusus Pengawas)
            </button>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-700 leading-relaxed">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-3">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap & Gelar
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Heriansyah., S.Si., S.Pd., M.Pd"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Peran (Terkunci)</label>
                    <div className="px-2.5 py-2 text-xs rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Pengawas Sekolah</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Wilayah / Satuan Binaan
                    </label>
                    <input
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="Dinas Pendidikan / Binaan"
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Email (Akun Dinas / Belajar.id)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@sekolah.sch.id / guru.belajar.id"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi (Password)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>{loading ? 'Memproses...' : mode === 'login' ? 'Masuk ke Sistem Cloud' : 'Daftarkan Akun Baru'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
