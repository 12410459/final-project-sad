import React, { useState, useEffect } from "react";
import { bimbelApi } from "../../services/api";
import { PhoneCall, AlertTriangle, CheckCircle2, History } from "lucide-react";

export const TindakLanjutFeature: React.FC = () => {
  const [perluTelepon, setPerluTelepon] = useState<any[]>([]);
  const [riwayatTelepon, setRiwayatTelepon] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal Log Telepon
  const [showModal, setShowModal] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<any | null>(null);
  const [tanggalTelepon, setTanggalTelepon] = useState(new Date().toISOString().split("T")[0]);
  const [hasilTelepon, setHasilTelepon] = useState("");
  const [catatan, setCatatan] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [alertList, historyList] = await Promise.all([
        bimbelApi.getSiswaPerluTelepon(),
        bimbelApi.getRiwayatTindakLanjut(),
      ]);
      setPerluTelepon(alertList);
      setRiwayatTelepon(historyList);
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (siswaItem: any) => {
    setSelectedSiswa(siswaItem);
    setHasilTelepon("");
    setCatatan("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswa) return;
    setSubmitting(true);

    try {
      await bimbelApi.createTindakLanjut({
        id_siswa: selectedSiswa.siswa.id_siswa,
        tanggal_telepon: tanggalTelepon,
        hasil_telepon: hasilTelepon,
        catatan,
      });

      setNotification({
        type: "success",
        message: `Hasil panggilan telepon kepada orang tua ${selectedSiswa.siswa.nama_siswa} berhasil disimpan.`,
      });

      setShowModal(false);
      loadData();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <PhoneCall className="w-6 h-6 text-brand-600" />
          <span>Tindak Lanjut Ketidakhadiran Siswa (US-02, US-03, BR-10)</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Sesuai aturan bisnis <strong>BR-10</strong>: Setelah siswa tidak hadir 3 kali berturut-turut, Admin (Kak Tirsa) wajib menelepon orang tua dan mencatat hasil percakapan serta tindak lanjutnya ke sistem.
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
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Bagian Pemicu Alarm: 3x Berturut-turut */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-rose-900">
              Peringatan Siswa Absen 3x Berturut-turut ({perluTelepon.length} Siswa)
            </h3>
            <p className="text-xs text-rose-700">
              Daftar siswa di bawah ini telah tercatat tidak hadir pada 3 pertemuan berturut-turut dan memerlukan konfirmasi langsung kepada orang tua.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-6 text-center text-sm text-rose-700">Menganalisis riwayat absensi siswa...</div>
        ) : perluTelepon.length === 0 ? (
          <div className="py-6 text-center text-sm text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200 font-medium">
            ✅ Saat ini tidak ada siswa yang absen 3 kali berturut-turut. Semua kehadiran siswa dalam pemantauan normal.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {perluTelepon.map((item) => (
              <div
                key={item.siswa.id_siswa}
                className="bg-white rounded-xl border border-rose-200 p-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-sm">{item.siswa.nama_siswa}</span>
                    <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full">
                      {item.jumlah_absen_berturut}x Absen Berturut-turut
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div>
                      Orang Tua: <span className="font-medium text-slate-900">{item.orang_tua?.no_hp || "-"}</span>
                    </div>
                    <div>
                      Kelas: <span className="font-medium text-slate-900">{item.kelas?.nama_kelas || "-"}</span>
                    </div>
                    <div>
                      Status Tindak Lanjut:{" "}
                      <span className="font-semibold text-rose-600">{item.status_tindak_lanjut}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="w-full inline-flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 px-3 rounded-xl text-xs transition shadow-sm"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Catat Hasil Telepon Orang Tua (Kak Tirsa)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabel Riwayat Tindak Lanjut Telepon */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-semibold text-slate-900 text-base mb-4 flex items-center space-x-2">
          <History className="w-4 h-4 text-slate-500" />
          <span>Log Riwayat Telepon Orang Tua ({riwayatTelepon.length})</span>
        </h3>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Memuat riwayat log...</div>
        ) : riwayatTelepon.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400 italic">
            Belum ada catatan log telepon yang tersimpan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Tanggal Telepon</th>
                  <th className="py-3 px-3">Nama Siswa</th>
                  <th className="py-3 px-3">Kontak Orang Tua</th>
                  <th className="py-3 px-3">Hasil Pembicaraan</th>
                  <th className="py-3 px-3">Catatan Lanjutan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {riwayatTelepon.map((r) => (
                  <tr key={r.id_tindak_lanjut} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-900 text-xs">{r.tanggal_telepon}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{r.siswa?.nama_siswa}</td>
                    <td className="py-3 px-3 text-slate-600 text-xs">{r.orang_tua?.no_hp || "-"}</td>
                    <td className="py-3 px-3 text-slate-700 text-xs font-medium">{r.hasil_telepon}</td>
                    <td className="py-3 px-3 text-slate-500 text-xs italic">{r.catatan || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Catat Telepon */}
      {showModal && selectedSiswa && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">Catat Hasil Telepon Orang Tua</h3>
            <p className="text-xs text-slate-500 mb-4">
              Siswa: <strong>{selectedSiswa.siswa.nama_siswa}</strong> | No. HP:{" "}
              <strong>{selectedSiswa.orang_tua?.no_hp}</strong>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tanggal Telepon
                </label>
                <input
                  type="date"
                  required
                  value={tanggalTelepon}
                  onChange={(e) => setTanggalTelepon(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Hasil Telepon (Alasan Ketidakhadiran) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={hasilTelepon}
                  onChange={(e) => setHasilTelepon(e.target.value)}
                  placeholder="Contoh: Orang tua mengonfirmasi anak sedang sakit tifus dan diopname di RS..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Catatan Tindak Lanjut
                </label>
                <input
                  type="text"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Contoh: Siswa berencana masuk kembali minggu depan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
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
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan Catatan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
