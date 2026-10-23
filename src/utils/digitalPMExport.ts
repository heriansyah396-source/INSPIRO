/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PMDigitalRecord, AppSettings } from '../types/inspiro';

export function exportDigitalPMToWord(record: PMDigitalRecord, settings: AppSettings): void {
  const govAgency = settings.governmentAgency || 'PEMERINTAH KABUPATEN SIDENRENG RAPPANG';
  const schoolCity = settings.schoolCity || 'Kabupaten Sidenreng Rappang';
  const documentDate = settings.documentDate || new Date(record.date || Date.now()).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const getMaturityColor = (level: string) => {
    if (level.includes('Redefinition') || level.includes('Membudaya')) return '#047857';
    if (level.includes('Modification') || level.includes('Matang')) return '#1d4ed8';
    if (level.includes('Augmentation') || level.includes('Berkembang')) return '#b45309';
    return '#b91c1c';
  };

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Instrumen Evaluasi Pemanfaatan Digital PM - ${record.teacherName}</title>
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
          background-color: #0f766e;
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

      <div class="doc-title">INSTRUMEN EVALUASI & OBSERVASI PEMANFAATAN DIGITAL (PM)</div>
      <div class="doc-subtitle">FOKUS: LEVERAGING DIGITAL FOR DEEP LEARNING & ANALISIS TANGGA SAMR</div>

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
          <td>${record.topic || 'Pemanfaatan Digital dalam Pembelajaran Mendalam'}</td>
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
              <div style="font-size: 8.5pt; color: #475569; text-transform: uppercase;">Skor Keseluruhan Digital PM</div>
              <div style="font-size: 22pt; font-weight: bold; color: #0f766e;">${record.totalScore.toFixed(1)} <span style="font-size: 11pt;">/ 100</span></div>
              <div style="font-size: 9.5pt; font-weight: bold; color: ${getMaturityColor(record.maturityLevel)};">${record.maturityLevel}</div>
            </td>
            <td width="34%" style="text-align: center; border-right: 1px solid #cbd5e1; padding: 6px;">
              <div style="font-size: 8.5pt; color: #475569; text-transform: uppercase;">Level Model SAMR</div>
              <div style="font-size: 16pt; font-weight: bold; color: #1e40af;">${record.toolUsage.samrLevel}</div>
              <div style="font-size: 9.5pt; font-weight: bold; color: #2563eb;">${record.toolUsage.deviceType}</div>
            </td>
            <td width="33%" style="text-align: center; padding: 6px;">
              <div style="font-size: 8.5pt; color: #475569; text-transform: uppercase;">Rasio Murid Operasikan Gawai</div>
              <div style="font-size: 16pt; font-weight: bold; color: #047857;">${record.toolUsage.studentHandsOnRatioPct.toFixed(1)}%</div>
              <div style="font-size: 9.5pt; font-weight: bold; color: #065f46;">${record.toolUsage.studentHandsOnDuration} Menit dari ${record.toolUsage.totalLessonDuration} Menit</div>
            </td>
          </tr>
        </table>
      </div>

      <!-- ANALISIS SAMR -->
      <div class="card-box" style="border-left: 4px solid #0f766e; background-color: #f0fdfa;">
        <p style="margin: 0; font-size: 9.5pt; color: #134e4a;">
          <strong>Ringkasan Evaluasi SAMR:</strong> ${record.samrSummary}
        </p>
        <p style="margin: 4px 0 0 0; font-size: 9pt; color: #0f766e;">
          <strong>Aplikasi & Platform Digunakan:</strong> ${record.toolUsage.toolsUsed.join(', ')}
        </p>
      </div>

      <!-- 4 DIMENSI PEMANFAATAN DIGITAL -->
      <div class="section-header">I. PENILAIAN 4 DIMENSI PEMANFAATAN DIGITAL (TOTAL 100 POIN)</div>
      <table class="data-table">
        <tr>
          <th width="32%">Dimensi Penilaian Digital</th>
          <th width="15%">Skor & Predikat</th>
          <th width="53%">Uraian Deskriptif & Bukti Nyata di Kelas</th>
        </tr>
        <tr>
          <td>
            <strong>1. Peran Murid: Kreator Konten Digital Otentik</strong><br>
            <span style="font-size: 8.5pt; color: #64748b;">Artefak: ${record.dim1CreatorRole.artifactsCreated}</span>
          </td>
          <td style="text-align: center;">
            <strong>Skor ${record.dim1CreatorRole.score} / 4</strong><br>
            <span style="font-size: 8.5pt;">(${record.dim1CreatorRole.level})</span>
          </td>
          <td>
            <p style="margin: 0;"><strong>Analisis:</strong> ${record.dim1CreatorRole.notes}</p>
            <p style="margin: 3px 0 0 0; color: #475569;"><strong>Bukti:</strong> ${record.dim1CreatorRole.evidenceNotes || '-'}</p>
          </td>
        </tr>
        <tr>
          <td>
            <strong>2. Kolaborasi & Komunikasi Digital Lintas Ruang</strong><br>
            <span style="font-size: 8.5pt; color: #64748b;">Platform: ${record.dim2Collaboration.platforms}</span>
          </td>
          <td style="text-align: center;">
            <strong>Skor ${record.dim2Collaboration.score} / 4</strong><br>
            <span style="font-size: 8.5pt;">(${record.dim2Collaboration.level})</span>
          </td>
          <td>
            <p style="margin: 0;"><strong>Analisis:</strong> ${record.dim2Collaboration.notes}</p>
            <p style="margin: 3px 0 0 0; color: #475569;"><strong>Bukti:</strong> ${record.dim2Collaboration.evidenceNotes || '-'}</p>
          </td>
        </tr>
        <tr>
          <td>
            <strong>3. Asesmen Formatif Adaptif & Umpan Balik Instan</strong><br>
            <span style="font-size: 8.5pt; color: #64748b;">Instrumen: ${record.dim3Assessment.assessmentTool}</span>
          </td>
          <td style="text-align: center;">
            <strong>Skor ${record.dim3Assessment.score} / 4</strong><br>
            <span style="font-size: 8.5pt;">(${record.dim3Assessment.level})</span>
          </td>
          <td>
            <p style="margin: 0;"><strong>Analisis:</strong> ${record.dim3Assessment.notes}</p>
            <p style="margin: 3px 0 0 0; color: #475569;"><strong>Bukti:</strong> ${record.dim3Assessment.evidenceNotes || '-'}</p>
          </td>
        </tr>
        <tr>
          <td>
            <strong>4. Kewarganegaraan Digital, Etika & Pemanfaatan AI</strong><br>
            <span style="font-size: 8.5pt; color: #64748b;">Integrasi AI: ${record.dim4EthicsAndAi.aiUsageNotes}</span>
          </td>
          <td style="text-align: center;">
            <strong>Skor ${record.dim4EthicsAndAi.score} / 4</strong><br>
            <span style="font-size: 8.5pt;">(${record.dim4EthicsAndAi.level})</span>
          </td>
          <td>
            <p style="margin: 0;"><strong>Analisis:</strong> ${record.dim4EthicsAndAi.notes}</p>
            <p style="margin: 3px 0 0 0; color: #475569;"><strong>Bukti:</strong> ${record.dim4EthicsAndAi.evidenceNotes || '-'}</p>
          </td>
        </tr>
      </table>

      <!-- 5 PILAR CHECKLIST -->
      <div class="section-header">II. KETERPENUHAN 5 PILAR DIGITAL DEEP LEARNING</div>
      <table class="data-table">
        <tr>
          <th width="80%">Indikator Pilar Digital</th>
          <th width="20%" style="text-align: center;">Status Keterpenuhan</th>
        </tr>
        <tr>
          <td>1. Murid Memproduksi Artefak Digital Orisinal (Bukan Sekadar Konsumen Pasif)</td>
          <td style="text-align: center;"><strong>${record.checklist.createsDigitalArtifacts ? 'TERPENUHI (YA)' : 'BELUM'}</strong></td>
        </tr>
        <tr>
          <td>2. Kolaborasi Cloud Bersama Secara Real-Time (Simultan Antar-Murid)</td>
          <td style="text-align: center;"><strong>${record.checklist.realtimeCollaboration ? 'TERPENUHI (YA)' : 'BELUM'}</strong></td>
        </tr>
        <tr>
          <td>3. Pemanfaatan Asesmen Formatif Adaptif dengan Analitik Belajar Cepat</td>
          <td style="text-align: center;"><strong>${record.checklist.adaptiveAssessmentFeedback ? 'TERPENUHI (YA)' : 'BELUM'}</strong></td>
        </tr>
        <tr>
          <td>4. Penerapan Etika Siber, Hak Cipta & Pemanfaatan AI secara Bertanggung Jawab</td>
          <td style="text-align: center;"><strong>${record.checklist.digitalEthicsAndAi ? 'TERPENUHI (YA)' : 'BELUM'}</strong></td>
        </tr>
        <tr>
          <td>5. Karya Digital Dipublikasikan ke Audiens Nyata (*Authentic Audience*)</td>
          <td style="text-align: center;"><strong>${record.checklist.authenticAudience ? 'TERPENUHI (YA)' : 'BELUM'}</strong></td>
        </tr>
      </table>

      <!-- REKOMENDASI & TINDAK LANJUT -->
      <div class="section-header">III. KEKUATAN UTAMA & REKOMENDASI TINDAK LANJUT PENGAWAS</div>
      <div class="card-box">
        <p><strong>Kekuatan Unggulan Pemanfaatan Digital:</strong></p>
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
  a.download = `Evaluasi_Pemanfaatan_Digital_PM_${cleanName}_${record.date}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
