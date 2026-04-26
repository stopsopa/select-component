import { ContainerManager } from "../container/ContainerManager.js";
import { OptionsListManager, OptionsListManagerOptions, OptionsListElement } from "../options-section/OptionsListManager.js";
import { SelectedListManager, SelectedListManagerOptions, SelectedListElement } from "../select-section/SelectedListManager.js";
import { clickOutside } from "../unbind/clickOutside.js";

export type SelectManagerOptions<T extends OptionsListElement & SelectedListElement> = {
  select?: SelectedListManagerOptions<T>;
  options?: OptionsListManagerOptions<T>;
};

export class SelectManager<T extends OptionsListElement & SelectedListElement> {
  public container: ContainerManager;
  public selected: SelectedListManager<T>;
  public options: OptionsListManager<T>;
  private _unbindClickOutside: () => void;
  private _parent: HTMLDivElement;

  constructor(parent: HTMLDivElement, options: SelectManagerOptions<T> = {}) {
    this._parent = parent;

    this.container = new ContainerManager(this._parent);

    const selOpts = { ...options.select };
    const oldOnFocus = selOpts.onFocus;
    selOpts.onFocus = (e: FocusEvent) => {
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

    // this._unbindClickOutside = clickOutside([this.container.getParent(), this.container.getPopover()], () => {
    this._unbindClickOutside = clickOutside([this.container.getParent()], () => {
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
