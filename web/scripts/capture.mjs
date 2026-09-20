// Drives the running app with Playwright to produce README media:
//   - crisp @2x section screenshots  -> docs/media/shot_*.png
//   - a full walkthrough video       -> docs/media/video/*.webm
import { chromium } from "playwright";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEDIA = path.resolve(__dirname, "../../docs/media");
const BASE = "http://127.0.0.1:3000";
const USER = "demo";
const PASS = "demo123";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function ensureAuth(page) {
  await page.goto(`${BASE}/login`);
  await page.getByPlaceholder("e.g. hr_lead").fill(USER);
  await page.getByPlaceholder("At least 6 characters").fill(PASS);
  await page.getByRole("button", { name: "Log in" }).click();
  // if creds are wrong (fresh db), register instead
  try {
    await page.waitForURL("**/app/predict", { timeout: 4000 });
  } catch {
    await page.goto(`${BASE}/register`);
    await page.getByPlaceholder("e.g. hr_lead").fill(USER);
    await page.getByPlaceholder("At least 6 characters").fill(PASS);
    await page.getByRole("button", { name: "Create account" }).click();
    await page.waitForURL("**/app/predict", { timeout: 8000 });
  }
}

async function screenshots(browser) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  // Landing
  await page.goto(BASE);
  await sleep(1200);
  await page.screenshot({ path: `${MEDIA}/shot_landing.png` });

  // Login (pre-filled, not submitted)
  await page.goto(`${BASE}/login`);
  await page.getByPlaceholder("e.g. hr_lead").fill(USER);
  await page.getByPlaceholder("At least 6 characters").fill(PASS);
  await sleep(500);
  await page.screenshot({ path: `${MEDIA}/shot_login.png` });

  await ensureAuth(page);

  // Predict + result
  await page.getByRole("button", { name: "Predict attrition risk" }).click();
  await page.getByText("Why this score").waitFor();
  await sleep(1500);
  await page.screenshot({ path: `${MEDIA}/shot_predict.png` });

  // Bulk dashboard
  await page.goto(`${BASE}/app/bulk`);
  await page.getByRole("button", { name: "Use demo roster" }).click();
  await page.getByText("Employees scored").waitFor();
  await sleep(1800);
  await page.screenshot({ path: `${MEDIA}/shot_bulk.png`, fullPage: true });

  // Drill-down drawer (top / highest-risk row)
  await page.locator("button:has-text('%')").first().click();
  await page.getByText("Recommended actions").first().waitFor();
  await sleep(1400);
  await page.screenshot({ path: `${MEDIA}/shot_drawer.png` });

  // Insights — scroll charts into view first so Recharts measures a real
  // width (ResponsiveContainer renders empty if it mounts off-screen).
  await page.goto(`${BASE}/app/insights`);
  await page.getByRole("heading", { name: "Model insights" }).waitFor();
  await page.evaluate(async () => {
    for (let y = 0; y <= document.body.scrollHeight; y += 200) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await sleep(2000);
  await page.screenshot({ path: `${MEDIA}/shot_insights.png`, fullPage: true });

  await ctx.close();
  console.log("screenshots done");
}

async function walkthrough(browser) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    recordVideo: { dir: `${MEDIA}/video`, size: { width: 1280, height: 800 } },
  });
  const page = await ctx.newPage();

  await page.goto(BASE);
  await sleep(2200);
  // gentle scroll of the landing page
  for (let y = 0; y <= 900; y += 60) {
    await page.mouse.wheel(0, 60);
    await sleep(45);
  }
  await sleep(800);
  await page.mouse.wheel(0, -1400);
  await sleep(600);

  await page.getByRole("link", { name: "Try the demo" }).click();
  await sleep(1200);
  await ensureAuthVideo(page);

  // Single prediction
  await sleep(800);
  await page.getByRole("button", { name: "Predict attrition risk" }).click();
  await page.getByText("Why this score").waitFor();
  await sleep(2600);

  // Tweak satisfaction low then re-predict to show interactivity
  const slider = page.locator("input.clay-range").first();
  const box = await slider.boundingBox();
  if (box) {
    await page.mouse.click(box.x + box.width * 0.15, box.y + box.height / 2);
  }
  await page.getByRole("button", { name: "Predict attrition risk" }).click();
  await sleep(2600);

  // Bulk
  await page.getByRole("link", { name: "Bulk analysis" }).click();
  await sleep(900);
  await page.getByRole("button", { name: "Use demo roster" }).click();
  await page.getByText("Employees scored").waitFor();
  await sleep(1800);
  for (let i = 0; i < 12; i++) {
    await page.mouse.wheel(0, 90);
    await sleep(70);
  }
  await sleep(800);
  await page.locator("button:has-text('%')").first().click();
  await page.getByText("Recommended actions").first().waitFor();
  await sleep(2400);
  await page.keyboard.press("Escape");
  await sleep(600);

  // Insights
  await page.getByRole("link", { name: "Model insights" }).click();
  await sleep(1000);
  await page.getByRole("heading", { name: "Model insights" }).waitFor();
  for (let i = 0; i < 10; i++) {
    await page.mouse.wheel(0, 90);
    await sleep(80);
  }
  await sleep(2200);

  await ctx.close(); // flushes the video
  console.log("walkthrough done");
}

async function ensureAuthVideo(page) {
  // after "Try the demo" we're on /register
  await page.waitForURL("**/register**", { timeout: 4000 }).catch(() => {});
  if (page.url().includes("/register")) {
    await page.getByPlaceholder("e.g. hr_lead").fill(USER);
    await page.getByPlaceholder("At least 6 characters").fill(PASS);
    await page.getByRole("button", { name: "Create account" }).click();
    try {
      await page.waitForURL("**/app/predict", { timeout: 4000 });
      return;
    } catch {
      // user exists -> log in
      await page.goto(`${BASE}/login`);
      await page.getByPlaceholder("e.g. hr_lead").fill(USER);
      await page.getByPlaceholder("At least 6 characters").fill(PASS);
      await page.getByRole("button", { name: "Log in" }).click();
      await page.waitForURL("**/app/predict", { timeout: 8000 });
    }
  }
}

const only = process.argv[2]; // "shots" | "video" | undefined (both)
const browser = await chromium.launch();
if (only !== "video") await screenshots(browser);
if (only !== "shots") await walkthrough(browser);
await browser.close();
console.log("ALL CAPTURE DONE");
