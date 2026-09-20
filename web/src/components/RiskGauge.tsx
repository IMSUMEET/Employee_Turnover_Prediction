"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { bandFromRisk, BAND_META } from "@/lib/constants";

interface Props {
  risk: number; // 0-100
  size?: number;
}

/** A claymorphic donut gauge: recessed track + colored progress arc, with the
 *  percentage counting up as it fills. */
export default function RiskGauge({ risk, size = 220 }: Props) {
  const band = bandFromRisk(risk);
  const meta = BAND_META[band];
  const stroke = 18;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const progress = useMotionValue(0);
  const dash = useTransform(progress, (p) => `${(p / 100) * c} ${c}`);
  const display = useTransform(progress, (p) => Math.round(p).toString());

  useEffect(() => {
    const controls = animate(progress, risk, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [risk, progress]);

  return (
    <div
      className="relative grid place-items-center rounded-full bg-sand-200 shadow-clay-inset"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#ded2c0"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={meta.hex}
          strokeWidth={stroke}
          strokeLinecap="round"
          style={{ strokeDasharray: dash }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <div className="flex items-start">
          <motion.span
            className="font-display text-5xl font-semibold leading-none text-ink"
          >
            {display}
          </motion.span>
          <span className="mt-1 text-xl font-semibold text-ink-soft">%</span>
        </div>
        <span
          className={`mt-1.5 rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-white ${meta.bg}`}
        >
          {meta.label}
        </span>
      </div>
    </div>
  );
}
