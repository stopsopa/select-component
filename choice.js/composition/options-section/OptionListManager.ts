export type ListElement = {
  id: number | string;
  label: string;
  selected?: boolean;
  [key: string]: any;
};

export type OptionListManagerOptions<T extends ListElement> = {
  options?: T[];
  loading?: boolean;
  value?: string;
  label?: string;
  onItemPick?: (item: T) => void;
  onInputChange?: (e: Event) => void;
  onCancel?: () => void;
  onOk?: () => void;
  onHighlightChange?: (id: string | number | null) => void;
  disabled?: boolean;
  maxHeight?: string;
  showFooter?: boolean;
  showFilter?: boolean;
  renderEmpty?: (defaultRender: () => string | HTMLElement) => string | HTMLElement;
  renderItem?: (item: T, defaultRender: (item: T) => string | HTMLElement) => string | HTMLElement;
  renderList?: (list: T[], defaultRender: (list: T[]) => (string | HTMLElement)[]) => (string | HTMLElement)[];
};


export class OptionListManager<T extends ListElement = ListElement> {
  public propOptions: OptionListManagerOptions<T>;
  public propParentElement!: HTMLElement;
  public propFilterContainer!: HTMLElement;
  public propOptionsContainer!: HTMLElement;
  public propFooterContainer!: HTMLElement;
  public propInputElement: HTMLInputElement | null = null;
  public propSpinnerElement: HTMLElement | null = null;
  public propLabelElement: HTMLLabelElement | null = null;
  public propOkButton!: HTMLButtonElement;
  public propCancelButton!: HTMLButtonElement;
  public propHighlightedId: string | number | null = null;
  private _attachedElements = new Map<any, (e: KeyboardEvent) => void>();

  constructor(bindElement: HTMLElement, options: OptionListManagerOptions<T> = {}) {
    this.propParentElement = bindElement;
    this.propParentElement.classList.add("option-list-manager");
    this.propOptions = {
      options: [],
      loading: false,
      disabled: false,
      value: "",
      showFooter: true,
      showFilter: true,
      renderItem: (item, def) => def(item),
      renderList: (list, def) => def(list),
      renderEmpty: (def) => def(),
      ...options,
    };

    if (this.propOptions.maxHeight) {
      this.setMaxHeight(this.propOptions.maxHeight);
    }

    this.render();
  }

  public setMaxHeight(maxHeight?: string) {
    this.propOptions.maxHeight = maxHeight || "";
    if (this.propParentElement) {
      this.propParentElement.style.maxHeight = maxHeight || "none";
    }
  }

  public setDisabled(disabled: boolean) {
    this.propOptions.disabled = disabled;
    this._updateDisabledDisplay();
  }

  public showFooter(show: boolean) {
    this.propOptions.showFooter = show;
    this._updateFooterDisplay();
  }

  public showFilter(show: boolean) {
    this.propOptions.showFilter = show;
    this._updateFilterDisplay();
  }

  public setOptions(options: T[]) {
    this.propOptions.options = options;
    this._updateOptionsDisplay();
  }

  public setLoading(loading: boolean) {
    this.propOptions.loading = loading;
    this._updateLoadingDisplay();
  }

  public setValue(value: string) {
    this.propOptions.value = value;
    if (this.propInputElement) {
      this.propInputElement.value = value;
    }
  }

  public setLabel(label: string) {
    this.propOptions.label = label;
    if (this.propLabelElement) {
      this.propLabelElement.textContent = label || "";
    }
  }

  public itemPick(id?: string | number | null) {
    this.propHighlightedId = id ?? null;
    this._updateOptionsDisplay();
    if (this.propHighlightedId !== null) {
      this._scrollToHighlighted();
    }
    if (this.propOptions.onHighlightChange) {
      this.propOptions.onHighlightChange(this.propHighlightedId);
    }
  }

  public pickHighlighted() {
    if (this.propHighlightedId === null) return;
    const item = this.propOptions.options?.find((opt) => String(opt.id) === String(this.propHighlightedId));
    if (item && this.propOptions.onItemPick) {
      this.propOptions.onItemPick(item);
    }
  }

  private _scrollToHighlighted() {
    if (this.propHighlightedId === null) return;
    const el = this.propOptionsContainer.querySelector(`.element[data-id="${this.propHighlightedId}"]`) as HTMLElement;
    if (el) {
      el.scrollIntoView({ block: "nearest" });
    }
  }

