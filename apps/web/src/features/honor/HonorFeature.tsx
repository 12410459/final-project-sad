import React, { useState, useEffect } from "react";
import { bimbelApi } from "../../services/api";
import { DollarSign, Save, Calendar, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

export const HonorFeature: React.FC = () => {
  const [periode, setPeriode] = useState("2026-11");
  const [kalkulasiData, setKalkulasiData] = useState<any | null>(null);
  const [riwayatRekap, setRiwayatRekap] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedTutorId, setExpandedTutorId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadData = async (selectedPeriode: string) => {
    setLoading(true);
    try {
      const [calc, history] = await Promise.all([
        bimbelApi.kalkulasiHonor(selectedPeriode),
        bimbelApi.getRiwayatRekapHonor(),
      ]);
      setKalkulasiData(calc);
      setRiwayatRekap(history);
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(periode);
  }, [periode]);

  const handleSaveSnapshot = async () => {
    if (!kalkulasiData || !kalkulasiData.rekap) return;
    setSaving(true);
    setNotification(null);

    try {
      const items = kalkulasiData.rekap.map((item: any) => ({
        id_tutor: item.id_tutor,
        jumlah_sesi: item.jumlah_sesi,
        tarif_per_sesi: item.tarif_per_sesi,
        total_honor: item.total_honor,
      }));

      await bimbelApi.simpanRekapHonor({
        periode,
        items,
      });

      setNotification({
        type: "success",
        message: `Rekap honor periode ${periode} berhasil disimpan ke database sebagai snapshot audit (US-05).`,
      });

      loadData(periode);
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <DollarSign className="w-6 h-6 text-brand-600" />
            <span>Perhitungan & Rekap Honor Tutor (US-05)</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Aturan: Tarif Rp75.000 per sesi berlangsung (BR-07). Sesi batal tidak dihitung (BR-09). Tutor pengganti yang mengampu sesi berhak menerima honor sesi tersebut (BR-08).
          </p>
        </div>

        {/* Periode Selector */}
        <div className="flex items-center space-x-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Periode:</span>
          <input
            type="month"
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
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

      {/* Tabel Kalkulasi Dinamis (Backend Single Source of Truth) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Kalkulasi Honor Berjalan Periode {periode}
            </h3>
            <span className="text-xs text-slate-500">
              Dihitung otomatis oleh backend dari sesi riil yang berstatus BERLANGSUNG.
            </span>
          </div>

          <button
            onClick={handleSaveSnapshot}
            disabled={saving || loading}
            className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 px-4 rounded-xl text-xs transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Menyimpan..." : "Simpan Snapshot Rekap Honor"}</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Menghitung honor dari sesi riil...</div>
        ) : !kalkulasiData || kalkulasiData.rekap.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">Tidak ada tutor terdaftar.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Nama Tutor</th>
                  <th className="py-3 px-3">Kontak</th>
                  <th className="py-3 px-3 text-center">Sesi Berlangsung (Riil)</th>
                  <th className="py-3 px-3 text-right">Tarif / Sesi</th>
                  <th className="py-3 px-3 text-right">Total Honor</th>
                  <th className="py-3 px-3 text-center">Rincian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {kalkulasiData.rekap.map((t: any) => {
                  const isExpanded = expandedTutorId === t.id_tutor;

                  return (
                    <React.Fragment key={t.id_tutor}>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 font-semibold text-slate-900">
                          {t.nama_tutor}
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 text-xs">{t.kontak_tutor}</td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-100 text-brand-800">
                            {t.jumlah_sesi} Sesi
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right text-slate-600 text-xs font-medium">
                          Rp {Number(t.tarif_per_sesi).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3.5 px-3 text-right font-bold text-brand-700 text-sm">
                          Rp {Number(t.total_honor).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          {t.rincian_sesi && t.rincian_sesi.length > 0 && (
                            <button
                              onClick={() => setExpandedTutorId(isExpanded ? null : t.id_tutor)}
                              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Rincian Sesi Dropdown */}
                      {isExpanded && t.rincian_sesi && (
                        <tr>
                          <td colSpan={6} className="bg-slate-50 p-4 border-y border-slate-100">
                            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                              Rincian Pertemuan yang Diampu {t.nama_tutor}:
                            </div>
                            <div className="space-y-1.5">
                              {t.rincian_sesi.map((s: any) => (
                                <div
                                  key={s.id_sesi}
                                  className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                                >
                                  <div>
                                    <span className="font-semibold text-slate-800">{s.kelas}</span>
                                    <span className="text-slate-400 ml-2">Tgl: {s.tanggal_sesi}</span>
                                  </div>
                                  <div>
                                    {s.is_pengganti ? (
                                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                        Mengajar Sebagai Tutor Pengganti (BR-08)
                                      </span>
                                    ) : (
                                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-medium px-2 py-0.5 rounded-md">
                                        Tutor Utama Kelas
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Riwayat Snapshot Rekap Terverifikasi */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-semibold text-slate-900 text-base mb-4 flex items-center space-x-2">
          <span>Riwayat Snapshot Rekap Terverifikasi (Tabel `RekapHonor`)</span>
        </h3>

        {riwayatRekap.length === 0 ? (
          <div className="text-xs text-slate-400 italic py-6 text-center">
            Belum ada snapshot rekap honor yang dibekukan ke database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Periode</th>
                  <th className="py-2.5 px-3">Tutor</th>
                  <th className="py-2.5 px-3 text-center">Sesi</th>
                  <th className="py-2.5 px-3 text-right">Tarif</th>
                  <th className="py-2.5 px-3 text-right">Total Honor Tersimpan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {riwayatRekap.map((r) => (
                  <tr key={r.id_rekap_honor}>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{r.periode}</td>
                    <td className="py-2.5 px-3 text-slate-900 font-medium">{r.tutor?.nama_tutor}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-brand-700">{r.jumlah_sesi}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      Rp {Number(r.tarif_per_sesi).toLocaleString("id-ID")}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      Rp {Number(r.total_honor).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
