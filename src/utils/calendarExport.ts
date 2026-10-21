/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VisitAgenda, AppSettings, VISIT_TYPE_LABELS } from '../types/inspiro';

/**
 * Generate standard RFC 5545 iCalendar (.ics) format string
 */
export function generateIcsContent(agendas: VisitAgenda[], supervisorName: string): string {
  const formatIcsDate = (dateStr: string, timeStr?: string) => {
    // dateStr: YYYY-MM-DD, timeStr: HH:mm
    const cleanDate = dateStr.replace(/-/g, '');
    if (!timeStr) return `${cleanDate}T080000`;
    const cleanTime = timeStr.replace(/:/g, '').padEnd(4, '0') + '00';
    return `${cleanDate}T${cleanTime}`;
  };

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//INSPIRO//Supervisi & Agenda Kunjungan Sekolah//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Agenda Supervisi - ${supervisorName}`,
    'X-WR-TIMEZONE:Asia/Jakarta'
  ];

  agendas.forEach((agenda) => {
    const dtStart = formatIcsDate(agenda.date, agenda.startTime || '08:00');
    const dtEnd = formatIcsDate(agenda.date, agenda.endTime || '12:00');
    const typeLabel = VISIT_TYPE_LABELS[agenda.visitType]?.label || agenda.visitType;
    const summary = `${agenda.title} - ${agenda.schoolName}`;
    const description = [
      `Jenis Kunjungan: ${typeLabel}`,
      `Sasaran & Target: ${agenda.purposeAndTargets}`,
      agenda.targetTeacherNames && agenda.targetTeacherNames.length > 0
        ? `Guru Sasaran: ${agenda.targetTeacherNames.join(', ')}`
        : '',
      agenda.notes ? `Catatan: ${agenda.notes}` : '',
      `Pengawas Pembina: ${supervisorName}`
    ]
      .filter(Boolean)
      .join('\\n');

    lines.push(
      'BEGIN:VEVENT',
      `UID:${agenda.id}-${agenda.date}@inspiro.edu`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${summary.replace(/,/g, '\\,')}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${agenda.schoolName.replace(/,/g, '\\,')}`,
      `STATUS:${agenda.status === 'selesai' ? 'CONFIRMED' : 'TENTATIVE'}`,
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Trigger download of .ics file
 */
export function downloadIcsFile(agendas: VisitAgenda[], filename: string, supervisorName: string): void {
  const icsData = generateIcsContent(agendas, supervisorName);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate Google Calendar Web Add URL
 */
export function getGoogleCalendarUrl(agenda: VisitAgenda, supervisorName: string): string {
  const cleanDate = agenda.date.replace(/-/g, '');
  const startT = (agenda.startTime || '08:00').replace(/:/g, '') + '00';
  const endT = (agenda.endTime || '12:00').replace(/:/g, '') + '00';
  const dates = `${cleanDate}T${startT}/${cleanDate}T${endT}`;

  const typeLabel = VISIT_TYPE_LABELS[agenda.visitType]?.label || agenda.visitType;
  const details = [
    `Agenda: ${agenda.title}`,
    `Jenis: ${typeLabel}`,
    `Sasaran: ${agenda.purposeAndTargets}`,
    agenda.targetTeacherNames && agenda.targetTeacherNames.length > 0
      ? `Guru Sasaran: ${agenda.targetTeacherNames.join(', ')}`
      : '',
    agenda.notes ? `Catatan: ${agenda.notes}` : '',
    `Pengawas: ${supervisorName}`
  ]
    .filter(Boolean)
    .join('\n');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `[INSPIRO] ${agenda.title} (${agenda.schoolName})`,
    dates: dates,
    details: details,
    location: agenda.schoolName
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Export Visit Agenda Schedule to Microsoft Word (.doc)
 */
export function exportVisitAgendasToWord(
  agendas: VisitAgenda[],
  settings: AppSettings,
  monthLabel: string
): void {
  const cleanSchool = settings.schoolName || 'KOTA PENDIDIKAN';
  const supervisorName = settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd';
  const supervisorNip = settings.supervisorNip || '19820415 200801 1 007';
  const supervisorRole = settings.supervisorRole || 'Pengawas Sekolah';
  const approverName = settings.pengawasPembinaName || 'Dr. Hj. Endang Sulastri, M.Pd.';
  const approverNip = settings.pengawasPembinaNip || '19650410 199103 2 001';
  const approverRole = settings.pengawasPembinaRole || 'Koordinator Pengawas / Kepala Dinas';

  const rows = agendas
    .map((a, idx) => {
      const typeLabel = VISIT_TYPE_LABELS[a.visitType]?.label || a.visitType;
      const statusLabel =
        a.status === 'selesai'
          ? 'Terlaksana'
          : a.status === 'berlangsung'
          ? 'Sedang Berlangsung'
          : a.status === 'ditunda'
          ? 'Dijadwalkan Ulang'
          : 'Terjadwal';

      const targets = [
        a.purposeAndTargets,
        a.targetTeacherNames && a.targetTeacherNames.length > 0
          ? `Guru: ${a.targetTeacherNames.join(', ')}`
          : ''
      ]
        .filter(Boolean)
        .join('<br/>');

      return `
      <tr>
        <td style="text-align:center;padding:6px;border:1px solid #000;">${idx + 1}</td>
        <td style="padding:6px;border:1px solid #000;white-space:nowrap;">
          <strong>${a.date}</strong><br/>
          <span style="font-size:9pt;color:#555;">${a.startTime || '08:00'} - ${a.endTime || 'Selesai'} WIB</span>
        </td>
        <td style="padding:6px;border:1px solid #000;"><strong>${a.schoolName}</strong></td>
        <td style="padding:6px;border:1px solid #000;">
          <strong>${a.title}</strong><br/>
          <span style="font-size:9pt;color:#1e40af;">[${typeLabel}]</span>
        </td>
        <td style="padding:6px;border:1px solid #000;font-size:9.5pt;">${targets}</td>
        <td style="text-align:center;padding:6px;border:1px solid #000;font-size:9pt;font-weight:bold;">
          ${statusLabel}
        </td>
        <td style="padding:6px;border:1px solid #000;font-size:9pt;">
          ${a.completionNotes || a.notes || '-'}
        </td>
      </tr>
      `;
    })
    .join('');

  const wordHtml = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:w="urn:schemas-microsoft-com:office:word"
        xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta charset="utf-8">
    <title>Jadwal Agenda Kunjungan Supervisi - ${monthLabel}</title>
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
        size: A4 landscape;
        margin: 1.5cm 1.5cm 1.5cm 1.5cm;
        mso-page-orientation: landscape;
      }
      body {
        font-family: 'Times New Roman', Times, serif;
        font-size: 11pt;
        line-height: 1.35;
        color: #000;
      }
      .kop {
        text-align: center;
        border-bottom: 3px double #000;
        padding-bottom: 8px;
        margin-bottom: 16px;
      }
      .kop h3 { margin: 0; font-size: 13pt; text-transform: uppercase; font-weight: bold; }
      .kop h2 { margin: 2px 0; font-size: 14pt; text-transform: uppercase; font-weight: bold; }
      .kop p { margin: 2px 0; font-size: 9.5pt; }
      .title-section { text-align: center; margin-bottom: 14px; }
      .title-section h3 { margin: 0; font-size: 13pt; text-decoration: underline; text-transform: uppercase; font-weight: bold; }
      .title-section p { margin: 4px 0 0 0; font-size: 10.5pt; font-style: italic; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10pt; }
      th { background-color: #f1f5f9; padding: 7px; border: 1px solid #000; font-weight: bold; text-align: center; }
      .sig-table { width: 100%; border-collapse: collapse; margin-top: 30px; border: none; }
      .sig-table td { border: none; padding: 4px; vertical-align: top; }
    </style>
  </head>
  <body>
    <div class="kop">
      <h3>${settings.governmentAgency || 'PEMERINTAH KABUPATEN SIDENRENG RAPPANG'}</h3>
      <h2>DINAS PENDIDIKAN DAN KEBUDAYAAN</h2>
      <p>KANTOR PENGAWAS SEKOLAH PEMBINA SATUAN PENDIDIKAN</p>
      <p style="font-size: 8.5pt; color: #444;">${settings.schoolAddress || 'Kompleks Perkantoran Pendidikan Terpadu'} | Telepon / Pos-el Resmi Kedinasan</p>
    </div>

    <div class="title-section">
      <h3>MATRIKS JADWAL & AGENDA KUNJUNGAN SUPERVISI PENGAWAS SEKOLAH</h3>
      <p>Periode: ${monthLabel} · Tahun Ajaran 2026/2027</p>
    </div>

    <table style="width: 100%; margin-bottom: 12px; font-size: 10pt; border: none;">
      <tr>
        <td style="width: 18%; border: none;"><strong>Nama Pengawas</strong></td>
        <td style="width: 2%; border: none;">:</td>
        <td style="width: 40%; border: none;">${supervisorName}</td>
        <td style="width: 18%; border: none;"><strong>Wilayah Sasaran</strong></td>
        <td style="width: 2%; border: none;">:</td>
        <td style="width: 20%; border: none;">Sekolah Binaan Kota/Kab.</td>
      </tr>
      <tr>
        <td style="border: none;"><strong>NIP Pengawas</strong></td>
        <td style="border: none;">:</td>
        <td style="border: none;">${supervisorNip}</td>
        <td style="border: none;"><strong>Total Agenda</strong></td>
        <td style="border: none;">:</td>
        <td style="border: none;">${agendas.length} Kunjungan / Kegiatan</td>
      </tr>
    </table>

    <table>
      <thead>
        <tr>
          <th style="width: 4%;">No</th>
          <th style="width: 14%;">Tanggal & Waktu</th>
          <th style="width: 18%;">Satuan Pendidikan</th>
          <th style="width: 20%;">Agenda & Jenis Kunjungan</th>
          <th style="width: 24%;">Sasaran & Target Output</th>
          <th style="width: 10%;">Status</th>
          <th style="width: 10%;">Catatan / Hasil</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <table class="sig-table">
      <tr>
        <td style="width: 50%; text-align: center;">
          Mengetahui,<br/>
          <strong>${approverRole}</strong><br/><br/><br/><br/>
          <strong style="text-decoration: underline;">${approverName}</strong><br/>
          <span>NIP. ${approverNip}</span>
        </td>
        <td style="width: 50%; text-align: center;">
          ${settings.schoolCity || 'Kota Pendidikan'}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>
          <strong>${supervisorRole}</strong><br/><br/><br/><br/>
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
  const fileName = `Agenda_Kunjungan_Supervisi_${monthLabel.replace(/\s+/g, '_')}_${supervisorName.replace(/[,. ]+/g, '_')}.doc`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
