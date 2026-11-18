# Kamus Data (Data Dictionary)
**Sistem Informasi Manajemen Bimbel Cerdas**

Dokumen ini mendefinisikan 14 entitas domain utama sesuai diagram ERD (`Bimbel_Cerdas_UML_Studio_Tertaut_SRS.json`), tipe data PostgreSQL, Primary Key (PK), Foreign Key (FK), *constraint*, dan sumber aturan bisnisnya.

---

### 1. Entitas `OrangTua`
Menyimpan identitas kontak orang tua/wali murid yang mendaftar.
* **Tabel:** `orang_tua`
* **Kolom:**
  * `id_orang_tua` (VARCHAR(36) / UUID, PK): Identitas unik orang tua.
  * `no_hp` (VARCHAR(20), Not Null): Nomor telepon/WhatsApp aktif orang tua untuk tindak lanjut absensi (`BR-10`).
  * `email` (VARCHAR(100), Nullable): Alamat email orang tua (opsional jika tersedia).

---

### 2. Entitas `Siswa`
Menyimpan data anak/siswa yang didaftarkan ke bimbel.
* **Tabel:** `siswa`
* **Kolom:**
  * `id_siswa` (VARCHAR(36) / UUID, PK): Identitas unik siswa.
  * `id_orang_tua` (VARCHAR(36), FK -> `orang_tua.id_orang_tua`, Not Null): Relasi ke orang tua.
  * `id_program` (VARCHAR(36), FK -> `program.id_program`, Not Null): Program/jenjang peminatan yang dipilih saat pendaftaran.
  * `nama_siswa` (VARCHAR(100), Not Null): Nama lengkap siswa.
  * `tanggal_daftar` (DATE, Not Null, Default: CURRENT_DATE): Tanggal pengisian formulir pendaftaran.
  * `status_siswa` (VARCHAR(30), Not Null, Default: 'TERDAFTAR'): Status siswa (`TERDAFTAR`, `AKTIF`, `MENUNGGU_KELAS`, `NONAKTIF`).

---

### 3. Entitas `Program`
Katalog jenjang pendidikan atau paket bimbingan belajar.
* **Tabel:** `program`
* **Kolom:**
  * `id_program` (VARCHAR(36) / UUID, PK): Identitas unik program.
  * `nama_program` (VARCHAR(50), Not Null): Nama program (misal: 'SD', 'SMP', 'UTBK' sesuai `BR-04`).
  * `tarif_spp` (DECIMAL(12,2), Not Null): Tarif SPP per bulan (`BR-04`: SD Rp300.000, SMP Rp400.000, UTBK Rp600.000).
  * `biaya_pendaftaran` (DECIMAL(12,2), Not Null, Default: 100000.00): Biaya satu kali pendaftaran (`BR-05`: Rp100.000).

---

### 4. Entitas `MataPelajaran`
Daftar mata pelajaran bimbingan.
* **Tabel:** `mata_pelajaran`
* **Kolom:**
  * `id_mapel` (VARCHAR(36) / UUID, PK): Identitas unik mata pelajaran.
  * `nama_mapel` (VARCHAR(100), Not Null): Nama mata pelajaran (misal: Matematika, Bahasa Inggris, IPA).

---

### 5. Entitas `Tutor`
Data tenaga pengajar di Bimbel Cerdas.
* **Tabel:** `tutor`
* **Kolom:**
  * `id_tutor` (VARCHAR(36) / UUID, PK): Identitas unik tutor.
  * `nama_tutor` (VARCHAR(100), Not Null): Nama lengkap tutor.
  * `kontak_tutor` (VARCHAR(50), Not Null): Nomor kontak telepon/email tutor.

---

### 6. Entitas `Kelas`
Kelompok belajar bimbingan.
* **Tabel:** `kelas`
* **Kolom:**
  * `id_kelas` (VARCHAR(36) / UUID, PK): Identitas unik kelas.
  * `id_program` (VARCHAR(36), FK -> `program.id_program`, Not Null): Jenjang/program kelas.
  * `id_mapel` (VARCHAR(36), FK -> `mata_pelajaran.id_mapel`, Not Null): Mata pelajaran kelas.
  * `id_tutor_utama` (VARCHAR(36), FK -> `tutor.id_tutor`, Not Null): Tutor penanggung jawab utama kelas.
  * `nama_kelas` (VARCHAR(100), Not Null): Nama/kode rombel kelas (misal: 'Matematika SD Kelas 5-A').
  * `kapasitas_maks` (INTEGER, Not Null, Default: 8): Kapasitas maksimal kelas (`BR-02`: 8 siswa).
  * `status_kelas` (VARCHAR(30), Not Null, Default: 'MENUNGGU'): Status operasional (`BR-01`: 'MENUNGGU' jika < 3 siswa, 'BERJALAN' jika >= 3 siswa).

