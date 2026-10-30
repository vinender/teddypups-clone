// viewport screenshot, real motion. usage: node vshot.mjs url out.png [w] [h] [scrollY] [waitMs]
import { chromium } from "playwright-core";
const [url, out, w = "1440", h = "900", y = "0", wait = "2500"] = process.argv.slice(2);
const b = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});
const p = await b.newPage({ viewport: { width: +w, height: +h } });
p.on("pageerror", (e) => console.log("PAGEERROR", e.message));
await p.goto(url, { waitUntil: "load", timeout: 90000 });
await p.waitForTimeout(1200);
if (+y) {
  await p.mouse.move(w / 2, h / 2);
  for (let s = 0; s < +y; s += 400) {
    await p.mouse.wheel(0, 400);
    await p.waitForTimeout(40);
  }
}
await p.waitForTimeout(+wait);
await p.screenshot({ path: out });
console.log(out, await p.evaluate(() => window.scrollY));
await b.close();
