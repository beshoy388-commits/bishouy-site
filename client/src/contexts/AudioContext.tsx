import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface AudioContextType {
  isPlaying: boolean;
  isPaused: boolean;
  currentArticleId: number | null;
  currentTitle: string | null;
  progress: number;
  togglePlay: (articleId: number, title: string, text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (percent: number) => void;
  skipForward: () => void;
  skipBackward: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentArticleId, setCurrentArticleId] = useState<number | null>(null);
  const [currentTitle, setCurrentTitle] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fullTextRef = useRef<string>("");
  const currentCharRef = useRef<number>(0);
  const lastBoundaryTimeRef = useRef<number>(Date.now());
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const stop = () => {
    window.speechSynthesis.cancel();
    if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current);
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentArticleId(null);
    setCurrentTitle(null);
    setProgress(0);
    currentCharRef.current = 0;
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current);
  };

  const resume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      startFallbackTimer();
    } else {
        playFromChar(currentCharRef.current);
    }
  };

  const startFallbackTimer = () => {
      if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current);
      
      // Estimated reading speed: ~14 chars per second at 0.92 rate
      const charsPerSecond = 14; 
      
      fallbackTimerRef.current = setInterval(() => {
          // Only increment if no boundary has been hit recently
          if (Date.now() - lastBoundaryTimeRef.current > 1000 && window.speechSynthesis.speaking) {
              currentCharRef.current += charsPerSecond;
              const p = (currentCharRef.current / fullTextRef.current.length) * 100;
              setProgress(Math.min(p, 99)); // Keep it under 100 until it actually ends
          }
      }, 1000);
  };

  const getBestVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    const googleUS = voices.find(v => v.name.includes("Google") && v.lang.startsWith("en-US"));
    if (googleUS) return googleUS;
    const premium = voices.find(v => v.name.includes("Premium") || v.name.includes("Samantha") || v.name.includes("Daniel"));
    return premium || voices.find(v => v.lang.startsWith("en-US")) || voices[0];
  };

  const playFromChar = (charOffset: number) => {
    window.speechSynthesis.cancel();
    if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current);
    
    const textToSpeak = fullTextRef.current.substring(charOffset);
    if (!textToSpeak.trim()) {
        stop();
        return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const bestVoice = getBestVoice();
    if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang;
    } else {
        utterance.lang = "en-US";
    }

    utterance.rate = 0.92;
    utterance.pitch = 0.95;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      lastBoundaryTimeRef.current = Date.now();
      startFallbackTimer();
    };

    utterance.onend = () => {
      if (!window.speechSynthesis.speaking) stop();
    };

    utterance.onboundary = (e) => {
      lastBoundaryTimeRef.current = Date.now();
      const absoluteIndex = charOffset + e.charIndex;
      currentCharRef.current = absoluteIndex;
      
      const totalLength = fullTextRef.current.length;
      if (totalLength > 0) {
          const p = (absoluteIndex / totalLength) * 100;
          setProgress(Math.min(p, 100));
      }
    };

    utterance.onerror = (e: any) => {
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      stop();
      toast.error("Audio Synthesis Error", { description: "Briefing link lost." });
    };

    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const togglePlay = (articleId: number, title: string, text: string) => {
    if (isPlaying && currentArticleId === articleId) {
      if (isPaused) resume(); else pause();
      return;
    }
    stop();
    fullTextRef.current = text;
    setCurrentArticleId(articleId);
    setCurrentTitle(title);
    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => { playFromChar(0); window.speechSynthesis.onvoiceschanged = null; };
    } else {
        setTimeout(() => playFromChar(0), 50);
    }
  };

  const seek = (percent: number) => {
      const charIndex = Math.floor((percent / 100) * fullTextRef.current.length);
      currentCharRef.current = charIndex;
      setProgress(percent);
      playFromChar(charIndex);
  };

  const skipForward = () => {
      const nextChar = Math.min(currentCharRef.current + 120, fullTextRef.current.length);
      seek((nextChar / fullTextRef.current.length) * 100);
  };

  const skipBackward = () => {
      const prevChar = Math.max(currentCharRef.current - 120, 0);
      seek((prevChar / fullTextRef.current.length) * 100);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current);
    };
  }, []);

  return (
    <AudioContext.Provider value={{ isPlaying, isPaused, currentArticleId, currentTitle, progress, togglePlay, pause, resume, stop, seek, skipForward, skipBackward }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio must be used within AudioProvider");
  return context;
}
