/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuickWinsRecord } from '../types/inspiro';

export const SEED_QUICK_WINS_RECORDS: QuickWinsRecord[] = [
  {
    id: 'qw-sdn6-amparita-2026',
    title: 'Peta Langkah Nyata 30-60-90 Hari: Pembelajaran Berdiferensiasi & Inovasi Digital',
    schoolName: 'UPT SDN 6 Amparita',
    schoolNpsn: '20108921',
    headmasterName: 'Hj. Netti, S.Pd.I., M.Pd.I.',
    headmasterNip: '19740512 199803 2 004',
    headmasterRank: 'Pembina / IV.a',
    supervisorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    supervisorNip: '19830819 201001 1 002',
    supervisorRole: 'Pengawas Sekolah Pembina',
    supervisorRank: 'Penata Tk. I / III.d',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    startDate: '2026-11-01',
    targetPillar: 'Pembelajaran Berdiferensiasi & Pemanfaatan Platform Digital (PMM/AI)',
    rpbStrategy: 'Pemacu Perubahan (Catalyst)',
    beforeCondition: 'Metode pembelajaran guru di kelas masih dominan ceramah satu arah dan LKPD seragam. Pemanfaatan PMM dan media Canva masih bersifat individual dan belum terintegrasi ke dalam rancangan modul ajar bertingkat.',
    expectedImpact: 'Terwujudnya stasiun belajar berdiferensiasi di kelas IV, V, VI, terciptanya 4 modul ajar kolaboratif di Kombel sekolah, serta 90% murid aktif terlibat dalam pembelajaran interaktif.',
    supervisorNotes: 'Pengawas Pembina berkomitmen mendampingi sebagai mitra dialog (co-pilot), memberikan umpan balik klinis yang membesarkan hati, dan memfasilitasi integrasi bank modul digital sekolah.',
    status: 'berjalan',
    createdAt: '2026-11-01T08:00:00.000Z',
    updatedAt: '2026-11-12T07:30:00.000Z',
    items: [
      {
        id: 'qw-item-1',
        phase: '30-days',
        phaseTitle: 'Fase 1 (Hari 1–30): Fondasi & Kemenangan Cepat (Quick Wins)',
        week: 'Minggu 1–2',
        actionTitle: 'Pemetaan Gaya Belajar & Asesmen Awal Minat Murid',
        actionDetail: 'Guru membagikan kuesioner visual singkat dan lembar cek emotikon untuk memetakan kesiapan dan profil belajar murid di kelas sasaran.',
        pic: 'Fitriani Massi., S.Pd., Gr & Tim Guru Fase C',
        evidenceTarget: 'Matriks Profil Kesiapan Belajar & Rekap Minat Murid',
        status: 'tuntas',
        notes: 'Terlaksana dengan lancar di Kelas VI. Murid sangat antusias mengisi asesmen non-kognitif.'
      },
      {
        id: 'qw-item-2',
        phase: '30-days',
        phaseTitle: 'Fase 1 (Hari 1–30): Fondasi & Kemenangan Cepat (Quick Wins)',
        week: 'Minggu 3–4',
        actionTitle: 'Penyusunan 1 Modul Berdiferensiasi Prototipe di Kombel',
        actionDetail: 'Bersama rekan sejawat di Kombel mingguan, guru merancang 1 modul ajar diferensiasi konten & proses dengan stimulus teks berjenjang.',
        pic: 'Tim Kombel UPT SDN 6 Amparita',
        evidenceTarget: 'Modul Ajar Diferensiasi Terverifikasi Kepala Sekolah',
        status: 'tuntas',
        notes: 'Modul ajar Matematika dan IPAS berhasil disusun dan divalidasi oleh Kepala Sekolah.'
      },
      {
        id: 'qw-item-3',
        phase: '60-days',
        phaseTitle: 'Fase 2 (Hari 31–60): Eksperimen Kelas & Penguatan Berkelanjutan',
        week: 'Minggu 5–6',
        actionTitle: 'Uji Coba Model Stasiun Belajar (Rotasi Terbimbing)',
        actionDetail: 'Guru mempraktikkan modul di kelas dengan membagi murid ke dalam 3 stasiun rotasi: konsep dasar, studi kasus, dan kreasi visual.',
        pic: 'Guru Sasaran & Pengawas Pembina (Co-Observation)',
        evidenceTarget: 'Dokumentasi Foto Stasiun Belajar & Lembar Refleksi Murid',
        status: 'proses',
        notes: 'Sedang berjalan di kelas Matematika. Kendala ada pada manajemen waktu perpindahan antarkelompok.'
      },
      {
        id: 'qw-item-4',
        phase: '60-days',
        phaseTitle: 'Fase 2 (Hari 31–60): Eksperimen Kelas & Penguatan Berkelanjutan',
        week: 'Minggu 7–8',
        actionTitle: 'Klinik Supervisi Klinis Berbasis Umpan Balik Positif',
        actionDetail: 'Diskusi reflektif pasca-observasi antara Pengawas, Kepala Sekolah, dan Guru Sasaran untuk mengurai kendala stasiun rotasi tanpa menghakimi.',
        pic: 'Pengawas Sekolah Pembina & Hj. Netti, S.Pd.I., M.Pd.I.',
        evidenceTarget: 'Jurnal Coaching Alur TIRTA & Kesepakatan Solusi Praktis',
        status: 'butuh_bantuan',
        notes: 'Guru membutuhkan pendampingan teknis tambahan terkait diferensiasi produk untuk murid berkemampuan lambat.'
      },
      {
        id: 'qw-item-5',
        phase: '90-days',
        phaseTitle: 'Fase 3 (Hari 61–90): Pembudayaan, Pengimbasan & Bukti Dampak',
        week: 'Minggu 9–10',
        actionTitle: 'Aktivasi Bank Modul Digital di Google Drive / PMM Sekolah',
        actionDetail: 'Menghimpun seluruh modul diferensiasi yang telah teruji ke dalam repositori bersama sekolah agar dapat diadaptasi guru kelas lain.',
        pic: 'Koordinator Kurikulum & Operator Sekolah',
        evidenceTarget: 'Tautan Google Drive Bank Modul & Bukti Akses PMM',
        status: 'belum',
        notes: 'Direncanakan aktif setelah seluruh guru menyelesaikan uji coba siklus 1.'
      },
      {
        id: 'qw-item-6',
        phase: '90-days',
        phaseTitle: 'Fase 3 (Hari 61–90): Pembudayaan, Pengimbasan & Bukti Dampak',
        week: 'Minggu 11–12',
        actionTitle: 'Gelar Karya Pembelajaran & Refleksi Dampak 90 Hari',
        actionDetail: 'Pameran mini karya murid hasil pembelajaran diferensiasi dan evaluasi bersama capaian sebelum vs sesudah 90 hari.',
        pic: 'Kepala Sekolah, Dewan Guru, & Pengawas Pembina',
        evidenceTarget: 'Laporan Komprehensif Dampak 90 Hari & Berita Acara Refleksi',
        status: 'belum',
        notes: 'Akan mengundang pengawas pembina dan perwakilan komite sekolah.'
      }
    ]
  },
  {
    id: 'qw-sdn4-bilokka-2026',
    title: 'Peta Langkah Nyata 30-60-90 Hari: Penguatan Literasi Kontekstual & Pojok Baca',
    schoolName: 'UPT SD Negeri 4 Bilokka',
    schoolNpsn: '40301824',
    headmasterName: 'Asnawi., S.Pd',
    headmasterNip: '19681231 200502 1 008',
    headmasterRank: 'Penata Tk. I / III.d',
    supervisorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    supervisorNip: '19830819 201001 1 002',
    supervisorRole: 'Pengawas Sekolah Pembina',
    supervisorRank: 'Penata Tk. I / III.d',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    startDate: '2026-10-15',
    targetPillar: 'Penguatan Literasi & Pembiasaan Karakter Membaca Bermakna',
    rpbStrategy: 'Penguat Perubahan (Booster)',
    beforeCondition: 'Skor literasi murid di Rapor Pendidikan masih berada pada zona kuning (sedang). Pojok baca kelas belum tertata menarik dan buku cerita yang tersedia masih minim stimulus bergambar.',
    expectedImpact: '100% kelas memiliki pojok baca ramah anak yang aktif, pembiasaan 15 menit membaca nyaring terlaksana setiap pagi, dan minat baca murid meningkat signifikan.',
    supervisorNotes: 'Dukungan pengawas difokuskan pada penguatan peran wali kelas dan pelibatan orang tua dalam memperkaya variasi bahan bacaan non-teks pelajaran.',
    status: 'berjalan',
    createdAt: '2026-10-15T08:00:00.000Z',
    updatedAt: '2026-11-10T10:00:00.000Z',
    items: [
      {
        id: 'qw-bilo-1',
        phase: '30-days',
        phaseTitle: 'Fase 1 (Hari 1–30): Fondasi & Kemenangan Cepat (Quick Wins)',
        week: 'Minggu 1–2',
        actionTitle: 'Pembenahan Pojok Baca Ramah Anak Bersama Paguyuban Kelas',
        actionDetail: 'Menata ulang ruang baca di 6 rombel dengan bantal duduk dan rak buku ramah anak bekerjasama dengan orang tua murid.',
        pic: 'Wali Kelas I–VI & Paguyuban Kelas',
        evidenceTarget: 'Dokumentasi Foto Pojok Baca 6 Kelas yang Nyaman',
        status: 'tuntas',
        notes: 'Seluruh kelas selesai menata pojok baca dengan kreasi menarik.'
      },
      {
        id: 'qw-bilo-2',
        phase: '30-days',
        phaseTitle: 'Fase 1 (Hari 1–30): Fondasi & Kemenangan Cepat (Quick Wins)',
        week: 'Minggu 3–4',
        actionTitle: 'Peluncuran Gerakan 15 Menit Membaca Nyaring Pagi',
        actionDetail: 'Rutinitas setiap pukul 07.15–07.30 guru membacakan buku cerita kontekstual dan memandu dialog interaktif tentang pesan moral cerita.',
        pic: 'Dewan Guru UPT SD Negeri 4 Bilokka',
        evidenceTarget: 'Jurnal Harian Membaca Nyaring & Rekap Partisipasi Murid',
        status: 'tuntas',
        notes: 'Berhasil membangkitkan kebiasaan murid datang lebih awal dan antusias menyimak cerita.'
      },
      {
        id: 'qw-bilo-3',
        phase: '60-days',
        phaseTitle: 'Fase 2 (Hari 31–60): Eksperimen Kelas & Penguatan Berkelanjutan',
        week: 'Minggu 5–6',
        actionTitle: 'Pembuatan Jurnal Refleksi Baca Bergambar Mandiri',
        actionDetail: 'Murid membuat catatan mini (gambar atau kalimat pendek) tentang tokoh cerita favorit yang dibaca setiap minggunya.',
        pic: 'Guru Bahasa Indonesia & Wali Kelas',
        evidenceTarget: 'Koleksi Jurnal Refleksi Baca Murid per Kelas',
        status: 'proses',
        notes: 'Sedang berjalan di kelas III, IV, dan V.'
      },
      {
        id: 'qw-bilo-4',
        phase: '60-days',
        phaseTitle: 'Fase 2 (Hari 31–60): Eksperimen Kelas & Penguatan Berkelanjutan',
        week: 'Minggu 7–8',
        actionTitle: 'Observasi Suasana Belajar & Diskusi Solutif Pengawas',
        actionDetail: 'Pengawas hadir mengamati respons murid saat sesi membaca dan berdiskusi dengan kepala sekolah tentang penyediaan buku cerita baru.',
        pic: 'Pengawas Sekolah Pembina & Asnawi., S.Pd',
        evidenceTarget: 'Lembar Catatan Kunjungan Supervisi Ramah',
        status: 'tuntas',
        notes: 'Pengawas memberikan apresiasi atas keterlibatan aktif orang tua murid.'
      },
      {
        id: 'qw-bilo-5',
        phase: '90-days',
        phaseTitle: 'Fase 3 (Hari 61–90): Pembudayaan, Pengimbasan & Bukti Dampak',
        week: 'Minggu 9–10',
        actionTitle: 'Panggung Bercerita Murid (Storytelling Show)',
        actionDetail: 'Memberikan kesempatan bagi perwakilan murid bercerita di depan teman-temannya pada saat upacara atau apel pagi.',
        pic: 'Tim Kesiswaan & Guru Pembimbing',
        evidenceTarget: 'Video & Dokumentasi Panggung Bercerita Anak',
        status: 'proses',
        notes: 'Sedang dalam tahap seleksi dan latihan percaya diri murid.'
      },
      {
        id: 'qw-bilo-6',
        phase: '90-days',
        phaseTitle: 'Fase 3 (Hari 61–90): Pembudayaan, Pengimbasan & Bukti Dampak',
        week: 'Minggu 11–12',
        actionTitle: 'Laporan Evaluasi Dampak 90 Hari & Pengimbasan ke KKG Gugus',
        actionDetail: 'Membandingkan data minat baca sebelum dan sesudah 90 hari, serta membagikan model pojok baca murah-meriah ke gugus sekolah terdekat.',
        pic: 'Kepala Sekolah & Tim Literasi Sekolah',
        evidenceTarget: 'Laporan Akhir 90 Hari & Notula Pengimbasan KKG',
        status: 'belum',
        notes: 'Akan dipresentasikan pada pertemuan rutin KKG Gugus.'
      }
    ]
  }
];
