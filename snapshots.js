const axios = require('axios');

const DEFAULT_DATE = 0301000000;

async function getSnapshot(domain, year) {
  const waybackUrl =
    domain.substring(0, 4) === "www."
      ? `https://archive.org/wayback/available?url=${domain}&timestamp=${year}${DEFAULT_DATE}`
      : `https://archive.org/wayback/available?url=www.${domain}&timestamp=${year}${DEFAULT_DATE}`;

  const snapshot = {};

  const res = await axios.get(waybackUrl);

  const foundSnapshot = res.data.archived_snapshots.closest;
  if (!foundSnapshot || !foundSnapshot.available) {
    throw new Error(`SNAPSHOT UNAVAILABLE: ${domain} at ${year}`);
  }
  snapshot.url =
    foundSnapshot.url.substring(0, 41) +
    "fw_" +
    foundSnapshot.url.substring(41, foundSnapshot.url.length);
  snapshot.snapshot_timestamp = foundSnapshot.timestamp;
  snapshot.domain = domain;

  return snapshot;
}

async function getSnapshots(domain, startYear, endYear) {
  const output = [];

  for (let year = startYear; year <= endYear; year++) {
    try {
      const snapshot = await getSnapshot(domain, year);
      output.push(snapshot);
    } catch (err) {
      console.error(`ERROR ON SNAPSHOT: ${domain}`);
    }
  }

  return output;
}

module.exports = {
  getSnapshot, getSnapshots
};
