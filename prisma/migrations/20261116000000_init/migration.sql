-- CreateTable
CREATE TABLE "orang_tua" (
    "id_orang_tua" TEXT NOT NULL,
    "no_hp" TEXT NOT NULL,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orang_tua_pkey" PRIMARY KEY ("id_orang_tua")
);

-- CreateTable
CREATE TABLE "siswa" (
    "id_siswa" TEXT NOT NULL,
    "id_orang_tua" TEXT NOT NULL,
    "id_program" TEXT NOT NULL,
    "nama_siswa" TEXT NOT NULL,
    "tanggal_daftar" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status_siswa" TEXT NOT NULL DEFAULT 'TERDAFTAR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "siswa_pkey" PRIMARY KEY ("id_siswa")
);

-- CreateTable
CREATE TABLE "program" (
    "id_program" TEXT NOT NULL,
    "nama_program" TEXT NOT NULL,
    "tarif_spp" DECIMAL(12,2) NOT NULL,
    "biaya_pendaftaran" DECIMAL(12,2) NOT NULL DEFAULT 100000.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_pkey" PRIMARY KEY ("id_program")
);

-- CreateTable
CREATE TABLE "mata_pelajaran" (
    "id_mapel" TEXT NOT NULL,
    "nama_mapel" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mata_pelajaran_pkey" PRIMARY KEY ("id_mapel")
);

-- CreateTable
CREATE TABLE "tutor" (
    "id_tutor" TEXT NOT NULL,
    "nama_tutor" TEXT NOT NULL,
    "kontak_tutor" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutor_pkey" PRIMARY KEY ("id_tutor")
);

-- CreateTable
CREATE TABLE "kelas" (
    "id_kelas" TEXT NOT NULL,
    "id_program" TEXT NOT NULL,
    "id_mapel" TEXT NOT NULL,
    "id_tutor_utama" TEXT NOT NULL,
    "nama_kelas" TEXT NOT NULL,
    "kapasitas_maks" INTEGER NOT NULL DEFAULT 8,
    "status_kelas" TEXT NOT NULL DEFAULT 'MENUNGGU',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kelas_pkey" PRIMARY KEY ("id_kelas")
);

-- CreateTable
CREATE TABLE "jadwal" (
    "id_jadwal" TEXT NOT NULL,
    "id_kelas" TEXT NOT NULL,
    "hari" TEXT NOT NULL,
    "jam_mulai" TEXT NOT NULL,
    "jam_selesai" TEXT NOT NULL,
    "frekuensi_per_minggu" INTEGER NOT NULL DEFAULT 2,
    "durasi_menit" INTEGER NOT NULL DEFAULT 90,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jadwal_pkey" PRIMARY KEY ("id_jadwal")
);

-- CreateTable
CREATE TABLE "penempatan" (
    "id_penempatan" TEXT NOT NULL,
    "id_siswa" TEXT NOT NULL,
    "id_kelas" TEXT NOT NULL,
    "tanggal_penempatan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status_penempatan" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "penempatan_pkey" PRIMARY KEY ("id_penempatan")
);

-- CreateTable
CREATE TABLE "sesi" (
    "id_sesi" TEXT NOT NULL,
    "id_kelas" TEXT NOT NULL,
    "id_jadwal" TEXT,
    "id_tutor_pengampu" TEXT NOT NULL,
    "tanggal_sesi" TIMESTAMP(3) NOT NULL,
    "status_sesi" TEXT NOT NULL DEFAULT 'BERLANGSUNG',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sesi_pkey" PRIMARY KEY ("id_sesi")
);

-- CreateTable
CREATE TABLE "absensi" (
    "id_absensi" TEXT NOT NULL,
    "id_sesi" TEXT NOT NULL,
    "id_siswa" TEXT NOT NULL,
    "status_kehadiran" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "absensi_pkey" PRIMARY KEY ("id_absensi")
);

-- CreateTable
CREATE TABLE "tindak_lanjut_absensi" (
    "id_tindak_lanjut" TEXT NOT NULL,
    "id_siswa" TEXT NOT NULL,
    "tanggal_telepon" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hasil_telepon" TEXT NOT NULL,
    "catatan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tindak_lanjut_absensi_pkey" PRIMARY KEY ("id_tindak_lanjut")
);

