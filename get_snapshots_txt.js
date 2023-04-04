const fs = require('fs');
const axios = require('axios');

const urlFile = process.argv[2];
const year = process.argv[3];

const urls = fs.readFileSync(urlFile, 'utf8').trim().split('\n');

const output = {};

for (const url of urls) {
  const waybackUrl = `https://archive.org/wayback/available?url=${url}&timestamp=${year}0301000000`;

  const snapshot = {};

  axios.get(waybackUrl)
  .then(res => {
    const foundSnapshot = res.data.archived_snapshots.closest;
    if (!foundSnapshot.available) {
      console.log(`SNAPSHOT UNAVAILABLE: ${url}`);
      return;
    }
    snapshot.url = res.data.url;
    snapshot.snapshotUrl = foundSnapshot.url.substring(0, 41) + "fw_" + foundSnapshot.url.substring(41, foundSnapshot.url.length);
    snapshot.timestamp = foundSnapshot.timestamp;

    output[`${year}_${url}`] = snapshot;

    fs.writeFileSync(`./snapshots/${year}.json`, JSON.stringify(output, null, 2));
  })
  .catch(error => {
    console.log(error);
  });
}