/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SupervisionCategory = 'Amat Baik (SB)' | 'Baik (B)' | 'Cukup (C)' | 'Kurang (K)';

export interface ManagedAccount {
  id: string;
  email: string;
  password?: string;
  name: string;
  nip: string;
  role: 'pengawas' | 'kepala_sekolah';
  schoolName: string;
  createdAt: string;
}

export interface Teacher {
  id: string;
  nama: string;
  nip: string;
  mapel: string;
  kelas: string;
  satuanPendidikan: string;
  telepon?: string;
  email?: string;
  createdAt: string;
}

export interface PreObservationData {
  tujuanPembelajaran: string;
  pemetaanKebutuhan: string;
  fokusPerilaku: string;
  modelMetode: string;
  mediaAlat: string;
  bentukAsesmen: string;
}

export interface IndicatorDefinition {
  id: number;
  section: 'pendahuluan' | 'inti' | 'penutup';
  sectionTitle: string;
  number: number;
  title: string;
  description: string;
  rubric: {
    1: string;
    2: string;
    3: string;
    4: string;
  };
}

export interface PostObservationData {
  kesanPerasaan: string;
  kesesuaianModul: string;
  kendalaSiswa: string;
  ketercapaianFokus: string;
  rencanaPeningkatan: string;
}

export interface FollowUpPlanItem {
  id: string;
  fokusAspek: string;
  rencanaKegiatan: string;
  waktuTarget: string;
  kriteriaKeberhasilan: string;
}

export interface SupervisionRecord {
  id: string;
  teacherId: string;
  status: 'draft' | 'selesai';
  createdAt: string;
  updatedAt: string;

  // Step 1: Identitas
  identity: {
    namaGuru: string;
    nipGuru: string;
    namaSupervisor: string;
    nipSupervisor: string;
    jabatanSupervisor: string;
    mapel: string;
    kelasSemester: string;
    satuanPendidikan: string;
    hariTanggal: string;
    fokusPerilaku: string;
    materiPokok: string;
    jamPelajaran: string;
    siklus: string;
  };

  // Step 2: Pra-Observasi (6 Pertanyaan)
  praObservasi: PreObservationData;

  // Step 3: Observasi (12 Indikator, 1-4)
  scores: Record<number, number>;
  notes: Record<number, string>;

  // Calculated Values
  totalScore: number;
  finalScore: number;
  category: SupervisionCategory;

  // Step 4: Refleksi / Pasca-Observasi (5 Pertanyaan)
  refleksi: PostObservationData;

  // Step 5: Rencana Tindak Lanjut (Tabel dinamis)
  rtl: FollowUpPlanItem[];
}

export interface AppSettings {
  schoolName: string;
  schoolNpsn: string;
  schoolCity: string;
  schoolAddress: string;
  supervisorName: string;
  supervisorNip: string;
  supervisorRole: string;
  pengawasPembinaName: string;
  pengawasPembinaNip: string;
}

export interface AnalysisBreakdown {
  pendahuluan: { total: number; max: number; percentage: number };
  inti: { total: number; max: number; percentage: number };
  penutup: { total: number; max: number; percentage: number };
}

export interface RuleBasedAnalysis {
  strengths: Array<{ id: number; title: string; score: number; comment: string }>;
  growthAreas: Array<{ id: number; title: string; score: number; comment: string }>;
  recommendations: Array<{ category: string; action: string; reference: string }>;
  breakdown: AnalysisBreakdown;
}

