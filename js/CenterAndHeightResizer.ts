/**
 *   <center-and-height-resizer
 *      left="50px"
 *      center="350px"
 *      height="200px"
 *   >
 *      <div>Content</div>
 *   </center-and-height-resizer>
 *
 *   const resizer = document.querySelector('center-and-height-resizer');
 *   resizer.addEventListener('onLeft', e => console.log(e.detail.width));
 *   resizer.addEventListener('onCenter', e => console.log(e.detail.width));
 *   resizer.addEventListener('onHeight', e => console.log(e.detail.height));
 */
export class CenterAndHeightResizer extends HTMLElement {
  leftDiv!: HTMLElement;
  rightDiv!: HTMLElement;
  centerDiv!: HTMLElement;
  resizerLeft!: HTMLElement;
  resizerRight!: HTMLElement;
  resizerBottom!: HTMLElement;

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
        .center-column {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .center-div {
          flex-grow: 1;
          min-width: 0;
          box-sizing: border-box;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.1);
          background: #fff;
          border-radius: 6px;
          overflow: auto;
          min-height: 50px;
          border: 1px solid #eaeaea;
        }
        .side-div {
          flex-shrink: 0;
          box-sizing: border-box;
        }
        .resizer {
          flex-shrink: 0;
          transition: background 0.2s;
          user-select: none;
          position: relative;
        }
        .resizer.horizontal {
          width: 8px;
          cursor: col-resize;
        }
        .resizer.vertical {
          height: 8px;
          cursor: row-resize;
          width: 100%;
        }
        .resizer:hover,
        .resizer.active {
          background: rgba(26, 115, 232, 0.12);
        }
        .resizer::after {
          content: "";
          position: absolute;
          background: #ccc;
          transition: background 0.2s;
        }
        .resizer.horizontal::after {
          left: 50%;
          top: 0;
          bottom: 0;
          width: 14px;
          transform: translateX(-50%);
        }
        .resizer.vertical::after {
          top: 50%;
          left: 0;
          right: 0;
          height: 14px;
          transform: translateY(-50%);
        }
        .resizer:hover::after,
        .resizer.active::after {
          background: #1a73e8;
        }
        
        #resizer-left {
          margin-right: 5px;
        }
        #resizer-right {
          margin-left: 5px;
        }
        #resizer-bottom {
          margin-top: 5px;
        }
      </style>
      <div class="flex">
        <div class="side-div" id="left-div"></div>
        <div class="resizer horizontal" id="resizer-left"></div>
        <div class="center-column">
          <div class="center-div" id="center-div">
            <slot></slot>
          </div>
          <div class="resizer vertical" id="resizer-bottom"></div>
        </div>
        <div class="resizer horizontal" id="resizer-right"></div>
        <div class="side-div" id="right-div"></div>
      </div>
    `;
  }

  static get observedAttributes() {
    return ["left", "center", "height"];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;
    if (!this.leftDiv) return; // Not connected yet

    switch (name) {
      case "left":
        this.leftDiv.style.width = newValue;
        break;
      case "center":
        this.rightDiv.style.width = newValue;
        break;
      case "height":
        this.centerDiv.style.height = newValue;
        break;
    }
  }

  connectedCallback() {
    this.leftDiv = this.shadowRoot!.getElementById("left-div") as HTMLElement;
    this.rightDiv = this.shadowRoot!.getElementById("right-div") as HTMLElement;
    this.centerDiv = this.shadowRoot!.getElementById("center-div") as HTMLElement;
    this.resizerLeft = this.shadowRoot!.getElementById("resizer-left") as HTMLElement;
    this.resizerRight = this.shadowRoot!.getElementById("resizer-right") as HTMLElement;
    this.resizerBottom = this.shadowRoot!.getElementById("resizer-bottom") as HTMLElement;

    const attrLeft = this.getAttribute("left");
    const attrRight = this.getAttribute("center");
    const attrHeight = this.getAttribute("height");

    if (attrLeft) {
      this.leftDiv.style.width = attrLeft;
    }

    if (attrRight) {
      this.rightDiv.style.width = attrRight;
    }

    if (attrHeight) {
      this.centerDiv.style.height = attrHeight;
    }

    this.setupResizer(this.resizerLeft, this.leftDiv, false);
    this.setupResizer(this.resizerRight, this.rightDiv, true);
    this.setupHeightResizer(this.resizerBottom, this.centerDiv);
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

        if (isRightSide) {
          this.setAttribute("center", newWidth + "px");
          this.dispatchEvent(new CustomEvent("onCenter", { detail: { width: newWidth } }));
        } else {
          this.setAttribute("left", newWidth + "px");
          this.dispatchEvent(new CustomEvent("onLeft", { detail: { width: newWidth } }));
        }
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

  setupHeightResizer(handle: HTMLElement, target: HTMLElement) {
    handle.addEventListener("mousedown", (e: MouseEvent) => {
      e.preventDefault();
      handle.classList.add("active");
      const startY = e.clientY;
      const startHeight = target.offsetHeight;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const diff = moveEvent.clientY - startY;
        let newHeight = startHeight + diff;
        newHeight = Math.max(0, newHeight);
        target.style.height = newHeight + "px";
        
        this.setAttribute("height", newHeight + "px");
        this.dispatchEvent(new CustomEvent("onHeight", { detail: { height: newHeight } }));
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

customElements.define("center-and-height-resizer", CenterAndHeightResizer);
