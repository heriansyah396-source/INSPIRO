/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import { ManagerialDimensionId, MaturityLevelId } from '../types/inspiro';

export interface ManagerialDimensionDef {
  id: ManagerialDimensionId;
  code: string;
  nama: string;
  iconName: string;
  deskripsi: string;
  levels: {
    1: { title: string; desc: string };
    2: { title: string; desc: string };
    3: { title: string; desc: string };
    4: { title: string; desc: string };
  };
}

export const MANAGERIAL_DIMENSIONS: ManagerialDimensionDef[] = [
  {
    id: 'dimensi_pbd',
    code: 'D.1',
    nama: 'Perencanaan Berbasis Data (PBD) & Efektivitas RKAS/BOS',
    iconName: 'FileSpreadsheet',
    deskripsi: 'Kedewasaan tata kelola identifikasi akar masalah Rapor Pendidikan hingga integrasi konkret ke ARKAS/BOSP.',
    levels: {
      1: {
        title: 'Level 1: Rutinitas Administratif',
        desc: 'Penyusunan RKAS sebatas rutinitas administratif kepatuhan SPJ tanpa menganalisis capaian Rapor Pendidikan.'
      },
      2: {
        title: 'Level 2: Penyelarasan Terbimbing',
        desc: 'Mulai mengidentifikasi masalah prioritas Rapor Pendidikan, namun alokasi anggaran belum 100% tepat sasaran ke mutu belajar.'
      },
      3: {
        title: 'Level 3: PBD Mandiri & Akuntabel',
        desc: 'PBD terintegrasi penuh ke dalam RKAS/BOSP, anggaran dialokasikan terarah untuk membenahi literasi, numerasi, dan iklim belajar.'
      },
      4: {
        title: 'Level 4: Budaya Efektivitas Mutu Rujukan',
        desc: 'Tata kelola anggaran sangat transparan, adaptif, berbasis bukti dampak belajar murid, dan menjadi rujukan audit mutu sekolah lain.'
      }
    }
  },
  {
    id: 'dimensi_instruksional',
    code: 'D.2',
    nama: 'Kepemimpinan Pembelajaran & Komunitas Belajar (Kombel)',
    iconName: 'Users',
    deskripsi: 'Kemampuan kepala sekolah memimpin perbaikan pedagogis, supervisi kelas berkala, dan menggerakkan Kombel guru.',
    levels: {
      1: {
        title: 'Level 1: Supervisi Formalitas',
        desc: 'Supervisi kelas dilakukan setahun sekali sekadar mengisi berkas administratif; Kombel guru belum terbentuk atau pasif.'
      },
      2: {
        title: 'Level 2: Kombel Rutin Terbimbing',
        desc: 'Kombel mulai berkumpul rutin, namun diskusi masih berkutat pada informasi kedinasan dan belum mendalami asesmen kelas.'
      },
      3: {
        title: 'Level 3: Siklus Inkuiri & Diferensiasi',
        desc: 'Kombel aktif menganalisis hasil belajar murid, merancang modul ajar berdiferensiasi bersama, dan saling melakukan peer-observation.'
      },
      4: {
        title: 'Level 4: Episentrum Pengimbasan Praktik Baik',
        desc: 'Budaya inovasi pembelajaran mengakar kuat; guru tampil percaya diri berbagi praktik baik ke forum KKG/MGMP se-Kabupaten Sidrap.'
      }
    }
  },
  {
    id: 'dimensi_sarana_digital',
    code: 'D.3',
    nama: 'Pengelolaan Sarana & Pemanfaatan Digital (TIK/PMM)',
    iconName: 'Laptop',
    deskripsi: 'Optimalisasi perangkat TIK (Chromebook/PID/Laboratorium) dan pembiasaan platform digital dalam pembelajaran.',
    levels: {
      1: {
        title: 'Level 1: Akses Terbatas & Pasif',
        desc: 'Perangkat TIK jarang dikeluarkan dari lemari penyimpan; pemanfaatan PMM dan akun Belajar.id minim.'
      },
      2: {
        title: 'Level 2: Pemanfaatan Bergiliran',
        desc: 'Perangkat TIK mulai dijadwalkan secara bergiliran; sebagian guru mulai menyelesaikan topik pelatihan mandiri di PMM.'
      },
      3: {
        title: 'Level 3: Integrasi Aktif di Kelas',
        desc: 'Murid aktif hands-on menggunakan gawai/PID dalam belajar (Level SAMR Modification); sarana sekolah terpelihara rapi.'
      },
      4: {
        title: 'Level 4: Ekosistem Sekolah Cerdas (Smart School)',
        desc: 'Integrasi digital menyeluruh dari administrasi awan, portofolio digital murid, hingga pembuatan konten edukasi bermutu tinggi.'
      }
    }
  },
  {
    id: 'dimensi_iklim_karakter',
    code: 'D.4',
    nama: 'Iklim Keamanan, Inklusivitas & Disiplin Positif',
    iconName: 'ShieldCheck',
    deskripsi: 'Penciptaan lingkungan sekolah yang ramah anak, bebas dari kekerasan, toleran, dan menerapkan keyakinan kelas.',
    levels: {
      1: {
        title: 'Level 1: Penegakan Hukuman Konvensional',
        desc: 'Aturan sekolah bersifat melarang dan sanksi hukuman masih diterapkan; TPPK belum aktif bekerja.'
      },
      2: {
        title: 'Level 2: Sosialisasi Pencegahan',
        desc: 'TPPK terbentuk dan tersosialisasi; sekolah mulai melatih guru menerapkan disiplin positif meski belum seragam.'
      },
      3: {
        title: 'Level 3: Disiplin Positif Membudaya',
        desc: 'Keyakinan kelas berjalan konsisten; suasana sekolah aman, inklusif bagi semua anak, dan bebas dari kasus perundungan.'
      },
      4: {
        title: 'Level 4: Model Sekolah Ramah Anak Percontohan',
        desc: 'Tercipta kepemimpinan murid (student agency) yang kuat; iklim kebinekaan dan karakter profil pelajar pancasila terwujud nyata.'
      }
    }
  },
  {
    id: 'dimensi_kemitraan',
    code: 'D.5',
    nama: 'Kemitraan Strategis Orang Tua & Ekosistem Komunitas',
    iconName: 'HeartHandshake',
    deskripsi: 'Kolaborasi bermakna dengan komite sekolah, paguyuban orang tua murid, tokoh masyarakat, dan mitra eksternal.',
    levels: {
      1: {
        title: 'Level 1: Keterlibatan Transaksional',
        desc: 'Orang tua dan komite hanya diundang saat rapat tahunan pembagian rapor atau musyawarah bantuan sumbangan.'
      },
      2: {
        title: 'Level 2: Partisipasi Kegiatan Insidental',
        desc: 'Komite dan orang tua mulai dilibatkan dalam kegiatan gotong royong, peringatan hari besar, dan pentas seni sekolah.'
      },
      3: {
        title: 'Level 3: Kemitraan Pembelajaran Aktif',
        desc: 'Terbentuk paguyuban kelas yang aktif mendukung kelas inspirasi orang tua dan forum dialog berkala capaian belajar anak.'
      },
      4: {
        title: 'Level 4: Jejaring Ekosistem Pendidikan Berdaya',
        desc: 'Kolaborasi pentahelix kokoh dengan tokoh masyarakat, dunia usaha, dinas terkait, dan alumni untuk kemajuan mutu murid.'
      }
    }
  }
];

