const fs = require('fs');
const axios = require('axios');
const path = require('path');

const rankingFile = process.argv[2];
const outputName = path.parse(rankingFile).name;

const ranking = JSON.parse(fs.readFileSync(rankingFile, 'utf8'));

const output = [];

for (const website of ranking) {
  const { domain, timestamp } = website;

  const waybackUrl = domain.substring(0,4) === "www."
    ? `https://archive.org/wayback/available?url=${domain}&timestamp=${timestamp}000000`
    : `https://archive.org/wayback/available?url=www.${domain}&timestamp=${timestamp}000000`;
  const snapshot = website;

  axios.get(waybackUrl)
  .then(res => {
    const foundSnapshot = res.data.archived_snapshots.closest;
    if (!foundSnapshot || !foundSnapshot.available) {
      console.log(`SNAPSHOT UNAVAILABLE: ${domain}`);
      return;
    }
    snapshot.url = foundSnapshot.url.substring(0, 41) + "fw_" + foundSnapshot.url.substring(41, foundSnapshot.url.length);
    snapshot.snapshot_timestamp = foundSnapshot.timestamp;

    output.push(snapshot);

    fs.writeFileSync(`./snapshots/${outputName}.json`, JSON.stringify(output, null, 1));
  })
  .catch(error => {
    console.log(`ERROR ON SNAPSHOT: ${domain}`)
    console.log(error);
  });
}