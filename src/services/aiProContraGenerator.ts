/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';

export interface GeneratedProContraAnalysis {
  pro: string;
  kontra: string;
  analisisDampak: string;
  aksiPenyelesaian: string;
}

interface AspectKnowledgeBase {
  keywords: string[];
  data: GeneratedProContraAnalysis;
}

// Comprehensive pedagogical and supervisory dialectical knowledge base
const KNOWLEDGE_BASE: AspectKnowledgeBase[] = [
  {
    keywords: ['ai', 'generatif', 'canva', 'gemini', 'chatgpt', 'artificial intelligence', 'kecerdasan buatan', 'quizizz ai'],
    data: {
      pro: 'Mempercepat guru dalam merancang stimulus bacaan bertingkat, bank soal diagnostik, dan visual pembelajaran interaktif berkualitas tinggi; mempersonalisasi materi sesuai minat murid dalam hitungan detik; meningkatkan literasi digital dan adaptabilitas teknologi abad ke-21.',
      kontra: 'Kekhawatiran ketergantungan instan tanpa telaah kritis; kecemasan plagiarisme tugas murid; sebagian guru senior merasa asing dengan teknik prompt engineering dan khawatir peran pendidik tereduksi.',
      analisisDampak: 'Kesenjangan literasi digital antar-guru semakin melebar; penolakan pasif terhadap adopsi teknologi yang sebenarnya mempermudah diferensiasi; tugas murid berisiko diselesaikan oleh bot tanpa pemahaman nalar jika etika tidak diajarkan.',
      aksiPenyelesaian: 'Penyelenggaraan workshop supervisi klinis "Prompting Edukatif Ramah Guru" di Kombel sekolah; penetapan regulasi dan panduan transparansi AI di satuan pendidikan; fokuskan AI sebagai asisten perancang media dan stimulasi diskusi nalar kritis.'
    }
  },
  {
    keywords: ['pid', 'papan interaktif', 'papan interaktif digital', 'touchscreen', 'smartboard', 'layar interaktif'],
    data: {
      pro: 'Meningkatkan keterlibatan aktif murid (student hands-on engagement) hingga lebih dari 70%; memvisualisasikan materi abstrak sains dan matematika melalui manipulasi simulasi interaktif; memfasilitasi interaksi multi-arah (murid-alat-guru).',
      kontra: 'Kecemasan guru akan risiko kerusakan fisik pada perangkat berharga mahal; kendala ketergantungan kelistrikan dan stabilitas internet sekolah; durasi persiapan login akun dan operasional di awal jam pelajaran.',
      analisisDampak: 'Perangkat bantuan TIK pemerintah berisiko mangkrak di lemari/ruang kepala sekolah (idle asset) atau hanya difungsikan secara pasif sebagai pengganti papan tulis konvensional (level Substitution terendah model SAMR).',
      aksiPenyelesaian: 'Pendampingan klinis 1-on-1 oleh pengawas; penunjukan 1 guru pionir muda sebagai pendamping teknis (peer mentoring); penetapan SOP operasional yang ramah dan menepis ketakutan salah klik; instalasi bank materi/simulasi interaktif offline.'
    }
  },
  {
    keywords: ['chromebook', 'laptop', 'gawai', 'gadget', 'lab komputer', 'komputer'],
    data: {
      pro: 'Membiasakan murid dengan perangkat TIK resmi Kurikulum Merdeka (Akun Belajar.id); mempermudah asesmen formatif online real-time; membuka akses ke sumber belajar global tanpa batas ruang kelas.',
      kontra: 'Distraksi murid mengakses situs hiburan/game saat jam belajar; pembagian waktu giliran penggunaan unit yang terbatas; kekhawatiran baterai habis atau kendala konektivitas Wi-Fi.',
      analisisDampak: 'Waktu instruksional tersita untuk penanganan kendala teknis; pembelajaran digital menjadi tidak merata; murid hanya memandang gawai sebagai sarana bermain bukan alat produksi pengetahuan.',
      aksiPenyelesaian: 'Penerapan keyakinan kelas penggunaan gawai (digital citizenship); aktivasi fitur Google Classroom dan pembatasan tautan fokus belajar; pembentukan tim murid teknisi cilik (IT ambassadors) di setiap kelas.'
    }
  },
  {
    keywords: ['diferensiasi', 'berdiferensiasi', 'tarl', 'teaching at the right level', 'kesiapan belajar', 'scaffolding'],
    data: {
      pro: 'Mengakomodasi spektrum kesiapan belajar murid yang heterogen; menurunkan tingkat frustrasi murid berkemampuan lambat melalui bimbingan berjenjang (scaffolding); memicu tantangan bermakna bagi murid yang cepat belajar.',
      kontra: 'Guru mengeluhkan waktu persiapan modul ajar dan ragam LKPD bertingkat yang berlipat ganda; kesulitan mengawasi 3 kelompok aktivitas belajar secara simultan; kekhawatiran materi kurikulum tidak tuntas tepat waktu.',
      analisisDampak: 'Jika dipaksakan tanpa strategi praktis, guru berpotensi melakukan "diferensiasi semu" hanya di lembar modul ajar namun kelas kembali seragam monolog; murid marginal kehilangan hak belajar sesuai kemampuannya.',
      aksiPenyelesaian: 'Pengawas memfasilitasi co-planning bank modul diferensiasi via Kombel sekolah mingguan; terapkan model stasiun rotasi belajar bertahap (cukup diferensiasi proses di awal); sederhanakan rubrik penilaian berjenjang.'
    }
  },
  {
    keywords: ['restitusi', 'segitiga restitusi', 'keyakinan kelas', 'disiplin positif', 'budaya positif', 'posisi kontrol'],
    data: {
      pro: 'Menumbuhkan motivasi intrinsik dan kesadaran murid memperbaiki kesalahan secara bermartabat; tidak menimbulkan dendam atau trauma psikologis; membentuk iklim kelas yang aman, inklusif, dan saling menghargai.',
      kontra: 'Dialog restitusi menuntut waktu konseling pribadi yang panjang di tengah padatnya jam mengajar; persepsi bahwa jika tidak diberi sanksi tegas/hukuman instan, murid tidak akan jera dan wibawa guru menurun.',
      analisisDampak: 'Inkonsistensi penegakan disiplin di sekolah; sebagian siswa meremehkan aturan kelas bila restitusi disalahartikan sebagai pembiaran atau toleransi tanpa konsekuensi logis yang disepakati.',
      aksiPenyelesaian: 'Supervisi klinis modeling 5 posisi kontrol guru (khususnya Manajer) pada forum Kombel; perumusan poster Keyakinan Kelas visual yang ditempel di dinding; koordinasi terpadu antara wali kelas, guru BK, dan orang tua.'
    }
  },
  {
    keywords: ['kse', 'sosial emosional', 'mindfulness', 'kesadaran penuh', 'teknik stop', 'emosional'],
    data: {
      pro: 'Meningkatkan fokus dan ketenangan belajar murid; menurunkan kecemasan sebelum asesmen; melatih keterampilan regulasi emosi, empati antarteman, dan resolusi konflik secara damai.',
      kontra: 'Guru merasa canggung atau memandang sesi hening (mindfulness) membuang-buang waktu pelajaran akademik; belum terbiasa mengintegrasikan 5 kompetensi sosial emosional ke dalam RPP.',
      analisisDampak: 'Iklim kelas rentan memicu stres dan kejenuhan murid; potensi perundungan (bullying) tidak terdeteksi sejak dini; hasil belajar akademik tidak optimal akibat beban emosional yang tak terkelola.',
      aksiPenyelesaian: 'Latihkan teknik STOP singkat (2-3 menit) pada kegiatan pendahuluan dan peralihan materi; sediakan roda emosi (mood meter) sederhana di pintu kelas; pengawas memberikan contoh integrasi KSE implisit pada modul ajar.'
    }
  },
  {
    keywords: ['pbl', 'problem based', 'berbasis masalah', 'masalah kontekstual'],
    data: {
      pro: 'Mengasah nalar kritis dan pemecahan masalah otentik murid berbasis fenomena riil (seperti pertanian/lingkungan Sidrap); mendorong komunikasi dan kolaborasi aktif; belajar menjadi bermakna dan aplikatif.',
      kontra: 'Suasana kelas menjadi riuh dan terkesan tidak tertib bagi pengawas/guru konvensional; waktu 2 JP kerap tidak cukup untuk menuntaskan tahap penyelidikan dan presentasi; siswa pendiam berisiko pasif.',
      analisisDampak: 'Guru merasa putus asa mengendalikan ritme kelas lalu kembali ke metode hafalan rumus/teks; murid kehilangan momen melatih keterampilan 4C (Critical Thinking, Collaboration, Creativity, Communication).',
      aksiPenyelesaian: 'Penerapan pembagian peran tegas dalam kelompok (Ketua, Notulis, Juru Bicara, Timer); penggunaan timer visual di layar proyektor/PID; pendampingan pengawas dalam merumuskan lembar observasi partisipasi individu.'
    }
  },
  {
    keywords: ['pjbl', 'proyek', 'project based', 'p5', 'karya', 'produk'],
    data: {
      pro: 'Menghasilkan artefak karya nyata yang membanggakan murid; mengintegrasikan berbagai mata pelajaran secara holistik; memupuk jiwa kepemimpinan, agensi murid, dan ketahanan dalam berproses.',
      kontra: 'Kekhawatiran biaya bahan proyek membebani orang tua; waktu pengerjaan yang molor melampaui jadwal tema; dominasi siswa tertentu dalam kelompok proyek.',
      analisisDampak: 'Proyek berisiko menjadi ajang perlombaan produk mahal buatan orang tua bukan karya orisinal murid; esensi penguatan karakter dan proses belajar mendalam terabaikan.',
      aksiPenyelesaian: 'Wajibkan pemanfaatan bahan daur ulang / bahan alam lokal tanpa biaya; tetapkan milestone mingguan yang jelas; penilaian difokuskan pada jurnal refleksi proses bukan kemewahan produk akhir.'
    }
  },
  {
    keywords: ['portofolio', 'portofolio digital', 'asesmen formatif', 'exit ticket', 'umpan balik', 'asesmen'],
    data: {
      pro: 'Merekam pertumbuhan kompetensi murid secara otentik dari waktu ke waktu; melatih murid menilai diri sendiri (assessment as learning); penilaian lebih manusiawi dan tidak mereduksi potensi murid ke angka ujian semata.',
      kontra: 'Beban mengorganisir dan memeriksa puluhan folder artefak murid; kendala keterbatasan memori penyimpanan (drive) atau kuota murid jika mengunggah berkas di rumah.',
      analisisDampak: 'Penilaian rapor kembali mengandalkan tes hafalan tertulis kognitif semata; motivasi belajar murid tereduksi hanya pada perburuan nilai angka ujian akhir.',
      aksiPenyelesaian: 'Standarisasi struktur Google Drive / Google Sites kelas per tema; batasi kurasi hanya 1 karya terbaik tiap bab materi; adakan sesi pameran karya mini (Student-Led Showcase) tiap akhir semester.'
    }
  },
  {
    keywords: ['kombel', 'komunitas belajar', 'lesson study', 'peer coaching', 'berbagi praktik', 'mgmp', 'kkg'],
    data: {
      pro: 'Menciptakan budaya kolaborasi sejawat yang memecahkan masalah pembelajaran nyata; menghilangkan sekat isolasi guru di kelas; mempercepat penyebaran modul ajar bermutu tanpa bergantung pelatihan luar.',
      kontra: 'Rasa enggan/malu diobservasi oleh rekan guru sendiri; benturan jadwal mengajar dan tugas tambahan; pertemuan Kombel berisiko berubah menjadi sekadar kumpul administratif tanpa fokus belajar murid.',
      analisisDampak: 'Sekolah kehilangan motor penggerak transformasi internal; kompetensi guru berjalan stagnan; kualitas pembelajaran antar-kelas di satu sekolah menjadi sangat timpang.',
      aksiPenyelesaian: 'Kepala Sekolah menetapkan jadwal rutin 1 jam Kombel per minggu yang bebas jam mengajar; sepakati norma belajar bersama tanpa menghakimi; fokuskan agenda pada siklus inkuiri (Refleksi - Rencana - Praktik - Evaluasi).'
    }
  },
  {
    keywords: ['kemitraan', 'orang tua', 'student-led conference', 'slc', 'keluarga', 'komunitas'],
    data: {
      pro: 'Menyelaraskan pola asuh dan pendampingan belajar di rumah dan sekolah; orang tua memahami perkembangan riil anak langsung dari tuturan murid; membangun kepercayaan sosial yang kokoh terhadap sekolah.',
      kontra: 'Kesulitan menghadirkan orang tua yang sibuk bekerja di sawah/dinas; kecemasan guru menghadapi komplain atau resistensi wali murid; format pertemuan konvensional seringkali searah.',
      analisisDampak: 'Munculnya saling menyalahkan antara guru dan orang tua saat prestasi anak menurun; murid merasa tidak didukung secara emosional oleh keluarga dalam proses belajarnya.',
      aksiPenyelesaian: 'Rancang format Student-Led Conference (SLC) fleksibel (tatap muka terjadwal atau video rekaman); berikan panduan apresiasi bagi orang tua; jadwalkan pertemuan di akhir pekan atau sore hari yang kondusif.'
    }
  },
  {
    keywords: ['game', 'edukasi', 'gamifikasi', 'quizizz', 'wordwall', 'kahoot'],
    data: {
      pro: 'Membangkitkan antusiasme dan kegembiraan belajar secara instan; menyediakan umpan balik cepat atas penguasaan konsep; mengubah sesi latihan soal yang membosankan menjadi tantangan menyenangkan.',
      kontra: 'Murid terlalu berfokus pada kecepatan skor daripada pemahaman konsep yang mendalam; murid yang lambat merasa rendah diri saat melihat papan peringkat (leaderboard).',
      analisisDampak: 'Efek novelty cepat memudar jika tidak dibarengi refleksi konsep; murid mengabaikan penalaran mendalam karena terburu-buru mengejar waktu klik.',
      aksiPenyelesaian: 'Kombinasikan game dengan sesi bedah soal bersama (debriefing); nonaktifkan papan skor kompetitif bila mengajar konsep baru; gunakan mode game kerja sama kelompok (team mode).'
    }
  },
  {
    keywords: ['literasi', 'numerasi', 'kearifan lokal', 'budaya', 'sidrap', 'kontekstual'],
    data: {
      pro: 'Mendekatkan pembelajaran dengan realitas kehidupan murid (misalnya siklus panen padi, irigasi, pasar tradisional Sidrap); menumbuhkan rasa bangga terhadap budaya daerah; menaikkan skor Rapor Pendidikan dimensi literasi numerasi.',
      kontra: 'Keterbatasan buku atau modul ajar terbitan nasional yang mengangkat konteks lokal Sidrap; guru terbiasa menggunakan contoh umum perkotaan di buku paket.',
      analisisDampak: 'Pengetahuan murid menjadi terasing dari lingkungannya sendiri; murid kesulitan mengaplikasikan konsep numerasi dan literasi dalam memecahkan persoalan sehari-hari.',
      aksiPenyelesaian: 'Kombel sekolah menyusun bank soal numerasi berbasis data lokal (luas sawah, debit saluran air, timbangan gabah); integrasikan cerita rakyat lokal ke dalam stimulus teks literasi; supervisi berbasis karya kontekstual.'
    }
  }
];

