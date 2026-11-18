import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Menjalankan Prisma Database Seeder untuk Bimbel Cerdas...");

  // 1. Program
  await prisma.program.upsert({
    where: { id_program: "prog-sd-01" },
    update: {},
    create: { id_program: "prog-sd-01", nama_program: "Bimbel SD", tarif_spp: 300000.00, biaya_pendaftaran: 100000.00 },
  });
  await prisma.program.upsert({
    where: { id_program: "prog-smp-01" },
    update: {},
    create: { id_program: "prog-smp-01", nama_program: "Bimbel SMP", tarif_spp: 400000.00, biaya_pendaftaran: 100000.00 },
  });
  await prisma.program.upsert({
    where: { id_program: "prog-utbk-01" },
    update: {},
    create: { id_program: "prog-utbk-01", nama_program: "Intensif UTBK", tarif_spp: 600000.00, biaya_pendaftaran: 100000.00 },
  });

  // 2. Mata Pelajaran
  await prisma.mataPelajaran.upsert({
    where: { id_mapel: "mapel-mat-01" },
    update: {},
    create: { id_mapel: "mapel-mat-01", nama_mapel: "Matematika" },
  });
  await prisma.mataPelajaran.upsert({
    where: { id_mapel: "mapel-bing-01" },
    update: {},
    create: { id_mapel: "mapel-bing-01", nama_mapel: "Bahasa Inggris" },
  });
  await prisma.mataPelajaran.upsert({
    where: { id_mapel: "mapel-ipa-01" },
    update: {},
    create: { id_mapel: "mapel-ipa-01", nama_mapel: "Ilmu Pengetahuan Alam (IPA)" },
  });

  // 3. Tutor
  await prisma.tutor.upsert({
    where: { id_tutor: "tutor-01" },
    update: {},
    create: { id_tutor: "tutor-01", nama_tutor: "Kak Rendy Pangemanan", kontak_tutor: "081299887711" },
  });
  await prisma.tutor.upsert({
    where: { id_tutor: "tutor-02" },
    update: {},
    create: { id_tutor: "tutor-02", nama_tutor: "Kak Sarah Wijaya", kontak_tutor: "081344556677" },
  });
  await prisma.tutor.upsert({
    where: { id_tutor: "tutor-03" },
    update: {},
    create: { id_tutor: "tutor-03", nama_tutor: "Kak Kevin Pratama (Tutor Pengganti)", kontak_tutor: "085711223344" },
  });

  // 4. Orang Tua
  await prisma.orangTua.upsert({
    where: { id_orang_tua: "ortu-01" },
    update: {},
    create: { id_orang_tua: "ortu-01", no_hp: "081234567891", email: "keluarga.adit@example.com" },
  });
  await prisma.orangTua.upsert({
    where: { id_orang_tua: "ortu-02" },
    update: {},
    create: { id_orang_tua: "ortu-02", no_hp: "081234567892", email: "keluarga.santoso@example.com" },
  });
  await prisma.orangTua.upsert({
    where: { id_orang_tua: "ortu-03" },
    update: {},
    create: { id_orang_tua: "ortu-03", no_hp: "081234567893", email: "keluarga.citra@example.com" },
  });
  await prisma.orangTua.upsert({
    where: { id_orang_tua: "ortu-04" },
    update: {},
    create: { id_orang_tua: "ortu-04", no_hp: "081234567894", email: "keluarga.deni@example.com" },
  });

  // 5. Siswa
  await prisma.siswa.upsert({
    where: { id_siswa: "siswa-01" },
    update: {},
    create: { id_siswa: "siswa-01", id_orang_tua: "ortu-01", id_program: "prog-sd-01", nama_siswa: "Adit Pratama", status_siswa: "AKTIF" },
  });
  await prisma.siswa.upsert({
    where: { id_siswa: "siswa-02" },
    update: {},
    create: { id_siswa: "siswa-02", id_orang_tua: "ortu-02", id_program: "prog-sd-01", nama_siswa: "Budi Santoso (Anak ke-2)", status_siswa: "AKTIF" },
  });
  await prisma.siswa.upsert({
    where: { id_siswa: "siswa-03" },
    update: {},
    create: { id_siswa: "siswa-03", id_orang_tua: "ortu-03", id_program: "prog-sd-01", nama_siswa: "Citra Lestari", status_siswa: "AKTIF" },
  });
  await prisma.siswa.upsert({
    where: { id_siswa: "siswa-04" },
    update: {},
    create: { id_siswa: "siswa-04", id_orang_tua: "ortu-04", id_program: "prog-sd-01", nama_siswa: "Deni Saputra", status_siswa: "AKTIF" },
  });

  // 6. Kelas
  await prisma.kelas.upsert({
    where: { id_kelas: "kelas-mat-sd" },
    update: {},
    create: {
      id_kelas: "kelas-mat-sd",
      id_program: "prog-sd-01",
      id_mapel: "mapel-mat-01",
      id_tutor_utama: "tutor-01",
      nama_kelas: "Matematika SD Kelas 5-A",
      kapasitas_maks: 8,
      status_kelas: "BERJALAN",
    },
  });
  await prisma.kelas.upsert({
    where: { id_kelas: "kelas-bing-smp" },
    update: {},
    create: {
      id_kelas: "kelas-bing-smp",
      id_program: "prog-smp-01",
      id_mapel: "mapel-bing-01",
      id_tutor_utama: "tutor-02",
      nama_kelas: "Bahasa Inggris SMP Kelas 8",
      kapasitas_maks: 8,
      status_kelas: "MENUNGGU",
    },
  });

  // 7. Jadwal
  await prisma.jadwal.upsert({
    where: { id_jadwal: "jadwal-mat-01" },
    update: {},
    create: {
      id_jadwal: "jadwal-mat-01",
      id_kelas: "kelas-mat-sd",
      hari: "Senin",
      jam_mulai: "15:30",
      jam_selesai: "17:00",
      frekuensi_per_minggu: 2,
      durasi_menit: 90,
    },
  });
  await prisma.jadwal.upsert({
    where: { id_jadwal: "jadwal-mat-02" },
    update: {},
    create: {
      id_jadwal: "jadwal-mat-02",
      id_kelas: "kelas-mat-sd",
      hari: "Kamis",
      jam_mulai: "15:30",
      jam_selesai: "17:00",
      frekuensi_per_minggu: 2,
      durasi_menit: 90,
    },
  });

  // 8. Penempatan
  await prisma.penempatan.upsert({
    where: { id_penempatan: "pen-01" },
    update: {},
    create: { id_penempatan: "pen-01", id_siswa: "siswa-01", id_kelas: "kelas-mat-sd", status_penempatan: "DITEMPATKAN" },
  });
  await prisma.penempatan.upsert({
    where: { id_penempatan: "pen-02" },
    update: {},
    create: { id_penempatan: "pen-02", id_siswa: "siswa-02", id_kelas: "kelas-mat-sd", status_penempatan: "DITEMPATKAN" },
  });
  await prisma.penempatan.upsert({
    where: { id_penempatan: "pen-03" },
    update: {},
    create: { id_penempatan: "pen-03", id_siswa: "siswa-03", id_kelas: "kelas-mat-sd", status_penempatan: "DITEMPATKAN" },
  });
  await prisma.penempatan.upsert({
    where: { id_penempatan: "pen-04" },
    update: {},
    create: { id_penempatan: "pen-04", id_siswa: "siswa-04", id_kelas: "kelas-mat-sd", status_penempatan: "DITEMPATKAN" },
  });

  // 9. Sesi
  await prisma.sesi.upsert({
    where: { id_sesi: "sesi-01" },
    update: {},
    create: { id_sesi: "sesi-01", id_kelas: "kelas-mat-sd", id_tutor_pengampu: "tutor-01", tanggal_sesi: new Date("2026-11-04"), status_sesi: "BERLANGSUNG" },
  });
  await prisma.sesi.upsert({
    where: { id_sesi: "sesi-02" },
    update: {},
    create: { id_sesi: "sesi-02", id_kelas: "kelas-mat-sd", id_tutor_pengampu: "tutor-03", tanggal_sesi: new Date("2026-11-07"), status_sesi: "BERLANGSUNG" },
  });
  await prisma.sesi.upsert({
    where: { id_sesi: "sesi-03" },
    update: {},
    create: { id_sesi: "sesi-03", id_kelas: "kelas-mat-sd", id_tutor_pengampu: "tutor-01", tanggal_sesi: new Date("2026-11-11"), status_sesi: "BATAL" },
  });
  await prisma.sesi.upsert({
    where: { id_sesi: "sesi-04" },
    update: {},
    create: { id_sesi: "sesi-04", id_kelas: "kelas-mat-sd", id_tutor_pengampu: "tutor-01", tanggal_sesi: new Date("2026-11-14"), status_sesi: "BERLANGSUNG" },
  });

  // 10. Tagihan
  await prisma.tagihan.upsert({
    where: { id_tagihan: "tag-01" },
    update: {},
    create: { id_tagihan: "tag-01", id_siswa: "siswa-01", periode: "2026-11", jenis_tagihan: "SPP_BULANAN", nominal: 300000.00, diskon_persen: 0.00, total_tagihan: 300000.00, status_tagihan: "LUNAS" },
  });
  await prisma.tagihan.upsert({
    where: { id_tagihan: "tag-02" },
    update: {},
    create: { id_tagihan: "tag-02", id_siswa: "siswa-02", periode: "2026-11", jenis_tagihan: "SPP_BULANAN", nominal: 300000.00, diskon_persen: 10.00, total_tagihan: 270000.00, status_tagihan: "BELUM_LUNAS" },
  });

  console.log("✅ Seeding database selesai!");
}

main()
  .catch((e: any) => {
    if (e.message?.includes("Can't reach database server") || e.message?.includes("connection")) {
      console.warn("⚠️  [INFORMASI SETUP]");
      console.warn("    Database PostgreSQL belum berjalan pada localhost:5432.");
      console.warn("    Jalankan PostgreSQL lokal atau 'docker compose up -d' untuk menggunakan database permanen.");
      console.warn("    (Aplikasi web backend tetap dapat berjalan normal menggunakan mode demo fallback).");
      process.exit(0);
    }
    console.error("❌ Terjadi kesalahan saat seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
