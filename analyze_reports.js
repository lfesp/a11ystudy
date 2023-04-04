const fs = require('fs');
const path = require('path');

const directoryPath = process.argv[2];

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error(`Error reading directory: ${err}`);
    return;
  }

  files.sort();

  files.forEach(file => {
    if (path.extname(file) === '.json') {
      fs.readFile(path.join(directoryPath, file), 'utf-8', (err, data) => {
        if (err) {
          console.error(`Error reading file ${file}: ${err}`);
          return;
        }

        const report = JSON.parse(data);

        const numPasses = report["passes"].length;
        const numInapplicable = report["inapplicable"].length;
        const numIncomplete = report["passes"].length;
        const numViolations = report["violations"].length;

        console.log(`Report ${file} has ${numPasses} passes, ${numViolations} violations, ${numIncomplete} incomplete, ${numInapplicable} inapplicable.`);
      });
    }
  });
});