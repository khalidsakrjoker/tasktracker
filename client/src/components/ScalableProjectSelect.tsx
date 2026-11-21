import React, { useState, useRef, useEffect } from "react";
import { Project } from "../types";
import { useI18n } from "../i18n";

interface ScalableProjectSelectProps {
  projects: Project[];
  selectedProjectId: number;
  onSelectProject: (projectId: number) => void;
}

export const ScalableProjectSelect: React.FC<ScalableProjectSelectProps> = ({
  projects,
  selectedProjectId,
  onSelectProject
}) => {
  const { lang } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q)
    );
  });

  return (
    <div ref={containerRef} className="relative w-full space-y-1.5">
      {/* Unified Project Combobox Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-theme-input border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text flex items-center justify-between cursor-pointer hover:border-blue-500 transition-all shadow-sm"
      >
        <div className="flex items-center gap-2.5 truncate">
          {selectedProject ? (
            <>
              <span
                className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: selectedProject.color }}
              ></span>
              <i className={`fa-solid fa-${selectedProject.icon || "folder"} text-xs text-theme-textMuted shrink-0`}></i>
              <span className="font-bold text-theme-text truncate">{selectedProject.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-theme-elevated border border-theme-border text-theme-textMuted uppercase shrink-0">
                {selectedProject.code}
              </span>
            </>
          ) : (
            <span className="text-theme-textMuted">
              {lang === "ar" ? "اختر المشروع..." : "Select Project..."}
            </span>
          )}
        </div>

        <i className={`fa-solid fa-chevron-${isOpen ? "up" : "down"} text-[10px] text-theme-textMuted transition-transform shrink-0`}></i>
      </div>

      {/* Quick Access Badges (Top 3 for instant 1-click switch) */}
      {projects.length > 1 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] text-theme-textMuted font-medium me-1">
            {lang === "ar" ? "سريع:" : "Quick:"}
          </span>
          {projects.slice(0, 3).map((p) => {
            const isSelected = p.id === selectedProjectId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectProject(p.id)}
                className={`text-[11px] px-2.5 py-0.5 rounded-lg border font-medium flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? "bg-blue-600/15 border-blue-500 text-blue-600 font-bold shadow-xs"
                    : "bg-theme-elevated border-theme-border text-theme-textSecondary hover:bg-theme-hover hover:text-theme-text"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: p.color }}
                ></span>
                <span className="truncate max-w-[120px]">{p.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Dropdown Menu - Stays 100% inside drawer, NEVER overflows or clips */}
      {isOpen && (
        <div className="absolute z-50 inset-x-0 mt-1 w-full bg-theme-card border border-theme-border rounded-xl shadow-2xl overflow-hidden animate-fade-in text-xs">
          {/* Search box if 4 or more projects */}
          {projects.length > 3 && (
            <div className="p-2 border-b border-theme-border bg-theme-elevated flex items-center gap-2">
              <i className="fa-solid fa-magnifying-glass text-theme-textMuted text-xs ml-1"></i>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "ar" ? "ابحث في المشروعات..." : "Search projects..."}
                className="w-full bg-transparent border-none text-xs text-theme-text placeholder-theme-textMuted focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-theme-textMuted hover:text-theme-text p-0.5"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>
          )}

          {/* Projects List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-theme-borderSubtle">
            {filteredProjects.map((p) => {
              const isSelected = p.id === selectedProjectId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelectProject(p.id);
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  className={`w-full px-3.5 py-2.5 text-start flex items-center justify-between hover:bg-theme-hover transition-colors ${
                    isSelected ? "bg-blue-600/10 text-blue-600 font-bold" : "text-theme-text"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: p.color }}
                    ></span>
                    <i className={`fa-solid fa-${p.icon || "folder"} text-xs text-theme-textMuted shrink-0`}></i>
                    <span className="truncate">{p.name}</span>
                    <span className="text-[10px] font-mono text-theme-textMuted uppercase shrink-0">
                      ({p.code})
                    </span>
                  </div>

                  {isSelected && (
                    <i className="fa-solid fa-check text-xs text-blue-500 shrink-0"></i>
                  )}
                </button>
              );
            })}

            {filteredProjects.length === 0 && (
              <div className="p-3 text-center text-theme-textMuted text-xs">
                {lang === "ar" ? "لا يوجد مشروع بهذا الاسم" : "No projects found"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
