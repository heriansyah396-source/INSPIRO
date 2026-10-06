/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Edit2,
  Trash2,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  Filter
} from 'lucide-react';
import { SupervisionRecord, Teacher } from '../types/inspiro';

interface TeacherListProps {
  teachers: Teacher[];
  supervisions: SupervisionRecord[];
  onAddTeacher: () => void;
  onEditTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (teacher: Teacher) => void;
  onStartSupervision: (teacherId: string) => void;
  onViewTeacherSupervisions: (teacherId: string) => void;
}

export const TeacherList: React.FC<TeacherListProps> = ({
  teachers,
  supervisions,
  onAddTeacher,
  onEditTeacher,
  onDeleteTeacher,
  onStartSupervision,
  onViewTeacherSupervisions
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMapel, setSelectedMapel] = useState<string>('all');

  // Unique mapels for filtering
  const mapelOptions = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach((t) => {
      if (t.mapel) set.add(t.mapel);
    });
    return Array.from(set).sort();
  }, [teachers]);

  // Map each teacher to latest supervision
  const teacherStatusMap = useMemo(() => {
    const map = new Map<string, SupervisionRecord>();
    supervisions.forEach((sup) => {
      const existing = map.get(sup.teacherId);
      if (!existing || new Date(sup.updatedAt) > new Date(existing.updatedAt)) {
        map.set(sup.teacherId, sup);
      }
    });
    return map;
  }, [supervisions]);

  // Filtered teachers
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchSearch =
        t.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.mapel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.kelas.toLowerCase().includes(searchTerm.toLowerCase());

      const matchMapel = selectedMapel === 'all' || t.mapel === selectedMapel;

      return matchSearch && matchMapel;
    });
  }, [teachers, searchTerm, selectedMapel]);

  return (
    <div className="space-y-5">
      {/* Top action & filter bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Daftar Guru Binaan</span>
            </h2>
            <p className="text-xs text-slate-500">
              Total {teachers.length} guru terdaftar untuk pelaksanaan observasi Kurikulum Merdeka
            </p>
          </div>
          <button
            onClick={onAddTeacher}
            className="flex items-center justify-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Guru Baru</span>
          </button>
        </div>

        {/* Search & Filter row */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-slate-100">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan nama guru, NIP, mapel, atau kelas..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedMapel}
              onChange={(e) => setSelectedMapel(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Semua Mata Pelajaran</option>
              {mapelOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table view */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredTeachers.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-800">Tidak ada guru ditemukan</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm || selectedMapel !== 'all'
                ? 'Coba sesuaikan kata kunci pencarian atau filter mata pelajaran Anda.'
                : 'Belum ada data guru. Klik tombol Tambah Guru Baru untuk mendaftarkan pendidik.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedMapel('all');
                }}
                className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
              >
                Reset Pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Nama Pendidik & NIP</th>
                  <th className="py-3 px-4 font-semibold">Mata Pelajaran</th>
                  <th className="py-3 px-4 font-semibold">Kelas yang Diampu</th>
                  <th className="py-3 px-4 font-semibold">Status Supervisi</th>
                  <th className="py-3 px-4 font-semibold">Nilai Terakhir</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((teacher) => {
                  const latestSup = teacherStatusMap.get(teacher.id);
                  const isCompleted = latestSup?.status === 'selesai';
                  const isDraft = latestSup?.status === 'draft';

                  return (
                    <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{teacher.nama}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          NIP: {teacher.nip || '-'}
                        </div>
                        {teacher.email && (
                          <div className="text-[10px] text-slate-400 mt-0.5">{teacher.email}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800">{teacher.mapel}</span>
                        <div className="text-[11px] text-slate-400">{teacher.satuanPendidikan}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {teacher.kelas}
                      </td>
                      <td className="py-3.5 px-4">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Sudah Disupervisi</span>
                          </span>
                        ) : isDraft ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Proses / Draft</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Belum Ada Jadwal</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {latestSup && isCompleted ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm tabular-nums">
                              {latestSup.finalScore}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                latestSup.category === 'Amat Baik (SB)'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : latestSup.category === 'Baik (B)'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : latestSup.category === 'Cukup (C)'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {latestSup.category}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Mulai Supervisi */}
                          <button
                            onClick={() => onStartSupervision(teacher.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                            title="Mulai Supervisi Guru Ini"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                            <span>Supervisi</span>
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEditTeacher(teacher)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                            title="Ubah Data Guru"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Hapus */}
                          <button
                            onClick={() => onDeleteTeacher(teacher)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Hapus Guru"
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
