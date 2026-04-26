export class ContainerManager {
  private parent: HTMLDivElement;
  private target: HTMLDivElement;
  private popover: HTMLDivElement;
  private currentPosition: string = "cover-bottom";

  constructor(parent: HTMLDivElement) {
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

  public show(): void {
    (this.popover as any).showPopover({ source: this.target });
  }

  public hide(): void {
    (this.popover as any).hidePopover();
  }

  public getParent(): HTMLDivElement {
    return this.parent;
  }

  public getTarget(): HTMLDivElement {
    return this.target;
  }

  public getPopover(): HTMLDivElement {
    return this.popover;
  }

  public setPosition(position: string): void {
    if (this.currentPosition) {
      this.popover.classList.remove(this.currentPosition);
    }
    this.currentPosition = position;
    if (this.currentPosition) {
      this.popover.classList.add(this.currentPosition);
    }
  }

  public setOffset(offset: string): void {
    this.popover.style.setProperty("--popover-offset", offset);
  }

  public destroy(): void {
    if (this.target && this.target.parentNode) {
      this.target.parentNode.removeChild(this.target);
    }
    if (this.popover && this.popover.parentNode) {
      this.popover.parentNode.removeChild(this.popover);
    }
  }
}
