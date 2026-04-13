export function urlManipulationFactory(config) {
  return {
    toUrl: (url, id, state) => {
      for (const key in state) {
        if (config[key] && state[key] !== undefined) {
          config[key].toUrl(url, id, state[key]);
        }
      }
      return url;
    },
    fromUrl: (urlParams, id) => {
      const state = {};
      for (const key in config) {
        const val = config[key].fromUrl(urlParams, id);
        if (val !== undefined) {
          state[key] = val;
        }
      }
      return state;
    },
    getAllIds: (urlParams, idRegex = /^([a-z]+)(\d+)$/) => {
      const ids = new Set();
      for (const key of urlParams.keys()) {
        const match = key.match(idRegex);
        if (match) {
          ids.add(parseInt(match[2], 10));
        }
      }
      return Array.from(ids).sort((a, b) => a - b);
    },
    removeId: (urlParams, id) => {
      for (const key in config) {
        config[key].remove(urlParams, id);
      }
    },
  };
}
export const createStringParam = (prefix, defaultValue) => ({
  toUrl: (url, id, value) => {
    url.searchParams.set(`${prefix}${id}`, value || defaultValue || "");
  },
  fromUrl: (urlParams, id) => {
    const val = urlParams.get(`${prefix}${id}`);
    return val !== null ? val : defaultValue;
  },
  remove: (urlParams, id) => {
    urlParams.delete(`${prefix}${id}`);
  },
});
export const createBooleanParam = (prefix, trueVal = "1", falseVal = "0", defaultValue) => ({
  toUrl: (url, id, value) => {
    url.searchParams.set(`${prefix}${id}`, value ? trueVal : falseVal);
  },
  fromUrl: (urlParams, id) => {
    const val = urlParams.get(`${prefix}${id}`);
    if (val === null) return defaultValue;
    return val === trueVal;
  },
  remove: (urlParams, id) => {
    urlParams.delete(`${prefix}${id}`);
  },
});
export const createArrayParam = (prefix, serialize, deserialize) => ({
  toUrl: (url, id, values) => {
    url.searchParams.delete(`${prefix}${id}`);
    values.forEach((v) => {
      url.searchParams.append(`${prefix}${id}`, serialize(v));
    });
  },
  fromUrl: (urlParams, id) => {
    const vals = urlParams.getAll(`${prefix}${id}`);
    if (vals.length === 0) return undefined;
    return vals.map(deserialize);
  },
  remove: (urlParams, id) => {
    urlParams.delete(`${prefix}${id}`);
  },
});
export const urlStateConfig = urlManipulationFactory({
  selected: createArrayParam(
    "v",
    (item) => `${item.id}~${item.label}`,
    (val) => {
      const parts = val.split("~");
      return { id: parseInt(parts[0], 10), label: parts[1] };
    },
  ),
  left: createStringParam("l", "20%"),
  center: createStringParam("c", "60%"),
  height: createStringParam("h", "60px"),
  disabledSel: createBooleanParam("ds"),
  disabledOpt: createBooleanParam("do"),
  loadingSel: createBooleanParam("ls"),
  loadingOpt: createBooleanParam("lo"),
  labelSel: createStringParam("as"),
  labelOpt: createStringParam("ao"),
  errorSel: createBooleanParam("es"),
  showInputSel: createBooleanParam("si", "1", "0", true),
  showFilter: createBooleanParam("sf", "1", "0", true),
  showFooter: createBooleanParam("st", "1", "0", true),
  position: createStringParam("p", "cover-bottom"),
  filter: createStringParam("f"),
  selectedValue: createStringParam("x"),
  maxHeight: createStringParam("mh"),
  emptyList: createBooleanParam("el"),
});