---

### 7. Entitas `Jadwal`
Rencana pertemuan rutin mingguan kelas.
* **Tabel:** `jadwal`
* **Kolom:**
  * `id_jadwal` (VARCHAR(36) / UUID, PK): Identitas unik jadwal.
  * `id_kelas` (VARCHAR(36), FK -> `kelas.id_kelas`, Not Null): Kelas terkait.
  * `hari` (VARCHAR(20), Not Null): Hari pertemuan (misal: 'Senin', 'Kamis' sesuai `BR-03`).
  * `jam_mulai` (TIME, Not Null): Waktu mulai sesi (misal: '15:30:00').
  * `jam_selesai` (TIME, Not Null): Waktu selesai sesi (misal: '17:00:00').
  * `frekuensi_per_minggu` (INTEGER, Not Null, Default: 2): Frekuensi pertemuan mingguan (`BR-03`: 2 kali seminggu).
  * `durasi_menit` (INTEGER, Not Null, Default: 90): Durasi setiap sesi (`BR-03`: 90 menit).

---

### 8. Entitas `Penempatan`
Pencatatan siswa yang ditempatkan ke kelas atau daftar tunggu.
* **Tabel:** `penempatan`
* **Kolom:**
  * `id_penempatan` (VARCHAR(36) / UUID, PK): Identitas unik penempatan.
  * `id_siswa` (VARCHAR(36), FK -> `siswa.id_siswa`, Not Null): Siswa yang ditempatkan.
  * `id_kelas` (VARCHAR(36), FK -> `kelas.id_kelas`, Not Null): Kelas tujuan penempatan.
  * `tanggal_penempatan` (DATE, Not Null, Default: CURRENT_DATE): Tanggal penempatan.
  * `status_penempatan` (VARCHAR(30), Not Null): `'DITEMPATKAN'` jika kapasitas masih tersedia (< 8), `'DAFTAR_TUNGGU'` jika kelas penuh (>= 8).

---

### 9. Entitas `Sesi`
Realisasi pertemuan belajar per tanggal/waktu spesifik.
* **Tabel:** `sesi`
* **Kolom:**
  * `id_sesi` (VARCHAR(36) / UUID, PK): Identitas unik sesi.
  * `id_kelas` (VARCHAR(36), FK -> `kelas.id_kelas`, Not Null): Kelas yang mengadakan sesi.
  * `id_jadwal` (VARCHAR(36), FK -> `jadwal.id_jadwal`, Nullable): Jadwal acuan sesi (opsional bila sesi pengganti).
  * `id_tutor_pengampu` (VARCHAR(36), FK -> `tutor.id_tutor`, Not Null): Tutor riil yang mengajar sesi ini (bisa tutor utama atau tutor pengganti sesuai `BR-08`).
  * `tanggal_sesi` (DATE, Not Null): Tanggal pertemuan berlangsung.
  * `status_sesi` (VARCHAR(30), Not Null): `'BERLANGSUNG'` (berhak honor sesuai `BR-07`) atau `'BATAL'` (tidak dihitung honor sesuai `BR-09`).

---

### 10. Entitas `Absensi`
Presensi per siswa pada satu pertemuan sesi kelas tertentu.
* **Tabel:** `absensi`
* **Kolom:**
  * `id_absensi` (VARCHAR(36) / UUID, PK): Identitas unik rekaman absensi.
  * `id_sesi` (VARCHAR(36), FK -> `sesi.id_sesi`, Not Null): Sesi pertemuan terkait.
  * `id_siswa` (VARCHAR(36), FK -> `siswa.id_siswa`, Not Null): Siswa yang dinilai kehadirannya.
  * `status_kehadiran` (VARCHAR(20), Not Null): Status presensi (`'HADIR'`, `'TIDAK_HADIR'`, `'IZIN'`, `'SAKIT'`).
