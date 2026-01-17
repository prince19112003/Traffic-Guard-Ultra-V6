import React from 'react';
import { VideoOff, AlertTriangle, Activity } from 'lucide-react';

export default function TrafficGrid({ feeds, logic, counts, env }) {
  const directions = ['north', 'east', 'south', 'west'];
  const { active_dir, signal_map, timer, state } = logic;
  const { obstacle_zone } = env;

  // --- TRAFFIC SIGNAL COMPONENT (Real-World Style) ---
  const TrafficSignal = ({ status, timeLeft }) => {
    const isGreen = status === 'GREEN';
    const isYellow = status === 'YELLOW';
    const isRed = status === 'RED';

    return (
      <div className='bg-[#1a1a1a] p-2.5 rounded-2xl border border-zinc-800 shadow-2xl flex flex-col gap-3 w-14 items-center relative z-30'>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 rounded-2xl pointer-events-none"></div>

        {/* RED LIGHT */}
        <div
          className={`relative w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
            isRed
              ? 'bg-red-600 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.6)]'
              : 'bg-[#2a0a0a] border-red-900/20 opacity-60'
          }`}>
          <div className='w-full h-full rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent)]'></div>
        </div>

        {/* YELLOW LIGHT */}
        <div
          className={`relative w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
            isYellow
              ? 'bg-amber-500 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.6)]'
              : 'bg-[#2a1b0a] border-amber-900/20 opacity-60'
          }`}>
          <div className='w-full h-full absolute rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent)]'></div>
          {isYellow && (
            <span className='relative z-10 text-[10px] font-black text-black font-mono'>
              {Math.ceil(timeLeft)}
            </span>
          )}
        </div>

        {/* GREEN LIGHT */}
        <div
          className={`relative w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
            isGreen
              ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.6)]'
              : 'bg-[#0a2a1a] border-emerald-900/20 opacity-60'
          }`}>
          <div className='w-full h-full absolute rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent)]'></div>
          {isGreen && (
            <span className='relative z-10 text-[11px] font-black text-black font-mono tracking-tighter'>
              {Math.ceil(timeLeft)}
            </span>
          )}
        </div>
      </div>
    );
  };

  // --- DENSITY BAR ---
  const DensityBar = ({ count }) => {
    const percentage = Math.min(100, (count / 20) * 100);
    const color =
      percentage > 75
        ? 'bg-red-500'
        : percentage > 40
        ? 'bg-amber-500'
        : 'bg-emerald-500';
    return (
      <div className='h-24 w-1.5 bg-zinc-800/80 rounded-full overflow-hidden flex flex-col justify-end backdrop-blur-sm border border-white/5'>
        <div
          className={`w-full transition-all duration-700 ${color}`}
          style={{ height: `${percentage}%` }}
        />
      </div>
    );
  };

  return (
    <div className='absolute inset-0 bg-[#050505] p-1 grid grid-cols-2 grid-rows-2 gap-1.5'>
      {directions.map((dir, idx) => {
        const hasFeed = !!feeds[dir];
        const currentSignal = signal_map[dir] || 'RED';
        const isGreen = currentSignal === 'GREEN';
        const isObstacle = obstacle_zone === dir;
        const count = counts[dir] || 0;
        const showTimer = active_dir === dir ? timer : 0;

        let statusText = 'STANDBY';
        let statusColor = 'text-zinc-500';
        if (isGreen) {
          statusText = 'FLOWING';
          statusColor = 'text-emerald-400';
        } else if (count > 15) {
          statusText = 'CONGESTED';
          statusColor = 'text-red-400';
        } else if (count === 0) {
          statusText = 'EMPTY';
          statusColor = 'text-zinc-600';
        }

        return (
          <div
            key={dir}
            className='relative group overflow-hidden bg-zinc-950 rounded-xl border border-zinc-900 shadow-lg'>
            {/* 1. Camera Feed */}
            {hasFeed ? (
              <div className='relative w-full h-full'>
                <img
                  src={`data:image/jpeg;base64,${feeds[dir]}`}
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    isGreen ? 'opacity-100' : 'opacity-80 grayscale-[0.3]'
                  }`}
                  alt={dir}
                />
                <div className='absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,4px_100%] pointer-events-none' />
              </div>
            ) : (
              <div className='absolute inset-0 flex flex-col items-center justify-center bg-[#080808]'>
                <div className='relative'>
                  <VideoOff size={28} className='text-zinc-800' />
                  <div className='absolute -top-1 -right-1 w-2 h-2 bg-red-900 rounded-full animate-pulse'></div>
                </div>
                <span className='mt-2 text-[10px] text-zinc-700 font-mono uppercase tracking-widest'>
                  Signal Lost
                </span>
              </div>
            )}

            {/* 2. Top Right: Realistic Signal */}
            <div className='absolute top-3 right-3 z-20 transform scale-90 origin-top-right'>
              <TrafficSignal status={currentSignal} timeLeft={showTimer} />
            </div>

            {/* 3. Right Side: Density Meter */}
            <div className='absolute right-3 bottom-3 z-20'>
              <DensityBar count={count} />
            </div>

            {/* 4. Top Left: Info & Status */}
            <div className='absolute top-3 left-3 z-10 flex flex-col gap-1.5'>
              <div className='flex items-center gap-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/5'>
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    isGreen ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'
                  }`}
                />
                <span className='text-[10px] font-bold text-slate-200 uppercase tracking-wider'>
                  CAM 0{idx + 1} • {dir}
                </span>
              </div>

              <div className='flex items-center gap-1.5 px-2 py-0.5'>
                <Activity size={10} className={statusColor} />
                <span
                  className={`text-[9px] font-bold uppercase tracking-widest ${statusColor}`}>
                  {statusText}
                </span>
              </div>
            </div>

            {/* 5. Bottom Left: Analytics */}
            <div className='absolute bottom-3 left-3 z-10'>
              <div className='flex flex-col'>
                <span className='text-[8px] text-zinc-500 uppercase font-bold tracking-wider mb-0.5'>
                  Vehicle Load
                </span>
                <div className='flex items-baseline gap-1'>
                  <span className='text-xl font-mono font-bold text-white leading-none drop-shadow-md'>
                    {count}
                  </span>
                  <span className='text-[9px] text-zinc-400 font-medium'>
                    units
                  </span>
                </div>
              </div>
            </div>

            {/* Obstacle Warning */}
            {isObstacle && (
              <div className='absolute inset-0 bg-red-500/10 z-30 flex items-center justify-center animate-pulse border-4 border-red-500/40'>
                <div className='bg-red-600/90 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-3 shadow-[0_0_30px_rgba(220,38,38,0.5)] backdrop-blur-md'>
                  <AlertTriangle size={18} className='animate-bounce' />
                  <span className='text-xs tracking-[0.2em] uppercase'>
                    Obstacle Detected
                  </span>
                </div>
              </div>
            )}

            {/* Active Border Glow */}
            {isGreen && (
              <div className='absolute inset-0 border-[2px] border-emerald-500/40 shadow-[inset_0_0_30px_rgba(16,185,129,0.05)] pointer-events-none rounded-xl' />
            )}
          </div>
        );
      })}
    </div>
  );
}
