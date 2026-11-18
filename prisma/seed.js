"use strict";
// Seed data realistis untuk Sistem Informasi Manajemen Bimbel Cerdas
// Sesuai Aturan Bisnis BR-01 s/d BR-10 dan Data Dictionary
Object.defineProperty(exports, "__esModule", { value: true });
exports.INITIAL_SEED_DATA = void 0;
exports.INITIAL_SEED_DATA = {
    program: [
        { id_program: "prog-sd-01", nama_program: "Bimbel SD", tarif_spp: 300000.00, biaya_pendaftaran: 100000.00 },
        { id_program: "prog-smp-01", nama_program: "Bimbel SMP", tarif_spp: 400000.00, biaya_pendaftaran: 100000.00 },
        { id_program: "prog-utbk-01", nama_program: "Intensif UTBK", tarif_spp: 600000.00, biaya_pendaftaran: 100000.00 }
    ],
    mata_pelajaran: [
        { id_mapel: "mapel-mat-01", nama_mapel: "Matematika" },
        { id_mapel: "mapel-bing-01", nama_mapel: "Bahasa Inggris" },
        { id_mapel: "mapel-ipa-01", nama_mapel: "Ilmu Pengetahuan Alam (IPA)" }
    ],
    tutor: [
        { id_tutor: "tutor-01", nama_tutor: "Kak Rendy Pangemanan", kontak_tutor: "081299887711" },
        { id_tutor: "tutor-02", nama_tutor: "Kak Sarah Wijaya", kontak_tutor: "081344556677" },
        { id_tutor: "tutor-03", nama_tutor: "Kak Kevin Pratama (Tutor Pengganti)", kontak_tutor: "085711223344" }
    ],
    orang_tua: [
        { id_orang_tua: "ortu-01", no_hp: "081234567891", email: "keluarga.adit@example.com" },
        { id_orang_tua: "ortu-02", no_hp: "081234567892", email: "keluarga.santoso@example.com" },
        { id_orang_tua: "ortu-03", no_hp: "081234567893", email: "keluarga.citra@example.com" },
        { id_orang_tua: "ortu-04", no_hp: "081234567894", email: "keluarga.deni@example.com" }
    ],
    siswa: [
        { id_siswa: "siswa-01", id_orang_tua: "ortu-01", id_program: "prog-sd-01", nama_siswa: "Adit Pratama", tanggal_daftar: "2026-11-01", status_siswa: "AKTIF" },
        { id_siswa: "siswa-02", id_orang_tua: "ortu-02", id_program: "prog-sd-01", nama_siswa: "Budi Santoso (Anak ke-2)", tanggal_daftar: "2026-11-02", status_siswa: "AKTIF" },
        { id_siswa: "siswa-03", id_orang_tua: "ortu-03", id_program: "prog-sd-01", nama_siswa: "Citra Lestari", tanggal_daftar: "2026-11-02", status_siswa: "AKTIF" },
        { id_siswa: "siswa-04", id_orang_tua: "ortu-04", id_program: "prog-sd-01", nama_siswa: "Deni Saputra", tanggal_daftar: "2026-11-03", status_siswa: "AKTIF" }
    ],
    kelas: [
        {
            id_kelas: "kelas-mat-sd",
            id_program: "prog-sd-01",
            id_mapel: "mapel-mat-01",
            id_tutor_utama: "tutor-01",
            nama_kelas: "Matematika SD Kelas 5-A",
            kapasitas_maks: 8,
            status_kelas: "BERJALAN" // 4 siswa >= 3 (BR-01)
        },
        {
            id_kelas: "kelas-bing-smp",
            id_program: "prog-smp-01",
            id_mapel: "mapel-bing-01",
            id_tutor_utama: "tutor-02",
            nama_kelas: "Bahasa Inggris SMP Kelas 8",
            kapasitas_maks: 8,
            status_kelas: "MENUNGGU" // Belum ada siswa / < 3
        }
    ],
    jadwal: [
        {
            id_jadwal: "jadwal-mat-01",
            id_kelas: "kelas-mat-sd",
            hari: "Senin",
            jam_mulai: "15:30",
            jam_selesai: "17:00",
            frekuensi_per_minggu: 2,
            durasi_menit: 90
        },
        {
            id_jadwal: "jadwal-mat-02",
            id_kelas: "kelas-mat-sd",
            hari: "Kamis",
            jam_mulai: "15:30",
            jam_selesai: "17:00",
            frekuensi_per_minggu: 2,
            durasi_menit: 90
        }
    ],
    penempatan: [
        { id_penempatan: "pen-01", id_siswa: "siswa-01", id_kelas: "kelas-mat-sd", tanggal_penempatan: "2026-11-03", status_penempatan: "DITEMPATKAN" },
        { id_penempatan: "pen-02", id_siswa: "siswa-02", id_kelas: "kelas-mat-sd", tanggal_penempatan: "2026-11-03", status_penempatan: "DITEMPATKAN" },
        { id_penempatan: "pen-03", id_siswa: "siswa-03", id_kelas: "kelas-mat-sd", tanggal_penempatan: "2026-11-03", status_penempatan: "DITEMPATKAN" },
        { id_penempatan: "pen-04", id_siswa: "siswa-04", id_kelas: "kelas-mat-sd", tanggal_penempatan: "2026-11-04", status_penempatan: "DITEMPATKAN" }
    ],
    sesi: [
        {
            id_sesi: "sesi-01",
            id_kelas: "kelas-mat-sd",
            id_jadwal: "jadwal-mat-01",
            id_tutor_pengampu: "tutor-01", // Kak Rendy
            tanggal_sesi: "2026-11-04",
            status_sesi: "BERLANGSUNG"
        },
        {
            id_sesi: "sesi-02",
            id_kelas: "kelas-mat-sd",
            id_jadwal: "jadwal-mat-02",
            id_tutor_pengampu: "tutor-03", // Kak Kevin (TUTOR PENGGANTI - BR-08)
            tanggal_sesi: "2026-11-07",
            status_sesi: "BERLANGSUNG"
        },
        {
            id_sesi: "sesi-03",
            id_kelas: "kelas-mat-sd",
            id_jadwal: "jadwal-mat-01",
            id_tutor_pengampu: "tutor-01",
            tanggal_sesi: "2026-11-11",
            status_sesi: "BATAL" // Sesi Batal, honor = 0 (BR-09)
        },
        {
            id_sesi: "sesi-04",
            id_kelas: "kelas-mat-sd",
            id_jadwal: "jadwal-mat-02",
            id_tutor_pengampu: "tutor-01", // Kak Rendy
            tanggal_sesi: "2026-11-14",
            status_sesi: "BERLANGSUNG"
        }
    ],
    absensi: [
        // Sesi 1
        { id_absensi: "abs-01-01", id_sesi: "sesi-01", id_siswa: "siswa-01", status_kehadiran: "HADIR" },
        { id_absensi: "abs-01-02", id_sesi: "sesi-01", id_siswa: "siswa-02", status_kehadiran: "TIDAK_HADIR" }, // Absen 1
        { id_absensi: "abs-01-03", id_sesi: "sesi-01", id_siswa: "siswa-03", status_kehadiran: "HADIR" },
        { id_absensi: "abs-01-04", id_sesi: "sesi-01", id_siswa: "siswa-04", status_kehadiran: "HADIR" },
        // Sesi 2
        { id_absensi: "abs-02-01", id_sesi: "sesi-02", id_siswa: "siswa-01", status_kehadiran: "HADIR" },
        { id_absensi: "abs-02-02", id_sesi: "sesi-02", id_siswa: "siswa-02", status_kehadiran: "TIDAK_HADIR" }, // Absen 2
        { id_absensi: "abs-02-03", id_sesi: "sesi-02", id_siswa: "siswa-03", status_kehadiran: "HADIR" },
        { id_absensi: "abs-02-04", id_sesi: "sesi-02", id_siswa: "siswa-04", status_kehadiran: "HADIR" },
        // Sesi 4 (Sesi 3 batal)
        { id_absensi: "abs-04-01", id_sesi: "sesi-04", id_siswa: "siswa-01", status_kehadiran: "HADIR" },
        { id_absensi: "abs-04-02", id_sesi: "sesi-04", id_siswa: "siswa-02", status_kehadiran: "TIDAK_HADIR" }, // Absen 3 (Memicu Tindak Lanjut BR-10!)
        { id_absensi: "abs-04-03", id_sesi: "sesi-04", id_siswa: "siswa-03", status_kehadiran: "HADIR" },
        { id_absensi: "abs-04-04", id_sesi: "sesi-04", id_siswa: "siswa-04", status_kehadiran: "HADIR" }
    ],
    tindak_lanjut_absensi: [
    // Belum dicatat untuk Budi Santoso agar sistem menampilkan daftar pemicu tindak lanjut di dashboard Admin!
    ],
    tagihan: [
        {
            id_tagihan: "tag-01",
            id_siswa: "siswa-01",
            periode: "2026-11",
            jenis_tagihan: "SPP_BULANAN",
            nominal: 300000.00,
            diskon_persen: 0.00,
            total_tagihan: 300000.00,
            status_tagihan: "LUNAS"
        },
        {
            id_tagihan: "tag-02",
            id_siswa: "siswa-02", // Anak ke-2 keluarga Santoso (Diskon 10% BR-06)
            periode: "2026-11",
            jenis_tagihan: "SPP_BULANAN",
            nominal: 300000.00,
            diskon_persen: 10.00,
            total_tagihan: 270000.00,
            status_tagihan: "BELUM_LUNAS"
        },
        {
            id_tagihan: "tag-03",
            id_siswa: "siswa-03",
            periode: "2026-11",
            jenis_tagihan: "SPP_BULANAN",
            nominal: 300000.00,
            diskon_persen: 0.00,
            total_tagihan: 300000.00,
            status_tagihan: "BELUM_LUNAS"
        }
    ],
    pembayaran: [
        {
            id_pembayaran: "pem-01",
            id_tagihan: "tag-01",
            tanggal_bayar: "2026-11-05",
            jumlah_bayar: 300000.00,
            nomor_kuitansi: "KW-202611-001"
        }
    ],
    rekap_honor: [
    // Diisi lewat endpoint kalkulasi & simpan rekap oleh Pemilik
    ]
};
