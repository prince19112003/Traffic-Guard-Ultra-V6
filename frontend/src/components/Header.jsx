import React from 'react';
import { Activity, Wifi, Zap, Shield, Cloud } from 'lucide-react';

export default function Header({ connected, mode, env }) {
  const isEmergency = mode === 'EMERGENCY';
  const isManual = mode === 'MANUAL';

  return (
    <header className='h-14 px-6 flex items-center justify-between bg-[#09090b] border-b border-white/5 shrink-0 z-50'>
      {/* 1. Logo & Identity */}
      <div className='flex items-center gap-4'>
        <div className='w-9 h-9 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]'>
          <Activity size={18} />
        </div>
        <div>
          <h1 className='text-sm font-bold text-slate-100 tracking-wide leading-none'>
            TRAFFIC GUARD <span className='text-indigo-500'>ULTRA</span>
          </h1>
          <p className='text-[10px] text-slate-500 font-mono tracking-[0.2em] uppercase mt-1'>
            Surveillance Unit V6
          </p>
        </div>
      </div>

      {/* 2. Center Status Indicator */}
      <div
        className={`
        hidden md:flex items-center gap-3 px-5 py-2 rounded-full border backdrop-blur-md transition-colors
        ${
          isEmergency
            ? 'bg-red-950/20 border-red-500/30 text-red-400'
            : isManual
            ? 'bg-purple-900/20 border-purple-500/30 text-purple-400'
            : 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400'
        }
      `}>
        {isEmergency ? <Shield size={14} /> : <Zap size={14} />}
        <span className='text-xs font-bold tracking-widest uppercase'>
          {mode === 'AUTO' ? 'AI AUTOPILOT ACTIVE' : `${mode} MODE OVERRIDE`}
        </span>
      </div>

      {/* 3. System Telemetry */}
      <div className='flex items-center gap-6'>
        <div className='flex flex-col items-end'>
          <span className='text-[9px] text-slate-500 font-bold uppercase tracking-wider'>
            Environment
          </span>
          <div className='flex items-center gap-1.5 text-slate-300'>
            <Cloud size={12} />
            <span className='text-xs font-mono'>{env.weather_mode}</span>
          </div>
        </div>

        <div className='h-6 w-px bg-white/10'></div>

        <div className='flex items-center gap-3'>
          <div className='flex flex-col items-end'>
            <span className='text-[9px] text-slate-500 font-bold uppercase tracking-wider'>
              System Link
            </span>
            <span
              className={`text-xs font-bold ${
                connected ? 'text-emerald-500' : 'text-rose-500'
              }`}>
              {connected ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <div
            className={`relative w-2 h-2 rounded-full ${
              connected ? 'bg-emerald-500' : 'bg-rose-500'
            }`}>
            {connected && (
              <div className='absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75'></div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