export interface MaturityLevelDetails {
  id: MaturityLevelId;
  label: string;
  badgeTitle: string;
  colorClass: string;
  accentBorder: string;
  description: string;
  icon: string;
  minScore: number;
  maxScore: number;
}

export const MATURITY_LEVELS: Record<MaturityLevelId, MaturityLevelDetails> = {
  inisiasi: {
    id: 'inisiasi',
    label: 'Level 1: Tahap Inisiasi (Administratif & Kepatuhan Rutin)',
    badgeTitle: 'Tahap Inisiasi',
    colorClass: 'bg-amber-100 text-amber-900 border-amber-300',
    accentBorder: 'border-l-amber-500',
    description: 'Manajerial sekolah masih berorientasi pada kepatuhan aturan formal, administrasi SPJ, dan rutinitas harian dasar.',
    icon: 'Compass',
    minScore: 1.0,
    maxScore: 1.75
  },
  berkembang: {
    id: 'berkembang',
    label: 'Level 2: Tahap Berkembang (Kolaboratif Terbimbing)',
    badgeTitle: 'Tahap Berkembang',
    colorClass: 'bg-blue-100 text-blue-900 border-blue-300',
    accentBorder: 'border-l-blue-500',
    description: 'Sekolah mulai membuka ruang dialog melalui Kombel, menelaah Rapor Pendidikan, dan menerima inovasi secara bertahap.',
    icon: 'TrendingUp',
    minScore: 1.76,
    maxScore: 2.5
  },
  berdaya: {
    id: 'berdaya',
    label: 'Level 3: Tahap Berdaya (Mandiri & Terpadu)',
    badgeTitle: 'Tahap Berdaya',
    colorClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    accentBorder: 'border-l-emerald-500',
    description: 'Kepala sekolah memiliki kepemimpinan instruksional mandiri, PBD terintegrasi ke RKAS, dan murid menjadi pusat pembelajaran.',
    icon: 'Award',
    minScore: 2.51,
    maxScore: 3.25
  },
  mahir: {
    id: 'mahir',
    label: 'Level 4: Tahap Mahir (Episentrum Rujukan & Pengimbasan)',
    badgeTitle: 'Tahap Mahir',
    colorClass: 'bg-purple-100 text-purple-900 border-purple-300',
    accentBorder: 'border-l-purple-500',
    description: 'Sekolah tampil sebagai episentrum rujukan mutu tingkat kabupaten dan aktif mengimbaskan praktik baik kepemimpinan ke sekolah lain.',
    icon: 'Crown',
    minScore: 3.26,
    maxScore: 4.0
  }
};

