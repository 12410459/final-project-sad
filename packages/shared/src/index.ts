import { z } from "zod";

// --- KONSTANTA ATURAN BISNIS (BR-01 s/d BR-10) ---
export const BUSINESS_RULES = {
  MIN_CLASS_OPERATIONAL: 3,      // BR-01: Satu kelas berjalan jika jumlah siswa minimal 3
  MAX_CLASS_CAPACITY: 8,         // BR-02: Satu kelas menampung paling banyak 8 siswa
  SESSION_FREQUENCY_PER_WEEK: 2, // BR-03: Bertemu dua kali seminggu
  SESSION_DURATION_MINUTES: 90,  // BR-03: 90 menit per sesi
  REGISTRATION_FEE: 100000,      // BR-05: Biaya pendaftaran Rp100.000 satu kali
  SECOND_CHILD_DISCOUNT_PCT: 10, // BR-06: Diskon SPP 10 persen untuk anak kedua dan seterusnya
  TUTOR_SESSION_RATE: 75000,     // BR-07: Honor tutor Rp75.000 per sesi berlangsung
  ABSENCE_ALERT_THRESHOLD: 3,    // BR-10: Pemicu telepon jika siswa absen 3x berturut-turut
};

// --- DEFINISI STATUS DOMAIN ---
export type Role = "ADMIN" | "PEMILIK" | "TUTOR" | "ORANG_TUA";

export type StatusSiswa = "TERDAFTAR" | "AKTIF" | "MENUNGGU_KELAS" | "NONAKTIF";
export type StatusKelas = "MENUNGGU" | "BERJALAN" | "SELESAI";
export type StatusPenempatan = "DITEMPATKAN" | "DAFTAR_TUNGGU" | "DIBATALKAN";
export type StatusSesi = "BERLANGSUNG" | "BATAL";
export type StatusKehadiran = "HADIR" | "TIDAK_HADIR" | "IZIN" | "SAKIT";
export type StatusTagihan = "BELUM_LUNAS" | "SEBAGIAN" | "LUNAS";

