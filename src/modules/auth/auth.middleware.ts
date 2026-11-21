import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service.js";
import { UnauthorizedError } from "../../shared/errors.js";

export function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "127.0.0.1";
}

export async function ipBanGuard(req: Request, res: Response, next: NextFunction): Promise<void> {
  const ip = getClientIp(req);
  if (await AuthService.isIpBlocked(ip)) {
    res.status(403).json({
      error: "Forbidden",
      message: "Your IP has been permanently blocked. Contact the system administrator via Telegram."
    });
    return;
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.["tasktracker_session"] || req.headers["authorization"]?.replace("Bearer ", "");
  const ip = getClientIp(req);

  if (!token || !AuthService.verifyToken(token, ip)) {
    throw new UnauthorizedError("Authentication required");
  }

  next();
}
