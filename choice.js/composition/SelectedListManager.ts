export type ListElement = {
  id: number | string;
  label: string;
  [key: string]: any;
};

export type SelectedListManagerOptions<T extends ListElement> = {
  list?: T[];
  showInput?: boolean;
  value?: string;
  inputFieldRender?: (value: string) => HTMLInputElement;
  renderItem?: (item: T) => HTMLElement;
  renderList?: (list: T[]) => HTMLElement[];
  onDelete?: (id: string) => void;
  onClear?: () => void;
  onChange?: (e: Event) => void;
  label?: string;
  disabled?: boolean;
  error?: boolean;
};

export class SelectedListManager<T extends ListElement> {
  public propParentElement: HTMLElement;
  public propContainer!: HTMLElement;
  public propFlexList!: HTMLElement;
  public propButtonsContainer!: HTMLElement;
  public propOptions: SelectedListManagerOptions<T>;
  public propList: T[];
  public propInputElement: HTMLInputElement | null = null;
  public propClearButton!: HTMLButtonElement;
  public propLabelElement: HTMLLabelElement | null = null;

  constructor(parentElement: HTMLElement, options: SelectedListManagerOptions<T> = {}) {
    this.propParentElement = parentElement;

    this.propOptions = {
      list: [],
      showInput: true,
      value: "",
      inputFieldRender: (value: string) => {
        const input = document.createElement("input");
        input.type = "text";
        input.value = value;
        input.placeholder = " ";
        input.size = 1;
        return input;
      },
      renderItem: (item: T) => {
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
      },
      renderList: (list: T[]) => {
        return list.map((item) => this.propOptions.renderItem!(item));
      },
      onDelete: (id: string) => {},
      onClear: () => {},
      onChange: (e: Event) => {},
      disabled: false,
      error: false,
      label: "",
      ...options,
    };

    this.propList = this.propOptions.list || [];

    this._bindEvents();

    this.render();
  }

  private _bindEvents() {
    this.propParentElement.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;

      // Handle Clear Button
      const clearBtn = target.closest(".clear-btn");
      if (clearBtn && this.propParentElement.contains(clearBtn)) {
        e.preventDefault();
        this.propOptions.onClear!();
        return;
      }

      // Handle Delete Item
      const delBtn = target.closest("[data-remove]");
      if (delBtn && this.propParentElement.contains(delBtn)) {
        const id = delBtn.getAttribute("data-remove");
        if (id) {
          this.propOptions.onDelete!(id);
        }
        return;
      }

      // Handle Focus Input
      const container = target.closest(".selected-list");
      if (container && this.propParentElement.contains(container)) {
        if (target.closest(".buttons-container")) {
          return;
        }
        if (this.propInputElement && target !== this.propInputElement) {
          this.propInputElement.focus();
        }
      }
    });

    this.propParentElement.addEventListener("input", (e) => {
      const target = e.target as HTMLElement;
      if (target === this.propInputElement) {
        this.propOptions.onChange!(e);
      }
    });

    this.propParentElement.addEventListener("keydown", (e) => {
      const target = e.target as HTMLElement;
      if (target === this.propInputElement && (e.key === "Backspace" || e.key === "Enter")) {
        this.propOptions.onChange!(e);
      }
    });
  }

  updateList(list: T[]) {
    this.propList = list;
    this.render();
  }

  setShowInput(show: boolean) {
    if ((this.propOptions.showInput = show)) {
      if (!this.propInputElement) {
        this.propInputElement = this.propOptions.inputFieldRender!(this.propOptions.value || "");
      }

      if (this.propOptions.disabled) {
        this.propInputElement.disabled = true;
      }

      if (this.propInputElement.parentNode !== this.propFlexList) {
        this.propFlexList.appendChild(this.propInputElement);
      }

      if (!this.propLabelElement) {
        this.propLabelElement = document.createElement("label");
        this.propLabelElement.className = "floating-label";
      }

      if (this.propLabelElement.parentNode !== this.propContainer) {
        this.propContainer.insertBefore(this.propLabelElement, this.propContainer.firstChild);
      }

      if (this.propOptions.label) {
        this.propLabelElement.textContent = this.propOptions.label;
      } else if (this.propLabelElement && this.propLabelElement.parentNode === this.propContainer) {
        this.propContainer.removeChild(this.propLabelElement);
      }
    } else {
      if (this.propInputElement && this.propInputElement.parentNode === this.propFlexList) {
        this.propFlexList.removeChild(this.propInputElement);
      }
      if (this.propLabelElement && this.propLabelElement.parentNode === this.propContainer) {
        this.propContainer.removeChild(this.propLabelElement);
      }
    }
  }

  setValue(value: string) {
    this.propOptions.value = value;
    if (this.propInputElement) {
      this.propInputElement.value = value;
    }
  }

  setLabel(label: string) {
    this.propOptions.label = label;
    if (this.propLabelElement) {
      this.propLabelElement.textContent = label;
    } else if (label) {
      this.propLabelElement = document.createElement("label");
      this.propLabelElement.className = "floating-label";
      this.propLabelElement.textContent = label;
      this.propContainer.insertBefore(this.propLabelElement, this.propContainer.firstChild);
    }
  }

  setErrorState(isError: boolean) {
    this.propContainer.classList.toggle("error", isError);
  }

  setDisabled(disabled: boolean) {
    this.propOptions.disabled = disabled;

    if (this.propInputElement) {
      this.propInputElement.disabled = disabled;
    }

    this.propClearButton.disabled = disabled;

    this.propContainer.classList.toggle("disabled", disabled);
  }

  render() {
    if (!this.propContainer) {
      this.propContainer = document.createElement("div");
      this.propContainer.className = "selected-list";

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
    }

    this.setErrorState(Boolean(this.propOptions.error));

    this.setDisabled(Boolean(this.propOptions.disabled));

    this.setShowInput(Boolean(this.propOptions.showInput));

    const elements = this.propOptions.renderList!(this.propList);

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
}
