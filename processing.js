const RULE_CATEGORIES = {
  "cat.aria": "aria",
  "cat.color": "color",
  "cat.forms": "forms",
  "cat.keyboard": "keyboard",
  "cat.language": "language",
  "cat.name-role-value": "name_role_value",
  "cat.parsing": "parsing",
  "cat.semantics": "semantics",
  "cat.sensory-and-visual-cues": "sensory_and_visual_cues",
  "cat.structure": "structure",
  "cat.tables": "tables",
  "cat.text-alternatives": "text_alternatives",
  "cat.time-and-media": "time_and_media",
};

function getProcessedReport(report) {
  const processedReport = {
    domain: report.domain,
    snapshot_timestamp: report.snapshot_timestamp,
    url: report.url,
    impact: {
      minor: [],
      moderate: [],
      serious: [],
      critical: [],
    },
    category: {},
  };

  for (const category of Object.values(RULE_CATEGORIES)) {
    processedReport.category[category] = 0;
  }

  processedReport.violations = report.analysis.violations.map(
    (rule) => rule.id
  );
  processedReport.passes = report.analysis.passes.map((rule) => rule.id);
  processedReport.inapplicable = report.analysis.inapplicable.map(
    (rule) => rule.id
  );
  processedReport.incomplete = report.analysis.incomplete.map(
    (rule) => rule.id
  );

  for (const violation of report.analysis.violations) {
    processedReport.impact[violation.impact].push(violation.id);
    for (const [category_tag, category] of Object.entries(RULE_CATEGORIES)) {
      if (violation.tags.includes(category_tag)) processedReport.category[category]++;
    }
  }

  return processedReport;
}

module.exports = {
  getProcessedReport,
};
