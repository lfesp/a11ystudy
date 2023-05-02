const AxeBuilder = require("@axe-core/webdriverjs");
const WebDriver = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");

const snapshotFile = process.argv[2];
const snapshots = JSON.parse(fs.readFileSync(snapshotFile));

const screen = {
  width: 1920,
  height: 1080,
};

const driver = new WebDriver.Builder()
  .forBrowser("chrome")
  .setChromeOptions(new chrome.Options().headless().windowSize(screen))
  .build();

const builder = new AxeBuilder(driver).withTags(['wcag2a', 'wcag2aa']);

async function generateReport(driver, snapshot) {
  console.log(snapshot.domain);

  const outputFilename = `${
    snapshot.domain
  }_${snapshot.snapshot_timestamp.slice(0, 4)}`;

  if (fs.existsSync(`./data/analysis_reports/${outputFilename}.json`)) {
    return;
  }

  try {
    await driver.get(snapshot.url);
    const results = await builder.analyze();
    snapshot.analysis = results;

    fs.writeFileSync(
      `./data/analysis_reports/${outputFilename}.json`,
      JSON.stringify(snapshot, null, 1)
    );
  } catch (err) {
    console.log(err);
  }
}

async function main() {
  for (const snapshot in snapshots) {
    try {
      await generateReport(driver, snapshots[snapshot]);
    } catch (err) {
      console.log("Errored on snapshot:" + snapshots[snapshot].domain);
      console.log(err);
    }
  }

  driver.quit();
}

if (require.main === module) {
  main();
}
