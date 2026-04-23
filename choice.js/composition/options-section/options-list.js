import { OptionListManager } from "./OptionListManager.js";
class OptionsList extends HTMLElement {
  _manager = null;
  _options = {};
  _attributeEvents = {};
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
      "onItemClick",
      "onInputChange",
      "onCancel",
      "onOk"
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
  _initManager() {
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
      onItemClick: (item) => {
        this.dispatchEvent(new CustomEvent("onItemClick", { detail: { item } }));
      },
      onInputChange: (e) => {
        this.dispatchEvent(
          new CustomEvent("onInputChange", {
            detail: { originalEvent: e, value: e.target.value }
          })
        );
      },
      onCancel: () => {
        this.dispatchEvent(new CustomEvent("onCancel"));
      },
      onOk: () => {
        this.dispatchEvent(new CustomEvent("onOk"));
      }
    };
    ["onItemClick", "onInputChange", "onCancel", "onOk"].forEach((attr) => {
      const val = this.getAttribute(attr);
      if (val) this._setupAttributeEvent(attr, val);
    });
    this._manager = new OptionListManager(this, this._options);
  }
  attributeChangedCallback(name, _oldValue, newValue) {
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
      case "onItemClick":
      case "onInputChange":
      case "onCancel":
      case "onOk":
        this._setupAttributeEvent(name, newValue);
        break;
    }
  }
  _setupAttributeEvent(name, value) {
    if (this._attributeEvents[name]) {
      this.removeEventListener(name, this._attributeEvents[name]);
      delete this._attributeEvents[name];
    }
    if (value) {
      this._attributeEvents[name] = (e) => {
        new Function("event", value).call(this, e);
      };
      this.addEventListener(name, this._attributeEvents[name]);
    }
  }
  // Proxied methods
  setMaxHeight(maxHeight) {
    if (maxHeight) this.setAttribute("max-height", maxHeight);
    else this.removeAttribute("max-height");
    this._manager?.setMaxHeight(maxHeight);
  }
  setDisabled(disabled) {
    if (disabled) this.setAttribute("disabled", "");
    else this.removeAttribute("disabled");
    this._manager?.setDisabled(disabled);
  }
  showFooter(show) {
    this.setAttribute("show-footer", String(show));
    this._manager?.showFooter(show);
  }
  showFilter(show) {
    this.setAttribute("show-filter", String(show));
    this._manager?.showFilter(show);
  }
  setOptions(options) {
    // we don't necessarily want to stringify options back to attribute for performance and avoiding circularity
    // but we can if we want to stay in sync. SelectedList doesn't seem to do it for 'list'.
    // this.setAttribute("options", JSON.stringify(options)); 
    this._manager?.setOptions(options);
  }
  updateOptions(options) {
    this.setOptions(options);
  }
  setLoading(loading) {
    if (loading) this.setAttribute("loading", "");
    else this.removeAttribute("loading");
    this._manager?.setLoading(loading);
  }
  setValue(value) {
    this.setAttribute("value", value);
    this._manager?.setValue(value);
  }
  setLabel(label) {
    this.setAttribute("label", label);
    this._manager?.setLabel(label);
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
    this.showFooter(val);
  }
  get filter() {
    return this.hasAttribute("show-filter") ? this.getAttribute("show-filter") !== "false" : true;
  }
  set filter(val) {
    this.showFilter(val);
  }
}
customElements.define("options-list", OptionsList);
export {
  OptionsList
};
