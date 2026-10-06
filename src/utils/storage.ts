/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DEFAULT_SETTINGS, SEED_SUPERVISIONS, SEED_TEACHERS } from '../data/seedData';
import {
  AppSettings,
  ManagedAccount,
  OBSERVATION_INDICATORS,
  RuleBasedAnalysis,
  SupervisionCategory,
  SupervisionRecord,
  Teacher
} from '../types/inspiro';

const TEACHERS_KEY = 'inspiro_teachers';
const SUPERVISIONS_KEY = 'inspiro_supervisions';
const SETTINGS_KEY = 'inspiro_settings';

// Helper to safely parse JSON from localStorage
function safeParse<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return fallback;
  }
}

// 1. Teachers CRUD
export function getTeachers(): Teacher[] {
  const teachers = safeParse<Teacher[]>(TEACHERS_KEY, []);
  if (teachers.length === 0) {
    // Seed initial data
    saveTeachers(SEED_TEACHERS);
    return SEED_TEACHERS;
  }
  return teachers;
}

export function saveTeachers(teachers: Teacher[]): void {
  try {
    localStorage.setItem(TEACHERS_KEY, JSON.stringify(teachers));
  } catch (e) {
    console.error('Error saving teachers:', e);
  }
}

export function addTeacher(teacher: Omit<Teacher, 'id' | 'createdAt'>): Teacher {
  const current = getTeachers();
  const newTeacher: Teacher = {
    ...teacher,
    id: `G${String(current.length + 1).padStart(3, '0')}-${Date.now().toString().slice(-4)}`,
    createdAt: new Date().toISOString()
  };
  const updated = [newTeacher, ...current];
  saveTeachers(updated);
  return newTeacher;
}

export function updateTeacher(id: string, updates: Partial<Teacher>): boolean {
  const current = getTeachers();
  const index = current.findIndex((t) => t.id === id);
  if (index === -1) return false;
  current[index] = { ...current[index], ...updates };
  saveTeachers(current);
  return true;
}

export function deleteTeacher(id: string): boolean {
  const current = getTeachers();
  const filtered = current.filter((t) => t.id !== id);
  if (filtered.length === current.length) return false;
  saveTeachers(filtered);
  return true;
}

// 2. Supervisions CRUD
export function getSupervisions(): SupervisionRecord[] {
  const records = safeParse<SupervisionRecord[]>(SUPERVISIONS_KEY, []);
  if (records.length === 0) {
    saveSupervisions(SEED_SUPERVISIONS);
    return SEED_SUPERVISIONS;
  }
  // Auto-migrate any legacy placeholder supervisor name in existing records
  let migrated = false;
  const currentSettings = safeParse<AppSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  const updated = records.map((r) => {
    if (r.identity?.namaSupervisor === 'Drs. H. Suryanto, M.Pd.') {
      migrated = true;
      return {
        ...r,
        identity: {
          ...r.identity,
          namaSupervisor: currentSettings.supervisorName || 'Heriansyah., S.Si., S.Pd., M.Pd',
          nipSupervisor: currentSettings.supervisorNip || '19820415 200801 1 007',
          jabatanSupervisor: currentSettings.supervisorRole || 'Pengawas Sekolah'
        }
      };
    }
    return r;
  });
  if (migrated) {
    saveSupervisions(updated);
    return updated;
  }
  return records;
}

