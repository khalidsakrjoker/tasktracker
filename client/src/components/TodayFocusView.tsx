import React from "react";
import { Task, TodayFocusData } from "../types";
import { useI18n } from "../i18n";

interface TodayFocusViewProps {
  focusData: TodayFocusData;
  onUpdateTaskStatus: (taskId: number, status: string) => void;
  onOpenQuickAdd: (priority?: "P1" | "P2" | "P3") => void;
}

export const TodayFocusView: React.FC<TodayFocusViewProps> = ({
  focusData,
  onUpdateTaskStatus,
  onOpenQuickAdd
}) => {
  const { t, lang } = useI18n();

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "bug": return `🐞 ${t("typeBug")}`;
      case "feature": return `✨ ${t("typeFeature")}`;
      case "tweak": return `⚡ ${t("typeTweak")}`;
      default: return `📞 ${t("typeSupport")}`;
    }
  };

  const renderTaskCard = (task: Task) => {
    return (
      <div
        key={task.id}
        className={`p-4 rounded-xl bg-theme-card border border-theme-border hover:border-blue-500/40 transition-all shadow-sm group ${
          task.priority === "P1"
            ? "glow-card-p1"
            : task.priority === "P2"
            ? "glow-card-p2"
            : "glow-card-p3"
        }`}
      >
        {/* Header: Project Badge + Type */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-md text-white shadow-sm"
              style={{ backgroundColor: task.project?.color || "#3B82F6" }}
            >
              {task.project?.name}
            </span>
            <span className="text-[10px] text-theme-textSecondary bg-theme-elevated px-1.5 py-0.5 rounded border border-theme-border">
              {getTypeLabel(task.type)}
            </span>
          </div>

          <div className="text-[11px] text-theme-textMuted font-medium flex items-center gap-1">
            <i className="fa-regular fa-clock"></i>
            <span>{task.estimatedMinutes || 30}{t("minAbbr")}</span>
          </div>
        </div>

        {/* Task Title */}
        <h3 className="text-sm font-semibold text-theme-text leading-snug mb-2 group-hover:text-blue-600 transition-colors">
          {task.title}
        </h3>

        {/* Details if any */}
        {task.details && (
          <p className="text-xs text-theme-textSecondary line-clamp-2 mb-3 bg-theme-elevated p-2 rounded-lg border border-theme-borderSubtle">
            {task.details}
          </p>
        )}

        {/* Client association if any */}
        {task.client && (
          <div className="flex items-center gap-2 text-xs text-theme-textSecondary mb-3 bg-theme-elevated px-2 py-1 rounded border border-theme-borderSubtle">
            <i className="fa-solid fa-user-tie text-[10px] text-theme-textMuted"></i>
            <span className="font-medium">{task.client.name}</span>
            {task.client.phone && (
              <span className="text-[10px] text-theme-textMuted font-mono" dir="ltr">
                {task.client.phone}
              </span>
            )}
          </div>
        )}

        {/* Footer: Quick Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-theme-border">
          <span className="text-[10px] text-theme-textMuted">
            {new Date(task.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onUpdateTaskStatus(task.id, task.status === "in_progress" ? "today" : "in_progress")}
              title={task.status === "in_progress" ? t("pauseBtn") : t("startBtn")}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all flex items-center gap-1 ${
                task.status === "in_progress"
                  ? "bg-amber-500/20 text-amber-600 border-amber-500/40 animate-pulse font-bold"
                  : "bg-theme-elevated hover:bg-theme-hover text-theme-textSecondary border-theme-border"
              }`}
            >
              <i className={`fa-solid ${task.status === "in_progress" ? "fa-pause" : "fa-play"}`}></i>
              <span>{task.status === "in_progress" ? t("inProgressBadge") : t("startBtn")}</span>
            </button>

            <button
              onClick={() => onUpdateTaskStatus(task.id, "done")}
              title={t("doneBtn")}
              className="text-xs px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-600 border border-emerald-500/40 font-bold transition-all flex items-center gap-1"
            >
              <i className="fa-solid fa-check"></i>
              <span>{t("doneBtn")}</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Title & Philosophy Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold text-theme-text flex items-center gap-2">
            <span>{t("focusTitle")}</span>
            <span className="text-xs font-normal text-theme-textMuted bg-theme-card px-2 py-0.5 rounded-full border border-theme-border">
              {t("focusMatrixBadge")}
            </span>
          </h2>
          <p className="text-xs text-theme-textMuted mt-1">
            {t("focusSubtitle")}
          </p>
        </div>
      </div>

      {/* 3 Full-Width Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: P1 Emergency */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-rose-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <h3 className="text-sm font-bold text-rose-500">{t("p1EmergencyTitle")}</h3>
            </div>
            <span className="text-xs font-mono font-bold bg-rose-500/20 text-rose-500 px-2 py-0.5 rounded-full">
              {focusData.p1Urgent.length}
            </span>
          </div>

          <div className="space-y-3">
            {focusData.p1Urgent.length === 0 ? (
              <div className="p-8 rounded-xl bg-theme-card border border-theme-border text-center text-theme-textMuted space-y-2">
                <i className="fa-regular fa-face-smile text-2xl text-emerald-500"></i>
                <p className="text-xs">{t("p1EmergencyEmpty")}</p>
              </div>
            ) : (
              focusData.p1Urgent.map(renderTaskCard)
            )}

            <button
              onClick={() => onOpenQuickAdd("P1")}
              className="w-full py-2.5 rounded-xl border border-dashed border-rose-500/40 hover:border-rose-500 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <i className="fa-solid fa-plus"></i>
              <span>{t("p1AddBtn")}</span>
            </button>
          </div>
        </div>

        {/* Column 2: P2 Core Features */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-amber-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h3 className="text-sm font-bold text-amber-600">{t("p2FeaturesTitle")}</h3>
            </div>
            <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded-full">
              {focusData.p2Features.length}
            </span>
          </div>

          <div className="space-y-3">
            {focusData.p2Features.length === 0 ? (
              <div className="p-8 rounded-xl bg-theme-card border border-theme-border text-center text-theme-textMuted space-y-2">
                <i className="fa-solid fa-code text-2xl text-theme-textMuted"></i>
                <p className="text-xs">{t("p2FeaturesEmpty")}</p>
              </div>
            ) : (
              focusData.p2Features.map(renderTaskCard)
            )}

            <button
              onClick={() => onOpenQuickAdd("P2")}
              className="w-full py-2.5 rounded-xl border border-dashed border-amber-500/40 hover:border-amber-500 text-amber-600 hover:bg-amber-500/10 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <i className="fa-solid fa-plus"></i>
              <span>{t("p2AddBtn")}</span>
            </button>
          </div>
        </div>

        {/* Column 3: P3 Quick Tweaks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-emerald-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h3 className="text-sm font-bold text-emerald-600">{t("p3TweaksTitle")}</h3>
            </div>
            <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded-full">
              {focusData.p3Tweaks.length}
            </span>
          </div>

          <div className="space-y-3">
            {focusData.p3Tweaks.length === 0 ? (
              <div className="p-8 rounded-xl bg-theme-card border border-theme-border text-center text-theme-textMuted space-y-2">
                <i className="fa-solid fa-check-double text-2xl text-theme-textMuted"></i>
                <p className="text-xs">{t("p3TweaksEmpty")}</p>
              </div>
            ) : (
              focusData.p3Tweaks.map(renderTaskCard)
            )}

            <button
              onClick={() => onOpenQuickAdd("P3")}
              className="w-full py-2.5 rounded-xl border border-dashed border-emerald-500/40 hover:border-emerald-500 text-emerald-600 hover:bg-emerald-500/10 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <i className="fa-solid fa-plus"></i>
              <span>{t("p3AddBtn")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