// 12 Indikator Kurikulum Merdeka Lengkap
export const OBSERVATION_INDICATORS: IndicatorDefinition[] = [
  // A. Kegiatan Pendahuluan (Indikator 1-3)
  {
    id: 1,
    section: 'pendahuluan',
    sectionTitle: 'A. Kegiatan Pendahuluan',
    number: 1,
    title: 'Pengondisian kelas dan motivasi peserta didik',
    description: 'Menyiapkan fisik dan psikis murid, memimpin doa, mengecek kehadiran, mengaitkan dengan kehidupan nyata dan menghadirkan antusiasme belajar.',
    rubric: {
      1: 'Belum mengondisikan kesiapan murid, memulai tanpa motivasi atau ice breaking bermakna.',
      2: 'Mengondisikan kelas secara formalitas, motivasi minim dan kurang memantik keterlibatan murid.',
      3: 'Mengondisikan suasana belajar dengan ramah, menghadirkan apersepsi dan motivasi yang relevan.',
      4: 'Sangat kondusif, menciptakan suasana aman & nyaman, menghadirkan apersepsi kontekstual yang membangkitkan rasa ingin tahu tinggi.'
    }
  },
  {
    id: 2,
    section: 'pendahuluan',
    sectionTitle: 'A. Kegiatan Pendahuluan',
    number: 2,
    title: 'Asesmen awal kognitif / non-kognitif',
    description: 'Mengidentifikasi kesiapan belajar, emosi, atau pemahaman prasyarat awal murid sebelum masuk ke materi pokok.',
    rubric: {
      1: 'Tidak melakukan asesmen awal atau pemeriksaan prasyarat belajar sama sekali.',
      2: 'Melakukan tanya jawab sepintas tanpa tindak lanjut penyesuaian strategi pembelajaran.',
      3: 'Melakukan asesmen awal terarah dan mencatat gambaran kesiapan belajar murid.',
      4: 'Melakukan asesmen awal yang komprehensif, memanfaatkan hasilnya untuk memetakan kesiapan murid secara adaptif.'
    }
  },
  {
    id: 3,
    section: 'pendahuluan',
    sectionTitle: 'A. Kegiatan Pendahuluan',
    number: 3,
    title: 'Penyampaian tujuan pembelajaran dan cakupan aktivitas',
    description: 'Mengomunikasikan Tujuan Pembelajaran (TP), kriteria ketercapaian (KKTP), dan gambaran alur aktivitas yang akan ditempuh murid.',
    rubric: {
      1: 'Tidak menyampaikan tujuan pembelajaran maupun alur aktivitas kepada murid.',
      2: 'Menyampaikan tujuan sekadar membaca judul materi tanpa kriteria capaian yang jelas.',
      3: 'Menyampaikan tujuan pembelajaran dan garis besar alur kegiatan dengan bahasa yang dipahami murid.',
      4: 'Menyampaikan tujuan pembelajaran, kriteria capaian, manfaat nyata materi, serta skenario belajar secara interaktif.'
    }
  },

  // B. Kegiatan Inti (Indikator 4-9)
  {
    id: 4,
    section: 'inti',
    sectionTitle: 'B. Kegiatan Inti',
    number: 4,
    title: 'Penguasaan materi esensial secara akurat dan kontekstual',
    description: 'Menyajikan konsep materi esensial secara tepat, bebas miskonsepsi, runtut, dan terhubung dengan dunia keseharian murid.',
    rubric: {
      1: 'Penguasaan konsep lemah, terdapat miskonsepsi atau penyampaian materi membingungkan murid.',
      2: 'Menguasai materi dasar namun bersifat teoritis tekstual tanpa contoh aplikatif kontekstual.',
      3: 'Menguasai materi dengan baik, menjelaskan konsep secara sistematis dan mengaitkan dengan contoh relevan.',
      4: 'Penguasaan materi sangat mendalam, mengaitkan konsep interdisipliner dan isu nyata secara inspiratif tanpa celah miskonsepsi.'
    }
  },
  {
    id: 5,
    section: 'inti',
    sectionTitle: 'B. Kegiatan Inti',
    number: 5,
    title: 'Pembelajaran berdiferensiasi berdasarkan profil siswa',
    description: 'Memfasilitasi keragaman murid melalui diferensiasi konten, proses (scaffolding/tugas bertingkat), atau produk hasil belajar.',
    rubric: {
      1: 'Pembelajaran bersifat seragam satu arah (one size fits all) tanpa memperhatikan kebutuhan beragam murid.',
      2: 'Mulai mencoba variasi tugas namun diferensiasi belum terarah sesuai pemetaan kebutuhan.',
      3: 'Menerapkan diferensiasi proses/konten dengan memberikan bimbingan khusus pada kelompok yang membutuhkan (scaffolding).',
      4: 'Diferensiasi terintegrasi luwes (konten, proses, produk), setiap kelompok belajar berkembang optimal sesuai ritme kesiapannya.'
    }
  },
  {
    id: 6,
    section: 'inti',
    sectionTitle: 'B. Kegiatan Inti',
    number: 6,
    title: 'HOTS, berpikir kritis, dan kolaborasi 4C',
    description: 'Memantik pertanyaan tingkat tinggi (C4-C6), menantang murid memecahkan masalah, berargumen, dan bekerja sama aktif.',
    rubric: {
      1: 'Pembelajaran didominasi hafalan (C1-C2), minim interaksi dan tanpa penugasan kolaboratif.',
      2: 'Ada pertanyaan atau diskusi namun masih berfokus pada ingatan/pemahaman dangkal.',
      3: 'Mengajukan pertanyaan pemantik kritis, mengarahkan kerja kelompok dan komunikasi aktif antarmurid.',
      4: 'Mendorong murid bernalar kritis mendalam, merumuskan hipotesis, kolaborasi dinamis, dan mempresentasikan solusi orisinal.'
    }
  },
  {
    id: 7,
    section: 'inti',
    sectionTitle: 'B. Kegiatan Inti',
    number: 7,
    title: 'Pemanfaatan media IT, alat peraga, atau lingkungan belajar',
    description: 'Mengintegrasikan teknologi informasi digital (TPACK), multimedia, alat peraga konkret, atau lingkungan belajar secara efektif.',
    rubric: {
      1: 'Tidak memanfaatkan media pembelajaran pendukung selain buku teks konvensional.',
      2: 'Menggunakan media/IT sekadar menampilkan teks presentasi statis tanpa interaksi aktif.',
      3: 'Menggunakan media digital/alat peraga secara tepat guna untuk memperjelas konsep visual.',
      4: 'Pemanfaatan media teknologi/lingkungan sangat kaya dan interaktif, meningkatkan keterlibatan langsung seluruh murid.'
    }
  },
  {
    id: 8,
    section: 'inti',
    sectionTitle: 'B. Kegiatan Inti',
    number: 8,
    title: 'Manajemen kelas dan disiplin positif',
    description: 'Menerapkan kesepakatan kelas yang telah disepakati bersama, restitusi, penguatan positif, tanpa intimidasi atau hukuman merendahkan.',
    rubric: {
      1: 'Kelas kurang terkendali, guru menggunakan teguran negatif bernada intimidatif atau mengabaikan disrupsi.',
      2: 'Mengendalikan kelas dengan pendekatan reaktif, kesepakatan kelas jarang diingatkan.',
      3: 'Mengelola dinamika kelas secara tenang, mengingatkan kesepakatan kelas dan memberi apresiasi atas perilaku positif.',
      4: 'Suasana kelas sangat demokratis dan saling menghargai, murid mandiri mematuhi kesepakatan, restitusi diterapkan secara empatik.'
    }
  },
  {
    id: 9,
    section: 'inti',
    sectionTitle: 'B. Kegiatan Inti',
    number: 9,
    title: 'Integrasi Kompetensi Sosial Emosional (KSE) dan Profil Pelajar Pancasila',
    description: 'Mengembangkan kesadaran diri, manajemen emosi, empati relasional, serta dimensi Profil Pelajar Pancasila (Gotong Royong, Bernalar Kritis, Mandiri).',
    rubric: {
      1: 'Tidak ada perhatian terhadap aspek sosial-emosional murid maupun pembiasaan karakter profil Pancasila.',
      2: 'Menyebutkan nilai karakter sepintas tanpa membimbing praktiknya dalam aktivitas belajar.',
      3: 'Mengintegrasikan latihan kesadaran penuh (mindfulness/STOP) atau pembiasaan karakter gotong royong dan bernalar kritis.',
      4: 'KSE dan nilai Pancasila melekat harmonis dalam setiap tahapan interaksi, murid menunjukkan empati dan kemandirian tinggi.'
    }
  },

  // C. Kegiatan Penutup (Indikator 10-12)
  {
    id: 10,
    section: 'penutup',
    sectionTitle: 'C. Kegiatan Penutup',
    number: 10,
    title: 'Refleksi dan kesimpulan bersama murid',
    description: 'Memberi ruang bagi murid untuk merefleksikan proses belajar, mengungkap perasaan/insight baru, dan merangkum kesimpulan bersama.',
    rubric: {
      1: 'Pembelajaran berakhir tiba-tiba tanpa refleksi atau kesimpulan apapun.',
      2: 'Guru menyimpulkan sendiri secara tergesa-gesa tanpa melibatkan refleksi murid.',
      3: 'Mengajak beberapa murid merangkum materi dan mengutarakan apa yang telah dipelajari.',
      4: 'Refleksi dua arah yang mendalam, murid mandiri menyimpulkan esensi pembelajaran dan mengungkapkan kebermaknaan belajar.'
    }
  },
  {
    id: 11,
    section: 'penutup',
    sectionTitle: 'C. Kegiatan Penutup',
    number: 11,
    title: 'Asesmen formatif akhir sesi',
    description: 'Mengukur ketercapaian tujuan pembelajaran sesi melalui asesmen autentik singkat (exit ticket, kuis pemahaman, rubrik unjuk kerja).',
    rubric: {
      1: 'Tidak ada instrumen evaluasi atau pengecekan ketercapaian pemahaman di akhir sesi.',
      2: 'Hanya bertanya "apakah sudah paham?" secara retoris tanpa bukti asesmen nyata.',
      3: 'Melaksanakan asesmen formatif ringkas (misal: soal singkat / exit ticket) dan mengumpulkan data capaian murid.',
      4: 'Asesmen formatif terukur, cepat, dan akurat, memberikan gambaran konkret pemahaman murid untuk tindak lanjut pertemuan berikutnya.'
    }
  },
  {
    id: 12,
    section: 'penutup',
    sectionTitle: 'C. Kegiatan Penutup',
    number: 12,
    title: 'Umpan balik, pengayaan/remedial, dan tindak lanjut',
    description: 'Memberikan umpan balik konstruktif, apresiasi capaian, menyampaikan rencana remedial/pengayaan, serta informasi materi sesi berikutnya.',
    rubric: {
      1: 'Tidak memberikan umpan balik, menutup pelajaran tanpa arahan tindak lanjut.',
      2: 'Memberikan komentar umum tanpa umpan balik spesifik perbaikan belajar murid.',
      3: 'Memberi apresiasi capaian, umpan balik konstruktif, serta informasi penugasan/sesi selanjutnya.',
      4: 'Umpan balik sangat spesifik dan memberdayakan murid, memberikan jalur pengayaan/remedial yang jelas dan memotivasi murid belajar lanjut.'
    }
  }
];

