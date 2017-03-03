const electronLocalshortcut = require('electron-localshortcut');
const {app, BrowserWindow, clipboard, dialog} = require('electron');
const path = require('path');
const url = require('url');
const windowStateKeeper = require('electron-window-state');
require('electron-reload')(__dirname);

// get os
var os;
switch (process.platform) {
    case 'darwin':
        os = 'mac';
        break;
    case 'freebsd':
        os = 'freebsd';
        break;
    case 'linux':
        os = 'linux';
        break;
    case 'sunos':
        os = 'sunos';
        break;
    case 'win32':
        os = 'win';
        break;
    case 'win64':
        os = 'win';
        break;
}

// check if development mode or production
var isDev = false;
for (var i = 0; i < process.argv.length; i++) {
    if (process.argv[i] == 'dev') {
        isDev = true;
    }
}
if (isDev) {
    console.log('Development Mode');
} else {
    console.log('Production Mode');
}


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

// put isDev in global
global.sharedObject = {isDev: isDev};

function createWindow() {

    let mainWindowState = windowStateKeeper({
        defaultWidth: 900,
        defaultHeight: 800
    });

    // Create the browser window.
    win = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        titleBarStyle: 'hidden',
        backgroundColor: '#4d4d4d',
        icon: path.join(__dirname, 'assets/icons/png/64x64.png')
    });
    mainWindowState.manage(win);
    // Disable menu bar
    win.setMenu(null);

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));


    // set dev hotkeys
    if (isDev) {
        electronLocalshortcut.register(win, 'Ctrl+I', () => {
            win.webContents.openDevTools();
        });
    }

    console.log(process.platform);
    // win.webContents.openDevTools();

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    app.quit();
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
