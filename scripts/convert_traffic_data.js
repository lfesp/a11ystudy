const fs = require('fs');
const path = require('path');

function formatJsonField(string) {
  return string.toLowerCase().replace(/\s+/g, '_');
}

function csvToJson(csv, timestamp) {
  const lines = csv.trim().split('\n');
  const headers = lines.shift().split(',').map(header => header.trim());
  const rows = lines.map(line => line.split(',').map(val => val.trim()));

  return rows.map(row => {
    const obj = {};

    row.forEach((val, i) => {
      obj[formatJsonField(headers[i])] = isNaN(val) ? val : Number(val);
    });

    obj["timestamp"] = timestamp;

    return obj;
  });
}

const filePath = process.argv[2];
const fileName = path.basename(filePath);
const year = fileName.substring(22, 26);
const timestamp = parseInt(fileName.substring(22, 30));

const csv = fs.readFileSync(filePath, 'utf-8');

const json = JSON.stringify(csvToJson(csv, timestamp), null, 1);

fs.writeFileSync(`./seo_data/${year}.json`, json);