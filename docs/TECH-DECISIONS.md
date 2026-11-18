# Keputusan Teknologi & Arsitektur (Tech Decisions)
**Sistem Informasi Manajemen Bimbel Cerdas**

Dokumen ini menjelaskan pemilihan teknologi, arsitektur perangkat lunak, dan pertimbangan teknis dalam pembangunan sistem.

---

## 1. Ringkasan Pilihan Stack

| Komponen | Pilihan Teknologi | Rationale / Alasan Pemilihan |
| :--- | :--- | :--- |
| **Arsitektur Monorepo** | npm workspaces | Menyatukan `apps/web` (Frontend), `apps/api` (Backend), dan `packages/shared` (Kontrak Data/Tipe) dalam satu repositori yang kohesif dan mudah dirawat. |
| **Frontend Framework** | **React 18 + Vite + TypeScript** | Build time instan, ekosistem kuat, *type-safety* tinggi, dan komponen UI yang modular. |
| **Styling & UI** | **Tailwind CSS + Lucide Icons** | Utility-first CSS memudahkan penciptaan antarmuka berpalet warna biru/teal yang tenang, profesional, responsif, dan konsisten. |
| **Backend Framework** | **Node.js (v20+) + Express + TypeScript** | Standar industri untuk REST API, cepat dikembangkan, didukung pustaka middleware yang matang, dan mudah dipelihara. |
| **ORM & Database Modeling** | **Prisma ORM (PostgreSQL)** | Skema deklaratif (`prisma/schema.prisma`), migrasi tersimpan versi, type generator otomatis, serta pencegahan SQL injection. |
| **Data Engine & Storage** | **PostgreSQL** (didukung mode *Development/Demo Fallback*) | Database relasional berfitur lengkap untuk integritas relasi, transaksi multi-tabel, dan konsistensi keuangan/absensi. |
| **Skema Validasi Request** | **Zod** | Validasi payload runtime di lapisan API yang selaras dengan tipe data TypeScript dan menghasilkan pesan error yang deskriptif. |
| **State & HTTP Client** | **Axios / Fetch API + Custom Hooks** | Ringan, minim ketergantungan eksternal berlebih, mudah menangani interceptor peran dan error response. |

---

## 2. Pola Arsitektur Lapisan (Layered Architecture)

### Backend (`apps/api`)
Backend dirancang dengan pemisahan tanggung jawab yang tegas:
1. **`routes/`**: Menentukan definisi endpoint HTTP dan memetakan middleware otorisasi serta validasi.
2. **`controllers/`**: Menerima request HTTP, mengekstraksi parameter, dan mengembalikan format respons terstandarisasi.
3. **`services/`**: Menampung logika domain dan aturan bisnis bimbel (misal: kalkulasi honor Rp75.000, pengecekan kapasitas kelas 8 siswa, deteksi absensi 3x berturut-turut, evaluasi diskon 10%).
4. **`repositories/` / Database Layer**: Mengabstraksi akses data menggunakan Prisma Client.
5. **`middleware/`**: Penanganan error global, logging request non-sensitif, dan otorisasi peran demo (`roleCheck`).
6. **`schemas/`**: Skema validasi Zod untuk validasi payload input sebelum diproses.

### Frontend (`apps/web`)
Frontend diorganisasikan per fitur dan peran:
1. **`components/common/`**: Komponen atomik (Button, Modal, Badge, Card, Banner, Alert).
2. **`components/layout/`**: Header, Sidebar, Navigasi Peran, dan Role Switcher Bar.
3. **`features/`**:
   - `pendaftaran/`: Formulir dan tabel pendaftaran siswa.
   - `kelas-penempatan/`: Visualisasi kapasitas kelas (3..8), daftar tunggu, dan assign kelas.
   - `jadwal-tutor/`: Kalender/jadwal mingguan dan deteksi bentrok jadwal.
   - `sesi-absensi/`: Formulir sesi dan grid absensi siswa per pertemuan.
   - `tagihan-pembayaran/`: Riwayat tagihan, diskon, kuitansi, dan daftar belum lunas.
   - `tindak-lanjut-absensi/`: Dashboard pemicu 3x absen dan log telepon orang tua.
   - `honor/`: Kalkulator honor bulanan dinamis dan pembekuan snapshot rekap.
4. **`services/api/`**: Modul komunikasi HTTP ke backend API.

---

## 3. Desain Respons API Terstandarisasi

Semua endpoint backend mengembalikan struktur payload seragam:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operasi berhasil dilakukan"
}
```
Dan untuk kegagalan:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [ ... ]
  },
  "message": "Pesan kesalahan yang mudah dipahami"
}
```
