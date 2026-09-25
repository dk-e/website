"use client";

import { useEffect, useRef, type PointerEvent } from "react";

type Particle = {
  x: number;
  size: number;
  rotation: number;
  duration: number;
  delay: number;
};

const random = (min: number, max: number) => Math.random() * (max - min) + min;
const spriteCache = new Map<string, HTMLCanvasElement>();

const FallingFlags = ({ text, emoji }: { text: string; emoji: string }) => {
  const animation = useRef<(() => void) | null>(null);

  useEffect(() => () => animation.current?.(), []);

  const handlePointerEnter = (event: PointerEvent<HTMLSpanElement>) => {
    if (
      event.pointerType !== "mouse" ||
      !window.matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    animation.current?.();

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:50";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);

    let sprite = spriteCache.get(emoji);
    if (!sprite) {
      sprite = document.createElement("canvas");
      sprite.width = sprite.height = 128;
      const spriteContext = sprite.getContext("2d");
      if (!spriteContext) {
        canvas.remove();
        return;
      }
      spriteContext.font = '104px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      spriteContext.textAlign = "center";
      spriteContext.textBaseline = "middle";
      spriteContext.fillText(emoji, 64, 68);
      spriteCache.set(emoji, sprite);
    }

    let width = window.innerWidth;
    let height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = Array.from({ length: 40 }, () => ({
      x: Math.random(),
      size: random(34, 54),
      rotation: random(0, Math.PI * 2),
      duration: random(3800, 5400),
      delay: random(0, 2200),
    }));
    const endTime = Math.max(...particles.map(({ delay, duration }) => delay + duration));
    let frame = 0;
    let startTime: number | null = null;

    const stop = () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      canvas.remove();
      if (animation.current === stop) animation.current = null;
    };
    animation.current = stop;

    const draw = (time: number) => {
      startTime ??= time;
      const elapsed = time - startTime;
      context.clearRect(0, 0, width, height);

      for (const particle of particles) {
        const progress = (elapsed - particle.delay) / particle.duration;
        if (progress < 0 || progress > 1) continue;

        context.save();
        context.globalAlpha = 1 - progress;
        context.translate(particle.x * width, -60 + progress * (height + 120));
        context.rotate(particle.rotation + progress * Math.PI * 4);
        context.drawImage(sprite, -particle.size / 2, -particle.size / 2, particle.size, particle.size);
        context.restore();
      }

      if (elapsed < endTime) frame = requestAnimationFrame(draw);
      else stop();
    };
    frame = requestAnimationFrame(draw);
  };

  return <span onPointerEnter={handlePointerEnter}>{text}</span>;
};

export default FallingFlags;
