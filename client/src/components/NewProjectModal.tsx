import React, { useState } from "react";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (data: { name: string; code: string; color: string; icon: string; description?: string }) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onCreateProject }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [icon, setIcon] = useState("folder");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const colorOptions = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899", "#06B6D4"];
  const iconOptions = ["folder", "wallet", "cash-register", "crown", "rocket", "server", "code", "cart-shopping"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    onCreateProject({ name, code, color, icon, description });
    setName("");
    setCode("");
    setDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-obsidian-900 border border-obsidian-750 rounded-2xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <i className="fa-solid fa-folder-plus text-cyber-blue"></i>
            <span>إضافة مشروع برمجي جديد</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">اسم المشروع *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: تطبيق توصيل الطلبات"
              className="w-full bg-obsidian-800 border border-obsidian-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyber-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">كود المشروع (مختصر بالإنجليزية) *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
              placeholder="مثال: DELIVERY"
              className="w-full bg-obsidian-800 border border-obsidian-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyber-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">لون التمييز</label>
            <div className="flex items-center gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === c ? "scale-110 border-white shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c }}
                ></button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">الأيقونة</label>
            <div className="flex items-center gap-2 flex-wrap">
              {iconOptions.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`p-2 rounded-lg border text-sm transition-all ${
                    icon === ic ? "bg-blue-600/20 text-cyber-blue border-blue-500" : "bg-obsidian-800 text-slate-400 border-obsidian-700"
                  }`}
                >
                  <i className={`fa-solid fa-${ic}`}></i>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">وصف مختصر</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-obsidian-800 border border-obsidian-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyber-blue"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-obsidian-800 text-slate-300 text-xs font-semibold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
            >
              إنشاء المشروع
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