export function calculateMaturityPosition(scores: {
  dimensi_pbd: number;
  dimensi_instruksional: number;
  dimensi_sarana_digital: number;
  dimensi_iklim_karakter: number;
  dimensi_kemitraan: number;
}): {
  averageScore: number;
  overallLevel: MaturityLevelId;
  overallLevelLabel: string;
  percentage: number;
} {
  const sum =
    scores.dimensi_pbd +
    scores.dimensi_instruksional +
    scores.dimensi_sarana_digital +
    scores.dimensi_iklim_karakter +
    scores.dimensi_kemitraan;
  const avg = Number((sum / 5).toFixed(2));
  const percentage = Math.round((avg / 4) * 100);

  let overallLevel: MaturityLevelId = 'inisiasi';
  if (avg >= 3.26) overallLevel = 'mahir';
  else if (avg >= 2.51) overallLevel = 'berdaya';
  else if (avg >= 1.76) overallLevel = 'berkembang';
  else overallLevel = 'inisiasi';

  return {
    averageScore: avg,
    overallLevel,
    overallLevelLabel: MATURITY_LEVELS[overallLevel].label,
    percentage
  };
}

export interface MaturityAIAnalysisResult {
  strengthSummary: string;
  growthAreaSummary: string;
  aiActionRoadmap: string[];
  supervisorFeedback: string;
}

/**
 * Generates an in-depth AI diagnosis for "Posisi Mana Saya Sekarang?"
 */
export async function generateMaturityAIAnalysis(params: {
  schoolName: string;
  headmasterName: string;
  scores: {
    dimensi_pbd: number;
    dimensi_instruksional: number;
    dimensi_sarana_digital: number;
    dimensi_iklim_karakter: number;
    dimensi_kemitraan: number;
  };
  dimensionNotes?: Record<string, string>;
}): Promise<MaturityAIAnalysisResult> {
  const { averageScore, overallLevel, overallLevelLabel } = calculateMaturityPosition(params.scores);
  const school = params.schoolName || 'Satuan Pendidikan';
  const headmaster = params.headmasterName || 'Kepala Sekolah';

  // 1. Try Gemini API
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process.env as any)?.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.length > 10) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Anda adalah seorang Pengawas Sekolah Pembina Ahli di Dinas Pendidikan dan Kebudayaan Kabupaten Sidenreng Rappang.
Lakukan analisis diagnosis kepemimpinan manajerial kepala sekolah "Posisi Mana Saya Sekarang?" berdasarkan Permendikbudristek No. 40/2021 dan Model Kompetensi Kepala Sekolah.

Data Satuan Pendidikan:
- Nama Sekolah: ${school}
- Kepala Sekolah: ${headmaster}
- Nilai Dimensi 1 (PBD & RKAS): ${params.scores.dimensi_pbd}/4
- Nilai Dimensi 2 (Kepemimpinan Instruksional & Kombel): ${params.scores.dimensi_instruksional}/4
- Nilai Dimensi 3 (Sarana & Digitalisasi PMM): ${params.scores.dimensi_sarana_digital}/4
- Nilai Dimensi 4 (Iklim Keamanan & Disiplin Positif): ${params.scores.dimensi_iklim_karakter}/4
- Nilai Dimensi 5 (Kemitraan Orang Tua & Komite): ${params.scores.dimensi_kemitraan}/4
- Rata-rata Skor: ${averageScore}/4.00
- Posisi Level Kedewasaan: ${overallLevelLabel}

