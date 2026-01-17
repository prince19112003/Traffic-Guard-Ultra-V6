import React from 'react';
import { Car, AlertOctagon, WifiOff } from 'lucide-react';

export default function TrafficGrid({ feeds, counts, logic, env }) {
  const directions = ['north', 'east', 'south', 'west'];
  const { active_dir, signal_map, timer } = logic;
  const { is_night, obstacle_zone } = env;

  // Helper: Border color decide karna
  const getBorderColor = dir => {
    const signal = signal_map[dir];
    if (signal === 'GREEN')
      return 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]';
    if (signal === 'YELLOW')
      return 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)]';
    return 'border-slate-800 opacity-80'; // Red/Inactive
  };

  return (
    <div className='absolute inset-0 grid grid-cols-2 gap-4'>
      {directions.map(dir => {
        const hasFeed = !!feeds[dir];
        const count = counts[dir] || 0;
        const isActive = active_dir === dir;
        const signal = signal_map[dir];

        return (
          <div
            key={dir}
            className={`
              relative rounded-2xl overflow-hidden bg-black 
              border-4 transition-all duration-500
              ${getBorderColor(dir)}
              ${isActive ? 'scale-[1.02] z-10' : 'scale-100'}
            `}>
            {/* Top Info Badges */}
            <div className='absolute top-3 left-3 flex gap-2 z-20'>
              <span className='bg-black/60 text-white text-xs px-2 py-1 rounded border border-white/10 uppercase font-bold tracking-wider'>
                {dir}
              </span>
              {signal === 'GREEN' && (
                <span className='bg-green-600 text-white text-xs px-2 py-1 rounded font-bold animate-pulse'>
                  LIVE GO
                </span>
              )}
            </div>

            {/* Vehicle Count Badge */}
            <div className='absolute top-3 right-3 z-20 bg-black/70 px-3 py-1 rounded-full border border-white/10 flex items-center gap-2'>
              <Car size={14} className='text-blue-400' />
              <span className='text-sm font-mono font-bold text-white'>
                {count}
              </span>
            </div>

            {/* CAMERA FEED OR PLACEHOLDER */}
            {hasFeed ? (
              <img
                src={`data:image/jpeg;base64,${feeds[dir]}`}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  is_night ? 'brightness-110 contrast-125' : ''
                }`}
                alt={dir}
              />
            ) : (
              <div className='w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2 bg-slate-900'>
                <WifiOff size={40} className='opacity-50' />
                <span className='text-xs uppercase tracking-widest'>
                  No Signal
                </span>
                <span className='text-[10px] opacity-50'>
                  Checking Connection...
                </span>
              </div>
            )}

            {/* Obstacle Warning Overlay */}
            {obstacle_zone === dir && (
              <div className='absolute inset-0 bg-red-500/20 flex items-center justify-center animate-pulse z-30'>
                <div className='bg-red-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-xl'>
                  <AlertOctagon size={20} /> OBSTACLE DETECTED
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
