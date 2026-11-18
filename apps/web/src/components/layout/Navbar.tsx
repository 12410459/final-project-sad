import React from "react";
import { Role } from "@bimbel/shared";
import { School, UserCheck, Shield, BookOpen, Users, Database } from "lucide-react";

interface NavbarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  dbStatus?: { mode: string; isPermanent: boolean; message: string } | null;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRole, onRoleChange, dbStatus }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-2 sm:h-16 gap-2 sm:gap-0">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <School className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 tracking-tight block">
                  Bimbel Cerdas
                </span>
                <span className="text-[11px] font-medium text-slate-500 block -mt-1">
                  Sistem Informasi Manajemen Bimbingan Belajar
                </span>
              </div>
            </div>

            {/* Status Database Badge di Mobile */}
            <div className="sm:hidden">
              {dbStatus && (
                <span
                  title={dbStatus.message}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center space-x-1 ${
                    dbStatus.isPermanent
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  <Database className="w-3 h-3" />
                  <span>{dbStatus.isPermanent ? "PostgreSQL" : "Demo Store"}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            {/* Status Database Badge di Desktop */}
            <div className="hidden sm:block">
              {dbStatus ? (
                <div
                  title={dbStatus.message}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${
                    dbStatus.isPermanent
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>
                    {dbStatus.isPermanent
                      ? "Database: PostgreSQL"
                      : "Mode Demo (Perubahan tidak permanen)"}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Role Switcher Demo */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5 tracking-wider hidden md:inline">
                Peran:
              </span>

              <button
                onClick={() => onRoleChange("ADMIN")}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                  currentRole === "ADMIN"
                    ? "bg-white text-brand-700 shadow-sm border border-slate-200 font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-brand-600" />
                <span>Admin</span>
              </button>

              <button
                onClick={() => onRoleChange("PEMILIK")}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                  currentRole === "PEMILIK"
                    ? "bg-white text-brand-700 shadow-sm border border-slate-200 font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-brand-600" />
                <span>Pemilik</span>
              </button>

              <button
                onClick={() => onRoleChange("TUTOR")}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                  currentRole === "TUTOR"
                    ? "bg-white text-brand-700 shadow-sm border border-slate-200 font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                <span>Tutor</span>
              </button>

              <button
                onClick={() => onRoleChange("ORANG_TUA")}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                  currentRole === "ORANG_TUA"
                    ? "bg-amber-100 text-amber-900 shadow-sm border border-amber-300 font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Users className="w-3.5 h-3.5 text-amber-600" />
                <span>Orang Tua (Konsep)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
