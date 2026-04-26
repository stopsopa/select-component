function selectedAddDeduplicatedItem(selected, item) {
  const tmp = [...selected];
  const found = tmp.some((i) => String(i.id) === String(item.id));
  if (!found) {
    tmp.push(item);
  }
  return tmp;
}
function selectedToggleDeduplicatedItem(selected, item) {
  const tmp = [...selected];
  const found = tmp.some((i) => String(i.id) === String(item.id));
  if (found) {
    return tmp.filter((i) => String(i.id) !== String(item.id));
  } else {
    tmp.push(item);
  }
  return tmp;
}
function selectedFindDeduplicatedInOptionsByIds(options, ids, seed) {
  let tmp = [];
  if (seed) {
    tmp = [...seed];
  }
  ids.forEach((id) => {
    const found = tmp.some((i) => String(i.id) === String(id));
    if (!found) {
      tmp.push(options.find((o) => String(o.id) === String(id)));
    }
  });
  tmp = deduplicateArrayById(tmp);
  return tmp;
}
/**
 * Set's the flag 'selected' based on list of selected objects
 */
function optionsSelectBasedOnSelectedList(options, selected) {
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
function deduplicateArrayById(arr) {
  return arr.filter((item, index) => arr.findIndex((i) => String(i.id) === String(item.id)) === index);
}
export {
  deduplicateArrayById,
  optionsSelectBasedOnSelectedList,
  selectedAddDeduplicatedItem,
  selectedFindDeduplicatedInOptionsByIds,
  selectedToggleDeduplicatedItem
};
