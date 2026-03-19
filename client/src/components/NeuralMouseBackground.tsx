import React, { useState, useEffect, useRef } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export default function NeuralMouseBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out mouse movement
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Relative to window
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Dynamic Cursor Aura */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.12] mix-blend-screen"
        style={{
          x: smoothX,
          y: smoothY,
          left: -300,
          top: -300,
          background: "radial-gradient(circle at center, #E8A020 0%, transparent 65%)",
        }}
      />
      
      {/* Global Neural Pulse (Static Layer) */}
      <div className="absolute inset-0 neural-grid opacity-[0.05]" />
    </div>
  );
}
