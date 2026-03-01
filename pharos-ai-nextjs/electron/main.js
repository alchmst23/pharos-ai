const { app, BrowserWindow, Menu } = require('electron');
const path   = require('path');
const net    = require('net');
const { spawn } = require('child_process');

const isDev   = !app.isPackaged;
const DEV_URL = 'http://localhost:3000';
const PROD_PORT = 3745; // fixed port for the embedded Next.js server

let nextServerProcess = null;

// ─── Wait until a TCP port accepts connections ────────────────────────────────
function waitForPort(port, timeoutMs = 30_000) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    function probe() {
      const sock = net.createConnection(port, '127.0.0.1');
      sock.once('connect', () => { sock.destroy(); resolve(); });
      sock.once('error', () => {
        if (Date.now() >= deadline) return reject(new Error(`Port ${port} not ready after ${timeoutMs}ms`));
        setTimeout(probe, 250);
      });
    }
    probe();
  });
}

// ─── Spawn the standalone Next.js server (production only) ───────────────────
async function startNextServer() {
  // electron-builder places extraResources in process.resourcesPath
  const serverScript = path.join(process.resourcesPath, 'standalone', 'server.js');

  nextServerProcess = spawn(process.execPath, [serverScript], {
    env: {
      ...process.env,
      PORT:      String(PROD_PORT),
      NODE_ENV:  'production',
      HOSTNAME:  '127.0.0.1',
    },
    stdio: 'pipe',
  });

  nextServerProcess.stdout.on('data', d => console.log('[Next]', d.toString().trim()));
  nextServerProcess.stderr.on('data', d => console.error('[Next]', d.toString().trim()));
  nextServerProcess.on('error', err => console.error('[Next] spawn error:', err));

  await waitForPort(PROD_PORT);
}

// ─── Create the browser window ────────────────────────────────────────────────
async function createWindow() {
  const win = new BrowserWindow({
    width:  1440,
    height: 900,
    minWidth:  1024,
    minHeight: 700,
    backgroundColor: '#1C2127',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 14 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'Pharos Intelligence',
    show: false,
  });

  Menu.setApplicationMenu(null);

  if (isDev) {
    win.loadURL(DEV_URL);
  } else {
    await startNextServer();
    win.loadURL(`http://127.0.0.1:${PROD_PORT}/dashboard`);
  }

  win.once('ready-to-show', () => {
    win.show();
    win.maximize();
  });
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
app.whenReady().then(createWindow);

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (nextServerProcess) nextServerProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (nextServerProcess) nextServerProcess.kill();
});
