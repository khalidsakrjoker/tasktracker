import { app } from "./app.js";
import { config } from "./config/index.js";
import { initDatabasePragmas } from "./shared/db.js";
import { logger } from "./shared/logger.js";
import { TelegramService } from "./modules/telegram/telegram.service.js";

async function start() {
  try {
    await initDatabasePragmas();
    logger.info("SQLite WAL mode and optimizations enabled");

    // Start telegram polling
    TelegramService.startPolling();

    const server = app.listen(config.PORT, () => {
      logger.info(
        { port: config.PORT, env: config.NODE_ENV, domain: config.APP_DOMAIN },
        `TaskTracker server running on port ${config.PORT}`
      );
    });

    const shutdown = () => {
      logger.info("Shutting down gracefully...");
      server.close(() => {
        logger.info("Server closed.");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err) {
    logger.error({ err }, "Fatal startup error");
    process.exit(1);
  }
}

start();
