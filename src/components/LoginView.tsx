/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  School,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  Building,
  KeyRound
} from 'lucide-react';
import {
  loginWithEmail,
  registerWithEmail,
  signInWithGoogle,
  UserRoleProfile
} from '../services/firebase';
import { authenticateUser, addManagedAccount } from '../utils/storage';

interface LoginViewProps {
  onLoginSuccess: (profile: UserRoleProfile) => void;
  onEnterGuestMode: () => void;
  showToast: (title: string, desc?: string, type?: 'success' | 'warning' | 'error') => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onEnterGuestMode,
  showToast
}) => {
  // Default to 'pengawas' so the supervisor portal & registration are immediately visible
  const [userRole, setUserRole] = useState<'pengawas' | 'kepala_sekolah'>('pengawas');

  // For Pengawas: toggle between 'login' and 'register'
  // For Kepala Sekolah: strictly login only (no registration available)
  const [pengawasSubTab, setPengawasSubTab] = useState<'login' | 'register'>('login');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Login credentials - defaults for Pengawas initially
  const [loginEmail, setLoginEmail] = useState('heriansyah396@gmail.com');
  const [loginPassword, setLoginPassword] = useState('pengawas123');
  const [rememberMe, setRememberMe] = useState(true);

  // Register state (Strictly for Pengawas Sekolah)
  const [regName, setRegName] = useState('Heriansyah., S.Si., S.Pd., M.Pd');
  const [regNip, setRegNip] = useState('19820415 200801 1 007');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRegion, setRegRegion] = useState('Dinas Pendidikan Kab/Kota / Seluruh Sekolah Binaan');

  // Switch role handler
  const handleSelectRole = (role: 'pengawas' | 'kepala_sekolah') => {
    setUserRole(role);
    setErrorMsg('');
    if (role === 'pengawas') {
      setLoginEmail('heriansyah396@gmail.com');
      setLoginPassword('pengawas123');
      setPengawasSubTab('login');
    } else {
      setLoginEmail('kepsek.smpn1@belajar.id');
      setLoginPassword('kepsek123');
    }
  };

  // Handle Login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg('Silakan masukkan Username/Email dan Kata Sandi.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      let profile: UserRoleProfile | null = null;
      try {
        profile = await loginWithEmail(loginEmail.trim(), loginPassword);
      } catch (fbErr: any) {
        console.warn('Firebase login fallback to local database:', fbErr);
        const localAuth = authenticateUser(loginEmail.trim(), loginPassword);
        if (localAuth) {
          profile = {
            uid: localAuth.id,
            email: localAuth.email,
            name: localAuth.name,
            role: localAuth.role,
            nip: localAuth.nip,
            schoolName: localAuth.schoolName,
            createdAt: localAuth.createdAt
          };
        } else {
          if (
            fbErr?.message?.includes('auth/invalid-credential') ||
            fbErr?.message?.includes('user-not-found') ||
            fbErr?.message?.includes('wrong-password')
          ) {
            throw new Error('Email atau kata sandi tidak sesuai.');
          } else {
            throw new Error(
              userRole === 'kepala_sekolah'
                ? 'Akun Kepala Sekolah tidak ditemukan atau kata sandi salah. Gunakan username dan password yang telah diberikan oleh Pengawas Sekolah.'
                : 'Akun Pengawas tidak ditemukan atau kata sandi salah. Silakan periksa kembali atau pilih tab "Daftar Akun Pengawas" bila belum mendaftar.'
            );
          }
        }
      }

      if (profile) {
        if (rememberMe) {
          localStorage.setItem('inspiro_active_session', JSON.stringify(profile));
        }
        showToast(
          'Login Berhasil',
          `Selamat datang, ${profile.name} (${profile.role === 'pengawas' ? 'Pengawas Sekolah' : 'Kepala Sekolah'}).`,
          'success'
        );
        onLoginSuccess(profile);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk ke sistem.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Pengawas Registration (Exclusive for Pengawas)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg('Semua kolom bertanda bintang (*) wajib diisi.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      let profile: UserRoleProfile;

      try {
        profile = await registerWithEmail(
          regEmail.trim(),
          regPassword,
          regName.trim(),
          'pengawas',
          regRegion.trim()
        );
      } catch (fbErr: any) {
        console.warn('Firebase register fallback to local database:', fbErr);
        const newAcc = addManagedAccount({
          email: regEmail.trim(),
          password: regPassword,
          name: regName.trim(),
          nip: regNip.trim(),
          role: 'pengawas',
          schoolName: regRegion.trim()
        });

        profile = {
          uid: newAcc.id,
          email: newAcc.email,
          name: newAcc.name,
          role: 'pengawas',
          nip: newAcc.nip,
          schoolName: newAcc.schoolName,
          createdAt: newAcc.createdAt
        };
      }

      localStorage.setItem('inspiro_active_session', JSON.stringify(profile));

      showToast(
        'Pendaftaran Pengawas Berhasil!',
        `Akun Pengawas Sekolah untuk ${profile.name} telah siap digunakan.`,
        'success'
      );
      onLoginSuccess(profile);
    } catch (err: any) {
      const msg = err.message || 'Gagal mendaftar akun pengawas.';
      if (msg.includes('email-already-in-use')) {
        setErrorMsg('Email ini sudah terdaftar. Silakan pilih tab "Masuk Pengawas".');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Google Login (for Pengawas)
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const profile = await signInWithGoogle();
      localStorage.setItem('inspiro_active_session', JSON.stringify(profile));
      showToast(
        'Login Berhasil (Google)',
        `Masuk sebagai ${profile.name} (${profile.role === 'pengawas' ? 'Pengawas Sekolah' : 'Kepala Sekolah'}).`,
        'success'
      );
      onLoginSuccess(profile);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Gagal masuk dengan Google. Pastikan jendela popup tidak diblokir.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-radial from-[#0c1838] via-[#080e22] to-[#040714] flex flex-col justify-center items-center px-4 py-8 sm:px-6 relative overflow-hidden text-slate-100">
      {/* Dynamic Ambient Radiant Mesh Lights for Rich Visual Depth */}
      <div className="absolute top-[-10%] left-[15%] w-[550px] h-[550px] bg-gradient-to-tr from-blue-600/20 to-cyan-400/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[550px] h-[550px] bg-gradient-to-br from-indigo-600/25 to-emerald-500/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Decorative Grid Mesh Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* Main Container */}
      <div className="w-full max-w-lg z-10">
        {/* App Branding & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white shadow-2xl shadow-blue-500/30 mb-3 ring-4 ring-white/15">
            <ShieldCheck className="w-9 h-9 drop-shadow" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span className="bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
              INSPIRO
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 font-bold uppercase tracking-wider">
              Kurikulum Merdeka
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-cyan-100/80 mt-1 font-medium">
            Insight Supervisi & Profil Pembelajaran Akademik
          </p>
          <div className="flex items-center justify-center gap-2 mt-1 text-[11px] text-slate-400">
            <span>Sistem Digital Supervisi Sekolah Binaan</span>
            <span>·</span>
            <span className="text-emerald-400 font-medium">Terkoneksi Cloud & Offline</span>
          </div>
        </div>

        {/* Card Box with Modern Frosted Glass Aesthetic */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 border border-white/20 text-slate-900 overflow-hidden">
          
          {/* Top Role Selector: Pengawas Sekolah vs Kepala Sekolah Binaan */}
          <div className="p-3.5 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 border-b border-slate-200/90">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-500">
                Pilih Akses Pengguna
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                Pilih peran untuk melanjutkan
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-200/70 rounded-xl">
              {/* Tab 1: Pengawas Sekolah (Default & Bisa Daftar) */}
              <button
                type="button"
                onClick={() => handleSelectRole('pengawas')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer relative ${
                  userRole === 'pengawas'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20 ring-1 ring-emerald-500/30'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className={`w-4 h-4 ${userRole === 'pengawas' ? 'text-white' : 'text-emerald-600'}`} />
                  <span>Pengawas Sekolah</span>
                </div>
                <span className={`text-[10px] font-medium ${userRole === 'pengawas' ? 'text-emerald-100' : 'text-emerald-700 font-semibold'}`}>
                  (Masuk & Daftar Baru)
                </span>
              </button>

              {/* Tab 2: Kepala Sekolah (Hanya Masuk, Tidak Ada Form Daftar) */}
              <button
                type="button"
                onClick={() => handleSelectRole('kepala_sekolah')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                  userRole === 'kepala_sekolah'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-700/20 ring-1 ring-blue-500/30'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <School className={`w-4 h-4 ${userRole === 'kepala_sekolah' ? 'text-white' : 'text-blue-600'}`} />
                  <span>Kepala Sekolah</span>
                </div>
                <span className={`text-[10px] font-medium ${userRole === 'kepala_sekolah' ? 'text-blue-100' : 'text-slate-500'}`}>
                  (Hanya Masuk / Login)
                </span>
              </button>
            </div>
          </div>

          {/* Sub-Tabs for Pengawas Sekolah: "Masuk Pengawas" VS "Daftar Akun Pengawas" */}
          {userRole === 'pengawas' && (
            <div className="grid grid-cols-2 border-b border-emerald-100 bg-emerald-50/50 p-1.5 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setPengawasSubTab('login');
                  setErrorMsg('');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  pengawasSubTab === 'login'
                    ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200'
                    : 'text-emerald-800/80 hover:text-emerald-950 hover:bg-white/50'
                }`}
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-700" />
                <span>Masuk Akun Pengawas</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPengawasSubTab('register');
                  setErrorMsg('');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
                  pengawasSubTab === 'register'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs font-extrabold'
                    : 'text-emerald-800/80 hover:text-emerald-950 hover:bg-white/50'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Daftar Akun Pengawas</span>
                <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1.5 right-2 animate-pulse" />
              </button>
            </div>
          )}

          <div className="p-6 sm:p-7">
            {/* Error Message Box */}
            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-medium">{errorMsg}</div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 1. PORTAL PENGAWAS SEKOLAH: FORMULIR MASUK (LOGIN)                        */}
            {/* ========================================================================= */}
            {userRole === 'pengawas' && pengawasSubTab === 'login' && (
              <div className="space-y-4">
                {/* Header Banner */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Login Pengawas Sekolah</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                        Otoritas Utama
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Supervisor Akademik & Pembina Seluruh Sekolah Binaan
                    </p>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 pt-1">
                  {/* Email / Username */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Username / Email Pengawas
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="heriansyah396@gmail.com"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-colors font-medium text-slate-900 bg-white"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Kata Sandi (Password)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showPassword ? 'Sembunyikan' : 'Lihat Sandi'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Masukkan kata sandi pengawas"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-colors font-medium text-slate-900 bg-white"
                      />
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Ingat sesi masuk di perangkat ini</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{loading ? 'Memverifikasi...' : 'Masuk sebagai Pengawas Sekolah'}</span>
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-white px-3 text-slate-400 font-bold tracking-wider">
                      Atau Masuk Cepat
                    </span>
                  </div>
                </div>

                {/* Google Sign In for Pengawas */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
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
                  <span>Masuk dengan Akun Google / Belajar.id</span>
                </button>

                {/* Quick 1-Click Demo for Pengawas Heriansyah */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('heriansyah396@gmail.com');
                      setLoginPassword('pengawas123');
                      setErrorMsg('');
                    }}
                    className="w-full p-2.5 rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 hover:from-emerald-100 hover:to-teal-100 text-left transition-all cursor-pointer flex items-center justify-between shadow-2xs"
                  >
                    <div>
                      <div className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span>Akun Contoh: Heriansyah., S.Si., S.Pd., M.Pd</span>
                      </div>
                      <div className="text-[10px] text-emerald-800 font-medium mt-0.5">
                        NIP: 19820415 200801 1 007 · Pengawas Sekolah
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/80 px-2 py-1 rounded-md border border-emerald-400/50">
                      Isi Cepat
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. PORTAL PENGAWAS SEKOLAH: FORMULIR PENDAFTARAN KHUSUS PENGAWAS BARU     */}
            {/* ========================================================================= */}
            {userRole === 'pengawas' && pengawasSubTab === 'register' && (
              <div className="space-y-4">
                {/* Authority Notice Banner */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5 shadow-2xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 leading-relaxed text-[11px]">
                    <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                      <span>Pendaftaran Khusus Pengawas Sekolah Baru</span>
                      <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold uppercase">
                        Resmi
                      </span>
                    </div>
                    <p className="text-emerald-800">
                      Formulir pendaftaran mandiri ini <strong>khusus untuk Pengawas Sekolah</strong>.
                      Setelah terdaftar, Anda dapat login dan membuatkan akun untuk seluruh Kepala Sekolah binaan Anda.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleRegister} className="space-y-3 pt-1">
                  {/* Nama Lengkap & Gelar */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap & Gelar Akademik <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Contoh: Heriansyah., S.Si., S.Pd., M.Pd"
                        required
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  {/* NIP Pengawas */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      NIP / NIK Pengawas
                    </label>
                    <input
                      type="text"
                      value={regNip}
                      onChange={(e) => setRegNip(e.target.value)}
                      placeholder="Contoh: 19820415 200801 1 007"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-mono"
                    />
                  </div>

                  {/* Role Locked Notice */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Peran Hak Akses (Terkunci)
                    </label>
                    <div className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50 flex items-center justify-between text-xs text-emerald-950 font-bold">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span>Pengawas Sekolah (Supervisor Pembina)</span>
                      </div>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md font-extrabold uppercase">
                        Terkunci
                      </span>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Alamat Email (Dinas / Belajar.id / Pribadi) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="pengawas@dinas.go.id"
                        required
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  {/* Password & Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kata Sandi <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 6 karakter"
                        required
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ulangi Kata Sandi <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Ketik ulang sandi"
                        required
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Wilayah / Sekolah Binaan */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Wilayah / Satuan Binaan
                    </label>
                    <input
                      type="text"
                      value={regRegion}
                      onChange={(e) => setRegRegion(e.target.value)}
                      placeholder="Dinas Pendidikan Kab/Kota / Wilayah Binaan"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-medium"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{loading ? 'Mendaftarkan Akun...' : 'Daftarkan Akun Pengawas Sekolah'}</span>
                  </button>
                </form>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. PORTAL KEPALA SEKOLAH BINAAN (STRICTLY LOGIN ONLY, TIDAK BISA DAFTAR)   */}
            {/* ========================================================================= */}
            {userRole === 'kepala_sekolah' && (
              <div className="space-y-4">
                {/* Header Banner */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                    <School className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Login Kepala Sekolah Binaan</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full border border-blue-300">
                        Khusus Masuk
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Gunakan User & Password yang diterbitkan oleh Pengawas Sekolah
                    </p>
                  </div>
                </div>

                {/* Important Notice: Explaining NO Registration form for Kepala Sekolah */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 text-xs text-blue-950 flex items-start gap-2.5 shadow-2xs">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-[11px] leading-relaxed">
                    <div className="font-extrabold text-blue-900 flex items-center gap-1.5">
                      <span>Pemberitahuan Khusus Kepala Sekolah:</span>
                    </div>
                    <p className="text-blue-800">
                      Kepala Sekolah <strong>tidak memiliki formulir pendaftaran mandiri</strong>.
                      Akun dan kata sandi Anda dibuat serta diberikan langsung oleh Pengawas Sekolah pembina Anda melalui menu Manajemen Akun Binaan.
                    </p>
                    {/* Direct switch to Pengawas register if user is actually a supervisor */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserRole('pengawas');
                          setPengawasSubTab('register');
                          setErrorMsg('');
                        }}
                        className="text-[11px] font-bold text-emerald-800 bg-white hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Anda Pengawas Sekolah Baru? Buka Pendaftaran Pengawas ➔</span>
                      </button>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 pt-1">
                  {/* Email / Username */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Username / Email Akun Kepala Sekolah
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="Contoh: kepsek.smpn1@belajar.id"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-colors font-medium text-slate-900 bg-white"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Kata Sandi (Password)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showPassword ? 'Sembunyikan' : 'Lihat Sandi'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Masukkan kata sandi akun kepala sekolah"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-colors font-medium text-slate-900 bg-white"
                      />
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Ingat sesi masuk di perangkat ini</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{loading ? 'Memverifikasi...' : 'Masuk sebagai Kepala Sekolah'}</span>
                  </button>
                </form>

                {/* Quick 1-Click Demo for Kepala Sekolah */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('kepsek.smpn1@belajar.id');
                      setLoginPassword('kepsek123');
                      setErrorMsg('');
                    }}
                    className="w-full p-2.5 rounded-xl border border-blue-300 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 hover:from-blue-100 hover:to-indigo-100 text-left transition-all cursor-pointer flex items-center justify-between shadow-2xs"
                  >
                    <div>
                      <div className="text-[11px] font-bold text-blue-950 flex items-center gap-1.5">
                        <School className="w-4 h-4 text-blue-600" />
                        <span>Akun Contoh: Dra. Hj. Nurhasanah, M.Pd.</span>
                      </div>
                      <div className="text-[10px] text-blue-800 font-medium mt-0.5">
                        Kepala Sekolah · SMP Negeri 1 Merdeka Nusantara
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-800 bg-blue-200/80 px-2 py-1 rounded-md border border-blue-400/50">
                      Isi Cepat
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Card with Offline Mode */}
          <div className="bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <button
              type="button"
              onClick={onEnterGuestMode}
              className="text-blue-700 hover:text-blue-900 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1.5 hover:underline"
            >
              <span>Mode Tamu / Eksplorasi Lokal (Offline)</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
            </button>
            <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>v1.0 Standar Kemendikbudristek</span>
            </div>
          </div>
        </div>

        {/* Outer footer */}
        <div className="text-center mt-6 text-[11px] text-slate-400">
          <p className="font-semibold text-slate-300">
            © 2026 INSPIRO · Standar Supervisi Akademik Kurikulum Merdeka
          </p>
          <p className="mt-0.5 text-slate-400">
            Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia
          </p>
        </div>
      </div>
    </div>
  );
};
