// usage: node dom.mjs url selector out.html [width]
import { chromium } from "playwright-core";
import fs from "node:fs";
const [url, sel, out, w = "1440"] = process.argv.slice(2);
const b = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});
const p = await b.newPage({ viewport: { width: +w, height: 900 } });
await p.goto(url, { waitUntil: "networkidle", timeout: 90000 });
await p.waitForTimeout(1500);
fs.writeFileSync(
  out,
  await p.evaluate((s) => [...document.querySelectorAll(s)].map((e) => e.outerHTML).join("\n"), sel),
);
await b.close();
