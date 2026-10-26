/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Printer,
  ArrowLeft,
  Download,
  School,
  FileText,
  CheckCircle2,
  HelpCircle,
  FileDown
} from 'lucide-react';
import {
  AppSettings,
  OBSERVATION_INDICATORS,
  POST_OBSERVATION_QUESTIONS,
  PRE_OBSERVATION_QUESTIONS,
  SupervisionRecord
} from '../types/inspiro';
import { TeacherRadarChart } from './TeacherRadarChart';
import {
  exportSupervisionToWord,
  printDocumentElement
} from '../utils/documentExport';
import { SignatoryModal } from './SignatoryModal';
import { saveSettings } from '../utils/storage';
import { FileSignature } from 'lucide-react';
import { DEFAULT_SIDRAP_LOGO, DEFAULT_TUTWURI_LOGO } from '../data/defaultLogos';

interface OfficialReportPrintProps {
  supervision: SupervisionRecord;
  settings: AppSettings;
  onBack: () => void;
  onUpdateSettings?: (newSettings: AppSettings) => void;
}

export const OfficialReportPrint: React.FC<OfficialReportPrintProps> = ({
  supervision,
  settings,
  onBack,
  onUpdateSettings
}) => {
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [isSignatoryModalOpen, setIsSignatoryModalOpen] = useState(false);

  // Normalize settings to ensure HERIANSYAH, S.Si., S.Pd., M.Pd without typo period
  const [localSettings, setLocalSettings] = useState<AppSettings>(() => {
    const isNeedsCorrection =
      !settings.supervisorName ||
      settings.supervisorName.includes('Heriansyah.') ||
      settings.supervisorName.toLowerCase().includes('rustina') ||
      settings.supervisorName === 'Heriansyah, S.Si., S.Pd., M.Pd';

    if (isNeedsCorrection) {
      return {
        ...settings,
        supervisorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd'
      };
    }
    return settings;
  });

  useEffect(() => {
    const isNeedsCorrection =
      !settings.supervisorName ||
      settings.supervisorName.includes('Heriansyah.') ||
      settings.supervisorName.toLowerCase().includes('rustina') ||
      settings.supervisorName === 'Heriansyah, S.Si., S.Pd., M.Pd';

    if (isNeedsCorrection) {
      setLocalSettings({
        ...settings,
        supervisorName: 'HERIANSYAH, S.Si., S.Pd., M.Pd'
      });
    } else {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSaveSignatories = (updatedSettings: AppSettings) => {
    setLocalSettings(updatedSettings);
    if (onUpdateSettings) {
      onUpdateSettings(updatedSettings);
    } else {
      saveSettings(updatedSettings);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setExportNotice('Membuka dialog cetak / Simpan PDF...');
    const success = printDocumentElement(
      'official-supervision-print-page',
      `INSTRUMEN_SUPERVISI_${supervision.identity.namaGuru || 'GURU'}`
    );
    setTimeout(() => {
      setIsPrinting(false);
      setExportNotice(null);
    }, 2500);
  };

  const handleExportWord = () => {
    setIsExportingWord(true);
    setExportNotice('Menyiapkan dan mengunduh berkas Microsoft Word (.doc)...');
    try {
      exportSupervisionToWord(supervision, settings);
      setTimeout(() => {
        setIsExportingWord(false);
        setExportNotice('Berkas Word berhasil diunduh!');
        setTimeout(() => setExportNotice(null), 3000);
      }, 500);
    } catch (err) {
      console.error('Gagal mengekspor berkas Word:', err);
      setIsExportingWord(false);
      setExportNotice('Gagal mengekspor dokumen Word.');
      setTimeout(() => setExportNotice(null), 3000);
    }
  };

  const { identity, praObservasi, scores, notes, totalScore, finalScore, category, refleksi, rtl } =
    supervision;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Action Header (Hidden in Print) */}
      <div className="no-print space-y-2">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Aplikasi</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {/* Menu Input Yang Bertanda Tangan */}
            <button
              onClick={() => setIsSignatoryModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              title="Menu input pejabat yang bertanda tangan (Pengawas, Koordinator/Kepala Sekolah, Titimangsa)"
            >
              <FileSignature className="w-4 h-4 text-blue-600" />
              <span>Atur Penandatangan</span>
            </button>

            {/* Tombol Cetak Dokumen / Simpan PDF */}
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60"
              title="Cetak langsung ke printer atau Simpan sebagai PDF"
            >
              <Printer className="w-4 h-4" />
              <span>{isPrinting ? 'Menyiapkan Cetak...' : 'Cetak Dokumen / Simpan PDF'}</span>
            </button>

            {/* Tombol Cetak / Unduh Dokumen Word */}
            <button
              onClick={handleExportWord}
              disabled={isExportingWord}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60"
              title="Unduh format dokumen Microsoft Word (.doc) yang dapat diedit langsung"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExportingWord ? 'Mengunduh...' : 'Cetak / Unduh Word (.doc)'}</span>
            </button>
          </div>
        </div>

        {/* Notice & Printing Guidance Banner */}
        <div className="bg-blue-50/80 border border-blue-200/90 rounded-lg px-3.5 py-2 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-blue-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Petunjuk:</strong> Pilih opsi <em>"Simpan sebagai PDF"</em> di jendela peramban untuk menyimpan dokumen PDF, atau klik <strong>"Cetak / Unduh Word"</strong> untuk dokumen Word yang siap diedit di MS Word / WPS Office.
            </span>
          </div>
          {exportNotice && (
            <span className="font-semibold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded text-[11px] self-start sm:self-auto shrink-0">
              {exportNotice}
            </span>
          )}
        </div>
      </div>

      {/* Official Printable Paper Document Container */}
      <div
        id="official-supervision-print-page"
        className="print-page bg-white p-8 sm:p-12 border border-slate-300 rounded-lg shadow-sm text-slate-900 text-xs font-serif leading-relaxed"
      >
        {/* Kop Surat Resmi dengan Logo Kabupaten & Tut Wuri */}
        <div className="border-b-4 border-double border-slate-900 pb-3 mb-6">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="w-20 align-middle text-left p-0">
                  <img
                    src={settings.logoUrl || DEFAULT_SIDRAP_LOGO}
                    alt="Logo Daerah / Kabupaten"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto"
                  />
                </td>
                <td className="align-middle text-center px-3">
                  <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider font-sans text-slate-800 leading-tight">
                    PEMERINTAH KABUPATEN {settings.schoolCity ? settings.schoolCity.toUpperCase() : 'SIDENRENG RAPPANG'}
                  </div>
                  <div className="text-[12px] sm:text-sm font-black uppercase tracking-wider font-sans text-slate-900 leading-tight mt-0.5">
                    DINAS PENDIDIKAN DAN KEBUDAYAAN
                  </div>
                  <h1 className="text-sm sm:text-base font-extrabold font-sans tracking-wide uppercase mt-1 text-slate-950 leading-tight">
                    {settings.schoolName.toUpperCase()}
                  </h1>
                  <p className="text-[10px] text-slate-600 font-sans mt-0.5 leading-snug">
                    {settings.schoolAddress} · NPSN: {settings.schoolNpsn}
                  </p>
                </td>
                <td className="w-20 align-middle text-right p-0">
                  <img
                    src={settings.logoRightUrl || DEFAULT_TUTWURI_LOGO}
                    alt="Logo Tut Wuri Handayani"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Judul Dokumen */}
        <div className="text-center mb-6">
          <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider font-sans underline">
            INSTRUMEN LENGKAP SUPERVISI AKADEMIK PEMBELAJARAN
          </h2>
          <div className="text-xs font-sans font-semibold text-slate-700 uppercase mt-0.5">
            IMPLEMENTASI KURIKULUM MERDEKA — {identity.siklus?.toUpperCase() || 'SIKLUS I'}
          </div>
          <div className="text-[11px] font-sans text-slate-500 mt-0.5">
            Nomor Berkas: {supervision.id}
          </div>
        </div>

        {/* BAGIAN I: IDENTITAS */}
        <div className="mb-6">
          <div className="bg-slate-100 px-3 py-1 font-sans font-bold text-xs uppercase tracking-wider border-l-4 border-slate-800 mb-2">
            I. IDENTITAS PELAKSANAAN SUPERVISI
          </div>
          <table className="w-full text-xs font-sans border-collapse">
            <tbody>
              <tr>
                <td className="w-40 py-1 font-semibold text-slate-700">1. Nama Guru</td>
                <td className="w-4 py-1">:</td>
                <td className="py-1 font-bold text-slate-950">{identity.namaGuru}</td>
                <td className="w-36 py-1 font-semibold text-slate-700">7. Hari, Tanggal</td>
                <td className="w-4 py-1">:</td>
                <td className="py-1">{identity.hariTanggal}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-slate-700">2. NIP / NIK Guru</td>
                <td className="py-1">:</td>
                <td className="py-1 font-mono">{identity.nipGuru || '-'}</td>
                <td className="py-1 font-semibold text-slate-700">8. Jam Pelajaran</td>
                <td className="py-1">:</td>
                <td className="py-1">{identity.jamPelajaran || '-'}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-slate-700">3. Mata Pelajaran</td>
                <td className="py-1">:</td>
                <td className="py-1 font-semibold">{identity.mapel}</td>
                <td className="py-1 font-semibold text-slate-700">9. Siklus Ke-</td>
                <td className="py-1">:</td>
                <td className="py-1 font-semibold text-slate-900">{identity.siklus || 'Siklus 1'}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-slate-700">4. Kelas / Semester</td>
                <td className="py-1">:</td>
                <td className="py-1">{identity.kelasSemester}</td>
                <td className="py-1 font-semibold text-slate-700">10. Nama Supervisor</td>
                <td className="py-1">:</td>
                <td className="py-1 font-semibold">{identity.namaSupervisor}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-slate-700">5. Materi Pokok</td>
                <td className="py-1">:</td>
                <td className="py-1 font-medium">{identity.materiPokok || '-'}</td>
                <td className="py-1 font-semibold text-slate-700">11. Jabatan Supervisor</td>
                <td className="py-1">:</td>
                <td className="py-1">{identity.jabatanSupervisor}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-slate-700">6. Fokus Perilaku Target</td>
                <td className="py-1">:</td>
                <td colSpan={4} className="py-1 italic text-slate-800">
                  {identity.fokusPerilaku}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* BAGIAN II: PRA-OBSERVASI */}
        <div className="mb-6 print-avoid-break">
          <div className="bg-slate-100 px-3 py-1 font-sans font-bold text-xs uppercase tracking-wider border-l-4 border-slate-800 mb-2">
            II. LEMBAR WAWANCARA & TELAAH DOKUMEN PRA-OBSERVASI
          </div>
          <table className="w-full text-xs font-sans border border-slate-300">
            <thead className="bg-slate-50 border-b border-slate-300 text-slate-700">
              <tr>
                <th className="p-2 border-r border-slate-300 w-10 text-center">No</th>
                <th className="p-2 border-r border-slate-300 w-1/3 text-left">Pertanyaan Wawancara Pra-Observasi</th>
                <th className="p-2 text-left">Catatan Respons Guru & Hasil Telaah Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {PRE_OBSERVATION_QUESTIONS.map((q) => (
                <tr key={q.key}>
                  <td className="p-2 border-r border-slate-300 text-center font-bold text-slate-500">
                    {q.number}
                  </td>
                  <td className="p-2 border-r border-slate-300 font-medium text-slate-800">
                    <div>{q.question}</div>
                    <div className="text-[10px] text-slate-500 italic mt-0.5">{q.label}</div>
                  </td>
                  <td className="p-2 text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {praObservasi[q.key as keyof typeof praObservasi] || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BAGIAN III: HASIL OBSERVASI (12 Indikator) */}
        <div className="mb-6 print-avoid-break">
          <div className="bg-slate-100 px-3 py-1 font-sans font-bold text-xs uppercase tracking-wider border-l-4 border-slate-800 mb-2">
            III. HASIL OBSERVASI PEMBELAJARAN (12 INDIKATOR)
          </div>
          <p className="text-[11px] font-sans text-slate-600 mb-2">
            Skala Penilaian: 4 = Sangat Baik | 3 = Baik | 2 = Cukup | 1 = Kurang
          </p>

          <table className="w-full text-xs font-sans border border-slate-300">
            <thead className="bg-slate-50 border-b border-slate-300 text-slate-800">
              <tr>
                <th className="p-2 border-r border-slate-300 w-10 text-center">No</th>
                <th className="p-2 border-r border-slate-300 text-left">Indikator Observasi Kelas</th>
                <th className="p-2 border-r border-slate-300 w-14 text-center">Skor (1–4)</th>
                <th className="p-2 text-left">Catatan Fakta Objektif Teramati</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {OBSERVATION_INDICATORS.map((ind, index) => {
                const sc = scores[ind.id] || 0;
                const nt = notes[ind.id] || '-';
                return (
                  <tr key={ind.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-2 border-r border-slate-300 text-center font-bold text-slate-600">
                      {ind.number}
                    </td>
                    <td className="p-2 border-r border-slate-300">
                      <div className="font-semibold text-slate-900">{ind.title}</div>
                      <div className="text-[10px] text-slate-500 italic mt-0.5">{ind.sectionTitle}</div>
                    </td>
                    <td className="p-2 border-r border-slate-300 text-center font-bold text-slate-900 tabular-nums">
                      {sc}
                    </td>
                    <td className="p-2 text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {nt}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* BAGIAN IV: PERHITUNGAN NILAI AKHIR */}
        <div className="mb-6 print-avoid-break">
          <div className="bg-slate-100 px-3 py-1 font-sans font-bold text-xs uppercase tracking-wider border-l-4 border-slate-800 mb-2">
            IV. PERHITUNGAN NILAI AKHIR & KRITERIA KETERCAPAIAN
          </div>
          <div className="border border-slate-300 p-4 rounded bg-slate-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
            <div>
              <div className="text-xs font-semibold text-slate-700">Rumus Penilaian:</div>
              <div className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                Nilai Akhir = (Total Skor / Skor Maksimal 48) × 100%
              </div>
              <div className="text-xs text-slate-600 mt-1 font-mono">
                = ({totalScore} / 48) × 100% = <strong className="text-slate-950 text-sm">{finalScore}</strong>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-6">
              <div className="text-xs font-semibold text-slate-700">Predikat / Kategori:</div>
              <div className="text-base font-extrabold uppercase text-slate-900 mt-0.5">
                {category}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Kriteria: 91–100 (Amat Baik) · 81–90 (Baik) · 71–80 (Cukup) · ≤70 (Kurang)
              </div>
            </div>
          </div>
        </div>

        {/* BAGIAN IV.B: VISUALISASI RADAR PROFIL KOMPETENSI GURU */}
        <div className="mb-6 print-avoid-break">
          <div className="bg-slate-100 px-3 py-1 font-sans font-bold text-xs uppercase tracking-wider border-l-4 border-slate-800 mb-2">
            IV.B. VISUALISASI RADAR 5 DIMENSI KOMPETENSI PEDAGOGIS GURU
          </div>
          <div className="border border-slate-300 p-4 rounded bg-white font-sans">
            <TeacherRadarChart
              supervision={supervision}
              teacherName={identity.namaGuru}
              size="sm"
              showLegend={true}
              showBreakdown={true}
              showRecommendations={false}
            />
          </div>
        </div>

        {/* BAGIAN V: REFLEKSI PASCA-OBSERVASI */}
        <div className="mb-6 print-avoid-break">
          <div className="bg-slate-100 px-3 py-1 font-sans font-bold text-xs uppercase tracking-wider border-l-4 border-slate-800 mb-2">
            V. LEMBAR REFLEKSI & PASCA-OBSERVASI (DIALOG COACHING)
          </div>
          <table className="w-full text-xs font-sans border border-slate-300">
            <thead className="bg-slate-50 border-b border-slate-300 text-slate-700">
              <tr>
                <th className="p-2 border-r border-slate-300 w-10 text-center">No</th>
                <th className="p-2 border-r border-slate-300 w-1/3 text-left">Fokus Pertanyaan Pasca-Observasi</th>
                <th className="p-2 text-left">Ulasan Refleksi & Komitmen Guru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {POST_OBSERVATION_QUESTIONS.map((q) => (
                <tr key={q.key}>
                  <td className="p-2 border-r border-slate-300 text-center font-bold text-slate-500">
                    {q.number}
                  </td>
                  <td className="p-2 border-r border-slate-300 font-medium text-slate-800">
                    <div>{q.question}</div>
                    <div className="text-[10px] text-slate-500 italic mt-0.5">{q.label}</div>
                  </td>
                  <td className="p-2 text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {refleksi[q.key as keyof typeof refleksi] || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BAGIAN VI: RENCANA TINDAK LANJUT */}
        <div className="mb-8 print-avoid-break">
          <div className="bg-slate-100 px-3 py-1 font-sans font-bold text-xs uppercase tracking-wider border-l-4 border-slate-800 mb-2">
            VI. RENCANA TINDAK LANJUT (RTL) SUPERVISI
          </div>
          <table className="w-full text-xs font-sans border border-slate-300">
            <thead className="bg-slate-50 border-b border-slate-300 text-slate-700">
              <tr>
                <th className="p-2 border-r border-slate-300 w-10 text-center">No</th>
                <th className="p-2 border-r border-slate-300 w-1/4 text-left">Fokus Aspek Perbaikan</th>
                <th className="p-2 border-r border-slate-300 w-1/3 text-left">Rencana Kegiatan Nyata</th>
                <th className="p-2 border-r border-slate-300 w-28 text-left">Target Waktu</th>
                <th className="p-2 text-left">Kriteria Keberhasilan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rtl.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-3 text-center text-slate-500 italic">
                    Belum ada rencana tindak lanjut yang dicatat.
                  </td>
                </tr>
              ) : (
                rtl.map((item, index) => (
                  <tr key={item.id}>
                    <td className="p-2 border-r border-slate-300 text-center font-bold text-slate-500">
                      {index + 1}
                    </td>
                    <td className="p-2 border-r border-slate-300 font-semibold text-slate-900">
                      {item.fokusAspek}
                    </td>
                    <td className="p-2 border-r border-slate-300 text-slate-700 leading-relaxed">
                      {item.rencanaKegiatan}
                    </td>
                    <td className="p-2 border-r border-slate-300 text-slate-800 whitespace-nowrap">
                      {item.waktuTarget}
                    </td>
                    <td className="p-2 text-slate-700 leading-relaxed">
                      {item.kriteriaKeberhasilan}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* BAGIAN VII: LEMBAR PENGESAHAN & TANDA TANGAN */}
        <div className="print-avoid-break font-sans pt-4">
          <div className="text-right text-xs mb-4">
            {localSettings.schoolCity || 'Kota Pendidikan'},{' '}
            {localSettings.documentDate || identity.hariTanggal || new Date().toLocaleDateString('id-ID')}
          </div>

          <div className="grid grid-cols-3 gap-6 text-center text-xs">
            {/* TTD Guru */}
            <div className="flex flex-col justify-between h-36">
              <div>
                <p className="text-slate-600">Guru yang Disupervisi,</p>
              </div>
              <div>
                <p className="font-bold underline text-slate-950">{identity.namaGuru}</p>
                <p className="text-[11px] font-mono text-slate-600">NIP: {identity.nipGuru || '-'}</p>
              </div>
            </div>

            {/* TTD Supervisor / Pengawas */}
            <div className="flex flex-col justify-between h-36">
              <div>
                <p className="text-slate-600 font-medium">
                  {localSettings.supervisorRole || identity.jabatanSupervisor || 'Pengawas Sekolah Pembina'},
                </p>
              </div>
              <div>
                <p className="font-bold underline text-slate-950">{localSettings.supervisorName || identity.namaSupervisor}</p>
                <p className="text-[11px] font-mono text-slate-600">NIP: {localSettings.supervisorNip || identity.nipSupervisor || '-'}</p>
                <p className="text-[10.5px] text-slate-600">Pangkat/Golongan: {localSettings.supervisorRank || 'Penata Tk. I / III.d'}</p>
              </div>
            </div>

            {/* TTD Pengawas Pembina / Pejabat Mengetahui */}
            <div className="flex flex-col justify-between h-36">
              <div>
                <p className="text-slate-600">
                  Mengetahui,<br />
                  {localSettings.pengawasPembinaRole || 'Pengawas Pembina Sekolah / Dinas'},
                </p>
              </div>
              <div>
                <p className="font-bold underline text-slate-950">{localSettings.pengawasPembinaName || 'Dr. Hj. Endang Sulastri, M.Pd.'}</p>
                <p className="text-[11px] font-mono text-slate-600">NIP: {localSettings.pengawasPembinaNip || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL INPUT & PENGATURAN YANG BERTANDA TANGAN */}
      <SignatoryModal
        isOpen={isSignatoryModalOpen}
        onClose={() => setIsSignatoryModalOpen(false)}
        settings={localSettings}
        onSave={handleSaveSignatories}
        onPrintAfterSave={() => handlePrint()}
        teacherInfo={{
          name: identity.namaGuru,
          nip: identity.nipGuru || '-',
          mapel: `${identity.mapel} (${identity.kelasSemester})`
        }}
      />
    </div>
  );
};
