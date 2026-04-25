export type SelectManagerOptions<T extends OptionsListElement & SelectedListElement> = {
  selectOptions?: SelectedListManagerOptions<T>;
  optionOptions?: OptionListManagerOptions<T>;
};

export class SelectManager<T extends OptionsListElement & SelectedListElement> {
  public container: ContainerManager;
  public selected: SelectedListManager<T>;
  public options: OptionListManager<T>;
  private _unbindClickOutside: () => void;
  private _parent: HTMLDivElement;

  constructor(parent: HTMLDivElement, options: SelectManagerOptions<T> = {}) {
    this._parent = parent;

    this.container = new ContainerManager(this._parent);

    const selOpts = { ...options.selectOptions };
    const oldOnFocus = selOpts.onFocus;
    selOpts.onFocus = (e: FocusEvent) => {
      console.log("show*");
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

      this.options = new OptionListManager(div, options.optionOptions);
    }

    this._unbindClickOutside = clickOutside(this.container.getParent(), () => {
      console.log("hide*");
      this.container.hide();
    });
  }

  public destroy(): void {
    this._unbindClickOutside();
    this.options.destroy();
    if (typeof (this.selected as any).destroy === "function") {
      (this.selected as any).destroy();
    }
    this.container.destroy();
    this._parent.innerHTML = "";
  }
}
