"use client";
import React, { useRef, useEffect, useState, createElement, useMemo, useCallback, memo } from "react";

export enum Tag { H1="h1", H2="h2", H3="h3", P="p" }

type VaporizeTextCycleProps = {
  texts: string[];
  font?: { fontFamily?: string; fontSize?: string; fontWeight?: number };
  color?: string;
  spread?: number;
  density?: number;
  animation?: { vaporizeDuration?: number; fadeInDuration?: number; waitDuration?: number };
  direction?: "left-to-right" | "right-to-left";
  alignment?: "left" | "center" | "right";
  tag?: Tag;
};

type Particle = {
  x: number; y: number; originalX: number; originalY: number;
  color: string; opacity: number; originalAlpha: number;
  velocityX: number; velocityY: number; angle: number; speed: number;
  shouldFadeQuickly?: boolean;
};
type TextBoundaries = { left: number; right: number; width: number };
declare global { interface HTMLCanvasElement { textBoundaries?: TextBoundaries } }

function useIsInView(ref: React.RefObject<HTMLElement>) {
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([e]) => setIsInView(e.isIntersecting), { threshold: 0, rootMargin: '50px' });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return isInView;
}

function transformValue(input: number, inputRange: number[], outputRange: number[], clamp = false): number {
  const [inputMin, inputMax] = inputRange, [outputMin, outputMax] = outputRange;
  const progress = (input - inputMin) / (inputMax - inputMin);
  let result = outputMin + progress * (outputMax - outputMin);
  if (clamp) result = outputMax > outputMin ? Math.min(Math.max(result, outputMin), outputMax) : Math.min(Math.max(result, outputMax), outputMin);
  return result;
}

function calculateVaporizeSpread(fontSize: number): number {
  const size = typeof fontSize === "string" ? parseInt(fontSize as string) : fontSize;
  const points = [{ size: 20, spread: 0.2 }, { size: 50, spread: 0.5 }, { size: 100, spread: 1.5 }];
  if (size <= points[0].size) return points[0].spread;
  if (size >= points[points.length - 1].size) return points[points.length - 1].spread;
  let i = 0;
  while (i < points.length - 1 && points[i + 1].size < size) i++;
  return points[i].spread + (size - points[i].size) * (points[i + 1].spread - points[i].spread) / (points[i + 1].size - points[i].size);
}

function parseColor(color: string): string {
  const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbaMatch) { const [,r,g,b,a] = rgbaMatch; return `rgba(${r},${g},${b},${a})`; }
  if (rgbMatch) { const [,r,g,b] = rgbMatch; return `rgba(${r},${g},${b},1)`; }
  return "rgba(0,0,0,1)";
}

function resetParticles(particles: Particle[]) {
  particles.forEach(p => { p.x=p.originalX; p.y=p.originalY; p.opacity=p.originalAlpha; p.speed=0; p.velocityX=0; p.velocityY=0; });
}

function renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[], globalDpr: number) {
  ctx.save(); ctx.scale(globalDpr, globalDpr);
  particles.forEach(p => {
    if (p.opacity > 0) { ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${p.opacity})`); ctx.fillRect(p.x / globalDpr, p.y / globalDpr, 1, 1); }
  });
  ctx.restore();
}

function updateParticles(particles: Particle[], vaporizeX: number, deltaTime: number, SPREAD: number, VAPORIZE_DURATION: number, direction: string, density: number): boolean {
  let allVaporized = true;
  particles.forEach(p => {
    const shouldVaporize = direction === "left-to-right" ? p.originalX <= vaporizeX : p.originalX >= vaporizeX;
    if (shouldVaporize) {
      if (p.speed === 0) {
        p.angle = Math.random() * Math.PI * 2;
        p.speed = (Math.random() * 1 + 0.5) * SPREAD;
        p.velocityX = Math.cos(p.angle) * p.speed;
        p.velocityY = Math.sin(p.angle) * p.speed;
        p.shouldFadeQuickly = Math.random() > density;
      }
      if (p.shouldFadeQuickly) {
        p.opacity = Math.max(0, p.opacity - deltaTime);
      } else {
        const dx = p.originalX - p.x, dy = p.originalY - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const damp = Math.max(0.95, 1 - dist / (100 * SPREAD));
        const rnd = SPREAD * 3;
        p.velocityX = (p.velocityX + (Math.random()-0.5)*rnd + dx*0.002) * damp;
        p.velocityY = (p.velocityY + (Math.random()-0.5)*rnd + dy*0.002) * damp;
        const maxV = SPREAD * 2, curV = Math.sqrt(p.velocityX*p.velocityX + p.velocityY*p.velocityY);
        if (curV > maxV) { p.velocityX *= maxV/curV; p.velocityY *= maxV/curV; }
        p.x += p.velocityX * deltaTime * 20;
        p.y += p.velocityY * deltaTime * 10;
        p.opacity = Math.max(0, p.opacity - deltaTime * 0.25 * (2000 / VAPORIZE_DURATION));
      }
      if (p.opacity > 0.01) allVaporized = false;
    } else { allVaporized = false; }
  });
  return allVaporized;
}

function createParticles(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, text: string, textX: number, textY: number, font: string, color: string, alignment: string) {
  const particles: Particle[] = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color; ctx.font = font;
  ctx.textAlign = alignment as CanvasTextAlign; ctx.textBaseline = "middle";
  ctx.imageSmoothingQuality = "high"; ctx.imageSmoothingEnabled = true;
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  let textLeft = alignment === "center" ? textX - textWidth/2 : alignment === "left" ? textX : textX - textWidth;
  const textBoundaries: TextBoundaries = { left: textLeft, right: textLeft + textWidth, width: textWidth };
  ctx.fillText(text, textX, textY);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const currentDPR = canvas.width / parseInt(canvas.style.width);
  const sampleRate = Math.max(1, Math.round(currentDPR / 3));
  for (let y = 0; y < canvas.height; y += sampleRate) {
    for (let x = 0; x < canvas.width; x += sampleRate) {
      const idx = (y * canvas.width + x) * 4;
      if (data[idx+3] > 0) {
        const alpha = data[idx+3] / 255 * (sampleRate / currentDPR);
        particles.push({ x, y, originalX: x, originalY: y, color: `rgba(${data[idx]},${data[idx+1]},${data[idx+2]},${alpha})`, opacity: alpha, originalAlpha: alpha, velocityX: 0, velocityY: 0, angle: 0, speed: 0 });
      }
    }
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  return { particles, textBoundaries };
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  if (words.length <= 1) return [text];
  const lines: string[] = [];
  let current = words[0];
  for (let i = 1; i < words.length; i++) {
    const test = current + ' ' + words[i];
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

function renderCanvas({ framerProps, canvasRef, wrapperSize, particlesRef, globalDpr, currentTextIndex }: any) {
  const canvas = canvasRef.current;
  if (!canvas || !wrapperSize.width || !wrapperSize.height) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = wrapperSize;
  canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
  canvas.width = Math.floor(width * globalDpr); canvas.height = Math.floor(height * globalDpr);

  const fullText = framerProps.texts[currentTextIndex] || "";
  const maxW = canvas.width * 0.97;
  const fw = framerProps.font?.fontWeight ?? 400;
  const ff = framerProps.font?.fontFamily ?? "sans-serif";

  /* Find largest font size where ALL wrapped lines fit both horizontally AND vertically */
  const maxH = canvas.height * 0.92;
  let fsDpr = parseInt(framerProps.font?.fontSize?.replace("px","") || "50") * globalDpr;
  let lines: string[] = [fullText];
  while (fsDpr > 6 * globalDpr) {
    const fs = `${fw} ${fsDpr}px ${ff}`;
    ctx.font = fs;
    lines = wrapText(ctx, fullText, maxW);
    const maxLine = lines.reduce((a, l) => Math.max(a, ctx.measureText(l).width), 0);
    const totalH = lines.length * fsDpr * 1.35;
    if (maxLine <= maxW && totalH <= maxH) break;
    fsDpr -= globalDpr * 0.5;
  }
  const font = `${fw} ${fsDpr}px ${ff}`;
  const color = parseColor(framerProps.color ?? "rgb(153,153,153)");
  const textX = framerProps.alignment === "center" ? canvas.width / 2 : framerProps.alignment === "left" ? 0 : canvas.width;

  /* Distribute lines vertically, centered in the canvas */
  const lineH = fsDpr * 1.35;
  const totalH = lines.length * lineH;
  const startY = (canvas.height - totalH) / 2 + lineH / 2;

  let allParticles: Particle[] = [];
  let firstBoundaries = { left: 0, right: 0, width: 0 };
  for (let i = 0; i < lines.length; i++) {
    const textY = startY + i * lineH;
    const { particles, textBoundaries } = createParticles(ctx, canvas, lines[i], textX, textY, font, color, framerProps.alignment || "center");
    allParticles = allParticles.concat(particles);
    if (i === 0) firstBoundaries = textBoundaries;
  }
  particlesRef.current = allParticles;
  canvas.textBoundaries = firstBoundaries;
}

const SeoElement = memo(({ tag = Tag.P, texts }: { tag: Tag; texts: string[] }) =>
  createElement(tag, { style: { position:"absolute",width:0,height:0,overflow:"hidden",userSelect:"none",pointerEvents:"none" } as React.CSSProperties }, texts?.join(" ") ?? "")
);

export default function VaporizeTextCycle({
  texts = ["Text"], font = { fontFamily: "sans-serif", fontSize: "50px", fontWeight: 700 },
  color = "rgb(0,0,0)", spread = 5, density = 5,
  animation = { vaporizeDuration: 2, fadeInDuration: 1, waitDuration: 0.5 },
  direction = "left-to-right", alignment = "center", tag = Tag.H2,
}: VaporizeTextCycleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isInView = useIsInView(wrapperRef as React.RefObject<HTMLElement>);
  const lastFontRef = useRef<string | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [animationState, setAnimationState] = useState<"static"|"vaporizing"|"fadingIn"|"waiting">("static");
  const vaporizeProgressRef = useRef(0);
  const fadeOpacityRef = useRef(0);
  const [wrapperSize, setWrapperSize] = useState({ width: 0, height: 0 });
  const transformedDensity = transformValue(density, [0,10], [0.3,1], true);
  const globalDpr = useMemo(() => (typeof window !== "undefined" ? window.devicePixelRatio * 1.5 : 1), []);
  const animationDurations = useMemo(() => ({
    VAPORIZE_DURATION: (animation.vaporizeDuration ?? 2) * 1000,
    FADE_IN_DURATION: (animation.fadeInDuration ?? 1) * 1000,
    WAIT_DURATION: (animation.waitDuration ?? 0.5) * 1000,
  }), [animation.vaporizeDuration, animation.fadeInDuration, animation.waitDuration]);
  const fontConfig = useMemo(() => {
    const fontSize = parseInt(font.fontSize?.replace("px","") || "50");
    const VAPORIZE_SPREAD = calculateVaporizeSpread(fontSize);
    return { fontSize, VAPORIZE_SPREAD, MULTIPLIED_VAPORIZE_SPREAD: VAPORIZE_SPREAD * spread };
  }, [font.fontSize, spread]);

  useEffect(() => {
    if (isInView) { const t = setTimeout(() => setAnimationState("vaporizing"), 800); return () => clearTimeout(t); }
    else { setAnimationState("static"); if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); }
  }, [isInView]);

  useEffect(() => {
    if (!isInView) return;
    let lastTime = performance.now(), frameId: number;
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || !particlesRef.current.length) { frameId = requestAnimationFrame(animate); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      switch (animationState) {
        case "static": renderParticles(ctx, particlesRef.current, globalDpr); break;
        case "vaporizing": {
          vaporizeProgressRef.current += deltaTime * 100 / (animationDurations.VAPORIZE_DURATION / 1000);
          const tb = canvas.textBoundaries;
          if (!tb) break;
          const progress = Math.min(100, vaporizeProgressRef.current);
          const vaporizeX = direction === "left-to-right" ? tb.left + tb.width * progress / 100 : tb.right - tb.width * progress / 100;
          const allVaporized = updateParticles(particlesRef.current, vaporizeX, deltaTime, fontConfig.MULTIPLIED_VAPORIZE_SPREAD, animationDurations.VAPORIZE_DURATION, direction, transformedDensity);
          renderParticles(ctx, particlesRef.current, globalDpr);
          if (vaporizeProgressRef.current >= 100 && allVaporized) {
            setCurrentTextIndex(prev => (prev + 1) % texts.length);
            setAnimationState("fadingIn"); fadeOpacityRef.current = 0;
          }
          break;
        }
        case "fadingIn": {
          fadeOpacityRef.current += deltaTime * 1000 / animationDurations.FADE_IN_DURATION;
          ctx.save(); ctx.scale(globalDpr, globalDpr);
          particlesRef.current.forEach(p => {
            p.x = p.originalX; p.y = p.originalY;
            const opacity = Math.min(fadeOpacityRef.current, 1) * p.originalAlpha;
            ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${opacity})`);
            ctx.fillRect(p.x / globalDpr, p.y / globalDpr, 1, 1);
          });
          ctx.restore();
          if (fadeOpacityRef.current >= 1) {
            setAnimationState("waiting");
            setTimeout(() => { setAnimationState("vaporizing"); vaporizeProgressRef.current = 0; resetParticles(particlesRef.current); }, animationDurations.WAIT_DURATION);
          }
          break;
        }
        case "waiting": renderParticles(ctx, particlesRef.current, globalDpr); break;
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [animationState, isInView, texts.length, direction, globalDpr, animationDurations, fontConfig.MULTIPLIED_VAPORIZE_SPREAD, transformedDensity]);

  useEffect(() => {
    renderCanvas({ framerProps: { texts, font, color, alignment }, canvasRef, wrapperSize, particlesRef, globalDpr, currentTextIndex, transformedDensity });
    const currentFont = font.fontFamily || "sans-serif";
    if (currentFont !== lastFontRef.current) {
      lastFontRef.current = currentFont;
      const t = setTimeout(() => renderCanvas({ framerProps: { texts, font, color, alignment }, canvasRef, wrapperSize, particlesRef, globalDpr, currentTextIndex, transformedDensity }), 1000);
      return () => clearTimeout(t);
    }
  }, [texts, font, color, alignment, wrapperSize, currentTextIndex, globalDpr, transformedDensity]);

  useEffect(() => {
    const container = wrapperRef.current;
    if (!container) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) { const { width, height } = entry.contentRect; setWrapperSize({ width, height }); }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setWrapperSize({ width: rect.width, height: rect.height });
    }
  }, []);

  return (
    <div ref={wrapperRef} style={{ width:"100%", height:"100%", pointerEvents:"none" }}>
      <canvas ref={canvasRef} style={{ minWidth:"30px", minHeight:"20px", pointerEvents:"none" }} />
      <SeoElement tag={tag} texts={texts} />
    </div>
  );
}
