class CenterResizer extends HTMLElement {
  leftDiv;
  centerDiv;
  rightDiv;
  resizerLeft;
  resizerRight;
  storageKeyLeft;
  storageKeyCenter;
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
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
          padding-left: 15px;
          padding-right: 15px;
          box-sizing: border-box;
        }
        .left-div {
          flex-shrink: 0;
          box-sizing: border-box;
        }
        .right-div {
          flex-grow: 1;
          min-width: 0;
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
        <div class="left-div" id="left-div"></div>
        <div class="resizer" id="resizer-left"></div>
        <div class="center-div" id="center-div">
          <slot></slot>
        </div>
        <div class="resizer" id="resizer-right"></div>
        <div class="right-div" id="right-div"></div>
      </div>
    `;
  }
  connectedCallback() {
    this.leftDiv = this.shadowRoot.getElementById("left-div");
    this.centerDiv = this.shadowRoot.getElementById("center-div");
    this.rightDiv = this.shadowRoot.getElementById("right-div");
    this.resizerLeft = this.shadowRoot.getElementById("resizer-left");
    this.resizerRight = this.shadowRoot.getElementById("resizer-right");
    this.storageKeyLeft = this.getAttribute("storage-key-left") || "choice-width-px-left";
    this.storageKeyCenter = this.getAttribute("storage-key-center") || "choice-width-px-center";
    
    const initialLeft = this.getAttribute("left");
    const initialCenter = this.getAttribute("center");
    
    if (initialLeft) this.leftDiv.style.width = initialLeft;
    if (initialCenter) this.centerDiv.style.width = initialCenter;
    
    const savedLeft = localStorage.getItem(this.storageKeyLeft);
    const savedCenter = localStorage.getItem(this.storageKeyCenter);
    
    if (savedLeft) this.leftDiv.style.width = savedLeft + "px";
    if (savedCenter) this.centerDiv.style.width = savedCenter + "px";
    
    this.setupResizer(this.resizerLeft, this.leftDiv, this.storageKeyLeft);
    this.setupResizer(this.resizerRight, this.centerDiv, this.storageKeyCenter);
  }
  setupResizer(handle, target, storageKey) {
    handle.addEventListener("mousedown", (e) => {
      e.preventDefault();
      handle.classList.add("active");
      const startX = e.clientX;
      const startWidth = target.offsetWidth;
      const onMouseMove = (moveEvent) => {
        let diff = moveEvent.clientX - startX;
        let newWidth = startWidth + diff;
        newWidth = Math.max(0, newWidth);
        target.style.width = newWidth + "px";
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
export {
  CenterResizer
};
