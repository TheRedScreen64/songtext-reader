const fs = require("fs");
const { ipcRenderer } = require("electron");
const os = require("os");
const username = os.userInfo().username;

const verElement = document.getElementById("version");

fs.readFile("C:/Users/" + username + "/Documents/SongtextReader_Data.json", "utf8", (err, data) => {
   if (err) {
      console.log(err);
      return;
   }
   json = JSON.parse(data);
   if (json.allowedExtensions.includes("txt")) {
      document.getElementById("check-txt").checked = true;
   }
   if (json.allowedExtensions.includes("pdf")) {
      document.getElementById("check-pdf").checked = true;
   }
   if (json.allowedExtensions.includes("png")) {
      document.getElementById("check-png").checked = true;
   }
});

function saveSettings() {
   settings = {
      extensions: {
         txt: document.getElementById("check-txt").checked,
         pdf: document.getElementById("check-pdf").checked,
         png: document.getElementById("check-png").checked,
      },
   };

   ipcRenderer.send("settings", settings);
}

ipcRenderer.on("version", (e, data) => {
   verElement.innerHTML = "Version " + data;
});

ipcRenderer.send("version");