// Fallback dynamic generator for any completely custom topic
function generateAdaptiveFallback(aspek: string, schoolName?: string): GeneratedProContraAnalysis {
  const cleanAspek = aspek.trim();
  const school = schoolName || 'Satuan Pendidikan';

  return {
    pro: `Mendukung transformasi paradigma baru Kurikulum Merdeka pada aspek "${cleanAspek}"; meningkatkan motivasi intrinsik dan keaktifan murid di kelas; memperkaya variasi metode mengajar guru agar tidak monoton; mempercepat pencapaian Profil Pelajar Pancasila dan efektivitas pembelajaran di ${school}.`,
    kontra: `Guru menghadapi kendala adaptasi awal dan persepsi beban administrasi tambahan dalam merancang "${cleanAspek}"; keterbatasan alokasi waktu penyesuaian di tengah padatnya kurikulum; kekhawatiran sebagian pendidik terhadap kesiapan sarana pendukung dan respon murid.`,
    analisisDampak: `Bila implementasi "${cleanAspek}" dipaksakan tanpa pendampingan bertahap, guru berisiko mengalami kelelahan mental (burnout) dan kembali ke zona nyaman metode konvensional; inovasi hanya berjalan formalitas di atas kertas dokumen RPP tanpa perubahan kultur belajar nyata.`,
    aksiPenyelesaian: `Pengawas Pembina bersama Kepala Sekolah memberikan supervisi klinis berbasis coaching dialogis; aktifkan Komunitas Belajar (Kombel) untuk bedah praktik baik "${cleanAspek}" secara bertahap; sederhanakan instrumen dan berikan apresiasi bertahap terhadap setiap progres guru.`
  };
}

