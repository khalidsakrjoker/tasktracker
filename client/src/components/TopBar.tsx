import React from "react";

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
  return (
    <header className="h-16 border-b border-obsidian-700 bg-obsidian-950/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Search Input */}
      <div className="flex-1 max-w-xl relative">
        <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 pointer-events-none">
          <i className="fa-solid fa-magnifying-glass text-sm"></i>
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث سريع في كل المشروعات، العملاء، والمهام (Ctrl + K)..."
          className="w-full bg-obsidian-850 border border-obsidian-700 rounded-xl pr-10 pl-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 left-3 flex items-center text-slate-500 hover:text-slate-300"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
      </div>

      {/* Productivity Stats Tickers */}
      <div className="hidden md:flex items-center gap-3">
        {/* P1 Urgent Ticker */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span>{urgentCount} طوارئ P1</span>
        </div>

        {/* Today Focus Count */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
          <i className="fa-solid fa-bullseye text-xs"></i>
          <span>{todayCount} مهام جارية</span>
        </div>

        {/* Completed Today Count */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <i className="fa-solid fa-circle-check text-xs"></i>
          <span>{completedTodayCount} منجز اليوم</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Telegram Backup Trigger */}
        <button
          onClick={onTriggerBackup}
          disabled={isBackingUp}
          title="إرسال نسخة احتياطية فورية إلى تليجرام"
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-750 border border-obsidian-700 text-slate-300 hover:text-white text-xs font-medium transition-all"
        >
          <i className={`fa-brands fa-telegram text-sky-400 ${isBackingUp ? "animate-spin" : ""}`}></i>
          <span>{isBackingUp ? "جاري الإرسال..." : "نسخ لتليجرام"}</span>
        </button>

        {/* Quick Add Button */}
        <button
          onClick={onOpenQuickAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
        >
          <i className="fa-solid fa-plus"></i>
          <span>مهمة خاطفة (N)</span>
        </button>

        {/* Logout / Lock */}
        <button
          onClick={onLogout}
          title="قفل الشاشة وتسجيل الخروج"
          className="p-2 rounded-xl bg-obsidian-800 hover:bg-rose-500/20 border border-obsidian-700 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 text-sm transition-all"
        >
          <i className="fa-solid fa-lock"></i>
        </button>
      </div>
    </header>
  );
};
