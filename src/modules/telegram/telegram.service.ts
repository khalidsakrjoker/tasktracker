import fs from "fs";
import path from "path";
import { config } from "../../config/index.js";
import { logger } from "../../shared/logger.js";
import { AuthService } from "../auth/auth.service.js";
import { prisma } from "../../shared/db.js";

export class TelegramService {
  private static isPolling = false;
  private static lastUpdateId = 0;

  static async sendMessage(text: string): Promise<boolean> {
    if (!config.TELEGRAM_BOT_TOKEN || !config.TELEGRAM_CHAT_ID) {
      return false;
    }

    try {
      const url = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: config.TELEGRAM_CHAT_ID,
          text,
          parse_mode: "Markdown"
        })
      });

      const data = await response.json();
      return (data as { ok: boolean }).ok;
    } catch (error) {
      logger.error({ error }, "Failed to send Telegram message");
      return false;
    }
  }

  static async sendSecurityAlert(ip: string, attempts: number): Promise<void> {
    const message = `🚨 *تنبيه أمني - نظام TaskTracker*\n\n` +
      `⚠️ *تم حظر عنوان IP بشكل دائم:*\n` +
      `\`${ip}\`\n\n` +
      `🔢 *السبب:* تجاوز ${attempts} محاولات دخول خاطئة لكود الـ PIN.\n` +
      `🕒 *الوقت:* ${new Date().toLocaleString("ar-EG")}\n\n` +
      `🔓 *لفك الحظر عن هذا الـ IP اكتب:*\n` +
      `\`/unblock ${ip}\``;

    await this.sendMessage(message);
  }

  static async sendDatabaseBackup(): Promise<boolean> {
    if (!config.TELEGRAM_BOT_TOKEN || !config.TELEGRAM_CHAT_ID) {
      return false;
    }

    try {
      const dbPath = path.resolve(process.cwd(), "prisma", "workmanager.db");
      const altDbPath = path.resolve(process.cwd(), "workmanager.db");
      const targetPath = fs.existsSync(dbPath) ? dbPath : altDbPath;

      if (!fs.existsSync(targetPath)) {
        logger.warn("Database file not found for backup");
        return false;
      }

      const fileBuffer = fs.readFileSync(targetPath);
      const formData = new FormData();
      formData.append("chat_id", config.TELEGRAM_CHAT_ID);
      formData.append("caption", `📦 *نسخة احتياطية لقاعدة البيانات (Database Backup)*\n🕒 ${new Date().toLocaleString("ar-EG")}`);
      formData.append("document", new Blob([fileBuffer]), `workmanager-backup-${new Date().toISOString().split("T")[0]}.db`);

      const url = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendDocument`;
      const response = await fetch(url, {
        method: "POST",
        body: formData
      });

      const resData = await response.json();
      logger.info({ ok: (resData as { ok: boolean }).ok }, "Database backup sent to Telegram");
      return (resData as { ok: boolean }).ok;
    } catch (error) {
      logger.error({ error }, "Failed to send database backup to Telegram");
      return false;
    }
  }

  static startPolling(): void {
    if (this.isPolling || !config.TELEGRAM_BOT_TOKEN) return;
    this.isPolling = true;
    logger.info("Telegram Bot command polling started");

    setInterval(async () => {
      try {
        const url = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/getUpdates?offset=${this.lastUpdateId + 1}&timeout=5`;
        const response = await fetch(url);
        const data = await response.json() as { ok: boolean; result: Array<{ update_id: number; message?: { text?: string; chat: { id: number | string } } }> };

        if (!data.ok || !Array.isArray(data.result)) return;

        for (const update of data.result) {
          this.lastUpdateId = update.update_id;
          const msgText = update.message?.text?.trim();
          if (!msgText) continue;

          await this.handleIncomingCommand(msgText);
        }
      } catch (err) {
        // silent polling error
      }
    }, 5000);
  }

  private static async handleIncomingCommand(text: string): Promise<void> {
    if (text.startsWith("/unblock")) {
      const parts = text.split(" ");
      const ip = parts[1]?.trim();
      if (!ip) {
        await this.sendMessage("⚠️ برجاء كتابة الـ IP المراد فك حظره:\n`/unblock 1.2.3.4`");
        return;
      }

      const unblocked = await AuthService.unblockIp(ip);
      if (unblocked) {
        await this.sendMessage(`✅ تم فك الحظر بنجاح عن الـ IP:\n\`${ip}\``);
      } else {
        await this.sendMessage(`ℹ️ هذا الـ IP غير محظور حالياً:\n\`${ip}\``);
      }
    } else if (text === "/backup") {
      await this.sendMessage("⏳ جاري إنشاء النسخة الاحتياطية وإرسالها...");
      await this.sendDatabaseBackup();
    } else if (text === "/status") {
      const projectsCount = await prisma.project.count();
      const openTasksCount = await prisma.task.count({ where: { status: { not: "done" } } });
      const urgentTasksCount = await prisma.task.count({ where: { priority: "P1", status: { not: "done" } } });
      const completedToday = await prisma.task.count({
        where: {
          status: "done",
          completedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        }
      });

      const statusMsg = `📊 *تقرير حالة نظام TaskTracker:*\n\n` +
        `📁 المشروعات النشطة: *${projectsCount}*\n` +
        `🔴 المهام الطارئة (P1): *${urgentTasksCount}*\n` +
        `🟡 إجمالي المهام المعلقة: *${openTasksCount}*\n` +
        `🟢 المنجز اليوم: *${completedToday}*\n` +
        `🌐 الرابط: ${config.APP_DOMAIN}`;

      await this.sendMessage(statusMsg);
    }
  }
}