* **Constraint Unik:** `UNIQUE(id_sesi, id_siswa)` – satu siswa hanya memiliki 1 catatan absensi dalam 1 sesi.

---

### 11. Entitas `TindakLanjutAbsensi`
Log komunikasi admin terhadap orang tua akibat 3x absen berturut-turut.
* **Tabel:** `tindak_lanjut_absensi`
* **Kolom:**
  * `id_tindak_lanjut` (VARCHAR(36) / UUID, PK): Identitas unik log tindak lanjut.
  * `id_siswa` (VARCHAR(36), FK -> `siswa.id_siswa`, Not Null): Siswa yang bersangkutan.
  * `tanggal_telepon` (DATE, Not Null, Default: CURRENT_DATE): Tanggal Kak Tirsa menelepon orang tua (`BR-10`).
  * `hasil_telepon` (TEXT, Not Null): Ringkasan percakapan (misal: "Orang tua konfirmasi anak sedang sakit tifus").
  * `catatan` (TEXT, Nullable): Tindak lanjut berikutnya (misal: "Jadwal kembali aktif hari Kamis").

---

### 12. Entitas `Tagihan`
Rincian kewajiban SPP dan biaya pendaftaran per siswa.
* **Tabel:** `tagihan`
* **Kolom:**
  * `id_tagihan` (VARCHAR(36) / UUID, PK): Identitas unik tagihan.
  * `id_siswa` (VARCHAR(36), FK -> `siswa.id_siswa`, Not Null): Siswa pembayar.
  * `periode` (VARCHAR(20), Not Null): Periode tagihan (misal: '2026-11' atau 'PENDAFTARAN').
  * `jenis_tagihan` (VARCHAR(30), Not Null): Jenis tagihan (`'SPP_BULANAN'`, `'BIAYA_PENDAFTARAN'`).
  * `nominal` (DECIMAL(12,2), Not Null): Nominal kotor sebelum diskon.
  * `diskon_persen` (DECIMAL(5,2), Not Null, Default: 0.00): Persentase diskon (`BR-06`: 10% untuk anak kedua dst).
  * `total_tagihan` (DECIMAL(12,2), Not Null): Nominal bersih yang harus dibayar.
  * `status_tagihan` (VARCHAR(20), Not Null, Default: 'BELUM_LUNAS'): Status (`'BELUM_LUNAS'`, `'SEBAGIAN'`, `'LUNAS'`).

---

### 13. Entitas `Pembayaran`
Pencatatan bukti transaksi pembayaran yang diterima admin.
* **Tabel:** `pembayaran`
* **Kolom:**
  * `id_pembayaran` (VARCHAR(36) / UUID, PK): Identitas unik pembayaran.
  * `id_tagihan` (VARCHAR(36), FK -> `tagihan.id_tagihan`, Not Null): Tagihan yang dibayar.
  * `tanggal_bayar` (DATE, Not Null, Default: CURRENT_DATE): Tanggal kas masuk.
  * `jumlah_bayar` (DECIMAL(12,2), Not Null): Nominal pembayaran yang diterima.
  * `nomor_kuitansi` (VARCHAR(50), Not Null, Unique): Nomor bukti kuitansi (misal: 'KW-202611-001').

---

### 14. Entitas `RekapHonor`
Snapshot audit perhitungan honor bulanan tutor.
* **Tabel:** `rekap_honor`
* **Kolom:**
  * `id_rekap_honor` (VARCHAR(36) / UUID, PK): Identitas unik rekaman rekap honor.
  * `id_tutor` (VARCHAR(36), FK -> `tutor.id_tutor`, Not Null): Tutor penerima honor.
  * `periode` (VARCHAR(20), Not Null): Periode perhitungan (misal: '2026-11').
  * `jumlah_sesi` (INTEGER, Not Null): Total sesi berlangsung yang riil diampu tutor pada periode tersebut (`BR-07`, `BR-09`).
  * `tarif_per_sesi` (DECIMAL(12,2), Not Null, Default: 75000.00): Tarif per sesi (`BR-07`: Rp75.000).
  * `total_honor` (DECIMAL(12,2), Not Null): Hasil kali `jumlah_sesi * tarif_per_sesi`.
