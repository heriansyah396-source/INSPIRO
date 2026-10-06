/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  Building2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { ManagedAccount } from '../types/inspiro';
import { authenticateUser, getManagedAccounts } from '../utils/storage';
import { signInWithGoogle, UserRoleProfile } from '../services/firebase';

interface LoginScreenProps {
  onLoginSuccess: (user: ManagedAccount | UserRoleProfile) => void;
  showToast: (title: string, desc?: string, type?: 'success' | 'warning' | 'error') => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  showToast
}) => {
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const accounts = getManagedAccounts();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!emailOrUser.trim() || !password) {
      setErrorMsg('Silakan masukkan email/username dan kata sandi Anda.');
      return;
    }

    setIsLoading(true);

    // Verify against managed accounts
    const matched = authenticateUser(emailOrUser, password);

    setTimeout(() => {
      setIsLoading(false);
      if (matched) {
        showToast(
          'Login Berhasil!',
          `Selamat datang, ${matched.name} (${matched.role === 'pengawas' ? 'Pengawas Sekolah' : `Kepala Sekolah - ${matched.schoolName}`})`,
          'success'
        );
        onLoginSuccess(matched);
      } else {
        setErrorMsg('Email/Username atau kata sandi tidak cocok. Hubungi Pengawas Sekolah jika Anda belum memiliki akun.');
      }
    }, 250);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const profile = await signInWithGoogle();
      showToast(
        'Login Berhasil (Google)',
        `Selamat datang, ${profile.name} (${profile.role === 'pengawas' ? 'Pengawas Sekolah' : 'Kepala Sekolah'})`,
        'success'
      );
      onLoginSuccess(profile);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('Gagal masuk dengan Google. Pastikan jendela popup diizinkan pada peramban Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickAccount = (acc: ManagedAccount) => {
    setEmailOrUser(acc.email);
    setPassword(acc.password || 'pengawas123');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Subtle Accent Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Top Header Brand */}
      <header className="relative z-10 py-5 px-6 max-w-6xl w-full mx-auto flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-lg tracking-wide">INSPIRO</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                Kurikulum Merdeka
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Insight Supervisi dan Profil Pembelajaran
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Portal Resmi Pengawas & Kepala Sekolah Binaan</span>
        </div>
      </header>

      {/* Main Login Form Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 backdrop-blur-md">
          {/* Form Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 mb-3">
              <LogIn className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Masuk ke Sistem Supervisi
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Gunakan akun resmi Pengawas atau Kepala Sekolah Binaan Anda
            </p>
          </div>

          {/* Otoritas Pendaftaran Notice Box */}
          <div className="mb-5 p-3 rounded-xl bg-blue-950/70 border border-blue-800/60 text-xs text-blue-200 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="text-white block font-semibold mb-0.5">Otoritas Akun Terpusat:</strong>
              Pendaftaran akun baru Kepala Sekolah <strong>hanya dapat diterbitkan oleh Pengawas Sekolah</strong> melalui panel pembinaan.
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-xs text-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Main Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Alamat Email / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={emailOrUser}
                  onChange={(e) => setEmailOrUser(e.target.value)}
                  placeholder="nama@belajar.id atau heriansyah396@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-900/80 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi akun Anda"
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-900/80 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Aplikasi'}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-4 items-center">
            <div className="grow border-t border-slate-700"></div>
            <span className="shrink mx-2 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              atau masuk dengan akun dinas
            </span>
            <div className="grow border-t border-slate-700"></div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-950 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 shadow-2xs transition-all cursor-pointer"
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
            <span>Masuk Cepat Google / Belajar.id</span>
          </button>

          {/* Quick Preset Selector for Easy Testing */}
          <div className="mt-5 pt-4 border-t border-slate-700/80">
            <span className="text-[11px] font-bold text-slate-300 block mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Pilih Cepat Akun Uji Coba (1-Klik Isi):</span>
            </span>
            <div className="space-y-1.5">
              {accounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => fillQuickAccount(acc)}
                  className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-slate-700/80 border border-slate-700/60 transition-colors flex items-center justify-between text-xs cursor-pointer group"
                >
                  <div>
                    <div className="font-semibold text-white group-hover:text-blue-300">
                      {acc.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate max-w-[220px]">
                      {acc.email} · pass: {acc.password}
                    </div>
                  </div>
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      acc.role === 'pengawas'
                        ? 'bg-blue-900 text-blue-200 border border-blue-700'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {acc.role === 'pengawas' ? 'Pengawas' : 'Kepsek'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-6 text-center text-xs text-slate-500 border-t border-slate-800">
        <p>
          INSPIRO © 2026 · Instrumen Supervisi Akademik Kurikulum Merdeka Terintegrasi Cloud.
        </p>
        <p className="text-[11px] text-slate-600 mt-0.5">
          Untuk pendaftaran sekolah binaan baru, hubungi Koordinator Pengawas Sekolah.
        </p>
      </footer>
    </div>
  );
};
