/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { NavTab, Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { TeacherList } from './components/TeacherList';
import { TeacherModal } from './components/TeacherModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { WizardContainer } from './components/SupervisionWizard/WizardContainer';
import { SupervisionDetail } from './components/SupervisionDetail';
import { ReportList } from './components/ReportList';
import { OfficialReportPrint } from './components/OfficialReportPrint';
import { SettingsView } from './components/SettingsView';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';
import { LoginView } from './components/LoginView';
import { ManagePrincipalsModal } from './components/ManagePrincipalsModal';
import {
  AppSettings,
  SupervisionRecord,
  Teacher
} from './types/inspiro';
import {
  addTeacher,
  deleteSupervisionRecord,
  deleteTeacher,
  getSettings,
  getSupervisionById,
  getSupervisions,
  getTeachers,
  resetToDemoData,
  saveSettings,
  saveSupervisionRecord,
  updateTeacher
} from './utils/storage';
import {
  auth,
  onAuthStateChanged,
  testConnection,
  logOut,
  syncSupervisionToCloud,
  syncTeacherToCloud,
  fetchCloudSupervisions,
  fetchCloudTeachers,
  UserRoleProfile
} from './services/firebase';

export default function App() {
  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data State from Local Storage
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [supervisions, setSupervisions] = useState<SupervisionRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getSettings());

  // Active item contexts
  const [selectedSupervisionId, setSelectedSupervisionId] = useState<string | null>(null);
  const [printSupervisionId, setPrintSupervisionId] = useState<string | null>(null);
  const [wizardSupervision, setWizardSupervision] = useState<SupervisionRecord | null>(null);
  const [wizardPreselectedTeacherId, setWizardPreselectedTeacherId] = useState<string | null>(null);

  // Modals & Feedback
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isManagePrincipalsOpen, setIsManagePrincipalsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserRoleProfile | null>(() => {
    const saved = localStorage.getItem('inspiro_active_session');
    if (saved) {
      try {
        return JSON.parse(saved) as UserRoleProfile;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('inspiro_active_session');
  });
  const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Load initial data
  const refreshData = useCallback(() => {
    setTeachers(getTeachers());
    setSupervisions(getSupervisions());
    setSettings(getSettings());
  }, []);

  useEffect(() => {
    refreshData();
    testConnection();

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const profile: UserRoleProfile = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          name: fbUser.displayName || (fbUser.email?.includes('heriansyah') ? 'Heriansyah., S.Si., S.Pd., M.Pd' : 'Kepala Sekolah Binaan'),
          role: fbUser.email?.includes('heriansyah') ? 'pengawas' : 'kepala_sekolah',
          schoolName: 'SMP Negeri 1 Merdeka Nusantara',
          createdAt: new Date().toISOString()
        };
        setCurrentUser(profile);

        // Fetch cloud data and merge
        try {
          const cloudSups = await fetchCloudSupervisions(profile);
          if (cloudSups.length > 0) {
            setSupervisions((prev) => {
              const map = new Map<string, SupervisionRecord>();
              prev.forEach((s) => map.set(s.id, s));
              cloudSups.forEach((s) => map.set(s.id, s));
              return Array.from(map.values());
            });
          }
          const cloudTeachers = await fetchCloudTeachers();
          if (cloudTeachers.length > 0) {
            setTeachers((prev) => {
              const map = new Map<string, Teacher>();
              prev.forEach((t) => map.set(t.id, t));
              cloudTeachers.forEach((t) => map.set(t.id, t));
              return Array.from(map.values());
            });
          }
        } catch (err) {
          console.warn('Initial cloud fetch:', err);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsub();
  }, [refreshData]);

  // Toast Helper
  const showToast = useCallback(
    (title: string, description?: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
      const newToast: ToastMessage = {
        id: `toast-${Date.now()}-${Math.random()}`,
        type,
        title,
        description
      };
      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Handlers: Supervision Wizard Navigation
  const handleStartNewSupervision = (teacherId?: string) => {
    setWizardSupervision(null);
    setWizardPreselectedTeacherId(teacherId || null);
    setCurrentTab('supervision');
    setPrintSupervisionId(null);
  };

  const handleEditSupervision = (id: string) => {
    const record = getSupervisionById(id);
    if (record) {
      setWizardSupervision(record);
      setWizardPreselectedTeacherId(record.teacherId);
      setCurrentTab('supervision');
      setPrintSupervisionId(null);
    }
  };

  const handleSaveDraft = (record: SupervisionRecord) => {
    saveSupervisionRecord(record);
    if (currentUser) {
      syncSupervisionToCloud(record).catch((err) => console.warn('Cloud sync draft:', err));
    }
    refreshData();
    showToast('Draf Tersimpan', `Supervisi ${record.identity.namaGuru} berhasil disimpan${currentUser ? ' dan disinkronkan ke Cloud' : ''}.`, 'info');
  };

  const handleCompleteSupervision = (record: SupervisionRecord) => {
    saveSupervisionRecord(record);
    if (currentUser) {
      syncSupervisionToCloud(record).catch((err) => console.warn('Cloud sync complete:', err));
    }
    refreshData();
    setSelectedSupervisionId(record.id);
    setCurrentTab('results');
    setPrintSupervisionId(null);
    showToast(
      'Supervisi Selesai!',
      `Nilai Akhir: ${record.finalScore} (${record.category}). Dokumen siap dicetak${currentUser ? ' dan tersimpan di Cloud' : ''}.`,
      'success'
    );
  };

  const handleCancelWizard = () => {
    setCurrentTab('dashboard');
  };

  // Handlers: View Results & Print
  const handleViewResult = (id: string) => {
    setSelectedSupervisionId(id);
    setCurrentTab('results');
    setPrintSupervisionId(null);
  };

  const handlePrintReport = (id: string) => {
    setPrintSupervisionId(id);
  };

  const handleClosePrint = () => {
    setPrintSupervisionId(null);
  };

  // Handlers: Delete Supervision
  const handleDeleteSupervision = (item: SupervisionRecord) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Laporan Supervisi?',
      message: `Apakah Anda yakin ingin menghapus laporan supervisi untuk ${item.identity.namaGuru} (${item.identity.hariTanggal})? Tindakan ini tidak dapat dibatalkan.`,
      onConfirm: () => {
        deleteSupervisionRecord(item.id);
        refreshData();
        setConfirmModal(null);
        showToast('Laporan Dihapus', 'Data supervisi berhasil dihapus dari sistem.', 'info');
      }
    });
  };

  // Handlers: Teachers CRUD
  const handleAddTeacher = () => {
    setTeacherToEdit(null);
    setIsTeacherModalOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setTeacherToEdit(teacher);
    setIsTeacherModalOpen(true);
  };

  const handleSaveTeacher = (teacherData: Omit<Teacher, 'id' | 'createdAt'>) => {
    if (teacherToEdit) {
      updateTeacher(teacherToEdit.id, teacherData);
      if (currentUser) {
        syncTeacherToCloud({ ...teacherData, id: teacherToEdit.id, createdAt: teacherToEdit.createdAt }).catch(console.warn);
      }
      showToast('Data Guru Diperbarui', `Identitas ${teacherData.nama} berhasil disimpan.`, 'success');
    } else {
      const created = addTeacher(teacherData);
      if (currentUser) {
        syncTeacherToCloud(created).catch(console.warn);
      }
      showToast('Guru Ditambahkan', `${teacherData.nama} berhasil didaftarkan ke sistem.`, 'success');
    }
    refreshData();
    setIsTeacherModalOpen(false);
    setTeacherToEdit(null);
  };

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (e) {
      console.warn('Logout error:', e);
    }
    localStorage.removeItem('inspiro_active_session');
    setCurrentUser(null);
    setIsAuthenticated(false);
    showToast('Berhasil Keluar', 'Anda telah keluar dari aplikasi INSPIRO dan kembali ke halaman login.', 'info');
  };

  const handleDeleteTeacher = (teacher: Teacher) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Data Guru?',
      message: `Hapus data ${teacher.nama} (${teacher.mapel})? Riwayat supervisi yang telah selesai akan tetap tersimpan di arsip.`,
      onConfirm: () => {
        deleteTeacher(teacher.id);
        refreshData();
        setConfirmModal(null);
        showToast('Guru Dihapus', `Data ${teacher.nama} berhasil dihapus.`, 'info');
      }
    });
  };

  // Handlers: Settings & Reset
  const handleSaveSettings = (newSettings: AppSettings) => {
    saveSettings(newSettings);
    refreshData();
  };

  const handleResetDemoData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset ke Data Contoh Demo?',
      message: 'Perhatian: Seluruh data guru dan supervisi saat ini akan diganti dengan data contoh Kurikulum Merdeka INSPIRO.',
      onConfirm: () => {
        resetToDemoData();
        refreshData();
        setConfirmModal(null);
        showToast('Data Direset', 'Database berhasil dikembalikan ke contoh awal Kurikulum Merdeka.', 'success');
      }
    });
  };

  // Active Record for detail view
  const activeRecord =
    supervisions.find((s) => s.id === selectedSupervisionId) || supervisions[0];

  // Active Record for print view
  const printRecord =
    printSupervisionId ? supervisions.find((s) => s.id === printSupervisionId) : null;

  // INITIAL SCREEN: If not authenticated, render LoginView as the initial screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900">
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        <LoginView
          onLoginSuccess={(profile) => {
            setCurrentUser(profile);
            setIsAuthenticated(true);
            if (profile.name) {
              setSettings((prev) => ({
                ...prev,
                supervisorName: profile.name,
                supervisorRole: profile.role === 'pengawas' ? 'Pengawas Sekolah' : 'Kepala Sekolah',
                schoolName: profile.schoolName || prev.schoolName
              }));
            }
          }}
          onEnterGuestMode={() => {
            setIsAuthenticated(true);
            showToast('Mode Tamu Aktif', 'Anda masuk dalam mode pratinjau lokal offline.', 'info');
          }}
          showToast={showToast}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Confirmation Dialog */}
      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {/* Teacher Form Modal */}
      <TeacherModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onSave={handleSaveTeacher}
        initialData={teacherToEdit}
        defaultSchoolName={settings.schoolName}
      />

      {/* Supervisor Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        settings={settings}
        onSave={(updated) => {
          handleSaveSettings(updated);
          showToast('Profil Diperbarui', `Identitas supervisor diubah menjadi ${updated.supervisorName}`, 'success');
        }}
      />

      {/* Cloud Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSuccess={(profile) => {
          setCurrentUser(profile);
          if (profile.name) {
            setSettings((prev) => ({
              ...prev,
              supervisorName: profile.name,
              supervisorRole: profile.role === 'pengawas' ? 'Pengawas Sekolah' : 'Kepala Sekolah',
              schoolName: profile.schoolName || prev.schoolName
            }));
          }
        }}
        showToast={showToast}
      />

      {/* Manage Principals Modal (For Pengawas) */}
      <ManagePrincipalsModal
        isOpen={isManagePrincipalsOpen}
        onClose={() => setIsManagePrincipalsOpen(false)}
        showToast={showToast}
      />

      {/* Left Sidebar (Desktop fixed, Mobile drawer) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setPrintSupervisionId(null);
        }}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        teacherCount={teachers.length}
        supervisionCount={supervisions.length}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <Navbar
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onStartNewSupervision={() => handleStartNewSupervision()}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenManagePrincipals={() => setIsManagePrincipalsOpen(true)}
          onLogout={handleLogout}
          currentUser={currentUser}
          settings={settings}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Official Document Print Mode */}
          {printRecord ? (
            <OfficialReportPrint
              supervision={printRecord}
              settings={settings}
              onBack={handleClosePrint}
            />
          ) : (
            <>
              {/* Tab 1: Dashboard */}
              {currentTab === 'dashboard' && (
                <Dashboard
                  teachers={teachers}
                  supervisions={supervisions}
                  onStartSupervision={handleStartNewSupervision}
                  onViewResult={handleViewResult}
                  onPrintReport={handlePrintReport}
                  onNavigateToTeachers={() => setCurrentTab('teachers')}
                  onNavigateToReports={() => setCurrentTab('reports')}
                />
              )}

              {/* Tab 2: Data Guru */}
              {currentTab === 'teachers' && (
                <TeacherList
                  teachers={teachers}
                  supervisions={supervisions}
                  onAddTeacher={handleAddTeacher}
                  onEditTeacher={handleEditTeacher}
                  onDeleteTeacher={handleDeleteTeacher}
                  onStartSupervision={handleStartNewSupervision}
                  onViewTeacherSupervisions={(id) => {
                    const sup = supervisions.find((s) => s.teacherId === id);
                    if (sup) handleViewResult(sup.id);
                  }}
                />
              )}

              {/* Tab 3: Supervisi Akademik (Wizard 5 Step) */}
              {currentTab === 'supervision' && (
                <WizardContainer
                  key={wizardSupervision ? wizardSupervision.id : `new-${wizardPreselectedTeacherId || 'blank'}`}
                  initialSupervision={wizardSupervision}
                  selectedTeacherId={wizardPreselectedTeacherId}
                  teachers={teachers}
                  settings={settings}
                  onSaveDraft={handleSaveDraft}
                  onCompleteSupervision={handleCompleteSupervision}
                  onCancel={handleCancelWizard}
                />
              )}

              {/* Tab 4: Hasil Supervisi */}
              {currentTab === 'results' && (
                activeRecord ? (
                  <SupervisionDetail
                    supervision={activeRecord}
                    onBack={() => setCurrentTab('reports')}
                    onEdit={() => handleEditSupervision(activeRecord.id)}
                    onPrint={() => handlePrintReport(activeRecord.id)}
                  />
                ) : (
                  <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
                    <p className="text-sm font-semibold text-slate-700">Belum ada hasil supervisi yang dipilih</p>
                    <button
                      onClick={() => handleStartNewSupervision()}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                    >
                      Mulai Supervisi Baru
                    </button>
                  </div>
                )
              )}

              {/* Tab 5: Laporan */}
              {currentTab === 'reports' && (
                <ReportList
                  supervisions={supervisions}
                  onViewDetail={handleViewResult}
                  onEditSupervision={handleEditSupervision}
                  onPrintReport={handlePrintReport}
                  onDeleteSupervision={handleDeleteSupervision}
                  onStartNewSupervision={() => handleStartNewSupervision()}
                />
              )}

              {/* Tab 6: Pengaturan */}
              {currentTab === 'settings' && (
                <SettingsView
                  settings={settings}
                  onSaveSettings={handleSaveSettings}
                  onResetDemoData={handleResetDemoData}
                  onDataImported={refreshData}
                  onOpenManagePrincipals={() => setIsManagePrincipalsOpen(true)}
                  showToast={showToast}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
