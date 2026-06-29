import { isAbsolute, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { existsSync } from "node:fs";
import { runAudit } from "./runner.js";

export function parseArgs(argv) {
  const args = argv.slice(2);
  const options = {
    outDir: "vibe-qa-report",
    checkLinks: false,
    maxLinks: 25,
    timeoutMs: 15_000,
    headless: true,
    failOn: "error",
    json: false
  };

  let target = null;
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else if (arg === "--out") {
      options.outDir = args[++i];
    } else if (arg === "--links") {
      options.checkLinks = true;
    } else if (arg === "--max-links") {
      options.maxLinks = Number(args[++i]);
    } else if (arg === "--timeout") {
      options.timeoutMs = Number(args[++i]);
    } else if (arg === "--no-headless") {
      options.headless = false;
    } else if (arg === "--fail-on") {
      options.failOn = args[++i];
    } else if (arg === "--json") {
      options.json = true;
    } else if (!target) {
      target = arg;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }

  validateOptions(options);
  return { target, options };
}

export function normalizeTarget(target) {
  if (!target) return null;
  if (/^https?:\/\//i.test(target) || /^file:\/\//i.test(target)) return target;
  const absolute = resolve(target);
  if (existsSync(absolute)) return pathToFileURL(absolute).href;
  return `https://${target}`;
}

export function helpText() {
  return `vibe-qa <url-or-file> [options]

Options:
  --out <dir>          Output directory. Default: ./vibe-qa-report
  --links             Check same-origin links with HTTP requests
  --max-links <n>     Maximum links to request. Default: 25
  --timeout <ms>      Page load timeout. Default: 15000
  --fail-on <level>   Exit non-zero on error, warning, or never. Default: error
  --json              Print machine-readable summary JSON
  --no-headless       Show the browser
  -h, --help          Show help`;
}

export async function runCli(argv) {
  const { target, options } = parseArgs(argv);
  if (options.help || !target) {
    console.log(helpText());
    process.exitCode = target ? 0 : 2;
    return null;
  }

  const url = normalizeTarget(target);
  const result = await runAudit(url, {
    ...options,
    outDir: resolve(options.outDir)
  });

  const counts = result.summary.counts;
  if (options.json) {
    console.log(JSON.stringify({
      verdict: result.summary.verdict,
      counts,
      total: result.summary.total,
      report: displayPath(result.paths.html),
      json: displayPath(result.paths.json)
    }, null, 2));
  } else {
    console.log(`vibe-qa: ${result.summary.verdict}`);
    console.log(`issues: ${counts.error} error, ${counts.warning} warning, ${counts.info} info`);
    console.log(`report: ${displayPath(result.paths.html)}`);
  }
  if (shouldFail(result.summary, options.failOn)) {
    process.exitCode = 1;
  }
  return result;
}

function validateOptions(options) {
  if (!Number.isFinite(options.maxLinks) || options.maxLinks < 0) {
    throw new Error("--max-links must be a non-negative number");
  }
  if (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0) {
    throw new Error("--timeout must be a positive number of milliseconds");
  }
  if (!["error", "warning", "never"].includes(options.failOn)) {
    throw new Error("--fail-on must be one of: error, warning, never");
  }
}

function shouldFail(summary, failOn) {
  if (failOn === "never") return false;
  if (failOn === "warning") return summary.counts.error > 0 || summary.counts.warning > 0;
  return summary.counts.error > 0;
}

function displayPath(path) {
  const relativePath = relative(process.cwd(), path);
  if (relativePath && !relativePath.startsWith("..") && !isAbsolute(relativePath)) {
    return relativePath || ".";
  }
  return path.split(/[\\/]/).pop() || "report";
}
