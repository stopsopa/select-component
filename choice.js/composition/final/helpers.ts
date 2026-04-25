import type { SelectedListElement } from "../select-section/SelectedListManager.js";

export function selectedAddDeduplicatedItem(selected: SelectedListElement[], item: SelectedListElement) {
  const tmp = [...selected];
  const found = tmp.find((i) => String(i.id) === String(item.id));
  if (!found) {
    tmp.push(item);
  }
  return tmp;
}
