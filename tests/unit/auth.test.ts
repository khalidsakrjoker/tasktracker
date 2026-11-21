import { describe, it, expect, beforeEach } from "vitest";
import { AuthService } from "../../src/modules/auth/auth.service.js";
import { prisma } from "../../src/shared/db.js";

describe("AuthService & Security Guard", () => {
  const testIp = "192.168.1.150";

  beforeEach(async () => {
    await prisma.blockedIp.deleteMany({ where: { ip: testIp } });
  });

  it("should calculate remaining attempts correctly", async () => {
    const remaining = await AuthService.getRemainingAttempts(testIp);
    expect(remaining).toBe(3);
  });

  it("should record failed attempts and lock out on 3rd failure", async () => {
    // Attempt 1
    await AuthService.recordFailedAttempt(testIp);
    let isBlocked = await AuthService.isIpBlocked(testIp);
    expect(isBlocked).toBe(false);

    // Attempt 2
    await AuthService.recordFailedAttempt(testIp);
    isBlocked = await AuthService.isIpBlocked(testIp);
    expect(isBlocked).toBe(false);

    // Attempt 3 - Permanent Ban Trigger
    await AuthService.recordFailedAttempt(testIp);
    isBlocked = await AuthService.isIpBlocked(testIp);
    expect(isBlocked).toBe(true);

    const remaining = await AuthService.getRemainingAttempts(testIp);
    expect(remaining).toBe(0);
  });

  it("should unblock a banned IP", async () => {
    await AuthService.recordFailedAttempt(testIp);
    await AuthService.recordFailedAttempt(testIp);
    await AuthService.recordFailedAttempt(testIp);
    expect(await AuthService.isIpBlocked(testIp)).toBe(true);

    const unblocked = await AuthService.unblockIp(testIp);
    expect(unblocked).toBe(true);
    expect(await AuthService.isIpBlocked(testIp)).toBe(false);
  });

  it("should generate and verify valid cryptographic session tokens", () => {
    const token = AuthService.generateToken(testIp);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);

    const isValid = AuthService.verifyToken(token, testIp);
    expect(isValid).toBe(true);

    const isInvalidIp = AuthService.verifyToken(token, "10.0.0.99");
    expect(isInvalidIp).toBe(false);
  });
});
