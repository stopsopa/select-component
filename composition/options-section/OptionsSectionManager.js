import { markSearchWithSpan } from "../composite-select/helpers.js";
import createSubscriber from "../createSubscriber.js";
export class OptionsSectionManager {
  propOptions;
  propParentElement;
  propFilterContainer;
  propOptionsContainer;
  propFooterContainer;
  propInputElement = null;
  propSpinnerElement = null;
  propLabelElement = null;
  propOkButton;
  propLeftSpace;
  propCancelButton;
  propClearButton;
  propHighlightedId = null;
  _skipNextFocusEvent = false;
  _attachedElements = new Map();
  _subscriber = createSubscriber();
  constructor(bindElement, options = {}) {
    this.propParentElement = bindElement;
    this.propParentElement.classList.add("options-section-manager");
    const {
      options: opt = [],
      loading = false,
      disabled = false,
      value = "",
      showFooter = true,
      showFilter = true,
      renderItem = (item, def, searchValue) => def(item, searchValue),
      renderList = (list, def) => def(list),
      renderEmpty = (def) => def(),
      onClear = () => {},
      ...rest
    } = options;
    this.propOptions = {
      options: opt,
      loading,
      disabled,
      value,
      showFooter,
      showFilter,
      renderItem,
      renderList,
      renderEmpty,
      onClear,
      ...rest,
    };
    this.render();
    Promise.resolve().then(() => {
      if (this.propOptions.maxHeight) {
        this.setMaxHeight(this.propOptions.maxHeight);
      }
      this._bindEvents();
    });
  }
  getSubscriber() {
    return this._subscriber;
  }
  _triggerOnComponentChange(reason) {
    if (this.propOptions.onComponentChange) {
      this.propOptions.onComponentChange.call(this, this.propOptions, reason);
    }
    this._subscriber.trigger("onComponentChange", this.propOptions, reason);
  }
  _scrollToHighlighted() {
    if (this.propHighlightedId === null) return;
    const el = this.propOptionsContainer.querySelector(`.element[data-id="${this.propHighlightedId}"]`);
    if (el) {
      el.scrollIntoView({ block: "nearest" });
    }
  }
  _defaultRenderEmpty() {
    return `<div class="empty-msg">No options to display</div>`;
  }
  _defaultRenderItem(item, searchValue) {
    const el = document.createElement("div");
    el.className = "element";
    el.classList.toggle("selected", item.selected === true);
    el.dataset.id = String(item.id);
    const label = document.createElement("label");
    label.innerHTML = markSearchWithSpan(item.label, searchValue || "");
    el.appendChild(label);
    return el;
  }
  _defaultRenderList(list) {
    return list.map((item) =>
      this.propOptions.renderItem(item, this._defaultRenderItem.bind(this), this.propOptions.value),
    );
  }
  _bindEvents() {
    if (this.propInputElement) {
      this.propInputElement.addEventListener("input", (e) => {
        const previousValue = this.propOptions.value;
        this.propOptions.value = this.propInputElement.value;
        this._triggerOnInputChange(e, previousValue, "input");
      });
      this.propInputElement.addEventListener("focus", (e) => {
        if (this._skipNextFocusEvent) {
          this._skipNextFocusEvent = false;
          return;
        }
        if (this.propOptions.onFocus) {
          this.propOptions.onFocus.call(this, e);
        }
        this._subscriber.trigger("onFocus", e);
        this.attachArrowsUpAndDown();
      });
      this.propInputElement.addEventListener("blur", () => {
        this.detachArrowsUpAndDown();
      });
    }
    this.propClearButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.clearSearch();
    });
    this.propOkButton.addEventListener("click", () => {
      if (this.propOptions.onOk) {
        this.propOptions.onOk.call(this);
      }
      this._subscriber.trigger("onOk");
    });
    this.propCancelButton.addEventListener("click", () => {
      if (this.propOptions.onCancel) {
        this.propOptions.onCancel.call(this);
      }
      this._subscriber.trigger("onCancel");
    });
    this.propOptionsContainer.addEventListener("click", (e) => {
      if (this.propOptions.disabled) return;
      const target = e.target;
      const element = target.closest(".element");
      if (element) {
        const id = element.dataset.id;
        const item = this.propOptions.options?.find((opt) => String(opt.id) === id);
        if (item) {
          this.setFocus();
          this.highlightAndScrollToElementOnTheList(item.id);
          this._triggerOnItemPick(item);
        }
      }
    });
  }
  _handleKeyDown(e) {
    const options = this.propOptions.options || [];
    const currentIndex = options.findIndex((item) => String(item.id) === String(this.propHighlightedId));
    if (e.key === "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
      if (currentIndex === -1) {
        this.highlightAndScrollToElementOnTheList(options[0]?.id);
      } else if (currentIndex < options.length - 1) {
        this.highlightAndScrollToElementOnTheList(options[currentIndex + 1].id);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      if (currentIndex === -1) {
        this.highlightAndScrollToElementOnTheList(options[options.length - 1]?.id);
      } else if (currentIndex > 0) {
        this.highlightAndScrollToElementOnTheList(options[currentIndex - 1].id);
      }
    } else if (e.key === "Enter") {
      if (this.propHighlightedId !== null) {
        e.preventDefault();
        e.stopPropagation();
        this.pickHighlighted();
      } else if (this.propInputElement.value === "") {
        e.stopPropagation();
        this._triggerOnInputChange(e, this.propOptions.value, "enter");
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      this.highlightAndScrollToElementOnTheList(null);
    } else if (e.key === "Backspace" && this.propInputElement.value === "") {
      e.stopPropagation();
      this._triggerOnInputChange(e, this.propOptions.value, "backspace");
    }
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
    const renderedItems = this.propOptions.renderList(options, this._defaultRenderList.bind(this));
    container.innerHTML = "";
    renderedItems.forEach((item, index) => {
      const dataItem = options[index];
      let el = null;
      if (typeof item === "string") {
        const temp = document.createElement("div");
        temp.innerHTML = item;
        el = temp.firstElementChild;
        el.classList.add("element");
        el.dataset.id = String(dataItem.id);
        el.classList.toggle("selected", dataItem.selected === true);
      } else {
        el = item;
      }
      if (el) {
        el.classList.toggle(
          "highlighted",
          this.propHighlightedId !== null && String(dataItem.id) === String(this.propHighlightedId),
        );
        container.appendChild(el);
      }
    });
  }
  _updateLoadingDisplay() {
    if (this.propSpinnerElement) {
      this.propSpinnerElement.classList.toggle("loading", Boolean(this.propOptions.loading));
    }
    if (this.propClearButton) {
      this.propClearButton.style.display = this.propOptions.loading ? "none" : "flex";
    }
  }
  _updateDisabledDisplay() {
    if (this.propOptionsContainer) {
      this.propOptionsContainer.classList.toggle("disabled", Boolean(this.propOptions.disabled));
    }
    if (this.propClearButton) {
      this.propClearButton.disabled = Boolean(this.propOptions.disabled);
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
  /**
   * Internal helper to notify both the callback provided in options and the internal subscriber
   * when the input value changes.
   */
  _triggerOnInputChange(e, previousValue, origin) {
    if (this.propOptions.onInputChange) {
      this.propOptions.onInputChange.call(this, e, previousValue, origin);
    }
    this._subscriber.trigger("onInputChange", e, previousValue, origin);
  }
  /**
   * Internal helper to notify both the callback provided in options and the internal subscriber
   * when an item is picked (e.g. via click or Enter key).
   */
  _triggerOnItemPick(item) {
    if (this.propOptions.disabled) return;
    if (this.propOptions.onItemPick) {
      this.propOptions.onItemPick.call(this, item);
    }
    this._subscriber.trigger("onItemPick", item);
  }
  // setters
  setMaxHeight(maxHeight) {
    this.propOptions.maxHeight = maxHeight || "";
    if (this.propParentElement) {
      this.propParentElement.style.maxHeight = maxHeight || "none";
    }
    this._triggerOnComponentChange("setMaxHeight");
  }
  setDisabled(disabled) {
    this.propOptions.disabled = Boolean(disabled);
    this._updateDisabledDisplay();
    this._triggerOnComponentChange("setDisabled");
  }
  setShowFooter(show) {
    this.propOptions.showFooter = Boolean(show);
    this._updateFooterDisplay();
    this._triggerOnComponentChange("showFooter");
  }
  setShowFilter(show) {
    this.propOptions.showFilter = Boolean(show);
    this._updateFilterDisplay();
    this._triggerOnComponentChange("showFilter");
  }
  setOptions(options) {
    this.propOptions.options = options;
    this._updateOptionsDisplay();
    this._triggerOnComponentChange("setOptions");
  }
  setLoading(loading) {
    this.propOptions.loading = Boolean(loading);
    this._updateLoadingDisplay();
    this._triggerOnComponentChange("setLoading");
  }
  setValue(value, triggerOnChange = true) {
    const previousValue = this.propOptions.value;
    this.propOptions.value = value;
    if (this.propInputElement) {
      this.propInputElement.value = value;
    }
    if (triggerOnChange) {
      const event = new Event("input");
      Object.defineProperty(event, "target", { writable: false, value: this.propInputElement });
      this._triggerOnInputChange(event, previousValue, "setValue");
    }
    this._triggerOnComponentChange("setValue");
  }
  // getters
  getShowFilter() {
    return this.propOptions.showFilter;
  }
  getShowFooter() {
    return this.propOptions.showFooter;
  }
  getDisabled() {
    return this.propOptions.disabled;
  }
  getLabel() {
    return this.propOptions.label;
  }
  getLoading() {
    return this.propOptions.loading;
  }
  getValue() {
    return this.propOptions.value;
  }
  getOptions() {
    return this.propOptions.options || [];
  }
  getMaxHeight() {
    return this.propOptions.maxHeight;
  }
  getHighlightedId() {
    return this.propHighlightedId;
  }
  clearSearch(triggerOnClear = true, triggerOnChange = true) {
    const previousValue = this.propOptions.value;
    this.setValue("", triggerOnChange);
    if (triggerOnClear) {
      if (this.propOptions.onClear) {
        this.propOptions.onClear();
      }
      this._subscriber.trigger("onClear");
      const event = new Event("input");
      Object.defineProperty(event, "target", { writable: false, value: this.propInputElement });
      this._triggerOnInputChange(event, previousValue, "clear");
    }
  }
  setLabel(label) {
    this.propOptions.label = label;
    if (this.propLabelElement) {
      this.propLabelElement.textContent = label || "";
    }
    this._triggerOnComponentChange("setLabel");
  }
  highlightAndScrollToElementOnTheList(id) {
    this.propHighlightedId = id ?? null;
    this._updateOptionsDisplay();
    if (this.propHighlightedId !== null) {
      this._scrollToHighlighted();
    }
    if (this.propOptions.onHighlightChange) {
      this.propOptions.onHighlightChange.call(this, this.propHighlightedId);
    }
    this._subscriber.trigger("onHighlightChange", this.propHighlightedId);
  }
  pickHighlighted() {
    if (this.propHighlightedId === null) return;
    const item = this.propOptions.options?.find((opt) => String(opt.id) === String(this.propHighlightedId));
    if (item) {
      this._triggerOnItemPick(item);
    }
  }
  setRenderEmpty(renderEmpty) {
    this.propOptions.renderEmpty = renderEmpty || ((def) => def());
    this._updateOptionsDisplay();
    this._triggerOnComponentChange("setRenderEmpty");
  }
  setRenderItem(renderItem) {
    this.propOptions.renderItem =
      renderItem || ((item, defaultRender, searchValue) => defaultRender(item, searchValue));
    this._updateOptionsDisplay();
    this._triggerOnComponentChange("setRenderItem");
  }
  setRenderList(renderList) {
    this.propOptions.renderList = renderList || ((list, def) => def(list));
    this._updateOptionsDisplay();
    this._triggerOnComponentChange("setRenderList");
  }
  setFocus(triggerOnFocus = true) {
    if (!triggerOnFocus) {
      this._skipNextFocusEvent = true;
    }
    this.propInputElement.focus();
  }
  setBlur() {
    this.propInputElement.blur();
  }
  attachArrowsUpAndDown() {
    const element = this.propInputElement;
    if (this._attachedElements.has(element)) {
      return;
    }
    const listener = (e) => this._handleKeyDown(e);
    this._attachedElements.set(element, listener);
    element.addEventListener("keydown", listener);
  }
  detachArrowsUpAndDown() {
    const element = this.propInputElement;
    const listener = this._attachedElements.get(element);
    if (listener) {
      element.removeEventListener("keydown", listener);
      this._attachedElements.delete(element);
    }
  }
  destroy() {
    // This is the trick: we track all elements we've attached to and detach them here.
    // This is especially important for the 'window' object which persists.
    for (const [element] of this._attachedElements) {
      const listener = this._attachedElements.get(element);
      if (listener) {
        element.removeEventListener("keydown", listener);
      }
    }
    this._attachedElements.clear();
    this._subscriber.destroy();
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
      this.propClearButton = document.createElement("button");
      this.propClearButton.type = "button";
      this.propClearButton.className = "clear-btn";
      this.propClearButton.textContent = "✕";
      inputWrapper.appendChild(this.propClearButton);
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
      this.propLeftSpace = document.createElement("span");
      this.propLeftSpace.className = "left-space";
      this.propLeftSpace.textContent = "";
      this.propFooterContainer.appendChild(this.propLeftSpace);
      this.propFooterContainer.appendChild(this.propCancelButton);
      this.propFooterContainer.appendChild(this.propOkButton);
      this.propParentElement.appendChild(this.propFilterContainer);
      this.propParentElement.appendChild(this.propOptionsContainer);
      this.propParentElement.appendChild(this.propFooterContainer);
    }
    this._updateOptionsDisplay();
    this._updateLoadingDisplay();
    this._updateDisabledDisplay();
    this._updateFooterDisplay();
    this._updateFilterDisplay();
    // this.setValue(this.propOptions.value || "");
  }
}
