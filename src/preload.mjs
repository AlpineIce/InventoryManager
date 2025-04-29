import { contextBridge, ipcRenderer } from 'electron';

//debug version info
contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
    // we can also expose variables, not just functions
})

//actual api stuff i guess
contextBridge.exposeInMainWorld('APIbridge', {
    addItem: (item) => ipcRenderer.send('add-item', item),
    removeItem: (item) => ipcRenderer.send('remove-item', item),
    returnFiltered: (filter) => ipcRenderer.invoke('return-filtered', filter),
    setItems: (items) => ipcRenderer.send('set-items', items),
    invokeItemListchange: (callback) => ipcRenderer.on('invoke-item-list-change', (event, lastCode, lastValue) => callback(lastCode, lastValue)),
    getDevices: () => ipcRenderer.invoke('get-devices'),
    selectDevice: (index) => ipcRenderer.send('select-device', index),
    outputFile: (catalog, adjustment) => ipcRenderer.invoke('output-file', catalog, adjustment)
});
