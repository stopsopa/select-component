import { SelectedListManager, SelectedListElement, SelectedListManagerOptions } from "./SelectedListManager.js";

/**
 * Injects CSS into the Shadow DOM.
 * Priority:
 * 1. SelectedList.cssText (Bundler string injection)
 * 2. <meta name="selected-list-css" content="/path1.css, /path2.css"> (Global HTML declaration in main document)
 * 3. SelectedList.defaultCssUrls (Global JS property)
 *
 * Example of Global HTML Declaration in the main document <head>:
 * <head>
 *   <meta name="selected-list-css" content="../../floating-label-pattern.css, SelectedListManager.css">
 * </head>
 */
export class SelectedList extends HTMLElement {
  private _manager: SelectedListManager<SelectedListElement> | null = null;
  private _options: SelectedListManagerOptions<SelectedListElement> = {};
  private _attributeEvents: Record<string, any> = {};
  private _mountPoint!: HTMLElement;
  private _stylesInjected = false;

  // 1. For Bundlers: Assign CSS string directly (e.g. import css from './style.css?raw')
  static cssText: string = "";

  // 2. For Vanilla JS: Default URLs (Vite/Webpack5 will also process import.meta.url)
  static defaultCssUrls: string[] = [];

  static get observedAttributes() {
    return [
      "label",
      "show-input",
      "value",
      "disabled",
      "error",
      "loading",
      "selected",
      "onFocus",
      "onClear",
      "onChange",
      "onDelete",
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .component-wrapper {
          width: 100%;
        }
      </style>
      <div class="component-wrapper"></div>
    `;

    this._mountPoint = this.shadowRoot!.querySelector(".component-wrapper") as HTMLElement;
  }

  connectedCallback() {
    this._injectStyles();

    if (this._manager) return;

    this._options = {
      label: this.getAttribute("label") || "",
      showInput: this.hasAttribute("show-input") ? this.getAttribute("show-input") !== "false" : true,
      value: this.getAttribute("value") || "",
      disabled: this.hasAttribute("disabled"),
      error: this.hasAttribute("error"),
      loading: this.hasAttribute("loading"),
      selected: (() => {
        try {
          return JSON.parse(this.getAttribute("selected") || "[]");
        } catch (e) {
          return [];
        }
      })(),
      onDelete: (id) => {
        this.dispatchEvent(new CustomEvent("onDelete", { detail: { id } }));
      },
      onClear: () => {
        this.dispatchEvent(new CustomEvent("onClear"));
      },
      onChange: (e) => {
        this.dispatchEvent(
          new CustomEvent("onChange", {
            detail: {
              originalEvent: e,
              value: (e.target as HTMLInputElement).value,
              key: (e as KeyboardEvent).key,
            },
          }),
        );
      },
      onFocus: (e) => {
        this.dispatchEvent(new CustomEvent("onFocus", { detail: { originalEvent: e } }));
      },
    };

    ["onFocus", "onClear", "onChange", "onDelete"].forEach((attr) => {
      const val = this.getAttribute(attr);
      if (val) this._setupAttributeEvent(attr, val);
    });

    this._manager = new SelectedListManager(this._mountPoint, this._options);
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (!this._manager) return;

    switch (name) {
      case "label":
        this._manager.setLabel(newValue);
        break;
      case "show-input":
        this._manager.setShowInput(newValue !== "false");
        break;
      case "value":
        this._manager.setValue(newValue);
        break;
      case "disabled":
        this._manager.setDisabled(this.hasAttribute("disabled"));
        break;
      case "error":
        this._manager.setErrorState(this.hasAttribute("error"));
        break;
      case "loading":
        this._manager.setLoading(this.hasAttribute("loading"));
        break;
      case "selected":
        try {
          const list = JSON.parse(newValue);
          this._manager.setSelected(list);
        } catch (e) {
          console.error("Invalid JSON in selected attribute", newValue);
        }
        break;
      default:
        const eventName = name.startsWith("on") ? name : null;
        if (eventName) {
          this._setupAttributeEvent(name, newValue);
        }
        break;
    }
  }

  private _setupAttributeEvent(name: string, value: string) {
    const eventName = name.slice(2).toLowerCase(); // onFocus -> focus
    // Actually, our internal events are dispatched with names like "onFocus"
    // Let's use the exact name for now.
    const internalEventName = name;

    if (this._attributeEvents[name]) {
      this.removeEventListener(internalEventName, this._attributeEvents[name]);
      delete this._attributeEvents[name];
    }

    if (value) {
      this._attributeEvents[name] = (e: any) => {
        new Function("event", value).call(this, e);
      };
      this.addEventListener(internalEventName, this._attributeEvents[name]);
    }
  }


  private _injectStyles() {
    if (this._stylesInjected) return;
    this._stylesInjected = true;

    const style = document.createElement("style");
    style.className = "injected-css";

    // Scenario A: Bundler injected raw CSS string directly
    if (SelectedList.cssText) {
      style.textContent = SelectedList.cssText;
    }
    // Scenario B: Load from URLs (Global Meta Tag > Default Static Property)
    else {
      let urls: string[] = [];
      const metaTag = document.querySelector('meta[name="selected-list-css"]');

      if (metaTag && metaTag.getAttribute("content")) {
        urls = metaTag
          .getAttribute("content")!
          .split(",")
          .map((s) => s.trim());
      } else {
        urls = SelectedList.defaultCssUrls;
      }

      if (urls.length > 0) {
        style.textContent = urls.map((url) => `@import url("${url}");`).join("\n");
      }
    }

    // Insert as the first element so it can be overridden by specific logic if ever needed
    this.shadowRoot!.insertBefore(style, this.shadowRoot!.firstChild);
  }

  // Proxied methods
  public setSelected(list: SelectedListElement[]) {
    this._manager?.setSelected(list);
  }

  public setValue(value: string) {
    this._manager?.setValue(value);
  }

  public setErrorState(state: boolean) {
    if (state) this.setAttribute("error", "");
    else this.removeAttribute("error");
    this._manager?.setErrorState(state);
  }

  public setDisabled(state: boolean) {
    if (state) this.setAttribute("disabled", "");
    else this.removeAttribute("disabled");
    this._manager?.setDisabled(state);
  }

  public setLoading(state: boolean) {
    if (state) this.setAttribute("loading", "");
    else this.removeAttribute("loading");
    this._manager?.setLoading(state);
  }

  public setLabel(text: string) {
    this.setAttribute("label", text);
    this._manager?.setLabel(text);
  }

  public setShowInput(state: boolean) {
    this.setAttribute("show-input", String(state));
    this._manager?.setShowInput(state);
  }

  public setRenderItem(
    renderer?: (item: SelectedListElement, defaultRender: (item: SelectedListElement) => HTMLElement) => HTMLElement,
  ) {
    this._manager?.setRenderItem(renderer);
  }

  public setRenderList(
    renderer?: (
      selected: SelectedListElement[],
      defaultRender: (selected: SelectedListElement[]) => HTMLElement[],
    ) => HTMLElement[],
  ) {
    this._manager?.setRenderList(renderer);
  }

  public render() {
    this._manager?.render();
  }

  // Getters and setters for properties
  get selected() {
    return this._manager?.propSelected || [];
  }

  set selected(val: SelectedListElement[]) {
    this.setSelected(val);
  }

  get value() {
    return this._manager?.propInputElement?.value || "";
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

  get error() {
    return this.hasAttribute("error");
  }

  set error(val: boolean) {
    this.setErrorState(val);
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  set disabled(val: boolean) {
    this.setDisabled(val);
  }

  get loading() {
    return this.hasAttribute("loading");
  }

  set loading(val: boolean) {
    this.setLoading(val);
  }
}

customElements.define("selected-list", SelectedList);
