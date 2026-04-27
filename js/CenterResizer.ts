/**
 *   <center-resizer left="50px" center="350px">
 *      <div>Content</div>
 *   </center-resizer>
 *
 *   const resizer = document.querySelector('center-resizer');
 *   resizer.addEventListener('onLeft', e => console.log(e.detail.width));
 *   resizer.addEventListener('onCenter', e => console.log(e.detail.width));
 */
export class CenterResizer extends HTMLElement {
  leftDiv!: HTMLElement;
  centerDiv!: HTMLElement;
  rightDiv!: HTMLElement;
  resizerLeft!: HTMLElement;
  resizerRight!: HTMLElement;

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
          flex-shrink: 0;
          min-width: 0;
          padding-left: 15px;
          padding-right: 15px;
          box-sizing: border-box;
        }
        .side-div {
          flex-shrink: 0;
          box-sizing: border-box;
        }
        #right-div {
          flex-grow: 1;
        }
        .resizer {
          width: 8px;
          cursor: col-resize;
          flex-shrink: 0;
          transition: background 0.2s;
          user-select: none;
          margin: 0 -4px;
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
        <div class="center-div" id="center-div">
          <slot></slot>
        </div>
        <div class="resizer" id="resizer-right"></div>
        <div class="side-div" id="right-div"></div>
      </div>
    `;
  }

  connectedCallback() {
    this.leftDiv = this.shadowRoot!.getElementById("left-div") as HTMLElement;
    this.centerDiv = this.shadowRoot!.getElementById("center-div") as HTMLElement;
    this.rightDiv = this.shadowRoot!.getElementById("right-div") as HTMLElement;
    this.resizerLeft = this.shadowRoot!.getElementById("resizer-left") as HTMLElement;
    this.resizerRight = this.shadowRoot!.getElementById("resizer-right") as HTMLElement;
    const attrLeft = this.getAttribute("left");
    const attrCenter = this.getAttribute("center");

    if (attrLeft) {
      this.leftDiv.style.width = attrLeft;
    }

    if (attrCenter) {
      this.centerDiv.style.width = attrCenter;
    }

    this.setupResizer(this.resizerLeft, this.leftDiv, false);
    this.setupResizer(this.resizerRight, this.centerDiv, false);
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
}

customElements.define("center-resizer", CenterResizer);
