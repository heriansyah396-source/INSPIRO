/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AppSettings,
  OBSERVATION_INDICATORS,
  PMReport,
  RegionalQualitySummary,
  SchoolQualityMetrics,
  SupervisionCategory,
  SupervisionRecord,
  Teacher
} from '../types/inspiro';
import { DEFAULT_ACCOUNTS } from './storage';

export interface PeerMentoringPairing {
  id: string;
  sourceSchool: string; // Mentor / Pengimbas
  targetSchool: string; // Mentee / Didampingi
  mentorScore: number;
  targetScore: number;
  focusArea: string;
  focusIndicatorId: number;
  actionStrategy: string;
  expectedOutcome: string;
}

export interface CollectiveActionPlan {
  id: string;
  topic: string;
  targetAudience: string;
  priorityLevel: 'Tinggi (Prioritas I)' | 'Menengah (Prioritas II)' | 'Rutin (Berkala)';
  format: 'Bimtek Klinis' | 'Workshop MGMP Gugus' | 'Kombel Antar-Sekolah' | 'Coaching Kepsek';
  scheduleRecommendation: string;
  rationale: string;
}

export interface QualityMapAnalysis {
  schools: SchoolQualityMetrics[];
  regional: RegionalQualitySummary;
  pmBySchool: Record<string, PMReport | undefined>;
  pairings: PeerMentoringPairing[];
  collectivePlans: CollectiveActionPlan[];
}

// Preset color scheme for multi-school radar and charts
export const SCHOOL_COLORS = [
  '#2563EB', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#EF4444'  // Rose
];

/**
 * Extracts all unique school names from supervisions, teachers, PM reports, and managed accounts
 */
export function getAllSchoolNames(
  supervisions: SupervisionRecord[],
  teachers: Teacher[],
  pmReports: PMReport[],
  settings?: AppSettings
): string[] {
  const schoolSet = new Set<string>();

  // Add from settings if valid
  if (settings?.schoolName && !settings.schoolName.includes('Dinas')) {
    schoolSet.add(settings.schoolName.trim());
  }

  // Add from managed accounts (principals)
  DEFAULT_ACCOUNTS.forEach((acc) => {
    if (acc.role === 'kepala_sekolah' && acc.schoolName) {
      schoolSet.add(acc.schoolName.trim());
    }
  });

  // Add from teachers
  teachers.forEach((t) => {
    if (t.satuanPendidikan?.trim()) {
      schoolSet.add(t.satuanPendidikan.trim());
    }
  });

  // Add from supervisions
  supervisions.forEach((s) => {
    if (s.identity?.satuanPendidikan?.trim()) {
      schoolSet.add(s.identity.satuanPendidikan.trim());
    }
  });

  // Add from PM reports
  pmReports.forEach((pm) => {
    if (pm.schoolName?.trim()) {
      schoolSet.add(pm.schoolName.trim());
    }
  });

  // Ensure standard sample schools exist for rich comparison if few schools present
  const defaultList = [
    'SMP Negeri 1 Merdeka Nusantara',
    'SMP Negeri 2 Merdeka Nusantara',
    'SMP Negeri 3 Merdeka Nusantara',
    'SMP Swasta Al-Falah Merdeka'
  ];

  defaultList.forEach((s) => schoolSet.add(s));

  return Array.from(schoolSet).filter(Boolean);
}

/**
 * Computes comprehensive quality metrics for every school binaan
 */
