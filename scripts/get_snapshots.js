const fs = require('fs');
const axios = require('axios');

const urlFile = process.argv[2];
const year = process.argv[3];

const urls = fs.readFileSync(urlFile, 'utf8').trim().split('\n');

const output = [];

for (const url of urls) {
  const waybackUrl = url.substring(0,4) === "www."
  ? `https://archive.org/wayback/available?url=${domain}&timestamp=${year}000000`
  : `https://archive.org/wayback/available?url=www.${domain}&timestamp=${year}000000`;
  const snapshot = {};
  axios.get(waybackUrl)
  .then(res => {
    const foundSnapshot = res.data.archived_snapshots.closest;
    if (!foundSnapshot.available) {
      console.log(`SNAPSHOT UNAVAILABLE: ${url}`);
      return;
    }
    snapshot.url = foundSnapshot.url.substring(0, 41) + "fw_" + foundSnapshot.url.substring(41, foundSnapshot.url.length);
    snapshot.snapshot_timestamp = foundSnapshot.timestamp;

    output.push(snapshot);

    fs.writeFileSync(`./snapshots/${year}.json`, JSON.stringify(output, null, 1));
  })
  .catch(error => {
    console.log(error);
  });
}