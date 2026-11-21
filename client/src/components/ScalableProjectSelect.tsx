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
  const { t, lang } = useI18n();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Primary quick-access projects (top 3)
  const primaryProjects = projects.slice(0, 3);
  const isSelectedInPrimary = primaryProjects.some((p) => p.id === selectedProjectId);

  const filteredProjects = projects.filter((p) => {
    const q = filterQuery.toLowerCase().trim();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
  });

  return (
    <div className="w-full space-y-2">
      {/* Fast Quick-Select Pills Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {primaryProjects.map((p) => {
          const isSelected = p.id === selectedProjectId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectProject(p.id)}
              className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isSelected
                  ? "bg-blue-600/15 border-blue-500 text-blue-600 shadow-sm"
                  : "bg-theme-elevated border-theme-border text-theme-textSecondary hover:bg-theme-hover hover:text-theme-text"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: p.color }}
              ></span>
              <span className="truncate">{p.name}</span>
              {isSelected && <i className="fa-solid fa-check text-[10px]"></i>}
            </button>
          );
        })}

        {/* Selected Project from Dropdown Badge (if outside primary) */}
        {!isSelectedInPrimary && selectedProject && (
          <div className="flex-1 min-w-[120px] py-2 px-3 rounded-xl border border-blue-500 bg-blue-600/15 text-blue-600 text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: selectedProject.color }}
            ></span>
            <span className="truncate">{selectedProject.name}</span>
            <i className="fa-solid fa-check text-[10px]"></i>
          </div>
        )}

        {/* Scalable Dropdown Button for 10+ projects */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            title={t("moreProjects")}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isDropdownOpen
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-theme-elevated border-theme-border text-theme-textSecondary hover:bg-theme-hover hover:text-theme-text"
            }`}
          >
            <i className="fa-solid fa-layer-group text-xs"></i>
            <span>{projects.length > 3 ? `+${projects.length - 3}` : t("selectProject")}</span>
            <i className="fa-solid fa-chevron-down text-[10px] ml-0.5"></i>
          </button>

          {/* Scalable Projects Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute z-50 mt-1.5 end-0 w-64 bg-theme-card border border-theme-border rounded-xl shadow-2xl overflow-hidden animate-fade-in text-xs">
              {/* Search bar inside dropdown for 10+ projects */}
              <div className="p-2 border-b border-theme-border bg-theme-elevated flex items-center gap-2">
                <i className="fa-solid fa-magnifying-glass text-theme-textMuted text-xs ml-1"></i>
                <input
                  type="text"
                  autoFocus
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder={lang === "ar" ? "ابحث عن مشروع..." : "Search projects..."}
                  className="w-full bg-transparent border-none text-xs text-theme-text placeholder-theme-textMuted focus:outline-none"
                />
              </div>

              <div className="max-h-56 overflow-y-auto divide-y divide-theme-borderSubtle">
                {filteredProjects.map((p) => {
                  const isSelected = p.id === selectedProjectId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        onSelectProject(p.id);
                        setIsDropdownOpen(false);
                        setFilterQuery("");
                      }}
                      className={`w-full px-3 py-2.5 text-start flex items-center justify-between hover:bg-theme-hover transition-colors ${
                        isSelected ? "bg-blue-600/15 text-blue-600 font-bold" : "text-theme-text"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: p.color }}
                        ></span>
                        <div className="truncate">
                          <div className="font-semibold truncate">{p.name}</div>
                          <div className="text-[10px] text-theme-textMuted font-mono uppercase">{p.code}</div>
                        </div>
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
      </div>
    </div>
  );
};
