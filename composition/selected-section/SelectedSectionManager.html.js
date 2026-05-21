import "../../../js/CenterResizer.js";
import { SelectedSectionManager } from "./SelectedSectionManager.js";
import { urlStateConfig, getNextId, setNextId } from "./urlManager.js";
import { getSafeFreeOffset } from "../composite-select/namesSource.js";
const imgData = await fetch("../img/img.json").then((r) => r.json());
const reloadLink = document.getElementById("reload-link");
if (reloadLink) {
  reloadLink.href = window.location.pathname;
}
let instanceCounter = 0;
const updateUrlDisplay = (url = window.location.href) => {
  const el = document.getElementById("url-display");
  if (el) el.textContent = url;
};
const init = (initialSelected = [], states = {}) => {
  instanceCounter++;
  const id = instanceCounter;
  const resizerLeft = states.left || "50px";
  const resizerCenter = states.center || "350px";
  const section = document.createElement("div");
  section.className = "demo-section";
  let templateButtonsHtml = "";
  for (const [color, images] of Object.entries(imgData)) {
    images.forEach((img) => {
      templateButtonsHtml += `<button class="gcp-css white" data-role="template-btn" data-color="${color}" data-img="${img}" style="color: ${color}; padding: 2px 8px; font-size: 11px;">${img}</button>`;
    });
  }
  section.innerHTML = `
    <h2>Instance #${id}</h2>
    <button class="gcp-css white destroy-btn" data-role="destroy">Destroy</button>

    <div class="resizer-container">
      <center-resizer data-role="resizer" left="${resizerLeft}" center="${resizerCenter}" style="padding: 12px;">
        <div data-role="container"></div>
      </center-resizer>
    </div>

    <div class="controls gcp-css" style="margin-bottom: 8px;">
      <div class="controls-label">SelectedSectionManager</div>

      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <div class="gcp-css checkbox-wrapper">
          <div class="checkbox-row">
            <input type="checkbox" id="disabled-sel-${id}" data-role="disabled-sel" ${states.disabled ? "checked" : ""}>
            <div class="content-cell"><label for="disabled-sel-${id}">Disabled</label></div>
          </div>
        </div>

        <div class="gcp-css checkbox-wrapper">
          <div class="checkbox-row">
            <input type="checkbox" id="loading-sel-${id}" data-role="loading-sel" ${states.loading ? "checked" : ""}>
            <div class="content-cell"><label for="loading-sel-${id}">Loading</label></div>
          </div>
        </div>

        <div class="gcp-css checkbox-wrapper">
          <div class="checkbox-row">
            <input type="checkbox" id="error-sel-${id}" data-role="error-sel" ${states.error ? "checked" : ""}>
            <div class="content-cell"><label for="error-sel-${id}">Error</label></div>
          </div>
        </div>

        <div class="gcp-css checkbox-wrapper">
          <div class="checkbox-row">
            <input type="checkbox" id="show-input-sel-${id}" data-role="show-input-sel" ${states.showInput !== false ? "checked" : ""}>
            <div class="content-cell"><label for="show-input-sel-${id}">Show Input</label></div>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
        <div class="gcp-css input-wrapper">
          <input type="text" id="label-input-sel-${id}" data-role="label-input-opt" placeholder="&nbsp;" value="${states.label || ""}">
          <label for="label-input-sel-${id}">Label</label>
        </div>
        <div class="gcp-css input-wrapper">
          <input type="text" id="value-input-sel-${id}" data-role="value-input-opt" placeholder="&nbsp;" value="${states.value || ""}">
          <label for="value-input-sel-${id}">Value</label>
        </div>
        <button class="gcp-css white" data-role="focus-btn">Focus</button>
        <button class="gcp-css white" data-role="add-btn">Add Random</button>
        <button class="gcp-css white" data-role="clear-btn">Clear All</button>
      </div>

      <div style="display: flex; gap: 5px; align-items: center; width: 100%; margin-top: 10px; flex-wrap: wrap;">
        <span style="min-width: 120px;">🖼️ <strong>Templates</strong>:</span>
        ${templateButtonsHtml}
      </div>

      <div style="display: flex; gap: 5px; align-items: center; width: 100%; margin-top: 10px; flex-wrap: wrap;">
        <span style="min-width: 120px;">🎨 <strong>Render</strong>:</span>
        <button class="gcp-css white" data-role="opt-render-btn">Set Custom Render</button>
        <button class="gcp-css white" data-role="opt-string-render-btn">Set String Render</button>
        <button class="gcp-css white" data-role="opt-default-render-btn">Set Default Render</button>
      </div>

      <div style="width: 100%; margin-top: 10px;">
        (onInputChange triggers: <span data-role="onchange-count" style="font-weight: bold;">0</span>,
        onDelete triggers: <span data-role="ondelete-count" style="font-weight: bold;">0</span>,
        onClear triggers: <span data-role="onclear-count" style="font-weight: bold;">0</span>,
        onChange triggers: <span data-role="onitemchange-count" style="font-weight: bold;">0</span>,
        onFocus triggers: <span data-role="onfocus-count" style="font-weight: bold;">0</span>)
      </div>
    </div>

    <pre data-role="dump" style="background:#f8f8f8;padding:10px;border:1px solid #eee;border-radius:4px;font-size:12px;margin:0;overflow:auto;"></pre>
  `;
  document.getElementById("instances-area").appendChild(section);
  const container = section.querySelector('[data-role="container"]');
  const resizer = section.querySelector('[data-role="resizer"]');
  const destroyBtn = section.querySelector('[data-role="destroy"]');
  const dump = section.querySelector('[data-role="dump"]');
  const disabledSelCb = section.querySelector('[data-role="disabled-sel"]');
  const loadingSelCb = section.querySelector('[data-role="loading-sel"]');
  const errorSelCb = section.querySelector('[data-role="error-sel"]');
  const showInputSelCb = section.querySelector('[data-role="show-input-sel"]');
  const labelInputSel = section.querySelector('[data-role="label-input-opt"]');
  const valueInputSel = section.querySelector('[data-role="value-input-opt"]');
  const focusBtn = section.querySelector('[data-role="focus-btn"]');
  const addBtn = section.querySelector('[data-role="add-btn"]');
  const clearBtn = section.querySelector('[data-role="clear-btn"]');
  const optRenderBtn = section.querySelector('[data-role="opt-render-btn"]');
  const optStringRenderBtn = section.querySelector('[data-role="opt-string-render-btn"]');
  const optDefaultRenderBtn = section.querySelector('[data-role="opt-default-render-btn"]');
  const inc = (role) => {
    const el = section.querySelector(`[data-role="${role}"]`);
    if (el) {
      el.textContent = String(parseInt(el.textContent || "0", 10) + 1);
    }
  };
  const updateDump = (list) => {
    dump.textContent = JSON.stringify(list, null, 2);
  };
  let mgr;
  const syncUrl = () => {
    const url = new URL(window.location.href);
    urlStateConfig.toUrl(url, id, {
      selected: mgr.getSelected(),
      left: resizer.getAttribute("left") || "50px",
      center: resizer.getAttribute("center") || "350px",
      disabled: disabledSelCb.checked,
      loading: loadingSelCb.checked,
      label: labelInputSel.value || "",
      value: valueInputSel.value || "",
      error: errorSelCb.checked,
      showInput: showInputSelCb.checked,
    });
    window.history.replaceState({}, "", url);
    updateUrlDisplay(url.toString());
  };
  mgr = new SelectedSectionManager(container, {
    selected: initialSelected,
    label: states.label || "Select options",
    disabled: !!states.disabled,
    loading: !!states.loading,
    error: !!states.error,
    showInput: states.showInput !== false,
    value: states.value || "",
    onFocus: () => {
      inc("onfocus-count");
    },
    onInputChange: (e) => {
      inc("onchange-count");
      valueInputSel.value = e.target.value;
      if (e.key === "Enter") {
        const val = e.target.value.trim();
        if (val) {
          const id = getNextId();
          setNextId(id + 1);
          mgr.setSelected([...mgr.getSelected(), { id, label: val }]);
          mgr.setValue("");
        }
      }
      if (e.key === "Backspace" && e.target.value === "" && mgr.getSelected().length > 0) {
        const selected = [...mgr.getSelected()];
        selected.pop();
        mgr.setSelected(selected);
      }
      syncUrl();
    },
    onDelete: (id) => {
      inc("ondelete-count");
      mgr.setSelected(mgr.getSelected().filter((i) => String(i.id) !== String(id)));
      syncUrl();
    },
    onClear: () => {
      inc("onclear-count");
      mgr.setSelected([]);
      syncUrl();
    },
    onChange: (items) => {
      inc("onitemchange-count");
      updateDump(items);
    },
    onComponentChange: (opt) => {
      disabledSelCb.checked = !!opt.disabled;
      loadingSelCb.checked = !!opt.loading;
      errorSelCb.checked = !!opt.error;
      showInputSelCb.checked = opt.showInput !== false;
      labelInputSel.value = opt.label || "";
      valueInputSel.value = opt.value || "";
    },
  });
  updateDump(mgr.getSelected());
  disabledSelCb.addEventListener("change", () => {
    mgr.setDisabled(disabledSelCb.checked);
    syncUrl();
  });
  loadingSelCb.addEventListener("change", () => {
    mgr.setLoading(loadingSelCb.checked);
    syncUrl();
  });
  errorSelCb.addEventListener("change", () => {
    mgr.setError(errorSelCb.checked);
    syncUrl();
  });
  showInputSelCb.addEventListener("change", () => {
    mgr.setShowInput(showInputSelCb.checked);
    syncUrl();
  });
  labelInputSel.addEventListener("input", () => {
    mgr.setLabel(labelInputSel.value);
    syncUrl();
  });
  valueInputSel.addEventListener("input", () => {
    mgr.setValue(valueInputSel.value);
    syncUrl();
  });
  focusBtn.addEventListener("click", () => mgr.setFocus());
  addBtn.addEventListener("click", () => {
    const id = getNextId();
    setNextId(id + 1);
    mgr.setSelected([...mgr.getSelected(), { id, label: `Item ${id}` }]);
    syncUrl();
  });
  clearBtn.addEventListener("click", () => {
    mgr.clearSearch(true);
    syncUrl();
  });
  optRenderBtn.addEventListener("click", () => {
    mgr.setRenderItem((item, def) => {
      const el = def(item);
      if (item.color) {
        el.style.border = `1px solid ${item.color}`;
        el.style.background = `${item.color}11`;
      }
      if (item.img) {
        const img = document.createElement("img");
        img.src = `../img/${item.img}`;
        img.style.width = "14px";
        img.style.height = "14px";
        img.style.objectFit = "contain";
        img.style.marginRight = "5px";
        el.insertBefore(img, el.firstChild);
      }
      return el;
    });
  });
  section.querySelectorAll('[data-role="template-btn"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const b = btn;
      const id = getNextId();
      setNextId(id + 1);
      mgr.setSelected([
        ...mgr.getSelected(),
        {
          id,
          label: b.dataset.img ? b.dataset.img.split(".")[0] : `Template ${id}`,
          color: b.dataset.color,
          img: b.dataset.img,
        },
      ]);
      syncUrl();
    });
  });
  optStringRenderBtn.addEventListener("click", () => {
    mgr.setRenderItem((item) => {
      const el = document.createElement("div");
      el.className = "element";
      el.dataset.id = String(item.id);
      el.innerHTML = `<strong>STR: ${item.label}</strong> <span data-remove="${item.id}" style="cursor:pointer; margin-left: 5px;">[x]</span>`;
      return el;
    });
  });
  optDefaultRenderBtn.addEventListener("click", () => {
    mgr.setRenderItem();
  });
  resizer.addEventListener("onLeft", () => syncUrl());
  resizer.addEventListener("onCenter", () => syncUrl());
  destroyBtn.addEventListener("click", () => {
    mgr.destroy();
    section.remove();
  });
  return mgr;
};
const initBtn = document.getElementById("init-btn");
if (initBtn) {
  initBtn.addEventListener("click", () => init());
}
const loadFromUrl = () => {
  const instancesArea = document.getElementById("instances-area");
  if (!instancesArea) return;
  instancesArea.innerHTML = "";
  instanceCounter = 0;
  setNextId(getSafeFreeOffset());
  const urlParams = new URLSearchParams(window.location.search);
  const allIds = urlStateConfig.getAllIds(urlParams);
  if (allIds.length === 0) {
    init(
      [
        { id: 1, label: "Initial 1" },
        { id: 2, label: "Initial 2" },
      ],
      {},
    );
  } else {
    allIds.forEach((id) => {
      const state = urlStateConfig.fromUrl(urlParams, id);
      if (state.selected) {
        state.selected.forEach((item) => {
          const numId = typeof item.id === "number" ? item.id : parseInt(String(item.id), 10);
          if (!isNaN(numId) && numId >= getNextId()) setNextId(numId + 1);
        });
      }
      init(state.selected || [], state);
    });
  }
  updateUrlDisplay();
};
window.addEventListener("popstate", loadFromUrl);
loadFromUrl();
var pageDescription = document.querySelector("#page-description");
pageDescription?.addEventListener("click", () => {
  pageDescription?.remove();
});
