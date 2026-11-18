import { Request, Response, NextFunction } from "express";
import { bimbelRepository } from "../repositories";
import {
  PendaftaranSchema,
  PenempatanSchema,
  KelasSchema,
  JadwalSchema,
  SesiSchema,
  PembayaranSchema,
  TindakLanjutSchema,
  SimpanRekapHonorSchema
} from "@bimbel/shared";

export const bimbelController = {
  // --- MASTER DATA ---
  async getMasterData(req: Request, res: Response, next: NextFunction) {
    try {
      const [programs, mapel, tutors] = await Promise.all([
        bimbelRepository.getPrograms(),
        bimbelRepository.getMataPelajaran(),
        bimbelRepository.getTutors()
      ]);
      res.json({
        success: true,
        data: { programs, mapel, tutors }
      });
    } catch (err) {
      next(err);
    }
  },

  // --- US-01: PENDAFTARAN & SISWA ---
  async createPendaftaran(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = PendaftaranSchema.parse(req.body);
      const result = await bimbelRepository.createPendaftaran(payload);
      res.status(201).json({
        success: true,
        data: result,
        message: "Pendaftaran siswa berhasil dicatat dan tagihan awal telah dibuat"
      });
    } catch (err) {
      next(err);
    }
  },

  async getAllSiswa(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await bimbelRepository.getAllSiswa();
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  },

  async getSiswaDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const detail = await bimbelRepository.getSiswaById(id);
      if (!detail) {
        return res.status(404).json({ success: false, message: "Siswa tidak ditemukan" });
      }
      res.json({ success: true, data: detail });
    } catch (err) {
      next(err);
    }
  },

  // --- US-01 & US-04: KELAS & PENEMPATAN ---
  async getKelas(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await bimbelRepository.getKelasList();
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  },

  async createKelas(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = KelasSchema.parse(req.body);
      const created = await bimbelRepository.createKelas(payload);
      res.status(201).json({
        success: true,
        data: created,
        message: "Kelas baru berhasil dibuat"
      });
    } catch (err) {
      next(err);
    }
  },

  async assignSiswa(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = PenempatanSchema.parse(req.body);
      const result = await bimbelRepository.assignSiswaToKelas(payload.id_siswa, payload.id_kelas);
      res.status(201).json({
        success: true,
        data: result,
        message: result.pesan
      });
    } catch (err) {
      next(err);
    }
  },

  // --- US-04: JADWAL ---
  async getJadwal(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await bimbelRepository.getJadwalList();
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  },

  async createJadwal(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = JadwalSchema.parse(req.body);
      const result = await bimbelRepository.createJadwal(payload);
      res.status(201).json({
        success: true,
        data: {
          ...result.jadwal,
          bentrok: result.bentrok,
          warning: result.bentrok ? result.detailBentrok : undefined
        },
        warning: result.bentrok ? result.detailBentrok : undefined,
        message: result.bentrok
          ? "Jadwal disimpan dengan peringatan potensi bentrok"
          : "Jadwal berhasil ditambahkan"
      });
    } catch (err) {
      next(err);
    }
  },

  // --- US-06: SESI & ABSENSI ---
  async getSesi(req: Request, res: Response, next: NextFunction) {
    try {
      const { id_kelas, id_tutor } = req.query;
      const list = await bimbelRepository.getSesiList({
        id_kelas: id_kelas as string,
        id_tutor: id_tutor as string
      });
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  },

  async createSesi(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = SesiSchema.parse(req.body);
      const result = await bimbelRepository.createSesiWithAbsensi(payload);
      res.status(201).json({
        success: true,
        data: result,
        message: "Catatan sesi dan absensi siswa berhasil disimpan"
      });
    } catch (err) {
      next(err);
    }
  },

  // --- US-02 & US-03: TINDAK LANJUT ABSENSI 3X ---
  async getSiswaPerluTelepon(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await bimbelRepository.getSiswaPerluTelepon();
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  },

  async createTindakLanjut(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = TindakLanjutSchema.parse(req.body);
      const result = await bimbelRepository.createTindakLanjutAbsensi(payload);
      res.status(201).json({
        success: true,
        data: result,
        message: "Log hasil telepon orang tua berhasil dicatat"
      });
    } catch (err) {
      next(err);
    }
  },

  async getRiwayatTindakLanjut(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await bimbelRepository.getRiwayatTindakLanjut();
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  },

  // --- US-03: TAGIHAN & PEMBAYARAN ---
  async getTagihanBelumLunas(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await bimbelRepository.getTagihanBelumLunas();
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  },

  async getAllTagihan(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await bimbelRepository.getAllTagihan();
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  },

  async recordPembayaran(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = PembayaranSchema.parse(req.body);
      const result = await bimbelRepository.recordPembayaran(payload);
      res.status(201).json({
        success: true,
        data: result,
        message: `Pembayaran berhasil dicatat. Status tagihan saat ini: ${result.status_tagihan_baru}`
      });
    } catch (err) {
      next(err);
    }
  },

  // --- US-05: REKAP HONOR TUTOR ---
  async kalkulasiHonor(req: Request, res: Response, next: NextFunction) {
    try {
      const periode = (req.query.periode as string) || new Date().toISOString().substring(0, 7);
      const result = await bimbelRepository.kalkulasiHonorBulanan(periode);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async simpanRekapHonor(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = SimpanRekapHonorSchema.parse(req.body);
      const result = await bimbelRepository.saveRekapHonorSnapshot(payload.periode, payload.items);
      res.status(201).json({
        success: true,
        data: result,
        message: `Rekap honor periode ${payload.periode} berhasil disimpan sebagai snapshot audit`
      });
    } catch (err) {
      next(err);
    }
  },

  async getRiwayatRekapHonor(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await bimbelRepository.getRiwayatRekapHonor();
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }
};
