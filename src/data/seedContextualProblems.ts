/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContextualProblemRecord } from '../types/inspiro';

export const SEED_CONTEXTUAL_PROBLEMS: ContextualProblemRecord[] = [
  {
    id: 'cp-001',
    schoolName: 'SMP Negeri 1 Merdeka Nusantara',
    teacherId: 'G001',
    teacherName: 'Ahmad Fauzi, S.Pd.',
    teacherNip: '19850714 201001 1 012',
    subject: 'Matematika',
    gradeClass: 'VII (Fase D)',
    date: '2026-10-12',
    assessorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    assessorRole: 'Pengawas Sekolah',
    assessorNip: '19830819 201001 1 002',
    headmasterName: 'Dra. Hj. Nurhasanah, M.Pd.',
    headmasterNip: '19720815 199802 2 003',

    problemCategory: 'keaktifan_murid',
    problemTitle: 'Pasivitas & Tingginya Kecemasan Murid dalam Eksplorasi Aljabar',
    severity: 'Tinggi',

    dataSources: ['observasi_awal', 'wawancara_guru', 'suara_murid'],
    baselineDataEvidence:
      'Pada kunjungan observasi awal kelas VII, terdata 68% murid di barisan tengah dan belakang bersikap pasif menunduk saat guru memberi pertanyaan pemantik aljabar. Dalam wawancara singkat, 5 murid mengaku cemas ditertawakan teman bila salah menjawab rumus di papan tulis, sehingga memilih diam menyalin catatan guru.',

    rootCauses: {
      aspekMetodeGuru:
        'Guru terbiasa menggunakan pola ceramah instruksi langsung di papan tulis (> 65% durasi tatap muka) dan langsung menunjuk murid secara acak tanpa memberi waktu jeda berpikir (wait time).',
      aspekPerencanaanModul:
        'Lembar Kerja Peserta Didik (LKPD) bersifat seragam dengan tingkat kesulitan tinggi tanpa ada scaffolding tingkatan dasar bagi murid yang belum menguasai konsep prasyarat.',
      aspekPengelolaanKelas:
        'Belum dibangun kesepakatan kelas yang mengayomi kesalahan berpikir; respon guru saat murid salah menjawab masih terkesan mengoreksi kaku tanpa apresiasi proses.',
      aspekKarakteristikMurid:
        'Murid mengalami trauma matematika (math anxiety) dari jenjang sebelumnya dan terbiasa dengan metode hafalan rumus cepat.',
      aspekDayaDukung:
        'Susunan meja berbaris lurus menghadap papan tulis menghambat interaksi diskusi teman sebaya.'
    },

    fiveWhys: {
      why1: 'Murid enggan bertanya dan pasif saat jam pelajaran matematika.',
      why2: 'Murid takut salah menjawab karena khawatir ditertawakan teman atau ditegur guru.',
      why3: 'Guru belum membangun iklim keamanan emosional (growth mindset) dan instruksi mengajar didominasi ceramah satu arah.'
    },

    recommendedIntervention: {
      supervisionAction: 'Coaching TIRTA',
      targetTimeline: '2 Pekan (Oktober 2026)',
      actionDetails: [
        'Lakukan sesi Coaching Dialogis Alur TIRTA untuk memfasilitasi guru menemukan teknik "Think-Pair-Share" dan penataan kesepakatan kelas positif.',
        'Integrasikan instrumen PM: Lingkungan Belajar dengan fokus "Iklim Keamanan Emosional & Efisiensi Waktu".',
        'Sepakati penggunaan visual countdown timer untuk membatasi ceramah guru maksimal 15 menit awal.'
      ],
      linkedFeature: 'coaching'
    },

    status: 'dalam_penanganan',
    resolutionNotes: 'Guru telah menyepakati aturan Roda Emosi dan mulai menata bangku berkelompok.',
    createdAt: '2026-10-12T08:30:00Z',
    updatedAt: '2026-10-15T10:00:00Z'
  },
  {
    id: 'cp-002',
    schoolName: 'SMP Negeri 1 Merdeka Nusantara',
    teacherId: 'G002',
    teacherName: 'Siti Rahmawati, M.Pd.',
    teacherNip: '19881120 201101 2 015',
    subject: 'Bahasa Indonesia',
    gradeClass: 'VIII (Fase D)',
    date: '2026-10-14',
    assessorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    assessorRole: 'Pengawas Sekolah',
    assessorNip: '19830819 201001 1 002',
    headmasterName: 'Dra. Hj. Nurhasanah, M.Pd.',
    headmasterNip: '19720815 199802 2 003',

    problemCategory: 'diferensiasi_belajar',
    problemTitle: 'Kedangkalan Argumen Kritis & Ketergantungan Copy-Paste Teks Digital',
    severity: 'Sedang',

    dataSources: ['artefak_tugas', 'wawancara_guru'],
    baselineDataEvidence:
      'Dari telaah 32 berkas tugas teks tanggapan kritis murid, ditemukan 75% karya memiliki struktur kalimat yang hampir identik dari artikel berita internet tanpa sintesis opini mandiri. Guru mengeluhkan kesulitan membedakan karya orisinal murid dengan teks hasil copy-paste.',

    rootCauses: {
      aspekMetodeGuru:
        'Guru belum memperkenalkan teknik berpikir kritis (Critical Thinking Prompts) dan panduan parafrase ilmiah populer.',
      aspekPerencanaanModul:
        'Topik tugas bersifat umum dan teoritis (bukan isu kontekstual lokal yang dialami murid sehari-hari di Kabupaten Sidenreng Rappang).',
      aspekPengelolaanKelas:
        'Umpan balik tugas hanya diberikan berupa nilai angka di akhir semester tanpa siklus revisi berkala.',
      aspekKarakteristikMurid:
        'Literasi membaca kritis murid masih rendah; murid terbiasa mencari jalan pintas menggunakan mesin pencari internet.',
      aspekDayaDukung:
        'Ketiadaan platform kurasi digital bersama yang memungkinkan murid saling meninjau karya teman (peer-review).'
    },

    fiveWhys: {
      why1: 'Teks tanggapan murid sangat dangkal dan mayoritas hasil copy-paste internet.',
      why2: 'Murid bingung merumuskan kalimat opini sendiri dan tidak dibekali rubrik literasi etika siber.',
      why3: 'Guru belum mengontekstualisasikan topik dengan isu lokal dan belum menerapkan kolaborasi digital interaktif.'
    },

    recommendedIntervention: {
      supervisionAction: 'Pendampingan PM',
      targetTimeline: '3 Pekan (Oktober - November 2026)',
      actionDetails: [
        'Dampingi guru mengontekstualisasikan materi teks tanggapan ke isu lokal lingkungan di Kabupaten Sidenreng Rappang.',
        'Terapkan papan kolaborasi digital Padlet untuk memfasilitasi peer-review terbuka dan penanaman etika anti-plagiasi.',
        'Gunakan instrumen PM: Pemanfaatan Digital untuk mengukur kenaikan level SAMR dari Substitution ke Modification.'
      ],
      linkedFeature: 'pm-digital'
    },

    status: 'dalam_penanganan',
    resolutionNotes: 'Guru mulai menguji coba Padlet dengan topik isu kebersihan lingkungan sekolah.',
    createdAt: '2026-10-14T09:15:00Z',
    updatedAt: '2026-10-16T11:20:00Z'
  },
  {
    id: 'cp-003',
    schoolName: 'SMP Negeri 2 Merdeka Nusantara',
    teacherId: 'G003',
    teacherName: 'Budi Santoso, S.Pd.',
    teacherNip: '19920315 201903 1 008',
    subject: 'Ilmu Pengetahuan Alam (IPA)',
    gradeClass: 'VII (Fase D)',
    date: '2026-10-16',
    assessorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    assessorRole: 'Pengawas Sekolah',
    assessorNip: '19830819 201001 1 002',
    headmasterName: 'Drs. Bambang Irawan, M.Pd.',
    headmasterNip: '19690312 199512 1 001',

    problemCategory: 'manajemen_waktu',
    problemTitle: 'Manajemen Ritme Pembelajaran Laboratorium Tersendat & Alokasi Waktu Praktikum Molor',
    severity: 'Tinggi',

    dataSources: ['observasi_awal', 'supervisi_sebelumnya'],
    baselineDataEvidence:
      'Pada observasi awal praktikum IPA di Laboratorium, penjelasan guru di papan tulis menghabiskan waktu 26 menit (sepertiga jam tatap muka). Antrian pengambilan kit preparat menyita 8 menit, menyebabkan waktu murid mengamati dan menganalisis data tersisa hanya 10 menit sebelum bel istirahat berbunyi.',

    rootCauses: {
      aspekMetodeGuru:
        'Guru menjelaskan seluruh prosedur teknis langkah demi langkah secara verbal lisan panjang, alih-alih memberikan panduan visual ringkas atau penugasan mandiri.',
      aspekPerencanaanModul:
        'Tidak ada time-chunking (pembagian jatah durasi per tahapan praktikum) dalam lembar instruksi modul.',
      aspekPengelolaanKelas:
        'Tidak ada pembagian peran spesifik di tiap kelompok (tidak ada penanggung jawab alat, pencatat, juru bicara), sehingga semua murid berkerumun di meja display alat.',
      aspekKarakteristikMurid:
        'Murid antusias namun kurang terbiasa dengan disiplin keselamatan dan manajemen waktu di laboratorium.',
      aspekDayaDukung:
        'Jumlah mikroskop terbatas sehingga membutuhkan antrian bergiliran.'
    },

    fiveWhys: {
      why1: 'Praktikum IPA selalu kehabisan waktu dan tahap refleksi analisis data terlewat.',
      why2: 'Penjelasan teori awal guru terlalu panjang dan distribusi alat memakan waktu lama.',
      why3: 'Guru belum menerapkan strategi time-chunking manajemen kelas dan belum memanfaatkan alternatif simulasi virtual (PhET).'
    },

    recommendedIntervention: {
      supervisionAction: 'Supervisi Klinis',
      targetTimeline: 'Siklus II (November 2026)',
      actionDetails: [
        'Jadwalkan Supervisi Klinis Siklus II dengan fokus khusus Indikator 6 (Efisiensi Waktu Belajar Aktif) dan Indikator 7 (Pemanfaatan Media Praktikum).',
        'Terapkan simulasi virtual PhET Interactive Simulations sebagai pendukung awal praktikum agar durasi penjelasan teori terpangkas.',
        'Tetapkan 1 murid penanggung jawab logistik alat di tiap kelompok untuk memangkas antrian hingga di bawah 2 menit.'
      ],
      linkedFeature: 'supervision'
    },

    status: 'teridentifikasi',
    createdAt: '2026-10-16T08:00:00Z',
    updatedAt: '2026-10-16T08:00:00Z'
  }
];
