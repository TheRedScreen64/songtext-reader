const fs = require("fs-extra");
const path = require("path");
const { ipcRenderer } = require("electron");
const exec = require("child_process").exec;

var output = document.querySelector("#filelist");
const os = require("os");
const username = os.userInfo().username;

let allowedFileTypes;
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
      document.getElementById("folder").value = settings.directory;
      allowedFileTypes = settings.extensions;
      updateList(settings.directory);
   }
);

function sortReverse() {
   var ul = output;
   var lis = ul.getElementsByTagName("LI");
   var vals = [];

   for (var i = 0, l = lis.length; i < l; i++) vals.push(lis[i].innerHTML);

   vals.sort().reverse();

   for (var i = 0, l = lis.length; i < l; i++) lis[i].innerHTML = vals[i];
}
function sort() {
   var ul = output;
   var lis = ul.getElementsByTagName("LI");
   var vals = [];

   for (var i = 0, l = lis.length; i < l; i++) vals.push(lis[i].innerHTML);

   vals.sort();

   for (var i = 0, l = lis.length; i < l; i++) lis[i].innerHTML = vals[i];
}

function search(keyword) {
   const scanDirectory = document.getElementById("folder").value;
   output.innerHTML = "";
   fs.readdirSync(scanDirectory).forEach((file) => {
      if (file.toLowerCase().indexOf(keyword) > -1) {
         createElement(file, scanDirectory);
      }
   });
}

function saveConfig(scanDirectory) {
   let json = {
      directory: scanDirectory,
      extensions: settings.extensions,
      editor: settings.editor,
   };

   let data = JSON.stringify(json);
   try {
      fs.outputFile(
         path.join(
            process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.local/share"),
            "SongtextReader",
            "config.json"
         ),
         data,
         (err) => {
            if (err) throw err;
         }
      );
   } catch (err) {
      console.error(err);
   }

   updateList(scanDirectory);
}

function updateList(scanDirectory) {
   output.innerHTML = "";
   try {
      fs.readdirSync(scanDirectory).forEach((file) => {
         createElement(file, scanDirectory);
      });
   } catch (error) {
      console.error(error);
   }
}

function createElement(file, scanDirectory) {
   switch (true) {
      case file.indexOf(".txt") > -1:
         if (allowedFileTypes.txt) {
            var item = document.createElement("li");
            item.innerHTML = '<i class="fa-solid fa-file-lines me-2 text-secondary fs-5"></i>' + file;
            item.setAttribute("id", scanDirectory + "\\" + file);
            if (settings.editor.txt) {
               item.dataset.type = "editor";
            } else {
               item.dataset.type = "default";
            }
            item.setAttribute("class", "list-group-item list-group-item-action listItem");
            item.setAttribute("onclick", "openFile({ type: this.dataset.type, data: this.id })");
            output.appendChild(item);
         }
         break;
      case file.indexOf(".png") > -1:
         if (allowedFileTypes.png) {
            var item = document.createElement("li");
            item.innerHTML = '<i class="fa-solid fa-file-image me-2 text-secondary fs-5"></i>' + file;
            item.setAttribute("id", '"" ' + '"' + scanDirectory + "\\" + file + '"');
            item.dataset.type = "default";
            item.setAttribute("class", "list-group-item list-group-item-action listItem");
            item.setAttribute("onclick", "openFile({ type: this.dataset.type, data: this.id })");
            output.appendChild(item);
         }
         break;
      case file.indexOf(".pdf") > -1:
         if (allowedFileTypes.pdf) {
            var item = document.createElement("li");
            item.innerHTML = '<i class="fa-solid fa-file-pdf me-2 text-secondary fs-5"></i>' + file;
            item.setAttribute("id", '"" ' + '"' + scanDirectory + "\\" + file + '"');
            item.dataset.type = "default";
            item.setAttribute("class", "list-group-item list-group-item-action listItem");
            item.setAttribute("onclick", "openFile({ type: this.dataset.type, data: this.id })");
            output.appendChild(item);
         }
         break;
      default:
         dir = scanDirectory;
         if (dir.charAt(dir.length - 1) != "/" || dir.charAt(dir.length - 1) != "\\") {
            dir = dir + "\\";
         }
         fs.stat(dir + file, (err, stats) => {
            if (err) throw err;
            if (stats.isDirectory()) {
               var item = document.createElement("li");
               item.innerHTML = '<i class="fa-solid fa-folder me-2 text-secondary"></i>' + file;
               item.setAttribute("id", '"" ' + '"' + scanDirectory + "\\" + file + '"');
               item.dataset.type = "default";
               item.setAttribute("class", "list-group-item list-group-item-action listItem");
               item.setAttribute("onclick", "openFile({ type: this.dataset.type, data: this.id })");
               output.appendChild(item);
            }
         });
         break;
   }
}

function openFile(file) {
   switch (file.type) {
      case "editor":
         ipcRenderer.send("editor:open", file.data);
         break;
      default:
         exec(getCommandLine() + " " + file.data);
         break;
   }
}

function getCommandLine() {
   switch (process.platform) {
      case "darwin":
         return "open";
      case "win32":
         return "start";
      case "win64":
         return "start";
      default:
         return "xdg-open";
   }
}

ipcRenderer.on("settings", function (e, data) {
   settings = data;

   allowedFileTypes = settings.extensions;

   saveConfig(document.getElementById("folder").value);
});

ipcRenderer.on("folder:selected", (e, data) => {
   if (data.length <= 0) {
      return;
   }

   document.getElementById("folder").value = data[0];
   saveConfig(data[0]);
   console.log(data, " oder ", data[0]);
});

function updateDirectory(newDirectory) {
   document.getElementById("folder").value = newDirectory;
   updateList(document.getElementById("folder").value);
}
