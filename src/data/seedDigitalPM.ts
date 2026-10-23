/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PMDigitalRecord } from '../types/inspiro';

export const SEED_DIGITAL_PM_RECORDS: PMDigitalRecord[] = [
  {
    id: 'pdm-001',
    schoolName: 'SMP Negeri 1 Merdeka Nusantara',
    teacherId: 'G001',
    teacherName: 'Ahmad Fauzi, S.Pd.',
    teacherNip: '19850714 201001 1 012',
    subject: 'Matematika',
    gradeClass: 'VII (Fase D)',
    topic: 'Pemodelan Aljabar Linier dengan GeoGebra & Infografis Canva',
    date: '2026-10-18',
    assessorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    assessorRole: 'Pengawas Sekolah',
    assessorNip: '19820415 200801 1 007',
    headmasterName: 'Dra. Hj. Nurhasanah, M.Pd.',
    headmasterNip: '19720815 199802 2 003',

    dim1CreatorRole: {
      score: 4,
      level: 'Membudaya',
      artifactsCreated: 'Grafik Interaktif GeoGebra & Infografis Solusi Nyata di Canva',
      notes:
        'Murid bertindak sebagai kreator digital penuh. Setiap kelompok mengoperasikan Chromebook untuk memodelkan persamaan aljabar secara visual di GeoGebra, lalu menuangkan temuan ke dalam poster infografis Canva.',
      evidenceNotes:
        'Dihasilkan 7 infografis digital orisinal dengan visualisasi grafik koordinat yang diekspor langsung oleh murid.'
    },

    dim2Collaboration: {
      score: 4,
      level: 'Membudaya',
      platforms: 'Google Workspace (Drive & Slides Terbagi) & Canva for Education',
      notes:
        'Kolaborasi cloud simultan berjalan sangat hidup. Anggota kelompok berbagi peran secara real-time: satu anak memanipulasi slider GeoGebra, satu anak merancang layout Canva, dan yang lain menyusun teks interpretasi.',
      evidenceNotes:
        'Riwayat riil (version history) Google Slides menunjukkan kontribusi aktif seluruh anggota tim secara merata.'
    },

    dim3Assessment: {
      score: 3,
      level: 'Matang',
      assessmentTool: 'Quizizz Mode Kertas & Google Forms Bertingkat',
      notes:
        'Guru menggunakan Quizizz di pertengahan sesi untuk memeriksa pemahaman konsep variabel. Data ringkasan akurasi langsung diproyeksikan untuk membahas soal yang paling banyak dijawab keliru.',
      evidenceNotes:
        'Teridentifikasi 6 murid yang mengalami miskonsepsi tanda minus langsung diberikan kartu bantuan digital.'
    },

    dim4EthicsAndAi: {
      score: 3,
      level: 'Matang',
      aiUsageNotes: 'Pemanfaatan AI (Gemini) untuk memvalidasi rumus alternatif dan verifikasi lisensi gambar bebas royalti di Canva.',
      notes:
        'Murid diajarkan mencantumkan sumber atribusi pada gambar yang diambil dari internet dan menelaah kebenaran output AI secara kritis.',
      evidenceNotes:
        'Semua karya poster memuat catatan kaki lisensi hak cipta (*Creative Commons Attribution*).'
    },

    checklist: {
      createsDigitalArtifacts: true,
      realtimeCollaboration: true,
      adaptiveAssessmentFeedback: true,
      digitalEthicsAndAi: true,
      authenticAudience: true
    },

    toolUsage: {
      toolsUsed: ['GeoGebra', 'Canva for Education', 'Google Slides', 'Quizizz'],
      deviceType: 'Chromebook / Laptop',
      studentHandsOnDuration: 58,
      totalLessonDuration: 80,
      studentHandsOnRatioPct: 72.5,
      samrLevel: 'Modification'
    },

    totalScore: 87.5,
    maturityLevel: 'Level 3: Matang (Modification)',
    samrSummary: 'Level Modification (Perancangan Ulang Tugas): Penggunaan GeoGebra dan Canva mendesain ulang tugas matematika menjadi eksplorasi visual dinamis yang tak tergantikan oleh kertas.',
    keyStrengths: [
      'Rasio keterlibatan murid mengoperasikan Chromebook mencapai 72.5% (58 dari 80 menit pembelajaran).',
      'Integrasi GeoGebra memungkinkan murid memanipulasi variabel aljabar secara visual dan interaktif.',
      'Kolaborasi dokumen bersama berjalan tanpa hambatan teknis.'
    ],
    keyGrowthAreas: [
      'Meningkatkan level ke Redefinition dengan mempublikasikan poster infografis ke website/sosial media sekolah.',
      'Melatih murid memanfaatkan Gemini AI untuk membuat studi kasus matematika kehidupan sehari-hari.'
    ],
    supervisoryRecommendations: [
      'Jadikan praktik pemanfaatan GeoGebra + Canva ini sebagai model diseminasi di MGMP Matematika Kabupaten Sidenreng Rappang.',
      'Kembangkan portofolio digital berbasis Google Sites untuk mendokumentasikan karya komputasi murid sepanjang semester.'
    ],
    status: 'final',
    createdAt: '2026-10-18T09:30:00Z',
    updatedAt: '2026-10-18T11:45:00Z'
  },
  {
    id: 'pdm-002',
    schoolName: 'SMP Negeri 1 Merdeka Nusantara',
    teacherId: 'G002',
    teacherName: 'Siti Rahmawati, M.Pd.',
    teacherNip: '19881120 201101 2 015',
    subject: 'Bahasa Indonesia',
    gradeClass: 'VIII (Fase D)',
    topic: 'Penyusunan Teks Tanggapan Kritis melalui Papan Kolaborasi Padlet',
    date: '2026-10-20',
    assessorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    assessorRole: 'Pengawas Sekolah',
    assessorNip: '19820415 200801 1 007',
    headmasterName: 'Dra. Hj. Nurhasanah, M.Pd.',
    headmasterNip: '19720815 199802 2 003',

    dim1CreatorRole: {
      score: 3,
      level: 'Matang',
      artifactsCreated: 'Kolom Ulasan Kritis & Podcast Suara Singkat di Padlet',
      notes:
        'Murid menyusun ulasan teks tanggapan terhadap buku bacaan sastra remaja. Ulasan dilengkapi rekaman suara podcast 2 menit menggunakan fitur audio Padlet.',
      evidenceNotes:
        'Tersedia 32 postingan ulasan interaktif dengan rekaman suara opini yang jelas.'
    },

    dim2Collaboration: {
      score: 4,
      level: 'Membudaya',
      platforms: 'Padlet Interaktif & Google Classroom Terintegrasi Akun Belajar.id',
      notes:
        'Murid saling memberikan umpan balik sejawat (*peer-review*) dengan fitur komentar dan reaksi bintang di Padlet secara etis dan santun.',
      evidenceNotes:
        'Tercatat rata-rata 3 komentar konstruktif pada setiap kiriman karya rekan sejawat.'
    },

    dim3Assessment: {
      score: 3,
      level: 'Matang',
      assessmentTool: 'Rubrik Asesmen Digital Terbuka & Exit Ticket Google Form',
      notes:
        'Rubrik penilaian teks tanggapan disematkan langsung di kolom atas Padlet sehingga murid memahami kriteria kualitas sebelum mengunggah karya.',
      evidenceNotes:
        'Exit ticket Google Form diisi lengkap dalam 5 menit terakhir untuk mengukur tingkat metakognisi murid.'
    },

    dim4EthicsAndAi: {
      score: 4,
      level: 'Membudaya',
      aiUsageNotes: 'Pemanfaatan AI untuk perbandingan parafrase teks dan analisis bias sentimen berita.',
      notes:
        'Guru memberikan pemahaman mendalam mengenai bahaya plagiasi digital dan bagaimana menyusun sitasi karya ilmiah populer secara benar.',
      evidenceNotes:
        'Murid berhasil membedakan kalimat orisinal dan hasil copy-paste dengan bantuan uji parafrase.'
    },

    checklist: {
      createsDigitalArtifacts: true,
      realtimeCollaboration: true,
      adaptiveAssessmentFeedback: true,
      digitalEthicsAndAi: true,
      authenticAudience: true
    },

    toolUsage: {
      toolsUsed: ['Padlet', 'Google Docs', 'Google Classroom', 'Belajar.id'],
      deviceType: 'Smartphone / Tablet',
      studentHandsOnDuration: 52,
      totalLessonDuration: 80,
      studentHandsOnRatioPct: 65.0,
      samrLevel: 'Modification'
    },

    totalScore: 87.5,
    maturityLevel: 'Level 3: Matang (Modification)',
    samrSummary: 'Level Modification: Papan Padlet dan rekaman audio mengubah tugas menulis ulasan menjadi galeri interaktif multi-modal dengan umpan balik terbuka antar-murid.',
    keyStrengths: [
      'Pemanfaatan fitur rekaman suara Padlet memfasilitasi murid yang memiliki gaya belajar auditori.',
      'Budaya saling memberi komentar apresiatif dan kritis terbangun matang.',
      'Literasi etika digital dan anti-plagiasi ditekankan secara eksplisit.'
    ],
    keyGrowthAreas: [
      'Meningkatkan stabilitas jaringan Wi-Fi sekolah agar akses rekaman audio tidak mengalami kelambatan.',
      'Menyusun antologi digital teks tanggapan karya murid untuk dibagikan kepada orang tua.'
    ],
    supervisoryRecommendations: [
      'Dorong guru untuk mengekspor tautan galeri Padlet ke dalam Platform Merdeka Mengajar (PMM) sebagai Bukti Karya.',
      'Fasilitasi kolaborasi literasi digital lintas mapel bersama guru Bahasa Inggris dan Seni Budaya.'
    ],
    status: 'final',
    createdAt: '2026-10-20T10:15:00Z',
    updatedAt: '2026-10-20T12:30:00Z'
  },
  {
    id: 'pdm-003',
    schoolName: 'SMP Negeri 2 Merdeka Nusantara',
    teacherId: 'G003',
    teacherName: 'Budi Santoso, S.Pd.',
    teacherNip: '19920315 201903 1 008',
    subject: 'Ilmu Pengetahuan Alam (IPA)',
    gradeClass: 'VII (Fase D)',
    topic: 'Laboratorium Virtual PhET: Simulasi Rantai Makanan & Jaring-Jaring Kehidupan',
    date: '2026-10-21',
    assessorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    assessorRole: 'Pengawas Sekolah',
    assessorNip: '19820415 200801 1 007',
    headmasterName: 'Drs. Bambang Irawan, M.Pd.',
    headmasterNip: '19690312 199512 1 001',

    dim1CreatorRole: {
      score: 3,
      level: 'Matang',
      artifactsCreated: 'Tabel Eksperimen Virtual & Laporan Digital Interaktif PhET',
      notes:
        'Murid menjalankan simulasi ekosistem PhET secara mandiri untuk menguji hipotesis apa yang terjadi jika populasi produsen berkurang.',
      evidenceNotes:
        'Setiap pasangan murid mencatat data perubahan grafik populasi dari layar PhET ke lembar kerja digital.'
    },

    dim2Collaboration: {
      score: 2,
      level: 'Berkembang',
      platforms: 'Lab Komputer Sekolah & Google Classroom',
      notes:
        'Murid bekerja berpasangan di satu komputer, namun interaksi berbagi data antar-kelompok masih dilakukan manual lisan tanpa platform kolaboratif bersama.',
      evidenceNotes:
        'Pengumpulan laporan masih bersifat individu/pasangan tanpa adanya pertukaran data lintas kelompok.'
    },

    dim3Assessment: {
      score: 3,
      level: 'Matang',
      assessmentTool: 'Kuis Cepat Wordwall & Lembar Refleksi Digital',
      notes:
        'Guru menggunakan Wordwall interaktif di akhir sesi untuk mengecek pemahaman rantai makanan dengan format permainan mencocokkan peran makhluk hidup.',
      evidenceNotes:
        'Grafik kecepatan dan akurasi murid tampil di papan tulis dan memicu antusiasme belajar tinggi.'
    },

    dim4EthicsAndAi: {
      score: 2,
      level: 'Berkembang',
      aiUsageNotes: 'Belum mengintegrasikan AI; fokus pada eksplorasi simulasi sains.',
      notes:
        'Guru mengingatkan keselamatan penggunaan komputer dan etika menjaga kebersihan laboratorium komputer sekolah.',
      evidenceNotes:
        'Tata tertib lab ditaati dengan baik oleh seluruh peserta didik.'
    },

    checklist: {
      createsDigitalArtifacts: true,
      realtimeCollaboration: false,
      adaptiveAssessmentFeedback: true,
      digitalEthicsAndAi: false,
      authenticAudience: false
    },

    toolUsage: {
      toolsUsed: ['PhET Interactive Simulations', 'Wordwall', 'Google Classroom'],
      deviceType: 'Laboratorium Komputer',
      studentHandsOnDuration: 45,
      totalLessonDuration: 80,
      studentHandsOnRatioPct: 56.25,
      samrLevel: 'Augmentation'
    },

    totalScore: 62.5,
    maturityLevel: 'Level 2: Berkembang (Augmentation)',
    samrSummary: 'Level Augmentation (Peningkatan Fungsional): Simulasi PhET menyempurnakan praktikum sains dengan visualisasi interaktif yang memperjelas konsep abstrak rantai makanan.',
    keyStrengths: [
      'Pemanfaatan simulasi PhET mengatasi keterbatasan alat peraga riil dan memvisualisasikan dinamika populasi secara gamblang.',
      'Antusiasme murid tinggi saat menyelesaikan kuis gamifikasi Wordwall.'
    ],
    keyGrowthAreas: [
      'Meningkatkan rasio kolaborasi digital (misal menggunakan Google Jamboard untuk merangkum jaring-jaring makanan bersama).',
      'Memperkenalkan etika penelusuran fakta sains digital dan integrasi AI pencarian ilmiah sederhana.'
    ],
    supervisoryRecommendations: [
      'Berikan pendampingan Coaching TIRTA terkait integrasi Google Workspace for Education dalam pembelajaran IPA.',
      'Fasilitasi penggunaan Chromebook secara bergantian di ruang kelas reguler agar tidak bergantung penuh pada ketersediaan Lab Komputer.'
    ],
    status: 'final',
    createdAt: '2026-10-21T08:30:00Z',
    updatedAt: '2026-10-21T10:45:00Z'
  }
];