// --- ENTITAS INTERFACES (14 Domain Entities Sesuai ERD) ---
export interface OrangTua {
  id_orang_tua: string;
  no_hp: string;
  email: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Siswa {
  id_siswa: string;
  id_orang_tua: string;
  id_program: string;
  nama_siswa: string;
  tanggal_daftar: string;
  status_siswa: StatusSiswa;
  orang_tua?: OrangTua;
  program?: Program;
  penempatan?: Penempatan[];
  created_at?: string;
  updated_at?: string;
}

export interface Program {
  id_program: string;
  nama_program: string;
  tarif_spp: number;
  biaya_pendaftaran: number;
  created_at?: string;
  updated_at?: string;
}

export interface MataPelajaran {
  id_mapel: string;
  nama_mapel: string;
  created_at?: string;
  updated_at?: string;
}

export interface Tutor {
  id_tutor: string;
  nama_tutor: string;
  kontak_tutor: string;
  created_at?: string;
  updated_at?: string;
}

export interface Kelas {
  id_kelas: string;
  id_program: string;
  id_mapel: string;
  id_tutor_utama: string;
  nama_kelas: string;
  kapasitas_maks: number;
  status_kelas: StatusKelas;
  program?: Program;
  mapel?: MataPelajaran;
  tutor_utama?: Tutor;
  penempatan?: Penempatan[];
  jadwal?: Jadwal[];
  jumlah_siswa?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Jadwal {
  id_jadwal: string;
  id_kelas: string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  frekuensi_per_minggu: number;
  durasi_menit: number;
  kelas?: Kelas;
  created_at?: string;
  updated_at?: string;
}

export interface Penempatan {
  id_penempatan: string;
  id_siswa: string;
  id_kelas: string;
  tanggal_penempatan: string;
  status_penempatan: StatusPenempatan;
  siswa?: Siswa;
  kelas?: Kelas;
  created_at?: string;
  updated_at?: string;
}

export interface Sesi {
  id_sesi: string;
  id_kelas: string;
  id_jadwal: string | null;
  id_tutor_pengampu: string;
  tanggal_sesi: string;
  status_sesi: StatusSesi;
  kelas?: Kelas;
  jadwal?: Jadwal | null;
  tutor_pengampu?: Tutor;
  absensi?: Absensi[];
  created_at?: string;
  updated_at?: string;
}

export interface Absensi {
  id_absensi: string;
  id_sesi: string;
  id_siswa: string;
  status_kehadiran: StatusKehadiran;
  sesi?: Sesi;
  siswa?: Siswa;
  created_at?: string;
  updated_at?: string;
}

export interface TindakLanjutAbsensi {
  id_tindak_lanjut: string;
  id_siswa: string;
  tanggal_telepon: string;
  hasil_telepon: string;
  catatan: string | null;
  siswa?: Siswa;
  created_at?: string;
  updated_at?: string;
}

export interface Tagihan {
  id_tagihan: string;
  id_siswa: string;
  periode: string;
  jenis_tagihan: "SPP_BULANAN" | "BIAYA_PENDAFTARAN";
  nominal: number;
  diskon_persen: number;
  total_tagihan: number;
  status_tagihan: StatusTagihan;
  siswa?: Siswa;
  pembayaran?: Pembayaran[];
  total_terbayar?: number;
  sisa_tagihan?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Pembayaran {
  id_pembayaran: string;
  id_tagihan: string;
  tanggal_bayar: string;
  jumlah_bayar: number;
  nomor_kuitansi: string;
  tagihan?: Tagihan;
  created_at?: string;
  updated_at?: string;
}

export interface RekapHonor {
  id_rekap_honor: string;
  id_tutor: string;
  periode: string;
  jumlah_sesi: number;
  tarif_per_sesi: number;
  total_honor: number;
  tutor?: Tutor;
  created_at?: string;
  updated_at?: string;
}

// --- ZOD SCHEMAS UNTUK VALIDASI REQUEST ---

export const PendaftaranSchema = z.object({
  nama_siswa: z.string().min(2, "Nama siswa minimal 2 karakter"),
  no_hp_orang_tua: z.string().min(8, "Nomor HP minimal 8 digit"),
  email_orang_tua: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  id_program: z.string().min(1, "Program bimbingan belajar wajib dipilih"),
  urutan_anak_dalam_keluarga: z.number().int().min(1).default(1),
});

export const PenempatanSchema = z.object({
  id_siswa: z.string().min(1, "Siswa wajib dipilih"),
  id_kelas: z.string().min(1, "Kelas wajib dipilih"),
});

export const KelasSchema = z.object({
  nama_kelas: z.string().min(3, "Nama kelas minimal 3 karakter"),
  id_program: z.string().min(1, "Program wajib dipilih"),
  id_mapel: z.string().min(1, "Mata pelajaran wajib dipilih"),
  id_tutor_utama: z.string().min(1, "Tutor utama wajib dipilih"),
  kapasitas_maks: z.number().int().min(1).max(20).default(8),
});

export const JadwalSchema = z.object({
  id_kelas: z.string().min(1, "Kelas wajib dipilih"),
  hari: z.string().min(3, "Hari wajib diisi"),
  jam_mulai: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format jam mulai harus HH:MM"),
  jam_selesai: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format jam selesai harus HH:MM"),
  frekuensi_per_minggu: z.number().int().default(2),
  durasi_menit: z.number().int().default(90),
});

export const SesiSchema = z.object({
  id_kelas: z.string().min(1, "Kelas wajib dipilih"),
  id_jadwal: z.string().optional().nullable(),
  id_tutor_pengampu: z.string().min(1, "Tutor pengampu aktual wajib ditentukan"),
  tanggal_sesi: z.string().min(10, "Tanggal sesi harus valid (YYYY-MM-DD)"),
  status_sesi: z.enum(["BERLANGSUNG", "BATAL"]),
  absensi_list: z.array(
    z.object({
      id_siswa: z.string().min(1),
      status_kehadiran: z.enum(["HADIR", "TIDAK_HADIR", "IZIN", "SAKIT"]),
    })
  ).optional(),
});

export const PembayaranSchema = z.object({
  id_tagihan: z.string().min(1, "Tagihan wajib dipilih"),
  jumlah_bayar: z.number().positive("Jumlah bayar harus lebih dari 0"),
  tanggal_bayar: z.string().min(10, "Tanggal bayar harus valid"),
  nomor_kuitansi: z.string().optional(),
});

export const TindakLanjutSchema = z.object({
  id_siswa: z.string().min(1, "Siswa wajib dipilih"),
  tanggal_telepon: z.string().min(10, "Tanggal telepon harus valid"),
  hasil_telepon: z.string().min(5, "Hasil telepon minimal 5 karakter"),
  catatan: z.string().optional().nullable(),
});

export const SimpanRekapHonorSchema = z.object({
  periode: z.string().regex(/^\d{4}-\d{2}$/, "Format periode harus YYYY-MM"),
  items: z.array(
    z.object({
      id_tutor: z.string().min(1),
      jumlah_sesi: z.number().int().min(0),
      tarif_per_sesi: z.number().positive(),
      total_honor: z.number().min(0),
    })
  ),
});

// --- API RESPONSE FORMAT ---
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    details?: any;
  };
}
