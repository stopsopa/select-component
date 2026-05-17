import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";



// ─── Types ────────────────────────────────────────────────────────────────────

type Serializer<T> = {
  parse:     (raw: string) => T;
  serialize: (value: T)    => string;
};

type UseUrlGetProps<T> = {
  key:          string;
  defaultValue: T;
  serializer?:  Serializer<T>;
};

type SetUrlValue<T> = (value: T | null | undefined) => void;

// ─── Built-in serializers ─────────────────────────────────────────────────────

export const StringSerializer: Serializer<string> = {
  parse:     (raw) => raw,
  serialize: (val) => val,
};

export const predefinedUseUrlString = createUseUrlGet(StringSerializer);

export const NumberSerializer: Serializer<number> = {
  parse:     (raw) => Number(raw),
  serialize: (val) => String(val),
};

export const predefinedUseUrlNumber = createUseUrlGet(NumberSerializer);

export const BooleanSerializer: Serializer<boolean> = {
  parse:     (raw) => raw === "true",
  serialize: (val) => String(val),
};

export const predefinedUseUrlBoolean = createUseUrlGet(BooleanSerializer);

export const StringArraySerializer: Serializer<string[]> = {
  parse:     (raw) => raw ? raw.split(",") : [],
  serialize: (val) => val.join(","),
};

export const predefinedUseUrlStringArray = createUseUrlGet(StringArraySerializer);

export const NumberArraySerializer: Serializer<number[]> = {
  parse:     (raw) => raw ? raw.split(",").map(Number) : [],
  serialize: (val) => val.join(","),
};

export const predefinedUseUrlNumberArray = createUseUrlGet(NumberArraySerializer);

// most flexible
export const JsonSerializer = <T>(): Serializer<T> => ({
  parse:     (raw) => JSON.parse(raw) as T,
  serialize: (val) => JSON.stringify(val),
});

export const predefinedUseUrlJson = <T>() => createUseUrlGet(JsonSerializer<T>());

const flipget = (function (c: Record<string, string>) {
  for (const i in c) {
    if (Object.prototype.hasOwnProperty.call(c, i)) {
      c[c[i]] = i;
    }
  }
  return function (s: string): string {
    const arr = s.split("");
    for (let i = 0, l = arr.length; i < l; ++i) {
      if (c[arr[i]]) arr[i] = c[arr[i]];
    }
    return arr.join("");
  };
})({
  " ": ".",
  '"': "!",
  ":": "-",
  "{": "(",
  "}": ")",
  "?": "_",
  "&": "~",
  ",": "*",
});

export const FlipGetJsonSerializer = <T>(): Serializer<T> => ({
  parse:     (raw) => JSON.parse(flipget(raw)) as T,
  serialize: (val) => flipget(JSON.stringify(val)),
});

// ─── Hook ─────────────────────────────────────────────────────────────────────

export default function useUrlGet<T = string>(
  opt: UseUrlGetProps<T>
): [T, SetUrlValue<T>] {

  const {
    key,
    defaultValue,
    // Auto-detect string serializer when T is a string; otherwise require explicit serializer
    serializer = StringSerializer as unknown as Serializer<T>,
  } = opt;

  const [searchParams, setSearchParams] = useSearchParams();

  // ── Read ──────────────────────────────────────────────────────────────────
  const raw = searchParams.get(key);
  const value: T = raw !== null
    ? (() => {
        try {
          return serializer.parse(raw);
        } catch {
          return defaultValue;
        }
      })()
    : defaultValue;

  // ── Write ─────────────────────────────────────────────────────────────────
  const setValue: SetUrlValue<T> = useCallback(
    (next) => {
      setSearchParams(
        (prev) => {
          const updated = new URLSearchParams(prev);

          if (next === null || next === undefined) {
            updated.delete(key);
          } else {
            updated.set(key, serializer.serialize(next));
          }

          return updated;
        },
        { replace: true }   // don't pollute browser history on every keystroke
      );
    },
    [key, serializer, setSearchParams]
  );

  return [value, setValue];
}

export function createUseUrlGet<T>(serializer: Serializer<T>) {
  return function useBoundUrlGet(key: string, defaultValue: T): [T, SetUrlValue<T>] {
    return useUrlGet<T>({
      key,
      defaultValue,
      serializer,
    });
  };
}

// ─── Usage examples ───────────────────────────────────────────────────────────
//
// import useUrlGet, {
//   createUseUrlGet,
//   NumberSerializer,
//   BooleanSerializer,
//   JsonSerializer,
//   StringArraySerializer,
//   NumberArraySerializer,
//   FlipGetJsonSerializer,
// } from "./useUrlGet";
//
// --- create custom bound hook ---
// const useUrlGetString = createUseUrlGet(StringSerializer);
// // then in component:
// // const [val, setVal] = useUrlGetString("key", "default_value");
//
// --- string (default) ---
// const [search, setSearch] = useUrlGet<string>({
//   key: "q",
//   defaultValue: "",
// });
//
// --- number ---
// const [page, setPage] = useUrlGet<number>({
//   key: "page",
//   defaultValue: 1,
//   serializer: NumberSerializer,
// });
//
// --- boolean ---
// const [darkMode, setDarkMode] = useUrlGet<boolean>({
//   key: "dark",
//   defaultValue: false,
//   serializer: BooleanSerializer,
// });
//
// --- complex object ---
// type Filters = { sort: string };
// const [filters, setFilters] = useUrlGet<Filters>({
//   key: "filters",
//   defaultValue: { sort: "asc" },
//   serializer: JsonSerializer<Filters>(),
// });
//
// --- array of strings ---
// const [tags, setTags] = useUrlGet<string[]>({
//   key: "tags",
//   defaultValue: [],
//   serializer: StringArraySerializer,
// });
//
// --- array of numbers ---
// const [ids, setIds] = useUrlGet<number[]>({
//   key: "ids",
//   defaultValue: [],
//   serializer: NumberArraySerializer,
// });
//
// --- flipget encoded object ---
// const [state, setState] = useUrlGet<Filters>({
//   key: "state",
//   defaultValue: { sort: "asc" },
//   serializer: FlipGetJsonSerializer<Filters>(),
// });
//
// --- unsetting a value (removes key from URL) ---
// setSearch(null);       // → removes ?q=...
// setSearch(undefined);  // → same


/**
// string (default — no serializer needed)
const [q, setQ] = useUrlGet<string>({ key: "q", defaultValue: "" });

// number
const [page, setPage] = useUrlGet<number>({
  key: "page", defaultValue: 1, serializer: NumberSerializer,
});

// any object → JSON-encoded in the URL
const [filters, setFilters] = useUrlGet<Filters>({
  key: "filters", defaultValue: { tags: [], sort: "asc" },
  serializer: JsonSerializer<Filters>(),
});

// custom serializer


const PipeSeparatedSerializer: Serializer<string[]> = {
  parse:     (raw)   => raw.split("|"),
  serialize: (value) => value.join("|"),
};

const [tags, setTags] = useUrlGet<string[]>({
  key:          "tags",
  defaultValue: [],
  serializer:   PipeSeparatedSerializer,
});

// ?tags=react|typescript|hooks
// setTags(["react", "typescript", "hooks"])
// setTags(null)  → removes ?tags= entirely

 */