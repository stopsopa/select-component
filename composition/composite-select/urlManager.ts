import type { PositionType } from "../container/ContainerManager.js";
import type { Item } from "../types.js";

export interface DemoItem extends Item {
  color?: string;
  img?: string;
}

export type DemoState = {
  selected: DemoItem[];
  left: string;
  center: string;
  height: string;
  disabledSel: boolean;
  disabledOpt: boolean;
  loadingSel: boolean;
  loadingOpt: boolean;
  labelSel: string;
  labelOpt: string;
  errorSel: boolean;
  showInputSel: boolean;
  showFilter: boolean;
  showFooter: boolean;
  position: PositionType;
  filter: string;
  selectedValue: string;
  maxHeight: string;
  emptyList: boolean;
};

export type UrlDef<T> = {
  toUrl: (url: URL, id: string | number, value: T) => void;
  fromUrl: (urlParams: URLSearchParams, id: string | number) => T | undefined;
  remove: (urlParams: URLSearchParams, id: string | number) => void;
};

export function urlManipulationFactory<State extends Record<string, any>>(config: {
  [K in keyof State]: UrlDef<State[K]>;
}) {
  return {
    toUrl: (url: URL, id: string | number, state: Partial<State>) => {
      for (const key in state) {
        if (config[key] && state[key] !== undefined) {
          config[key].toUrl(url, id, state[key] as State[typeof key]);
        }
      }
      return url;
    },
    fromUrl: (urlParams: URLSearchParams, id: string | number): Partial<State> => {
      const state: Partial<State> = {};
      for (const key in config) {
        const val = config[key].fromUrl(urlParams, id);
        if (val !== undefined) {
          state[key] = val;
        }
      }
      return state;
    },
    getAllIds: (urlParams: URLSearchParams, idRegex = /^([a-z]+)(\d+)$/): number[] => {
      const ids = new Set<number>();
      for (const key of urlParams.keys()) {
        const match = key.match(idRegex);
        if (match) {
          ids.add(parseInt(match[2], 10));
        }
      }
      return Array.from(ids).sort((a, b) => a - b);
    },
    removeId: (urlParams: URLSearchParams, id: string | number) => {
      for (const key in config) {
        config[key].remove(urlParams, id);
      }
    },
  };
}

export const createStringParam = (prefix: string, defaultValue?: string): UrlDef<string> => ({
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

export const createBooleanParam = (
  prefix: string,
  trueVal = "1",
  falseVal = "0",
  defaultValue?: boolean,
): UrlDef<boolean> => ({
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

export const createArrayParam = <T>(
  prefix: string,
  serialize: (item: T) => string,
  deserialize: (val: string) => T,
): UrlDef<T[]> => ({
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

export const urlStateConfig = urlManipulationFactory<DemoState>({
  selected: createArrayParam<DemoItem>(
    "v",
    (item) => `${item.id}~${item.label}`,
    (val) => {
      const parts = val.split("~");
      return { id: parseInt(parts[0], 10), label: parts[1] } as DemoItem;
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
  position: createStringParam("p", "cover-bottom") as any,
  filter: createStringParam("f"),
  selectedValue: createStringParam("x"),
  maxHeight: createStringParam("mh"),
  emptyList: createBooleanParam("el"),
});
