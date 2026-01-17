import React from 'react';
import { Cpu, Clock, MapPin } from 'lucide-react';

export default function StatusBar({ logic }) {
  const { state, timer, active_dir } = logic;

  return (
    <div className='grid grid-cols-3 gap-4'>
      {/* Active Lane Info */}
      <div className='bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between'>
        <div className='flex items-center gap-2 text-slate-400'>
          <MapPin size={16} className='text-indigo-400' />
          <span className='text-xs font-bold uppercase'>Active Lane</span>
        </div>
        <span className='text-sm font-black text-white uppercase tracking-wider'>
          {active_dir || '---'}
        </span>
      </div>

      {/* System State */}
      <div className='bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between'>
        <div className='flex items-center gap-2 text-slate-400'>
          <Cpu size={16} className='text-rose-400' />
          <span className='text-xs font-bold uppercase'>System State</span>
        </div>
        <span
          className={`text-sm font-black uppercase tracking-wider ${
            state === 'EMERGENCY'
              ? 'text-red-500 animate-pulse'
              : 'text-emerald-400'
          }`}>
          {state}
        </span>
      </div>

      {/* Timer Countdown */}
      <div className='bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between'>
        <div className='flex items-center gap-2 text-slate-400'>
          <Clock size={16} className='text-amber-400' />
          <span className='text-xs font-bold uppercase'>Next Switch</span>
        </div>
        <span className='text-sm font-mono font-black text-white'>
          {Math.floor(timer)}s
        </span>
      </div>
    </div>
  );
}
