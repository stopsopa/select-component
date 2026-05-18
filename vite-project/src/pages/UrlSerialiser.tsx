import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  predefinedUseUrlString,
  predefinedUseUrlBoolean,
  predefinedUseUrlStringArray
} from "./useUrlGet";

export default function UrlSerialiser() {
  const [searchParams] = useSearchParams();

  const page = searchParams.get("page");
  const filter = searchParams.get("filter");

  const [text, setText] = predefinedUseUrlString("t", "");
  const [radio, setRadio] = predefinedUseUrlString("r", "option1");
  const [multiSelect, setMultiSelect] = predefinedUseUrlStringArray("m", []);
  const [checkboxA, setCheckboxA] = predefinedUseUrlBoolean("ca", false);
  const [checkboxB, setCheckboxB] = predefinedUseUrlBoolean("cb", true);

  console.log('render', {
    text,
    radio,
    multiSelect,
    checkboxA,
    checkboxB,
  })

  useEffect(() => {
    // create style element and put some styles
    const style = document.createElement("style");
    style.innerHTML = `
    .url-ser-container {
        padding: 20px;
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
    <div className="url-ser-container">
      <h5>UrlSerialiser Demo Form</h5>
      <a href={window.location.href.split("?")[0]} className="gcp-css">
        off
      </a>
      |
      <a href="./" className="gcp-css">
        up ..
      </a>
      <hr />
      <div className="url-ser-flex">
        <form className="url-ser-form">
          <label>
            <strong>Text Input:</strong>
            <br />
            <input
              type="text"
              value={text}
              onChange={(e) => {
                console.log(`setText("${e.target.value}")`);
                setText(e.target.value);
              }}
              className="url-ser-input"
            />
          </label>

          <fieldset>
            <legend>
              <strong>Radio Group:</strong>
            </legend>
            {["option1", "option2", "option3"].map((opt) => (
              <label key={opt} className="url-ser-label-margin">
                <input
                  type="radio"
                  value={opt}
                  checked={radio === opt}
                  onChange={(e) => setRadio(e.target.value)}
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
              value={multiSelect}
              onChange={(e) =>
                setMultiSelect(
                  Array.from(e.target.selectedOptions, (option) => option.value),
                )
              }
              className="url-ser-select"
            >
              <option value="item1">Item 1</option>
              <option value="item2">Item 2</option>
              <option value="item3">Item 3</option>
              <option value="item4">Item 4</option>
            </select>
          </label>

          <fieldset>
            <legend>
              <strong>Checkboxes:</strong>
            </legend>
            <label className="url-ser-label-margin">
              <input
                type="checkbox"
                checked={checkboxA}
                onChange={(e) => setCheckboxA(e.target.checked)}
              />
              Checkbox A
            </label>
            <label>
              <input
                type="checkbox"
                checked={checkboxB}
                onChange={(e) => setCheckboxB(e.target.checked)}
              />
              Checkbox B
            </label>
          </fieldset>
        </form>

        <div className="url-ser-dump-container">
          <strong>State Dump:</strong>
          <pre className="url-ser-pre">
            {JSON.stringify({ url: { page, filter }, hook: { text, radio, multiSelect, checkboxA, checkboxB } }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
