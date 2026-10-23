/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SOARAnalysisRecord } from '../types/inspiro';

export const SEED_SOAR_RECORDS: SOARAnalysisRecord[] = [
  {
    id: 'soar-001',
    schoolName: 'SMP Negeri 1 Merdeka Nusantara',
    schoolNpsn: '40301234',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    date: '2026-10-21',
    title: 'Transformasi Holistik 4 Kerangka Pembelajaran Mendalam (PM) Berbasis Potensi Lokal Sidrap',
    focusPillarSummary: 'Integrasi penuh 4 Kerangka PM (Praktik Pedagogis, Lingkungan Belajar, Pemanfaatan Digital, & Kemitraan Pembelajaran)',
    leadSupervisor: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    supervisorNip: '19820415 200801 1 007',
    supervisorRole: 'Pengawas Sekolah',
    headmasterName: 'Dra. Hj. Nurhasanah, M.Pd.',
    headmasterNip: '19720815 199802 2 003',
    appreciativeInquiryStage: 'Design',
    synthesisNotes:
      'Pendekatan SOAR membangkitkan energi positif kolektif guru dan manajemen sekolah. Dibandingkan mencari-cari kelemahan guru, identifikasi kekuatan (aset modal manusia 8 guru penggerak, kemitraan erat dengan BPP Pertanian & kelompok tani Sipadeceng) mampu membuka aspirasi besar untuk menjadikan SMPN 1 Merdeka Nusantara sebagai pionir Place-Based Deep Learning di Kabupaten Sidenreng Rappang.',
    items: [
      // 1. STRENGTHS (Kekuatan & Aset Berharga)
      {
        id: 'soar-item-s1',
        quadrant: 'strength',
        pillar: 'pedagogi',
        title: 'Komunitas Belajar Internal Aktif & Budaya Lesson Study',
        description:
          'Kombes guru rutin menggelar sesi peer-observation dan co-planning modul ajar berdiferensiasi setiap hari Rabu siang.',
        evidenceOrMetric: 'Jurnal refleksi Kombes semester lalu mencatat 12 modul ajar berbasis proyek kontekstual berhasil diujicobakan.',
        priority: 'Sangat Tinggi',
        score: 92,
        assetType: 'Modal Manusia'
      },
      {
        id: 'soar-item-s2',
        quadrant: 'strength',
        pillar: 'lingkungan',
        title: 'Iklim Kelas Aman & Budaya Kesepakatan Kelas Partisipatif',
        description:
          'Seluruh rombel telah mengimplementasikan segitiga restitusi dan kesepakatan belajar yang disusun bersama murid tanpa vonis hukuman fisik.',
        evidenceOrMetric: 'Indeks iklim keamanan sekolah dalam evaluasi internal mencapai 94.2% dengan zero laporan bullying fisik.',
        priority: 'Tinggi',
        score: 88,
        assetType: 'Modal Sosial'
      },
      {
        id: 'soar-item-s3',
        quadrant: 'strength',
        pillar: 'digital',
        title: 'Infrastruktur TIK Chromebook & Akun Belajar.id Aktif 100%',
        description:
          'Sekolah memiliki 2 laboratorium Chromebook mobile (60 unit) dengan jaringan serat optik 100 Mbps dan guru terbiasa menggunakan Google Workspace.',
        evidenceOrMetric: 'Tingkat aktivasi dan utilisasi akun belajar.id guru mencapai 100% dan murid mencapai 96.5%.',
        priority: 'Tinggi',
        score: 86,
        assetType: 'Modal Fisik'
      },
      {
        id: 'soar-item-s4',
        quadrant: 'strength',
        pillar: 'kemitraan',
        title: 'Jaringan Kemitraan Komunitas & Petani Sipadeceng Sidrap',
        description:
          'Kerja sama erat dengan Balai Penyuluhan Pertanian (BPP) dan UMKM beras organik lokal untuk riset otentik murid di lapangan.',
        evidenceOrMetric: 'MoU aktif kemitraan edukasi lingkungan & sains terapan dengan 3 kelompok tani serta puskesmas setempat.',
        priority: 'Sangat Tinggi',
        score: 95,
        assetType: 'Modal Lingkungan'
      },

      // 2. OPPORTUNITIES (Peluang Eksternal Berdaya Ungkit)
      {
        id: 'soar-item-o1',
        quadrant: 'opportunity',
        pillar: 'pedagogi',
        title: 'Dukungan Penuh Program Prioritas Kurikulum Merdeka Disdikbud Sidrap',
        description:
          'Dinas Pendidikan Kabupaten Sidenreng Rappang memberikan porsi fasilitasi gelar karya inovasi dan pendampingan pengawas pembina secara intensif.',
        evidenceOrMetric: 'Alokasi anggaran diseminasi praktik baik dan apresiasi guru inovatif tingkat kabupaten.',
        priority: 'Sangat Tinggi',
        score: 90,
        assetType: 'Modal Finansial'
      },
      {
        id: 'soar-item-o2',
        quadrant: 'opportunity',
        pillar: 'digital',
        title: 'Akselerasi Pemanfaatan AI Generatif Edukatif Terbimbing',
        description:
          'Tersedianya platform AI resmi dan materi literasi digital Kemenkominfo/Kemendikbud yang dapat diintegrasikan dalam proyek riset murid.',
        evidenceOrMetric: 'Pelatihan regional AI untuk Pembelajaran Berdiferensiasi yang difasilitasi Balai Guru Penggerak Sulsel.',
        priority: 'Tinggi',
        score: 87,
        assetType: 'Modal Budaya'
      },
      {
        id: 'soar-item-o3',
        quadrant: 'opportunity',
        pillar: 'kemitraan',
        title: 'Antusiasme Orang Tua terhadap Student-Led Conference (SLC)',
        description:
          'Komite sekolah dan paguyuban orang tua sangat mendukung format laporan belajar murid langsung di hadapan keluarga dibanding sekadar pembagian rapor searah.',
        evidenceOrMetric: 'Survei minat orang tua menunjukkan 89% menyetujui pelibatan aktif dalam pameran portofolio murid.',
        priority: 'Tinggi',
        score: 85,
        assetType: 'Modal Sosial'
      },
      {
        id: 'soar-item-o4',
        quadrant: 'opportunity',
        pillar: 'lingkungan',
        title: 'Revitalisasi Halaman Sekolah sebagai Laboratorium Ekologi Alami',
        description:
          'Tersedianya lahan terbuka hijau di lingkungan sekolah yang dapat dikonversi menjadi taman sains botani dan zona baca terbuka.',
        evidenceOrMetric: 'Dukungan bibit tanaman endemik dari Dinas Lingkungan Hidup Kab. Sidrap sebanyak 150 bibit.',
        priority: 'Sedang',
        score: 82,
        assetType: 'Modal Fisik'
      },

      // 3. ASPIRATIONS (Aspirasi & Impian Transformasi Pembelajaran)
      {
        id: 'soar-item-a1',
        quadrant: 'aspiration',
        pillar: 'pedagogi',
        title: 'Menjadi Sekolah Model Pembelajaran Mendalam Berbasis Tempat (Place-Based)',
        description:
          'Seluruh guru mampu mendesain pembelajaran di mana murid tidak lagi bertanya "untuk apa saya belajar ini?", melainkan langsung memecahkan masalah riil lingkungan.',
        evidenceOrMetric: '100% guru menerapkan asesmen unjuk kerja berbasis portofolio dan rubrik pemikiran kritis terpadu.',
        priority: 'Sangat Tinggi',
        score: 94,
        assetType: 'Modal Budaya'
      },
      {
        id: 'soar-item-a2',
        quadrant: 'aspiration',
        pillar: 'lingkungan',
        title: 'Ekosistem Sekolah Humanis: Every Student Feels Seen, Heard & Valued',
        description:
          'Terciptanya ruang belajar yang menumbuhkan agensi penuh murid (Voice, Choice, Ownership), bebas dari rasa takut salah saat bereksplorasi gagasan.',
        evidenceOrMetric: 'Tingkat kepuasan & rasa berdaya murid mencapai skor kepuasan di atas 95% pada survei tahunan.',
        priority: 'Tinggi',
        score: 91,
        assetType: 'Modal Sosial'
      },
      {
        id: 'soar-item-a3',
        quadrant: 'aspiration',
        pillar: 'digital',
        title: 'Murid sebagai Produsen Karya Digital Bernilai Solusi Nyata (Bukan Sekadar Konsumen)',
        description:
          'Murid memanfaatkan teknologi digital untuk memublikasikan hasil investigasi ilmiah, video advokasi lingkungan lokal, dan aplikasi sederhana pemantau kualitas air.',
        evidenceOrMetric: 'Publikasi minimal 1 kanal digital terbuka per rombel yang mengarsipkan karya portofolio multimedia murid.',
        priority: 'Tinggi',
        score: 88,
        assetType: 'Modal Manusia'
      },
      {
        id: 'soar-item-a4',
        quadrant: 'aspiration',
        pillar: 'kemitraan',
        title: 'Aliansi Multipihak: Sekolah Menjadi Pusat Pemberdayaan Komunitas Lokal',
        description:
          'Tumbuhnya sinergi erat antarmurid, orang tua, praktisi, dan pemerintah desa di mana hasil riset murid diadopsi sebagai masukan kebijakan desa.',
        evidenceOrMetric: 'Minimal 2 proyek pembelajaran per tahun diadopsi secara formal oleh pemangku kepentingan masyarakat.',
        priority: 'Sangat Tinggi',
        score: 93,
        assetType: 'Modal Lingkungan'
      },

      // 4. RESULTS (Hasil Terukur & Dampak Nyata)
      {
        id: 'soar-item-r1',
        quadrant: 'result',
        pillar: 'pedagogi',
        title: 'Peningkatan Signifikan Indeks Kompetensi Literasi & Numerasi Bermakna',
        description:
          'Skor Rapor Pendidikan pada domain literasi dan numerasi berbasis nalar tinggi meningkat ke kategori Mahir (di atas 85).',
        evidenceOrMetric: 'Kenaikan nilai rata-rata asesmen autentik antarsiklus supervisi dari 81.4 ke 92.6.',
        priority: 'Sangat Tinggi',
        score: 93,
        assetType: 'Modal Manusia'
      },
      {
        id: 'soar-item-r2',
        quadrant: 'result',
        pillar: 'lingkungan',
        title: 'Efisiensi Waktu Belajar Bermakna (Time-on-Task) Mencapai >85%',
        description:
          'Pengurangan drastis waktu terbuang untuk instruksi administratif; murid langsung aktif terlibat dalam kolaborasi dan inkuiri bermakna.',
        evidenceOrMetric: 'Observasi supervisi mencatat alokasi kegiatan inti aktif meningkat dari 62% menjadi 88% durasi JP.',
        priority: 'Tinggi',
        score: 89,
        assetType: 'Modal Sosial'
      },
      {
        id: 'soar-item-r3',
        quadrant: 'result',
        pillar: 'digital',
        title: 'Integrasi Level SAMR Capai Redefinition & Modifikasi Teruji',
        description:
          'Penggunaan teknologi digital tidak lagi sebatas substitusi pengetikan modul, tetapi memungkinkan kolaborasi daring lintas sekolah dan pemodelan sensor sains.',
        evidenceOrMetric: '100% sampel proyek digital siswa berada pada level Modification atau Redefinition model SAMR.',
        priority: 'Tinggi',
        score: 87,
        assetType: 'Modal Fisik'
      },
      {
        id: 'soar-item-r4',
        quadrant: 'result',
        pillar: 'kemitraan',
        title: 'Terselenggaranya Student-Led Conference & Expo Karya Autentik Publik',
        description:
          '100% murid mempresentasikan portofolio belajarnya secara langsung kepada orang tua dan perwakilan mitra tani/UMKM dengan kepuasan audiens 96%.',
        evidenceOrMetric: 'Dokumentasi video gelar karya, 280 lembar umpan balik positif orang tua, dan piagam apresiasi dari BPP.',
        priority: 'Sangat Tinggi',
        score: 96,
        assetType: 'Modal Sosial'
      }
    ],
    strategies: [
      {
        id: 'strat-1',
        type: 'S-O',
        title: 'Kapitalisasi Komunitas Belajar Internal & Dukungan Disdikbud untuk Diseminasi PM',
        description:
          'Menggunakan kekuatan 8 guru penggerak dan budaya Kombes yang solid untuk menangkap peluang fasilitasi Disdikbud Sidrap, menjadikan sekolah sebagai pusat magang studi tiru pembelajaran mendalam.',
        linkedPillars: ['pedagogi', 'kemitraan'],
        actionSteps: [
          'Menyusun jadwal open-class berbasis lesson study antar-guru setiap dua pekan sekali',
          'Menerbitkan modul panduan praktis 4 pilar PM versi sekolah',
          'Mengundang pengawas pembina dan MGMP rumpun sains-sosial tingkat kabupaten untuk sesi sharing'
        ],
        targetOutcome: 'Tersedianya bank modul ajar PM terverifikasi dan 100% guru aktif melakukan co-teaching.',
        timeline: 'Bulan ke-1 s.d. Bulan ke-3',
        pic: 'Wakasek Kurikulum & Koordinator Kombes',
        progress: 80,
        status: 'Sedang Berjalan'
      },
      {
        id: 'strat-2',
        type: 'S-A',
        title: 'Akselerasi Riset Lapangan Terpadu Berbasis Kemitraan Komunitas Sipadeceng',
        description:
          'Memadukan kekuatan jejaring kelompok tani lokal dengan aspirasi menjadi sekolah model pembelajaran berbasis tempat (place-based), sehingga sains dan numerasi dipelajari dari tanah pertanian Sidrap.',
        linkedPillars: ['pedagogi', 'kemitraan', 'lingkungan'],
        actionSteps: [
          'Merumuskan kurikulum tematik berbasis ekosistem pangan dan irigasi lokal',
          'Membuat jadwal mentoring langsung kelompok tani dengan kelompok murid di sawah riset',
          'Menyusun rubrik penilaian autentik multidisiplin (IPA, Matematika, IPS, Bahasa)'
        ],
        targetOutcome: 'Lahirnya 12 karya riset lingkungan murid yang diakui dan digunakan kelompok tani lokal.',
        timeline: 'Bulan ke-2 s.d. Bulan ke-5',
        pic: 'Guru IPA & Pembina Ekstrakurikuler KIR',
        progress: 75,
        status: 'Sedang Berjalan'
      },
      {
        id: 'strat-3',
        type: 'O-R',
        title: 'Pemanfaatan Bantuan TIK & AI Terbimbing untuk Pencapaian Portofolio Digital Level Tinggi',
        description:
          'Mengoptimalkan program literasi digital dan akun belajar.id untuk memastikan hasil evaluasi SAMR melompat ke level redefinisi dengan bukti terukur portofolio digital murid.',
        linkedPillars: ['digital', 'pedagogi'],
        actionSteps: [
          'Workshop literasi AI etis dan penulisan prompt riset untuk guru dan perwakilan murid',
          'Pembuatan website portofolio kelas berbasis Google Sites untuk setiap rombel',
          'Audit berkala integrasi digital menggunakan rubrik rubrik SAMR terintegrasi INSPIRO'
        ],
        targetOutcome: '90% murid memiliki website portofolio mandiri yang diperbarui secara reguler.',
        timeline: 'Bulan ke-3 s.d. Bulan ke-6',
        pic: 'Koordinator Laboratorium Komputer & Tim TIK',
        progress: 60,
        status: 'Sedang Berjalan'
      },
      {
        id: 'strat-4',
        type: 'A-R',
        title: 'Institusionalisasi Student-Led Conference Menuju Ekosistem Belajar Humanis Paripurna',
        description:
          'Mewujudkan aspirasi agensi murid (suara, pilihan, kepemilikan) menjadi hasil terukur melalui penyelenggaraan konferensi murid semesteran dengan orang tua sebagai mitra pendamping.',
        linkedPillars: ['lingkungan', 'kemitraan'],
        actionSteps: [
          'Pelatihan murid dalam memandu presentasi capaian belajarnya di hadapan orang tua',
          'Penyusunan panduan dialog konstruktif bagi orang tua saat mendampingi anak',
          'Pelaksanaan SLC serentak di akhir semester gasal disertai refleksi kualitatif'
        ],
        targetOutcome: 'Tingkat kehadiran orang tua >95% dan indeks agensi murid berada pada kategori Sangat Positif.',
        timeline: 'Bulan ke-5 s.d. Bulan ke-6',
        pic: 'Tim Kesiswaan, Guru BK, & Komite Sekolah',
        progress: 40,
        status: 'Perencanaan'
      }
    ],
    createdAt: '2026-10-21T08:30:00.000Z',
    updatedAt: '2026-10-21T11:45:00.000Z'
  },
  {
    id: 'soar-002',
    schoolName: 'SMP Negeri 2 Merdeka Nusantara',
    schoolNpsn: '40301235',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    date: '2026-10-22',
    title: 'Penguatan Lingkungan Belajar Inklusif & Kemitraan Digital Terbuka',
    focusPillarSummary: 'Fokus Utama: Lingkungan Belajar & Pemanfaatan Digital untuk Inklusi Pendidikan',
    leadSupervisor: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    supervisorNip: '19820415 200801 1 007',
    supervisorRole: 'Pengawas Sekolah',
    headmasterName: 'Drs. Muhammad Arsyad, M.Pd.',
    headmasterNip: '19700512 199703 1 005',
    appreciativeInquiryStage: 'Dream',
    synthesisNotes:
      'Sekolah memiliki modal hubungan kekeluargaan yang hangat dan keterbukaan guru untuk belajar hal baru. Dengan memanfaatkan kerangka SOAR, energi sekolah difokuskan pada penguatan literasi digital ramah anak dan kemitraan paguyuban kelas untuk menopang kebutuhan murid berkesulitan belajar.',
    items: [
      {
        id: 'soar-item-2-s1',
        quadrant: 'strength',
        pillar: 'lingkungan',
        title: 'Hubungan Interpersonal Guru-Murid yang Hangat & Empatik',
        description: 'Guru sangat mengenali latar belakang keluarga setiap murid dan selalu siap memberikan bimbingan personal.',
        evidenceOrMetric: 'Survei kenyamanan murid menunjukkan 91% merasa didengar dan dihargai saat berdiskusi dengan guru.',
        priority: 'Sangat Tinggi',
        score: 90,
        assetType: 'Modal Sosial'
      },
      {
        id: 'soar-item-2-s2',
        quadrant: 'strength',
        pillar: 'pedagogi',
        title: 'Kemampuan Guru dalam Pembelajaran Berdiferensiasi Konten & Produk',
        description: 'Guru telah menerapkan variasi produk belajar (video, infografis, poster tangan, tulisan naratif) sesuai minat murid.',
        evidenceOrMetric: 'Tercatat 85% asesmen sumatif memberi murid pilihan minimal 3 bentuk produk akhir.',
        priority: 'Tinggi',
        score: 87,
        assetType: 'Modal Manusia'
      },
      {
        id: 'soar-item-2-o1',
        quadrant: 'opportunity',
        pillar: 'digital',
        title: 'Tersedianya Bantuan Pojok Baca Digital dari Perpustakaan Daerah',
        description: 'Peluang kolaborasi penyediaan e-library dan perangkat tablet edukatif untuk murid.',
        evidenceOrMetric: 'Proposal persetujuan pinjam pakai 30 unit tablet edukasi dari Perpusda Sidrap.',
        priority: 'Tinggi',
        score: 84,
        assetType: 'Modal Fisik'
      },
      {
        id: 'soar-item-2-a1',
        quadrant: 'aspiration',
        pillar: 'digital',
        title: 'Seluruh Murid Menguasai Coding Dasar & Etika Pembuatan Konten Edukasi',
        description: 'Murid mampu memprogram game edukasi sederhana atau animasi cerita rakyat Bugis-Sidrap.',
        evidenceOrMetric: 'Ekstrakurikuler literasi digital menghasilkan minimal 10 karya digital kreatif per angkatan.',
        priority: 'Tinggi',
        score: 86,
        assetType: 'Modal Budaya'
      },
      {
        id: 'soar-item-2-r1',
        quadrant: 'result',
        pillar: 'lingkungan',
        title: 'Penurunan Absensi Tanpa Keterangan Hingga 0.2%',
        description: 'Murid bersemangat hadir ke sekolah karena lingkungan belajar yang ramah dan menantang.',
        evidenceOrMetric: 'Rekapitulasi presensi digital menunjukkan kehadiran rata-rata mencapai 98.8%.',
        priority: 'Tinggi',
        score: 92,
        assetType: 'Modal Sosial'
      }
    ],
    strategies: [
      {
        id: 'strat-2-1',
        type: 'S-O',
        title: 'Optimalisasi Pojok Baca Digital untuk Pembelajaran Berdiferensiasi Mandiri',
        description: 'Mengintegrasikan tablet edukasi Perpusda dengan modul ajar berdiferensiasi agar murid dapat belajar mandiri dengan kecepatan masing-masing.',
        linkedPillars: ['pedagogi', 'digital'],
        actionSteps: [
          'Kurasi bahan bacaan digital interaktif sesuai fase capaian murid',
          'Penataan pojok baca kelas dengan jadwal rotasi terstruktur'
        ],
        targetOutcome: 'Minat baca murid meningkat dengan durasi membaca mandiri rata-rata 35 menit per hari.',
        timeline: 'Bulan ke-1 s.d. Bulan ke-4',
        pic: 'Kepala Perpustakaan & Guru Bahasa Indonesia',
        progress: 50,
        status: 'Sedang Berjalan'
      }
    ],
    createdAt: '2026-10-22T09:00:00.000Z',
    updatedAt: '2026-10-22T10:30:00.000Z'
  }
];
