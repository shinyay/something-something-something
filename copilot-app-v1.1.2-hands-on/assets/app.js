(() => {
  const root = document.documentElement;
  const themeKey = "copilot-app-docs-theme";
  const languageKey = "copilot-app-docs-language";
  const progressKey = "copilot-app-v1.1.2-progress";

  const storage = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        // The UI remains usable when storage is blocked.
      }
    },
  };

  function currentLanguage() {
    return root.dataset.lang === "en" ? "en" : "ja";
  }

  function localized(element, language = currentLanguage()) {
    return element?.dataset?.[`${language}Label`] || element?.dataset?.label || "";
  }

  function updateToggleLabels() {
    const language = currentLanguage();
    const nextLanguage = language === "ja" ? "en" : "ja";
    document.querySelectorAll("[data-language-toggle]").forEach((button) => {
      button.setAttribute(
        "aria-label",
        nextLanguage === "en" ? "Switch to English" : "日本語に切り替える",
      );
      const label = button.querySelector("[data-toggle-label]");
      if (label) label.textContent = nextLanguage.toUpperCase();
    });

    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      button.setAttribute(
        "aria-label",
        language === "ja"
          ? `${nextTheme === "dark" ? "ダーク" : "ライト"}テーマに切り替える`
          : `Switch to ${nextTheme} theme`,
      );
      const label = button.querySelector("[data-toggle-label]");
      if (label) label.textContent = nextTheme === "dark" ? "Dark" : "Light";
    });
  }

  function initializePreferences() {
    const queryTheme = new URLSearchParams(window.location.search).get("scoutTheme");
    const storedTheme = storage.get(themeKey);
    if (!queryTheme && (storedTheme === "light" || storedTheme === "dark")) {
      root.dataset.theme = storedTheme;
    }

    const storedLanguage = storage.get(languageKey);
    if (storedLanguage === "ja" || storedLanguage === "en") {
      root.dataset.lang = storedLanguage;
      root.lang = storedLanguage;
    }
    updateToggleLabels();
  }

  function initializeToggles() {
    document.querySelectorAll("[data-language-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const language = currentLanguage() === "ja" ? "en" : "ja";
        root.dataset.lang = language;
        root.lang = language;
        storage.set(languageKey, language);
        updateToggleLabels();
        document.dispatchEvent(new CustomEvent("docs:languagechange"));
      });
    });

    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const theme = root.dataset.theme === "dark" ? "light" : "dark";
        root.dataset.theme = theme;
        storage.set(themeKey, theme);
        updateToggleLabels();
      });
    });
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.className = "sr-only";
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    if (!copied) throw new Error("Copy command failed");
  }

  function initializeCopyButtons() {
    document.querySelectorAll("[data-copy]").forEach((button) => {
      button.addEventListener("click", async () => {
        const targetId = button.dataset.copy;
        const target = targetId ? document.getElementById(targetId) : null;
        const source = target || button.closest(".code-block")?.querySelector("code");
        if (!source) return;

        const original = localized(button);
        try {
          await copyText(source.textContent.trim());
          button.textContent = currentLanguage() === "ja" ? "コピーしました" : "Copied";
          button.dataset.copyState = "success";
        } catch {
          button.textContent = currentLanguage() === "ja" ? "コピーできませんでした" : "Copy failed";
          button.dataset.copyState = "error";
        }

        window.setTimeout(() => {
          button.textContent = original || (currentLanguage() === "ja" ? "コピー" : "Copy");
          delete button.dataset.copyState;
        }, 1800);
      });
    });
  }

  function normalize(value) {
    return value
      .toLocaleLowerCase()
      .normalize("NFKC")
      .replace(/\s+/g, " ")
      .trim();
  }

  function updateFilterStatus(status, visible, total) {
    if (!status) return;
    status.textContent =
      currentLanguage() === "ja"
        ? `${total} 件中 ${visible} 件を表示`
        : `Showing ${visible} of ${total}`;
  }

  function initializeGuideFilters() {
    const search = document.querySelector("[data-guide-search]");
    if (!search) return;
    const path = document.querySelector("[data-guide-path]");
    const difficulty = document.querySelector("[data-guide-difficulty]");
    const statusFilter = document.querySelector("[data-guide-status]");
    const cards = [...document.querySelectorAll("[data-guide-card]")];
    const status = document.querySelector("[data-guide-filter-status]");

    const filter = () => {
      const query = normalize(search.value);
      let visible = 0;
      for (const card of cards) {
        const matches =
          (!query || normalize(card.textContent).includes(query)) &&
          (!path?.value || card.dataset.path === path.value) &&
          (!difficulty?.value || card.dataset.difficulty === difficulty.value) &&
          (!statusFilter?.value || card.dataset.status === statusFilter.value);
        card.hidden = !matches;
        if (matches) visible += 1;
      }
      updateFilterStatus(status, visible, cards.length);
    };

    [search, path, difficulty, statusFilter].filter(Boolean).forEach((control) => {
      control.addEventListener(control === search ? "input" : "change", filter);
    });
    document.addEventListener("docs:languagechange", filter);
    filter();
  }

  function initializeReleaseFilters() {
    const search = document.querySelector("[data-release-search]");
    if (!search) return;
    const category = document.querySelector("[data-release-category]");
    const feature = document.querySelector("[data-release-feature]");
    const versions = [...document.querySelectorAll("[data-release-version]")];
    const items = [...document.querySelectorAll("[data-release-item]")];
    const status = document.querySelector("[data-release-filter-status]");
    const params = new URLSearchParams(window.location.search);
    if (category && ["Added", "Changed", "Fixed", "Removed"].includes(params.get("category"))) {
      category.value = params.get("category");
    }
    if (feature && [...feature.options].some((option) => option.value === params.get("feature"))) {
      feature.value = params.get("feature");
    }
    if (params.get("q")) search.value = params.get("q");

    const filter = () => {
      const query = normalize(search.value);
      let visible = 0;
      for (const item of items) {
        const matches =
          (!query || normalize(item.textContent).includes(query)) &&
          (!category?.value || item.dataset.category === category.value) &&
          (!feature?.value || item.dataset.feature === feature.value);
        item.hidden = !matches;
        if (matches) visible += 1;
      }

      for (const version of versions) {
        const visibleItems = version.querySelectorAll("[data-release-item]:not([hidden])");
        version.hidden = visibleItems.length === 0;
        version.querySelectorAll("[data-release-category-section]").forEach((section) => {
          section.hidden =
            section.querySelectorAll("[data-release-item]:not([hidden])").length === 0;
        });
      }
      updateFilterStatus(status, visible, items.length);
    };

    [search, category, feature].filter(Boolean).forEach((control) => {
      control.addEventListener(control === search ? "input" : "change", filter);
    });
    document.addEventListener("docs:languagechange", filter);
    filter();
  }

  function readProgress() {
    try {
      const value = JSON.parse(storage.get(progressKey) || "[]");
      return new Set(Array.isArray(value) ? value : []);
    } catch {
      return new Set();
    }
  }

  function writeProgress(progress) {
    storage.set(progressKey, JSON.stringify([...progress].sort()));
  }

  function updateProgressUI(progress) {
    const guideCount = Number(document.body.dataset.guideCount || 21);
    const completed = Math.min(progress.size, guideCount);
    const percent = guideCount ? Math.round((completed / guideCount) * 100) : 0;

    document.querySelectorAll("[data-progress-fill]").forEach((element) => {
      element.style.setProperty("--progress", `${percent}%`);
    });
    document.querySelectorAll('[role="progressbar"]').forEach((element) => {
      element.setAttribute("aria-valuenow", String(completed));
    });
    document.querySelectorAll("[data-progress-count]").forEach((element) => {
      element.textContent =
        currentLanguage() === "ja"
          ? `${completed} / ${guideCount} 完了`
          : `${completed} / ${guideCount} complete`;
    });
    document.querySelectorAll("[data-guide-card]").forEach((card) => {
      const complete = progress.has(card.dataset.guideId);
      card.dataset.complete = String(complete);
      const indicator = card.querySelector("[data-card-progress]");
      if (indicator) {
        indicator.hidden = !complete;
        indicator.textContent = currentLanguage() === "ja" ? "完了" : "Complete";
      }
    });

    const currentId = document.body.dataset.guideId;
    document.querySelectorAll("[data-guide-complete]").forEach((button) => {
      const complete = currentId ? progress.has(currentId) : false;
      button.setAttribute("aria-pressed", String(complete));
      button.textContent = complete
        ? currentLanguage() === "ja"
          ? "完了済み（取り消す）"
          : "Completed (undo)"
        : currentLanguage() === "ja"
          ? "このガイドを完了にする"
          : "Mark this guide complete";
    });

    const resume = document.querySelector("[data-resume-link]");
    if (resume) {
      const cards = [...document.querySelectorAll("[data-guide-card]")];
      const next = cards.find((card) => !progress.has(card.dataset.guideId)) || cards[0];
      if (next) {
        resume.href = next.querySelector("a[href]")?.getAttribute("href") || "#guides";
        const title =
          next.querySelector(currentLanguage() === "ja" ? ".ja" : ".en")?.textContent?.trim() ||
          next.querySelector("h3")?.textContent?.trim() ||
          "";
        resume.querySelector("[data-resume-title]")?.replaceChildren(title);
      }
    }
  }

  function initializeProgress() {
    const progress = readProgress();
    updateProgressUI(progress);

    document.querySelectorAll("[data-guide-complete]").forEach((button) => {
      button.addEventListener("click", () => {
        const currentId = document.body.dataset.guideId;
        if (!currentId) return;
        if (progress.has(currentId)) progress.delete(currentId);
        else progress.add(currentId);
        writeProgress(progress);
        updateProgressUI(progress);
      });
    });

    document.querySelectorAll("[data-progress-reset]").forEach((button) => {
      button.addEventListener("click", () => {
        progress.clear();
        writeProgress(progress);
        updateProgressUI(progress);
      });
    });

    document.addEventListener("docs:languagechange", () => updateProgressUI(progress));
  }

  initializePreferences();
  initializeToggles();
  initializeCopyButtons();
  initializeGuideFilters();
  initializeReleaseFilters();
  initializeProgress();
})();
