import { contextBridge, ipcRenderer } from 'electron';
import { addItem, removeItem, returnFiltered } from './items.js';

//debug version info
contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
    // we can also expose variables, not just functions
})

//actual api stuff i guess
contextBridge.exposeInMainWorld('APIbridge', {
    addItem: () => addItem(),
    removeItem: () => removeItem(),
    returnFiltered: () => returnFiltered(),
    getDevices: () => ipcRenderer.invoke('get-devices'),
    selectDevice: (index, callback) => ipcRenderer.send('select-device', index, callback)
});
