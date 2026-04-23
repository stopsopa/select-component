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
  onItemClick?: (item: T) => void;
  onInputChange?: (e: Event) => void;
  onCancel?: () => void;
  onOk?: () => void;
  disabled?: boolean;
  maxHeight?: string;
  showFooter?: boolean;
  showFilter?: boolean;
  renderEmpty?: () => string | HTMLElement;
  renderItem?: (item: T) => string | HTMLElement;
  renderList?: (list: T[]) => (string | HTMLElement)[];
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
      renderItem: (item: T) => {
        const el = document.createElement("div");
        el.className = "element";
        if (item.selected) el.classList.add("selected");
        el.dataset.id = String(item.id);

        const label = document.createElement("label");
        label.textContent = item.label;
        el.appendChild(label);

        return el;
      },
      renderList: function (list: T[]) {
        return list.map((item) => this.renderItem!(item));
      },
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

  public setRenderEmpty(renderEmpty: () => string | HTMLElement) {
    this.propOptions.renderEmpty = renderEmpty;
    this._updateOptionsDisplay();
  }

  public setRenderItem(renderItem: (item: T) => string | HTMLElement) {
    this.propOptions.renderItem = renderItem;
    this._updateOptionsDisplay();
  }

  public setRenderList(renderList: (list: T[]) => (string | HTMLElement)[]) {
    this.propOptions.renderList = renderList;
    this._updateOptionsDisplay();
  }

  public setFocus() {
    if (this.propInputElement) {
      this.propInputElement.focus();
    }
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

      this.propInputElement.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || (e.key === "Backspace" && this.propInputElement!.value === "")) {
          if (this.propOptions.onInputChange) {
            this.propOptions.onInputChange(e);
          }
        }
      });
    }

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
        if (item && this.propOptions.onItemClick) {
          this.propOptions.onItemClick(item);
        }
      }
    });
  }

  private _updateOptionsDisplay() {
    const container = this.propOptionsContainer;
    if (!container) return;

    const options = this.propOptions.options || [];

    if (options.length === 0) {
      if (this.propOptions.renderEmpty) {
        const result = this.propOptions.renderEmpty();
        if (typeof result === "string") {
          container.innerHTML = result;
        } else {
          container.innerHTML = "";
          container.appendChild(result);
        }
      } else {
        container.innerHTML = `<div class="empty-msg">No options to display</div>`;
      }
      return;
    }

    container.innerHTML = "";
    const renderedItems = this.propOptions.renderList!.call(this.propOptions, options);
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