export const PRE_OBSERVATION_QUESTIONS = [
  {
    key: 'tujuanPembelajaran',
    number: 1,
    label: 'Tujuan Pembelajaran',
    question: 'Apa Tujuan Pembelajaran yang ingin dicapai pada pertemuan ini?',
    helperText: 'Tuliskan Capaian Pembelajaran / Alur Tujuan Pembelajaran (ATP) dan Kriteria Ketercapaian TP (KKTP) yang ditargetkan.',
    placeholder: 'Contoh: Melalui model Problem Based Learning, peserta didik mampu menganalisis operasi hitung bilangan bulat negatif dan menyelesaikan masalah kontekstual dengan tepat.'
  },
  {
    key: 'pemetaanKebutuhan',
    number: 2,
    label: 'Pemetaan Kebutuhan Belajar',
    question: 'Bagaimana pemetaan kebutuhan belajar peserta didik yang dilakukan?',
    helperText: 'Meliputi kesiapan belajar (readiness), minat, serta gaya/profil belajar (visual, auditori, kinestetik).',
    placeholder: 'Contoh: Berdasarkan asesmen diagnostik non-kognitif dan asesmen awal materi sebelumnya, 10 siswa berada pada kelompok perlu intervensi khusus, 16 cakap, dan 6 mahir.'
  },
  {
    key: 'fokusPerilaku',
    number: 3,
    label: 'Area Kompetensi / Fokus Perilaku Target',
    question: 'Apa area kompetensi atau fokus perilaku yang menjadi target pengembangan?',
    helperText: 'Fokus observasi yang disepakati bersama antara supervisor dan guru (merujuk pada indikator PMM / Perdirjen GTK).',
    placeholder: 'Contoh: Penerapan Disiplin Positif (Keteraturan Suasana Kelas) dan Instruksi yang Adaptif melalui scaffolding bertingkat.'
  },
  {
    key: 'modelMetode',
    number: 4,
    label: 'Model, Metode & Langkah Pembelajaran',
    question: 'Model, metode, dan langkah pembelajaran apa yang dirancang?',
    helperText: 'Sintaks model pembelajaran inovatif yang tercantum dalam Modul Ajar (misal: PBL, PjBL, Discovery, Inquiry).',
    placeholder: 'Contoh: Model Problem Based Learning (PBL) dengan metode diskusi kelompok terarah, penugasan diferensiasi LKPD, dan simulasi.'
  },
  {
    key: 'mediaAlat',
    number: 5,
    label: 'Media dan Alat Pembelajaran',
    question: 'Media dan alat pembelajaran apa yang digunakan?',
    helperText: 'Alat peraga konkret, proyektor, presentasi Canva/Slide interaktif, LKPD berjenjang, platform digital (Quizizz/PMM).',
    placeholder: 'Contoh: LKPD bertingkat 3 level, kartu bilangan manipulatif, media tayang proyektor interaktif, dan kuis digital interaktif.'
  },
  {
    key: 'bentukAsesmen',
    number: 6,
    label: 'Bentuk dan Instrumen Asesmen',
    question: 'Bagaimana bentuk dan instrumen asesmen yang disiapkan?',
    helperText: 'Asesmen awal, asesmen formatif saat proses (lembar observasi keterlibatan), dan asesmen formatif akhir sesi.',
    placeholder: 'Contoh: Lembar observasi partisipasi kelompok, rubrik unjuk kerja pemecahan masalah, dan exit ticket 3 soal singkat di akhir sesi.'
  }
];

