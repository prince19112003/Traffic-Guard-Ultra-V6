import React from 'react';
import { PlayCircle, PauseCircle } from 'lucide-react';

export default function PlaybackBar({ isPlayback, toggle }) {
  return (
    <button
      onClick={toggle}
      className={`
        flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border 
        font-bold text-sm tracking-wider uppercase transition-all
        ${
          isPlayback
            ? 'bg-amber-900/20 border-amber-500/50 text-amber-400'
            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
        }
      `}>
      {isPlayback ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
      {isPlayback ? 'Exit Playback Mode' : 'View History / Playback'}
    </button>
  );
}
