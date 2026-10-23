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
  governmentAgency?: string;
  schoolName: string;
  schoolNpsn: string;
  schoolCity: string;
  schoolAddress: string;
  supervisorName: string;
  supervisorNip: string;
  supervisorRole: string;
  pengawasPembinaName: string;
  pengawasPembinaNip: string;
  pengawasPembinaRole?: string;
  documentDate?: string;
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

export interface SchoolQualityMetrics {
  schoolName: string;
  teacherCount: number;
  supervisedCount: number;
  averageScore: number;
  averagePercentage: number;
  category: SupervisionCategory;
  dimensions: {
    praObservasi: number;
    pendahuluan: number;
    inti: number;
    penutup: number;
    refleksiRtl: number;
  };
  indicatorScores: Record<number, number>; // 1-12 average scale 1-4
  supportTier: 'berbagi' | 'terfokus' | 'intensif';
  supportTierLabel: string;
  recommendedAction: string;
  priorityFocus: string;
  color: string;
}

export interface RegionalQualitySummary {
  totalSchools: number;
  totalTeachers: number;
  totalSupervisions: number;
  regionalAverageScore: number;
  topSchool: { name: string; score: number };
  needSupportSchool: { name: string; score: number };
  regionalBlindspotIndicator: { id: number; title: string; score: number };
  regionalStrengthsIndicator: { id: number; title: string; score: number };
}

export type CycleKey = 's1' | 's2' | 's3' | 'sl';

export interface TeacherCycleDetail {
  key: CycleKey;
  label: string;
  subLabel: string;
  supervision?: SupervisionRecord;
  score: number;
  category: SupervisionCategory;
  isReal: boolean;
  dateStr: string;
  scores: Record<number, number>;
  dimensions: {
    praObservasi: number;
    pendahuluan: number;
    inti: number;
    penutup: number;
    refleksiRtl: number;
  };
}

export type CycleCompareMode =
  | 's1_vs_s2'
  | 's2_vs_s3'
  | 's1_vs_s3'
  | 's3_vs_sl'
  | 's1_vs_sl'
  | 'all_multi';

export interface TeacherCycleComparison {
  teacherId: string;
  teacherName: string;
  nip: string;
  mapel: string;
  kelas: string;
  satuanPendidikan: string;
  compareMode: CycleCompareMode;
  baselineCycleName: string;
  targetCycleName: string;
  cycle1Supervision: SupervisionRecord;
  cycle2Supervision: SupervisionRecord;
  scoreCycle1: number;
  scoreCycle2: number;
  deltaScore: number;
  growthPercentage: number;
  categoryCycle1: SupervisionCategory;
  categoryCycle2: SupervisionCategory;
  trajectory: 'Akselerasi Tinggi' | 'Peningkatan Konsisten' | 'Stabil' | 'Perlu Perhatian';
  trajectoryLabel: string;
  // Multi-cycle individual details
  cycles: {
    s1: TeacherCycleDetail;
    s2: TeacherCycleDetail;
    s3: TeacherCycleDetail;
    sl: TeacherCycleDetail;
  };
  totalCumulativeDelta: number;
  indicatorDeltas: Record<number, { cycle1: number; cycle2: number; delta: number }>;
  dimensionDeltas: {
    praObservasi: { cycle1: number; cycle2: number; delta: number };
    pendahuluan: { cycle1: number; cycle2: number; delta: number };
    inti: { cycle1: number; cycle2: number; delta: number };
    penutup: { cycle1: number; cycle2: number; delta: number };
    refleksiRtl: { cycle1: number; cycle2: number; delta: number };
  };
  topGrownIndicator: { id: number; title: string; delta: number };
  leastGrownIndicator: { id: number; title: string; delta: number };
  interventionsApplied: string[];
  postCycleRecommendation: string;
}

export interface RegionalGrowthAnalysis {
  totalTrackedTeachers: number;
  averageGrowthDelta: number;
  averageGrowthPercentage: number;
  acceleratedCount: number;
  consistentCount: number;
  stagnantCount: number;
  topFastestGrowingIndicator: { id: number; title: string; avgDelta: number };
  leastGrowingIndicator: { id: number; title: string; avgDelta: number };
  schoolGrowthSummary: {
    schoolName: string;
    teacherCount: number;
    avgDelta: number;
    avgGrowthPct: number;
  }[];
}

// ==========================================
// KALENDER SUPERVISI & AGENDA KUNJUNGAN
// ==========================================

export type VisitType =
  | 'supervisi_akademik'
  | 'supervisi_manajerial'
  | 'pendampingan_pm'
  | 'kombel_pbd'
  | 'verifikasi_kosp'
  | 'refleksi_klinis'
  | 'monev_asesmen'
  | 'rapat_koordinasi';

export type VisitStatus = 'terjadwal' | 'berlangsung' | 'selesai' | 'ditunda';

