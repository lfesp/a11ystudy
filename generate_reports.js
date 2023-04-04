const AxeBuilder = require('@axe-core/webdriverjs');
const WebDriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

const snapshotFile = process.argv[2];
const snapshots = JSON.parse(fs.readFileSync(snapshotFile));

const driver = new WebDriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options().addArguments("--window-size=1920,1080"))
    .build();

const builder = new AxeBuilder(driver).withTags('wcag2a');

async function generateReport(driver, snapshot) {
  console.log(snapshot.domain);
  try {
    await driver.get(snapshot.url);
    const results = await builder.analyze();
    snapshot.analysis = results;
    const outputFilename = `${snapshot.domain}_${snapshot.snapshot_timestamp.slice(0, 4)}`;
    fs.writeFileSync(`./analysis_reports/${outputFilename}.json`, JSON.stringify(snapshot, null, 1));
  }
  catch (err) {
    console.log(err);
  }
}

async function main() {

  for (const snapshot in snapshots) {
    try {
      await generateReport(driver, snapshots[snapshot]);
    }
    catch(err) {
      console.log("Errored on snapshot:" + snapshots[snapshot].domain)
      console.log(err);
    }
  }
  
  driver.quit();
}

if (require.main === module) {
  main();
}

const generateFilenameFromUrl = (url) => {
  return url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  // const m = url.toString().match(/.*\/(.+?)\./);
  // if (m && m.length > 1) return m[1];
}


