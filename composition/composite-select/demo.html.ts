import "../../../js/CenterAndHeightResizer.js";

import { CompositeManager } from "./CompositeManager.js";

import { deduplicateArrayById, sortById, togglePresenceOnTheList, markSelectedByIds } from "./helpers.js";

import type { PositionType } from "../container/ContainerManager.js";

import { searchNames as rawSearchNames, getSafeFreeOffset } from "./namesSource.js";

import debounce from "./debounce.js";

import { urlStateConfig } from "./urlManager.js";
import type { DemoState, DemoItem } from "./urlManager.js";

const reloadLink = document.getElementById("reload-link") as HTMLAnchorElement | null;
if (reloadLink) {
  reloadLink.href = window.location.pathname;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let instanceCounter = 0;
let globalIdCounter = getSafeFreeOffset();

type ImgData = Record<string, string[]>;
const imgData: ImgData = await fetch("../img/img.json").then((r) => r.json());

const updateUrlDisplay = (url: string = window.location.href) => {
  const el = document.getElementById("url-display");
  if (el) el.textContent = url;
};

const init = (initialSelected: DemoItem[] = [], states: Partial<DemoState> = {}) => {
  instanceCounter++;
  const id = instanceCounter;

  const section = document.createElement("div");
  section.className = "demo-section";
  section.innerHTML = `
    <h2>Instance #${id}</h2>
    <button class="gcp-css white destroy-btn" data-role="destroy">Destroy</button>

    <div class="resizer-container">
      <center-and-height-resizer
        data-role="resizer"
        left="${states.left || "100px"}"
        center="${states.center || "600px"}"
        height="${states.height || "auto"}"
        style="padding: 12px;"
      >
        <div data-role="container"></div>
      </center-and-height-resizer>
    </div>

    <div class="controls gcp-css" style="margin-bottom: 8px;">
      <div class="controls-label">SelectedSectionManager (Top Section)</div>

      <div class="gcp-css checkbox-wrapper">
        <div class="checkbox-row">
          <input type="checkbox" id="disabled-sel-${id}" data-role="disabled-sel" ${states.disabledSel ? "checked" : ""}>
          <div class="content-cell"><label for="disabled-sel-${id}">Disabled</label></div>
        </div>
      </div>

      <div class="gcp-css checkbox-wrapper">
        <div class="checkbox-row">
          <input type="checkbox" id="loading-sel-${id}" data-role="loading-sel" ${states.loadingSel ? "checked" : ""}>
          <div class="content-cell"><label for="loading-sel-${id}">Loading</label></div>
        </div>
      </div>

      <div class="gcp-css checkbox-wrapper">
        <div class="checkbox-row">
          <input type="checkbox" id="error-sel-${id}" data-role="error-sel" ${states.errorSel ? "checked" : ""}>
          <div class="content-cell"><label for="error-sel-${id}">Error</label></div>
        </div>
      </div>

      <div class="gcp-css checkbox-wrapper">
        <div class="checkbox-row">
          <input type="checkbox" id="show-input-sel-${id}" data-role="show-input-sel" ${states.showInputSel !== false ? "checked" : ""}>
          <div class="content-cell"><label for="show-input-sel-${id}">Show Input</label></div>
        </div>
      </div>

      <div class="gcp-css input-wrapper">
        <input type="text" id="label-input-sel-${id}" data-role="label-input-sel" placeholder="&nbsp;" value="${states.labelSel || ""}">
        <label for="label-input-sel-${id}">Top Label</label>
        <button class="gcp-css white" data-role="focus-btn" style="margin-left: 5px;">Focus</button>
      </div>
    </div>

    <div class="controls gcp-css">
      <div class="controls-label">OptionsSectionManager (Dropdown Section)</div>

      <div class="gcp-css checkbox-wrapper">
        <div class="checkbox-row">
          <input type="checkbox" id="disabled-opt-${id}" data-role="disabled-opt" ${states.disabledOpt ? "checked" : ""}>
          <div class="content-cell"><label for="disabled-opt-${id}">Disabled</label></div>
        </div>
      </div>

      <div class="gcp-css checkbox-wrapper">
        <div class="checkbox-row">
          <input type="checkbox" id="loading-opt-${id}" data-role="loading-opt" ${states.loadingOpt ? "checked" : ""}>
          <div class="content-cell"><label for="loading-opt-${id}">Loading</label></div>
        </div>
      </div>

      <div class="gcp-css checkbox-wrapper">
        <div class="checkbox-row">
          <input type="checkbox" id="show-filter-opt-${id}" data-role="show-filter-opt" ${states.showFilter !== false ? "checked" : ""}>
          <div class="content-cell"><label for="show-filter-opt-${id}">Show Filter</label></div>
        </div>
      </div>

      <div class="gcp-css checkbox-wrapper">
        <div class="checkbox-row">
          <input type="checkbox" id="show-footer-opt-${id}" data-role="show-footer-opt" ${states.showFooter !== false ? "checked" : ""}>
          <div class="content-cell"><label for="show-footer-opt-${id}">Show Footer</label></div>
        </div>
      </div>

      <div class="input-wrapper">
        <select id="position-${id}" data-role="position" class="gcp-css white" required>
          <option value="cover-bottom">cover-bottom</option>
          <option value="bottom">bottom</option>
          <option value="top">top</option>
          <option value="left">left</option>
          <option value="right">right</option>
        </select>
        <label for="position-${id}">Position</label>
      </div>

      <div class="gcp-css input-wrapper">
        <input type="text" id="label-input-opt-${id}" data-role="label-input-opt" placeholder="&nbsp;" value="${states.labelOpt || ""}">
        <label for="label-input-opt-${id}">Dropdown Label</label>
      </div>

      <div style="display: flex; gap: 5px; align-items: center; width: 100%; margin-top: 10px;">
        <span style="min-width: 120px;">🔍 <strong>Input & List</strong>:</span>
        <button class="gcp-css white" data-role="opt-focus-btn">Focus Input</button>

        <div class="gcp-css checkbox-wrapper">
          <div class="checkbox-row">
            <input type="checkbox" id="empty-list-${id}" data-role="empty-list" ${states.emptyList === true ? "checked" : ""}>
            <div class="content-cell"><label for="empty-list-${id}">Empty list</label></div>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center; width: 100%; margin-top: 10px;">
        <div style="display: flex; gap: 5px; align-items: center;" data-role="mh-presets-container">
            <span style="min-width: 120px;">📏 <strong>Max Height</strong>:</span>
            <div style="display: flex; gap: 2px;">
                <button class="gcp-css white" data-role="maxheight-down" style="padding: 0 8px; min-width: auto;">▼</button>
                <div class="gcp-css input-wrapper" style="max-width: 150px; margin-bottom: 0;">
                    <input type="text" data-role="maxheight-input" id="maxheight-input-${id}" placeholder=" " value="${states.maxHeight || ""}">
                    <label for="maxheight-input-${id}">Max height</label>
                </div>
                <button class="gcp-css white" data-role="maxheight-up" style="padding: 0 8px; min-width: auto;">▲</button>
            </div>
            <button data-role="maxheight-btn" class="gcp-css">Set</button>
            <button class="gcp-css white" data-role="mh-preset" data-value="200px">200px</button>
            <button class="gcp-css white" data-role="mh-preset" data-value="300px">300px</button>
            <button class="gcp-css white" data-role="mh-preset" data-value="400px">400px</button>
            <button class="gcp-css white" data-role="mh-preset" data-value="600px">600px</button>
            <button class="gcp-css white" data-role="mh-preset" data-value="">Reset</button>
        </div>
      </div>

      <div style="display: flex; gap: 5px; align-items: center; width: 100%; margin-top: 10px;">
        <span style="min-width: 120px;">🎨 <strong>Render</strong>:</span>
        <button class="gcp-css white" data-role="opt-render-btn">Set Custom Render</button>
        <button class="gcp-css white" data-role="opt-string-render-btn">Set String Render</button>
        <button class="gcp-css white" data-role="opt-default-render-btn">Set Default Render</button>
        <button class="gcp-css white" data-role="opt-empty-btn">Set Custom Empty</button>
        <button class="gcp-css white" data-role="opt-default-empty-btn">Set Default Empty</button>
      </div>


      <div style="width: 100%; margin-top: 10px;">
        <pre data-role="search-val-out" style="display: inline; padding: 2px 5px; margin: 0; background: #eee; width: auto; max-height: none;">-</pre>
        (onChange triggers: <span data-role="onchange-count" style="font-weight: bold;">0</span>,
        onOk triggers: <span data-role="onok-count" style="font-weight: bold;">0</span>,
        onCancel triggers: <span data-role="oncancel-count" style="font-weight: bold;">0</span>,
        onItemPick triggers: <span data-role="onpick-count" style="font-weight: bold;">0</span>,
        onSelectedComponentChange triggers: <span data-role="on-selected-component-change-count" style="font-weight: bold;">0</span>,
        onOptionsComponentChange triggers: <span data-role="on-options-component-change-count" style="font-weight: bold;">0</span>)
      </div>
    </div>

    <div class="controls gcp-css">
      <div class="controls-label">Templates</div>
      <div data-role="templates-area" style="display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 8px;"></div>
    </div>
    <div class="controls gcp-css" style="margin-bottom: 8px;">
        <button class="white gcp-css" data-role="custom-render-btn">Set Custom Render Item</button>
        <button class="white gcp-css" data-role="custom-list-render-btn">Set Custom Render List</button>
        <button class="white gcp-css" data-role="reset-templates-btn">Reset Templates</button>
    </div>

    <pre data-role="dump" style="background:#f8f8f8;padding:10px;border:1px solid #eee;border-radius:4px;font-size:12px;margin:0;overflow:auto;"></pre>
  `;

  const instancesArea = document.getElementById("instances-area");
  instancesArea?.appendChild(section);

  const templatesArea = section.querySelector('[data-role="templates-area"]');
  if (templatesArea) {
    for (const [color, images] of Object.entries(imgData)) {
      images.forEach((img) => {
        const btn = document.createElement("button");
        btn.className = "template-btn white gcp-css";
        btn.dataset.color = color;
        btn.dataset.img = img;
        btn.style.color = color;
        btn.style.padding = "4px 8px";
        btn.style.margin = "0";
        btn.textContent = img;
        templatesArea.appendChild(btn);
      });
    }
  }

  const container = section.querySelector('[data-role="container"]') as HTMLDivElement;
  const resizer = section.querySelector('[data-role="resizer"]') as HTMLElement;
  const destroyBtn = section.querySelector('[data-role="destroy"]') as HTMLButtonElement;
  const dump = section.querySelector('[data-role="dump"]') as HTMLElement;
  const positionSelect = section.querySelector('[data-role="position"]') as HTMLSelectElement;

  const disabledSelCb = section.querySelector('[data-role="disabled-sel"]') as HTMLInputElement;
  const loadingSelCb = section.querySelector('[data-role="loading-sel"]') as HTMLInputElement;
  const errorSelCb = section.querySelector('[data-role="error-sel"]') as HTMLInputElement;
  const showInputSelCb = section.querySelector('[data-role="show-input-sel"]') as HTMLInputElement;
  const labelInputSel = section.querySelector('[data-role="label-input-sel"]') as HTMLInputElement;
  const emptyListCb = section.querySelector('[data-role="empty-list"]') as HTMLInputElement;
  const focusBtn = section.querySelector('[data-role="focus-btn"]') as HTMLButtonElement;

  const disabledOptCb = section.querySelector('[data-role="disabled-opt"]') as HTMLInputElement;
  const loadingOptCb = section.querySelector('[data-role="loading-opt"]') as HTMLInputElement;
  const setShowFilterOptCb = section.querySelector('[data-role="show-filter-opt"]') as HTMLInputElement;
  const setShowFooterOptCb = section.querySelector('[data-role="show-footer-opt"]') as HTMLInputElement;
  const labelInputOpt = section.querySelector('[data-role="label-input-opt"]') as HTMLInputElement;

  const optFocusBtn = section.querySelector('[data-role="opt-focus-btn"]') as HTMLButtonElement;
  const maxHeightInput = section.querySelector('[data-role="maxheight-input"]') as HTMLInputElement;
  const maxHeightBtn = section.querySelector('[data-role="maxheight-btn"]') as HTMLButtonElement;

  const customRenderBtn = section.querySelector('[data-role="custom-render-btn"]') as HTMLButtonElement;
  const customListRenderBtn = section.querySelector('[data-role="custom-list-render-btn"]') as HTMLButtonElement;
  const resetTemplatesBtn = section.querySelector('[data-role="reset-templates-btn"]') as HTMLButtonElement;

  const optRenderBtn = section.querySelector('[data-role="opt-render-btn"]') as HTMLButtonElement;
  const optStringRenderBtn = section.querySelector('[data-role="opt-string-render-btn"]') as HTMLButtonElement;
  const optDefaultRenderBtn = section.querySelector('[data-role="opt-default-render-btn"]') as HTMLButtonElement;
  const optEmptyBtn = section.querySelector('[data-role="opt-empty-btn"]') as HTMLButtonElement;
  const optDefaultEmptyBtn = section.querySelector('[data-role="opt-default-empty-btn"]') as HTMLButtonElement;

  const searchValOut = section.querySelector('[data-role="search-val-out"]') as HTMLElement;

  const inc = (role: string) => {
    const el = section.querySelector(`[data-role="${role}"]`);
    if (el) {
      el.textContent = String(parseInt(el.textContent || "0", 10) + 1);
    }
  };

  const updateDump = (list: DemoItem[]) => {
    dump.textContent = JSON.stringify(list, null, 2);
  };

  function searchNames(name: string | undefined, num: number = 10): DemoItem[] {
    if (emptyListCb.checked) {
      return [];
    } else {
      return rawSearchNames(name, num);
    }
  }

  const syncUrl = () => {
    const url = new URL(window.location.href);
    urlStateConfig.toUrl(url, id, {
      selected: mgr?.selected.getSelected() ?? [],
      left: resizer.getAttribute("left") || "100px",
      center: resizer.getAttribute("center") || "600px",
      height: resizer.getAttribute("height") || "auto",
      disabledSel: disabledSelCb.checked,
      disabledOpt: disabledOptCb.checked,
      loadingSel: loadingSelCb.checked,
      loadingOpt: loadingOptCb.checked,
      labelSel: labelInputSel.value || "",
      labelOpt: labelInputOpt.value || "",
      errorSel: errorSelCb.checked,
      showInputSel: showInputSelCb.checked,
      showFilter: setShowFilterOptCb.checked,
      showFooter: setShowFooterOptCb.checked,
      position: positionSelect.value as PositionType,
      filter: mgr?.options.getValue() || "",
      selectedValue: mgr?.selected.propOptions.value || "",
      maxHeight: maxHeightInput.value || "",
      emptyList: emptyListCb.checked,
    });
    window.history.replaceState({}, "", url);
    updateUrlDisplay(url.toString());
  };

  function localDetermineSearch(): { search: string; popupInput: boolean } {
    const showFilter = mgr.options.getShowFilter();
    const position = mgr.container.getPosition();
    if (!showFilter && position === "bottom") {
      return { search: mgr.selected.getValue() || "", popupInput: false };
    }
    return { search: mgr.options.getValue() || "", popupInput: true };
  }

  const onChangeEventFactory = (stopPopupInput: boolean) =>
    debounce(async (e: Event, previousValue: string | undefined) => {
      const { search, popupInput } = localDetermineSearch();

      if (popupInput === true) {
        inc("onchange-count");
        searchValOut.textContent = search || "-";
      }

      if (stopPopupInput === popupInput) {
        return;
      }

      const value = (e.target as HTMLInputElement)?.value;

      if (!popupInput && (e as KeyboardEvent).type === "keydown") {
        const key = (e as KeyboardEvent).key;
        if (key === "Backspace" && value === "" && mgr.selected.getSelected().length > 0) {
          const selItems = mgr.selected.getSelected();
          selItems.pop();
          mgr.selected.setSelected(selItems);
          return;
        }
      }

      if (search === previousValue) return;

      mgr.options.setLoading(true);
      mgr.options.setDisabled(true);
      mgr.selected.setLoading(true);
      mgr.selected.setDisabled(true);

      await delay(1000);

      const found = deduplicateArrayById(searchNames(search) as DemoItem[]);
      const sorted = sortById(found);
      mgr.options.setOptions(sorted);

      mgr.options.setDisabled(false);
      mgr.options.setLoading(false);
      mgr.selected.setDisabled(false);
      mgr.selected.setLoading(false);

      syncUrl();
    }, 500);

  const mgr = new CompositeManager<DemoItem>(container, {
    select: {
      selected: initialSelected,
      label: states.labelSel || "Select Fruit",
      disabled: !!states.disabledSel,
      loading: !!states.loadingSel,
      error: !!states.errorSel,
      showInput: states.showInputSel !== false,
      onFocus: (e: FocusEvent) => {
        const { search } = localDetermineSearch();

        const selected = mgr.selected.getSelected();
        const selIds = selected.map((i) => i.id);

        const combined = searchNames(search);

        const options = markSelectedByIds(combined, selIds);

        mgr.options.setOptions(sortById(options));

        mgr.selected.setShowDelete(false);

        mgr.options.setFocus();
      },
      onInputChange: onChangeEventFactory(true),
      onDelete: (id: string | number) => {
        let selected = mgr.selected.getSelected();

        selected = selected.filter((i) => String(i.id) !== String(id));

        mgr.selected.setSelected(selected);

        syncUrl();
      },
      onClear: () => {
        mgr.selected.setSelected([]);
        syncUrl();
      },
      onChange: (items: DemoItem[]) => {
        updateDump(items);
      },
      onComponentChange: (opt, reason) => {
        inc("on-selected-component-change-count");
        disabledSelCb.checked = !!opt.disabled;
        loadingSelCb.checked = !!opt.loading;
        errorSelCb.checked = !!opt.error;
        showInputSelCb.checked = opt.showInput !== false;
        labelInputSel.value = opt.label || "";
      },
    },
    options: {
      label: states.labelOpt || "Search fruits...",
      maxHeight: states.maxHeight || "300px",
      showFilter: !!states.showFilter,
      showFooter: !!states.showFooter,
      disabled: !!states.disabledOpt,
      loading: !!states.loadingOpt,
      value: states.filter || "",
      onInputChange: onChangeEventFactory(false),
      onItemPick: (item: any) => {
        inc("onpick-count");

        if (mgr.options.getShowFooter()) {
          const options = [...mgr.options.getOptions()];

          const found = options.find((opt) => opt.id === item.id)!;

          found.selected = !found.selected;

          mgr.options.setOptions(options);
        } else {
          const selectedToggled = togglePresenceOnTheList(mgr.selected.getSelected(), item);

          mgr.selected.setSelected(selectedToggled);

          mgr.selected.setShowDelete(true);

          mgr.container.hide();
        }

        syncUrl();
      },
      onCancel: () => {
        inc("oncancel-count");
        mgr.container.hide();
      },
      onOk: () => {
        inc("onok-count");

        // this is where we prepare new list for mgr.selected.setSelected(...)
        // by passing options first
        // this way these from options will win
        const options = deduplicateArrayById([...mgr.options.getOptions(), ...mgr.selected.getSelected()]);

        // now we have to just filter out selected
        const optionsSelected = options.filter((i) => i.selected);

        mgr.selected.setSelected(optionsSelected);

        mgr.container.hide();
        syncUrl();
      },
      onComponentChange: (opt, reason) => {
        inc("on-options-component-change-count");
        setShowFilterOptCb.checked = !!opt.showFilter;
        setShowFooterOptCb.checked = !!opt.showFooter;
        disabledOptCb.checked = !!opt.disabled;
        loadingOptCb.checked = !!opt.loading;
        labelInputOpt.value = opt.label || "";
      },
    },
    container: {
      onClose: () => {
        mgr.selected.setShowDelete(true);
      },
    },
  });

  mgr.container.setPosition(states.position || "cover-bottom");

  const { search } = localDetermineSearch();
  mgr.options.setValue(search);
  const found = deduplicateArrayById(searchNames(search) as DemoItem[]);
  mgr.options.setOptions(sortById(found));

  disabledSelCb.addEventListener("change", () => {
    mgr.selected.setDisabled(disabledSelCb.checked);
    syncUrl();
  });

  loadingSelCb.addEventListener("change", () => {
    mgr.selected.setLoading(loadingSelCb.checked);
    syncUrl();
  });

  errorSelCb.addEventListener("change", () => {
    mgr.selected.setError(errorSelCb.checked);
    syncUrl();
  });

  showInputSelCb.addEventListener("change", () => {
    mgr.selected.setShowInput(showInputSelCb.checked);
    syncUrl();
  });

  emptyListCb.addEventListener("change", () => {
    const { search } = localDetermineSearch();
    const found = deduplicateArrayById(searchNames(search) as DemoItem[]);
    mgr.options.setOptions(sortById(found));
    syncUrl();
  });

  labelInputSel.addEventListener("input", () => {
    mgr.selected.setLabel(labelInputSel.value);
    syncUrl();
  });

  disabledOptCb.addEventListener("change", () => {
    mgr.options.setDisabled(disabledOptCb.checked);
    syncUrl();
  });

  loadingOptCb.addEventListener("change", () => {
    mgr.options.setLoading(loadingOptCb.checked);
    syncUrl();
  });

  setShowFilterOptCb.addEventListener("change", () => {
    mgr.options.setShowFilter(setShowFilterOptCb.checked);
    syncUrl();
  });

  setShowFooterOptCb.addEventListener("change", () => {
    mgr.options.setShowFooter(setShowFooterOptCb.checked);
    syncUrl();
  });

  labelInputOpt.addEventListener("input", () => {
    mgr.options.setLabel(labelInputOpt.value);
    syncUrl();
  });

  optFocusBtn.addEventListener("click", () => mgr.selected.setFocus());

  const setMH = (val: string | undefined) => {
    maxHeightInput.value = val || "";
    mgr.options.setMaxHeight(val || "");
    syncUrl();
  };

  maxHeightBtn.addEventListener("click", () => setMH(maxHeightInput.value));

  section.querySelectorAll('[data-role="mh-preset"]').forEach((btn) => {
    btn.addEventListener("click", () => setMH((btn as HTMLElement).dataset.value));
  });

  const stepMH = (delta: number) => {
    let current = parseInt(maxHeightInput.value) || 0;
    current += delta;
    if (current < 0) current = 0;
    setMH(current + "px");
  };

  section.querySelector('[data-role="maxheight-up"]')?.addEventListener("click", () => stepMH(10));
  section.querySelector('[data-role="maxheight-down"]')?.addEventListener("click", () => stepMH(-10));

  positionSelect.value = states.position || "cover-bottom";
  positionSelect.addEventListener("change", () => {
    mgr.container.setPosition(positionSelect.value as PositionType);
    syncUrl();
  });

  resizer.addEventListener("onLeft", () => syncUrl());
  resizer.addEventListener("onCenter", () => syncUrl());
  resizer.addEventListener("onHeight", () => syncUrl());

  destroyBtn.addEventListener("click", () => {
    mgr.destroy();
    section.remove();
  });

  if (templatesArea) {
    templatesArea.querySelectorAll(".template-btn").forEach((btn: any) => {
      btn.addEventListener("click", () => {
        const color = btn.dataset.color;
        const img = btn.dataset.img;
        const newItem = {
          id: globalIdCounter++,
          label: img.split(".")[0],
          color: color,
          img: img,
        } as unknown as DemoItem;

        const selected = deduplicateArrayById([...mgr.selected.getSelected(), newItem]);

        mgr.selected.setSelected(selected);

        console.log("add custom", newItem, "selected after", mgr.selected.getSelected());

        syncUrl();

        updateDump(selected);
      });
    });
  }

  customRenderBtn.addEventListener("click", () => {
    mgr.selected.setRenderItem(function (item: any) {
      const el = document.createElement("div");
      el.className = "element";
      el.dataset.id = String(item.id);
      el.style.border = `2px solid ${item.color || "black"}`;
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.gap = "5px";
      el.style.padding = "5px";
      el.style.background = "#fff";

      if (item.img) {
        const img = document.createElement("img");
        img.src = `../img/${item.img}`;
        img.style.width = "20px";
        img.style.height = "20px";
        img.style.objectFit = "contain";
        el.appendChild(img);
      }

      const label = document.createElement("label");
      label.textContent = item.label;

      const del = document.createElement("div");
      del.dataset.remove = String(item.id);

      el.appendChild(label);
      el.appendChild(del);

      return el;
    });
  });

  customListRenderBtn.addEventListener("click", () => {
    mgr.selected.setRenderList(function (selected, defaultRenderList) {
      const elements = defaultRenderList(selected);
      const groups: HTMLElement[] = [];
      for (let i = 0; i < elements.length; i += 3) {
        const groupDiv = document.createElement("div");
        groupDiv.style.border = "1px solid #1a73e8";
        groupDiv.style.borderRadius = "8px";
        groupDiv.style.padding = "8px";
        groupDiv.style.margin = "4px";
        groupDiv.style.display = "flex";
        groupDiv.style.gap = "8px";
        groupDiv.style.flexWrap = "wrap";
        groupDiv.style.background = "#e8f0fe";
        groupDiv.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
        const chunk = elements.slice(i, i + 3);
        chunk.forEach((el: any) => groupDiv.appendChild(el));
        groups.push(groupDiv);
      }
      return groups;
    });
  });

  resetTemplatesBtn.addEventListener("click", () => {
    mgr.selected.setRenderItem();
    mgr.selected.setRenderList();
  });

  optRenderBtn.addEventListener("click", () => {
    mgr.options.setRenderItem((item) => {
      const el = document.createElement("div");
      el.className = "element";
      el.style.padding = "12px";
      el.style.background = item.selected ? "#fff3e0" : "transparent";
      el.style.color = item.selected ? "#e65100" : "inherit";
      el.dataset.id = String(item.id);

      const icon = document.createElement("span");
      icon.textContent = item.selected ? "🔥 " : "❄️ ";
      icon.style.marginRight = "10px";

      const label = document.createElement("label");
      label.textContent = item.label || "";

      el.appendChild(icon);
      el.appendChild(label);
      return el;
    });
  });

  optStringRenderBtn.addEventListener("click", () => {
    mgr.options.setRenderItem(
      (item) => `
    <div class="element" data-id="${item.id}" style="border: 1px solid #ccc; margin: 2px; border-radius: 20px; padding: 5px 15px; background: ${item.selected ? "#e8f5e9" : "white"}; color: ${item.selected ? "#2e7d32" : "#333"};">
      <span style="font-size: 1.2em; vertical-align: middle;">${item.selected ? "✅" : "⬜"}</span>
      <strong style="margin-left: 10px;">${item.label}</strong>
      <small style="margin-left: auto; opacity: 0.5;">#${item.id}</small>
    </div>
  `,
    );
  });

  optDefaultRenderBtn.addEventListener("click", () => {
    mgr.options.setRenderItem();
  });

  optEmptyBtn.addEventListener("click", () => {
    mgr.options.setRenderEmpty(
      () =>
        `<div style="padding: 40px; text-align: center; color: #ff5252; font-weight: bold; border: 2px dashed #ff5252; border-radius: 8px;">⚠️ Custom Empty State!</div>`,
    );
  });

  optDefaultEmptyBtn.addEventListener("click", () => {
    mgr.options.setRenderEmpty();
  });

  focusBtn.addEventListener("click", () => mgr.selected.setFocus());

  return mgr;
};

const initBtn = document.getElementById("init-btn");
if (initBtn) {
  initBtn.addEventListener("click", () => init());
}

const loadFromUrl = () => {
  const instancesArea = document.getElementById("instances-area");
  if (instancesArea) {
    instancesArea.innerHTML = "";
  }
  instanceCounter = 0;

  const urlParams = new URLSearchParams(window.location.search);
  const allIds = urlStateConfig.getAllIds(urlParams);

  if (allIds.length === 0) {
    // Default state if no URL params
    init([], {});
  } else {
    allIds.forEach((id) => {
      const state = urlStateConfig.fromUrl(urlParams, id);
      const restored = (state.selected || []).map((e) => {
        e.id = parseInt(e.id as unknown as string, 10);

        return e;
      });

      console.log("restored", restored);

      init(restored, state);
    });
  }

  updateUrlDisplay();
};

window.addEventListener("popstate", loadFromUrl);
loadFromUrl();
