/* Shared theme + language toggle for the hands-on guides.
   Persists to localStorage so the choice carries across pages. */
(function () {
  var html = document.documentElement;
  var themeBtn = document.getElementById("themeToggle");
  var themeLabel = document.getElementById("themeLabel");
  var langBtn = document.getElementById("langToggle");
  var langLabel = document.getElementById("langLabel");
  var baseTitle = { ja: html.getAttribute("data-title-ja") || document.title,
                    en: html.getAttribute("data-title-en") || document.title };
  var L = {
    ja: { dark: "ダーク", light: "ライト", themeAria: "テーマ切り替え", lang: "EN", langAria: "Switch to English" },
    en: { dark: "Dark", light: "Light", themeAria: "Toggle theme", lang: "日本語", langAria: "日本語に切り替え" }
  };
  function lang() { return html.getAttribute("data-lang") === "en" ? "en" : "ja"; }
  function sync() {
    var t = L[lang()];
    var dark = html.getAttribute("data-theme") === "dark";
    if (themeLabel) themeLabel.textContent = dark ? t.light : t.dark;
    if (themeBtn) themeBtn.setAttribute("aria-label", t.themeAria);
    if (langLabel) langLabel.textContent = t.lang;
    if (langBtn) langBtn.setAttribute("aria-label", t.langAria);
    html.setAttribute("lang", lang());
    document.title = baseTitle[lang()];
  }
  sync();
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    try { localStorage.setItem("cp-theme", next); } catch (e) {}
    sync();
  });
  if (langBtn) langBtn.addEventListener("click", function () {
    var next = lang() === "en" ? "ja" : "en";
    html.setAttribute("data-lang", next);
    try { localStorage.setItem("cp-lang", next); } catch (e) {}
    sync();
  });
})();