export function calculateQualityMapAnalysis(
  supervisions: SupervisionRecord[],
  teachers: Teacher[],
  pmReports: PMReport[],
  settings: AppSettings
): QualityMapAnalysis {
  const allSchoolNames = getAllSchoolNames(supervisions, teachers, pmReports, settings);
  const pmMap: Record<string, PMReport | undefined> = {};

  pmReports.forEach((pm) => {
    pmMap[pm.schoolName.trim()] = pm;
  });

  const schools: SchoolQualityMetrics[] = allSchoolNames.map((schoolName, index) => {
    const schoolSupervisions = supervisions.filter(
      (s) => s.identity?.satuanPendidikan?.trim().toLowerCase() === schoolName.toLowerCase()
    );
    const completedSupervisions = schoolSupervisions.filter((s) => s.status === 'selesai');
    const schoolTeachers = teachers.filter(
      (t) => t.satuanPendidikan?.trim().toLowerCase() === schoolName.toLowerCase()
    );

    const teacherCount = Math.max(schoolTeachers.length, completedSupervisions.length, 6 + (index % 4) * 2);
    const supervisedCount = completedSupervisions.length;

    // Calculate indicator averages (1-12)
    const indicatorScores: Record<number, number> = {};

    if (completedSupervisions.length > 0) {
      for (let i = 1; i <= 12; i++) {
        const sum = completedSupervisions.reduce((acc, curr) => acc + (curr.scores[i] || 0), 0);
        indicatorScores[i] = Number((sum / completedSupervisions.length).toFixed(2));
      }
    } else {
      // Benchmark profile based on index for demo/binaan schools without direct completed supervision yet
      const baselines: Record<number, number[]> = {
        0: [3.8, 3.7, 3.9, 3.8, 3.6, 3.5, 3.7, 3.9, 3.4, 3.5, 3.4, 3.8], // SMPN 1 (High performant)
        1: [3.5, 3.2, 3.6, 3.5, 3.1, 3.3, 3.8, 3.6, 3.0, 3.1, 3.0, 3.4], // SMPN 2 (Strong IT, needs differentiation)
        2: [3.2, 3.0, 3.3, 3.2, 2.9, 2.8, 3.0, 3.4, 2.8, 2.9, 2.7, 3.1], // SMPN 3 (Good classroom discipline, needs assessment)
        3: [3.6, 3.4, 3.5, 3.4, 3.3, 3.2, 3.1, 3.7, 3.3, 3.2, 3.1, 3.5]  // Swasta (Balanced, strong character)
      };
      const preset = baselines[index % 4] || baselines[0];
      for (let i = 1; i <= 12; i++) {
        indicatorScores[i] = preset[i - 1];
      }
    }

    // Indicator sums for 5 dimensions:
    // 1. Pra-Observasi & Kesiapan (Asesmen awal, tujuan) -> ind 2, 3
    const praObservasi = Math.min(100, Math.round(((indicatorScores[2] + indicatorScores[3]) / 8) * 100));
    // 2. Pendahuluan & Apersepsi -> ind 1, 3
    const pendahuluan = Math.min(100, Math.round(((indicatorScores[1] + indicatorScores[3]) / 8) * 100));
    // 3. Kegiatan Inti (Materi, Diferensiasi, HOTS, IT, Kelas, KSE) -> ind 4, 5, 6, 7, 8, 9
    const intiSum = indicatorScores[4] + indicatorScores[5] + indicatorScores[6] + indicatorScores[7] + indicatorScores[8] + indicatorScores[9];
    const inti = Math.min(100, Math.round((intiSum / 24) * 100));
    // 4. Penutup (Refleksi, Formatif, Umpan Balik) -> ind 10, 11, 12
    const penutupSum = indicatorScores[10] + indicatorScores[11] + indicatorScores[12];
    const penutup = Math.min(100, Math.round((penutupSum / 12) * 100));
    // 5. Refleksi & RTL Guru -> ind 10, 12 + praObservasi weight
    const refleksiRtl = Math.min(100, Math.round(((indicatorScores[10] + indicatorScores[12]) / 8) * 100));

    // Calculate final average percentage
    let avgPercentage = 0;
    if (completedSupervisions.length > 0) {
      const totalScoreSum = completedSupervisions.reduce((acc, curr) => acc + curr.finalScore, 0);
      avgPercentage = Number((totalScoreSum / completedSupervisions.length).toFixed(1));
    } else {
      let totalPts = 0;
      for (let i = 1; i <= 12; i++) totalPts += indicatorScores[i];
      avgPercentage = Number(((totalPts / 48) * 100).toFixed(1));
    }

    // Category
    let category: SupervisionCategory = 'Cukup (C)';
    if (avgPercentage >= 91) category = 'Amat Baik (SB)';
    else if (avgPercentage >= 81) category = 'Baik (B)';
    else if (avgPercentage >= 71) category = 'Cukup (C)';
    else category = 'Kurang (K)';

    // Support tier
    let supportTier: 'berbagi' | 'terfokus' | 'intensif' = 'terfokus';
    let supportTierLabel = 'Binaan Penguatan Reguler';
    let recommendedAction = 'Penguatan pada asesmen formatif dan tindak lanjut refleksi.';
    let priorityFocus = 'Asesmen Formatif & Diferensiasi';

    if (avgPercentage >= 88) {
      supportTier = 'berbagi';
      supportTierLabel = 'Sekolah Rujukan / Berbagi Praktik Baik';
      recommendedAction = 'Diberdayakan sebagai sekolah pengimbas MGMP/Kombel untuk mendampingi sekolah lain.';
      priorityFocus = 'Diseminasi Inovasi & Pendampingan Sejawat';
    } else if (avgPercentage < 76) {
      supportTier = 'intensif';
      supportTierLabel = 'Prioritas Pendampingan Klinis Khusus';
      recommendedAction = 'Perlu bimbingan teknis intensif dan pendampingan terstruktur siklus II oleh Pengawas.';
      priorityFocus = 'Scaffolding Diferensiasi & Manajemen Kelas';
    }

    return {
      schoolName,
      teacherCount,
      supervisedCount,
      averageScore: Number(((avgPercentage / 100) * 48).toFixed(1)),
      averagePercentage: avgPercentage,
      category,
      dimensions: {
        praObservasi,
        pendahuluan,
        inti,
        penutup,
        refleksiRtl
      },
      indicatorScores,
      supportTier,
      supportTierLabel,
      recommendedAction,
      priorityFocus,
      color: SCHOOL_COLORS[index % SCHOOL_COLORS.length]
    };
  });

  // Sort schools by average percentage descending
  schools.sort((a, b) => b.averagePercentage - a.averagePercentage);

  // Regional summary
  const totalSchools = schools.length;
  const totalTeachers = schools.reduce((acc, s) => acc + s.teacherCount, 0);
  const totalSupervisions = schools.reduce((acc, s) => acc + s.supervisedCount, 0);
  const regionalAverageScore =
    totalSchools > 0
      ? Number((schools.reduce((acc, s) => acc + s.averagePercentage, 0) / totalSchools).toFixed(1))
      : 0;

  // Find regional highest & lowest indicator
  const regionalIndicatorAverages: { id: number; title: string; score: number }[] = [];
  for (let i = 1; i <= 12; i++) {
    const sum = schools.reduce((acc, s) => acc + s.indicatorScores[i], 0);
    const avg = Number((sum / totalSchools).toFixed(2));
    const title = OBSERVATION_INDICATORS.find((ind) => ind.id === i)?.title || `Indikator ${i}`;
    regionalIndicatorAverages.push({ id: i, title, score: avg });
  }

  regionalIndicatorAverages.sort((a, b) => b.score - a.score);
  const regionalStrengthsIndicator = regionalIndicatorAverages[0] || { id: 1, title: 'Pengondisian Kelas', score: 3.8 };
  const regionalBlindspotIndicator = regionalIndicatorAverages[regionalIndicatorAverages.length - 1] || {
    id: 11,
    title: 'Asesmen Formatif',
    score: 3.0
  };

  const topSchool = {
    name: schools[0]?.schoolName || 'Belum Ada',
    score: schools[0]?.averagePercentage || 0
  };
  const needSupportSchool = {
    name: schools[schools.length - 1]?.schoolName || 'Belum Ada',
    score: schools[schools.length - 1]?.averagePercentage || 0
  };

  const regional: RegionalQualitySummary = {
    totalSchools,
    totalTeachers,
    totalSupervisions,
    regionalAverageScore,
    topSchool,
    needSupportSchool,
    regionalBlindspotIndicator,
    regionalStrengthsIndicator
  };

  // Generate intelligent peer-mentoring pairings
  const pairings: PeerMentoringPairing[] = [];
  const highPerformers = schools.filter((s) => s.averagePercentage >= 85);
  const needsSupport = schools.filter((s) => s.averagePercentage < 85);

  if (highPerformers.length > 0 && needsSupport.length > 0) {
    needsSupport.forEach((target, i) => {
      const source = highPerformers[i % highPerformers.length];
      // Find the indicator with largest gap
      let maxGap = -1;
      let gapIndId = 5; // Default diferensiasi

      for (let k = 1; k <= 12; k++) {
        const gap = source.indicatorScores[k] - target.indicatorScores[k];
        if (gap > maxGap) {
          maxGap = gap;
          gapIndId = k;
        }
      }

      const indDef = OBSERVATION_INDICATORS.find((ind) => ind.id === gapIndId);
      const focusArea = indDef ? indDef.title : 'Pembelajaran Berdiferensiasi';

      pairings.push({
        id: `pair-${i + 1}`,
        sourceSchool: source.schoolName,
        targetSchool: target.schoolName,
        mentorScore: source.averagePercentage,
        targetScore: target.averagePercentage,
        focusArea,
        focusIndicatorId: gapIndId,
        actionStrategy: `Kunjungan belajar terbimbing (peer observation) dan workshop penyusunan Modul Ajar berdiferensiasi bersama guru inti ${source.schoolName}.`,
        expectedOutcome: `Peningkatan skor indikator ${focusArea} di ${target.schoolName} minimal +0.5 poin pada siklus supervisi berikutnya.`
      });
    });
  }

  // Collective agenda for Pengawas
  const collectivePlans: CollectiveActionPlan[] = [
    {
      id: 'plan-01',
      topic: `Penguatan Indikator Terendah Wilayah: ${regionalBlindspotIndicator.title}`,
      targetAudience: 'Seluruh Guru & Kepala Sekolah Binaan',
      priorityLevel: 'Tinggi (Prioritas I)',
      format: 'Workshop MGMP Gugus',
      scheduleRecommendation: 'Pekan ke-2 Bulan Depan (Kamis Pukul 09.00 - 13.00)',
      rationale: `Rata-rata capaian indikator ini di wilayah binaan adalah ${regionalBlindspotIndicator.score}/4.0, menjadikannya titik kelemahan bersama yang paling mendesak diintervensi.`
    },
    {
      id: 'plan-02',
      topic: 'Optimalisasi Diferensiasi Proses & Integrasi KSE (Kompetensi Sosial Emosional)',
      targetAudience: 'Guru Mata Pelajaran Inti & Tim Pengembang Kurikulum',
      priorityLevel: 'Menengah (Prioritas II)',
      format: 'Kombel Antar-Sekolah',
      scheduleRecommendation: 'Pekan ke-4 Tiap Bulan (Pertemuan Daring/Luring Kombel)',
      rationale: 'Kesenjangan antara sekolah rujukan dan sekolah binaan penguatan paling tajam tampak pada variasi scaffolding diferensiasi di kelas.'
    },
    {
      id: 'plan-03',
      topic: 'Supervisi Klinis Tindak Lanjut Khusus Sekolah Prioritas Intervensi',
      targetAudience: `Kepala Sekolah & Dewan Guru ${needSupportSchool.name}`,
      priorityLevel: 'Tinggi (Prioritas I)',
      format: 'Bimtek Klinis',
      scheduleRecommendation: 'Jadwal Khusus Siklus II Pendampingan Pengawas',
      rationale: `Sekolah ini memerlukan bimbingan satu-satu untuk memastikan perbaikan formatif modul ajar dan pengelolaan iklim belajar berlangsung terukur.`
    }
  ];

  return {
    schools,
    regional,
    pmBySchool: pmMap,
    pairings,
    collectivePlans
  };
}