  public setRenderEmpty(renderEmpty?: (defaultRender: () => string | HTMLElement) => string | HTMLElement) {
    this.propOptions.renderEmpty = renderEmpty || ((def) => def());
    this._updateOptionsDisplay();
  }

  public setRenderItem(renderItem?: (item: T, defaultRender: (item: T) => string | HTMLElement) => string | HTMLElement) {
    this.propOptions.renderItem = renderItem || ((item, def) => def(item));
    this._updateOptionsDisplay();
  }

  public setRenderList(renderList?: (list: T[], defaultRender: (list: T[]) => (string | HTMLElement)[]) => (string | HTMLElement)[]) {
    this.propOptions.renderList = renderList || ((list, def) => def(list));
    this._updateOptionsDisplay();
  }

  private _defaultRenderEmpty() {
    return `<div class="empty-msg">No options to display</div>`;
  }

  private _defaultRenderItem(item: T) {
    const el = document.createElement("div");
    el.className = "element";
    if (item.selected) el.classList.add("selected");
    el.dataset.id = String(item.id);

    const label = document.createElement("label");
    label.textContent = item.label;
    el.appendChild(label);

    return el;
  }

  private _defaultRenderList(list: T[]) {
    return list.map((item) => this.propOptions.renderItem!(item, this._defaultRenderItem.bind(this)));
  }

  public setFocus() {
    if (this.propInputElement) {
      this.propInputElement.focus();
    }
  }

  public attachArrowsUpAndDown(element: any) {
    if (this._attachedElements.has(element)) {
      return;
    }
    const listener = (e: KeyboardEvent) => this._handleKeyDown(e);
    this._attachedElements.set(element, listener);
    element.addEventListener("keydown", listener);
  }

  public detachArrowsUpAndDown(element: any) {
    const listener = this._attachedElements.get(element);
    if (listener) {
      element.removeEventListener("keydown", listener);
      this._attachedElements.delete(element);
    }
  }

  public destroy() {
    // This is the trick: we track all elements we've attached to and detach them here.
    // This is especially important for the 'window' object which persists.
    for (const [element] of this._attachedElements) {
      this.detachArrowsUpAndDown(element);
    }
    this._attachedElements.clear();
  }

  public render() {
    if (!this.propFilterContainer) {
      this.propFilterContainer = document.createElement("div");
      this.propFilterContainer.className = "filter";

      const inputWrapper = document.createElement("div");
      inputWrapper.className = "input-wrapper";

      this.propInputElement = document.createElement("input");
      this.propInputElement.type = "text";
      this.propInputElement.id = "search-input-" + Math.random().toString(36).substr(2, 9);
      this.propInputElement.placeholder = " ";
      this.propInputElement.autocomplete = "off";

      this.propLabelElement = document.createElement("label");
      this.propLabelElement.setAttribute("for", this.propInputElement.id);
      this.propLabelElement.textContent = this.propOptions.label || "Search...";

      inputWrapper.appendChild(this.propInputElement);
      inputWrapper.appendChild(this.propLabelElement);

      this.propSpinnerElement = document.createElement("div");
      this.propSpinnerElement.className = "spinner";
      inputWrapper.appendChild(this.propSpinnerElement);

      this.propFilterContainer.appendChild(inputWrapper);

      this.propOptionsContainer = document.createElement("div");
      this.propOptionsContainer.className = "options";
      this.propOptionsContainer.tabIndex = 0;

      this.propFooterContainer = document.createElement("div");
      this.propFooterContainer.className = "footer";

      this.propCancelButton = document.createElement("button");
      this.propCancelButton.type = "button";
      this.propCancelButton.dataset.role = "cancel";
      this.propCancelButton.className = "gcp-css white";
      this.propCancelButton.textContent = "Cancel";

      this.propOkButton = document.createElement("button");
      this.propOkButton.type = "button";
      this.propOkButton.dataset.role = "ok";
      this.propOkButton.className = "gcp-css";
      this.propOkButton.textContent = "OK";

      this.propFooterContainer.appendChild(this.propCancelButton);
      this.propFooterContainer.appendChild(this.propOkButton);

      this.propParentElement.appendChild(this.propFilterContainer);
      this.propParentElement.appendChild(this.propOptionsContainer);
      this.propParentElement.appendChild(this.propFooterContainer);

      this._bindEvents();
    }

    this._updateOptionsDisplay();
    this._updateLoadingDisplay();
    this._updateDisabledDisplay();
    this._updateFooterDisplay();
    this._updateFilterDisplay();
    this.setValue(this.propOptions.value || "");
  }

