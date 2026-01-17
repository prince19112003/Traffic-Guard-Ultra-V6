const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { spawn } = require('child_process');
const path = require('path');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// --- ARDUINO CONFIG ---
// Apna COM port check karke yahan dalein (Windows: COM3, Mac/Linux: /dev/ttyUSB0)
const ARDUINO_PORT = 'COM3';
const BAUD_RATE = 9600;

let arduino = null;

try {
  arduino = new SerialPort({ path: ARDUINO_PORT, baudRate: BAUD_RATE });
  const parser = arduino.pipe(new ReadlineParser({ delimiter: '\n' }));

  arduino.on('open', () =>
    console.log('✅ Arduino Connected on ' + ARDUINO_PORT)
  );
  parser.on('data', data => console.log('Arduino says:', data));
  arduino.on('error', err => console.log('⚠️ Arduino Error:', err.message));
} catch (err) {
  console.log('⚠️ Arduino not found (Running in Software Mode)');
}

// --- PYTHON AI ENGINE ---
const pythonProcess = spawn('python', [
  '-u', // Unbuffered output
  path.join(__dirname, '../ai_engine/main.py'),
]);

let buffer = '';

pythonProcess.stdout.on('data', data => {
  buffer += data.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop(); // Keep incomplete line

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const jsonData = JSON.parse(line);

      // 1. Send to Frontend
      io.emit('traffic-data', jsonData);

      // 2. Send to Arduino
      if (arduino && arduino.isOpen && jsonData.logic) {
        const { active_dir, state, mode } = jsonData.logic;
        // Format: "north:GREEN\n" or "EMERGENCY\n"
        let cmd = '';

        if (mode === 'EMERGENCY') {
          cmd = 'EMERGENCY\n';
        } else {
          cmd = `${active_dir}:${state}\n`;
        }

        arduino.write(cmd);
      }
    } catch (e) {
      // Ignore JSON parse errors from raw logs
    }
  }
});

pythonProcess.stderr.on('data', data => {
  console.error(`Python Error: ${data}`);
});

// --- FRONTEND COMMANDS ---
io.on('connection', socket => {
  console.log('UI Connected:', socket.id);

  socket.on('control', cmd => {
    // Send command to Python
    const cmdObj = { cmd: cmd };
    pythonProcess.stdin.write(JSON.stringify(cmdObj) + '\n');
  });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
