import React, { useState, useEffect } from "react";
import { bimbelApi } from "../../services/api";
import { UserPlus, Users, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export const PendaftaranFeature: React.FC = () => {
  const [siswaList, setSiswaList] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form state
  const [namaSiswa, setNamaSiswa] = useState("");
  const [noHpOrtu, setNoHpOrtu] = useState("");
  const [emailOrtu, setEmailOrtu] = useState("");
  const [idProgram, setIdProgram] = useState("");
  const [urutanAnak, setUrutanAnak] = useState<number>(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allSiswa, master] = await Promise.all([
        bimbelApi.getAllSiswa(),
        bimbelApi.getMasterData(),
      ]);
      setSiswaList(allSiswa);
      setPrograms(master.programs);
      if (master.programs.length > 0 && !idProgram) {
        setIdProgram(master.programs[0].id_program);
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification(null);

    try {
      await bimbelApi.createPendaftaran({
        nama_siswa: namaSiswa,
        no_hp_orang_tua: noHpOrtu,
        email_orang_tua: emailOrtu,
        id_program: idProgram,
        urutan_anak_dalam_keluarga: Number(urutanAnak),
      });

      setNotification({
        type: "success",
        message: `Pendaftaran ${namaSiswa} berhasil disimpan! Tagihan pendaftaran & SPP bulan pertama otomatis dibuat.`,
      });

      // Reset form
      setNamaSiswa("");
      setNoHpOrtu("");
      setEmailOrtu("");
      setUrutanAnak(1);

      loadData();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Fitur */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <UserPlus className="w-6 h-6 text-brand-600" />
          <span>Pendaftaran Siswa Baru (US-01 / REQ-01)</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Admin mencatat pendaftaran siswa, kontak orang tua, dan program bimbingan yang dipilih. Tagihan pendaftaran (Rp100.000) dan SPP otomatis digenerate.
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
        {/* Formulir Pendaftaran */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-900 text-base mb-4 flex items-center space-x-2">
            <span>Formulir Pendaftaran</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nama Lengkap Siswa *
              </label>
              <input
                type="text"
                required
                value={namaSiswa}
                onChange={(e) => setNamaSiswa(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                No. HP Orang Tua / Wali *
              </label>
              <input
                type="tel"
                required
                value={noHpOrtu}
                onChange={(e) => setNoHpOrtu(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Orang Tua (Opsional)
              </label>
              <input
                type="email"
                value={emailOrtu}
                onChange={(e) => setEmailOrtu(e.target.value)}
                placeholder="contoh: ortu@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Program Bimbingan *
              </label>
              <select
                value={idProgram}
                onChange={(e) => setIdProgram(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {programs.map((p) => (
                  <option key={p.id_program} value={p.id_program}>
                    {p.nama_program} (SPP: Rp {Number(p.tarif_spp).toLocaleString("id-ID")})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Urutan Anak dalam Keluarga *
              </label>
              <select
                value={urutanAnak}
                onChange={(e) => setUrutanAnak(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value={1}>Anak Pertama (Tarif Normal)</option>
                <option value={2}>Anak Kedua (Diskon SPP 10% - BR-06)</option>
                <option value={3}>Anak Ketiga / Seterusnya (Diskon SPP 10% - BR-06)</option>
              </select>
              {urutanAnak >= 2 && (
                <div className="mt-2 text-xs text-brand-700 bg-brand-50 p-2 rounded-lg border border-brand-200 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <span>Sesuai <strong>BR-06</strong>, anak ke-2 dan seterusnya mendapat diskon SPP 10%.</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-4 bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition shadow-sm disabled:opacity-50"
            >
              {submitting ? "Menyimpan Data..." : "Simpan Pendaftaran"}
            </button>
          </form>
        </div>

        {/* Tabel Data Siswa Terdaftar */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 text-base flex items-center space-x-2">
              <Users className="w-4 h-4 text-slate-500" />
              <span>Daftar Siswa Terdaftar ({siswaList.length})</span>
            </h3>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">Memuat data siswa...</div>
          ) : siswaList.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">Belum ada siswa terdaftar.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">Nama Siswa</th>
                    <th className="py-3 px-3">Program</th>
                    <th className="py-3 px-3">Kontak Orang Tua</th>
                    <th className="py-3 px-3">Tgl Daftar</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {siswaList.map((s) => (
                    <tr key={s.id_siswa} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-medium text-slate-900">{s.nama_siswa}</td>
                      <td className="py-3 px-3 text-slate-600">{s.program?.nama_program || "-"}</td>
                      <td className="py-3 px-3 text-slate-600">
                        <div>{s.orang_tua?.no_hp || "-"}</div>
                        {s.orang_tua?.email && (
                          <div className="text-xs text-slate-400">{s.orang_tua.email}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-xs">{s.tanggal_daftar}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            s.status_siswa === "AKTIF"
                              ? "bg-emerald-100 text-emerald-800"
                              : s.status_siswa === "MENUNGGU_KELAS"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {s.status_siswa}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
