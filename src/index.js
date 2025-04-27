import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'node:path';

import path from 'path';
import { fileURLToPath} from 'url';

import { getDevices, selectDevice } from './scanner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//entry point
function createWindow() {
    if(BrowserWindow.getAllWindows().length === 0) {
        //create window
        const window = new BrowserWindow({
            width: 1280,
            height: 720,
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: true,
                preload: path.join(__dirname, 'preload.mjs')
            }
        });

        //remove top bar
        window.setMenuBarVisibility(false);
        
        window.webContents.session.setDevicePermissionHandler((details) => {
            if(details.deviceType === 'hid' && details.origin === 'file://') return true;
        })

        //load HTML
        window.loadFile(join(__dirname, "frontend/index.html"));
    }
}

app.whenReady().then(() => {
    //app events
    ipcMain.handle('get-devices', getDevices)
    ipcMain.on('select-device', (event, index, callback) => { selectDevice(index, callback); });

    //window creation
    createWindow()
  
    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

//oh i love apple
app.on('window-all-closed', () => {
    if(process !== 'darwin') app.quit();
})