/**
 * Intelligent AI Generator for Academic Pro-Contra Analysis
 * Uses Gemini API if available, with robust and authentic domain knowledge engine fallback
 */
export async function generateProContraAI(
  aspek: string,
  context?: {
    schoolName?: string;
    teacherName?: string;
    subject?: string;
    targetField?: 'all' | 'pro' | 'kontra' | 'analisisDampak' | 'aksiPenyelesaian';
  }
): Promise<GeneratedProContraAnalysis> {
  const cleanTopic = aspek.trim().toLowerCase();

  // 1. Try Gemini API if API key is present in environment
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process.env as any)?.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.length > 10) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Anda adalah seorang Pengawas Sekolah Pembina Senior dan Pakar Supervisi Akademik Kurikulum Merdeka di Dinas Pendidikan Kabupaten Sidenreng Rappang.
Tugas Anda adalah membedah dialektika supervisi akademik pada topik: "${aspek}"
Konteks Satuan Pendidikan: ${context?.schoolName || 'Satuan Pendidikan Binaan di Kabupaten Sidenreng Rappang'}
Guru Sasaran: ${context?.teacherName || 'Pendidik'}
Mata Pelajaran: ${context?.subject || 'Mata Pelajaran Terkait'}

Berikan analisis mendalam dan realistis dalam format JSON dengan 4 kunci berikut:
1. "pro": Argumen yang mendukung dan manfaat instruksional nyata bagi keterlibatan murid (student hands-on engagement), pemahaman konsep, dan mutu pembelajaran.
2. "kontra": Keberatan realistis guru, beban persiapan modul, kekhawatiran teknis, kendala sarana, atau resistensi psikologis lapangan.
3. "analisisDampak": Analisis dampak instruksional dan sistemik bila keberatan/kendala guru diabaikan tanpa solusi mitigasi.
4. "aksiPenyelesaian": Langkah solutif, mediasi pengawas pembina, peran kepala sekolah, dan pendampingan klinis di Komunitas Belajar (Kombel) yang aplikatif.

Kembalikan HANYA format JSON valid tanpa markdown tambahan.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text) as GeneratedProContraAnalysis;
        if (parsed.pro && parsed.kontra && parsed.analisisDampak && parsed.aksiPenyelesaian) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to instant knowledge engine:', err);
    }
  }

  // 2. Offline Expert Knowledge Base Engine
  // Match keywords against topic
  for (const entry of KNOWLEDGE_BASE) {
    const isMatched = entry.keywords.some((kw) => cleanTopic.includes(kw));
    if (isMatched) {
      return { ...entry.data };
    }
  }

  // 3. Adaptive Fallback Engine
  return generateAdaptiveFallback(aspek, context?.schoolName);
}
