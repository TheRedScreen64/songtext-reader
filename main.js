const { app, BrowserWindow, ipcMain, autoUpdater, dialog, ipcRenderer } = require("electron");
const fs = require("fs");

let mainWindow, settingsWindow;

if (require("electron-squirrel-startup")) return app.quit();

require("update-electron-app")();

//Functions
function createWindow() {
   mainWindow = new BrowserWindow({
      icon: __dirname + "/res/icon.ico",
      webPreferences: {
         nodeIntegration: true,
         contextIsolation: false,
      },
      width: 800,
      height: 600,
      minWidth: 800,
      minHeight: 300,
      autoHideMenuBar: true,
   });

   mainWindow.loadFile("src/index.html");
   // mainWindow.webContents.openDevTools();

   mainWindow.on("close", () => {
      app.quit();
   });
}

function createSettingsWindow() {
   settingsWindow = new BrowserWindow({
      icon: __dirname + "/res/icon.ico",
      webPreferences: {
         nodeIntegration: true,
         contextIsolation: false,
      },
      width: 400,
      height: 600,
      autoHideMenuBar: true,
   });

   settingsWindow.loadFile("src/settings.html");
   //settingsWindow.webContents.openDevTools()
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
   if (process.platform !== "darwin") {
      app.quit();
   }
});

app.on("activate", function () {
   if (mainWindow === null) {
      createWindow();
      autoUpdater.checkForUpdates();
   }
});

// Windows
ipcMain.on("settings:open", function (e) {
   createSettingsWindow();
});

// Data transfer
ipcMain.on("settings", function (e, data) {
   mainWindow.webContents.send("settings", data);
});

ipcMain.on("folder:select", async (e, arg) => {
   const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
   });
   e.sender.send("folder:selected", result.filePaths);
});

ipcMain.on("version", (e) => {
   e.sender.send("version", app.getVersion());
});

ipcMain.on("editor:open", async (e, data) => {
   await mainWindow.loadFile("src/editor.html");
   mainWindow.webContents.send("editor:show", data);
});
ipcMain.on("editor:close", async (e, data) => {
   fs.writeFile(data.file, data.data, (err) => {
      if (err) throw err;
   });
   await mainWindow.loadFile("src/index.html");
});
