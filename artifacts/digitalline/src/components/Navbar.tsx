import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from './LanguageContext';

const RAIN_CODES    = [176,263,266,281,284,293,296,299,302,305,308,353,356,359];
const SNOW_CODES    = [179,182,185,227,230,323,326,329,332,335,338,350,368,371,374,377];
const THUNDER_CODES = [200,386,389];
const STORM_CODES   = [392,395,362,365];

function getWeatherImage(code: number): string {
  if (STORM_CODES.includes(code))   return '/images/weather-storm.png';
  if (THUNDER_CODES.includes(code)) return '/images/weather-thunder.png';
  if (SNOW_CODES.includes(code))    return '/images/weather-snow.png';
  if (RAIN_CODES.includes(code))    return '/images/weather-rain.png';
  return '/images/weather-sunny.png';
}

interface WeatherData {
  temp: number;
  desc: string;
  icon: string;
  loading: boolean;
}

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData>({
    temp: 0, desc: '', icon: '/images/weather-sunny.png', loading: true,
  });

  const load = async () => {
    try {
      let lat: number | null = null;
      let lon: number | null = null;
      // 1. Try GPS first
      if (navigator.geolocation) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => { lat = pos.coords.latitude; lon = pos.coords.longitude; resolve(); },
            () => resolve(),
            { timeout: 4000 }
          );
        });
      }
      // 2. Fallback: browser-side IP geolocation (uses real user IP, not server IP)
      if (lat === null) {
        try {
          const ipData = await fetch('https://ipapi.co/json/').then(r => r.json());
          if (ipData.latitude && ipData.longitude) { lat = ipData.latitude; lon = ipData.longitude; }
        } catch { /* silent */ }
      }
      const apiUrl = lat !== null ? `/api/weather?q=${lat},${lon}` : '/api/weather';
      const res  = await fetch(apiUrl);
      const data = await res.json();
      if (!data.current) throw new Error('No data');
      const desc = Array.isArray(data.current.weather_descriptions)
        ? data.current.weather_descriptions[0]
        : data.current.weather_descriptions || '';
      setWeather({
        temp: data.current.temperature,
        desc,
        icon: getWeatherImage(data.current.weather_code),
        loading: false,
      });
    } catch {
      setWeather(w => ({ ...w, loading: false }));
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`weather-widget${weather.loading ? ' loading' : ''}`}>
      <img src={weather.icon} alt="weather" className="weather-icon" />
      <div className="weather-info">
        <span className="weather-temp">
          {weather.loading ? '\u00A0\u00A0\u00A0\u00A0' : `${weather.temp}°C`}
        </span>
        <span className="weather-desc">
          {weather.loading ? '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0' : weather.desc}
        </span>
      </div>
    </div>
  );
};

