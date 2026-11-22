import React, { useState, useEffect } from "react";

interface ImageLightboxModalProps {
  imageUrl?: string | null;
  images?: string[];
  initialIndex?: number;
  onClose: () => void;
  title?: string;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  imageUrl,
  images,
  initialIndex = 0,
  onClose,
  title
}) => {
  // Normalize images list
  const allImages = React.useMemo(() => {
    if (images && images.length > 0) return images;
    if (imageUrl) return [imageUrl];
    return [];
  }, [images, imageUrl]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (initialIndex >= 0 && initialIndex < allImages.length) {
      setCurrentIndex(initialIndex);
    } else {
      setCurrentIndex(0);
    }
  }, [initialIndex, allImages]);

  const hasMultiple = allImages.length > 1;

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, allImages.length]);

  if (allImages.length === 0) return null;

  const currentImage = allImages[currentIndex] || allImages[0];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-4 animate-fade-in cursor-zoom-out"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-5xl w-full max-h-[92vh] bg-theme-card border border-theme-border rounded-2xl overflow-hidden shadow-2xl flex flex-col cursor-default animate-scale-up"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-theme-elevated border-b border-theme-border">
          <div className="flex items-center gap-2 max-w-sm truncate">
            <span className="text-xs font-semibold text-theme-text truncate">
              {title || "معاينة الصور / Images"}
            </span>
            {hasMultiple && (
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-mono font-bold">
                {currentIndex + 1} / {allImages.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={currentImage}
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

        {/* Main Image Display Area with Prev/Next Controls */}
        <div className="relative p-2 flex items-center justify-center overflow-hidden max-h-[72vh] min-h-[300px] bg-black/40">
          {hasMultiple && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center transition-all hover:scale-110 shadow-lg active:scale-95"
              title="Previous image"
            >
              <i className="fa-solid fa-chevron-left text-base"></i>
            </button>
          )}

          <img
            key={currentImage}
            src={currentImage}
            alt={`Preview ${currentIndex + 1}`}
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg select-none"
          />

          {hasMultiple && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center transition-all hover:scale-110 shadow-lg active:scale-95"
              title="Next image"
            >
              <i className="fa-solid fa-chevron-right text-base"></i>
            </button>
          )}
        </div>

        {/* Bottom Thumbnail Strip (if multiple images) */}
        {hasMultiple && (
          <div className="px-4 py-2 bg-theme-elevated/90 border-t border-theme-border flex items-center justify-center gap-2 overflow-x-auto">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                  idx === currentIndex
                    ? "border-blue-500 scale-105 shadow-md shadow-blue-500/30 opacity-100"
                    : "border-theme-border opacity-50 hover:opacity-100"
                }`}
              >
                <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
