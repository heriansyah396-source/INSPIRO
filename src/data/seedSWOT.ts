/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SWOTAnalysisRecord } from '../types/inspiro';

export const SEED_SWOT_RECORDS: SWOTAnalysisRecord[] = [
  {
    id: 'swot-001',
    principalId: 'KS001',
    schoolName: 'SMP Negeri 1 Merdeka Nusantara',
    schoolNpsn: '40301234',
    headmasterName: 'Dra. Hj. Nurhasanah, M.Pd.',
    headmasterNip: '19720815 199802 2 003',
    headmasterRank: 'Pembina Tk. I (IV/b)',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    date: '2026-10-24',
    title: 'Analisis Strategis SWOT & Matriks TOWS Transformasi Mutu Manajerial Satuan Pendidikan',
    focusArea: 'Tata Kelola RKAS Berbasis Data (PBD), Peningkatan Iklim Keamanan Belajar, & Optimalisasi Komunitas Belajar (Kombel)',
    supervisorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    supervisorNip: '19830819 201001 1 002',
    supervisorRole: 'Pengawas Sekolah Pembina',
    supervisorRank: 'Penata Tk. I / III.d',
    supervisorNotes:
      'Kepala sekolah memiliki visi kepemimpinan instruksional yang sangat kokoh. Komunitas belajar internal telah membudaya dan integrasi perencanaan berbasis data (PBD) dengan RKAS berjalan transparan. Prioritas selanjutnya adalah memitigasi kesenjangan literasi digital antar-guru senior serta memperluas kemitraan strategis dengan dunia usaha di Kabupaten Sidenreng Rappang.',
    recommendation:
      '1. Implementasikan strategi S-O untuk mengakselerasi sekolah rujukan digital berbasis Chromebook & Akun Belajar.id.\n2. Laksanakan strategi W-O melalui bimbingan teknis sebaya (peer coaching) di Kombel sekolah guna meningkatkan pemanfaatan PMM.\n3. Perkuat strategi S-T dengan pembentukan Satuan Tugas Pencegahan & Penanganan Kekerasan (TPPK) aktif dan pelibatan orang tua.\n4. Terapkan strategi W-T melalui audit berkala aset sarana dan pemeliharaan preventif laboratorium TIK.',
    status: 'final',
    createdAt: '2026-10-24T08:30:00Z',
    updatedAt: '2026-10-24T14:15:00Z',
    items: [
      // 1. STRENGTHS (Kekuatan Internal)
      {
        id: 'swot-s1',
        quadrant: 'strength',
        dimension: 'Standar Pendidik & Tenaga Kependidikan',
        title: 'Kompetensi Guru Tinggi & 8 Pendidik Telah Berpredikat Guru Penggerak',
        description: 'Sebanyak 8 guru telah lulus Pendidikan Guru Penggerak dan aktif menggerakkan Komunitas Belajar (Kombel) setiap hari Rabu siang.',
        impactOrEvidence: 'Tingkat keaktifan diseminasi modul ajar berdiferensiasi mencapai 100% di semua mata pelajaran.',
        urgency: 'Sangat Tinggi',
        score: 95
      },
      {
        id: 'swot-s2',
        quadrant: 'strength',
        dimension: 'Standar Sarana & Prasarana',
        title: 'Infrastruktur TIK Lengkap & 2 Laboratorium Chromebook Mobile',
        description: 'Tersedia 60 unit Chromebook terhubung koneksi serat optik 100 Mbps serta perangkat multimedia interaktif di setiap ruang pertemuan.',
        impactOrEvidence: 'Aktivasi akun Belajar.id guru dan murid mencapai 100%, siap untuk asesmen digital terintegrasi.',
        urgency: 'Tinggi',
        score: 90
      },
      {
        id: 'swot-s3',
        quadrant: 'strength',
        dimension: 'Standar Pengelolaan & RKAS',
        title: 'Tata Kelola Manajemen Transparan & Sinkronisasi PBD Presisi',
        description: 'Penyusunan RKAS sekolah sepenuhnya mengacu pada lembar rekomendasi Rapor Pendidikan Kemendikbudristek secara akuntabel.',
        impactOrEvidence: 'Predikat pengelolaan anggaran BOSP Wajar Tanpa Pengecualian (WTP) dan skor Rapor Pendidikan dimensi mutu di atas rata-rata daerah.',
        urgency: 'Sangat Tinggi',
        score: 94
      },
      {
        id: 'swot-s4',
        quadrant: 'strength',
        dimension: 'Budaya & Iklim Sekolah',
        title: 'Budaya Sekolah Ramah Anak & Pembiasaan Karakter Disiplin Positif',
        description: 'Penerapan segitiga restitusi dan kesepakatan kelas tanpa kekerasan verbal maupun fisik telah melembaga di seluruh rombel.',
        impactOrEvidence: 'Survei Lingkungan Belajar (Sulingjar) mencatat indeks iklim keamanan sekolah sebesar 92.4% (Kategori Sangat Baik).',
        urgency: 'Tinggi',
        score: 88
      },

      // 2. WEAKNESSES (Kelemahan Internal)
      {
        id: 'swot-w1',
        quadrant: 'weakness',
        dimension: 'Standar Pendidik & Tenaga Kependidikan',
        title: 'Kesenjangan Kemampuan Literasi Digital pada Guru Senior',
        description: 'Sebagian kecil guru menjelang purnatugas masih mengalami kendala teknis dalam eksplorasi fitur canggih Platform Merdeka Mengajar (PMM).',
        impactOrEvidence: 'Terdapat 4 dari 32 guru yang memerlukan pendampingan intensif untuk menyelesaikan aksi nyata mandiri di PMM.',
        urgency: 'Sedang',
        score: 65
      },
      {
        id: 'swot-w2',
        quadrant: 'weakness',
        dimension: 'Standar Sarana & Prasarana',
        title: 'Kapasitas Ruang Perpustakaan & Laboratorium IPA Perlu Peremajaan',
        description: 'Koleksi buku cetak pengayaan dan alat peraga sains modern belum seimbang dengan lonjakan antusiasme murid.',
        impactOrEvidence: 'Rasio ketersediaan alat praktikum IPA masih 1 set per 6 siswa, idealnya 1 set per 4 siswa.',
        urgency: 'Tinggi',
        score: 70
      },
      {
        id: 'swot-w3',
        quadrant: 'weakness',
        dimension: 'Standar Pengelolaan',
        title: 'Sistem Dokumentasi Digital Arsip Tata Usaha Belum Sepenuhnya Terpusat',
        description: 'Pengarsipan surat dinas dan dokumen portofolio manajerial sebagian masih berbasis berkas fisik di map lemari arsip.',
        impactOrEvidence: 'Waktu pencarian dokumen historis supervisi sebelumnya membutuhkan waktu lebih dari 30 menit.',
        urgency: 'Sedang',
        score: 68
      },

      // 3. OPPORTUNITIES (Peluang Eksternal)
      {
        id: 'swot-o1',
        quadrant: 'opportunity',
        dimension: 'Kemitraan & Kebijakan Pemerintah',
        title: 'Dukungan Program Prioritas Kemendikbudristek & BOS Kinerja',
        description: 'Sekolah berpeluang besar memperoleh alokasi Dana BOS Kinerja atas prestasi rapor mutu dan sekolah rujukan Kurikulum Merdeka.',
        impactOrEvidence: 'Peluang pendanaan tambahan hingga puluhan juta rupiah untuk akselerasi program digitalisasi dan literasi.',
        urgency: 'Sangat Tinggi',
        score: 92
      },
      {
        id: 'swot-o2',
        quadrant: 'opportunity',
        dimension: 'Kemitraan & Budaya',
        title: 'Sinergi Kuat Komite Sekolah, Paguyuban Orang Tua, & Alumni',
        description: 'Komite sekolah dan Ikatan Alumni memiliki komitmen tinggi mendukung program ekstrakurikuler serta sarana penunjang ibadah.',
        impactOrEvidence: 'Komitmen sumbangan sukarela sarana musholla dan dukungan pendampingan vokasional praktisi dari orang tua.',
        urgency: 'Tinggi',
        score: 86
      },
      {
        id: 'swot-o3',
        quadrant: 'opportunity',
        dimension: 'Kemitraan Komunitas Lokal',
        title: 'Potensi Ekosistem Agribisnis & UMKM Kabupaten Sidenreng Rappang',
        description: 'Letak sekolah yang strategis memungkinkan kolaborasi place-based learning dengan BPP Pertanian, peternakan modern, dan sentra UMKM beras Sidrap.',
        impactOrEvidence: 'Dua tema P5 (Gaya Hidup Berkelanjutan & Kewirausahaan) dapat langsung dipraktekkan di sentra agribisnis lokal.',
        urgency: 'Tinggi',
        score: 89
      },

      // 4. THREATS (Ancaman & Tantangan Eksternal)
      {
        id: 'swot-t1',
        quadrant: 'threat',
        dimension: 'Sosial & Perkembangan Zaman',
        title: 'Distraksi Gadget, Game Online, & Bahaya Cyberbullying pada Siswa',
        description: 'Akses internet tanpa pengawasan di luar jam sekolah berisiko menurunkan fokus belajar dan memicu gesekan media sosial antar-remaja.',
        impactOrEvidence: 'Hasil wawancara pasca-observasi mencatat sekitar 15% murid mengaku begadang karena bermain game online di rumah.',
        urgency: 'Sangat Tinggi',
        score: 85
      },
      {
        id: 'swot-t2',
        quadrant: 'threat',
        dimension: 'Kebijakan & Regulasi',
        title: 'Perubahan Regulasi dan Fluktuasi Standar Petunjuk Teknis Anggaran Pusat',
        description: 'Pembaruan aplikasi SIM dan sistem pelaporan keuangan (ARKAS/SIPLah) yang kerap berubah sewaktu-waktu membutuhkan adaptasi cepat.',
        impactOrEvidence: 'Beban administrasi bendahara dan tim manajemen sekolah meningkat tajam pada akhir triwulan anggaran.',
        urgency: 'Sedang',
        score: 75
      },
      {
        id: 'swot-t3',
        quadrant: 'threat',
        dimension: 'Lingkungan Sekolah',
        title: 'Kondisi Cuaca Ekstrem dan Risiko Banjir Musiman Saluran Sekunder',
        description: 'Curah hujan tinggi pada musim penghujan berpotensi menggenangi halaman depan dan saluran drainase sekitar sekolah.',
        impactOrEvidence: 'Dua kali kegiatan upacara bendera dialihkan ke aula serbaguna akibat genangan air di lapangan utama.',
        urgency: 'Sedang',
        score: 72
      }
    ],
    strategies: [
      // S-O: Strategi Maxi - Maxi (Gunakan Kekuatan untuk Raih Peluang)
      {
        id: 'tows-so1',
        type: 'S-O',
        title: 'Akselerasi Sekolah Rujukan Digital & Laboratorium Belajar Kontekstual Berbasis P5',
        description:
          'Mengoptimalkan kompetensi 8 Guru Penggerak dan 60 unit Chromebook untuk memenangkan hibah BOS Kinerja serta mewujudkan pembelajaran berbasis tempat (*place-based*) bermitra dengan ekosistem agribisnis Sidrap.',
        actionPlan: [
          'Menyusun portofolio inovasi pembelajaran digital sekolah untuk diajukan ke dinas pendidikan sebagai sekolah percontohan.',
          'Mendesain modul proyek P5 bertema Kewirausahaan Agribisnis bekerjasama dengan BPP Pertanian Kabupaten Sidenreng Rappang.',
          'Menggelar pameran karya digital dan panen belajar murid dengan mengundang komite dan dinas pendidikan.'
        ],
        targetOutput: 'Terwujudnya 6 produk inovasi digital murid & diraihnya apresiasi Sekolah Rujukan Digital Berkinerja Baik.',
        timeline: 'Semester Ganjil 2026/2027',
        pic: 'Kepala Sekolah, Koordinator P5, & Tim Pengembang Kurikulum',
        priority: 'Prioritas Utama',
        status: 'Dalam Proses'
      },

      // W-O: Strategi Mini - Maxi (Atasi Kelemahan dengan Raih Peluang)
      {
        id: 'tows-wo1',
        type: 'W-O',
        title: 'Optimalisasi Komunitas Belajar Sekolah & Kemitraan Komite untuk Revitalisasi Sarpras',
        description:
          'Memanfaatkan dukungan program dinas pendidikan dan sumbangan komite/alumni untuk membina guru senior melalui peer-coaching serta memodernisasi alat praktikum lab IPA.',
        actionPlan: [
          'Menyelenggarakan program "Kombel Sahabat Digital" di mana guru muda membimbing guru senior menyelesaikan modul PMM 1-on-1.',
          'Mengalokasikan dana BOS Kinerja & sinergi komite untuk pengadaan 4 unit mikroskop digital dan peremajaan perpustakaan sekolah.',
          'Mengembangkan e-Library bekerjasama dengan Perpustakaan Daerah Kabupaten Sidenreng Rappang.'
        ],
        targetOutput: '100% guru tuntas aksi nyata PMM & kelengkapan sarpras laboratorium IPA mencapai rasio 1:4.',
        timeline: 'Triwulan III - IV 2026',
        pic: 'Kepala Sekolah, Pengurus Komite, & Kepala Perpustakaan',
        priority: 'Prioritas Utama',
        status: 'Dalam Proses'
      },

      // S-T: Strategi Maxi - Mini (Gunakan Kekuatan untuk Tangkal Ancaman)
      {
        id: 'tows-st1',
        type: 'S-T',
        title: 'Penguatan Satgas TPPK, Literasi Digital Etis, & Gerakan Sekolah Ramah Anak',
        description:
          'Mendayagunakan iklim sekolah ramah anak dan budaya disiplin positif untuk membentengi siswa dari kecanduan game online dan ancaman kekerasan siber.',
        actionPlan: [
          'Membentuk duta literasi digital siswa di setiap kelas untuk mengedukasi etika berinternet sehat dan anti-cyberbullying.',
          'Mengadakan webinar parenting bertema "Pendampingan Gadget Positif di Rumah" bersama psikolog dan Pengawas Sekolah.',
          'Mengintegrasikan jurnal refleksi harian siswa guna memantau pola tidur dan durasi layar di rumah.'
        ],
        targetOutput: 'Zero insiden cyberbullying & peningkatan durasi belajar mandiri siswa di rumah.',
        timeline: 'Bulan Berjalan (Berkala)',
        pic: 'Kepala Sekolah, Guru BK, & Koordinator TPPK',
        priority: 'Prioritas Utama',
        status: 'Terealisasi'
      },

      // W-T: Strategi Mini - Mini (Minimalisir Kelemahan & Hindari Ancaman)
      {
        id: 'tows-wt1',
        type: 'W-T',
        title: 'Modernisasi Tata Kelola Arsip Cloud & Normalisasi Drainase Sekolah Terpadu',
        description:
          'Memperbaiki tata kelola administrasi ke sistem cloud Google Drive terpusat untuk mengantisipasi audit dinas mendadak serta membenahi drainase sekolah mencegah banjir.',
        actionPlan: [
          'Membuat repositori cloud arsip dinas dengan folder terstruktur per standar mutu dan izin akses berjenjang.',
          'Mengajukan permohonan pendampingan ke Dinas Pekerjaan Umum / BPBD untuk normalisasi saluran sekunder depan sekolah.',
          'Menggelar bakti gotong royong Jumat Bersih pembersihan gorong-gorong bersama warga sekitar.'
        ],
        targetOutput: 'Arsip digital tertata 100% cloud-ready & halaman sekolah bebas genangan air saat curah hujan tinggi.',
        timeline: 'November 2026',
        pic: 'Kepala Tata Usaha & Urusan Sarana Prasarana',
        priority: 'Prioritas Menengah',
        status: 'Rencana'
      }
    ]
  },
  {
    id: 'swot-002',
    principalId: 'KS002',
    schoolName: 'SMP Negeri 2 Merdeka Nusantara',
    schoolNpsn: '40301235',
    headmasterName: 'Drs. Bambang Irawan, M.Pd.',
    headmasterNip: '19690312 199512 1 001',
    headmasterRank: 'Pembina Utama Muda (IV/c)',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    date: '2026-10-22',
    title: 'Analisis SWOT & TOWS Peningkatan Daya Saing Mutu Manajerial Satuan Pendidikan',
    focusArea: 'Optimalisasi Evaluasi Kinerja Guru PMM, Manajemen Aset Sarpras, & Peningkatan Literasi Numerasi',
    supervisorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    supervisorNip: '19830819 201001 1 002',
    supervisorRole: 'Pengawas Sekolah Pembina',
    supervisorRank: 'Penata Tk. I / III.d',
    supervisorNotes:
      'Kepala sekolah memiliki kepemimpinan administratif yang sangat matang dan tertib aturan. Pemanfaatan PMM oleh guru mencapai 92%. Perlu penguatan kolaborasi antar-guru dalam penyusunan asesmen berbasis AKM dan pemanfaatan perpustakaan digital.',
    recommendation:
      'Laksanakan perpaduan strategi SO dan WO untuk melipatgandakan indeks numerasi Rapor Pendidikan dan mengoptimalkan aset sekolah.',
    status: 'final',
    createdAt: '2026-10-22T09:00:00Z',
    updatedAt: '2026-10-22T15:00:00Z',
    items: [
      {
        id: 'swot2-s1',
        quadrant: 'strength',
        dimension: 'Standar Pendidik',
        title: 'Tingkat Kepatuhan Guru Tinggi dalam Pengelolaan Kinerja PMM',
        description: 'Sebanyak 95% guru telah menyusun SKP dan target perilaku kinerja di PMM tepat waktu.',
        impactOrEvidence: 'Penilaian kinerja semester sebelumnya tuntas 100% sebelum batas waktu dinas.',
        urgency: 'Tinggi',
        score: 88
      },
      {
        id: 'swot2-s2',
        quadrant: 'strength',
        dimension: 'Sarana Prasarana',
        title: 'Lahan Sekolah Luas & Lapangan Olahraga Memadai',
        description: 'Sekolah memiliki area terbuka hijau luas dan lapangan serbaguna untuk olahraga dan upacara.',
        impactOrEvidence: 'Dapat menampung 500 siswa sekaligus dalam kegiatan ekstrakurikuler bersama.',
        urgency: 'Sedang',
        score: 85
      },
      {
        id: 'swot2-w1',
        quadrant: 'weakness',
        dimension: 'Kurikulum & Pembelajaran',
        title: 'Capaian Skor Numerasi pada Rapor Pendidikan Masih Berada di Bawah Target',
        description: 'Guru mapel non-matematika belum terbiasa mengintegrasikan numerasi ke dalam pembelajaran berbasis masalah.',
        impactOrEvidence: 'Indeks numerasi rapor mutu sekolah berada pada nilai 54.2 (Kategori Sedang).',
        urgency: 'Sangat Tinggi',
        score: 60
      },
      {
        id: 'swot2-o1',
        quadrant: 'opportunity',
        dimension: 'Kemitraan',
        title: 'Program Pelatihan Pengawas Pembina Berbasis Pendampingan Reflektif',
        description: 'Kesempatan mengikuti klinik supervisi dan workshop numerasi dari tim pengawas dinas.',
        impactOrEvidence: 'Pendampingan langsung terjadwal setiap dua pekan sekali.',
        urgency: 'Tinggi',
        score: 90
      },
      {
        id: 'swot2-t1',
        quadrant: 'threat',
        dimension: 'Sosial & Eksternal',
        title: 'Ekspektasi Masyarakat Sekitar Terhadap Prestasi Akademik Sangat Tinggi',
        description: 'Masyarakat mengharapkan lulusan dapat terserap di sekolah lanjutan unggulan negeri.',
        impactOrEvidence: 'Kompetisi penerimaan murid baru (PPDB) yang semakin kompetitif dengan sekolah tetangga.',
        urgency: 'Tinggi',
        score: 80
      }
    ],
    strategies: [
      {
        id: 'tows2-so1',
        type: 'S-O',
        title: 'Pengembangan Kelas Pembelajaran Aktif Berbasis Proyek Numerasi Kontekstual',
        description: 'Memanfaatkan kedisiplinan guru dan pendampingan pengawas untuk merancang pembelajaran numerasi lintas mata pelajaran.',
        actionPlan: [
          'Menyelenggarakan in-house training integrasi numerasi dalam IPS, IPA, dan Bahasa.',
          'Mengadakan "Festival Numerasi Ceria" di lapangan sekolah memanfaatkan aset lahan luas.'
        ],
        targetOutput: 'Kenaikan indeks numerasi minimal 15 poin pada Rapor Pendidikan tahun mendatang.',
        timeline: 'Semester Ganjil 2026/2027',
        pic: 'Kepala Sekolah & Tim Numerasi',
        priority: 'Prioritas Utama',
        status: 'Rencana'
      }
    ]
  }
];
