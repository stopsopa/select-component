import type { Item, InputChangeEvent } from "../types.js";
import createSubscriber from "../createSubscriber.js";

export type SelectedSectionManagerOptions<T extends Item> = {
  selected?: T[];
  showInput?: boolean;
  value?: string;
  renderItem?: (item: T, defaultRender: (item: T) => HTMLElement) => HTMLElement;
  renderList?: (selected: T[], defaultRender: (selected: T[]) => HTMLElement[]) => HTMLElement[];
  onDelete?: (id: string) => void;
  onClear?: () => void;
  onInputChange?: (e: InputChangeEvent, previousValue: string | undefined) => void;
  onChange?: (selected: T[]) => void;
  onFocus?: (e: FocusEvent) => void;
  label?: string;
  disabled?: boolean;
  error?: boolean;
  loading?: boolean;
  showDelete?: boolean;
  onComponentChange?: (s: SelectedSectionManagerOptions<T>, reason: string) => void;
  renderEmpty?: (defaultRender: () => string | HTMLElement) => string | HTMLElement;
};

export type SelectedSectionManagerEvents<T extends Item> = {
  onDelete: [id: string];
  onClear: [];
  onInputChange: [e: InputChangeEvent, previousValue: string | undefined];
  onChange: [selected: T[]];
  onComponentChange: [s: SelectedSectionManagerOptions<T>, reason: string];
  onFocus: [e: FocusEvent];
};

export class SelectedSectionManager<T extends Item> {
  public propParentElement: HTMLElement;
  public propContainer!: HTMLElement;
  public propFlexList!: HTMLElement;
  public propButtonsContainer!: HTMLElement;
  public propOptions: SelectedSectionManagerOptions<T>;
  public propInputElement: HTMLInputElement | null = null;
  public propClearButton!: HTMLButtonElement;
  public propLoaderElement: HTMLElement | null = null;
  public propLabelElement: HTMLLabelElement | null = null;
  private _skipNextFocusEvent = false;
  protected _subscriber = createSubscriber<SelectedSectionManagerEvents<T>>();

  constructor(parentElement: HTMLElement, options: SelectedSectionManagerOptions<T> = {}) {
    this.propParentElement = parentElement;

    const {
      selected = [],
      showInput = true,
      value = "",
      renderItem = (item, def) => def(item),
      renderList = (selected, def) => def(selected),
      onDelete = (id: string) => {},
      onClear = () => {},
      onInputChange = (e: InputChangeEvent, previousValue: string | undefined) => {},
      onChange = (selected: T[]) => {},
      onComponentChange = (s: SelectedSectionManagerOptions<T>, reason: string) => {},
      disabled = false,
      error = false,
      loading = false,
      renderEmpty = (def) => def() as HTMLElement,
      label = "",
      showDelete = true,
      ...rest
    } = options;

    this.propOptions = {
      selected,
      showInput,
      value,
      renderItem,
      renderList,
      onDelete,
      onClear,
      onInputChange,
      onChange,
      onComponentChange,
      disabled,
      error,
      loading,
      renderEmpty,
      label,
      showDelete,
      ...rest,
    };

    this.render();

    Promise.resolve().then(() => {
      this._bindEvents();
    });
  }

  public getSubscriber() {
    return this._subscriber;
  }

