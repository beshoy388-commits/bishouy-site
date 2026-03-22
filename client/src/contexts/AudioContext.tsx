import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface AudioContextType {
  isPlaying: boolean;
  currentArticleId: number | null;
  currentTitle: string | null;
  togglePlay: (articleId: number, title: string, text: string) => void;
  stop: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentArticleId, setCurrentArticleId] = useState<number | null>(null);
  const [currentTitle, setCurrentTitle] = useState<string | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentArticleId(null);
    setCurrentTitle(null);
  };

  const togglePlay = (articleId: number, title: string, text: string) => {
    if (isPlaying && currentArticleId === articleId) {
      stop();
      return;
    }

    // Stop previous
    window.speechSynthesis.cancel();

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsPlaying(true);
        setCurrentArticleId(articleId);
        setCurrentTitle(title);
      };

      utterance.onend = () => {
        stop();
      };

      utterance.onerror = (e) => {
        console.error("Speech Synthesis Error:", e);
        stop();
        toast.error("Audio Synthesis Error", { description: "Failed to initialize Neural Link Audio." });
      };

      synthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }, 50);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <AudioContext.Provider value={{ isPlaying, currentArticleId, currentTitle, togglePlay, stop }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio must be used within AudioProvider");
  return context;
}
