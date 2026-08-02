// Small HTML building helpers shared by content.mjs.
// Everything returns a plain HTML string.

export const esc = (s) =>
    String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

/** Status / provenance badge. kind: ga | pp | official | framework | derived | warn */
export function badge(kind, text) {
    return `<span class="badge badge-${kind}">${text}</span>`;
}

/** Inline code. */
export const c = (s) => `<code>${esc(s)}</code>`;

/** External link. */
export const a = (href, text) =>
    `<a href="${href}" target="_blank" rel="noopener noreferrer">${text ?? href}</a>`;

/**
 * Table. `cols` is an array of header strings. `rows` is an array of arrays of
 * HTML strings. `opts.widths` is an optional array of CSS widths.
 */
export function table(cols, rows, opts = {}) {
    const colgroup = opts.widths
        ? `<colgroup>${opts.widths.map((w) => `<col style="width:${w}">`).join("")}</colgroup>`
        : "";
    const head = `<thead><tr>${cols.map((h) => `<th>${h}</th>`).join("")}</tr></thead>`;
    const body = `<tbody>${rows
        .map((r) => `<tr>${r.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
        .join("")}</tbody>`;
    return `<div class="table-wrap"><table class="${opts.className ?? ""}">${colgroup}${head}${body}</table></div>`;
}

/** Callout box. kind: note | warn | key | update */
export function callout(kind, title, body) {
    const icons = { note: "i", warn: "!", key: "★", update: "⟳" };
    return `<aside class="callout callout-${kind}">
    <div class="callout-mark" aria-hidden="true">${icons[kind] ?? "i"}</div>
    <div class="callout-body"><p class="callout-title">${title}</p>${body}</div>
  </aside>`;
}

/**
 * Pull-quote presenting this guide's own thesis. No source attribution.
 * `note` is an optional short gloss (e.g. a Japanese summary of an English thesis).
 */
export function principle(text, note) {
    const cap = note ? `<figcaption>${note}</figcaption>` : "";
    return `<figure class="principle">
    <blockquote>${text}</blockquote>${cap}
  </figure>`;
}

/** Quote pulled from official documentation. */
export function docQuote(text, href, label) {
    return `<figure class="doc-quote">
    <blockquote>${text}</blockquote>
    <figcaption>${a(href, label)}</figcaption>
  </figure>`;
}

/** Grid of small cards: [{ title, badge?, body }] */
export function cards(items, opts = {}) {
    return `<div class="cards cards-${opts.cols ?? 3}">${items
        .map(
            (it) => `<div class="card">
        <p class="card-title">${it.title}${it.badge ? ` ${it.badge}` : ""}</p>
        <div class="card-body">${it.body}</div>
      </div>`,
        )
        .join("")}</div>`;
}

/** Numbered step list: [{ title, body }] */
export function steps(items) {
    return `<ol class="steps">${items
        .map(
            (it) =>
                `<li><p class="step-title">${it.title}</p><div class="step-body">${it.body}</div></li>`,
        )
        .join("")}</ol>`;
}

/** Unordered list from an array of HTML strings. */
export const ul = (items) => `<ul class="plain">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;

/** Fenced code block. */
export function pre(lang, code) {
    return `<pre class="code" data-lang="${lang}"><code>${esc(code)}</code></pre>`;
}
