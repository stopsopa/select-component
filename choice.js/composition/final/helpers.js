function selectedAddDeduplicatedItem(selected, item) {
  const tmp = [...selected];
  const found = tmp.find((i) => String(i.id) === String(item.id));
  if (!found) {
    tmp.push(item);
  }
  return tmp;
}
function selectedToggleDeduplicatedItem(selected, item) {
  const tmp = [...selected];
  const found = tmp.find((i) => String(i.id) === String(item.id));
  if (found) {
    return tmp.filter((i) => String(i.id) !== String(item.id));
  } else {
    tmp.push(item);
  }
  return tmp;
}
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
export {
  optionsSelectBasedOnSelectedList,
  selectedAddDeduplicatedItem,
  selectedToggleDeduplicatedItem
};
