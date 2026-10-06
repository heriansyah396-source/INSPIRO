/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ListChecks,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { FollowUpPlanItem } from '../../types/inspiro';

interface Step5FollowUpPlanProps {
  items: FollowUpPlanItem[];
  onChange: (items: FollowUpPlanItem[]) => void;
}

const TEMPLATE_RTL = [
  {
    fokusAspek: 'Optimalisasi Pembelajaran Berdiferensiasi',
    rencanaKegiatan: 'Mengikuti Pelatihan Mandiri Topik Diferensiasi Pembelajaran di PMM dan menyusun LKPD berjenjang 3 level.',
    waktuTarget: '2 Pekan (Pertemuan MGMP berikutnya)',
    kriteriaKeberhasilan: 'Modul ajar dilengkapi LKPD diferensiasi proses & konten yang terverifikasi.'
  },
  {
    fokusAspek: 'Asesmen Formatif & Pemanfaatan Umpan Balik',
    rencanaKegiatan: 'Menerapkan instrumen exit ticket singkat 2 menit di akhir sesi dan mendokumentasikan jurnal refleksi belajar siswa.',
    waktuTarget: '1 Pekan ke depan',
    kriteriaKeberhasilan: '100% peserta didik mengisi exit ticket pada setiap akhir pertemuan.'
  },
  {
    fokusAspek: 'Penerapan Disiplin Positif & Restitusi',
    rencanaKegiatan: 'Memperbarui kesepakatan/keyakinan kelas secara partisipatif bersama murid dan menerapkan segitiga restitusi.',
    waktuTarget: 'Awal pekan depan',
    kriteriaKeberhasilan: 'Poster keyakinan kelas terpasang dan disepakati tanpa sanksi hukuman fisik/verbal.'
  },
  {
    fokusAspek: 'Pemanfaatan Media Pembelajaran Digital / TPACK',
    rencanaKegiatan: 'Membuat presentasi visual interaktif menggunakan Canva for Education dan kuis interaktif Quizizz.',
    waktuTarget: 'Pertemuan sesi berikutnya',
    kriteriaKeberhasilan: 'Murid terlibat aktif dan hasil kuis pemahaman materi terdokumentasi real-time.'
  }
];

