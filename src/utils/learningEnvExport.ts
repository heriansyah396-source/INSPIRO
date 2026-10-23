/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PMLearningEnvRecord, AppSettings } from '../types/inspiro';

export function exportLearningEnvToWord(record: PMLearningEnvRecord, settings: AppSettings): void {
  const govAgency = settings.governmentAgency || 'PEMERINTAH KABUPATEN SIDENRENG RAPPANG';
  const schoolCity = settings.schoolCity || 'Kabupaten Sidenreng Rappang';
  const documentDate = settings.documentDate || new Date(record.date || Date.now()).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const getLevelColor = (level: string) => {
    if (level.includes('Membudaya')) return '#047857';
    if (level.includes('Matang')) return '#1d4ed8';
    if (level.includes('Berkembang')) return '#b45309';
    return '#b91c1c';
  };

  const getLevelBg = (level: string) => {
    if (level.includes('Membudaya')) return '#ecfdf5';
    if (level.includes('Matang')) return '#eff6ff';
    if (level.includes('Berkembang')) return '#fffbeb';
    return '#fef2f2';
  };

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Instrumen Evaluasi Lingkungan Pembelajaran PM - ${record.teacherName}</title>
      <style>
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.4;
          color: #0f172a;
          margin: 20mm;
        }
        .header-kop {
          text-align: center;
          border-bottom: 3px double #000;
          padding-bottom: 8px;
          margin-bottom: 18px;
        }
        .header-kop .instansi {
          font-size: 13pt;
          font-weight: bold;
          letter-spacing: 0.5px;
        }
        .header-kop .dinas {
          font-size: 14pt;
          font-weight: bold;
        }
        .header-kop .kantor {
          font-size: 11pt;
          font-weight: bold;
          color: #1e3a8a;
        }
        .header-kop .alamat {
          font-size: 8.5pt;
          font-style: italic;
          color: #334155;
          margin-top: 3px;
        }
        .doc-title {
          text-align: center;
          font-size: 12pt;
          font-weight: bold;
          text-transform: uppercase;
          margin-top: 14px;
          margin-bottom: 4px;
        }
        .doc-subtitle {
          text-align: center;
          font-size: 10pt;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 16px;
        }
        table.meta-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
          font-size: 10pt;
        }
        table.meta-table td {
          padding: 4px 6px;
          vertical-align: top;
        }
        .section-header {
          background-color: #1e3a8a;
          color: #ffffff;
          font-weight: bold;
          font-size: 10.5pt;
          padding: 6px 10px;
          margin-top: 18px;
          margin-bottom: 8px;
        }
        table.data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 14px;
          font-size: 9.5pt;
        }
        table.data-table th, table.data-table td {
          border: 1px solid #cbd5e1;
          padding: 6px 8px;
          vertical-align: top;
        }
        table.data-table th {
          background-color: #f1f5f9;
          font-weight: bold;
          text-align: left;
        }
        .badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 9pt;
        }
        .card-box {
          border: 1px solid #cbd5e1;
          background-color: #f8fafc;
          padding: 10px 14px;
          margin-bottom: 14px;
        }
        .signatures {
          width: 100%;
          margin-top: 35px;
          border-collapse: collapse;
          font-size: 10pt;
        }
        .signatures td {
          text-align: center;
          vertical-align: top;
          padding: 0 10px;
        }
      </style>
    </head>
    <body>
      <div class="header-kop">
        <div class="instansi">${govAgency.toUpperCase()}</div>
        <div class="dinas">DINAS PENDIDIKAN DAN KEBUDAYAAN</div>
        <div class="kantor">KANTOR PENGAWAS SEKOLAH PEMBINA SATUAN PENDIDIKAN</div>
        <div class="alamat">${settings.schoolAddress || 'Sekretariat Pengawas Sekolah, Kabupaten Sidenreng Rappang, Sulawesi Selatan'}</div>
      </div>

      <div class="doc-title">INSTRUMEN EVALUASI & OBSERVASI LINGKUNGAN PEMBELAJARAN (PM)</div>
      <div class="doc-subtitle">FOKUS: IKLIM PSIKOLOGIS (KEAMANAN EMOSIONAL) & EFISIENSI WAKTU BELAJAR AKTIF</div>

      <table class="meta-table">
        <tr>
          <td width="20%"><strong>Satuan Pendidikan</strong></td>
          <td width="2%">:</td>
          <td width="38%">${record.schoolName}</td>
          <td width="18%"><strong>Tanggal Evaluasi</strong></td>
          <td width="2%">:</td>
          <td width="20%">${record.date}</td>
        </tr>
        <tr>
          <td><strong>Nama Guru</strong></td>
          <td>:</td>
          <td><strong>${record.teacherName}</strong></td>
          <td><strong>Mata Pelajaran</strong></td>
          <td>:</td>
          <td>${record.subject}</td>
        </tr>
        <tr>
          <td><strong>NIP Guru</strong></td>
          <td>:</td>
          <td>${record.teacherNip || '-'}</td>
          <td><strong>Kelas / Rombel</strong></td>
          <td>:</td>
          <td>${record.gradeClass}</td>
        </tr>
        <tr>
          <td><strong>Topik / Materi</strong></td>
          <td>:</td>
          <td>${record.topic || 'Pembelajaran Mendalam (Deep Learning)'}</td>
          <td><strong>Pengawas Pembina</strong></td>
          <td>:</td>
          <td>${record.assessorName}</td>
        </tr>
      </table>

      <!-- RINGKASAN CAPAIAN EKSEKUTIF -->
      <div class="card-box">
        <table width="100%" style="border-collapse: collapse;">
          <tr>
            <td width="33%" style="text-align: center; border-right: 1px solid #cbd5e1; padding: 6px;">
              <div style="font-size: 8.5pt; color: #475569; text-transform: uppercase;">Skor Keseluruhan PM</div>
              <div style="font-size: 22pt; font-weight: bold; color: #1e3a8a;">${record.totalScore.toFixed(1)} <span style="font-size: 11pt;">/ 100</span></div>
              <div style="font-size: 9.5pt; font-weight: bold; color: ${getLevelColor(record.maturityLevel)};">${record.maturityLevel}</div>
            </td>
            <td width="34%" style="text-align: center; border-right: 1px solid #cbd5e1; padding: 6px;">
              <div style="font-size: 8.5pt; color: #475569; text-transform: uppercase;">Iklim Keamanan Emosional</div>
              <div style="font-size: 16pt; font-weight: bold; color: #047857;">Level ${record.dim1Psychological.score} / 4</div>
              <div style="font-size: 9.5pt; font-weight: bold; color: #065f46;">${record.psychologicalClimateCategory}</div>
            </td>
            <td width="33%" style="text-align: center; padding: 6px;">
              <div style="font-size: 8.5pt; color: #475569; text-transform: uppercase;">Efisiensi Waktu Belajar Aktif</div>
              <div style="font-size: 16pt; font-weight: bold; color: #2563eb;">${record.dim2TimeEfficiency.tracker.activeTimeRatioPct.toFixed(1)}%</div>
              <div style="font-size: 9.5pt; font-weight: bold; color: #1e40af;">${record.timeEfficiencyCategory}</div>
            </td>
          </tr>
        </table>
      </div>

      <!-- SECTION 1: IKLIM PSIKOLOGIS & KEAMANAN EMOSIONAL -->
      <div class="section-header">I. ELEMEN IKLIM PSIKOLOGIS & KEAMANAN EMOSIONAL (BOBOT 25%)</div>
      <table class="data-table">
        <tr>
          <th width="35%">Indikator Keamanan Psikologis</th>
          <th width="15%">Keterpenuhan</th>
          <th width="50%">Catatan Bukti Perilaku Nyata di Kelas</th>
        </tr>
        <tr>
          <td>1. Kebebasan Berpendapat Tanpa Cemas</td>
          <td style="text-align: center;"><strong>${record.dim1Psychological.checklist.expressWithoutFear ? 'TERPENUHI (YA)' : 'BELUM'}</strong></td>
          <td rowspan="5" style="vertical-align: top;">
            <p><strong>Deskripsi Analisis:</strong><br>${record.dim1Psychological.notes}</p>
            <p><strong>Bukti Lapangan:</strong><br>${record.dim1Psychological.evidenceNotes || '-'}</p>
          </td>
        </tr>
        <tr>
          <td>2. Kesalahan Dipandang Sebagai Peluang Belajar (Growth Mindset)</td>
          <td style="text-align: center;"><strong>${record.dim1Psychological.checklist.mistakesAsLearning ? 'TERPENUHI (YA)' : 'BELUM'}</strong></td>
        </tr>
        <tr>
          <td>3. Bebas Dari Intimidasi, Cemoohan & Sarkasme</td>
          <td style="text-align: center;"><strong>${record.dim1Psychological.checklist.noBullyingSarcasm ? 'TERPENUHI (YA)' : 'BELUM'}</strong></td>
        </tr>
        <tr>
          <td>4. Integrasi Regulasi Emosi / KSE (Teknik STOP / Roda Emosi)</td>
          <td style="text-align: center;"><strong>${record.dim1Psychological.checklist.kseEmotionalRegulation ? 'TERPENUHI (YA)' : 'BELUM'}</strong></td>
        </tr>
        <tr>
          <td>5. Budaya Saling Mendukung & Empati Antar Murid</td>
          <td style="text-align: center;"><strong>${record.dim1Psychological.checklist.mutualSupport ? 'TERPENUHI (YA)' : 'BELUM'}</strong></td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td colspan="2"><strong>Skor Elemen 1 (Bobot 25 Poin):</strong></td>
          <td><strong>Skor: ${record.dim1Psychological.score} / 4 &nbsp;|&nbsp; Kategori: ${record.dim1Psychological.level} (${(record.dim1Psychological.score * 6.25).toFixed(2)} Poin)</strong></td>
        </tr>
      </table>

      <!-- SECTION 2: EFISIENSI ALOKASI WAKTU BELAJAR -->
      <div class="section-header">II. ELEMEN EFISIENSI WAKTU BELAJAR & RITME KELAS (BOBOT 25%)</div>
      <table class="data-table">
        <tr>
          <th width="35%">Distribusi Alokasi Waktu Sesi</th>
          <th width="18%">Durasi Riil (Menit)</th>
          <th width="47%">Analisis Kelancaran Ritme (Pacing)</th>
        </tr>
        <tr>
          <td>1. Waktu Belajar Aktif Murid (Diskusi/Praktik/Projek)</td>
          <td style="text-align: center;"><strong>${record.dim2TimeEfficiency.tracker.activeLearningMinutes} Menit</strong></td>
          <td rowspan="4" style="vertical-align: top;">
            <p><strong>Kelancaran Ritme (Pacing):</strong> ${record.dim2TimeEfficiency.tracker.pacingSmoothness}</p>
            <p><strong>Rasio Belajar Aktif:</strong> <span style="font-size: 11pt; font-weight: bold; color: #1e40af;">${record.dim2TimeEfficiency.tracker.activeTimeRatioPct.toFixed(1)}%</span> (Target Ideal >= 70%)</p>
            <p><strong>Catatan Supervisi:</strong><br>${record.dim2TimeEfficiency.notes}</p>
            <p><strong>Bukti Lapangan:</strong><br>${record.dim2TimeEfficiency.evidenceNotes || '-'}</p>
          </td>
        </tr>
        <tr>
          <td>2. Ceramah & Instruksi Guru Satu Arah</td>
          <td style="text-align: center;">${record.dim2TimeEfficiency.tracker.teacherTalkMinutes} Menit</td>
        </tr>
        <tr>
          <td>3. Transisi Antar Sesi & Administrasi</td>
          <td style="text-align: center;">${record.dim2TimeEfficiency.tracker.transitionAdminMinutes} Menit</td>
        </tr>
        <tr>
          <td>4. Jeda Hampa / Distraksi / Menunggu</td>
          <td style="text-align: center;">${record.dim2TimeEfficiency.tracker.deadTimeMinutes} Menit</td>
        </tr>
        <tr>
          <td><strong>Total Durasi Tatap Muka</strong></td>
          <td style="text-align: center;"><strong>${record.dim2TimeEfficiency.tracker.totalLessonDuration} Menit</strong></td>
          <td><strong>Skor: ${record.dim2TimeEfficiency.score} / 4 &nbsp;|&nbsp; Kategori: ${record.dim2TimeEfficiency.level} (${(record.dim2TimeEfficiency.score * 6.25).toFixed(2)} Poin)</strong></td>
        </tr>
      </table>

      <!-- SECTION 3 & 4: AGENSI & TATA RUANG -->
      <div class="section-header">III. ELEMEN KULTUR AGENSI MURID & FLEKSIBILITAS TATA RUANG</div>
      <table class="data-table">
        <tr>
          <th width="50%">Dimensi 3: Suara & Kepemilikan Murid (Agency)</th>
          <th width="50%">Dimensi 4: Tata Ruang & Pemanfaatan Lingkungan</th>
        </tr>
        <tr>
          <td>
            <p><strong>Skor: ${record.dim3StudentAgency.score} / 4 (${record.dim3StudentAgency.level})</strong></p>
            <ul>
              <li>Pilihan Bentuk Tugas/Produk (Voice & Choice): <strong>${record.dim3StudentAgency.indicators.voiceAndChoice ? 'Ya' : 'Belum'}</strong></li>
              <li>Penetapan Target Belajar Mandiri: <strong>${record.dim3StudentAgency.indicators.selfGoalSetting ? 'Ya' : 'Belum'}</strong></li>
              <li>Refleksi Metakognitif Mandiri: <strong>${record.dim3StudentAgency.indicators.metacognitiveReflection ? 'Ya' : 'Belum'}</strong></li>
            </ul>
            <p><strong>Catatan:</strong> ${record.dim3StudentAgency.notes}</p>
          </td>
          <td>
            <p><strong>Skor: ${record.dim4PhysicalSpatial.score} / 4 (${record.dim4PhysicalSpatial.level})</strong></p>
            <ul>
              <li>Penataan Bangku Fleksibel & Kolaboratif: <strong>${record.dim4PhysicalSpatial.spatial.flexibleSeating ? 'Ya' : 'Belum'}</strong></li>
              <li>Akses Mandiri Alat & Bahan Belajar: <strong>${record.dim4PhysicalSpatial.spatial.accessibleResources ? 'Ya' : 'Belum'}</strong></li>
              <li>Pemanfaatan Lingkungan Luar Kelas: <strong>${record.dim4PhysicalSpatial.spatial.beyondClassroom ? 'Ya' : 'Belum'}</strong></li>
            </ul>
            <p><strong>Catatan:</strong> ${record.dim4PhysicalSpatial.notes}</p>
          </td>
        </tr>
      </table>

      <!-- REKOMENDASI & TINDAK LANJUT -->
      <div class="section-header">IV. KEKUATAN UTAMA & REKOMENDASI TINDAK LANJUT SUPERVISI</div>
      <div class="card-box">
        <p><strong>Kekuatan Unggulan:</strong></p>
        <ol>
          ${record.keyStrengths.map((s) => `<li>${s}</li>`).join('')}
        </ol>
        <p><strong>Area Peningkatan Prioritas:</strong></p>
        <ol>
          ${record.keyGrowthAreas.map((g) => `<li>${g}</li>`).join('')}
        </ol>
        <p><strong>Rekomendasi Tindak Lanjut Pengawas Pembina:</strong></p>
        <ol>
          ${record.supervisoryRecommendations.map((r) => `<li>${r}</li>`).join('')}
        </ol>
      </div>

      <!-- TANDA TANGAN RESMI -->
      <table class="signatures">
        <tr>
          <td width="33%">
            Mengetahui,<br>
            Kepala Satuan Pendidikan<br><br><br><br><br>
            <strong>${record.headmasterName || settings.pengawasPembinaName || 'Dra. Hj. Nurhasanah, M.Pd.'}</strong><br>
            NIP. ${record.headmasterNip || settings.pengawasPembinaNip || '19720815 199802 2 003'}
          </td>
          <td width="34%">
            Guru Sasaran Observasi<br><br><br><br><br>
            <strong>${record.teacherName}</strong><br>
            NIP. ${record.teacherNip || '-'}
          </td>
          <td width="33%">
            ${schoolCity}, ${documentDate}<br>
            Pengawas Sekolah Pembina,<br><br><br><br><br>
            <strong>${record.assessorName}</strong><br>
            NIP. ${record.assessorNip}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const cleanName = record.teacherName.replace(/[^a-zA-Z0-9]/g, '_');
  a.download = `Instrumen_Lingkungan_Belajar_PM_${cleanName}_${record.date}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
