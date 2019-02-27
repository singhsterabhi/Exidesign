const fs = require("fs");
const puppeteer = require("puppeteer");

(async () => {

  const urls = fs
    .readFileSync("./urls")
    .toString()
    .split("\n");

  // for (let i = 0; i < urls.length; i++) {
  let i = 0;
  let openUrl = async function () {
    const browser = await puppeteer.launch({
      devtools: false,
      headless: false,
      args: ['--window-size=1920,1080', '--disable-infobars']
    });

    const page = await browser.newPage();
    page.setBypassCSP(true);
    await page.setViewport({
      width: 1920,
      height: 1080
    });

    const url = urls[i];
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
      var directoryPrefix = "data/";

      var domain = url.replace(/(^\w+:|^)\/\//, "");
      const nameoffile = directoryPrefix + domain + ".json";

      fs.writeFile(nameoffile, data, err => {
        if (err) throw err;
        console.log("File successfully written to disk");
        i++;
        browser.close();
        if (i < urls.length) {
          openUrl();
        }
      });
    }

    await page.exposeFunction("writetodisk", writetodisk);

    await page.evaluate(() => {
      return startSegmentation(window);
    });

  }
  openUrl();

})();