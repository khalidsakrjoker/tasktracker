import { describe, it, expect, vi } from "vitest";
import { TelegramService } from "../../src/modules/telegram/telegram.service.js";

describe("TelegramService Notifications", () => {
  it("should format and attempt to send messages and alerts", async () => {
    // Mock global fetch
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({ ok: true })
    } as any);

    const sent = await TelegramService.sendMessage("Test message");
    expect(sent).toBe(true);
    expect(fetchSpy).toHaveBeenCalled();

    await TelegramService.sendSecurityAlert("192.168.1.200", 3);
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    fetchSpy.mockRestore();
  });
});
