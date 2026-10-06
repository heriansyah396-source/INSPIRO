/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Menu, PlusCircle, Bell, School, UserCheck, Cloud, LogIn, LogOut, KeyRound, ShieldCheck } from 'lucide-react';
import { AppSettings } from '../types/inspiro';
import { NavTab } from './Sidebar';
import { UserRoleProfile } from '../services/firebase';

interface NavbarProps {
  currentTab: NavTab;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onOpenMobileSidebar?: () => void;
  onStartNewSupervision: () => void;
  onOpenProfileModal?: () => void;
  onOpenAuthModal?: () => void;
  onOpenManagePrincipals?: () => void;
  onLogout?: () => void;
  currentUser?: UserRoleProfile | null;
  settings: AppSettings;
}

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard Supervisi',
    subtitle: 'Ikhtisar capaian dan profil pembelajaran Kurikulum Merdeka'
  },
  teachers: {
    title: 'Data Guru',
    subtitle: 'Daftar pendidik, identitas NIP, dan alokasi mata pelajaran'
  },
  supervision: {
    title: 'Supervisi Akademik',
    subtitle: 'Instrumen observasi 12 indikator, pra-observasi, dan RTL'
  },
  results: {
    title: 'Hasil Supervisi',
    subtitle: 'Skor akhir, analisis kelebihan, dan rekomendasi tindak lanjut'
  },
  reports: {
    title: 'Laporan & Dokumen Resmi',
    subtitle: 'Daftar hasil supervisi lengkap dan cetak format kedinasan'
  },
  'pm-reports': {
    title: 'Laporan Pengelolaan PM di Sekolah',
    subtitle: 'Audit evaluasi mutu 4 dimensi praktik pedagogis di sekolah binaan'
  },
  settings: {
    title: 'Pengaturan Sistem',
    subtitle: 'Identitas sekolah, data pengawas, dan backup / restore database'
  }
};

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  isSidebarOpen = true,
  onToggleSidebar,
  onOpenMobileSidebar,
  onStartNewSupervision,
  onOpenProfileModal,
  onOpenAuthModal,
  onOpenManagePrincipals,
  onLogout,
  currentUser,
  settings
}) => {
  const currentInfo = TAB_TITLES[currentTab] || {
    title: 'INSPIRO',
    subtitle: 'Insight Supervisi dan Profil Pembelajaran'
  };

  const isSupervisor = currentUser?.role === 'pengawas' || (settings?.supervisorRole ? settings.supervisorRole.includes('Pengawas') : true);

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-2xs relative">
      {/* Top micro gradient line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400" />

      {/* Left: Sidebar toggle & Page Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar || onOpenMobileSidebar}
          className={`p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer ${
            isSidebarOpen ? 'lg:hidden' : 'flex'
          }`}
          aria-label={isSidebarOpen ? 'Tutup sidebar' : 'Buka menu navigasi sidebar'}
          title={isSidebarOpen ? 'Tutup sidebar' : 'Buka sidebar navigasi'}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
            {currentInfo.title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 truncate max-w-md font-medium">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Quick actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Manage Principals Button (For Pengawas) */}
        {isSupervisor && onOpenManagePrincipals && (
          <button
            onClick={onOpenManagePrincipals}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/20 hover:shadow-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            title="Kelola User & Password Kepala Sekolah Binaan"
          >
            <KeyRound className="w-3.5 h-3.5 text-white" />
            <span>Akun Kepsek Binaan</span>
          </button>
        )}

        {/* Quick action button */}
        {currentTab !== 'supervision' && (
          <button
            onClick={onStartNewSupervision}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Mulai Supervisi</span>
            <span className="sm:hidden">Supervisi</span>
          </button>
        )}

        {/* School tag */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1.5 rounded-xl border border-blue-200/80 shadow-2xs">
          <School className="w-3.5 h-3.5 text-blue-600" />
          <span className="truncate max-w-[160px] font-bold text-blue-950">{settings.schoolName}</span>
        </div>

        {/* Profile Pill - Clickable to edit */}
        <button
          type="button"
          onClick={onOpenProfileModal}
          className="flex items-center gap-2.5 pl-2 border-l border-slate-200 hover:bg-slate-50/80 p-1.5 rounded-xl transition-all cursor-pointer group text-left"
          title="Klik untuk mengubah nama dan profil supervisor Anda"
        >
          <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/20 ring-2 ring-blue-100 transition-transform group-hover:scale-105">
            {(currentUser?.name || settings.supervisorName).slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 flex items-center gap-1 leading-tight transition-colors">
              <span className="max-w-[150px] truncate">{currentUser?.name || settings.supervisorName}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            </div>
            <div className="text-[11px] text-slate-500 font-semibold">
              {currentUser?.role === 'pengawas' ? 'Pengawas Sekolah' : currentUser?.role === 'kepala_sekolah' ? 'Kepala Sekolah' : settings.supervisorRole}
            </div>
          </div>
        </button>

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-50 to-red-50 hover:from-rose-100 hover:to-red-100 text-rose-700 hover:text-rose-900 border border-rose-200 hover:border-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer ml-1 shadow-2xs hover:shadow-xs active:scale-95"
            title="Keluar dari akun dan kembali ke halaman login"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        )}
      </div>
    </header>
  );
};
