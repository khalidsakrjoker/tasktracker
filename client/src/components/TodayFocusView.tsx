import React from "react";
import { Task, TodayFocusData } from "../types";

interface TodayFocusViewProps {
  focusData: TodayFocusData;
  onUpdateTaskStatus: (taskId: number, status: string) => void;
  onOpenQuickAdd: (priority?: "P1" | "P2" | "P3") => void;
}

export const TodayFocusView: React.FC<TodayFocusViewProps> = ({
  focusData,
  onUpdateTaskStatus,
  onOpenQuickAdd
}) => {
  const renderTaskCard = (task: Task) => {
    return (
      <div
        key={task.id}
        className={`p-4 rounded-xl bg-obsidian-850 border border-obsidian-700 hover:border-obsidian-600 transition-all shadow-md group ${
          task.priority === "P1"
            ? "glow-card-p1"
            : task.priority === "P2"
            ? "glow-card-p2"
            : "glow-card-p3"
        }`}
      >
        {/* Header: Project Badge + Type */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-md text-white"
              style={{ backgroundColor: task.project?.color || "#3B82F6" }}
            >
              {task.project?.name}
            </span>
            <span className="text-[10px] text-slate-300 bg-obsidian-800 px-1.5 py-0.5 rounded">
              {task.type === "bug" ? "🐞 خطأ برمجي" : task.type === "feature" ? "✨ ميزة جديدة" : task.type === "tweak" ? "⚡ تحسين" : "📞 دعم"}
            </span>
          </div>

          <div className="text-[11px] text-slate-300 font-medium">
            <i className="fa-regular fa-clock ml-1"></i>
            <span>{task.estimatedMinutes || 30} د</span>
          </div>
        </div>

        {/* Task Title */}
        <h3 className="text-sm font-semibold text-slate-100 leading-snug mb-2 group-hover:text-cyber-blue transition-colors">
          {task.title}
        </h3>

        {/* Details if any */}
        {task.details && (
          <p className="text-xs text-slate-300 line-clamp-2 mb-3 bg-obsidian-900/60 p-2 rounded-lg border border-obsidian-800/80">
            {task.details}
          </p>
        )}

        {/* Client association if any */}
        {task.client && (
          <div className="flex items-center gap-2 text-xs text-slate-300 mb-3 bg-obsidian-900/40 px-2 py-1 rounded">
            <i className="fa-solid fa-user-tie text-[10px] text-slate-300"></i>
            <span className="font-medium text-slate-300">{task.client.name}</span>
            {task.client.phone && (
              <span className="text-[10px] text-slate-300" dir="ltr">
                {task.client.phone}
              </span>
            )}
          </div>
        )}

        {/* Footer: Quick Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-obsidian-800">
          <span className="text-[10px] text-slate-300">
            {new Date(task.createdAt).toLocaleDateString("ar-EG")}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onUpdateTaskStatus(task.id, task.status === "in_progress" ? "today" : "in_progress")}
              title={task.status === "in_progress" ? "إيقاف مؤقت" : "بدء العمل الآن"}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                task.status === "in_progress"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                  : "bg-obsidian-800 hover:bg-obsidian-750 text-slate-300 border-obsidian-700"
              }`}
            >
              <i className={`fa-solid ${task.status === "in_progress" ? "fa-pause" : "fa-play"} ml-1`}></i>
              <span>{task.status === "in_progress" ? "قيد التنفيذ" : "بدء"}</span>
            </button>

            <button
              onClick={() => onUpdateTaskStatus(task.id, "done")}
              title="تم الإنجاز"
              className="text-xs px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold transition-all"
            >
              <i className="fa-solid fa-check ml-1"></i>
              <span>تم</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Title & Philosophy Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🎯 لوحة التركيز اليومي الموحد</span>
            <span className="text-xs font-normal text-slate-400 bg-obsidian-800 px-2 py-0.5 rounded-full border border-obsidian-700">
              Cross-Project Matrix
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            لا تشتت نفسك بـ 50 مهمة؛ ركز فقط على أهم ما يحتاجه عملاؤك ومشروعاتك اليوم.
          </p>
        </div>
      </div>

      {/* 3 Full-Width Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: P1 Emergency */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-rose-500/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <h3 className="text-sm font-bold text-rose-400">🚨 P1 - طوارئ وعملاء</h3>
            </div>
            <span className="text-xs font-mono font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full">
              {focusData.p1Urgent.length}
            </span>
          </div>

          <div className="space-y-3">
            {focusData.p1Urgent.length === 0 ? (
              <div className="p-8 rounded-xl bg-obsidian-850/50 border border-obsidian-800 text-center text-slate-500 space-y-2">
                <i className="fa-regular fa-face-smile text-2xl text-emerald-400"></i>
                <p className="text-xs">رائع! لا توجد طوارئ معلقة حالياً.</p>
              </div>
            ) : (
              focusData.p1Urgent.map(renderTaskCard)
            )}

            <button
              onClick={() => onOpenQuickAdd("P1")}
              className="w-full py-2.5 rounded-xl border border-dashed border-rose-500/30 hover:border-rose-500/60 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <i className="fa-solid fa-plus"></i>
              <span>إضافة طارئ جديد</span>
            </button>
          </div>
        </div>

        {/* Column 2: P2 Core Features */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-amber-500/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h3 className="text-sm font-bold text-amber-400">⚡ P2 - بناء وتطوير أساسي</h3>
            </div>
            <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
              {focusData.p2Features.length}
            </span>
          </div>

          <div className="space-y-3">
            {focusData.p2Features.length === 0 ? (
              <div className="p-8 rounded-xl bg-obsidian-850/50 border border-obsidian-800 text-center text-slate-500 space-y-2">
                <i className="fa-solid fa-code text-2xl text-slate-600"></i>
                <p className="text-xs">لا توجد ميزات مجدولة لليوم.</p>
              </div>
            ) : (
              focusData.p2Features.map(renderTaskCard)
            )}

            <button
              onClick={() => onOpenQuickAdd("P2")}
              className="w-full py-2.5 rounded-xl border border-dashed border-amber-500/30 hover:border-amber-500/60 text-amber-400 hover:bg-amber-500/10 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <i className="fa-solid fa-plus"></i>
              <span>إضافة مهمة تطوير P2</span>
            </button>
          </div>
        </div>

        {/* Column 3: P3 Quick Tweaks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-emerald-500/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h3 className="text-sm font-bold text-emerald-400">🛠️ P3 - تحسينات ودعم سريع</h3>
            </div>
            <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
              {focusData.p3Tweaks.length}
            </span>
          </div>

          <div className="space-y-3">
            {focusData.p3Tweaks.length === 0 ? (
              <div className="p-8 rounded-xl bg-obsidian-850/50 border border-obsidian-800 text-center text-slate-500 space-y-2">
                <i className="fa-solid fa-check-double text-2xl text-slate-600"></i>
                <p className="text-xs">لا توجد تعديلات خفيفة معلقة.</p>
              </div>
            ) : (
              focusData.p3Tweaks.map(renderTaskCard)
            )}

            <button
              onClick={() => onOpenQuickAdd("P3")}
              className="w-full py-2.5 rounded-xl border border-dashed border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <i className="fa-solid fa-plus"></i>
              <span>إضافة تعديل خفيف P3</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