/* Apple Liquid Glass styles injected once */
const liquidGlassCSS = `
.liquid-glass-nav {
  position: fixed;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  max-width: 1080px;
  border-radius: 100px;
  z-index: 4000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease;

  /* Liquid glass core */
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(40px) saturate(220%) brightness(1.06);
  -webkit-backdrop-filter: blur(40px) saturate(220%) brightness(1.06);

  /* Multi-layer border for glass depth */
  border: 1px solid rgba(255,255,255,0.55);
  box-shadow:
    0 0 0 0.5px rgba(255,255,255,0.3) inset,
    0 1px 0 rgba(255,255,255,0.7) inset,
    0 -1px 0 rgba(0,0,0,0.04) inset,
    0 8px 32px rgba(73,118,159,0.14),
    0 2px 8px rgba(0,0,0,0.06);
}

.liquid-glass-nav::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    135deg,
    rgba(255,255,255,0.35) 0%,
    rgba(255,255,255,0.08) 30%,
    rgba(200,220,255,0.04) 60%,
    rgba(255,255,255,0.12) 100%
  );
  pointer-events: none;
  z-index: 0;
}

.liquid-glass-nav::after {
  content: '';
  position: absolute;
  top: 0; left: 10%; right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
  border-radius: 100px;
  pointer-events: none;
  z-index: 1;
}

.liquid-glass-nav > * { position: relative; z-index: 2; }

.liquid-glass-nav.hidden {
  transform: translate(-50%, -120%);
  opacity: 0;
  pointer-events: none;
}

.liquid-nav-link {
  color: rgba(13,27,42,0.85);
  background: none;
  border: none;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
  font-size: 14px;
  font-weight: 500;
  padding: 7px 14px;
  border-radius: 20px;
  transition: all 0.2s;
  cursor: pointer;
  letter-spacing: -0.01em;
}
.liquid-nav-link:hover {
  background: rgba(73,118,159,0.1);
  color: #49769F;
}

.lang-pill {
  background: rgba(73,118,159,0.08);
  border-radius: 100px;
  padding: 3px;
  border: 1px solid rgba(73,118,159,0.12);
  display: flex;
}
.lang-btn {
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 800;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
  letter-spacing: 0.5px;
}
.lang-btn.active { background: #49769F; color: #fff; }
.lang-btn.inactive { background: transparent; color: #49769F; }

/* ── Weather Widget ─────────────────────────────────────────── */
.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-divider {
  width: 1px;
  height: 20px;
  background: rgba(73,118,159,0.2);
  flex-shrink: 0;
}

.weather-widget {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 4px 10px 4px 4px;
  border-radius: 50px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  transition: background 0.25s ease, transform 0.2s ease;
  cursor: default;
  flex-shrink: 0;
  white-space: nowrap;
}
.weather-widget:hover {
  background: rgba(255,255,255,0.22);
  transform: translateY(-1px);
}
.weather-icon {
  width: 34px;
  height: 34px;
  object-fit: contain;
  filter: drop-shadow(0 1px 4px rgba(0,0,0,0.12));
  flex-shrink: 0;
}
.weather-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0px;
  line-height: 1.15;
}
.weather-temp {
  font-size: 15px;
  font-weight: 700;
  color: rgba(13,27,42,0.9);
  text-shadow: 0 1px 2px rgba(255,255,255,0.5);
}
.weather-desc {
  font-size: 10px;
  color: rgba(13,27,42,0.55);
  font-weight: 400;
  text-transform: capitalize;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Loading shimmer */
.weather-widget.loading .weather-temp,
.weather-widget.loading .weather-desc {
  background: linear-gradient(90deg, rgba(73,118,159,0.1) 25%, rgba(73,118,159,0.2) 50%, rgba(73,118,159,0.1) 75%);
  background-size: 200% 100%;
  animation: navShimmer 1.5s infinite;
  border-radius: 4px;
  color: transparent;
  min-width: 36px;
}
@keyframes navShimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Responsive weather */
@media (max-width: 768px) {
  .weather-desc { display: none; }
  .weather-widget { padding: 4px 8px 4px 4px; gap: 4px; }
  .weather-icon { width: 28px; height: 28px; }
  .weather-temp { font-size: 13px; }
}

/* ── Hamburger button ────────────────────────────────────────── */
.hamburger-btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 36px;
  height: 36px;
  padding: 8px;
  border-radius: 50%;
  background: rgba(73,118,159,0.08);
  border: 1px solid rgba(73,118,159,0.14);
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}
.hamburger-btn:hover { background: rgba(73,118,159,0.16); }
.hamburger-btn span {
  display: block;
  height: 2px;
  border-radius: 2px;
  background: rgba(13,27,42,0.75);
  transition: transform 0.25s ease, opacity 0.2s ease;
  transform-origin: center;
}
.hamburger-btn.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger-btn.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.hamburger-btn.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* ── Mobile dropdown ─────────────────────────────────────────── */
.mobile-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  right: 0;
  border-radius: 24px;
  background: rgba(255,255,255,0.82);
  backdrop-filter: blur(40px) saturate(200%);
  -webkit-backdrop-filter: blur(40px) saturate(200%);
  border: 1px solid rgba(255,255,255,0.6);
  box-shadow:
    0 0 0 0.5px rgba(255,255,255,0.4) inset,
    0 1px 0 rgba(255,255,255,0.9) inset,
    0 16px 48px rgba(73,118,159,0.18),
    0 4px 12px rgba(0,0,0,0.08);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: dropIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both;
  z-index: 4001;
}
@keyframes dropIn {
  from { opacity: 0; transform: translateY(-8px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.mobile-dropdown-weather {
  display: flex;
  justify-content: center;
  padding: 4px 0 8px;
}
.mobile-dropdown-weather .weather-widget {
  background: rgba(73,118,159,0.06);
  border-color: rgba(73,118,159,0.15);
  min-width: 160px;
  justify-content: center;
}
.mobile-dropdown-weather .weather-temp { color: rgba(13,27,42,0.9); }
.mobile-dropdown-weather .weather-desc { display: block; color: rgba(13,27,42,0.55); }
.mobile-dropdown-weather .weather-icon { width: 38px; height: 38px; }
.mobile-dropdown-divider {
  height: 1px;
  background: rgba(73,118,159,0.12);
  margin: 4px 0 8px;
  border-radius: 1px;
}
.mobile-dropdown-link {
  width: 100%;
  padding: 13px 16px;
  border-radius: 14px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: rgba(13,27,42,0.85);
  text-align: left;
  transition: background 0.15s;
  letter-spacing: -0.01em;
}
.mobile-dropdown-link:hover,
.mobile-dropdown-link:active { background: rgba(73,118,159,0.08); color: #49769F; }
`;