export const POST_OBSERVATION_QUESTIONS = [
  {
    key: 'kesanPerasaan',
    number: 1,
    label: 'Kesan dan Perasaan Guru',
    question: 'Bagaimana kesan dan perasaan Anda setelah melaksanakan pembelajaran tadi?',
    helperText: 'Refleksi emosional, tingkat kepuasan guru terhadap atmosfer kelas dan respon murid.',
    placeholder: 'Contoh: Sangat bersyukur murid aktif dalam kerja kelompok, suasana kelas lebih kondusif dibandingkan minggu lalu, meski waktu penutup sedikit terasa mepet.'
  },
  {
    key: 'kesesuaianModul',
    number: 2,
    label: 'Kesesuaian dengan Modul Ajar',
    question: 'Apakah proses pembelajaran berjalan sesuai dengan rancangan Modul Ajar yang disusun?',
    helperText: 'Identifikasi bagian mana yang terlaksana penuh dan bagian mana yang memerlukan modifikasi spontan.',
    placeholder: 'Contoh: Secara umum 85% alur PBL terlaksana, modifikasi dilakukan pada tahap presentasi kelompok karena keterbatasan durasi sehingga dipilih 3 kelompok representatif.'
  },
  {
    key: 'kendalaSiswa',
    number: 3,
    label: 'Keberhasilan dan Kendala Siswa',
    question: 'Apa saja keberhasilan yang dicapai dan kendala yang dihadapi peserta didik?',
    helperText: 'Analisis keterlibatan murid dan hambatan spesifik yang dialami kelompok tertentu.',
    placeholder: 'Contoh: Murid kelompok cakap dan mahir sangat antusias memecahkan studi kasus. Kendala ada pada 3 murid kelompok dasar yang masih ragu berhitung tanpa manipulatif.'
  },
  {
    key: 'ketercapaianFokus',
    number: 4,
    label: 'Ketercapaian Fokus Perilaku',
    question: 'Bagaimana ketercapaian fokus perilaku target yang disepakati sebelum observasi?',
    helperText: 'Penilaian mandiri guru terhadap target disiplin positif atau fokus instruksi yang disepakati.',
    placeholder: 'Contoh: Penerapan kesepakatan kelas berhasil menekan distraksi. Murid saling mengingatkan ketika mulai gaduh.'
  },
  {
    key: 'rencanaPeningkatan',
    number: 5,
    label: 'Rencana Peningkatan Kompetensi',
    question: 'Apa rencana perbaikan atau peningkatan kompetensi yang ingin Anda lakukan selanjutnya?',
    helperText: 'Komitmen pengembangan diri, belajar mandiri di PMM, diskusi komunitas praktisi (KKG/MGMP), atau workshop.',
    placeholder: 'Contoh: Mempelajari modul pengelolaan waktu di PMM dan menyiapkan variasi exit ticket digital yang lebih efisien.'
  }
];

