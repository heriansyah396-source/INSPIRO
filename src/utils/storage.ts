/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DEFAULT_SETTINGS, SEED_SUPERVISIONS, SEED_TEACHERS } from '../data/seedData';
import { SEED_VISIT_AGENDAS } from '../data/seedAgendas';
import { SEED_COACHING_RECORDS } from '../data/seedCoaching';
import { SEED_LEARNING_ENV_RECORDS } from '../data/seedLearningEnv';
import { SEED_DIGITAL_PM_RECORDS } from '../data/seedDigitalPM';
import { SEED_CONTEXTUAL_PROBLEMS } from '../data/seedContextualProblems';
import { SEED_PARTNERSHIP_PM_RECORDS } from '../data/seedLearningPartnership';
import { SEED_SOAR_RECORDS } from '../data/seedSOAR';
import { SEED_PRINCIPALS } from '../data/seedPrincipals';
import { SEED_MANAGERIAL_EVALUATIONS } from '../data/seedManagerialEvaluations';
import { DEFAULT_SIDRAP_LOGO, DEFAULT_TUTWURI_LOGO } from '../data/defaultLogos';
import {
  AppSettings,
  ManagedAccount,
  OBSERVATION_INDICATORS,
  RuleBasedAnalysis,
  SupervisionCategory,
  SupervisionRecord,
  Teacher,
  Principal,
  ManagerialEvaluationRecord,
  PMReport,
  VisitAgenda,
  TirtaCoachingRecord,
  PMLearningEnvRecord,
  PMDigitalRecord,
  ContextualProblemRecord,
  PMLearningPartnershipRecord,
  SOARAnalysisRecord
} from '../types/inspiro';

const TEACHERS_KEY = 'inspiro_teachers';
const PRINCIPALS_KEY = 'inspiro_principals';
const MANAGERIAL_EVALUATIONS_KEY = 'inspiro_managerial_evaluations';
const SUPERVISIONS_KEY = 'inspiro_supervisions';
const SETTINGS_KEY = 'inspiro_settings';
const VISIT_AGENDAS_KEY = 'inspiro_visit_agendas';
const LEARNING_ENV_RECORDS_KEY = 'inspiro_learning_env_records';
const DIGITAL_PM_RECORDS_KEY = 'inspiro_digital_pm_records';
const PARTNERSHIP_PM_RECORDS_KEY = 'inspiro_pm_partnership_records';
const CONTEXTUAL_PROBLEMS_KEY = 'inspiro_contextual_problems';
const COACHING_RECORDS_KEY = 'inspiro_coaching_records';
const SOAR_RECORDS_KEY = 'inspiro_soar_records';

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

// 1.5. Principals (Kepala Sekolah Binaan) CRUD
export function getPrincipals(): Principal[] {
  const principals = safeParse<Principal[]>(PRINCIPALS_KEY, []);
  if (principals.length === 0) {
    savePrincipals(SEED_PRINCIPALS);
    return SEED_PRINCIPALS;
  }
  return principals;
}

export function savePrincipals(principals: Principal[]): void {
  try {
    localStorage.setItem(PRINCIPALS_KEY, JSON.stringify(principals));
  } catch (e) {
    console.error('Error saving principals:', e);
  }
}

export function addPrincipal(principal: Omit<Principal, 'id' | 'createdAt'>): Principal {
  const current = getPrincipals();
  const newPrincipal: Principal = {
    ...principal,
    id: `KS${String(current.length + 1).padStart(3, '0')}-${Date.now().toString().slice(-4)}`,
    createdAt: new Date().toISOString()
  };
  const updated = [newPrincipal, ...current];
  savePrincipals(updated);
  return newPrincipal;
}

export function updatePrincipal(id: string, updates: Partial<Principal>): boolean {
  const current = getPrincipals();
  const index = current.findIndex((p) => p.id === id);
  if (index === -1) return false;
  current[index] = { ...current[index], ...updates, updatedAt: new Date().toISOString() };
  savePrincipals(current);
  return true;
}

export function deletePrincipal(id: string): boolean {
  const current = getPrincipals();
  const filtered = current.filter((p) => p.id !== id);
  if (filtered.length === current.length) return false;
  savePrincipals(filtered);
  return true;
}

export function getPrincipalById(id: string): Principal | null {
  const current = getPrincipals();
  return current.find((p) => p.id === id) || null;
}

// 1.6. Managerial Supervision (8 Dimensi Skala 1-4) CRUD
export function getManagerialEvaluations(): ManagerialEvaluationRecord[] {
  const records = safeParse<ManagerialEvaluationRecord[]>(MANAGERIAL_EVALUATIONS_KEY, []);
  if (records.length === 0) {
    saveManagerialEvaluations(SEED_MANAGERIAL_EVALUATIONS);
    return SEED_MANAGERIAL_EVALUATIONS;
  }
  return records;
}

export function saveManagerialEvaluations(records: ManagerialEvaluationRecord[]): void {
  try {
    localStorage.setItem(MANAGERIAL_EVALUATIONS_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving managerial evaluations:', e);
  }
}

export function saveManagerialEvaluation(record: ManagerialEvaluationRecord): void {
  const current = getManagerialEvaluations();
  const index = current.findIndex((r) => r.id === record.id);
  let updated: ManagerialEvaluationRecord[];

  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...record, updatedAt: new Date().toISOString() };
  } else {
    updated = [record, ...current];
  }
  saveManagerialEvaluations(updated);

  // Automatically update the Principal's managerial summary in real time!
  if (record.principalId) {
    updatePrincipal(record.principalId, {
      statusSupervisiManajerial: record.status === 'selesai' ? 'Selesai' : 'Terjadwal',
      skorManajerialTerakhir: record.finalScore,
      predikatManajerial: record.predicate,
      tanggalSupervisiTerakhir: record.date,
      catatanPengawas: record.catatanPengawas,
      rekomendasiManajerial: record.rekomendasiManajerial
    });
  }
}