export const Step5FollowUpPlan: React.FC<Step5FollowUpPlanProps> = ({
  items,
  onChange
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftFokus, setDraftFokus] = useState('');
  const [draftKegiatan, setDraftKegiatan] = useState('');
  const [draftWaktu, setDraftWaktu] = useState('');
  const [draftKriteria, setDraftKriteria] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddItem = (preset?: typeof TEMPLATE_RTL[0]) => {
    const newItem: FollowUpPlanItem = preset
      ? {
          id: `rtl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          fokusAspek: preset.fokusAspek,
          rencanaKegiatan: preset.rencanaKegiatan,
          waktuTarget: preset.waktuTarget,
          kriteriaKeberhasilan: preset.kriteriaKeberhasilan
        }
      : {
          id: `rtl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          fokusAspek: draftFokus.trim() || 'Peningkatan Kompetensi Pedagogik',
          rencanaKegiatan: draftKegiatan.trim() || 'Belajar mandiri dan praktik di kelas',
          waktuTarget: draftWaktu.trim() || '1 Bulan',
          kriteriaKeberhasilan: draftKriteria.trim() || 'Terlaksana sesuai target'
        };

    onChange([...items, newItem]);
    setShowAddForm(false);
    setDraftFokus('');
    setDraftKegiatan('');
    setDraftWaktu('');
    setDraftKriteria('');
  };

  const handleStartEdit = (item: FollowUpPlanItem) => {
    setEditingId(item.id);
    setDraftFokus(item.fokusAspek);
    setDraftKegiatan(item.rencanaKegiatan);
    setDraftWaktu(item.waktuTarget);
    setDraftKriteria(item.kriteriaKeberhasilan);
  };

  const handleSaveEdit = (id: string) => {
    const updated = items.map((it) => {
      if (it.id === id) {
        return {
          ...it,
          fokusAspek: draftFokus.trim(),
          rencanaKegiatan: draftKegiatan.trim(),
          waktuTarget: draftWaktu.trim(),
          kriteriaKeberhasilan: draftKriteria.trim()
        };
      }
      return it;
    });
    onChange(updated);
    setEditingId(null);
  };

  const handleDeleteItem = (id: string) => {
    onChange(items.filter((it) => it.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Intro info box */}
      <div className="p-4 bg-blue-50/70 border border-blue-200/70 rounded-xl text-xs text-blue-950 flex items-start gap-3">
        <ListChecks className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-blue-950">
            Langkah 5: Rencana Tindak Lanjut (RTL) Supervisi
          </h4>
          <p className="mt-0.5 text-blue-900 leading-relaxed">
            Rumusan komitmen nyata guru dan kesepakatan pembinaan dari supervisor untuk perbaikan pembelajaran.
            RTL ini menjadi dasar evaluasi pada siklus supervisi akademik berikutnya.
          </p>
        </div>
      </div>

      {/* Quick Templates Selector */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Template RTL Kurikulum Merdeka (Klik untuk Tambah Cepat)</span>
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TEMPLATE_RTL.map((tpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAddItem(tpl)}
              className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-xs group cursor-pointer"
            >
              <div className="font-semibold text-slate-800 group-hover:text-blue-700 flex items-center justify-between">
                <span>{tpl.fokusAspek}</span>
                <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                {tpl.rencanaKegiatan}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* RTL Dynamic Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Daftar Rencana Tindak Lanjut ({items.length} Rencana)
            </h3>
            <p className="text-xs text-slate-500">
              Target perbaikan yang disepakati bersama antara guru dan supervisor
            </p>
          </div>
          {!showAddForm && (
            <button
              type="button"
              onClick={() => {
                setShowAddForm(true);
                setDraftFokus('');
                setDraftKegiatan('');
                setDraftWaktu('');
                setDraftKriteria('');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah RTL Manual</span>
            </button>
          )}
        </div>

        {/* Add Form Inline */}
        {showAddForm && (
          <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">
              Formulir Tambah Rencana Tindak Lanjut Baru
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Fokus Aspek Perbaikan
                </label>
                <input
                  type="text"
                  value={draftFokus}
                  onChange={(e) => setDraftFokus(e.target.value)}
                  placeholder="Contoh: Manajemen Waktu Sesi Penutup"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Waktu / Target Penyelesaian
                </label>
                <input
                  type="text"
                  value={draftWaktu}
                  onChange={(e) => setDraftWaktu(e.target.value)}
                  placeholder="Contoh: 2 Pekan (20 Oktober 2026)"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Rencana Kegiatan Nyata
                </label>
                <textarea
                  rows={2}
                  value={draftKegiatan}
                  onChange={(e) => setDraftKegiatan(e.target.value)}
                  placeholder="Langkah konkret yang akan dilakukan..."
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Kriteria Keberhasilan
                </label>
                <textarea
                  rows={2}
                  value={draftKriteria}
                  onChange={(e) => setDraftKriteria(e.target.value)}
                  placeholder="Bukti atau indikator tercapainya perbaikan..."
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleAddItem()}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs"
              >
                Simpan Item RTL
              </button>
            </div>
          </div>
        )}

        {/* Table rows */}
        {items.length === 0 ? (
          <div className="p-8 text-center">
            <ListChecks className="w-9 h-9 text-slate-300 mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-slate-700">Belum ada Rencana Tindak Lanjut</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Klik salah satu template di atas atau klik tombol "+ Tambah RTL Manual".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold w-12 text-center">No</th>
                  <th className="py-2.5 px-4 font-semibold w-1/4">Fokus Aspek Perbaikan</th>
                  <th className="py-2.5 px-4 font-semibold w-1/3">Rencana Kegiatan Nyata</th>
                  <th className="py-2.5 px-4 font-semibold w-36">Waktu / Target</th>
                  <th className="py-2.5 px-4 font-semibold">Kriteria Keberhasilan</th>
                  <th className="py-2.5 px-4 font-semibold w-20 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => {
                  const isEditing = editingId === item.id;

                  if (isEditing) {
                    return (
                      <tr key={item.id} className="bg-blue-50/50">
                        <td className="py-3 px-4 font-bold text-center text-slate-500">{index + 1}</td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={draftFokus}
                            onChange={(e) => setDraftFokus(e.target.value)}
                            className="w-full p-1.5 text-xs border rounded bg-white"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <textarea
                            rows={2}
                            value={draftKegiatan}
                            onChange={(e) => setDraftKegiatan(e.target.value)}
                            className="w-full p-1.5 text-xs border rounded bg-white"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={draftWaktu}
                            onChange={(e) => setDraftWaktu(e.target.value)}
                            className="w-full p-1.5 text-xs border rounded bg-white"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <textarea
                            rows={2}
                            value={draftKriteria}
                            onChange={(e) => setDraftKriteria(e.target.value)}
                            className="w-full p-1.5 text-xs border rounded bg-white"
                          />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(item.id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-100 rounded"
                              title="Simpan"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1 text-slate-400 hover:bg-slate-200 rounded"
                              title="Batal"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center font-bold text-slate-400">{index + 1}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{item.fokusAspek}</td>
                      <td className="py-3 px-4 text-slate-600 leading-relaxed">{item.rencanaKegiatan}</td>
                      <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">{item.waktuTarget}</td>
                      <td className="py-3 px-4 text-slate-600 leading-relaxed">{item.kriteriaKeberhasilan}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit RTL"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Hapus RTL"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
