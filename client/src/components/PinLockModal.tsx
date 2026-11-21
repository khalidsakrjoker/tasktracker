import React, { useState } from "react";

interface PinLockModalProps {
  isOpen: boolean;
  onSuccess: (token: string) => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({ isOpen, onSuccess }) => {
  const [pin, setPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6) {
      setErrorMsg("الرجاء إدخال رمز المرور المكون من 6 أرقام");
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
        setErrorMsg("تم حظر هذا الجهاز بشكل دائم لتجاوز 3 محاولات خاطئة!");
      } else if (!res.ok) {
        setErrorMsg(data.message || "رمز PIN غير صحيح");
      } else {
        onSuccess(data.token);
      }
    } catch {
      setErrorMsg("حدث خطأ في الاتصال بالسيرفر");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-obsidian-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm p-8 rounded-3xl bg-obsidian-900 border border-obsidian-750 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 mx-auto flex items-center justify-center text-white text-2xl shadow-xl shadow-blue-500/20">
          <i className={`fa-solid ${isLocked ? "fa-shield-virus text-rose-300" : "fa-lock"}`}></i>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">نظام إدارة المشروعات</h2>
          <p className="text-xs text-slate-400 mt-1">أدخل رمز الـ PIN المكون من 6 أرقام للوصول المباشر</p>
        </div>

        {isLocked ? (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2 text-right">
            <div className="flex items-center gap-2 font-bold text-rose-400">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>تم تفعيل الحظر الصارم (Hard IP Ban)</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              تم حظر عنوان جهازك من السيرفر تماماً. لفك الحظر فوراً، افتح جروب التليجرام الخاص بك وأرسل:
            </p>
            <div className="bg-obsidian-950 p-2 rounded font-mono text-center text-cyber-blue select-all">
              /unblock IP_ADDRESS
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
                placeholder="••••••"
                className="w-full bg-obsidian-850 border border-obsidian-700 rounded-2xl py-3 text-center text-2xl tracking-[0.5em] text-white focus:outline-none focus:border-cyber-blue font-mono shadow-inner"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 font-semibold animate-shake">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || pin.length !== 6}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isLoading ? "جاري التحقق..." : "تأكيد الدخول"}
            </button>
          </form>
        )}

        <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <i className="fa-solid fa-fingerprint text-xs"></i>
          <span>حماية مشفرة ممتدة 90 يوماً</span>
        </div>
      </div>
    </div>
  );
};
