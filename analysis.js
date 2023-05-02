const AxeBuilder = require("@axe-core/webdriverjs");
const WebDriver = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");

const SCREEN = {
  width: 1920,
  height: 1080,
};

function getDriver(headless = true) {
  const options = headless
    ? new chrome.Options().headless().windowSize(SCREEN)
    : new chrome.Options();
  return new WebDriver.Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
}

function getBuilder(driver, tags) {
  const builder = new AxeBuilder(driver);
  return tags !== undefined ? builder.withTags(tags) : builder;
}

function convertTimestamp(timestamp) {
  const year = timestamp.slice(0, 4);
  const month = timestamp.slice(4, 6) - 1;
  const day = timestamp.slice(6, 8);
  const hour = timestamp.slice(8, 10);
  const minute = timestamp.slice(10, 12);
  const second = timestamp.slice(12, 14);
  
  return new Date(year, month, day, hour, minute, second);
}

async function generateReport(driver, builder, snapshot) {
  await driver.get(snapshot.url);
  const results = await builder.analyze();
  return results;
}

module.exports = {
  generateReport,
  getBuilder,
  getDriver,
  convertTimestamp,
};
