(() => {
  const root = document.documentElement;
  const themeKey = "copilot-app-docs-theme";
  const languageKey = "copilot-app-docs-language";
  // Progress is namespaced per app version so v1.1.2's 21 guide ids never collide with
  // v1.1.4's 25 lab ids. Theme/language stay shared across versions intentionally.
  const progressKey = "copilot-app-v1.1.4-progress";

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
    // Multi-valued chip-based filtering for the v1.1.4 hands-on lab index. Each facet
    // (journey, track, difficulty, status, platform, time) is a group of toggle buttons
    // with aria-pressed; within a group values are OR'd, across groups they are AND'd.
    // Falls back to a no-op when the page has no lab cards (e.g. release/feature pages).
    const cards = [...document.querySelectorAll("[data-guide-card]")];
    if (!cards.length) return;
    const search = document.querySelector("[data-guide-search]");
    const chips = [...document.querySelectorAll("[data-filter-chip]")];
    const resetButton = document.querySelector("[data-filter-reset]");
    const status = document.querySelector("[data-guide-filter-status]");

    const activeGroups = () => {
      const groups = new Map();
      for (const chip of chips) {
        if (chip.getAttribute("aria-pressed") !== "true") continue;
        const group = chip.dataset.filterGroup;
        if (!group) continue;
        if (!groups.has(group)) groups.set(group, new Set());
        groups.get(group).add(chip.dataset.filterValue);
      }
      return groups;
    };

    const filter = () => {
      const query = normalize(search?.value || "");
      const groups = activeGroups();
      let visible = 0;
      for (const card of cards) {
        let matches = !query || normalize(card.textContent).includes(query);
        if (matches) {
          for (const [group, values] of groups) {
            const cardValues = (card.dataset[group] || "").split(/\s+/).filter(Boolean);
            if (!cardValues.some((value) => values.has(value))) {
              matches = false;
              break;
            }
          }
        }
        card.hidden = !matches;
        if (matches) visible += 1;
      }
      updateFilterStatus(status, visible, cards.length);
    };

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chip.setAttribute("aria-pressed", String(chip.getAttribute("aria-pressed") !== "true"));
        filter();
      });
    });
    search?.addEventListener("input", filter);
    resetButton?.addEventListener("click", () => {
      chips.forEach((chip) => chip.setAttribute("aria-pressed", "false"));
      if (search) search.value = "";
      filter();
    });
    document.addEventListener("docs:languagechange", filter);
    filter();
  }

  function initializeReleaseFilters() {
    const search = document.querySelector("[data-release-search]");
    if (!search) return;
    const category = document.querySelector("[data-release-category]");
    const feature = document.querySelector("[data-release-feature]");
    const versionFilter = document.querySelector("[data-release-version-filter]");
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
    if (versionFilter && [...versionFilter.options].some((option) => option.value === params.get("version"))) {
      versionFilter.value = params.get("version");
    }
    if (params.get("q")) search.value = params.get("q");

    const filter = () => {
      const query = normalize(search.value);
      const selectedVersion = versionFilter?.value || "";
      let visible = 0;
      for (const item of items) {
        const itemVersion = item.closest("[data-release-version]")?.dataset.version;
        const matches =
          (!query || normalize(item.textContent).includes(query)) &&
          (!category?.value || item.dataset.category === category.value) &&
          (!feature?.value || item.dataset.feature === feature.value) &&
          (!selectedVersion || itemVersion === selectedVersion);
        item.hidden = !matches;
        if (matches) visible += 1;
      }

      for (const version of versions) {
        const matchesVersion = !selectedVersion || version.dataset.version === selectedVersion;
        const visibleItems = version.querySelectorAll("[data-release-item]:not([hidden])");
        version.hidden = !matchesVersion || visibleItems.length === 0;
        version.querySelectorAll("[data-release-category-section]").forEach((section) => {
          section.hidden =
            section.querySelectorAll("[data-release-item]:not([hidden])").length === 0;
        });
      }
      updateFilterStatus(status, visible, items.length);
    };

    [search, category, feature, versionFilter].filter(Boolean).forEach((control) => {
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
    const guideCount = Number(document.body.dataset.guideCount || 25);
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
          ? "このラボを完了にする"
          : "Mark this lab complete";
    });

    const resume = document.querySelector("[data-resume-link]");
    if (resume) {
      const cards = [...document.querySelectorAll("[data-guide-card]")];
      const next = cards.find((card) => !progress.has(card.dataset.guideId)) || cards[0];
      if (next) {
        resume.href = next.querySelector("a[href]")?.getAttribute("href") || "#labs";
        const titleContainer = resume.querySelector("[data-resume-title]");
        const titleHeading = next.querySelector("h3");
        if (titleContainer && titleHeading) {
          const ja = document.createElement("span");
          ja.className = "ja";
          ja.lang = "ja";
          ja.textContent = titleHeading.querySelector(".ja")?.textContent?.trim() || "";
          const en = document.createElement("span");
          en.className = "en";
          en.lang = "en";
          en.textContent = titleHeading.querySelector(".en")?.textContent?.trim() || "";
          titleContainer.replaceChildren(ja, en);
        }
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