Kembalikan format JSON valid persis seperti berikut:
{
  "strengthSummary": "Paragraf ringkas 2-3 kalimat yang mengapresiasi pilar kekuatan utama manajerial kepala sekolah",
  "growthAreaSummary": "Paragraf ringkas 2-3 kalimat yang membedah titik rawan/kelemahan kritis yang paling mendesak dibenahi",
  "aiActionRoadmap": [
    "Langkah 1 konkret dan operasional dalam 30 hari ke depan",
    "Langkah 2 penguatan Kombel/guru dalam 60 hari",
    "Langkah 3 integrasi mutu & kemitraan dalam 90-180 hari"
  ],
  "supervisorFeedback": "Kalimat motivasi dan rekomendasi pengawas sekolah pembina untuk memacu kepala sekolah naik kelas"
}
Kembalikan HANYA JSON tanpa markdown atau penjelasan luar.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (parsed.strengthSummary && parsed.growthAreaSummary && Array.isArray(parsed.aiActionRoadmap)) {
          return {
            strengthSummary: parsed.strengthSummary,
            growthAreaSummary: parsed.growthAreaSummary,
            aiActionRoadmap: parsed.aiActionRoadmap,
            supervisorFeedback: parsed.supervisorFeedback || 'Terus pertahankan komitmen kepemimpinan transformatif demi hak belajar terbaik bagi seluruh murid di Kabupaten Sidenreng Rappang.'
          };
        }
      }
    } catch (e) {
      console.warn('Gemini Maturity Analysis fallback:', e);
    }
  }

  // 2. High-Precision Domain Knowledge Fallback Synthesizer
  const dimensionTitles: Record<ManagerialDimensionId, string> = {
    dimensi_pbd: 'Perencanaan Berbasis Data & RKAS',
    dimensi_instruksional: 'Kepemimpinan Pembelajaran & Kombel',
    dimensi_sarana_digital: 'Pengelolaan Sarana & Digitalisasi',
    dimensi_iklim_karakter: 'Iklim Aman & Disiplin Positif',
    dimensi_kemitraan: 'Kemitraan Orang Tua & Komite'
  };

  const sortedDimensions = Object.entries(params.scores).sort((a, b) => b[1] - a[1]) as [ManagerialDimensionId, number][];
  const strongest = sortedDimensions[0];
  const weakest = sortedDimensions[sortedDimensions.length - 1];

  let strengthSummary = '';
  let growthAreaSummary = '';
  let aiActionRoadmap: string[] = [];
  let supervisorFeedback = '';

  if (overallLevel === 'mahir') {
    strengthSummary = `${headmaster} telah menunjukkan kepemimpinan manajerial yang matang dan visioner di ${school}, khususnya pada dimensi ${dimensionTitles[strongest[0]]} (Skor ${strongest[1]}/4). Budaya kolaborasi pendidik mengakar kuat dan sekolah telah siap menjadi episentrum pengimbasan mutu bagi sekolah lain.`;
    growthAreaSummary = `Meskipun berada di Level 4 (Mahir), penyempurnaan berkelanjutan tetap diperlukan pada ${dimensionTitles[weakest[0]]} (Skor ${weakest[1]}/4) untuk memastikan inovasi sekolah tidak berhenti pada rutinitas melainkan terus terdokumentasi dalam portofolio praktik baik.`;
    aiActionRoadmap = [
      'Menyusun modul diseminasi praktik baik kepemimpinan sekolah untuk dipresentasikan di forum MKKS/KKKS Kabupaten Sidenreng Rappang.',
      'Memfasilitasi guru-guru penggerak sekolah menjadi narasumber berbagi praktik baik di Platform Merdeka Mengajar (PMM).',
      'Mengembangkan riset aksi manajerial berbasis bukti dampak belajar murid untuk menjaga keberlanjutan status sekolah rujukan mutu.'
    ];
    supervisorFeedback = `Apresiasi tinggi atas dedikasi dan konsistensi ${headmaster}. Sekolah ini merupakan aset keteladanan manajerial bagi Kabupaten Sidenreng Rappang.`;
  } else if (overallLevel === 'berdaya') {
    strengthSummary = `Kepemimpinan ${headmaster} di ${school} berada pada Tahap Berdaya yang solid, didukung kekuatan menonjol pada ${dimensionTitles[strongest[0]]} (Skor ${strongest[1]}/4). PBD dan iklim kerja warga sekolah telah mengarah positif pada peningkatan mutu pembelajaran murid.`;
    growthAreaSummary = `Titik ungkit perbaikan mendesak terdapat pada ${dimensionTitles[weakest[0]]} (Skor ${weakest[1]}/4). Perlu akselerasi penguatan agar komitmen yang telah terbangun dapat terkonversi menjadi lompatan ke Level Mahir.`;
    aiActionRoadmap = [
      `Mengadakan sesi audit klinis internal bersama Tim Pengembang Sekolah guna menuntaskan kesenjangan pada ${dimensionTitles[weakest[0]]}.`,
      'Mendorong optimalisasi siklus inkuiri di Komunitas Belajar (Kombel) agar setiap guru aktif melakukan refleksi berbasis asesmen kelas.',
      'Memperluas kemitraan pembelajaran dengan paguyuban orang tua murid melalui gelar karya murid (Student-Led Conference).'
    ];
    supervisorFeedback = `Pertahankan ritme kepemimpinan yang sudah mandiri ini. Dengan sedikit pembenahan terfokus pada ${dimensionTitles[weakest[0]]}, sekolah ini akan segera melompat ke Level Mahir.`;
  } else if (overallLevel === 'berkembang') {
    strengthSummary = `${headmaster} dan dewan guru di ${school} telah menunjukkan iktikad perubahan yang baik, di mana ${dimensionTitles[strongest[0]]} (Skor ${strongest[1]}/4) menjadi modal awal yang potensial untuk dikembangkan.`;
    growthAreaSummary = `Sekolah masih berada pada Tahap Berkembang karena menghadapi kendala teknis pada ${dimensionTitles[weakest[0]]} (Skor ${weakest[1]}/4). Diperlukan bimbingan terstruktur dan pendampingan bertahap dari pengawas sekolah pembina.`;
    aiActionRoadmap = [
      `Fasilitasi bimtek terstruktur pembenahan ${dimensionTitles[weakest[0]]} bersama Pengawas Pembina dan bendahara/tim inti sekolah.`,
      'Menghidupkan pertemuan Komunitas Belajar (Kombel) minimal 2 kali sebulan dengan agenda telaah indikator prioritas Rapor Pendidikan.',
      'Menerapkan pendampingan sebaya (peer mentoring) antar-guru untuk mempercepat adopsi perangkat ajar dan media digital.'
    ];
    supervisorFeedback = `Komitmen kepala sekolah sangat kami hargai. Mari fokus pada 1-2 prioritas perbaikan utama agar energi dewan guru terarah dan tidak terbebani secara berlebihan.`;
  } else {
    // inisiasi
    strengthSummary = `${school} memiliki potensi dasar yang dapat dibenahi, dengan modal awal pada ${dimensionTitles[strongest[0]]} (Skor ${strongest[1]}/4) sebagai pijakan restrukturisasi tata kelola dasar sekolah.`;
    growthAreaSummary = `Satuan pendidikan berada pada Tahap Inisiasi yang menuntut pendampingan intensif dari pengawas sekolah. Aspek ${dimensionTitles[weakest[0]]} (Skor ${weakest[1]}/4) dan tata kelola regulasi memerlukan pembenahan mendasar segera.`;
    aiActionRoadmap = [
      'Restrukturisasi tata kelola administrasi dasar sekolah, pembagian tugas guru yang adil, dan penegakan disiplin kehadiran kerja.',
      'Bimbingan teknis intensif langsung penyelarasan Rencana Kegiatan Anggaran Sekolah (RKAS) dengan rapor pendidikan.',
      'Sosialisasi pencegahan kekerasan sekolah dan pembentukan keyakinan kelas untuk menjamin keamanan murid belajar.'
    ];
    supervisorFeedback = `Pengawas sekolah siap memberikan pendampingan intensif secara langsung agar ${headmaster} dan dewan guru mampu keluar dari zona inisiasi menuju kemandirian.`;
  }

  return {
    strengthSummary,
    growthAreaSummary,
    aiActionRoadmap,
    supervisorFeedback
  };
}
