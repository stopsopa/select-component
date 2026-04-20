import { SelectedListManager, ListElement, SelectedListManagerOptions } from "./SelectedListManager.js";

export class SelectedList extends HTMLElement {
  private _manager: SelectedListManager<ListElement> | null = null;
  private _options: SelectedListManagerOptions<ListElement> = {};

  static get observedAttributes() {
    return ["label", "show-input", "value", "disabled", "error", "loading", "list"];
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
      label: this.getAttribute("label") || "",
      showInput: this.hasAttribute("show-input") ? this.getAttribute("show-input") !== "false" : true,
      value: this.getAttribute("value") || "",
      disabled: this.hasAttribute("disabled"),
      error: this.hasAttribute("error"),
      loading: this.hasAttribute("loading"),
      list: (() => {
        try {
          return JSON.parse(this.getAttribute("list") || "[]");
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
        this.dispatchEvent(new CustomEvent("onChange", { detail: { originalEvent: e, value: (e.target as HTMLInputElement).value, key: (e as KeyboardEvent).key } }));
      },
      onFocus: (e) => {
        this.dispatchEvent(new CustomEvent("onFocus", { detail: { originalEvent: e } }));
      },
    };

    this._manager = new SelectedListManager(this, this._options);
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
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
      case "list":
        try {
          const list = JSON.parse(newValue);
          this._manager.updateList(list);
        } catch (e) {
          console.error("Invalid JSON in list attribute", newValue);
        }
        break;
    }
  }

  // Proxied methods
  public updateList(list: ListElement[]) {
    this._manager?.updateList(list);
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

  public render() {
    this._manager?.render();
  }

  // Getters and setters for properties
  get list() {
    return this._manager?.propList || [];
  }

  set list(val: ListElement[]) {
    this.updateList(val);
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
