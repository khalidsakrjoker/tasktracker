import React, { useState } from "react";
import { Task, TodayFocusData } from "../types";
import { useI18n } from "../i18n";
import { BacklogDrawer } from "./BacklogDrawer";

interface TodayFocusViewProps {
  focusData: TodayFocusData;
  onUpdateTaskStatus: (taskId: number, status: string) => void;
  onDeleteTask: (taskId: number) => void;
  onOpenQuickAdd: (priority?: "P1" | "P2" | "P3") => void;
  onEditTask: (task: Task) => void;
  onReorderTask: (taskId: number, direction: "up" | "down", list: Task[]) => void;
  onPreviewImage: (imageUrl: string, title: string) => void;
}

export const TodayFocusView: React.FC<TodayFocusViewProps> = ({
  focusData,
  onUpdateTaskStatus,
  onDeleteTask,
  onOpenQuickAdd,
  onEditTask,
  onReorderTask,
  onPreviewImage
}) => {
  const { t, lang } = useI18n();
  const [isBacklogOpen, setIsBacklogOpen] = useState(false);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "bug": return `🐞 ${t("typeBug")}`;
      case "feature": return `✨ ${t("typeFeature")}`;
      case "tweak": return `⚡ ${t("typeTweak")}`;
      default: return `📞 ${t("typeSupport")}`;
    }
  };

  const renderTaskCard = (task: Task, index: number, list: Task[]) => {
    return (
      <div
        key={task.id}
        className={`p-4 rounded-xl bg-theme-card border border-theme-border hover:border-blue-500/40 transition-all shadow-sm group ${task.priority === "P1"
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

        {/* Image Attachment Thumbnail with click to open full preview */}
        {task.imageUrl && (
          <div className="mb-3">
            <button
              type="button"
              onClick={() => onPreviewImage(task.imageUrl!, task.title)}
              className="group/img relative block w-full overflow-hidden rounded-lg border border-theme-borderSubtle hover:border-blue-500/50 transition-all cursor-zoom-in bg-black/20"
              title={lang === "ar" ? "اضغط لتكبير الصورة كاملة" : "Click to view full image"}
            >
              <img
                src={task.imageUrl}
                alt={task.title}
                className="w-full max-h-32 object-cover rounded-lg group-hover/img:scale-[1.03] transition-transform duration-200"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-[1px]">
                <i className="fa-solid fa-magnifying-glass-plus"></i>
                <span>{lang === "ar" ? "عرض الصورة كاملة" : "Enlarge Image"}</span>
              </div>
            </button>
          </div>
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

        {/* Footer: Quick Actions & Reordering */}
        <div className="flex items-center justify-between pt-2 border-t border-theme-border">
          {/* Reordering Controls (▲ / ▼) + Date */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center rounded-lg border border-theme-border bg-theme-elevated overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => onReorderTask(task.id, "up", list)}
                disabled={index === 0}
                title={t("moveUp") || "تحريك لأعلى"}
                className={`px-1.5 py-1 text-xs hover:bg-theme-hover transition-colors ${index === 0 ? "opacity-25 cursor-not-allowed" : "text-theme-textSecondary hover:text-blue-500"
                  }`}
              >
                <i className="fa-solid fa-chevron-up text-[10px]"></i>
              </button>
              <div className="w-[1px] h-3 bg-theme-border"></div>
              <button
                type="button"
                onClick={() => onReorderTask(task.id, "down", list)}
                disabled={index === list.length - 1}
                title={t("moveDown") || "تحريك لأسفل"}
                className={`px-1.5 py-1 text-xs hover:bg-theme-hover transition-colors ${index === list.length - 1 ? "opacity-25 cursor-not-allowed" : "text-theme-textSecondary hover:text-blue-500"
                  }`}
              >
                <i className="fa-solid fa-chevron-down text-[10px]"></i>
              </button>
            </div>

            <span className="text-[10px] text-theme-textMuted">
              {new Date(task.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
            </span>
          </div>

          {/* Action Buttons: Backlog, Edit, Start/Pause, Done, Delete */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onUpdateTaskStatus(task.id, "backlog")}
              title={t("moveToBacklog")}
              className="text-xs px-2 py-1 rounded-lg bg-theme-elevated hover:bg-amber-500/20 text-theme-textMuted hover:text-amber-500 border border-theme-border hover:border-amber-500/30 transition-all flex items-center justify-center gap-1"
            >
              <i className="fa-solid fa-inbox text-[11px]"></i>
              <span className="hidden xl:inline text-[10px]">{t("moveToBacklog")}</span>
            </button>

            <button
              type="button"
              onClick={() => onEditTask(task)}
              title={t("editTaskBtn") || "تعديل المهمة"}
              className="text-xs px-2 py-1 rounded-lg bg-theme-elevated hover:bg-blue-500/20 text-theme-textMuted hover:text-blue-500 border border-theme-border hover:border-blue-500/30 transition-all flex items-center justify-center"
            >
              <i className="fa-solid fa-pen-to-square"></i>
            </button>

            <button
              type="button"
              onClick={() => onUpdateTaskStatus(task.id, task.status === "in_progress" ? "today" : "in_progress")}
              title={task.status === "in_progress" ? t("pauseBtn") : t("startBtn")}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all flex items-center gap-1 ${task.status === "in_progress"
                ? "bg-amber-500/20 text-amber-600 border-amber-500/40 animate-pulse font-bold"
                : "bg-theme-elevated hover:bg-theme-hover text-theme-textSecondary border-theme-border"
                }`}
            >
              <i className={`fa-solid ${task.status === "in_progress" ? "fa-pause" : "fa-play"}`}></i>
              <span>{task.status === "in_progress" ? t("inProgressBadge") : t("startBtn")}</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateTaskStatus(task.id, "done")}
              title={t("doneBtn")}
              className="text-xs px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-600 border border-emerald-500/40 font-bold transition-all flex items-center gap-1"
            >
              <i className="fa-solid fa-check"></i>
              <span>{t("doneBtn")}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm(lang === "ar" ? "هل تريد بالتأكيد حذف هذه المهمة نهائياً؟" : "Are you sure you want to delete this task?")) {
                  onDeleteTask(task.id);
                }
              }}
              title={t("deleteTask")}
              className="text-xs px-2 py-1 rounded-lg bg-theme-elevated hover:bg-rose-500/20 text-theme-textMuted hover:text-rose-500 border border-theme-border hover:border-rose-500/30 transition-all flex items-center justify-center"
            >
              <i className="fa-regular fa-trash-can"></i>
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

        {/* Backlog Quick Drawer Button */}
        <button
          type="button"
          onClick={() => setIsBacklogOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-theme-card hover:bg-theme-elevated border border-theme-border hover:border-amber-500/40 text-xs font-semibold text-theme-textSecondary hover:text-amber-500 transition-all flex items-center gap-2.5 shadow-xs cursor-pointer group"
          title={t("backlogDrawerTitle")}
        >
          <div className="w-5 h-5 rounded-md bg-amber-500/15 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-inbox text-[11px]"></i>
          </div>
          <span>{t("backlogDrawerTitle")}</span>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500">
            {focusData.backlogTasks?.length || 0}
          </span>
        </button>
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
              focusData.p1Urgent.map((task, idx) => renderTaskCard(task, idx, focusData.p1Urgent))
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
              focusData.p2Features.map((task, idx) => renderTaskCard(task, idx, focusData.p2Features))
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
              focusData.p3Tweaks.map((task, idx) => renderTaskCard(task, idx, focusData.p3Tweaks))
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

      <BacklogDrawer
        isOpen={isBacklogOpen}
        onClose={() => setIsBacklogOpen(false)}
        tasks={focusData.backlogTasks || []}
        onUpdateTaskStatus={onUpdateTaskStatus}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onPreviewImage={onPreviewImage}
      />
    </div>
  );
};
