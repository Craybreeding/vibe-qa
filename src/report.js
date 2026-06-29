export function renderHtmlReport(report) {
  const { summary, issues, snapshot } = report;
  const guidance = buildGuidance(issues);
  const issueCounts = {
    error: issues.filter((issue) => issue.severity === "error").length,
    warning: issues.filter((issue) => issue.severity === "warning").length,
    info: issues.filter((issue) => issue.severity === "info").length
  };
  const issueRows = issues.map((issue) => `
    <tr>
      <td><span class="badge ${escapeHtml(issue.severity)}">${escapeHtml(issue.severity)}</span></td>
      <td><code>${escapeHtml(issue.code)}</code></td>
      <td>
        <div>${escapeHtml(issue.message)}</div>
        <details>
          <summary>Details</summary>
          <pre>${escapeHtml(JSON.stringify(issue.details || {}, null, 2))}</pre>
        </details>
      </td>
    </tr>
  `).join("");

  const fixCards = guidance.map((item, index) => `
    <article class="fix">
      <span class="step">${index + 1}</span>
      <div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.body)}</p>
      </div>
    </article>
  `).join("");

  const viewportRows = snapshot.viewports.map((viewport) => `
    <tr>
      <td>${escapeHtml(viewport.name)}</td>
      <td>${viewport.viewport.width} x ${viewport.viewport.height}</td>
      <td>${Math.max(0, Math.round(viewport.bodyOverflowX))}px</td>
      <td>${viewport.overflowingElements.length}</td>
      <td>${viewport.unlabeledClickables.length}</td>
      <td>${viewport.overlappingClickables.length}</td>
    </tr>
  `).join("");

  const screenshots = snapshot.viewports.map((viewport) => `
    <article class="shot">
      <div class="shot-header">
        <h3>${escapeHtml(viewport.name)}</h3>
        <span>${viewport.viewport.width} x ${viewport.viewport.height}</span>
      </div>
      <img src="${escapeHtml(viewport.screenshot)}" alt="${escapeHtml(viewport.name)} screenshot">
    </article>
  `).join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>vibe-qa report</title>
  <style>
    :root { color-scheme: light; --ink: #111827; --muted: #5c6b7d; --line: #dbe3ee; --panel: #ffffff; --bg: #f4f7fb; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--ink);
      background: var(--bg);
    }
    header { background: #0f172a; color: white; border-bottom: 1px solid #1f2a44; }
    .hero { max-width: 1180px; margin: 0 auto; padding: 32px 24px; }
    main { max-width: 1180px; margin: 0 auto; padding: 22px 24px 38px; }
    h1 { margin: 0 0 12px; font-size: 38px; line-height: 1.05; letter-spacing: 0; }
    h2, h3 { margin: 0; letter-spacing: 0; }
    .meta { color: #cbd5e1; line-height: 1.6; overflow-wrap: anywhere; }
    section, .shot { margin: 18px 0; padding: 18px; background: var(--panel); border: 1px solid var(--line); border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; background: white; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
    th, td { text-align: left; padding: 12px 14px; border-bottom: 1px solid #edf1f7; vertical-align: top; }
    th { color: #5f6f85; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; }
    pre { margin: 8px 0 0; padding: 10px; max-height: 220px; overflow: auto; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; }
    details { margin-top: 6px; color: var(--muted); }
    summary { cursor: pointer; }
    img { display: block; max-width: 100%; border: 1px solid #d7deea; border-radius: 8px; background: white; }
    .summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
    .metric { padding: 16px; border-radius: 8px; background: white; border: 1px solid var(--line); }
    .metric span { display: block; color: var(--muted); font-size: 13px; margin-bottom: 6px; }
    .metric strong { display: block; font-size: 26px; line-height: 1; }
    .badge { display: inline-block; min-width: 64px; text-align: center; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; }
    .error { background: #fee2e2; color: #991b1b; }
    .warning { background: #fef3c7; color: #92400e; }
    .info { background: #dbeafe; color: #1e40af; }
    .ship { color: #166534; }
    .needs.review { color: #92400e; }
    .broken { color: #991b1b; }
    .section-head { display: flex; justify-content: space-between; gap: 16px; align-items: end; margin-bottom: 14px; }
    .section-head p { margin: 6px 0 0; color: var(--muted); }
    .fixes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .fix { display: grid; grid-template-columns: 34px 1fr; gap: 12px; padding: 14px; border: 1px solid var(--line); border-radius: 8px; background: #fbfdff; }
    .fix p { margin: 6px 0 0; color: var(--muted); line-height: 1.45; }
    .step { width: 28px; height: 28px; display: inline-grid; place-items: center; border-radius: 50%; background: #0f172a; color: white; font-weight: 800; font-size: 13px; }
    .shots { display: grid; grid-template-columns: minmax(0, 1fr); gap: 18px; }
    .shot-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; color: var(--muted); }
    .shot-header h3 { color: var(--ink); text-transform: capitalize; }
    @media (max-width: 900px) { .fixes { grid-template-columns: 1fr; } }
    @media (max-width: 760px) { .summary { grid-template-columns: 1fr 1fr; } main { padding: 14px; } h1 { font-size: 30px; } }
  </style>
</head>
<body>
  <header>
    <div class="hero">
      <h1>vibe-qa report</h1>
      <div class="meta">${escapeHtml(snapshot.displayUrl || snapshot.url)}<br>Privacy-safe local report</div>
    </div>
  </header>
  <main>
    <section>
      <div class="section-head">
        <div>
          <h2>Summary</h2>
          <p>Fast launch smoke for AI-generated web apps.</p>
        </div>
      </div>
      <div class="summary">
        <div class="metric"><span>Verdict</span><strong class="${escapeHtml(summary.verdict).replace(" ", ".")}">${escapeHtml(summary.verdict)}</strong></div>
        <div class="metric"><span>Errors</span><strong>${issueCounts.error}</strong></div>
        <div class="metric"><span>Warnings</span><strong>${issueCounts.warning}</strong></div>
        <div class="metric"><span>Info</span><strong>${issueCounts.info}</strong></div>
      </div>
    </section>
    <section>
      <div class="section-head">
        <div>
          <h2>Fix Queue</h2>
          <p>The smallest next steps to make this page safer to share.</p>
        </div>
      </div>
      <div class="fixes">${fixCards || '<p>No fixes needed from this pass.</p>'}</div>
    </section>
    <section>
      <div class="section-head">
        <div>
          <h2>Viewport Checks</h2>
          <p>Layout and click-target findings by screen size.</p>
        </div>
      </div>
      <table>
        <thead><tr><th>Viewport</th><th>Size</th><th>Overflow X</th><th>Element Overflow</th><th>Unlabeled</th><th>Overlaps</th></tr></thead>
        <tbody>${viewportRows}</tbody>
      </table>
    </section>
    <section>
      <div class="section-head">
        <div>
          <h2>Issues</h2>
          <p>Sorted by severity. Fix errors first, then review warnings.</p>
        </div>
      </div>
      <table>
        <thead><tr><th>Severity</th><th>Code</th><th>Message</th></tr></thead>
        <tbody>${issueRows || '<tr><td colspan="3">No issues found.</td></tr>'}</tbody>
      </table>
    </section>
    <section>
      <div class="section-head">
        <div>
          <h2>Screenshots</h2>
          <p>Desktop and mobile captures from the audited page.</p>
        </div>
      </div>
      <div class="shots">${screenshots}</div>
    </section>
  </main>
</body>
</html>`;
}

function buildGuidance(issues) {
  const definitions = {
    "page-load-failed": ["Make the page load first", "Fix routing, server startup, or local asset errors before reviewing design quality."],
    "bad-status": ["Fix the HTTP response", "A 4xx or 5xx status means users may not be seeing the app you intended to test."],
    "page-error": ["Remove runtime crashes", "Uncaught JavaScript errors usually break real user flows and should block shipping."],
    "console-message": ["Review console errors", "Console errors from generated code often point to missing state, broken imports, or failed initialization."],
    "request-failed": ["Check failed requests", "Confirm API routes, image URLs, and third-party calls are expected for the demo environment."],
    "horizontal-overflow": ["Fix responsive width", "Replace fixed page widths with responsive constraints so mobile users do not get sideways scrolling."],
    "element-overflow": ["Fix clipped content", "Long labels and generated copy should wrap, resize, or use a larger container."],
    "unlabeled-clickable": ["Label every control", "Empty buttons need visible text, aria-label, or a title so users and assistive tech can understand them."],
    "overlapping-clickables": ["Separate click targets", "Overlapping buttons or links create accidental taps, especially on mobile."],
    "suspicious-link": ["Replace placeholder links", "Hash-only and javascript links are easy to forget and make demos feel unfinished."],
    "broken-link": ["Repair linked pages", "Same-origin links should resolve before the app is shared outside your machine."]
  };
  const seen = new Set();
  const ordered = [];
  for (const issue of issues) {
    if (seen.has(issue.code)) continue;
    seen.add(issue.code);
    const [title, body] = definitions[issue.code] || [`Review ${issue.code}`, issue.message];
    ordered.push({ title, body });
  }
  return ordered.slice(0, 6);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
