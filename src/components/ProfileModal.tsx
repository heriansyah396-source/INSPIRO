/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, User, Save, School, Award } from 'lucide-react';
import { AppSettings } from '../types/inspiro';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (updated: AppSettings) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave
}) => {
  const [supervisorName, setSupervisorName] = useState(settings.supervisorName);
  const [supervisorNip, setSupervisorNip] = useState(settings.supervisorNip);
  const [supervisorRole, setSupervisorRole] = useState(settings.supervisorRole);
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [schoolCity, setSchoolCity] = useState(settings.schoolCity);

  useEffect(() => {
    if (isOpen) {
      setSupervisorName(settings.supervisorName);
      setSupervisorNip(settings.supervisorNip);
      setSupervisorRole(settings.supervisorRole);
      setSchoolName(settings.schoolName);
      setSchoolCity(settings.schoolCity);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...settings,
      supervisorName: supervisorName.trim() || 'Supervisor Akademik',
      supervisorNip: supervisorNip.trim() || '-',
      supervisorRole: supervisorRole.trim() || 'Pengawas Sekolah',
      schoolName: schoolName.trim() || 'Satuan Pendidikan',
      schoolCity: schoolCity.trim() || 'Kota'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Profil Pengawas / Kepala Sekolah
              </h3>
              <p className="text-xs text-slate-500">
                Sesuaikan nama dan data pejabat penilai supervisi
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
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap & Gelar Anda <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={supervisorName}
              onChange={(e) => setSupervisorName(e.target.value)}
              placeholder="Contoh: Heriansyah, S.Pd., M.Pd."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Nama ini akan otomatis tercantum pada setiap instrumen supervisi dan lembar tanda tangan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIP / NUPTK / NIK
              </label>
              <input
                type="text"
                value={supervisorNip}
                onChange={(e) => setSupervisorNip(e.target.value)}
                placeholder="1985xxxx xxxxx x xxx"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jabatan Anda <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                list="role-options-profile"
                value={supervisorRole}
                onChange={(e) => setSupervisorRole(e.target.value)}
                placeholder="Contoh: Pengawas Sekolah"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                required
              />
              <datalist id="role-options-profile">
                <option value="Pengawas Sekolah" />
                <option value="Pengawas Sekolah Pembina" />
                <option value="Kepala Sekolah" />
                <option value="Wakil Kepala Sekolah / Tim Supervisi" />
                <option value="Guru Senior / Penilai" />
              </datalist>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['Pengawas Sekolah', 'Kepala Sekolah', 'Guru Senior'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSupervisorRole(r)}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                      supervisorRole === r
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Sekolah / Satuan Pendidikan
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Contoh: SMP Negeri 1..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kabupaten / Kota
              </label>
              <input
                type="text"
                value={schoolCity}
                onChange={(e) => setSchoolCity(e.target.value)}
                placeholder="Contoh: Jakarta / Surabaya / Bandung"
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
              <span>Simpan Profil Saya</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
