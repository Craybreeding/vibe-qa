# OpenAI Codex for Open Source Notes

Official program:

https://developers.openai.com/community/codex-for-oss

Official form:

https://openai.com/form/codex-for-oss/

## Repository URL

```text
https://github.com/Craybreeding/vibe-qa
```

## Release URL

```text
https://github.com/Craybreeding/vibe-qa/releases/tag/v0.1.0
```

## Role

Primary maintainer.

## Form-Ready Answers

### GitHub username

```text
Craybreeding
```

### GitHub repository URL

```text
https://github.com/Craybreeding/vibe-qa
```

### Describe your role

```text
Primary maintainer
```

### Why does this repository qualify?

```text
vibe-qa is a public OSS CLI that gives vibe-coding and AI-app builders a fast pre-ship QA gate. It uses Playwright to catch runtime errors, failed requests, responsive overflow, unlabeled controls, overlapping click targets, and placeholder links, then outputs privacy-safe HTML/JSON reports. Codex would help maintain fixtures, issue classifiers, release workflow, and future PR-review automation.
```

### I'm interested in

```text
API credits for my project
Codex Security
```

### How will you use API credits for your project?

```text
Use API credits for optional AI-assisted report explanations: group deterministic findings by likely root cause, draft concise fix prompts for coding agents, summarize regressions in PRs, and help maintain issue triage and release notes. Core checks remain local-first and deterministic; API usage would be opt-in for maintainer automation and clearer guidance.
```

### Anything else we should know?

```text
The repository is public, CI is green, and v0.1.0 is released. All demo pages and screenshots are synthetic. Report artifacts redact local paths, localhost details, query/hash data, and exact timestamps by default.
```

## Longer Rationale

`vibe-qa` helps indie developers and vibe-coding users catch obvious launch
blockers in AI-generated web apps before they share a demo publicly. It uses
Playwright to run the page in desktop and mobile viewports, captures screenshots,
detects runtime errors, failed requests, overflow, unlabeled controls, suspicious
links, and overlapping clickable elements, then produces a shareable HTML report.

The project is small but practical: it targets the common gap between "AI made
something that looks done" and "the app is safe to show to users." Codex would
help maintain the browser-check logic, fixture pages, issue classifiers, and
release workflow as more real-world edge cases are added.

## How API Credits Would Be Used

API credits would be used to add optional AI-assisted report explanations and
fix suggestions. The core scanner will stay deterministic and local-first, but
an optional mode could summarize issues for non-technical builders, group
problems by likely root cause, and draft concise fix prompts for their coding
agent.

## Pre-Submission Checklist

- [x] Push a public repository.
- [x] Keep README/image examples free of private screenshots and paths.
- [x] Create a `v0.1.0` release.
- [ ] Use the ChatGPT account email and OpenAI Organization ID in the form.
