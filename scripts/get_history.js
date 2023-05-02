const fs = require("fs");
const axios = require("axios");

const urlFile = process.argv[2];

const domains = fs.readFileSync(urlFile, "utf8").trim().split("\n");

async function getSnapshot(domain, year) {
  const waybackUrl =
    domain.substring(0, 4) === "www."
      ? `https://archive.org/wayback/available?url=${domain}&timestamp=${year}0301000000`
      : `https://archive.org/wayback/available?url=www.${domain}&timestamp=${year}0301000000`;

  const snapshot = {};

  const res = await axios.get(waybackUrl);

  const foundSnapshot = res.data.archived_snapshots.closest;
  if (!foundSnapshot || !foundSnapshot.available) {
    console.log(`SNAPSHOT UNAVAILABLE: ${domain}`);
    return;
  }
  snapshot.url =
    foundSnapshot.url.substring(0, 41) +
    "fw_" +
    foundSnapshot.url.substring(41, foundSnapshot.url.length);
  snapshot.snapshot_timestamp = foundSnapshot.timestamp;
  snapshot.domain = domain;

  return snapshot;
}

async function getSnapshots(domain) {
  const output = [];

  for (let year = 1996; year <= 2023; year++) {
    try {
      const snapshot = await getSnapshot(domain, year);
      output.push(snapshot);

      fs.writeFileSync(
        `./snapshots_history/${domain}.json`,
        JSON.stringify(output, null, 1)
      );
    } catch (err) {
      console.log(`ERROR ON SNAPSHOT: ${domain}`);
      console.log(err);
    }
  }
}

async function main() {
  for (const domain of domains) {
    try {
      if (fs.existsSync(`./snapshots_history/${domain}.json`)) {
        continue;
      }
      await getSnapshots(domain);
    } catch (err) {
      console.log("Errored on domain:" + domain);
      console.log(err);
    }
  }
}

if (require.main === module) {
  main();
}
