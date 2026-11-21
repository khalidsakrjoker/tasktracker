import React from "react";
import { useI18n } from "../i18n";

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstallPrompt?: () => void;
  hasNativePrompt: boolean;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  onInstallPrompt,
  hasNativePrompt
}) => {
  const { t, lang } = useI18n();

  if (!isOpen) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);
  const isDesktop = !isIOS && !isAndroid;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-theme-card border border-theme-border rounded-3xl p-6 space-y-5 shadow-2xl">
        {/* Header with App Icon */}
        <div className="flex items-center justify-between pb-3 border-b border-theme-border">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <i className="fa-solid fa-bolt-lightning text-lg"></i>
            </div>
            <div>
              <h3 className="text-sm font-bold text-theme-text">{t("installModalTitle")}</h3>
              <p className="text-[11px] text-theme-textMuted">TaskTracker PWA Studio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-theme-elevated hover:bg-theme-hover text-theme-textMuted hover:text-theme-text flex items-center justify-center transition-colors"
          >
            <i className="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        {/* Dynamic Instructions depending on Platform */}
        <div className="space-y-4">
          {hasNativePrompt ? (
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-theme-text space-y-2">
              <p className="text-xs leading-relaxed">
                {isDesktop ? t("installModalDescDesktop") : t("installModalDescMobile")}
              </p>
              <button
                onClick={() => {
                  if (onInstallPrompt) onInstallPrompt();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all mt-2"
              >
                <i className="fa-solid fa-download"></i>
                <span>{t("installModalAction")}</span>
              </button>
            </div>
          ) : isIOS ? (
            <div className="p-4 rounded-2xl bg-theme-elevated border border-theme-border space-y-3 text-xs text-theme-text">
              <div className="font-bold text-blue-500 flex items-center gap-2">
                <i className="fa-brands fa-apple text-base"></i>
                <span>{lang === "ar" ? "خطوات التثبيت على الآيفون (iOS Safari):" : "Installation on iPhone (iOS Safari):"}</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-theme-textSecondary leading-relaxed">
                <li>
                  {lang === "ar" ? "اضغط على زر المشاركة أسفل الشاشة" : "Tap the Share button at the bottom of the screen"} (
                  <i className="fa-solid fa-arrow-up-from-bracket mx-1 text-blue-500"></i>
                  )
                </li>
                <li>
                  {lang === "ar" ? "مرر لأسفل واختر 'إضافة إلى الشاشة الرئيسية'" : "Scroll down and tap 'Add to Home Screen'"} (
                  <i className="fa-regular fa-square-plus mx-1 text-blue-500"></i>
                  )
                </li>
                <li>
                  {lang === "ar" ? "اضغط 'إضافة' (Add) في الزاوية العلوية" : "Tap 'Add' in the top-right corner"}
                </li>
              </ol>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-theme-elevated border border-theme-border space-y-3 text-xs text-theme-text">
              <div className="font-bold text-blue-500 flex items-center gap-2">
                <i className="fa-solid fa-desktop text-sm"></i>
                <span>{lang === "ar" ? "التثبيت المباشر على الكمبيوتر (Windows / Chrome / Edge):" : "Direct Desktop Installation (Windows / Chrome / Edge):"}</span>
              </div>
              <p className="text-[11px] text-theme-textSecondary leading-relaxed">
                {lang === "ar"
                  ? "انظر إلى شريط العنوان في المتصفح بالأعلى (أقصى اليمين أو اليسار)، ستجد أيقونة صغيرة لتثبيت التطبيق على جهازك، اضغط عليها ثم اختر 'تثبيت' ليعمل كبرنامج ديسكتوب مستقل تماماً!"
                  : "Look at your browser's address bar at the top; you will see an Install icon (monitor with a down arrow). Click it and select 'Install' to run as a native desktop application!"}
              </p>
            </div>
          )}

          {/* Desktop Hotkeys Reminder */}
          <div className="p-3 rounded-2xl bg-theme-elevated/60 border border-theme-borderSubtle flex items-center justify-between text-xs">
            <span className="text-[11px] text-theme-textMuted flex items-center gap-1.5">
              <i className="fa-solid fa-keyboard text-blue-500"></i>
              <span>{t("quickCaptureShortcutNote")}</span>
            </span>
            <kbd className="px-2 py-0.5 rounded bg-theme-card border border-theme-border text-[10px] font-mono text-theme-text font-bold shadow-sm">
              Ctrl + N
            </kbd>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-theme-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-theme-elevated hover:bg-theme-hover text-theme-textSecondary text-xs font-semibold transition-colors"
          >
            {t("closeModal")}
          </button>
        </div>
      </div>
    </div>
  );
};
