/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Scale,
  Plus,
  Search,
  School,
  User,
  Calendar,
  FileText,
  Printer,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  Laptop,
  HeartHandshake,
  AlertTriangle,
  Lightbulb,
  X,
  FileSpreadsheet,
  Bot,
  Wand2,
  RefreshCw
} from 'lucide-react';
import {
  AcademicProContraRecord,
  AcademicProContraItem,
  ProContraStatus,
  Principal,
  Teacher,
  AppSettings
} from '../types/inspiro';
import { exportAcademicProContraToWord } from '../utils/storage';
import { printDocumentElement } from '../utils/documentExport';
import { DEFAULT_SIDRAP_LOGO, DEFAULT_TUTWURI_LOGO } from '../data/defaultLogos';
import { generateProContraAI } from '../services/aiProContraGenerator';

interface AcademicProContraViewProps {
  records: AcademicProContraRecord[];
  principals: Principal[];
  teachers: Teacher[];
  settings: AppSettings;
  onSaveRecord: (record: AcademicProContraRecord) => void;
  onDeleteRecord: (id: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const AcademicProContraView: React.FC<AcademicProContraViewProps> = ({
  records,
  principals,
  teachers,
  settings,
  onSaveRecord,
  onDeleteRecord,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<AcademicProContraRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<AcademicProContraRecord>>({
    title: '',
    schoolName: '',
    schoolNpsn: '',
    teacherId: '',
    teacherName: '',
    teacherNip: '',
    subject: '',
    gradeClass: '',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    date: new Date().toISOString().split('T')[0],
    headmasterName: '',
    headmasterNip: '',
    supervisorName: settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
    supervisorNip: settings.supervisorNip || '19830819 201001 1 002',
    supervisorRole: 'Pengawas Sekolah Pembina',
    supervisorRank: settings.supervisorRank || 'Penata Tk. I / III.d',
    notes: '',
    items: [],
    status: 'final'
  });

  const [activeTabForm, setActiveTabForm] = useState<'matrix' | 'identity'>('matrix');
  const [loadingAIItemId, setLoadingAIItemId] = useState<string | null>(null);
  const [loadingAIField, setLoadingAIField] = useState<string | null>(null);

  // Unique schools for filter
  const uniqueSchools = useMemo(() => {
    const list = new Set<string>();
    records.forEach((r) => list.add(r.schoolName));
    principals.forEach((p) => list.add(p.satuanPendidikan));
    return Array.from(list).sort();
  }, [records, principals]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSchool = schoolFilter === 'all' || r.schoolName === schoolFilter;
      const matchSearch =
        searchTerm === '' ||
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.teacherName && r.teacherName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        r.items.some((it) => it.aspek.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus =
        statusFilter === 'all' ||
        r.items.some((it) => it.status === statusFilter);
      return matchSchool && matchSearch && matchStatus;
    });
  }, [records, schoolFilter, searchTerm, statusFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalDocs = records.length;
    let totalItems = 0;
    let totalDone = 0;
    let totalProcess = 0;
    const schools = new Set<string>();

    records.forEach((r) => {
      schools.add(r.schoolName);
      r.items.forEach((it) => {
        totalItems++;
        if (it.status === 'Terealisasi') totalDone++;
        else if (it.status === 'Dalam Proses') totalProcess++;
      });
    });

    return {
      totalDocs,
      totalItems,
      totalDone,
      totalProcess,
      totalSchools: schools.size,
      resolvedPercentage: totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0
    };
  }, [records]);

  // Quick Preset Aspects for faster matrix filling
  const presetAspects = [
    {
      aspek: 'Pembelajaran Berdiferensiasi (Proses & Konten)',
      pro: 'Mengakomodasi kesiapan belajar murid yang beragam; menurunkan frustrasi siswa berkemampuan lambat; melayani potensi murid cepat.',
      kontra: 'Guru terbebani waktu persiapan modul dan LKPD bertingkat; kesulitan mendampingi 3 kelompok belajar bersamaan.',
      analisisDampak: 'Jika dipaksakan tanpa pendampingan, guru berisiko kembali ke metode ceramah monolog seragam dan diferensiasi hanya formalitas.',
      aksiPenyelesaian: 'Aktivasi Kombel sekolah mingguan untuk co-planning bank modul ajar; implementasi model stasiun rotasi terbimbing bertahap.'
    },
    {
      aspek: 'Pemanfaatan Papan Interaktif Digital (PID) & Chromebook',
      pro: 'Interaktivitas dan visualisasi konsep abstrak meningkat tajam; keterlibatan hands-on murid tinggi (>70%); mendukung literasi digital.',
      kontra: 'Kekhawatiran perangkat rusak saat dioperasikan murid; kendala bandwidth saat jam padat; persiapan akun di awal menyita waktu.',
      analisisDampak: 'Perangkat TIK berharga mahal berisiko mangkrak di lemari atau hanya dijadikan proyektor layar pasif konvensional.',
      aksiPenyelesaian: 'Peer coaching guru senior oleh guru muda pionir TIK; buat SOP pengoperasian santai; pasang bank materi dan simulasi offline.'
    },
    {
      aspek: 'Penerapan Segitiga Restitusi & Keyakinan Kelas (Disiplin Positif)',
      pro: 'Membangun motivasi intrinsik dan kesadaran murid memperbaiki kesalahan tanpa rasa takut atau trauma; iklim kelas aman & suportif.',
      kontra: 'Proses dialog restitusi memakan waktu di tengah target materi; persepsi wibawa guru menurun bila tidak ada hukuman jera langsung.',
      analisisDampak: 'Inkonsistensi penegakan aturan kelas; murid menganggap remeh kesepakatan bila restitusi disalahartikan pembiaran tanpa konsekuensi.',
      aksiPenyelesaian: 'Simulasi 5 posisi kontrol guru (khususnya Manajer) di Kombel; perumusan Keyakinan Kelas visual bersama; libatkan wali murid.'
    },
    {
      aspek: 'Asesmen Formatif Portofolio Digital & Umpan Balik Berkala',
      pro: 'Rekam jejak otentik perkembangan murid terlihat jelas; melatih refleksi diri murid (assessment as learning); penilaian lebih manusiawi.',
      kontra: 'Guru kewalahan mengorganisir puluhan artefak murid; kendala kuota/perangkat murid saat mengerjakan kurasi portofolio di rumah.',
      analisisDampak: 'Penilaian kembali tereduksi menjadi tes hafalan tertulis angka kognitif semata; motivasi belajar murid melemah.',
      aksiPenyelesaian: 'Sediakan struktur folder Google Drive / Sites kelas terstandar; kurasi dibatasi 1 karya terbaik per materi pokok.'
    },
    {
      aspek: 'Pemanfaatan AI Generatif (Canva / Gemini / Quizizz AI)',
      pro: 'Mempercepat guru mendesain asesmen, stimulus teks bertingkat, dan visual pembelajaran interaktif berkualitas tinggi.',
      kontra: 'Kekhawatiran ketergantungan instan tanpa telaah kritis; kecemasan etika plagiarisme dan privasi data murid.',
      analisisDampak: 'Kesenjangan literasi digital guru melebar; penolakan adopsi teknologi yang sebenarnya meringankan beban kerja guru.',
      aksiPenyelesaian: 'Workshop supervisi klinis etika prompting edukasi; penetapan panduan transparansi AI di satuan pendidikan.'
    }
  ];

  // Open Create Form
  const handleOpenCreate = () => {
    const defaultPrincipal = principals[0];
    setFormData({
      id: `pc-${Date.now()}`,
      title: 'Matriks Analisis Pro-Kontra Supervisi Akademik & Dialektika Inovasi',
      schoolName: defaultPrincipal ? defaultPrincipal.satuanPendidikan : (settings.schoolName || 'UPT SD Negeri 4 Bilokka'),
      schoolNpsn: defaultPrincipal?.npsn || '40301824',
      teacherId: '',
      teacherName: '',
      teacherNip: '',
      subject: 'Mata Pelajaran Tematik / Umum',
      gradeClass: 'Fase B / Kelas IV',
      academicYear: '2026/2027',
      semester: 'Ganjil',
      date: new Date().toISOString().split('T')[0],
      headmasterName: defaultPrincipal?.nama || 'Asnawi., S.Pd',
      headmasterNip: defaultPrincipal?.nip || '19681231 200502 1 008',
      supervisorName: settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
      supervisorNip: settings.supervisorNip || '19830819 201001 1 002',
      supervisorRole: 'Pengawas Sekolah Pembina',
      supervisorRank: settings.supervisorRank || 'Penata Tk. I / III.d',
      notes: '',
      items: [
        {
          id: `item-${Date.now()}-1`,
          aspek: presetAspects[0].aspek,
          pro: presetAspects[0].pro,
          kontra: presetAspects[0].kontra,
          analisisDampak: presetAspects[0].analisisDampak,
          aksiPenyelesaian: presetAspects[0].aksiPenyelesaian,
          status: 'Dalam Proses'
        }
      ],
      status: 'final'
    });
    setActiveTabForm('matrix');
    setIsEditorOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (rec: AcademicProContraRecord) => {
    setFormData({ ...rec, items: rec.items.map((it) => ({ ...it })) });
    setActiveTabForm('matrix');
    setIsEditorOpen(true);
  };

  // Open Detail Modal
  const handleOpenDetail = (rec: AcademicProContraRecord) => {
    setActiveRecord(rec);
    setIsDetailOpen(true);
  };

  // Add Item to Matrix in Form
  const handleAddItem = (preset?: typeof presetAspects[0]) => {
    const newItem: AcademicProContraItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      aspek: preset ? preset.aspek : '',
      pro: preset ? preset.pro : '',
      kontra: preset ? preset.kontra : '',
      analisisDampak: preset ? preset.analisisDampak : '',
      aksiPenyelesaian: preset ? preset.aksiPenyelesaian : '',
      status: 'Dalam Proses'
    };
    setFormData((prev) => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  // Update Item in Matrix
  const handleUpdateItem = (id: string, field: keyof AcademicProContraItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      items: (prev.items || []).map((it) => (it.id === id ? { ...it, [field]: value } : it))
    }));
  };

