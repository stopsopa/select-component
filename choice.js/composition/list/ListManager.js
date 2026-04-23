class ListManager {
  propOptions;
  propParentElement;
  propOptionsContainer;
  constructor(bindElement, options = {}) {
    this.propParentElement = bindElement;
    this.propOptions = {
      options: [],
      renderItem: (item, def) => def(item),
      renderList: (list, def) => def(list),
      renderEmpty: (def) => def(),
      ...options
    };
    this.render();
  }
  setOptions(options) {
    this.propOptions.options = options;
    this._updateOptionsDisplay();
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
    return list.map((item) => this.propOptions.renderItem(item, this._defaultRenderItem.bind(this)));
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
        container.appendChild(el);
      }
    });
  }
}
export {
  ListManager
};
