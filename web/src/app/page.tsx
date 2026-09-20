"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Wordmark } from "@/components/Logo";
import RiskGauge from "@/components/RiskGauge";

const features = [
  {
    title: "Risk scores, not guesses",
    body: "Every employee gets a calibrated 0–100% attrition probability from a CatBoost model — no more binary yes/no.",
    icon: "M3 17l5-5 4 3 5-7",
  },
  {
    title: "Explainable by design",
    body: "SHAP values reveal exactly which factors push each person toward leaving, so you can act on the real cause.",
    icon: "M12 3v18M5 12h14",
  },
  {
    title: "From one to thousands",
    body: "Score a single hire or upload a whole roster and get an instant, sortable at-risk dashboard.",
    icon: "M4 6h16M4 12h16M4 18h10",
  },
];

const stats = [
  { value: "92.8%", label: "ROC-AUC" },
  { value: "86.5%", label: "Accuracy" },
  { value: "9,540", label: "Employees trained on" },
];

export default function Landing() {
  return (
    <main className="mx-auto max-w-6xl px-5 pb-20">
      {/* Nav */}
      <nav className="flex items-center justify-between py-6">
        <Wordmark />
        <div className="flex items-center gap-3">
          <Link href="/login" className="clay-btn px-4 py-2 text-sm">
            Log in
          </Link>
          <Link href="/register" className="clay-btn clay-btn-primary px-4 py-2 text-sm">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="grid items-center gap-10 pt-10 md:grid-cols-2 md:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="clay-chip mb-5">People analytics · Explainable ML</span>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] text-ink md:text-6xl">
            Know who&apos;s about to leave.{" "}
            <span className="text-clay-plum">Before they do.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
            AttritionIQ predicts employee turnover, explains the why behind every
            score, and hands your people team clear next steps.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="clay-btn clay-btn-primary">
              Try the demo
            </Link>
            <Link href="/login" className="clay-btn">
              I have an account
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="clay-card mx-auto flex w-full max-w-sm flex-col items-center gap-5 p-8"
        >
          <div className="flex w-full items-center justify-between">
            <div>
              <p className="text-sm text-ink-faint">Live prediction</p>
              <p className="font-semibold text-ink">Jordan Rivera · Sales</p>
            </div>
            <span className="clay-chip">CatBoost</span>
          </div>
          <RiskGauge risk={72} size={200} />
          <div className="w-full rounded-2xl bg-sand-200 p-4 text-sm shadow-clay-inset">
            <p className="font-medium text-ink">Top driver</p>
            <p className="text-ink-soft">Low satisfaction &amp; high monthly hours</p>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="mt-16 grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="clay-card p-6 text-center">
            <p className="font-display text-3xl font-semibold text-clay-plum md:text-4xl">
              {s.value}
            </p>
            <p className="mt-1 text-sm text-ink-faint">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="clay-card p-6"
          >
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-clay-plum shadow-clay-plum">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={f.icon} />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-ink">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.body}</p>
          </motion.div>
        ))}
      </section>

      <footer className="mt-16 text-center text-sm text-ink-faint">
        Built with FastAPI · CatBoost · Next.js — an explainable people-analytics demo.
      </footer>
    </main>
  );
}
