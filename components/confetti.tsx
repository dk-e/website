"use client";
import confetti from "canvas-confetti";

const ConfettiText = ({ text, emoji, scalar = 1 }: any) => {
  const handleMouseEnter = () => {
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

  return <span onMouseEnter={handleMouseEnter}>{text}</span>;
};

export default ConfettiText;
