import React, { useState, useMemo } from "react";
import { Task, TodayFocusData, Project, Client } from "../types";
import { useI18n } from "../i18n";
import { BacklogDrawer } from "./BacklogDrawer";
import { TodayFilterBar } from "./TodayFilterBar";
import { TaskAudioPlayer } from "./TaskAudioPlayer";
import { parseImageUrls } from "../utils/imageCompressor";

interface TodayFocusViewProps {
  focusData: TodayFocusData;
  projects?: Project[];
  clients?: Client[];
  onUpdateTaskStatus: (taskId: number, status: string) => void;
  onDeleteTask: (taskId: number) => void;
  onOpenQuickAdd: (priority?: "P1" | "P2" | "P3") => void;
  onEditTask: (task: Task) => void;
  onReorderTask: (taskId: number, direction: "up" | "down", list: Task[]) => void;
  onPreviewImage: (images: string[] | string, indexOrTitle?: number | string, title?: string) => void;
}

export const TodayFocusView: React.FC<TodayFocusViewProps> = ({
  focusData,
  projects = [],
  clients = [],
  onUpdateTaskStatus,
  onDeleteTask,
  onOpenQuickAdd,
  onEditTask,
  onReorderTask,
  onPreviewImage
}) => {
  const { t, lang } = useI18n();
  const [isBacklogOpen, setIsBacklogOpen] = useState(false);

  // Quick Filter State
  const [selectedProjectId, setSelectedProjectId] = useState<number | "all">("all");
  const [selectedClientId, setSelectedClientId] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "bug": return `🐞 ${t("typeBug")}`;
      case "feature": return `✨ ${t("typeFeature")}`;
      case "tweak": return `⚡ ${t("typeTweak")}`;
      default: return `📞 ${t("typeSupport")}`;
    }
  };

  // Combine all active tasks to compute stats for filters
  const allTodayTasks = useMemo(() => {
    return [
      ...focusData.p1Urgent,
      ...focusData.p2Features,
      ...focusData.p3Tweaks
    ];
  }, [focusData]);

  // Compute active task counts by project
  const tasksByProject = useMemo(() => {
    const map: Record<number, number> = {};
    for (const t of allTodayTasks) {
      map[t.projectId] = (map[t.projectId] || 0) + 1;
    }
    return map;
  }, [allTodayTasks]);

  // Compute active task counts by client
  const tasksByClient = useMemo(() => {
    const map: Record<number, number> = {};
    for (const t of allTodayTasks) {
      if (t.clientId) {
        map[t.clientId] = (map[t.clientId] || 0) + 1;
      }
    }
    return map;
  }, [allTodayTasks]);

  // Filter function for tasks
  const filterPredicate = (task: Task) => {
    if (selectedProjectId !== "all" && task.projectId !== selectedProjectId) {
      return false;
    }
    if (selectedClientId !== "all" && task.clientId !== selectedClientId) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDetails = task.details ? task.details.toLowerCase().includes(q) : false;
      const matchClient = task.client ? task.client.name.toLowerCase().includes(q) || (task.client.phone && task.client.phone.includes(q)) : false;
      const matchProject = task.project ? task.project.name.toLowerCase().includes(q) || task.project.code.toLowerCase().includes(q) : false;
      if (!matchTitle && !matchDetails && !matchClient && !matchProject) {
        return false;
      }
    }
    return true;
  };

  const filteredP1 = useMemo(() => focusData.p1Urgent.filter(filterPredicate), [focusData.p1Urgent, selectedProjectId, selectedClientId, searchQuery]);
  const filteredP2 = useMemo(() => focusData.p2Features.filter(filterPredicate), [focusData.p2Features, selectedProjectId, selectedClientId, searchQuery]);
  const filteredP3 = useMemo(() => focusData.p3Tweaks.filter(filterPredicate), [focusData.p3Tweaks, selectedProjectId, selectedClientId, searchQuery]);

  const totalFilteredCount = filteredP1.length + filteredP2.length + filteredP3.length;
  const hasActiveFilters = selectedProjectId !== "all" || selectedClientId !== "all" || searchQuery.trim().length > 0;

  const handleClearFilters = () => {
    setSelectedProjectId("all");
    setSelectedClientId("all");
    setSearchQuery("");
  };

  // Render Compact, Ergonomic, High-Legibility Card
  const renderTaskCard = (task: Task, index: number, list: Task[]) => {
    const images = parseImageUrls(task.imageUrl);

    const priorityBorder =
      task.priority === "P1"
        ? "border-s-4 border-s-rose-500"
        : task.priority === "P2"
        ? "border-s-4 border-s-amber-500"
        : "border-s-4 border-s-emerald-500";

    return (
      <div
        key={task.id}
        className={`p-3 rounded-xl bg-theme-card border border-theme-border/80 hover:border-blue-500/40 transition-all shadow-xs hover:shadow-md space-y-2 group relative ${priorityBorder}`}
      >
        {/* Top Line: Project Badge + Type + Est. Time + Reordering Chevrons */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white shadow-xs shrink-0"
              style={{ backgroundColor: task.project?.color || "#3B82F6" }}
            >
              {task.project?.name}
            </span>
            <span className="text-[10px] text-theme-textMuted bg-theme-elevated px-1.5 py-0.5 rounded border border-theme-border shrink-0">
              {getTypeLabel(task.type)}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-theme-textMuted font-mono flex items-center gap-1">
              <i className="fa-regular fa-clock text-[9px]"></i>
              <span>{task.estimatedMinutes || 30}{t("minAbbr")}</span>
            </span>

            {/* Compact Reordering Arrows (▲ / ▼) */}
            <div className="flex items-center rounded-md border border-theme-border bg-theme-elevated overflow-hidden opacity-70 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onReorderTask(task.id, "up", list)}
                disabled={index === 0}
                title={t("moveUp") || "تحريك لأعلى"}
                className={`px-1 py-0.5 text-[10px] hover:bg-theme-hover transition-colors ${
                  index === 0 ? "opacity-20 cursor-not-allowed" : "text-theme-textSecondary hover:text-blue-500"
                }`}
              >
                <i className="fa-solid fa-chevron-up text-[8px]"></i>
              </button>
              <div className="w-[1px] h-2.5 bg-theme-border"></div>
              <button
                type="button"
                onClick={() => onReorderTask(task.id, "down", list)}
                disabled={index === list.length - 1}
                title={t("moveDown") || "تحريك لأسفل"}
                className={`px-1 py-0.5 text-[10px] hover:bg-theme-hover transition-colors ${
                  index === list.length - 1 ? "opacity-20 cursor-not-allowed" : "text-theme-textSecondary hover:text-blue-500"
                }`}
              >
                <i className="fa-solid fa-chevron-down text-[8px]"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Task Title (High Contrast & Clear, Click to Open Details) */}
        <h3
          onClick={() => onEditTask(task)}
          className="text-xs sm:text-[13px] font-bold text-theme-text leading-snug group-hover:text-blue-500 transition-colors cursor-pointer"
          title={lang === "ar" ? "انقر لعرض تفاصيل المهمة وملاحظاتها وصورها" : "Click to view task details, notes, and images"}
        >
          {task.title}
        </h3>

        {/* Details / Notes (Click to Open Details) */}
        {task.details && (
          <p
            onClick={() => onEditTask(task)}
            className="text-[11px] text-theme-textSecondary/90 line-clamp-2 leading-relaxed cursor-pointer hover:text-theme-text transition-colors"
            title={lang === "ar" ? "انقر لعرض التفاصيل بالكامل" : "Click to view full details"}
          >
            {task.details}
          </p>
        )}

        {/* Voice Note Audio Player */}
        {task.audioUrl && (
          <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
            <TaskAudioPlayer audioUrl={task.audioUrl} variant="compact" />
          </div>
        )}

        {/* Metadata Row: Client & Compact Image Thumbnails */}
        {(task.client || images.length > 0) && (
          <div className="flex items-center justify-between gap-2 pt-0.5">
            {/* Client Pill */}
            {task.client ? (
              <div className="flex items-center gap-1.5 text-[11px] text-theme-textSecondary bg-theme-elevated/70 px-2 py-0.5 rounded-md border border-theme-border/60 truncate">
                <i className="fa-solid fa-user-tie text-[9px] text-theme-textMuted"></i>
                <span className="font-medium truncate">{task.client.name}</span>
              </div>
            ) : (
              <div></div>
            )}

            {/* Compact Image Thumbnail Strip (Max ~32px height, non-intrusive) */}
            {images.length > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                {images.length === 1 ? (
                  <button
                    type="button"
                    onClick={() => onPreviewImage(images, 0, task.title)}
                    className="relative w-12 h-8 rounded-md overflow-hidden border border-theme-border hover:border-blue-500 transition cursor-zoom-in group/img bg-black/20"
                    title={t("clickToEnlarge")}
                  >
                    <img
                      src={images[0]}
                      alt="Thumb"
                      className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-200"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white text-[9px] transition">
                      <i className="fa-solid fa-magnifying-glass-plus"></i>
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    {images.slice(0, 2).map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onPreviewImage(images, idx, task.title)}
                        className="relative w-10 h-8 rounded-md overflow-hidden border border-theme-border hover:border-blue-500 transition cursor-zoom-in group/img bg-black/20"
                        title={t("clickToEnlarge")}
                      >
                        <img
                          src={img}
                          alt={`Thumb ${idx + 1}`}
                          className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-200"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white text-[8px] transition">
                          <i className="fa-solid fa-magnifying-glass-plus"></i>
                        </div>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => onPreviewImage(images, 0, task.title)}
                      className="px-1.5 py-1 rounded-md bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 border border-blue-500/30 text-[10px] font-mono font-bold flex items-center gap-1 transition"
                      title={t("clickToEnlarge")}
                    >
                      <i className="fa-regular fa-images text-[9px]"></i>
                      <span>{images.length}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer: Single Unified Action Bar (Compact, Clean, No Double Rows) */}
        <div className="pt-2 border-t border-theme-border/60 flex items-center justify-between gap-1">
          {/* Creation Date */}
          <span className="text-[10px] text-theme-textMuted font-mono">
            {new Date(task.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
          </span>

          {/* Action Buttons Group */}
          <div className="flex items-center gap-1">
            {/* Move to Backlog Button */}
            <button
              type="button"
              onClick={() => onUpdateTaskStatus(task.id, "backlog")}
              title={t("moveToBacklog")}
              className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 transition flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <i className="fa-solid fa-inbox text-[10px]"></i>
              <span>{t("moveToBacklog")}</span>
            </button>

            {/* Edit Task Drawer Button */}
            <button
              type="button"
              onClick={() => onEditTask(task)}
              title={t("editTaskBtn")}
              className="w-7 h-7 rounded-lg bg-theme-elevated hover:bg-blue-500/15 text-theme-textMuted hover:text-blue-500 border border-theme-border flex items-center justify-center transition text-xs"
            >
              <i className="fa-solid fa-pen-to-square"></i>
            </button>

            {/* Start / In Progress Status Toggle */}
            <button
              type="button"
              onClick={() => onUpdateTaskStatus(task.id, task.status === "in_progress" ? "today" : "in_progress")}
              title={task.status === "in_progress" ? t("pauseBtn") : t("startBtn")}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition flex items-center gap-1 ${
                task.status === "in_progress"
                  ? "bg-amber-500/20 text-amber-500 border-amber-500/40 animate-pulse"
                  : "bg-theme-elevated hover:bg-theme-hover text-theme-textSecondary border-theme-border"
              }`}
            >
              <i className={`fa-solid ${task.status === "in_progress" ? "fa-pause" : "fa-play"} text-[9px]`}></i>
              <span>{task.status === "in_progress" ? t("inProgressBadge") : t("startBtn")}</span>
            </button>

            {/* Mark Done Button */}
            <button
              type="button"
              onClick={() => onUpdateTaskStatus(task.id, "done")}
              title={t("doneBtn")}
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-500 border border-emerald-500/30 transition flex items-center gap-1"
            >
              <i className="fa-solid fa-check text-[10px]"></i>
              <span>{t("doneBtn")}</span>
            </button>

            {/* Delete Task Button */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm(lang === "ar" ? "هل تريد بالتأكيد حذف هذه المهمة نهائياً؟" : "Are you sure you want to delete this task?")) {
                  onDeleteTask(task.id);
                }
              }}
              title={t("deleteTask")}
              className="w-7 h-7 rounded-lg bg-theme-elevated hover:bg-rose-500/20 text-theme-textMuted hover:text-rose-500 border border-theme-border flex items-center justify-center transition text-xs"
            >
              <i className="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 max-w-full overflow-x-hidden">
      {/* Title & Philosophy Banner + Backlog Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1">
        <div>
          <h2 className="text-xl font-bold text-theme-text flex items-center gap-2">
            <span>{t("focusTitle")}</span>
            <span className="text-xs font-normal text-theme-textMuted bg-theme-card px-2.5 py-0.5 rounded-full border border-theme-border">
              {t("focusMatrixBadge")}
            </span>
          </h2>
          <p className="text-xs text-theme-textMuted mt-0.5">
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

      {/* Searchable Quick Filter Bar (Projects, Clients, Keyword Search) */}
      <TodayFilterBar
        projects={projects}
        clients={clients}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        selectedClientId={selectedClientId}
        onSelectClient={setSelectedClientId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearFilters={handleClearFilters}
        totalTasks={allTodayTasks.length}
        filteredTasks={totalFilteredCount}
        tasksByProject={tasksByProject}
        tasksByClient={tasksByClient}
      />

      {/* 3 Columns Grid (P1, P2, P3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Column 1: P1 Emergency */}
        <div className="flex flex-col rounded-2xl bg-theme-card/30 border border-theme-border/70 p-3 space-y-3 min-h-[400px]">
          {/* Sticky Column Header */}
          <div className="flex items-center justify-between pb-2 border-b-2 border-rose-500/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <h3 className="text-sm font-bold text-rose-500">{t("p1EmergencyTitle")}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-rose-500/20 text-rose-500 px-2 py-0.5 rounded-full">
                {filteredP1.length}
              </span>
              <button
                type="button"
                onClick={() => onOpenQuickAdd("P1")}
                className="w-6 h-6 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 flex items-center justify-center transition text-xs"
                title={t("p1AddBtn")}
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>

          <div className="space-y-2.5 flex-1">
            {filteredP1.length === 0 ? (
              <div className="p-8 rounded-xl bg-theme-card/50 border border-dashed border-theme-border text-center text-theme-textMuted space-y-2">
                <i className="fa-regular fa-face-smile text-2xl text-emerald-500/80"></i>
                <p className="text-xs">
                  {hasActiveFilters ? t("noMatchingTasks") : t("p1EmergencyEmpty")}
                </p>
              </div>
            ) : (
              filteredP1.map((task, idx) => renderTaskCard(task, idx, filteredP1))
            )}

            <button
              onClick={() => onOpenQuickAdd("P1")}
              className="w-full py-2 rounded-xl border border-dashed border-rose-500/30 hover:border-rose-500 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <i className="fa-solid fa-plus text-[10px]"></i>
              <span>{t("p1AddBtn")}</span>
            </button>
          </div>
        </div>

        {/* Column 2: P2 Core Features */}
        <div className="flex flex-col rounded-2xl bg-theme-card/30 border border-theme-border/70 p-3 space-y-3 min-h-[400px]">
          {/* Sticky Column Header */}
          <div className="flex items-center justify-between pb-2 border-b-2 border-amber-500/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h3 className="text-sm font-bold text-amber-500">{t("p2FeaturesTitle")}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full">
                {filteredP2.length}
              </span>
              <button
                type="button"
                onClick={() => onOpenQuickAdd("P2")}
                className="w-6 h-6 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 flex items-center justify-center transition text-xs"
                title={t("p2AddBtn")}
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>

          <div className="space-y-2.5 flex-1">
            {filteredP2.length === 0 ? (
              <div className="p-8 rounded-xl bg-theme-card/50 border border-dashed border-theme-border text-center text-theme-textMuted space-y-2">
                <i className="fa-solid fa-code text-2xl text-theme-textMuted/60"></i>
                <p className="text-xs">
                  {hasActiveFilters ? t("noMatchingTasks") : t("p2FeaturesEmpty")}
                </p>
              </div>
            ) : (
              filteredP2.map((task, idx) => renderTaskCard(task, idx, filteredP2))
            )}

            <button
              onClick={() => onOpenQuickAdd("P2")}
              className="w-full py-2 rounded-xl border border-dashed border-amber-500/30 hover:border-amber-500 text-amber-500 hover:bg-amber-500/10 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <i className="fa-solid fa-plus text-[10px]"></i>
              <span>{t("p2AddBtn")}</span>
            </button>
          </div>
        </div>

        {/* Column 3: P3 Quick Tweaks */}
        <div className="flex flex-col rounded-2xl bg-theme-card/30 border border-theme-border/70 p-3 space-y-3 min-h-[400px]">
          {/* Sticky Column Header */}
          <div className="flex items-center justify-between pb-2 border-b-2 border-emerald-500/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h3 className="text-sm font-bold text-emerald-500">{t("p3TweaksTitle")}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full">
                {filteredP3.length}
              </span>
              <button
                type="button"
                onClick={() => onOpenQuickAdd("P3")}
                className="w-6 h-6 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 flex items-center justify-center transition text-xs"
                title={t("p3AddBtn")}
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>

          <div className="space-y-2.5 flex-1">
            {filteredP3.length === 0 ? (
              <div className="p-8 rounded-xl bg-theme-card/50 border border-dashed border-theme-border text-center text-theme-textMuted space-y-2">
                <i className="fa-solid fa-check-double text-2xl text-theme-textMuted/60"></i>
                <p className="text-xs">
                  {hasActiveFilters ? t("noMatchingTasks") : t("p3TweaksEmpty")}
                </p>
              </div>
            ) : (
              filteredP3.map((task, idx) => renderTaskCard(task, idx, filteredP3))
            )}

            <button
              onClick={() => onOpenQuickAdd("P3")}
              className="w-full py-2 rounded-xl border border-dashed border-emerald-500/30 hover:border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <i className="fa-solid fa-plus text-[10px]"></i>
              <span>{t("p3AddBtn")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backlog Drawer */}
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
