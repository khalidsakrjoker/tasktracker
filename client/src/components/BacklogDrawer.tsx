import React from "react";
import { Task } from "../types";
import { useI18n } from "../i18n";

interface BacklogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onUpdateTaskStatus: (taskId: number, status: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
  onPreviewImage: (imageUrl: string, title: string) => void;
}

export const BacklogDrawer: React.FC<BacklogDrawerProps> = ({
  isOpen,
  onClose,
  tasks,
  onUpdateTaskStatus,
  onEditTask,
  onDeleteTask,
  onPreviewImage
}) => {
  const { t, lang } = useI18n();

  if (!isOpen) return null;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "bug": return `🐞 ${t("typeBug")}`;
      case "feature": return `✨ ${t("typeFeature")}`;
      case "tweak": return `⚡ ${t("typeTweak")}`;
      default: return `📞 ${t("typeSupport")}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-theme-card border-x border-theme-border h-full flex flex-col justify-between shadow-2xl p-6 overflow-y-auto">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-theme-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 text-base">
                <i className="fa-solid fa-inbox"></i>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-theme-text">{t("backlogDrawerTitle")}</h2>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500">
                    {tasks.length}
                  </span>
                </div>
                <p className="text-xs text-theme-textMuted mt-0.5">
                  {t("backlogDrawerSubtitle")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-theme-elevated hover:bg-theme-hover border border-theme-border flex items-center justify-center text-theme-textMuted hover:text-theme-text transition"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>

          {/* Tasks List */}
          {tasks.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-theme-elevated border border-theme-border flex items-center justify-center text-theme-textMuted text-2xl">
                <i className="fa-solid fa-box-open"></i>
              </div>
              <p className="text-sm font-medium text-theme-textSecondary">{t("backlogEmpty")}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-160px)] overflow-y-auto pr-1">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl bg-theme-elevated/70 border border-theme-border hover:border-amber-500/40 transition-all shadow-xs space-y-3"
                >
                  {/* Top Bar: Project + Priority + Type */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-md text-white shadow-xs"
                        style={{ backgroundColor: task.project?.color || "#3B82F6" }}
                      >
                        {task.project?.name}
                      </span>
                      <span className="text-[10px] text-theme-textSecondary bg-theme-card px-1.5 py-0.5 rounded border border-theme-border">
                        {getTypeLabel(task.type)}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          task.priority === "P1"
                            ? "bg-rose-500/20 text-rose-500 border border-rose-500/30"
                            : task.priority === "P2"
                            ? "bg-amber-500/20 text-amber-600 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <div className="text-[11px] text-theme-textMuted font-medium flex items-center gap-1">
                      <i className="fa-regular fa-clock"></i>
                      <span>{task.estimatedMinutes || 30}{t("minAbbr")}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-theme-text leading-snug">
                    {task.title}
                  </h3>

                  {/* Details */}
                  {task.details && (
                    <p className="text-xs text-theme-textSecondary line-clamp-2 bg-theme-card p-2 rounded-lg border border-theme-borderSubtle">
                      {task.details}
                    </p>
                  )}

                  {/* Image Thumbnail */}
                  {task.imageUrl && (
                    <div className="rounded-lg overflow-hidden border border-theme-borderSubtle">
                      <img
                        src={task.imageUrl}
                        alt={task.title}
                        onClick={() => onPreviewImage(task.imageUrl!, task.title)}
                        className="w-full h-24 object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Client */}
                  {task.client && (
                    <div className="flex items-center gap-2 text-xs text-theme-textSecondary bg-theme-card px-2 py-1 rounded border border-theme-borderSubtle">
                      <i className="fa-solid fa-user-tie text-[10px] text-theme-textMuted"></i>
                      <span className="font-medium">{task.client.name}</span>
                      {task.client.phone && (
                        <span className="text-[10px] text-theme-textMuted font-mono" dir="ltr">
                          {task.client.phone}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-theme-border">
                    <span className="text-[10px] text-theme-textMuted">
                      {new Date(task.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Move to Today Focus */}
                      <button
                        type="button"
                        onClick={() => onUpdateTaskStatus(task.id, "today")}
                        title={t("moveToToday")}
                        className="text-xs px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-500 border border-blue-500/40 font-bold transition-all flex items-center gap-1"
                      >
                        <i className="fa-solid fa-bolt-lightning text-[10px]"></i>
                        <span>{t("moveToToday")}</span>
                      </button>

                      {/* Start working immediately */}
                      <button
                        type="button"
                        onClick={() => onUpdateTaskStatus(task.id, "in_progress")}
                        title={t("startBtn")}
                        className="text-xs px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 border border-amber-500/40 font-semibold transition-all flex items-center gap-1"
                      >
                        <i className="fa-solid fa-play text-[10px]"></i>
                        <span className="hidden sm:inline">{t("startBtn")}</span>
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => onEditTask(task)}
                        title={t("editTaskBtn")}
                        className="text-xs px-2 py-1 rounded-lg bg-theme-card hover:bg-blue-500/20 text-theme-textMuted hover:text-blue-500 border border-theme-border hover:border-blue-500/30 transition-all flex items-center justify-center"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(lang === "ar" ? "هل تريد بالتأكيد حذف هذه المهمة نهائياً؟" : "Are you sure you want to delete this task?")) {
                            onDeleteTask(task.id);
                          }
                        }}
                        title={t("deleteTask")}
                        className="text-xs px-2 py-1 rounded-lg bg-theme-card hover:bg-rose-500/20 text-theme-textMuted hover:text-rose-500 border border-theme-border hover:border-rose-500/30 transition-all flex items-center justify-center"
                      >
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
