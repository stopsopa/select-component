import React, { useEffect, useMemo, useCallback } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import type { NavigateFunction } from "react-router-dom";

import modURLSearchParams from "./modURLSearchParams.ts";

const radioOptions = ["radio1", "radio2", "radio3"] as const;
type RadioOptionType = (typeof radioOptions)[number];
const defaultRadioOption: RadioOptionType = radioOptions[0];

const selectOptions = ["item1", "item2", "item3", "item4"] as const;
type SingleOptionType = (typeof selectOptions)[number];

type MultiSelectOptionsArray = SingleOptionType[];

const { useQueryParams, separateIndexedSearchParams } = modURLSearchParams(
  {
    text: {
      default: "",
      getParam: "t",
      encode: (value) => value,
      decode: (value) => value,
    },
    radio: {
      default: defaultRadioOption as RadioOptionType,
      getParam: "r",
      encode: (value) => value,
      decode: (value) => value as RadioOptionType,
    },
    multiSelect: {
      default: [] as MultiSelectOptionsArray,
      getParam: "m",
      encode: (value) => JSON.stringify(value),
      decode: (value) => {
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      },
    },
    checkboxA: {
      default: false,
      getParam: "c1",
      encode: (value) => (value ? "1" : "0"),
      decode: (value) => value === "1",
    },
    checkboxB: {
      default: true,
      getParam: "c2",
      encode: (value) => (value ? "1" : "0"),
      decode: (value) => value === "1",
    },
  },
  (key, i: number | undefined) => (i !== undefined ? `${key}-${i}` : key),
);

export default function UrlSerialiser() {
  const location = useLocation();
  const navigate = useNavigate();

  const list = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const indexes = new Set<number>();
    params.forEach((_, key) => {
      const match = key.match(/-(\d+)$/);
      if (match) {
        indexes.add(parseInt(match[1], 10));
      }
    });
    return Array.from(indexes).sort((a, b) => a - b);
  }, [location.search]);

  /**
   * Process of extracting list is little bit messy but I don't want to add more complexity to modURLSearchParams hook
   */
  const addComponent = useCallback(() => {
    const nextIndex = list.length > 0 ? Math.max(...list) + 1 : 1;

    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set(`t-${nextIndex}`, "");
    navigate({ search: currentParams.toString() }, { replace: true });
  }, [list, navigate]);

  const deleteItem = useCallback(
    (i: number) => {
      // 1. Read live query params
      const nextSearchParams = new URLSearchParams(window.location.search);

      // 2. Find only keys belonging to index i
      const childParams = separateIndexedSearchParams(nextSearchParams, i);
      
      let changed = false;
      childParams.forEach((_, key) => {
        nextSearchParams.delete(key);
        changed = true;
      });

      // 3. Update URL if changed
      if (changed) {
        navigate({ search: nextSearchParams.toString() }, { replace: true });
      }
    },
    [navigate],
  );

  useEffect(() => {
    // create style element and put some styles
    const style = document.createElement("style");
    style.innerHTML = `
.url-ser-container {
    padding: 20px;
    &:not(:last-child){
        border-bottom: 1px solid gray;
    }
}
.url-ser-flex {
    display: flex;
    gap: 40px;
}
.url-ser-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;
    max-width: 400px;
}
.url-ser-input {
    width: 100%;
    padding: 5px;
}
.url-ser-select {
    width: 100%;
    padding: 5px;
    height: 100px;
}
.url-ser-label-margin {
    margin-right: 10px;
}
.url-ser-dump-container {
    flex: 1;
    padding: 20px;
    background: #f5f5f5;
    border-radius: 8px;
}
.url-ser-pre {
    white-space: pre-wrap;
}
.url-ser-delete-btn {
    padding: 8px 12px;
    background-color: #ff4d4f;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    align-self: flex-start;
    &:hover {
        background-color: #ff7875;
    }
}
`;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div>
      <span style={{ padding: "5px" }}></span>
      <a href={window.location.href.split("?")[0]} className="gcp-css">
        off
      </a>
      <span style={{ padding: "5px" }}>|</span>
      <a href="./" className="gcp-css">
        up ..
      </a>
      <span style={{ padding: "5px" }}>|</span>
      <a href="?t-1=aaa&t-3=cccc" className="gcp-css">
        1, 3 example
      </a>
      <hr />
      <button onClick={addComponent}>Add Text Param</button> {list.join(", ")}
      <div>
        {list.map((i) => {
          const search = separateIndexedSearchParams(location.search, i).toString();
          return <Single key={i} i={i} search={search} navigate={navigate} onDelete={() => deleteItem(i)} />;
        })}
      </div>
    </div>
  );
}
/**
 * Another aspect is that we have to wrap with React.memo() becaue parent will rerender
 * on any url change so it will cascade down to children
 *
 * React.memo() work like useMemo() but for components but the props are used as array of dependencies for useMemo()
 */
const Single = React.memo(function Single({
  i,
  search,
  navigate,
  onDelete,
}: {
  i: number;
  search: string;
  navigate: NavigateFunction;
  onDelete: () => void;
}) {
  const { params, updatedURLSearchParams, setParam, setParams } = useQueryParams(search, navigate, i);

  console.log(`render ${i} >${search}<`);

  // setParam("radio", "option2");
  // setParams({
  //   multiSelect: ["item3", "item4"],
  //   radio: "option2",
  // });

  return (
    <div className="url-ser-container">
      <div className="url-ser-flex">
        <form className="url-ser-form">
          <label>
            <strong>Text Input:</strong>
            <br />
            <input
              type="text"
              value={params.text}
              onChange={(e) => {
                console.log(`text ${i} >${e.target.value}<`);
                setParam("text", e.target.value);
              }}
              className="url-ser-input"
            />
          </label>

          <fieldset>
            <legend>
              <strong>Radio Group:</strong>
            </legend>
            {radioOptions.map((opt) => (
              <label key={opt} className="url-ser-label-margin">
                <input
                  type="radio"
                  value={opt}
                  checked={params.radio === opt}
                  onChange={(e) => setParam("radio", e.target.value as RadioOptionType)}
                />
                {opt}
              </label>
            ))}
          </fieldset>

          <label>
            <strong>Multiple Select:</strong>
            <br />
            <select
              multiple
              value={params.multiSelect}
              onChange={(e) =>
                setParam(
                  "multiSelect",
                  Array.from(e.target.selectedOptions, (option) => option.value as SingleOptionType),
                )
              }
              className="url-ser-select"
            >
              {selectOptions.map((l) => {
                return (
                  <option key={l} value={l}>
                    {l}
                  </option>
                );
              })}
            </select>
          </label>

          <fieldset>
            <legend>
              <strong>Checkboxes:</strong>
            </legend>
            <label className="url-ser-label-margin">
              <input
                type="checkbox"
                checked={params.checkboxA}
                onChange={(e) => setParam("checkboxA", e.target.checked)}
              />
              Checkbox A
            </label>
            <label>
              <input
                type="checkbox"
                checked={params.checkboxB}
                onChange={(e) => setParam("checkboxB", e.target.checked)}
              />
              Checkbox B
            </label>
          </fieldset>

          <button type="button" onClick={onDelete} className="url-ser-delete-btn">
            Delete Component #{i}
          </button>
        </form>

        <div className="url-ser-dump-container">
          <pre className="url-ser-pre">
            {JSON.stringify({ params, path: updatedURLSearchParams.toString() }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
});
