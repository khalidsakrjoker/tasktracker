import React, { useState, useEffect, useRef } from "react";
import { Project, Client, Task } from "../types";
import { useI18n } from "../i18n";
import { SearchableClientSelect } from "./SearchableClientSelect";
import { ScalableProjectSelect } from "./ScalableProjectSelect";
import { compressAndSanitizeImage } from "../utils/imageCompressor";

interface EditTaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  projects: Project[];
  clients: Client[];
  onUpdateTask: (taskId: number, data: any) => Promise<void>;
  onDeleteTask: (taskId: number) => void;
  onCreateClient: (data: { name: string; phone?: string; company?: string }) => Promise<Client | null>;
  onPreviewImage: (imageUrl: string, title?: string) => void;
}

export const EditTaskDrawer: React.FC<EditTaskDrawerProps> = ({
  isOpen,
  onClose,
  task,
  projects,
  clients,
  onUpdateTask,
  onDeleteTask,
  onCreateClient,
  onPreviewImage
}) => {
  const { t, lang } = useI18n();
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [type, setType] = useState<"bug" | "feature" | "tweak" | "support">("feature");
  const [priority, setPriority] = useState<"P1" | "P2" | "P3">("P2");
  const [status, setStatus] = useState<"backlog" | "today" | "in_progress" | "done">("today");
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [projectId, setProjectId] = useState<number>(1);
  const [clientId, setClientId] = useState<number | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDetails(task.details || "");
      setImageUrl(task.imageUrl || null);
      setType(task.type || "feature");
      setPriority(task.priority || "P2");
      setStatus(task.status || "today");
      setEstimatedMinutes(task.estimatedMinutes || 30);
      setProjectId(task.projectId);
      setClientId(task.clientId || undefined);
    }
  }, [task, isOpen]);

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

  if (!isOpen || !task) return null;

  const uploadAndAttachImage = async (file: File | Blob) => {
    setIsUploading(true);
    try {
      // Compress and sanitize client-side down to WebP ~50-100KB
      const base64Data = await compressAndSanitizeImage(file, 1280, 0.75);

      const res = await fetch("/api/tasks/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Data })
      });

      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.url);
      } else {
        alert(lang === "ar" ? "فشل رفع الصورة، تأكد من الصيغة والحجم." : "Failed to upload image.");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      alert(lang === "ar" ? "حدث خطأ أثناء معالجة الصورة." : "Error processing image.");
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

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || isSaving) return;

    setIsSaving(true);
    try {
      await onUpdateTask(task.id, {
        title: title.trim(),
        details: details.trim() || null,
        imageUrl: imageUrl || null,
        type,
        priority,
        status,
        estimatedMinutes,
        projectId,
        clientId: clientId || null
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-theme-card border-x border-theme-border h-full flex flex-col justify-between shadow-2xl p-6 overflow-y-auto">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-theme-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-500">
                <i className="fa-solid fa-pen-to-square text-sm"></i>
              </div>
              <div>
                <h2 className="text-base font-bold text-theme-text">{t("editTaskTitle")}</h2>
                <span className="text-[10px] font-mono text-theme-textMuted">ID: #{task.id}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-theme-elevated hover:bg-theme-hover text-theme-textSecondary hover:text-theme-text flex items-center justify-center transition-colors"
            >
              <i className="fa-solid fa-xmark text-xs"></i>
            </button>
          </div>

          <form
            onSubmit={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
                if (e.ctrlKey || e.metaKey) {
                  handleSave(e);
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
                {t("taskTitleLabel")} *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("taskTitlePlaceholder")}
                className="w-full bg-theme-input border border-theme-border rounded-xl px-4 py-2.5 text-sm text-theme-text focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
              />
            </div>

            {/* Scalable Project Selector */}
            <div>
              <label className="block text-xs font-semibold text-theme-textSecondary mb-1.5">
                {t("projectLabel")} *
              </label>
              <ScalableProjectSelect
                projects={projects}
                selectedProjectId={projectId}
                onSelectProject={(pid) => setProjectId(pid)}
              />
            </div>

            {/* Client Selector */}
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
                {(["P1", "P2", "P3"] as const).map((p) => {
                  const isSelected = priority === p;
                  const colorClass =
                    p === "P1"
                      ? isSelected ? "bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30" : "text-rose-500 border-rose-500/30 hover:bg-rose-500/10"
                      : p === "P2"
                      ? isSelected ? "bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30" : "text-amber-500 border-amber-500/30 hover:bg-amber-500/10"
                      : isSelected ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30" : "text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10";

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 px-2.5 rounded-xl border text-xs flex items-center justify-center gap-1.5 transition-all ${colorClass}`}
                    >
                      <span>{p}</span>
                      <span className="text-[10px] opacity-80">
                        {p === "P1" ? t("priorityP1") : p === "P2" ? t("priorityP2") : t("priorityP3")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Type & Estimated Time */}
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
            <div className="p-3 rounded-2xl bg-theme-elevated/70 border border-theme-border space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-theme-text flex items-center gap-1.5">
                  <i className="fa-regular fa-image text-blue-500"></i>
                  <span>{t("attachImage")}</span>
                </span>
                <span className="text-[10px] text-theme-textMuted">{t("pasteImageHint")}</span>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {imageUrl ? (
                /* Attached Image Preview Thumbnail */
                <div className="flex items-center justify-between p-2 rounded-xl bg-theme-card border border-theme-border">
                  <div
                    onClick={() => onPreviewImage(imageUrl, title)}
                    className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition group"
                  >
                    <img
                      src={imageUrl}
                      alt="Thumbnail"
                      className="w-12 h-12 object-cover rounded-lg border border-theme-border group-hover:border-blue-500 transition"
                    />
                    <div>
                      <span className="text-xs font-semibold text-blue-500 flex items-center gap-1">
                        <i className="fa-solid fa-magnifying-glass-plus text-[10px]"></i>
                        <span>{t("imageAttached")}</span>
                      </span>
                      <p className="text-[10px] text-theme-textMuted">انقر لمعاينة الصورة بحجم كامل</p>
                    </div>
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
                /* Attach Trigger Button */
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-theme-border hover:border-blue-500 bg-theme-card/60 hover:bg-theme-card text-xs text-theme-textSecondary hover:text-blue-500 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <i className={`fa-solid ${isUploading ? "fa-spinner fa-spin" : "fa-cloud-arrow-up"} text-sm text-blue-500`}></i>
                  <span>{isUploading ? "جاري ضغط ومعالجة الصورة..." : t("attachImage")}</span>
                </button>
              )}
            </div>

            {/* Actions: Save / Delete / Cancel */}
            <div className="pt-4 border-t border-theme-border flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(lang === "ar" ? "هل تريد بالتأكيد حذف هذه المهمة نهائياً؟" : "Are you sure you want to delete this task?")) {
                    onDeleteTask(task.id);
                    onClose();
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-theme-elevated hover:bg-rose-500/20 text-theme-textMuted hover:text-rose-500 border border-theme-border hover:border-rose-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <i className="fa-solid fa-trash-can"></i>
                <span>{t("deleteTask")}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-theme-elevated hover:bg-theme-hover text-theme-textSecondary text-xs font-semibold transition-all"
                >
                  {t("cancelBtn")}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSaving ? "..." : t("saveTaskSubmit")}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
