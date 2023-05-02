const AxeBuilder = require("@axe-core/webdriverjs");
const WebDriver = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");

const SCREEN = {
  width: 1920,
  height: 1080,
};

const PROJECT_URL = "https://a11ystudy-web.vercel.app/";

const driver = new WebDriver.Builder()
  .forBrowser("chrome")
  .setChromeOptions(new chrome.Options().headless().windowSize(SCREEN))
  .build();

const builder = new AxeBuilder(driver);

async function generateReport(driver) {
  try {
    await driver.get(PROJECT_URL);
    const results = await builder.analyze();

    fs.writeFileSync(
      `./a11ystudy-web_report.json`,
      JSON.stringify(results, null, 1)
    );
  } catch (err) {
    console.log(err);
  }
}

async function main() {
  try {
    await generateReport(driver);
  } catch (err) {
    console.log(err);
  }

  driver.quit();
}

if (require.main === module) {
  main();
}
