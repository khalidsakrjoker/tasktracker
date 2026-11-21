import React, { useState } from "react";
import { useI18n } from "../i18n";

interface PinLockModalProps {
  isOpen: boolean;
  onSuccess: (token: string) => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({ isOpen, onSuccess }) => {
  const { t } = useI18n();
  const [pin, setPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6) {
      setErrorMsg(t("loginPinLengthError"));
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin })
      });

      const data = await res.json();

      if (res.status === 403) {
        setIsLocked(true);
        setErrorMsg(t("loginBlockedTitle"));
      } else if (!res.ok) {
        setErrorMsg(data.message || t("loginPinIncorrect"));
      } else {
        onSuccess(data.token);
      }
    } catch {
      setErrorMsg(t("loginNetworkError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm p-8 rounded-3xl bg-theme-card border border-theme-border shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 mx-auto flex items-center justify-center text-white text-2xl shadow-xl shadow-blue-500/20">
          <i className={`fa-solid ${isLocked ? "fa-shield-virus text-rose-300" : "fa-lock"}`}></i>
        </div>

        <div>
          <h2 className="text-xl font-bold text-theme-text tracking-tight">{t("loginSystemTitle")}</h2>
          <p className="text-xs text-theme-textMuted mt-1">{t("loginPinSubtitle")}</p>
        </div>

        {isLocked ? (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs space-y-2 text-start">
            <div className="flex items-center gap-2 font-bold text-rose-500">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>{t("loginBlockedTitle")}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-theme-textSecondary">
              {t("loginBlockedNotice")}
            </p>
            <div className="bg-theme-elevated p-2 rounded-xl font-mono text-center text-blue-600 select-all font-bold border border-theme-border">
              {t("loginUnblockInstruction")}
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                maxLength={6}
                autoFocus
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder={t("loginPinPlaceholder")}
                className="w-full bg-theme-input border border-theme-border rounded-2xl py-3 text-center text-2xl tracking-[0.5em] text-theme-text focus:outline-none focus:border-blue-500 font-mono shadow-inner"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-500 font-semibold animate-shake">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || pin.length !== 6}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isLoading ? t("loginVerifying") : t("loginSubmit")}
            </button>
          </form>
        )}

        <div className="pt-2 text-[11px] text-theme-textMuted flex items-center justify-center gap-2">
          <i className="fa-solid fa-fingerprint text-xs text-blue-500"></i>
          <span>{t("loginEncryptionNote")}</span>
        </div>
      </div>
    </div>
  );
};
