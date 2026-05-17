import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { CompositeSelect } from "composite-select/composite-select/react";


import { CompositeSelect as CompositeSelectElement } from "composite-select/composite-select/composite-select";

// import { Card, Button } from "@madooei/react-example-package";
// this will work too thanks to how
// vite-project/node_modules/@madooei/react-example-package/package.json
// is configured
// import { Card } from "@madooei/react-example-package/card";
// import { Button } from "@madooei/react-example-package/button";

import type { PositionType } from "composite-select/container/ContainerManager";

import "composite-select/floating-label-pattern.css";
import "composite-select/composition/selected-section/SelectedSectionManager.css";
import "composite-select/composition/options-section/OptionsSectionManager.css";

import type { Item } from "composite-select/types";

type CustomItem = Item & {
  color: string;
  img: string;
};

import {
  deduplicateArrayById,
  sortById,
  togglePresenceOnTheList,
  markSelectedByIds,
} from "composite-select/composite-select/helpers";

import { searchNames as searchNamesOriginal } from "./namesSource";

function searchNames(name: string | undefined, num: number = 10): CustomItem[] {
  const found = searchNamesOriginal(name, num);
  return found.map((f) => ({
    ...f,
    color: "#4285f4",
    img: "google_drive.png",
  })) as CustomItem[];
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const imgDataJson: Record<string, string[]> = {
  "#f44336": ["gmail.png", "youtube.png"],
  "#4285f4": ["google_drive.png", "google_calendar.png", "google_keep.png"],
  "#0f9d58": ["chatgpt.png", "claude.png", "gemini.png", "perplexity.png"],
  "#ff9800": ["tools.png", "timeanddate.png", "t3chat.png", "ai.png"],
};

let globalIdCounter = 1;

export default function CompositeSelectDemo() {
  const [instances, setInstances] = useState<number[]>([]);

  useEffect(() => {
    // Initial instance
    if (instances.length === 0) {
      setInstances([1]);
    }
  }, []);

  const addInstance = () => {
    setInstances((prev) => [...prev, (prev[prev.length - 1] || 0) + 1]);
  };

  const removeInstance = (id: number) => {
    setInstances((prev) => prev.filter((i) => i !== id));
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <Link to="/" style={{ marginRight: "15px" }} className="gcp-css">
        &larr; Back to Home
      </Link>
      <button onClick={addInstance} className="gcp-css">
        Initialize New Instance
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: "30px", marginTop: "20px" }}>
        {instances.map((id) => (
          <DemoInstance key={id} id={id} onRemove={() => removeInstance(id)} />
        ))}
      </div>
      <hr />

      {/* <Card title="">
        <p>This is a card component from the example package.</p>
        <Button onClick={() => alert("Hello!")}>Click me!</Button>
      </Card>
      <Card title="Card with close button">
        <button>Close</button>
      </Card>
      <Card title="fsdfds">test</Card> */}
    </div>
  );
}

