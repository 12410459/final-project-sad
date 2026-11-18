# Dokumentasi Kontrak REST API (API Specification)
**Sistem Informasi Manajemen Bimbel Cerdas**

Backend Express menyediakan API berbasis JSON dengan standar respon terpadu.

Header simulasi otorisasi peran demo:
* `X-User-Role`: `'ADMIN'` | `'PEMILIK'` | `'TUTOR'` | `'ORANG_TUA'`
* `X-User-Id`: Identifier pengguna aktif

---

## 1. Pendaftaran Siswa (US-01)

### `POST /api/pendaftaran`
* **Role Diizinkan:** `ADMIN`, `PEMILIK`, `ORANG_TUA` (konsep)
* **Deskripsi:** Mendaftarkan siswa baru beserta kontak orang tua dan program peminatan awal. Secara otomatis membuat tagihan biaya pendaftaran (`BR-05`) dan tagihan SPP bulan pertama dengan diskon 10% jika anak kedua/seterusnya (`BR-06`).
* **Request Body:**
```json
{
  "nama_siswa": "Budi Santoso",
  "no_hp_orang_tua": "081234567890",
  "email_orang_tua": "ortu.budi@example.com",
  "id_program": "prog-sd-01",
  "urutan_anak_dalam_keluarga": 2
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "siswa": { "id_siswa": "...", "nama_siswa": "Budi Santoso" },
    "orang_tua": { "id_orang_tua": "...", "no_hp": "081234567890" },
    "tagihan_dibuat": [ ... ]
  },
  "message": "Pendaftaran siswa berhasil dicatat"
}
```

### `GET /api/siswa`
* **Role Diizinkan:** `ADMIN`, `PEMILIK`, `TUTOR`
* **Query Params:** `program`, `status`, `search`
* **Deskripsi:** Mengambil daftar seluruh siswa aktif/terdaftar beserta status penempatannya.

---

## 2. Kelas, Penempatan & Jadwal (US-01, US-04)

### `GET /api/kelas`
* **Role Diizinkan:** `ADMIN`, `PEMILIK`, `TUTOR`
* **Deskripsi:** Mengambil daftar kelas, kapasitas terisi (maks 8), dan status kelas ('MENUNGGU' jika < 3 siswa, 'BERJALAN' jika >= 3 siswa).

### `POST /api/kelas`
* **Role Diizinkan:** `PEMILIK`
* **Request Body:**
```json
{
  "nama_kelas": "Matematika SD Kelas 5-A",
  "id_program": "prog-sd-01",
  "id_mapel": "mapel-mat-01",
  "id_tutor_utama": "tutor-01",
  "kapasitas_maks": 8
}
```

### `POST /api/penempatan`
* **Role Diizinkan:** `PEMILIK`
* **Deskripsi:** Menempatkan siswa ke kelas. Jika kelas telah mencapai 8 siswa, sistem menempatkannya ke status `'DAFTAR_TUNGGU'` (`BR-02`). Jika kelas mencapai >= 3 siswa, status kelas otomatis beralih ke `'BERJALAN'` (`BR-01`).
* **Request Body:**
```json
{
  "id_siswa": "siswa-01",
  "id_kelas": "kelas-01"
}
```

### `GET /api/jadwal`
* **Role Diizinkan:** `PEMILIK`, `ADMIN`, `TUTOR`
* **Deskripsi:** Mengambil seluruh jadwal mingguan (hari, jam mulai, jam selesai, durasi 90 menit).

### `POST /api/jadwal`
* **Role Diizinkan:** `PEMILIK`
* **Deskripsi:** Menambah jadwal pertemuan kelas. Backend mengecek potensi bentrok jadwal tutor/kelas dan memberikan *warning flag* jika terdeteksi tumpang tindih waktu.

---

## 3. Sesi & Absensi (US-06)

