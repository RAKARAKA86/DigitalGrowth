import React, { useEffect, useState, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { CTAButton } from '../components/CTAButton';
import { LampScreen } from '../components/LampScreen';
import { useLanguage } from '../components/LanguageContext';
import VaporizeTextCycle, { Tag } from '../components/VaporizeText';
import GradientText from '../components/GradientText';
import { BubbleText } from '../components/BubbleText';
import { GlowCard } from '../components/GlowCard';

/* ─── Icon helper (custom PNGs from /public) ─────────────────────── */
const Ico = ({ src, size = 56, crisp = false }: { src: string; size?: number; crisp?: boolean }) => (
  <img
    src={src} alt="" width={size} height={size}
    style={{
      objectFit: 'contain', display: 'block',
      imageRendering: crisp ? 'pixelated' : 'auto',
      filter: crisp ? 'none' : 'contrast(1.55) saturate(1.5) brightness(1.04)',
    } as React.CSSProperties}
  />
);

/* ─── Looping underline gradient text ────────────────────────────── */
const GradU = ({ children, fontSize, fw = 800, tag = 'h2', style = {} }:
  { children: React.ReactNode; fontSize: string | number; fw?: number; tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span'; style?: React.CSSProperties }) => (
  <GradientText
    colors={['#49769F', '#4E8EA2', '#7BBDE8', '#BDD8E9', '#49769F']}
    animationSpeed={4}
    withUnderline
    tag={tag}
    style={{ fontSize, fontWeight: fw, letterSpacing: '-0.02em', lineHeight: 1.15, display: 'inline-block', ...style }}
  >
    {children}
  </GradientText>
);

/* ─── Simple gradient span (no underline) ────────────────────────── */
const GradSpan = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <GradientText
    colors={['#49769F', '#4E8EA2', '#7BBDE8', '#BDD8E9', '#49769F']}
    animationSpeed={3.5}
    tag="span"
    style={style}
  >
    {children}
  </GradientText>
);

/* ─── Liquid glass form (contact) ────────────────────────────────── */
const SHEET_URL = 'https://script.google.com/macros/s/AKfycby-PVYLHJLOSxVe8rWi74E9aDmqEe3EKPm3d0M2b79VaFUcFZ9jY-fk_DhB849K-iOb/exec';

const LiquidForm = ({ lang }: { lang: string }) => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async () => {
    if (!phone.trim() || !email.trim()) return;
    setStatus('loading');
    try {
      await fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ phone: phone.trim(), email: email.trim() }),
      });
      setPhone('');
      setEmail('');
      setStatus('success');
      setTimeout(() => setStatus('idle'), 4000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    background: 'rgba(255,255,255,0.5)',
    border: '1px solid rgba(255,255,255,0.6)',
    borderRadius: '100px',
    padding: '13px 20px',
    fontSize: '15px',
    color: '#0d1b2a',
    fontFamily: 'inherit',
    outline: 'none',
    backdropFilter: 'blur(20px)',
    transition: 'all 0.2s',
  };
  return (
    <div style={{
      maxWidth: '560px', margin: '0 auto',
      background: 'rgba(255,255,255,0.22)',
      backdropFilter: 'blur(40px) saturate(200%)',
      WebkitBackdropFilter: 'blur(40px) saturate(200%)',
      border: '1px solid rgba(255,255,255,0.6)',
      borderRadius: '28px',
      padding: '36px 32px',
      boxShadow: '0 0 0 0.5px rgba(255,255,255,0.4) inset, 0 1px 0 rgba(255,255,255,0.8) inset, 0 20px 60px rgba(73,118,159,0.12)',
      position: 'relative',
    }}>
      {/* specular highlight */}
      <div style={{ position:'absolute', top:0, left:'10%', right:'10%', height:'1px', background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.9),transparent)', borderRadius:'100px', pointerEvents:'none' }} />

      <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', background:'rgba(255,255,255,0.55)', borderRadius:'100px', border:'1px solid rgba(255,255,255,0.7)', padding:'4px 4px 4px 16px', backdropFilter:'blur(20px)' }}>
          <Ico src="/icon-tel.png" size={32} />
          <input
            value={phone} onChange={e => setPhone(e.target.value)}
            placeholder={lang === 'es' ? 'Tu número de teléfono' : 'Your phone number'}
            style={{ ...inputStyle, background:'transparent', border:'none', padding:'10px 16px 10px 0', borderRadius:0 }}
          />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', background:'rgba(255,255,255,0.55)', borderRadius:'100px', border:'1px solid rgba(255,255,255,0.7)', padding:'4px 4px 4px 16px', backdropFilter:'blur(20px)' }}>
          <Ico src="/icon-mail.png" size={32} />
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder={lang === 'es' ? 'Tu correo electrónico' : 'Your email address'}
            style={{ ...inputStyle, background:'transparent', border:'none', padding:'10px 16px 10px 0', borderRadius:0 }}
          />
        </div>
        <CTAButton
          text={status === 'loading'
            ? (lang === 'es' ? 'Enviando…' : 'Sending…')
            : (lang === 'es' ? 'Enviar Mensaje' : 'Send Message')}
          fullWidth
          onClick={handleSubmit}
        />
        {status === 'success' && (
          <p style={{ textAlign:'center', fontSize:'13px', color:'#2d7a4f', fontWeight:500, margin:'4px 0 0', letterSpacing:'0.01em' }}>
            {lang === 'es' ? '¡Mensaje enviado! Te contactaremos pronto.' : 'Message sent! We\'ll be in touch soon.'}
          </p>
        )}
        {status === 'error' && (
          <p style={{ textAlign:'center', fontSize:'13px', color:'#b94040', fontWeight:500, margin:'4px 0 0', letterSpacing:'0.01em' }}>
            {lang === 'es' ? 'Algo salió mal. Inténtalo de nuevo.' : 'Something went wrong. Please try again.'}
          </p>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const { lang } = useLanguage();
  const [lampDismissed, setLampDismissed] = useState(false);
  const [showLanding, setShowLanding] = useState(false);
  const [winW, setWinW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [particles, setParticles] = useState<{ id:number;size:number;left:number;dur:number;delay:number;opacity:number }[]>([]);

  /* Dynamic font sizes for VaporizeText */
  const heroFontPx = Math.max(34, Math.min(68, Math.floor(winW / 14)));
  const heroLineH = Math.max(82, Math.min(148, Math.round(heroFontPx * 1.80)));
  const priceFontPx = Math.max(26, Math.min(52, Math.floor(winW / 24)));
  const priceH = Math.round(priceFontPx * 2.2);
  const ctaFontPx = Math.max(26, Math.min(58, Math.floor(winW / 20)));
  const ctaH = Math.round(ctaFontPx * 2.2);
  const currentMonth = (() => {
    const m = new Date().toLocaleString(lang === 'es' ? 'es-ES' : 'en-US', { month: 'long' });
    return m.charAt(0).toUpperCase() + m.slice(1);
  })();

  useEffect(() => {
    const onResize = () => setWinW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const ps = Array.from({ length: 18 }, (_, i) => ({
      id: i, size: Math.random()*4+2, left: Math.random()*100,
      dur: Math.random()*14+8, delay: Math.random()*-14, opacity: Math.random()*0.5+0.3,
    }));
    setParticles(ps);
  }, []);

  useEffect(() => {
    if (!showLanding) return;
    const ro = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); ro.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

    const onScroll = () => {
      const sy = window.scrollY, docH = document.documentElement.scrollHeight - window.innerHeight;
      const prog = document.getElementById('scroll-progress');
      if (prog) prog.style.width = `${docH > 0 ? (sy/docH)*100 : 0}%`;
      const heroBg = document.querySelector('.hero-bg') as HTMLElement;
      if (heroBg) heroBg.style.transform = `translateY(${sy*0.28}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const handleMM = (e: MouseEvent) => {
      const card = e.currentTarget as HTMLElement;
      const r = card.getBoundingClientRect();
      const x = ((e.clientX-r.left)/r.width - 0.5)*18;
      const y = ((e.clientY-r.top)/r.height - 0.5)*-18;
      card.style.transform = `translateY(-8px) rotateY(${x}deg) rotateX(${y}deg)`;
    };
    const handleML = (e: MouseEvent) => { (e.currentTarget as HTMLElement).style.transform=''; };
    setTimeout(() => {
      document.querySelectorAll('.price-card').forEach(c => {
        (c as HTMLElement).addEventListener('mousemove', handleMM);
        (c as HTMLElement).addEventListener('mouseleave', handleML);
      });
    }, 600);
    return () => { window.removeEventListener('scroll', onScroll); ro.disconnect(); };
  }, [showLanding]);

  const handleReveal = () => { setShowLanding(true); setTimeout(() => setLampDismissed(true), 1100); };
  const openCalendar = () => {
    const w = 600, h = 720;
    const left = Math.round(window.screenX + (window.outerWidth - w) / 2);
    const top  = Math.round(window.screenY + (window.outerHeight - h) / 2);
    window.open(
      'https://calendar.app.google/k4KR5KbGWEhUiNxC9',
      'DigitalLineCalendar',
      `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no`
    );
  };

  return (
    <>
      {!lampDismissed && <LampScreen onReveal={handleReveal} />}
      <div id="scroll-progress" />
      <div id="main-landing" style={{ display: showLanding ? 'block' : 'none', opacity: showLanding ? 1 : 0, transition:'opacity 0.8s ease' }}>
        <Navbar openCalendar={openCalendar} />

        {/* ═══ HERO ═══════════════════════════════════════════════════ */}
        <section id="hero" className="hero-section">
          <div className="hero-bg">
            {particles.map(p => (
              <div key={p.id} style={{ position:'absolute', borderRadius:'50%', width:p.size, height:p.size, left:`${p.left}%`, bottom:0, background:'rgba(255,255,255,0.7)', animation:`particleFloat ${p.dur}s linear ${p.delay}s infinite`, opacity:p.opacity, zIndex:3, pointerEvents:'none' }} />
            ))}
          </div>
          <div className="hero-overlay" />

          <div className="hero-content reveal" style={{ paddingTop:'160px', paddingBottom:'100px' }}>
            {/* Hero headline — two synchronized VaporizeTextCycle instances */}
            <div style={{ width:'100%', marginBottom:'32px', display:'flex', flexDirection:'column', gap:'0' }}>
              <div style={{ width:'100%', height:`${heroLineH}px`, marginBottom:`-${Math.round(heroLineH * 0.28)}px` }}>
                <VaporizeTextCycle
                  texts={[lang === 'es' ? 'DEJA DE PERDER CLIENTES' : 'STOP LOSING CLIENTS']}
                  font={{ fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",system-ui,sans-serif', fontSize:`${heroFontPx}px`, fontWeight:900 }}
                  color="rgb(255,255,255)"
                  spread={5} density={5}
                  animation={{ vaporizeDuration:1.6, fadeInDuration:1.6, waitDuration:3.2 }}
                  direction="left-to-right" alignment="center" tag={Tag.H1}
                />
              </div>
              <div style={{ width:'100%', height:`${heroLineH}px` }}>
                <VaporizeTextCycle
                  texts={[lang === 'es' ? 'POR RESPUESTA LENTA' : 'TO SLOW RESPONSE TIME']}
                  font={{ fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",system-ui,sans-serif', fontSize:`${heroFontPx}px`, fontWeight:900 }}
                  color="rgb(255,255,255)"
                  spread={5} density={5}
                  animation={{ vaporizeDuration:1.6, fadeInDuration:1.6, waitDuration:3.2 }}
                  direction="left-to-right" alignment="center" tag={Tag.H1}
                />
              </div>
            </div>

            <p style={{ fontSize:'clamp(17px,2.2vw,22px)', color:'rgba(255,255,255,0.9)', marginBottom:'48px', maxWidth:'700px', margin:'0 auto 48px', lineHeight:1.6, fontWeight:400 }}>
              {lang === 'es'
                ? 'Construimos Sistemas de Automatización con IA que Capturan, Dan Seguimiento y Agendan tus Leads — 24/7, Mientras Duermes.'
                : 'We Build AI Automation Systems That Capture, Follow Up and Book Your Leads — 24/7, While You Sleep.'}
            </p>

            <CTAButton onClick={openCalendar} text={lang === 'es' ? '→ Obtén Tu Auditoría de Negocio Gratis' : '→ Get Your Free 15-Min Business Audit'} variant="hero" />
          </div>
        </section>

        {/* ═══ PROBLEM ════════════════════════════════════════════════ */}
        <section id="problem" className="section-white" style={{ padding:'100px 24px' }}>
          <div className="floating-orb" style={{ background:'#49769F', width:'500px', height:'500px', top:'-10%', right:'-15%' }} />
          <div style={{ maxWidth:'1100px', margin:'0 auto' }}>

            <div style={{ textAlign:'center', marginBottom:'64px' }} className="reveal">
              <GradU fontSize={`clamp(28px,4.5vw,54px)`}>
                {lang === 'es' ? "Esta es la dolorosa verdad:" : "Here's the painful truth:"}
              </GradU>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'24px', marginBottom:'64px' }}>
              {[
                { icon:'/icon-78.png', stat:'78%', en:'of clients go to the first business that responds.', es:'de los clientes van al primer negocio que responde.', delay:'0s' },
                { icon:'/icon-47h.png', stat:'47h', en:'The average small business takes 47 hours to follow up on a lead.', es:'El pequeño negocio promedio tarda 47 horas en dar seguimiento a un lead.', delay:'0.12s' },
                { icon:'/icon-cracks.png', stat:'', en:"You're working harder than ever — but leads are still slipping through the cracks.", es:'Estás trabajando más duro que nunca — pero los leads siguen escapándose.', delay:'0.24s' },
              ].map((item, idx) => (
                <div key={idx} className="glass-card reveal" style={{ padding:'36px 32px', transitionDelay:item.delay, display:'flex', flexDirection:'column', gap:'20px' }}>
                  <Ico src={item.icon} size={56} />
                  <div>
                    {item.stat && (
                      <div style={{ fontSize:'42px', fontWeight:900, background:'linear-gradient(135deg,#49769F,#7BBDE8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', lineHeight:1, marginBottom:'12px' }}>
                        {item.stat}
                      </div>
                    )}
                    <p style={{ fontSize:'17px', color:'var(--text-secondary)', lineHeight:1.55, margin:0, fontWeight:500 }}>
                      {lang === 'es' ? item.es : item.en}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* BubbleText */}
            <div className="reveal" style={{ maxWidth:'720px', margin:'0 auto', padding:'40px', background:'linear-gradient(135deg,rgba(73,118,159,0.06),rgba(123,189,232,0.08))', borderRadius:'24px', border:'1px solid rgba(73,118,159,0.12)', overflow:'visible' }}>
              <BubbleText
                text={lang === 'es'
                  ? "No es tu culpa. Estás dirigiendo un negocio, no un centro de llamadas. Pero sin un sistema, cada hora que no respondes es dinero que tus competidores están cobrando."
                  : "It's not your fault. You're running a business, not a call center. But without a system, every hour you don't respond is money your competitors are collecting."}
                baseStyle={{ fontSize:'clamp(16px,1.6vw,19px)', color:'var(--text-secondary)', textAlign:'center', margin:0, wordBreak:'break-word', overflowWrap:'break-word' }}
              />
            </div>
          </div>
        </section>

        <div className="gradient-divider" />

        {/* ═══ SOLUTION ═══════════════════════════════════════════════ */}
        <section id="solution" className="section-alt" style={{ padding:'100px 24px' }}>
          <div className="floating-orb" style={{ background:'#4E8EA2', width:'450px', height:'450px', bottom:'-5%', left:'-12%' }} />
          <div style={{ maxWidth:'1100px', margin:'0 auto' }}>

            <div style={{ textAlign:'center', marginBottom:'16px' }} className="reveal">
              <GradU fontSize={`clamp(26px,4vw,50px)`}>
                {lang === 'es' ? 'Presentando: Business Autopilot System' : 'Introducing: Business Autopilot System'}
              </GradU>
            </div>
            <p style={{ textAlign:'center', fontSize:'20px', color:'var(--text-secondary)', maxWidth:'620px', margin:'0 auto 56px', lineHeight:1.6 }} className="reveal">
              {lang === 'es' ? 'Construimos un sistema de automatización hecho para ti que trabaja las 24 horas para tu negocio:' : 'We build a done-for-you automation system that works around the clock for your business:'}
            </p>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))', gap:'20px', marginBottom:'48px' }}>
              {[
                { icon:'/icon-ai.png', en:'AI Agent — Responds to every website visitor in 30 seconds, 24/7', es:'Agente de IA — Responde a cada visitante del sitio web en 30 segundos, 24/7', delay:'0s' },
                { icon:'/icon-auto.png', en:'Automated Follow-Up — Email + SMS sequences that nurture leads until they book', es:'Seguimiento Automatizado — Secuencias de Email + SMS que nutren a los leads hasta que agendan', delay:'0.1s' },
                { icon:'/icon-smart.png', en:'Smart Booking — Clients schedule directly in your calendar, no phone calls needed', es:'Agendamiento Inteligente — Los clientes agendan directamente en tu calendario, sin llamadas', delay:'0.2s' },
                { icon:'/icon-lead.png', en:'Lead Dashboard — See every lead, every conversation, every booking in one place', es:'Panel de Leads — Ve cada lead, cada conversación, cada reserva en un solo lugar', delay:'0.3s' },
              ].map((item, idx) => (
                <GlowCard key={idx} glowColor="blue" className="reveal" style={{ padding:'32px 28px', transitionDelay:item.delay, display:'flex', flexDirection:'column', gap:'16px' }}>
                  <Ico src={item.icon} size={32} />
                  <p style={{ fontSize:'16px', color:'var(--text-primary)', lineHeight:1.55, margin:0, fontWeight:500 }}>
                    {lang === 'es' ? item.es : item.en}
                  </p>
                </GlowCard>
              ))}
            </div>

            {/* "You don't touch..." — gradient + underline */}
            <div className="reveal" style={{ maxWidth:'780px', margin:'0 auto', textAlign:'center', padding:'44px 40px', background:'linear-gradient(135deg,rgba(73,118,159,0.06),rgba(123,189,232,0.08))', borderRadius:'24px', border:'1px solid rgba(73,118,159,0.12)' }}>
              <GradU fontSize={`clamp(18px,2vw,24px)`} fw={700} tag="p" style={{ textAlign:'center', lineHeight:1.6 }}>
                {lang === 'es'
                  ? 'No tocas ninguna tecnología. Nosotros nos encargamos de todo. Tu trabajo: presentarte a las citas que agendamos para ti.'
                  : "You don't touch any technology. We handle everything. Your job: show up to the appointments we book for you."}
              </GradU>
            </div>
          </div>
        </section>

        <div className="gradient-divider" />

        {/* ═══ PRICING ════════════════════════════════════════════════ */}
        <section id="pricing" className="section-white" style={{ padding:'100px 24px' }}>
          <div className="floating-orb" style={{ background:'#7BBDE8', width:'400px', height:'400px', top:'10%', right:'-8%' }} />
          <div style={{ maxWidth:'1100px', margin:'0 auto' }}>

            {/* VaporizeText for pricing title */}
            <div style={{ textAlign:'center', marginBottom:'64px' }} className="reveal">
              <div style={{ width:'100%', height:`${priceH}px` }}>
                <VaporizeTextCycle
                  texts={[lang === 'es' ? 'Precios Simples y Transparentes:' : 'Simple, Transparent Pricing:']}
                  font={{ fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",system-ui,sans-serif', fontSize:`${priceFontPx}px`, fontWeight:800 }}
                  color="rgb(13,27,42)"
                  spread={4} density={5}
                  animation={{ vaporizeDuration:2.5, fadeInDuration:1, waitDuration:2 }}
                  direction="left-to-right" alignment="center" tag={Tag.H2}
                />
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))', gap:'28px', alignItems:'start', marginBottom:'48px', position:'relative' }}>

              {/* ARROW — starts BELOW Plus card, curves right+up to Premium card bottom area */}
              {winW >= 720 && (
                <div style={{ position:'absolute', left:'46%', bottom:'0', width:'200px', height:'130px', pointerEvents:'none', zIndex:20 }}>
                  <style>{`
                    @keyframes aDraw { 0%{stroke-dashoffset:240} 65%{stroke-dashoffset:0} 100%{stroke-dashoffset:0} }
                    @keyframes aHead { 0%,62%{opacity:0} 82%,100%{opacity:1} }
                  `}</style>
                  <svg viewBox="0 0 200 130" fill="none" style={{ width:'100%', height:'100%', overflow:'visible' }}>
                    <defs>
                      <linearGradient id="aGrad" x1="5" y1="120" x2="190" y2="10" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#49769F"/><stop offset="1" stopColor="#7BBDE8"/>
                      </linearGradient>
                    </defs>
                    <path d="M5,120 C50,120 150,30 185,10"
                      stroke="url(#aGrad)" strokeWidth="2.8" strokeLinecap="round" fill="none"
                      style={{ strokeDasharray:240, animation:'aDraw 2.6s ease-in-out infinite' }}
                    />
                    <polyline points="175,4 185,10 178,20"
                      stroke="url(#aGrad)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none"
                      style={{ animation:'aHead 2.6s ease-in-out infinite' }}
                    />
                  </svg>
                </div>
              )}

              {/* LEFT COLUMN: Growth + Plus */}
              <div style={{ display:'flex', flexDirection:'column', gap:'28px' }}>

              {/* GROWTH PLAN */}
              <div className="glass-card price-card reveal" style={{ padding:'40px 36px', transitionDelay:'0s', border:'1px solid rgba(73,118,159,0.2)' }}>
                <div style={{ display:'inline-flex', background:'linear-gradient(135deg,rgba(73,118,159,0.1),rgba(123,189,232,0.15))', borderRadius:'100px', padding:'6px 18px', fontSize:'12px', fontWeight:800, color:'#49769F', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:'20px' }}>GROWTH</div>
                <h3 style={{ fontSize:'22px', fontWeight:800, marginBottom:'8px' }}>
                  <GradSpan>{lang === 'es' ? 'Ecosistema de Ventas Automatizado 24/7' : 'Automated Sales Ecosystem 24/7'}</GradSpan>
                </h3>
                <p style={{ fontSize:'14px', color:'var(--text-secondary)', marginBottom:'32px', fontStyle:'italic' }}>
                  {lang === 'es' ? 'Construido en 7 días. Listo para capturar leads mientras duermes.' : 'Built in 7 days. Ready to capture leads while you sleep.'}
                </p>

                <div style={{ display:'flex', flexDirection:'column', gap:'18px', marginBottom:'32px' }}>
                  {[
                    { price:'$997', label:lang==='es'?'Configuración Inicial':'One-Time Setup', desc:lang==='es'?'— construimos todo para ti en 7 días':'— we build everything for you in 7 days' },
                    { price:'$497', label:lang==='es'?'/mes Soporte Continuo':'/month Ongoing Support', desc:lang==='es'?'— mantenemos, optimizamos y respaldamos tu sistema':'— we maintain, optimize, and support your system' },
                  ].map((row, i) => (
                    <div key={i} style={{ display:'flex', gap:'12px', alignItems:'flex-start' }}>
                      <div style={{ width:'8px', height:'8px', borderRadius:'50%', marginTop:'8px', background:'linear-gradient(135deg,#49769F,#7BBDE8)', flexShrink:0 }} />
                      <div>
                        <span style={{ fontSize:'22px', fontWeight:900, color:'var(--text-primary)' }}>{row.price}</span>
                        <span style={{ fontSize:'15px', fontWeight:700, color:'var(--c2)', marginLeft:'4px' }}>{row.label}</span>
                        <span style={{ fontSize:'14px', color:'var(--text-secondary)' }}>{row.desc}</span>
                      </div>
                    </div>
                  ))}
                  <div style={{ height:'1px', background:'linear-gradient(90deg,transparent,rgba(73,118,159,0.2),transparent)', margin:'8px 0' }} />
                  <div style={{ display:'flex', gap:'12px', alignItems:'flex-start' }}>
                    <div style={{ width:'8px', height:'8px', borderRadius:'50%', marginTop:'8px', background:'linear-gradient(135deg,#f0b429,#ffd166)', flexShrink:0 }} />
                    <div>
                      <span style={{ fontSize:'22px', fontWeight:900, color:'var(--text-primary)' }}>$1,297</span>
                      <span style={{ fontSize:'15px', fontWeight:700, color:'#f0b429', marginLeft:'4px' }}>/month all-in</span>
                      <span style={{ fontSize:'14px', color:'var(--text-secondary)' }}> — {lang==='es'?'sin tarifa de configuración, un solo pago':'no setup fee, one simple payment'}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* PLUS CARD */}
              <div className="glass-card price-card reveal" style={{ padding:'32px 28px', transitionDelay:'0.15s', border:'1px solid rgba(123,189,232,0.3)', background:'rgba(255,255,255,0.92)' }}>
                <div style={{ display:'inline-flex', background:'linear-gradient(135deg,rgba(73,118,159,0.12),rgba(123,189,232,0.22))', borderRadius:'100px', padding:'6px 18px', fontSize:'12px', fontWeight:800, color:'#49769F', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:'16px' }}>PLUS</div>
                <p style={{ fontSize:'13px', color:'var(--text-secondary)', marginBottom:'18px', fontStyle:'italic', lineHeight:1.5 }}>
                  {lang==='es' ? 'Complemento de élite para el plan Premium.' : 'Elite add-on for the Premium plan.'}
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                  {[
                    { en:'Custom Mobile App — Real-time push notifications every time a hot lead comes in, so you or your sales team acts within seconds.', es:'App Móvil Personalizada — Notificaciones push en tiempo real cada vez que entra un lead caliente, para que tú o tu equipo actúen al segundo.' },
                    { en:'AI Voice Agent (Optional but lethal) — An AI that calls the lead by phone within 5 minutes of leaving their data, to pre-qualify and schedule them.', es:'Agente de Voz IA (Opcional pero letal) — Una IA que llama al lead a los 5 minutos de haber dejado sus datos para precalificarlo y agendarlo.' },
                    { en:'Advanced Custom CRM: a sales dashboard designed for your sector. Visual pipelines to know exactly how much money is at stake and all your information in one place. It doesn\'t just inform — it Predicts.', es:'CRM personalizado avanzado: un panel de ventas diseñado para tu sector. Pipelines visuales para saber exactamente cuánto dinero hay en juego y toda tu información en un solo lugar. No solo informa — Predice.' },
                  ].map((item, i) => (
                    <div key={i} style={{ display:'flex', gap:'12px', alignItems:'flex-start' }}>
                      <span style={{ width:'20px', height:'20px', borderRadius:'6px', flexShrink:0, marginTop:'1px', background:'linear-gradient(135deg,#49769F,#7BBDE8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', color:'white' }}>✓</span>
                      <span style={{ fontSize:'14px', color:'var(--text-secondary)', lineHeight:1.5 }}>{lang==='es'?item.es:item.en}</span>
                    </div>
                  ))}
                </div>
              </div>

              </div>{/* end LEFT COLUMN */}

              {/* PREMIUM PLAN */}
              <div className="premium-card price-card reveal" style={{ transitionDelay:'0.2s' }}>
                <div className="premium-card-inner" style={{ padding:'40px 36px' }}>
                  <div style={{ display:'inline-flex', background:'linear-gradient(135deg,#f0b429,#ffd166)', borderRadius:'100px', padding:'6px 18px', fontSize:'12px', fontWeight:800, color:'#0d1b2a', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:'20px' }}>PREMIUM — ELITE</div>
                  <h3 style={{ fontSize:'20px', fontWeight:900, marginBottom:'8px', lineHeight:1.3 }}>
                    <GradSpan style={{ fontSize:'20px', fontWeight:900 }}>
                      {lang === 'es' ? 'PILOTO AUTOMÁTICO EMPRESARIAL ÉLITE' : 'Elite Business Autopilot'}
                    </GradSpan>
                  </h3>
                  <p style={{ fontSize:'14px', color:'var(--text-secondary)', marginBottom:'24px', lineHeight:1.55, fontStyle:'italic' }}>
                    {lang === 'es'
                      ? 'Control total y dominio de tu mercado. No solo captamos tus leads, construimos el cerebro digital de tu empresa para que gestiones todo desde la palma de tu mano.'
                      : "Total control and market dominance. We don't just capture your leads — we build the digital brain of your company so you manage everything from the palm of your hand."}
                  </p>

                  {/* Pricing block */}
                  <div style={{ background:'linear-gradient(135deg,rgba(240,180,41,0.08),rgba(255,209,102,0.12))', border:'1px solid rgba(240,180,41,0.25)', borderRadius:'16px', padding:'20px 24px', marginBottom:'24px', display:'flex', flexDirection:'column', gap:'10px' }}>
                    <div>
                      <span style={{ fontSize:'24px', fontWeight:900, color:'var(--text-primary)' }}>$2,997</span>
                      <span style={{ fontSize:'14px', color:'var(--text-secondary)', marginLeft:'6px' }}>{lang==='es'?'Setup — pago único de instalación':'Setup — one-time installation'}</span>
                    </div>
                    <div>
                      <span style={{ fontSize:'24px', fontWeight:900, color:'var(--text-primary)' }}>$997</span>
                      <span style={{ fontSize:'14px', color:'var(--text-secondary)', marginLeft:'6px' }}>{lang==='es'?'/mes retainer mensual':'/month monthly retainer'}</span>
                    </div>
                  </div>

                  <p style={{ fontSize:'12px', fontWeight:800, color:'#49769F', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'16px' }}>
                    {lang==='es'?'Incluye todo del plan Growth, MÁS:':'Includes everything in Growth, PLUS:'}
                  </p>
                  <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                    {[
                      { en:'Panel de Control — A sales dashboard designed for your sector. Visual pipelines to know exactly how much money is on the table.', es:'Panel de Control — Panel de ventas diseñado para tu sector con embudos visuales para saber exactamente cuánto dinero hay en la mesa.' },
                      { en:'We Connect Your Networks ( Meta )', es:'Conectamos tus Redes ( Meta )' },
                      { en:'VIP Onboarding & Training — 1-on-1 session with your sales team to ensure total platform adoption.', es:'Onboarding VIP y Capacitación — Sesión 1 a 1 con tu equipo de ventas para asegurar la adopción total.' },
                      { en:'Priority WhatsApp Support — Direct access without waiting tickets.', es:'Soporte Prioritario por WhatsApp — Acceso directo sin tickets de espera.' },
                    ].map((item, i) => (
                      <div key={i} style={{ display:'flex', gap:'12px', alignItems:'flex-start' }}>
                        <span style={{ width:'20px', height:'20px', borderRadius:'6px', flexShrink:0, marginTop:'1px', background:'linear-gradient(135deg,#f0b429,#ffd166)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', color:'#0d1b2a' }}>✓</span>
                        <span style={{ fontSize:'14px', color:'var(--text-secondary)', lineHeight:1.5 }}>{lang==='es'?item.es:item.en}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Scarcity — gradient + underline, no lightning bolt, dynamic month */}
            <div className="reveal" style={{ maxWidth:'620px', margin:'0 auto 48px', textAlign:'center', padding:'28px 32px', background:'linear-gradient(135deg,rgba(240,180,41,0.06),rgba(255,209,102,0.08))', borderRadius:'20px', border:'1px solid rgba(240,180,41,0.2)' }}>
              <GradU fontSize="clamp(15px,1.5vw,18px)" fw={600} tag="p" style={{ textAlign:'center', lineHeight:1.6, margin:0 }}>
                {lang === 'es'
                  ? `Solo tomamos 3 nuevos clientes por mes para asegurar la calidad. Lugares para ${currentMonth}: 1 restante.`
                  : `We only take 3 new clients per month to ensure quality. Spots for ${currentMonth}: 1 remaining.`}
              </GradU>
            </div>

            <div style={{ textAlign:'center' }} className="reveal">
              <CTAButton onClick={openCalendar} text={lang === 'es' ? '→ Reclama Tu Auditoría Gratis Ahora' : '→ Claim Your Free Audit Now'} />
            </div>
          </div>
        </section>

        <div className="gradient-divider" />

        {/* ═══ GUARANTEE ══════════════════════════════════════════════ */}
        <section id="guarantee" className="section-alt" style={{ padding:'100px 24px' }}>
          <div style={{ maxWidth:'800px', margin:'0 auto' }}>
            <div className="glass-card reveal" style={{ padding:'64px clamp(24px,5vw,56px)', textAlign:'center', border:'1px solid rgba(240,180,41,0.2)', background:'rgba(255,255,255,0.95)', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:'linear-gradient(90deg,transparent,#f0b429,#ffd166,transparent)' }} />

              <div style={{ width:'80px', height:'80px', borderRadius:'24px', background:'linear-gradient(135deg,rgba(240,180,41,0.1),rgba(255,209,102,0.15))', border:'1px solid rgba(240,180,41,0.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 28px' }}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <defs><linearGradient id="sg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stopColor="#f0b429"/><stop offset="1" stopColor="#ffd166"/></linearGradient></defs>
                  <path d="M20 4L34 11V22C34 30 27 36 20 38C13 36 6 30 6 22V11Z" stroke="url(#sg)" strokeWidth="2" fill="none" strokeLinejoin="round"/>
                  <polyline points="13,20 18,25 27,16" stroke="url(#sg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div style={{ marginBottom:'24px' }}>
                <GradU fontSize="clamp(26px,4vw,42px)" style={{ display:'inline-block' }}>
                  {lang === 'es' ? 'Nuestra Garantía:' : 'Our Guarantee:'}
                </GradU>
              </div>

              <p style={{ fontSize:'clamp(16px,1.8vw,20px)', lineHeight:1.7, color:'var(--text-secondary)', margin:'0 auto', maxWidth:'580px' }}>
                {lang === 'es'
                  ? <>Si tu sistema no está en vivo y funcionando dentro de los primeros 10 días hábiles de inicio, no pagas la tarifa mensual hasta que lo esté.<br/><br/><strong style={{ color:'var(--text-primary)' }}>No estamos satisfechos hasta que tú lo estés.</strong></>
                  : <>If your system isn't live and working within 10 business days of starting, you don't pay the monthly fee until it is.<br/><br/><strong style={{ color:'var(--text-primary)' }}>We're not satisfied until you are.</strong></>}
              </p>
            </div>
          </div>
        </section>

        <div className="gradient-divider" />

        {/* ═══ FINAL CTA ══════════════════════════════════════════════ */}
        <section id="final-cta" className="section-white" style={{ padding:'120px 24px', textAlign:'center', position:'relative' }}>
          <div className="floating-orb" style={{ background:'#49769F', width:'600px', height:'600px', top:'50%', left:'50%', transform:'translate(-50%,-50%)', opacity:0.1 }} />
          <div style={{ maxWidth:'800px', margin:'0 auto', position:'relative', zIndex:1 }}>
            <div className="reveal">

              {/* VaporizeText for final CTA title */}
              <div style={{ width:'100%', height:`${ctaH}px`, marginBottom:'28px' }}>
                <VaporizeTextCycle
                  texts={[lang === 'es' ? '¿Listo para Dejar de Perder Leads?' : 'Ready to Stop Losing Leads?']}
                  font={{ fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",system-ui,sans-serif', fontSize:`${ctaFontPx}px`, fontWeight:900 }}
                  color="rgb(13,27,42)"
                  spread={5} density={5}
                  animation={{ vaporizeDuration:2.5, fadeInDuration:1, waitDuration:2 }}
                  direction="left-to-right" alignment="center" tag={Tag.H2}
                />
              </div>

              <p style={{ fontSize:'clamp(16px,1.8vw,20px)', color:'var(--text-secondary)', lineHeight:1.7, marginBottom:'48px' }}>
                {lang === 'es'
                  ? <>Agenda tu Auditoría de Negocios de 15 minutos gratuita.<br/>Analizaremos tu sistema actual, identificaremos exactamente qué te está costando clientes y te mostraremos cómo solucionarlo.<br/><br/><strong style={{ color:'var(--text-primary)' }}>Sin ventas. Sin presión. Solo claridad.</strong></>
                  : <>Book your free 15-minute Business Audit.<br/>We'll look at your current system, identify exactly what's costing you clients, and show you how to fix it.<br/><br/><strong style={{ color:'var(--text-primary)' }}>No pitch. No pressure. Just clarity.</strong></>}
              </p>

              <CTAButton onClick={() => window.open('https://wa.me/+16452178138', '_blank')} text={lang === 'es' ? '→ Agenda Tu Auditoría Gratis — Solo 15 Min' : '→ Book My Free Audit — It Takes 15 Minutes'} />

              {/* Liquid glass contact form */}
              <div style={{ marginTop:'56px' }}>
                <p style={{ fontSize:'15px', color:'var(--text-secondary)', marginBottom:'24px', fontWeight:500 }}>
                  {lang === 'es' ? 'O contáctanos directamente:' : 'Or reach out directly:'}
                </p>
                <LiquidForm lang={lang} />
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FOOTER ═════════════════════════════════════════════════ */}
        <footer style={{ borderTop:'1px solid rgba(73,118,159,0.12)', background:'#f8fbff', padding:'48px 24px', textAlign:'center' }}>
          <img src="https://ik.imagekit.io/es7dz5sp8/Logo%20Digital%20Line%20sin%20fondo%202.png?updatedAt=1768825713301" alt="DigitalLine Logo" style={{ height:'44px', margin:'0 auto 12px', display:'block', opacity:0.85 }} />
          <a href="https://www.digitalline.es" target="_blank" rel="noopener noreferrer" style={{ display:'block', fontSize:'14px', fontWeight:700, color:'var(--c2)', letterSpacing:'0.5px', marginBottom:'14px', textDecoration:'none', opacity:0.9 }}>www.digitalline.es</a>
          <p style={{ fontSize:'13px', color:'var(--text-secondary)', margin:'0 0 6px', fontWeight:500 }}>
            {lang === 'es' ? '© 2026 DigitalLine. Todos los derechos reservados.' : '© 2026 DigitalLine. All rights reserved.'}
          </p>
          <p style={{ fontSize:'12px', color:'var(--c1)', fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', margin:0 }}>
            AI Automation Agency — Florida, USA
          </p>
        </footer>

      </div>
    </>
  );
}
