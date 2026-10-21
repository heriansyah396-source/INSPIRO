/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Teacher,
  SupervisionRecord,
  TirtaCoachingRecord,
  TeacherQuadrantProfile,
  TeacherQuadrantType,
  QUADRANT_DEFINITIONS,
  AppSettings
} from '../types/inspiro';

const QUADRANT_OVERRIDES_KEY = 'inspiro_quadrant_overrides';

export interface QuadrantCustomOverride {
  teacherId: string;
  abstractionScore?: number;
  commitmentScore?: number;
  notes?: string;
  updatedAt: string;
}

/**
 * Safely get saved custom overrides
 */
export function getQuadrantOverrides(): Record<string, QuadrantCustomOverride> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(QUADRANT_OVERRIDES_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading quadrant overrides:', e);
    return {};
  }
}

/**
 * Save custom overrides
 */
export function saveQuadrantOverride(override: QuadrantCustomOverride): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getQuadrantOverrides();
    current[override.teacherId] = {
      ...override,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(QUADRANT_OVERRIDES_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Error saving quadrant override:', e);
  }
}

/**
 * Determine Quadrant by Thresholds (Midpoint = 75)
 */
export function determineQuadrant(abstraction: number, commitment: number): TeacherQuadrantType {
  const threshold = 75;
  if (abstraction >= threshold && commitment >= threshold) {
    return 'kuadran_1';
  } else if (abstraction >= threshold && commitment < threshold) {
    return 'kuadran_2';
  } else if (abstraction < threshold && commitment >= threshold) {
    return 'kuadran_3';
  } else {
    return 'kuadran_4';
  }
}

/**
 * Build all teacher quadrant profiles
 */
export function computeTeacherQuadrants(
  teachers: Teacher[],
  supervisions: SupervisionRecord[],
  coachingRecords: TirtaCoachingRecord[] = []
): TeacherQuadrantProfile[] {
  const overrides = getQuadrantOverrides();

  // Baseline pseudo-scores for seed teachers if not enough supervisions yet
  const DEFAULT_SEED_DATA: Record<string, { abs: number; com: number; note: string }> = {
    G001: { abs: 88, com: 72, note: 'Sangat menguasai konsep matematika & IT, butuh penguatan komitmen waktu tindak lanjut.' },
    G002: { abs: 94, com: 96, note: 'Guru Penggerak teladan, diferensiasi matang, refleksi mandiri sangat konsisten.' },
    G003: { abs: 71, com: 89, note: 'Sangat berdedikasi dan antusias, butuh bimbingan teknis diferensiasi LKPD sains.' },
    G004: { abs: 72, com: 68, note: 'Guru muda, membutuhkan pendampingan terstruktur dan dorongan motivasi klinis.' },
    G005: { abs: 82, com: 69, note: 'Analitis dan kaya referensi IPS, perlu kontrak komitmen pemanfaatan media.' }
  };

  return teachers.map((teacher, index) => {
    const teacherSups = supervisions.filter(
      (s) => s.teacherId === teacher.id && s.status === 'selesai'
    );
    const teacherCoaching = coachingRecords.filter((c) => c.teacherId === teacher.id);
    const custom = overrides[teacher.id];

    // 1. Calculate Abstraction Score (0 - 100)
    let calculatedAbstraction = 74;
    if (teacherSups.length > 0) {
      const avgFinal = teacherSups.reduce((acc, s) => acc + s.finalScore, 0) / teacherSups.length;
      calculatedAbstraction = Number(avgFinal.toFixed(1));
    } else if (DEFAULT_SEED_DATA[teacher.id]) {
      calculatedAbstraction = DEFAULT_SEED_DATA[teacher.id].abs;
    } else {
      // Deterministic spread based on index
      calculatedAbstraction = 70 + ((index * 7) % 25);
    }

    // 2. Calculate Commitment Score (0 - 100)
    let calculatedCommitment = 74;
    if (teacherCoaching.length > 0) {
      const achievedCount = teacherCoaching.filter((c) => c.tanggungJawab.statusKomitmen === 'tercapai').length;
      const inProgressCount = teacherCoaching.filter((c) => c.tanggungJawab.statusKomitmen === 'dalam_proses').length;
      calculatedCommitment = Math.min(
        98,
        Math.round(70 + (achievedCount * 12) + (inProgressCount * 6))
      );
    } else if (teacherSups.length > 0) {
      // Teachers with follow-up items
      const rtlItems = teacherSups.reduce((acc, s) => acc + (s.rtl?.length || 0), 0);
      calculatedCommitment = Math.min(95, 75 + rtlItems * 5);
    } else if (DEFAULT_SEED_DATA[teacher.id]) {
      calculatedCommitment = DEFAULT_SEED_DATA[teacher.id].com;
    } else {
      calculatedCommitment = 68 + ((index * 9) % 28);
    }

    // Apply manual overrides if present
    const finalAbstraction = custom?.abstractionScore !== undefined ? custom.abstractionScore : calculatedAbstraction;
    const finalCommitment = custom?.commitmentScore !== undefined ? custom.commitmentScore : calculatedCommitment;

    const quadrant = determineQuadrant(finalAbstraction, finalCommitment);
    const def = QUADRANT_DEFINITIONS[quadrant];

    return {
      teacherId: teacher.id,
      teacherName: teacher.nama,
      teacherNip: teacher.nip,
      schoolName: teacher.satuanPendidikan || 'Satuan Pendidikan',
      mapel: teacher.mapel,
      abstractionScore: finalAbstraction,
      commitmentScore: finalCommitment,
      quadrant,
      supervisoryApproach: def.supervisoryApproach,
      characteristics: def.characteristics,
      recommendedActions: def.keyInterventions,
      notes: custom?.notes || DEFAULT_SEED_DATA[teacher.id]?.note || '',
      customOverrides: custom
        ? {
            abstraction: custom.abstractionScore,
            commitment: custom.commitmentScore,
            notes: custom.notes
          }
        : undefined,
      lastUpdated: custom?.updatedAt || new Date().toISOString()
    };
  });
}

