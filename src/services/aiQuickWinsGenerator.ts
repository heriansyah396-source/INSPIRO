/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import { QuickWinsActionItem, QuickWinsPhase } from '../types/inspiro';

export interface GeneratedQuickWinsPlan {
  title: string;
  beforeCondition: string;
  expectedImpact: string;
  supervisorNotes: string;
  items: Array<{
    phase: QuickWinsPhase;
    phaseTitle: string;
    week: string;
    actionTitle: string;
    actionDetail: string;
    pic: string;
    evidenceTarget: string;
  }>;
}

export interface QuickWinsGeneratorParams {
  schoolName: string;
  headmasterName: string;
  targetPillar: string;
  rpbStrategy?: string;
}

/**
 * AI Generator for Peta Langkah Nyata 30-60-90 Hari (Quick Wins Impact Tracker)
 * Powered by Gemini with rich local fallback tailored for Kabupaten Sidenreng Rappang
 */
export async function generateQuickWinsPlanAI(
  params: QuickWinsGeneratorParams
): Promise<GeneratedQuickWinsPlan> {
  const school = params.schoolName?.trim() || 'UPT Satuan Pendidikan Binaan';
  const headmaster = params.headmasterName?.trim() || 'Kepala Satuan Pendidikan';
  const pillar = params.targetPillar?.trim() || 'Pembelajaran Berdiferensiasi & Pemanfaatan Platform Digital (PMM/AI)';
  const strategy = params.rpbStrategy?.trim() || 'Pemacu Perubahan (Catalyst)';

  // 1. Try Gemini API
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process.env as any)?.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.length > 10) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Anda adalah Pengawas Sekolah Pembina transformatif di Dinas Pendidikan dan Kebudayaan Kabupaten Sidenreng Rappang, Sulawesi Selatan.
Berdasarkan filosofi pendampingan Perdirjen GTK No. 4831/2023, susunlah "Peta Langkah Nyata 30-60-90 Hari (Quick Wins Impact Tracker)" yang mengunci eksekusi di lapangan agar tidak mandek di dokumen.

Data Sekolah:
- Satuan Pendidikan: ${school}
- Kepala Sekolah: ${headmaster}
- Fokus Inovasi / Pilar Sasaran: ${pillar}
- Strategi Pendampingan RPB: ${strategy}

Kembalikan respon DALAM FORMAT JSON MURNI (tanpa markdown tambahan) dengan struktur:
{
  "title": "Peta Langkah Nyata 30-60-90 Hari: [Fokus Sasaran]",
  "beforeCondition": "[2-3 kalimat deskripsi fakta kondisi awal riil kelas/sekolah sebelum pendampingan, e.g. murid pasif, guru dominan ceramah satu arah, kombel belum berjalan rutin]",
  "expectedImpact": "[2-3 kalimat deskripsi dampak nyata yang dirasakan murid dan guru di hari ke-90, e.g. kelas aktif berdiferensiasi, portofolio karya murid terwujud, budaya refleksi mengakar]",
  "supervisorNotes": "[2-3 kalimat komitmen kawalan dan apresiasi Pengawas Pembina kepada kepala sekolah & guru]",
  "items": [
    {
      "phase": "30-days",
      "phaseTitle": "Fase 1 (Hari 1–30): Fondasi & Kemenangan Cepat (Quick Wins)",
      "week": "Minggu 1–2",
      "actionTitle": "[Judul Aksi Nyata Singkat]",
      "actionDetail": "[Langkah konkret apa yang dilakukan]",
      "pic": "[Pihak penanggung jawab, e.g. Guru Sasaran & Tim Kombel / Kepala Sekolah]",
      "evidenceTarget": "[Bukti nyata fisik/digital, e.g. Lembar Asesmen Awal, Modul Ajar]"
    },
    {
      "phase": "30-days",
      "phaseTitle": "Fase 1 (Hari 1–30): Fondasi & Kemenangan Cepat (Quick Wins)",
      "week": "Minggu 3–4",
      "actionTitle": "...",
      "actionDetail": "...",
      "pic": "...",
      "evidenceTarget": "..."
    },
    {
      "phase": "60-days",
      "phaseTitle": "Fase 2 (Hari 31–60): Eksperimen Kelas & Penguatan Berkelanjutan",
      "week": "Minggu 5–6",
      "actionTitle": "...",
      "actionDetail": "...",
      "pic": "...",
      "evidenceTarget": "..."
    },
    {
      "phase": "60-days",
      "phaseTitle": "Fase 2 (Hari 31–60): Eksperimen Kelas & Penguatan Berkelanjutan",
      "week": "Minggu 7–8",
      "actionTitle": "...",
      "actionDetail": "...",
      "pic": "...",
      "evidenceTarget": "..."
    },
    {
      "phase": "90-days",
      "phaseTitle": "Fase 3 (Hari 61–90): Pembudayaan, Pengimbasan & Bukti Dampak",
      "week": "Minggu 9–10",
      "actionTitle": "...",
      "actionDetail": "...",
      "pic": "...",
      "evidenceTarget": "..."
    },
    {
      "phase": "90-days",
      "phaseTitle": "Fase 3 (Hari 61–90): Pembudayaan, Pengimbasan & Bukti Dampak",
      "week": "Minggu 11–12",
      "actionTitle": "...",
      "actionDetail": "...",
      "pic": "...",
      "evidenceTarget": "..."
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });

      const text = response.text?.trim() || '';
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.items && Array.isArray(parsed.items) && parsed.items.length >= 3) {
          return {
            title: parsed.title || `Peta Langkah Nyata 30-60-90 Hari: ${pillar}`,
            beforeCondition: parsed.beforeCondition || `Kondisi awal di ${school} masih menghadapi tantangan pada ${pillar}.`,
            expectedImpact: parsed.expectedImpact || `Terwujudnya peningkatan partisipasi murid dan kemandirian guru di ${school}.`,
            supervisorNotes: parsed.supervisorNotes || `Pengawas Pembina siap mendampingi sebagai mitra dialog dan co-pilot transformasi.`,
            items: parsed.items
          };
        }
      }
    } catch (err) {
      console.warn('Gemini QuickWins generation fallback to contextual dataset:', err);
    }
  }

  // 2. High-Quality Contextual Fallback Tailored to Sidrap
  return getContextualFallbackPlan(school, headmaster, pillar, strategy);
}

