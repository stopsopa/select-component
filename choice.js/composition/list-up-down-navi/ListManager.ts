export type ListElement = {
  id: number | string;
  label: string;
  selected?: boolean;
  [key: string]: any;
};

export type ListManagerOptions<T extends ListElement> = {
  options?: T[];
  onItemPick?: (item: T) => void;
};

export class ListManager<T extends ListElement = ListElement> {
  public propOptions: ListManagerOptions<T>;
  public propParentElement: HTMLElement;
  public propOptionsContainer!: HTMLElement;
  public propHighlightedId: string | number | null = null;

  constructor(bindElement: HTMLElement, options: ListManagerOptions<T> = {}) {
    this.propParentElement = bindElement;
    this.propOptions = {
      options: [],
      ...options,
    };

    this.render();
  }

  public itemPick(id?: string | number | null) {
    this.propHighlightedId = id ?? null;
    this._updateOptionsDisplay();
    if (this.propHighlightedId !== null) {
      this._scrollToHighlighted();
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
      el.scrollIntoView({ block: 'nearest' });
    }
  }

  public setMaxHeight(maxHeight?: string) {
    if (this.propParentElement) {
      this.propParentElement.style.maxHeight = maxHeight || "none";
    }
  }

  public setOptions(options: T[]) {
    this.propOptions.options = options;
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
    return list.map((item) => this._defaultRenderItem(item));
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
        if (item && this.propOptions.onItemPick) {
          this.propOptions.onItemPick(item);
        }
      }
    });
  }

  private _updateOptionsDisplay() {
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
}
