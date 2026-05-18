import { useState, useCallback, useMemo } from "react";

import { mergeURLSearchParams, normalizeSearchParams, sortSearchParamsByKeyThenValue } from "./toolsURLSearchParams.ts";

// ─── Types ───────────────────────────────────────────────────────────────────

type ParamDef<T> = {
  default: T;
  getParam: string;
  encode: (value: T) => string;
  decode: (value: string) => T;
};

// Use a loose base type for the config constraint to avoid 'any'
// `encode: (value: never) => string` allows any function of 1 argument to be assigned.
type ParamConfig = Record<
  string,
  {
    default: unknown;
    getParam: string;
    encode: (value: never) => string;
    decode: (value: string) => unknown;
  }
>;

// Extracts the value type from a config entry by looking at its 'default' property
type InferValue<P> = P extends { default: infer T } ? T : never;

// Maps config keys to their value types
type ParamValues<C extends ParamConfig> = {
  [K in keyof C]: InferValue<C[K]>;
};

// ─── Factory ─────────────────────────────────────────────────────────────────

export default function modURLSearchParams<C extends ParamConfig, Ctx = unknown>(
  config: C,
  keyFn?: (key: string, ctx?: Ctx) => string,
) {
  function separateIndexedSearchParams(search: string | URLSearchParams, ctx?: Ctx): URLSearchParams {
    const allowedKeys = Object.values(config).map((def) => {
      const getParam = (def as ParamDef<unknown>).getParam;
      return keyFn ? keyFn(getParam, ctx) : getParam;
    });
    const normalized = typeof search === "string" ? new URLSearchParams(search) : search;
    return mergeURLSearchParams(new URLSearchParams(), allowedKeys, normalized);
  }

  function useQueryParams(search: string | URLSearchParams, ctx?: Ctx) {
    const applyKey = useCallback(
      (baseKey: string) => {
        return keyFn ? keyFn(baseKey, ctx) : baseKey;
      },
      [ctx],
    );

    // Derive the initial URLSearchParams once from the input, filtered by our allowed keys
    const initial = useMemo(() => {
      return separateIndexedSearchParams(search, ctx);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionally empty — treat `search` as an initial value

    const [paramsState, setParamsState] = useState(initial);

    // Compute the parsed params whenever the URLSearchParams change
    const params = useMemo(() => {
      const result: Record<string, unknown> = {};
      for (const [key, def] of Object.entries(config)) {
        const d = def as unknown as ParamDef<unknown>;
        const raw = paramsState.get(applyKey(d.getParam));
        result[key] = raw !== null ? d.decode(raw) : d.default;
      }
      return result as ParamValues<C>;
    }, [paramsState, applyKey]);

    // ── setParam: update a single key ────────────────────────────────────────
    // If the new value equals the default, the key is removed from the URL
    // instead of being set — keeping the URL clean. The value will still
    // appear in `params` as the default.

    const setParam = useCallback(<K extends keyof C>(key: K, value: InferValue<C[K]>) => {
      const def = config[key] as unknown as ParamDef<InferValue<C[K]>>;
      setParamsState((prev) => {
        const next = new URLSearchParams(prev);
        const finalKey = applyKey(def.getParam);
        if (JSON.stringify(value) === JSON.stringify(def.default)) {
          next.delete(finalKey);
        } else {
          next.set(finalKey, def.encode(value));
        }
        return next;
      });
    }, []);

    // ── setParams: update multiple keys at once ──────────────────────────────
    // Same default-elision logic applied per key.

    const setParams = useCallback((updates: Partial<ParamValues<C>>) => {
      setParamsState((prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(updates)) {
          const def = config[key] as unknown as ParamDef<unknown>;
          if (def && value !== undefined) {
            const finalKey = applyKey(def.getParam);
            if (JSON.stringify(value) === JSON.stringify(def.default)) {
              next.delete(finalKey);
            } else {
              next.set(finalKey, def.encode(value as unknown));
            }
          }
        }
        return next;
      });
    }, []);

    return {
      params, // decoded + typed values, defaults filled in
      updatedURLSearchParams: paramsState, // the live URLSearchParams object
      setParam,
      setParams,
    };
  }

  return {
    useQueryParams,
    separateIndexedSearchParams,
  };
}
