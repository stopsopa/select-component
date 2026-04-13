import type { Item } from "../types.js";

/**
 * Toggles an item in the selected list: adds if missing, removes if present.
 */
export function togglePresenceOnTheList<T extends Item>(selected: T[], item: T) {
  const tmp = [...selected];

  const newList = tmp.filter((i) => String(i.id) !== String(item.id));

  if (newList.length === tmp.length) {
    tmp.push(item);

    return tmp;
  }

  return newList;
}

/**
 * Resolves a list of IDs into full option objects and merges them into the current selected list (seed).
 * This function is designed to preserve any existing items in the selected list (including "extra" items
 * that might not exist in the current options array) while ensuring the final result is unique and deduplicated by ID.
 */
export function selectedFindDeduplicatedInOptionsByIds<T extends Item>(
  options: T[],
  ids: (string | number)[],
  seed?: T[], // list we are starting with
) {
  let tmp: T[] = [];

  if (seed) {
    tmp = [...seed];
  }

  ids.forEach((id) => {
    const found = tmp.some((i) => String(i.id) === String(id));

    if (!found) {
      tmp.push(options.find((o) => String(o.id) === String(id)) as T);
    }
  });

  tmp = deduplicateArrayById(tmp);

  return tmp;
}
/**
 * Updates the 'selected' flag on each option based on whether its ID exists in the provided selected list.
 */
export function markSelectedByIds<T extends Item>(options: T[], selectedIds: number[]) {
  if (selectedIds.length === 0) {
    return [...options];
  }

  return options.map((option) => {
    const opt = { ...option };

    opt.selected = selectedIds.includes(option.id);

    return opt;
  });
}

/**
 * Returns a new array with duplicate items removed based on their 'id' property.
 * Interesting trick,
 * if you know you will have more than one instance of object by the same id then pass these which you want to keep first.
 * It is usefull in certain circumstances:
 * For example when onFocus is fired we can unselect objects from selected by placing
 * [...options, ...selected] in this order
 * then unselected options will win over selected
 * and then after that we can filter just these which are selected still and update manager.selected.setSelected()
 * this way we will unselect
 */
export function deduplicateArrayById<T extends { id: string | number }>(arr: T[]): T[] {
  return arr.filter((item, index) => arr.findIndex((i) => String(i.id) === String(item.id)) === index);
}

/**
 * Sorts a list of elements by their ID string value.
 */
export function sortById<T extends Item>(list: T[], asc = true) {
  return [...list].sort((a, b) => {
    const aId = String(a.id);
    const bId = String(b.id);

    if (aId < bId) {
      return asc ? -1 : 1;
    }
    if (aId > bId) {
      return asc ? 1 : -1;
    }
    return 0;
  });
}

/**
 * Wraps matches of search terms in the provided text with a highlight span.
 * Supports multi-word search and case-insensitive matching.
 */
export function markSearchWithSpan(text: string, search: string) {
  if (!search || !search.trim()) {
    return text;
  }

  // Split by whitespace, deduplicate, and remove empty strings
  const words = Array.from(new Set(search.trim().split(/\s+/).filter(Boolean)));

  if (words.length === 0) {
    return text;
  }

  // Escape special regex characters in each word
  const escapedWords = words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  // Sort by length descending to match longest words first (greedy matching)
  escapedWords.sort((a, b) => b.length - a.length);

  // Create a regex to match any of the words, case-insensitively, globally
  const regex = new RegExp(`(${escapedWords.join("|")})`, "gi");

  // Replace matches with the highlighted span
  return text.replace(regex, '<span class="highlight">$1</span>');
}
