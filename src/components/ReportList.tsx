/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Edit2,
  Printer,
  Trash2,
  CheckCircle2,
  Clock,
  Plus,
  School,
  Compass
} from 'lucide-react';
import { SupervisionRecord, Teacher } from '../types/inspiro';
import { TeacherRadarModal } from './TeacherRadarModal';

interface ReportListProps {
  supervisions: SupervisionRecord[];
  onViewDetail: (id: string) => void;
  onEditSupervision: (id: string) => void;
  onPrintReport: (id: string) => void;
  onDeleteSupervision: (supervision: SupervisionRecord) => void;
  onStartNewSupervision: () => void;
}

export const ReportList: React.FC<ReportListProps> = ({
  supervisions,
  onViewDetail,
  onEditSupervision,
  onPrintReport,
  onDeleteSupervision,
  onStartNewSupervision
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'selesai' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');
  const [selectedSupervisionForRadar, setSelectedSupervisionForRadar] = useState<SupervisionRecord | null>(null);
  const [isRadarOpen, setIsRadarOpen] = useState(false);

  const availableSchools = useMemo(() => {
    const set = new Set<string>();
    supervisions.forEach((s) => {
      if (s.identity.satuanPendidikan) {
        set.add(s.identity.satuanPendidikan);
      }
    });
    return Array.from(set);
  }, [supervisions]);

  const filteredSupervisions = useMemo(() => {
    return supervisions.filter((item) => {
      const matchSearch =
        item.identity.namaGuru.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.identity.mapel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.identity.satuanPendidikan && item.identity.satuanPendidikan.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.identity.namaSupervisor && item.identity.namaSupervisor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.identity.nipGuru && item.identity.nipGuru.includes(searchTerm));

      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchCategory =
        categoryFilter === 'all' || item.category === categoryFilter;
      const matchSchool =
        schoolFilter === 'all' || item.identity.satuanPendidikan === schoolFilter;

      return matchSearch && matchStatus && matchCategory && matchSchool;
    });
  }, [supervisions, searchTerm, statusFilter, categoryFilter, schoolFilter]);

  return (
    <div className="space-y-5">
      {/* Top Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Daftar Laporan Supervisi Akademik</span>
            </h2>
            <p className="text-xs text-slate-500">
              Dokumentasi penilaian observasi kelas, refleksi, dan rencana tindak lanjut
            </p>
          </div>
          <button
            onClick={onStartNewSupervision}
            className="flex items-center justify-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Mulai Supervisi Baru</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-slate-100">
          <div className="relative sm:col-span-5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari guru, NIP, sekolah, atau mapel..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
            >
              <option value="all">Semua Status</option>
              <option value="selesai">Selesai (Siap Cetak)</option>
              <option value="draft">Draft (Belum Selesai)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
            >
              <option value="all">Semua Kategori</option>
              <option value="Amat Baik (SB)">Amat Baik (SB)</option>
              <option value="Baik (B)">Baik (B)</option>
              <option value="Cukup (C)">Cukup (C)</option>
              <option value="Kurang (K)">Kurang (K)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
            >
              <option value="all">Semua Sekolah Binaan</option>
              {availableSchools.map((sch) => (
                <option key={sch} value={sch}>
                  {sch}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredSupervisions.length === 0 ? (
          <div className="p-10 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-800">Tidak ada laporan ditemukan</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Sesuaikan kata kunci pencarian atau buat supervisi baru untuk menambah laporan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Guru & NIP</th>
                  <th className="py-3 px-4 font-semibold">Mata Pelajaran</th>
                  <th className="py-3 px-4 font-semibold">Tanggal & Siklus</th>
                  <th className="py-3 px-4 font-semibold">Total Skor</th>
                  <th className="py-3 px-4 font-semibold">Nilai Akhir</th>
                  <th className="py-3 px-4 font-semibold">Kategori</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi Dokumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSupervisions.map((item) => {
                  const isCompleted = item.status === 'selesai';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{item.identity.namaGuru}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          NIP: {item.identity.nipGuru || '-'}
                        </div>
                        {item.identity.satuanPendidikan && (
                          <div className="text-[10px] text-blue-700 font-semibold flex items-center gap-1 mt-0.5">
                            <School className="w-3 h-3 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[200px]">{item.identity.satuanPendidikan}</span>
                          </div>
                        )}
                        {item.identity.namaSupervisor && (
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                            Penilai: {item.identity.namaSupervisor} ({item.identity.jabatanSupervisor || 'Supervisor'})
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800">{item.identity.mapel}</span>
                        <div className="text-[11px] text-slate-400">{item.identity.kelasSemester}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        <div>{item.identity.hariTanggal}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{item.identity.siklus}</div>
                      </td>
                      <td className="py-3.5 px-4 tabular-nums font-medium text-slate-700">
                        {item.totalScore} / 48
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-bold text-blue-700 tabular-nums">
                          {item.finalScore}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            item.category === 'Amat Baik (SB)'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.category === 'Baik (B)'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : item.category === 'Cukup (C)'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Selesai</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Draft</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Visualisasi Radar Guru */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSupervisionForRadar(item);
                              setIsRadarOpen(true);
                            }}
                            className="p-1.5 text-cyan-600 hover:text-cyan-800 hover:bg-cyan-50 rounded-md transition-colors cursor-pointer"
                            title="Buka Visualisasi Radar Guru Ini"
                          >
                            <Compass className="w-4 h-4 text-cyan-600" />
                          </button>

                          {/* Lihat Detail */}
                          <button
                            onClick={() => onViewDetail(item.id)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Lihat Detail & Analisis"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Cetak Resmi */}
                          <button
                            onClick={() => onPrintReport(item.id)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Cetak Laporan Format Resmi / PDF"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEditSupervision(item.id)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Ubah Data Supervisi"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Hapus */}
                          <button
                            onClick={() => onDeleteSupervision(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Hapus Laporan"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Teacher Radar Modal */}
      <TeacherRadarModal
        isOpen={isRadarOpen}
        onClose={() => {
          setIsRadarOpen(false);
          setSelectedSupervisionForRadar(null);
        }}
        teacher={
          selectedSupervisionForRadar
            ? {
                id: selectedSupervisionForRadar.teacherId,
                nama: selectedSupervisionForRadar.identity.namaGuru,
                nip: selectedSupervisionForRadar.identity.nipGuru || '',
                mapel: selectedSupervisionForRadar.identity.mapel,
                kelas: selectedSupervisionForRadar.identity.kelasSemester,
                satuanPendidikan: selectedSupervisionForRadar.identity.satuanPendidikan,
                createdAt: selectedSupervisionForRadar.createdAt
              }
            : null
        }
        supervision={selectedSupervisionForRadar}
        onViewDetail={onViewDetail}
      />
    </div>
  );
};
