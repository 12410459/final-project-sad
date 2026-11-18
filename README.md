# Sistem Informasi Manajemen Bimbel Cerdas

Aplikasi web manajemen bimbingan belajar untuk **Bimbel Cerdas** (Klien: Ibu Grace Pangemanan) yang dibangun secara terstruktur mencakup seluruh alur pendaftaran, penempatan kelas, penjadwalan, absensi pertemuan, tindak lanjut ketidakhadiran, pembayaran SPP/kuitansi, hingga rekapitulasi honor bulanan tutor.

---

## 1. Prasyarat Sistem

* **Node.js**: Versi `>= 20.0.0`
* **Package Manager**: `npm` (atau `pnpm` / `yarn`)
* **Database (Opsional/Produksi)**: PostgreSQL 14+ (Aplikasi juga dilengkapi *Development/Demo Fallback Store* yang otomatis aktif jika PostgreSQL lokal belum berjalan, sehingga aplikasi dapat langsung diuji coba seketika tanpa konfigurasi rumit).

---

## 2. Struktur Proyek (Monorepo)

```text
bimbel-cerdas-app/
├── apps/
│   ├── api/                  # Express REST API + TypeScript
│   │   ├── src/
│   │   │   ├── controllers/  # Request handlers
│   │   │   ├── middleware/   # Auth role checker & global error handler
│   │   │   ├── repositories/ # Prisma PostgreSQL & Demo Fallback Store
│   │   │   ├── routes/       # Definisi endpoint REST API
│   │   │   └── server.ts     # Entry point server backend
│   └── web/                  # React + TypeScript + Vite + Tailwind CSS
│       └── src/
│           ├── components/   # Navbar, ConceptBanner, Layout
│           ├── features/     # Modul UI per use case (pendaftaran, kelas, jadwal, dll.)
│           └── services/     # Axios/fetch API client
├── packages/
│   └── shared/               # Definisi tipe TypeScript, Zod Schemas, & Aturan Bisnis
├── prisma/
│   ├── migrations/           # SQL migration tersimpan di repo
│   ├── schema.prisma         # 14 Entitas domain PostgreSQL
│   └── seed.ts               # Data uji coba realistis awal
├── docs/                     # Dokumentasi arsitektur & analisis sistem
│   ├── REQUIREMENTS-MAP.md   # Matriks keterlacakan US-01 s/d US-06 ke API & UI
│   ├── OPEN-DECISIONS.md     # Keputusan terbuka & perilaku konservatif
│   ├── TECH-DECISIONS.md     # Rationale arsitektur & stack
│   ├── DATA-DICTIONARY.md    # Kamus data 14 entitas domain
│   ├── API.md                # Spesifikasi endpoint REST API
│   └── figma/README.md       # Tautan referensi desain Figma
├── .env.example
├── package.json
└── README.md
```

---

## 3. Instalasi dan Setup

### Langkah 1: Kloning / Buka Folder
Pastikan Anda berada di direktori `bimbel-cerdas-app`:
```bash
cd bimbel-cerdas-app
```

### Langkah 2: Salin File Environment
```bash
cp .env.example .env
```

### Langkah 3: Install Dependensi
```bash
npm install
```

### Langkah 4: Build Shared Package
```bash
npm run build:shared
```

---

## 4. Setup Database & Migrasi (PostgreSQL)

Jika PostgreSQL Anda sudah aktif:
1. Pastikan string koneksi di `.env` sudah sesuai:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bimbel_cerdas?schema=public"
   ```
2. Jalankan migrasi Prisma:
   ```bash
   npx prisma migrate dev --name init
   ```
3. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

*Catatan Cerdas: Jika Anda belum menginstal PostgreSQL lokal, server Express akan otomatis beralih ke mode **In-Memory Demo Store** yang diinisialisasi dengan data seed realistis. Seluruh fitur pendaftaran, presensi, pembayaran, dan honor tetap dapat berjalan 100% lancar tanpa error.*

---

## 5. Menjalankan Aplikasi

Jalankan backend API dan frontend Web secara bersamaan dengan satu perintah:
```bash
npm run dev
```

Atau jalankan secara terpisah di dua terminal:
* **Terminal 1 (Backend API):**
  ```bash
  npm run dev:api
  ```
  *Berjalan di: `http://localhost:4000` (Health check: `http://localhost:4000/health`)*
* **Terminal 2 (Frontend Web):**
  ```bash
  npm run dev:web
  ```
  *Buka browser di: `http://localhost:5173`*

---

## 6. Panduan Demo Interaktif Berdasarkan Peran

Gunakan **Demo Role Switcher** di bagian kanan atas antarmuka untuk berganti peran:

1. **Admin (Kak Tirsa):**
   * **Pendaftaran Siswa (US-01):** Masukkan data siswa baru dan kontak orang tua. Pilih urutan anak kedua untuk menguji diskon 10% (BR-06).
   * **Tindak Lanjut Absen 3x (BR-10):** Lihat siswa dengan alarm ketidakhadiran 3x berturut-turut (misal: Budi Santoso) dan klik tombol *Catat Hasil Telepon Orang Tua*.
   * **Tagihan & Pembayaran (US-03):** Buka tab Tagihan Belum Lunas, klik *Catat Bayar* untuk menerbitkan nomor kuitansi otomatis.
2. **Pemilik (Ibu Grace):**
   * **Kelola Kelas (US-04):** Lihat kapasitas kelas (maksimal 8 siswa, BR-02) dan status operasional (minimal 3 siswa agar berstatus BERJALAN, BR-01).
   * **Penempatan & Daftar Tunggu:** Masukkan siswa ke kelas; jika kelas sudah 8 siswa, siswa otomatis masuk *Daftar Tunggu*.
   * **Jadwal & Deteksi Bentrok:** Tambahkan jadwal kelas baru.
   * **Rekapitulasi Honor Bulanan (US-05):** Lihat perhitungan honor per tutor (Rp75.000/sesi berlangsung riil). Klik tombol *Simpan Snapshot Rekap Honor*.
3. **Tutor:**
   * **Catat Sesi & Absensi (US-06):** Pilih kelas, tentukan tutor aktual (dapat memilih tutor pengganti, BR-08), status pertemuan (Berlangsung/Batal), dan checklist presensi siswa.
4. **Orang Tua (Konsep):**
   * Membuka tampilan pratinjau data kehadiran dan tagihan SPP anak dengan banner peringatan *Perlu Validasi*.

---

## 7. Keterbatasan & Keputusan Terbuka (Open Decisions)

* **Akses Orang Tua:** Diberi label konsep pratinjau; autentikasi mandiri orang tua belum diaktifkan sesuai SRS Tahap 2.
* **Integrasi WhatsApp & Payment Gateway:** Tidak ada gateway pihak ketiga otomatis; pengingat dan kuitansi dicatat secara internal.
* **Autentikasi:** Switcher peran di antarmuka adalah alat demo/evaluasi lokal, bukan sistem autentikasi produksi final.
