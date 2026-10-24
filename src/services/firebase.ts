/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  deleteDoc,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '@/firebase-applet-config.json';

export { onAuthStateChanged };
import { SupervisionRecord, Teacher, Principal, ManagerialEvaluationRecord, AppSettings, PMReport, ManagedAccount, VisitAgenda } from '../types/inspiro';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID as required
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, working with cached/local data.');
      return false;
    }
    return true;
  }
}

export interface UserRoleProfile {
  uid: string;
  email: string;
  name: string;
  role: 'pengawas' | 'kepala_sekolah';
  nip?: string;
  schoolName?: string;
  schoolId?: string;
  createdAt: string;
}

// 1. Auth Services
export async function signInWithGoogle(): Promise<UserRoleProfile> {
  const res = await signInWithPopup(auth, googleProvider);
  const user = res.user;

  try {
    // Check or create profile in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      return snap.data() as UserRoleProfile;
    }

    // Default: If email matches supervisor, set as pengawas
    const defaultProfile: UserRoleProfile = {
      uid: user.uid,
      email: user.email || '',
      name: user.displayName || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
      role: user.email?.includes('heriansyah') ? 'pengawas' : 'kepala_sekolah',
      nip: '19820415 200801 1 007',
      schoolName: 'SMP Negeri 1 Merdeka Nusantara',
      createdAt: new Date().toISOString()
    };

    await setDoc(userDocRef, defaultProfile);
    return defaultProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    throw error;
  }
}

