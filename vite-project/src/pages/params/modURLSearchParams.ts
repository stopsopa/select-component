import { useState, useCallback, useMemo, useEffect } from "react";

import { mergeURLSearchParams } from "./toolsURLSearchParams.ts";

// ─── Types ───────────────────────────────────────────────────────────────────

type ParamDef<T> = {
  default: T;
  getParam: string;
  encode: (value: T) => string;
  decode: (value: string) => T;
};

// Maps config keys to their value types
type ParamValues<C> = C;

// ─── Factory ─────────────────────────────────────────────────────────────────

export default function modURLSearchParams<C extends Record<string, unknown>, Ctx = unknown>(
  config: { [K in keyof C]: ParamDef<C[K]> },
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

  function useQueryParams(
    search: string | URLSearchParams,
    navigate?: (to: { search: string }, options?: { replace?: boolean }) => void,
    ctx?: Ctx,
  ) {
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

    useEffect(() => {
      if (!navigate) return;
      const currentSearchParams = new URLSearchParams(window.location.search);
      const nextParams = mergeURLSearchParams(currentSearchParams, paramsState);

      if (nextParams.toString() !== currentSearchParams.toString()) {
        navigate({ search: nextParams.toString() }, { replace: true });
      }
    }, [paramsState, navigate]);

    // ── setParam: update a single key ────────────────────────────────────────
    // If the new value equals the default, the key is removed from the URL
    // instead of being set — keeping the URL clean. The value will still
    // appear in `params` as the default.

    const setParam = useCallback(<K extends keyof C>(key: K, value: C[K]) => {
      const def = config[key] as unknown as ParamDef<C[K]>;
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
