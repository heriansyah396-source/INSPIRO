/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppSettings, SupervisionRecord, Teacher } from '../types/inspiro';

export const DEFAULT_SETTINGS: AppSettings = {
  schoolName: 'SMP Negeri 1 Merdeka Nusantara',
  schoolNpsn: '20108921',
  schoolCity: 'Kota Pendidikan',
  schoolAddress: 'Jl. Pemuda No. 45, Kompleks Pendidikan Terpadu',
  supervisorName: 'Heriansyah., S.Si., S.Pd., M.Pd',
  supervisorNip: '19820415 200801 1 007',
  supervisorRole: 'Pengawas Sekolah',
  pengawasPembinaName: 'Dr. Hj. Endang Sulastri, M.Pd.',
  pengawasPembinaNip: '19650410 199103 2 001'
};

export const SEED_TEACHERS: Teacher[] = [
  {
    id: 'G001',
    nama: 'Ahmad Fauzi, S.Pd.',
    nip: '19850714 201001 1 012',
    mapel: 'Matematika',
    kelas: 'VII (Fase D)',
    satuanPendidikan: 'SMP Negeri 1 Merdeka Nusantara',
    telepon: '0812-3456-7890',
    email: 'ahmad.fauzi@guru.smp.belajar.id',
    createdAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'G002',
    nama: 'Siti Rahmawati, M.Pd.',
    nip: '19881120 201101 2 015',
    mapel: 'Bahasa Indonesia',
    kelas: 'VIII (Fase D)',
    satuanPendidikan: 'SMP Negeri 1 Merdeka Nusantara',
    telepon: '0813-9876-5432',
    email: 'siti.rahmawati@guru.smp.belajar.id',
    createdAt: '2026-09-01T08:15:00Z'
  },
  {
    id: 'G003',
    nama: 'Budi Santoso, S.Pd.',
    nip: '19920315 201903 1 008',
    mapel: 'Ilmu Pengetahuan Alam (IPA)',
    kelas: 'VII (Fase D)',
    satuanPendidikan: 'SMP Negeri 1 Merdeka Nusantara',
    telepon: '0857-1234-5678',
    email: 'budi.santoso@guru.smp.belajar.id',
    createdAt: '2026-09-02T09:00:00Z'
  },
  {
    id: 'G004',
    nama: 'Dewi Anggraini, S.Pd.',
    nip: '19940625 202012 2 018',
    mapel: 'Bahasa Inggris',
    kelas: 'IX (Fase D)',
    satuanPendidikan: 'SMP Negeri 1 Merdeka Nusantara',
    telepon: '0821-6543-2109',
    email: 'dewi.anggraini@guru.smp.belajar.id',
    createdAt: '2026-09-03T10:00:00Z'
  },
  {
    id: 'G005',
    nama: 'Hendra Wijaya, S.Pd.',
    nip: '19810918 200801 1 009',
    mapel: 'Ilmu Pengetahuan Sosial (IPS)',
    kelas: 'VIII (Fase D)',
    satuanPendidikan: 'SMP Negeri 1 Merdeka Nusantara',
    telepon: '0812-8765-4321',
    email: 'hendra.wijaya@guru.smp.belajar.id',
    createdAt: '2026-09-04T11:00:00Z'
  }
];

