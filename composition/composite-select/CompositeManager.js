import { ContainerManager } from "../container/ContainerManager.js";
import { OptionsSectionManager } from "../options-section/OptionsSectionManager.js";
import { SelectedSectionManager } from "../selected-section/SelectedSectionManager.js";
import { clickOutside } from "../unbind/clickOutside.js";
export class CompositeManager {
  container;
  selected;
  options;
  _unbindClickOutside;
  _parent;
  constructor(parent, options = {}) {
    this._parent = parent;
    this.container = new ContainerManager(this._parent, options.container);
    {
      const target = this.container.getTarget();
      const div = document.createElement("div");
      target.appendChild(div);
      this.selected = new SelectedSectionManager(div, options.select);
      this.selected.getSubscriber().bind("onFocus", (e) => {
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
  destroy() {
    this._unbindClickOutside();
    this.options.destroy();
    if (typeof this.selected.destroy === "function") {
      this.selected.destroy();
    }
    this.container.destroy();
    this._parent.innerHTML = "";
  }
}
