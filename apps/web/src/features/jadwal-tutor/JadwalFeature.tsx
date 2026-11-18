import React, { useState, useEffect } from "react";
import { bimbelApi } from "../../services/api";
import { Calendar, PlusCircle, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

export const JadwalFeature: React.FC = () => {
  const [jadwalList, setJadwalList] = useState<any[]>([]);
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: "success" | "warning" | "error"; message: string } | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [idKelas, setIdKelas] = useState("");
  const [hari, setHari] = useState("Senin");
  const [jamMulai, setJamMulai] = useState("15:30");
  const [jamSelesai, setJamSelesai] = useState("17:00");

  const loadData = async () => {
    setLoading(true);
    try {
      const [jadwal, kelas] = await Promise.all([
        bimbelApi.getJadwalList(),
        bimbelApi.getKelasList(),
      ]);
      setJadwalList(jadwal);
      setKelasList(kelas);
      if (kelas.length > 0 && !idKelas) setIdKelas(kelas[0].id_kelas);
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateJadwal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await bimbelApi.createJadwal({
        id_kelas: idKelas,
        hari,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
        frekuensi_per_minggu: 2, // BR-03
        durasi_menit: 90, // BR-03
      });

      if (res?.warning || res?.bentrok) {
        setNotification({
          type: "warning",
          message: res.warning || "Peringatan: Jadwal disimpan namun terdeteksi potensi bentrok waktu dengan jadwal tutor lain.",
        });
      } else {
        setNotification({ type: "success", message: "Jadwal berhasil ditambahkan tanpa bentrok waktu." });
      }

      setShowModal(false);
      loadData();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    }
  };

  const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-brand-600" />
            <span>Pengaturan Jadwal Kelas & Tutor (US-04)</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Aturan: Kelas berlangsung dua kali seminggu selama 90 menit per sesi (BR-03). Sistem mendeteksi potensi bentrok jadwal tutor untuk memandu Pemilik.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tambah Jadwal</span>
        </button>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl flex items-start space-x-3 text-sm ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : notification.type === "warning"
              ? "bg-amber-50 text-amber-900 border border-amber-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Tampilan Jadwal Mingguan */}
      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">Memuat jadwal...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DAYS.map((day) => {
            const daySchedules = jadwalList.filter((j) => j.hari.toLowerCase() === day.toLowerCase());

            return (
              <div key={day} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-bold text-slate-900 text-sm">{day}</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                    {daySchedules.length} Sesi
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {daySchedules.length === 0 ? (
                    <div className="text-xs text-slate-400 py-4 text-center italic">Tidak ada jadwal</div>
                  ) : (
                    daySchedules.map((j) => (
                      <div
                        key={j.id_jadwal}
                        className="bg-brand-50/60 border border-brand-200/80 rounded-xl p-3.5 hover:bg-brand-50 transition"
                      >
                        <div className="font-semibold text-slate-900 text-sm">
                          {j.kelas?.nama_kelas || "Kelas"}
                        </div>
                        <div className="flex items-center space-x-1.5 text-xs text-brand-800 mt-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-brand-600" />
                          <span>
                            {j.jam_mulai} - {j.jam_selesai} ({j.durasi_menit} menit)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-2">
                          Frekuensi: 2x/minggu
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah Jadwal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-4">Tambah Jadwal Kelas</h3>
            <form onSubmit={handleCreateJadwal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Pilih Kelas
                </label>
                <select
                  value={idKelas}
                  onChange={(e) => setIdKelas(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {kelasList.map((k) => (
                    <option key={k.id_kelas} value={k.id_kelas}>
                      {k.nama_kelas} (Tutor: {k.tutor_utama?.nama_tutor})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Hari Pertemuan
                </label>
                <select
                  value={hari}
                  onChange={(e) => setHari(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    required
                    value={jamMulai}
                    onChange={(e) => setJamMulai(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    required
                    value={jamSelesai}
                    onChange={(e) => setJamSelesai(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                Durasi default: 90 menit (BR-03). Sistem akan mengecek potensi bentrok waktu tutor pengampu secara otomatis.
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white transition shadow-sm"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
