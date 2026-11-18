import { Role } from "@bimbel/shared";

let currentRole: Role = "ADMIN";

export function setActiveRole(role: Role) {
  currentRole = role;
}

export function getActiveRole(): Role {
  return currentRole;
}

const RAW_API_BASE = (import.meta.env.VITE_API_URL as string) || "/api";
const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    "X-User-Role": currentRole,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${cleanEndpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json();

  if (!response.ok || json.success === false) {
    let errorMsg = json.message || json.error?.code || "Terjadi kesalahan saat memproses data";
    if (json.error?.details && Array.isArray(json.error.details)) {
      const fieldErrors = json.error.details.map((d: any) => d.message).filter(Boolean).join(", ");
      if (fieldErrors) {
        errorMsg += `: ${fieldErrors}`;
      }
    }
    throw new Error(errorMsg);
  }

  return json.data;
}

export const bimbelApi = {
  // System & Database Status
  getSystemStatus: () => request<{ mode: string; isPermanent: boolean; message: string }>("/system/status"),

  // Master
  getMasterData: () => request<{ programs: any[]; mapel: any[]; tutors: any[] }>("/master"),

  // US-01: Siswa & Pendaftaran
  getAllSiswa: () => request<any[]>("/siswa"),
  getSiswaDetail: (id: string) => request<any>(`/siswa/${id}`),
  createPendaftaran: (payload: any) => request("/pendaftaran", { method: "POST", body: JSON.stringify(payload) }),

  // US-01 & US-04: Kelas & Penempatan
  getKelasList: () => request<any[]>("/kelas"),
  createKelas: (payload: any) => request("/kelas", { method: "POST", body: JSON.stringify(payload) }),
  assignSiswa: (payload: { id_siswa: string; id_kelas: string }) =>
    request("/penempatan", { method: "POST", body: JSON.stringify(payload) }),

  // US-04: Jadwal
  getJadwalList: () => request<any[]>("/jadwal"),
  createJadwal: (payload: any) => request("/jadwal", { method: "POST", body: JSON.stringify(payload) }),

  // US-06: Sesi & Absensi
  getSesiList: (params?: { id_kelas?: string; id_tutor?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any[]>(`/sesi${query ? `?${query}` : ""}`);
  },
  createSesi: (payload: any) => request("/sesi", { method: "POST", body: JSON.stringify(payload) }),

  // US-02 & US-03: Tindak Lanjut Absensi
  getSiswaPerluTelepon: () => request<any[]>("/tindak-lanjut/perlu-telepon"),
  createTindakLanjut: (payload: any) => request("/tindak-lanjut", { method: "POST", body: JSON.stringify(payload) }),
  getRiwayatTindakLanjut: () => request<any[]>("/tindak-lanjut/riwayat"),

  // US-03: Tagihan & Pembayaran
  getTagihanBelumLunas: () => request<any[]>("/tagihan/belum-lunas"),
  getAllTagihan: () => request<any[]>("/tagihan"),
  recordPembayaran: (payload: any) => request("/pembayaran", { method: "POST", body: JSON.stringify(payload) }),

  // US-05: Honor Tutor
  kalkulasiHonor: (periode: string) => request<any>(`/honor/kalkulasi?periode=${periode}`),
  simpanRekapHonor: (payload: any) => request("/honor/simpan-rekap", { method: "POST", body: JSON.stringify(payload) }),
  getRiwayatRekapHonor: () => request<any[]>("/honor/riwayat"),
};
