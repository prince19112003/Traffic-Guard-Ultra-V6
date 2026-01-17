import React from 'react';
import {
  BarChart3,
  MousePointer2,
  Power,
  AlertOctagon,
  Lock,
  Unlock,
  Leaf,
  Film,
  Video,
} from 'lucide-react';

export default function Sidebar({ analytics, logic, sendCommand }) {
  const { mode, eco_mode } = logic;
  const isManual = mode === 'MANUAL';

  const total =
    analytics.car + analytics.bike + analytics.bus + analytics.truck || 0;

  const MetricBar = ({ label, value, color }) => {
    // Prevent division by zero
    const displayTotal = total === 0 ? 1 : total;
    const percent = Math.min(100, (value / displayTotal) * 100);
    return (
      <div className='mb-3 last:mb-0'>
        <div className='flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-1'>
          <span>{label}</span>
          <span className='text-slate-200 font-mono'>{value}</span>
        </div>
        <div className='h-1.5 bg-slate-800 rounded-full overflow-hidden'>
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className='flex-1 flex flex-col p-4 gap-4 h-full bg-[#09090b] overflow-y-auto'>
      {/* 1. Eco & Simulation Controls */}
      <div className='bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col gap-3'>
        {/* Eco Mode Toggle */}
        <div className='flex items-center justify-between'>
          <div className='flex flex-col'>
            <div className='flex items-center gap-2'>
              <Leaf
                size={14}
                className={eco_mode ? 'text-emerald-400' : 'text-slate-500'}
              />
              <span className='text-[10px] font-bold text-slate-300 uppercase tracking-widest'>
                Eco Save Mode
              </span>
            </div>
            <span className='text-[8px] text-slate-600 font-medium ml-5.5'>
              Auto-sleep on low traffic
            </span>
          </div>
          <button
            onClick={() => sendCommand('ECO_TOGGLE')}
            className={`w-8 h-4 rounded-full transition-colors relative ${
              eco_mode ? 'bg-emerald-500' : 'bg-slate-700'
            }`}>
            <div
              className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${
                eco_mode ? 'left-4.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        <div className='h-px bg-white/5 my-1' />

        {/* Simple Simulation Toggle */}
        <button
          onClick={() => sendCommand('TOGGLE_SIMULATION')}
          className='w-full flex items-center justify-between bg-slate-800/50 hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500/50 text-[10px] text-slate-400 hover:text-blue-300 px-3 py-2 rounded-lg uppercase font-bold transition-all group'>
          <div className='flex items-center gap-2'>
            <Film size={12} className='group-hover:text-blue-400' />
            <span>Simulation Mode</span>
          </div>
          <div className='w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-blue-400'></div>
        </button>
      </div>

      {/* 2. Analytics */}
      <div className='bg-white/[0.02] border border-white/5 rounded-xl p-4'>
        <div className='flex items-center gap-2 mb-4 pb-2 border-b border-white/5'>
          <BarChart3 size={14} className='text-indigo-400' />
          <span className='text-[10px] font-bold text-slate-300 uppercase tracking-widest'>
            Traffic Density
          </span>
        </div>
        <MetricBar
          label='Passenger Cars'
          value={analytics.car}
          color='bg-indigo-500'
        />
        <MetricBar
          label='Motorcycles'
          value={analytics.bike}
          color='bg-emerald-500'
        />
        <MetricBar
          label='Heavy Transport'
          value={analytics.bus + analytics.truck}
          color='bg-amber-500'
        />

        <div className='mt-3 pt-2 border-t border-white/5 flex justify-between items-center'>
          <span className='text-[9px] text-slate-500 uppercase font-bold'>
            Total Vehicles
          </span>
          <span className='text-sm font-mono font-bold text-white'>
            {total}
          </span>
        </div>
      </div>

      {/* 3. Manual Control */}
      <div className='flex-1 bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col'>
        <button
          onClick={() => sendCommand(isManual ? 'AUTO' : 'MANUAL')}
          className={`
            w-full py-3 rounded-lg mb-4 flex items-center justify-center gap-2 transition-all duration-300
            border text-xs font-bold uppercase tracking-wide
            ${
              isManual
                ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }
          `}>
          {isManual ? <Unlock size={14} /> : <Lock size={14} />}
          {isManual ? 'Manual Mode Active' : 'Enable Manual Control'}
        </button>

        <div className='grid grid-cols-2 gap-2 flex-1 content-start relative'>
          {!isManual && (
            <div className='absolute inset-0 z-10 bg-[#09090b]/80 backdrop-blur-[1px] flex items-center justify-center rounded-lg border border-dashed border-white/10'>
              <span className='text-[10px] text-slate-500 uppercase font-bold'>
                Controls Locked
              </span>
            </div>
          )}

          {['north', 'east', 'south', 'west'].map(dir => (
            <button
              key={dir}
              disabled={!isManual}
              onClick={() => sendCommand(dir)}
              className={`
                 relative h-12 rounded border flex items-center justify-between px-3 transition-all
                 ${
                   logic.active_dir === dir && isManual
                     ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                     : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
                 }
               `}>
              <span className='text-[10px] font-bold uppercase'>{dir}</span>
              <MousePointer2
                size={12}
                className={
                  logic.active_dir === dir && isManual
                    ? 'text-white'
                    : 'text-slate-600'
                }
              />
            </button>
          ))}
        </div>
      </div>

      {/* 4. Emergency */}
      <button
        onClick={() => sendCommand('EMERGENCY')}
        className={`
          w-full py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 border transition-all
          ${
            mode === 'EMERGENCY'
              ? 'bg-red-600 border-red-500 text-white animate-pulse shadow-lg shadow-red-900/40'
              : 'bg-red-950/20 border-red-900/30 text-red-500 hover:bg-red-900/30 hover:border-red-800'
          }
        `}>
        <AlertOctagon size={16} />
        Emergency Stop
      </button>
    </div>
  );
}
