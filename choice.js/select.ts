export interface SelectOption {
  key: string | number | null;
  label: string;
  selected: boolean;
}

// crate SelectOptionWithNew which has all fields from SelectOption and new:boolean
export interface SelectOptionWithNew extends SelectOption {
  new: boolean;
}

export class SelectComponent extends HTMLElement {
  private _options: SelectOption[] = [];
  private _selectedKeys: string[] = []; // holds just keys
  private _selected: SelectOptionWithNew[] = []; // holds full object always in sync with _selectedKeys
  private _toggled: SelectOptionWithNew[] = [];
  private _isReady: boolean = false;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    const template = document.createElement("template");
    template.innerHTML = `
      <link rel="stylesheet"   href="https://stopsopa.github.io/pages/js/popper/html-vanilla/popover.css" />
      <style>
        .web-select-component {
          position: relative;
          display: flex;
          align-items: center;
          padding: 0;
          box-sizing: border-box;
          font-family: inherit;
          background: #fff;
          margin-bottom: 19px;
          cursor: text;

          &::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 4px;
            box-shadow: 0 0 0 1px var(--gcp-css-border, #99999b);
            transition: box-shadow var(--gcp-css-transition, 150ms cubic-bezier(0.4, 0, 0.2, 1));
            pointer-events: none;
            z-index: 0;
          }

          &:focus-within::after {
            box-shadow: 0 0 0 2px var(--gcp-css-primary, #1a73e8);
          }

          .floating-label {
            position: absolute;
            left: 0;
            margin-left: 7px;
            top: 9px; /* Matches standard gcp-css label alignment */
            font-size: 16px;
            color: var(--gcp-css-gray-text, #5f6368);
            pointer-events: none;
            transition:
              transform var(--gcp-css-transition, 150ms),
              font-size var(--gcp-css-transition, 150ms),
              color var(--gcp-css-transition, 150ms),
              top var(--gcp-css-transition, 150ms);
            background: #fff;
            padding: 0 4px;
            z-index: 3;
            line-height: 1;
          }

          /* Float condition */
          &:focus-within .floating-label,
          &:has(.element) .floating-label,
          &:has(input:not(:placeholder-shown)) .floating-label {
            top: 0;
            transform: translateY(-50%);
            font-size: 12px;
          }

          .flex-list {
            display: flex;
            flex-wrap: wrap;
            flex-grow: 1;
            row-gap: 0; /* Option margins handle vertical spacing */
            column-gap: 6px;
            align-items: center;
            z-index: 1;
            min-width: 0;
            padding: 0;
            padding-left: 12px;
            padding-top: 2px;
            padding-bottom: 2px;

            /* Shared vertical sizing for all direct children */
            > * {
              font-size: 16px;
              line-height: 1.15;
              padding-top: 3px;
              padding-bottom: 3px;
              box-sizing: border-box;
              margin-top: 3px;
              margin-bottom: 3px;
            }

            input {
              border: none;
              outline: none;
              background: transparent;
              field-sizing: content; /* Grows with typed content — no JS needed */
              min-width: 1px;
              padding-left: 0;
              padding-right: 0;
              font-family: inherit;
              color: inherit;

              &::placeholder {
                color: transparent;
              }
            }
          }

          .buttons-container {
            display: flex;
            align-items: center;
            margin-left: auto;
            padding-left: 4px;
            z-index: 2;
            flex-shrink: 0;

            button {
              background: none;
              border: none;
              cursor: pointer;
              font-size: 14px;
              padding: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--gcp-css-gray-text, #5f6368);
              line-height: 1;

              &:hover {
                color: #333;
              }
            }
          }

          .element {
            display: flex;
            align-items: center;
            background: rgb(0 0 0 / 12%);
            border-radius: 2px;
            padding-left: 4px;
            padding-right: 5px;
            color: rgba(0, 0, 0, 0.88);
            margin-left: -4px;
            margin-right: 5px;

            [data-delete] {
              cursor: pointer;
              margin-left: 4px;
              width: 14px;
              height: 14px;
              min-width: 14px;
              min-height: 14px;
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;

              &::before {
                content: "✕";
                font-size: 10px;
                line-height: 1;
                color: rgba(0, 0, 0, 0.45);
              }

              &:hover {
                background-color: rgba(0, 0, 0, 0.08);

                &::before {
                  color: rgba(0, 0, 0, 0.85);
                }
              }
            }
          }
        }
        [data-popover] {
          --popover-offset: 0px; /* NOTE: you can remove it from here and define in :root {--popover-offset: 10px;} to controll it globally */
          width: anchor-size(width); /* Matches width of the source element passed in showPopover({ source }) */
          box-sizing: border-box;
          flex-direction: column;
          max-height: 300px;
          border: 1px solid var(--gcp-css-border, #99999b);
          border-radius: 4px;
          background: #fff;
          padding: 8px 0;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);

          &:popover-open {
            display: flex; /* Only apply flex when popover is shown */
          }

          .filter {
            flex-shrink: 0; /* Stick to top, don't shrink */
          }

          .options {
            flex: 1;
            overflow-y: auto;
            min-height: 0; /* Required for flex child scrolling */
            display: flex;
            flex-direction: column;
            gap: 2px;
            padding: 0 8px;
          }

          .footer {
            flex-shrink: 0; /* Stick to bottom, don't shrink */
            padding: 8px 8px 0;
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            border-top: 1px solid #eee;
            margin-top: 8px;
          }

          /* General button styling directly in shadow DOM as a fallback for GCP classes */
          .gcp-css {
            background-color: transparent;
            border: none;
            color: var(--gcp-css-primary, #1a73e8);
            font-family: inherit;
            font-size: 14px;
            font-weight: 500;
            padding: 6px 16px;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.15s ease;
          }
          
          .gcp-css:hover {
            background-color: rgba(26, 115, 232, 0.04);
          }
        }
        /* Needs to visually distinguish options in the popover */
        .options .element {
            cursor: pointer;
            background: transparent;
            margin: 0;
            padding: 6px;
            border-left: 2px solid transparent;
        }
        .options .element:hover {
            background: rgba(0, 0, 0, 0.04);
        }
        .options .element.selected {
            border-left-color: var(--gcp-css-primary, #1a73e8);
            background: rgba(0, 0, 0, 0.02);
        }
      </style>
      <div class="web-select-component">
        <label class="floating-label">Select options</label>
        <div class="flex-list">
          <input type="text" placeholder=" " size="1" />
        </div>
        <div class="buttons-container">
          <button class="clear-btn">✕</button>
          <button class="dropdown-btn">⬇️</button>
        </div>

        <div class="popover cover-bottom" data-popover popover>
          <div class="options">
          </div>
          <div class="footer">
            <button type="button" class="gcp-css" data-ok popovertargetaction="hide">OK</button>
            <button type="button" class="gcp-css white" popovertargetaction="hide">Cancel</button>
          </div>
        </div>
      </div>
    `;
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    const shadow = this.shadowRoot!;
    const webSelectComponent = shadow.querySelector(".web-select-component") as HTMLElement;
    const flexList = shadow.querySelector(".flex-list") as HTMLElement;
    const input = shadow.querySelector("input") as HTMLInputElement;
    const clearBtn = shadow.querySelector(".clear-btn") as HTMLElement;
    const options = shadow.querySelector(".options") as HTMLElement;
    const popoverEl = shadow.querySelector("[data-popover]") as HTMLElement;

