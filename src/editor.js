const { ipcRenderer } = require("electron");
const fs = require("fs");

const editor = document.getElementById("editorArea");
const lineCounter = document.getElementById("editorLines");
const pathSpan = document.getElementById("path");

let filePath;

editor.addEventListener("scroll", () => {
   lineCounter.scrollTop = editor.scrollTop;
   lineCounter.scrollLeft = editor.scrollLeft;
});

editor.addEventListener("keydown", (e) => {
   let { keyCode } = e;
   let { value, selectionStart, selectionEnd } = editor;
   if (keyCode === 9) {
      e.preventDefault();
      editor.value = value.slice(0, selectionStart) + "\t" + value.slice(selectionEnd);
      editor.setSelectionRange(selectionStart + 2, selectionStart + 2);
   }
});

let lineCountCache = 0;
function countLine() {
   let lineCount = editor.value.split("\n").length;
   let outarr = new Array();
   if (lineCountCache != lineCount) {
      for (x = 0; x < lineCount; x++) {
         outarr[x] = x + 1;
      }
      lineCounter.value = outarr.join("\n");
   }
   lineCountCache = lineCount;
}
editor.addEventListener("input", () => {
   countLine();
});

ipcRenderer.on("editor:show", (e, data) => {
   if (data.length <= 0) {
      return;
   }
   filePath = data;
   pathSpan.innerText = data;
   console.log(pathSpan);
   openFile(data);
});

function openFile(path) {
   fs.readFile(path, "utf8", (err, data) => {
      if (err) {
         console.log(err);
         return;
      }
      editor.value = data;
      countLine();
   });
}

function exit() {
   if (filePath == "" || filePath.length <= 0) return;
   ipcRenderer.send("editor:close", { file: filePath, data: editor.value });
}
