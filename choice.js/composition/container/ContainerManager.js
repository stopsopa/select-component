class ContainerManager {
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
}
export {
  ContainerManager
};
