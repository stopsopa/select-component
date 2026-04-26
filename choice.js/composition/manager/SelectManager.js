import { ContainerManager } from "../container/ContainerManager.js";
import {
  OptionsListManager
} from "../options-section/OptionsListManager.js";
import {
  SelectedListManager
} from "../select-section/SelectedListManager.js";
import { clickOutside } from "../unbind/clickOutside.js";
class SelectManager {
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
}
export {
  SelectManager
};
