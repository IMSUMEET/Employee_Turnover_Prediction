"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NumberField, SelectField, SliderField, ToggleField } from "@/components/fields";
import RiskGauge from "@/components/RiskGauge";
import DriverBars from "@/components/DriverBars";
import Recommendations from "@/components/Recommendations";
import { api } from "@/lib/api";
import { DEPARTMENTS, FIELD_HINTS, SALARY_LEVELS, SAMPLE_EMPLOYEE } from "@/lib/constants";
import type { EmployeeInput, Prediction } from "@/lib/types";

export default function PredictPage() {
  const [emp, setEmp] = useState<EmployeeInput>(SAMPLE_EMPLOYEE);
  const [result, setResult] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof EmployeeInput>(k: K, v: EmployeeInput[K]) =>
    setEmp((e) => ({ ...e, [k]: v }));

  async function run() {
    setLoading(true);
    setError("");
    try {
      setResult(await api.predict(emp));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
      {/* Form */}
      <section className="clay-card p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">
              Individual assessment
            </h1>
            <p className="text-sm text-ink-soft">
              Adjust the profile and predict attrition risk.
            </p>
          </div>
          <button
            onClick={() => setEmp(SAMPLE_EMPLOYEE)}
            className="clay-btn px-3 py-2 text-xs"
          >
            Reset
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-soft">
              Employee name
            </label>
            <input
              className="clay-input"
              value={emp.name ?? ""}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Department"
              value={emp.department}
              onChange={(v) => set("department", v)}
              options={DEPARTMENTS}
            />
            <SelectField
              label="Salary tier"
              value={emp.salary}
              onChange={(v) => set("salary", v as EmployeeInput["salary"])}
              options={SALARY_LEVELS}
            />
          </div>

          <SliderField
            label="Satisfaction"
            hint={FIELD_HINTS.satisfaction}
            value={emp.satisfaction}
            onChange={(v) => set("satisfaction", v)}
            format={(v) => `${Math.round(v * 100)}%`}
          />
          <SliderField
            label="Last review score"
            hint={FIELD_HINTS.review}
            value={emp.review}
            onChange={(v) => set("review", v)}
            format={(v) => `${Math.round(v * 100)}%`}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField
              label="Projects"
              hint={FIELD_HINTS.projects}
              value={emp.projects}
              onChange={(v) => set("projects", v)}
              min={0}
              max={20}
            />
            <NumberField
              label="Tenure (yrs)"
              hint={FIELD_HINTS.tenure}
              value={emp.tenure}
              onChange={(v) => set("tenure", v)}
              min={0}
              max={40}
            />
            <NumberField
              label="Avg hrs/mo"
              hint={FIELD_HINTS.avg_hrs_month}
              value={emp.avg_hrs_month}
              onChange={(v) => set("avg_hrs_month", v)}
              min={0}
              max={400}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ToggleField
              label="Promoted (last 24m)"
              value={emp.promoted}
              onChange={(v) => set("promoted", v)}
            />
            <ToggleField
              label="Bonus (last 24m)"
              value={emp.bonus}
              onChange={(v) => set("bonus", v)}
            />
          </div>

          {error && (
            <div className="rounded-2xl bg-risk-high/12 px-4 py-3 text-sm font-medium text-risk-high">
              {error}
            </div>
          )}

          <button
            onClick={run}
            disabled={loading}
            className="clay-btn clay-btn-primary w-full text-base"
          >
            {loading ? "Analysing…" : "Predict attrition risk"}
          </button>
        </div>
      </section>

      {/* Result */}
      <section className="clay-card flex flex-col p-6 md:p-8">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col items-center gap-3">
                {result.name && (
                  <p className="text-lg font-semibold text-ink">{result.name}</p>
                )}
                <RiskGauge risk={result.risk} />
                <p className="text-center text-sm text-ink-soft">
                  {result.will_leave
                    ? "This profile is likely to leave — act on the drivers below."
                    : "This profile is likely to stay — keep the momentum."}
                </p>
              </div>

              <div>
                <h3 className="mb-3 font-display text-lg font-semibold text-ink">
                  Why this score
                </h3>
                <DriverBars drivers={result.drivers} />
              </div>

              <div>
                <h3 className="mb-3 font-display text-lg font-semibold text-ink">
                  Recommended actions
                </h3>
                <Recommendations items={result.recommendations} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid flex-1 place-items-center py-16 text-center"
            >
              <div>
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-sand-200 shadow-clay-inset">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c6a9c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 17l5-5 4 3 5-7" />
                  </svg>
                </div>
                <p className="font-medium text-ink">Your prediction appears here</p>
                <p className="mt-1 text-sm text-ink-faint">
                  Fill in the profile and hit predict.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