export function deleteManagerialEvaluation(id: string): boolean {
  const current = getManagerialEvaluations();
  const filtered = current.filter((r) => r.id !== id);
  if (filtered.length === current.length) return false;
  saveManagerialEvaluations(filtered);
  return true;
}

export function getManagerialEvaluationByPrincipalId(principalId: string): ManagerialEvaluationRecord | null {
  const current = getManagerialEvaluations();
  return current.find((r) => r.principalId === principalId) || null;
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
    const isLegacy =
      r.identity?.namaSupervisor === 'Drs. H. Suryanto, M.Pd.' ||
      r.identity?.namaSupervisor?.toLowerCase().includes('rustina') ||
      r.identity?.namaSupervisor?.includes('Heriansyah.') ||
      r.identity?.namaSupervisor?.includes('HERIANSYAH.');

    if (isLegacy) {
      migrated = true;
      return {
        ...r,
        identity: {
          ...r.identity,
          namaSupervisor: currentSettings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
          nipSupervisor: currentSettings.supervisorNip || '19830819 201001 1 002',
          jabatanSupervisor: currentSettings.supervisorRole || 'Pengawas Sekolah Pembina'
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
  // Auto-migrate legacy placeholder name or incorrect supervisor name/NIP
  const isRustinaOrLegacy =
    !current.supervisorName ||
    current.supervisorName.toLowerCase().includes('rustina') ||
    current.supervisorName.toLowerCase().includes('suryanto') ||
    current.supervisorName.includes('Heriansyah.') ||
    current.supervisorName.includes('HERIANSYAH.') ||
    current.supervisorName === 'Heriansyah, S.Si., S.Pd., M.Pd' ||
    current.supervisorNip.replace(/\s+/g, '') === '196812311995122017' ||
    current.supervisorNip.replace(/\s+/g, '') === '196805121994121002' ||
    current.supervisorRole === 'Kepala Sekolah / Supervisor Akademik';

  const isOldNip =
    !current.supervisorNip ||
    current.supervisorNip.includes('19820415') ||
    current.supervisorNip.replace(/\s+/g, '') === '198204152008011007';

  const needsRankMigrate =
    !current.supervisorRank ||
    current.supervisorRank.includes('Pembina Tk. I / IV.b') ||
    current.supervisorRank.includes('IV.b');

  const needsGovMigrate =
    !current.governmentAgency ||
    current.governmentAgency.includes('PROVINSI / KABUPATEN / KOTA') ||
    current.governmentAgency.includes('KABUPATEN / KOTA');

  const needsLogoMigrate = !current.logoUrl;

  if (isRustinaOrLegacy || isOldNip || needsRankMigrate || needsGovMigrate || needsLogoMigrate) {
    const updated: AppSettings = {
      ...current,
      governmentAgency: current.governmentAgency && !current.governmentAgency.includes('PROVINSI / KABUPATEN / KOTA')
        ? current.governmentAgency
        : 'PEMERINTAH KABUPATEN SIDENRENG RAPPANG',
      schoolCity: current.schoolCity === 'Kota Pendidikan' ? 'Kabupaten Sidenreng Rappang' : (current.schoolCity || 'Kabupaten Sidenreng Rappang'),
      schoolAddress: current.schoolAddress?.includes('Jl. Pemuda')
        ? 'Jl. Harapan Baru Blok C No. 22, Pangkajene, Watang Pulu, Kab. Sidenreng Rappang'
        : (current.schoolAddress || 'Jl. Harapan Baru Blok C No. 22, Pangkajene, Watang Pulu, Kab. Sidenreng Rappang'),
      supervisorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
      supervisorRole: current.supervisorRole && current.supervisorRole !== 'Kepala Sekolah / Supervisor Akademik'
        ? current.supervisorRole
        : 'Pengawas Sekolah Pembina',
      supervisorNip: isOldNip ? '19830819 201001 1 002' : (current.supervisorNip || '19830819 201001 1 002'),
      supervisorRank: needsRankMigrate ? 'Penata Tk. I / III.d' : (current.supervisorRank || 'Penata Tk. I / III.d'),
      logoUrl: current.logoUrl || DEFAULT_SIDRAP_LOGO,
      logoRightUrl: current.logoRightUrl || DEFAULT_TUTWURI_LOGO
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
        const isLegacySupervisor =
          !s.identity.namaSupervisor ||
          s.identity.namaSupervisor === 'Drs. H. Suryanto, M.Pd.' ||
          s.identity.namaSupervisor.toLowerCase().includes('rustina') ||
          s.identity.nipSupervisor?.replace(/\s+/g, '') === '196812311995122017' ||
          s.identity.namaSupervisor === settings.supervisorName;

        if (isLegacySupervisor) {
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
  savePrincipals(SEED_PRINCIPALS);
  saveManagerialEvaluations(SEED_MANAGERIAL_EVALUATIONS);
  saveSupervisions(SEED_SUPERVISIONS);
  saveSettings(DEFAULT_SETTINGS);
  saveManagedAccounts(DEFAULT_ACCOUNTS);
  saveVisitAgendas(SEED_VISIT_AGENDAS);
}

// 7. Managed Accounts (Pengawas & Kepala Sekolah Binaan)
const MANAGED_ACCOUNTS_KEY = 'inspiro_managed_accounts';

export const DEFAULT_ACCOUNTS: ManagedAccount[] = [
  {
    id: 'acc-pengawas-01',
    email: 'heriansyah396@gmail.com',
    password: '19081983',
    name: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    nip: '19830819 201001 1 002',
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

  // Ensure the primary Pengawas account has the updated name, NIP, and password
  const pengawasIdx = accounts.findIndex(
    (a) => a.email.toLowerCase() === 'heriansyah396@gmail.com' || a.role === 'pengawas'
  );
  if (pengawasIdx !== -1) {
    let changed = false;
    if (accounts[pengawasIdx].password === 'pengawas123') {
      accounts[pengawasIdx].password = '19081983';
      changed = true;
    }
    if (
      accounts[pengawasIdx].name.toLowerCase().includes('rustina') ||
      accounts[pengawasIdx].name.toLowerCase().includes('suryanto') ||
      accounts[pengawasIdx].name.includes('Heriansyah.') ||
      accounts[pengawasIdx].name.includes('HERIANSYAH.') ||
      accounts[pengawasIdx].name === 'Heriansyah, S.Si., S.Pd., M.Pd' ||
      accounts[pengawasIdx].nip?.replace(/\s+/g, '') === '196812311995122017' ||
      accounts[pengawasIdx].nip?.includes('19820415') ||
      accounts[pengawasIdx].name !== 'HERIANSYAH, S.Si., S.Pd., M.Pd'
    ) {
      accounts[pengawasIdx].name = 'HERIANSYAH, S.Si., S.Pd., M.Pd';
      accounts[pengawasIdx].nip = '19830819 201001 1 002';
      accounts[pengawasIdx].email = 'heriansyah396@gmail.com';
      changed = true;
    }
    if (changed) {
      saveManagedAccounts(accounts);
    }
  } else {
    accounts.unshift(DEFAULT_ACCOUNTS[0]);
    saveManagedAccounts(accounts);
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

export function updateManagedAccountPassword(emailOrId: string, newPass: string): boolean {
  if (!emailOrId || !newPass) return false;
  const current = getManagedAccounts();
  const trimmed = emailOrId.trim().toLowerCase();
  let updated = false;

  const newList = current.map((acc) => {
    if (
      acc.id === emailOrId ||
      acc.email.toLowerCase() === trimmed ||
      acc.email.toLowerCase().split('@')[0] === trimmed
    ) {
      updated = true;
      return { ...acc, password: newPass };
    }
    return acc;
  });

  if (updated) {
    saveManagedAccounts(newList);
    // Keep active session in sync if matching
    const activeRaw = localStorage.getItem('inspiro_active_session');
    if (activeRaw) {
      try {
        const active = JSON.parse(activeRaw);
        if (
          active.email?.toLowerCase() === trimmed ||
          active.uid === emailOrId
        ) {
          localStorage.setItem(
            'inspiro_active_session',
            JSON.stringify({ ...active, password: newPass })
          );
        }
      } catch (e) {
        // ignore
      }
    }
  }
  return updated;
}

export function authenticateUser(emailOrUsername: string, pass: string): ManagedAccount | null {
  if (!emailOrUsername.trim() || !pass) return null;
  const current = getManagedAccounts();
  const trimmedUser = emailOrUsername.trim().toLowerCase();
  const cleanNip = trimmedUser.replace(/\s+/g, '');
  const cleanPass = pass.trim();

  const found = current.find((a) => {
    const accEmail = a.email.toLowerCase();
    const accUsername = accEmail.split('@')[0];
    const accNip = a.nip ? a.nip.replace(/\s+/g, '') : '';

    return (
      accEmail === trimmedUser ||
      accUsername === trimmedUser ||
      (accNip.length >= 6 && accNip === cleanNip)
    );
  });

  if (found && found.password && (found.password === pass || found.password === cleanPass)) {
    return found;
  }
  return null;
}

// ========================================================================
// 8. PM Management Reports (Praktik Pedagogis) Storage
// ========================================================================
const PM_REPORTS_KEY = 'inspiro_pm_reports';

export const DEFAULT_PM_REPORTS: PMReport[] = [
  {
    id: 'pm-rep-01',
    schoolName: 'SMP Negeri 1 Merdeka Nusantara',
    semester: 'Ganjil',
    academicYear: '2026/2027',
    assessorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    assessorRole: 'Pengawas Sekolah',
    assessorNip: '19830819 201001 1 002',
    headmasterName: 'Dra. Hj. Nurhasanah, M.Pd.',
    headmasterNip: '19720815 199802 2 003',
    evalDate: '2026-09-28',
    dimension1: {
      score: 25,
      level: 'sangat_baik',
      notes: 'Laporan mencakup seluruh tahapan (pra-observasi, observasi kelas 12 indikator, dan pasca/refleksi) secara lengkap, runtut, dan konsisten.',
      evidenceNotes: 'Terdokumentasi 8 sesi pra-observasi, lembar skor observasi 12 indikator tervalidasi, dan catatan wawancara pasca-observasi lengkap.'
    },
    dimension2: {
      score: 25,
      level: 'sangat_baik',
      notes: 'Data sangat lengkap, objektif, berbasis indikator PM (Praktik Pedagogis), dan menunjukkan praktik nyata di kelas.',
      evidenceNotes: 'Disertai catatan perilaku murid konkrit, rubrik diferensiasi konten & proses, dan deskripsi keterlibatan murid.'
    },
    dimension3: {
      score: 25,
      level: 'sangat_baik',
      notes: 'Umpan balik berbasis data, konstruktif, mendorong refleksi guru, dan berorientasi perbaikan.',
      evidenceNotes: 'Wawancara pasca-observasi berlangsung dua arah dengan teknik coaching GROW, mendorong guru menemukan solusi mandiri.'
    },
    dimension4: {
      score: 25,
      level: 'sangat_baik',
      notes: 'Tindak lanjut jelas, spesifik, berkelanjutan (coaching, PLC, perbaikan pembelajaran), dan terukur.',
      evidenceNotes: 'Jadwal tindak lanjut terjadwal dalam Komunitas Belajar (Kombel) sekolah dengan target penilaian modul ajar revisi dalam 3 pekan.'
    },
    totalScore: 100,
    predicate: 'Amat Baik (A)',
    generalNotes: 'Pengelolaan Praktik Pedagogis (PM) di SMP Negeri 1 Merdeka Nusantara telah berjalan sangat efektif dan menjadi rujukan praktik baik bagi sekolah binaan lainnya.',
    recommendation: 'Pertahankan budaya coaching reflektif antar guru sejawat dan perluas desiminasi modul ajar berdiferensiasi ke jejaring MGMP sub-rayon.',
    interventionPlan: 'Pendampingan keberlanjutan Komunitas Praktisi (PLC) untuk inovasi asesmen formatif berbasis digital.',
    status: 'final',
    createdAt: '2026-09-28T10:00:00Z',
    updatedAt: '2026-09-28T14:30:00Z'
  },
  {
    id: 'pm-rep-02',
    schoolName: 'SMP Negeri 2 Merdeka Nusantara',
    semester: 'Ganjil',
    academicYear: '2026/2027',
    assessorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    assessorRole: 'Pengawas Sekolah',
    assessorNip: '19830819 201001 1 002',
    headmasterName: 'Drs. Bambang Irawan, M.Pd.',
    headmasterNip: '19690312 199512 1 001',
    evalDate: '2026-09-30',
    dimension1: {
      score: 25,
      level: 'sangat_baik',
      notes: 'Laporan mencakup seluruh tahapan secara lengkap dan runtut.',
      evidenceNotes: 'Seluruh tahap pra, observasi, dan pasca telah diinput oleh Kepala Sekolah ke dalam sistem.'
    },
    dimension2: {
      score: 18.75,
      level: 'baik',
      notes: 'Data lengkap dan objektif berbasis indikator PM, namun bukti catatan deskriptif perilaku murid masih perlu diperdalam.',
      evidenceNotes: 'Skor 12 indikator terisi lengkap, deskripsi kualitatif fokus perilaku beberapa guru masih bersifat garis besar.'
    },
    dimension3: {
      score: 18.75,
      level: 'baik',
      notes: 'Umpan balik konstruktif dan terarah, proses refleksi guru perlu lebih mandiri.',
      evidenceNotes: 'Guru merespon umpan balik dengan baik, perlu pendampingan agar guru lebih kritis menemukan akar tantangan kelas.'
    },
    dimension4: {
      score: 18.75,
      level: 'baik',
      notes: 'Tindak lanjut spesifik, rencana coaching dan forum PLC perlu dipastikan jadwal eksekusinya.',
      evidenceNotes: 'RTL telah memuat target waktu 1 bulan, pendampingan lanjutan di Komunitas Belajar masih dalam tahap penjadwalan.'
    },
    totalScore: 81.25,
    predicate: 'Baik (B)',
    generalNotes: 'Pengelolaan PM menunjukkan komitmen tinggi dalam siklus supervisi Kurikulum Merdeka. Perlu penguatan pada dokumentasi bukti perilaku otentik di kelas.',
    recommendation: 'Tingkatkan keterampilan Kepala Sekolah dalam teknik observasi berbasis bukti perilaku (evidence-based observation).',
    interventionPlan: 'Workshop mini teknik coaching observasi kelas dan penguatan Komunitas Belajar sekolah.',
    status: 'final',
    createdAt: '2026-09-30T09:15:00Z',
    updatedAt: '2026-09-30T13:45:00Z'
  }
];

export function getPMReports(): PMReport[] {
  const list = safeParse<PMReport[]>(PM_REPORTS_KEY, []);
  if (list.length === 0) {
    savePMReports(DEFAULT_PM_REPORTS);
    return DEFAULT_PM_REPORTS;
  }
  return list;
}

export function savePMReports(reports: PMReport[]): void {
  try {
    localStorage.setItem(PM_REPORTS_KEY, JSON.stringify(reports));
  } catch (e) {
    console.error('Error saving PM reports:', e);
  }
}

export function savePMReport(report: PMReport): void {
  const current = getPMReports();
  const index = current.findIndex((r) => r.id === report.id);
  let updated: PMReport[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...report, updatedAt: new Date().toISOString() };
  } else {
    updated = [{ ...report, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...current];
  }
  savePMReports(updated);
}

export function deletePMReport(id: string): boolean {
  const current = getPMReports();
  const filtered = current.filter((r) => r.id !== id);
  if (filtered.length === current.length) return false;
  savePMReports(filtered);
  return true;
}

export function getPMReportById(id: string): PMReport | null {
  const current = getPMReports();
  return current.find((r) => r.id === id) || null;
}

// 7. Visit Agendas CRUD (Kalender Supervisi & Agenda Kunjungan)
export function getVisitAgendas(): VisitAgenda[] {
  const agendas = safeParse<VisitAgenda[]>(VISIT_AGENDAS_KEY, []);
  if (agendas.length === 0) {
    saveVisitAgendas(SEED_VISIT_AGENDAS);
    return SEED_VISIT_AGENDAS;
  }
  // Auto-merge managerial supervision seed agendas if not present
  const hasManagerial = agendas.some((a) => a.visitType === 'supervisi_manajerial');
  if (!hasManagerial) {
    const managerialSeeds = SEED_VISIT_AGENDAS.filter((a) => a.visitType === 'supervisi_manajerial');
    if (managerialSeeds.length > 0) {
      const merged = [...agendas, ...managerialSeeds];
      saveVisitAgendas(merged);
      return merged;
    }
  }
  return agendas;
}

export function saveVisitAgendas(agendas: VisitAgenda[]): void {
  try {
    localStorage.setItem(VISIT_AGENDAS_KEY, JSON.stringify(agendas));
  } catch (e) {
    console.error('Error saving visit agendas:', e);
  }
}

export function saveVisitAgenda(agenda: VisitAgenda): void {
  const current = getVisitAgendas();
  const index = current.findIndex((a) => a.id === agenda.id);
  let updated: VisitAgenda[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...agenda, updatedAt: new Date().toISOString() };
  } else {
    updated = [{ ...agenda, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...current];
  }
  saveVisitAgendas(updated);
}

export function deleteVisitAgenda(id: string): boolean {
  const current = getVisitAgendas();
  const filtered = current.filter((a) => a.id !== id);
  if (filtered.length === current.length) return false;
  saveVisitAgendas(filtered);
  return true;
}

export function getVisitAgendaById(id: string): VisitAgenda | null {
  const current = getVisitAgendas();
  return current.find((a) => a.id === id) || null;
}

// 8. Jurnal Coaching Dialogis Alur TIRTA CRUD
export function getCoachingRecords(): TirtaCoachingRecord[] {
  const records = safeParse<TirtaCoachingRecord[]>(COACHING_RECORDS_KEY, []);
  if (records.length === 0) {
    saveCoachingRecords(SEED_COACHING_RECORDS);
    return SEED_COACHING_RECORDS;
  }
  return records;
}

export function saveCoachingRecords(records: TirtaCoachingRecord[]): void {
  try {
    localStorage.setItem(COACHING_RECORDS_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving coaching records:', e);
  }
}

export function saveCoachingRecord(record: TirtaCoachingRecord): void {
  const current = getCoachingRecords();
  const index = current.findIndex((r) => r.id === record.id);
  let updated: TirtaCoachingRecord[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...record, updatedAt: new Date().toISOString() };
  } else {
    updated = [{ ...record, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...current];
  }
  saveCoachingRecords(updated);
}

export function deleteCoachingRecord(id: string): boolean {
  const current = getCoachingRecords();
  const filtered = current.filter((r) => r.id !== id);
  if (filtered.length === current.length) return false;
  saveCoachingRecords(filtered);
  return true;
}

export function getCoachingRecordById(id: string): TirtaCoachingRecord | null {
  const current = getCoachingRecords();
  return current.find((r) => r.id === id) || null;
}

// ========================================================================
// 10. PM LEARNING ENVIRONMENT (LINGKUNGAN PEMBELAJARAN) STORAGE
// Fokus: Iklim Psikologis (Keamanan Emosional) & Efisiensi Waktu Belajar
// ========================================================================

export function getLearningEnvRecords(): PMLearningEnvRecord[] {
  const records = safeParse<PMLearningEnvRecord[]>(LEARNING_ENV_RECORDS_KEY, []);
  if (records.length === 0) {
    saveLearningEnvRecords(SEED_LEARNING_ENV_RECORDS);
    return SEED_LEARNING_ENV_RECORDS;
  }
  return records;
}

export function saveLearningEnvRecords(records: PMLearningEnvRecord[]): void {
  try {
    localStorage.setItem(LEARNING_ENV_RECORDS_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving learning env records:', e);
  }
}

export function saveLearningEnvRecord(record: PMLearningEnvRecord): void {
  const current = getLearningEnvRecords();
  const index = current.findIndex((r) => r.id === record.id);
  let updated: PMLearningEnvRecord[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...record, updatedAt: new Date().toISOString() };
  } else {
    updated = [{ ...record, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...current];
  }
  saveLearningEnvRecords(updated);
}

export function deleteLearningEnvRecord(id: string): boolean {
  const current = getLearningEnvRecords();
  const filtered = current.filter((r) => r.id !== id);
  if (filtered.length === current.length) return false;
  saveLearningEnvRecords(filtered);
  return true;
}

export function getLearningEnvRecordById(id: string): PMLearningEnvRecord | null {
  const current = getLearningEnvRecords();
  return current.find((r) => r.id === id) || null;
}

// ========================================================================
// 11. PM DIGITAL UTILIZATION (PEMANFAATAN DIGITAL) STORAGE
// Fokus: Leveraging Digital for Deep Learning & Evaluasi SAMR
// ========================================================================

export function getDigitalPMRecords(): PMDigitalRecord[] {
  const records = safeParse<PMDigitalRecord[]>(DIGITAL_PM_RECORDS_KEY, []);
  if (records.length === 0) {
    saveDigitalPMRecords(SEED_DIGITAL_PM_RECORDS);
    return SEED_DIGITAL_PM_RECORDS;
  }
  return records;
}

export function saveDigitalPMRecords(records: PMDigitalRecord[]): void {
  try {
    localStorage.setItem(DIGITAL_PM_RECORDS_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving digital PM records:', e);
  }
}

export function saveDigitalPMRecord(record: PMDigitalRecord): void {
  const current = getDigitalPMRecords();
  const index = current.findIndex((r) => r.id === record.id);
  let updated: PMDigitalRecord[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...record, updatedAt: new Date().toISOString() };
  } else {
    updated = [{ ...record, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...current];
  }
  saveDigitalPMRecords(updated);
}

export function deleteDigitalPMRecord(id: string): boolean {
  const current = getDigitalPMRecords();
  const filtered = current.filter((r) => r.id !== id);
  if (filtered.length === current.length) return false;
  saveDigitalPMRecords(filtered);
  return true;
}

export function getDigitalPMRecordById(id: string): PMDigitalRecord | null {
  const current = getDigitalPMRecords();
  return current.find((r) => r.id === id) || null;
}

// ========================================================================
// 12. DATA AWAL MASALAH & AKAR MASALAH KONTEKSTUAL STORAGE
// Fokus: Realita Ruang Kelas, Wawancara, Bukti Fisik, & Solusi Terarah
// ========================================================================

export function getContextualProblems(): ContextualProblemRecord[] {
  const records = safeParse<ContextualProblemRecord[]>(CONTEXTUAL_PROBLEMS_KEY, []);
  if (records.length === 0) {
    saveContextualProblems(SEED_CONTEXTUAL_PROBLEMS);
    return SEED_CONTEXTUAL_PROBLEMS;
  }
  return records;
}

export function saveContextualProblems(records: ContextualProblemRecord[]): void {
  try {
    localStorage.setItem(CONTEXTUAL_PROBLEMS_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving contextual problems:', e);
  }
}

export function saveContextualProblem(record: ContextualProblemRecord): void {
  const current = getContextualProblems();
  const index = current.findIndex((r) => r.id === record.id);
  let updated: ContextualProblemRecord[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...record, updatedAt: new Date().toISOString() };
  } else {
    updated = [{ ...record, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...current];
  }
  saveContextualProblems(updated);
}

export function deleteContextualProblem(id: string): boolean {
  const current = getContextualProblems();
  const filtered = current.filter((r) => r.id !== id);
  if (filtered.length === current.length) return false;
  saveContextualProblems(filtered);
  return true;
}

export function getContextualProblemById(id: string): ContextualProblemRecord | null {
  const current = getContextualProblems();
  return current.find((r) => r.id === id) || null;
}

// ========================================================================
// 13. PROGRAM PENGELOLAAN PEMBELAJARAN MENDALAM (PM) - ELEMEN KEMITRAAN PEMBELAJARAN
// Fokus: Aliansi Murid-Guru, Antarmurid, Orang Tua, & Komunitas / Dunia Nyata
// ========================================================================

export function getPartnershipPMRecords(): PMLearningPartnershipRecord[] {
  const records = safeParse<PMLearningPartnershipRecord[]>(PARTNERSHIP_PM_RECORDS_KEY, []);
  if (records.length === 0) {
    savePartnershipPMRecords(SEED_PARTNERSHIP_PM_RECORDS);
    return SEED_PARTNERSHIP_PM_RECORDS;
  }
  return records;
}

export function savePartnershipPMRecords(records: PMLearningPartnershipRecord[]): void {
  try {
    localStorage.setItem(PARTNERSHIP_PM_RECORDS_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving partnership PM records:', e);
  }
}

export function savePartnershipPMRecord(record: PMLearningPartnershipRecord): void {
  const current = getPartnershipPMRecords();
  const index = current.findIndex((r) => r.id === record.id);
  let updated: PMLearningPartnershipRecord[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...record, updatedAt: new Date().toISOString() };
  } else {
    updated = [{ ...record, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...current];
  }
  savePartnershipPMRecords(updated);
}

export function deletePartnershipPMRecord(id: string): boolean {
  const current = getPartnershipPMRecords();
  const filtered = current.filter((r) => r.id !== id);
  if (filtered.length === current.length) return false;
  savePartnershipPMRecords(filtered);
  return true;
}

export function getPartnershipPMRecordById(id: string): PMLearningPartnershipRecord | null {
  const current = getPartnershipPMRecords();
  return current.find((r) => r.id === id) || null;
}

// ========================================================================
// 14. SOAR STRATEGIC ANALYSIS STORAGE (4 KERANGKA PEMBELAJARAN MENDALAM)
// Fokus: Strengths, Opportunities, Aspirations, Results & Inkuiri Apresiatif
// ========================================================================

export function getSOARRecords(): SOARAnalysisRecord[] {
  const records = safeParse<SOARAnalysisRecord[]>(SOAR_RECORDS_KEY, []);
  if (records.length === 0) {
    saveSOARRecords(SEED_SOAR_RECORDS);
    return SEED_SOAR_RECORDS;
  }
  return records;
}

export function saveSOARRecords(records: SOARAnalysisRecord[]): void {
  try {
    localStorage.setItem(SOAR_RECORDS_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving SOAR records:', e);
  }
}

export function saveSOARRecord(record: SOARAnalysisRecord): void {
  const current = getSOARRecords();
  const index = current.findIndex((r) => r.id === record.id);
  let updated: SOARAnalysisRecord[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...record, updatedAt: new Date().toISOString() };
  } else {
    updated = [{ ...record, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...current];
  }
  saveSOARRecords(updated);
}

export function deleteSOARRecord(id: string): boolean {
  const current = getSOARRecords();
  const filtered = current.filter((r) => r.id !== id);
  if (filtered.length === current.length) return false;
  saveSOARRecords(filtered);
  return true;
}

export function getSOARRecordById(id: string): SOARAnalysisRecord | null {
  const current = getSOARRecords();
  return current.find((r) => r.id === id) || null;
}

/**
 * Export Matriks Analisis SOAR Kepemimpinan 4 Pilar PM ke format Microsoft Word (.doc)
 * dengan tata letak resmi Kedinasan Kabupaten Sidenreng Rappang
 */
export function exportSOARToWord(record: SOARAnalysisRecord, settings: AppSettings): void {
  const agency = settings.governmentAgency || 'PEMERINTAH KABUPATEN SIDENRENG RAPPANG';
  const schoolCity = settings.schoolCity || 'Kabupaten Sidenreng Rappang';
  const supervisorName = record.leadSupervisor || settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd';
  const supervisorNip = record.supervisorNip || settings.supervisorNip || '19830819 201001 1 002';
  const supervisorRole = record.supervisorRole || settings.supervisorRole || 'Pengawas Sekolah Madya';
  const headmasterName = record.headmasterName || 'Dra. Hj. Nurhasanah, M.Pd.';
  const headmasterNip = record.headmasterNip || '19720815 199802 2 003';

  // Group items by quadrant
  const strengths = record.items.filter((i) => i.quadrant === 'strength');
  const opportunities = record.items.filter((i) => i.quadrant === 'opportunity');
  const aspirations = record.items.filter((i) => i.quadrant === 'aspiration');
  const results = record.items.filter((i) => i.quadrant === 'result');

  const renderItemsList = (items: typeof record.items) => {
    if (items.length === 0) return '<em>Belum ada butir terdaftar</em>';
    return `<ol style="margin-left: 18px; padding-left: 0;">
      ${items
        .map(
          (it) => `
        <li style="margin-bottom: 8px;">
          <strong>[${it.pillar.toUpperCase()}] ${it.title}</strong>
          <span style="color: #64748b; font-size: 9.5pt;">(${it.assetType || 'Aset'})</span><br/>
          <span>${it.description}</span><br/>
          <span style="font-size: 9.5pt; color: #047857;"><strong>Bukti/Metrik:</strong> ${it.evidenceOrMetric}</span>
        </li>
      `
        )
        .join('')}
    </ol>`;
  };

  const renderStrategiesTable = () => {
    if (!record.strategies || record.strategies.length === 0) {
      return '<p><em>Belum ada inisiatif strategis yang dirumuskan.</em></p>';
    }
    return `
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%; margin-top: 10px; font-size: 10pt;">
        <thead>
          <tr style="background-color: #f1f5f9; text-align: left;">
            <th style="width: 8%;">Tipe</th>
            <th style="width: 25%;">Nama Inisiatif Strategis</th>
            <th style="width: 27%;">Langkah Aksi Konkret</th>
            <th style="width: 20%;">Target Capaian & Pilar</th>
            <th style="width: 10%;">Waktu</th>
            <th style="width: 10%;">PIC</th>
          </tr>
        </thead>
        <tbody>
          ${record.strategies
            .map(
              (s) => `
            <tr>
              <td style="font-weight: bold; text-align: center; background-color: #f8fafc;">${s.type}</td>
              <td><strong>${s.title}</strong><br/><small style="color: #475569;">${s.description}</small></td>
              <td>
                <ul style="margin: 0; padding-left: 14px;">
                  ${s.actionSteps.map((step) => `<li>${step}</li>`).join('')}
                </ul>
              </td>
              <td>
                <strong>${s.targetOutcome}</strong><br/>
                <small style="color: #0284c7;">Pilar: ${s.linkedPillars.join(', ')}</small>
              </td>
              <td>${s.timeline}</td>
              <td>${s.pic}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;
  };

  const html = `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Laporan Matriks Analisis SOAR Kepemimpinan Pembelajaran</title>
      <style>
        body {
          font-family: 'Calibri', 'Times New Roman', sans-serif;
          font-size: 11pt;
          line-height: 1.35;
          color: #0f172a;
          margin: 20px;
        }
        .header-kop {
          text-align: center;
          border-bottom: 3px double #000;
          padding-bottom: 12px;
          margin-bottom: 20px;
        }
        .header-kop h3 { margin: 0; font-size: 13pt; text-transform: uppercase; font-weight: bold; }
        .header-kop h2 { margin: 2px 0; font-size: 15pt; text-transform: uppercase; font-weight: bold; }
        .header-kop h1 { margin: 2px 0; font-size: 16pt; text-transform: uppercase; font-weight: bold; }
        .header-kop p { margin: 2px 0; font-size: 10pt; font-style: italic; color: #334155; }
        .title-doc {
          text-align: center;
          margin-top: 15px;
          margin-bottom: 15px;
        }
        .title-doc h2 { margin: 0; font-size: 14pt; text-transform: uppercase; text-decoration: underline; font-weight: bold; }
        .title-doc p { margin: 4px 0 0 0; font-size: 10.5pt; font-weight: bold; }
        .table-info { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 10.5pt; }
        .table-info td { padding: 4px 6px; vertical-align: top; }
        .matrix-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .matrix-table td { width: 50%; vertical-align: top; padding: 12px; border: 1.5pt solid #cbd5e1; }
        .q-title { font-size: 12pt; font-weight: bold; padding: 6px 10px; border-radius: 4px; margin-bottom: 8px; text-transform: uppercase; }
        .q-s { background-color: #d1fae5; color: #065f46; border-left: 5px solid #059669; }
        .q-o { background-color: #fef3c7; color: #92400e; border-left: 5px solid #d97706; }
        .q-a { background-color: #e0f2fe; color: #075985; border-left: 5px solid #0284c7; }
        .q-r { background-color: #f3e8ff; color: #6b21a8; border-left: 5px solid #9333ea; }
        .signature-table { width: 100%; margin-top: 35px; border-collapse: collapse; }
        .signature-table td { width: 50%; text-align: center; vertical-align: top; font-size: 11pt; }
      </style>
    </head>
    <body>
      <div class="header-kop">
        <h3>${agency}</h3>
        <h2>DINAS PENDIDIKAN DAN KEBUDAYAAN</h2>
        <h1>KOORDINATOR PENGAWAS SEKOLAH MENENGAH PERTAMA</h1>
        <p>Alamat: Kompleks Perkantoran SKPD Jl. Harapan Baru No. 1, ${schoolCity} - Sulawesi Selatan</p>
      </div>

      <div class="title-doc">
        <h2>BERITA ACARA & MATRIKS ANALISIS STRATEGIS SOAR</h2>
        <p>PENDEKATAN INKUIRI APRESIATIF & 4 KERANGKA PEMBELAJARAN MENDALAM (PM)</p>
      </div>

      <table class="table-info">
        <tr>
          <td style="width: 22%;"><strong>Satuan Pendidikan</strong></td>
          <td style="width: 3%;">:</td>
          <td style="width: 45%;">${record.schoolName} (NPSN: ${record.schoolNpsn})</td>
          <td style="width: 15%;"><strong>Tahun Pelajaran</strong></td>
          <td style="width: 3%;">:</td>
          <td>${record.academicYear}</td>
        </tr>
        <tr>
          <td><strong>Fokus Analisis</strong></td>
          <td>:</td>
          <td>${record.title}</td>
          <td><strong>Semester</strong></td>
          <td>:</td>
          <td>${record.semester}</td>
        </tr>
        <tr>
          <td><strong>Tahapan Inkuiri 4D</strong></td>
          <td>:</td>
          <td>Tahap <strong>${record.appreciativeInquiryStage}</strong> (Discovery - Dream - Design - Destiny)</td>
          <td><strong>Tanggal</strong></td>
          <td>:</td>
          <td>${record.date}</td>
        </tr>
        <tr>
          <td><strong>Pengawas Pembina</strong></td>
          <td>:</td>
          <td colspan="4">${supervisorName} (NIP. ${supervisorNip})</td>
        </tr>
      </table>

      <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin-bottom: 16px; font-size: 10.5pt;">
        <strong>Catatan Sintesis Kepemimpinan Pengawas:</strong><br/>
        <em>"${record.synthesisNotes}"</em>
      </div>

      <h3 style="font-size: 12pt; text-transform: uppercase; margin-bottom: 8px;">I. MATRIKS 4 KUADRAN SOAR (STRENGTHS, OPPORTUNITIES, ASPIRATIONS, RESULTS)</h3>

      <table class="matrix-table">
        <tr>
          <td>
            <div class="q-title q-s">S - STRENGTHS (Kekuatan & Aset Riil)</div>
            <p style="font-size: 9.5pt; color: #475569; margin-top: 0;"><em>Modal utama internal sekolah & praktik pedagogis bermutu tinggi yang telah terbukti.</em></p>
            ${renderItemsList(strengths)}
          </td>
          <td>
            <div class="q-title q-o">O - OPPORTUNITIES (Peluang Ungkitan)</div>
            <p style="font-size: 9.5pt; color: #475569; margin-top: 0;"><em>Peluang kolaborasi eksternal, dukungan kedinasan, & kemitraan komunitas Sidrap.</em></p>
            ${renderItemsList(opportunities)}
          </td>
        </tr>
        <tr>
          <td>
            <div class="q-title q-a">A - ASPIRATIONS (Aspirasi & Impian)</div>
            <p style="font-size: 9.5pt; color: #475569; margin-top: 0;"><em>Visi pembelajaran mendalam ideal yang menyalakan gairah belajar murid & guru.</em></p>
            ${renderItemsList(aspirations)}
          </td>
          <td>
            <div class="q-title q-r">R - RESULTS (Hasil & Metrik Terukur)</div>
            <p style="font-size: 9.5pt; color: #475569; margin-top: 0;"><em>Bukti autentik dampak keberhasilan, karya nyata murid, & indikator kinerja kunci.</em></p>
            ${renderItemsList(results)}
          </td>
        </tr>
      </table>

      <h3 style="font-size: 12pt; text-transform: uppercase; margin-top: 24px; margin-bottom: 8px;">II. RENCANA INISIATIF STRATEGIS KOMBINASI (S-O, S-A, O-R, A-R)</h3>
      ${renderStrategiesTable()}

      <table class="signature-table">
        <tr>
          <td>
            Mengetahui,<br/>
            Kepala Sekolah ${record.schoolName}
            <br/><br/><br/><br/><br/>
            <strong><u>${headmasterName}</u></strong><br/>
            NIP. ${headmasterNip}
          </td>
          <td>
            ${schoolCity}, ${record.date}<br/>
            Pengawas Sekolah Pembina
            <br/><br/><br/><br/><br/>
            <strong><u>${supervisorName}</u></strong><br/>
            NIP. ${supervisorNip}<br/>
            <span>${supervisorRole}</span>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeTitle = record.schoolName.replace(/[^a-zA-Z0-9]/g, '_');
  a.download = `Analisis_SOAR_${safeTitle}_${record.date}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

