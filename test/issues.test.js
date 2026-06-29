import test from "node:test";
import assert from "node:assert/strict";
import { parseArgs, normalizeTarget } from "../src/cli.js";
import { createIssue, summarizeIssues } from "../src/issues.js";

test("summarizeIssues marks error reports as broken", () => {
  const summary = summarizeIssues([
    createIssue("warning", "a", "warning"),
    createIssue("error", "b", "error")
  ]);

  assert.equal(summary.verdict, "broken");
  assert.deepEqual(summary.counts, { error: 1, warning: 1, info: 0 });
});

test("summarizeIssues marks warning-only reports as needs review", () => {
  const summary = summarizeIssues([createIssue("warning", "a", "warning")]);
  assert.equal(summary.verdict, "needs review");
});

test("parseArgs reads common options", () => {
  const parsed = parseArgs(["node", "vibe-qa", "localhost:3000", "--out", "out", "--links", "--max-links", "5", "--timeout", "1000", "--fail-on", "warning", "--json"]);
  assert.equal(parsed.target, "localhost:3000");
  assert.equal(parsed.options.outDir, "out");
  assert.equal(parsed.options.checkLinks, true);
  assert.equal(parsed.options.maxLinks, 5);
  assert.equal(parsed.options.timeoutMs, 1000);
  assert.equal(parsed.options.failOn, "warning");
  assert.equal(parsed.options.json, true);
});

test("normalizeTarget preserves http URLs", () => {
  assert.equal(normalizeTarget("http://localhost:3000"), "http://localhost:3000");
});

test("parseArgs rejects invalid fail threshold", () => {
  assert.throws(() => parseArgs(["node", "vibe-qa", "localhost:3000", "--fail-on", "fatal"]), /--fail-on/);
});
