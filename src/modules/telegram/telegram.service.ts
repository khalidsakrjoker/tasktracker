import fs from "fs";
import path from "path";
import { config } from "../../config/index.js";
import { logger } from "../../shared/logger.js";
import { AuthService } from "../auth/auth.service.js";
import { prisma } from "../../shared/db.js";

export class TelegramService {
  private static isPolling = false;
  private static lastUpdateId = 0;

  static async sendMessage(text: string, chatId?: string | number): Promise<boolean> {
    const targetChatId = chatId || config.TELEGRAM_CHAT_ID;
    if (!config.TELEGRAM_BOT_TOKEN || !targetChatId) {
      return false;
    }

    try {
      const url = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`;
      let response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: targetChatId,
          text,
          parse_mode: "Markdown"
        })
      });

      let data = (await response.json()) as { ok: boolean; description?: string };
      // Fallback if markdown parsing fails
      if (!data.ok) {
        response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: targetChatId,
            text
          })
        });
        data = (await response.json()) as { ok: boolean; description?: string };
      }

      return data.ok;
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

  static async sendDatabaseBackup(chatId?: string | number): Promise<boolean> {
    const targetChatId = chatId || config.TELEGRAM_CHAT_ID;
    if (!config.TELEGRAM_BOT_TOKEN || !targetChatId) {
      return false;
    }

    try {
      // Flush WAL to disk first so backup has the freshest data
      try {
        await prisma.$executeRawUnsafe("PRAGMA wal_checkpoint(TRUNCATE);");
      } catch {
        // checkpoint fallback
      }

      const dbPath = path.resolve(process.cwd(), "prisma", "workmanager.db");
      const altDbPath = path.resolve(process.cwd(), "workmanager.db");
      const targetPath = fs.existsSync(dbPath) ? dbPath : altDbPath;

      if (!fs.existsSync(targetPath)) {
        logger.warn("Database file not found for backup");
        return false;
      }

      const fileBuffer = fs.readFileSync(targetPath);
      const formData = new FormData();
      formData.append("chat_id", String(targetChatId));
      formData.append(
        "caption",
        `📦 *نسخة احتياطية لقاعدة البيانات (Database Backup)*\n🕒 ${new Date().toLocaleString("ar-EG")}`
      );
      formData.append(
        "document",
        new Blob([fileBuffer]),
        `workmanager-backup-${new Date().toISOString().split("T")[0]}.db`
      );

      const url = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendDocument`;
      const response = await fetch(url, {
        method: "POST",
        body: formData
      });

      const resData = (await response.json()) as { ok: boolean };
      logger.info({ ok: resData.ok }, "Database backup sent to Telegram");
      return resData.ok;
    } catch (error) {
      logger.error({ error }, "Failed to send database backup to Telegram");
      return false;
    }
  }

