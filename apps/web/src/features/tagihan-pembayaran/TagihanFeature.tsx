import React, { useState, useEffect } from "react";
import { bimbelApi } from "../../services/api";
import { Receipt, CreditCard, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export const TagihanFeature: React.FC = () => {
  const [unpaidTagihan, setUnpaidTagihan] = useState<any[]>([]);
  const [allTagihan, setAllTagihan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"belum_lunas" | "semua">("belum_lunas");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal Pembayaran
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedTagihan, setSelectedTagihan] = useState<any | null>(null);
  const [jumlahBayar, setJumlahBayar] = useState<number>(0);
  const [tanggalBayar, setTanggalBayar] = useState(new Date().toISOString().split("T")[0]);
  const [nomorKuitansi, setNomorKuitansi] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [unpaid, all] = await Promise.all([
        bimbelApi.getTagihanBelumLunas(),
        bimbelApi.getAllTagihan(),
      ]);
      setUnpaidTagihan(unpaid);
      setAllTagihan(all);
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenPayModal = (tagihan: any) => {
    setSelectedTagihan(tagihan);
    setJumlahBayar(Number(tagihan.sisa_tagihan || tagihan.total_tagihan));
    setNomorKuitansi(`KW-${Date.now().toString().slice(-6)}`);
    setShowPayModal(true);
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTagihan) return;
    setSubmitting(true);

    try {
      const res = await bimbelApi.recordPembayaran({
        id_tagihan: selectedTagihan.id_tagihan,
        jumlah_bayar: Number(jumlahBayar),
        tanggal_bayar: tanggalBayar,
        nomor_kuitansi: nomorKuitansi,
      });

      setNotification({
        type: "success",
        message: `Pembayaran sebesar Rp ${Number(jumlahBayar).toLocaleString("id-ID")} dengan Kuitansi No. ${nomorKuitansi} berhasil dicatat! Status tagihan: ${res.status_tagihan_baru}.`,
      });

      setShowPayModal(false);
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
          <Receipt className="w-6 h-6 text-brand-600" />
          <span>Pengelolaan Tagihan & Pembayaran SPP (US-03)</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Admin mencatat pembayaran, menghasilkan nomor kuitansi otomatis, dan memantau tagihan yang belum lunas. Diskon 10% untuk anak kedua dan seterusnya tercantum secara transparan (BR-06).
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

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab("belum_lunas")}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === "belum_lunas"
              ? "border-brand-600 text-brand-700 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <span>Tagihan Belum Lunas</span>
          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">
            {unpaidTagihan.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("semua")}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === "semua"
              ? "border-brand-600 text-brand-700 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <span>Semua Riwayat Tagihan & Kuitansi</span>
          <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-semibold">
            {allTagihan.length}
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Memuat data tagihan...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Nama Siswa</th>
                  <th className="py-3 px-3">Jenis Tagihan</th>
                  <th className="py-3 px-3">Periode</th>
                  <th className="py-3 px-3">Nominal</th>
                  <th className="py-3 px-3">Diskon</th>
                  <th className="py-3 px-3">Total Bersih</th>
                  <th className="py-3 px-3">Sisa Tagihan</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(activeTab === "belum_lunas" ? unpaidTagihan : allTagihan).map((t) => (
                  <tr key={t.id_tagihan} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div>{t.siswa?.nama_siswa}</div>
                      <div className="text-xs text-slate-400 font-normal">{t.orang_tua?.no_hp || "-"}</div>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600 font-medium">
                      {t.jenis_tagihan === "BIAYA_PENDAFTARAN" ? "Biaya Pendaftaran" : "SPP Bulanan"}
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600">{t.periode}</td>
                    <td className="py-3 px-3 text-slate-600 font-medium text-xs">
                      Rp {Number(t.nominal).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-3 text-xs">
                      {Number(t.diskon_persen) > 0 ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>{t.diskon_persen}% (BR-06)</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 text-xs">
                      Rp {Number(t.total_tagihan).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-3 font-bold text-rose-600 text-xs">
                      Rp {Number(t.sisa_tagihan !== undefined ? t.sisa_tagihan : t.total_tagihan).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          t.status_tagihan === "LUNAS"
                            ? "bg-emerald-100 text-emerald-800"
                            : t.status_tagihan === "SEBAGIAN"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {t.status_tagihan}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {t.status_tagihan !== "LUNAS" ? (
                        <button
                          onClick={() => handleOpenPayModal(t)}
                          className="inline-flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 text-white font-medium py-1.5 px-3 rounded-lg text-xs transition shadow-sm"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Catat Bayar</span>
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-medium flex items-center justify-end space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Lunas</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Bayar */}
      {showPayModal && selectedTagihan && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">Catat Pembayaran & Terbitkan Kuitansi</h3>
            <p className="text-xs text-slate-500 mb-4">
              Siswa: <strong>{selectedTagihan.siswa?.nama_siswa}</strong> | Tagihan:{" "}
              <strong>Rp {Number(selectedTagihan.total_tagihan).toLocaleString("id-ID")}</strong>
            </p>

            <form onSubmit={handlePaySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Jumlah Pembayaran (Rp) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={jumlahBayar}
                  onChange={(e) => setJumlahBayar(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tanggal Pembayaran
                </label>
                <input
                  type="date"
                  required
                  value={tanggalBayar}
                  onChange={(e) => setTanggalBayar(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nomor Kuitansi / Bukti Pembayaran *
                </label>
                <input
                  type="text"
                  required
                  value={nomorKuitansi}
                  onChange={(e) => setNomorKuitansi(e.target.value)}
                  placeholder="Contoh: KW-202611-001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white transition shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Memproses..." : "Konfirmasi Pembayaran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
