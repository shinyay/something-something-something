# Something Something Something

> **A public collection of slides, notes, and resources on developer tools and technologies — curated and shared by [@shinyay](https://github.com/shinyay).**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://gist.githubusercontent.com/shinyay/56e54ee4c0e22db8211e05e70a63247e/raw/f3ac65a05ed8c8ea70b653875ccac0c6dbc10ba1/LICENSE)

This repository is an evolving knowledge base where I accumulate files, slides, and information that I want to share publicly. Topics range from IDE updates to developer productivity — and more content will be added over time.

> [!NOTE]
> This repository is a living collection — new content is added regularly. Star or watch the repo to stay updated.

---

## 📂 Contents

| Topic | Description | Formats |
|-------|-------------|---------|
| [**GitHub Copilot App — Stable Version Hub**](./copilot-app/) | Durable entry point for the current GitHub Copilot App guide, complete release delta, hands-on learning paths, official resources, and archived versions | HTML · JP / EN ([live page](https://shinyay.github.io/something-something-something/copilot-app/)) |
| [**GitHub Copilot App v1.1.2 — Complete Feature Guide**](./copilot-app-v1.1.2/) | Current capability map, setup, availability and policy boundaries, models / Auto / reasoning / BYOK, workflows, WSL and cloud behavior, plus all 462 official changes across 17 releases since v1.0.12 | HTML · JP / EN ([live page](https://shinyay.github.io/something-something-something/copilot-app-v1.1.2/)) |
| [**GitHub Copilot App v1.1.2 — Hands-on Learning**](./copilot-app-v1.1.2-hands-on/) | Five learning paths and exactly 21 practical guides with copyable prompts, safety notes, expected results, troubleshooting, cleanup, platform callouts, local progress, search, and filtering | HTML · JP / EN ([live page](https://shinyay.github.io/something-something-something/copilot-app-v1.1.2-hands-on/)) |
| [**GitHub Copilot App v1.0.12 — Feature Guide (Archive)**](./copilot-app-v1.0.12/) | Preserved historical snapshot of the v1.0.12 feature guide; use the stable hub for the current edition | HTML · JP / EN ([live page](https://shinyay.github.io/something-something-something/copilot-app-v1.0.12/)) |
| [**GitHub Copilot App v1.0.12 — Hands-on Guides (Archive)**](./copilot-app-v1.0.12-hands-on/) | Preserved historical collection of the original 15 v1.0.12 guides | HTML · JP / EN ([live page](https://shinyay.github.io/something-something-something/copilot-app-v1.0.12-hands-on/)) |
| [**Agentic SDLC Practical Guide with GitHub Copilot**](./agentic-sdlc/) | Self-standing technical guide that designs, delegates, and governs bounded, verifiable work with GitHub Copilot — the five interaction modes, Context Engineering, Delegation Contract, autonomy budget, Modernization Loop, deterministic verification, the PR as governance boundary, security, drift and recovery, adoption ladder, cost model, delegation anti-patterns, and a glossary — across 19 sections in 6 parts, illustrated with six hand-authored inline-SVG concept diagrams, readable without the slides; the original talk deck is included as an appendix PDF. A fully translated [English edition](./agentic-sdlc/en/) covers the same 19 sections and all six diagrams | HTML · JP / EN + PDF ([live page](https://shinyay.github.io/something-something-something/agentic-sdlc/)) |
| [**Microsoft Build 2026 — GitHub Updates**](./build2026-github/) | Summary of GitHub-related announcements from Microsoft Build 2026 (Copilot app, Canvas, code review, SDK / CLI, security, and more) | HTML · JP ([live page](https://shinyay.github.io/something-something-something/build2026-github/)) |
| [**VS Code Monthly Updates**](./vscode-monthy-update/) | Summary slides covering what's new in each VS Code release | PDF (EN / JP) |

<!-- New topics will be added here as the collection grows. -->

---

## 📁 Repository Structure

```
something-something-something/
├── agentic-sdlc/               # Agentic SDLC practical guide (self-standing web page)
│   ├── index.html              # 19-section guide in 6 parts (HTML · JP, served via GitHub Pages)
│   ├── en/index.html           # English edition of the same 19 sections (HTML · EN, served via GitHub Pages)
│   ├── slides/                 # Original talk deck (PDF · 46 pages), linked as an appendix
│   └── assets/                 # Primer-themed CSS plus theme, table-of-contents, and language-switch logic (shared by both editions)
├── build2026-github/           # Microsoft Build 2026 GitHub updates (web page)
│   └── index.html              # Summary page (HTML · JP, served via GitHub Pages)
├── copilot-app/                # Stable GitHub Copilot App version hub
│   └── index.html              # Current / archive routing and official links
├── copilot-app-v1.1.2/         # Current complete feature and release guide
│   ├── index.html              # Capability map, setup, policies, platforms, workflows
│   ├── releases.html           # Searchable 17-release / 462-item explorer
│   └── assets/                 # Shared CSS, JS, and canonical release matrix JSON
├── copilot-app-v1.1.2-hands-on/  # Five learning paths / 21 guides
│   ├── index.html              # Search, filters, local progress, and resume
│   ├── 01-install-projects.html … 21-accessibility-storage-lifecycle-recovery.html
│   └── assets/                 # Shared theme, language, copy, filter, and progress logic
├── copilot-app-v1.0.12/        # Historical v1.0.12 feature guide archive
├── copilot-app-v1.0.12-hands-on/  # Historical 15-guide archive
├── scripts/                    # Reproducible matrix, rendering, and validation scripts
│   ├── agentic-sdlc-content/   # Section modules, inline-SVG diagram builders, and the ja/en UI strings plus terminology contract for the Agentic SDLC practical guide
│   └── render-agentic-sdlc.mjs # Renders both editions of agentic-sdlc/ from those modules
├── vscode-monthy-update/       # VS Code release update slides
│   ├── *-easy.pdf              # Beginner-friendly summary (EN)
│   ├── *-easy-jp.pdf           # Beginner-friendly summary (JP)
│   ├── *-technical.pdf         # Technical deep-dive (EN)
│   └── *-technical-jp.pdf      # Technical deep-dive (JP)
└── README.md
```

Each content directory follows a consistent naming convention:

- **`easy`** — Accessible overview for a broad audience
- **`technical`** — In-depth details for developers
- **`-jp`** suffix — Japanese translation

---

## 🗓️ Latest Additions

- **2026-08-04** — [Agentic SDLC Practical Guide with GitHub Copilot](./agentic-sdlc/) completes its English edition — all 19 sections and all six inline-SVG diagrams are translated, with no Japanese fallback remaining ([English edition](https://shinyay.github.io/something-something-something/agentic-sdlc/en/))
- **2026-08-03** — [Agentic SDLC Practical Guide with GitHub Copilot](./agentic-sdlc/) gains a Japanese ⇄ English language switch; §00 is translated and the remaining 18 sections fall back to the Japanese text ([English edition](https://shinyay.github.io/something-something-something/agentic-sdlc/en/))
- **2026-08-03** — [Agentic SDLC Practical Guide with GitHub Copilot](./agentic-sdlc/) gains six hand-authored inline-SVG concept diagrams (Modernization Loop, PR governance boundary, interaction-mode continuum, Delegation Contract, autonomy budget, adoption ladder) — no external assets, theme-aware ([live page](https://shinyay.github.io/something-something-something/agentic-sdlc/))
- **2026-08-02** — [Agentic SDLC Practical Guide with GitHub Copilot](./agentic-sdlc/) reframed as a self-standing guide (16 sections in 6 parts, JP; original 46-slide deck retained as an appendix PDF) ([live page](https://shinyay.github.io/something-something-something/agentic-sdlc/))
- **2026-08-01** — [Starting Agentic SDLC with GitHub Copilot](./agentic-sdlc/) (original supplementary edition; JP, 46-slide deck included as PDF) ([live page](https://shinyay.github.io/something-something-something/agentic-sdlc/))
- **2026-07-29** — [GitHub Copilot App stable version hub](./copilot-app/) ([live page](https://shinyay.github.io/something-something-something/copilot-app/))
- **2026-07-29** — [GitHub Copilot App v1.1.2 complete feature and release guide](./copilot-app-v1.1.2/) ([live page](https://shinyay.github.io/something-something-something/copilot-app-v1.1.2/))
- **2026-07-29** — [GitHub Copilot App v1.1.2 hands-on learning](./copilot-app-v1.1.2-hands-on/) (five paths / 21 guides) ([live page](https://shinyay.github.io/something-something-something/copilot-app-v1.1.2-hands-on/))
- **2026-07-01** — [GitHub Copilot App v1.0.12 — Hands-on Guides](./copilot-app-v1.0.12-hands-on/) (15 per-feature walkthroughs + index) ([live page](https://shinyay.github.io/something-something-something/copilot-app-v1.0.12-hands-on/))
- **2026-07-01** — [GitHub Copilot App v1.0.12 — Feature Guide](./copilot-app-v1.0.12/) ([live page](https://shinyay.github.io/something-something-something/copilot-app-v1.0.12/))
- **2026-06-02** — [Microsoft Build 2026 — GitHub Updates](./build2026-github/) ([live page](https://shinyay.github.io/something-something-something/build2026-github/))
- **2026-03-05** — [VS Code v1.110 Update Slides](./vscode-monthy-update/) (Easy & Technical, EN & JP)

---

## 🤝 Contributing

Have a suggestion or found an error? [Open an issue](https://github.com/shinyay/something-something-something/issues/new) — feedback and contributions are welcome.

---

## ⭐ Support

If you find this collection useful, please consider:
- ⭐ Starring this repository
- 📢 Sharing with others

---

## Licence

Released under the [MIT license](https://gist.githubusercontent.com/shinyay/56e54ee4c0e22db8211e05e70a63247e/raw/f3ac65a05ed8c8ea70b653875ccac0c6dbc10ba1/LICENSE)

## Author

- github: <https://github.com/shinyay>
- bluesky: <https://bsky.app/profile/yanashin.bsky.social>
- twitter: <https://twitter.com/yanashin18618>
- mastodon: <https://mastodon.social/@yanashin>
- linkedin: <https://www.linkedin.com/in/yanashin/>
