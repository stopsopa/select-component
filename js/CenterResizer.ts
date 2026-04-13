export class CenterResizer extends HTMLElement {
  leftDiv!: HTMLElement;
  rightDiv!: HTMLElement;
  resizerLeft!: HTMLElement;
  resizerRight!: HTMLElement;
  storageKeyLeft!: string;
  storageKeyRight!: string;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }
        .flex {
          display: flex;
          width: 100%;
          align-items: stretch;
        }
        .center-div {
          flex-grow: 1;
          min-width: 0;
          padding-left: 15px;
          padding-right: 15px;
          box-sizing: border-box;
        }
        .side-div {
          flex-shrink: 0;
          box-sizing: border-box;
        }
        .resizer {
          width: 8px;
          cursor: col-resize;
          flex-shrink: 0;
          transition: background 0.2s;
          user-select: none;
          margin: 0 -4px;
          z-index: 10;
          position: relative;
        }
        .resizer:hover,
        .resizer.active {
          background: rgba(26, 115, 232, 0.2);
        }
        .resizer::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #ccc;
          transform: translateX(-50%);
        }
        .resizer:hover::after,
        .resizer.active::after {
          background: #1a73e8;
        }
      </style>
      <div class="flex">
        <div class="side-div" id="left-div"></div>
        <div class="resizer" id="resizer-left"></div>
        <div class="center-div">
          <slot></slot>
        </div>
        <div class="resizer" id="resizer-right"></div>
        <div class="side-div" id="right-div"></div>
      </div>
    `;
  }

  connectedCallback() {
    this.leftDiv = this.shadowRoot!.getElementById("left-div") as HTMLElement;
    this.rightDiv = this.shadowRoot!.getElementById("right-div") as HTMLElement;
    this.resizerLeft = this.shadowRoot!.getElementById("resizer-left") as HTMLElement;
    this.resizerRight = this.shadowRoot!.getElementById("resizer-right") as HTMLElement;

    this.storageKeyLeft = this.getAttribute("storage-key-left") || "choice-width-px-left";
    this.storageKeyRight = this.getAttribute("storage-key-right") || "choice-width-px-right";

    const savedLeft = localStorage.getItem(this.storageKeyLeft);
    const savedRight = localStorage.getItem(this.storageKeyRight);
    if (savedLeft) this.leftDiv.style.width = savedLeft + "px";
    if (savedRight) this.rightDiv.style.width = savedRight + "px";

    this.setupResizer(this.resizerLeft, this.leftDiv, false);
    this.setupResizer(this.resizerRight, this.rightDiv, true);
  }

  setupResizer(handle: HTMLElement, target: HTMLElement, isRightSide: boolean) {
    handle.addEventListener("mousedown", (e: MouseEvent) => {
      e.preventDefault();
      handle.classList.add("active");
      const startX = e.clientX;
      const startWidth = target.offsetWidth;

      const onMouseMove = (moveEvent: MouseEvent) => {
        let diff = moveEvent.clientX - startX;
        if (isRightSide) diff = -diff;
        let newWidth = startWidth + diff;
        newWidth = Math.max(0, newWidth);
        target.style.width = newWidth + "px";
        const storageKey = isRightSide ? this.storageKeyRight : this.storageKeyLeft;
        localStorage.setItem(storageKey, newWidth.toString());
      };

      const onMouseUp = () => {
        handle.classList.remove("active");
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  }
}

customElements.define("center-resizer", CenterResizer);
