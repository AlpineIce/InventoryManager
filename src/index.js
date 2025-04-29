import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'node:path';

import path from 'path';
import { fileURLToPath} from 'url';

import { addItem, removeItem, returnFiltered, setItems } from './items.js';
import { getDevices, selectDevice } from './scanner.js';
import { processOutput } from './sheets.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export let window = null;

//entry point
function createWindow() {
    if(BrowserWindow.getAllWindows().length === 0) {
        //create window
        window = new BrowserWindow({
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

        //load HTML
        window.loadFile(join(__dirname, "frontend/index.html"));
    }
}

app.whenReady().then(() => {
    //app events
    ipcMain.on('add-item', (event, item) => { return addItem(item); });
    ipcMain.on('remove-item', (event, item) => { return removeItem(item); });
    ipcMain.on('set-items', (event, items) => { return setItems(items); });
    ipcMain.handle('return-filtered', (event, filter) => { return returnFiltered(filter); });
    ipcMain.handle('get-devices', getDevices);
    ipcMain.on('select-device', (event, index) => { return selectDevice(index); });
    ipcMain.handle('output-file', (event, catalog, adjustment) => { return processOutput(catalog, adjustment); });

    //window creation
    createWindow();
  
    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    })
})

//oh i love apple
app.on('window-all-closed', () => {
    if(process !== 'darwin') app.quit();
})