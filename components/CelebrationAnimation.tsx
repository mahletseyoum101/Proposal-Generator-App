"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export function CelebrationAnimation() {
  useEffect(() => {
    const colors = ["#B8912B", "#4A3A22", "#FAF6EC", "#ffffff"];
    const duration = 2200;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors,
    });
  }, []);

  return null;
}