export interface VisitAgenda {
  id: string;
  title: string;
  schoolName: string;
  date: string; // Format: YYYY-MM-DD
  startTime: string; // HH:mm e.g. "08:00"
  endTime: string; // HH:mm e.g. "12:00"
  visitType: VisitType;
  targetTeacherIds?: string[];
  targetTeacherNames?: string[];
  purposeAndTargets: string;
  notes?: string;
  status: VisitStatus;
  completionNotes?: string;
  signedAt?: string;
  supervisorName?: string;
  createdAt: string;
  updatedAt: string;
}

export const VISIT_TYPE_LABELS: Record<VisitType, { label: string; shortLabel: string; color: string; bg: string; border: string }> = {
  supervisi_akademik: {
    label: 'Supervisi Akademik (Observasi Kelas)',
    shortLabel: 'Supervisi Kelas',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  supervisi_manajerial: {
    label: 'Supervisi Manajerial & Tata Kelola',
    shortLabel: 'Manajerial',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200'
  },
  pendampingan_pm: {
    label: 'Pendampingan Pengelolaan PM (Praktik Pedagogis)',
    shortLabel: 'Praktik PM',
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-200'
  },
  kombel_pbd: {
    label: 'Pendampingan Kombel & PBD (Rapor Pendidikan)',
    shortLabel: 'Kombel & PBD',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200'
  },
  verifikasi_kosp: {
    label: 'Verifikasi & Validasi Dokumen KOSP / Modul',
    shortLabel: 'Verval KOSP',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200'
  },
  refleksi_klinis: {
    label: 'Refleksi Klinis Pasca-Observasi & RTL',
    shortLabel: 'Refleksi Klinis',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200'
  },
  monev_asesmen: {
    label: 'Monev Asesmen / ANBK / Ujian Sekolah',
    shortLabel: 'Monev ANBK',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200'
  },
  rapat_koordinasi: {
    label: 'Rapat Koordinasi / MKKS / Temu Pengawas',
    shortLabel: 'Rakor MKKS',
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-300'
  }
};

// ==========================================
// JURNAL COACHING DIALOGIS ALUR TIRTA
// ==========================================

export type CoachingContext =
  | 'pasca_observasi'
  | 'pra_observasi'
  | 'penguatan_diferensiasi'
  | 'penguatan_asesmen'
  | 'disiplin_positif'
  | 'pengembangan_diri';

export type CoachingCommitmentStatus = 'dalam_proses' | 'tercapai' | 'perlu_tinjauan';

export interface TirtaCoachingRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherNip: string;
  schoolName: string;
  subject: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  context: CoachingContext;
  supervisionId?: string;

  // ALUR TIRTA
  tujuan: {
    topikPercakapan: string;
    tujuanAkhir: string;
    ukuranKeberhasilan: string;
  };

  identifikasi: {
    potensiDanKekuatan: string;
    faktaDanTantangan: string;
    akarMasalah: string;
    peluangTersedia: string;
  };

  rencanaAksi: {
    strategiUtama: string;
    langkahKonkret: string[];
    waktuDanLiniMasa: string;
    dukunganDibutuhkan: string;
  };

  tanggungJawab: {
    komitmenGuru: string;
    pihakYangMembantu: string;
    jadwalTindakLanjut: string;
    statusKomitmen: CoachingCommitmentStatus;
    catatanTindakLanjut?: string;
  };

  supervisorName: string;
  supervisorNip: string;
  supervisorRole: string;
  coachFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

export const COACHING_CONTEXT_LABELS: Record<CoachingContext, { label: string; badge: string; color: string; bg: string }> = {
  pasca_observasi: {
    label: 'Refleksi Klinis Pasca-Observasi Kelas',
    badge: 'Pasca-Observasi',
    color: 'text-blue-700',
    bg: 'bg-blue-50'
  },
  pra_observasi: {
    label: 'Pematangan Modul Ajar & Pra-Observasi',
    badge: 'Pra-Observasi',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50'
  },
  penguatan_diferensiasi: {
    label: 'Inovasi Pembelajaran Berdiferensiasi',
    badge: 'Diferensiasi',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50'
  },
  penguatan_asesmen: {
    label: 'Pengembangan Asesmen Formatif & Portofolio',
    badge: 'Asesmen Formatif',
    color: 'text-teal-700',
    bg: 'bg-teal-50'
  },
  disiplin_positif: {
    label: 'Budaya Disiplin Positif & Integrasi KSE',
    badge: 'Disiplin & KSE',
    color: 'text-amber-700',
    bg: 'bg-amber-50'
  },
  pengembangan_diri: {
    label: 'Pengembangan Diri & Komunitas Belajar (Kombel)',
    badge: 'Kombel & PMM',
    color: 'text-purple-700',
    bg: 'bg-purple-50'
  }
};

// ==========================================
// PETA 4 KUADRAN GURU (MODEL GLICKMAN)
// ==========================================

export type TeacherQuadrantType = 'kuadran_1' | 'kuadran_2' | 'kuadran_3' | 'kuadran_4';

export interface QuadrantInfo {
  id: TeacherQuadrantType;
  title: string;
  nameIndo: string;
  tagline: string;
  abstractionLevel: 'Tinggi' | 'Rendah';
  commitmentLevel: 'Tinggi' | 'Rendah';
  supervisoryApproach: string;
  approachShort: string;
  characteristics: string;
  supervisorRole: string;
  keyInterventions: string[];
  themeColor: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
}

export interface TeacherQuadrantProfile {
  teacherId: string;
  teacherName: string;
  teacherNip: string;
  schoolName: string;
  mapel: string;
  abstractionScore: number; // 0 - 100 (Kompetensi Pedagogis)
  commitmentScore: number; // 0 - 100 (Tingkat Komitmen & Dedikasi)
  quadrant: TeacherQuadrantType;
  supervisoryApproach: string;
  characteristics: string;
  recommendedActions: string[];
  notes?: string;
  customOverrides?: {
    abstraction?: number;
    commitment?: number;
    notes?: string;
  };
  lastUpdated: string;
}

export const QUADRANT_DEFINITIONS: Record<TeacherQuadrantType, QuadrantInfo> = {
  kuadran_1: {
    id: 'kuadran_1',
    title: 'Kuadran I: Guru Profesional / Penggerak',
    nameIndo: 'Profesional Mandiri (Master Teacher)',
    tagline: 'Abstraksi Tinggi · Komitmen Tinggi',
    abstractionLevel: 'Tinggi',
    commitmentLevel: 'Tinggi',
    supervisoryApproach: 'Pendekatan Non-Direktif & Pendelegasian (Non-Directive & Delegating)',
    approachShort: 'Non-Direktif & Delegatif',
    characteristics:
      'Memiliki penguasaan pedagogi mendalam, inovatif dalam diferensiasi, mandiri mencari solusi pembelajaran, reflektif, dan berdedikasi tinggi terhadap kemajuan murid.',
    supervisorRole: 'Fasilitator, Rekan Dialog Kritis (Peer Colleague), dan Pemberi Otonomi Penuh.',
    keyInterventions: [
      'Beri ruang otonomi kreatif dan hindari instruksi yang terlalu mendikte.',
      'Dorong dan libatkan sebagai Guru Penggerak / Mentor bagi rekan sejawat di Kombel.',
      'Libatkan dalam tim pengembang kurikulum sekolah (KOSP) dan penyusun modul ajar rujukan.',
      'Fasilitasi desiminasi praktik baik tingkat gugus atau antar-sekolah binaan.'
    ],
    themeColor: 'emerald',
    bgColor: 'bg-emerald-50/80',
    borderColor: 'border-emerald-300',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800'
  },
  kuadran_2: {
    id: 'kuadran_2',
    title: 'Kuadran II: Guru Analitis / Kritikus',
    nameIndo: 'Analitis / Teoretis (The Analytical Thinker)',
    tagline: 'Abstraksi Tinggi · Komitmen Rendah',
    abstractionLevel: 'Tinggi',
    commitmentLevel: 'Rendah',
    supervisoryApproach: 'Pendekatan Kolaboratif - Negosiatif (Collaborative Approach)',
    approachShort: 'Kolaboratif & Negosiatif',
    characteristics:
      'Cerdas, wawasan teori sangat luas, kritis, banyak gagasan pembaruan, namun enggan mengeksekusi secara nyata di kelas (sering mengeluh hambatan fasilitas atau menunda tugas).',
    supervisorRole: 'Mitra Negosiasi, Penantang Solusi, dan Peneguh Kontrak Komitmen.',
    keyInterventions: [
      'Gunakan Coaching Alur TIRTA untuk menantang ide-idenya menjadi rencana aksi konkret.',
      'Sepakati target capaian jangka pendek yang terukur dengan batas waktu tegas.',
      'Ajak coachee memimpin proyek inovasi kecil agar rasa kepemilikan (ownership) tumbuh.',
      'Lakukan pemantauan berkala terhadap realisasi komitmen yang telah ditandatangani.'
    ],
    themeColor: 'indigo',
    bgColor: 'bg-indigo-50/80',
    borderColor: 'border-indigo-300',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800'
  },
  kuadran_3: {
    id: 'kuadran_3',
    title: 'Kuadran III: Guru Pekerja Keras / Antusias',
    nameIndo: 'Pekerja Keras Antusias (The Enthusiastic Worker)',
    tagline: 'Abstraksi Rendah · Komitmen Tinggi',
    abstractionLevel: 'Rendah',
    commitmentLevel: 'Tinggi',
    supervisoryApproach: 'Pendekatan Direktif Informatif & Modeling (Directive Informational)',
    approachShort: 'Direktif Informatif & Modeling',
    characteristics:
      'Sangat rajin, disiplin hadir paling pagi, tulus menyayangi murid, patuh instruksi dinas, tetapi bingung merancang strategi diferensiasi yang tepat atau kesulitan memecahkan dinamika kelas rumit.',
    supervisorRole: 'Pembimbing Teknis, Penyedia Contoh Konkret (Modeler), dan Pemandu Langkah.',
    keyInterventions: [
      'Berikan alternatif solusi konkret (bukan membiarkan mencari sendiri tanpa panduan).',
      'Lakukan modeling (contoh langsung praktik mengajar di kelas) atau tontonkan video inspiratif.',
      'Sandingkan dalam program pendampingan sejawat (peer tutoring) bersama guru Kuadran I.',
      'Apresiasi dedikasinya secara terbuka agar kepercayaan dirinya terus terpelihara.'
    ],
    themeColor: 'blue',
    bgColor: 'bg-blue-50/80',
    borderColor: 'border-blue-300',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800'
  },
  kuadran_4: {
    id: 'kuadran_4',
    title: 'Kuadran IV: Guru Perlu Bimbingan Khusus',
    nameIndo: 'Butuh Bimbingan Intensif (The Unfocused / Struggling)',
    tagline: 'Abstraksi Rendah · Komitmen Rendah',
    abstractionLevel: 'Rendah',
    commitmentLevel: 'Rendah',
    supervisoryApproach: 'Pendekatan Direktif Kontrol & Konseling (Directive Control Approach)',
    approachShort: 'Direktif Kontrol & Konseling',
    characteristics:
      'Kompetensi mengajar masih terbatas dan motivasi kerja menurun. Pembelajaran cenderung monoton ceramah searah, administrasi terlambat, serta pasif dalam kegiatan pengembangan diri.',
    supervisorRole: 'Instruktur Tegas, Pengawas Prosedural, dan Konselor Pemulih Motivasi.',
    keyInterventions: [
      'Gunakan komunikasi tegas namun empatik: tetapkan standar minimal kinerja yang wajib dipenuhi.',
      'Berikan penugasan spesifik berstruktur langkah 1-2-3 dengan batas waktu ketat.',
      'Lakukan konseling personal bersama Kepala Sekolah untuk menggali kendala psikologis/pribadi.',
      'Jadwalkan supervisi klinis siklus berulang dan pantau setiap kemajuan kecil secara disiplin.'
    ],
    themeColor: 'amber',
    bgColor: 'bg-amber-50/80',
    borderColor: 'border-amber-300',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800'
  }
};

// ========================================================================
// PROGRAM PENGELOLAAN PEMBELAJARAN MENDALAM (PM) - ELEMEN LINGKUNGAN BELAJAR
// Fokus: Iklim Psikologis (Keamanan Emosional) & Efisiensi Waktu Belajar
// ========================================================================

export type PMLearningEnvMaturity =
  | 'Level 1: Terbatas'
  | 'Level 2: Berkembang'
  | 'Level 3: Matang'
  | 'Level 4: Membudaya';

export interface PsychologicalSafetyChecklist {
  expressWithoutFear: boolean; // Murid bebas bertanya/berpendapat tanpa cemas ditertawakan
  mistakesAsLearning: boolean; // Kesalahan dipandang sebagai proses belajar (growth mindset)
  noBullyingSarcasm: boolean; // Suasana bebas sindiran kaku / intimidasi antar murid maupun guru
  kseEmotionalRegulation: boolean; // Integrasi KSE (jeda emosi, teknik STOP, apresiasi perasaan)
  mutualSupport: boolean; // Budaya empati dan saling bantu dalam interaksi kelas
}

export interface TimeEfficiencyTracker {
  totalLessonDuration: number; // Total alokasi jam tatap muka (misal: 80 menit untuk 2 JP)
  activeLearningMinutes: number; // Murid aktif (diskusi, pemecahan masalah, kreasi karya)
  teacherTalkMinutes: number; // Guru ceramah satu arah / monolog instruksi
  transitionAdminMinutes: number; // Transisi antar sesi / pembagian kelompok / presensi
  deadTimeMinutes: number; // Jeda hampa / distraksi / menunggu tanpa instruksi
  activeTimeRatioPct: number; // (activeLearningMinutes / totalLessonDuration) * 100
  pacingSmoothness: 'Tersendat' | 'Cukup Lancar' | 'Sangat Mulus & Dinamis';
}

export interface AgencyIndicators {
  voiceAndChoice: boolean; // Murid memiliki pilihan dalam memilih bentuk tugas/sumber belajar
  selfGoalSetting: boolean; // Murid dilibatkan menyusun tujuan dan kriteria keberhasilan belajar
  metacognitiveReflection: boolean; // Refleksi reguler terhadap apa yang dipelajari dan strategi perbaikan
}

export interface SpatialFlexibility {
  flexibleSeating: boolean; // Susunan bangku dapat diubah dinamis untuk kolaborasi kelompok
  accessibleResources: boolean; // Sumber dan alat belajar mudah diakses murid secara mandiri
  beyondClassroom: boolean; // Pemanfaatan ruang luar kelas, lingkungan nyata, atau fasilitas sekolah
}

export interface PMLearningEnvRecord {
  id: string;
  schoolName: string;
  teacherId: string;
  teacherName: string;
  teacherNip: string;
  subject: string;
  gradeClass: string;
  topic: string;
  date: string; // YYYY-MM-DD
  assessorName: string;
  assessorRole: string; // 'Pengawas Sekolah' | 'Kepala Sekolah'
  assessorNip: string;
  headmasterName: string;
  headmasterNip: string;

  // Dimensi 1: Iklim Psikologis & Keamanan Emosional (25 Poin)
  dim1Psychological: {
    score: number; // 1 - 4
    level: 'Terbatas' | 'Berkembang' | 'Matang' | 'Membudaya';
    checklist: PsychologicalSafetyChecklist;
    notes: string;
    evidenceNotes: string;
  };

  // Dimensi 2: Efisiensi Alokasi Waktu Belajar & Ritme Kelas (25 Poin)
  dim2TimeEfficiency: {
    score: number; // 1 - 4
    level: 'Terbatas' | 'Berkembang' | 'Matang' | 'Membudaya';
    tracker: TimeEfficiencyTracker;
    notes: string;
    evidenceNotes: string;
  };

  // Dimensi 3: Kultur Agensi, Suara & Kepemilikan Murid (25 Poin)
  dim3StudentAgency: {
    score: number; // 1 - 4
    level: 'Terbatas' | 'Berkembang' | 'Matang' | 'Membudaya';
    indicators: AgencyIndicators;
    notes: string;
    evidenceNotes: string;
  };

  // Dimensi 4: Fleksibilitas Tata Ruang & Pemanfaatan Lingkungan (25 Poin)
  dim4PhysicalSpatial: {
    score: number; // 1 - 4
    level: 'Terbatas' | 'Berkembang' | 'Matang' | 'Membudaya';
    spatial: SpatialFlexibility;
    notes: string;
    evidenceNotes: string;
  };

  // Kalkulasi Skor Agregat & Diagnostik
  totalScore: number; // 0 - 100
  maturityLevel: PMLearningEnvMaturity;
  timeEfficiencyCategory: 'Sangat Efisien (Optimal)' | 'Cukup Efisien' | 'Kurang Efisien (Butuh Pemangkasan Ceramah)';
  psychologicalClimateCategory: 'Sangat Aman & Kondusif' | 'Cukup Nyaman' | 'Perlu Penguatan Rasa Aman';
  keyStrengths: string[];
  keyGrowthAreas: string[];
  supervisoryRecommendations: string[];
  status: 'draft' | 'final';
  createdAt: string;
  updatedAt: string;
}

export interface PMLearningEnvRubric {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  description: string;
  levels: {
    1: { label: 'Terbatas'; points: 6.25; criteria: string };
    2: { label: 'Berkembang'; points: 12.5; criteria: string };
    3: { label: 'Matang'; points: 18.75; criteria: string };
    4: { label: 'Membudaya'; points: 25.0; criteria: string };
  };
}

export const PM_LEARNING_ENV_RUBRICS: PMLearningEnvRubric[] = [
  {
    id: 'env_dim1',
    number: 1,
    title: 'Iklim Psikologis Kelas & Keamanan Emosional Murid',
    shortTitle: 'Keamanan Emosional & Iklim Psikologis',
    description:
      'Tingkat rasa aman murid dalam berekspresi, berani mengambil risiko belajar, bebas dari rasa takut dihakimi, ketiadaan sarkasme, serta pembiasaan regulasi emosi positif (KSE).',
    levels: {
      1: {
        label: 'Terbatas',
        points: 6.25,
        criteria:
          'Kelas kaku dan didominasi rasa cemas. Murid enggan bertanya karena takut salah atau dicemooh. Belum ada pembiasaan empati atau kesepakatan kelas yang mengayomi.'
      },
      2: {
        label: 'Berkembang',
        points: 12.5,
        criteria:
          'Kelas cukup tertib, namun murid masih ragu berpendapat spontan. Guru menegur dengan baik, namun integrasi afirmasi emosional atau rehat KSE belum konsisten diterapkan.'
      },
      3: {
        label: 'Matang',
        points: 18.75,
        criteria:
          'Atmosfer hangat dan terbuka. Murid merasa nyaman berdiskusi, perbedaan pendapat dihargai, dan guru memvalidasi usaha murid secara suportif saat menghadapi kebuntuan.'
      },
      4: {
        label: 'Membudaya',
        points: 25.0,
        criteria:
          'Keamanan psikologis sangat kokoh. Budaya saling mengapresiasi dan growth mindset hidup alami. Kesalahan dianggap batu loncatan belajar, murid saling mendukung dengan empati tinggi.'
      }
    }
  },
  {
    id: 'env_dim2',
    number: 2,
    title: 'Efisiensi Alokasi Waktu Belajar & Manajemen Ritme Kelas',
    shortTitle: 'Efisiensi Waktu & Ritme Belajar',
    description:
      'Optimalisasi waktu belajar aktif murid (active learning time ratio >= 70%), kelancaran transisi antar sesi, manajemen instruksi efektif, dan ketiadaan jeda hampa (dead time).',
    levels: {
      1: {
        label: 'Terbatas',
        points: 6.25,
        criteria:
          'Alokasi waktu didominasi ceramah guru (> 65% durasi tatap muka). Transisi lambat, instruksi bertele-tele, dan banyak jeda kosong murid menunggu giliran tanpa aktivitas bermakna.'
      },
      2: {
        label: 'Berkembang',
        points: 12.5,
        criteria:
          'Waktu belajar aktif murid berkisar 50-60%. Alur mulai terstruktur, namun durasi transisi kelompok atau penyiapan media masih menyita waktu pembelajaran esensial.'
      },
      3: {
        label: 'Matang',
        points: 18.75,
        criteria:
          'Pemanfaatan waktu efektif, murid aktif berkegiatan 65-75% waktu. Transisi berlangsung mulus dengan aba-aba jelas, guru memantau alokasi waktu tiap tahapan dengan disiplin.'
      },
      4: {
        label: 'Membudaya',
        points: 25.0,
        criteria:
          'Ritme sangat dinamis dan terkelola presisi. Rasio belajar aktif murid > 75%, transisi otomatis tanpa jeda hampa, manajemen waktu fleksibel sesuai ritme pemahaman murid.'
      }
    }
  },
  {
    id: 'env_dim3',
    number: 3,
    title: 'Kultur Agensi, Suara (Voice) & Kepemilikan (Ownership) Murid',
    shortTitle: 'Kultur Agensi & Suara Murid',
    description:
      'Pemberian ruang bagi murid untuk menyuarakan gagasan, memilih strategi/produk belajar (voice & choice), menetapkan target, serta melakukan metakognisi mandiri.',
    levels: {
      1: {
        label: 'Terbatas',
        points: 6.25,
        criteria:
          'Pembelajaran seragam dan satu arah. Murid hanya menjalankan instruksi kaku tanpa opsi memilih tugas, cara belajar, maupun kesempatan mengevaluasi pemahamannya sendiri.'
      },
      2: {
        label: 'Berkembang',
        points: 12.5,
        criteria:
          'Guru mulai memberi pilihan kecil (misal: memilih anggota kelompok atau urutan soal), tetapi kepemilikan tujuan belajar masih sepenuhnya diarahkan guru.'
      },
      3: {
        label: 'Matang',
        points: 18.75,
        criteria:
          'Murid aktif diajak menentukan cara menunjukkan pemahaman (diferensiasi produk), terlibat menyepakati kriteria tugas, dan melakukan refleksi diri di akhir sesi.'
      },
      4: {
        label: 'Membudaya',
        points: 25.0,
        criteria:
          'Agensi murid terwujud penuh. Murid merancang lintasan belajarnya, menyuarakan ide orisinal secara mandiri, memantau kemajuannya, dan melakukan evaluasi diri metakognitif yang matang.'
      }
    }
  },
  {
    id: 'env_dim4',
    number: 4,
    title: 'Fleksibilitas Tata Ruang & Pemanfaatan Sumber Daya Lingkungan',
    shortTitle: 'Fleksibilitas Ruang & Sumber Daya',
    description:
      'Penataan fisik kelas yang mudah dimodifikasi untuk beragam moda interaksi kolaboratif, akses mandiri sumber belajar, dan perluasan ruang belajar melampaui dinding kelas.',
    levels: {
      1: {
        label: 'Terbatas',
        points: 6.25,
        criteria:
          'Susunan bangku kaku berbaris searah papan tulis. Ruang gerak sempit, minim variasi penataan untuk diskusi kelompok, dan sumber belajar hanya buku teks tunggal.'
      },
      2: {
        label: 'Berkembang',
        points: 12.5,
        criteria:
          'Bangku ditata berkelompok, namun perpindahan antar moda belajar masih memicu kegaduhan. Akses alat dan sumber belajar mulai terbuka meski belum terkelola mandiri.'
      },
      3: {
        label: 'Matang',
        points: 18.75,
        criteria:
          'Tata ruang fleksibel dan ergonomis, memfasilitasi rotasi kelompok dan bimbingan mandiri dengan lancar. Tersedia pojok belajar kaya sumber bacaan dan alat peraga.'
      },
      4: {
        label: 'Membudaya',
        points: 25.0,
        criteria:
          'Lingkungan belajar melampaui sekat kelas konvensional. Penataan ruang sangat adaptif, terintegrasi dengan lingkungan sekolah/luar kelas dan sumber belajar digital nyata.'
      }
    }
  }
];

// ========================================================================
// PROGRAM PENGELOLAAN PEMBELAJARAN MENDALAM (PM) - ELEMEN PEMANFAATAN DIGITAL
// Fokus: Leveraging Digital for Deep Learning & Evaluasi SAMR
// ========================================================================

export type SAMRLevel = 'Substitution' | 'Augmentation' | 'Modification' | 'Redefinition';

export type PMDigitalMaturity =
  | 'Level 1: Terbatas (Substitution)'
  | 'Level 2: Berkembang (Augmentation)'
  | 'Level 3: Matang (Modification)'
  | 'Level 4: Membudaya (Redefinition)';

export interface DigitalChecklist {
  createsDigitalArtifacts: boolean; // Murid berkarya (infografis Canva/video/simulasi PhET/podcast/coding), bukan pasif
  realtimeCollaboration: boolean; // Kolaborasi cloud bersama (Google Docs/Slides terbagi, Padlet, Jamboard)
  adaptiveAssessmentFeedback: boolean; // Asesmen formatif adaptif (Quizizz/Kahoot/Forms) dengan analisis data instan
  digitalEthicsAndAi: boolean; // Literasi etika digital, hak cipta, dan pemanfaatan AI yang bijak & bertanggung jawab
  authenticAudience: boolean; // Karya dipublikasikan ke audiens nyata (komunitas sekolah/orang tua/jejaring belajar)
}

export interface DigitalToolUsage {
  toolsUsed: string[]; // Canva, PhET, Quizizz, Google Workspace, PMM, GeoGebra, Scratch, Wordwall, dll.
  deviceType: 'Chromebook / Laptop' | 'Smartphone / Tablet' | 'Laboratorium Komputer' | 'Hybrid / Multi-device';
  studentHandsOnDuration: number; // Menit murid aktif mengoperasikan perangkat secara mandiri
  totalLessonDuration: number; // Total alokasi jam tatap muka (misal: 80 menit)
  studentHandsOnRatioPct: number; // (studentHandsOnDuration / totalLessonDuration) * 100
  samrLevel: SAMRLevel;
}

export interface PMDigitalRecord {
  id: string;
  schoolName: string;
  teacherId: string;
  teacherName: string;
  teacherNip: string;
  subject: string;
  gradeClass: string;
  topic: string;
  date: string; // YYYY-MM-DD
  assessorName: string;
  assessorRole: string; // 'Pengawas Sekolah' | 'Kepala Sekolah'
  assessorNip: string;
  headmasterName: string;
  headmasterNip: string;

  // Dimensi 1: Peran Murid sebagai Kreator Konten Digital Otentik (25 Poin)
  dim1CreatorRole: {
    score: number; // 1 - 4
    level: 'Terbatas' | 'Berkembang' | 'Matang' | 'Membudaya';
    artifactsCreated: string; // Bentuk karya digital murid
    notes: string;
    evidenceNotes: string;
  };

  // Dimensi 2: Kolaborasi & Komunikasi Digital Lintas Ruang (25 Poin)
  dim2Collaboration: {
    score: number; // 1 - 4
    level: 'Terbatas' | 'Berkembang' | 'Matang' | 'Membudaya';
    platforms: string; // Platform kolaborasi yang dipakai
    notes: string;
    evidenceNotes: string;
  };

  // Dimensi 3: Asesmen Formatif Adaptif & Umpan Balik Instan (25 Poin)
  dim3Assessment: {
    score: number; // 1 - 4
    level: 'Terbatas' | 'Berkembang' | 'Matang' | 'Membudaya';
    assessmentTool: string; // Tools asesmen & analitik
    notes: string;
    evidenceNotes: string;
  };

  // Dimensi 4: Kewarganegaraan Digital, Etika & Pemanfaatan AI (25 Poin)
  dim4EthicsAndAi: {
    score: number; // 1 - 4
    level: 'Terbatas' | 'Berkembang' | 'Matang' | 'Membudaya';
    aiUsageNotes: string; // Bagaimana AI atau literasi etika diintegrasikan
    notes: string;
    evidenceNotes: string;
  };

  checklist: DigitalChecklist;
  toolUsage: DigitalToolUsage;

  // Hasil Kalkulasi & Diagnostik
  totalScore: number; // 0 - 100
  maturityLevel: PMDigitalMaturity;
  samrSummary: string;
  keyStrengths: string[];
  keyGrowthAreas: string[];
  supervisoryRecommendations: string[];
  status: 'draft' | 'final';
  createdAt: string;
  updatedAt: string;
}

export interface PMDigitalRubric {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  description: string;
  levels: {
    1: { label: 'Terbatas'; points: 6.25; criteria: string };
    2: { label: 'Berkembang'; points: 12.5; criteria: string };
    3: { label: 'Matang'; points: 18.75; criteria: string };
    4: { label: 'Membudaya'; points: 25.0; criteria: string };
  };
}

export const PM_DIGITAL_RUBRICS: PMDigitalRubric[] = [
  {
    id: 'dig_dim1',
    number: 1,
    title: 'Peran Murid: Dari Konsumen Pasif Menjadi Kreator Konten Digital',
    shortTitle: 'Kreator Konten Digital Otentik',
    description:
      'Tingkat keterlibatan murid dalam memproduksi karya digital bermakna (infografis, simulasi ilmiah, video edukasi, rekaman podcast, coding) bukan sekadar menonton tayangan guru.',
    levels: {
      1: {
        label: 'Terbatas',
        points: 6.25,
        criteria:
          'Murid pasif 100%. Teknologi hanya digunakan guru untuk menampilkan slide teks ceramah atau memutar video satu arah tanpa murid memegang gawai/berkarya.'
      },
      2: {
        label: 'Berkembang',
        points: 12.5,
        criteria:
          'Murid mulai mengoperasikan perangkat digital, namun sebatas mencari informasi di Google atau menyalin teks materi ke format dokumen word dasar.'
      },
      3: {
        label: 'Matang',
        points: 18.75,
        criteria:
          'Murid aktif menghasilkan artefak digital representatif (infografis Canva, demonstrasi simulasi PhET/GeoGebra, atau presentasi kelompok interaktif).'
      },
      4: {
        label: 'Membudaya',
        points: 25.0,
        criteria:
          'Murid menjadi kreator digital mandiri. Memproduksi karya otentik berdaya guna (video dokumenter mini, aplikasi Scratch, kampanye sosial digital, atau laporan sains komputasi) untuk memecahkan masalah nyata.'
      }
    }
  },
  {
    id: 'dig_dim2',
    number: 2,
    title: 'Kolaborasi & Komunikasi Digital Interaktif (*Real-Time Synergy*)',
    shortTitle: 'Kolaborasi Digital Antar-Murid',
    description:
      'Penggunaan platform digital cloud untuk memfasilitasi kerja tim simultan, berbagi ide secara visual, dan memperluas koneksi belajar melampaui sekat kelas fisik.',
    levels: {
      1: {
        label: 'Terbatas',
        points: 6.25,
        criteria:
          'Tidak ada interaksi digital antar-murid. Perangkat digunakan secara soliter dan terisolasi tanpa mekanisme berbagi gagasan bersama.'
      },
      2: {
        label: 'Berkembang',
        points: 12.5,
        criteria:
          'Terdapat pengumpulan tugas secara digital (misal via WhatsApp atau Google Classroom), namun proses penyusunan tugas belum memanfaatkan kerja bersama secara real-time.'
      },
      3: {
        label: 'Matang',
        points: 18.75,
        criteria:
          'Murid berkolaborasi aktif dalam satu kanvas/dokumen bersama (Google Docs/Slides, Padlet, Jamboard) untuk menyusun solusi kelompok secara bersamaan.'
      },
      4: {
        label: 'Membudaya',
        points: 25.0,
        criteria:
          'Sinergi digital mendalam dan lintas ruang. Murid berkolaborasi lintas kelompok atau terhubung dengan pakar/audiens luar via telekonferensi dan mempublikasikan karya kolaboratif terbuka.'
      }
    }
  },
  {
    id: 'dig_dim3',
    number: 3,
    title: 'Asesmen Formatif Adaptif & Umpan Balik Instan Berbasis Data',
    shortTitle: 'Asesmen Digital Adaptif & Analitik',
    description:
      'Pemanfaatan instrumen digital gamifikasi/adaptif untuk mendiagnosis pemahaman murid seketika, menyediakan umpan balik cepat, dan memandu diferensiasi instruksional.',
    levels: {
      1: {
        label: 'Terbatas',
        points: 6.25,
        criteria:
          'Asesmen masih konvensional kertas, atau tes digital sebatas pilihan ganda statis tanpa analisis umpan balik atau pembahasan tindak lanjut.'
      },
      2: {
        label: 'Berkembang',
        points: 12.5,
        criteria:
          'Menggunakan kuis digital (Quizizz/Google Forms), namun data skor baru ditinjau setelah pembelajaran usai sehingga belum memengaruhi alur intervensi saat sesi berlangsung.'
      },
      3: {
        label: 'Matang',
        points: 18.75,
        criteria:
          'Data asesmen digital dianalisis secara real-time di layar guru. Guru langsung mengidentifikasi miskonsepsi kelompok dan melakukan pendampingan terarah seketika.'
      },
      4: {
        label: 'Membudaya',
        points: 25.0,
        criteria:
          'Asesmen formatif adaptif berjenjang dan metakognitif. Murid memantau kemajuan belajarnya sendiri melalui dashboard capaian, dan guru mendiferensiasikan tantangan berikutnya secara otomatis.'
      }
    }
  },
  {
    id: 'dig_dim4',
    number: 4,
    title: 'Kewarganegaraan Digital, Etika Siber & Literasi AI (*AI Literacy*)',
    shortTitle: 'Etika Digital, Keamanan & Literasi AI',
    description:
      'Pembiasaan sikap etis di dunia digital, integritas akademik (anti-plagiasi), perlindungan data pribadi, verifikasi fakta/hoaks, dan pemanfaatan AI generatif sebagai mitra berpikir kritis.',
    levels: {
      1: {
        label: 'Terbatas',
        points: 6.25,
        criteria:
          'Aspek etika digital, hak cipta, dan keamanan siber diabaikan. Murid melakukan copy-paste bebas tanpa menyertakan sumber referensi yang valid.'
      },
      2: {
        label: 'Berkembang',
        points: 12.5,
        criteria:
          'Guru mengingatkan secara lisan untuk tidak mencontek atau mencantumkan sumber, namun belum ada panduan operasional etika digital atau literasi informasi.'
      },
      3: {
        label: 'Matang',
        points: 18.75,
        criteria:
          'Murid terlatih memverifikasi kredibilitas sumber informasi digital, menghargai lisensi karya cipta, dan menerapkan tata krama berkomunikasi di ruang siber.'
      },
      4: {
        label: 'Membudaya',
        points: 25.0,
        criteria:
          'Literasi digital dan AI mengakar kuat. Murid mampu menggunakan kecerdasan artifisial (AI) secara kritis sebagai asisten bertukar ide, membedah bias informasi, dan menjaga jejak digital positif secara mandiri.'
      }
    }
  }
];




