/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ManagerialMaturityRecord } from '../types/inspiro';

export const SEED_PRINCIPAL_MATURITY_RECORDS: ManagerialMaturityRecord[] = [
  {
    id: 'mat-rec-1',
    title: 'Diagnosis Kedewasaan Manajerial - UPT SD Negeri 4 Bilokka',
    date: '2026-08-18',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    principalId: 'p-1',
    headmasterName: 'Dra. Hj. Nurhasanah, M.Pd.',
    headmasterNip: '19720815 199802 2 003',
    headmasterRank: 'Pembina Tk. I (IV/b)',
    schoolName: 'UPT SD Negeri 4 Bilokka',
    schoolNpsn: '40301824',
    supervisorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    supervisorNip: '19830819 201001 1 002',
    supervisorRole: 'Pengawas Sekolah Pembina (Asesor)',
    supervisorRank: 'Penata Tk. I / III.d',
    scores: {
      dimensi_pbd: 3,
      dimensi_instruksional: 3,
      dimensi_sarana_digital: 3,
      dimensi_iklim_karakter: 4,
      dimensi_kemitraan: 3
    },
    dimensionNotes: {
      dimensi_pbd: 'PBD sudah selaras dengan RKAS pada komponen literasi dasar.',
      dimensi_instruksional: 'Kombel rutin bertemu 2x sebulan menelaah modul ajar diferensiasi.',
      dimensi_sarana_digital: 'Chromebook dimanfaatkan bergilir dengan jadwal rapi antar-guru.',
      dimensi_iklim_karakter: 'Budaya senyum sapa salam dan keyakinan kelas berjalan tertib tanpa kekerasan.',
      dimensi_kemitraan: 'Paguyuban orang tua aktif dalam program gotong royong dan kelas inspirasi.'
    },
    averageScore: 3.2,
    overallLevel: 'berdaya',
    overallLevelLabel: 'Level 3: Tahap Berdaya (Mandiri & Terpadu)',
    strengthSummary: 'Dra. Hj. Nurhasanah, M.Pd. telah membangun kepemimpinan manajerial yang matang di UPT SD Negeri 4 Bilokka, dengan keunggulan luar biasa pada dimensi Iklim Keamanan & Disiplin Positif (Skor 4/4). Lingkungan belajar sekolah sangat inklusif dan kondusif bagi tumbuh kembang murid.',
    growthAreaSummary: 'Penguatan lebih lanjut diarahkan pada eskalasi literasi digital guru dan penyelarasan RKAS ke tingkat otomatisasi PBD yang lebih mendalam agar sekolah siap bertransisi penuh ke Level 4 (Mahir).',
    aiActionRoadmap: [
      'Menyusun skenario pemanfaatan chromebook secara terintegrasi dalam asesmen formatif harian di semua rombel.',
      'Mendorong guru pionir sekolah mendokumentasikan praktik baik pembelajaran berdiferensiasi ke PMM Bukti Karya.',
      'Menyelenggarakan gelar karya inovasi murid (Student-Led Conference) bersama paguyuban orang tua di akhir semester.'
    ],
    supervisorFeedback: 'Kinerja kepemimpinan Dra. Hj. Nurhasanah, M.Pd. sangat konsisten dan inspiratif. Terus dampingi dewan guru agar mampu mengimbaskan praktik baik ini ke gugus sekolah sekitar di Panca Lautang.',
    status: 'final',
    createdAt: '2026-08-18T08:30:00Z',
    updatedAt: '2026-08-18T10:15:00Z'
  },
  {
    id: 'mat-rec-2',
    title: 'Diagnosis Kedewasaan Manajerial - SMP Negeri 1 Merdeka Nusantara',
    date: '2026-09-05',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    principalId: 'p-2',
    headmasterName: 'H. Muhammad Arsyad, S.Pd., M.Pd.',
    headmasterNip: '19700312 199512 1 001',
    headmasterRank: 'Pembina Utama Muda (IV/c)',
    schoolName: 'SMP Negeri 1 Merdeka Nusantara',
    schoolNpsn: '40301980',
    supervisorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    supervisorNip: '19830819 201001 1 002',
    supervisorRole: 'Pengawas Sekolah Pembina (Asesor)',
    supervisorRank: 'Penata Tk. I / III.d',
    scores: {
      dimensi_pbd: 4,
      dimensi_instruksional: 4,
      dimensi_sarana_digital: 4,
      dimensi_iklim_karakter: 3,
      dimensi_kemitraan: 4
    },
    dimensionNotes: {
      dimensi_pbd: 'Tata kelola PBD berbasis rapor pendidikan terverifikasi 100% di ARKAS dengan indeks efisiensi tinggi.',
      dimensi_instruksional: 'Kombel menjadi wadah riset aksi kelas dan guru aktif memenangkan lomba inovasi.',
      dimensi_sarana_digital: 'Papan Interaktif Digital dan LMS sekolah terintegrasi dengan akun Belajar.id semua siswa.',
      dimensi_iklim_karakter: 'Perlu penguatan agen pencegahan perundungan sebaya di tingkat ekstrakurikuler.',
      dimensi_kemitraan: 'Kemitraan luas dengan dunia usaha, perguruan tinggi, dan alumni Sidrap.'
    },
    averageScore: 3.8,
    overallLevel: 'mahir',
    overallLevelLabel: 'Level 4: Tahap Mahir (Episentrum Rujukan & Pengimbasan)',
    strengthSummary: 'H. Muhammad Arsyad, S.Pd., M.Pd. telah menempatkan SMP Negeri 1 Merdeka Nusantara di puncak kematangan manajerial Level 4 (Mahir) dengan keunggulan komprehensif pada tata kelola PBD, ekosistem digital cerdas, dan kemitraan kolaboratif strategis.',
    growthAreaSummary: 'Fokus pembinaan lanjutan ditujukan pada regenerasi kepemimpinan guru penggerak muda dan penguatan program duta anti-perundungan untuk menjaga iklim keamanan sekolah tetap berada pada skor maksimal.',
    aiActionRoadmap: [
      'Menyiapkan sekolah sebagai rujukan studi tiru manajerial PBD bagi kepala sekolah lain se-Kabupaten Sidenreng Rappang.',
      'Meluncurkan buku saku atau modul digital rangkuman praktik baik kepemimpinan instruksional sekolah.',
      'Membentuk konsorsium pembinaan bersama sekolah imbas di Kuadran Berkembang untuk percepatan mutu daerah.'
    ],
    supervisorFeedback: 'Selamat atas capaian membanggakan ini. Satuan pendidikan ini adalah teladan nyata tata kelola kepemimpinan sekolah abad-21 di Kabupaten Sidenreng Rappang.',
    status: 'final',
    createdAt: '2026-09-05T09:00:00Z',
    updatedAt: '2026-09-05T11:45:00Z'
  }
];
