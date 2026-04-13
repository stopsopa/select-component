(function () {
  const map = {
    imports: {
      radio: "/js/radio.js",
      "htmx.org": "/node_modules/htmx.org/dist/htmx.esm.js",
      "htmx-ext-preload": "/node_modules/htmx-ext-preload/dist/preload.esm.js",
      morphdom: "/node_modules/morphdom/dist/morphdom-esm.js",
      idiomorph: "/node_modules/idiomorph/dist/idiomorph.esm.js",
      morph: "/js/morph.js",
    },
  };
  const script = document.createElement("script");
  script.type = "importmap";
  script.textContent = JSON.stringify(map);
  document.currentScript.after(script);
})();