export const Navbar: React.FC<{ openCalendar: () => void }> = ({ openCalendar }) => {
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, setLang } = useLanguage();

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const cur = window.scrollY;
      setHidden(cur > last && cur > 100);
      last = cur;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: liquidGlassCSS }} />
      <nav className={`liquid-glass-nav ${hidden ? 'hidden' : ''}`}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="https://ik.imagekit.io/es7dz5sp8/Logo%20Digital%20Line%20sin%20fondo%202.png?updatedAt=1768825713301"
            alt="DigitalLine"
            style={{ height: '30px' }}
          />
        </div>

        {/* Nav links — desktop only */}
        <div className="nav-links desktop-nav">
          {[
            { id: 'problem', en: 'Problem', es: 'Problema' },
            { id: 'solution', en: 'Solution', es: 'Solución' },
            { id: 'pricing', en: 'Pricing', es: 'Precios' },
            { id: 'guarantee', en: 'Guarantee', es: 'Garantía' },
          ].map(item => (
            <button key={item.id} onClick={() => scrollTo(item.id)} className="liquid-nav-link"
              data-en={item.en} data-es={item.es}>
              {lang === 'es' ? item.es : item.en}
            </button>
          ))}
        </div>

        {/* Right side — desktop: weather + divider + toggle */}
        <div className="nav-right desktop-nav">
          <WeatherWidget />
          <div className="nav-divider" />
          <div className="lang-pill">
            {(['en', 'es'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`lang-btn ${lang === l ? 'active' : 'inactive'}`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Right side — mobile only: lang toggle + hamburger */}
        <div className="mobile-nav">
          <div className="lang-pill">
            {(['en', 'es'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`lang-btn ${lang === l ? 'active' : 'inactive'}`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            className={`hamburger-btn ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="mobile-dropdown">
            {/* Weather inside dropdown */}
            <div className="mobile-dropdown-weather">
              <WeatherWidget />
            </div>
            <div className="mobile-dropdown-divider" />
            {/* Nav links */}
            {[
              { id: 'problem', en: 'Problem', es: 'Problema' },
              { id: 'solution', en: 'Solution', es: 'Solución' },
              { id: 'pricing', en: 'Pricing', es: 'Precios' },
              { id: 'guarantee', en: 'Guarantee', es: 'Garantía' },
            ].map(item => (
              <button
                key={item.id}
                className="mobile-dropdown-link"
                onClick={() => { scrollTo(item.id); setMenuOpen(false); }}
              >
                {lang === 'es' ? item.es : item.en}
              </button>
            ))}
          </div>
        )}
      </nav>
    </>
  );
};
