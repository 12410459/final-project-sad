import React, { useState, useEffect } from "react";
import { bimbelApi } from "../../services/api";
import { LayoutGrid, UserPlus, PlusCircle, AlertCircle, CheckCircle2 } from "lucide-react";

export const KelasPenempatanFeature: React.FC = () => {
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [siswaList, setSiswaList] = useState<any[]>([]);
  const [masterData, setMasterData] = useState<{ programs: any[]; mapel: any[]; tutors: any[] }>({
    programs: [],
    mapel: [],
    tutors: [],
  });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedKelasId, setSelectedKelasId] = useState<string>("");

  // Create Form State
  const [namaKelas, setNamaKelas] = useState("");
  const [idProgram, setIdProgram] = useState("");
  const [idMapel, setIdMapel] = useState("");
  const [idTutorUtama, setIdTutorUtama] = useState("");

  // Assign Form State
  const [idSiswaToAssign, setIdSiswaToAssign] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [kelas, siswa, master] = await Promise.all([
        bimbelApi.getKelasList(),
        bimbelApi.getAllSiswa(),
        bimbelApi.getMasterData(),
      ]);
      setKelasList(kelas);
      setSiswaList(siswa);
      setMasterData(master);

      if (master.programs.length > 0 && !idProgram) setIdProgram(master.programs[0].id_program);
      if (master.mapel.length > 0 && !idMapel) setIdMapel(master.mapel[0].id_mapel);
      if (master.tutors.length > 0 && !idTutorUtama) setIdTutorUtama(master.tutors[0].id_tutor);
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateKelas = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bimbelApi.createKelas({
        nama_kelas: namaKelas,
        id_program: idProgram,
        id_mapel: idMapel,
        id_tutor_utama: idTutorUtama,
        kapasitas_maks: 8, // BR-02
      });
      setNotification({
        type: "success",
        message: `Kelas "${namaKelas}" berhasil dibuat dengan kapasitas 8 siswa. Status awal: MENUNGGU (belum mencapai 3 siswa).`,
      });
      setShowCreateModal(false);
      setNamaKelas("");
      loadData();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    }
  };

  const handleAssignSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idSiswaToAssign || !selectedKelasId) return;

    try {
      const res = await bimbelApi.assignSiswa({
        id_siswa: idSiswaToAssign,
        id_kelas: selectedKelasId,
      });

      setNotification({
        type: "info",
        message: res.pesan,
      });
      setShowAssignModal(false);
      setIdSiswaToAssign("");
      loadData();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <LayoutGrid className="w-6 h-6 text-brand-600" />
            <span>Pengelolaan Kelas & Penempatan Siswa (US-01, US-04)</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Aturan: Kelas baru berstatus <strong>BERJALAN</strong> jika memiliki minimal 3 siswa (BR-01). Kapasitas maksimal kelas adalah 8 siswa; siswa berikutnya masuk <strong>Daftar Tunggu</strong> (BR-02).
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buat Kelas Baru</span>
        </button>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl flex items-start space-x-3 text-sm ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : notification.type === "info"
              ? "bg-blue-50 text-blue-800 border border-blue-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Grid Kelas */}
      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">Memuat data kelas dan penempatan...</div>
      ) : kelasList.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-500">Belum ada kelas terdaftar.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kelasList.map((k) => {
            const count = k.jumlah_siswa || 0;
            const isRunning = count >= 3; // BR-01
            const isFull = count >= 8; // BR-02
            const pct = Math.min((count / 8) * 100, 100);

            return (
              <div
                key={k.id_kelas}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                      {k.program?.nama_program || "Program"}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isRunning
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {isRunning ? "BERJALAN (>=3 Siswa)" : "MENUNGGU (<3 Siswa)"}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{k.nama_kelas}</h3>
                  <div className="text-xs text-slate-500 mt-1">
                    Mapel: <span className="font-medium text-slate-700">{k.mapel?.nama_mapel}</span> | Tutor Utama:{" "}
                    <span className="font-medium text-slate-700">{k.tutor_utama?.nama_tutor}</span>
                  </div>

                  {/* Progress Kapasitas */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                      <span className="text-slate-600">Kapasitas Kelas (Maks 8):</span>
                      <span className={isFull ? "text-rose-600 font-bold" : "text-slate-900"}>
                        {count} / 8 Siswa {isFull && "(Penuh!)"}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isFull
                            ? "bg-rose-500"
                            : isRunning
                            ? "bg-brand-500"
                            : "bg-amber-400"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Daftar Siswa di Kelas */}
                  <div className="mt-4">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                      Siswa Terdaftar ({k.penempatan?.length || 0}):
                    </span>
                    {k.penempatan && k.penempatan.length > 0 ? (
                      <ul className="space-y-1.5">
                        {k.penempatan.map((p: any) => (
                          <li
                            key={p.id_penempatan}
                            className="text-xs bg-slate-50 px-2.5 py-1.5 rounded-lg flex items-center justify-between text-slate-700"
                          >
                            <span>{p.siswa?.nama_siswa}</span>
                            <span className="text-slate-400 text-[10px]">{p.tanggal_penempatan}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-xs text-slate-400 italic">Belum ada siswa ditempatkan.</div>
                    )}
                  </div>

                  {/* Daftar Tunggu jika ada */}
                  {k.daftar_tunggu && k.daftar_tunggu.length > 0 && (
                    <div className="mt-3 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                        Daftar Tunggu ({k.daftar_tunggu.length}):
                      </span>
                      <ul className="space-y-1">
                        {k.daftar_tunggu.map((w: any) => (
                          <li key={w.id_penempatan} className="text-xs text-amber-700 flex justify-between">
                            <span>{w.siswa?.nama_siswa}</span>
                            <span className="text-amber-600 font-medium">(Antrean)</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Tombol Aksi */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setSelectedKelasId(k.id_kelas);
                      setShowAssignModal(true);
                    }}
                    className="w-full inline-flex items-center justify-center space-x-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-medium py-2 px-3 rounded-xl text-xs transition"
                  >
                    <UserPlus className="w-4 h-4 text-brand-600" />
                    <span>Tempatkan Siswa ke Kelas Ini</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Buat Kelas Baru */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-4">Buat Kelas Bimbingan Baru</h3>
            <form onSubmit={handleCreateKelas} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Kelas
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Matematika SD Kelas 6-B"
                  value={namaKelas}
                  onChange={(e) => setNamaKelas(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Jenjang / Program
                </label>
                <select
                  value={idProgram}
                  onChange={(e) => setIdProgram(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {masterData.programs.map((p) => (
                    <option key={p.id_program} value={p.id_program}>
                      {p.nama_program}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Mata Pelajaran
                </label>
                <select
                  value={idMapel}
                  onChange={(e) => setIdMapel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {masterData.mapel.map((m) => (
                    <option key={m.id_mapel} value={m.id_mapel}>
                      {m.nama_mapel}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tutor Utama Penanggung Jawab
                </label>
                <select
                  value={idTutorUtama}
                  onChange={(e) => setIdTutorUtama(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {masterData.tutors.map((t) => (
                    <option key={t.id_tutor} value={t.id_tutor}>
                      {t.nama_tutor}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white transition shadow-sm"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tempatkan Siswa */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-2">Tempatkan Siswa ke Kelas</h3>
            <p className="text-xs text-slate-500 mb-4">
              Pilih siswa terdaftar untuk dimasukkan ke kelas terpilih. Bila kapasitas kelas sudah mencapai 8 siswa, sistem akan menempatkan siswa pada daftar tunggu secara otomatis.
            </p>

            <form onSubmit={handleAssignSiswa} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Pilih Siswa
                </label>
                <select
                  required
                  value={idSiswaToAssign}
                  onChange={(e) => setIdSiswaToAssign(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {siswaList.map((s) => (
                    <option key={s.id_siswa} value={s.id_siswa}>
                      {s.nama_siswa} ({s.program?.nama_program} - {s.status_siswa})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!idSiswaToAssign}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white transition shadow-sm disabled:opacity-50"
                >
                  Konfirmasi Penempatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
