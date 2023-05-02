const fs = require('fs');
const path = require('path');

const directoryPath = process.argv[2];

function convertTimestamp(timestamp) {
  const year = timestamp.slice(0, 4);
  const month = timestamp.slice(4, 6) - 1;
  const day = timestamp.slice(6, 8);
  const hour = timestamp.slice(8, 10);
  const minute = timestamp.slice(10, 12);
  const second = timestamp.slice(12, 14);
  
  return new Date(year, month, day, hour, minute, second);
}

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error(`Error reading directory: ${err}`);
    return;
  }

  files.forEach(file => {
    if (path.extname(file) === '.json') {
      fs.readFile(path.join(directoryPath, file), 'utf-8', (err, data) => {
        if (err) {
          console.error(`Error reading file ${file}: ${err}`);
          return;
        }

        try {
          const report = JSON.parse(data);
          report.snapshot_timestamp = convertTimestamp(report.snapshot_timestamp);
          fs.writeFileSync(`${directoryPath}/converted/${file}`, JSON.stringify(report, null, 1))
        } catch (err) {
          console.error(`Error parsing file ${file}: ${err}`);
          return;
        }
      });
    }
  });
});