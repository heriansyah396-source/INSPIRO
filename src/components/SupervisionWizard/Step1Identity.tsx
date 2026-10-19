/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserCheck, Calendar, BookOpen, Layers } from 'lucide-react';
import { SupervisionRecord, Teacher } from '../../types/inspiro';

interface Step1IdentityProps {
  data: SupervisionRecord['identity'];
  onChange: (field: keyof SupervisionRecord['identity'], value: string) => void;
  teachers: Teacher[];
  onSelectExistingTeacher: (teacher: Teacher) => void;
}

export const Step1Identity: React.FC<Step1IdentityProps> = ({
  data,
  onChange,
  teachers,
  onSelectExistingTeacher
}) => {
  return (
    <div className="space-y-6">
      {/* Intro info box */}
      <div className="p-4 bg-blue-50/70 border border-blue-200/70 rounded-xl text-xs text-blue-900 flex items-start gap-3">
        <UserCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-blue-950">Langkah 1: Identitas Pelaksanaan Supervisi</h4>
          <p className="mt-0.5 text-blue-800 leading-relaxed">
            Pilih pendidik yang akan diobservasi atau masukkan identitas manual. Data ini akan tercetak pada lembar instrumen formal dokumen kedinasan.
          </p>
        </div>
      </div>

      {/* Quick Teacher Selector */}
      {teachers.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Pilih Cepat dari Data Guru Terdaftar
          </label>
          <div className="flex flex-wrap gap-2">
            {teachers.map((t) => {
              const isSelected = data.namaGuru === t.nama;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectExistingTeacher(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {t.nama} <span className="opacity-75">({t.mapel})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Identity Form */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
        <div className="pb-3 border-b border-slate-100 flex items-center gap-2 text-slate-800 font-bold text-sm">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Identitas Guru & Mata Pelajaran</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Nama Guru */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Guru yang Disupervisi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={data.namaGuru}
              onChange={(e) => onChange('namaGuru', e.target.value)}
              placeholder="Contoh: Siti Rahmawati, M.Pd."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* NIP Guru */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              NIP / NIK Guru
            </label>
            <input
              type="text"
              value={data.nipGuru}
              onChange={(e) => onChange('nipGuru', e.target.value)}
              placeholder="19881120 201101 2 015"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* Mata Pelajaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mata Pelajaran <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={data.mapel}
              onChange={(e) => onChange('mapel', e.target.value)}
              placeholder="Contoh: Matematika"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Kelas & Semester */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kelas / Semester <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={data.kelasSemester}
              onChange={(e) => onChange('kelasSemester', e.target.value)}
              placeholder="Contoh: VII-B / Ganjil"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Materi Pokok */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Materi Pokok Pembelajaran <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={data.materiPokok}
              onChange={(e) => onChange('materiPokok', e.target.value)}
              placeholder="Contoh: Menulis Teks Eksplanasi Fenomena Alam Terkait Banjir"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Observation Focus & Schedule */}
        <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-slate-800 font-bold text-sm">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Fokus Observasi, Waktu & Jadwal Pelaksanaan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Hari / Tanggal */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hari & Tanggal Observasi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={data.hariTanggal}
              onChange={(e) => onChange('hariTanggal', e.target.value)}
              placeholder="Contoh: Senin, 6 Oktober 2026"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Jam Pelajaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jam Pelajaran / Alokasi Waktu
            </label>
            <input
              type="text"
              value={data.jamPelajaran}
              onChange={(e) => onChange('jamPelajaran', e.target.value)}
              placeholder="08.00 - 09.20 WIB (2 JP)"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Pilihan Siklus Supervisi (Siklus 1, 2, 3, Lanjutan) */}
          <div className="lg:col-span-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="block text-xs font-bold text-slate-800">
                Siklus Supervisi Akademik <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                Siklus Terpilih: <strong className="text-blue-700 font-bold">{data.siklus || 'Siklus 1'}</strong>
              </span>
            </div>

            {/* 4 Pilihan Tombol Interaktif Siklus */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                {
                  id: 'Siklus 1',
                  altId: 'Siklus I',
                  title: 'Siklus 1',
                  sub: 'Observasi Diagnostik Awal'
                },
                {
                  id: 'Siklus 2',
                  altId: 'Siklus II',
                  title: 'Siklus 2',
                  sub: 'Evaluasi Pasca-Bimbingan'
                },
                {
                  id: 'Siklus 3',
                  altId: 'Siklus III',
                  title: 'Siklus 3',
                  sub: 'Konsolidasi & Penguatan'
                },
                {
                  id: 'Siklus Lanjutan',
                  altId: 'Observasi Lanjutan',
                  title: 'Siklus Lanjutan',
                  sub: 'Pemantauan Khusus RTL'
                }
              ].map((item) => {
                const isSelected =
                  data.siklus === item.id ||
                  data.siklus === item.altId ||
                  (item.id === 'Siklus 1' && !data.siklus);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onChange('siklus', item.id)}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/30'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold tracking-tight">
                        {item.title}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-white shrink-0" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] mt-1.5 leading-tight ${
                        isSelected ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {item.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fokus Perilaku Target */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fokus Perilaku Target yang Diamati <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={data.fokusPerilaku}
              onChange={(e) => onChange('fokusPerilaku', e.target.value)}
              placeholder="Contoh: Penerapan Disiplin Positif (Keteraturan Suasana Kelas) & Instruksi yang Adaptif"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Merujuk pada fokus perilaku kinerja Platform Merdeka Mengajar (PMM) atau kesepakatan pra-observasi.
            </p>
          </div>
        </div>

        {/* Supervisor Identity */}
        <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-slate-800 font-bold text-sm">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Identitas Penilai / Supervisor & Sekolah</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Nama Supervisor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Supervisor <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={data.namaSupervisor}
              onChange={(e) => onChange('namaSupervisor', e.target.value)}
              placeholder="Nama Kepala Sekolah / Pengawas"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* NIP Supervisor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              NIP Supervisor
            </label>
            <input
              type="text"
              value={data.nipSupervisor}
              onChange={(e) => onChange('nipSupervisor', e.target.value)}
              placeholder="NIP Supervisor"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* Jabatan Supervisor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jabatan Penilai / Supervisor
            </label>
            <input
              type="text"
              list="role-options-step1"
              value={data.jabatanSupervisor}
              onChange={(e) => onChange('jabatanSupervisor', e.target.value)}
              placeholder="Contoh: Pengawas Sekolah"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
            <datalist id="role-options-step1">
              <option value="Pengawas Sekolah" />
              <option value="Pengawas Sekolah Pembina" />
              <option value="Kepala Sekolah" />
              <option value="Guru Senior / Penilai" />
            </datalist>
          </div>

          {/* Satuan Pendidikan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Satuan Pendidikan
            </label>
            <input
              type="text"
              value={data.satuanPendidikan}
              onChange={(e) => onChange('satuanPendidikan', e.target.value)}
              placeholder="Nama Sekolah"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
