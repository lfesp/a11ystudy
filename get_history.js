const fs = require('fs');
const axios = require('axios');

const domain = process.argv[2];

const output = [];

for (let year = 1996; year <= 2023; year++) {
  const waybackUrl = domain.substring(0,4) === "www."
    ? `https://archive.org/wayback/available?url=${domain}&timestamp=${year}0301000000`
    : `https://archive.org/wayback/available?url=www.${domain}&timestamp=${year}0301000000`;

  const snapshot = {};

  axios.get(waybackUrl)
  .then(res => {
    const foundSnapshot = res.data.archived_snapshots.closest;
    if (!foundSnapshot || !foundSnapshot.available) {
      console.log(`SNAPSHOT UNAVAILABLE: ${domain}`);
      return;
    }
    snapshot.url = foundSnapshot.url.substring(0, 41) + "fw_" + foundSnapshot.url.substring(41, foundSnapshot.url.length);
    snapshot.snapshot_timestamp = foundSnapshot.timestamp;
    snapshot.domain = domain;

    output.push(snapshot);

    fs.writeFileSync(`./snapshots_history/${domain}.json`, JSON.stringify(output, null, 1));
  })
  .catch(error => {
    console.log(`ERROR ON SNAPSHOT: ${domain}`)
    console.log(error);
  });
}
