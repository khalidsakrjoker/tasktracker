import React, { useState, useRef, useEffect } from "react";
import { Project, Client } from "../types";
import { useI18n } from "../i18n";

interface TodayFilterBarProps {
  projects: Project[];
  clients: Client[];
  selectedProjectId: number | "all";
  onSelectProject: (id: number | "all") => void;
  selectedClientId: number | "all";
  onSelectClient: (id: number | "all") => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onClearFilters: () => void;
  totalTasks: number;
  filteredTasks: number;
  tasksByProject: Record<number, number>;
  tasksByClient: Record<number, number>;
}

export const TodayFilterBar: React.FC<TodayFilterBarProps> = ({
  projects,
  clients,
  selectedProjectId,
  onSelectProject,
  selectedClientId,
  onSelectClient,
  searchQuery,
  onSearchChange,
  onClearFilters,
  totalTasks,
  filteredTasks,
  tasksByProject,
  tasksByClient
}) => {
  const { t, lang } = useI18n();

  // Project Dropdown State
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const projectRef = useRef<HTMLDivElement>(null);
  const projectSearchInputRef = useRef<HTMLInputElement>(null);

  // Client Dropdown State
  const [isClientOpen, setIsClientOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const clientRef = useRef<HTMLDivElement>(null);
  const clientSearchInputRef = useRef<HTMLInputElement>(null);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (projectRef.current && !projectRef.current.contains(e.target as Node)) {
        setIsProjectOpen(false);
      }
      if (clientRef.current && !clientRef.current.contains(e.target as Node)) {
        setIsClientOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isProjectOpen && projectSearchInputRef.current) {
      projectSearchInputRef.current.focus();
    }
  }, [isProjectOpen]);

  useEffect(() => {
    if (isClientOpen && clientSearchInputRef.current) {
      clientSearchInputRef.current.focus();
    }
  }, [isClientOpen]);

  const hasActiveFilters =
    selectedProjectId !== "all" ||
    selectedClientId !== "all" ||
    searchQuery.trim().length > 0;

  const currentProject =
    selectedProjectId === "all"
      ? null
      : projects.find((p) => p.id === selectedProjectId);

  const currentClient =
    selectedClientId === "all"
      ? null
      : clients.find((c) => c.id === selectedClientId);

  // Filter projects by search
  const filteredProjectsList = projects.filter((p) => {
    const q = projectSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q)
    );
  });

  // Filter clients by search
  const filteredClientsList = clients.filter((c) => {
    const q = clientSearch.toLowerCase().trim();
    if (!q) return true;
    const matchName = c.name.toLowerCase().includes(q);
    const matchPhone = c.phone ? c.phone.includes(q) : false;
    const matchCompany = c.company ? c.company.toLowerCase().includes(q) : false;
    return matchName || matchPhone || matchCompany;
  });

  // Projects that have active tasks today (for quick chips)
  const activeProjectsForChips = projects.filter(
    (p) => (tasksByProject[p.id] || 0) > 0
  );

  return (
    <div className="bg-theme-card/80 border border-theme-border rounded-2xl p-3 sm:p-4 space-y-3 shadow-xs">
      {/* Top Filter Controls: Search + Searchable Project Select + Searchable Client Select */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Realtime Search Input */}
        <div className="relative flex-1 min-w-0">
          <i className="fa-solid fa-magnifying-glass absolute start-3.5 top-1/2 -translate-y-1/2 text-xs text-theme-textMuted pointer-events-none"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("searchTasksPlaceholder")}
            className="w-full bg-theme-input border border-theme-border rounded-xl ps-9 pe-9 py-2 text-xs text-theme-text placeholder-theme-textMuted focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md hover:bg-theme-hover text-theme-textMuted hover:text-theme-text flex items-center justify-center transition"
            >
              <i className="fa-solid fa-xmark text-xs"></i>
            </button>
          )}
        </div>

        {/* Searchable Project Combobox Dropdown */}
        <div ref={projectRef} className="relative w-full sm:w-auto sm:min-w-[190px]">
          <button
            type="button"
            onClick={() => {
              setIsProjectOpen(!isProjectOpen);
              setIsClientOpen(false);
            }}
            className={`w-full py-2 px-3 rounded-xl border text-xs flex items-center justify-between gap-2 transition shadow-xs cursor-pointer ${
              selectedProjectId !== "all"
                ? "bg-blue-600/10 border-blue-500 text-blue-500 font-bold"
                : "bg-theme-input border-theme-border text-theme-textSecondary hover:border-blue-500/50"
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              {currentProject ? (
                <>
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: currentProject.color }}
                  ></span>
                  <span className="truncate">{currentProject.name}</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-folder-tree text-blue-500 text-xs shrink-0"></i>
                  <span>{t("filterAllProjects")}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {selectedProjectId !== "all" && (
                <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-mono font-bold">
                  {tasksByProject[selectedProjectId as number] || 0}
                </span>
              )}
              <i className={`fa-solid fa-chevron-${isProjectOpen ? "up" : "down"} text-[10px] text-theme-textMuted`}></i>
            </div>
          </button>

          {/* Project Searchable Popover Menu */}
          {isProjectOpen && (
            <div className="absolute z-40 top-full mt-1.5 w-72 max-w-[90vw] end-0 sm:start-0 bg-theme-card border border-theme-border rounded-xl shadow-2xl p-2 space-y-1.5 animate-scale-up">
              {/* Search input inside project popover */}
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute start-2.5 top-1/2 -translate-y-1/2 text-[10px] text-theme-textMuted"></i>
                <input
                  ref={projectSearchInputRef}
                  type="text"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder={lang === "ar" ? "ابحث باسم أو كود المشروع..." : "Search project..."}
                  className="w-full bg-theme-input border border-theme-border rounded-lg ps-7 pe-2 py-1.5 text-xs text-theme-text focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* All Projects Option */}
              <div className="max-h-56 overflow-y-auto space-y-0.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onSelectProject("all");
                    setIsProjectOpen(false);
                    setProjectSearch("");
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                    selectedProjectId === "all"
                      ? "bg-blue-600/15 text-blue-500 font-bold"
                      : "text-theme-textSecondary hover:bg-theme-hover hover:text-theme-text"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-layer-group text-xs text-blue-500"></i>
                    <span>{t("filterAllProjects")}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-theme-elevated text-theme-textMuted">
                    {totalTasks}
                  </span>
                </button>

                {/* Project List */}
                {filteredProjectsList.map((p) => {
                  const count = tasksByProject[p.id] || 0;
                  const isSelected = selectedProjectId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        onSelectProject(p.id);
                        setIsProjectOpen(false);
                        setProjectSearch("");
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                        isSelected
                          ? "bg-blue-600/15 text-blue-500 font-bold"
                          : "text-theme-textSecondary hover:bg-theme-hover hover:text-theme-text"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: p.color }}
                        ></span>
                        <span className="truncate">{p.name}</span>
                        <span className="text-[9px] font-mono uppercase text-theme-textMuted bg-theme-elevated px-1 rounded">
                          {p.code}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${count > 0 ? "bg-blue-500/10 text-blue-400 font-bold" : "text-theme-textMuted opacity-60"}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}

                {filteredProjectsList.length === 0 && (
                  <p className="text-center py-3 text-[11px] text-theme-textMuted">
                    {lang === "ar" ? "لا توجد مشروعات مطابقة" : "No projects found"}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Searchable Client Combobox Dropdown */}
        <div ref={clientRef} className="relative w-full sm:w-auto sm:min-w-[190px]">
          <button
            type="button"
            onClick={() => {
              setIsClientOpen(!isClientOpen);
              setIsProjectOpen(false);
            }}
            className={`w-full py-2 px-3 rounded-xl border text-xs flex items-center justify-between gap-2 transition shadow-xs cursor-pointer ${
              selectedClientId !== "all"
                ? "bg-purple-600/10 border-purple-500 text-purple-400 font-bold"
                : "bg-theme-input border-theme-border text-theme-textSecondary hover:border-purple-500/50"
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <i className="fa-solid fa-user-tie text-purple-400 text-xs shrink-0"></i>
              <span className="truncate">
                {currentClient ? currentClient.name : t("filterAllClients")}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {selectedClientId !== "all" && (
                <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-mono font-bold">
                  {tasksByClient[selectedClientId as number] || 0}
                </span>
              )}
              <i className={`fa-solid fa-chevron-${isClientOpen ? "up" : "down"} text-[10px] text-theme-textMuted`}></i>
            </div>
          </button>

          {/* Client Searchable Popover Menu */}
          {isClientOpen && (
            <div className="absolute z-40 top-full mt-1.5 w-72 max-w-[90vw] end-0 bg-theme-card border border-theme-border rounded-xl shadow-2xl p-2 space-y-1.5 animate-scale-up">
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute start-2.5 top-1/2 -translate-y-1/2 text-[10px] text-theme-textMuted"></i>
                <input
                  ref={clientSearchInputRef}
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder={lang === "ar" ? "ابحث باسم العميل أو الهاتف..." : "Search client..."}
                  className="w-full bg-theme-input border border-theme-border rounded-lg ps-7 pe-2 py-1.5 text-xs text-theme-text focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* All Clients Option */}
              <div className="max-h-56 overflow-y-auto space-y-0.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onSelectClient("all");
                    setIsClientOpen(false);
                    setClientSearch("");
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                    selectedClientId === "all"
                      ? "bg-purple-600/15 text-purple-400 font-bold"
                      : "text-theme-textSecondary hover:bg-theme-hover hover:text-theme-text"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-users text-xs text-purple-400"></i>
                    <span>{t("filterAllClients")}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-theme-elevated text-theme-textMuted">
                    {clients.length}
                  </span>
                </button>

                {/* Clients List */}
                {filteredClientsList.map((c) => {
                  const count = tasksByClient[c.id] || 0;
                  const isSelected = selectedClientId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        onSelectClient(c.id);
                        setIsClientOpen(false);
                        setClientSearch("");
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                        isSelected
                          ? "bg-purple-600/15 text-purple-400 font-bold"
                          : "text-theme-textSecondary hover:bg-theme-hover hover:text-theme-text"
                      }`}
                    >
                      <div className="flex flex-col text-start truncate pe-1">
                        <span className="truncate font-medium">{c.name}</span>
                        {c.phone && (
                          <span className="text-[10px] text-theme-textMuted font-mono" dir="ltr">
                            {c.phone}
                          </span>
                        )}
                      </div>
                      {count > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 font-bold shrink-0">
                          {count} {lang === "ar" ? "مهام" : "tasks"}
                        </span>
                      )}
                    </button>
                  );
                })}

                {filteredClientsList.length === 0 && (
                  <p className="text-center py-3 text-[11px] text-theme-textMuted">
                    {lang === "ar" ? "لا يوجد عملاء مطابقين" : "No clients found"}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Quick Project Chips for instant 1-click filtering + Active Filter Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1 border-t border-theme-border/50">
        {/* Quick Project Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 max-w-full">
          <span className="text-[11px] text-theme-textMuted font-medium me-1 flex items-center gap-1">
            <i className="fa-solid fa-bolt-lightning text-amber-500 text-[10px]"></i>
            <span>{lang === "ar" ? "تصفية سريعة:" : "Quick Filter:"}</span>
          </span>

          <button
            type="button"
            onClick={() => onSelectProject("all")}
            className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
              selectedProjectId === "all"
                ? "bg-theme-elevated border-blue-500 text-blue-500 font-bold shadow-xs"
                : "bg-theme-input border-theme-border text-theme-textMuted hover:text-theme-text"
            }`}
          >
            {t("filterAllProjects")} ({totalTasks})
          </button>

          {activeProjectsForChips.map((p) => {
            const isSelected = selectedProjectId === p.id;
            const count = tasksByProject[p.id] || 0;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectProject(isSelected ? "all" : p.id)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? "bg-blue-600/15 border-blue-500 text-blue-400 font-bold shadow-xs"
                    : "bg-theme-input border-theme-border text-theme-textSecondary hover:border-blue-500/40 hover:text-theme-text"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: p.color }}
                ></span>
                <span>{p.name}</span>
                <span className="text-[10px] font-mono opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Filter Stats & Reset Button */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 ms-auto">
            <span className="text-[11px] text-theme-textMuted font-mono">
              {t("showingTasks")} <strong className="text-blue-500">{filteredTasks}</strong> {t("ofTotalTasks")} {totalTasks} {t("tasksWord")}
            </span>
            <button
              type="button"
              onClick={onClearFilters}
              className="text-[11px] px-2 py-0.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 transition flex items-center gap-1 font-semibold"
            >
              <i className="fa-solid fa-rotate-left text-[10px]"></i>
              <span>{t("clearFilters")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
