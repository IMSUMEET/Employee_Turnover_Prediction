"use client";

import { motion } from "framer-motion";

export default function Recommendations({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((text, i) => (
        <motion.li
          key={text}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + i * 0.08 }}
          className="flex items-start gap-3 rounded-2xl bg-sand-200 p-3.5 shadow-clay-sm"
        >
          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-clay-plum text-xs font-bold text-white">
            {i + 1}
          </span>
          <span className="text-sm leading-relaxed text-ink-soft">{text}</span>
        </motion.li>
      ))}
    </ul>
  );
}
