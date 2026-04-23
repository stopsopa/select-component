export type ListElement = {
  id: number | string;
  label: string;
  selected?: boolean;
  [key: string]: any;
};

export type ListManagerOptions<T extends ListElement> = {
  options?: T[];
  onItemClick?: (item: T) => void;
  renderEmpty?: (defaultRender: () => string | HTMLElement) => string | HTMLElement;
  renderItem?: (item: T, defaultRender: (item: T) => string | HTMLElement) => string | HTMLElement;
  renderList?: (list: T[], defaultRender: (list: T[]) => (string | HTMLElement)[]) => (string | HTMLElement)[];
};

export class ListManager<T extends ListElement = ListElement> {
  public propOptions: ListManagerOptions<T>;
  public propParentElement: HTMLElement;
  public propOptionsContainer!: HTMLElement;

  constructor(bindElement: HTMLElement, options: ListManagerOptions<T> = {}) {
    this.propParentElement = bindElement;
    this.propOptions = {
      options: [],
      renderItem: (item, def) => def(item),
      renderList: (list, def) => def(list),
      renderEmpty: (def) => def(),
      ...options,
    };

    this.render();
  }

  public setOptions(options: T[]) {
    this.propOptions.options = options;
    this._updateOptionsDisplay();
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
    return `<div class="empty-msg">No items to display</div>`;
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

  public render() {
    if (!this.propOptionsContainer) {
      this.propOptionsContainer = document.createElement("div");
      this.propOptionsContainer.className = "options";
      this.propParentElement.appendChild(this.propOptionsContainer);
      this._bindEvents();
    }

    this._updateOptionsDisplay();
  }

  private _bindEvents() {
    this.propOptionsContainer.addEventListener("click", (e) => {
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
        container.appendChild(el);
      }
    });
  }
}
