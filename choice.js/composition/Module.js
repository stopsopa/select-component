// choice.js/composition/container/ContainerManager.js
var ContainerManager = class {
  parent;
  target;
  popover;
  currentPosition = "top";
  constructor(parent) {
    this.parent = parent;
    this.target = document.createElement("div");
    this.popover = document.createElement("div");
    this.popover.setAttribute("popover", "manual");
    this.popover.setAttribute("data-popover", "");
    this.popover.style.width = "anchor-size(width)";
    this.popover.style.boxSizing = "border-box";
    this.popover.style.border = "none";
    this.setPosition(this.currentPosition);
    this.setOffset("0px");
    this.parent.appendChild(this.target);
    this.parent.appendChild(this.popover);
  }
  show() {
    this.popover.showPopover({ source: this.target });
  }
  hide() {
    this.popover.hidePopover();
  }
  getParent() {
    return this.parent;
  }
  getTarget() {
    return this.target;
  }
  getPopover() {
    return this.popover;
  }
  setPosition(position) {
    if (this.currentPosition) {
      this.popover.classList.remove(this.currentPosition);
    }
    this.currentPosition = position;
    if (this.currentPosition) {
      this.popover.classList.add(this.currentPosition);
    }
  }
  setOffset(offset) {
    this.popover.style.setProperty("--popover-offset", offset);
  }
  destroy() {
    if (this.target && this.target.parentNode) {
      this.target.parentNode.removeChild(this.target);
    }
    if (this.popover && this.popover.parentNode) {
      this.popover.parentNode.removeChild(this.popover);
    }
  }
};

