import React, { useState } from "react";
import { Project, Task, Client } from "../types";
import { useI18n } from "../i18n";
import { parseImageUrls } from "../utils/imageCompressor";
import { TaskAudioPlayer } from "./TaskAudioPlayer";

interface ProjectDeepDiveProps {
  project: Project;
  tasks: Task[];
  clients: Client[];
  onUpdateTaskStatus: (taskId: number, status: string) => void;
  onOpenQuickAdd: (priority?: "P1" | "P2" | "P3", defaultProjectId?: number) => void;
  onDeleteTask: (taskId: number) => void;
  onEditTask?: (task: Task) => void;
  onPreviewImage?: (images: string[] | string, indexOrTitle?: number | string, title?: string) => void;
}

export const ProjectDeepDive: React.FC<ProjectDeepDiveProps> = ({
  project,
  tasks,
  clients,
  onUpdateTaskStatus,
  onOpenQuickAdd,
  onDeleteTask,
  onEditTask,
  onPreviewImage
}) => {
  const { t, lang } = useI18n();
  const [filterClientId, setFilterClientId] = useState<number | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "bug": return `🐞 ${t("typeBug")}`;
      case "feature": return `✨ ${t("typeFeature")}`;
      case "tweak": return `⚡ ${t("typeTweak")}`;
      default: return `📞 ${t("typeSupport")}`;
    }
  };

  const projectTasks = tasks.filter((t) => t.projectId === project.id);

  const filteredTasks = projectTasks.filter((t) => {
    if (filterClientId && t.clientId !== filterClientId) return false;
    if (filterPriority !== "ALL" && t.priority !== filterPriority) return false;
    return true;
  });

  const columns = [
    { id: "backlog", title: t("colBacklog"), icon: "fa-inbox", color: "border-slate-500 text-slate-500" },
    { id: "today", title: t("colToday"), icon: "fa-calendar-day", color: "border-blue-500 text-blue-500" },
    { id: "in_progress", title: t("colInProgress"), icon: "fa-spinner", color: "border-amber-500 text-amber-500" },
    { id: "done", title: t("colDone"), icon: "fa-circle-check", color: "border-emerald-500 text-emerald-500" }
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Project Header Banner */}
      <div className="p-6 rounded-2xl bg-theme-card border border-theme-border shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-500/10 shrink-0"
            style={{ backgroundColor: project.color }}
          >
            <i className={`fa-solid fa-${project.icon || "folder"}`}></i>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-theme-text">{project.name}</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-theme-elevated border border-theme-border text-theme-textSecondary uppercase font-bold">
                {project.code}
              </span>
            </div>
            <p className="text-xs text-theme-textMuted mt-1 max-w-xl">
              {project.description || t("defaultProjectDesc")}
            </p>
          </div>
        </div>

        {/* Project Quick Counters */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-theme-elevated border border-theme-border text-center">
            <span className="block text-lg font-bold text-theme-text">{project.openTasks}</span>
            <span className="text-[10px] text-theme-textMuted">{t("openTasksCount")}</span>
          </div>

          <div className="px-4 py-2 rounded-xl bg-theme-elevated border border-theme-border text-center">
            <span className="block text-lg font-bold text-rose-500">{project.urgentTasks}</span>
            <span className="text-[10px] text-theme-textMuted">{t("urgentTasksCount")}</span>
          </div>

          <div className="px-4 py-2 rounded-xl bg-theme-elevated border border-theme-border text-center">
            <span className="block text-lg font-bold text-emerald-500">{project.completedTasks}</span>
            <span className="text-[10px] text-theme-textMuted">{t("completedTasksCount")}</span>
          </div>

          <button
            onClick={() => onOpenQuickAdd("P2", project.id)}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <i className="fa-solid fa-plus"></i>
            <span>{t("addTaskToProject")}</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-theme-card border border-theme-border shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Client Filter */}
          <select
            value={filterClientId || ""}
            onChange={(e) => setFilterClientId(e.target.value ? parseInt(e.target.value, 10) : null)}
            className="bg-theme-input border border-theme-border text-xs rounded-lg px-3 py-1.5 text-theme-text focus:outline-none focus:border-blue-500"
          >
            <option value="">{t("allClientsFilter")} ({clients.length})</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <div className="flex items-center gap-1 bg-theme-elevated p-1 rounded-lg border border-theme-border">
            {["ALL", "P1", "P2", "P3"].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                  filterPriority === p
                    ? "bg-blue-600 text-white font-bold"
                    : "text-theme-textMuted hover:text-theme-text"
                }`}
              >
                {p === "ALL" ? t("filterAll") : p}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-theme-elevated p-1 rounded-lg border border-theme-border">
          <button
            onClick={() => setViewMode("kanban")}
            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "kanban" ? "bg-theme-card text-blue-600 shadow-sm font-bold" : "text-theme-textMuted hover:text-theme-text"
            }`}
          >
            <i className="fa-solid fa-columns"></i>
            <span>{t("kanbanView")}</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "table" ? "bg-theme-card text-blue-600 shadow-sm font-bold" : "text-theme-textMuted hover:text-theme-text"
            }`}
          >
            <i className="fa-solid fa-table-list"></i>
            <span>{t("tableView")}</span>
          </button>
        </div>
      </div>

      {/* Content: Kanban Board or Table */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="space-y-3">
                <div className={`flex items-center justify-between pb-2 border-b-2 ${col.color}`}>
                  <div className="flex items-center gap-2">
                    <i className={`fa-solid ${col.icon} text-xs`}></i>
                    <h3 className="text-xs font-bold">{col.title}</h3>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-theme-elevated text-theme-textSecondary font-bold border border-theme-border">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 min-h-[350px]">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onEditTask && onEditTask(task)}
                      className="p-3 rounded-xl bg-theme-card border border-theme-border hover:border-blue-500/40 transition-all shadow-sm space-y-2 group cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            task.priority === "P1"
                              ? "bg-rose-500/20 text-rose-500 border border-rose-500/30 font-extrabold"
                              : task.priority === "P2"
                              ? "bg-amber-500/20 text-amber-600 border border-amber-500/30 font-extrabold"
                              : "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 font-extrabold"
                          }`}
                        >
                          {task.priority}
                        </span>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onEditTask && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditTask(task);
                              }}
                              className="text-theme-textMuted hover:text-blue-500 text-xs p-1"
                              title={t("editTaskBtn") || "تعديل المهمة"}
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(lang === "ar" ? "هل تريد بالتأكيد حذف هذه المهمة نهائياً؟" : "Are you sure you want to delete this task?")) {
                                onDeleteTask(task.id);
                              }
                            }}
                            className="text-theme-textMuted hover:text-rose-500 text-xs p-1"
                            title={t("deleteTask")}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>

                      <h4 className="text-xs font-semibold text-theme-text leading-snug group-hover:text-blue-500 transition-colors">
                        {task.title}
                      </h4>

                      {/* Details / Notes snippet */}
                      {task.details && (
                        <p className="text-[11px] text-theme-textSecondary/80 line-clamp-2 leading-relaxed">
                          {task.details}
                        </p>
                      )}

                      {/* Voice Note Audio Player */}
                      {task.audioUrl && (
                        <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                          <TaskAudioPlayer audioUrl={task.audioUrl} variant="compact" />
                        </div>
                      )}

                      {/* Image Thumbnail(s) */}
                      {onPreviewImage && (() => {
                        const images = parseImageUrls(task.imageUrl);
                        if (images.length === 1) {
                          return (
                            <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => onPreviewImage(images, 0, task.title)}
                                className="relative w-14 h-9 rounded-md overflow-hidden border border-theme-borderSubtle hover:border-blue-500 transition cursor-zoom-in bg-black/20"
                                title={t("clickToEnlarge")}
                              >
                                <img
                                  src={images[0]}
                                  alt={task.title}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </button>
                            </div>
                          );
                        }
                        if (images.length > 1) {
                          return (
                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              {images.slice(0, 2).map((img, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => onPreviewImage(images, idx, task.title)}
                                  className="relative w-12 h-9 rounded-md overflow-hidden border border-theme-borderSubtle hover:border-blue-500 transition cursor-zoom-in bg-black/20"
                                  title={t("clickToEnlarge")}
                                >
                                  <img
                                    src={img}
                                    alt={`Thumb ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => onPreviewImage(images, 0, task.title)}
                                className="px-1.5 py-1 rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold flex items-center gap-1"
                                title={t("clickToEnlarge")}
                              >
                                <i className="fa-regular fa-images text-[9px]"></i>
                                <span>{images.length}</span>
                              </button>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {task.client && (
                        <div className="text-[11px] text-theme-textMuted flex items-center gap-1">
                          <i className="fa-solid fa-user text-[9px]"></i>
                          <span>{task.client.name}</span>
                        </div>
                      )}

                      {/* Status Transition Select */}
                      <div className="pt-2 border-t border-theme-border flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={task.status}
                          onChange={(e) => onUpdateTaskStatus(task.id, e.target.value)}
                          className="bg-theme-input border border-theme-border text-[10px] text-theme-text rounded px-2 py-0.5 focus:outline-none"
                        >
                          <option value="backlog">{t("colBacklog")}</option>
                          <option value="today">{t("colToday")}</option>
                          <option value="in_progress">{t("colInProgress")}</option>
                          <option value="done">{t("colDone")}</option>
                        </select>

                        <span className="text-[10px] text-theme-textMuted font-mono">
                          {task.estimatedMinutes || 30}{t("minAbbr")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* High-Density Table */
        <div className="rounded-xl overflow-hidden border border-theme-border bg-theme-card shadow-sm">
          <table className="w-full text-start text-xs">
            <thead className="bg-theme-elevated text-theme-textMuted uppercase font-semibold border-b border-theme-border">
              <tr>
                <th className="py-3 px-4">{t("thTask")}</th>
                <th className="py-3 px-4">{t("thPriority")}</th>
                <th className="py-3 px-4">{t("thType")}</th>
                <th className="py-3 px-4">{t("thClient")}</th>
                <th className="py-3 px-4">{t("thStatus")}</th>
                <th className="py-3 px-4">{t("thTime")}</th>
                <th className="py-3 px-4 text-center">{t("thActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-borderSubtle">
              {filteredTasks.map((tk) => {
                const images = parseImageUrls(tk.imageUrl);
                return (
                  <tr
                    key={tk.id}
                    onClick={() => onEditTask && onEditTask(tk)}
                    className="hover:bg-blue-500/10 transition-colors cursor-pointer group"
                    title={lang === "ar" ? "اضغط لعرض وتعديل تفاصيل المهمة وملاحظاتها وصورها" : "Click to view task details, notes, and images"}
                  >
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-theme-text group-hover:text-blue-500 transition-colors">
                          {tk.title}
                        </span>
                        {(tk.details || images.length > 0 || tk.audioUrl) && (
                          <div className="flex items-center gap-2 mt-1">
                            {tk.details && (
                              <span className="text-[11px] text-theme-textMuted line-clamp-1 flex items-center gap-1">
                                <i className="fa-regular fa-note-sticky text-[10px] text-amber-500/80"></i>
                                <span>{tk.details}</span>
                              </span>
                            )}
                            {images.length > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onPreviewImage && onPreviewImage(images, 0, tk.title);
                                }}
                                className="px-1.5 py-0.5 rounded bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 text-[10px] font-mono font-bold flex items-center gap-1 border border-blue-500/30 transition shrink-0"
                                title={t("clickToEnlarge")}
                              >
                                <i className="fa-regular fa-images text-[9px]"></i>
                                <span>{images.length}</span>
                              </button>
                            )}
                            {tk.audioUrl && (
                              <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                <TaskAudioPlayer audioUrl={tk.audioUrl} variant="compact" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tk.priority === "P1" ? "bg-rose-500/20 text-rose-500" : tk.priority === "P2" ? "bg-amber-500/20 text-amber-600" : "bg-emerald-500/20 text-emerald-600"
                      }`}>
                        {tk.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-theme-textSecondary">{getTypeLabel(tk.type)}</td>
                    <td className="py-3 px-4 text-theme-textSecondary">{tk.client?.name || "—"}</td>
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={tk.status}
                        onChange={(e) => onUpdateTaskStatus(tk.id, e.target.value)}
                        className="bg-theme-input border border-theme-border rounded px-2 py-1 text-xs text-theme-text focus:outline-none"
                      >
                        <option value="backlog">{t("colBacklog")}</option>
                        <option value="today">{t("colToday")}</option>
                        <option value="in_progress">{t("colInProgress")}</option>
                        <option value="done">{t("colDone")}</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 font-mono text-theme-textMuted">{tk.estimatedMinutes || 30}{t("minAbbr")}</td>
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        {onEditTask && (
                          <button
                            type="button"
                            onClick={() => onEditTask(tk)}
                            className="w-7 h-7 rounded-lg bg-theme-elevated hover:bg-blue-500/15 text-theme-textMuted hover:text-blue-500 border border-theme-border flex items-center justify-center transition text-xs"
                            title={t("editTaskBtn")}
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(lang === "ar" ? "هل تريد بالتأكيد حذف هذه المهمة نهائياً؟" : "Are you sure you want to delete this task?")) {
                              onDeleteTask(tk.id);
                            }
                          }}
                          className="w-7 h-7 rounded-lg bg-theme-elevated hover:bg-rose-500/20 text-theme-textMuted hover:text-rose-500 border border-theme-border flex items-center justify-center transition text-xs"
                          title={t("deleteTask")}
                        >
                          <i className="fa-regular fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
