/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PMLearningEnvRecord } from '../types/inspiro';

export const SEED_LEARNING_ENV_RECORDS: PMLearningEnvRecord[] = [
  {
    id: 'ple-001',
    schoolName: 'SMP Negeri 1 Merdeka Nusantara',
    teacherId: 'G001',
    teacherName: 'Ahmad Fauzi, S.Pd.',
    teacherNip: '19850714 201001 1 012',
    subject: 'Matematika',
    gradeClass: 'VII (Fase D)',
    topic: 'Aljabar Linier & Pemecahan Masalah Kehidupan Sehari-hari',
    date: '2026-10-15',
    assessorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    assessorRole: 'Pengawas Sekolah',
    assessorNip: '19830819 201001 1 002',
    headmasterName: 'Dra. Hj. Nurhasanah, M.Pd.',
    headmasterNip: '19720815 199802 2 003',

    dim1Psychological: {
      score: 4,
      level: 'Membudaya',
      checklist: {
        expressWithoutFear: true,
        mistakesAsLearning: true,
        noBullyingSarcasm: true,
        kseEmotionalRegulation: true,
        mutualSupport: true
      },
      notes:
        'Keamanan emosional sangat tinggi. Guru mengawali dengan rehat emosi "Roda Emosi 2 Menit", murid saling mendengarkan tanpa interupsi atau ejekan. Saat murid keliru menghitung variabel, guru mengapresiasi keberanian mencoba dan membimbing kelompok mencari pola perbaikan secara suportif.',
      evidenceNotes:
        'Terlihat 4 murid yang biasanya pendiam berani maju mempresentasikan jalan pikirannya di papan interaktif tanpa rasa cemas.'
    },

    dim2TimeEfficiency: {
      score: 4,
      level: 'Membudaya',
      tracker: {
        totalLessonDuration: 80,
        activeLearningMinutes: 62,
        teacherTalkMinutes: 12,
        transitionAdminMinutes: 4,
        deadTimeMinutes: 2,
        activeTimeRatioPct: 77.5,
        pacingSmoothness: 'Sangat Mulus & Dinamis'
      },
      notes:
        'Pemanfaatan waktu sangat efisien dan berorientasi murid. Ceramah guru dipadatkan menjadi pemantik 12 menit, lalu murid aktif bereksplorasi dan berdiskusi selama 62 menit (rasio 77.5%). Transisi ke moda kelompok dipandu visual countdown timer berdurasi 90 detik.',
      evidenceNotes:
        'Tidak ada jeda hampa. Murid yang menyelesaikan tantangan dasar langsung berpindah ke pojok tantangan pengayaan mandiri.'
    },

    dim3StudentAgency: {
      score: 3,
      level: 'Matang',
      indicators: {
        voiceAndChoice: true,
        selfGoalSetting: true,
        metacognitiveReflection: true
      },
      notes:
        'Murid memilih cara menyajikan solusi (infografis Canva, demonstrasi kartu aljabar, atau tabel komparasi). Di akhir sesi, murid mengisi lembar metakognisi singkat 3-2-1.',
      evidenceNotes:
        'Sebanyak 8 kelompok memilih ragam format penyajian yang variatif sesuai minat dan modalitas belajar masing-masing.'
    },

    dim4PhysicalSpatial: {
      score: 3,
      level: 'Matang',
      spatial: {
        flexibleSeating: true,
        accessibleResources: true,
        beyondClassroom: false
      },
      notes:
        'Meja dan kursi ditata dalam klaster kolaboratif 4-5 anak dengan akses leluasa. Alat peraga manipulatif ditaruh di rak terbuka sehingga murid leluasa mengambil tanpa menunggu izin.',
      evidenceNotes:
        'Sirkulasi udara dan ruang gerak observer serta guru sangat leluasa memfasilitasi scaffolding individu.'
    },

    totalScore: 87.5,
    maturityLevel: 'Level 3: Matang',
    timeEfficiencyCategory: 'Sangat Efisien (Optimal)',
    psychologicalClimateCategory: 'Sangat Aman & Kondusif',
    keyStrengths: [
      'Rasio Belajar Aktif Murid mencapai 77.5% (62 dari 80 menit pembelajaran).',
      'Atmosfer kelas bebas dari ketakutan; kesalahan matematika dijadikan jembatan konstruktif untuk eksplorasi konsep.',
      'Transisi waktu menggunakan visual countdown timer memangkas dead time hingga tersisa hanya 2 menit.'
    ],
    keyGrowthAreas: [
      'Memperluas pemanfaatan ruang belajar ke luar kelas (misal: menghitung luas dan data nyata di taman sekolah).',
      'Mendorong murid merumuskan sendiri rubrik keberhasilan proyek aljabar bersama guru.'
    ],
    supervisoryRecommendations: [
      'Pertahankan momentum manajemen waktu efisien dan jadikan Ahmad Fauzi sebagai pemodel (model teacher) teknik scaffolding waktu di Komunitas Belajar (Kombel).',
      'Uji coba pembelajaran outdoor terhubung konteks nyata lingkungan sekolah pada materi statistika dan perbandingan berikutnya.'
    ],
    status: 'final',
    createdAt: '2026-10-15T09:30:00Z',
    updatedAt: '2026-10-15T11:45:00Z'
  },
  {
    id: 'ple-002',
    schoolName: 'SMP Negeri 1 Merdeka Nusantara',
    teacherId: 'G002',
    teacherName: 'Siti Rahmawati, M.Pd.',
    teacherNip: '19881120 201101 2 015',
    subject: 'Bahasa Indonesia',
    gradeClass: 'VIII (Fase D)',
    topic: 'Teks Diskusi & Keterampilan Mengemukakan Argumen Kritis',
    date: '2026-10-17',
    assessorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    assessorRole: 'Pengawas Sekolah',
    assessorNip: '19830819 201001 1 002',
    headmasterName: 'Dra. Hj. Nurhasanah, M.Pd.',
    headmasterNip: '19720815 199802 2 003',

    dim1Psychological: {
      score: 4,
      level: 'Membudaya',
      checklist: {
        expressWithoutFear: true,
        mistakesAsLearning: true,
        noBullyingSarcasm: true,
        kseEmotionalRegulation: true,
        mutualSupport: true
      },
      notes:
        'Sangat inspiratif. Diterapkan aturan "Debat Positif: Serang Argumennya, Rangkul Orangnya". Murid saling menghormati pendapat kontra tanpa merendahkan pribadi lawan bicara. Suasana saling menguatkan tercipta hangat.',
      evidenceNotes:
        'Saat ada murid terbata-bata mencari kosa kata, teman satu kelompoknya membisikkan dukungan moral dan guru memberi waktu jeda berfikir tanpa terburu-buru memotong.'
    },

    dim2TimeEfficiency: {
      score: 3,
      level: 'Matang',
      tracker: {
        totalLessonDuration: 80,
        activeLearningMinutes: 54,
        teacherTalkMinutes: 16,
        transitionAdminMinutes: 6,
        deadTimeMinutes: 4,
        activeTimeRatioPct: 67.5,
        pacingSmoothness: 'Cukup Lancar'
      },
      notes:
        'Rasio belajar aktif 67.5%. Alokasi debat terbimbing berjalan tertib. Sedikit tersita pada pembagian kartu mosi dan pergeseran formasi kursi debat yang memakan waktu 6 menit.',
      evidenceNotes:
        'Guru berhasil menjaga batas waktu berbicara tiap pembicara dengan bel meja kecil sehingga seluruh 6 kelompok berkesempatan tampil proporsional.'
    },

    dim3StudentAgency: {
      score: 4,
      level: 'Membudaya',
      indicators: {
        voiceAndChoice: true,
        selfGoalSetting: true,
        metacognitiveReflection: true
      },
      notes:
        'Murid memilih topik isu aktual lokal (isu kebersihan lingkungan dan penggunaan smartphone di sekolah). Murid menyusun sendiri aturan main diskusi dan memimpin jalannya musyawarah.',
      evidenceNotes:
        'Notulen dan moderator sepenuhnya dipegang oleh murid secara bergiliran.'
    },

    dim4PhysicalSpatial: {
      score: 3,
      level: 'Matang',
      spatial: {
        flexibleSeating: true,
        accessibleResources: true,
        beyondClassroom: false
      },
      notes:
        'Formasi kursi diatur melingkar (fishbowl debate) dengan ruang tengah terbuka untuk juru bicara utama, memicu kontak mata dan atensi penuh.',
      evidenceNotes:
        'Papan tulis display dipakai untuk menempel sticky notes argumen pro-kontra.'
    },

    totalScore: 87.5,
    maturityLevel: 'Level 3: Matang',
    timeEfficiencyCategory: 'Cukup Efisien',
    psychologicalClimateCategory: 'Sangat Aman & Kondusif',
    keyStrengths: [
      'Keamanan emosional dalam ruang debat publik sangat terlatih; etika santun berargumen mengakar kuat.',
      'Suara dan agensi murid terwujud otentik dengan memilih isu kontemporer yang relevan dengan kehidupan mereka.',
      'Penerapan teknik Fishbowl Discussion yang memikat antusiasme seluruh rombel.'
    ],
    keyGrowthAreas: [
      'Optimalisasi waktu transisi penataan kursi fishbowl agar tidak memotong durasi refleksi penutup.',
      'Penggunaan timer digital proyektor agar peserta debat mandiri memantau sisa waktu bicaranya.'
    ],
    supervisoryRecommendations: [
      'Pertahankan budaya debat empatik dan tularkan teknik pengelolaan kelas partisipatif ini pada guru mata pelajaran rumpun sosial lainnya.',
      'Susun modul ajar teks diskusi ini sebagai best practice literasi kritis di Kabupaten Sidenreng Rappang.'
    ],
    status: 'final',
    createdAt: '2026-10-17T10:00:00Z',
    updatedAt: '2026-10-17T12:30:00Z'
  },
  {
    id: 'ple-003',
    schoolName: 'SMP Negeri 2 Merdeka Nusantara',
    teacherId: 'G003',
    teacherName: 'Budi Santoso, S.Pd.',
    teacherNip: '19920315 201903 1 008',
    subject: 'Ilmu Pengetahuan Alam (IPA)',
    gradeClass: 'VII (Fase D)',
    topic: 'Ekosistem dan Interaksi Makhluk Hidup',
    date: '2026-10-19',
    assessorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    assessorRole: 'Pengawas Sekolah',
    assessorNip: '19830819 201001 1 002',
    headmasterName: 'Drs. Bambang Irawan, M.Pd.',
    headmasterNip: '19690312 199512 1 001',

    dim1Psychological: {
      score: 2,
      level: 'Berkembang',
      checklist: {
        expressWithoutFear: false,
        mistakesAsLearning: true,
        noBullyingSarcasm: true,
        kseEmotionalRegulation: false,
        mutualSupport: true
      },
      notes:
        'Hubungan guru dan murid cukup ramah, namun sebagian murid di barisan belakang masih tampak sungkan dan ragu bertanya. Belum tampak apresiasi afirmasi emosional atau ice-breaking relaksasi saat materi mulai rumit.',
      evidenceNotes:
        'Hanya 3-4 murid yang sama yang dominan merespon pertanyaan pemantik guru.'
    },

    dim2TimeEfficiency: {
      score: 2,
      level: 'Berkembang',
      tracker: {
        totalLessonDuration: 80,
        activeLearningMinutes: 42,
        teacherTalkMinutes: 26,
        transitionAdminMinutes: 8,
        deadTimeMinutes: 4,
        activeTimeRatioPct: 52.5,
        pacingSmoothness: 'Tersendat'
      },
      notes:
        'Rasio belajar aktif baru mencapai 52.5%. Penjelasan guru di papan tulis menyita 26 menit (sepertiga lebih jam pelajaran). Waktu pembagian kit praktikum mikroskop memakan 8 menit karena antrian tidak terbagi klaster.',
      evidenceNotes:
        'Akibat molornya durasi penjelasan awal, waktu analisis data hasil pengamatan menjadi tergesa-gesa di 10 menit terakhir.'
    },

    dim3StudentAgency: {
      score: 2,
      level: 'Berkembang',
      indicators: {
        voiceAndChoice: false,
        selfGoalSetting: false,
        metacognitiveReflection: true
      },
      notes:
        'Langkah praktikum sangat preskriptif dan kaku (resep buku petunjuk praktikum). Murid belum diberi ruang merancang prosedur pengamatan alternatif sendiri.',
      evidenceNotes:
        'Format laporan praktikum seragam dan diisi secara mekanis.'
    },

    dim4PhysicalSpatial: {
      score: 3,
      level: 'Matang',
      spatial: {
        flexibleSeating: true,
        accessibleResources: false,
        beyondClassroom: true
      },
      notes:
        'Laboratorium IPA ditata dengan meja pulau kelompok yang memadai. Pengambilan spesimen dilakukan di kolam taman sekolah (luar kelas), yang sangat baik untuk kontekstualisasi materi.',
      evidenceNotes:
        'Pemanfaatan biotop taman sekolah berhasil memicu rasa ingin tahu murid.'
    },

    totalScore: 56.25,
    maturityLevel: 'Level 2: Berkembang',
    timeEfficiencyCategory: 'Kurang Efisien (Butuh Pemangkasan Ceramah)',
    psychologicalClimateCategory: 'Cukup Nyaman',
    keyStrengths: [
      'Pemanfaatan ruang luar kelas (taman sekolah) menghubungkan konsep ekosistem dengan objek pengamatan nyata.',
      'Sikap guru sabar dan telaten memandu kelompok yang kesulitan menggunakan mikroskop.'
    ],
    keyGrowthAreas: [
      'Pemangkasan durasi ceramah satu arah dari 26 menit menjadi maksimal 10-12 menit (Flipped Classroom / Lembar Orientasi).',
      'Pemberian ruang bagi murid pendiam untuk menyampaikan ide melalui papan tempel digital atau teknik Think-Pair-Share sebelum pleno.',
      'Distribusi bahan praktikum dengan menunjuk satu penanggung jawab alat tiap kelompok untuk memangkas antrian.'
    ],
    supervisoryRecommendations: [
      'Fasilitasi sesi Coaching TIRTA dengan fokus spesifik pada "Manajemen Ritme & Time-Chunking Pembelajaran Laboratorium".',
      'Integrasikan teknik KSE "Two-Minute Breathing Space" sebelum pengamatan agar konsentrasi murid terfokus prima.',
      'Agendakan supervisi klinis lanjutan siklus II untuk memantau peningkatan rasio waktu belajar aktif murid.'
    ],
    status: 'final',
    createdAt: '2026-10-19T08:15:00Z',
    updatedAt: '2026-10-19T10:30:00Z'
  }
];
