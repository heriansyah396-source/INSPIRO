/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TirtaCoachingRecord } from '../types/inspiro';

export const SEED_COACHING_RECORDS: TirtaCoachingRecord[] = [
  {
    id: 'coach-2026-001',
    teacherId: 'G002',
    teacherName: 'Siti Rahmawati, M.Pd.',
    teacherNip: '19881120 201101 2 015',
    schoolName: 'SMP Negeri 1 Merdeka Nusantara',
    subject: 'Bahasa Indonesia',
    date: '2026-10-06',
    time: '13:00',
    context: 'pasca_observasi',
    supervisionId: 'S-2026-001',
    tujuan: {
      topikPercakapan: 'Optimalisasi Alokasi Waktu Sesi Penutup dan Efektivitas Asesmen Formatif Exit Ticket',
      tujuanAkhir: 'Menyusun strategi manajemen waktu yang presisi pada sesi kerja kelompok agar proses refleksi dan exit ticket murid berjalan tuntas dan mendalam.',
      ukuranKeberhasilan: 'Seluruh murid (100%) dapat menyelesaikan lembar exit ticket reflektif minimal 5 menit sebelum bel jam pelajaran berakhir.'
    },
    identifikasi: {
      potensiDanKekuatan: 'Guru memiliki kemampuan pedagogis dan komunikasi yang hangat, murid sangat aktif berdiskusi menganalisis teks eksplanasi, LKPD 3 tingkat berjalan efektif.',
      faktaDanTantangan: 'Diskusi kelompok melebihi estimasi waktu 10 menit karena antusiasme murid tinggi, sehingga sesi refleksi penutup terpotong dan 4 murid belum sempat menuntaskan exit ticket.',
      akarMasalah: 'Belum adanya penanda waktu visual di ruang kelas dan peran pengingat waktu (timekeeper) di dalam struktur kelompok kerja.',
      peluangTersedia: 'Proyektor LCD dan laptop guru aktif sepanjang sesi, dapat dimanfaatkan untuk visual countdown timer interaktif Canva/ClassroomScreen.'
    },
    rencanaAksi: {
      strategiUtama: 'Penerapan Visual Countdown Timer dipadukan dengan Kartu Refleksi Cepat Tiga Warna (Traffic Light Exit Cards).',
      langkahKonkret: [
        'Menetapkan peran Timekeeper pada masing-masing kelompok siswa.',
        'Menayangkan visual timer di layar proyektor dengan alarm melodi 3 menit sebelum diskusi usai.',
        'Mengganti formulir esai panjang exit ticket dengan kartu cepat 3 warna: Hijau (Paham konsep utama), Kuning (Butuh contoh tambahan), Merah (Masih bingung).',
        'Menyiapkan papan saku refleksi di pintu kelas untuk tempat murid menyematkan kartu saat keluar.'
      ],
      waktuDanLiniMasa: 'Mulai diimplementasikan pada pertemuan materi Teks Eksplanasi kedua, Selasa 8 Oktober 2026.',
      dukunganDibutuhkan: 'Format kartu cetak warna dari perpustakaan sekolah dan aplikasi ClassroomScreen.'
    },
    tanggungJawab: {
      komitmenGuru: 'Saya berkomitmen menerapkan manajemen waktu visual dan kartu refleksi cepat secara konsisten pada setiap akhir pembelajaran.',
      pihakYangMembantu: 'Rekan guru serumpun MGMP Bahasa Indonesia dan ketua kelompok belajar murid.',
      jadwalTindakLanjut: '2026-10-20',
      statusKomitmen: 'tercapai',
      catatanTindakLanjut: 'Pada supervisi dan pemantauan lanjutan 20 Oktober 2026, 100% siswa tuntas mengisi kartu refleksi 7 menit sebelum bel selesai.'
    },
    supervisorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    supervisorNip: '19820415 200801 1 007',
    supervisorRole: 'Pengawas Sekolah Pembina',
    coachFeedback: 'Ibu Siti menunjukkan kesadaran metakognitif yang luar biasa. Gagasan kartu tiga warna lahir murni dari refleksi Ibu Siti sendiri, membuktikan efektivitas coaching dialogis yang memberdayakan.',
    createdAt: '2026-10-06T13:45:00Z',
    updatedAt: '2026-10-20T14:30:00Z'
  },
  {
    id: 'coach-2026-002',
    teacherId: 'G001',
    teacherName: 'Ahmad Fauzi, S.Pd.',
    teacherNip: '19850714 201001 1 012',
    schoolName: 'SMP Negeri 1 Merdeka Nusantara',
    subject: 'Matematika',
    date: '2026-10-10',
    time: '10:30',
    context: 'penguatan_diferensiasi',
    tujuan: {
      topikPercakapan: 'Scaffolding Diferensiasi Konten & Proses pada Materi Aljabar Abstrak',
      tujuanAkhir: 'Menciptakan alur belajar berjenjang (tiered assignment) sehingga kelompok murid yang belum menguasai konsep dasar mendapat bimbingan intensif tanpa menghambat akselerasi kelompok mahir.',
      ukuranKeberhasilan: 'Kelompok pemula mampu menyelesaikan minimal 3 soal persamaan linear dasar mandiri, dan kelompok mahir tertantang dengan soal pemecahan masalah kontekstual.'
    },
    identifikasi: {
      potensiDanKekuatan: 'Pak Ahmad sangat menguasai substansi materi matematika, memiliki bank soal yang kaya, dan terampil memanfaatkan software GeoGebra.',
      faktaDanTantangan: 'Guru merasa kelelahan karena harus bolak-balik menjelaskan materi prasyarat secara berulang di 4 meja kelompok yang berbeda.',
      akarMasalah: 'Belum ada media panduan mandiri (scaffolding sheet / video tutorial pendek) untuk kelompok yang butuh bimbingan berulang.',
      peluangTersedia: 'Empat murid kelompok mahir memiliki kepemimpinan alami dan bersedia menjadi Tutor Sebaya jika diberikan arahan.'
    },
    rencanaAksi: {
      strategiUtama: 'Model Pembelajaran Stasiun Mandiri (Learning Stations) dengan Pemberdayaan Tutor Sebaya dan Lembar Tangga Bantuan.',
      langkahKonkret: [
        'Menyusun "Lembar Tangga Bantuan" berjenjang dengan contoh langkah-langkah penyelesaian bertahap.',
        'Membagikan kode QR video penjelasan singkat konsep aljabar berdurasi 3 menit yang dapat diakses lewat tablet kelas.',
        'Membekali 4 murid mahir sebagai "Duta Belajar" untuk membantu memvalidasi langkah kerja temannya.',
        'Guru memfokuskan pendampingan klinis meja ke meja pada 6 murid yang paling membutuhkan afirmasi.'
      ],
      waktuDanLiniMasa: 'Penyusunan instrumen 11–13 Oktober 2026, simulasi kelas mulai 15 Oktober 2026.',
      dukunganDibutuhkan: 'Dukungan tablet inventaris perpustakaan dan koordinasi dengan wali kelas VII.'
    },
    tanggungJawab: {
      komitmenGuru: 'Saya akan menuntaskan draf Lembar Tangga Bantuan minggu ini dan mencobanya pada siklus materi berikutnya.',
      pihakYangMembantu: 'Guru BK untuk profil gaya belajar dan rekan MGMP Matematika.',
      jadwalTindakLanjut: '2026-10-24',
      statusKomitmen: 'dalam_proses',
      catatanTindakLanjut: 'Draf lembar tangga bantuan telah selesai dibuat. Uji coba perdana dijadwalkan pada hari Jumat pekan ini.'
    },
    supervisorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    supervisorNip: '19820415 200801 1 007',
    supervisorRole: 'Pengawas Sekolah Pembina',
    coachFeedback: 'Pak Ahmad sangat solutif. Mengubah keluhan energi yang terkuras menjadi strategi sistemik Learning Station dan Duta Belajar adalah lompatan kepemimpinan pembelajaran yang hebat.',
    createdAt: '2026-10-10T11:15:00Z',
    updatedAt: '2026-10-10T11:15:00Z'
  },
  {
    id: 'coach-2026-003',
    teacherId: 'G003',
    teacherName: 'Budi Santoso, S.Pd.',
    teacherNip: '19920315 201903 1 008',
    schoolName: 'SMP Negeri 1 Merdeka Nusantara',
    subject: 'Ilmu Pengetahuan Alam (IPA)',
    date: '2026-10-18',
    time: '09:00',
    context: 'disiplin_positif',
    tujuan: {
      topikPercakapan: 'Membangun Budaya Positif & Integrasi Kesadaran Penuh (Mindfulness) di Laboratorium IPA',
      tujuanAkhir: 'Menciptakan suasana praktikum sains yang tertib, aman, dan penuh kesadaran diri murid tanpa guru harus sering menegur dengan suara keras.',
      ukuranKeberhasilan: 'Pengambilan dan pengembalian alat praktikum tertib 100%, insiden tumpahan/pecah nihil, dan murid antusias berkolaborasi.'
    },
    identifikasi: {
      potensiDanKekuatan: 'Pak Budi memiliki ide-ide eksperimen yang kreatif dan disenangi siswa, materi praktikum sains sangat relevan dengan isu lingkungan hidup lokal.',
      faktaDanTantangan: 'Siswa sering berebut saat mengambil preparat mikroskop dan gelas kimia, suasana lab menjadi bising dan waktu praktikum habis sebelum sesi penarikan kesimpulan.',
      akarMasalah: 'Belum ada Keyakinan Kelas Lab yang dirumuskan bersama murid dan belum ada alur protokol rotasi alat praktikum yang jelas.',
      peluangTersedia: 'Siswa kelas VII sangat menyukai permainan peran dan mudah diarahkan jika dilibatkan dalam kesepakatan tertulis.'
    },
    rencanaAksi: {
      strategiUtama: 'Penyusunan Piagam Kesepakatan Lab Sains dan Penerapan Teknik STOP sebelum Praktikum Dimulai.',
      langkahKonkret: [
        'Melakukan curah pendapat bersama murid untuk merumuskan 4 Nilai Utama Keyakinan Lab (Aman, Tertib, Saling Jaga, Bertanggung Jawab).',
        'Menerapkan teknik STOP (Stop, Ambil Napas Dalam, Amati Sekitar, Lanjutkan dengan Hening Fokus) selama 2 menit sebelum alat dibagikan.',
        'Membagi nomor antrean bahan per meja praktikum dengan kartu giliran warna-warni.',
        'Memberi apresiasi simbolik "Laboratorium Hero" bagi kelompok paling rapi membersihkan meja kerja.'
      ],
      waktuDanLiniMasa: 'Praktikum Pengamatan Sel Tumbuhan, Rabu 22 Oktober 2026.',
      dukunganDibutuhkan: 'Laboran IPA sekolah dan poster infografis K3 Laboratorium.'
    },
    tanggungJawab: {
      komitmenGuru: 'Saya akan mengajak murid menyusun Piagam Lab pada 15 menit awal pertemuan berikutnya dan mempraktikkan teknik STOP secara konsisten.',
      pihakYangMembantu: 'Laboran IPA dan Guru BK untuk latihan relaksasi pernapasan.',
      jadwalTindakLanjut: '2026-10-28',
      statusKomitmen: 'dalam_proses',
      catatanTindakLanjut: 'Piagam Lab telah dirumuskan dan dipasang di dinding laboratorium IPA.'
    },
    supervisorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    supervisorNip: '19820415 200801 1 007',
    supervisorRole: 'Pengawas Sekolah Pembina',
    coachFeedback: 'Pendekatan humanis Pak Budi dalam menerapkan Kompetensi Sosial Emosional (KSE) di ruang laboratorium merupakan bukti nyata transformasi budaya belajar merdeka.',
    createdAt: '2026-10-18T10:00:00Z',
    updatedAt: '2026-10-18T10:00:00Z'
  }
];
