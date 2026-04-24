class ListManager {
  propOptions;
  propParentElement;
  propOptionsContainer;
  propHighlightedId = null;
  constructor(bindElement, options = {}) {
    this.propParentElement = bindElement;
    this.propOptions = {
      options: [],
      ...options
    };
    this.render();
  }
  itemPick(id) {
    this.propHighlightedId = id ?? null;
    this._updateOptionsDisplay();
    if (this.propHighlightedId !== null) {
      this._scrollToHighlighted();
    }
  }
  triggerItemPick() {
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
  setMaxHeight(maxHeight) {
    if (this.propParentElement) {
      this.propParentElement.style.maxHeight = maxHeight || "none";
    }
  }
  setOptions(options) {
    this.propOptions.options = options;
    this._updateOptionsDisplay();
  }
  _defaultRenderEmpty() {
    return `<div class="empty-msg">No items to display</div>`;
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
    return list.map((item) => this._defaultRenderItem(item));
  }
  render() {
    if (!this.propOptionsContainer) {
      this.propOptionsContainer = document.createElement("div");
      this.propOptionsContainer.className = "options";
      this.propParentElement.appendChild(this.propOptionsContainer);
      this._bindEvents();
    }
    this._updateOptionsDisplay();
  }
  _bindEvents() {
    this.propOptionsContainer.addEventListener("click", (e) => {
      const target = e.target;
      const element = target.closest(".element");
      if (element) {
        const id = element.dataset.id;
        const item = this.propOptions.options?.find((opt) => String(opt.id) === id);
        if (item && this.propOptions.onItemPick) {
          this.propOptions.onItemPick(item);
        }
      }
    });
  }
  _updateOptionsDisplay() {
    const container = this.propOptionsContainer;
    if (!container) return;
    const options = this.propOptions.options || [];
    if (options.length === 0) {
      const result = this._defaultRenderEmpty();
      if (typeof result === "string") {
        container.innerHTML = result;
      } else {
        container.innerHTML = "";
        container.appendChild(result);
      }
      return;
    }
    container.innerHTML = "";
    const renderedItems = this._defaultRenderList(options);
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
}
export {
  ListManager
};
