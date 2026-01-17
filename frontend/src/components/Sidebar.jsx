import React from 'react';
import { BarChart3, ShieldAlert, Power, AlertTriangle } from 'lucide-react';

export default function Sidebar({ analytics, sendCommand, mode }) {
  // Analytics Cards Helper
  const StatCard = ({ label, value, color }) => (
    <div className='bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex flex-col items-center'>
      <span className={`text-2xl font-black ${color}`}>{value}</span>
      <span className='text-[10px] text-slate-400 uppercase font-bold'>
        {label}
      </span>
    </div>
  );

  return (
    <div className='w-full md:w-80 flex flex-col gap-4'>
      {/* 1. Analytics Panel */}
      <div className='bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl'>
        <div className='flex items-center gap-2 mb-4 text-indigo-400'>
          <BarChart3 size={20} />
          <h2 className='text-sm font-black uppercase tracking-widest'>
            Traffic Stats
          </h2>
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <StatCard label='Cars' value={analytics.car} color='text-blue-400' />
          <StatCard
            label='Bikes'
            value={analytics.bike}
            color='text-emerald-400'
          />
          <StatCard
            label='Trucks'
            value={analytics.truck}
            color='text-orange-400'
          />
          <StatCard
            label='Buses'
            value={analytics.bus}
            color='text-purple-400'
          />
        </div>
      </div>

      {/* 2. Manual Control Panel */}
      <div
        className={`bg-slate-900/90 p-5 rounded-2xl border transition-all ${
          mode === 'MANUAL'
            ? 'border-indigo-500 shadow-indigo-500/20'
            : 'border-slate-800'
        }`}>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2 text-slate-200'>
            <Power
              size={20}
              className={
                mode === 'MANUAL' ? 'text-indigo-400' : 'text-slate-600'
              }
            />
            <h2 className='text-sm font-black uppercase tracking-widest'>
              Manual Override
            </h2>
          </div>
          {/* Toggle Button */}
          <button
            onClick={() => sendCommand('TOGGLE_MODE')}
            className={`text-[10px] px-3 py-1 rounded-full font-bold border transition-all ${
              mode === 'MANUAL'
                ? 'bg-indigo-600 text-white border-indigo-400'
                : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700'
            }`}>
            {mode === 'MANUAL' ? 'ACTIVE' : 'ENABLE'}
          </button>
        </div>

        {/* Control Grid (Only works in Manual Mode) */}
        <div
          className={`grid grid-cols-2 gap-3 transition-opacity ${
            mode === 'MANUAL'
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-40 pointer-events-none'
          }`}>
          {['north', 'east', 'south', 'west'].map(dir => (
            <button
              key={dir}
              onClick={() => sendCommand(`GREEN_${dir.toUpperCase()}`)}
              className='bg-slate-800 hover:bg-green-900/40 border border-slate-700 hover:border-green-500 p-3 rounded-lg text-xs font-bold text-slate-300 uppercase transition-all active:scale-95'>
              Set {dir} Green
            </button>
          ))}
        </div>
      </div>

      {/* 3. Emergency Controls */}
      <div className='bg-red-950/20 p-5 rounded-2xl border border-red-900/50'>
        <div className='flex items-center gap-2 mb-4 text-red-500'>
          <ShieldAlert size={20} />
          <h2 className='text-sm font-black uppercase tracking-widest'>
            Emergency Zone
          </h2>
        </div>
        <button
          onClick={() => sendCommand('EMERGENCY_CLEAR')}
          className='w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 transition-transform active:scale-95'>
          <AlertTriangle size={18} />
          CLEAR ALL TRAFFIC
        </button>
      </div>
    </div>
  );
}
