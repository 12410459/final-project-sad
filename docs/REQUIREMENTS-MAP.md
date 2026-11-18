# Requirements Traceability Map (Peta Keterlacakan Kebutuhan)
**Sistem Informasi Manajemen Bimbel Cerdas**

Dokumen ini memetakan hubungan antara Use Case (US-01 s/d US-06), Kebutuhan Fungsional (REQ-01 s/d REQ-17), Aturan Bisnis (BR-01 s/d BR-10), Layar Antarmuka, Aksi Pengguna, Entitas/Tabel Database, dan Endpoint REST API.

---

## Tabel Pemetaan Kebutuhan ke Sistem

| Kode Use Case | Kebutuhan & Aturan Bisnis | Layar / Halaman | Aksi Pengguna | Entitas / Tabel Database | Endpoint REST API | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **US-01** Pendaftaran & Penempatan Siswa | `REQ-01`, `REQ-02`, `REQ-03`<br>`BR-01`, `BR-02` | **Admin:** Registrasi Siswa<br>**Pemilik:** Penempatan Kelas & Daftar Tunggu<br>**Orang Tua:** Form Pendaftaran (Konsep) | 1. Admin/Orang tua mengisi formulir siswa & kontak orang tua.<br>2. Pemilik melihat kapasitas kelas.<br>3. Pemilik menempatkan siswa ke kelas atau daftar tunggu jika kelas penuh (maks 8).<br>4. Sistem mengecek status berjalan (min 3 siswa). | `OrangTua`, `Siswa`, `Program`, `Kelas`, `Penempatan` | `POST /api/pendaftaran`<br>`GET /api/siswa`<br>`GET /api/penempatan/daftar-tunggu`<br>`POST /api/penempatan` | Implemented |
| **US-02** Informasi Kehadiran & Tagihan | `REQ-02`, `REQ-07`, `REQ-09`, `REQ-17` | **Admin:** Monitoring Siswa & Absensi<br>**Orang Tua:** Ringkasan Kehadiran & Tagihan (Konsep) | 1. Admin memeriksa histori kehadiran siswa.<br>2. Admin melihat akumulasi absensi berturut-turut.<br>3. Admin/Orang tua melihat riwayat tagihan SPP. | `Siswa`, `Absensi`, `Sesi`, `Tagihan`, `Pembayaran` | `GET /api/siswa/:id/ringkasan`<br>`GET /api/absensi/siswa/:id` | Implemented |
| **US-03** Pembayaran & Tindak Lanjut Absensi | `REQ-07`, `REQ-08`, `REQ-10`, `REQ-11`, `REQ-12`, `REQ-13`<br>`BR-06`, `BR-10` | **Admin:** Tagihan & Pembayaran SPP<br>**Admin:** Tindak Lanjut Absensi 3x | 1. Admin melihat daftar tagihan belum lunas.<br>2. Admin mencatat pembayaran & menerbitkan nomor kuitansi.<br>3. Sistem mendeteksi otomatis siswa absen 3x berturut-turut.<br>4. Admin mencatat hasil telepon orang tua & catatan tindak lanjut. | `Tagihan`, `Pembayaran`, `TindakLanjutAbsensi`, `Siswa`, `Absensi` | `GET /api/tagihan/belum-lunas`<br>`POST /api/pembayaran`<br>`GET /api/tindak-lanjut/perlu-telepon`<br>`POST /api/tindak-lanjut` | Implemented |
| **US-04** Pengaturan Kelas, Jadwal, & Tutor | `REQ-02`, `REQ-03`, `REQ-04`, `REQ-15`<br>`BR-01`, `BR-02`, `BR-03`, `BR-08` | **Pemilik:** Manajemen Kelas, Program & Jadwal | 1. Pemilik membuat/mengedit kelas dan menentukan tutor utama.<br>2. Pemilik mengatur jadwal (2x seminggu @ 90 menit).<br>3. Sistem mendeteksi potensi bentrok jadwal (tutor/ruang).<br>4. Pemilik menetapkan tutor pengganti pada sesi tertentu tanpa menimpa tutor utama kelas. | `Program`, `MataPelajaran`, `Kelas`, `Jadwal`, `Tutor`, `Sesi` | `GET /api/kelas`<br>`POST /api/kelas`<br>`GET /api/jadwal`<br>`POST /api/jadwal`<br>`GET /api/jadwal/cek-bentrok`<br>`POST /api/sesi/tutor-pengganti` | Implemented |
| **US-05** Rekap Honor Bulanan | `REQ-14`, `REQ-15`, `REQ-16`<br>`BR-07`, `BR-08`, `BR-09` | **Pemilik:** Rekapitulasi Honor Tutor | 1. Pemilik memilih periode bulan/tahun.<br>2. Backend menghitung jumlah sesi riil yang berstatus berlangsung.<br>3. Sesi batal/tidak berlangsung tidak dihitung (Rp 0).<br>4. Tutor pengganti memperoleh honor sesi yang dia ampu.<br>5. Pemilik membekukan/mencatat snapshot ke tabel `RekapHonor`. | `RekapHonor`, `Tutor`, `Sesi`, `Kelas` | `GET /api/honor/kalkulasi`<br>`POST /api/honor/simpan-rekap`<br>`GET /api/honor/riwayat` | Implemented |
| **US-06** Pencatatan Sesi & Absensi | `REQ-05`, `REQ-06`, `REQ-15`<br>`BR-07`, `BR-09` | **Tutor:** Jadwal & Absensi Pertemuan | 1. Tutor melihat kelas dan daftar siswa yang diampu.<br>2. Tutor mencatat sesi (berlangsung / batal).<br>3. Tutor mencatat kehadiran siswa (hadir / tidak hadir / izin / sakit).<br>4. Tutor pengganti mengonfirmasi status pengampu aktual pada sesi. | `Sesi`, `Absensi`, `Kelas`, `Siswa`, `Tutor` | `GET /api/sesi/kelas/:id`<br>`POST /api/sesi`<br>`POST /api/absensi` | Implemented |

---

## Matriks Hubungan Aktor dengan Hak Akses Fitur

| Fitur / Layar | Orang Tua (Konsep) | Admin (Kak Tirsa) | Pemilik (Ibu Grace) | Tutor |
| :--- | :---: | :---: | :---: | :---: |
| Formulir Pendaftaran Siswa | Read/Submit (Draft) | Full Access (Create/Read) | Full Access | No Access |
| Manajemen Kelas & Penempatan | No Access | View Only | Full Access (Create/Update) | View Kelas Diampu |
| Pencatatan Sesi & Absensi Siswa | No Access | View Only | View Only | Full Access (Sesi Diampu) |
| Tindak Lanjut Absensi 3x | No Access | Full Access (Log Telepon) | View Only | No Access |
| Tagihan, Diskon & Pembayaran SPP | View Info (Draft) | Full Access (Catat Bayar/Kuitansi) | Full Access (Audit) | No Access |
| Perhitungan & Snapshot Honor Tutor | No Access | No Access | Full Access (Kalkulasi & Simpan) | View Rekap Mandiri |
