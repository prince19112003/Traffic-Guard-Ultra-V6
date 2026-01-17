import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client'; // WebSocket ka upgrade
import Header from './components/Header';
import StatusBar from './components/StatusBar';
import TrafficGrid from './components/TrafficGrid';
import Sidebar from './components/Sidebar';
import MiniMap from './components/MiniMap';
import PlaybackBar from './components/PlaybackBar';
import CentralSignalHUD from './components/CentralSignalHUD';

// Node.js Server URL
const SOCKET_URL = 'http://localhost:5000';

export default function App() {
  // --- 1. State Management ---
  const [data, setData] = useState({
    feeds: {}, // Base64 Images
    counts: { north: 0, east: 0, south: 0, west: 0 },
    logic: {
      active_dir: null,
      state: 'BOOTING', // Starting state
      timer: 0,
      mode: 'AUTO',
      signal_map: { north: 'RED', east: 'RED', south: 'RED', west: 'RED' },
    },
    analytics: { car: 0, bike: 0, bus: 0, truck: 0 },
    env: { is_night: false, weather_mode: 'CLEAR' },
  });

  const [connected, setConnected] = useState(false);
  const [isPlayback, setIsPlayback] = useState(false); // Live vs History Mode

  // Socket Ref
  const socketRef = useRef(null);

  // --- 2. Socket.io Connection (Component Mount hone par) ---
  useEffect(() => {
    // Connection start karo
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'], // Fast connection ke liye
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    // Connect hone par
    socket.on('connect', () => {
      console.log('✅ Connected to Brain (Node.js)');
      setConnected(true);
    });

    // Disconnect hone par
    socket.on('disconnect', () => {
      console.log('❌ Disconnected from Brain');
      setConnected(false);
    });

    // Jab Server Data bheje (Traffic Update)
    socket.on('traffic-data', newData => {
      if (!isPlayback) {
        setData(newData);
      }
    });

    // Cleanup (Component band hone par connection todo)
    return () => {
      socket.disconnect();
    };
  }, [isPlayback]);

  // --- 3. Actions (Manual Control) ---
  const sendCommand = cmd => {
    if (socketRef.current && connected) {
      console.log('Sending Command:', cmd);
      socketRef.current.emit('manual-control', cmd);
    }
  };

  // --- 4. Render Logic ---
  const { is_night } = data.env;
  const bgClass = is_night
    ? 'bg-slate-950 text-slate-200'
    : 'bg-slate-900 text-slate-100';

  return (
    <div
      className={`min-h-screen ${bgClass} p-4 flex flex-col md:flex-row gap-6 transition-colors duration-700`}>
      {/* LEFT PANEL: Visuals */}
      <div className='flex-1 flex flex-col gap-4'>
        {/* Header: Title & Status */}
        <Header
          connected={connected}
          isManual={data.logic.mode === 'MANUAL'}
          isNight={is_night}
          weather={data.env.weather_mode}
        />

        {/* Status Bar: Chota info strip */}
        <StatusBar logic={data.logic} counts={data.counts} />

        {/* Main Grid: Cameras & HUD */}
        <div className='relative flex-1 min-h-[400px]'>
          <TrafficGrid
            feeds={data.feeds}
            counts={data.counts}
            logic={data.logic}
            env={data.env}
          />
          {/* Center mein Signal HUD */}
          <CentralSignalHUD logic={data.logic} />
        </div>

        {/* Playback & Map (Optional) */}
        <div className='flex gap-4'>
          <PlaybackBar
            isPlayback={isPlayback}
            toggle={() => setIsPlayback(!isPlayback)}
          />
          <MiniMap activeDir={data.logic.active_dir} />
        </div>
      </div>

      {/* RIGHT PANEL: Controls & Stats */}
      <Sidebar
        analytics={data.analytics}
        sendCommand={sendCommand}
        mode={data.logic.mode}
      />
    </div>
  );
}