export function saveSupervisions(records: SupervisionRecord[]): void {
  try {
    localStorage.setItem(SUPERVISIONS_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving supervisions:', e);
  }
}

export function getSupervisionById(id: string): SupervisionRecord | undefined {
  return getSupervisions().find((s) => s.id === id);
}

export function saveSupervisionRecord(record: SupervisionRecord): void {
  const current = getSupervisions();
  const index = current.findIndex((s) => s.id === record.id);
  if (index >= 0) {
    current[index] = { ...record, updatedAt: new Date().toISOString() };
  } else {
    current.unshift({ ...record, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  saveSupervisions(current);
}

export function deleteSupervisionRecord(id: string): boolean {
  const current = getSupervisions();
  const filtered = current.filter((s) => s.id !== id);
  if (filtered.length === current.length) return false;
  saveSupervisions(filtered);
  return true;
}

// 3. Settings
export function getSettings(): AppSettings {
  const current = safeParse<AppSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  // Auto-migrate legacy placeholder name or role
  if (
    current.supervisorName === 'Drs. H. Suryanto, M.Pd.' ||
    current.supervisorRole === 'Kepala Sekolah / Supervisor Akademik'
  ) {
    const updated: AppSettings = {
      ...current,
      supervisorName:
        current.supervisorName === 'Drs. H. Suryanto, M.Pd.'
          ? 'Heriansyah., S.Si., S.Pd., M.Pd'
          : current.supervisorName,
      supervisorRole:
        current.supervisorRole === 'Kepala Sekolah / Supervisor Akademik'
          ? 'Pengawas Sekolah'
          : current.supervisorRole,
      supervisorNip:
        current.supervisorNip === '19680512 199412 1 002'
          ? '19820415 200801 1 007'
          : current.supervisorNip
    };
    saveSettings(updated);
    return updated;
  }
  return current;
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

    // Also update existing supervisions to reflect the updated supervisor name & role
    const supervisions = safeParse<SupervisionRecord[]>(SUPERVISIONS_KEY, []);
    if (supervisions.length > 0) {
      let changed = false;
      const updated = supervisions.map((s) => {
        if (
          !s.identity.namaSupervisor ||
          s.identity.namaSupervisor === 'Drs. H. Suryanto, M.Pd.' ||
          s.identity.namaSupervisor === settings.supervisorName
        ) {
          changed = true;
          return {
            ...s,
            identity: {
              ...s.identity,
              namaSupervisor: settings.supervisorName,
              nipSupervisor: settings.supervisorNip,
              jabatanSupervisor: settings.supervisorRole,
              satuanPendidikan: settings.schoolName || s.identity.satuanPendidikan
            }
          };
        }
        return s;
      });
      if (changed) {
        localStorage.setItem(SUPERVISIONS_KEY, JSON.stringify(updated));
      }
    }
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

// 4. Calculations
export function calculateScore(scores: Record<number, number>): {
  totalScore: number;
  finalScore: number;
  category: SupervisionCategory;
} {
  let totalScore = 0;
  for (let i = 1; i <= 12; i++) {
    const val = scores[i] || 0;
    totalScore += val;
  }

  // Formula: (Total Skor / 48) * 100
  const rawFinal = (totalScore / 48) * 100;
  const finalScore = Number(rawFinal.toFixed(1));

  let category: SupervisionCategory = 'Kurang (K)';
  if (finalScore >= 91) {
    category = 'Amat Baik (SB)';
  } else if (finalScore >= 81) {
    category = 'Baik (B)';
  } else if (finalScore >= 71) {
    category = 'Cukup (C)';
  } else {
    category = 'Kurang (K)';
  }

  return { totalScore, finalScore, category };
}

// 5. Rule-Based Analysis Engine (Kurikulum Merdeka)
export function analyzeSupervision(record: SupervisionRecord): RuleBasedAnalysis {
  const scores = record.scores || {};
  const strengths: RuleBasedAnalysis['strengths'] = [];
  const growthAreas: RuleBasedAnalysis['growthAreas'] = [];
  const recommendations: RuleBasedAnalysis['recommendations'] = [];

  // Breakdown per Stage
  let pTotal = 0;
  let iTotal = 0;
  let clTotal = 0;

  OBSERVATION_INDICATORS.forEach((ind) => {
    const sc = scores[ind.id] || 0;
    const note = record.notes[ind.id] || ind.description;

    if (ind.section === 'pendahuluan') pTotal += sc;
    else if (ind.section === 'inti') iTotal += sc;
    else if (ind.section === 'penutup') clTotal += sc;

    if (sc === 4) {
      strengths.push({
        id: ind.id,
        title: ind.title,
        score: sc,
        comment: note
      });
    } else if (sc <= 2) {
      growthAreas.push({
        id: ind.id,
        title: ind.title,
        score: sc,
        comment: note
      });
    }
  });

  // If no indicators <= 2, find the lowest score to offer constructive growth
  if (growthAreas.length === 0) {
    let minScore = 5;
    OBSERVATION_INDICATORS.forEach((ind) => {
      const sc = scores[ind.id] || 0;
      if (sc < minScore) minScore = sc;
    });

    OBSERVATION_INDICATORS.forEach((ind) => {
      const sc = scores[ind.id] || 0;
      if (sc === minScore && sc < 4) {
        growthAreas.push({
          id: ind.id,
          title: ind.title,
          score: sc,
          comment: record.notes[ind.id] || `Dapat terus dioptimalkan agar mencapai predikat Sangat Baik (skor 4).`
        });
      }
    });
  }

  // If no strengths score 4, grab score 3
  if (strengths.length === 0) {
    OBSERVATION_INDICATORS.forEach((ind) => {
      const sc = scores[ind.id] || 0;
      if (sc === 3) {
        strengths.push({
          id: ind.id,
          title: ind.title,
          score: sc,
          comment: record.notes[ind.id] || ind.description
        });
      }
    });
  }

  // Specific Pedagogical Recommendations (Rule-Based)
  // Indikator 2: Asesmen awal
  if ((scores[2] || 0) <= 3) {
    recommendations.push({
      category: 'Asesmen Awal & Kesiapan Murid',
      action: 'Lakukan asesmen diagnostik non-kognitif dan kognitif singkat di awal tema untuk memetakan kesiapan murid sebelum merancang modul ajar.',
      reference: 'Panduan Pembelajaran dan Asesmen (PPA) Kurikulum Merdeka'
    });
  }

  // Indikator 5: Pembelajaran Berdiferensiasi
  if ((scores[5] || 0) <= 3) {
    recommendations.push({
      category: 'Pembelajaran Berdiferensiasi',
      action: 'Terapkan diferensiasi proses melalui pemberian bimbingan berjenjang (scaffolding) dan LKPD bertingkat (tiered task) sesuai kelompok kesiapan belajar.',
      reference: 'Prinsip Diferensiasi Konten, Proses, dan Produk Ditjen GTK Kemendikbudristek'
    });
  }

  // Indikator 6: HOTS & 4C
  if ((scores[6] || 0) <= 3) {
    recommendations.push({
      category: 'Keterampilan Berpikir Tingkat Tinggi (HOTS)',
      action: 'Gunakan pertanyaan pemantik terbuka (C4-C6) yang memancing rasa penasaran murid dan dorong kolaborasi pemecahan masalah nyata.',
      reference: 'Model Pembelajaran Inovatif Berbasis Masalah & Proyek (PBL/PjBL)'
    });
  }

  // Indikator 8: Manajemen Kelas & Disiplin Positif
  if ((scores[8] || 0) <= 3) {
    recommendations.push({
      category: 'Disiplin Positif & Budaya Positif',
      action: 'Gunakan segitiga restitusi dan kuatkan keyakinan kelas yang disepakati bersama secara partisipatif untuk menggantikan sanksi atau teguran reaktif.',
      reference: 'Penerapan Disiplin Positif Ki Hadjar Dewantara & Teori Kontrol Dr. William Glasser'
    });
  }

  // Indikator 9: Integrasi KSE
  if ((scores[9] || 0) <= 3) {
    recommendations.push({
      category: 'Kompetensi Sosial Emosional (KSE)',
      action: 'Sisipkan latihan kesadaran penuh (Mindfulness / Teknik STOP) sebelum memulai aktivitas inti atau saat murid mulai lelah guna memulihkan fokus.',
      reference: 'Modul Guru Penggerak: Pembelajaran Sosial Emosional (CASEL Framework)'
    });
  }

  // Indikator 11: Asesmen Formatif Akhir
  if ((scores[11] || 0) <= 3) {
    recommendations.push({
      category: 'Asesmen Formatif & Umpan Balik',
      action: 'Alokasikan minimal 10 menit di akhir sesi untuk instrumen exit ticket singkat 2 soal atau cek pemahaman mandiri agar data capaian hari itu terekam.',
      reference: 'Asesmen Formatif Berkelanjutan untuk Memperbaiki Mutu Pembelajaran'
    });
  }

  // Indikator 7: Media IT & TPACK
  if ((scores[7] || 0) <= 3) {
    recommendations.push({
      category: 'Teknologi & Media Pembelajaran (TPACK)',
      action: 'Optimalkan media digital interaktif seperti Canva for Education, Quizizz, simulasi virtual PhET, atau modul ajar dari PMM.',
      reference: 'Pemanfaatan Teknologi Informasi Kurikulum Merdeka'
    });
  }

  // Default recommendation if all high
  if (recommendations.length === 0) {
    recommendations.push({
      category: 'Pengimbasan & Praktik Baik',
      action: 'Praktik pembelajaran telah mencapai standar Amat Baik. Guru didorong menjadi narasumber berbagi praktik baik di Komunitas Belajar (Kombel) sekolah atau MGMP.',
      reference: 'Pemberdayaan Komunitas Belajar Sekolah (Platform Merdeka Mengajar)'
    });
  }

  return {
    strengths,
    growthAreas,
    recommendations,
    breakdown: {
      pendahuluan: {
        total: pTotal,
        max: 12,
        percentage: Math.round((pTotal / 12) * 100)
      },
      inti: {
        total: iTotal,
        max: 24,
        percentage: Math.round((iTotal / 24) * 100)
      },
      penutup: {
        total: clTotal,
        max: 12,
        percentage: Math.round((clTotal / 12) * 100)
      }
    }
  };
}

// 6. Data Backup & Reset
export function exportDataAsJson(): string {
  const data = {
    app: 'INSPIRO',
    version: '1.0',
    exportDate: new Date().toISOString(),
    teachers: getTeachers(),
    supervisions: getSupervisions(),
    settings: getSettings()
  };
  return JSON.stringify(data, null, 2);
}

export function importDataFromJson(jsonStr: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || (!parsed.teachers && !parsed.supervisions)) {
      return { success: false, message: 'Format berkas JSON tidak valid atau bukan berkas INSPIRO.' };
    }
    if (Array.isArray(parsed.teachers)) {
      saveTeachers(parsed.teachers);
    }
    if (Array.isArray(parsed.supervisions)) {
      saveSupervisions(parsed.supervisions);
    }
    if (parsed.settings && typeof parsed.settings === 'object') {
      saveSettings(parsed.settings);
    }
    return { success: true, message: 'Data supervisi berhasil dipulihkan dari berkas backup!' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Kesalahan parsing JSON';
    return { success: false, message: `Gagal membaca berkas: ${errorMsg}` };
  }
}

export function resetToDemoData(): void {
  saveTeachers(SEED_TEACHERS);
  saveSupervisions(SEED_SUPERVISIONS);
  saveSettings(DEFAULT_SETTINGS);
  saveManagedAccounts(DEFAULT_ACCOUNTS);
}

// 7. Managed Accounts (Pengawas & Kepala Sekolah Binaan)
const MANAGED_ACCOUNTS_KEY = 'inspiro_managed_accounts';

export const DEFAULT_ACCOUNTS: ManagedAccount[] = [
  {
    id: 'acc-pengawas-01',
    email: 'heriansyah396@gmail.com',
    password: 'pengawas123',
    name: 'Heriansyah., S.Si., S.Pd., M.Pd',
    nip: '19820415 200801 1 007',
    role: 'pengawas',
    schoolName: 'Dinas Pendidikan / Seluruh Sekolah Binaan',
    createdAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'acc-kepsek-01',
    email: 'kepsek.smpn1@belajar.id',
    password: 'kepsek123',
    name: 'Dra. Hj. Nurhasanah, M.Pd.',
    nip: '19720815 199802 2 003',
    role: 'kepala_sekolah',
    schoolName: 'SMP Negeri 1 Merdeka Nusantara',
    createdAt: '2026-09-01T08:30:00Z'
  },
  {
    id: 'acc-kepsek-02',
    email: 'kepsek.smpn2@belajar.id',
    password: 'kepsek123',
    name: 'Drs. Bambang Irawan, M.Pd.',
    nip: '19690312 199512 1 001',
    role: 'kepala_sekolah',
    schoolName: 'SMP Negeri 2 Merdeka Nusantara',
    createdAt: '2026-09-02T09:00:00Z'
  }
];

export function getManagedAccounts(): ManagedAccount[] {
  const accounts = safeParse<ManagedAccount[]>(MANAGED_ACCOUNTS_KEY, []);
  if (accounts.length === 0) {
    saveManagedAccounts(DEFAULT_ACCOUNTS);
    return DEFAULT_ACCOUNTS;
  }
  return accounts;
}

export function saveManagedAccounts(accounts: ManagedAccount[]): void {
  try {
    localStorage.setItem(MANAGED_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Error saving managed accounts:', e);
  }
}

export function addManagedAccount(account: Omit<ManagedAccount, 'id' | 'createdAt'>): ManagedAccount {
  const current = getManagedAccounts();
  const newAccount: ManagedAccount = {
    ...account,
    id: `acc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    createdAt: new Date().toISOString()
  };
  const updated = [...current, newAccount];
  saveManagedAccounts(updated);
  return newAccount;
}

export function deleteManagedAccount(id: string): boolean {
  const current = getManagedAccounts();
  const filtered = current.filter((a) => a.id !== id);
  if (filtered.length === current.length) return false;
  saveManagedAccounts(filtered);
  return true;
}

export function authenticateUser(emailOrUsername: string, pass: string): ManagedAccount | null {
  const current = getManagedAccounts();
  const trimmedUser = emailOrUsername.trim().toLowerCase();

  const found = current.find(
    (a) =>
      a.email.toLowerCase() === trimmedUser ||
      a.email.toLowerCase().split('@')[0] === trimmedUser ||
      (trimmedUser === 'pengawas' && a.role === 'pengawas') ||
      (trimmedUser === 'kepsek' && a.role === 'kepala_sekolah')
  );

  if (found && (!found.password || found.password === pass)) {
    return found;
  }
  return null;
}