  protected _bindEvents() {
    this.propParentElement.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;

      // Handle Clear Button
      const clearBtn = target.closest(".clear-btn");
      if (clearBtn && this.propParentElement.contains(clearBtn)) {
        e.preventDefault();
        this.clearSearch();
        return;
      }

      // Handle Delete Item
      const delBtn = target.closest("[data-remove]");
      if (delBtn && this.propParentElement.contains(delBtn)) {
        e.preventDefault();
        const id = delBtn.getAttribute("data-remove")!;
        if (this.propOptions.onDelete) {
          this.propOptions.onDelete.call(this, id);
        }
        this._subscriber.trigger("onDelete", id);
        return;
      }
    });

    this.propParentElement.addEventListener("input", (e) => {
      const target = e.target as HTMLElement;
      if (target === this.propInputElement) {
        const previousValue = this.propOptions.value;
        this.propOptions.value = this.propInputElement!.value;
        if (this.propOptions.onInputChange) {
          this.propOptions.onInputChange.call(this, e as InputChangeEvent, previousValue);
        }
        this._subscriber.trigger("onInputChange", e as InputChangeEvent, previousValue);
      }
    });

    this.propParentElement.addEventListener("focusin", (e) => {
      const target = e.target as HTMLElement;
      if (target === this.propInputElement) {
        if (this._skipNextFocusEvent) {
          this._skipNextFocusEvent = false;
          return;
        }
        if (this.propOptions.onFocus) {
          this.propOptions.onFocus.call(this, e as FocusEvent);
        }
        this._subscriber.trigger("onFocus", e as FocusEvent);
      }
    });

    this.propParentElement.addEventListener("keydown", (e) => {
      const target = e.target as HTMLElement;
      if (target === this.propInputElement) {
        const isBackspaceOnEmpty = e.key === "Backspace" && this.propInputElement!.value === "";
        const isEnter = e.key === "Enter";

        if (isEnter || isBackspaceOnEmpty) {
          const previousValue = this.propOptions.value;
          if (this.propOptions.onInputChange) {
            this.propOptions.onInputChange.call(this, e as InputChangeEvent, previousValue);
          }
          this._subscriber.trigger("onInputChange", e as InputChangeEvent, previousValue);
        }
      }
    });
  }

  protected _triggerOnComponentChange(reason: string) {
    if (this.propOptions.onComponentChange) {
      this.propOptions.onComponentChange.call(this, this.propOptions, reason);
    }
    this._subscriber.trigger("onComponentChange", this.propOptions, reason);
  }

  protected _updateDeleteDisplay() {
    if (this.propContainer) {
      this.propContainer.classList.toggle("hide-delete", this.propOptions.showDelete === false);
    }
  }

  protected _defaultRenderList(selected: T[]) {
    return selected.map((item) => this.propOptions.renderItem!(item, this._defaultRenderItem.bind(this)));
  }

  protected _defaultRenderItem(item: T) {
    const el = document.createElement("div");
    el.className = "element";
    el.dataset.id = String(item.id);

    const label = document.createElement("label");
    label.textContent = item.label;

    const del = document.createElement("div");
    del.dataset.remove = String(item.id);

    el.appendChild(label);
    el.appendChild(del);

    return el;
  }

  setSelected(list: T[], triggerOnChange: boolean = true) {
    this.propOptions.selected = list.map((s) => {
      s.selected = true;
      return s;
    });
    this.render();
    if (triggerOnChange) {
      if (this.propOptions.onChange) {
        this.propOptions.onChange.call(this, this.getSelected());
      }
      this._subscriber.trigger("onChange", this.getSelected());
    }
    this._triggerOnComponentChange("setSelected");
  }

  setShowInput(show: boolean) {
    this.propOptions.showInput = show = String(show) === "true" || show === true;

    this.propInputElement!.style.display = show ? "" : "none";
    this.propInputElement!.disabled = Boolean(this.propOptions.disabled);

    this._triggerOnComponentChange("setShowInput");
  }

  setValue(value: string, triggerOnChange: boolean = true) {
    const previousValue = this.propOptions.value;
    this.propOptions.value = value;
    this.propInputElement!.value = value;

    if (triggerOnChange) {
      const e = new Event("input") as InputChangeEvent;
      Object.defineProperty(e, "target", { writable: false, value: this.propInputElement });
      if (this.propOptions.onInputChange) {
        this.propOptions.onInputChange.call(this, e, previousValue);
      }
      this._subscriber.trigger("onInputChange", e, previousValue);
    }
    this._triggerOnComponentChange("setValue");
  }

  public setFocus(triggerOnFocus: boolean = true) {
    if (!triggerOnFocus) {
      this._skipNextFocusEvent = true;
    }
    this.propInputElement!.focus();
  }

  clearSearch(triggerOnClear: boolean = true, triggerOnChange: boolean = true) {
    this.setValue("", triggerOnChange);
    if (triggerOnClear) {
      if (this.propOptions.onClear) {
        this.propOptions.onClear.call(this);
      }
      this._subscriber.trigger("onClear");
    }
    this._triggerOnComponentChange("onClear");
  }

  setLabel(label: string) {
    this.propOptions.label = label;
    if (label) {
      if (!this.propLabelElement) {
        this.propLabelElement = document.createElement("label");
        this.propLabelElement.className = "floating-label";
      }

      if (this.propLabelElement.parentNode !== this.propContainer) {
        this.propContainer.insertBefore(this.propLabelElement, this.propContainer.firstChild);
      }

      this.propLabelElement.textContent = label;
    } else {
      if (this.propLabelElement && this.propLabelElement.parentNode === this.propContainer) {
        this.propContainer.removeChild(this.propLabelElement);
      }
    }
    this._triggerOnComponentChange("setLabel");
  }

  setError(isError: boolean) {
    this.propOptions.error = Boolean(isError);
    this.propContainer.classList.toggle("error", isError);
    this._triggerOnComponentChange("setError");
  }

  setDisabled(disabled: boolean) {
    this.propOptions.disabled = Boolean(disabled);

    this.propInputElement!.disabled = disabled;

    this.propClearButton.disabled = disabled;

    this.propContainer.classList.toggle("disabled", disabled);

    this._triggerOnComponentChange("setDisabled");
  }

  /**
   * show/hide delete icon
   * @param show
   */
  setShowDelete(show: boolean) {
    this.propOptions.showDelete = Boolean(show);
    this._updateDeleteDisplay();
    this._triggerOnComponentChange("setShowDelete");
  }

  setLoading(loading: boolean) {
    this.propOptions.loading = Boolean(loading);
    if (loading) {
      if (!this.propLoaderElement) {
        this.propLoaderElement = document.createElement("div");
        this.propLoaderElement.className = "loader";
      }
      if (this.propClearButton.parentNode) {
        this.propButtonsContainer.replaceChild(this.propLoaderElement, this.propClearButton);
      }
    } else {
      if (this.propLoaderElement && this.propLoaderElement.parentNode) {
        this.propButtonsContainer.replaceChild(this.propClearButton, this.propLoaderElement);
      }
    }
    this._triggerOnComponentChange("setLoading");
  }

  render() {
    if (!this.propContainer) {
      this.propContainer = document.createElement("div");
      this.propContainer.className = "selected-section";

      this.propFlexList = document.createElement("div");
      this.propFlexList.className = "flex-list";

      this.propButtonsContainer = document.createElement("div");
      this.propButtonsContainer.className = "buttons-container";

      this.propClearButton = document.createElement("button");
      this.propClearButton.className = "clear-btn";
      this.propClearButton.textContent = "✕";
      this.propButtonsContainer.appendChild(this.propClearButton);

      this.propContainer.appendChild(this.propFlexList);
      this.propContainer.appendChild(this.propButtonsContainer);
      this.propParentElement.appendChild(this.propContainer);

      const input = document.createElement("input");
      input.type = "text";
      input.value = this.propOptions.value || "";
      input.placeholder = " ";
      input.size = 1;

      this.propInputElement = input;

      this.propFlexList.appendChild(this.propInputElement);
    }

    this.setLabel(this.propOptions.label || "");
    this.setShowDelete(this.propOptions.showDelete !== false);

    this.setError(Boolean(this.propOptions.error));

    this.setDisabled(Boolean(this.propOptions.disabled));

    this.setLoading(Boolean(this.propOptions.loading));

    this.setShowInput(Boolean(this.propOptions.showInput));

    const elements = this.propOptions.renderList!(this.getSelected(), this._defaultRenderList.bind(this));

    if (!Array.isArray(elements)) {
      throw new Error("renderList must return an array of HTMLElements");
    }

    // clear the list (except touching input)
    const children = Array.from(this.propFlexList.childNodes);
    for (const child of children) {
      if (child instanceof HTMLElement && child.tagName === "INPUT") {
        continue;
      }
      this.propFlexList.removeChild(child);
    }

    // rendering elements in order before input
    for (const el of elements) {
      if (!(el instanceof HTMLElement)) {
        throw new Error("each element returned from renderList must be an HTMLElement");
      }
      if (this.propInputElement && this.propInputElement.parentNode === this.propFlexList) {
        this.propFlexList.insertBefore(el, this.propInputElement);
      } else {
        this.propFlexList.appendChild(el);
      }
    }
  }
  public setRenderItem(renderItem?: (item: T, defaultRender: (item: T) => HTMLElement) => HTMLElement) {
    this.propOptions.renderItem = renderItem || ((item, def) => def(item));
    this.render();
    this._triggerOnComponentChange("setRenderItem");
  }

  public setRenderList(renderList?: (selected: T[], defaultRender: (selected: T[]) => HTMLElement[]) => HTMLElement[]) {
    this.propOptions.renderList = renderList || ((selected, def) => def(selected));
    this.render();
    this._triggerOnComponentChange("setRenderList");
  }

  public setRenderEmpty(renderEmpty?: (defaultRender: () => string | HTMLElement) => string | HTMLElement) {
    this.propOptions.renderEmpty = renderEmpty || ((def) => def() as HTMLElement);
    this.render();
    this._triggerOnComponentChange("setRenderEmpty");
  }

  // getters
  public getSelected() {
    return this.propOptions.selected || [];
  }
  public getShowInput() {
    return this.propOptions.showInput;
  }
  public getValue() {
    return this.propOptions.value;
  }
  public getLabel() {
    return this.propOptions.label;
  }
  public getDisabled() {
    return this.propOptions.disabled;
  }
  public getError() {
    return this.propOptions.error;
  }
  public getLoading() {
    return this.propOptions.loading;
  }
  public getShowDelete() {
    return this.propOptions.showDelete;
  }

  public destroy() {
    this._subscriber.destroy();
  }
}
