import { CompositeManager } from "./CompositeManager.js";
import type { Item } from "../types.js";
import type { PositionType } from "../container/ContainerManager.js";

/**
 * CompositeSelect web component — wraps CompositeManager.
 *
 * Does NOT use shadow DOM because ContainerManager creates a <div popover>
 * whose positioning CSS classes (cover-bottom, bottom, etc. from popover.css)
 * are global and cannot penetrate shadow DOM boundaries.
 * The host page must load the required CSS via <link> tags, exactly as ContainerManager.html does.
 *
 * Attribute prefixes:
 *   selected-*   →  SelectedSectionManager properties / events
 *   options-*    →  OptionsSectionManager properties / events
 *   container-*  →  ContainerManager properties / events
 */
export class CompositeSelect<T extends Item = Item> extends HTMLElement {
  private _manager: CompositeManager<T> | null = null;
  private _mountPoint!: HTMLDivElement;

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

    const hasBoolAttr = (name: string, defaultVal: boolean) =>
      this.hasAttribute(name) ? this.getAttribute(name) !== "false" : defaultVal;

    // ── DEBUG: dump all boolean attrs at init time ────────────────────────────
    const _bools: Record<string, { hasAttr: boolean; attrVal: string | null; resolved: boolean }> = {
      "selected-disabled":    { hasAttr: this.hasAttribute("selected-disabled"),    attrVal: this.getAttribute("selected-disabled"),    resolved: hasBoolAttr("selected-disabled", false) },
      "selected-error":       { hasAttr: this.hasAttribute("selected-error"),       attrVal: this.getAttribute("selected-error"),       resolved: hasBoolAttr("selected-error", false) },
      "selected-loading":     { hasAttr: this.hasAttribute("selected-loading"),     attrVal: this.getAttribute("selected-loading"),     resolved: hasBoolAttr("selected-loading", false) },
      "selected-show-input":  { hasAttr: this.hasAttribute("selected-show-input"),  attrVal: this.getAttribute("selected-show-input"),  resolved: hasBoolAttr("selected-show-input", true) },
      "selected-show-delete": { hasAttr: this.hasAttribute("selected-show-delete"), attrVal: this.getAttribute("selected-show-delete"), resolved: hasBoolAttr("selected-show-delete", true) },
      "options-loading":      { hasAttr: this.hasAttribute("options-loading"),      attrVal: this.getAttribute("options-loading"),      resolved: hasBoolAttr("options-loading", false) },
      "options-disabled":     { hasAttr: this.hasAttribute("options-disabled"),     attrVal: this.getAttribute("options-disabled"),      resolved: hasBoolAttr("options-disabled", false) },
      "options-show-footer":  { hasAttr: this.hasAttribute("options-show-footer"),  attrVal: this.getAttribute("options-show-footer"),  resolved: hasBoolAttr("options-show-footer", true) },
      "options-show-filter":  { hasAttr: this.hasAttribute("options-show-filter"),  attrVal: this.getAttribute("options-show-filter"),  resolved: hasBoolAttr("options-show-filter", true) },
    };
    for (const [attr, info] of Object.entries(_bools)) {
      console.log(`[composite-select][connectedCallback] ${attr}: hasAttr=type >${typeof info.hasAttr}< value >${info.hasAttr}<  attrVal=type >${typeof info.attrVal}< value >${info.attrVal}<  resolved=type >${typeof info.resolved}< value >${info.resolved}<`);
    }
    // ─────────────────────────────────────────────────────────────────────────

    this._manager = new CompositeManager<T>(this._mountPoint, {
      select: {
        selected: this._parseJSON(this.getAttribute("selected-selected")) ?? [],
        showInput: hasBoolAttr("selected-show-input", true),
        value: this.getAttribute("selected-value") || "",
        label: this.getAttribute("selected-label") || "",
        disabled: hasBoolAttr("selected-disabled", false),
        error: hasBoolAttr("selected-error", false),
        loading: hasBoolAttr("selected-loading", false),
        showDelete: hasBoolAttr("selected-show-delete", true),
      },
      options: {
        options: this._parseJSON(this.getAttribute("options-options")) ?? [],
        loading: hasBoolAttr("options-loading", false),
        value: this.getAttribute("options-value") || "",
        label: this.getAttribute("options-label") || "",
        disabled: hasBoolAttr("options-disabled", false),
        maxHeight: this.getAttribute("options-max-height") || undefined,
        showFooter: hasBoolAttr("options-show-footer", true),
        showFilter: hasBoolAttr("options-show-filter", true),
      },
      container: {},
    });

    if (this.getAttribute("container-position")) {
      this._manager.container.setPosition(this.getAttribute("container-position") as PositionType);
    }
    if (this.getAttribute("container-offset")) {
      this._manager.container.setOffset(this.getAttribute("container-offset")!);
    }
  }

  disconnectedCallback() {
    this._manager?.destroy();
    this._manager = null;
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (!this._manager) return;

    const isTrue = newValue !== null && newValue !== "false";

    // ── DEBUG: dump bool attrs as they change ─────────────────────────────────
    const _boolAttrs = new Set(["selected-disabled","selected-error","selected-loading","selected-show-input","selected-show-delete","options-loading","options-disabled","options-show-footer","options-show-filter"]);
    if (_boolAttrs.has(name)) {
      console.log(`[composite-select][attributeChangedCallback] ${name}: isTrue=type >${typeof isTrue}< value >${isTrue}<  newValue=type >${typeof newValue}< value >${newValue}<  oldValue=type >${typeof _oldValue}< value >${_oldValue}<`);
    }
    // ─────────────────────────────────────────────────────────────────────────

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
        this._manager.container.setPosition(newValue as PositionType);
        break;
      case "container-offset":
        this._manager.container.setOffset(newValue);
        break;
    }
  }

  // ─── Accessor ─────────────────────────────────────────────────────────────

  public getManager<TT extends Item = T>(): CompositeManager<TT> | null {
    return this._manager as unknown as CompositeManager<TT>;
  }

  private _parseJSON(val: string | null) {
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
