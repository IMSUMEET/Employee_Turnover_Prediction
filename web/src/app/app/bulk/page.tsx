"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StatCard from "@/components/StatCard";
import EmployeeDrawer from "@/components/EmployeeDrawer";
import { api } from "@/lib/api";
import { BAND_META } from "@/lib/constants";
import type { BatchResult, Prediction } from "@/lib/types";

type SortKey = "risk" | "name";

export default function BulkPage() {
  const [data, setData] = useState<BatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Prediction | null>(null);
  const [sort, setSort] = useState<SortKey>("risk");
  const [fileName, setFileName] = useState("");

  async function handleFile(file: File) {
    setLoading(true);
    setError("");
    setFileName(file.name);
    try {
      setData(await api.predictBatch(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function useDemo() {
    const res = await fetch("/demo_employees.csv");
    const blob = await res.blob();
    handleFile(new File([blob], "demo_employees.csv", { type: "text/csv" }));
  }

  const rows = useMemo(() => {
    if (!data) return [];
    const copy = [...data.predictions];
    copy.sort((a, b) =>
      sort === "risk" ? b.risk - a.risk : (a.name ?? "").localeCompare(b.name ?? "")
    );
    return copy;
  }, [data, sort]);

  const bandData = data
    ? (["high", "medium", "low"] as const).map((b) => ({
        name: BAND_META[b].label,
        value: data.analytics.bands[b],
        fill: BAND_META[b].hex,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Upload */}
      <section className="clay-card p-6 md:p-8">
        <h1 className="font-display text-2xl font-semibold text-ink">Bulk analysis</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Upload a roster CSV to score everyone at once and spot your flight risks.
        </p>

        <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-clay border-2 border-dashed border-sand-400 bg-sand-200 px-6 py-10 text-center shadow-clay-inset transition hover:border-clay-plum/50">
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-clay-plum shadow-clay-plum">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 16V4M6 10l6-6 6 6M4 20h16" />
            </svg>
          </div>
          <p className="font-semibold text-ink">
            {fileName || "Drop a CSV here or click to browse"}
          </p>
          <p className="mt-1 text-xs text-ink-faint">
            Columns: department, promoted, review, projects, salary, tenure,
            satisfaction, bonus, avg_hrs_month
          </p>
        </label>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={useDemo} className="clay-btn text-sm">
            Use demo roster
          </button>
          <a href="/demo_employees.csv" download className="text-sm font-medium text-clay-plum hover:underline">
            Download template
          </a>
          {loading && <span className="text-sm text-ink-faint">Scoring roster…</span>}
        </div>

        {error && (
          <div className="mt-4 rounded-2xl bg-risk-high/12 px-4 py-3 text-sm font-medium text-risk-high">
            {error}
          </div>
        )}
      </section>

      {data && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Employees scored" value={data.analytics.total} />
            <StatCard
              label="At risk"
              value={data.analytics.at_risk}
              accent="#e07856"
              sub={`${Math.round((data.analytics.at_risk / data.analytics.total) * 100)}% of roster`}
            />
            <StatCard label="Average risk" value={`${data.analytics.avg_risk}%`} accent="#7c6a9c" />
            <StatCard
              label="High-risk"
              value={data.analytics.bands.high}
              accent="#e07856"
            />
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
            <div className="clay-card p-6">
              <h3 className="mb-4 font-display text-lg font-semibold text-ink">
                Risk distribution
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={bandData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {bandData.map((d) => (
                      <Cell key={d.name} fill={d.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: "none",
                      background: "#f6f1ea",
                      boxShadow: "6px 6px 14px rgba(178,162,138,0.45)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex justify-center gap-4 text-sm">
                {bandData.map((d) => (
                  <span key={d.name} className="flex items-center gap-1.5 text-ink-soft">
                    <span className="h-3 w-3 rounded-full" style={{ background: d.fill }} />
                    {d.name} ({d.value})
                  </span>
                ))}
              </div>
            </div>

            <div className="clay-card p-6">
              <h3 className="mb-4 font-display text-lg font-semibold text-ink">
                Average risk by department
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={data.analytics.by_department}
                  layout="vertical"
                  margin={{ left: 8, right: 24 }}
                >
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis
                    type="category"
                    dataKey="department"
                    width={84}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#5b5468", fontSize: 12 }}
                    tickFormatter={(v: string) => v.charAt(0).toUpperCase() + v.slice(1)}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(124,106,156,0.08)" }}
                    contentStyle={{
                      borderRadius: 16,
                      border: "none",
                      background: "#f6f1ea",
                      boxShadow: "6px 6px 14px rgba(178,162,138,0.45)",
                    }}
                  />
                  <Bar dataKey="avg_risk" radius={[0, 10, 10, 0]} barSize={16}>
                    {data.analytics.by_department.map((d) => (
                      <Cell
                        key={d.department}
                        fill={d.avg_risk >= 66 ? "#e07856" : d.avg_risk >= 40 ? "#e0a458" : "#5b8a72"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="clay-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-ink">
                Roster ({rows.length})
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-ink-faint">Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="rounded-xl bg-sand-200 px-3 py-1.5 shadow-clay-inset outline-none"
                >
                  <option value="risk">Risk (high → low)</option>
                  <option value="name">Name (A → Z)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              {rows.map((p, i) => {
                const meta = BAND_META[p.band];
                return (
                  <button
                    key={`${p.name}-${i}`}
                    onClick={() => setSelected(p)}
                    className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-4 rounded-2xl bg-sand-200 px-4 py-3 text-left shadow-clay-sm transition hover:-translate-y-0.5 hover:shadow-clay"
                  >
                    <span className="font-medium text-ink">{p.name}</span>
                    <div className="hidden w-40 sm:block">
                      <div className="h-2.5 rounded-full bg-sand-300 shadow-clay-inset">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${p.risk}%`, background: meta.hex }}
                        />
                      </div>
                    </div>
                    <span className="flex items-center gap-3">
                      <span className="w-12 text-right font-semibold text-ink">
                        {p.risk}%
                      </span>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white"
                        style={{ background: meta.hex }}
                      >
                        {meta.label}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      <EmployeeDrawer prediction={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
