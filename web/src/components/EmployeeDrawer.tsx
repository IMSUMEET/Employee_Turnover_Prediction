"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import RiskGauge from "@/components/RiskGauge";
import DriverBars from "@/components/DriverBars";
import Recommendations from "@/components/Recommendations";
import type { Prediction } from "@/lib/types";

export default function EmployeeDrawer({
  prediction,
  onClose,
}: {
  prediction: Prediction | null;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {prediction && (
        <motion.div
          className="fixed inset-0 z-40 flex justify-end bg-ink/25 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.aside
            className="h-full w-full max-w-md overflow-y-auto bg-sand-100 p-6 shadow-clay md:p-8"
            initial={{ x: 40, opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-ink">
                {prediction.name ?? "Employee"}
              </h2>
              <button onClick={onClose} className="clay-btn px-3 py-2 text-sm">
                Close
              </button>
            </div>

            <div className="flex flex-col items-center gap-4">
              <RiskGauge risk={prediction.risk} size={190} />
            </div>

            <h3 className="mb-3 mt-7 font-display text-lg font-semibold text-ink">
              Why this score
            </h3>
            <DriverBars drivers={prediction.drivers} />

            <h3 className="mb-3 mt-7 font-display text-lg font-semibold text-ink">
              Recommended actions
            </h3>
            <Recommendations items={prediction.recommendations} />
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
