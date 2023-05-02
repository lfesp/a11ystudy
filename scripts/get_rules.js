const axe = require('axe-core');
const fs = require("fs");

const rules = axe.getRules();

const output = {};

for (rule of rules) {
  output[rule.ruleId] = rule;
}

fs.writeFileSync(
  `./axe_rules.json`,
  JSON.stringify(output, null, 1)
);