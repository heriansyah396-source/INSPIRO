/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RPBRecord } from '../types/inspiro';

export const SEED_RPB_RECORDS: RPBRecord[] = [
  {
    id: 'rpb-001',
    title: 'Rencana Pendampingan Berdiferensiasi (RPB) Satuan Pendidikan Tahun Ajaran 2026/2027',
    principalId: 'KS002',
    schoolName: 'UPT SD Negeri 4 Bilokka',
    schoolNpsn: '40301824',
    headmasterName: 'Asnawi., S.Pd',
    headmasterNip: '19681231 200502 1 008',
    headmasterRank: 'Penata Tk. I (III/d)',
    supervisorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    supervisorNip: '19830819 201001 1 002',
    supervisorRole: 'Pengawas Sekolah Pembina',
    supervisorRank: 'Penata Tk. I / III.d',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    date: '2026-08-15',
    quadrant: 'Kuadran II: Berdaya (Kapasitas Rendah, Komitmen Tinggi)',
    strategy: 'Penguat Perubahan (Booster)',
    leadershipCapacity: 'Rendah',
    changeCommitment: 'Tinggi',
    raporPriorities: [
      'D.1 Kualitas Pembelajaran',
      'A.1 Kemampuan Literasi',
      'D.4 Iklim Keamanan Sekolah'
    ],
    baselineDiagnosis:
      'Kepala sekolah dan para guru memiliki antusiasme serta komitmen moral yang sangat tinggi untuk bertransformasi ke Kurikulum Merdeka. Namun, kapasitas manajerial data dan keterampilan pedagogis digital (seperti pengoperasian Papan Interaktif Digital dan modul berdiferensiasi) masih membutuhkan bimbingan teknis dan pendampingan bertahap dari Pengawas Pembina.',
    generalObjective:
      'Menguatkan kapasitas kepemimpinan instruksional kepala sekolah dan efektivitas komunitas belajar (Kombel) internal dalam mengimplementasikan pembelajaran berdiferensiasi serta pemanfaatan sarana TIK bantuan pemerintah secara optimal.',
    status: 'final',
    createdAt: '2026-08-15T08:30:00Z',
    updatedAt: '2026-10-20T11:45:00Z',
    supervisorNotes:
      'Sekolah menunjukkan lonjakan partisipasi luar biasa. Prioritas pendampingan adalah memberikan bimbingan teknis percontohan (scaffolding) dan memfasilitasi kepala sekolah dalam memimpin refleksi bulanan di Kombel.',
    items: [
      {
        id: 'rpbi-101',
        tahap: 'Perencanaan Program',
        fokusAspek: 'Penyelarasan Program PBD Rapor Pendidikan ke dalam RKAS & KOSP',
        metode: 'Mentoring',
        aktivitasUtama: 'Bedah lembar rekomendasi Rapor Pendidikan bersama Kepala Sekolah dan Tim Pengembang Kurikulum untuk merumuskan benahi prioritas literasi.',
        targetOutput: 'Dokumen KOSP dan lembar kerja ARKAS selaras akar masalah Rapor Pendidikan.',
        linimasa: 'Minggu ke-3 Agustus 2026',
        pihakTerlibat: 'Pengawas Pembina, Kepala Sekolah, Bendahara BOSP, Tim Pengembang',
        indikatorKeberhasilan: '100% program benahi teralokasi anggaran BOSP yang akuntabel.',
        status: 'Terealisasi'
      },
      {
        id: 'rpbi-102',
        tahap: 'Pelaksanaan Program',
        fokusAspek: 'Aktivasi Komunitas Belajar (Kombel) Guru untuk Modul Ajar Berdiferensiasi',
        metode: 'Fasilitasi',
        aktivitasUtama: 'Memfasilitasi sesi co-planning mingguan guru kelas dalam merancang LKPD bertingkat dan rubrik asesmen formatif.',
        targetOutput: 'Bank Modul Ajar Berdiferensiasi untuk Fase A, B, dan C siap pakai.',
        linimasa: 'September - Oktober 2026 (2x per bulan)',
        pihakTerlibat: 'Pengawas Pembina, Kepala Sekolah, Dewan Guru',
        indikatorKeberhasilan: 'Minimal 80% guru mampu mendesain dan mempraktikkan diferensiasi proses di kelas.',
        status: 'Sedang Berjalan'
      },
      {
        id: 'rpbi-103',
        tahap: 'Pelaksanaan Program',
        fokusAspek: 'Pemanfaatan Papan Interaktif Digital (PID) & Chromebook Murid',
        metode: 'Pelatihan',
        aktivitasUtama: 'Bimtek klinis pengoperasian PID dan penunjukan guru pionir muda sebagai pendamping sejawat (peer mentor).',
        targetOutput: 'SOP pengoperasian PID dan jadwal kelas rotasi perangkat TIK.',
        linimasa: 'Minggu ke-2 Oktober 2026',
        pihakTerlibat: 'Pengawas, Guru TIK/Pionir, Guru Senior, Kepala Sekolah',
        indikatorKeberhasilan: 'Tingkat utilisasi perangkat TIK mencapai minimal 3 kali penggunaan per minggu per kelas.',
        status: 'Sedang Berjalan'
      },
      {
        id: 'rpbi-104',
        tahap: 'Evaluasi & Refleksi',
        fokusAspek: 'Refleksi Klinis Pasca-Observasi & Evaluasi Ketercapaian Mutu Siklus I',
        metode: 'Coaching',
        aktivitasUtama: 'Sesi coaching alur TIRTA bersama Kepala Sekolah untuk merefleksikan hasil supervisi kelas dan pemenuhan 8 SNP.',
        targetOutput: 'Laporan evaluasi pendampingan berdiferensiasi Siklus I dan rekomendasi tindak lanjut Siklus II.',
        linimasa: 'Akhir November 2026',
        pihakTerlibat: 'Pengawas Pembina, Kepala Sekolah',
        indikatorKeberhasilan: 'Tersusunnya matriks RTL mandiri oleh Kepala Sekolah.',
        status: 'Terjadwal'
      }
    ]
  },
  {
    id: 'rpb-002',
    title: 'Rencana Pendampingan Berdiferensiasi (RPB) Satuan Pendidikan: Akselerasi Sekolah Rujukan Digital',
    principalId: 'KS001',
    schoolName: 'SMP Negeri 1 Merdeka Nusantara',
    schoolNpsn: '40301234',
    headmasterName: 'Dra. Hj. Nurhasanah, M.Pd.',
    headmasterNip: '19720815 199802 2 003',
    headmasterRank: 'Pembina Tk. I (IV/b)',
    supervisorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    supervisorNip: '19830819 201001 1 002',
    supervisorRole: 'Pengawas Sekolah Pembina',
    supervisorRank: 'Penata Tk. I / III.d',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    date: '2026-08-10',
    quadrant: 'Kuadran I: Mandiri (Kapasitas Tinggi, Komitmen Tinggi)',
    strategy: 'Pemacu Perubahan (Catalyst)',
    leadershipCapacity: 'Tinggi',
    changeCommitment: 'Tinggi',
    raporPriorities: [
      'D.1 Kualitas Pembelajaran',
      'A.2 Kemampuan Numerasi',
      'D.8 Iklim Kebinekaan'
    ],
    baselineDiagnosis:
      'Satuan pendidikan memiliki modal kepemimpinan kepala sekolah yang sangat visioner dan budaya belajar mandiri guru yang sudah mengakar. Rapor pendidikan berada di zona hijau dengan mayoritas guru aktif berbagi di Platform Merdeka Mengajar (PMM). Pendampingan difokuskan pada perluasan dampak (pengimbasan ke sekolah sekitar) dan inovasi pembelajaran tingkat lanjut.',
    generalObjective:
      'Memfasilitasi akselerasi sekolah rujukan digital tingkat kabupaten, memacu kepemimpinan murid (student agency), serta memperluas jejaring pengimbasan praktik baik ke MGMP Kabupaten Sidenreng Rappang.',
    status: 'final',
    createdAt: '2026-08-10T09:00:00Z',
    updatedAt: '2026-10-25T14:20:00Z',
    supervisorNotes:
      'Pola pendampingan menggunakan Coaching murni dan kemitraan strategis. Kepala sekolah memiliki otonomi tinggi dalam merumuskan terobosan instruksional.',
    items: [
      {
        id: 'rpbi-201',
        tahap: 'Perencanaan Program',
        fokusAspek: 'Co-Design Rencana Aksi Inovasi Numerasi Berbasis Masalah Lingkungan',
        metode: 'Coaching',
        aktivitasUtama: 'Dialog eksplorasi ide integrasi riset proyek siswa ke dalam program kurikulum intrakurikuler dan kokurikuler P5.',
        targetOutput: 'Rancangan desain pembelajaran interdisipliner terpadu berbasis komputasi.',
        linimasa: 'Agustus 2026',
        pihakTerlibat: 'Pengawas Pembina, Kepala Sekolah, Koordinator P5',
        indikatorKeberhasilan: 'Penerapan modul ajar inovatif berbasis HOTS di seluruh jenjang kelas VII-IX.',
        status: 'Terealisasi'
      },
      {
        id: 'rpbi-202',
        tahap: 'Pelaksanaan Program',
        fokusAspek: 'Pengimbasan Praktik Baik & Komunitas Belajar Antar-Sekolah Binaan',
        metode: 'Fasilitasi',
        aktivitasUtama: 'Mendorong guru-guru penggerak sekolah menjadi narasumber berbagi di MGMP rayon untuk mendampingi sekolah kuadran berkembang.',
        targetOutput: 'Kegiatan diseminasi praktik baik reguler lintas sekolah di Sidrap.',
        linimasa: 'September - November 2026',
        pihakTerlibat: 'Pengawas, Kepala Sekolah, Pendidik Penggerak, Pengurus MGMP',
        indikatorKeberhasilan: 'Minimal 3 sekolah binaan sekitar mengadopsi model asesmen portofolio digital.',
        status: 'Sedang Berjalan'
      },
      {
        id: 'rpbi-203',
        tahap: 'Evaluasi & Refleksi',
        fokusAspek: 'Audit Kinerja Mutu Berkelanjutan & Pemantauan Portofolio Pendidik',
        metode: 'Konsultasi',
        aktivitasUtama: 'Konsultasi telaah dampak program pendampingan terhadap capaian asesmen sumatif murid dan kebahagiaan belajar (well-being).',
        targetOutput: 'Laporan evaluasi diri sekolah berbasis dampak dan publikasi karya ilmiah populer.',
        linimasa: 'Desember 2026',
        pihakTerlibat: 'Pengawas Pembina, Kepala Sekolah, Komite Sekolah',
        indikatorKeberhasilan: 'Indeks kepuasan warga sekolah dan capaian mutu bertahan di predikat Amat Baik.',
        status: 'Terjadwal'
      }
    ]
  }
];
