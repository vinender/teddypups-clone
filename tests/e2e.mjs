// Functional smoke tests for the clone. usage: node e2e.mjs [baseUrl]
import { chromium } from "playwright-core";
const base = process.argv[2] ?? "http://localhost:3100";
const b = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});
const results = [];
const check = (name, ok, extra = "") => results.push(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  — " + extra : ""}`);
const errors = [];
const page = async (w = 1440, h = 900) => {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => m.type() === "error" && !m.text().includes("404") && errors.push(m.text()));
  return p;
};

// 1. Home: pinned hallway + curtain navigation
{
  const p = await page();
  await p.goto(base + "/", { waitUntil: "load" });
  await p.waitForTimeout(1500);
  const pinned = await p.evaluate(() => document.querySelector(".tp-meet")?.hasAttribute("data-pinned"));
  check("meet section pins on desktop", pinned);
  const y = await p.evaluate(
    () => document.querySelector(".tp-meet [data-pin-range]").getBoundingClientRect().top + scrollY,
  );
  await p.evaluate((y) => window.scrollTo(0, y + 900), y);
  await p.waitForTimeout(600);
  const tx = await p.evaluate(() => getComputedStyle(document.querySelector(".tp-meet__track")).transform);
  check("hallway track slides while scrolling", tx !== "none" && !tx.endsWith(", 0, 0)"), tx);
  const chatY = await p.evaluate(() => document.querySelector(".tp-chat").getBoundingClientRect().top + scrollY);
  await p.evaluate((y) => window.scrollTo(0, y), chatY);
  await p.waitForTimeout(6000);
  const shown = await p.evaluate(() => [...document.querySelectorAll(".tp-msg-group")].map((g) => g.dataset.show));
  check(
    "chat replays all three steps",
    shown.every((s) => s === "true"),
    shown.join(","),
  );
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(400);
  await p.click(".tp-header__nav a[href='/puppies']");
  await p.waitForTimeout(120);
  const state = await p.evaluate(() => document.querySelector(".tp-curtain").dataset.state);
  check("curtain covers on internal navigation", ["covering", "covered"].includes(state), state);
  await p.waitForURL("**/puppies", { timeout: 5000 });
  await p.waitForTimeout(900);
  const after = await p.evaluate(() => document.querySelector(".tp-curtain").dataset.state);
  check("curtain lifts after route change", after === "idle", after);
  await p.close();
}

// 2. Puppies filters
{
  const p = await page();
  await p.goto(base + "/puppies", { waitUntil: "load" });
  await p.waitForTimeout(800);
  await p.getByRole("button", { name: "Girls" }).click();
  await p.waitForTimeout(300);
  const count = await p.textContent("[aria-live=polite]");
  check("gender filter updates URL", p.url().includes("gender=female"), p.url());
  check("gender filter updates count", /match/.test(count), count.trim());
  await p.getByRole("button", { name: "Clear filters" }).click();
  await p.waitForTimeout(300);
  check("clear filters resets", !p.url().includes("?"), p.url());
  await p.goto(base + "/puppies?origin=local", { waitUntil: "load" });
  await p.waitForTimeout(600);
  check("empty state for local puppies", (await p.locator("text=No puppies match just now.").count()) === 1);
  await p.close();
}

// 3. Detail gallery + viewer + enquiry validation
{
  const p = await page();
  await p.goto(base + "/puppies/maltipoo-cavapoo-male", { waitUntil: "load" });
  await p.waitForTimeout(800);
  await p.getByRole("button", { name: "Next photo" }).click();
  const counter = await p.textContent(".tp-storypage span.self-center");
  check("gallery next photo", counter.replace(/\s/g, "") === "2/3", counter);
  await p.click(".tp-storypage > button");
  await p.waitForTimeout(300);
  check("viewer opens", await p.evaluate(() => [...document.querySelectorAll("dialog")].some((d) => d.open)));
  await p.keyboard.press("Escape");
  await p.waitForTimeout(200);
  await p.locator("#enquire-maltipoo-cavapoo-male button[type=submit]").click();
  await p.waitForTimeout(1200);
  check(
    "enquiry shows validation errors",
    (await p.locator("#enquire-maltipoo-cavapoo-male [role=alert]").count()) === 1,
  );
  await p.fill("#enquire-maltipoo-cavapoo-male input[name=name]", "Test Person");
  await p.fill("#enquire-maltipoo-cavapoo-male input[name=phone]", "+971 50 123 4567");
  await p.locator("#enquire-maltipoo-cavapoo-male button[type=submit]").click();
  await p.waitForTimeout(1500);
  check("enquiry succeeds", (await p.locator("#enquire-maltipoo-cavapoo-male [role=status]").count()) === 1);
  await p.close();
}

// 4. FAQ board
{
  const p = await page();
  await p.goto(base + "/faq", { waitUntil: "load" });
  await p.waitForTimeout(800);
  const q = p.locator(".tp-note__q button").first();
  await q.click();
  check("faq note unfolds", (await q.getAttribute("aria-expanded")) === "true");
  await p.fill(".tp-notes__search input", "Korea");
  await p.waitForTimeout(200);
  const c = await p.textContent(".tp-notes__count");
  check("faq search filters", /found/.test(c), c);
  check("faq search highlights", (await p.locator(".tp-notes mark").count()) > 0);
  await p.close();
}

// 5. Contact letter
{
  const p = await page();
  await p.goto(base + "/contact", { waitUntil: "load" });
  await p.waitForTimeout(800);
  await p.fill(".tp-letterform input[name=name]", "Test Person");
  await p.fill(".tp-letterform input[name=phone]", "+971 50 123 4567");
  await p.selectOption(".tp-letterform select", { index: 1 });
  await p.click(".tp-letterform button[type=submit]");
  await p.waitForTimeout(3000);
  check("letter posts and shows thanks", (await p.locator(".tp-post__sent").count()) === 1);
  await p.close();
}

// 6. Mobile menu + no horizontal scroll
{
  const p = await page(390, 844);
  for (const path of [
    "/",
    "/puppies",
    "/puppies/maltipoo-max-male",
    "/happy-families",
    "/how-it-works",
    "/faq",
    "/contact",
    "/gone-home",
  ]) {
    await p.goto(base + path, { waitUntil: "load" });
    await p.waitForTimeout(500);
    const over = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(`no horizontal overflow at 390px ${path}`, over <= 0, `+${over}px`);
  }
  await p.goto(base + "/", { waitUntil: "load" });
  await p.getByRole("button", { name: "Menu" }).click();
  await p.waitForTimeout(300);
  check("mobile menu opens", await p.evaluate(() => document.querySelector("dialog.tp-menu").open));
  await p.getByRole("button", { name: "Close" }).click();
  await p.waitForTimeout(800);
  check("mobile menu closes", await p.evaluate(() => !document.querySelector("dialog.tp-menu").open));
  await p.close();
}

// 7. 404
{
  const p = await page();
  const r = await p.goto(base + "/definitely-not-here", { waitUntil: "load" });
  check("404 status + poster", r.status() === 404 && (await p.locator(".tp-poster").count()) === 1, String(r.status()));
  await p.close();
}

console.log(results.join("\n"));
console.log(errors.length ? "PAGE ERRORS:\n" + [...new Set(errors)].slice(0, 10).join("\n") : "no page errors");
await b.close();
