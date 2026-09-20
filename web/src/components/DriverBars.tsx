"use client";

import { motion } from "framer-motion";
import type { Driver } from "@/lib/types";

/** Diverging SHAP bars: terracotta = pushes toward leaving, sage = keeps them.
 *  Bars grow from a centre line, magnitude = |SHAP contribution|. */
export default function DriverBars({ drivers }: { drivers: Driver[] }) {
  const max = Math.max(...drivers.map((d) => Math.abs(d.impact)), 0.0001);

  return (
    <div className="space-y-3">
      {drivers.map((d, i) => {
        const pct = (Math.abs(d.impact) / max) * 50; // half-width max
        const up = d.direction === "increases";
        return (
          <div key={d.feature} className="text-sm">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-medium text-ink">{d.label}</span>
              <span className="text-ink-faint">
                {typeof d.value === "number"
                  ? Number.isInteger(d.value)
                    ? d.value
                    : d.value.toFixed(2)
                  : d.value}
              </span>
            </div>
            <div className="relative h-3 rounded-full bg-sand-300 shadow-clay-inset">
              <div className="absolute left-1/2 top-0 h-full w-px bg-ink/15" />
              <motion.div
                className={`absolute top-0 h-full ${
                  up ? "left-1/2 rounded-r-full bg-risk-high" : "right-1/2 rounded-l-full bg-risk-low"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        );
      })}
      <div className="flex justify-between pt-1 text-xs text-ink-faint">
        <span>← keeps them</span>
        <span>pushes to leave →</span>
      </div>
    </div>
  );
}
