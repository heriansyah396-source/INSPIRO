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
import { PMManagementView } from './components/PMManagementView';
import { PMLearningEnvView } from './components/PMLearningEnvView';
import { PMDigitalView } from './components/PMDigitalView';
import { PMLearningPartnershipView } from './components/PMLearningPartnershipView';
import { SchoolQualityMapView } from './components/SchoolQualityMapView';
import { GrowthTrackerView } from './components/GrowthTrackerView';
import { SupervisionCalendarView } from './components/SupervisionCalendarView';
import { TirtaCoachingView } from './components/TirtaCoachingView';
import { TeacherQuadrantView } from './components/TeacherQuadrantView';
import { ContextualProblemView } from './components/ContextualProblemView';
import { SOARAnalysisView } from './components/SOARAnalysisView';
import { PrincipalList } from './components/PrincipalList';
import {
  AppSettings,
  SupervisionRecord,
  Teacher,
  Principal,
  ManagerialEvaluationRecord,
  PMReport,
  ManagedAccount,
  PMLearningEnvRecord,
  PMDigitalRecord,
  ContextualProblemRecord,
  PMLearningPartnershipRecord,
  SOARAnalysisRecord
} from './types/inspiro';
import {
  addTeacher,
  deleteSupervisionRecord,
  deleteTeacher,
  getSettings,
  getSupervisionById,
  getSupervisions,
  getTeachers,
  getPrincipals,
  savePrincipals,
  addPrincipal,
  updatePrincipal,
  deletePrincipal,
  getManagerialEvaluations,
  saveManagerialEvaluations,
  resetToDemoData,
  saveSettings,
  saveSupervisionRecord,
  saveSupervisions,
  saveTeachers,
  updateTeacher,
  getPMReports,
  savePMReport,
  savePMReports,
  deletePMReport,
  getManagedAccounts,
  saveManagedAccounts,
  getCoachingRecords,
  getLearningEnvRecords,
  saveLearningEnvRecord,
  deleteLearningEnvRecord,
  getDigitalPMRecords,
  saveDigitalPMRecord,
  deleteDigitalPMRecord,
  getContextualProblems,
  saveContextualProblem,
  deleteContextualProblem,
  getPartnershipPMRecords,
  savePartnershipPMRecord,
  deletePartnershipPMRecord,
  getSOARRecords,
  saveSOARRecord,
  deleteSOARRecord
} from './utils/storage';
import {
  auth,
  onAuthStateChanged,
  testConnection,
  logOut,
  syncSupervisionToCloud,
  deleteSupervisionFromCloud,
  syncTeacherToCloud,
  deleteTeacherFromCloud,
  syncPrincipalToCloud,
  deletePrincipalFromCloud,
  fetchCloudPrincipals,
  fetchCloudManagerialEvaluations,
  fetchCloudSupervisions,
  fetchCloudTeachers,
  syncPMReportToCloud,
  fetchCloudPMReports,
  deletePMReportFromCloud,
  syncSettingsToCloud,
  fetchCloudSettings,
  fetchCloudManagedAccounts,
  UserRoleProfile
} from './services/firebase';

