/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save } from 'lucide-react';
import { Teacher } from '../types/inspiro';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teacherData: Omit<Teacher, 'id' | 'createdAt'>) => void;
  initialData?: Teacher | null;
  defaultSchoolName: string;
}

export const TeacherModal: React.FC<TeacherModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultSchoolName
}) => {
  const [nama, setNama] = useState('');
  const [nip, setNip] = useState('');
  const [mapel, setMapel] = useState('');
  const [kelas, setKelas] = useState('');
  const [satuanPendidikan, setSatuanPendidikan] = useState(defaultSchoolName);
  const [telepon, setTelepon] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setNama(initialData.nama);
      setNip(initialData.nip);
      setMapel(initialData.mapel);
      setKelas(initialData.kelas);
      setSatuanPendidikan(initialData.satuanPendidikan || defaultSchoolName);
      setTelepon(initialData.telepon || '');
      setEmail(initialData.email || '');
    } else {
      setNama('');
      setNip('');
      setMapel('');
      setKelas('');
      setSatuanPendidikan(defaultSchoolName);
      setTelepon('');
      setEmail('');
    }
    setErrors({});
  }, [initialData, isOpen, defaultSchoolName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!nama.trim()) newErrors.nama = 'Nama guru wajib diisi';
    if (!mapel.trim()) newErrors.mapel = 'Mata pelajaran wajib diisi';
    if (!kelas.trim()) newErrors.kelas = 'Kelas yang diampu wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      nama: nama.trim(),
      nip: nip.trim() || '-',
      mapel: mapel.trim(),
      kelas: kelas.trim(),
      satuanPendidikan: satuanPendidikan.trim() || defaultSchoolName,
      telepon: telepon.trim(),
      email: email.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {initialData ? 'Ubah Data Guru' : 'Tambah Guru Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Lengkapi identitas pendidik untuk sasaran supervisi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Nama Guru */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap & Gelar <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Siti Aminah, S.Pd., M.Pd."
              className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.nama ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
              }`}
            />
            {errors.nama && <p className="text-[11px] text-rose-500 mt-1">{errors.nama}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* NIP / NUPTK */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIP / NUPTK / NIK
              </label>
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="Contoh: 19890514 201101 2 008"
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
                value={mapel}
                onChange={(e) => setMapel(e.target.value)}
                placeholder="Contoh: Matematika / IPA"
                className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.mapel ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                }`}
              />
              {errors.mapel && <p className="text-[11px] text-rose-500 mt-1">{errors.mapel}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Kelas yang Diampu */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kelas yang Diampu <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                placeholder="Contoh: VII (Fase D) / Kelas 8-A"
                className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.kelas ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                }`}
              />
              {errors.kelas && <p className="text-[11px] text-rose-500 mt-1">{errors.kelas}</p>}
            </div>

            {/* Satuan Pendidikan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Satuan Pendidikan
              </label>
              <input
                type="text"
                value={satuanPendidikan}
                onChange={(e) => setSatuanPendidikan(e.target.value)}
                placeholder="Nama Sekolah"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* No Telepon */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                No. WhatsApp / Kontak
              </label>
              <input
                type="text"
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                placeholder="Contoh: 0812-xxxx-xxxx"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email Belajar.id */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email (Belajar.id / Resmi)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@guru.belajar.id"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Data</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