    // Delegated handler: clicking any option's div removes that option
    flexList.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const removeBtn = target.closest("[data-delete]");
      if (removeBtn) {
        const element = removeBtn.closest(".element") as HTMLElement;
        if (element) {
          const strKey = element.dataset.key;
          this._selectedKeys = this._selectedKeys.filter(k => k !== strKey);
          this._reconcileSelected();
          this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
        }
      }
    });

    clearBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this._selectedKeys = [];
      this._reconcileSelected();
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    });

    options.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const targetEl = target.closest(".element") as HTMLElement;
      if (targetEl) {
        const strKey = targetEl.dataset.key;
        const option = this._options.find(o => String(o.key) === strKey);
        
        if (option) {
           const toggledIndex = this._toggled.findIndex(o => o.key === option.key);
           if (toggledIndex !== -1) {
             this._toggled.splice(toggledIndex, 1);
             targetEl.classList.remove("selected");
           } else {
             this._toggled.push({ ...option, new: false });
             targetEl.classList.add("selected");
           }
        }
      }
    });

    input.addEventListener("input", () => {
      this._openPopover();
    });

    webSelectComponent.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;

      // If click came from a hide button (or inside one), hide and stop
      const hideBtn = target.closest(`[popovertargetaction="hide"]`) as HTMLElement;
      if (hideBtn) {
        if (hideBtn.hasAttribute("data-ok")) {
          this._selectedKeys = this._toggled.map((t) => String(t.key));
          this._reconcileSelected();
          this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
        }
        (popoverEl as any).hidePopover(); // Use 'any' type cast since hidePopover is somewhat newer for strict Typescript
        return;
      }

      // If click came from buttons-container, element delete, or popup options list, skip opening popover
      if (target.closest(".buttons-container") || target.closest("[data-delete]") || target.closest(".options")) {
        return;
      }

      input.focus();
      this._openPopover();
    });

    // Dispatch onLoad event to signal hydration/readiness
    this._isReady = true;
    this.dispatchEvent(new CustomEvent("onLoad", {
      bubbles: true,
      composed: true,
      detail: { instance: this }
    }));
  }

  public override addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {
    super.addEventListener(type, listener, options);
    if (type === "onLoad" && this._isReady) {
      setTimeout(() => {
        const event = new CustomEvent("onLoad", {
          bubbles: true,
          composed: true,
          detail: { instance: this },
        });
        if (typeof listener === "function") {
          listener.call(this, event);
        } else if (listener && typeof listener.handleEvent === "function") {
          listener.handleEvent(event);
        }
      }, 0);
    }
  }



  static get observedAttributes() {
    return ["options", "selected"];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "options" && oldValue !== newValue) {
      if (newValue) {
        try {
          const parsed = JSON.parse(newValue);
          this.setOptions(parsed);
        } catch (e) {
          console.error("<select-component> Invalid JSON passed to 'options' attribute", e);
        }
      } else {
        this.setOptions([]);
      }
    }

    if (name === "selected" && oldValue !== newValue) {
      const keys = newValue ? newValue.split(",").map((k) => k.trim()).filter(Boolean) : [];
      this.setSelected(keys);
    }
  }

  private _onChangeCallback: EventListener | null = null;
  
  set onchange(handler: EventListener | null) {
    if (this._onChangeCallback) this.removeEventListener("change", this._onChangeCallback);
    this._onChangeCallback = handler;
    if (handler) this.addEventListener("change", handler);
  }
  
  set onChange(handler: EventListener | null) {
    this.onchange = handler;
  }

  public setSelected(keys: string[], dispatch = true) {
    this._selectedKeys = keys;
    this._reconcileSelected();
    if (dispatch) {
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }
  }

  public getValues(): SelectOptionWithNew[] {
    return this._selected.map((item) => ({ ...item }));
  }

  public getKeys(): string[] {
    return [...this._selectedKeys];
  }

  private _reconcileSelected() {
    // 1. remove from _selected if key doesn't exist in _selectedKeys
    for (let i = this._selected.length - 1; i >= 0; i--) {
      if (!this._selectedKeys.includes(String(this._selected[i].key))) {
        this._selected.splice(i, 1);
      }
    }

    // 2. iterate over _selectedKeys, look for object in _options. If found, replace in _selected
    for (const key of this._selectedKeys) {
      const inOptions = this._options.find((opt) => String(opt.key) == key);
      if (inOptions) {
        const indexInSelected = this._selected.findIndex((sel) => String(sel.key) == key);
        const newObj: SelectOptionWithNew = { ...inOptions, new: false };
        if (indexInSelected === -1) {
          this._selected.push(newObj);
        } else {
          this._selected[indexInSelected] = newObj;
        }
      }
    }

    // 3. repack to reflect the order of elements in _selectedKeys
    const repacked: SelectOptionWithNew[] = [];
    for (const key of this._selectedKeys) {
      const found = this._selected.find((sel) => String(sel.key) === key);
      if (found) {
        repacked.push(found);
      }
    }
    this._selected = repacked;

    this._renderSelected();
  }

  private _renderSelected() {
    if (!this.shadowRoot) return;
    const flexList = this.shadowRoot.querySelector(".flex-list");
    if (!flexList) return;
    const input = flexList.querySelector("input");

    // remove all .element from the list
    const existingElements = flexList.querySelectorAll(".element");
    existingElements.forEach((el) => el.remove());

    // render them fresh
    for (const item of this._selected) {
      const option = document.createElement("div");
      option.className = "element";
      
      if (item.key === null) {
        option.dataset.key = "null";
      } else {
        option.dataset.key = String(item.key);
      }

      const label = document.createElement("label");
      label.textContent = item.label;

      const divX = document.createElement("div");
      divX.setAttribute("data-delete", "");

      option.appendChild(label);
      option.appendChild(divX);

      if (input) {
        flexList.insertBefore(option, input);
      } else {
        flexList.appendChild(option);
      }
    }
  }

  public setOptions(options: SelectOption[]) {
    if (!Array.isArray(options)) {
      throw new Error("<select-component> error: options must be an array");
    }

    const keySet = new Set();
    let nullKeyCount = 0;

    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      const dump = `Index: ${i}, Element: ${JSON.stringify(opt)}`;

      // Validate key
      if (opt.key === null) {
        nullKeyCount += 1;
        if (nullKeyCount > 1) {
          throw new Error(`<select-component> error: multiple null keys are not allowed. ${dump}`);
        }
      } else if (typeof opt.key !== "string" && typeof opt.key !== "number") {
        throw new Error(`<select-component> error: option key must be a string, number, or null. ${dump}`);
      } else {
        if (keySet.has(opt.key)) {
          throw new Error(`<select-component> error: duplicate key found: ${opt.key}. ${dump}`);
        }
        keySet.add(opt.key);
      }

      // Validate label
      if (typeof opt.label !== "string" || opt.label.trim() === "") {
        throw new Error(`<select-component> error: label must be a non-empty string. ${dump}`);
      }

      // Validate selected
      if (typeof opt.selected !== "boolean") {
        throw new Error(`<select-component> error: selected must be a present boolean. ${dump}`);
      }
    }

    this._options = options;
    this._reconcileSelected();
    this._renderOptions();
  }

  private _renderOptions() {
    if (!this.shadowRoot) return;
    
    const optionsContainer = this.shadowRoot.querySelector(".options");
    if (!optionsContainer) return;

    optionsContainer.innerHTML = "";

    for (const opt of this._options) {
      const element = document.createElement("div");
      element.classList.add("element");
      
      if (opt.selected) {
        element.classList.add("selected");
      }
      
      if (opt.key === null) {
        element.dataset.key = "";
      } else {
        element.dataset.key = String(opt.key);
      }
      
      const label = document.createElement("label");
      label.textContent = opt.label;
      
      element.appendChild(label);
      optionsContainer.appendChild(element);
    }
  }

  private _openPopover() {
    const shadow = this.shadowRoot!;
    const popoverEl = shadow.querySelector("[data-popover]") as HTMLElement;
    const options = shadow.querySelector(".options") as HTMLElement;
    const webSelectComponent = shadow.querySelector(".web-select-component") as HTMLElement;

    if (!popoverEl.matches(":popover-open")) {
      this._toggled = [...this._selected];
      
      const optionEls = options.querySelectorAll(".element");
      optionEls.forEach((el: Element) => {
        const htmlEl = el as HTMLElement;
        const strKey = htmlEl.dataset.key;
        const isSelected = this._toggled.some(t => String(t.key) === strKey);
        htmlEl.classList.toggle("selected", isSelected);
      });
    }

    (popoverEl as any).showPopover({
      source: webSelectComponent,
    });
  }
}

if (!customElements.get("select-component")) {
  customElements.define("select-component", SelectComponent);
}

export default function () {
  console.log("select.ts loaded");
}
