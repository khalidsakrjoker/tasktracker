import React, { useState } from "react";
import { useI18n } from "../i18n";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (data: { name: string; code: string; color: string; icon: string; description?: string }) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onCreateProject }) => {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [icon, setIcon] = useState("folder");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  // 10 Preset Colors + 11th option is Custom Color
  const presetColors = [
    "#3B82F6", // 1. Electric Blue
    "#10B981", // 2. Emerald Green
    "#8B5CF6", // 3. Vibrant Purple
    "#F59E0B", // 4. Amber Gold
    "#EC4899", // 5. Hot Pink
    "#06B6D4", // 6. Cyan
    "#EF4444", // 7. Vivid Red
    "#84CC16", // 8. Lime Green
    "#6366F1", // 9. Indigo
    "#14B8A6"  // 10. Teal
  ];

  // 12 Developer/Business Icons (exceeds requested 10)
  const iconOptions = [
    "folder",
    "wallet",
    "cash-register",
    "crown",
    "rocket",
    "server",
    "code",
    "cart-shopping",
    "chart-pie",
    "database",
    "building",
    "laptop-code"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    onCreateProject({
      name: name.trim(),
      code: code.trim(),
      color,
      icon,
      description: description.trim() || undefined
    });
    setName("");
    setCode("");
    setDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-theme-card border border-theme-border rounded-2xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-theme-text flex items-center gap-2">
            <i className="fa-solid fa-folder-plus text-blue-600"></i>
            <span>{t("newProjectTitle")}</span>
          </h3>
          <button onClick={onClose} className="text-theme-textMuted hover:text-theme-text">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-theme-textSecondary mb-1">
              {t("projectNameLabel")}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("projectNamePlaceholder")}
              className="w-full bg-theme-input border border-theme-border rounded-xl px-3 py-2 text-sm text-theme-text focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-textSecondary mb-1">
              {t("projectCodeLabel")}
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
              placeholder={t("projectCodePlaceholder")}
              className="w-full bg-theme-input border border-theme-border rounded-xl px-3 py-2 text-sm text-theme-text font-mono focus:outline-none focus:border-blue-500 uppercase shadow-sm"
            />
          </div>

          {/* 10 Colors + 11th Custom Color Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-theme-textSecondary">
                {t("accentColorLabel")}
              </label>
              <span className="text-[11px] font-mono font-bold text-theme-textMuted uppercase flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }}></span>
                {color}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {presetColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setColor(c);
                    setIsCustomColor(false);
                  }}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    color === c && !isCustomColor
                      ? "scale-110 border-blue-500 ring-2 ring-blue-500/30 shadow-md"
                      : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                ></button>
              ))}

              {/* 11th Option: Custom Color Picker */}
              <label
                className={`relative w-8 h-8 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all ${
                  isCustomColor
                    ? "scale-110 border-blue-500 ring-2 ring-blue-500/40 shadow-md"
                    : "border-dashed border-theme-border hover:border-blue-500"
                } bg-gradient-to-tr from-rose-500 via-amber-400 via-emerald-400 to-blue-500`}
                title={t("customColorLabel")}
              >
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    setIsCustomColor(true);
                  }}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
                <span className="w-5 h-5 rounded-full bg-theme-card flex items-center justify-center text-[10px] text-theme-text">
                  <i className="fa-solid fa-eye-dropper"></i>
                </span>
              </label>
            </div>
          </div>

          {/* 12 Icons Selection */}
          <div>
            <label className="block text-xs font-semibold text-theme-textSecondary mb-1.5">
              {t("iconLabel")}
            </label>
            <div className="grid grid-cols-6 gap-2">
              {iconOptions.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`p-2 rounded-xl border text-sm transition-all flex items-center justify-center ${
                    icon === ic
                      ? "bg-blue-600/15 text-blue-600 border-blue-500 shadow-sm"
                      : "bg-theme-elevated text-theme-textMuted border-theme-border hover:text-theme-text hover:bg-theme-hover"
                  }`}
                >
                  <i className={`fa-solid fa-${ic}`}></i>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-textSecondary mb-1">
              {t("projectDescLabel")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-theme-input border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-theme-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-theme-elevated text-theme-textSecondary text-xs font-semibold hover:bg-theme-hover transition-colors"
            >
              {t("cancelBtn")}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              {t("createProjectSubmit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
