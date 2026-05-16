// @ts-ignore
import React from "react";
import "./selected-section.js";
export const SelectedSection = React.forwardRef((props, ref) => {
  const {
    label,
    "show-input": showInput,
    value,
    disabled,
    error,
    loading,
    selected: selectedSelected,
    children,
    onDelete,
    onClear,
    onChange,
    onInputChange,
    onFocus,
    ...rest
  } = props;
  const internalRef = React.useRef(null);
  const setRef = React.useCallback(
    (node) => {
      internalRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );
  React.useLayoutEffect(() => {
    const el = internalRef.current;
    if (el && selectedSelected !== undefined) {
      if (el.getManager && el.getManager()) {
        el.getManager().setSelected(
          typeof selectedSelected === "string" ? JSON.parse(selectedSelected) : selectedSelected,
        );
      } else {
        el.setAttribute(
          "selected",
          typeof selectedSelected === "string" ? selectedSelected : JSON.stringify(selectedSelected),
        );
      }
    }
  }, [selectedSelected]);
  React.useLayoutEffect(() => {
    const el = internalRef.current;
    if (el && el.getManager && el.getManager()) {
      const mgr = el.getManager();
      const sub = mgr.getSubscriber();
      if (sub) {
        const unbinds = [];
        if (onDelete) {
          unbinds.push(sub.bind("onDelete", (id) => onDelete(id)));
        }
        if (onClear) {
          unbinds.push(sub.bind("onClear", () => onClear()));
        }
        if (onChange) {
          unbinds.push(sub.bind("onChange", (s) => onChange(s)));
        }
        if (onInputChange) {
          unbinds.push(
            sub.bind("onInputChange", (e, previousValue) =>
              onInputChange({
                originalEvent: e,
                value: e.target.value,
                key: e.key || "",
                previousValue,
              }),
            ),
          );
        }
        if (onFocus) {
          unbinds.push(sub.bind("onFocus", (e) => onFocus({ originalEvent: e })));
        }
        return () => {
          unbinds.forEach((u) => u());
        };
      }
    }
  }, [onDelete, onClear, onChange, onInputChange, onFocus]);
  const wcProps = { ...rest, ref: setRef };
  if (label !== undefined) wcProps.label = label;
  if (value !== undefined) wcProps.value = value;
  if (String(showInput) === "true") {
    wcProps["show-input"] = "true";
  } else {
    delete wcProps["show-input"];
  }
  if (String(disabled) === "true") {
    wcProps.disabled = "true";
  } else {
    delete wcProps.disabled;
  }
  if (String(error) === "true") {
    wcProps.error = "true";
  } else {
    delete wcProps.error;
  }
  if (String(loading) === "true") {
    wcProps.loading = "true";
  } else {
    delete wcProps.loading;
  }
  return React.createElement("selected-section", wcProps, children);
});
export default SelectedSection;
