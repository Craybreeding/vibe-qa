import { createIssue } from "./issues.js";

export function collectDomFindings(snapshot) {
  const issues = [];

  for (const viewport of snapshot.viewports) {
    if (viewport.bodyOverflowX > 2) {
      issues.push(createIssue(
        "warning",
        "horizontal-overflow",
        `${viewport.name} page is wider than the viewport by ${Math.round(viewport.bodyOverflowX)}px.`,
        { viewport: viewport.name }
      ));
    }

    for (const item of viewport.overflowingElements.slice(0, 20)) {
      issues.push(createIssue(
        "warning",
        "element-overflow",
        `${viewport.name}: ${item.selector} content overflows its box.`,
        item
      ));
    }

    for (const item of viewport.unlabeledClickables.slice(0, 20)) {
      issues.push(createIssue(
        "warning",
        "unlabeled-clickable",
        `${viewport.name}: clickable ${item.selector} has no visible or accessible label.`,
        item
      ));
    }

    for (const item of viewport.overlappingClickables.slice(0, 20)) {
      issues.push(createIssue(
        "warning",
        "overlapping-clickables",
        `${viewport.name}: clickable controls overlap: ${item.a} and ${item.b}.`,
        item
      ));
    }
  }

  for (const link of snapshot.suspiciousLinks.slice(0, 30)) {
    issues.push(createIssue(
      "warning",
      "suspicious-link",
      `Suspicious link: ${link.text || link.href || "(empty)"}`,
      link
    ));
  }

  return issues;
}

export async function inspectPageDom(page, viewportName) {
  return page.evaluate((name) => {
    const selectorFor = (el) => {
      if (el.id) return `#${CSS.escape(el.id)}`;
      const attr = el.getAttribute("aria-label") || el.getAttribute("name") || "";
      const tag = el.tagName.toLowerCase();
      if (attr) return `${tag}[${attr.slice(0, 28)}]`;
      const cls = [...el.classList].slice(0, 2).join(".");
      return cls ? `${tag}.${cls}` : tag;
    };

    const rectOf = (el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };

    const isVisible = (el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.visibility !== "hidden" &&
        style.display !== "none" &&
        Number(style.opacity || "1") > 0 &&
        rect.width > 0 &&
        rect.height > 0;
    };

    const visibleElements = [...document.querySelectorAll("body *")].filter(isVisible);
    const clickables = [...document.querySelectorAll("a,button,input,select,textarea,[role='button'],[onclick]")].filter(isVisible);

    const overflowingElements = visibleElements
      .filter((el) => {
        const style = getComputedStyle(el);
        if (style.overflowX === "visible" && style.overflowY === "visible") return false;
        return el.scrollWidth > el.clientWidth + 3 || el.scrollHeight > el.clientHeight + 3;
      })
      .slice(0, 30)
      .map((el) => ({
        selector: selectorFor(el),
        rect: rectOf(el),
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight
      }));

    const unlabeledClickables = clickables
      .filter((el) => {
        const type = (el.getAttribute("type") || "").toLowerCase();
        if (type === "hidden") return false;
        const label = [
          el.innerText,
          el.value,
          el.getAttribute("aria-label"),
          el.getAttribute("title"),
          el.getAttribute("alt")
        ].filter(Boolean).join(" ").trim();
        return !label;
      })
      .slice(0, 30)
      .map((el) => ({ selector: selectorFor(el), rect: rectOf(el) }));

    const rects = clickables.slice(0, 120).map((el) => ({ selector: selectorFor(el), rect: rectOf(el) }));
    const overlappingClickables = [];
    for (let i = 0; i < rects.length; i += 1) {
      for (let j = i + 1; j < rects.length; j += 1) {
        const a = rects[i].rect;
        const b = rects[j].rect;
        const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
        const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
        if (overlapX > 8 && overlapY > 8) {
          overlappingClickables.push({ a: rects[i].selector, b: rects[j].selector, overlapX, overlapY });
        }
      }
    }

    const links = [...document.querySelectorAll("a[href]")].map((a) => ({
      href: a.getAttribute("href") || "",
      absoluteHref: a.href,
      text: (a.innerText || a.getAttribute("aria-label") || "").trim().slice(0, 100)
    }));

    const suspiciousLinks = links.filter((link) => {
      const href = link.href.trim();
      return !href || href === "#" || href.toLowerCase().startsWith("javascript:");
    });

    const maxElementRight = visibleElements.reduce((max, el) => {
      const rect = el.getBoundingClientRect();
      return Math.max(max, rect.right);
    }, innerWidth);

    return {
      name,
      title: document.title,
      url: location.href,
      viewport: { width: innerWidth, height: innerHeight },
      bodyOverflowX: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth, maxElementRight) - innerWidth,
      overflowingElements,
      unlabeledClickables,
      overlappingClickables,
      links,
      suspiciousLinks
    };
  }, viewportName);
}
