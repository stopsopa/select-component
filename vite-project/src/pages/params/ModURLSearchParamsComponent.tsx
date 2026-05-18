import React, { useEffect, useState } from "react";

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
  const [list, setList] = useState<number[]>([]);

  const location = useLocation();

  /**
   * Important part:
   * navigate have to be injected from parent to Single() react component (the child)
   * else it will cause multiple re-render
   */
  const navigate = useNavigate();

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
`;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div>
      <h5>UrlSerialiser Demo Form</h5>
      <a href={window.location.href.split("?")[0]} className="gcp-css">
        off
      </a>
      |
      <a href="./" className="gcp-css">
        up ..
      </a>
      <hr />
      <button
        onClick={() => {
          setList((prev) => [...prev, prev.length + 1]);
        }}
      >
        Add Text Param
      </button>
      <div>
        {list.map((i) => {
          const search = separateIndexedSearchParams(location.search, i).toString();
          return <Single key={i} i={i} search={search} navigate={navigate} />;
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
}: {
  i: number;
  search: string;
  navigate: NavigateFunction;
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
