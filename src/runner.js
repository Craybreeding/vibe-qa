import { mkdir, rm, writeFile } from "node:fs/promises";
import { parse, resolve } from "node:path";
import { chromium } from "playwright";
import { collectDomFindings, inspectPageDom } from "./dom-checks.js";
import { createIssue, sortIssues, summarizeIssues } from "./issues.js";
import { redactReport } from "./privacy.js";
import { renderHtmlReport } from "./report.js";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 }
];

export async function runAudit(url, options = {}) {
  const startedAt = Date.now();
  const outDir = resolve(options.outDir || "vibe-qa-report");
  const screenshotDir = `${outDir}/screenshots`;
  await prepareOutputDir(outDir, screenshotDir);

  const browser = await chromium.launch({ headless: options.headless !== false });
  const issues = [];
  const events = { console: [], pageErrors: [], failedRequests: [] };
  const viewports = [];

  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height }
      });
      const page = await context.newPage();
      page.on("console", (message) => {
        if (["error", "warning"].includes(message.type())) {
          events.console.push({ viewport: viewport.name, type: message.type(), text: message.text() });
        }
      });
      page.on("pageerror", (error) => {
        events.pageErrors.push({ viewport: viewport.name, text: error.message });
      });
      page.on("requestfailed", (request) => {
        events.failedRequests.push({
          viewport: viewport.name,
          url: request.url(),
          failure: request.failure()?.errorText || "request failed"
        });
      });

      const response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: options.timeoutMs || 15_000
      }).catch((error) => {
        issues.push(createIssue("error", "page-load-failed", `${viewport.name}: ${error.message}`, { viewport: viewport.name }));
        return null;
      });

      if (response && response.status() >= 400) {
        issues.push(createIssue("error", "bad-status", `${viewport.name}: page returned HTTP ${response.status()}.`, {
          viewport: viewport.name,
          status: response.status()
        }));
      }

      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
      const screenshotPath = `${screenshotDir}/${viewport.name}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });

      const dom = await inspectPageDom(page, viewport.name);
      dom.screenshot = `screenshots/${viewport.name}.png`;
      viewports.push(dom);
      await context.close();
    }
  } finally {
    await browser.close();
  }

  for (const event of events.console) {
    issues.push(createIssue(event.type === "error" ? "error" : "warning", "console-message", `${event.viewport}: ${event.text}`, event));
  }
  for (const event of events.pageErrors) {
    issues.push(createIssue("error", "page-error", `${event.viewport}: ${event.text}`, event));
  }
  for (const event of events.failedRequests) {
    issues.push(createIssue("warning", "request-failed", `${event.viewport}: ${event.url} failed (${event.failure}).`, event));
  }

  const snapshot = {
    url,
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    viewports,
    suspiciousLinks: dedupeLinks(viewports.flatMap((viewport) => viewport.suspiciousLinks)),
    events
  };

  issues.push(...collectDomFindings(snapshot));

  if (options.checkLinks) {
    const linkIssues = await checkLinks(viewports[0]?.links || [], url, options);
    issues.push(...linkIssues);
  }

  const sortedIssues = sortIssues(issues);
  const summary = summarizeIssues(sortedIssues);
  const report = redactReport({ summary, issues: sortedIssues, snapshot });
  const html = renderHtmlReport(report);
  const htmlPath = `${outDir}/report.html`;
  const jsonPath = `${outDir}/report.json`;
  await writeFile(htmlPath, html);
  await writeFile(jsonPath, JSON.stringify(report, null, 2));

  return {
    ...report,
    paths: { html: htmlPath, json: jsonPath, screenshots: screenshotDir }
  };
}

async function prepareOutputDir(outDir, screenshotDir) {
  const root = parse(outDir).root;
  const cwd = resolve(process.cwd());
  const home = process.env.HOME ? resolve(process.env.HOME) : null;
  const protectedDirs = new Set([root, cwd, home].filter(Boolean));
  if (protectedDirs.has(outDir)) {
    throw new Error(`Refusing to clean unsafe output directory: ${outDir}`);
  }
  await rm(outDir, { recursive: true, force: true });
  await mkdir(screenshotDir, { recursive: true });
}

function dedupeLinks(links) {
  const seen = new Set();
  return links.filter((link) => {
    const key = `${link.href}|${link.text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function checkLinks(links, baseUrl, options) {
  const base = new URL(baseUrl);
  const candidates = links
    .map((link) => ({ ...link, url: safeUrl(link.absoluteHref || link.href, base) }))
    .filter((link) => link.url && link.url.protocol.startsWith("http"))
    .filter((link) => options.allLinks || link.url.origin === base.origin)
    .slice(0, options.maxLinks || 25);

  const issues = [];
  const request = await import("playwright").then(({ request }) => request.newContext());
  try {
    for (const link of candidates) {
      const response = await request.get(link.url.href, { timeout: 8000, failOnStatusCode: false }).catch((error) => {
        issues.push(createIssue("warning", "broken-link", `Link failed: ${link.url.href}`, {
          href: link.url.href,
          error: error.message
        }));
        return null;
      });
      if (response && response.status() >= 400) {
        issues.push(createIssue("warning", "broken-link", `Link returned HTTP ${response.status()}: ${link.url.href}`, {
          href: link.url.href,
          status: response.status()
        }));
      }
    }
  } finally {
    await request.dispose();
  }
  return issues;
}

function safeUrl(value, base) {
  try {
    return new URL(value, base);
  } catch {
    return null;
  }
}