/**
 * Export 4 Quadrant Matrix Report to Microsoft Word (.doc)
 */
export function exportQuadrantReportToWord(
  profiles: TeacherQuadrantProfile[],
  settings: AppSettings,
  activeSchoolFilter: string
): void {
  const supervisorName = settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd';
  const supervisorNip = settings.supervisorNip || '19820415 200801 1 007';
  const supervisorRole = settings.supervisorRole || 'Pengawas Sekolah Pembina';
  const approverName = settings.pengawasPembinaName || 'Dr. Hj. Endang Sulastri, M.Pd.';
  const approverNip = settings.pengawasPembinaNip || '19650410 199103 2 001';
  const approverRole = settings.pengawasPembinaRole || 'Koordinator Pengawas / Kepala Dinas Pendidikan';

  // Group by quadrant
  const q1 = profiles.filter((p) => p.quadrant === 'kuadran_1');
  const q2 = profiles.filter((p) => p.quadrant === 'kuadran_2');
  const q3 = profiles.filter((p) => p.quadrant === 'kuadran_3');
  const q4 = profiles.filter((p) => p.quadrant === 'kuadran_4');

  const rows = profiles
    .map((p, idx) => {
      const def = QUADRANT_DEFINITIONS[p.quadrant];
      return `
      <tr>
        <td style="text-align:center;padding:6px;border:1px solid #000;">${idx + 1}</td>
        <td style="padding:6px;border:1px solid #000;">
          <strong>${p.teacherName}</strong><br/>
          <span style="font-size:8.5pt;color:#555;">NIP. ${p.teacherNip}</span>
        </td>
        <td style="padding:6px;border:1px solid #000;">${p.mapel}</td>
        <td style="padding:6px;border:1px solid #000;">${p.schoolName}</td>
        <td style="text-align:center;padding:6px;border:1px solid #000;font-weight:bold;">
          ${p.abstractionScore}
        </td>
        <td style="text-align:center;padding:6px;border:1px solid #000;font-weight:bold;">
          ${p.commitmentScore}
        </td>
        <td style="padding:6px;border:1px solid #000;font-weight:bold;">
          ${def.title}
        </td>
        <td style="padding:6px;border:1px solid #000;font-size:9pt;">
          <strong>${def.approachShort}</strong>: ${def.keyInterventions[0]}
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
    <title>Peta 4 Kuadran Guru & Diferensiasi Supervisi</title>
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
        margin: 1.5cm;
        mso-page-orientation: landscape;
      }
      body {
        font-family: 'Times New Roman', Times, serif;
        font-size: 10.5pt;
        line-height: 1.35;
        color: #000;
      }
      .kop {
        text-align: center;
        border-bottom: 3px double #000;
        padding-bottom: 8px;
        margin-bottom: 14px;
      }
      .kop h3 { margin: 0; font-size: 13pt; text-transform: uppercase; font-weight: bold; }
      .kop h2 { margin: 2px 0; font-size: 14.5pt; text-transform: uppercase; font-weight: bold; }
      .kop p { margin: 2px 0; font-size: 9pt; }
      .title-box { text-align: center; margin-bottom: 14px; }
      .title-box h3 { margin: 0; font-size: 12.5pt; text-decoration: underline; text-transform: uppercase; font-weight: bold; }
      .title-box p { margin: 3px 0 0 0; font-size: 10pt; font-style: italic; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 9.5pt; }
      th { background-color: #f1f5f9; padding: 6px; border: 1px solid #000; font-weight: bold; text-align: center; }
      .sig-table { width: 100%; border-collapse: collapse; margin-top: 28px; border: none; }
      .sig-table td { border: none; padding: 4px; vertical-align: top; }
      .summary-box {
        display: flex;
        gap: 10px;
        margin-bottom: 12px;
      }
    </style>
  </head>
  <body>
    <div class="kop">
      <h3>PEMERINTAH DAERAH PROVINSI / KABUPATEN / KOTA</h3>
      <h2>DINAS PENDIDIKAN DAN KEBUDAYAAN</h2>
      <p style="font-weight:bold;">KANTOR PENGAWAS SEKOLAH PEMBINA SATUAN PENDIDIKAN</p>
      <p style="font-size: 8.5pt; color: #444;">${settings.schoolAddress || 'Kompleks Perkantoran Pendidikan Terpadu'} | Telepon / Pos-el Resmi Kedinasan</p>
    </div>

    <div class="title-box">
      <h3>PETA MATRIKS 4 KUADRAN GURU &amp; STRATEGI DIFERENSIASI SUPERVISI</h3>
      <p>Model Supervisi Perkembangan Glickman · Wilayah Binaan: ${activeSchoolFilter === 'all' ? 'Seluruh Sekolah Binaan' : activeSchoolFilter} · Tahun Ajaran 2026/2027</p>
    </div>

    <table style="width: 100%; margin-bottom: 12px; font-size: 10pt; border: none;">
      <tr>
        <td style="width: 18%; border: none;"><strong>Nama Pengawas</strong></td>
        <td style="width: 2%; border: none;">:</td>
        <td style="width: 40%; border: none;">${supervisorName}</td>
        <td style="width: 18%; border: none;"><strong>Total Guru Binaan</strong></td>
        <td style="width: 2%; border: none;">:</td>
        <td style="width: 20%; border: none;">${profiles.length} Guru</td>
      </tr>
      <tr>
        <td style="border: none;"><strong>NIP Pengawas</strong></td>
        <td style="border: none;">:</td>
        <td style="border: none;">${supervisorNip}</td>
        <td style="border: none;"><strong>Distribusi Kuadran</strong></td>
        <td style="border: none;">:</td>
        <td style="border: none;">Q1: ${q1.length} | Q2: ${q2.length} | Q3: ${q3.length} | Q4: ${q4.length}</td>
      </tr>
    </table>

    <table>
      <thead>
        <tr>
          <th style="width: 4%;">No</th>
          <th style="width: 18%;">Nama Guru &amp; NIP</th>
          <th style="width: 12%;">Mata Pelajaran</th>
          <th style="width: 16%;">Satuan Pendidikan</th>
          <th style="width: 7%;">Skor Abstraksi</th>
          <th style="width: 7%;">Skor Komitmen</th>
          <th style="width: 16%;">Posisi Kuadran</th>
          <th style="width: 20%;">Pendekatan &amp; Rencana Aksi Supervisi</th>
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
  const fileName = `Peta_4_Kuadran_Guru_${supervisorName.replace(/[,. ]+/g, '_')}_${new Date().toISOString().slice(0, 10)}.doc`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