export const SEED_SUPERVISIONS: SupervisionRecord[] = [
  {
    id: 'S-2026-001',
    teacherId: 'G002',
    status: 'selesai',
    createdAt: '2026-10-04T07:30:00Z',
    updatedAt: '2026-10-04T11:45:00Z',
    identity: {
      namaGuru: 'Siti Rahmawati, M.Pd.',
      nipGuru: '19881120 201101 2 015',
      namaSupervisor: 'Heriansyah., S.Si., S.Pd., M.Pd',
      nipSupervisor: '19820415 200801 1 007',
      jabatanSupervisor: 'Pengawas Sekolah',
      mapel: 'Bahasa Indonesia',
      kelasSemester: 'VIII-A / Ganjil',
      satuanPendidikan: 'SMP Negeri 1 Merdeka Nusantara',
      hariTanggal: 'Jumat, 4 Oktober 2026',
      fokusPerilaku: 'Instruksi yang Adaptif & Pembelajaran Berdiferensiasi Berbasis Profil Siswa',
      materiPokok: 'Menulis Teks Eksplanasi Fenomena Alam',
      jamPelajaran: '07.30 - 08.50 WIB (2 JP)',
      siklus: 'Siklus I'
    },
    praObservasi: {
      tujuanPembelajaran: 'Peserta didik mampu menyusun kerangka dan menulis teks eksplanasi tentang fenomena alam dengan memperhatikan struktur teks dan kaidah kebahasaan secara kreatif.',
      pemetaanKebutuhan: 'Berdasarkan asesmen awal diagnostik, 8 murid membutuhkan pendampingan bertahap (kelompok visual-tuntunan kosakata), 18 murid kelompok reguler mandiri, dan 6 murid kelompok mahir dengan penugasan esai kritis analitik.',
      fokusPerilaku: 'Guru memfasilitasi scaffolding diferensiasi proses dan memberikan umpan balik langsung pada kelompok yang masih kesulitan menemukan kalimat utama.',
      modelMetode: 'Genre-Based Approach dipadukan dengan Problem Based Learning, metode diskusi kelompok terarah dan mind mapping.',
      mediaAlat: 'LKPD berdiferensiasi 3 tingkat, video dokumenter letusan gunung berapi dari YouTube Pendidikan, infografis grafis fenomena alam, dan papan tempel karya.',
      bentukAsesmen: 'Asesmen awal berupa tanya jawab pemahaman struktur teks, asesmen formatif lembar observasi keterlibatan, dan rubrik asesmen produk draf teks eksplanasi.'
    },
    scores: {
      1: 4, // Pengondisian kelas
      2: 4, // Asesmen awal
      3: 4, // Penyampaian tujuan
      4: 4, // Penguasaan materi
      5: 4, // Berdiferensiasi
      6: 4, // HOTS & 4C
      7: 4, // Media IT
      8: 4, // Manajemen kelas
      9: 3, // Integrasi KSE
      10: 4, // Refleksi bersama
      11: 3, // Asesmen formatif
      12: 4  // Umpan balik
    },
    notes: {
      1: 'Apersepsi sangat memikat dengan menayangkan potongan berita banjir lokal, murid sangat fokus dan siap belajar.',
      2: 'Asesmen awal kognitif dijalankan dengan kuis cepat 3 pertanyaan dan pengecekan pemahaman kosakata prasyarat.',
      3: 'Tujuan pembelajaran dipaparkan jelas di slide dan ditempel di papan capaian agar murid selalu teringat target sesi.',
      4: 'Guru sangat menguasai konsep teks eksplanasi, membedakan hubungan kausalitas dan kronologis dengan contoh konkret.',
      5: 'Praktik diferensiasi proses sangat baik. Guru membagi kelompok dan memberikan bimbingan intensif pada kelompok 1 tanpa mengabaikan kelompok lain.',
      6: 'Murid diajak menganalisis hubungan sebab-akibat fenomena secara mendalam dan beradu argumentasi secara santun.',
      7: 'Pemanfaatan video pendek dan LKPD interaktif Canva sangat optimal dan efisien waktu.',
      8: 'Disiplin positif terbangun natural, murid mematuhi kesepakatan sinyal hening tanpa teguran keras sama sekali.',
      9: 'KSE terintegrasi pada kegiatan awal (teknik pernapasan sadar STOP), dapat ditingkatkan saat sesi kerja kelompok.',
      10: 'Refleksi penutup melibatkan murid mengutarakan insight utama dan tantangan menulis yang dialami.',
      11: 'Exit ticket terlaksana, namun 4 murid belum sempat menyelesaikan karena waktu akhir mendekati bel.',
      12: 'Umpan balik tertulis diberikan pada draf pertama murid dengan catatan penguatan apresiatif.'
    },
    totalScore: 45,
    finalScore: 93.8,
    category: 'Amat Baik (SB)',
    refleksi: {
      kesanPerasaan: 'Sangat puas melihat antusiasme murid saat menganalisis fenomena alam. Murid yang biasanya pasif mau berbicara dalam kelompok kecil.',
      kesesuaianModul: 'Pelaksanaan sesuai dengan modul ajar sekitar 90%. Sesi curah pendapat awal berlangsung 5 menit lebih lama dari rencana karena antusiasme murid tinggi.',
      kendalaSiswa: 'Kelompok pemula masih memerlukan waktu ekstra dalam membedakan konjungsi kausalitas dan kronologi.',
      ketercapaianFokus: 'Fokus perilaku scaffolding dan diferensiasi tercapai dengan baik, murid mendapatkan porsi perhatian guru yang proporsional.',
      rencanaPeningkatan: 'Akan menyiapkan bank kosakata penghubung siap pakai bagi murid yang butuh intervensi dan mendalami variasi asesmen formatif singkat di PMM.'
    },
    rtl: [
      {
        id: 'rtl-01',
        fokusAspek: 'Asesmen Formatif Akhir Sesi yang Efisien Waktu',
        rencanaKegiatan: 'Mengembangkan instrumen exit ticket berbasis lembar cek mandiri 2 menit atau Google Form / Quizizz cepat.',
        waktuTarget: 'Pertemuan pekan depan (12 Oktober 2026)',
        kriteriaKeberhasilan: 'Seluruh peserta didik (100%) dapat menyelesaikan asesmen formatif sebelum jam pelajaran berakhir.'
      },
      {
        id: 'rtl-02',
        fokusAspek: 'Penguatan Integrasi Kompetensi Sosial Emosional (KSE)',
        rencanaKegiatan: 'Mengikuti pelatihan mandiri Topik KSE di Platform Merdeka Mengajar (PMM) dan mempraktikkan lembar refleksi emosi saat diskusi kelompok.',
        waktuTarget: '1 Bulan (Akhir Oktober 2026)',
        kriteriaKeberhasilan: 'Memperoleh sertifikat topik PMM dan menerapkan 1 teknik KSE relasional dalam Modul Ajar berikutnya.'
      }
    ]
  },
  {
    id: 'S-2026-002',
    teacherId: 'G001',
    status: 'selesai',
    createdAt: '2026-10-06T08:15:00Z',
    updatedAt: '2026-10-06T10:30:00Z',
    identity: {
      namaGuru: 'Ahmad Fauzi, S.Pd.',
      nipGuru: '19850714 201001 1 012',
      namaSupervisor: 'Heriansyah., S.Si., S.Pd., M.Pd',
      nipSupervisor: '19820415 200801 1 007',
      jabatanSupervisor: 'Pengawas Sekolah',
      mapel: 'Matematika',
      kelasSemester: 'VII-B / Ganjil',
      satuanPendidikan: 'SMP Negeri 1 Merdeka Nusantara',
      hariTanggal: 'Senin, 6 Oktober 2026',
      fokusPerilaku: 'Penerapan Disiplin Positif & Keteraturan Suasana Kelas',
      materiPokok: 'Operasi Penjumlahan dan Pengurangan Bilangan Bulat',
      jamPelajaran: '08.00 - 09.20 WIB (2 JP)',
      siklus: 'Siklus I'
    },
    praObservasi: {
      tujuanPembelajaran: 'Peserta didik dapat menyelesaikan operasi penjumlahan dan pengurangan bilangan bulat positif dan negatif dengan memanfaatkan garis bilangan dan konteks kehidupan sehari-hari.',
      pemetaanKebutuhan: 'Asesmen diagnostik menunjukkan 12 murid masih kesulitan membayangkan bilangan negatif, 15 murid tingkat pemahaman sedang, dan 5 murid mahir.',
      fokusPerilaku: 'Membangun kesepakatan kelas yang aktif, merespons disrupsi dengan restitusi tanpa meninggikan nada bicara, dan mengapresiasi partisipasi murid.',
      modelMetode: 'Problem Based Learning dipadu metode demonstrasi konkret dan permainan kartu koin positif-negatif.',
      mediaAlat: 'Koin manipulatif dua warna (merah positif, biru negatif), garis bilangan lantai kelas, lembar kerja kelompok, slide materi.',
      bentukAsesmen: 'Lembar observasi keaktifan kelompok, kuis lisan cepat, dan tes formatif 3 soal di akhir kegiatan.'
    },
    scores: {
      1: 4, // Pengondisian kelas
      2: 3, // Asesmen awal
      3: 3, // Penyampaian tujuan
      4: 4, // Penguasaan materi
      5: 3, // Berdiferensiasi
      6: 3, // HOTS & 4C
      7: 4, // Media IT
      8: 4, // Manajemen kelas
      9: 3, // Integrasi KSE
      10: 3, // Refleksi bersama
      11: 3, // Asesmen formatif
      12: 4  // Umpan balik
    },
    notes: {
      1: 'Kelas dimulai dengan doa khidmat, suasana kelas sangat rapi dan murid bersemangat saat guru menggunakan analogi suhu lemari es.',
      2: 'Asesmen awal dilakukan secara klasikal, perlu dicatat pemetaan individunya agar lebih akurat.',
      3: 'Tujuan pembelajaran disampaikan secara verbal dengan baik, alangkah lebih baik jika kriteria KKTP dituliskan di slide.',
      4: 'Penjelasan konsep bilangan bulat negatif menggunakan analogi ketinggian dan hutang sangat jelas dan logis.',
      5: 'Guru berkeliling membimbing kelompok yang menggunakan koin warna merah-biru, pendampingan kelompok dasar cukup intensif.',
      6: 'Diskusi berjalan hidup saat murid menyimpulkan rumus pengurangan minus dengan minus.',
      7: 'Penggunaan garis bilangan di lantai kelas sangat menarik perhatian murid dan membuat konsep abstrak menjadi konkret.',
      8: 'Guru sangat tenang dan ramah. Saat ada murid bercanda berlebihan, guru mengingatkan kesepakatan kelas dengan teknik restitusi yang hangat.',
      9: 'Nilai gotong royong dan kemandirian terlihat selama kerja kelompok.',
      10: 'Refleksi penutup melibatkan 2 murid memberikan kesimpulan, belum semua murid mendapat giliran refleksi.',
      11: 'Asesmen formatif berupa soal latihan dikerjakan di buku tulis, guru memeriksa beberapa contoh secara acak.',
      12: 'Umpan balik di akhir sesi sangat apresiatif dan membangkitkan rasa percaya diri murid yang tadinya takut matematika.'
    },
    totalScore: 41,
    finalScore: 85.4,
    category: 'Baik (B)',
    refleksi: {
      kesanPerasaan: 'Merasa senang karena murid tidak lagi merasa takut belajar bilangan negatif. Penggunaan koin manipulatif sangat membantu.',
      kesesuaianModul: 'Sesuai dengan rancangan awal. Hanya saja saat simulasi garis bilangan lantai butuh waktu lebih lama karena murid antre mencoba.',
      kendalaSiswa: 'Beberapa murid masih bingung jika angka negatifnya lebih besar dari angka positif (misal: -15 + 8).',
      ketercapaianFokus: 'Fokus disiplin positif tercapai maksimal. Tidak ada suara bentakan, kelas kondusif dan murid saling menghargai.',
      rencanaPeningkatan: 'Akan menyiapkan lembar kerja diferensiasi bertingkat (level 1-3) agar murid mahir mendapat tantangan soal cerita kontekstual lebih variatif.'
    },
    rtl: [
      {
        id: 'rtl-03',
        fokusAspek: 'Diferensiasi Konten & Tugas Bertingkat (Tiered Assignment)',
        rencanaKegiatan: 'Merancang lembar kerja LKPD berjenjang 3 level (dasar, menengah, mahir) untuk materi perkalian bilangan bulat.',
        waktuTarget: '14 Oktober 2026',
        kriteriaKeberhasilan: 'Tersedianya LKPD diferensiasi yang disetujui dalam forum MGMP sekolah.'
      },
      {
        id: 'rtl-04',
        fokusAspek: 'Penguatan Instrumen Asesmen Formatif Autentik',
        rencanaKegiatan: 'Menerapkan rubrik unjuk kerja berbasis pemecahan masalah dan lembar penilaian antar-teman.',
        waktuTarget: '21 Oktober 2026',
        kriteriaKeberhasilan: 'Data ketercapaian KKTP murid terdokumentasi rapi dalam jurnal mengajar.'
      }
    ]
  },
  {
    id: 'S-2026-003',
    teacherId: 'G003',
    status: 'draft',
    createdAt: '2026-10-06T11:00:00Z',
    updatedAt: '2026-10-06T11:30:00Z',
    identity: {
      namaGuru: 'Budi Santoso, S.Pd.',
      nipGuru: '19920315 201903 1 008',
      namaSupervisor: 'Heriansyah., S.Si., S.Pd., M.Pd',
      nipSupervisor: '19820415 200801 1 007',
      jabatanSupervisor: 'Pengawas Sekolah',
      mapel: 'Ilmu Pengetahuan Alam (IPA)',
      kelasSemester: 'VII-C / Ganjil',
      satuanPendidikan: 'SMP Negeri 1 Merdeka Nusantara',
      hariTanggal: 'Rabu, 8 Oktober 2026',
      fokusPerilaku: 'Umpan Balik Konstruktif & Pembelajaran Berbasis Inkuiri Laboratorium',
      materiPokok: 'Pengukuran dan Besaran Turunan dengan Alat Ukur Presisi',
      jamPelajaran: '09.40 - 11.00 WIB (2 JP)',
      siklus: 'Siklus I'
    },
    praObservasi: {
      tujuanPembelajaran: 'Peserta didik mampu menggunakan alat ukur jangka sorong dan mikrometer sekrup dengan benar, serta menganalisis hasil pengukuran benda di sekitar.',
      pemetaanKebutuhan: '18 murid belum pernah memegang jangka sorong fisik, 14 murid sudah mengenal skala utama saat SD.',
      fokusPerilaku: 'Guru memberikan instruksi keselamatan kerja lab dan umpan balik personal saat murid membaca skala nonius.',
      modelMetode: 'Guided Inquiry Laboratory, eksperimen praktikum kelompok dan presentasi data.',
      mediaAlat: 'Kit jangka sorong, mikrometer sekrup, neraca Ohaus, benda uji (koin, baut, kelereng), LKPD praktikum.',
      bentukAsesmen: 'Lembar ceklis unjuk kerja pengukuran presisi dan tes pemahaman pembacaan skala.'
    },
    scores: {
      1: 3,
      2: 3,
      3: 3,
      4: 4,
      5: 3,
      6: 3,
      7: 3,
      8: 3,
      9: 3,
      10: 2,
      11: 2,
      12: 3
    },
    notes: {
      1: 'Pengondisian kelas di laboratorium IPA tertata rapi sesuai SOP keselamatan.',
      2: 'Apersepsi tanya jawab fungsi mistar vs alat ukur presisi.',
      3: 'Tujuan pembelajaran disampaikan di awal praktikum.',
      4: 'Penjelasan demonstrasi cara membaca skala nonius sangat runtut.',
      5: 'Kelompok praktikum dibagi heterogen.',
      6: 'Murid diajak membandingkan selisih ketelitian antar alat.',
      7: 'Alat peraga laboratorium lengkap.',
      8: 'Manajemen kerja kelompok di meja laboratorium tertib.',
      9: 'Kerja sama gotong royong tampak saat pengambilan data.',
      10: 'Refleksi masih singkat karena waktu praktikum sedikit mundur.',
      11: 'Asesmen formatif baru sebatas pengumpulan lembar kerja sementara.',
      12: 'Guru memberikan koreksi langsung pada kelompok yang salah memegang alat.'
    },
    totalScore: 35,
    finalScore: 72.9,
    category: 'Cukup (C)',
    refleksi: {
      kesanPerasaan: 'Waktu praktikum terasa sangat cepat, beberapa murid sangat berhati-hati memutar alat ukur.',
      kesesuaianModul: 'Sebagian besar praktikum berjalan, tahap penulisan kesimpulan perlu diteruskan di pertemuan berikutnya.',
      kendalaSiswa: 'Membaca skala nonius jangka sorong membutuhkan ketelitian mata murid.',
      ketercapaianFokus: 'Umpan balik langsung pada kelompok dapat terlaksana.',
      rencanaPeningkatan: 'Menyiapkan simulasi virtual PhET pengukuran sebelum praktikum fisik agar murid lebih paham skala dasar.'
    },
    rtl: [
      {
        id: 'rtl-05',
        fokusAspek: 'Pemanfaatan Media Simulasi Virtual Sebelum Praktikum Lab',
        rencanaKegiatan: 'Menggunakan simulasi jangka sorong interaktif interaktif di layar sebelum masuk lab.',
        waktuTarget: '15 Oktober 2026',
        kriteriaKeberhasilan: 'Waktu instruksi praktikum berkurang 10 menit sehingga sesi penutup dan asesmen formatif dapat tuntas.'
      }
    ]
  }
];
