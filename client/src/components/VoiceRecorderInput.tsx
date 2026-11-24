import React, { useState, useRef, useEffect } from "react";
import { TaskAudioPlayer } from "./TaskAudioPlayer";
import { useI18n } from "../i18n";

interface VoiceRecorderInputProps {
  audioUrl?: string | null;
  onAudioChange: (url: string | null) => void;
}

export const VoiceRecorderInput: React.FC<VoiceRecorderInputProps> = ({
  audioUrl,
  onAudioChange
}) => {
  const { lang } = useI18n();
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up timer and recorder on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    setErrorMessage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMessage(
          lang === "ar"
            ? "المتصفح لا يدعم التسجيل الصوتي المباشر."
            : "Direct audio recording is not supported on this browser."
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // Determine supported mime type
      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
        mimeType = "audio/ogg;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all mic tracks
        stream.getTracks().forEach((track) => track.stop());
        if (timerRef.current) clearInterval(timerRef.current);

        if (audioChunksRef.current.length === 0) {
          setIsRecording(false);
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await uploadAudioBlob(audioBlob);
        setIsRecording(false);
      };

      mediaRecorder.start(250); // collect chunks every 250ms
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Mic access error:", err);
      setErrorMessage(
        lang === "ar"
          ? "تعذر الوصول للميكروفون. يرجى التأكد من السماح بالوصول في إعدادات المتصفح."
          : "Could not access microphone. Please check permissions."
      );
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current) {
      // Discard chunks before stopping
      audioChunksRef.current = [];
      mediaRecorderRef.current.stream?.getTracks().forEach((t) => t.stop());
      if (mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    }
    setIsRecording(false);
    setRecordDuration(0);
  };

  const uploadAudioBlob = async (blob: Blob) => {
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const base64Data = await base64Promise;

      const res = await fetch("/api/tasks/upload-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: base64Data })
      });

      if (res.ok) {
        const data = await res.json();
        onAudioChange(data.url);
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMessage(
          errData.error ||
            (lang === "ar"
              ? "فشل رفع الملف الصوتي، تأكد من الصيغة والحجم."
              : "Failed to upload audio.")
        );
      }
    } catch (err) {
      console.error("Audio upload error:", err);
      setErrorMessage(
        lang === "ar"
          ? "حدث خطأ أثناء معالجة ورفع الملف الصوتي."
          : "Error uploading audio."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAudioBlob(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="p-3.5 rounded-2xl bg-theme-elevated/70 border border-theme-border space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-theme-text flex items-center gap-1.5">
          <i className="fa-solid fa-microphone text-rose-500 text-xs"></i>
          <span>{lang === "ar" ? "تسجيل صوتي (Voice Note)" : "Voice Note"}</span>
          {audioUrl && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          )}
        </span>
        <span className="text-[10px] text-theme-textMuted">
          {lang === "ar" ? "سجل فويس أو ارفع ملف صوتي" : "Record voice or upload audio"}
        </span>
      </div>

      {errorMessage && (
        <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
          <i className="fa-solid fa-circle-exclamation text-xs shrink-0"></i>
          <span className="flex-1">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-theme-textMuted hover:text-rose-500"
          >
            <i className="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>
      )}

      {/* Hidden Audio File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* When audio is attached */}
      {audioUrl && !isRecording && (
        <div className="space-y-2">
          <TaskAudioPlayer
            audioUrl={audioUrl}
            variant="full"
            onDelete={() => onAudioChange(null)}
          />
        </div>
      )}

      {/* When recording is active */}
      {isRecording && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <span className="text-xs font-bold text-rose-500 font-mono">
              {lang === "ar" ? "جاري التسجيل:" : "Recording:"} {formatSecs(recordDuration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={stopRecording}
              className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <i className="fa-solid fa-circle-stop text-[11px]"></i>
              <span>{lang === "ar" ? "إيقاف وحفظ" : "Stop & Save"}</span>
            </button>
            <button
              type="button"
              onClick={cancelRecording}
              className="px-2.5 py-1.5 rounded-lg bg-theme-elevated hover:bg-theme-hover text-theme-textSecondary text-xs transition"
            >
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </div>
      )}

      {/* When uploading */}
      {isUploading && (
        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center gap-2 text-xs text-blue-400 animate-pulse">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <span>
            {lang === "ar" ? "جاري معالجة وحفظ الملف الصوتي..." : "Processing and saving audio file..."}
          </span>
        </div>
      )}

      {/* Idle state: Show Record & Upload buttons */}
      {!audioUrl && !isRecording && !isUploading && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={startRecording}
            className="py-2 px-3 rounded-xl border border-rose-500/30 hover:border-rose-500 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-xs"
          >
            <i className="fa-solid fa-microphone text-xs"></i>
            <span>{lang === "ar" ? "تسجيل صوتي" : "Record Voice"}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-2 px-3 rounded-xl border border-theme-border hover:border-blue-500/40 bg-theme-card hover:bg-theme-hover text-theme-textSecondary hover:text-theme-text text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-xs"
          >
            <i className="fa-solid fa-file-audio text-blue-500 text-xs"></i>
            <span>{lang === "ar" ? "رفع ملف صوتي" : "Upload Audio"}</span>
          </button>
        </div>
      )}
    </div>
  );
};