// choice.js/composition/options-section/OptionsListManager.js
var OptionsListManager = class {
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
  _attachedElements = /* @__PURE__ */ new Map();
  constructor(bindElement, options = {}) {
    this.propParentElement = bindElement;
    this.propParentElement.classList.add("options-list-manager");
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
    if (this.propOptions.onHighlightChange) {
      this.propOptions.onHighlightChange(this.propHighlightedId);
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
  attachArrowsUpAndDown(element) {
    if (this._attachedElements.has(element)) {
      return;
    }
    const listener = (e) => this._handleKeyDown(e);
    this._attachedElements.set(element, listener);
    element.addEventListener("keydown", listener);
  }
  detachArrowsUpAndDown(element) {
    const listener = this._attachedElements.get(element);
    if (listener) {
      element.removeEventListener("keydown", listener);
      this._attachedElements.delete(element);
    }
  }
  destroy() {
    for (const [element] of this._attachedElements) {
      this.detachArrowsUpAndDown(element);
    }
    this._attachedElements.clear();
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
  _bindEvents() {
    if (this.propInputElement) {
      this.propInputElement.addEventListener("input", (e) => {
        this.propOptions.value = this.propInputElement.value;
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
      const target = e.target;
      const element = target.closest(".element");
      if (element) {
        const id = element.dataset.id;
        const item = this.propOptions.options?.find((opt) => String(opt.id) === id);
        if (item && this.propOptions.onItemPick) {
          this.setFocus();
          this.itemPick(item.id);
          this.propOptions.onItemPick(item);
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
      this.propSpinnerElement.classList.toggle("loading", Boolean(this.propOptions.loading));
    }
  }
  _updateDisabledDisplay() {
    if (this.propOptionsContainer) {
      this.propOptionsContainer.classList.toggle("disabled", Boolean(this.propOptions.disabled));
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
};

// choice.js/composition/select-section/SelectedListManager.js
var SelectedListManager = class {
  propParentElement;
  propContainer;
  propFlexList;
  propButtonsContainer;
  propOptions;
  propSelected;
  propInputElement = null;
  propClearButton;
  propLoaderElement = null;
  propLabelElement = null;
  constructor(parentElement, options = {}) {
    this.propParentElement = parentElement;
    this.propOptions = {
      selected: [],
      showInput: true,
      value: "",
      inputFieldRender: (value) => {
        const input = document.createElement("input");
        input.type = "text";
        input.value = value;
        input.placeholder = " ";
        input.size = 1;
        return input;
      },
      renderItem: (item, def) => def(item),
      renderList: (selected, def) => def(selected),
      onDelete: (id) => {
      },
      onClear: () => {
      },
      onChange: (e) => {
      },
      disabled: false,
      error: false,
      loading: false,
      label: "",
      ...options
    };
    this.propSelected = this.propOptions.selected || [];
    this._bindEvents();
    this.render();
  }
  _bindEvents() {
    this.propParentElement.addEventListener("click", (e) => {
      const target = e.target;
      const clearBtn = target.closest(".clear-btn");
      if (clearBtn && this.propParentElement.contains(clearBtn)) {
        e.preventDefault();
        this.propOptions.onClear.call(this);
        return;
      }
      const delBtn = target.closest("[data-remove]");
      if (delBtn && this.propParentElement.contains(delBtn)) {
        e.preventDefault();
        const id = delBtn.getAttribute("data-remove");
        this.propOptions.onDelete.call(this, id);
        return;
      }
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
      const target = e.target;
      if (target === this.propInputElement) {
        this.propOptions.onChange.call(this, e);
      }
    });
    this.propParentElement.addEventListener("focusin", (e) => {
      const target = e.target;
      if (target === this.propInputElement) {
        this.propOptions.onFocus?.call(this, e);
      }
    });
    this.propParentElement.addEventListener("keydown", (e) => {
      const target = e.target;
      if (target === this.propInputElement) {
        const isBackspaceOnEmpty = e.key === "Backspace" && this.propInputElement.value === "";
        const isEnter = e.key === "Enter";
        if (isEnter || isBackspaceOnEmpty) {
          this.propOptions.onChange.call(this, e);
        }
      }
    });
  }
  setSelected(list) {
    this.propSelected = list;
    this.render();
  }
  setShowInput(show) {
    if (this.propOptions.showInput = show) {
      if (!this.propInputElement) {
        this.propInputElement = this.propOptions.inputFieldRender(this.propOptions.value || "");
      }
      if (this.propOptions.disabled) {
        this.propInputElement.disabled = true;
      }
      if (this.propInputElement.parentNode !== this.propFlexList) {
        this.propFlexList.appendChild(this.propInputElement);
      }
    } else {
      if (this.propInputElement && this.propInputElement.parentNode === this.propFlexList) {
        this.propFlexList.removeChild(this.propInputElement);
      }
    }
  }
  setValue(value) {
    this.propOptions.value = value;
    if (this.propInputElement) {
      this.propInputElement.value = value;
    }
  }
  setLabel(label) {
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
  }
  setErrorState(isError) {
    this.propOptions.error = isError;
    this.propContainer.classList.toggle("error", isError);
  }
  setDisabled(disabled) {
    this.propOptions.disabled = disabled;
    if (this.propInputElement) {
      this.propInputElement.disabled = disabled;
    }
    this.propClearButton.disabled = disabled;
    this.propContainer.classList.toggle("disabled", disabled);
  }
  setLoading(loading) {
    this.propOptions.loading = loading;
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
  }
  setRenderItem(renderItem) {
    this.propOptions.renderItem = renderItem || ((item, def) => def(item));
    this.render();
  }
  setRenderList(renderList) {
    this.propOptions.renderList = renderList || ((selected, def) => def(selected));
    this.render();
  }
  _defaultRenderItem(item) {
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
  _defaultRenderList(selected) {
    return selected.map((item) => this.propOptions.renderItem(item, this._defaultRenderItem.bind(this)));
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
    this.setLoading(Boolean(this.propOptions.loading));
    this.setLabel(this.propOptions.label || "");
    this.setShowInput(Boolean(this.propOptions.showInput));
    const elements = this.propOptions.renderList(this.propSelected, this._defaultRenderList.bind(this));
    if (!Array.isArray(elements)) {
      throw new Error("renderList must return an array of HTMLElements");
    }
    const children = Array.from(this.propFlexList.childNodes);
    for (const child of children) {
      if (child instanceof HTMLElement && child.tagName === "INPUT") {
        continue;
      }
      this.propFlexList.removeChild(child);
    }
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
};

// choice.js/composition/unbind/clickOutside.js
function clickOutside(targets, callback) {
  const targetList = Array.isArray(targets) ? targets : [targets];
  const handler = (e) => {
    const node = e.target;
    const isInside = targetList.some((target) => target && target.contains(node));
    if (!isInside) {
      callback(e);
    }
  };
  console.log("document", document, "target: ", targetList);
  document.addEventListener("click", handler, true);
  document.addEventListener("touchstart", handler, { capture: true, passive: true });
  return function unbind() {
    document.removeEventListener("click", handler, true);
    document.removeEventListener("touchstart", handler, true);
  };
}

// choice.js/composition/final/helpers.js
function selectedAddDeduplicatedItem(selected, item) {
  const tmp = [...selected];
  const found = tmp.some((i) => String(i.id) === String(item.id));
  if (!found) {
    tmp.push(item);
  }
  return tmp;
}
function selectedToggleDeduplicatedItem(selected, item) {
  const tmp = [...selected];
  const found = tmp.some((i) => String(i.id) === String(item.id));
  if (found) {
    return tmp.filter((i) => String(i.id) !== String(item.id));
  } else {
    tmp.push(item);
  }
  return tmp;
}
function selectedFindDeduplicatedInOptionsByIds(options, ids, seed) {
  let tmp = [];
  if (seed) {
    tmp = [...seed];
  }
  ids.forEach((id) => {
    const found = tmp.some((i) => String(i.id) === String(id));
    if (!found) {
      tmp.push(options.find((o) => String(o.id) === String(id)));
    }
  });
  tmp = deduplicateArrayById(tmp);
  return tmp;
}
function optionsSelectBasedOnSelectedList(options, selected) {
  const ids = selected.map((i) => String(i.id));
  if (ids.length === 0) {
    return [...options];
  }
  return options.map((option) => {
    const opt = { ...option };
    opt.selected = ids.includes(String(option.id));
    return opt;
  });
}
function deduplicateArrayById(arr) {
  return arr.filter((item, index) => arr.findIndex((i) => String(i.id) === String(item.id)) === index);
}

// choice.js/composition/final/SelectManager.js
var SelectManager = class {
  container;
  selected;
  options;
  _unbindClickOutside;
  _parent;
  constructor(parent, options = {}) {
    this._parent = parent;
    this.container = new ContainerManager(this._parent);
    const selOpts = { ...options.select };
    const oldOnFocus = selOpts.onFocus;
    selOpts.onFocus = (e) => {
      this.container.show();
      if (oldOnFocus) {
        oldOnFocus.call(this.selected, e);
      }
    };
    {
      const target = this.container.getTarget();
      const div = document.createElement("div");
      target.appendChild(div);
      this.selected = new SelectedListManager(div, selOpts);
    }
    {
      const popover = this.container.getPopover();
      const div = document.createElement("div");
      popover.appendChild(div);
      this.options = new OptionsListManager(div, options.options);
    }
    this._unbindClickOutside = clickOutside([this.container.getParent()], () => {
      this.container.hide();
    });
  }
  destroy() {
    this._unbindClickOutside();
    this.options.destroy();
    if (typeof this.selected.destroy === "function") {
      this.selected.destroy();
    }
    this.container.destroy();
    this._parent.innerHTML = "";
  }
};

// choice.js/composition/Module.ts
/** @es.ts 
{
   mode: "bundle",
   extension: ".js",
   options: {
   }
}
@es.ts */export {
  ContainerManager,
  OptionsListManager,
  SelectManager,
  SelectedListManager,
  clickOutside,
  deduplicateArrayById,
  optionsSelectBasedOnSelectedList,
  selectedAddDeduplicatedItem,
  selectedFindDeduplicatedInOptionsByIds,
  selectedToggleDeduplicatedItem
};
