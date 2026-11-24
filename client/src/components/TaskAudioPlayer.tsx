import React, { useState, useRef, useEffect } from "react";

interface TaskAudioPlayerProps {
  audioUrl: string;
  variant?: "compact" | "full";
  title?: string;
  onDelete?: () => void;
}

export const TaskAudioPlayer: React.FC<TaskAudioPlayerProps> = ({
  audioUrl,
  variant = "compact",
  onDelete
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setHasError(false);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleError = () => {
      setHasError(true);
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [audioUrl]);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.playbackRate = playbackRate;
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn("Audio play prevented:", err);
        setIsPlaying(false);
      });
    }
  };

  const cycleSpeed = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const rates = [1, 1.5, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (hasError) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 font-mono">
        <i className="fa-solid fa-triangle-exclamation text-[10px]"></i>
        <span>تسجيل صوتي (تعذر التحميل)</span>
      </div>
    );
  }

  // Compact variant for task cards
  if (variant === "compact") {
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${
          isPlaying
            ? "bg-blue-600/20 border-blue-500/60 text-blue-400 shadow-sm shadow-blue-500/10"
            : "bg-theme-elevated/90 hover:bg-theme-elevated border-theme-border text-theme-textSecondary"
        }`}
      >
        <audio ref={audioRef} src={audioUrl} preload="metadata" />

        <button
          type="button"
          onClick={togglePlay}
          className="w-5 h-5 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shrink-0"
          title={isPlaying ? "إيقاف مؤقت" : "تشغيل التسجيل الصوتي"}
        >
          <i className={`fa-solid ${isPlaying ? "fa-pause" : "fa-play"} text-[8px] ${!isPlaying && "ps-0.5"}`}></i>
        </button>

        <span className="text-[10px] font-mono font-bold text-theme-text shrink-0">
          {isPlaying ? formatTime(currentTime) : (duration > 0 ? formatTime(duration) : "0:00")}
        </span>

        {isPlaying && (
          <div className="flex items-center gap-0.5 shrink-0">
            <span className="w-1 h-2.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1 h-3.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1 h-2 bg-blue-400 rounded-full animate-bounce"></span>
          </div>
        )}

        <button
          type="button"
          onClick={cycleSpeed}
          className="text-[9px] font-mono px-1 py-0.2 rounded bg-theme-input border border-theme-border text-theme-textMuted hover:text-blue-400 hover:border-blue-500/40 transition shrink-0"
          title="تغيير سرعة الصوت"
        >
          {playbackRate}x
        </button>

        <i className="fa-solid fa-microphone-lines text-[10px] text-blue-400/80 ms-0.5 shrink-0"></i>
      </div>
    );
  }

  // Full variant for Drawers & Modals
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="p-3 rounded-2xl bg-theme-card border border-theme-border space-y-2 shadow-sm"
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all shadow-md shadow-blue-500/20 active:scale-95 shrink-0"
          >
            <i className={`fa-solid ${isPlaying ? "fa-pause" : "fa-play"} text-xs ${!isPlaying && "ps-0.5"}`}></i>
          </button>

          <div>
            <span className="text-xs font-bold text-theme-text flex items-center gap-1.5">
              <i className="fa-solid fa-microphone-lines text-blue-500 text-xs"></i>
              <span>تسجيل صوتي مرفق</span>
            </span>
            <div className="text-[10px] font-mono text-theme-textMuted">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={cycleSpeed}
            className="text-[11px] font-mono font-bold px-2 py-1 rounded-lg bg-theme-elevated border border-theme-border text-theme-textSecondary hover:text-blue-500 hover:border-blue-500/40 transition"
            title="سرعة التشغيل"
          >
            {playbackRate}x
          </button>

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 rounded-lg bg-theme-elevated hover:bg-rose-500/20 text-theme-textMuted hover:text-rose-500 border border-theme-border transition text-xs"
              title="حذف التسجيل الصوتي"
            >
              <i className="fa-solid fa-trash-can"></i>
            </button>
          )}
        </div>
      </div>

      {/* Scrubber Timeline Bar */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-theme-elevated rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>
    </div>
  );
};
