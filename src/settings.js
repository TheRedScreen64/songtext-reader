const fs = require("fs-extra");
const path = require("path");
const { ipcRenderer } = require("electron");

const verElement = document.getElementById("version");

let settings;

fs.readFile(
   path.join(
      process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.local/share"),
      "SongtextReader",
      "config.json"
   ),
   "utf8",
   (err, data) => {
      if (err) throw err;

      settings = JSON.parse(data);
      if (settings.extensions.txt) {
         document.getElementById("check-txt").checked = true;
      }
      if (settings.extensions.pdf) {
         document.getElementById("check-pdf").checked = true;
      }
      if (settings.extensions.png) {
         document.getElementById("check-png").checked = true;
      }

      if (settings.editor.txt) {
         document.getElementById("editor-txt").checked = true;
      }
   }
);

function saveSettings() {
   settings = {
      extensions: {
         txt: document.getElementById("check-txt").checked,
         pdf: document.getElementById("check-pdf").checked,
         png: document.getElementById("check-png").checked,
      },
      editor: {
         txt: document.getElementById("editor-txt").checked,
      },
   };

   ipcRenderer.send("settings", settings);
}

ipcRenderer.on("version", (e, data) => {
   verElement.innerHTML = "Version " + data;
});

ipcRenderer.send("version");
