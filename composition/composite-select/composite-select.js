import { CompositeManager } from "./CompositeManager.js";
/**
 * CompositeSelect web component — wraps CompositeManager.
 *
 * Does NOT use shadow DOM because ContainerManager creates a <div popover>
 * whose positioning CSS classes (cover-bottom, bottom, etc. from popover.css)
 * are global and cannot penetrate shadow DOM boundaries.
 * The host page must load the required CSS via <link> tags, exactly as demo.html does.
 *
 * Attribute prefixes:
 *   selected-*   →  SelectedSectionManager properties / events
 *   options-*    →  OptionsSectionManager properties / events
 *   container-*  →  ContainerManager properties / events
 */
export class CompositeSelect extends HTMLElement {
  _manager = null;
  _mountPoint;
  static get observedAttributes() {
    return [
      // selected-* attributes
      "selected-selected",
      "selected-show-input",
      "selected-value",
      "selected-label",
      "selected-disabled",
      "selected-error",
      "selected-loading",
      "selected-show-delete",
      // options-* attributes
      "options-options",
      "options-loading",
      "options-value",
      "options-label",
      "options-disabled",
      "options-max-height",
      "options-show-footer",
      "options-show-filter",
      // container-* attributes
      "container-position",
      "container-offset",
    ];
  }
  constructor() {
    super();
    // Light DOM — no shadow DOM (popover CSS must be global)
    this._mountPoint = document.createElement("div");
  }
  connectedCallback() {
    if (!this._mountPoint.parentNode) {
      this.appendChild(this._mountPoint);
    }
    if (this._manager) return;
    const hasBoolAttr = (name, defaultVal) =>
      this.hasAttribute(name) ? this.getAttribute(name) !== "false" : defaultVal;
    this._manager = new CompositeManager(this._mountPoint, {
      select: {
        selected: this._parseJSON(this.getAttribute("selected-selected")) ?? [],
        showInput: hasBoolAttr("selected-show-input", true),
        value: this.getAttribute("selected-value") || "",
        label: this.getAttribute("selected-label") || "",
        disabled: this.hasAttribute("selected-disabled"),
        error: this.hasAttribute("selected-error"),
        loading: this.hasAttribute("selected-loading"),
        showDelete: hasBoolAttr("selected-show-delete", true),
      },
      options: {
        options: this._parseJSON(this.getAttribute("options-options")) ?? [],
        loading: this.hasAttribute("options-loading"),
        value: this.getAttribute("options-value") || "",
        label: this.getAttribute("options-label") || "",
        disabled: this.hasAttribute("options-disabled"),
        maxHeight: this.getAttribute("options-max-height") || undefined,
        showFooter: hasBoolAttr("options-show-footer", true),
        showFilter: hasBoolAttr("options-show-filter", true),
      },
      container: {},
    });
    if (this.getAttribute("container-position")) {
      this._manager.container.setPosition(this.getAttribute("container-position"));
    }
    if (this.getAttribute("container-offset")) {
      this._manager.container.setOffset(this.getAttribute("container-offset"));
    }
  }
  disconnectedCallback() {
    this._manager?.destroy();
    this._manager = null;
  }
  attributeChangedCallback(name, _oldValue, newValue) {
    if (!this._manager) return;
    const isTrue = this.hasAttribute(name);
    switch (name) {
      // ── selected ─────────────────────────────────────────────────────────
      case "selected-selected": {
        const parsed = this._parseJSON(newValue);
        if (parsed !== undefined) {
          this._manager.selected.setSelected(parsed);
        }
        break;
      }
      case "selected-show-input":
        this._manager.selected.setShowInput(isTrue);
        break;
      case "selected-value":
        this._manager.selected.setValue(newValue);
        break;
      case "selected-label":
        this._manager.selected.setLabel(newValue);
        break;
      case "selected-disabled":
        this._manager.selected.setDisabled(isTrue);
        break;
      case "selected-error":
        this._manager.selected.setError(isTrue);
        break;
      case "selected-loading":
        this._manager.selected.setLoading(isTrue);
        break;
      case "selected-show-delete":
        this._manager.selected.setShowDelete(isTrue);
        break;
      // ── options ──────────────────────────────────────────────────────────
      case "options-options": {
        const parsed = this._parseJSON(newValue);
        if (parsed !== undefined) {
          this._manager.options.setOptions(parsed);
        }
        break;
      }
      case "options-loading":
        this._manager.options.setLoading(isTrue);
        break;
      case "options-value":
        this._manager.options.setValue(newValue);
        break;
      case "options-label":
        this._manager.options.setLabel(newValue);
        break;
      case "options-disabled":
        this._manager.options.setDisabled(isTrue);
        break;
      case "options-max-height":
        this._manager.options.setMaxHeight(newValue);
        break;
      case "options-show-footer":
        this._manager.options.setShowFooter(isTrue);
        break;
      case "options-show-filter":
        this._manager.options.setShowFilter(isTrue);
        break;
      // ── container ────────────────────────────────────────────────────────
      case "container-position":
        this._manager.container.setPosition(newValue);
        break;
      case "container-offset":
        this._manager.container.setOffset(newValue);
        break;
    }
  }
  // ─── Accessor ─────────────────────────────────────────────────────────────
  getManager() {
    return this._manager;
  }
  _parseJSON(val) {
    if (!val) return undefined;
    try {
      return JSON.parse(val);
    } catch (e) {
      console.error(`CompositeSelect: failed to parse JSON:`, val, e);
      return undefined;
    }
  }
}
customElements.define("composite-select", CompositeSelect);
