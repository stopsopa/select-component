/** 
    Usage:
    <x-loader></x-loader>
      for inline - somewhere in the middle of the text

    <x-loader class="center"></x-loader>
      for centered - in the middle of the parent container

    <x-loader width="50"></x-loader>
      override default width

    <x-loader src="/path/to/icon.svg"></x-loader>
      override default src

    <x-loader class="small"></x-loader>
    <x-loader class="big"></x-loader>
      make it smaller or bigger
    
    Defaults can be controlled via CSS variables:
    :root {
      --x-loader-width: 100px;
      --x-loader-src: url('/another.svg');
    }
 */
class LoaderElement extends HTMLElement {
  static get observedAttributes() {
    return ["width", "src"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback() {
    this._render();
  }

  _render() {
    const attrWidth = this.getAttribute("width");
    const widthValue = attrWidth ? `${attrWidth}px` : "var(--x-loader-width, 50px)";

    const attrSrc = this.getAttribute("src");
    const srcValue = attrSrc ? `url('${attrSrc}')` : "var(--x-loader-src, url('/examples/loader.svg'))";

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          /* Inline-friendly default behavior */
          display: inline-flex !important;
          vertical-align: middle;
          justify-content: center;
          align-items: center;
        }

        :host(.center) {
          /* Self-centering logic: act as a container that fills its parent */
          display: flex !important;
          width: 100%;
          height: 100%;
        }
        
        .visual-loader {
          /* The actual spinning graphic */
          display: block;
          aspect-ratio: 5 / 3;
          background-repeat: no-repeat;
          background-position: center;
          background-size: cover;
          
          width: ${widthValue};
          background-image: ${srcValue};
        }
      </style>
      <div class="visual-loader"></div>
    `;
  }
}

customElements.define("x-loader", LoaderElement);
