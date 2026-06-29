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
vibe-qa is a small reviewer/tester gate for web apps built with coding agents. It opens a finished page in desktop and mobile sizes and catches common handoff problems: runtime errors, failed requests, overflow, unlabeled controls, bad links, and awkward clickable areas. The repo is public, released, has CI, tests, and synthetic fixtures.
```

### I'm interested in

```text
API credits for my project
```

### How will you use API credits for your project?

```text
I would use credits to maintain the project: summarize failed reports, turn findings into short fix notes, and help review new checks or fixtures. The scanner itself should stay local and rule-based. Model calls would only be used around maintenance and clearer report explanations.
```

### Anything else we should know?

```text
The project started as a browser QA CLI, but the goal is broader: a practical acceptance layer for agent-built apps. All demo pages are synthetic, and shareable reports redact local paths, localhost details, query/hash data, and exact timestamps by default.
```

## Longer Rationale

`vibe-qa` checks the handoff after a coding agent says a web app is done. It uses
Playwright to run the page in desktop and mobile viewports, captures screenshots,
detects runtime errors, failed requests, overflow, unlabeled controls, suspicious
links, and overlapping clickable elements, then produces a shareable HTML report.

The project is small but practical: it targets the gap between "the agent
finished the task" and "the result is safe to show." Codex would help maintain
the browser checks, fixture pages, issue classification, and release work as more
real-world edge cases are added.

## How API Credits Would Be Used

API credits would be used for maintainer work around the scanner: summarizing
failed reports, turning findings into short fix notes, reviewing new checks, and
keeping release notes readable. The scanner itself should stay local and
rule-based.

## Pre-Submission Checklist

- [x] Push a public repository.
- [x] Keep README/image examples free of private screenshots and paths.
- [x] Create a `v0.1.0` release.
- [ ] Use the ChatGPT account email and OpenAI Organization ID in the form.
