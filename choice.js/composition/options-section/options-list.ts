import { OptionListManager, ListElement, OptionListManagerOptions } from "./OptionListManager.js";

export class OptionsList extends HTMLElement {
  private _manager: OptionListManager<ListElement> | null = null;
  private _options: OptionListManagerOptions<ListElement> = {};
  private _attributeEvents: Record<string, any> = {};

  static get observedAttributes() {
    return [
      "options",
      "loading",
      "value",
      "label",
      "disabled",
      "max-height",
      "show-footer",
      "show-filter",
      "onItemPick",
      "onInputChange",
      "onCancel",
      "onOk",
      "onHighlightChange",
    ];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    if (!this._manager) {
      this._initManager();
    }
  }

  private _initManager() {
    this._options = {
      options: (() => {
        try {
          return JSON.parse(this.getAttribute("options") || "[]");
        } catch (e) {
          return [];
        }
      })(),
      loading: this.hasAttribute("loading"),
      value: this.getAttribute("value") || "",
      label: this.getAttribute("label") || "",
      disabled: this.hasAttribute("disabled"),
      maxHeight: this.getAttribute("max-height") || "",
      showFooter: this.hasAttribute("show-footer") ? this.getAttribute("show-footer") !== "false" : true,
      showFilter: this.hasAttribute("show-filter") ? this.getAttribute("show-filter") !== "false" : true,
      onItemPick: (item) => {
        this.dispatchEvent(new CustomEvent("onItemPick", { detail: { item } }));
      },
      onInputChange: (e) => {
        this.dispatchEvent(
          new CustomEvent("onInputChange", {
            detail: { originalEvent: e, value: (e.target as HTMLInputElement).value },
          }),
        );
      },
      onCancel: () => {
        this.dispatchEvent(new CustomEvent("onCancel"));
      },
      onOk: () => {
        this.dispatchEvent(new CustomEvent("onOk"));
      },
      onHighlightChange: (id) => {
        this.dispatchEvent(new CustomEvent("onHighlightChange", { detail: { id } }));
      },
    };

    ["onItemPick", "onInputChange", "onCancel", "onOk"].forEach((attr) => {
      const val = this.getAttribute(attr);
      if (val) this._setupAttributeEvent(attr, val);
    });

    this._manager = new OptionListManager(this, this._options);
  }

  disconnectedCallback() {
    this._manager?.destroy();
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (!this._manager) return;

    switch (name) {
      case "options":
        try {
          this._manager.setOptions(JSON.parse(newValue));
        } catch (e) {
          console.error("Invalid JSON in options attribute", newValue);
        }
        break;
      case "loading":
        this._manager.setLoading(this.hasAttribute("loading"));
        break;
      case "value":
        this._manager.setValue(newValue);
        break;
      case "label":
        this._manager.setLabel(newValue);
        break;
      case "disabled":
        this._manager.setDisabled(this.hasAttribute("disabled"));
        break;
      case "max-height":
        this._manager.setMaxHeight(newValue);
        break;
      case "show-footer":
        this._manager.showFooter(newValue !== "false");
        break;
      case "show-filter":
        this._manager.showFilter(newValue !== "false");
        break;
      case "onItemPick":
      case "onInputChange":
      case "onCancel":
      case "onOk":
      case "onHighlightChange":
        this._setupAttributeEvent(name, newValue);
        break;
    }
  }

  private _setupAttributeEvent(name: string, value: string) {
    if (this._attributeEvents[name]) {
      this.removeEventListener(name, this._attributeEvents[name]);
      delete this._attributeEvents[name];
    }

    if (value) {
      this._attributeEvents[name] = (e: any) => {
        new Function("event", value).call(this, e);
      };
      this.addEventListener(name, this._attributeEvents[name]);
    }
  }

  // Proxied methods
  public setMaxHeight(maxHeight?: string) {
    if (maxHeight) this.setAttribute("max-height", maxHeight);
    else this.removeAttribute("max-height");
    this._manager?.setMaxHeight(maxHeight);
  }

  public setDisabled(disabled: boolean) {
    if (disabled) this.setAttribute("disabled", "");
    else this.removeAttribute("disabled");
    this._manager?.setDisabled(disabled);
  }

  public showFooter(show: boolean) {
    this.setAttribute("show-footer", String(show));
    this._manager?.showFooter(show);
  }

  public showFilter(show: boolean) {
    this.setAttribute("show-filter", String(show));
    this._manager?.showFilter(show);
  }

  public setOptions(options: ListElement[]) {
    // we don't necessarily want to stringify options back to attribute for performance and avoiding circularity
    // but we can if we want to stay in sync. SelectedList doesn't seem to do it for 'list'.
    // this.setAttribute("options", JSON.stringify(options)); 
    this._manager?.setOptions(options);
  }

  public updateOptions(options: ListElement[]) {
    this.setOptions(options);
  }

  public setLoading(loading: boolean) {
    if (loading) this.setAttribute("loading", "");
    else this.removeAttribute("loading");
    this._manager?.setLoading(loading);
  }

  public setValue(value: string) {
    this.setAttribute("value", value);
    this._manager?.setValue(value);
  }

  public setLabel(label: string) {
    this.setAttribute("label", label);
    this._manager?.setLabel(label);
  }

  public setRenderEmpty(renderer?: (defaultRender: () => string | HTMLElement) => string | HTMLElement) {
    this._manager?.setRenderEmpty(renderer);
  }

  public setRenderItem(renderer?: (item: ListElement, defaultRender: (item: ListElement) => string | HTMLElement) => string | HTMLElement) {
    this._manager?.setRenderItem(renderer);
  }

  public setRenderList(renderer?: (list: ListElement[], defaultRender: (list: ListElement[]) => (string | HTMLElement)[]) => (string | HTMLElement)[]) {
    this._manager?.setRenderList(renderer);
  }

  public setFocus() {
    this._manager?.setFocus();
  }

  public itemPick(id?: string | number | null) {
    this._manager?.itemPick(id);
  }

  public attachArrowsUpAndDown(element: HTMLElement) {
    this._manager?.attachArrowsUpAndDown(element);
  }

  public detachArrowsUpAndDown(element: HTMLElement) {
    this._manager?.detachArrowsUpAndDown(element);
  }

  public render() {
    this._manager?.render();
  }

  // Getters and setters
  get options() {
    return this._manager?.propOptions.options || [];
  }

  set options(val: ListElement[]) {
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
    this.showFooter(val);
  }

  get filter() {
    return this.hasAttribute("show-filter") ? this.getAttribute("show-filter") !== "false" : true;
  }

  set filter(val: boolean) {
    this.showFilter(val);
  }

  get highlight() {
    return this._manager?.propHighlightedId ?? null;
  }

  set highlight(val: string | number | null) {
    this.itemPick(val);
  }
}

customElements.define("options-list", OptionsList);
