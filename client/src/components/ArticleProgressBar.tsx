import { useEffect, useState } from "react";

export default function ArticleProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId: number;

    const update = () => {
      const articleEl = document.getElementById("article-body");
      if (!articleEl) return;

      const { top, height } = articleEl.getBoundingClientRect();
      const windowH = window.innerHeight;

      // How far into the article we've scrolled
      const scrolled = Math.max(0, -top);
      const total = Math.max(1, height - windowH);
      const pct = Math.min(100, Math.round((scrolled / total) * 100));
      setProgress(pct);
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (progress === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
        height: "3px",
        width: `${progress}%`,
        background: "#E8A020",
        transition: "width 0.1s linear",
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}
