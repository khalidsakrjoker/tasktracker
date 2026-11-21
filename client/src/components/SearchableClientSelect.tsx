import React, { useState, useRef, useEffect } from "react";
import { Client } from "../types";
import { useI18n } from "../i18n";

interface SearchableClientSelectProps {
  clients: Client[];
  selectedClientId?: number;
  onSelectClient: (clientId?: number) => void;
  onCreateClient: (data: { name: string; phone?: string; company?: string }) => Promise<Client | null>;
}

export const SearchableClientSelect: React.FC<SearchableClientSelectProps> = ({
  clients,
  selectedClientId,
  onSelectClient,
  onCreateClient
}) => {
  const { t, lang } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingInline, setIsCreatingInline] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsCreatingInline(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const filteredClients = clients.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const matchName = c.name.toLowerCase().includes(q);
    const matchPhone = c.phone ? c.phone.includes(q) : false;
    const matchCompany = c.company ? c.company.toLowerCase().includes(q) : false;
    return matchName || matchPhone || matchCompany;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await onCreateClient({
        name: newClientName.trim(),
        phone: newClientPhone.trim() || undefined
      });
      if (created) {
        onSelectClient(created.id);
        setIsCreatingInline(false);
        setNewClientName("");
        setNewClientPhone("");
        setIsOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const startInlineAdd = (initialName: string = "") => {
    setNewClientName(initialName);
    setNewClientPhone("");
    setIsCreatingInline(true);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-theme-input border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text flex items-center justify-between cursor-pointer hover:border-blue-500 transition-all shadow-sm"
      >
        <div className="flex items-center gap-2 truncate">
          <i className="fa-solid fa-user-tie text-blue-500"></i>
          {selectedClient ? (
            <span className="font-semibold text-theme-text truncate">
              {selectedClient.name}
              {selectedClient.company ? ` (${selectedClient.company})` : ""}
            </span>
          ) : (
            <span className="text-theme-textMuted">{t("noClientOption")}</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {selectedClient && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectClient(undefined);
              }}
              className="text-theme-textMuted hover:text-rose-500 p-0.5"
            >
              <i className="fa-solid fa-xmark text-xs"></i>
            </button>
          )}
          <i className={`fa-solid fa-chevron-${isOpen ? "up" : "down"} text-[10px] text-theme-textMuted transition-transform`}></i>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-theme-card border border-theme-border rounded-xl shadow-xl overflow-hidden animate-fade-in text-xs">
          {!isCreatingInline ? (
            <>
              {/* Search Box */}
              <div className="p-2 border-b border-theme-border bg-theme-elevated flex items-center gap-2">
                <i className="fa-solid fa-magnifying-glass text-theme-textMuted text-xs ml-1"></i>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("clientSearchPlaceholder")}
                  className="w-full bg-transparent border-none text-xs text-theme-text placeholder-theme-textMuted focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-theme-textMuted hover:text-theme-text p-1"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
              </div>

              {/* Client Options List */}
              <div className="max-h-52 overflow-y-auto divide-y divide-theme-borderSubtle">
                {/* No Client / Reset Option */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectClient(undefined);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-start flex items-center justify-between hover:bg-theme-hover transition-colors ${
                    !selectedClientId ? "bg-blue-500/10 text-blue-600 font-bold" : "text-theme-textSecondary"
                  }`}
                >
                  <span className="italic">{t("noClientOption")}</span>
                  {!selectedClientId && <i className="fa-solid fa-check text-xs text-blue-500"></i>}
                </button>

                {filteredClients.map((client) => {
                  const isSelected = client.id === selectedClientId;
                  return (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => {
                        onSelectClient(client.id);
                        setIsOpen(false);
                        setSearchQuery("");
                      }}
                      className={`w-full px-3 py-2.5 text-start flex items-center justify-between hover:bg-theme-hover transition-colors ${
                        isSelected ? "bg-blue-500/10 text-blue-600 font-bold" : "text-theme-text"
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-medium truncate">{client.name}</div>
                        <div className="flex items-center gap-2 text-[10px] text-theme-textMuted mt-0.5">
                          {client.company && <span>{client.company}</span>}
                          {client.phone && <span dir="ltr">{client.phone}</span>}
                        </div>
                      </div>
                      {isSelected && <i className="fa-solid fa-check text-xs text-blue-500 shrink-0"></i>}
                    </button>
                  );
                })}

                {filteredClients.length === 0 && (
                  <div className="p-3 text-center text-theme-textMuted text-xs">
                    {lang === "ar" ? "لا توجد نتائج مطابقة" : "No clients match your search"}
                  </div>
                )}
              </div>

              {/* Inline Add Client Trigger Footer */}
              <div className="p-2 border-t border-theme-border bg-theme-elevated">
                <button
                  type="button"
                  onClick={() => startInlineAdd(searchQuery)}
                  className="w-full py-2 px-3 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 border border-blue-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <i className="fa-solid fa-user-plus text-xs"></i>
                  <span>
                    {searchQuery
                      ? `${t("addNewClientOption")} "${searchQuery}"`
                      : t("addNewClientOption")}
                  </span>
                </button>
              </div>
            </>
          ) : (
            /* Inline Quick Create Form */
            <form onSubmit={handleCreate} className="p-3 space-y-2.5 bg-theme-card">
              <div className="flex items-center justify-between pb-1 border-b border-theme-border">
                <span className="font-bold text-xs text-theme-text flex items-center gap-1.5">
                  <i className="fa-solid fa-user-plus text-blue-500"></i>
                  <span>{t("clientModalTitle")}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingInline(false)}
                  className="text-theme-textMuted hover:text-theme-text"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-theme-textSecondary mb-1">
                  {t("clientNameLabel")}
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder={t("clientNamePlaceholder")}
                  className="w-full bg-theme-input border border-theme-border rounded-lg px-2.5 py-1.5 text-xs text-theme-text focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-theme-textSecondary mb-1">
                  {t("clientPhoneLabel")}
                </label>
                <input
                  type="text"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="010xxxxxxxx"
                  dir="ltr"
                  className="w-full bg-theme-input border border-theme-border rounded-lg px-2.5 py-1.5 text-xs text-theme-text focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreatingInline(false)}
                  className="px-3 py-1 rounded-lg bg-theme-hover text-theme-textSecondary text-xs"
                >
                  {t("cancelBtn")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newClientName.trim()}
                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold disabled:opacity-50"
                >
                  {isSubmitting ? "..." : t("saveClientBtn")}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