  // Remove Item from Matrix
  const handleRemoveItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      items: (prev.items || []).filter((it) => it.id !== id)
    }));
  };

  // AI Generator: Auto-fill Pro, Kontra, Analisis Dampak, dan Aksi Penyelesaian
  const handleAIGenerate = async (
    itemId: string,
    field: 'all' | 'pro' | 'kontra' | 'analisisDampak' | 'aksiPenyelesaian'
  ) => {
    const item = formData.items?.find((it) => it.id === itemId);
    if (!item) return;

    if (!item.aspek || !item.aspek.trim()) {
      showToast('Ketikkan dahulu Aspek Supervisi / Inovasi di nomor 1 (contoh: Papan Interaktif Digital, Diferensiasi, dll.)', 'warning');
      return;
    }

    try {
      setLoadingAIItemId(itemId);
      setLoadingAIField(field);

      const generated = await generateProContraAI(item.aspek, {
        schoolName: formData.schoolName,
        teacherName: formData.teacherName,
        subject: formData.subject,
        targetField: field
      });

      setFormData((prev) => ({
        ...prev,
        items: (prev.items || []).map((it) => {
          if (it.id !== itemId) return it;
          if (field === 'all') {
            return {
              ...it,
              pro: generated.pro,
              kontra: generated.kontra,
              analisisDampak: generated.analisisDampak,
              aksiPenyelesaian: generated.aksiPenyelesaian
            };
          }
          return {
            ...it,
            [field]: generated[field]
          };
        })
      }));

      const fieldLabel =
        field === 'all'
          ? '4 Kolom (Pro, Kontra, Dampak, Solusi)'
          : field === 'pro'
          ? 'Bagian 2 Pro (Mendukung)'
          : field === 'kontra'
          ? 'Bagian 3 Kontra (Keberatan)'
          : field === 'analisisDampak'
          ? 'Bagian 4 Analisis Dampak'
          : 'Bagian 5 Aksi Penyelesaian';

      showToast(`✨ ${fieldLabel} berhasil diisi otomatis dengan AI!`, 'success');
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      showToast('Gagal memproses analisis AI dialektika, silakan coba lagi.', 'warning');
    } finally {
      setLoadingAIItemId(null);
      setLoadingAIField(null);
    }
  };

  // Handle Principal Quick Sync
  const handlePrincipalSelect = (pId: string) => {
    const found = principals.find((p) => p.id === pId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        headmasterName: found.nama,
        headmasterNip: found.nip,
        schoolName: found.satuanPendidikan,
        schoolNpsn: found.npsn || prev.schoolNpsn
      }));
      showToast(`Data sinkron ke ${found.nama} (${found.satuanPendidikan})`, 'info');
    }
  };

  // Handle Teacher Quick Sync
  const handleTeacherSelect = (tId: string) => {
    const found = teachers.find((t) => t.id === tId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        teacherId: found.id,
        teacherName: found.nama,
        teacherNip: found.nip,
        subject: found.mapel || prev.subject,
        gradeClass: found.kelas || prev.gradeClass,
        schoolName: found.satuanPendidikan || prev.schoolName
      }));
    }
  };

  // Save Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.schoolName?.trim()) {
      showToast('Mohon lengkapi judul dan satuan pendidikan!', 'warning');
      return;
    }
    if (!formData.items || formData.items.length === 0) {
      showToast('Minimal tambahkan 1 aspek dalam matriks pro-kontra!', 'warning');
      return;
    }

    const recordToSave: AcademicProContraRecord = {
      id: formData.id || `pc-${Date.now()}`,
      title: formData.title || 'Matriks Analisis Pro-Kontra Supervisi Akademik',
      schoolName: formData.schoolName || '',
      schoolNpsn: formData.schoolNpsn || '',
      teacherId: formData.teacherId || '',
      teacherName: formData.teacherName || '',
      teacherNip: formData.teacherNip || '',
      subject: formData.subject || '',
      gradeClass: formData.gradeClass || '',
      academicYear: formData.academicYear || '2026/2027',
      semester: formData.semester || 'Ganjil',
      date: formData.date || new Date().toISOString().split('T')[0],
      headmasterName: formData.headmasterName || '',
      headmasterNip: formData.headmasterNip || '',
      supervisorName: formData.supervisorName || settings.supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd',
      supervisorNip: formData.supervisorNip || settings.supervisorNip || '19830819 201001 1 002',
      supervisorRole: formData.supervisorRole || 'Pengawas Sekolah Pembina',
      supervisorRank: formData.supervisorRank || settings.supervisorRank || 'Penata Tk. I / III.d',
      notes: formData.notes || '',
      items: formData.items || [],
      status: formData.status || 'final',
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveRecord(recordToSave);
    setIsEditorOpen(false);
    showToast('Matriks Pro-Kontra berhasil disimpan!', 'success');
  };

  // Export Word from record
  const handleExportWord = (rec: AcademicProContraRecord) => {
    exportAcademicProContraToWord(rec, settings);
    showToast(`Dokumen Word Matriks Pro-Kontra ${rec.schoolName} berhasil diunduh!`, 'success');
  };

  // Direct Browser Print & PDF Export
  const handlePrint = (rec: AcademicProContraRecord) => {
    setActiveRecord(rec);
    setTimeout(() => {
      const docTitle = `Matriks_Pro_Kontra_${(rec.schoolName || 'Supervisi').replace(/[^a-zA-Z0-9]/g, '_')}_${rec.date || ''}`;
      const printed = printDocumentElement('printable-pro-contra-doc', docTitle, { orientation: 'portrait' });
      if (!printed) {
        window.print();
      }
    }, 150);
  };

  // Render the official document layout (used by both the in-app modal preview and the print/PDF generator)
  const renderOfficialDocumentContent = (rec: AcademicProContraRecord) => {
    return (
      <div className="text-slate-900 bg-white">
        {/* KOP Surat Resmi dengan Dua Logo */}
        <div className="flex items-center justify-between border-b-4 border-double border-slate-900 pb-3 mb-6">
          <div className="w-20 flex justify-center">
            <img
              src={settings.logoUrl || DEFAULT_SIDRAP_LOGO}
              alt="Logo Kabupaten Sidenreng Rappang"
              className="h-20 w-auto object-contain"
            />
          </div>
          <div className="flex-1 text-center px-4">
            <h3 className="text-sm font-bold tracking-wider text-slate-800 uppercase leading-tight">
              {settings.governmentAgency || 'PEMERINTAH KABUPATEN SIDENRENG RAPPANG'}
            </h3>
            <h2 className="text-base font-black tracking-wide text-slate-900 uppercase mt-0.5 leading-tight">
              DINAS PENDIDIKAN DAN KEBUDAYAAN
            </h2>
            <h1 className="text-sm font-extrabold text-blue-900 uppercase mt-0.5 tracking-tight">
              PENGAWAS SEKOLAH PEMBINA KABUPATEN SIDENRENG RAPPANG
            </h1>
            <p className="text-[10px] text-slate-600 italic mt-1 leading-tight">
              Alamat: Kompleks SKPD Jl. Harapan Baru No. 1, Pangkajene, Kab. Sidenreng Rappang, Sulawesi Selatan (91611)
            </p>
          </div>
          <div className="w-20 flex justify-center">
            <img
              src={settings.logoRightUrl || DEFAULT_TUTWURI_LOGO}
              alt="Logo Tut Wuri Handayani"
              className="h-20 w-auto object-contain"
            />
          </div>
        </div>

        {/* Judul Dokumen */}
        <div className="text-center mb-6">
          <h2 className="text-base font-extrabold uppercase underline tracking-wide text-slate-900">
            MATRIKS ANALISIS PRO-KONTRA SUPERVISI AKADEMIK
          </h2>
          <p className="text-xs font-bold text-slate-700 mt-1 uppercase">
            DIALEKTIKA INOVASI PEMBELAJARAN, ANALISIS DAMPAK, DAN AKSI PENYELESAIAN
          </p>
        </div>

        {/* Metadata Tabel */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs pb-4 mb-4 border-b border-slate-200">
          <div className="flex gap-2">
            <span className="w-32 font-bold text-slate-700 shrink-0">Satuan Pendidikan</span>
            <span className="font-bold">:</span>
            <span className="text-slate-900 font-semibold">{rec.schoolName} {rec.schoolNpsn ? `(NPSN: ${rec.schoolNpsn})` : ''}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-32 font-bold text-slate-700 shrink-0">Tahun Pelajaran</span>
            <span className="font-bold">:</span>
            <span className="text-slate-900">{rec.academicYear} ({rec.semester})</span>
          </div>
          <div className="flex gap-2">
            <span className="w-32 font-bold text-slate-700 shrink-0">Guru Sasaran / Mapel</span>
            <span className="font-bold">:</span>
            <span className="text-slate-900 font-semibold">{rec.teacherName || '-'} / {rec.subject || '-'}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-32 font-bold text-slate-700 shrink-0">Tanggal Supervisi</span>
            <span className="font-bold">:</span>
            <span className="text-slate-900">{rec.date}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-32 font-bold text-slate-700 shrink-0">Kepala Sekolah</span>
            <span className="font-bold">:</span>
            <span className="text-slate-900">{rec.headmasterName} (NIP. {rec.headmasterNip})</span>
          </div>
          <div className="flex gap-2">
            <span className="w-32 font-bold text-slate-700 shrink-0">Pengawas Pembina</span>
            <span className="font-bold">:</span>
            <span className="text-slate-900 font-semibold">{rec.supervisorName}</span>
          </div>
        </div>

        {/* Catatan Pengawas */}
        {rec.notes && (
          <div className="mb-5 p-3 rounded-lg bg-slate-50 border-l-4 border-blue-600 text-xs">
            <strong className="text-slate-800">Catatan Refleksi Pengawas Pembina:</strong>
            <p className="text-slate-600 italic mt-0.5 leading-relaxed">{rec.notes}</p>
          </div>
        )}

        {/* TABEL MATRIKS 5 KOLOM */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse border border-slate-400 text-xs">
            <thead>
              <tr className="bg-slate-800 text-white text-[11px] uppercase tracking-wider text-center">
                <th className="border border-slate-400 p-2 w-10 text-center bg-slate-800 text-white font-bold">No</th>
                <th className="border border-slate-400 p-2 w-44 text-left bg-slate-800 text-white font-bold">Aspek Supervisi</th>
                <th className="border border-slate-400 p-2 bg-emerald-900 text-white text-left font-bold">Pro (Mendukung)</th>
                <th className="border border-slate-400 p-2 bg-rose-900 text-white text-left font-bold">Kontra (Keberatan / Kendala)</th>
                <th className="border border-slate-400 p-2 bg-amber-900 text-white text-left font-bold">Analisis Dampak</th>
                <th className="border border-slate-400 p-2 bg-blue-900 text-white text-left font-bold">Aksi Penyelesaian</th>
              </tr>
            </thead>
            <tbody>
              {rec.items.map((item, idx) => (
                <tr key={item.id} className="align-top hover:bg-slate-50/50">
                  <td className="border border-slate-400 p-2.5 text-center font-bold bg-slate-50 text-slate-900">
                    {idx + 1}
                  </td>
                  <td className="border border-slate-400 p-2.5">
                    <strong className="text-slate-900 block font-bold mb-1.5">{item.aspek}</strong>
                    <span
                      className={`inline-block text-[9px] px-2 py-0.5 rounded font-extrabold uppercase ${
                        item.status === 'Terealisasi'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : item.status === 'Dalam Proses'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                      }`}
                    >
                      {item.status || 'Rencana'}
                    </span>
                  </td>
                  <td className="border border-slate-400 p-2.5 bg-emerald-50/50 text-emerald-950 leading-relaxed font-normal">
                    {item.pro}
                  </td>
                  <td className="border border-slate-400 p-2.5 bg-rose-50/50 text-rose-950 leading-relaxed font-normal">
                    {item.kontra}
                  </td>
                  <td className="border border-slate-400 p-2.5 bg-amber-50/50 text-amber-950 leading-relaxed font-normal">
                    {item.analisisDampak}
                  </td>
                  <td className="border border-slate-400 p-2.5 bg-blue-50/50 text-blue-950 leading-relaxed font-medium">
                    {item.aksiPenyelesaian}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tanda Tangan Resmi Tripartit Standar Kedinasan (Guru Sasaran, Kepala Sekolah, Pengawas Pembina) */}
        <div className="mt-8 pt-4 border-t border-slate-300 print:border-black/30 break-inside-avoid print:break-inside-avoid">
          <table className="sig-table w-full text-xs text-slate-900" style={{ borderCollapse: 'collapse', border: 'none', width: '100%' }}>
            <tbody>
              {/* Baris 1: Jabatan & Titimangsa */}
              <tr className="align-top" style={{ border: 'none' }}>
                {/* Kolom 1: Guru Sasaran / Terkait */}
                <td className="w-1/3 text-center pb-1 no-border" style={{ border: 'none', padding: '0 6px', verticalAlign: 'top' }}>
                  <p className="text-slate-700 leading-tight">Guru Sasaran / Terkait,</p>
                  <p className="font-bold text-slate-900 leading-tight mt-0.5">{rec.schoolName}</p>
                  <p className="text-[10px] text-slate-500 italic leading-tight">(Guru Mata Pelajaran)</p>
                </td>

                {/* Kolom 2: Kepala Satuan Pendidikan */}
                <td className="w-1/3 text-center pb-1 no-border" style={{ border: 'none', padding: '0 6px', verticalAlign: 'top' }}>
                  <p className="text-slate-700 leading-tight">Mengetahui,</p>
                  <p className="font-bold text-slate-900 leading-tight mt-0.5">Kepala Satuan Pendidikan</p>
                  <p className="text-[10px] text-slate-500 italic leading-tight">(Penanggung Jawab Sekolah)</p>
                </td>

                {/* Kolom 3: Pengawas Sekolah Pembina */}
                <td className="w-1/3 text-center pb-1 no-border" style={{ border: 'none', padding: '0 6px', verticalAlign: 'top' }}>
                  <p className="text-slate-700 leading-tight">
                    {settings.schoolCity || 'Kabupaten Sidenreng Rappang'}, {rec.date}
                  </p>
                  <p className="font-bold text-slate-900 leading-tight mt-0.5">
                    {rec.supervisorRole || 'Pengawas Sekolah Pembina'}
                  </p>
                  <p className="text-[10px] text-slate-500 italic leading-tight">(Fasilitator &amp; Asesor)</p>
                </td>
              </tr>

              {/* Baris 2: RUANG KOSONG TANDA TANGAN & STEMPEL (KETINGGIAN PRESISI 80PX BERSIH TANPA TEKS AGAR TANDA TANGAN TIDAK TERTINDIH) */}
              <tr style={{ height: '80px', border: 'none' }}>
                <td className="no-border" style={{ height: '80px', minHeight: '80px', border: 'none', padding: '0 6px', verticalAlign: 'middle' }}>
                  <div style={{ height: '80px', minHeight: '80px', width: '100%' }}>&nbsp;</div>
                </td>

                <td className="no-border" style={{ height: '80px', minHeight: '80px', border: 'none', padding: '0 6px', verticalAlign: 'middle' }}>
                  <div style={{ height: '80px', minHeight: '80px', width: '100%' }}>&nbsp;</div>
                </td>

                <td className="no-border" style={{ height: '80px', minHeight: '80px', border: 'none', padding: '0 6px', verticalAlign: 'middle' }}>
                  <div style={{ height: '80px', minHeight: '80px', width: '100%' }}>&nbsp;</div>
                </td>
              </tr>

              {/* Baris 3: Nama, NIP, & Pangkat/Golongan */}
              <tr className="align-top" style={{ border: 'none' }}>
                <td className="text-center pt-1 no-border" style={{ border: 'none', padding: '2px 6px' }}>
                  <p className="font-bold underline text-slate-900 text-xs uppercase tracking-wide">
                    {rec.teacherName || 'Guru Terkait'}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">NIP. {rec.teacherNip || '-'}</p>
                </td>

                <td className="text-center pt-1 no-border" style={{ border: 'none', padding: '2px 6px' }}>
                  <p className="font-bold underline text-slate-900 text-xs uppercase tracking-wide">
                    {rec.headmasterName}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">NIP. {rec.headmasterNip || '-'}</p>
                </td>

                <td className="text-center pt-1 no-border" style={{ border: 'none', padding: '2px 6px' }}>
                  <p className="font-bold underline text-slate-900 text-xs uppercase tracking-wide">
                    {rec.supervisorName}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">NIP. {rec.supervisorNip}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{rec.supervisorRank || 'Penata Tk. I / III.d'}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* SCREEN-ONLY INTERACTIVE UI (STRICTLY HIDDEN ON PRINT) */}
      <div className="space-y-6 print:hidden no-print">
        {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-cyan-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                Instrumen Baru Supervisi Akademik
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-slate-300 text-xs font-medium">Kabupaten Sidenreng Rappang</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Scale className="w-5 h-5 text-white" />
              </div>
              Matriks Analisis Pro-Kontra Supervisi
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Membedah 5 matrik dialektika inovasi pembelajaran: <strong>Aspek</strong>,{' '}
              <strong className="text-emerald-300">Pro (Mendukung)</strong>,{' '}
              <strong className="text-rose-300">Kontra (Keberatan / Kendala Lapangan)</strong>,{' '}
              <strong className="text-amber-300">Analisis Dampak</strong>, dan{' '}
              <strong className="text-cyan-300">Aksi Penyelesaian</strong> untuk memediasi resistensi guru menuju keberhasilan instruksional.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer transform hover:-translate-y-0.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Matriks Pro-Kontra</span>
          </button>
        </div>

        {/* 4 Quick Stat Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-indigo-800/40">
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-[11px] text-slate-300 font-medium">Total Dokumen</div>
            <div className="text-xl font-black text-white mt-0.5">{stats.totalDocs} Dokumen</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-[11px] text-slate-300 font-medium">Aspek Dialektika Dikaji</div>
            <div className="text-xl font-black text-cyan-300 mt-0.5">{stats.totalItems} Aspek</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-[11px] text-slate-300 font-medium">Solusi Terealisasi</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              {stats.totalDone} <span className="text-xs font-normal text-slate-300">({stats.resolvedPercentage}%)</span>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-[11px] text-slate-300 font-medium">Satuan Pendidikan</div>
            <div className="text-xl font-black text-amber-300 mt-0.5">{stats.totalSchools} Sekolah</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari aspek inovasi, nama guru sasaran, atau satuan pendidikan..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Satuan Pendidikan ({uniqueSchools.length})</option>
            {uniqueSchools.map((sch) => (
              <option key={sch} value={sch}>
                {sch}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Status Aksi</option>
            <option value="Terealisasi">Terealisasi</option>
            <option value="Dalam Proses">Dalam Proses</option>
            <option value="Rencana Tindak Lanjut">Rencana Tindak Lanjut</option>
          </select>

          {(searchTerm || schoolFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSchoolFilter('all');
                setStatusFilter('all');
              }}
              className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Record Cards Grid */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
            <Scale className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Belum Ada Dokumen Matriks Pro-Kontra</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            Mulai analisis dialektika inovasi pembelajaran guru binaan dengan mencatat pro, kontra, analisis dampak, dan aksi solutif pengawas.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Matriks Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredRecords.map((rec) => {
            const doneCount = rec.items.filter((it) => it.status === 'Terealisasi').length;
            const processCount = rec.items.filter((it) => it.status === 'Dalam Proses').length;

            return (
              <div
                key={rec.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
              >
                {/* Header Card */}
                <div className="p-5 border-b border-slate-100 flex-1">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-700">
                      <School className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="truncate">{rec.schoolName}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {rec.date}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                    {rec.title}
                  </h3>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Guru Sasaran & Mapel:</span>
                      <strong className="text-slate-700 font-semibold truncate block">
                        {rec.teacherName || 'Semua Pendidik'}
                      </strong>
                      <span className="text-slate-500 text-[10px]">
                        {rec.subject || 'Lintas Mapel'} {rec.gradeClass ? `(${rec.gradeClass})` : ''}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">Kepala Sekolah & Pengawas:</span>
                      <strong className="text-slate-700 font-semibold truncate block">
                        {rec.headmasterName || '-'}
                      </strong>
                      <span className="text-slate-500 text-[10px] truncate block">
                        {rec.supervisorName}
                      </span>
                    </div>
                  </div>

                  {/* Matrix Aspects Preview Badge */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-cyan-600" />
                        {rec.items.length} Aspek Inovasi Dianalisis:
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {doneCount} Tuntas · {processCount} Berproses
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {rec.items.map((it, idx) => (
                        <div
                          key={it.id || idx}
                          className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-800 text-[11px] truncate flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[9px] flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="truncate">{it.aspek}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                              <span className="text-emerald-700 font-medium">Pro:</span> {it.pro}
                            </div>
                          </div>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                              it.status === 'Terealisasi'
                                ? 'bg-emerald-100 text-emerald-800'
                                : it.status === 'Dalam Proses'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {it.status || 'Rencana'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenDetail(rec)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      title="Lihat Detail Matriks Lengkap"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detail</span>
                    </button>

                    <button
                      onClick={() => handleExportWord(rec)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      title="Ekspor Laporan Matriks ke Microsoft Word (.doc)"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Word</span>
                    </button>

                    <button
                      onClick={() => handlePrint(rec)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 text-xs font-medium transition-all shadow-2xs cursor-pointer"
                      title="Cetak Langsung / Simpan PDF"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(rec)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Matriks"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus matriks ${rec.title}?`)) {
                          onDeleteRecord(rec.id);
                          showToast('Matriks berhasil dihapus', 'info');
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Matriks"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL EDITOR: TAMBAH / EDIT MATRIKS PRO-KONTRA          */}
      {/* ======================================================== */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">
                    {formData.id && records.some((r) => r.id === formData.id)
                      ? 'Edit Matriks Analisis Pro-Kontra Supervisi'
                      : 'Input Baru: Matriks Analisis Pro-Kontra Supervisi'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Standar Pengawas Sekolah Pembina Kab. Sidenreng Rappang
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="px-6 pt-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTabForm('matrix')}
                  className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTabForm === 'matrix'
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Tabel 5 Kolom Matriks ({formData.items?.length || 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabForm('identity')}
                  className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTabForm === 'identity'
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Identitas Sekolah, Kepala Sekolah & Pengawas</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Satuan: <strong className="text-slate-800">{formData.schoolName || '-'}</strong>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTabForm === 'matrix' ? (
                <div className="space-y-5">
                  {/* Quick Preset Aspects Selector */}
                  <div className="p-3.5 bg-indigo-50/70 border border-indigo-200/60 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        Tambah Cepat Aspek Dilema / Inovasi Supervisi Akademik:
                      </span>
                      <span className="text-[11px] text-indigo-600 font-medium">
                        Klik chip untuk menyisipkan ke tabel
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {presetAspects.map((preset, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => handleAddItem(preset)}
                          className="px-2.5 py-1 bg-white hover:bg-indigo-600 text-indigo-900 hover:text-white border border-indigo-200 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{preset.aspek.split('(')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                        Daftar Baris Matriks Analisis (5 Kolom Utama)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Pastikan setiap aspek memiliki analisis dampak yang tajam dan aksi penyelesaian realistis.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddItem()}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Aspek Kosong</span>
                    </button>
                  </div>

                  {/* Matrix Rows List */}
                  <div className="space-y-4">
                    {formData.items && formData.items.length > 0 ? (
                      formData.items.map((item, idx) => (
                        <div
                          key={item.id}
                          className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-3 relative group"
                        >
                          {/* Row Header */}
                          <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-bold text-slate-800">
                                Aspek #{idx + 1}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {/* Master AI Auto-Fill 4 Columns Button */}
                              <button
                                type="button"
                                onClick={() => handleAIGenerate(item.id, 'all')}
                                disabled={loadingAIItemId === item.id}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                                title="Isi otomatis Bagian 2 (Pro), 3 (Kontra), 4 (Dampak), dan 5 (Aksi Solutif) berdasarkan aspek di nomor 1"
                              >
                                <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${loadingAIItemId === item.id && loadingAIField === 'all' ? 'animate-spin' : ''}`} />
                                <span>
                                  {loadingAIItemId === item.id && loadingAIField === 'all'
                                    ? 'Memproses Dialektika AI...'
                                    : '✨ Isi Otomatis 4 Kolom dengan AI'}
                                </span>
                              </button>

                              <div className="flex items-center gap-1">
                                <span className="text-[11px] text-slate-500 font-medium">Status:</span>
                                <select
                                  value={item.status || 'Dalam Proses'}
                                  onChange={(e) =>
                                    handleUpdateItem(item.id, 'status', e.target.value as ProContraStatus)
                                  }
                                  className="text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="Dalam Proses">⏳ Dalam Proses</option>
                                  <option value="Terealisasi">✅ Terealisasi</option>
                                  <option value="Rencana Tindak Lanjut">📋 Rencana Tindak Lanjut</option>
                                </select>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                                title="Hapus Aspek Ini"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* 1. Aspek Supervisi */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[11px] font-bold text-slate-700">
                                1. Aspek Supervisi / Inovasi Akademik <span className="text-rose-500">*</span>
                              </label>
                              <span className="text-[10px] text-indigo-600 font-semibold hidden sm:inline">
                                Ketik topik di sini lalu klik tombol AI untuk menganalisis otomatis
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={item.aspek}
                                onChange={(e) => handleUpdateItem(item.id, 'aspek', e.target.value)}
                                placeholder="Misal: Pemanfaatan Papan Interaktif Digital (PID), Diferensiasi Pembelajaran, KSE, dll."
                                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => handleAIGenerate(item.id, 'all')}
                                disabled={loadingAIItemId === item.id}
                                className="px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                                title="Generate 4 Kolom Sekaligus dengan AI"
                              >
                                <Sparkles className={`w-3.5 h-3.5 text-indigo-600 ${loadingAIItemId === item.id && loadingAIField === 'all' ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Analisis AI</span>
                              </button>
                            </div>
                          </div>

                          {/* 2 & 3: Pro & Kontra Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200/80">
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[11px] font-extrabold text-emerald-800 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  2. Pro (Mendukung &amp; Manfaat Pembelajaran)
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleAIGenerate(item.id, 'pro')}
                                  disabled={loadingAIItemId === item.id}
                                  className="px-2.5 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                                  title="Isi otomatis bagian Pro dengan AI"
                                >
                                  <Sparkles className={`w-3 h-3 text-emerald-600 ${loadingAIItemId === item.id && loadingAIField === 'pro' ? 'animate-spin' : ''}`} />
                                  <span>
                                    {loadingAIItemId === item.id && loadingAIField === 'pro'
                                      ? 'Memproses...'
                                      : '✨ Isi Otomatis Pro'}
                                  </span>
                                </button>
                              </div>
                              <textarea
                                rows={3}
                                value={item.pro}
                                onChange={(e) => handleUpdateItem(item.id, 'pro', e.target.value)}
                                placeholder="Uraikan hal positif, keunggulan pedagogis, keterlibatan murid, dan capaian kompetensi..."
                                className="w-full p-2 bg-white border border-emerald-300 rounded-md text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                              />
                            </div>

                            <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-200/80">
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[11px] font-extrabold text-rose-800 flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                  3. Kontra (Keberatan Guru &amp; Kendala Lapangan)
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleAIGenerate(item.id, 'kontra')}
                                  disabled={loadingAIItemId === item.id}
                                  className="px-2.5 py-0.5 rounded-md bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                                  title="Isi otomatis bagian Kontra dengan AI"
                                >
                                  <Sparkles className={`w-3 h-3 text-rose-600 ${loadingAIItemId === item.id && loadingAIField === 'kontra' ? 'animate-spin' : ''}`} />
                                  <span>
                                    {loadingAIItemId === item.id && loadingAIField === 'kontra'
                                      ? 'Memproses...'
                                      : '✨ Isi Otomatis Kontra'}
                                  </span>
                                </button>
                              </div>
                              <textarea
                                rows={3}
                                value={item.kontra}
                                onChange={(e) => handleUpdateItem(item.id, 'kontra', e.target.value)}
                                placeholder="Uraikan beban kerja, keterbatasan sarana, kecemasan teknis, persepsi sulit guru..."
                                className="w-full p-2 bg-white border border-rose-300 rounded-md text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                              />
                            </div>
                          </div>

                          {/* 4 & 5: Analisis Dampak & Aksi Penyelesaian */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-200/80">
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[11px] font-extrabold text-amber-900 flex items-center gap-1">
                                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                                  4. Analisis Dampak (Jika Tidak Dimitigasi)
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleAIGenerate(item.id, 'analisisDampak')}
                                  disabled={loadingAIItemId === item.id}
                                  className="px-2.5 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                                  title="Isi otomatis bagian Analisis Dampak dengan AI"
                                >
                                  <Sparkles className={`w-3 h-3 text-amber-700 ${loadingAIItemId === item.id && loadingAIField === 'analisisDampak' ? 'animate-spin' : ''}`} />
                                  <span>
                                    {loadingAIItemId === item.id && loadingAIField === 'analisisDampak'
                                      ? 'Memproses...'
                                      : '✨ Isi Otomatis Dampak'}
                                  </span>
                                </button>
                              </div>
                              <textarea
                                rows={3}
                                value={item.analisisDampak}
                                onChange={(e) => handleUpdateItem(item.id, 'analisisDampak', e.target.value)}
                                placeholder="Dampak terhadap murid, mutu pembelajaran, dan motivasi kerja guru bila resistensi dibiarkan..."
                                className="w-full p-2 bg-white border border-amber-300 rounded-md text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                              />
                            </div>

                            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-200/80">
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[11px] font-extrabold text-blue-900 flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                  5. Aksi Penyelesaian (Langkah Solutif &amp; Mediasi Pengawas)
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleAIGenerate(item.id, 'aksiPenyelesaian')}
                                  disabled={loadingAIItemId === item.id}
                                  className="px-2.5 py-0.5 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-900 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                                  title="Isi otomatis bagian Aksi Solutif dengan AI"
                                >
                                  <Sparkles className={`w-3 h-3 text-blue-600 ${loadingAIItemId === item.id && loadingAIField === 'aksiPenyelesaian' ? 'animate-spin' : ''}`} />
                                  <span>
                                    {loadingAIItemId === item.id && loadingAIField === 'aksiPenyelesaian'
                                      ? 'Memproses...'
                                      : '✨ Isi Otomatis Solusi'}
                                  </span>
                                </button>
                              </div>
                              <textarea
                                rows={3}
                                value={item.aksiPenyelesaian}
                                onChange={(e) => handleUpdateItem(item.id, 'aksiPenyelesaian', e.target.value)}
                                placeholder="Langkah konkret pengawas dan kepala sekolah: pendampingan klinis, peer coaching di Kombel, penyederhanaan format..."
                                className="w-full p-2 bg-white border border-blue-300 rounded-md text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300">
                        <p className="text-xs text-slate-500">Tabel masih kosong. Klik Tambah Aspek atau gunakan chip preset di atas.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* TAB IDENTITAS: SATUAN PENDIDIKAN, KEPALA SEKOLAH, GURU & PENGAWAS */
                <div className="space-y-6">
                  {/* Informasi Utama */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Judul &amp; Informasi Pelaksanaan
                    </h4>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Judul Dokumen Matriks <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Tahun Pelajaran</label>
                        <input
                          type="text"
                          value={formData.academicYear}
                          onChange={(e) => setFormData((p) => ({ ...p, academicYear: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Semester</label>
                        <select
                          value={formData.semester}
                          onChange={(e) => setFormData((p) => ({ ...p, semester: e.target.value as any }))}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                        >
                          <option value="Ganjil">Semester Ganjil</option>
                          <option value="Genap">Semester Genap</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Supervisi</label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* IDENTITAS KEPALA SEKOLAH & SATUAN PENDIDIKAN DENGAN AUTO-SYNC & MANUAL FLEXIBLE */}
                  <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                        <School className="w-4 h-4 text-amber-700" />
                        Data Kepala Satuan Pendidikan (Terstandar)
                      </h4>
                      <span className="text-[11px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
                        Dropdown &amp; Fleksibel Manual
                      </span>
                    </div>

                    {/* Quick Sync Dropdown */}
                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 mb-1">
                        Pilih Cepat dari Data Kepala Sekolah Terdaftar:
                      </label>
                      <select
                        onChange={(e) => handlePrincipalSelect(e.target.value)}
                        defaultValue=""
                        className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="" disabled>
                          -- Pilih Kepala Sekolah untuk Auto-Sync --
                        </option>
                        {principals.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nama} ({p.satuanPendidikan})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Nama Lengkap &amp; Gelar Kepala Sekolah <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.headmasterName}
                          onChange={(e) => setFormData((p) => ({ ...p, headmasterName: e.target.value }))}
                          placeholder="contoh: Dra. Hj. Nurhasanah, M.Pd."
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          NIP / NIK Kepala Sekolah <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.headmasterNip}
                          onChange={(e) => setFormData((p) => ({ ...p, headmasterNip: e.target.value }))}
                          placeholder="contoh: 19720815 199802 2 003"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Satuan Pendidikan <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.schoolName}
                          onChange={(e) => setFormData((p) => ({ ...p, schoolName: e.target.value }))}
                          placeholder="UPT SD Negeri 4 Bilokka"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">NPSN Sekolah</label>
                        <input
                          type="text"
                          value={formData.schoolNpsn}
                          onChange={(e) => setFormData((p) => ({ ...p, schoolNpsn: e.target.value }))}
                          placeholder="40301824"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* IDENTITAS GURU SASARAN */}
                  <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-blue-700" />
                        Data Guru Sasaran Observasi / Perwakilan Pendidik
                      </h4>
                      <span className="text-[11px] text-blue-800 font-bold bg-blue-100 px-2 py-0.5 rounded">
                        Opsional / Spesifik
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-blue-900 mb-1">
                        Pilih dari Guru Terdaftar (Atau isi manual):
                      </label>
                      <select
                        onChange={(e) => handleTeacherSelect(e.target.value)}
                        defaultValue=""
                        className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Pilih Guru Terdaftar --</option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nama} — {t.mapel} ({t.satuanPendidikan})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Guru</label>
                        <input
                          type="text"
                          value={formData.teacherName}
                          onChange={(e) => setFormData((p) => ({ ...p, teacherName: e.target.value }))}
                          placeholder="Rahmatia, S.Pd"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">NIP Guru</label>
                        <input
                          type="text"
                          value={formData.teacherNip}
                          onChange={(e) => setFormData((p) => ({ ...p, teacherNip: e.target.value }))}
                          placeholder="19870412 201101 2 015"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                        <input
                          type="text"
                          value={formData.subject}
                          onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
                          placeholder="IPAS / Matematika / Tematik"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Fase / Kelas</label>
                        <input
                          type="text"
                          value={formData.gradeClass}
                          onChange={(e) => setFormData((p) => ({ ...p, gradeClass: e.target.value }))}
                          placeholder="Fase B / Kelas IV"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* IDENTITAS PENGAWAS PEMBINA */}
                  <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      Data Pengawas Pembina (Asesor)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Pengawas</label>
                        <input
                          type="text"
                          value={formData.supervisorName}
                          onChange={(e) => setFormData((p) => ({ ...p, supervisorName: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">NIP Pengawas</label>
                        <input
                          type="text"
                          value={formData.supervisorNip}
                          onChange={(e) => setFormData((p) => ({ ...p, supervisorNip: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Jabatan &amp; Pangkat</label>
                        <input
                          type="text"
                          value={formData.supervisorRank}
                          onChange={(e) => setFormData((p) => ({ ...p, supervisorRank: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Catatan Refleksi Pengawas */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Catatan Sintesis Refleksi Pengawas Pembina
                    </label>
                    <textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                      placeholder="Uraikan catatan umum mediasi dialektika supervisi, kesiapan guru, dan tindak lanjut kolaboratif..."
                      className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Bottom Submit Controls */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>

                <div className="flex items-center gap-2">
                  {activeTabForm === 'identity' ? (
                    <button
                      type="button"
                      onClick={() => setActiveTabForm('matrix')}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Lanjut ke Tabel Matriks</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveTabForm('identity')}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Pengaturan Identitas
                    </button>
                  )}

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Simpan Matriks Pro-Kontra
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DETAIL: TAMPILAN RESMI MATRIKS PRO-KONTRA          */}
      {/* ======================================================== */}
      {isDetailOpen && activeRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print print:hidden">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Detail Action Bar */}
            <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 no-print print:hidden">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-sm">Dokumen Matriks Pro-Kontra Supervisi Akademik</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportWord(activeRecord)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Ekspor Word (.doc)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePrint(activeRecord)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Preview Container inside Modal */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-100">
              <div className="bg-white p-6 sm:p-10 rounded-xl shadow-xs max-w-4xl mx-auto border border-slate-200 text-slate-900">
                {renderOfficialDocumentContent(activeRecord)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* ======================================================== */}
    {/* DEDICATED OFFICIAL PRINT CONTAINER (CETAK / PDF)         */}
    {/* ======================================================== */}
    {activeRecord && (
      <div id="printable-pro-contra-doc" className="hidden print:block text-slate-900 bg-white font-sans w-full">
        <div className="bg-white p-4 sm:p-8 max-w-4xl mx-auto border-none text-slate-900">
          {renderOfficialDocumentContent(activeRecord)}
        </div>
      </div>
    )}
  </>
  );
};
