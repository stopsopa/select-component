class OptionListManager {
  propOptions;
  propParentElement;
  propFilterContainer;
  propOptionsContainer;
  propFooterContainer;
  propInputElement = null;
  propSpinnerElement = null;
  propLabelElement = null;
  propOkButton;
  propCancelButton;
  propHighlightedId = null;
  constructor(bindElement, options = {}) {
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
      ...options
    };
    if (this.propOptions.maxHeight) {
      this.setMaxHeight(this.propOptions.maxHeight);
    }
    this.render();
  }
  setMaxHeight(maxHeight) {
    this.propOptions.maxHeight = maxHeight || "";
    if (this.propParentElement) {
      this.propParentElement.style.maxHeight = maxHeight || "none";
    }
  }
  setDisabled(disabled) {
    this.propOptions.disabled = disabled;
    this._updateDisabledDisplay();
  }
  showFooter(show) {
    this.propOptions.showFooter = show;
    this._updateFooterDisplay();
  }
  showFilter(show) {
    this.propOptions.showFilter = show;
    this._updateFilterDisplay();
  }
  setOptions(options) {
    this.propOptions.options = options;
    this._updateOptionsDisplay();
  }
  setLoading(loading) {
    this.propOptions.loading = loading;
    this._updateLoadingDisplay();
  }
  setValue(value) {
    this.propOptions.value = value;
    if (this.propInputElement) {
      this.propInputElement.value = value;
    }
  }
  setLabel(label) {
    this.propOptions.label = label;
    if (this.propLabelElement) {
      this.propLabelElement.textContent = label || "";
    }
  }
  itemPick(id) {
    this.propHighlightedId = id ?? null;
    this._updateOptionsDisplay();
    if (this.propHighlightedId !== null) {
      this._scrollToHighlighted();
    }
  }
  pickHighlighted() {
    if (this.propHighlightedId === null) return;
    const item = this.propOptions.options?.find((opt) => String(opt.id) === String(this.propHighlightedId));
    if (item && this.propOptions.onItemPick) {
      this.propOptions.onItemPick(item);
    }
  }
  _scrollToHighlighted() {
    if (this.propHighlightedId === null) return;
    const el = this.propOptionsContainer.querySelector(`.element[data-id="${this.propHighlightedId}"]`);
    if (el) {
      el.scrollIntoView({ block: "nearest" });
    }
  }
  setRenderEmpty(renderEmpty) {
    this.propOptions.renderEmpty = renderEmpty || ((def) => def());
    this._updateOptionsDisplay();
  }
  setRenderItem(renderItem) {
    this.propOptions.renderItem = renderItem || ((item, def) => def(item));
    this._updateOptionsDisplay();
  }
  setRenderList(renderList) {
    this.propOptions.renderList = renderList || ((list, def) => def(list));
    this._updateOptionsDisplay();
  }
  _defaultRenderEmpty() {
    return `<div class="empty-msg">No options to display</div>`;
  }
  _defaultRenderItem(item) {
    const el = document.createElement("div");
    el.className = "element";
    if (item.selected) el.classList.add("selected");
    el.dataset.id = String(item.id);
    const label = document.createElement("label");
    label.textContent = item.label;
    el.appendChild(label);
    return el;
  }
  _defaultRenderList(list) {
    return list.map((item) => this.propOptions.renderItem(item, this._defaultRenderItem.bind(this)));
  }
  setFocus() {
    if (this.propInputElement) {
      this.propInputElement.focus();
    }
  }
  render() {
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
  _bindEvents() {
    if (this.propInputElement) {
      this.propInputElement.addEventListener("input", (e) => {
        this.propOptions.value = this.propInputElement.value;
        if (this.propOptions.onInputChange) {
          this.propOptions.onInputChange(e);
        }
      });
      this.propInputElement.addEventListener("keydown", (e) => {
        const options = this.propOptions.options || [];
        const currentIndex = options.findIndex((item) => String(item.id) === String(this.propHighlightedId));
        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (currentIndex === -1) {
            this.itemPick(options[0]?.id);
          } else if (currentIndex < options.length - 1) {
            this.itemPick(options[currentIndex + 1].id);
          }
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (currentIndex === -1) {
            this.itemPick(options[options.length - 1]?.id);
          } else if (currentIndex > 0) {
            this.itemPick(options[currentIndex - 1].id);
          }
        } else if (e.key === "Enter") {
          if (this.propHighlightedId !== null) {
            e.preventDefault();
            this.pickHighlighted();
          } else if (this.propInputElement.value === "") {
            if (this.propOptions.onInputChange) {
              this.propOptions.onInputChange(e);
            }
          }
        } else if (e.key === "Escape") {
          e.preventDefault();
          this.itemPick(null);
        } else if (e.key === "Backspace" && this.propInputElement.value === "") {
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
      const target = e.target;
      const element = target.closest(".element");
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
  _updateOptionsDisplay() {
    const container = this.propOptionsContainer;
    if (!container) return;
    const options = this.propOptions.options || [];
    if (options.length === 0) {
      const result = this.propOptions.renderEmpty(this._defaultRenderEmpty.bind(this));
      if (typeof result === "string") {
        container.innerHTML = result;
      } else {
        container.innerHTML = "";
        container.appendChild(result);
      }
      return;
    }
    container.innerHTML = "";
    const renderedItems = this.propOptions.renderList(options, this._defaultRenderList.bind(this));
    renderedItems.forEach((item, index) => {
      const dataItem = options[index];
      let el = null;
      if (typeof item === "string") {
        const temp = document.createElement("div");
        temp.innerHTML = item;
        el = temp.firstElementChild;
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
  _updateLoadingDisplay() {
    if (this.propSpinnerElement) {
      this.propSpinnerElement.classList.toggle("loading", !!this.propOptions.loading);
    }
  }
  _updateDisabledDisplay() {
    if (this.propOptionsContainer) {
      this.propOptionsContainer.classList.toggle("disabled", !!this.propOptions.disabled);
    }
  }
  _updateFooterDisplay() {
    if (this.propFooterContainer) {
      this.propFooterContainer.style.display = this.propOptions.showFooter !== false ? "flex" : "none";
    }
  }
  _updateFilterDisplay() {
    if (this.propFilterContainer) {
      this.propFilterContainer.style.display = this.propOptions.showFilter !== false ? "flex" : "none";
    }
  }
}
export {
  OptionListManager
};
