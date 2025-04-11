const { app, BrowserWindow, ipcMain, Menu, dialog } = require("electron");

// mysql dump
const mysqldump = require("mysqldump");

// Menu
const template = require("./menu");
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

const path = require("path");

// electron context menu
contextMenu = require("electron-context-menu");
contextMenu({
    showSaveImageAs: false,
    showSearchWithGoogle: false,
    showInspectElement: false,
    showSelectAll: false,
    showCopyImage: false,
});

// Check if electron is in development mode to enable Node.js on release mode
var node;
const isEnvSet = "ELECTRON_IS_DEV" in process.env;
const getFromEnv = Number.parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;
const isDev = isEnvSet ? getFromEnv : !app.isPackaged;
const server = require("../server");
// if (!isDev) {
//     // require server
//     node = server.listen(3000, () =>
//         console.log(`listening on port ${3000} ...`)
//     );
// }

let win;
async function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });
    win.maximize();
    win.show();

    const loadSystem = async function () {
        if (isDev) {
            win.loadURL("http://localhost:4200");
            // win.loadFile("app/browser/index.html");
        } else {
            win.loadFile("app/browser/index.html");
        }
    };

    loadSystem();

    win.webContents.on("did-fail-load", () => loadSystem());

    // require update module
    const updater = require("./update");
    updater(win, ipcMain);
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit(); // Quit the second instance immediately
} else {
    app.on("second-instance", (event, commandLine, workingDirectory) => {
        // When a second instance is opened, focus the existing window
        if (win) {
            if (win.isMinimized()) win.restore();
            win.focus();
        }
    });
    app.whenReady().then(() => {
        if (!isDev) {
            // require server
            node = server.listen(3500, () =>
                console.log(`listening on port 3500 ...`)
            );
        }
        createWindow();

        app.on("activate", () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            }
        });
    });
    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
            if (!isDev) {
                node.close();
            }
            app.quit();
        }
    });
}

// normal A4 Print
let printWindow;
ipcMain.handle("print-invoice", async (event, data) => {
    printWindow = new BrowserWindow({
        width: 706.95553,
        height: 1000,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    printWindow.loadFile("assets/print.html");
    printWindow.show();

    const printOptions = {
        silent: false, // Print without showing a dialog (optional)
        marginsType: 0, // Set margin type (optional)
    };
    printWindow.webContents.on("did-finish-load", async function () {
        await printWindow.webContents.send("printDocument", data);
        printWindow.webContents.print(printOptions, (success) => {
            printWindow.close();
        });
    });
});

// thermal print
let thermalWindow;
ipcMain.handle("thermal-print", async (event, data) => {
    thermalWindow = new BrowserWindow({
        width: 300,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });
    thermalWindow.loadFile("assets/thermalPrint.html");
    // thermalWindow.show();

    const printOptions = {
        silent: true,
        deviceName: data.printer || "XP-80C",
        marginsType: 0,
    };
    thermalWindow.webContents.on("did-finish-load", async function () {
        await thermalWindow.webContents.send("printDocument", data);
        setTimeout(function () {
            thermalWindow.webContents.print(
                printOptions,
                (success, errorType) => {
                    if (!success) {
                        console.log(errorType);
                    }
                    // thermalWindow.close();
                }
            );
        }, 200);
    });
});

ipcMain.handle("backup", () => {
    return dialog
        .showSaveDialog({
            defaultPath: "backup.sql",
            properties: ["dontAddToRecent"],
        })
        .then(function (data) {
            if (data.canceled == false) {
                try {
                    return mysqldump({
                        connection: {
                            host: "localhost",
                            user: "root",
                            password: "roottoor",
                            database: "angular-pos",
                        },
                        dumpToFile: `${data.filePath}`,
                    }).then(
                        function () {
                            return "success";
                        },
                        function (error) {
                            return error;
                        }
                    );
                } catch (error) {
                    console.log(error);
                    return error;
                }
            } else {
                return "canceled";
            }
        });
});
