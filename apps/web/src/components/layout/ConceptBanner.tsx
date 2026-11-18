import React from "react";
import { AlertTriangle } from "lucide-react";

export const ConceptBanner: React.FC = () => {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <span className="font-semibold">Perhatian (SRS Tahap 2): </span>
          Akses Orang Tua melalui aplikasi masih berlabel <strong>"Perlu Validasi"</strong> karena belum ada keputusan final apakah orang tua akan memakai akun portal aplikasi atau menerima informasi via kanal bimbel (WhatsApp/telepon). Tampilan ini disediakan sebagai <em>evaluasi konsep awal</em>, bukan portal produksi aktif.
        </div>
      </div>
    </div>
  );
};
