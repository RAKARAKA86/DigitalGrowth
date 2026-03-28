import React, { useState, useEffect } from 'react';

interface LampScreenProps {
  onReveal: () => void;
}

export const LampScreen: React.FC<LampScreenProps> = ({ onReveal }) => {
  const [lampOn, setLampOn] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [rightEyeWink, setRightEyeWink] = useState(false);
  const [leftEyeWink, setLeftEyeWink] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (lampOn && !revealed && Math.random() > 0.7) {
        if (Math.random() > 0.5) {
          setLeftEyeWink(true);
          setTimeout(() => setLeftEyeWink(false), 350);
        } else {
          setRightEyeWink(true);
          setTimeout(() => setRightEyeWink(false), 350);
        }
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [lampOn, revealed]);

  const handleTurnOn = () => {
    if (!lampOn) {
      setLampOn(true);
      setTimeout(() => {
        setRightEyeWink(true);
        setTimeout(() => setRightEyeWink(false), 400);
      }, 600);
      
      setTimeout(() => {
        setRevealed(true);
        setTimeout(onReveal, 900);
      }, 800);
    }
  };

  return (
    <>
      <div 
        id="lamp-screen" 
        style={{
          position: 'fixed', inset: 0, background: '#000', zIndex: 9999, 
          display: 'flex', flexDirection: 'column', alignItems: 'center', 
          justifyContent: 'center', cursor: 'pointer',
          animation: revealed ? 'lampExplode 1.1s ease forwards' : 'none'
        }}
        onClick={handleTurnOn}
      >
        <div className={`lamp-wrapper ${lampOn ? 'on' : ''}`} id="lampWrapper">
          <div className="lamp">
            <div className="shade">
              <div className="glow"></div>
            </div>
            <div className="pole"></div>
            <div className="base"></div>
            <div className="face">
              <div className="eyes">
                <div className={`eye ${!lampOn ? 'sleeping' : ''}`} style={{ transform: leftEyeWink ? 'scaleY(0.1)' : '' }}></div>
                <div className={`eye ${!lampOn ? 'sleeping' : ''}`} style={{ transform: rightEyeWink ? 'scaleY(0.1)' : '' }}></div>
              </div>
              <div className={`mouth ${lampOn ? 'happy' : ''}`}></div>
            </div>
          </div>
        </div>
        <p id="lamp-hint" style={{ color: 'rgba(123,189,232,0.5)', fontSize: '13px', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '24px', animation: 'hintPulse 2s ease-in-out infinite' }}>
          ✦ Click the lamp to turn it on ✦
        </p>
      </div>
      
      <div 
        id="lightBurst" 
        style={{
          position: 'fixed', inset: 0, 
          background: 'radial-gradient(ellipse at center,rgba(189,216,233,0.95) 0%,rgba(123,189,232,0.8) 30%,rgba(73,118,159,0.5) 60%,transparent 80%)',
          opacity: 0, pointerEvents: 'none', zIndex: 10000,
          animation: revealed ? 'burstFlash 0.9s ease forwards' : 'none'
        }}
      ></div>
    </>
  );
};
