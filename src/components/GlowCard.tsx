import React, { useState, useRef, ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange';
  style?: React.CSSProperties;
}

export const GlowCard: React.FC<GlowCardProps> = ({
  children, className = '', glowColor = 'blue', style = {},
}) => {
  const [mousePos, setMousePos] = useState({ x: -999, y: -999 });
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { transitionDelay = '0s', ...restStyle } = style as React.CSSProperties & { transitionDelay?: string };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const glowRgb = glowColor === 'blue'   ? '73,118,159'
                : glowColor === 'purple' ? '120,80,200'
                : glowColor === 'green'  ? '60,180,100'
                : glowColor === 'orange' ? '220,130,40'
                : '200,60,60';

  return (
    <div
      ref={cardRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMousePos({ x: -999, y: -999 }); }}
      style={{
        position: 'relative',
        borderRadius: '20px',
        background: hovered
          ? `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(${glowRgb},0.18) 0%, rgba(${glowRgb},0.07) 40%, rgba(255,255,255,0.97) 65%)`
          : 'rgba(255,255,255,0.97)',
        border: `1.5px solid rgba(${glowRgb},${hovered ? '0.45' : '0.13'})`,
        boxShadow: hovered
          ? `0 0 0 1px rgba(${glowRgb},0.10), 0 8px 40px rgba(${glowRgb},0.22), 0 2px 8px rgba(${glowRgb},0.10)`
          : '0 2px 16px rgba(73,118,159,0.07)',
        transition: `border-color 0.25s ${transitionDelay}, box-shadow 0.25s ${transitionDelay}, background 0.15s ${transitionDelay}, transform 0.25s ${transitionDelay}`,
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        cursor: 'default',
        ...restStyle,
      }}
    >
      {/* Spotlight inner highlight */}
      {hovered && (
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '20px',
          background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, rgba(${glowRgb},0.12), transparent 60%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};
