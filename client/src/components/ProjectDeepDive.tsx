import React, { useState } from "react";
import { Project, Task, Client } from "../types";

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
    { id: "backlog", title: "صندوق المهام (Backlog)", icon: "fa-inbox", color: "border-slate-600 text-slate-300" },
    { id: "today", title: "مجدول لليوم (Today)", icon: "fa-calendar-day", color: "border-blue-500 text-blue-400" },
    { id: "in_progress", title: "قيد العمل (In Progress)", icon: "fa-spinner", color: "border-amber-500 text-amber-400" },
    { id: "done", title: "مكتمل (Done)", icon: "fa-circle-check", color: "border-emerald-500 text-emerald-400" }
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Project Header Banner */}
      <div className="p-6 rounded-2xl glass-panel relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-500/10"
            style={{ backgroundColor: project.color }}
          >
            <i className={`fa-solid fa-${project.icon || "folder"}`}></i>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{project.name}</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-obsidian-800 border border-obsidian-700 text-slate-300">
                {project.code}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {project.description || "مشروع نشط في نظام TaskTracker"}
            </p>
          </div>
        </div>

        {/* Project Quick Counters */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-obsidian-900 border border-obsidian-700 text-center">
            <span className="block text-lg font-bold text-white">{project.openTasks}</span>
            <span className="text-[10px] text-slate-400">مهام متبقية</span>
          </div>

          <div className="px-4 py-2 rounded-xl bg-obsidian-900 border border-obsidian-700 text-center">
            <span className="block text-lg font-bold text-rose-400">{project.urgentTasks}</span>
            <span className="text-[10px] text-slate-400">طوارئ P1</span>
          </div>

          <div className="px-4 py-2 rounded-xl bg-obsidian-900 border border-obsidian-700 text-center">
            <span className="block text-lg font-bold text-emerald-400">{project.completedTasks}</span>
            <span className="text-[10px] text-slate-400">مكتمل</span>
          </div>

          <button
            onClick={() => onOpenQuickAdd("P2", project.id)}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            <i className="fa-solid fa-plus ml-1.5"></i>
            <span>إضافة مهمة</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-obsidian-950 border border-obsidian-700">
        <div className="flex flex-wrap items-center gap-2">
          {/* Client Filter */}
          <select
            value={filterClientId || ""}
            onChange={(e) => setFilterClientId(e.target.value ? parseInt(e.target.value, 10) : null)}
            className="bg-obsidian-850 border border-obsidian-700 text-xs rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none"
          >
            <option value="">جميع العملاء ({clients.length})</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <div className="flex items-center gap-1 bg-obsidian-850 p-1 rounded-lg border border-obsidian-700">
            {["ALL", "P1", "P2", "P3"].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                  filterPriority === p
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {p === "ALL" ? "الكل" : p}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-obsidian-850 p-1 rounded-lg border border-obsidian-700">
          <button
            onClick={() => setViewMode("kanban")}
            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "kanban" ? "bg-obsidian-700 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <i className="fa-solid fa-columns"></i>
            <span>كانبان</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "table" ? "bg-obsidian-700 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <i className="fa-solid fa-table-list"></i>
            <span>جدول مكثف</span>
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
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-obsidian-850 text-slate-300 font-bold">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 min-h-[350px]">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl bg-obsidian-850 border border-obsidian-700 hover:border-obsidian-600 transition-all shadow-sm space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            task.priority === "P1"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : task.priority === "P2"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {task.priority}
                        </span>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="text-slate-500 hover:text-rose-400 text-xs p-1"
                            title="حذف المهمة"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>

                      <h4 className="text-xs font-semibold text-slate-100 leading-snug">
                        {task.title}
                      </h4>

                      {task.client && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <i className="fa-solid fa-user text-[9px]"></i>
                          <span>{task.client.name}</span>
                        </div>
                      )}

                      {/* Status Transition Select */}
                      <div className="pt-2 border-t border-obsidian-800 flex items-center justify-between">
                        <select
                          value={task.status}
                          onChange={(e) => onUpdateTaskStatus(task.id, e.target.value)}
                          className="bg-obsidian-900 border border-obsidian-750 text-[10px] text-slate-300 rounded px-2 py-0.5 focus:outline-none"
                        >
                          <option value="backlog">Backlog</option>
                          <option value="today">Today</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>

                        <span className="text-[10px] text-slate-500 font-mono">
                          {task.estimatedMinutes || 30}m
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
        <div className="rounded-xl overflow-hidden border border-obsidian-700 bg-obsidian-900">
          <table className="w-full text-right text-xs">
            <thead className="bg-obsidian-850 text-slate-400 uppercase font-semibold border-b border-obsidian-700">
              <tr>
                <th className="py-3 px-4">المهمة</th>
                <th className="py-3 px-4">الأولوية</th>
                <th className="py-3 px-4">النوع</th>
                <th className="py-3 px-4">العميل</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">الوقت</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-800">
              {filteredTasks.map((t) => (
                <tr key={t.id} className="hover:bg-obsidian-850/60 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-100">{t.title}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.priority === "P1" ? "bg-rose-500/20 text-rose-400" : t.priority === "P2" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{t.type}</td>
                  <td className="py-3 px-4 text-slate-300">{t.client?.name || "—"}</td>
                  <td className="py-3 px-4">
                    <select
                      value={t.status}
                      onChange={(e) => onUpdateTaskStatus(t.id, e.target.value)}
                      className="bg-obsidian-800 border border-obsidian-700 rounded px-2 py-1 text-xs text-slate-200"
                    >
                      <option value="backlog">Backlog</option>
                      <option value="today">Today</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{t.estimatedMinutes || 30} د</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onDeleteTask(t.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors"
                      title="حذف"
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
