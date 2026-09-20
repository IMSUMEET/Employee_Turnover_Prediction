import { chromium } from "playwright";
const BASE="http://127.0.0.1:3000";
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
const p=await c.newPage();
// auth
await p.goto(`${BASE}/login`);
await p.getByPlaceholder("e.g. hr_lead").fill("demo");
await p.getByPlaceholder("At least 6 characters").fill("demo123");
await p.getByRole("button",{name:"Log in"}).click();
await p.waitForURL("**/app/predict",{timeout:8000}).catch(()=>{});
await p.goto(`${BASE}/app/insights`);
await p.getByRole("heading",{name:"Model insights"}).waitFor();
await new Promise(r=>setTimeout(r,2500));
// count rect bars inside recharts
const info = await p.evaluate(()=>{
  const conts=[...document.querySelectorAll('.recharts-responsive-container')];
  return conts.map(ct=>{
    const r=ct.getBoundingClientRect();
    const bars=ct.querySelectorAll('.recharts-bar-rectangle path, .recharts-bar-rectangle rect, path.recharts-rectangle');
    const yTicks=ct.querySelectorAll('.recharts-yAxis .recharts-cartesian-axis-tick').length;
    return {w:Math.round(r.width),h:Math.round(r.height),bars:bars.length,yTicks};
  });
});
console.log(JSON.stringify(info,null,2));
await b.close();
