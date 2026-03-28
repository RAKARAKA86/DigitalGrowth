import React, { useState } from 'react';

interface BubbleTextProps {
  text: string;
  className?: string;
  baseStyle?: React.CSSProperties;
}

export const BubbleText: React.FC<BubbleTextProps> = ({ text, className = '', baseStyle = {} }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <p
      onMouseLeave={() => setHoveredIndex(null)}
      className={className}
      style={{
        cursor: 'default',
        lineHeight: 1.65,
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        whiteSpace: 'normal',
        overflow: 'visible',
        ...baseStyle,
      }}
    >
      {text.split('').map((char, idx) => {
        const distance = hoveredIndex !== null ? Math.abs(hoveredIndex - idx) : null;
        let extra: React.CSSProperties = {};
        switch (distance) {
          case 0:
            extra = { fontWeight: 900, color: '#0d1b2a', textShadow: '0 0 8px rgba(73,118,159,0.3)' };
            break;
          case 1:
            extra = { fontWeight: 700, color: '#2d4a6b' };
            break;
          case 2:
            extra = { fontWeight: 500, color: '#49769F' };
            break;
          default:
            break;
        }
        if (char === ' ') {
          return <span key={idx}>{' '}</span>;
        }
        return (
          <span
            key={idx}
            onMouseEnter={() => setHoveredIndex(idx)}
            style={{
              display: 'inline',
              transition: 'all 0.28s ease-in-out',
              ...extra,
            }}
          >
            {char}
          </span>
        );
      })}
    </p>
  );
};