// ========================================================================
// PENGELOLAAN PM DI SEKOLAH (PRAKTIK PEDAGOGIS) RUBRIC & REPORTING
// ========================================================================

export type PMLevel = 'sangat_baik' | 'baik' | 'cukup' | 'kurang';

export interface PMDimensionRubric {
  id: string;
  number: number;
  title: string;
  maxPoints: number; // 25 pts
  description: string;
  criteria: {
    sangat_baik: { points: number; text: string };
    baik: { points: number; text: string };
    cukup: { points: number; text: string };
    kurang: { points: number; text: string };
  };
}

export interface PMDimensionScore {
  score: number; // 0 to 25
  level: PMLevel;
  notes: string;
  evidenceNotes: string;
}

export interface PMReport {
  id: string;
  schoolName: string;
  semester: string;
  academicYear: string;
  assessorName: string; // Pengawas or Kepala Sekolah
  assessorRole: string; // 'Pengawas Sekolah' | 'Kepala Sekolah'
  assessorNip: string;
  headmasterName: string;
  headmasterNip: string;
  evalDate: string;

  // 4 Dimensions (Total 100 pts, 25 pts each):
  dimension1: PMDimensionScore; // Kelengkapan Tahapan Supervisi (25 pts)
  dimension2: PMDimensionScore; // Kualitas Data dan Bukti Observasi (25 pts)
  dimension3: PMDimensionScore; // Kualitas Umpan Balik dan Refleksi (25 pts)
  dimension4: PMDimensionScore; // Tindak Lanjut Supervisi (25 pts)

