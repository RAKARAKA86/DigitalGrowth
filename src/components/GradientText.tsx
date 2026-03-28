import React, { useState, useCallback, useEffect, useRef } from 'react';
import './GradientText.css';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
  withUnderline?: boolean;
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  style?: React.CSSProperties;
}

export default function GradientText({
  children,
  className = '',
  colors = ['#49769F', '#4E8EA2', '#7BBDE8', '#BDD8E9', '#49769F'],
  animationSpeed = 4,
  showBorder = false,
  withUnderline = false,
  tag = 'span',
  style,
}: GradientTextProps) {
  const progressRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const [bgPosition, setBgPosition] = useState('0% 50%');
  const animationDuration = animationSpeed * 1000;
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (time: number) => {
      if (lastTimeRef.current === null) { lastTimeRef.current = time; }
      const deltaTime = time - (lastTimeRef.current ?? time);
      lastTimeRef.current = time;
      elapsedRef.current += deltaTime;
      const fullCycle = animationDuration * 2;
      const cycleTime = elapsedRef.current % fullCycle;
      const p = cycleTime < animationDuration
        ? (cycleTime / animationDuration) * 100
        : 100 - ((cycleTime - animationDuration) / animationDuration) * 100;
      setBgPosition(`${p}% 50%`);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [animationDuration]);

  const gradientColors = [...colors].join(', ');
  const gradientStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(to right, ${gradientColors})`,
    backgroundSize: '300% 100%',
    backgroundPosition: bgPosition,
    backgroundRepeat: 'repeat',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    display: 'inline',
    ...(style || {}),
  };

  const Tag = tag as keyof JSX.IntrinsicElements;
  const inner = (
    <span className="text-content" style={gradientStyle}>
      {children}
    </span>
  );

  if (withUnderline) {
    return (
      <Tag className={`animated-gradient-text ${className}`} style={style}>
        <span className="animated-underline-wrap">
          {inner}
        </span>
      </Tag>
    );
  }

  return (
    <Tag className={`animated-gradient-text ${className}`} style={style}>
      {inner}
    </Tag>
  );
}
