import pino from "pino";
import { config } from "../config/index.js";

export const logger = pino({
  level: config.NODE_ENV === "test" ? "silent" : "info",
  timestamp: pino.stdTimeFunctions.isoTime
});
