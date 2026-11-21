import React from "react";
import { Project } from "../types";
import { useI18n } from "../i18n";

interface SidebarProps {
  activeView: "focus" | "project" | "clients";
  selectedProjectId: number | null;
  onSelectView: (view: "focus" | "project" | "clients", projectId?: number) => void;
  projects: Project[];
  onOpenNewProject: () => void;
  onOpenInstallModal?: () => void;
  isAppInstalled?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  selectedProjectId,
  onSelectView,
  projects,
  onOpenNewProject,
  onOpenInstallModal,
  isAppInstalled
}) => {
  const { t } = useI18n();

  return (
    <aside className="w-64 border-e border-theme-border bg-theme-card flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0 transition-colors">
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <i className="fa-solid fa-bolt-lightning text-sm"></i>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-theme-text flex items-center gap-1.5">
              <span>{t("appTitle")}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h1>
            <p className="text-[11px] text-theme-textMuted">{t("appSubtitle")}</p>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-bold text-theme-textMuted px-3 pb-1 tracking-wider">
            {t("focusView") === "Today Focus Matrix" ? "MAIN WORKSPACES" : "المساحات الرئيسية"}
          </div>

          <button
            onClick={() => onSelectView("focus")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeView === "focus"
                ? "bg-blue-600/15 text-blue-600 border border-blue-500/30 font-bold"
                : "text-theme-textSecondary hover:bg-theme-hover hover:text-theme-text"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <i className="fa-solid fa-bullseye text-sm"></i>
              <span>{t("focusView")}</span>
            </div>
            <span className="text-[10px] bg-theme-elevated px-1.5 py-0.5 rounded text-theme-textMuted">
              Focus
            </span>
          </button>

          <button
            onClick={() => onSelectView("clients")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeView === "clients"
                ? "bg-blue-600/15 text-blue-600 border border-blue-500/30 font-bold"
                : "text-theme-textSecondary hover:bg-theme-hover hover:text-theme-text"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <i className="fa-solid fa-address-book text-sm"></i>
              <span>{t("clientsView")}</span>
            </div>
          </button>
        </div>

        {/* Projects List */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between px-3 pb-1">
            <span className="text-[10px] uppercase font-bold text-theme-textMuted tracking-wider">
              {t("activeProjects")}
            </span>
            <button
              onClick={onOpenNewProject}
              title={t("addProject")}
              className="text-theme-textMuted hover:text-blue-600 transition-colors text-xs p-1"
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
                      ? "bg-theme-elevated text-theme-text border border-theme-border font-bold shadow-sm"
                      : "text-theme-textSecondary hover:bg-theme-hover hover:text-theme-text"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: p.color }}
                    ></span>
                    <span className="truncate">{p.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {p.urgentTasks > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-500 font-bold">
                        {p.urgentTasks}
                      </span>
                    )}
                    <span className="text-[10px] text-theme-textMuted">
                      {p.openTasks}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Install App Quick Action (if not installed) */}
        {!isAppInstalled && onOpenInstallModal && (
          <div className="pt-2">
            <button
              onClick={onOpenInstallModal}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 hover:from-blue-600/20 hover:to-indigo-600/20 border border-blue-500/30 text-blue-600 text-xs font-bold flex items-center justify-between transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-cloud-arrow-down text-sm text-blue-600 group-hover:scale-110 transition-transform"></i>
                <span>{t("installAppBtn")}</span>
              </div>
              <i className="fa-solid fa-arrow-right text-[10px] rtl:rotate-180"></i>
            </button>
          </div>
        )}
      </div>

      {/* Open Source Signature Footer */}
      <div className="p-3 border-t border-theme-border bg-theme-elevated/70">
        <a
          href="https://github.com/khalidsakrjoker/tasktracker"
          target="_blank"
          rel="noopener noreferrer"
          className="group block p-2 rounded-xl border border-transparent hover:border-theme-border hover:bg-theme-card transition-all"
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-theme-text font-bold group-hover:text-blue-600 transition-colors truncate">
              <i className="fa-brands fa-github text-sm shrink-0"></i>
              <span className="text-[11px] font-mono tracking-tight truncate">khalidsakrjoker/tasktracker</span>
            </div>
            <i className="fa-solid fa-arrow-up-right-from-square text-[10px] text-theme-textMuted group-hover:text-blue-600 transition-colors shrink-0"></i>
          </div>
          <div className="text-[10px] text-theme-textMuted mt-1.5 flex items-center justify-between">
            <span>{t("openSourceSignature")}</span>
            <span className="font-mono">{t("licenseText")}</span>
          </div>
        </a>
      </div>
    </aside>
  );
};
