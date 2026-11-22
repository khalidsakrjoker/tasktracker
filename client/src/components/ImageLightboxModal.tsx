import React, { useEffect } from "react";

interface ImageLightboxModalProps {
  imageUrl: string | null;
  onClose: () => void;
  title?: string;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  imageUrl,
  onClose,
  title
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!imageUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in cursor-zoom-out"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[90vh] bg-theme-card border border-theme-border rounded-2xl overflow-hidden shadow-2xl flex flex-col cursor-default animate-scale-up"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-theme-elevated border-b border-theme-border">
          <span className="text-xs font-semibold text-theme-text truncate max-w-xs">
            {title || "Image Preview / معاينة الصورة"}
          </span>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs px-2.5 py-1 rounded-lg bg-theme-card hover:bg-theme-hover border border-theme-border text-theme-text flex items-center gap-1.5 transition"
              title="Open full in new tab"
            >
              <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
              <span className="text-[11px]">فتح بنافذة كاملة</span>
            </a>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-theme-hover hover:bg-rose-500/20 text-theme-textMuted hover:text-rose-500 flex items-center justify-center transition"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
        </div>

        {/* Image Content */}
        <div className="p-2 flex items-center justify-center overflow-auto max-h-[82vh] bg-black/30">
          <img
            src={imageUrl}
            alt="Preview"
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};
