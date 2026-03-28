import React, { useRef, useEffect, CSSProperties } from 'react';

function StarBg() {
  return (
    <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g clipPath="url(#sb-clip)">
        <circle cx="8"  cy="5"  r="0.8" fill="rgba(255,255,255,0.55)" />
        <circle cx="25" cy="12" r="0.6" fill="rgba(255,255,255,0.45)" />
        <circle cx="42" cy="4"  r="1.0" fill="rgba(255,255,255,0.60)" />
        <circle cx="60" cy="18" r="0.7" fill="rgba(255,255,255,0.40)" />
        <circle cx="75" cy="7"  r="0.9" fill="rgba(255,255,255,0.55)" />
        <circle cx="88" cy="28" r="0.6" fill="rgba(255,255,255,0.45)" />
        <circle cx="15" cy="30" r="0.7" fill="rgba(255,255,255,0.40)" />
        <circle cx="50" cy="32" r="0.5" fill="rgba(255,255,255,0.35)" />
        <circle cx="93" cy="14" r="0.8" fill="rgba(255,255,255,0.50)" />
        <circle cx="33" cy="24" r="0.6" fill="rgba(255,255,255,0.40)" />
        <circle cx="67" cy="33" r="0.7" fill="rgba(255,255,255,0.45)" />
        <circle cx="4"  cy="20" r="0.5" fill="rgba(255,255,255,0.38)" />
        <circle cx="80" cy="22" r="0.6" fill="rgba(255,255,255,0.42)" />
        <path d="M56 4l.2.5.5.2-.5.2-.2.5-.2-.5-.5-.2.5-.2z" fill="rgba(255,255,255,0.65)" />
        <path d="M22 9l.15.4.4.15-.4.15-.15.4-.15-.4-.4-.15.4-.15z" fill="rgba(255,255,255,0.60)" />
        <path d="M82 6l.15.4.4.15-.4.15-.15.4-.15-.4-.4-.15.4-.15z" fill="rgba(255,255,255,0.55)" />
        <path d="M40 28l.1.3.3.1-.3.1-.1.3-.1-.3-.3-.1.3-.1z" fill="rgba(255,255,255,0.50)" />
      </g>
      <defs>
        <clipPath id="sb-clip"><rect width="100" height="40" fill="white" /></clipPath>
      </defs>
    </svg>
  );
}

interface CTAButtonProps {
  text: string;
  onClick?: () => void;
  className?: string;
  variant?: 'dark' | 'gradient' | 'hero';
  lightWidth?: number;
  duration?: number;
  fullWidth?: boolean;
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  text,
  onClick,
  className = '',
  variant = 'gradient',
  lightWidth = 130,
  duration = 2.8,
  fullWidth = false,
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    const light = lightRef.current;
    if (!btn || !light) return;

    const setPath = () => {
      const w = btn.offsetWidth;
      const h = btn.offsetHeight;
      const path = `path('M 0 0 H ${w} V ${h} H 0 V 0')`;
      (light.style as any).offsetPath = path;
    };

    setPath();
    const ro = new ResizeObserver(setPath);
    ro.observe(btn);
    return () => ro.disconnect();
  }, []);

  const isHero = variant === 'hero';

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      className={`star-cta-btn ${isHero ? 'star-cta-hero' : 'star-cta-default'} ${className}`}
      style={{
        '--duration': duration,
        '--light-width': `${lightWidth}px`,
        isolation: 'isolate',
        ...(fullWidth ? { width: '100%', display: 'flex' } : {}),
      } as CSSProperties}
    >
      <div
        ref={lightRef}
        className="star-cta-light animate-star-btn"
        style={{
          offsetDistance: '0%',
          width: `${lightWidth}px`,
        } as CSSProperties}
      />
      <div className="star-cta-stars" aria-hidden="true">
        <StarBg />
      </div>
      <div className="star-cta-glow" aria-hidden="true" />
      <span className="star-cta-text">{text}</span>
    </button>
  );
};
