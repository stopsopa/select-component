import { SelectedSectionManager } from "./SelectedSectionManager.js";
/**
 * Injects CSS into the Shadow DOM.
 * Priority:
 * 1. SelectedSection.cssText (Bundler string injection)
 * 2. <meta name="select-component" content="/path1.css, /path2.css"> (Global HTML declaration in main document)
 * 3. SelectedSection.defaultCssUrls (Global JS property)
 *
 * Example of Global HTML Declaration in the main document <head>:
 * <head>
 *   <meta name="select-component" content="SelectedSectionManager.css">
 * </head>
 */
export class SelectedSection extends HTMLElement {
  _manager = null;
  _options = {};
  _mountPoint;
  _stylesInjected = false;
  // 1. For Bundlers: Assign CSS string directly (e.g. import css from './style.css?raw')
  static cssText = "";
  // 2. For Vanilla JS: Default URLs (Vite/Webpack5 will also process import.meta.url)
  static defaultCssUrls = [];
  static get observedAttributes() {
    return ["label", "show-input", "value", "disabled", "error", "loading", "selected"];
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
      label: this.getAttribute("label") || "",
      showInput: this.hasAttribute("show-input"),
      value: this.getAttribute("value") || "",
      disabled: this.hasAttribute("disabled"),
      error: this.hasAttribute("error"),
      loading: this.hasAttribute("loading"),
      selected: this._parseJSON(this.getAttribute("selected")) ?? [],
    };
    this._manager = new SelectedSectionManager(this._mountPoint, this._options);
  }
  disconnectedCallback() {
    this._manager?.destroy();
    this._manager = null;
  }
  attributeChangedCallback(name, _oldValue, newValue) {
    if (!this._manager) return;
    const isTrue = this.hasAttribute(name);
    switch (name) {
      case "label":
        this._manager.setLabel(newValue);
        break;
      case "show-input":
        this._manager.setShowInput(isTrue);
        break;
      case "value":
        this._manager.setValue(newValue);
        break;
      case "disabled":
        this._manager.setDisabled(isTrue);
        break;
      case "error":
        this._manager.setError(isTrue);
        break;
      case "loading":
        this._manager.setLoading(isTrue);
        break;
      case "selected": {
        const parsed = this._parseJSON(newValue);
        if (parsed !== undefined) {
          this._manager.setSelected(parsed);
        }
        break;
      }
    }
  }
  _injectStyles() {
    if (this._stylesInjected) return;
    this._stylesInjected = true;
    const style = document.createElement("style");
    // Scenario A: Bundler injected raw CSS string directly
    if (SelectedSection.cssText) {
      style.textContent = SelectedSection.cssText;
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
        urls = SelectedSection.defaultCssUrls;
      }
      urls.forEach((url) => {
        if (!url) return;
        style.textContent += `@import url("${url}");\n`;
      });
    }
    // Remove existing injected CSS if updating dynamically
    const existingStyle = this.shadowRoot.querySelector("style");
    if (existingStyle) {
      existingStyle.remove();
    }
    this.shadowRoot.appendChild(style);
  }
  // Proxied methods
  setSelected(list) {
    this._manager?.setSelected(list);
  }
  setValue(value) {
    this._manager?.setValue(value);
  }
  clearSearch(triggerOnChange = true) {
    this._manager?.clearSearch(triggerOnChange);
  }
  setError(state) {
    this.toggleAttribute("error", state);
  }
  setDisabled(state) {
    this.toggleAttribute("disabled", state);
  }
  setLoading(state) {
    this.toggleAttribute("loading", state);
  }
  setLabel(text) {
    this.setAttribute("label", text);
  }
  setShowInput(state) {
    this.toggleAttribute("show-input", state);
  }
  setRenderItem(renderer) {
    this._manager?.setRenderItem(renderer);
  }
  setRenderList(renderer) {
    this._manager?.setRenderList(renderer);
  }
  render() {
    this._manager?.render();
  }
  // Getters and setters for properties
  get selected() {
    return this._manager?.getSelected() || [];
  }
  set selected(val) {
    this.setSelected(val);
  }
  get value() {
    return this._manager?.propInputElement?.value || "";
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
  get error() {
    return this.hasAttribute("error");
  }
  set error(val) {
    this.setError(val);
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(val) {
    this.setDisabled(val);
  }
  get loading() {
    return this.hasAttribute("loading");
  }
  set loading(val) {
    this.setLoading(val);
  }
  setFocus() {
    this._manager?.setFocus();
  }
  getManager() {
    return this._manager;
  }
  _parseJSON(val) {
    if (!val) return undefined;
    try {
      return JSON.parse(val);
    } catch (e) {
      console.error(`SelectedSection: failed to parse JSON:`, val, e);
      return undefined;
    }
  }
}
customElements.define("selected-section", SelectedSection);
