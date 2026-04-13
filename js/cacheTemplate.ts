import path from "node:path";
import fs from "node:fs/promises";
import template from "lodash/template.js";

/**
 * Types following @types/lodash/common/string.d.ts
 */
export interface TemplateOptions {
  escape?: RegExp;
  evaluate?: RegExp;
  imports?: { [key: string]: any };
  interpolate?: RegExp;
  sourceURL?: string;
  variable?: string;
}

export interface TemplateExecutor {
  (data?: object): string;
  source: string;
}

const options: TemplateOptions = {
  interpolate: /<%=([\s\S]+?)%>/g,
  escape: /<%-([\s\S]+?)%>/g,
  evaluate: /<%([\s\S]+?)%>/g,
  variable: "d",
};

const th = (msg: string) => new Error(`cacheTemplate error: ${msg}`);

let dir: string | undefined;

export async function setDirectory(directory: string) {
  if (typeof directory !== "string" || directory.trim().length === 0) {
    throw th("directory is required");
  }

  try {
    await fs.access(directory);
  } catch (err) {
    throw th(`directory >${directory}< does not exist or is not accessible`);
  }

  dir = directory;
}

let cacheEnabled = true;
export function enableCache(on: boolean) {
  if (typeof on !== "boolean") {
    throw th("on must be a boolean");
  }

  cacheEnabled = on;
}

const cache = new Map<string, TemplateExecutor>();

/**
 * Usage in the project  
 
import rawRender, { setDirectory, enableCache } from "./js/cacheTemplate.ts";
 
await setDirectory(__dirname);
enableCache(false);

function render(template, data) {
  return rawRender(template, {
    ...data,
    render,
  });
}

/**
 * NOTE: it is generally recommended to add {variable: "some_name"} to the options object
 * More about it: https://github.com/stopsopa/template-engines-benchmark/blob/main/benchmark/README.md
 */
export default async function cacheTemplate(tmp: string): Promise<TemplateExecutor>;
export default async function cacheTemplate(tmp: string, data: object): Promise<string>;
export default async function cacheTemplate(tmp: string, data?: object): Promise<TemplateExecutor | string> {
  if (!dir) {
    throw th("directory is not defined, please call setDirectory() first");
  }

  if (cacheEnabled && cache.has(tmp)) {
    const t = cache.get(tmp)!;

    return data === undefined ? t : t(data);
  }

  const fullPath = path.resolve(dir, tmp);

  const cacheKey = path.relative(dir, fullPath);

  if (cacheEnabled && cache.has(cacheKey)) {
    const t = cache.get(cacheKey)!;

    return data === undefined ? t : t(data);
  }

  try {
    await fs.access(fullPath);
  } catch (err) {
    throw th(`Template file >${fullPath}< does not exist (cacheKey: >${cacheKey}<)`);
  }

  const content = await fs.readFile(fullPath, "utf8");

  const t = template(content, options) as TemplateExecutor;

  cache.set(cacheKey, t);
  cache.set(tmp, t);

  if (data !== undefined) {
    return t(data);
  }

  return t;
}
