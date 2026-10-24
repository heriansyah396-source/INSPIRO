/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ManagerialEvaluationRecord, calculateManagerialScore } from '../types/inspiro';
import { COMPLETE_MANAGERIAL_DIMENSIONS } from './managerialData';

// Helper to build evaluation with automatic calculation across all 138 indicators
function createSeedEvaluation(
  id: string,
  principalId: string,
  principalName: string,
  principalNip: string,
  schoolName: string,
  date: string,
  semester: 'Ganjil' | 'Genap',
  basePattern: (dimKey: string, itemIdx: number) => number,
  catatan: string,
  rekomendasi: string
): ManagerialEvaluationRecord {
  const scores: Record<string, number> = {};

  COMPLETE_MANAGERIAL_DIMENSIONS.forEach((dim) => {
    dim.items.forEach((item, idx) => {
      scores[item.id] = basePattern(dim.key, idx);
    });
  });

  const calc = calculateManagerialScore(scores);

  return {
    id,
    principalId,
    principalName,
    principalNip,
    schoolName,
    date,
    academicYear: '2026/2027',
    semester,
    scores,
    dimensionScores: calc.dimensionScores,
    totalScore: calc.totalScore,
    finalScore: calc.finalScore,
    predicate: calc.predicate,
    catatanPengawas: catatan,
    rekomendasiManajerial: rekomendasi,
    supervisorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    supervisorNip: '19820415 200801 1 007',
    status: 'selesai',
    createdAt: `${date}T10:00:00Z`,
    updatedAt: `${date}T13:30:00Z`
  };
}

export const SEED_MANAGERIAL_EVALUATIONS: ManagerialEvaluationRecord[] = [
  // 1. Dra. Hj. Nurhasanah, M.Pd. (SMP Negeri 1 Sidenreng Rappang) - Amat Baik (A)
  createSeedEvaluation(
    'me-2026-001',
    'KS001',
    'Dra. Hj. Nurhasanah, M.Pd.',
    '19720815 199802 2 003',
    'SMP Negeri 1 Sidenreng Rappang',
    '2026-09-28',
    'Ganjil',
    (dimKey, idx) => {
      // High performance: mostly 4s, occasionally 3s on items requiring ongoing renewal
      if (dimKey === 'sarpras' && (idx === 3 || idx === 8)) return 3;
      if (dimKey === 'humas' && idx === 7) return 3;
      if (dimKey === 'lingkungan' && idx === 12) return 3;
      if (dimKey === 'kesiswaan' && idx === 5) return 3;
      return 4;
    },
    'Kepemimpinan manajerial sangat visioner. Seluruh 8 dimensi manajerial (138 indikator) terpenuhi secara konsisten dan terdokumentasi rapi. Tata kelola Kurikulum Satuan Pendidikan (KSP) selaras dengan Rapor Pendidikan. Kepatuhan pembukuan ARKAS dan SPJ BOSP tertib tanpa catatan.',
    'Pertahankan budaya kerja kolaboratif dan pertahankan akuntabilitas pelaporan. Sekolah sangat layak menjadi model percontohan supervisi manajerial 8 dimensi di Kabupaten Sidenreng Rappang.'
  ),

  // 2. Drs. Bambang Irawan, M.Pd. (SMP Negeri 2 Merdeka Nusantara) - Baik (B)
  createSeedEvaluation(
    'me-2026-002',
    'KS002',
    'Drs. Bambang Irawan, M.Pd.',
    '19690312 199512 1 001',
    'SMP Negeri 2 Merdeka Nusantara',
    '2026-06-18',
    'Genap',
    (dimKey, idx) => {
      // Solid Good performance: mostly 3s, some 4s in curriculum and PTK, a few 2s in sarpras and humas
      if (dimKey === 'kurikulum' && idx < 6) return 4;
      if (dimKey === 'ptk' && (idx === 1 || idx === 2 || idx === 10)) return 4;
      if (dimKey === 'sarpras' && (idx === 3 || idx === 9)) return 2;
      if (dimKey === 'humas' && (idx === 1 || idx === 8)) return 2;
      if (idx % 3 === 0) return 4;
      return 3;
    },
    'Manajemen PTK dan pembudayaan Komunitas Belajar (Kombel) berjalan produktif. Penataan administrasi persuratan dan SOP penghapusan sarpras rusak berat masih memerlukan percepatan berkas berita acara.',
    'Perlu penguatan regulasi penghapusan aset lab IPA yang rusak berat dan pemutakhiran papan pengumuman transparansi penggunaan dana BOS serta pembaharuan naskah MoU kemitraan luar.'
  )
];

