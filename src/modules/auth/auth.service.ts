import crypto from "crypto";
import { prisma } from "../../shared/db.js";
import { config } from "../../config/index.js";
import { ForbiddenError, UnauthorizedError } from "../../shared/errors.js";
import { logger } from "../../shared/logger.js";

export class AuthService {
  private static readonly MAX_ATTEMPTS = 3;

  static async isIpBlocked(ip: string): Promise<boolean> {
    const record = await prisma.blockedIp.findUnique({ where: { ip } });
    return !!(record && record.isPermanent);
  }

  static async verifyPinAndLogin(pin: string, ip: string): Promise<string> {
    if (await this.isIpBlocked(ip)) {
      throw new ForbiddenError("IP is permanently blocked due to repeated failed attempts");
    }

    if (pin !== config.APP_PIN) {
      await this.recordFailedAttempt(ip);
      const remaining = await this.getRemainingAttempts(ip);
      if (remaining <= 0) {
        throw new ForbiddenError("Maximum attempts exceeded. IP permanently blocked.");
      }
      throw new UnauthorizedError(`Invalid PIN. ${remaining} attempts remaining.`);
    }

    // Reset failed attempts on successful login
    await prisma.blockedIp.deleteMany({ where: { ip } });

    await prisma.securityLog.create({
      data: {
        ip,
        action: "LOGIN_SUCCESS",
        details: "Authorized PIN entry"
      }
    });

    return this.generateToken(ip);
  }

  static async recordFailedAttempt(ip: string): Promise<void> {
    const existing = await prisma.blockedIp.findUnique({ where: { ip } });
    const currentAttempts = (existing?.attempts ?? 0) + 1;
    const isPermanent = currentAttempts >= this.MAX_ATTEMPTS;

    await prisma.blockedIp.upsert({
      where: { ip },
      update: {
        attempts: currentAttempts,
        isPermanent,
        reason: isPermanent ? "Exceeded 3 invalid PIN attempts" : undefined
      },
      create: {
        ip,
        attempts: currentAttempts,
        isPermanent,
        reason: isPermanent ? "Exceeded 3 invalid PIN attempts" : "Invalid PIN attempt"
      }
    });

    await prisma.securityLog.create({
      data: {
        ip,
        action: isPermanent ? "IP_PERMANENTLY_BANNED" : "LOGIN_FAILED",
        details: `Attempt ${currentAttempts} of ${this.MAX_ATTEMPTS}`
      }
    });

    logger.warn({ ip, attempts: currentAttempts, isPermanent }, "Security event recorded");
  }

  static async getRemainingAttempts(ip: string): Promise<number> {
    const record = await prisma.blockedIp.findUnique({ where: { ip } });
    if (!record) return this.MAX_ATTEMPTS;
    return Math.max(0, this.MAX_ATTEMPTS - record.attempts);
  }

  static async unblockIp(ip: string): Promise<boolean> {
    const deleted = await prisma.blockedIp.deleteMany({ where: { ip } });
    if (deleted.count > 0) {
      await prisma.securityLog.create({
        data: {
          ip,
          action: "IP_UNBLOCKED",
          details: "Manually unblocked via administrator/telegram"
        }
      });
      logger.info({ ip }, "IP unblocked successfully");
      return true;
    }
    return false;
  }

  static generateToken(ip: string): string {
    const payload = `${ip}:${Date.now() + 90 * 24 * 60 * 60 * 1000}`;
    const hmac = crypto.createHmac("sha256", config.SESSION_SECRET);
    hmac.update(payload);
    const signature = hmac.digest("hex");
    return Buffer.from(`${payload}:${signature}`).toString("base64url");
  }

  static verifyToken(token: string, clientIp: string): boolean {
    try {
      const decoded = Buffer.from(token, "base64url").toString("utf-8");
      const [ip, expiresAtStr, signature] = decoded.split(":");
      if (!ip || !expiresAtStr || !signature) return false;
      if (ip !== clientIp) return false;

      const expiresAt = parseInt(expiresAtStr, 10);
      if (Date.now() > expiresAt) return false;

      const expectedHmac = crypto.createHmac("sha256", config.SESSION_SECRET);
      expectedHmac.update(`${ip}:${expiresAtStr}`);
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHmac.digest("hex")));
    } catch {
      return false;
    }
  }
}
