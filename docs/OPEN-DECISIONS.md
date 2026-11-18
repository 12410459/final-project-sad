# Catatan Keputusan Terbuka (Open Decisions & Conservative Behaviors)
**Sistem Informasi Manajemen Bimbel Cerdas**

Dokumen ini mencatat seluruh butir kebutuhan, aturan bisnis, dan aspek teknis yang **belum diputuskan secara final oleh klien** berdasarkan wawancara Tahap 2 dan dokumen brief kasus. Untuk menjaga integritas sistem, arsitektur memilih pendekatan **paling konservatif (safe & non-destructive)** tanpa mengarang asumsi sepihak.

---

### 1. Akses Mandiri dan Akun Pengguna Orang Tua
* **Kondisi Terbuka:** Dokumen SRS menyatakan bahwa bentuk akses orang tua (apakah memiliki akun portal web mandiri, aplikasi mobile, atau sekadar menerima laporan via WhatsApp/telepon dari pihak bimbel) belum disepakati oleh Ibu Grace.
* **Keputusan Konservatif yang Diterapkan:**
  * Tidak mengaktifkan sistem login publik/portal produksi untuk orang tua.
  * Menyediakan antarmuka **Konsep Tampilan Orang Tua** dengan label/banner peringatan yang jelas: `[PERLU VALIDASI: Akses Orang Tua melalui aplikasi masih perlu dikonfirmasi]`.
  * Seluruh pencatatan pendaftaran, informasi kehadiran, dan status tagihan tetap dapat diakses dan dikelola secara penuh oleh **Admin (Kak Tirsa)**.

---

### 2. Kebijakan Pembayaran SPP, Cicilan, Denda, dan Kanal Pengingat
* **Kondisi Terbuka:**
  * Aturan mengenai pembayaran sebagian (cicilan), kelebihan bayar, denda keterlambatan, dan tanggal jatuh tempo belum diatur.
  * Kanal pengingat tagihan (SMS, WhatsApp API, atau telepon langsung) dan tahapan eskalasi pengingat belum terkonfirmasi.
* **Keputusan Konservatif yang Diterapkan:**
  * Status tagihan dihitung strictly berdasarkan total pembayaran yang tersimpan:
    * Jika `jumlah_bayar == 0` → `BELUM_LUNAS`
    * Jika `0 < jumlah_bayar < total_tagihan` → `SEBAGIAN` (dicatat transparan tanpa denda)
    * Jika `jumlah_bayar >= total_tagihan` → `LUNAS`
  * Tidak menyematkan gateway pembayaran otomatis (seperti Midtrans/Xendit) atau API WhatsApp pihak ketiga otomatis.
  * Admin disediakan daftar tagihan belum lunas lengkap dengan tombol pencatatan manual pengingat orang tua.

---

### 3. Autentikasi Pengguna & Pembagian Peran
* **Kondisi Terbuka:** Klien membutuhkan akun uji untuk setiap aktor saat presentasi (NFR-02 & NFR-03), namun sistem SSO / sistem autentikasi formal (misalnya JWT cookie berbasis refresh token dan database user) belum dispesifikasikan.
* **Keputusan Konservatif yang Diterapkan:**
  * Diimplementasikan **Demo Role Switcher** yang aman di UI untuk mempermudah pengujian keempat peran: **Admin**, **Pemilik**, **Tutor**, dan **Orang Tua**.
  * Setiap permintaan ke API menyertakan header role simulasi (`X-User-Role`, `X-User-Id`) sehingga backend menerapkan validasi otorisasi di tingkat middleware.
  * Ditegaskan dalam dokumentasi bahwa selector ini adalah alat demo dan evaluasi, bukan sistem keamanan produksi final.

---

### 4. Definisi Nilai Status Domain (Status Enums)
* **Kondisi Terbuka:** Beberapa kamus nilai status belum dibatasi secara eksplisit dalam SRS.
* **Keputusan Konservatif yang Diterapkan:**
  * `status_siswa`: `'TERDAFTAR'`, `'AKTIF'`, `'MENUNGGU_KELAS'`, `'NONAKTIF'`.
  * `status_kelas`: `'MENUNGGU'` (jika siswa < 3 sesuai `BR-01`), `'BERJALAN'` (jika siswa >= 3), `'SELESAI'`.
  * `status_penempatan`: `'DITEMPATKAN'`, `'DAFTAR_TUNGGU'` (jika kapasitas >= 8 sesuai `BR-02`), `'DIBATALKAN'`.
  * `status_sesi`: `'BERLANGSUNG'` (diperhitungkan honor sesuai `BR-07`), `'BATAL'` (tidak dihitung honor sesuai `BR-09`).
  * `status_kehadiran`: `'HADIR'`, `'TIDAK_HADIR'` (pemicu evaluasi 3x berturut-turut), `'IZIN'`, `'SAKIT'`.
  * `status_tagihan`: `'BELUM_LUNAS'`, `'SEBAGIAN'`, `'LUNAS'`.

---

### 5. Anomali Relasi Normalisasi ERD: `Siswa.id_program` vs `Penempatan`
* **Kondisi Terbuka:** Pada ERD sumber, entitas `Siswa` memiliki foreign key langsung `id_program`, sementara siswa juga memiliki relasi melalui `Penempatan` menuju `Kelas`, dan `Kelas` sendiri terikat ke `Program`. Hal ini menimbulkan redundansi relasi (potensi anomali jika program di kelas berbeda dengan program di siswa).
* **Keputusan Konservatif yang Diterapkan:**
  * Mengikuti ERD asli secara presisi tanpa menghapus kolom `id_program` pada tabel `Siswa` (untuk kepatuhan 100% terhadap ERD JSON).
  * Pada level aplikasi/API, saat siswa mendaftar, `id_program` dicatat sebagai peminatan program awal. Saat penempatan kelas dilakukan oleh Pemilik, sistem memvalidasi bahwa kelas yang dipilih harus sesuai dengan `id_program` siswa bersangkutan.

---

### 6. Snapshot dan Integritas Rekap Honor Tutor
* **Kondisi Terbuka:** SRS menghendaki honor tutor dihitung berdasarkan sesi aktual (`US-05`). Namun, jika sebuah rekap bulanan sudah ditutup/dicatat ke entitas `RekapHonor`, bagaimana bila terjadi koreksi data sesi di masa lampau?
* **Keputusan Konservatif yang Diterapkan:**
  * Backend bertindak sebagai *single source of truth* kalkulasi honor secara dinamis (`GET /api/honor/kalkulasi`).
  * Ketika Pemilik menyetujui dan menyimpan rekap (`POST /api/honor/simpan-rekap`), data disimpan sebagai **snapshot audit** di tabel `RekapHonor`.
  * Jika sesi diubah setelah snapshot dibuat, sistem menandai bahwa rekap telah berstatus `DISIMPAN` dan memerlukan kalkulasi ulang eksplisit dari Pemilik untuk mencegah perubahan sepihak.
