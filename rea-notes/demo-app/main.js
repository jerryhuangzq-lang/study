const { app, BrowserWindow, ipcMain } = require('electron');
ipcMain.handle('synth:note', (e, midi) => 440 * Math.pow(2, (midi - 69) / 12));
app.whenReady().then(() => new BrowserWindow({ width: 800, height: 600 }).loadFile('index.html'));
