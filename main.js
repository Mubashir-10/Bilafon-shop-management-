const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow;
let backendProcess;

function startBackend() {
  // Backend server.js ko background process me run karna
  const backendPath = path.join(__dirname, 'backend', 'server.js');
  backendProcess = fork(backendPath, [], {
    env: { ...process.env, PORT: 5000, NODE_ENV: 'production' }
  });

  backendProcess.on('error', (err) => {
    console.error('Backend Error:', err);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: "Bilafon Mobile Shop Pro",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Built Frontend file load karna
  const indexPath = path.join(__dirname, 'frontend', 'dist', 'index.html');
  mainWindow.loadFile(indexPath);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});