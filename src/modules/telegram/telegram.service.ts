import fs from "fs";
import path from "path";
import crypto from "crypto";
import { config } from "../../config/index.js";
import { logger } from "../../shared/logger.js";
import { AuthService } from "../auth/auth.service.js";
import { TasksService } from "../tasks/tasks.service.js";
import { prisma } from "../../shared/db.js";

export class TelegramService {
  private static isPolling = false;
  private static lastUpdateId = 0;
  private static authorizedUserIds = new Set<string | number>();
  private static authFileLoaded = false;

  private static loadAuthorizedUsers(): void {
    if (this.authFileLoaded) return;
    this.authFileLoaded = true;
    try {
      const authPath = path.resolve(process.cwd(), "prisma", "authorized_telegram_users.json");
      if (fs.existsSync(authPath)) {
        const raw = fs.readFileSync(authPath, "utf-8");
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach((id) => this.authorizedUserIds.add(id));
        }
      }
    } catch (err) {
      logger.error({ err }, "Failed to load authorized telegram users");
    }
  }

  private static saveAuthorizedUsers(): void {
    try {
      const authPath = path.resolve(process.cwd(), "prisma", "authorized_telegram_users.json");
      fs.writeFileSync(authPath, JSON.stringify(Array.from(this.authorizedUserIds), null, 2));
    } catch (err) {
      logger.error({ err }, "Failed to save authorized telegram users");
    }
  }

  static async sendMessage(text: string, chatId?: string | number, replyMarkup?: any): Promise<boolean> {
    const targetChatId = chatId || config.TELEGRAM_CHAT_ID;
    if (!config.TELEGRAM_BOT_TOKEN || !targetChatId) {
      return false;
    }

    try {
      const url = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`;
      const bodyPayload: any = {
        chat_id: targetChatId,
        text,
        parse_mode: "Markdown"
      };
      if (replyMarkup) {
        bodyPayload.reply_markup = replyMarkup;
      }

      let response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });

      let data = (await response.json()) as { ok: boolean; description?: string };
      // Fallback if markdown parsing fails
      if (!data.ok) {
        delete bodyPayload.parse_mode;
        response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyPayload)
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
    logger.info("Telegram Bot command polling started with long-polling and strict security whitelist");

    const poll = async () => {
      try {
        const url = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/getUpdates?offset=${this.lastUpdateId + 1}&timeout=10`;
        const response = await fetch(url);
        const data = (await response.json()) as {
          ok: boolean;
          result: Array<{
            update_id: number;
            callback_query?: {
              id: string;
              from: { id: number; first_name?: string; username?: string };
              message?: { chat: { id: number | string }; message_id: number; text?: string };
              data?: string;
            };
            message?: {
              text?: string;
              caption?: string;
              chat: { id: number | string };
              from?: { id: number; first_name?: string; username?: string };
              voice?: { file_id: string; duration: number; file_size?: number };
            };
          }>;
        };

        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            this.lastUpdateId = update.update_id;

            // 1. Handle inline button callbacks
            if (update.callback_query) {
              await this.handleCallbackQuery(update.callback_query);
              continue;
            }

            const chatId = update.message?.chat?.id;
            const fromUser = update.message?.from;
            if (!chatId) continue;

            // 2. Handle voice notes
            if (update.message?.voice) {
              await this.handleIncomingVoice(update.message.voice, chatId, fromUser, update.message.caption);
              continue;
            }

            // 3. Handle text commands
            const msgText = update.message?.text?.trim();
            if (!msgText) continue;

            await this.handleIncomingCommand(msgText, chatId, fromUser);
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

  private static async handleIncomingCommand(
    text: string,
    chatId: number | string,
    fromUser?: { id: number; first_name?: string; username?: string }
  ): Promise<void> {
    this.loadAuthorizedUsers();

    const isGroup = String(chatId) === String(config.TELEGRAM_CHAT_ID);
    const fromId = fromUser?.id;
    const isAuthorizedUser = fromId ? this.authorizedUserIds.has(fromId) || this.authorizedUserIds.has(String(fromId)) : false;

    const rawCmd = text.split(/\s+/)[0].split("@")[0].toLowerCase();

    // 1. PIN-Based Auth in Private Chat
    if (rawCmd === "/auth") {
      const pin = text.split(/\s+/)[1]?.trim();
      if (pin === config.APP_PIN) {
        if (fromId) {
          this.authorizedUserIds.add(fromId);
          this.saveAuthorizedUsers();
        }
        await this.sendMessage(
          `✅ *تم توثيق واعتماد حسابك كمسؤول للنظام!*\n\nأصبح بإمكانك الآن إرسال جميع الأوامر من هذا الشات بأمان تام. اكتب \`/help\` لمشاهدة الأوامر.`,
          chatId
        );
        await this.sendMessage(
          `🔔 *إشعار أمني:* تم توثيق حساب تيليجرام كمسؤول في الشات الخاص:\n👤 الحساب: @${fromUser?.username || "بدون يوزر"}\n🆔 الآيدي: \`${fromId}\``,
          config.TELEGRAM_CHAT_ID
        );
        return;
      } else {
        await this.sendMessage(
          `⛔ *رمز الـ PIN غير صحيح.*\nيرجى كتابة: \`/auth <PIN>\``,
          chatId
        );
        await this.sendMessage(
          `🚨 *تحذير أمني:* حاول حساب تيليجرام إدخال PIN خاطئ لتفعيل البوت في الخاص وتم صده:\n👤 الحساب: @${fromUser?.username || "بدون يوزر"}\n🆔 الآيدي: \`${fromId}\``,
          config.TELEGRAM_CHAT_ID
        );
        return;
      }
    }

    // 2. Ironclad Security Barrier: Must be either the private Task_BU group OR an authenticated admin user
    if (!isGroup && !isAuthorizedUser) {
      logger.warn({ fromId, fromUser, text }, "Blocked unauthorized Telegram access attempt");
      await this.sendMessage(
        `⛔ *وصول غير مصرح به:*\nهذا البوت شخصي وخاص بنظام TaskTracker Studio ومحمي أمنياً.\nلست مصرحاً لك بتنفيذ أي أوامر.`,
        chatId
      );
      // Alert the owner in the group!
      await this.sendMessage(
        `🚨 *تنبيه أمني - محاولة وصول غريبة للبوت:*\n` +
        `حاول حساب غير مصرح به التحدث مع البوت في الخاص وتم صده!\n` +
        `👤 الحساب: @${fromUser?.username || "بدون يوزر"}\n` +
        `🆔 الآيدي: \`${fromId}\`\n` +
        `💬 الرسالة التي كتبها: \`${text}\``,
        config.TELEGRAM_CHAT_ID
      );
      return;
    }

    // 3. Authorized command handlers
    if (rawCmd === "/start" || rawCmd === "/help") {
      const welcomeMsg = `⚡ *مرحباً بك في بوت TaskTracker* 🤖\n\n` +
        `أنا المساعد الذكي لإدارة مهامك ومشروعاتك البرمجية.\n` +
        `تم تأمين هذا الشات بنظام Whitelist حصري لحسابك.\n\n` +
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
          { sortOrder: "asc" },
          { createdAt: "asc" }
        ],
        take: 8,
        include: { project: true }
      });

      if (tasks.length === 0) {
        await this.sendMessage("🎉 *لا توجد أي مهام معلقة حالياً، عمل رائع!*", chatId);
        return;
      }

      await this.sendMessage(`📋 *أبرز المهام المعلقة حالياً (${tasks.length}):*`, chatId);

      for (const t of tasks) {
        const pIcon = t.priority === "P1" ? "🔴" : t.priority === "P2" ? "🟡" : "🟢";
        const taskMsg = `${pIcon} *[${t.priority}]* ${t.title}\n📁 المشروع: _${t.project.name}_`;
        const keyboard = {
          inline_keyboard: [
            [
              { text: "▶️ بدء", callback_data: `start_${t.id}` },
              { text: "✅ تم", callback_data: `done_${t.id}` },
              { text: "🗑️ حذف", callback_data: `del_${t.id}` }
            ]
          ]
        };
        await this.sendMessage(taskMsg, chatId, keyboard);
      }
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

      const keyboard = {
        inline_keyboard: [
          [
            { text: "▶️ بدء العمل", callback_data: `start_${newTask.id}` },
            { text: "✅ تم الإنجاز", callback_data: `done_${newTask.id}` },
            { text: "🗑️ حذف", callback_data: `del_${newTask.id}` }
          ]
        ]
      };

      await this.sendMessage(reply, chatId, keyboard);
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

  private static async handleIncomingVoice(
    voice: { file_id: string; duration: number; file_size?: number },
    chatId: number | string,
    fromUser?: { id: number; first_name?: string; username?: string },
    caption?: string
  ): Promise<void> {
    this.loadAuthorizedUsers();
    const isGroup = String(chatId) === String(config.TELEGRAM_CHAT_ID);
    const fromId = fromUser?.id;
    const isAuthorized = isGroup || (fromId ? this.authorizedUserIds.has(fromId) || this.authorizedUserIds.has(String(fromId)) : false);

    if (!isAuthorized) {
      await this.sendMessage("⛔ وصول غير مصرح به لتسجيل المهام الصوتية.", chatId);
      return;
    }

    const project = await prisma.project.findFirst({
      where: { status: "active" },
      orderBy: { createdAt: "asc" }
    });

    if (!project) {
      await this.sendMessage("⚠️ لا يوجد مشروع نشط لإضافة التسجيل الصوتي إليه.", chatId);
      return;
    }

    const taskTitle = caption?.trim() || `🎙️ طلب صوتي مسجل (${voice.duration || 0}ث)`;
    const taskDetails = `تسجيل صوتي وارد عبر تليجرام (المدة: ${voice.duration || 0} ثانية).\nتاريخ الاستلام: ${new Date().toLocaleString("ar-EG")}`;

    const audioUrl = await this.downloadTelegramAudio(voice.file_id);

    const newTask = await prisma.task.create({
      data: {
        title: taskTitle,
        details: taskDetails,
        audioUrl,
        priority: "P1", // Audio requests default to emergency focus P1
        projectId: project.id,
        type: "support",
        status: "today"
      },
      include: { project: true }
    });

    const reply = `🎙️ *تم استلام التسجيل الصوتي وإدراجه كمهمة طارئة (P1)!*\n\n` +
      `📌 *العنوان:* ${newTask.title}\n` +
      `⏱️ *المدة:* ${voice.duration} ثانية\n` +
      `📁 *المشروع:* ${project.name}\n` +
      `🕒 *الوقت:* ${new Date().toLocaleTimeString("ar-EG")}\n\n` +
      `🌐 ظاهرة الآن في لوحة التركيز اليومي: ${config.APP_DOMAIN}`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: "▶️ بدء العمل", callback_data: `start_${newTask.id}` },
          { text: "✅ تم الإنجاز", callback_data: `done_${newTask.id}` },
          { text: "🗑️ حذف", callback_data: `del_${newTask.id}` }
        ]
      ]
    };

    await this.sendMessage(reply, chatId, keyboard);
  }

  private static async downloadTelegramAudio(fileId: string): Promise<string | null> {
    try {
      const getFileUrl = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`;
      const res = await fetch(getFileUrl);
      if (!res.ok) return null;
      const data = (await res.json()) as { ok: boolean; result?: { file_path?: string } };
      if (!data.ok || !data.result?.file_path) return null;

      const filePath = data.result.file_path;
      const downloadUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_BOT_TOKEN}/${filePath}`;
      const fileRes = await fetch(downloadUrl);
      if (!fileRes.ok) return null;

      const arrayBuffer = await fileRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadDir = path.resolve(process.cwd(), "uploads", "audio");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const ext = path.extname(filePath) || ".oga";
      const filename = `voice_${Date.now()}_${crypto.randomBytes(4).toString("hex")}${ext}`;
      const localFilePath = path.join(uploadDir, filename);

      fs.writeFileSync(localFilePath, buffer);
      logger.info({ filename, size: buffer.length }, "Downloaded and saved Telegram voice note");
      return `/uploads/audio/${filename}`;
    } catch (err) {
      logger.error({ err, fileId }, "Failed to download voice file from Telegram");
      return null;
    }
  }

  private static async handleCallbackQuery(query: {
    id: string;
    from: { id: number; first_name?: string; username?: string };
    message?: { chat: { id: number | string }; message_id: number; text?: string };
    data?: string;
  }): Promise<void> {
    const fromId = query.from.id;
    const chatId = query.message?.chat?.id;
    const isGroup = String(chatId) === String(config.TELEGRAM_CHAT_ID);
    this.loadAuthorizedUsers();
    const isAuthorized = isGroup || this.authorizedUserIds.has(fromId) || this.authorizedUserIds.has(String(fromId));

    const answerUrl = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`;
    const sendAnswer = async (text: string) => {
      try {
        await fetch(answerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ callback_query_id: query.id, text })
        });
      } catch {}
    };

    if (!isAuthorized) {
      await sendAnswer("⛔ غير مصرح لك بتنفيذ هذا الإجراء.");
      return;
    }

    const data = query.data || "";
    const [action, taskIdStr] = data.split("_");
    const taskId = parseInt(taskIdStr, 10);

    if (isNaN(taskId)) {
      await sendAnswer("❌ معرف مهمة غير صالح.");
      return;
    }

    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { project: true }
      });

      if (!task) {
        await sendAnswer("⚠️ المهمة غير موجودة أو تم حذفها مسبقاً.");
        return;
      }

      if (action === "done") {
        await TasksService.updateTask(taskId, { status: "done" });
        await sendAnswer("✅ تم إنجاز المهمة!");
        if (chatId) {
          await this.sendMessage(
            `🎉 *تم إنجاز المهمة بنجاح:*\n"${task.title}"\n📁 المشروع: ${task.project.name}\n🧹 تم تنظيف أي مرفقات مرتبطة تلقائياً من السيرفر.`,
            chatId
          );
        }
      } else if (action === "start") {
        await TasksService.updateTask(taskId, { status: "in_progress" });
        await sendAnswer("▶️ بدأت العمل على المهمة!");
        if (chatId) {
          await this.sendMessage(
            `⚡ *بدأ العمل على المهمة:* "${task.title}"\n📁 المشروع: ${task.project.name}`,
            chatId
          );
        }
      } else if (action === "del") {
        await TasksService.deleteTask(taskId);
        await sendAnswer("🗑️ تم حذف المهمة!");
        if (chatId) {
          await this.sendMessage(
            `🗑️ *تم حذف المهمة نهائياً:* "${task.title}"`,
            chatId
          );
        }
      }
    } catch (err) {
      logger.error({ err }, "Error handling callback query in Telegram bot");
      await sendAnswer("❌ حدث خطأ أثناء تنفيذ الإجراء.");
    }
  }
}
