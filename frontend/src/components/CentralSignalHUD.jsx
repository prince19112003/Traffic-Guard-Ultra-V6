import React, { useEffect, useRef } from 'react';

export default function CentralSignalHUD({ logic }) {
  const { active_dir, state, timer } = logic;
  const pulseRef = useRef(null);

  useEffect(() => {
    // Pulse animation reset
    if (pulseRef.current) {
      pulseRef.current.classList.remove('animate-pulse');
      void pulseRef.current.offsetWidth;
      pulseRef.current.classList.add('animate-pulse');
    }
  }, [active_dir, state]);

  // Dynamic Colors
  const getColors = () => {
    if (state === 'GREEN')
      return 'border-green-500 text-green-400 shadow-green-500/50';
    if (state === 'YELLOW')
      return 'border-yellow-400 text-yellow-400 shadow-yellow-400/50';
    return 'border-red-500 text-red-400 shadow-red-500/50';
  };

  return (
    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none'>
      <div
        ref={pulseRef}
        className={`
          w-28 h-28 rounded-full border-[6px] bg-black/80 backdrop-blur-md 
          flex flex-col items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)]
          transition-colors duration-300
          ${getColors()}
        `}>
        <span className='text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase mb-1'>
          {active_dir || '---'}
        </span>

        <span className='text-4xl font-black font-mono leading-none'>
          {Math.floor(timer)}
        </span>

        <span className='text-[9px] font-bold opacity-80 mt-1 uppercase'>
          {state}
        </span>
      </div>
    </div>
  );
}
