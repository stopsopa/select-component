// @ts-ignore
import React from "react";
import "./options-section.js";
import type { Item } from "../types.js";
import type { InputChangeEvent } from "../types.js";

export type OptionsSectionProps<T extends Item = Item> = {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  key?: React.Key;
  ref?: React.Ref<HTMLElement>;
  options?: T[] | string;
  loading?: boolean;
  value?: string;
  label?: string;
  disabled?: boolean;
  "max-height"?: string;
  "show-footer"?: boolean;
  "show-filter"?: boolean;
  onItemPick?: (item: T) => void;
  onInputChange?: (e: InputChangeEvent, previousValue: string | undefined, origin: string) => void;
  onCancel?: () => void;
  onOk?: () => void;
  onHighlightChange?: (id: string | number | null) => void;
  children?: React.ReactNode;
};

export const OptionsSection = React.forwardRef(
  <T extends Item = Item>(props: OptionsSectionProps<T>, ref: React.ForwardedRef<HTMLElement>) => {
    const {
      options: optionsOptions,
      loading,
      value,
      label,
      disabled,
      "max-height": maxHeight,
      "show-footer": setShowFooter,
      "show-filter": setShowFilter,
      children,
      onItemPick,
      onInputChange,
      onCancel,
      onOk,
      onHighlightChange,
      ...rest
    } = props;

    const internalRef = React.useRef<HTMLElement>(null);

    const setRef = React.useCallback(
      (node: HTMLElement | null) => {
        internalRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLElement | null>).current = node;
        }
      },
      [ref],
    );

    React.useLayoutEffect(() => {
      const el = internalRef.current as any;
      if (el && optionsOptions !== undefined) {
        if (el.getManager && el.getManager()) {
          el.getManager().setOptions(typeof optionsOptions === "string" ? JSON.parse(optionsOptions) : optionsOptions);
        } else {
          el.setAttribute(
            "options",
            typeof optionsOptions === "string" ? optionsOptions : JSON.stringify(optionsOptions),
          );
        }
      }
    }, [optionsOptions]);

    React.useLayoutEffect(() => {
      const el = internalRef.current as any;

      if (el && el.getManager && el.getManager()) {
        const mgr = el.getManager();

        const sub = mgr.getSubscriber();

        if (sub) {
          const unbinds: (() => void)[] = [];

          if (onItemPick) {
            unbinds.push(
              sub.bind("onItemPick", (...args: [T]) => {
                return onItemPick?.(...args);
              }),
            );
          }

          if (onInputChange) {
            unbinds.push(sub.bind("onInputChange", onInputChange));
          }

          if (onCancel) {
            unbinds.push(sub.bind("onCancel", onCancel));
          }

          if (onOk) {
            unbinds.push(sub.bind("onOk", onOk));
          }

          if (onHighlightChange) {
            unbinds.push(sub.bind("onHighlightChange", onHighlightChange));
          }

          return () => {
            unbinds.forEach((u) => u());
          };
        }
      }
    }, [onItemPick, onInputChange, onCancel, onOk, onHighlightChange]);

    const wcProps: Record<string, any> & { ref: React.RefCallback<HTMLElement> } = { ...rest, ref: setRef };

    if (value !== undefined) wcProps.value = value;

    if (label !== undefined) wcProps.label = label;

    if (String(loading) === "true") {
      wcProps.loading = "true";
    } else {
      delete wcProps.loading;
    }

    if (String(disabled) === "true") {
      wcProps.disabled = "true";
    } else {
      delete wcProps.disabled;
    }

    if (maxHeight !== undefined) wcProps["max-height"] = maxHeight;

    if (String(setShowFooter) === "true") {
      wcProps["show-footer"] = "true";
    } else {
      delete wcProps["show-footer"];
    }

    if (String(setShowFilter) === "true") {
      wcProps["show-filter"] = "true";
    } else {
      delete wcProps["show-filter"];
    }

    return React.createElement("options-section", wcProps, children);
  },
) as <T extends Item = Item>(props: OptionsSectionProps<T> & React.RefAttributes<HTMLElement>) => React.ReactElement;

export default OptionsSection;
