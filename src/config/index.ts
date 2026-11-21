import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3005),
  DATABASE_URL: z.string().default("file:./workmanager.db"),
  APP_PIN: z.string().min(6).max(6).default("948271"),
  SESSION_SECRET: z.string().min(16).default("tasktracker_default_session_secret_2026"),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
  APP_DOMAIN: z.string().default("https://tasktracker.bot.nu")
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment configuration:", parsedEnv.error.format());
  process.exit(1);
}

export const config = parsedEnv.data;
