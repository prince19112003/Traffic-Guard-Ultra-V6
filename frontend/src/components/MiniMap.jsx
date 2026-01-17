import React from 'react';

export default function MiniMap({ activeDir }) {
  // Simple CSS representation of a 4-way intersection
  const getLaneColor = dir =>
    activeDir === dir
      ? 'bg-green-500 shadow-[0_0_10px_#22c55e]'
      : 'bg-slate-700';

  return (
    <div className='hidden md:flex bg-slate-900 p-4 rounded-xl border border-slate-800 items-center justify-center'>
      <div className='relative w-24 h-24'>
        {/* Roads */}
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='w-6 h-full bg-slate-800 rounded-full'></div>
          <div className='h-6 w-full bg-slate-800 rounded-full absolute'></div>
        </div>

        {/* Lights Indicators */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full transition-colors ${getLaneColor(
            'north'
          )}`}></div>
        <div
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full transition-colors ${getLaneColor(
            'south'
          )}`}></div>
        <div
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-colors ${getLaneColor(
            'west'
          )}`}></div>
        <div
          className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-colors ${getLaneColor(
            'east'
          )}`}></div>

        {/* Center Hub */}
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-slate-950 rounded-full border-2 border-slate-700 z-10 flex items-center justify-center'>
          <div className='w-2 h-2 bg-indigo-500 rounded-full animate-ping'></div>
        </div>
      </div>
    </div>
  );
}
