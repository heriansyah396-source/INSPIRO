/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AppSettings,
  OBSERVATION_INDICATORS,
  PMReport,
  PM_RUBRICS,
  POST_OBSERVATION_QUESTIONS,
  PRE_OBSERVATION_QUESTIONS,
  SupervisionRecord,
  TeacherCycleComparison,
  RegionalGrowthAnalysis
} from '../types/inspiro';
import { calculateTeacherRadarData } from '../components/TeacherRadarChart';
import { QualityMapAnalysis } from './qualityMapUtils';

/**
 * Robust Isolated Iframe Printer
 * Copies the designated document DOM node into an isolated iframe to bypass
 * parent flexbox wrappers, viewports, and sidebar offsets, preventing blank pages.
 */
export function printDocumentElement(elementId: string, documentTitle?: string): boolean {
  if (typeof window === 'undefined') return false;

  const targetElem = document.getElementById(elementId);
  if (!targetElem) {
    window.print();
    return false;
  }

  // Create an isolated hidden iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'inspiro-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.top = '-9999px';
  iframe.style.left = '-9999px';
  iframe.style.width = '1024px';
  iframe.style.height = '1440px';
  iframe.style.border = 'none';
  iframe.style.zIndex = '-9999';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) {
    document.body.removeChild(iframe);
    window.print();
    return false;
  }

  // Clone active document stylesheet links and style tags
  let styles = '';
  document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
    styles += node.outerHTML;
  });

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${documentTitle || 'Dokumen Resmi Supervisi'}</title>
      ${styles}
      <style>
        @page {
          size: A4 portrait;
          margin: 1.2cm 1cm 1.2cm 1cm;
        }
        *, *::before, *::after {
          box-sizing: border-box !important;
        }
        html, body {
          background: #ffffff !important;
          color: #000000 !important;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          min-height: auto !important;
          height: auto !important;
          overflow: visible !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .no-print, button, .hidden-in-print {
          display: none !important;
        }
        .print-page {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 8px !important;
          box-shadow: none !important;
          border: none !important;
          background: #ffffff !important;
        }
        table {
          width: 100% !important;
          border-collapse: collapse !important;
          page-break-inside: auto !important;
        }
        tr {
          page-break-inside: avoid !important;
          page-break-after: auto !important;
        }
        th, td {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .print-avoid-break {
          page-break-inside: avoid !important;
        }
      </style>
    </head>
    <body>
      ${targetElem.outerHTML}
    </body>
    </html>
  `);
  doc.close();

  // Allow styles, SVGs, and fonts to render properly before initiating print
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      // Fallback
      window.print();
    } finally {
      // Clean up iframe safely after dialog closes
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 3000);
    }
  }, 400);

  return true;
}

/**
 * Export official supervision record to Microsoft Word (.doc format).
 * Compliant with MS Word 2010-365, WPS Office, and LibreOffice.
 */
export function exportSupervisionToWord(
  supervision: SupervisionRecord,
  settings: AppSettings
): void {
  const { identity, praObservasi, scores, notes, totalScore, finalScore, category, refleksi, rtl } =
    supervision;

  const radarData = calculateTeacherRadarData(supervision);

  const cleanTeacherName = (identity.namaGuru || 'Guru').replace(/[/\\?%*:|"<>]/g, '_');
  const cleanDate = (identity.hariTanggal || new Date().toISOString().slice(0, 10)).replace(
    /[/\\?%*:|"<>]/g,
    '-'
  );
  const fileName = `INSTRUMEN_SUPERVISI_${cleanTeacherName}_${cleanDate}.doc`;

  // Build Pra-Observasi rows
  const praRows = PRE_OBSERVATION_QUESTIONS.map(
    (q) => `
    <tr>
      <td style="text-align:center;font-weight:bold;width:35px;border:1px solid #333333;padding:5px;">${q.number}</td>
      <td style="width:230px;border:1px solid #333333;padding:5px;">
        <strong>${q.question}</strong><br>
        <span style="font-size:9pt;color:#555555;font-style:italic;">${q.label}</span>
      </td>
      <td style="border:1px solid #333333;padding:5px;line-height:1.4;">
        ${escapeHtml(praObservasi[q.key as keyof typeof praObservasi] || '-')}
      </td>
    </tr>
  `
  ).join('');

  // Build 12 Observation Indicator rows
  const observationRows = OBSERVATION_INDICATORS.map((ind, idx) => {
    const sc = scores[ind.id] || 0;
    const nt = notes[ind.id] || '-';
    const bg = idx % 2 === 0 ? '#ffffff' : '#f9f9f9';
    return `
      <tr style="background-color:${bg};">
        <td style="text-align:center;font-weight:bold;width:35px;border:1px solid #333333;padding:5px;">${ind.number}</td>
        <td style="border:1px solid #333333;padding:5px;">
          <strong>${ind.title}</strong><br>
          <span style="font-size:9pt;color:#666666;font-style:italic;">${ind.sectionTitle}</span>
        </td>
        <td style="text-align:center;font-weight:bold;font-size:11pt;width:55px;border:1px solid #333333;padding:5px;">${sc}</td>
        <td style="border:1px solid #333333;padding:5px;line-height:1.4;">
          ${escapeHtml(nt)}
        </td>
      </tr>
    `;
  }).join('');

  // Build Radar / 5 Dimension rows
  const radarRows = radarData.axes
    .map(
      (axis, i) => `
    <tr>
      <td style="text-align:center;font-weight:bold;width:35px;border:1px solid #333333;padding:5px;">${i + 1}</td>
      <td style="border:1px solid #333333;padding:5px;">
        <strong>${axis.name}</strong><br>
        <span style="font-size:9pt;color:#666666;">${axis.description}</span>
      </td>
      <td style="text-align:center;font-weight:bold;width:70px;border:1px solid #333333;padding:5px;">
        ${axis.current}% (${axis.scoreFraction})
      </td>
      <td style="border:1px solid #333333;padding:5px;">
        ${escapeHtml(axis.evidence || '-')}
      </td>
    </tr>
  `
    )
    .join('');

  // Build Pasca-Observasi Refleksi rows
  const refleksiRows = POST_OBSERVATION_QUESTIONS.map(
    (q) => `
    <tr>
      <td style="text-align:center;font-weight:bold;width:35px;border:1px solid #333333;padding:5px;">${q.number}</td>
      <td style="width:230px;border:1px solid #333333;padding:5px;">
        <strong>${q.question}</strong><br>
        <span style="font-size:9pt;color:#555555;font-style:italic;">${q.label}</span>
      </td>
      <td style="border:1px solid #333333;padding:5px;line-height:1.4;">
        ${escapeHtml(refleksi[q.key as keyof typeof refleksi] || '-')}
      </td>
    </tr>
  `
  ).join('');

  // Build RTL rows
  const rtlRows =
    rtl.length === 0
      ? `<tr><td colspan="5" style="text-align:center;color:#666;font-style:italic;padding:10px;border:1px solid #333;">Belum ada rencana tindak lanjut yang dicatat.</td></tr>`
      : rtl
          .map(
            (item, index) => `
      <tr>
        <td style="text-align:center;font-weight:bold;width:35px;border:1px solid #333333;padding:5px;">${index + 1}</td>
        <td style="font-weight:bold;border:1px solid #333333;padding:5px;">${escapeHtml(item.fokusAspek)}</td>
        <td style="border:1px solid #333333;padding:5px;">${escapeHtml(item.rencanaKegiatan)}</td>
        <td style="border:1px solid #333333;padding:5px;width:100px;">${escapeHtml(item.waktuTarget)}</td>
        <td style="border:1px solid #333333;padding:5px;">${escapeHtml(item.kriteriaKeberhasilan)}</td>
      </tr>
    `
          )
          .join('');

  const todayStr =
    identity.hariTanggal ||
    new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

  const wordHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>INSTRUMEN LENGKAP SUPERVISI AKADEMIK</title>
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
          size: 21cm 29.7cm; /* A4 */
          margin: 2cm 2cm 2cm 2cm;
          mso-page-orientation: portrait;
        }
        body {
          font-family: 'Calibri', 'Arial', sans-serif;
          font-size: 11pt;
          line-height: 1.35;
          color: #000000;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 14px;
        }
        th, td {
          font-size: 10pt;
          vertical-align: top;
        }
        .header-kop {
          text-align: center;
          border-bottom: 3px double #000000;
          padding-bottom: 8px;
          margin-bottom: 16px;
        }
        .header-kop .instansi {
          font-size: 10pt;
          font-weight: bold;
          letter-spacing: 1px;
          color: #444444;
          text-transform: uppercase;
        }
        .header-kop .sekolah {
          font-size: 15pt;
          font-weight: bold;
          color: #000000;
          text-transform: uppercase;
          margin: 3px 0;
        }
        .header-kop .alamat {
          font-size: 9pt;
          color: #555555;
        }
        .doc-title {
          text-align: center;
          margin-bottom: 18px;
        }
        .doc-title h2 {
          font-size: 13pt;
          font-weight: bold;
          text-decoration: underline;
          text-transform: uppercase;
          margin: 0;
        }
        .doc-title .sub {
          font-size: 10.5pt;
          font-weight: bold;
          color: #333333;
          margin-top: 3px;
        }
        .section-header {
          background-color: #f1f5f9;
          font-weight: bold;
          font-size: 10.5pt;
          padding: 6px 10px;
          border-left: 5px solid #1e293b;
          margin-top: 14px;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .tbl-border th, .tbl-border td {
          border: 1px solid #333333;
          padding: 5px 7px;
        }
        .tbl-border th {
          background-color: #f8fafc;
          font-weight: bold;
        }
        .score-card {
          border: 1px solid #333333;
          background-color: #f8fafc;
          padding: 10px 14px;
          margin-bottom: 14px;
        }
        .ttd-box {
          height: 90px;
        }
      </style>
    </head>
    <body>

      <!-- KOP SURAT RESMI -->
      <div class="header-kop">
        <div class="instansi">KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI</div>
        <div class="instansi">DINAS PENDIDIKAN KABUPATEN / KOTA ${(settings.schoolCity || 'KOTA').toUpperCase()}</div>
        <div class="sekolah">${(settings.schoolName || 'SEKOLAH PENGGERAK').toUpperCase()}</div>
        <div class="alamat">${settings.schoolAddress || 'Alamat Sekolah'} · NPSN: ${settings.schoolNpsn || '-'}</div>
      </div>

      <!-- JUDUL RESMI DOKUMEN -->
      <div class="doc-title">
        <h2>INSTRUMEN LENGKAP SUPERVISI AKADEMIK PEMBELAJARAN</h2>
        <div class="sub">IMPLEMENTASI KURIKULUM MERDEKA — ${(identity.siklus || 'SIKLUS I').toUpperCase()}</div>
        <div style="font-size: 9pt; color: #555555; margin-top: 2px;">Nomor Berkas: ${supervision.id}</div>
      </div>

      <!-- BAGIAN I: IDENTITAS PELAKSANAAN -->
      <div class="section-header">I. IDENTITAS PELAKSANAAN SUPERVISI</div>
      <table style="width:100%; border:none; margin-bottom:12px;">
        <tr>
          <td style="width:160px; font-weight:bold; padding:3px;">1. Nama Guru</td>
          <td style="width:15px; padding:3px;">:</td>
          <td style="font-weight:bold; padding:3px;">${escapeHtml(identity.namaGuru)}</td>
          <td style="width:150px; font-weight:bold; padding:3px;">7. Hari, Tanggal</td>
          <td style="width:15px; padding:3px;">:</td>
          <td style="padding:3px;">${escapeHtml(identity.hariTanggal)}</td>
        </tr>
        <tr>
          <td style="font-weight:bold; padding:3px;">2. NIP / NIK Guru</td>
          <td style="padding:3px;">:</td>
          <td style="font-family:monospace; padding:3px;">${escapeHtml(identity.nipGuru || '-')}</td>
          <td style="font-weight:bold; padding:3px;">8. Jam Pelajaran</td>
          <td style="padding:3px;">:</td>
          <td style="padding:3px;">${escapeHtml(identity.jamPelajaran || '-')}</td>
        </tr>
        <tr>
          <td style="font-weight:bold; padding:3px;">3. Mata Pelajaran</td>
          <td style="padding:3px;">:</td>
          <td style="padding:3px;">${escapeHtml(identity.mapel)}</td>
          <td style="font-weight:bold; padding:3px;">9. Siklus Ke-</td>
          <td style="padding:3px;">:</td>
          <td style="padding:3px;">${escapeHtml(identity.siklus)}</td>
        </tr>
        <tr>
          <td style="font-weight:bold; padding:3px;">4. Kelas / Semester</td>
          <td style="padding:3px;">:</td>
          <td style="padding:3px;">${escapeHtml(identity.kelasSemester)}</td>
          <td style="font-weight:bold; padding:3px;">10. Supervisor</td>
          <td style="padding:3px;">:</td>
          <td style="padding:3px;">${escapeHtml(identity.namaSupervisor)}</td>
        </tr>
        <tr>
          <td style="font-weight:bold; padding:3px;">5. Materi Pokok</td>
          <td style="padding:3px;">:</td>
          <td style="padding:3px;">${escapeHtml(identity.materiPokok || '-')}</td>
          <td style="font-weight:bold; padding:3px;">11. Jabatan Supervisor</td>
          <td style="padding:3px;">:</td>
          <td style="padding:3px;">${escapeHtml(identity.jabatanSupervisor)}</td>
        </tr>
        <tr>
          <td style="font-weight:bold; padding:3px;">6. Fokus Perilaku</td>
          <td style="padding:3px;">:</td>
          <td colspan="4" style="font-style:italic; padding:3px; color:#222;">${escapeHtml(identity.fokusPerilaku || '-')}</td>
        </tr>
      </table>

      <!-- BAGIAN II: PRA-OBSERVASI -->
      <div class="section-header">II. LEMBAR WAWANCARA & TELAAH DOKUMEN PRA-OBSERVASI</div>
      <table class="tbl-border">
        <thead>
          <tr style="background-color:#e2e8f0;">
            <th style="width:35px; text-align:center;">No</th>
            <th style="width:230px; text-align:left;">Pertanyaan Wawancara Pra-Observasi</th>
            <th style="text-align:left;">Catatan Respons Guru & Hasil Telaah Dokumen</th>
          </tr>
        </thead>
        <tbody>
          ${praRows}
        </tbody>
      </table>

      <!-- BAGIAN III: 12 INDIKATOR OBSERVASI KELAS -->
      <div class="section-header">III. HASIL OBSERVASI PEMBELAJARAN (12 INDIKATOR KURIKULUM MERDEKA)</div>
      <p style="font-size:9.5pt; color:#444; margin:0 0 6px 0;">Skala Penilaian: 4 = Sangat Baik | 3 = Baik | 2 = Cukup | 1 = Kurang</p>
      <table class="tbl-border">
        <thead>
          <tr style="background-color:#e2e8f0;">
            <th style="width:35px; text-align:center;">No</th>
            <th style="text-align:left;">Indikator Observasi Kelas</th>
            <th style="width:55px; text-align:center;">Skor (1–4)</th>
            <th style="text-align:left;">Catatan Fakta Objektif Teramati</th>
          </tr>
        </thead>
        <tbody>
          ${observationRows}
        </tbody>
      </table>

      <!-- BAGIAN IV: PERHITUNGAN NILAI AKHIR -->
      <div class="section-header">IV. PERHITUNGAN NILAI AKHIR & KRITERIA KETERCAPAIAN</div>
      <div class="score-card">
        <table style="width:100%; border:none; margin:0;">
          <tr>
            <td style="vertical-align:top;">
              <strong>Rumus Penilaian:</strong><br>
              Nilai Akhir = (Total Skor / Skor Maksimal 48) × 100%<br>
              = (${totalScore} / 48) × 100% = <strong style="font-size:12pt; color:#1e3a8a;">${finalScore}</strong>
            </td>
            <td style="text-align:right; vertical-align:top; border-left:1px solid #ccc; padding-left:14px;">
              <strong>Predikat / Kategori:</strong><br>
              <span style="font-size:13pt; font-weight:bold; color:#0f172a; text-transform:uppercase;">${category}</span><br>
              <span style="font-size:8.5pt; color:#555;">Kriteria: 91–100 (Amat Baik) · 81–90 (Baik) · 71–80 (Cukup) · ≤70 (Kurang)</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- BAGIAN IV.B: RADAR 5 DIMENSI -->
      <div class="section-header">IV.B. RINGKASAN CAPAIAN 5 DIMENSI PEDAGOGIS GURU</div>
      <table class="tbl-border">
        <thead>
          <tr style="background-color:#e2e8f0;">
            <th style="width:35px; text-align:center;">No</th>
            <th style="text-align:left;">Dimensi Pedagogis</th>
            <th style="width:90px; text-align:center;">Capaian (%)</th>
            <th style="text-align:left;">Catatan & Bukti Ketercapaian</th>
          </tr>
        </thead>
        <tbody>
          ${radarRows}
        </tbody>
      </table>
      <p style="font-size:9.5pt; margin-top:2px; font-weight:bold; color:#1e3a8a;">
        Rata-rata Capaian Pedagogis: ${radarData.overallScore}% (${radarData.predicate.text}) · Gap Menuju 100% Paripurna: -${radarData.gapToIdeal}%
      </p>

      <!-- BAGIAN V: REFLEKSI PASCA-OBSERVASI -->
      <div class="section-header">V. LEMBAR REFLEKSI & PASCA-OBSERVASI (DIALOG COACHING)</div>
      <table class="tbl-border">
        <thead>
          <tr style="background-color:#e2e8f0;">
            <th style="width:35px; text-align:center;">No</th>
            <th style="width:230px; text-align:left;">Fokus Pertanyaan Pasca-Observasi</th>
            <th style="text-align:left;">Ulasan Refleksi & Komitmen Guru</th>
          </tr>
        </thead>
        <tbody>
          ${refleksiRows}
        </tbody>
      </table>

      <!-- BAGIAN VI: RENCANA TINDAK LANJUT -->
      <div class="section-header">VI. RENCANA TINDAK LANJUT (RTL) SUPERVISI</div>
      <table class="tbl-border">
        <thead>
          <tr style="background-color:#e2e8f0;">
            <th style="width:35px; text-align:center;">No</th>
            <th style="text-align:left; width:130px;">Fokus Aspek</th>
            <th style="text-align:left;">Rencana Kegiatan Nyata</th>
            <th style="text-align:left; width:90px;">Target Waktu</th>
            <th style="text-align:left;">Kriteria Keberhasilan</th>
          </tr>
        </thead>
        <tbody>
          ${rtlRows}
        </tbody>
      </table>

      <!-- BAGIAN VII: LEMBAR PENGESAHAN & TANDA TANGAN -->
      <div class="section-header" style="margin-top:20px;">VII. LEMBAR PENGESAHAN DOKUMEN</div>
      <div style="text-align:right; font-size:10pt; margin-bottom:12px;">
        ${settings.schoolCity || 'Kota'}, ${todayStr}
      </div>

      <table style="width:100%; border:none; text-align:center;">
        <tr>
          <td style="width:33%; vertical-align:top;">
            Guru yang Disupervisi,
            <div class="ttd-box"></div>
            <strong><u>${escapeHtml(identity.namaGuru)}</u></strong><br>
            <span style="font-family:monospace; font-size:9pt;">NIP: ${escapeHtml(identity.nipGuru || '-')}</span>
          </td>
          <td style="width:33%; vertical-align:top;">
            ${escapeHtml(identity.jabatanSupervisor || 'Pengawas Sekolah')},
            <div class="ttd-box"></div>
            <strong><u>${escapeHtml(identity.namaSupervisor)}</u></strong><br>
            <span style="font-family:monospace; font-size:9pt;">NIP: ${escapeHtml(identity.nipSupervisor || '-')}</span>
          </td>
          <td style="width:33%; vertical-align:top;">
            Mengetahui,<br>
            Pengawas Pembina Sekolah,
            <div class="ttd-box"></div>
            <strong><u>${escapeHtml(settings.pengawasPembinaName || '-')}</u></strong><br>
            <span style="font-family:monospace; font-size:9pt;">NIP: ${escapeHtml(settings.pengawasPembinaNip || '-')}</span>
          </td>
        </tr>
      </table>

    </body>
    </html>
  `;

  downloadBlob(wordHtml, fileName, 'application/msword;charset=utf-8');
}

/**
 * Export PM report to Microsoft Word (.doc).
 */
export function exportPMReportToWord(report: PMReport, settings: AppSettings): void {
  const cleanSchool = (report.schoolName || 'Sekolah').replace(/[/\\?%*:|"<>]/g, '_');
  const cleanSemester = (report.semester || 'Semester').replace(/[/\\?%*:|"<>]/g, '_');
  const fileName = `LAPORAN_PM_${cleanSchool}_${cleanSemester}.doc`;

  const dims = [
    {
      num: 1,
      title: 'Kelengkapan Tahapan Supervisi',
      desc: 'Mencakup pra-observasi, observasi 12 indikator, dan pasca/refleksi secara runtut dan konsisten.',
      data: report.dimension1
    },
    {
      num: 2,
      title: 'Kualitas Data dan Bukti Observasi',
      desc: 'Data sangat lengkap, objektif, berbasis indikator PM, dan menunjukkan praktik nyata di kelas.',
      data: report.dimension2
    },
    {
      num: 3,
      title: 'Kualitas Umpan Balik dan Refleksi',
      desc: 'Umpan balik bersifat dialogis (coaching), memantik kesadaran metakognitif guru, dan berorientasi solusi.',
      data: report.dimension3
    },
    {
      num: 4,
      title: 'Tindak Lanjut Supervisi',
      desc: 'RTL terukur, spesifik, realistis, dan terintegrasi dengan rencana pengembangan keprofesian berkelanjutan.',
      data: report.dimension4
    }
  ];

  const dimensionRows = dims
    .map(
      (dim) => `
      <tr>
        <td style="text-align:center;font-weight:bold;border:1px solid #333;padding:6px;">${dim.num}</td>
        <td style="border:1px solid #333;padding:6px;">
          <strong>${dim.title}</strong><br>
          <span style="font-size:9pt;color:#555;">${dim.desc}</span>
        </td>
        <td style="text-align:center;border:1px solid #333;padding:6px;font-weight:bold;">
          ${dim.data?.score ?? 0} / 25
        </td>
        <td style="text-align:center;border:1px solid #333;padding:6px;font-weight:bold;text-transform:capitalize;">
          ${dim.data?.level ? dim.data.level.replace('_', ' ') : 'Awal'}
        </td>
        <td style="border:1px solid #333;padding:6px;">
          <strong>${escapeHtml(dim.data?.notes || '-')}</strong><br>
          <span style="font-size:9pt;color:#666;">Bukti: ${escapeHtml(dim.data?.evidenceNotes || '-')}</span>
        </td>
      </tr>
    `
    )
    .join('');

  const wordHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>LAPORAN EVALUASI PENGELOLAAN PRAKTIK PEDAGOGIS (PM)</title>
      <style>
        @page { size: 21cm 29.7cm; margin: 2cm; mso-page-orientation: portrait; }
        body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.35; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        th, td { font-size: 10pt; vertical-align: top; border: 1px solid #333; padding: 6px; }
        .header-kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 16px; }
      </style>
    </head>
    <body>
      <div class="header-kop">
        <div style="font-size:10pt;font-weight:bold;">PEMERINTAH DAERAH DINAS PENDIDIKAN KABUPATEN / KOTA ${(settings.schoolCity || 'KOTA').toUpperCase()}</div>
        <div style="font-size:13pt;font-weight:bold;margin:4px 0;">KOORDINATOR PENGAWAS SEKOLAH JENJANG DIKDASMEN</div>
        <div style="font-size:9pt;color:#555;">Sekretariat Pembina Sekolah Binaan Kurikulum Merdeka · Tahun Ajaran ${report.academicYear}</div>
      </div>

      <div style="text-align:center; margin-bottom:16px;">
        <h2 style="font-size:13pt;text-decoration:underline;margin:0;">LAPORAN EVALUASI PENGELOLAAN PRAKTIK PEDAGOGIS (PM)</h2>
        <div style="font-size:10.5pt;font-weight:bold;margin-top:3px;">${escapeHtml(report.schoolName)} — ${escapeHtml(report.semester)} ${escapeHtml(report.academicYear)}</div>
      </div>

      <div style="background:#f1f5f9;font-weight:bold;padding:6px;border-left:4px solid #1e293b;margin-bottom:8px;">
        I. IDENTITAS SATUAN PENDIDIKAN & PENILAI
      </div>
      <table style="border:none;margin-bottom:14px;">
        <tr>
          <td style="border:none;width:150px;font-weight:bold;">Satuan Pendidikan</td>
          <td style="border:none;width:15px;">:</td>
          <td style="border:none;">${escapeHtml(report.schoolName)}</td>
          <td style="border:none;width:150px;font-weight:bold;">Tanggal Evaluasi</td>
          <td style="border:none;width:15px;">:</td>
          <td style="border:none;">${escapeHtml(report.evalDate)}</td>
        </tr>
        <tr>
          <td style="border:none;font-weight:bold;">Nama Penilai</td>
          <td style="border:none;">:</td>
          <td style="border:none;">${escapeHtml(report.assessorName)} (${escapeHtml(report.assessorRole)})</td>
          <td style="border:none;font-weight:bold;">Kepala Sekolah</td>
          <td style="border:none;">:</td>
          <td style="border:none;">${escapeHtml(report.headmasterName)}</td>
        </tr>
        <tr>
          <td style="border:none;font-weight:bold;">NIP Penilai</td>
          <td style="border:none;">:</td>
          <td style="border:none;">${escapeHtml(report.assessorNip || '-')}</td>
          <td style="border:none;font-weight:bold;">NIP Kepala Sekolah</td>
          <td style="border:none;">:</td>
          <td style="border:none;">${escapeHtml(report.headmasterNip || '-')}</td>
        </tr>
      </table>

      <div style="background:#f1f5f9;font-weight:bold;padding:6px;border-left:4px solid #1e293b;margin-bottom:8px;">
        II. CAPAIAN 4 DIMENSI PENGELOLAAN PRAKTIK PEDAGOGIS
      </div>
      <table>
        <thead>
          <tr style="background:#e2e8f0;">
            <th style="width:35px;text-align:center;">No</th>
            <th>Dimensi Praktik Pedagogis</th>
            <th style="width:80px;text-align:center;">Skor</th>
            <th style="width:90px;text-align:center;">Level Capaian</th>
            <th>Catatan Fakta & Bukti Teramati</th>
          </tr>
        </thead>
        <tbody>
          ${dimensionRows}
        </tbody>
      </table>

      <div style="border:1px solid #333;padding:10px;background:#f8fafc;margin-bottom:16px;">
        <strong>Total Skor: ${report.totalScore} / 100 | Kategori Capaian: ${escapeHtml(report.predicate || '-')}</strong><br>
        <p style="margin:4px 0 0 0;font-size:9.5pt;line-height:1.4;">${escapeHtml(report.generalNotes || '-')}</p>
      </div>

      <div style="background:#f1f5f9;font-weight:bold;padding:6px;border-left:4px solid #1e293b;margin-bottom:8px;">
        III. REKOMENDASI PEMBINAAN KELANJUTAN
      </div>
      <div style="border:1px solid #333;padding:10px;margin-bottom:16px;line-height:1.4;">
        ${escapeHtml(report.recommendation || '-')}
      </div>

      <div style="background:#f1f5f9;font-weight:bold;padding:6px;border-left:4px solid #1e293b;margin-bottom:8px;">
        IV. RENCANA INTERVENSI / COACHING
      </div>
      <div style="border:1px solid #333;padding:10px;margin-bottom:20px;line-height:1.4;">
        ${escapeHtml(report.interventionPlan || '-')}
      </div>

      <table style="border:none;margin-top:20px;text-align:center;">
        <tr>
          <td style="border:none;width:50%;">
            Mengetahui,<br>Kepala Sekolah Binaan
            <div style="height:80px;"></div>
            <strong><u>${escapeHtml(report.headmasterName)}</u></strong><br>
            NIP: ${escapeHtml(report.headmasterNip || '-')}
          </td>
          <td style="border:none;width:50%;">
            ${settings.schoolCity || 'Kota'}, ${escapeHtml(report.evalDate)}<br>
            ${escapeHtml(report.assessorRole)},
            <div style="height:80px;"></div>
            <strong><u>${escapeHtml(report.assessorName)}</u></strong><br>
            NIP: ${escapeHtml(report.assessorNip || '-')}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  downloadBlob(wordHtml, fileName, 'application/msword;charset=utf-8');
}

/**
 * Export School Quality Map & Cross-School Comparison to Microsoft Word (.doc)
 */
export function exportQualityMapToWord(
  analysis: QualityMapAnalysis,
  settings: AppSettings
): void {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const fileName = `PETA_MUTU_KOMPARASI_SEKOLAH_BINAAN_${new Date().toISOString().slice(0, 10)}.doc`;

  const wordHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Laporan Peta Mutu & Komparasi Antar-Sekolah Binaan</title>
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
          size: 21cm 29.7cm; /* A4 portrait */
          margin: 2cm 2cm 2cm 2cm;
          mso-page-orientation: portrait;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.35;
          color: #000000;
        }
        h1, h2, h3, h4 {
          margin: 0;
          padding: 0;
          font-family: 'Arial', sans-serif;
        }
        .header-title {
          text-align: center;
          font-size: 14pt;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .header-sub {
          text-align: center;
          font-size: 11pt;
          margin-bottom: 2px;
        }
        .header-address {
          text-align: center;
          font-size: 9pt;
          font-style: italic;
          color: #333333;
          border-bottom: 2.5px solid #000000;
          padding-bottom: 8px;
          margin-bottom: 16px;
        }
        .doc-title {
          text-align: center;
          font-size: 12pt;
          font-weight: bold;
          text-transform: uppercase;
          margin-top: 14px;
          margin-bottom: 4px;
          text-decoration: underline;
        }
        .doc-subtitle {
          text-align: center;
          font-size: 10pt;
          font-style: italic;
          margin-bottom: 18px;
        }
        .section-header {
          font-size: 11pt;
          font-weight: bold;
          background-color: #f1f5f9;
          padding: 5px 8px;
          border-top: 1px solid #000000;
          border-bottom: 1px solid #000000;
          margin-top: 16px;
          margin-bottom: 8px;
        }
        table.data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 14px;
        }
        table.data-table th, table.data-table td {
          border: 1px solid #000000;
          padding: 5px 7px;
          font-size: 9.5pt;
          vertical-align: top;
        }
        table.data-table th {
          background-color: #f8fafc;
          font-weight: bold;
          text-align: center;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .badge {
          display: inline-block;
          padding: 2px 5px;
          font-size: 8pt;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <!-- KOP DINAS PENGAWAS SEKOLAH -->
      <div class="header-title">PEMERINTAH DAERAH DINAS PENDIDIKAN</div>
      <div class="header-title">KOORDINATOR PENGAWAS SEKOLAH MENENGAH PERTAMA</div>
      <div class="header-sub">WILAYAH BINAAN KABUPATEN / KOTA PENDIDIKAN</div>
      <div class="header-address">
        Sekretariat: ${escapeHtml(settings.schoolAddress || 'Gedung Pusat Pengawas Pembina Pendidikan Terpadu')}
      </div>

      <!-- JUDUL RESMI LAPORAN -->
      <div class="doc-title">LAPORAN PETA MUTU &amp; KOMPARASI ANTAR-SEKOLAH BINAAN</div>
      <div class="doc-subtitle">
        Tahun Ajaran 2026/2027 · Semester Ganjil · Evaluasi Berbasis Supervisi Akademik &amp; Praktik Pedagogis
      </div>

      <!-- I. IDENTITAS PENGAWAS & RINGKASAN WILAYAH -->
      <div class="section-header">I. IDENTITAS PENGAWAS PEMBINA &amp; RINGKASAN WILAYAH</div>
      <table class="data-table" style="margin-bottom: 10px;">
        <tr>
          <td style="width:25%; font-weight:bold;">Nama Pengawas Sekolah</td>
          <td style="width:40%;">${escapeHtml(settings.supervisorName)}</td>
          <td style="width:20%; font-weight:bold;">Total Sekolah Binaan</td>
          <td style="width:15%; text-align:center; font-weight:bold;">${analysis.regional.totalSchools} Sekolah</td>
        </tr>
        <tr>
          <td style="font-weight:bold;">NIP Pengawas</td>
          <td>${escapeHtml(settings.supervisorNip)}</td>
          <td style="font-weight:bold;">Total Guru Binaan</td>
          <td style="text-align:center; font-weight:bold;">${analysis.regional.totalTeachers} Guru</td>
        </tr>
        <tr>
          <td style="font-weight:bold;">Jabatan Dinas</td>
          <td>${escapeHtml(settings.supervisorRole || 'Pengawas Sekolah Pembina')}</td>
          <td style="font-weight:bold;">Rata-rata Skor Wilayah</td>
          <td style="text-align:center; font-weight:bold;">${analysis.regional.regionalAverageScore} / 100</td>
        </tr>
        <tr>
          <td style="font-weight:bold;">Sekolah Nilai Tertinggi</td>
          <td>${escapeHtml(analysis.regional.topSchool.name)} (${analysis.regional.topSchool.score}%)</td>
          <td style="font-weight:bold;">Indikator Unggulan</td>
          <td>${escapeHtml(analysis.regional.regionalStrengthsIndicator.title)} (${analysis.regional.regionalStrengthsIndicator.score})</td>
        </tr>
        <tr>
          <td style="font-weight:bold;">Sekolah Prioritas Intervensi</td>
          <td>${escapeHtml(analysis.regional.needSupportSchool.name)} (${analysis.regional.needSupportSchool.score}%)</td>
          <td style="font-weight:bold;">Blindspot / Gap Wilayah</td>
          <td style="color:#b91c1c; font-weight:bold;">${escapeHtml(analysis.regional.regionalBlindspotIndicator.title)} (${analysis.regional.regionalBlindspotIndicator.score})</td>
        </tr>
      </table>

      <!-- II. MATRIKS PETA MUTU SEKOLAH BINAAN -->
      <div class="section-header">II. MATRIKS PETA MUTU &amp; CAPAIAN 5 DIMENSI PEMBELAJARAN</div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:4%;">No</th>
            <th style="width:28%;">Satuan Pendidikan (Sekolah Binaan)</th>
            <th style="width:8%;">Guru</th>
            <th style="width:9%;">Skor Akhir</th>
            <th style="width:12%;">Predikat</th>
            <th style="width:7%;">Pra (%)</th>
            <th style="width:7%;">Awal (%)</th>
            <th style="width:7%;">Inti (%)</th>
            <th style="width:7%;">Tutup (%)</th>
            <th style="width:11%;">Status Dukungan</th>
          </tr>
        </thead>
        <tbody>
          ${analysis.schools
            .map(
              (s, i) => `
            <tr>
              <td class="text-center">${i + 1}</td>
              <td class="bold">${escapeHtml(s.schoolName)}</td>
              <td class="text-center">${s.teacherCount}</td>
              <td class="text-center bold" style="font-size:10.5pt;">${s.averagePercentage}%</td>
              <td class="text-center">${escapeHtml(s.category)}</td>
              <td class="text-center">${s.dimensions.praObservasi}%</td>
              <td class="text-center">${s.dimensions.pendahuluan}%</td>
              <td class="text-center">${s.dimensions.inti}%</td>
              <td class="text-center">${s.dimensions.penutup}%</td>
              <td class="bold" style="font-size:8.5pt;">${escapeHtml(s.supportTierLabel)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <!-- III. KOMPARASI 12 INDIKATOR OBSERVASI KELAS -->
      <div class="section-header">III. KOMPARASI DETAIL 12 INDIKATOR OBSERVASI KELAS (SKALA 1.0 - 4.0)</div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:5%;">No</th>
            <th style="width:35%;">Indikator Observasi Kurikulum Merdeka</th>
            ${analysis.schools.map((s) => `<th style="width:12%;">${escapeHtml(s.schoolName.replace('Merdeka Nusantara', '').replace('SMP Negeri ', 'SMPN '))}</th>`).join('')}
            <th style="width:10%;">Rerata Wilayah</th>
            <th style="width:14%;">Status Evaluasi</th>
          </tr>
        </thead>
        <tbody>
          ${OBSERVATION_INDICATORS.map((ind) => {
            const rowScores = analysis.schools.map((s) => s.indicatorScores[ind.id] || 0);
            const avg = Number((rowScores.reduce((a, b) => a + b, 0) / analysis.schools.length).toFixed(2));
            const isHighest = avg >= 3.6;
            const isLowest = avg < 3.2;
            const statusLabel = isHighest ? 'Kekuatan Bersama' : isLowest ? 'Blindspot / Butuh Bimtek' : 'Tercapai Sesuai Target';

            return `
              <tr style="${isLowest ? 'background-color:#fff5f5;' : isHighest ? 'background-color:#f0fdf4;' : ''}">
                <td class="text-center">${ind.id}</td>
                <td><strong>${escapeHtml(ind.title)}</strong><br><span style="font-size:8pt; color:#475569;">${escapeHtml(ind.description)}</span></td>
                ${analysis.schools
                  .map(
                    (s) => `
                  <td class="text-center bold">${s.indicatorScores[ind.id] ? s.indicatorScores[ind.id].toFixed(2) : '-'}</td>
                `
                  )
                  .join('')}
                <td class="text-center bold" style="background-color:#f8fafc;">${avg.toFixed(2)}</td>
                <td class="bold" style="font-size:8.5pt; color:${isLowest ? '#b91c1c' : isHighest ? '#15803d' : '#334155'};">${statusLabel}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <!-- IV. PROGRAM KEMITRAAN ANTAR-SEKOLAH (PEER MENTORING) -->
      <div class="section-header">IV. REKOMENDASI PROGRAM KEMITRAAN ANTAR-SEKOLAH (PEER-TO-PEER SCHOOL MENTORING)</div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:5%;">No</th>
            <th style="width:20%;">Sekolah Pengimbas (Mentor)</th>
            <th style="width:20%;">Sekolah Sasaran (Mentee)</th>
            <th style="width:20%;">Fokus Pendampingan</th>
            <th style="width:35%;">Bentuk Kegiatan &amp; Strategi Pengawas</th>
          </tr>
        </thead>
        <tbody>
          ${analysis.pairings
            .map(
              (pair, idx) => `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td><strong>${escapeHtml(pair.sourceSchool)}</strong><br><span style="font-size:8pt; color:#15803d;">Skor Capaian: ${pair.mentorScore}%</span></td>
              <td><strong>${escapeHtml(pair.targetSchool)}</strong><br><span style="font-size:8pt; color:#b91c1c;">Skor Capaian: ${pair.targetScore}%</span></td>
              <td class="bold">${escapeHtml(pair.focusArea)}</td>
              <td>
                ${escapeHtml(pair.actionStrategy)}<br>
                <span style="font-size:8pt; font-style:italic; color:#475569;">Target Hasil: ${escapeHtml(pair.expectedOutcome)}</span>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <!-- V. AGENDA TINDAK LANJUT KOLEKTIF PENGAWAS -->
      <div class="section-header">V. AGENDA TINDAK LANJUT KOLEKTIF PENGAWAS PEMBINA</div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:5%;">No</th>
            <th style="width:25%;">Topik Intervensi</th>
            <th style="width:15%;">Format Program</th>
            <th style="width:20%;">Sasaran Peserta</th>
            <th style="width:35%;">Rasional &amp; Waktu Pelaksanaan</th>
          </tr>
        </thead>
        <tbody>
          ${analysis.collectivePlans
            .map(
              (plan, idx) => `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td class="bold">${escapeHtml(plan.topic)}</td>
              <td>${escapeHtml(plan.format)}</td>
              <td>${escapeHtml(plan.targetAudience)}</td>
              <td>
                ${escapeHtml(plan.rationale)}<br>
                <strong>Jadwal:</strong> ${escapeHtml(plan.scheduleRecommendation)}
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <!-- LEMBAR PENGESAHAN DOKUMEN -->
      <br>
      <table style="width:100%; border:none; margin-top:20px; font-size:10pt;">
        <tr>
          <td style="width:50%; text-align:left; vertical-align:top; border:none;">
            Mengetahui,<br>
            Koordinator Pengawas / Kepala Dinas Pendidikan<br>
            <div style="height:70px;"></div>
            <strong><u>${escapeHtml(settings.pengawasPembinaName || 'Dr. Hj. Endang Sulastri, M.Pd.')}</u></strong><br>
            NIP. ${escapeHtml(settings.pengawasPembinaNip || '19650410 199103 2 001')}
          </td>
          <td style="width:50%; text-align:left; vertical-align:top; border:none; padding-left:40px;">
            ${escapeHtml(settings.schoolCity || 'Kota Pendidikan')}, ${currentDate}<br>
            Pengawas Sekolah Pembina,<br>
            <div style="height:70px;"></div>
            <strong><u>${escapeHtml(settings.supervisorName)}</u></strong><br>
            NIP. ${escapeHtml(settings.supervisorNip)}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  downloadBlob(wordHtml, fileName, 'application/msword;charset=utf-8');
}

/**
 * Export Cycle Growth Tracker (Siklus I vs Siklus II) to Microsoft Word (.doc)
 */
export function exportGrowthTrackerToWord(
  comparisons: TeacherCycleComparison[],
  regional: RegionalGrowthAnalysis,
  settings: AppSettings,
  selectedTeacherId?: string
): void {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const selectedTeacher = selectedTeacherId
    ? comparisons.find((c) => c.teacherId === selectedTeacherId)
    : undefined;

  const fileName = selectedTeacher
    ? `GROWTH_SIKLUS_${selectedTeacher.teacherName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.doc`
    : `REKAP_PERTUMBUHAN_SIKLUS_GURU_${new Date().toISOString().slice(0, 10)}.doc`;

  const wordHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Laporan Perkembangan Kompetensi Guru Antar-Siklus Supervisi</title>
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
          size: 21cm 29.7cm;
          margin: 2cm 2cm 2cm 2cm;
          mso-page-orientation: portrait;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.35;
          color: #000000;
        }
        .header-title {
          text-align: center;
          font-size: 14pt;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .header-sub {
          text-align: center;
          font-size: 11pt;
          margin-bottom: 2px;
        }
        .header-address {
          text-align: center;
          font-size: 9pt;
          font-style: italic;
          color: #333333;
          border-bottom: 2.5px solid #000000;
          padding-bottom: 8px;
          margin-bottom: 16px;
        }
        .doc-title {
          text-align: center;
          font-size: 12pt;
          font-weight: bold;
          text-transform: uppercase;
          margin-top: 14px;
          margin-bottom: 4px;
          text-decoration: underline;
        }
        .doc-subtitle {
          text-align: center;
          font-size: 10pt;
          font-style: italic;
          margin-bottom: 18px;
        }
        .section-header {
          font-size: 11pt;
          font-weight: bold;
          background-color: #f1f5f9;
          padding: 5px 8px;
          border-top: 1px solid #000000;
          border-bottom: 1px solid #000000;
          margin-top: 16px;
          margin-bottom: 8px;
        }
        table.data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 14px;
        }
        table.data-table th, table.data-table td {
          border: 1px solid #000000;
          padding: 5px 7px;
          font-size: 9.5pt;
          vertical-align: top;
        }
        table.data-table th {
          background-color: #f8fafc;
          font-weight: bold;
          text-align: center;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
      </style>
    </head>
    <body>
      <!-- KOP DINAS -->
      <div class="header-title">PEMERINTAH DAERAH DINAS PENDIDIKAN</div>
      <div class="header-title">KOORDINATOR PENGAWAS SEKOLAH MENENGAH PERTAMA</div>
      <div class="header-sub">PROGRAM SUPERVISI KLINIS BERKELANJUTAN KURIKULUM MERDEKA</div>
      <div class="header-address">
        Sekretariat: ${escapeHtml(settings.schoolAddress || 'Gedung Pusat Pengawas Pembina Pendidikan Terpadu')}
      </div>

      <!-- JUDUL LAPORAN -->
      <div class="doc-title">
        ${selectedTeacher ? 'LAPORAN EVALUASI PERTUMBUHAN KOMPETENSI GURU (SIKLUS I VS SIKLUS II)' : 'REKAPITULASI EVALUASI PERTUMBUHAN GURU ANTAR-SIKLUS SUPERVISI'}
      </div>
      <div class="doc-subtitle">
        Tahun Ajaran 2026/2027 · Semester Ganjil · Berdasarkan Observasi Kelas 12 Indikator &amp; Verifikasi RTL
      </div>

      <!-- I. RINGKASAN EKSEKUTIF -->
      <div class="section-header">I. IDENTITAS PENGAWAS &amp; RINGKASAN CAPAIAN WILAYAH</div>
      <table class="data-table">
        <tr>
          <td style="width:25%; font-weight:bold;">Nama Pengawas</td>
          <td style="width:40%;">${escapeHtml(settings.supervisorName)}</td>
          <td style="width:20%; font-weight:bold;">Total Guru Terpantau</td>
          <td style="width:15%; text-align:center; font-weight:bold;">${regional.totalTrackedTeachers} Guru</td>
        </tr>
        <tr>
          <td style="font-weight:bold;">NIP Pengawas</td>
          <td>${escapeHtml(settings.supervisorNip)}</td>
          <td style="font-weight:bold;">Rata-rata Kenaikan Skor</td>
          <td style="text-align:center; font-weight:bold; color:#15803d;">+${regional.averageGrowthDelta} Poin (+${regional.averageGrowthPercentage}%)</td>
        </tr>
        <tr>
          <td style="font-weight:bold;">Indikator Melejit Cepat</td>
          <td>${escapeHtml(regional.topFastestGrowingIndicator.title)} (+${regional.topFastestGrowingIndicator.avgDelta})</td>
          <td style="font-weight:bold;">Kategori Akselerasi</td>
          <td style="text-align:center; font-weight:bold;">${regional.acceleratedCount} Guru (&ge; +10 pt)</td>
        </tr>
      </table>

      ${
        selectedTeacher
          ? `
        <!-- DETAIL GURU TERPILIH -->
        <div class="section-header">II. BIODATA PENDIDIK &amp; PERTUMBUHAN ANTAR-SIKLUS</div>
        <table class="data-table">
          <tr>
            <td style="width:25%; font-weight:bold;">Nama Guru</td>
            <td style="width:35%;">${escapeHtml(selectedTeacher.teacherName)}</td>
            <td style="width:20%; font-weight:bold;">Mata Pelajaran</td>
            <td style="width:20%;">${escapeHtml(selectedTeacher.mapel)}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;">NIP Guru</td>
            <td>${escapeHtml(selectedTeacher.nip)}</td>
            <td style="font-weight:bold;">Satuan Pendidikan</td>
            <td>${escapeHtml(selectedTeacher.satuanPendidikan)}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;">Skor Siklus I (Awal)</td>
            <td style="font-weight:bold;">${selectedTeacher.scoreCycle1}% (${selectedTeacher.categoryCycle1})</td>
            <td style="font-weight:bold;">Skor Siklus II (Evaluasi)</td>
            <td style="font-weight:bold; color:#15803d;">${selectedTeacher.scoreCycle2}% (${selectedTeacher.categoryCycle2})</td>
          </tr>
          <tr>
            <td style="font-weight:bold;">Lompatan Mutu (&Delta;)</td>
            <td style="font-weight:bold; color:#15803d;">+${selectedTeacher.deltaScore} Poin (+${selectedTeacher.growthPercentage}%)</td>
            <td style="font-weight:bold;">Status Trajektori</td>
            <td style="font-weight:bold;">${escapeHtml(selectedTeacher.trajectoryLabel)}</td>
          </tr>
        </table>

        <!-- TABEL KOMPARASI 12 INDIKATOR GURU -->
        <div class="section-header">III. KOMPARASI DETAIL 12 INDIKATOR OBSERVASI KELAS (SIKLUS I VS SIKLUS II)</div>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:5%;">No</th>
              <th style="width:45%;">Indikator Observasi Kurikulum Merdeka</th>
              <th style="width:15%;">Siklus I (1-4)</th>
              <th style="width:15%;">Siklus II (1-4)</th>
              <th style="width:20%;">Pertumbuhan (&Delta;)</th>
            </tr>
          </thead>
          <tbody>
            ${OBSERVATION_INDICATORS.map((ind) => {
              const deltaInfo = selectedTeacher.indicatorDeltas[ind.id] || { cycle1: 0, cycle2: 0, delta: 0 };
              const isPositive = deltaInfo.delta > 0;
              return `
                <tr style="${isPositive ? 'background-color:#f0fdf4;' : ''}">
                  <td class="text-center">${ind.id}</td>
                  <td><strong>${escapeHtml(ind.title)}</strong><br><span style="font-size:8pt; color:#475569;">${escapeHtml(ind.description)}</span></td>
                  <td class="text-center bold">${deltaInfo.cycle1.toFixed(1)}</td>
                  <td class="text-center bold" style="color:#15803d;">${deltaInfo.cycle2.toFixed(1)}</td>
                  <td class="text-center bold" style="color:${isPositive ? '#15803d' : '#475569'};">
                    ${isPositive ? '+' : ''}${deltaInfo.delta.toFixed(1)}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- INTERVENSI DAN REKOMENDASI -->
        <div class="section-header">IV. INTERVENSI KLINIS YANG DITERAPKAN &amp; REKOMENDASI LANJUTAN</div>
        <table class="data-table">
          <tr>
            <td style="width:30%; font-weight:bold;">Intervensi Pasca Siklus I</td>
            <td style="width:70%;">
              <ul>
                ${selectedTeacher.interventionsApplied.map((intv) => `<li>${escapeHtml(intv)}</li>`).join('')}
              </ul>
            </td>
          </tr>
          <tr>
            <td style="font-weight:bold;">Rekomendasi Lanjutan Pengawas</td>
            <td style="font-weight:bold; color:#1e293b;">${escapeHtml(selectedTeacher.postCycleRecommendation)}</td>
          </tr>
        </table>
      `
          : `
        <!-- DAFTAR PERTUMBUHAN SELURUH GURU -->
        <div class="section-header">II. MATRIKS PERKEMBANGAN GURU BINAAN (SIKLUS I KE SIKLUS II)</div>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:4%;">No</th>
              <th style="width:24%;">Nama Guru &amp; NIP</th>
              <th style="width:16%;">Mata Pelajaran</th>
              <th style="width:18%;">Satuan Pendidikan</th>
              <th style="width:10%;">Siklus I</th>
              <th style="width:10%;">Siklus II</th>
              <th style="width:9%;">Pertumbuhan (&Delta;)</th>
              <th style="width:9%;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${comparisons
              .map(
                (c, i) => `
              <tr>
                <td class="text-center">${i + 1}</td>
                <td><strong>${escapeHtml(c.teacherName)}</strong><br><span style="font-size:8pt; color:#475569;">NIP: ${escapeHtml(c.nip)}</span></td>
                <td>${escapeHtml(c.mapel)}</td>
                <td>${escapeHtml(c.satuanPendidikan)}</td>
                <td class="text-center">${c.scoreCycle1}%</td>
                <td class="text-center bold" style="color:#15803d;">${c.scoreCycle2}%</td>
                <td class="text-center bold" style="color:#15803d;">+${c.deltaScore} pt</td>
                <td class="bold" style="font-size:8pt;">${escapeHtml(c.trajectory)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `
      }

      <!-- LEMBAR PENGESAHAN DOKUMEN -->
      <br>
      <table style="width:100%; border:none; margin-top:20px; font-size:10pt;">
        <tr>
          <td style="width:50%; text-align:left; vertical-align:top; border:none;">
            Mengetahui,<br>
            Kepala Satuan Pendidikan Binaan<br>
            <div style="height:70px;"></div>
            <strong><u>${escapeHtml(selectedTeacher?.satuanPendidikan.includes('SMP Negeri 1') ? 'Dra. Hj. Nurhasanah, M.Pd.' : settings.pengawasPembinaName || 'Kepala Sekolah')}</u></strong><br>
            NIP: ${escapeHtml(selectedTeacher?.satuanPendidikan.includes('SMP Negeri 1') ? '19720815 199802 2 003' : '-')}
          </td>
          <td style="width:50%; text-align:left; vertical-align:top; border:none; padding-left:40px;">
            ${escapeHtml(settings.schoolCity || 'Kota Pendidikan')}, ${currentDate}<br>
            Pengawas Sekolah Pembina,<br>
            <div style="height:70px;"></div>
            <strong><u>${escapeHtml(settings.supervisorName)}</u></strong><br>
            NIP. ${escapeHtml(settings.supervisorNip)}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  downloadBlob(wordHtml, fileName, 'application/msword;charset=utf-8');
}

/**
 * Helper to download HTML / text content as a downloadable file
 */
function downloadBlob(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob(['\ufeff' + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 300);
}

/**
 * Escape HTML for text insertion
 */
function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
