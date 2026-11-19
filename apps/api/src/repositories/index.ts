import { memoryStore, prisma, getIsPostgresConnected } from "./database";

// Helper id generator mandiri
function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
}

export const bimbelRepository = {
  // --- PROGRAM & MATA PELAJARAN ---
  async getPrograms() {
    if (getIsPostgresConnected()) {
      return await prisma.program.findMany();
    }
    return memoryStore.program;
  },

  async getMataPelajaran() {
    if (getIsPostgresConnected()) {
      return await prisma.mataPelajaran.findMany();
    }
    return memoryStore.mata_pelajaran;
  },

  async getTutors() {
    if (getIsPostgresConnected()) {
      return await prisma.tutor.findMany();
    }
    return memoryStore.tutor;
  },

  // --- SISWA & ORANG TUA (US-01) ---
  async getAllSiswa() {
    if (getIsPostgresConnected()) {
      return await prisma.siswa.findMany({
        include: {
          orang_tua: true,
          program: true,
          penempatan: {
            include: { kelas: true }
          }
        }
      });
    }
    return memoryStore.siswa.map(s => {
      const ortu = memoryStore.orang_tua.find(o => o.id_orang_tua === s.id_orang_tua);
      const prog = memoryStore.program.find(p => p.id_program === s.id_program);
      const pen = memoryStore.penempatan.filter(p => p.id_siswa === s.id_siswa).map(p => ({
        ...p,
        kelas: memoryStore.kelas.find(k => k.id_kelas === p.id_kelas)
      }));
      return { ...s, orang_tua: ortu, program: prog, penempatan: pen };
    });
  },

  async getSiswaById(id_siswa: string) {
    if (getIsPostgresConnected()) {
      return await prisma.siswa.findUnique({
        where: { id_siswa },
        include: {
          orang_tua: true,
          program: true,
          penempatan: { include: { kelas: true } },
          tagihan: { include: { pembayaran: true } },
          absensi: { include: { sesi: true } },
          tindak_lanjut_absensi: true
        }
      });
    }
    const s = memoryStore.siswa.find(item => item.id_siswa === id_siswa);
    if (!s) return null;
    const ortu = memoryStore.orang_tua.find(o => o.id_orang_tua === s.id_orang_tua);
    const prog = memoryStore.program.find(p => p.id_program === s.id_program);
    const pen = memoryStore.penempatan.filter(p => p.id_siswa === s.id_siswa).map(p => ({
      ...p,
      kelas: memoryStore.kelas.find(k => k.id_kelas === p.id_kelas)
    }));
    const tag = memoryStore.tagihan.filter(t => t.id_siswa === s.id_siswa).map(t => ({
      ...t,
      pembayaran: memoryStore.pembayaran.filter(pm => pm.id_tagihan === t.id_tagihan)
    }));
    const abs = memoryStore.absensi.filter(a => a.id_siswa === s.id_siswa).map(a => ({
      ...a,
      sesi: memoryStore.sesi.find(se => se.id_sesi === a.id_sesi)
    }));
    const tl = memoryStore.tindak_lanjut_absensi.filter(t => t.id_siswa === s.id_siswa);

    return { ...s, orang_tua: ortu, program: prog, penempatan: pen, tagihan: tag, absensi: abs, tindak_lanjut_absensi: tl };
  },

  async createPendaftaran(data: {
    nama_siswa: string;
    no_hp_orang_tua: string;
    email_orang_tua?: string;
    id_program: string;
    urutan_anak_dalam_keluarga: number;
  }) {
    const id_orang_tua = generateId("ortu");
    const id_siswa = generateId("siswa");
    const today = new Date().toISOString().split("T")[0];

    const prog = memoryStore.program.find(p => p.id_program === data.id_program) || {
      tarif_spp: 300000,
      biaya_pendaftaran: 100000
    };

    // BR-06: 10% diskon untuk anak ke-2 dst
    const diskonPct = data.urutan_anak_dalam_keluarga >= 2 ? 10.0 : 0.0;
    const totalSpp = Number(prog.tarif_spp) * (1 - diskonPct / 100);

    const newOrtu = {
      id_orang_tua,
      no_hp: data.no_hp_orang_tua,
      email: data.email_orang_tua || null
    };

    const newSiswa = {
      id_siswa,
      id_orang_tua,
      id_program: data.id_program,
      nama_siswa: data.nama_siswa,
      tanggal_daftar: today,
      status_siswa: "TERDAFTAR" as const
    };

    const tagihanPendaftaran = {
      id_tagihan: generateId("tag-pend"),
      id_siswa,
      periode: "PENDAFTARAN",
      jenis_tagihan: "BIAYA_PENDAFTARAN" as const,
      nominal: Number(prog.biaya_pendaftaran),
      diskon_persen: 0.0,
      total_tagihan: Number(prog.biaya_pendaftaran),
      status_tagihan: "BELUM_LUNAS" as const
    };

    const currentPeriod = today.substring(0, 7);
    const tagihanSpp = {
      id_tagihan: generateId("tag-spp"),
      id_siswa,
      periode: currentPeriod,
      jenis_tagihan: "SPP_BULANAN" as const,
      nominal: Number(prog.tarif_spp),
      diskon_persen: diskonPct,
      total_tagihan: totalSpp,
      status_tagihan: "BELUM_LUNAS" as const
    };

    if (getIsPostgresConnected()) {
      try {
        const created = await prisma.$transaction(async (tx: any) => {
          const ortu = await tx.orangTua.create({
            data: {
              id_orang_tua,
              no_hp: newOrtu.no_hp,
              email: newOrtu.email || undefined
            }
          });
          const siswa = await tx.siswa.create({
            data: {
              id_siswa,
              id_orang_tua,
              id_program: newSiswa.id_program,
              nama_siswa: newSiswa.nama_siswa,
              status_siswa: newSiswa.status_siswa
            }
          });
          await tx.tagihan.create({ data: tagihanPendaftaran });
          await tx.tagihan.create({ data: tagihanSpp });
          return { ortu, siswa };
        });
        memoryStore.orang_tua.push(newOrtu);
        memoryStore.siswa.push(newSiswa);
        memoryStore.tagihan.push(tagihanPendaftaran, tagihanSpp);
        return { orang_tua: created.ortu, siswa: created.siswa, tagihan: [tagihanPendaftaran, tagihanSpp] };
      } catch (err) {
        console.error("Gagal menyimpan ke PostgreSQL, beralih ke memory store:", err);
      }
    }

    memoryStore.orang_tua.push(newOrtu);
    memoryStore.siswa.push(newSiswa);
    memoryStore.tagihan.push(tagihanPendaftaran, tagihanSpp);

    return { orang_tua: newOrtu, siswa: newSiswa, tagihan: [tagihanPendaftaran, tagihanSpp] };
  },

  // --- KELAS & PENEMPATAN (US-01, US-04) ---
  async getKelasList() {
    if (getIsPostgresConnected()) {
      try {
        const list = await prisma.kelas.findMany({
          include: {
            program: true,
            mapel: true,
            tutor_utama: true,
            penempatan: {
              include: { siswa: true }
            },
            jadwal: true
          }
        });
        return list.map((k: any) => {
          const placed = k.penempatan.filter((p: any) => p.status_penempatan === "DITEMPATKAN");
          const waiting = k.penempatan.filter((p: any) => p.status_penempatan === "DAFTAR_TUNGGU");
          return {
            ...k,
            penempatan: placed,
            daftar_tunggu: waiting,
            jumlah_siswa: placed.length
          };
        });
      } catch (err) {
        console.error("Gagal mengambil data kelas dari PostgreSQL, fallback ke memory store:", err);
      }
    }

    return memoryStore.kelas.map(k => {
      const pen = memoryStore.penempatan.filter(p => p.id_kelas === k.id_kelas && p.status_penempatan === "DITEMPATKAN");
      const waiting = memoryStore.penempatan.filter(p => p.id_kelas === k.id_kelas && p.status_penempatan === "DAFTAR_TUNGGU");
      return {
        ...k,
        program: memoryStore.program.find(p => p.id_program === k.id_program),
        mapel: memoryStore.mata_pelajaran.find(m => m.id_mapel === k.id_mapel),
        tutor_utama: memoryStore.tutor.find(t => t.id_tutor === k.id_tutor_utama),
        penempatan: pen.map(p => ({
          ...p,
          siswa: memoryStore.siswa.find(s => s.id_siswa === p.id_siswa)
        })),
        daftar_tunggu: waiting.map(w => ({
          ...w,
          siswa: memoryStore.siswa.find(s => s.id_siswa === w.id_siswa)
        })),
        jadwal: memoryStore.jadwal.filter(j => j.id_kelas === k.id_kelas),
        jumlah_siswa: pen.length
      };
    });
  },

  async createKelas(data: {
    nama_kelas: string;
    id_program: string;
    id_mapel: string;
    id_tutor_utama: string;
    kapasitas_maks?: number;
  }) {
    const id_kelas = generateId("kelas");
    const newKelas = {
      id_kelas,
      id_program: data.id_program,
      id_mapel: data.id_mapel,
      id_tutor_utama: data.id_tutor_utama,
      nama_kelas: data.nama_kelas,
      kapasitas_maks: data.kapasitas_maks || 8, // BR-02
      status_kelas: "MENUNGGU" as const // BR-01: belum ada 3 siswa
    };

    if (getIsPostgresConnected()) {
      try {
        await prisma.kelas.create({ data: newKelas });
      } catch (err) {
        console.error("Gagal menyimpan kelas ke PostgreSQL:", err);
      }
    }
    memoryStore.kelas.push(newKelas);
    return newKelas;
  },

  async assignSiswaToKelas(id_siswa: string, id_kelas: string) {
    const today = new Date().toISOString().split("T")[0];

    const kelas = memoryStore.kelas.find(k => k.id_kelas === id_kelas);
    if (!kelas) throw new Error("Kelas tidak ditemukan");

    // Cegah duplikasi penempatan siswa di kelas yang sama
    const alreadyPlaced = memoryStore.penempatan.find(
      p => p.id_kelas === id_kelas && p.id_siswa === id_siswa && p.status_penempatan !== "DIBATALKAN"
    );
    if (alreadyPlaced) {
      throw new Error(`Siswa ini sudah terdaftar di kelas "${kelas.nama_kelas}" dengan status ${alreadyPlaced.status_penempatan}.`);
    }

    const currentPlacements = memoryStore.penempatan.filter(
      p => p.id_kelas === id_kelas && p.status_penempatan === "DITEMPATKAN"
    );

    // BR-02: Maksimal 8 siswa per kelas
    let status_penempatan: "DITEMPATKAN" | "DAFTAR_TUNGGU" = "DITEMPATKAN";
    if (currentPlacements.length >= kelas.kapasitas_maks) {
      status_penempatan = "DAFTAR_TUNGGU";
    }

    const newPenempatan = {
      id_penempatan: generateId("pen"),
      id_siswa,
      id_kelas,
      tanggal_penempatan: today,
      status_penempatan
    };

    memoryStore.penempatan.push(newPenempatan);

    const siswa = memoryStore.siswa.find(s => s.id_siswa === id_siswa);
    if (siswa) {
      siswa.status_siswa = status_penempatan === "DITEMPATKAN" ? "AKTIF" : "MENUNGGU_KELAS";
    }

    // BR-01: Minimal 3 siswa agar kelas berjalan
    const updatedCount = currentPlacements.length + (status_penempatan === "DITEMPATKAN" ? 1 : 0);
    if (updatedCount >= 3) {
      kelas.status_kelas = "BERJALAN";
    } else {
      kelas.status_kelas = "MENUNGGU";
    }

    if (getIsPostgresConnected()) {
      try {
        await prisma.penempatan.create({
          data: {
            id_penempatan: newPenempatan.id_penempatan,
            id_siswa,
            id_kelas,
            status_penempatan
          }
        });
        await prisma.siswa.update({
          where: { id_siswa },
          data: { status_siswa: siswa?.status_siswa || "AKTIF" }
        });
        await prisma.kelas.update({
          where: { id_kelas },
          data: { status_kelas: kelas.status_kelas }
        });
      } catch (err) {
        console.error("Gagal menyimpan penempatan ke PostgreSQL:", err);
      }
    }

    return {
      penempatan: newPenempatan,
      status_kelas: kelas.status_kelas,
      jumlah_siswa: updatedCount,
      pesan: status_penempatan === "DAFTAR_TUNGGU"
        ? "Kelas sudah penuh (8 siswa). Siswa ditempatkan ke Daftar Tunggu sesuai aturan bisnis."
        : `Siswa berhasil ditempatkan ke kelas. Status kelas: ${kelas.status_kelas} (${updatedCount}/8 siswa).`
    };
  },

  // --- JADWAL (US-04) ---
  async getJadwalList() {
    return memoryStore.jadwal.map(j => ({
      ...j,
      kelas: memoryStore.kelas.find(k => k.id_kelas === j.id_kelas)
    }));
  },

  async createJadwal(data: {
    id_kelas: string;
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    frekuensi_per_minggu?: number;
    durasi_menit?: number;
  }) {
    const kelasTarget = memoryStore.kelas.find(k => k.id_kelas === data.id_kelas);
    const tutorId = kelasTarget?.id_tutor_utama;

    const existingJadwal = memoryStore.jadwal.filter(j => j.hari.toLowerCase() === data.hari.toLowerCase());
    let bentrok = false;
    let detailBentrok = "";

    for (const j of existingJadwal) {
      const k = memoryStore.kelas.find(kl => kl.id_kelas === j.id_kelas);
      if (k && k.id_tutor_utama === tutorId) {
        // Deteksi overlap interval waktu yang benar: data_start < existing_end && data_end > existing_start
        if (data.jam_mulai < j.jam_selesai && data.jam_selesai > j.jam_mulai) {
          bentrok = true;
          detailBentrok = `Peringatan: Tutor utama (${memoryStore.tutor.find(t => t.id_tutor === tutorId)?.nama_tutor}) sudah memiliki jadwal mengajar di kelas "${k.nama_kelas}" pada hari ${data.hari} pukul ${j.jam_mulai} - ${j.jam_selesai}.`;
          break;
        }
      }
    }

    const newJadwal = {
      id_jadwal: generateId("jadwal"),
      id_kelas: data.id_kelas,
      hari: data.hari,
      jam_mulai: data.jam_mulai,
      jam_selesai: data.jam_selesai,
      frekuensi_per_minggu: data.frekuensi_per_minggu || 2, // BR-03
      durasi_menit: data.durasi_menit || 90 // BR-03
    };

    if (getIsPostgresConnected()) {
      try {
        await prisma.jadwal.create({
          data: {
            id_jadwal: newJadwal.id_jadwal,
            id_kelas: newJadwal.id_kelas,
            hari: newJadwal.hari,
            jam_mulai: newJadwal.jam_mulai,
            jam_selesai: newJadwal.jam_selesai,
            frekuensi_per_minggu: newJadwal.frekuensi_per_minggu,
            durasi_menit: newJadwal.durasi_menit
          }
        });
      } catch (err) {
        console.error("Gagal menyimpan jadwal ke PostgreSQL:", err);
      }
    }

    memoryStore.jadwal.push(newJadwal);
    return { jadwal: newJadwal, bentrok, detailBentrok };
  },

  // --- SESI & ABSENSI (US-06) ---
  async getSesiList(filter?: { id_kelas?: string; id_tutor?: string }) {
    let list = [...memoryStore.sesi];
    if (filter?.id_kelas) list = list.filter(s => s.id_kelas === filter.id_kelas);
    if (filter?.id_tutor) list = list.filter(s => s.id_tutor_pengampu === filter.id_tutor);

    return list.map(s => {
      const kelas = memoryStore.kelas.find(k => k.id_kelas === s.id_kelas);
      const tutor = memoryStore.tutor.find(t => t.id_tutor === s.id_tutor_pengampu);
      const absensi = memoryStore.absensi.filter(a => a.id_sesi === s.id_sesi).map(a => ({
        ...a,
        siswa: memoryStore.siswa.find(si => si.id_siswa === a.id_siswa)
      }));
      return { ...s, kelas, tutor_pengampu: tutor, absensi };
    });
  },

  async createSesiWithAbsensi(data: {
    id_kelas: string;
    id_jadwal?: string | null;
    id_tutor_pengampu: string; // BR-08: Tutor riil pengampu (bisa pengganti)
    tanggal_sesi: string;
    status_sesi: "BERLANGSUNG" | "BATAL"; // BR-07, BR-09
    absensi_list?: Array<{ id_siswa: string; status_kehadiran: "HADIR" | "TIDAK_HADIR" | "IZIN" | "SAKIT" }>;
  }) {
    const id_sesi = generateId("sesi");
    const newSesi = {
      id_sesi,
      id_kelas: data.id_kelas,
      id_jadwal: data.id_jadwal || null,
      id_tutor_pengampu: data.id_tutor_pengampu,
      tanggal_sesi: data.tanggal_sesi,
      status_sesi: data.status_sesi
    };

    memoryStore.sesi.push(newSesi);

    const createdAbsensi = [];
    if (data.absensi_list && data.absensi_list.length > 0) {
      for (const item of data.absensi_list) {
        const newAbs = {
          id_absensi: generateId("abs"),
          id_sesi,
          id_siswa: item.id_siswa,
          status_kehadiran: item.status_kehadiran
        };
        memoryStore.absensi.push(newAbs);
        createdAbsensi.push(newAbs);
      }
    }

    if (getIsPostgresConnected()) {
      try {
        await prisma.sesi.create({
          data: {
            id_sesi: newSesi.id_sesi,
            id_kelas: newSesi.id_kelas,
            id_jadwal: newSesi.id_jadwal,
            id_tutor_pengampu: newSesi.id_tutor_pengampu,
            tanggal_sesi: new Date(newSesi.tanggal_sesi),
            status_sesi: newSesi.status_sesi
          }
        });
        for (const item of createdAbsensi) {
          await prisma.absensi.create({
            data: {
              id_absensi: item.id_absensi,
              id_sesi: item.id_sesi,
              id_siswa: item.id_siswa,
              status_kehadiran: item.status_kehadiran
            }
          });
        }
      } catch (err) {
        console.error("Gagal menyimpan sesi & absensi ke PostgreSQL:", err);
      }
    }

    return { sesi: newSesi, absensi: createdAbsensi };
  },

  // --- TINDAK LANJUT ABSENSI 3X (US-02, US-03, BR-10) ---
  async getSiswaPerluTelepon() {
    const result: Array<{
      siswa: any;
      orang_tua: any;
      kelas: any;
      jumlah_absen_berturut: number;
      tanggal_absen_terakhir: string;
      status_tindak_lanjut: string;
    }> = [];

    for (const s of memoryStore.siswa) {
      const studentAbs = memoryStore.absensi
        .filter(a => a.id_siswa === s.id_siswa)
        .map(a => {
          const sesi = memoryStore.sesi.find(se => se.id_sesi === a.id_sesi);
          return { ...a, sesi };
        })
        .filter(a => a.sesi && a.sesi.status_sesi === "BERLANGSUNG")
        .sort((a, b) => new Date(b.sesi?.tanggal_sesi || 0).getTime() - new Date(a.sesi?.tanggal_sesi || 0).getTime());

      let consecutiveAbsent = 0;
      for (const a of studentAbs) {
        if (a.status_kehadiran === "TIDAK_HADIR") {
          consecutiveAbsent++;
        } else {
          break;
        }
      }

      if (consecutiveAbsent >= 3) {
        const ortu = memoryStore.orang_tua.find(o => o.id_orang_tua === s.id_orang_tua);
        const pen = memoryStore.penempatan.find(p => p.id_siswa === s.id_siswa && p.status_penempatan === "DITEMPATKAN");
        const kelas = pen ? memoryStore.kelas.find(k => k.id_kelas === pen.id_kelas) : null;
        const lastCall = memoryStore.tindak_lanjut_absensi
          .filter(t => t.id_siswa === s.id_siswa)
          .sort((a, b) => new Date(b.tanggal_telepon).getTime() - new Date(a.tanggal_telepon).getTime())[0];

        result.push({
          siswa: s,
          orang_tua: ortu,
          kelas,
          jumlah_absen_berturut: consecutiveAbsent,
          tanggal_absen_terakhir: studentAbs[0]?.sesi?.tanggal_sesi || "-",
          status_tindak_lanjut: lastCall ? `Sudah ditelepon tgl ${lastCall.tanggal_telepon}` : "BELUM DITELEPON (PERLU SEGERA DIHUBUNGI)"
        });
      }
    }

    return result;
  },

  async createTindakLanjutAbsensi(data: {
    id_siswa: string;
    tanggal_telepon: string;
    hasil_telepon: string;
    catatan?: string | null;
  }) {
    const newLog = {
      id_tindak_lanjut: generateId("tl"),
      id_siswa: data.id_siswa,
      tanggal_telepon: data.tanggal_telepon,
      hasil_telepon: data.hasil_telepon,
      catatan: data.catatan || null
    };

    if (getIsPostgresConnected()) {
      try {
        await prisma.tindakLanjutAbsensi.create({
          data: {
            id_tindak_lanjut: newLog.id_tindak_lanjut,
            id_siswa: newLog.id_siswa,
            tanggal_telepon: new Date(newLog.tanggal_telepon),
            hasil_telepon: newLog.hasil_telepon,
            catatan: newLog.catatan
          }
        });
      } catch (err) {
        console.error("Gagal menyimpan log tindak lanjut ke PostgreSQL:", err);
      }
    }

    memoryStore.tindak_lanjut_absensi.push(newLog);
    return newLog;
  },

  async getRiwayatTindakLanjut() {
    return memoryStore.tindak_lanjut_absensi.map(t => {
      const siswa = memoryStore.siswa.find(s => s.id_siswa === t.id_siswa);
      const ortu = siswa ? memoryStore.orang_tua.find(o => o.id_orang_tua === siswa.id_orang_tua) : null;
      return { ...t, siswa, orang_tua: ortu };
    });
  },

  // --- TAGIHAN & PEMBAYARAN (US-03) ---
  async getTagihanBelumLunas() {
    const unpaid = memoryStore.tagihan.filter(t => t.status_tagihan !== "LUNAS");
    return unpaid.map(t => {
      const siswa = memoryStore.siswa.find(s => s.id_siswa === t.id_siswa);
      const ortu = siswa ? memoryStore.orang_tua.find(o => o.id_orang_tua === siswa.id_orang_tua) : null;
      const prog = siswa ? memoryStore.program.find(p => p.id_program === siswa.id_program) : null;
      const bayar = memoryStore.pembayaran.filter(p => p.id_tagihan === t.id_tagihan);
      const totalBayar = bayar.reduce((acc, curr) => acc + Number(curr.jumlah_bayar), 0);

      return {
        ...t,
        siswa,
        orang_tua: ortu,
        program: prog,
        total_terbayar: totalBayar,
        sisa_tagihan: Math.max(0, Number(t.total_tagihan) - totalBayar),
        riwayat_pembayaran: bayar
      };
    });
  },

  async getAllTagihan() {
    return memoryStore.tagihan.map(t => {
      const siswa = memoryStore.siswa.find(s => s.id_siswa === t.id_siswa);
      const ortu = siswa ? memoryStore.orang_tua.find(o => o.id_orang_tua === siswa.id_orang_tua) : null;
      const bayar = memoryStore.pembayaran.filter(p => p.id_tagihan === t.id_tagihan);
      const totalBayar = bayar.reduce((acc, curr) => acc + Number(curr.jumlah_bayar), 0);

      return {
        ...t,
        siswa,
        orang_tua: ortu,
        total_terbayar: totalBayar,
        sisa_tagihan: Math.max(0, Number(t.total_tagihan) - totalBayar),
        pembayaran: bayar
      };
    });
  },

  async recordPembayaran(data: {
    id_tagihan: string;
    jumlah_bayar: number;
    tanggal_bayar: string;
    nomor_kuitansi?: string;
  }) {
    const tagihan = memoryStore.tagihan.find(t => t.id_tagihan === data.id_tagihan);
    if (!tagihan) throw new Error("Tagihan tidak ditemukan");

    if (tagihan.status_tagihan === "LUNAS") {
      throw new Error("Tagihan ini sudah berstatus LUNAS.");
    }

    const noKuitansi = data.nomor_kuitansi || `KW-${Date.now().toString().slice(-6)}`;

    const newPayment = {
      id_pembayaran: generateId("pem"),
      id_tagihan: data.id_tagihan,
      tanggal_bayar: data.tanggal_bayar,
      jumlah_bayar: data.jumlah_bayar,
      nomor_kuitansi: noKuitansi
    };

    memoryStore.pembayaran.push(newPayment);

    const totalBayar = memoryStore.pembayaran
      .filter(p => p.id_tagihan === data.id_tagihan)
      .reduce((acc, curr) => acc + Number(curr.jumlah_bayar), 0);

    if (totalBayar >= Number(tagihan.total_tagihan)) {
      tagihan.status_tagihan = "LUNAS";
    } else if (totalBayar > 0) {
      tagihan.status_tagihan = "SEBAGIAN";
    }

    if (getIsPostgresConnected()) {
      try {
        await prisma.pembayaran.create({
          data: {
            id_pembayaran: newPayment.id_pembayaran,
            id_tagihan: newPayment.id_tagihan,
            tanggal_bayar: new Date(newPayment.tanggal_bayar),
            jumlah_bayar: newPayment.jumlah_bayar,
            nomor_kuitansi: newPayment.nomor_kuitansi
          }
        });
        await prisma.tagihan.update({
          where: { id_tagihan: tagihan.id_tagihan },
          data: { status_tagihan: tagihan.status_tagihan }
        });
      } catch (err) {
        console.error("Gagal mencatat pembayaran ke PostgreSQL:", err);
      }
    }

    return { pembayaran: newPayment, status_tagihan_baru: tagihan.status_tagihan, total_terbayar: totalBayar };
  },

  // --- REKAP HONOR BULANAN (US-05) ---
  async kalkulasiHonorBulanan(periode: string) {
    const activeSessions = memoryStore.sesi.filter(s =>
      s.tanggal_sesi.startsWith(periode) && s.status_sesi === "BERLANGSUNG" // BR-07, BR-09
    );

    const tutorMap = new Map<string, { jumlah_sesi: number; sesi_ids: string[]; rincian_sesi: any[] }>();

    for (const t of memoryStore.tutor) {
      tutorMap.set(t.id_tutor, { jumlah_sesi: 0, sesi_ids: [], rincian_sesi: [] });
    }

    for (const s of activeSessions) {
      const tutorPengampu = s.id_tutor_pengampu;
      if (!tutorMap.has(tutorPengampu)) {
        tutorMap.set(tutorPengampu, { jumlah_sesi: 0, sesi_ids: [], rincian_sesi: [] });
      }
      const entry = tutorMap.get(tutorPengampu)!;
      entry.jumlah_sesi++;
      entry.sesi_ids.push(s.id_sesi);
      entry.rincian_sesi.push({
        id_sesi: s.id_sesi,
        tanggal_sesi: s.tanggal_sesi,
        kelas: memoryStore.kelas.find(k => k.id_kelas === s.id_kelas)?.nama_kelas || "-",
        is_pengganti: memoryStore.kelas.find(k => k.id_kelas === s.id_kelas)?.id_tutor_utama !== tutorPengampu
      });
    }

    const tarifPerSesi = 75000; // BR-07: Rp75.000 per sesi

    const rekap = memoryStore.tutor.map(t => {
      const stats = tutorMap.get(t.id_tutor) || { jumlah_sesi: 0, sesi_ids: [], rincian_sesi: [] };
      return {
        id_tutor: t.id_tutor,
        nama_tutor: t.nama_tutor,
        kontak_tutor: t.kontak_tutor,
        periode,
        jumlah_sesi: stats.jumlah_sesi,
        tarif_per_sesi: tarifPerSesi,
        total_honor: stats.jumlah_sesi * tarifPerSesi,
        rincian_sesi: stats.rincian_sesi
      };
    });

    return { periode, tarif_standar: tarifPerSesi, rekap };
  },

  async saveRekapHonorSnapshot(periode: string, items: Array<{
    id_tutor: string;
    jumlah_sesi: number;
    tarif_per_sesi: number;
    total_honor: number;
  }>) {
    memoryStore.rekap_honor = memoryStore.rekap_honor.filter(r => r.periode !== periode);

    const saved = [];
    for (const item of items) {
      const record = {
        id_rekap_honor: generateId("rekap"),
        id_tutor: item.id_tutor,
        periode,
        jumlah_sesi: item.jumlah_sesi,
        tarif_per_sesi: item.tarif_per_sesi,
        total_honor: item.total_honor
      };
      memoryStore.rekap_honor.push(record);
      saved.push(record);
    }

    if (getIsPostgresConnected()) {
      try {
        await prisma.rekapHonor.deleteMany({ where: { periode } });
        for (const item of items) {
          await prisma.rekapHonor.create({
            data: {
              id_tutor: item.id_tutor,
              periode,
              jumlah_sesi: item.jumlah_sesi,
              tarif_per_sesi: item.tarif_per_sesi,
              total_honor: item.total_honor
            }
          });
        }
      } catch (err) {
        console.error("Gagal menyimpan rekap honor ke PostgreSQL:", err);
      }
    }

    return saved;
  },

  async getRiwayatRekapHonor() {
    return memoryStore.rekap_honor.map(r => ({
      ...r,
      tutor: memoryStore.tutor.find(t => t.id_tutor === r.id_tutor)
    }));
  }
};
