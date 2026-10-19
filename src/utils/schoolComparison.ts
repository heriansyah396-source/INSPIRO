/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  OBSERVATION_INDICATORS,
  RegionalQualitySummary,
  SchoolQualityMetrics,
  SupervisionRecord,
  Teacher
} from '../types/inspiro';

// Distinctive harmonious colors for schools on radar & charts
export const SCHOOL_COLORS = [
  '#2563eb', // Blue (Primary)
  '#059669', // Emerald
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#0891b2', // Cyan
  '#e11d48'  // Rose
];

export function computeSchoolComparisonData(
  supervisions: SupervisionRecord[],
  teachers: Teacher[],
  cycleFilter: string = 'all'
): {
  schools: SchoolQualityMetrics[];
  summary: RegionalQualitySummary;
  allSchoolNames: string[];
} {
  // Filter by cycle if applicable
  const filteredSups = cycleFilter === 'all'
    ? supervisions
    : supervisions.filter((s) => s.identity?.siklus === cycleFilter);

  // Discover all unique school names from supervisions and teachers
  const schoolNameSet = new Set<string>();
  supervisions.forEach((s) => {
    if (s.identity?.satuanPendidikan?.trim()) {
      schoolNameSet.add(s.identity.satuanPendidikan.trim());
    }
  });
  teachers.forEach((t) => {
    if (t.satuanPendidikan?.trim()) {
      schoolNameSet.add(t.satuanPendidikan.trim());
    }
  });

  // Ensure default base schools if list is sparse
  if (schoolNameSet.size === 0) {
    schoolNameSet.add('SMP Negeri 1 Merdeka Nusantara');
  }

  const allSchoolNames = Array.from(schoolNameSet);

  const schoolMetricsList: SchoolQualityMetrics[] = allSchoolNames.map((schoolName, idx) => {
    const schoolTeachers = teachers.filter(
      (t) => t.satuanPendidikan?.toLowerCase().trim() === schoolName.toLowerCase().trim()
    );
    const schoolSups = filteredSups.filter(
      (s) => s.identity?.satuanPendidikan?.toLowerCase().trim() === schoolName.toLowerCase().trim()
    );

    const completedSups = schoolSups.filter((s) => s.status === 'selesai' || s.totalScore > 0);

    // If no completed supervisions for this school, construct reasonable baseline
    if (completedSups.length === 0) {
      const defaultIndicators: Record<number, number> = {};
      OBSERVATION_INDICATORS.forEach((ind) => {
        defaultIndicators[ind.id] = 2.8;
      });

      return {
        schoolName,
        teacherCount: Math.max(schoolTeachers.length, 1),
        supervisedCount: 0,
        averageScore: 33.6,
        averagePercentage: 70,
        category: 'Cukup (C)',
        dimensions: {
          praObservasi: 70,
          pendahuluan: 72,
          inti: 68,
          penutup: 69,
          refleksiRtl: 71
        },
        indicatorScores: defaultIndicators,
        supportTier: 'intensif',
        supportTierLabel: 'Pendampingan Intensif (Belum Ada Supervisi Lengkap)',
        recommendedAction: 'Jadwalkan siklus supervisi observasi kelas perdana dan pendampingan penyusunan perangkat modul ajar.',
        priorityFocus: 'Pelaksanaan Observasi Perdana',
        color: SCHOOL_COLORS[idx % SCHOOL_COLORS.length]
      };
    }

    // Compute average final score
    const sumFinalScore = completedSups.reduce((acc, s) => acc + (s.finalScore || (s.totalScore / 48) * 100), 0);
    const avgFinalScore = Number((sumFinalScore / completedSups.length).toFixed(1));

    // Compute 12 indicators average (1.0 - 4.0)
    const indicatorScores: Record<number, number> = {};
    OBSERVATION_INDICATORS.forEach((ind) => {
      let sum = 0;
      let count = 0;
      completedSups.forEach((s) => {
        if (s.scores && s.scores[ind.id] !== undefined) {
          sum += Number(s.scores[ind.id]);
          count++;
        }
      });
      indicatorScores[ind.id] = count > 0 ? Number((sum / count).toFixed(2)) : 3.0;
    });

    // Compute 5 dimensions
    // 1. Pra-Observasi
    let praSum = 0;
    completedSups.forEach((s) => {
      if (s.praObservasi) {
        let f = 0;
        if (s.praObservasi.tujuanPembelajaran?.length > 5) f++;
        if (s.praObservasi.pemetaanKebutuhan?.length > 5) f++;
        if (s.praObservasi.fokusPerilaku?.length > 5) f++;
        if (s.praObservasi.modelMetode?.length > 5) f++;
        if (s.praObservasi.mediaAlat?.length > 5) f++;
        if (s.praObservasi.bentukAsesmen?.length > 5) f++;
        praSum += Math.min(100, Math.round(65 + (f / 6) * 35));
      } else {
        praSum += 75;
      }
    });
    const praScore = Math.round(praSum / completedSups.length);

    // 2. Pendahuluan (Ind 1-3, max 12)
    const pendTotal = (indicatorScores[1] || 3) + (indicatorScores[2] || 3) + (indicatorScores[3] || 3);
    const pendScore = Math.min(100, Math.round((pendTotal / 12) * 100));

    // 3. Inti (Ind 4-9, max 24)
    let intiTotal = 0;
    for (let i = 4; i <= 9; i++) {
      intiTotal += indicatorScores[i] || 3;
    }
    const intiScore = Math.min(100, Math.round((intiTotal / 24) * 100));

    // 4. Penutup (Ind 10-12, max 12)
    const penTotal = (indicatorScores[10] || 3) + (indicatorScores[11] || 3) + (indicatorScores[12] || 3);
    const penScore = Math.min(100, Math.round((penTotal / 12) * 100));

    // 5. Refleksi & RTL
    let rtlSum = 0;
    completedSups.forEach((s) => {
      let p = 65;
      if (s.refleksi?.kesanPerasaan?.length > 5) p += 20;
      if (s.rtl && s.rtl.length > 0) p += Math.min(15, s.rtl.length * 8);
      rtlSum += Math.min(100, p);
    });
    const refleksiRtlScore = Math.round(rtlSum / completedSups.length);

    // Category
    let category: SchoolQualityMetrics['category'] = 'Baik (B)';
    if (avgFinalScore >= 91) category = 'Amat Baik (SB)';
    else if (avgFinalScore >= 81) category = 'Baik (B)';
    else if (avgFinalScore >= 71) category = 'Cukup (C)';
    else category = 'Kurang (K)';

    // Support Tier based on Perdirjen GTK 4831/2023
    let supportTier: SchoolQualityMetrics['supportTier'] = 'terfokus';
    let supportTierLabel = 'Pendampingan Terfokus';
    let recommendedAction = 'Fasilitasi FGD antar guru mapel untuk penguatan instruksi adaptif dan instrumen asesmen formatif.';
    let priorityFocus = 'Pembelajaran Berdiferensiasi';

    // Find lowest indicator
    let lowestIndId = 1;
    let lowestVal = 99;
    OBSERVATION_INDICATORS.forEach((ind) => {
      if ((indicatorScores[ind.id] || 0) < lowestVal) {
        lowestVal = indicatorScores[ind.id] || 0;
        lowestIndId = ind.id;
      }
    });
    const lowestIndObj = OBSERVATION_INDICATORS.find((ind) => ind.id === lowestIndId);
    if (lowestIndObj) {
      priorityFocus = lowestIndObj.title;
    }

    if (avgFinalScore >= 86) {
      supportTier = 'berbagi';
      supportTierLabel = 'Pendampingan Berbagi (Mandiri)';
      recommendedAction = `Sekolah telah mencapai tahap mandiri. Dorong guru-guru teladan menjadi narasumber Berbagi Praktik Baik di Komunitas Belajar (Kombel) gugus binaan.`;
    } else if (avgFinalScore < 76) {
      supportTier = 'intensif';
      supportTierLabel = 'Pendampingan Intensif';
      recommendedAction = `Lakukan coaching tatap muka langsung bersama Kepala Sekolah & Pendidik dengan fokus perbaikan: "${priorityFocus}".`;
    } else {
      supportTier = 'terfokus';
      supportTierLabel = 'Pendampingan Terfokus';
      recommendedAction = `Adakan workshop mini dalam Kombel internal sekolah untuk penguatan dimensi: "${priorityFocus}".`;
    }

    return {
      schoolName,
      teacherCount: Math.max(schoolTeachers.length, completedSups.length),
      supervisedCount: completedSups.length,
      averageScore: Number((avgFinalScore * 0.48).toFixed(1)),
      averagePercentage: avgFinalScore,
      category,
      dimensions: {
        praObservasi: praScore,
        pendahuluan: pendScore,
        inti: intiScore,
        penutup: penScore,
        refleksiRtl: refleksiRtlScore
      },
      indicatorScores,
      supportTier,
      supportTierLabel,
      recommendedAction,
      priorityFocus,
      color: SCHOOL_COLORS[idx % SCHOOL_COLORS.length]
    };
  });

  // Sort schools by average percentage descending
  schoolMetricsList.sort((a, b) => b.averagePercentage - a.averagePercentage);

  // Compute Regional Summary
  const totalSchools = schoolMetricsList.length;
  const totalTeachers = schoolMetricsList.reduce((acc, s) => acc + s.teacherCount, 0);
  const totalSupervisions = schoolMetricsList.reduce((acc, s) => acc + s.supervisedCount, 0);
  const regionalAvg = totalSchools > 0
    ? Number((schoolMetricsList.reduce((acc, s) => acc + s.averagePercentage, 0) / totalSchools).toFixed(1))
    : 80;

  const topSchool = schoolMetricsList[0]
    ? { name: schoolMetricsList[0].schoolName, score: schoolMetricsList[0].averagePercentage }
    : { name: '-', score: 0 };

  const needSupportSchool = schoolMetricsList[schoolMetricsList.length - 1]
    ? { name: schoolMetricsList[schoolMetricsList.length - 1].schoolName, score: schoolMetricsList[schoolMetricsList.length - 1].averagePercentage }
    : { name: '-', score: 0 };

  // Calculate indicator averages across all schools to find regional blindspot and strengths
  let minAvgIndVal = 99;
  let minAvgIndId = 1;
  let maxAvgIndVal = -1;
  let maxAvgIndId = 1;

  OBSERVATION_INDICATORS.forEach((ind) => {
    let sum = 0;
    schoolMetricsList.forEach((s) => {
      sum += s.indicatorScores[ind.id] || 3.0;
    });
    const avg = totalSchools > 0 ? sum / totalSchools : 3.0;
    if (avg < minAvgIndVal) {
      minAvgIndVal = avg;
      minAvgIndId = ind.id;
    }
    if (avg > maxAvgIndVal) {
      maxAvgIndVal = avg;
      maxAvgIndId = ind.id;
    }
  });

  const blindspotObj = OBSERVATION_INDICATORS.find((i) => i.id === minAvgIndId);
  const strengthsObj = OBSERVATION_INDICATORS.find((i) => i.id === maxAvgIndId);

  const summary: RegionalQualitySummary = {
    totalSchools,
    totalTeachers,
    totalSupervisions,
    regionalAverageScore: regionalAvg,
    topSchool,
    needSupportSchool,
    regionalBlindspotIndicator: {
      id: minAvgIndId,
      title: blindspotObj?.title || 'Diferensiasi Pembelajaran',
      score: Number(minAvgIndVal.toFixed(2))
    },
    regionalStrengthsIndicator: {
      id: maxAvgIndId,
      title: strengthsObj?.title || 'Pengondisian Kelas & Motivasi',
      score: Number(maxAvgIndVal.toFixed(2))
    }
  };

  return {
    schools: schoolMetricsList,
    summary,
    allSchoolNames
  };
}
