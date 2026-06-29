# vibe-qa

[![CI](https://github.com/Craybreeding/vibe-qa/actions/workflows/ci.yml/badge.svg)](https://github.com/Craybreeding/vibe-qa/actions/workflows/ci.yml)

Reviewer/tester gate for web apps built with coding agents.

Run it before you post a Cursor, Claude Code, or Codex-built app to users:

```sh
npx vibe-qa http://localhost:3000
```

It opens the page in desktop and mobile viewports, captures screenshots, checks
whether the delivered app is usable, and writes a shareable HTML report.

## Product Shape

`vibe-qa` is a focused release gate for coding-agent output, not a generic test
framework:

1. Point it at a local URL, public URL, or single HTML file.
2. It opens the page like a user would on desktop and mobile.
3. It records screenshots, runtime failures, layout issues, click-target issues,
   and placeholder links.
4. It writes a human report for review and JSON for CI or another agent to read.
5. It exits non-zero on errors by default, so a broken AI-generated page can
   block a publish step.

In an agent team, `vibe-qa` is the reviewer/tester step after a builder says the
web app is done. It does not prove every implementation detail. It checks the
delivered surface for the simple failures that make a demo hard to trust.

## What It Checks

- Console errors and uncaught page errors
- Failed network requests
- Desktop and mobile screenshots
- Horizontal page overflow
- Text or UI elements that visibly overflow their boxes
- Clickable controls with no visible or accessible label
- Overlapping clickable controls
- Empty, hash-only, or JavaScript links
- Optional same-origin broken-link checks

This is not Lighthouse, and it is not a unit-test runner. It is a fast acceptance
pass for the messy problems people actually hit when shipping generated
interfaces.

## Install

```sh
npm install -g vibe-qa
vibe-qa http://localhost:3000
```

Or run from source:

```sh
npm install
node ./bin/vibe-qa.js ./test/fixtures/broken-page.html --out ./tmp/demo-report
```

## CLI

```text
vibe-qa <url-or-file> [options]

Options:
  --out <dir>          Output directory. Default: ./vibe-qa-report
  --links             Check same-origin links with HTTP requests
  --max-links <n>     Maximum links to request. Default: 25
  --timeout <ms>      Page load timeout. Default: 15000
  --fail-on <level>   Exit non-zero on error, warning, or never. Default: error
  --json              Print machine-readable summary JSON
  --no-headless       Show the browser
  -h, --help          Show help
```

CI example:

```sh
vibe-qa http://localhost:3000 --out ./artifacts/vibe-qa --fail-on warning --json
```

Local review example that never fails the shell:

```sh
vibe-qa ./test/fixtures/broken-page.html --out ./tmp/demo-report --fail-on never
```

## Output

```text
vibe-qa-report/
  report.html
  report.json
  screenshots/
    desktop.png
    mobile.png
```

The report verdict is intentionally blunt:

- `ship`: no blocking issues found
- `needs review`: issues exist, but the page probably loaded
- `broken`: page failed to load or has severe runtime failures

Example:

```text
vibe-qa: broken
issues: 2 error, 8 warning, 0 info
report: ./tmp/demo-report/report.html
```

## Regression Fixtures

The repo includes fully synthetic fixtures so the tool can be tested without
private screenshots or real customer pages:

- `test/fixtures/clean-page.html`: should return `ship`
- `test/fixtures/broken-page.html`: polished synthetic bad page for report review
- `test/fixtures/bad-v0-ugly.html`: the original ugly bad page, kept as a
  regression case to prove the checker still catches real layout and link issues

Run them from source:

```sh
npm test
npm run demo:bad-v0
npm run demo:clean
```

## Why This Exists

Coding agents can produce a working-looking app quickly, but the handoff often
has no tester. A page may only work at one size, hide broken links, throw console
errors, or contain controls that are hard to use.

`vibe-qa` gives that handoff a small reviewer/tester gate. It checks the page a
user would see and leaves a report that a human or another agent can inspect.

## Who It Is For

- Indie hackers posting a new tool to Xiaohongshu, X, Product Hunt, or friends
- Non-front-end builders using Cursor, Claude Code, Codex, Lovable, or Bolt
- Small teams that want a quick acceptance report before sending a demo link

It is deliberately not a full testing platform. If your app needs auth flows,
payments, analytics checks, or domain-specific data validation, keep those in
your own test suite.

## License

MIT
