const {app, BrowserWindow, ipcMain, Tray, Menu, MenuItem} = require('electron');
app.dock.hide(); // hide dock
const path = require('path');
const url = require('url');
var CoinDesk = require("node-coindesk");
var coindesk = new CoinDesk();
var storage = require('electron-json-storage');

var curWindow = 'index.html';


var tray = undefined;
var window = undefined;
var settingsMenu = undefined;

// check if development mode or production
var isDev = false;
for (var i = 0; i < process.argv.length; i++) {
    if (process.argv[i] == 'dev') {
        isDev = true;
    }
}

// defaults
var config = {
    showCurrencySymbol: true,
    showCommaSeparator: true,
    round: true
};

storage.get('config', function(error, data) {
    if (error) {
        // ignore
    } else {
        config = data;
    }
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

var bitcoinPrice = 0;

// put isDev in global
global.sharedObject = {isDev: isDev, bitcoinPrice: bitcoinPrice};


function createWindow() {
    let icon = path.join(__dirname, 'assets/icons/png/16x16.png');

    tray = new Tray(icon);
    tray.setTitle('$???');

    tray.setToolTip('BitcoinPrice');
    // Add a click handler so that when the user clicks on the menubar icon, it shows
    // our popup window
    tray.on('click', function (event) {
        toggleWindow('index.html');

        // Show devtools when command clicked
        if (window.isVisible() && process.defaultApp && event.metaKey) {
            window.openDevTools({mode: 'detach'})
        }
    });
    tray.on('right-click', function (event) {
        const trayPos = tray.getBounds();
        const windowPos = window.getBounds();
        var x, y = 0;
        if (process.platform == 'darwin') {
            x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2))
            y = Math.round(trayPos.y + trayPos.height)
        } else {
            x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2))
            y = Math.round(trayPos.y + trayPos.height * 10)
        }

        // more https://github.com/electron/electron/blob/master/docs/api/menu-item.md
        settingsMenu =  new Menu();
        settingsMenu.append(new MenuItem({
            label: 'Rounding',
            type: 'checkbox',
            checked: config.round,
            click:function(menuItem, browserWindow, event){
                config.round = menuItem.checked;
                console.log('menuItem',menuItem);
                console.log('browserWindow',browserWindow);
                console.log('event',event);
                saveConfig();
                showPrice();
            }
        }));
        settingsMenu.append(new MenuItem({
            label: 'Comma Separator',
            type: 'checkbox',
            checked: config.showCommaSeparator,
            click:function(menuItem, browserWindow, event){
                config.showCommaSeparator = menuItem.checked;
                saveConfig();
                showPrice();
            }
        }));
        settingsMenu.append(new MenuItem({
            label: 'Currency Symbol',
            type: 'checkbox',
            checked: config.showCurrencySymbol,
            click:function(menuItem, browserWindow, event){
                config.showCurrencySymbol = menuItem.checked;
                saveConfig();
                showPrice();
            }
        }));

        settingsMenu.append(new MenuItem({
            type: 'separator',
            label: 'Tray Settings',
        }));
        settingsMenu.append(new MenuItem({
            label: 'Close',
            type: 'normal',
            click: function() {
                closeApp();
            }
        }));

        tray.popUpContextMenu(settingsMenu,{x:x, y:y});
        // toggleWindow('settings.html');
        //
        // // Show devtools when command clicked
        // if (window.isVisible() && process.defaultApp && event.metaKey) {
        //     window.openDevTools({mode: 'detach'})
        // }
    });

    // Make the popup window for the menubar
    window = new BrowserWindow({
        width: 220,
        height: 150,
        show: false,
        frame: false,
        backgroundColor: '#4d4d4d',
        // resizable: false,
    });

    // Tell the popup window to load our index.html file
    window.loadURL(`file://${path.join(__dirname, 'index.html')}`);

    // Only close the window on blur if dev tools isn't opened
    window.on('blur', () => {
        if (!window.webContents.isDevToolsOpened()) {
            window.hide()
        }
    });

    getPrice();
    setInterval(function () {
        getPrice();
    }, 60000);


}

function getPrice() {
    coindesk.currentPrice(function (data) {
        data = JSON.parse(data);
        bitcoinPrice = data.bpi.USD.rate_float.toFixed(2);
        showPrice();
    });
}

function showPrice(){
    global.sharedObject.bitcoinPrice = bitcoinPrice;
    var currencySymbol = config.showCurrencySymbol ? '$':'';
    var btcPrice = config.round ? Math.round(bitcoinPrice) : bitcoinPrice;
    var formattedPrice = config.showCommaSeparator ? formatNumber(btcPrice) : btcPrice;
    tray.setTitle(currencySymbol + formattedPrice);
}

const showWindow = (url) => {
    const trayPos = tray.getBounds();
    const windowPos = window.getBounds();
    var x, y = 0;
    if (process.platform == 'darwin') {
        x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2))
        y = Math.round(trayPos.y + trayPos.height)
    } else {
        x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2))
        y = Math.round(trayPos.y + trayPos.height * 10)
    }

    if(url != curWindow){
        window.loadURL(`file://${path.join(__dirname, url)}`);
    }

    curWindow = url;

    window.setPosition(x, y, false);
    window.show();
    window.focus()
};

ipcMain.on('show-window', () => {
    showWindow('index.html');
});

const toggleWindow = (url) => {
    if (window.isVisible() && url == curWindow) {
        window.hide()
    } else {
        showWindow(url)
    }
};

app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});


//
// // This method will be called when Electron has finished
// // initialization and is ready to create browser windows.
// // Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
//
// // Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    app.quit();
});
//
app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (window === undefined) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


function formatNumber(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function closeApp(){
    app.quit();
}

function saveConfig(){
    storage.set('config', config, function(error) {
        if (error) {
            console.log(error);
        }
    });
}


