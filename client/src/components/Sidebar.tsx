import React from "react";
import { Project } from "../types";

interface SidebarProps {
  activeView: "focus" | "project" | "clients";
  selectedProjectId: number | null;
  onSelectView: (view: "focus" | "project" | "clients", projectId?: number) => void;
  projects: Project[];
  onOpenNewProject: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  selectedProjectId,
  onSelectView,
  projects,
  onOpenNewProject
}) => {
  return (
    <aside className="w-64 border-l border-obsidian-700 bg-obsidian-950 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0">
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <i className="fa-solid fa-bolt-lightning text-sm"></i>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>TaskTracker</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </h1>
            <p className="text-[11px] text-slate-400">مركز إدارة المشروعات</p>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-300 px-3 pb-1 tracking-wider">
            المساحات الرئيسية
          </div>

          <button
            onClick={() => onSelectView("focus")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeView === "focus"
                ? "bg-blue-600/15 text-cyber-blue border border-blue-500/30"
                : "text-slate-300 hover:bg-obsidian-850 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <i className="fa-solid fa-bullseye text-sm"></i>
              <span>لوحة التركيز اليومي</span>
            </div>
            <span className="text-[10px] bg-obsidian-800 px-1.5 py-0.5 rounded text-slate-300">
              Focus
            </span>
          </button>

          <button
            onClick={() => onSelectView("clients")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeView === "clients"
                ? "bg-blue-600/15 text-cyber-blue border border-blue-500/30"
                : "text-slate-300 hover:bg-obsidian-850 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <i className="fa-solid fa-address-book text-sm"></i>
              <span>دليل العملاء والطلبات</span>
            </div>
          </button>
        </div>

        {/* Projects List */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between px-3 pb-1">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
              المشروعات النشطة
            </span>
            <button
              onClick={onOpenNewProject}
              title="إضافة مشروع جديد"
              className="text-slate-300 hover:text-cyber-blue transition-colors text-xs"
            >
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>

          <div className="space-y-1">
            {projects.map((p) => {
              const isSelected = activeView === "project" && selectedProjectId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectView("project", p.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-obsidian-800 text-white border border-obsidian-600 shadow-sm"
                      : "text-slate-300 hover:bg-obsidian-850 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: p.color }}
                    ></span>
                    <span className="truncate">{p.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {p.urgentTasks > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 font-bold">
                        {p.urgentTasks}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-300">
                      {p.openTasks}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* System Footer Info */}
      <div className="p-4 border-t border-obsidian-700/80 bg-obsidian-950/60">
        <div className="flex items-center justify-between text-[11px] text-slate-300">
          <span className="flex items-center gap-1.5">
            <i className="fa-solid fa-shield-halved text-emerald-400"></i>
            <span>حماية IP + PIN</span>
          </span>
          <span className="text-slate-300 font-mono">SQLite WAL</span>
        </div>
      </div>
    </aside>
  );
};
