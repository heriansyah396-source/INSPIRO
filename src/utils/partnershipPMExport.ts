/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PMLearningPartnershipRecord, AppSettings } from '../types/inspiro';

export function exportPartnershipPMToWord(record: PMLearningPartnershipRecord, settings: AppSettings): void {
  const govAgency = settings.governmentAgency || 'PEMERINTAH KABUPATEN SIDENRENG RAPPANG';
  const schoolCity = settings.schoolCity || 'Kabupaten Sidenreng Rappang';
  const documentDate = settings.documentDate || new Date(record.date || Date.now()).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const getMaturityColor = (level: string) => {
    if (level.includes('Membudaya')) return '#047857';
    if (level.includes('Matang')) return '#1d4ed8';
    if (level.includes('Berkembang')) return '#b45309';
    return '#b91c1c';
  };

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Instrumen Evaluasi Kemitraan Pembelajaran PM - ${record.teacherName}</title>
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
          color: #0284c7;
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
        table.meta-table td.label {
          width: 25%;
          font-weight: bold;
          color: #334155;
        }
        table.meta-table td.colon {
          width: 2%;
        }
        table.meta-table td.val {
          width: 73%;
        }
        table.data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
          margin-bottom: 16px;
          font-size: 9.5pt;
        }
        table.data-table th, table.data-table td {
          border: 1px solid #475569;
          padding: 6px 8px;
          vertical-align: top;
        }
        table.data-table th {
          background-color: #f1f5f9;
          font-weight: bold;
          text-align: center;
        }
        .section-header {
          font-size: 11pt;
          font-weight: bold;
          color: #0f172a;
          border-bottom: 1.5px solid #0284c7;
          padding-bottom: 3px;
          margin-top: 16px;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .card-box {
          border: 1px solid #cbd5e1;
          background-color: #f8fafc;
          padding: 10px;
          margin-bottom: 12px;
        }
        .badge {
          display: inline-block;
          padding: 2px 8px;
          font-size: 9pt;
          font-weight: bold;
          border-radius: 3px;
          color: #ffffff;
        }
        .signature-table {
          width: 100%;
          margin-top: 35px;
          border-collapse: collapse;
          page-break-inside: avoid;
        }
        .signature-table td {
          width: 50%;
          text-align: center;
          vertical-align: top;
          padding: 0 15px;
        }
      </style>
    </head>
    <body>
      <!-- KOP RESMI DINAS KABUPATEN SIDENRENG RAPPANG -->
      <div class="header-kop">
        <div class="instansi">${govAgency}</div>
        <div class="dinas">DINAS PENDIDIKAN DAN KEBUDAYAAN</div>
        <div class="kantor">KANTOR PENGAWAS SEKOLAH PEMBINA SATUAN PENDIDIKAN</div>
        <div class="alamat">${settings.schoolAddress || 'Komp. SKPD Blok B Terpadu, Jl. Harapan Baru, Pangkajene, Kab. Sidenreng Rappang, Sulawesi Selatan 91611'}</div>
      </div>

      <div class="doc-title">INSTRUMEN EVALUASI KEMITRAAN PEMBELAJARAN (PM)</div>
      <div class="doc-subtitle">4 Dimensi Aliansi Belajar: Murid-Guru, Antarmurid, Orang Tua, & Komunitas Dunia Nyata</div>

      <!-- IDENTITAS OBSERVASI KEMITRAAN -->
      <table class="meta-table">
        <tr>
          <td class="label">Satuan Pendidikan</td>
          <td class="colon">:</td>
          <td class="val"><strong>${record.schoolName}</strong></td>
        </tr>
        <tr>
          <td class="label">Nama Guru Terobservasi</td>
          <td class="colon">:</td>
          <td class="val">${record.teacherName} (NIP. ${record.teacherNip || '-'})</td>
        </tr>
        <tr>
          <td class="label">Mata Pelajaran / Kelas</td>
          <td class="colon">:</td>
          <td class="val">${record.subject} / ${record.gradeClass}</td>
        </tr>
        <tr>
          <td class="label">Topik Pembelajaran</td>
          <td class="colon">:</td>
          <td class="val"><em>${record.topic || 'Investigasi Kolaboratif & Solusi Nyata'}</em></td>
        </tr>
        <tr>
          <td class="label">Mitra Utama Terlibat</td>
          <td class="colon">:</td>
          <td class="val"><strong>${record.partnerName}</strong> (${record.primaryPartnerType})</td>
        </tr>
        <tr>
          <td class="label">Peran Mitra Lapangan</td>
          <td class="colon">:</td>
          <td class="val">${record.partnerRoleInLearning || '-'}</td>
        </tr>
        <tr>
          <td class="label">Tanggal Observasi</td>
          <td class="colon">:</td>
          <td class="val">${new Date(record.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
        </tr>
        <tr>
          <td class="label">Petugas Penilai / Jabatan</td>
          <td class="colon">:</td>
          <td class="val">${record.assessorName} (${record.assessorRole})</td>
        </tr>
      </table>

      <!-- IKHTISAR SKOR DAN KEMATANGAN KEMITRAAN -->
      <div class="card-box">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 33%; text-align: center; border-right: 1px solid #cbd5e1;">
              <div style="font-size: 9pt; color: #64748b; font-weight: bold;">TOTAL SKOR KEMITRAAN</div>
              <div style="font-size: 24pt; font-weight: bold; color: #0284c7; margin-top: 4px;">${record.totalScore.toFixed(1)} <span style="font-size: 11pt; color: #64748b;">/ 100</span></div>
            </td>
            <td style="width: 33%; text-align: center; border-right: 1px solid #cbd5e1;">
              <div style="font-size: 9pt; color: #64748b; font-weight: bold;">TINGKAT KEMATANGAN KEMITRAAN</div>
              <div style="margin-top: 8px;">
                <span class="badge" style="background-color: ${getMaturityColor(record.maturityLevel)};">
                  ${record.maturityLevel}
                </span>
              </div>
            </td>
            <td style="width: 34%; text-align: center;">
              <div style="font-size: 9pt; color: #64748b; font-weight: bold;">DERAJAT SUARA & AGENSI MURID</div>
              <div style="font-size: 16pt; font-weight: bold; color: #0f172a; margin-top: 6px;">
                ${record.studentVoiceLevel}
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- TABEL 4 DIMENSI KEMITRAAN PEMBELAJARAN -->
      <div class="section-header">I. Penilaian 4 Dimensi Kemitraan Pembelajaran (*Learning Partnerships*)</div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 5%;">No</th>
            <th style="width: 25%;">Dimensi Kemitraan</th>
            <th style="width: 15%;">Tingkat Capaian</th>
            <th style="width: 10%;">Skor / Bobot</th>
            <th style="width: 45%;">Praktik Teramati & Catatan Bukti Perilaku</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center;">1</td>
            <td>
              <strong>Kemitraan Murid & Guru</strong><br/>
              <span style="font-size: 8.5pt; color: #475569;">Co-Designing alur belajar, perumusan rubrik sukses bersama, dan refleksi egaliter</span>
            </td>
            <td style="text-align: center;"><strong>${record.dim1StudentTeacher.level}</strong></td>
            <td style="text-align: center;"><strong>${(record.dim1StudentTeacher.score * 6.25).toFixed(1)}</strong> / 25</td>
            <td>
              <div><strong>Bentuk Co-Design:</strong> ${record.dim1StudentTeacher.coDesignPractices || '-'}</div>
              <div style="margin-top: 4px;"><strong>Catatan Supervisor:</strong> ${record.dim1StudentTeacher.notes}</div>
              <div style="margin-top: 3px; font-style: italic; color: #334155;"><strong>Bukti:</strong> ${record.dim1StudentTeacher.evidenceNotes}</div>
            </td>
          </tr>
          <tr>
            <td style="text-align: center;">2</td>
            <td>
              <strong>Kemitraan Antarmurid</strong><br/>
              <span style="font-size: 8.5pt; color: #475569;">Aliansi kolaboratif, bimbingan rakan sebaya, dan protokol peer-feedback</span>
            </td>
            <td style="text-align: center;"><strong>${record.dim2PeerToPeer.level}</strong></td>
            <td style="text-align: center;"><strong>${(record.dim2PeerToPeer.score * 6.25).toFixed(1)}</strong> / 25</td>
            <td>
              <div><strong>Bentuk Interaksi Sebaya:</strong> ${record.dim2PeerToPeer.peerInteractionType || '-'}</div>
              <div style="margin-top: 4px;"><strong>Catatan Supervisor:</strong> ${record.dim2PeerToPeer.notes}</div>
              <div style="margin-top: 3px; font-style: italic; color: #334155;"><strong>Bukti:</strong> ${record.dim2PeerToPeer.evidenceNotes}</div>
            </td>
          </tr>
          <tr>
            <td style="text-align: center;">3</td>
            <td>
              <strong>Kemitraan Keluarga / Orang Tua</strong><br/>
              <span style="font-size: 8.5pt; color: #475569;">Dialog dua arah, penugasan eksplorasi rumah, dan Student-Led Conference</span>
            </td>
            <td style="text-align: center;"><strong>${record.dim3FamilyPartnership.level}</strong></td>
            <td style="text-align: center;"><strong>${(record.dim3FamilyPartnership.score * 6.25).toFixed(1)}</strong> / 25</td>
            <td>
              <div><strong>Aktivitas Pelibatan Orang Tua:</strong> ${record.dim3FamilyPartnership.familyEngagementActivity || '-'}</div>
              <div style="margin-top: 4px;"><strong>Catatan Supervisor:</strong> ${record.dim3FamilyPartnership.notes}</div>
              <div style="margin-top: 3px; font-style: italic; color: #334155;"><strong>Bukti:</strong> ${record.dim3FamilyPartnership.evidenceNotes}</div>
            </td>
          </tr>
          <tr>
            <td style="text-align: center;">4</td>
            <td>
              <strong>Kemitraan Komunitas & Dunia Nyata</strong><br/>
              <span style="font-size: 8.5pt; color: #475569;">Place-Based Learning, mentor praktisi eksternal, dan audiens autentik</span>
            </td>
            <td style="text-align: center;"><strong>${record.dim4CommunityRealWorld.level}</strong></td>
            <td style="text-align: center;"><strong>${(record.dim4CommunityRealWorld.score * 6.25).toFixed(1)}</strong> / 25</td>
            <td>
              <div><strong>Dampak Dunia Nyata:</strong> ${record.dim4CommunityRealWorld.realWorldImpact || '-'}</div>
              <div style="margin-top: 4px;"><strong>Catatan Supervisor:</strong> ${record.dim4CommunityRealWorld.notes}</div>
              <div style="margin-top: 3px; font-style: italic; color: #334155;"><strong>Bukti:</strong> ${record.dim4CommunityRealWorld.evidenceNotes}</div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- CHECKLIST KRITERIA KEMITRAAN MENDALAM -->
      <div class="section-header">II. Checklist Pilar Kemitraan Pembelajaran Otentik</div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 5%;">No</th>
            <th style="width: 75%;">Indikator Kemitraan Esensial</th>
            <th style="width: 20%;">Keterlaksanaan</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center;">1</td>
            <td>Murid aktif terlibat merancang alur investigasi atau menyepakati rubrik kriteria sukses (Co-Design & Agency)</td>
            <td style="text-align: center; font-weight: bold; color: ${record.checklist.studentCoDesign ? '#047857' : '#b91c1c'};">
              ${record.checklist.studentCoDesign ? 'YA (Terlaksana)' : 'TIDAK'}
            </td>
          </tr>
          <tr>
            <td style="text-align: center;">2</td>
            <td>Terjadi umpan balik antarteman terstruktur (Peer Feedback) berpandukan rubrik atau protokol yang jelas</td>
            <td style="text-align: center; font-weight: bold; color: ${record.checklist.structuredPeerFeedback ? '#047857' : '#b91c1c'};">
              ${record.checklist.structuredPeerFeedback ? 'YA (Terlaksana)' : 'TIDAK'}
            </td>
          </tr>
          <tr>
            <td style="text-align: center;">3</td>
            <td>Komunikasi dan dialog dua arah dengan orang tua tentang progres dan potensi anak (bukan sekadar rapor)</td>
            <td style="text-align: center; font-weight: bold; color: ${record.checklist.familyTwoWayCommunication ? '#047857' : '#b91c1c'};">
              ${record.checklist.familyTwoWayCommunication ? 'YA (Terlaksana)' : 'TIDAK'}
            </td>
          </tr>
          <tr>
            <td style="text-align: center;">4</td>
            <td>Keterlibatan praktisi/ahli/tokoh luar masyarakat sebagai narasumber atau mentor proyek investigasi</td>
            <td style="text-align: center; font-weight: bold; color: ${record.checklist.authenticExpertInvolvement ? '#047857' : '#b91c1c'};">
              ${record.checklist.authenticExpertInvolvement ? 'YA (Terlaksana)' : 'TIDAK'}
            </td>
          </tr>
          <tr>
            <td style="text-align: center;">5</td>
            <td>Karya/solusi murid dipamerkan dan diuji langsung oleh audiens nyata/penerima manfaat di masyarakat</td>
            <td style="text-align: center; font-weight: bold; color: ${record.checklist.authenticAudienceExhibition ? '#047857' : '#b91c1c'};">
              ${record.checklist.authenticAudienceExhibition ? 'YA (Terlaksana)' : 'TIDAK'}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- KEKUATAN & REKOMENDASI SUPERVISOR -->
      <div class="section-header">III. Analisis Kekuatan & Rekomendasi Supervisi</div>
      <table class="data-table">
        <tr>
          <td style="width: 50%; background-color: #f0fdf4;">
            <strong style="color: #166534;">KEKUATAN UTAMA KEMITRAAN TERAMATI:</strong>
            <ul style="margin: 6px 0; padding-left: 18px;">
              ${record.keyStrengths.map((s) => `<li>${s}</li>`).join('')}
            </ul>
          </td>
          <td style="width: 50%; background-color: #fefce8;">
            <strong style="color: #854d0e;">AREA PENGEMBANGAN LANJUTAN:</strong>
            <ul style="margin: 6px 0; padding-left: 18px;">
              ${record.keyGrowthAreas.map((g) => `<li>${g}</li>`).join('')}
            </ul>
          </td>
        </tr>
      </table>

      <div style="margin-top: 10px; padding: 10px; border: 1px solid #0284c7; background-color: #f0f9ff;">
        <strong style="color: #0369a1;">REKOMENDASI PENGUATAN SUPERVISI PENGAWAS PEMBINA:</strong>
        <ol style="margin: 6px 0; padding-left: 20px;">
          ${record.supervisoryRecommendations.map((r) => `<li>${r}</li>`).join('')}
        </ol>
      </div>

      <!-- LEMBAR TANDA TANGAN KEDINASAN -->
      <table class="signature-table">
        <tr>
          <td>
            Mengetahui,<br/>
            Kepala Satuan Pendidikan<br/><br/><br/><br/>
            <strong>${record.headmasterName || 'Dra. Hj. Nurhasanah, M.Pd.'}</strong><br/>
            NIP. ${record.headmasterNip || '19720815 199802 2 003'}
          </td>
          <td>
            ${schoolCity}, ${documentDate}<br/>
            Pengawas Sekolah Pembina,<br/><br/><br/><br/>
            <strong>${record.assessorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'}</strong><br/>
            NIP. ${record.assessorNip || '19820415 200801 1 007'}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Evaluasi_Kemitraan_PM_${record.teacherName.replace(/[^a-zA-Z0-9]/g, '_')}_${record.date}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
