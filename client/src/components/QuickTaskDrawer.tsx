import React, { useState, useEffect } from "react";
import { Project, Client } from "../types";
import { useI18n } from "../i18n";
import { SearchableClientSelect } from "./SearchableClientSelect";
import { ScalableProjectSelect } from "./ScalableProjectSelect";

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
  onCreateClient: (data: { name: string; phone?: string; company?: string }) => Promise<Client | null>;
}

export const QuickTaskDrawer: React.FC<QuickTaskDrawerProps> = ({
  isOpen,
  onClose,
  projects,
  clients,
  initialPriority,
  initialProjectId,
  initialClientId,
  onSaveTask,
  onCreateClient
}) => {
  const { t } = useI18n();
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

  useEffect(() => {
    if (projects.length > 0 && !projects.some((p) => p.id === projectId)) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSaveTask({
      title: title.trim(),
      details: details.trim() || undefined,
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
      <div className="w-full max-w-lg bg-theme-card border-x border-theme-border h-full flex flex-col justify-between shadow-2xl p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-theme-border">
            <div>
              <h2 className="text-lg font-bold text-theme-text flex items-center gap-2">
                <i className="fa-solid fa-bolt-lightning text-blue-600"></i>
                <span>{t("drawerTitle")}</span>
              </h2>
              <p className="text-xs text-theme-textMuted mt-0.5">{t("drawerSubtitle")}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-theme-elevated hover:bg-theme-hover text-theme-textSecondary hover:text-theme-text flex items-center justify-center transition-colors"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Task Title */}
            <div>
              <label className="block text-xs font-semibold text-theme-textSecondary mb-1.5">
                {t("taskTitleLabel")}
              </label>
              <input
                type="text"
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("taskTitlePlaceholder")}
                className="w-full bg-theme-input border border-theme-border rounded-xl px-4 py-2.5 text-sm text-theme-text placeholder-theme-textMuted focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
              />
            </div>

            {/* Scalable Project Selector */}
            <div>
              <label className="block text-xs font-semibold text-theme-textSecondary mb-1.5">
                {t("projectLabel")}
              </label>
              <ScalableProjectSelect
                projects={projects}
                selectedProjectId={projectId}
                onSelectProject={(pid) => setProjectId(pid)}
              />
            </div>

            {/* Searchable Client Combobox with Inline Creation */}
            <div>
              <label className="block text-xs font-semibold text-theme-textSecondary mb-1.5">
                {t("clientLabel")}
              </label>
              <SearchableClientSelect
                clients={clients}
                selectedClientId={clientId}
                onSelectClient={(cid) => setClientId(cid)}
                onCreateClient={onCreateClient}
              />
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-semibold text-theme-textSecondary mb-1.5">
                {t("priorityLabel")}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPriority("P1")}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all ${
                    priority === "P1"
                      ? "bg-rose-500/20 text-rose-500 border-rose-500 shadow-md shadow-rose-500/10 font-extrabold"
                      : "bg-theme-elevated text-theme-textSecondary border-theme-border hover:text-rose-500"
                  }`}
                >
                  {t("priorityP1")}
                </button>
                <button
                  type="button"
                  onClick={() => setPriority("P2")}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all ${
                    priority === "P2"
                      ? "bg-amber-500/20 text-amber-600 border-amber-500 shadow-md shadow-amber-500/10 font-extrabold"
                      : "bg-theme-elevated text-theme-textSecondary border-theme-border hover:text-amber-500"
                  }`}
                >
                  {t("priorityP2")}
                </button>
                <button
                  type="button"
                  onClick={() => setPriority("P3")}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all ${
                    priority === "P3"
                      ? "bg-emerald-500/20 text-emerald-600 border-emerald-500 shadow-md shadow-emerald-500/10 font-extrabold"
                      : "bg-theme-elevated text-theme-textSecondary border-theme-border hover:text-emerald-500"
                  }`}
                >
                  {t("priorityP3")}
                </button>
              </div>
            </div>

            {/* Type & Time Estimation */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-theme-textSecondary mb-1.5">
                  {t("typeLabel")}
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-theme-input border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text focus:outline-none focus:border-blue-500"
                >
                  <option value="feature">✨ {t("typeFeature")}</option>
                  <option value="bug">🐞 {t("typeBug")}</option>
                  <option value="tweak">⚡ {t("typeTweak")}</option>
                  <option value="support">📞 {t("typeSupport")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-theme-textSecondary mb-1.5">
                  {t("estTimeLabel")}
                </label>
                <select
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10))}
                  className="w-full bg-theme-input border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text focus:outline-none focus:border-blue-500"
                >
                  <option value={15}>{t("time15m")}</option>
                  <option value={30}>{t("time30m")}</option>
                  <option value={60}>{t("time1h")}</option>
                  <option value={120}>{t("time2h")}</option>
                  <option value={240}>{t("time4h")}</option>
                </select>
              </div>
            </div>

            {/* Details / Notes */}
            <div>
              <label className="block text-xs font-semibold text-theme-textSecondary mb-1.5">
                {t("detailsLabel")}
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={t("detailsPlaceholder")}
                rows={3}
                className="w-full bg-theme-input border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text placeholder-theme-textMuted focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="pt-4 border-t border-theme-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-theme-elevated hover:bg-theme-hover text-theme-textSecondary text-xs font-semibold transition-all"
              >
                {t("cancelBtn")}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
              >
                {t("saveTaskSubmit")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
