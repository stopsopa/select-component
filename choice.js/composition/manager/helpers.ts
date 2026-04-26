import type { SelectedListElement } from "../select-section/SelectedListManager.js";

import type { OptionsListElement } from "../options-section/OptionsListManager.js";

export function selectedAddDeduplicatedItem(selected: SelectedListElement[], item: SelectedListElement) {
  const tmp = [...selected];

  const found = tmp.some((i) => String(i.id) === String(item.id));

  if (!found) {
    tmp.push(item);
  }

  return tmp;
}

export function selectedToggleDeduplicatedItem(selected: SelectedListElement[], item: SelectedListElement) {
  const tmp = [...selected];

  const found = tmp.some((i) => String(i.id) === String(item.id));

  if (found) {
    return tmp.filter((i) => String(i.id) !== String(item.id));
  } else {
    tmp.push(item);
  }

  return tmp;
}

export function selectedFindDeduplicatedInOptionsByIds(
  options: OptionsListElement[],
  ids: (string | number)[],
  seed?: SelectedListElement[], // list we are starting with
) {
  let tmp: SelectedListElement[] = [];

  if (seed) {
    tmp = [...seed];
  }

  ids.forEach((id) => {
    const found = tmp.some((i) => String(i.id) === String(id));

    if (!found) {
      tmp.push(options.find((o) => String(o.id) === String(id)) as SelectedListElement);
    }
  });

  tmp = deduplicateArrayById(tmp);

  return tmp;
}
/**
 * Set's the flag 'selected' based on list of selected objects
 */
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

export function deduplicateArrayById<T extends { id: string | number }>(arr: T[]): T[] {
  return arr.filter((item, index) => arr.findIndex((i) => String(i.id) === String(item.id)) === index);
}