-- CreateTable
CREATE TABLE "tagihan" (
    "id_tagihan" TEXT NOT NULL,
    "id_siswa" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "jenis_tagihan" TEXT NOT NULL,
    "nominal" DECIMAL(12,2) NOT NULL,
    "diskon_persen" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "total_tagihan" DECIMAL(12,2) NOT NULL,
    "status_tagihan" TEXT NOT NULL DEFAULT 'BELUM_LUNAS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tagihan_pkey" PRIMARY KEY ("id_tagihan")
);

-- CreateTable
CREATE TABLE "pembayaran" (
    "id_pembayaran" TEXT NOT NULL,
    "id_tagihan" TEXT NOT NULL,
    "tanggal_bayar" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jumlah_bayar" DECIMAL(12,2) NOT NULL,
    "nomor_kuitansi" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pembayaran_pkey" PRIMARY KEY ("id_pembayaran")
);

-- CreateTable
CREATE TABLE "rekap_honor" (
    "id_rekap_honor" TEXT NOT NULL,
    "id_tutor" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "jumlah_sesi" INTEGER NOT NULL,
    "tarif_per_sesi" DECIMAL(12,2) NOT NULL DEFAULT 75000.00,
    "total_honor" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rekap_honor_pkey" PRIMARY KEY ("id_rekap_honor")
);

-- CreateIndex
CREATE UNIQUE INDEX "absensi_id_sesi_id_siswa_key" ON "absensi"("id_sesi", "id_siswa");

-- CreateIndex
CREATE UNIQUE INDEX "pembayaran_nomor_kuitansi_key" ON "pembayaran"("nomor_kuitansi");

-- AddForeignKey
ALTER TABLE "siswa" ADD CONSTRAINT "siswa_id_orang_tua_fkey" FOREIGN KEY ("id_orang_tua") REFERENCES "orang_tua"("id_orang_tua") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siswa" ADD CONSTRAINT "siswa_id_program_fkey" FOREIGN KEY ("id_program") REFERENCES "program"("id_program") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_id_program_fkey" FOREIGN KEY ("id_program") REFERENCES "program"("id_program") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_id_mapel_fkey" FOREIGN KEY ("id_mapel") REFERENCES "mata_pelajaran"("id_mapel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_id_tutor_utama_fkey" FOREIGN KEY ("id_tutor_utama") REFERENCES "tutor"("id_tutor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal" ADD CONSTRAINT "jadwal_id_kelas_fkey" FOREIGN KEY ("id_kelas") REFERENCES "kelas"("id_kelas") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penempatan" ADD CONSTRAINT "penempatan_id_siswa_fkey" FOREIGN KEY ("id_siswa") REFERENCES "siswa"("id_siswa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penempatan" ADD CONSTRAINT "penempatan_id_kelas_fkey" FOREIGN KEY ("id_kelas") REFERENCES "kelas"("id_kelas") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesi" ADD CONSTRAINT "sesi_id_kelas_fkey" FOREIGN KEY ("id_kelas") REFERENCES "kelas"("id_kelas") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesi" ADD CONSTRAINT "sesi_id_jadwal_fkey" FOREIGN KEY ("id_jadwal") REFERENCES "jadwal"("id_jadwal") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesi" ADD CONSTRAINT "sesi_id_tutor_pengampu_fkey" FOREIGN KEY ("id_tutor_pengampu") REFERENCES "tutor"("id_tutor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_id_sesi_fkey" FOREIGN KEY ("id_sesi") REFERENCES "sesi"("id_sesi") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_id_siswa_fkey" FOREIGN KEY ("id_siswa") REFERENCES "siswa"("id_siswa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tindak_lanjut_absensi" ADD CONSTRAINT "tindak_lanjut_absensi_id_siswa_fkey" FOREIGN KEY ("id_siswa") REFERENCES "siswa"("id_siswa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagihan" ADD CONSTRAINT "tagihan_id_siswa_fkey" FOREIGN KEY ("id_siswa") REFERENCES "siswa"("id_siswa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_id_tagihan_fkey" FOREIGN KEY ("id_tagihan") REFERENCES "tagihan"("id_tagihan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rekap_honor" ADD CONSTRAINT "rekap_honor_id_tutor_fkey" FOREIGN KEY ("id_tutor") REFERENCES "tutor"("id_tutor") ON DELETE RESTRICT ON UPDATE CASCADE;
