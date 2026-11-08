/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AcademicProContraRecord } from '../types/inspiro';

export const SEED_PRO_CONTRA_RECORDS: AcademicProContraRecord[] = [
  {
    id: 'pc-001',
    title: 'Matriks Analisis Pro-Kontra Inovasi Pembelajaran Berdiferensiasi & Integrasi PID',
    schoolName: 'UPT SD Negeri 4 Bilokka',
    schoolNpsn: '40301824',
    teacherId: 'T001',
    teacherName: 'Rahmatia, S.Pd',
    teacherNip: '19870412 201101 2 015',
    subject: 'IPAS (Ilmu Pengetahuan Alam dan Sosial)',
    gradeClass: 'Fase B / Kelas IV',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    date: '2026-10-28',
    headmasterName: 'Asnawi., S.Pd',
    headmasterNip: '19681231 200502 1 008',
    supervisorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    supervisorNip: '19830819 201001 1 002',
    supervisorRole: 'Pengawas Sekolah Pembina',
    supervisorRank: 'Penata Tk. I / III.d',
    notes:
      'Analisis dialektika supervisi akademik ini memetakan resistensi alami guru terhadap tuntutan paradigma baru Kurikulum Merdeka. Dengan membedah pro dan kontra secara transparan, pengawas dapat menyusun jembatan mediasi yang realistis tanpa membebani guru secara administratif.',
    status: 'final',
    createdAt: '2026-10-28T09:15:00Z',
    updatedAt: '2026-10-28T14:30:00Z',
    items: [
      {
        id: 'pci-1',
        aspek: 'Pembelajaran Berdiferensiasi (Proses & Konten)',
        pro: 'Mengakomodasi spektrum kesiapan belajar murid yang heterogen di kelas; menurunkan rasa cemas/frustrasi siswa berkemampuan lambat melalui scaffolding terpandu; siswa cepat tertantang dengan tugas pengayaan bermakna.',
        kontra: 'Guru mengeluhkan alokasi waktu persiapan modul ajar yang berlipat ganda; kesulitan mengontrol 3 kelompok aktivitas berbeda secara bersamaan; kekhawatiran materi kurikulum tidak tuntas tepat waktu.',
        analisisDampak: 'Bila keberatan guru diabaikan tanpa solusi, guru cenderung melakukan "diferensiasi semu" di atas kertas (administrasi RPP saja) namun praktik di kelas kembali ke metode ceramah monolog seragam.',
        aksiPenyelesaian: 'Pengawas dan Kepala Sekolah mengaktifkan Komunitas Belajar (Kombel) mingguan untuk co-planning (berbagi bank modul ajar diferensiasi); menerapkan sistem stasiun belajar mandiri (rotasi) bertahap; menyederhanakan format LKPD bertingkat.',
        status: 'Terealisasi'
      },
      {
        id: 'pci-2',
        aspek: 'Pemanfaatan Papan Interaktif Digital (PID) & Chromebook Murid',
        pro: 'Meningkatkan atensi dan keterlibatan aktif (*student hands-on engagement*) hingga >70%; memfasilitasi visualisasi konsep abstrak sains (simulasi interaktif PhET/Quizizz); mendukung literasi digital generasi Alpha.',
        kontra: 'Guru merasa cemas perangkat mahal mengalami kerusakan teknis; keterbatasan bandwidth internet saat jam sibuk; butuh waktu 10-15 menit untuk persiapan login akun Belajar.id siswa di awal sesi.',
        analisisDampak: 'Investasi perangkat bantuan TIK pemerintah berisiko mangkrak di lemari penyimpanan (*idle hardware*) atau hanya dijadikan proyektor layar pasif konvensional (level substitusi terendah).',
        aksiPenyelesaian: 'Pendampingan klinis 1-on-1 oleh pengawas; penunjukan 1 guru pionir muda sebagai pendamping teknis (*peer coaching*); membuat SOP pengoperasian santai tanpa rasa takut salah; penyediaan konten interaktif offline yang telah disinkronkan ke PID.',
        status: 'Dalam Proses'
      },
      {
        id: 'pci-3',
        aspek: 'Penerapan Segitiga Restitusi & Keyakinan Kelas (Disiplin Positif)',
        pro: 'Membangun disiplin dari kesadaran intrinsik murid tanpa rasa takut atau trauma; murid belajar bertanggung jawab memperbaiki kesalahan secara bermartabat; menciptakan iklim kelas yang aman dan inklusif.',
        kontra: 'Guru merasa penanganan pelanggaran butuh waktu dialog pribadi yang panjang di tengah jam mengajar padat; persepsi bahwa jika tidak ada sanksi tegas/hukuman fisik, murid tidak merasa jera dan wibawa guru melemah.',
        analisisDampak: 'Inkonsistensi guru dalam menindak indisipliner; sebagian siswa meremehkan aturan kelas bila restitusi disalahartikan sebagai kompromi atau pembiaran tanpa konsekuensi logis.',
        aksiPenyelesaian: 'Pemberian role-play & simulasi nyata 5 posisi kontrol guru (khususnya Manajer) pada pertemuan Kombel; perumusan Keyakinan Kelas visual yang ditempel di dinding kelas; kolaborasi dengan guru BK dan orang tua siswa.',
        status: 'Dalam Proses'
      },
      {
        id: 'pci-4',
        aspek: 'Asesmen Formatif Portofolio Digital & Umpan Balik Berkala',
        pro: 'Memberikan rekam jejak otentik perkembangan belajar siswa dari waktu ke waktu; siswa dilatih merefleksikan karya sendiri (*assessment as learning*); penilaian lebih manusiawi dibanding hanya angka ujian sumatif.',
        kontra: 'Guru kerepotan mengkurasi dokumen hasil karya puluhan siswa; kapasitas penyimpanan drive dan keterbatasan gawai murid di rumah untuk mengunggah artefak pembelajaran.',
        analisisDampak: 'Penilaian rapor kembali mengandalkan tes hafalan tertulis kognitif semata; motivasi belajar siswa tereduksi hanya pada perburuan nilai angka bukan penguasaan kompetensi mendalam.',
        aksiPenyelesaian: 'Menyediakan template Google Sites / Folder Drive bersama kelas yang terstruktur per tema; melibatkan murid secara mandiri untuk mengunggah 1 karya terbaik tiap bab; pengawas memberikan supervisi berbasis portofolio.',
        status: 'Rencana Tindak Lanjut'
      }
    ]
  },
  {
    id: 'pc-002',
    title: 'Matriks Analisis Pro-Kontra Supervisi Akademik: Model Pembelajaran Berbasis Masalah (PBL) & AI Literacy',
    schoolName: 'UPT SD Negeri 1 Teteaji',
    schoolNpsn: '40301820',
    teacherId: 'T002',
    teacherName: 'Hartina, S.Pd',
    teacherNip: '19890520 201403 2 004',
    subject: 'Matematika & Literasi Numerasi',
    gradeClass: 'Fase C / Kelas V',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    date: '2026-11-02',
    headmasterName: 'Mariana., S.Pd',
    headmasterNip: '19750314 199903 2 005',
    supervisorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    supervisorNip: '19830819 201001 1 002',
    supervisorRole: 'Pengawas Sekolah Pembina',
    supervisorRank: 'Penata Tk. I / III.d',
    notes:
      'Fokus supervisi membedah tantangan integrasi literasi Artificial Intelligence etis dan model Problem Based Learning. Pendekatan dialektika pro-kontra memudahkan identifikasi akar keengganan guru bertransformasi.',
    status: 'final',
    createdAt: '2026-11-02T10:00:00Z',
    updatedAt: '2026-11-02T15:20:00Z',
    items: [
      {
        id: 'pci-201',
        aspek: 'Implementasi Model Problem Based Learning (PBL) Kontekstual',
        pro: 'Mengasah nalar kritis murid melalui studi kasus nyata lingkungan persawahan Sidrap; murid aktif berkolaborasi memecahkan masalah kontekstual; pembelajaran bermakna dan aplikatif.',
        kontra: 'Dinamika kelas menjadi ramai dan terkesan tidak tertib oleh sebagian guru senior; durasi jam pelajaran seringkali melebihi target waktu 2 JP; siswa pendiam berisiko pasif di belakang kelompok.',
        analisisDampak: 'Guru merasa gagal mengendalikan kelas dan kembali ke metode drill soal rumus tanpa pemahaman konsep; siswa kehilangan kesempatan mengembangkan keterampilan abad ke-21 (4C).',
        aksiPenyelesaian: 'Penerapan pembagian peran tegas di tiap kelompok (Ketua, Notulis, Penyaji, Timer); penggunaan timer visual di layar proyektor/PID; rubrik observasi keterlibatan individu.',
        status: 'Terealisasi'
      },
      {
        id: 'pci-202',
        aspek: 'Pemanfaatan Asisten AI (Generative AI) untuk Diferensiasi Modul Ajar',
        pro: 'Mempercepat guru dalam mendesain ragam teks bacaan bertingkat (level dasar, menengah, mahir) dalam hitungan detik; menginspirasi ide pemantik diskusi kontekstual daerah.',
        kontra: 'Kekhawatiran plagiasi dan ketergantungan instan tanpa pemikiran kritis; guru belum mahir menyusun instruksi/prompting yang aman dan akurat.',
        analisisDampak: 'Kesenjangan digital semakin melebar; sebagian guru merasa terancam perannya digantikan teknologi atau menolak total adopsi kecerdasan buatan.',
        aksiPenyelesaian: 'Workshop supervisi klinis "Prompt Engineering untuk Guru Merdeka Belajar" yang dipandu pengawas; penetapan kode etik transparansi pemanfaatan AI di sekolah.',
        status: 'Dalam Proses'
      }
    ]
  }
];
