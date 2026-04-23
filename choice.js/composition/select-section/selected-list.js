import { SelectedListManager } from "./SelectedListManager.js";
class SelectedList extends HTMLElement {
  _manager = null;
  _options = {};
  _attributeEvents = {};
  static get observedAttributes() {
    return ["label", "show-input", "value", "disabled", "error", "loading", "list", "onFocus", "onClear", "onChange", "onDelete"];
  }
  constructor() {
    super();
  }
  connectedCallback() {
    if (!this._manager) {
      this._initManager();
    }
  }
  _initManager() {
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
        this.dispatchEvent(new CustomEvent("onChange", { detail: { originalEvent: e, value: e.target.value, key: e.key } }));
      },
      onFocus: (e) => {
        this.dispatchEvent(new CustomEvent("onFocus", { detail: { originalEvent: e } }));
      }
    };
    ["onFocus", "onClear", "onChange", "onDelete"].forEach((attr) => {
      const val = this.getAttribute(attr);
      if (val) this._setupAttributeEvent(attr, val);
    });
    this._manager = new SelectedListManager(this, this._options);
  }
  attributeChangedCallback(name, _oldValue, newValue) {
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
      default:
        const eventName = name.startsWith("on") ? name : null;
        if (eventName) {
          this._setupAttributeEvent(name, newValue);
        }
        break;
    }
  }
  _setupAttributeEvent(name, value) {
    const eventName = name.slice(2).toLowerCase();
    // onFocus -> focus
    // Actually, our internal events are dispatched with names like "onFocus"
    // Let's use the exact name for now.
    const internalEventName = name;
    if (this._attributeEvents[name]) {
      this.removeEventListener(internalEventName, this._attributeEvents[name]);
      delete this._attributeEvents[name];
    }
    if (value) {
      this._attributeEvents[name] = (e) => {
        new Function("event", value).call(this, e);
      };
      this.addEventListener(internalEventName, this._attributeEvents[name]);
    }
  }
  // Proxied methods
  updateList(list) {
    this._manager?.updateList(list);
  }
  setValue(value) {
    this._manager?.setValue(value);
  }
  setErrorState(state) {
    if (state) this.setAttribute("error", "");
    else this.removeAttribute("error");
    this._manager?.setErrorState(state);
  }
  setDisabled(state) {
    if (state) this.setAttribute("disabled", "");
    else this.removeAttribute("disabled");
    this._manager?.setDisabled(state);
  }
  setLoading(state) {
    if (state) this.setAttribute("loading", "");
    else this.removeAttribute("loading");
    this._manager?.setLoading(state);
  }
  setLabel(text) {
    this.setAttribute("label", text);
    this._manager?.setLabel(text);
  }
  setShowInput(state) {
    this.setAttribute("show-input", String(state));
    this._manager?.setShowInput(state);
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
  get list() {
    return this._manager?.propList || [];
  }
  set list(val) {
    this.updateList(val);
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
    this.setErrorState(val);
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
}
customElements.define("selected-list", SelectedList);
export {
  SelectedList
};
