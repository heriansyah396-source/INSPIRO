/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContextualProblemRecord, AppSettings, CONTEXTUAL_CATEGORY_LABELS, CONTEXTUAL_DATA_SOURCE_LABELS } from '../types/inspiro';

export function exportContextualProblemToWord(record: ContextualProblemRecord, settings: AppSettings): void {
  const govAgency = settings.governmentAgency || 'PEMERINTAH KABUPATEN SIDENRENG RAPPANG';
  const schoolCity = settings.schoolCity || 'Kabupaten Sidenreng Rappang';
  const documentDate = settings.documentDate || new Date(record.date || Date.now()).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const catInfo = CONTEXTUAL_CATEGORY_LABELS[record.problemCategory] || {
    label: record.problemCategory,
    badge: record.problemCategory
  };

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Diagnosis Data Awal & Akar Masalah Kontekstual - ${record.teacherName || record.schoolName}</title>
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
          color: #b45309;
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
          background-color: #b45309;
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

      <div class="doc-title">LEMBAR KERJA DIAGNOSIS DATA AWAL & AKAR MASALAH KONTEKSTUAL</div>
      <div class="doc-subtitle">FOKUS: REALITAS KELAS, ANALISIS 5-WHYS & TINDAK LANJUT SUPERVISI</div>

      <table class="meta-table">
        <tr>
          <td width="20%"><strong>Satuan Pendidikan</strong></td>
          <td width="2%">:</td>
          <td width="38%">${record.schoolName}</td>
          <td width="18%"><strong>Tanggal Diagnosis</strong></td>
          <td width="2%">:</td>
          <td width="20%">${record.date}</td>
        </tr>
        <tr>
          <td><strong>Guru Sasaran</strong></td>
          <td>:</td>
          <td><strong>${record.teacherName || 'Seluruh Pendidik Satuan Pendidikan'}</strong></td>
          <td><strong>Mata Pelajaran</strong></td>
          <td>:</td>
          <td>${record.subject || '-'} (${record.gradeClass || '-'})</td>
        </tr>
        <tr>
          <td><strong>Kategori Masalah</strong></td>
          <td>:</td>
          <td><strong>${catInfo.label}</strong></td>
          <td><strong>Tingkat Urgensi</strong></td>
          <td>:</td>
          <td><strong>Prioritas ${record.severity}</strong></td>
        </tr>
        <tr>
          <td><strong>Pengawas Pembina</strong></td>
          <td>:</td>
          <td>${record.assessorName}</td>
          <td><strong>Status Penanganan</strong></td>
          <td>:</td>
          <td><strong>${record.status.toUpperCase()}</strong></td>
        </tr>
      </table>

      <!-- PERNYATAAN MASALAH KONTEKSTUAL -->
      <div class="card-box" style="border-left: 4px solid #b45309; background-color: #fffbeb;">
        <div style="font-size: 9pt; color: #92400e; font-weight: bold; text-transform: uppercase;">
          Pernyataan Masalah Kontekstual Lapangan:
        </div>
        <div style="font-size: 13pt; font-weight: bold; color: #78350f; margin-top: 3px;">
          ${record.problemTitle}
        </div>
      </div>

      <!-- SECTION 1: DATA AWAL KONTEKSTUAL -->
      <div class="section-header">I. DATA AWAL KONTEKSTUAL (FAKTA NYATA LAPANGAN)</div>
      <table class="data-table">
        <tr>
          <th width="30%">Sumber Fakta Data Awal</th>
          <th width="70%">Uraian Bukti Lapangan & Kondisi Konkret Teramati</th>
        </tr>
        <tr>
          <td>
            <ul>
              ${record.dataSources.map((ds) => `<li><strong>${CONTEXTUAL_DATA_SOURCE_LABELS[ds] || ds}</strong></li>`).join('')}
            </ul>
          </td>
          <td>
            <p style="margin: 0; line-height: 1.5;">${record.baselineDataEvidence}</p>
          </td>
        </tr>
      </table>

      <!-- SECTION 2: ANALISIS AKAR MASALAH (ROOT CAUSE) -->
      <div class="section-header">II. ANALISIS 5 DIMENSI AKAR MASALAH (ROOT CAUSE DIAGNOSTIC)</div>
      <table class="data-table">
        <tr>
          <th width="32%">Dimensi Analisis</th>
          <th width="68%">Temuan Akar Penyebab Kontekstual</th>
        </tr>
        <tr>
          <td><strong>1. Metode & Praktik Pedagogi Guru</strong></td>
          <td>${record.rootCauses.aspekMetodeGuru || '-'}</td>
        </tr>
        <tr>
          <td><strong>2. Kesiapan Perencanaan & Modul Ajar</strong></td>
          <td>${record.rootCauses.aspekPerencanaanModul || '-'}</td>
        </tr>
        <tr>
          <td><strong>3. Pengelolaan Kelas, Suasana & Waktu</strong></td>
          <td>${record.rootCauses.aspekPengelolaanKelas || '-'}</td>
        </tr>
        <tr>
          <td><strong>4. Karakteristik & Kesiapan Belajar Murid</strong></td>
          <td>${record.rootCauses.aspekKarakteristikMurid || '-'}</td>
        </tr>
        <tr>
          <td><strong>5. Sarana, Alat Peraga & Daya Dukung</strong></td>
          <td>${record.rootCauses.aspekDayaDukung || '-'}</td>
        </tr>
      </table>

      <!-- SECTION 3: 3-WHYS ANALYSIS -->
      <div class="section-header">III. RANTAI ANALISIS "3-WHYS" (BEDAH AKAR TERDALAM)</div>
      <div class="card-box">
        <p style="margin: 3px 0;"><strong>Mengapa 1 (Masalah Terlihat):</strong> ${record.fiveWhys.why1}</p>
        <p style="margin: 3px 0;"><strong>Mengapa 2 (Kondisi Lapangan):</strong> ${record.fiveWhys.why2}</p>
        <p style="margin: 3px 0; color: #b45309;"><strong>Mengapa 3 (Akar Penyebab Utama):</strong> <strong>${record.fiveWhys.why3}</strong></p>
      </div>

      <!-- SECTION 4: RESEP INTERVENSI SUPERVISI -->
      <div class="section-header">IV. RESEP SOLUSI & RENCANA AKSI SUPERVISI PENGAWAS</div>
      <div class="card-box">
        <p><strong>Bentuk Pendampingan Supervisi:</strong> <span style="font-size: 11pt; font-weight: bold; color: #1e3a8a;">${record.recommendedIntervention.supervisionAction}</span></p>
        <p><strong>Target Lini Masa:</strong> ${record.recommendedIntervention.targetTimeline}</p>
        <p><strong>Langkah-Langkah Aksi Konkret:</strong></p>
        <ol>
          ${record.recommendedIntervention.actionDetails.map((act) => `<li>${act}</li>`).join('')}
        </ol>
        ${record.resolutionNotes ? `<p style="margin-top: 6px;"><strong>Catatan Progres / Hasil Penanganan:</strong><br>${record.resolutionNotes}</p>` : ''}
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
            Guru Sasaran / Dampingan<br><br><br><br><br>
            <strong>${record.teacherName || 'Perwakilan Guru'}</strong><br>
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
  const cleanName = (record.teacherName || record.schoolName).replace(/[^a-zA-Z0-9]/g, '_');
  a.download = `Diagnosis_Akar_Masalah_Kontekstual_${cleanName}_${record.date}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
