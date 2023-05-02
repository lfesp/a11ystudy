const fs = require("fs");
const { getSnapshot } = require("./snapshots.js");
const {
  generateReport,
  getBuilder,
  getDriver,
  convertTimestamp,
} = require("./analysis.js");
const { getProcessedReport } = require("./processing.js");

async function handleGenerate(argv) {
  const domains =
    argv.domain_file === undefined
      ? argv.domains
      : fs.readFileSync(argv.domain_file, "utf8").trim().split("\n");

  snapshotStats = await handleSnapshot(argv);

  const snapshotFiles = fs.readdirSync(argv.snapshotsPath);
  argv.snapshots = snapshotFiles.filter((filename) => {
    for (const domain of domains) {
      if (filename.startsWith(domain)) return true;
    }
    return false;
  });

  analysisStats = await handleAnalyze(argv);

  const reportFiles = fs.readdirSync(argv.reportsPath);
  argv.reports = reportFiles.filter((filename) => {
    for (const domain of domains) {
      if (filename.startsWith(domain)) return true;
    }
    return false;
  });

  processingStats = handleProcess(argv);

  return;
}

async function handleSnapshot(argv) {
  if (!fs.existsSync(argv.snapshotsPath)) {
    fs.mkdirSync(argv.snapshotsPath);
  }

  const stats = {
    successes: 0,
    failures: 0,
  };

  const domains =
    argv.domain_file === undefined
      ? argv.domains
      : fs.readFileSync(argv.domain_file, "utf8").trim().split("\n");

  for (const domain of domains) {
    const output = [];

    for (let year = argv.startYear; year <= argv.endYear; year++) {
      try {
        const snapshot = await getSnapshot(domain, year);
        output.push(snapshot);
        fs.writeFileSync(
          `${argv.snapshotsPath}/${domain}.json`,
          JSON.stringify(output, null, 1)
        );
        stats.successes++;
      } catch (err) {
        stats.failures++;
        console.error(`SNAPSHOT UNAVAILABLE: ${domain} at ${year}`);
        if (argv.verbose) console.error(err);
      }
    }
  }

  return stats;
}

async function handleAnalyze(argv) {
  const driver = getDriver(argv.headless);
  const builder = getBuilder(driver, argv.tags);

  const stats = {
    successes: 0,
    failures: 0,
  };

  if (!fs.existsSync(argv.snapshotsPath)) {
    console.error(
      "NO SNAPSHOT DIRECTORY FOUND: PLEASE PROVIDE A SNAPSHOT DIRECTORY PATH"
    );
  }

  if (!fs.existsSync(argv.reportsPath)) {
    fs.mkdirSync(argv.reportsPath);
  }

  const snapshotFiles =
    argv.snapshots && argv.snapshots.length > 0
      ? argv.snapshots
      : fs.readdirSync(argv.snapshotsPath);

  for (const snapshotFile of snapshotFiles) {
    const inputPath = `${argv.snapshotsPath}/${snapshotFile}`;
    if (!fs.existsSync(inputPath)) {
      console.error(`NO SNAPSHOT FILE FOUND AT "${inputPath}"`);
      continue;
    }

    const snapshots = JSON.parse(fs.readFileSync(inputPath));
    for (const snapshot of snapshots) {
      try {
        const outputFilename = `${
          snapshot.domain
        }_${snapshot.snapshot_timestamp.slice(0, 4)}`;

        if (fs.existsSync(`${argv.reportsPath}/${outputFilename}.json`)) {
          continue;
        }

        const report = snapshot;
        const analysis = await generateReport(driver, builder, snapshot);
        report.analysis = analysis;
        report.snapshot_timestamp = convertTimestamp(report.snapshot_timestamp);

        fs.writeFileSync(
          `./${argv.reportsPath}/${outputFilename}.json`,
          JSON.stringify(report, null, 1)
        );

        stats.successes++;
      } catch (err) {
        stats.failures++;
        console.error(
          `ERROR ANALYZING SNAPSHOT: ${snapshot.domain} at ${snapshot.snapshot_timestamp}`
        );
        if (argv.verbose) console.error(err);
      }
    }
  }

  driver.quit();

  return stats;
}

function handleProcess(argv) {
  const stats = {
    successes: 0,
    failures: 0,
  };

  if (!fs.existsSync(argv.reportsPath)) {
    console.error(
      "NO REPORTS DIRECTORY FOUND: PLEASE PROVIDE AN ACCESSIBILITY REPORTS DIRECTORY PATH"
    );
  }

  const reportFiles =
    argv.reports && argv.reports.length > 0
      ? argv.reports
      : fs.readdirSync(argv.reportsPath);

  const output = [];
  const outputFilename =
    argv.summaryFile ?? `report_summary_${new Date().getTime()}`;

  for (const reportFile of reportFiles) {
    try {
      const inputPath = `${argv.reportsPath}/${reportFile}`;
      if (!fs.existsSync(inputPath)) {
        console.error(`NO ACCESSIBILITY REPORT FILE FOUND AT "${inputPath}"`);
        continue;
      }

      const report = JSON.parse(fs.readFileSync(inputPath));
      const processedReport = getProcessedReport(report);
      output.push(processedReport);

      fs.writeFileSync(
        `./${outputFilename}.json`,
        JSON.stringify(output, null, 1)
      );

      stats.successes++;
    } catch (err) {
      stats.failures++;
      console.error(`ERROR PROCESSING REPORT FILE: ${reportFile}`);
      if (argv.verbose) console.error(err);
    }
  }

  return stats;
}

module.exports = {
  handleGenerate,
  handleSnapshot,
  handleAnalyze,
  handleProcess,
};
