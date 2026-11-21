import React, { useState, useEffect } from "react";
import { Project, Client } from "../types";

interface QuickTaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  clients: Client[];
  initialPriority?: "P1" | "P2" | "P3";
  initialProjectId?: number;
  initialClientId?: number;
  onSaveTask: (data: {
    title: string;
    details?: string;
    type: "bug" | "feature" | "tweak" | "support";
    priority: "P1" | "P2" | "P3";
    status: "backlog" | "today" | "in_progress" | "done";
    estimatedMinutes: number;
    projectId: number;
    clientId?: number;
  }) => void;
}

export const QuickTaskDrawer: React.FC<QuickTaskDrawerProps> = ({
  isOpen,
  onClose,
  projects,
  clients,
  initialPriority,
  initialProjectId,
  initialClientId,
  onSaveTask
}) => {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [type, setType] = useState<"bug" | "feature" | "tweak" | "support">("feature");
  const [priority, setPriority] = useState<"P1" | "P2" | "P3">("P2");
  const [status, setStatus] = useState<"backlog" | "today" | "in_progress" | "done">("today");
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [projectId, setProjectId] = useState<number>(projects[0]?.id || 1);
  const [clientId, setClientId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (initialPriority) setPriority(initialPriority);
    if (initialProjectId) setProjectId(initialProjectId);
    if (initialClientId) setClientId(initialClientId);
  }, [initialPriority, initialProjectId, initialClientId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSaveTask({
      title,
      details,
      type,
      priority,
      status,
      estimatedMinutes,
      projectId,
      clientId
    });

    setTitle("");
    setDetails("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-obsidian-900 border-r border-obsidian-700 h-full flex flex-col justify-between shadow-2xl p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-obsidian-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-bolt-lightning text-cyber-blue"></i>
                <span>تسجيل مهمة خاطفة (Quick Capture)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">فرّغ المهمة من عقلك في 5 ثوانٍ ولن تضيع أبداً</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Task Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                عنوان المهمة / الطلب *
              </label>
              <input
                type="text"
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: تعديل زر طباعة الإيصال لعميل الهرم"
                className="w-full bg-obsidian-800 border border-obsidian-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue transition-all"
              />
            </div>

            {/* Project Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">المشروع التابع له *</label>
              <div className="grid grid-cols-3 gap-2">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProjectId(p.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      projectId === p.id
                        ? "bg-obsidian-750 text-white border-blue-500 shadow-md shadow-blue-500/10"
                        : "bg-obsidian-850 text-slate-400 border-obsidian-750 hover:bg-obsidian-800 hover:text-white"
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: p.color }}
                    ></span>
                    <span className="truncate w-full text-center">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Client Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">العميل مقدم الطلب (اختياري)</label>
              <select
                value={clientId || ""}
                onChange={(e) => setClientId(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                className="w-full bg-obsidian-800 border border-obsidian-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyber-blue"
              >
                <option value="">بدون عميل محدد</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">الأولوية ومستوى الخطر</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPriority("P1")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    priority === "P1"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md shadow-rose-500/10"
                      : "bg-obsidian-850 text-slate-400 border-obsidian-750 hover:text-rose-400"
                  }`}
                >
                  🔴 P1 - طوارئ عاجلة
                </button>
                <button
                  type="button"
                  onClick={() => setPriority("P2")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    priority === "P2"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10"
                      : "bg-obsidian-850 text-slate-400 border-obsidian-750 hover:text-amber-400"
                  }`}
                >
                  🟡 P2 - تطوير وبناء
                </button>
                <button
                  type="button"
                  onClick={() => setPriority("P3")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    priority === "P3"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/10"
                      : "bg-obsidian-850 text-slate-400 border-obsidian-750 hover:text-emerald-400"
                  }`}
                >
                  🟢 P3 - تحسين هادئ
                </button>
              </div>
            </div>

            {/* Type & Time Estimation */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">نوع المهمة</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-obsidian-800 border border-obsidian-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="feature">✨ ميزة جديدة (Feature)</option>
                  <option value="bug">🐞 إصلاح خطأ (Bug)</option>
                  <option value="tweak">⚡ تعديل خفيف (Tweak)</option>
                  <option value="support">📞 دعم فني (Support)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">الوقت المقدر</label>
                <select
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10))}
                  className="w-full bg-obsidian-800 border border-obsidian-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value={15}>15 دقيقة</option>
                  <option value={30}>30 دقيقة</option>
                  <option value={60}>ساعة واحدة</option>
                  <option value={120}>ساعتان</option>
                  <option value={240}>4 ساعات</option>
                </select>
              </div>
            </div>

            {/* Details / Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">ملاحظات وتفاصيل الكود</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="سطر كود، دالة، جدول في الداتابيز، أو متطلبات العميل بالتفصيل..."
                rows={3}
                className="w-full bg-obsidian-800 border border-obsidian-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyber-blue font-mono"
              />
            </div>

            <div className="pt-4 border-t border-obsidian-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 text-xs font-semibold transition-all"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
              >
                حفظ المهمة (Enter)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
