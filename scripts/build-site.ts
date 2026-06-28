import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { profile } from "../src/data/profile.ts";
import { renderLegalPage, renderSitePages } from "../src/components/site.ts";

const outputDir = "public";

const pages = {
  ...renderSitePages(profile),
  "privacidade.html": renderLegalPage("privacidade", profile),
  "cookies.html": renderLegalPage("cookies", profile),
  "termos.html": renderLegalPage("termos", profile)
};

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

for (const [filename, contents] of Object.entries(pages)) {
  await writeFile(filename, contents, "utf8");
  await writeFile(`${outputDir}/${filename}`, contents, "utf8");
}

await writeFile(`${outputDir}/styles.css`, await readFile("styles.css", "utf8"), "utf8");
await writeFile(`${outputDir}/script.js`, await readFile("script.js", "utf8"), "utf8");
await cp("images", `${outputDir}/images`, { recursive: true });

console.log("Site gerado em public/ e na raiz.");
