/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MoralFeedbackRecord } from '../types/inspiro';

export const SEED_MORAL_FEEDBACK_RECORDS: MoralFeedbackRecord[] = [
  {
    id: 'MF-001',
    date: '2026-10-14',
    schoolName: 'UPT SMP Negeri 1 Pangkajene',
    schoolNpsn: '40305412',
    senderRole: 'Guru',
    isAnonymous: true,
    senderName: 'Anonim (Pendidik)',
    senderSubjectOrTitle: 'Guru Bahasa Indonesia',
    sourceChannel: 'mandiri_guru',
    category: 'nasihat_pengingat',
    barometer: {
      menenangkan: 4,
      mendengarkan: 4,
      solutif: 5,
      memuliakan: 5
    },
    averageScore: 4.5,
    message:
      'Bapak Pengawas sangat ramah saat masuk ke kelas. Namun mohon izin menyampaikan dengan segala hormat: ketika waktu observasi hampir selesai, ritme umpan balik terasa agak cepat sehingga kami belum sempat bercerita tentang kendala siswa yang lambat membaca. Semoga ke depan ada 5-10 menit jeda santai untuk mendengarkan keluh kesah guru terlebih dahulu sebelum catatan penilaian dibuka.',
    specificMoment: 'Sesi pasca-observasi kelas VIII-A setelah jam ke-4',
    supervisorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    supervisorNip: '19830819 201001 1 002',
    supervisorReflection:
      'Masukan ini sangat menyentuh. Saya sadar sering mengejar jadwal kunjungan sekolah berikutnya sehingga mengurangi porsi mendengarkan empatik bagi guru pasca-observasi.',
    supervisorCommitment:
      'Mulai kunjungan pekan depan, saya berkomitmen mengosongkan 15 menit pertama pasca-observasi khusus untuk mendengarkan cerita batin guru tanpa membuka laptop atau rubrik terlebih dahulu.',
    reflectedAt: '2026-10-15T08:30:00.000Z',
    status: 'direfleksikan',
    createdAt: '2026-10-14T11:20:00.000Z',
    updatedAt: '2026-10-15T08:30:00.000Z'
  },
  {
    id: 'MF-002',
    date: '2026-10-18',
    schoolName: 'UPT SMP Negeri 2 Maritengngae',
    schoolNpsn: '40305425',
    senderRole: 'Kepala Sekolah',
    isAnonymous: false,
    senderName: 'Dra. Hj. Nurhasanah, M.Pd.',
    senderSubjectOrTitle: 'Kepala Sekolah Pembina Sekolah Binaan',
    sourceChannel: 'mandiri_kepsek',
    category: 'apresiasi_penguat',
    barometer: {
      menenangkan: 5,
      mendengarkan: 5,
      solutif: 5,
      memuliakan: 5
    },
    averageScore: 5.0,
    message:
      'Terima kasih Pak Pengawas telah hadir bukan untuk mencari-cari kesalahan administrasi sekolah kami, melainkan duduk bersama membongkar akar masalah literasi numerasi. Sikap Bapak yang membesarkan hati guru-guru senior membuat iklim sekolah jauh lebih berani berinovasi tanpa rasa takut salah.',
    specificMoment: 'Lokakarya kecil Peta Langkah Nyata 30-60-90 Hari bersama tim pengembang kurikulum',
    supervisorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    supervisorNip: '19830819 201001 1 002',
    supervisorReflection:
      'Alhamdulillah, pendekatan kemitraan setara dan menghindari sifat inspeksi administratif mulai menumbuhkan rasa aman di satuan pendidikan.',
    supervisorCommitment:
      'Tetap menjaga adab bertamu, mendahulukan apresiasi atas ikhtiar kecil sekolah sebelum memberi catatan perbaikan.',
    reflectedAt: '2026-10-19T07:45:00.000Z',
    status: 'tindak_lanjut',
    createdAt: '2026-10-18T14:15:00.000Z',
    updatedAt: '2026-10-19T07:45:00.000Z'
  },
  {
    id: 'MF-003',
    date: '2026-10-24',
    schoolName: 'UPT SD Negeri 6 Amparita',
    schoolNpsn: '40305510',
    senderRole: 'Guru',
    isAnonymous: true,
    senderName: 'Anonim (Pendidik)',
    senderSubjectOrTitle: 'Guru Kelas Rendah',
    sourceChannel: 'mandiri_guru',
    category: 'suasana_psikologis',
    barometer: {
      menenangkan: 5,
      mendengarkan: 4,
      solutif: 4,
      memuliakan: 5
    },
    averageScore: 4.5,
    message:
      'Awalnya saya sangat gugup ketika mendengar ada jadwal supervisi pengawas. Namun cara Bapak menyapa anak-anak di kelas dengan senyum dan tidak menyela saat saya mengajar membuat ketegangan langsung hilang. Saran praktis tentang alat peraga sederhana sangat mudah langsung kami praktikkan tanpa biaya besar.',
    specificMoment: 'Observasi pembelajaran terdiferensiasi kelas II',
    supervisorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    supervisorNip: '19830819 201001 1 002',
    status: 'baru',
    createdAt: '2026-10-24T10:05:00.000Z',
    updatedAt: '2026-10-24T10:05:00.000Z'
  },
  {
    id: 'MF-004',
    date: '2026-10-28',
    schoolName: 'UPT SMP Negeri 1 Baranti',
    schoolNpsn: '40305433',
    senderRole: 'Komunitas Belajar',
    isAnonymous: false,
    senderName: 'Tim Kombel Guru IPA & Matematika',
    senderSubjectOrTitle: 'Catatan Diskusi Lisan Pasca-Kombel',
    sourceChannel: 'catatan_lapangan',
    category: 'harapan_doa',
    barometer: {
      menenangkan: 5,
      mendengarkan: 5,
      solutif: 4,
      memuliakan: 5
    },
    averageScore: 4.75,
    message:
      'Dalam obrolan ringan usai sesi Kombel, guru-guru menyampaikan harapan agar contoh perangkat ajar berbasis kearifan lokal Sidrap yang disusun bersama dapat dibagikan lintas sekolah binaan. Mereka juga mendoakan agar Bapak selalu diberi kesehatan dan kesabaran membimbing sekolah-sekolah pinggiran.',
    specificMoment: 'Refleksi santai bersama anggota Kombel di ruang guru pukul 13.30 WITA',
    supervisorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    supervisorNip: '19830819 201001 1 002',
    status: 'baru',
    createdAt: '2026-10-28T13:50:00.000Z',
    updatedAt: '2026-10-28T13:50:00.000Z'
  }
];
