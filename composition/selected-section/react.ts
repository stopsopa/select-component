// @ts-ignore
import React from "react";
import "./selected-section.js";
import type { Item } from "../types.js";

export type SelectedSectionProps<T extends Item = Item> = {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  key?: React.Key;
  ref?: React.Ref<HTMLElement>;
  label?: string;
  "show-input"?: boolean;
  value?: string;
  disabled?: boolean;
  error?: boolean;
  loading?: boolean;
  selected?: T[] | string;
  onFocus?: (detail: { originalEvent: FocusEvent }) => void;
  onClear?: () => void;
  onInputChange?: (detail: { originalEvent: Event; value: string; key: string; previousValue?: string }) => void;
  onDelete?: (id: string) => void;
  onChange?: (selected: T[]) => void;
  children?: React.ReactNode;
};

export const SelectedSection = React.forwardRef(
  <T extends Item = Item>(props: SelectedSectionProps<T>, ref: React.ForwardedRef<HTMLElement>) => {
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
      const el = internalRef.current as any;

      if (el && el.getManager && el.getManager()) {
        const mgr = el.getManager();

        const sub = mgr.getSubscriber();

        if (sub) {
          const unbinds: (() => void)[] = [];

          if (onDelete) {
            unbinds.push(sub.bind("onDelete", (id: string) => onDelete!(id)));
          }

          if (onClear) {
            unbinds.push(sub.bind("onClear", () => onClear!()));
          }

          if (onChange) {
            unbinds.push(sub.bind("onChange", (s: T[]) => onChange!(s)));
          }

          if (onInputChange) {
            unbinds.push(
              sub.bind("onInputChange", (e: Event, previousValue: string | undefined) =>
                onInputChange!({
                  originalEvent: e,
                  value: (e.target as HTMLInputElement).value,
                  key: (e as KeyboardEvent).key,
                  previousValue,
                }),
              ),
            );
          }

          if (onFocus) {
            unbinds.push(sub.bind("onFocus", (e: FocusEvent) => onFocus!({ originalEvent: e })));
          }

          return () => {
            unbinds.forEach((u) => u());
          };
        }
      }
    }, [onDelete, onClear, onChange, onInputChange, onFocus]);

    const wcProps: Record<string, any> & { ref: React.RefCallback<HTMLElement> } = { ...rest, ref: setRef };

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
  },
) as <T extends Item = Item>(props: SelectedSectionProps<T> & React.RefAttributes<HTMLElement>) => React.ReactElement;

export default SelectedSection;
