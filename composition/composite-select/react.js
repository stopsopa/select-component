// @ts-ignore
import React from "react";
import "./composite-select.js";
export const CompositeSelect = React.forwardRef((props, ref) => {
  const {
    "selected-selected": selectedSelected,
    "selected-show-input": selectedShowInput,
    "selected-value": selectedValue,
    "selected-label": selectedLabel,
    "selected-disabled": selectedDisabled,
    "selected-error": selectedError,
    "selected-loading": selectedLoading,
    "selected-show-delete": selectedShowDelete,
    "selected-onDelete": selectedOnDelete,
    "selected-onClear": selectedOnClear,
    "selected-onInputChange": selectedOnChangeValue,
    "selected-onFocus": selectedOnFocus,
    "selected-onChange": selectedOnChange,
    "selected-onComponentChange": selectedOnSelectedItemsChanged,
    "options-options": optionsOptions,
    "options-loading": optionsLoading,
    "options-value": optionsValue,
    "options-label": optionsLabel,
    "options-disabled": optionsDisabled,
    "options-max-height": optionsMaxHeight,
    "options-show-footer": optionsShowFooter,
    "options-show-filter": optionsFilter,
    "options-onItemPick": optionsOnItemPick,
    "options-onInputChange": optionsOnInputChange,
    "options-onCancel": optionsOnCancel,
    "options-onOk": optionsOnOk,
    "options-onHighlightChange": optionsOnHighlightChange,
    "options-onClear": optionsOnClear,
    "options-onComponentChange": optionsOnOptionsChanged,
    "container-position": containerPosition,
    "container-offset": containerOffset,
    "container-onClose": containerOnClose,
    children,
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
    if (el && el.getManager && el.getManager()) {
      const mgr = el.getManager();
      const unbinds = [];
      // SelectedSection events
      const selSub = mgr.selected.getSubscriber();
      if (selSub) {
        if (selectedOnDelete) {
          unbinds.push(selSub.bind("onDelete", (id) => selectedOnDelete(id)));
        }
        if (selectedOnClear) {
          unbinds.push(selSub.bind("onClear", () => selectedOnClear()));
        }
        if (selectedOnChangeValue) {
          unbinds.push(
            selSub.bind("onInputChange", (e, previousValue) =>
              selectedOnChangeValue({
                originalEvent: e,
                value: e.target.value,
                key: e.key,
                previousValue,
              }),
            ),
          );
        }
        if (selectedOnFocus) {
          unbinds.push(selSub.bind("onFocus", (e) => selectedOnFocus({ originalEvent: e })));
        }
        if (selectedOnChange) {
          unbinds.push(selSub.bind("onChange", (selected) => selectedOnChange(selected)));
        }
        if (selectedOnSelectedItemsChanged) {
          unbinds.push(selSub.bind("onComponentChange", (options) => selectedOnSelectedItemsChanged(options)));
        }
      }
      // OptionsSection events
      const optSub = mgr.options.getSubscriber();
      if (optSub) {
        if (optionsOnItemPick) {
          unbinds.push(optSub.bind("onItemPick", (item) => optionsOnItemPick(item)));
        }
        if (optionsOnInputChange) {
          unbinds.push(
            optSub.bind("onInputChange", (e, previousValue) =>
              optionsOnInputChange({
                originalEvent: e,
                value: e.target.value,
                previousValue,
              }),
            ),
          );
        }
        if (optionsOnCancel) {
          unbinds.push(optSub.bind("onCancel", () => optionsOnCancel()));
        }
        if (optionsOnOk) {
          unbinds.push(optSub.bind("onOk", () => optionsOnOk()));
        }
        if (optionsOnHighlightChange) {
          unbinds.push(optSub.bind("onHighlightChange", (id) => optionsOnHighlightChange(id)));
        }
        if (optionsOnClear) {
          unbinds.push(optSub.bind("onClear", () => optionsOnClear()));
        }
        if (optionsOnOptionsChanged) {
          unbinds.push(optSub.bind("onComponentChange", (options) => optionsOnOptionsChanged(options)));
        }
      }
      // Container events
      const conSub = mgr.container.getSubscriber();
      if (conSub) {
        if (containerOnClose) {
          unbinds.push(conSub.bind("onClose", () => containerOnClose()));
        }
      }
      return () => {
        unbinds.forEach((u) => u());
      };
    }
  }, [
    selectedOnDelete,
    selectedOnClear,
    selectedOnChangeValue,
    selectedOnFocus,
    selectedOnChange,
    selectedOnSelectedItemsChanged,
    optionsOnItemPick,
    optionsOnInputChange,
    optionsOnCancel,
    optionsOnOk,
    optionsOnHighlightChange,
    optionsOnClear,
    optionsOnOptionsChanged,
    containerOnClose,
  ]);
  React.useLayoutEffect(() => {
    const el = internalRef.current;
    if (el && el.getManager && el.getManager()) {
      if (selectedSelected !== undefined) {
        el.getManager().selected.setSelected(
          typeof selectedSelected === "string" ? JSON.parse(selectedSelected) : selectedSelected,
        );
      }
      if (optionsOptions !== undefined) {
        el.getManager().options.setOptions(
          typeof optionsOptions === "string" ? JSON.parse(optionsOptions) : optionsOptions,
        );
      }
    }
  }, [selectedSelected, optionsOptions]);
  const wcProps = { ...rest, ref: setRef };
  // Map selected-* attributes
  if (String(selectedShowInput) === "true") {
    wcProps["selected-show-input"] = "true";
  } else {
    delete wcProps["selected-show-input"];
  }
  if (selectedValue !== undefined) wcProps["selected-value"] = selectedValue;
  if (selectedLabel !== undefined) wcProps["selected-label"] = selectedLabel;
  if (String(selectedDisabled) === "true") {
    wcProps["selected-disabled"] = "true";
  } else {
    delete wcProps["selected-disabled"];
  }
  if (String(selectedError) === "true") {
    wcProps["selected-error"] = "true";
  } else {
    delete wcProps["selected-error"];
  }
  if (String(selectedLoading) === "true") {
    wcProps["selected-loading"] = "true";
  } else {
    delete wcProps["selected-loading"];
  }
  if (String(selectedShowDelete) === "true") {
    wcProps["selected-show-delete"] = "true";
  } else {
    delete wcProps["selected-show-delete"];
  }
  // Map options-* attributes
  if (String(optionsLoading) === "true") {
    wcProps["options-loading"] = "true";
  } else {
    delete wcProps["options-loading"];
  }
  if (optionsValue !== undefined) wcProps["options-value"] = optionsValue;
  if (optionsLabel !== undefined) wcProps["options-label"] = optionsLabel;
  if (String(optionsDisabled) === "true") {
    wcProps["options-disabled"] = "true";
  } else {
    delete wcProps["options-disabled"];
  }
  if (optionsMaxHeight !== undefined) wcProps["options-max-height"] = optionsMaxHeight;
  if (String(optionsShowFooter) === "true") {
    wcProps["options-show-footer"] = "true";
  } else {
    delete wcProps["options-show-footer"];
  }
  if (String(optionsFilter) === "true") {
    wcProps["options-show-filter"] = "true";
  } else {
    delete wcProps["options-show-filter"];
  }
  // Map container-* attributes
  if (containerPosition !== undefined) wcProps["container-position"] = containerPosition;
  if (containerOffset !== undefined) wcProps["container-offset"] = containerOffset;
  return React.createElement("composite-select", wcProps, children);
});
export default CompositeSelect;
