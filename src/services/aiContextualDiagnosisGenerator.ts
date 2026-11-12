/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import {
  ContextualProblemCategory,
  ContextualDataSource,
  RootCauseAspect,
  FiveWhysAnalysis
} from '../types/inspiro';

export interface FullDiagnosisScenario {
  id: string;
  name: string;
  badge: string;
  problemCategory: ContextualProblemCategory;
  problemTitle: string;
  severity: 'Tinggi' | 'Sedang' | 'Rendah';
  dataSources: ContextualDataSource[];
  baselineDataEvidence: string;
  fiveWhys: FiveWhysAnalysis;
  rootCauses: RootCauseAspect;
  recommendedIntervention: {
    supervisionAction: 'Supervisi Klinis' | 'Coaching TIRTA' | 'Pendampingan PM' | 'Modelling Pengawas' | 'Komunitas Belajar';
    targetTimeline: string;
    actionDetails: string[];
    linkedFeature?: 'supervision' | 'coaching' | 'teacher-quadrant' | 'pm-learning-env' | 'pm-digital';
  };
}

export const CONTEXTUAL_SCENARIOS: FullDiagnosisScenario[] = [
  {
    id: 'pasivitas_murid',
    name: '1. Pasivitas & Ketakutan Murid Menjawab (Iklim Psikologis)',
    badge: 'Keaktifan Murid',
    problemCategory: 'keaktifan_murid',
    problemTitle: 'Pasivitas & Tingginya Kecemasan Murid dalam Eksplorasi Pembelajaran',
    severity: 'Tinggi',
    dataSources: ['observasi_awal', 'wawancara_guru', 'suara_murid'],
    baselineDataEvidence:
      'Pada observasi awal kelas, teramati lebih dari 65% murid di barisan tengah dan belakang bersikap pasif menunduk saat guru melontarkan pertanyaan pemantik. Hasil wawancara singkat mengungkap bahwa murid cemas ditertawakan teman atau ditegur bila keliru menjawab, sehingga memilih diam dan sekadar menyalin tulisan guru di papan tulis.',
    fiveWhys: {
      why1: 'Murid pasif, enggan bertanya, dan tidak berani menjawab saat pembelajaran berlangsung.',
      why2: 'Murid takut salah menjawab karena khawatir ditertawakan teman atau dihakimi di depan kelas.',
      why3: 'Guru belum membangun iklim keamanan emosional (growth mindset) dan instruksi mengajar didominasi ceramah satu arah tanpa jeda berpikir (wait time).'
    },
    rootCauses: {
      aspekMetodeGuru:
        'Metode didominasi ceramah satu arah (> 70% jam tatap muka) dan guru langsung menunjuk murid secara mendadak tanpa memberikan waktu jeda berpikir (wait-time minimal 5 detik).',
      aspekPerencanaanModul:
        'Modul ajar dan LKPD belum memuat pertanyaan pemantik bertingkat (scaffolding) dan tidak ada instruksi kerja berpasangan yang aman bagi murid pemalu.',
      aspekPengelolaanKelas:
        'Belum dirumuskan Keyakinan Kelas ramah kesalahan; respon verbal guru saat murid keliru masih bernada korektif langsung tanpa mengapresiasi keberanian berpendapat.',
      aspekKarakteristikMurid:
        'Murid terbiasa dengan pola belajar pasif-menghafal dan memiliki kecemasan akademik (academic anxiety) saat menghadapi pertanyaan terbuka.',
      aspekDayaDukung:
        'Formasi meja murid berbaris kaku menghadap papan tulis menghambat interaksi diskusi teman sebaya (peer sharing).'
    },
    recommendedIntervention: {
      supervisionAction: 'Coaching TIRTA',
      targetTimeline: '2 Pekan (Siklus I)',
      actionDetails: [
        'Lakukan sesi Coaching Alur TIRTA bersama guru untuk menggali komitmen penerapan teknik diskusi "Think-Pair-Share" dan penataan kesepakatan kelas.',
        'Dampingi guru menyusun rubrik apresiasi keberanian murid dan teknik "Warm Calling" yang memberikan jeda waktu berpikir 5-7 detik sebelum murid merespon.',
        'Ubah formasi tempat duduk menjadi kelompok melingkar atau formasi U agar kontak visual antarmurid tercipta secara bersahabat.'
      ],
      linkedFeature: 'coaching'
    }
  },
  {
    id: 'diferensiasi_modul',
    name: '2. Pembelajaran Belum Berdiferensiasi (LKPD & Tugas Seragam)',
    badge: 'Diferensiasi Belajar',
    problemCategory: 'diferensiasi_belajar',
    problemTitle: 'Pembelajaran Belum Mengakomodasi Keragaman Kesiapan Belajar Murid (TaRL)',
    severity: 'Tinggi',
    dataSources: ['observasi_awal', 'artefak_tugas', 'wawancara_guru'],
    baselineDataEvidence:
      'Dari telaah asesmen formatif awal dan pengamatan kelas, 40% murid belum tuntas kompetensi prasyarat dasar. Namun, guru tetap memberikan bahan bacaan dan LKPD yang sama persis dengan tenggat waktu seragam. Akibatnya murid kelompok lambat frustrasi tertinggal, sementara kelompok cepat telah selesai dalam 15 menit dan mulai gaduh.',
    fiveWhys: {
      why1: 'Sebagian murid tidak mampu menyelesaikan tugas mandiri sementara murid cepat merasa jenuh.',
      why2: 'Guru menyajikan materi dan lembar kerja seragam dengan asumsi seluruh murid memiliki kecepatan belajar yang sama.',
      why3: 'Guru merasa terbebani merancang diferensiasi konten dan proses serta belum menguasai teknik pengelolaan kelompok belajar bertingkat di kelas.'
    },
    rootCauses: {
      aspekMetodeGuru:
        'Guru mengajar secara klasikal massal dari awal hingga akhir tanpa memberikan bimbingan khusus (scaffolding terbimbing) kepada kelompok yang tertinggal.',
      aspekPerencanaanModul:
        'LKPD hanya memiliki satu tingkatan soal dengan kompleksitas tinggi; tidak ada pembagian tugas bertingkat (Tiered Assignment: Bintang 1, 2, dan 3).',
      aspekPengelolaanKelas:
        'Waktu guru terkuras meladeni murid cepat yang sudah selesai, sedangkan kelompok yang kesulitan tidak mendapatkan pendampingan terarah.',
      aspekKarakteristikMurid:
        'Rentang modalitas dan kesiapan belajar murid di satu rombel sangat heterogen (sebagian masih terkendala kelancaran membaca pemahaman).',
      aspekDayaDukung:
        'Ketersediaan bahan bacaan berjenjang (leveled reading) dan media visual penopang konsep konkret di kelas masih sangat minim.'
    },
    recommendedIntervention: {
      supervisionAction: 'Pendampingan PM',
      targetTimeline: '3 Pekan (Siklus I - II)',
      actionDetails: [
        'Dampingi guru merancang LKPD Berjenjang (Tiered Task) pada forum Komunitas Belajar (Kombel) sekolah dengan 3 level tantangan berbeda.',
        'Terapkan model stasiun rotasi belajar (Learning Stations) di mana guru mendampingi kelompok butuh bimbingan selama 15 menit secara bergilir.',
        'Sediakan kartu panduan mandiri atau media manipulatif visual untuk membantu murid menyelesaikan tugas tanpa tergantung 100% pada guru.'
      ],
      linkedFeature: 'pm-learning-env'
    }
  },
  {
    id: 'sarana_chromebook',
    name: '3. Sarana Digital / Chromebook Belum Dioptimalkan (Idle Asset)',
    badge: 'Media Digital',
    problemCategory: 'media_digital',
    problemTitle: 'Pemanfaatan Chromebook & Papan Interaktif (PID) Masih Berada di Level Substitusi Rendah',
    severity: 'Sedang',
    dataSources: ['observasi_awal', 'supervisi_sebelumnya', 'wawancara_guru'],
    baselineDataEvidence:
      'Sekolah memiliki 30 unit Chromebook bantuan pemerintah dan 1 Papan Interaktif Digital (PID), namun perangkat tersimpan di lemari terkunci dan hanya dipakai 2 kali dalam sebulan. Guru mengaku cemas perangkat rusak dan belum percaya diri mengintegrasikan aplikasi pembelajaran interaktif dalam alokasi waktu mengajar.',
    fiveWhys: {
      why1: 'Chromebook dan layar PID sangat jarang disentuh dan digunakan murid saat jam pelajaran.',
      why2: 'Guru khawatir terjadi kerusakan teknis pada perangkat dan merasa ribet mengatur login akun belajar.id murid.',
      why3: 'Belum adanya SOP pemanfaatan santai di satuan pendidikan serta minimnya simulasi langsung (modelling) integrasi alat dalam skenario modul ajar.'
    },
    rootCauses: {
      aspekMetodeGuru:
        'Guru merasa lebih nyaman dan cepat dengan metode buku teks konvensional dan mencatat di papan tulis.',
      aspekPerencanaanModul:
        'Modul ajar belum mengintegrasikan asesmen interaktif real-time (seperti Quizizz Paper/Live Mode, Canva Edukasi, atau PhET Simulation).',
      aspekPengelolaanKelas:
        'Guru cemas murid membuka situs hiburan/game saat gawai dinyalakan dan waktu tersita habis untuk penanganan kendala teknis.',
      aspekKarakteristikMurid:
        'Murid sangat antusias memegang gawai namun belum dibekali etika kewargaan digital (digital citizenship) dan aturan main penggunaan alat.',
      aspekDayaDukung:
        'Jaringan Wi-Fi belum memiliki repeater yang menjangkau seluruh ruang kelas dan stop kontak pengisian baterai masih terpusat di kantor.'
    },
    recommendedIntervention: {
      supervisionAction: 'Modelling Pengawas',
      targetTimeline: '2 Pekan (Oktober - November 2026)',
      actionDetails: [
        'Pengawas mendemonstrasikan sesi Modelling Langsung di kelas mengajar menggunakan Chromebook dan aplikasi kuis interaktif selama 1 JP.',
        'Bentuk tim murid "Duta TIK Cilik" di tiap rombel yang bertugas mengambil, mendistribusikan, dan merapikan unit laptop secara tertib.',
        'Rancang SOP operasional yang ramah guru tanpa sanksi berlebihan jika terjadi kendala teknis minor, demi menepis ketakutan mencoba.'
      ],
      linkedFeature: 'pm-digital'
    }
  },
  {
    id: 'manajemen_waktu_praktikum',
    name: '4. Alokasi Waktu Praktikum & Jam Belajar Molor (Manajemen Waktu)',
    badge: 'Manajemen Waktu',
    problemCategory: 'manajemen_waktu',
    problemTitle: 'Manajemen Ritme Kelas Tersendat & Alokasi Waktu Pembelajaran Aktif Molor',
    severity: 'Tinggi',
    dataSources: ['observasi_awal', 'supervisi_sebelumnya'],
    baselineDataEvidence:
      'Pada observasi kegiatan praktikum dan kerja kelompok, penjelasan instruksi awal guru menghabiskan durasi 28 menit (sepertiga dari total 80 menit). Proses pembagian alat dan pembentukan kelompok menyita 12 menit, sehingga murid hanya memiliki sisa waktu 15 menit untuk mengamati dan menganalisis data, menyebabkan sesi kesimpulan dan refleksi terlewat total.',
    fiveWhys: {
      why1: 'Aktivitas belajar inti terburu-buru dan sesi refleksi kesimpulan selalu terpotong bel istirahat.',
      why2: 'Apersepsi dan penjelasan teori guru di papan tulis terlalu panjang dan distribusi bahan kelompok memicu antrian.',
      why3: 'Guru belum menerapkan teknik manajemen ritme waktu (time-chunking) dan pembagian peran kerja spesifik di dalam kelompok murid.'
    },
    rootCauses: {
      aspekMetodeGuru:
        'Guru menerangkan semua prosedur teknis secara verbal berulang-ulang alih-alih menyediakan lembar alur visual atau video panduan 2 menit.',
      aspekPerencanaanModul:
        'Modul ajar tidak merinci target menit (time boundaries) per aktivitas kegiatan inti secara realistis.',
      aspekPengelolaanKelas:
        'Tidak ada pembagian peran struktural dalam kelompok (seperti penanggung jawab alat, pencatat, penjaga waktu/timer, dan juru bicara).',
      aspekKarakteristikMurid:
        'Murid antusias berdiskusi namun mudah teralihkan obrolan di luar materi karena tidak ada batas waktu visual yang mengikat.',
      aspekDayaDukung:
        'Ketiadaan alat visual time-keeper (seperti timer layar proyektor atau lonceng interval) untuk mengingatkan transisi tahapan belajar.'
    },
    recommendedIntervention: {
      supervisionAction: 'Supervisi Klinis',
      targetTimeline: 'Siklus II (2 Pekan)',
      actionDetails: [
        'Supervisi klinis difokuskan pada Indikator 6 (Efisiensi Waktu Belajar Aktif) dengan target waktu bicara guru maksimal 20% durasi total.',
        'Terapkan pembagian peran kelompok (Peran 4 Murid: Manajer Alat, Notulis, Penjaga Waktu, dan Presenter) untuk mengeliminasi antrian.',
        'Gunakan timer visual digital di layar proyektor agar murid memiliki kesadaran tempo pengerjaan tugas secara mandiri.'
      ],
      linkedFeature: 'supervision'
    }
  },
  {
    id: 'iklim_disiplin_positif',
    name: '5. Disiplin Masih Kaku & Sanksi Menghukum (Iklim Positif)',
    badge: 'Iklim Psikologis',
    problemCategory: 'iklim_psikologis',
    problemTitle: 'Penerapan Disiplin Kelas Masih Mengandalkan Hukuman Fisik / Sanksi Korektif Kaku',
    severity: 'Tinggi',
    dataSources: ['observasi_awal', 'wawancara_guru', 'suara_murid'],
    baselineDataEvidence:
      'Teramati saat murid terlambat atau lupa membawa buku catatan, guru langsung memberikan sanksi berdiri di depan kelas atau mencatat halaman buku 5 lembar. Dalam wawancara, guru merasa jika tidak dihukum tegas murid tidak akan jera, namun catatan BK menunjukkan pelanggaran yang sama justru berulang dari murid tersebut.',
    fiveWhys: {
      why1: 'Murid yang melanggar aturan bersikap defensif, acuh tak acuh, atau menyimpan rasa malu/dendam terhadap guru.',
      why2: 'Guru menggunakan posisi kontrol Penghukum atau Pembuat Rasa Bersalah sebagai solusi instan mendisiplinkan kelas.',
      why3: 'Guru belum memahami paradigma Disiplin Positif (Restitusi) dan belum pernah menyusun Keyakinan Kelas partisipatif bersama murid.'
    },
    rootCauses: {
      aspekMetodeGuru:
        'Pola komunikasi guru masih satu arah bernada menghakimi tanpa menggali kebutuhan dasar murid yang belum terpenuhi di balik tindakan melanggar.',
      aspekPerencanaanModul:
        'Kegiatan awal pembelajaran belum mengintegrasikan Pembelajaran Sosial Emosional (KSE) untuk menenangkan kesiapan mental murid.',
      aspekPengelolaanKelas:
        'Aturan kelas bersifat satu arah buatan guru yang memuat kata-kata larangan ("Dilarang", "Jangan", "Awas jika...") tanpa kesepakatan nilai kebajikan.',
      aspekKarakteristikMurid:
        'Sebagian murid berasal dari latar belakang keluarga rentan yang membutuhkan validasi empati sebelum siap menerima materi akademik.',
      aspekDayaDukung:
        'Belum adanya poster Keyakinan Kelas visual yang terpampang jelas di dinding kelas sebagai pengingat nilai bersama.'
    },
    recommendedIntervention: {
      supervisionAction: 'Komunitas Belajar',
      targetTimeline: '3 Pekan',
      actionDetails: [
        'Adakan sesi bedah konsep "5 Posisi Kontrol Guru & Segitiga Restitusi" pada forum Komunitas Belajar (Kombel) mingguan sekolah.',
        'Fasilitasi guru memandu murid merumuskan poster "Keyakinan Kelas Nilai Kebajikan" yang ditandatangani bersama seluruh warga kelas.',
        'Pengawas memberikan pendampingan supervisi klinis saat guru mempraktikkan dialog restitusi terhadap kasus keterlambatan murid.'
      ],
      linkedFeature: 'coaching'
    }
  },
  {
    id: 'literasi_kritis',
    name: '6. Kedangkalan Penalaran & Rendahnya Literasi Membaca Kritis',
    badge: 'Asesmen Formatif',
    problemCategory: 'asesmen_formatif',
    problemTitle: 'Kedangkalan Argumen Kritis & Ketergantungan Jawaban Hafalan Instan Murid',
    severity: 'Sedang',
    dataSources: ['artefak_tugas', 'observasi_awal', 'wawancara_guru'],
    baselineDataEvidence:
      'Dari telaah 32 berkas lembar kerja murid, ditemukan 80% jawaban murid hanya menyalin definisi kata demi kata dari lembar rangkuman tanpa sintesis argumen nalar kritis. Saat guru meminta murid memberikan pendapat pribadi atau mengaitkan materi dengan fenomena riil di Sidrap, sebagian besar murid terdiam bingung.',
    fiveWhys: {
      why1: 'Murid kesulitan mengemukakan argumen analitis dan hanya bergantung pada jawaban hafalan teks.',
      why2: 'Pertanyaan tugas dan asesmen yang diberikan guru selama ini hanya berkutat pada level kognitif rendah C1-C2 (mengingat dan menyebutkan).',
      why3: 'Guru belum membiasakan stimulasi pertanyaan pemantik berpikir tingkat tinggi (HOTS) dan belum memanfaatkan konteks lokal sebagai bahan telaah.'
    },
    rootCauses: {
      aspekMetodeGuru:
        'Guru jarang menggunakan analogi kontekstual lokal dan belum menerapkan protokol berpikir (seperti See-Think-Wonder atau Claim-Evidence-Reasoning).',
      aspekPerencanaanModul:
        'Lembar tugas murid tidak menyajikan stimulus bacaan berbasis fakta otentik atau grafik data yang memancing penyelidikan mandiri.',
      aspekPengelolaanKelas:
        'Umpan balik guru pada jawaban murid hanya sebatas centang benar/salah tanpa catatan pemantik berpikir lebih mendalam.',
      aspekKarakteristikMurid:
        'Minat baca teks panjang murid rendah dan terbiasa mencari jawaban instan di mesin pencari tanpa memahami konteks.',
      aspekDayaDukung:
        'Sudut baca kelas belum menyediakan materi pengayaan teks sains populer atau literasi budaya lokal yang memikat.'
    },
    recommendedIntervention: {
      supervisionAction: 'Supervisi Klinis',
      targetTimeline: '1 Bulan (Siklus I - II)',
      actionDetails: [
        'Dampingi guru menyusun stimulus tugas berbasis studi kasus kontekstual lokal Kabupaten Sidenreng Rappang (pertanian, energi kincir angin, ekologi Danau Sidenreng).',
        'Terapkan protokol berpikir kritis "Claim-Evidence-Reasoning" (Pernyataan - Bukti - Alasan) pada LKPD harian murid.',
        'Lakukan observasi klinis Siklus II dengan fokus pada Indikator 4 (Pemberian Pertanyaan Pemantik yang Menstimulasi Nalar Kritis).'
      ],
      linkedFeature: 'supervision'
    }
  }
];

