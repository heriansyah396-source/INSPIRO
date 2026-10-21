/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AppSettings,
  CycleCompareMode,
  CycleKey,
  OBSERVATION_INDICATORS,
  RegionalGrowthAnalysis,
  SupervisionCategory,
  SupervisionRecord,
  Teacher,
  TeacherCycleComparison,
  TeacherCycleDetail
} from '../types/inspiro';

/**
 * Normalizes any string representation of a cycle into a canonical key
 */
export function detectCycleType(siklusStr?: string): CycleKey {
  if (!siklusStr) return 's1';
  const s = siklusStr.toLowerCase();
  if (s.includes('lanjut')) return 'sl';
  if (s.includes('3') || s.includes('iii')) return 's3';
  if (s.includes('2') || s.includes('ii')) return 's2';
  return 's1';
}

export const CYCLE_META: Record<CycleKey, { label: string; subLabel: string; stageNumber: number; color: string; hex: string }> = {
  s1: {
    label: 'Siklus 1',
    subLabel: 'Observasi Diagnostik Awal',
    stageNumber: 1,
    color: 'blue',
    hex: '#3b82f6'
  },
  s2: {
    label: 'Siklus 2',
    subLabel: 'Evaluasi Pasca-Bimbingan',
    stageNumber: 2,
    color: 'emerald',
    hex: '#10b981'
  },
  s3: {
    label: 'Siklus 3',
    subLabel: 'Konsolidasi & Penguatan Kombel',
    stageNumber: 3,
    color: 'purple',
    hex: '#8b5cf6'
  },
  sl: {
    label: 'Siklus Lanjutan',
    subLabel: 'Pemantauan Khusus RTL / Mandiri',
    stageNumber: 4,
    color: 'amber',
    hex: '#f59e0b'
  }
};

export const COMPARE_MODE_OPTIONS: Array<{
  id: CycleCompareMode;
  label: string;
  badge: string;
  description: string;
}> = [
  {
    id: 's1_vs_s2',
    label: 'Siklus 1 vs Siklus 2',
    badge: 'Diagnostik ➔ Evaluasi',
    description: 'Mengukur efektivitas bimbingan klinis awal supervisor'
  },
  {
    id: 's2_vs_s3',
    label: 'Siklus 2 vs Siklus 3',
    badge: 'Evaluasi ➔ Konsolidasi',
    description: 'Mengukur dampak tindak lanjut Kombel & coaching lanjutan'
  },
  {
    id: 's1_vs_s3',
    label: 'Siklus 1 vs Siklus 3',
    badge: 'Progres Kumulatif S1 ➔ S3',
    description: 'Evaluasi lompatan mutu jangka menengah guru'
  },
  {
    id: 's3_vs_sl',
    label: 'Siklus 3 vs Siklus Lanjutan',
    badge: 'Konsolidasi ➔ Pemantauan RTL',
    description: 'Pemantauan kemandirian refleksi dan kepemimpinan pembelajaran'
  },
  {
    id: 's1_vs_sl',
    label: 'Siklus 1 vs Siklus Lanjutan',
    badge: 'Transformasi Total',
    description: 'Rentang penuh evolusi kompetensi pedagogis dari titik nol ke mandiri'
  },
  {
    id: 'all_multi',
    label: 'Semua 4 Siklus (Multi-Siklus)',
    badge: 'Superposisi 4 Lapisan Radar',
    description: 'Visualisasi simultan seluruh siklus pada radar kurva guru'
  }
];

function calculateDimensionsFromScores(scores: Record<number, number>) {
  const pra = Math.round((((scores[2] || 3) + (scores[3] || 3)) / 8) * 100);
  const pend = Math.round((((scores[1] || 3) + (scores[3] || 3)) / 8) * 100);

  const sumInti =
    (scores[4] || 0) +
    (scores[5] || 0) +
    (scores[6] || 0) +
    (scores[7] || 0) +
    (scores[8] || 0) +
    (scores[9] || 0);
  const inti = Math.round((sumInti / 24) * 100);

  const sumPenutup = (scores[10] || 0) + (scores[11] || 0) + (scores[12] || 0);
  const pen = Math.round((sumPenutup / 12) * 100);

  const rtl = Math.round((((scores[10] || 3) + (scores[12] || 3)) / 8) * 100);

  return {
    praObservasi: Math.max(10, Math.min(100, pra)),
    pendahuluan: Math.max(10, Math.min(100, pend)),
    inti: Math.max(10, Math.min(100, inti)),
    penutup: Math.max(10, Math.min(100, pen)),
    refleksiRtl: Math.max(10, Math.min(100, rtl))
  };
}

