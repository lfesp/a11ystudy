#!/usr/bin/env node

const fs = require("fs");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const {
  handleSnapshot,
  handleAnalyze,
  handleGenerate,
  handleProcess,
} = require("./commands.js");

yargs(hideBin(process.argv))
  .command(
    ["generate [domains..]", "$0 [domains..]"],
    "generate a full accessibility dataset and summary",
    (yargs) => {
      return yargs
        .positional("domains", {
          describe: "Domains to grab snapshots from",
          type: "string",
          default: ["www.google.com"],
          conflicts: "domain-file",
        })
        .option("headless", {
          type: "boolean",
          alias: "h",
          description: "Run with headless browser",
          default: false,
        })
        .option("start-year", {
          alias: "s",
          type: "number",
          description: "Start year for snapshot range",
          default: 1996,
        })
        .option("end-year", {
          alias: "e",
          type: "number",
          description: "End year for snapshot range",
          default: new Date().getFullYear(),
        })
        .option("tags", {
          type: "string",
          alias: "t",
          description: "Tags for axe-core accessibility assessment",
          default: ["wcag2a", "wcag2aa", "wcag2aaa"],
          array: true,
        })
        .option("domain-file", {
          alias: "d",
          type: "string",
          description: "File listing domains for analysis",
        })
        .option("snapshots-path", {
          type: "string",
          description: "Web page snapshot directory",
          default: "./snapshots",
          normalize: true,
        })
        .option("reports-path", {
          type: "string",
          description: "Accessibility report directory",
          default: "./accessibility_reports",
          normalize: true,
        })
        .option("summary-file", {
          describe: "File name for data summary",
          alias: "o",
          type: "string",
        });
    },
    (argv) => {
      console.log("this command will be run by default");
      handleGenerate(argv);
    }
  )
  .command(
    "snapshot [domains..]",
    "retrieve archived web page snapshots",
    (yargs) => {
      return yargs
        .positional("domains", {
          describe: "Domains to grab snapshots from",
          type: "string",
          default: ["www.google.com"],
          conflicts: "domain-file",
        })
        .option("domain-file", {
          alias: "d",
          type: "string",
          description: "Path to domain input file",
        })
        .option("snapshots-path", {
          type: "string",
          description: "Web page snapshot directory",
          default: "./snapshots",
          normalize: true,
        })
        .option("start-year", {
          alias: "s",
          type: "number",
          description: "Start year for snapshot range",
          default: 1996,
        })
        .option("end-year", {
          alias: "e",
          type: "number",
          description: "End year for snapshot range",
          default: new Date().getFullYear(),
        });
    },
    (argv) => {
      handleSnapshot(argv);
    }
  )
  .command(
    "analyze [snapshots..]",
    "analyze accessibility of web page snapshots",
    (yargs) => {
      return yargs
        .positional("snapshots", {
          describe: "individual snapshot files to analyze.",
          type: "string",
        })
        .option("headless", {
          type: "boolean",
          alias: "h",
          description: "Run with headless browser",
          default: false,
        })
        .option("tags", {
          type: "string",
          alias: "t",
          description: "Tags for axe-core accessibility assessment",
          default: ["wcag2a, wcag2aa, wcag2aaa"],
          array: true,
        })
        .option("snapshots-path", {
          type: "string",
          description: "web page snapshot directory",
          default: "./snapshots",
          normalize: true,
        })
        .option("reports-path", {
          type: "string",
          description: "accessibility report directory",
          default: "./accessibility_reports",
          normalize: true,
        });
    },
    (argv) => {
      console.log("this command is run by analyze");
      handleAnalyze(argv);
    }
  )
  .command(
    "process [reports..]",
    "process accessibility reports into a dataset summary",
    (yargs) => {
      return yargs
        .positional("reports", {
          describe: "Individual accessibility report files to process",
          type: "string",
        })
        .option("reports-path", {
          type: "string",
          description: "Directory for accessibility reports",
          default: "./accessibility_reports",
          normalize: true,
        })
        .option("summary-file", {
          describe: "File name for data summary",
          alias: "o",
          type: "string",
        });
    },
    (argv) => {
      handleProcess(argv);
    }
  )
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Run with verbose logging",
  })
  .argv;
