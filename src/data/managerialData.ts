/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ManagerialDimensionDef } from '../types/inspiro';

// Generic standard rubric generator to guarantee consistent 1-4 descriptive rubrics for all 138 indicators
function createIndicator(
  id: string,
  dimensionKey: string,
  number: number,
  text: string,
  guidance?: string
) {
  return {
    id,
    dimensionKey,
    number,
    text,
    evidenceGuidance: guidance || 'Dokumen fisik, arsip berkas, SK resmi, atau portofolio implementasi sekolah.',
    rubrics: {
      1: `Belum tersedia dokumen atau belum dilaksanakan di sekolah (Belum memenuhi standar minimum).`,
      2: `Dokumen atau pelaksanaan ada sebagian, namun belum tertata tertib, belum disahkan, atau belum mutakhir.`,
      3: `Tersedia lengkap, sah, terstruktur, dan terlaksana secara rutin sesuai regulasi standar nasional.`,
      4: `Sangat lengkap, mutakhir, terdigitalisasi rapi, dievaluasi berkala, dan berdampak nyata bagi mutu sekolah.`
    }
  };
}

export const COMPLETE_MANAGERIAL_DIMENSIONS: ManagerialDimensionDef[] = [
  // 1. MANAJEMEN KURIKULUM DAN PEMBELAJARAN (18 INDIKATOR)
  {
    key: 'kurikulum',
    number: 1,
    title: 'Manajemen Kurikulum dan Pembelajaran',
    shortTitle: 'Kurikulum & Pembelajaran',
    description: 'Tata kelola KSP/KTSP, beban tugas mengajar guru, evaluasi perangkat ajar, kalender akademik, program supervisi akademik, P5, dan asesmen.',
    iconName: 'BookOpen',
    color: 'blue',
    badgeBg: 'bg-blue-50',
    badgeBorder: 'border-blue-200',
    badgeText: 'text-blue-700',
    items: [
      createIndicator('kur-1', 'kurikulum', 1, 'Tersedianya dokumen Kurikulum Satuan Pendidikan (KSP/KTSP) yang sah dan mutakhir.', 'Dokumen KSP bertanda tangan Kepala Sekolah, Komite, & Pengesahan Dinas Pendidikan.'),
      createIndicator('kur-2', 'kurikulum', 2, 'Adanya pembagian tugas mengajar guru dan jadwal pelajaran yang terstruktur.', 'SK Pembagian Tugas Mengajar, Jadwal Pelajaran Mingguan, dan rekap beban jam.'),
      createIndicator('kur-3', 'kurikulum', 3, 'Terlaksananya evaluasi berkala terhadap perangkat pembelajaran guru (Capaian Pembelajaran, Alur Tujuan Pembelajaran, atau Silabus/RPP).', 'Instrumen telaah modul ajar, buku catatan feedback pengawas/kepsek.'),
      createIndicator('kur-4', 'kurikulum', 4, 'Adanya program kalender akademik sekolah yang menyesuaikan dengan kalender pendidikan daerah.', 'Kalender Akademik Sekolah resmi tahun ajaran berjalan yang disinkronkan dengan Kaldik Disdikbud.'),
      createIndicator('kur-5', 'kurikulum', 5, 'Tersedianya dokumen hasil analisis pencapaian target kurikulum dan ketuntasan belajar siswa per semester.', 'Rekapitulasi persentase ketuntasan capaian pembelajaran dan daya serap kurikulum.'),
      createIndicator('kur-6', 'kurikulum', 6, 'Adanya jadwal dan program pelaksanaan supervisi akademik kelas oleh Kepala Sekolah secara berkala.', 'Program tahunan supervisi akademik, jadwal observasi kelas per guru, dan instrumen monev.'),
      createIndicator('kur-7', 'kurikulum', 7, 'Tersedianya dokumen laporan tindak lanjut hasil supervisi akademik berupa bimbingan atau pelatihan guru.', 'Laporan tindak lanjut (RTL), notulen coaching klinis, rekomendasi diklat guru.'),
      createIndicator('kur-8', 'kurikulum', 8, 'Adanya dokumen regulasi sekolah mengenai pembagian beban belajar dan kriteria kelulusan/kenaikan kelas.', 'SK Kriteria Kenaikan Kelas dan Kelulusan yang disahkan dalam rapat dewan guru.'),
      createIndicator('kur-9', 'kurikulum', 9, 'Tersedianya dokumen hasil refleksi bersama guru terkait kendala implementasi kurikulum di akhir semester.', 'Notulen rapat evaluasi semester, lembar refleksi kendala KBM, dan rencana perbaikan.'),
      createIndicator('kur-10', 'kurikulum', 10, 'Adanya dokumen pengembangan muatan lokal (mulok) yang disesuaikan dengan potensi daerah sekolah.', 'Silabus/Modul Ajar Mulok berbasis kearifan lokal daerah Kabupaten Sidenreng Rappang.'),
      createIndicator('kur-11', 'kurikulum', 11, 'Tersedianya dokumen pembagian kelompok belajar/proyek berbasis Profil Pelajar Pancasila (P5) beserta modulnya.', 'Modul P5, SK Koordinator & Fasilitator Projek, jadwal pelaksanaan, rubrik asesmen dimensi P5.'),
      createIndicator('kur-12', 'kurikulum', 12, 'Adanya bukti fisik pelaksanaan lokakarya (workshop) internal sekolah untuk menyelaraskan perangkat ajar.', 'Daftar hadir, foto dokumentasi, materi workshop IHT/Kombel penyusunan modul ajar.'),
      createIndicator('kur-13', 'kurikulum', 13, 'Tersedianya bank soal atau instrumen asesmen yang telah melalui proses telaah kualitatif oleh tim sejawat.', 'Kumpulan kisi-kisi, naskah asesmen sumatif/formatif, kartu soal, dan lembar telaah sejawat.'),
      createIndicator('kur-14', 'kurikulum', 14, 'Adanya dokumen analisis ketercapaian target kurikulum (target kurikulum tercapai vs tidak tercapai).', 'Grafik atau tabel persentase ketercapaian materi pokok per mata pelajaran.'),
      createIndicator('kur-15', 'kurikulum', 15, 'Tersedianya rekapitulasi data jam mengajar nyata guru untuk memastikan kesesuaian dengan jadwal pelajaran.', 'Jurnal mengajar guru, rekapitulasi jam riil tatap muka vs e-Kinerja/Dapodik.'),
      createIndicator('kur-16', 'kurikulum', 16, 'Adanya jadwal piket pemantauan KBM harian oleh guru piket atau pimpinan sekolah.', 'Jadwal guru piket harian, buku jurnal piket, dan laporan catatan kelas kosong/terisi.'),
      createIndicator('kur-17', 'kurikulum', 17, 'Tersedianya program pendampingan khusus bagi guru baru atau guru yang memerlukan peningkatan metode mengajar.', 'Program induksi guru pemula (PIGP) atau program mentoring oleh guru senior/guru penggerak.'),
      createIndicator('kur-18', 'kurikulum', 18, 'Adanya laporan keterlibatan pengawas pembina dalam penyusunan dan penandatanganan dokumen kurikulum.', 'Berita acara pendampingan pengawas sekolah, lembar verifikasi KSP, dan tanda tangan pengesahan.')
    ]
  },

  // 2. MANAJEMEN KESISWAAN (18 INDIKATOR)
  {
    key: 'kesiswaan',
    number: 2,
    title: 'Manajemen Kesiswaan',
    shortTitle: 'Kesiswaan & Disiplin Positif',
    description: 'Tata kelola PPDB, validitas buku induk/presensi, pembinaan bakat ekskul, layanan BK, OSIS, anti-perundungan, dan tracer alumni.',
    iconName: 'Users',
    color: 'emerald',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-200',
    badgeText: 'text-emerald-700',
    items: [
      createIndicator('sis-1', 'kesiswaan', 1, 'Adanya dokumen Penerimaan Peserta Didik Baru (PPDB) yang transparan dan tertib.', 'Juknis PPDB Sekolah, SK Panitia, formulir pendaftaran, pengumuman hasil seleksi, berita acara.'),
      createIndicator('sis-2', 'kesiswaan', 2, 'Tersedianya data induk siswa, mutasi siswa, dan rekapitulasi kehadiran siswa secara valid.', 'Buku Induk Siswa fisik/digital, Buku Klapper, register mutasi, rekap presensi bulanan.'),
      createIndicator('sis-3', 'kesiswaan', 3, 'Adanya program pembinaan bakat, minat, dan prestasi siswa melalui ekstrakurikuler.', 'Program kerja ekstrakurikuler, SK Pembina/Pelatih, jadwal latihan rutin, rekap piala/prestasi.'),
      createIndicator('sis-4', 'kesiswaan', 4, 'Terlaksananya penegakan tata tertib siswa dan program bimbingan konseling (BK).', 'Buku Tata Tertib Siswa, Buku Jurnal Kasus/Konseling BK, program bimbingan pribadi/sosial/karir.'),
      createIndicator('sis-5', 'kesiswaan', 5, 'Tersedianya buku rekam jejak prestasi siswa, baik di bidang akademik maupun non-akademik.', 'Buku rekam prestasi, piagam kejuaraan O2SN, FLS2N, OSN, kompetisi lokal & nasional.'),
      createIndicator('sis-6', 'kesiswaan', 6, 'Adanya program penelusuran lulusan (tracer study) atau pendataan kelanjutan studi alumni.', 'Format dan database tracer alumni yang melanjutkan ke SMA/SMK/MA favorit.'),
      createIndicator('sis-7', 'kesiswaan', 7, 'Tersedianya dokumen/buku laporan penanganan kasus siswa dan layanan klinis bimbingan konseling.', 'Buku kasus siswa, dokumentasi home visit, dan catatan konseling individual/kelompok.'),
      createIndicator('sis-8', 'kesiswaan', 8, 'Adanya organisasi kesiswaan yang aktif (seperti OSIS/MPK) lengkap dengan program kerja dan laporan kegiatannya.', 'SK Pembina OSIS/MPK, AD/ART OSIS, LPJ kegiatan OSIS, pemilihan ketua OSIS demokratis.'),
      createIndicator('sis-9', 'kesiswaan', 9, 'Tersedianya dokumen program Masa Pengenalan Lingkungan Sekolah (MPLS) beserta laporan pelaksanaannya.', 'Proposal/Panduan MPLS ramah anak, jadwal kegiatan, tata tertib, dan laporan evaluasi MPLS.'),
      createIndicator('sis-10', 'kesiswaan', 10, 'Adanya rekapitulasi data ketidakhadiran (absen) siswa secara berkala yang dilaporkan kepada wali murid.', 'Rekapitulasi absensi per kelas bulanan, surat pemberitahuan pemanggilan wali murid.'),
      createIndicator('sis-11', 'kesiswaan', 11, 'Tersedianya buku register mutasi keluar dan mutasi masuk siswa lengkap dengan berkas pendukungnya.', 'Buku register mutasi, surat permohonan orang tua, surat keterangan pindah sekolah sah dinas.'),
      createIndicator('sis-12', 'kesiswaan', 12, 'Adanya SK pengangkatan pembina ekstrakurikuler dan jadwal latihan rutin masing-masing cabang.', 'SK Kepala Sekolah untuk pembina Pramuka, PMR, Olahraga, Seni, KIR, Rohis/Rokris.'),
      createIndicator('sis-13', 'kesiswaan', 13, 'Tersedianya dokumen rekapitulasi penanganan kasus perundungan (bullying) atau kekerasan di tingkat kesiswaan.', 'Log aduan TPPK sekolah, berita acara penanganan kekerasan/perundungan, dan pemulihan psikologis.'),
      createIndicator('sis-14', 'kesiswaan', 14, 'Adanya papan atau grafik data perkembangan jumlah siswa (peta siswa) per tahun pelajaran.', 'Bagan peta kesiswaan di ruang kepsek/TU memuat rasio gender, agama, dan tren per angkatan.'),
      createIndicator('sis-15', 'kesiswaan', 15, 'Tersedianya instrumen dan hasil pemetaan bakat-minat siswa baru saat pertama kali masuk sekolah.', 'Angket asesmen diagnostik non-kognitif gaya belajar dan bakat minat saat masuk sekolah.'),
      createIndicator('sis-16', 'kesiswaan', 16, 'Adanya dokumen pemberian beasiswa atau bantuan sosial bagi siswa dari keluarga tidak mampu (PIP, dll).', 'Daftar penerima Program Indonesia Pintar (PIP), beasiswa daerah, dan bukti penyaluran.'),
      createIndicator('sis-17', 'kesiswaan', 17, 'Tersedianya piagam, piala, atau sertifikat penghargaan siswa yang terdokumentasi dengan baik di sekolah.', 'Lemari etalase piala sekolah terawat, arsip salinan sertifikat juara lomba siswa.'),
      createIndicator('sis-18', 'kesiswaan', 18, 'Adanya tata tertib siswa yang dicetak, ditempel di tempat strategis, atau dibagikan dalam bentuk buku saku.', 'Buku saku tata tertib disiplin positif, baliho/papan tata tertib di koridor sekolah.')
    ]
  },

  // 3. MANAJEMEN PENDIDIK DAN TENAGA KEPENDIDIKAN (18 INDIKATOR)
  {
    key: 'ptk',
    number: 3,
    title: 'Manajemen Pendidik dan Tenaga Kependidikan (PTK)',
    shortTitle: 'Pendidik & Tendik (PTK)',
    description: 'Analisis formasi PTK, penilaian kinerja guru & tendik (PKG/PMM), PKB/Kombel, file kepegawaian, penghargaan/sanksi, dan DUK.',
    iconName: 'GraduationCap',
    color: 'purple',
    badgeBg: 'bg-purple-50',
    badgeBorder: 'border-purple-200',
    badgeText: 'text-purple-700',
    items: [
      createIndicator('ptk-1', 'ptk', 1, 'Tersedianya dokumen analisis kebutuhan guru dan staf (tenaga kependidikan).', 'Dokumen Analisis Jabatan (Anjab) dan Analisis Beban Kerja (ABK) sesuai rasio rombel.'),
      createIndicator('ptk-2', 'ptk', 2, 'Terlaksananya program Penilaian Kinerja Guru (PKG) dan Penilaian Kinerja Tendik secara objektif.', 'Laporan PKG resmi, lembar observasi kelas, integrasi E-Kinerja BKN / Pengelolaan Kinerja PMM.'),
      createIndicator('ptk-3', 'ptk', 3, 'Adanya program pengembangan keprofesian berkelanjutan (PKB) seperti pelatihan, workshop, atau MGMP/KKG untuk guru.', 'SK Komunitas Belajar (Kombel) intra-sekolah, jadwal kegiatan berbagi praktik baik rutin.'),
      createIndicator('ptk-4', 'ptk', 4, 'Adanya file dokumentasi kepegawaian (SK, ijazah, sertifikat) yang tertata rapi.', 'Map file individu setiap PTK (SK CPNS/PNS/PPPK, KGB, SK Pangkat, Ijazah, Serdik).'),
      createIndicator('ptk-5', 'ptk', 5, 'Adanya dokumen analisis beban kerja guru untuk memastikan pemenuhan jam mengajar wajib.', 'Tabel rekapitulasi beban mengajar minimal 24 jam tatap muka linier per minggu.'),
      createIndicator('ptk-6', 'ptk', 6, 'Tersedianya data/grafik pemetaan kompetensi, kualifikasi akademik, dan status sertifikasi pendidik.', 'Papan profil PTK memuat jenjang S1/S2, status sertifikasi pendidik, dan pelatihan yang diikuti.'),
      createIndicator('ptk-7', 'ptk', 7, 'Adanya bukti fisik penghargaan (reward) atau sanksi (punishment) bagi guru dan tenaga kependidikan.', 'Piagam guru berdedikasi/berprestasi, surat apresiasi, atau surat teguran pembinaan disiplin.'),
      createIndicator('ptk-8', 'ptk', 8, 'Adanya dokumen usulan kenaikan pangkat atau pengembangan karier pegawai berkala.', 'Berkas usulan kenaikan pangkat (PAK), kenaikan gaji berkala (KGB), dan konversi predikat kinerja.'),
      createIndicator('ptk-9', 'ptk', 9, 'Tersedianya daftar urut kepangkatan (DUK) pegawai PNS/ASN yang selalu diperbarui (jika sekolah negeri).', 'Tabel DUK resmi pegawai ASN sekolah yang dimutakhirkan per periode April/Oktober.'),
      createIndicator('ptk-10', 'ptk', 10, 'Adanya buku pembinaan pegawai/guru oleh Kepala Sekolah berisi catatan teguran atau arahan lisan.', 'Buku catatan pembinaan internal kepemimpinan kepala sekolah terhadap integritas PTK.'),
      createIndicator('ptk-11', 'ptk', 11, 'Tersedianya rekapitulasi kehadiran (absensi elektronik/manual) guru dan staf tata usaha setiap bulan.', 'Rekap presensi bulanan (fingerprint/aplikasi mobile kehadiran dinas), rekap cuti/izin/sakit.'),
      createIndicator('ptk-12', 'ptk', 12, 'Adanya dokumen pembagian tugas tambahan guru (Wakasek, Kepala Lab, Kepala Perpus, Wali Kelas) disertai SK resmi.', 'SK Tugas Tambahan Kepala Sekolah, rincian ekuivalensi jam di Dapodik, dan laporan tupoksi.'),
      createIndicator('ptk-13', 'ptk', 13, 'Tersedianya bukti tindak lanjut hasil PKG berupa rekomendasi keikutsertaan guru dalam diklat/pelatihan.', 'Surat tugas pelatihan PMM/diklat kemendikbudristek sesuai rekomendasi rapor kinerja PKG.'),
      createIndicator('ptk-14', 'ptk', 14, 'Adanya jadwal berkala rapat dinas guru dan staf lengkap dengan daftar hadir dan notulen rapat.', 'Buku notulen rapat dinas bulanan, daftar hadir bertanda tangan seluruh PTK.'),
      createIndicator('ptk-15', 'ptk', 15, 'Tersedianya program orientasi/induksi bagi guru baru yang bertugas di lingkungan sekolah.', 'Panduan pengenalan iklim sekolah bagi guru baru, laporan pendampingan guru mentor.'),
      createIndicator('ptk-16', 'ptk', 16, 'Adanya dokumen penugasan guru dalam forum ilmiah luar sekolah (menjadi narasumber, juri, atau peserta seminar).', 'Surat tugas dinas kepala sekolah, sertifikat narasumber, piagam kepesertaan seminar nasional.'),
      createIndicator('ptk-17', 'ptk', 17, 'Tersedianya uraian tugas (job description) tertulis yang ditandatangani untuk setiap staf tenaga kependidikan.', 'Uraian tugas tertulis staf TU, bendahara, operator Dapodik, pustakawan, dan laboran.'),
      createIndicator('ptk-18', 'ptk', 18, 'Adanya file digital (e-dokumen) data kepegawaian yang terintegrasi untuk mempercepat pelayanan administrasi.', 'Folder Google Drive / server lokal arsip scan PDF berkas kepegawaian terenkripsi aman.')
    ]
  },

  // 4. MANAJEMEN SARANA DAN PRASARANA (18 INDIKATOR)
  {
    key: 'sarpras',
    number: 4,
    title: 'Manajemen Sarana dan Prasarana',
    shortTitle: 'Sarana & Prasarana',
    description: 'Buku inventaris aset, pemeliharaan gedung/lab, pemanfaatan digital TIK, SOP penghapusan aset, KIR, sanitasi, dan keamanan sekolah.',
    iconName: 'Building2',
    color: 'amber',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-200',
    badgeText: 'text-amber-700',
    items: [
      createIndicator('sar-1', 'sarpras', 1, 'Tersedianya buku Inventaris Barang sekolah (aset bergerak dan tidak bergerak).', 'Buku Induk Barang Inventaris (BIBI), Buku Golongan Inventaris, integrasi SIMDA Aset Daerah.'),
      createIndicator('sar-2', 'sarpras', 2, 'Adanya program pemeliharaan, perawatan, dan perbaikan fasilitas gedung, laboratorium, serta ruang kelas.', 'Jadwal preventive maintenance, buku catatan perbaikan sarpras, alokasi anggaran pemeliharaan.'),
      createIndicator('sar-3', 'sarpras', 3, 'Terwujudnya pemanfaatan sarana digital (komputer, proyektor, internet) untuk mendukung pembelajaran dan manajemen.', 'Jadwal lab TIK/Chromebook, proyektor terpasang, koneksi Wi-Fi stabil, log pemakaian KBM.'),
      createIndicator('sar-4', 'sarpras', 4, 'Adanya regulasi/prosedur operasional standar (SOP) penghapusan sarana prasarana yang sudah rusak berat.', 'SOP Penghapusan Aset, Berita Acara Pemeriksaan Barang Rusak Berat, surat usulan ke dinas/BPKAD.'),
      createIndicator('sar-5', 'sarpras', 5, 'Adanya dokumen analisis kebutuhan sarana prasarana yang diselaraskan dengan rencana pengembangan sekolah.', 'Dokumen rencana kebutuhan sarpras berdasarkan skala prioritas 4 tahunan.'),
      createIndicator('sar-6', 'sarpras', 6, 'Tersedianya Kartu Inventaris Ruangan (KIR) yang ditempel di setiap ruangan sekolah.', 'KIR terpasang di setiap ruang kelas, lab IPA, ruang guru, lab komputer, dan ditandatangani penanggung jawab.'),
      createIndicator('sar-7', 'sarpras', 7, 'Tersedianya fasilitas sanitasi (toilet guru dan siswa) yang bersih, terpisah, dengan jumlah rasio yang memadai.', 'Kondisi toilet terpisah laki-laki/perempuan, air mengalir lancar, sabun cuci tangan, dan jadwal kebersihan.'),
      createIndicator('sar-8', 'sarpras', 8, 'Adanya sistem dan fasilitas keamanan sekolah seperti pagar keliling, pos satpam, atau perangkat CCTV.', 'Pagar sekolah kokoh, buku mutasi jaga pos satpam, kamera CCTV aktif di area vital sekolah.'),
      createIndicator('sar-9', 'sarpras', 9, 'Tersedianya buku catatan peminjaman dan pengembalian alat/barang inventaris sekolah.', 'Buku agenda peminjaman proyektor, kamera, mikrofon, alat olahraga, dan perlengkapan panggung.'),
      createIndicator('sar-10', 'sarpras', 10, 'Adanya dokumen bukti kepemilikan aset (Sertifikat Tanah, IMB, atau surat hibah resmi).', 'Salinan legalisir Sertifikat Hak Milik/Pakai Tanah Pemerintah, dokumen IMB gedung sekolah.'),
      createIndicator('sar-11', 'sarpras', 11, 'Tersedianya ruang ibadah (mushola/masjid) yang bersih dan didukung sarana perlengkapan ibadah yang layak.', 'Mushola sekolah terawat, tempat wudhu bersih, sajadah, mukena, Al-Quran tertata rapi.'),
      createIndicator('sar-12', 'sarpras', 12, 'Adanya program penataan estetika, penghijauan, dan pemanfaatan lahan kosong di lingkungan sekolah.', 'Taman sekolah, tanaman obat keluarga (TOGA), pohon peneduh, dan dekorasi mural edukatif.'),
      createIndicator('sar-13', 'sarpras', 13, 'Tersedianya denah lokasi sekolah dan papan petunjuk arah ruangan yang dipasang di tempat strategis.', 'Papan denah masterplan sekolah di lobi masuk, plang nama setiap ruangan jelas terlihat.'),
      createIndicator('sar-14', 'sarpras', 14, 'Adanya dokumen pelaporan barang rusak, hilang, atau dalam kondisi pemeliharaan berat.', 'Formulir laporan inventaris rusak/hilang dari pemakai ruangan kepada pengelola aset.'),
      createIndicator('sar-15', 'sarpras', 15, 'Tersedianya pasokan listrik dan jaringan air bersih yang stabil untuk mendukung operasional harian.', 'Daya listrik PLN memadai (ada genset cadangan jika memungkinkan), sumber air bersih PDAM/sumur bor lancar.'),
      createIndicator('sar-16', 'sarpras', 16, 'Adanya fasilitas penunjang UKS (Unit Kesehatan Sekolah) lengkap dengan obat-obatan P3K yang belum kedaluwarsa.', 'Ruang UKS dengan tempat tidur periksa, timbangan, tensimeter, kotak P3K dengan log obat aktif.'),
      createIndicator('sar-17', 'sarpras', 17, 'Tersedianya ruang perpustakaan dengan tata letak buku yang rapi menggunakan sistem katalog (digital/manual).', 'Ruang baca perpustakaan nyaman, sistem katalog e-Perpus/kartu, sirkulasi peminjaman tertib.'),
      createIndicator('sar-18', 'sarpras', 18, 'Adanya program pemeliharaan perangkat TIK (komputer, printer, router wifi) secara berkala oleh teknisi.', 'Kartu kendali servis berkala laptop/PC lab, pembersihan debu CPU, update antivirus & software.')
    ]
  },

  // 5. MANAJEMEN KEUANGAN DAN PEMBIAYAAN (18 INDIKATOR)
  {
    key: 'keuangan',
    number: 5,
    title: 'Manajemen Keuangan dan Pembiayaan',
    shortTitle: 'Keuangan & Pembiayaan',
    description: 'Penyusunan RKAS berbasis data (PBD), pembukuan kas tertib (BKU/Bank), pelaporan ARKAS, bukti transaksi/SPJ, audit pajak, dan transparansi publik.',
    iconName: 'Coins',
    color: 'teal',
    badgeBg: 'bg-teal-50',
    badgeBorder: 'border-teal-200',
    badgeText: 'text-teal-700',
    items: [
      createIndicator('keu-1', 'keuangan', 1, 'Tersedianya dokumen Rencana Kegiatan dan Anggaran Sekolah (RKAS) yang disahkan oleh komite dan dinas terkait.', 'Dokumen RKAS cetak dari ARKAS, lembar pengesahan Kepala Sekolah, Komite, dan Kadisdikbud.'),
      createIndicator('keu-2', 'keuangan', 2, 'Adanya pembukuan keuangan (Buku Kas Umum, Pembantu, Bank) yang tertib dan mutakhir.', 'BKU, Buku Pembantu Kas, Buku Bank, Buku Pajak ditutup akhir bulan dengan berita acara rekonsiliasi.'),
      createIndicator('keu-3', 'keuangan', 3, 'Terlaksananya pelaporan penggunaan dana (seperti dana BOS) secara transparan dan akuntabel melalui sistem resmi (misal: ARKAS).', 'Laporan K7a realisasi BOS di ARKAS tepat waktu dan tersinkronisasi 100%.'),
      createIndicator('keu-4', 'keuangan', 4, 'Adanya dokumen bukti transaksi resmi (nota, kuitansi, faktur pajak) yang valid untuk setiap pengeluaran.', 'SPJ lengkap bermeterai, nota toko asli, faktur pajak e-Billing/SSP, bukti transfer bank.'),
      createIndicator('keu-5', 'keuangan', 5, 'Adanya dokumen RKAS yang dipublikasikan secara terbuka kepada publik/orang tua (misal melalui papan pengumuman).', 'Papan transparansi penggunaan dana BOS dipasang di tempat umum sekolah, ringkasan APBS terbuka.'),
      createIndicator('keu-6', 'keuangan', 6, 'Tersedianya dokumen pelaporan pajak (seperti e-Faktur/e-Billing) yang diselesaikan tepat waktu.', 'Bukti setor pajak PPh 21, PPh 22, PPh 23, dan PPN melalui sistem perpajakan online teratur.'),
      createIndicator('keu-7', 'keuangan', 7, 'Adanya berita acara pemeriksaan kas secara berkala oleh Kepala Sekolah maupun Pengawas.', 'Berita Acara Cash Opname (pemeriksaan fisik brankas kas) setiap penutupan buku per triwulan.'),
      createIndicator('keu-8', 'keuangan', 8, 'Tersedianya pedoman penggalangan dana dari masyarakat/komite yang tidak mengikat dan sesuai regulasi.', 'Dokumen program sumbangan sukarela komite yang mematuhi Permendikbud No. 75 Tahun 2016.'),
      createIndicator('keu-9', 'keuangan', 9, 'Tersedianya buku pembantu rincian objek belanja untuk mengontrol pengeluaran agar tidak melebihi pagu anggaran.', 'Buku kendali anggaran per kode rekening kegiatan untuk menghindari defisit pagu belanja.'),
      createIndicator('keu-10', 'keuangan', 10, 'Adanya sistem penyimpanan (arsip) berkas keuangan yang dikelompokkan per bulan dan aman dari risiko kerusakan.', 'Ordner SPJ per bulan tersusun rapi di lemari tahan api dan terlindung dari kelembapan.'),
      createIndicator('keu-11', 'keuangan', 11, 'Tersedianya dokumen LPJ (Laporan Pertanggungjawaban) tengah tahunan dan akhir tahunan yang ditandatangani pimpinan.', 'Buku Laporan Pertanggungjawaban Keuangan Semester I & II lengkap dengan lampiran rekap.'),
      createIndicator('keu-12', 'keuangan', 12, 'Adanya bukti pembayaran iuran/sumbangan sukarela (jika ada) yang dicatat dalam buku penerimaan khusus.', 'Buku kas pembantu sumbangan komite/donasi alumni lengkap dengan kuitansi nomor urut.'),
      createIndicator('keu-13', 'keuangan', 13, 'Tersedianya dokumen evaluasi kesesuaian antara realisasi pengeluaran keuangan dengan target serapan RKAS.', 'Tabel evaluasi deviasi serapan anggaran belanja operasional vs target capaian program sekolah.'),
      createIndicator('keu-14', 'keuangan', 14, 'Adanya bukti sosialisasi dan koordinasi bersama bendahara terkait perubahan aturan regulasi keuangan negara.', 'Notulen rapat koordinasi kepsek & bendahara menindaklanjuti juknis BOSP terbaru Kemendikbudristek.'),
      createIndicator('keu-15', 'keuangan', 15, 'Tersedianya rekening bank resmi atas nama instansi sekolah (bukan rekening atas nama pribadi).', 'Buku tabungan/rekening koran bank BPD/pemerintah resmi berbadan hukum nama sekolah binaan.'),
      createIndicator('keu-16', 'keuangan', 16, 'Adanya berita acara serah terima jabatan (jika ada pergantian bendahara) beserta lampiran rincian kas.', 'Berita acara timbang terima kas bendahara lama ke baru disaksikan kepala sekolah & pengawas.'),
      createIndicator('keu-17', 'keuangan', 17, 'Tersedianya dokumen pencatatan dana tak terduga untuk keperluan darurat atau insidental sekolah.', 'Buku register pengeluaran tanggap darurat (perbaikan pipa bocor, musibah siswa, dsb).'),
      createIndicator('keu-18', 'keuangan', 18, 'Adanya bukti audit eksternal (dari BPK, Inspektorat, atau Akuntan Publik) yang diarsipkan dengan baik.', 'Laporan Hasil Pemeriksaan (LHP) Inspektorat Daerah Kabupaten Sidrap / BPK tanpa temuan fatal.')
    ]
  },

  // 6. MANAJEMEN HUBUNGAN MASYARAKAT / HUMAS (16 INDIKATOR)
  {
    key: 'humas',
    number: 6,
    title: 'Manajemen Hubungan Masyarakat (Humas)',
    shortTitle: 'Humas & Kemitraan',
    description: 'Keaktifan Komite Sekolah, kerja sama MoU eksternal, media informasi publik, parenting day, penanganan aduan warga, dan survei kepuasan.',
    iconName: 'HeartHandshake',
    color: 'rose',
    badgeBg: 'bg-rose-50',
    badgeBorder: 'border-rose-200',
    badgeText: 'text-rose-700',
    items: [
      createIndicator('hum-1', 'humas', 1, 'Terbentuknya pengurus Komite Sekolah yang aktif mendukung program kerja sekolah.', 'SK Penetapan Komite Sekolah, Program Kerja Komite, Notulen Rapat Koordinasi berkala.'),
      createIndicator('hum-2', 'humas', 2, 'Adanya dokumen kerja sama (MoU) antara sekolah dengan pihak luar (dunia usaha/industri, puskesmas, kepolisian, atau lembaga alumni).', 'Naskah Perjanjian Kerja Sama (MoU) yang masih berlaku dengan instansi mitra multi-sektor.'),
      createIndicator('hum-3', 'humas', 3, 'Tersedianya media informasi sekolah yang aktif (website, media sosial, atau papan pengumuman) untuk akuntabilitas publik.', 'Tautan website resmi sekolah, akun Instagram/Facebook aktif, papan buletin informasi.'),
      createIndicator('hum-4', 'humas', 4, 'Adanya dokumen notulen rapat, daftar hadir, dan dokumentasi pertemuan berkala dengan orang tua siswa.', 'Daftar hadir dan foto pertemuan parenting / penerimaan rapor bersama orang tua/wali murid.'),
      createIndicator('hum-5', 'humas', 5, 'Adanya program kerja humas yang memfasilitasi keluhan atau masukan dari masyarakat sekitar sekolah.', 'Kotak saran, nomor layanan aduan (hotline/WA), formulir penanganan komplain publik.'),
      createIndicator('hum-6', 'humas', 6, 'Tersedianya dokumen laporan keterlibatan masyarakat dalam mendukung kegiatan hari besar atau program sosial sekolah.', 'Dokumen partisipasi warga dalam PHBI/PHBN, pentas seni, kerja bakti lingkungan sekitar.'),
      createIndicator('hum-7', 'humas', 7, 'Tersedianya buletin, brosur, atau flayer profil sekolah sebagai media promosi dan informasi publik.', 'Brosur profil sekolah, leaflet PPDB, majalah dinding sekolah, profil video sekolah.'),
      createIndicator('hum-8', 'humas', 8, 'Adanya dokumen pelaksanaan program kerja Ikatan Alumni sekolah beserta kontribusinya.', 'Database ikatan alumni, bukti kontribusi beasiswa, donasi buku, atau sharing alumni inspiratif.'),
      createIndicator('hum-9', 'humas', 9, 'Tersedianya buku tamu dinas, buku tamu umum, dan buku saran masukan dari pihak luar di meja resepsionis.', 'Buku tamu dinas pejabat/pengawas, buku tamu kunjungan orang tua di lobi depan sekolah.'),
      createIndicator('hum-10', 'humas', 10, 'Adanya bukti publikasi prestasi sekolah atau berita kegiatan sekolah melalui media massa (cetak/online).', 'Kliping koran atau tautan berita liputan media massa online tentang kegiatan sekolah.'),
      createIndicator('hum-11', 'humas', 11, 'Tersedianya dokumen koordinasi dengan RT/RW atau tokoh masyarakat setempat dalam menjaga kondusivitas lingkungan.', 'Surat pemberitahuan kegiatan sekolah ke lurah/kepala desa/RT/RW, notulen pertemuan warga.'),
      createIndicator('hum-12', 'humas', 12, 'Adanya program bakti sosial sekolah untuk masyarakat sekitar (misal: pembagian sembako, donor darah, dll).', 'Proposal dan dokumentasi bakti sosial Ramadan, santunan anak yatim, bantuan korban bencana.'),
      createIndicator('hum-13', 'humas', 13, 'Tersedianya kuesioner atau instrumen survei kepuasan masyarakat/wali murid terhadap layanan sekolah.', 'Instrumen kuesioner survei indeks kepuasan masyarakat (IKM) berbasis Google Forms/kertas.'),
      createIndicator('hum-14', 'humas', 14, 'Adanya dokumen laporan hasil evaluasi kepuasan masyarakat beserta rencana perbaikan layanannya.', 'Laporan rekapitulasi skor kepuasan layanan sekolah dan rekomendasi rencana aksi pembenahan.'),
      createIndicator('hum-15', 'humas', 15, 'Tersedianya wadah komunikasi digital (seperti grup WhatsApp/Telegram kelas) antara wali kelas dan orang tua.', 'Grup komunikasi resmi paguyuban orang tua per kelas yang dipandu sopan oleh wali kelas.'),
      createIndicator('hum-16', 'humas', 16, 'Adanya program "Parenting Day" atau kelas orang tua untuk menyelaraskan pendidikan di rumah dan di sekolah.', 'Jadwal seminar parenting, materi sosialisasi pencegahan kecanduan gawai dan perundungan.')
    ]
  },

  // 7. MANAJEMEN ADMINISTRASI KANTOR & KELEMBAGAAN (16 INDIKATOR)
  {
    key: 'administrasi',
    number: 7,
    title: 'Manajemen Administrasi Kantor & Kelembagaan',
    shortTitle: 'Administrasi & Kelembagaan',
    description: 'Penyusunan dokumen RKJM 4 tahunan & RKT, tata kelola persuratan/arsip, struktur organisasi & tupoksi, SOP layanan, Dapodik, dan akreditasi.',
    iconName: 'FileText',
    color: 'indigo',
    badgeBg: 'bg-indigo-50',
    badgeBorder: 'border-indigo-200',
    badgeText: 'text-indigo-700',
    items: [
      createIndicator('adm-1', 'administrasi', 1, 'Tersedianya dokumen Rencana Kerja Jangka Menengah (RKJM) 4 tahunan dan Rencana Kerja Tahunan (RKT).', 'Buku Dokumen RKJM 4 Tahun, Buku RKT Tahunan yang disahkan Tim Pengembang Sekolah dan Kepala Sekolah.'),
      createIndicator('adm-2', 'administrasi', 2, 'Terlaksananya sistem persuratan (surat masuk dan surat keluar) serta pengarsipan dokumen secara tertib.', 'Buku Agenda Surat Masuk/Keluar, file ordner arsip surat, lembar disposisi Kepala Sekolah.'),
      createIndicator('adm-3', 'administrasi', 3, 'Adanya kejelasan struktur organisasi sekolah beserta uraian tugas (job description) masing-masing staf.', 'Bagan Struktur Organisasi Sekolah yang terpasang, SK Pembagian Tugas Tendik/Staf, uraian tupoksi.'),
      createIndicator('adm-4', 'administrasi', 4, 'Tersedianya dokumen Standard Operating Procedure (SOP) untuk seluruh layanan administrasi sekolah.', 'Buku kumpulan SOP PPDB, mutasi, legalisir ijazah, peminjaman lab, izin guru, surat dinas.'),
      createIndicator('adm-5', 'administrasi', 5, 'Adanya sistem pendataan digital terpadu (seperti Dapodik atau EMIS) yang di-update tepat waktu.', 'Berita acara sinkronisasi Dapodik tepat waktu, validasi data residu 0% tanpa anomali NISN.'),
      createIndicator('adm-6', 'administrasi', 6, 'Tersedianya ruang kerja kepala sekolah, tata usaha, dan ruang guru yang representatif dan teratur.', 'Tata letak meja kerja bersih, ventilasi nyaman, penataan arsip sistematis, sarana kerja lengkap.'),
      createIndicator('adm-7', 'administrasi', 7, 'Tersedianya papan data statistik (monografi sekolah) yang memuat grafik jumlah siswa, guru, kelas, dan kelulusan.', 'Papan monografi data statistik sekolah ter-update di ruang tata usaha/ruang kepala sekolah.'),
      createIndicator('adm-8', 'administrasi', 8, 'Adanya buku agenda surat masuk, surat keluar, serta lembar disposisi Kepala Sekolah yang berjalan tertib.', 'Format lembar disposisi tercatat rapi mengikuti alur delegasi wewenang pimpinan.'),
      createIndicator('adm-9', 'administrasi', 9, 'Tersedianya lemari atau ruang khusus arsip berdokumen penting (Sertifikat, SK asli, Raport lama) yang terkunci aman.', 'Ruang arsip/lemari berkunci khusus penyimpanan ijazah belum terambil, rapor lama, buku induk.'),
      createIndicator('adm-10', 'administrasi', 10, 'Adanya dokumen izin operasional sekolah atau dokumen akreditasi sekolah yang masih berlaku sah.', 'Sertifikat Akreditasi BAN-PDM/SM (A/B) yang masih berlaku dan SK Izin Operasional Sekolah.'),
      createIndicator('adm-11', 'administrasi', 11, 'Tersedianya sistem penomoran surat kedinasan yang konsisten dan patuh terhadap tata naskah dinas resmi.', 'Pedoman kode klasifikasi nomor surat dinas sesuai instruksi bupati/kepala dinas pendidikan.'),
      createIndicator('adm-12', 'administrasi', 12, 'Adanya dokumen visi, misi, dan tujuan sekolah yang terpampang jelas di ruang utama atau lobi sekolah.', 'Pigura visi misi tujuan sekolah terpasang artistik dan terbaca jelas oleh seluruh pengunjung.'),
      createIndicator('adm-13', 'administrasi', 13, 'Tersedianya rencana program kerja tata usaha (administrasi) tahunan yang terarah.', 'Program kerja tahunan Kepala Tata Usaha (KTU) beserta kalender kerja administrasi sekolah.'),
      createIndicator('adm-14', 'administrasi', 14, 'Adanya bukti fisik pelaporan berkas administrasi secara rutin ke Dinas Pendidikan tingkat kabupaten/provinsi.', 'Tanda terima berkas laporan bulanan (lapbul) sekolah ke Subbag Perencanaan & Kepegawaian Disdikbud.'),
      createIndicator('adm-15', 'administrasi', 15, 'Tersedianya daftar inventaris alat tulis kantor (ATK) dan logistik habis pakai yang terkontrol.', 'Buku stok persediaan ATK (kertas, tinta printer, map, spidol) dengan kartu kendali keluar masuk barang.'),
      createIndicator('adm-16', 'administrasi', 16, 'Adanya pemanfaatan aplikasi persuratan digital (jika daerah sudah menerapkan) untuk efisiensi birokrasi.', 'Penggunaan aplikasi Srikandi / e-Office dinas dalam pengiriman surat dan disposisi elektronik.')
    ]
  },

  // 8. LINGKUNGAN DAN BUDAYA SEKOLAH (16 INDIKATOR)
  {
    key: 'lingkungan',
    number: 8,
    title: 'Lingkungan dan Budaya Sekolah',
    shortTitle: 'Lingkungan & Budaya',
    description: 'Sekolah bersih, aman, ramah anak, pembiasaan karakter Profil Pelajar Pancasila, mitigasi bencana, TPPK, kantin sehat, dan sanitasi wastafel.',
    iconName: 'ShieldCheck',
    color: 'emerald',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-200',
    badgeText: 'text-emerald-700',
    items: [
      createIndicator('bud-1', 'lingkungan', 1, 'Terwujudnya lingkungan sekolah yang bersih, sehat, aman, dan ramah anak.', 'Lingkungan sekolah asri, toilet higienis, program UKS, sertifikat kantin sehat, SK Sekolah Ramah Anak.'),
      createIndicator('bud-2', 'lingkungan', 2, 'Terlaksananya pembiasaan nilai-nilai karakter (misalnya upacara bendera, literasi, doa bersama, atau penerapan Profil Pelajar Pancasila).', 'Jadwal pembiasaan karakter (upacara, tadarus/kebaktian, literasi 15 menit, senyum sapa salam), jurnal P5.'),
      createIndicator('bud-3', 'lingkungan', 3, 'Adanya mekanisme penanganan konflik internal dan mitigasi bencana di lingkungan sekolah.', 'SOP resolusi konflik warga sekolah, simulasi evakuasi bencana gempa/kebakaran rutin.'),
      createIndicator('bud-4', 'lingkungan', 4, 'Adanya Surat Keputusan (SK) Tim Pencegahan dan Penanganan Kekerasan (TPPK) beserta program kerjanya.', 'SK TPPK terdaftar resmi di portal Kemendikbudristek, alur pelaporan kekerasan terpasang jelas.'),
      createIndicator('bud-5', 'lingkungan', 5, 'Tersedianya jalur evakuasi, titik kumpul yang jelas, serta Alat Pemadam Api Ringan (APAR) yang siap pakai.', 'Papan penunjuk jalur evakuasi di koridor, titik kumpul di lapangan, tabung APAR dengan kartu periksa aktif.'),
      createIndicator('bud-6', 'lingkungan', 6, 'Adanya dokumen pelaksanaan program kebersihan lingkungan sekolah (seperti Jumat Bersih atau gerakan penghijauan).', 'Foto dan jadwal kegiatan Jumat Bersih/Sabtu Hijau, aksi penanaman bibit pohon oleh murid.'),
      createIndicator('bud-7', 'lingkungan', 7, 'Tersedianya slogan, poster, atau baliho kampanye lingkungan (misal: anti-narkoba, kawasan bebas rokok, hemat energi).', 'Banner kawasan tanpa rokok (KTR), stiker matikan lampu jika selesai, poster anti-bullying di dinding.'),
      createIndicator('bud-8', 'lingkungan', 8, 'Adanya program pemilahan sampah organik dan anorganik beserta penyediaan tempat sampah terpisah.', 'Tempat sampah berlabel warna terpisah (organik, anorganik, B3) di depan setiap ruang kelas.'),
      createIndicator('bud-9', 'lingkungan', 9, 'Tersedianya dokumen tata tertib kehidupan sosial sekolah untuk mencegah diskriminasi suku, ras, dan agama.', 'Deklarasi komitmen toleransi antarumat beragama dan budaya inklusi sosial tertulis.'),
      createIndicator('bud-10', 'lingkungan', 10, 'Adanya kantin sehat sekolah yang dipantau kebersihannya serta kelayakan jajanan yang dijual.', 'Pemeriksaan berkala higienitas kantin sekolah oleh petugas UKS / Puskesmas setempat.'),
      createIndicator('bud-11', 'lingkungan', 11, 'Tersedianya fasilitas cuci tangan (wastafel) beserta sabun di depan setiap deretan kelas.', 'Wastafel dengan kran air mengalir lancar dan botol sabun cuci tangan di setiap selasar kelas.'),
      createIndicator('bud-12', 'lingkungan', 12, 'Adanya agenda rutin perayaan hari besar nasional dan keagamaan sebagai wujud toleransi dan nasionalisme.', 'Dokumentasi peringatan Hari Kemerdekaan, Hari Guru, Maulid Nabi, Natal bersama, dsb.'),
      createIndicator('bud-13', 'lingkungan', 13, 'Tersedianya sistem penanganan limbah sekolah (baik limbah domestik maupun limbah laboratorium jika ada).', 'Lubang biopori, tempat pembuangan sampah akhir (TPS) tertutup, dan netralisasi limbah kimia lab.'),
      createIndicator('bud-14', 'lingkungan', 14, 'Adanya regulasi internal berupa larangan membawa senjata tajam, obat terlarang, atau gawai di luar kepentingan belajar.', 'Surat pernyataan tata tertib ditandatangani orang tua, pemeriksaan berkala barang bawaan tas.'),
      createIndicator('bud-15', 'lingkungan', 15, 'Tersedianya program sekolah ramah anak (SRA) yang dideklarasikan bersama oleh guru, siswa, dan orang tua.', 'Naskah piagam deklarasi Sekolah Ramah Anak bertanda tangan Kepala Sekolah, Guru, Komite, & Siswa.'),
      createIndicator('bud-16', 'lingkungan', 16, 'Adanya dokumen evaluasi kenyamanan iklim lingkungan sekolah secara berkala melalui masukan civitas akademika.', 'Laporan evaluasi iklim keamanan sekolah dan survei lingkungan belajar (Sulingjar Rapor Pendidikan).')
    ]
  }
];

export const TOTAL_COMPLETE_ITEMS = COMPLETE_MANAGERIAL_DIMENSIONS.reduce(
  (acc, dim) => acc + dim.items.length,
  0
); // 138

export const MAX_COMPLETE_RAW_SCORE = TOTAL_COMPLETE_ITEMS * 4; // 552
