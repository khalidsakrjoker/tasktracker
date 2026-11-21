import { Router, Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { getClientIp, requireAuth } from "./auth.middleware.js";
import { TelegramService } from "../telegram/telegram.service.js";

export const authRouter = Router();

authRouter.post("/login", async (req: Request, res: Response, next) => {
  try {
    const { pin } = req.body;
    const ip = getClientIp(req);

    if (!pin || typeof pin !== "string") {
      res.status(400).json({ error: "PIN is required and must be a 6-digit string" });
      return;
    }

    try {
      const token = await AuthService.verifyPinAndLogin(pin, ip);

      // Set cookie for 90 days
      res.cookie("tasktracker_session", token, {
        httpOnly: true,
        secure: req.secure || req.headers["x-forwarded-proto"] === "https",
        sameSite: "lax",
        maxAge: 90 * 24 * 60 * 60 * 1000
      });

      res.json({
        success: true,
        token,
        message: "Authentication successful"
      });
    } catch (err: any) {
      if (err.statusCode === 403) {
        // IP got banned, send Telegram alert
        await TelegramService.sendSecurityAlert(ip, 3);
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", (req: Request, res: Response) => {
  const token = req.cookies?.["tasktracker_session"] || req.headers["authorization"]?.replace("Bearer ", "");
  const ip = getClientIp(req);

  if (token && AuthService.verifyToken(token, ip)) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

authRouter.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("tasktracker_session");
  res.json({ success: true, message: "Logged out successfully" });
});
