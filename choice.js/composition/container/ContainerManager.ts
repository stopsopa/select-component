export type PositionType =
  | "topleft"
  | "top-left"
  | "top"
  | "top-right"
  | "topright"
  | "left-top"
  | "cover-top-left"
  | "cover-top"
  | "cover-top-right"
  | "right-top"
  | "left"
  | "cover-left"
  | "center"
  | "cover-right"
  | "right"
  | "left-bottom"
  | "cover-bottom-left"
  | "cover-bottom"
  | "cover-bottom-right"
  | "right-bottom"
  | "bottomleft"
  | "bottom-left"
  | "bottom"
  | "bottom-right"
  | "bottomright";

export class ContainerManager {
  private parent: HTMLDivElement;
  private target: HTMLDivElement;
  private popover: HTMLDivElement;
  private currentPosition: PositionType = "top";

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

  public setPosition(position: PositionType): void {
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
