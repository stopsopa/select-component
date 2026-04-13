import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Importing with .ts extension for modern node test runner compatibility
import cacheTemplate, { setDirectory } from "../cacheTemplate.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, "fixtures");

test("cacheTemplate", async (t) => {
  // Ensure the fixtures directory is set up
  const helloPath = path.join(fixturesDir, "hello.html");
  if (! (await fs.stat(fixturesDir).catch(() => null))) {
    await fs.mkdir(fixturesDir, { recursive: true });
    await fs.writeFile(helloPath, "<div>Not safe: <%= name %>!</div>");
  }

  await t.test("throws if directory is not set", async () => {
    try {
      await cacheTemplate("any.html");
      assert.fail("Should have thrown");
    } catch (err: any) {
      assert.match(err.message, /directory is not defined/);
    }
  });

  await t.test("setDirectory should throw on non-existent directory", async () => {
    try {
      await setDirectory("/non/existent/path/at/all");
      assert.fail("Should have thrown");
    } catch (err: any) {
      assert.match(err.message, /does not exist or is not accessible/);
    }
  });

  await t.test("setDirectory sets the base path", async () => {
    await setDirectory(fixturesDir);
    // Success means no throw as directory exists
  });

  await t.test("returns TemplateExecutor and caches it", async () => {
    // Calling with path only
    const executor1 = await cacheTemplate("hello.html");
    assert.strictEqual(typeof executor1, "function");
    assert.strictEqual(executor1({ name: "World" }), "<div>Not safe: World!</div>");

    // Calling again should return cached function
    const executor2 = await cacheTemplate("hello.html");
    assert.strictEqual(executor1, executor2, "Should return the same cached function instance");
  });

  await t.test("renders immediately when data is provided", async () => {
    const result = await cacheTemplate("hello.html", { name: "Antigravity" });
    assert.strictEqual(result, "<div>Not safe: Antigravity!</div>");
  });

  await t.test("handles templates in subdirectories correctly", async () => {
    const subDir = path.join(fixturesDir, "sub");
    await fs.mkdir(subDir, { recursive: true });
    const subHello = path.join(subDir, "subhello.html");
    await fs.writeFile(subHello, "Sub: <%= name %>");

    const result = await cacheTemplate("sub/subhello.html", { name: "Antigravity" });
    assert.strictEqual(result, "Sub: Antigravity");
  });

  await t.test("interpolation (<%= %>) does NOT escape HTML by default", async () => {
    const result = await cacheTemplate("hello.html", { name: "<script>" });
    assert.strictEqual(result, "<div>Not safe: <script>!</div>");
  });

  await t.test("escaping (<%- %>) DOES escape HTML correctly", async () => {
    // escape.html contains <div><%- name %></div>
    const result = await cacheTemplate("escape.html", { name: "<script>" });
    assert.strictEqual(result, "<div>escaped: &lt;script&gt;</div>");
  });

  await t.test("throws when file does not exist within the directory", async () => {
    try {
      await cacheTemplate("missing.html");
      assert.fail("Should have thrown");
    } catch (err: any) {
      assert.match(err.message, /Template file .* does not exist/);
    }
  });
});
