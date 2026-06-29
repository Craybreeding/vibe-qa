export function createIssue(severity, code, message, details = {}) {
  return { severity, code, message, details };
}

export function summarizeIssues(issues) {
  const counts = { error: 0, warning: 0, info: 0 };
  for (const issue of issues) {
    counts[issue.severity] = (counts[issue.severity] || 0) + 1;
  }

  let verdict = "ship";
  if (counts.error > 0) verdict = "broken";
  else if (counts.warning > 0) verdict = "needs review";

  return { verdict, counts, total: issues.length };
}

export function sortIssues(issues) {
  const order = { error: 0, warning: 1, info: 2 };
  return [...issues].sort((a, b) => {
    const bySeverity = order[a.severity] - order[b.severity];
    if (bySeverity !== 0) return bySeverity;
    return a.code.localeCompare(b.code);
  });
}