  totalScore: number; // 0 - 100
  predicate: 'Amat Baik (A)' | 'Baik (B)' | 'Cukup (C)' | 'Kurang (K)';
  generalNotes: string; // Analisis & Kekuatan Praktik Pedagogis
  recommendation: string; // Rekomendasi Peningkatan Mutu
  interventionPlan: string; // Rencana Intervensi / Coaching / PLC
  status: 'draft' | 'final';
  createdAt: string;
  updatedAt: string;
}

export const PM_RUBRICS: PMDimensionRubric[] = [
  {
    id: 'dim1',
    number: 1,
    title: 'Kelengkapan Tahapan Supervisi',
    maxPoints: 25,
    description: 'Laporan mencakup seluruh tahapan (pra, observasi, pasca) secara lengkap, runtut, dan konsisten.',
    criteria: {
      sangat_baik: {
        points: 25,
        text: 'Laporan mencakup seluruh tahapan (pra-observasi, observasi kelas 12 indikator, dan pasca/refleksi) secara lengkap, runtut, dan konsisten.'
      },
      baik: {
        points: 18.75,
        text: 'Laporan mencakup 3 tahapan supervisi, namun alur dokumentasi ada yang belum runtut atau terdapat bagian refleksi yang kurang konsisten.'
      },
      cukup: {
        points: 12.5,
        text: 'Hanya mencakup 2 tahapan supervisi (misal hanya observasi kelas dan pasca, tanpa tahapan pra-observasi).'
      },
      kurang: {
        points: 6.25,
        text: 'Hanya mencakup 1 tahapan supervisi atau dokumentasi tidak lengkap dan terputus-putus.'
      }
    }
  },
  {
    id: 'dim2',
    number: 2,
    title: 'Kualitas Data dan Bukti Observasi',
    maxPoints: 25,
    description: 'Data sangat lengkap, objektif, berbasis indikator PM, dan menunjukkan praktik nyata di kelas.',
    criteria: {
      sangat_baik: {
        points: 25,
        text: 'Data sangat lengkap, objektif, berbasis indikator PM (Praktik Pedagogis), dan menunjukkan bukti konkret perilaku nyata murid & guru di kelas.'
      },
      baik: {
        points: 18.75,
        text: 'Data lengkap dan objektif berbasis indikator PM, namun bukti catatan deskriptif perilaku masih bersifat umum.'
      },
      cukup: {
        points: 12.5,
        text: 'Data berbasis indikator tetapi kurang objektif atau bukti observasi kelas belum menggambarkan situasi riil secara utuh.'
      },
      kurang: {
        points: 6.25,
        text: 'Data minim, subjektif, tidak berbasis rubrik indikator PM, dan tanpa bukti catatan perilaku kelas.'
      }
    }
  },
  {
    id: 'dim3',
    number: 3,
    title: 'Kualitas Umpan Balik dan Refleksi',
    maxPoints: 25,
    description: 'Umpan balik berbasis data, konstruktif, mendorong refleksi guru, dan berorientasi perbaikan.',
    criteria: {
      sangat_baik: {
        points: 25,
        text: 'Umpan balik berbasis data nyata observasi, konstruktif, dialogis, mendorong refleksi kritis mendalam guru, dan berorientasi perbaikan berkelanjutan.'
      },
      baik: {
        points: 18.75,
        text: 'Umpan balik berbasis data dan konstruktif, namun proses refleksi masih dominan dipandu supervisor (kurang kemandirian guru).'
      },
      cukup: {
        points: 12.5,
        text: 'Umpan balik bersifat satu arah (instruktif), refleksi guru dangkal dan belum menyentuh akar tantangan pembelajaran.'
      },
      kurang: {
        points: 6.25,
        text: 'Umpan balik tidak spesifik atau bersifat menghakimi, tidak ada ruang refleksi bermakna bagi guru.'
      }
    }
  },
  {
    id: 'dim4',
    number: 4,
    title: 'Tindak Lanjut Supervisi',
    maxPoints: 25,
    description: 'Tindak lanjut jelas, spesifik, berkelanjutan (coaching, PLC, perbaikan pembelajaran), dan terukur.',
    criteria: {
      sangat_baik: {
        points: 25,
        text: 'Tindak lanjut jelas, spesifik, berkelanjutan (program coaching rekan sejawat, Komunitas Belajar / PLC, perbaikan pembelajaran), dan terukur dengan target waktu.'
      },
      baik: {
        points: 18.75,
        text: 'Tindak lanjut spesifik dan terarah pada perbaikan pembelajaran, namun variasi kegiatan pendampingan lanjutan belum beragam.'
      },
      cukup: {
        points: 12.5,
        text: 'Rencana tindak lanjut ada namun masih bersifat administratif, belum terintegrasi dengan coaching atau Komunitas Belajar (PLC).'
      },
      kurang: {
        points: 6.25,
        text: 'Tidak ada rencana tindak lanjut yang terukur atau tidak ada komitmen pendampingan pasca supervisi.'
      }
    }
  }
];

