import React, { useState, useEffect } from "react";
import { bimbelApi } from "../../services/api";
import { Users, AlertTriangle, BookOpen, Receipt } from "lucide-react";

export const OrangTuaConceptFeature: React.FC = () => {
  const [siswaList, setSiswaList] = useState<any[]>([]);
  const [selectedSiswaId, setSelectedSiswaId] = useState<string>("");
  const [siswaDetail, setSiswaDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSiswa = async () => {
      setLoading(true);
      try {
        const list = await bimbelApi.getAllSiswa();
        setSiswaList(list);
        if (list.length > 0) {
          setSelectedSiswaId(list[0].id_siswa);
          const detail = await bimbelApi.getSiswaDetail(list[0].id_siswa);
          setSiswaDetail(detail);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSiswa();
  }, []);

  const handleSelectSiswa = async (id: string) => {
    setSelectedSiswaId(id);
    try {
      const detail = await bimbelApi.getSiswaDetail(id);
      setSiswaDetail(detail);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Peringatan Status Konsep */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-900 text-sm">
              Status Rancangan: Konsep Pratinjau Orang Tua (Perlu Validasi Klien)
            </h3>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              Berdasarkan dokumen SRS Tahap 2 dan transkrip wawancara Ibu Grace, bentuk akses mandiri orang tua (portal web login mandiri) <strong>belum disepakati</strong>. Informasi kehadiran dan tagihan saat ini disampaikan melalui jalur staf bimbel (Kak Tirsa). Layar ini menyajikan simulasi konsep tampilan data anak untuk kebutuhan evaluasi rancangan masa depan.
            </p>
          </div>
        </div>
      </div>

      {/* Selector Siswa Konsep */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm font-semibold text-slate-700">
          <Users className="w-4 h-4 text-brand-600" />
          <span>Simulasi Akun Orang Tua dari Siswa:</span>
        </div>
        <select
          value={selectedSiswaId}
          onChange={(e) => handleSelectSiswa(e.target.value)}
          className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {siswaList.map((s) => (
            <option key={s.id_siswa} value={s.id_siswa}>
              {s.nama_siswa} ({s.program?.nama_program})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">Memuat profil konsep siswa...</div>
      ) : !siswaDetail ? (
        <div className="py-12 text-center text-sm text-slate-500">Data siswa tidak ditemukan.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ringkasan Presensi & Kehadiran Anak (US-02) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-brand-600" />
              <span>Informasi Kehadiran Anak</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Riwayat presensi sesi pertemuan bimbingan belajar.
            </p>

            {siswaDetail.absensi && siswaDetail.absensi.length > 0 ? (
              <div className="space-y-2">
                {siswaDetail.absensi.map((ab: any) => (
                  <div
                    key={ab.id_absensi}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">
                        Pertemuan Sesi: {ab.sesi?.tanggal_sesi || "-"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Status Sesi: {ab.sesi?.status_sesi || "BERLANGSUNG"}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        ab.status_kehadiran === "HADIR"
                          ? "bg-emerald-100 text-emerald-800"
                          : ab.status_kehadiran === "TIDAK_HADIR"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {ab.status_kehadiran}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-6 text-center">
                Belum ada catatan absensi untuk siswa ini.
              </div>
            )}
          </div>

          {/* Ringkasan Tagihan & Pembayaran SPP (US-02) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center space-x-2">
              <Receipt className="w-5 h-5 text-brand-600" />
              <span>Informasi Tagihan SPP & Pendaftaran</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Status kewajiban administrasi bimbingan belajar anak.
            </p>

            {siswaDetail.tagihan && siswaDetail.tagihan.length > 0 ? (
              <div className="space-y-3">
                {siswaDetail.tagihan.map((tg: any) => (
                  <div
                    key={tg.id_tagihan}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        {tg.jenis_tagihan === "BIAYA_PENDAFTARAN" ? "Biaya Pendaftaran" : `SPP ${tg.periode}`}
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Nominal: Rp {Number(tg.total_tagihan).toLocaleString("id-ID")}
                        {tg.diskon_persen > 0 && ` (Diskon ${tg.diskon_persen}%)`}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        tg.status_tagihan === "LUNAS"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {tg.status_tagihan}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-6 text-center">
                Tidak ada data tagihan.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
