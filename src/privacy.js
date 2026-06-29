export function redactReport(report) {
  const redacted = redactValue(report);
  if (redacted.snapshot) {
    redacted.snapshot.displayUrl = targetLabel(report.snapshot?.url);
    redacted.snapshot.url = targetLabel(report.snapshot?.url);
    redacted.snapshot.generatedAt = null;
  }
  return redacted;
}

export function targetLabel(value) {
  if (!value) return "target redacted";
  const text = String(value);
  try {
    const url = new URL(text);
    if (url.protocol === "file:") return "local file (redacted)";
    if (url.protocol === "http:" || url.protocol === "https:") {
      if (isLocalHost(url.hostname)) return "local server (redacted)";
      return `${url.origin}${url.pathname}${url.search || url.hash ? " [query/hash redacted]" : ""}`;
    }
  } catch {
    // Fall through to embedded-string redaction.
  }
  return redactPrivateString(text);
}

export function redactPrivateString(value) {
  let text = String(value ?? "");
  text = text.replace(/file:\/\/\/[^\s"'<>),]+/gi, "local file (redacted)");
  text = text.replace(/\/Users\/[^\s"'<>),]+/g, "local path (redacted)");
  text = text.replace(/[A-Z]:\\Users\\[^\s"'<>),]+/gi, "local path (redacted)");
  text = text.replace(/https?:\/\/[^\s"'<>),]+/gi, (match) => {
    try {
      const url = new URL(match);
      if (isLocalHost(url.hostname)) return "local server (redacted)";
      return `${url.origin}${url.pathname}${url.search || url.hash ? " [query/hash redacted]" : ""}`;
    } catch {
      return "url redacted";
    }
  });
  return text;
}

function redactValue(value) {
  if (typeof value === "string") return redactPrivateString(value);
  if (Array.isArray(value)) return value.map((item) => redactValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, redactValue(item)])
    );
  }
  return value;
}

function isLocalHost(hostname) {
  return ["localhost", "127.0.0.1", "::1", "0.0.0.0"].includes(hostname);
}
