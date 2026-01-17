import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { spawn } from 'child_process';
import { createInterface } from 'readline';

// --- CONFIGURATION ---
const PORT = 5000;
const SERIAL_PORT = 'COM3'; // Check Arduino Port
const BAUD_RATE = 9600;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. SETUP SERVER ---
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// --- 2. SERVE FRONTEND ---
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));
app.get('*', (req, res) => res.sendFile(path.join(frontendPath, 'index.html')));

// --- 3. ARDUINO CONNECTION ---
let arduino = null;
try {
  arduino = new SerialPort({ path: SERIAL_PORT, baudRate: BAUD_RATE });
  const parser = arduino.pipe(new ReadlineParser({ delimiter: '\n' }));
  console.log(`✅ Arduino Connected on ${SERIAL_PORT}`);

  parser.on('data', data => console.log('🤖 Arduino:', data.trim()));
  arduino.on('error', err => {
    console.log('⚠️ Arduino Error:', err.message);
    arduino = null;
  });
} catch (err) {
  console.log('⚠️ Arduino Not Found (Simulation Mode)');
}

const sendToArduino = cmd => {
  if (arduino && arduino.isOpen) {
    arduino.write(cmd);
  }
};

// --- 4. AI ENGINE (PYTHON) ---
let pythonProcess = null;

const startPythonEngine = () => {
  const scriptPath = path.join(__dirname, '../ai_engine/main.py');
  console.log(`🚀 Starting AI Engine: ${scriptPath}`);

  // Spawn Python
  pythonProcess = spawn('python', ['-u', scriptPath]);

  // Use Readline to read data line-by-line
  const rl = createInterface({ input: pythonProcess.stdout });

  rl.on('line', line => {
    try {
      const trafficData = JSON.parse(line.trim());

      // Frontend ko Data bhejo
      io.emit('traffic-data', trafficData);

      // Arduino Logic
      if (trafficData.logic && trafficData.logic.active_dir) {
        const cmdMap = { north: 'N', east: 'E', south: 'S', west: 'W' };
        sendToArduino(cmdMap[trafficData.logic.active_dir]);
      }
    } catch (e) {
      // Ignore incomplete JSON
    }
  });

  // Handle Errors
  pythonProcess.stderr.on('data', data => {
    console.error(`🐍 Python Log: ${data}`);
  });

  pythonProcess.on('close', code => {
    console.log(`Python process exited with code ${code}`);
  });
};

startPythonEngine();

// --- 5. SOCKET COMMUNICATION ---
io.on('connection', socket => {
  console.log('👤 User Connected');

  // Send Welcome Packet
  socket.emit('traffic-data', {
    counts: { north: 0, east: 0, south: 0, west: 0 },
    logic: {
      state: 'BOOTING',
      active_dir: null,
      timer: 0,
      mode: 'AUTO',
      signal_map: {},
    },
    env: { is_night: false, weather_mode: 'CLEAR' },
    feeds: {},
    analytics: { car: 0, bike: 0, bus: 0, truck: 0 },
  });

  // ✅ HANDLER: Frontend se Button Click aaya
  socket.on('control', action => {
    console.log('🎛️ Manual Action:', action);

    // Python ko forward karo
    if (pythonProcess && pythonProcess.stdin) {
      const command = { cmd: action };
      pythonProcess.stdin.write(JSON.stringify(command) + '\n');
    }
  });
}); // ✅ Closing bracket for io.on (Yeh miss tha aapke code mein)

// --- START ---
httpServer.listen(PORT, () => {
  console.log(`🚦 SERVER RUNNING at http://localhost:${PORT}`);
});
