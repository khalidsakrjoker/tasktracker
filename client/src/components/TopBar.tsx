import React from "react";
import { useI18n } from "../i18n";
import { useTheme } from "../theme";

interface TopBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  urgentCount: number;
  todayCount: number;
  completedTodayCount: number;
  onOpenQuickAdd: () => void;
  onLogout: () => void;
  onTriggerBackup: () => void;
  isBackingUp: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  setSearchQuery,
  urgentCount,
  todayCount,
  completedTodayCount,
  onOpenQuickAdd,
  onLogout,
  onTriggerBackup,
  isBackingUp
}) => {
  const { lang, setLang, t } = useI18n();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-theme-border bg-theme-card/85 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Search Input */}
      <div className="flex-1 max-w-xl relative">
        <span className="absolute inset-y-0 start-3 flex items-center text-theme-textMuted pointer-events-none">
          <i className="fa-solid fa-magnifying-glass text-xs"></i>
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full bg-theme-input border border-theme-border rounded-xl ps-9 pe-9 py-2 text-xs text-theme-text placeholder-theme-textMuted focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 end-3 flex items-center text-theme-textMuted hover:text-theme-text"
          >
            <i className="fa-solid fa-xmark text-xs"></i>
          </button>
        )}
      </div>

      {/* Productivity Stats Tickers */}
      <div className="hidden md:flex items-center gap-2.5">
        {/* P1 Urgent Ticker */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span>{urgentCount} {t("urgentTicker")}</span>
        </div>

        {/* Today Focus Count */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 text-xs font-semibold">
          <i className="fa-solid fa-bullseye text-xs"></i>
          <span>{todayCount} {t("activeTicker")}</span>
        </div>

        {/* Completed Today Count */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-semibold">
          <i className="fa-solid fa-circle-check text-xs"></i>
          <span>{completedTodayCount} {t("completedTicker")}</span>
        </div>
      </div>

      {/* Action Controls & Settings */}
      <div className="flex items-center gap-2">
        {/* Language Switcher (EN / AR) */}
        <button
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          title={lang === "en" ? "تبديل إلى العربية" : "Switch to English"}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-theme-elevated hover:bg-theme-hover border border-theme-border text-theme-text text-xs font-bold transition-all shadow-sm"
        >
          <i className="fa-solid fa-globe text-blue-500 text-xs"></i>
          <span className="font-mono uppercase">{lang === "en" ? "AR" : "EN"}</span>
        </button>

        {/* Theme Switcher (Light / Dark) */}
        <button
          onClick={toggleTheme}
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          className="p-2 rounded-xl bg-theme-elevated hover:bg-theme-hover border border-theme-border text-theme-text text-xs font-semibold transition-all shadow-sm"
        >
          <i className={`fa-solid ${theme === "light" ? "fa-moon text-indigo-500" : "fa-sun text-amber-400"}`}></i>
        </button>

        {/* Telegram Backup Trigger */}
        <button
          onClick={onTriggerBackup}
          disabled={isBackingUp}
          title={t("telegramBackup")}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-theme-elevated hover:bg-theme-hover border border-theme-border text-theme-text text-xs font-medium transition-all shadow-sm"
        >
          <i className={`fa-brands fa-telegram text-sky-500 text-xs ${isBackingUp ? "animate-spin" : ""}`}></i>
          <span>{isBackingUp ? t("sendingBackup") : t("telegramBackup")}</span>
        </button>

        {/* Quick Add Button */}
        <button
          onClick={onOpenQuickAdd}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
        >
          <i className="fa-solid fa-plus"></i>
          <span>{t("quickCaptureBtn")}</span>
        </button>

        {/* Logout / Lock */}
        <button
          onClick={onLogout}
          title={t("lockScreen")}
          className="p-2 rounded-xl bg-theme-elevated hover:bg-rose-500/20 border border-theme-border hover:border-rose-500/40 text-theme-textMuted hover:text-rose-500 text-xs transition-all shadow-sm"
        >
          <i className="fa-solid fa-lock"></i>
        </button>
      </div>
    </header>
  );
};
