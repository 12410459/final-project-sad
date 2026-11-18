import React, { useState, useEffect } from "react";
import { bimbelApi } from "../../services/api";
import { BookOpen, AlertCircle, CheckCircle2, Calendar } from "lucide-react";

export const SesiAbsensiFeature: React.FC = () => {
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [sesiList, setSesiList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State
  const [idKelas, setIdKelas] = useState("");
  const [tanggalSesi, setTanggalSesi] = useState(new Date().toISOString().split("T")[0]);
  const [idTutorPengampu, setIdTutorPengampu] = useState("");
  const [statusSesi, setStatusSesi] = useState<"BERLANGSUNG" | "BATAL">("BERLANGSUNG");
  const [studentsInClass, setStudentsInClass] = useState<any[]>([]);
  const [absensiMap, setAbsensiMap] = useState<Record<string, "HADIR" | "TIDAK_HADIR" | "IZIN" | "SAKIT">>({});
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [kelas, master, sesi] = await Promise.all([
        bimbelApi.getKelasList(),
        bimbelApi.getMasterData(),
        bimbelApi.getSesiList(),
      ]);
      setKelasList(kelas);
      setTutors(master.tutors);
      setSesiList(sesi);

      if (kelas.length > 0 && !idKelas) {
        selectClass(kelas[0]);
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const selectClass = (k: any) => {
    setIdKelas(k.id_kelas);
    setIdTutorPengampu(k.id_tutor_utama); // default tutor utama
    const placedStudents = (k.penempatan || [])
      .filter((p: any) => p.status_penempatan === "DITEMPATKAN")
      .map((p: any) => p.siswa);
    setStudentsInClass(placedStudents);

    // Initial absensi state
    const initialMap: Record<string, "HADIR" | "TIDAK_HADIR" | "IZIN" | "SAKIT"> = {};
    placedStudents.forEach((s: any) => {
      initialMap[s.id_siswa] = "HADIR";
    });
    setAbsensiMap(initialMap);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleKelasChange = (targetId: string) => {
    const k = kelasList.find((item) => item.id_kelas === targetId);
    if (k) {
      selectClass(k);
    }
  };

  const handleStatusKehadiranChange = (idSiswa: string, status: "HADIR" | "TIDAK_HADIR" | "IZIN" | "SAKIT") => {
    setAbsensiMap((prev) => ({ ...prev, [idSiswa]: status }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification(null);

    try {
      const absensiList = Object.entries(absensiMap).map(([id_siswa, status_kehadiran]) => ({
        id_siswa,
        status_kehadiran,
      }));

      await bimbelApi.createSesi({
        id_kelas: idKelas,
        id_tutor_pengampu: idTutorPengampu,
        tanggal_sesi: tanggalSesi,
        status_sesi: statusSesi,
        absensi_list: statusSesi === "BERLANGSUNG" ? absensiList : [],
      });

      setNotification({
        type: "success",
        message: "Catatan sesi pertemuan dan absensi siswa berhasil disimpan!",
      });

      // Reload
      const updatedSesi = await bimbelApi.getSesiList();
      setSesiList(updatedSesi);
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedKelas = kelasList.find((k) => k.id_kelas === idKelas);
  const isTutorPengganti = selectedKelas && selectedKelas.id_tutor_utama !== idTutorPengampu;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-brand-600" />
          <span>Pencatatan Sesi & Absensi Siswa (US-06)</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Tutor mencatat status pertemuan (Berlangsung / Batal) dan presensi siswa. Bila tutor utama berhalangan, tutor pengganti dapat dipilih dan honor sesi akan diberikan kepada tutor pengampu aktual (BR-08).
        </p>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl flex items-start space-x-3 text-sm ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulir Sesi & Absensi */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-900 text-base mb-4 flex items-center space-x-2">
            <span>Catat Sesi Pertemuan</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Pilih Kelas
              </label>
              <select
                value={idKelas}
                onChange={(e) => handleKelasChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {kelasList.map((k) => (
                  <option key={k.id_kelas} value={k.id_kelas}>
                    {k.nama_kelas}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tanggal Sesi
              </label>
              <input
                type="date"
                required
                value={tanggalSesi}
                onChange={(e) => setTanggalSesi(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tutor Pengampu Aktual
              </label>
              <select
                value={idTutorPengampu}
                onChange={(e) => setIdTutorPengampu(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {tutors.map((t) => (
                  <option key={t.id_tutor} value={t.id_tutor}>
                    {t.nama_tutor}
                  </option>
                ))}
              </select>
              {isTutorPengganti && (
                <div className="mt-2 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  ⚠️ <strong>Tutor Pengganti:</strong> Sesuai <strong>BR-08</strong>, honor sesi Rp75.000 untuk pertemuan ini akan diberikan kepada tutor pengampu aktual, tanpa menimpa tutor utama kelas.
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Status Pertemuan
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatusSesi("BERLANGSUNG")}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition ${
                    statusSesi === "BERLANGSUNG"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  BERLANGSUNG (BR-07)
                </button>
                <button
                  type="button"
                  onClick={() => setStatusSesi("BATAL")}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition ${
                    statusSesi === "BATAL"
                      ? "bg-rose-50 border-rose-300 text-rose-800 font-semibold"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  BATAL (BR-09)
                </button>
              </div>
            </div>

            {/* Presensi Siswa */}
            {statusSesi === "BERLANGSUNG" && (
              <div className="pt-3 border-t border-slate-100">
                <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Presensi Siswa ({studentsInClass.length} Siswa):
                </span>
                {studentsInClass.length === 0 ? (
                  <div className="text-xs text-slate-400 italic">Belum ada siswa di kelas ini.</div>
                ) : (
                  <div className="space-y-2">
                    {studentsInClass.map((s) => (
                      <div
                        key={s.id_siswa}
                        className="bg-slate-50 p-2.5 rounded-xl flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-slate-800">{s.nama_siswa}</span>
                        <select
                          value={absensiMap[s.id_siswa] || "HADIR"}
                          onChange={(e) =>
                            handleStatusKehadiranChange(
                              s.id_siswa,
                              e.target.value as "HADIR" | "TIDAK_HADIR" | "IZIN" | "SAKIT"
                            )
                          }
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-brand-500"
                        >
                          <option value="HADIR">Hadir</option>
                          <option value="TIDAK_HADIR">Tidak Hadir (Absen)</option>
                          <option value="IZIN">Izin</option>
                          <option value="SAKIT">Sakit</option>
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-4 bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition shadow-sm disabled:opacity-50"
            >
              {submitting ? "Menyimpan Sesi..." : "Simpan Sesi & Absensi"}
            </button>
          </form>
        </div>

        {/* Riwayat Sesi Pertemuan */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-900 text-base mb-4 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Riwayat Sesi & Absensi ({sesiList.length})</span>
          </h3>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">Memuat riwayat sesi...</div>
          ) : sesiList.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">Belum ada sesi tercatat.</div>
          ) : (
            <div className="space-y-4">
              {sesiList.map((ses) => (
                <div
                  key={ses.id_sesi}
                  className="border border-slate-200 rounded-2xl p-4 hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">
                        {ses.kelas?.nama_kelas || "Kelas"}
                      </span>
                      <span className="text-xs text-slate-500 ml-2">({ses.tanggal_sesi})</span>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ses.status_sesi === "BERLANGSUNG"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {ses.status_sesi}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 mt-1">
                    Tutor Pengampu:{" "}
                    <span className="font-medium text-slate-900">{ses.tutor_pengampu?.nama_tutor}</span>
                  </div>

                  {ses.absensi && ses.absensi.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                      {ses.absensi.map((ab: any) => (
                        <span
                          key={ab.id_absensi}
                          className={`inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-medium ${
                            ab.status_kehadiran === "HADIR"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : ab.status_kehadiran === "TIDAK_HADIR"
                              ? "bg-rose-50 text-rose-700 border border-rose-200 font-bold"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {ab.siswa?.nama_siswa}: {ab.status_kehadiran}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
