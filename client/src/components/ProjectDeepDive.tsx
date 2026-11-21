import React, { useState } from "react";
import { Project, Task, Client } from "../types";
import { useI18n } from "../i18n";

interface ProjectDeepDiveProps {
  project: Project;
  tasks: Task[];
  clients: Client[];
  onUpdateTaskStatus: (taskId: number, status: string) => void;
  onOpenQuickAdd: (priority?: "P1" | "P2" | "P3", defaultProjectId?: number) => void;
  onDeleteTask: (taskId: number) => void;
}

export const ProjectDeepDive: React.FC<ProjectDeepDiveProps> = ({
  project,
  tasks,
  clients,
  onUpdateTaskStatus,
  onOpenQuickAdd,
  onDeleteTask
}) => {
  const { t } = useI18n();
  const [filterClientId, setFilterClientId] = useState<number | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

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
                      className="p-3 rounded-xl bg-theme-card border border-theme-border hover:border-blue-500/40 transition-all shadow-sm space-y-2 group"
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
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="text-theme-textMuted hover:text-rose-500 text-xs p-1"
                            title={t("deleteTask")}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>

                      <h4 className="text-xs font-semibold text-theme-text leading-snug">
                        {task.title}
                      </h4>

                      {task.client && (
                        <div className="text-[11px] text-theme-textMuted flex items-center gap-1">
                          <i className="fa-solid fa-user text-[9px]"></i>
                          <span>{task.client.name}</span>
                        </div>
                      )}

                      {/* Status Transition Select */}
                      <div className="pt-2 border-t border-theme-border flex items-center justify-between">
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
              {filteredTasks.map((tk) => (
                <tr key={tk.id} className="hover:bg-theme-hover/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-theme-text">{tk.title}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tk.priority === "P1" ? "bg-rose-500/20 text-rose-500" : tk.priority === "P2" ? "bg-amber-500/20 text-amber-600" : "bg-emerald-500/20 text-emerald-600"
                    }`}>
                      {tk.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-theme-textSecondary">{tk.type}</td>
                  <td className="py-3 px-4 text-theme-textSecondary">{tk.client?.name || "—"}</td>
                  <td className="py-3 px-4">
                    <select
                      value={tk.status}
                      onChange={(e) => onUpdateTaskStatus(tk.id, e.target.value)}
                      className="bg-theme-input border border-theme-border rounded px-2 py-1 text-xs text-theme-text"
                    >
                      <option value="backlog">{t("colBacklog")}</option>
                      <option value="today">{t("colToday")}</option>
                      <option value="in_progress">{t("colInProgress")}</option>
                      <option value="done">{t("colDone")}</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 font-mono text-theme-textMuted">{tk.estimatedMinutes || 30}{t("minAbbr")}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onDeleteTask(tk.id)}
                      className="text-theme-textMuted hover:text-rose-500 transition-colors p-1"
                      title={t("deleteTask")}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
