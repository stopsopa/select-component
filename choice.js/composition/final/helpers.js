function selectedAddDeduplicatedItem(selected, item) {
  const tmp = [...selected];
  const found = tmp.find((i) => String(i.id) === String(item.id));
  if (!found) {
    tmp.push(item);
  }
  return tmp;
}
export {
  selectedAddDeduplicatedItem
};
