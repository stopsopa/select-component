// express extension: https://raw.githubusercontent.com/stopsopa/roderic/86495ef554314d388e7f6ef10ee4de6d12bcbcff/libs/express-extend-res.js?token=GHSAT0AAAAAACVQ4Q66S6J6DLZRVFB5DQLSZXEOC2Q

import path from "node:path";
import fs from "fs";
import express from "express";
import template from "lodash/template.js";
import shuffle from "lodash/shuffle.js";
import { fileURLToPath } from "url";
import { z } from "zod";
import render, { setDirectory, enableCache } from "./js/cacheTemplate.ts";
import { simplifyErrors } from "./js/simplifyErrors.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await setDirectory(__dirname);
enableCache(false);

// use multer for multipart/form-data https://github.com/expressjs/multer

// https://stackoverflow.com/a/23613092
import serveIndex from "serve-index";

const host = process.env.HOST || "0.0.0.0";
const port = process.env.PORT || 8080;
const web = path.resolve(__dirname, ".");
const templates = path.resolve(__dirname, "templates");

const readFile = (file) => fs.readFileSync(file).toString();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/formData", (req, res) => {
  console.log(JSON.stringify(req.body, null, 2));
  res.json(req.body);
});
/**
 * http://0.0.0.0:5678/choice.js/html/index.html
 */
function produceRender(parentFile, permaData = {}) {
  return function (file, data) {
    try {
      const filePath = path.resolve(path.dirname(parentFile), file);

      const content = fs.readFileSync(filePath, "utf8");

      return template(content, {
        variable: "d",
        interpolate: /<%=([\s\S]+?)%>/g, // this somehow stops template from processing `${i}` which is what I want
        // to see exactly what is going on put debugger in file node_modules/lodash/template.js
        // in place: https://github.com/lodash/lodash/blob/4.18.1/dist/lodash.js#L14928
        // you will see before setting here interpolate: /<%=([\s\S]+?)%>/g,
        // value of sourceURL will be
        // /<%-([\s\S]+?)%>|<%=([\s\S]+?)%>|\$\{([^\\}]*(?:\\.[^\\}]*)*)\}|<%([\s\S]+?)%>|$/g
        // but when set:
        // /<%-([\s\S]+?)%>|<%=([\s\S]+?)%>|($^)|<%([\s\S]+?)%>|$/g
      })({
        ...permaData,
        ...data,
        template: {
          file: filePath,
          dir: path.dirname(filePath),
        },
        fs,
        path,
        render: produceRender(filePath, permaData),
      });
    } catch (e) {
      console.error(`_.template() error in produceRender() for ${file}`, e);

      throw new Error(`_.template() error in produceRender() for ${file}`);
    }
  };
}
app.get(/^(.*)$/, async (req, res, next) => {
  let reqPath = req.path;
  if (reqPath.endsWith("/")) {
    reqPath += "index.html";
  }

  if (reqPath.endsWith(".html")) {
    const filePath = path.join(web, reqPath);

    try {
      const stat = await fs.promises.stat(filePath);

      if (!stat.isFile()) {
        return next();
      }

      /**
       * WARNING: This method is not safe because it forwards get and post without validation to template
       */
      const render = produceRender(filePath, {
        req,
        res,
        ...req.query,
        ...req.body,
      });

      const content = render(filePath);

      return res.send(content);
    } catch (e) {
      if (e.code === "ENOENT") {
        return next();
      }
      console.error(`Error rendering ${filePath}:`, e);
      return res.status(500).send(`Template Error: ${e.message}`);
    }
  }

  next();
});

const options = JSON.parse(fs.readFileSync(path.resolve(__dirname, "choice.js", "options.json"), "utf8"));
app.get("/filtered-options", (req, res) => {
  const q = (req.query.q || "").toLowerCase();
  const filtered = options.filter((opt) => opt.toLowerCase().includes(q));
  res.json(filtered);
});

/**
 * http://0.0.0.0:5678/examples/012-form/
 */
const scripts = ["form_regular.js", "form_morphdom.js", "form_idiomorph.js", "form_alpinejs_alpine.js"];
app.all("/examples/012-form/", async (req, res) => {
  const script = req.query.script;

  if (!scripts.includes(script)) {
    res.status(400);

    return res.send(scripts.map((s) => `<a href="?script=${s}">${s}</a>`).join("<br />"));
  }

  const isFetch = Boolean(req.headers["x-fetch"]);

  const form = req.body || {};

  // zod validation here
  const schema = z.object({
    firstname: z.string().min(1),
    surname: z.string().min(1),
  });

  const result = schema.safeParse(form);

  let errors = {};

  if (isFetch) {
    errors = simplifyErrors(result.error);
  }

  const body = await render("examples/012-form/form.html", { form, errors });

  if (isFetch) {
    if (!result.success) {
      res.status(400);
    }

    return res.send(body);
  }

  const final = await render("examples/012-form/index.html", {
    body,
    script,
    req,
  });

  res.send(final);
});

// Note: eta-examples-router is disabled as we are purely using lodash.template now.
// app.use("/eta-examples", etaExamplesRouter(eta));

app.use(
  express.static(web, {
    index: false,
    maxAge: "356 days",
  }),
  serveIndex(web, {
    icons: true,
    view: "details",
    hidden: false,
  }),
);

app.listen(port, host, () => {
  console.log(`\n 🌎  Server is running ` + `http://${host}:${port}\n`);
});
