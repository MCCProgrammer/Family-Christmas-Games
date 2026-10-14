
import React, { useEffect, useState, useRef } from 'react';
import { Team } from '../types';
import confetti from 'canvas-confetti';

interface Props {
  teams: Team[];
  onFinish: () => void;
}

const SOUNDS = {
  DRUMROLL: 'https://actions.google.com/sounds/v1/foley/drum_roll.ogg',
  REVEAL: 'https://actions.google.com/sounds/v1/cartoon/pop.ogg',
  APPLAUSE: 'https://actions.google.com/sounds/v1/human_voices/audience_clapping_enthusiastic.ogg',
  WINNER_FANFARE: 'https://actions.google.com/sounds/v1/foley/win_crowd_cheer.ogg',
  CHRISTMAS_JINGLE: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3'
};

const Podium: React.FC<Props> = ({ teams, onFinish }) => {
  const [revealedStep, setRevealedStep] = useState(0); // 0: Start, 1: 3rd, 2: 2nd, 3: 1st
  const [showButton, setShowButton] = useState(false);
  
  const sorted = [...teams].sort((a, b) => b.points - a.points).slice(0, 3);
  const third = sorted[2];
  const second = sorted[1];
  const first = sorted[0];

  const playSound = (url: string, volume = 0.5, loop = false) => {
    try {
      const audio = new Audio(url);
      audio.volume = volume;
      audio.loop = loop;
      audio.play().catch(e => console.log("Audio blocked: needs user interaction", e));
      return audio;
    } catch (e) {
      console.error("Error playing sound", e);
      return null;
    }
  };

  useEffect(() => {
    const sequence = async () => {
      // Start with a drum roll
      const drumroll = playSound(SOUNDS.DRUMROLL, 0.4, true);
      
      await new Promise(r => setTimeout(r, 2000));
      
      // Reveal 3rd place
      setRevealedStep(1);
      playSound(SOUNDS.REVEAL, 0.6);
      confetti({ particleCount: 30, spread: 50, origin: { x: 0.8, y: 0.8 } });
      await new Promise(r => setTimeout(r, 2500));

      // Reveal 2nd place
      setRevealedStep(2);
      playSound(SOUNDS.REVEAL, 0.6);
      confetti({ particleCount: 35, spread: 50, origin: { x: 0.2, y: 0.8 } });
      await new Promise(r => setTimeout(r, 3000));

      // Stop the drums before the big finale
      if (drumroll) {
        drumroll.pause();
      }

      // Final Reveal
      setRevealedStep(3);
      playSound(SOUNDS.WINNER_FANFARE, 0.7);
      playSound(SOUNDS.CHRISTMAS_JINGLE, 0.5);
      playSound(SOUNDS.APPLAUSE, 0.4);
      
      const end = Date.now() + (4 * 1000);
      const colors = ['#ef4444', '#facc15', '#ffffff', '#22c55e'];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        } else {
          setShowButton(true);
        }
      }());
    };

    sequence();
  }, []);

  const getPositionStyles = (pos: number) => {
    switch(pos) {
      case 1: return 'h-[280px] w-full bg-gradient-to-t from-yellow-600 to-yellow-400 z-30 shadow-[0_-15px_40px_rgba(234,179,8,0.5)]';
      case 2: return 'h-[200px] w-full bg-gradient-to-t from-slate-400 to-slate-200 z-20 shadow-[0_-10px_30px_rgba(148,163,184,0.4)]';
      case 3: return 'h-[140px] w-full bg-gradient-to-t from-amber-800 to-amber-600 z-10 shadow-[0_-10px_30px_rgba(180,83,9,0.4)]';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-end overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute animate-pulse text-white text-2xl"
            style={{ 
              top: `${Math.random() * 100}%`, 
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          >
            {i % 3 === 0 ? '❄️' : i % 3 === 1 ? '✨' : '🔔'}
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 w-full">
        {revealedStep === 0 && (
          <div className="animate-in fade-in zoom-in duration-700">
             <div className="text-8xl mb-6 animate-pulse">🥁</div>
             <h2 className="text-white text-4xl md:text-6xl christmas-font font-black mb-4 drop-shadow-2xl">
               And the winner is...
             </h2>
             <div className="w-16 h-1 bg-white/20 mx-auto rounded-full animate-pulse" />
          </div>
        )}
        
        {revealedStep === 3 && (
          <div className="animate-in fade-in zoom-in duration-1000">
             <div className="text-7xl mb-4 animate-bounce">👑</div>
             <h2 className="text-yellow-400 text-6xl md:text-8xl christmas-font font-black mb-2 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]">
               CONGRATULATIONS!
             </h2>
             <p className="text-white/80 text-xl font-bold uppercase tracking-[0.3em] bg-white/5 px-8 py-3 rounded-full backdrop-blur-md inline-block">
               {first?.name}
             </p>
          </div>
        )}

        {revealedStep > 0 && revealedStep < 3 && (
          <div className="animate-pulse">
            <h2 className="text-white/40 text-4xl christmas-font font-black">
              {revealedStep === 1 ? 'Revealing 3rd place...' : 'Who will be 2nd?'}
            </h2>
          </div>
        )}
      </div>

      {/* Podium Visualization */}
      <div className="w-full max-w-3xl px-6 flex items-end justify-center gap-2 md:gap-6 h-[500px] mb-12">
        
        {/* 2nd Place */}
        <div className={`flex flex-col items-center transition-all duration-1000 ease-out flex-1 ${revealedStep >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-[200%] opacity-0'}`}>
          <div className="mb-6 flex flex-col items-center gap-2">
            <div className="text-5xl mb-2 drop-shadow-lg">🥈</div>
            <div className={`px-4 py-2 rounded-2xl ${second?.color} text-white font-black text-sm md:text-lg shadow-lg border-2 border-white/50 whitespace-nowrap`}>
              {second?.name}
            </div>
            <div className="text-white/60 font-black text-xl">
              {second?.points} pts
            </div>
          </div>
          <div className={`rounded-t-[40px] flex flex-col items-center justify-center border-x-4 border-t-4 border-white/10 ${getPositionStyles(2)}`}>
            <span className="text-6xl font-black text-slate-800/20">2</span>
          </div>
        </div>

        {/* 1st Place */}
        <div className={`flex flex-col items-center transition-all duration-1000 ease-out flex-1 ${revealedStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-[200%] opacity-0'}`}>
          <div className="mb-8 flex flex-col items-center gap-2">
            <div className="text-7xl mb-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] animate-bounce">🏆</div>
            <div className={`px-6 py-3 rounded-[30px] ${first?.color} text-white font-black text-lg md:text-2xl shadow-[0_0_40px_rgba(255,255,255,0.2)] border-4 border-yellow-300 whitespace-nowrap`}>
              {first?.name}
            </div>
            <div className="text-yellow-400 font-black text-3xl drop-shadow-md">
              {first?.points} pts
            </div>
          </div>
          <div className={`rounded-t-[50px] flex flex-col items-center justify-center border-x-4 border-t-4 border-yellow-200/30 ${getPositionStyles(1)}`}>
            <span className="text-8xl font-black text-yellow-900/20">1</span>
          </div>
        </div>

        {/* 3rd Place */}
        <div className={`flex flex-col items-center transition-all duration-1000 ease-out flex-1 ${revealedStep >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-[200%] opacity-0'}`}>
          <div className="mb-6 flex flex-col items-center gap-2">
            <div className="text-5xl mb-2 drop-shadow-lg">🥉</div>
            <div className={`px-4 py-2 rounded-2xl ${third?.color} text-white font-black text-sm md:text-lg shadow-lg border-2 border-white/50 whitespace-nowrap`}>
              {third?.name}
            </div>
            <div className="text-white/60 font-black text-xl">
              {third?.points} pts
            </div>
          </div>
          <div className={`rounded-t-[40px] flex flex-col items-center justify-center border-x-4 border-t-4 border-white/10 ${getPositionStyles(3)}`}>
            <span className="text-5xl font-black text-amber-950/20">3</span>
          </div>
        </div>

      </div>

      {/* Exit Button */}
      <div className={`w-full p-8 flex justify-center z-[110] transition-all duration-1000 ${showButton ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <button
          onClick={onFinish}
          className="bg-white text-slate-900 font-black py-4 px-12 rounded-full text-xl shadow-[0_20px_50px_rgba(255,255,255,0.2)] transition-all hover:scale-110 active:scale-95 flex items-center gap-3 group"
        >
          <span>🎁</span>
          <span>Back to start</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>
    </div>
  );
};

export default Podium;
