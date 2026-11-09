/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import { RPBItem, RPBMethod, RPBQuadrant, RPBStage, RPBStrategy } from '../types/inspiro';

export interface GeneratedRPBPlan {
  quadrant: RPBQuadrant;
  strategy: RPBStrategy;
  baselineDiagnosis: string;
  generalObjective: string;
  supervisorNotes: string;
  items: Array<{
    tahap: RPBStage;
    fokusAspek: string;
    metode: RPBMethod;
    aktivitasUtama: string;
    targetOutput: string;
    linimasa: string;
    pihakTerlibat: string;
    indikatorKeberhasilan: string;
  }>;
}

export function determineQuadrantAndStrategy(
  capacity: 'Tinggi' | 'Sedang' | 'Rendah',
  commitment: 'Tinggi' | 'Sedang' | 'Rendah'
): { quadrant: RPBQuadrant; strategy: RPBStrategy } {
  if ((capacity === 'Tinggi' || capacity === 'Sedang') && commitment === 'Tinggi') {
    return {
      quadrant: 'Kuadran I: Mandiri (Kapasitas Tinggi, Komitmen Tinggi)',
      strategy: 'Pemacu Perubahan (Catalyst)'
    };
  }
  if (capacity === 'Rendah' && commitment === 'Tinggi') {
    return {
      quadrant: 'Kuadran II: Berdaya (Kapasitas Rendah, Komitmen Tinggi)',
      strategy: 'Penguat Perubahan (Booster)'
    };
  }
  if (capacity === 'Tinggi' && (commitment === 'Rendah' || commitment === 'Sedang')) {
    return {
      quadrant: 'Kuadran III: Statis (Kapasitas Tinggi, Komitmen Rendah)',
      strategy: 'Pemicu Perubahan (Trigger)'
    };
  }
  return {
    quadrant: 'Kuadran IV: Perlu Intervensi Khusus (Kapasitas Rendah, Komitmen Rendah)',
    strategy: 'Pendampingan Intensif (Intervensi Langsung)'
  };
}

export async function generateRPBPlanAI(params: {
  schoolName: string;
  headmasterName: string;
  capacity: 'Tinggi' | 'Sedang' | 'Rendah';
  commitment: 'Tinggi' | 'Sedang' | 'Rendah';
  raporPriorities?: string[];
  focusNotes?: string;
}): Promise<GeneratedRPBPlan> {
  const { quadrant, strategy } = determineQuadrantAndStrategy(params.capacity, params.commitment);
  const prioritiesText = params.raporPriorities?.join(', ') || 'D.1 Kualitas Pembelajaran, A.1 Literasi, A.2 Numerasi';

  // 1. Try Gemini API if key is present
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process.env as any)?.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.length > 10) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Anda adalah seorang Pengawas Sekolah Pembina Ahli di Dinas Pendidikan dan Kebudayaan Kabupaten Sidenreng Rappang yang menyusun Rencana Pendampingan Berdiferensiasi (RPB) berdasarkan Perdirjen GTK No. 4831/B/HK.03.01/2023.
Satuan Pendidikan: ${params.schoolName}
Kepala Sekolah: ${params.headmasterName}
Tingkat Kapasitas Kepemimpinan: ${params.capacity}
Tingkat Komitmen Perubahan: ${params.commitment}
Kuadran Terpetakan: ${quadrant}
Strategi Utama: ${strategy}
Prioritas Rapor Pendidikan: ${prioritiesText}
Catatan Tambahan: ${params.focusNotes || '-'}

