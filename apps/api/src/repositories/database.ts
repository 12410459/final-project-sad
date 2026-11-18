import { PrismaClient } from "@prisma/client";
import {
  OrangTua,
  Siswa,
  Program,
  MataPelajaran,
  Tutor,
  Kelas,
  Jadwal,
  Penempatan,
  Sesi,
  Absensi,
  TindakLanjutAbsensi,
  Tagihan,
  Pembayaran,
  RekapHonor,
} from "@bimbel/shared";
import { INITIAL_DEMO_DATA } from "../demoData";

// Inisialisasi Prisma Client untuk PostgreSQL
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

// Flag status koneksi database
let isPostgresConnected = false;

// In-memory fallback store untuk mode demo/pengembangan lokal
class MemoryStore {
  orang_tua: OrangTua[] = [...INITIAL_DEMO_DATA.orang_tua];
  siswa: Siswa[] = [...INITIAL_DEMO_DATA.siswa];
  program: Program[] = [...INITIAL_DEMO_DATA.program];
  mata_pelajaran: MataPelajaran[] = [...INITIAL_DEMO_DATA.mata_pelajaran];
  tutor: Tutor[] = [...INITIAL_DEMO_DATA.tutor];
  kelas: Kelas[] = [...INITIAL_DEMO_DATA.kelas];
  jadwal: Jadwal[] = [...INITIAL_DEMO_DATA.jadwal];
  penempatan: Penempatan[] = [...INITIAL_DEMO_DATA.penempatan];
  sesi: Sesi[] = [...INITIAL_DEMO_DATA.sesi];
  absensi: Absensi[] = [...INITIAL_DEMO_DATA.absensi];
  tindak_lanjut_absensi: TindakLanjutAbsensi[] = [...INITIAL_DEMO_DATA.tindak_lanjut_absensi];
  tagihan: Tagihan[] = [...INITIAL_DEMO_DATA.tagihan];
  pembayaran: Pembayaran[] = [...INITIAL_DEMO_DATA.pembayaran];
  rekap_honor: RekapHonor[] = [...INITIAL_DEMO_DATA.rekap_honor];
}

export const memoryStore = new MemoryStore();

export async function checkDatabaseConnection(): Promise<boolean> {
  const isProduction = process.env.NODE_ENV === "production";

  try {
    // Pengecekan koneksi PostgreSQL tanpa membocorkan kredensial
    await prisma.$queryRaw`SELECT 1`;
    isPostgresConnected = true;
    console.log("✅ Terhubung ke database PostgreSQL via Prisma ORM.");
    return true;
  } catch (error) {
    isPostgresConnected = false;

    if (isProduction) {
      // Pada mode produksi, kegagalan database tidak boleh beralih diam-diam ke memory store
      console.error("❌ [CRITICAL] Gagal terhubung ke database PostgreSQL pada mode PRODUCTION. Startup dihentikan demi integritas data.");
      throw new Error("Database connection failure in production environment");
    }

    // Pada mode development/demo, aktifkan fallback dengan log peringatan eksplisit
    console.warn("⚠️  [MODE DEMO / PENGEMBANGAN]");
    console.warn("    PostgreSQL belum aktif pada port 5432.");
    console.warn("    Mengaktifkan In-Memory Demo Store (Perubahan data tidak disimpan permanen ke database).");
    console.warn("    Jalankan PostgreSQL lokal atau 'docker compose up -d' untuk persistensi database.");
    return false;
  }
}

export function getIsPostgresConnected(): boolean {
  return isPostgresConnected;
}

export function getDatabaseStatus() {
  return {
    mode: isPostgresConnected ? "POSTGRESQL" : "IN_MEMORY_DEMO",
    isPostgresConnected,
    isPermanent: isPostgresConnected,
    message: isPostgresConnected
      ? "Terhubung ke database PostgreSQL (Data tersimpan permanen)"
      : "Mode Demo (In-Memory Store) — Perubahan data selama sesi tidak disimpan permanen ke PostgreSQL"
  };
}
