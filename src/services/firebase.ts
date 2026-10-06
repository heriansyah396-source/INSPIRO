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
import { SupervisionRecord, Teacher, AppSettings } from '../types/inspiro';

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
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;

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
      name: user.displayName || 'Heriansyah., S.Si., S.Pd., M.Pd',
      role: user.email?.includes('heriansyah') ? 'pengawas' : 'kepala_sekolah',
      nip: '19820415 200801 1 007',
      schoolName: 'SMP Negeri 1 Merdeka Nusantara',
      createdAt: new Date().toISOString()
    };

    await setDoc(userDocRef, defaultProfile);
    return defaultProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'users');
    throw error;
  }
}

export async function loginWithEmail(email: string, pass: string): Promise<UserRoleProfile> {
  try {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    const snap = await getDoc(doc(db, 'users', res.user.uid));
    if (snap.exists()) {
      return snap.data() as UserRoleProfile;
    }
    const isSupervisor = email.toLowerCase().includes('heriansyah') || email.toLowerCase().includes('pengawas');
    const profile: UserRoleProfile = {
      uid: res.user.uid,
      email: res.user.email || email,
      name: isSupervisor ? 'Heriansyah., S.Si., S.Pd., M.Pd' : email.split('@')[0],
      role: isSupervisor ? 'pengawas' : 'kepala_sekolah',
      nip: isSupervisor ? '19820415 200801 1 007' : '',
      schoolName: isSupervisor ? 'Dinas Pendidikan / Seluruh Sekolah Binaan' : 'SMP Negeri 1 Merdeka Nusantara',
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', res.user.uid), profile);
    return profile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'users');
    throw error;
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

  try {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
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
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'users');
    throw error;
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
