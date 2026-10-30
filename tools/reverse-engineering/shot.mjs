// usage: node shot.mjs <url> <out.png> [width] [height] [fullPage] [scrollTo]
import { chromium } from "playwright-core";
const [url, out, w = "1440", h = "900", full = "1", scroll = "0"] = process.argv.slice(2);
const b = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});
const p = await b.newPage({ viewport: { width: +w, height: +h }, reducedMotion: "reduce" });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await p.goto(url, { waitUntil: "load", timeout: 90000 });
await p.waitForTimeout(1500);
// Trigger lazy content
for (let y = 0; y < 30000; y += 700) {
  await p.evaluate((y) => window.scrollTo(0, y), y);
  await p.waitForTimeout(60);
}
await p.evaluate((s) => window.scrollTo(0, +s), scroll);
await p.waitForTimeout(800);
await p.screenshot({ path: out, fullPage: full === "1" });
const height = await p.evaluate(() => document.documentElement.scrollHeight);
console.log(out, "height", height, errors.length ? "ERRORS: " + errors.slice(0, 5).join(" | ") : "no errors");
await b.close();
