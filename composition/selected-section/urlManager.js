import {
  urlManipulationFactory,
  createStringParam,
  createBooleanParam,
  createArrayParam,
} from "../composite-select/urlManager.js";
let internalIdCounter = 1;
export const urlStateConfig = urlManipulationFactory({
  selected: createArrayParam(
    "v",
    (item) => {
      if (item.color || item.img) {
        return [item.color || "", item.img || "", item.label || ""].join("|");
      }
      return item.label;
    },
    (val) => {
      const parts = val.split("|");
      if (parts.length === 3) {
        return {
          id: internalIdCounter++,
          color: parts[0] || undefined,
          img: parts[1] || undefined,
          label: parts[2],
        };
      }
      return { id: internalIdCounter++, label: val };
    },
  ),
  left: createStringParam("l", "50px"),
  center: createStringParam("c", "350px"),
  error: createBooleanParam("e"),
  disabled: createBooleanParam("d"),
  loading: createBooleanParam("o"),
  showInput: createBooleanParam("i", "1", "0", true),
  label: createStringParam("as", "Select options"),
});
export const getNextId = () => internalIdCounter++;
export const setNextId = (id) => {
  internalIdCounter = id;
};
