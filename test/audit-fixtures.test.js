import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { runAudit } from "../src/runner.js";

test("old ugly bad fixture remains a known-bad regression case", async () => {
  const outDir = await mkdtemp(join(tmpdir(), "vibe-qa-bad-v0-"));
  try {
    const result = await runAudit(fileUrl("test/fixtures/bad-v0-ugly.html"), {
      outDir,
      timeoutMs: 15_000
    });

    const codes = new Set(result.issues.map((issue) => issue.code));
    assert.equal(result.summary.verdict, "broken");
    assert.equal(result.summary.counts.error > 0, true);
    assert.equal(codes.has("console-message"), true);
    assert.equal(codes.has("horizontal-overflow"), true);
    assert.equal(codes.has("element-overflow"), true);
    assert.equal(codes.has("unlabeled-clickable"), true);
    assert.equal(codes.has("overlapping-clickables"), true);
    assert.equal(codes.has("suspicious-link"), true);
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
});

test("clean synthetic fixture ships without findings", async () => {
  const outDir = await mkdtemp(join(tmpdir(), "vibe-qa-clean-"));
  try {
    const result = await runAudit(fileUrl("test/fixtures/clean-page.html"), {
      outDir,
      timeoutMs: 15_000
    });

    assert.equal(result.summary.verdict, "ship");
    assert.deepEqual(result.summary.counts, { error: 0, warning: 0, info: 0 });
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
});

test("shareable artifacts redact local paths and exact generated time", async () => {
  const outDir = await mkdtemp(join(tmpdir(), "vibe-qa-privacy-"));
  try {
    const stalePreview = join(outDir, "report-preview.png");
    await writeFile(stalePreview, "file:///Users/ggn/private/stale-preview");

    const result = await runAudit(fileUrl("test/fixtures/broken-page.html"), {
      outDir,
      timeoutMs: 15_000
    });

    const html = await readFile(result.paths.html, "utf8");
    const json = await readFile(result.paths.json, "utf8");
    const combined = `${html}\n${json}`;

    assert.equal(combined.includes("file:///Users/"), false);
    assert.equal(combined.includes("/Users/"), false);
    assert.equal(combined.includes(process.env.HOME || "/Users/ggn"), false);
    assert.equal(combined.includes("T07:"), false);
    assert.equal(combined.includes("local file (redacted)"), true);
    assert.equal(html.includes("Privacy-safe local report"), true);
    await assert.rejects(readFile(stalePreview));
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
});

function fileUrl(relativePath) {
  return pathToFileURL(resolve(relativePath)).href;
}
