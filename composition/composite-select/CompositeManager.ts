import { ContainerManager } from "../container/ContainerManager.js";
import type { ContainerManagerOptions } from "../container/ContainerManager.js";

import { OptionsSectionManager } from "../options-section/OptionsSectionManager.js";
import type { OptionsSectionManagerOptions } from "../options-section/OptionsSectionManager.js";

import { SelectedSectionManager } from "../selected-section/SelectedSectionManager.js";
import type { SelectedSectionManagerOptions } from "../selected-section/SelectedSectionManager.js";

import { clickOutside } from "../unbind/clickOutside.js";

import type { Item } from "../types.js";

export type CompositeManagerOptions<T extends Item> = {
  select?: SelectedSectionManagerOptions<T>;
  options?: OptionsSectionManagerOptions<T>;
  container?: ContainerManagerOptions;
};

export class CompositeManager<T extends Item> {
  public container: ContainerManager;
  public selected: SelectedSectionManager<T>;
  public options: OptionsSectionManager<T>;
  private _unbindClickOutside: () => void;
  private _parent: HTMLDivElement;

  constructor(parent: HTMLDivElement, options: CompositeManagerOptions<T> = {}) {
    this._parent = parent;

    this.container = new ContainerManager(this._parent, options.container);

    {
      const target = this.container.getTarget();

      const div = document.createElement("div");

      target.appendChild(div);

      this.selected = new SelectedSectionManager(div, options.select);

      this.selected.getSubscriber().bind("onFocus", (e: FocusEvent) => {
        this.container.show();
        this.options.setFocus();
      });
    }

    {
      const popover = this.container.getPopover();

      const div = document.createElement("div");

      popover.appendChild(div);

      this.options = new OptionsSectionManager(div, options.options);
    }

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
