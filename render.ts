import fs from "node:fs";
import path from "node:path";
import produceRender from "./produceRender.ts";

const th = (msg: string) => new Error(`render.ts error: ${msg}`);

const files = process.argv.slice(2);

if (files.length === 0) {
  process.exit(0);
}

const results: string[] = [];

try {
  for (const file of files) {
    const absoluteFilePath = path.resolve(process.cwd(), file);

    if (!fs.existsSync(absoluteFilePath)) {
      throw th(`File not found: ${file}`);
    }

    const render = produceRender(absoluteFilePath);

    const content = render(absoluteFilePath);

    const ext = path.extname(file);

    const dirname = path.dirname(file);

    const basename = path.basename(file, ext);

    const outputFile = path.join(dirname, `${basename}.rendered${ext}`);

    fs.writeFileSync(path.resolve(process.cwd(), outputFile), content);

    results.push(outputFile);
  }

  process.stdout.write(results.join("\n") + "\n");
  process.exit(0);
} catch (e) {
  console.error(e);
  process.exit(1);
}
