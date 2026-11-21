import React, { useState } from "react";
import { Client, Project } from "../types";
import { useI18n } from "../i18n";

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
  const { t } = useI18n();
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [defaultProjectId, setDefaultProjectId] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateClient({ name: name.trim(), phone: phone.trim() || undefined, company: company.trim() || undefined, notes: notes.trim() || undefined, defaultProjectId });
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
          <h2 className="text-xl font-bold text-theme-text flex items-center gap-2">
            <span>👥 {t("clientsTitle")}</span>
            <span className="text-xs bg-theme-elevated text-theme-textSecondary px-2 py-0.5 rounded-full border border-theme-border font-bold">
              {clients.length} {t("clientsCounter")}
            </span>
          </h2>
          <p className="text-xs text-theme-textMuted mt-1">
            {t("clientsSubtitle")}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 active:scale-95"
        >
          <i className="fa-solid fa-user-plus"></i>
          <span>{t("newClientBtn")}</span>
        </button>
      </div>

      {/* Grid of Clients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client) => (
          <div
            key={client.id}
            className="p-4 rounded-xl bg-theme-card border border-theme-border hover:border-blue-500/40 transition-all space-y-3 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-theme-text">{client.name}</h3>
                {client.company && (
                  <p className="text-xs text-theme-textSecondary">{client.company}</p>
                )}
              </div>

              {client.defaultProject && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white shadow-sm"
                  style={{ backgroundColor: client.defaultProject.color }}
                >
                  {client.defaultProject.name}
                </span>
              )}
            </div>

            {client.phone && (
              <div className="flex items-center gap-2 text-xs text-theme-textSecondary" dir="ltr">
                <i className="fa-solid fa-phone text-theme-textMuted text-[10px]"></i>
                <a href={`tel:${client.phone}`} className="hover:text-blue-600 transition-colors font-mono font-medium">
                  {client.phone}
                </a>
              </div>
            )}

            {client.notes && (
              <p className="text-xs text-theme-textSecondary bg-theme-elevated p-2 rounded-lg border border-theme-borderSubtle">
                {client.notes}
              </p>
            )}

            <div className="pt-2 border-t border-theme-border flex items-center justify-between">
              <span className="text-[11px] text-theme-textMuted">
                <i className="fa-solid fa-list-check me-1 text-theme-textMuted"></i>
                {client._count?.tasks || 0} {t("recordedTasks")}
              </span>

              <button
                onClick={() => onOpenQuickAddForClient(client.id, client.defaultProjectId)}
                className="text-xs px-2.5 py-1 rounded-lg bg-theme-elevated hover:bg-theme-hover text-blue-600 font-semibold transition-all flex items-center gap-1"
              >
                <i className="fa-solid fa-plus"></i>
                <span>{t("newRequestForClient")}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-theme-card border border-theme-border rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-theme-text flex items-center gap-2">
                <i className="fa-solid fa-user-plus text-blue-600"></i>
                <span>{t("clientModalTitle")}</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-theme-textMuted hover:text-theme-text">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-theme-textSecondary mb-1">
                  {t("clientNameLabel")}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("clientNamePlaceholder")}
                  className="w-full bg-theme-input border border-theme-border rounded-xl px-3 py-2 text-sm text-theme-text focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-theme-textSecondary mb-1">
                  {t("clientPhoneLabel")}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010xxxxxxxx"
                  dir="ltr"
                  className="w-full bg-theme-input border border-theme-border rounded-xl px-3 py-2 text-sm text-theme-text focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-theme-textSecondary mb-1">
                  {t("clientCompanyLabel")}
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={t("clientCompanyPlaceholder")}
                  className="w-full bg-theme-input border border-theme-border rounded-xl px-3 py-2 text-sm text-theme-text focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-theme-textSecondary mb-1">
                  {t("clientProjectLabel")}
                </label>
                <select
                  value={defaultProjectId || ""}
                  onChange={(e) => setDefaultProjectId(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  className="w-full bg-theme-input border border-theme-border rounded-xl px-3 py-2 text-sm text-theme-text focus:outline-none focus:border-blue-500 shadow-sm"
                >
                  <option value="">{t("clientNoProject")}</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-theme-textSecondary mb-1">
                  {t("clientNotesLabel")}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-theme-input border border-theme-border rounded-xl px-3 py-2 text-sm text-theme-text focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-theme-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-theme-elevated text-theme-textSecondary text-xs font-semibold hover:bg-theme-hover transition-colors"
                >
                  {t("cancelBtn")}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  {t("saveClientBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
