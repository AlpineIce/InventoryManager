import { initUIListeners } from "./gui.js"

//main event
document.addEventListener("DOMContentLoaded", () => {
    //log some info
    console.log(`Using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`)
    initUIListeners();
});