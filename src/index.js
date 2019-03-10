// const $ = require('jQuery');
const {
    ipcRenderer
} = require('electron');
const path = require('path')
const {
    BrowserWindow,
    ipcMain
} = require('electron').remote;
const fs = require("fs");
const puppeteer = require("puppeteer");
let newWin;

window.onload = function () {
    const urls = fs
        .readFileSync(path.join(__dirname, '../urls'))
        .toString()
        .split("\n");
    sourceURL = urls[2 - 1];
    targetURL = urls[6 - 1];

    newWin = new BrowserWindow({
        width: 400,
        height: 150,
        autoHideMenuBar: true
    });
    newWin.loadURL(require('url').format({
        pathname: path.join(__dirname, 'webpage.html'),
        protocol: 'file:',
        slashes: true,
        nodeIntegration: false
    }));

    newWin.on('closed', () => {
        newWin = null
    })

    newWin.webContents.on('did-finish-load', () => {
        const nameoffile = sourceURL.replace(/(^\w+:|^)\/\//, "").replace(/\/+$/, "") + "_" + targetURL.replace(/(^\w+:|^)\/\//, "").replace(/\/+$/, "") + ".json";
        newWin.webContents.send('mapping', nameoffile);
    })

    let openUrl = async function (url) {
        const browser = await puppeteer.launch({
            devtools: false,
            headless: false,
            args: ['--disable-infobars']
        });

        const page = await browser.newPage();
        page.setBypassCSP(true);
        await page.setViewport({
            width: 1920,
            height: 1080
        });

        // const url = urls[i];
        console.log("Operating on " + url + "\n");
        await page.goto(url, {
            waitUntil: "networkidle0",
            timeout: 3000000
        });
        //page.on("console", consoleObj => console.log(consoleObj.text()));

        await page.addScriptTag({
            path: require.resolve("./jquery.js")
        });
        await page.addScriptTag({
            path: require.resolve("./jquery-ui.min.js")
        });
        await page.addScriptTag({
            path: require.resolve("./nodeseperator.js")
        });

        var writetodisk = function (data) {
            var directoryPrefix = path.join(__dirname, '../data/');

            var domain = url.replace(/(^\w+:|^)\/\//, "");
            const nameoffile = directoryPrefix + domain + ".json";

            fs.writeFile(nameoffile, data, err => {
                if (err) throw err;
                console.log("File successfully written to disk");
                browser.close();
            });
        }

        await page.exposeFunction("writetodisk", writetodisk);

        await page.evaluate(() => {
            return startSegmentation(window);
        });

    }
    openUrl(sourceURL);
    openUrl(targetURL);

}