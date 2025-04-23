const { app, BrowserWindow } = require('electron')

app.whenReady().then(() => {
    //create window
    const window = new BrowserWindow({
        width: 1280,
        height: 720
    });

    //load HTML
    window.loadFile('src/index.html');
})