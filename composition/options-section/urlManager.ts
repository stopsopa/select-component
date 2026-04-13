import {
  urlManipulationFactory,
  createStringParam,
  createBooleanParam,
  createArrayParam,
} from "../composite-select/urlManager.js";

export type OptionItem = {
  id: number;
  label: string;
  selected?: boolean;
};

export type DemoState = {
  options: OptionItem[];
  left: string;
  center: string;
  height: string;
  loading: boolean;
  disabled: boolean;
  setShowFooter: boolean;
  setShowFilter: boolean;
  maxHeight: string;
  value: string;
  label: string;
  highlight: string;
};

let internalIdCounter = 1;

export const urlStateConfig = urlManipulationFactory<DemoState>({
  options: createArrayParam<OptionItem>(
    "v",
    (item) => {
      return [item.id, item.label, item.selected ? "1" : "0"].join("|");
    },
    (val) => {
      const parts = val.split("|");
      if (parts.length === 3) {
        return {
          id: parseInt(parts[0], 10),
          label: parts[1],
          selected: parts[2] === "1",
        };
      }
      return { id: internalIdCounter++, label: val };
    },
  ),
  left: createStringParam("l", "50px"),
  center: createStringParam("c", "350px"),
  height: createStringParam("h", ""),
  loading: createBooleanParam("o"),
  disabled: createBooleanParam("d"),
  setShowFooter: createBooleanParam("f", "1", "0", true),
  setShowFilter: createBooleanParam("e", "1", "0", true),
  maxHeight: createStringParam("m", ""),
  value: createStringParam("s", ""),
  label: createStringParam("a", ""),
  highlight: createStringParam("y", ""),
});

export const getNextId = () => internalIdCounter++;
export const setNextId = (id: number) => {
  internalIdCounter = id;
};
