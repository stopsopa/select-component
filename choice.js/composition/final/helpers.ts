import type { SelectedListElement } from "../select-section/SelectedListManager.js";
import type { OptionsListElement } from "../options-section/OptionsListManager.js";

export function selectedAddDeduplicatedItem(selected: SelectedListElement[], item: SelectedListElement) {
  const tmp = [...selected];
  const found = tmp.find((i) => String(i.id) === String(item.id));
  if (!found) {
    tmp.push(item);
  }
  return tmp;
}

export function selectedToggleDeduplicatedItem(selected: SelectedListElement[], item: SelectedListElement) {
  const tmp = [...selected];
  const found = tmp.find((i) => String(i.id) === String(item.id));
  if (found) {
    return tmp.filter((i) => String(i.id) !== String(item.id));
  } else {
    tmp.push(item);
  }
  return tmp;
}

export function optionsSelectBasedOnSelectedList(options: OptionsListElement[], selected: SelectedListElement[]) {
  const ids = selected.map((i) => String(i.id));

  if (ids.length === 0) {
    return [...options];
  }

  return options.map((option) => {
    const opt = { ...option };
    opt.selected = ids.includes(String(option.id));
    return opt;
  });
}
