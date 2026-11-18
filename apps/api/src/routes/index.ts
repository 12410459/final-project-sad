import { Router } from "express";
import { bimbelController } from "../controllers";
import { roleCheck } from "../middleware/auth";

export const apiRouter = Router();

// Master Data
apiRouter.get("/master", bimbelController.getMasterData);

// US-01 & US-02: Pendaftaran & Siswa
apiRouter.post("/pendaftaran", roleCheck(["ADMIN", "PEMILIK", "ORANG_TUA"]), bimbelController.createPendaftaran);
apiRouter.get("/siswa", roleCheck(["ADMIN", "PEMILIK", "TUTOR"]), bimbelController.getAllSiswa);
apiRouter.get("/siswa/:id", roleCheck(["ADMIN", "PEMILIK", "TUTOR", "ORANG_TUA"]), bimbelController.getSiswaDetail);

// US-01 & US-04: Kelas, Penempatan, dan Jadwal
apiRouter.get("/kelas", roleCheck(["ADMIN", "PEMILIK", "TUTOR"]), bimbelController.getKelas);
apiRouter.post("/kelas", roleCheck(["PEMILIK"]), bimbelController.createKelas);
apiRouter.post("/penempatan", roleCheck(["PEMILIK"]), bimbelController.assignSiswa);
apiRouter.get("/jadwal", roleCheck(["ADMIN", "PEMILIK", "TUTOR"]), bimbelController.getJadwal);
apiRouter.post("/jadwal", roleCheck(["PEMILIK"]), bimbelController.createJadwal);

// US-06: Sesi & Absensi
apiRouter.get("/sesi", roleCheck(["TUTOR", "PEMILIK", "ADMIN"]), bimbelController.getSesi);
apiRouter.post("/sesi", roleCheck(["TUTOR", "PEMILIK"]), bimbelController.createSesi);

// US-02 & US-03: Tindak Lanjut Absensi 3x Berturut-turut (BR-10)
apiRouter.get("/tindak-lanjut/perlu-telepon", roleCheck(["ADMIN", "PEMILIK"]), bimbelController.getSiswaPerluTelepon);
apiRouter.post("/tindak-lanjut", roleCheck(["ADMIN"]), bimbelController.createTindakLanjut);
apiRouter.get("/tindak-lanjut/riwayat", roleCheck(["ADMIN", "PEMILIK"]), bimbelController.getRiwayatTindakLanjut);

// US-03: Tagihan & Pembayaran
apiRouter.get("/tagihan/belum-lunas", roleCheck(["ADMIN", "PEMILIK"]), bimbelController.getTagihanBelumLunas);
apiRouter.get("/tagihan", roleCheck(["ADMIN", "PEMILIK", "ORANG_TUA"]), bimbelController.getAllTagihan);
apiRouter.post("/pembayaran", roleCheck(["ADMIN"]), bimbelController.recordPembayaran);

// US-05: Rekap Honor Bulanan Tutor (BR-07, BR-08, BR-09)
apiRouter.get("/honor/kalkulasi", roleCheck(["PEMILIK"]), bimbelController.kalkulasiHonor);
apiRouter.post("/honor/simpan-rekap", roleCheck(["PEMILIK"]), bimbelController.simpanRekapHonor);
apiRouter.get("/honor/riwayat", roleCheck(["PEMILIK", "TUTOR"]), bimbelController.getRiwayatRekapHonor);
