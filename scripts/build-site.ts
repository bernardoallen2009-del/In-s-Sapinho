import { mkdir, writeFile } from "node:fs/promises";
import { profile } from "../src/data/profile.ts";
import { renderLegalPage, renderPage } from "../src/components/site.ts";

await mkdir(".", { recursive: true });

await writeFile("index.html", renderPage(profile), "utf8");
await writeFile("privacidade.html", renderLegalPage("privacidade", profile), "utf8");
await writeFile("cookies.html", renderLegalPage("cookies", profile), "utf8");
await writeFile("termos.html", renderLegalPage("termos", profile), "utf8");

console.log("Site gerado: index.html, privacidade.html, cookies.html, termos.html");