### `GET /api/sesi`
* **Role Diizinkan:** `TUTOR`, `PEMILIK`, `ADMIN`
* **Query Params:** `id_kelas`, `id_tutor`, `bulan`, `tahun`
* **Deskripsi:** Mengambil catatan sesi pertemuan.

### `POST /api/sesi`
* **Role Diizinkan:** `TUTOR`, `PEMILIK`
* **Deskripsi:** Mencatat sesi pertemuan riil. Menyimpan tutor pengampu aktual (`id_tutor_pengampu`) yang bisa berbeda dari tutor utama kelas (tutor pengganti, `BR-08`). Status sesi: `'BERLANGSUNG'` atau `'BATAL'`.
* **Request Body:**
```json
{
  "id_kelas": "kelas-01",
  "id_jadwal": "jadwal-01",
  "id_tutor_pengampu": "tutor-02",
  "tanggal_sesi": "2026-11-18",
  "status_sesi": "BERLANGSUNG",
  "absensi_list": [
    { "id_siswa": "siswa-01", "status_kehadiran": "HADIR" },
    { "id_siswa": "siswa-02", "status_kehadiran": "TIDAK_HADIR" }
  ]
}
```

---

## 4. Tagihan & Pembayaran SPP (US-03)

### `GET /api/tagihan/belum-lunas`
* **Role Diizinkan:** `ADMIN`, `PEMILIK`
* **Deskripsi:** Mengambil seluruh tagihan yang berstatus `'BELUM_LUNAS'` atau `'SEBAGIAN'`.

### `POST /api/pembayaran`
* **Role Diizinkan:** `ADMIN`
* **Deskripsi:** Mencatat kas masuk pembayaran dari orang tua. Menghasilkan nomor kuitansi otomatis (`nomor_kuitansi`) dan memperbarui status tagihan menjadi `'LUNAS'` jika saldo terpenuhi.
* **Request Body:**
```json
{
  "id_tagihan": "tagihan-01",
  "jumlah_bayar": 300000.00,
  "tanggal_bayar": "2026-11-17"
}
```

---

## 5. Tindak Lanjut Absensi 3x Berturut-turut (US-02, US-03)

### `GET /api/tindak-lanjut/perlu-telepon`
* **Role Diizinkan:** `ADMIN`, `PEMILIK`
* **Deskripsi:** Algoritma backend menganalisis riwayat absensi setiap siswa. Jika siswa memiliki 3 catatan berstatus `'TIDAK_HADIR'` berturut-turut dan belum ada catatan tindak lanjut telepon terbaru, siswa dimunculkan dalam daftar wajib telepon Kak Tirsa (`BR-10`).

### `POST /api/tindak-lanjut`
* **Role Diizinkan:** `ADMIN`
* **Request Body:**
```json
{
  "id_siswa": "siswa-02",
  "tanggal_telepon": "2026-11-17",
  "hasil_telepon": "Orang tua mengonfirmasi anak sedang opname demam berdarah.",
  "catatan": "Akan masuk kembali minggu depan, izin 2 sesi."
}
```

---

## 6. Kalkulasi & Rekap Honor Bulanan (US-05)

### `GET /api/honor/kalkulasi`
* **Role Diizinkan:** `PEMILIK`
* **Query Params:** `periode` (misal: `2026-11`)
* **Deskripsi:** *Single source of truth* kalkulasi honor dinamis:
  * Menghitung total sesi berstatus `'BERLANGSUNG'` di mana tutor menjadi `id_tutor_pengampu` aktual pada sesi tersebut (`BR-07`, `BR-08`).
  * Sesi dengan status `'BATAL'` tidak dihitung (`BR-09`).
  * Rumus: `jumlah_sesi * 75000`.

### `POST /api/honor/simpan-rekap`
* **Role Diizinkan:** `PEMILIK`
* **Deskripsi:** Membekukan hasil kalkulasi ke dalam tabel audit `RekapHonor`.