export async function loginWithEmail(email: string, pass: string): Promise<UserRoleProfile> {
  // 1. Authenticate with Firebase Auth
  const res = await signInWithEmailAndPassword(auth, email, pass);

  // 2. Query user profile from Firestore
  try {
    const snap = await getDoc(doc(db, 'users', res.user.uid));
    if (snap.exists()) {
      return snap.data() as UserRoleProfile;
    }
    const isSupervisor = email.toLowerCase().includes('heriansyah') || email.toLowerCase().includes('pengawas');
    const profile: UserRoleProfile = {
      uid: res.user.uid,
      email: res.user.email || email,
      name: isSupervisor ? 'HERIANSYAH, S.Si., S.Pd., M.Pd' : email.split('@')[0],
      role: isSupervisor ? 'pengawas' : 'kepala_sekolah',
      nip: isSupervisor ? '19820415 200801 1 007' : '',
      schoolName: isSupervisor ? 'Dinas Pendidikan / Seluruh Sekolah Binaan' : 'SMP Negeri 1 Merdeka Nusantara',
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', res.user.uid), profile);
    return profile;
  } catch (dbErr) {
    handleFirestoreError(dbErr, OperationType.GET, `users/${res.user.uid}`);
    throw dbErr;
  }
}

export async function registerWithEmail(
  email: string,
  pass: string,
  name: string,
  role: 'pengawas' | 'kepala_sekolah' = 'pengawas',
  schoolName?: string
): Promise<UserRoleProfile> {
  // CRITICAL BUSINESS RULE: Only Pengawas Sekolah is authorized to self-register
  if (role !== 'pengawas') {
    throw new Error('Pendaftaran akun mandiri HANYA diizinkan untuk Pengawas Sekolah.');
  }

  // 1. Create account with Firebase Auth
  const res = await createUserWithEmailAndPassword(auth, email, pass);

  // 2. Write profile to Firestore
  try {
    const profile: UserRoleProfile = {
      uid: res.user.uid,
      email: res.user.email || email,
      name,
      role: 'pengawas',
      nip: '19820415 200801 1 007',
      schoolName: schoolName || 'Dinas Pendidikan / Seluruh Sekolah Binaan',
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', res.user.uid), profile);
    return profile;
  } catch (dbErr) {
    handleFirestoreError(dbErr, OperationType.WRITE, `users/${res.user.uid}`);
    throw dbErr;
  }
}

export async function logOut(): Promise<void> {
  await fbSignOut(auth);
}

// 2. Cloud Firestore Data Synchronization
export async function syncSupervisionToCloud(record: SupervisionRecord): Promise<void> {
  const path = `supervisions/${record.id}`;
  try {
    await setDoc(doc(db, 'supervisions', record.id), record);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchCloudSupervisions(userProfile?: UserRoleProfile | null): Promise<SupervisionRecord[]> {
  const path = 'supervisions';
  try {
    let q = collection(db, 'supervisions');
    // If kepala_sekolah, filter by their school
    const snap = await getDocs(q);
    const list: SupervisionRecord[] = [];
    snap.forEach((d) => {
      list.push(d.data() as SupervisionRecord);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function syncTeacherToCloud(teacher: Teacher): Promise<void> {
  const path = `teachers/${teacher.id}`;
  try {
    await setDoc(doc(db, 'teachers', teacher.id), teacher);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchCloudTeachers(): Promise<Teacher[]> {
  const path = 'teachers';
  try {
    const snap = await getDocs(collection(db, 'teachers'));
    const list: Teacher[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Teacher);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// 3. Cloud Firestore PM Reports Synchronization (Praktik Pedagogis)
export async function syncPMReportToCloud(report: PMReport): Promise<void> {
  const path = `pm_reports/${report.id}`;
  try {
    await setDoc(doc(db, 'pm_reports', report.id), report);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchCloudPMReports(): Promise<PMReport[]> {
  const path = 'pm_reports';
  try {
    const snap = await getDocs(collection(db, 'pm_reports'));
    const list: PMReport[] = [];
    snap.forEach((d) => {
      list.push(d.data() as PMReport);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function deletePMReportFromCloud(id: string): Promise<void> {
  const path = `pm_reports/${id}`;
  try {
    await deleteDoc(doc(db, 'pm_reports', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function deleteSupervisionFromCloud(id: string): Promise<void> {
  const path = `supervisions/${id}`;
  try {
    await deleteDoc(doc(db, 'supervisions', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function deleteTeacherFromCloud(id: string): Promise<void> {
  const path = `teachers/${id}`;
  try {
    await deleteDoc(doc(db, 'teachers', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 4. Cloud Settings Sync
export async function syncSettingsToCloud(settings: AppSettings): Promise<void> {
  const path = 'settings/app_config';
  try {
    await setDoc(doc(db, 'settings', 'app_config'), settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchCloudSettings(): Promise<AppSettings | null> {
  const path = 'settings/app_config';
  try {
    const snap = await getDoc(doc(db, 'settings', 'app_config'));
    if (snap.exists()) {
      const data = snap.data() as AppSettings;
      if (
        !data.supervisorName ||
        data.supervisorName.toLowerCase().includes('rustina') ||
        data.supervisorName.toLowerCase().includes('suryanto') ||
        data.supervisorName.includes('Heriansyah.') ||
        data.supervisorName.includes('HERIANSYAH.') ||
        data.supervisorName === 'Heriansyah, S.Si., S.Pd., M.Pd' ||
        data.supervisorNip?.replace(/\s+/g, '') === '196812311995122017'
      ) {
        data.supervisorName = 'HERIANSYAH, S.Si., S.Pd., M.Pd';
        data.supervisorNip = '19820415 200801 1 007';
        data.supervisorRole = 'Pengawas Sekolah';
        setDoc(doc(db, 'settings', 'app_config'), data).catch(() => {});
      }
      return data;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

// 5. Cloud Managed Accounts Sync (Multi-Device Login for Pengawas & Kepsek Binaan)
export async function syncManagedAccountToCloud(account: ManagedAccount): Promise<void> {
  const path = `managed_accounts/${account.id}`;
  try {
    await setDoc(doc(db, 'managed_accounts', account.id), account);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteManagedAccountFromCloud(id: string): Promise<void> {
  const path = `managed_accounts/${id}`;
  try {
    await deleteDoc(doc(db, 'managed_accounts', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchCloudManagedAccounts(): Promise<ManagedAccount[]> {
  const path = 'managed_accounts';
  try {
    const snap = await getDocs(collection(db, 'managed_accounts'));
    const list: ManagedAccount[] = [];
    snap.forEach((d) => {
      list.push(d.data() as ManagedAccount);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// 6. Cloud Principals (Kepala Sekolah) Sync
export async function syncPrincipalToCloud(principal: Principal): Promise<void> {
  const path = `principals/${principal.id}`;
  try {
    await setDoc(doc(db, 'principals', principal.id), principal);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deletePrincipalFromCloud(id: string): Promise<void> {
  const path = `principals/${id}`;
  try {
    await deleteDoc(doc(db, 'principals', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchCloudPrincipals(): Promise<Principal[]> {
  const path = 'principals';
  try {
    const snap = await getDocs(collection(db, 'principals'));
    const list: Principal[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Principal);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// 7. Cloud Visit Agendas Sync
export async function syncAgendaToCloud(agenda: VisitAgenda): Promise<void> {
  const path = `visit_agendas/${agenda.id}`;
  try {
    await setDoc(doc(db, 'visit_agendas', agenda.id), agenda);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchCloudAgendas(): Promise<VisitAgenda[]> {
  const path = 'visit_agendas';
  try {
    const snap = await getDocs(collection(db, 'visit_agendas'));
    const list: VisitAgenda[] = [];
    snap.forEach((d) => {
      list.push(d.data() as VisitAgenda);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// 8. Cloud Managerial Evaluations (8 Dimensi Skala 1-4) Sync
export async function syncManagerialEvaluationToCloud(record: ManagerialEvaluationRecord): Promise<void> {
  const path = `managerial_evaluations/${record.id}`;
  try {
    await setDoc(doc(db, 'managerial_evaluations', record.id), record);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteManagerialEvaluationFromCloud(id: string): Promise<void> {
  const path = `managerial_evaluations/${id}`;
  try {
    await deleteDoc(doc(db, 'managerial_evaluations', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchCloudManagerialEvaluations(): Promise<ManagerialEvaluationRecord[]> {
  const path = 'managerial_evaluations';
  try {
    const snap = await getDocs(collection(db, 'managerial_evaluations'));
    const list: ManagerialEvaluationRecord[] = [];
    snap.forEach((d) => {
      list.push(d.data() as ManagerialEvaluationRecord);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}