export interface AIGenerateRequestParams {
  teacherName?: string;
  subject?: string;
  gradeClass?: string;
  schoolName?: string;
  problemCategory?: ContextualProblemCategory;
  problemTitle?: string;
  baselineDataEvidence?: string;
}

/**
 * Generate full diagnostic context using Gemini or domain knowledge base
 */
export async function generateFullContextualDiagnosisAI(
  params: AIGenerateRequestParams
): Promise<FullDiagnosisScenario> {
  // If specific category is chosen, find matching scenario
  let matchedScenario = CONTEXTUAL_SCENARIOS[0];
  if (params.problemCategory) {
    const found = CONTEXTUAL_SCENARIOS.find((s) => s.problemCategory === params.problemCategory);
    if (found) matchedScenario = found;
  }

  // Check if Gemini API is available
  const apiKey = typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined;
  if (apiKey && apiKey.length > 10) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const prompt = `Anda adalah Ahli Supervisi Akademik & Pengawas Sekolah Pembina di Indonesia.
Bantu buatkan analisis diagnosis data awal masalah pembelajaran dan akar masalah (5-Whys) yang komprehensif, logis, dan berdampak nyata bagi guru dan murid di satuan pendidikan:

Konteks Masukan:
- Guru Sasaran: ${params.teacherName || 'Guru Binaan'}
- Mata Pelajaran: ${params.subject || 'Mata Pelajaran Inti'} (${params.gradeClass || 'Fase D / SMP'})
- Satuan Pendidikan: ${params.schoolName || 'Satuan Pendidikan Binaan di Kabupaten Sidenreng Rappang'}
- Kategori Masalah: ${params.problemCategory || matchedScenario.problemCategory}
- Judul / Isu Awal: ${params.problemTitle || matchedScenario.problemTitle}

Tolong rumuskan dalam format JSON baku persis dengan struktur berikut:
{
  "problemTitle": "Judul masalah singkat dan padat",
  "problemCategory": "${params.problemCategory || matchedScenario.problemCategory}",
  "severity": "Tinggi",
  "dataSources": ["observasi_awal", "wawancara_guru", "suara_murid"],
  "baselineDataEvidence": "Uraian fakta konkret lapangan yang teramati dengan persentase dan bukti otentik...",
  "fiveWhys": {
    "why1": "1. Mengapa masalah di atas tampak terjadi di kelas?",
    "why2": "2. Mengapa kondisi pertama tersebut terjadi?",
    "why3": "3. Mengapa kondisi kedua terjadi? (Akar terdalam yang perlu dibenahi pengawas)"
  },
  "rootCauses": {
    "aspekMetodeGuru": "Penyebab dari sisi metode & pedagogi guru...",
    "aspekPerencanaanModul": "Penyebab dari sisi kesiapan perencanaan & modul ajar...",
    "aspekPengelolaanKelas": "Penyebab dari sisi pengelolaan kelas & alokasi waktu...",
    "aspekKarakteristikMurid": "Penyebab dari sisi karakteristik & kesiapan murid...",
    "aspekDayaDukung": "Penyebab dari sisi sarana & daya dukung..."
  },
  "recommendedIntervention": {
    "supervisionAction": "Coaching TIRTA",
    "targetTimeline": "2 Pekan (Siklus I)",
    "actionDetails": [
      "Langkah konkret aksi 1",
      "Langkah konkret aksi 2",
      "Langkah konkret aksi 3"
    ]
  }
}
HANYA kembalikan JSON valid tanpa markdown backticks atau teks tambahan luar.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (parsed.problemTitle && parsed.fiveWhys && parsed.rootCauses) {
          return {
            id: 'generated_ai_' + Date.now(),
            name: parsed.problemTitle,
            badge: 'AI Rekomendasi',
            problemCategory: (parsed.problemCategory as ContextualProblemCategory) || matchedScenario.problemCategory,
            problemTitle: parsed.problemTitle,
            severity: parsed.severity || 'Tinggi',
            dataSources: parsed.dataSources || matchedScenario.dataSources,
            baselineDataEvidence: parsed.baselineDataEvidence || matchedScenario.baselineDataEvidence,
            fiveWhys: {
              why1: parsed.fiveWhys?.why1 || matchedScenario.fiveWhys.why1,
              why2: parsed.fiveWhys?.why2 || matchedScenario.fiveWhys.why2,
              why3: parsed.fiveWhys?.why3 || matchedScenario.fiveWhys.why3
            },
            rootCauses: {
              aspekMetodeGuru: parsed.rootCauses?.aspekMetodeGuru || matchedScenario.rootCauses.aspekMetodeGuru,
              aspekPerencanaanModul: parsed.rootCauses?.aspekPerencanaanModul || matchedScenario.rootCauses.aspekPerencanaanModul,
              aspekPengelolaanKelas: parsed.rootCauses?.aspekPengelolaanKelas || matchedScenario.rootCauses.aspekPengelolaanKelas,
              aspekKarakteristikMurid: parsed.rootCauses?.aspekKarakteristikMurid || matchedScenario.rootCauses.aspekKarakteristikMurid,
              aspekDayaDukung: parsed.rootCauses?.aspekDayaDukung || matchedScenario.rootCauses.aspekDayaDukung
            },
            recommendedIntervention: {
              supervisionAction: parsed.recommendedIntervention?.supervisionAction || matchedScenario.recommendedIntervention.supervisionAction,
              targetTimeline: parsed.recommendedIntervention?.targetTimeline || matchedScenario.recommendedIntervention.targetTimeline,
              actionDetails: Array.isArray(parsed.recommendedIntervention?.actionDetails)
                ? parsed.recommendedIntervention.actionDetails
                : matchedScenario.recommendedIntervention.actionDetails,
              linkedFeature: matchedScenario.recommendedIntervention.linkedFeature
            }
          };
        }
      }
    } catch (err) {
      console.warn('Gemini contextual diagnosis generator fallback:', err);
    }
  }

  // High-fidelity domain knowledge synthesizer fallback
  // Adapt matched scenario with teacher & subject
  const customEvidence = params.subject
    ? matchedScenario.baselineDataEvidence.replace(/matematika|bahasa indonesia|ipa/gi, params.subject)
    : matchedScenario.baselineDataEvidence;

  return {
    ...matchedScenario,
    baselineDataEvidence: customEvidence
  };
}

/**
 * Generate 3-Whys only based on problem title & subject
 */
export function generateFiveWhysOnly(
  problemTitle: string,
  category?: ContextualProblemCategory
): FiveWhysAnalysis {
  const scenario = CONTEXTUAL_SCENARIOS.find((s) => s.problemCategory === category) || CONTEXTUAL_SCENARIOS[0];

  const lower = (problemTitle || '').toLowerCase();
  if (lower.includes('waktu') || lower.includes('molor') || lower.includes('durasi')) {
    return CONTEXTUAL_SCENARIOS[3].fiveWhys;
  }
  if (lower.includes('chromebook') || lower.includes('digital') || lower.includes('gadget') || lower.includes('alat')) {
    return CONTEXTUAL_SCENARIOS[2].fiveWhys;
  }
  if (lower.includes('diferensiasi') || lower.includes('seragam') || lower.includes('tarl') || lower.includes('lambat')) {
    return CONTEXTUAL_SCENARIOS[1].fiveWhys;
  }
  if (lower.includes('hukum') || lower.includes('disiplin') || lower.includes('sanksi') || lower.includes('tertib')) {
    return CONTEXTUAL_SCENARIOS[4].fiveWhys;
  }
  if (lower.includes('kritis') || lower.includes('nalar') || lower.includes('baca') || lower.includes('hafalan')) {
    return CONTEXTUAL_SCENARIOS[5].fiveWhys;
  }

  return scenario.fiveWhys;
}

/**
 * Generate 5 Dimensions Root Causes only
 */
export function generateRootCausesOnly(
  problemTitle: string,
  category?: ContextualProblemCategory
): RootCauseAspect {
  const scenario = CONTEXTUAL_SCENARIOS.find((s) => s.problemCategory === category) || CONTEXTUAL_SCENARIOS[0];

  const lower = (problemTitle || '').toLowerCase();
  if (lower.includes('waktu') || lower.includes('molor') || lower.includes('durasi')) {
    return CONTEXTUAL_SCENARIOS[3].rootCauses;
  }
  if (lower.includes('chromebook') || lower.includes('digital') || lower.includes('gadget') || lower.includes('alat')) {
    return CONTEXTUAL_SCENARIOS[2].rootCauses;
  }
  if (lower.includes('diferensiasi') || lower.includes('seragam') || lower.includes('tarl') || lower.includes('lambat')) {
    return CONTEXTUAL_SCENARIOS[1].rootCauses;
  }
  if (lower.includes('hukum') || lower.includes('disiplin') || lower.includes('sanksi') || lower.includes('tertib')) {
    return CONTEXTUAL_SCENARIOS[4].rootCauses;
  }
  if (lower.includes('kritis') || lower.includes('nalar') || lower.includes('baca') || lower.includes('hafalan')) {
    return CONTEXTUAL_SCENARIOS[5].rootCauses;
  }

  return scenario.rootCauses;
}

/**
 * Generate recommended intervention solution only
 */
export function generateInterventionOnly(
  problemTitle: string,
  category?: ContextualProblemCategory
) {
  const scenario = CONTEXTUAL_SCENARIOS.find((s) => s.problemCategory === category) || CONTEXTUAL_SCENARIOS[0];
  const lower = (problemTitle || '').toLowerCase();

  if (lower.includes('waktu') || lower.includes('molor')) {
    return CONTEXTUAL_SCENARIOS[3].recommendedIntervention;
  }
  if (lower.includes('chromebook') || lower.includes('digital')) {
    return CONTEXTUAL_SCENARIOS[2].recommendedIntervention;
  }
  if (lower.includes('diferensiasi') || lower.includes('seragam')) {
    return CONTEXTUAL_SCENARIOS[1].recommendedIntervention;
  }
  if (lower.includes('hukum') || lower.includes('disiplin')) {
    return CONTEXTUAL_SCENARIOS[4].recommendedIntervention;
  }
  if (lower.includes('kritis') || lower.includes('nalar')) {
    return CONTEXTUAL_SCENARIOS[5].recommendedIntervention;
  }

  return scenario.recommendedIntervention;
}
