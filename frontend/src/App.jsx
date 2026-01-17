import React, { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import Header from './components/Header';
import TrafficGrid from './components/TrafficGrid';
import Sidebar from './components/Sidebar';

const SOCKET_URL = 'http://localhost:5000';

export default function App() {
  const [feeds, setFeeds] = useState({});
  const [telemetry, setTelemetry] = useState({
    counts: { north: 0, east: 0, south: 0, west: 0 },
    logic: {
      active_dir: null,
      state: 'OFFLINE',
      timer: 0,
      mode: 'AUTO',
      eco_mode: false,
      signal_map: {},
    },
    analytics: { car: 0, bike: 0, bus: 0, truck: 0 },
    env: { is_night: false, weather_mode: 'CLEAR', obstacle_zone: null },
  });
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
    const socket = socketRef.current;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('traffic-data', data => {
      if (data.feeds) setFeeds(data.feeds);
      const { feeds: _, ...metrics } = data;
      setTelemetry(metrics);
    });

    return () => socket.disconnect();
  }, []);

  const sendCommand = useCallback(
    cmd => {
      if (socketRef.current && connected)
        socketRef.current.emit('control', cmd);
    },
    [connected]
  );

  return (
    <div className='h-screen w-screen flex flex-col text-slate-300'>
      <Header
        connected={connected}
        mode={telemetry.logic.mode}
        env={telemetry.env}
      />

      <main className='flex-1 flex overflow-hidden p-2 gap-2'>
        <div className='flex-1 relative rounded-xl overflow-hidden border border-white/5 bg-black shadow-2xl'>
          <TrafficGrid
            feeds={feeds}
            logic={telemetry.logic}
            counts={telemetry.counts}
            env={telemetry.env}
          />
        </div>

        <aside className='w-[340px] flex-shrink-0 flex flex-col bg-[#09090b]/90 border-l border-white/5 rounded-xl overflow-hidden'>
          <Sidebar
            analytics={telemetry.analytics}
            logic={telemetry.logic}
            sendCommand={sendCommand}
          />
        </aside>
      </main>
    </div>
  );
}
