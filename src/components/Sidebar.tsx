/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BarChart3,
  FileText,
  Settings,
  X,
  GraduationCap,
  Sparkles,
  ChevronRight,
  BookOpenCheck
} from 'lucide-react';

export type NavTab = 'dashboard' | 'teachers' | 'supervision' | 'results' | 'reports' | 'pm-reports' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  teacherCount: number;
  supervisionCount: number;
  pmReportCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  isOpenMobile,
  onCloseMobile,
  teacherCount,
  supervisionCount,
  pmReportCount = 0
}) => {
  const isSidebarVisible = isOpen !== undefined ? isOpen : (isOpenMobile ?? true);
  const handleClose = onClose || onCloseMobile;

  const menuItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: undefined
    },
    {
      id: 'teachers' as NavTab,
      label: 'Data Guru',
      icon: Users,
      badge: teacherCount > 0 ? teacherCount : undefined
    },
    {
      id: 'supervision' as NavTab,
      label: 'Supervisi Akademik',
      icon: ClipboardCheck,
      badge: 'Baru'
    },
    {
      id: 'results' as NavTab,
      label: 'Hasil Supervisi',
      icon: BarChart3,
      badge: undefined
    },
    {
      id: 'reports' as NavTab,
      label: 'Laporan Supervisi',
      icon: FileText,
      badge: supervisionCount > 0 ? supervisionCount : undefined
    },
    {
      id: 'pm-reports' as NavTab,
      label: 'Pengelolaan PM',
      icon: BookOpenCheck,
      badge: pmReportCount > 0 ? pmReportCount : 'Praktik Pedagogis'
    },
    {
      id: 'settings' as NavTab,
      label: 'Pengaturan',
      icon: Settings,
      badge: undefined
    }
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      handleClose?.();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarVisible && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-gradient-to-b from-[#091124] via-[#0f1c3f] to-[#0a1024] text-slate-200 border-r border-indigo-950/60 shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 sm:px-5 border-b border-indigo-900/40 flex items-center justify-between bg-black/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/25 ring-2 ring-white/10">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white tracking-wide text-lg">INSPIRO</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-700/50">
                  Merdeka
                </span>
              </div>
              <p className="text-[11px] text-blue-200/70 font-medium truncate max-w-[140px]">
                Supervisi Akademik
              </p>
            </div>
          </div>

          {/* Close 'X' Button - Visible and accessible on laptop/desktop and mobile */}
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer group"
            title="Tutup Sidebar (Tampilan Layar Penuh)"
            aria-label="Tutup menu navigasi sidebar"
          >
            <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Kurikulum Merdeka Badge Info */}
        <div className="mx-3 mt-4 mb-2 p-3 rounded-xl bg-gradient-to-br from-indigo-950/60 to-blue-950/40 border border-indigo-700/30 text-xs shadow-inner">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instrumen Standar Nasional</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            12 Indikator Observasi Kelas dengan Skala 1–4, Wawancara Pra-Observasi & RTL.
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-white/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-950/80 text-cyan-300 border border-indigo-800/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-200" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer Identity & Pengembang */}
        <div className="p-3 border-t border-indigo-950/60 bg-black/20 space-y-2">
          <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/30 flex items-center justify-between text-xs">
            <div>
              <div className="text-[11px] font-bold text-slate-200">Database Cloud & Lokal</div>
              <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                Tersinkronisasi Aktif
              </div>
            </div>
            <span className="text-[10px] text-cyan-400 font-mono font-bold bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/40">v1.0</span>
          </div>

          <div className="px-2 pt-1 pb-0.5 text-center text-[10px] text-slate-400">
            <span className="block text-slate-500 font-medium">Pengembang Aplikasi:</span>
            <span className="font-bold text-cyan-300">Heriansyah, S.Si., S.Pd., M.Pd</span>
          </div>
        </div>
      </aside>
    </>
  );
};
