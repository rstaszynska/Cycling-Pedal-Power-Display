const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1250,
        height: 900,
        webPreferences: {
            // preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    mainWindow.webContents.on("select-bluetooth-device", (event, deviceList, callback) => {
        event.preventDefault();
        if (deviceList && deviceList.length > 0) {
            callback(deviceList[0].deviceId);
        }
    });

    // Listen for a message from the renderer to get the response for the Bluetooth pairing.
    ipcMain.on("bluetooth-pairing-response", (event, response) => {
        bluetoothPinCallback(response);
    });

    mainWindow.webContents.session.setBluetoothPairingHandler((details, callback) => {
        bluetoothPinCallback = callback;
        // Send a message to the renderer to prompt the user to confirm the pairing.
        mainWindow.webContents.send("bluetooth-pairing-request", details);
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, "../templates/display_selection.html"));




    const win = new BrowserWindow({
        width: 1250,
        height: 900,
        webPreferences: {
            // preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    win.webContents.openDevTools();
    win.loadFile(path.join(__dirname, '../templates/display_selection.html'));
    

    win.webContents.on("select-bluetooth-device", (event, deviceList, callback) => {
        event.preventDefault();
        if (deviceList && deviceList.length > 0) {
            callback(deviceList[0].deviceId);
        }
    });

    // Listen for a message from the renderer to get the response for the Bluetooth pairing.
    ipcMain.on("bluetooth-pairing-response", (event, response) => {
        bluetoothPinCallback(response);
    });

    win.webContents.session.setBluetoothPairingHandler((details, callback) => {
        bluetoothPinCallback = callback;
        // Send a message to the renderer to prompt the user to confirm the pairing.
        win.webContents.send("bluetooth-pairing-request", details);
    });


    let rightBicyclePower = 0;
    let leftBicyclePower = 0;

    ipcMain.on("get-right-bicycle-power", (events, data) => {
        leftBicyclePower = data[0];
        events.sender.send("updated-right-bicycle-stats", [rightBicyclePower]);
    })

    ipcMain.on("get-left-bicycle-power", (events, data) => {
        rightBicyclePower = data[0];
        events.sender.send("updated-left-bicycle-stats", [leftBicyclePower]);
    })



};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.