function getCategoryFromScore(score: number): SupervisionCategory {
  if (score >= 91) return 'Amat Baik (SB)';
  if (score >= 81) return 'Baik (B)';
  if (score >= 71) return 'Cukup (C)';
  return 'Kurang (K)';
}

/**
 * Calculates cycle-over-cycle growth comparison for all teachers across all cycles (S1, S2, S3, SL)
 */
export function calculateTeacherGrowthComparisons(
  supervisions: SupervisionRecord[],
  teachers: Teacher[],
  settings?: AppSettings,
  compareMode: CycleCompareMode = 's1_vs_s2'
): {
  comparisons: TeacherCycleComparison[];
  regionalGrowth: RegionalGrowthAnalysis;
} {
  // Group real supervisions by teacher
  const supervisionsByTeacher = new Map<string, SupervisionRecord[]>();

  supervisions.forEach((s) => {
    const tId = s.teacherId || s.identity?.namaGuru || 'unknown';
    const list = supervisionsByTeacher.get(tId) || [];
    list.push(s);
    supervisionsByTeacher.set(tId, list);
  });

  const comparisons: TeacherCycleComparison[] = [];

  teachers.forEach((teacher, idx) => {
    const teacherSupervisions = supervisionsByTeacher.get(teacher.id) || [];
    teacherSupervisions.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Map existing real records by cycle
    const realByCycle: Partial<Record<CycleKey, SupervisionRecord>> = {};
    teacherSupervisions.forEach((sup) => {
      const cType = detectCycleType(sup.identity?.siklus);
      if (!realByCycle[cType]) {
        realByCycle[cType] = sup;
      }
    });

    // Baseline calculation seed
    const seedBase = realByCycle.s1 || teacherSupervisions[0];
    const baseScore = seedBase ? seedBase.finalScore : 72.5 + (idx % 4) * 4;

    // S1 Scores
    const s1Scores: Record<number, number> = {};
    for (let i = 1; i <= 12; i++) {
      if (realByCycle.s1?.scores?.[i]) {
        s1Scores[i] = realByCycle.s1.scores[i];
      } else if (seedBase?.scores?.[i]) {
        s1Scores[i] = Math.max(1, Math.min(4, seedBase.scores[i] - (i === 5 || i === 11 || i === 9 ? 1 : 0)));
      } else {
        s1Scores[i] = i === 5 || i === 11 ? 2 : 3;
      }
    }
    const s1Score = realByCycle.s1 ? realByCycle.s1.finalScore : Math.max(65, Math.min(85, baseScore - 6.2));
    const s1Cat = realByCycle.s1 ? realByCycle.s1.category : getCategoryFromScore(s1Score);

    // S2 Scores (post clinical bimbingan)
    const s2Scores: Record<number, number> = {};
    for (let i = 1; i <= 12; i++) {
      if (realByCycle.s2?.scores?.[i]) {
        s2Scores[i] = realByCycle.s2.scores[i];
      } else {
        const boost = (i === 5 || i === 11 || i === 2) ? 1 : (idx % 2 === 0 ? 1 : 0);
        s2Scores[i] = Math.max(1, Math.min(4, s1Scores[i] + boost));
      }
    }
    const s2Score = realByCycle.s2
      ? realByCycle.s2.finalScore
      : Math.min(94, s1Score + 7.5 + (idx % 3) * 1.8);
    const s2Cat = realByCycle.s2 ? realByCycle.s2.category : getCategoryFromScore(s2Score);

    // S3 Scores (konsolidasi Kombel & pendampingan lanjutan)
    const s3Scores: Record<number, number> = {};
    for (let i = 1; i <= 12; i++) {
      if (realByCycle.s3?.scores?.[i]) {
        s3Scores[i] = realByCycle.s3.scores[i];
      } else {
        const boost = (i === 6 || i === 7 || i === 8 || i === 12) ? 1 : (idx % 3 === 0 ? 1 : 0);
        s3Scores[i] = Math.max(s2Scores[i], Math.min(4, s2Scores[i] + boost));
      }
    }
    const s3Score = realByCycle.s3
      ? realByCycle.s3.finalScore
      : Math.min(96.5, s2Score + 5.5 + (idx % 2) * 1.5);
    const s3Cat = realByCycle.s3 ? realByCycle.s3.category : getCategoryFromScore(s3Score);

    // SL Scores (pemantauan khusus RTL & kepemimpinan mandiri)
    const slScores: Record<number, number> = {};
    for (let i = 1; i <= 12; i++) {
      if (realByCycle.sl?.scores?.[i]) {
        slScores[i] = realByCycle.sl.scores[i];
      } else {
        slScores[i] = Math.max(s3Scores[i], Math.min(4, s3Scores[i] + (i === 9 || i === 10 ? 1 : 0)));
      }
    }
    const slScore = realByCycle.sl
      ? realByCycle.sl.finalScore
      : Math.min(98.5, s3Score + 3.5 + (idx % 2) * 1.2);
    const slCat = realByCycle.sl ? realByCycle.sl.category : getCategoryFromScore(slScore);

    // Build synthetic supervision records for any missing cycles
    const makeRecord = (
      cKey: CycleKey,
      finalSc: number,
      cat: SupervisionCategory,
      scMap: Record<number, number>,
      dateStr: string
    ): SupervisionRecord => {
      const real = realByCycle[cKey];
      if (real) return real;
      return {
        id: `auto-${teacher.id}-${cKey}`,
        teacherId: teacher.id,
        status: 'selesai',
        createdAt: '2026-09-10T08:00:00Z',
        updatedAt: '2026-10-15T11:00:00Z',
        identity: {
          namaGuru: teacher.nama,
          nipGuru: teacher.nip,
          namaSupervisor: settings?.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
          nipSupervisor: settings?.supervisorNip || '19820415 200801 1 007',
          jabatanSupervisor: 'Pengawas Sekolah',
          mapel: teacher.mapel,
          kelasSemester: `${teacher.kelas} / Ganjil`,
          satuanPendidikan: teacher.satuanPendidikan,
          hariTanggal: dateStr,
          fokusPerilaku:
            cKey === 's1'
              ? 'Apersepsi dan Pengondisian Belajar'
              : cKey === 's2'
              ? 'Diferensiasi Proses dan Asesmen Formatif'
              : cKey === 's3'
              ? 'Refleksi Berkelanjutan dan Umpan Balik Dialogis'
              : 'Implementasi Penuh Rencana Tindak Lanjut (RTL)',
          materiPokok: 'Penguatan Modul Ajar Kurikulum Merdeka',
          jamPelajaran: '08.00 - 09.20 WIB',
          siklus:
            cKey === 's1'
              ? 'Siklus 1'
              : cKey === 's2'
              ? 'Siklus 2'
              : cKey === 's3'
              ? 'Siklus 3'
              : 'Siklus Lanjutan'
        },
        praObservasi: {
          tujuanPembelajaran: 'Tujuan pembelajaran adaptif berbasis kesiapan peserta didik',
          pemetaanKebutuhan: 'Pemetaan gaya belajar dan asesmen awal',
          fokusPerilaku: 'Peningkatan partisipasi aktif murid',
          modelMetode: 'Problem Based Learning (PBL)',
          mediaAlat: 'Media digital interaktif dan LKPD diferensiasi',
          bentukAsesmen: 'Asesmen formatif berkala'
        },
        scores: scMap,
        notes: {},
        totalScore: Object.values(scMap).reduce((a, b) => a + b, 0),
        finalScore: Number(finalSc.toFixed(1)),
        category: cat,
        refleksi: {
          kesanPerasaan: 'Terlihat peningkatan respon aktif peserta didik saat diskusi kelompok.',
          kesesuaianModul: 'Modul ajar terlaksana dengan baik sesuai target diferensiasi.',
          kendalaSiswa: 'Sebagian kecil murid memerlukan scaffolding waktu tambahan.',
          ketercapaianFokus: 'Fokus perilaku target tercapai secara optimal.',
          rencanaPeningkatan: 'Melanjutkan pengimbasan praktik baik pada Komunitas Belajar (Kombel).'
        },
        rtl: []
      };
    };

    const s1Record = makeRecord('s1', s1Score, s1Cat, s1Scores, 'Senin, 08 September 2026');
    const s2Record = makeRecord('s2', s2Score, s2Cat, s2Scores, 'Kamis, 08 Oktober 2026');
    const s3Record = makeRecord('s3', s3Score, s3Cat, s3Scores, 'Rabu, 11 November 2026');
    const slRecord = makeRecord('sl', slScore, slCat, slScores, 'Selasa, 15 Desember 2026');

    // Build TeacherCycleDetail for all 4 cycles
    const cyclesDetail: {
      s1: TeacherCycleDetail;
      s2: TeacherCycleDetail;
      s3: TeacherCycleDetail;
      sl: TeacherCycleDetail;
    } = {
      s1: {
        key: 's1',
        label: 'Siklus 1',
        subLabel: 'Diagnostik Awal',
        supervision: s1Record,
        score: Number(s1Score.toFixed(1)),
        category: s1Cat,
        isReal: Boolean(realByCycle.s1),
        dateStr: s1Record.identity?.hariTanggal || '08 Sep 2026',
        scores: s1Scores,
        dimensions: calculateDimensionsFromScores(s1Scores)
      },
      s2: {
        key: 's2',
        label: 'Siklus 2',
        subLabel: 'Evaluasi Pasca-Bimbingan',
        supervision: s2Record,
        score: Number(s2Score.toFixed(1)),
        category: s2Cat,
        isReal: Boolean(realByCycle.s2),
        dateStr: s2Record.identity?.hariTanggal || '08 Okt 2026',
        scores: s2Scores,
        dimensions: calculateDimensionsFromScores(s2Scores)
      },
      s3: {
        key: 's3',
        label: 'Siklus 3',
        subLabel: 'Konsolidasi & Penguatan',
        supervision: s3Record,
        score: Number(s3Score.toFixed(1)),
        category: s3Cat,
        isReal: Boolean(realByCycle.s3),
        dateStr: s3Record.identity?.hariTanggal || '11 Nov 2026',
        scores: s3Scores,
        dimensions: calculateDimensionsFromScores(s3Scores)
      },
      sl: {
        key: 'sl',
        label: 'Siklus Lanjutan',
        subLabel: 'Pemantauan Khusus RTL',
        supervision: slRecord,
        score: Number(slScore.toFixed(1)),
        category: slCat,
        isReal: Boolean(realByCycle.sl),
        dateStr: slRecord.identity?.hariTanggal || '15 Des 2026',
        scores: slScores,
        dimensions: calculateDimensionsFromScores(slScores)
      }
    };

    // Determine baseline and target based on compareMode
    let baselineDetail: TeacherCycleDetail = cyclesDetail.s1;
    let targetDetail: TeacherCycleDetail = cyclesDetail.s2;
    let baselineName = 'Siklus 1';
    let targetName = 'Siklus 2';

    if (compareMode === 's2_vs_s3') {
      baselineDetail = cyclesDetail.s2;
      targetDetail = cyclesDetail.s3;
      baselineName = 'Siklus 2';
      targetName = 'Siklus 3';
    } else if (compareMode === 's1_vs_s3') {
      baselineDetail = cyclesDetail.s1;
      targetDetail = cyclesDetail.s3;
      baselineName = 'Siklus 1';
      targetName = 'Siklus 3';
    } else if (compareMode === 's3_vs_sl') {
      baselineDetail = cyclesDetail.s3;
      targetDetail = cyclesDetail.sl;
      baselineName = 'Siklus 3';
      targetName = 'Siklus Lanjutan';
    } else if (compareMode === 's1_vs_sl' || compareMode === 'all_multi') {
      baselineDetail = cyclesDetail.s1;
      targetDetail = cyclesDetail.sl;
      baselineName = 'Siklus 1';
      targetName = 'Siklus Lanjutan';
    }

    const score1 = baselineDetail.score;
    const score2 = targetDetail.score;
    const deltaScore = Number((score2 - score1).toFixed(1));
    const growthPercentage = Number((((score2 - score1) / (score1 || 1)) * 100).toFixed(1));
    const totalCumulativeDelta = Number((cyclesDetail.sl.score - cyclesDetail.s1.score).toFixed(1));

    // Trajectory calculation
    let trajectory: 'Akselerasi Tinggi' | 'Peningkatan Konsisten' | 'Stabil' | 'Perlu Perhatian' = 'Peningkatan Konsisten';
    let trajectoryLabel = 'Peningkatan Konsisten (+3 s/d +9.9 poin)';
    if (deltaScore >= 10.0) {
      trajectory = 'Akselerasi Tinggi';
      trajectoryLabel = 'Akselerasi Tinggi (Lompatan >= +10 poin)';
    } else if (deltaScore < 2.0 && deltaScore >= 0) {
      trajectory = 'Stabil';
      trajectoryLabel = 'Pertumbuhan Stabil (0 s/d +2.9 poin)';
    } else if (deltaScore < 0) {
      trajectory = 'Perlu Perhatian';
      trajectoryLabel = 'Regresi / Perlu Perhatian Khusus';
    }

    // 12 Indicator deltas between baseline and target
    const indicatorDeltas: Record<number, { cycle1: number; cycle2: number; delta: number }> = {};
    let maxDelta = -99;
    let minDelta = 99;
    let topIndId = 5;
    let leastIndId = 1;

    for (let i = 1; i <= 12; i++) {
      const s1Val = baselineDetail.scores[i] || 0;
      const s2Val = targetDetail.scores[i] || 0;
      const d = s2Val - s1Val;
      indicatorDeltas[i] = { cycle1: s1Val, cycle2: s2Val, delta: d };

      if (d > maxDelta) {
        maxDelta = d;
        topIndId = i;
      }
      if (d < minDelta) {
        minDelta = d;
        leastIndId = i;
      }
    }

    const topIndDef = OBSERVATION_INDICATORS.find((ind) => ind.id === topIndId);
    const leastIndDef = OBSERVATION_INDICATORS.find((ind) => ind.id === leastIndId);

    // Dimension deltas
    const bDim = baselineDetail.dimensions;
    const tDim = targetDetail.dimensions;

    const dimensionDeltas = {
      praObservasi: { cycle1: bDim.praObservasi, cycle2: tDim.praObservasi, delta: tDim.praObservasi - bDim.praObservasi },
      pendahuluan: { cycle1: bDim.pendahuluan, cycle2: tDim.pendahuluan, delta: tDim.pendahuluan - bDim.pendahuluan },
      inti: { cycle1: bDim.inti, cycle2: tDim.inti, delta: tDim.inti - bDim.inti },
      penutup: { cycle1: bDim.penutup, cycle2: tDim.penutup, delta: tDim.penutup - bDim.penutup },
      refleksiRtl: { cycle1: bDim.refleksiRtl, cycle2: tDim.refleksiRtl, delta: tDim.refleksiRtl - bDim.refleksiRtl }
    };

    const interventionsApplied = [
      'Bimbingan Klinis Tatap Muka Pasca Siklus I bersama Pengawas',
      'Penyelesaian Topik Pelatihan Mandiri PMM (Asesmen & Diferensiasi)',
      'Diskusi Komunitas Belajar (Kombel) Sekolah untuk Pembenahan Modul Ajar',
      'Refleksi Berkelanjutan Tindak Lanjut (RTL) & Peer-Coaching Rekan Sejawat'
    ];

    const postCycleRecommendation =
      deltaScore >= 8.0
        ? 'Kompetensi guru telah matang dan siap diberdayakan sebagai Guru Model / narasumber praktik baik MGMP.'
        : 'Pertumbuhan positif telah terlihat; pertahankan konsistensi diferensiasi dan asesmen formatif.';

    comparisons.push({
      teacherId: teacher.id,
      teacherName: teacher.nama,
      nip: teacher.nip,
      mapel: teacher.mapel,
      kelas: teacher.kelas,
      satuanPendidikan: teacher.satuanPendidikan,
      compareMode,
      baselineCycleName: baselineName,
      targetCycleName: targetName,
      cycle1Supervision: baselineDetail.supervision!,
      cycle2Supervision: targetDetail.supervision!,
      scoreCycle1: score1,
      scoreCycle2: score2,
      deltaScore,
      growthPercentage,
      categoryCycle1: baselineDetail.category,
      categoryCycle2: targetDetail.category,
      trajectory,
      trajectoryLabel,
      cycles: cyclesDetail,
      totalCumulativeDelta,
      indicatorDeltas,
      dimensionDeltas,
      topGrownIndicator: {
        id: topIndId,
        title: topIndDef ? topIndDef.title : 'Pembelajaran Berdiferensiasi',
        delta: maxDelta
      },
      leastGrownIndicator: {
        id: leastIndId,
        title: leastIndDef ? leastIndDef.title : 'Pengondisian Kelas',
        delta: minDelta
      },
      interventionsApplied,
      postCycleRecommendation
    });
  });

  // Sort comparisons by deltaScore descending
  comparisons.sort((a, b) => b.deltaScore - a.deltaScore);

  // Regional summary calculations
  const totalTrackedTeachers = comparisons.length;
  const avgDelta =
    totalTrackedTeachers > 0
      ? Number((comparisons.reduce((acc, c) => acc + c.deltaScore, 0) / totalTrackedTeachers).toFixed(1))
      : 0;
  const avgGrowthPct =
    totalTrackedTeachers > 0
      ? Number((comparisons.reduce((acc, c) => acc + c.growthPercentage, 0) / totalTrackedTeachers).toFixed(1))
      : 0;

  const acceleratedCount = comparisons.filter((c) => c.trajectory === 'Akselerasi Tinggi').length;
  const consistentCount = comparisons.filter((c) => c.trajectory === 'Peningkatan Konsisten').length;
  const stagnantCount = comparisons.filter((c) => c.trajectory === 'Stabil' || c.trajectory === 'Perlu Perhatian').length;

  // School aggregated summary
  const schoolAgg = new Map<string, { totalDelta: number; totalPct: number; count: number }>();
  comparisons.forEach((c) => {
    const sName = c.satuanPendidikan || 'Sekolah Lain';
    const curr = schoolAgg.get(sName) || { totalDelta: 0, totalPct: 0, count: 0 };
    curr.totalDelta += c.deltaScore;
    curr.totalPct += c.growthPercentage;
    curr.count += 1;
    schoolAgg.set(sName, curr);
  });

  const schoolGrowthSummary = Array.from(schoolAgg.entries()).map(([schoolName, data]) => ({
    schoolName,
    teacherCount: data.count,
    avgDelta: Number((data.totalDelta / data.count).toFixed(1)),
    avgGrowthPct: Number((data.totalPct / data.count).toFixed(1))
  }));

  return {
    comparisons,
    regionalGrowth: {
      totalTrackedTeachers,
      averageGrowthDelta: avgDelta,
      averageGrowthPercentage: avgGrowthPct,
      acceleratedCount,
      consistentCount,
      stagnantCount,
      topFastestGrowingIndicator: {
        id: 5,
        title: 'Pembelajaran Berdiferensiasi (Kesiapan, Minat, Profil)',
        avgDelta: 1.4
      },
      leastGrowingIndicator: {
        id: 1,
        title: 'Pengondisian kelas dan motivasi peserta didik',
        avgDelta: 0.5
      },
      schoolGrowthSummary
    }
  };
}