  private _bindEvents() {
    if (this.propInputElement) {
      this.propInputElement.addEventListener("input", (e) => {
        this.propOptions.value = this.propInputElement!.value;
        if (this.propOptions.onInputChange) {
          this.propOptions.onInputChange(e);
        }
      });

      this.attachArrowsUpAndDown(this.propInputElement);
    }

    this.attachArrowsUpAndDown(this.propOptionsContainer);

    this.propOkButton.addEventListener("click", () => {
      if (this.propOptions.onOk) {
        this.propOptions.onOk();
      }
    });

    this.propCancelButton.addEventListener("click", () => {
      if (this.propOptions.onCancel) {
        this.propOptions.onCancel();
      }
    });

    this.propOptionsContainer.addEventListener("click", (e) => {
      if (this.propOptions.disabled) return;
      const target = e.target as HTMLElement;
      const element = target.closest(".element") as HTMLElement;
      if (element) {
        const id = element.dataset.id;
        const item = this.propOptions.options?.find((opt) => String(opt.id) === id);
        if (item && this.propOptions.onItemPick) {
          this.itemPick(item.id);
          this.propOptions.onItemPick(item);
          this.setFocus();
        }
      }
    });
  }

  private _handleKeyDown(e: KeyboardEvent) {
    const options = this.propOptions.options || [];
    const currentIndex = options.findIndex((item) => String(item.id) === String(this.propHighlightedId));

    if (e.key === "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
      if (currentIndex === -1) {
        this.itemPick(options[0]?.id);
      } else if (currentIndex < options.length - 1) {
        this.itemPick(options[currentIndex + 1].id);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      if (currentIndex === -1) {
        this.itemPick(options[options.length - 1]?.id);
      } else if (currentIndex > 0) {
        this.itemPick(options[currentIndex - 1].id);
      }
    } else if (e.key === "Enter") {
      if (this.propHighlightedId !== null) {
        e.preventDefault();
        e.stopPropagation();
        this.pickHighlighted();
      } else if (this.propInputElement && this.propInputElement.value === "") {
        if (this.propOptions.onInputChange) {
          e.stopPropagation();
          this.propOptions.onInputChange(e);
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      this.itemPick(null);
    } else if (e.key === "Backspace" && this.propInputElement && this.propInputElement.value === "") {
      if (this.propOptions.onInputChange) {
        e.stopPropagation();
        this.propOptions.onInputChange(e);
      }
    }
  }

  private _updateOptionsDisplay() {
    const container = this.propOptionsContainer;
    if (!container) return;

    const options = this.propOptions.options || [];

    if (options.length === 0) {
      const result = this.propOptions.renderEmpty!(this._defaultRenderEmpty.bind(this));
      if (typeof result === "string") {
        container.innerHTML = result;
      } else {
        container.innerHTML = "";
        container.appendChild(result);
      }
      return;
    }

    container.innerHTML = "";
    const renderedItems = this.propOptions.renderList!(options, this._defaultRenderList.bind(this));
    renderedItems.forEach((item, index) => {
      const dataItem = options[index];
      let el: HTMLElement | null = null;

      if (typeof item === "string") {
        const temp = document.createElement("div");
        temp.innerHTML = item;
        el = temp.firstElementChild as HTMLElement;
      } else {
        el = item;
      }

      if (el) {
        el.classList.add("element");
        el.dataset.id = String(dataItem.id);
        if (dataItem.selected) {
          el.classList.add("selected");
        } else {
          el.classList.remove("selected");
        }

        if (this.propHighlightedId !== null && String(dataItem.id) === String(this.propHighlightedId)) {
          el.classList.add("highlighted");
        } else {
          el.classList.remove("highlighted");
        }

        container.appendChild(el);
      }
    });
  }

  private _updateLoadingDisplay() {
    if (this.propSpinnerElement) {
      this.propSpinnerElement.classList.toggle("loading", !!this.propOptions.loading);
    }
  }

  private _updateDisabledDisplay() {
    if (this.propOptionsContainer) {
      this.propOptionsContainer.classList.toggle("disabled", !!this.propOptions.disabled);
    }
  }

  private _updateFooterDisplay() {
    if (this.propFooterContainer) {
      this.propFooterContainer.style.display = this.propOptions.showFooter !== false ? "flex" : "none";
    }
  }

  private _updateFilterDisplay() {
    if (this.propFilterContainer) {
      this.propFilterContainer.style.display = this.propOptions.showFilter !== false ? "flex" : "none";
    }
  }
}
