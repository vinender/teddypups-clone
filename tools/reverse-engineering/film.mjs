// Filmstrip: scroll with the wheel through a page, screenshot the viewport at checkpoints.
// usage: node film.mjs url outPrefix "y1,y2,..." [w] [h]
import { chromium } from "playwright-core";
const [url, out, ys, w = "1440", h = "900"] = process.argv.slice(2);
const b = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
await p.goto(url, { waitUntil: "load", timeout: 90000 });
await p.waitForTimeout(3500);
await p.mouse.move(+w * 0.3, +h * 0.5);
let cur = 0;
for (const [i, y] of ys.split(",").map(Number).entries()) {
  while (cur < y) {
    const d = Math.min(120, y - cur);
    await p.mouse.wheel(0, d);
    cur += d;
    await p.waitForTimeout(35);
  }
  await p.waitForTimeout(1300);
  const info = await p.evaluate(() => {
    const a = document.querySelector(".pup-actor");
    const r = a?.getBoundingClientRect();
    return {
      sy: Math.round(scrollY),
      pup: document.documentElement.dataset.pup ?? "-",
      actor: r ? `${Math.round(r.x)},${Math.round(r.y)}` : "-",
      here: document.querySelector(".tp-hero")?.dataset.here ?? "-",
      open: [...document.querySelectorAll(".tp-door")].filter((d) => d.dataset.open === "true").length,
      prints: [...document.querySelectorAll(".pup-prints svg")].filter((s) => s.getAnimations().length).length,
    };
  });
  await p.screenshot({ path: `${out}-${i}.png` });
  console.log(i, JSON.stringify(info));
}
console.log(errs.length ? "ERRORS " + errs.join(" | ") : "no errors");
await b.close();
