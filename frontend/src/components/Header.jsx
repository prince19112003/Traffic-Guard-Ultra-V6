import React from 'react';
import {
  Activity,
  Zap,
  Moon,
  Sun,
  CloudRain,
  Wifi,
  WifiOff,
} from 'lucide-react';

export default function Header({ connected, isManual, isNight, weather }) {
  return (
    <div className='flex items-center justify-between bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-xl'>
      {/* LEFT: Logo & Title */}
      <div className='flex items-center gap-3'>
        <div className='bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20'>
          <Activity className='text-white' size={24} />
        </div>
        <div>
          <h1 className='text-xl font-black tracking-tighter text-white'>
            TRAFFIC GUARD <span className='text-indigo-400'>ULTRA</span>
          </h1>
          <p className='text-[10px] text-slate-400 uppercase tracking-widest font-semibold'>
            AI Traffic Orchestrator
          </p>
        </div>
      </div>

      {/* RIGHT: Status Indicators */}
      <div className='flex items-center gap-3'>
        {/* Weather Icon */}
        <div className='hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700'>
          {weather === 'RAIN' ? (
            <CloudRain size={16} className='text-blue-400' />
          ) : (
            <Sun size={16} className='text-amber-400' />
          )}
          <span className='text-xs font-bold text-slate-300'>{weather}</span>
        </div>

        {/* Mode Badge */}
        <div
          className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
            isManual
              ? 'bg-purple-900/50 border-purple-500 text-purple-200'
              : 'bg-emerald-900/50 border-emerald-500 text-emerald-200'
          }`}>
          <Zap size={14} />
          <span className='text-xs font-bold tracking-wider'>
            {isManual ? 'MANUAL CONTROL' : 'AI AUTO PILOT'}
          </span>
        </div>

        {/* Connection Status */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
            connected
              ? 'bg-green-950/50 border-green-600 text-green-400'
              : 'bg-red-950/50 border-red-600 text-red-400 animate-pulse'
          }`}>
          {connected ? <Wifi size={16} /> : <WifiOff size={16} />}
          <span className='text-xs font-black uppercase'>
            {connected ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>
    </div>
  );
}