Buatlah rancangan Rencana Pendampingan Berdiferensiasi (RPB) dalam format JSON valid:
{
  "baselineDiagnosis": "Paragraf ringkas diagnosis kondisi awal satuan pendidikan",
  "generalObjective": "Tujuan umum pendampingan",
  "supervisorNotes": "Catatan reflektif pengawas pembina",
  "items": [
    {
      "tahap": "Perencanaan Program" (atau "Pelaksanaan Program" atau "Evaluasi & Refleksi"),
      "fokusAspek": "Uraian fokus sasaran program",
      "metode": "Coaching" (atau "Mentoring" atau "Fasilitasi" atau "Pelatihan" atau "Konsultasi"),
      "aktivitasUtama": "Langkah konkret intervensi pengawas dan kepala sekolah",
      "targetOutput": "Bukti karya atau artefak keluaran",
      "linimasa": "Jadwal pelaksanaan",
      "pihakTerlibat": "Pihak terkait",
      "indikatorKeberhasilan": "Ukuran ketercapaian"
    }
  ]
}
Sediakan minimal 4 item yang mencakup tahap Perencanaan, Pelaksanaan (2 item), dan Evaluasi & Refleksi.
Kembalikan HANYA format JSON valid tanpa markdown tambahan.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (parsed.baselineDiagnosis && parsed.items && parsed.items.length > 0) {
          return {
            quadrant,
            strategy,
            baselineDiagnosis: parsed.baselineDiagnosis,
            generalObjective: parsed.generalObjective || 'Meningkatkan mutu pembelajaran dan kapasitas instruksional sekolah.',
            supervisorNotes: parsed.supervisorNotes || 'Pendampingan berdiferensiasi dirancang untuk menjawab kebutuhan riil satuan pendidikan.',
            items: parsed.items
          };
        }
      }
    } catch (e) {
      console.warn('Gemini API call for RPB failed, falling back to expert knowledge engine:', e);
    }
  }

  // 2. High-Fidelity Domain Knowledge Synthesizer based on Perdirjen 4831/2023
  if (strategy === 'Pemacu Perubahan (Catalyst)') {
    return {
      quadrant,
      strategy,
      baselineDiagnosis: `Satuan pendidikan ${params.schoolName} di bawah kepemimpinan ${params.headmasterName} memiliki kapasitas kepemimpinan instruksional tinggi dan komitmen perubahan yang sangat kokoh. Komunitas belajar internal telah membudaya, pemanfaatan PMM dan literasi digital berjalan aktif, serta Rapor Pendidikan berada pada zona capaian membanggakan.`,
      generalObjective: `Memacu akselerasi inovasi pembelajaran berpusat pada murid (deep learning), memperluas otonomi kepemimpinan instruksional sekolah, serta memperkuat peran satuan pendidikan sebagai episentrum pengimbasan praktik baik di Kabupaten Sidenreng Rappang.`,
      supervisorNotes: `Metode dominan yang digunakan adalah Coaching dialogis dan Kemitraan strategis. Pengawas bertindak sebagai mitra setara (thought partner) untuk menantang ide-ide terobosan baru.`,
      items: [
        {
          tahap: 'Perencanaan Program',
          fokusAspek: 'Co-Design Rencana Aksi Inovasi Pembelajaran Abad-21 & Numerasi Berbasis Data',
          metode: 'Coaching',
          aktivitasUtama: 'Dialog mendalam alur TIRTA untuk membedah potensi unggulan sekolah dan merancang kurikulum berbasis proyek interdisipliner.',
          targetOutput: 'Rancangan kurikulum intrakurikuler dan kokurikuler inovatif berorientasi masa depan.',
          linimasa: 'Bulan ke-1 Semester Ganjil',
          pihakTerlibat: 'Pengawas Pembina, Kepala Sekolah, Koordinator Kurikulum',
          indikatorKeberhasilan: 'Terintegrasinya inovasi HOTS dan pemanfaatan digital di modul ajar semua mata pelajaran.'
        },
        {
          tahap: 'Pelaksanaan Program',
          fokusAspek: 'Optimalisasi Agensi Murid (Student Agency) & Portofolio Digital',
          metode: 'Fasilitasi',
          aktivitasUtama: 'Memfasilitasi forum gelar karya dan Student-Led Conference di mana murid mempresentasikan perkembangan belajarnya ke orang tua.',
          targetOutput: 'Dokumentasi pameran karya murid dan bank portofolio digital.',
          linimasa: 'Bulan ke-2 & ke-3',
          pihakTerlibat: 'Pengawas, Kepala Sekolah, Dewan Guru, Paguyuban Orang Tua Murid',
          indikatorKeberhasilan: 'Tingkat keterlibatan mandiri murid mencapai >85% dalam pameran karya.'
        },
        {
          tahap: 'Pelaksanaan Program',
          fokusAspek: 'Program Pengimbasan Praktik Baik ke Sekolah Sekitar di Sidrap',
          metode: 'Fasilitasi',
          aktivitasUtama: 'Mendorong pendidik pionir sekolah menjadi narasumber berbagi praktik baik di forum KKG/MGMP gugus/rayon.',
          targetOutput: 'Jadwal dan modul diseminasi praktik baik antar-satuan pendidikan.',
          linimasa: 'Bulan ke-4',
          pihakTerlibat: 'Pengawas Pembina, Guru Penggerak, Pengurus MGMP/KKG',
          indikatorKeberhasilan: 'Minimal 2 sekolah imbas mereplikasi model pembelajaran berdiferensiasi sekolah.'
        },
        {
          tahap: 'Evaluasi & Refleksi',
          fokusAspek: 'Evaluasi Kinerja Mutu Berkelanjutan & Refleksi Dampak',
          metode: 'Konsultasi',
          aktivitasUtama: 'Analisis reflektif data perkembangan belajar murid dan penyusunan rekomendasi pengembangan program tahun berikutnya.',
          targetOutput: 'Laporan refleksi kepemimpinan instruksional dan rekam jejak praktik baik terpublikasi.',
          linimasa: 'Bulan ke-5 Semester Berjalan',
          pihakTerlibat: 'Pengawas Pembina, Kepala Sekolah',
          indikatorKeberhasilan: 'Tercapainya seluruh target RPB dengan skor evaluasi kepemimpinan Amat Baik.'
        }
      ]
    };
  }

  if (strategy === 'Penguat Perubahan (Booster)') {
    return {
      quadrant,
      strategy,
      baselineDiagnosis: `Kepala sekolah ${params.headmasterName} dan dewan guru di ${params.schoolName} memiliki motivasi moral dan komitmen perubahan yang tinggi, namun masih menghadapi keterbatasan dalam kapasitas teknis tata kelola perencanaan berbasis data (PBD) dan keterampilan praktis diferensiasi pembelajaran di kelas.`,
      generalObjective: `Memberikan penguatan kapasitas melalui bimbingan teknis (mentoring) dan fasilitasi terstruktur di Komunitas Belajar (Kombel) agar sekolah mampu mengonversi komitmen tinggi menjadi capaian nyata Rapor Pendidikan.`,
      supervisorNotes: `Gunakan metode Mentoring dan Fasilitasi percontohan (scaffolding). Berikan template yang jelas dan pendampingan bertahap tanpa membebani administrasi guru.`,
      items: [
        {
          tahap: 'Perencanaan Program',
          fokusAspek: 'Bimbingan Teknis Penyelarasan PBD Rapor Pendidikan dengan Rencana Kegiatan Anggaran Sekolah (RKAS)',
          metode: 'Mentoring',
          aktivitasUtama: 'Mendampingi Kepala Sekolah dan bendahara mengidentifikasi akar masalah Rapor Pendidikan dan memilih menu benahi yang tepat di ARKAS.',
          targetOutput: 'Dokumen RKAS yang 100% selaras dengan prioritas pembenahan literasi dan iklim belajar.',
          linimasa: 'Bulan ke-1',
          pihakTerlibat: 'Pengawas Pembina, Kepala Sekolah, Tim BOS/ARKAS',
          indikatorKeberhasilan: 'Seluruh alokasi anggaran tepat sasaran pada peningkatan mutu instruksional.'
        },
        {
          tahap: 'Pelaksanaan Program',
          fokusAspek: 'Pendampingan Aktivasi Komunitas Belajar (Kombel) Guru Ramah Diferensiasi',
          metode: 'Fasilitasi',
          aktivitasUtama: 'Memfasilitasi sesi simulasi co-planning penyusunan modul ajar berdiferensiasi dan asesmen formatif bertingkat.',
          targetOutput: 'Kumpulan modul ajar berdiferensiasi siap terap untuk seluruh guru kelas/mata pelajaran.',
          linimasa: 'Bulan ke-2 & ke-3 (Rutin 2x sebulan)',
          pihakTerlibat: 'Pengawas, Kepala Sekolah, Seluruh Pendidik',
          indikatorKeberhasilan: 'Pendidik mampu mempraktikkan diferensiasi konten dan proses secara natural di kelas.'
        },
        {
          tahap: 'Pelaksanaan Program',
          fokusAspek: 'Optimalisasi Perangkat TIK (PID & Chromebook) dalam Pembelajaran',
          metode: 'Pelatihan',
          aktivitasUtama: 'Bimtek klinis pemanfaatan Papan Interaktif Digital dan Chromebook dengan penunjukan pendamping sebaya (peer tutor).',
          targetOutput: 'SOP pengoperasian perangkat TIK kelas dan bank media interaktif offline.',
          linimasa: 'Bulan ke-3',
          pihakTerlibat: 'Pengawas, Guru IT, Guru Senior, Kepala Sekolah',
          indikatorKeberhasilan: 'Rasio durasi murid hands-on memegang gawai/PID meningkat di atas 60%.'
        },
        {
          tahap: 'Evaluasi & Refleksi',
          fokusAspek: 'Refleksi Klinis Hasil Supervisi & Pengukuran Progres Siklus I',
          metode: 'Coaching',
          aktivitasUtama: 'Sesi coaching alur TIRTA bersama Kepala Sekolah untuk mengevaluasi progres pemenuhan indikator observasi kelas dan 8 SNP.',
          targetOutput: 'Matriks tindak lanjut mandiri kepala sekolah untuk siklus pendampingan berikutnya.',
          linimasa: 'Bulan ke-5',
          pihakTerlibat: 'Pengawas Pembina, Kepala Sekolah',
          indikatorKeberhasilan: 'Peningkatan skor rata-rata observasi kelas pendidik minimal 1 tingkat predikat.'
        }
      ]
    };
  }

  if (strategy === 'Pemicu Perubahan (Trigger)') {
    return {
      quadrant,
      strategy,
      baselineDiagnosis: `Satuan pendidikan ${params.schoolName} memiliki modal sarana dan kapasitas pendidik yang memadai, namun cenderung berada di zona nyaman (statis) dengan komitmen inovasi yang masih rendah. Guru terbiasa mengulang rutinitas lama tanpa ada dorongan eksplorasi terobosan baru.`,
      generalObjective: `Memberikan stimulasi tantangan baru (triggering challenge), dialog kritis reflektif, dan pemaparan komparasi mutu agar membangkitkan kesadaran urgensi transformasi bagi murid.`,
      supervisorNotes: `Gunakan metode Konsultasi Kritis dan Coaching Provokatif Terarah. Ajak dewan guru menelaah kesenjangan antara potensi sumber daya yang dimiliki dengan capaian riil murid di lapangan.`,
      items: [
        {
          tahap: 'Perencanaan Program',
          fokusAspek: 'Diskusi Reflektif Akar Masalah & Audit Realitas Rapor Pendidikan',
          metode: 'Konsultasi',
          aktivitasUtama: 'Pemaparan data komparasi mutu sekolah dengan standar kabupaten untuk memicu kesadaran urgensi pembenahan iklim belajar.',
          targetOutput: 'Lembar komitmen bersama dewan guru untuk keluar dari zona nyaman.',
          linimasa: 'Bulan ke-1',
          pihakTerlibat: 'Pengawas Pembina, Kepala Sekolah, Dewan Guru, Komite',
          indikatorKeberhasilan: 'Tersepakatinya target lompatan mutu semester berjalan secara aklamasi.'
        },
        {
          tahap: 'Pelaksanaan Program',
          fokusAspek: 'Tantangan Inovasi Modul Belajar Berbasis Masalah (PBL) & AI Edukatif',
          metode: 'Coaching',
          aktivitasUtama: 'Tantangan unjuk karya antar-guru dalam mendesain skenario pembelajaran interaktif yang memantik nalar kritis murid.',
          targetOutput: 'Katalog proyek mini inovasi pembelajaran yang diunggah ke bukti karya PMM.',
          linimasa: 'Bulan ke-2 & ke-3',
          pihakTerlibat: 'Pengawas, Kepala Sekolah, Pendidik Binaan',
          indikatorKeberhasilan: 'Minimal 75% guru berpartisipasi aktif menghasilkan karya pembelajaran baru.'
        },
        {
          tahap: 'Evaluasi & Refleksi',
          fokusAspek: 'Umpan Balik Terbuka & Penetapan Target Siklus Baru',
          metode: 'Fasilitasi',
          aktivitasUtama: 'Forum refleksi bersama atas respon dan antusiasme murid setelah guru menerapkan metode interaktif baru.',
          targetOutput: 'Dokumen evaluasi ketercapaian komitmen perubahan sekolah.',
          linimasa: 'Bulan ke-5',
          pihakTerlibat: 'Pengawas Pembina, Kepala Sekolah, Perwakilan Murid',
          indikatorKeberhasilan: 'Terbentuknya kebiasaan baru berefleksi secara jujur dan terbuka di sekolah.'
        }
      ]
    };
  }

  // Kuadran IV: Perlu Intervensi Khusus
  return {
    quadrant,
    strategy,
    baselineDiagnosis: `Satuan pendidikan ${params.schoolName} berada pada level kapasitas kepemimpinan dan komitmen perubahan yang membutuhkan intervensi intensif. Keterbatasan pemahaman regulasi, minimnya keterlibatan guru dalam pelatihan, serta tata kelola sekolah yang belum teratur menuntut pendampingan langsung dan terstruktur dari Pengawas Pembina.`,
    generalObjective: `Melakukan restrukturisasi tata kelola dasar, pembimbingan teknis intensif reguler, dan pemantauan kepatuhan standar pelayanan minimal pendidikan demi menjamin hak belajar murid terpenuhi dengan aman.`,
    supervisorNotes: `Gunakan metode Pelatihan Terstruktur dan Pendampingan Langsung (Intervensi Intensif). Pengawas bertindak secara direktif-kolaboratif untuk memandu setiap langkah perbaikan dasar.`,
    items: [
      {
        tahap: 'Perencanaan Program',
        fokusAspek: 'Restrukturisasi Tata Kelola Administrasi & Perencanaan Kurikulum Operasional (KOSP)',
        metode: 'Pelatihan',
        aktivitasUtama: 'Bimbingan teknis langsung penyusunan dokumen KOSP, pembagian jam mengajar, dan keyakinan kelas dasar.',
        targetOutput: 'Dokumen KOSP dan perangkat ajar dasar yang lengkap dan disahkan.',
        linimasa: 'Minggu ke-1 & ke-2 Bulan Pertama',
        pihakTerlibat: 'Pengawas Pembina, Kepala Sekolah, Dewan Guru',
        indikatorKeberhasilan: '100% guru memiliki perangkat ajar minimal sebelum memasuki ruang kelas.'
      },
      {
        tahap: 'Pelaksanaan Program',
        fokusAspek: 'Pendampingan Intensif Pengelolaan Kelas & Disiplin Positif',
        metode: 'Mentoring',
        aktivitasUtama: 'Observasi kelas berkala dua mingguan disertai pemodelan langsung cara mengelola disiplin positif dan interaksi ramah murid.',
        targetOutput: 'Lembar observasi kelas mingguan dan catatan kemajuan individu pendidik.',
        linimasa: 'Bulan ke-2, ke-3, & ke-4 (Setiap 2 minggu sekali)',
        pihakTerlibat: 'Pengawas, Kepala Sekolah, Pendidik Sasaran',
        indikatorKeberhasilan: 'Terciptanya suasana kelas yang tertib, aman, dan bebas dari hukuman fisik.'
      },
      {
        tahap: 'Pelaksanaan Program',
        fokusAspek: 'Penataan Disiplin Kerja & Pemanfaatan Platform Merdeka Mengajar (PMM)',
        metode: 'Pelatihan',
        aktivitasUtama: 'Bimbingan login akun Belajar.id dan penyelesaian topik pelatihan mandiri dasar di PMM secara bersama-sama di sekolah.',
        targetOutput: 'Aktivasi 100% akun Belajar.id dan sertifikat topik pelatihan mandiri dasar.',
        linimasa: 'Bulan ke-3',
        pihakTerlibat: 'Pengawas Pembina, Kepala Sekolah, Seluruh Pendidik',
        indikatorKeberhasilan: 'Pendidik mulai memanfaatkan fitur asesmen dan modul ajar PMM dalam mengajar.'
      },
      {
        tahap: 'Evaluasi & Refleksi',
        fokusAspek: 'Audit Kepatuhan Mutu & Laporan Perkembangan ke Dinas Pendidikan',
        metode: 'Konsultasi',
        aktivitasUtama: 'Evaluasi berkala bersama Kepala Dinas Pendidikan / Koordinator Pengawas mengenai tren kemajuan satuan pendidikan.',
        targetOutput: 'Laporan progres pendampingan intensif untuk penetapan tindak lanjut manajerial dinas.',
        linimasa: 'Akhir Semester',
        pihakTerlibat: 'Pengawas Pembina, Kepala Sekolah, Dinas Pendidikan Sidrap',
        indikatorKeberhasilan: 'Sekolah berhasil keluar dari zona darurat dan siap bertransisi ke kuadran berkembang.'
      }
    ]
  };
}
