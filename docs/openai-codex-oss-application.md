# OpenAI Codex for Open Source Notes

Official program:

https://developers.openai.com/community/codex-for-oss

Official form:

https://openai.com/form/codex-for-oss/

## Repository URL

```text
https://github.com/Craybreeding/vibe-qa
```

## Role

Primary maintainer.

## Why This Repository Qualifies

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

- [ ] Push a public repository.
- [ ] Add at least one screenshot of synthetic `report.html` to the README.
- [ ] Create a `v0.1.0` release.
- [ ] Use the ChatGPT account email and OpenAI Organization ID in the form.
