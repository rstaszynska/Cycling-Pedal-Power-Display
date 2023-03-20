let { app, BrowserWindow, ipcMain } = require("electron");
let path = require("path");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    const leftWindow = new BrowserWindow({
        width: 1250,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // Open the DevTools.
    // leftWindow.webContents.openDevTools();

    leftWindow.webContents.on("select-bluetooth-device", (event, deviceList, callback) => {
        event.preventDefault();
        if (deviceList && deviceList.length > 0) {
            callback(deviceList[0].deviceId);
        }
    });

    // Listen for a message from the renderer to get the response for the Bluetooth pairing.
    ipcMain.on("bluetooth-pairing-response", (event, response) => {
        bluetoothPinCallback(response);
    });

    leftWindow.webContents.session.setBluetoothPairingHandler((details, callback) => {
        bluetoothPinCallback = callback;
        // Send a message to the renderer to prompt the user to confirm the pairing.
        leftWindow.webContents.send("bluetooth-pairing-request", details);
    });

    // and load the main html of the app.
    leftWindow.loadFile(path.join(__dirname, "../templates/left_display.html"));


    const rightWindow = new BrowserWindow({
        width: 1250,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    // rightWindow.webContents.openDevTools();
    rightWindow.loadFile(path.join(__dirname, '../templates/right_display.html'));

    const largeDisplay = new BrowserWindow({
        width: 1250,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    largeDisplay.loadFile(path.join(__dirname, '../templates/large_display_selection.html'));
    

    rightWindow .webContents.on("select-bluetooth-device", (event, deviceList, callback) => {
        event.preventDefault();
        if (deviceList && deviceList.length > 0) {
            callback(deviceList[0].deviceId);
        }
    });

    // Listen for a message from the renderer to get the response for the Bluetooth pairing.
    ipcMain.on("bluetooth-pairing-response", (event, response) => {
        bluetoothPinCallback(response);
    });

    rightWindow.webContents.session.setBluetoothPairingHandler((details, callback) => {
        bluetoothPinCallback = callback;
        // Send a message to the renderer to prompt the user to confirm the pairing.
        rightWindow.webContents.send("bluetooth-pairing-request", details);
    });


    var rightBicycleEnergy = 0;
    var rightBicycleMode;
    var rightBicycleDuration;
    var rightBicycleAppliance;

    var leftBicycleEnergy = 0;
    var leftBicycleMode;
    var leftBicycleDuration;
    var leftBicycleAppliance;

    var leftReady;
    var rightReady;

    ipcMain.on("get-right-bicycle-power", (events, data) => {
        leftBicycleEnergy = data[0];
        events.sender.send("updated-right-bicycle-stats", [rightBicycleEnergy]);
    })

    ipcMain.on("get-left-bicycle-power", (events, data) => {
        rightBicycleEnergy = data[0];
        events.sender.send("updated-left-bicycle-stats", [leftBicycleEnergy]);
    })

    ipcMain.on("get-right-bicycle-settings", (event, data) => {
        rightBicycleMode = data[0];
        rightBicycleDuration = data[1];
        rightBicycleAppliance = data[2];
        event.returnValue = [leftBicycleMode, leftBicycleDuration, leftBicycleAppliance];
    })

    ipcMain.on("get-left-bicycle-settings", (event, data) => {
        leftBicycleMode = data[0];
        leftBicycleDuration = data[1];
        leftBicycleAppliance = data[2];
        event.returnValue = [rightBicycleMode, rightBicycleDuration, rightBicycleAppliance];
    })

    ipcMain.on("get-right-ready-status", (event, data) => {
        rightReady = data[0];
    })

    ipcMain.on("get-left-ready-status", (event, data) => {
        leftReady = data[0];
        
        var x = setInterval(function () {
            if (rightReady && leftReady) {
                leftWindow.webContents.send("permission-to-begin", [true]);
                rightWindow.webContents.send("permission-to-begin", [true]);
                clearInterval(x);
                leftReady = false;
                rightReady = false;
            }
        }, 1000);
    })


    ipcMain.on("pause-challenge", (event, data) => {
        if (data[0] === true) {
            if (data[1] === "right") {
                leftWindow.webContents.send("request-to-pause", [true]);
            }
            else if (data[1] ===  "left") {
                rightWindow.webContents.send("request-to-pause", [true]);
            }
        }
    })

    ipcMain.on("resume-challenge", (event, data) => {
        if (data[0] === true) {
            if (data[1] === "right") {
                leftWindow.webContents.send("request-to-resume", [true]);
            }
            else if (data[1] ===  "left") {
                rightWindow.webContents.send("request-to-resume", [true]);
            }
        }
    })

    ipcMain.on("end-challenge", (event, data) => {
        if (data[0] === true) {
            if (data[1] === "right") {
                leftWindow.webContents.send("request-to-end", [true]);
            }
            else if (data[1] ===  "left") {
                rightWindow.webContents.send("request-to-end", [true]);
            }
        }
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
