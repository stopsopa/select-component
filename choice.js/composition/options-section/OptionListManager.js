class OptionListManager {
  propParentElement;
  propOptions;
  propContainer;
  propFilterContainer;
  propOptionsContainer;
  propFooterContainer;
  propInputElement = null;
  propSpinnerElement = null;
  propLabelElement = null;
  propOkButton;
  propCancelButton;
  constructor(parentElement, options = {}) {
    this.propParentElement = parentElement;
    this.propOptions = {
      options: [],
      loading: false,
      disabled: false,
      value: "",
      ...options
    };
    this.render();
  }
  setDisabled(disabled) {
    this.propOptions.disabled = disabled;
    this._updateDisabledDisplay();
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
  setFocus() {
    if (this.propInputElement) {
      this.propInputElement.focus();
    }
  }
  render() {
    if (!this.propContainer) {
      this.propContainer = document.createElement("div");
      this.propContainer.className = "option-list-manager";
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
      this.propCancelButton.className = "gcp-css white";
      this.propCancelButton.textContent = "Cancel";
      this.propOkButton = document.createElement("button");
      this.propOkButton.type = "button";
      this.propOkButton.className = "gcp-css";
      this.propOkButton.textContent = "OK";
      this.propFooterContainer.appendChild(this.propCancelButton);
      this.propFooterContainer.appendChild(this.propOkButton);
      this.propContainer.appendChild(this.propFilterContainer);
      this.propContainer.appendChild(this.propOptionsContainer);
      this.propContainer.appendChild(this.propFooterContainer);
      this.propParentElement.appendChild(this.propContainer);
      this._bindEvents();
    }
    this._updateOptionsDisplay();
    this._updateLoadingDisplay();
    this._updateDisabledDisplay();
    this.setValue(this.propOptions.value || "");
  }
  _bindEvents() {
    if (this.propInputElement) {
      this.propInputElement.addEventListener("input", () => {
        this.propOptions.value = this.propInputElement.value;
        if (this.propOptions.onChange) {
          this.propOptions.onChange(this.propOptions.value);
        }
      });
      this.propInputElement.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === "Backspace" && this.propInputElement.value === "") {
          if (this.propOptions.onChange) {
            this.propOptions.onChange(this.propInputElement.value);
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
        if (item && this.propOptions.onItemClick) {
          this.propOptions.onItemClick(item);
        }
      }
    });
  }
  _updateOptionsDisplay() {
    const container = this.propOptionsContainer;
    if (!container) return;
    const options = this.propOptions.options || [];
    if (options.length === 0) {
      container.innerHTML = `<div class="empty-msg">No options to display</div>`;
      return;
    }
    container.innerHTML = "";
    options.forEach((item) => {
      const el = document.createElement("div");
      el.className = "element";
      if (item.selected) el.classList.add("selected");
      el.dataset.id = String(item.id);
      const label = document.createElement("label");
      label.textContent = item.label;
      el.appendChild(label);
      container.appendChild(el);
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
}
export {
  OptionListManager
};