function DemoInstance({ id, onRemove }: { id: number; onRemove: () => void }) {
  const csRef = useRef<CompositeSelectElement<CustomItem>>(null);

  // Simple state flags handled via props
  const [disabledSel, setDisabledSel] = useState(false);
  const [loadingSel, setLoadingSel] = useState(false);
  const [errorSel, setErrorSel] = useState(false);
  const [showInputSel, setShowInputSel] = useState(true);
  const [showDeleteSel, setShowDeleteSel] = useState(true);
  const [labelSel, setLabelSel] = useState("Select Fruit");

  const [disabledOpt, setDisabledOpt] = useState(false);
  const [loadingOpt, setLoadingOpt] = useState(false);
  const [showFilter, setShowFilter] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const [labelOpt, setLabelOpt] = useState("Search fruits...");
  const [position, setPosition] = useState<PositionType>("cover-bottom");
  const [selectedValue, setSelectedValue] = useState("");
  const [onChangeCount, setOnChangeCount] = useState(0);
  const [onFocusCount, setOnFocusCount] = useState(0);
  const [onDeleteCount, setOnDeleteCount] = useState(0);
  const [onClearCount, setOnClearCount] = useState(0);
  const [onInputChangeCount, setOnInputChangeCount] = useState(0);
  const [onOkCount, setOnOkCount] = useState(0);
  const [onCancelCount, setOnCancelCount] = useState(0);
  const [onItemPickCount, setOnItemPickCount] = useState(0);
  const [onCloseCount, setOnCloseCount] = useState(0);

  // Local arrays and values
  const [selectedItems, setSelectedItems] = useState<CustomItem[]>([]);
  const [options, setOptions] = useState<CustomItem[]>([]);
  const [optionsValue, setOptionsValue] = useState("");
  const [buffItems, setBuffItems] = useState<CustomItem[]>([]);

  const getManager = () => csRef.current?.getManager();

  const fetchOptions = async (search: string, currentBuff: CustomItem[] = buffItems) => {
    setLoadingOpt(true);
    setDisabledOpt(true);
    setLoadingSel(true);
    setDisabledSel(true);

    await delay(500);

    const found = deduplicateArrayById<CustomItem>(searchNames(search));
    const opts = markSelectedByIds(found, currentBuff.map(i => i.id)) as CustomItem[];
    setOptions(sortById(opts) as CustomItem[]);

    setDisabledOpt(false);
    setLoadingOpt(false);
    setDisabledSel(false);
    setLoadingSel(false);
  };

  useEffect(() => {
    fetchOptions("", buffItems);
  }, []);

  const updateCheckmarks = (currentSelected: CustomItem[]) => {
    setOptions((prevOptions) => markSelectedByIds(prevOptions, currentSelected.map(i => i.id)) as CustomItem[]);
  };

  function localDetermineSearch(): { search: string; popupInput: boolean } {
    if (!showFilter && position === "bottom") {
      return { search: "", popupInput: false }; 
    }
    return { search: optionsValue, popupInput: true };
  }

  // Event handlers as props
  const handleSelectedItemsChanged = (opts: any) => {
    if (opts.disabled !== undefined) setDisabledSel(!!opts.disabled);
    if (opts.loading !== undefined) setLoadingSel(!!opts.loading);
    if (opts.error !== undefined) setErrorSel(!!opts.error);
    if (opts.showInput !== undefined) setShowInputSel(opts.showInput !== false);
    if (opts.label !== undefined) setLabelSel(opts.label || "");
  };

  const handleOptionsChanged = (opts: any) => {
    if (opts.showFilter !== undefined) setShowFilter(!!opts.showFilter);
    if (opts.showFooter !== undefined) setShowFooter(!!opts.showFooter);
    if (opts.disabled !== undefined) setDisabledOpt(!!opts.disabled);
    if (opts.loading !== undefined) setLoadingOpt(!!opts.loading);
    if (opts.label !== undefined) setLabelOpt(opts.label || "");
  };

  const handleChangeValue = async (detail: { originalEvent: Event; value: string; key: string; previousValue?: string }) => {
    const val = detail.value;
    setSelectedValue(val || "");
    setOnChangeCount((prev) => prev + 1);

    const { popupInput } = localDetermineSearch();
    const search = popupInput ? optionsValue : val;

    if (!popupInput && detail.originalEvent.type === "keydown") {
      if (detail.key === "Backspace" && val === "" && selectedItems.length > 0) {
        const newBuff = [...selectedItems];
        newBuff.pop();
        setBuffItems(newBuff);
        setSelectedItems(newBuff);
        updateCheckmarks(newBuff);
        return;
      }
    }

    if (!popupInput) setOptionsValue(search);
    await fetchOptions(search, buffItems);

    if (!popupInput) getManager()?.selected.setFocus();
  };

  const handleFocus = () => {
    setOnFocusCount((prev) => prev + 1);
    setBuffItems([...selectedItems]);

    updateCheckmarks(selectedItems);
    
    setShowDeleteSel(false);
    getManager()?.options.setFocus();
  };

  const handleDelete = (id: string) => {
    setOnDeleteCount((prev) => prev + 1);
    const newSelected = selectedItems.filter((i) => String(i.id) !== String(id));
    setBuffItems(newSelected);
    setSelectedItems(newSelected);
    updateCheckmarks(newSelected);
  };

  const handleClear = () => {
    setOnClearCount((prev) => prev + 1);
    if (!confirm("Are you sure?")) return;
    setBuffItems([]);
    setSelectedItems([]);
    updateCheckmarks([]);
  };

  const handleInputChange = async (detail: { originalEvent: Event; value: string; previousValue?: string }) => {
    setOnInputChangeCount((prev) => prev + 1);
    const search = detail.value || "";
    setOptionsValue(search);
    await fetchOptions(search, buffItems);
  };

  const handleOk = () => {
    setOnOkCount((prev) => prev + 1);
    setSelectedItems(buffItems);
    getManager()?.container.hide();
  };

  const handleCancel = () => {
    setOnCancelCount((prev) => prev + 1);
    getManager()?.container.hide();
  };

  const handleClose = () => {
    setOnCloseCount((prev) => prev + 1);
    setShowDeleteSel(true);
  };

  const handlePick = (item: CustomItem) => {
    setOnItemPickCount((prev) => prev + 1);
    const newBuff = togglePresenceOnTheList(buffItems, item) as CustomItem[];
    setBuffItems(newBuff);

    if (showFooter) {
      updateCheckmarks(newBuff);
    } else {
      setSelectedItems(newBuff);
      getManager()?.container.hide();
      setShowDeleteSel(true);
    }
  };

  const addTemplate = (color: string, img: string) => {
    const newItem: CustomItem = {
      id: globalIdCounter++,
      label: img.split(".")[0],
      color,
      img,
    };
    setSelectedItems([...selectedItems, newItem]);
    updateCheckmarks([...selectedItems, newItem]);
  };

  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
        border: "1px solid #ddd",
        position: "relative",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Instance #{id}</h2>
      <button onClick={onRemove} className="gcp-css" style={{ position: "absolute", top: "20px", right: "20px" }}>
        Destroy
      </button>

      <div style={{ padding: "20px", background: "#fafafa", border: "1px dashed #ccc", marginBottom: "20px" }}>
        <CompositeSelect<CustomItem>
          ref={csRef}
          selected-selected={selectedItems}
          selected-value={selectedValue}
          selected-label={labelSel}
          selected-disabled={disabledSel}
          selected-loading={loadingSel}
          selected-error={errorSel}
          selected-show-input={showInputSel}
          selected-show-delete={showDeleteSel}
          selected-onFocus={handleFocus}
          selected-onDelete={handleDelete}
          selected-onInputChange={handleChangeValue}
          selected-onClear={handleClear}
          selected-onChange={(selected) => console.log("onChange: ", selected)}
          selected-onComponentChange={handleSelectedItemsChanged}
          
          options-options={options}
          options-value={optionsValue}
          options-label={labelOpt}
          options-max-height="300px"
          options-show-footer={showFooter}
          options-show-filter={showFilter}
          options-disabled={disabledOpt}
          options-loading={loadingOpt}
          options-onItemPick={handlePick}
          options-onInputChange={handleInputChange}
          options-onOk={handleOk}
          options-onCancel={handleCancel}
          options-onComponentChange={handleOptionsChanged}
          
          container-onClose={handleClose}
          container-position={position}
        ></CompositeSelect>
      </div>

      <div style={{ marginBottom: "15px", fontSize: "14px" }}>
        <strong>Input Value:</strong>{" "}
        <pre
          style={{
            display: "inline",
            background: "#eee",
            padding: "2px 5px",
            margin: "0",
            width: "auto",
            maxHeight: "none",
          }}
        >
          {selectedValue || "-"}
        </pre>
        (onChange: <span style={{ fontWeight: "bold" }}>{onChangeCount}</span>, onFocus:{" "}
        <span style={{ fontWeight: "bold" }}>{onFocusCount}</span>, onDelete:{" "}
        <span style={{ fontWeight: "bold" }}>{onDeleteCount}</span>, onClear:{" "}
        <span style={{ fontWeight: "bold" }}>{onClearCount}</span>, onInputChange:{" "}
        <span style={{ fontWeight: "bold" }}>{onInputChangeCount}</span>, onOk:{" "}
        <span style={{ fontWeight: "bold" }}>{onOkCount}</span>, onCancel:{" "}
        <span style={{ fontWeight: "bold" }}>{onCancelCount}</span>, onItemPick:{" "}
        <span style={{ fontWeight: "bold" }}>{onItemPickCount}</span>, onClose:{" "}
        <span style={{ fontWeight: "bold" }}>{onCloseCount}</span>)
      </div>

      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
          {Object.entries(imgDataJson as Record<string, string[]>).map(([color, images]) =>
            images.map((img) => (
              <button
                key={img}
                className="gcp-css white"
                onClick={() => addTemplate(color, img)}
                style={{ color, padding: "4px 8px" }}
              >
                {img}
              </button>
            )),
          )}
        </div>
      </div>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          className="gcp-css"
          onClick={() => {
            getManager()?.selected.setRenderItem(function (item: CustomItem) {
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
                img.src = `/img/${item.img}`;
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
          }}
        >
          Set Custom Render Item
        </button>
        <button
          className="gcp-css"
          onClick={() => {
            getManager()?.selected.setRenderList(function (selected: CustomItem[], defaultRenderList: any) {
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
          }}
        >
          Set Custom Render List
        </button>
        <button
          className="gcp-css"
          onClick={() => {
            getManager()?.selected.setRenderItem();
            getManager()?.selected.setRenderList();
          }}
        >
          Reset Templates
        </button>
      </div>
      <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          <span style={{ minWidth: "120px" }}>
            🔍 <strong>Input & List</strong>:
          </span>
          <button
            className="gcp-css"
            onClick={() => {
              getManager()?.container.show();
              getManager()?.options.setFocus();
            }}
          >
            Focus Input
          </button>
          <button
            className="gcp-css"
            onClick={() => {
              const id = Math.floor(Math.random() * 100000);
              const newOpts = [...options, { id: id, label: "Dynamic Option " + id, color: "#999", img: "" } as CustomItem];
              setOptions(newOpts);
            }}
          >
            Add Random Option
          </button>
          <button
            className="gcp-css"
            onClick={() => {
              setOptions([]);
              setBuffItems([]);
            }}
          >
            Clear Options
          </button>
        </div>

        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          <span style={{ minWidth: "120px" }}>
            🎨 <strong>Render</strong>:
          </span>
          <button
            className="gcp-css"
            onClick={() => {
              getManager()?.options.setRenderItem((item: Item) => {
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
            }}
          >
            Set Custom Render
          </button>
          <button
            className="gcp-css"
            onClick={() => {
              getManager()?.options.setRenderItem(
                (item: Item) => `
                <div class="element" data-id="${item.id}" style="border: 1px solid #ccc; margin: 2px; border-radius: 20px; padding: 5px 15px; background: ${item.selected ? "#e8f5e9" : "white"}; color: ${item.selected ? "#2e7d32" : "#333"};">
                  <span style="font-size: 1.2em; vertical-align: middle;">${item.selected ? "✅" : "⬜"}</span>
                  <strong style="margin-left: 10px;">${item.label}</strong>
                  <small style="margin-left: auto; opacity: 0.5;">#${item.id}</small>
                </div>
              `,
              );
            }}
          >
            Set String Render
          </button>
          <button className="gcp-css" onClick={() => getManager()?.options.setRenderItem()}>
            Set Default Render
          </button>
          <button
            className="gcp-css"
            onClick={() => {
              getManager()?.options.setRenderEmpty(
                () =>
                  `<div style="padding: 40px; text-align: center; color: #ff5252; font-weight: bold; border: 2px dashed #ff5252; border-radius: 8px;">⚠️ Custom Empty State!</div>`,
              );
            }}
          >
            Set Custom Empty
          </button>
          <button className="gcp-css" onClick={() => getManager()?.options.setRenderEmpty()}>
            Set Default Empty
          </button>
        </div>

        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          <span style={{ minWidth: "120px" }}>
            ⌨️ <strong>Focus & Events</strong>:
          </span>
          <button className="gcp-css" onClick={() => getManager()?.selected.setFocus()}>
            Focus
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "20px", fontSize: "14px" }}>
        <div style={{ flex: 1, minWidth: "300px", borderRight: "1px solid #eee", paddingRight: "20px" }}>
          <h4 style={{ marginTop: 0 }}>SelectedSection (Top)</h4>
          <label>
            <input type="checkbox" checked={disabledSel} onChange={(e) => setDisabledSel(e.target.checked)} /> Disabled
          </label>
          <br />
          <label>
            <input type="checkbox" checked={loadingSel} onChange={(e) => setLoadingSel(e.target.checked)} /> Loading
          </label>
          <br />
          <label>
            <input type="checkbox" checked={errorSel} onChange={(e) => setErrorSel(e.target.checked)} /> Error
          </label>
          <br />
          <label>
            <input type="checkbox" checked={showInputSel} onChange={(e) => setShowInputSel(e.target.checked)} /> Show
            Input
          </label>
          <br />
          <label>
            Label: <input value={labelSel} onChange={(e) => setLabelSel(e.target.value)} />
          </label>
        </div>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <h4 style={{ marginTop: 0 }}>OptionsSection (Dropdown)</h4>
          <label>
            <input type="checkbox" checked={disabledOpt} onChange={(e) => setDisabledOpt(e.target.checked)} /> Disabled
          </label>
          <br />
          <label>
            <input type="checkbox" checked={loadingOpt} onChange={(e) => setLoadingOpt(e.target.checked)} /> Loading
          </label>
          <br />
          <label>
            <input type="checkbox" checked={showFilter} onChange={(e) => setShowFilter(e.target.checked)} /> Show Filter
          </label>
          <br />
          <label>
            <input type="checkbox" checked={showFooter} onChange={(e) => setShowFooter(e.target.checked)} /> Show Footer
          </label>
          <br />
          <label>
            Position:
            <select value={position} onChange={(e) => setPosition(e.target.value as PositionType)}>
              <option value="cover-bottom">cover-bottom</option>
              <option value="bottom">bottom</option>
              <option value="top">top</option>
              <option value="left">left</option>
              <option value="right">right</option>
            </select>
          </label>
          <br />
          <label>
            Label: <input value={labelOpt} onChange={(e) => setLabelOpt(e.target.value)} />
          </label>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <pre style={{ background: "#f8f8f8", padding: "10px", fontSize: "12px", border: "1px solid #eee" }}>
          {JSON.stringify(selectedItems, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <strong>Options State Dump:</strong>
        <pre
          style={{
            background: "#f8f8f8",
            padding: "10px",
            fontSize: "12px",
            border: "1px solid #eee",
            maxHeight: "300px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(options, null, 2)}
        </pre>
      </div>
    </div>
  );
}
