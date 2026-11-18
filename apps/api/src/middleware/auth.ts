import { Request, Response, NextFunction } from "express";

export function roleCheck(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Header simulasi otorisasi peran demo: X-User-Role
    const userRole = (req.headers["x-user-role"] as string) || "ADMIN";

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Peran "${userRole}" tidak memiliki wewenang untuk aksi ini.`,
        error: {
          code: "FORBIDDEN",
          allowed_roles: allowedRoles
        }
      });
    }

    next();
  };
}
