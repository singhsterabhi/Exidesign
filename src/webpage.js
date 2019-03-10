const {
    ipcRenderer
} = require('electron');
const fs = require("fs");
const path = require('path');
let fileName="";

function init() {
    // add global variables to your web page
    window.isElectron = true
    window.ipcRenderer = ipcRenderer
}

init();

ipcRenderer.on('mapping', (event, name) => {
    fileName=name;
    console.log(fileName)
})

let mappings = {};

function map() {
    let source = document.getElementById('source').value;
    document.getElementById('source').value = "";
    let target = document.getElementById('target').value;
    document.getElementById('target').value = "";
    mappings[source] = target;
    console.log(mappings);
}

function finish() {
    console.log(mappings);
    var directoryPrefix = path.join(__dirname, '../mappings/');
    // const nameoffile = directoryPrefix + domain + ".json";
    const nameoffile = directoryPrefix + fileName;
    fs.writeFile(nameoffile, JSON.stringify(mappings, null, 2), err => {
        if (err) throw err;
        console.log("File successfully written to disk");
    });

}