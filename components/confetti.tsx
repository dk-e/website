"use client";
import confetti from "canvas-confetti";
import type { PointerEvent } from "react";

const ConfettiText = ({ text, emoji, scalar = 1 }: any) => {
  const handlePointerEnter = (event: PointerEvent<HTMLSpanElement>) => {
    if (
      event.pointerType !== "mouse" ||
      !window.matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }

    const emojiShape = confetti.shapeFromText({
      text: emoji,
      scalar,
    });

    confetti({
      shapes: [emojiShape],
      particleCount: 40,
      spread: 150,
      origin: { y: 0.5 },
      scalar,
    });
  };

  return <span onPointerEnter={handlePointerEnter}>{text}</span>;
};

export default ConfettiText;
