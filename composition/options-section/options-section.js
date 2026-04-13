import { OptionsSectionManager } from "./OptionsSectionManager.js";
/**
 * Injects CSS into the Shadow DOM.
 * Priority:
 * 1. OptionsSection.cssText (Bundler string injection)
 * 2. <meta name="select-component" content="/path1.css, /path2.css"> (Global HTML declaration in main document)
 * 3. OptionsSection.defaultCssUrls (Global JS property)
 *
 * Example of Global HTML Declaration in the main document <head>:
 * <head>
 *   <meta name="select-component" content="OptionsSectionManager.css" />
 * </head>
 */
export class OptionsSection extends HTMLElement {
  /**
   * Bundlers can inject raw CSS string here to avoid HTTP requests entirely.
   * e.g., OptionsSection.cssText = import('./OptionsSectionManager.css?raw');
   */
  static cssText = "";
  static defaultCssUrls = [];
  _manager = null;
  _options = {};
  _stylesInjected = false;
  _mountPoint;
  static get observedAttributes() {
    return ["options", "loading", "value", "label", "disabled", "max-height", "show-footer", "show-filter"];
  }
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `<style></style><div></div>`;
    this._mountPoint = this.shadowRoot.querySelector("div");
  }
  connectedCallback() {
    this._injectStyles();
    if (this._manager) return;
    this._options = {
      options: this._parseJSON(this.getAttribute("options")) ?? [],
      loading: this.hasAttribute("loading"),
      value: this.getAttribute("value") || "",
      label: this.getAttribute("label") || "",
      disabled: this.hasAttribute("disabled"),
      maxHeight: this.getAttribute("max-height") || "",
      showFooter: this.hasAttribute("show-footer"),
      showFilter: this.hasAttribute("show-filter"),
    };
    this._manager = new OptionsSectionManager(this._mountPoint, this._options);
  }
  disconnectedCallback() {
    this._manager?.destroy();
  }
  attributeChangedCallback(name, _oldValue, newValue) {
    if (!this._manager) return;
    const isTrue = this.hasAttribute(name);
    switch (name) {
      case "options": {
        const parsed = this._parseJSON(newValue);
        if (parsed !== undefined) {
          this._manager.setOptions(parsed);
        }
        break;
      }
      case "loading":
        this._manager.setLoading(isTrue);
        break;
      case "value":
        this._manager.setValue(newValue);
        break;
      case "label":
        this._manager.setLabel(newValue);
        break;
      case "disabled":
        this._manager.setDisabled(isTrue);
        break;
      case "max-height":
        this._manager.setMaxHeight(newValue);
        break;
      case "show-footer":
        this._manager.setShowFooter(isTrue);
        break;
      case "show-filter":
        this._manager.setShowFilter(isTrue);
        break;
    }
  }
  _injectStyles() {
    if (this._stylesInjected) return;
    this._stylesInjected = true;
    const style = document.createElement("style");
    // Scenario A: Bundler injected raw CSS string directly
    if (OptionsSection.cssText) {
      style.textContent = OptionsSection.cssText;
    }
    // Scenario B: Load from URLs (Global Meta Tag > Default Static Property)
    else {
      let urls = [];
      const metaTag = document.querySelector('meta[name="select-component"]');
      if (metaTag && metaTag.getAttribute("content")) {
        urls = metaTag
          .getAttribute("content")
          .split(",")
          .map((s) => s.trim());
      } else {
        urls = OptionsSection.defaultCssUrls;
      }
      urls.forEach((url) => {
        if (!url) return;
        style.textContent += `@import url("${url}");\n`;
      });
    }
    // Remove existing injected CSS if updating dynamically (e.g. css-urls changed)
    const existingStyle = this.shadowRoot.querySelector("style");
    if (existingStyle) {
      existingStyle.remove();
    }
    this.shadowRoot.appendChild(style);
  }
  // Proxied methods
  setMaxHeight(maxHeight) {
    if (maxHeight) this.setAttribute("max-height", maxHeight);
    else this.removeAttribute("max-height");
  }
  setDisabled(disabled) {
    this.toggleAttribute("disabled", disabled);
  }
  setShowFooter(show) {
    this.toggleAttribute("show-footer", show);
  }
  setShowFilter(show) {
    this.toggleAttribute("show-filter", show);
  }
  setOptions(options) {
    // we don't necessarily want to stringify options back to attribute for performance and avoiding circularity
    // but we can if we want to stay in sync. SelectedSection doesn't seem to do it for 'list'.
    // this.setAttribute("options", JSON.stringify(options));
    this._manager?.setOptions(options);
  }
  setLoading(loading) {
    this.toggleAttribute("loading", loading);
  }
  setValue(value) {
    this.setAttribute("value", value);
  }
  setLabel(label) {
    this.setAttribute("label", label);
  }
  setRenderEmpty(renderer) {
    this._manager?.setRenderEmpty(renderer);
  }
  setRenderItem(renderer) {
    this._manager?.setRenderItem(renderer);
  }
  setRenderList(renderer) {
    this._manager?.setRenderList(renderer);
  }
  setFocus() {
    this._manager?.setFocus();
  }
  setBlur() {
    this._manager?.setBlur();
  }
  highlightAndScrollToElementOnTheList(id) {
    this._manager?.highlightAndScrollToElementOnTheList(id);
  }
  render() {
    this._manager?.render();
  }
  // Getters and setters
  get options() {
    return this._manager?.propOptions.options || [];
  }
  set options(val) {
    this.setOptions(val);
  }
  get loading() {
    return this.hasAttribute("loading");
  }
  set loading(val) {
    this.setLoading(val);
  }
  get value() {
    return this._manager?.propInputElement?.value ?? this.getAttribute("value") ?? "";
  }
  set value(val) {
    this.setValue(val);
  }
  get label() {
    return this.getAttribute("label") || "";
  }
  set label(val) {
    this.setLabel(val);
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(val) {
    this.setDisabled(val);
  }
  get maxHeight() {
    return this.getAttribute("max-height") || "";
  }
  set maxHeight(val) {
    this.setMaxHeight(val);
  }
  get footer() {
    return this.hasAttribute("show-footer") ? this.getAttribute("show-footer") !== "false" : true;
  }
  set footer(val) {
    this.setShowFooter(val);
  }
  get filter() {
    return this.hasAttribute("show-filter") ? this.getAttribute("show-filter") !== "false" : true;
  }
  set filter(val) {
    this.setShowFilter(val);
  }
  get highlight() {
    return this._manager?.propHighlightedId ?? null;
  }
  set highlight(val) {
    this.highlightAndScrollToElementOnTheList(val);
  }
  getManager() {
    return this._manager;
  }
  _parseJSON(val) {
    if (!val) return undefined;
    try {
      return JSON.parse(val);
    } catch (e) {
      console.error(`OptionsSection: failed to parse JSON:`, val, e);
      return undefined;
    }
  }
}
customElements.define("options-section", OptionsSection);
