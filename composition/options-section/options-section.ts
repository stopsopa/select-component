import { OptionsSectionManager } from "./OptionsSectionManager.js";
import type { OptionsSectionManagerOptions } from "./OptionsSectionManager.js";
import type { Item } from "../types.js";

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
  static cssText: string = "";
  static defaultCssUrls: string[] = [];

  private _manager: OptionsSectionManager<Item> | null = null;
  private _options: OptionsSectionManagerOptions<Item> = {};
  private _stylesInjected: boolean = false;
  private _mountPoint!: HTMLElement;

  static get observedAttributes() {
    return ["options", "loading", "value", "label", "disabled", "max-height", "show-footer", "show-filter"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.shadowRoot!.innerHTML = `<style></style><div></div>`;

    this._mountPoint = this.shadowRoot!.querySelector("div") as HTMLElement;
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

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
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

  private _injectStyles() {
    if (this._stylesInjected) return;
    this._stylesInjected = true;

    const style = document.createElement("style");

    // Scenario A: Bundler injected raw CSS string directly
    if (OptionsSection.cssText) {
      style.textContent = OptionsSection.cssText;
    }
    // Scenario B: Load from URLs (Global Meta Tag > Default Static Property)
    else {
      let urls: string[] = [];
      const metaTag = document.querySelector('meta[name="select-component"]');

      if (metaTag && metaTag.getAttribute("content")) {
        urls = metaTag
          .getAttribute("content")!
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
    const existingStyle = this.shadowRoot!.querySelector("style");
    if (existingStyle) {
      existingStyle.remove();
    }

    this.shadowRoot!.appendChild(style);
  }

  // Proxied methods
  public setMaxHeight(maxHeight?: string) {
    if (maxHeight) this.setAttribute("max-height", maxHeight);
    else this.removeAttribute("max-height");
  }

  public setDisabled(disabled: boolean) {
    this.toggleAttribute("disabled", disabled);
  }

  public setShowFooter(show: boolean) {
    this.toggleAttribute("show-footer", show);
  }

  public setShowFilter(show: boolean) {
    this.toggleAttribute("show-filter", show);
  }

  public setOptions(options: Item[]) {
    // we don't necessarily want to stringify options back to attribute for performance and avoiding circularity
    // but we can if we want to stay in sync. SelectedSection doesn't seem to do it for 'list'.
    // this.setAttribute("options", JSON.stringify(options));
    this._manager?.setOptions(options);
  }

  public setLoading(loading: boolean) {
    this.toggleAttribute("loading", loading);
  }

  public setValue(value: string) {
    this.setAttribute("value", value);
  }

  public setLabel(label: string) {
    this.setAttribute("label", label);
  }

  public setRenderEmpty(renderer?: (defaultRender: () => string | HTMLElement) => string | HTMLElement) {
    this._manager?.setRenderEmpty(renderer);
  }

  public setRenderItem(
    renderer?: (
      item: Item,
      defaultRender: (item: Item, searchValue: string | undefined) => string | HTMLElement,
      searchValue: string | undefined,
    ) => string | HTMLElement,
  ) {
    this._manager?.setRenderItem(renderer);
  }

  public setRenderList(
    renderer?: (list: Item[], defaultRender: (list: Item[]) => (string | HTMLElement)[]) => (string | HTMLElement)[],
  ) {
    this._manager?.setRenderList(renderer);
  }

  public setFocus() {
    this._manager?.setFocus();
  }
  public setBlur() {
    this._manager?.setBlur();
  }

  public highlightAndScrollToElementOnTheList(id?: string | number | null) {
    this._manager?.highlightAndScrollToElementOnTheList(id);
  }

  public render() {
    this._manager?.render();
  }

  // Getters and setters
  get options() {
    return this._manager?.propOptions.options || [];
  }

  set options(val: Item[]) {
    this.setOptions(val);
  }

  get loading() {
    return this.hasAttribute("loading");
  }

  set loading(val: boolean) {
    this.setLoading(val);
  }

  get value() {
    return this._manager?.propInputElement?.value ?? this.getAttribute("value") ?? "";
  }

  set value(val: string) {
    this.setValue(val);
  }

  get label() {
    return this.getAttribute("label") || "";
  }

  set label(val: string) {
    this.setLabel(val);
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  set disabled(val: boolean) {
    this.setDisabled(val);
  }

  get maxHeight() {
    return this.getAttribute("max-height") || "";
  }

  set maxHeight(val: string) {
    this.setMaxHeight(val);
  }

  get footer() {
    return this.hasAttribute("show-footer") ? this.getAttribute("show-footer") !== "false" : true;
  }

  set footer(val: boolean) {
    this.setShowFooter(val);
  }

  get filter() {
    return this.hasAttribute("show-filter") ? this.getAttribute("show-filter") !== "false" : true;
  }

  set filter(val: boolean) {
    this.setShowFilter(val);
  }

  get highlight() {
    return this._manager?.propHighlightedId ?? null;
  }

  set highlight(val: string | number | null) {
    this.highlightAndScrollToElementOnTheList(val);
  }

  public getManager() {
    return this._manager;
  }

  private _parseJSON(val: string | null) {
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
