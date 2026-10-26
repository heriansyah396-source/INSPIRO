/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TirtaCoachingRecord, AppSettings, COACHING_CONTEXT_LABELS } from '../types/inspiro';

/**
 * Export a single TIRTA coaching journal to Microsoft Word (.doc)
 */
export function exportCoachingJournalToWord(
  record: TirtaCoachingRecord,
  settings: AppSettings
): void {
  const supervisorName = settings.supervisorName || record.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd';
  const supervisorNip = settings.supervisorNip || record.supervisorNip || '19830819 201001 1 002';
  const supervisorRole = settings.supervisorRole || record.supervisorRole || 'Pengawas Sekolah Pembina';
  const contextCfg = COACHING_CONTEXT_LABELS[record.context] || { label: record.context, badge: record.context };

  const wordHtml = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:w="urn:schemas-microsoft-com:office:word"
        xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta charset="utf-8">
    <title>Jurnal Coaching Alur TIRTA - ${record.teacherName}</title>
    <!--[if gte mso 9]>
    <xml>
      <w:WordDocument>
        <w:View>Print</w:View>
        <w:Zoom>100</w:Zoom>
        <w:DoNotOptimizeForBrowser/>
      </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
      @page {
        size: A4 portrait;
        margin: 2cm 2cm 2cm 2cm;
      }
      body {
        font-family: 'Times New Roman', Times, serif;
        font-size: 11pt;
        line-height: 1.4;
        color: #000;
      }
      .kop {
        text-align: center;
        border-bottom: 3px double #000;
        padding-bottom: 8px;
        margin-bottom: 16px;
      }
      .kop h3 { margin: 0; font-size: 12.5pt; text-transform: uppercase; font-weight: bold; }
      .kop h2 { margin: 2px 0; font-size: 14pt; text-transform: uppercase; font-weight: bold; }
      .kop p { margin: 2px 0; font-size: 9pt; }
      .title-box {
        text-align: center;
        margin-bottom: 16px;
      }
      .title-box h3 {
        margin: 0;
        font-size: 12.5pt;
        text-decoration: underline;
        text-transform: uppercase;
        font-weight: bold;
      }
      .title-box p {
        margin: 3px 0 0 0;
        font-size: 10pt;
        font-style: italic;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 8px;
        margin-bottom: 12px;
      }
      .info-table td {
        padding: 4px 6px;
        font-size: 10.5pt;
        border: none;
      }
      .tirta-table th {
        background-color: #f1f5f9;
        border: 1px solid #000;
        padding: 7px;
        font-size: 10.5pt;
        text-align: left;
      }
      .tirta-table td {
        border: 1px solid #000;
        padding: 8px;
        font-size: 10.5pt;
        vertical-align: top;
      }
      .stage-header {
        background-color: #e2e8f0;
        font-weight: bold;
        padding: 6px 8px;
        border: 1px solid #000;
      }
      .sig-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 26px;
        border: none;
      }
      .sig-table td {
        border: none;
        padding: 4px;
        vertical-align: top;
      }
    </style>
  </head>
  <body>
    <div class="kop">
      <h3>${settings.governmentAgency || 'PEMERINTAH KABUPATEN SIDENRENG RAPPANG'}</h3>
      <h2>DINAS PENDIDIKAN DAN KEBUDAYAAN</h2>
      <p style="font-weight:bold;">KANTOR PENGAWAS SEKOLAH PEMBINA SATUAN PENDIDIKAN</p>
      <p style="font-size: 8.5pt; color: #444;">${settings.schoolAddress || 'Kompleks Pendidikan Terpadu'} | Telepon / Pos-el Resmi Kedinasan</p>
    </div>

    <div class="title-box">
      <h3>LEMBAR CATATAN COACHING DIALOGIS ALUR TIRTA</h3>
      <p>Refleksi Klinis & Pembinaan Pembelajaran Berdiferensiasi Kurikulum Merdeka</p>
    </div>

    <table class="info-table">
      <tr>
        <td style="width: 25%;"><strong>Nama Guru (Coachee)</strong></td>
        <td style="width: 2%;">:</td>
        <td style="width: 38%;">${record.teacherName}</td>
        <td style="width: 15%;"><strong>Hari / Tanggal</strong></td>
        <td style="width: 2%;">:</td>
        <td style="width: 18%;">${record.date}</td>
      </tr>
      <tr>
        <td><strong>NIP Guru</strong></td>
        <td>:</td>
        <td>${record.teacherNip}</td>
        <td><strong>Waktu</strong></td>
        <td>:</td>
        <td>${record.time || '08:00'} WIB</td>
      </tr>
      <tr>
        <td><strong>Satuan Pendidikan</strong></td>
        <td>:</td>
        <td>${record.schoolName}</td>
        <td><strong>Mata Pelajaran</strong></td>
        <td>:</td>
        <td>${record.subject}</td>
      </tr>
      <tr>
        <td><strong>Nama Coach / Pengawas</strong></td>
        <td>:</td>
        <td>${supervisorName}</td>
        <td><strong>Konteks Sesi</strong></td>
        <td>:</td>
        <td>${contextCfg.label}</td>
      </tr>
    </table>

    <table class="tirta-table">
      <!-- 1. TUJUAN (T) -->
      <tr>
        <td colspan="2" class="stage-header">
          1. T - TUJUAN (Menyepakati topik, agenda, dan ukuran keberhasilan percakapan)
        </td>
      </tr>
      <tr>
        <td style="width: 32%; background-color:#f8fafc;"><strong>Topik Percakapan</strong></td>
        <td>${record.tujuan.topikPercakapan}</td>
      </tr>
      <tr>
        <td style="background-color:#f8fafc;"><strong>Tujuan Akhir</strong></td>
        <td>${record.tujuan.tujuanAkhir}</td>
      </tr>
      <tr>
        <td style="background-color:#f8fafc;"><strong>Ukuran Keberhasilan Sesi</strong></td>
        <td>${record.tujuan.ukuranKeberhasilan}</td>
      </tr>

      <!-- 2. IDENTIFIKASI (I) -->
      <tr>
        <td colspan="2" class="stage-header">
          2. I - IDENTIFIKASI (Memetakan situasi, potensi, fakta kelas, dan peluang pemecahan)
        </td>
      </tr>
      <tr>
        <td style="background-color:#f8fafc;"><strong>Potensi & Kekuatan Guru</strong></td>
        <td>${record.identifikasi.potensiDanKekuatan}</td>
      </tr>
      <tr>
        <td style="background-color:#f8fafc;"><strong>Fakta & Tantangan di Kelas</strong></td>
        <td>${record.identifikasi.faktaDanTantangan}</td>
      </tr>
      <tr>
        <td style="background-color:#f8fafc;"><strong>Akar Masalah yang Ditemukan</strong></td>
        <td>${record.identifikasi.akarMasalah}</td>
      </tr>
      <tr>
        <td style="background-color:#f8fafc;"><strong>Peluang / Solusi yang Terbuka</strong></td>
        <td>${record.identifikasi.peluangTersedia}</td>
      </tr>

      <!-- 3. RENCANA AKSI (R) -->
      <tr>
        <td colspan="2" class="stage-header">
          3. R - RENCANA AKSI (Merancang langkah nyata yang dirumuskan sendiri oleh guru)
        </td>
      </tr>
      <tr>
        <td style="background-color:#f8fafc;"><strong>Strategi Utama</strong></td>
        <td><strong>${record.rencanaAksi.strategiUtama}</strong></td>
      </tr>
      <tr>
        <td style="background-color:#f8fafc;"><strong>Langkah Konkret Pelaksanaan</strong></td>
        <td>
          <ol style="margin:0; padding-left:20px;">
            ${record.rencanaAksi.langkahKonkret.map((l) => `<li>${l}</li>`).join('')}
          </ol>
        </td>
      </tr>
      <tr>
        <td style="background-color:#f8fafc;"><strong>Lini Masa / Waktu Aksi</strong></td>
        <td>${record.rencanaAksi.waktuDanLiniMasa}</td>
      </tr>
      <tr>
        <td style="background-color:#f8fafc;"><strong>Dukungan / Sarana Diperlukan</strong></td>
        <td>${record.rencanaAksi.dukunganDibutuhkan}</td>
      </tr>

      <!-- 4. TANGGUNG JAWAB (TA) -->
      <tr>
        <td colspan="2" class="stage-header">
          4. TA - TANGGUNG JAWAB & KOMITMEN (Meneguhkan komitmen dan tindak lanjut evaluasi)
        </td>
      </tr>
      <tr>
        <td style="background-color:#f8fafc;"><strong>Pernyataan Komitmen Guru</strong></td>
        <td><em>"${record.tanggungJawab.komitmenGuru}"</em></td>
      </tr>
      <tr>
        <td style="background-color:#f8fafc;"><strong>Pihak yang Membantu / Terlibat</strong></td>
        <td>${record.tanggungJawab.pihakYangMembantu}</td>
      </tr>
      <tr>
        <td style="background-color:#f8fafc;"><strong>Jadwal Pemantauan Tindak Lanjut</strong></td>
        <td>${record.tanggungJawab.jadwalTindakLanjut} (Status: <strong>${record.tanggungJawab.statusKomitmen === 'tercapai' ? 'Tercapai' : record.tanggungJawab.statusKomitmen === 'dalam_proses' ? 'Dalam Proses' : 'Perlu Tinjauan'}</strong>)</td>
      </tr>
      ${record.tanggungJawab.catatanTindakLanjut ? `
      <tr>
        <td style="background-color:#f8fafc;"><strong>Catatan Evaluasi Tindak Lanjut</strong></td>
        <td>${record.tanggungJawab.catatanTindakLanjut}</td>
      </tr>
      ` : ''}

      <!-- 5. CATATAN APRESIASI COACH -->
      ${record.coachFeedback ? `
      <tr>
        <td colspan="2" class="stage-header">
          5. CATATAN APRESIATIF & PENGUATAN DARI COACH (PENGAWAS SEKOLAH)
        </td>
      </tr>
      <tr>
        <td colspan="2" style="font-style: italic; background-color: #fafaf9;">
          "${record.coachFeedback}"
        </td>
      </tr>
      ` : ''}
    </table>

    <table class="sig-table">
      <tr>
        <td style="width: 50%; text-align: center;">
          Guru yang Disupervisi (Coachee),<br/><br/><br/><br/><br/>
          <strong style="text-decoration: underline;">${record.teacherName}</strong><br/>
          <span>NIP. ${record.teacherNip}</span>
        </td>
        <td style="width: 50%; text-align: center;">
          ${settings.schoolCity || 'Kota Pendidikan'}, ${record.date}<br/>
          <strong>${supervisorRole} (Coach)</strong><br/><br/><br/><br/>
          <strong style="text-decoration: underline;">${supervisorName}</strong><br/>
          <span>NIP. ${supervisorNip}</span>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const blob = new Blob(['\ufeff', wordHtml], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `Jurnal_Coaching_TIRTA_${record.teacherName.replace(/[,. ]+/g, '_')}_${record.date}.doc`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
