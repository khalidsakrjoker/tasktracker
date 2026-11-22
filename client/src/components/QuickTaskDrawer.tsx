import React, { useState, useEffect, useRef } from "react";
import { Project, Client } from "../types";
import { useI18n } from "../i18n";
import { SearchableClientSelect } from "./SearchableClientSelect";
import { ScalableProjectSelect } from "./ScalableProjectSelect";
import { compressAndSanitizeImage } from "../utils/imageCompressor";

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
    imageUrl?: string;
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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Support Ctrl+V paste of screenshots directly in the drawer
  useEffect(() => {
    if (!isOpen) return;
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            uploadAndAttachImage(file);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen]);

  const uploadAndAttachImage = async (file: File | Blob) => {
    setIsUploading(true);
    try {
      const base64Data = await compressAndSanitizeImage(file, 1280, 0.75);
      const res = await fetch("/api/tasks/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Data })
      });

      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.url);
      }
    } catch (err) {
      console.error("Image upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAndAttachImage(file);
    }
  };

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
      imageUrl: imageUrl || undefined,
      type,
      priority,
      status,
      estimatedMinutes,
      projectId,
      clientId
    });

    setTitle("");
    setDetails("");
    setImageUrl(null);
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

          <form
            onSubmit={handleSubmit}
            onKeyDown={(e) => {
              // Prevent accidental premature submission on Enter key while user is still typing fields
              if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
                if (e.ctrlKey || e.metaKey) {
                  handleSubmit(e);
                } else {
                  e.preventDefault();
                }
              }
            }}
            className="space-y-4"
          >
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

            {/* Image Attachment Section */}
            <div className="p-3 rounded-2xl bg-theme-elevated/70 border border-theme-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-theme-text flex items-center gap-1.5">
                  <i className="fa-regular fa-image text-blue-500"></i>
                  <span>{t("attachImage")}</span>
                </span>
                <span className="text-[10px] text-theme-textMuted">{t("pasteImageHint")}</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {imageUrl ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-theme-card border border-theme-border">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={imageUrl}
                      alt="Thumbnail"
                      className="w-10 h-10 object-cover rounded-lg border border-theme-border"
                    />
                    <span className="text-xs font-semibold text-blue-500">{t("imageAttached")}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    title={t("removeImage")}
                    className="p-1.5 rounded-lg bg-theme-hover hover:bg-rose-500/20 text-theme-textMuted hover:text-rose-500 transition text-xs"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-theme-border hover:border-blue-500 bg-theme-card/60 hover:bg-theme-card text-xs text-theme-textSecondary hover:text-blue-500 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <i className={`fa-solid ${isUploading ? "fa-spinner fa-spin" : "fa-cloud-arrow-up"} text-sm text-blue-500`}></i>
                  <span>{isUploading ? "جاري ضغط ومعالجة الصورة..." : t("attachImage")}</span>
                </button>
              )}
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