function getContextualFallbackPlan(
  school: string,
  headmaster: string,
  pillar: string,
  strategy: string
): GeneratedQuickWinsPlan {
  const isLiterasi = pillar.toLowerCase().includes('literasi') || pillar.toLowerCase().includes('numerasi');
  const isKombel = pillar.toLowerCase().includes('kombel') || pillar.toLowerCase().includes('kolaborasi');
  const isIklim = pillar.toLowerCase().includes('iklim') || pillar.toLowerCase().includes('karakter');

  if (isLiterasi) {
    return {
      title: `Peta Langkah Nyata 30-60-90 Hari: Penguatan Literasi & Numerasi Kontekstual`,
      beforeCondition: `Hasil Rapor Pendidikan ${school} menunjukkan kompetensi literasi dan numerasi murid belum merata. Mayoritas guru masih menggunakan lembar kerja seragam dan belum memanfaatkan sudut baca kelas maupun lingkungan sekolah sebagai sumber stimulus belajar bermakna.`,
      expectedImpact: `Terwujudnya sudut baca aktif di setiap kelas, 100% guru menerapkan pembiasaan 15 menit membaca nyaring/terbimbing, dan murid kelompok dasar mengalami lonjakan pemahaman membaca sebesar minimal 30% pada akhir hari ke-90.`,
      supervisorNotes: `Fokus pendampingan Pengawas Pembina adalah memastikan guru tidak terbebani secara administratif. Pengawas akan mendampingi penyediaan bahan bacaan berjenjang dan observasi kelas berbasis apresiasi bersama ${headmaster}.`,
      items: [
        {
          phase: '30-days',
          phaseTitle: 'Fase 1 (Hari 1–30): Fondasi & Kemenangan Cepat (Quick Wins)',
          week: 'Minggu 1–2',
          actionTitle: 'Diagnosis Cepat Kesiapan Baca & Hitung Murid',
          actionDetail: 'Guru melakukan pemetaan sederhana kemampuan membaca dan numerasi dasar untuk mengelompokkan murid (perlu bimbingan, dasar, cakap) tanpa melabeli anak.',
          pic: 'Guru Sasaran & Tim Pengembang Kurikulum',
          evidenceTarget: 'Matriks Pemetaan Kesiapan Belajar Literasi-Numerasi per Jenjang Kelas'
        },
        {
          phase: '30-days',
          phaseTitle: 'Fase 1 (Hari 1–30): Fondasi & Kemenangan Cepat (Quick Wins)',
          week: 'Minggu 3–4',
          actionTitle: 'Aktivasi Sudut Baca Ramah Anak & Jam Literasi Nyaring',
          actionDetail: 'Menata pojok baca kelas dengan buku cerita bergambar kontekstual lokal dan memulai rutinitas 15 menit membaca nyaring (read-aloud) setiap pagi.',
          pic: 'Wali Kelas & Paguyuban Orang Tua Murid',
          evidenceTarget: 'Dokumentasi Foto Pojok Baca Kelas & Jurnal Membaca Murid'
        },
        {
          phase: '60-days',
          phaseTitle: 'Fase 2 (Hari 31–60): Eksperimen Kelas & Penguatan Berkelanjutan',
          week: 'Minggu 5–6',
          actionTitle: 'Penerapan Model Stasiun Literasi-Numerasi Berjenjang',
          actionDetail: 'Guru menguji coba 2 stasiun aktivitas di kelas: stasiun eksplorasi teks/manipulatif dan stasiun latihan mandiri bertingkat (LKPD berdiferensiasi).',
          pic: 'Guru Kelas & Pengawas Pembina (Co-Observation)',
          evidenceTarget: 'Modul Ajar Diferensiasi Literasi & Catatan Refleksi Pengawas'
        },
        {
          phase: '60-days',
          phaseTitle: 'Fase 2 (Hari 31–60): Eksperimen Kelas & Penguatan Berkelanjutan',
          week: 'Minggu 7–8',
          actionTitle: 'Refleksi Tengah Siklus di Komunitas Belajar Sekolah',
          actionDetail: 'Bedah pengalaman mengajar di Kombel: membedah apa yang berhasil pada murid berkemampuan lambat dan kendala apa yang butuh bantuan pengawas.',
          pic: 'Kepala Sekolah & Seluruh Dewan Guru',
          evidenceTarget: 'Notula Refleksi Kombel & Rencana Penyesuaian Strategi Kelas'
        },
        {
          phase: '90-days',
          phaseTitle: 'Fase 3 (Hari 61–90): Pembudayaan, Pengimbasan & Bukti Dampak',
          week: 'Minggu 9–10',
          actionTitle: 'Pameran Mini Karya Literasi Murid (Panggung Karya Anak)',
          actionDetail: 'Menampilkan buku lipat, komik sederhana, dan jurnal buatan murid di mading sekolah untuk menumbuhkan rasa percaya diri dan cinta karya.',
          pic: 'Tim Kesiswaan & Guru Pendamping',
          evidenceTarget: 'Portofolio Display Karya Murid & Testimoni Murid'
        },
        {
          phase: '90-days',
          phaseTitle: 'Fase 3 (Hari 61–90): Pembudayaan, Pengimbasan & Bukti Dampak',
          week: 'Minggu 11–12',
          actionTitle: 'Evaluasi Dampak 90 Hari & Berbagi ke Gugus/MGMP',
          actionDetail: 'Evaluasi ketercapaian sebelum vs sesudah 90 hari bersama Pengawas, dilanjutkan pengimbasan modul praktis ke sekolah mitra di Kabupaten Sidenreng Rappang.',
          pic: 'Kepala Sekolah, Guru Inti, & Pengawas Pembina',
          evidenceTarget: 'Laporan Evaluasi Dampak 90 Hari & Sertifikat/Dokumentasi Pengimbasan'
        }
      ]
    };
  }

  if (isKombel || isIklim) {
    return {
      title: `Peta Langkah Nyata 30-60-90 Hari: Aktivasi Kombel & Iklim Belajar Positif`,
      beforeCondition: `Komunitas Belajar di ${school} belum berjalan rutin dan masih bersifat seremonial. Sebagian guru merasa canggung berdiskusi terbuka tentang kesulitan mengajar di kelas karena khawatir dihakimi atau dinilai belum kompeten.`,
      expectedImpact: `Terciptanya ruang dialog aman mingguan di Kombel, 100% kelas menerapkan kesepakatan kelas positif bersama murid, serta terbangunnya budaya saling mengobservasi kelas antarguru secara kolegial dan bersahabat.`,
      supervisorNotes: `Pengawas Pembina berkomitmen hadir secara berkala di sesi Kombel sebagai mitra dialog (co-pilot), memfasilitasi teknik coaching Tirta agar forum berfokus pada solusi murid.`,
      items: [
        {
          phase: '30-days',
          phaseTitle: 'Fase 1 (Hari 1–30): Fondasi & Kemenangan Cepat (Quick Wins)',
          week: 'Minggu 1–2',
          actionTitle: 'Membangun Ruang Aman & Piagam Kesepakatan Kombel',
          actionDetail: 'Menyepakati jadwal rutin kombel 1 jam setiap Jumat dan menetapkan norma saling menghargai (*Sipakatau, Sipakalebbi*) tanpa hierarki senior-junior.',
          pic: 'Kepala Sekolah & Koordinator Kombel',
          evidenceTarget: 'Piagam Komitmen Kombel Sekolah & Jadwal Pertemuan Bulanan'
        },
        {
          phase: '30-days',
          phaseTitle: 'Fase 1 (Hari 1–30): Fondasi & Kemenangan Cepat (Quick Wins)',
          week: 'Minggu 3–4',
          actionTitle: 'Penyusunan Kesepakatan Kelas Partisipatif Bersama Murid',
          actionDetail: 'Setiap wali kelas memandu murid membuat 4-5 poin kesepakatan kelas positif yang disepakati bersama menggantikan aturan satu arah yang kaku.',
          pic: 'Seluruh Wali Kelas & Guru Mapel',
          evidenceTarget: 'Poster Kesepakatan Kelas Bertandatangan Seluruh Murid'
        },
        {
          phase: '60-days',
          phaseTitle: 'Fase 2 (Hari 31–60): Eksperimen Kelas & Penguatan Berkelanjutan',
          week: 'Minggu 5–6',
          actionTitle: 'Praktik Peer-Observation (Saling Kunjung Kelas Sahabat)',
          actionDetail: 'Dua orang guru berpasangan saling mengamati kelas selama 30 menit dengan fokus pada iklim positif dan umpan balik asertif antar-rekan sejawat.',
          pic: 'Pasangan Guru Mitra & Pengawas Pembina',
          evidenceTarget: 'Lembar Catatan Apresiasi Peer-Observation'
        },
        {
          phase: '60-days',
          phaseTitle: 'Fase 2 (Hari 31–60): Eksperimen Kelas & Penguatan Berkelanjutan',
          week: 'Minggu 7–8',
          actionTitle: 'Sesi Coaching Klinis Pengawas Bersama Kepala Sekolah',
          actionDetail: 'Pengawas dan Kepala Sekolah mendiskusikan kemajuan budaya sekolah dan memetakan dukungan fasilitas yang masih dibutuhkan guru di kelas.',
          pic: 'Kepala Sekolah & Pengawas Pembina',
          evidenceTarget: 'Jurnal Coaching Alur TIRTA Kepala Sekolah & Pengawas'
        },
        {
          phase: '90-days',
          phaseTitle: 'Fase 3 (Hari 61–90): Pembudayaan, Pengimbasan & Bukti Dampak',
          week: 'Minggu 9–10',
          actionTitle: 'Festival Kelas Positif & Apresiasi Suara Murid',
          actionDetail: 'Menggelar survei kebahagiaan belajar murid sederhana dan membagikan kartu bintang apresiasi bagi murid yang konsisten menjalankan kesepakatan kelas.',
          pic: 'Guru BK / Tim Disiplin Positif & Wali Kelas',
          evidenceTarget: 'Grafik Indeks Kepuasan Belajar Murid & Dokumentasi Apresiasi'
        },
        {
          phase: '90-days',
          phaseTitle: 'Fase 3 (Hari 61–90): Pembudayaan, Pengimbasan & Bukti Dampak',
          week: 'Minggu 11–12',
          actionTitle: 'Penerbitan Buku Panduan Praktik Baik Kombel Sekolah',
          actionDetail: 'Mendokumentasikan kumpulan strategi penyelesaian masalah di kelas menjadi buku mini praktik baik ${school} yang diakui Dinas Pendidikan Sidrap.',
          pic: 'Tim Humas/Publikasi Sekolah & Kepala Sekolah',
          evidenceTarget: 'E-Booklet Praktik Baik Kombel & Berita Acara Refleksi 90 Hari'
        }
      ]
    };
  }

  // Default: Pembelajaran Berdiferensiasi & Inovasi Digital
  return {
    title: `Peta Langkah Nyata 30-60-90 Hari: Pembelajaran Berdiferensiasi & Inovasi Digital`,
    beforeCondition: `Guru di ${school} masih dominan menggunakan metode ceramah satu arah dan LKPD seragam. Guru merasa terbebani waktu jika harus menyiapkan modul bertingkat, sementara sarana digital dan stimulus media interaktif belum dimanfaatkan secara optimal.`,
    expectedImpact: `Minimal 80% guru terbiasa menerapkan diferensiasi konten & proses di kelas, murid antusias belajar sesuai minat dan kesiapannya, serta terbangun bank modul ajar kolaboratif di Komunitas Belajar sekolah.`,
    supervisorNotes: `Strategi ${strategy}: Pengawas hadir sebagai mitra pengembang (co-creator) bersama ${headmaster}, bukan mencari kesalahan, melainkan mendampingi guru sampai modul dapat dieksekusi dengan ringan dan gembira.`,
    items: [
      {
        phase: '30-days',
        phaseTitle: 'Fase 1 (Hari 1–30): Fondasi & Kemenangan Cepat (Quick Wins)',
        week: 'Minggu 1–2',
        actionTitle: 'Pemetaan Gaya Belajar & Asesmen Awal Minat Murid',
        actionDetail: 'Guru membagikan kuesioner visual singkat atau lembar cek emotikon untuk mengetahui minat dan profil belajar murid sebelum menyusun rencana ajar.',
        pic: 'Guru Sasaran / Wali Kelas',
        evidenceTarget: 'Grafik Profil Belajar Murid & Lembar Asesmen Non-Kognitif'
      },
      {
        phase: '30-days',
        phaseTitle: 'Fase 1 (Hari 1–30): Fondasi & Kemenangan Cepat (Quick Wins)',
        week: 'Minggu 3–4',
        actionTitle: 'Penyusunan 1 Modul Berdiferensiasi Prototipe di Kombel',
        actionDetail: 'Bersama rekan sejawat di Kombel, guru merancang 1 modul ajar diferensiasi konten dengan stimulus teks berjenjang atau media Canva/video edukasi.',
        pic: 'Tim Kombel Sekolah & Guru Mata Pelajaran',
        evidenceTarget: 'Modul Ajar Diferensiasi Terverifikasi Kepala Sekolah'
      },
      {
        phase: '60-days',
        phaseTitle: 'Fase 2 (Hari 31–60): Eksperimen Kelas & Penguatan Berkelanjutan',
        week: 'Minggu 5–6',
        actionTitle: 'Uji Coba Model Stasiun Belajar (Rotasi Terbimbing)',
        actionDetail: 'Guru mempraktikkan modul di kelas dengan membagi murid ke dalam 3 stasiun: stasiun konsep dasar, stasiun studi kasus, dan stasiun kreasi digital.',
        pic: 'Guru Sasaran & Pengawas Pembina (Pendampingan Kelas)',
        evidenceTarget: 'Foto/Video Aktivitas Stasiun Belajar & Lembar Observasi'
      },
      {
        phase: '60-days',
        phaseTitle: 'Fase 2 (Hari 31–60): Eksperimen Kelas & Penguatan Berkelanjutan',
        week: 'Minggu 7–8',
        actionTitle: 'Klinik Supervisi Klinis Berbasis Umpan Balik Positif',
        actionDetail: 'Pertemuan pasca-observasi antara Pengawas, Kepala Sekolah, dan Guru untuk mengapresiasi keberanian mencoba dan mengatasi kendala waktu/LKPD.',
        pic: 'Pengawas Sekolah Pembina & Kepala Sekolah',
        evidenceTarget: 'Catatan Supervisi Klinis Ramah & Rencana Tindak Lanjut'
      },
      {
        phase: '90-days',
        phaseTitle: 'Fase 3 (Hari 61–90): Pembudayaan, Pengimbasan & Bukti Dampak',
        week: 'Minggu 9–10',
        actionTitle: 'Aktivasi Bank Modul Digital di Google Drive / PMM Sekolah',
        actionDetail: 'Mengumpulkan modul ajar berdiferensiasi yang telah diuji coba ke dalam folder drive bersama agar dapat diadaptasi guru jenjang lain.',
        pic: 'Tim Operator / Kurikulum & Dewan Guru',
        evidenceTarget: 'Tautan Bank Modul Ajar Sekolah & Bukti Akses Bersama'
      },
      {
        phase: '90-days',
        phaseTitle: 'Fase 3 (Hari 61–90): Pembudayaan, Pengimbasan & Bukti Dampak',
        week: 'Minggu 11–12',
        actionTitle: 'Gelar Karya Pembelajaran & Refleksi Dampak 90 Hari',
        actionDetail: 'Presentasi hasil karya murid kepada kepala sekolah dan pengawas, serta penetapan Rencana Aksi Siklus Berikutnya untuk menjaga kesinambungan.',
        pic: 'Kepala Sekolah, Seluruh Guru, & Pengawas Pembina',
        evidenceTarget: 'Laporan Komprehensif Dampak 90 Hari & Berita Acara Refleksi'
      }
    ]
  };
}