  static startPolling(): void {
    if (this.isPolling || !config.TELEGRAM_BOT_TOKEN) return;
    this.isPolling = true;
    logger.info("Telegram Bot command polling started with long-polling");

    const poll = async () => {
      try {
        const url = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/getUpdates?offset=${this.lastUpdateId + 1}&timeout=10`;
        const response = await fetch(url);
        const data = (await response.json()) as {
          ok: boolean;
          result: Array<{
            update_id: number;
            message?: {
              text?: string;
              chat: { id: number | string };
              from?: { id: number; first_name?: string; username?: string };
            };
          }>;
        };

        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            this.lastUpdateId = update.update_id;
            const msgText = update.message?.text?.trim();
            const chatId = update.message?.chat?.id;
            if (!msgText || !chatId) continue;

            await this.handleIncomingCommand(msgText, chatId);
          }
        }
      } catch (err) {
        // silent polling catch
      } finally {
        setTimeout(poll, 1500);
      }
    };

    poll();
  }

  private static async handleIncomingCommand(text: string, chatId: number | string): Promise<void> {
    const rawCmd = text.split(/\s+/)[0].split("@")[0].toLowerCase();

    if (rawCmd === "/start" || rawCmd === "/help") {
      const welcomeMsg = `⚡ *مرحباً بك في بوت TaskTracker* 🤖\n\n` +
        `أنا المساعد الذكي لإدارة مهامك ومشروعاتك البرمجية.\n` +
        `يمكنك التحكم بالنظام واستلام التنبيهات من هذا الشات المباشر أو من الجروب المشترك!\n\n` +
        `📋 *الأوامر المتاحة:*\n` +
        `▫️ \`/status\` - تقرير فوري بحالة النظام والمشاريع والمهام\n` +
        `▫️ \`/tasks\` - عرض أهم المهام المعلقة والطارئة (P1)\n` +
        `▫️ \`/add <عنوان المهمة> [P1|P2|P3]\` - إضافة مهمة جديدة فوراً\n` +
        `▫️ \`/backup\` - إرسال نسخة احتياطية فورية لقاعدة البيانات\n` +
        `▫️ \`/unblock <IP>\` - فك الحظر الأمني عن أي عنوان IP\n` +
        `▫️ \`/help\` - عرض هذه الرسالة في أي وقت\n\n` +
        `🌐 *رابط المنصة:* ${config.APP_DOMAIN}`;

      await this.sendMessage(welcomeMsg, chatId);
    } else if (rawCmd === "/status") {
      const projectsCount = await prisma.project.count();
      const openTasksCount = await prisma.task.count({ where: { status: { not: "done" } } });
      const urgentTasksCount = await prisma.task.count({ where: { priority: "P1", status: { not: "done" } } });
      const inProgressTasksCount = await prisma.task.count({ where: { status: "in-progress" } });
      const completedToday = await prisma.task.count({
        where: {
          status: "done",
          completedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        }
      });

      const statusMsg = `📊 *تقرير حالة نظام TaskTracker:*\n\n` +
        `📁 المشروعات النشطة: *${projectsCount}*\n` +
        `🔴 المهام الطارئة (P1): *${urgentTasksCount}*\n` +
        `🟡 قيد التنفيذ: *${inProgressTasksCount}*\n` +
        `📋 إجمالي المهام المعلقة: *${openTasksCount}*\n` +
        `🟢 المنجز اليوم: *${completedToday}*\n\n` +
        `🌐 *رابط المنصة:* ${config.APP_DOMAIN}`;

      await this.sendMessage(statusMsg, chatId);
    } else if (rawCmd === "/tasks") {
      const tasks = await prisma.task.findMany({
        where: { status: { not: "done" } },
        orderBy: [
          { priority: "asc" },
          { createdAt: "desc" }
        ],
        take: 8,
        include: { project: true }
      });

      if (tasks.length === 0) {
        await this.sendMessage("🎉 *لا توجد أي مهام معلقة حالياً، عمل رائع!*", chatId);
        return;
      }

      let list = `📋 *أبرز المهام المعلقة حالياً (${tasks.length}):*\n\n`;
      for (const t of tasks) {
        const pIcon = t.priority === "P1" ? "🔴" : t.priority === "P2" ? "🟡" : "🟢";
        list += `${pIcon} *[${t.priority}]* ${t.title}\n   📁 المشروع: _${t.project.name}_\n\n`;
      }
      list += `🌐 للمزيد: ${config.APP_DOMAIN}`;

      await this.sendMessage(list, chatId);
    } else if (rawCmd === "/add") {
      const cmdBody = text.replace(/^\/add(@\w+)?\s*/i, "").trim();
      if (!cmdBody) {
        await this.sendMessage(
          "⚠️ *برجاء كتابة عنوان المهمة:*\nمثال: `/add إصلاح مشكلة تسجيل الدخول P1`",
          chatId
        );
        return;
      }

      let priority = "P2";
      let cleanTitle = cmdBody;
      const prioMatch = cmdBody.match(/\b(P1|P2|P3)\b/i);
      if (prioMatch) {
        priority = prioMatch[1].toUpperCase();
        cleanTitle = cmdBody.replace(new RegExp(`\\b${prioMatch[1]}\\b`, "i"), "").trim();
      }

      const project = await prisma.project.findFirst({
        where: { status: "active" },
        orderBy: { createdAt: "asc" }
      });

      if (!project) {
        await this.sendMessage("⚠️ لا يوجد مشروع نشط في النظام لإضافة المهمة إليه.", chatId);
        return;
      }

      const newTask = await prisma.task.create({
        data: {
          title: cleanTitle,
          priority,
          projectId: project.id,
          type: "feature",
          status: "todo"
        }
      });

      const prioIcon = priority === "P1" ? "🔴" : priority === "P2" ? "🟡" : "🟢";
      const reply = `✅ *تمت إضافة المهمة بنجاح إلى النظام!*\n\n` +
        `📌 *العنوان:* ${newTask.title}\n` +
        `⚡ *الأولوية:* ${prioIcon} ${newTask.priority}\n` +
        `📁 *المشروع:* ${project.name}\n\n` +
        `🌐 معروضة الآن في لوحة التحكم: ${config.APP_DOMAIN}`;

      await this.sendMessage(reply, chatId);
    } else if (rawCmd === "/backup") {
      await this.sendMessage("⏳ جاري إنشاء النسخة الاحتياطية وإرسالها إليك...", chatId);
      const ok = await this.sendDatabaseBackup(chatId);
      if (!ok) {
        await this.sendMessage("❌ تعذر إرسال النسخة الاحتياطية. يرجى مراجعة لوجات السيرفر.", chatId);
      }
    } else if (rawCmd === "/unblock") {
      const parts = text.split(/\s+/);
      const ip = parts[1]?.trim();
      if (!ip) {
        await this.sendMessage("⚠️ برجاء كتابة الـ IP المراد فك حظره:\n`/unblock 1.2.3.4`", chatId);
        return;
      }

      const unblocked = await AuthService.unblockIp(ip);
      if (unblocked) {
        await this.sendMessage(`✅ تم فك الحظر بنجاح عن الـ IP:\n\`${ip}\``, chatId);
      } else {
        await this.sendMessage(`ℹ️ هذا الـ IP غير محظور حالياً:\n\`${ip}\``, chatId);
      }
    } else if (text.startsWith("/")) {
      await this.sendMessage(
        "❓ أمر غير معروف. اكتب `/help` لعرض قائمة الأوامر المتاحة.",
        chatId
      );
    }
  }
}
