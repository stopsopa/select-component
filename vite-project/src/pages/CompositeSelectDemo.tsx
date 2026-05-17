import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { CompositeSelect } from "composite-select/composite-select/react";
import type { CompositeManager } from "composite-select";
import { predefinedUseUrlStringArray, predefinedUseUrlBoolean } from "./useUrlGet";

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
      <span style={{ padding: "0 10px" }}>|</span>
      <a href={window.location.href.split("?")[0]} className="gcp-css">
        off
      </a>
      <span style={{ padding: "0 10px" }}>|</span>
      <a href="./" className="gcp-css">
        up ..
      </a>
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

  const [, setRenderCount] = useState(0);
  const forceRender = () => setRenderCount((x) => x + 1);

  const [onChangeCount, setOnChangeCount] = useState(0);
  const [onFocusCount, setOnFocusCount] = useState(0);
  const [onDeleteCount, setOnDeleteCount] = useState(0);
  const [onClearCount, setOnClearCount] = useState(0);
  const [onInputChangeCount, setOnInputChangeCount] = useState(0);
  const [onOkCount, setOnOkCount] = useState(0);
  const [onCancelCount, setOnCancelCount] = useState(0);
  const [onItemPickCount, setOnItemPickCount] = useState(0);
  const [onCloseCount, setOnCloseCount] = useState(0);

  // Local arrays and selections managed via URL (storing only selected ids)
  const [selectedIds, setSelectedIds] = predefinedUseUrlStringArray(`s-${id}`, []);
  const [options, setOptions] = useState<CustomItem[]>([]);
  const [emptyList, setEmptyList] = predefinedUseUrlBoolean(`empty-${id}`, false);

  // Derive selectedItems by rehydrating the selectedIds (scientists and template items)
  const selectedItems = useMemo(() => {
    const allScientists = searchNames("", Infinity);
    return selectedIds
      .map((idStr) => {
        // If it contains a dot, it's a template item (e.g. "gmail.png")
        if (idStr.includes(".")) {
          let itemColor = "#999";
          for (const [color, imgs] of Object.entries(imgDataJson)) {
            if (imgs.includes(idStr)) {
              itemColor = color;
              break;
            }
          }
          return {
            id: idStr,
            label: idStr.split(".")[0],
            color: itemColor,
            img: idStr,
          } as unknown as CustomItem;
        }
        // Otherwise, it is a scientist
        return allScientists.find((s) => String(s.id) === idStr);
      })
      .filter(Boolean) as CustomItem[];
  }, [selectedIds]);

  const setSelectedItems = useCallback((items: CustomItem[]) => {
    setSelectedIds(items.map((i) => String(i.id)));
  }, [setSelectedIds]);

  const getManager = () => csRef.current?.getManager();

  function localDetermineSearch(mgr: CompositeManager<CustomItem>): { search: string; popupInput: boolean } {
    const setShowFilter = mgr.options.getShowFilter();
    const position = mgr.container.getPosition();
    if (!setShowFilter && position === "bottom") {
      return { search: mgr.selected.getValue() || "", popupInput: false };
    }
    return { search: mgr.options.getValue() || "", popupInput: true };
  }

  const updateCheckmarks = (mgr: CompositeManager<CustomItem>, currentSelected: CustomItem[]) => {
    setOptions(
      (prevOptions) =>
        markSelectedByIds(
          prevOptions,
          currentSelected.map((i) => i.id) as unknown as number[],
        ) as CustomItem[],
    );
  };

  const fetchOptions = async (
    mgr: CompositeManager<CustomItem>,
    search: string,
    currentSelected: CustomItem[] = selectedItems,
    overrideEmptyList?: boolean,
  ) => {
    mgr.options.setLoading(true);
    mgr.options.setDisabled(true);
    mgr.selected.setLoading(true);
    mgr.selected.setDisabled(true);

    await delay(500);

    const isCurrentlyEmpty = overrideEmptyList !== undefined ? overrideEmptyList : emptyList;
    const found = isCurrentlyEmpty ? [] : deduplicateArrayById<CustomItem>(searchNames(search));
    const opts = markSelectedByIds(
      found,
      currentSelected.map((i) => i.id) as unknown as number[],
    ) as CustomItem[];
    setOptions(sortById(opts) as CustomItem[]);

    mgr.options.setDisabled(false);
    mgr.options.setLoading(false);
    mgr.selected.setDisabled(false);
    mgr.selected.setLoading(false);
  };

  const handleEmptyListChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setEmptyList(checked);
    const mgr = getManager();
    if (mgr) {
      const { search } = localDetermineSearch(mgr);
      await fetchOptions(mgr, search, selectedItems, checked);
    }
  };

  useEffect(() => {
    const mgr = getManager();
    if (mgr) {
      const { search } = localDetermineSearch(mgr);
      if (options.length === 0 && !emptyList) {
        fetchOptions(mgr, search, selectedItems);
      }
    }
  }, []);

  useEffect(() => {
    const mgr = getManager();
    if (!mgr) return;

    mgr.selected.propOptions.onComponentChange = () => {};
    mgr.options.propOptions.onComponentChange = () => {};

    const unsubs: (() => void)[] = [];

    unsubs.push(
      mgr.selected.getSubscriber().bind("onInputChange", async (e) => {
        const val = (e.target as HTMLInputElement).value;
        setOnChangeCount((prev) => prev + 1);

        const { search, popupInput } = localDetermineSearch(mgr);

        if (!popupInput && (e as KeyboardEvent).type === "keydown") {
          const key = (e as KeyboardEvent).key;
          if (key === "Backspace" && val === "" && selectedItems.length > 0) {
            const newSelected = [...selectedItems];
            newSelected.pop();
            setSelectedItems(newSelected);
            updateCheckmarks(mgr, newSelected);
            return;
          }
        }

        if (!popupInput) mgr.options.setValue(search);
        await fetchOptions(mgr, search, selectedItems);

        if (!popupInput) mgr.selected.setFocus();
      }),
    );

    unsubs.push(
      mgr.selected.getSubscriber().bind("onFocus", () => {
        setOnFocusCount((prev) => prev + 1);
        const { search } = localDetermineSearch(mgr);
        const selIds = selectedItems.map((i) => i.id);
        const combined = emptyList ? [] : searchNames(search);
        const opts = markSelectedByIds(combined, selIds) as CustomItem[];
        setOptions(sortById(opts) as CustomItem[]);

        mgr.selected.setShowDelete(false);
        mgr.options.setFocus();
      }),
    );

    unsubs.push(
      mgr.selected.getSubscriber().bind("onDelete", (id) => {
        setOnDeleteCount((prev) => prev + 1);
        const newSelected = selectedItems.filter((i) => String(i.id) !== String(id));
        setSelectedItems(newSelected);
        updateCheckmarks(mgr, newSelected);
      }),
    );

    unsubs.push(
      mgr.selected.getSubscriber().bind("onClear", () => {
        setOnClearCount((prev) => prev + 1);
        if (!confirm("Are you sure?")) return;
        setSelectedItems([]);
        setOptions((prevOptions) => markSelectedByIds(prevOptions, []) as CustomItem[]);
      }),
    );

    unsubs.push(
      mgr.options.getSubscriber().bind("onInputChange", async (e) => {
        setOnInputChangeCount((prev) => prev + 1);
        const search = (e.target as HTMLInputElement).value || "";
        await fetchOptions(mgr, search, selectedItems);
      }),
    );

    unsubs.push(
      mgr.options.getSubscriber().bind("onOk", () => {
        setOnOkCount((prev) => prev + 1);
        const combined = deduplicateArrayById([...options, ...selectedItems]);
        const optionsSelected = combined.filter((i) => i.selected);
        setSelectedItems(optionsSelected);
        mgr.container.hide();
      }),
    );

    unsubs.push(
      mgr.options.getSubscriber().bind("onCancel", () => {
        setOnCancelCount((prev) => prev + 1);
        mgr.container.hide();
      }),
    );

    unsubs.push(
      mgr.container.getSubscriber().bind("onClose", () => {
        setOnCloseCount((prev) => prev + 1);
        mgr.selected.setShowDelete(true);
      }),
    );

    unsubs.push(
      mgr.options.getSubscriber().bind("onItemPick", (item) => {
        setOnItemPickCount((prev) => prev + 1);
        if (mgr.options.getShowFooter()) {
          const newOptions = options.map((opt) => {
            if (opt.id === item.id) {
              return { ...opt, selected: !opt.selected };
            }
            return opt;
          });
          setOptions(newOptions);
        } else {
          const selectedToggled = togglePresenceOnTheList(selectedItems, item as CustomItem) as CustomItem[];
          setSelectedItems(selectedToggled);
          mgr.container.hide();
          mgr.selected.setShowDelete(true);
        }
      }),
    );

    return () => unsubs.forEach((unsub) => unsub());
  }, [selectedItems, options, emptyList]);

  const addTemplate = (color: string, img: string) => {
    const newItem: CustomItem = {
      id: img,
      label: img.split(".")[0],
      color,
      img,
    } as unknown as CustomItem;
    const newList = [...selectedItems, newItem];
    setSelectedItems(newList);
    setOptions(
      (prevOptions) =>
        markSelectedByIds(
          prevOptions,
          newList.map((i) => i.id),
        ) as CustomItem[],
    );
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
          options-options={options}
          options-max-height="300px"
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
          {getManager()?.selected.getValue() || "-"}
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
                // Note: images are served from the public directory in Vite
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
            getManager()?.selected.setRenderList(function (selected: CustomItem[], defaultRenderList: (list: CustomItem[]) => HTMLElement[]) {
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
                chunk.forEach((el: HTMLElement) => groupDiv.appendChild(el));
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
            const mgr = getManager();
            if (mgr) {
              mgr.selected.setRenderItem();
              mgr.selected.setRenderList();
            }
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
              const mgr = getManager();
              if (mgr) {
                mgr.container.show();
                mgr.options.setFocus();
              }
            }}
          >
            Focus Input
          </button>

          <div className="gcp-css checkbox-wrapper">
            <div className="checkbox-row">
              <input type="checkbox" id={`empty-list-${id}`} checked={emptyList} onChange={handleEmptyListChange} />
              <div className="content-cell">
                <label htmlFor={`empty-list-${id}`}>Empty list</label>
              </div>
            </div>
          </div>
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
            <input
              type="checkbox"
              checked={getManager()?.selected.getDisabled() || false}
              onChange={(e) => {
                getManager()?.selected.setDisabled(e.target.checked);
                forceRender();
              }}
            />{" "}
            Disabled
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={getManager()?.selected.getLoading() || false}
              onChange={(e) => {
                getManager()?.selected.setLoading(e.target.checked);
                forceRender();
              }}
            />{" "}
            Loading
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={getManager()?.selected.getError() || false}
              onChange={(e) => {
                getManager()?.selected.setError(e.target.checked);
                forceRender();
              }}
            />{" "}
            Error
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={getManager()?.selected.getShowInput() !== false}
              onChange={(e) => {
                getManager()?.selected.setShowInput(e.target.checked);
                forceRender();
              }}
            />{" "}
            Show Input
          </label>
          <br />
          <label>
            Label:{" "}
            <input
              value={getManager()?.selected.getLabel() || ""}
              onChange={(e) => {
                getManager()?.selected.setLabel(e.target.value);
                forceRender();
              }}
            />
          </label>
        </div>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <h4 style={{ marginTop: 0 }}>OptionsSection (Dropdown)</h4>
          <label>
            <input
              type="checkbox"
              checked={getManager()?.options.getDisabled() || false}
              onChange={(e) => {
                getManager()?.options.setDisabled(e.target.checked);
                forceRender();
              }}
            />{" "}
            Disabled
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={getManager()?.options.getLoading() || false}
              onChange={(e) => {
                getManager()?.options.setLoading(e.target.checked);
                forceRender();
              }}
            />{" "}
            Loading
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={getManager()?.options.getShowFilter() || false}
              onChange={(e) => {
                getManager()?.options.setShowFilter(e.target.checked);
                forceRender();
              }}
            />{" "}
            Show Filter
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={getManager()?.options.getShowFooter() || false}
              onChange={(e) => {
                getManager()?.options.setShowFooter(e.target.checked);
                forceRender();
              }}
            />{" "}
            Show Footer
          </label>
          <br />
          <label>
            Position:
            <select
              value={getManager()?.container.getPosition() || "cover-bottom"}
              onChange={(e) => {
                getManager()?.container.setPosition(e.target.value as PositionType);
                forceRender();
              }}
            >
              <option value="cover-bottom">cover-bottom</option>
              <option value="bottom">bottom</option>
              <option value="top">top</option>
              <option value="left">left</option>
              <option value="right">right</option>
            </select>
          </label>
          <br />
          <label>
            Label:{" "}
            <input
              value={getManager()?.options.getLabel() || ""}
              onChange={(e) => {
                getManager()?.options.setLabel(e.target.value);
                forceRender();
              }}
            />
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
