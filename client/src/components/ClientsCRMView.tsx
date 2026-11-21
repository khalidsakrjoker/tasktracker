import React, { useState } from "react";
import { Client, Project } from "../types";

interface ClientsCRMViewProps {
  clients: Client[];
  projects: Project[];
  onCreateClient: (data: { name: string; phone?: string; company?: string; notes?: string; defaultProjectId?: number }) => void;
  onOpenQuickAddForClient: (clientId: number, defaultProjectId?: number) => void;
}

export const ClientsCRMView: React.FC<ClientsCRMViewProps> = ({
  clients,
  projects,
  onCreateClient,
  onOpenQuickAddForClient
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [defaultProjectId, setDefaultProjectId] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateClient({ name, phone, company, notes, defaultProjectId });
    setName("");
    setPhone("");
    setCompany("");
    setNotes("");
    setShowAddModal(false);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>👥 دليل العملاء والمستفيدين</span>
            <span className="text-xs bg-obsidian-800 text-slate-400 px-2 py-0.5 rounded-full border border-obsidian-700">
              {clients.length} عميل
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            سجل عملاء كاش إكس، وسجدة POS، وقاعات الأفراح؛ تواصل معهم وتابع طلباتهم بدون نسيان.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
        >
          <i className="fa-solid fa-user-plus ml-1.5"></i>
          <span>عميل جديد</span>
        </button>
      </div>

      {/* Grid of Clients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client) => (
          <div
            key={client.id}
            className="p-4 rounded-xl bg-obsidian-850 border border-obsidian-700 hover:border-obsidian-600 transition-all space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{client.name}</h3>
                {client.company && (
                  <p className="text-xs text-slate-400">{client.company}</p>
                )}
              </div>

              {client.defaultProject && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                  style={{ backgroundColor: client.defaultProject.color }}
                >
                  {client.defaultProject.name}
                </span>
              )}
            </div>

            {client.phone && (
              <div className="flex items-center gap-2 text-xs text-slate-300" dir="ltr">
                <i className="fa-solid fa-phone text-slate-500 text-[10px]"></i>
                <a href={`tel:${client.phone}`} className="hover:text-cyber-blue transition-colors font-mono">
                  {client.phone}
                </a>
              </div>
            )}

            {client.notes && (
              <p className="text-xs text-slate-400 bg-obsidian-900/60 p-2 rounded-lg border border-obsidian-800">
                {client.notes}
              </p>
            )}

            <div className="pt-2 border-t border-obsidian-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                <i className="fa-solid fa-list-check ml-1 text-slate-500"></i>
                {client._count?.tasks || 0} مهمة مسجلة
              </span>

              <button
                onClick={() => onOpenQuickAddForClient(client.id, client.defaultProjectId)}
                className="text-xs px-2.5 py-1 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-cyber-blue font-semibold transition-all"
              >
                <i className="fa-solid fa-plus ml-1"></i>
                <span>طلب جديد</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-obsidian-900 border border-obsidian-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">إضافة عميل جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">اسم العميل *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: أ/ محمد - فرع الهرم"
                  className="w-full bg-obsidian-800 border border-obsidian-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyber-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">رقم الهاتف / الواتساب</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010xxxxxxxx"
                  className="w-full bg-obsidian-800 border border-obsidian-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyber-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">اسم الشركة / النشاط</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="سوبرماركت، قاعة، محطة بنزين..."
                  className="w-full bg-obsidian-800 border border-obsidian-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyber-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">المشروع المرتبط</label>
                <select
                  value={defaultProjectId || ""}
                  onChange={(e) => setDefaultProjectId(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  className="w-full bg-obsidian-800 border border-obsidian-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyber-blue"
                >
                  <option value="">بدون مشروع محدد</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ملاحظات إضافية</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-obsidian-800 border border-obsidian-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyber-blue"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-obsidian-800 text-slate-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  حفظ العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
