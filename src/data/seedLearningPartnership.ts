/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PMLearningPartnershipRecord } from '../types/inspiro';

export const SEED_PARTNERSHIP_PM_RECORDS: PMLearningPartnershipRecord[] = [
  {
    id: 'part-001',
    schoolName: 'SMP Negeri 1 Merdeka Nusantara',
    teacherId: 'G002',
    teacherName: 'Siti Rahmawati, S.Pd.',
    teacherNip: '19900321 201503 2 008',
    subject: 'Ilmu Pengetahuan Alam (IPA)',
    gradeClass: 'VIII (Fase D)',
    topic: 'Investigasi Ekosistem Saluran Irigasi & Kualitas Air Sawah Berkelanjutan',
    date: '2026-10-20',
    assessorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    assessorRole: 'Pengawas Sekolah',
    assessorNip: '19830819 201001 1 002',
    headmasterName: 'Dra. Hj. Nurhasanah, M.Pd.',
    headmasterNip: '19720815 199802 2 003',

    primaryPartnerType: 'Praktisi / Tokoh Komunitas',
    partnerName: 'Kelompok Tani Sipadeceng & Balai Penyuluhan Pertanian Kab. Sidrap',
    partnerRoleInLearning: 'Narasumber praktisi lapangan, mentor uji sampel air, dan audiens autentik penerima hasil kajian murid',
    studentVoiceLevel: 'Tinggi',

    dim1StudentTeacher: {
      score: 4,
      level: 'Membudaya',
      coDesignPractices: 'Perumusan kriteria sukses rubrik uji pH & oksigen terlarut bersama murid, serta pemilihan titik sampel saluran air',
      notes:
        'Guru memfasilitasi dialog co-design yang sangat setara. Murid menyuarakan ide pembagian titik observasi dan menyepakati standar laporan ilmiah bersama guru sebelum observasi lapangan dilakukan.',
      evidenceNotes:
        'Terdapat lembar kesepakatan target belajar dan rubrik kriteria sukses yang diparaf perwakilan ketua kelompok.'
    },

    dim2PeerToPeer: {
      score: 4,
      level: 'Membudaya',
      peerInteractionType: 'Aliansi tim investigasi lab mini & protokol umpan balik antarteman metode TAG (Tell, Ask, Give)',
      notes:
        'Kerja sama antarmurid menunjukkan interdependensi positif tinggi. Setiap anggota memegang peran spesifik (pencatat data sensor, operator alat ukur, analis perbandingan, dan komunikator) dan aktif saling menguji hipotesis.',
      evidenceNotes:
        'Terlihat proses peer-review antarkelompok di mana Kelompok 2 merevisi data kekeruhan setelah diverifikasi oleh Kelompok 4.'
    },

    dim3FamilyPartnership: {
      score: 3,
      level: 'Matang',
      familyEngagementActivity: 'Wawancara orang tua petani mengenai riwayat pemupukan sawah & pameran gelar karya mini (Student-Led Showcase)',
      notes:
        'Orang tua murid yang berprofesi sebagai petani dilibatkan sebagai narasumber sejarah saluran irigasi lokal. Orang tua diundang menghadiri presentasi poster hasil kajian murid di aula sekolah.',
      evidenceNotes:
        '18 lembar transkrip wawancara dengan orang tua dan daftar hadir orang tua pada gelar karya mini.'
    },

    dim4CommunityRealWorld: {
      score: 4,
      level: 'Membudaya',
      realWorldImpact: 'Rekomendasi tertulis pengelolaan sampah plastik saluran tersier diserahkan langsung ke pengurus P3A (Perkumpulan Petani Pemakai Air)',
      notes:
        'Kemitraan dunia nyata berjalan maksimal (Place-Based Learning). Ketua Kelompok Tani dan PPL Pertanian hadir memberikan umpan balik langsung terhadap solusi penjernihan air yang dirancang murid.',
      evidenceNotes:
        'Surat tanda terima dokumen rekomendasi murid oleh Ketua P3A Kelurahan Rappang dan dokumentasi dialog langsung di sawah.'
    },

    checklist: {
      studentCoDesign: true,
      structuredPeerFeedback: true,
      familyTwoWayCommunication: true,
      authenticExpertInvolvement: true,
      authenticAudienceExhibition: true
    },

    totalScore: 93.75,
    maturityLevel: 'Level 4: Membudaya (Deepening)',
    keyStrengths: [
      'Agensi murid terwujud optimal dalam merumuskan kriteria keberhasilan proyek sains bersama guru.',
      'Kemitraan autentik dengan Kelompok Tani lokal dan PPL Pertanian Sidrap memberikan konteks pemecahan masalah dunia nyata.',
      'Penerapan protokol peer-feedback TAG berjalan efektif tanpa memicu resistensi antarmurid.'
    ],
    keyGrowthAreas: [
      'Pelibatan keluarga dapat ditingkatkan menjadi Student-Led Conference berkala per kuartal pembelajaran.',
      'Dokumentasi digital hasil penelitian murid dapat diunggah ke portal literasi sains sekolah.'
    ],
    supervisoryRecommendations: [
      'Jadikan praktik kemitraan IPA Ibu Siti Rahmawati sebagai model berbagi praktik baik di Komunitas Belajar (MGMP IPA) Sidrap.',
      'Fasilitasi penandatanganan MoU sederhana antara satuan pendidikan dengan Balai Penyuluhan Pertanian untuk keberlanjutan proyek semester depan.'
    ],
    status: 'final',
    createdAt: '2026-10-20T10:30:00Z',
    updatedAt: '2026-10-20T11:45:00Z'
  },
  {
    id: 'part-002',
    schoolName: 'SMP Negeri 2 Merdeka Nusantara',
    teacherId: 'G003',
    teacherName: 'Bambang Supriyanto, S.Pd.',
    teacherNip: '19790512 200501 1 009',
    subject: 'Bahasa Indonesia & Prakarya',
    gradeClass: 'IX (Fase D)',
    topic: 'Penulisan Profil Naratif & Digitalisasi Katalog Produk UMKM Kuliner Sidrap',
    date: '2026-10-15',
    assessorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    assessorRole: 'Pengawas Sekolah',
    assessorNip: '19830819 201001 1 002',
    headmasterName: 'Drs. H. Mulyadi, M.Pd.',
    headmasterNip: '19690312 199412 1 002',

    primaryPartnerType: 'Dunia Usaha / UMKM',
    partnerName: 'Paguyuban Pengusaha Kuliner Khas Sidenreng Rappang (Nasupalekko & Baje)',
    partnerRoleInLearning: 'Tempat magang observasi wawancara singkat, penyedia bahan studi kasus cerita merek, dan penerima desain katalog',
    studentVoiceLevel: 'Tinggi',

    dim1StudentTeacher: {
      score: 3,
      level: 'Matang',
      coDesignPractices: 'Murid memilih sendiri UMKM yang akan diangkat dan bersama guru menyusun rubrik teks deskripsi narasi promosi',
      notes:
        'Guru memberikan keleluasaan bagi kelompok untuk menentukan produk kuliner yang diminati. Standar penilaian tata bahasa dan etika wawancara disepakati bersama di awal.',
      evidenceNotes:
        'Matriks pemilihan UMKM yang dirumuskan oleh masing-masing kelompok tercatat di papan rencana kerja kelas.'
    },

    dim2PeerToPeer: {
      score: 3,
      level: 'Matang',
      peerInteractionType: 'Peer-editing teks narasi & silang baca draft naskah deskripsi produk sebelum finalisasi katalog',
      notes:
        'Murid saling mengoreksi tanda baca, kohesi paragraf, dan daya pikat kalimat promosi rekannya menggunakan daftar periksa bahasa baku.',
      evidenceNotes:
        'Naskah draft dengan catatan coretan perbaikan tinta warna dari kelompok pemeriksa sebaya.'
    },

    dim3FamilyPartnership: {
      score: 3,
      level: 'Matang',
      familyEngagementActivity: 'Keluarga memfasilitasi pendampingan saat kunjungan ke UMKM dan membantu uji rasa awal di rumah',
      notes:
        'Komunikasi dengan orang tua berjalan baik melalui grup paguyuban kelas untuk koordinasi pendampingan survei wawancara.',
      evidenceNotes:
        'Surat izin dan konfirmasi pendampingan lapangan dari orang tua murid.'
    },

    dim4CommunityRealWorld: {
      score: 4,
      level: 'Membudaya',
      realWorldImpact: 'Buku katalog promosi digital diserahkan kepada 5 pemilik warung UMKM untuk dipasang sebagai menu digital QR Code',
      notes:
        'Hasil karya murid tidak hanya dinilai guru, namun langsung digunakan oleh pelaku usaha kuliner di Pangkajene Sidrap. Pelaku usaha mengapresiasi tulisan narasi yang menggugah selera.',
      evidenceNotes:
        'Foto penyerahan cetakan poster QR Code menu kepada pemilik UMKM Kuliner Nasupalekko dan testimoni tertulis pelaku usaha.'
    },

    checklist: {
      studentCoDesign: true,
      structuredPeerFeedback: true,
      familyTwoWayCommunication: true,
      authenticExpertInvolvement: true,
      authenticAudienceExhibition: true
    },

    totalScore: 81.25,
    maturityLevel: 'Level 3: Matang (Accelerating)',
    keyStrengths: [
      'Proyek Bahasa Indonesia memiliki dampak ekonomi nyata bagi komunitas pengusaha lokal di Kabupaten Sidenreng Rappang.',
      'Audiens autentik terwujud nyata karena karya katalog digunakan langsung oleh pelaku UMKM.',
      'Sinergi yang solid antara guru, murid, orang tua, dan dunia usaha.'
    ],
    keyGrowthAreas: [
      'Perlu penguatan protokol peer-feedback yang lebih mendalam pada aspek pilihan diksi sastra/estetika bahasa.',
      'Perlu penjadwalan pameran karya terbuka di tingkat kecamatan.'
    ],
    supervisoryRecommendations: [
      'Dorong guru untuk mengunggah studi kasus kemitraan UMKM ini ke Ruang Kolaborasi PMM (Platform Merdeka Mengajar).',
      'Libatkan Asosiasi UMKM atau Dinas Koperasi & UKM Kab. Sidrap sebagai juri kehormatan pada gelar karya semester.'
    ],
    status: 'final',
    createdAt: '2026-10-15T09:00:00Z',
    updatedAt: '2026-10-15T11:20:00Z'
  }
];
