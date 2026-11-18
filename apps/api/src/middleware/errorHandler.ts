import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validasi data gagal",
      error: {
        code: "VALIDATION_ERROR",
        details: err.errors.map(e => ({
          field: e.path.join("."),
          message: e.message
        }))
      }
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Terjadi kesalahan internal pada server";

  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      details: process.env.NODE_ENV === "development" ? err.stack : undefined
    }
  });
}
