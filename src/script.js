const fs = require("fs");
const { ipcRenderer } = require("electron");
const exec = require("child_process").exec;

var output = document.querySelector("#filelist");
const os = require("os");
const username = os.userInfo().username;

var allowedFileTypes = [];

fs.readFile("C:/Users/" + username + "/Documents/SongtextReader_Data.json", "utf8", (err, data) => {
   if (err) {
      console.log(err);
      return;
   }
   json = JSON.parse(data);
   // console.log(json, json.directory);
   document.getElementById("folder").value = json.directory;
   allowedFileTypes = json.allowedExtensions;
   updateList(json.directory);
});

function sortReverse() {
   var ul = output;
   var lis = ul.getElementsByTagName("LI");
   var vals = [];

   for (var i = 0, l = lis.length; i < l; i++) vals.push(lis[i].innerHTML);

   vals.reverse();

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
      try {
         if (file.toLowerCase().indexOf(keyword) > -1) {
            switch (true) {
               case file.indexOf(".txt") > -1:
                  if (allowedFileTypes.includes("txt")) {
                     var item = document.createElement("li");
                     item.innerHTML = file;
                     item.setAttribute("id", '"" ' + '"' + scanDirectory + "/" + file + '"');
                     item.setAttribute("class", "list-group-item list-group-item-action listItem");
                     item.setAttribute("onclick", "openFile(this.id)");
                     output.appendChild(item);
                  }
                  break;
               case file.indexOf(".png") > -1:
                  if (allowedFileTypes.includes("png")) {
                     var item = document.createElement("li");
                     item.innerHTML = file;
                     item.setAttribute("id", '"" ' + '"' + scanDirectory + "/" + file + '"');
                     item.setAttribute("class", "list-group-item list-group-item-action listItem");
                     item.setAttribute("onclick", "openFile(this.id)");
                     output.appendChild(item);
                  }
                  break;
               case file.indexOf(".pdf") > -1:
                  if (allowedFileTypes.includes("pdf")) {
                     var item = document.createElement("li");
                     item.innerHTML = '<i class="fa-solid fa-file-pdf me-2 text-secondary"></i>' + file;
                     item.setAttribute("id", '"" ' + '"' + scanDirectory + "/" + file + '"');
                     item.setAttribute("class", "list-group-item list-group-item-action listItem");
                     item.setAttribute("onclick", "openFile(this.id)");
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
                        item.setAttribute("id", '"" ' + '"' + scanDirectory + "/" + file + '"');
                        item.setAttribute("class", "list-group-item list-group-item-action listItem");
                        item.setAttribute("onclick", "openFile(this.id)");
                        output.appendChild(item);
                     }
                  });
                  break;
            }
         }
      } catch (e) {
         console.log(e);
      }
   });
}

function saveScanDirectory(scanDirectory) {
   data = { directory: scanDirectory, allowedExtensions: allowedFileTypes };
   json = JSON.stringify(data, null, 4);
   try {
      fs.writeFileSync("C:/Users/" + username + "/Documents/SongtextReader_Data.json", json, "utf-8");
   } catch (e) {
      console.log(e);
   }
}

function updateList(scanDirectory) {
   saveScanDirectory(scanDirectory);
   output.innerHTML = "";
   fs.readdirSync(scanDirectory).forEach((file) => {
      try {
         switch (true) {
            case file.indexOf(".txt") > -1:
               if (allowedFileTypes.includes("txt")) {
                  var item = document.createElement("li");
                  item.innerHTML = '<i class="fa-solid fa-file-lines me-2 text-secondary fs-5"></i>' + file;
                  item.setAttribute("id", scanDirectory + "/" + file);
                  item.dataset.type = "editor";
                  item.setAttribute("class", "list-group-item list-group-item-action listItem");
                  item.setAttribute("onclick", "openFile({ type: this.dataset.type, data: this.id })");
                  output.appendChild(item);
               }
               break;
            case file.indexOf(".png") > -1:
               if (allowedFileTypes.includes("png")) {
                  var item = document.createElement("li");
                  item.innerHTML = '<i class="fa-solid fa-file-image me-2 text-secondary fs-5"></i>' + file;
                  item.setAttribute("id", '"" ' + '"' + scanDirectory + "/" + file + '"');
                  item.dataset.type = "default";
                  item.setAttribute("class", "list-group-item list-group-item-action listItem");
                  item.setAttribute("onclick", "openFile({ type: this.dataset.type, data: this.id })");
                  output.appendChild(item);
               }
               break;
            case file.indexOf(".pdf") > -1:
               if (allowedFileTypes.includes("pdf")) {
                  var item = document.createElement("li");
                  item.innerHTML = '<i class="fa-solid fa-file-pdf me-2 text-secondary fs-5"></i>' + file;
                  item.setAttribute("id", '"" ' + '"' + scanDirectory + "/" + file + '"');
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
                     item.setAttribute("id", '"" ' + '"' + scanDirectory + "/" + file + '"');
                     item.dataset.type = "default";
                     item.setAttribute("class", "list-group-item list-group-item-action listItem");
                     item.setAttribute("onclick", "openFile({ type: this.dataset.type, data: this.id })");
                     output.appendChild(item);
                  }
               });
               break;
         }
      } catch (e) {
         console.log(e);
      }
   });
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
   // console.log(data);
   // console.log(allowedFileTypes);
   settings = data;

   // Extensions
   if (settings.extensions.txt) {
      if (!allowedFileTypes.includes("txt")) {
         allowedFileTypes.push("txt");
      }
   } else {
      if (allowedFileTypes.includes("txt")) {
         allowedFileTypes.splice(allowedFileTypes.indexOf("txt"), 1);
      }
   }
   if (settings.extensions.pdf) {
      if (!allowedFileTypes.includes("pdf")) {
         allowedFileTypes.push("pdf");
      }
   } else {
      if (allowedFileTypes.includes("pdf")) {
         allowedFileTypes.splice(allowedFileTypes.indexOf("pdf"), 1);
      }
   }
   if (settings.extensions.png) {
      if (!allowedFileTypes.includes("png")) {
         allowedFileTypes.push("png");
      }
   } else {
      if (allowedFileTypes.includes("png")) {
         allowedFileTypes.splice(allowedFileTypes.indexOf("png"), 1);
      }
   }
   updateList(document.getElementById("folder").value);
   // console.log(allowedFileTypes);
});

ipcRenderer.on("folder:selected", (e, data) => {
   if (data.length <= 0) {
      return;
   }
   document.getElementById("folder").value = data;
   updateList(document.getElementById("folder").value);
});
