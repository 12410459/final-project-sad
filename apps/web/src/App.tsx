import React, { useState, useEffect } from "react";
import { Role } from "@bimbel/shared";
import { Navbar } from "./components/layout/Navbar";
import { ConceptBanner } from "./components/layout/ConceptBanner";
import { setActiveRole, bimbelApi } from "./services/api";

// Features
import { PendaftaranFeature } from "./features/pendaftaran/PendaftaranFeature";
import { KelasPenempatanFeature } from "./features/kelas-penempatan/KelasPenempatanFeature";
import { JadwalFeature } from "./features/jadwal-tutor/JadwalFeature";
import { SesiAbsensiFeature } from "./features/sesi-absensi/SesiAbsensiFeature";
import { TindakLanjutFeature } from "./features/tindak-lanjut-absensi/TindakLanjutFeature";
import { TagihanFeature } from "./features/tagihan-pembayaran/TagihanFeature";
import { HonorFeature } from "./features/honor/HonorFeature";
import { OrangTuaConceptFeature } from "./features/orang-tua/OrangTuaConceptFeature";

import {
  UserPlus,
  LayoutGrid,
  Calendar,
  BookOpen,
  PhoneCall,
  Receipt,
  DollarSign,
  Users,
} from "lucide-react";

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<Role>("ADMIN");
  const [activeTab, setActiveTab] = useState<string>("pendaftaran");
  const [dbStatus, setDbStatus] = useState<{ mode: string; isPermanent: boolean; message: string } | null>(null);

  useEffect(() => {
    bimbelApi
      .getSystemStatus()
      .then((status) => setDbStatus(status))
      .catch(() => {
        setDbStatus({
          mode: "IN_MEMORY_DEMO",
          isPermanent: false,
          message: "Mode Demo (In-Memory) — perubahan data tidak tersimpan permanen ke PostgreSQL",
        });
      });
  }, []);

  const handleRoleChange = (role: Role) => {
    setCurrentRole(role);
    setActiveRole(role);

    // Auto switch active tab to match role primary tasks
    if (role === "ADMIN") setActiveTab("pendaftaran");
    else if (role === "PEMILIK") setActiveTab("kelas");
    else if (role === "TUTOR") setActiveTab("sesi");
    else if (role === "ORANG_TUA") setActiveTab("orang_tua_preview");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar with Demo Role Switcher & DB Status Badge */}
      <Navbar currentRole={currentRole} onRoleChange={handleRoleChange} dbStatus={dbStatus} />

      {/* Warning Banner if Orang Tua role is selected */}
      {currentRole === "ORANG_TUA" && <ConceptBanner />}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Navigation Tabs based on Role */}
        <div className="flex overflow-x-auto pb-2 border-b border-slate-200 mb-8 space-x-2 text-sm scrollbar-none">
          {currentRole === "ADMIN" && (
            <>
              <button
                onClick={() => setActiveTab("pendaftaran")}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition ${
                  activeTab === "pendaftaran"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Pendaftaran Siswa (US-01)</span>
              </button>

              <button
                onClick={() => setActiveTab("tindak_lanjut")}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition ${
                  activeTab === "tindak_lanjut"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <PhoneCall className="w-4 h-4" />
                <span>Tindak Lanjut Absen 3x (BR-10)</span>
              </button>

              <button
                onClick={() => setActiveTab("tagihan")}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition ${
                  activeTab === "tagihan"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>Tagihan & Pembayaran (US-03)</span>
              </button>

              <button
                onClick={() => setActiveTab("kelas")}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition ${
                  activeTab === "kelas"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Pantau Kelas & Penempatan</span>
              </button>
            </>
          )}

          {currentRole === "PEMILIK" && (
            <>
              <button
                onClick={() => setActiveTab("kelas")}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition ${
                  activeTab === "kelas"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Kelola Kelas & Penempatan (US-04)</span>
              </button>

              <button
                onClick={() => setActiveTab("jadwal")}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition ${
                  activeTab === "jadwal"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Atur Jadwal & Tutor (US-04)</span>
              </button>

              <button
                onClick={() => setActiveTab("honor")}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition ${
                  activeTab === "honor"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Rekap Honor Bulanan (US-05)</span>
              </button>

              <button
                onClick={() => setActiveTab("tagihan")}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition ${
                  activeTab === "tagihan"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>Laporan Tagihan & SPP</span>
              </button>
            </>
          )}

          {currentRole === "TUTOR" && (
            <>
              <button
                onClick={() => setActiveTab("sesi")}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition ${
                  activeTab === "sesi"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Catat Sesi & Absensi (US-06)</span>
              </button>

              <button
                onClick={() => setActiveTab("jadwal")}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition ${
                  activeTab === "jadwal"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Lihat Jadwal Mengajar</span>
              </button>
            </>
          )}

          {currentRole === "ORANG_TUA" && (
            <>
              <button
                onClick={() => setActiveTab("orang_tua_preview")}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition ${
                  activeTab === "orang_tua_preview"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Konsep Data Anak (Kehadiran & Tagihan)</span>
              </button>

              <button
                onClick={() => setActiveTab("pendaftaran")}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition ${
                  activeTab === "pendaftaran"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Konsep Formulir Pendaftaran</span>
              </button>
            </>
          )}
        </div>

        {/* Tab Content Render */}
        <main>
          {activeTab === "pendaftaran" && <PendaftaranFeature />}
          {activeTab === "kelas" && <KelasPenempatanFeature />}
          {activeTab === "jadwal" && <JadwalFeature />}
          {activeTab === "sesi" && <SesiAbsensiFeature />}
          {activeTab === "tindak_lanjut" && <TindakLanjutFeature />}
          {activeTab === "tagihan" && <TagihanFeature />}
          {activeTab === "honor" && <HonorFeature />}
          {activeTab === "orang_tua_preview" && <OrangTuaConceptFeature />}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          Sistem Informasi Manajemen Bimbel Cerdas &bull; Dibangun sesuai SRS Tahap 2, ERD 14 Entitas, dan 10 Aturan Bisnis Terverifikasi.
        </div>
      </footer>
    </div>
  );
};
export default App;