export default function App() {
  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // Data State from Local Storage
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [principals, setPrincipals] = useState<Principal[]>(() => getPrincipals());
  const [supervisions, setSupervisions] = useState<SupervisionRecord[]>([]);
  const [pmReports, setPmReports] = useState<PMReport[]>([]);
  const [learningEnvRecords, setLearningEnvRecords] = useState<PMLearningEnvRecord[]>(getLearningEnvRecords());
  const [digitalPMRecords, setDigitalPMRecords] = useState<PMDigitalRecord[]>(getDigitalPMRecords());
  const [partnershipPMRecords, setPartnershipPMRecords] = useState<PMLearningPartnershipRecord[]>(getPartnershipPMRecords());
  const [contextualProblems, setContextualProblems] = useState<ContextualProblemRecord[]>(getContextualProblems());
  const [soarRecords, setSoarRecords] = useState<SOARAnalysisRecord[]>(getSOARRecords());
  const [settings, setSettings] = useState<AppSettings>(getSettings());

  // Active item contexts
  const [selectedSupervisionId, setSelectedSupervisionId] = useState<string | null>(null);
  const [printSupervisionId, setPrintSupervisionId] = useState<string | null>(null);
  const [wizardSupervision, setWizardSupervision] = useState<SupervisionRecord | null>(null);
  const [wizardPreselectedTeacherId, setWizardPreselectedTeacherId] = useState<string | null>(null);
  const [presetManagerialPrincipal, setPresetManagerialPrincipal] = useState<Principal | null>(null);

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

  // Load initial data from local storage
  const refreshData = useCallback(() => {
    setTeachers(getTeachers());
    setPrincipals(getPrincipals());
    setSupervisions(getSupervisions());
    setPmReports(getPMReports());
    setLearningEnvRecords(getLearningEnvRecords());
    setDigitalPMRecords(getDigitalPMRecords());
    setPartnershipPMRecords(getPartnershipPMRecords());
    setContextualProblems(getContextualProblems());
    setSoarRecords(getSOARRecords());
    setSettings(getSettings());
  }, []);

  // Bi-directional Google Cloud Firestore Sync
  const syncAllWithCloud = useCallback(async () => {
    try {
      const isOnline = await testConnection();
      if (!isOnline) return;

      // 1. Sync Settings from Cloud
      const cloudSettings = await fetchCloudSettings();
      if (cloudSettings) {
        if (
          !cloudSettings.supervisorName ||
          cloudSettings.supervisorName.toLowerCase().includes('rustina') ||
          cloudSettings.supervisorName.toLowerCase().includes('suryanto') ||
          cloudSettings.supervisorName.includes('Heriansyah.') ||
          cloudSettings.supervisorName.includes('HERIANSYAH.') ||
          cloudSettings.supervisorName === 'Heriansyah, S.Si., S.Pd., M.Pd' ||
          cloudSettings.supervisorNip?.replace(/\s+/g, '') === '196812311995122017'
        ) {
          cloudSettings.supervisorName = 'HERIANSYAH, S.Si., S.Pd., M.Pd';
          cloudSettings.supervisorNip = '19820415 200801 1 007';
          cloudSettings.supervisorRole = 'Pengawas Sekolah';
          syncSettingsToCloud(cloudSettings).catch(() => {});
        }
        setSettings(cloudSettings);
        saveSettings(cloudSettings);
      }

      // 2. Sync Managed Accounts (Pengawas & Kepala Sekolah)
      const cloudAccounts = await fetchCloudManagedAccounts();
      if (cloudAccounts && cloudAccounts.length > 0) {
        const localAccounts = getManagedAccounts();
        const map = new Map<string, ManagedAccount>();
        localAccounts.forEach((a) => map.set(a.id, a));
        cloudAccounts.forEach((a) => map.set(a.id, a));
        saveManagedAccounts(Array.from(map.values()));
      }

      // 3. Sync Teachers from Cloud
      const cloudTeachers = await fetchCloudTeachers();
      if (cloudTeachers && cloudTeachers.length > 0) {
        setTeachers((prev) => {
          const map = new Map<string, Teacher>();
          prev.forEach((t) => map.set(t.id, t));
          cloudTeachers.forEach((t) => map.set(t.id, t));
          const merged = Array.from(map.values());
          saveTeachers(merged);
          return merged;
        });
      }

      // 4. Sync Supervisions from Cloud
      const cloudSups = await fetchCloudSupervisions();
      if (cloudSups && cloudSups.length > 0) {
        setSupervisions((prev) => {
          const map = new Map<string, SupervisionRecord>();
          prev.forEach((s) => map.set(s.id, s));
          cloudSups.forEach((s) => map.set(s.id, s));
          const merged = Array.from(map.values());
          saveSupervisions(merged);
          return merged;
        });
      }

      // 5. Sync PM Reports from Cloud
      const cloudPM = await fetchCloudPMReports();
      if (cloudPM && cloudPM.length > 0) {
        setPmReports((prev) => {
          const map = new Map<string, PMReport>();
          prev.forEach((r) => map.set(r.id, r));
          cloudPM.forEach((r) => map.set(r.id, r));
          const merged = Array.from(map.values());
          savePMReports(merged);
          return merged;
        });
      }

      // 6. Sync Principals from Cloud
      const cloudPrincipals = await fetchCloudPrincipals();
      if (cloudPrincipals && cloudPrincipals.length > 0) {
        setPrincipals((prev) => {
          const map = new Map<string, Principal>();
          prev.forEach((p) => map.set(p.id, p));
          cloudPrincipals.forEach((p) => map.set(p.id, p));
          const merged = Array.from(map.values());
          savePrincipals(merged);
          return merged;
        });
      }

      // 7. Sync Managerial Evaluations from Cloud
      const cloudManagerialEvals = await fetchCloudManagerialEvaluations();
      if (cloudManagerialEvals && cloudManagerialEvals.length > 0) {
        const localEvals = getManagerialEvaluations();
        const map = new Map<string, ManagerialEvaluationRecord>();
        localEvals.forEach((e) => map.set(e.id, e));
        cloudManagerialEvals.forEach((e) => map.set(e.id, e));
        saveManagerialEvaluations(Array.from(map.values()));
      }
    } catch (err) {
      console.warn('Initial cloud sync:', err);
    }
  }, []);

  useEffect(() => {
    refreshData();
    syncAllWithCloud();

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const profile: UserRoleProfile = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          name: fbUser.displayName || (fbUser.email?.includes('heriansyah') ? 'HERIANSYAH, S.Si., S.Pd., M.Pd' : 'Kepala Sekolah Binaan'),
          role: fbUser.email?.includes('heriansyah') ? 'pengawas' : 'kepala_sekolah',
          schoolName: 'SMP Negeri 1 Merdeka Nusantara',
          createdAt: new Date().toISOString()
        };
        setCurrentUser(profile);
      }
    });

    return () => unsub();
  }, [refreshData, syncAllWithCloud]);

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
    syncSupervisionToCloud(record).catch((err) => console.warn('Cloud sync draft:', err));
    refreshData();
    showToast('Draf Tersimpan', `Supervisi ${record.identity.namaGuru} berhasil disimpan dan disinkronkan ke Cloud.`, 'info');
  };

  const handleCompleteSupervision = (record: SupervisionRecord) => {
    saveSupervisionRecord(record);
    syncSupervisionToCloud(record).catch((err) => console.warn('Cloud sync complete:', err));
    refreshData();
    setSelectedSupervisionId(record.id);
    setCurrentTab('results');
    setPrintSupervisionId(null);
    showToast(
      'Supervisi Selesai!',
      `Nilai Akhir: ${record.finalScore} (${record.category}). Dokumen siap dicetak dan tersimpan di Cloud.`,
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
        deleteSupervisionFromCloud(item.id).catch((err) => console.warn('Cloud delete supervision:', err));
        refreshData();
        setConfirmModal(null);
        showToast('Laporan Dihapus', 'Data supervisi berhasil dihapus dari sistem dan Cloud.', 'info');
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
      const updatedTeacher = { ...teacherData, id: teacherToEdit.id, createdAt: teacherToEdit.createdAt };
      syncTeacherToCloud(updatedTeacher).catch(console.warn);
      showToast('Data Guru Diperbarui', `Identitas ${teacherData.nama} berhasil disimpan dan disinkronkan ke Cloud.`, 'success');
    } else {
      const created = addTeacher(teacherData);
      syncTeacherToCloud(created).catch(console.warn);
      showToast('Guru Ditambahkan', `${teacherData.nama} berhasil didaftarkan dan tersimpan di Cloud.`, 'success');
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
        deleteTeacherFromCloud(teacher.id).catch(console.warn);
        refreshData();
        setConfirmModal(null);
        showToast('Guru Dihapus', `Data ${teacher.nama} berhasil dihapus dari sistem dan Cloud.`, 'info');
      }
    });
  };

  // Handlers: Principals CRUD (Supervisi Manajerial)
  const handleAddPrincipal = (pData: Omit<Principal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPrincipal = addPrincipal(pData);
    setPrincipals(getPrincipals());
    syncPrincipalToCloud(newPrincipal).catch((e) => console.warn('Cloud principal save failed', e));
    showToast('Kepala Sekolah Ditambahkan', `Data ${pData.nama} berhasil didaftarkan dan tersimpan.`, 'success');
  };

  const handleEditPrincipal = (id: string, updates: Partial<Principal>) => {
    updatePrincipal(id, updates);
    setPrincipals(getPrincipals());
    const updated = getPrincipals().find((p) => p.id === id);
    if (updated) {
      syncPrincipalToCloud(updated).catch((e) => console.warn('Cloud principal update failed', e));
    }
    showToast('Data Diperbarui', 'Data Kepala Sekolah berhasil disimpan ke sistem dan Cloud.', 'success');
  };

  const handleDeletePrincipal = (id: string) => {
    const p = principals.find((item) => item.id === id);
    if (!p) return;
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Data Kepala Sekolah?',
      message: `Apakah Anda yakin ingin menghapus data Kepala Sekolah ${p.nama} (${p.satuanPendidikan})? Tindakan ini tidak dapat dibatalkan.`,
      onConfirm: () => {
        deletePrincipal(id);
        deletePrincipalFromCloud(id).catch((e) => console.warn('Cloud principal delete failed', e));
        setPrincipals(getPrincipals());
        setConfirmModal(null);
        showToast('Data Dihapus', `Data ${p.nama} berhasil dihapus dari sistem.`, 'info');
      }
    });
  };

  const handleScheduleManagerialSupervision = (principal: Principal) => {
    setPresetManagerialPrincipal(principal);
    setCurrentTab('calendar');
    showToast('Jadwal Supervisi Manajerial', `Membuka kalender untuk ${principal.nama} (${principal.satuanPendidikan})`, 'info');
  };

  // Handlers: Settings & Reset
  const handleSaveSettings = (newSettings: AppSettings) => {
    saveSettings(newSettings);
    syncSettingsToCloud(newSettings).catch((err) => console.warn('Cloud sync settings:', err));
    refreshData();
    showToast('Pengaturan Disimpan', 'Identitas sekolah dan profil pengawas berhasil disimpan dan disinkronkan ke Cloud.', 'success');
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

  // Handlers: PM Reports (Praktik Pedagogis)
  const handleSavePMReport = (report: PMReport) => {
    savePMReport(report);
    syncPMReportToCloud(report).catch((err) => console.warn('Cloud sync PM report:', err));
    refreshData();
  };

  const handleDeletePMReport = (id: string) => {
    deletePMReport(id);
    deletePMReportFromCloud(id).catch((err) => console.warn('Cloud delete PM report:', err));
    refreshData();
  };

  // Handlers: PM Learning Environment (Iklim Psikologis & Efisiensi Waktu)
  const handleSaveLearningEnvRecord = (record: PMLearningEnvRecord) => {
    saveLearningEnvRecord(record);
    refreshData();
  };

  const handleDeleteLearningEnvRecord = (id: string) => {
    deleteLearningEnvRecord(id);
    refreshData();
  };

  // Handlers: PM Digital Utilization (SAMR & AI Literacy)
  const handleSaveDigitalPMRecord = (record: PMDigitalRecord) => {
    saveDigitalPMRecord(record);
    refreshData();
  };

  const handleDeleteDigitalPMRecord = (id: string) => {
    deleteDigitalPMRecord(id);
    refreshData();
  };

  // Handlers: Contextual Baseline Problems & Root-Cause Diagnosis
  const handleSaveContextualProblem = (record: ContextualProblemRecord) => {
    saveContextualProblem(record);
    refreshData();
    showToast('Data Awal & Akar Masalah Disimpan', `Rekam masalah "${record.problemTitle}" berhasil diperbarui`, 'success');
  };

  const handleDeleteContextualProblem = (id: string) => {
    deleteContextualProblem(id);
    refreshData();
    showToast('Data Dihapus', 'Rekam data awal & akar masalah kontekstual telah dihapus', 'info');
  };

  // Handlers: PM Learning Partnerships (Murid-Guru, Antarmurid, Orang Tua, Komunitas)
  const handleSavePartnershipPMRecord = (record: PMLearningPartnershipRecord) => {
    savePartnershipPMRecord(record);
    refreshData();
    showToast('Evaluasi Kemitraan Disimpan', `Rekam kemitraan pembelajaran ${record.teacherName} berhasil disimpan`, 'success');
  };

  const handleDeletePartnershipPMRecord = (id: string) => {
    deletePartnershipPMRecord(id);
    refreshData();
    showToast('Data Dihapus', 'Rekam evaluasi kemitraan pembelajaran telah dihapus', 'info');
  };

  // Handlers: SOAR Strategic Analysis (4 Pilar PM)
  const handleSaveSOARRecord = (record: SOARAnalysisRecord) => {
    saveSOARRecord(record);
    refreshData();
    showToast('Analisis SOAR Disimpan', `Analisis SOAR untuk ${record.schoolName} berhasil disimpan.`, 'success');
  };

  const handleDeleteSOARRecord = (id: string) => {
    deleteSOARRecord(id);
    refreshData();
    showToast('Analisis SOAR Dihapus', 'Dokumen analisis SOAR telah dihapus dari sistem.', 'info');
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
        currentUser={currentUser}
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

      {/* Left Sidebar (Desktop collapsible, Mobile drawer) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setPrintSupervisionId(null);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        teacherCount={teachers.length}
        principalCount={principals.length}
        supervisionCount={supervisions.length}
        pmReportCount={pmReports.length}
        supervisions={supervisions}
        pmReports={pmReports}
        isSupervisor={currentUser?.role === 'pengawas'}
        onOpenManagePrincipals={() => setIsManagePrincipalsOpen(true)}
      />

      {/* Main Workspace */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'lg:pl-64' : 'lg:pl-0'
        }`}
      >
        {/* Top Navbar */}
        <Navbar
          currentTab={currentTab}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onOpenMobileSidebar={() => setIsSidebarOpen(true)}
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
              onUpdateSettings={handleSaveSettings}
            />
          ) : (
            <>
              {/* Tab 1: Dashboard */}
              {currentTab === 'dashboard' && (
                <Dashboard
                  teachers={teachers}
                  supervisions={supervisions}
                  principalsCount={principals.length}
                  onStartSupervision={handleStartNewSupervision}
                  onViewResult={handleViewResult}
                  onPrintReport={handlePrintReport}
                  onNavigateToTeachers={() => setCurrentTab('teachers')}
                  onNavigateToPrincipals={() => setCurrentTab('principals')}
                  onNavigateToReports={() => setCurrentTab('reports')}
                  onNavigateToContextualProblems={() => setCurrentTab('contextual-problems')}
                  onNavigateToPM={() => setCurrentTab('pm-reports')}
                  onNavigateToQualityMap={() => setCurrentTab('quality-map')}
                  onNavigateToGrowthTracker={() => setCurrentTab('growth-tracker')}
                  onNavigateToCalendar={() => setCurrentTab('calendar')}
                  onNavigateToCoaching={() => setCurrentTab('coaching')}
                  onNavigateToQuadrant={() => setCurrentTab('teacher-quadrant')}
                  onNavigateToSOAR={() => setCurrentTab('soar-analysis')}
                  onOpenManagePrincipals={() => setIsManagePrincipalsOpen(true)}
                  isSupervisor={currentUser?.role === 'pengawas'}
                />
              )}

              {/* Tab: Kalender Supervisi & Agenda Kunjungan Sekolah */}
              {currentTab === 'calendar' && (
                <SupervisionCalendarView
                  teachers={teachers}
                  principals={principals}
                  supervisions={supervisions}
                  settings={settings}
                  presetManagerialPrincipal={presetManagerialPrincipal}
                  onClearPresetPrincipal={() => setPresetManagerialPrincipal(null)}
                  onStartSupervision={(teacherId) => handleStartNewSupervision(teacherId)}
                  onUpdateSettings={handleSaveSettings}
                  showToast={showToast}
                />
              )}

              {/* Tab: Data Kepala Sekolah (Supervisi Manajerial) */}
              {currentTab === 'principals' && (
                <PrincipalList
                  principals={principals}
                  settings={settings}
                  onAddPrincipal={handleAddPrincipal}
                  onEditPrincipal={handleEditPrincipal}
                  onDeletePrincipal={handleDeletePrincipal}
                  onScheduleManagerialSupervision={handleScheduleManagerialSupervision}
                  onNavigateToCalendar={() => setCurrentTab('calendar')}
                  showToast={showToast}
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

              {/* Tab: Data Awal & Akar Masalah Kontekstual */}
              {currentTab === 'contextual-problems' && (
                <ContextualProblemView
                  records={contextualProblems}
                  teachers={teachers}
                  settings={settings}
                  currentUser={currentUser}
                  onSaveRecord={handleSaveContextualProblem}
                  onDeleteRecord={handleDeleteContextualProblem}
                  onStartSupervision={(teacherId) => handleStartNewSupervision(teacherId)}
                  onNavigateToCoaching={(teacherId) => setCurrentTab('coaching')}
                  onNavigateToLearningEnv={() => setCurrentTab('pm-learning-env')}
                  onNavigateToDigitalPM={() => setCurrentTab('pm-digital')}
                  showToast={showToast}
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

              {/* Tab: Jurnal Coaching Dialogis Alur TIRTA */}
              {currentTab === 'coaching' && (
                <TirtaCoachingView
                  teachers={teachers}
                  supervisions={supervisions}
                  settings={settings}
                  onUpdateSettings={handleSaveSettings}
                  showToast={showToast}
                />
              )}

              {/* Tab: Matriks 4 Kuadran Guru (Supervisi Perkembangan Carl Glickman) */}
              {currentTab === 'teacher-quadrant' && (
                <TeacherQuadrantView
                  teachers={teachers}
                  supervisions={supervisions}
                  coachingRecords={getCoachingRecords()}
                  settings={settings}
                  onStartSupervision={(teacherId) => handleStartNewSupervision(teacherId)}
                  onNavigateToCoaching={() => setCurrentTab('coaching')}
                  onUpdateSettings={handleSaveSettings}
                  showToast={showToast}
                />
              )}

              {/* Tab 4: Hasil Supervisi */}
              {currentTab === 'results' && (
                activeRecord ? (
                  <SupervisionDetail
                    supervision={activeRecord}
                    settings={settings}
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

              {/* Tab 5: Laporan Supervisi */}
              {currentTab === 'reports' && (
                <ReportList
                  supervisions={supervisions}
                  settings={settings}
                  onViewDetail={handleViewResult}
                  onEditSupervision={handleEditSupervision}
                  onPrintReport={handlePrintReport}
                  onDeleteSupervision={handleDeleteSupervision}
                  onStartNewSupervision={() => handleStartNewSupervision()}
                />
              )}

              {/* Tab 6: Laporan Pengelolaan PM di Sekolah (Praktik Pedagogis) */}
              {currentTab === 'pm-reports' && (
                <PMManagementView
                  pmReports={pmReports}
                  supervisions={supervisions}
                  settings={settings}
                  currentUser={currentUser}
                  onSavePMReport={handleSavePMReport}
                  onDeletePMReport={handleDeletePMReport}
                  onNavigateToLearningEnv={() => setCurrentTab('pm-learning-env')}
                  showToast={showToast}
                />
              )}

              {/* Tab: Program Pengelolaan PM - Elemen Lingkungan Pembelajaran (Iklim Psikologis & Efisiensi Waktu) */}
              {currentTab === 'pm-learning-env' && (
                <PMLearningEnvView
                  records={learningEnvRecords}
                  teachers={teachers}
                  settings={settings}
                  currentUser={currentUser}
                  onSaveRecord={handleSaveLearningEnvRecord}
                  onDeleteRecord={handleDeleteLearningEnvRecord}
                  onNavigateToPedagogicalPM={() => setCurrentTab('pm-reports')}
                  onNavigateToDigitalPM={() => setCurrentTab('pm-digital')}
                  onNavigateToPartnershipPM={() => setCurrentTab('pm-partnership')}
                  showToast={showToast}
                />
              )}

              {/* Tab: Program Pengelolaan PM - Elemen Pemanfaatan Digital (SAMR & AI Literacy) */}
              {currentTab === 'pm-digital' && (
                <PMDigitalView
                  records={digitalPMRecords}
                  teachers={teachers}
                  settings={settings}
                  currentUser={currentUser}
                  onSaveRecord={handleSaveDigitalPMRecord}
                  onDeleteRecord={handleDeleteDigitalPMRecord}
                  onNavigateToPedagogicalPM={() => setCurrentTab('pm-reports')}
                  onNavigateToLearningEnv={() => setCurrentTab('pm-learning-env')}
                  onNavigateToPartnershipPM={() => setCurrentTab('pm-partnership')}
                  showToast={showToast}
                />
              )}

              {/* Tab: Program Pengelolaan PM - Elemen Kemitraan Pembelajaran (Aliansi Murid-Guru, Antarmurid, Orang Tua, & Komunitas) */}
              {currentTab === 'pm-partnership' && (
                <PMLearningPartnershipView
                  records={partnershipPMRecords}
                  teachers={teachers}
                  settings={settings}
                  currentUser={currentUser}
                  onSaveRecord={handleSavePartnershipPMRecord}
                  onDeleteRecord={handleDeletePartnershipPMRecord}
                  onNavigateToPedagogicalPM={() => setCurrentTab('pm-reports')}
                  onNavigateToLearningEnv={() => setCurrentTab('pm-learning-env')}
                  onNavigateToDigitalPM={() => setCurrentTab('pm-digital')}
                  showToast={showToast}
                />
              )}

              {/* Tab: Analisis Strategis SOAR & 4 Kerangka Pembelajaran Mendalam */}
              {currentTab === 'soar-analysis' && (
                <SOARAnalysisView
                  records={soarRecords}
                  settings={settings}
                  onSaveRecord={handleSaveSOARRecord}
                  onDeleteRecord={handleDeleteSOARRecord}
                  showToast={showToast}
                />
              )}

              {/* Tab 7: Peta Mutu & Komparasi Antar-Sekolah Binaan */}
              {currentTab === 'quality-map' && (
                <SchoolQualityMapView
                  supervisions={supervisions}
                  teachers={teachers}
                  pmReports={pmReports}
                  settings={settings}
                  onNavigateToSupervision={(school) => handleStartNewSupervision()}
                  onNavigateToPM={() => setCurrentTab('pm-reports')}
                  onUpdateSettings={handleSaveSettings}
                  showToast={showToast}
                />
              )}

              {/* Tab 8: Growth Tracker: Komparasi Siklus I vs Siklus II */}
              {currentTab === 'growth-tracker' && (
                <GrowthTrackerView
                  supervisions={supervisions}
                  teachers={teachers}
                  settings={settings}
                  onNavigateToSupervision={(teacherId) => handleStartNewSupervision(teacherId)}
                  onUpdateSettings={handleSaveSettings}
                  showToast={showToast}
                />
              )}

              {/* Tab 9: Pengaturan */}
              {currentTab === 'settings' && (
                <SettingsView
                  settings={settings}
                  currentUser={currentUser}
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
